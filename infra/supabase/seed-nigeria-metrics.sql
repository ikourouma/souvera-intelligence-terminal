-- =============================================================================
-- Souvera Intelligence Terminal — Nigeria Sample Metrics
-- =============================================================================
-- Purpose: Seed economic observations for Nigeria to test Country Intelligence Panel
-- Author: Afronovation, Inc.
-- Date: May 13, 2026
--
-- This populates souvera_country_observations with sample data for all 6
-- executive snapshot metrics so we can test clickable cards and navigation.
-- =============================================================================

-- Clear existing Nigeria observations (if any)
DELETE FROM souvera_country_observations WHERE country_id = 'NGA';

-- Insert Nigeria Economic Metrics (2024 data)
INSERT INTO souvera_country_observations 
  (country_id, observable_code, value_num, value_text, unit, as_of_date, source_key, created_at, updated_at)
VALUES
  -- PUBLIC METRICS (all users can see)
  ('NGA', 'gdp_current_usd', 477890000000, '477.89B', 'USD', '2024-12-31', 'world_bank', NOW(), NOW()),
  ('NGA', 'gdp_growth_annual_pct', 3.25, '3.25%', 'percent', '2024-12-31', 'world_bank', NOW(), NOW()),
  ('NGA', 'population_total', 223800000, '223.8M', 'people', '2024-12-31', 'world_bank', NOW(), NOW()),
  
  -- PROFESSIONAL+ METRICS
  ('NGA', 'fdi_net_inflows_current_usd', 4500000000, '4.5B', 'USD', '2024-12-31', 'world_bank', NOW(), NOW()),
  ('NGA', 'inflation_consumer_prices_annual_pct', 18.75, '18.75%', 'percent', '2024-12-31', 'world_bank', NOW(), NOW()),
  ('NGA', 'fx_rate_usd', 1547.50, '1547.50', 'NGN/USD', '2024-12-31', 'world_bank', NOW(), NOW());

-- Verify insertion
SELECT 
  observable_code,
  value_num,
  value_text,
  unit,
  as_of_date
FROM souvera_country_observations
WHERE country_id = 'NGA'
ORDER BY observable_code;
