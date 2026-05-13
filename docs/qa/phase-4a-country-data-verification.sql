-- =========================================================
-- PHASE 4A — COUNTRY DATA VERIFICATION
-- Souvera Intelligence Terminal
-- Owner: Afronovation, Inc.
-- Date: 2026-05-05
-- =========================================================
--
-- These queries verify data coverage for all 74 markets
-- and identify true source gaps vs ingestion/query issues.
--
-- RUN IN SUPABASE SQL EDITOR
-- =========================================================

-- =========================================================
-- 1. COMPREHENSIVE DATA COVERAGE AUDIT
-- =========================================================

SELECT 
  c.iso3,
  c.name,
  c.region,
  -- Check which indicators have data
  CASE WHEN v.gdp_current_usd IS NOT NULL THEN 'YES' ELSE 'NO' END as has_gdp,
  CASE WHEN v.gdp_growth_pct IS NOT NULL THEN 'YES' ELSE 'NO' END as has_gdp_growth,
  CASE WHEN v.population_total IS NOT NULL THEN 'YES' ELSE 'NO' END as has_population,
  CASE WHEN v.fdi_net_inflows_usd IS NOT NULL THEN 'YES' ELSE 'NO' END as has_fdi,
  -- Show actual values for verification
  v.gdp_current_usd,
  v.gdp_growth_pct,
  v.population_total,
  v.fdi_net_inflows_usd
FROM souvera_countries c
LEFT JOIN souvera_country_professional_v v ON v.country_id = c.id
WHERE c.is_active = true
  AND c.iso3 IN (
    -- Priority verification countries
    'ERI', 'GNQ', 'AGO', 'LSO', 'SUR', 'TTO',
    -- Also check some expected-to-have-data countries
    'NGA', 'ZAF', 'KEN', 'JAM'
  )
ORDER BY c.iso3;

-- ✅ EXPECTED:
-- ERI (Eritrea): May have missing GDP/GDP Growth (World Bank data gaps)
-- GNQ (Equatorial Guinea): Should have most data
-- AGO (Angola): Should have most data
-- LSO (Lesotho): Should have most data
-- SUR (Suriname): Should have most data
-- TTO (Trinidad & Tobago): Should have all data including negative FDI
-- NGA, ZAF, KEN, JAM: Should have all data

-- =========================================================
-- 2. MISSING GDP BY COUNTRY
-- =========================================================

SELECT 
  c.iso3,
  c.name,
  c.region,
  c.subregion,
  COUNT(o.id) as gdp_observation_count
FROM souvera_countries c
LEFT JOIN souvera_country_observations o ON o.country_id = c.id
LEFT JOIN souvera_indicators i ON i.id = o.indicator_id AND i.key = 'gdp_current_usd'
WHERE c.is_active = true
GROUP BY c.iso3, c.name, c.region, c.subregion
HAVING COUNT(o.id) = 0
ORDER BY c.region, c.name;

-- ✅ PURPOSE: Identify which countries have ZERO GDP observations
-- ⚠️  IF MANY ROWS: World Bank ingestion may not have covered all countries

-- =========================================================
-- 3. MISSING GDP GROWTH BY COUNTRY
-- =========================================================

SELECT 
  c.iso3,
  c.name,
  c.region,
  COUNT(o.id) as gdp_growth_observation_count
FROM souvera_countries c
LEFT JOIN souvera_country_observations o ON o.country_id = c.id
LEFT JOIN souvera_indicators i ON i.id = o.indicator_id AND i.key = 'gdp_growth_pct'
WHERE c.is_active = true
GROUP BY c.iso3, c.name, c.region
HAVING COUNT(o.id) = 0
ORDER BY c.region, c.name;

-- ✅ PURPOSE: Identify which countries have ZERO GDP Growth observations

-- =========================================================
-- 4. MISSING POPULATION BY COUNTRY
-- =========================================================

SELECT 
  c.iso3,
  c.name,
  c.region,
  COUNT(o.id) as population_observation_count
FROM souvera_countries c
LEFT JOIN souvera_country_observations o ON o.country_id = c.id
LEFT JOIN souvera_indicators i ON i.id = o.indicator_id AND i.key = 'population_total'
WHERE c.is_active = true
GROUP BY c.iso3, c.name, c.region
HAVING COUNT(o.id) = 0
ORDER BY c.region, c.name;

-- ✅ PURPOSE: Identify which countries have ZERO Population observations

-- =========================================================
-- 5. MISSING FDI BY COUNTRY
-- =========================================================

SELECT 
  c.iso3,
  c.name,
  c.region,
  COUNT(o.id) as fdi_observation_count
FROM souvera_countries c
LEFT JOIN souvera_country_observations o ON o.country_id = c.id
LEFT JOIN souvera_indicators i ON i.id = o.indicator_id AND i.key = 'fdi_net_inflows_usd'
WHERE c.is_active = true
GROUP BY c.iso3, c.name, c.region
HAVING COUNT(o.id) = 0
ORDER BY c.region, c.name;

-- ✅ PURPOSE: Identify which countries have ZERO FDI observations
-- ⚠️  EXPECTED: Many small island nations may lack FDI data from World Bank

-- =========================================================
-- 6. ERITREA DETAILED VERIFICATION
-- =========================================================

-- Check observations
SELECT 
  i.key as indicator,
  COUNT(o.id) as observation_count,
  MIN(o.period_date) as earliest,
  MAX(o.period_date) as latest,
  MAX(o.value_numeric) as latest_value
FROM souvera_countries c
LEFT JOIN souvera_country_observations o ON o.country_id = c.id
LEFT JOIN souvera_indicators i ON i.id = o.indicator_id
WHERE c.iso3 = 'ERI'
GROUP BY i.key
ORDER BY i.key;

-- Check professional view
SELECT 
  iso3,
  name,
  gdp_current_usd,
  gdp_growth_pct,
  population_total,
  fdi_net_inflows_usd
FROM souvera_country_professional_v
WHERE iso3 = 'ERI';

-- ✅ EXPECTED:
-- - If observations exist but professional view shows NULL: VIEW PIVOT ISSUE
-- - If observations don't exist: TRUE SOURCE DATA GAP

-- =========================================================
-- 7. EQUATORIAL GUINEA DETAILED VERIFICATION
-- =========================================================

-- Check observations
SELECT 
  i.key as indicator,
  COUNT(o.id) as observation_count,
  MIN(o.period_date) as earliest,
  MAX(o.period_date) as latest,
  MAX(o.value_numeric) as latest_value
FROM souvera_countries c
LEFT JOIN souvera_country_observations o ON o.country_id = c.id
LEFT JOIN souvera_indicators i ON i.id = o.indicator_id
WHERE c.iso3 = 'GNQ'
GROUP BY i.key
ORDER BY i.key;

-- Check professional view
SELECT 
  iso3,
  name,
  gdp_current_usd,
  gdp_growth_pct,
  population_total,
  fdi_net_inflows_usd
FROM souvera_country_professional_v
WHERE iso3 = 'GNQ';

-- Check country record exists
SELECT 
  iso3,
  name,
  region,
  subregion,
  is_active,
  lat,
  lng
FROM souvera_countries
WHERE iso3 = 'GNQ';

-- ✅ EXPECTED: GNQ should have country record and observations

-- =========================================================
-- 8. NEGATIVE FDI VALUES VERIFICATION
-- =========================================================

SELECT 
  c.iso3,
  c.name,
  o.value_numeric as fdi_value,
  o.period_date,
  v.fdi_net_inflows_usd as view_value
FROM souvera_countries c
JOIN souvera_country_observations o ON o.country_id = c.id
JOIN souvera_indicators i ON i.id = o.indicator_id
LEFT JOIN souvera_country_professional_v v ON v.country_id = c.id
WHERE i.key = 'fdi_net_inflows_usd'
  AND o.value_numeric < 0
ORDER BY o.value_numeric ASC
LIMIT 20;

-- ✅ PURPOSE: Verify negative FDI values exist and are preserved in views
-- ✅ EXPECTED: Should see TTO, possibly others with negative values

-- =========================================================
-- 9. DATA COMPLETENESS SUMMARY
-- =========================================================

WITH data_completeness AS (
  SELECT 
    c.iso3,
    c.name,
    c.region,
    CASE WHEN v.gdp_current_usd IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN v.gdp_growth_pct IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN v.population_total IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN v.fdi_net_inflows_usd IS NOT NULL THEN 1 ELSE 0 END as metrics_populated
  FROM souvera_countries c
  LEFT JOIN souvera_country_professional_v v ON v.country_id = c.id
  WHERE c.is_active = true
)
SELECT 
  region,
  metrics_populated,
  COUNT(*) as country_count
FROM data_completeness
GROUP BY region, metrics_populated
ORDER BY region, metrics_populated;

-- ✅ PURPOSE: Summary of data completeness by region
-- ✅ EXPECTED:
-- metrics_populated = 4: All 4 indicators present
-- metrics_populated = 3: 3 indicators present (likely missing FDI or GDP Growth)
-- metrics_populated < 3: Significant data gaps

-- =========================================================
-- 10. OBSERVATION COUNT BY INDICATOR
-- =========================================================

SELECT 
  i.key as indicator,
  i.label,
  COUNT(o.id) as total_observations,
  COUNT(DISTINCT o.country_id) as countries_with_data,
  MIN(o.period_date) as earliest_date,
  MAX(o.period_date) as latest_date
FROM souvera_indicators i
LEFT JOIN souvera_country_observations o ON o.indicator_id = i.id
WHERE i.key IN ('gdp_current_usd', 'gdp_growth_pct', 'population_total', 'fdi_net_inflows_usd')
GROUP BY i.key, i.label
ORDER BY i.key;

-- ✅ EXPECTED AFTER FDI INGESTION:
-- gdp_current_usd: ~1400 observations, ~70 countries
-- gdp_growth_pct: ~1400 observations, ~70 countries
-- population_total: ~1400 observations, ~70 countries
-- fdi_net_inflows_usd: ~1376 observations, ~70 countries

-- =========================================================
-- 11. PROFESSIONAL VIEW NULL VALUES
-- =========================================================

SELECT 
  COUNT(*) as total_countries,
  COUNT(gdp_current_usd) as has_gdp,
  COUNT(gdp_growth_pct) as has_gdp_growth,
  COUNT(population_total) as has_population,
  COUNT(fdi_net_inflows_usd) as has_fdi,
  COUNT(*) - COUNT(gdp_current_usd) as missing_gdp,
  COUNT(*) - COUNT(gdp_growth_pct) as missing_gdp_growth,
  COUNT(*) - COUNT(population_total) as missing_population,
  COUNT(*) - COUNT(fdi_net_inflows_usd) as missing_fdi
FROM souvera_country_professional_v v
JOIN souvera_countries c ON c.id = v.country_id
WHERE c.is_active = true;

-- ✅ PURPOSE: Count total NULL values in professional view for all active countries

-- =========================================================
-- 12. COUNTRIES WITH ALL NULL VALUES
-- =========================================================

SELECT 
  c.iso3,
  c.name,
  c.region,
  c.subregion
FROM souvera_countries c
JOIN souvera_country_professional_v v ON v.country_id = c.id
WHERE c.is_active = true
  AND v.gdp_current_usd IS NULL
  AND v.gdp_growth_pct IS NULL
  AND v.population_total IS NULL
  AND v.fdi_net_inflows_usd IS NULL
ORDER BY c.region, c.name;

-- ✅ PURPOSE: Identify countries with NO data at all
-- ⚠️  IF ANY ROWS: Possible ingestion issue or very small territories

-- =========================================================
-- 13. VIEW PIVOT VERIFICATION
-- =========================================================

-- This query checks if observations exist but view shows NULL (pivot issue)
WITH obs_counts AS (
  SELECT 
    c.iso3,
    c.name,
    COUNT(CASE WHEN i.key = 'gdp_current_usd' THEN 1 END) as gdp_obs,
    COUNT(CASE WHEN i.key = 'gdp_growth_pct' THEN 1 END) as gdp_growth_obs,
    COUNT(CASE WHEN i.key = 'population_total' THEN 1 END) as pop_obs,
    COUNT(CASE WHEN i.key = 'fdi_net_inflows_usd' THEN 1 END) as fdi_obs
  FROM souvera_countries c
  LEFT JOIN souvera_country_observations o ON o.country_id = c.id
  LEFT JOIN souvera_indicators i ON i.id = o.indicator_id
  WHERE c.is_active = true
  GROUP BY c.iso3, c.name
),
view_values AS (
  SELECT 
    c.iso3,
    v.gdp_current_usd,
    v.gdp_growth_pct,
    v.population_total,
    v.fdi_net_inflows_usd
  FROM souvera_countries c
  LEFT JOIN souvera_country_professional_v v ON v.country_id = c.id
  WHERE c.is_active = true
)
SELECT 
  o.iso3,
  o.name,
  o.gdp_obs,
  CASE WHEN v.gdp_current_usd IS NULL THEN 'VIEW NULL' ELSE 'VIEW OK' END as gdp_view_status,
  o.fdi_obs,
  CASE WHEN v.fdi_net_inflows_usd IS NULL THEN 'VIEW NULL' ELSE 'VIEW OK' END as fdi_view_status
FROM obs_counts o
JOIN view_values v ON v.iso3 = o.iso3
WHERE (o.gdp_obs > 0 AND v.gdp_current_usd IS NULL)
   OR (o.fdi_obs > 0 AND v.fdi_net_inflows_usd IS NULL)
ORDER BY o.iso3;

-- ✅ PURPOSE: Find cases where observations exist but view shows NULL
-- ❌ IF ANY ROWS: VIEW PIVOT LOGIC BUG

-- =========================================================
-- SUMMARY NOTES
-- =========================================================

-- CLASSIFICATION GUIDE:
-- ─────────────────────────────────────────────────────────
-- TRUE SOURCE DATA GAP:
--   - Query 2-5 shows 0 observations
--   - World Bank API does not have data for this country/indicator
--   - Expected for small islands, disputed territories, countries with poor data collection
--
-- VIEW/QUERY ISSUE:
--   - Query 13 shows observations exist but view returns NULL
--   - Indicates pivot logic bug in souvera_country_professional_v
--
-- INGESTION NOT RUN:
--   - Query 10 shows 0 observations for an indicator
--   - Indicator exists in souvera_indicators but no observations
--
-- MAPPING MISMATCH:
--   - Country exists in souvera_countries
--   - But ISO3 or country name doesn't match World Bank API response
--   - Requires services/ingestion/worldbank.ts country mapping fix
