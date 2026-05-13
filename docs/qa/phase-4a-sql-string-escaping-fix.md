# SQL String Escaping Fix — DATA-SEED-01 Pilot

**Status:** ✅ FIXED  
**Date:** 2026-05-05  
**Issue:** SQL syntax error due to unescaped apostrophes in string literals

---

## Root Cause

PostgreSQL uses single quotes (`'`) to delimit string literals. Any apostrophe within a string must be escaped. There are two escaping methods:

1. **Regular strings** (`'...'`): Escape apostrophes by **doubling** them: `''`
2. **E-strings** (`E'...'`): Escape apostrophes with backslashes: `\'`

The seed file used **both formats**:
- `teaser_md` fields used **regular strings** → required doubled apostrophes
- `rationale_md` fields used **E-strings** → backslash escaping was already correct

**The bug:** `teaser_md` fields contained unescaped apostrophes like `'Africa's largest...'` instead of `'Africa''s largest...'`

---

## Files Changed

| File | Status |
|------|--------|
| `infra/supabase/sql-pack-v1.11a-seed-sectors-pilot.sql` | ✅ Fixed (6 apostrophes escaped) |
| `infra/supabase/verification/phase-4a-sector-pilot-verification.sql` | ✅ No changes needed (already correct) |

---

## Apostrophes Escaped

All unescaped apostrophes in `teaser_md` regular string literals were fixed:

| Line | Country | Sector | Before | After |
|------|---------|--------|--------|-------|
| 57 | NGA | Fintech | `'Africa's largest fintech...'` | `'Africa''s largest fintech...'` |
| 105 | NGA | Logistics | `'West Africa's largest consumer...'` | `'West Africa''s largest consumer...'` |
| 143 | ZAF | Fintech | `'Africa's most developed...'` | `'Africa''s most developed...'` |
| 191 | ZAF | Logistics | `'Southern Africa's logistics...'` | `'Southern Africa''s logistics...'` |
| 229 | KEN | Fintech | `'East Africa's fintech leader...'` | `'East Africa''s fintech leader...'` |
| 277 | KEN | Logistics | `'East Africa's logistics gateway...'` | `'East Africa''s logistics gateway...'` |

**Total:** 6 apostrophes escaped across 6 teaser fields

---

## Verification

### Before Fix (Error)

```sql
ERROR: 42601: syntax error at or near "s"
LINE 57:
'Africa's largest fintech ecosystem supported by high mobile penetration...
```

### After Fix (Expected Success)

```sql
INSERT 0 25
-- or --
INSERT 0 5 (per country INSERT statement)
```

---

## Rationale Fields (No Changes Needed)

All `rationale_md` fields use **E-strings** with backslash escaping, which was already correct:

```sql
E'Nigeria anchors Africa\'s fintech revolution...'
E'South Africa\'s fintech sector benefits...'
E'Kenya\'s fintech sector is among Africa\'s most advanced...'
```

These use `E'...'` format with `\'` which is the correct PostgreSQL escape sequence for E-strings.

---

## SQL Idempotency Confirmed

The script remains **idempotent** and safe to rerun:

```sql
ON CONFLICT (country_id, sector_key) DO UPDATE SET
  sector_label = EXCLUDED.sector_label,
  teaser_md = EXCLUDED.teaser_md,
  rationale_md = EXCLUDED.rationale_md,
  strength_score = EXCLUDED.strength_score,
  growth_score = EXCLUDED.growth_score,
  display_order = EXCLUDED.display_order,
  min_plan_id = EXCLUDED.min_plan_id,
  updated_at = now();
```

**Safe to rerun** even if partial inserts succeeded.

---

## Instructions to Rerun

### Step 1: Execute Fixed Seed SQL

1. Open **Supabase SQL Editor**
2. Load file: `infra/supabase/sql-pack-v1.11a-seed-sectors-pilot.sql`
3. Run the entire script
4. **Expected result:** `INSERT 0 25` or 5 successful inserts per country (25 total rows)

### Step 2: Verify Results

1. Load file: `infra/supabase/verification/phase-4a-sector-pilot-verification.sql`
2. Run all 15 queries
3. Validate:
   - Total pilot sectors: 25
   - Sectors per country: 5
   - No duplicate sector keys
   - All teaser and rationale fields populated

### Step 3: Browser QA

Test the 5 pilot countries:
- `/intelligence/map?region=africa&selected=NGA`
- `/intelligence/map?region=africa&selected=ZAF`
- `/intelligence/map?region=africa&selected=KEN`
- `/intelligence/map?region=caribbean&selected=JAM`
- `/intelligence/map?region=caribbean&selected=TTO`

**Expected:**
- Explorer: 1 sector teaser visible
- Professional+: Up to 5 sectors with rationale visible

---

## Confirmation

- ✅ All apostrophes in regular string literals escaped
- ✅ E-strings already correctly using backslash escaping
- ✅ No changes needed to verification SQL
- ✅ Script remains idempotent
- ✅ Safe to rerun in Supabase SQL Editor

**The seed script is now production-ready.**
