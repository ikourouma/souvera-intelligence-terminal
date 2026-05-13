# UX-DATA-01: Data Pending Metric Label Implementation

**Document ID**: UX-DATA-01  
**Version**: 1.0  
**Status**: ✅ Implemented  
**Date**: May 2, 2026  
**Related**: [FDI N/A Data Path Debug](./fdi-na-data-path-debug.md)

---

## Executive Summary

Implemented a user experience improvement to display "Data pending" instead of "N/A" for unlocked metrics where data is not yet available. This provides clearer feedback to Professional+ users about FDI and other metrics during the curated preview phase before Phase 4A ingestion runs.

---

## Problem Statement

### Before
- Professional, Business, and Institutional users see FDI unlocked (correct entitlement).
- FDI displays "N/A" because data has not yet been seeded or ingested.
- "N/A" for an unlocked feature suggests the feature is broken or unavailable.
- Users cannot distinguish between:
  - Locked metrics (not entitled)
  - Unlocked metrics with missing data (entitled but pending ingestion)

### After
- Professional+ users see "Data pending" for FDI when no value exists.
- Explorer users still see FDI locked with "Professional+" label.
- Users understand that the feature is available but data ingestion is in progress.
- Clear distinction between locked (not entitled) and unlocked-but-missing (data pending).

---

## Implementation

### Files Changed

1. **apps/api-gateway/src/components/intelligence/EntitledMetricCard.tsx**
   - Added `missingLabel?: string` prop to `EntitledMetricCardProps`
   - Modified `formatValue()` function to accept `missingLabel` parameter with default `'N/A'`
   - Updated component to pass `missingLabel` to `formatValue()` when rendering unlocked metrics

2. **apps/api-gateway/src/components/intelligence/CountryIntelligencePanel.tsx**
   - Updated FDI `EntitledMetricCard` to pass `missingLabel="Data pending"`
   - Preserved all other metric cards with default "N/A" behavior
   - Maintained locked/unlocked entitlement logic

### Code Changes

#### EntitledMetricCard.tsx

**Interface:**
```typescript
interface EntitledMetricCardProps {
  label: string;
  value: number | string | undefined | null;
  icon?: LucideIcon;
  color?: string;
  locked?: boolean;
  lockedLabel?: string;
  missingLabel?: string;  // NEW
  formatType?: 'currency' | 'population' | 'percentage' | 'number';
}
```

**Format Function:**
```typescript
function formatValue(
  value: number | string | undefined | null, 
  formatType: EntitledMetricCardProps['formatType'],
  missingLabel: string = 'N/A'  // NEW PARAMETER
): string {
  if (value === undefined || value === null) return missingLabel;  // Uses custom label
  // ... rest of formatting logic
}
```

**Component:**
```typescript
export function EntitledMetricCard({
  label,
  value,
  icon,
  color,
  locked = false,
  lockedLabel = 'Professional+',
  missingLabel = 'N/A',  // NEW PROP
  formatType = 'number',
}: EntitledMetricCardProps) {
  // ...
  return (
    <div className="bg-zinc-900/70 p-4">
      {/* ... */}
      <div className={`text-xl font-bold ${textColor}`}>
        {formatValue(value, formatType, missingLabel)}  // Passes missingLabel
      </div>
    </div>
  );
}
```

#### CountryIntelligencePanel.tsx

**FDI Card:**
```typescript
<EntitledMetricCard
  label="FDI"
  value={data.metrics.fdiNetInflowsUsd}
  formatType="currency"
  locked={!hasFdiAccess}
  lockedLabel="Professional+"
  missingLabel="Data pending"  // NEW
/>
```

---

## Behavior Matrix

### Tier-Based FDI Display

| Access Tier   | Entitlement | Data Available | Display               |
|---------------|-------------|----------------|-----------------------|
| Public        | ❌ Locked   | N/A            | 🔒 Professional+      |
| Explorer      | ❌ Locked   | N/A            | 🔒 Professional+      |
| Professional  | ✅ Unlocked | ✅ Yes         | $X.XB (formatted)     |
| Professional  | ✅ Unlocked | ❌ No          | Data pending          |
| Business      | ✅ Unlocked | ✅ Yes         | $X.XB (formatted)     |
| Business      | ✅ Unlocked | ❌ No          | Data pending          |
| Institutional | ✅ Unlocked | ✅ Yes         | $X.XB (formatted)     |
| Institutional | ✅ Unlocked | ❌ No          | Data pending          |

### Other Metrics (GDP, GDP Growth, Population)

All other metrics retain default "N/A" behavior if data is missing.

---

## Verification

### Build and Lint
- ✅ Build: Passed (exit code 0)
- ✅ Lint: No errors
- ✅ TypeScript: No type errors

### Manual QA Checklist

#### Explorer Account
- [ ] Login as `explorer@afronovation.com`
- [ ] Navigate to `/intelligence/map`
- [ ] Select Nigeria
- [ ] Verify FDI card shows 🔒 locked state with "Professional+" label
- [ ] Verify FDI card does NOT show "Data pending"
- [ ] Repeat on `/intelligence/africa`

#### Professional Account
- [ ] Login as `professional@afronovation.com`
- [ ] Navigate to `/intelligence/map`
- [ ] Select Nigeria
- [ ] Verify FDI card is unlocked
- [ ] Verify FDI displays "Data pending" (amber text)
- [ ] Verify GDP, GDP Growth, Population display correctly if data exists
- [ ] Repeat on `/intelligence/africa`

#### Business Account
- [ ] Login as `business@afronovation.com`
- [ ] Navigate to `/intelligence/map`
- [ ] Select Nigeria
- [ ] Verify FDI card is unlocked
- [ ] Verify FDI displays "Data pending"
- [ ] Repeat on `/intelligence/africa`

#### Institutional Account
- [ ] Login as `institutional@afronovation.com`
- [ ] Navigate to `/intelligence/map`
- [ ] Select Nigeria
- [ ] Verify FDI card is unlocked
- [ ] Verify FDI displays "Data pending"
- [ ] Repeat on `/intelligence/africa`

---

## What Was NOT Changed

- ❌ API contracts (`/api/v1/country-lite`, `/api/v1/countries`)
- ❌ Entitlement logic (`@souvera/entitlements`)
- ❌ RLS policies
- ❌ Database schema
- ❌ Ingestion services
- ❌ "Curated Preview Data" UI language
- ❌ Other metric default "N/A" labels

---

## Known Limitations

1. **FDI data is still missing**: This UX change does not populate FDI data. It only improves the display when data is absent.
2. **Default label remains "N/A"**: Only FDI explicitly uses "Data pending." Other metrics with missing data will still show "N/A" unless explicitly configured.
3. **Manual QA required**: The P0 RLS fix (v1.10) and entitlement testing must be completed before full tier-based QA can confirm this behavior.

---

## Future Work

### Phase 4A Ingestion
When FDI ingestion is implemented:
- World Bank adapter will pull `BX.KLT.DINV.CD.WD` (FDI Net Inflows)
- FDI observations will appear in `souvera_country_observations`
- Professional+ users will see formatted FDI values instead of "Data pending"
- "Data pending" will only appear for countries where World Bank data is unavailable

See:
- [Data Ingestion Backlog](../backlog/data-ingestion-backlog.md) — Task DATA-ING-02B
- [Source Ingestion Activation Plan](../execution/source-ingestion-activation-plan.md) — Phase 4A

### Other Metrics
If other Professional+ metrics (e.g., inflation, trade data) are added before ingestion runs, they can also use `missingLabel="Data pending"`.

---

## Acceptance Criteria

### ✅ Completed
- [x] `missingLabel` prop added to `EntitledMetricCard`
- [x] `formatValue()` accepts and uses `missingLabel` parameter
- [x] FDI card passes `missingLabel="Data pending"`
- [x] Build passes
- [x] Lint passes
- [x] TypeScript passes
- [x] No API changes
- [x] No entitlement changes
- [x] No RLS changes
- [x] No database schema changes
- [x] No ingestion changes
- [x] Locked metrics remain locked for Public/Explorer
- [x] Default "N/A" preserved for other metrics

### ⏳ Pending Manual QA
- [ ] Explorer: FDI locked, no "Data pending" visible
- [ ] Professional: FDI unlocked, "Data pending" visible
- [ ] Business: FDI unlocked, "Data pending" visible
- [ ] Institutional: FDI unlocked, "Data pending" visible
- [ ] Mobile layout clean
- [ ] No prohibited language introduced
- [ ] `/intelligence/map` works
- [ ] `/intelligence/africa` works

---

## Recommendation

✅ **Phase 2 QA can proceed after P0 RLS v1.10 is applied and verified.**

UX-DATA-01 is a minor UI polish that does not block Phase 2 QA. However, full tier-based QA should wait for:
1. P0 SQL Pack v1.10 applied
2. Dev server restarted
3. Browser cache cleared
4. Test-user tier verification completed

---

## Related Documentation

- [FDI N/A Data Path Debug](./fdi-na-data-path-debug.md)
- [Data Ingestion Backlog](../backlog/data-ingestion-backlog.md)
- [P0 Auth Entitlement Fix Implementation](./p0-auth-entitlement-fix-implementation.md)
- [Source Ingestion Activation Plan](../execution/source-ingestion-activation-plan.md)

---

## Document History

| Version | Date         | Author | Changes                                      |
|---------|--------------|--------|----------------------------------------------|
| 1.0     | May 2, 2026  | AI     | Initial implementation documentation         |
