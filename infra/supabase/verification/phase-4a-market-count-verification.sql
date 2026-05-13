-- =========================================================
-- PHASE 4A — MARKET COUNT VERIFICATION
-- Souvera Intelligence Terminal
-- Owner: Afronovation, Inc.
-- Date: 2026-05-04
-- =========================================================
--
-- These queries verify that market counts match
-- the canonical Phase 3 scope:
-- - Africa: 54 countries
-- - Caribbean: 20 markets
-- - All Regions: 74 markets
--
-- Also verifies no duplicate ISO3 codes and
-- that Western Sahara (ESH) is excluded.
-- =========================================================

-- =========================================================
-- 1. APPROVED AFRICA ISO3 LIST (54 COUNTRIES)
-- =========================================================

WITH approved_africa AS (
  SELECT unnest(ARRAY[
    'MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN',
    'NGA', 'GHA', 'SEN', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR', 'CIV', 'TGO', 'BEN', 'GMB', 'GNB', 'CPV', 'MRT',
    'ETH', 'KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SOM', 'DJI', 'ERI', 'MDG', 'COM', 'MUS', 'SYC', 'SSD',
    'CMR', 'CAF', 'COD', 'COG', 'GAB', 'GNQ', 'STP', 'TCD', 'AGO',
    'ZAF', 'BWA', 'LSO', 'SWZ', 'NAM', 'ZWE', 'MOZ', 'ZMB', 'MWI'
  ]) AS iso3
)
SELECT COUNT(*) as approved_africa_count FROM approved_africa;

-- ✅ EXPECTED: 54

-- =========================================================
-- 2. APPROVED CARIBBEAN ISO3 LIST (20 MARKETS)
-- =========================================================

WITH approved_caribbean AS (
  SELECT unnest(ARRAY[
    'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA',
    'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ', 'PRI', 'VGB', 'TCA', 'CYM'
  ]) AS iso3
)
SELECT COUNT(*) as approved_caribbean_count FROM approved_caribbean;

-- ✅ EXPECTED: 20

-- =========================================================
-- 3. ACTIVE COUNTRIES IN DATABASE BY REGION
-- =========================================================

SELECT 
  CASE 
    WHEN region = 'Africa' THEN 'Africa'
    WHEN region = 'Americas' AND subregion = 'Caribbean' THEN 'Caribbean'
    WHEN region = 'Americas' AND subregion IN ('Central America', 'South America') THEN 'Caribbean'
    ELSE region
  END as mapped_region,
  COUNT(*) as country_count
FROM souvera_countries
WHERE is_active = true
GROUP BY mapped_region
ORDER BY country_count DESC;

-- ✅ EXPECTED:
-- Africa     | ~54
-- Caribbean  | ~20
-- (Other regions may also appear if REST Countries ingested all countries)

-- =========================================================
-- 4. AFRICA COUNT (CANONICAL 54 via ISO3 LIST)
-- =========================================================

WITH approved_africa AS (
  SELECT unnest(ARRAY[
    'MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN',
    'NGA', 'GHA', 'SEN', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR', 'CIV', 'TGO', 'BEN', 'GMB', 'GNB', 'CPV', 'MRT',
    'ETH', 'KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SOM', 'DJI', 'ERI', 'MDG', 'COM', 'MUS', 'SYC', 'SSD',
    'CMR', 'CAF', 'COD', 'COG', 'GAB', 'GNQ', 'STP', 'TCD', 'AGO',
    'ZAF', 'BWA', 'LSO', 'SWZ', 'NAM', 'ZWE', 'MOZ', 'ZMB', 'MWI'
  ]) AS iso3
)
SELECT COUNT(*) as africa_count
FROM souvera_countries c
JOIN approved_africa a ON a.iso3 = c.iso3
WHERE c.is_active = true;

-- ✅ EXPECTED: 54
-- ❌ IF < 54: Some African countries missing from database

-- =========================================================
-- 5. CARIBBEAN COUNT (CANONICAL 20 via ISO3 LIST)
-- =========================================================

WITH approved_caribbean AS (
  SELECT unnest(ARRAY[
    'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA',
    'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ', 'PRI', 'VGB', 'TCA', 'CYM'
  ]) AS iso3
)
SELECT COUNT(*) as caribbean_count
FROM souvera_countries c
JOIN approved_caribbean a ON a.iso3 = c.iso3
WHERE c.is_active = true;

-- ✅ EXPECTED: 20
-- ❌ IF < 20: Some Caribbean markets missing from database

-- =========================================================
-- 6. ALL REGIONS COUNT (AFRICA + CARIBBEAN = 74)
-- =========================================================

WITH approved_africa AS (
  SELECT unnest(ARRAY[
    'MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN',
    'NGA', 'GHA', 'SEN', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR', 'CIV', 'TGO', 'BEN', 'GMB', 'GNB', 'CPV', 'MRT',
    'ETH', 'KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SOM', 'DJI', 'ERI', 'MDG', 'COM', 'MUS', 'SYC', 'SSD',
    'CMR', 'CAF', 'COD', 'COG', 'GAB', 'GNQ', 'STP', 'TCD', 'AGO',
    'ZAF', 'BWA', 'LSO', 'SWZ', 'NAM', 'ZWE', 'MOZ', 'ZMB', 'MWI'
  ]) AS iso3
),
approved_caribbean AS (
  SELECT unnest(ARRAY[
    'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA',
    'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ', 'PRI', 'VGB', 'TCA', 'CYM'
  ]) AS iso3
)
SELECT COUNT(DISTINCT c.iso3) as all_regions_count
FROM souvera_countries c
WHERE c.is_active = true
  AND (
    c.iso3 IN (SELECT iso3 FROM approved_africa)
    OR c.iso3 IN (SELECT iso3 FROM approved_caribbean)
  );

-- ✅ EXPECTED: 74
-- ❌ IF < 74: Some markets missing
-- ❌ IF > 74: Duplicate ISO3 or extra markets included

-- =========================================================
-- 7. VERIFY NO WESTERN SAHARA (ESH)
-- =========================================================

SELECT COUNT(*) as western_sahara_count
FROM souvera_countries
WHERE iso3 = 'ESH';

-- ✅ EXPECTED: 0 (ESH should not be in approved Africa list)
-- ⚠️  IF 1: Record exists but should not be returned by API

-- =========================================================
-- 8. CHECK FOR DUPLICATE ISO3 CODES
-- =========================================================

SELECT 
  iso3,
  COUNT(*) as duplicate_count
FROM souvera_countries
WHERE is_active = true
GROUP BY iso3
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- ✅ EXPECTED: 0 rows (no duplicates)
-- ❌ IF ANY ROWS: Database has duplicate ISO3 codes

-- =========================================================
-- 9. API ROUTE SIMULATION — AFRICA
-- =========================================================

-- Simulates /api/v1/countries?region=africa
WITH approved_africa AS (
  SELECT unnest(ARRAY[
    'MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN',
    'NGA', 'GHA', 'SEN', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR', 'CIV', 'TGO', 'BEN', 'GMB', 'GNB', 'CPV', 'MRT',
    'ETH', 'KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SOM', 'DJI', 'ERI', 'MDG', 'COM', 'MUS', 'SYC', 'SSD',
    'CMR', 'CAF', 'COD', 'COG', 'GAB', 'GNQ', 'STP', 'TCD', 'AGO',
    'ZAF', 'BWA', 'LSO', 'SWZ', 'NAM', 'ZWE', 'MOZ', 'ZMB', 'MWI'
  ]) AS iso3
)
SELECT 
  c.iso3,
  c.name
FROM souvera_countries c
JOIN approved_africa a ON a.iso3 = c.iso3
WHERE c.is_active = true
ORDER BY c.name;

-- ✅ EXPECTED: 54 rows, alphabetically sorted

-- =========================================================
-- 10. API ROUTE SIMULATION — CARIBBEAN
-- =========================================================

-- Simulates /api/v1/countries?region=caribbean
WITH approved_caribbean AS (
  SELECT unnest(ARRAY[
    'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA',
    'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ', 'PRI', 'VGB', 'TCA', 'CYM'
  ]) AS iso3
)
SELECT 
  c.iso3,
  c.name
FROM souvera_countries c
JOIN approved_caribbean a ON a.iso3 = c.iso3
WHERE c.is_active = true
ORDER BY c.name;

-- ✅ EXPECTED: 20 rows, alphabetically sorted

-- =========================================================
-- 11. API ROUTE SIMULATION — ALL REGIONS
-- =========================================================

-- Simulates /api/v1/countries?region=all
WITH approved_africa AS (
  SELECT unnest(ARRAY[
    'MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN',
    'NGA', 'GHA', 'SEN', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR', 'CIV', 'TGO', 'BEN', 'GMB', 'GNB', 'CPV', 'MRT',
    'ETH', 'KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SOM', 'DJI', 'ERI', 'MDG', 'COM', 'MUS', 'SYC', 'SSD',
    'CMR', 'CAF', 'COD', 'COG', 'GAB', 'GNQ', 'STP', 'TCD', 'AGO',
    'ZAF', 'BWA', 'LSO', 'SWZ', 'NAM', 'ZWE', 'MOZ', 'ZMB', 'MWI'
  ]) AS iso3
),
approved_caribbean AS (
  SELECT unnest(ARRAY[
    'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA',
    'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ', 'PRI', 'VGB', 'TCA', 'CYM'
  ]) AS iso3
)
SELECT 
  c.iso3,
  c.name,
  CASE
    WHEN c.iso3 IN (SELECT iso3 FROM approved_africa) THEN 'Africa'
    WHEN c.iso3 IN (SELECT iso3 FROM approved_caribbean) THEN 'Caribbean'
  END as region_badge
FROM souvera_countries c
WHERE c.is_active = true
  AND (
    c.iso3 IN (SELECT iso3 FROM approved_africa)
    OR c.iso3 IN (SELECT iso3 FROM approved_caribbean)
  )
ORDER BY c.name;

-- ✅ EXPECTED: 74 rows, alphabetically sorted
-- ✅ EXPECTED: region_badge should be either 'Africa' or 'Caribbean'

-- =========================================================
-- SUMMARY REPORT
-- =========================================================

DO $$
DECLARE
  africa_count INTEGER;
  caribbean_count INTEGER;
  all_count INTEGER;
  esh_count INTEGER;
  duplicate_count INTEGER;
BEGIN
  -- Africa count
  WITH approved_africa AS (
    SELECT unnest(ARRAY[
      'MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN',
      'NGA', 'GHA', 'SEN', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR', 'CIV', 'TGO', 'BEN', 'GMB', 'GNB', 'CPV', 'MRT',
      'ETH', 'KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SOM', 'DJI', 'ERI', 'MDG', 'COM', 'MUS', 'SYC', 'SSD',
      'CMR', 'CAF', 'COD', 'COG', 'GAB', 'GNQ', 'STP', 'TCD', 'AGO',
      'ZAF', 'BWA', 'LSO', 'SWZ', 'NAM', 'ZWE', 'MOZ', 'ZMB', 'MWI'
    ]) AS iso3
  )
  SELECT COUNT(*) INTO africa_count
  FROM souvera_countries c
  JOIN approved_africa a ON a.iso3 = c.iso3
  WHERE c.is_active = true;
  
  -- Caribbean count
  WITH approved_caribbean AS (
    SELECT unnest(ARRAY[
      'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA',
      'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ', 'PRI', 'VGB', 'TCA', 'CYM'
    ]) AS iso3
  )
  SELECT COUNT(*) INTO caribbean_count
  FROM souvera_countries c
  JOIN approved_caribbean a ON a.iso3 = c.iso3
  WHERE c.is_active = true;
  
  -- All regions
  all_count := africa_count + caribbean_count;
  
  -- ESH check
  SELECT COUNT(*) INTO esh_count
  FROM souvera_countries WHERE iso3 = 'ESH';
  
  -- Duplicate check
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT iso3
    FROM souvera_countries
    WHERE is_active = true
    GROUP BY iso3
    HAVING COUNT(*) > 1
  ) dup;
  
  -- Report
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'PHASE 4A — MARKET COUNT SUMMARY';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  
  RAISE NOTICE '📊 Market Counts:';
  IF africa_count = 54 THEN
    RAISE NOTICE '  ✅ Africa: % (expected 54)', africa_count;
  ELSE
    RAISE NOTICE '  ❌ Africa: % (expected 54)', africa_count;
  END IF;
  
  IF caribbean_count = 20 THEN
    RAISE NOTICE '  ✅ Caribbean: % (expected 20)', caribbean_count;
  ELSE
    RAISE NOTICE '  ❌ Caribbean: % (expected 20)', caribbean_count;
  END IF;
  
  IF all_count = 74 THEN
    RAISE NOTICE '  ✅ All Regions: % (expected 74)', all_count;
  ELSE
    RAISE NOTICE '  ❌ All Regions: % (expected 74)', all_count;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Data Quality:';
  IF esh_count = 0 THEN
    RAISE NOTICE '  ✅ Western Sahara (ESH) excluded';
  ELSE
    RAISE NOTICE '  ⚠️  Western Sahara (ESH) exists in database';
  END IF;
  
  IF duplicate_count = 0 THEN
    RAISE NOTICE '  ✅ No duplicate ISO3 codes';
  ELSE
    RAISE NOTICE '  ❌ % duplicate ISO3 codes found', duplicate_count;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
END $$;
