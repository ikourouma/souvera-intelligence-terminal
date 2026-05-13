# 🚨 CRITICAL HOTFIX - Tier Resolution Issues

## Problems Found During Execution

### Issue 1: Resolver/AccountMenu Select Lowest Plan

**Root Cause**: Both `resolveUserAccess()` and `AccountMenu` ordered subscriptions by `created_at DESC` and took the first. If multiple active subscriptions exist (e.g., Professional + Explorer), they picked the **newest**, not the **highest rank**.

**Scenario**:
1. Provisioning script creates Professional subscription (timestamp: T1)
2. Profile trigger fires, creates Explorer subscription (timestamp: T2)
3. Resolver queries: `.order('created_at', { ascending: false })` → Returns Explorer (T2 > T1)
4. User sees "Explorer Plan" despite having Professional

**Fix Applied**:
- Modified `packages/entitlements/index.ts` to fetch ALL active subscriptions and select highest rank
- Modified `apps/api-gateway/src/components/ui/AccountMenu.tsx` to match resolver logic
- Modified `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx` to match resolver logic

**New Logic**:
```typescript
// Get ALL active subscriptions
const subscriptions = await supabase
  .from('souvera_subscriptions')
  .select('plan_id')
  .eq('user_id', userId)
  .in('status', ['trial', 'active']);

// Select highest rank if multiple exist
if (subscriptions.length > 1) {
  subscription = subscriptions.reduce((highest, current) => {
    const currentRank = PLAN_RANKS[current.plan_id] || 0;
    const highestRank = PLAN_RANKS[highest.plan_id] || 0;
    return currentRank > highestRank ? current : highest;
  });
}
```

---

### Issue 2: Profile Trigger Creates Duplicate Explorer

**Root Cause**: The `process_invitation_on_signup()` trigger always creates an Explorer subscription if no invitation exists, even if provisioning script already created a subscription.

**Sequence**:
1. Provisioning script creates Professional subscription
2. Profile trigger fires (async)
3. Trigger checks for invitation (none found)
4. Trigger creates Explorer subscription
5. Result: User has BOTH Professional AND Explorer active

**Fix Applied**:
Created `sql-pack-v1.8-fix-trigger-duplicates.sql` that:
1. Updates trigger to check if ANY active subscription exists before creating Explorer
2. Cleans up existing duplicate subscriptions (keeps highest rank)

**New Trigger Logic**:
```sql
IF NOT EXISTS (
  SELECT 1 FROM public.souvera_subscriptions
  WHERE user_id = NEW.id
    AND status IN ('trial', 'active')
) THEN
  INSERT INTO public.souvera_subscriptions ...
END IF;
```

---

### Issue 3: Browser Session Cache

**Problem**: Browser may cache old Explorer session even after DB is updated.

**Solution**: Force complete logout and cache clear before testing:
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

---

## UPDATED EXECUTION STEPS

### STEP 1: Run RLS Migration (UNCHANGED)

File: `infra/supabase/sql-pack-v1.7-rls-fix.sql`

Status: ✅ This was correct, no changes needed

---

### STEP 2: Run Trigger Fix & Cleanup (NEW)

**CRITICAL: Run this BEFORE re-provisioning**

File: `infra/supabase/sql-pack-v1.8-fix-trigger-duplicates.sql`

This will:
1. Update profile trigger to prevent future duplicates
2. Clean up any existing duplicate subscriptions

**Execute in Supabase SQL Editor**

Expected output:
```
✓ No duplicate subscriptions found
✓ Profile trigger updated
✓ Duplicate subscriptions cleaned up

Trigger will now check for existing subscriptions before creating Explorer default
```

---

### STEP 3: Re-run Provisioning

```bash
npx tsx scripts/seed-test-users.ts
```

Now safe to run - trigger won't create duplicates

---

### STEP 4: Verify Database

```sql
-- Check for duplicates (should be 0)
SELECT 
  p.email,
  COUNT(s.id) as active_count,
  string_agg(s.plan_id, ', ' ORDER BY pl.rank DESC) as plans
FROM souvera_profiles p
LEFT JOIN souvera_subscriptions s ON s.user_id = p.id AND s.status = 'active'
LEFT JOIN souvera_plans pl ON pl.id = s.plan_id
WHERE p.email LIKE '%@afronovation.com'
GROUP BY p.email
HAVING COUNT(s.id) > 1;
```

Expected: 0 rows

```sql
-- Verify correct plans
SELECT 
  p.email,
  s.plan_id,
  pl.rank
FROM souvera_profiles p
JOIN souvera_subscriptions s ON s.user_id = p.id AND s.status = 'active'
JOIN souvera_plans pl ON pl.id = s.plan_id
WHERE p.email LIKE '%@afronovation.com'
ORDER BY pl.rank;
```

Expected:
- explorer@... → explorer (rank 10)
- professional@... → professional (rank 20)
- business@... → business (rank 30)
- institutional@... → institutional (rank 50)

---

### STEP 5: Build and Test

```bash
cd apps/api-gateway
npm run build
```

Then test in browser with FRESH session (clear cache first)

---

## Files Changed (Hotfix)

1. ✅ `packages/entitlements/index.ts` - Fixed resolver to select highest rank
2. ✅ `apps/api-gateway/src/components/ui/AccountMenu.tsx` - Fixed to select highest rank
3. ✅ `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx` - Fixed to select highest rank
4. ✅ `infra/supabase/sql-pack-v1.8-fix-trigger-duplicates.sql` - NEW: Fixes trigger and cleans duplicates

---

## Why This Happened

1. **Original design assumption**: One user = one subscription
2. **Reality**: Profile trigger could create duplicates
3. **Sorting by timestamp**: Newest != Highest priority
4. **No duplicate detection**: Both resolver and frontend queries assumed single result

---

## Testing Checklist (Updated)

### After Hotfix:

- [ ] Run sql-pack-v1.7-rls-fix.sql (if not done)
- [ ] Run sql-pack-v1.8-fix-trigger-duplicates.sql (NEW)
- [ ] Re-run provisioning script
- [ ] Verify NO duplicates in database
- [ ] Clear browser cache completely
- [ ] Test Professional user:
  - [ ] Shows "Professional Plan" (not Explorer)
  - [ ] FDI visible
  - [ ] 5 sectors shown
  - [ ] Console shows warning if duplicates detected
  - [ ] Console shows "selected highest rank" if multiple existed

---

## Prevention

**Going forward**:
1. ✅ Trigger checks for existing subscriptions
2. ✅ Resolver selects by rank, not timestamp
3. ✅ Warns in console if duplicates found
4. ✅ Provisioning script deactivates wrong plans first

---

**Status**: Hotfix ready to deploy  
**Risk**: Low - adds safeguards, cleans data  
**Testing**: Required before Phase 2 QA
