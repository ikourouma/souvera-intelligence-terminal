-- =========================================================
-- SOUVERA TEST USER VERIFICATION SQL
-- Owner: Afronovation, Inc.
-- Purpose: Verify test users are correctly provisioned
-- =========================================================

-- ─────────────────────────────────────────────────────────
-- 1. Verify All Test Users Exist in Auth
-- ─────────────────────────────────────────────────────────

-- Check Supabase Auth users table
-- Run in Supabase Dashboard > Authentication > Users
-- or via SQL if you have access to auth schema

-- NOTE: This query requires auth schema access
-- SELECT id, email, email_confirmed_at, created_at
-- FROM auth.users
-- WHERE email LIKE '%@afronovation.com'
-- ORDER BY email;

-- ─────────────────────────────────────────────────────────
-- 2. Verify Profiles Exist
-- ─────────────────────────────────────────────────────────

SELECT 
  p.id,
  p.email,
  p.full_name,
  p.created_at
FROM souvera_profiles p
WHERE p.email LIKE '%@afronovation.com'
ORDER BY p.email;

-- Expected: 4 rows
-- - explorer@afronovation.com
-- - professional@afronovation.com
-- - business@afronovation.com
-- - institutional@afronovation.com

-- ─────────────────────────────────────────────────────────
-- 3. Verify Plan Assignments
-- ─────────────────────────────────────────────────────────

SELECT 
  p.email,
  s.plan_id,
  s.status,
  pl.rank as plan_rank,
  s.starts_at,
  s.ends_at
FROM souvera_subscriptions s
JOIN souvera_profiles p ON p.id = s.user_id
JOIN souvera_plans pl ON pl.id = s.plan_id
WHERE p.email LIKE '%@afronovation.com'
  AND s.status = 'active'
ORDER BY pl.rank;

-- Expected: 4 rows
-- | email                         | plan_id       | status | plan_rank | starts_at           | ends_at |
-- |-------------------------------|---------------|--------|-----------|---------------------|---------|
-- | explorer@afronovation.com     | explorer      | active | 10        | [timestamp]         | null    |
-- | professional@afronovation.com | professional  | active | 20        | [timestamp]         | null    |
-- | business@afronovation.com     | business      | active | 30        | [timestamp]         | null    |
-- | institutional@afronovation.com| institutional | active | 50        | [timestamp]         | null    |

-- ─────────────────────────────────────────────────────────
-- 4. Verify Entitlements via Plan
-- ─────────────────────────────────────────────────────────

-- Check what entitlements each test user has
SELECT 
  p.email,
  s.plan_id,
  pe.entitlement_key
FROM souvera_profiles p
JOIN souvera_subscriptions s ON s.user_id = p.id
JOIN souvera_plan_entitlements pe ON pe.plan_id = s.plan_id
WHERE p.email LIKE '%@afronovation.com'
  AND s.status = 'active'
ORDER BY p.email, pe.entitlement_key;

-- Expected: Multiple rows showing entitlement assignments
-- Explorer should have: country_identity, headline_macro, sector_teasers, news_teasers, compare_lite
-- Professional should have: all of above + full_macro, fx_metrics, signal_scores, news_signals, sector_rationale
-- Business should have: all of above + forecast_metrics, trade_snapshots, compare_full, reports_download, team_workspace
-- Institutional should have: all of above + api_lite, api_full, audit_logs

-- ─────────────────────────────────────────────────────────
-- 5. Verify Full_Macro Entitlement (FDI Access)
-- ─────────────────────────────────────────────────────────

-- Explorer should NOT have full_macro
SELECT 
  p.email,
  s.plan_id,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM souvera_plan_entitlements pe 
      WHERE pe.plan_id = s.plan_id 
      AND pe.entitlement_key = 'full_macro'
    ) THEN 'YES'
    ELSE 'NO'
  END as has_full_macro
FROM souvera_profiles p
JOIN souvera_subscriptions s ON s.user_id = p.id
WHERE p.email = 'explorer@afronovation.com'
  AND s.status = 'active';

-- Expected: has_full_macro = 'NO'

-- Professional should HAVE full_macro
SELECT 
  p.email,
  s.plan_id,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM souvera_plan_entitlements pe 
      WHERE pe.plan_id = s.plan_id 
      AND pe.entitlement_key = 'full_macro'
    ) THEN 'YES'
    ELSE 'NO'
  END as has_full_macro
FROM souvera_profiles p
JOIN souvera_subscriptions s ON s.user_id = p.id
WHERE p.email = 'professional@afronovation.com'
  AND s.status = 'active';

-- Expected: has_full_macro = 'YES'

-- ─────────────────────────────────────────────────────────
-- 6. Verify No Duplicate Subscriptions
-- ─────────────────────────────────────────────────────────

-- Each user should have exactly ONE active subscription
SELECT 
  p.email,
  COUNT(s.id) as active_subscription_count
FROM souvera_profiles p
LEFT JOIN souvera_subscriptions s ON s.user_id = p.id AND s.status = 'active'
WHERE p.email LIKE '%@afronovation.com'
GROUP BY p.email, p.id
HAVING COUNT(s.id) != 1;

-- Expected: 0 rows (empty result means all users have exactly 1 subscription)

-- ─────────────────────────────────────────────────────────
-- 7. Verify Plan Ranks
-- ─────────────────────────────────────────────────────────

SELECT 
  pl.id,
  pl.name,
  pl.rank
FROM souvera_plans pl
WHERE pl.id IN ('explorer', 'professional', 'business', 'institutional')
ORDER BY pl.rank;

-- Expected:
-- | id            | name          | rank |
-- |---------------|---------------|------|
-- | explorer      | Explorer      | 10   |
-- | professional  | Professional  | 20   |
-- | business      | Business      | 30   |
-- | institutional | Institutional | 50   |

-- ─────────────────────────────────────────────────────────
-- 8. Test User Plan Rank via RPC Function
-- ─────────────────────────────────────────────────────────

-- NOTE: This requires being authenticated as the test user
-- You can test this via the API or Supabase client after login

-- Example test (run after authenticating as test user):
-- SELECT souvera_current_user_plan_rank();

-- Expected values:
-- - Explorer: 10
-- - Professional: 20
-- - Business: 30
-- - Institutional: 50

-- ─────────────────────────────────────────────────────────
-- 9. Summary Query - Complete Test User Overview
-- ─────────────────────────────────────────────────────────

SELECT 
  p.email,
  s.plan_id,
  pl.rank as plan_rank,
  s.status as subscription_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM souvera_plan_entitlements pe 
      WHERE pe.plan_id = s.plan_id 
      AND pe.entitlement_key = 'full_macro'
    ) THEN '✓ FDI Visible'
    ELSE '✗ FDI Locked'
  END as fdi_access,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM souvera_plan_entitlements pe 
      WHERE pe.plan_id = s.plan_id 
      AND pe.entitlement_key = 'sector_rationale'
    ) THEN '✓ 5 Sectors'
    ELSE '✗ 1 Sector'
  END as sector_access,
  p.created_at as profile_created
FROM souvera_profiles p
JOIN souvera_subscriptions s ON s.user_id = p.id
JOIN souvera_plans pl ON pl.id = s.plan_id
WHERE p.email LIKE '%@afronovation.com'
  AND s.status = 'active'
ORDER BY pl.rank;

-- Expected: 4 rows with correct tier-appropriate access
-- Explorer:      FDI Locked,  1 Sector
-- Professional:  FDI Visible, 5 Sectors
-- Business:      FDI Visible, 5 Sectors
-- Institutional: FDI Visible, 5 Sectors

-- ─────────────────────────────────────────────────────────
-- NOTES
-- ─────────────────────────────────────────────────────────

-- ✓ All queries are safe to run (read-only)
-- ✓ No passwords are included or exposed
-- ✓ Queries filter by @afronovation.com to isolate test users
-- ✓ Run these queries in Supabase SQL Editor
-- ✓ If any query returns unexpected results, re-run provisioning script

-- ─────────────────────────────────────────────────────────
-- END OF VERIFICATION SQL
-- ─────────────────────────────────────────────────────────
