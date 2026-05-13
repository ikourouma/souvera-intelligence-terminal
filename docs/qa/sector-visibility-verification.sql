-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- Sector Visibility Verification SQL
-- Owner: Afronovation, Inc.
-- 
-- Purpose: Verify sector data seeding status and diagnose
-- sector visibility issues in the country intelligence panel.
--
-- Related: docs/audits/sector-visibility-debug.md
-- =========================================================

-- =========================================================
-- PRE-SEEDING CHECKS
-- Run these before implementing DATA-SEED-01
-- =========================================================

-- 1. Verify souvera_country_sectors table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'souvera_country_sectors'
) AS sector_table_exists;
-- Expected: true

-- 2. Count total sector records
SELECT COUNT(*) AS total_sector_records 
FROM public.souvera_country_sectors;
-- Expected before seeding: 0
-- Expected after seeding: ≥50 (10 countries × 5 sectors)

-- 3. Check if ANY country has sector data
SELECT 
  COUNT(DISTINCT cs.country_id) AS countries_with_sectors,
  COUNT(cs.id) AS total_sectors
FROM public.souvera_country_sectors cs;
-- Expected before seeding: 0 countries, 0 sectors
-- Expected after seeding: ≥10 countries, ≥50 sectors

-- 4. Check Nigeria (NGA) sector records specifically
SELECT 
  c.iso3,
  c.name,
  cs.sector_key,
  cs.sector_label,
  cs.teaser_md,
  cs.rationale_md,
  cs.strength_score,
  cs.growth_score,
  cs.display_order
FROM public.souvera_country_sectors cs
JOIN public.souvera_countries c ON cs.country_id = c.id
WHERE c.iso3 = 'NGA'
ORDER BY cs.display_order;
-- Expected before seeding: 0 rows
-- Expected after seeding: ≥5 rows with populated fields

-- 5. Check Kenya (KEN) sector records
SELECT 
  c.iso3,
  c.name,
  cs.sector_key,
  cs.sector_label,
  LENGTH(cs.teaser_md) AS teaser_length,
  LENGTH(cs.rationale_md) AS rationale_length,
  cs.display_order
FROM public.souvera_country_sectors cs
JOIN public.souvera_countries c ON cs.country_id = c.id
WHERE c.iso3 = 'KEN'
ORDER BY cs.display_order;
-- Expected before seeding: 0 rows
-- Expected after seeding: ≥5 rows

-- 6. List all countries with sector data (summary)
SELECT 
  c.iso3,
  c.name,
  COUNT(cs.id) AS sector_count
FROM public.souvera_countries c
LEFT JOIN public.souvera_country_sectors cs ON cs.country_id = c.id
WHERE c.is_active = true
GROUP BY c.iso3, c.name
HAVING COUNT(cs.id) > 0
ORDER BY sector_count DESC;
-- Expected before seeding: 0 rows
-- Expected after seeding: ≥10 countries

-- 7. List countries WITH ZERO sectors (gap report)
SELECT 
  c.iso3,
  c.name,
  c.region,
  c.subregion
FROM public.souvera_countries c
LEFT JOIN public.souvera_country_sectors cs ON cs.country_id = c.id
WHERE c.is_active = true 
  AND c.is_african_country = true
  AND cs.id IS NULL
ORDER BY c.name;
-- Expected before seeding: 54 rows (all African countries)
-- Expected after DATA-SEED-01: 44 rows (54 - 10 priority countries)

-- =========================================================
-- POST-SEEDING VERIFICATION
-- Run these after implementing DATA-SEED-01
-- =========================================================

-- 8. Verify top 10 countries by sector count
SELECT 
  c.iso3,
  c.name,
  COUNT(cs.id) AS sector_count,
  STRING_AGG(cs.sector_label, ', ' ORDER BY cs.display_order) AS sectors
FROM public.souvera_countries c
LEFT JOIN public.souvera_country_sectors cs ON cs.country_id = c.id
WHERE c.is_active = true 
  AND c.is_african_country = true
GROUP BY c.iso3, c.name
ORDER BY sector_count DESC
LIMIT 10;
-- Expected after seeding: Top 10 should include NGA, KEN, ZAF, EGY, RWA
-- Each should have ≥5 sectors

-- 9. Verify all priority countries have ≥5 sectors
SELECT 
  c.iso3,
  c.name,
  COUNT(cs.id) AS sector_count,
  CASE 
    WHEN COUNT(cs.id) >= 5 THEN '✅ Pass'
    WHEN COUNT(cs.id) > 0 THEN '⚠️ Incomplete'
    ELSE '❌ Missing'
  END AS status
FROM public.souvera_countries c
LEFT JOIN public.souvera_country_sectors cs ON cs.country_id = c.id
WHERE c.iso3 IN ('NGA', 'KEN', 'ZAF', 'EGY', 'RWA', 'GHA', 'MAR', 'TZA', 'ETH', 'CIV')
GROUP BY c.iso3, c.name
ORDER BY sector_count DESC;
-- Expected: All 10 countries show ✅ Pass (≥5 sectors)

-- 10. Verify sector field completeness
SELECT 
  c.iso3,
  c.name,
  cs.sector_label,
  CASE WHEN cs.teaser_md IS NOT NULL THEN '✅' ELSE '❌' END AS has_teaser,
  CASE WHEN cs.rationale_md IS NOT NULL THEN '✅' ELSE '❌' END AS has_rationale,
  CASE WHEN cs.strength_score IS NOT NULL THEN '✅' ELSE '⚠️' END AS has_strength,
  CASE WHEN cs.growth_score IS NOT NULL THEN '✅' ELSE '⚠️' END AS has_growth,
  cs.display_order
FROM public.souvera_country_sectors cs
JOIN public.souvera_countries c ON cs.country_id = c.id
WHERE c.iso3 IN ('NGA', 'KEN', 'ZAF', 'EGY', 'RWA')
ORDER BY c.iso3, cs.display_order;
-- Expected: 
-- - has_teaser: ✅ for all rows
-- - has_rationale: ✅ for all rows (needed for Professional+)
-- - has_strength/has_growth: ⚠️ optional but recommended

-- 11. Verify display_order is sequential
SELECT 
  c.iso3,
  c.name,
  cs.sector_label,
  cs.display_order,
  CASE 
    WHEN cs.display_order BETWEEN 1 AND 5 THEN '✅ Valid'
    ELSE '⚠️ Out of Range'
  END AS display_order_status
FROM public.souvera_country_sectors cs
JOIN public.souvera_countries c ON cs.country_id = c.id
WHERE c.iso3 IN ('NGA', 'KEN', 'ZAF')
ORDER BY c.iso3, cs.display_order;
-- Expected: display_order should be 1, 2, 3, 4, 5 for each country

-- 12. Check for duplicate sector_key per country
SELECT 
  c.iso3,
  c.name,
  cs.sector_key,
  COUNT(*) AS duplicate_count
FROM public.souvera_country_sectors cs
JOIN public.souvera_countries c ON cs.country_id = c.id
GROUP BY c.iso3, c.name, cs.sector_key
HAVING COUNT(*) > 1;
-- Expected: 0 rows (unique constraint should prevent duplicates)

-- =========================================================
-- API RESPONSE SIMULATION
-- Simulate what /api/v1/country-lite?iso3=NGA returns
-- =========================================================

-- 13. Simulate API sector query for Nigeria (Explorer tier: 1 sector)
SELECT 
  cs.sector_label AS label,
  cs.teaser_md AS teaser
FROM public.souvera_country_sectors cs
JOIN public.souvera_countries c ON cs.country_id = c.id
WHERE c.iso3 = 'NGA'
ORDER BY cs.display_order ASC
LIMIT 1;
-- Expected after seeding: 1 row with sector_label and teaser_md

-- 14. Simulate API sector query for Nigeria (Professional tier: up to 5 sectors)
SELECT 
  cs.sector_label AS label,
  cs.teaser_md AS teaser,
  cs.rationale_md AS rationale,
  cs.strength_score AS "strengthScore",
  cs.growth_score AS "growthScore"
FROM public.souvera_country_sectors cs
JOIN public.souvera_countries c ON cs.country_id = c.id
WHERE c.iso3 = 'NGA'
ORDER BY cs.display_order ASC
LIMIT 5;
-- Expected after seeding: 5 rows with all fields populated

-- =========================================================
-- DATA QUALITY CHECKS
-- =========================================================

-- 15. Find sectors with missing teaser (required for all tiers)
SELECT 
  c.iso3,
  c.name,
  cs.sector_label,
  cs.teaser_md
FROM public.souvera_country_sectors cs
JOIN public.souvera_countries c ON cs.country_id = c.id
WHERE cs.teaser_md IS NULL OR TRIM(cs.teaser_md) = '';
-- Expected: 0 rows (all sectors must have teaser)

-- 16. Find sectors with missing rationale (needed for Professional+)
SELECT 
  c.iso3,
  c.name,
  cs.sector_label,
  cs.rationale_md
FROM public.souvera_country_sectors cs
JOIN public.souvera_countries c ON cs.country_id = c.id
WHERE cs.rationale_md IS NULL OR TRIM(cs.rationale_md) = '';
-- Expected: 0 rows (rationale required for Professional tier)

-- 17. Check teaser and rationale length distribution
SELECT 
  c.iso3,
  cs.sector_label,
  LENGTH(cs.teaser_md) AS teaser_length,
  LENGTH(cs.rationale_md) AS rationale_length,
  CASE 
    WHEN LENGTH(cs.teaser_md) BETWEEN 50 AND 200 THEN '✅ Good'
    WHEN LENGTH(cs.teaser_md) < 50 THEN '⚠️ Too Short'
    ELSE '⚠️ Too Long'
  END AS teaser_quality,
  CASE 
    WHEN LENGTH(cs.rationale_md) BETWEEN 150 AND 500 THEN '✅ Good'
    WHEN LENGTH(cs.rationale_md) < 150 THEN '⚠️ Too Short'
    ELSE '⚠️ Too Long'
  END AS rationale_quality
FROM public.souvera_country_sectors cs
JOIN public.souvera_countries c ON cs.country_id = c.id
WHERE c.iso3 IN ('NGA', 'KEN', 'ZAF')
ORDER BY c.iso3, cs.display_order;
-- Guidelines:
-- - Teaser: 1-2 sentences (50-200 chars ideal)
-- - Rationale: 2-4 sentences (150-500 chars ideal)

-- =========================================================
-- PERFORMANCE CHECKS
-- =========================================================

-- 18. Verify foreign key relationships
SELECT 
  COUNT(*) AS orphaned_sectors
FROM public.souvera_country_sectors cs
LEFT JOIN public.souvera_countries c ON cs.country_id = c.id
WHERE c.id IS NULL;
-- Expected: 0 (all sectors must link to valid country)

-- 19. Check index usage (if indexes exist)
EXPLAIN ANALYZE
SELECT cs.*
FROM public.souvera_country_sectors cs
WHERE cs.country_id = (SELECT id FROM public.souvera_countries WHERE iso3 = 'NGA')
ORDER BY cs.display_order
LIMIT 5;
-- Review execution plan for index usage on country_id and display_order

-- =========================================================
-- SUMMARY REPORT
-- =========================================================

-- 20. Overall sector data status summary
SELECT 
  (SELECT COUNT(*) FROM public.souvera_countries WHERE is_african_country = true) AS total_african_countries,
  (SELECT COUNT(DISTINCT country_id) FROM public.souvera_country_sectors cs JOIN public.souvera_countries c ON cs.country_id = c.id WHERE c.is_african_country = true) AS countries_with_sectors,
  (SELECT COUNT(*) FROM public.souvera_country_sectors cs JOIN public.souvera_countries c ON cs.country_id = c.id WHERE c.is_african_country = true) AS total_sector_records,
  ROUND(
    100.0 * (SELECT COUNT(DISTINCT country_id) FROM public.souvera_country_sectors cs JOIN public.souvera_countries c ON cs.country_id = c.id WHERE c.is_african_country = true) / 
    NULLIF((SELECT COUNT(*) FROM public.souvera_countries WHERE is_african_country = true), 0),
    2
  ) AS coverage_percentage;
-- Expected before seeding: 54 countries, 0 with sectors, 0.00% coverage
-- Expected after DATA-SEED-01: 54 countries, 10 with sectors, 18.52% coverage
-- Expected future: 54 countries, 54 with sectors, 100.00% coverage

-- =========================================================
-- END VERIFICATION SQL
-- =========================================================

-- Usage Notes:
-- 1. Run queries 1-7 BEFORE implementing DATA-SEED-01 to establish baseline
-- 2. Run queries 8-20 AFTER implementing DATA-SEED-01 to verify seeding
-- 3. All queries are READ-ONLY and safe to run in production
-- 4. Save results for QA documentation

-- Related Documentation:
-- - docs/audits/sector-visibility-debug.md
-- - docs/backlog/data-ingestion-backlog.md (DATA-SEED-01, UX-DATA-02)
