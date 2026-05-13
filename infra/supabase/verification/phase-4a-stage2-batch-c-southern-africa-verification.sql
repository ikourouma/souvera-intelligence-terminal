-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- VERIFICATION: PHASE 4A STAGE 2 BATCH C — SOUTHERN AFRICA
-- Owner: Afronovation, Inc.
-- Platform: Supabase Postgres
-- 
-- Purpose: Verify successful execution of Stage 2 Batch C
-- Scope: 8 Southern African countries × 7 sectors = 56 rows
-- READ-ONLY VERIFICATION (No data modifications)
-- =========================================================

-- ===========================================
-- BATCH C VERIFICATION CHECKS
-- ===========================================
--
-- Expected Results:
-- - 56 new sector rows for Southern Africa
-- - BWA, SWZ, LSO, MWI, MOZ, NAM, ZMB, ZWE
-- - Each country has exactly 7 sectors
-- - All 7 sector keys present for each country
-- - No duplicates
-- - All rows have min_plan_id = 'explorer'
-- - display_order 1-7
-- - Content completeness (teaser_md, rationale_md)
-- - ESH remains excluded (0 rows)
--
-- ===========================================

-- CHECK 1: Total Batch C rows = 56
WITH batch_c_countries AS (
  SELECT unnest(ARRAY['BWA','SWZ','LSO','MWI','MOZ','NAM','ZMB','ZWE']) AS iso3
)
SELECT 
  'CHECK 1: Total Batch C Rows' AS check_name,
  COUNT(scs.id) AS actual,
  56 AS expected,
  CASE WHEN COUNT(scs.id) = 56 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_countries c
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 IN (SELECT iso3 FROM batch_c_countries);

-- CHECK 2: Each Batch C country has exactly 7 sectors
WITH batch_c_countries AS (
  SELECT unnest(ARRAY['BWA','SWZ','LSO','MWI','MOZ','NAM','ZMB','ZWE']) AS iso3
)
SELECT 
  'CHECK 2: Sectors per Country' AS check_name,
  c.iso3,
  c.name AS country_name,
  COUNT(scs.id) AS sector_count,
  7 AS expected,
  CASE WHEN COUNT(scs.id) = 7 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_countries c
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 IN (SELECT iso3 FROM batch_c_countries)
GROUP BY c.iso3, c.name
ORDER BY c.iso3;

-- CHECK 3: All 8 Batch C countries present
WITH batch_c_countries AS (
  SELECT unnest(ARRAY['BWA','SWZ','LSO','MWI','MOZ','NAM','ZMB','ZWE']) AS iso3
)
SELECT 
  'CHECK 3: Countries Present' AS check_name,
  COUNT(DISTINCT c.iso3) AS actual,
  8 AS expected,
  CASE WHEN COUNT(DISTINCT c.iso3) = 8 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_countries c
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 IN (SELECT iso3 FROM batch_c_countries);

-- CHECK 4: All 7 sector keys present for each country
WITH batch_c_countries AS (
  SELECT unnest(ARRAY['BWA','SWZ','LSO','MWI','MOZ','NAM','ZMB','ZWE']) AS iso3
),
expected_sectors AS (
  SELECT unnest(ARRAY[
    'digital_infrastructure',
    'fintech_digital_finance',
    'energy_renewables',
    'agriculture_agribusiness',
    'mining_critical_minerals',
    'logistics_trade',
    'tourism_hospitality'
  ]) AS sector_key
)
SELECT 
  'CHECK 4: Sector Key Distribution' AS check_name,
  scs.sector_key,
  COUNT(*) AS row_count,
  8 AS expected,
  CASE WHEN COUNT(*) = 8 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_countries c
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 IN (SELECT iso3 FROM batch_c_countries)
  AND scs.sector_key IN (SELECT sector_key FROM expected_sectors)
GROUP BY scs.sector_key
ORDER BY MIN(scs.display_order);

-- CHECK 5: No duplicate sector keys per country
WITH batch_c_countries AS (
  SELECT unnest(ARRAY['BWA','SWZ','LSO','MWI','MOZ','NAM','ZMB','ZWE']) AS iso3
),
duplicates AS (
  SELECT c.iso3, c.name, scs.sector_key, COUNT(*) AS cnt
  FROM public.souvera_countries c
  JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
  WHERE c.iso3 IN (SELECT iso3 FROM batch_c_countries)
  GROUP BY c.iso3, c.name, scs.sector_key
  HAVING COUNT(*) > 1
)
SELECT 
  'CHECK 5: No Duplicates' AS check_name,
  COUNT(*) AS duplicates_found,
  0 AS expected,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM duplicates;

-- CHECK 6: All min_plan_id = 'explorer'
WITH batch_c_countries AS (
  SELECT unnest(ARRAY['BWA','SWZ','LSO','MWI','MOZ','NAM','ZMB','ZWE']) AS iso3
)
SELECT 
  'CHECK 6: min_plan_id = explorer' AS check_name,
  COUNT(*) AS actual,
  56 AS expected,
  CASE WHEN COUNT(*) = 56 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_countries c
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 IN (SELECT iso3 FROM batch_c_countries)
  AND scs.min_plan_id = 'explorer';

-- CHECK 7: display_order values 1-7
WITH batch_c_countries AS (
  SELECT unnest(ARRAY['BWA','SWZ','LSO','MWI','MOZ','NAM','ZMB','ZWE']) AS iso3
)
SELECT 
  'CHECK 7: display_order 1-7' AS check_name,
  COUNT(*) AS actual,
  56 AS expected,
  CASE WHEN COUNT(*) = 56 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_countries c
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 IN (SELECT iso3 FROM batch_c_countries)
  AND scs.display_order BETWEEN 1 AND 7;

-- CHECK 8: teaser_md present and not empty
WITH batch_c_countries AS (
  SELECT unnest(ARRAY['BWA','SWZ','LSO','MWI','MOZ','NAM','ZMB','ZWE']) AS iso3
)
SELECT 
  'CHECK 8: teaser_md completeness' AS check_name,
  COUNT(*) AS actual,
  56 AS expected,
  CASE WHEN COUNT(*) = 56 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_countries c
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 IN (SELECT iso3 FROM batch_c_countries)
  AND scs.teaser_md IS NOT NULL 
  AND scs.teaser_md != '';

-- CHECK 9: rationale_md present and not empty
WITH batch_c_countries AS (
  SELECT unnest(ARRAY['BWA','SWZ','LSO','MWI','MOZ','NAM','ZMB','ZWE']) AS iso3
)
SELECT 
  'CHECK 9: rationale_md completeness' AS check_name,
  COUNT(*) AS actual,
  56 AS expected,
  CASE WHEN COUNT(*) = 56 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_countries c
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 IN (SELECT iso3 FROM batch_c_countries)
  AND scs.rationale_md IS NOT NULL 
  AND scs.rationale_md != '';

-- CHECK 10: Sample Digital Infrastructure rows
WITH batch_c_countries AS (
  SELECT unnest(ARRAY['BWA','SWZ','LSO','MWI','MOZ','NAM','ZMB','ZWE']) AS iso3
)
SELECT 
  'CHECK 10: Sample Digital Infrastructure' AS check_name,
  c.iso3,
  c.name AS country_name,
  scs.sector_label,
  scs.strength_score,
  scs.growth_score,
  scs.display_order,
  LEFT(scs.teaser_md, 80) AS teaser_preview
FROM public.souvera_countries c
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 IN (SELECT iso3 FROM batch_c_countries)
  AND scs.sector_key = 'digital_infrastructure'
ORDER BY c.iso3;

-- CHECK 11: Sample Tourism & Hospitality rows
WITH batch_c_countries AS (
  SELECT unnest(ARRAY['BWA','SWZ','LSO','MWI','MOZ','NAM','ZMB','ZWE']) AS iso3
)
SELECT 
  'CHECK 11: Sample Tourism & Hospitality' AS check_name,
  c.iso3,
  c.name AS country_name,
  scs.sector_label,
  scs.strength_score,
  scs.growth_score,
  scs.display_order,
  LEFT(scs.teaser_md, 80) AS teaser_preview
FROM public.souvera_countries c
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 IN (SELECT iso3 FROM batch_c_countries)
  AND scs.sector_key = 'tourism_hospitality'
ORDER BY c.iso3;

-- CHECK 12: Global sanity check - total sector rows (should increase by 56 after execution)
SELECT 
  'CHECK 12: Global Total Sector Rows' AS check_name,
  COUNT(*) AS current_total,
  'Should be 140 (Stage 1) + 56 (Batch C) = 196 if this is first batch' AS note,
  CASE 
    WHEN COUNT(*) >= 196 THEN '✅ PASS (Batch C executed)' 
    WHEN COUNT(*) = 140 THEN '⚠️ PENDING (Batch C not yet executed)'
    ELSE '❓ UNEXPECTED COUNT' 
  END AS status
FROM public.souvera_country_sectors;

-- CHECK 13: ESH exclusion - Western Sahara must have 0 sector rows
SELECT 
  'CHECK 13: ESH Exclusion' AS check_name,
  COUNT(scs.id) AS esh_sector_rows,
  0 AS expected,
  CASE WHEN COUNT(scs.id) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_countries c
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 = 'ESH';

-- ===========================================
-- SUMMARY
-- ===========================================

WITH batch_c_countries AS (
  SELECT unnest(ARRAY['BWA','SWZ','LSO','MWI','MOZ','NAM','ZMB','ZWE']) AS iso3
)
SELECT 
  '=== BATCH C VERIFICATION SUMMARY ===' AS summary,
  COUNT(DISTINCT c.iso3) AS countries_with_sectors,
  COUNT(scs.id) AS total_rows,
  COUNT(DISTINCT scs.sector_key) AS unique_sector_keys,
  MIN(scs.updated_at) AS earliest_updated_at,
  MAX(scs.updated_at) AS latest_updated_at
FROM public.souvera_countries c
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 IN (SELECT iso3 FROM batch_c_countries);
