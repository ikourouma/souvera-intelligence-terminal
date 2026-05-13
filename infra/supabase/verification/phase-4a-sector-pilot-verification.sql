-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- Phase 4A — DATA-SEED-01 Pilot Verification
-- Sector Seeding Verification Queries
-- Owner: Afronovation, Inc.
-- ===========================================
--
-- PURPOSE:
-- Verify that sector data was correctly seeded for the 5 pilot countries:
--   - NGA (Nigeria)
--   - ZAF (South Africa)
--   - KEN (Kenya)
--   - JAM (Jamaica)
--   - TTO (Trinidad and Tobago)
--
-- EXECUTION:
-- Run this SQL in Supabase SQL Editor AFTER running:
--   infra/supabase/sql-pack-v1.11a-seed-sectors-pilot.sql
--
-- EXPECTED RESULTS:
-- - Total sector rows: 25 (5 countries × 5 sectors)
-- - Each pilot country: exactly 5 sector rows
-- - No duplicate sector_key per country
-- - All sectors have display_order 1-5
-- - All sectors have min_plan_id = 'explorer'
-- - Strength and growth scores are non-null
--
-- NOTE:
-- Supabase SQL Editor does not support psql meta-commands (\echo, \set, etc).
-- This script uses SELECT statements for labels and standard SQL comments only.
--
-- ===========================================

-- ===========================================
-- Phase 4A — DATA-SEED-01 Pilot Verification
-- Sector Seeding Validation
-- ===========================================

-- ───────────────────────────────────────────────────────────────────────────
-- Query 1: Total Sector Rows for Pilot Countries
-- Expected: 25 rows
-- ───────────────────────────────────────────────────────────────────────────

SELECT '1. Total sector rows for pilot countries (expected: 25)' AS verification_check;

SELECT 
  COUNT(*) AS total_pilot_sectors
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'JAM', 'TTO');

-- ───────────────────────────────────────────────────────────────────────────
-- Query 2: Sector Count by Pilot Country
-- Expected: 5 sectors per country
-- ───────────────────────────────────────────────────────────────────────────

SELECT '2. Sector count by pilot country (expected: 5 per country)' AS verification_check;

SELECT 
  c.iso3,
  c.name,
  COUNT(s.id) AS sector_count
FROM public.souvera_countries AS c
LEFT JOIN public.souvera_country_sectors AS s ON c.id = s.country_id
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'JAM', 'TTO')
GROUP BY c.iso3, c.name
ORDER BY c.iso3;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 3: Missing Pilot Countries
-- Expected: 0 rows (all 5 pilot countries should have sector data)
-- ───────────────────────────────────────────────────────────────────────────

SELECT '3. Missing pilot countries (expected: 0 rows)' AS verification_check;

SELECT 
  c.iso3,
  c.name
FROM public.souvera_countries AS c
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'JAM', 'TTO')
AND NOT EXISTS (
  SELECT 1 FROM public.souvera_country_sectors AS s WHERE s.country_id = c.id
);

-- ───────────────────────────────────────────────────────────────────────────
-- Query 4: Duplicate Sector Keys per Country
-- Expected: 0 rows
-- ───────────────────────────────────────────────────────────────────────────

SELECT '4. Duplicate sector keys per country (expected: 0 rows)' AS verification_check;

SELECT 
  c.iso3,
  c.name,
  s.sector_key,
  COUNT(*) AS duplicate_count
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'JAM', 'TTO')
GROUP BY c.iso3, c.name, s.sector_key
HAVING COUNT(*) > 1;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 5: Sample Sector Rows for Nigeria (NGA)
-- Expected: 5 rows with distinct sector_key and display_order 1-5
-- ───────────────────────────────────────────────────────────────────────────

SELECT '5. Sample sector rows for Nigeria (NGA)' AS verification_check;

SELECT 
  s.sector_key,
  s.sector_label,
  s.display_order,
  s.strength_score,
  s.growth_score,
  s.min_plan_id,
  LENGTH(s.teaser_md) AS teaser_length,
  LENGTH(s.rationale_md) AS rationale_length
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 = 'NGA'
ORDER BY s.display_order;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 6: Sample Sector Rows for South Africa (ZAF)
-- Expected: 5 rows with distinct sector_key and display_order 1-5
-- ───────────────────────────────────────────────────────────────────────────

SELECT '6. Sample sector rows for South Africa (ZAF)' AS verification_check;

SELECT 
  s.sector_key,
  s.sector_label,
  s.display_order,
  s.strength_score,
  s.growth_score,
  s.min_plan_id,
  LENGTH(s.teaser_md) AS teaser_length,
  LENGTH(s.rationale_md) AS rationale_length
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 = 'ZAF'
ORDER BY s.display_order;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 7: Sample Sector Rows for Kenya (KEN)
-- Expected: 5 rows with distinct sector_key and display_order 1-5
-- ───────────────────────────────────────────────────────────────────────────

SELECT '7. Sample sector rows for Kenya (KEN)' AS verification_check;

SELECT 
  s.sector_key,
  s.sector_label,
  s.display_order,
  s.strength_score,
  s.growth_score,
  s.min_plan_id,
  LENGTH(s.teaser_md) AS teaser_length,
  LENGTH(s.rationale_md) AS rationale_length
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 = 'KEN'
ORDER BY s.display_order;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 8: Sample Sector Rows for Jamaica (JAM)
-- Expected: 5 rows with distinct sector_key and display_order 1-5
-- ───────────────────────────────────────────────────────────────────────────

SELECT '8. Sample sector rows for Jamaica (JAM)' AS verification_check;

SELECT 
  s.sector_key,
  s.sector_label,
  s.display_order,
  s.strength_score,
  s.growth_score,
  s.min_plan_id,
  LENGTH(s.teaser_md) AS teaser_length,
  LENGTH(s.rationale_md) AS rationale_length
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 = 'JAM'
ORDER BY s.display_order;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 9: Sample Sector Rows for Trinidad and Tobago (TTO)
-- Expected: 5 rows with distinct sector_key and display_order 1-5
-- ───────────────────────────────────────────────────────────────────────────

SELECT '9. Sample sector rows for Trinidad and Tobago (TTO)' AS verification_check;

SELECT 
  s.sector_key,
  s.sector_label,
  s.display_order,
  s.strength_score,
  s.growth_score,
  s.min_plan_id,
  LENGTH(s.teaser_md) AS teaser_length,
  LENGTH(s.rationale_md) AS rationale_length
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 = 'TTO'
ORDER BY s.display_order;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 10: Sector Label Consistency Check
-- Expected: 5 distinct sector labels across all pilot countries
-- ───────────────────────────────────────────────────────────────────────────

SELECT '10. Sector label consistency (expected: 5 distinct labels)' AS verification_check;

SELECT 
  s.sector_label,
  COUNT(DISTINCT c.iso3) AS country_count
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'JAM', 'TTO')
GROUP BY s.sector_label
ORDER BY s.sector_label;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 11: Display Order Validation
-- Expected: Each country has display_order 1, 2, 3, 4, 5 (no gaps, no duplicates)
-- ───────────────────────────────────────────────────────────────────────────

SELECT '11. Display order validation (expected: 1-5 per country, no gaps)' AS verification_check;

SELECT 
  c.iso3,
  c.name,
  array_agg(s.display_order ORDER BY s.display_order) AS display_orders
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'JAM', 'TTO')
GROUP BY c.iso3, c.name
ORDER BY c.iso3;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 12: min_plan_id Consistency Check
-- Expected: All sectors have min_plan_id = 'explorer'
-- ───────────────────────────────────────────────────────────────────────────

SELECT '12. min_plan_id consistency (expected: all explorer)' AS verification_check;

SELECT 
  c.iso3,
  s.min_plan_id,
  COUNT(*) AS sector_count
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'JAM', 'TTO')
GROUP BY c.iso3, s.min_plan_id
ORDER BY c.iso3, s.min_plan_id;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 13: Strength and Growth Score Ranges
-- Expected: All scores between 0-100, no nulls
-- ───────────────────────────────────────────────────────────────────────────

SELECT '13. Strength and growth score ranges (expected: 0-100, no nulls)' AS verification_check;

SELECT 
  c.iso3,
  MIN(s.strength_score) AS min_strength,
  MAX(s.strength_score) AS max_strength,
  MIN(s.growth_score) AS min_growth,
  MAX(s.growth_score) AS max_growth,
  COUNT(*) FILTER (WHERE s.strength_score IS NULL) AS null_strength_count,
  COUNT(*) FILTER (WHERE s.growth_score IS NULL) AS null_growth_count
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'JAM', 'TTO')
GROUP BY c.iso3
ORDER BY c.iso3;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 14: Teaser and Rationale Content Length Check
-- Expected: teaser_md < rationale_md in length; both non-null
-- ───────────────────────────────────────────────────────────────────────────

SELECT '14. Teaser and rationale content validation' AS verification_check;

SELECT 
  c.iso3,
  s.sector_key,
  LENGTH(s.teaser_md) AS teaser_length,
  LENGTH(s.rationale_md) AS rationale_length,
  CASE 
    WHEN s.teaser_md IS NULL THEN 'teaser_null'
    WHEN s.rationale_md IS NULL THEN 'rationale_null'
    WHEN LENGTH(s.teaser_md) >= LENGTH(s.rationale_md) THEN 'teaser_longer_than_rationale'
    ELSE 'ok'
  END AS validation_status
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'JAM', 'TTO')
ORDER BY c.iso3, s.display_order;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 15: Entitlement Readiness Check (Explorer vs Professional)
-- Confirm sectors are visible and rationale_md is present
-- ───────────────────────────────────────────────────────────────────────────

SELECT '15. Entitlement readiness check' AS verification_check;

SELECT 
  c.iso3,
  c.name,
  COUNT(*) AS total_sectors,
  COUNT(*) FILTER (WHERE s.teaser_md IS NOT NULL) AS sectors_with_teaser,
  COUNT(*) FILTER (WHERE s.rationale_md IS NOT NULL) AS sectors_with_rationale,
  COUNT(*) FILTER (WHERE s.min_plan_id = 'explorer') AS explorer_visible
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'JAM', 'TTO')
GROUP BY c.iso3, c.name
ORDER BY c.iso3;

-- ===========================================
-- Phase 4A — DATA-SEED-01 Pilot Verification Complete
-- ===========================================
--
-- Expected Results Summary:
--   - Total pilot sectors: 25
--   - Sectors per country: 5
--   - Duplicate sector keys: 0
--   - Display order: 1-5 per country (no gaps)
--   - min_plan_id: all 'explorer'
--   - Strength/growth scores: 0-100, no nulls
--   - Teaser shorter than rationale
--   - All sectors have teaser_md and rationale_md
--
-- If all checks pass, proceed to browser QA.
-- See: docs/qa/phase-4a-data-seed-01-pilot-implementation.md
-- ===========================================
