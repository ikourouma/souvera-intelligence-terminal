# Tier Resolution Fix - Implementation Instructions

## Quick Summary

The tier resolution bug has been diagnosed and fixed. The root cause was **missing RLS policies** on `souvera_subscriptions` and `souvera_profiles` tables that prevented authenticated users from reading their own data via the browser client.

## Files Created/Modified

### New Files
1. `docs/audits/tier-resolution-fdi-access-debug.md` - Full diagnosis
2. `docs/qa/tier-resolution-verification.sql` - Verification queries
3. `infra/supabase/sql-pack-v1.7-rls-fix.sql` - **RLS policy migration (REQUIRED)**
4. `docs/qa/tier-resolution-fdi-access-fix.md` - Fix documentation

### Modified Files
1. `scripts/seed-test-users.ts` - Enhanced idempotent subscription management
2. `apps/api-gateway/src/components/ui/AccountMenu.tsx` - Added error logging
3. `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx` - Added error logging

## Critical Schema Note

**IMPORTANT**: `souvera_subscriptions.user_id` references `souvera_profiles.id`, which references `auth.users.id` (1:1). This means:
- `auth.uid()` = `souvera_profiles.id` = `souvera_subscriptions.user_id`
- RLS policy uses direct comparison: `user_id = auth.uid()`

This relationship is critical for the fix to work.

## Implementation Steps

### Step 1: Run Database Migration (REQUIRED)

**Open Supabase Dashboard:**
1. Navigate to your Supabase project
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the ENTIRE contents of:
   ```
   infra/supabase/sql-pack-v1.7-rls-fix.sql
   ```
5. Click "Run" (or press Ctrl+Enter)

**This migration**:
- Creates RLS policy: "Users can read their own subscriptions"
  - Allows `user_id = auth.uid()` (direct subscription)
  - Allows organization members to read org subscriptions
- Creates RLS policy: "Users can read their own profile"
- Creates RLS policy: "Users can update their own profile"
- Makes plans and entitlements publicly readable for display

**Expected output**:
```
✓ RLS policies created successfully
✓ souvera_subscriptions: Users can read their own subscriptions
✓ souvera_profiles: Users can read/update their own profile
✓ souvera_plans: Publicly readable
✓ souvera_plan_entitlements: Publicly readable

Next steps:
1. Run tier-resolution-verification.sql to verify policies
2. Re-run: npx tsx scripts/seed-test-users.ts
3. Test login with professional@afronovation.com
```

Plus a table showing all created policies.

### Step 2: Verify RLS Policies

Run in Supabase SQL Editor:

```sql
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('souvera_subscriptions', 'souvera_profiles')
ORDER BY tablename, policyname;
```

**Expected**: At least 4 policies returned

### Step 3: Re-run Provisioning Script

```bash
cd c:\Users\ikour\Projects\souvera
npx tsx scripts/seed-test-users.ts
```

**Expected output**:
```
Created or Updated: explorer@afronovation.com (explorer)
Created or Updated: professional@afronovation.com (professional)
Created or Updated: business@afronovation.com (business)
Created or Updated: institutional@afronovation.com (institutional)
```

### Step 4: Verify Database State

Run verification queries from `docs/qa/tier-resolution-verification.sql`:

```sql
-- Quick verification
SELECT 
  p.email,
  s.plan_id,
  s.status
FROM souvera_profiles p
JOIN souvera_subscriptions s ON s.user_id = p.id AND s.status = 'active'
WHERE p.email LIKE '%@afronovation.com'
ORDER BY p.email;
```

**Expected**:
- explorer@afronovation.com → explorer
- professional@afronovation.com → professional
- business@afronovation.com → business
- institutional@afronovation.com → institutional

### Step 5: Manual Testing

#### Test Explorer
1. Open browser (incognito recommended)
2. Go to `http://localhost:3000/login`
3. Login with `explorer@afronovation.com`
4. Check account dropdown → should show "Explorer Plan"
5. Go to `/intelligence/map`
6. Select Nigeria
7. Verify: FDI shows "Professional+" lock, 1 sector

#### Test Professional
1. Open new incognito window
2. Login with `professional@afronovation.com`
3. Check account dropdown → should show "Professional Plan"
4. Go to `/intelligence/map`
5. Select Nigeria
6. Verify: FDI shows value (e.g., $4.87B), up to 5 sectors with rationale

#### Test Business and Institutional
Repeat above for:
- `business@afronovation.com` → "Business Plan"
- `institutional@afronovation.com` → "Institutional Plan"

### Step 6: Check Browser Console

Open Developer Tools → Console

**Expected**: No RLS errors like:
```
❌ permission denied for table souvera_subscriptions
```

**Acceptable**: Normal fetch logs, no red errors

## Troubleshooting

### Issue: Still Shows "Explorer Plan" for Professional

**Possible causes**:
1. RLS migration not run → Run Step 1
2. Browser cache → Hard refresh (Ctrl+Shift+R) or clear cache
3. Old session → Log out completely, clear cookies, log back in
4. Wrong credentials → Verify using correct email from `docs/Souvera Test Users.txt`

**Debug**:
1. Check browser console for errors
2. Run verification SQL (Step 4)
3. Confirm user exists: `SELECT * FROM souvera_profiles WHERE email = 'professional@afronovation.com'`
4. Confirm subscription exists: `SELECT * FROM souvera_subscriptions WHERE user_id = (SELECT id FROM souvera_profiles WHERE email = 'professional@afronovation.com')`

### Issue: "Permission denied for table souvera_subscriptions"

**Cause**: RLS policy not created

**Fix**: 
1. Run `infra/supabase/sql-pack-v1.7-rls-fix.sql` in Supabase SQL Editor
2. Verify policies exist (Step 2)
3. Log out and log back in

### Issue: Duplicate subscriptions

**Cause**: Profile trigger created Explorer subscription before provisioning script ran

**Fix**:
```sql
-- Deactivate duplicate subscriptions
UPDATE souvera_subscriptions 
SET status = 'canceled'
WHERE user_id = (SELECT id FROM souvera_profiles WHERE email = 'professional@afronovation.com')
  AND plan_id != 'professional'
  AND status = 'active';
```

Then re-run provisioning script.

## Success Criteria

✅ All test users show correct plan in account dropdown  
✅ Professional+ see FDI values (not locked)  
✅ Explorer sees FDI locked with "Professional+" badge  
✅ Professional+ see up to 5 sectors with rationale  
✅ Explorer sees 1 sector without rationale  
✅ No browser console errors about RLS  
✅ Verification SQL returns expected results  
✅ No duplicate active subscriptions  

## Next Steps After Fix

Once all criteria pass:
1. ✅ Mark this bug as resolved
2. ✅ Close any related GitHub issues
3. ✅ Begin Phase 2 QA with tiered access testing
4. ✅ Test on `/intelligence/africa` embedded workspace
5. ✅ Verify mobile responsiveness across tiers
6. ✅ Document any edge cases discovered during QA

## Files to Review

- **Diagnosis**: `docs/audits/tier-resolution-fdi-access-debug.md`
- **Fix Details**: `docs/qa/tier-resolution-fdi-access-fix.md`
- **Verification SQL**: `docs/qa/tier-resolution-verification.sql`
- **RLS Migration**: `infra/supabase/sql-pack-v1.7-rls-fix.sql`

---

**Status**: Ready to Implement  
**Priority**: Critical - Blocking Phase 2 QA  
**Estimated Time**: 15-20 minutes  
**Risk Level**: Low (idempotent, no data loss)
