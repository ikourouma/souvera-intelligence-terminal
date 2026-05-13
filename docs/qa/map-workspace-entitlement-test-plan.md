# Map Workspace Entitlement Test Plan
**Document Type:** QA Test Plan  
**Version:** 1.0  
**Date:** April 29, 2026  
**Owner:** QA Team  
**Related:** `docs/design/souvera-map-workspace-enhancement-plan.md`

---

## 1. Overview

This document defines the comprehensive QA test plan for the Souvera Map Workspace enhancement. Tests cover entitlement-based access control, UI behavior, map interactions, panel content, responsive layouts, and language compliance.

### Test Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Local | `http://localhost:3000` | Development testing |
| Preview | `https://souvera-preview.vercel.app` | Staging verification |
| Production | `https://souvera.vercel.app` | Production validation |

### Test Users

Reference: `docs/Souvera Test Users.txt` and `docs/qa/test-users-provisioning.md`

| Tier | Test User | Password |
|------|-----------|----------|
| Public | (unauthenticated) | N/A |
| Explorer | `explorer@souvera-test.com` | `SouveraTest2026!` |
| Professional | `professional@souvera-test.com` | `SouveraTest2026!` |
| Business | `business@souvera-test.com` | `SouveraTest2026!` |
| Institutional | `institutional@souvera-test.com` | `SouveraTest2026!` |

---

## 2. Entitlement Test Matrix

### 2.1 Metric Visibility Tests

| Test ID | Tier | Metric | Expected Result | Status |
|---------|------|--------|-----------------|--------|
| ENT-001 | Public | GDP | Visible with value | ☐ |
| ENT-002 | Public | GDP Growth | Visible with value | ☐ |
| ENT-003 | Public | Population | Visible with value | ☐ |
| ENT-004 | Public | FDI | **Locked** with "Professional+" badge | ☐ |
| ENT-005 | Explorer | GDP | Visible with value | ☐ |
| ENT-006 | Explorer | GDP Growth | Visible with value | ☐ |
| ENT-007 | Explorer | Population | Visible with value | ☐ |
| ENT-008 | Explorer | FDI | **Locked** with "Professional+" badge | ☐ |
| ENT-009 | Professional | GDP | Visible with value | ☐ |
| ENT-010 | Professional | GDP Growth | Visible with value | ☐ |
| ENT-011 | Professional | Population | Visible with value | ☐ |
| ENT-012 | Professional | FDI | **Visible** with value | ☐ |
| ENT-013 | Business | FDI | Visible with value | ☐ |
| ENT-014 | Institutional | FDI | Visible with value | ☐ |

### 2.2 FDI Locked State Tests

| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| FDI-001 | FDI card shows locked visual state for Public | Blurred value, lock icon visible | ☐ |
| FDI-002 | FDI card shows "Professional+" upgrade badge | Badge text reads "Professional+" | ☐ |
| FDI-003 | FDI card hover shows upgrade prompt | Tooltip or hover state indicates upgrade | ☐ |
| FDI-004 | FDI value is NOT present in DOM for Public | Inspect element confirms no value | ☐ |
| FDI-005 | FDI value is NOT present in DOM for Explorer | Inspect element confirms no value | ☐ |
| FDI-006 | FDI value IS present in DOM for Professional | Actual dollar value visible | ☐ |

### 2.3 Sector Count Tests

| Test ID | Tier | Expected Sectors | Expected Result | Status |
|---------|------|------------------|-----------------|--------|
| SEC-001 | Public | 1 | Only 1 sector displayed | ☐ |
| SEC-002 | Public | 1 | "+X more sectors" message shown | ☐ |
| SEC-003 | Explorer | 1 | Only 1 sector displayed | ☐ |
| SEC-004 | Explorer | 1 | Upgrade hint visible | ☐ |
| SEC-005 | Professional | Up to 5 | Up to 5 sectors displayed | ☐ |
| SEC-006 | Professional | Up to 5 | No upgrade hint | ☐ |
| SEC-007 | Business | Up to 5 | Up to 5 sectors displayed | ☐ |
| SEC-008 | Institutional | Up to 5 | Up to 5 sectors displayed | ☐ |

### 2.4 Narrative Content Tests

| Test ID | Tier | Content | Expected Result | Status |
|---------|------|---------|-----------------|--------|
| NAR-001 | Public | Country Insight | Teaser/brief version visible | ☐ |
| NAR-002 | Public | Souvera Intelligence | NOT visible | ☐ |
| NAR-003 | Explorer | Country Insight | Teaser/brief version visible | ☐ |
| NAR-004 | Explorer | Souvera Intelligence | NOT visible | ☐ |
| NAR-005 | Professional | Country Insight | Full version visible | ☐ |
| NAR-006 | Professional | Souvera Intelligence | Visible | ☐ |
| NAR-007 | Business | Souvera Intelligence | Visible | ☐ |
| NAR-008 | Institutional | Souvera Intelligence | Visible | ☐ |

---

## 3. Map Interaction Tests

### 3.1 Country Selection Tests

| Test ID | Action | Expected Result | Status |
|---------|--------|-----------------|--------|
| MAP-001 | Click on Nigeria (in mandate) | Panel updates with Nigeria intelligence | ☐ |
| MAP-002 | Click on Ghana (in mandate) | Panel updates with Ghana intelligence | ☐ |
| MAP-003 | Click on Jamaica (Caribbean, in mandate) | Panel updates (if on Caribbean shell) | ☐ |
| MAP-004 | Click on USA (out of mandate) | No selection, country remains muted | ☐ |
| MAP-005 | Click on France (out of mandate) | No selection, country remains muted | ☐ |
| MAP-006 | Click on selected country again | No change, country remains selected | ☐ |
| MAP-007 | Click different country | Selection changes, panel updates | ☐ |

### 3.2 Country Hover Tests

| Test ID | Action | Expected Result | Status |
|---------|--------|-----------------|--------|
| HOV-001 | Hover over Nigeria | Tooltip appears with name, GDP, growth | ☐ |
| HOV-002 | Hover over out-of-scope country | Tooltip shows "Outside Souvera coverage" | ☐ |
| HOV-003 | Hover over country with no data | Tooltip shows "Data coming soon" | ☐ |
| HOV-004 | Move mouse away | Tooltip disappears | ☐ |
| HOV-005 | Hover shows flag image | Country flag visible in tooltip | ☐ |
| HOV-006 | Hover shows region | Region label visible (e.g., "West Africa") | ☐ |

### 3.3 Selected Country State Tests

| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| SEL-001 | Selected country visual | Glow border and brighter fill | ☐ |
| SEL-002 | Selected country cursor | Pointer cursor | ☐ |
| SEL-003 | Selected country tooltip | No tooltip (panel is visible) | ☐ |
| SEL-004 | Panel header matches selection | Country name in panel matches selected | ☐ |

### 3.4 Disabled/Out-of-Scope Country Tests

| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| DIS-001 | Out-of-scope country color | Gray/muted, ~40% opacity | ☐ |
| DIS-002 | Out-of-scope country cursor | cursor: not-allowed | ☐ |
| DIS-003 | Out-of-scope country click | No action, no panel update | ☐ |
| DIS-004 | Out-of-scope country tooltip | "Outside Souvera coverage" | ☐ |
| DIS-005 | Disabled country appearance | Does NOT look broken, looks intentional | ☐ |

### 3.5 Map Controls Tests

| Test ID | Action | Expected Result | Status |
|---------|--------|-----------------|--------|
| CTL-001 | Mouse wheel zoom in | Map zooms in smoothly | ☐ |
| CTL-002 | Mouse wheel zoom out | Map zooms out smoothly | ☐ |
| CTL-003 | Click and drag pan | Map pans in drag direction | ☐ |
| CTL-004 | Reset button | Map returns to default view | ☐ |
| CTL-005 | Zoom buttons (+/-) | Map zooms appropriately | ☐ |

---

## 4. Country Intelligence Panel Tests

### 4.1 Panel Content Tests

| Test ID | Element | Expected Result | Status |
|---------|---------|-----------------|--------|
| PNL-001 | Flag image | Country flag displays correctly | ☐ |
| PNL-002 | Country name | Correct country name displayed | ☐ |
| PNL-003 | Capital city | Capital displayed (e.g., "Abuja") | ☐ |
| PNL-004 | Region | Region displayed (e.g., "West Africa") | ☐ |
| PNL-005 | Subregion | Subregion displayed if available | ☐ |
| PNL-006 | Source/freshness line | Shows "Data: 2026 · World Bank, IMF" | ☐ |
| PNL-007 | Preview data label | Shows "Curated Preview Data" | ☐ |
| PNL-008 | Country insight | Brief strategic summary visible | ☐ |
| PNL-009 | Metrics grid | 2x2 grid with GDP, Growth, Pop, FDI | ☐ |
| PNL-010 | Sectors list | Key sectors listed | ☐ |
| PNL-011 | CTA button | "Explore [Country] Opportunities" | ☐ |

### 4.2 Panel Empty State Tests

| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| EMP-001 | No country selected | "Top 10 Economies" list or overview | ☐ |
| EMP-002 | Loading state | Loading spinner/skeleton | ☐ |
| EMP-003 | Country with no data | "Data coming soon" message | ☐ |
| EMP-004 | API error | Error message with retry option | ☐ |

---

## 5. CTA Routing Tests

### 5.1 CTA Button Tests

| Test ID | Tier | Action | Expected Result | Status |
|---------|------|--------|-----------------|--------|
| CTA-001 | Public | Click CTA for Nigeria | Route to `/access/request-access?country=NGA&name=Nigeria&source=map-workspace` | ☐ |
| CTA-002 | Explorer | Click CTA for Ghana | Route to `/access/request-access?country=GHA&name=Ghana&source=map-workspace` | ☐ |
| CTA-003 | Professional | Click CTA | Route to `/access/request-access` with params | ☐ |
| CTA-004 | All tiers | CTA button text | "Explore [Country] Opportunities" | ☐ |
| CTA-005 | All tiers | Query params present | country, name, source params in URL | ☐ |

### 5.2 CTA URL Validation

| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| URL-001 | country param | ISO3 code (e.g., `GIN`) | ☐ |
| URL-002 | name param | Country name (e.g., `Guinea`) | ☐ |
| URL-003 | source param | `map-workspace` | ☐ |
| URL-004 | Destination page loads | `/access/request-access` page renders | ☐ |
| URL-005 | No 404 error | Route exists and is accessible | ☐ |

---

## 6. Source/Freshness Display Tests

| Test ID | Element | Expected Result | Status |
|---------|---------|-----------------|--------|
| SRC-001 | Source line visible | "Data: 2026 · World Bank, IMF" or similar | ☐ |
| SRC-002 | Preview label visible | "Curated Preview Data" | ☐ |
| SRC-003 | No "Live" text | Text does NOT contain "Live" | ☐ |
| SRC-004 | No "Supabase" text | Text does NOT contain "Supabase" | ☐ |
| SRC-005 | Freshness timestamp | If shown, uses readable date format | ☐ |

---

## 7. Language & Branding Compliance Tests

### 7.1 Approved Language Tests

| Test ID | Location | Check | Expected Result | Status |
|---------|----------|-------|-----------------|--------|
| LNG-001 | Top nav status | Text content | "Curated Preview Data" | ☐ |
| LNG-002 | Panel source line | Text content | Source attribution present | ☐ |
| LNG-003 | Panel narrative | Section header | "Souvera Intelligence" | ☐ |
| LNG-004 | CTA button | Button text | "Explore [Country] Opportunities" | ☐ |

### 7.2 Prohibited Language Tests

| Test ID | Check | Expected Result | Status |
|---------|-------|-----------------|--------|
| PRO-001 | Search entire page for "Live" | NOT found (except legitimate uses) | ☐ |
| PRO-002 | Search for "Live · Supabase" | NOT found | ☐ |
| PRO-003 | Search for "Supabase connected" | NOT found | ☐ |
| PRO-004 | Search for "AfDEC Priority" | NOT found | ☐ |
| PRO-005 | Search for "AfDEC Intelligence" | NOT found | ☐ |
| PRO-006 | Search for "real-time" | NOT found | ☐ |
| PRO-007 | Check for accuracy claims | No unsupported claims | ☐ |

### 7.3 Branding Compliance Tests

| Test ID | Check | Expected Result | Status |
|---------|-------|-----------------|--------|
| BRD-001 | Logo | Souvera logo only | ☐ |
| BRD-002 | Color scheme | Souvera brand colors | ☐ |
| BRD-003 | No AfDEC badges | No AfDEC visual elements | ☐ |
| BRD-004 | Typography | Souvera font stack (Space Grotesk) | ☐ |

---

## 8. Responsive Layout Tests

### 8.1 Desktop Layout Tests (≥1280px)

| Test ID | Check | Expected Result | Status |
|---------|-------|-----------------|--------|
| DSK-001 | Layout type | Side-by-side (map + panel) | ☐ |
| DSK-002 | Map width | 65-70% of container | ☐ |
| DSK-003 | Panel width | 30-35% of container | ☐ |
| DSK-004 | Map height | Equal to panel height | ☐ |
| DSK-005 | Map min-height | At least 700px | ☐ |
| DSK-006 | Top nav | Full workspace header visible | ☐ |
| DSK-007 | Legend | Regional legend visible | ☐ |
| DSK-008 | Hover tooltips | Functional on mouse hover | ☐ |

### 8.2 Tablet Layout Tests (768px - 1279px)

| Test ID | Check | Expected Result | Status |
|---------|-------|-----------------|--------|
| TAB-001 | Layout type | Side-by-side (narrower) | ☐ |
| TAB-002 | Map width | ~60% of container | ☐ |
| TAB-003 | Panel width | ~40% of container | ☐ |
| TAB-004 | Map min-height | At least 500px | ☐ |
| TAB-005 | Panel scrolls | Panel has independent scroll | ☐ |
| TAB-006 | Top nav | Simplified header | ☐ |
| TAB-007 | No horizontal overflow | Content fits viewport | ☐ |

### 8.3 Mobile Layout Tests (<768px)

| Test ID | Check | Expected Result | Status |
|---------|-------|-----------------|--------|
| MOB-001 | Layout type | Stacked (map above panel) | ☐ |
| MOB-002 | Map width | 100% of viewport | ☐ |
| MOB-003 | Map height | 350-400px | ☐ |
| MOB-004 | Panel width | 100% of viewport | ☐ |
| MOB-005 | Panel scroll | Full vertical scroll | ☐ |
| MOB-006 | Top nav | Compact header | ☐ |
| MOB-007 | No horizontal overflow | No horizontal scrollbar | ☐ |
| MOB-008 | Tap interaction | Tap to select (no hover) | ☐ |
| MOB-009 | Pinch zoom | Pinch gesture works on map | ☐ |
| MOB-010 | Legend collapse | Legend collapsible or hidden | ☐ |

---

## 9. Page-Specific Tests

### 9.1 `/intelligence/map` Tests

| Test ID | Check | Expected Result | Status |
|---------|-------|-----------------|--------|
| IMAP-001 | Page loads | Workspace renders without error | ☐ |
| IMAP-002 | Default region | Shows all Souvera markets (Africa + Caribbean) | ☐ |
| IMAP-003 | Top nav breadcrumb | "Intelligence / Map" | ☐ |
| IMAP-004 | Africa map visible | SVG Africa map renders | ☐ |
| IMAP-005 | 54 African countries | All African countries present | ☐ |
| IMAP-006 | 20 Caribbean territories | Caribbean shown (shell or list) | ☐ |

### 9.2 `/intelligence/africa` Tests

| Test ID | Check | Expected Result | Status |
|---------|-------|-----------------|--------|
| IAFR-001 | Page loads | Page renders without error | ☐ |
| IAFR-002 | Workspace section | Map workspace visible | ☐ |
| IAFR-003 | Regional filtering | Only Africa countries shown | ☐ |
| IAFR-004 | Top nav breadcrumb | "Intelligence / Africa" | ☐ |
| IAFR-005 | Other sections | EconomicCorridors, Sectors, etc. present | ☐ |
| IAFR-006 | No Caribbean | Caribbean countries NOT shown on map | ☐ |

### 9.3 `/intelligence/caribbean` Tests

| Test ID | Check | Expected Result | Status |
|---------|-------|-----------------|--------|
| ICAR-001 | Page loads | Page renders without error | ☐ |
| ICAR-002 | Market shell visible | Caribbean Market Shell renders | ☐ |
| ICAR-003 | 20 territories | All 20 Caribbean markets present | ☐ |
| ICAR-004 | Panel works | Clicking territory updates panel | ☐ |
| ICAR-005 | No Africa | African countries NOT shown | ☐ |
| ICAR-006 | No broken map | Shell doesn't look like failed map | ☐ |

---

## 10. API Response Tests

### 10.1 `/api/v1/countries` Tests

| Test ID | Check | Expected Result | Status |
|---------|-------|-----------------|--------|
| API-001 | Response status | 200 OK | ☐ |
| API-002 | countries array | Array of country objects | ☐ |
| API-003 | gdpCurrentUsd | Present in response | ☐ |
| API-004 | gdpGrowthPct | **Present in response** (new field) | ☐ |
| API-005 | populationTotal | Present in response | ☐ |
| API-006 | isAfricanCountry | Present for filtering | ☐ |
| API-007 | meta.previewData | `true` | ☐ |
| API-008 | meta.sources | Array with World Bank, IMF | ☐ |

### 10.2 `/api/v1/country-lite` Tests

| Test ID | Tier | Check | Expected Result | Status |
|---------|------|-------|-----------------|--------|
| API-101 | Public | FDI in response | NOT present | ☐ |
| API-102 | Explorer | FDI in response | NOT present | ☐ |
| API-103 | Professional | FDI in response | Present with value | ☐ |
| API-104 | Public | sectors count | 1 sector | ☐ |
| API-105 | Explorer | sectors count | 1 sector | ☐ |
| API-106 | Professional | sectors count | Up to 5 sectors | ☐ |
| API-107 | All | meta.previewData | `true` | ☐ |
| API-108 | All | freshness.updatedAt | Timestamp present | ☐ |

---

## 11. Error Handling Tests

| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| ERR-001 | API timeout on countries | Error state with retry button | ☐ |
| ERR-002 | API timeout on country-lite | Panel shows error with retry | ☐ |
| ERR-003 | GeoJSON CDN unavailable | Fallback URL used or graceful error | ☐ |
| ERR-004 | Invalid country ISO3 | 404 handled gracefully | ☐ |
| ERR-005 | Network offline | Appropriate offline message | ☐ |

---

## 12. Performance Tests

| Test ID | Metric | Target | Status |
|---------|--------|--------|--------|
| PERF-001 | Map initial render | < 3 seconds on 4G | ☐ |
| PERF-002 | Panel update on selection | < 500ms | ☐ |
| PERF-003 | Tooltip appearance | < 100ms on hover | ☐ |
| PERF-004 | No layout shift | CLS < 0.1 | ☐ |
| PERF-005 | Bundle size increase | < 50KB gzipped | ☐ |

---

## 13. Accessibility Tests

| Test ID | Check | Expected Result | Status |
|---------|-------|-----------------|--------|
| A11Y-001 | Keyboard navigation | Tab through map countries | ☐ |
| A11Y-002 | Focus indicators | Visible focus ring on interactive elements | ☐ |
| A11Y-003 | Screen reader | Country names announced | ☐ |
| A11Y-004 | Color contrast | WCAG AA compliance | ☐ |
| A11Y-005 | Alt text | Flag images have alt text | ☐ |
| A11Y-006 | ARIA labels | Map regions have ARIA labels | ☐ |

---

## 14. Test Execution Checklist

### Pre-Test Setup

- [ ] Clear browser cache
- [ ] Log out of all accounts
- [ ] Set browser to appropriate viewport size
- [ ] Open browser dev tools for API inspection
- [ ] Have test user credentials ready

### Test Execution Order

1. **Public user tests** (unauthenticated)
2. **Explorer tier tests**
3. **Professional tier tests**
4. **Business tier tests**
5. **Institutional tier tests**
6. **Responsive tests** (desktop → tablet → mobile)
7. **Language compliance tests**
8. **API response tests**
9. **Error handling tests**
10. **Performance tests**
11. **Accessibility tests**

### Post-Test Actions

- [ ] Document all failures with screenshots
- [ ] Create bug tickets for failures
- [ ] Retest after fixes
- [ ] Sign off on test completion

---

## 15. Test Sign-Off

| Phase | Tester | Date | Result |
|-------|--------|------|--------|
| Phase 1 (`/intelligence/map`) | | | ☐ Pass / ☐ Fail |
| Phase 2 (`/intelligence/africa`) | | | ☐ Pass / ☐ Fail |
| Phase 3A (`/intelligence/caribbean`) | | | ☐ Pass / ☐ Fail |
| Phase 4 (Polish) | | | ☐ Pass / ☐ Fail |

---

## 16. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | April 29, 2026 | QA Team | Initial test plan |

---

**Document Status:** Ready for Test Execution  
**Test Environment:** Begin with local development, promote to preview
