# Souvera Pre-Pilot Readiness Checklist

**Version:** 1.0  
**Date:** April 28, 2026  
**Phase:** 2D Hardening Complete  
**Target:** Controlled Authenticated Pilot Launch

---

## Executive Summary

This checklist ensures Souvera Intelligence Terminal is ready for controlled pilot testing with invited institutional users after Phase 2C/2D implementation.

**Status:** 🟡 IN PROGRESS  
**Blocker Count:** 0 HIGH, 0 MEDIUM  
**Target Pilot Date:** TBD

---

## 1. Phase 2C Audit Issues Resolution

### HIGH Severity (MUST FIX before pilot)

| ID | Issue | Status | Verification | Owner | Notes |
|----|-------|--------|--------------|-------|-------|
| P2C-001 | Password change without current password verification | ✅ FIXED | Manual test in `/profile` | Frontend | Added current password field + verification |

### MEDIUM Severity (SHOULD FIX before pilot)

| ID | Issue | Status | Verification | Owner | Notes |
|----|-------|--------|--------------|-------|-------|
| P2C-002 | `robots.txt` pattern `/(auth)/` may not work | ✅ FIXED | Check `robots.txt` | DevOps | Changed to `/auth/`, added `/login`, `/profile` |
| P2C-003 | `/profile` page lacks noindex metadata | ✅ FIXED | View page source | Frontend | Added `layout.tsx` with noindex |
| P2C-004 | No automated invitation cleanup | ⚠️ DEFERRED | N/A | DevOps | Manual cleanup via RPC; cron job for Phase 3 |

**Decision:** P2C-004 deferred to Phase 3. Manual cleanup sufficient for pilot.

---

## 2. Authentication System Verification

### Core Auth Flows

| Flow | Status | Test Document | Last Tested | Pass/Fail |
|------|--------|---------------|-------------|-----------|
| Email/Password Login | ✅ | `auth-entitlement-test-plan.md` Test 3 | Pending | [ ] |
| Magic Link Login | ✅ | Test 4 | Pending | [ ] |
| Forgot Password | ✅ | Test 5 | Pending | [ ] |
| Reset Password | ✅ | Test 6 | Pending | [ ] |
| Set Password (Invited) | ✅ | Test 8 | Pending | [ ] |
| Profile Update | ✅ | Test 9 | Pending | [ ] |
| Password Change | ✅ | Test 10 | Pending | [ ] |
| Logout | ✅ | Profile page | Pending | [ ] |

### Auth Infrastructure

| Component | Status | Verification | Notes |
|-----------|--------|--------------|-------|
| Supabase SSR integration | ✅ | Code review | `@supabase/ssr` v0.5.2 |
| Session management | ✅ | Test login flow | Cookie-based |
| Route protection (proxy.ts) | ✅ | Test protected routes | Middleware redirects |
| Auth error handling | ✅ | Test invalid credentials | User-friendly messages |
| Session expiry handling | ⚠️ | Needs testing | Auto-refresh via middleware |

---

## 3. Invitation System Verification

| Component | Status | Verification | Notes |
|-----------|--------|--------------|-------|
| Invitation creation API | ✅ | POST `/api/v1/invitations` | Admin-gated |
| Invitation validation API | ✅ | GET `/api/v1/invitations/validate` | Token-based |
| Token generation | ✅ | Code review | 32-byte cryptographic |
| Token expiration | ✅ | SQL migration | 7-day default |
| Single-use enforcement | ✅ | `accepted_at` timestamp | Trigger-based |
| Profile auto-creation | ✅ | `handle_new_user` trigger | On auth.users insert |
| Subscription auto-creation | ✅ | `process_invitation_on_signup` trigger | Plan assigned |
| Org membership creation | ✅ | Same trigger | Role assigned |
| Invitation cleanup | ⚠️ | Manual RPC | `souvera_cleanup_expired_invitations()` |

**Action Required:** Test full invitation flow (Test 7 in test plan)

---

## 4. Entitlement System Verification

| Component | Status | Verification | Notes |
|-----------|--------|--------------|-------|
| `@souvera/entitlements` package | ✅ | Code review | Server-side only |
| `resolveUserAccess()` | ✅ | Unit test | Fetches from DB |
| `hasEntitlement()` | ✅ | Unit test | Boolean check |
| `getDataView()` | ✅ | Unit test | Returns view name |
| Static plan mappings | ⚠️ | Review | May drift from DB |
| DB plan mappings | ✅ | SQL migration | Source of truth |
| API entitlement filtering | ✅ | Test 11 (country-lite) | Server-side |
| UI gating components | ✅ | `UpgradePrompt.tsx` | Client-side display only |
| Public fallback | ✅ | Test unauthenticated | Default access |

**Action Required:** Run entitlement filtering tests (Test 11)

---

## 5. API Security Verification

| Endpoint | Auth Required | RLS Applied | Rate Limited | Entitlement Gated | Status |
|----------|---------------|-------------|--------------|-------------------|--------|
| `/api/v1/leads` | No (write-only) | Yes | ✅ 5/min per IP | No | ✅ |
| `/api/v1/country-lite` | No (tiered access) | N/A | ⚠️ No | ✅ Server-side | ✅ |
| `/api/v1/invitations` | Yes | Yes | ⚠️ No | ✅ Admin only | ✅ |
| `/api/v1/invitations/validate` | No | N/A | ⚠️ No | No | ✅ |

**Known Limitations:**
- No rate limiting on `/api/v1/country-lite`, `/api/v1/invitations` (acceptable for pilot)
- Consider adding for production

---

## 6. Client/Server Boundary Security

| Check | Status | Verification | Notes |
|-------|--------|--------------|-------|
| No service role key in client code | ✅ | Grep search | Only in API routes |
| Browser client uses anon key | ✅ | Code review | `createClient()` |
| Server client uses server helper | ✅ | Code review | `createServerClient()` |
| Service client for admin ops | ✅ | Code review | `getServiceClient()` |
| No internal errors exposed | ✅ | Test error states | User-friendly messages |
| No PII logged | ⚠️ | Review logs | IP addresses logged for rate limit |

**Action Required:** Document IP logging in privacy policy

---

## 7. SEO & Indexing Compliance

| Item | Status | Verification | Notes |
|------|--------|--------------|-------|
| `robots.txt` updated | ✅ | Check file | Disallows `/auth/`, `/login`, `/profile`, `/terminal` |
| Auth pages noindexed | ✅ | View page source | Layout-level metadata |
| Profile page noindexed | ✅ | View page source | Layout-level metadata |
| Sitemap excludes auth routes | ✅ | Check `/sitemap.xml` | Only public pages |
| Sitemap includes marketing pages | ✅ | Check `/sitemap.xml` | All public pages |
| JSON-LD on key pages | ✅ | View page source | Homepage, contact, etc. |

**Verification:**
```bash
# Check robots.txt
curl https://souvera.vercel.app/robots.txt

# Check sitemap
curl https://souvera.vercel.app/sitemap.xml

# Check auth page source
curl https://souvera.vercel.app/login | grep "robots"
```

---

## 8. Forms & Lead Capture

| Form | Endpoint | Status | Success State | Error State | Rate Limited | Database |
|------|----------|--------|---------------|-------------|--------------|----------|
| Contact | `/api/v1/leads` | ✅ | ✅ | ✅ | ✅ | `lead_submissions` |
| Request Access | `/api/v1/leads` | ✅ | ✅ | ✅ | ✅ | `lead_submissions` |
| Newsletter | `/api/v1/leads` | ✅ | ✅ | ✅ | ✅ | `lead_submissions` |

**Action Required:** Test all forms (Test 12 in test plan)

---

## 9. Environment Configuration

### Required Variables

| Variable | Production | Staging | Development | Documented |
|----------|-----------|---------|-------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SITE_URL` | ✅ | ✅ | ✅ | ✅ |
| `TERMINAL_URL` (optional) | N/A | N/A | N/A | ✅ |

**Documentation:** `docs/operations/env-vars-auth-leads.md`

### Verification Steps

```bash
# Check Vercel environment variables
vercel env ls

# Test local env
npm run dev
curl http://localhost:3000/api/v1/country-lite?iso3=ZMB
```

---

## 10. Database Migrations

| Migration | Applied | Verified | Rollback Plan |
|-----------|---------|----------|---------------|
| `sql-pack-v1.3-leads.sql` | ✅ | ✅ | Drop `lead_submissions` table |
| `sql-pack-v1.4-auth.sql` | ✅ | ⚠️ | Drop invitations, triggers, functions |

**Verification:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('lead_submissions', 'souvera_invitations');

-- Check triggers exist
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_profile_created_process_invite');

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE 'souvera_%';
```

---

## 11. Build & Deployment Verification

| Check | Status | Command | Last Run | Result |
|-------|--------|---------|----------|--------|
| TypeScript compilation | ⚠️ | `npm run build` | Pending | [ ] PASS [ ] FAIL |
| Linting | ⚠️ | `npm run lint` | Pending | [ ] PASS [ ] FAIL |
| Type checking | ⚠️ | `tsc --noEmit` | Pending | [ ] PASS [ ] FAIL |
| Production build size | ⚠️ | Check build output | Pending | ___ MB |
| Vercel deployment | ⚠️ | Push to main | Pending | [ ] PASS [ ] FAIL |

**Action Required:** Run build commands (TODO item)

---

## 12. Manual QA Testing

| Test Suite | Status | Tester | Date | Pass/Fail | Notes |
|------------|--------|--------|------|-----------|-------|
| Public Route Access | ⏳ | | | [ ] | Test 1 |
| Protected Route Redirects | ⏳ | | | [ ] | Test 2 |
| Email/Password Login | ⏳ | | | [ ] | Test 3 |
| Magic Link Login | ⏳ | | | [ ] | Test 4 |
| Forgot Password Flow | ⏳ | | | [ ] | Test 5 |
| Reset Password | ⏳ | | | [ ] | Test 6 |
| Invitation Validation | ⏳ | | | [ ] | Test 7 |
| Set Password (Invited) | ⏳ | | | [ ] | Test 8 |
| Profile Update | ⏳ | | | [ ] | Test 9 |
| Password Change | ⏳ | | | [ ] | Test 10 |
| Country-Lite Entitlement | ⏳ | | | [ ] | Test 11 |
| Lead Capture Forms | ⏳ | | | [ ] | Test 12 |
| SEO & Indexing | ⏳ | | | [ ] | Regression |
| Security Boundary | ⏳ | | | [ ] | Regression |

**Test Plan:** `docs/qa/auth-entitlement-test-plan.md`

---

## 13. Documentation Completeness

| Document | Status | Location | Last Updated |
|----------|--------|----------|--------------|
| Phase 2C Audit Report | ✅ | `docs/audits/phase-2c-auth-entitlement-verification.md` | 2026-04-28 |
| Auth Implementation Plan | ✅ | `docs/architecture/auth-entitlement-implementation-plan.md` | 2026-04-28 |
| QA Test Plan | ✅ | `docs/qa/auth-entitlement-test-plan.md` | 2026-04-28 |
| Environment Variables | ✅ | `docs/operations/env-vars-auth-leads.md` | 2026-04-28 |
| Pre-Pilot Checklist | ✅ | `docs/operations/pre-pilot-readiness-checklist.md` | 2026-04-28 |
| API Documentation | ⚠️ | TBD | Needs creation |
| Invitation Process Guide | ⚠️ | TBD | Needs creation |

**Action Required:** Create API docs and invitation guide for pilot users

---

## 14. Known Issues & Limitations

### Acceptable for Pilot

| Issue | Severity | Impact | Workaround | Target Resolution |
|-------|----------|--------|------------|-------------------|
| No automated invitation cleanup | LOW | Manual cleanup needed | Run RPC monthly | Phase 3 |
| No rate limiting on some APIs | LOW | Risk of abuse | Monitor usage | Phase 3 |
| Static entitlement mappings | LOW | May drift from DB | Runtime fetches DB | Phase 3 |
| Email sending not implemented | MEDIUM | Manual invitation emails | Admin sends manually | Phase 2E or 3 |
| No admin dashboard | MEDIUM | API-based admin ops | Use Postman/curl | Phase 3 |

### Blockers (MUST FIX before pilot)

| Issue | Severity | Status | ETA |
|-------|----------|--------|-----|
| _(none currently)_ | | | |

---

## 15. Pilot Readiness Criteria

### ✅ READY TO PROCEED if:

- [ ] All HIGH severity Phase 2C audit issues resolved
- [ ] All MEDIUM severity Phase 2C audit issues resolved or deferred with approval
- [ ] Build and lint pass successfully
- [ ] All core auth flows tested manually (Tests 1-10)
- [ ] Entitlement filtering tested (Test 11)
- [ ] Forms tested (Test 12)
- [ ] SEO compliance verified
- [ ] Environment variables configured in production
- [ ] Database migrations applied
- [ ] At least 3 successful test user invitations

### 🔴 NOT READY if:

- [ ] Build or lint fails
- [ ] Any auth flow broken
- [ ] Service role key exposed in client code
- [ ] Protected routes accessible without auth
- [ ] Forms not saving to database
- [ ] Auth pages indexed by search engines

---

## 16. Pilot Launch Plan

### Pre-Launch (T-7 days)

- [ ] Complete all manual QA tests
- [ ] Fix any blocking issues found in QA
- [ ] Deploy to production
- [ ] Verify production environment
- [ ] Create 5 test invitations
- [ ] Send invitations to internal team
- [ ] Internal team completes auth flows
- [ ] Document any issues found

### Launch Day (T-0)

- [ ] Create invitations for pilot users
- [ ] Send personalized invitation emails
- [ ] Monitor error logs
- [ ] Monitor Supabase usage
- [ ] Be available for support

### Post-Launch (T+7 days)

- [ ] Collect pilot user feedback
- [ ] Analyze usage patterns
- [ ] Identify bugs or UX issues
- [ ] Plan Phase 2E or Phase 3 priorities

---

## 17. Rollback Plan

### If Critical Issue Found in Pilot

1. **Disable Affected Feature**
   - Update middleware to block route if needed
   - Return maintenance message

2. **Revert Deployment** (if necessary)
   ```bash
   # Via Vercel Dashboard
   1. Go to Deployments
   2. Find last working deployment
   3. Click "..." → "Promote to Production"
   ```

3. **Notify Users**
   - Email pilot users about temporary downtime
   - Provide ETA for fix

4. **Fix in Development**
   - Create hotfix branch
   - Test fix locally
   - Deploy to staging
   - Verify fix
   - Deploy to production

---

## 18. Support & Escalation

### During Pilot

| Issue Type | Contact | Response Time |
|------------|---------|---------------|
| User unable to log in | Engineering Team | < 1 hour |
| Password reset not working | Engineering Team | < 1 hour |
| Form submission failing | Engineering Team | < 2 hours |
| Data not loading | Engineering Team | < 2 hours |
| General question | Product Team | < 24 hours |

### Emergency Contacts

- **Engineering Lead:** [Name/Email]
- **Product Owner:** [Name/Email]
- **DevOps:** [Name/Email]

---

## Sign-Off

### Phase 2D Completion

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering Lead | | | |
| QA Lead | | | |
| Product Owner | | | |

### Pilot Launch Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering Lead | | | |
| Product Owner | | | |
| Executive Sponsor | | | |

---

**Checklist Version:** 1.0  
**Last Updated:** April 28, 2026  
**Next Review:** After pilot launch

---

## Appendix: Quick Command Reference

```bash
# Build & Test
npm run build
npm run lint
npm run typecheck

# Deploy
git push origin main  # Auto-deploys to Vercel

# Database
psql -h db.YOUR_PROJECT.supabase.co -U postgres -d postgres

# Check Production
curl https://souvera.vercel.app/
curl https://souvera.vercel.app/api/v1/country-lite?iso3=ZMB

# Monitor Logs
vercel logs --follow
```

---

**Status Key:**
- ✅ Complete
- ⏳ In Progress
- ⚠️ Needs Attention
- 🔴 Blocker
- 🟡 Deferred
