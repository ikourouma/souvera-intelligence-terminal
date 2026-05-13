# Souvera Intelligence Terminal — Issues & Solutions Knowledgebase
**Owner:** Afronovation, Inc.  
**Purpose:** Track all platform issues, root causes, and solutions to reduce dev time and tokens  
**Last Updated:** April 29, 2026

---

## How to Use This Knowledgebase

1. **Before solving an issue:** Search this document first
2. **Issue not found?** Solve it, then document it here
3. **Keep it updated:** Add new issues as they arise
4. **Reference liberally:** Link to specific issue IDs in commit messages

---

## Issue Categories

- [API Issues](#api-issues)
- [Frontend Issues](#frontend-issues)
- [Database Issues](#database-issues)
- [UI/UX Issues](#uiux-issues)
- [Authentication Issues](#authentication-issues)
- [Performance Issues](#performance-issues)

---

## API Issues

### API-001: Missing `isAfricanCountry` Field in Response
**Date:** April 28, 2026  
**Severity:** Critical  
**Status:** ✅ Fixed

**Symptoms:**
- `/intelligence/map` showing no countries
- `/intelligence/africa` showing no countries
- `/intelligence/caribbean` showing only Caribbean countries (African countries missing)
- Frontend defensive filter rejecting all African countries

**Root Cause:**
API queried `is_african_country` from database but didn't include it in response transformation:

```typescript
// ❌ BEFORE (Line ~163-180 in route.ts)
const transformedCountries = (countries || []).map((c: Record<string, unknown>) => ({
  iso2: c.iso2,
  iso3: c.iso3,
  name: c.name,
  // ... other fields
  // Missing: isAfricanCountry: c.is_african_country
}));
```

Frontend filter relied on this field:
```typescript
const approvedCountries = (data.countries || []).filter(country =>
  isApprovedSouveraMarket({
    iso3: country.iso3,
    isAfricanCountry: country.isAfricanCountry, // ← Always undefined!
  })
);
```

**Solution:**
Added missing field to API response transformation:

```typescript
// ✅ AFTER
const transformedCountries = (countries || []).map((c: Record<string, unknown>) => ({
  iso2: c.iso2,
  iso3: c.iso3,
  name: c.name,
  // ... other fields
  isAfricanCountry: c.is_african_country ?? false, // ✅ Added
}));
```

**Files Modified:**
- `apps/api-gateway/src/app/api/v1/countries/route.ts`

**Prevention:**
- Use TypeScript interfaces that require all fields
- Add integration tests that verify API response shape
- Add field mapping validation in API response transformation

---

### API-002: Compare Page Needs Global Country Coverage
**Date:** April 28, 2026  
**Severity:** Medium  
**Status:** ✅ Fixed

**Symptoms:**
- `/intelligence/compare` dropdown fields showing no countries
- Compare tool fetching only 74 mandate-scoped countries

**Root Cause:**
Compare page needs worldwide coverage (~190+ countries) but API only returned mandate-scoped markets (54 African + 20 Caribbean).

**Solution:**
Added `scope` parameter to API endpoint:

```typescript
// Mandate scope (default): 74 approved markets
GET /api/v1/countries?region=all

// Global scope: All countries worldwide
GET /api/v1/countries?region=all&scope=global
```

Updated compare tool:
```typescript
// ✅ AFTER
const response = await fetch('/api/v1/countries?region=all&scope=global');
```

**Files Modified:**
- `apps/api-gateway/src/app/api/v1/countries/route.ts`
- `apps/api-gateway/src/components/intelligence/CountryComparisonTool.tsx`

**Prevention:**
- Document API parameter options clearly
- Consider creating separate endpoints for different use cases

---

## Frontend Issues

### FE-001: Regional Pages Showing Confusing Filters
**Date:** April 28, 2026  
**Severity:** Low  
**Status:** ✅ Fixed

**Symptoms:**
- `/intelligence/africa` showing "All Regions", "Africa", "Caribbean" filters
- "Caribbean" filter returning 0 countries (data was never fetched)
- User confusion: Why have filters if data isn't available?

**Root Cause:**
Regional pages fetch region-specific data (`region=africa`) but show all three filter buttons. Filters try to filter data that was never fetched.

**Solution:**
Conditionally show region filters only on `/intelligence/map`:

```typescript
// Pass showRegionFilters based on defaultRegion
<MarketGrid 
  countries={countries}
  onCountryClick={handleCountryClick}
  showRegionFilters={defaultRegion === 'all'}  // Only show on 'all' regions view
/>
```

**Files Modified:**
- `apps/api-gateway/src/components/intelligence/MarketGrid.tsx`
- `apps/api-gateway/src/components/intelligence/IntelligenceMapClient.tsx`

**Prevention:**
- Design UX for what data is actually available
- Hide controls that won't work given current data scope

---

### FE-002: Search Field Missing Clear (X) Button
**Date:** April 29, 2026  
**Severity:** Low  
**Status:** ✅ Fixed

**Symptoms:**
- Users have to manually delete search text
- No quick way to reset search
- Inconsistent with modern UX patterns

**Root Cause:**
Search input has no clear button implemented.

**Solution:**
Added conditional clear button that appears when search has content:

```typescript
<div className="flex-1 relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
  <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-12 pr-10 py-3 ..."  // Changed pr-4 to pr-10 for button space
  />
  {searchQuery && (
    <button
      onClick={() => setSearchQuery('')}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
    >
      <X className="w-4 h-4" />
    </button>
  )}
</div>
```

**Files Modified:**
- `apps/api-gateway/src/components/intelligence/MarketGrid.tsx`
- All other components with search fields (apply same pattern)

**Prevention:**
- Add clear button to search input component library
- Use consistent search component across all pages

---

### FE-003: Population Formatting Missing Thousands (K)
**Date:** April 29, 2026  
**Severity:** Low  
**Status:** ✅ Fixed

**Symptoms:**
- Saint Kitts and Nevis showing raw "46,843" instead of "46.8K"
- Small countries (Dominica, Seychelles) not showing population on cards
- Inconsistent number formatting

**Root Cause:**
Population formatting functions only handled Billions (B) and Millions (M), not Thousands (K):

```typescript
// ❌ BEFORE
const formatPopulation = (pop?: number) => {
  if (!pop) return null;
  if (pop >= 1e9) return `${(pop / 1e9).toFixed(2)}B`;
  if (pop >= 1e6) return `${(pop / 1e6).toFixed(1)}M`;
  return null;  // ❌ Returns null for values < 1M (not displayed)
};
```

**Solution:**
Added thousands (K) formatting:

```typescript
// ✅ AFTER
const formatPopulation = (pop?: number) => {
  if (!pop) return null;
  if (pop >= 1e9) return `${(pop / 1e9).toFixed(2)}B`;
  if (pop >= 1e6) return `${(pop / 1e6).toFixed(1)}M`;
  if (pop >= 1e3) return `${(pop / 1e3).toFixed(1)}K`;  // ✅ Added
  return pop.toString();  // For values < 1,000
};
```

**Files Modified:**
- `apps/api-gateway/src/components/intelligence/MarketGrid.tsx` — `formatPopulation()`
- `apps/api-gateway/src/components/intelligence/CountryDrawer.tsx` — `formatNumber()`
- `apps/api-gateway/src/components/intelligence/CountryComparisonTool.tsx` — `formatNumber()`

**Prevention:**
- Create shared formatting utilities in `apps/api-gateway/src/lib/formatters.ts`
- Use consistent formatting across all components
- Test with small-population countries (Caribbean islands)

---

### FE-004: Regional Pulse Showing "NaN%" Growth Rates
**Date:** April 28, 2026  
**Severity:** Medium  
**Status:** ✅ Fixed

**Symptoms:**
- `/intelligence/africa` Regional Pulse section showing "NaN%" for average growth
- Metrics looking unprofessional

**Root Cause:**
API doesn't return `gdpGrowthPct` field, but component tried to aggregate it:

```typescript
const growthRates = countries.map((c: any) => c.gdpGrowthPct).filter((g: any) => g !== null);
const avgGrowth = growthRates.length > 0
  ? (growthRates.reduce((sum: number, g: number) => sum + g, 0) / growthRates.length).toFixed(1)
  : null;
```

Values were `undefined` (not `null`), so they passed the filter and caused `NaN` when summed.

**Solution:**
Replaced dynamic aggregation with curated static content (Economic Corridors Grid):

- Removed `SubregionPulseGrid.tsx` (dynamic aggregation)
- Created `EconomicCorridorsGrid.tsx` (curated content)
- Fortune-5 level design with executive narratives, sector tags, strategic metrics

**Files Modified:**
- Created: `apps/api-gateway/src/components/regional/EconomicCorridorsGrid.tsx`
- Modified: `apps/api-gateway/src/app/intelligence/africa/page.tsx`

**Prevention:**
- Prefer curated content over dynamic aggregation for executive-grade presentation
- If using dynamic data, ensure all required fields exist in API
- Add proper null/undefined checks: `!= null` catches both

---

## Database Issues

### DB-001: Database View Column Order Mismatch
**Date:** April 28, 2026 (earlier)  
**Severity:** Critical  
**Status:** ✅ Fixed

**Symptoms:**
- SQL error: "cannot change name of view column"
- API endpoint failing to return data
- 500 errors on `/api/v1/countries`

**Root Cause:**
PostgreSQL doesn't allow changing view column order/names with `CREATE OR REPLACE VIEW`. Original views lacked `lat`, `lng`, `is_african_country`, `is_active`.

**Solution:**
Used `DROP VIEW IF EXISTS ... CASCADE` then `CREATE VIEW`:

```sql
-- Drop in reverse dependency order
DROP VIEW IF EXISTS souvera_country_lite_v CASCADE;
DROP VIEW IF EXISTS souvera_country_professional_v CASCADE;
DROP VIEW IF EXISTS souvera_country_business_v CASCADE;

-- Recreate with all columns explicitly listed
CREATE VIEW souvera_country_lite_v AS
SELECT 
  iso2, iso3, name, region, subregion, capital,
  flag_svg_url, lat, lng,  -- Added
  gdp_current_usd, population_total,
  signal_level, freshness_at,
  is_african_country, is_active  -- Added
FROM souvera_countries;
```

**Files Modified:**
- `infra/supabase/sql-pack-v1.6-view-fix.sql`

**Prevention:**
- Always explicitly list all columns in views
- Drop and recreate views for schema changes (don't use OR REPLACE)
- Run SQL scripts in development first
- Have rollback scripts ready

---

## UI/UX Issues

### UX-001: Non-Mandate Countries Appearing in Intelligence Views
**Date:** April 28, 2026  
**Severity:** High  
**Status:** ✅ Fixed

**Symptoms:**
- USA, Canada, Mexico, Brazil appearing in intelligence views
- Non-mandate countries visible to public users

**Root Cause:**
- REST Countries ingestion inserted all global countries
- `/api/v1/countries?region=all` applied no filter
- `/api/v1/countries?region=caribbean` filtered by `region = Americas` (too broad)

**Solution:**
Implemented mandate-scoped filtering:

```typescript
// Africa only
if (region === 'africa') {
  query.eq('is_african_country', true);
}

// Caribbean only: Use approved ISO3 list
else if (region === 'caribbean') {
  query.in('iso3', APPROVED_CARIBBEAN_ISO3);
}

// All: African + approved Caribbean
else if (region === 'all') {
  // Two parallel queries, merge and deduplicate
}
```

**Files Modified:**
- Created: `apps/api-gateway/src/lib/market-coverage.ts`
- Modified: `apps/api-gateway/src/app/api/v1/countries/route.ts`
- Added frontend defensive filters in `IntelligenceMapClient.tsx`, `MarketGrid.tsx`

**Prevention:**
- Define mandate scope in shared constants
- Enforce filtering at API level (primary)
- Add defensive frontend filters (safety layer)
- Document approved markets clearly

---

## Authentication Issues

_No issues documented yet. Add authentication-related issues here._

---

## Performance Issues

_No issues documented yet. Add performance-related issues here._

---

## Common Patterns & Solutions

### Pattern: Missing Field in API Response

**Symptoms:** Frontend shows N/A, undefined, or null for a field that exists in database

**Debugging Steps:**
1. Check API response transformation (usually in `route.ts`)
2. Verify field is queried from database (`.select()` statement)
3. Check if field is included in response mapping
4. Check camelCase conversion (DB: `snake_case`, API: `camelCase`)

**Solution Template:**
```typescript
// In API route transformation
const transformedData = data.map((item: Record<string, unknown>) => ({
  // ... other fields
  yourField: item.your_field ?? defaultValue,  // Add missing field
}));
```

---

### Pattern: NaN in Calculated Metrics

**Symptoms:** UI shows "NaN", "NaN%", or calculations fail

**Debugging Steps:**
1. Check if data source field exists (`undefined` vs `null`)
2. Verify filter logic (`.filter(x => x !== null)` misses `undefined`)
3. Check calculation logic (summing undefined values)

**Solution Template:**
```typescript
// ❌ BAD: Only filters null
const values = data.map(d => d.field).filter(v => v !== null);

// ✅ GOOD: Filters both null and undefined
const values = data.map(d => d.field).filter(v => v != null);

// ✅ BETTER: Type-safe filter
const values = data.map(d => d.field).filter((v): v is number => typeof v === 'number');
```

---

### Pattern: Number Formatting Inconsistencies

**Symptoms:** Some numbers show raw values, others formatted; K/M/B missing

**Debugging Steps:**
1. Check formatting function
2. Verify all scale thresholds (B, M, K, raw)
3. Test with edge cases (small countries, large economies)

**Solution Template:**
```typescript
export function formatNumber(value?: number): string | null {
  if (!value) return null;
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;  // Don't forget K!
  return `$${value.toString()}`;
}
```

**Best Practice:** Create shared utility in `apps/api-gateway/src/lib/formatters.ts`

---

### Pattern: Conditional UI Elements Not Hiding

**Symptoms:** Filter buttons, controls visible when they shouldn't be

**Debugging Steps:**
1. Check component prop logic
2. Verify conditional rendering (`{condition && <Component />}`)
3. Check parent component passing correct props

**Solution Template:**
```typescript
// In parent component
<ChildComponent showFilters={dataScope === 'all'} />

// In child component
{showFilters && (
  <div>
    {/* Filter buttons */}
  </div>
)}
```

---

## Quick Reference: File Locations

### API Endpoints
- Countries list: `apps/api-gateway/src/app/api/v1/countries/route.ts`
- Country details: `apps/api-gateway/src/app/api/v1/country-lite/route.ts`

### Frontend Components
- Intelligence map: `apps/api-gateway/src/components/intelligence/IntelligenceMapClient.tsx`
- Market grid: `apps/api-gateway/src/components/intelligence/MarketGrid.tsx`
- Country drawer: `apps/api-gateway/src/components/intelligence/CountryDrawer.tsx`
- Compare tool: `apps/api-gateway/src/components/intelligence/CountryComparisonTool.tsx`
- Regional grids: `apps/api-gateway/src/components/regional/`

### Shared Utilities
- Market coverage: `apps/api-gateway/src/lib/market-coverage.ts`
- Formatters: `apps/api-gateway/src/lib/formatters.ts` (create if needed)

### Database
- SQL migrations: `infra/supabase/`
- Seed data: `infra/supabase/sql-pack-v1.5-seed-africa-caribbean.sql`

---

## Contributing to This Knowledgebase

### When to Add an Issue

Add an issue when:
- ✅ You encounter a bug or unexpected behavior
- ✅ The issue took more than 30 minutes to debug
- ✅ The issue is likely to recur (common pattern)
- ✅ The solution has reusable patterns

Don't add:
- ❌ Typos or one-line fixes
- ❌ Issues specific to local dev environment
- ❌ Intentional technical debt (track in separate doc)

### Issue Entry Template

```markdown
### CATEGORY-###: Short Issue Title
**Date:** YYYY-MM-DD  
**Severity:** Critical | High | Medium | Low  
**Status:** ✅ Fixed | 🚧 In Progress | ⏳ Pending

**Symptoms:**
- Bullet list of observable issues
- What users see/experience

**Root Cause:**
Detailed explanation of why the issue occurred.

[Optional code block showing problematic code]

**Solution:**
Explanation of the fix.

[Code block showing corrected code]

**Files Modified:**
- `path/to/file1.ts`
- `path/to/file2.tsx`

**Prevention:**
- How to avoid this issue in future
- Best practices to follow
```

### Severity Definitions

- **Critical:** Platform down, data loss, security vulnerability
- **High:** Major feature broken, poor UX, data integrity issue
- **Medium:** Minor feature broken, visual bugs, performance issue
- **Low:** UI polish, nice-to-have improvements

---

## Maintenance

### Review Schedule
- **Weekly:** Review new issues added, consolidate duplicates
- **Monthly:** Update common patterns, add cross-references
- **Quarterly:** Archive resolved issues older than 6 months

### Document Owner
- Primary: Engineering Lead
- Contributors: All team members

---

**End of Knowledgebase**  
*Keep this document updated as the single source of truth for platform issues.*
