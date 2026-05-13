# Phase 4A Stage 2 Batch D — Verification Schema Fix

**Date:** 2026-05-05  
**Issue:** Schema mismatch in Caribbean coverage verification  
**Status:** ✅ Fixed  

---

## Error Report

### Error Message

```
ERROR: 42703: column c.region_slug does not exist
LINE 191:
  WHERE c.region_slug = 'caribbean'
```

### File Affected

```
infra/supabase/verification/phase-4a-stage2-batch-d-caribbean-verification.sql
```

### Check Affected

**Check 13: Caribbean sector coverage breakdown**

---

## Root Cause Analysis

### Schema Issue

The verification script (Check 13) attempted to use `c.region_slug = 'caribbean'` to filter Caribbean countries from the `souvera_countries` table. However, the `region_slug` column does not exist in the table schema.

### Original Query (Lines 184-204)

```sql
WITH caribbean_countries AS (
  SELECT c.id, c.iso3, c.name
  FROM public.souvera_countries c
  WHERE c.region_slug = 'caribbean'  -- ❌ Non-existent column
)
SELECT 'Check 13: Caribbean Coverage' AS check_name,
  COUNT(DISTINCT cc.iso3) AS caribbean_countries_with_sectors,
  20 AS expected_countries,
  COUNT(scs.id) AS total_caribbean_sector_rows,
  140 AS expected_rows,
  CASE 
    WHEN COUNT(DISTINCT cc.iso3) = 20 AND COUNT(scs.id) = 140 
    THEN '✓ PASS' 
    ELSE '✗ FAIL' 
  END AS status
FROM caribbean_countries cc
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = cc.id;
```

### Why This Occurred

The verification script was designed before confirming the exact schema of `souvera_countries`. The assumed `region_slug` column does not exist, causing a PostgreSQL error when the query attempts to reference it.

---

## Fix Applied

### Replacement Strategy

Replaced the schema-dependent `region_slug` filter with an **explicit ISO3 array** for all 20 approved Caribbean countries using a self-contained CTE.

### Fixed Query (Lines 184-204)

```sql
-- Check 13: Caribbean sector coverage breakdown
-- Stage 1 covered 7 priority Caribbean markets (JAM, TTO, BRB, DOM, BHS, GRD, LCA)
-- Batch D covers 13 remaining Caribbean markets
-- Total Caribbean should have 20 countries × 7 sectors = 140 rows
WITH approved_caribbean AS (
  SELECT unnest(ARRAY[
    'JAM','TTO','BRB','DOM','BHS','GRD','LCA',
    'ATG','CUB','DMA','HTI','KNA','VCT','SUR','GUY','BLZ','PRI','VGB','TCA','CYM'
  ]) AS iso3
)
SELECT 'Check 13: Caribbean Coverage' AS check_name,
  COUNT(DISTINCT c.iso3) AS caribbean_countries_with_sectors,
  20 AS expected_countries,
  COUNT(scs.id) AS total_caribbean_sector_rows,
  140 AS expected_rows,
  CASE 
    WHEN COUNT(DISTINCT c.iso3) = 20 AND COUNT(scs.id) = 140 
    THEN '✓ PASS' 
    ELSE '✗ FAIL' 
  END AS status
FROM approved_caribbean ac
JOIN public.souvera_countries c ON c.iso3 = ac.iso3
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id;
```

### Fix Characteristics

1. **Schema-independent:** No reliance on `region_slug` or any other schema fields beyond `iso3` (which is confirmed to exist)
2. **Explicit scope:** All 20 Caribbean ISO3 codes are explicitly listed in the array
3. **Self-contained:** Uses CTE pattern consistent with other checks in the verification script
4. **Accurate:** Reflects the correct Caribbean scope (7 Stage 1 priority + 13 Batch D)
5. **Maintainable:** Clear comments document which countries are Stage 1 vs Batch D

---

## Caribbean Scope Confirmed

### Stage 1 Priority Caribbean (7)
- JAM (Jamaica)
- TTO (Trinidad and Tobago)
- BRB (Barbados)
- DOM (Dominican Republic)
- BHS (The Bahamas)
- GRD (Grenada)
- LCA (Saint Lucia)

### Batch D Caribbean (13)
- ATG (Antigua and Barbuda)
- CUB (Cuba)
- DMA (Dominica)
- HTI (Haiti)
- KNA (Saint Kitts and Nevis)
- VCT (Saint Vincent and the Grenadines)
- SUR (Suriname)
- GUY (Guyana)
- BLZ (Belize)
- PRI (Puerto Rico)
- VGB (British Virgin Islands)
- TCA (Turks and Caicos Islands)
- CYM (Cayman Islands)

### Total Caribbean Coverage
**20 countries × 7 sectors = 140 sector rows**

---

## Schema Confirmation

### Existing Columns in `souvera_countries`

Based on verification script usage across all batches, the following columns are confirmed to exist:
- `id` (primary key)
- `iso3` (country code)
- `name` (country name)
- `is_active` (boolean)
- `is_african_country` (boolean, used in Stage 2 plan verification)

### Non-Existent Columns

- `region_slug` ❌ (attempted use caused this error)
- Any other region-based categorization column

### Recommendation

All verification scripts should use explicit ISO3 arrays for country filtering rather than relying on schema-based region fields that may or may not exist.

---

## Impact Assessment

### Checks Affected
- **Check 13 only:** Caribbean sector coverage breakdown

### Checks Unaffected
All other checks (1-12, 14, and summary) use explicit Batch D ISO3 arrays and are not affected by this schema issue.

### Batch C Verification
Inspected `phase-4a-stage2-batch-c-southern-africa-verification.sql` and confirmed it does **not** use `region_slug` or any other non-existent schema fields. No fix required for Batch C.

---

## Verification Rerun Instructions

After applying the fix:

1. **Execute Batch D seed SQL** (if not already done):
   ```
   infra/supabase/sql-pack-v1.13d-stage2-caribbean.sql
   ```

2. **Run corrected verification SQL**:
   ```
   infra/supabase/verification/phase-4a-stage2-batch-d-caribbean-verification.sql
   ```

3. **Expected results:**
   - Check 1: Total Batch D rows = 91 ✓ PASS
   - Check 2: Each country has 7 sectors ✓ PASS
   - Check 3: All 13 countries present ✓ PASS
   - Check 4: All 7 sector keys per country ✓ PASS
   - Check 5: No duplicate sector keys ✓ PASS
   - Check 6: All min_plan_id = 'explorer' ✓ PASS
   - Check 7: Display order values 1–7 ✓ PASS
   - Check 8: Teaser MD populated ✓ PASS
   - Check 9: Rationale MD populated ✓ PASS
   - Check 10: Digital Infrastructure samples display ✓ PASS
   - Check 11: Tourism & Hospitality samples display ✓ PASS
   - Check 12: Global total = 287 ✓ PASS
   - **Check 13: Caribbean coverage = 20 countries, 140 rows ✓ PASS**
   - Check 14: ESH exclusion = 0 rows ✓ PASS

4. **Confirm all 14 checks return `✓ PASS`**

---

## Related Documentation

- **Implementation guide:** `docs/qa/phase-4a-stage2-batch-d-caribbean-implementation.md` (updated with schema fix note)
- **Summary:** `docs/qa/phase-4a-stage2-batch-d-summary.md`
- **Stage 2 plan:** `docs/execution/phase-4a-stage-2-all-74-sector-coverage-plan.md`
- **Batch C schema fix:** `docs/qa/phase-4a-stage2-batch-c-verification-schema-fix.md` (similar `created_at` → `updated_at` issue)

---

**Fix Confirmed:** ✅ Complete  
**Verification Status:** Ready for rerun  
**Date:** 2026-05-05
