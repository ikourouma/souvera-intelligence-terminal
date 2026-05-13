# Souvera Test User Provisioning Guide

> **Owner:** Afronovation, Inc.  
> **Last Updated:** April 2026  
> **Security Classification:** Internal QA

---

## Overview

This guide explains how to provision test users into the Souvera Intelligence Terminal for tier-based QA testing. The provisioning script creates users in Supabase Auth and assigns them the correct plan subscriptions.

## Prerequisites

### 1. Environment Variables

Ensure the following environment variables are set in `.env.local` or `apps/api-gateway/.env.local`:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin) | Supabase Dashboard > Settings > API > service_role (secret) |

**⚠️ Security Warning:** The service role key bypasses Row Level Security. Never expose it client-side or commit it to version control.

### 2. Supabase Database Schema

Ensure the following tables exist (created via `sql-pack-v1.1.sql` and `sql-pack-v1.4-auth.sql`):

- `souvera_profiles` - User identity
- `souvera_subscriptions` - User-plan associations
- `souvera_plans` - Plan definitions (seeded with: explorer, professional, business, institutional)

### 3. Node.js and Dependencies

```bash
# Ensure tsx is available for running TypeScript directly
npm install -g tsx

# Or use npx (recommended)
npx tsx --version
```

---

## Setup Instructions

### Step 1: Create Local Credentials File

Copy the example template to the scripts directory:

```bash
# From repository root
cp docs/examples/souvera-test-users.example.json scripts/test-users.local.json
```

### Step 2: Fill in Actual Credentials

Edit `scripts/test-users.local.json` with real email addresses and passwords:

```json
{
  "users": [
    {
      "email": "your-explorer@yourdomain.com",
      "password": "YourSecurePassword123!",
      "planId": "explorer",
      "fullName": "Test Explorer User"
    },
    {
      "email": "your-professional@yourdomain.com",
      "password": "YourSecurePassword456!",
      "planId": "professional",
      "fullName": "Test Professional User"
    },
    {
      "email": "your-business@yourdomain.com",
      "password": "YourSecurePassword789!",
      "planId": "business",
      "fullName": "Test Business User"
    },
    {
      "email": "your-institutional@yourdomain.com",
      "password": "YourSecurePasswordABC!",
      "planId": "institutional",
      "fullName": "Test Institutional User"
    }
  ]
}
```

**Requirements:**
- Passwords must be at least 8 characters
- Cannot use `PLACEHOLDER` as a password
- Valid planId values: `explorer`, `professional`, `business`, `institutional`, `investor`

### Step 3: Run the Provisioning Script

```bash
# From repository root
npx tsx scripts/seed-test-users.ts
```

**Expected output:**
```
═══════════════════════════════════════════════════════════════
 SOUVERA TEST USER PROVISIONING
═══════════════════════════════════════════════════════════════

✓ Environment variables loaded
✓ Loaded 4 test users from config
✓ Supabase admin client initialized

Provisioning test users...
───────────────────────────────────────────────────────────────
  Creating user: your-explorer@yourdomain.com
  Creating user: your-professional@yourdomain.com
  Creating user: your-business@yourdomain.com
  Creating user: your-institutional@yourdomain.com

═══════════════════════════════════════════════════════════════
 PROVISIONING SUMMARY
═══════════════════════════════════════════════════════════════

  Created: 4
  Updated: 0
  Errors:  0
```

---

## Verification Steps

### 1. Check Auth Users in Supabase Dashboard

Navigate to: **Supabase Dashboard > Authentication > Users**

Verify all test users appear with confirmed email status.

### 2. Verify Subscriptions via SQL

Run in Supabase SQL Editor:

```sql
SELECT 
  p.email, 
  s.plan_id, 
  s.status,
  pl.rank as plan_rank
FROM souvera_subscriptions s
JOIN souvera_profiles p ON p.id = s.user_id
JOIN souvera_plans pl ON pl.id = s.plan_id
WHERE s.status = 'active'
ORDER BY pl.rank;
```

**Expected result:**

| email | plan_id | status | plan_rank |
|-------|---------|--------|-----------|
| explorer@... | explorer | active | 10 |
| professional@... | professional | active | 20 |
| business@... | business | active | 30 |
| institutional@... | institutional | active | 50 |

**💡 Complete Verification Suite:**

For comprehensive verification including entitlement checks, FDI access, and sector limits, see:

📄 **`docs/qa/test-users-verification.sql`**

This includes:
- Profile existence checks
- Plan assignment verification
- Entitlement validation (including `full_macro` for Professional+)
- Subscription status checks
- Complete test user overview query

### 3. Test Login Flow

For each test user:

1. Navigate to `/login`
2. Enter email and password
3. Verify successful redirect to authenticated state
4. Check profile page shows correct tier

### 4. Verify Entitlement Filtering

Test the API to confirm tier-appropriate data:

```bash
# Login and get session token, then test:
curl -X GET "https://your-site.vercel.app/api/v1/country-lite?iso3=NGA" \
  -H "Cookie: sb-access-token=YOUR_SESSION_TOKEN"
```

**Verify:**
- Explorer tier: Basic country identity, headline macro only
- Professional tier: + full macro, FX metrics, signal scores
- Business tier: + forecasts, trade snapshots, comparison data
- Institutional tier: Full access including API fields

---

## Test Matrix

| Tier | Plan ID | Expected Entitlements |
|------|---------|----------------------|
| Explorer | `explorer` | `country_identity`, `headline_macro`, `sector_teasers`, `compare_lite` |
| Professional | `professional` | + `full_macro`, `fx_metrics`, `signal_scores`, `news_signals` |
| Business | `business` | + `forecast_metrics`, `trade_snapshots`, `compare_full`, `reports_download` |
| Institutional | `institutional` | + `api_lite`, `api_full`, `audit_logs` |

---

## Idempotency

The provisioning script is **idempotent**:

- If a user already exists, their password is updated
- Subscriptions are replaced (old deleted, new created)
- Running the script multiple times is safe

---

## Troubleshooting

### Error: "Missing SUPABASE_SERVICE_ROLE_KEY"

Ensure the environment variable is set:

```bash
# Check if set
echo $SUPABASE_SERVICE_ROLE_KEY

# Or check .env.local files
cat .env.local | grep SUPABASE_SERVICE_ROLE_KEY
```

### Error: "Test users file not found"

Create the local credentials file:

```bash
cp docs/examples/test-users.example.json scripts/test-users.local.json
```

### Error: "password must be at least 8 characters"

Update `scripts/test-users.local.json` with valid passwords (not PLACEHOLDER).

### Error: "User already registered" / Conflict

This is normal if users exist. The script will update them instead of creating new ones.

### Subscription not applied correctly

1. Check the `souvera_subscriptions` table directly
2. Ensure only one active subscription exists per user
3. Verify the `plan_id` matches a valid plan in `souvera_plans`

---

## Security Reminders

| Rule | Description |
|------|-------------|
| ❌ Never commit | `scripts/test-users.local.json` must never be committed |
| ❌ Never log passwords | The script never outputs passwords |
| ❌ Never share | Do not share test credentials via email/chat |
| ✅ Use strong passwords | Test accounts should use unique, strong passwords |
| ✅ Rotate periodically | Consider rotating test credentials before major demos |

---

## File Locations

| File | Purpose | Git Status |
|------|---------|------------|
| `scripts/seed-test-users.ts` | Provisioning script | ✅ Tracked |
| `scripts/test-users.local.json` | Actual credentials | ❌ Ignored |
| `docs/examples/test-users.example.json` | Template with placeholders | ✅ Tracked |
| `docs/qa/test-users-provisioning.md` | This documentation | ✅ Tracked |

---

## Related Documentation

- [Environment Variables Guide](/docs/operations/env-vars-auth-leads.md)
- [Auth Entitlement Test Plan](/docs/qa/auth-entitlement-test-plan.md)
- [Phase 3A Implementation Checklist](/docs/execution/phase-3a-implementation-checklist.md)
