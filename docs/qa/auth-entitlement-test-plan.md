# Souvera Auth & Entitlement Test Plan

**Version:** 1.0  
**Date:** April 28, 2026  
**Scope:** Manual QA for Phase 2C/2D Authentication & Entitlement System

---

## Test Environment Setup

### Prerequisites
- Local dev environment running on `localhost:3000`
- Supabase project with migrations applied:
  - `sql-pack-v1.3-leads.sql`
  - `sql-pack-v1.4-auth.sql`
- Environment variables configured (see `env-vars-auth-leads.md`)
- Test email account accessible
- Browser developer tools open (Console + Network tabs)

### Test Data Requirements
- At least 2 test user accounts
- At least 1 organization
- Valid invitation tokens
- Test ISO3 country codes: ZMB, NGA, GHA

---

## Test Suite

### 1. Public Route Access

**Objective:** Verify unauthenticated users can access public marketing pages.

| Test ID | Route | Expected Result | Pass/Fail | Notes |
|---------|-------|-----------------|-----------|-------|
| PUB-001 | `/` | Page loads, no redirect | [ ] | Homepage |
| PUB-002 | `/about` | Page loads, no redirect | [ ] | |
| PUB-003 | `/platform` | Page loads, no redirect | [ ] | |
| PUB-004 | `/intelligence` | Page loads, no redirect | [ ] | |
| PUB-005 | `/sectors` | Page loads, no redirect | [ ] | |
| PUB-006 | `/insights` | Page loads, no redirect | [ ] | |
| PUB-007 | `/access` | Page loads, no redirect | [ ] | |
| PUB-008 | `/resources` | Page loads, no redirect | [ ] | |
| PUB-009 | `/contact` | Page loads, no redirect | [ ] | |
| PUB-010 | `/status` | Page loads, no redirect | [ ] | |

**Acceptance Criteria:**
- All pages load without authentication
- No console errors
- Footer and navigation visible
- No flash of redirect

---

### 2. Protected Route Redirects

**Objective:** Verify unauthenticated users are redirected to login for protected routes.

| Test ID | Route | Expected Behavior | Pass/Fail | Notes |
|---------|-------|-------------------|-----------|-------|
| PROT-001 | `/terminal` | Redirect to `/login?redirect=/terminal` | [ ] | |
| PROT-002 | `/profile` | Redirect to `/login?redirect=/profile` | [ ] | |
| PROT-003 | `/settings` | Redirect to `/login` | [ ] | |
| PROT-004 | `/dashboard` | Redirect to `/login` | [ ] | Legacy |
| PROT-005 | `/admin` | Redirect to `/login` | [ ] | |
| PROT-006 | `/org` | Redirect to `/login` | [ ] | |

**Steps:**
1. Log out (clear cookies)
2. Navigate to protected route
3. Verify immediate redirect to login
4. Check URL includes `redirect` param where applicable

**Acceptance Criteria:**
- Immediate redirect (no page flash)
- Redirect param preserved
- No console errors

---

### 3. Email/Password Login

**Objective:** Verify users can log in with email and password.

| Test ID | Step | Expected Result | Pass/Fail | Notes |
|---------|------|-----------------|-----------|-------|
| LOGIN-001 | Navigate to `/login` | Login page loads | [ ] | |
| LOGIN-002 | Enter valid email + password | No error | [ ] | |
| LOGIN-003 | Click "Authorize Access" | Loading state shown | [ ] | |
| LOGIN-004 | Wait for response | Redirect to `/terminal` | [ ] | |
| LOGIN-005 | Check session | User authenticated | [ ] | Check dev tools |
| LOGIN-006 | Navigate to `/profile` | Profile page loads (no redirect) | [ ] | |

**Invalid Credentials Test:**
| Test ID | Step | Expected Result | Pass/Fail | Notes |
|---------|------|-----------------|-----------|-------|
| LOGIN-007 | Enter invalid password | Error: "Invalid email or password" | [ ] | |
| LOGIN-008 | Enter non-existent email | Error: "Invalid email or password" | [ ] | |
| LOGIN-009 | Submit empty form | Browser validation error | [ ] | |

**Acceptance Criteria:**
- Successful login redirects to `/terminal` (or `redirect` param)
- Session cookie set
- Error messages user-friendly
- Form disabled during submission

---

### 4. Magic Link Login

**Objective:** Verify passwordless magic link authentication.

| Test ID | Step | Expected Result | Pass/Fail | Notes |
|---------|------|-----------------|-----------|-------|
| MAGIC-001 | Navigate to `/login` | Login page loads | [ ] | |
| MAGIC-002 | Click "Magic Link" tab | Mode switches | [ ] | |
| MAGIC-003 | Enter valid email | No error | [ ] | |
| MAGIC-004 | Click "Send Magic Link" | Success message shown | [ ] | |
| MAGIC-005 | Check email inbox | Email received with link | [ ] | Manual step |
| MAGIC-006 | Click magic link | Redirect to `/auth/callback` | [ ] | |
| MAGIC-007 | Wait for processing | Redirect to `/terminal` | [ ] | |
| MAGIC-008 | Check session | User authenticated | [ ] | |

**Acceptance Criteria:**
- Email sent within 30 seconds
- Link works once
- Session created on callback
- No console errors

---

### 5. Forgot Password Flow

**Objective:** Verify password reset functionality.

| Test ID | Step | Expected Result | Pass/Fail | Notes |
|---------|------|-----------------|-----------|-------|
| FORGOT-001 | Navigate to `/login` | Login page loads | [ ] | |
| FORGOT-002 | Click "Recovery" link | Navigate to `/auth/forgot-password` | [ ] | |
| FORGOT-003 | Enter valid email | No error | [ ] | |
| FORGOT-004 | Click "Send Reset Link" | Success message shown | [ ] | |
| FORGOT-005 | Check email | Reset email received | [ ] | Manual |
| FORGOT-006 | Click reset link | Redirect to `/auth/reset-password` | [ ] | |
| FORGOT-007 | Enter new password (8+ chars, mixed case, number) | No error | [ ] | |
| FORGOT-008 | Click "Update Password" | Success message shown | [ ] | |
| FORGOT-009 | Wait for redirect | Redirect to `/terminal` | [ ] | |
| FORGOT-010 | Try old password | Login fails | [ ] | |
| FORGOT-011 | Try new password | Login succeeds | [ ] | |

**Acceptance Criteria:**
- Reset link valid for 1 hour
- Password requirements enforced
- Old password invalidated
- User can log in with new password

---

### 6. Reset Password Page

**Objective:** Verify authenticated reset password flow.

| Test ID | Step | Expected Result | Pass/Fail | Notes |
|---------|------|-----------------|-----------|-------|
| RESET-001 | Click reset link from email | Page loads | [ ] | |
| RESET-002 | Enter weak password (<8 chars) | Error shown | [ ] | |
| RESET-003 | Enter strong password | Requirements turn green | [ ] | |
| RESET-004 | Mismatch confirm password | Error: "Passwords do not match" | [ ] | |
| RESET-005 | Match passwords correctly | No validation error | [ ] | |
| RESET-006 | Submit form | Success message + redirect | [ ] | |

**Acceptance Criteria:**
- Live password validation
- Clear error messages
- Success confirmation before redirect

---

### 7. Invitation Validation

**Objective:** Verify invitation token validation endpoint.

| Test ID | Step | Expected Result | Pass/Fail | Notes |
|---------|------|-----------------|-----------|-------|
| INV-001 | Create invitation via API | 201 response with token | [ ] | Requires admin auth |
| INV-002 | Call `/api/v1/invitations/validate?token=VALID_TOKEN` | 200, invitation details | [ ] | |
| INV-003 | Check response fields | email, plan_id, role, expires_at | [ ] | |
| INV-004 | Call with expired token | 410, "Invitation has expired" | [ ] | |
| INV-005 | Call with invalid token | 404, "Invitation not found" | [ ] | |
| INV-006 | Call with used token | 410, "already been used" | [ ] | |

**Manual API Test (cURL):**
```bash
curl -X GET "http://localhost:3000/api/v1/invitations/validate?token=YOUR_TOKEN"
```

**Acceptance Criteria:**
- Valid tokens return invitation details
- Expired/invalid tokens return appropriate errors
- No 500 errors

---

### 8. Set Password (Invited Users)

**Objective:** Verify first-time password setup for invited users.

| Test ID | Step | Expected Result | Pass/Fail | Notes |
|---------|------|-----------------|-----------|-------|
| SETPW-001 | Create invitation for new email | Invitation created | [ ] | Admin step |
| SETPW-002 | Send magic link to invited email | Email sent | [ ] | Manual |
| SETPW-003 | Click magic link | Redirect to `/auth/callback` | [ ] | |
| SETPW-004 | After callback | Redirect to `/auth/set-password` | [ ] | |
| SETPW-005 | Page shows correct email | Email displayed | [ ] | |
| SETPW-006 | Enter password (meets requirements) | Requirements turn green | [ ] | |
| SETPW-007 | Confirm password | No error | [ ] | |
| SETPW-008 | Submit | Success message + redirect to `/terminal` | [ ] | |
| SETPW-009 | Check subscription | Plan matches invitation | [ ] | Check DB |
| SETPW-010 | Check org membership | Role matches invitation | [ ] | If org invited |

**Acceptance Criteria:**
- New user auto-created in `souvera_profiles`
- Subscription created with invited plan
- Org membership created (if org invitation)
- Invitation marked as `accepted_at`

---

### 9. Profile Update

**Objective:** Verify profile management functionality.

| Test ID | Step | Expected Result | Pass/Fail | Notes |
|---------|------|-----------------|-----------|-------|
| PROF-001 | Navigate to `/profile` | Profile page loads | [ ] | |
| PROF-002 | Email field is disabled | Cannot edit email | [ ] | |
| PROF-003 | Update Full Name | Input accepts text | [ ] | |
| PROF-004 | Update Title | Input accepts text | [ ] | |
| PROF-005 | Update Organization | Input accepts text | [ ] | |
| PROF-006 | Click "Save Changes" | Loading state shown | [ ] | |
| PROF-007 | Wait for response | Success message shown | [ ] | |
| PROF-008 | Refresh page | Changes persisted | [ ] | |

**Acceptance Criteria:**
- Form updates `souvera_profiles` table
- Success feedback shown
- Data persists on refresh
- Email cannot be changed

---

### 10. Password Change (Profile)

**Objective:** Verify password change with current password verification.

| Test ID | Step | Expected Result | Pass/Fail | Notes |
|---------|------|-----------------|-----------|-------|
| PWCH-001 | Navigate to `/profile` | Profile page loads | [ ] | |
| PWCH-002 | Scroll to "Change Password" | Section visible | [ ] | |
| PWCH-003 | Leave current password empty | Error: "Current password is required" | [ ] | **Phase 2D fix** |
| PWCH-004 | Enter wrong current password | Error: "Current password is incorrect" | [ ] | **Phase 2D fix** |
| PWCH-005 | Enter correct current password | No error | [ ] | |
| PWCH-006 | New password < 8 chars | Validation error | [ ] | |
| PWCH-007 | New password missing uppercase | Validation error | [ ] | |
| PWCH-008 | New password valid | Requirements green | [ ] | |
| PWCH-009 | Confirm password mismatch | Error: "Passwords do not match" | [ ] | |
| PWCH-010 | Confirm password matches | No error | [ ] | |
| PWCH-011 | Submit form | Success message shown | [ ] | |
| PWCH-012 | Log out | Redirect to `/login` | [ ] | |
| PWCH-013 | Try old password | Login fails | [ ] | |
| PWCH-014 | Try new password | Login succeeds | [ ] | |

**Acceptance Criteria:**
- Current password must be verified
- Password requirements enforced
- Old password invalidated
- User can log in with new password

---

### 11. Country-Lite Entitlement Filtering

**Objective:** Verify server-side data filtering based on user plan.

**Test Setup:**
- User 1: `public` (unauthenticated)
- User 2: `explorer` plan
- User 3: `professional` plan
- User 4: `business` plan

| Test ID | User | Endpoint | Expected Fields | Pass/Fail | Notes |
|---------|------|----------|-----------------|-----------|-------|
| ENT-001 | Public | `/api/v1/country-lite?iso3=ZMB` | country, metrics (basic), signal, sectors (teasers only), teaser | [ ] | |
| ENT-002 | Explorer | `/api/v1/country-lite?iso3=ZMB` | Same as public + compare_lite flag | [ ] | |
| ENT-003 | Professional | `/api/v1/country-lite?iso3=ZMB` | + full_macro, fx_metrics, sector rationale, narrative | [ ] | |
| ENT-004 | Business | `/api/v1/country-lite?iso3=ZMB` | + forecast_metrics, trade_snapshots, thesis | [ ] | |
| ENT-005 | Public | Response meta | `accessTier: "public"`, `authenticated: false` | [ ] | |
| ENT-006 | Professional | Response meta | `accessTier: "professional"`, `authenticated: true` | [ ] | |

**Manual Test (cURL):**
```bash
# Public
curl -X GET "http://localhost:3000/api/v1/country-lite?iso3=ZMB"

# Authenticated (replace TOKEN)
curl -X GET "http://localhost:3000/api/v1/country-lite?iso3=ZMB" \
  -H "Cookie: sb-access-token=TOKEN; sb-refresh-token=REFRESH"
```

**Acceptance Criteria:**
- Public users get limited data
- Authenticated users get data per plan
- Server-side filtering (check network response)
- `meta.accessTier` matches user plan

---

### 12. Lead Capture Forms

**Objective:** Verify all marketing forms submit to `/api/v1/leads`.

#### Contact Form

| Test ID | Step | Expected Result | Pass/Fail | Notes |
|---------|------|-----------------|-----------|-------|
| LEAD-001 | Navigate to `/contact` | Form loads | [ ] | |
| LEAD-002 | Fill required fields (name, email, inquiry type, message) | No error | [ ] | |
| LEAD-003 | Submit form | Loading state shown | [ ] | |
| LEAD-004 | Wait for response | Success message shown | [ ] | |
| LEAD-005 | Check DB | Record in `lead_submissions` with `form_type: 'contact'` | [ ] | |

#### Request Access Form

| Test ID | Step | Expected Result | Pass/Fail | Notes |
|---------|------|-----------------|-----------|-------|
| LEAD-006 | Navigate to `/access/request-access` | Form loads | [ ] | |
| LEAD-007 | Fill required fields | No error | [ ] | |
| LEAD-008 | Submit form | Success message shown | [ ] | |
| LEAD-009 | Check DB | Record with `form_type: 'request_access'` | [ ] | |

#### Newsletter Form

| Test ID | Step | Expected Result | Pass/Fail | Notes |
|---------|------|-----------------|-----------|-------|
| LEAD-010 | Navigate to `/` (homepage) | Newsletter section visible | [ ] | |
| LEAD-011 | Enter email | No error | [ ] | |
| LEAD-012 | Submit | Success message shown | [ ] | |
| LEAD-013 | Check DB | Record with `form_type: 'newsletter'` | [ ] | |

**Rate Limiting Test:**
| Test ID | Step | Expected Result | Pass/Fail | Notes |
|---------|------|-----------------|-----------|-------|
| LEAD-014 | Submit 6 forms rapidly | 6th submission returns 429 | [ ] | 5/min limit |
| LEAD-015 | Wait 1 minute | Next submission succeeds | [ ] | |

**Acceptance Criteria:**
- All forms integrate with `/api/v1/leads`
- Success/error states displayed
- Rate limiting enforced (5/min per IP)
- Data saved to `lead_submissions` table

---

## Regression Tests

### SEO & Indexing

| Test ID | Check | Expected Result | Pass/Fail | Notes |
|---------|-------|-----------------|-----------|-------|
| SEO-001 | `robots.txt` includes `/auth/`, `/login`, `/profile` | Disallowed | [ ] | |
| SEO-002 | View page source for `/login` | Contains `<meta name="robots" content="noindex, nofollow">` | [ ] | |
| SEO-003 | View page source for `/profile` | Contains noindex meta | [ ] | |
| SEO-004 | View `/sitemap.xml` | Does NOT include auth/protected routes | [ ] | |
| SEO-005 | View `/sitemap.xml` | Includes all public marketing routes | [ ] | |

### Security

| Test ID | Check | Expected Result | Pass/Fail | Notes |
|---------|-------|-----------------|-----------|-------|
| SEC-001 | Inspect `/api/v1/leads` network request | No `SUPABASE_SERVICE_ROLE_KEY` exposed | [ ] | |
| SEC-002 | Inspect browser client code | Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` used | [ ] | |
| SEC-003 | Try to access `/api/v1/invitations` without auth | 401 Unauthorized | [ ] | |
| SEC-004 | Check session cookies | `httpOnly` flag set | [ ] | |

---

## Post-Test Checklist

- [ ] All HIGH severity issues from Phase 2C audit addressed
- [ ] All MEDIUM severity issues from Phase 2C audit addressed
- [ ] No console errors on any tested page
- [ ] No 500 errors in any API call
- [ ] All forms functional
- [ ] Auth flows complete successfully
- [ ] Entitlement filtering working server-side
- [ ] SEO meta tags correct for auth pages
- [ ] robots.txt updated

---

## Known Issues

_(Document any issues found during testing)_

| Issue ID | Severity | Description | Status |
|----------|----------|-------------|--------|
| | | | |

---

## Test Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Engineering Lead | | | |
| Product Owner | | | |

---

**Test Completed:** ___________  
**Next Review:** After bug fixes
