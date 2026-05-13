# P0 Auth + Entitlement Fix Implementation

**Status**: ✅ Implemented - Awaiting SQL Pack v1.10 and Manual QA  
**Priority**: P0 Critical Blocker  
**Date**: 2026-05-01  
**Updated**: 2026-05-01 (v1.10 follow-up)  
**Owner**: Afronovation, Inc.

---

## Executive Summary

Implemented comprehensive fix for tier-resolution failure affecting Professional, Business, and Institutional users. The root cause was an RLS recursion path in the `souvera_subscriptions` policy that referenced `souvera_organization_members`, causing all subscription queries to fail silently.

### What Changed
1. **SQL Migration**: Replaced recursive RLS policy with simple self-read policy
2. **New Endpoint**: Created `/api/v1/me` as single source of truth for account info
3. **Frontend Refactor**: Updated `AccountMenu` and `SouveraMegaNav` to call `/api/v1/me`
4. **Diagnostics**: Created comprehensive SQL diagnostics for verification

---

## Root Cause

### The Problem

SQL Pack v1.7 created an RLS policy on `souvera_subscriptions` with this logic:

```sql
CREATE POLICY "Users can read their own subscriptions"
ON public.souvera_subscriptions
FOR SELECT
USING (
  user_id = auth.uid()
  OR
  organization_id IN (
    SELECT om.organization_id 
    FROM public.souvera_organization_members om
    WHERE om.user_id = auth.uid()  -- ◄─── RECURSION PATH
  )
);
```

When evaluating this policy:
1. Postgres checks `user_id = auth.uid()` ✅
2. Postgres also evaluates the `OR` clause with subquery on `souvera_organization_members`
3. `souvera_organization_members` has RLS enabled
4. To evaluate that subquery, Postgres needs to apply RLS on `souvera_organization_members`
5. Result: **Infinite recursion detected in policy for relation "souvera_organization_members"**
6. Supabase returns **empty result set** to client (not an error)
7. AccountMenu receives `[]` subscriptions and defaults to "Explorer Plan"
8. FDI locked because `hasEntitlement('full_macro')` = false

---

## Files Changed

### 1. SQL Migration

**File**: `infra/supabase/sql-pack-v1.9-fix-subscription-rls-recursion.sql`

**Changes**:
- Replaced complex subscriptions policy with simple self-read: `USING (user_id = auth.uid())`
- Removed organization-membership subquery (prevents recursion)
- Added simple policy for `souvera_organization_members`: `USING (user_id = auth.uid())`
- Added verification queries and helpful post-execution notices

**Status**: ⚠️ **NOT YET APPLIED** - Must be run in Supabase SQL Editor

### 2. New API Endpoint

**File**: `apps/api-gateway/src/app/api/v1/me/route.ts` (NEW)

**Purpose**: Single source of truth for authenticated user's account info

**Returns**:
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "professional@afronovation.com",
    "fullName": "Professional User"
  },
  "access": {
    "tier": "professional",
    "planId": "professional",
    "planLabel": "Professional Plan",
    "rank": 2,
    "entitlements": ["country_identity", "headline_macro", ..., "full_macro", ...]
  }
}
```

**Implementation**:
- Uses `createServerClient()` to verify authentication
- Calls `resolveUserAccess()` from `@souvera/entitlements` package
- Uses same Supabase client (subject to RLS, but RLS is now fixed)
- Returns empty `{ authenticated: false }` for unauthenticated users
- Never returns sensitive data (passwords, tokens)

### 3. AccountMenu Component

**File**: `apps/api-gateway/src/components/ui/AccountMenu.tsx`

**Changes**:
- ❌ Removed: Direct `souvera_subscriptions` query
- ❌ Removed: Direct `souvera_profiles` query for full_name
- ❌ Removed: `PLAN_RANKS` import and manual tier selection logic
- ✅ Added: Fetch from `/api/v1/me` endpoint
- ✅ Added: Safe error handling (shows "Account" instead of defaulting to "Explorer")

**Before**:
```typescript
const { data: subscriptions, error: subError } = await supabase
  .from('souvera_subscriptions')
  .select('plan_id')
  .eq('user_id', user.id)
  .in('status', ['trial', 'active']);
// ... manual highest-rank selection ...
```

**After**:
```typescript
const response = await fetch('/api/v1/me');
const data = await response.json();
if (data.authenticated && data.access) {
  setPlan(data.access.planLabel.replace(' Plan', ''));
  setFullName(data.user?.fullName);
}
```

### 4. SouveraMegaNav Component

**File**: `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx`

**Changes**: Same pattern as AccountMenu
- ❌ Removed: Direct subscription queries
- ❌ Removed: `PLAN_RANKS` import
- ✅ Added: Fetch from `/api/v1/me`

### 5. Diagnostic SQL

**File**: `docs/qa/p0-auth-entitlement-diagnostics.sql` (NEW)

**Sections**:
1. Schema relationship verification (foreign keys)
2. RLS status and policies check
3. Auth.users and profiles alignment
4. Subscription verification (duplicates, expected vs actual)
5. Plan and entitlement verification (full_macro check)
6. Comprehensive test user summary

---

## SQL Migration Summary

### ⚠️ Important: Use SQL Pack v1.10 (Not v1.9)

SQL Pack v1.9 added correct policies but did not drop legacy recursive policies.  
**Use SQL Pack v1.10** which explicitly removes the legacy policies.

### To Apply (Run in Supabase SQL Editor)

```sql
-- Copy contents of:
-- infra/supabase/sql-pack-v1.10-drop-recursive-rls-policies.sql
-- and run in Supabase Dashboard > SQL Editor
```

### What v1.10 Does

1. **Drops** legacy recursive policies by exact name:
   ```sql
   DROP POLICY IF EXISTS "souvera_subscriptions_select_self_or_org"
   ON public.souvera_subscriptions;
   
   DROP POLICY IF EXISTS "souvera_org_members_select_same_org"
   ON public.souvera_organization_members;
   ```

2. **Re-ensures** simple self-read subscription policy:
   ```sql
   DROP POLICY IF EXISTS "Users can read their own subscriptions"
   ON public.souvera_subscriptions;
   
   CREATE POLICY "Users can read their own subscriptions"
   ON public.souvera_subscriptions
   FOR SELECT
   USING (user_id = auth.uid());
   ```

3. **Re-ensures** organization members policy:
   ```sql
   CREATE POLICY "Users can read their own organization memberships"
   ON public.souvera_organization_members
   FOR SELECT
   USING (user_id = auth.uid());
   ```

4. **Verifies** final policy state and provides helpful notices

---

## v1.10 Follow-Up: Removed Legacy Recursive Policies

### Issue After v1.9

Even after applying SQL Pack v1.9, Professional, Business, and Institutional users still showed "Explorer Plan" in the account dropdown. FDI remained locked.

### Root Cause

SQL Pack v1.9 created new simple policies but **did not drop all legacy recursive policies by their original names**.

**Legacy policies that remained**:
1. `souvera_subscriptions_select_self_or_org` (on `souvera_subscriptions`)
2. `souvera_org_members_select_same_org` (on `souvera_organization_members`)

Both policies contained nested `EXISTS` clauses that queried `souvera_organization_members`, causing RLS recursion.

Postgres/Supabase evaluates **all SELECT policies** on a table using OR logic. Even though v1.9 added correct simple policies, the legacy recursive policies were still being evaluated, causing the same infinite recursion error.

### Solution: SQL Pack v1.10

**File**: `infra/supabase/sql-pack-v1.10-drop-recursive-rls-policies.sql`

**Changes**:
1. Explicitly drops legacy recursive policies by exact name:
   - `DROP POLICY "souvera_subscriptions_select_self_or_org"`
   - `DROP POLICY "souvera_org_members_select_same_org"`

2. Re-ensures simple self-read policies exist:
   - `souvera_subscriptions`: `USING (user_id = auth.uid())`
   - `souvera_organization_members`: `USING (user_id = auth.uid())`

3. Adds comprehensive verification queries and post-execution notices

**Status**: ⚠️ **NOT YET APPLIED** - Must be run in Supabase SQL Editor

### Expected Final Policy State

After applying v1.10:

**souvera_subscriptions should have**:
- ✅ "Users can read their own subscriptions" (FOR SELECT)

**souvera_organization_members should have**:
- ✅ "Users can read their own organization memberships" (FOR SELECT)

**Should NOT have**:
- ❌ `souvera_subscriptions_select_self_or_org`
- ❌ `souvera_org_members_select_same_org`

### Verification Steps

After applying v1.10:

1. **Run**: `docs/qa/p0-auth-entitlement-v1.10-verification.sql`
2. **Verify**: No legacy policies remain
3. **Verify**: Test users have correct plan assignments
4. **Restart**: Dev server (kill port 3010, `npm run dev`)
5. **Clear**: Browser cookies and cache
6. **Test**: Login as professional@afronovation.com
7. **Verify**: Account dropdown shows "Professional Plan"
8. **Verify**: `/api/v1/me` returns `planId: "professional"`
9. **Verify**: `/api/v1/country-lite?iso3=NGA` includes FDI
10. **Repeat**: For business@ and institutional@

---

## /api/v1/me Behavior

### Authenticated Request

```bash
curl -H "Cookie: sb-access-token=..." http://localhost:3010/api/v1/me
```

**Response (200)**:
```json
{
  "authenticated": true,
  "user": {
    "id": "68123b9b-e314-4093-89d5-994f301438e3",
    "email": "professional@afronovation.com",
    "fullName": "Professional User"
  },
  "access": {
    "tier": "professional",
    "planId": "professional",
    "planLabel": "Professional Plan",
    "rank": 2,
    "entitlements": [
      "country_identity",
      "headline_macro",
      "sector_teasers",
      "news_teasers",
      "compare_lite",
      "full_macro",
      "sector_rationale",
      "fx_metrics"
    ]
  }
}
```

### Unauthenticated Request

**Response (200)**:
```json
{
  "authenticated": false
}
```

---

## Account Menu Changes

### Before Fix
- Shows "Explorer Plan" for all users
- Logs empty subscription query error: `{}`
- FDI locked for Professional+

### After Fix
- Shows correct plan label:
  - Explorer → "Explorer Plan"
  - Professional → "Professional Plan"
  - Business → "Business Plan"
  - Institutional → "Institutional Plan"
- No subscription query errors
- Calls `/api/v1/me` instead of direct Supabase query

---

## Country-Lite Entitlement Verification

### Endpoint
`GET /api/v1/country-lite?iso3=NGA`

### Expected Behavior After Fix

| User | meta.accessTier | FDI | Sectors | full_macro |
|------|----------------|-----|---------|------------|
| explorer@afronovation.com | `explorer` | ❌ Locked | 1 | ❌ |
| professional@afronovation.com | `professional` | ✅ Visible | 5 | ✅ |
| business@afronovation.com | `business` | ✅ Visible | 5 | ✅ |
| institutional@afronovation.com | `institutional` | ✅ Visible | 5 | ✅ |

### How It Works

1. `/api/v1/country-lite` calls `resolveUserAccess()`
2. `resolveUserAccess()` queries `souvera_subscriptions` with fixed RLS policy
3. Returns correct plan with entitlements including `full_macro` for Professional+
4. API includes `fdiNetInflowsUsd` only if `hasEntitlement(access, 'full_macro')` is true

---

## Manual QA Checklist

### Pre-Flight
- [ ] SQL Pack v1.9 applied in Supabase
- [ ] Dev server restarted: `npm run dev`
- [ ] Browser cache cleared

### Explorer (explorer@afronovation.com)
- [ ] Login succeeds
- [ ] Account dropdown shows "Explorer Plan"
- [ ] `/api/v1/me` returns `planId: "explorer"`
- [ ] `/api/v1/country-lite?iso3=NGA` returns `meta.accessTier: "explorer"`
- [ ] FDI is absent/locked in response
- [ ] Only 1 sector returned
- [ ] No console errors

### Professional (professional@afronovation.com)
- [ ] Login succeeds
- [ ] Account dropdown shows "Professional Plan"
- [ ] `/api/v1/me` returns `planId: "professional"`
- [ ] `/api/v1/country-lite?iso3=NGA` returns `meta.accessTier: "professional"`
- [ ] `fdiNetInflowsUsd` present in `metrics` if data exists
- [ ] Up to 5 sectors returned with `rationale` fields
- [ ] No console errors

### Business (business@afronovation.com)
- [ ] Login succeeds
- [ ] Account dropdown shows "Business Plan"
- [ ] `/api/v1/me` returns `planId: "business"`
- [ ] `/api/v1/country-lite?iso3=NGA` returns `meta.accessTier: "business"`
- [ ] `fdiNetInflowsUsd` present in `metrics` if data exists
- [ ] Up to 5 sectors returned
- [ ] No console errors

### Institutional (institutional@afronovation.com)
- [ ] Login succeeds
- [ ] Account dropdown shows "Institutional Plan"
- [ ] `/api/v1/me` returns `planId: "institutional"`
- [ ] `/api/v1/country-lite?iso3=NGA` returns `meta.accessTier: "institutional"`
- [ ] `fdiNetInflowsUsd` present in `metrics` if data exists
- [ ] Up to 5 sectors returned
- [ ] No console errors

### Page Testing
- [ ] `/intelligence/map` loads and works
- [ ] `/intelligence/africa` loads and works
- [ ] Map country selection works
- [ ] Account menu logout works

---

## Known Limitations

### 1. Organization-Level Subscriptions Not Supported

**Impact**: Users who should access organization-based subscriptions will only see their direct subscriptions.

**Reason**: The organization-membership OR clause was removed to prevent RLS recursion.

**Future Fix**: Implement organization subscription access using:
- Server-side security-definer function that safely joins subscriptions and memberships
- Or: Dedicated endpoint `/api/v1/organizations/{id}/subscription`

### 2. Multiple Active Subscriptions

**Impact**: If a user has multiple active subscriptions, `resolveUserAccess()` selects the highest-rank one.

**Mitigation**: The seed script (`scripts/seed-test-users.ts`) now deactivates conflicting subscriptions, but this should be enforced at the database level.

**Future Fix**: Add unique constraint or trigger to prevent multiple active subscriptions per user.

### 3. Client Components Still Query Supabase

**Current**: AccountMenu and SouveraMegaNav call `/api/v1/me`, which queries Supabase with RLS.

**Better**: Use service role key in `/api/v1/me` for the authenticated user's own data.

**Trade-off**: Current approach is simpler and safe because RLS policy is now fixed. Service role approach adds complexity but removes RLS dependency entirely.

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| Legacy recursive policies dropped | ⏳ Pending SQL Pack v1.10 |
| No AccountMenu subscription query error | ⏳ Pending SQL Pack v1.10 |
| No SouveraMegaNav subscription query error | ⏳ Pending SQL Pack v1.10 |
| No RLS recursion error in server logs | ⏳ Pending SQL Pack v1.10 |
| No "Explorer Plan" fallback for Professional/Business/Institutional | ⏳ Pending SQL Pack v1.10 |
| Professional+ FDI visible when data exists | ⏳ Pending manual QA |
| Explorer FDI remains locked | ⏳ Pending manual QA |
| `/api/v1/me` returns correct tier | ⏳ Pending manual QA |
| `/api/v1/country-lite` returns correct `meta.accessTier` | ⏳ Pending manual QA |
| `/intelligence/map` works for all tiers | ⏳ Pending manual QA |
| `/intelligence/africa` works for all tiers | ⏳ Pending manual QA |
| Phase 2 QA can begin | ⏳ Blocked until above pass |

---

## Next Steps

### Immediate
1. **Apply SQL Pack v1.10** in Supabase Dashboard > SQL Editor (use v1.10, not v1.9)
2. **Restart dev server**: Kill port 3010 and run `npm run dev`
3. **Clear browser cache** and cookies (or use incognito)
4. **Run diagnostic SQL** from `docs/qa/p0-auth-entitlement-v1.10-verification.sql`
5. **Manual QA**: Test all tiers per checklist above

### After QA Passes
6. **Commit changes** to version control
7. **Update Phase 2 QA plan** to reflect unblocked status
8. **Begin Phase 2 QA** for `/intelligence/africa` workspace

---

## Rollback Plan

If issues occur after SQL migration:

```sql
-- Restore v1.7 policy (with recursion issue)
DROP POLICY IF EXISTS "Users can read their own subscriptions" 
ON public.souvera_subscriptions;

CREATE POLICY "Users can read their own subscriptions"
ON public.souvera_subscriptions
FOR SELECT
USING (
  user_id = auth.uid()
  OR
  organization_id IN (
    SELECT om.organization_id 
    FROM public.souvera_organization_members om
    WHERE om.user_id = auth.uid()
  )
);
```

Then revert frontend changes via git:
```bash
git checkout HEAD -- apps/api-gateway/src/components/ui/AccountMenu.tsx
git checkout HEAD -- apps/api-gateway/src/components/ui/SouveraMegaNav.tsx
rm apps/api-gateway/src/app/api/v1/me/route.ts
```

---

**End of Implementation Documentation**
