-- Phase 0.6 Migration: Add data_quality_tier column
-- Supports tiered data quality disclosure for expanded market coverage

-- Add data_quality_tier to import demand signals
ALTER TABLE souvera_import_demand_signals 
  ADD COLUMN IF NOT EXISTS data_quality_tier VARCHAR(1) 
  CHECK (data_quality_tier IN ('A', 'B', 'C'));

-- Add data_quality_tier to AfCFTA trade flows
ALTER TABLE souvera_afcfta_trade_flows 
  ADD COLUMN IF NOT EXISTS data_quality_tier VARCHAR(1) 
  CHECK (data_quality_tier IN ('A', 'B', 'C'));

-- Add index for filtering by tier
CREATE INDEX IF NOT EXISTS idx_import_demand_tier 
  ON souvera_import_demand_signals(data_quality_tier);

CREATE INDEX IF NOT EXISTS idx_afcfta_flows_tier 
  ON souvera_afcfta_trade_flows(data_quality_tier);

-- Comment documentation
COMMENT ON COLUMN souvera_import_demand_signals.data_quality_tier IS 
  'Data quality tier: A=high-confidence curated, B=regional benchmark, C=conservative projection';

COMMENT ON COLUMN souvera_afcfta_trade_flows.data_quality_tier IS 
  'Data quality tier: A=high-confidence curated, B=regional benchmark, C=conservative projection';
