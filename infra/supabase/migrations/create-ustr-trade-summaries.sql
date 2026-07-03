-- =========================================================
-- USTR per-country trade summaries (tertiary corroboration)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_ustr_trade_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iso3 TEXT NOT NULL,
  source_url TEXT NOT NULL,
  agoa_status_text TEXT,
  trade_agreement_text TEXT,
  metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_artifact_id UUID REFERENCES public.souvera_evidence_artifacts (id) ON DELETE SET NULL,
  last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (iso3)
);

CREATE INDEX IF NOT EXISTS idx_ustr_trade_summaries_iso3
  ON public.souvera_ustr_trade_summaries (iso3);

DROP TRIGGER IF EXISTS trg_souvera_ustr_trade_summaries_updated_at ON public.souvera_ustr_trade_summaries;
CREATE TRIGGER trg_souvera_ustr_trade_summaries_updated_at
BEFORE UPDATE ON public.souvera_ustr_trade_summaries
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

ALTER TABLE public.souvera_ustr_trade_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ustr_trade_summaries_read ON public.souvera_ustr_trade_summaries;
CREATE POLICY ustr_trade_summaries_read ON public.souvera_ustr_trade_summaries
  FOR SELECT USING (true);

INSERT INTO public.souvera_data_sources
(key, name, domain, provider_url, auth_model, billing_model, refresh_cadence, priority_rank, legal_status, redistribution_notes, is_active)
VALUES
  (
    'ustr_country_trade_summary',
    'USTR Country Trade Summary Pages',
    'trade_policy',
    'https://ustr.gov/countries-regions/africa',
    'public',
    'free',
    'quarterly',
    7,
    'review_required',
    'Tertiary corroboration only; cite USTR; do not replace Census/USITC primary figures',
    true
  )
ON CONFLICT (key) DO UPDATE
SET
  name = EXCLUDED.name,
  redistribution_notes = EXCLUDED.redistribution_notes,
  is_active = true;
