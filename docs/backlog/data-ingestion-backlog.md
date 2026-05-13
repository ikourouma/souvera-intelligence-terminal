# Data Ingestion & Source Activation Backlog

**Owner**: Engineering Team  
**Status**: Active  
**Last Updated**: 2026-05-02

---

## Overview

This backlog tracks all tasks related to source ingestion activation, data completeness, and source-governed intelligence for Souvera Intelligence Terminal.

Related Plans:
- [Source Ingestion Activation Plan](../execution/source-ingestion-activation-plan.md)
- [FDI N/A Data Path Debug Report](../qa/fdi-na-data-path-debug.md)

---

## Priority Tasks (P1 - Required for Professional+ Feature Completeness)

### DATA-ING-02B — Add FDI to World Bank Ingestion

**Status**: Pending  
**Priority**: P1  
**Phase**: 4A — Manual Source Ingestion Activation  
**Estimate**: 4 hours

**Problem**: FDI currently displays as "N/A" for Professional, Business, and Institutional users because the World Bank adapter does not ingest FDI data. See: `docs/qa/fdi-na-data-path-debug.md`

**Objective**: Add FDI (Foreign Direct Investment) indicator to World Bank adapter to enable Professional+ FDI display.

**Files to Change**:
- `services/ingestion/worldbank.ts` (lines 13-17)

**Implementation**:

Update the `INDICATORS` array:

```typescript
const INDICATORS = [
  { wbCode: 'NY.GDP.MKTP.CD', souveraKey: 'gdp_current_usd' },
  { wbCode: 'NY.GDP.MKTP.KD.ZG', souveraKey: 'gdp_growth_pct' },
  { wbCode: 'SP.POP.TOTL', souveraKey: 'population_total' },
  { wbCode: 'BX.KLT.DINV.CD.WD', souveraKey: 'fdi_net_inflows_usd' },  // ADD THIS
] as const;
```

**World Bank Indicator Details**:
- **Code**: `BX.KLT.DINV.CD.WD`
- **Name**: Foreign direct investment, net inflows (BoP, current US$)
- **Availability**: Most countries 2000-2023
- **Source**: World Bank Open Data API

**Commands to Run**:
```bash
# After code change
npx tsx services/ingestion/run.ts worldbank
```

**Acceptance Criteria**:
- [ ] World Bank adapter includes `BX.KLT.DINV.CD.WD` mapped to `fdi_net_inflows_usd`
- [ ] Ingestion job succeeds with `status = 'succeeded'`
- [ ] FDI observations written to `souvera_country_observations`
- [ ] Professional+ users see FDI values when available (not "N/A")
- [ ] Countries without FDI data show "Data pending" (requires UX-DATA-01)
- [ ] Source/freshness metadata populated for FDI
- [ ] No "live data" language used (maintain "Source-Attributed Preview")

**Verification SQL**:
```sql
-- 1. Verify FDI observations exist
SELECT COUNT(*) as fdi_observation_count
FROM souvera_country_observations o
JOIN souvera_indicators i ON i.id = o.indicator_id
WHERE i.key = 'fdi_net_inflows_usd';
-- Expected: > 0

-- 2. Check Nigeria specifically
SELECT iso3, name, fdi_net_inflows_usd
FROM souvera_country_professional_v
WHERE iso3 = 'NGA';
-- Expected: numeric value (not NULL)

-- 3. Check coverage
SELECT 
  COUNT(DISTINCT o.country_id) as countries_with_fdi
FROM souvera_country_observations o
JOIN souvera_indicators i ON i.id = o.indicator_id
WHERE i.key = 'fdi_net_inflows_usd';
```

**Dependencies**: None

**Risk**: Low — same pattern as existing indicators

---

### UX-DATA-01 — Replace Unlocked Missing Metric Display

**Status**: Pending  
**Priority**: P1  
**Phase**: 4A (UX Enhancement)  
**Estimate**: 2 hours

**Problem**: When Professional+ users have FDI unlocked but data is missing, the card shows "N/A" which is ambiguous. It's unclear whether this means "data doesn't exist" or "something is broken."

**Objective**: Improve UX to distinguish between "locked" state (Explorer) and "data pending" state (Professional+ with no data yet).

**Files to Change**:
- `apps/api-gateway/src/components/intelligence/EntitledMetricCard.tsx` (lines 16-44)

**Current Behavior**:
```typescript
function formatValue(value, formatType): string {
  if (value === undefined || value === null) return 'N/A';
  // ...
}
```

**Proposed Implementation**:

```typescript
function formatValue(
  value: number | string | undefined | null, 
  formatType: EntitledMetricCardProps['formatType'],
  locked: boolean
): string {
  // Don't format if locked (handled by overlay)
  if (locked) return '';
  
  // Show "Data pending" for unlocked but missing data
  if (value === undefined || value === null) return 'Data pending';
  
  // Rest of formatting logic unchanged
  if (typeof value === 'string') return value;
  // ... currency/population/percentage formatting ...
}
```

Update the component call:
```typescript
<div className={`text-xl font-bold ${textColor}`}>
  {formatValue(value, formatType, locked)}
</div>
```

**Acceptance Criteria**:
- [ ] Explorer users see "Locked" overlay on FDI card (unchanged)
- [ ] Professional+ users see "Data pending" if metric is unlocked but `value === null/undefined`
- [ ] Professional+ users see formatted value (e.g., "$2.5B") if data exists
- [ ] No metric appears broken or misleading
- [ ] Mobile display remains clean
- [ ] Works for all entitled metrics (FDI, Inflation, FX, etc.)

**Test Matrix**:

| User Tier | FDI Data Exists | Expected Display |
|-----------|-----------------|------------------|
| Explorer | N/A (locked) | "Locked" overlay with "Professional+" label |
| Professional | No | "Data pending" |
| Professional | Yes | "$X.XB" (formatted value) |
| Business | No | "Data pending" |
| Business | Yes | "$X.XB" (formatted value) |
| Institutional | No | "Data pending" |
| Institutional | Yes | "$X.XB" (formatted value) |

**Dependencies**: None (can be implemented independently of DATA-ING-02B)

**Risk**: Low — UI-only change

---

## Phase 4A Tasks (Manual Ingestion)

### DATA-ING-01 — Ingestion Inventory Audit

**Status**: Complete  
**Priority**: P2  
**Phase**: 4A  
**Completed**: 2026-04-28

Verified all ingestion infrastructure components exist and are production-ready.

---

### DATA-ING-02 — World Bank Manual Ingestion Activation

**Status**: Pending  
**Priority**: P1  
**Phase**: 4A  
**Estimate**: 1 hour

**Objective**: Run World Bank ingestion manually and validate results (without FDI first, then with FDI after DATA-ING-02B).

**Commands**:
```bash
npx tsx services/ingestion/run.ts worldbank
```

**Acceptance Criteria**:
- [ ] Job logged in `souvera_ingestion_jobs` with `status = 'succeeded'`
- [ ] Observations inserted for GDP, GDP growth, Population, FDI (if DATA-ING-02B complete)
- [ ] Source health updated in `souvera_source_health`
- [ ] Payload archived in `souvera_source_payload_archive`
- [ ] No errors in console output

**Dependencies**: 
- DATA-ING-02B (for FDI inclusion)

**Risk**: Low

---

### DATA-ING-03 — REST Countries Controlled Ingestion

**Status**: Pending  
**Priority**: P2  
**Phase**: 4A  
**Estimate**: 30 minutes

**Objective**: Run REST Countries ingestion manually and validate results.

**Commands**:
```bash
npx tsx services/ingestion/run.ts restcountries
```

**Acceptance Criteria**:
- [ ] Job logged in `souvera_ingestion_jobs` with `status = 'succeeded'`
- [ ] Country records upserted (74 mandate + others)
- [ ] `is_african_country` flag correct
- [ ] Flags and coordinates populated
- [ ] Source health updated

**Note**: REST Countries will upsert ALL countries (~250), not just mandate countries. This is expected; API filtering handles visibility.

**Dependencies**: None

**Risk**: Low

---

### DATA-ING-04 — Observation Validation SQL

**Status**: Pending  
**Priority**: P2  
**Phase**: 4A  
**Estimate**: 1 hour

**Objective**: Create and run SQL queries to verify data completeness.

**Files to Create**:
- `infra/supabase/verification/observation-checks.sql`

**Queries to Include**:
- Observations by country
- Observations by indicator
- Countries missing GDP
- Countries missing population
- Countries missing FDI (after DATA-ING-02B)
- Stale observations
- Latest observation view

**Acceptance Criteria**:
- [ ] All verification queries created
- [ ] Queries return expected results
- [ ] Coverage gaps documented

**Dependencies**: 
- DATA-ING-02 (for data to validate)
- DATA-ING-03 (for country data)

**Risk**: Low

---

### DATA-ING-05 — Freshness/Source Display QA

**Status**: Pending  
**Priority**: P2  
**Phase**: 4A  
**Estimate**: 2 hours

**Objective**: Verify UI displays source attribution and freshness correctly.

**Files to Test**:
- `apps/api-gateway/src/components/intelligence/CountryIntelligencePanel.tsx`
- `apps/api-gateway/src/components/intelligence/SouveraMapWorkspace.tsx`

**Acceptance Criteria**:
- [ ] Country panel shows "Source: World Bank"
- [ ] Country panel shows "Last updated: [date]"
- [ ] Data vintage visible
- [ ] "Source-Attributed Preview" label visible (if Phase 4A complete)
- [ ] "Curated Preview Data" label visible (if still Phase 3)

**Dependencies**: 
- DATA-ING-02 (for fresh data)

**Risk**: Low

---

### DATA-ING-06 — Source Health Table Updates

**Status**: Pending  
**Priority**: P2  
**Phase**: 4A  
**Estimate**: 30 minutes

**Objective**: Verify source health tracking works correctly.

**Acceptance Criteria**:
- [ ] `souvera_source_health` has records for `world_bank` and `rest_countries`
- [ ] `last_success_at` populated
- [ ] `status = 'healthy'`
- [ ] `latency_ms` reasonable (<5000ms)

**Dependencies**: 
- DATA-ING-02
- DATA-ING-03

**Risk**: Low

---

### DATA-ING-07 — Ingestion Job Logging Verification

**Status**: Pending  
**Priority**: P2  
**Phase**: 4A  
**Estimate**: 30 minutes

**Objective**: Verify job history is being captured correctly.

**Acceptance Criteria**:
- [ ] Jobs visible in `souvera_ingestion_jobs`
- [ ] `records_processed` accurate
- [ ] `records_failed` accurate
- [ ] `started_at` and `finished_at` populated
- [ ] `error_message` null for successful jobs

**Dependencies**: 
- DATA-ING-02
- DATA-ING-03

**Risk**: Low

---

## Phase 4B Tasks (Scheduled Ingestion)

### DATA-ING-08 — Payload Archive Policy

**Status**: Pending  
**Priority**: P3  
**Phase**: 4B  
**Estimate**: 2 hours

**Objective**: Define retention policy for archived payloads.

**Files to Create**:
- `docs/operations/data-retention-policy.md`

**Acceptance Criteria**:
- [ ] Retention period defined (30/60/90 days)
- [ ] Cleanup SQL or cron documented
- [ ] Storage estimates documented

**Dependencies**: None

**Risk**: Low

---

### DATA-ING-09 — Scheduled Cron/Edge Function Design

**Status**: Pending  
**Priority**: P2  
**Phase**: 4B  
**Estimate**: 1 day

**Objective**: Design scheduled ingestion architecture.

**Files to Create**:
- `docs/architecture/scheduled-ingestion-design.md`
- `supabase/functions/ingest-worldbank/index.ts` (future)
- `supabase/functions/ingest-restcountries/index.ts` (future)

**Acceptance Criteria**:
- [ ] Refresh schedule defined per source
- [ ] Edge function structure documented
- [ ] Error handling documented
- [ ] Monitoring approach documented

**Dependencies**: 
- DATA-ING-02 (manual validation complete)
- DATA-ING-03 (manual validation complete)

**Risk**: Medium — requires Supabase Edge Functions setup

---

## Phase 5 Tasks (Production Governance)

### DATA-ING-10 — Admin Data Completeness Dashboard

**Status**: Pending  
**Priority**: P3  
**Phase**: 5  
**Estimate**: 2 days

**Objective**: Create admin view for data completeness monitoring.

**Files to Create**:
- `apps/admin-console/src/app/data/completeness/page.tsx`

**Acceptance Criteria**:
- [ ] Shows observation count per country
- [ ] Shows observation count per indicator
- [ ] Shows source health status
- [ ] Shows last ingestion job results
- [ ] Shows stale data warnings

**Dependencies**: 
- Phase 4B complete (scheduled ingestion operational)

**Risk**: Medium — requires admin console development

---

## Additional Source Adapters (Future)

### DATA-ING-11 — IMF Adapter Implementation

**Status**: Not Started  
**Priority**: P3  
**Phase**: Future  
**Estimate**: 1 week

**Objective**: Implement IMF Data API adapter for GDP forecasts.

**Target Indicators**:
- `gdp_forecast_pct`

**Dependencies**: Phase 4A complete

---

### DATA-ING-12 — UN Comtrade Adapter Implementation

**Status**: Not Started  
**Priority**: P3  
**Phase**: Future  
**Estimate**: 2 weeks

**Objective**: Implement UN Comtrade API adapter for trade data.

**Target Data**:
- Exports
- Imports
- Trade partners

**API Requirements**:
- API key required
- Rate limits apply

**Dependencies**: Phase 4A complete

---

### DATA-ING-13 — Open Exchange Rates Adapter Implementation

**Status**: Not Started  
**Priority**: P3  
**Phase**: Future  
**Estimate**: 3 days

**Objective**: Implement Open Exchange Rates API adapter for FX data.

**Target Indicators**:
- `fx_to_usd`

**API Requirements**:
- API key required (paid)
- Hourly caching recommended

**Dependencies**: Phase 4A complete

---

## UX Enhancement Backlog

### UX-DATA-02 — Stale Data Badges

**Status**: Not Started  
**Priority**: P3  
**Phase**: 4B  
**Estimate**: 1 day

**Objective**: Add UI indicator for outdated/stale data.

**Acceptance Criteria**:
- [ ] Badge appears if data > 90 days old
- [ ] Badge shows "Data vintage: [year]"
- [ ] Badge links to source health status
- [ ] Admin can configure staleness threshold

**Dependencies**: Phase 4B (scheduled ingestion)

---

### UX-DATA-03 — Loading States for Metric Cards

**Status**: Not Started  
**Priority**: P4  
**Phase**: Future  
**Estimate**: 4 hours

**Objective**: Add skeleton loading states to metric cards while data fetches.

**Current Behavior**: Cards show immediately with "N/A" or "Data pending"

**Proposed**: Show skeleton animation during API call, then fade in actual value

**Dependencies**: None

---

## Quality Gates Checklist

Before language can evolve from "Curated Preview Data" to "Source-Attributed Data", all gates must pass:

| # | Gate | Required Tasks | Status |
|---|------|---------------|--------|
| 1 | Ingestion jobs succeed for World Bank | DATA-ING-02, DATA-ING-02B | ⏳ Pending |
| 2 | Ingestion jobs succeed for REST Countries | DATA-ING-03 | ⏳ Pending |
| 3 | Data mapped to correct indicators | DATA-ING-04 | ⏳ Pending |
| 4 | Observations available for mandate countries | DATA-ING-04 | ⏳ Pending |
| 5 | Freshness timestamp displayed in UI | DATA-ING-05 | ⏳ Pending |
| 6 | Source attribution displayed in UI | DATA-ING-05 | ⏳ Pending |
| 7 | Source health table populated | DATA-ING-06 | ⏳ Pending |
| 8 | No raw external API calls from frontend | Code audit | ✅ Complete |
| 9 | No premium data exposed publicly | Entitlement audit | ✅ Complete |
| 10 | Legal/licensing notes documented | Legal review | ⏳ Pending |
| 11 | Scheduled refresh operational | DATA-ING-09 | ⏳ Pending |
| 12 | Admin monitoring dashboard functional | DATA-ING-10 | ⏳ Pending |
| 13 | Error handling verified | QA testing | ⏳ Pending |
| 14 | Fallback behavior works | QA testing | ⏳ Pending |

---

## Sprint Planning Recommendations

### Sprint 1 (Phase 4A - Week 1)

**Focus**: FDI Feature Completion

1. **DATA-ING-02B** — Add FDI to World Bank Adapter (4 hours)
2. **UX-DATA-01** — Improve missing data UX (2 hours)
3. **DATA-ING-02** — Run World Bank ingestion with FDI (1 hour)
4. **DATA-ING-04** — Verify FDI observations (1 hour)

**Sprint Goal**: Professional+ users see FDI values

---

### Sprint 2 (Phase 4A - Week 2)

**Focus**: Full Manual Ingestion Validation

1. **DATA-ING-03** — REST Countries ingestion (30 min)
2. **DATA-ING-04** — Full observation validation (1 hour)
3. **DATA-ING-05** — Freshness/source QA (2 hours)
4. **DATA-ING-06** — Source health verification (30 min)
5. **DATA-ING-07** — Job logging verification (30 min)

**Sprint Goal**: All manual ingestion validated

---

### Sprint 3 (Phase 4B)

**Focus**: Scheduled Ingestion Design

1. **DATA-ING-09** — Design scheduled architecture (1 day)
2. **DATA-ING-08** — Archive policy (2 hours)

**Sprint Goal**: Phase 4B roadmap complete

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-02 | Engineering Team | Initial backlog with FDI findings |

---

**Related Documentation**:
- [Source Ingestion Activation Plan](../execution/source-ingestion-activation-plan.md)
- [FDI N/A Data Path Debug](../qa/fdi-na-data-path-debug.md)
- [P0 Auth Entitlement Fix](../qa/p0-auth-entitlement-fix-implementation.md)
