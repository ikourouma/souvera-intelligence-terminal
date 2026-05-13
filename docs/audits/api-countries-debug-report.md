# API Countries Debug Report

**Date:** April 28, 2026  
**Issue:** `/api/v1/countries` endpoint returns Internal Server Error  
**Severity:** P0 - Production Blocking  
**Status:** ROOT CAUSE IDENTIFIED AND FIXED

---

## Error Summary

**Affected Pages:**
- `/intelligence/africa`
- `/intelligence/caribbean`
- `/intelligence/map`

**Browser Error:**
```
Failed to Load Intelligence Map. Failed to fetch countries: Internal Server Error
```

**Failing Endpoints:**
- `GET /api/v1/countries?region=africa`
- `GET /api/v1/countries?region=caribbean`
- `GET /api/v1/countries?region=all`

---

## Root Cause

### **COLUMN MISMATCH: API queries columns that do not exist in the database views**

The `/api/v1/countries/route.ts` at **line 79** queries columns that don't exist in the views:

| Column | In Query | In View | Status |
|--------|----------|---------|--------|
| `lat` | ✅ Yes | ❌ No | **MISSING** |
| `lng` | ✅ Yes | ❌ No | **MISSING** |
| `is_african_country` | ✅ Yes | ❌ No | **MISSING** |
| `is_active` | ✅ (WHERE clause) | ❌ No | **MISSING** |

---

## Technical Analysis

**File:** `apps/api-gateway/src/app/api/v1/countries/route.ts`

**Line 73:** `getDataView(access)` returns one of:
- `souvera_country_lite_v` (for public/explorer)
- `souvera_country_professional_v` (for professional)
- `souvera_country_business_v` (for business+)

**Line 79:** The query selects columns including `lat`, `lng`, `is_african_country`

**Line 80:** The query filters by `is_active = true`

**Problem:** These columns exist in `souvera_countries` table but are NOT projected into the views.

---

## Fix Applied

**Created:** `infra/supabase/sql-pack-v1.6-view-fix.sql`

This migration updates all three tiered views to include the missing columns:
- `souvera_country_lite_v` - Added `lat`, `lng`, `is_african_country`, `is_active`
- `souvera_country_professional_v` - Inherits from lite view
- `souvera_country_business_v` - Inherits from professional view

---

## Action Required

**Run this migration in Supabase SQL Editor:**

1. Open Supabase Dashboard > SQL Editor
2. Paste contents of `infra/supabase/sql-pack-v1.6-view-fix.sql`
3. Execute

**Verify with:**
```sql
SELECT iso3, lat, lng, is_african_country 
FROM souvera_country_lite_v 
WHERE is_african_country = true
LIMIT 5;
```

**Expected result:** 5 rows with populated lat/lng coordinates

---

## Verification Queries

```sql
-- Check African countries
SELECT COUNT(*) FROM souvera_country_lite_v WHERE is_african_country = true;
-- Expected: 54

-- Check Caribbean countries
SELECT COUNT(*) FROM souvera_country_lite_v WHERE is_african_country = false;
-- Expected: 20

-- Check coordinates exist
SELECT iso3, name, lat, lng 
FROM souvera_country_lite_v 
WHERE lat IS NOT NULL 
LIMIT 10;
```

---

## Summary

| Item | Status |
|------|--------|
| **Root Cause** | View columns missing: `lat`, `lng`, `is_african_country`, `is_active` |
| **Exact File** | `apps/api-gateway/src/app/api/v1/countries/route.ts` |
| **Exact Line** | Lines 79-81 |
| **Failing Query** | SELECT with non-existent columns |
| **Fix Applied** | `sql-pack-v1.6-view-fix.sql` created |
| **Seed Data** | ✅ Present and complete (74 countries) |
| **Migration Status** | ⚠️ Needs to be run in Supabase |

---

**Report Generated:** April 28, 2026  
**Author:** Cursor Agent  
**Status:** MIGRATION CREATED - APPLY TO DATABASE
