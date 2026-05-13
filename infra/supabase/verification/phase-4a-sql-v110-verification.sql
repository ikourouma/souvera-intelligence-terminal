-- =========================================================
-- PHASE 4A — SQL v1.10 VERIFICATION QUERIES
-- Souvera Intelligence Terminal
-- Owner: Afronovation, Inc.
-- Date: 2026-05-04
-- =========================================================
--
-- These queries verify that SQL Pack v1.10 was successfully
-- applied and that RLS recursion has been eliminated.
--
-- RUN THESE QUERIES MANUALLY IN SUPABASE SQL EDITOR
-- =========================================================

-- =========================================================
-- 1. CHECK POLICY STATE FOR KEY TABLES
-- =========================================================

-- Expected: Only simple self-read policies should exist
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

-- ✅ EXPECTED OUTPUT:
-- souvera_subscriptions | Users can read their own subscriptions | SELECT
-- souvera_organization_members | Users can read their own organization memberships | SELECT

-- ❌ MUST NOT SEE:
-- souvera_subscriptions_select_self_or_org
-- souvera_org_members_select_same_org

-- =========================================================
-- 2. VERIFY LEGACY POLICIES ARE GONE
-- =========================================================

SELECT COUNT(*) as legacy_policy_count
FROM pg_policies
WHERE tablename IN ('souvera_subscriptions', 'souvera_organization_members')
  AND policyname IN (
    'souvera_subscriptions_select_self_or_org',
    'souvera_org_members_select_same_org'
  );

-- ✅ EXPECTED: 0
-- ❌ IF > 0: SQL v1.10 NOT APPLIED

-- =========================================================
-- 3. CHECK INDICATOR REGISTRY FOR FDI
-- =========================================================

SELECT 
  id,
  key,
  label,
  domain,
  min_plan_id
FROM souvera_indicators
WHERE key = 'fdi_net_inflows_usd';

-- ✅ EXPECTED: 1 row
-- key: fdi_net_inflows_usd
-- label: FDI Net Inflows
-- domain: investment
-- min_plan_id: professional

-- =========================================================
-- 4. VERIFY TIERED VIEWS EXPOSE FDI
-- =========================================================

-- Check if professional view includes FDI column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'souvera_country_professional_v'
  AND column_name = 'fdi_net_inflows_usd';

-- ✅ EXPECTED: 1 row (fdi_net_inflows_usd | numeric)

-- =========================================================
-- 5. CHECK FDI OBSERVATION COUNT (BEFORE INGESTION)
-- =========================================================

SELECT COUNT(*) as fdi_observation_count
FROM souvera_country_observations o
JOIN souvera_indicators i ON i.id = o.indicator_id
WHERE i.key = 'fdi_net_inflows_usd';

-- ✅ BEFORE INGESTION: 0 or low count (seed data only)
-- ✅ AFTER INGESTION: Should be > 100

-- =========================================================
-- 6. TEST TIER RESOLUTION (IF USERS EXIST)
-- =========================================================

-- Check test users and their plan assignments
SELECT 
  p.email,
  s.plan_id,
  pl.name as plan_name
FROM souvera_profiles p
LEFT JOIN souvera_subscriptions s ON s.user_id = p.id AND s.status = 'active'
LEFT JOIN souvera_plans pl ON pl.id = s.plan_id
WHERE p.email IN (
  'explorer@afronovation.com',
  'professional@afronovation.com',
  'business@afronovation.com',
  'institutional@afronovation.com'
)
ORDER BY pl.priority_rank;

-- ✅ EXPECTED:
-- explorer@       | explorer      | Explorer Plan
-- professional@   | professional  | Professional Plan
-- business@       | business      | Business Plan
-- institutional@  | institutional | Institutional Plan

-- =========================================================
-- 7. VERIFY DATA SOURCE FOR WORLD BANK
-- =========================================================

SELECT 
  id,
  key,
  name,
  base_url,
  status
FROM souvera_data_sources
WHERE key = 'world_bank';

-- ✅ EXPECTED: 1 row
-- key: world_bank
-- status: configured (or pending if not run yet)

-- =========================================================
-- VERIFICATION SUMMARY
-- =========================================================

DO $$
DECLARE
  legacy_count INTEGER;
  fdi_indicator_exists BOOLEAN;
  fdi_column_exists BOOLEAN;
BEGIN
  -- Check legacy policies
  SELECT COUNT(*) INTO legacy_count
  FROM pg_policies
  WHERE tablename IN ('souvera_subscriptions', 'souvera_organization_members')
    AND policyname IN (
      'souvera_subscriptions_select_self_or_org',
      'souvera_org_members_select_same_org'
    );
  
  -- Check FDI indicator
  SELECT EXISTS(
    SELECT 1 FROM souvera_indicators WHERE key = 'fdi_net_inflows_usd'
  ) INTO fdi_indicator_exists;
  
  -- Check FDI column in professional view
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'souvera_country_professional_v'
      AND column_name = 'fdi_net_inflows_usd'
  ) INTO fdi_column_exists;
  
  -- Report
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'PHASE 4A — SQL v1.10 VERIFICATION REPORT';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  
  IF legacy_count = 0 THEN
    RAISE NOTICE '✅ SQL v1.10 APPLIED: Legacy policies removed';
  ELSE
    RAISE NOTICE '❌ SQL v1.10 NOT APPLIED: % legacy policies remain', legacy_count;
  END IF;
  
  IF fdi_indicator_exists THEN
    RAISE NOTICE '✅ FDI indicator exists in souvera_indicators';
  ELSE
    RAISE NOTICE '❌ FDI indicator missing from souvera_indicators';
  END IF;
  
  IF fdi_column_exists THEN
    RAISE NOTICE '✅ FDI column exists in souvera_country_professional_v';
  ELSE
    RAISE NOTICE '❌ FDI column missing from professional view';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
END $$;
