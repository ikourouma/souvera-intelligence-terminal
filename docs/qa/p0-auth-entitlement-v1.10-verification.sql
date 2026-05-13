-- =========================================================
-- SOUVERA P0 AUTH ENTITLEMENT v1.10 VERIFICATION
-- =========================================================
-- Run these queries after applying SQL Pack v1.10 to verify
-- that legacy recursive RLS policies are removed and tier
-- resolution works correctly.
-- =========================================================

-- =========================================================
-- 1. VERIFY RLS POLICIES (MOST CRITICAL)
-- =========================================================

-- Expected results:
-- souvera_subscriptions: ONLY "Users can read their own subscriptions"
-- souvera_organization_members: ONLY "Users can read their own organization memberships"
-- Should NOT see: souvera_subscriptions_select_self_or_org
-- Should NOT see: souvera_org_members_select_same_org

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  CASE 
    WHEN LENGTH(qual) > 80 THEN LEFT(qual, 77) || '...'
    ELSE qual
  END as using_expression_preview
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
-- 2. VERIFY NO LEGACY RECURSIVE POLICIES EXIST
-- =========================================================

-- This query should return 0 rows
-- If it returns any rows, legacy policies still exist

SELECT 
  tablename,
  policyname,
  '❌ LEGACY POLICY STILL EXISTS' as status
FROM pg_policies
WHERE policyname IN (
  'souvera_subscriptions_select_self_or_org',
  'souvera_org_members_select_same_org'
);

-- Expected: 0 rows
-- If you see rows: rerun SQL Pack v1.10

-- =========================================================
-- 3. VERIFY TEST USER PLAN ASSIGNMENTS
-- =========================================================

-- All test users should have exactly one active subscription
-- with the correct plan_id

SELECT 
  p.email,
  s.plan_id,
  s.status,
  s.created_at,
  CASE s.plan_id
    WHEN 'explorer' THEN '✓ Explorer'
    WHEN 'professional' THEN '✓ Professional'
    WHEN 'business' THEN '✓ Business'
    WHEN 'institutional' THEN '✓ Institutional'
    ELSE '❌ UNKNOWN PLAN'
  END as verification
FROM souvera_profiles p
JOIN souvera_subscriptions s ON s.user_id = p.id
WHERE p.email LIKE '%@afronovation.com'
  AND s.status IN ('trial', 'active')
ORDER BY 
  CASE s.plan_id
    WHEN 'explorer' THEN 1
    WHEN 'professional' THEN 2
    WHEN 'business' THEN 3
    WHEN 'institutional' THEN 4
    ELSE 99
  END;

-- Expected results:
-- explorer@afronovation.com    | explorer      | ✓ Explorer
-- professional@afronovation.com| professional  | ✓ Professional
-- business@afronovation.com    | business      | ✓ Business
-- institutional@afronovation.com| institutional | ✓ Institutional

-- =========================================================
-- 4. VERIFY NO DUPLICATE ACTIVE SUBSCRIPTIONS
-- =========================================================

-- This query should return 0 rows
-- If it returns rows, multiple active subscriptions exist
-- and tier resolution may be unpredictable

SELECT 
  p.email,
  COUNT(*) as active_subscription_count,
  STRING_AGG(s.plan_id, ', ' ORDER BY s.created_at) as plans,
  '❌ DUPLICATE SUBSCRIPTIONS' as status
FROM souvera_subscriptions s
JOIN souvera_profiles p ON p.id = s.user_id
WHERE s.status IN ('trial', 'active')
  AND p.email LIKE '%@afronovation.com'
GROUP BY p.email
HAVING COUNT(*) > 1;

-- Expected: 0 rows
-- If you see rows: run seed-test-users.ts again or manually deactivate duplicates

-- =========================================================
-- 5. VERIFY PLAN ENTITLEMENTS
-- =========================================================

-- Verify that Professional, Business, and Institutional
-- include full_macro entitlement, and Explorer does not

SELECT 
  sp.id as plan_id,
  sp.name as plan_name,
  STRING_AGG(
    spe.entitlement_key, 
    ', ' 
    ORDER BY spe.entitlement_key
  ) as entitlements,
  CASE 
    WHEN sp.id = 'explorer' AND STRING_AGG(spe.entitlement_key, ', ') NOT LIKE '%full_macro%' 
      THEN '✓ Correct (no full_macro)'
    WHEN sp.id IN ('professional', 'business', 'institutional') 
         AND STRING_AGG(spe.entitlement_key, ', ') LIKE '%full_macro%'
      THEN '✓ Correct (has full_macro)'
    ELSE '❌ ENTITLEMENT MISMATCH'
  END as verification
FROM souvera_plans sp
LEFT JOIN souvera_plan_entitlements spe ON spe.plan_id = sp.id
WHERE sp.id IN ('explorer', 'professional', 'business', 'institutional')
GROUP BY sp.id, sp.name
ORDER BY 
  CASE sp.id
    WHEN 'explorer' THEN 1
    WHEN 'professional' THEN 2
    WHEN 'business' THEN 3
    WHEN 'institutional' THEN 4
    ELSE 99
  END;

-- Expected:
-- explorer      | ... | ✓ Correct (no full_macro)
-- professional  | ... | ✓ Correct (has full_macro)
-- business      | ... | ✓ Correct (has full_macro)
-- institutional | ... | ✓ Correct (has full_macro)

-- =========================================================
-- 6. VERIFY AUTH.USERS ALIGNMENT
-- =========================================================

-- Verify that auth.users.id matches souvera_profiles.id (1:1)

SELECT 
  au.email,
  au.id as auth_user_id,
  p.id as profile_id,
  CASE 
    WHEN au.id = p.id THEN '✓ Aligned'
    ELSE '❌ MISMATCH'
  END as verification
FROM auth.users au
JOIN souvera_profiles p ON p.email = au.email
WHERE au.email LIKE '%@afronovation.com'
ORDER BY au.email;

-- Expected: All rows should show ✓ Aligned

-- =========================================================
-- MANUAL BROWSER TESTING CHECKLIST
-- =========================================================

/*
After verifying SQL state, perform manual testing:

1. Restart dev server:
   - Kill port 3010: Get-NetTCPConnection -LocalPort 3010 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
   - Run: npm run dev

2. Clear browser:
   - Clear all cookies for localhost:3010
   - Clear cache
   - Open new incognito window

3. Test Explorer:
   - Login: explorer@afronovation.com
   - Account dropdown should show: "Explorer Plan"
   - Visit: http://localhost:3010/api/v1/me
   - Should return: { authenticated: true, access: { tier: "explorer", ... } }
   - Visit: http://localhost:3010/intelligence/map
   - Select Nigeria
   - FDI should be LOCKED
   - Should see 1 sector only

4. Test Professional:
   - Logout
   - Login: professional@afronovation.com
   - Account dropdown should show: "Professional Plan"
   - Visit: http://localhost:3010/api/v1/me
   - Should return: { authenticated: true, access: { tier: "professional", ... } }
   - Visit: http://localhost:3010/api/v1/country-lite?iso3=NGA
   - Should return: { meta: { accessTier: "professional" }, fdiNetInflowsUsd: [value] }
   - Visit: http://localhost:3010/intelligence/map
   - Select Nigeria
   - FDI should be VISIBLE
   - Should see up to 5 sectors

5. Test Business:
   - Logout
   - Login: business@afronovation.com
   - Account dropdown should show: "Business Plan"
   - Visit: http://localhost:3010/api/v1/me
   - Should return: { authenticated: true, access: { tier: "business", ... } }
   - Visit: http://localhost:3010/api/v1/country-lite?iso3=NGA
   - Should return: { meta: { accessTier: "business" }, fdiNetInflowsUsd: [value] }
   - Visit: http://localhost:3010/intelligence/map
   - Select Nigeria
   - FDI should be VISIBLE
   - Should see up to 5 sectors

6. Test Institutional:
   - Logout
   - Login: institutional@afronovation.com
   - Account dropdown should show: "Institutional Plan"
   - Visit: http://localhost:3010/api/v1/me
   - Should return: { authenticated: true, access: { tier: "institutional", ... } }
   - Visit: http://localhost:3010/api/v1/country-lite?iso3=NGA
   - Should return: { meta: { accessTier: "institutional" }, fdiNetInflowsUsd: [value] }
   - Visit: http://localhost:3010/intelligence/map
   - Select Nigeria
   - FDI should be VISIBLE
   - Should see up to 5 sectors

7. Test /intelligence/africa:
   - Repeat tier-based tests on /intelligence/africa
   - Embedded workspace should behave identically

8. Verify no console errors:
   - Should NOT see: [AccountMenu] Subscription query error
   - Should NOT see: [SouveraMegaNav] Subscription query error
   - Should NOT see: infinite recursion detected

9. If ALL tests pass:
   - Phase 2 QA is unblocked
   - Document results in docs/qa/p0-auth-entitlement-fix-implementation.md
   - Mark P0 blocker as RESOLVED

10. If ANY test fails:
    - Review browser console
    - Review server logs
    - Rerun diagnostics
    - Check if dev server was restarted
    - Check if cookies were cleared
*/

-- =========================================================
-- END VERIFICATION
-- =========================================================
