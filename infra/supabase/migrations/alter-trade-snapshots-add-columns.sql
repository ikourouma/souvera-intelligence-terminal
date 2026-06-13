-- =========================================================
-- ALTER souvera_country_trade_snapshots — add bilateral trade columns
-- Extends the original sql-pack-v1.1 schema with US-bilateral fields
-- needed by the static-trade-migration ingestion job (Phase 0E.2).
-- =========================================================

ALTER TABLE public.souvera_country_trade_snapshots
  ADD COLUMN IF NOT EXISTS total_trade_usd          numeric,
  ADD COLUMN IF NOT EXISTS exports_usd              numeric,
  ADD COLUMN IF NOT EXISTS imports_usd              numeric,
  ADD COLUMN IF NOT EXISTS exports_to_us_usd        numeric,
  ADD COLUMN IF NOT EXISTS exports_to_us_yoy_pct    numeric,
  ADD COLUMN IF NOT EXISTS imports_from_us_usd      numeric,
  ADD COLUMN IF NOT EXISTS imports_from_us_yoy_pct  numeric,
  ADD COLUMN IF NOT EXISTS source_notes             text;
