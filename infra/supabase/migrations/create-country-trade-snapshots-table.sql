-- =========================================================
-- souvera_country_trade_snapshots  (Phase 0E.2)
-- Replaces static *-trade.ts modules with DB-backed trade data.
-- Defined in sql-pack-v1.1.sql but never applied as a discrete migration.
--
-- Trade data (exports, imports, top partners) should come from
-- this table, not from static TypeScript literals in src/data/.
-- See docs/platform/foundation-assessment-2026.md §Anti-hardcode migration map
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_country_trade_snapshots (
  id              bigserial PRIMARY KEY,
  country_id      uuid NOT NULL REFERENCES public.souvera_countries(id) ON DELETE CASCADE,
  year            integer NOT NULL CHECK (year >= 2000 AND year <= 2100),

  -- Top exports: [{ hs_code, description, value_usd, share_pct, yoy_pct }]
  top_exports     jsonb,

  -- Top imports: [{ hs_code, description, value_usd, share_pct, yoy_pct }]
  top_imports     jsonb,

  -- Top trade partners: [{ country, iso3, exports_usd, imports_usd, total_usd, share_pct }]
  top_trade_partners jsonb,

  -- Aggregates
  total_trade_usd       numeric,
  exports_usd           numeric,
  imports_usd           numeric,
  exports_to_us_usd     numeric,
  exports_to_us_yoy_pct numeric,
  imports_from_us_usd   numeric,
  imports_from_us_yoy_pct numeric,

  -- Optional prose summary (markdown, hydrated from structured fields above)
  trade_summary_md text,

  -- Provenance
  source_id       uuid REFERENCES public.souvera_data_sources(id),
  source_notes    text,
  generated_at    timestamptz NOT NULL DEFAULT now(),

  UNIQUE (country_id, year)
);

-- Lookup by country
CREATE INDEX IF NOT EXISTS idx_trade_snapshots_country_year
  ON public.souvera_country_trade_snapshots(country_id, year DESC);

-- RLS: public read
ALTER TABLE public.souvera_country_trade_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read trade snapshots" ON public.souvera_country_trade_snapshots
  FOR SELECT USING (true);

CREATE POLICY "Service role full access" ON public.souvera_country_trade_snapshots
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
