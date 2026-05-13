# Phase 3 Step 5 — Browser QA & Layout Polish Plan

**Date:** 2026-05-04  
**Status:** 🔍 ANALYSIS COMPLETE → 🛠️ READY FOR IMPLEMENTATION  
**Author:** Souvera Platform Engineering

---

## Executive Summary

Phase 3 Step 5 runtime bugs (API query builder mutation, flag rendering) have been fixed. However, final browser QA identified **4 P1 UI polish issues** that must be resolved before Phase 3 closure:

| Issue | Severity | Root Cause |
|-------|----------|------------|
| **Hero not region-aware** | P1 | Hardcoded static content in server component |
| **Caribbean cards clipped** | P1 | Shell lacks flex column scroll structure |
| **All Regions nested scroll** | P1 | Parent and child both have overflow-y-auto |
| **Mobile height constraints** | P2 | No height constraints below lg breakpoint |

**Phase 3 cannot be closed** until these UI polish items are implemented and verified in browser.

---

## Screenshot-Based Findings

### Issue 1: Hero Not Region-Aware

**Observed:** When region dropdown is set to Caribbean or All Regions, the page hero still displays:
> "Africa Intelligence Terminal"

**Expected:**
- `?region=africa` → "Africa Intelligence Terminal"
- `?region=caribbean` → "Caribbean Intelligence Terminal"
- `?region=all` → "Souvera Intelligence Terminal"

---

### Issue 2: Caribbean Market List Clipped

**Observed:** Lower market cards (Dominican Republic, Grenada, etc.) are cut off at the bottom of the left panel in `/intelligence/map?region=caribbean`.

**Expected:** Internal scrolling within the market list panel, with all 20 Caribbean markets accessible.

---

### Issue 3: All Regions Layout Issues

**Observed:** 
- Filter pills and search header scroll with market cards
- Potential nested scroll behavior (parent and child both have overflow-y-auto)

**Expected:** Fixed header with search/filter pills, scrollable market cards below.

---

### Issue 4: Right Panel Economy List

**Observed:** Economy list may appear compressed or run behind the source note and Request Full Access CTA.

**Expected:** 
- Top economies list scrolls independently
- CTA remains anchored at bottom
- No content overlaps CTA

---

## Runtime Bugfix Verification

The Step 5 runtime bugfixes are correctly implemented:

| Fix | File | Status |
|-----|------|--------|
| API Query Builder | `apps/api-gateway/src/app/api/v1/countries/route.ts` | ✅ Independent query builders |
| Caribbean Flag Rendering | `apps/api-gateway/src/components/intelligence/CaribbeanMarketShell.tsx` | ✅ Uses `<img>` element |
| All Regions Flag Rendering | `apps/api-gateway/src/components/intelligence/AllRegionsMarketShell.tsx` | ✅ Uses `<img>` element |

**Browser verification pending:**
- `/api/v1/countries?region=all` returns non-zero markets
- `/intelligence/map?region=all` shows unified market list
- Filter pills show real counts (ALL > 0, AFRICA > 0, CARIBBEAN > 0)
- Caribbean and All Regions flags render as images (not URLs)
- Country selection works (`?selected=NGA`, `?selected=JAM`)

---

## Region-Aware Hero Findings

### Current Implementation

**File:** `apps/api-gateway/src/app/intelligence/map/page.tsx` (lines 27-44)

**Problem:** Hero section is completely hardcoded as a static server component:

```tsx
<h1>Africa Intelligence Terminal</h1>
<p>Explore economic intelligence across 54 African markets...</p>
```

The hero doesn't read the `?region=` URL parameter. Region awareness only exists inside `SouveraMapWorkspaceWithUrl`, which doesn't control the page hero.

### Root Cause

The hero is a static server component that renders the same content regardless of URL query parameters.

### Recommended Fix

Create `RegionAwareMapHero.tsx` as a client component:

```tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { isValidRegion } from '@/lib/market-coverage';

export function RegionAwareMapHero() {
  const searchParams = useSearchParams();
  const urlRegion = searchParams.get('region');
  const region = urlRegion && isValidRegion(urlRegion) ? urlRegion : 'africa';
  
  const HERO_CONTENT = {
    africa: {
      title: 'Africa Intelligence Terminal',
      subtitle: 'Explore economic intelligence across 54 African markets...',
    },
    caribbean: {
      title: 'Caribbean Intelligence Terminal',
      subtitle: 'Explore market intelligence across 20 Caribbean territories...',
    },
    all: {
      title: 'Souvera Intelligence Terminal',
      subtitle: 'Explore economic intelligence across Africa and the Caribbean...',
    },
  };
  
  const content = HERO_CONTENT[region];
  
  return (
    <section className="pt-24 pb-10 border-b border-zinc-800">
      {/* Hero content */}
    </section>
  );
}
```

Wrap in `Suspense` in `page.tsx` for SSR compatibility.

### Expected Region-Aware Content

| Region | Title | Subtitle |
|--------|-------|---------|
| `africa` | Africa Intelligence Terminal | Explore economic intelligence across 54 African markets. Select any country for detailed profiles, key metrics, and sector insights. |
| `caribbean` | Caribbean Intelligence Terminal | Explore market intelligence across 20 Caribbean territories. Select any market for detailed profiles, key metrics, and sector insights. |
| `all` | Souvera Intelligence Terminal | Explore economic intelligence across Africa and the Caribbean. Search, filter, and compare markets across both regions. |

---

## Left Market List Layout Findings

### CaribbeanMarketShell (lines 68-218)

**Current Structure:**

```tsx
<div className="flex flex-col lg:flex-row min-h-[600px] bg-zinc-950">
  <div className="flex-1 lg:w-[65%] p-6 lg:border-r border-zinc-800">
    {/* Search bar */}
    {/* Result count */}
    {/* Market cards grid */}
  </div>
</div>
```

**Problems:**
1. Root uses `min-h-[600px]` instead of `h-full` — prevents height inheritance from parent
2. No separation between fixed header (search) and scrollable body (cards)
3. The entire panel is one monolithic block — cards can't scroll independently

**Parent Context (SouveraMapWorkspace.tsx line 295):**

```tsx
<div className="flex-1 lg:w-[65%] xl:w-[68%] min-h-[400px] lg:h-full border-b lg:border-b-0 lg:border-r border-zinc-800">
  <CaribbeanMarketShell countries={...} />
</div>
```

Parent provides `lg:h-full` but `CaribbeanMarketShell` doesn't respect it.

**Root Cause:** No flex column structure with separate header/body regions for controlled scrolling.

**Recommended Fix:**

```tsx
<div className="h-full min-h-0 flex flex-col bg-zinc-950">
  {/* Search header - fixed */}
  <div className="p-6 pb-4 shrink-0 border-b border-zinc-800/50">
    {/* Search input + result count */}
  </div>
  
  {/* Cards area - scrollable */}
  <div className="flex-1 min-h-0 overflow-y-auto p-6 pt-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Market cards */}
    </div>
  </div>
</div>
```

---

### AllRegionsMarketShell (lines 76-269)

**Current Structure:**

```tsx
<div className="flex-1 p-6 overflow-y-auto">
  {/* Search + Filter Bar */}
  <div className="mb-5 space-y-3">
    {/* Search input */}
    {/* Region filter pills */}
    {/* Result count */}
  </div>
  
  {/* Market Cards Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* Cards */}
  </div>
</div>
```

**Problems:**
1. Has `overflow-y-auto` but the search/filter header scrolls with cards (not pinned)
2. No separation between fixed header and scrollable body
3. Parent at SouveraMapWorkspace.tsx line 371 ALSO has `overflow-y-auto`, creating nested scrollers

**Root Cause:** No flex column structure + double overflow-y-auto (parent and child).

**Recommended Fix:**

```tsx
<div className="h-full min-h-0 flex flex-col">
  {/* Filter header - fixed */}
  <div className="p-6 pb-4 shrink-0 space-y-3 border-b border-zinc-800/50">
    {/* Search input + filter pills + result count */}
  </div>
  
  {/* Cards area - scrollable */}
  <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 pt-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Market cards */}
    </div>
  </div>
</div>
```

Also remove `overflow-y-auto` from parent in `SouveraMapWorkspace.tsx` line 371.

---

## Right Panel Economy List Findings

### CountryIntelligencePanel Default State (lines 159-258)

**Current Structure:**

```tsx
<div className="h-full bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
  <div className="p-5 border-b border-zinc-800 shrink-0">
    {/* Header */}
  </div>

  <div className="flex-1 overflow-y-auto">
    {/* Economy list */}
  </div>

  <div className="p-4 border-t border-zinc-800 shrink-0">
    {/* Footer with source note + CTA */}
  </div>
</div>
```

**Analysis:** The structure is **mostly correct**:
- Root: `h-full flex flex-col` ✅
- Header: `shrink-0` ✅
- Content: `flex-1 overflow-y-auto` ✅
- Footer: `shrink-0` ✅

**Potential Issue:** Parent container at SouveraMapWorkspace.tsx line 304:

```tsx
<div className="lg:w-[35%] xl:w-[32%] min-h-[400px] lg:h-full">
```

Only has `lg:h-full` — no explicit `h-full` at smaller breakpoints.

**Root Cause for Right Panel Issues:**
1. `lg:h-full` only applies at lg+ breakpoints
2. At smaller screens, `min-h-[400px]` doesn't constrain height properly
3. Economy list rows may be too tall (using `py-3.5` at line 198)

**Recommended Fix:** Minimal or no changes needed. The structure is correct. If issues persist in browser, reduce row padding slightly from `py-3.5` to `py-2.5`.

---

## CTA Footer Findings

The Request Full Access CTA is correctly structured:
- Footer uses `shrink-0` at line 242
- CTA is inside the footer at line 249-256
- Structure should keep CTA anchored at bottom

**No changes needed** unless browser QA reveals overlapping issues.

---

## Mobile Layout Findings

### Mobile Breakpoints
- `sm`: 640px
- `lg`: 1024px

### Issues on Mobile

1. **SouveraMapWorkspace (line 293):**
   ```tsx
   <div className="flex flex-col lg:flex-row lg:h-[650px] xl:h-[700px]">
   ```
   
   **Problem:** No height constraint below `lg` breakpoint. On mobile, the container has no fixed height, so `h-full` children have nothing to inherit.

2. **CaribbeanMarketShell:**
   - Uses `min-h-[600px]` — no upper limit on mobile
   - Content may overflow without proper scrolling

3. **AllRegionsMarketShell:**
   - Structure with `overflow-y-auto` should work on mobile
   - Grid uses `grid-cols-1 sm:grid-cols-2` — single column on mobile ✅

4. **CountryIntelligencePanel:**
   - Structure with `flex flex-col` should work
   - Footer CTA should stay anchored

**Recommended Fix:** The flex column restructuring of `CaribbeanMarketShell` and `AllRegionsMarketShell` will resolve mobile scrolling issues.

---

## Root Cause Summary

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Hero not region-aware | Hardcoded static content in server component | Create client component with useSearchParams |
| Caribbean cards clipped | Shell uses `min-h` instead of `h-full` + no flex column scroll structure | Restructure to h-full flex-col with shrink-0 header + flex-1 scrollable body |
| All Regions nested scroll | Parent and child both have `overflow-y-auto` + no header/body separation | Restructure to h-full flex-col + remove parent overflow |
| Right panel compression | Mobile lacks height constraints | Minimal changes (already correct structure) |
| Mobile overflow | No height constraints below lg breakpoint | Fixed by Caribbean/All Regions restructuring |

---

## Recommended Implementation Plan

### Priority 1 — Create Region-Aware Hero

**File:** `apps/api-gateway/src/components/intelligence/RegionAwareMapHero.tsx` (NEW)

Create client component that:
1. Uses `useSearchParams()` to read region
2. Validates region with `isValidRegion()`
3. Returns region-appropriate title/subtitle
4. Preserves exact visual structure of current hero

**File:** `apps/api-gateway/src/app/intelligence/map/page.tsx` (MODIFY)

Replace hardcoded hero with:

```tsx
<Suspense fallback={<div className="pt-24 pb-10 border-b border-zinc-800" />}>
  <RegionAwareMapHero />
</Suspense>
```

---

### Priority 2 — Fix CaribbeanMarketShell Clipping

**File:** `apps/api-gateway/src/components/intelligence/CaribbeanMarketShell.tsx` (MODIFY)

Restructure to:

```tsx
<div className="h-full min-h-0 flex flex-col bg-zinc-950">
  {/* Search header - fixed */}
  <div className="p-6 pb-4 shrink-0 border-b border-zinc-800/50">
    <div className="relative">
      {/* Search input */}
    </div>
    {/* Result count */}
  </div>
  
  {/* Cards area - scrollable */}
  <div className="flex-1 min-h-0 overflow-y-auto p-6 pt-4">
    {filteredCountries.length === 0 ? (
      {/* Empty state */}
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Market cards */}
      </div>
    )}
  </div>
</div>
```

---

### Priority 3 — Fix AllRegionsMarketShell Nested Scroll

**File:** `apps/api-gateway/src/components/intelligence/AllRegionsMarketShell.tsx` (MODIFY)

Restructure to:

```tsx
<div className="h-full min-h-0 flex flex-col">
  {/* Filter header - fixed */}
  <div className="p-6 pb-4 shrink-0 space-y-3 border-b border-zinc-800/50">
    {/* Search input */}
    {/* Region filter pills */}
    {/* Result count */}
  </div>
  
  {/* Cards area - scrollable */}
  <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 pt-4">
    {filteredCountries.length === 0 ? (
      {/* Empty state */}
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Market cards */}
      </div>
    )}
  </div>
</div>
```

**File:** `apps/api-gateway/src/components/intelligence/SouveraMapWorkspace.tsx` (MODIFY)

Remove `overflow-y-auto` from parent at line 371:

```tsx
{/* Market List Panel (Left) */}
<div className="flex-1 lg:w-[65%] xl:w-[68%] min-h-[400px] lg:h-full border-b lg:border-b-0 lg:border-r border-zinc-800">
  <AllRegionsMarketShell
    countries={allCountries}
    selectedIso3={selectedIso3}
    onCountrySelect={handleCountrySelect}
  />
</div>
```

---

### Priority 4 — Right Panel Verification (Minimal Changes)

**File:** `apps/api-gateway/src/components/intelligence/CountryIntelligencePanel.tsx` (VERIFY/MINIMAL)

Structure is already correct. Only modify if browser QA reveals issues:
- If rows too tall: reduce `py-3.5` to `py-2.5` at line 198
- If CTA overlaps content: ensure footer has explicit `shrink-0`

---

## Files Likely to Change

| File | Change Type | Description |
|------|------------|-------------|
| `apps/api-gateway/src/components/intelligence/RegionAwareMapHero.tsx` | **NEW** | Region-aware hero component |
| `apps/api-gateway/src/app/intelligence/map/page.tsx` | **MODIFY** | Replace static hero with RegionAwareMapHero in Suspense |
| `apps/api-gateway/src/components/intelligence/CaribbeanMarketShell.tsx` | **MODIFY** | Restructure to flex column with scrollable body |
| `apps/api-gateway/src/components/intelligence/AllRegionsMarketShell.tsx` | **MODIFY** | Restructure to flex column with scrollable body |
| `apps/api-gateway/src/components/intelligence/SouveraMapWorkspace.tsx` | **MODIFY** | Remove nested overflow-y-auto from All Regions branch |
| `apps/api-gateway/src/components/intelligence/CountryIntelligencePanel.tsx` | **VERIFY** | Minimal changes if needed |

---

## Acceptance Criteria for UI Polish

| # | Criterion |
|---|-----------|
| 1 | Hero title changes correctly by selected region (africa/caribbean/all) |
| 2 | Hero subtitle changes correctly by selected region |
| 3 | Caribbean cards are not clipped (all 20 markets accessible) |
| 4 | Caribbean market list has internal scrolling |
| 5 | All Regions cards are not clipped (all 74 markets accessible) |
| 6 | All Regions market list has internal scrolling |
| 7 | Market list search/filter header stays pinned while cards scroll |
| 8 | Top Caribbean Economies list remains readable |
| 9 | Top 10 African Economies list remains readable |
| 10 | Top Souvera Economies list remains readable (All Regions) |
| 11 | Request Full Access CTA stays anchored at bottom of right panel |
| 12 | No content overlaps CTA |
| 13 | Mobile (375px/414px) has no horizontal overflow |
| 14 | Mobile market list scrolls independently |
| 15 | `/intelligence/africa` remains stable |
| 16 | `/intelligence/caribbean` remains stable |
| 17 | No prohibited language appears |
| 18 | Flags render as images (not URLs) |
| 19 | All Regions filter pills show non-zero counts |
| 20 | Country selection works (`?selected=NGA`, `?selected=JAM`) |

---

## Corrected Phase 3 Step 5 Status

### Before UI Polish

```
IMPLEMENTED — RUNTIME QA FIX APPLIED
```

### After UI Polish Analysis

```
IMPLEMENTED — RUNTIME QA / UI POLISH REQUIRED
```

### After UI Polish Implementation

```
IMPLEMENTED — UI POLISH APPLIED → PENDING BROWSER VERIFICATION
```

### Final Status (After Browser QA Passes)

```
✅ COMPLETE — RUNTIME QA AND UI POLISH PASSED
```

---

## Recommendation

**UI Polish must be implemented before Phase 3 closure.**

The identified UI issues are P1 visual bugs that directly impact the user experience of Phase 3's core feature (regional expansion):

1. **Hero confusion** — Users see "Africa Intelligence Terminal" when viewing Caribbean markets
2. **Content clipping** — Users cannot access all markets without workarounds
3. **Scroll confusion** — Nested or awkward scroll behavior degrades UX

**Implementation sequence:**
1. ✅ Runtime bugfix (already applied)
2. ⏳ Create browser QA layout polish plan (this document)
3. ⏳ Implement UI polish (hero, market list scroll)
4. ⏳ Full browser QA verification
5. ⏳ Mark Phase 3 complete

**Phase 3 cannot be closed** until all acceptance criteria pass browser verification.
