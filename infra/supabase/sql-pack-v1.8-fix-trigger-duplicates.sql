-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL PACK v1.8 - FIX PROFILE TRIGGER DUPLICATE SUBSCRIPTIONS
-- Owner: Afronovation, Inc.
-- Platform: Supabase Postgres
-- =========================================================
--
-- This migration fixes the profile trigger to prevent creating
-- duplicate Explorer subscriptions when provisioning script
-- has already created a subscription.
-- =========================================================

-- =========================================================
-- 1. UPDATE PROFILE TRIGGER TO CHECK FOR EXISTING SUBSCRIPTIONS
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
    -- BUT ONLY if user has no active subscriptions already
    -- This prevents duplicates when provisioning script runs before trigger
    IF NOT EXISTS (
      SELECT 1 FROM public.souvera_subscriptions
      WHERE user_id = NEW.id
        AND status IN ('trial', 'active')
    ) THEN
      INSERT INTO public.souvera_subscriptions (user_id, plan_id, status, starts_at)
      VALUES (NEW.id, 'explorer', 'active', now());
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.process_invitation_on_signup() IS
'Updated to check for existing active subscriptions before creating default Explorer subscription. Prevents duplicates when provisioning script runs before profile trigger.';

-- =========================================================
-- 2. CLEAN UP EXISTING DUPLICATE SUBSCRIPTIONS
-- =========================================================

-- Deactivate duplicate subscriptions keeping only the highest rank active
WITH ranked_subs AS (
  SELECT 
    s.id,
    s.user_id,
    s.plan_id,
    pl.rank,
    ROW_NUMBER() OVER (
      PARTITION BY s.user_id 
      ORDER BY pl.rank DESC, s.created_at DESC
    ) as rn
  FROM souvera_subscriptions s
  JOIN souvera_plans pl ON pl.id = s.plan_id
  WHERE s.status = 'active'
)
UPDATE souvera_subscriptions
SET 
  status = 'canceled',
  ends_at = now()
WHERE id IN (
  SELECT id FROM ranked_subs WHERE rn > 1
)
RETURNING 
  id,
  user_id,
  plan_id,
  'Deactivated duplicate subscription' as action;

-- =========================================================
-- 3. VERIFICATION
-- =========================================================

-- Verify no user has multiple active subscriptions
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, COUNT(*) as sub_count
    FROM souvera_subscriptions
    WHERE status IN ('trial', 'active')
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE WARNING 'Still found % users with multiple active subscriptions', duplicate_count;
  ELSE
    RAISE NOTICE '✓ No duplicate subscriptions found';
  END IF;
  
  RAISE NOTICE '✓ Profile trigger updated';
  RAISE NOTICE '✓ Duplicate subscriptions cleaned up';
  RAISE NOTICE '';
  RAISE NOTICE 'Trigger will now check for existing subscriptions before creating Explorer default';
END $$;

-- =========================================================
-- END SQL PACK v1.8
-- =========================================================
