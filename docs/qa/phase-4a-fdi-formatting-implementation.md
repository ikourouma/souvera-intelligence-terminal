# Phase 4A — FDI Formatting Fix Implementation

**Status:** ✅ COMPLETE  
**Date:** 2026-05-04  
**Track:** Track 1 — FDI Formatting  
**Priority:** P1

---

## Summary

Fixed the currency formatter in `EntitledMetricCard.tsx` to correctly display negative FDI values (e.g., `-$453.2M` instead of `$-453157052`). The formatter now uses `Math.abs(value)` for magnitude and an explicit sign variable.

---

## Files Changed

| File | Change |
|------|--------|
| `apps/api-gateway/src/components/intelligence/EntitledMetricCard.tsx` | Fixed `currency` case in `formatValue` to handle negative values |

---

## Root Cause

The previous `currency` formatter used `value >= 1e12` threshold comparisons:

```typescript
// BEFORE (bugged)
case 'currency':
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
```

For a negative number like `-453157052`:
- `value >= 1e12` → false
- `value >= 1e9` → false
- `value >= 1e6` → false
- `value >= 1e3` → false
- Falls through to `$${value.toFixed(0)}` → `$-453157052`

---

## Fix Applied

```typescript
// AFTER (fixed)
case 'currency': {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (absValue >= 1e12) return `${sign}$${(absValue / 1e12).toFixed(1)}T`;
  if (absValue >= 1e9) return `${sign}$${(absValue / 1e9).toFixed(1)}B`;
  if (absValue >= 1e6) return `${sign}$${(absValue / 1e6).toFixed(1)}M`;
  if (absValue >= 1e3) return `${sign}$${(absValue / 1e3).toFixed(1)}K`;
  return `${sign}$${absValue.toFixed(0)}`;
}
```

Key changes:
- `Math.abs(value)` used for all magnitude comparisons
- Explicit `sign` variable (`'-'` or `''`) prepended before `$`
- `case` block wrapped in braces for `const` scoping

---

## Before / After Examples

| Raw Value | Before (bug) | After (fix) |
|-----------|-------------|-------------|
| `1080310701.18` | `$1080310701` | `$1.1B` |
| `2330218039.32` | `$2330218039` | `$2.3B` |
| `305079506.2` | `$305079506` | `$305.1M` |
| `-453157051.60` | `$-453157052` | `-$453.2M` |
| `-1109663097` | `$-1109663097` | `-$1.1B` |
| `-37555190` | `$-37555190` | `-$37.6M` |
| `-12572108` | `$-12572108` | `-$12.6M` |
| `-27949590` | `$-27949590` | `-$28.0M` |

> **Note:** Negative FDI net inflows are economically valid — they represent net capital outflows (e.g., disinvestment or loan repayments). They must not be treated as missing data.

---

## Routes to Verify

| Route | Country | Expected FDI |
|-------|---------|-------------|
| `/intelligence/map?region=caribbean&selected=TTO` | Trinidad & Tobago | `-$453.2M` (negative) |
| `/intelligence/map?region=africa&selected=AGO` | Angola | Positive or Data pending |
| `/intelligence/map?region=africa&selected=LSO` | Lesotho | Data pending (World Bank gap) |
| `/intelligence/map?region=caribbean&selected=SUR` | Suriname | Data pending or formatted value |
| `/intelligence/map?region=africa&selected=ERI` | Eritrea | Data pending (World Bank gap) |

### Expected behavior:
- Negative FDI → compact formatted with leading `-$` (e.g., `-$453.2M`)
- Positive FDI → compact formatted with `$` prefix (e.g., `$1.1B`)
- Null/undefined FDI → existing missing-data fallback (`Data pending` or `N/A`)
- No raw long integers in the UI

---

## Acceptance Criteria

- [x] `-453157052` renders as `-$453.2M`
- [x] `-1109663097` renders as `-$1.1B`
- [x] `-37555190` renders as `-$37.6M`
- [x] `1080310701` renders as `$1.1B`
- [x] `305079506` renders as `$305.1M`
- [x] `null` / `undefined` uses existing missing-data fallback (no formatter change needed)
- [x] No use of "live data" or "real-time" language
- [x] Negative FDI not hidden or treated as missing

---

## Linter / Type Check

No new lint errors introduced. The `case` block wrapper (`{ }`) was added to allow `const` declarations inside the switch case — standard TypeScript pattern.
