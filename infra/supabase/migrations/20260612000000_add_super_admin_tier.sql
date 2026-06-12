-- ================================================
-- Add Super Admin Tier to Souvera Platform
-- Migration: 20260612000000_add_super_admin_tier
-- ================================================

-- Step 1: Add super_admin to the user role enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'souvera_user_role' AND e.enumlabel = 'super_admin'
  ) THEN
    ALTER TYPE souvera_user_role ADD VALUE 'super_admin';
  END IF;
END$$;

-- Step 2: Add super_admin plan
INSERT INTO souvera_plans (id, name, rank)
VALUES ('super_admin', 'Super Admin', 100)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  rank = EXCLUDED.rank;

-- Step 3: Add new entitlement keys to souvera_entitlements table
INSERT INTO souvera_entitlements (key, label, description)
VALUES 
  ('super_admin_access', 'Super Admin Access', 'Full platform control and system access'),
  ('user_management', 'User Management', 'Provision and manage user accounts'),
  ('system_configuration', 'System Configuration', 'Modify platform settings and configuration'),
  ('marketing_cms', 'Marketing CMS', 'Manage marketing site content and structure'),
  ('billing_management', 'Billing Management', 'Manage billing and subscription operations'),
  ('audit_logs', 'Audit Logs', 'View and export full system audit trail')
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description;

-- Step 4: Add super_admin specific entitlements to plan
INSERT INTO souvera_plan_entitlements (plan_id, entitlement_key)
VALUES 
  ('super_admin', 'super_admin_access'),
  ('super_admin', 'user_management'),
  ('super_admin', 'system_configuration'),
  ('super_admin', 'marketing_cms'),
  ('super_admin', 'billing_management'),
  ('super_admin', 'audit_logs')
ON CONFLICT (plan_id, entitlement_key) DO NOTHING;

-- Step 5: Grant all user entitlements to super_admin
INSERT INTO souvera_plan_entitlements (plan_id, entitlement_key)
SELECT 'super_admin', entitlement_key
FROM souvera_plan_entitlements
WHERE plan_id IN ('explorer', 'professional', 'business', 'investor', 'institutional', 'platform_admin')
ON CONFLICT (plan_id, entitlement_key) DO NOTHING;

-- Step 6: Add investor plan if it doesn't exist
INSERT INTO souvera_plans (id, name, rank)
VALUES ('investor', 'Investor', 4)
ON CONFLICT (id) DO UPDATE SET 
  rank = EXCLUDED.rank;

-- Step 7: Ensure investor has all business entitlements
INSERT INTO souvera_plan_entitlements (plan_id, entitlement_key)
SELECT 'investor', entitlement_key
FROM souvera_plan_entitlements
WHERE plan_id = 'business'
ON CONFLICT (plan_id, entitlement_key) DO NOTHING;
