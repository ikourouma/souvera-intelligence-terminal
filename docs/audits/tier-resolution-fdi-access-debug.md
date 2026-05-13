# Tier Resolution and FDI Access Debug Report

## Executive Summary

**Issue**: When logged in as `professional@afronovation.com`, the account dropdown shows "Explorer Plan" instead of "Professional Plan", and FDI remains locked with "Professional+" badge. This indicates a **tier resolution failure** that affects all Professional+ users.

**Diagnosis Date**: 2026-05-01  
**Status**: Active Bug - Blocking Phase 2 QA  
**Priority**: Critical  
**Impact**: All tier-based entitlement testing blocked

## Root Cause Hypothesis

Based on code analysis, there are **multiple potential failure points**:

### Primary Hypothesis: RLS Policy Blocking Client-Side Subscription Query

**Most Likely Cause**: The frontend components (`AccountMenu.tsx`, `SouveraMegaNav.tsx`) query `souvera_subscriptions` using the **browser Supabase client** (anon key), but RLS policies may be blocking the query for subscription data.

**Evidence**:
1. The `createClient()` in `client.ts` uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. The subscription query uses `.eq('user_id', user.id)` 
3. If no RLS policy grants `SELECT` access to a user's own subscriptions, the query returns null/empty
4. The catch block silently falls back to `'Explorer'` default

**Critical Code Path (AccountMenu.tsx lines 27-40)**:
```typescript
const { data: subData } = await supabase
  .from('souvera_subscriptions')
  .select('plan_id')
  .eq('user_id', user.id)
  .in('status', ['trial', 'active'])
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

if (subData?.plan_id) {
  const displayName = subData.plan_id.charAt(0).toUpperCase() + subData.plan_id.slice(1);
  setPlan(displayName);
}
// If subData is null (RLS blocked), setPlan() never called → defaults to 'Explorer'
```

### Secondary Hypothesis: Duplicate/Missing Subscriptions

The provisioning script explicitly **deletes all existing subscriptions** before inserting a new one (lines 246-257 of `seed-test-users.ts`):

```typescript
// First, delete any existing subscriptions for this user
await supabase
  .from('souvera_subscriptions')
  .delete()
  .eq('user_id', userId);

// Create fresh subscription
const { error: subError } = await supabase.from('souvera_subscriptions').insert({
  user_id: userId,
  plan_id: planId,
  status: 'active',
  starts_at: new Date().toISOString(),
});
```

**Potential Issues**:
1. Service role client may not have permission to delete from `souvera_subscriptions`
2. Insert may fail silently due to constraint violations
3. Profile trigger may create a default explorer subscription AFTER script runs

### Tertiary Hypothesis: Session/Cookie Stale Data

If the user previously logged in as Explorer and then the database was updated, the session might cache stale user ID or the browser might still be using an old session.

## Auth → Profile → Subscription → Plan → Entitlement Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION FLOW                                │
└──────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────┐
   │  Browser Login  │
   │  (login page)   │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐     ┌───────────────────────────────────────┐
   │ supabase.auth   │────▶│ auth.users table                      │
   │ .signInWith     │     │ - id (UUID) ← returned as user.id    │
   │  Password()     │     │ - email                               │
   │                 │     │ - email_confirmed_at                  │
   └────────┬────────┘     └───────────────────────────────────────┘
            │
            │ Sets session cookie
            ▼
   ┌─────────────────┐
   │ Session Active  │
   │ user.id = UUID  │
   └────────┬────────┘
            │
            │
   ┌────────┴────────┐
   │                 │
   ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND TIER RESOLUTION                │ API TIER RESOLUTION               │
│ (AccountMenu, SouveraMegaNav)           │ (country-lite route)              │
├─────────────────────────────────────────┼───────────────────────────────────┤
│                                         │                                   │
│ 1. createClient() ← uses ANON KEY       │ 1. createServerClient()           │
│                                         │    ← uses cookies + ANON KEY      │
│ 2. Query souvera_subscriptions          │                                   │
│    .eq('user_id', user.id)              │ 2. getUser() returns user.id      │
│    .in('status', ['trial','active'])    │                                   │
│    .limit(1).single()                   │ 3. resolveUserAccess(supabase,    │
│                                         │      user.id)                     │
│ 3. IF RLS BLOCKS: data is null          │                                   │
│    → plan = 'Explorer' (default)        │ 4. Queries with authenticated     │
│                                         │    client                         │
│ 4. Display: "Explorer Plan"             │                                   │
│                                         │ 5. Returns accessTier in meta     │
└─────────────────────────────────────────┴───────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                    DATABASE TABLES & RELATIONSHIPS                           │
└──────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────┐         ┌─────────────────┐
   │   auth.users    │         │ souvera_profiles│
   │                 │◀───────▶│                 │
   │ id (PK)         │ 1:1     │ id (PK, FK)     │
   │ email           │         │ email           │
   └─────────────────┘         │ full_name       │
           │                   └─────────────────┘
           │                           │
           │                           │
           ▼                           ▼
   ┌───────────────────────────────────────────────────────────────┐
   │                    souvera_subscriptions                      │
   │                                                               │
   │  id (PK)                                                      │
   │  user_id (FK → auth.users.id OR souvera_profiles.id)          │
   │  plan_id (FK → souvera_plans.id) ← e.g., 'professional'       │
   │  status  ← 'trial' | 'active' | 'past_due' | 'canceled' etc.  │
   │  starts_at                                                    │
   │  ends_at                                                      │
   └───────────────────────────────────────────────────────────────┘
                        │
                        │ plan_id
                        ▼
   ┌───────────────────────────────────────────────────────────────┐
   │                       souvera_plans                           │
   │                                                               │
   │  id (PK) ← 'explorer', 'professional', 'business', etc.       │
   │  name                                                         │
   │  rank    ← 10, 20, 30, 50, 100                                │
   └───────────────────────────────────────────────────────────────┘
                        │
                        │ plan_id
                        ▼
   ┌───────────────────────────────────────────────────────────────┐
   │                 souvera_plan_entitlements                     │
   │                                                               │
   │  plan_id (FK → souvera_plans.id)                              │
   │  entitlement_key (FK → souvera_entitlements.key)              │
   │                                                               │
   │  professional + full_macro = ✓                                │
   │  explorer + full_macro = ✗                                    │
   └───────────────────────────────────────────────────────────────┘
```

## Database Verification Queries

Run these queries in **Supabase SQL Editor** to diagnose the issue:

### 1. Check if test users exist in auth.users

```sql
-- Requires superuser or auth schema access
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email LIKE '%@afronovation.com'
ORDER BY email;
```

### 2. Check if profiles match auth.users IDs

```sql
SELECT 
  p.id as profile_id,
  p.email,
  p.full_name
FROM souvera_profiles p
WHERE p.email LIKE '%@afronovation.com'
ORDER BY p.email;
```

### 3. Check subscription data with explicit join

```sql
-- The critical query: does Professional user have Professional subscription?
SELECT 
  p.id as profile_id,
  p.email as profile_email,
  s.id as subscription_id,
  s.user_id as subscription_user_id,
  s.plan_id,
  s.status,
  s.starts_at,
  s.ends_at
FROM souvera_profiles p
LEFT JOIN souvera_subscriptions s ON s.user_id = p.id AND s.status IN ('trial', 'active')
WHERE p.email LIKE '%@afronovation.com'
ORDER BY p.email;
```

### 4. Check for duplicate subscriptions

```sql
SELECT 
  p.email,
  COUNT(s.id) as active_subscription_count,
  string_agg(s.plan_id, ', ') as plans
FROM souvera_profiles p
LEFT JOIN souvera_subscriptions s ON s.user_id = p.id AND s.status IN ('trial', 'active')
WHERE p.email LIKE '%@afronovation.com'
GROUP BY p.email
ORDER BY p.email;
```

### 5. Check RLS policies on souvera_subscriptions

```sql
-- List all policies on souvera_subscriptions
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'souvera_subscriptions';
```

### 6. Check if user can read their own subscription (simulated)

```sql
-- Run this AS the professional user (set auth.uid() context)
-- This requires service role or admin access to test
SELECT 
  s.*
FROM souvera_subscriptions s
WHERE s.user_id = (SELECT id FROM souvera_profiles WHERE email = 'professional@afronovation.com')
  AND s.status IN ('trial', 'active');
```

## Current Test-User Plan Mapping Table

Based on the provisioning script configuration (`scripts/test-users.local.json`):

| Email | Expected Plan | Expected Rank | Has full_macro | FDI Access |
|-------|--------------|---------------|----------------|------------|
| explorer@afronovation.com | explorer | 10 | NO | Locked |
| professional@afronovation.com | professional | 20 | YES | Visible |
| business@afronovation.com | business | 30 | YES | Visible |
| institutional@afronovation.com | institutional | 50 | YES | Visible |

## Account Menu Plan Display Findings

### Code Analysis

**File**: `apps/api-gateway/src/components/ui/AccountMenu.tsx`

**Plan Resolution Logic (lines 24-58)**:
1. Uses browser Supabase client (`createClient()`)
2. Queries `souvera_subscriptions` for `user_id = user.id`
3. Filters by `status IN ('trial', 'active')`
4. Orders by `created_at DESC`, takes first
5. If query returns data, capitalizes `plan_id` for display
6. **If query fails or returns null, silently defaults to "Explorer"**

**Critical Issue**: The code has a silent failure mode:
```typescript
} catch (error) {
  // Fail silently - use defaults
  console.error('Could not fetch user data:', error);
}
```

If the query fails (RLS block, network error, etc.), the user sees "Explorer Plan" regardless of their actual subscription.

### Recommended Debug Step

Add temporary logging to `AccountMenu.tsx`:
```typescript
console.log('User ID:', user.id);
console.log('Subscription query result:', subData);
console.log('Error:', error);
```

## API meta.accessTier Findings

### Code Analysis

**File**: `apps/api-gateway/src/app/api/v1/country-lite/route.ts`

**Access Resolution Logic (lines 46-64)**:
1. Uses server-side Supabase client (`createServerClient()`)
2. Gets authenticated user via `auth.getUser()`
3. Calls `resolveUserAccess(authSupabase, user?.id)`
4. If auth fails, defaults to public access

**Entitlement Package Logic** (`packages/entitlements/index.ts`, lines 141-214):
1. Gets user profile
2. Calls `supabase.rpc('souvera_current_user_plan_rank')` ← **This uses auth.uid()**
3. Queries `souvera_subscriptions` for user
4. Gets entitlements from `souvera_plan_entitlements`
5. Falls back to `'explorer'` if no subscription found

**Important**: The `souvera_current_user_plan_rank()` PostgreSQL function (sql-pack-v1.1.sql lines 728-758) uses `auth.uid()` which requires the user to be authenticated in the database context.

## FDI Visibility Findings

### Code Analysis

**File**: `apps/api-gateway/src/app/api/v1/country-lite/route.ts`

FDI is conditionally included based on `full_macro` entitlement (lines 122-125):
```typescript
...(hasEntitlement(access, 'full_macro') && {
  fdiNetInflowsUsd: countryData.fdi_net_inflows_usd ?? undefined,
  inflationCpiPct: countryData.inflation_cpi_pct ?? undefined,
}),
```

The entitlement comes from `access.entitlements` which is populated by `resolveUserAccess()`.

### Expected vs Actual

| User | Expected `accessTier` | Expected `fdiNetInflowsUsd` | Actual (Reported) |
|------|----------------------|---------------------------|-------------------|
| professional@afronovation.com | `professional` | Present (if data exists) | `explorer`, FDI locked |

## Issue Classification

Based on analysis, the issue is most likely:

| Category | Likelihood | Notes |
|----------|------------|-------|
| **Provisioning Data** | Medium | Script may not have completed successfully, or profile trigger created duplicate Explorer subscription |
| **RLS Policy Missing** | HIGH | No RLS policy visible for users to read their own `souvera_subscriptions` records via anon key |
| **Resolver Logic** | Low | Code logic appears correct if database queries succeed |
| **Duplicate Subscriptions** | Medium | Profile creation trigger may create Explorer subscription; provisioning script may fail to delete it |
| **Session Cookie/Auth Route** | Low | Session appears valid (user is authenticated, email displays correctly) |
| **Frontend Display Logic** | Low | Logic is correct but fails silently on RLS block |

## Primary Root Cause Assessment

**Most Likely**: Missing or incorrect RLS policy on `souvera_subscriptions` for authenticated users to read their own subscriptions.

The SQL pack (sql-pack-v1.1.sql) does NOT show explicit RLS policies for `souvera_subscriptions` for regular users. The only visible RLS policies are for `souvera_invitations`, not subscriptions.

**If RLS is enabled on `souvera_subscriptions` without a policy allowing `SELECT WHERE user_id = auth.uid()`**, the browser client query will return empty results, and the default "Explorer" will be displayed.

## Recommended Fix

### Option A: Add RLS Policy for souvera_subscriptions (Preferred)

```sql
-- Enable RLS if not already enabled
ALTER TABLE public.souvera_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own subscriptions
CREATE POLICY "Users can read their own subscriptions"
ON public.souvera_subscriptions
FOR SELECT
USING (user_id = auth.uid());
```

### Option B: Use Service Role Client for Frontend Plan Fetch

Not recommended - exposes service role key to frontend.

### Option C: Add API Endpoint for User Plan

Create `/api/v1/user/plan` that returns the authenticated user's plan using server-side resolution.

## Additional Investigation Required

1. **Check RLS status on souvera_subscriptions**:
   ```sql
   SELECT relname, relrowsecurity 
   FROM pg_class 
   WHERE relname = 'souvera_subscriptions';
   ```

2. **Check if any SELECT policy exists**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'souvera_subscriptions';
   ```

3. **Verify provisioning script output**: Re-run `npx tsx scripts/seed-test-users.ts` and check for errors.

4. **Check browser console**: Look for errors when AccountMenu fetches subscription data.

## Acceptance Criteria for Fix

- [ ] `professional@afronovation.com` displays "Professional Plan" in account dropdown
- [ ] `professional@afronovation.com` sees FDI values (if data exists)
- [ ] API `meta.accessTier` returns `"professional"` for Professional user
- [ ] `business@afronovation.com` displays "Business Plan"
- [ ] `institutional@afronovation.com` displays "Institutional Plan"
- [ ] `explorer@afronovation.com` displays "Explorer Plan" (no change)
- [ ] `explorer@afronovation.com` sees FDI locked with "Professional+" badge
- [ ] All verification SQL queries pass
- [ ] No duplicate active subscriptions per user

---

**Document Version**: 1.0  
**Created**: 2026-05-01  
**Author**: Souvera Engineering  
**Status**: Diagnosis Complete - Awaiting Fix Implementation
