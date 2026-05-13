# Phase 4A Stage 2 Batch C: Verification Schema Fix

**Date:** 2026-05-05  
**Status:** ✅ FIXED  
**Issue:** Schema mismatch in verification SQL  
**File:** `infra/supabase/verification/phase-4a-stage2-batch-c-southern-africa-verification.sql`

---

## Issue Summary

**Error Encountered:**
```
ERROR: 42703: column scs.created_at does not exist
LINE 249:
  MIN(scs.created_at) AS earliest_row,
```

**Root Cause:**
The verification SQL script referenced `scs.created_at` in the summary query, but the `souvera_country_sectors` table does not have a `created_at` column. 

**Schema Reality:**
- ✅ `souvera_country_sectors` has `updated_at` column
- ❌ `souvera_country_sectors` does NOT have `created_at` column

---

## Root Cause Analysis

### What Happened

The verification SQL included a summary query to show timestamp ranges:

```sql
-- INCORRECT (Original):
SELECT 
  '=== BATCH C VERIFICATION SUMMARY ===' AS summary,
  COUNT(DISTINCT c.iso3) AS countries_with_sectors,
  COUNT(scs.id) AS total_rows,
  COUNT(DISTINCT scs.sector_key) AS unique_sector_keys,
  MIN(scs.created_at) AS earliest_row,  -- ❌ Column does not exist
  MAX(scs.created_at) AS latest_row      -- ❌ Column does not exist
FROM public.souvera_countries c
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 IN (SELECT iso3 FROM batch_c_countries);
```

### Why This Happened

The seed SQL uses `updated_at` in the `ON CONFLICT` clause:

```sql
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label,
  teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md,
  strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score,
  display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id,
  updated_at = now();  -- ✅ updated_at exists
```

The verification script incorrectly assumed a `created_at` column existed, when only `updated_at` is present.

---

## Fix Applied

### Replacement Made

**Lines 249-250 Changed:**

```sql
-- BEFORE (Incorrect):
  MIN(scs.created_at) AS earliest_row,
  MAX(scs.created_at) AS latest_row

-- AFTER (Correct):
  MIN(scs.updated_at) AS earliest_updated_at,
  MAX(scs.updated_at) AS latest_updated_at
```

### Complete Fixed Query

```sql
-- CORRECT (Fixed):
WITH batch_c_countries AS (
  SELECT unnest(ARRAY['BWA','SWZ','LSO','MWI','MOZ','NAM','ZMB','ZWE']) AS iso3
)
SELECT 
  '=== BATCH C VERIFICATION SUMMARY ===' AS summary,
  COUNT(DISTINCT c.iso3) AS countries_with_sectors,
  COUNT(scs.id) AS total_rows,
  COUNT(DISTINCT scs.sector_key) AS unique_sector_keys,
  MIN(scs.updated_at) AS earliest_updated_at,  -- ✅ Column exists
  MAX(scs.updated_at) AS latest_updated_at      -- ✅ Column exists
FROM public.souvera_countries c
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 IN (SELECT iso3 FROM batch_c_countries);
```

---

## Schema Confirmation

### Columns in `souvera_country_sectors`

Based on seed SQL `ON CONFLICT` clause and INSERT statement:

| Column | Type | Present |
|--------|------|---------|
| `id` | uuid | ✅ Yes |
| `country_id` | uuid | ✅ Yes |
| `sector_key` | text | ✅ Yes |
| `sector_label` | text | ✅ Yes |
| `teaser_md` | text | ✅ Yes |
| `rationale_md` | text | ✅ Yes |
| `strength_score` | integer | ✅ Yes |
| `growth_score` | integer | ✅ Yes |
| `display_order` | integer | ✅ Yes |
| `min_plan_id` | text | ✅ Yes |
| `updated_at` | timestamp | ✅ Yes (set via ON CONFLICT) |
| `created_at` | timestamp | ❌ No (does not exist) |

---

## Impact Assessment

### What Was Affected

- **Verification SQL:** Summary query (lines 249-250)
- **Core Checks:** All 13 verification checks remain intact
- **Seed SQL:** No changes required (already correct)
- **Schema:** No schema changes (fix is query-side only)

### What Was NOT Affected

- ✅ All 13 core verification checks remain functional
- ✅ Seed SQL is correct and unchanged
- ✅ No schema modifications required
- ✅ No data corruption or loss
- ✅ Script remains read-only
- ✅ Supabase SQL Editor compatible

---

## Other Verification Files Checked

### Files Inspected

Searched for `scs.created_at` in all verification files:

1. ✅ `phase-4a-digital-tourism-priority-20-verification.sql` — No `created_at` references
2. ✅ `phase-4a-sector-priority-20-verification.sql` — No `created_at` references
3. ✅ `phase-4a-sector-pilot-verification.sql` — No `created_at` references
4. ✅ `phase-4a-sector-readiness-verification.sql` — No `created_at` references

**Conclusion:** Only Batch C verification file had this issue. All other verification files are correct.

---

## Rerun Instructions

### Step 1: Execute Seed SQL (if not already done)

```
File: infra/supabase/sql-pack-v1.13c-stage2-africa-southern.sql
Expected: 56 rows inserted/updated
```

### Step 2: Execute Corrected Verification SQL

```
File: infra/supabase/verification/phase-4a-stage2-batch-c-southern-africa-verification.sql
Expected: All 13 checks pass, summary shows updated_at timestamps
```

### Expected Summary Output

After fix, the summary query should return:

| summary | countries_with_sectors | total_rows | unique_sector_keys | earliest_updated_at | latest_updated_at |
|---------|------------------------|------------|--------------------|--------------------|-------------------|
| === BATCH C VERIFICATION SUMMARY === | 8 | 56 | 7 | [timestamp] | [timestamp] |

**Notes:**
- `earliest_updated_at` and `latest_updated_at` will show when rows were last updated
- If rows are newly inserted, both timestamps will be identical
- If rows existed before (e.g., from earlier test), timestamps may vary

---

## Files Changed

| File | Status | Changes |
|------|--------|---------|
| `infra/supabase/verification/phase-4a-stage2-batch-c-southern-africa-verification.sql` | ✅ Fixed | Lines 249-250: `created_at` → `updated_at` |
| `docs/qa/phase-4a-stage2-batch-c-southern-africa-implementation.md` | ✅ Updated | Added "Verification Schema Fix" section |

---

## Confirmation Checklist

- [x] `scs.created_at` references removed
- [x] `scs.updated_at` references confirmed valid
- [x] All 13 core verification checks preserved
- [x] Summary query corrected
- [x] Script remains read-only
- [x] Supabase SQL Editor compatible
- [x] No psql meta-commands introduced
- [x] No seed SQL changes required
- [x] No schema changes required
- [x] Documentation updated
- [x] Other verification files checked (no issues found)

---

## Recommendation

**✅ VERIFICATION SQL IS NOW READY TO RUN**

The schema mismatch has been corrected. The verification script now uses the correct `updated_at` column instead of the non-existent `created_at` column.

**Next steps:**
1. Execute Batch C seed SQL (if not already done)
2. Rerun corrected verification SQL
3. All 13 checks should pass
4. Summary should display valid timestamps

---

**END OF VERIFICATION SCHEMA FIX SUMMARY**
