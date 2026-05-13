# Souvera Tiered Access QA Test Matrix

> **Owner:** Afronovation, Inc.  
> **Last Updated:** April 2026  
> **Test Type:** Manual QA - Entitlement & Access Control  
> **Classification:** Internal QA

---

## Overview

This document provides a comprehensive test matrix for verifying tier-based access control across the Souvera Intelligence Terminal. It covers public (unauthenticated) access and all four test user tiers.

## Test User Credentials

**Location:** `C:\Users\ikour\Projects\souvera\docs\Souvera Test Users.txt`

**⚠️ Security Notice:**
- Do NOT copy passwords into this document
- Do NOT commit the credential file
- Do NOT include credentials in screenshots
- Do NOT share credentials via email/chat
- Refer to the local file only

---

## Test Environment

| Setting | Value |
|---------|-------|
| **Base URL** | `https://souvera.vercel.app` or local dev |
| **Supabase Project** | Production or staging |
| **Test Data** | Seeded via `sql-pack-v1.5-seed-africa-caribbean.sql` |
| **Priority Countries** | NGA, KEN, GHA, EGY, ZAF, JAM, BRB, TTO |

---

## How to Run This QA Safely

### Before Testing

1. **Access Credentials Securely**
   - Open `C:\Users\ikour\Projects\souvera\docs\Souvera Test Users.txt`
   - Keep the file open in a local text editor (not browser)
   - Copy/paste credentials directly into login form (private browsing)

2. **Use Private Browsing**
   - Chrome: Ctrl+Shift+N (Incognito)
   - Firefox: Ctrl+Shift+P (Private Window)
   - Edge: Ctrl+Shift+N (InPrivate)

3. **Clear State Between Tests**
   - Close private window after each tier test
   - Open new private window for next tier
   - This ensures clean session state

4. **Recording Results**
   - Mark pass/fail in this document
   - Reference issues by GitHub issue number
   - Add notes without including credentials
   - Screenshots should NOT show email/password fields

### After Testing

- Close all private windows
- Do NOT commit credential file
- Report issues via GitHub Issues (no credentials in issue body)

---

## Test Matrix: Public (Unauthenticated)

### A. Auth Behavior

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| Visit /login | Login page loads | ☐ | | | | P1 |
| Visit /register | Register page loads | ☐ | | | | P1 |
| Visit /auth/forgot-password | Reset password page loads | ☐ | | | | P2 |
| Visit /profile without auth | Redirect to /login | ☐ | | | | P0 |
| Visit /terminal without auth | Redirect to /login or access gate | ☐ | | | | P0 |
| Visit /dashboard without auth | Redirect to /login or access gate | ☐ | | | | P0 |

### B. API Access

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| GET /api/v1/countries?region=africa | Returns 200, public-safe fields only | ☐ | Check meta.accessTier = "public" | | | P0 |
| GET /api/v1/countries?region=caribbean | Returns 200, public-safe fields only | ☐ | Check meta.accessTier = "public" | | | P0 |
| GET /api/v1/country-lite?iso3=NGA | Returns 200, public-safe fields only | ☐ | No GDP growth, sector data, or premium fields | | | P0 |
| Response includes meta.authenticated | Should be `false` | ☐ | | | | P1 |
| Response includes meta.previewData | Should be `true` | ☐ | | | | P1 |
| Response includes meta.sources | Should list data sources | ☐ | | | | P2 |

### C. UI Access

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| Visit / (homepage) | Loads without error | ☐ | | | | P0 |
| Visit /intelligence/map | Map page loads | ☐ | | | | P0 |
| Click country card | Drawer opens with public data | ☐ | | | | P0 |
| Preview data banner appears | "Curated Preview Data" visible | ☐ | | | | P1 |
| Source/freshness visible | Data sources listed | ☐ | | | | P1 |
| Premium content gated | Upgrade prompt or locked card visible | ☐ | | | | P0 |
| Click "Upgrade" CTA | Links to /access or /pricing | ☐ | | | | P1 |
| Visit /intelligence/africa | Regional page loads | ☐ | | | | P1 |
| Visit /intelligence/caribbean | Regional page loads | ☐ | | | | P1 |

### D. Expected Data Fields

| Field | Public Access | Pass/Fail | Notes |
|-------|---------------|-----------|-------|
| Country name, ISO codes, capital | ✅ Visible | ☐ | |
| Flag, lat/lng | ✅ Visible | ☐ | |
| GDP (current USD) | ✅ Visible (if public-safe) | ☐ | |
| Population total | ✅ Visible (if public-safe) | ☐ | |
| GDP growth % | ❌ Hidden or locked | ☐ | |
| Sector rationale/analysis | ❌ Gated | ☐ | |
| Investment narrative | ❌ Gated | ☐ | |
| Trade data | ❌ Gated | ☐ | |
| Forecast metrics | ❌ Gated | ☐ | |

### E. Regression Tests

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| Submit /access/request-access form | Form submits successfully | ☐ | | | | P1 |
| Visit /status | Status page loads with manual disclaimer | ☐ | | | | P2 |
| Visit /sitemap.xml | Sitemap loads, no auth routes | ☐ | | | | P1 |
| Visit /robots.txt | Disallow rules include /auth/, /profile | ☐ | | | | P1 |
| Check for `href="#"` | No visible placeholder links | ☐ | | | | P2 |
| Check for "live data" claims | No unsupported live/real-time claims | ☐ | | | | P0 |

---

## Test Matrix: Explorer Tier

**User:** Explorer test user (see credential file)

### A. Auth Behavior

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| Login with valid credentials | Successful login | ☐ | | | | P0 |
| Visit /profile | Profile page loads | ☐ | | | | P0 |
| Profile shows correct tier | Displays "Explorer" or plan name | ☐ | | | | P1 |
| Logout | Logs out successfully | ☐ | | | | P0 |
| Visit /auth/forgot-password | Reset password flow accessible | ☐ | | | | P2 |
| Visit protected route after logout | Redirects to /login | ☐ | | | | P1 |

### B. API Access

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| GET /api/v1/countries?region=africa | Returns 200 with explorer-tier fields | ☐ | Check meta.accessTier = "explorer" | | | P0 |
| GET /api/v1/country-lite?iso3=NGA | Returns 200 with explorer-tier fields | ☐ | Should include headline macro | | | P0 |
| Response includes meta.authenticated | Should be `true` | ☐ | | | | P1 |
| Response excludes professional fields | No full macro, FX metrics, signal scores | ☐ | | | | P0 |
| Response excludes business fields | No forecasts, trade snapshots | ☐ | | | | P0 |
| Response excludes institutional fields | No API metadata, audit logs | ☐ | | | | P0 |

### C. UI Access

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| Visit /intelligence/map | Map loads with explorer data | ☐ | | | | P0 |
| Click country card | Drawer shows explorer-tier data | ☐ | | | | P0 |
| Preview data banner appears | "Curated Preview Data" visible | ☐ | | | | P1 |
| Professional fields gated | Upgrade prompt for Professional tier | ☐ | | | | P0 |
| Business fields gated | Upgrade prompt for Business tier | ☐ | | | | P0 |
| Institutional fields gated | Upgrade prompt for Institutional tier | ☐ | | | | P0 |

### D. Expected Data Fields (Explorer)

| Field | Explorer Access | Pass/Fail | Notes |
|-------|-----------------|-----------|-------|
| Country identity (name, ISO, capital) | ✅ Visible | ☐ | |
| Headline macro (GDP, population) | ✅ Visible | ☐ | |
| Sector teasers | ✅ Visible | ☐ | |
| Compare lite (basic comparison) | ✅ Visible | ☐ | |
| Full macro (detailed indicators) | ❌ Gated (Professional+) | ☐ | |
| FX metrics | ❌ Gated (Professional+) | ☐ | |
| Signal scores | ❌ Gated (Professional+) | ☐ | |
| Forecast metrics | ❌ Gated (Business+) | ☐ | |
| Trade snapshots | ❌ Gated (Business+) | ☐ | |
| Investment narrative (full) | ❌ Gated (Professional+) | ☐ | |

---

## Test Matrix: Professional Tier

**User:** Professional test user (see credential file)

### A. Auth Behavior

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| Login with valid credentials | Successful login | ☐ | | | | P0 |
| Visit /profile | Profile page loads | ☐ | | | | P0 |
| Profile shows correct tier | Displays "Professional" or plan name | ☐ | | | | P1 |
| Logout | Logs out successfully | ☐ | | | | P0 |

### B. API Access

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| GET /api/v1/countries?region=africa | Returns 200 with professional-tier fields | ☐ | Check meta.accessTier = "professional" | | | P0 |
| GET /api/v1/country-lite?iso3=NGA | Returns 200 with professional-tier fields | ☐ | Should include full macro, FX, signals | | | P0 |
| Response includes full_macro | Detailed economic indicators visible | ☐ | | | | P0 |
| Response includes fx_metrics | FX data visible | ☐ | | | | P0 |
| Response includes signal_scores | Signal level, confidence scores | ☐ | | | | P0 |
| Response includes news_signals | News/sentiment data (if available) | ☐ | | | | P1 |
| Response excludes business fields | No forecasts, trade snapshots | ☐ | | | | P0 |
| Response excludes institutional fields | No API metadata, audit logs | ☐ | | | | P0 |

### C. UI Access

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| Visit /intelligence/map | Map loads with professional data | ☐ | | | | P0 |
| Click country card | Drawer shows professional-tier data | ☐ | | | | P0 |
| Full macro section visible | Detailed indicators displayed | ☐ | | | | P0 |
| Signal scores visible | Investment confidence, signal level | ☐ | | | | P0 |
| Business fields gated | Upgrade prompt for Business tier | ☐ | | | | P0 |
| Institutional fields gated | Upgrade prompt for Institutional tier | ☐ | | | | P0 |

### D. Expected Data Fields (Professional)

| Field | Professional Access | Pass/Fail | Notes |
|-------|---------------------|-----------|-------|
| Country identity | ✅ Visible | ☐ | |
| Headline macro | ✅ Visible | ☐ | |
| Full macro (GDP growth, inflation, etc.) | ✅ Visible | ☐ | |
| FX metrics (currency, exchange rates) | ✅ Visible | ☐ | |
| Signal scores (investment confidence) | ✅ Visible | ☐ | |
| News signals (sentiment, media) | ✅ Visible | ☐ | |
| Sector rationale (professional-tier) | ✅ Visible | ☐ | |
| Investment narrative (basic) | ✅ Visible | ☐ | |
| Forecast metrics (3-5 year) | ❌ Gated (Business+) | ☐ | |
| Trade snapshots (import/export) | ❌ Gated (Business+) | ☐ | |
| Compare full (detailed comparison) | ❌ Gated (Business+) | ☐ | |
| Reports download | ❌ Gated (Business+) | ☐ | |

---

## Test Matrix: Business Tier

**User:** Business test user (see credential file)

### A. Auth Behavior

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| Login with valid credentials | Successful login | ☐ | | | | P0 |
| Visit /profile | Profile page loads | ☐ | | | | P0 |
| Profile shows correct tier | Displays "Business" or plan name | ☐ | | | | P1 |
| Logout | Logs out successfully | ☐ | | | | P0 |

### B. API Access

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| GET /api/v1/countries?region=africa | Returns 200 with business-tier fields | ☐ | Check meta.accessTier = "business" | | | P0 |
| GET /api/v1/country-lite?iso3=NGA | Returns 200 with business-tier fields | ☐ | Should include forecasts, trade data | | | P0 |
| Response includes forecast_metrics | 3-5 year forecasts visible | ☐ | | | | P0 |
| Response includes trade_snapshots | Import/export data visible | ☐ | | | | P0 |
| Response includes compare_full | Full comparison capabilities | ☐ | | | | P0 |
| Response includes reports_download | Report access metadata | ☐ | | | | P1 |
| Response excludes institutional-only fields | No API keys, audit logs | ☐ | | | | P0 |

### C. UI Access

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| Visit /intelligence/map | Map loads with business data | ☐ | | | | P0 |
| Click country card | Drawer shows business-tier data | ☐ | | | | P0 |
| Forecast metrics visible | 3-5 year projections displayed | ☐ | | | | P0 |
| Trade data visible | Import/export snapshots | ☐ | | | | P0 |
| Compare functionality enhanced | Full comparison available | ☐ | | | | P1 |
| Download/export hints visible | Report download CTAs (if implemented) | ☐ | | | | P2 |
| Institutional fields gated | Upgrade prompt for Institutional tier | ☐ | | | | P0 |

### D. Expected Data Fields (Business)

| Field | Business Access | Pass/Fail | Notes |
|-------|-----------------|-----------|-------|
| All Professional-tier fields | ✅ Visible | ☐ | |
| Forecast metrics (GDP, inflation, FX) | ✅ Visible | ☐ | |
| Trade snapshots (top exports/imports) | ✅ Visible | ☐ | |
| Compare full (multi-country analysis) | ✅ Visible | ☐ | |
| Reports download (PDF/Excel) | ✅ Visible or Coming Soon | ☐ | |
| Investment thesis (detailed) | ✅ Visible | ☐ | |
| Sector deep-dive (business-grade) | ✅ Visible | ☐ | |
| API access (full data export) | ❌ Gated (Institutional+) | ☐ | |
| Audit logs | ❌ Gated (Institutional+) | ☐ | |

---

## Test Matrix: Institutional Tier

**User:** Institutional test user (see credential file)

### A. Auth Behavior

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| Login with valid credentials | Successful login | ☐ | | | | P0 |
| Visit /profile | Profile page loads | ☐ | | | | P0 |
| Profile shows correct tier | Displays "Institutional" or plan name | ☐ | | | | P1 |
| Logout | Logs out successfully | ☐ | | | | P0 |

### B. API Access

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| GET /api/v1/countries?region=africa | Returns 200 with institutional-tier fields | ☐ | Check meta.accessTier = "institutional" | | | P0 |
| GET /api/v1/country-lite?iso3=NGA | Returns 200 with institutional-tier fields | ☐ | Full access to all entitled data | | | P0 |
| Response includes api_lite metadata | API access hints visible | ☐ | | | | P1 |
| Response includes api_full metadata | Full API export capabilities | ☐ | | | | P1 |
| Response includes audit_logs | Activity/access logs available | ☐ | | | | P2 |
| All business-tier fields included | Forecasts, trade, reports | ☐ | | | | P0 |

### C. UI Access

| Test | Expected Behavior | Pass/Fail | Notes | Evidence | Issue | Priority |
|------|-------------------|-----------|-------|----------|-------|----------|
| Visit /intelligence/map | Map loads with institutional data | ☐ | | | | P0 |
| Click country card | Drawer shows full institutional data | ☐ | | | | P0 |
| All premium fields visible | No upgrade prompts for data access | ☐ | | | | P0 |
| API documentation accessible | Links to API docs (if implemented) | ☐ | | | | P1 |
| Export/download features visible | Full data export capabilities | ☐ | | | | P1 |
| Admin console inaccessible | No platform admin features | ☐ | Must remain gated unless platform_admin | | P0 |

### D. Expected Data Fields (Institutional)

| Field | Institutional Access | Pass/Fail | Notes |
|-------|----------------------|-----------|-------|
| All Business-tier fields | ✅ Visible | ☐ | |
| API lite (basic data export) | ✅ Visible | ☐ | |
| API full (complete data export) | ✅ Visible | ☐ | |
| Audit logs (access history) | ✅ Visible | ☐ | |
| Organization management | ✅ Visible (if org member) | ☐ | |
| Team/seat management | ✅ Visible (if org admin) | ☐ | |
| Platform admin console | ❌ Gated (platform_admin only) | ☐ | |

---

## Regression Tests (All Tiers)

| Test | Expected Behavior | Public | Explorer | Professional | Business | Institutional | Issue | Priority |
|------|-------------------|--------|----------|--------------|----------|---------------|-------|----------|
| Form: /access/request-access | Submits successfully | ☐ | ☐ | ☐ | ☐ | ☐ | | P1 |
| Page: /status | Loads with manual disclaimer | ☐ | ☐ | ☐ | ☐ | ☐ | | P2 |
| Page: /sitemap.xml | Loads, excludes auth routes | ☐ | ☐ | ☐ | ☐ | ☐ | | P1 |
| Page: /robots.txt | Disallows auth/profile | ☐ | ☐ | ☐ | ☐ | ☐ | | P1 |
| Page: /intelligence/africa | Loads without error | ☐ | ☐ | ☐ | ☐ | ☐ | | P0 |
| Page: /intelligence/caribbean | Loads without error | ☐ | ☐ | ☐ | ☐ | ☐ | | P0 |
| Check: No `href="#"` | No placeholder links visible | ☐ | ☐ | ☐ | ☐ | ☐ | | P2 |
| Check: No "live data" claims | No unsupported claims | ☐ | ☐ | ☐ | ☐ | ☐ | | P0 |
| Check: Preview data labels | "Curated Preview Data" visible | ☐ | ☐ | ☐ | ☐ | ☐ | | P1 |
| Check: Source/freshness | Data sources and timestamps | ☐ | ☐ | ☐ | ☐ | ☐ | | P1 |

---

## Priority Legend

| Priority | Description |
|----------|-------------|
| **P0** | Critical - Blocks enterprise pilot or exposes security issue |
| **P1** | High - Core feature or UX issue affecting trust |
| **P2** | Medium - Enhancement or polish issue |
| **P3** | Low - Nice-to-have or cosmetic issue |

---

## Issue Template

When logging issues discovered during QA:

```markdown
**Title:** [Component] Brief description

**Severity:** P0 / P1 / P2 / P3

**User Tier:** Public / Explorer / Professional / Business / Institutional

**Steps to Reproduce:**
1. Login as [tier] user
2. Navigate to [route]
3. Perform [action]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Evidence:**
[Screenshot or error log - NO CREDENTIALS]

**Test Matrix Reference:**
Section [A/B/C/D/E], Row [N]
```

---

## Test Completion Checklist

- [ ] Public tier: All sections A-E tested
- [ ] Explorer tier: All sections A-D tested
- [ ] Professional tier: All sections A-D tested
- [ ] Business tier: All sections A-D tested
- [ ] Institutional tier: All sections A-D tested
- [ ] Regression tests: All tiers tested
- [ ] Issues logged in GitHub
- [ ] Credential file remains secure (not committed)
- [ ] Test results saved to this document
- [ ] Stakeholders notified of critical (P0) issues

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| QA Lead | | | ☐ Pass / ☐ Fail |
| Technical Lead | | | ☐ Approved / ☐ Blocked |
| Product Owner | | | ☐ Approved / ☐ Blocked |

---

## Related Documentation

- [Test Users Provisioning Guide](/docs/qa/test-users-provisioning.md)
- [Auth Entitlement Test Plan](/docs/qa/auth-entitlement-test-plan.md)
- [Phase 3A Implementation Checklist](/docs/execution/phase-3a-implementation-checklist.md)
- [Environment Variables Guide](/docs/operations/env-vars-auth-leads.md)
