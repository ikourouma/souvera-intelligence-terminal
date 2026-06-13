-- Phase 0.7: CBTPA Import-Export Intelligence
-- Caribbean Basin Trade Partnership Act trade flow data
-- Mirrors AfCFTA structure with US bilateral + intra-CARICOM focus

CREATE TABLE IF NOT EXISTS souvera_cbtpa_trade_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Country reference
  country_id UUID REFERENCES souvera_countries(id),
  iso3 VARCHAR(3) NOT NULL,
  country_name VARCHAR(100),
  region VARCHAR(50) DEFAULT 'Americas',
  sub_region VARCHAR(50),
  
  -- Direction and period
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('imports', 'exports')),
  year INTEGER NOT NULL DEFAULT 2023,
  
  -- Category classification
  hs_chapter VARCHAR(10) NOT NULL,
  category_group VARCHAR(50) NOT NULL,
  category_label VARCHAR(100) NOT NULL,
  
  -- Total trade volumes
  total_imports_usd BIGINT,
  total_exports_usd BIGINT,
  
  -- US bilateral axis (primary for CBTPA)
  trade_with_us_usd BIGINT,
  trade_with_us_share_pct DECIMAL(5,2),
  
  -- Intra-Caribbean trade (CARICOM parallel to AfCFTA intra-Africa)
  intra_caribbean_trade_usd BIGINT,
  intra_caribbean_share_pct DECIMAL(5,2),
  
  -- Extra-regional competition
  trade_with_eu_usd BIGINT,
  trade_with_china_usd BIGINT,
  
  -- CBTPA preference metrics
  cbtpa_tariff_pct DECIMAL(5,2) DEFAULT 0,
  mfn_tariff_pct DECIMAL(5,2),
  preference_margin_pct DECIMAL(5,2),
  roo_compliant BOOLEAN,
  cbi_beneficiary BOOLEAN DEFAULT true,
  caricom_member BOOLEAN,
  
  -- Growth indicators
  yoy_growth_pct DECIMAL(5,2),
  
  -- Detailed breakdowns (JSONB)
  top_partners JSONB DEFAULT '[]'::jsonb,
  top_products JSONB DEFAULT '[]'::jsonb,
  
  -- Data quality and metadata
  data_quality_tier VARCHAR(1) CHECK (data_quality_tier IN ('A', 'B', 'C')),
  confidence_level VARCHAR(20) DEFAULT 'estimated',
  source_notes TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Uniqueness constraint
  UNIQUE(iso3, direction, year, category_group)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_cbtpa_flows_country ON souvera_cbtpa_trade_flows(iso3);
CREATE INDEX IF NOT EXISTS idx_cbtpa_flows_direction ON souvera_cbtpa_trade_flows(direction);
CREATE INDEX IF NOT EXISTS idx_cbtpa_flows_category ON souvera_cbtpa_trade_flows(category_group);
CREATE INDEX IF NOT EXISTS idx_cbtpa_flows_year ON souvera_cbtpa_trade_flows(year);
CREATE INDEX IF NOT EXISTS idx_cbtpa_flows_tier ON souvera_cbtpa_trade_flows(data_quality_tier);
CREATE INDEX IF NOT EXISTS idx_cbtpa_flows_us_trade ON souvera_cbtpa_trade_flows(trade_with_us_usd DESC NULLS LAST);

-- Table and column comments
COMMENT ON TABLE souvera_cbtpa_trade_flows IS 'CBTPA Import-Export Intelligence - Caribbean trade flows with US bilateral and CARICOM intra-regional focus';
COMMENT ON COLUMN souvera_cbtpa_trade_flows.direction IS 'Trade direction: imports (into Caribbean) or exports (from Caribbean)';
COMMENT ON COLUMN souvera_cbtpa_trade_flows.trade_with_us_usd IS 'Bilateral trade value with United States (primary axis for CBTPA)';
COMMENT ON COLUMN souvera_cbtpa_trade_flows.intra_caribbean_trade_usd IS 'Intra-CARICOM trade value (regional integration metric)';
COMMENT ON COLUMN souvera_cbtpa_trade_flows.cbtpa_tariff_pct IS 'Preferential tariff rate under CBTPA (usually 0% for eligible products)';
COMMENT ON COLUMN souvera_cbtpa_trade_flows.preference_margin_pct IS 'Tariff advantage: MFN rate minus CBTPA rate (cliff risk exposure)';
COMMENT ON COLUMN souvera_cbtpa_trade_flows.cbi_beneficiary IS 'Whether country is a CBI (Caribbean Basin Initiative) beneficiary';
COMMENT ON COLUMN souvera_cbtpa_trade_flows.caricom_member IS 'Whether country is a CARICOM member state';
COMMENT ON COLUMN souvera_cbtpa_trade_flows.data_quality_tier IS 'Data quality: A=high-confidence, B=regional benchmark, C=conservative projection';

-- Enable Row Level Security (matches other trade tables)
ALTER TABLE souvera_cbtpa_trade_flows ENABLE ROW LEVEL SECURITY;

-- Public read access policy (anonymous users can read)
CREATE POLICY "Allow public read access to CBTPA flows"
  ON souvera_cbtpa_trade_flows
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Service role has full access
CREATE POLICY "Service role has full access to CBTPA flows"
  ON souvera_cbtpa_trade_flows
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
