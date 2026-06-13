-- =========================================================
-- souvera_narrative_claims  (Phase 0D.3)
-- T3 tier of the Souvera Data Contract (SDC):
-- Verified claims — VC stats, regional shares, one-off estimates
-- Each row: claim_text, source_id, as_of, confidence
--
-- These replace bare editorial numbers in country overview/risk prose.
-- See docs/platform/foundation-assessment-2026.md §SDC §Editorial content policy
-- =========================================================

-- Confidence levels for narrative claims
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_claim_confidence') THEN
    CREATE TYPE souvera_claim_confidence AS ENUM ('high', 'medium', 'low', 'estimate');
  END IF;
END $$;

-- Claim categories (for filtering / auditing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_claim_category') THEN
    CREATE TYPE souvera_claim_category AS ENUM (
      'macro',        -- GDP, growth rate, trade totals
      'trade',        -- Trade flows, partner shares
      'sector',       -- Sector-level figures
      'policy',       -- Policy facts (tariff rates, agreements)
      'market',       -- Market-size estimates
      'infrastructure', -- Physical/digital infrastructure facts
      'demographic',  -- Population, urbanisation
      'investment',   -- FDI, deal flow, VC numbers
      'risk'          -- Risk-level assertions
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.souvera_narrative_claims (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Scope: can be global (country_id = NULL) or country-specific
  country_id      uuid REFERENCES public.souvera_countries(id) ON DELETE CASCADE,

  -- The human-readable claim text exactly as it will appear in prose
  -- e.g. "$62.7B total trade (2024)"
  claim_text      text NOT NULL CHECK (length(claim_text) > 0),

  -- Structured numeric extraction for cross-validation
  numeric_value   numeric,            -- e.g. 62700000000
  numeric_unit    text,               -- e.g. 'USD', '%', 'count'
  numeric_scale   text,               -- e.g. 'absolute', 'pct', 'index'

  -- Provenance
  source_id       uuid REFERENCES public.souvera_data_sources(id),
  source_url      text,               -- Direct URL if no source_id
  as_of           date NOT NULL,      -- Reference period for this claim

  -- Quality
  confidence      souvera_claim_confidence NOT NULL DEFAULT 'high',
  category        souvera_claim_category,

  -- Publication lifecycle
  is_published    boolean NOT NULL DEFAULT false,
  published_at    timestamptz,
  review_notes    text,               -- Internal notes from editorial review

  -- Audit
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Index for lookups by country
CREATE INDEX IF NOT EXISTS idx_narrative_claims_country
  ON public.souvera_narrative_claims(country_id);

-- Index for filtering by category + confidence
CREATE INDEX IF NOT EXISTS idx_narrative_claims_category_confidence
  ON public.souvera_narrative_claims(category, confidence);

-- Only return published claims in public reads
ALTER TABLE public.souvera_narrative_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published claims" ON public.souvera_narrative_claims
  FOR SELECT USING (is_published = true);

CREATE POLICY "Service role full access" ON public.souvera_narrative_claims
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_narrative_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_narrative_claims_updated_at ON public.souvera_narrative_claims;
CREATE TRIGGER trg_narrative_claims_updated_at
  BEFORE UPDATE ON public.souvera_narrative_claims
  FOR EACH ROW EXECUTE FUNCTION update_narrative_claims_updated_at();
