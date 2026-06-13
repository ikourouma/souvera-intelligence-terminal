# Sprint 1B Paywall Testing Guide

## Overview

This guide covers testing the paywall implementation across all 6 user personas to verify proper access restrictions and upgrade prompts.

## Test User Credentials

Reference: `docs/qa/test-users-reference.md`

| Persona | Email | Password | Access Tier | Expected Access |
|---------|-------|----------|-------------|-----------------|
| Public | (not logged in) | N/A | `public` | Homepage, landing pages only |
| Explorer | explorer@afronovation.com | PEGWest@1235 | `explorer` | Basic insights, limited data |
| Professional | professional@afronovation.com | PEGWest@1235 | `professional` | Full macro data, 1 report/month |
| Business | business@afronovation.com | PEGWest@1235 | `business` | Trade intelligence, 20 reports/month |
| Investor | investor@afronovation.com | PEGWest@1235 | `investor` | Supply-Demand Matrix, 50 reports/month |
| Institutional | institutional@afronovation.com | PEGWest@1235 | `institutional` | Full access, unlimited reports, exports |

## Test Scenarios

### 1. Trade Intelligence Module Access (Business+ Required)

**Protected Pages:**
- `/intelligence/trade/afcfta/flows` - AfCFTA Import-Export Intelligence
- `/intelligence/trade/cbtpa/flows` - CBTPA Import-Export Intelligence
- `/intelligence/trade/demand` - African Import Demand Intelligence
- `/intelligence/trade/demand-caribbean` - Caribbean Import Demand Intelligence
- `/intelligence/trade/agoa/products` - AGOA Product Finder

**Test Steps:**

#### Public/Explorer/Professional Users (Should See Upgrade Prompt)
1. Log in with each persona
2. Navigate to each protected page
3. **Expected:** Full-screen upgrade card showing:
   - Feature name
   - "Business" tier required
   - Feature description
   - List of Business tier benefits
   - "Upgrade to Business" CTA linking to `/access`

#### Business/Investor/Institutional Users (Should Have Access)
1. Log in with each persona
2. Navigate to each protected page
3. **Expected:** Full access to trade intelligence interface

### 2. API Endpoint Protection

**Protected Endpoints:**
- `GET /api/v1/trade/afcfta/flows`
- `GET /api/v1/trade/cbtpa/flows`
- `GET /api/v1/trade/demand`

**Test Steps:**

#### Using curl or Postman
```bash
# Test without authentication (should fail with 401)
curl http://localhost:3000/api/v1/trade/afcfta/flows

# Test with Explorer session (should fail with 403)
# Use browser dev tools to get session cookie
curl -H "Cookie: your-session-cookie" http://localhost:3000/api/v1/trade/afcfta/flows

# Test with Business+ session (should succeed with 200)
curl -H "Cookie: business-session-cookie" http://localhost:3000/api/v1/trade/afcfta/flows
```

**Expected Results:**
- Public/Unauthenticated: `401 Unauthorized`
- Explorer/Professional: `403 Forbidden` with JSON error message
- Business+: `200 OK` with trade data

### 3. Export/Download Features (Institutional Only)

**Test Steps:**

#### Explorer through Investor (Should Show Lock Icon)
1. Log in with each persona (Explorer → Investor)
2. Navigate to AGOA tracker page or any page with export buttons
3. Locate PNG export button
4. **Expected:**
   - Lock icon instead of Download icon
   - Button text remains but is grayed out
   - Clicking shows upgrade modal for Institutional tier
   - Modal includes "Export & Download" feature description

#### Institutional User (Should Work)
1. Log in with institutional@afronovation.com
2. Navigate to AGOA tracker
3. Click PNG export button
4. **Expected:**
   - Download icon (not lock)
   - Button is active (blue, not gray)
   - Clicking triggers PNG download
   - No upgrade prompt

### 4. Report Generation Quotas

**Test Steps:**

#### Check Quota Status
1. Log in with each persona
2. Navigate to `/intelligence` or country page
3. Click "Generate Report" button
4. **Expected quota limits:**
   - Explorer: 1 report/month
   - Professional: 5 reports/month
   - Business: 20 reports/month
   - Investor: 50 reports/month
   - Institutional: Unlimited

#### Test Quota Enforcement
1. Log in as Explorer
2. Generate 1 country profile report
3. Attempt to generate a 2nd report
4. **Expected:**
   - First report: Success (201 Created)
   - Second report: Quota exceeded error with upgrade prompt
   - Error message shows current usage vs. limit

### 5. AGOA Tracker Freemium Model

The AGOA tracker has a special freemium model where lower tiers see limited data.

**Test Steps:**

#### Explorer/Professional (Limited Data)
1. Log in as Explorer or Professional
2. Navigate to `/intelligence/trade/agoa`
3. **Expected:**
   - Can see basic AGOA status for all countries
   - Some data fields show upgrade prompts
   - Limited legislative event details
   - Upgrade CTA visible in interface

#### Business+ (Full Data)
1. Log in as Business or higher
2. Navigate to `/intelligence/trade/agoa`
3. **Expected:**
   - Full AGOA status for all countries
   - Complete legislative event details
   - All data fields populated
   - No upgrade prompts

## Automated Test Script

### Quick Smoke Test (Visual Verification)

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run through test scenarios
# (Manual testing recommended for first pass)
```

### Checklist for Each Persona

- [ ] **Public**
  - [ ] Cannot access trade intelligence pages
  - [ ] Cannot access API endpoints
  - [ ] Sees upgrade prompts on protected pages
  - [ ] All upgrade CTAs link to `/access`

- [ ] **Explorer**
  - [ ] Cannot access trade intelligence (Business+ required)
  - [ ] Cannot export data (Institutional required)
  - [ ] Can generate 1 report, blocked on 2nd
  - [ ] AGOA tracker shows limited data

- [ ] **Professional**
  - [ ] Cannot access trade intelligence
  - [ ] Cannot export data
  - [ ] Can generate 5 reports/month
  - [ ] Has full macro data access

- [ ] **Business**
  - [ ] ✅ Can access all trade intelligence pages
  - [ ] ✅ API endpoints return full data
  - [ ] Cannot export (Institutional required)
  - [ ] Can generate 20 reports/month

- [ ] **Investor**
  - [ ] ✅ Can access trade intelligence
  - [ ] ✅ Can access Supply-Demand Matrix (when implemented)
  - [ ] Cannot export
  - [ ] Can generate 50 reports/month

- [ ] **Institutional**
  - [ ] ✅ Full access to all features
  - [ ] ✅ Exports work without restrictions
  - [ ] ✅ Unlimited report generation
  - [ ] ✅ API access unrestricted

## Common Issues & Troubleshooting

### Issue: All users can access protected pages
- **Check:** Server-side entitlement function is being called
- **Fix:** Ensure `requireEntitlement()` is awaited in page component

### Issue: Export button doesn't show lock icon
- **Check:** `useEntitlements()` hook is properly initialized
- **Fix:** Verify client component has access to session

### Issue: API returns 500 instead of 403
- **Check:** Server logs for errors
- **Fix:** Ensure Supabase client is properly configured

### Issue: Upgrade modal doesn't close
- **Check:** `onClose` callback is properly wired
- **Fix:** Pass `onClose` prop to `<UpgradePrompt>`

## Success Criteria

Sprint 1B is complete when:

1. ✅ All trade intelligence pages are protected (server-side)
2. ✅ All trade intelligence API endpoints require Business+ tier
3. ✅ Export features show lock icon for non-Institutional users
4. ✅ Export modal displays for non-Institutional users on click
5. ✅ Report quotas are enforced per tier
6. ✅ All 6 personas show correct access levels
7. ✅ Upgrade prompts display tier-appropriate messaging
8. ✅ All CTAs link to `/access` page

## Next Steps After Testing

Once testing is complete:
1. Document any bugs found in GitHub Issues
2. Create PR with Sprint 1B changes
3. Proceed to Phase 2: Admin Dashboard (Sprint 2A)
4. Reference: `docs/execution/UNIFIED-MASTER-IMPLEMENTATION-PLAN.md`

## Testing Log Template

```
Date: _______
Tester: _______
Persona: _______

| Test Scenario | Pass/Fail | Notes |
|---------------|-----------|-------|
| Trade Intelligence Access | | |
| API Endpoint Protection | | |
| Export Feature Lock | | |
| Report Quota | | |
| AGOA Freemium | | |

Overall Result: ☐ PASS  ☐ FAIL
Issues Found: _______
```
