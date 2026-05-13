-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL PACK v1.14 — PHASE 4B FOUNDATION
-- Owner: Afronovation, Inc.
-- Platform: Supabase Postgres
-- Date: 2026-05-06
-- =========================================================

-- =========================================================
-- 1. NEW ENUMS FOR PHASE 4B
-- =========================================================

DO $$
BEGIN
  -- Source confidence level
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_confidence_level') THEN
    CREATE TYPE souvera_confidence_level AS ENUM (
      'high',
      'medium',
      'low',
      'curated'
    );
  END IF;

  -- Data freshness status
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_freshness_status') THEN
    CREATE TYPE souvera_freshness_status AS ENUM (
      'fresh',
      'recent',
      'stale',
      'expired'
    );
  END IF;

  -- Ingestion run type
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_ingestion_type') THEN
    CREATE TYPE souvera_ingestion_type AS ENUM (
      'scheduled',
      'manual',
      'upload'
    );
  END IF;

  -- Source type
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_source_type') THEN
    CREATE TYPE souvera_source_type AS ENUM (
      'api',
      'file',
      'manual'
    );
  END IF;

  -- AGOA eligibility status
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_agoa_status') THEN
    CREATE TYPE souvera_agoa_status AS ENUM (
      'eligible',
      'suspended',
      'graduated',
      'ineligible',
      'not_applicable'
    );
  END IF;

  -- AfCFTA implementation status
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_afcfta_status') THEN
    CREATE TYPE souvera_afcfta_status AS ENUM (
      'signed',
      'ratified',
      'deposited',
      'trading',
      'not_signed'
    );
  END IF;

  -- Quality finding severity
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_finding_severity') THEN
    CREATE TYPE souvera_finding_severity AS ENUM (
      'error',
      'warning',
      'info'
    );
  END IF;
END $$;

-- =========================================================
-- 2. EXTEND EXISTING TABLES
-- =========================================================

-- Add columns to souvera_data_sources if not exists
DO $$
BEGIN
  -- confidence_level
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_data_sources' AND column_name = 'confidence_level'
  ) THEN
    ALTER TABLE public.souvera_data_sources 
    ADD COLUMN confidence_level souvera_confidence_level NOT NULL DEFAULT 'medium';
  END IF;

  -- source_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_data_sources' AND column_name = 'source_type'
  ) THEN
    ALTER TABLE public.souvera_data_sources 
    ADD COLUMN source_type souvera_source_type NOT NULL DEFAULT 'api';
  END IF;

  -- attribution_template
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_data_sources' AND column_name = 'attribution_template'
  ) THEN
    ALTER TABLE public.souvera_data_sources 
    ADD COLUMN attribution_template TEXT;
  END IF;

  -- requires_credential
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_data_sources' AND column_name = 'requires_credential'
  ) THEN
    ALTER TABLE public.souvera_data_sources 
    ADD COLUMN requires_credential BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- Add columns to souvera_indicators if not exists
DO $$
BEGIN
  -- freshness_threshold_days
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_indicators' AND column_name = 'freshness_threshold_days'
  ) THEN
    ALTER TABLE public.souvera_indicators 
    ADD COLUMN freshness_threshold_days INTEGER NOT NULL DEFAULT 30;
  END IF;

  -- visibility_label
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_indicators' AND column_name = 'visibility_label'
  ) THEN
    ALTER TABLE public.souvera_indicators 
    ADD COLUMN visibility_label TEXT NOT NULL DEFAULT 'curated_preview';
  END IF;

  -- data_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_indicators' AND column_name = 'data_type'
  ) THEN
    ALTER TABLE public.souvera_indicators 
    ADD COLUMN data_type TEXT NOT NULL DEFAULT 'numeric';
  END IF;
END $$;

-- =========================================================
-- 3. SOURCE CREDENTIALS (Encrypted storage)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_source_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.souvera_data_sources(id) ON DELETE CASCADE,
  credential_type TEXT NOT NULL,        -- api_key, oauth_token, basic_auth
  credential_key TEXT NOT NULL,         -- Key name (e.g., "API_KEY", "CLIENT_ID")
  credential_value_encrypted TEXT,      -- Encrypted value (use Supabase vault in practice)
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.souvera_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_id, credential_key)
);

DROP TRIGGER IF EXISTS trg_souvera_source_credentials_updated_at ON public.souvera_source_credentials;
CREATE TRIGGER trg_souvera_source_credentials_updated_at
BEFORE UPDATE ON public.souvera_source_credentials
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

-- =========================================================
-- 4. SOURCE UPDATE POLICIES
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_source_update_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.souvera_data_sources(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  schedule_cron TEXT,                   -- Cron expression (e.g., "0 0 * * 0" for weekly)
  schedule_preset TEXT,                 -- human readable (daily, weekly, monthly)
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_id, policy_name)
);

DROP TRIGGER IF EXISTS trg_souvera_source_update_policies_updated_at ON public.souvera_source_update_policies;
CREATE TRIGGER trg_souvera_source_update_policies_updated_at
BEFORE UPDATE ON public.souvera_source_update_policies
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

-- =========================================================
-- 5. INDICATOR SOURCE LINKS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_indicator_source_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id UUID NOT NULL REFERENCES public.souvera_indicators(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES public.souvera_data_sources(id) ON DELETE CASCADE,
  priority_rank INTEGER NOT NULL DEFAULT 1,     -- 1 = primary, 2+ = fallback
  endpoint_path TEXT,                           -- API endpoint or file path pattern
  query_params_template JSONB,                  -- Template for API query params
  field_mapping JSONB,                          -- Map source fields to indicator fields
  transform_function TEXT,                      -- Optional transformation (e.g., "multiply_1000")
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (indicator_id, source_id)
);

-- =========================================================
-- 6. DATA INGESTION RUNS (Ledger)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_data_ingestion_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.souvera_data_sources(id),
  
  -- Run metadata
  run_type souvera_ingestion_type NOT NULL,
  triggered_by UUID REFERENCES public.souvera_profiles(id),  -- NULL for scheduled
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Status
  status souvera_job_status NOT NULL DEFAULT 'queued',
  
  -- Metrics
  rows_fetched INTEGER NOT NULL DEFAULT 0,
  rows_valid INTEGER NOT NULL DEFAULT 0,
  rows_invalid INTEGER NOT NULL DEFAULT 0,
  rows_inserted INTEGER NOT NULL DEFAULT 0,
  rows_updated INTEGER NOT NULL DEFAULT 0,
  rows_rejected INTEGER NOT NULL DEFAULT 0,
  
  -- Errors
  error_message TEXT,
  error_details JSONB,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_souvera_ingestion_runs_source 
ON public.souvera_data_ingestion_runs(source_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_souvera_ingestion_runs_status 
ON public.souvera_data_ingestion_runs(status, started_at DESC);

-- =========================================================
-- 7. DATA QUALITY FINDINGS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_data_quality_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingestion_run_id UUID REFERENCES public.souvera_data_ingestion_runs(id) ON DELETE CASCADE,
  
  -- Finding details
  severity souvera_finding_severity NOT NULL,
  code TEXT NOT NULL,                           -- e.g., "INVALID_ISO3", "EXCLUDED_MARKET"
  message TEXT NOT NULL,
  
  -- Context
  row_number INTEGER,
  field_name TEXT,
  field_value TEXT,
  country_iso3 TEXT,
  
  -- Resolution
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by UUID REFERENCES public.souvera_profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_souvera_quality_findings_run 
ON public.souvera_data_quality_findings(ingestion_run_id, severity);

CREATE INDEX IF NOT EXISTS idx_souvera_quality_findings_unresolved 
ON public.souvera_data_quality_findings(is_resolved, severity) 
WHERE is_resolved = FALSE;

-- =========================================================
-- 8. COUNTRY CODE CROSSWALKS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_country_code_crosswalks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Souvera canonical
  country_id UUID NOT NULL REFERENCES public.souvera_countries(id) ON DELETE CASCADE,
  iso3 TEXT NOT NULL,
  
  -- External code systems
  census_code TEXT,                             -- U.S. Census country code
  comtrade_code TEXT,                           -- UN Comtrade M49 code
  wdi_code TEXT,                                -- World Bank WDI code
  imf_code TEXT,                                -- IMF country code
  
  -- Name variations
  name_variations TEXT[] NOT NULL DEFAULT '{}',
  
  -- Validation
  is_souvera_market BOOLEAN NOT NULL DEFAULT TRUE,
  is_excluded BOOLEAN NOT NULL DEFAULT FALSE,
  exclusion_reason TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (iso3)
);

DROP TRIGGER IF EXISTS trg_souvera_country_code_crosswalks_updated_at ON public.souvera_country_code_crosswalks;
CREATE TRIGGER trg_souvera_country_code_crosswalks_updated_at
BEFORE UPDATE ON public.souvera_country_code_crosswalks
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_souvera_crosswalks_census 
ON public.souvera_country_code_crosswalks(census_code) WHERE census_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_souvera_crosswalks_comtrade 
ON public.souvera_country_code_crosswalks(comtrade_code) WHERE comtrade_code IS NOT NULL;

-- =========================================================
-- 9. MANUAL UPLOAD BATCHES
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_manual_upload_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- File metadata
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,                      -- csv, xlsx, json
  file_size_bytes INTEGER,
  
  -- Upload context
  upload_type TEXT NOT NULL,                    -- agoa_status, afcfta_status, indicator_data
  source_id UUID REFERENCES public.souvera_data_sources(id),
  uploaded_by UUID NOT NULL REFERENCES public.souvera_profiles(id),
  
  -- Data metadata
  source_url TEXT,
  as_of_date DATE NOT NULL,
  last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Processing
  ingestion_run_id UUID REFERENCES public.souvera_data_ingestion_runs(id),
  
  -- Status
  status souvera_job_status NOT NULL DEFAULT 'queued',
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 10. MANUAL UPLOAD ROWS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_manual_upload_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.souvera_manual_upload_batches(id) ON DELETE CASCADE,
  
  -- Row data
  row_number INTEGER NOT NULL,
  raw_data JSONB NOT NULL,
  
  -- Validation
  is_valid BOOLEAN NOT NULL DEFAULT FALSE,
  validation_errors JSONB,                      -- Array of error objects
  
  -- Mapping
  country_id UUID REFERENCES public.souvera_countries(id),
  mapped_iso3 TEXT,
  
  -- Processing
  is_processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_souvera_upload_rows_batch 
ON public.souvera_manual_upload_rows(batch_id, row_number);

-- =========================================================
-- 11. TRADE POLICY STATUSES
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_trade_policy_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES public.souvera_countries(id) ON DELETE CASCADE,
  
  -- AGOA Status
  agoa_status souvera_agoa_status,
  agoa_eligible_since DATE,
  agoa_apparel_eligible BOOLEAN,
  agoa_suspension_date DATE,
  agoa_suspension_reason TEXT,
  agoa_notes TEXT,
  
  -- AfCFTA Status
  afcfta_status souvera_afcfta_status,
  afcfta_signed_date DATE,
  afcfta_ratified_date DATE,
  afcfta_deposited_date DATE,
  afcfta_trading_since DATE,
  afcfta_tariff_offers_submitted BOOLEAN,
  afcfta_services_offers_submitted BOOLEAN,
  afcfta_notes TEXT,
  
  -- Source attribution
  agoa_source_id UUID REFERENCES public.souvera_data_sources(id),
  agoa_source_url TEXT,
  agoa_as_of_date DATE,
  agoa_last_reviewed_at TIMESTAMPTZ,
  
  afcfta_source_id UUID REFERENCES public.souvera_data_sources(id),
  afcfta_source_url TEXT,
  afcfta_as_of_date DATE,
  afcfta_last_reviewed_at TIMESTAMPTZ,
  
  -- Audit
  updated_by UUID REFERENCES public.souvera_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (country_id)
);

DROP TRIGGER IF EXISTS trg_souvera_trade_policy_statuses_updated_at ON public.souvera_trade_policy_statuses;
CREATE TRIGGER trg_souvera_trade_policy_statuses_updated_at
BEFORE UPDATE ON public.souvera_trade_policy_statuses
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

-- =========================================================
-- 12. SECTOR SUPPLY-DEMAND SIGNALS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_sector_supply_demand (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES public.souvera_countries(id) ON DELETE CASCADE,
  sector_key TEXT NOT NULL,
  
  -- Supply signals (African production/export capacity)
  supply_score INTEGER CHECK (supply_score BETWEEN 0 AND 100),
  supply_confidence souvera_confidence_level,
  supply_source_id UUID REFERENCES public.souvera_data_sources(id),
  supply_notes TEXT,
  
  -- Demand signals (U.S./global import demand)
  demand_score INTEGER CHECK (demand_score BETWEEN 0 AND 100),
  demand_confidence souvera_confidence_level,
  demand_source_id UUID REFERENCES public.souvera_data_sources(id),
  demand_notes TEXT,
  
  -- Opportunity signal (derived)
  opportunity_score INTEGER CHECK (opportunity_score BETWEEN 0 AND 100),
  opportunity_rationale TEXT,
  
  -- Attribution
  as_of_date DATE,
  last_reviewed_at TIMESTAMPTZ,
  
  -- Entitlement
  min_plan_id TEXT REFERENCES public.souvera_plans(id),
  
  -- Audit
  updated_by UUID REFERENCES public.souvera_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (country_id, sector_key)
);

DROP TRIGGER IF EXISTS trg_souvera_sector_supply_demand_updated_at ON public.souvera_sector_supply_demand;
CREATE TRIGGER trg_souvera_sector_supply_demand_updated_at
BEFORE UPDATE ON public.souvera_sector_supply_demand
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_souvera_supply_demand_country 
ON public.souvera_sector_supply_demand(country_id);

CREATE INDEX IF NOT EXISTS idx_souvera_supply_demand_sector 
ON public.souvera_sector_supply_demand(sector_key);

-- =========================================================
-- 13. HELPER FUNCTIONS
-- =========================================================

-- Function to calculate freshness status
CREATE OR REPLACE FUNCTION public.souvera_get_freshness_status(
  last_reviewed TIMESTAMPTZ,
  threshold_days INTEGER DEFAULT 30
)
RETURNS souvera_freshness_status
LANGUAGE plpgsql
AS $$
BEGIN
  IF last_reviewed IS NULL THEN
    RETURN 'expired';
  ELSIF last_reviewed >= NOW() - INTERVAL '7 days' THEN
    RETURN 'fresh';
  ELSIF last_reviewed >= NOW() - (threshold_days || ' days')::INTERVAL THEN
    RETURN 'recent';
  ELSIF last_reviewed >= NOW() - INTERVAL '90 days' THEN
    RETURN 'stale';
  ELSE
    RETURN 'expired';
  END IF;
END;
$$;

-- Function to validate ISO3 against Souvera market scope
CREATE OR REPLACE FUNCTION public.souvera_validate_market_scope(
  input_iso3 TEXT
)
RETURNS TABLE (
  is_valid BOOLEAN,
  country_id UUID,
  error_code TEXT,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_country_id UUID;
  v_is_excluded BOOLEAN;
BEGIN
  -- Check for ESH (excluded)
  IF UPPER(input_iso3) = 'ESH' THEN
    RETURN QUERY SELECT 
      FALSE, 
      NULL::UUID, 
      'EXCLUDED_MARKET'::TEXT, 
      'ESH (Western Sahara) is excluded from Souvera public scope'::TEXT;
    RETURN;
  END IF;

  -- Look up country
  SELECT c.id INTO v_country_id
  FROM public.souvera_countries c
  WHERE UPPER(c.iso3) = UPPER(input_iso3)
    AND c.is_active = TRUE;

  IF v_country_id IS NULL THEN
    RETURN QUERY SELECT 
      FALSE, 
      NULL::UUID, 
      'INVALID_ISO3'::TEXT, 
      ('ISO3 code not found in Souvera 74-market scope: ' || input_iso3)::TEXT;
    RETURN;
  END IF;

  -- Check crosswalk for exclusion
  SELECT cw.is_excluded INTO v_is_excluded
  FROM public.souvera_country_code_crosswalks cw
  WHERE cw.country_id = v_country_id;

  IF v_is_excluded = TRUE THEN
    RETURN QUERY SELECT 
      FALSE, 
      v_country_id, 
      'EXCLUDED_MARKET'::TEXT, 
      ('Market is excluded from public scope: ' || input_iso3)::TEXT;
    RETURN;
  END IF;

  -- Valid
  RETURN QUERY SELECT 
    TRUE, 
    v_country_id, 
    NULL::TEXT, 
    NULL::TEXT;
END;
$$;

-- =========================================================
-- 14. SEED P0 DATA SOURCES
-- =========================================================

INSERT INTO public.souvera_data_sources (key, name, domain, provider_url, source_type, confidence_level, attribution_template, source_status, is_active)
VALUES
  ('world_bank_wdi', 'World Bank', 'macro', 'https://data.worldbank.org/', 'api', 'high', 'Source: World Bank Open Data', 'approved', TRUE),
  ('us_census_trade', 'U.S. Census Bureau', 'trade', 'https://www.census.gov/foreign-trade/', 'api', 'high', 'Source: U.S. Census Bureau', 'approved', TRUE),
  ('un_comtrade', 'UN Comtrade', 'trade', 'https://comtradeplus.un.org/', 'api', 'high', 'Source: UN Comtrade Database', 'approved', TRUE),
  ('ustr_agoa', 'USTR AGOA', 'policy', 'https://ustr.gov/', 'manual', 'high', 'Source: Office of the U.S. Trade Representative', 'approved', TRUE),
  ('afcfta_secretariat', 'AfCFTA Secretariat', 'policy', 'https://au-afcfta.org/', 'manual', 'high', 'Source: AfCFTA Secretariat', 'approved', TRUE),
  ('tralac_afcfta', 'tralac', 'policy', 'https://www.tralac.org/', 'manual', 'medium', 'Source: Trade Law Centre (tralac)', 'approved', TRUE),
  ('usitc_hts', 'USITC HTS', 'reference', 'https://hts.usitc.gov/', 'file', 'high', 'Source: U.S. International Trade Commission', 'approved', TRUE),
  ('regulations_gov', 'Regulations.gov', 'policy', 'https://www.regulations.gov/', 'api', 'high', 'Source: Regulations.gov', 'approved', TRUE)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  source_type = EXCLUDED.source_type,
  confidence_level = EXCLUDED.confidence_level,
  attribution_template = EXCLUDED.attribution_template,
  updated_at = NOW();

-- =========================================================
-- 15. RLS POLICIES FOR PHASE 4B TABLES
-- =========================================================

-- Enable RLS on new tables
ALTER TABLE public.souvera_source_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_source_update_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_indicator_source_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_data_ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_data_quality_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_country_code_crosswalks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_manual_upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_manual_upload_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_trade_policy_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_sector_supply_demand ENABLE ROW LEVEL SECURITY;

-- Public read access for trade policy statuses (subject to entitlement in app)
CREATE POLICY "Trade policy statuses are viewable by authenticated users"
ON public.souvera_trade_policy_statuses
FOR SELECT
TO authenticated
USING (TRUE);

-- Public read access for supply-demand signals (subject to entitlement in app)
CREATE POLICY "Supply-demand signals are viewable by authenticated users"
ON public.souvera_sector_supply_demand
FOR SELECT
TO authenticated
USING (TRUE);

-- Public read access for crosswalks
CREATE POLICY "Country crosswalks are viewable by all"
ON public.souvera_country_code_crosswalks
FOR SELECT
TO authenticated
USING (TRUE);

-- Admin-only for sensitive tables (credentials, ingestion, quality)
-- These will be managed via service role in admin API

-- =========================================================
-- 16. VERIFICATION QUERIES
-- =========================================================

-- Verify Phase 4B tables created
SELECT 'Phase 4B Tables Verification' AS check_name;

SELECT 
  tablename,
  CASE WHEN tablename IS NOT NULL THEN '✓ Created' ELSE '✗ Missing' END AS status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'souvera_source_credentials',
    'souvera_source_update_policies',
    'souvera_indicator_source_links',
    'souvera_data_ingestion_runs',
    'souvera_data_quality_findings',
    'souvera_country_code_crosswalks',
    'souvera_manual_upload_batches',
    'souvera_manual_upload_rows',
    'souvera_trade_policy_statuses',
    'souvera_sector_supply_demand'
  )
ORDER BY tablename;

-- Verify enums created
SELECT 'Phase 4B Enums Verification' AS check_name;

SELECT 
  typname,
  CASE WHEN typname IS NOT NULL THEN '✓ Created' ELSE '✗ Missing' END AS status
FROM pg_type 
WHERE typname IN (
  'souvera_confidence_level',
  'souvera_freshness_status',
  'souvera_ingestion_type',
  'souvera_source_type',
  'souvera_agoa_status',
  'souvera_afcfta_status',
  'souvera_finding_severity'
)
ORDER BY typname;

-- Verify data sources seeded
SELECT 'P0 Data Sources Verification' AS check_name;

SELECT key, name, source_type, confidence_level, source_status
FROM public.souvera_data_sources
WHERE key IN (
  'world_bank_wdi',
  'us_census_trade', 
  'un_comtrade',
  'ustr_agoa',
  'afcfta_secretariat',
  'tralac_afcfta',
  'usitc_hts',
  'regulations_gov'
)
ORDER BY key;

-- =========================================================
-- END OF SQL PACK v1.14
-- =========================================================
