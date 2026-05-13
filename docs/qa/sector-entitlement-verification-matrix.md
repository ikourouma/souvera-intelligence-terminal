# Sector Entitlement Verification Matrix

**Document ID:** `SECTOR-ENTITLEMENT-001`  
**Status:** ✅ VERIFIED  
**Created:** 2026-05-03  
**Last Updated:** 2026-05-03  
**Scope:** Sector & FDI Entitlement Model Verification  
**Related:** Phase 3 Step 3 Preflight Check

---

## Executive Summary

**Verification Status:** ✅ **CODE MATCHES CONFIRMED BUSINESS RULE**

A comprehensive review of the Souvera Intelligence Terminal entitlement model has confirmed that the code correctly implements the sector and FDI access rules. All layers—database, API, entitlements package, and frontend—are properly aligned with the confirmed business rule:

- **Public/Explorer users:** 1 sector teaser (no rationale), FDI locked
- **Professional+ users:** Up to 5 sectors (with rationale), FDI unlocked

**Key Findings:**
- ✅ Entitlement definitions are correct
- ✅ API sector limits are correct (1 for Public/Explorer, 5 for Professional+)
- ✅ FDI entitlement logic is correct
- ✅ Frontend rendering logic is correct
- ✅ All documentation is consistent
- ⚠️ Sector visibility cannot be validated in UI due to data gap (not a code bug)
- ✅ This does NOT block Phase 3 Step 3 (Query Parameter Support)

---

## Confirmed Business Rule

### Sector Access by Tier

| Tier | Sectors Visible | Max Sectors | Rationale Visible | FDI Visible | Missing-Data Behavior |
|------|-----------------|-------------|-------------------|-------------|----------------------|
| **Public** | 1 teaser (if data exists) | 1 | ❌ No | ❌ No | Section hidden or "Sectors data pending" (UX-DATA-02) |
| **Explorer** | 1 teaser (if data exists) | 1 | ❌ No | ❌ No | Section hidden or "Sectors data pending" (UX-DATA-02) |
| **Professional** | Up to 5 | 5 | ✅ Yes | ✅ Yes (or "Data pending") | FDI: "Data pending"; Sectors: hidden or "Data pending" |
| **Business** | Up to 5 | 5 | ✅ Yes | ✅ Yes (or "Data pending") | FDI: "Data pending"; Sectors: hidden or "Data pending" |
| **Institutional** | Up to 5 (with scores) | 5 | ✅ Yes | ✅ Yes (or "Data pending") | FDI: "Data pending"; Sectors: hidden or "Data pending" |

### Business Rules

**Public / Explorer:**
- 1 sector teaser if sector data exists
- No sector rationale
- No FDI (locked)
- Shows "+X more sectors with Professional access" if more sectors exist

**Professional / Business / Institutional:**
- Up to 5 sectors if sector data exists
- Sector rationale visible (if available)
- Sector strength/growth scores visible (if available, Institutional tier)
- FDI visible if data exists
- FDI displays "Data pending" if unlocked but missing data

---

## Entitlement Matrix

### Entitlement Package Configuration

**Source:** `packages/entitlements/index.ts` (lines 86-173)

| Tier | `sector_teasers` | `sector_rationale` | `full_macro` (FDI) |
|------|------------------|--------------------|--------------------|
| **public** | ✅ Yes | ❌ No | ❌ No |
| **explorer** | ✅ Yes | ❌ No | ❌ No |
| **professional** | ✅ Yes | ✅ Yes | ✅ Yes |
| **business** | ✅ Yes | ✅ Yes | ✅ Yes |
| **investor** | ✅ Yes | ✅ Yes | ✅ Yes |
| **institutional** | ✅ Yes | ✅ Yes | ✅ Yes |

**Code Reference:**

```typescript
// packages/entitlements/index.ts, lines 86-108
public: [
  'country_identity',
  'headline_macro',
  'sector_teasers',  // ← Public has sector_teasers
  'news_teasers',
],
explorer: [
  'country_identity',
  'headline_macro',
  'sector_teasers',  // ← Explorer has sector_teasers
  'news_teasers',
  'compare_lite',
],
professional: [
  'country_identity',
  'headline_macro',
  'sector_teasers',
  'news_teasers',
  'compare_lite',
  'full_macro',        // ← Professional has full_macro (FDI)
  'sector_rationale',  // ← Professional has sector_rationale
  'fx_metrics',
],
```

**Verification:** ✅ All tiers have `sector_teasers`. Professional+ have `sector_rationale` and `full_macro`.

---

## API Behavior Confirmation

**Source:** `apps/api-gateway/src/app/api/v1/country-lite/route.ts`

### Sector Limit Logic (Lines 89-96)

```typescript
const hasSectorRationale = hasEntitlement(access, 'sector_rationale');
const sectorSelect = hasSectorRationale
  ? 'sector_label, teaser_md, rationale_md, strength_score, growth_score'
  : 'sector_label, teaser_md';

// Determine sector limit based on access tier
// Public and Explorer get 1 sector; Professional+ get up to 5
const sectorLimit = hasSectorRationale ? 5 : 1;
```

**Verification:**
- ✅ `hasSectorRationale` returns `false` for Public/Explorer
- ✅ `hasSectorRationale` returns `true` for Professional+
- ✅ `sectorLimit = 1` for Public/Explorer
- ✅ `sectorLimit = 5` for Professional+
- ✅ Sector fields correctly limited (teaser only for Public/Explorer)

### Sector Query (Lines 98-103)

```typescript
const { data: sectorData } = await supabase
  .from('souvera_country_sectors')
  .select(sectorSelect)
  .eq('country_id', countryData.country_id)
  .order('display_order', { ascending: true })
  .limit(sectorLimit);  // ← Limit applied
```

**Verification:**
- ✅ Query correctly applies `sectorLimit`
- ✅ Returns empty array `[]` when no sector data exists (data gap, not code bug)

### FDI Logic (Lines 122-125)

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

**Verification:**
- ✅ FDI excluded for Public/Explorer (no `full_macro` entitlement)
- ✅ FDI included for Professional+ (has `full_macro` entitlement)
- ✅ Returns `undefined` when FDI data missing (displays as "Data pending" via UX-DATA-01)

### Sector Response Transform (Lines 139-146)

```typescript
sectors: (sectorData ?? []).map((s: Record<string, unknown>) => ({
  label: s.sector_label,
  teaser: s.teaser_md ?? undefined,
  ...(hasSectorRationale && {
    rationale: s.rationale_md ?? undefined,
    strengthScore: s.strength_score ?? undefined,
    growthScore: s.growth_score ?? undefined,
  }),
})),
```

**Verification:**
- ✅ Rationale excluded for Public/Explorer
- ✅ Rationale included for Professional+
- ✅ Empty array returned when no sector data exists

---

## Frontend Behavior Confirmation

### CountryIntelligencePanel.tsx

**Source:** `apps/api-gateway/src/components/intelligence/CountryIntelligencePanel.tsx`

#### Access Tier Detection (Lines 146-152)

```typescript
// Check if FDI is accessible (Professional+ has full_macro)
const hasFdiAccess = data?.meta?.accessTier && 
  ['professional', 'business', 'investor', 'institutional', 'platform_admin']
    .includes(data.meta.accessTier);

// Check if user has sector rationale access
const hasSectorRationale = data?.meta?.accessTier && 
  ['professional', 'business', 'investor', 'institutional', 'platform_admin']
    .includes(data.meta.accessTier);
```

**Verification:**
- ✅ Correctly detects Professional+ for FDI access
- ✅ Correctly detects Professional+ for sector rationale

#### FDI Card (Lines 437-444)

```typescript
<EntitledMetricCard
  label="FDI"
  value={data.metrics.fdiNetInflowsUsd}
  formatType="currency"
  locked={!hasFdiAccess}
  lockedLabel="Professional+"
  missingLabel="Data pending"  // ← UX-DATA-01 implemented
/>
```

**Verification:**
- ✅ `locked={true}` for Public/Explorer (shows "Professional+" overlay)
- ✅ `locked={false}` for Professional+ (unlocked)
- ✅ Shows "Data pending" when unlocked but `value === undefined`

#### Sector Section (Lines 447-460)

```typescript
{/* Sectors */}
{data.sectors && data.sectors.length > 0 && (
  <div className="px-5 py-4 border-t border-zinc-800/50">
    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
      Key Sectors
    </h4>
    <EntitledSectorList
      sectors={data.sectors}
      maxVisible={hasSectorRationale ? 5 : 1}
      showRationale={hasSectorRationale}
      totalCount={5}
    />
  </div>
)}
```

**Verification:**
- ✅ `maxVisible = 1` for Public/Explorer
- ✅ `maxVisible = 5` for Professional+
- ✅ `showRationale = false` for Public/Explorer
- ✅ `showRationale = true` for Professional+
- ⚠️ Entire section hidden when `sectors.length === 0` (data gap)

### EntitledSectorList.tsx

**Source:** `apps/api-gateway/src/components/intelligence/EntitledSectorList.tsx`

#### Hidden Sectors Indicator (Lines 92-99)

```typescript
{/* Hidden sectors indicator */}
{hiddenCount > 0 && (
  <div className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-sm">
    <Lock className="w-3.5 h-3.5 text-zinc-600" />
    <span className="text-xs text-zinc-500">
      +{hiddenCount} more sector{hiddenCount !== 1 ? 's' : ''} with Professional access
    </span>
  </div>
)}
```

**Verification:**
- ✅ Shows "+4 more sectors with Professional access" for Public/Explorer when `totalCount={5}`
- ✅ Encourages upgrade to Professional tier

#### Empty State Fallback (Lines 33-38)

```typescript
if (sectors.length === 0) {
  return (
    <div className="text-zinc-500 text-sm italic">
      No sector data available
    </div>
  );
}
```

**Verification:**
- ✅ Graceful fallback for empty sectors
- ⚠️ This fallback is not currently displayed because parent component hides entire section

---

## Documentation Alignment

**Status:** ✅ **ALL DOCUMENTATION IS CONSISTENT**

A comprehensive search of all documentation files (`docs/`) for references to "Explorer" and "sector" was performed. **No documentation incorrectly states that Explorer should see zero sectors.**

### Key Documentation References

| Document | Line | Statement |
|----------|------|-----------|
| `docs/audits/sector-visibility-debug.md` | 317-327 | "Public/Explorer: 1 sector" |
| `docs/audits/phase-1-map-workspace-qa-gate.md` | 621 | "Explorer: 1 sector" |
| `docs/execution/phase-2-africa-workspace-embedding-plan.md` | 576 | "Explorer: 1 sector with teaser only" |
| `docs/qa/map-workspace-entitlement-test-plan.md` | 74 | "Explorer: 1 sector displayed" |
| `docs/design/souvera-map-workspace-enhancement-plan.md` | 471 | "Public/Explorer should see 1 sector" |
| `docs/qa/phase-1-map-workspace-final-polish-implementation.md` | 252 | "1 for Explorer, up to 5 for Professional+" |
| `docs/qa/test-user-login-verification-checklist.md` | 153 | "Explorer: ✗ 1 Sector" |
| `docs/audits/phase-2-africa-workspace-embedding-qa.md` | 367 | "Explorer: 1 sector teaser" |

**Total References Searched:** 40+ files  
**Inconsistencies Found:** 0

**Conclusion:** All documentation consistently states "1 sector for Public/Explorer" and "up to 5 sectors for Professional+".

---

## Phase Impact Assessment

**Question:** Does the sector entitlement model block Phase 3 Step 3 (Query Parameter Support)?

**Answer:** ✅ **NO — PHASE 3 STEP 3 MAY PROCEED**

### Analysis

| Layer | Status | Blocks Phase 3 Step 3? | Notes |
|-------|--------|------------------------|-------|
| **Code Implementation** | ✅ Correct | ❌ No | All entitlement logic is correct |
| **API Logic** | ✅ Correct | ❌ No | Sector limits and FDI checks work correctly |
| **Frontend Rendering** | ✅ Correct | ❌ No | Conditional rendering is correct |
| **Documentation** | ✅ Consistent | ❌ No | All docs align with business rule |
| **Sector Data** | ❌ Missing | ❌ No | Data gap, not code bug; tracked in DATA-SEED-01 |
| **FDI Data** | ❌ Missing | ❌ No | Data gap, not code bug; tracked in DATA-ING-02B |

### Known Data Coverage Gaps (Non-Blocking)

| Gap | Type | Backlog Task | Priority | Blocks Phase 3? |
|-----|------|--------------|----------|-----------------|
| No sector data seeded | Data | DATA-SEED-01 | P1 | ❌ No |
| No FDI data ingested | Data | DATA-ING-02B | P1 | ❌ No |
| Sector section hidden when empty | UX | UX-DATA-02 | P2 | ❌ No |

### Rationale

**Phase 3 Step 3 (Query Parameter Support)** involves:
- Adding `?region=` query parameter to `/intelligence/map`
- Initializing region from URL
- Updating URL when region changes
- Supporting browser back/forward

**Dependencies:**
- None of these features depend on sector or FDI data
- Query param logic is orthogonal to entitlement logic
- Code review confirms entitlement model is correct
- Data gaps are tracked and will be resolved in parallel

**Recommendation:** ✅ **Proceed to Phase 3 Step 3 with confidence.**

---

## Verified Entitlement Matrix

### Complete Tier-by-Tier Breakdown

| Tier | Sector Visibility | Max Sectors | Teaser Visible | Rationale Visible | Scores Visible | FDI Access | Missing FDI Display | Missing Sector Display |
|------|-------------------|-------------|----------------|-------------------|----------------|------------|---------------------|------------------------|
| **Public** | 1 sector (if data exists) | 1 | ✅ Yes | ❌ No | ❌ No | ❌ Locked | "Professional+" overlay | Section hidden (or "Data pending" with UX-DATA-02) |
| **Explorer** | 1 sector (if data exists) | 1 | ✅ Yes | ❌ No | ❌ No | ❌ Locked | "Professional+" overlay | Section hidden (or "Data pending" with UX-DATA-02) |
| **Professional** | Up to 5 sectors | 5 | ✅ Yes | ✅ Yes | ⚠️ Optional | ✅ Unlocked | "Data pending" | Section hidden (or "Data pending" with UX-DATA-02) |
| **Business** | Up to 5 sectors | 5 | ✅ Yes | ✅ Yes | ⚠️ Optional | ✅ Unlocked | "Data pending" | Section hidden (or "Data pending" with UX-DATA-02) |
| **Investor** | Up to 5 sectors | 5 | ✅ Yes | ✅ Yes | ⚠️ Optional | ✅ Unlocked | "Data pending" | Section hidden (or "Data pending" with UX-DATA-02) |
| **Institutional** | Up to 5 sectors | 5 | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Unlocked | "Data pending" | Section hidden (or "Data pending" with UX-DATA-02) |

### Entitlement Keys

| Key | Description | Public | Explorer | Professional | Business | Investor | Institutional |
|-----|-------------|--------|----------|--------------|----------|----------|---------------|
| `country_identity` | Country name, flag, region, capital | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `headline_macro` | GDP, GDP Growth, Population | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `sector_teasers` | Sector labels and teasers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `news_teasers` | News teasers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `compare_lite` | Compare countries (lite) | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `full_macro` | FDI, Inflation, Full metrics | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `sector_rationale` | Sector deep-dives, rationale | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `fx_metrics` | FX to USD | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `forecast_metrics` | GDP forecast, remittances | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `reports_preview` | Report previews | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `trade_data` | Trade data | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `risk_analysis` | Risk analysis | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `investment_thesis` | Investment thesis | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `api_access` | API access | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `export_access` | Export access | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Current Data Coverage Limitation

### Sector Data Gap

**Status:** ❌ **NO SECTOR DATA SEEDED**

**Root Cause:** The `souvera_country_sectors` table exists with proper schema, but no sector data has been seeded. The seed file `sql-pack-v1.5-seed-africa-caribbean.sql` contains no INSERT statements for the `souvera_country_sectors` table.

**Impact:**
- Sector section is hidden on all country intelligence panels for all tiers
- API returns `sectors: []` when querying an empty table
- Prevents UI validation of tier-based sector entitlements
- Does NOT indicate a code bug — all code is correct

**Evidence:**
```sql
-- Query to check sector data coverage
SELECT COUNT(*) as sector_count
FROM souvera_country_sectors;
-- Result: 0 rows
```

**Resolution:** DATA-SEED-01 (P1)
- Seed 10 priority countries with 5 sectors each
- Include: Nigeria, Kenya, South Africa, Egypt, Rwanda, Ghana, Morocco, Tanzania, Ethiopia, Côte d'Ivoire
- Sectors: Fintech, Energy, Agriculture, Critical Minerals, Logistics, Tourism, Manufacturing, Healthcare, ICT, Real Estate
- See: `docs/audits/sector-visibility-debug.md` for full seeding plan

### FDI Data Gap

**Status:** ❌ **NO FDI DATA INGESTED**

**Root Cause:** The World Bank ingestion adapter (`services/ingestion/worldbank.ts`) does not include FDI indicator in its `INDICATORS` array. Only GDP, GDP Growth, and Population are ingested.

**Impact:**
- FDI displays as "Data pending" for Professional+ users (via UX-DATA-01)
- Explorer users see FDI locked (correct behavior)
- Does NOT indicate a code bug — all entitlement logic is correct

**Evidence:**
```typescript
// services/ingestion/worldbank.ts, lines 13-17
const INDICATORS = [
  { wbCode: 'NY.GDP.MKTP.CD', souveraKey: 'gdp_current_usd' },
  { wbCode: 'NY.GDP.MKTP.KD.ZG', souveraKey: 'gdp_growth_pct' },
  { wbCode: 'SP.POP.TOTL', souveraKey: 'population_total' },
  // FDI not included
];
```

**Resolution:** DATA-ING-02B (P1)
- Add FDI indicator to World Bank adapter
- World Bank Code: `BX.KLT.DINV.CD.WD`
- Run ingestion job
- See: `docs/qa/fdi-na-data-path-debug.md` for full ingestion plan

### UX Enhancement Opportunity

**Status:** ⚠️ **OPTIONAL — UX-DATA-02 (P2)**

**Current Behavior:**
- Sector section is completely hidden when `sectors.length === 0`
- Users cannot distinguish between "not entitled" and "data pending"

**Proposed Enhancement:**
- Always show sector section header
- Show "Sectors data pending" for Professional+ when empty
- Show lock badge for Public/Explorer when empty
- Improves transparency during curated preview phase

**Implementation:** See `docs/audits/sector-visibility-debug.md` (lines 645-706)

---

## Recommendation

### ✅ PHASE 3 STEP 3 MAY BEGIN

**Rationale:**
1. ✅ **Code is correct** — All entitlement logic matches confirmed business rule
2. ✅ **API is correct** — Sector limits and FDI checks work as expected
3. ✅ **Frontend is correct** — Conditional rendering logic is accurate
4. ✅ **Documentation is consistent** — No conflicting statements found
5. ⚠️ **Data gaps are known** — Tracked in backlog, do not block Phase 3 Step 3
6. ✅ **Query param logic is orthogonal** — Does not depend on sector/FDI data

**Confidence Level:** HIGH

**Next Steps:**
1. ✅ Save this verification matrix as formal documentation
2. ✅ Proceed to Phase 3 Step 3 (Query Parameter Support)
3. ⏸️ Schedule DATA-SEED-01 (Seed Sector Data) in parallel track
4. ⏸️ Schedule DATA-ING-02B (Add FDI to World Bank Ingestion) in parallel track
5. ⏸️ Consider UX-DATA-02 (Sector Data Pending Display) after DATA-SEED-01

**Approved for Phase 3 Step 3:** ✅ YES

---

## Acceptance Criteria

### For Code Verification (Current)

- [x] `sector_teasers` entitlement exists for all tiers
- [x] `sector_rationale` entitlement exists for Professional+ only
- [x] `full_macro` entitlement exists for Professional+ only
- [x] API applies `sectorLimit = 1` for Public/Explorer
- [x] API applies `sectorLimit = 5` for Professional+
- [x] API includes FDI for Professional+ only
- [x] Frontend sets `maxVisible = 1` for Public/Explorer
- [x] Frontend sets `maxVisible = 5` for Professional+
- [x] Frontend sets `showRationale = false` for Public/Explorer
- [x] Frontend sets `showRationale = true` for Professional+
- [x] FDI shows "Data pending" when unlocked but missing (UX-DATA-01)
- [x] Documentation consistently states "1 sector for Public/Explorer"

### For Data Seeding (DATA-SEED-01 — Future)

- [ ] At least 10 African countries have sector data
- [ ] Nigeria has ≥5 sectors
- [ ] All sectors have `sector_label` and `teaser_md`
- [ ] Professional+ sectors include `rationale_md`
- [ ] Explorer sees 1 sector in UI
- [ ] Professional sees up to 5 sectors in UI
- [ ] Explorer sees "+4 more sectors with Professional access"
- [ ] API returns non-empty `sectors` array

### For FDI Ingestion (DATA-ING-02B — Future)

- [ ] World Bank adapter includes `BX.KLT.DINV.CD.WD`
- [ ] FDI observations written to `souvera_country_observations`
- [ ] Professional+ sees FDI values when available
- [ ] Countries without FDI show "Data pending"
- [ ] Source/freshness metadata populated for FDI

### For UX Enhancement (UX-DATA-02 — Future)

- [ ] Sector section always visible (not hidden when empty)
- [ ] Shows "Sectors data pending" for Professional+ when empty
- [ ] Shows lock badge for Public/Explorer when empty
- [ ] Does not break when sectors array is populated

---

## Related Documentation

- [Sector Visibility Debug Report](../audits/sector-visibility-debug.md)
- [FDI N/A Data Path Debug Report](../qa/fdi-na-data-path-debug.md)
- [UX Data Pending Metric Label](../qa/ux-data-pending-metric-label.md)
- [Data Ingestion Backlog](../backlog/data-ingestion-backlog.md)
- [Phase 2 Africa Workspace Embedding QA](../audits/phase-2-africa-workspace-embedding-qa.md)
- [Entitlements Package Implementation](../qa/entitlements-package-implementation.md)
- [Phase 3 Regional Expansion Plan](../execution/phase-3-regional-expansion-plan.md)
- [Phase 3 Step 1 Region Prop Refinement](../qa/phase-3-step-1-region-prop-refinement.md)
- [Phase 3 Step 2 Region Filter UI Implementation](../qa/phase-3-step-2-region-filter-ui-implementation.md)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Souvera Engineering | Initial verification matrix; confirmed code matches business rule |

---

**Document Status:** Complete  
**Next Action:** Proceed to Phase 3 Step 3 (Query Parameter Support)  
**Verification Confidence:** HIGH  
**Code Changes Required:** NONE
