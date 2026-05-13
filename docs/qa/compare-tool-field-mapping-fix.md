# Compare Tool Field Mapping Fix

**File Fixed:** `apps/api-gateway/src/components/intelligence/CountryComparisonTool.tsx`  
**Fix Date:** April 28, 2026  
**Severity:** Critical — all metrics showed N/A for every country  
**Status:** ✅ Fixed, build passing

---

## 1. Problem Summary

After the country comparison tool was implemented on `/intelligence/compare`, selecting any two countries resulted in all comparison cards showing **N/A** for every metric, including:

- Capital / Location
- GDP
- GDP Growth %
- Population
- Signal Level badge (absent)

The countries populated correctly in the dropdown selectors, meaning `/api/v1/countries` was working. The issue was isolated to the detail fetch via `/api/v1/country-lite`.

---

## 2. Root Cause

**Frontend/API response structure mismatch.**

The `/api/v1/country-lite` endpoint returns a **nested** JSON object:

```json
{
  "country":  { "name": "Angola", "capital": "Luanda", ... },
  "metrics":  { "gdpCurrentUsd": 94100000000, ... },
  "signal":   { "level": "emerging", ... },
  "sectors":  [...],
  "freshness":{ "updatedAt": "..." },
  "meta":     { "accessTier": "public", ... }
}
```

The component stored this response directly:

```typescript
// BEFORE (broken)
const data = await response.json();
setCountryDetail1(data);  // ← entire nested object stored as-is
```

The `CountryDetail` interface expected a **flat** structure, so `countryDetail1.capital` evaluated to `undefined` (it lived at `countryDetail1.country.capital`), `countryDetail1.gdpCurrentUsd` evaluated to `undefined` (it lived at `countryDetail1.metrics.gdpCurrentUsd`), and so on for every field.

The `formatNumber()` helper correctly returned `'N/A'` for `undefined` values — the rendering logic was correct; the data mapping was not.

---

## 3. API Response Shape

Full shape returned by `GET /api/v1/country-lite?iso3=AGO`:

```json
{
  "country": {
    "iso2": "AO",
    "iso3": "AGO",
    "name": "Angola",
    "region": "Africa",
    "subregion": "Middle Africa",
    "capital": "Luanda",
    "currencyCode": "AOA",
    "flagUrl": "https://flagcdn.com/ao.svg"
  },
  "metrics": {
    "gdpCurrentUsd": 94100000000,
    "gdpGrowthPct": 2.8,
    "populationTotal": 36700000
  },
  "signal": {
    "level": "emerging",
    "investmentScore": 60,
    "confidenceScore": 60
  },
  "sectors": [],
  "teaser": { "afdecTeaser": null },
  "freshness": { "updatedAt": "2026-04-28T00:00:00Z" },
  "meta": {
    "product": "souvera",
    "owner": "Afronovation, Inc.",
    "accessTier": "public",
    "authenticated": false,
    "generatedAt": "2026-04-28T...",
    "sources": [
      { "key": "rest_countries", "name": "REST Countries API" },
      { "key": "world_bank",     "name": "World Bank Indicators API" }
    ]
  }
}
```

**Note:** `meta.previewData` is not currently emitted by `/api/v1/country-lite` (it is emitted by `/api/v1/countries`). The mapper defaults it to `false` unless explicitly `true`.

---

## 4. UI Expected Shape

The `CountryDetail` interface used by the component:

```typescript
interface CountryDetail {
  iso3:            string;
  name:            string;
  region?:         string;
  subregion?:      string;
  capital?:        string;          // ← was expected at root
  gdpCurrentUsd?:  number;          // ← was expected at root
  populationTotal?:number;          // ← was expected at root
  gdpGrowthPct?:   number;          // ← was expected at root
  signalLevel?:    string;          // ← was expected at root
  sectors?:        string[];
  meta: {
    accessTier:   string;
    previewData?: boolean;
    sources?:     Array<{ key: string; name: string }>;
    generatedAt?: string;
  };
}
```

---

## 5. Mapping Fix Applied

A pure `mapApiResponse()` function was added above the component. Both fetch effects now call it before storing state.

```typescript
// apps/api-gateway/src/components/intelligence/CountryComparisonTool.tsx

function mapApiResponse(data: Record<string, unknown>): CountryDetail {
  const country = (data.country ?? {}) as Record<string, unknown>;
  const metrics = (data.metrics ?? {}) as Record<string, unknown>;
  const signal  = (data.signal  ?? {}) as Record<string, unknown>;
  const meta    = (data.meta    ?? {}) as Record<string, unknown>;
  const sectors = Array.isArray(data.sectors)
    ? (data.sectors as Array<{ label?: string }>)
        .map((s) => s.label ?? '')
        .filter(Boolean)
    : [];

  return {
    iso3:            String(country.iso3  ?? ''),
    name:            String(country.name  ?? ''),
    region:          country.region    != null ? String(country.region)    : undefined,
    subregion:       country.subregion != null ? String(country.subregion) : undefined,
    capital:         country.capital   != null ? String(country.capital)   : undefined,
    gdpCurrentUsd:   metrics.gdpCurrentUsd   != null ? Number(metrics.gdpCurrentUsd)   : undefined,
    gdpGrowthPct:    metrics.gdpGrowthPct    != null ? Number(metrics.gdpGrowthPct)    : undefined,
    populationTotal: metrics.populationTotal != null ? Number(metrics.populationTotal) : undefined,
    signalLevel:     signal.level != null ? String(signal.level) : undefined,
    sectors,
    meta: {
      accessTier:  String(meta.accessTier ?? 'public'),
      previewData: meta.previewData === true,
      sources:     Array.isArray(meta.sources)
                     ? (meta.sources as Array<{ key: string; name: string }>)
                     : [],
      generatedAt: meta.generatedAt != null ? String(meta.generatedAt) : undefined,
    },
  };
}
```

**Changes to fetch effects:**

```typescript
// BEFORE
const data = await response.json();
setCountryDetail1(data);

// AFTER
const data = await response.json();
setCountryDetail1(mapApiResponse(data));
```

The same change was applied to both the country 1 and country 2 fetch effects.

---

## 6. Test Cases

### Test Case 1: Angola + Guinea (seed data vs no seed data)

| Field | Angola (AGO) Expected | Guinea (GIN) Expected |
|-------|-----------------------|-----------------------|
| Name | Angola | Guinea |
| Capital | Luanda | Conakry |
| Region | Africa | Africa |
| GDP | $94.10B | N/A |
| GDP Growth | 2.8% | N/A |
| Population | 36.70M | N/A |
| Signal badge | Emerging (blue) | absent |
| Locked rows | 4 rows visible | 4 rows visible |
| Preview banner | Shown (meta.previewData) | Shown |

**Pass criteria:** Capital always displays. Metrics show N/A gracefully for Guinea (no seed data). No blank/undefined rendering.

---

### Test Case 2: Nigeria + Kenya (both seeded)

| Field | Nigeria (NGA) Expected | Kenya (KEN) Expected |
|-------|------------------------|----------------------|
| Capital | Abuja | Nairobi |
| GDP | $477.38B | $113.50B |
| GDP Growth | 3.3% | 5.3% |
| Population | 223.80M | 55.10M |
| Signal | Emerging | High Growth (emerald) |

**Pass criteria:** Both cards populated with numeric values. Signal badges display with distinct colors.

---

### Test Case 3: Partial-data country (Caribbean — no metrics seeded)

Example: **Jamaica (JAM)** or **Barbados (BRB)**

| Field | Expected |
|-------|----------|
| Capital | Kingston / Bridgetown |
| Region | Americas |
| GDP | N/A (no seed data) |
| GDP Growth | N/A |
| Population | N/A |
| Signal | absent |

**Pass criteria:** Identity fields display. Metrics show N/A without crash. No console errors. Locked rows still render.

---

### Test Case 4: Public unauthenticated user

**Setup:** Not logged in. Navigate to `/intelligence/compare`.

| Check | Expected |
|-------|----------|
| Page loads | ✅ |
| Dropdown populates | ✅ (74 countries) |
| Select Angola | GDP, growth, population display |
| `meta.accessTier` | `"public"` |
| Premium fields (FDI, inflation, FX) | Not returned, not displayed |
| Locked rows | All 4 visible |
| Upgrade CTA | Visible after any selection |

**Pass criteria:** No fields exposed beyond `headline_macro` entitlement. API does not return `fdiNetInflowsUsd` or similar.

---

### Test Case 5: Authenticated user (Explorer tier)

**Setup:** Log in as Explorer test user. Navigate to `/intelligence/compare`.

| Check | Expected |
|-------|----------|
| Same headline metrics | GDP, growth, population visible |
| `meta.accessTier` | `"explorer"` |
| Additional metric fields | Same as public (Explorer = same headline_macro) |
| Locked rows | All 4 still locked (premium features not yet unlocked) |

**Note:** Explorer tier currently has no additional visible fields compared to public for country-lite. Comparison feature upgrades (Professional, Business, Institutional) are planned for future phases.

---

## 7. Remaining Data Coverage Notes

### Countries with full seed data (20 total)
These countries will display GDP, Growth, Population, and Signal badge:

| ISO3 | Country | Region |
|------|---------|--------|
| AGO | Angola | Africa |
| BWA | Botswana | Africa |
| CIV | Côte d'Ivoire | Africa |
| COD | DR Congo | Africa |
| EGY | Egypt | Africa |
| ETH | Ethiopia | Africa |
| GHA | Ghana | Africa |
| KEN | Kenya | Africa |
| MAR | Morocco | Africa |
| MOZ | Mozambique | Africa |
| NAM | Namibia | Africa |
| NGA | Nigeria | Africa |
| RWA | Rwanda | Africa |
| SEN | Senegal | Africa |
| TUN | Tunisia | Africa |
| TZA | Tanzania | Africa |
| UGA | Uganda | Africa |
| ZAF | South Africa | Africa |
| ZMB | Zambia | Africa |
| ZWE | Zimbabwe | Africa |

### Countries with identity only (54 of 74 total)
These countries will display name, capital, region, flag — but metrics show N/A:
- All 34 non-priority African countries (e.g., Guinea, Burkina Faso, Eritrea)
- All 20 Caribbean countries (e.g., Jamaica, Trinidad and Tobago, Barbados)

### How to fix data coverage

**Option A — Run World Bank ingestion (recommended for all countries):**
```bash
npx tsx services/ingestion/run.ts worldbank
```
This populates `souvera_country_observations` for all registered countries from the World Bank API. Run once before pilot; requires `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`.

**Option B — Extend seed migration:**
Add additional `VALUES` rows to the observation block in `infra/supabase/sql-pack-v1.5-seed-africa-caribbean.sql` for Caribbean and remaining African countries. Use World Bank 2024 estimates.

**Option C — Accept current coverage for pilot:**
Clearly communicate in UI that 20 countries have curated preview data. The "Curated Preview Data" banner already covers this. N/A for metrics is an honest representation.

---

## 8. How to Verify in Browser

### Quick verification (no login required)

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/intelligence/compare`
3. In the first dropdown, select **Angola**
4. **Expected:** Card shows "Luanda" as capital, GDP ~$94.10B, Growth ~2.8%, Population ~36.70M, "Emerging" signal badge
5. In the second dropdown, select **Nigeria**
6. **Expected:** Card shows "Abuja", GDP ~$477.38B, Growth ~3.3%, Population ~223.80M, "Emerging" signal badge
7. Select **Guinea** in either slot
8. **Expected:** Card shows "Conakry" as capital; GDP, Growth, Population all show "N/A"
9. Select **Jamaica** in either slot
10. **Expected:** Card shows "Kingston"; all metrics show "N/A"
11. Open browser DevTools → Console → Confirm **no errors**
12. Open Network tab → Confirm `/api/v1/country-lite?iso3=AGO` returns HTTP 200

### Checking the Preview Data Banner

The preview banner appears when `meta.previewData === true`. The `/api/v1/country-lite` endpoint does not currently emit `previewData: true` in its `meta` block (the `/api/v1/countries` list endpoint does). Until that is added to country-lite, the banner will not appear on the compare page.

**To test banner manually:** In the Supabase SQL editor, or by temporarily modifying the route, verify `meta.previewData: true` is returned. The mapper in `CountryComparisonTool.tsx` correctly wires `meta.previewData` once the API returns it.

---

## 9. How to Verify API Directly

### In browser address bar (no auth required)
```
/api/v1/country-lite?iso3=AGO
/api/v1/country-lite?iso3=NGA
/api/v1/country-lite?iso3=GIN
/api/v1/country-lite?iso3=JAM
```

**What to check in the JSON response:**
- `country.capital` is populated for all countries (identity data always present)
- `metrics.gdpCurrentUsd` is a number for seeded countries, `null` for non-seeded
- `metrics.gdpGrowthPct` same
- `metrics.populationTotal` same
- `signal.level` is a string for seeded countries, `null` for non-seeded
- `meta.accessTier` is `"public"` when not authenticated

### Via curl
```bash
curl "http://localhost:3000/api/v1/country-lite?iso3=AGO" | jq .
curl "http://localhost:3000/api/v1/country-lite?iso3=GIN" | jq .
```

### SQL verification
Run the queries in `docs/qa/compare-data-verification.sql` via the Supabase SQL Editor to confirm:
- Countries exist in `souvera_countries`
- Indicators exist in `souvera_indicators`
- Observations exist in `souvera_country_observations` for the 20 seeded countries
- Views return expected data with correct column names

### Countries list endpoint
```
/api/v1/countries?region=africa
/api/v1/countries?region=caribbean
/api/v1/countries?region=all
```
Verify response includes `countries[]` array with `iso3`, `name`, `region` for dropdown population.

---

## Files Changed

| File | Change Type | Purpose |
|------|-------------|---------|
| `apps/api-gateway/src/components/intelligence/CountryComparisonTool.tsx` | Bug fix | Added `mapApiResponse()`, applied to both fetch effects |
| `docs/qa/compare-data-verification.sql` | New file | SQL queries to verify data path in Supabase |
| `docs/audits/compare-na-data-path-debug.md` | New file | Full root cause analysis report |
| `docs/qa/compare-tool-field-mapping-fix.md` | New file | This document |

---

## Build Verification

```
✅ npm run build
   @souvera/api-gateway: Compiled successfully in 52s
   ✓ TypeScript validation passed
   ✓ 75 pages generated
   /intelligence/compare: Static (prerendered)
   Tasks: 4 successful, 4 total
```

---

## Known Remaining Gap

`/api/v1/country-lite` does not emit `previewData: true` in its `meta` block. As a result, the "Curated Preview Data" amber banner on the compare page will not appear. The fix is a one-line addition to `country-lite/route.ts`:

```typescript
// In the meta block (country-lite/route.ts ~line 162):
meta: {
  product: 'souvera',
  owner: 'Afronovation, Inc.',
  accessTier: access.planId,
  authenticated: access.isAuthenticated,
  generatedAt: new Date().toISOString(),
  previewData: true,   // ← add this
  sources: [...],
},
```

This is tracked as a separate minor fix (Issue #1 from Phase 3A audit).
