# Tier Resolution Fix - Pre-Flight Checklist

## Before Running Migration

### 1. Verify Current State

Run in Supabase SQL Editor:

```sql
-- Check if test users exist
SELECT email, id 
FROM souvera_profiles 
WHERE email LIKE '%@afronovation.com'
ORDER BY email;
```

**Expected**: 4 users (explorer, professional, business, institutional)

### 2. Check Current RLS Status

```sql
-- Check if RLS is enabled
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname IN ('souvera_profiles', 'souvera_subscriptions')
ORDER BY relname;
```

**Current State**: Likely `rls_enabled = false` or policies missing

### 3. Check Current Subscriptions

```sql
-- Check existing subscriptions
SELECT 
  p.email,
  s.plan_id,
  s.status,
  s.created_at
FROM souvera_profiles p
LEFT JOIN souvera_subscriptions s ON s.user_id = p.id
WHERE p.email LIKE '%@afronovation.com'
ORDER BY p.email, s.created_at DESC;
```

**Look for**: Duplicate subscriptions or wrong plan_id assignments

### 4. Verify Schema Relationships

```sql
-- Critical: Verify foreign key relationships
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS references_table,
  ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('souvera_profiles', 'souvera_subscriptions')
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

**Must show**:
- `souvera_profiles.id` → `auth.users.id`
- `souvera_subscriptions.user_id` → `souvera_profiles.id`

## Migration Execution Checklist

### Step 1: Run RLS Migration

- [ ] Open Supabase Dashboard
- [ ] Navigate to SQL Editor
- [ ] Create new query
- [ ] Copy entire contents of `infra/supabase/sql-pack-v1.7-rls-fix.sql`
- [ ] Paste into SQL Editor
- [ ] Click "Run" or press Ctrl+Enter
- [ ] Verify success message appears

**Expected Output**:
```
✓ RLS policies created successfully
```

### Step 2: Verify Policies Created

- [ ] Run verification query immediately after migration
- [ ] Check that 5+ policies exist

```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN (
  'souvera_profiles',
  'souvera_subscriptions',
  'souvera_plans',
  'souvera_plan_entitlements'
)
ORDER BY tablename, policyname;
```

**Must include**:
- souvera_subscriptions: "Users can read their own subscriptions"
- souvera_profiles: "Users can read their own profile"
- souvera_profiles: "Users can update their own profile"

### Step 3: Re-run Provisioning Script

- [ ] Open terminal in project root
- [ ] Run: `npx tsx scripts/seed-test-users.ts`
- [ ] Verify no errors
- [ ] Check that all 4 users show "Created" or "Updated"

**Expected Output**:
```
✅ explorer@afronovation.com
   Plan: explorer
   Status: Successfully updated with explorer plan

✅ professional@afronovation.com
   Plan: professional
   Status: Successfully updated with professional plan
```

### Step 4: Database Verification

- [ ] Run comprehensive verification from `docs/qa/tier-resolution-verification.sql`
- [ ] Section 0: Schema relationships correct
- [ ] Section 1: RLS enabled on all tables
- [ ] Section 2: All expected policies exist
- [ ] Section 4: Each user has exactly one active subscription
- [ ] Section 5: No duplicate subscriptions detected
- [ ] Section 6: Correct plan assigned to each user
- [ ] Section 7: Plan entitlements include `full_macro` for Professional+

## Manual Browser Testing Checklist

### Test 1: Explorer User

- [ ] Open browser (incognito mode recommended)
- [ ] Navigate to login page
- [ ] Login with `explorer@afronovation.com`
- [ ] **Check**: Account dropdown shows "Explorer Plan"
- [ ] Navigate to `/intelligence/map`
- [ ] Select Nigeria from map
- [ ] **Check**: FDI card shows "Professional+" lock badge
- [ ] **Check**: FDI value NOT displayed
- [ ] **Check**: Only 1 sector shown
- [ ] **Check**: No sector rationale displayed
- [ ] Navigate to `/intelligence/africa`
- [ ] Select Nigeria
- [ ] **Check**: Same FDI lock behavior
- [ ] Logout

### Test 2: Professional User

- [ ] Open new incognito window
- [ ] Login with `professional@afronovation.com`
- [ ] **Check**: Account dropdown shows "Professional Plan"
- [ ] Navigate to `/intelligence/map`
- [ ] Select Nigeria
- [ ] **Check**: FDI card shows actual value (e.g., "$4.87B")
- [ ] **Check**: NO lock badge on FDI
- [ ] **Check**: Up to 5 sectors shown
- [ ] **Check**: Sector rationale displayed for each
- [ ] Open browser console (F12)
- [ ] **Check**: No RLS errors like "permission denied"
- [ ] Navigate to `/intelligence/africa`
- [ ] **Check**: Same FDI visible behavior
- [ ] Logout

### Test 3: Business User

- [ ] Login with `business@afronovation.com`
- [ ] **Check**: Shows "Business Plan"
- [ ] Select Nigeria on map
- [ ] **Check**: FDI visible, up to 5 sectors
- [ ] Logout

### Test 4: Institutional User

- [ ] Login with `institutional@afronovation.com`
- [ ] **Check**: Shows "Institutional Plan"
- [ ] Select Nigeria on map
- [ ] **Check**: FDI visible, up to 5 sectors
- [ ] Logout

### Test 5: API Consistency

- [ ] Login as Professional user
- [ ] Open browser DevTools → Network tab
- [ ] Navigate to `/intelligence/map`
- [ ] Select Nigeria
- [ ] Find request to `/api/v1/country-lite?iso3=NGA`
- [ ] Click on request → Preview
- [ ] **Check**: `meta.accessTier` = `"professional"`
- [ ] **Check**: `meta.authenticated` = `true`
- [ ] **Check**: `metrics.fdiNetInflowsUsd` exists (e.g., 4873000000)
- [ ] **Check**: `sectors` array has up to 5 items
- [ ] **Check**: Each sector has `rationale` field

## Rollback Plan (If Issues Occur)

### If RLS Blocks All Queries

```sql
-- EMERGENCY ONLY: Temporarily disable RLS to diagnose
ALTER TABLE public.souvera_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_profiles DISABLE ROW LEVEL SECURITY;

-- After diagnosis, RE-ENABLE and fix policies
ALTER TABLE public.souvera_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souvera_profiles ENABLE ROW LEVEL SECURITY;
```

### If Wrong Policy Applied

```sql
-- Remove incorrect policy
DROP POLICY IF EXISTS "Users can read their own subscriptions" ON public.souvera_subscriptions;

-- Re-run correct policy from sql-pack-v1.7-rls-fix.sql
```

### If Duplicate Subscriptions

```sql
-- Deactivate duplicates (keep most recent for each user)
WITH ranked_subs AS (
  SELECT 
    id,
    user_id,
    plan_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM souvera_subscriptions
  WHERE status = 'active'
    AND user_id IN (SELECT id FROM souvera_profiles WHERE email LIKE '%@afronovation.com')
)
UPDATE souvera_subscriptions
SET status = 'canceled'
WHERE id IN (
  SELECT id FROM ranked_subs WHERE rn > 1
);
```

## Success Criteria

All of the following must be true:

### Database Level
- [ ] RLS enabled on all relevant tables
- [ ] 5+ policies created and active
- [ ] Each test user has exactly 1 active subscription
- [ ] Correct plan_id assigned to each user
- [ ] Professional+ plans have `full_macro` entitlement

### Frontend Level
- [ ] Explorer shows "Explorer Plan" in dropdown
- [ ] Professional shows "Professional Plan" in dropdown
- [ ] Business shows "Business Plan" in dropdown
- [ ] Institutional shows "Institutional Plan" in dropdown
- [ ] No RLS errors in browser console

### FDI Visibility
- [ ] Explorer: FDI locked with "Professional+" badge
- [ ] Professional: FDI value displayed (e.g., $4.87B)
- [ ] Business: FDI value displayed
- [ ] Institutional: FDI value displayed

### Sector Access
- [ ] Explorer: 1 sector, no rationale
- [ ] Professional: Up to 5 sectors, rationale shown
- [ ] Business: Up to 5 sectors, rationale shown
- [ ] Institutional: Up to 5 sectors, rationale shown

### API Consistency
- [ ] `meta.accessTier` matches account dropdown
- [ ] `metrics.fdiNetInflowsUsd` present for Professional+
- [ ] `sectors` array limited by tier (1 vs 5)
- [ ] Sector `rationale` field present for Professional+

## Post-Implementation

### Document Results

- [ ] Update `docs/qa/tier-resolution-fdi-access-fix.md` with actual verification results
- [ ] Note any deviations from expected behavior
- [ ] Screenshot account dropdowns for each tier (optional)
- [ ] Save browser console output showing no errors

### Proceed to Phase 2 QA

Once all success criteria pass:
- [ ] Mark tier resolution bug as RESOLVED
- [ ] Notify team that Phase 2 QA can begin
- [ ] Focus Phase 2 QA on embedded workspace testing
- [ ] Test mobile responsiveness across tiers

---

**Checklist Version**: 1.0  
**Last Updated**: 2026-05-01  
**Status**: Ready for Execution
