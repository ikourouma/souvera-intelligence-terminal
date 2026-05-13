# Souvera Market Coverage Filtering
**Phase 3 — Intelligence Terminal Data Foundation**  
**Owner:** Afronovation, Inc.  
**Status:** Implemented  
**Date:** April 28, 2026

---

## Executive Summary

This document details Souvera's market coverage filtering implementation for Phase 3, ensuring public intelligence views show only approved mandate countries: **54 African countries** and **20 Caribbean markets/territories** (total: **74 markets**).

Market coverage filtering is enforced at two layers:
1. **API Level (Primary):** Filters data at source using mandate-scoped queries
2. **Frontend Level (Defensive):** Additional safety filtering for display

This implementation prevents non-mandate countries (e.g., USA, Canada, Mexico, Brazil, Europe, Asia, Oceania) from appearing in public intelligence views while preserving tiered access control.

---

## Approved Market Scope

### Africa: 54 Countries
All countries where `is_african_country = true` in the database.

**Includes all African nations** across:
- Northern Africa
- Western Africa
- Eastern Africa
- Central Africa
- Southern Africa

### Caribbean: 20 Markets/Territories

Approved Caribbean ISO3 list:

| ISO3 | Country/Territory |
|------|-------------------|
| ATG  | Antigua and Barbuda |
| BHS  | Bahamas |
| BRB  | Barbados |
| CUB  | Cuba |
| DMA  | Dominica |
| DOM  | Dominican Republic |
| GRD  | Grenada |
| HTI  | Haiti |
| JAM  | Jamaica |
| KNA  | Saint Kitts and Nevis |
| LCA  | Saint Lucia |
| VCT  | Saint Vincent and the Grenadines |
| SUR  | Suriname |
| TTO  | Trinidad and Tobago |
| GUY  | Guyana |
| BLZ  | Belize |
| PRI  | Puerto Rico |
| VGB  | British Virgin Islands |
| TCA  | Turks and Caicos Islands |
| CYM  | Cayman Islands |

**Note:** This list includes Guyana, Suriname, and Belize, which are geographically in South/Central America but are culturally and economically part of the Caribbean community.

### Excluded Regions
The following are **NOT** in current scope:
- ❌ USA, Canada, Mexico
- ❌ Brazil, Argentina, Chile, Colombia (South America except Guyana/Suriname)
- ❌ Central America (except Belize)
- ❌ Europe
- ❌ Asia
- ❌ Oceania
- ❌ Middle East (unless classified as African)

---

## Implementation Architecture

### 1. Shared Constants & Utilities

**File:** `apps/api-gateway/src/lib/market-coverage.ts`

**Exports:**
- `APPROVED_CARIBBEAN_ISO3` — Array of 20 approved Caribbean ISO3 codes
- `EXPECTED_MARKET_COUNTS` — Expected counts for QA verification
- `VALID_REGIONS` — Valid region filter values: `all`, `africa`, `caribbean`
- `isApprovedCaribbeanMarket(iso3)` — Check if ISO3 is approved Caribbean
- `isApprovedSouveraMarket(country)` — Check if country is in Souvera scope
- `normalizeRegionFilter(region)` — Normalize and validate region parameter
- `getRegionDescription(region)` — Get human-readable region description

**Purpose:**
- Single source of truth for market scope
- Used by both API and frontend
- Ensures consistency across layers

---

## 2. API-Level Filtering (Primary Enforcement)

**File:** `apps/api-gateway/src/app/api/v1/countries/route.ts`

**Endpoint:** `GET /api/v1/countries?region=africa|caribbean|all`

### Filter Logic by Region

#### `region=africa`
```typescript
// Query: countries where is_african_country = true
baseQuery.eq('is_african_country', true)
```
**Expected Count:** 54

#### `region=caribbean`
```typescript
// Query: countries where iso3 in APPROVED_CARIBBEAN_ISO3
baseQuery.in('iso3', APPROVED_CARIBBEAN_ISO3)
```
**Expected Count:** 20

#### `region=all`
```typescript
// Two parallel queries:
// 1. All African countries (is_african_country = true)
// 2. All approved Caribbean markets (iso3 in approved list)
// Then merge, deduplicate by iso3, and sort by name
```
**Expected Count:** 74

### Key Features
- ✅ Enforces mandate scope at database query level
- ✅ Uses two separate queries for `region=all` to avoid complex `.or()` syntax
- ✅ Deduplicates results by ISO3 in case of overlap
- ✅ Preserves entitlement-aware view selection
- ✅ Returns empty array with metadata if no results (no errors)
- ✅ Does not expose raw Supabase errors to client

### Error Handling
- Invalid region → 400 response with valid options
- Query errors → 500 response with generic message
- Empty results → 200 response with empty array and metadata

---

## 3. Frontend Defensive Filtering (Safety Layer)

### IntelligenceMapClient
**File:** `apps/api-gateway/src/components/intelligence/IntelligenceMapClient.tsx`

**Filter Logic:**
```typescript
const approvedCountries = (data.countries || []).filter(country =>
  isApprovedSouveraMarket({
    iso3: country.iso3,
    isAfricanCountry: country.isAfricanCountry,
  })
);
```

**Purpose:** Additional safety filter for display. Should be redundant if API is working correctly.

### MarketGrid
**File:** `apps/api-gateway/src/components/intelligence/MarketGrid.tsx`

**Filter Logic:**
```typescript
// Defensive filter: only show approved Souvera markets
filtered = filtered.filter(country =>
  isApprovedSouveraMarket({
    iso3: country.iso3,
    isAfricanCountry: country.isAfricanCountry,
  })
);

// Region-specific filtering
if (regionFilter === 'Africa') {
  filtered = filtered.filter(c => c.isAfricanCountry === true);
} else if (regionFilter === 'Caribbean') {
  filtered = filtered.filter(c => isApprovedCaribbeanMarket(c.iso3));
}
```

**Purpose:**
- Additional display safety layer
- Handles region-specific filtering in UI
- Works with search and collapsed grid

---

## 4. Collapsed Grid (3-Row Default)

**Implementation:** `MarketGrid.tsx`

### Behavior

#### Default State (Collapsed)
- Shows first **12 cards** (3 rows × 4 columns on desktop)
- Displays count: "Showing 12 of 74 markets"
- Shows button: "Show all markets" with down arrow

#### Expanded State
- Shows all filtered results
- Displays count: "Showing 74 of 74 markets"
- Shows button: "Show fewer" with up arrow

#### Search Mode
- **Always shows all matching results**
- Does not hide valid search results due to collapsed state
- Count shows: "Found X countries"
- Expand/collapse button is hidden during search

#### Small Result Sets
- If `filteredCountries.length <= 12`, expand button is hidden
- All results shown by default

#### Empty State
- Message: "No approved Souvera markets match this filter."
- Or: "No approved Souvera markets match this search."

### Grid Responsiveness
```css
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns
- Wide: 4 columns

---

## 5. Page-Specific Behavior

### `/intelligence/map`
- **Default filter:** All Regions
- **Available filters:** All Regions, Africa, Caribbean
- **All Regions = 74 markets** (Africa + Caribbean only)
- ✅ Shows collapsed grid (12 cards default)
- ✅ Search shows all matches
- ✅ Expand/collapse button visible

### `/intelligence/africa`
- **Region:** `africa`
- **Count:** 54 African countries only
- **Filters:** All Regions, Africa, Caribbean (but defaults to Africa)
- ✅ Shows collapsed grid if > 12 countries
- ✅ No USA, Canada, or Caribbean countries

### `/intelligence/caribbean`
- **Region:** `caribbean`
- **Count:** 20 Caribbean markets only
- **Filters:** All Regions, Africa, Caribbean (but defaults to Caribbean)
- ✅ Shows collapsed grid if > 12 markets
- ✅ No broader Americas countries (USA, Canada, Mexico, Brazil, Argentina)
- ✅ Only approved Caribbean ISO3 list

---

## Expected Counts by Region

| Region Filter | Expected Count | Description |
|---------------|----------------|-------------|
| `all`         | 74             | 54 African + 20 Caribbean |
| `africa`      | 54             | African countries only |
| `caribbean`   | 20             | Approved Caribbean markets |

---

## QA Checklist

### API Testing

Run these API calls and verify counts:

```bash
# Test API endpoints
GET /api/v1/countries?region=all
# Expected: 74 countries

GET /api/v1/countries?region=africa
# Expected: 54 countries

GET /api/v1/countries?region=caribbean
# Expected: 20 countries
```

**Verify Response Structure:**
- ✅ `countries` array present
- ✅ `meta.count` matches array length
- ✅ `meta.region` matches query parameter
- ✅ `meta.previewData` is `true`
- ✅ `meta.accessTier` is set correctly
- ✅ No USA, Canada, Mexico, Brazil, Argentina
- ✅ No Europe, Asia, Oceania countries

### Frontend Testing

#### `/intelligence/map`
- ✅ Page loads without errors
- ✅ Shows 12 cards by default (collapsed grid)
- ✅ Count shows "Showing 12 of 74 markets"
- ✅ "Show all markets" button visible
- ✅ Clicking button expands to show all 74 markets
- ✅ Button changes to "Show fewer" with up arrow
- ✅ Clicking again collapses back to 12 cards
- ✅ Search shows all matching results (ignores collapsed state)
- ✅ Search count shows "Found X countries"
- ✅ Region filters work: All Regions, Africa, Caribbean
- ✅ No USA, Canada, Mexico visible in any filter
- ✅ No Europe, Asia, Oceania visible

#### `/intelligence/africa`
- ✅ Page loads without errors
- ✅ Shows 12 cards by default (collapsed grid)
- ✅ Count shows "Showing 12 of 54 markets"
- ✅ Only African countries visible
- ✅ No Caribbean, USA, Canada, Mexico, or other regions
- ✅ Region filter defaults to "Africa"
- ✅ Expand button shows all 54 African countries

#### `/intelligence/caribbean`
- ✅ Page loads without errors
- ✅ Shows 12 cards by default (collapsed grid)
- ✅ Count shows "Showing 12 of 20 markets"
- ✅ Only approved Caribbean markets visible (from ISO3 list)
- ✅ No USA, Canada, Mexico, Brazil, Argentina
- ✅ No broader Americas countries
- ✅ Guyana, Suriname, Belize included (approved)
- ✅ Region filter defaults to "Caribbean"
- ✅ Expand button shows all 20 Caribbean markets

### Search Behavior
- ✅ Searching shows all matching results
- ✅ Expand/collapse button hidden during search
- ✅ Count shows "Found X countries"
- ✅ Clearing search restores collapsed state
- ✅ Search works with region filters

### Empty State Testing
- ✅ If region filter excludes all results, show: "No approved Souvera markets match this filter."
- ✅ If search returns no results, show: "No approved Souvera markets match this search."

### Build & Lint
```bash
# From workspace root
npm run build
npm run lint
npm run typecheck
```
- ✅ Build passes
- ✅ No linter errors
- ✅ No TypeScript errors

---

## Exclusion Verification

### Countries That Must NOT Appear

Run searches for these countries and verify they return no results:

- ❌ USA (United States)
- ❌ Canada
- ❌ Mexico
- ❌ Brazil
- ❌ Argentina
- ❌ United Kingdom
- ❌ France (except if classified as African territory)
- ❌ Germany
- ❌ China
- ❌ Japan
- ❌ Australia
- ❌ New Zealand

### Valid Edge Cases

These **should** appear (verify they are included):

- ✅ Guyana (Caribbean approved, even though South America)
- ✅ Suriname (Caribbean approved, even though South America)
- ✅ Belize (Caribbean approved, even though Central America)
- ✅ Puerto Rico (Caribbean approved, US territory)
- ✅ British Virgin Islands (Caribbean approved, UK territory)
- ✅ Cayman Islands (Caribbean approved, UK territory)
- ✅ Turks and Caicos Islands (Caribbean approved, UK territory)

---

## Database Considerations

### Current State
- Database may contain non-mandate countries due to REST Countries ingestion
- **These records are NOT deleted in this phase**
- API filtering prevents non-mandate countries from appearing in public views

### Future Cleanup (Phase 4+)
- Optional: Run cleanup script to remove non-mandate countries from database
- Optional: Add database constraints to prevent insertion of non-mandate countries
- Ingestion adapters should be updated to only insert approved markets

### Data Integrity
- Current filtering is **non-destructive**
- All database records remain intact
- API is the enforcement layer

---

## Files Modified

### Core Implementation
- ✅ `apps/api-gateway/src/lib/market-coverage.ts` — New shared constants & utilities
- ✅ `apps/api-gateway/src/app/api/v1/countries/route.ts` — API filtering logic
- ✅ `apps/api-gateway/src/components/intelligence/IntelligenceMapClient.tsx` — Defensive filter
- ✅ `apps/api-gateway/src/components/intelligence/MarketGrid.tsx` — Defensive filter + collapsed grid
- ✅ `apps/api-gateway/src/components/regional/RegionalMarketGrid.tsx` — No changes needed (uses IntelligenceMapClient)

### Documentation
- ✅ `docs/qa/market-coverage-filtering.md` — This document

---

## Rollout Notes

### No Breaking Changes
- ✅ Existing authenticated users not affected
- ✅ Entitlement system unchanged
- ✅ Database schema unchanged
- ✅ API response format unchanged

### Behavior Changes
- **Before:** `/api/v1/countries?region=all` returned all countries in database (potentially 190+)
- **After:** `/api/v1/countries?region=all` returns only 74 approved markets

- **Before:** `/api/v1/countries?region=caribbean` returned all countries in Americas (USA, Canada, Mexico, Brazil, etc.)
- **After:** `/api/v1/countries?region=caribbean` returns only 20 approved Caribbean markets

- **Before:** Market grids showed all results
- **After:** Market grids show 12 cards by default with expand/collapse

### Monitoring
- Monitor `/api/v1/countries` endpoint for unexpected counts
- Monitor frontend for display issues or empty states
- Verify user feedback aligns with new scope

---

## Support & Troubleshooting

### Issue: Wrong country count returned
**Diagnosis:**
- Check API response: `/api/v1/countries?region=all`
- Verify `meta.count` field
- Expected: 74

**Possible Causes:**
- Database seed data missing or incomplete
- API filtering logic error
- Frontend defensive filter too aggressive

**Resolution:**
- Re-run seed data script: `infra/supabase/sql-pack-v1.5-seed-africa-caribbean.sql`
- Check database view: `souvera_country_lite_v`
- Verify `is_african_country` flags

### Issue: Non-mandate countries appearing
**Diagnosis:**
- Which page? `/intelligence/map`, `/intelligence/africa`, `/intelligence/caribbean`?
- Which country ISO3?
- Check if country is in API response or filtered out by frontend

**Possible Causes:**
- API filtering not applied correctly
- Frontend defensive filter disabled or broken
- Country misclassified in database

**Resolution:**
- Verify `APPROVED_CARIBBEAN_ISO3` list in `market-coverage.ts`
- Check database: `SELECT iso3, name, is_african_country FROM souvera_countries WHERE iso3 = 'XXX';`
- Update country classification if needed

### Issue: Collapsed grid not working
**Diagnosis:**
- Does page show all results immediately?
- Is expand/collapse button visible?
- Check browser console for errors

**Possible Causes:**
- Search query active (button hidden during search)
- Result count <= 12 (button hidden)
- Frontend state error

**Resolution:**
- Clear search query
- Check `filteredCountries.length`
- Verify `isExpanded` state in React DevTools

### Issue: Search not showing results
**Diagnosis:**
- What search term?
- Does country exist in API response?
- Is country in approved scope?

**Resolution:**
- Verify country is in approved mandate (Africa or Caribbean list)
- Check API response includes country
- Check frontend defensive filter not removing country

---

## Approved By
- **Technical Lead:** [Pending]
- **Product Owner:** [Pending]
- **QA Lead:** [Pending]

---

## Revision History
- **v1.0** — April 28, 2026 — Initial implementation (Phase 3)
