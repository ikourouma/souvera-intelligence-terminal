# FDI N/A Data Path Debug Report

**Date**: 2026-05-02  
**Status**: Root Cause Identified  
**Priority**: P1 — FDI Feature Incomplete  
**Owner**: Engineering Team

---

## Executive Summary

FDI (Foreign Direct Investment) displays as "N/A" for Professional, Business, and Institutional users after tier resolution was fixed. The investigation confirms that all code, views, and entitlements are correctly implemented. **Root cause: FDI data was never seeded and the World Bank ingestion adapter does not yet include FDI.**

### Key Finding

| Layer | Status | Evidence |
|-------|--------|----------|
| **1. Indicator Definition** | ✅ Correct | `fdi_net_inflows_usd` exists in `souvera_indicators` |
| **2. View Definition** | ✅ Correct | `souvera_country_professional_v` includes `fdi_net_inflows_usd` column |
| **3. Entitlement Logic** | ✅ Correct | `professional` tier has `full_macro` entitlement |
| **4. Data View Selection** | ✅ Correct | `getDataView()` returns `souvera_country_professional_v` for Professional |
| **5. API Logic** | ✅ Correct | Includes `fdiNetInflowsUsd` when user has `full_macro` |
| **6. Frontend Display** | ✅ Correct | Shows "N/A" when value is `null`/`undefined` |
| **7. Seed Data** | ❌ **MISSING** | Only GDP, GDP Growth, Population seeded; FDI not seeded |
| **8. Ingestion Adapter** | ❌ **MISSING** | World Bank adapter only ingests 3 indicators, not FDI |

---

## Current Entitlement Status

### Tier Resolution: ✅ FIXED

After applying SQL Pack v1.10, tier resolution is working correctly:

| User | Account Menu | /api/v1/me | FDI Access Entitlement | FDI Value |
|------|--------------|------------|------------------------|-----------|
| explorer@afronovation.com | Explorer Plan | `tier: "explorer"` | ❌ Locked | N/A (locked) |
| professional@afronovation.com | **Professional Plan** | `tier: "professional"` | ✅ Unlocked | **N/A (missing data)** |
| business@afronovation.com | **Business Plan** | `tier: "business"` | ✅ Unlocked | **N/A (missing data)** |
| institutional@afronovation.com | **Institutional Plan** | `tier: "institutional"` | ✅ Unlocked | **N/A (missing data)** |

**Observation**: Professional+ users correctly see FDI unlocked, but display "N/A" because no FDI data exists in the database.

---

## Data Path Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ External Source: World Bank API                                 │
│ Indicator Code: BX.KLT.DINV.CD.WD (FDI Net Inflows % GDP)      │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ MISSING: World Bank Adapter                                      │
│ Location: services/ingestion/worldbank.ts                        │
│ Issue: FDI indicator not in INDICATORS array                     │
│ Current: Only GDP, GDP Growth, Population                        │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ MISSING: Seed Data                                               │
│ Location: infra/supabase/sql-pack-v1.5-seed-africa-caribbean.sql│
│ Issue: Lines 198-313 only seed 3 indicators                     │
│ Missing: FDI observations for priority countries                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ Database: souvera_country_observations                           │
│ Status: No FDI observations exist                                │
│ Query Result: 0 rows WHERE indicator_key = 'fdi_net_inflows_usd'│
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ ✅ View: souvera_country_professional_v                          │
│ SQL Logic: max(case when l.indicator_key = 'fdi_net_inflows_usd'│
│            then l.value_numeric end) as fdi_net_inflows_usd      │
│ Result: NULL (no observation to pivot)                           │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ ✅ API: /api/v1/country-lite?iso3=NGA                            │
│ Entitlement Check: hasEntitlement(access, 'full_macro') → TRUE  │
│ Data Selection: countryData.fdi_net_inflows_usd → NULL          │
│ Response: { fdiNetInflowsUsd: undefined }                        │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ ✅ Frontend: EntitledMetricCard                                  │
│ Props: value={data.metrics.fdiNetInflowsUsd}, locked={false}    │
│ Display Logic: if (value === null || undefined) return 'N/A'    │
│ Result: Shows "N/A"                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Findings

### SQL Verification Queries

**1. Check FDI Indicator Definition**

```sql
SELECT id, key, name, min_access_tier
FROM souvera_indicators
WHERE key = 'fdi_net_inflows_usd';
```

**Result**: ✅ 1 row returned
```
| id                                   | key                    | name                  | min_access_tier |
|--------------------------------------|------------------------|-----------------------|-----------------|
| <uuid>                               | fdi_net_inflows_usd    | FDI Net Inflows US$   | professional    |
```

**2. Check FDI Observations Exist**

```sql
SELECT COUNT(*) as fdi_observation_count
FROM souvera_country_observations o
JOIN souvera_indicators i ON i.id = o.indicator_id
WHERE i.key = 'fdi_net_inflows_usd';
```

**Result**: ❌ 0 observations
```
| fdi_observation_count |
|-----------------------|
| 0                     |
```

**3. Check Nigeria FDI in Professional View**

```sql
SELECT iso3, name, fdi_net_inflows_usd
FROM souvera_country_professional_v
WHERE iso3 = 'NGA';
```

**Result**: ❌ NULL
```
| iso3 | name    | fdi_net_inflows_usd |
|------|---------|---------------------|
| NGA  | Nigeria | NULL                |
```

**4. Check What Indicators Have Data for Nigeria**

```sql
SELECT i.key, o.value_numeric, o.period_date
FROM souvera_country_observations o
JOIN souvera_indicators i ON i.id = o.indicator_id
JOIN souvera_countries c ON c.id = o.country_id
WHERE c.iso3 = 'NGA'
ORDER BY i.key;
```

**Result**: ✅ Only 3 indicators seeded
```
| key              | value_numeric | period_date |
|------------------|---------------|-------------|
| gdp_current_usd  | 477380000000  | 2024-12-31  |
| gdp_growth_pct   | 3.25          | 2024-12-31  |
| population_total | 223800000     | 2024-12-31  |
```

**5. Compare All Indicators' Data Coverage**

```sql
SELECT 
  i.key, 
  COUNT(o.id) as observation_count
FROM souvera_indicators i
LEFT JOIN souvera_country_observations o ON o.indicator_id = i.id
WHERE i.key IN ('gdp_current_usd', 'gdp_growth_pct', 'population_total', 'fdi_net_inflows_usd')
GROUP BY i.key
ORDER BY i.key;
```

**Result**:
```
| key                    | observation_count |
|------------------------|-------------------|
| fdi_net_inflows_usd    | 0                 |
| gdp_current_usd        | 60                |
| gdp_growth_pct         | 60                |
| population_total       | 60                |
```

---

## View Findings

### Professional View Pivot Logic

**File**: `infra/supabase/sql-pack-v1.6-view-fix.sql` (Line 115)

```sql
CREATE VIEW public.souvera_country_professional_v AS
SELECT
  lite.country_id,
  lite.iso2,
  lite.iso3,
  -- ... other columns ...
  max(case when l.indicator_key = 'fdi_net_inflows_usd' then l.value_numeric end) as fdi_net_inflows_usd,
  -- ...
FROM public.souvera_country_lite_v lite
LEFT JOIN public.souvera_latest_observations_v l ON l.country_id = lite.country_id
-- ...
```

**Analysis**: ✅ View logic is correct. The `max(case when ...)` pivot pattern correctly attempts to extract `fdi_net_inflows_usd` from observations. Since no FDI observations exist, the result is `NULL`.

---

## API Response Findings

### Entitlement Check

**File**: `apps/api-gateway/src/app/api/v1/country-lite/route.ts` (Lines 122-125)

```typescript
metrics: {
  gdpCurrentUsd: countryData.gdp_current_usd ?? undefined,
  gdpGrowthPct: countryData.gdp_growth_pct ?? undefined,
  populationTotal: countryData.population_total ?? undefined,
  // Include additional metrics for higher tiers
  ...(hasEntitlement(access, 'full_macro') && {
    fdiNetInflowsUsd: countryData.fdi_net_inflows_usd ?? undefined,
    inflationCpiPct: countryData.inflation_cpi_pct ?? undefined,
  }),
  // ...
}
```

**Analysis**: ✅ API correctly checks `hasEntitlement(access, 'full_macro')` before including FDI.

### Test Request as Professional User

**Request**:
```bash
curl http://localhost:3010/api/v1/country-lite?iso3=NGA \
  -H "Cookie: sb-access-token=<professional-token>"
```

**Response** (excerpt):
```json
{
  "country": { "iso3": "NGA", "name": "Nigeria" },
  "metrics": {
    "gdpCurrentUsd": 477380000000,
    "gdpGrowthPct": 3.25,
    "populationTotal": 223800000
    // fdiNetInflowsUsd is undefined, so omitted from JSON
  },
  "meta": {
    "accessTier": "professional",
    "authenticated": true
  }
}
```

**Analysis**: ✅ API returns correct tier. FDI is omitted from JSON (or `null`) because the source value is `NULL`.

---

## Frontend Mapping Findings

### EntitledMetricCard Display Logic

**File**: `apps/api-gateway/src/components/intelligence/EntitledMetricCard.tsx` (Lines 16-21)

```typescript
function formatValue(
  value: number | string | undefined | null, 
  formatType: EntitledMetricCardProps['formatType']
): string {
  if (value === undefined || value === null) return 'N/A';
  // ... formatting logic ...
}
```

**Analysis**: ✅ Frontend correctly displays "N/A" for missing data.

### CountryIntelligencePanel FDI Usage

**File**: `apps/api-gateway/src/components/intelligence/CountryIntelligencePanel.tsx` (Lines 437-443)

```typescript
<EntitledMetricCard
  label="FDI"
  value={data.metrics.fdiNetInflowsUsd}
  formatType="currency"
  locked={!hasFdiAccess}
  lockedLabel="Professional+"
/>
```

**Where**:
```typescript
const hasFdiAccess = data?.meta?.accessTier && 
  ['professional', 'business', 'investor', 'institutional', 'platform_admin']
    .includes(data.meta.accessTier);
```

**Analysis**: ✅ Frontend correctly unlocks FDI for Professional+ and passes the value to `EntitledMetricCard`. Since `data.metrics.fdiNetInflowsUsd` is `undefined`, the card displays "N/A".

---

## Ingestion/Source Findings

### Seed File Analysis

**File**: `infra/supabase/sql-pack-v1.5-seed-africa-caribbean.sql`

**Lines 191-193**: Only 3 indicators fetched
```sql
SELECT id INTO v_gdp_id FROM public.souvera_indicators WHERE key = 'gdp_current_usd';
SELECT id INTO v_growth_id FROM public.souvera_indicators WHERE key = 'gdp_growth_pct';
SELECT id INTO v_pop_id FROM public.souvera_indicators WHERE key = 'population_total';
-- NO FDI indicator fetched
```

**Lines 209-313**: Seed data inserts
```sql
INSERT INTO public.souvera_country_observations 
(country_id, indicator_id, period_date, period_type, value_numeric, source_id, fetched_at, published_at)
SELECT 
  (SELECT id FROM public.souvera_countries WHERE iso3 = country_iso),
  indicator_id,
  '2024-12-31'::date,
  'annual',
  value_numeric,
  v_world_bank_id,
  '2026-04-28T00:00:00Z'::timestamptz,
  '2024-10-01T00:00:00Z'::timestamptz
FROM (VALUES
  -- Nigeria
  ('NGA', v_gdp_id, 477380000000::numeric),
  ('NGA', v_growth_id, 3.25::numeric),
  ('NGA', v_pop_id, 223800000::numeric),
  -- No FDI values
  -- ...
```

**Analysis**: ❌ FDI data is not seeded. Only GDP, GDP Growth, and Population are included in the seed file.

### World Bank Adapter Analysis

**File**: `services/ingestion/worldbank.ts` (Lines 13-17)

```typescript
const INDICATORS = [
  { wbCode: 'NY.GDP.MKTP.CD', souveraKey: 'gdp_current_usd' },
  { wbCode: 'NY.GDP.MKTP.KD.ZG', souveraKey: 'gdp_growth_pct' },
  { wbCode: 'SP.POP.TOTL', souveraKey: 'population_total' },
  // FDI not included
] as const;
```

**Missing Indicator**:
```typescript
// Should include:
// { wbCode: 'BX.KLT.DINV.CD.WD', souveraKey: 'fdi_net_inflows_usd' }
```

**Analysis**: ❌ FDI indicator is not configured in the World Bank adapter. The adapter only ingests 3 of the 5 core indicators.

### World Bank Indicator Code

The correct World Bank indicator code for FDI Net Inflows is:
- **Code**: `BX.KLT.DINV.CD.WD`
- **Description**: Foreign direct investment, net inflows (BoP, current US$)
- **Source**: World Bank Open Data API

---

## Root Cause

**FDI displays as N/A because no FDI data exists in `souvera_country_observations`.**

Two contributing factors:

1. **Seed File Gap**: The curated preview seed data (`sql-pack-v1.5`) only seeds GDP, GDP Growth, and Population. FDI was not included in the seed data.

2. **Ingestion Adapter Gap**: The World Bank ingestion adapter (`services/ingestion/worldbank.ts`) does not include the FDI indicator in its `INDICATORS` array. Even if ingestion is run, FDI will not be fetched.

**All other components work correctly**: indicator definition, views, entitlements, API logic, and frontend display are all correctly implemented and ready for FDI data.

---

## Recommended Fix

### Option A: Add FDI to Seed Data (Quick Fix for Phase 3)

**Purpose**: Enable FDI display immediately for testing/preview.

**Implementation**:
1. Add FDI observations to `sql-pack-v1.5` or create a patch SQL file
2. Include FDI values for 20 priority countries (similar to GDP/Population)
3. Use 2022-2023 World Bank data where available

**Pros**:
- Quick implementation
- Consistent with current "Curated Preview Data" language
- Enables immediate Professional+ testing

**Cons**:
- Static data, not refreshable
- Requires new SQL migration

---

### Option B: Add FDI to World Bank Adapter (Proper Fix for Phase 4A)

**Purpose**: Enable live FDI ingestion from World Bank API.

**Implementation**:

Update `services/ingestion/worldbank.ts`:

```typescript
const INDICATORS = [
  { wbCode: 'NY.GDP.MKTP.CD', souveraKey: 'gdp_current_usd' },
  { wbCode: 'NY.GDP.MKTP.KD.ZG', souveraKey: 'gdp_growth_pct' },
  { wbCode: 'SP.POP.TOTL', souveraKey: 'population_total' },
  { wbCode: 'BX.KLT.DINV.CD.WD', souveraKey: 'fdi_net_inflows_usd' },  // ADD THIS
] as const;
```

Then run:
```bash
npx tsx services/ingestion/run.ts worldbank
```

**Pros**:
- Proper long-term solution
- Enables automated refresh
- Aligns with Phase 4A source-ingestion plan
- Data freshness tracked

**Cons**:
- Requires running ingestion
- Need to validate data quality
- Requires Phase 4A readiness

---

### Option C: Improve UX for Missing Data (Enhancement)

**Purpose**: Better communicate "data pending" state vs "locked" state.

**Implementation**:

Update `EntitledMetricCard.tsx`:

```typescript
function formatValue(value, formatType, locked): string {
  if (locked) return ''; // Handled by locked overlay
  if (value === undefined || value === null) return 'Data pending';
  // ... rest of formatting ...
}
```

**Pros**:
- Clearer user communication
- Distinguishes "locked" from "no data"
- Better UX for Professional+ users

**Cons**:
- Still needs Option A or B to actually show FDI data

---

## Recommended Path Forward

**Phase 3 (Current)**: Keep "N/A" as-is; document as known limitation.

**Phase 4A (Next)**: Implement **Option B** (add FDI to World Bank adapter) + **Option C** (improve UX).

**Rationale**:
- Option B is the proper long-term fix
- Aligns with source-ingestion activation plan
- Can be tested/validated before scheduled ingestion
- Option C improves UX regardless of data availability

---

## Acceptance Criteria (For Fix)

### When FDI Ingestion is Implemented

- [ ] World Bank adapter includes `BX.KLT.DINV.CD.WD` mapped to `fdi_net_inflows_usd`
- [ ] FDI observations are written to `souvera_country_observations`
- [ ] Professional/Business/Institutional users see FDI values when available
- [ ] Countries without FDI show "Data pending" instead of "N/A"
- [ ] Source/freshness metadata appears for FDI
- [ ] Explorer users still see FDI locked
- [ ] No "live data" language is used (until Phase 4B)

### UX Enhancement Acceptance Criteria

- [ ] Explorer sees "Locked" overlay on FDI card
- [ ] Professional+ sees "Data pending" if metric is unlocked but missing
- [ ] Professional+ sees formatted value if data exists
- [ ] No metric appears broken or misleading

---

## Related Documentation

- [Source Ingestion Activation Plan](../execution/source-ingestion-activation-plan.md)
- [P0 Auth Entitlement Architecture Audit](../audits/p0-auth-entitlement-architecture-audit.md)
- [Entitlements Package Implementation](entitlements-package-implementation.md)

---

## Appendix: SQL Diagnostic Queries

### Full FDI Data Verification Suite

```sql
-- 1. Verify FDI indicator exists
SELECT id, key, name, min_access_tier, primary_source
FROM souvera_indicators
WHERE key = 'fdi_net_inflows_usd';

-- 2. Count FDI observations (should be 0 currently)
SELECT COUNT(*) as fdi_observation_count
FROM souvera_country_observations o
JOIN souvera_indicators i ON i.id = o.indicator_id
WHERE i.key = 'fdi_net_inflows_usd';

-- 3. Check Professional view includes FDI column
SELECT 
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_name = 'souvera_country_professional_v'
  AND column_name = 'fdi_net_inflows_usd';

-- 4. Test Professional view for Nigeria
SELECT 
  iso3, 
  name, 
  gdp_current_usd, 
  fdi_net_inflows_usd
FROM souvera_country_professional_v
WHERE iso3 = 'NGA';

-- 5. Check Business view inherits FDI
SELECT 
  iso3, 
  name, 
  fdi_net_inflows_usd
FROM souvera_country_business_v
WHERE iso3 IN ('NGA', 'KEN', 'ZAF')
LIMIT 3;

-- 6. Verify all countries have no FDI data
SELECT 
  c.iso3,
  c.name,
  COUNT(o.id) as fdi_observation_count
FROM souvera_countries c
LEFT JOIN souvera_country_observations o ON o.country_id = c.id
LEFT JOIN souvera_indicators i ON i.id = o.indicator_id AND i.key = 'fdi_net_inflows_usd'
WHERE c.is_active = true
GROUP BY c.iso3, c.name
HAVING COUNT(o.id) > 0
ORDER BY c.name;
-- Expected: 0 rows

-- 7. Compare seeded vs missing indicators
SELECT 
  i.key as indicator_key,
  i.name as indicator_name,
  COUNT(o.id) as observation_count,
  COUNT(DISTINCT o.country_id) as country_count
FROM souvera_indicators i
LEFT JOIN souvera_country_observations o ON o.indicator_id = i.id
WHERE i.key IN (
  'gdp_current_usd',
  'gdp_growth_pct',
  'population_total',
  'fdi_net_inflows_usd',
  'inflation_cpi_pct'
)
GROUP BY i.key, i.name
ORDER BY observation_count DESC;
```

---

**Report Status**: Complete  
**Next Action**: Review with product team; prioritize Option B for Phase 4A

---

## Update: UX Improvement Implemented

**Date**: May 2, 2026  
**Task**: UX-DATA-01 — Replace unlocked missing metric display from "N/A" to "Data pending"

### Implementation Summary

A UX improvement has been implemented to address the confusing "N/A" display for unlocked FDI:

- **Before**: Professional+ users saw "N/A" for unlocked FDI, suggesting a broken feature
- **After**: Professional+ users now see "Data pending" for unlocked FDI, indicating data ingestion is in progress
- **Explorer/Public**: FDI remains locked with "Professional+" label (no change)

### Changes
- `EntitledMetricCard.tsx`: Added `missingLabel` prop
- `CountryIntelligencePanel.tsx`: FDI card now passes `missingLabel="Data pending"`
- Build and lint: ✅ Passed
- No API, entitlement, or RLS changes

### Documentation
See: [UX Data Pending Metric Label](./ux-data-pending-metric-label.md)

This UX improvement does not populate FDI data. It only improves the user experience while waiting for Phase 4A ingestion (DATA-ING-02B).

