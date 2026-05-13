-- =========================================================
-- PHASE 4A — SECTOR READINESS VERIFICATION
-- Souvera Intelligence Terminal
-- Owner: Afronovation, Inc.
-- Date: 2026-05-04
-- =========================================================
--
-- These queries verify sector data readiness and
-- identify which countries need sector seeding.
--
-- RUN BEFORE DATA-SEED-01 (sector seeding)
-- =========================================================

-- =========================================================
-- 1. TOTAL SECTOR ROWS
-- =========================================================

SELECT COUNT(*) as total_sector_rows
FROM souvera_country_sectors;

-- ✅ BEFORE DATA-SEED-01: 0 or very low (seed data only)
-- ✅ AFTER DATA-SEED-01: ~100 (20 countries x 5 sectors)

-- =========================================================
-- 2. SECTOR ROWS BY COUNTRY
-- =========================================================

SELECT 
  c.iso3,
  c.name,
  COUNT(s.id) as sector_count
FROM souvera_countries c
LEFT JOIN souvera_country_sectors s ON s.country_id = c.id
WHERE c.is_active = true
GROUP BY c.iso3, c.name
HAVING COUNT(s.id) > 0
ORDER BY sector_count DESC, c.name
LIMIT 30;

-- ✅ BEFORE DATA-SEED-01: 0 rows or very few
-- ✅ AFTER DATA-SEED-01: 20 countries with 5 sectors each

-- =========================================================
-- 3. PRIORITY AFRICAN COUNTRIES — SECTOR READINESS
-- =========================================================

WITH priority_africa AS (
  SELECT unnest(ARRAY[
    'NGA', 'ZAF', 'KEN', 'ETH', 'GHA', 
    'EGY', 'MAR', 'TZA', 'CIV', 'SEN', 
    'RWA', 'UGA', 'AGO', 'MOZ', 'CMR'
  ]) AS iso3
)
SELECT 
  c.iso3,
  c.name,
  COUNT(s.id) as sector_count,
  CASE 
    WHEN COUNT(s.id) = 0 THEN 'NEEDS SEEDING'
    WHEN COUNT(s.id) < 5 THEN 'INCOMPLETE'
    ELSE 'READY'
  END as status
FROM souvera_countries c
JOIN priority_africa p ON p.iso3 = c.iso3
LEFT JOIN souvera_country_sectors s ON s.country_id = c.id
GROUP BY c.iso3, c.name
ORDER BY c.iso3;

-- ✅ EXPECTED BEFORE SEEDING: All 15 countries show "NEEDS SEEDING"
-- ✅ EXPECTED AFTER SEEDING: All 15 countries show "READY" with 5 sectors

-- =========================================================
-- 4. PRIORITY CARIBBEAN COUNTRIES — SECTOR READINESS
-- =========================================================

WITH priority_caribbean AS (
  SELECT unnest(ARRAY['JAM', 'TTO', 'DOM', 'BRB', 'BHS']) AS iso3
)
SELECT 
  c.iso3,
  c.name,
  COUNT(s.id) as sector_count,
  CASE 
    WHEN COUNT(s.id) = 0 THEN 'NEEDS SEEDING'
    WHEN COUNT(s.id) < 5 THEN 'INCOMPLETE'
    ELSE 'READY'
  END as status
FROM souvera_countries c
JOIN priority_caribbean p ON p.iso3 = c.iso3
LEFT JOIN souvera_country_sectors s ON s.country_id = c.id
GROUP BY c.iso3, c.name
ORDER BY c.iso3;

-- ✅ EXPECTED BEFORE SEEDING: All 5 countries show "NEEDS SEEDING"
-- ✅ EXPECTED AFTER SEEDING: All 5 countries show "READY" with 5 sectors

-- =========================================================
-- 5. SECTOR KEY DISTRIBUTION
-- =========================================================

SELECT 
  sector_key,
  sector_label,
  COUNT(*) as country_count
FROM souvera_country_sectors
GROUP BY sector_key, sector_label
ORDER BY country_count DESC;

-- ✅ BEFORE DATA-SEED-01: 0 rows or very few
-- ✅ AFTER DATA-SEED-01: ~5 sectors, each with ~20 countries

-- =========================================================
-- 6. COUNTRIES WITH INCOMPLETE SECTOR DATA
-- =========================================================

SELECT 
  c.iso3,
  c.name,
  COUNT(s.id) as sector_count
FROM souvera_countries c
LEFT JOIN souvera_country_sectors s ON s.country_id = c.id
WHERE c.is_active = true
GROUP BY c.iso3, c.name
HAVING COUNT(s.id) > 0 AND COUNT(s.id) < 5
ORDER BY sector_count ASC, c.name;

-- ✅ EXPECTED BEFORE SEEDING: 0 rows or very few
-- ⚠️  AFTER SEEDING: Should be 0 rows (all countries have 0 or 5 sectors)

-- =========================================================
-- 7. SAMPLE SECTOR DATA (IF ANY EXISTS)
-- =========================================================

SELECT 
  c.iso3,
  c.name,
  s.sector_key,
  s.sector_label,
  LENGTH(s.teaser_md) as teaser_length,
  LENGTH(s.rationale_md) as rationale_length,
  s.strength_score,
  s.growth_score,
  s.display_order
FROM souvera_countries c
JOIN souvera_country_sectors s ON s.country_id = c.id
ORDER BY c.name, s.display_order
LIMIT 20;

-- ✅ BEFORE DATA-SEED-01: 0 rows or very few
-- ✅ AFTER DATA-SEED-01: Sample rows should have:
--    - teaser_length > 20
--    - rationale_length > 50
--    - strength_score and growth_score between 0-10
--    - display_order 1-5

-- =========================================================
-- 8. ENTITLEMENT GATE VERIFICATION
-- =========================================================

SELECT 
  s.min_plan_id,
  COUNT(*) as sector_count
FROM souvera_country_sectors s
GROUP BY s.min_plan_id
ORDER BY sector_count DESC;

-- ✅ EXPECTED: Most sectors should have min_plan_id = 'explorer' (for teasers)
-- ✅ EXPECTED: Rationale access gated by API entitlement logic, not min_plan_id

-- =========================================================
-- 9. DATA-SEED-01 TARGET COUNTRIES
-- =========================================================

-- List of 20 priority countries that need sector seeding
WITH target_countries AS (
  SELECT unnest(ARRAY[
    -- Africa (15)
    'NGA', 'ZAF', 'KEN', 'ETH', 'GHA', 
    'EGY', 'MAR', 'TZA', 'CIV', 'SEN', 
    'RWA', 'UGA', 'AGO', 'MOZ', 'CMR',
    -- Caribbean (5)
    'JAM', 'TTO', 'DOM', 'BRB', 'BHS'
  ]) AS iso3
)
SELECT 
  c.iso3,
  c.name,
  c.region,
  COUNT(s.id) as current_sector_count,
  5 - COUNT(s.id) as sectors_needed
FROM souvera_countries c
JOIN target_countries t ON t.iso3 = c.iso3
LEFT JOIN souvera_country_sectors s ON s.country_id = c.id
GROUP BY c.iso3, c.name, c.region
ORDER BY c.region, c.name;

-- ✅ EXPECTED BEFORE SEEDING: All 20 countries with sectors_needed = 5
-- ✅ EXPECTED AFTER SEEDING: All 20 countries with sectors_needed = 0

-- =========================================================
-- 10. PROFESSIONAL+ COUNTRY VERIFICATION
-- =========================================================

-- Check which countries appear in Professional+ view
-- (These should eventually have sector data)
SELECT 
  iso3,
  name,
  gdp_current_usd,
  fdi_net_inflows_usd
FROM souvera_country_professional_v
WHERE iso3 IN ('NGA', 'ZAF', 'KEN', 'JAM', 'TTO')
ORDER BY iso3;

-- ✅ EXPECTED: All 5 countries should appear in professional view
-- ✅ EXPECTED: GDP values populated, FDI values after ingestion

-- =========================================================
-- SUMMARY REPORT
-- =========================================================

DO $$
DECLARE
  total_sectors INTEGER;
  countries_with_sectors INTEGER;
  priority_africa_ready INTEGER;
  priority_caribbean_ready INTEGER;
BEGIN
  -- Total sectors
  SELECT COUNT(*) INTO total_sectors
  FROM souvera_country_sectors;
  
  -- Countries with any sectors
  SELECT COUNT(DISTINCT country_id) INTO countries_with_sectors
  FROM souvera_country_sectors;
  
  -- Priority Africa ready count
  WITH priority_africa AS (
    SELECT unnest(ARRAY[
      'NGA', 'ZAF', 'KEN', 'ETH', 'GHA', 
      'EGY', 'MAR', 'TZA', 'CIV', 'SEN', 
      'RWA', 'UGA', 'AGO', 'MOZ', 'CMR'
    ]) AS iso3
  )
  SELECT COUNT(*) INTO priority_africa_ready
  FROM (
    SELECT c.iso3
    FROM souvera_countries c
    JOIN priority_africa p ON p.iso3 = c.iso3
    LEFT JOIN souvera_country_sectors s ON s.country_id = c.id
    GROUP BY c.iso3
    HAVING COUNT(s.id) >= 5
  ) ready;
  
  -- Priority Caribbean ready count
  WITH priority_caribbean AS (
    SELECT unnest(ARRAY['JAM', 'TTO', 'DOM', 'BRB', 'BHS']) AS iso3
  )
  SELECT COUNT(*) INTO priority_caribbean_ready
  FROM (
    SELECT c.iso3
    FROM souvera_countries c
    JOIN priority_caribbean p ON p.iso3 = c.iso3
    LEFT JOIN souvera_country_sectors s ON s.country_id = c.id
    GROUP BY c.iso3
    HAVING COUNT(s.id) >= 5
  ) ready;
  
  -- Report
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'PHASE 4A — SECTOR READINESS SUMMARY';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  
  RAISE NOTICE '📊 Current State:';
  RAISE NOTICE '  Total sector rows: %', total_sectors;
  RAISE NOTICE '  Countries with sectors: %', countries_with_sectors;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 DATA-SEED-01 Target:';
  RAISE NOTICE '  Priority Africa (15 countries):';
  IF priority_africa_ready = 15 THEN
    RAISE NOTICE '    ✅ All 15 ready (5 sectors each)';
  ELSE
    RAISE NOTICE '    ⏳ % / 15 ready', priority_africa_ready;
    RAISE NOTICE '    ⚠️  % countries need seeding', 15 - priority_africa_ready;
  END IF;
  
  RAISE NOTICE '  Priority Caribbean (5 countries):';
  IF priority_caribbean_ready = 5 THEN
    RAISE NOTICE '    ✅ All 5 ready (5 sectors each)';
  ELSE
    RAISE NOTICE '    ⏳ % / 5 ready', priority_caribbean_ready;
    RAISE NOTICE '    ⚠️  % countries need seeding', 5 - priority_caribbean_ready;
  END IF;
  
  RAISE NOTICE '';
  IF total_sectors < 100 THEN
    RAISE NOTICE '⚠️  ACTION REQUIRED: Run DATA-SEED-01';
    RAISE NOTICE '   File: sql-pack-v1.11-seed-sectors.sql';
    RAISE NOTICE '   Target: 100 sectors (20 countries x 5 sectors)';
  ELSE
    RAISE NOTICE '✅ READY: Sector data seeded';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
END $$;
