# Phase 3B-1 Regional Pages - Manual QA Checklist

**Date:** April 28, 2026  
**Phase:** 3B-1 Regional Command Pages  
**Pages:** `/intelligence/africa`, `/intelligence/caribbean`  
**Tester:** _____________  
**Date Tested:** _____________

---

## Test Environment

| Setting | Value |
|---------|-------|
| **Base URL** | https://souvera.vercel.app or local dev |
| **Browser** | Chrome / Firefox / Safari / Edge |
| **Test Users** | See `C:\Users\ikour\Projects\souvera\docs\Souvera Test Users.txt` |
| **Credentials** | ⚠️ Never include in this document |

---

## QA Test Matrix

### 1. Africa Page (`/intelligence/africa`) - Public User

| Test | Expected Behavior | Pass/Fail | Notes |
|------|-------------------|-----------|-------|
| Page loads | No errors, no 404s | ☐ | |
| Hero section renders | Title, tagline, regional pulse visible | ☐ | |
| Regional pulse loads | Shows combined GDP, countries, growth markets | ☐ | |
| "Curated Preview Data" label | Visible in hero pulse | ☐ | |
| "Explore Markets" CTA | Scrolls to market grid | ☐ | |
| "Request Full Access" CTA | Links to /access/request-access | ☐ | |
| Subregion Pulse Grid renders | 5 cards: West, East, North, Central, Southern Africa | ☐ | |
| Subregion cards show data | Country count, GDP, avg growth | ☐ | |
| Market Intelligence Grid renders | 54 countries visible | ☐ | |
| Search works | Type "Nigeria" → filters results | ☐ | |
| Region filter works | Click "Africa" → shows only African countries | ☐ | |
| Country card click | Opens CountryDrawer | ☐ | |
| CountryDrawer shows data | Country name, flag, GDP, population | ☐ | |
| CountryDrawer source/freshness | Data sources and timestamps visible | ☐ | |
| CountryDrawer gated content | Upgrade prompt for premium fields | ☐ | |
| Sector Landscape renders | 6 sectors: Fintech, Energy, Critical Minerals, Agriculture, Logistics, Tourism | ☐ | |
| Sector cards have signals | High Growth / Emerging / Stable badges | ☐ | |
| Sector links work | Click Fintech → /sectors/fintech (or Coming Soon) | ☐ | |
| Strategic Context renders | 4 cards: AfCFTA, Demographic Dividend, Digital Leapfrogging, Energy Transition | ☐ | |
| Trust & Source Layer renders | Data sources listed, preview disclaimer visible | ☐ | |
| Source Registry link | Links to /resources/source-registry | ☐ | |
| Access CTA Block renders | Blue background, headline, CTA buttons | ☐ | |
| "Request Access" CTA | Links to /access/request-access | ☐ | |
| "View Plans" CTA | Links to /pricing | ☐ | |
| No "live data" claims | Zero mentions of "live data" or "real-time" | ☐ | |
| No unsupported claims | No "99.%", "40+ analysts", "data nodes" | ☐ | |
| No `href="#"` placeholders | All links go to valid pages | ☐ | |
| Mobile 375px | Responsive layout, no overflow | ☐ | |
| Mobile 768px | Responsive layout, no overflow | ☐ | |
| Desktop 1024px+ | Full layout, no overflow | ☐ | |

---

### 2. Africa Page - Explorer User

| Test | Expected Behavior | Pass/Fail | Notes |
|------|-------------------|-----------|-------|
| Login as Explorer | Successful login | ☐ | |
| Regional pulse shows auth status | "Authenticated" in meta (if visible) | ☐ | |
| CountryDrawer shows Explorer data | Headline macro, sector teasers | ☐ | |
| CountryDrawer gates Professional fields | Upgrade prompt for full macro, FX, signals | ☐ | |
| CountryDrawer gates Business fields | Upgrade prompt for forecasts, trade | ☐ | |
| Access tier correct | API responses show accessTier: "explorer" | ☐ | |

---

### 3. Africa Page - Professional User

| Test | Expected Behavior | Pass/Fail | Notes |
|------|-------------------|-----------|-------|
| Login as Professional | Successful login | ☐ | |
| CountryDrawer shows Professional data | Full macro, FX metrics, signal scores | ☐ | |
| CountryDrawer gates Business fields | Upgrade prompt for forecasts, trade | ☐ | |
| Access tier correct | API responses show accessTier: "professional" | ☐ | |

---

### 4. Africa Page - Business User

| Test | Expected Behavior | Pass/Fail | Notes |
|------|-------------------|-----------|-------|
| Login as Business | Successful login | ☐ | |
| CountryDrawer shows Business data | Forecasts, trade snapshots, reports | ☐ | |
| No upgrade prompts | All entitled data visible | ☐ | |
| Access tier correct | API responses show accessTier: "business" | ☐ | |

---

### 5. Africa Page - Institutional User

| Test | Expected Behavior | Pass/Fail | Notes |
|------|-------------------|-----------|-------|
| Login as Institutional | Successful login | ☐ | |
| CountryDrawer shows Institutional data | Full access including API metadata | ☐ | |
| No upgrade prompts | All entitled data visible | ☐ | |
| Access tier correct | API responses show accessTier: "institutional" | ☐ | |

---

### 6. Caribbean Page (`/intelligence/caribbean`) - Public User

| Test | Expected Behavior | Pass/Fail | Notes |
|------|-------------------|-----------|-------|
| Page loads | No errors, no 404s | ☐ | |
| Hero section renders | Title, tagline, regional pulse visible | ☐ | |
| Regional pulse loads | Shows combined GDP, territories, growth markets | ☐ | |
| "Curated Preview Data" label | Visible in hero pulse | ☐ | |
| "Explore Markets" CTA | Scrolls to market grid | ☐ | |
| "Request Full Access" CTA | Links to /access/request-access | ☐ | |
| Strategic Position Diagram renders | 4 corridor cards visible | ☐ | |
| Corridor cards show descriptions | US-Caribbean, European Tourism, Transatlantic Energy, Africa-Caribbean Diaspora | ☐ | |
| Gateway Advantage section | "2-4h Flight to US East Coast", "US TZ", "$270B" stats | ☐ | |
| Market Intelligence Grid renders | 20 territories visible | ☐ | |
| Search works | Type "Jamaica" → filters results | ☐ | |
| Region filter works | Click "Caribbean" → shows only Caribbean territories | ☐ | |
| Country card click | Opens CountryDrawer | ☐ | |
| Sector Landscape renders | 5 sectors: Tourism, Energy & LNG, Financial Services, BPO & Nearshoring, Trade & Logistics | ☐ | |
| Sector cards have signals | High Growth / Emerging / Stable badges | ☐ | |
| Strategic Context renders | 4 cards: Nearshoring, Energy Transition, CARICOM, Diaspora Economics | ☐ | |
| Trust & Source Layer renders | Caribbean-specific sources: CDB, CARICOM Secretariat | ☐ | |
| Access CTA Block renders | Teal background, headline, CTA buttons | ☐ | |
| No "live data" claims | Zero mentions of "live data" or "real-time" | ☐ | |
| No unsupported claims | No "99.%", "40+ analysts", "data nodes" | ☐ | |
| Mobile 375px | Responsive layout, no overflow | ☐ | |
| Mobile 768px | Responsive layout, no overflow | ☐ | |
| Desktop 1024px+ | Full layout, no overflow | ☐ | |

---

### 7. Caribbean Page - Explorer User

| Test | Expected Behavior | Pass/Fail | Notes |
|------|-------------------|-----------|-------|
| Login as Explorer | Successful login | ☐ | |
| CountryDrawer shows Explorer data | Headline macro, sector teasers | ☐ | |
| CountryDrawer gates Professional fields | Upgrade prompt for full macro, FX, signals | ☐ | |
| Access tier correct | API responses show accessTier: "explorer" | ☐ | |

---

### 8. Caribbean Page - Professional User

| Test | Expected Behavior | Pass/Fail | Notes |
|------|-------------------|-----------|-------|
| Login as Professional | Successful login | ☐ | |
| CountryDrawer shows Professional data | Full macro, FX metrics, signal scores | ☐ | |
| CountryDrawer gates Business fields | Upgrade prompt for forecasts, trade | ☐ | |
| Access tier correct | API responses show accessTier: "professional" | ☐ | |

---

### 9. Caribbean Page - Business User

| Test | Expected Behavior | Pass/Fail | Notes |
|------|-------------------|-----------|-------|
| Login as Business | Successful login | ☐ | |
| CountryDrawer shows Business data | Forecasts, trade snapshots, reports | ☐ | |
| No upgrade prompts | All entitled data visible | ☐ | |
| Access tier correct | API responses show accessTier: "business" | ☐ | |

---

### 10. Caribbean Page - Institutional User

| Test | Expected Behavior | Pass/Fail | Notes |
|------|-------------------|-----------|-------|
| Login as Institutional | Successful login | ☐ | |
| CountryDrawer shows Institutional data | Full access including API metadata | ☐ | |
| No upgrade prompts | All entitled data visible | ☐ | |
| Access tier correct | API responses show accessTier: "institutional" | ☐ | |

---

### 11. Cross-Page Consistency

| Test | Expected Behavior | Pass/Fail | Notes |
|------|-------------------|-----------|-------|
| Hero pulse format identical | Both pages use same RegionalHeroCommand structure | ☐ | |
| Market grid format identical | Both pages use same MarketGrid component | ☐ | |
| Sector cards format identical | Same SectorLandscapeGrid structure | ☐ | |
| Strategic context format identical | Same StrategicContextGrid structure | ☐ | |
| Trust layer format identical | Same TrustSourceLayer structure | ☐ | |
| CTA block format identical | Same AccessCTABlock structure | ☐ | |
| Africa uses blue accent | Hero, cards, borders use blue (#2563EB) | ☐ | |
| Caribbean uses teal accent | Hero, cards, borders use teal (#0D9488) | ☐ | |
| Distinct narratives | Africa: AfCFTA, demographics; Caribbean: Nearshoring, corridors | ☐ | |

---

### 12. Performance & Accessibility

| Test | Expected Behavior | Pass/Fail | Notes |
|------|-------------------|-----------|-------|
| Page load < 3 seconds | Both pages load quickly on 4G | ☐ | |
| No console errors | Clean browser console | ☐ | |
| No console warnings | Clean browser console | ☐ | |
| Images have alt text | All images accessible | ☐ | |
| Keyboard navigation works | Tab through all interactive elements | ☐ | |
| Focus indicators visible | Blue outline on focused elements | ☐ | |
| Headings in correct order | H1 → H2 → H3 hierarchy maintained | ☐ | |
| Color contrast sufficient | WCAG 2.1 AA compliance (4.5:1 minimum) | ☐ | |

---

### 13. Regression Tests

| Test | Expected Behavior | Pass/Fail | Notes |
|------|-------------------|-----------|-------|
| MegaNav still works | Navigation menu functional | ☐ | |
| Footer still works | All footer links functional | ☐ | |
| /intelligence/map unchanged | Map page still functional | ☐ | |
| /intelligence/compare unchanged | Compare page still functional | ☐ | |
| Forms still submit | /access/request-access form works | ☐ | |
| /status page unchanged | Status page still loads | ☐ | |
| SEO metadata preserved | Title, description, canonical tags correct | ☐ | |

---

## Critical Issues Found

_Use this space to document any P0/P1 issues discovered during QA:_

| Issue ID | Page | Severity | Description | Reproducibility |
|----------|------|----------|-------------|-----------------|
| | | | | |
| | | | | |
| | | | | |

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| QA Lead | | | ☐ Pass / ☐ Fail |
| Technical Lead | | | ☐ Approved / ☐ Blocked |
| Product Owner | | | ☐ Approved / ☐ Blocked |

---

## Related Documentation

- [Phase 3B-1 Implementation Summary](/docs/phase3b-1-implementation-summary.md)
- [Regional Command Pages Elevation Plan](/docs/design/regional-command-pages-elevation-plan.md)
- [Tiered Access Test Matrix](/docs/qa/tiered-access-test-matrix.md)
- [Test Users Provisioning Guide](/docs/qa/test-users-provisioning.md)
