# Phase 4A Stage 1: Browser QA Test Plan & Report

**Status:** ⚠️ CRITICAL ISSUE FOUND & FIXED — Requires app restart/redeploy  
**Date Created:** 2026-05-05  
**Date Updated:** 2026-05-05 (Critical fix applied)  
**Owner:** Afronovation, Inc.  
**Test Plan Version:** 1.1

---

## Executive Summary

This document provides a comprehensive browser QA test plan for Phase 4A Stage 1 (7-sector taxonomy expansion for 20 priority countries). The test plan covers:

- Professional+ country card behavior (7 sectors, "+2 more sectors" UX)
- Explorer limited access behavior
- Non-priority country behavior
- Sector page functionality
- Mega menu navigation
- Responsive design across 5 breakpoints
- Language compliance verification

**Scope:** 20 priority countries with 7 sectors each (140 total sector rows)

**Test Environment Requirements:**
- Professional+, Business, or Institutional account access
- Explorer account access
- Modern browser (Chrome, Safari, Firefox, Edge)
- Device/browser dev tools for responsive testing

---

## ⚠️ CRITICAL ISSUE FOUND & FIXED (2026-05-05)

**Issue:** Sector limit hardcoded to 5 in API, causing Tourism & Hospitality to be cut off

**Symptoms Reported:**
- Professional+ users could not see Tourism & Hospitality sector
- Only 5 sectors were returned instead of 7
- "+4 more sectors" control appeared instead of "+2 more sectors"
- Tourism & Hospitality (display_order: 7) was missing from all country panels

**Root Cause:**
The `apps/api-gateway/src/app/api/v1/country-lite/route.ts` API route had a hardcoded sector limit of **5** for Professional+ users (line 96: `const sectorLimit = hasSectorRationale ? 5 : 1;`). When Stage 1 expanded the sector taxonomy from 5 to 7 sectors, the API was not updated to reflect the new model.

**Fix Applied:**
Updated the sector limit from 5 to 7 in the API route:

```typescript
// Before:
const sectorLimit = hasSectorRationale ? 5 : 1;

// After:
const sectorLimit = hasSectorRationale ? 7 : 1;
```

**Files Changed:**
- `apps/api-gateway/src/app/api/v1/country-lite/route.ts` (MODIFIED)

**Status:** ✅ FIXED — Requires app restart/redeploy for fix to take effect

**Impact:** CRITICAL — This was a blocking issue that prevented Professional+ users from seeing all 7 sectors, including the newly added Tourism & Hospitality sector.

**Recommendation:** Restart the development server or redeploy the application, then re-run browser QA to verify the fix.

---

## Routes to Test

### Priority 20 Countries (Africa)
1. Nigeria: `/intelligence/map?region=africa&selected=NGA`
2. South Africa: `/intelligence/map?region=africa&selected=ZAF`
3. Kenya: `/intelligence/map?region=africa&selected=KEN`
4. Egypt: `/intelligence/map?region=africa&selected=EGY`
5. Ghana: `/intelligence/map?region=africa&selected=GHA`
6. Côte d'Ivoire: `/intelligence/map?region=africa&selected=CIV`
7. Ethiopia: `/intelligence/map?region=africa&selected=ETH`
8. Morocco: `/intelligence/map?region=africa&selected=MAR`
9. Tanzania: `/intelligence/map?region=africa&selected=TZA`
10. Uganda: `/intelligence/map?region=africa&selected=UGA`
11. Rwanda: `/intelligence/map?region=africa&selected=RWA`
12. Senegal: `/intelligence/map?region=africa&selected=SEN`
13. Cameroon: `/intelligence/map?region=africa&selected=CMR`

### Priority 20 Countries (Caribbean)
14. Jamaica: `/intelligence/map?region=caribbean&selected=JAM`
15. Trinidad and Tobago: `/intelligence/map?region=caribbean&selected=TTO`
16. Barbados: `/intelligence/map?region=caribbean&selected=BRB`
17. Dominican Republic: `/intelligence/map?region=caribbean&selected=DOM`
18. Bahamas: `/intelligence/map?region=caribbean&selected=BHS`
19. Grenada: `/intelligence/map?region=caribbean&selected=GRD`
20. Saint Lucia: `/intelligence/map?region=caribbean&selected=LCA`

### Sector Pages
- Digital Infrastructure: `/sectors/digital-infrastructure`
- Tourism & Hospitality: `/sectors/tourism-hospitality`

### Non-Priority Countries (Sample)
- Lesotho: `/intelligence/map?region=africa&selected=LSO`
- Other non-priority market as needed

---

## PART 1: Professional+ Country Card Behavior

**Account Required:** Professional+, Business, or Institutional

**Test Coverage:** Sample 7 countries (representative coverage)

### Test Cases

#### Test 1.1: Nigeria (NGA) — Professional+

**Route:** `/intelligence/map?region=africa&selected=NGA`

**Expected Behavior:**
- [ ] Digital Infrastructure appears as the **first sector** (display_order: 1)
- [ ] Top 5 sectors are visible by default (collapsed state)
- [ ] "+2 more sectors" or "View all sectors" card is visible
- [ ] Clicking "+2 more sectors" reveals all 7 sectors
- [ ] Tourism & Hospitality is accessible (display_order: 7)
- [ ] Sector accordion expansion works (click to expand rationale)
- [ ] Only one sector rationale expands at a time (one-at-a-time accordion)
- [ ] CTA remains stable (no bouncing when expanding sectors)
- [ ] Panel does not auto-stretch awkwardly
- [ ] No horizontal overflow in panel
- [ ] FDI metric is visible (if data present)
- [ ] FDI formatted correctly (e.g., "$1.2B", not "$-453157052")
- [ ] Strength and growth scores visible in expanded rationale

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

**Issues Found:**  
_[Describe any issues]_

---

#### Test 1.2: Ghana (GHA) — Professional+

**Route:** `/intelligence/map?region=africa&selected=GHA`

**Expected Behavior:**
- [ ] Same as Test 1.1

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

#### Test 1.3: Egypt (EGY) — Professional+

**Route:** `/intelligence/map?region=africa&selected=EGY`

**Expected Behavior:**
- [ ] Same as Test 1.1

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

#### Test 1.4: Côte d'Ivoire (CIV) — Professional+

**Route:** `/intelligence/map?region=africa&selected=CIV`

**Expected Behavior:**
- [ ] Same as Test 1.1

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

#### Test 1.5: Jamaica (JAM) — Professional+

**Route:** `/intelligence/map?region=caribbean&selected=JAM`

**Expected Behavior:**
- [ ] Same as Test 1.1

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

#### Test 1.6: Dominican Republic (DOM) — Professional+

**Route:** `/intelligence/map?region=caribbean&selected=DOM`

**Expected Behavior:**
- [ ] Same as Test 1.1

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

#### Test 1.7: Barbados (BRB) — Professional+

**Route:** `/intelligence/map?region=caribbean&selected=BRB`

**Expected Behavior:**
- [ ] Same as Test 1.1

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

**PART 1 Summary:**  
_[Overall Professional+ QA results]_

**Pass Rate:** _[X/7 tests passed]_

---

## PART 2: Explorer Behavior

**Account Required:** Explorer (free tier)

**Test Coverage:** Sample 4 countries

### Test Cases

#### Test 2.1: Nigeria (NGA) — Explorer

**Route:** `/intelligence/map?region=africa&selected=NGA`

**Expected Behavior:**
- [ ] Explorer sees **1 sector teaser only** (Digital Infrastructure)
- [ ] No rationale is visible
- [ ] No "+2 more sectors" control is visible
- [ ] "+6 more sectors with Professional access" message is visible
- [ ] FDI remains locked/hidden (or shows upgrade message)
- [ ] CTA remains visible ("Request Access" or "Upgrade")
- [ ] No broken layout
- [ ] No console errors

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

#### Test 2.2: Ghana (GHA) — Explorer

**Route:** `/intelligence/map?region=africa&selected=GHA`

**Expected Behavior:**
- [ ] Same as Test 2.1

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

#### Test 2.3: Jamaica (JAM) — Explorer

**Route:** `/intelligence/map?region=caribbean&selected=JAM`

**Expected Behavior:**
- [ ] Same as Test 2.1

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

#### Test 2.4: Dominican Republic (DOM) — Explorer

**Route:** `/intelligence/map?region=caribbean&selected=DOM`

**Expected Behavior:**
- [ ] Same as Test 2.1

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

**PART 2 Summary:**  
_[Overall Explorer QA results]_

**Pass Rate:** _[X/4 tests passed]_

---

## PART 3: Non-Priority Country Behavior

**Account Required:** Professional+ and Explorer

### Test Cases

#### Test 3.1: Lesotho (LSO) — Professional+

**Route:** `/intelligence/map?region=africa&selected=LSO`

**Expected Behavior:**
- [ ] If sector data exists: sectors display normally
- [ ] If NO sector data: "Sectors data pending" message appears
- [ ] No broken layout
- [ ] Panel remains usable
- [ ] No console errors

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

#### Test 3.2: Lesotho (LSO) — Explorer

**Route:** `/intelligence/map?region=africa&selected=LSO`

**Expected Behavior:**
- [ ] Sector section remains hidden or shows limited teaser
- [ ] No broken layout
- [ ] Explorer CTA remains visible

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

**PART 3 Summary:**  
_[Non-priority country QA results]_

---

## PART 4: Sector Page Functionality

### Test Cases

#### Test 4.1: Digital Infrastructure Page

**Route:** `/sectors/digital-infrastructure`

**Expected Behavior:**
- [ ] Page renders without errors
- [ ] SEO metadata present (check browser tab title, meta description)
- [ ] Hero section renders: "Digital Infrastructure Intelligence"
- [ ] 8 coverage area cards render (Broadband, Cloud, DPI, E-Government, Payments, Digital ID, Cybersecurity, AI Readiness)
- [ ] Primary CTA ("Explore Digital Infrastructure Signals") links to `/intelligence/map`
- [ ] Secondary CTA ("Request Sector Briefing") links to `/access/request-access`
- [ ] Content tone is institutional/investor-facing (not consumer tech blog)
- [ ] No unsupported precise statistics (e.g., "$200B industry")
- [ ] No prohibited language ("live data", "real-time", "AfDEC Intelligence")
- [ ] Icons render correctly (Network, Cloud, Shield, Building2, Zap, Layers, Globe)
- [ ] Highlight metrics render: "50+ Markets Covered", "Fiber Backbone Mapping", "Cloud Readiness Assessment", "IMF Data Sources"

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

**Issues Found:**  
_[Describe any issues]_

---

#### Test 4.2: Tourism & Hospitality Page

**Route:** `/sectors/tourism-hospitality`

**Expected Behavior:**
- [ ] Page renders without errors
- [ ] SEO metadata present (check browser tab title, meta description)
- [ ] Hero section renders: "Tourism & Hospitality Intelligence"
- [ ] 8 coverage area cards render (Visitor Economy, Destination, Hospitality, Aviation, Diaspora, Events, Cultural, Tourism Board)
- [ ] Primary CTA ("Explore Tourism Signals") links to `/intelligence/map`
- [ ] Secondary CTA ("Request Sector Briefing") links to `/access/request-access`
- [ ] Content tone is institutional (not consumer travel brochure)
- [ ] No consumer language ("vacation deals", "book now")
- [ ] No prohibited language
- [ ] Icons render correctly (TrendingUp, MapPin, Building2, Plane, Users, Calendar, Mountain, Globe)
- [ ] Highlight metrics render: "50+ Markets Covered", "Visitor Economy Intelligence", "Aviation Connectivity", "IMF Data Sources"

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

**Issues Found:**  
_[Describe any issues]_

---

**PART 4 Summary:**  
_[Sector page QA results]_

**Pass Rate:** _[X/2 tests passed]_

---

## PART 5: Mega Menu Navigation

### Test Cases

#### Test 5.1: Sectors Mega Menu (Desktop)

**Expected Behavior:**
- [ ] Hover over "Sectors" in top navigation
- [ ] Mega menu opens with 3 subsections visible:
  - **Core Infrastructure:** Sector Overview, **Digital Infrastructure** (new), Fintech & Digital Finance
  - **Industry Sectors:** Mining & Critical Minerals, Energy & Renewables, Agriculture & Agribusiness
  - **Services & Connectivity:** Logistics & Trade, **Tourism & Hospitality** (new)
- [ ] "Digital Infrastructure" link appears under "Core Infrastructure" (first subsection)
- [ ] "Tourism & Hospitality" link appears under "Services & Connectivity" (third subsection)
- [ ] Clicking "Digital Infrastructure" navigates to `/sectors/digital-infrastructure`
- [ ] Clicking "Tourism & Hospitality" navigates to `/sectors/tourism-hospitality`
- [ ] No duplicate labels in navigation
- [ ] All links route correctly (no 404 errors)

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

#### Test 5.2: Mobile Navigation

**Expected Behavior:**
- [ ] Open mobile menu (hamburger icon)
- [ ] Expand "Sectors" accordion
- [ ] 3 subsections visible:
  - Core Infrastructure
  - Industry Sectors
  - Services & Connectivity
- [ ] "Digital Infrastructure" link appears under Core Infrastructure
- [ ] "Tourism & Hospitality" link appears under Services & Connectivity
- [ ] Links route correctly
- [ ] Mobile menu remains usable (no overflow, no layout breaks)

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

**PART 5 Summary:**  
_[Mega menu QA results]_

---

## PART 6: Responsive Design QA

**Test on:** Chrome or Safari Dev Tools (Device Mode)

### Test Cases

#### Test 6.1: Mobile (375px) — iPhone SE

**Viewport:** 375px × 667px

**Expected Behavior:**
- [ ] Country intelligence panel renders correctly
- [ ] No horizontal overflow
- [ ] Sector accordion remains readable
- [ ] "+2 more sectors" control is visible and functional
- [ ] Sector card text is legible
- [ ] CTA buttons remain accessible
- [ ] Sector pages render correctly
- [ ] No layout breaks

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

#### Test 6.2: Mobile (414px) — iPhone 12 Pro

**Viewport:** 414px × 896px

**Expected Behavior:**
- [ ] Same as Test 6.1

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

#### Test 6.3: Tablet (768px) — iPad

**Viewport:** 768px × 1024px

**Expected Behavior:**
- [ ] Country panel layout adapts correctly
- [ ] Sector accordion readable
- [ ] "+2 more sectors" visible
- [ ] No horizontal overflow
- [ ] Sector pages render correctly

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

#### Test 6.4: Desktop (1024px)

**Viewport:** 1024px × 768px

**Expected Behavior:**
- [ ] Full desktop layout renders
- [ ] Mega menu functions correctly
- [ ] Country panel fits properly
- [ ] All 7 sectors accessible

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

#### Test 6.5: Large Desktop (1440px)

**Viewport:** 1440px × 900px

**Expected Behavior:**
- [ ] Optimal desktop experience
- [ ] No layout stretching
- [ ] Proper spacing and alignment

**Actual Result:**  
_[Record observations here]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL / ⚠️ PARTIAL]_

---

**PART 6 Summary:**  
_[Responsive QA results]_

**Pass Rate:** _[X/5 tests passed]_

---

## PART 7: Language Compliance Verification

### Prohibited Language Check

**Verify these terms DO NOT appear:**
- [ ] "Live" (in context of data)
- [ ] "Real-time"
- [ ] "Supabase connected"
- [ ] "AfDEC Intelligence"
- [ ] "AfDEC Priority"

**Approved Language (should appear where relevant):**
- [ ] "Curated Preview Data" (acceptable)
- [ ] "Source-Attributed Preview" (acceptable)
- [ ] "Data pending" (acceptable)

**Check Locations:**
- Country intelligence panels
- Sector pages
- Data metrics
- Banner/footer text

**Actual Findings:**  
_[Record any prohibited language found]_

**Pass/Fail:**  
_[✅ PASS / ✗ FAIL]_

---

## Issues Summary

### Critical Issues (Blocking)

_[List any critical issues that block Stage 2 planning]_

**Example format:**
1. Issue: Sector accordion does not expand on mobile
   - Severity: Critical
   - Location: All country panels, mobile view
   - Impact: Professional+ users cannot access rationale on mobile

---

### Major Issues (Should Fix)

_[List major issues that should be fixed but don't block Stage 2]_

---

### Minor Issues (Nice to Fix)

_[List cosmetic or minor UX issues]_

---

## QA Results Summary

| Test Part | Tests Run | Passed | Failed | Pass Rate |
|-----------|-----------|--------|--------|-----------|
| Part 1: Professional+ | 7 | _[X]_ | _[X]_ | _[X%]_ |
| Part 2: Explorer | 4 | _[X]_ | _[X]_ | _[X%]_ |
| Part 3: Non-Priority | 2 | _[X]_ | _[X]_ | _[X%]_ |
| Part 4: Sector Pages | 2 | _[X]_ | _[X]_ | _[X%]_ |
| Part 5: Mega Menu | 2 | _[X]_ | _[X]_ | _[X%]_ |
| Part 6: Responsive | 5 | _[X]_ | _[X]_ | _[X%]_ |
| Part 7: Language | 1 | _[X]_ | _[X]_ | _[X%]_ |
| **Total** | **23** | **_[X]_** | **_[X]_** | **_[X%]_** |

---

## Required Fixes

### Before Stage 2 Planning

_[List any fixes that must be completed before Stage 2 planning can begin]_

### Can Address Later

_[List fixes that can be addressed in parallel with or after Stage 2]_

---

## Recommendation

**Status:** _[Choose one]_

- [ ] ✅ **APPROVE Stage 2 Planning** — No critical issues found, Stage 2 All-74 expansion can proceed
- [ ] ⚠️ **APPROVE with Minor Fixes** — Stage 2 can proceed in parallel with minor fixes
- [ ] ✗ **DO NOT PROCEED** — Critical issues must be resolved before Stage 2

**Justification:**  
_[Explain the recommendation]_

---

## Next Steps

**If Approved:**
1. Address any minor/major issues identified
2. Begin Stage 2 All-74 expansion planning
3. Generate content for 54 remaining countries × 2 sectors (108 new rows)
4. Create SQL seed files for Stage 2
5. Schedule Stage 2 implementation

**If Not Approved:**
1. Fix critical issues
2. Rerun browser QA
3. Re-evaluate Stage 2 readiness

---

## Execution Notes

**Tester Name:** _[Name]_  
**Test Date:** _[Date]_  
**Browser:** _[Chrome/Safari/Firefox/Edge]_  
**Operating System:** _[macOS/Windows/Linux]_  
**Test Duration:** _[Hours]_  
**Additional Notes:** _[Any observations]_

---

**END OF BROWSER QA TEST PLAN & REPORT**
