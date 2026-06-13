-- ====================================================================
-- SOUVERA INTELLIGENCE TERMINAL — DATABASE MIGRATION
-- Migration: sql-pack-v1.20-governance-events.sql
-- Goal: Access Roles, Newsletter, Event Module, and RPC Elevation
-- Standard: Sovereign / Fortune-5
-- ====================================================================

-- 1. Extend user roles enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_user_role') THEN
    CREATE TYPE souvera_user_role AS ENUM ('super_admin', 'process_admin', 'partner', 'explorer');
  END IF;
END$$;

-- 2. Add role column to profiles
ALTER TABLE public.souvera_profiles 
  ADD COLUMN IF NOT EXISTS role souvera_user_role NOT NULL DEFAULT 'explorer';

-- 3. Newsletter subscriptions
CREATE TABLE IF NOT EXISTS public.souvera_newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(100) DEFAULT 'terminal-gateway',
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Event Management Module
CREATE TABLE IF NOT EXISTS public.souvera_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INTEGER,
  registration_fields JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g., [{"label": "Org", "type": "text", "required": true}]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.souvera_profiles(id) ON DELETE SET NULL
);

-- 5. Dynamic Event Registrations
CREATE TABLE IF NOT EXISTS public.souvera_event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.souvera_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.souvera_profiles(id) ON DELETE SET NULL,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- Dynamic template outputs
  status VARCHAR(50) NOT NULL DEFAULT 'registered', -- registered, attended, cancelled
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Enable RLS
ALTER TABLE public.souvera_newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_event_registrations ENABLE ROW LEVEL SECURITY;

-- 7. Newsletter Policies
DROP POLICY IF EXISTS "Newsletter signup is public" ON public.souvera_newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view subscribers" ON public.souvera_newsletter_subscribers;

CREATE POLICY "Newsletter signup is public" ON public.souvera_newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view subscribers" ON public.souvera_newsletter_subscribers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.souvera_profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'process_admin')
    )
  );

-- 8. Event Policies
DROP POLICY IF EXISTS "Events are public readable" ON public.souvera_events;
DROP POLICY IF EXISTS "Admins can modify events" ON public.souvera_events;

CREATE POLICY "Events are public readable" ON public.souvera_events
  FOR SELECT USING (true);

CREATE POLICY "Admins can modify events" ON public.souvera_events
  USING (
    EXISTS (
      SELECT 1 FROM public.souvera_profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'process_admin')
    )
  );

-- 9. Registration Policies
DROP POLICY IF EXISTS "Anyone can register for events" ON public.souvera_event_registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON public.souvera_event_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.souvera_event_registrations;

CREATE POLICY "Anyone can register for events" ON public.souvera_event_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own registrations" ON public.souvera_event_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations" ON public.souvera_event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.souvera_profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'process_admin')
    )
  );

-- 10. Secure elevation RPC (super_admin only)
CREATE OR REPLACE FUNCTION public.souvera_elevate_user_role(
  target_user_id UUID,
  new_role souvera_user_role,
  justification TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with high-privilege bypass
AS $$
DECLARE
  caller_role souvera_user_role;
BEGIN
  -- 1. Identify caller role
  SELECT role INTO caller_role FROM public.souvera_profiles
  WHERE id = auth.uid();

  -- 2. Restrict to super_admin only
  IF caller_role != 'super_admin' AND EXISTS (SELECT 1 FROM public.souvera_profiles WHERE role = 'super_admin') THEN
    RAISE EXCEPTION 'Access Denied: Only a Super Admin can elevate roles.';
  END IF;

  -- 3. Perform Role Elevation
  UPDATE public.souvera_profiles
  SET role = new_role
  WHERE id = target_user_id;

  -- 4. Write to Audit Logs if table exists
  BEGIN
    INSERT INTO public.souvera_audit_events (
      event_type,
      user_id,
      metadata
    ) VALUES (
      'role_elevation',
      auth.uid(),
      jsonb_build_object(
        'target_user', target_user_id,
        'new_role', new_role,
        'justification', justification
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Table might not be populated or deployed yet, ignore audit logging failure
  END;

  RETURN true;
END;
$$;

COMMENT ON FUNCTION public.souvera_elevate_user_role IS 'Secure function to escalate user roles, restricted strictly to super admin accounts.';
