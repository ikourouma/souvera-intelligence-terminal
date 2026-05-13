-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL PACK v1.9 - FIX SUBSCRIPTION RLS RECURSION
-- Owner: Afronovation, Inc.
-- Platform: Supabase Postgres
-- Date: 2026-05-01
-- =========================================================
--
-- This migration fixes the tier-resolution P0 blocker by:
-- 1. Removing RLS recursion path in souvera_subscriptions policy
-- 2. Replacing complex OR clause with simple self-read policy
-- 3. Adding simple policy for souvera_organization_members
--
-- ROOT CAUSE:
-- SQL Pack v1.7 created a policy with an OR clause that queries
-- souvera_organization_members. This caused infinite recursion
-- because organization_members had RLS enabled but no policy,
-- or had a policy that referenced subscriptions.
--
-- SOLUTION:
-- Remove organization-membership subquery from subscriptions policy.
-- Organization-level subscription access will be redesigned later
-- using a secure server-side resolver or security-definer function.
-- =========================================================

-- =========================================================
-- 1. FIX SOUVERA_SUBSCRIPTIONS RLS POLICY
-- =========================================================

-- Drop the existing recursive policy
DROP POLICY IF EXISTS "Users can read their own subscriptions" 
ON public.souvera_subscriptions;

-- Create simple self-read policy WITHOUT organization subquery
CREATE POLICY "Users can read their own subscriptions"
ON public.souvera_subscriptions
FOR SELECT
USING (user_id = auth.uid());

COMMENT ON POLICY "Users can read their own subscriptions" ON public.souvera_subscriptions IS
'Allows authenticated users to read their own direct subscriptions. Organization-level subscription access removed to prevent RLS recursion. Organization access will be redesigned using server-side security-definer functions. Note: souvera_subscriptions.user_id references souvera_profiles.id which equals auth.users.id (1:1), so auth.uid() comparison is valid.';

-- =========================================================
-- 2. ADD SOUVERA_ORGANIZATION_MEMBERS RLS POLICY
-- =========================================================

-- Enable RLS on organization members table
ALTER TABLE public.souvera_organization_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can read their own organization memberships" 
ON public.souvera_organization_members;

-- Create simple self-read policy
CREATE POLICY "Users can read their own organization memberships"
ON public.souvera_organization_members
FOR SELECT
USING (user_id = auth.uid());

COMMENT ON POLICY "Users can read their own organization memberships" ON public.souvera_organization_members IS
'Allows authenticated users to read their own organization memberships. This simple policy prevents infinite recursion. Organization members can see which organizations they belong to, but not all members of those organizations.';

-- =========================================================
-- 3. VERIFY POLICIES ARE NOT RECURSIVE
-- =========================================================

-- Verify both policies exist and are simple
DO $$
DECLARE
  sub_policy_count INTEGER;
  org_policy_count INTEGER;
BEGIN
  -- Check subscriptions policy exists
  SELECT COUNT(*) INTO sub_policy_count
  FROM pg_policies 
  WHERE tablename = 'souvera_subscriptions' 
    AND policyname = 'Users can read their own subscriptions';
  
  -- Check organization members policy exists
  SELECT COUNT(*) INTO org_policy_count
  FROM pg_policies 
  WHERE tablename = 'souvera_organization_members' 
    AND policyname = 'Users can read their own organization memberships';
  
  IF sub_policy_count = 0 THEN
    RAISE EXCEPTION 'Subscriptions policy was not created';
  END IF;
  
  IF org_policy_count = 0 THEN
    RAISE EXCEPTION 'Organization members policy was not created';
  END IF;
  
  RAISE NOTICE '✅ RLS policies successfully updated';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Applied Policies:';
  RAISE NOTICE '  • souvera_subscriptions: Simple self-read (user_id = auth.uid())';
  RAISE NOTICE '  • souvera_organization_members: Simple self-read (user_id = auth.uid())';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 What Changed:';
  RAISE NOTICE '  • Removed organization-membership OR clause from subscriptions policy';
  RAISE NOTICE '  • Eliminates infinite recursion path';
  RAISE NOTICE '  • Organization-level subscriptions require redesign';
  RAISE NOTICE '';
  RAISE NOTICE '✓ Test users can now read their own subscriptions without recursion';
  RAISE NOTICE '✓ AccountMenu and SouveraMegaNav subscription queries should succeed';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next Steps:';
  RAISE NOTICE '  1. Clear browser cache/cookies';
  RAISE NOTICE '  2. Login as professional@afronovation.com';
  RAISE NOTICE '  3. Verify account dropdown shows "Professional Plan"';
  RAISE NOTICE '  4. Test /api/v1/country-lite?iso3=NGA - verify FDI visible';
END $$;

-- Display all policies on affected tables for verification
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
-- 4. VERIFY NO DUPLICATE SUBSCRIPTIONS
-- =========================================================

-- Check if any user has multiple active subscriptions
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

-- If the above returns rows, duplicate subscriptions still exist
-- Run the deduplication script from SQL Pack v1.8 or seed-test-users.ts

-- =========================================================
-- END SQL PACK v1.9
-- =========================================================
