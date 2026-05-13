-- =========================================================
-- PHASE 4A — MASTER VERIFICATION (READ-ONLY)
-- Souvera Intelligence Terminal
-- Owner: Afronovation, Inc.
-- Date: 2026-05-04
-- =========================================================
--
-- This file combines all Phase 4A read-only verification
-- queries into a single master script for convenience.
--
-- SAFE TO RUN: This script only reads data. It does not:
-- - Insert data
-- - Update data
-- - Delete data
-- - Alter policies
-- - Alter schema
--
-- RUN THIS IN SUPABASE SQL EDITOR AFTER:
-- 1. SQL v1.10 has been applied
-- 2. World Bank ingestion has completed
-- =========================================================

-- =========================================================
-- SECTION 1: SQL v1.10 RLS VERIFICATION
-- =========================================================

-- Check legacy policies are removed
SELECT COUNT(*) as legacy_policy_count
FROM pg_policies
WHERE tablename IN ('souvera_subscriptions', 'souvera_organization_members')
  AND policyname IN (
    'souvera_subscriptions_select_self_or_org',
    'souvera_org_members_select_same_org'
  );
-- ✅ EXPECTED: 0

-- Check simple policies exist
SELECT 
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE tablename IN (
  'souvera_subscriptions',
  'souvera_organization_members'
)
ORDER BY tablename, policyname;
-- ✅ EXPECTED: 2 rows with simple self-read policies

-- =========================================================
-- SECTION 2: FDI INDICATOR VERIFICATION
-- =========================================================

-- Check FDI indicator exists
SELECT 
  id,
  key,
  label,
  domain,
  min_plan_id
FROM souvera_indicators
WHERE key = 'fdi_net_inflows_usd';
-- ✅ EXPECTED: 1 row

-- Check professional view has FDI column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'souvera_country_professional_v'
  AND column_name = 'fdi_net_inflows_usd';
-- ✅ EXPECTED: 1 row

-- =========================================================
-- SECTION 3: FDI OBSERVATION VERIFICATION
-- =========================================================

-- Total FDI observations
SELECT COUNT(*) as fdi_observation_count
FROM souvera_country_observations o
JOIN souvera_indicators i ON i.id = o.indicator_id
WHERE i.key = 'fdi_net_inflows_usd';
-- ✅ AFTER INGESTION: > 100

-- FDI observations by year
SELECT 
  EXTRACT(YEAR FROM o.period_date) as year,
  COUNT(*) as observation_count
FROM souvera_country_observations o
JOIN souvera_indicators i ON i.id = o.indicator_id
WHERE i.key = 'fdi_net_inflows_usd'
GROUP BY year
ORDER BY year DESC;

-- Priority countries FDI check
SELECT 
  c.iso3,
  c.name,
  COUNT(o.id) as observation_count,
  MAX(o.period_date) as latest_date
FROM souvera_countries c
LEFT JOIN souvera_country_observations o ON o.country_id = c.id
LEFT JOIN souvera_indicators i ON i.id = o.indicator_id AND i.key = 'fdi_net_inflows_usd'
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'EGY', 'MAR', 'JAM', 'TTO', 'DOM')
GROUP BY c.iso3, c.name
ORDER BY c.iso3;

-- Professional view FDI exposure
SELECT 
  iso3,
  name,
  fdi_net_inflows_usd
FROM souvera_country_professional_v
WHERE iso3 IN ('NGA', 'ZAF', 'KEN', 'JAM', 'TTO')
ORDER BY iso3;

-- =========================================================
-- SECTION 4: MARKET COUNT VERIFICATION
-- =========================================================

-- Africa count (should be 54)
WITH approved_africa AS (
  SELECT unnest(ARRAY[
    'MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN',
    'NGA', 'GHA', 'SEN', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR', 'CIV', 'TGO', 'BEN', 'GMB', 'GNB', 'CPV', 'MRT',
    'ETH', 'KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SOM', 'DJI', 'ERI', 'MDG', 'COM', 'MUS', 'SYC', 'SSD',
    'CMR', 'CAF', 'COD', 'COG', 'GAB', 'GNQ', 'STP', 'TCD', 'AGO',
    'ZAF', 'BWA', 'LSO', 'SWZ', 'NAM', 'ZWE', 'MOZ', 'ZMB', 'MWI'
  ]) AS iso3
)
SELECT COUNT(*) as africa_count
FROM souvera_countries c
JOIN approved_africa a ON a.iso3 = c.iso3
WHERE c.is_active = true;
-- ✅ EXPECTED: 54

-- Caribbean count (should be 20)
WITH approved_caribbean AS (
  SELECT unnest(ARRAY[
    'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA',
    'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ', 'PRI', 'VGB', 'TCA', 'CYM'
  ]) AS iso3
)
SELECT COUNT(*) as caribbean_count
FROM souvera_countries c
JOIN approved_caribbean a ON a.iso3 = c.iso3
WHERE c.is_active = true;
-- ✅ EXPECTED: 20

-- All regions count (should be 74)
WITH approved_africa AS (
  SELECT unnest(ARRAY[
    'MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN',
    'NGA', 'GHA', 'SEN', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR', 'CIV', 'TGO', 'BEN', 'GMB', 'GNB', 'CPV', 'MRT',
    'ETH', 'KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SOM', 'DJI', 'ERI', 'MDG', 'COM', 'MUS', 'SYC', 'SSD',
    'CMR', 'CAF', 'COD', 'COG', 'GAB', 'GNQ', 'STP', 'TCD', 'AGO',
    'ZAF', 'BWA', 'LSO', 'SWZ', 'NAM', 'ZWE', 'MOZ', 'ZMB', 'MWI'
  ]) AS iso3
),
approved_caribbean AS (
  SELECT unnest(ARRAY[
    'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA',
    'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ', 'PRI', 'VGB', 'TCA', 'CYM'
  ]) AS iso3
)
SELECT COUNT(DISTINCT c.iso3) as all_regions_count
FROM souvera_countries c
WHERE c.is_active = true
  AND (
    c.iso3 IN (SELECT iso3 FROM approved_africa)
    OR c.iso3 IN (SELECT iso3 FROM approved_caribbean)
  );
-- ✅ EXPECTED: 74

-- Check no Western Sahara (ESH)
SELECT COUNT(*) as esh_count
FROM souvera_countries
WHERE iso3 = 'ESH';
-- ✅ EXPECTED: 0

-- Check no duplicate ISO3
SELECT 
  iso3,
  COUNT(*) as duplicate_count
FROM souvera_countries
WHERE is_active = true
GROUP BY iso3
HAVING COUNT(*) > 1;
-- ✅ EXPECTED: 0 rows

-- =========================================================
-- SECTION 5: SECTOR READINESS VERIFICATION
-- =========================================================

-- Total sector rows
SELECT COUNT(*) as total_sector_rows
FROM souvera_country_sectors;
-- ✅ BEFORE DATA-SEED-01: 0 or low
-- ✅ AFTER DATA-SEED-01: ~100

-- Priority Africa sector readiness
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

-- Priority Caribbean sector readiness
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

-- =========================================================
-- SECTION 6: INGESTION JOB HISTORY
-- =========================================================

-- Recent World Bank jobs
SELECT 
  j.id,
  ds.name as source,
  j.job_type,
  j.status,
  j.records_processed,
  j.records_failed,
  j.started_at,
  j.finished_at
FROM souvera_ingestion_jobs j
JOIN souvera_data_sources ds ON ds.id = j.source_id
WHERE ds.key = 'world_bank'
ORDER BY j.started_at DESC
LIMIT 5;

-- World Bank source health
SELECT 
  ds.name,
  sh.status,
  sh.last_success_at,
  sh.last_failure_at,
  sh.failure_count
FROM souvera_source_health sh
JOIN souvera_data_sources ds ON ds.id = sh.source_id
WHERE ds.key = 'world_bank';

-- =========================================================
-- COMPREHENSIVE SUMMARY
-- =========================================================

DO $$
DECLARE
  -- RLS
  legacy_count INTEGER;
  
  -- FDI
  fdi_indicator_exists BOOLEAN;
  fdi_obs_count INTEGER;
  fdi_column_exists BOOLEAN;
  nga_fdi_value NUMERIC;
  
  -- Market counts
  africa_count INTEGER;
  caribbean_count INTEGER;
  all_count INTEGER;
  esh_count INTEGER;
  duplicate_count INTEGER;
  
  -- Sectors
  total_sectors INTEGER;
  priority_africa_ready INTEGER;
  priority_caribbean_ready INTEGER;
BEGIN
  -- RLS verification
  SELECT COUNT(*) INTO legacy_count
  FROM pg_policies
  WHERE tablename IN ('souvera_subscriptions', 'souvera_organization_members')
    AND policyname IN (
      'souvera_subscriptions_select_self_or_org',
      'souvera_org_members_select_same_org'
    );
  
  -- FDI verification
  SELECT EXISTS(
    SELECT 1 FROM souvera_indicators WHERE key = 'fdi_net_inflows_usd'
  ) INTO fdi_indicator_exists;
  
  SELECT COUNT(*) INTO fdi_obs_count
  FROM souvera_country_observations o
  JOIN souvera_indicators i ON i.id = o.indicator_id
  WHERE i.key = 'fdi_net_inflows_usd';
  
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'souvera_country_professional_v'
      AND column_name = 'fdi_net_inflows_usd'
  ) INTO fdi_column_exists;
  
  SELECT fdi_net_inflows_usd INTO nga_fdi_value
  FROM souvera_country_professional_v
  WHERE iso3 = 'NGA';
  
  -- Market counts
  WITH approved_africa AS (
    SELECT unnest(ARRAY[
      'MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN',
      'NGA', 'GHA', 'SEN', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR', 'CIV', 'TGO', 'BEN', 'GMB', 'GNB', 'CPV', 'MRT',
      'ETH', 'KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SOM', 'DJI', 'ERI', 'MDG', 'COM', 'MUS', 'SYC', 'SSD',
      'CMR', 'CAF', 'COD', 'COG', 'GAB', 'GNQ', 'STP', 'TCD', 'AGO',
      'ZAF', 'BWA', 'LSO', 'SWZ', 'NAM', 'ZWE', 'MOZ', 'ZMB', 'MWI'
    ]) AS iso3
  )
  SELECT COUNT(*) INTO africa_count
  FROM souvera_countries c
  JOIN approved_africa a ON a.iso3 = c.iso3
  WHERE c.is_active = true;
  
  WITH approved_caribbean AS (
    SELECT unnest(ARRAY[
      'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA',
      'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ', 'PRI', 'VGB', 'TCA', 'CYM'
    ]) AS iso3
  )
  SELECT COUNT(*) INTO caribbean_count
  FROM souvera_countries c
  JOIN approved_caribbean a ON a.iso3 = c.iso3
  WHERE c.is_active = true;
  
  all_count := africa_count + caribbean_count;
  
  SELECT COUNT(*) INTO esh_count
  FROM souvera_countries WHERE iso3 = 'ESH';
  
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT iso3
    FROM souvera_countries
    WHERE is_active = true
    GROUP BY iso3
    HAVING COUNT(*) > 1
  ) dup;
  
  -- Sector readiness
  SELECT COUNT(*) INTO total_sectors
  FROM souvera_country_sectors;
  
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
  
  -- Generate report
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'PHASE 4A — MASTER VERIFICATION SUMMARY';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  
  RAISE NOTICE '1️⃣  SQL v1.10 RLS:';
  IF legacy_count = 0 THEN
    RAISE NOTICE '  ✅ Legacy policies removed';
  ELSE
    RAISE NOTICE '  ❌ % legacy policies remain', legacy_count;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '2️⃣  FDI Ingestion:';
  IF fdi_indicator_exists THEN
    RAISE NOTICE '  ✅ FDI indicator exists';
  ELSE
    RAISE NOTICE '  ❌ FDI indicator missing';
  END IF;
  
  IF fdi_column_exists THEN
    RAISE NOTICE '  ✅ Professional view has FDI column';
  ELSE
    RAISE NOTICE '  ❌ Professional view missing FDI column';
  END IF;
  
  IF fdi_obs_count > 0 THEN
    RAISE NOTICE '  ✅ FDI observations: %', fdi_obs_count;
  ELSE
    RAISE NOTICE '  ⚠️  No FDI observations (run ingestion)';
  END IF;
  
  IF nga_fdi_value IS NOT NULL THEN
    RAISE NOTICE '  ✅ Nigeria FDI: $%', nga_fdi_value;
  ELSE
    RAISE NOTICE '  ⚠️  Nigeria FDI: NULL';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '3️⃣  Market Counts:';
  IF africa_count = 54 THEN
    RAISE NOTICE '  ✅ Africa: 54';
  ELSE
    RAISE NOTICE '  ❌ Africa: % (expected 54)', africa_count;
  END IF;
  
  IF caribbean_count = 20 THEN
    RAISE NOTICE '  ✅ Caribbean: 20';
  ELSE
    RAISE NOTICE '  ❌ Caribbean: % (expected 20)', caribbean_count;
  END IF;
  
  IF all_count = 74 THEN
    RAISE NOTICE '  ✅ All Regions: 74';
  ELSE
    RAISE NOTICE '  ❌ All Regions: % (expected 74)', all_count;
  END IF;
  
  IF esh_count = 0 THEN
    RAISE NOTICE '  ✅ Western Sahara excluded';
  ELSE
    RAISE NOTICE '  ⚠️  Western Sahara in database';
  END IF;
  
  IF duplicate_count = 0 THEN
    RAISE NOTICE '  ✅ No duplicate ISO3';
  ELSE
    RAISE NOTICE '  ❌ % duplicate ISO3 codes', duplicate_count;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '4️⃣  Sector Data:';
  RAISE NOTICE '  Total rows: %', total_sectors;
  
  IF priority_africa_ready = 15 THEN
    RAISE NOTICE '  ✅ Priority Africa: 15/15 ready';
  ELSE
    RAISE NOTICE '  ⏳ Priority Africa: %/15 ready', priority_africa_ready;
  END IF;
  
  IF priority_caribbean_ready = 5 THEN
    RAISE NOTICE '  ✅ Priority Caribbean: 5/5 ready';
  ELSE
    RAISE NOTICE '  ⏳ Priority Caribbean: %/5 ready', priority_caribbean_ready;
  END IF;
  
  IF total_sectors < 100 THEN
    RAISE NOTICE '  ⚠️  Run DATA-SEED-01 to seed sectors';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
END $$;
