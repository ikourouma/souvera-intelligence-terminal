-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL PACK v1.6: VIEW REBUILD FOR MISSING COLUMNS
-- Owner: Afronovation, Inc.
-- Platform: Supabase Postgres
-- 
-- FIX: Adds lat, lng, is_african_country, is_active columns
-- to all three tiered country views.
--
-- Root cause: API queries these columns but views didn't
-- project them from the base souvera_countries table.
--
-- IMPORTANT: This migration uses DROP VIEW instead of
-- CREATE OR REPLACE VIEW because PostgreSQL does not allow
-- CREATE OR REPLACE to change column order or add columns
-- in the middle of the column list. Views must be dropped
-- and recreated in dependency order.
--
-- SAFE: Views are just queries, no data is deleted.
-- =========================================================

-- =========================================================
-- STEP 1: DROP VIEWS IN REVERSE DEPENDENCY ORDER
-- =========================================================

-- Drop business view first (depends on professional)
DROP VIEW IF EXISTS public.souvera_country_business_v CASCADE;

-- Drop professional view (depends on lite)
DROP VIEW IF EXISTS public.souvera_country_professional_v CASCADE;

-- Drop lite view (depends on latest_observations)
DROP VIEW IF EXISTS public.souvera_country_lite_v CASCADE;

-- Note: We do NOT drop souvera_latest_observations_v because it doesn't need changes

-- =========================================================
-- STEP 2: RECREATE VIEWS IN DEPENDENCY ORDER
-- =========================================================

-- =========================================================
-- 2.1: RECREATE LITE VIEW (Public / Explorer)
-- =========================================================

CREATE VIEW public.souvera_country_lite_v AS
SELECT
  c.id as country_id,
  c.iso2,
  c.iso3,
  c.name,
  c.region,
  c.subregion,
  c.capital,
  c.currency_code,
  c.currency_name,
  c.flag_svg_url,
  c.flag_png_url,
  c.lat,
  c.lng,
  c.is_african_country,
  c.is_active,
  max(case when l.indicator_key = 'gdp_current_usd' then l.value_numeric end) as gdp_current_usd,
  max(case when l.indicator_key = 'gdp_growth_pct' then l.value_numeric end) as gdp_growth_pct,
  max(case when l.indicator_key = 'population_total' then l.value_numeric end) as population_total,
  cp.afdec_teaser_md,
  cp.signal_level,
  ss.investment_score,
  ss.confidence_score,
  greatest(
    max(l.fetched_at),
    cp.updated_at,
    ss.computed_at
  ) as freshness_at
FROM public.souvera_countries c
LEFT JOIN public.souvera_latest_observations_v l ON l.country_id = c.id
LEFT JOIN public.souvera_country_profiles cp ON cp.country_id = c.id
LEFT JOIN public.souvera_country_signal_scores ss ON ss.country_id = c.id
WHERE c.is_active = true
GROUP BY
  c.id, c.iso2, c.iso3, c.name, c.region, c.subregion, c.capital,
  c.currency_code, c.currency_name, c.flag_svg_url, c.flag_png_url,
  c.lat, c.lng, c.is_african_country, c.is_active,
  cp.afdec_teaser_md, cp.signal_level, ss.investment_score, ss.confidence_score,
  cp.updated_at, ss.computed_at;

-- =========================================================
-- 2.2: RECREATE PROFESSIONAL VIEW
-- =========================================================

CREATE VIEW public.souvera_country_professional_v AS
SELECT
  lite.country_id,
  lite.iso2,
  lite.iso3,
  lite.name,
  lite.region,
  lite.subregion,
  lite.capital,
  lite.currency_code,
  lite.currency_name,
  lite.flag_svg_url,
  lite.flag_png_url,
  lite.lat,
  lite.lng,
  lite.is_african_country,
  lite.is_active,
  lite.gdp_current_usd,
  lite.gdp_growth_pct,
  lite.population_total,
  lite.afdec_teaser_md,
  lite.signal_level,
  lite.investment_score,
  lite.confidence_score,
  lite.freshness_at,
  max(case when l.indicator_key = 'fdi_net_inflows_usd' then l.value_numeric end) as fdi_net_inflows_usd,
  max(case when l.indicator_key = 'inflation_cpi_pct' then l.value_numeric end) as inflation_cpi_pct,
  max(case when l.indicator_key = 'fx_to_usd' then l.value_numeric end) as fx_to_usd,
  cp.summary_md,
  cp.why_now_md,
  cp.economic_momentum,
  cp.investor_readiness
FROM public.souvera_country_lite_v lite
LEFT JOIN public.souvera_latest_observations_v l ON l.country_id = lite.country_id
LEFT JOIN public.souvera_country_profiles cp ON cp.country_id = lite.country_id
GROUP BY
  lite.country_id, lite.iso2, lite.iso3, lite.name, lite.region, lite.subregion,
  lite.capital, lite.currency_code, lite.currency_name, lite.flag_svg_url,
  lite.flag_png_url, lite.lat, lite.lng, lite.is_african_country, lite.is_active,
  lite.gdp_current_usd, lite.gdp_growth_pct, lite.population_total,
  lite.afdec_teaser_md, lite.signal_level, lite.investment_score,
  lite.confidence_score, lite.freshness_at,
  cp.summary_md, cp.why_now_md, cp.economic_momentum, cp.investor_readiness;

-- =========================================================
-- 2.3: RECREATE BUSINESS VIEW
-- =========================================================

CREATE VIEW public.souvera_country_business_v AS
SELECT
  pro.country_id,
  pro.iso2,
  pro.iso3,
  pro.name,
  pro.region,
  pro.subregion,
  pro.capital,
  pro.currency_code,
  pro.currency_name,
  pro.flag_svg_url,
  pro.flag_png_url,
  pro.lat,
  pro.lng,
  pro.is_african_country,
  pro.is_active,
  pro.gdp_current_usd,
  pro.gdp_growth_pct,
  pro.population_total,
  pro.afdec_teaser_md,
  pro.signal_level,
  pro.investment_score,
  pro.confidence_score,
  pro.freshness_at,
  pro.fdi_net_inflows_usd,
  pro.inflation_cpi_pct,
  pro.fx_to_usd,
  pro.summary_md,
  pro.why_now_md,
  pro.economic_momentum,
  pro.investor_readiness,
  max(case when l.indicator_key = 'gdp_forecast_pct' then l.value_numeric end) as gdp_forecast_pct,
  max(case when l.indicator_key = 'remittances_received_usd' then l.value_numeric end) as remittances_received_usd,
  cp.opportunity_thesis_md,
  cp.risk_narrative_md
FROM public.souvera_country_professional_v pro
LEFT JOIN public.souvera_latest_observations_v l ON l.country_id = pro.country_id
LEFT JOIN public.souvera_country_profiles cp ON cp.country_id = pro.country_id
GROUP BY
  pro.country_id, pro.iso2, pro.iso3, pro.name, pro.region, pro.subregion,
  pro.capital, pro.currency_code, pro.currency_name, pro.flag_svg_url,
  pro.flag_png_url, pro.lat, pro.lng, pro.is_african_country, pro.is_active,
  pro.gdp_current_usd, pro.gdp_growth_pct, pro.population_total,
  pro.afdec_teaser_md, pro.signal_level, pro.investment_score,
  pro.confidence_score, pro.freshness_at,
  pro.fdi_net_inflows_usd, pro.inflation_cpi_pct, pro.fx_to_usd,
  pro.summary_md, pro.why_now_md, pro.economic_momentum, pro.investor_readiness,
  cp.opportunity_thesis_md, cp.risk_narrative_md;

-- =========================================================
-- VERIFICATION QUERIES
-- =========================================================

-- Run these to verify the fix worked:

-- Test 1: Check lite view structure and data
SELECT country_id, iso2, iso3, name, lat, lng, is_african_country, is_active
FROM public.souvera_country_lite_v
WHERE is_african_country = true
LIMIT 5;
-- Expected: 5 rows with lat/lng coordinates

-- Test 2: Count African countries
SELECT COUNT(*) as african_countries
FROM public.souvera_country_lite_v
WHERE is_african_country = true;
-- Expected: 54

-- Test 3: Count Caribbean countries
SELECT COUNT(*) as caribbean_countries
FROM public.souvera_country_lite_v
WHERE is_african_country = false;
-- Expected: 20

-- Test 4: Verify professional view has new columns
SELECT country_id, iso3, name, lat, lng, fdi_net_inflows_usd
FROM public.souvera_country_professional_v
LIMIT 3;

-- Test 5: Verify business view has new columns
SELECT country_id, iso3, name, lat, lng, gdp_forecast_pct
FROM public.souvera_country_business_v
LIMIT 3;

-- Test 6: Verify API query works
SELECT iso2, iso3, name, region, subregion, capital, flag_svg_url,
       lat, lng, gdp_current_usd, population_total, signal_level,
       freshness_at, is_african_country
FROM public.souvera_country_lite_v
WHERE is_active = true
ORDER BY name
LIMIT 10;
-- Expected: 10 rows with all columns populated

-- =========================================================
-- END SQL PACK v1.6
-- =========================================================
