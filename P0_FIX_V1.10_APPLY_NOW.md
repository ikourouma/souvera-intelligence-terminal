# 🚨 P0 FIX - APPLY SQL PACK v1.10 IMMEDIATELY

## Critical Issue
Professional, Business, and Institutional users still show "Explorer Plan" because **legacy recursive RLS policies remain in the database**.

## Root Cause
SQL Pack v1.9 added correct policies but did not drop the old recursive policies by name. Multiple SELECT policies exist, and the recursive ones still cause issues.

**Legacy policies that must be removed**:
- `souvera_subscriptions_select_self_or_org`
- `souvera_org_members_select_same_org`

---

## ✅ SOLUTION: Apply SQL Pack v1.10

### Step 1: Apply SQL Migration

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy the entire contents of:
   ```
   infra/supabase/sql-pack-v1.10-drop-recursive-rls-policies.sql
   ```
3. Paste and **Run** in SQL Editor
4. Verify you see: `✅ SQL PACK v1.10 SUCCESSFULLY APPLIED`

### Step 2: Restart Dev Server

```powershell
# Kill port 3010
Get-NetTCPConnection -LocalPort 3010 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Restart dev server
npm run dev
```

### Step 3: Clear Browser State

- Clear all cookies for `localhost:3010`
- Clear browser cache
- **OR** Open a new incognito/private window

### Step 4: Run Verification SQL

Open and run queries from:
```
docs/qa/p0-auth-entitlement-v1.10-verification.sql
```

**Critical checks**:
1. ✅ No legacy policies exist
2. ✅ Simple self-read policies present
3. ✅ Test users have correct plan assignments
4. ✅ No duplicate active subscriptions

### Step 5: Manual QA

#### Test Explorer
- Login: `explorer@afronovation.com`
- Account dropdown should show: **"Explorer Plan"**
- Visit: `http://localhost:3010/api/v1/me`
- Should return: `{ access: { tier: "explorer" } }`
- FDI should be **LOCKED**

#### Test Professional
- Logout, Login: `professional@afronovation.com`
- Account dropdown should show: **"Professional Plan"**
- Visit: `http://localhost:3010/api/v1/me`
- Should return: `{ access: { tier: "professional" } }`
- Visit: `http://localhost:3010/api/v1/country-lite?iso3=NGA`
- Should include: `fdiNetInflowsUsd` value
- FDI should be **VISIBLE**

#### Test Business
- Logout, Login: `business@afronovation.com`
- Account dropdown should show: **"Business Plan"**
- FDI should be **VISIBLE**

#### Test Institutional
- Logout, Login: `institutional@afronovation.com`
- Account dropdown should show: **"Institutional Plan"**
- FDI should be **VISIBLE**

---

## 🎯 Expected Results After Fix

| User | Account Menu | /api/v1/me | FDI Access |
|------|--------------|------------|------------|
| explorer@ | Explorer Plan | `tier: "explorer"` | ❌ Locked |
| professional@ | Professional Plan | `tier: "professional"` | ✅ Visible |
| business@ | Business Plan | `tier: "business"` | ✅ Visible |
| institutional@ | Institutional Plan | `tier: "institutional"` | ✅ Visible |

---

## 🔍 Troubleshooting

### If Professional still shows "Explorer Plan":

1. **Verify SQL was applied**:
   ```sql
   SELECT policyname FROM pg_policies 
   WHERE tablename = 'souvera_subscriptions';
   ```
   Should **NOT** see: `souvera_subscriptions_select_self_or_org`

2. **Verify dev server restarted**:
   - Check terminal - should show fresh build
   - Check port 3010 is the new process

3. **Verify browser cache cleared**:
   - Use incognito window
   - Hard refresh (Ctrl+Shift+R)

4. **Check for console errors**:
   - Should **NOT** see: `[AccountMenu] Subscription query error`
   - Should **NOT** see: `infinite recursion detected`

### If FDI still locked for Professional+:

1. Verify `/api/v1/me` returns correct tier
2. Verify `/api/v1/country-lite?iso3=NGA` returns correct `meta.accessTier`
3. Check server logs for entitlement resolution errors

---

## 📋 Files Created/Updated

### New Files
- `infra/supabase/sql-pack-v1.10-drop-recursive-rls-policies.sql`
- `docs/qa/p0-auth-entitlement-v1.10-verification.sql`

### Updated Files
- `docs/qa/p0-auth-entitlement-fix-implementation.md` (added v1.10 section)

---

## ✅ Success Criteria

- [ ] SQL Pack v1.10 applied successfully
- [ ] Legacy recursive policies dropped
- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] Explorer shows "Explorer Plan"
- [ ] Professional shows "Professional Plan"
- [ ] Business shows "Business Plan"
- [ ] Institutional shows "Institutional Plan"
- [ ] Professional+ FDI visible
- [ ] Explorer FDI locked
- [ ] No console errors
- [ ] No RLS recursion errors

---

## 🚀 After Fix Passes

✅ **Phase 2 QA is UNBLOCKED**

You can proceed with comprehensive Phase 2 QA for `/intelligence/africa` workspace embedding.

---

**Last Updated**: 2026-05-01 (Updated: Fixed schema reference in verification SQL)  
**Priority**: P0 Critical Blocker  
**Status**: Ready to Apply
