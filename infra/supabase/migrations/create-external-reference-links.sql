-- =========================================================
-- External reference links (USTR country pages, etc.) — UI-only, not PDF
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_external_reference_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_key TEXT REFERENCES public.souvera_entities (entity_key) ON DELETE SET NULL,
  ref_type TEXT NOT NULL,
  url TEXT NOT NULL,
  label TEXT,
  slug TEXT,
  unmatched_name TEXT,
  source_key TEXT NOT NULL,
  evidence_artifact_id UUID REFERENCES public.souvera_evidence_artifacts (id) ON DELETE SET NULL,
  last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ref_type, url)
);

CREATE INDEX IF NOT EXISTS idx_external_ref_entity
  ON public.souvera_external_reference_links (entity_key, ref_type);

CREATE INDEX IF NOT EXISTS idx_external_ref_source
  ON public.souvera_external_reference_links (source_key, last_reviewed_at DESC);

DROP TRIGGER IF EXISTS trg_souvera_external_reference_links_updated_at ON public.souvera_external_reference_links;
CREATE TRIGGER trg_souvera_external_reference_links_updated_at
BEFORE UPDATE ON public.souvera_external_reference_links
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

ALTER TABLE public.souvera_external_reference_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS external_reference_links_read ON public.souvera_external_reference_links;
CREATE POLICY external_reference_links_read ON public.souvera_external_reference_links
  FOR SELECT USING (true);

-- USTR anchor + directory sources
INSERT INTO public.souvera_data_sources
(key, name, domain, provider_url, auth_model, billing_model, refresh_cadence, priority_rank, legal_status, redistribution_notes, is_active)
VALUES
  (
    'ustr_agoa_program',
    'USTR AGOA Program Page',
    'trade_policy',
    'https://ustr.gov',
    'public',
    'free',
    'monthly',
    4,
    'review_required',
    'Allowed as links + derived status; do not republish full page content',
    true
  ),
  (
    'ustr_cbi_program',
    'USTR CBI Program Page',
    'trade_policy',
    'https://ustr.gov',
    'public',
    'free',
    'monthly',
    5,
    'review_required',
    'Allowed as links + derived status; do not republish full page content',
    true
  ),
  (
    'ustr_africa_directory',
    'USTR Africa Countries Directory',
    'trade_policy',
    'https://ustr.gov',
    'public',
    'free',
    'monthly',
    6,
    'review_required',
    'Allowed as links; directory for slug reconciliation only',
    true
  )
ON CONFLICT (key) DO UPDATE
SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  provider_url = EXCLUDED.provider_url,
  refresh_cadence = EXCLUDED.refresh_cadence,
  redistribution_notes = EXCLUDED.redistribution_notes,
  is_active = true;
