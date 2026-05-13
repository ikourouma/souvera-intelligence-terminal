-- =========================================================
-- SOUVERA TIER RESOLUTION VERIFICATION SQL
-- Owner: Afronovation, Inc.
-- Purpose: Diagnose and verify tier resolution issues
-- =========================================================

-- ─────────────────────────────────────────────────────────
-- 0. SCHEMA RELATIONSHIP VERIFICATION (CRITICAL)
-- ─────────────────────────────────────────────────────────

-- Verify the foreign key relationships that RLS policies depend on
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('souvera_profiles', 'souvera_subscriptions')
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Expected:
-- souvera_profiles.id → auth.users.id (1:1 relationship)
-- souvera_subscriptions.user_id → souvera_profiles.id (N:1 relationship)
-- souvera_subscriptions.organization_id → souvera_organizations.id
--
-- CRITICAL: This means auth.uid() = souvera_profiles.id = souvera_subscriptions.user_id
-- RLS policy MUST use: user_id = auth.uid() (works because of transitive relationship)

-- ─────────────────────────────────────────────────────────
-- 1. Check RLS Status on Relevant Tables
-- ─────────────────────────────────────────────────────────

SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname IN (
  'souvera_profiles',
  'souvera_subscriptions',
  'souvera_plans',
  'souvera_plan_entitlements'
)
ORDER BY relname;

-- Expected: rls_enabled = true for all tables
-- If false, RLS is not enabled and all queries are allowed (security risk)
-- If true, check if appropriate SELECT policies exist for users

-- ─────────────────────────────────────────────────────────
-- 2. List All RLS Policies on Relevant Tables
-- ─────────────────────────────────────────────────────────

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  permissive,
  roles
FROM pg_policies 
WHERE tablename IN (
  'souvera_profiles',
  'souvera_subscriptions',
  'souvera_plans',
  'souvera_plan_entitlements'
)
ORDER BY tablename, policyname;

-- Expected policies:
-- souvera_profiles: "Users can read their own profile"
-- souvera_profiles: "Users can update their own profile"
-- souvera_subscriptions: "Users can read their own subscriptions"
-- souvera_plans: "Plans are publicly readable"
-- souvera_plan_entitlements: "Plan entitlements are publicly readable"

-- Missing policies indicate RLS is blocking frontend queries

-- ─────────────────────────────────────────────────────────
-- 3. Verify Test User Profiles Exist
-- ─────────────────────────────────────────────────────────

SELECT 
  p.id as profile_id,
  p.email,
  p.full_name,
  p.created_at
FROM souvera_profiles p
WHERE p.email LIKE '%@afronovation.com'
ORDER BY p.email;

-- Expected: 4 rows
-- - explorer@afronovation.com
-- - professional@afronovation.com
-- - business@afronovation.com
-- - institutional@afronovation.com

-- ─────────────────────────────────────────────────────────
-- 4. Check Active Subscriptions for Test Users
-- ─────────────────────────────────────────────────────────

SELECT 
  p.email,
  s.id as subscription_id,
  s.user_id,
  s.plan_id,
  s.status,
  s.starts_at,
  s.ends_at,
  s.created_at
FROM souvera_profiles p
LEFT JOIN souvera_subscriptions s ON s.user_id = p.id
WHERE p.email LIKE '%@afronovation.com'
ORDER BY p.email, s.created_at DESC;

-- Expected: Each test user has at least one subscription
-- Check if status = 'active' for correct plan
-- Check if multiple subscriptions exist (duplicate issue)

-- ─────────────────────────────────────────────────────────
-- 5. Detect Duplicate Active Subscriptions
-- ─────────────────────────────────────────────────────────

SELECT 
  p.email,
  COUNT(s.id) as active_subscription_count,
  string_agg(s.plan_id, ', ' ORDER BY s.created_at DESC) as plans_list,
  string_agg(s.id::text, ', ' ORDER BY s.created_at DESC) as subscription_ids
FROM souvera_profiles p
LEFT JOIN souvera_subscriptions s ON s.user_id = p.id AND s.status IN ('trial', 'active')
WHERE p.email LIKE '%@afronovation.com'
GROUP BY p.email, p.id
HAVING COUNT(s.id) > 1
ORDER BY p.email;

-- Expected: 0 rows (no duplicates)
-- If rows returned, user has multiple active subscriptions
-- Script should deactivate older subscriptions

-- ─────────────────────────────────────────────────────────
-- 6. Verify Correct Plan Assignment
-- ─────────────────────────────────────────────────────────

SELECT 
  p.email,
  s.plan_id as actual_plan,
  CASE p.email
    WHEN 'explorer@afronovation.com' THEN 'explorer'
    WHEN 'professional@afronovation.com' THEN 'professional'
    WHEN 'business@afronovation.com' THEN 'business'
    WHEN 'institutional@afronovation.com' THEN 'institutional'
  END as expected_plan,
  CASE 
    WHEN s.plan_id = CASE p.email
      WHEN 'explorer@afronovation.com' THEN 'explorer'
      WHEN 'professional@afronovation.com' THEN 'professional'
      WHEN 'business@afronovation.com' THEN 'business'
      WHEN 'institutional@afronovation.com' THEN 'institutional'
    END THEN '✓ CORRECT'
    ELSE '✗ WRONG'
  END as status
FROM souvera_profiles p
JOIN souvera_subscriptions s ON s.user_id = p.id AND s.status IN ('trial', 'active')
WHERE p.email LIKE '%@afronovation.com'
ORDER BY p.email;

-- Expected: All rows show '✓ CORRECT'
-- If '✗ WRONG', provisioning script did not assign correct plan

-- ─────────────────────────────────────────────────────────
-- 7. Verify Plan Ranks and Entitlements
-- ─────────────────────────────────────────────────────────

SELECT 
  pl.id as plan_id,
  pl.name,
  pl.rank,
  COUNT(pe.entitlement_key) as entitlement_count,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM souvera_plan_entitlements pe2 
      WHERE pe2.plan_id = pl.id AND pe2.entitlement_key = 'full_macro'
    ) THEN '✓ HAS FDI'
    ELSE '✗ NO FDI'
  END as fdi_access
FROM souvera_plans pl
LEFT JOIN souvera_plan_entitlements pe ON pe.plan_id = pl.id
WHERE pl.id IN ('explorer', 'professional', 'business', 'institutional')
GROUP BY pl.id, pl.name, pl.rank
ORDER BY pl.rank;

-- Expected:
-- explorer: rank 10, NO FDI
-- professional: rank 20, HAS FDI
-- business: rank 30, HAS FDI
-- institutional: rank 50, HAS FDI

-- ─────────────────────────────────────────────────────────
-- 8. Test User-Specific Subscription Query (Simulated)
-- ─────────────────────────────────────────────────────────

-- Simulates what AccountMenu.tsx queries
-- Run for each test user by changing the email filter
SELECT 
  s.plan_id,
  s.status,
  s.created_at
FROM souvera_subscriptions s
WHERE s.user_id = (SELECT id FROM souvera_profiles WHERE email = 'professional@afronovation.com')
  AND s.status IN ('trial', 'active')
ORDER BY s.created_at DESC
LIMIT 1;

-- Expected: plan_id = 'professional', status = 'active'
-- If no rows returned, subscription is missing or RLS is blocking
-- Repeat for other test users

-- ─────────────────────────────────────────────────────────
-- 9. Check Profile Trigger Behavior
-- ─────────────────────────────────────────────────────────

-- Check if profile creation trigger exists
SELECT 
  tgname as trigger_name,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE tgname LIKE '%profile%'
  AND tgrelid = 'souvera_profiles'::regclass;

-- Expected: on_profile_created_process_invite trigger exists
-- This trigger creates a default 'explorer' subscription if no invitation

-- ─────────────────────────────────────────────────────────
-- 10. Comprehensive Test User Summary
-- ─────────────────────────────────────────────────────────

SELECT 
  p.email,
  p.id as user_id,
  s.plan_id as current_plan,
  pl.rank as plan_rank,
  s.status as subscription_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM souvera_plan_entitlements pe 
      WHERE pe.plan_id = s.plan_id 
      AND pe.entitlement_key = 'full_macro'
    ) THEN '✓ FDI Unlocked'
    ELSE '✗ FDI Locked'
  END as fdi_access,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM souvera_plan_entitlements pe 
      WHERE pe.plan_id = s.plan_id 
      AND pe.entitlement_key = 'sector_rationale'
    ) THEN '✓ 5 Sectors'
    ELSE '✗ 1 Sector'
  END as sector_access,
  s.created_at as subscription_created,
  p.created_at as profile_created
FROM souvera_profiles p
LEFT JOIN souvera_subscriptions s ON s.user_id = p.id AND s.status IN ('trial', 'active')
LEFT JOIN souvera_plans pl ON pl.id = s.plan_id
WHERE p.email LIKE '%@afronovation.com'
ORDER BY pl.rank NULLS LAST, p.email;

-- Expected: 4 rows with correct plan/entitlement mapping
-- explorer: FDI Locked, 1 Sector
-- professional: FDI Unlocked, 5 Sectors
-- business: FDI Unlocked, 5 Sectors
-- institutional: FDI Unlocked, 5 Sectors

-- ─────────────────────────────────────────────────────────
-- 11. Check for Orphaned or Invalid Subscriptions
-- ─────────────────────────────────────────────────────────

-- Find subscriptions with invalid plan_id
SELECT 
  s.id,
  s.user_id,
  s.plan_id,
  s.status,
  CASE 
    WHEN pl.id IS NULL THEN '✗ INVALID PLAN'
    ELSE '✓ VALID'
  END as plan_status
FROM souvera_subscriptions s
LEFT JOIN souvera_plans pl ON pl.id = s.plan_id
WHERE s.user_id IN (SELECT id FROM souvera_profiles WHERE email LIKE '%@afronovation.com')
ORDER BY s.created_at DESC;

-- Expected: All rows show '✓ VALID'
-- If '✗ INVALID PLAN', subscription references non-existent plan

-- ─────────────────────────────────────────────────────────
-- 12. Verify souvera_current_user_plan_rank() Function
-- ─────────────────────────────────────────────────────────

-- Check if the RPC function exists
SELECT 
  proname as function_name,
  prosrc as function_body_excerpt
FROM pg_proc 
WHERE proname = 'souvera_current_user_plan_rank';

-- Expected: 1 row returned
-- This function is critical for server-side tier resolution

-- ─────────────────────────────────────────────────────────
-- NOTES
-- ─────────────────────────────────────────────────────────

-- ✓ All queries are safe to run (read-only)
-- ✓ No passwords are included or exposed
-- ✓ Queries filter by @afronovation.com to isolate test users
-- ✓ Run these queries in Supabase SQL Editor
-- ✓ If any query returns unexpected results, proceed with fix

-- Common Issues Detected by These Queries:
-- 1. RLS enabled without SELECT policy → frontend queries blocked
-- 2. Duplicate active subscriptions → tier resolution ambiguous
-- 3. Wrong plan_id assigned → Professional shows as Explorer
-- 4. Profile trigger creates Explorer after script → duplicate subscription
-- 5. Missing entitlements for plan → FDI remains locked

-- ─────────────────────────────────────────────────────────
-- END OF VERIFICATION SQL
-- ─────────────────────────────────────────────────────────
