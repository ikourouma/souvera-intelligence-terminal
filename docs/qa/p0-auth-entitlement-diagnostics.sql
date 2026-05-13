-- =========================================================
-- P0 AUTH + ENTITLEMENT DIAGNOSTICS SQL
-- Souvera Intelligence Terminal
-- Owner: Afronovation, Inc.
-- Date: 2026-05-01
-- Purpose: Comprehensive diagnosis of tier resolution
-- =========================================================
--
-- SECURITY: Do not include passwords or service role keys
-- Run these queries in Supabase SQL Editor as authenticated admin
--
-- =========================================================

-- ═══════════════════════════════════════════════════════════
-- SECTION 1: SCHEMA RELATIONSHIP VERIFICATION
-- ═══════════════════════════════════════════════════════════

-- 1A. Foreign key relationships (CRITICAL)
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS references_table,
  ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN (
    'souvera_profiles', 
    'souvera_subscriptions', 
    'souvera_organization_members'
  )
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

/*
EXPECTED RESULTS:
- souvera_profiles.id → auth.users.id (1:1 direct reference)
- souvera_subscriptions.user_id → souvera_profiles.id (N:1 relationship)
- souvera_organization_members.user_id → souvera_profiles.id

CRITICAL: auth.uid() = souvera_profiles.id = souvera_subscriptions.user_id
*/

-- ═══════════════════════════════════════════════════════════
-- SECTION 2: RLS STATUS AND POLICIES
-- ═══════════════════════════════════════════════════════════

-- 2A. RLS enabled status
SELECT 
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'souvera_profiles',
    'souvera_subscriptions',
    'souvera_plans',
    'souvera_plan_entitlements',
    'souvera_organization_members'
  )
ORDER BY c.relname;

-- 2B. All RLS policies on relevant tables
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  permissive,
  roles,
  qual as using_expression
FROM pg_policies 
WHERE tablename IN (
  'souvera_profiles',
  'souvera_subscriptions',
  'souvera_plans',
  'souvera_plan_entitlements',
  'souvera_organization_members'
)
ORDER BY tablename, policyname;

/*
EXPECTED POST-FIX:
- souvera_subscriptions: "Users can read their own subscriptions" 
  USING (user_id = auth.uid()) -- NO org subquery
- souvera_organization_members: "Users can read their own organization memberships"
  USING (user_id = auth.uid())
*/

-- ═══════════════════════════════════════════════════════════
-- SECTION 3: AUTH.USERS AND PROFILES ALIGNMENT
-- ═══════════════════════════════════════════════════════════

-- 3A. Test users in auth.users
SELECT 
  id as auth_user_id,
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  created_at
FROM auth.users
WHERE email LIKE '%@afronovation.com'
ORDER BY email;

-- 3B. Test user profiles
SELECT 
  id as profile_id,
  email,
  full_name,
  created_at
FROM souvera_profiles
WHERE email LIKE '%@afronovation.com'
ORDER BY email;

-- 3C. Profile-Auth alignment check (IDs should match exactly)
SELECT 
  a.id as auth_id,
  a.email as auth_email,
  p.id as profile_id,
  p.email as profile_email,
  CASE 
    WHEN a.id = p.id THEN '✓ ALIGNED'
    ELSE '✗ MISALIGNED'
  END as id_alignment
FROM auth.users a
LEFT JOIN souvera_profiles p ON a.id = p.id
WHERE a.email LIKE '%@afronovation.com'
ORDER BY a.email;

-- ═══════════════════════════════════════════════════════════
-- SECTION 4: SUBSCRIPTION VERIFICATION
-- ═══════════════════════════════════════════════════════════

-- 4A. All subscriptions for test users
SELECT 
  s.id as subscription_id,
  s.user_id,
  p.email,
  s.plan_id,
  s.status,
  s.starts_at,
  s.ends_at,
  s.created_at
FROM souvera_subscriptions s
JOIN souvera_profiles p ON p.id = s.user_id
WHERE p.email LIKE '%@afronovation.com'
ORDER BY p.email, s.created_at;

-- 4B. Check for duplicate active subscriptions (PROBLEM INDICATOR)
SELECT 
  p.email,
  COUNT(*) as active_subscription_count,
  STRING_AGG(s.plan_id, ', ' ORDER BY s.created_at) as plans
FROM souvera_subscriptions s
JOIN souvera_profiles p ON p.id = s.user_id
WHERE s.status IN ('trial', 'active')
  AND p.email LIKE '%@afronovation.com'
GROUP BY p.email
HAVING COUNT(*) > 1;

/*
If this returns rows, duplicate subscriptions exist.
Run seed-test-users.ts to fix.
*/

-- 4C. Expected vs actual tier mapping
WITH expected_mapping AS (
  SELECT 'explorer@afronovation.com' as email, 'explorer' as expected_plan
  UNION ALL SELECT 'professional@afronovation.com', 'professional'
  UNION ALL SELECT 'business@afronovation.com', 'business'
  UNION ALL SELECT 'institutional@afronovation.com', 'institutional'
),
actual_mapping AS (
  SELECT 
    p.email,
    s.plan_id as actual_plan,
    s.status,
    ROW_NUMBER() OVER (
      PARTITION BY p.email 
      ORDER BY pl.rank DESC, s.created_at DESC
    ) as rn
  FROM souvera_subscriptions s
  JOIN souvera_profiles p ON p.id = s.user_id
  JOIN souvera_plans pl ON pl.id = s.plan_id
  WHERE s.status IN ('trial', 'active')
    AND p.email LIKE '%@afronovation.com'
)
SELECT 
  e.email,
  e.expected_plan,
  a.actual_plan,
  CASE 
    WHEN e.expected_plan = a.actual_plan THEN '✓ CORRECT'
    WHEN a.actual_plan IS NULL THEN '✗ NO ACTIVE SUBSCRIPTION'
    ELSE '✗ WRONG PLAN'
  END as status
FROM expected_mapping e
LEFT JOIN actual_mapping a ON e.email = a.email AND a.rn = 1
ORDER BY e.email;

-- ═══════════════════════════════════════════════════════════
-- SECTION 5: PLAN AND ENTITLEMENT VERIFICATION
-- ═══════════════════════════════════════════════════════════

-- 5A. All plans with ranks
SELECT 
  id as plan_id,
  name as plan_name,
  rank,
  is_public,
  is_enterprise
FROM souvera_plans
ORDER BY rank;

-- 5B. Entitlements per plan (focus on full_macro for FDI access)
SELECT 
  pe.plan_id,
  pl.name as plan_name,
  pl.rank,
  STRING_AGG(pe.entitlement_key, ', ' ORDER BY pe.entitlement_key) as entitlements,
  CASE 
    WHEN 'full_macro' = ANY(ARRAY_AGG(pe.entitlement_key)) THEN '✓ HAS full_macro'
    ELSE '✗ NO full_macro'
  END as fdi_access
FROM souvera_plan_entitlements pe
JOIN souvera_plans pl ON pl.id = pe.plan_id
WHERE pe.plan_id IN ('explorer', 'professional', 'business', 'institutional')
GROUP BY pe.plan_id, pl.name, pl.rank
ORDER BY pl.rank;

-- 5C. Check if full_macro entitlement exists
SELECT * FROM souvera_entitlements WHERE key = 'full_macro';

-- ═══════════════════════════════════════════════════════════
-- SECTION 6: COMPREHENSIVE TEST USER SUMMARY
-- ═══════════════════════════════════════════════════════════

WITH test_users AS (
  SELECT 
    a.id as auth_id,
    a.email,
    a.email_confirmed_at IS NOT NULL as email_confirmed
  FROM auth.users a
  WHERE a.email LIKE '%@afronovation.com'
),
profiles AS (
  SELECT id as profile_id, email, full_name FROM souvera_profiles
  WHERE email LIKE '%@afronovation.com'
),
active_subs AS (
  SELECT 
    s.user_id,
    s.plan_id,
    s.status,
    pl.rank as plan_rank,
    ROW_NUMBER() OVER (
      PARTITION BY s.user_id 
      ORDER BY pl.rank DESC
    ) as rn
  FROM souvera_subscriptions s
  JOIN souvera_plans pl ON pl.id = s.plan_id
  WHERE s.status IN ('trial', 'active')
),
expected AS (
  SELECT 'explorer@afronovation.com' as email, 'explorer' as expected_plan, 1 as expected_rank
  UNION ALL SELECT 'professional@afronovation.com', 'professional', 2
  UNION ALL SELECT 'business@afronovation.com', 'business', 3
  UNION ALL SELECT 'institutional@afronovation.com', 'institutional', 5
)
SELECT 
  t.email,
  t.email_confirmed,
  CASE WHEN p.profile_id IS NOT NULL THEN '✓' ELSE '✗' END as has_profile,
  CASE WHEN t.auth_id = p.profile_id THEN '✓' ELSE '✗' END as id_aligned,
  p.full_name,
  COALESCE(s.plan_id, 'NONE') as actual_plan,
  COALESCE(s.plan_rank::text, 'N/A') as actual_rank,
  e.expected_plan,
  e.expected_rank,
  CASE 
    WHEN s.plan_id = e.expected_plan THEN '✓ PASS'
    WHEN s.plan_id IS NULL THEN '✗ NO SUB'
    ELSE '✗ WRONG'
  END as verdict
FROM test_users t
LEFT JOIN profiles p ON t.email = p.email
LEFT JOIN active_subs s ON p.profile_id = s.user_id AND s.rn = 1
LEFT JOIN expected e ON t.email = e.email
ORDER BY t.email;

-- ═══════════════════════════════════════════════════════════
-- END OF DIAGNOSTICS
-- ═══════════════════════════════════════════════════════════
