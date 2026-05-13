# Phase 4A Stage 1: Digital Infrastructure + Tourism & Hospitality Implementation

**Status:** ✅ COMPLETE — SQL Executed & Verified  
**Execution Date:** 2026-05-05  
**Verification Date:** 2026-05-05  
**Owner:** Afronovation, Inc.  
**Scope:** Add Digital Infrastructure and Tourism & Hospitality sectors to 20 priority countries

---

## Executive Summary

Phase 4A Stage 1 expands the Souvera sector taxonomy from 5 to 7 universal sectors by adding **Digital Infrastructure** (display_order: 1) and **Tourism & Hospitality** (display_order: 7) to the 20 priority markets.

**Before:** 100 sector rows (20 countries × 5 sectors)  
**After:** 140 sector rows (20 countries × 7 sectors)  
**Added:** 40 new rows (20 countries × 2 new sectors)

**Verification Result:** ✅ PASSED
- Total rows: 140 sector rows across 20 priority countries
- Each country has exactly 7 sectors
- Digital Infrastructure present for all 20 countries (display_order: 1)
- Tourism & Hospitality present for all 20 countries (display_order: 7)
- All data integrity checks passed

---

## Updated 7-Sector Universal Model

| Sector Key | Sector Label | Display Order |
|-----------|-------------|---------------|
| `digital_infrastructure` | Digital Infrastructure | 1 |
| `fintech_digital_finance` | Fintech and Digital Finance | 2 |
| `energy_renewables` | Energy and Renewables | 3 |
| `agriculture_agribusiness` | Agriculture and Agribusiness | 4 |
| `mining_critical_minerals` | Mining and Critical Minerals | 5 |
| `logistics_trade` | Logistics and Trade | 6 |
| `tourism_hospitality` | Tourism and Hospitality | 7 |

---

## Scope

### Priority 20 Countries

**Africa (13):**
- Nigeria (NGA)
- South Africa (ZAF)
- Kenya (KEN)
- Egypt (EGY)
- Ghana (GHA)
- Côte d'Ivoire (CIV)
- Ethiopia (ETH)
- Morocco (MAR)
- Tanzania (TZA)
- Uganda (UGA)
- Rwanda (RWA)
- Senegal (SEN)
- Cameroon (CMR)

**Caribbean (7):**
- Jamaica (JAM)
- Trinidad and Tobago (TTO)
- Barbados (BRB)
- Dominican Republic (DOM)
- Bahamas (BHS)
- Grenada (GRD)
- Saint Lucia (LCA)

---

## Implementation

### 1. SQL Seed File

**File:** `infra/supabase/sql-pack-v1.12a-add-digital-tourism-priority-20.sql`

**Requirements:**
- Idempotent: `ON CONFLICT (country_id, sector_key) DO UPDATE`
- Dollar-quoted strings for `teaser_md` and `rationale_md`
- CTE VALUES pattern
- `min_plan_id = 'explorer'`
- Executive-grade, country-specific copy
- Strength and growth scores (0-100)

**Sectors Added:**
- Digital Infrastructure (20 rows)
- Tourism & Hospitality (20 rows)

**Total:** 40 new rows

**CTE Scope Fix (2026-05-05):**
- **Issue:** Initial version had CTE scope errors. The `sector_seed` CTE in the seed file was referenced after the INSERT statement completed, and the `priority_20` CTE in the verification file was defined once but referenced across multiple separate queries.
- **Root Cause:** PostgreSQL CTEs (Common Table Expressions) only exist for the single SQL statement immediately following the `WITH` clause. After a semicolon, the CTE goes out of scope.
- **Fix Applied:**
  - **Seed file:** Removed the verification summary `SELECT` statement that tried to reference `sector_seed` after the INSERT completed.
  - **Verification file:** Added `WITH priority_20 AS (...)` to each of the 11 check queries and the summary query that needs to reference the priority countries list.
- **Compatibility:** Both files now work correctly in Supabase SQL Editor with no CTE scope errors.

---

### 2. Verification SQL

**File:** `infra/supabase/verification/phase-4a-digital-tourism-priority-20-verification.sql`

**Checks:**
1. Total priority sector rows = 140
2. Each priority country has 7 sectors
3. All 20 have `digital_infrastructure`
4. All 20 have `tourism_hospitality`
5. Sector key distribution (20 rows per sector)
6. Display orders 1–7
7. No duplicate sector keys per country
8. All `min_plan_id = 'explorer'`
9. `teaser_md` and `rationale_md` present
10. Sample rows for Digital Infrastructure
11. Sample rows for Tourism & Hospitality

**Column Alias Fix (2026-05-05):**
- **Issue:** Verification queries referenced `sc.country_name`, but the `souvera_countries` table column is `name`, not `country_name`.
- **Error:** `ERROR: 42703: column sc.country_name does not exist`
- **Root Cause:** Incorrect column reference. The schema defines `souvera_countries.name`, not `souvera_countries.country_name`.
- **Fix Applied:**
  - Replaced 3 occurrences of `sc.country_name,` with `sc.name AS country_name,` (lines 69, 255, 281)
  - Updated GROUP BY clause from `sc.country_name` to `sc.name` (line 78)
- **Verification:** All column references now use valid schema columns: `sc.iso3`, `sc.name`, `sc.id`
- **Compatibility:** File is read-only and Supabase SQL Editor compatible

---

### 3. UI Updates

#### EntitledSectorList.tsx

**File:** `apps/api-gateway/src/components/intelligence/EntitledSectorList.tsx`

**Changes:**
- Added icons: `Server` (indigo), `Plane` (teal)
- Updated `getSectorIcon()` helper
- Professional+ UX: Top 5 sectors visible, "+2 more sectors" card for 6-7 sectors
- Clicking "+N more" reveals all sectors
- Explorer/Public: 1 sector teaser only

#### SouveraMegaNav.tsx

**File:** `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx`

**Changes:**
- Reorganized Sectors navigation into 3 subsections:
  - **Core Infrastructure:** Sector Overview, Digital Infrastructure, Fintech & Digital Finance
  - **Industry Sectors:** Mining & Critical Minerals, Energy & Renewables, Agriculture & Agribusiness
  - **Services & Connectivity:** Logistics & Trade, Tourism & Hospitality

---

### 4. Sector Pages

#### Digital Infrastructure

**Files:**
- `apps/api-gateway/src/app/sectors/digital-infrastructure/page.tsx`
- `apps/api-gateway/src/app/sectors/digital-infrastructure/DigitalInfrastructureHub.tsx`

**Coverage:**
- Broadband and fiber backbone
- Cloud and data center readiness
- Digital public infrastructure
- E-government modernization
- Payments interoperability
- Digital ID and trust services
- Cybersecurity and sovereign data
- AI readiness and innovation

#### Tourism & Hospitality

**Files:**
- `apps/api-gateway/src/app/sectors/tourism-hospitality/page.tsx`
- `apps/api-gateway/src/app/sectors/tourism-hospitality/TourismHospitalityHub.tsx`

**Coverage:**
- Visitor economy intelligence
- Destination infrastructure
- Hospitality investment
- Aviation and air connectivity
- Diaspora travel
- Events economy
- Cultural and heritage tourism
- Tourism board modernization

---

## SQL Execution Order

**Status:** ✅ CTE scope errors fixed, column alias errors fixed — ready to execute

1. **Execute seed file:**
   ```
   infra/supabase/sql-pack-v1.12a-add-digital-tourism-priority-20.sql
   ```
   - Inserts/updates 40 sector rows (Digital Infrastructure + Tourism & Hospitality)
   - Idempotent: safe to rerun
   - Expected result: 140 total priority sector rows

2. **Run verification:**
   ```
   infra/supabase/verification/phase-4a-digital-tourism-priority-20-verification.sql
   ```
   - 11 verification checks + summary
   - Each query has self-contained `WITH priority_20 AS (...)` CTE
   - All column references corrected: `sc.name AS country_name`
   - Expected result: All checks return `'✓ PASS'`

3. **Expected results:**
   - Total priority rows: 140
   - 20 countries
   - 7 sectors per country
   - All checks PASS

**Execution Result:** ✅ COMPLETE
- SQL seed file executed successfully
- Verification file executed successfully
- All 11 verification checks returned `'✓ PASS'`
- Database state confirmed: 140 sector rows across 20 priority countries

---

## Browser QA Checklist

**Status:** 🔲 Pending Browser QA

> **Note:** SQL execution and database verification complete. Browser QA to be performed to confirm UI/UX rendering and sector page functionality.

### Country Intelligence Panel

Test routes:
- `/intelligence/map?region=africa&selected=NGA`
- `/intelligence/map?region=africa&selected=GHA`
- `/intelligence/map?region=caribbean&selected=JAM`
- `/intelligence/map?region=caribbean&selected=DOM`

**Professional+ Expected Behavior:**
- ✅ Top 5 sectors visible by default
- ✅ "+2 more sectors" card visible
- ✅ Digital Infrastructure appears as primary sector (display_order 1)
- ✅ Tourism & Hospitality accessible (display_order 7)
- ✅ Clicking "+2 more" reveals all 7 sectors
- ✅ One-at-a-time accordion expansion works
- ✅ Rationale accessible for all sectors
- ✅ CTA remains stable (no bouncing)

**Explorer Expected Behavior:**
- ✅ 1 sector teaser only (Digital Infrastructure)
- ✅ No rationale
- ✅ "+6 more sectors with Professional access" message

### Sector Pages

Test routes:
- `/sectors/digital-infrastructure`
- `/sectors/tourism-hospitality`

**Expected Behavior:**
- ✅ Pages load without errors
- ✅ SEO metadata present
- ✅ Mobile responsive
- ✅ CTAs functional
- ✅ Content accurate (no unsupported claims)
- ✅ Institutional/investor tone

### Top Navigation

**Expected Behavior:**
- ✅ Sectors mega menu includes "Digital Infrastructure" link
- ✅ Sectors mega menu includes "Tourism & Hospitality" link
- ✅ Links navigate correctly
- ✅ No broken links
- ✅ Responsive behavior preserved

---

## Content Standards

### Digital Infrastructure

Copy references where appropriate:
- Digital public infrastructure
- Broadband/fiber backbone
- Cloud and data center readiness
- Digital ID and trust services
- Payments interoperability
- E-government modernization
- Cybersecurity and sovereign data
- AI readiness
- Institutional digital transformation

### Tourism & Hospitality

Copy references where appropriate:
- Visitor economy
- Destination infrastructure
- Hospitality investment
- Aviation and air connectivity
- Diaspora travel
- Events economy
- Cultural and heritage tourism
- Tourism board modernization
- Destination intelligence
- Sports tourism

**Rules:**
- Institutional/investor-facing tone
- No unsupported hard-coded statistics
- No "live data" or "real-time" claims
- Executive-grade language
- Country-specific where possible

---

## Known Limitations

1. **No All-74 Expansion Yet:** Only 20 priority countries have 7 sectors. Remaining 54 markets still have 5 sectors.
2. **No Scheduled Ingestion:** Digital Infrastructure and Tourism data is currently seeded manually.
3. **No Auth/RLS Changes:** Entitlement system unchanged (`explorer` plan required).

---

## Stage 1 Completion Status

**SQL Execution:** ✅ COMPLETE
- Seed file executed: 40 rows added
- Verification passed: All 11 checks returned `'✓ PASS'`
- Database confirmed: 140 sector rows across 20 priority countries

**UI Implementation:** ✅ COMPLETE
- Sector accordion updated with Server (Digital Infrastructure) and Plane (Tourism & Hospitality) icons
- "+2 more sectors" UX implemented for Professional+ users
- Top navigation updated with Digital Infrastructure and Tourism & Hospitality links
- Sector pages created for both new sectors

**Browser QA:** 🔲 PENDING
- Country intelligence panel testing
- Sector page testing
- Top navigation testing

---

## Next Steps

### Immediate: Browser QA
- Test country intelligence panels for all 20 priority countries
- Verify sector accordion shows 7 sectors with "+2 more" interaction
- Test Digital Infrastructure and Tourism & Hospitality sector pages
- Confirm top navigation links work correctly

### Stage 2: All-74 Expansion
Expand Digital Infrastructure and Tourism & Hospitality to all 74 markets:
- 54 remaining countries × 2 sectors = 108 new rows
- Expected total: 288 sector rows (140 priority + 148 remaining)
- Country-specific executive-grade copy for 54 markets

### Stage 3: UI Refinement
- Test "+2 more sectors" UX at scale across all 74 markets
- Refine sector card layout for 7 sectors
- Test panel fit and scroll behavior
- Mobile responsiveness testing

### Phase 4B: Sector Ingestion
- Plan scheduled ingestion for Digital Infrastructure metrics
- Plan scheduled ingestion for Tourism & Hospitality metrics
- Define data sources and update schedules
- Implement ingestion scripts

---

## Files Changed

### SQL
- `infra/supabase/sql-pack-v1.12a-add-digital-tourism-priority-20.sql` (NEW)
- `infra/supabase/verification/phase-4a-digital-tourism-priority-20-verification.sql` (NEW)

### UI Components
- `apps/api-gateway/src/components/intelligence/EntitledSectorList.tsx` (MODIFIED)
- `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx` (MODIFIED)

### Sector Pages
- `apps/api-gateway/src/app/sectors/digital-infrastructure/page.tsx` (NEW)
- `apps/api-gateway/src/app/sectors/digital-infrastructure/DigitalInfrastructureHub.tsx` (NEW)
- `apps/api-gateway/src/app/sectors/tourism-hospitality/page.tsx` (NEW)
- `apps/api-gateway/src/app/sectors/tourism-hospitality/TourismHospitalityHub.tsx` (NEW)

### Documentation
- `docs/qa/phase-4a-digital-tourism-priority-20-implementation.md` (NEW)

---

## Final Status

✅ **Phase 4A Stage 1: COMPLETE**

**Database:**
- SQL seed file executed successfully
- 140 sector rows confirmed (20 countries × 7 sectors)
- All verification checks passed

**Code:**
- UI components updated with 7-sector support
- Sector pages created for Digital Infrastructure and Tourism & Hospitality
- Top navigation updated
- No linter errors introduced

**Documentation:**
- Implementation guide complete
- Verification guide complete
- Browser QA checklist prepared

**Ready For:**
- Browser QA testing
- Stage 2 planning (All-74 expansion)
