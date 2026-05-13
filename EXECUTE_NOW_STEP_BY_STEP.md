# 🚀 EXECUTE P0 FIX NOW - Step by Step Guide

## ✅ Pre-Flight: Schema Verified

**Confirmed**: Migration uses correct schema relationships
- `souvera_profiles.id` = `auth.users.id` (1:1)
- `souvera_subscriptions.user_id` = `souvera_profiles.id`
- RLS policy: `user_id = auth.uid()` ✅ CORRECT

**Status**: Safe to execute

---

## 📋 STEP 1: Run Database Migration

### 1.1 Open Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"** button

### 1.2 Execute Migration

1. Open this file in your editor:
   ```
   infra/supabase/sql-pack-v1.7-rls-fix.sql
   ```

2. **Copy the ENTIRE file contents** (all 145 lines)

3. **Paste** into Supabase SQL Editor

4. Click **"Run"** or press `Ctrl+Enter`

### 1.3 Verify Success

**Expected Output** (bottom of screen):
```
NOTICE:  ✓ RLS policies created successfully
NOTICE:  ✓ souvera_subscriptions: Users can read their own subscriptions
NOTICE:  ✓ souvera_profiles: Users can read/update their own profile
NOTICE:  ✓ souvera_plans: Publicly readable
NOTICE:  ✓ souvera_plan_entitlements: Publicly readable

NOTICE:  Next steps:
NOTICE:  1. Run tier-resolution-verification.sql to verify policies
NOTICE:  2. Re-run: npx tsx scripts/seed-test-users.ts
NOTICE:  3. Test login with professional@afronovation.com
```

**Plus**: A table showing all created policies

### 1.4 If Errors Occur

**Error: "policy already exists"**
- This is OK - policies are idempotent
- Script will continue

**Error: "permission denied"**
- You may not have sufficient privileges
- Contact admin or use service role connection

**Error: "table does not exist"**
- Schema may not be initialized
- Check if `souvera_subscriptions` table exists first

---

## 📋 STEP 2: Re-run Test User Provisioning

### 2.1 Open Terminal

Open terminal in project root:
```bash
cd c:\Users\ikour\Projects\souvera
```

### 2.2 Run Provisioning Script

```bash
npx tsx scripts/seed-test-users.ts
```

### 2.3 Verify Success

**Expected Output**:
```
═══════════════════════════════════════════════════════════════
 SOUVERA TEST USER PROVISIONING
═══════════════════════════════════════════════════════════════

✓ Environment variables loaded
✓ Loaded 4 test users from config
✓ Supabase admin client initialized

Provisioning test users...
───────────────────────────────────────────────────────────────
  User exists: explorer@afronovation.com (updating...)
  User exists: professional@afronovation.com (updating...)
  User exists: business@afronovation.com (updating...)
  User exists: institutional@afronovation.com (updating...)

═══════════════════════════════════════════════════════════════
 PROVISIONING SUMMARY
═══════════════════════════════════════════════════════════════

  Created: 0
  Updated: 4
  Errors:  0

Results by user:
───────────────────────────────────────────────────────────────
  🔄 explorer@afronovation.com
     Plan: explorer
     Status: Successfully updated with explorer plan

  🔄 professional@afronovation.com
     Plan: professional
     Status: Successfully updated with professional plan

  🔄 business@afronovation.com
     Plan: business
     Status: Successfully updated with business plan

  🔄 institutional@afronovation.com
     Plan: institutional
     Status: Successfully updated with institutional plan
```

### 2.4 If Errors Occur

**Error: "Missing SUPABASE_SERVICE_ROLE_KEY"**
- Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY` set
- Get from Supabase Dashboard → Settings → API

**Error: "Test users file not found"**
- Ensure `scripts/test-users.local.json` exists
- Copy from `docs/Souvera Test Users.txt` if needed

---

## 📋 STEP 3: Database Verification

### 3.1 Run Verification Queries

In Supabase SQL Editor, run these key queries:

#### Query 1: Check Policies Created

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

**Expected**: At least 5 policies

#### Query 2: Verify Subscriptions

```sql
SELECT 
  p.email,
  s.plan_id,
  s.status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM souvera_plan_entitlements pe 
      WHERE pe.plan_id = s.plan_id AND pe.entitlement_key = 'full_macro'
    ) THEN '✓ FDI Unlocked'
    ELSE '✗ FDI Locked'
  END as fdi_access
FROM souvera_profiles p
JOIN souvera_subscriptions s ON s.user_id = p.id AND s.status = 'active'
WHERE p.email LIKE '%@afronovation.com'
ORDER BY s.plan_id;
```

**Expected**:
| email | plan_id | status | fdi_access |
|-------|---------|--------|------------|
| business@... | business | active | ✓ FDI Unlocked |
| explorer@... | explorer | active | ✗ FDI Locked |
| institutional@... | institutional | active | ✓ FDI Unlocked |
| professional@... | professional | active | ✓ FDI Unlocked |

#### Query 3: Check for Duplicates

```sql
SELECT 
  p.email,
  COUNT(s.id) as active_count
FROM souvera_profiles p
LEFT JOIN souvera_subscriptions s ON s.user_id = p.id AND s.status = 'active'
WHERE p.email LIKE '%@afronovation.com'
GROUP BY p.email
HAVING COUNT(s.id) != 1;
```

**Expected**: 0 rows (no duplicates)

---

## 📋 STEP 4: Browser Verification

### 4.1 Start Dev Server (if not running)

```bash
cd apps/api-gateway
npm run dev
```

**Note**: Check which port it's running on (usually 3000 or 3010)

### 4.2 Test Explorer User

1. Open browser in **Incognito/Private mode**
2. Go to: `http://localhost:3000/login` (or correct port)
3. Login with:
   - Email: `explorer@afronovation.com`
   - Password: (from `docs/Souvera Test Users.txt`)

#### Expected Results:
- ✅ Account dropdown shows: **"Explorer Plan"**
- ✅ Navigate to `/intelligence/map`
- ✅ Select Nigeria
- ✅ FDI card shows: **"Professional+" lock badge**
- ✅ FDI value: **NOT displayed**
- ✅ Sectors shown: **1 sector**
- ✅ Sector rationale: **NOT displayed**
- ✅ Navigate to `/intelligence/africa`
- ✅ Same FDI lock behavior

#### Check Browser Console:
- Press `F12` → Console tab
- ✅ NO errors like "permission denied"
- ✅ NO subscription query errors

**Logout** when done

### 4.3 Test Professional User

1. Open new **Incognito/Private window**
2. Login with:
   - Email: `professional@afronovation.com`
   - Password: (from docs)

#### Expected Results:
- ✅ Account dropdown shows: **"Professional Plan"** (NOT "Explorer Plan")
- ✅ Navigate to `/intelligence/map`
- ✅ Select Nigeria
- ✅ FDI card shows: **Actual value** (e.g., "$4.87B")
- ✅ FDI lock badge: **NOT present**
- ✅ Sectors shown: **Up to 5 sectors**
- ✅ Sector rationale: **Displayed for each sector**
- ✅ Navigate to `/intelligence/africa`
- ✅ Same FDI visible behavior

#### Verify API Response:
1. Open DevTools → **Network** tab
2. Select Nigeria on map
3. Find request: `/api/v1/country-lite?iso3=NGA`
4. Click request → **Preview** tab
5. Check response:
   ```json
   {
     "meta": {
       "accessTier": "professional",  // ← Must be "professional"
       "authenticated": true
     },
     "metrics": {
       "fdiNetInflowsUsd": 4873000000  // ← Must be present
     },
     "sectors": [  // ← Must have up to 5 sectors
       {
         "label": "Fintech",
         "rationale": "..."  // ← Must have rationale
       }
     ]
   }
   ```

#### Check Browser Console:
- ✅ NO "[AccountMenu] Subscription query error"
- ✅ NO "permission denied for table souvera_subscriptions"

**Logout** when done

### 4.4 Test Business User (Quick Check)

1. Login with: `business@afronovation.com`
2. ✅ Dropdown: "Business Plan"
3. ✅ Select Nigeria → FDI visible, 5 sectors
4. Logout

### 4.5 Test Institutional User (Quick Check)

1. Login with: `institutional@afronovation.com`
2. ✅ Dropdown: "Institutional Plan"
3. ✅ Select Nigeria → FDI visible, 5 sectors
4. Logout

---

## ✅ SUCCESS CRITERIA

All must pass:

### Database Level
- [ ] 5+ RLS policies created
- [ ] Each test user has exactly 1 active subscription
- [ ] Correct plan_id assigned (explorer, professional, business, institutional)
- [ ] Professional+ have `full_macro` entitlement
- [ ] No duplicate active subscriptions

### Frontend Level
- [ ] Explorer shows "Explorer Plan"
- [ ] Professional shows "Professional Plan" (NOT "Explorer Plan")
- [ ] Business shows "Business Plan"
- [ ] Institutional shows "Institutional Plan"
- [ ] No RLS errors in browser console
- [ ] No subscription query errors

### FDI Access
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
- [ ] Professional user: `meta.accessTier` = `"professional"`
- [ ] Professional user: `metrics.fdiNetInflowsUsd` present
- [ ] Professional user: `sectors` array has up to 5 items with `rationale`

---

## 🚨 TROUBLESHOOTING

### Issue: Professional still shows "Explorer Plan"

**Possible Causes**:
1. Browser cache → Hard refresh: `Ctrl+Shift+R`
2. Old session → Logout completely, clear cookies, login again
3. RLS policy not applied → Re-run Step 1
4. Subscription not updated → Re-run Step 2

**Debug**:
```sql
-- Check if policy exists
SELECT * FROM pg_policies WHERE tablename = 'souvera_subscriptions';

-- Check subscription
SELECT * FROM souvera_subscriptions 
WHERE user_id = (SELECT id FROM souvera_profiles WHERE email = 'professional@afronovation.com');
```

### Issue: "Permission denied for table"

**Cause**: RLS policy not created or incorrect

**Fix**:
1. Re-run Step 1 (SQL migration)
2. Verify policy exists: `SELECT * FROM pg_policies WHERE tablename = 'souvera_subscriptions';`

### Issue: FDI still locked for Professional

**Possible Causes**:
1. API not receiving authenticated session → Check Network tab
2. Entitlement not in database → Run verification query
3. Frontend caching old response → Hard refresh

---

## 📝 POST-VERIFICATION

Once all criteria pass, update:

```
docs/qa/tier-resolution-fdi-access-fix.md
```

Add verification results section:
- Migration applied: ✅ Success
- Provisioning rerun: ✅ All users updated
- Database verification: ✅ All queries pass
- Browser QA: ✅ All tiers working
- Phase 2 QA: ✅ UNBLOCKED

---

## 🎯 NEXT STEPS

1. ✅ Close tier resolution bug ticket
2. ✅ **Begin Phase 2 QA**
3. ✅ Test embedded workspace on `/intelligence/africa`
4. ✅ Verify mobile responsiveness across tiers
5. ✅ Test switching between users (logout/login)

---

**Estimated Time**: 10-15 minutes  
**Risk Level**: LOW (idempotent, safe)  
**Status**: Ready to execute NOW

🚀 **START WITH STEP 1**
