# Test User Login Verification Checklist

**Date:** May 1, 2026  
**Purpose:** Manual verification of test user login and entitlements  
**Prerequisite:** Test users provisioned via `npx tsx scripts/seed-test-users.ts`  

---

## Overview

This checklist guides you through manual verification of test user login and tier-based entitlements. Complete all sections before proceeding to Phase 2 QA.

**Time Required:** ~30 minutes

---

## Section 1: Supabase Dashboard Verification

### 1.1 Authentication → Users

1. Open Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Search for: `@afronovation.com`

**Expected Results:**

| Email | Email Confirmed At | Created Via | Status |
|-------|-------------------|-------------|--------|
| business@afronovation.com | [timestamp] ✅ | Admin API | Active |
| explorer@afronovation.com | [timestamp] ✅ | Admin API | Active |
| institutional@afronovation.com | [timestamp] ✅ | Admin API | Active |
| professional@afronovation.com | [timestamp] ✅ | Admin API | Active |

**Verification:**
- [ ] All 4 users appear in the list
- [ ] "Email Confirmed At" column shows timestamps (not blank)
- [ ] No users show "Unconfirmed" or "Pending" status

**If users are missing:** Re-run provisioning script

---

### 1.2 Database → Profiles

1. In Supabase Dashboard, navigate to **SQL Editor**
2. Run the following query:

```sql
SELECT 
  id,
  email,
  full_name,
  created_at
FROM souvera_profiles
WHERE email LIKE '%@afronovation.com'
ORDER BY email;
```

**Expected Results:** 4 rows

| email | full_name |
|-------|-----------|
| business@afronovation.com | Test Business User |
| explorer@afronovation.com | Test Explorer User |
| institutional@afronovation.com | Test Institutional User |
| professional@afronovation.com | Test Professional User |

**Verification:**
- [ ] Query returns exactly 4 rows
- [ ] All emails match test user emails
- [ ] All profiles have `full_name` populated

**If profiles are missing:** Re-run provisioning script

---

### 1.3 Database → Subscriptions

Run in Supabase SQL Editor:

```sql
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
```

**Expected Results:** 4 active subscriptions

| email | plan_id | status | plan_rank | ends_at |
|-------|---------|--------|-----------|---------|
| explorer@... | explorer | active | 10 | null |
| professional@... | professional | active | 20 | null |
| business@... | business | active | 30 | null |
| institutional@... | institutional | active | 50 | null |

**Verification:**
- [ ] Query returns exactly 4 rows
- [ ] All subscriptions have `status = 'active'`
- [ ] Plan IDs match tier names
- [ ] Plan ranks are correct (10, 20, 30, 50)
- [ ] `ends_at` is null (no expiration)

**If subscriptions are wrong:** Re-run provisioning script

---

### 1.4 Database → Entitlements

Run in Supabase SQL Editor:

```sql
SELECT 
  p.email,
  s.plan_id,
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
  END as sector_access
FROM souvera_profiles p
JOIN souvera_subscriptions s ON s.user_id = p.id
WHERE p.email LIKE '%@afronovation.com'
  AND s.status = 'active'
ORDER BY s.plan_id;
```

**Expected Results:**

| email | plan_id | fdi_access | sector_access |
|-------|---------|------------|---------------|
| business@... | business | ✓ FDI Visible | ✓ 5 Sectors |
| explorer@... | explorer | ✗ FDI Locked | ✗ 1 Sector |
| institutional@... | institutional | ✓ FDI Visible | ✓ 5 Sectors |
| professional@... | professional | ✓ FDI Visible | ✓ 5 Sectors |

**Verification:**
- [ ] Explorer has "✗ FDI Locked" and "✗ 1 Sector"
- [ ] Professional has "✓ FDI Visible" and "✓ 5 Sectors"
- [ ] Business has "✓ FDI Visible" and "✓ 5 Sectors"
- [ ] Institutional has "✓ FDI Visible" and "✓ 5 Sectors"

**If entitlements are wrong:** Check that `souvera_plan_entitlements` table is seeded correctly

---

## Section 2: Login Verification

### 2.1 Explorer Login Test

**Credentials:**
- Email: `explorer@afronovation.com`
- Password: See `docs/Souvera Test Users.txt`

**Steps:**
1. Open browser in **incognito/private mode**
2. Navigate to: `http://localhost:3000/login` (or deployed URL)
3. Enter email: `explorer@afronovation.com`
4. Enter password
5. Click **"Authorize Access"**

**Expected Behavior:**
- [ ] Loading indicator shows briefly
- [ ] No error message appears
- [ ] Page redirects to `/terminal`
- [ ] User is authenticated

**If login fails:**
- ❌ "Invalid email or password" → User not in auth.users OR wrong password
- ❌ "Email not confirmed" → Re-run provisioning script
- ❌ Stuck on loading → Check network tab for errors
- ❌ Redirect loop → Clear browser cookies

---

### 2.2 Professional Login Test

**Credentials:**
- Email: `professional@afronovation.com`
- Password: See `docs/Souvera Test Users.txt`

**Steps:**
1. Open **new** browser incognito window
2. Navigate to: `http://localhost:3000/login`
3. Enter email: `professional@afronovation.com`
4. Enter password
5. Click **"Authorize Access"**

**Expected Behavior:**
- [ ] Login succeeds
- [ ] Redirects to `/terminal`
- [ ] No error message

---

### 2.3 Business Login Test

**Credentials:**
- Email: `business@afronovation.com`
- Password: See `docs/Souvera Test Users.txt`

**Steps:**
1. Open **new** browser incognito window
2. Navigate to: `http://localhost:3000/login`
3. Enter email: `business@afronovation.com`
4. Enter password
5. Click **"Authorize Access"**

**Expected Behavior:**
- [ ] Login succeeds
- [ ] Redirects to `/terminal`
- [ ] No error message

---

### 2.4 Institutional Login Test

**Credentials:**
- Email: `institutional@afronovation.com`
- Password: See `docs/Souvera Test Users.txt`

**Steps:**
1. Open **new** browser incognito window
2. Navigate to: `http://localhost:3000/login`
3. Enter email: `institutional@afronovation.com`
4. Enter password
5. Click **"Authorize Access"**

**Expected Behavior:**
- [ ] Login succeeds
- [ ] Redirects to `/terminal`
- [ ] No error message

---

## Section 3: Entitlement Verification on /intelligence/map

### 3.1 Explorer Entitlements (Locked FDI, 1 Sector)

**Login as:** `explorer@afronovation.com`

**Steps:**
1. Navigate to: `/intelligence/map`
2. Wait for map to load
3. Click on **Nigeria** (or any African country)
4. Observe right panel "Country Intelligence"

**Expected Behavior:**

**FDI Metric:**
- [ ] Shows lock icon (🔒)
- [ ] Shows label: "Professional+"
- [ ] Does NOT show actual FDI value
- [ ] Value is blurred or hidden

**Sectors:**
- [ ] Shows exactly **1 sector**
- [ ] Sector shows name and icon
- [ ] Sector shows teaser text only
- [ ] Does NOT show sector rationale
- [ ] No "View Full Analysis" or similar

**Screenshot Recommended:** Capture for QA documentation

---

### 3.2 Professional Entitlements (Visible FDI, Up to 5 Sectors)

**Login as:** `professional@afronovation.com`

**Steps:**
1. Navigate to: `/intelligence/map`
2. Click on **Nigeria**
3. Observe right panel

**Expected Behavior:**

**FDI Metric:**
- [ ] Shows actual FDI value (e.g., "$4.8B")
- [ ] No lock icon
- [ ] Value is NOT blurred
- [ ] Clearly readable

**Sectors:**
- [ ] Shows **up to 5 sectors** (depending on data)
- [ ] Each sector shows name, icon, teaser
- [ ] Each sector shows **rationale** (1-2 sentence explanation)
- [ ] Professional-tier content is visible

**Screenshot Recommended:** Capture for QA documentation

---

### 3.3 Business Entitlements (Visible FDI, Up to 5 Sectors)

**Login as:** `business@afronovation.com`

**Steps:**
1. Navigate to: `/intelligence/map`
2. Click on **Nigeria**
3. Observe right panel

**Expected Behavior:**
- [ ] FDI shows actual value (same as Professional)
- [ ] Shows up to 5 sectors with rationale (same as Professional)

---

### 3.4 Institutional Entitlements (Visible FDI, Up to 5 Sectors)

**Login as:** `institutional@afronovation.com`

**Steps:**
1. Navigate to: `/intelligence/map`
2. Click on **Nigeria**
3. Observe right panel

**Expected Behavior:**
- [ ] FDI shows actual value (same as Professional)
- [ ] Shows up to 5 sectors with rationale (same as Professional)

---

## Section 4: Entitlement Verification on /intelligence/africa (Embedded)

### 4.1 Explorer on Africa Page (Locked FDI, 1 Sector)

**Login as:** `explorer@afronovation.com`

**Steps:**
1. Navigate to: `/intelligence/africa`
2. Scroll down to "Explore Africa Markets" section (embedded workspace)
3. Click on **Nigeria** on the map
4. Observe right panel

**Expected Behavior:**
- [ ] FDI shows lock icon + "Professional+" label (same as standalone map)
- [ ] Shows 1 sector only (same as standalone map)
- [ ] Sector shows teaser, no rationale (same as standalone map)

---

### 4.2 Professional on Africa Page (Visible FDI, Up to 5 Sectors)

**Login as:** `professional@afronovation.com`

**Steps:**
1. Navigate to: `/intelligence/africa`
2. Scroll to embedded workspace
3. Click on **Nigeria**
4. Observe right panel

**Expected Behavior:**
- [ ] FDI shows actual value (same as standalone map)
- [ ] Shows up to 5 sectors with rationale (same as standalone map)

---

### 4.3 Business on Africa Page

**Login as:** `business@afronovation.com`

**Steps:**
1. Navigate to: `/intelligence/africa`
2. Scroll to embedded workspace
3. Click on **Nigeria**

**Expected Behavior:**
- [ ] FDI visible (same as Professional)
- [ ] Up to 5 sectors with rationale (same as Professional)

---

### 4.4 Institutional on Africa Page

**Login as:** `institutional@afronovation.com`

**Steps:**
1. Navigate to: `/intelligence/africa`
2. Scroll to embedded workspace
3. Click on **Nigeria**

**Expected Behavior:**
- [ ] FDI visible (same as Professional)
- [ ] Up to 5 sectors with rationale (same as Professional)

---

## Section 5: Cross-Route Consistency

### 5.1 Verify Same Behavior on Both Routes

For each tier, verify:

**Explorer:**
- [ ] `/intelligence/map` shows locked FDI
- [ ] `/intelligence/africa` shows locked FDI
- [ ] Behavior is identical on both routes

**Professional:**
- [ ] `/intelligence/map` shows visible FDI
- [ ] `/intelligence/africa` shows visible FDI
- [ ] Behavior is identical on both routes

**Business:**
- [ ] `/intelligence/map` shows visible FDI
- [ ] `/intelligence/africa` shows visible FDI
- [ ] Behavior is identical on both routes

**Institutional:**
- [ ] `/intelligence/map` shows visible FDI
- [ ] `/intelligence/africa` shows visible FDI
- [ ] Behavior is identical on both routes

---

## Section 6: Session Persistence

### 6.1 Test Session Persistence After Refresh

**Login as:** Any tier

**Steps:**
1. Log in successfully
2. Navigate to `/intelligence/map`
3. Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
4. Observe behavior

**Expected Behavior:**
- [ ] User remains authenticated
- [ ] No redirect to login
- [ ] Data loads correctly
- [ ] Tier-appropriate entitlements still apply

---

### 6.2 Test Session Persistence Across Navigation

**Login as:** Any tier

**Steps:**
1. Log in successfully
2. Navigate to `/intelligence/map`
3. Navigate to `/intelligence/africa`
4. Navigate to `/profile`
5. Navigate back to `/intelligence/map`

**Expected Behavior:**
- [ ] User remains authenticated throughout
- [ ] No login prompts
- [ ] Entitlements remain consistent

---

## Section 7: API Verification (Optional)

### 7.1 Test API Response for Explorer

**Login as:** `explorer@afronovation.com`

**Steps:**
1. Log in via browser
2. Open browser DevTools → Network tab
3. Navigate to `/intelligence/map`
4. Click Nigeria
5. Find API call to `/api/v1/country-lite?iso3=NGA`
6. Inspect response JSON

**Expected Response:**
```json
{
  "country": {
    "name": "Nigeria",
    "gdpCurrentUsd": [value],
    // ... other fields ...
    // fdiNetInflowsUsd should NOT be present
  },
  "meta": {
    "accessTier": "explorer"
  }
}
```

**Verification:**
- [ ] `meta.accessTier` is "explorer"
- [ ] `fdiNetInflowsUsd` is NOT in response
- [ ] Sectors array has 1 item

---

### 7.2 Test API Response for Professional

**Login as:** `professional@afronovation.com`

**Steps:**
1. Repeat API inspection for Professional tier
2. Navigate to `/intelligence/map`
3. Click Nigeria
4. Inspect API response

**Expected Response:**
```json
{
  "country": {
    "name": "Nigeria",
    "gdpCurrentUsd": [value],
    "fdiNetInflowsUsd": [value], // Should be present
    // ... other fields ...
  },
  "meta": {
    "accessTier": "professional"
  }
}
```

**Verification:**
- [ ] `meta.accessTier` is "professional"
- [ ] `fdiNetInflowsUsd` IS in response
- [ ] Sectors array has up to 5 items with rationale

---

## Section 8: Final Checklist

### 8.1 All Tests Passed

- [ ] All 4 users exist in Supabase Auth
- [ ] All 4 profiles exist in `souvera_profiles`
- [ ] All 4 subscriptions are active with correct plans
- [ ] Entitlements are correctly assigned
- [ ] All 4 users can log in successfully
- [ ] Explorer sees locked FDI on both `/intelligence/map` and `/intelligence/africa`
- [ ] Professional sees visible FDI on both routes
- [ ] Business sees visible FDI on both routes
- [ ] Institutional sees visible FDI on both routes
- [ ] Explorer sees 1 sector on both routes
- [ ] Professional+ see up to 5 sectors on both routes
- [ ] Session persists after refresh
- [ ] Session persists across navigation
- [ ] Behavior is identical on standalone and embedded workspaces

---

## Section 9: Issue Tracking

### Issues Found

If any tests fail, document here:

| Test | Tier | Route | Expected | Actual | Severity |
|------|------|-------|----------|--------|----------|
| (example) FDI visibility | Professional | /intelligence/map | Visible | Locked | High |
|  |  |  |  |  |  |
|  |  |  |  |  |  |

---

## Section 10: Sign-Off

### Verification Complete

**Verified by:** ___________________________  
**Date:** ___________________________  
**All tests passed:** [ ] Yes [ ] No  

**Notes:**

---

**If all tests pass:** ✅ Proceed to Phase 2 QA  
**If any tests fail:** ❌ Review issues, fix, and re-verify  

---

## Related Documentation

- [Test User Login Fix Implementation](./test-user-login-fix-implementation.md)
- [Test User Login Failure Diagnosis](../audits/test-user-login-failure-diagnosis.md)
- [Test User Provisioning Guide](./test-users-provisioning.md)
- [Test User Verification SQL](./test-users-verification.sql)
- [Phase 2 Implementation Summary](./phase-2-africa-workspace-embedding-implementation.md)

---

**Checklist Version:** 1.0  
**Last Updated:** May 1, 2026  
**Status:** Ready for Use
