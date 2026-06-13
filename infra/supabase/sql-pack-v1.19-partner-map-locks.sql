-- ====================================================================
-- SOUVERA INTELLIGENCE TERMINAL — DATABASE MIGRATION
-- Migration: sql-pack-v1.19-partner-map-locks.sql
-- Goal: Partner Map Access locks & requests governance
-- Standard: Sovereign / Fortune-5
-- ====================================================================

-- 1. Create request status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_request_status') THEN
    CREATE TYPE partner_request_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END$$;

-- 2. Create the partner requests table
CREATE TABLE IF NOT EXISTS public.souvera_partner_map_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.souvera_profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.souvera_organizations(id) ON DELETE SET NULL,
  status partner_request_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.souvera_profiles(id),
  rejection_reason TEXT,
  CONSTRAINT unique_user_pending_request UNIQUE (user_id) WHERE (status = 'pending')
);

-- 3. Enable RLS
ALTER TABLE public.souvera_partner_map_requests ENABLE ROW LEVEL SECURITY;

-- 4. Recreate Policies safely
DROP POLICY IF EXISTS "Users can view own partner requests" ON public.souvera_partner_map_requests;
DROP POLICY IF EXISTS "Users can insert own partner requests" ON public.souvera_partner_map_requests;
DROP POLICY IF EXISTS "Admins have full access to partner requests" ON public.souvera_partner_map_requests;

CREATE POLICY "Users can view own partner requests" ON public.souvera_partner_map_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own partner requests" ON public.souvera_partner_map_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full access to partner requests" ON public.souvera_partner_map_requests
  USING (
    EXISTS (
      SELECT 1 FROM public.souvera_organization_members
      WHERE user_id = auth.uid() AND role IN ('org_admin', 'platform_admin')
    )
  );

-- 5. Trigger to set updated_at if appropriate (souvera_partner_map_requests does not have updated_at but requested_at/reviewed_at govern it)
COMMENT ON TABLE public.souvera_partner_map_requests IS 'Governance table to evaluate partner map access requests.';
