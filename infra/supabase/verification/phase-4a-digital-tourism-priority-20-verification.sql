-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- Phase 4A Stage 1 Verification
-- Digital Infrastructure + Tourism & Hospitality
-- Priority 20 Countries
-- Owner: Afronovation, Inc.
-- ===========================================
--
-- PURPOSE:
-- Verify 7-sector taxonomy expansion for 20 priority markets.
-- Expected result: 140 sector rows (20 countries × 7 sectors).
--
-- EXECUTION:
-- Run this SQL in Supabase SQL Editor after executing:
--   sql-pack-v1.12a-add-digital-tourism-priority-20.sql
--
-- EXPECTED RESULTS:
-- Total priority 20 sector rows: 140
-- Each priority country: 7 sectors
-- All 20 have digital_infrastructure
-- All 20 have tourism_hospitality
-- Sector key distribution: 20 rows per sector key
-- Display orders: 1–7
-- No duplicate sector keys per country
-- All min_plan_id = 'explorer'
-- Content present for teaser_md and rationale_md
--
-- NOTE:
-- Each query includes its own CTE definition for priority_20
-- to ensure proper scope in Supabase SQL Editor.
--
-- ===========================================

SELECT '=== PHASE 4A STAGE 1: DIGITAL INFRASTRUCTURE + TOURISM & HOSPITALITY VERIFICATION ===' AS verification_section;

-- ═══════════════════════════════════════════════════════════════════════════
-- CHECK 1: Total priority sector rows = 140 (20 countries × 7 sectors)
-- ═══════════════════════════════════════════════════════════════════════════
WITH priority_20 AS (
  SELECT unnest(ARRAY[
    'NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA',
    'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
  ]) AS iso3
)
SELECT 
  'CHECK 1: Total Priority Sector Rows' AS check_name,
  COUNT(*) AS actual_rows,
  140 AS expected_rows,
  CASE 
    WHEN COUNT(*) = 140 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS status
FROM public.souvera_country_sectors scs
JOIN public.souvera_countries sc ON scs.country_id = sc.id
WHERE sc.iso3 IN (SELECT iso3 FROM priority_20);

-- ═══════════════════════════════════════════════════════════════════════════
-- CHECK 2: Each priority country has exactly 7 sectors
-- ═══════════════════════════════════════════════════════════════════════════
WITH priority_20 AS (
  SELECT unnest(ARRAY[
    'NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA',
    'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
  ]) AS iso3
)
SELECT 
  'CHECK 2: Each Priority Country Has 7 Sectors' AS check_name,
  sc.iso3,
  sc.name AS country_name,
  COUNT(scs.id) AS sector_count,
  CASE 
    WHEN COUNT(scs.id) = 7 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS status
FROM public.souvera_countries sc
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = sc.id
WHERE sc.iso3 IN (SELECT iso3 FROM priority_20)
GROUP BY sc.iso3, sc.name
ORDER BY sc.iso3;

-- ═══════════════════════════════════════════════════════════════════════════
-- CHECK 3: All 20 priority countries have digital_infrastructure
-- ═══════════════════════════════════════════════════════════════════════════
WITH priority_20 AS (
  SELECT unnest(ARRAY[
    'NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA',
    'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
  ]) AS iso3
)
SELECT 
  'CHECK 3: Digital Infrastructure Present for All 20' AS check_name,
  COUNT(DISTINCT sc.iso3) AS countries_with_digital_infrastructure,
  20 AS expected_countries,
  CASE 
    WHEN COUNT(DISTINCT sc.iso3) = 20 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS status
FROM public.souvera_country_sectors scs
JOIN public.souvera_countries sc ON scs.country_id = sc.id
WHERE sc.iso3 IN (SELECT iso3 FROM priority_20)
  AND scs.sector_key = 'digital_infrastructure';

-- ═══════════════════════════════════════════════════════════════════════════
-- CHECK 4: All 20 priority countries have tourism_hospitality
-- ═══════════════════════════════════════════════════════════════════════════
WITH priority_20 AS (
  SELECT unnest(ARRAY[
    'NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA',
    'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
  ]) AS iso3
)
SELECT 
  'CHECK 4: Tourism & Hospitality Present for All 20' AS check_name,
  COUNT(DISTINCT sc.iso3) AS countries_with_tourism_hospitality,
  20 AS expected_countries,
  CASE 
    WHEN COUNT(DISTINCT sc.iso3) = 20 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS status
FROM public.souvera_country_sectors scs
JOIN public.souvera_countries sc ON scs.country_id = sc.id
WHERE sc.iso3 IN (SELECT iso3 FROM priority_20)
  AND scs.sector_key = 'tourism_hospitality';

-- ═══════════════════════════════════════════════════════════════════════════
-- CHECK 5: Sector key distribution = 20 rows per sector key
-- ═══════════════════════════════════════════════════════════════════════════
WITH priority_20 AS (
  SELECT unnest(ARRAY[
    'NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA',
    'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
  ]) AS iso3
)
SELECT 
  'CHECK 5: Sector Key Distribution (20 per sector)' AS check_name,
  scs.sector_key,
  scs.sector_label,
  COUNT(*) AS row_count,
  CASE 
    WHEN COUNT(*) = 20 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS status
FROM public.souvera_country_sectors scs
JOIN public.souvera_countries sc ON scs.country_id = sc.id
WHERE sc.iso3 IN (SELECT iso3 FROM priority_20)
GROUP BY scs.sector_key, scs.sector_label
ORDER BY scs.sector_key;

-- ═══════════════════════════════════════════════════════════════════════════
-- CHECK 6: Display order values 1–7 correctly assigned
-- ═══════════════════════════════════════════════════════════════════════════
WITH priority_20 AS (
  SELECT unnest(ARRAY[
    'NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA',
    'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
  ]) AS iso3
)
SELECT 
  'CHECK 6: Display Order Distribution' AS check_name,
  scs.display_order,
  COUNT(*) AS row_count,
  20 AS expected_per_display_order,
  CASE 
    WHEN COUNT(*) = 20 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS status
FROM public.souvera_country_sectors scs
JOIN public.souvera_countries sc ON scs.country_id = sc.id
WHERE sc.iso3 IN (SELECT iso3 FROM priority_20)
GROUP BY scs.display_order
ORDER BY scs.display_order;

-- ═══════════════════════════════════════════════════════════════════════════
-- CHECK 7: No duplicate sector keys per country
-- ═══════════════════════════════════════════════════════════════════════════
WITH priority_20 AS (
  SELECT unnest(ARRAY[
    'NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA',
    'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
  ]) AS iso3
)
SELECT 
  'CHECK 7: No Duplicate Sector Keys Per Country' AS check_name,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ PASS - No duplicates found'
    ELSE '✗ FAIL - Duplicates detected'
  END AS status,
  COUNT(*) AS duplicate_count
FROM (
  SELECT sc.iso3, scs.sector_key, COUNT(*) AS occurrences
  FROM public.souvera_country_sectors scs
  JOIN public.souvera_countries sc ON scs.country_id = sc.id
  WHERE sc.iso3 IN (SELECT iso3 FROM priority_20)
  GROUP BY sc.iso3, scs.sector_key
  HAVING COUNT(*) > 1
) duplicates;

-- ═══════════════════════════════════════════════════════════════════════════
-- CHECK 8: All min_plan_id = 'explorer'
-- ═══════════════════════════════════════════════════════════════════════════
WITH priority_20 AS (
  SELECT unnest(ARRAY[
    'NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA',
    'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
  ]) AS iso3
)
SELECT 
  'CHECK 8: All min_plan_id = explorer' AS check_name,
  COUNT(*) AS total_rows,
  SUM(CASE WHEN scs.min_plan_id = 'explorer' THEN 1 ELSE 0 END) AS explorer_count,
  CASE 
    WHEN COUNT(*) = SUM(CASE WHEN scs.min_plan_id = 'explorer' THEN 1 ELSE 0 END) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS status
FROM public.souvera_country_sectors scs
JOIN public.souvera_countries sc ON scs.country_id = sc.id
WHERE sc.iso3 IN (SELECT iso3 FROM priority_20);

-- ═══════════════════════════════════════════════════════════════════════════
-- CHECK 9: teaser_md and rationale_md present (non-empty)
-- ═══════════════════════════════════════════════════════════════════════════
WITH priority_20 AS (
  SELECT unnest(ARRAY[
    'NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA',
    'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
  ]) AS iso3
)
SELECT 
  'CHECK 9: Content Present (teaser_md and rationale_md)' AS check_name,
  COUNT(*) AS total_rows,
  SUM(CASE WHEN scs.teaser_md IS NOT NULL AND LENGTH(scs.teaser_md) > 0 THEN 1 ELSE 0 END) AS teaser_present_count,
  SUM(CASE WHEN scs.rationale_md IS NOT NULL AND LENGTH(scs.rationale_md) > 0 THEN 1 ELSE 0 END) AS rationale_present_count,
  CASE 
    WHEN COUNT(*) = SUM(CASE WHEN scs.teaser_md IS NOT NULL AND LENGTH(scs.teaser_md) > 0 THEN 1 ELSE 0 END)
     AND COUNT(*) = SUM(CASE WHEN scs.rationale_md IS NOT NULL AND LENGTH(scs.rationale_md) > 0 THEN 1 ELSE 0 END)
    THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS status
FROM public.souvera_country_sectors scs
JOIN public.souvera_countries sc ON scs.country_id = sc.id
WHERE sc.iso3 IN (SELECT iso3 FROM priority_20);

-- ═══════════════════════════════════════════════════════════════════════════
-- CHECK 10: Sample rows for Digital Infrastructure
-- ═══════════════════════════════════════════════════════════════════════════
WITH priority_20 AS (
  SELECT unnest(ARRAY[
    'NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA',
    'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
  ]) AS iso3
)
SELECT 
  'CHECK 10: Digital Infrastructure Sample Rows' AS check_name,
  sc.iso3,
  sc.name AS country_name,
  scs.sector_key,
  scs.sector_label,
  scs.display_order,
  scs.strength_score,
  scs.growth_score,
  LEFT(scs.teaser_md, 80) || '...' AS teaser_preview
FROM public.souvera_country_sectors scs
JOIN public.souvera_countries sc ON scs.country_id = sc.id
WHERE sc.iso3 IN (SELECT iso3 FROM priority_20)
  AND scs.sector_key = 'digital_infrastructure'
ORDER BY sc.iso3
LIMIT 5;

-- ═══════════════════════════════════════════════════════════════════════════
-- CHECK 11: Sample rows for Tourism & Hospitality
-- ═══════════════════════════════════════════════════════════════════════════
WITH priority_20 AS (
  SELECT unnest(ARRAY[
    'NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA',
    'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
  ]) AS iso3
)
SELECT 
  'CHECK 11: Tourism & Hospitality Sample Rows' AS check_name,
  sc.iso3,
  sc.name AS country_name,
  scs.sector_key,
  scs.sector_label,
  scs.display_order,
  scs.strength_score,
  scs.growth_score,
  LEFT(scs.teaser_md, 80) || '...' AS teaser_preview
FROM public.souvera_country_sectors scs
JOIN public.souvera_countries sc ON scs.country_id = sc.id
WHERE sc.iso3 IN (SELECT iso3 FROM priority_20)
  AND scs.sector_key = 'tourism_hospitality'
ORDER BY sc.iso3
LIMIT 5;

-- ═══════════════════════════════════════════════════════════════════════════
-- SUMMARY: Verification complete
-- ═══════════════════════════════════════════════════════════════════════════
SELECT '=== VERIFICATION COMPLETE ===' AS summary;

SELECT 
  'Expected Result' AS metric,
  '140 sector rows (20 countries × 7 sectors)' AS value;

WITH priority_20 AS (
  SELECT unnest(ARRAY[
    'NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA',
    'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
  ]) AS iso3
)
SELECT 
  'Current Status' AS metric,
  COUNT(*) || ' sector rows across ' || COUNT(DISTINCT sc.iso3) || ' priority countries' AS value
FROM public.souvera_country_sectors scs
JOIN public.souvera_countries sc ON scs.country_id = sc.id
WHERE sc.iso3 IN (SELECT iso3 FROM priority_20);
