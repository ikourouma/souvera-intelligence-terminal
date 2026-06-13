-- =========================================================
-- Evidence Vault + evidence-backed policy status
-- Platform-wide data credibility framework
-- =========================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_artifact_type') THEN
    CREATE TYPE souvera_artifact_type AS ENUM ('pdf', 'html', 'json', 'csv');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_artifact_status') THEN
    CREATE TYPE souvera_artifact_status AS ENUM ('ok', 'parse_failed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_policy_framework') THEN
    CREATE TYPE souvera_policy_framework AS ENUM (
      'AGOA', 'CBI', 'AfCFTA', 'ECOWAS', 'CARICOM'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_policy_publish_status') THEN
    CREATE TYPE souvera_policy_publish_status AS ENUM (
      'eligible',
      'suspended',
      'graduated',
      'ineligible',
      'not_applicable',
      'member',
      'active',
      'under_review'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_evidence_confidence') THEN
    CREATE TYPE souvera_evidence_confidence AS ENUM ('high', 'med', 'low');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.souvera_evidence_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key TEXT NOT NULL,
  artifact_type souvera_artifact_type NOT NULL,
  url TEXT NOT NULL,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checksum_sha256 TEXT,
  effective_date DATE,
  notes TEXT,
  status souvera_artifact_status NOT NULL DEFAULT 'ok',
  content_preview TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_key, url, checksum_sha256)
);

CREATE INDEX IF NOT EXISTS idx_evidence_artifacts_source
  ON public.souvera_evidence_artifacts (source_key, retrieved_at DESC);

-- Table name avoids conflict with existing enum type souvera_policy_status (Phase 4B publication lifecycle).
CREATE TABLE IF NOT EXISTS public.souvera_country_policy_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_iso3 TEXT NOT NULL,
  framework souvera_policy_framework NOT NULL,
  status souvera_policy_publish_status NOT NULL,
  status_effective_date DATE,
  last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_key TEXT NOT NULL,
  evidence_artifact_id UUID REFERENCES public.souvera_evidence_artifacts (id) ON DELETE SET NULL,
  confidence souvera_evidence_confidence NOT NULL DEFAULT 'med',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (country_iso3, framework)
);

CREATE INDEX IF NOT EXISTS idx_country_policy_status_country
  ON public.souvera_country_policy_status (country_iso3, framework);

DROP TRIGGER IF EXISTS trg_souvera_country_policy_status_updated_at ON public.souvera_country_policy_status;
CREATE TRIGGER trg_souvera_country_policy_status_updated_at
BEFORE UPDATE ON public.souvera_country_policy_status
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

ALTER TABLE public.souvera_evidence_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_country_policy_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS evidence_artifacts_read ON public.souvera_evidence_artifacts;
CREATE POLICY evidence_artifacts_read ON public.souvera_evidence_artifacts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS country_policy_status_read ON public.souvera_country_policy_status;
CREATE POLICY country_policy_status_read ON public.souvera_country_policy_status
  FOR SELECT USING (true);

-- Verification / policy sources
INSERT INTO public.souvera_data_sources
(key, name, domain, provider_url, auth_model, billing_model, refresh_cadence, priority_rank, legal_status, is_active)
VALUES
  ('ustr', 'USTR Trade Preference Programs', 'trade_policy', 'https://ustr.gov', 'public', 'free', 'annual', 5, 'review_required', true),
  ('ustr_cbi', 'U.S. Trade.gov CBI', 'trade_policy', 'https://www.trade.gov', 'public', 'free', 'annual', 6, 'review_required', true),
  ('au_afcfta', 'African Union AfCFTA', 'trade_policy', 'https://au.int', 'public', 'free', 'annual', 7, 'review_required', true),
  ('ecowas', 'ECOWAS', 'trade_policy', 'https://www.ecowas.int', 'public', 'free', 'annual', 8, 'review_required', true),
  ('caricom', 'CARICOM', 'trade_policy', 'https://caricom.org', 'public', 'free', 'annual', 9, 'review_required', true),
  ('world_bank_wgi', 'World Bank Worldwide Governance Indicators', 'governance', 'https://www.worldbank.org', 'public', 'free', 'annual', 11, 'review_required', true)
ON CONFLICT (key) DO UPDATE
SET name = EXCLUDED.name, domain = EXCLUDED.domain, provider_url = EXCLUDED.provider_url, is_active = EXCLUDED.is_active;

-- IMF sources required by indicator FK (may be missing if seed-source-registry-expanded.sql was not run)
INSERT INTO public.souvera_data_sources
(key, name, domain, provider_url, api_base_url, api_docs_url, auth_model, billing_model, refresh_cadence, priority_rank, fallback_source_keys, legal_status, redistribution_notes, is_active)
VALUES
  (
    'imf_dataservices',
    'IMF Data Services (SDMX JSON)',
    'external_fiscal_monetary',
    'https://www.imf.org',
    'https://dataservices.imf.org/REST/SDMX_JSON.svc/',
    'https://datahelp.imf.org/knowledgebase/articles/630877-data-services',
    'public',
    'free',
    'monthly',
    12,
    ARRAY['world_bank']::TEXT[],
    'review_required',
    'Attribution required; confirm per dataset',
    true
  ),
  (
    'imf_areaer',
    'IMF AREAER (FX regime)',
    'fx_regime',
    'https://www.imf.org',
    NULL,
    'https://www.imf.org/en/Publications/Annual-Report-on-Exchange-Arrangements-and-Exchange-Restrictions',
    'public',
    'free',
    'annual',
    23,
    ARRAY[]::TEXT[],
    'review_required',
    'Document-based; no standard API',
    true
  )
ON CONFLICT (key) DO UPDATE
SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  provider_url = EXCLUDED.provider_url,
  api_base_url = EXCLUDED.api_base_url,
  api_docs_url = EXCLUDED.api_docs_url,
  is_active = true;

INSERT INTO public.souvera_indicators
(key, label, domain, unit, description, preferred_source_key, refresh_policy, is_forecast, min_plan_id)
VALUES
  ('fiscal_balance_pct_gdp', 'General government net lending/borrowing (% of GDP)', 'fiscal', 'percent', 'IMF WEO fiscal balance', 'imf_dataservices', 'monthly', false, 'professional'),
  ('wgi_governance_estimate', 'WGI governance estimate (avg of six dimensions)', 'governance', 'index', 'World Bank WGI composite -2.5 to +2.5', 'world_bank_wgi', 'annual', false, 'professional'),
  ('fx_regime_category', 'Exchange rate regime (IMF AREAER)', 'fx_regime', 'text', 'IMF AREAER regime classification', 'imf_areaer', 'annual', false, 'professional')
ON CONFLICT (key) DO UPDATE
SET label = EXCLUDED.label, domain = EXCLUDED.domain, preferred_source_key = EXCLUDED.preferred_source_key;
