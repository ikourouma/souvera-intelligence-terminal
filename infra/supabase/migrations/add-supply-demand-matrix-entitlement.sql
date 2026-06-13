-- ================================================
-- Add Supply-Demand Matrix Entitlement
-- Migration: add_supply_demand_matrix_entitlement
-- ================================================

-- Step 1: Add new entitlement key
INSERT INTO souvera_entitlements (key, label, description)
VALUES ('supply_demand_matrix', 'Supply-Demand Matrix', 'Access to the 74-market × 8-sector supply-demand matrix with opportunity scores')
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description;

-- Step 2: Grant to Investor tier and above
INSERT INTO souvera_plan_entitlements (plan_id, entitlement_key)
VALUES 
  ('investor', 'supply_demand_matrix'),
  ('institutional', 'supply_demand_matrix'),
  ('platform_admin', 'supply_demand_matrix'),
  ('super_admin', 'supply_demand_matrix')
ON CONFLICT (plan_id, entitlement_key) DO NOTHING;
