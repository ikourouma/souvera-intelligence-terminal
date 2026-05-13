# Phase 3A Part 2: Intelligence Map QA Checklist

**Date:** April 28, 2026  
**Feature:** Functional Intelligence Map + Country Drawer  
**Route:** `/intelligence/map`

---

## Prerequisites

- [ ] Supabase seed migration applied: `infra/supabase/sql-pack-v1.5-seed-africa-caribbean.sql`
- [ ] `/api/v1/countries` endpoint functional (Phase 3A Part 1)
- [ ] `/api/v1/country-lite` endpoint functional (Phase 2C)
- [ ] Test users available (see `docs/Souvera Test Users.txt`)

---

## Core Functionality

### Page Load
- [ ] Navigate to `/intelligence/map`
- [ ] Page loads without errors
- [ ] Preview Data Banner visible at top of grid
- [ ] Market Grid displays 74 countries (54 African + 20 Caribbean)
- [ ] Access Tier indicator shows correct tier (e.g., "explorer (Public)")

### Search Functionality
- [ ] Type "Nigeria" → Grid filters to 1 country
- [ ] Type "Caribbean" → Grid shows multiple Caribbean countries
- [ ] Type "ZZZZZ" → "No Countries Found" empty state appears
- [ ] Clear search → All countries return

### Regional Filters
- [ ] Click "Africa" → Grid shows 54 African countries only
- [ ] Click "Caribbean" → Grid shows 20 Caribbean countries only
- [ ] Click "All Regions" → Grid shows all 74 countries
- [ ] Active filter button highlighted in blue

### Country Cards
- [ ] Each card displays: flag, name, ISO3, capital, subregion, GDP, population, signal badge
- [ ] Hover state shows blue border
- [ ] Click card → Country Drawer opens

---

## Country Drawer

### Opening/Closing
- [ ] Click country card → Drawer slides in from right
- [ ] Drawer displays loading spinner initially
- [ ] Drawer transitions to country data
- [ ] Click X button → Drawer closes
- [ ] Click backdrop → Drawer closes

### Data Display (Priority Countries with Seeded Data)
- [ ] Country identity: name, flag, capital, region, subregion
- [ ] Preview Data Banner appears in drawer
- [ ] Key Metrics section: GDP, Growth, Population, Signal Level
- [ ] Investment Profile section: FDI, Inflation (if available)
- [ ] Market Overview section (if narrative available)
- [ ] Key Sectors section (if sectors available)
- [ ] Source/freshness metadata displayed

### Data Display (Non-Priority Countries)
- [ ] Country identity displayed
- [ ] "Data Coming Soon" message with:
  - Globe icon
  - "Data Coming Soon" heading
  - Instructional text

### Entitlement Gating
- [ ] Public user: No thesis section visible
- [ ] Upgrade Prompt banner appears for unavailable content:
  - "Full Market Analysis & Investment Narrative" (if narrative unavailable)
  - Link to `/access`

### Error Handling
- [ ] If API fails: Red error alert appears in drawer
- [ ] Error message displayed
- [ ] Retry button functional

---

## States

### Loading
- [ ] Initial page load: Spinner with "Loading intelligence map..." message
- [ ] Opening drawer: Spinner with "Loading country intelligence..." message
- [ ] No content flash

### Empty
- [ ] If no countries: "No Countries Available" message with Globe icon

### Error
- [ ] If API error: Red alert box with error message and Retry button

---

## Preview Data Labeling

- [ ] Preview Data Banner at top of grid (amber background)
- [ ] Preview Data Banner in country drawer (amber background)
- [ ] Banner message: "Data shown is from curated sources..."
- [ ] Source attribution displayed
- [ ] Freshness timestamp displayed

---

## No Live Data Claims

- [ ] No "real-time" claims on page
- [ ] No "live feeds" claims on page
- [ ] All messaging appropriate for preview/curated data

---

## Marketing Sections

- [ ] "Map Features by Access Tier" section visible
- [ ] "Use Cases" section visible
- [ ] "What the Map Provides" section visible
- [ ] "Enhanced Intelligence Access" section visible with CTAs:
  - [ ] "Request Access" → `/access/request-access`
  - [ ] "Explore Africa Intelligence" → `/intelligence/africa`

---

## SEO & Metadata

- [ ] Page title: "Intelligence Map | Geospatial Market View | Souvera"
- [ ] Meta description present
- [ ] Canonical URL: `https://souvera.vercel.app/intelligence/map`
- [ ] Open Graph tags present

---

## Security & Entitlements

- [ ] No unauthorized fields visible (no thesis for public users)
- [ ] No raw JSON displayed
- [ ] No API keys or sensitive data exposed
- [ ] All data comes from server-side filtered APIs

---

## Responsive Design

- [ ] Desktop (1600px+): 3-column grid
- [ ] Tablet (768px-1599px): 2-column grid
- [ ] Mobile (<768px): 1-column grid
- [ ] Drawer full-width on mobile
- [ ] Search and filters stack vertically on mobile

---

## Browser Testing

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, if available)

---

## Performance

- [ ] Page loads in <3 seconds
- [ ] Country drawer opens instantly
- [ ] Search filters instantly
- [ ] No jank or layout shift

---

## Acceptance Criteria Summary

- [ ] `/intelligence/map` functional and interactive
- [ ] Market grid with search and regional filters
- [ ] Country drawer with entitlement-appropriate data
- [ ] Preview data banners displayed correctly
- [ ] Upgrade prompts for gated content
- [ ] All states handled (loading, empty, error, degraded)
- [ ] No unauthorized fields visible
- [ ] No live data claims
- [ ] Premium dark terminal aesthetic maintained
- [ ] Build passes, no new lint errors
- [ ] No visible 404s

---

## Notes for QA Engineer

1. **Test Users:** Use test credentials from `docs/Souvera Test Users.txt` to test different entitlement tiers.
2. **Supabase Seed:** Ensure seed migration is applied before testing.
3. **Priority Countries with Data:** Nigeria, South Africa, Kenya, Egypt, Ghana, Senegal, Ethiopia, Tanzania, Uganda, Rwanda, Côte d'Ivoire, Angola, Cameroon, Mozambique, Zimbabwe, Zambia, Botswana, Namibia, Tunisia, Morocco (and 20 Caribbean countries).
4. **Non-Priority Countries:** Should show "Data Coming Soon" message.
5. **API Endpoints:** Confirm `/api/v1/countries` and `/api/v1/country-lite` are functional before testing.

---

**QA Status:** ⏳ PENDING MANUAL TESTING  
**Automated Tests:** Not yet implemented (future scope)
