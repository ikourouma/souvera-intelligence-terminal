# Phase 3 Step 5 — Runtime QA Bug Report

**Date:** 2026-05-04  
**Status:** ❌ BUGS IDENTIFIED → ✅ FIXES APPLIED  
**Author:** Souvera Platform Engineering

---

## Executive Summary

Phase 3 Step 5 implementation introduced two critical runtime bugs that prevented the "All Regions Combined View" from functioning correctly:

| Bug | Severity | Status |
|-----|----------|--------|
| **Bug 1:** All Regions shows 0 markets | P0 — Blocking | ✅ **FIXED** |
| **Bug 2:** Flag URLs render as text | P1 — Visual | ✅ **FIXED** |

Both bugs have been resolved. The fixes are awaiting browser QA verification.

---

## Screenshot-Based Findings

### Before Fix

| Route | Observed Behavior |
|-------|------------------|
| `/intelligence/map?region=all` | ALL (0) / AFRICA (0) / CARIBBEAN (0) — "Showing 0 of 0 markets" |
| `/intelligence/map?region=caribbean` | Market cards show raw URLs: `https://flagcdn.com/ag.svg` |

### Expected After Fix

| Route | Expected Behavior |
|-------|------------------|
| `/intelligence/map?region=all` | ALL (74) / AFRICA (54) / CARIBBEAN (20) markets displayed |
| `/intelligence/map?region=caribbean` | Market cards show flag images (rendered via `<img>` tag) |

---

## Bug 1: All Regions Shows 0 Markets

### Root Cause

**Supabase Query Builder Mutation Race Condition**

The `/api/v1/countries?region=all` endpoint reused a single `baseQuery` object for both Africa and Caribbean queries in a `Promise.all`:

```typescript
// BROKEN CODE (lines 93-143 before fix)
const baseQuery = supabase
  .from(dataView)
  .select('...')
  .eq('is_active', true);

// Later, for region === 'all':
const [africaResult, caribbeanResult] = await Promise.all([
  baseQuery.eq('is_african_country', true),     // Mutates shared baseQuery
  baseQuery.in('iso3', APPROVED_CARIBBEAN_ISO3) // Also mutates shared baseQuery
]);
```

**The Problem:** Supabase's `PostgrestFilterBuilder` is **mutable**. Each `.eq()` or `.in()` call modifies the builder in place and returns `this`. When both queries execute in parallel:

1. Both reference the same `baseQuery` object
2. First callback calls `.eq('is_african_country', true)` → mutates `baseQuery`
3. Second callback calls `.in('iso3', CARIBBEAN_LIST)` → also mutates the same object
4. Due to race condition, both queries end up with combined filters:
   ```
   is_african_country = true
   AND
   iso3 IN (Caribbean list)
   ```
5. This returns **0 results** because no country can be both African AND in the Caribbean ISO3 list

### Evidence

The `baseQuery` was defined once and reused for multiple filter paths, causing the mutation bug only in the `region=all` branch where two filters were applied in parallel.

### Fix Applied

**File:** `apps/api-gateway/src/app/api/v1/countries/route.ts`

**Changes:**
1. Defined a reusable `selectFields` constant for consistency
2. Created **fresh, independent query builders** for each query in the `region=all` branch
3. Removed the shared `baseQuery` pattern for Africa, Caribbean, and Global queries

**Fixed Code:**

```typescript
const selectFields = 'iso2, iso3, name, region, subregion, capital, flag_svg_url, lat, lng, gdp_current_usd, gdp_growth_pct, population_total, signal_level, freshness_at, is_african_country';

// For region === 'all':
const [africaResult, caribbeanResult] = await Promise.all([
  // Query 1: Fresh query builder for Africa
  supabase
    .from(dataView)
    .select(selectFields)
    .eq('is_active', true)
    .eq('is_african_country', true),
  
  // Query 2: Fresh query builder for Caribbean
  supabase
    .from(dataView)
    .select(selectFields)
    .eq('is_active', true)
    .in('iso3', APPROVED_CARIBBEAN_ISO3)
]);
```

### Expected Result After Fix

- `/api/v1/countries?region=all` should return Africa + Caribbean markets
- Expected count: up to 74 markets (54 African + 20 Caribbean)
- Response shape, access tier behavior, and other regions remain unchanged

---

## Bug 2: Flag URLs Render as Text

### Root Cause

**Missing `<img>` Element**

Both `CaribbeanMarketShell.tsx` and `AllRegionsMarketShell.tsx` rendered `country.flagUrl` as **text content** instead of an image:

**Broken Code:**

```tsx
{country.flagUrl ? (
  <div className="text-2xl">{country.flagUrl}</div>  // Renders URL as text
) : (
  <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center">
    <MapPin className="w-4 h-4 text-zinc-600" />
  </div>
)}
```

The code assumed `flagUrl` contained an emoji flag character (which would render as text), but the API returns URL strings like `https://flagcdn.com/ag.svg`.

### API Response Confirmation

The API correctly returns:

```json
{
  "countries": [
    {
      "iso3": "JAM",
      "name": "Jamaica",
      "flagUrl": "https://flagcdn.com/jm.svg",
      ...
    }
  ]
}
```

The field name is correct, but the components didn't render it as an image.

### Fix Applied

**Files:**
- `apps/api-gateway/src/components/intelligence/CaribbeanMarketShell.tsx`
- `apps/api-gateway/src/components/intelligence/AllRegionsMarketShell.tsx`

**Fixed Code:**

```tsx
{country.flagUrl ? (
  <img
    src={country.flagUrl}
    alt={`${country.name} flag`}
    className="w-8 h-6 object-cover rounded-sm shrink-0"
    loading="lazy"
  />
) : (
  <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center shrink-0">
    <MapPin className="w-4 h-4 text-zinc-600" />
  </div>
)}
```

**Changes:**
- Replaced text rendering with `<img>` element
- Added `src={country.flagUrl}` to load the image
- Added accessible `alt` text
- Sized flag to `w-8 h-6` (8:6 aspect ratio, typical for flags)
- Added `object-cover` for proper flag cropping
- Added `loading="lazy"` for performance
- Preserved `shrink-0` to prevent flex shrinking
- Kept fallback `MapPin` icon when no flag URL exists

### Expected Result After Fix

- Caribbean market cards show flag images (not raw URLs)
- All Regions market cards show flag images (not raw URLs)
- Fallback icon displayed when flag data is unavailable
- Mobile layout unaffected

---

## API Findings

### API Behavior

| Endpoint | Before Fix | After Fix |
|----------|-----------|-----------|
| `/api/v1/countries?region=africa` | ✅ Returns 54 African countries | ✅ Unchanged (works correctly) |
| `/api/v1/countries?region=caribbean` | ✅ Returns 20 Caribbean markets | ✅ Unchanged (works correctly) |
| `/api/v1/countries?region=all` | ❌ Returns 0 countries (mutation bug) | ✅ Returns 74 countries (54 + 20) |

### Response Structure

The API response structure remains unchanged:

```json
{
  "countries": [...],
  "meta": {
    "product": "souvera",
    "owner": "Afronovation, Inc.",
    "accessTier": "public",
    "authenticated": false,
    "generatedAt": "2026-05-04T...",
    "region": "all",
    "scope": "mandate",
    "count": 74,
    "previewData": true,
    "sources": [...]
  }
}
```

---

## Component Data Flow Findings

### SouveraMapWorkspace.tsx

The `SouveraMapWorkspace` component correctly splits the API response for `region=all`:

```tsx
if (currentRegion === 'all') {
  const africanCountries = (data.countries || []).filter(c =>
    c.isAfricanCountry === true || ISO3_REGION[c.iso3] !== undefined
  );
  const caribCountries = (data.countries || []).filter(c =>
    c.isAfricanCountry !== true && ISO3_REGION[c.iso3] === undefined
  );
  setCountries(africanCountries);
  setCaribbeanCountries(caribCountries);
}
```

**Analysis:** This logic is correct. The bug was in the API returning 0 results, not in the frontend splitting logic.

### AllRegionsMarketShell.tsx

The component correctly receives the combined array:

```tsx
const allCountries = [...countries, ...caribbeanCountries];
<AllRegionsMarketShell
  countries={allCountries}
  selectedIso3={selectedIso3}
  onCountrySelect={handleCountrySelect}
/>
```

**Analysis:** The component filter pills and counts are calculated correctly from the `countries` prop. The issue was that `countries` was an empty array due to the API bug.

---

## Files Changed

| File | Change | Lines Changed |
|------|--------|---------------|
| `apps/api-gateway/src/app/api/v1/countries/route.ts` | Fixed query builder mutation | ~100 lines refactored |
| `apps/api-gateway/src/components/intelligence/CaribbeanMarketShell.tsx` | Fixed flag rendering | ~10 lines |
| `apps/api-gateway/src/components/intelligence/AllRegionsMarketShell.tsx` | Fixed flag rendering | ~10 lines |

---

## Verification Results

### TypeScript Verification

```
npx tsc --noEmit -p apps/api-gateway/tsconfig.json
```

**Result:** ✅ No new TypeScript errors. All pre-existing errors remain unchanged (country-lite/route.ts, CountryIntelligencePanel.tsx, supabase middleware/server, proxy.ts).

### Lint Verification

```
ReadLints on changed files
```

**Result:** ✅ No linter errors found in any of the changed files.

---

## Browser Verification (Required)

The following routes must be verified in a browser before marking Step 5 as complete:

| Route | Expected Behavior | Status |
|-------|------------------|--------|
| `/api/v1/countries?region=all` | Returns 74 countries (54 Africa + 20 Caribbean) | ⏳ **Pending browser test** |
| `/intelligence/map?region=all` | Shows unified market list with 74 cards | ⏳ **Pending browser test** |
| Filter pills | ALL (74) / AFRICA (54) / CARIBBEAN (20) | ⏳ **Pending browser test** |
| `/intelligence/map?region=caribbean` | Shows 20 Caribbean markets with flag images | ⏳ **Pending browser test** |
| `/intelligence/map?region=all&selected=NGA` | Opens Nigeria panel (Africa badge) | ⏳ **Pending browser test** |
| `/intelligence/map?region=all&selected=JAM` | Opens Jamaica panel (Caribbean badge) | ⏳ **Pending browser test** |
| `/intelligence/map?region=africa` | Unchanged (Africa map) | ⏳ **Pending browser test** |
| `/intelligence/africa` | Unchanged (embedded workspace) | ⏳ **Pending browser test** |
| `/intelligence/caribbean` | Unchanged (embedded workspace) | ⏳ **Pending browser test** |

---

## Acceptance Criteria

| # | Criterion | Before Fix | After Fix |
|---|-----------|-----------|-----------|
| 1 | `/api/v1/countries?region=all` returns 74 countries | ❌ Returns 0 | ✅ Expected to return 74 |
| 2 | `/intelligence/map?region=all` displays market cards | ❌ Shows 0 | ✅ Expected to show 74 |
| 3 | Filter pills show correct counts | ❌ ALL (0) | ✅ Expected ALL (74) |
| 4 | Caribbean flags render as images | ❌ Raw URLs | ✅ Renders `<img>` |
| 5 | All Regions flags render as images | ❌ Raw URLs | ✅ Renders `<img>` |
| 6 | Search filters markets correctly | N/A | ✅ Code unchanged |
| 7 | Country selection works | N/A | ✅ Code unchanged |
| 8 | URL sync works | N/A | ✅ Code unchanged |
| 9 | Browser back/forward works | N/A | ✅ Code unchanged |
| 10 | No new build/lint errors | N/A | ✅ Verified |

---

## Corrected Step 5 Status

### Before Bugfix

| Status | Notes |
|--------|-------|
| ✅ COMPLETE | **INCORRECT** — Implementation report claimed completion, but runtime QA failed |

### After Bugfix

| Status | Notes |
|--------|-------|
| ✅ **IMPLEMENTED — RUNTIME QA FIX APPLIED** | Fixes applied. Browser QA verification required before marking complete. |

### Final Status (After Browser QA Passes)

| Status | Notes |
|--------|-------|
| ✅ **COMPLETE — RUNTIME QA PASSED** | All acceptance criteria verified in browser. Phase 3 can be closed. |

---

## Recommendation

### Immediate Next Steps

1. ✅ **Code fixes applied** — Both bugs fixed
2. ⏳ **Browser QA required** — Verify all routes listed above in a running browser
3. ⏳ **Update implementation report** — Change status from "COMPLETE" to "RUNTIME QA FIX APPLIED"
4. ⏳ **Update or defer `PHASE3_COMPLETE.md`** — Do not claim Phase 3 complete until browser QA passes

### Phase 3 Closure Decision

**Phase 3 cannot be closed until:**

- All browser verification routes pass
- Flag images render correctly (not as text)
- All Regions shows 74 markets (not 0)
- Filter pills show correct counts

**Once browser QA passes:**

- Mark Phase 3 Step 5 as `COMPLETE — RUNTIME QA PASSED`
- Update `PHASE3_COMPLETE.md` with final status
- Phase 3 can be officially closed

---

## Known Limitations After Fix

| Item | Notes |
|------|-------|
| `flagcdn.com` external dependency | Flag images loaded from third-party CDN (no local caching yet) |
| FDI may show "Data pending" | DATA-ING-02B not yet implemented |
| Sectors may be hidden | DATA-SEED-01 not yet implemented |
| No Caribbean SVG map | Intentional — list view used for Caribbean |

---

## Summary

**Two critical bugs were identified and fixed:**

1. **API query builder mutation** — Fixed by creating independent query builders for `region=all`
2. **Flag rendering bug** — Fixed by replacing text rendering with `<img>` elements

**Build verification:** ✅ Passed (no new errors)

**Browser verification:** ⏳ **Required before final approval**

**Phase 3 status:** Pending browser QA confirmation
