-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL PACK v1.7 - RLS FIX FOR SUBSCRIPTIONS
-- Owner: Afronovation, Inc.
-- Platform: Supabase Postgres
-- =========================================================
-- 
-- This migration fixes tier-resolution bug by:
-- 1. Adding RLS policy for users to read their own subscriptions
-- 2. Adding RLS policy for users to read their own profiles
-- 3. Ensuring authenticated users can query their tier from frontend
-- =========================================================

-- =========================================================
-- 1. RLS POLICY FOR SOUVERA_SUBSCRIPTIONS
-- =========================================================

-- Enable RLS on subscriptions table
ALTER TABLE public.souvera_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (idempotent)
DROP POLICY IF EXISTS "Users can read their own subscriptions" ON public.souvera_subscriptions;

-- Create policy allowing users to read their own subscriptions
-- CRITICAL: souvera_subscriptions.user_id references souvera_profiles.id (NOT auth.users.id directly)
-- CRITICAL: souvera_profiles.id references auth.users.id (1:1 relationship)
-- Therefore: auth.uid() = souvera_profiles.id = souvera_subscriptions.user_id
CREATE POLICY "Users can read their own subscriptions"
ON public.souvera_subscriptions
FOR SELECT
USING (
  -- Direct user subscription: user_id matches auth.uid()
  -- This works because souvera_profiles.id = auth.users.id
  user_id = auth.uid()
  OR
  -- Organization subscription: user is member of organization
  organization_id IN (
    SELECT om.organization_id 
    FROM public.souvera_organization_members om
    WHERE om.user_id = auth.uid()
  )
);

COMMENT ON POLICY "Users can read their own subscriptions" ON public.souvera_subscriptions IS
'Allows authenticated users to read their own direct subscriptions or subscriptions of organizations they belong to. Required for AccountMenu and SouveraMegaNav to display correct tier. Note: souvera_subscriptions.user_id references souvera_profiles.id which has a 1:1 relationship with auth.users.id, so auth.uid() comparison is valid.';

-- =========================================================
-- 2. RLS POLICY FOR SOUVERA_PROFILES
-- =========================================================

-- Enable RLS on profiles table
ALTER TABLE public.souvera_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (idempotent)
DROP POLICY IF EXISTS "Users can read their own profile" ON public.souvera_profiles;

-- Create policy allowing users to read their own profile
CREATE POLICY "Users can read their own profile"
ON public.souvera_profiles
FOR SELECT
USING (id = auth.uid());

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update their own profile" ON public.souvera_profiles;

-- Create policy allowing users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.souvera_profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

COMMENT ON POLICY "Users can read their own profile" ON public.souvera_profiles IS
'Allows authenticated users to read their own profile data including full_name for display in navigation.';

-- =========================================================
-- 3. RLS POLICY FOR SOUVERA_PLANS (PUBLIC READ)
-- =========================================================

-- Enable RLS on plans table
ALTER TABLE public.souvera_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Plans are publicly readable" ON public.souvera_plans;

-- Create policy allowing anyone to read plan metadata
CREATE POLICY "Plans are publicly readable"
ON public.souvera_plans
FOR SELECT
USING (true);

COMMENT ON POLICY "Plans are publicly readable" ON public.souvera_plans IS
'Allows anyone (including unauthenticated users) to read plan metadata for display purposes.';

-- =========================================================
-- 4. RLS POLICY FOR SOUVERA_PLAN_ENTITLEMENTS (PUBLIC READ)
-- =========================================================

-- Enable RLS on plan_entitlements table
ALTER TABLE public.souvera_plan_entitlements ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Plan entitlements are publicly readable" ON public.souvera_plan_entitlements;

-- Create policy allowing anyone to read plan entitlements
CREATE POLICY "Plan entitlements are publicly readable"
ON public.souvera_plan_entitlements
FOR SELECT
USING (true);

COMMENT ON POLICY "Plan entitlements are publicly readable" ON public.souvera_plan_entitlements IS
'Allows anyone to read plan entitlement mappings for access resolution.';

-- =========================================================
-- 5. VERIFICATION QUERIES
-- =========================================================

-- Verify RLS is enabled and policies exist
DO $$
BEGIN
  -- Check souvera_subscriptions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'souvera_subscriptions' 
    AND policyname = 'Users can read their own subscriptions'
  ) THEN
    RAISE EXCEPTION 'RLS policy for souvera_subscriptions was not created';
  END IF;

  -- Check souvera_profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'souvera_profiles' 
    AND policyname = 'Users can read their own profile'
  ) THEN
    RAISE EXCEPTION 'RLS policy for souvera_profiles was not created';
  END IF;

  RAISE NOTICE '✓ RLS policies created successfully';
  RAISE NOTICE '✓ souvera_subscriptions: Users can read their own subscriptions';
  RAISE NOTICE '✓ souvera_profiles: Users can read/update their own profile';
  RAISE NOTICE '✓ souvera_plans: Publicly readable';
  RAISE NOTICE '✓ souvera_plan_entitlements: Publicly readable';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run tier-resolution-verification.sql to verify policies';
  RAISE NOTICE '2. Re-run: npx tsx scripts/seed-test-users.ts';
  RAISE NOTICE '3. Test login with professional@afronovation.com';
END $$;

-- Display created policies for verification
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename IN (
  'souvera_profiles',
  'souvera_subscriptions',
  'souvera_plans',
  'souvera_plan_entitlements'
)
ORDER BY tablename, policyname;

-- =========================================================
-- END SQL PACK v1.7
-- =========================================================
