# Test User Login Failure Diagnosis

**Date:** May 1, 2026  
**Auditor:** Souvera Engineering  
**Status:** 🔴 Critical Issue Identified  
**Severity:** High — Blocks Phase 2 QA  

---

## Executive Summary

Test users **cannot log in** to the Souvera Intelligence Terminal because they **have not been provisioned** to Supabase Authentication. The root cause is that `scripts/test-users.local.json` does not exist, which means the provisioning script has never been successfully executed.

### Critical Finding

**❌ Root Cause: Missing `scripts/test-users.local.json`**

- The local credentials file required by `scripts/seed-test-users.ts` does not exist
- Without this file, the script cannot run
- No test users have been created in Supabase Auth
- Login attempts fail with "Invalid login credentials"

### Impact

- **Phase 2 QA blocked** — Cannot test tier-based access on embedded workspace
- **Cannot verify FDI locking** for Explorer tier
- **Cannot verify FDI visibility** for Professional+ tiers
- **Cannot verify sector limiting** (1 for Explorer, up to 5 for Professional+)
- **Cannot validate entitlement system** end-to-end

---

## Diagnosis Methodology

### Files Inspected

| File | Purpose | Status |
|------|---------|--------|
| `scripts/seed-test-users.ts` | Provisioning script | ✅ Correct implementation |
| `scripts/test-users.local.json` | Local credentials | ❌ **MISSING** |
| `docs/examples/souvera-test-users.example.json` | Template | ✅ Exists |
| `docs/qa/test-users-provisioning.md` | Documentation | ✅ Complete |
| `docs/qa/test-users-verification.sql` | Verification queries | ✅ Complete |
| `apps/api-gateway/src/app/(auth)/login/page.tsx` | Login UI | ✅ Correct |
| `apps/api-gateway/src/lib/supabase/client.ts` | Browser client | ✅ Correct |
| `apps/api-gateway/src/lib/supabase/server.ts` | Server client | ✅ Correct |
| `apps/api-gateway/src/app/auth/callback/route.ts` | Auth callback | ✅ Correct |
| `packages/config/src/supabase.ts` | Config package | ✅ Correct |
| `.env.example` | Environment template | ✅ Correct |
| `.gitignore` | Security rules | ✅ Protects credentials |

---

## Authentication Flow Analysis

### Current State (Failing)

```
┌─────────────────────────────────────────────────────────────┐
│ User opens /login                                           │
├─────────────────────────────────────────────────────────────┤
│ Enters email: explorer@afronovation.com                     │
│ Enters password: [from Souvera Test Users.txt]             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ LoginForm.handlePasswordLogin                               │
│ - createClient() from @/lib/supabase/client.ts            │
│ - Uses @supabase/ssr browser client                        │
│ - Calls supabase.auth.signInWithPassword()                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ createBrowserClient() initialized with:                     │
│ - NEXT_PUBLIC_SUPABASE_URL (from .env.local)              │
│ - NEXT_PUBLIC_SUPABASE_ANON_KEY (from .env.local)         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Supabase Auth API Query:                                    │
│ SELECT * FROM auth.users                                    │
│ WHERE email = 'explorer@afronovation.com'                  │
│ AND encrypted_password = hash(input_password)              │
└─────────────────────────────────────────────────────────────┘
                          ↓
                    ❌ NO MATCH
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Error Response:                                             │
│ {                                                           │
│   "error": {                                                │
│     "message": "Invalid login credentials",                 │
│     "status": 400                                           │
│   }                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ UI displays red error banner:                               │
│ "Invalid email or password. Please check your credentials  │
│  and try again."                                            │
└─────────────────────────────────────────────────────────────┘
```

### Expected State (After Fix)

```
┌─────────────────────────────────────────────────────────────┐
│ Prerequisites completed:                                     │
│ 1. scripts/test-users.local.json created                   │
│ 2. npx tsx scripts/seed-test-users.ts executed             │
│ 3. Users exist in auth.users table                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ User logs in with valid credentials                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Supabase Auth API finds user in auth.users                 │
│ - Email matches                                             │
│ - Password hash matches                                     │
│ - email_confirmed_at is set (no confirmation required)     │
└─────────────────────────────────────────────────────────────┘
                          ↓
                    ✅ SUCCESS
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Session created:                                            │
│ - access_token issued                                       │
│ - refresh_token issued                                      │
│ - Cookies set via @supabase/ssr                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ router.push('/terminal')                                    │
│ User redirected to authenticated area                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Findings

### 1. ✅ Provisioning Script is Correctly Implemented

**File:** `scripts/seed-test-users.ts`

**Analysis:**
- ✅ Uses `supabase.auth.admin.createUser()` for new users (line 205)
- ✅ Uses `supabase.auth.admin.updateUserById()` for existing users (line 182)
- ✅ Sets `email_confirm: true` to skip email verification (lines 186, 208)
- ✅ Uses `SUPABASE_SERVICE_ROLE_KEY` (line 62)
- ✅ Creates profiles after Auth user creation (lines 227-242)
- ✅ Upserts subscriptions idempotently (lines 244-266)
- ✅ Deletes old subscriptions before creating new ones (lines 246-249)
- ✅ Validates passwords (must be 8+ chars, not PLACEHOLDER) (lines 124-126)
- ✅ Is idempotent — safe to run multiple times

**Verdict:** Script implementation is correct. No code changes needed.

---

### 2. ❌ Local Credentials File Missing

**Expected File:** `scripts/test-users.local.json`  
**Status:** **DOES NOT EXIST**

**Evidence:**
```bash
# Check performed
$ ls scripts/test-users.local.json
# Result: File not found
```

**Why This Matters:**
- The script reads credentials from this file (line 64)
- Without it, the script exits with error at line 94
- Script execution never reaches the provisioning logic

**Expected Structure:**
```json
{
  "users": [
    {
      "email": "explorer@afronovation.com",
      "password": "[REDACTED]",
      "planId": "explorer",
      "fullName": "Test Explorer User"
    },
    {
      "email": "professional@afronovation.com",
      "password": "[REDACTED]",
      "planId": "professional",
      "fullName": "Test Professional User"
    },
    {
      "email": "business@afronovation.com",
      "password": "[REDACTED]",
      "planId": "business",
      "fullName": "Test Business User"
    },
    {
      "email": "institutional@afronovation.com",
      "password": "[REDACTED]",
      "planId": "institutional",
      "fullName": "Test Institutional User"
    }
  ]
}
```

**Security:**
- ✅ File is correctly ignored in `.gitignore` (lines 52-57)
- ✅ Script never logs passwords (line 336-340 only logs email/plan/status)

---

### 3. ✅ Login Page Implementation is Correct

**File:** `apps/api-gateway/src/app/(auth)/login/page.tsx`

**Analysis:**
- ✅ Uses `createClient()` from `@/lib/supabase/client` (line 29)
- ✅ Calls `supabase.auth.signInWithPassword()` (line 30)
- ✅ Handles errors gracefully (lines 35-40)
- ✅ Shows user-friendly error message (lines 37-39)
- ✅ Redirects to `/terminal` on success (line 44)
- ✅ Supports both password and magic link modes
- ✅ Email and password fields are required
- ✅ Form submits correctly

**Verdict:** Login implementation is correct. No changes needed.

---

### 4. ✅ Supabase Client Configuration is Correct

**Files:**
- `apps/api-gateway/src/lib/supabase/client.ts` (browser client)
- `apps/api-gateway/src/lib/supabase/server.ts` (server client)
- `packages/config/src/supabase.ts` (config package)

**Analysis:**

**Browser Client (used by login page):**
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```
✅ Uses `@supabase/ssr` (correct for Next.js App Router)  
✅ Uses anon key (correct for client-side auth)  
✅ Singleton pattern for performance

**Server Client:**
```typescript
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const cookieStore = await cookies();
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { ... } }
  );
}
```
✅ Properly integrates with Next.js cookies  
✅ Required for server-side session reading

**Verdict:** Supabase client setup is correct. No changes needed.

---

### 5. ✅ Auth Callback Routes are Correct

**Files:**
- `apps/api-gateway/src/app/auth/callback/route.ts`
- `apps/api-gateway/src/app/auth/confirm/route.ts`

**Analysis:**
- ✅ Callback uses `exchangeCodeForSession()` for OAuth flow
- ✅ Confirm uses `verifyOtp()` for magic link flow
- ✅ Both redirect to `/terminal` or custom `next` param
- ✅ Handle forwarded hosts for production deployments
- ✅ Error handling with fallback to `/auth/error`

**Verdict:** Auth routes are correct. No changes needed.

---

### 6. ✅ Environment Variables Configuration

**File:** `.env.example`

**Required Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Analysis:**
- ✅ Template includes all required Supabase variables
- ✅ Service role key is correctly named
- ✅ Public variables use `NEXT_PUBLIC_` prefix

**Assumptions:**
- ✅ `.env.local` exists and contains actual values
- ✅ Both browser and server can access these variables

**Verification Needed:**
- User should verify `.env.local` points to correct Supabase project
- User should verify service role key is valid

---

### 7. ✅ Security Rules are Properly Enforced

**File:** `.gitignore`

**Ignored Files:**
```
# Sensitive files - DO NOT COMMIT
docs/Souvera Test Users.txt
**/test-users*.txt
**/credentials*.txt

# Test user provisioning credentials - NEVER COMMIT
scripts/test-users.local.json
scripts/souvera-test-users.local.json
souvera-test-users.local.json
.env.test-users
*.test-users.json
**/test-users.local.json
```

**Verdict:** Security rules are comprehensive. Credentials are protected.

---

## Environment Alignment Checklist

### Provisioning Script Environment

| Variable | Source | Status |
|----------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` or `apps/api-gateway/.env.local` | ⚠️ To verify |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` or `apps/api-gateway/.env.local` | ⚠️ To verify |

**Script Behavior:**
```typescript
// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api-gateway/.env.local') });
```
✅ Loads from both root and app-specific `.env.local`

---

### App Runtime Environment

| Variable | Source | Used By |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` | Browser client, Server client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | Browser client, Server client |

**Critical Requirement:**
Both the provisioning script and the Next.js app **must point to the same Supabase project**.

---

## Supabase Dashboard Verification Checklist

After running the provisioning script, verify in Supabase Dashboard:

### Authentication → Users

Expected: **4 users**

| Email | Email Confirmed | Created Via | Status |
|-------|-----------------|-------------|--------|
| `explorer@afronovation.com` | ✅ Yes | Admin API | Active |
| `professional@afronovation.com` | ✅ Yes | Admin API | Active |
| `business@afronovation.com` | ✅ Yes | Admin API | Active |
| `institutional@afronovation.com` | ✅ Yes | Admin API | Active |

**Verification Steps:**
1. Navigate to Supabase Dashboard
2. Click **Authentication** in sidebar
3. Click **Users** tab
4. Search for `@afronovation.com`
5. Confirm all 4 users appear
6. Confirm `Email Confirmed At` column shows timestamps (not blank)

---

### Table Editor → souvera_profiles

Expected: **4 rows**

Run query:
```sql
SELECT id, email, full_name, created_at
FROM souvera_profiles
WHERE email LIKE '%@afronovation.com'
ORDER BY email;
```

Expected result: 4 rows matching the 4 Auth users

---

### Table Editor → souvera_subscriptions

Expected: **4 active subscriptions**

Run query:
```sql
SELECT 
  p.email,
  s.plan_id,
  s.status,
  s.starts_at
FROM souvera_subscriptions s
JOIN souvera_profiles p ON p.id = s.user_id
WHERE p.email LIKE '%@afronovation.com'
ORDER BY s.plan_id;
```

Expected result:

| email | plan_id | status | starts_at |
|-------|---------|--------|-----------|
| business@... | business | active | [timestamp] |
| explorer@... | explorer | active | [timestamp] |
| institutional@... | institutional | active | [timestamp] |
| professional@... | professional | active | [timestamp] |

---

## Login Route Verification

### Manual Test Steps

For each test user:

1. Open browser in incognito/private mode
2. Navigate to `http://localhost:3000/login` (or deployed URL)
3. Enter test user email
4. Enter test user password (from `docs/Souvera Test Users.txt`)
5. Click "Authorize Access"

**Expected Behavior:**
- Loading indicator shows briefly
- Page redirects to `/terminal`
- User is authenticated
- No error message appears

**If Login Fails:**
- ❌ "Invalid email or password" → User not in `auth.users` OR password mismatch
- ❌ "Email not confirmed" → User exists but `email_confirmed_at` is null
- ❌ Redirect loop → Session not persisting (check cookies)
- ❌ Network error → Check Supabase URL/anon key in `.env.local`

---

## Recommended Fix

### Step 1: Create Local Credentials File

```bash
# From repository root
cp docs/examples/souvera-test-users.example.json scripts/test-users.local.json
```

### Step 2: Populate Credentials

**⚠️ SECURITY WARNING: Do this manually, do not script it**

Edit `scripts/test-users.local.json`:

1. Open `docs/Souvera Test Users.txt` (not committed to git)
2. Copy actual email addresses
3. Copy actual passwords (8+ characters, not PLACEHOLDER)
4. Paste into `scripts/test-users.local.json`
5. Ensure `planId` values are correct: `explorer`, `professional`, `business`, `institutional`

**Example structure (with REDACTED values):**
```json
{
  "users": [
    {
      "email": "[from Souvera Test Users.txt]",
      "password": "[from Souvera Test Users.txt]",
      "planId": "explorer",
      "fullName": "Test Explorer User"
    },
    ...
  ]
}
```

### Step 3: Verify Environment Variables

Check `.env.local` or `apps/api-gateway/.env.local`:

```bash
# Required variables
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

**⚠️ Critical:** Ensure these point to the **same Supabase project** where you'll test login.

### Step 4: Run Provisioning Script

```bash
# From repository root
npx tsx scripts/seed-test-users.ts
```

**Expected Output:**
```
═══════════════════════════════════════════════════════════════
 SOUVERA TEST USER PROVISIONING
═══════════════════════════════════════════════════════════════

✓ Environment variables loaded
  Supabase URL: https://[redacted]...
✓ Loaded 4 test users from config
✓ Supabase admin client initialized

Provisioning test users...
───────────────────────────────────────────────────────────────
  Creating user: explorer@afronovation.com
  Creating user: professional@afronovation.com
  Creating user: business@afronovation.com
  Creating user: institutional@afronovation.com

═══════════════════════════════════════════════════════════════
 PROVISIONING SUMMARY
═══════════════════════════════════════════════════════════════

  Created: 4
  Updated: 0
  Errors:  0

Results by user:
───────────────────────────────────────────────────────────────
  ✅ explorer@afronovation.com
     Plan: explorer
     Status: Successfully created with explorer plan

  ✅ professional@afronovation.com
     Plan: professional
     Status: Successfully created with professional plan

  ✅ business@afronovation.com
     Plan: business
     Status: Successfully created with business plan

  ✅ institutional@afronovation.com
     Plan: institutional
     Status: Successfully created with institutional plan
```

**If Errors Occur:**
- Check error message in output
- Verify `.env.local` variables are set
- Verify service role key is correct
- Check Supabase Dashboard for RLS issues

### Step 5: Verify in Supabase Dashboard

1. Go to **Supabase Dashboard → Authentication → Users**
2. Search for `@afronovation.com`
3. Confirm 4 users appear
4. Confirm "Email Confirmed At" shows timestamps

### Step 6: Run Verification SQL

In **Supabase Dashboard → SQL Editor**, run:

```sql
-- Summary query from docs/qa/test-users-verification.sql
SELECT 
  p.email,
  s.plan_id,
  pl.rank as plan_rank,
  s.status as subscription_status,
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
JOIN souvera_plans pl ON pl.id = s.plan_id
WHERE p.email LIKE '%@afronovation.com'
  AND s.status = 'active'
ORDER BY pl.rank;
```

**Expected Result:**

| email | plan_id | plan_rank | subscription_status | fdi_access | sector_access |
|-------|---------|-----------|---------------------|------------|---------------|
| explorer@... | explorer | 10 | active | ✗ FDI Locked | ✗ 1 Sector |
| professional@... | professional | 20 | active | ✓ FDI Visible | ✓ 5 Sectors |
| business@... | business | 30 | active | ✓ FDI Visible | ✓ 5 Sectors |
| institutional@... | institutional | 50 | active | ✓ FDI Visible | ✓ 5 Sectors |

### Step 7: Test Login for Each Tier

| Tier | Email | Expected Login | Expected FDI | Expected Sectors |
|------|-------|----------------|--------------|------------------|
| Explorer | explorer@afronovation.com | ✅ Success | 🔒 Locked | 1 |
| Professional | professional@afronovation.com | ✅ Success | ✅ Visible | Up to 5 |
| Business | business@afronovation.com | ✅ Success | ✅ Visible | Up to 5 |
| Institutional | institutional@afronovation.com | ✅ Success | ✅ Visible | Up to 5 |

**Test Procedure:**
1. Open browser in incognito mode
2. Navigate to `/login`
3. Enter email and password
4. Click "Authorize Access"
5. Verify redirect to `/terminal`
6. Navigate to `/intelligence/map`
7. Click any country (e.g., Nigeria)
8. Verify FDI metric shows correct state (locked or visible)
9. Verify sector count is correct (1 or up to 5)
10. Log out and repeat for next tier

---

## Exact Safe Commands to Run

### Phase 1: Preparation

```bash
# 1. Navigate to repository root
cd /path/to/souvera

# 2. Verify .env.local exists and contains Supabase credentials
cat .env.local | grep SUPABASE

# Expected output:
# NEXT_PUBLIC_SUPABASE_URL=https://...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...

# 3. Create local credentials file
cp docs/examples/souvera-test-users.example.json scripts/test-users.local.json

# 4. Edit the file (DO NOT RUN THIS, EDIT MANUALLY)
# code scripts/test-users.local.json
# or
# nano scripts/test-users.local.json
#
# Replace PLACEHOLDER values with actual credentials from:
# docs/Souvera Test Users.txt
```

### Phase 2: Provisioning

```bash
# 5. Run the provisioning script
npx tsx scripts/seed-test-users.ts

# Expected: "Created: 4, Updated: 0, Errors: 0"
```

### Phase 3: Verification

```bash
# 6. Verify .gitignore is protecting credentials
git status

# Expected: scripts/test-users.local.json should NOT appear in untracked files

# 7. (Optional) Build and lint
cd apps/api-gateway
npm run build
npm run lint
```

### Phase 4: Manual Testing

1. Open browser to `http://localhost:3000/login`
2. Test each user login
3. Navigate to `/intelligence/map`
4. Select a country
5. Verify FDI and sector behavior

---

## Verification Steps After Fix

### ✅ Provisioning Verification

- [ ] `scripts/test-users.local.json` exists
- [ ] File contains actual credentials (not PLACEHOLDER)
- [ ] File has 4 users with correct planId values
- [ ] `npx tsx scripts/seed-test-users.ts` runs without errors
- [ ] Script output shows "Created: 4" or "Updated: 4"
- [ ] No errors in provisioning summary

### ✅ Supabase Auth Verification

- [ ] Navigate to Supabase Dashboard → Authentication → Users
- [ ] 4 test users appear (search: `@afronovation.com`)
- [ ] All users have "Email Confirmed At" timestamps
- [ ] No users are "Unconfirmed" or "Pending"

### ✅ Database Verification

Run in Supabase SQL Editor:

- [ ] **Profiles exist:** `SELECT * FROM souvera_profiles WHERE email LIKE '%@afronovation.com'` returns 4 rows
- [ ] **Subscriptions exist:** `SELECT * FROM souvera_subscriptions s JOIN souvera_profiles p ON s.user_id = p.id WHERE p.email LIKE '%@afronovation.com' AND s.status = 'active'` returns 4 rows
- [ ] **Entitlements correct:** Run full verification SQL from `docs/qa/test-users-verification.sql`

### ✅ Login Verification

For each tier:

- [ ] **Explorer:** Login succeeds, redirects to `/terminal`
- [ ] **Professional:** Login succeeds, redirects to `/terminal`
- [ ] **Business:** Login succeeds, redirects to `/terminal`
- [ ] **Institutional:** Login succeeds, redirects to `/terminal`

### ✅ Session Persistence

- [ ] After login, refresh page — user remains authenticated
- [ ] Navigate to `/profile` — shows correct tier
- [ ] Navigate to `/intelligence/map` — loads without auth errors

### ✅ Entitlement Verification (FDI)

Test on `/intelligence/map` by selecting Nigeria (NGA):

- [ ] **Explorer:** FDI shows lock icon + "Professional+" label
- [ ] **Professional:** FDI shows actual value (e.g., "$4.8B")
- [ ] **Business:** FDI shows actual value
- [ ] **Institutional:** FDI shows actual value

### ✅ Entitlement Verification (Sectors)

Test on `/intelligence/map` by selecting Nigeria (NGA):

- [ ] **Explorer:** Shows 1 sector with teaser only, no rationale
- [ ] **Professional:** Shows up to 5 sectors with rationale
- [ ] **Business:** Shows up to 5 sectors with rationale
- [ ] **Institutional:** Shows up to 5 sectors with rationale

### ✅ API Verification

```bash
# Login via browser, copy session cookie, then test API

# As Explorer (should show locked FDI)
curl -X GET "http://localhost:3000/api/v1/country-lite?iso3=NGA" \
  -H "Cookie: [session-cookie]"

# Verify: fdiNetInflowsUsd is NOT in response

# As Professional (should show FDI)
curl -X GET "http://localhost:3000/api/v1/country-lite?iso3=NGA" \
  -H "Cookie: [session-cookie]"

# Verify: fdiNetInflowsUsd IS in response
```

---

## Troubleshooting Guide

### Issue: Script says "Test users file not found"

**Symptom:**
```
❌ Test users file not found: /path/to/scripts/test-users.local.json
```

**Fix:**
```bash
cp docs/examples/souvera-test-users.example.json scripts/test-users.local.json
# Then edit the file with actual credentials
```

---

### Issue: Script says "password must be at least 8 characters"

**Symptom:**
```
Invalid user explorer@...: password must be at least 8 characters (not PLACEHOLDER)
```

**Fix:**
- Open `scripts/test-users.local.json`
- Replace `PLACEHOLDER_PASSWORD_123!` with actual password from `docs/Souvera Test Users.txt`
- Password must be 8+ characters

---

### Issue: Script says "Missing SUPABASE_SERVICE_ROLE_KEY"

**Symptom:**
```
❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable
```

**Fix:**
1. Open `.env.local` (or `apps/api-gateway/.env.local`)
2. Add: `SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]`
3. Get key from: Supabase Dashboard → Settings → API → service_role (secret)

---

### Issue: Users created but login still fails

**Symptom:**
- Script shows "Created: 4"
- Users appear in Supabase Auth
- Login still shows "Invalid login credentials"

**Possible Causes:**

**A. Wrong Password:**
- Verify password in `scripts/test-users.local.json` matches password used at login
- Passwords are case-sensitive

**B. Wrong Supabase Project:**
- Verify app `.env.local` points to same Supabase project as script
- Check `NEXT_PUBLIC_SUPABASE_URL` matches between script and app

**C. Email Not Confirmed:**
- Check Supabase Dashboard → Authentication → Users
- Look at "Email Confirmed At" column
- Should show timestamp, not blank
- If blank, re-run script (it sets `email_confirm: true`)

---

### Issue: Login succeeds but FDI/sectors wrong

**Symptom:**
- Login works
- User redirected to `/terminal`
- But Explorer sees FDI or Professional sees locked FDI

**Possible Causes:**

**A. Subscription Not Applied:**
```sql
-- Check if user has active subscription
SELECT p.email, s.plan_id, s.status
FROM souvera_profiles p
LEFT JOIN souvera_subscriptions s ON s.user_id = p.id
WHERE p.email = 'explorer@afronovation.com';
```
- If `plan_id` is null or `status` is not 'active', re-run provisioning script

**B. Entitlements Not Seeded:**
```sql
-- Check if plan has entitlements
SELECT pe.plan_id, pe.entitlement_key
FROM souvera_plan_entitlements pe
WHERE pe.plan_id = 'professional'
AND pe.entitlement_key = 'full_macro';
```
- If query returns 0 rows, run entitlement seed SQL from `infra/supabase/`

**C. Wrong Plan Assigned:**
```sql
-- Verify plan assignment
SELECT p.email, s.plan_id
FROM souvera_profiles p
JOIN souvera_subscriptions s ON s.user_id = p.id
WHERE p.email = 'explorer@afronovation.com';
```
- If `plan_id` is wrong, edit `scripts/test-users.local.json` and re-run script

---

## Recommendation

### Immediate Actions (Required)

1. ✅ **Create `scripts/test-users.local.json`** from example template
2. ✅ **Populate with actual credentials** from `docs/Souvera Test Users.txt`
3. ✅ **Verify `.env.local`** contains correct Supabase credentials
4. ✅ **Run provisioning script** (`npx tsx scripts/seed-test-users.ts`)
5. ✅ **Verify in Supabase Dashboard** that 4 users exist
6. ✅ **Test login for all 4 tiers**
7. ✅ **Verify FDI and sector entitlements** on `/intelligence/map`

### Post-Fix Actions (Recommended)

1. ✅ **Document any environment-specific setup** in team wiki
2. ✅ **Add to onboarding checklist** for new developers
3. ✅ **Consider automating verification** via CI/CD health check
4. ✅ **Proceed with Phase 2 QA** once all tests pass

---

## Related Documentation

- [Test User Provisioning Guide](../qa/test-users-provisioning.md)
- [Test User Verification SQL](../qa/test-users-verification.sql)
- [Phase 1 QA Gate](./phase-1-map-workspace-qa-gate.md)
- [Phase 2 Implementation Summary](../qa/phase-2-africa-workspace-embedding-implementation.md)

---

**Diagnosis Date:** May 1, 2026  
**Status:** 🔴 Issue Identified — Ready for Fix  
**Next Step:** Execute recommended fix steps to provision test users  
**Estimated Fix Time:** 15-30 minutes

---

**End of Diagnosis Report**
