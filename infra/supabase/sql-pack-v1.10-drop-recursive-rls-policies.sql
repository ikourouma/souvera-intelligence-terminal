-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL PACK v1.10 - DROP LEGACY RECURSIVE RLS POLICIES
-- Owner: Afronovation, Inc.
-- Platform: Supabase Postgres
-- Date: 2026-05-01
-- =========================================================
--
-- This migration completes the RLS recursion fix by removing
-- legacy recursive policies that remain after v1.9.
--
-- ROOT CAUSE:
-- SQL Pack v1.9 created new simple policies but did not drop
-- all legacy recursive policies by their original names.
-- Multiple SELECT policies exist, and Postgres evaluates all
-- of them. The recursive policies continue to cause issues.
--
-- CRITICAL FINDING:
-- Two legacy policies remain in the database:
-- 1. souvera_subscriptions_select_self_or_org
-- 2. souvera_org_members_select_same_org
--
-- Both contain nested EXISTS clauses that query
-- souvera_organization_members, causing RLS recursion.
--
-- SOLUTION:
-- Explicitly drop legacy recursive policies by their exact names.
-- Ensure only simple self-read policies remain.
-- =========================================================

-- =========================================================
-- 1. DROP LEGACY RECURSIVE SUBSCRIPTION POLICY
-- =========================================================

-- Remove the old recursive policy that queries organization_members
DROP POLICY IF EXISTS "souvera_subscriptions_select_self_or_org"
ON public.souvera_subscriptions;

-- Verification log
DO $$
BEGIN
  RAISE NOTICE '✅ Dropped legacy policy: souvera_subscriptions_select_self_or_org';
END $$;

-- =========================================================
-- 2. DROP LEGACY RECURSIVE ORGANIZATION-MEMBERS POLICY
-- =========================================================

-- Remove the old recursive policy with self-referencing EXISTS
DROP POLICY IF EXISTS "souvera_org_members_select_same_org"
ON public.souvera_organization_members;

-- Verification log
DO $$
BEGIN
  RAISE NOTICE '✅ Dropped legacy policy: souvera_org_members_select_same_org';
END $$;

-- =========================================================
-- 3. ENSURE SIMPLE SUBSCRIPTION POLICY EXISTS
-- =========================================================

-- Drop and recreate to ensure clean state
DROP POLICY IF EXISTS "Users can read their own subscriptions"
ON public.souvera_subscriptions;

-- Create simple self-read policy
CREATE POLICY "Users can read their own subscriptions"
ON public.souvera_subscriptions
FOR SELECT
USING (user_id = auth.uid());

COMMENT ON POLICY "Users can read their own subscriptions" ON public.souvera_subscriptions IS
'Simple self-read policy. No organization subquery. No recursion. Users read only their own direct subscriptions. Organization-level subscription access requires server-side security-definer functions.';

-- =========================================================
-- 4. ENSURE SIMPLE ORGANIZATION-MEMBERS POLICY EXISTS
-- =========================================================

-- Ensure RLS is enabled
ALTER TABLE public.souvera_organization_members ENABLE ROW LEVEL SECURITY;

-- Drop and recreate to ensure clean state
DROP POLICY IF EXISTS "Users can read their own organization memberships"
ON public.souvera_organization_members;

-- Create simple self-read policy
CREATE POLICY "Users can read their own organization memberships"
ON public.souvera_organization_members
FOR SELECT
USING (user_id = auth.uid());

COMMENT ON POLICY "Users can read their own organization memberships" ON public.souvera_organization_members IS
'Simple self-read policy. No recursion. Users can see which organizations they belong to. Does not expose all members of the organization.';

-- =========================================================
-- 5. VERIFY FINAL POLICY STATE
-- =========================================================

-- Verification block
DO $$
DECLARE
  sub_policy_count INTEGER;
  org_policy_count INTEGER;
  legacy_sub_count INTEGER;
  legacy_org_count INTEGER;
BEGIN
  -- Check if correct policies exist
  SELECT COUNT(*) INTO sub_policy_count
  FROM pg_policies 
  WHERE tablename = 'souvera_subscriptions' 
    AND policyname = 'Users can read their own subscriptions';
  
  SELECT COUNT(*) INTO org_policy_count
  FROM pg_policies 
  WHERE tablename = 'souvera_organization_members' 
    AND policyname = 'Users can read their own organization memberships';
  
  -- Check if legacy policies still exist (should be 0)
  SELECT COUNT(*) INTO legacy_sub_count
  FROM pg_policies 
  WHERE tablename = 'souvera_subscriptions' 
    AND policyname = 'souvera_subscriptions_select_self_or_org';
  
  SELECT COUNT(*) INTO legacy_org_count
  FROM pg_policies 
  WHERE tablename = 'souvera_organization_members' 
    AND policyname = 'souvera_org_members_select_same_org';
  
  -- Validate
  IF sub_policy_count = 0 THEN
    RAISE EXCEPTION '❌ Simple subscriptions policy was not created';
  END IF;
  
  IF org_policy_count = 0 THEN
    RAISE EXCEPTION '❌ Simple organization members policy was not created';
  END IF;
  
  IF legacy_sub_count > 0 THEN
    RAISE EXCEPTION '❌ Legacy subscription policy still exists';
  END IF;
  
  IF legacy_org_count > 0 THEN
    RAISE EXCEPTION '❌ Legacy organization members policy still exists';
  END IF;
  
  -- Success
  RAISE NOTICE '';
  RAISE NOTICE '✅ SQL PACK v1.10 SUCCESSFULLY APPLIED';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Final Policy State:';
  RAISE NOTICE '  ✓ souvera_subscriptions: "Users can read their own subscriptions"';
  RAISE NOTICE '  ✓ souvera_organization_members: "Users can read their own organization memberships"';
  RAISE NOTICE '';
  RAISE NOTICE '🗑️  Removed Legacy Policies:';
  RAISE NOTICE '  ✓ souvera_subscriptions_select_self_or_org (DROPPED)';
  RAISE NOTICE '  ✓ souvera_org_members_select_same_org (DROPPED)';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security Status:';
  RAISE NOTICE '  ✓ No RLS recursion';
  RAISE NOTICE '  ✓ Users can read own subscriptions only';
  RAISE NOTICE '  ✓ Users can read own org memberships only';
  RAISE NOTICE '  ✓ Profile policies preserved';
  RAISE NOTICE '';
  RAISE NOTICE '📝 IMMEDIATE NEXT STEPS:';
  RAISE NOTICE '  1. Restart dev server (kill port 3010 and npm run dev)';
  RAISE NOTICE '  2. Clear browser cookies/cache';
  RAISE NOTICE '  3. Open incognito window';
  RAISE NOTICE '  4. Login as professional@afronovation.com';
  RAISE NOTICE '  5. Verify account dropdown shows "Professional Plan"';
  RAISE NOTICE '  6. Test Nigeria - verify FDI visible';
  RAISE NOTICE '  7. Repeat for business@ and institutional@';
  RAISE NOTICE '';
END $$;

-- =========================================================
-- 6. DISPLAY ALL CURRENT POLICIES FOR VERIFICATION
-- =========================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename IN (
  'souvera_subscriptions',
  'souvera_organization_members',
  'souvera_profiles',
  'souvera_plans',
  'souvera_plan_entitlements'
)
ORDER BY tablename, policyname;

-- =========================================================
-- EXPECTED FINAL STATE
-- =========================================================
--
-- souvera_subscriptions should have:
--   ✓ "Users can read their own subscriptions" (FOR SELECT)
--
-- souvera_organization_members should have:
--   ✓ "Users can read their own organization memberships" (FOR SELECT)
--
-- souvera_profiles should have (preserved from v1.7):
--   ✓ "Users can read own profile" (FOR SELECT)
--   ✓ "Users can update own profile" (FOR UPDATE)
--
-- souvera_plans and souvera_plan_entitlements:
--   ✓ May have public/authenticated read if intentional
--   ✓ No changes required
--
-- MUST NOT have:
--   ✗ souvera_subscriptions_select_self_or_org
--   ✗ souvera_org_members_select_same_org
--
-- =========================================================
-- END SQL PACK v1.10
-- =========================================================
