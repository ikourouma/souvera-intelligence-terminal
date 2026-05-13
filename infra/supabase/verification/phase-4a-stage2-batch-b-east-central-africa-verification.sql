-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- VERIFICATION SCRIPT: PHASE 4A STAGE 2 — BATCH B (FINAL)
-- East + Central Africa (17 countries × 7 sectors = 119 rows)
-- =========================================================

-- ===========================================
-- VERIFICATION CHECKS
-- ===========================================
--
-- This script validates Phase 4A Stage 2 Batch B seed data:
-- - 17 East + Central African countries
-- - 7 sectors per country
-- - 119 total new rows
-- - Expected global total after execution: 518 rows (STAGE 2 COMPLETE)
--
-- Read-only verification. Safe to run repeatedly.
-- ===========================================

-- Check 1: Total Batch B rows = 119
SELECT 'Check 1: Total Batch B Rows' AS check_name,
  COUNT(*) AS actual_count,
  119 AS expected_count,
  CASE WHEN COUNT(*) = 119 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM public.souvera_country_sectors scs
JOIN public.souvera_countries c ON c.id = scs.country_id
WHERE c.iso3 = ANY(ARRAY['BDI','COM','DJI','ERI','MDG','MUS','SYC','SOM','SSD','AGO','CAF','TCD','COG','COD','GNQ','GAB','STP']);

-- Check 2: Each Batch B country has exactly 7 sectors
WITH batch_b_countries AS (
  SELECT unnest(ARRAY['BDI','COM','DJI','ERI','MDG','MUS','SYC','SOM','SSD','AGO','CAF','TCD','COG','COD','GNQ','GAB','STP']) AS iso3
)
SELECT 'Check 2: Sectors Per Country' AS check_name,
  c.iso3,
  c.name AS country_name,
  COUNT(scs.id) AS sector_count,
  CASE WHEN COUNT(scs.id) = 7 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_b_countries bbc
JOIN public.souvera_countries c ON c.iso3 = bbc.iso3
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
GROUP BY c.iso3, c.name
ORDER BY c.iso3;

-- Check 3: All 17 Batch B countries present in database
WITH batch_b_countries AS (
  SELECT unnest(ARRAY['BDI','COM','DJI','ERI','MDG','MUS','SYC','SOM','SSD','AGO','CAF','TCD','COG','COD','GNQ','GAB','STP']) AS iso3
)
SELECT 'Check 3: All Batch B Countries Present' AS check_name,
  COUNT(DISTINCT c.iso3) AS actual_count,
  17 AS expected_count,
  CASE WHEN COUNT(DISTINCT c.iso3) = 17 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_b_countries bbc
JOIN public.souvera_countries c ON c.iso3 = bbc.iso3;

-- Check 4: All 7 sector keys present for each country
WITH batch_b_countries AS (
  SELECT unnest(ARRAY['BDI','COM','DJI','ERI','MDG','MUS','SYC','SOM','SSD','AGO','CAF','TCD','COG','COD','GNQ','GAB','STP']) AS iso3
)
SELECT 'Check 4: All Sector Keys Per Country' AS check_name,
  c.iso3,
  c.name AS country_name,
  COUNT(DISTINCT scs.sector_key) AS distinct_sectors,
  CASE WHEN COUNT(DISTINCT scs.sector_key) = 7 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_b_countries bbc
JOIN public.souvera_countries c ON c.iso3 = bbc.iso3
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
GROUP BY c.iso3, c.name
ORDER BY c.iso3;

-- Check 5: No duplicate sector keys per country
WITH batch_b_countries AS (
  SELECT unnest(ARRAY['BDI','COM','DJI','ERI','MDG','MUS','SYC','SOM','SSD','AGO','CAF','TCD','COG','COD','GNQ','GAB','STP']) AS iso3
)
SELECT 'Check 5: No Duplicate Sector Keys' AS check_name,
  c.iso3,
  c.name AS country_name,
  scs.sector_key,
  COUNT(*) AS duplicate_count,
  CASE WHEN COUNT(*) = 1 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_b_countries bbc
JOIN public.souvera_countries c ON c.iso3 = bbc.iso3
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
GROUP BY c.iso3, c.name, scs.sector_key
HAVING COUNT(*) > 1
ORDER BY c.iso3, scs.sector_key;

-- Check 6: All Batch B rows have min_plan_id = 'explorer'
WITH batch_b_countries AS (
  SELECT unnest(ARRAY['BDI','COM','DJI','ERI','MDG','MUS','SYC','SOM','SSD','AGO','CAF','TCD','COG','COD','GNQ','GAB','STP']) AS iso3
)
SELECT 'Check 6: Min Plan ID = Explorer' AS check_name,
  COUNT(*) AS rows_with_explorer,
  119 AS expected_count,
  CASE WHEN COUNT(*) = 119 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_b_countries bbc
JOIN public.souvera_countries c ON c.iso3 = bbc.iso3
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE scs.min_plan_id = 'explorer';

-- Check 7: Display order values are 1-7
WITH batch_b_countries AS (
  SELECT unnest(ARRAY['BDI','COM','DJI','ERI','MDG','MUS','SYC','SOM','SSD','AGO','CAF','TCD','COG','COD','GNQ','GAB','STP']) AS iso3
)
SELECT 'Check 7: Display Order Values' AS check_name,
  scs.display_order,
  COUNT(*) AS row_count,
  CASE WHEN scs.display_order BETWEEN 1 AND 7 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_b_countries bbc
JOIN public.souvera_countries c ON c.iso3 = bbc.iso3
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
GROUP BY scs.display_order
ORDER BY scs.display_order;

-- Check 8: All rows have teaser_md populated
WITH batch_b_countries AS (
  SELECT unnest(ARRAY['BDI','COM','DJI','ERI','MDG','MUS','SYC','SOM','SSD','AGO','CAF','TCD','COG','COD','GNQ','GAB','STP']) AS iso3
)
SELECT 'Check 8: Teaser MD Populated' AS check_name,
  COUNT(*) AS rows_with_teaser,
  119 AS expected_count,
  CASE WHEN COUNT(*) = 119 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_b_countries bbc
JOIN public.souvera_countries c ON c.iso3 = bbc.iso3
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE scs.teaser_md IS NOT NULL 
  AND LENGTH(scs.teaser_md) > 0;

-- Check 9: All rows have rationale_md populated
WITH batch_b_countries AS (
  SELECT unnest(ARRAY['BDI','COM','DJI','ERI','MDG','MUS','SYC','SOM','SSD','AGO','CAF','TCD','COG','COD','GNQ','GAB','STP']) AS iso3
)
SELECT 'Check 9: Rationale MD Populated' AS check_name,
  COUNT(*) AS rows_with_rationale,
  119 AS expected_count,
  CASE WHEN COUNT(*) = 119 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_b_countries bbc
JOIN public.souvera_countries c ON c.iso3 = bbc.iso3
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE scs.rationale_md IS NOT NULL 
  AND LENGTH(scs.rationale_md) > 0;

-- Check 10: Sample Digital Infrastructure rows
WITH batch_b_countries AS (
  SELECT unnest(ARRAY['BDI','COM','DJI','ERI','MDG','MUS','SYC','SOM','SSD','AGO','CAF','TCD','COG','COD','GNQ','GAB','STP']) AS iso3
)
SELECT 'Check 10: Digital Infrastructure Samples' AS check_name,
  c.iso3,
  c.name AS country_name,
  scs.sector_label,
  scs.display_order,
  LEFT(scs.teaser_md, 80) AS teaser_preview
FROM batch_b_countries bbc
JOIN public.souvera_countries c ON c.iso3 = bbc.iso3
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE scs.sector_key = 'digital_infrastructure'
ORDER BY c.iso3
LIMIT 5;

-- Check 11: Sample Tourism & Hospitality rows
WITH batch_b_countries AS (
  SELECT unnest(ARRAY['BDI','COM','DJI','ERI','MDG','MUS','SYC','SOM','SSD','AGO','CAF','TCD','COG','COD','GNQ','GAB','STP']) AS iso3
)
SELECT 'Check 11: Tourism & Hospitality Samples' AS check_name,
  c.iso3,
  c.name AS country_name,
  scs.sector_label,
  scs.display_order,
  LEFT(scs.teaser_md, 80) AS teaser_preview
FROM batch_b_countries bbc
JOIN public.souvera_countries c ON c.iso3 = bbc.iso3
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE scs.sector_key = 'tourism_hospitality'
ORDER BY c.iso3
LIMIT 5;

-- Check 12: Global total sector rows after Batch B execution
-- Expected: 140 (Stage 1) + 56 (Batch C) + 91 (Batch D) + 112 (Batch A) + 119 (Batch B) = 518
-- THIS IS THE FINAL STAGE 2 CHECK
SELECT 'Check 12: Global Total After Batch B (FINAL)' AS check_name,
  COUNT(*) AS actual_total,
  518 AS expected_total,
  CASE WHEN COUNT(*) = 518 THEN '✓ PASS - STAGE 2 COMPLETE' ELSE '✗ FAIL' END AS status
FROM public.souvera_country_sectors;

-- Check 13: Africa sector coverage after Batch B
-- Stage 1: 13 priority African markets
-- Batch C: 8 Southern African countries
-- Batch A: 16 North + West African countries
-- Batch B: 17 East + Central African countries
-- Total Africa: 54 countries × 7 sectors = 378 rows
WITH all_africa_stage2 AS (
  SELECT unnest(ARRAY[
    'NGA','ZAF','KEN','EGY','GHA','CIV','ETH','MAR','TZA','UGA','RWA','SEN','CMR',
    'BWA','SWZ','LSO','MWI','MOZ','NAM','ZMB','ZWE',
    'DZA','LBY','SDN','TUN','BEN','BFA','CPV','GMB','GIN','GNB','LBR','MLI','MRT','NER','SLE','TGO',
    'BDI','COM','DJI','ERI','MDG','MUS','SYC','SOM','SSD','AGO','CAF','TCD','COG','COD','GNQ','GAB','STP'
  ]) AS iso3
)
SELECT 'Check 13: Africa Coverage (COMPLETE)' AS check_name,
  COUNT(DISTINCT c.iso3) AS africa_countries_with_sectors,
  54 AS expected_countries,
  COUNT(scs.id) AS total_africa_sector_rows,
  378 AS expected_rows,
  CASE 
    WHEN COUNT(DISTINCT c.iso3) = 54 AND COUNT(scs.id) = 378
    THEN '✓ PASS - AFRICA COMPLETE' 
    ELSE '✗ FAIL' 
  END AS status
FROM all_africa_stage2 aas
JOIN public.souvera_countries c ON c.iso3 = aas.iso3
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id;

-- Check 14: All Regions sector coverage after Batch B
-- Stage 1: 20 priority markets (13 Africa + 7 Caribbean)
-- Stage 2: 54 remaining markets (41 Africa + 13 Caribbean)
-- Total: 74 markets × 7 sectors = 518 rows
WITH all_markets_stage2 AS (
  SELECT unnest(ARRAY[
    'NGA','ZAF','KEN','EGY','GHA','CIV','ETH','MAR','TZA','UGA','RWA','SEN','CMR',
    'JAM','TTO','BRB','DOM','BHS','GRD','LCA',
    'BWA','SWZ','LSO','MWI','MOZ','NAM','ZMB','ZWE',
    'ATG','CUB','DMA','HTI','KNA','VCT','SUR','GUY','BLZ','PRI','VGB','TCA','CYM',
    'DZA','LBY','SDN','TUN','BEN','BFA','CPV','GMB','GIN','GNB','LBR','MLI','MRT','NER','SLE','TGO',
    'BDI','COM','DJI','ERI','MDG','MUS','SYC','SOM','SSD','AGO','CAF','TCD','COG','COD','GNQ','GAB','STP'
  ]) AS iso3
)
SELECT 'Check 14: All Markets Coverage (COMPLETE)' AS check_name,
  COUNT(DISTINCT c.iso3) AS all_markets_with_sectors,
  74 AS expected_countries,
  COUNT(scs.id) AS total_sector_rows,
  518 AS expected_rows,
  CASE 
    WHEN COUNT(DISTINCT c.iso3) = 74 AND COUNT(scs.id) = 518
    THEN '✓ PASS - ALL 74 MARKETS COMPLETE' 
    ELSE '✗ FAIL' 
  END AS status
FROM all_markets_stage2 ams
JOIN public.souvera_countries c ON c.iso3 = ams.iso3
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id;

-- Check 15: ESH (Western Sahara) remains excluded
SELECT 'Check 15: ESH Exclusion Confirmed' AS check_name,
  COUNT(scs.id) AS esh_sector_rows,
  0 AS expected_count,
  CASE WHEN COUNT(scs.id) = 0 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM public.souvera_countries c
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 = 'ESH';

-- ===========================================
-- SUMMARY
-- ===========================================

WITH batch_b_countries AS (
  SELECT unnest(ARRAY['BDI','COM','DJI','ERI','MDG','MUS','SYC','SOM','SSD','AGO','CAF','TCD','COG','COD','GNQ','GAB','STP']) AS iso3
)
SELECT 
  'BATCH B SUMMARY (FINAL)' AS summary_section,
  COUNT(DISTINCT c.iso3) AS batch_b_countries,
  COUNT(scs.id) AS batch_b_sector_rows,
  COUNT(DISTINCT scs.sector_key) AS distinct_sector_keys,
  MIN(scs.updated_at) AS earliest_updated_at,
  MAX(scs.updated_at) AS latest_updated_at
FROM batch_b_countries bbc
JOIN public.souvera_countries c ON c.iso3 = bbc.iso3
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id;

-- ===========================================
-- STAGE 2 COMPLETION CHECK
-- ===========================================

SELECT 
  'PHASE 4A STAGE 2 COMPLETION STATUS' AS completion_check,
  (SELECT COUNT(DISTINCT country_id) FROM public.souvera_country_sectors) AS countries_with_sectors,
  74 AS target_countries,
  (SELECT COUNT(*) FROM public.souvera_country_sectors) AS total_sector_rows,
  518 AS target_rows,
  CASE 
    WHEN (SELECT COUNT(DISTINCT country_id) FROM public.souvera_country_sectors) = 74
      AND (SELECT COUNT(*) FROM public.souvera_country_sectors) = 518
    THEN '🎯 STAGE 2 COMPLETE - ALL 74 MARKETS COVERED'
    ELSE '⚠️  INCOMPLETE'
  END AS final_status;
