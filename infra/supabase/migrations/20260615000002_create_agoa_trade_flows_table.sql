-- =====================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- AGOA Trade Flows Table
-- Owner: Afronovation, Inc.
-- Phase 0.5E: AGOA Export Intelligence
-- =====================================================
-- This table stores African exports TO the United States
-- under the African Growth and Opportunity Act (AGOA).
-- AGOA provides duty-free access for eligible products.
-- =====================================================

-- Create AGOA trade flows table
CREATE TABLE IF NOT EXISTS souvera_agoa_trade_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core exporter country (African AGOA-eligible country)
  country_id UUID REFERENCES souvera_countries(id),
  iso3 VARCHAR(3) NOT NULL,
  country_name VARCHAR(100),
  region VARCHAR(50),
  sub_region VARCHAR(50),
  
  -- AGOA eligibility status (countries can be suspended)
  agoa_eligible BOOLEAN DEFAULT TRUE,
  agoa_status VARCHAR(50) DEFAULT 'eligible', -- eligible, suspended, graduated
  eligibility_since INTEGER, -- Year country became eligible
  
  -- Time dimension
  year INTEGER NOT NULL,
  
  -- Product classification
  hs_chapter VARCHAR(4) NOT NULL,
  hs_code VARCHAR(10), -- More specific HS code if available
  category_group VARCHAR(50) NOT NULL,
  category_label VARCHAR(100) NOT NULL,
  
  -- Total exports to US (all tariff regimes)
  total_exports_to_us_usd BIGINT,
  
  -- AGOA-specific exports (duty-free under AGOA)
  agoa_exports_usd BIGINT,
  agoa_share_pct DECIMAL(5,2), -- % of exports to US under AGOA
  
  -- Non-AGOA exports (MFN or GSP)
  non_agoa_exports_usd BIGINT,
  mfn_tariff_pct DECIMAL(5,2), -- Tariff if AGOA not available
  
  -- Value of AGOA preference (duty savings)
  tariff_savings_usd BIGINT, -- Estimated duty savings under AGOA
  
  -- Textile-specific (important AGOA category)
  is_textile_apparel BOOLEAN DEFAULT FALSE,
  third_country_fabric_eligible BOOLEAN DEFAULT FALSE,
  
  -- Growth metrics
  yoy_growth_pct DECIMAL(5,2),
  cagr_5yr_pct DECIMAL(5,2),
  
  -- Key export products (JSON array)
  -- Structure: [{hsCode, description, valueUsd, sharePct, agoaEligible}]
  top_products JSONB DEFAULT '[]'::jsonb,
  
  -- US import market context
  us_total_imports_usd BIGINT, -- Total US imports in this category
  country_share_of_us_imports_pct DECIMAL(5,2),
  
  -- Competitor context (top other suppliers to US)
  -- Structure: [{iso3, country, valueUsd, sharePct}]
  competitor_suppliers JSONB DEFAULT '[]'::jsonb,
  
  -- Data lineage
  source_id UUID REFERENCES souvera_data_sources(id),
  source_notes TEXT,
  data_quality_tier VARCHAR(1) DEFAULT 'B', -- A=curated, B=estimated, C=projected
  
  -- Timestamps
  generated_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure uniqueness per country/year/category
  UNIQUE(iso3, year, category_group)
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_agoa_flows_iso3 ON souvera_agoa_trade_flows(iso3);
CREATE INDEX IF NOT EXISTS idx_agoa_flows_year ON souvera_agoa_trade_flows(year);
CREATE INDEX IF NOT EXISTS idx_agoa_flows_category ON souvera_agoa_trade_flows(category_group);
CREATE INDEX IF NOT EXISTS idx_agoa_flows_region ON souvera_agoa_trade_flows(region);
CREATE INDEX IF NOT EXISTS idx_agoa_flows_eligible ON souvera_agoa_trade_flows(agoa_eligible);
CREATE INDEX IF NOT EXISTS idx_agoa_flows_lookup ON souvera_agoa_trade_flows(iso3, year);
CREATE INDEX IF NOT EXISTS idx_agoa_flows_textiles ON souvera_agoa_trade_flows(is_textile_apparel);

-- Enable RLS
ALTER TABLE souvera_agoa_trade_flows ENABLE ROW LEVEL SECURITY;

-- Allow public read access (AGOA trade flows are public intelligence)
CREATE POLICY "Allow public read access to AGOA trade flows"
  ON souvera_agoa_trade_flows
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow service role full access for ingestion
CREATE POLICY "Allow service role full access to AGOA trade flows"
  ON souvera_agoa_trade_flows
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE souvera_agoa_trade_flows IS 'AGOA (African Growth and Opportunity Act) trade flow data - African exports to US';
COMMENT ON COLUMN souvera_agoa_trade_flows.agoa_eligible IS 'Whether the country is currently AGOA-eligible';
COMMENT ON COLUMN souvera_agoa_trade_flows.agoa_exports_usd IS 'Value of exports that entered US duty-free under AGOA';
COMMENT ON COLUMN souvera_agoa_trade_flows.tariff_savings_usd IS 'Estimated duties saved by using AGOA preferences';
COMMENT ON COLUMN souvera_agoa_trade_flows.third_country_fabric_eligible IS 'For apparel: whether country can use non-African fabric (special LDC provision)';
COMMENT ON COLUMN souvera_agoa_trade_flows.competitor_suppliers IS 'Other countries supplying same products to US market';
