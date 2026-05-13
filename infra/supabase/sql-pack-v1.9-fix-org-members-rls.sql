-- =========================================================
-- SQL PACK V1.9: Fix Organization Members RLS Recursion
-- Date: 2026-05-01
-- Owner: Afronovation, Inc.
-- Issue: Infinite recursion in souvera_organization_members RLS
-- =========================================================

-- =========================================================
-- FIX: ADD RLS POLICY FOR SOUVERA_ORGANIZATION_MEMBERS
-- =========================================================

-- Enable RLS on organization members table
ALTER TABLE public.souvera_organization_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (idempotent)
DROP POLICY IF EXISTS "Users can read their own organization memberships" ON public.souvera_organization_members;

-- Create simple policy allowing users to see their own memberships
-- This breaks the recursion because it doesn't reference any other tables
CREATE POLICY "Users can read their own organization memberships"
ON public.souvera_organization_members
FOR SELECT
USING (user_id = auth.uid());

COMMENT ON POLICY "Users can read their own organization memberships" ON public.souvera_organization_members IS
'Allows authenticated users to read their own organization memberships. This simple policy prevents infinite recursion when souvera_subscriptions policy queries organization_members.';

-- =========================================================
-- VERIFICATION
-- =========================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS Policy created for souvera_organization_members';
  RAISE NOTICE '   Policy name: Users can read their own organization memberships';
  RAISE NOTICE '   Logic: user_id = auth.uid()';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 To verify:';
  RAISE NOTICE '   SELECT * FROM souvera_organization_members WHERE user_id = auth.uid();';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  This should resolve the infinite recursion error in subscription queries.';
END $$;
