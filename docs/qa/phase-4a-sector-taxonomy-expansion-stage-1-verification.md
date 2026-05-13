# Phase 4A Stage 1: Sector Taxonomy Expansion Verification

**Status:** ✅ Implementation Complete — Awaiting SQL Execution  
**Date:** 2026-05-05  
**Owner:** Afronovation, Inc.  
**Scope:** Verification checklist for 7-sector taxonomy expansion (Priority 20)

---

## Executive Summary

This document provides the verification checklist and expected results for Phase 4A Stage 1: the expansion of the Souvera sector taxonomy from 5 to 7 universal sectors across 20 priority markets.

**Target:** 140 sector rows (20 countries × 7 sectors)  
**Added:** 40 new rows (Digital Infrastructure + Tourism & Hospitality)

---

## Pre-Execution State

### Current Database State

**Before SQL Execution:**
- Total sector rows for priority 20: **100 rows** (20 countries × 5 sectors)
- Sectors per country: 5
- Sector keys present:
  - `fintech_digital_finance`
  - `energy_renewables`
  - `agriculture_agribusiness`
  - `mining_critical_minerals`
  - `logistics_trade`

---

## SQL Execution

### Step 1: Execute Seed File

**File:** `infra/supabase/sql-pack-v1.12a-add-digital-tourism-priority-20.sql`

**Execution:**
1. Open Supabase SQL Editor
2. Copy full SQL seed file contents
3. Paste into SQL Editor
4. Execute

**Expected Output:**
```
status: 'Stage 1 Complete'
total_rows_inserted_or_updated: 40
```

**Action:** ✅ Confirms 40 rows inserted or updated

---

### Step 2: Run Verification

**File:** `infra/supabase/verification/phase-4a-digital-tourism-priority-20-verification.sql`

**Execution:**
1. Open Supabase SQL Editor
2. Copy full verification SQL contents
3. Paste into SQL Editor
4. Execute

**Expected Results:**

#### CHECK 1: Total Priority Sector Rows
```
check_name: 'CHECK 1: Total Priority Sector Rows'
actual_rows: 140
expected_rows: 140
status: '✓ PASS'
```

#### CHECK 2: Each Priority Country Has 7 Sectors
```
(20 rows returned, one per country)

check_name: 'CHECK 2: Each Priority Country Has 7 Sectors'
iso3: 'NGA'
country_name: 'Nigeria'
sector_count: 7
status: '✓ PASS'

... (repeat for all 20 countries)
```

#### CHECK 3: Digital Infrastructure Present for All 20
```
check_name: 'CHECK 3: Digital Infrastructure Present for All 20'
countries_with_digital_infrastructure: 20
expected_countries: 20
status: '✓ PASS'
```

#### CHECK 4: Tourism & Hospitality Present for All 20
```
check_name: 'CHECK 4: Tourism & Hospitality Present for All 20'
countries_with_tourism_hospitality: 20
expected_countries: 20
status: '✓ PASS'
```

#### CHECK 5: Sector Key Distribution (20 per sector)
```
(7 rows returned, one per sector key)

check_name: 'CHECK 5: Sector Key Distribution (20 per sector)'
sector_key: 'digital_infrastructure'
sector_label: 'Digital Infrastructure'
row_count: 20
status: '✓ PASS'

sector_key: 'fintech_digital_finance'
sector_label: 'Fintech and Digital Finance'
row_count: 20
status: '✓ PASS'

... (repeat for all 7 sectors)
```

#### CHECK 6: Display Order Distribution
```
(7 rows returned, one per display_order)

check_name: 'CHECK 6: Display Order Distribution'
display_order: 1
row_count: 20
expected_per_display_order: 20
status: '✓ PASS'

display_order: 2
row_count: 20
expected_per_display_order: 20
status: '✓ PASS'

... (repeat for display_order 1-7)
```

#### CHECK 7: No Duplicate Sector Keys Per Country
```
check_name: 'CHECK 7: No Duplicate Sector Keys Per Country'
status: '✓ PASS - No duplicates found'
duplicate_count: 0
```

#### CHECK 8: All min_plan_id = 'explorer'
```
check_name: 'CHECK 8: All min_plan_id = explorer'
total_rows: 140
explorer_count: 140
status: '✓ PASS'
```

#### CHECK 9: Content Present (teaser_md and rationale_md)
```
check_name: 'CHECK 9: Content Present (teaser_md and rationale_md)'
total_rows: 140
teaser_present_count: 140
rationale_present_count: 140
status: '✓ PASS'
```

#### CHECK 10: Sample Rows for Digital Infrastructure
```
(5 rows returned)

check_name: 'CHECK 10: Digital Infrastructure Sample Rows'
iso3: 'BHS'
country_name: 'Bahamas'
sector_key: 'digital_infrastructure'
sector_label: 'Digital Infrastructure'
display_order: 1
strength_score: 76
growth_score: 70
teaser_preview: 'Bahamas' digital infrastructure combines submarine cable connectivity to Nor...'

... (repeat for 4 more countries)
```

#### CHECK 11: Sample Rows for Tourism & Hospitality
```
(5 rows returned)

check_name: 'CHECK 11: Tourism & Hospitality Sample Rows'
iso3: 'BHS'
country_name: 'Bahamas'
sector_key: 'tourism_hospitality'
sector_label: 'Tourism and Hospitality'
display_order: 7
strength_score: 88
growth_score: 72
teaser_preview: 'Bahamas' visitor economy is anchored by proximity to US markets, extensive...'

... (repeat for 4 more countries)
```

#### SUMMARY
```
summary: '=== VERIFICATION COMPLETE ==='

metric: 'Expected Result'
value: '140 sector rows (20 countries × 7 sectors)'

metric: 'Current Status'
value: '140 sector rows across 20 priority countries'
```

**Action:** ✅ All checks PASS

---

## Browser QA

### Country Intelligence Panel Verification

**Test Routes:**

1. **Nigeria (Professional+)**
   - Route: `/intelligence/map?region=africa&selected=NGA`
   - Expected:
     - ✅ Top 5 sectors visible: Digital Infrastructure, Fintech, Energy, Agriculture, Mining
     - ✅ "+2 more sectors" card visible
     - ✅ Clicking "+2 more" reveals Logistics and Tourism
     - ✅ Digital Infrastructure appears first (display_order 1)
     - ✅ Tourism & Hospitality appears last (display_order 7)
     - ✅ Rationale accessible for all sectors
     - ✅ One-at-a-time accordion expansion
     - ✅ CTA stable (no bouncing)

2. **Ghana (Professional+)**
   - Route: `/intelligence/map?region=africa&selected=GHA`
   - Expected: (same as Nigeria)

3. **Jamaica (Professional+)**
   - Route: `/intelligence/map?region=caribbean&selected=JAM`
   - Expected: (same as Nigeria)

4. **Dominican Republic (Professional+)**
   - Route: `/intelligence/map?region=caribbean&selected=DOM`
   - Expected: (same as Nigeria)

**Explorer/Public Test:**
- Route: `/intelligence/map?region=africa&selected=NGA` (as public/Explorer user)
- Expected:
  - ✅ 1 sector teaser only (Digital Infrastructure)
  - ✅ No rationale
  - ✅ "+6 more sectors with Professional access" message

---

### Sector Page Verification

**Test Routes:**

1. **Digital Infrastructure**
   - Route: `/sectors/digital-infrastructure`
   - Expected:
     - ✅ Page loads without errors
     - ✅ SEO title: "Digital Infrastructure | Souvera"
     - ✅ Hero section renders
     - ✅ 8 coverage area cards render
     - ✅ Primary CTA links to `/intelligence/map`
     - ✅ Secondary CTA links to `/access/request-access`
     - ✅ Mobile responsive
     - ✅ Icons render correctly
     - ✅ Content accurate (no unsupported claims)

2. **Tourism & Hospitality**
   - Route: `/sectors/tourism-hospitality`
   - Expected: (same checks as Digital Infrastructure)

---

### Top Navigation Verification

**Desktop:**
1. Hover over "Sectors" in top nav
2. Verify mega menu opens
3. Verify 3 subsections visible:
   - Core Infrastructure
   - Industry Sectors
   - Services & Connectivity
4. Verify "Digital Infrastructure" link under "Core Infrastructure"
5. Verify "Tourism & Hospitality" link under "Services & Connectivity"
6. Click links and verify navigation

**Mobile:**
1. Open mobile menu
2. Expand "Sectors" accordion
3. Verify 3 subsections visible
4. Verify "Digital Infrastructure" and "Tourism & Hospitality" links present
5. Click links and verify navigation

---

## Known Issues

### None Expected

Based on implementation review:
- SQL uses idempotent `ON CONFLICT DO UPDATE`
- Dollar-quoted strings prevent escaping issues
- CTE VALUES pattern proven in previous implementations
- UI updates follow established patterns
- Sector pages use consistent `HubPageTemplate`

**If issues arise:**
1. Check SQL execution logs for errors
2. Verify country_id lookups succeeded (all 20 priority countries exist)
3. Check browser console for UI errors
4. Verify user entitlement (Professional+ for full sector access)

---

## Rollback Plan

**If Critical Issues Detected:**

### SQL Rollback

```sql
-- Remove Digital Infrastructure and Tourism & Hospitality for priority 20
DELETE FROM public.souvera_country_sectors
WHERE sector_key IN ('digital_infrastructure', 'tourism_hospitality')
  AND country_id IN (
    SELECT id FROM public.souvera_countries
    WHERE iso3 IN (
      'NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA',
      'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA'
    )
  );
```

**Result:** Returns to 100 sector rows (20 countries × 5 sectors)

### UI Rollback

Revert files:
- `apps/api-gateway/src/components/intelligence/EntitledSectorList.tsx`
- `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx`

Delete directories:
- `apps/api-gateway/src/app/sectors/digital-infrastructure/`
- `apps/api-gateway/src/app/sectors/tourism-hospitality/`

**Result:** Returns to 5-sector UX

---

## Sign-Off Criteria

✅ **Stage 1 Complete When:**

1. SQL verification shows all 11 checks PASS
2. Browser QA confirms:
   - Professional+ users see top 5 sectors + "+2 more" card
   - Clicking "+2 more" reveals all 7 sectors
   - Digital Infrastructure appears as primary sector
   - Tourism & Hospitality accessible
   - Sector pages load without errors
   - Top navigation includes new links
   - Mobile responsive
   - No console errors

3. Documentation updated
4. No critical issues detected

---

## Next Phase

### Stage 2: All-74 Expansion

**Scope:**
- Expand Digital Infrastructure and Tourism & Hospitality to remaining 54 markets
- 54 countries × 2 sectors = 108 new rows
- Expected total: 288 sector rows (140 priority + 148 remaining)

**Planning:**
- Use same SQL pattern (CTE VALUES, idempotent)
- Country-specific executive-grade copy for 54 markets
- Verification SQL for all 74 markets
- Update documentation

---

## Files

### SQL
- `infra/supabase/sql-pack-v1.12a-add-digital-tourism-priority-20.sql`
- `infra/supabase/verification/phase-4a-digital-tourism-priority-20-verification.sql`

### Documentation
- `docs/qa/phase-4a-digital-tourism-priority-20-implementation.md`
- `docs/qa/phase-4a-sector-page-navigation-implementation.md`
- `docs/qa/phase-4a-sector-taxonomy-expansion-stage-1-verification.md`

### UI
- `apps/api-gateway/src/components/intelligence/EntitledSectorList.tsx`
- `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx`

### Sector Pages
- `apps/api-gateway/src/app/sectors/digital-infrastructure/page.tsx`
- `apps/api-gateway/src/app/sectors/digital-infrastructure/DigitalInfrastructureHub.tsx`
- `apps/api-gateway/src/app/sectors/tourism-hospitality/page.tsx`
- `apps/api-gateway/src/app/sectors/tourism-hospitality/TourismHospitalityHub.tsx`

---

## Recommendation

✅ **Phase 4A Stage 1 is ready for SQL execution and browser QA.**

Execute SQL seed file, run verification, then conduct browser QA across priority 20 countries and sector pages.
