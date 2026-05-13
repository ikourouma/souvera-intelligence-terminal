-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- Phase 4A — DATA-SEED-01 Priority 20 Verification
-- Sector Seeding Verification Queries (20 Countries)
-- Owner: Afronovation, Inc.
-- ===========================================
--
-- PURPOSE:
-- Verify that sector data was correctly seeded for all 20 priority markets.
--
-- PILOT COUNTRIES (5):
--   NGA, ZAF, KEN, JAM, TTO
--
-- EXPANSION COUNTRIES (15):
--   Africa: EGY, GHA, CIV, ETH, MAR, TZA, UGA, RWA, SEN, CMR
--   Caribbean: BRB, DOM, BHS, GRD, LCA
--
-- EXECUTION:
-- Run this SQL in Supabase SQL Editor AFTER running:
--   infra/supabase/sql-pack-v1.11b-seed-sectors-priority-20.sql
--
-- EXPECTED RESULTS:
-- - Total sector rows: 100 (20 countries × 5 sectors)
-- - Each country: exactly 5 sector rows
-- - No duplicate sector_key per country
-- - All sectors have display_order 1-5
-- - All sectors have min_plan_id = 'explorer'
-- - Strength and growth scores are non-null
--
-- NOTE:
-- Supabase SQL Editor does not support psql meta-commands.
-- This script uses SELECT statements for labels and standard SQL comments only.
--
-- ===========================================

-- ===========================================
-- Phase 4A — DATA-SEED-01 Priority 20 Verification
-- ===========================================

SELECT '=== Priority 20 Verification Start ===' AS status;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 1: Total Sector Rows for All 20 Priority Countries
-- Expected: 100 rows
-- ───────────────────────────────────────────────────────────────────────────

SELECT '1. Total sector rows for 20 priority countries (expected: 100)' AS verification_check;

SELECT 
  COUNT(*) AS total_priority_sectors
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 IN (
  'NGA', 'ZAF', 'KEN', 'JAM', 'TTO',
  'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR',
  'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
);

-- ───────────────────────────────────────────────────────────────────────────
-- Query 2: Sector Count by Country
-- Expected: 5 sectors per country (20 rows total)
-- ───────────────────────────────────────────────────────────────────────────

SELECT '2. Sector count by country (expected: 5 per country, 20 countries)' AS verification_check;

SELECT 
  c.iso3,
  c.name,
  COUNT(s.id) AS sector_count
FROM public.souvera_countries AS c
LEFT JOIN public.souvera_country_sectors AS s ON c.id = s.country_id
WHERE c.iso3 IN (
  'NGA', 'ZAF', 'KEN', 'JAM', 'TTO',
  'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR',
  'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
)
GROUP BY c.iso3, c.name
ORDER BY c.iso3;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 3: Missing Priority Countries
-- Expected: 0 rows
-- ───────────────────────────────────────────────────────────────────────────

SELECT '3. Missing priority countries (expected: 0 rows)' AS verification_check;

SELECT 
  c.iso3,
  c.name
FROM public.souvera_countries AS c
WHERE c.iso3 IN (
  'NGA', 'ZAF', 'KEN', 'JAM', 'TTO',
  'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR',
  'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
)
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
WHERE c.iso3 IN (
  'NGA', 'ZAF', 'KEN', 'JAM', 'TTO',
  'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR',
  'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
)
GROUP BY c.iso3, c.name, s.sector_key
HAVING COUNT(*) > 1;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 5: Sector Label Consistency
-- Expected: 5 distinct labels, 20 countries per label
-- ───────────────────────────────────────────────────────────────────────────

SELECT '5. Sector label consistency (expected: 5 labels, 20 countries each)' AS verification_check;

SELECT 
  s.sector_label,
  COUNT(DISTINCT c.iso3) AS country_count
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 IN (
  'NGA', 'ZAF', 'KEN', 'JAM', 'TTO',
  'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR',
  'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
)
GROUP BY s.sector_label
ORDER BY s.sector_label;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 6: Display Order Validation
-- Expected: Each country has [1,2,3,4,5]
-- ───────────────────────────────────────────────────────────────────────────

SELECT '6. Display order validation (expected: 1-5 per country)' AS verification_check;

SELECT 
  c.iso3,
  c.name,
  array_agg(s.display_order ORDER BY s.display_order) AS display_orders
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 IN (
  'NGA', 'ZAF', 'KEN', 'JAM', 'TTO',
  'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR',
  'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
)
GROUP BY c.iso3, c.name
ORDER BY c.iso3;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 7: min_plan_id Consistency
-- Expected: All 'explorer', 100 total
-- ───────────────────────────────────────────────────────────────────────────

SELECT '7. min_plan_id consistency (expected: all explorer)' AS verification_check;

SELECT 
  s.min_plan_id,
  COUNT(*) AS sector_count
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 IN (
  'NGA', 'ZAF', 'KEN', 'JAM', 'TTO',
  'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR',
  'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
)
GROUP BY s.min_plan_id;

-- ───────────────────────────────────────────────────────────────────────────
-- Query 8: Strength and Growth Score Ranges
-- Expected: 0-100, no nulls
-- ───────────────────────────────────────────────────────────────────────────

SELECT '8. Strength and growth score ranges (expected: 0-100, no nulls)' AS verification_check;

SELECT 
  MIN(s.strength_score) AS min_strength,
  MAX(s.strength_score) AS max_strength,
  MIN(s.growth_score) AS min_growth,
  MAX(s.growth_score) AS max_growth,
  COUNT(*) FILTER (WHERE s.strength_score IS NULL) AS null_strength_count,
  COUNT(*) FILTER (WHERE s.growth_score IS NULL) AS null_growth_count,
  COUNT(*) AS total_sectors
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 IN (
  'NGA', 'ZAF', 'KEN', 'JAM', 'TTO',
  'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR',
  'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
);

-- ───────────────────────────────────────────────────────────────────────────
-- Query 9: Content Presence Validation
-- Expected: All sectors have teaser_md and rationale_md
-- ───────────────────────────────────────────────────────────────────────────

SELECT '9. Content presence (expected: 100 with teaser and rationale)' AS verification_check;

SELECT 
  COUNT(*) AS total_sectors,
  COUNT(*) FILTER (WHERE s.teaser_md IS NOT NULL AND LENGTH(s.teaser_md) > 50) AS sectors_with_teaser,
  COUNT(*) FILTER (WHERE s.rationale_md IS NOT NULL AND LENGTH(s.rationale_md) > 200) AS sectors_with_rationale,
  COUNT(*) FILTER (WHERE s.teaser_md IS NULL OR s.rationale_md IS NULL) AS sectors_missing_content
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 IN (
  'NGA', 'ZAF', 'KEN', 'JAM', 'TTO',
  'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR',
  'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
);

-- ───────────────────────────────────────────────────────────────────────────
-- Query 10: Pilot vs Expansion Country Breakdown
-- Expected: 5 pilot + 15 expansion = 20 total
-- ───────────────────────────────────────────────────────────────────────────

SELECT '10. Pilot vs expansion country breakdown' AS verification_check;

SELECT 
  CASE 
    WHEN c.iso3 IN ('NGA', 'ZAF', 'KEN', 'JAM', 'TTO') THEN 'Pilot'
    ELSE 'Expansion'
  END AS cohort,
  COUNT(DISTINCT c.iso3) AS country_count,
  COUNT(s.id) AS sector_count
FROM public.souvera_country_sectors AS s
JOIN public.souvera_countries AS c ON s.country_id = c.id
WHERE c.iso3 IN (
  'NGA', 'ZAF', 'KEN', 'JAM', 'TTO',
  'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR',
  'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
)
GROUP BY cohort
ORDER BY cohort;

SELECT '=== Priority 20 Verification Complete ===' AS status;

-- ===========================================
-- Expected Results Summary:
--   - Total sectors: 100
--   - Countries: 20 (5 pilot + 15 expansion)
--   - Sectors per country: 5
--   - Duplicate sector keys: 0
--   - Display orders: [1,2,3,4,5] per country
--   - min_plan_id: all 'explorer'
--   - Strength/growth scores: 0-100, no nulls
--   - Content: all have teaser + rationale
--
-- If all checks pass, proceed to browser QA.
-- ===========================================
