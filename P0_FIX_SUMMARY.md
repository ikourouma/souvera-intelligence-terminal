# P0 Auth + Entitlement Tier Resolution Fix

## Status: ✅ Implementation Complete - Awaiting SQL Migration and QA

---

## What Was Fixed

Professional, Business, and Institutional users were incorrectly showing "Explorer Plan" and had FDI locked due to an **RLS recursion error** in the database policy.

### Root Cause
The `souvera_subscriptions` RLS policy included an OR clause that queried `souvera_organization_members`, causing infinite recursion. This made subscription queries fail silently, returning empty results.

### Solution
1. **Simplified RLS Policy**: Removed organization subquery, now just `user_id = auth.uid()`
2. **New Endpoint**: Created `/api/v1/me` as single source of truth
3. **Frontend Refactor**: AccountMenu and SouveraMegaNav now call `/api/v1/me` instead of direct Supabase queries

---

## Files Changed

### Created
1. ✅ `infra/supabase/sql-pack-v1.9-fix-subscription-rls-recursion.sql`
2. ✅ `apps/api-gateway/src/app/api/v1/me/route.ts`
3. ✅ `docs/qa/p0-auth-entitlement-diagnostics.sql`
4. ✅ `docs/qa/p0-auth-entitlement-fix-implementation.md`

### Modified
5. ✅ `apps/api-gateway/src/components/ui/AccountMenu.tsx`
6. ✅ `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx`

### Build Status
✅ **Build succeeded** - All routes compile correctly, including new `/api/v1/me`

---

## Critical Next Steps

### STEP 1: Apply SQL Migration ⚠️ REQUIRED

Open Supabase Dashboard → SQL Editor and run:

```
infra/supabase/sql-pack-v1.9-fix-subscription-rls-recursion.sql
```

This will:
- Remove the recursive policy
- Add simple self-read policy for subscriptions
- Add policy for organization members
- Verify no duplicate subscriptions exist

### STEP 2: Restart Dev Server

After SQL migration:
```powershell
# Stop current server (Ctrl+C)
npm run dev
```

### STEP 3: Clear Browser State

Before testing:
- Clear browser cache
- Clear all cookies
- Use incognito/private window

### STEP 4: Run Diagnostics

In Supabase SQL Editor, run:
```
docs/qa/p0-auth-entitlement-diagnostics.sql
```

Verify:
- ✓ RLS policies are simple (no recursion)
- ✓ Each test user has exactly 1 active subscription
- ✓ Subscriptions match expected plans
- ✓ Professional+ plans have `full_macro` entitlement

---

## Manual QA Checklist

### Explorer (explorer@afronovation.com)
- [ ] Login → Account dropdown shows "Explorer Plan"
- [ ] `/api/v1/me` → returns `planId: "explorer"`
- [ ] `/api/v1/country-lite?iso3=NGA` → `meta.accessTier: "explorer"`, FDI absent, 1 sector

### Professional (professional@afronovation.com)
- [ ] Login → Account dropdown shows "Professional Plan"
- [ ] `/api/v1/me` → returns `planId: "professional"`
- [ ] `/api/v1/country-lite?iso3=NGA` → `meta.accessTier: "professional"`, **FDI visible**, 5 sectors

### Business (business@afronovation.com)
- [ ] Login → Account dropdown shows "Business Plan"
- [ ] `/api/v1/me` → returns `planId: "business"`
- [ ] `/api/v1/country-lite?iso3=NGA` → `meta.accessTier: "business"`, **FDI visible**, 5 sectors

### Institutional (institutional@afronovation.com)
- [ ] Login → Account dropdown shows "Institutional Plan"
- [ ] `/api/v1/me` → returns `planId: "institutional"`
- [ ] `/api/v1/country-lite?iso3=NGA` → `meta.accessTier: "institutional"`, **FDI visible**, 5 sectors

### Page Testing
- [ ] `/intelligence/map` works for all tiers
- [ ] `/intelligence/africa` works for all tiers
- [ ] No console errors
- [ ] Logout works

---

## Expected Behavior After Fix

| User | Account Menu | /api/v1/me | Country-Lite | FDI | Sectors |
|------|-------------|------------|--------------|-----|---------|
| Explorer | Explorer Plan | `explorer` | `explorer` | ❌ Locked | 1 |
| Professional | **Professional Plan** | `professional` | `professional` | **✅ Visible** | 5 |
| Business | **Business Plan** | `business` | `business` | **✅ Visible** | 5 |
| Institutional | **Institutional Plan** | `institutional` | `institutional` | **✅ Visible** | 5 |

---

## Testing the /api/v1/me Endpoint

### From Browser Console (while logged in)

```javascript
fetch('/api/v1/me')
  .then(r => r.json())
  .then(data => console.log(data));
```

### Expected Response (Professional)

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

---

## Known Limitations

### 1. Organization-Level Subscriptions Removed
Users accessing subscriptions through organization membership will need a future enhancement using server-side security-definer functions.

### 2. Multiple Active Subscriptions
If a user somehow has multiple active subscriptions, the highest-rank one is selected. The seed script prevents this, but it's not enforced at the database level.

---

## Rollback Plan

If issues occur, the SQL migration and code changes can be reverted:

**SQL Rollback**:
```sql
-- Restore v1.7 policy (see docs for full rollback SQL)
```

**Code Rollback**:
```bash
git checkout HEAD -- apps/api-gateway/src/components/ui/AccountMenu.tsx
git checkout HEAD -- apps/api-gateway/src/components/ui/SouveraMegaNav.tsx
rm apps/api-gateway/src/app/api/v1/me/route.ts
```

---

## Documentation

Full details in:
- `docs/qa/p0-auth-entitlement-fix-implementation.md` - Complete implementation guide
- `docs/qa/p0-auth-entitlement-diagnostics.sql` - SQL verification queries
- `infra/supabase/sql-pack-v1.9-fix-subscription-rls-recursion.sql` - Migration to apply

---

## Phase 2 QA Status

**BLOCKED** until:
- ✅ SQL migration applied
- ✅ All QA checklist items pass
- ✅ No console errors
- ✅ FDI visible for Professional+

Once all acceptance criteria pass, Phase 2 QA can begin.

---

**Ready to proceed with SQL migration.**
