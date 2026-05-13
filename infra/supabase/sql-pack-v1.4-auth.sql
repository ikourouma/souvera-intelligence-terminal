-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL PACK v1.4 - AUTHENTICATION & INVITATIONS
-- Owner: Afronovation, Inc.
-- Platform: Supabase Postgres
-- =========================================================
-- 
-- This migration adds:
-- 1. souvera_invitations table for invite-only access
-- 2. Trigger to auto-create profile on auth.users insert
-- 3. Trigger to process invitations on profile creation
-- =========================================================

-- =========================================================
-- 1. INVITATIONS TABLE
-- =========================================================

CREATE TABLE IF NOT EXISTS public.souvera_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  organization_id UUID REFERENCES public.souvera_organizations(id) ON DELETE SET NULL,
  role souvera_user_role NOT NULL DEFAULT 'viewer',
  plan_id TEXT NOT NULL REFERENCES public.souvera_plans(id) DEFAULT 'explorer',
  invited_by UUID REFERENCES public.souvera_profiles(id) ON DELETE SET NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_valid_expiry CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_souvera_invitations_email ON public.souvera_invitations(email);
CREATE INDEX IF NOT EXISTS idx_souvera_invitations_token ON public.souvera_invitations(token);
CREATE INDEX IF NOT EXISTS idx_souvera_invitations_expires ON public.souvera_invitations(expires_at) 
  WHERE accepted_at IS NULL;

-- Enable RLS
ALTER TABLE public.souvera_invitations ENABLE ROW LEVEL SECURITY;

-- Policies: Only platform admins and org admins can manage invitations
DROP POLICY IF EXISTS "souvera_invitations_select_admin" ON public.souvera_invitations;
CREATE POLICY "souvera_invitations_select_admin"
ON public.souvera_invitations
FOR SELECT
USING (
  public.souvera_current_user_has_entitlement('admin_console')
  OR (
    organization_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.souvera_organization_members om
      WHERE om.organization_id = souvera_invitations.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('org_admin', 'executive')
    )
  )
);

DROP POLICY IF EXISTS "souvera_invitations_insert_admin" ON public.souvera_invitations;
CREATE POLICY "souvera_invitations_insert_admin"
ON public.souvera_invitations
FOR INSERT
WITH CHECK (
  public.souvera_current_user_has_entitlement('admin_console')
  OR (
    organization_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.souvera_organization_members om
      WHERE om.organization_id = souvera_invitations.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('org_admin', 'executive')
    )
  )
);

DROP POLICY IF EXISTS "souvera_invitations_update_admin" ON public.souvera_invitations;
CREATE POLICY "souvera_invitations_update_admin"
ON public.souvera_invitations
FOR UPDATE
USING (
  public.souvera_current_user_has_entitlement('admin_console')
  OR (
    organization_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.souvera_organization_members om
      WHERE om.organization_id = souvera_invitations.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('org_admin', 'executive')
    )
  )
);

-- =========================================================
-- 2. PROFILE CREATION TRIGGER
-- Auto-create profile when a new user signs up via Supabase Auth
-- =========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.souvera_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger to ensure it's up to date
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- 3. INVITATION PROCESSING TRIGGER
-- When a profile is created, check for pending invitations
-- and set up subscription + org membership accordingly
-- =========================================================

CREATE OR REPLACE FUNCTION public.process_invitation_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv RECORD;
BEGIN
  -- Find the most recent pending invitation for this email
  SELECT * INTO inv FROM public.souvera_invitations
  WHERE email = NEW.email
    AND accepted_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    -- Create org membership if org specified
    IF inv.organization_id IS NOT NULL THEN
      INSERT INTO public.souvera_organization_members (organization_id, user_id, role)
      VALUES (inv.organization_id, NEW.id, inv.role)
      ON CONFLICT (organization_id, user_id) DO UPDATE SET
        role = EXCLUDED.role;
    END IF;

    -- Create subscription for the invited plan
    INSERT INTO public.souvera_subscriptions (user_id, plan_id, status, starts_at)
    VALUES (NEW.id, inv.plan_id, 'active', now())
    ON CONFLICT DO NOTHING;

    -- Mark invitation as accepted
    UPDATE public.souvera_invitations
    SET accepted_at = now()
    WHERE id = inv.id;

    -- Log the event
    INSERT INTO public.souvera_audit_events (
      actor_user_id,
      organization_id,
      event_type,
      entity_type,
      entity_id,
      metadata
    ) VALUES (
      NEW.id,
      inv.organization_id,
      'invitation_accepted',
      'invitation',
      inv.id::text,
      jsonb_build_object(
        'plan_id', inv.plan_id,
        'role', inv.role,
        'invited_by', inv.invited_by
      )
    );
  ELSE
    -- No invitation found - create default explorer subscription
    INSERT INTO public.souvera_subscriptions (user_id, plan_id, status, starts_at)
    VALUES (NEW.id, 'explorer', 'active', now())
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_profile_created_process_invite ON public.souvera_profiles;
CREATE TRIGGER on_profile_created_process_invite
  AFTER INSERT ON public.souvera_profiles
  FOR EACH ROW EXECUTE FUNCTION public.process_invitation_on_signup();

-- =========================================================
-- 4. HELPER FUNCTION: SEND INVITATION
-- This function creates an invitation record and can be 
-- called from admin interfaces or API routes
-- =========================================================

CREATE OR REPLACE FUNCTION public.souvera_create_invitation(
  p_email TEXT,
  p_plan_id TEXT DEFAULT 'explorer',
  p_organization_id UUID DEFAULT NULL,
  p_role souvera_user_role DEFAULT 'viewer'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation_id UUID;
  v_inviter_id UUID;
BEGIN
  -- Get the current user as inviter
  v_inviter_id := auth.uid();
  
  -- Check if user can invite (must be admin or org admin)
  IF NOT (
    public.souvera_current_user_has_entitlement('admin_console')
    OR (
      p_organization_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.souvera_organization_members om
        WHERE om.organization_id = p_organization_id
          AND om.user_id = v_inviter_id
          AND om.role IN ('org_admin', 'executive')
      )
    )
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to create invitation';
  END IF;

  -- Check if plan exists
  IF NOT EXISTS (SELECT 1 FROM public.souvera_plans WHERE id = p_plan_id) THEN
    RAISE EXCEPTION 'Invalid plan_id: %', p_plan_id;
  END IF;

  -- Create the invitation
  INSERT INTO public.souvera_invitations (
    email,
    plan_id,
    organization_id,
    role,
    invited_by
  ) VALUES (
    lower(trim(p_email)),
    p_plan_id,
    p_organization_id,
    p_role,
    v_inviter_id
  )
  RETURNING id INTO v_invitation_id;

  -- Log the event
  INSERT INTO public.souvera_audit_events (
    actor_user_id,
    organization_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    v_inviter_id,
    p_organization_id,
    'invitation_created',
    'invitation',
    v_invitation_id::text,
    jsonb_build_object(
      'email', lower(trim(p_email)),
      'plan_id', p_plan_id,
      'role', p_role
    )
  );

  RETURN v_invitation_id;
END;
$$;

-- =========================================================
-- 5. HELPER FUNCTION: GET INVITATION BY TOKEN
-- Used during the invitation acceptance flow
-- =========================================================

CREATE OR REPLACE FUNCTION public.souvera_get_invitation_by_token(p_token TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  organization_id UUID,
  organization_name TEXT,
  role souvera_user_role,
  plan_id TEXT,
  plan_name TEXT,
  expires_at TIMESTAMPTZ,
  is_valid BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    i.id,
    i.email,
    i.organization_id,
    o.name as organization_name,
    i.role,
    i.plan_id,
    p.name as plan_name,
    i.expires_at,
    (i.accepted_at IS NULL AND i.expires_at > now()) as is_valid
  FROM public.souvera_invitations i
  LEFT JOIN public.souvera_organizations o ON o.id = i.organization_id
  LEFT JOIN public.souvera_plans p ON p.id = i.plan_id
  WHERE i.token = p_token;
$$;

-- =========================================================
-- 6. CLEANUP: EXPIRED INVITATIONS
-- Function to clean up old expired invitations (run via cron)
-- =========================================================

CREATE OR REPLACE FUNCTION public.souvera_cleanup_expired_invitations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.souvera_invitations
  WHERE accepted_at IS NULL
    AND expires_at < now() - interval '30 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;

-- =========================================================
-- END SQL PACK v1.4
-- =========================================================
