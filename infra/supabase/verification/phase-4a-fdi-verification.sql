-- =========================================================
-- PHASE 4A — FDI OBSERVATION VERIFICATION
-- Souvera Intelligence Terminal
-- Owner: Afronovation, Inc.
-- Date: 2026-05-04
-- =========================================================
--
-- These queries verify that World Bank FDI ingestion
-- successfully populated souvera_country_observations
-- and that FDI values are exposed in Professional+ views.
--
-- RUN THESE QUERIES AFTER World Bank ingestion completes:
-- npx tsx services/ingestion/run.ts worldbank
-- =========================================================

-- =========================================================
-- 1. TOTAL FDI OBSERVATION COUNT
-- =========================================================

SELECT COUNT(*) as fdi_observation_count
FROM souvera_country_observations o
JOIN souvera_indicators i ON i.id = o.indicator_id
WHERE i.key = 'fdi_net_inflows_usd';

-- ✅ EXPECTED AFTER INGESTION: > 100
-- ❌ IF 0: World Bank ingestion did not run or FDI indicator not found

-- =========================================================
-- 2. FDI OBSERVATIONS BY YEAR
-- =========================================================

SELECT 
  EXTRACT(YEAR FROM o.period_date) as year,
  COUNT(*) as observation_count,
  COUNT(DISTINCT o.country_id) as country_count
FROM souvera_country_observations o
JOIN souvera_indicators i ON i.id = o.indicator_id
WHERE i.key = 'fdi_net_inflows_usd'
GROUP BY year
ORDER BY year DESC;

-- ✅ EXPECTED: Multiple years (2018-2024), ~50-70 countries per year

-- =========================================================
-- 3. FDI COVERAGE BY COUNTRY
-- =========================================================

SELECT 
  c.iso3,
  c.name,
  c.region,
  COUNT(o.id) as observation_count,
  MIN(o.period_date) as earliest_date,
  MAX(o.period_date) as latest_date,
  MAX(o.value_numeric) as max_fdi_value
FROM souvera_countries c
LEFT JOIN souvera_country_observations o ON o.country_id = c.id
LEFT JOIN souvera_indicators i ON i.id = o.indicator_id AND i.key = 'fdi_net_inflows_usd'
WHERE c.is_active = true
GROUP BY c.iso3, c.name, c.region
HAVING COUNT(o.id) > 0
ORDER BY observation_count DESC, c.region, c.name
LIMIT 30;

-- ✅ EXPECTED: Top countries have 5-7 observations (2018-2024)

-- =========================================================
-- 4. PRIORITY AFRICAN COUNTRIES FDI VERIFICATION
-- =========================================================

SELECT 
  c.iso3,
  c.name,
  COUNT(o.id) as observation_count,
  MAX(o.period_date) as latest_date,
  MAX(o.value_numeric) as latest_fdi_value
FROM souvera_countries c
LEFT JOIN souvera_country_observations o ON o.country_id = c.id
LEFT JOIN souvera_indicators i ON i.id = o.indicator_id AND i.key = 'fdi_net_inflows_usd'
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'EGY', 'MAR', 'CIV', 'ETH', 'GHA')
GROUP BY c.iso3, c.name
ORDER BY c.iso3;

-- ✅ EXPECTED: All 8 countries should have observations
-- Nigeria (NGA), South Africa (ZAF), Kenya (KEN), Egypt (EGY), 
-- Morocco (MAR), Côte d'Ivoire (CIV), Ethiopia (ETH), Ghana (GHA)

-- =========================================================
-- 5. PRIORITY CARIBBEAN COUNTRIES FDI VERIFICATION
-- =========================================================

SELECT 
  c.iso3,
  c.name,
  COUNT(o.id) as observation_count,
  MAX(o.period_date) as latest_date,
  MAX(o.value_numeric) as latest_fdi_value
FROM souvera_countries c
LEFT JOIN souvera_country_observations o ON o.country_id = c.id
LEFT JOIN souvera_indicators i ON i.id = o.indicator_id AND i.key = 'fdi_net_inflows_usd'
WHERE c.iso3 IN ('JAM', 'TTO', 'DOM', 'BRB', 'BHS')
GROUP BY c.iso3, c.name
ORDER BY c.iso3;

-- ✅ EXPECTED: Most Caribbean countries should have observations
-- Jamaica (JAM), Trinidad and Tobago (TTO), Dominican Republic (DOM),
-- Barbados (BRB), Bahamas (BHS)

-- ⚠️  POSSIBLE: Some small islands may have 0 observations (World Bank coverage gaps)

-- =========================================================
-- 6. PROFESSIONAL VIEW FDI EXPOSURE
-- =========================================================

SELECT 
  iso3,
  name,
  fdi_net_inflows_usd
FROM souvera_country_professional_v
WHERE iso3 IN ('NGA', 'ZAF', 'KEN', 'EGY', 'MAR', 'CIV', 'JAM', 'TTO', 'DOM', 'BRB')
ORDER BY iso3;

-- ✅ EXPECTED: fdi_net_inflows_usd should be numeric (not NULL) for most countries
-- ❌ IF ALL NULL: View not pivoting observations correctly

-- =========================================================
-- 7. BUSINESS VIEW FDI EXPOSURE (IF APPLICABLE)
-- =========================================================

SELECT 
  iso3,
  name,
  fdi_net_inflows_usd
FROM souvera_country_business_v
WHERE iso3 IN ('NGA', 'ZAF', 'KEN', 'JAM')
ORDER BY iso3;

-- ✅ EXPECTED: fdi_net_inflows_usd should match professional view

-- =========================================================
-- 8. COUNTRIES WITH FDI DATA VS COUNTRIES WITHOUT
-- =========================================================

WITH fdi_status AS (
  SELECT 
    c.iso3,
    c.name,
    c.region,
    CASE 
      WHEN COUNT(o.id) > 0 THEN 'Has FDI data'
      ELSE 'No FDI data'
    END as status
  FROM souvera_countries c
  LEFT JOIN souvera_country_observations o ON o.country_id = c.id
  LEFT JOIN souvera_indicators i ON i.id = o.indicator_id AND i.key = 'fdi_net_inflows_usd'
  WHERE c.is_active = true
  GROUP BY c.iso3, c.name, c.region
)
SELECT 
  region,
  status,
  COUNT(*) as country_count
FROM fdi_status
GROUP BY region, status
ORDER BY region, status;

-- ✅ EXPECTED OUTPUT EXAMPLE:
-- Africa     | Has FDI data    | ~50
-- Africa     | No FDI data     | ~4
-- Americas   | Has FDI data    | ~15
-- Americas   | No FDI data     | ~5

-- =========================================================
-- 9. FDI INGESTION JOB STATUS
-- =========================================================

SELECT 
  j.id,
  ds.name as source,
  j.job_type,
  j.status,
  j.records_processed,
  j.records_failed,
  j.started_at,
  j.finished_at,
  EXTRACT(EPOCH FROM (j.finished_at - j.started_at)) as duration_seconds
FROM souvera_ingestion_jobs j
JOIN souvera_data_sources ds ON ds.id = j.source_id
WHERE ds.key = 'world_bank'
ORDER BY j.started_at DESC
LIMIT 5;

-- ✅ EXPECTED: Most recent job should have status = 'succeeded'
-- ✅ EXPECTED: records_processed should be > 1000 (4 indicators x 7 years x ~50 countries)

-- =========================================================
-- 10. WORLD BANK SOURCE HEALTH
-- =========================================================

SELECT 
  ds.name,
  sh.status,
  sh.last_success_at,
  sh.last_failure_at,
  sh.failure_count,
  sh.latency_ms
FROM souvera_source_health sh
JOIN souvera_data_sources ds ON ds.id = sh.source_id
WHERE ds.key = 'world_bank';

-- ✅ EXPECTED: status = 'healthy', last_success_at recent

-- =========================================================
-- SUMMARY REPORT
-- =========================================================

DO $$
DECLARE
  fdi_obs_count INTEGER;
  fdi_country_count INTEGER;
  nga_fdi_value NUMERIC;
  prof_view_has_fdi BOOLEAN;
BEGIN
  -- Count FDI observations
  SELECT COUNT(*) INTO fdi_obs_count
  FROM souvera_country_observations o
  JOIN souvera_indicators i ON i.id = o.indicator_id
  WHERE i.key = 'fdi_net_inflows_usd';
  
  -- Count countries with FDI data
  SELECT COUNT(DISTINCT o.country_id) INTO fdi_country_count
  FROM souvera_country_observations o
  JOIN souvera_indicators i ON i.id = o.indicator_id
  WHERE i.key = 'fdi_net_inflows_usd';
  
  -- Check Nigeria FDI value in professional view
  SELECT fdi_net_inflows_usd INTO nga_fdi_value
  FROM souvera_country_professional_v
  WHERE iso3 = 'NGA';
  
  -- Check if professional view has FDI column
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'souvera_country_professional_v'
      AND column_name = 'fdi_net_inflows_usd'
  ) INTO prof_view_has_fdi;
  
  -- Report
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'PHASE 4A — FDI VERIFICATION SUMMARY';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  
  RAISE NOTICE '📊 FDI Observations:';
  IF fdi_obs_count > 0 THEN
    RAISE NOTICE '  ✅ Total observations: %', fdi_obs_count;
    RAISE NOTICE '  ✅ Countries with data: %', fdi_country_count;
  ELSE
    RAISE NOTICE '  ❌ No FDI observations found';
    RAISE NOTICE '  ⚠️  Run: npx tsx services/ingestion/run.ts worldbank';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Professional View:';
  IF prof_view_has_fdi THEN
    RAISE NOTICE '  ✅ fdi_net_inflows_usd column exists';
  ELSE
    RAISE NOTICE '  ❌ fdi_net_inflows_usd column missing';
  END IF;
  
  IF nga_fdi_value IS NOT NULL THEN
    RAISE NOTICE '  ✅ Nigeria FDI value: $%', nga_fdi_value;
  ELSE
    RAISE NOTICE '  ⚠️  Nigeria FDI value: NULL (may need data or ingestion)';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
END $$;
