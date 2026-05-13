# SQL Pack v1.6 View Fix - Migration Guide

**Date:** April 28, 2026  
**Migration:** `sql-pack-v1.6-view-fix.sql`  
**Status:** Fixed and Ready for Production  
**Severity:** P0 - Required for API functionality

---

## Why This Migration is Needed

### Root Cause

The `/api/v1/countries` endpoint queries columns that don't exist in the database views:
- `lat` (latitude coordinate)
- `lng` (longitude coordinate)
- `is_african_country` (region filter flag)
- `is_active` (status filter)

These columns exist in the base `souvera_countries` table but were not projected into the three tiered views:
- `souvera_country_lite_v`
- `souvera_country_professional_v`
- `souvera_country_business_v`

### Why the Error Happened

**Initial approach:** Tried to use `CREATE OR REPLACE VIEW` to add columns.

**PostgreSQL constraint:** `CREATE OR REPLACE VIEW` requires:
1. Existing columns must remain in the same order
2. New columns can only be added at the end
3. Column names at each position must stay the same

**The problem:** When we tried to add the new columns (lat, lng, is_african_country, is_active) in the middle of the column list (after flag_svg_url but before gdp_current_usd), PostgreSQL detected a column order change and threw:

```
ERROR: 42P16: cannot change name of view column "fdi_net_inflows_usd" to "lat"
```

This happened because PostgreSQL saw column position 12 changing from `gdp_current_usd` to `lat`.

---

## The Fix

### Safe Migration Pattern

Instead of `CREATE OR REPLACE VIEW`, we use:

```sql
-- Step 1: Drop views in reverse dependency order
DROP VIEW IF EXISTS public.souvera_country_business_v CASCADE;
DROP VIEW IF EXISTS public.souvera_country_professional_v CASCADE;
DROP VIEW IF EXISTS public.souvera_country_lite_v CASCADE;

-- Step 2: Recreate views in dependency order with new columns
CREATE VIEW public.souvera_country_lite_v AS ...
CREATE VIEW public.souvera_country_professional_v AS ...
CREATE VIEW public.souvera_country_business_v AS ...
```

### Why This is Safe

1. **Views don't contain data** - They're just stored queries
2. **No data loss** - Base tables (`souvera_countries`, `souvera_country_observations`, etc.) are untouched
3. **Idempotent** - Uses `DROP VIEW IF EXISTS` so it can be run multiple times
4. **No RLS changes** - Row Level Security policies are on tables, not views
5. **Dependency aware** - Drops in reverse order, recreates in correct order

---

## Views Rebuilt

| View | Purpose | Columns Added |
|------|---------|---------------|
| `souvera_country_lite_v` | Public/Explorer tier | `lat`, `lng`, `is_african_country`, `is_active` |
| `souvera_country_professional_v` | Professional tier | Inherits from lite view |
| `souvera_country_business_v` | Business tier | Inherits from professional view |

**Column positions:**
- `lat`, `lng`, `is_african_country`, `is_active` are now at positions 12-15 (after flag_png_url, before gdp_current_usd)

---

## How to Run

### Prerequisites

- Supabase Dashboard access with SQL Editor permissions
- Database connection to the correct project

### Steps

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Navigate to: SQL Editor (left sidebar)
   - Click: "New Query"

3. **Paste Migration**
   - Copy the entire contents of `infra/supabase/sql-pack-v1.6-view-fix.sql`
   - Paste into the SQL Editor

4. **Execute**
   - Click "Run" button
   - Wait for completion (should take <5 seconds)

5. **Verify Success**
   - You should see: "Success. No rows returned"
   - No error messages

### Rerunning the Migration

**Safe to rerun:** Yes, the migration is idempotent due to `DROP VIEW IF EXISTS`.

If you need to rerun:
- Simply paste and execute again
- Views will be dropped and recreated with the same structure

---

## Verification

### After Migration Completes

Run these verification queries in the SQL Editor:

#### Test 1: Verify Lite View Structure
```sql
SELECT country_id, iso2, iso3, name, lat, lng, is_african_country, is_active
FROM public.souvera_country_lite_v
WHERE is_african_country = true
LIMIT 5;
```

**Expected result:** 5 rows with populated lat/lng coordinates

#### Test 2: Count African Countries
```sql
SELECT COUNT(*) as african_countries
FROM public.souvera_country_lite_v
WHERE is_african_country = true;
```

**Expected result:** 54

#### Test 3: Count Caribbean Countries
```sql
SELECT COUNT(*) as caribbean_countries
FROM public.souvera_country_lite_v
WHERE is_african_country = false;
```

**Expected result:** 20

#### Test 4: Verify Professional View
```sql
SELECT country_id, iso3, name, lat, lng, fdi_net_inflows_usd
FROM public.souvera_country_professional_v
LIMIT 3;
```

**Expected result:** 3 rows with lat/lng and fdi_net_inflows_usd

#### Test 5: Verify Business View
```sql
SELECT country_id, iso3, name, lat, lng, gdp_forecast_pct
FROM public.souvera_country_business_v
LIMIT 3;
```

**Expected result:** 3 rows with lat/lng and gdp_forecast_pct

#### Test 6: Verify API Query Works
```sql
SELECT iso2, iso3, name, region, subregion, capital, flag_svg_url,
       lat, lng, gdp_current_usd, population_total, signal_level,
       freshness_at, is_african_country
FROM public.souvera_country_lite_v
WHERE is_active = true
ORDER BY name
LIMIT 10;
```

**Expected result:** 10 rows with all columns populated (no NULL for lat/lng)

---

## Rollback

### If Migration Fails

**Scenario:** Migration encounters an error midway through.

**Recovery:**

1. **Check which views exist:**
   ```sql
   SELECT table_name 
   FROM information_schema.views 
   WHERE table_schema = 'public' 
   AND table_name LIKE '%country%v';
   ```

2. **If views are missing, restore from SQL Pack v1.1:**
   - Go to `infra/supabase/sql-pack-v1.1.sql`
   - Find the view definitions (lines 831-915)
   - Execute those view CREATE statements

3. **Then rerun SQL Pack v1.6:**
   - The `DROP VIEW IF EXISTS` will handle any partial state
   - Views will be recreated correctly

### Complete Rollback (Restore Original Views)

**If you need to completely rollback to pre-v1.6 state:**

```sql
-- Drop v1.6 views
DROP VIEW IF EXISTS public.souvera_country_business_v CASCADE;
DROP VIEW IF EXISTS public.souvera_country_professional_v CASCADE;
DROP VIEW IF EXISTS public.souvera_country_lite_v CASCADE;

-- Then run the original view definitions from sql-pack-v1.1.sql
-- (Lines 831-915)
```

**Note:** This will restore the views to their original state without lat/lng columns, and the API will break again.

---

## Impact on Running System

### During Migration (5 seconds)

| Impact | Severity | Mitigation |
|--------|----------|------------|
| Views briefly unavailable | HIGH | Schedule during low-traffic window |
| API queries fail | HIGH | Brief (5s) downtime acceptable |
| No data loss | NONE | Base tables untouched |
| No auth changes | NONE | RLS policies preserved |

### After Migration

| Change | Impact |
|--------|--------|
| API `/api/v1/countries` works | ✅ Fixes production error |
| `/intelligence/africa` loads | ✅ Page functional |
| `/intelligence/caribbean` loads | ✅ Page functional |
| `/intelligence/map` loads | ✅ Map functional |
| Entitlement filtering works | ✅ No change |
| Existing queries | ✅ Backwards compatible |

---

## Dependencies

### Requires

- SQL Pack v1.1 (base schema)
- SQL Pack v1.5 (seed data with lat/lng in souvera_countries)

### Does Not Require

- Application redeployment (API already queries these columns)
- Environment variable changes
- RLS policy updates

---

## Post-Migration Testing

### Test the API Locally

```bash
# Test Africa endpoint
curl http://localhost:3000/api/v1/countries?region=africa

# Test Caribbean endpoint
curl http://localhost:3000/api/v1/countries?region=caribbean

# Test country detail
curl http://localhost:3000/api/v1/country-lite?iso3=NGA
```

**Expected:** All endpoints return 200 with populated data

### Test Pages

1. Visit: http://localhost:3000/intelligence/africa
2. Visit: http://localhost:3000/intelligence/caribbean
3. Visit: http://localhost:3000/intelligence/map
4. Click a country card
5. Verify country drawer opens with data

**Expected:** All pages load, no "Failed to fetch" errors

---

## Troubleshooting

### Error: "relation does not exist"

**Cause:** Base tables or souvera_latest_observations_v is missing

**Fix:**
1. Verify sql-pack-v1.1.sql was run
2. Check if souvera_latest_observations_v exists:
   ```sql
   SELECT * FROM information_schema.views 
   WHERE table_name = 'souvera_latest_observations_v';
   ```
3. If missing, recreate from sql-pack-v1.1.sql lines 803-825

### Error: "column does not exist"

**Cause:** Base table souvera_countries is missing lat/lng columns

**Fix:**
1. Verify souvera_countries has required columns:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'souvera_countries' 
   AND column_name IN ('lat', 'lng', 'is_african_country', 'is_active');
   ```
2. If missing, these should have been created in sql-pack-v1.1.sql
3. Rerun sql-pack-v1.1.sql if needed

### Error: "permission denied"

**Cause:** Insufficient database privileges

**Fix:**
- Use service role key in Supabase Dashboard
- Or ensure database user has CREATE/DROP VIEW permissions

---

## Migration Checklist

- [ ] Backup database (optional but recommended)
- [ ] Open Supabase SQL Editor
- [ ] Paste sql-pack-v1.6-view-fix.sql contents
- [ ] Execute migration
- [ ] Verify "Success. No rows returned"
- [ ] Run Test 1: Check lite view (5 rows expected)
- [ ] Run Test 2: Count African countries (54 expected)
- [ ] Run Test 3: Count Caribbean countries (20 expected)
- [ ] Run Test 6: Full API query (10 rows with lat/lng)
- [ ] Test API endpoint: /api/v1/countries?region=africa
- [ ] Test page: /intelligence/africa
- [ ] Test page: /intelligence/caribbean
- [ ] Test page: /intelligence/map
- [ ] Verify country drawer opens
- [ ] Mark migration as complete

---

## Related Documentation

- [API Countries Debug Report](/docs/audits/api-countries-debug-report.md)
- [Phase 3A Implementation Summary](/docs/phase3a-part1-implementation-summary.md)
- [SQL Pack v1.1](/infra/supabase/sql-pack-v1.1.sql)
- [SQL Pack v1.5](/infra/supabase/sql-pack-v1.5-seed-africa-caribbean.sql)

---

**Migration Author:** Cursor Agent  
**Last Updated:** April 28, 2026  
**Status:** ✅ Ready for Production
