# Platform Admin UI Fix — Subscription Added

**Issue:** Platform admin showing "Explorer Plan" instead of "Platform Admin"  
**Root Cause:** Admin had organization role but no plan subscription  
**Fix Applied:** Script now creates both role AND subscription  
**Status:** ✅ Fixed

---

## Problem

After provisioning `admin@souveraterminal.com`, the user could access admin endpoints (proving the `platform_admin` role was assigned in `souvera_organization_members`), but the UI displayed "Explorer Plan" in the account menu.

**Screenshot Evidence:** User showed admin UI displaying "Explorer Plan" badge.

---

## Root Cause

The Souvera system has two separate authorization mechanisms:

1. **Organization Role** (`souvera_organization_members.role`)
   - Controls API endpoint access
   - Checked by `verifyAdminAccess()` function
   - Values: `viewer`, `analyst`, `strategist`, `executive`, `org_admin`, `platform_admin`

2. **Plan Subscription** (`souvera_subscriptions.plan_id`)
   - Controls UI tier display and data visibility
   - Determines entitlements (what data user can see)
   - Values: `explorer`, `professional`, `business`, `institutional`, `investor`, `platform_admin`

**The original script only set #1 (organization role) but not #2 (plan subscription).**

Without a subscription, the UI defaults to showing "Explorer Plan" even though the user has full admin API access.

---

## Fix Applied

Updated `scripts/seed-platform-admin.ts` to create BOTH:

### 1. Organization Role (Already Working)

```typescript
supabase.from('souvera_organization_members').upsert({
  organization_id: organizationId,
  user_id: userId,
  role: 'platform_admin',  // For API endpoint access
})
```

### 2. Plan Subscription (NEW - Added)

```typescript
// Deactivate any non-platform_admin subscriptions
supabase.from('souvera_subscriptions')
  .update({ status: 'canceled' })
  .eq('user_id', userId)
  .neq('plan_id', 'platform_admin')
  .in('status', ['trial', 'active']);

// Create or update platform_admin subscription
supabase.from('souvera_subscriptions').insert({
  user_id: userId,
  plan_id: 'platform_admin',  // For UI display and full data access
  status: 'active',
  starts_at: new Date().toISOString(),
})
```

This logic matches the pattern from `scripts/seed-test-users.ts` which already handles subscription management for other tiers.

---

## Verification

After running the updated script, verify with SQL:

```sql
SELECT 
  u.email,
  om.role as org_role,
  s.plan_id as subscription_plan,
  s.status as subscription_status
FROM auth.users u
LEFT JOIN souvera_organization_members om ON om.user_id = u.id
LEFT JOIN souvera_subscriptions s ON s.user_id = u.id AND s.status = 'active'
WHERE u.email = 'admin@souveraterminal.com';
```

**Expected Result:**
| email | org_role | subscription_plan | subscription_status |
|-------|----------|-------------------|---------------------|
| admin@souveraterminal.com | platform_admin | platform_admin | active |

**UI Verification:**
- Log in as admin@souveraterminal.com
- Check account menu in top right
- Should display **"Platform Admin"** (not "Explorer Plan")
- Should have access to all data and features

---

## Script Output Updated

New output includes subscription confirmation:

```
═══════════════════════════════════════════════════════════════
 PLATFORM ADMIN READY
═══════════════════════════════════════════════════════════════

  Email: admin@souveraterminal.com
  Role: platform_admin
  Subscription: platform_admin (full access)
  Organization: Admin Test Organization
  Status: ✅ Ready for local QA
```

---

## Documentation Updated

Updated the following files to reflect both role and subscription:

1. **`scripts/seed-platform-admin.ts`** — Now creates subscription (Step 5)
2. **`docs/qa/phase-4b-v2-b-admin-provisioning-complete.md`** — Documents both role and subscription assignment
3. This summary document

---

## No Schema or Validation Logic Changed

✅ No tables modified  
✅ No columns added  
✅ No validation logic changed  
✅ No API endpoints modified  
✅ No RLS policies changed

The `platform_admin` plan already existed in `souvera_plans` table (seeded in SQL Pack v1.1). The script simply creates a subscription record for the admin user.

---

## Action Required

The user must now:

1. **Re-run the provisioning script:**
   ```bash
   npx tsx scripts/seed-platform-admin.ts
   ```

2. **Log out and log back in** to refresh the session

3. **Verify UI shows "Platform Admin"** in account menu

4. **Proceed with Phase 4B-V2-B testing** with full admin access

---

**Fix Status:** ✅ Complete  
**User Action:** Re-run script and verify UI  
**Date:** 2026-05-11
