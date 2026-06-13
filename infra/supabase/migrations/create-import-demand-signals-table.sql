-- Phase 0.5A: Import Demand Signals table
-- Stores African/Caribbean import demand by country × product category
-- Sources: ITC Trade Data Monitor (itc_trade_data_monitor), UN Comtrade, BEA, USTR
-- Purpose: Quantify African demand for US-exportable goods → AGOA reauthorization argument

CREATE TABLE IF NOT EXISTS souvera_import_demand_signals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id       uuid NOT NULL REFERENCES souvera_countries(id) ON DELETE CASCADE,
  year             int  NOT NULL CHECK (year BETWEEN 2000 AND 2035),

  -- Product classification
  hs_chapter       text NOT NULL,   -- e.g. '84', '52', '10', '31'
  category_label   text NOT NULL,   -- e.g. 'Agricultural Machinery & Equipment'
  category_group   text NOT NULL,   -- one of: machinery | cotton | grains | intermediate | fertilizers | textiles_inputs | pharma | transport

  -- Import volumes
  total_imports_usd          bigint,   -- total country imports in this HS chapter from all origins
  imports_from_us_usd        bigint,   -- subset sourced from United States
  imports_from_us_vol_mt     numeric(18,2),  -- volume in metric tonnes (where applicable)
  imports_from_us_share_pct  numeric(5,2),   -- US share of total imports (%)

  -- US export opportunity
  us_export_potential_usd    bigint,   -- estimated gap if US reached benchmark share
  us_benchmark_share_pct     numeric(5,2),  -- benchmark share used for gap calculation

  -- Top global suppliers (JSON array: [{country, iso3, share_pct, value_usd}])
  top_suppliers   jsonb DEFAULT '[]'::jsonb,

  -- Year-on-year trend
  yoy_growth_pct  numeric(5,2),  -- YoY growth in total imports

  -- Provenance
  source_id        uuid REFERENCES souvera_data_sources(id),
  source_notes     text,
  generated_at     timestamptz NOT NULL DEFAULT now(),

  UNIQUE (country_id, year, hs_chapter)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_import_demand_country  ON souvera_import_demand_signals (country_id, year);
CREATE INDEX IF NOT EXISTS idx_import_demand_chapter  ON souvera_import_demand_signals (hs_chapter, year);
CREATE INDEX IF NOT EXISTS idx_import_demand_group    ON souvera_import_demand_signals (category_group, year);

-- Row Level Security
ALTER TABLE souvera_import_demand_signals ENABLE ROW LEVEL SECURITY;

-- Public read for intelligence hub
CREATE POLICY "Public read import demand signals"
  ON souvera_import_demand_signals
  FOR SELECT
  TO public
  USING (true);

-- Service role full access (ingestion)
CREATE POLICY "Service role full access import demand"
  ON souvera_import_demand_signals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE souvera_import_demand_signals IS
  'African/Caribbean import demand by country × HS chapter. '
  'Powers the AGOA Reauthorization Intelligence Pack (Phase 0.5) — '
  'quantifies African demand for US-exportable goods to support '
  'US Chamber / Dept of State AGOA reauthorization briefings.';
