-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- VERIFICATION SCRIPT: PHASE 4A STAGE 2 — BATCH D
-- Caribbean Remaining (13 countries × 7 sectors = 91 rows)
-- =========================================================

-- ===========================================
-- VERIFICATION CHECKS
-- ===========================================
--
-- This script validates Phase 4A Stage 2 Batch D seed data:
-- - 13 Caribbean countries/territories
-- - 7 sectors per country
-- - 91 total new rows
-- - Expected global total after execution: 287 rows
--
-- Read-only verification. Safe to run repeatedly.
-- ===========================================

-- Check 1: Total Batch D rows = 91
SELECT 'Check 1: Total Batch D Rows' AS check_name,
  COUNT(*) AS actual_count,
  91 AS expected_count,
  CASE WHEN COUNT(*) = 91 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM public.souvera_country_sectors scs
JOIN public.souvera_countries c ON c.id = scs.country_id
WHERE c.iso3 = ANY(ARRAY['ATG','CUB','DMA','HTI','KNA','VCT','SUR','GUY','BLZ','PRI','VGB','TCA','CYM']);

-- Check 2: Each Batch D country has exactly 7 sectors
WITH batch_d_countries AS (
  SELECT unnest(ARRAY['ATG','CUB','DMA','HTI','KNA','VCT','SUR','GUY','BLZ','PRI','VGB','TCA','CYM']) AS iso3
)
SELECT 'Check 2: Sectors Per Country' AS check_name,
  c.iso3,
  c.name AS country_name,
  COUNT(scs.id) AS sector_count,
  CASE WHEN COUNT(scs.id) = 7 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_d_countries bdc
JOIN public.souvera_countries c ON c.iso3 = bdc.iso3
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
GROUP BY c.iso3, c.name
ORDER BY c.iso3;

-- Check 3: All 13 Batch D countries present in database
WITH batch_d_countries AS (
  SELECT unnest(ARRAY['ATG','CUB','DMA','HTI','KNA','VCT','SUR','GUY','BLZ','PRI','VGB','TCA','CYM']) AS iso3
)
SELECT 'Check 3: All Batch D Countries Present' AS check_name,
  COUNT(DISTINCT c.iso3) AS actual_count,
  13 AS expected_count,
  CASE WHEN COUNT(DISTINCT c.iso3) = 13 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_d_countries bdc
JOIN public.souvera_countries c ON c.iso3 = bdc.iso3;

-- Check 4: All 7 sector keys present for each country
WITH batch_d_countries AS (
  SELECT unnest(ARRAY['ATG','CUB','DMA','HTI','KNA','VCT','SUR','GUY','BLZ','PRI','VGB','TCA','CYM']) AS iso3
)
SELECT 'Check 4: All Sector Keys Per Country' AS check_name,
  c.iso3,
  c.name AS country_name,
  COUNT(DISTINCT scs.sector_key) AS distinct_sectors,
  CASE WHEN COUNT(DISTINCT scs.sector_key) = 7 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_d_countries bdc
JOIN public.souvera_countries c ON c.iso3 = bdc.iso3
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
GROUP BY c.iso3, c.name
ORDER BY c.iso3;

-- Check 5: No duplicate sector keys per country
WITH batch_d_countries AS (
  SELECT unnest(ARRAY['ATG','CUB','DMA','HTI','KNA','VCT','SUR','GUY','BLZ','PRI','VGB','TCA','CYM']) AS iso3
)
SELECT 'Check 5: No Duplicate Sector Keys' AS check_name,
  c.iso3,
  c.name AS country_name,
  scs.sector_key,
  COUNT(*) AS duplicate_count,
  CASE WHEN COUNT(*) = 1 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_d_countries bdc
JOIN public.souvera_countries c ON c.iso3 = bdc.iso3
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
GROUP BY c.iso3, c.name, scs.sector_key
HAVING COUNT(*) > 1
ORDER BY c.iso3, scs.sector_key;

-- Check 6: All Batch D rows have min_plan_id = 'explorer'
WITH batch_d_countries AS (
  SELECT unnest(ARRAY['ATG','CUB','DMA','HTI','KNA','VCT','SUR','GUY','BLZ','PRI','VGB','TCA','CYM']) AS iso3
)
SELECT 'Check 6: Min Plan ID = Explorer' AS check_name,
  COUNT(*) AS rows_with_explorer,
  91 AS expected_count,
  CASE WHEN COUNT(*) = 91 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_d_countries bdc
JOIN public.souvera_countries c ON c.iso3 = bdc.iso3
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE scs.min_plan_id = 'explorer';

-- Check 7: Display order values are 1-7
WITH batch_d_countries AS (
  SELECT unnest(ARRAY['ATG','CUB','DMA','HTI','KNA','VCT','SUR','GUY','BLZ','PRI','VGB','TCA','CYM']) AS iso3
)
SELECT 'Check 7: Display Order Values' AS check_name,
  scs.display_order,
  COUNT(*) AS row_count,
  CASE WHEN scs.display_order BETWEEN 1 AND 7 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_d_countries bdc
JOIN public.souvera_countries c ON c.iso3 = bdc.iso3
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
GROUP BY scs.display_order
ORDER BY scs.display_order;

-- Check 8: All rows have teaser_md populated
WITH batch_d_countries AS (
  SELECT unnest(ARRAY['ATG','CUB','DMA','HTI','KNA','VCT','SUR','GUY','BLZ','PRI','VGB','TCA','CYM']) AS iso3
)
SELECT 'Check 8: Teaser MD Populated' AS check_name,
  COUNT(*) AS rows_with_teaser,
  91 AS expected_count,
  CASE WHEN COUNT(*) = 91 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_d_countries bdc
JOIN public.souvera_countries c ON c.iso3 = bdc.iso3
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE scs.teaser_md IS NOT NULL 
  AND LENGTH(scs.teaser_md) > 0;

-- Check 9: All rows have rationale_md populated
WITH batch_d_countries AS (
  SELECT unnest(ARRAY['ATG','CUB','DMA','HTI','KNA','VCT','SUR','GUY','BLZ','PRI','VGB','TCA','CYM']) AS iso3
)
SELECT 'Check 9: Rationale MD Populated' AS check_name,
  COUNT(*) AS rows_with_rationale,
  91 AS expected_count,
  CASE WHEN COUNT(*) = 91 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM batch_d_countries bdc
JOIN public.souvera_countries c ON c.iso3 = bdc.iso3
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE scs.rationale_md IS NOT NULL 
  AND LENGTH(scs.rationale_md) > 0;

-- Check 10: Sample Digital Infrastructure rows
WITH batch_d_countries AS (
  SELECT unnest(ARRAY['ATG','CUB','DMA','HTI','KNA','VCT','SUR','GUY','BLZ','PRI','VGB','TCA','CYM']) AS iso3
)
SELECT 'Check 10: Digital Infrastructure Samples' AS check_name,
  c.iso3,
  c.name AS country_name,
  scs.sector_label,
  scs.display_order,
  LEFT(scs.teaser_md, 80) AS teaser_preview
FROM batch_d_countries bdc
JOIN public.souvera_countries c ON c.iso3 = bdc.iso3
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE scs.sector_key = 'digital_infrastructure'
ORDER BY c.iso3
LIMIT 5;

-- Check 11: Sample Tourism & Hospitality rows
WITH batch_d_countries AS (
  SELECT unnest(ARRAY['ATG','CUB','DMA','HTI','KNA','VCT','SUR','GUY','BLZ','PRI','VGB','TCA','CYM']) AS iso3
)
SELECT 'Check 11: Tourism & Hospitality Samples' AS check_name,
  c.iso3,
  c.name AS country_name,
  scs.sector_label,
  scs.display_order,
  LEFT(scs.teaser_md, 80) AS teaser_preview
FROM batch_d_countries bdc
JOIN public.souvera_countries c ON c.iso3 = bdc.iso3
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE scs.sector_key = 'tourism_hospitality'
ORDER BY c.iso3
LIMIT 5;

-- Check 12: Global total sector rows after Batch D execution
-- Expected: 140 (Stage 1) + 56 (Batch C) + 91 (Batch D) = 287
SELECT 'Check 12: Global Total After Batch D' AS check_name,
  COUNT(*) AS actual_total,
  287 AS expected_total,
  CASE WHEN COUNT(*) = 287 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM public.souvera_country_sectors;

-- Check 13: Caribbean sector coverage breakdown
-- Stage 1 covered 7 priority Caribbean markets (JAM, TTO, BRB, DOM, BHS, GRD, LCA)
-- Batch D covers 13 remaining Caribbean markets
-- Total Caribbean should have 20 countries × 7 sectors = 140 rows
WITH approved_caribbean AS (
  SELECT unnest(ARRAY[
    'JAM','TTO','BRB','DOM','BHS','GRD','LCA',
    'ATG','CUB','DMA','HTI','KNA','VCT','SUR','GUY','BLZ','PRI','VGB','TCA','CYM'
  ]) AS iso3
)
SELECT 'Check 13: Caribbean Coverage' AS check_name,
  COUNT(DISTINCT c.iso3) AS caribbean_countries_with_sectors,
  20 AS expected_countries,
  COUNT(scs.id) AS total_caribbean_sector_rows,
  140 AS expected_rows,
  CASE 
    WHEN COUNT(DISTINCT c.iso3) = 20 AND COUNT(scs.id) = 140 
    THEN '✓ PASS' 
    ELSE '✗ FAIL' 
  END AS status
FROM approved_caribbean ac
JOIN public.souvera_countries c ON c.iso3 = ac.iso3
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id;

-- Check 14: ESH (Western Sahara) remains excluded
SELECT 'Check 14: ESH Exclusion Confirmed' AS check_name,
  COUNT(scs.id) AS esh_sector_rows,
  0 AS expected_count,
  CASE WHEN COUNT(scs.id) = 0 THEN '✓ PASS' ELSE '✗ FAIL' END AS status
FROM public.souvera_countries c
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 = 'ESH';

-- ===========================================
-- SUMMARY
-- ===========================================

WITH batch_d_countries AS (
  SELECT unnest(ARRAY['ATG','CUB','DMA','HTI','KNA','VCT','SUR','GUY','BLZ','PRI','VGB','TCA','CYM']) AS iso3
)
SELECT 
  'BATCH D SUMMARY' AS summary_section,
  COUNT(DISTINCT c.iso3) AS batch_d_countries,
  COUNT(scs.id) AS batch_d_sector_rows,
  COUNT(DISTINCT scs.sector_key) AS distinct_sector_keys,
  MIN(scs.updated_at) AS earliest_updated_at,
  MAX(scs.updated_at) AS latest_updated_at
FROM batch_d_countries bdc
JOIN public.souvera_countries c ON c.iso3 = bdc.iso3
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id;
