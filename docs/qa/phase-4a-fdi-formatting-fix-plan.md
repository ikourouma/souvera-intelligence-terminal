# Phase 4A — FDI Formatting Fix Plan

**Date:** 2026-05-05  
**Priority:** **P1 — High Impact UX Issue**  
**Status:** 🔴 BUG CONFIRMED — Ready for Fix  
**Issue Type:** Frontend Formatting Logic  
**Affected Component:** `EntitledMetricCard.tsx`

---

## Executive Summary

FDI values are displaying in poor, unprofessional format due to incorrect handling of negative numbers in the currency formatter. The `formatValue` function checks magnitude using `value >= threshold`, which fails for negative values, causing them to bypass abbreviation logic.

**Current Behavior:**
- `-453157052` displays as `$-453157052`
- `-1109663097` displays as `$-1109663097`  
- `-37555190` displays as `$-37555190`

**Expected Behavior:**
- `-453157052` should display as `-$453.2M`
- `-1109663097` should display as `-$1.11B`
- `-37555190` should display as `-$37.6M`

**Impact:** Professional+ users see poorly formatted negative FDI values, undermining platform credibility.

**Root Cause:** Identified and confirmed (see below).

---

## Root Cause Analysis

### File

**Path:** `apps/api-gateway/src/components/intelligence/EntitledMetricCard.tsx`

**Lines:** 26-31

### Current Implementation

```typescript
case 'currency':
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
```

### Problem

1. **Negative values fail threshold checks:**
   - `-453157052 >= 1e9` evaluates to `false` (negative < positive)
   - Falls through all conditions to `return $${value.toFixed(0)}`
   - Results in `$-453157052` instead of `-$453.2M`

2. **Dollar sign placement:**
   - Current logic always puts `$` first: `$-453157052`
   - Should be `-$453M` (sign before currency symbol)

### Why This Happens

The formatter was originally written for GDP and Population (always positive). When FDI was added (which can be negative), the negative case was not handled.

---

## Proposed Fix

### Strategy

Use `Math.abs(value)` to check magnitude, then preserve the sign in formatting.

### Implementation

```typescript
case 'currency':
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1e12) return `${sign}$${(absValue / 1e12).toFixed(1)}T`;
  if (absValue >= 1e9) return `${sign}$${(absValue / 1e9).toFixed(1)}B`;
  if (absValue >= 1e6) return `${sign}$${(absValue / 1e6).toFixed(1)}M`;
  if (absValue >= 1e3) return `${sign}$${(absValue / 1e3).toFixed(1)}K`;
  return `${sign}$${absValue.toFixed(0)}`;
```

### Changes Explained

1. **`const absValue = Math.abs(value)`** — Get absolute value for magnitude comparison
2. **`const sign = value < 0 ? '-' : ''`** — Preserve negative sign
3. **`${sign}$${...}`** — Place sign before dollar sign: `-$453M` not `$-453M`
4. **Use `absValue` in all calculations** — Ensures proper abbreviation

---

## Test Cases

| Input Value | Current Output | Expected Output | Status |
|-------------|----------------|-----------------|--------|
| `1080310701.18` | `$1.1B` ✅ | `$1.08B` | ✅ Works |
| `-453157051.59` | `$-453157052` ❌ | `-$453.2M` | ❌ BUG |
| `-1109663097` | `$-1109663097` ❌ | `-$1.11B` | ❌ BUG |
| `-37555190` | `$-37555190` ❌ | `-$37.6M` | ❌ BUG |
| `-12572108` | `$-12572108` ❌ | `-$12.6M` | ❌ BUG |
| `305079506.2` | `$305.1M` ✅ | `$305.1M` | ✅ Works |
| `463439704.196` | `$463.4M` ✅ | `$463.4M` | ✅ Works |
| `0` | `$0` ✅ | `$0` | ✅ Works |
| `null` | `Data pending` ✅ | `Data pending` | ✅ Works |
| `undefined` | `Data pending` ✅ | `Data pending` | ✅ Works |

---

## Verification After Fix

### Browser Testing

**Test Route:** `/intelligence/map?region=caribbean&selected=TTO`

**Test User:** `professional@afronovation.com`

**Expected:**
- FDI card shows `-$453.2M` (not `$-453157052`)
- No blur overlay (Professional+ unlocked)
- Globe icon with amber color
- "FDI" label

**Also Test:**
- `/intelligence/map?region=africa&selected=NGA` — Positive FDI: `$1.08B`
- `/intelligence/map?region=africa&selected=ZAF` — Positive FDI: `$2.33B`
- `/intelligence/map?region=caribbean&selected=JAM` — Positive FDI: `$305.1M`

### TypeScript Verification

```bash
cd apps/api-gateway
npx tsc --noEmit
```

**Expected:** 0 new errors

### Lint Verification

```bash
cd apps/api-gateway
npx eslint src/components/intelligence/EntitledMetricCard.tsx
```

**Expected:** 0 new warnings

---

## Related Components

### Other Formatters

These components also have currency formatting but are NOT affected (they don't handle FDI):

1. **`CountryDrawer.tsx`** (lines 107-113)
   - Has `formatCurrency` function
   - Only used for GDP (always positive)
   - No fix needed

2. **`CountryComparisonTool.tsx`** (line 166)
   - Has `formatNumber` function with `prefix` parameter
   - Only used for GDP (always positive)
   - No fix needed

3. **`MapTooltip.tsx`** (line 23)
   - Has `formatNumber` function
   - Only used for GDP and Population (always positive)
   - No fix needed

4. **`AllRegionsMarketShell.tsx`** (line 55)
   - Has `formatCurrency` function
   - Only used for GDP in table (always positive)
   - No fix needed

5. **`CaribbeanMarketShell.tsx`** (line 33)
   - Has `formatCurrency` function
   - Only used for GDP in table (always positive)
   - No fix needed

**Conclusion:** Only `EntitledMetricCard.tsx` needs fixing because it's the only component displaying FDI values.

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| Negative FDI values display with proper abbreviation | ⏳ Pending |
| Sign appears before dollar symbol (e.g., `-$453M`) | ⏳ Pending |
| Positive values remain unchanged | ⏳ Pending |
| NULL/undefined values still show "Data pending" | ⏳ Pending |
| Zero displays as `$0` | ⏳ Pending |
| TypeScript compiles with 0 new errors | ⏳ Pending |
| ESLint passes with 0 new warnings | ⏳ Pending |
| Professional+ users see correct format in browser | ⏳ Pending |
| Explorer users see locked overlay (no format change needed) | ⏳ Pending |

---

## Implementation Steps

1. ✅ **Investigation Complete** — Root cause identified
2. ⏸️ **Code Change** — Update `EntitledMetricCard.tsx` lines 26-31
3. ⏸️ **TypeScript Check** — Run `npx tsc --noEmit`
4. ⏸️ **Lint Check** — Run `npx eslint`
5. ⏸️ **Browser QA** — Test TTO (negative), NGA (positive), null case
6. ⏸️ **Mobile QA** — Verify format on 375px, 768px, 1024px
7. ⏸️ **Documentation Update** — Mark fix complete in this document

---

## Risk Assessment

**Risk Level:** 🟢 Low

**Why Low Risk:**
- Single file change
- Pure formatting logic (no data model changes)
- No API changes
- No RLS changes
- TypeScript will catch any syntax errors
- Easy to test visually

**Rollback Strategy:** If formatting breaks, revert to previous `formatValue` implementation.

---

## Related Issues

### Issue 2: Data Coverage Gaps

Some countries show "N/A" for legitimate source data gaps (not a bug).

**See:** `docs/qa/phase-4a-country-data-verification.sql` for SQL queries to identify true gaps.

### Issue 3: Equatorial Guinea Map Rendering

Separate issue — GNQ not rendering on Africa map (GeoJSON data source issue).

**See:** `docs/qa/phase-4a-equatorial-guinea-map-debug.md`

---

## Recommendation

**✅ APPROVED FOR IMMEDIATE IMPLEMENTATION**

This is a straightforward formatting fix with high UX impact and low risk. The fix should be implemented immediately to improve Professional+ user experience.

**Implementation Time:** 5 minutes  
**Testing Time:** 10 minutes  
**Total Time:** 15 minutes

---

**Document Status:** ✅ COMPLETE — Ready for Implementation  
**Next Step:** Implement fix in `EntitledMetricCard.tsx`  
**Owner:** Platform Engineering
