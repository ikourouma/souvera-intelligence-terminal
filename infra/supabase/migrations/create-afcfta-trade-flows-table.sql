-- =====================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- AfCFTA Trade Flows Table
-- Owner: Afronovation, Inc.
-- Phase 0.5D: AfCFTA Import-Export Intelligence
-- =====================================================

-- Create AfCFTA trade flows table
CREATE TABLE IF NOT EXISTS souvera_afcfta_trade_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core trade relationship
  country_id UUID REFERENCES souvera_countries(id),
  iso3 VARCHAR(3) NOT NULL,
  country_name VARCHAR(100),
  region VARCHAR(50),
  sub_region VARCHAR(50),
  
  -- Trade direction
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('imports', 'exports')),
  
  -- Time dimension
  year INTEGER NOT NULL,
  
  -- Product classification
  hs_chapter VARCHAR(4) NOT NULL,
  category_group VARCHAR(50) NOT NULL,
  category_label VARCHAR(100) NOT NULL,
  
  -- Total trade values
  total_trade_usd BIGINT,
  
  -- Intra-Africa trade values
  intra_africa_trade_usd BIGINT,
  intra_africa_share_pct DECIMAL(5,2),
  
  -- Extra-continental trade values
  trade_with_us_usd BIGINT,
  trade_with_eu_usd BIGINT,
  trade_with_china_usd BIGINT,
  
  -- AfCFTA-specific metrics
  afcfta_tariff_pct DECIMAL(5,2),
  mfn_tariff_pct DECIMAL(5,2),
  preference_margin_pct DECIMAL(5,2),
  roo_compliant BOOLEAN DEFAULT FALSE,
  
  -- Growth metrics
  yoy_growth_pct DECIMAL(5,2),
  cagr_5yr_pct DECIMAL(5,2),
  
  -- Top trading partners (JSON array)
  -- Structure: [{iso3, country, valueUsd, sharePct}]
  top_partners JSONB DEFAULT '[]'::jsonb,
  
  -- Top products (JSON array)
  -- Structure: [{hsCode, description, valueUsd, sharePct}]
  top_products JSONB DEFAULT '[]'::jsonb,
  
  -- Data lineage
  source_id UUID REFERENCES souvera_data_sources(id),
  source_notes TEXT,
  confidence_level VARCHAR(20) DEFAULT 'estimated',
  
  -- Timestamps
  generated_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure uniqueness per country/direction/year/category
  UNIQUE(iso3, direction, year, category_group)
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_afcfta_flows_iso3 ON souvera_afcfta_trade_flows(iso3);
CREATE INDEX IF NOT EXISTS idx_afcfta_flows_direction ON souvera_afcfta_trade_flows(direction);
CREATE INDEX IF NOT EXISTS idx_afcfta_flows_year ON souvera_afcfta_trade_flows(year);
CREATE INDEX IF NOT EXISTS idx_afcfta_flows_category ON souvera_afcfta_trade_flows(category_group);
CREATE INDEX IF NOT EXISTS idx_afcfta_flows_region ON souvera_afcfta_trade_flows(region);
CREATE INDEX IF NOT EXISTS idx_afcfta_flows_lookup ON souvera_afcfta_trade_flows(iso3, direction, year);

-- Enable RLS
ALTER TABLE souvera_afcfta_trade_flows ENABLE ROW LEVEL SECURITY;

-- Allow public read access (trade flows are public intelligence)
CREATE POLICY "Allow public read access to AfCFTA trade flows"
  ON souvera_afcfta_trade_flows
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow service role full access for ingestion
CREATE POLICY "Allow service role full access to AfCFTA trade flows"
  ON souvera_afcfta_trade_flows
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE souvera_afcfta_trade_flows IS 'AfCFTA intra-Africa trade flow data for Import-Export Intelligence module';
COMMENT ON COLUMN souvera_afcfta_trade_flows.direction IS 'Trade direction: imports (what country brings in) or exports (what country sends out)';
COMMENT ON COLUMN souvera_afcfta_trade_flows.intra_africa_trade_usd IS 'Trade value with other African countries (AfCFTA focus)';
COMMENT ON COLUMN souvera_afcfta_trade_flows.preference_margin_pct IS 'Tariff advantage under AfCFTA vs MFN rates';
COMMENT ON COLUMN souvera_afcfta_trade_flows.roo_compliant IS 'Whether products in this category qualify under AfCFTA Rules of Origin';
