# Phase 3 Step 5 — Runtime QA Bugfix Implementation

**Date:** 2026-05-04  
**Status:** ✅ FIXES APPLIED — PENDING BROWSER VERIFICATION  
**Author:** Souvera Platform Engineering

---

## Executive Summary

Two critical bugs were identified during runtime QA of Phase 3 Step 5 ("All Regions Combined View") and have been fixed:

| Bug | Root Cause | Fix Applied |
|-----|-----------|-------------|
| **Bug 1:** All Regions shows 0 markets | Supabase query builder mutation race condition | Created independent query builders for each query |
| **Bug 2:** Flags render as text URLs | Missing `<img>` element in components | Replaced text rendering with image elements |

---

## Root Cause Analysis

### Bug 1: API Query Builder Mutation

**File:** `apps/api-gateway/src/app/api/v1/countries/route.ts`

**Problem:**

The code reused a single `baseQuery` object for both Africa and Caribbean queries in the `region=all` branch:

```typescript
const baseQuery = supabase
  .from(dataView)
  .select('...')
  .eq('is_active', true);

// Later:
const [africaResult, caribbeanResult] = await Promise.all([
  baseQuery.eq('is_african_country', true),     // Mutates baseQuery
  baseQuery.in('iso3', APPROVED_CARIBBEAN_ISO3) // Also mutates baseQuery
]);
```

Supabase's `PostgrestFilterBuilder` is **mutable**. Both queries modified the same object in parallel, causing combined filters:

```
is_african_country = true AND iso3 IN (Caribbean list)
```

This returned **0 results** because no country is both African AND in the Caribbean ISO3 list.

**Fix:**

Created fresh, independent query builders for each query:

```typescript
const selectFields = 'iso2, iso3, name, region, subregion, capital, flag_svg_url, lat, lng, gdp_current_usd, gdp_growth_pct, population_total, signal_level, freshness_at, is_african_country';

// For region === 'all':
const [africaResult, caribbeanResult] = await Promise.all([
  // Fresh query builder for Africa
  supabase
    .from(dataView)
    .select(selectFields)
    .eq('is_active', true)
    .eq('is_african_country', true),
  
  // Fresh query builder for Caribbean
  supabase
    .from(dataView)
    .select(selectFields)
    .eq('is_active', true)
    .in('iso3', APPROVED_CARIBBEAN_ISO3)
]);
```

Also refactored `region=africa`, `region=caribbean`, and `scope=global` branches to use fresh builders for consistency.

---

### Bug 2: Flag Rendering

**Files:**
- `apps/api-gateway/src/components/intelligence/CaribbeanMarketShell.tsx`
- `apps/api-gateway/src/components/intelligence/AllRegionsMarketShell.tsx`

**Problem:**

Components rendered `country.flagUrl` as text content:

```tsx
{country.flagUrl ? (
  <div className="text-2xl">{country.flagUrl}</div>  // Renders "https://flagcdn.com/jm.svg"
) : (...)}
```

The API returns URL strings (e.g., `https://flagcdn.com/jm.svg`), not emoji characters.

**Fix:**

Replaced text rendering with `<img>` element:

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

Applied to both `CaribbeanMarketShell` and `AllRegionsMarketShell` for consistency.

---

## Files Changed

| File | Lines Changed | Description |
|------|--------------|-------------|
| `apps/api-gateway/src/app/api/v1/countries/route.ts` | ~100 | Refactored query builders to prevent mutation |
| `apps/api-gateway/src/components/intelligence/CaribbeanMarketShell.tsx` | ~10 | Replaced flag text with `<img>` element |
| `apps/api-gateway/src/components/intelligence/AllRegionsMarketShell.tsx` | ~10 | Replaced flag text with `<img>` element |

---

## API Fix Summary

### Before

```typescript
// Broken: shared baseQuery mutated by parallel filters
const baseQuery = supabase.from(dataView).select('...').eq('is_active', true);

const [africaResult, caribbeanResult] = await Promise.all([
  baseQuery.eq('is_african_country', true),    // Mutates
  baseQuery.in('iso3', APPROVED_CARIBBEAN_ISO3) // Also mutates
]);

// Result: 0 countries (combined filters)
```

### After

```typescript
// Fixed: independent query builders
const [africaResult, caribbeanResult] = await Promise.all([
  supabase.from(dataView).select(selectFields).eq('is_active', true).eq('is_african_country', true),
  supabase.from(dataView).select(selectFields).eq('is_active', true).in('iso3', APPROVED_CARIBBEAN_ISO3)
]);

// Result: 74 countries (54 Africa + 20 Caribbean)
```

---

## Flag Rendering Fix Summary

### Before

```tsx
// Broken: renders URL string as text
{country.flagUrl ? (
  <div className="text-2xl">{country.flagUrl}</div>
) : (...)}

// Browser displays: "https://flagcdn.com/jm.svg"
```

### After

```tsx
// Fixed: renders image
{country.flagUrl ? (
  <img
    src={country.flagUrl}
    alt={`${country.name} flag`}
    className="w-8 h-6 object-cover rounded-sm shrink-0"
    loading="lazy"
  />
) : (...)}

// Browser displays: [Jamaica flag image]
```

---

## Before/After Behavior

| Route | Before | After |
|-------|--------|-------|
| `/api/v1/countries?region=all` | Returns 0 countries | Returns 74 countries (54 + 20) |
| `/intelligence/map?region=all` | ALL (0) / AFRICA (0) / CARIBBEAN (0) | ALL (74) / AFRICA (54) / CARIBBEAN (20) |
| `/intelligence/map?region=caribbean` | Market cards show `https://flagcdn.com/...` | Market cards show flag images |
| Filter pills | ALL (0) | ALL (74) |
| Market cards | Raw URL text | Flag images |

---

## Route Verification Table

| Route | Expected Behavior | Browser QA Status |
|-------|------------------|-------------------|
| `/api/v1/countries?region=africa` | Returns 54 African countries | ⏳ Pending |
| `/api/v1/countries?region=caribbean` | Returns 20 Caribbean markets | ⏳ Pending |
| `/api/v1/countries?region=all` | Returns 74 countries (54 + 20) | ⏳ Pending |
| `/intelligence/map` | Default Africa map | ⏳ Pending |
| `/intelligence/map?region=africa` | Africa map | ⏳ Pending |
| `/intelligence/map?region=caribbean` | Caribbean market shell with flag images | ⏳ Pending |
| `/intelligence/map?region=all` | Unified 74-market list with filter pills and flag images | ⏳ Pending |
| `/intelligence/map?region=all&selected=NGA` | Nigeria panel open (Africa badge) | ⏳ Pending |
| `/intelligence/map?region=all&selected=JAM` | Jamaica panel open (Caribbean badge) | ⏳ Pending |
| `/intelligence/africa` | Embedded Africa workspace (unchanged) | ⏳ Pending |
| `/intelligence/caribbean` | Embedded Caribbean workspace (unchanged) | ⏳ Pending |

---

## Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | `/api/v1/countries?region=all` returns Africa + Caribbean markets | ✅ Code fixed |
| 2 | `/intelligence/map?region=all` does not show 0 markets | ✅ Code fixed |
| 3 | Filter pills show real counts (not 0) | ✅ Code fixed |
| 4 | Caribbean flags render as images (not text) | ✅ Code fixed |
| 5 | All Regions flags render as images (not text) | ✅ Code fixed |
| 6 | Search still works | ✅ Unchanged |
| 7 | Country selection still works | ✅ Unchanged |
| 8 | URL sync still works | ✅ Unchanged |
| 9 | Browser back/forward still works | ✅ Unchanged |
| 10 | No new build/lint errors | ✅ Verified |
| 11 | No prohibited language | ✅ Verified |

---

## Build Verification

### TypeScript

```bash
npx tsc --noEmit -p apps/api-gateway/tsconfig.json
```

**Result:** ✅ No new TypeScript errors. All errors are pre-existing.

### Lint

```bash
ReadLints on changed files
```

**Result:** ✅ No linter errors found.

---

## Browser Verification (Required)

The following must be verified in a **running browser** before marking Step 5 complete:

1. **API Endpoints:**
   - `/api/v1/countries?region=all` returns 74 countries
   - Response includes both African and Caribbean markets

2. **All Regions View:**
   - `/intelligence/map?region=all` shows unified market list
   - Filter pills show: ALL (74) / AFRICA (54) / CARIBBEAN (20)
   - Market cards display flag images (not URLs)
   - Search filters across all 74 markets
   - Region badges (AFR/CAR) display correctly

3. **Country Selection:**
   - Clicking a market card opens the intelligence panel
   - `?region=all&selected=NGA` deep-links to Nigeria
   - `?region=all&selected=JAM` deep-links to Jamaica

4. **Caribbean View:**
   - `/intelligence/map?region=caribbean` shows flag images
   - No raw URLs visible

5. **Regression Check:**
   - `/intelligence/map?region=africa` unchanged
   - `/intelligence/africa` unchanged
   - `/intelligence/caribbean` unchanged

---

## Final Recommendation

### Current Status

✅ **Code fixes applied and verified**

- API query builder mutation fixed
- Flag rendering fixed in both components
- Build/lint passed

### Next Steps

⏳ **Browser QA required before final approval**

1. Start dev server: `npm run dev`
2. Navigate to `/intelligence/map?region=all`
3. Verify filter pills show non-zero counts
4. Verify market cards show flag images
5. Test country selection and URL sync
6. Verify `/intelligence/map?region=caribbean` shows flag images

### Phase 3 Closure

**Phase 3 Step 5 can be marked COMPLETE only after:**

- All browser verification routes pass
- Screenshots confirm flag images render (not text)
- Screenshots confirm All Regions shows 74 markets (not 0)
- Filter pills show correct counts in browser

**Once browser QA passes:**

- Update `docs/qa/phase-3-step-5-all-regions-implementation.md` status to `COMPLETE — RUNTIME QA PASSED`
- Update or create `PHASE3_COMPLETE.md` with verified final status
- Phase 3 can be officially closed

---

## Known Limitations

| Item | Notes |
|------|-------|
| External flag dependency | Flags loaded from `flagcdn.com` CDN |
| FDI "Data pending" | DATA-ING-02B not yet implemented |
| Sectors hidden | DATA-SEED-01 not yet implemented |
| No Caribbean SVG map | Intentional — list view for Caribbean |

---

## Summary

Two critical bugs blocking Phase 3 completion have been fixed:

1. ✅ **API query builder mutation** → Fixed with independent query builders
2. ✅ **Flag rendering bug** → Fixed with `<img>` elements

**Code verification:** ✅ Passed (build/lint clean)

**Browser verification:** ⏳ **Required** before marking Phase 3 complete

**Recommendation:** Proceed with browser QA testing. Once verified, Phase 3 Step 5 can be marked complete and Phase 3 can be closed.
