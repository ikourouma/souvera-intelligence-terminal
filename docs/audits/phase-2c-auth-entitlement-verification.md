# Phase 2C Auth + Entitlement Verification Audit

**Auditor:** Senior Security, Authentication, and Entitlement Auditor  
**Date:** April 28, 2026  
**Scope:** Souvera Intelligence Terminal - Phase 2C Implementation  
**Status:** **PASS with recommendations**

---

## 1. Executive Summary

| Criterion | Result |
|-----------|--------|
| **Overall Status** | PASS |
| **Security Score** | 7.5 / 10 |
| **Safe for Controlled Executive Demo** | Yes |
| **Safe for Authenticated Pilot Users** | Yes, with caveats |

### Summary

Phase 2C has successfully implemented a working authentication system with Supabase Auth, invitation-based onboarding, entitlement-aware API filtering, and protected route handling. The implementation follows security best practices for the most part, including:

- Server-side session management via `@supabase/ssr`
- No service role key exposure in client code
- Proper separation of client/server Supabase clients
- Entitlement checks occur server-side in API routes

**Key Risks Identified:**
1. `/profile` route lacks SEO noindex metadata
2. Password change form in profile does not require current password verification
3. Invitation cleanup depends on manual/cron execution (not automated)
4. Static entitlement mappings may drift from database over time
5. RLS documentation exists in SQL but could be more explicitly referenced
6. Some auth routes (reset-password, set-password) have no metadata/robots directives

### Recommendation

**Proceed to Phase 2D cleanup/hardening** after addressing HIGH severity issues.

---

## 2. Migration Verification Checklist

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| **Leads Migration** | `infra/supabase/sql-pack-v1.3-leads.sql` | ✅ Verified | Table, indexes, RLS policies defined |
| **Auth/Invite Migration** | `infra/supabase/sql-pack-v1.4-auth.sql` | ✅ Verified | Tables, triggers, functions defined |
| **Tables** | | | |
| ↳ `souvera_invitations` | v1.4 | ✅ | With token, expiry, org assignment |
| ↳ `lead_submissions` | v1.3 | ✅ | For forms |
| **Triggers** | | | |
| ↳ `on_auth_user_created` | v1.4 | ✅ | Auto-creates profile |
| ↳ `on_profile_created_process_invite` | v1.4 | ✅ | Processes invitations |
| **Helper Functions** | | | |
| ↳ `souvera_create_invitation()` | v1.4 | ✅ | Admin-gated |
| ↳ `souvera_get_invitation_by_token()` | v1.4 | ✅ | Token lookup |
| ↳ `souvera_cleanup_expired_invitations()` | v1.4 | ✅ | Manual cleanup |
| **RLS Policies** | | | |
| ↳ `souvera_invitations` | v1.4 | ✅ | Admin/org-admin restricted |
| ↳ `lead_submissions` | v1.3 | ✅ | Service role + anon insert |

### Required Environment Variables

| Variable | Required For | Status |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase calls | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth client | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | API routes (leads, country-lite) | ✅ |
| `NEXT_PUBLIC_SITE_URL` | Invitation URLs | ✅ |
| `TERMINAL_URL` | Legacy proxy (optional) | ⚠️ Optional |

---

## 3. Route Protection Matrix

| Route | Type | Unauthenticated Behavior | Authenticated Behavior | Implementation | Pass/Fail | Issues |
|-------|------|--------------------------|------------------------|----------------|-----------|--------|
| `/` | Public | Accessible | Accessible | ✅ | PASS | None |
| `/about` | Public | Accessible | Accessible | ✅ | PASS | None |
| `/access` | Public | Accessible | Accessible | ✅ | PASS | None |
| `/contact` | Public | Accessible | Accessible | ✅ | PASS | None |
| `/login` | Public | Accessible | Redirect to `/terminal` | ✅ | PASS | None |
| `/register` | Public | Redirect to `/access/request-access` | Redirect to `/terminal` | ✅ | PASS | Via next.config |
| `/auth/*` | Public | Accessible | Accessible | ✅ | PASS | None |
| `/platform/*` | Public | Accessible | Accessible | ✅ | PASS | None |
| `/intelligence/*` | Public | Accessible | Accessible | ✅ | PASS | None |
| `/sectors/*` | Public | Accessible | Accessible | ✅ | PASS | None |
| `/insights/*` | Public | Accessible | Accessible | ✅ | PASS | None |
| `/resources/*` | Public | Accessible | Accessible | ✅ | PASS | None |
| `/terminal` | Protected | Redirect to `/login?redirect=/terminal` | Accessible | ✅ | PASS | None |
| `/profile` | Protected | Redirect to `/login?redirect=/profile` | Accessible | ✅ | PASS | Missing noindex |
| `/settings` | Protected | Redirect to `/login` | Accessible | ✅ | PASS | No page exists |
| `/org/*` | Protected | Redirect to `/login` | Accessible | ✅ | PASS | No pages exist |
| `/admin/*` | Protected | Redirect to `/login` | Accessible | ✅ | PASS | No pages exist |
| `/dashboard` | Protected | Redirect to `/login` | Accessible | ✅ | PASS | Legacy proxy |
| `/api/v1/leads` | API | Accessible (POST) | Accessible (POST) | ✅ | PASS | None |
| `/api/v1/country-lite` | API | Accessible (public tier) | Accessible (plan tier) | ✅ | PASS | None |
| `/api/v1/invitations` | API | 401 | Accessible (admin check) | ✅ | PASS | None |
| `/api/v1/invitations/validate` | API | Accessible | Accessible | ✅ | PASS | None |

---

## 4. Auth Flow Matrix

| Flow | Route(s) | Expected Behavior | Implementation Status | Risk | Recommended Fix |
|------|----------|-------------------|----------------------|------|-----------------|
| **Email/Password Login** | `/login` | Validate credentials, set session | ✅ Complete | LOW | None |
| **Magic Link Login** | `/login` → `/auth/callback` | Send OTP, exchange code for session | ✅ Complete | LOW | None |
| **Email Confirmation** | `/auth/confirm` | Verify OTP token_hash | ✅ Complete | LOW | None |
| **Forgot Password** | `/auth/forgot-password` | Send reset email | ✅ Complete | LOW | None |
| **Reset Password** | `/auth/reset-password` | Update password via `updateUser` | ✅ Complete | MEDIUM | Add session check |
| **Set Password (Invited)** | `/auth/set-password` | First-time password for invitees | ✅ Complete | MEDIUM | Verify invitation status |
| **Profile Update** | `/profile` | Update `souvera_profiles` | ✅ Complete | LOW | None |
| **Password Change** | `/profile` | Update password | ⚠️ Incomplete | HIGH | Require current password |
| **Logout** | `/profile` | Clear session, redirect | ✅ Complete | LOW | None |

### Auth Flow Issues

1. **Password Change Without Verification (HIGH)**
   - File: `apps/api-gateway/src/app/profile/page.tsx`
   - Issue: Password change does not require current password
   - Risk: If session is hijacked, attacker can change password
   - Fix: Add current password field and verify before update

2. **Reset Password Page Access (MEDIUM)**
   - File: `apps/api-gateway/src/app/auth/reset-password/page.tsx`
   - Issue: No check that user arrived via valid reset link
   - Risk: Low - Supabase handles token internally
   - Fix: Consider adding state validation

---

## 5. Invitation System Audit

| Component | Implementation | Security Risk | Pass/Fail | Recommendation |
|-----------|---------------|---------------|-----------|----------------|
| **Token Generation** | 32-byte hex via `gen_random_bytes` | NONE | PASS | Cryptographically secure |
| **Token Validation** | `souvera_get_invitation_by_token()` RPC | NONE | PASS | Server-side only |
| **Expiration** | 7-day default, checked in SQL | LOW | PASS | Consider shorter for security |
| **Single-Use** | `accepted_at` timestamp set | NONE | PASS | Properly implemented |
| **Organization Assignment** | Automatic via trigger | NONE | PASS | On profile creation |
| **Role Assignment** | From invitation to membership | NONE | PASS | Correct implementation |
| **Invitation Status** | `accepted_at` field | NONE | PASS | Clear audit trail |
| **Error Handling** | User-friendly error page | NONE | PASS | Good UX |
| **Admin-Only Creation** | RPC + RLS policies | NONE | PASS | Proper permission check |
| **Cleanup of Expired** | Manual function | MEDIUM | PASS | Need cron job |

### Invitation Flow Verification

```
Admin creates invitation (via API)
    ↓
RPC `souvera_create_invitation()` validates permissions
    ↓
Token generated, stored in `souvera_invitations`
    ↓
Invite URL sent (manual email step needed)
    ↓
User clicks link → `/auth/callback?invitation=TOKEN`
    ↓
User signs up via magic link
    ↓
Trigger: `handle_new_user` creates profile
    ↓
Trigger: `process_invitation_on_signup` creates subscription + membership
    ↓
Redirect to `/auth/set-password`
    ↓
User sets password → Redirect to `/terminal`
```

---

## 6. Entitlement Audit

| Function/Component | Expected Behavior | Implementation Status | Issue | Recommended Fix |
|--------------------|-------------------|----------------------|-------|-----------------|
| `resolveUserAccess()` | Fetch user plan/entitlements from DB | ✅ Complete | NONE | None |
| `hasEntitlement()` | Check single entitlement | ✅ Complete | NONE | None |
| `getDataView()` | Return appropriate DB view name | ✅ Complete | NONE | None |
| `hasMinimumPlan()` | Compare plan ranks | ✅ Complete | NONE | None |
| `filterByEntitlement()` | Return data or fallback | ✅ Complete | NONE | None |
| **Static Mappings** | `PLAN_ENTITLEMENTS` | ✅ Present | MEDIUM | May drift from DB |
| **DB Mappings** | `souvera_plan_entitlements` table | ✅ Queried | NONE | Source of truth |
| **Plan Hierarchy** | `PLAN_RANKS` static + `souvera_plan_rank()` RPC | ✅ Both | LOW | Prefer DB |
| **Org Subscription Inheritance** | Via `souvera_organization_members` | ✅ Complete | NONE | None |
| **Platform Admin Handling** | `platform_admin` plan, `admin_console` entitlement | ✅ Complete | NONE | None |
| **Public Fallback** | `PUBLIC_ACCESS` constant | ✅ Complete | NONE | Proper defaults |

### Entitlement Package Structure

```typescript
// packages/entitlements/index.ts
export type EntitlementKey = 'country_identity' | 'headline_macro' | ...;
export type PlanId = 'public' | 'explorer' | 'professional' | ...;
export type OrgRole = 'viewer' | 'analyst' | ...;

export interface UserAccess {
  userId: string;
  email: string | null;
  planRank: number;
  planId: PlanId;
  entitlements: EntitlementKey[];
  organizationId: string | null;
  organizationRole: OrgRole | null;
  isAuthenticated: boolean;
}

export async function resolveUserAccess(supabase, userId?) → UserAccess
export function hasEntitlement(access, key) → boolean
export function getDataView(access) → string
```

### Static vs Database Mapping Risk

| Risk | Description | Mitigation |
|------|-------------|------------|
| **Drift** | Static `PLAN_ENTITLEMENTS` in code may not match `souvera_plan_entitlements` table | Runtime fetches DB entitlements; static is fallback only |
| **Caching** | No explicit cache invalidation | Acceptable for now; consider Redis for scale |

---

## 7. API Security Audit

### `/api/v1/country-lite`

| Check | Status | Notes |
|-------|--------|-------|
| Server-side filtering | ✅ PASS | Uses `resolveUserAccess()` + `getDataView()` |
| Validation | ✅ PASS | ISO3 code validated |
| Rate limiting | ⚠️ MISSING | No rate limit on GET |
| Role enforcement | ✅ PASS | Entitlement checks server-side |
| No unauthorized fields | ✅ PASS | Fields filtered by entitlement |
| No secret leakage | ✅ PASS | Service client internal only |
| No PII in logs | ✅ PASS | Only `err` logged |

### `/api/v1/invitations`

| Check | Status | Notes |
|-------|--------|-------|
| Server-side filtering | ✅ PASS | Auth required for all |
| Validation | ✅ PASS | Email, plan_id, role validated |
| Rate limiting | ⚠️ MISSING | No explicit rate limit |
| Role enforcement | ✅ PASS | RPC checks `admin_console` or `org_admin` |
| No unauthorized fields | ✅ PASS | Token only returned on create |
| No secret leakage | ✅ PASS | Uses `createServerClient()` |
| No PII in logs | ✅ PASS | Only error messages logged |

### `/api/v1/invitations/validate`

| Check | Status | Notes |
|-------|--------|-------|
| Server-side validation | ✅ PASS | RPC `souvera_get_invitation_by_token` |
| No auth required | ✅ CORRECT | Token acts as auth |
| Expiry checked | ✅ PASS | `is_valid` from RPC |
| No secret leakage | ✅ PASS | Email returned (expected) |

### `/api/v1/leads`

| Check | Status | Notes |
|-------|--------|-------|
| Server-side filtering | N/A | Write-only endpoint |
| Validation | ✅ PASS | Email, form_type validated |
| Rate limiting | ✅ PASS | 5/min per IP |
| Sanitization | ✅ PASS | `sanitizeString()` applied |
| No secret leakage | ✅ PASS | Service client internal |
| No PII in logs | ⚠️ CAUTION | IP logged for rate limit |

---

## 8. Client/Server Boundary Audit

| Check | Files Reviewed | Status | Issues |
|-------|----------------|--------|--------|
| **Service role key in client** | All `'use client'` files | ✅ PASS | Not found |
| **Privileged client in component** | `client.ts`, auth pages | ✅ PASS | Uses anon key only |
| **Frontend entitlement trust** | `UpgradePrompt.tsx` | ⚠️ NOTE | UI only, gating is server-side |
| **Internal error exposure** | All pages | ✅ PASS | User-friendly messages |
| **PII in logs** | API routes | ⚠️ CAUTION | IP addresses logged |

### Service Role Usage (Correct)

```
getServiceClient() used ONLY in:
- apps/api-gateway/src/app/api/v1/country-lite/route.ts (API route)
- apps/api-gateway/src/app/api/v1/leads/route.ts (API route)
```

### Client Code (Verified Safe)

```
'use client' files using Supabase:
- login/page.tsx → createClient() (anon key)
- forgot-password/page.tsx → createClient() (anon key)
- reset-password/page.tsx → createClient() (anon key)
- set-password/page.tsx → createClient() (anon key)
- profile/page.tsx → createClient() (anon key)
```

---

## 9. SEO/Auth Indexing Audit

| Route | Should Index | Current Status | Issue |
|-------|--------------|----------------|-------|
| `/login` | NO | Not in sitemap ✅ | ⚠️ No explicit noindex meta |
| `/auth/*` | NO | Not in sitemap ✅ | robots.txt disallows `/(auth)/` |
| `/profile` | NO | Not in sitemap ✅ | ⚠️ No noindex meta |
| `/terminal/*` | NO | Not in sitemap ✅ | Protected by auth |
| `/api/*` | NO | Not in sitemap ✅ | robots.txt disallows `/api/` |
| Marketing pages | YES | In sitemap ✅ | Correctly indexed |

### robots.txt Review

```
# apps/api-gateway/public/robots.txt
User-agent: *
Allow: /
Sitemap: https://souvera.vercel.app/sitemap.xml
Disallow: /api/
Disallow: /(auth)/
```

**Issues:**
1. `/(auth)/` with parentheses may not match `/auth/` properly in all crawlers
2. `/login` is not explicitly disallowed (it's in route group `(auth)`)
3. `/profile` should be disallowed

**Recommended Fix:**
```
Disallow: /api/
Disallow: /auth/
Disallow: /login
Disallow: /profile
Disallow: /terminal
```

### sitemap.ts Review

- Does NOT include `/login`, `/auth/*`, `/profile`, `/terminal` - ✅ Correct
- All public marketing routes included - ✅ Correct

---

## 10. Issues and Fixes

| ID | Severity | File | Issue | Recommended Fix | Owner | Acceptance Criteria |
|----|----------|------|-------|-----------------|-------|---------------------|
| **P2C-001** | HIGH | `profile/page.tsx` | Password change without current password | Add current password field, verify before `updateUser` | Frontend | Cannot change password without entering current password |
| **P2C-002** | MEDIUM | `robots.txt` | `/(auth)/` pattern may not work | Change to `/auth/`, add `/login`, `/profile` | DevOps | Google Search Console shows no auth pages indexed |
| **P2C-003** | MEDIUM | `profile/page.tsx` | Missing noindex metadata | Add `robots: 'noindex, nofollow'` metadata export | Frontend | Page has noindex meta tag |
| **P2C-004** | MEDIUM | N/A | No automated invitation cleanup | Set up Supabase scheduled function or pg_cron | DevOps | Expired invitations cleaned daily |
| **P2C-005** | LOW | `country-lite/route.ts` | No rate limiting | Add rate limit similar to leads endpoint | Backend | Rate limit errors returned on abuse |
| **P2C-006** | LOW | `invitations/route.ts` | No rate limiting | Add rate limit | Backend | Rate limit errors returned |
| **P2C-007** | LOW | `entitlements/index.ts` | Static mappings may drift | Add startup validation or remove static fallbacks | Backend | Entitlements always from DB |
| **P2C-008** | INFO | All auth pages | No `robots` metadata | Consider adding noindex to all auth pages | Frontend | All auth pages have noindex |
| **P2C-009** | INFO | N/A | Email sending not implemented | Document manual invitation process | Docs | README documents flow |
| **P2C-010** | INFO | `leads/route.ts` | IP logged for rate limiting | Document in privacy policy | Legal | Privacy policy updated |

---

## 11. Final Recommendation

### Verdict: **PROCEED TO PHASE 2D (Cleanup/Hardening)**

The Phase 2C implementation successfully delivers:
- ✅ Working authentication with Supabase Auth
- ✅ Invite-only institutional access
- ✅ Server-side entitlement enforcement
- ✅ Protected route handling
- ✅ Proper client/server separation
- ✅ No service role key exposure

**Before Production Pilot:**

1. **MUST FIX (HIGH):**
   - P2C-001: Password change verification

2. **SHOULD FIX (MEDIUM):**
   - P2C-002: robots.txt patterns
   - P2C-003: Profile page noindex
   - P2C-004: Invitation cleanup cron

3. **CAN DEFER:**
   - P2C-005 through P2C-010 can be addressed in Phase 2D

### Phase 2D Scope Recommendation

1. Fix all HIGH and MEDIUM issues from this audit
2. Implement email sending for invitations (SendGrid/Resend)
3. Add admin dashboard for invitation management
4. Add API rate limiting across all authenticated endpoints
5. Add comprehensive test suite for auth flows
6. Document RLS policies in a security runbook

### Phase 3 Readiness

Once Phase 2D is complete, the platform will be ready for:
- Terminal data integration
- Real-time data feeds
- Advanced entitlement gating on terminal features
- Production pilot with authenticated institutional users

---

**Audit Completed:** April 28, 2026  
**Next Review:** After Phase 2D implementation
