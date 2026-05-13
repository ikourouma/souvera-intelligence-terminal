# Phase 4A — Supabase SQL Execution Guide

**Platform:** Supabase SQL Editor  
**Project:** Souvera Intelligence Terminal  
**Date:** 2026-05-04  
**Owner:** Afronovation, Inc.

---

## Overview

This guide contains all SQL scripts you need to run manually through the **Supabase SQL Editor** for Phase 4A verification and data validation.

**IMPORTANT:** These scripts are **read-only verification queries** unless explicitly marked otherwise. They inspect database state without modifying data.

---

## Prerequisites

1. **Access Supabase Dashboard:** https://supabase.com/dashboard
2. **Navigate to SQL Editor:** Project → SQL Editor → New Query
3. **Have these credentials ready:**
   - Supabase project URL
   - Service role key (for ingestion CLI)

---

## Execution Order

### STEP 0: SQL v1.10 RLS Verification (READ-ONLY)

**Purpose:** Verify that SQL Pack v1.10 was successfully applied and recursive RLS policies were removed.

**File:** `infra/supabase/verification/phase-4a-sql-v110-verification.sql`

**Action:** Copy and paste the entire file into Supabase SQL Editor, then click "Run".

**Expected Output:**
```
✅ SQL v1.10 APPLIED: Legacy policies removed
✅ FDI indicator exists in souvera_indicators
✅ FDI column exists in souvera_country_professional_v
```

**If Output Shows Errors:**
- ❌ "SQL v1.10 NOT APPLIED" → Run `sql-pack-v1.10-drop-recursive-rls-policies.sql` first
- ❌ "FDI indicator missing" → Check `sql-pack-v1.1.sql` was applied (baseline schema)
- ❌ "FDI column missing" → Check `sql-pack-v1.6-view-fix.sql` was applied

---

### STEP 1: World Bank Ingestion (EXTERNAL COMMAND)

**Purpose:** Populate FDI observations (and refresh GDP, growth, population data).

**Status:** ✅ COMPLETE — Executed 2026-05-05 01:33:18.413+00

**Location:** Terminal / Command Line (NOT Supabase SQL Editor)

**Command:**

```bash
npx tsx services/ingestion/run.ts worldbank
```

**Actual Result:**

```
[World Bank] Starting ingestion...
[World Bank] Fetching gdp_current_usd...
[World Bank] Fetching gdp_growth_pct...
[World Bank] Fetching population_total...
[World Bank] Fetching fdi_net_inflows_usd...
[World Bank] Ingestion complete: 5747 processed, 0 failed
Source health updated: 2026-05-05 01:33:18.413+00
```

**Result Summary:**
- ✅ Records Processed: 5747
- ✅ Records Failed: 0
- ✅ FDI Observations Created: 1376
- ✅ Duration: ~7 minutes
- ✅ Success Rate: 100%

**Verification Results:** See [`docs/qa/phase-4a-fdi-ingestion-verification-results.md`](../../docs/qa/phase-4a-fdi-ingestion-verification-results.md)

---

### STEP 2: FDI Observation Verification (READ-ONLY)

**Purpose:** Verify that World Bank ingestion successfully created FDI observations.

**File:** `infra/supabase/verification/phase-4a-fdi-verification.sql`

**Action:** Copy and paste the entire file into Supabase SQL Editor, then click "Run".

**Expected Output:**
```
✅ Total observations: >100
✅ Countries with data: ~50-70
✅ fdi_net_inflows_usd column exists
✅ Nigeria FDI value: $XXXXXXX
```

**If Output Shows Errors:**
- ❌ "No FDI observations found" → World Bank ingestion did not run or failed
- ⚠️ "Nigeria FDI value: NULL" → Nigeria may lack World Bank FDI data (check other countries)
- ❌ "fdi_net_inflows_usd column missing" → View not updated correctly

---

### STEP 3: Market Count Verification (READ-ONLY)

**Purpose:** Verify that market counts match Phase 3 canonical scope (54 Africa + 20 Caribbean = 74 total).

**File:** `infra/supabase/verification/phase-4a-market-count-verification.sql`

**Action:** Copy and paste the entire file into Supabase SQL Editor, then click "Run".

**Expected Output:**
```
✅ Africa: 54 (expected 54)
✅ Caribbean: 20 (expected 20)
✅ All Regions: 74 (expected 74)
✅ Western Sahara (ESH) excluded
✅ No duplicate ISO3 codes
```

**If Output Shows Errors:**
- ❌ "Africa: <54" → Some African countries missing from database
- ❌ "Caribbean: <20" → Some Caribbean markets missing
- ❌ "All Regions: >74" → Duplicate ISO3 or extra markets included
- ⚠️ "Western Sahara (ESH) exists" → Record present but should not be in API scope

---

### STEP 4: Sector Readiness Verification (READ-ONLY)

**Purpose:** Check current sector data state and identify which countries need seeding.

**File:** `infra/supabase/verification/phase-4a-sector-readiness-verification.sql`

**Action:** Copy and paste the entire file into Supabase SQL Editor, then click "Run".

**Expected Output (BEFORE DATA-SEED-01):**
```
Total sector rows: 0 or low
⏳ Priority Africa: 0/15 ready
⏳ Priority Caribbean: 0/5 ready
⚠️  ACTION REQUIRED: Run DATA-SEED-01
```

**Expected Output (AFTER DATA-SEED-01):**
```
Total sector rows: 100
✅ Priority Africa: 15/15 ready
✅ Priority Caribbean: 5/5 ready
✅ READY: Sector data seeded
```

**Note:** This step is informational only. Sector seeding happens in **Step 3 of Phase 4A** (not yet executed).

---

### STEP 5: Master Verification (READ-ONLY) — OPTIONAL

**Purpose:** Run all verification queries in a single script for convenience.

**File:** `infra/supabase/verification/phase-4a-master-verification.sql`

**Action:** Copy and paste the entire file into Supabase SQL Editor, then click "Run".

**Expected Output:**
```
1️⃣  SQL v1.10 RLS:
  ✅ Legacy policies removed

2️⃣  FDI Ingestion:
  ✅ FDI indicator exists
  ✅ Professional view has FDI column
  ✅ FDI observations: >100
  ✅ Nigeria FDI: $XXXXXXX

3️⃣  Market Counts:
  ✅ Africa: 54
  ✅ Caribbean: 20
  ✅ All Regions: 74
  ✅ Western Sahara excluded
  ✅ No duplicate ISO3

4️⃣  Sector Data:
  Total rows: 0 or ~100
  ⏳ Priority Africa: 0/15 or 15/15 ready
  ⏳ Priority Caribbean: 0/5 or 5/5 ready
```

**Note:** This is a comprehensive report combining all individual verification scripts above. Use this if you want one consolidated view.

---

## Summary Table

| Step | File | Type | Purpose | When to Run |
|------|------|------|---------|-------------|
| **0** | `phase-4a-sql-v110-verification.sql` | Read-only | Verify SQL v1.10 RLS state | Before ingestion |
| **1** | **CLI: `npx tsx services/ingestion/run.ts worldbank`** | External | Populate FDI observations | After Step 0 passes |
| **2** | `phase-4a-fdi-verification.sql` | Read-only | Verify FDI observations created | After Step 1 completes |
| **3** | `phase-4a-market-count-verification.sql` | Read-only | Verify market counts (54/20/74) | Anytime (informational) |
| **4** | `phase-4a-sector-readiness-verification.sql` | Read-only | Check sector data status | Before/after DATA-SEED-01 |
| **5** | `phase-4a-master-verification.sql` | Read-only | Combined report (optional) | Anytime (comprehensive) |

---

## NOT READY TO RUN YET

### sql-pack-v1.11-seed-sectors.sql

**Status:** ⏸️ NOT CREATED YET  
**Purpose:** Seed 100 sector rows (20 countries x 5 sectors each)  
**Phase:** DATA-SEED-01 (Step 3 of Phase 4A)  
**Location:** `infra/supabase/sql-pack-v1.11-seed-sectors.sql` (future)

**DO NOT RUN UNTIL:**
- Step 2 UX-DATA-02 is complete
- Sector seeding plan is finalized
- Priority countries and sectors are confirmed

---

## Troubleshooting

### Issue: Legacy RLS policies still exist

**Symptom:** `phase-4a-sql-v110-verification.sql` shows legacy policy count > 0

**Solution:**
1. Run `infra/supabase/sql-pack-v1.10-drop-recursive-rls-policies.sql` in SQL Editor
2. Verify success by re-running verification

---

### Issue: FDI observations are 0 after ingestion

**Symptom:** `phase-4a-fdi-verification.sql` shows 0 observations

**Possible Causes:**
- Ingestion command did not run successfully
- FDI indicator not in `services/ingestion/worldbank.ts` INDICATORS array
- Network error connecting to World Bank API
- Service role key missing or invalid

**Solution:**
1. Check `services/ingestion/worldbank.ts` line 17 has FDI indicator
2. Verify `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
3. Re-run: `npx tsx services/ingestion/run.ts worldbank`
4. Check console output for errors

---

### Issue: Market counts don't match (Africa ≠ 54, Caribbean ≠ 20)

**Symptom:** `phase-4a-market-count-verification.sql` shows incorrect counts

**Possible Causes:**
- REST Countries ingestion not run
- Countries missing from database
- `is_active` flag set incorrectly

**Solution:**
1. Run: `npx tsx services/ingestion/run.ts restcountries`
2. Re-run market count verification
3. If still incorrect, check `souvera_countries` table manually

---

### Issue: Cannot connect to Supabase SQL Editor

**Symptom:** SQL Editor won't load or shows connection error

**Solution:**
1. Check Supabase project status (paused projects auto-shutdown)
2. Verify internet connectivity
3. Try different browser or clear cache
4. Check Supabase status page: https://status.supabase.com

---

## Next Steps After Verification

Once all verification scripts pass:

1. ✅ **Step 0-2 Complete:** SQL v1.10 verified, FDI ingestion successful
2. ⏸️ **Step 3 Pending:** UX-DATA-02 implementation (EntitledSectorList.tsx)
3. ⏸️ **Step 4 Pending:** DATA-SEED-01 sector seeding (sql-pack-v1.11)
4. ⏸️ **Browser QA Pending:** Test Professional+ FDI display in UI

---

## Support

**Documentation:**
- Full implementation report: `docs/qa/phase-4a-fdi-ingestion-implementation.md`
- UX-DATA-02 report: `docs/qa/phase-4a-ux-data-02-implementation.md`
- FDI verification results: `docs/qa/phase-4a-fdi-ingestion-verification-results.md`

**Questions?**
- Check verification script output first
- Review troubleshooting section above
- Consult implementation documentation

---

**Last Updated:** 2026-05-05  
**Phase 4A Progress:** Step 0 ✅ + Step 1 ✅ + Step 2 ✅ complete; Step 3 (DATA-SEED-01) ready
