-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- Compare Data Verification Queries
-- Purpose: Verify data path for country comparison debugging
-- Countries: Guinea (GIN), Angola (AGO)
-- Run in: Supabase SQL Editor
-- =========================================================


-- =========================================================
-- 1. VERIFY COUNTRIES EXIST
-- Expected: 2 rows - Guinea and Angola with full identity data
-- =========================================================

SELECT
  iso3,
  name,
  region,
  subregion,
  capital,
  currency_code,
  lat,
  lng,
  is_african_country,
  is_active
FROM public.souvera_countries
WHERE iso3 IN ('GIN', 'AGO')
ORDER BY iso3;

-- Expected:
-- AGO | Angola | Africa | Middle Africa  | Luanda  | AOA | -11.2027 | 17.8739 | true | true
-- GIN | Guinea | Africa | Western Africa | Conakry | GNF |   9.9456 | -9.6966 | true | true


-- =========================================================
-- 2. VERIFY INDICATORS EXIST
-- Expected: 3 rows - GDP, GDP Growth, Population
-- =========================================================

SELECT
  key,
  label,
  domain,
  unit,
  preferred_source_key,
  min_plan_id
FROM public.souvera_indicators
WHERE key IN ('gdp_current_usd', 'gdp_growth_pct', 'population_total')
ORDER BY key;

-- Expected:
-- gdp_current_usd  | GDP Current US$ | macro        | USD     | world_bank | public
-- gdp_growth_pct   | GDP Growth %    | macro        | percent | world_bank | public
-- population_total | Population Total| demographics | people  | world_bank | public


-- =========================================================
-- 3. VERIFY OBSERVATIONS EXIST
-- Expected: 3 rows for AGO (gdp, growth, pop), 0 rows for GIN
-- =========================================================

SELECT
  c.iso3,
  c.name,
  i.key           AS indicator_key,
  o.period_date,
  o.value_numeric,
  ds.key          AS source_key,
  o.fetched_at
FROM public.souvera_country_observations o
JOIN public.souvera_countries   c  ON c.id  = o.country_id
JOIN public.souvera_indicators  i  ON i.id  = o.indicator_id
JOIN public.souvera_data_sources ds ON ds.id = o.source_id
WHERE c.iso3 IN ('GIN', 'AGO')
  AND i.key IN ('gdp_current_usd', 'gdp_growth_pct', 'population_total')
ORDER BY c.iso3, i.key, o.period_date DESC;

-- Expected for AGO:
--   AGO | Angola | gdp_current_usd  | 2024-12-31 | 94100000000 | world_bank | 2026-04-28
--   AGO | Angola | gdp_growth_pct   | 2024-12-31 |         2.8 | world_bank | 2026-04-28
--   AGO | Angola | population_total | 2024-12-31 |    36700000 | world_bank | 2026-04-28
-- Expected for GIN:
--   (no rows — Guinea has no seed observations)


-- =========================================================
-- 4. VERIFY LATEST OBSERVATIONS VIEW
-- Expected: 3 rows for Angola's country_id, 0 for Guinea's
-- =========================================================

SELECT
  country_id,
  indicator_key,
  indicator_label,
  domain,
  period_date,
  value_numeric,
  source_key,
  fetched_at
FROM public.souvera_latest_observations_v
WHERE country_id IN (
  SELECT id FROM public.souvera_countries WHERE iso3 IN ('GIN', 'AGO')
)
ORDER BY country_id, indicator_key;

-- Expected: 3 rows for Angola, 0 for Guinea


-- =========================================================
-- 5. VERIFY LITE VIEW (public-tier data)
-- Expected: both countries appear; AGO has metrics, GIN has NULLs
-- =========================================================

SELECT
  iso3,
  name,
  region,
  subregion,
  capital,
  currency_code,
  lat,
  lng,
  is_african_country,
  is_active,
  gdp_current_usd,
  gdp_growth_pct,
  population_total,
  signal_level,
  investment_score,
  confidence_score,
  freshness_at
FROM public.souvera_country_lite_v
WHERE iso3 IN ('GIN', 'AGO')
ORDER BY iso3;

-- Expected:
--   AGO | Angola | Africa | ... | Luanda  | ... | 94100000000 | 2.8  | 36700000 | emerging | 60 | 60 | 2026-04-28
--   GIN | Guinea | Africa | ... | Conakry | ... | NULL        | NULL | NULL     | NULL     |NULL|NULL| NULL


-- =========================================================
-- 6. VERIFY SIGNAL SCORES
-- Expected: 1 row for AGO, 0 rows for GIN
-- =========================================================

SELECT
  c.iso3,
  c.name,
  ss.signal_level,
  ss.growth_score,
  ss.risk_score,
  ss.investment_score,
  ss.confidence_score,
  ss.scoring_version,
  ss.computed_at
FROM public.souvera_country_signal_scores ss
JOIN public.souvera_countries c ON c.id = ss.country_id
WHERE c.iso3 IN ('GIN', 'AGO')
ORDER BY c.iso3;

-- Expected: 1 row for AGO (signal_level='emerging'), 0 rows for GIN


-- =========================================================
-- 7. COUNT SEEDED COUNTRIES (summary check)
-- Expected: 20 countries, 60 observations
-- =========================================================

SELECT
  COUNT(DISTINCT c.iso3) AS countries_with_observations,
  COUNT(*)               AS total_observations
FROM public.souvera_country_observations o
JOIN public.souvera_countries c ON c.id = o.country_id;

-- Expected: 20 countries, 60 observations (20 × 3 indicators)


-- =========================================================
-- 8. LIST ALL SEEDED COUNTRIES
-- Expected: 20 priority countries from sql-pack-v1.5
-- =========================================================

SELECT DISTINCT
  c.iso3,
  c.name,
  c.region
FROM public.souvera_country_observations o
JOIN public.souvera_countries c ON c.id = o.country_id
ORDER BY c.name;

-- Expected 20 rows:
-- AGO, BWA, CIV, COD, EGY, ETH, GHA, KEN, MAR, MOZ,
-- NAM, NGA, RWA, SEN, TUN, TZA, UGA, ZAF, ZMB, ZWE


-- =========================================================
-- 9. VERIFY VIEW COLUMNS (confirm sql-pack-v1.6 was applied)
-- Expected: lat, lng, is_african_country, is_active present
-- =========================================================

SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'souvera_country_lite_v'
ORDER BY ordinal_position;

-- Must include: lat, lng, is_african_country, is_active
-- If missing → sql-pack-v1.6 has not been applied


-- =========================================================
-- 10. SIMULATE /api/v1/countries API QUERY
-- Expected: both countries returned with all required columns
-- =========================================================

SELECT
  iso2,
  iso3,
  name,
  region,
  subregion,
  capital,
  flag_svg_url,
  lat,
  lng,
  gdp_current_usd,
  population_total,
  signal_level,
  freshness_at,
  is_african_country
FROM public.souvera_country_lite_v
WHERE is_active = true
  AND iso3 IN ('GIN', 'AGO')
ORDER BY name;

-- =========================================================
-- END VERIFICATION QUERIES
-- =========================================================
