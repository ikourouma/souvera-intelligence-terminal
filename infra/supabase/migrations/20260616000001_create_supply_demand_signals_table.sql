-- =====================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- Supply-Demand Matrix Table
-- Owner: Afronovation, Inc.
-- Phase 4C: Supply-Demand Matrix Implementation
-- =====================================================
-- 
-- This migration creates the souvera_supply_demand_signals table
-- which powers the 74-market × 8-sector Supply-Demand Matrix.
-- 
-- Total expected cells: 592 (74 countries × 8 sectors)
--
-- Sectors:
--   1. manufacturing_textiles - Manufacturing & Textiles
--   2. agriculture_food - Agriculture & Food Processing
--   3. energy_power - Energy & Power
--   4. mining_minerals - Mining & Critical Minerals
--   5. digital_infrastructure - Digital Infrastructure
--   6. fintech_finance - Fintech & Digital Finance
--   7. logistics_trade - Logistics & Trade
--   8. tourism_hospitality - Tourism & Hospitality

-- Create the main supply-demand signals table
CREATE TABLE IF NOT EXISTS souvera_supply_demand_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Market & Sector
  country_id UUID REFERENCES souvera_countries(id),
  iso3 VARCHAR(3) NOT NULL,
  country_name VARCHAR(100),
  region VARCHAR(50),
  sector_key VARCHAR(50) NOT NULL,
  sector_label VARCHAR(100) NOT NULL,
  
  -- Supply Side (African/Caribbean Production Capacity)
  supply_score DECIMAL(5,2),  -- 0-100
  supply_confidence VARCHAR(1) CHECK (supply_confidence IN ('A', 'B', 'C')),
  supply_components JSONB DEFAULT '{}'::jsonb,
  supply_notes TEXT,
  
  -- Key Supply Metrics
  export_volume_usd BIGINT,
  manufacturing_capacity_index DECIMAL(5,2),
  fdi_inflows_usd BIGINT,
  infrastructure_score DECIMAL(5,2),
  labor_quality_index DECIMAL(5,2),
  regulatory_score DECIMAL(5,2),
  
  -- Demand Side (US Import Market)
  demand_score DECIMAL(5,2),  -- 0-100
  demand_confidence VARCHAR(1) CHECK (demand_confidence IN ('A', 'B', 'C')),
  demand_components JSONB DEFAULT '{}'::jsonb,
  demand_notes TEXT,
  
  -- Key Demand Metrics
  us_import_volume_usd BIGINT,
  us_import_growth_pct DECIMAL(5,2),
  us_diversification_pressure DECIMAL(5,2),
  policy_incentive_score DECIMAL(5,2),
  china_market_share_pct DECIMAL(5,2),
  
  -- Opportunity Score (Combined Signal)
  opportunity_score DECIMAL(5,2),  -- 0-100
  opportunity_tier INTEGER CHECK (opportunity_tier IN (1, 2, 3, 4)),
  opportunity_rationale TEXT,
  
  -- Trade Corridor Metrics
  current_trade_usd BIGINT,
  tariff_preference_margin_pct DECIMAL(5,2),
  top_competitors JSONB DEFAULT '[]'::jsonb,
  
  -- Strategic Flags
  agoa_eligible BOOLEAN DEFAULT FALSE,
  cbtpa_eligible BOOLEAN DEFAULT FALSE,
  afcfta_member BOOLEAN DEFAULT FALSE,
  us_fta BOOLEAN DEFAULT FALSE,
  
  -- Data Lineage
  data_year INTEGER NOT NULL,
  source_id UUID REFERENCES souvera_data_sources(id),
  source_notes TEXT,
  data_quality_tier VARCHAR(1) DEFAULT 'B' CHECK (data_quality_tier IN ('A', 'B', 'C')),
  
  -- Timestamps
  generated_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Unique constraint per country/sector/year
  UNIQUE(iso3, sector_key, data_year)
);

-- Add comments for documentation
COMMENT ON TABLE souvera_supply_demand_signals IS 'Supply-Demand Matrix: 74 markets × 8 sectors opportunity scoring';
COMMENT ON COLUMN souvera_supply_demand_signals.supply_score IS 'Production capacity score (0-100) based on exports, FDI, infrastructure';
COMMENT ON COLUMN souvera_supply_demand_signals.demand_score IS 'US import demand score (0-100) based on volume, growth, diversification';
COMMENT ON COLUMN souvera_supply_demand_signals.opportunity_score IS 'Combined opportunity score (0-100) with adjustments for trade barriers';
COMMENT ON COLUMN souvera_supply_demand_signals.opportunity_tier IS 'Opportunity classification: 1=High-conviction, 2=Strong, 3=Emerging, 4=Early-stage';
COMMENT ON COLUMN souvera_supply_demand_signals.supply_confidence IS 'Data confidence: A=≥4 sources/≤2yr, B=2-3 sources/≤3yr, C=1 source/estimated';
COMMENT ON COLUMN souvera_supply_demand_signals.supply_components IS 'JSON breakdown of supply score components (exportPct, infraPct, regulatoryPct, etc.)';
COMMENT ON COLUMN souvera_supply_demand_signals.top_competitors IS 'JSON array of competing suppliers: [{country, iso3, sharePct}]';

-- Create indexes for performance
CREATE INDEX idx_supply_demand_country ON souvera_supply_demand_signals(country_id);
CREATE INDEX idx_supply_demand_iso3 ON souvera_supply_demand_signals(iso3);
CREATE INDEX idx_supply_demand_sector ON souvera_supply_demand_signals(sector_key);
CREATE INDEX idx_supply_demand_region ON souvera_supply_demand_signals(region);
CREATE INDEX idx_supply_demand_opportunity ON souvera_supply_demand_signals(opportunity_score DESC NULLS LAST);
CREATE INDEX idx_supply_demand_tier ON souvera_supply_demand_signals(opportunity_tier);
CREATE INDEX idx_supply_demand_year ON souvera_supply_demand_signals(data_year);
CREATE INDEX idx_supply_demand_agoa ON souvera_supply_demand_signals(agoa_eligible) WHERE agoa_eligible = TRUE;
CREATE INDEX idx_supply_demand_cbtpa ON souvera_supply_demand_signals(cbtpa_eligible) WHERE cbtpa_eligible = TRUE;

-- Enable RLS
ALTER TABLE souvera_supply_demand_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Supply-demand visible to Investor+ tier (or admin)
-- Access is determined by checking user's active subscription plan
CREATE POLICY "supply_demand_investor_read"
  ON souvera_supply_demand_signals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM souvera_subscriptions
      WHERE user_id = auth.uid()
      AND status IN ('trial', 'active')
      AND plan_id IN ('investor', 'institutional', 'platform_admin', 'super_admin')
    )
  );

-- RLS Policy: Service role can do everything (for ingestion)
CREATE POLICY "supply_demand_service_all"
  ON souvera_supply_demand_signals
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_supply_demand_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER supply_demand_updated_at
  BEFORE UPDATE ON souvera_supply_demand_signals
  FOR EACH ROW
  EXECUTE FUNCTION update_supply_demand_timestamp();

-- Create lookup table for sector definitions
CREATE TABLE IF NOT EXISTS souvera_sdm_sectors (
  sector_key VARCHAR(50) PRIMARY KEY,
  sector_label VARCHAR(100) NOT NULL,
  sector_icon VARCHAR(10),
  sector_description TEXT,
  hs_chapters TEXT[],
  us_import_volume_usd_2023 BIGINT,
  china_share_pct_2023 DECIMAL(5,2),
  growth_rate_5yr_pct DECIMAL(5,2),
  policy_incentive_score DECIMAL(5,2),
  display_order INTEGER DEFAULT 0
);

COMMENT ON TABLE souvera_sdm_sectors IS 'Reference table for Supply-Demand Matrix sector definitions and US demand metrics';

-- Seed the 8 sectors with US demand data
INSERT INTO souvera_sdm_sectors (sector_key, sector_label, sector_icon, sector_description, hs_chapters, us_import_volume_usd_2023, china_share_pct_2023, growth_rate_5yr_pct, policy_incentive_score, display_order) VALUES
  ('manufacturing_textiles', 'Manufacturing & Textiles', '🏭', 'Apparel, industrial goods, EPZ production', ARRAY['61','62','63','84','85'], 185000000000, 32.5, 3.2, 75, 1),
  ('agriculture_food', 'Agriculture & Food Processing', '🌾', 'Raw commodities + value-added processing', ARRAY['01','02','03','04','07','08','09','10','11','12','15','17','18','19','20','21','22','23','24'], 165000000000, 8.5, 4.8, 65, 2),
  ('energy_power', 'Energy & Power', '⚡', 'Oil, gas, LNG, renewables, power generation', ARRAY['27'], 280000000000, 1.2, -2.5, 80, 3),
  ('mining_minerals', 'Mining & Critical Minerals', '⛏️', 'Gold, lithium, cobalt, rare earths', ARRAY['25','26','71','72','73','74','75','76','78','79','80','81'], 95000000000, 18.5, 6.8, 90, 4),
  ('digital_infrastructure', 'Digital Infrastructure', '📡', 'Telecom, data centers, fiber, 5G', ARRAY['85'], 125000000000, 42.5, 8.5, 85, 5),
  ('fintech_finance', 'Fintech & Digital Finance', '💳', 'Mobile money, payments, banking', NULL, 0, 0, 15.2, 70, 6),
  ('logistics_trade', 'Logistics & Trade', '🚢', 'Ports, freight, supply chain services', NULL, 0, 0, 5.5, 60, 7),
  ('tourism_hospitality', 'Tourism & Hospitality', '🏨', 'Hotels, travel services, eco-tourism', NULL, 0, 0, 12.0, 50, 8)
ON CONFLICT (sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label,
  sector_description = EXCLUDED.sector_description,
  us_import_volume_usd_2023 = EXCLUDED.us_import_volume_usd_2023,
  china_share_pct_2023 = EXCLUDED.china_share_pct_2023,
  growth_rate_5yr_pct = EXCLUDED.growth_rate_5yr_pct,
  policy_incentive_score = EXCLUDED.policy_incentive_score;

-- Verification queries (commented out for migration safety)
-- SELECT COUNT(*) FROM souvera_sdm_sectors; -- Expected: 8
-- SELECT sector_key, sector_label, us_import_volume_usd_2023 FROM souvera_sdm_sectors ORDER BY display_order;
