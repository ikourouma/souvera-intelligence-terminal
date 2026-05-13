# Phase 3 — Browser QA Verification Guide

**Date:** 2026-05-04  
**Status:** ⏳ AWAITING EXECUTION  
**Purpose:** Final verification before Phase 3 closure

---

## Prerequisites

1. Start dev server:
   ```bash
   cd C:\Users\ikour\Projects\souvera
   npm run dev
   ```

2. Wait for server to start (typically `http://localhost:3010`)

3. Open browser (Chrome/Edge recommended for dev tools)

---

## PART 1: API Verification

### Test 1: Africa Endpoint

**URL:** `http://localhost:3010/api/v1/countries?region=africa`

**Expected Results:**
- `meta.count`: **54**
- `countries.length`: **54**
- No Western Sahara (ESH)
- Only approved African ISO3s
- All countries have `isAfricanCountry: true` or are in `APPROVED_AFRICA_ISO3`

**Verification Commands:**
```javascript
// In browser console after loading the endpoint:
const data = await fetch('/api/v1/countries?region=africa').then(r => r.json());
console.log('Count:', data.meta.count);
console.log('Actual:', data.countries.length);
console.log('ISO3s:', data.countries.map(c => c.iso3).sort());
```

**Pass Criteria:**
- [ ] Count equals 54
- [ ] No duplicate ISO3s
- [ ] No ESH present
- [ ] No non-African countries

---

### Test 2: Caribbean Endpoint

**URL:** `http://localhost:3010/api/v1/countries?region=caribbean`

**Expected Results:**
- `meta.count`: **20**
- `countries.length`: **20**
- Only approved Caribbean ISO3s from `APPROVED_CARIBBEAN_ISO3`

**Verification Commands:**
```javascript
const data = await fetch('/api/v1/countries?region=caribbean').then(r => r.json());
console.log('Count:', data.meta.count);
console.log('Actual:', data.countries.length);
console.log('ISO3s:', data.countries.map(c => c.iso3).sort());
```

**Expected ISO3s:**
ATG, BHS, BRB, BLZ, CUB, CYM, DMA, DOM, GRD, GUY, HTI, JAM, KNA, LCA, PRI, SUR, TCA, TTO, VCT, VGB

**Pass Criteria:**
- [ ] Count equals 20
- [ ] No duplicate ISO3s
- [ ] All ISO3s in approved Caribbean list

---

### Test 3: All Regions Endpoint

**URL:** `http://localhost:3010/api/v1/countries?region=all`

**Expected Results:**
- `meta.count`: **74**
- `countries.length`: **74**
- Africa (54) + Caribbean (20)
- No duplicates
- No out-of-scope markets

**Verification Commands:**
```javascript
const data = await fetch('/api/v1/countries?region=all').then(r => r.json());
console.log('Count:', data.meta.count);
console.log('Actual:', data.countries.length);

// Check for duplicates
const iso3s = data.countries.map(c => c.iso3);
const duplicates = iso3s.filter((item, index) => iso3s.indexOf(item) !== index);
console.log('Duplicates:', duplicates.length === 0 ? 'None' : duplicates);

// Split by region
const africa = data.countries.filter(c => c.isAfricanCountry);
const caribbean = data.countries.filter(c => !c.isAfricanCountry);
console.log('Africa count:', africa.length);
console.log('Caribbean count:', caribbean.length);
```

**Pass Criteria:**
- [ ] Count equals 74
- [ ] No duplicate ISO3s
- [ ] Africa subset = 54
- [ ] Caribbean subset = 20

---

## PART 2: UI Route Verification

### Test 4: Africa Map

**URL:** `http://localhost:3010/intelligence/map?region=africa`

**Visual Checks:**
- [ ] Hero title: "Africa Intelligence Terminal"
- [ ] Hero subtitle mentions "54 African markets"
- [ ] Africa map SVG renders
- [ ] Footer shows: `Markets: 54`
- [ ] Footer shows: `Access: public (Public)` or your tier
- [ ] "Curated Preview Data" label visible

**Right Panel (Default State):**
- [ ] Title: "Top 10 Economies"
- [ ] Subtitle: "Largest African economies by GDP · Curated Preview Data"
- [ ] 10 economy rows visible
- [ ] Row 10 (e.g., Angola) is **fully visible** (not clipped)
- [ ] Rows have: rank badge, region dot, country name, GDP, growth
- [ ] "Request Full Access" CTA anchored at bottom
- [ ] CTA does not overlap any economy rows
- [ ] List scrolls independently if you resize browser height

**Right Panel (Selected State):**
- [ ] Click any country on map
- [ ] Country panel opens with flag, metrics, sectors
- [ ] Close button (X) works
- [ ] Panel returns to Top 10 Economies

**Pass Criteria:**
- [ ] All visual elements correct
- [ ] Market count = 54
- [ ] Panel layout correct (no clipping)

---

### Test 5: Caribbean Map

**URL:** `http://localhost:3010/intelligence/map?region=caribbean`

**Visual Checks:**
- [ ] Hero title: "Caribbean Intelligence Terminal"
- [ ] Hero subtitle mentions "20 Caribbean territories"
- [ ] Footer shows: `Markets: 20`

**Left Panel (Caribbean Market Shell):**
- [ ] Search bar: "Search Caribbean markets..."
- [ ] Result count: "Showing 20 of 20 markets"
- [ ] 20 market cards render in grid
- [ ] Flags render as **images** (not raw URLs)
- [ ] Each card shows: flag, country name, ISO3, capital, GDP, growth, pop
- [ ] Cards scroll internally (lower cards like Grenada, Dominica accessible)
- [ ] Search works (e.g., type "Jamaica", filters to 1 result)
- [ ] Clear search (X) button works

**Right Panel (Default State):**
- [ ] Title: "Top Caribbean Economies"
- [ ] Subtitle: "Largest Caribbean markets by GDP · Curated Preview Data"
- [ ] Economy rows visible and readable
- [ ] "Request Full Access" CTA anchored at bottom
- [ ] No row clipped behind CTA

**Right Panel (Selected State):**
- [ ] Click Jamaica card
- [ ] Jamaica panel opens
- [ ] Jamaica card highlights in left panel
- [ ] Close panel, returns to Top Caribbean Economies

**Pass Criteria:**
- [ ] All visual elements correct
- [ ] Market count = 20
- [ ] Flags render correctly
- [ ] No card clipping
- [ ] Panel layout correct

---

### Test 6: All Regions

**URL:** `http://localhost:3010/intelligence/map?region=all`

**Visual Checks:**
- [ ] Hero title: "Souvera Intelligence Terminal"
- [ ] Hero subtitle mentions "Africa and the Caribbean"
- [ ] Footer shows: `Markets: 74`

**Left Panel (All Regions Market Shell):**
- [ ] Search bar: "Search all markets..."
- [ ] Filter pills:
  - [ ] ALL (74) — default active
  - [ ] AFRICA (54)
  - [ ] CARIBBEAN (20)
- [ ] Result count: "Showing 74 of 74 markets"
- [ ] Market cards render in grid
- [ ] Flags render as **images** (not raw URLs)
- [ ] Cards have region badges (blue "Africa", teal "Caribbean")
- [ ] Cards scroll internally (all 74 accessible)
- [ ] Search works (e.g., "Nigeria" filters correctly)
- [ ] Filter pills work:
  - [ ] Click AFRICA → 54 markets
  - [ ] Click CARIBBEAN → 20 markets
  - [ ] Click ALL → 74 markets

**Right Panel (Default State):**
- [ ] Title: "Top Souvera Economies"
- [ ] Subtitle: "Largest markets by GDP across Africa and Caribbean · Curated Preview Data"
- [ ] Combined economy list (Africa + Caribbean)
- [ ] All rows visible and readable
- [ ] "Request Full Access" CTA anchored at bottom
- [ ] No row clipped behind CTA

**Pass Criteria:**
- [ ] All visual elements correct
- [ ] Market count = 74
- [ ] Filter pills accurate
- [ ] Flags render correctly
- [ ] Panel layout correct

---

### Test 7: All Regions + Selected Country (Nigeria)

**URL:** `http://localhost:3010/intelligence/map?region=all&selected=NGA`

**Expected:**
- [ ] Hero: "Souvera Intelligence Terminal"
- [ ] Footer: `Markets: 74`
- [ ] Left panel: All Regions shell
- [ ] Right panel: Nigeria country detail (not default list)
- [ ] Nigeria card highlighted in left panel
- [ ] URL preserved: `?region=all&selected=NGA`

**Actions:**
- [ ] Close Nigeria panel (X button)
- [ ] Panel returns to "Top Souvera Economies"
- [ ] URL updates to `?region=all` (selected removed)

**Pass Criteria:**
- [ ] Country selection works
- [ ] URL state correct
- [ ] Panel transitions smoothly

---

### Test 8: All Regions + Selected Country (Jamaica)

**URL:** `http://localhost:3010/intelligence/map?region=all&selected=JAM`

**Expected:**
- [ ] Hero: "Souvera Intelligence Terminal"
- [ ] Footer: `Markets: 74`
- [ ] Left panel: All Regions shell
- [ ] Right panel: Jamaica country detail
- [ ] Jamaica card highlighted in left panel
- [ ] URL preserved: `?region=all&selected=JAM`

**Pass Criteria:**
- [ ] Caribbean country selection works in All Regions view
- [ ] URL state correct

---

### Test 9: Embedded Africa Workspace

**URL:** `http://localhost:3010/intelligence/africa`

**Expected:**
- [ ] Page hero: "Africa Intelligence Terminal" (static, not region-aware)
- [ ] Strategic sections present (hero, diagram, sectors, etc.)
- [ ] Embedded map workspace appears
- [ ] **No duplicate workspace top nav**
- [ ] **No region filter** in embedded view
- [ ] Map workspace shows Africa map
- [ ] Footer: `Markets: 54`
- [ ] Clicking country works
- [ ] No regression from Phase 2

**Pass Criteria:**
- [ ] Embedded workspace stable
- [ ] No visual regressions
- [ ] Count = 54

---

### Test 10: Embedded Caribbean Workspace

**URL:** `http://localhost:3010/intelligence/caribbean`

**Expected:**
- [ ] Page hero: "Caribbean Intelligence Terminal" (static)
- [ ] Strategic sections present
- [ ] Embedded Caribbean workspace appears
- [ ] **No duplicate workspace top nav**
- [ ] **No region filter** in embedded view
- [ ] Caribbean market shell renders
- [ ] Footer: `Markets: 20`
- [ ] Clicking Jamaica works
- [ ] No regression from Phase 3 Step 4B

**Pass Criteria:**
- [ ] Embedded workspace stable
- [ ] No visual regressions
- [ ] Count = 20

---

## PART 3: Mobile Verification

### Test 11: Mobile 375px (iPhone SE)

**Instructions:**
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone SE" or set custom width to 375px

**Test Routes:**
- [ ] `/intelligence/map?region=africa`
- [ ] `/intelligence/map?region=caribbean`
- [ ] `/intelligence/map?region=all`

**Visual Checks:**
- [ ] No horizontal overflow (no horizontal scrollbar)
- [ ] Hero stacks vertically
- [ ] Map/market list stacks above panel
- [ ] Search bar full width
- [ ] Market cards single column
- [ ] Country panel appears below list
- [ ] CTA does not overlap content
- [ ] Touch targets are large enough (cards, buttons)

**Pass Criteria:**
- [ ] All content readable
- [ ] No layout breaks
- [ ] No horizontal scroll

---

### Test 12: Mobile 414px (iPhone Pro)

**Same checks as 375px at 414px width**

**Pass Criteria:**
- [ ] All content readable
- [ ] No layout breaks
- [ ] No horizontal scroll

---

### Test 13: Tablet 768px (iPad Mini)

**Instructions:**
1. Set custom width to 768px

**Visual Checks:**
- [ ] Two-column market card grid (if applicable)
- [ ] Map/list and panel may be side-by-side at this breakpoint
- [ ] Search/filter usable
- [ ] No content cut off

**Pass Criteria:**
- [ ] Layout transitions smoothly
- [ ] No horizontal scroll

---

## PART 4: Language Compliance

**Prohibited Language (Must NOT appear anywhere):**
- "Live"
- "real-time"
- "Supabase connected"
- "AfDEC Intelligence"
- "AfDEC Priority"

**Approved Language (Should appear):**
- "Curated Preview Data"
- "Data pending" (for missing FDI/sectors)

**Where to Check:**
- [ ] Hero sections
- [ ] Panel headers
- [ ] Footer metadata
- [ ] Tooltips/help text
- [ ] Source attributions
- [ ] Data status banners

**Verification:**
```
Ctrl+F (Find in page)
Search for: "live"
Search for: "real-time"
Search for: "AfDEC"
```

**Pass Criteria:**
- [ ] No prohibited language found
- [ ] Approved language present

---

## PART 5: Final Checklist

### API Verification Results

| Endpoint | Expected Count | Actual Count | Pass/Fail |
|----------|----------------|--------------|-----------|
| `/api/v1/countries?region=africa` | 54 | ___ | ☐ |
| `/api/v1/countries?region=caribbean` | 20 | ___ | ☐ |
| `/api/v1/countries?region=all` | 74 | ___ | ☐ |

### UI Route Verification Results

| Route | Market Count | Panel Layout | Pass/Fail |
|-------|--------------|--------------|-----------|
| `/intelligence/map?region=africa` | 54 | No clipping | ☐ |
| `/intelligence/map?region=caribbean` | 20 | No clipping | ☐ |
| `/intelligence/map?region=all` | 74 | No clipping | ☐ |
| `/intelligence/map?region=all&selected=NGA` | 74 | Works | ☐ |
| `/intelligence/map?region=all&selected=JAM` | 74 | Works | ☐ |
| `/intelligence/africa` | 54 | Stable | ☐ |
| `/intelligence/caribbean` | 20 | Stable | ☐ |

### Mobile Verification Results

| Breakpoint | Horizontal Scroll | Layout | Pass/Fail |
|------------|-------------------|--------|-----------|
| 375px | None | Clean | ☐ |
| 414px | None | Clean | ☐ |
| 768px | None | Clean | ☐ |

### Language Compliance

- [ ] No prohibited language found
- [ ] Approved language present

---

## FINAL DECISION

**All checks passed?**
- [ ] YES → Proceed to Phase 3 closure
- [ ] NO → Document failures and create fix plan

**If YES, update these files:**
1. `docs/qa/phase-3-step-5-final-qa-fixes.md` — Add browser QA results
2. `docs/qa/phase-3-step-5-all-regions-implementation.md` — Update to COMPLETE
3. `PHASE3_COMPLETE.md` — Update to officially closed

**If NO, document:**
- Which test failed
- Expected vs actual
- Screenshots if available
- Likely root cause
- Recommended fix

---

**Verification Guide Status:** ⏳ READY FOR EXECUTION  
**Next Step:** Start dev server and execute verification
