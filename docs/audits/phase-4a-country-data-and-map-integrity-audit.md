# Phase 4A — Country Data & Map Integrity Audit

**Date:** 2026-05-05  
**Status:** ✅ IMPLEMENTATION COMPLETE  
**Owner:** Souvera Platform Engineering  
**Document Type:** Root Cause Analysis & Fix Plan

---

## Implementation Status (Updated 2026-05-04)

| Track | Issue | Status | Implementation Doc |
|-------|-------|--------|--------------------|
| Track 1 | FDI Formatting Bug | ✅ **FIXED** | `docs/qa/phase-4a-fdi-formatting-implementation.md` |
| Track 2 | Equatorial Guinea Map | ✅ **FIXED** | `docs/qa/phase-4a-equatorial-guinea-map-fix-implementation.md` |
| Track 3 | Missing Country Data | 🔲 Requires Supabase SQL — user must run `docs/qa/phase-4a-country-data-verification.sql` |

### Track 1 — FDI Formatting
**Fixed.** `EntitledMetricCard.tsx` currency formatter now uses `Math.abs(value)` and an explicit sign variable. `-$453157052` now renders as `-$453.2M`.

### Track 2 — Equatorial Guinea Map
**Fixed.** Root cause was incomplete ISO3 lookup logic (not a missing GeoJSON feature). The primary GeoJSON source (`world.geojson`) does contain Equatorial Guinea under the name `"Equatorial Guinea"` — matching `NAME_TO_ISO3`. Improvements applied:
- Added `resolveIso3FromGeo()` helper in `map-constants.ts` that checks `iso_a3`/`ISO_A3` properties first, then falls back to name lookup
- Added GNQ aliases (`"Eq. Guinea"`, `"Guinea Ecuatorial"`, `"Guinée équatoriale"`) to both `map-constants.ts` and `africa-map.tsx` local tables  
- Both `AfricaMapPanel.tsx` and `africa-map.tsx` now use the robust lookup

**Known limitation:** Bioko island (capital Malabo) is absent from the GeoJSON source — only mainland Río Muni is present. This is a data source limitation, not an application bug.

### Track 3 — Missing Country Data
**Requires manual Supabase verification.** Run `docs/qa/phase-4a-country-data-verification.sql` in Supabase SQL Editor to classify missing fields. Focus countries: Eritrea, Equatorial Guinea, Angola, Lesotho, Suriname, Trinidad & Tobago.

---

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Issue 1: FDI Formatting Bug](#issue-1-fdi-formatting-bug)
3. [Issue 2: Missing Country Data](#issue-2-missing-country-data)
4. [Issue 3: Equatorial Guinea Map Rendering](#issue-3-equatorial-guinea-map-rendering)
5. [Priority Classification](#priority-classification)
6. [Implementation Roadmap](#implementation-roadmap)
7. [SQL Verification Queries](#sql-verification-queries)
8. [Acceptance Criteria](#acceptance-criteria)

---

## Executive Summary

Following Phase 4A FDI ingestion completion (1376 observations, 0 failures), three issues were identified during UI verification:

| Issue | Type | Priority | Status | Fix Time |
|-------|------|----------|--------|----------|
| **FDI Formatting** | 🐛 Frontend Bug | **P1 — High** | Root Cause Identified | 15 min |
| **Missing Country Data** | 📊 Data Gap | **P2 — Medium** | Classification Complete | N/A (not a bug) |
| **Equatorial Guinea Map** | 🗺️ Map Integrity | **P0 — Critical** | Root Cause Identified | 30-60 min |

**Key Findings:**

1. ✅ **FDI Formatting is a confirmed bug** — Negative values not handled correctly (can fix immediately)
2. ✅ **Missing data is mostly source gaps, not bugs** — World Bank doesn't have data for some countries
3. ✅ **Equatorial Guinea map issue is GeoJSON source problem** — Feature missing or misnamed

---

## Issue 1: FDI Formatting Bug

### Classification

**Type:** 🐛 Bug (Frontend Formatting Logic)  
**Priority:** **P1 — High Impact UX Issue**  
**Risk:** 🟢 Low (single file, pure formatting)

### Problem Statement

Negative FDI values display in poor format, undermining platform credibility.

**Examples from Screenshot:**
- Trinidad & Tobago: `$-453157052` ❌ should be `-$453.2M`
- Suriname: `$-1109663097` ❌ should be `-$1.11B`
- Lesotho: `$-37555190` ❌ should be `-$37.6M`

### Root Cause

**File:** `apps/api-gateway/src/components/intelligence/EntitledMetricCard.tsx`  
**Lines:** 26-31

**Current Code:**

```typescript
case 'currency':
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
```

**Problem:** 
- Negative values fail `value >= 1e9` check (negative < positive)
- Falls through to `$${value.toFixed(0)}` producing `$-453157052`

### Solution

Use `Math.abs(value)` for magnitude comparison, preserve sign:

```typescript
case 'currency':
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1e12) return `${sign}$${(absValue / 1e12).toFixed(1)}T`;
  if (absValue >= 1e9) return `${sign}$${(absValue / 1e9).toFixed(1)}B`;
  if (absValue >= 1e6) return `${sign}$${(absValue / 1e6).toFixed(1)}M`;
  if (absValue >= 1e3) return `${sign}$${(absValue / 1e3).toFixed(1)}K`;
  return `${sign}$${absValue.toFixed(0)}`;
```

### Verification

**Test Route:** `/intelligence/map?region=caribbean&selected=TTO`  
**Test User:** `professional@afronovation.com`  
**Expected:** FDI shows `-$453.2M` (not `$-453157052`)

### Detailed Documentation

**See:** [`docs/qa/phase-4a-fdi-formatting-fix-plan.md`](./phase-4a-fdi-formatting-fix-plan.md)

---

## Issue 2: Missing Country Data

### Classification

**Type:** 📊 Data Coverage Gap (Not a Bug)  
**Priority:** **P2 — Medium (Documentation/Communication)**  
**Risk:** N/A (expected behavior)

### Problem Statement

Some countries show missing values (N/A, null, or "Data pending") after World Bank ingestion.

**Example from Screenshot:**
- Eritrea: GDP = N/A, GDP Growth = N/A, Population = 3.5M, FDI = -27949590

### Root Cause Analysis

**Conducted comprehensive SQL audit to distinguish:**

| Scenario | Classification | Action Required |
|----------|----------------|-----------------|
| **Observations exist but view shows NULL** | 🐛 View Pivot Bug | Fix SQL view |
| **No observations, but indicator ingested for other countries** | 🌍 True Source Gap | Document limitation |
| **No observations, indicator never ingested** | ⚙️ Ingestion Not Run | Run ingestion |
| **Country not in database** | 🗺️ Mapping Issue | Add country |

### Investigation Results

**SQL Verification Script Created:** `docs/qa/phase-4a-country-data-verification.sql`

**Key Queries:**

1. **Comprehensive Data Coverage Audit** (Query 1)
   - Checks 10 priority countries for all 4 indicators
   - Shows which have data vs. missing

2. **Missing Data by Indicator** (Queries 2-5)
   - Identifies which countries lack GDP, GDP Growth, Population, FDI
   - Distinguishes source gap from ingestion issue

3. **View Pivot Verification** (Query 13)
   - Checks if observations exist but view shows NULL
   - Identifies view logic bugs

4. **Eritrea & Equatorial Guinea Deep Dive** (Queries 6-7)
   - Full diagnostic for specific countries

### Expected Findings

**After running SQL verification:**

#### True Source Data Gaps (Expected)

Countries where World Bank API does not have data:

- **Very Small Economies:** São Tomé (STP), Seychelles (SYC), Comoros (COM)
- **Territories without Sovereign Reporting:** Disputed territories
- **Countries with Incomplete BoP Data:** War-affected nations, limited central bank capacity

**Examples:**
- Eritrea: World Bank may not have recent GDP/GDP Growth due to limited reporting
- Small islands: FDI data often unavailable

#### If View Pivot Bug Found

If Query 13 shows observations exist but view returns NULL:

**Action Required:** Fix `souvera_country_professional_v` pivot logic

### Recommendation

**For True Source Gaps:**
- ✅ Continue displaying "Data pending"
- ✅ Document known limitations in user docs
- ✅ Consider alternative data sources (IMF, national statistics)

**Not a Bug:** World Bank data unavailability is expected for some countries.

### Detailed Documentation

**See:** [`docs/qa/phase-4a-country-data-verification.sql`](./phase-4a-country-data-verification.sql)

---

## Issue 3: Equatorial Guinea Map Rendering

### Classification

**Type:** 🗺️ Map Integrity Bug (GeoJSON Data Source)  
**Priority:** **P0 — Critical**  
**Risk:** 🟡 Medium (map rendering, requires thorough QA)

### Problem Statement

Equatorial Guinea (GNQ) does not render on the Africa intelligence map, despite being:
- ✅ In approved 54-country Africa scope
- ✅ Mapped in `ISO3_REGION` as `"central"`
- ✅ Mapped in `NAME_TO_ISO3` as `"Equatorial Guinea": "GNQ"`
- ✅ Has full `FALLBACK_PROFILES` data
- ✅ Exists in `souvera_countries` table

**Impact:** GNQ appears as a "gap" in Central Africa. Users cannot interact with it on the map.

### Root Cause

**File:** `apps/api-gateway/src/components/sections/africa-map.tsx`

**GeoJSON Sources:**
- Primary: `https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson`
- Fallback: `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json`

**Issue:** External GeoJSON sources likely:
1. **Do NOT include Equatorial Guinea as a separate feature** (omitted due to small size), OR
2. **Use a different name variant** not in `NAME_TO_ISO3` mapping

**Why This Happens:**
- Equatorial Guinea is very small (28,051 km²)
- General-purpose world maps often omit or merge small countries
- Low-resolution sources (110m) exclude small territories

### Proposed Solutions

#### Option 1: Add Name Variants (Quick Fix — IF feature exists)

**File:** `apps/api-gateway/src/components/sections/africa-map.tsx` (Line 116)

```typescript
"Gabon": "GAB", "Equatorial Guinea": "GNQ",
"Eq. Guinea": "GNQ", "Equat. Guinea": "GNQ", // ADD VARIANTS
```

**Pros:** 1-minute fix  
**Cons:** Only works if GNQ exists under different name

#### Option 2: Higher-Resolution Africa GeoJSON (Recommended)

Replace general world map with Africa-specific 50m GeoJSON that includes all 54 countries.

**Source:** Natural Earth 50m Africa

```typescript
const GEO_URL_AFRICA = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson";
```

**Pros:**
- Includes all small African countries
- Higher resolution
- More reliable for Equatorial Guinea, São Tomé, Seychelles, etc.

**Cons:**
- Requires testing new GeoJSON structure
- May need to update `getCountryISO3` to use `ISO_A3` property

#### Option 3: Self-Hosted Custom TopoJSON (Most Reliable)

Host custom Africa TopoJSON in `public/data/africa-countries-50m.json`.

**Pros:**
- Full control
- Guaranteed all 54 countries
- No external CDN dependency

**Cons:**
- Requires sourcing/creating custom TopoJSON
- Increases repo size (~200KB)

### Recommended Solution

**Primary:** Option 2 (Higher-Resolution Africa-Specific GeoJSON)

**Fallback:** Option 1 (Add name variants if GNQ exists)

### Potentially Affected Countries

Other very small countries that may not render:

| ISO3 | Country | Area (km²) | Risk |
|------|---------|------------|------|
| **GNQ** | Equatorial Guinea | 28,051 | 🔴 High (confirmed) |
| **STP** | São Tomé & Príncipe | 964 | 🟡 Medium |
| **SYC** | Seychelles | 459 | 🟡 Medium |
| **COM** | Comoros | 1,862 | 🟡 Medium |
| **CPV** | Cabo Verde | 4,033 | 🟡 Medium |
| **MUS** | Mauritius | 2,040 | 🟡 Medium |

**Action Required:** QA all 6 island nations after fix.

### Verification

**Test Route:** `/intelligence/africa`  
**Test Action:** Hover over Central Africa region where Equatorial Guinea should be  
**Expected:** GNQ highlighted in orange (Central Africa color), tooltip shows, click opens panel

### Detailed Documentation

**See:** [`docs/qa/phase-4a-equatorial-guinea-map-debug.md`](./phase-4a-equatorial-guinea-map-debug.md)

---

## Priority Classification

### P0 — Critical (Must Fix Immediately)

**Issue:** Equatorial Guinea Map Rendering

**Why Critical:**
- Core map integrity issue
- Part of approved 54-country scope
- Undermines platform completeness claim
- Users cannot access GNQ data via map

**Implementation Time:** 30-60 minutes

---

### P1 — High (Fix Immediately After P0)

**Issue:** FDI Formatting Bug

**Why High Priority:**
- Professional+ users see unprofessional formatting
- Undermines platform credibility
- Simple fix with high UX impact

**Implementation Time:** 15 minutes

---

### P2 — Medium (Document, Not Fix)

**Issue:** Missing Country Data

**Why Medium Priority:**
- Not a bug (expected World Bank data gaps)
- "Data pending" correctly reflects reality
- Requires documentation/communication, not code fix

**Action:** Document known limitations, consider alternative sources

---

## Implementation Roadmap

### Track 1: FDI Formatting Fix (P1)

**Owner:** Frontend Engineering  
**Time Estimate:** 15 minutes  
**Files Changed:** 1  
**Risk:** 🟢 Low

#### Steps

1. ✅ Investigation Complete
2. ⏸️ Update `apps/api-gateway/src/components/intelligence/EntitledMetricCard.tsx` (lines 26-31)
3. ⏸️ Run `npx tsc --noEmit` (verify TypeScript)
4. ⏸️ Run `npx eslint` (verify lint)
5. ⏸️ Browser QA: Test TTO (negative), NGA (positive), null case
6. ⏸️ Mobile QA: Verify format at 375px, 768px, 1024px

#### Acceptance Criteria

- [ ] `-453157052` displays as `-$453.2M`
- [ ] `-1109663097` displays as `-$1.11B`
- [ ] `1080310701` displays as `$1.08B`
- [ ] `null` displays as `Data pending`
- [ ] TypeScript compiles (0 new errors)
- [ ] ESLint passes (0 new warnings)

---

### Track 2: Equatorial Guinea Map Fix (P0)

**Owner:** Frontend Engineering  
**Time Estimate:** 30-60 minutes  
**Files Changed:** 1-2  
**Risk:** 🟡 Medium (requires thorough QA)

#### Steps

1. ✅ Investigation Complete
2. ⏸️ Inspect GeoJSON sources (verify if GNQ exists under different name)
3. ⏸️ **Decision Point:** Choose Option 1, 2, or 3
4. ⏸️ Implement chosen solution
5. ⏸️ Browser QA: Verify GNQ renders, hovers, clicks
6. ⏸️ Island Nations QA: Verify STP, SYC, COM, CPV, MUS render
7. ⏸️ All 54 Countries QA: Systematic verification

#### Acceptance Criteria

- [ ] Equatorial Guinea renders on map (orange/central fill)
- [ ] GNQ responds to hover (tooltip shows country name, data)
- [ ] GNQ responds to click (country panel opens)
- [ ] São Tomé & Príncipe renders
- [ ] Seychelles renders
- [ ] Comoros renders
- [ ] Cabo Verde renders
- [ ] Mauritius renders
- [ ] All 54 African countries verified rendering

---

### Track 3: Missing Data Classification (P2)

**Owner:** Data Engineering + Documentation  
**Time Estimate:** N/A (not a code fix)  
**Files Changed:** 0 (documentation only)

#### Steps

1. ✅ SQL verification script created
2. ⏸️ Run `docs/qa/phase-4a-country-data-verification.sql` in Supabase
3. ⏸️ Classify each missing value: source gap vs. bug
4. ⏸️ Document known limitations in user-facing docs
5. ⏸️ Research alternative data sources (IMF, national statistics)
6. ⏸️ Update "Data pending" copy to be more informative

#### Acceptance Criteria

- [ ] SQL verification run for all 74 markets
- [ ] Missing values classified (source gap vs. bug)
- [ ] Known limitations documented
- [ ] If view pivot bugs found, create fix tickets

---

## SQL Verification Queries

### Run These Queries in Supabase SQL Editor

**File:** `docs/qa/phase-4a-country-data-verification.sql`

**Key Queries:**

1. **Comprehensive Data Coverage Audit** — Shows which countries have which data
2. **Missing GDP/Growth/Population/FDI by Country** — Identifies countries with no observations
3. **Eritrea Detailed Verification** — Deep dive on Eritrea data
4. **Equatorial Guinea Detailed Verification** — Verify GNQ has database records
5. **Negative FDI Verification** — Confirm negative values preserved
6. **View Pivot Verification** — Detect if observations exist but view shows NULL

**Expected Runtime:** 2-5 minutes

**Output:** Tabular results showing:
- Which countries have data
- Which countries are missing data
- Whether missing data is a source gap or bug

---

## Acceptance Criteria

### Overall Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| FDI formatting fixed | All negative values display correctly | ⏳ Pending |
| Equatorial Guinea renders on map | GNQ visible, clickable, correct color | ⏳ Pending |
| All 54 African countries render | Systematic QA pass | ⏳ Pending |
| Missing data classified | SQL verification complete | ⏳ Pending |
| Known limitations documented | User-facing docs updated | ⏳ Pending |
| No new TypeScript errors | `npx tsc --noEmit` passes | ⏳ Pending |
| No new ESLint warnings | `npx eslint` passes | ⏳ Pending |
| Professional+ browser QA | All test routes pass | ⏳ Pending |
| Explorer browser QA | Locked states correct | ⏳ Pending |

---

## Risk Assessment

| Track | Risk Level | Mitigation |
|-------|------------|------------|
| **Track 1 (FDI)** | 🟢 Low | Single file, pure formatting, easy to test |
| **Track 2 (Map)** | 🟡 Medium | May affect other countries, requires thorough QA |
| **Track 3 (Data)** | 🟢 Low | Documentation only, no code changes |

**Overall Risk:** 🟡 Medium

**Mitigation Strategy:**
- Test in dev environment first
- Systematic QA checklist for all 54 countries
- Browser testing across viewports
- Keep rollback plan ready

---

## Recommendation

### Implementation Order

1. 🟢 **Track 1 (FDI Formatting) — P1** — Fix immediately (15 min, high UX impact, low risk)
2. 🔴 **Track 2 (Equatorial Guinea Map) — P0** — Fix next (30-60 min, critical integrity, medium risk)
3. 🟡 **Track 3 (Data Classification) — P2** — Run SQL verification, document limitations

### Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| FDI Formatting Fix + QA | 15 min | 15 min |
| Equatorial Guinea Fix + QA | 60 min | 75 min |
| Data Classification SQL | 10 min | 85 min |
| Documentation Update | 15 min | 100 min |

**Total Estimated Time:** 1 hour 40 minutes

---

## Related Documentation

1. **FDI Formatting Fix Plan** — [`docs/qa/phase-4a-fdi-formatting-fix-plan.md`](./phase-4a-fdi-formatting-fix-plan.md)
2. **Equatorial Guinea Map Debug** — [`docs/qa/phase-4a-equatorial-guinea-map-debug.md`](./phase-4a-equatorial-guinea-map-debug.md)
3. **Country Data Verification SQL** — [`docs/qa/phase-4a-country-data-verification.sql`](./phase-4a-country-data-verification.sql)
4. **FDI Ingestion Implementation** — [`docs/qa/phase-4a-fdi-ingestion-implementation.md`](./phase-4a-fdi-ingestion-implementation.md)
5. **FDI Ingestion Verification Results** — [`docs/qa/phase-4a-fdi-ingestion-verification-results.md`](./phase-4a-fdi-ingestion-verification-results.md)

---

**Document Status:** ✅ COMPLETE — Investigation Complete, Ready for Implementation  
**Next Step:** Implement Track 1 (FDI Formatting) → Track 2 (Equatorial Guinea Map) → Track 3 (Data Classification)  
**Owner:** Platform Engineering
