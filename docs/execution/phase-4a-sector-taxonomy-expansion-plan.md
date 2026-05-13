# Phase 4A — Sector Taxonomy Expansion Plan

**Status:** 📋 PLANNING (Awaiting Approval)  
**Date:** 2026-05-05  
**Owner:** Afronovation, Inc.  
**Related:** Phase 4A — DATA-SEED-01 Priority 20

---

## Executive Summary

This plan restores **Tourism & Hospitality** and adds **Digital Infrastructure** as Souvera's 6th and 7th core sectors, expanding complete 7-sector coverage to all 74 markets. Digital Infrastructure is the primary Afronovation-aligned vertical, representing sovereign digital transformation, while Tourism & Hospitality is strategically critical for African and Caribbean economies.

**Proposed Implementation Order:**
1. ✅ **Approve this amended plan** (Phase 4A-B planning)
2. 🟡 **Stage 1:** Add Digital Infrastructure + Tourism & Hospitality to 20 priority countries (140 rows)
3. 🟡 **Track C:** Build Digital Infrastructure + Tourism & Hospitality sector pages + mega menu integration
4. 🟡 **Stage 2:** Expand all 7 sectors to all 74 markets (518 rows)

**Key Decision Required:**  
How should Professional+ users access 7 sectors when only 5 fit collapsed? (See Section 3: UX Behavior Recommendation)

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Updated Sector Taxonomy](#2-updated-sector-taxonomy)
3. [UX Behavior Recommendation for 6 Sectors](#3-ux-behavior-recommendation-for-6-sectors)
4. [Two-Stage Data Expansion Strategy](#4-two-stage-data-expansion-strategy)
5. [Content Standards for Tourism & Hospitality](#5-content-standards-for-tourism--hospitality)
6. [SQL Implementation Strategy](#6-sql-implementation-strategy)
7. [Verification Scripts](#7-verification-scripts)
8. [Documentation Updates](#8-documentation-updates)
9. [Acceptance Criteria](#9-acceptance-criteria)
10. [Track C: Tourism & Hospitality Sector Page](#10-track-c-tourism--hospitality-sector-page)
11. [Risks and Mitigations](#11-risks-and-mitigations)
12. [Recommendation](#12-recommendation)

---

## 1. Current State Audit

### 1.1 Sector Seed Status (as of 2026-05-05)

**File:** `infra/supabase/sql-pack-v1.11b-seed-sectors-priority-20.sql`

**Current Coverage:**
- **Countries:** 20 priority markets
  - Africa (15): NGA, ZAF, KEN, EGY, GHA, CIV, ETH, MAR, TZA, UGA, RWA, SEN, CMR
  - Caribbean (5): JAM, TTO, BRB, DOM, BHS, GRD, LCA
- **Sectors per country:** 5
- **Total sector rows:** 100 (20 countries × 5 sectors)

**Current Sector Taxonomy:**
1. `fintech` — Fintech and Digital Finance
2. `energy` — Energy and Renewables
3. `agriculture` — Agriculture and Agribusiness
4. `mining` — Mining and Critical Minerals
5. `logistics` — Logistics and Trade

**Sector Key Naming Conventions:**
- `sector_key`: lowercase, underscores for multi-word (e.g., `fintech`, `energy`, `mining`)
- `sector_label`: Title case, full label (e.g., "Fintech and Digital Finance")
- `display_order`: 1-5 (sequential)
- `min_plan_id`: `'explorer'` (all sectors visible to Explorer with teaser)

**SQL Quoting Strategy:**
- PostgreSQL dollar-quoted strings (`$$...$$`) for all prose fields
- No psql meta-commands
- Idempotent `ON CONFLICT (country_id, sector_key) DO UPDATE`

### 1.2 UI Component Analysis

**File:** `apps/api-gateway/src/components/intelligence/EntitledSectorList.tsx`

**Current Behavior:**
- **Explorer/Public:** Shows 1 sector teaser (no rationale, no expansion)
- **Professional+:** Shows up to 5 sectors with accordion expansion
- **Collapsed State:** All 5 sectors fit without scrolling (achievement in Phase 4A)
- **Icon Support:** ✅ Sector-specific icons already implemented (Landmark, Zap, Leaf, Gem, Truck)
- **Expansion Pattern:** One-at-a-time accordion
- **Teaser Line-Clamp:** 1 line when collapsed

**Collapsed Card Height:** ~58px per sector

**Critical Constraint:**
- Panel viewport optimized for 5 collapsed sectors (~290px vertical space)
- Adding a 6th sector without adjustment will force scrolling in collapsed state
- This breaks the "all collapsed sectors fit without scrolling" UX achievement from Phase 4A

**Icon Mapping:**
| Sector | Icon | Color |
|--------|------|-------|
| Fintech / Digital Finance | `Landmark` | Blue |
| Energy / Renewables | `Zap` | Amber |
| Agriculture / Agribusiness | `Leaf` | Emerald |
| Mining / Minerals | `Gem` | Purple |
| Logistics / Trade | `Truck` | Cyan |
| **Tourism / Hospitality** | **TBD** | **TBD** |

**Proposed Icon for Tourism:**
- Icon: `Palmtree` or `Plane` or `Hotel` (lucide-react)
- Color: Teal (`text-teal-400`) or Pink (`text-pink-400`)
- Recommendation: `Plane` icon with `text-teal-400` (represents aviation, travel, connectivity)

### 1.3 Souvera Market Scope

**File:** `apps/api-gateway/src/lib/market-coverage.ts`

**Total Approved Markets:** 74
- **Africa:** 54 countries (AU member states, excludes ESH)
- **Caribbean:** 20 markets/territories

**Africa Regions:**
- North Africa: 6 countries (MAR, DZA, TUN, LBY, EGY, SDN)
- West Africa: 16 countries (NGA, GHA, SEN, MLI, BFA, NER, GIN, SLE, LBR, CIV, TGO, BEN, GMB, GNB, CPV, MRT)
- East Africa: 14 countries (ETH, KEN, TZA, UGA, RWA, BDI, SOM, DJI, ERI, MDG, COM, MUS, SYC, SSD)
- Central Africa: 9 countries (CMR, CAF, COD, COG, GAB, GNQ, STP, TCD, AGO)
- Southern Africa: 9 countries (ZAF, BWA, LSO, SWZ, NAM, ZWE, MOZ, ZMB, MWI)

**Caribbean Markets:**
- ATG, BHS, BRB, CUB, DMA, DOM, GRD, HTI, JAM, KNA, LCA, VCT, SUR, TTO, GUY, BLZ, PRI, VIR, VGB, CYM

---

## 2. Updated Sector Taxonomy

### 2.1 New Sector Definition

**Add 6th Sector:**
- **sector_key:** `tourism_hospitality`
- **sector_label:** `Tourism and Hospitality`
- **display_order:** `6`
- **min_plan_id:** `'explorer'`

**Strategic Rationale:**
Tourism & Hospitality is a sovereign economic sector for African and Caribbean markets, connecting:
- Foreign exchange earnings
- Aviation and air connectivity
- Hotel and hospitality investment
- Destination infrastructure
- Diaspora travel corridors
- Cultural and heritage tourism
- Events and sports tourism (AfCON, cultural festivals)
- Employment and SME ecosystems
- Regional leisure and business travel
- Destination branding and tourism board modernization

**Afronovation Strategic Alignment:**
- **Bridge55:** Pan-African diaspora connectivity and travel
- **AfCON Hub:** Major sports tourism and events economy
- **Tourism Board SaaS:** Destination intelligence and tourism board platforms
- **Visitor Economy:** Sovereign data for tourism ministries and investment promotion agencies

### 2.2 Complete 6-Sector Taxonomy

**Updated Universal Sector Model:**
1. `fintech` — Fintech and Digital Finance (display_order: 1)
2. `energy` — Energy and Renewables (display_order: 2)
3. `agriculture` — Agriculture and Agribusiness (display_order: 3)
4. `mining` — Mining and Critical Minerals (display_order: 4)
5. `logistics` — Logistics and Trade (display_order: 5)
6. **`tourism_hospitality`** — **Tourism and Hospitality** (display_order: 6)

**All sectors:**
- Use `min_plan_id = 'explorer'` (visible to all users)
- Include `teaser_md` and `rationale_md`
- Use `strength_score` and `growth_score` (0-100)
- Are country-specific, not generic

---

## 3. UX Behavior Recommendation for 6 Sectors

### 3.1 Problem Statement

**Current Achievement (Phase 4A):**
- Professional+ users see 5 collapsed sector cards
- All 5 cards fit within the panel viewport without scrolling
- Collapsed card height: ~58px
- Total collapsed height for 5 sectors: ~290px
- This is a **core UX achievement** for Fortune-5 quality

**New Constraint with 6 Sectors:**
- Adding a 6th sector at 58px height = ~348px total
- Panel viewport cannot accommodate 6 collapsed sectors without scrolling
- This breaks the "all collapsed sectors fit" discipline

**Question:**
How should Professional+ users access 6 sectors while preserving panel discipline?

### 3.2 Options Analysis

#### Option A: Top 5 by Score + "+1 More Sector" Indicator (RECOMMENDED)

**Behavior:**
1. By default, show the **top 5 sectors** ranked by `(strength_score + growth_score) / 2`
2. If a 6th sector exists, show a compact "+1 more sector" card at the bottom
3. Clicking "+1 more sector" reveals the 6th sector and collapses the lowest-ranked of the top 5
4. All 6 sectors remain accessible but only 5 are visible at once

**Visual Design:**
```
┌─────────────────────────────────────┐
│ [Icon] Fintech and Digital Finance  │ Score: 87
├─────────────────────────────────────┤
│ [Icon] Energy and Renewables        │ Score: 85
├─────────────────────────────────────┤
│ [Icon] Mining and Critical Minerals │ Score: 82
├─────────────────────────────────────┤
│ [Icon] Agriculture and Agribusiness │ Score: 78
├─────────────────────────────────────┤
│ [Icon] Tourism and Hospitality      │ Score: 76
├─────────────────────────────────────┤
│ 🔓 +1 more sector with Professional │ ← Clickable
└─────────────────────────────────────┘
```

**Pros:**
- ✅ Preserves "all visible sectors fit without scrolling" discipline
- ✅ Data-driven (score-based ranking)
- ✅ Fortune-5 quality (information hierarchy)
- ✅ Maintains compact panel design
- ✅ All 6 sectors remain accessible
- ✅ Existing accordion expansion behavior preserved

**Cons:**
- ⚠️ Adds UI complexity ("+1 more" control)
- ⚠️ Requires score-based sorting logic

---

#### Option B: Scroll Within Sector Section

**Behavior:**
1. Show all 6 collapsed sectors
2. Make the sector section scrollable with max-height
3. Scrollbar appears within the sector section only

**Pros:**
- ✅ Simple implementation
- ✅ All 6 sectors immediately visible

**Cons:**
- ❌ Breaks "all collapsed sectors fit without scrolling" achievement
- ❌ Nested scrolling (panel scroll + sector scroll) is poor UX
- ❌ Less Fortune-5 quality (scrolling feels less disciplined)

---

#### Option C: "View All Sectors" Toggle

**Behavior:**
1. By default, show 5 sectors (top by score or first 5 by display_order)
2. Show "View all 6 sectors" button at bottom
3. Clicking reveals all 6 sectors and allows scrolling

**Pros:**
- ✅ Preserves collapsed fit by default
- ✅ Progressive disclosure

**Cons:**
- ⚠️ Similar to Option A but less elegant (modal/expansion feels heavier)
- ⚠️ Requires more UI engineering (modal or drawer component)

---

### 3.3 Recommendation

**Adopt Option A: Top 5 by Score + "+1 More Sector" Indicator**

**Rationale:**
1. **Fortune-5 Quality:** Maintains the "all visible sectors fit without scrolling" discipline that was achieved in Phase 4A
2. **Data-Driven:** Uses sector strength/growth scores to prioritize the most relevant sectors for each country
3. **Information Hierarchy:** Shows the strongest 5 sectors first, with the 6th accessible on demand
4. **Scalable:** If a 7th sector is ever added, the pattern scales ("+2 more sectors")
5. **Consistent with Existing UX:** Preserves accordion expansion behavior

**Implementation Notes:**
- Sort sectors by `(strength_score + growth_score) / 2` descending
- Show top 5
- If `sectors.length > maxVisible`, show "+1 more sector" card
- Clicking "+1 more" could:
  - Replace the 5th sector with the 6th, or
  - Show a modal/drawer with all 6 sectors, or
  - Expand the section to allow scrolling (hybrid of Option A + Option B)

**Explorer/Public Behavior (Unchanged):**
- Still see only 1 sector teaser (highest-ranked by score)
- No "+1 more" indicator

---

## 4. Two-Stage Data Expansion Strategy

### 4.1 Stage 1: Tourism & Hospitality for Priority 20

**Scope:**
- Add `tourism_hospitality` sector to 20 priority countries
- Keep existing 5 sectors intact
- Total rows: 120 (20 countries × 6 sectors)

**Priority Countries:**
- **Africa (15):** NGA, ZAF, KEN, EGY, GHA, CIV, ETH, MAR, TZA, UGA, RWA, SEN, CMR
- **Caribbean (5):** JAM, TTO, BRB, DOM, BHS, GRD, LCA

**SQL File:**
- `infra/supabase/sql-pack-v1.12a-add-tourism-priority-20.sql`

**Expected Result:**
- 20 new sector rows (tourism_hospitality only)
- Existing 100 rows unchanged
- Total: 120 rows

**Verification:**
- 20 countries should have 6 sectors each
- `tourism_hospitality` present for all 20
- No duplicates

---

### 4.2 Stage 2: All 6 Sectors to All 74 Markets

**Scope:**
- Expand all 6 sectors to all 74 Souvera markets
- Add 54 remaining countries (74 - 20 = 54 new countries)
- Total rows: 444 (74 countries × 6 sectors)

**New Markets to Cover (54):**

**Africa Remaining (39 countries):**
- North Africa: DZA, TUN, LBY, SDN (4 remaining)
- West Africa: MLI, BFA, NER, GIN, SLE, LBR, TGO, BEN, GMB, GNB, CPV, MRT (12 remaining)
- East Africa: BDI, SOM, DJI, ERI, MDG, COM, MUS, SYC, SSD (9 remaining)
- Central Africa: CAF, COD, COG, GAB, GNQ, STP, TCD, AGO (8 remaining)
- Southern Africa: BWA, LSO, SWZ, NAM, ZWE, MOZ, ZMB, MWI (6 remaining, ZAF/LSO already in priority 20)

**Caribbean Remaining (15 markets):**
- ATG, CUB, DMA, HTI, KNA, LCA, VCT, SUR, GUY, BLZ, PRI, VIR, VGB, CYM (13 remaining)
- Note: LCA already in priority 20, so 13 truly new

**SQL Files (Regional Packs):**
1. `infra/supabase/sql-pack-v1.13a-all-sectors-africa-remaining.sql` (39 countries × 6 sectors = 234 rows)
2. `infra/supabase/sql-pack-v1.13b-all-sectors-caribbean-remaining.sql` (13 countries × 6 sectors = 78 rows)
3. Or combine: `infra/supabase/sql-pack-v1.13-all-sectors-all-74-markets.sql` (444 total rows)

**Expected Result:**
- All 74 countries have 6 sectors
- Total: 444 rows (74 × 6)
- No missing sectors
- No duplicates

**Verification:**
- Every country in `APPROVED_AFRICA_ISO3` has 6 sectors
- Every country in `APPROVED_CARIBBEAN_ISO3` has 6 sectors
- `tourism_hospitality` present for all 74
- Total sector rows = 444

---

### 4.3 Implementation Order

**Recommended Phasing:**
1. ✅ **Approve this plan** (no code changes)
2. 🟡 **Implement Stage 1** (Tourism for Priority 20)
   - Create SQL seed file
   - Run in Supabase
   - Verify 120 rows
   - Test UI with 6 sectors
3. 🟡 **Implement Track C** (Tourism sector page + mega menu)
   - Update `SouveraMegaNav.tsx`
   - Build `/sectors/tourism-hospitality` page
   - Test navigation
4. 🟡 **Implement Stage 2** (All 6 sectors to all 74)
   - Create SQL seed files (regional or combined)
   - Run in Supabase
   - Verify 444 rows
   - Test random sample countries

**Why This Order:**
- Stage 1 is a small, testable increment (20 rows added)
- Track C establishes Tourism as a first-class sector in the product
- Stage 2 is a large expansion (324 new rows) and benefits from Stage 1 lessons learned

---

## 5. Content Standards for Tourism & Hospitality

### 5.1 Copy Style

**Tone:** Sovereign-grade, institutional, investor-facing

**Target Audience:**
- Tourism ministries and boards
- Hotel and hospitality investors
- Aviation and infrastructure investors
- Destination marketing agencies
- Foreign direct investment promotion agencies
- Diaspora engagement organizations

**Preferred Language:**
- "visitor economy"
- "destination infrastructure"
- "hospitality capacity"
- "diaspora travel corridors"
- "air connectivity"
- "events economy"
- "coastal tourism" / "heritage tourism" / "eco-tourism"
- "regional leisure demand"
- "tourism board modernization"
- "sovereign destination strategy"

**Avoid:**
- "vacation deals"
- "cheap trips"
- "book now"
- consumer travel brochure language
- unsupported precise statistics (e.g., "$200B industry") unless source-verified

### 5.2 Structural Requirements

**teaser_md:**
- Length: 1-2 short sentences, 120-220 characters
- Purpose: High-level sector relevance for Explorer/Public preview
- Style: Conservative, country-specific

**rationale_md:**
- Length: 2-4 concise sentences, 350-650 characters
- Purpose: Deeper sector analysis for Professional+ users
- Style: Executive-grade, sourced claims or conservative positioning language

**Scores:**
- `strength_score`: 0-100 (tourism sector maturity, infrastructure, capacity)
- `growth_score`: 0-100 (tourism momentum, air connectivity expansion, investment activity)

### 5.3 Content Examples

#### Example 1: Jamaica (Caribbean, Strong Tourism)

**teaser_md:**
```
Jamaica's visitor economy is anchored by regional air connectivity, established resort infrastructure, and strong diaspora travel demand.
```
(~140 characters)

**rationale_md:**
```
Jamaica combines mature hospitality capacity, robust air connectivity across North America and Europe, and deep cultural tourism assets. The visitor economy contributes significantly to foreign exchange, employment, and destination infrastructure investment. Diaspora travel, leisure tourism, and events such as music festivals and sports position Jamaica as a Caribbean tourism anchor.
```
(~380 characters)

**Scores:**
- strength_score: 82
- growth_score: 78

---

#### Example 2: Nigeria (Africa, Emerging Tourism)

**teaser_md:**
```
Nigeria's visitor economy is supported by business travel, diaspora demand, cultural heritage assets, and aviation infrastructure development.
```
(~145 characters)

**rationale_md:**
```
Nigeria's tourism sector is driven by business travel to Lagos and Abuja, diaspora engagement, and growing interest in cultural heritage and eco-tourism. Aviation connectivity is expanding through regional and international routes, and hotel capacity is increasing in commercial centers. The sector represents an underutilized opportunity for destination investment and tourism board modernization.
```
(~395 characters)

**Scores:**
- strength_score: 65
- growth_score: 72

---

#### Example 3: Kenya (Africa, Strong Eco-Tourism)

**teaser_md:**
```
Kenya's visitor economy is anchored by established wildlife tourism, air connectivity, hospitality infrastructure, and regional events capacity.
```
(~145 characters)

**rationale_md:**
```
Kenya is a leading African tourism destination supported by wildlife and eco-tourism, coastal leisure travel, and business tourism to Nairobi. Air connectivity through Nairobi's regional hub, hotel infrastructure across key tourism zones, and destination branding position Kenya as a mature visitor economy. The sector contributes significantly to foreign exchange, employment, and conservation financing.
```
(~410 characters)

**Scores:**
- strength_score: 88
- growth_score: 80

---

### 5.4 Regional Tailoring

**Africa Markets:**
Emphasize:
- Wildlife and eco-tourism
- Cultural and heritage tourism
- Business travel to commercial centers
- Regional aviation hubs
- Sports tourism (AfCON, athletics events)
- Diaspora engagement
- Tourism board modernization
- Destination infrastructure investment

**Caribbean Markets:**
Emphasize:
- Leisure and resort tourism
- Cruise infrastructure
- Diaspora travel (especially North America/Europe)
- Air connectivity (US, Canada, UK routes)
- Climate-resilient tourism
- Events and cultural festivals
- Services economy contribution
- Destination branding

---

### 5.5 Data Claim Caution

**Tourism Industry Statistics:**
If adding African or Caribbean tourism market size/growth claims, they must be:
1. Source-verified (e.g., UNWTO, World Bank, regional tourism organizations)
2. Documented in methodology or source registry
3. Conservative in phrasing if not precisely sourced

**Example (Conservative):**
> "Tourism and hospitality represents one of the most important visitor-economy and services-sector opportunities across African and Caribbean markets, with strong relevance to foreign exchange, job creation, infrastructure, and destination investment."

**Example (Precise, Requires Source):**
> "Africa's tourism sector generated $169B in revenue in 2019 (pre-COVID) and is projected to grow at 5.1% annually through 2030 according to UNWTO forecasts."

**For this implementation:**
- Use conservative positioning language
- Add precise statistics later after source verification
- Do not hard-code "$200B" or "5.1%" unless documented

---

## 6. SQL Implementation Strategy

### 6.1 File Structure

**Stage 1 (Tourism for Priority 20):**
- File: `infra/supabase/sql-pack-v1.12a-add-tourism-priority-20.sql`
- Rows: 20 (one `tourism_hospitality` row per priority country)
- Structure: CTE VALUES block or individual INSERT blocks

**Stage 2 (All 6 Sectors to All 74):**
- Option A (Recommended): Single file
  - `infra/supabase/sql-pack-v1.13-all-sectors-all-74-markets.sql`
  - Rows: 444 total (includes all priority 20)
  - Use idempotent ON CONFLICT to avoid duplicates
  
- Option B: Regional packs
  - `sql-pack-v1.13a-all-sectors-africa-remaining.sql` (234 rows)
  - `sql-pack-v1.13b-all-sectors-caribbean-remaining.sql` (78 rows)

### 6.2 SQL Best Practices

**Quoting:**
- Use PostgreSQL dollar-quoted strings (`$$...$$`) for all `teaser_md` and `rationale_md`
- No escaping needed for apostrophes
- No psql meta-commands (`\echo`, `\set`, etc.)

**Idempotency:**
```sql
INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
SELECT
  c.id,
  'tourism_hospitality',
  'Tourism and Hospitality',
  $$Jamaica's visitor economy is anchored by regional air connectivity...$$,
  $$Jamaica combines mature hospitality capacity, robust air connectivity...$$,
  82,
  78,
  6,
  'explorer'
FROM public.souvera_countries c
WHERE c.iso3 = 'JAM'
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

**CTE VALUES Pattern (Preferred for bulk insert):**
```sql
WITH sector_seed AS (
  SELECT * FROM (VALUES
    ('JAM', 'tourism_hospitality', 'Tourism and Hospitality', $$teaser$$, $$rationale$$, 82, 78, 6, 'explorer'),
    ('TTO', 'tourism_hospitality', 'Tourism and Hospitality', $$teaser$$, $$rationale$$, 75, 70, 6, 'explorer'),
    -- ... 20 or 74 rows ...
  ) AS v(iso3, sector_key, sector_label, teaser_md, rationale_md, strength_score, growth_score, display_order, min_plan_id)
)
INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md,
  strength_score, growth_score, display_order, min_plan_id
)
SELECT
  c.id, s.sector_key, s.sector_label, s.teaser_md, s.rationale_md,
  s.strength_score, s.growth_score, s.display_order, s.min_plan_id
FROM sector_seed s
JOIN public.souvera_countries c ON c.iso3 = s.iso3
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

**Why CTE VALUES:**
- Cleaner for large bulk inserts
- Single transaction
- Easier to verify row count
- Reduces repetitive JOIN logic

---

## 7. Verification Scripts

### 7.1 Stage 1 Verification (Tourism for Priority 20)

**File:** `infra/supabase/verification/phase-4a-tourism-priority-20-verification.sql`

**Queries:**
1. Total sector rows (should be 120)
2. Sector count by country (should be 6 for all priority 20)
3. Countries missing `tourism_hospitality`
4. Duplicate sector keys (should be 0)
5. Countries with tourism_hospitality (should be 20)
6. Sample tourism_hospitality rows (NGA, ZAF, KEN, JAM, TTO)
7. Tourism teaser/rationale completeness
8. Tourism strength/growth score ranges
9. Tourism display_order verification (should all be 6)
10. Tourism min_plan_id verification (should all be 'explorer')

**Example Query:**
```sql
-- Query 1: Total sector rows
SELECT 'Total Sector Rows' AS check_name;
SELECT COUNT(*) AS total_sector_rows
FROM public.souvera_country_sectors;
-- Expected: 120

-- Query 2: Sector count by country (priority 20)
SELECT 'Sector Count by Priority Country' AS check_name;
SELECT
  c.iso3,
  c.name,
  COUNT(s.id) AS sector_count
FROM public.souvera_countries c
LEFT JOIN public.souvera_country_sectors s ON s.country_id = c.id
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA')
GROUP BY c.iso3, c.name
ORDER BY sector_count DESC, c.name;
-- Expected: All 20 countries show 6 sectors

-- Query 3: Countries missing tourism_hospitality
SELECT 'Priority Countries Missing Tourism' AS check_name;
SELECT
  c.iso3,
  c.name
FROM public.souvera_countries c
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA')
  AND NOT EXISTS (
    SELECT 1 FROM public.souvera_country_sectors s
    WHERE s.country_id = c.id AND s.sector_key = 'tourism_hospitality'
  )
ORDER BY c.name;
-- Expected: 0 rows
```

---

### 7.2 Stage 2 Verification (All 6 Sectors for All 74)

**File:** `infra/supabase/verification/phase-4a-all-sectors-all-74-verification.sql`

**Queries:**
1. Total sector rows (should be 444)
2. Total countries with sector data (should be 74)
3. Sector count by country (should be 6 for all 74)
4. Countries missing any sector
5. Countries missing `tourism_hospitality` specifically
6. Duplicate sector keys (should be 0)
7. Africa sector coverage (54 countries × 6 = 324 rows)
8. Caribbean sector coverage (20 countries × 6 = 120 rows)
9. Sector key distribution (should be 74 rows per sector key)
10. Display_order verification (1-6 for each country)
11. Min_plan_id verification (all 'explorer')
12. Teaser/rationale completeness
13. Strength/growth score ranges
14. Sample rows for each region

**Example Query:**
```sql
-- Query 1: Total sector rows
SELECT 'Total Sector Rows (All 74 Markets)' AS check_name;
SELECT COUNT(*) AS total_sector_rows
FROM public.souvera_country_sectors;
-- Expected: 444

-- Query 2: Total countries with sector data
SELECT 'Countries with Sector Data' AS check_name;
SELECT COUNT(DISTINCT country_id) AS countries_with_sectors
FROM public.souvera_country_sectors;
-- Expected: 74

-- Query 3: Sector count by country (all 74)
SELECT 'Sector Count by Country (All 74)' AS check_name;
SELECT
  c.iso3,
  c.name,
  COUNT(s.id) AS sector_count
FROM public.souvera_countries c
LEFT JOIN public.souvera_country_sectors s ON s.country_id = c.id
WHERE c.is_african_country = true OR c.iso3 IN (
  'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA', 'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ', 'PRI', 'VIR', 'VGB', 'CYM'
)
GROUP BY c.iso3, c.name
HAVING COUNT(s.id) != 6
ORDER BY sector_count, c.name;
-- Expected: 0 rows (all countries have 6 sectors)

-- Query 5: Countries missing tourism_hospitality
SELECT 'Countries Missing Tourism Sector' AS check_name;
SELECT
  c.iso3,
  c.name
FROM public.souvera_countries c
WHERE (c.is_african_country = true OR c.iso3 IN (
  'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA', 'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ', 'PRI', 'VIR', 'VGB', 'CYM'
))
  AND NOT EXISTS (
    SELECT 1 FROM public.souvera_country_sectors s
    WHERE s.country_id = c.id AND s.sector_key = 'tourism_hospitality'
  )
ORDER BY c.name;
-- Expected: 0 rows
```

---

## 8. Documentation Updates

### 8.1 New Documentation Files

**1. This Planning Document:**
- `docs/execution/phase-4a-sector-taxonomy-expansion-plan.md`
- Purpose: Master plan for Tourism addition and 74-market expansion

**2. Tourism Sector Addition Guide:**
- `docs/qa/phase-4a-tourism-hospitality-sector-addition.md`
- Purpose: Detailed implementation guide for Stage 1
- Contents:
  - Tourism sector definition
  - Content standards and examples
  - SQL execution instructions
  - Verification queries
  - Browser QA checklist
  - Acceptance criteria

**3. All-Markets Coverage Plan:**
- `docs/qa/phase-4a-sector-coverage-all-markets-plan.md`
- Purpose: Detailed implementation guide for Stage 2
- Contents:
  - 74-country scope
  - Regional breakdowns
  - SQL execution strategy
  - Verification approach
  - Content generation approach
  - Quality standards

**4. Tourism & Hospitality Sector Page Implementation:**
- `docs/qa/phase-4a-tourism-sector-page-implementation.md`
- Purpose: Track C implementation guide
- Contents:
  - Page structure and design
  - Mega menu integration
  - SEO metadata
  - CTA components
  - Bridge55/AfCON Hub positioning
  - Acceptance criteria

### 8.2 Updated Documentation Files

**1. Priority 20 Implementation Doc:**
- `docs/qa/phase-4a-data-seed-01-priority-20-implementation.md`
- Update:
  - Add note: "This implementation was subsequently expanded to 6 sectors including Tourism & Hospitality. See phase-4a-sector-taxonomy-expansion-plan.md."
  - Update row counts: 100 → 120 (after Stage 1)
  - Add Tourism sector icon/color mapping

**2. Sector Accordion UI Docs:**
- `docs/qa/phase-4a-sector-accordion-ui-implementation.md`
- `docs/qa/phase-4a-sector-accordion-ui-summary.md`
- Update:
  - Document "Top 5 by Score + '+1 More Sector'" UX pattern
  - Add Tourism icon (`Plane`, teal color)
  - Update entitlement matrix for 6 sectors
  - Note panel fit behavior with 6 sectors

**3. Country Panel Final Polish Doc:**
- `docs/qa/phase-4a-country-panel-final-ui-polish.md`
- Update:
  - Note that Tourism & Hospitality was added post-Ghana mockup
  - Document 6-sector UX behavior
  - Update Souvera Intelligence summary examples to include tourism when relevant

---

## 9. Acceptance Criteria

### 9.1 Stage 1 Acceptance (Tourism for Priority 20)

**Data Acceptance:**
- ✅ 20 priority countries × 6 sectors = 120 rows total
- ✅ All 20 priority countries have `tourism_hospitality` sector
- ✅ No duplicate (country_id, sector_key) pairs
- ✅ All tourism rows have non-null `teaser_md` and `rationale_md`
- ✅ All tourism rows have `display_order = 6`
- ✅ All tourism rows have `min_plan_id = 'explorer'`
- ✅ Tourism `strength_score` and `growth_score` are 0-100

**UI Acceptance (Professional+):**
- ✅ Professional+ users see top 5 sectors by score (collapsed by default)
- ✅ "+1 more sector" indicator appears if 6 sectors exist
- ✅ Clicking "+1 more sector" reveals the 6th sector
- ✅ Tourism sector has `Plane` icon in teal color
- ✅ Tourism teaser visible when collapsed (1 line)
- ✅ Tourism rationale visible when expanded
- ✅ All 5 visible collapsed sectors fit without scrolling
- ✅ Expansion behavior (one-at-a-time) still works

**UI Acceptance (Explorer):**
- ✅ Explorer users see 1 sector teaser (highest-ranked by score)
- ✅ No "+1 more sector" indicator for Explorer
- ✅ Tourism sector may be the visible sector if it's highest-ranked

**Browser QA Routes:**
- ✅ `/intelligence/map?region=africa&selected=NGA` (Professional+)
- ✅ `/intelligence/map?region=africa&selected=GHA` (Professional+)
- ✅ `/intelligence/map?region=caribbean&selected=JAM` (Professional+)
- ✅ `/intelligence/map?region=africa&selected=NGA` (Explorer)
- ✅ `/intelligence/map?region=caribbean&selected=JAM` (Explorer)

**Build/Lint:**
- ✅ ESLint passes with zero warnings
- ✅ TypeScript compiles (no new errors)

---

### 9.2 Stage 2 Acceptance (All 6 Sectors for All 74)

**Data Acceptance:**
- ✅ 74 countries × 6 sectors = 444 rows total
- ✅ Every country in `APPROVED_AFRICA_ISO3` (54) has 6 sectors
- ✅ Every country in `APPROVED_CARIBBEAN_ISO3` (20) has 6 sectors
- ✅ All 74 countries have `tourism_hospitality` sector
- ✅ No duplicate (country_id, sector_key) pairs
- ✅ All rows have non-null `teaser_md` and `rationale_md`
- ✅ All rows have correct `display_order` (1-6)
- ✅ All rows have `min_plan_id = 'explorer'`

**UI Acceptance:**
- ✅ Random sample of 10 countries (5 Africa, 5 Caribbean) display correctly
- ✅ Professional+ sees top 5 sectors + "+1 more" where applicable
- ✅ Explorer sees 1 sector teaser
- ✅ No "Sectors data pending" messages for any of the 74 countries

**Content Quality:**
- ✅ All sector copy is country-specific (not generic templates)
- ✅ Tourism sector copy follows sovereign-grade tone
- ✅ No unsupported precise statistics
- ✅ Conservative positioning language used

**Browser QA Routes (Sample):**
- ✅ 5 Africa countries not in priority 20 (e.g., DZA, TUN, BWA, MDG, ZMB)
- ✅ 5 Caribbean countries not in priority 20 (e.g., ATG, CUB, HTI, GUY, BLZ)

---

### 9.3 Track C Acceptance (Tourism Sector Page)

**Navigation Acceptance:**
- ✅ "Tourism & Hospitality" appears in Sectors mega menu
- ✅ Link routes to `/sectors/tourism-hospitality` or `/sectors/tourism`
- ✅ Mega menu structure preserved (no broken links)
- ✅ Tourism appears in appropriate subsection (e.g., "Growth Sectors" or new "Services Sectors")

**Page Acceptance:**
- ✅ `/sectors/tourism-hospitality` page renders (not "Coming Soon")
- ✅ Page uses Souvera premium design language
- ✅ Page includes hero, sector overview, intelligence signals, regional lens, country integration, Bridge55 link, access CTA
- ✅ Page uses sovereign-grade, institutional language (not consumer travel brochure)
- ✅ No unsupported "$200B" or "5.1%" claims hard-coded
- ✅ Page is mobile responsive
- ✅ Page has SEO metadata (title, description, keywords)

**Build/Lint:**
- ✅ ESLint passes
- ✅ TypeScript compiles
- ✅ No broken links

---

## 10. Track C: Tourism & Hospitality Sector Page

### 10.1 Overview

**Current State:**
- Route `/sectors/tourism` exists but shows "Coming Soon" page
- Mega menu does NOT include Tourism & Hospitality
- SEO metadata is Caribbean-focused (needs update to include Africa)

**Goal:**
- Build full-featured Tourism & Hospitality sector page
- Add Tourism & Hospitality to mega menu
- Position as sovereign-grade intelligence vertical (not consumer travel)

---

### 10.2 Mega Menu Integration

**File to Modify:** `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx`

**Current Sectors Section (Lines 59-80):**
```typescript
{
  name: 'Sectors',
  icon: Building2,
  sections: [
    {
      title: 'Industry Coverage',
      links: [
        { name: 'Sector Overview', href: '/sectors' },
        { name: 'Fintech & Digital Finance', href: '/sectors/fintech' },
        { name: 'Critical Minerals & Mining', href: '/sectors/critical-minerals' },
      ],
    },
    {
      title: 'Growth Sectors',
      links: [
        { name: 'Energy & Renewables', href: '/sectors/energy' },
        { name: 'Agriculture & Agribusiness', href: '/sectors/agriculture' },
        { name: 'Logistics & Trade', href: '/sectors/logistics' },
      ],
    },
  ],
}
```

**Proposed Update:**

**Option A: Add to "Growth Sectors"**
```typescript
{
  title: 'Growth Sectors',
  links: [
    { name: 'Energy & Renewables', href: '/sectors/energy' },
    { name: 'Agriculture & Agribusiness', href: '/sectors/agriculture' },
    { name: 'Logistics & Trade', href: '/sectors/logistics' },
    { name: 'Tourism & Hospitality', href: '/sectors/tourism-hospitality' }, // NEW
  ],
}
```

**Option B: Create "Services Sectors" subsection**
```typescript
{
  name: 'Sectors',
  icon: Building2,
  sections: [
    {
      title: 'Industry Coverage',
      links: [
        { name: 'Sector Overview', href: '/sectors' },
        { name: 'Fintech & Digital Finance', href: '/sectors/fintech' },
        { name: 'Critical Minerals & Mining', href: '/sectors/critical-minerals' },
      ],
    },
    {
      title: 'Growth Sectors',
      links: [
        { name: 'Energy & Renewables', href: '/sectors/energy' },
        { name: 'Agriculture & Agribusiness', href: '/sectors/agriculture' },
        { name: 'Logistics & Trade', href: '/sectors/logistics' },
      ],
    },
    {
      title: 'Services Sectors', // NEW
      links: [
        { name: 'Tourism & Hospitality', href: '/sectors/tourism-hospitality' },
      ],
    },
  ],
}
```

**Recommendation:** Option A (add to Growth Sectors) for simplicity and immediate integration.

**Route:**
- Use `/sectors/tourism-hospitality` for consistency with `sector_key = 'tourism_hospitality'`
- Or keep `/sectors/tourism` and redirect `/sectors/tourism-hospitality` → `/sectors/tourism`

---

### 10.3 Page Structure

**File to Create/Update:** `apps/api-gateway/src/app/sectors/tourism-hospitality/page.tsx`
Or rename existing: `apps/api-gateway/src/app/sectors/tourism/page.tsx`

**Page Sections:**

#### A. Hero
**Title:** Tourism & Hospitality Intelligence

**Subtitle:**
> Destination, hospitality, aviation, events, and visitor-economy intelligence across African and Caribbean markets.

**Primary CTA:** Explore Tourism Signals (routes to `/intelligence/map`)

**Secondary CTA:** Request Sector Briefing (routes to `/access/request-access`)

**Visual:** Consider hero image of:
- Africa: Wildlife safari, cultural heritage site, coastal resort, or AfCON stadium
- Caribbean: Beach resort, cruise port, or cultural festival
- Or use abstract/geometric design matching Souvera brand

---

#### B. Sector Overview

**Heading:** Tourism & Hospitality as a Sovereign Economic Sector

**Content (2-3 paragraphs):**
> Tourism and hospitality is a cornerstone of economic development across African and Caribbean markets, contributing to foreign exchange earnings, employment generation, infrastructure investment, and destination branding. For many markets, the visitor economy represents a strategic lever for sovereign economic growth, connecting aviation and air connectivity, hotel and hospitality capacity, diaspora travel, cultural and heritage tourism, and major events such as sports tournaments and festivals.
>
> Souvera tracks tourism and hospitality as a first-class intelligence vertical, analyzing destination infrastructure investment, air connectivity expansion, hotel capacity trends, tourism board modernization, and visitor economy momentum across 74 African and Caribbean markets. The sector is particularly significant for Caribbean economies where tourism represents a major services export, and for African markets where eco-tourism, cultural tourism, business travel, and diaspora engagement are growing strategic priorities.
>
> Tourism intelligence is essential for tourism ministries, destination marketing organizations, hotel and hospitality investors, aviation and infrastructure developers, and foreign direct investment promotion agencies seeking to understand visitor economy trends, destination competitiveness, and sector-specific opportunities.

---

#### C. Intelligence Signals

**Heading:** Tourism & Hospitality Intelligence Signals

**Signal Categories (4-6 cards):**

1. **Visitor Economy Momentum**
   - Tourist arrivals and spending trends
   - Diaspora travel demand
   - Business travel patterns
   - Leisure travel growth

2. **Hotel and Hospitality Capacity**
   - Hotel room inventory
   - Resort and hospitality investment
   - Branded hotel chain expansion
   - Accommodation infrastructure development

3. **Air Connectivity and Mobility**
   - International flight routes
   - Regional hub connectivity
   - Aviation infrastructure investment
   - Visa and travel facilitation

4. **Events and Sports Tourism**
   - Major events hosting capacity
   - Sports tourism (AfCON, athletics, cricket)
   - Festivals and cultural events
   - MICE (meetings, incentives, conferences, exhibitions) capacity

5. **Heritage and Cultural Assets**
   - UNESCO World Heritage sites
   - Cultural tourism offerings
   - Eco-tourism and conservation tourism
   - Community-based tourism

6. **Destination Investment Readiness**
   - Tourism board modernization
   - Destination branding campaigns
   - Tourism infrastructure financing
   - Public-private partnership opportunities

**Visual:** Icons for each signal category (Lucide icons: `Users`, `Building2`, `Plane`, `Trophy`, `Landmark`, `TrendingUp`)

---

#### D. Regional Lens

**Heading:** Regional Tourism Dynamics

**Two-Column Layout:**

**Africa Tourism:**
- AfCON and major sports events
- Wildlife and eco-tourism
- Cultural and heritage tourism
- Business travel to commercial centers
- Regional aviation hub connectivity
- Tourism board modernization
- Destination infrastructure investment
- Diaspora travel engagement

**Caribbean Tourism:**
- Leisure and resort tourism
- Cruise industry and port infrastructure
- Diaspora travel (North America, Europe)
- Air connectivity (US, Canada, UK routes)
- Climate-resilient tourism development
- Services economy contribution
- Events and cultural festivals
- Destination branding and marketing

---

#### E. Country Intelligence Integration

**Heading:** Tourism Intelligence in Country Profiles

**Content:**
> Tourism & Hospitality appears as a dedicated sector card within each country intelligence panel on the Souvera Intelligence Map. Professional+ users can access detailed sector rationale, strength and growth scores, and country-specific tourism analysis covering destination infrastructure, air connectivity, hospitality capacity, and visitor economy trends.

**CTA:** Explore Country Intelligence (routes to `/intelligence/map`)

**Visual:** Screenshot or mockup of a country panel showing the Tourism sector card

---

#### F. Bridge55 / Afronovation Ecosystem Link

**Heading:** Strategic Alignment: Bridge55, AfCON Hub, and Tourism Board Intelligence

**Content (2-3 paragraphs):**
> Tourism & Hospitality intelligence is strategically aligned with Afronovation's ecosystem of destination, diaspora, and events platforms. Bridge55 connects African diaspora communities to opportunities and travel across the continent, while the AfCON Hub platform positions major sports tourism events as catalysts for destination infrastructure investment and hospitality capacity development.
>
> Souvera's tourism intelligence supports tourism boards, destination marketing organizations, and government agencies in modernizing tourism sector data, tracking visitor economy trends, and positioning sovereign destination strategies for institutional investors, hotel developers, and aviation partners.
>
> This intelligence vertical complements Afronovation's broader mandate to accelerate sovereign economic development through data, connectivity, and institutional-grade market intelligence across Africa and the Caribbean.

**CTA:** Learn About Afronovation (routes to `/about` or external link to afronovation.com)

---

#### G. Access CTA

**Heading:** Request Tourism & Hospitality Intelligence Access

**Content:**
> Access comprehensive tourism and hospitality intelligence, including sector-specific country briefings, destination competitiveness analysis, air connectivity tracking, and visitor economy trend reports with Souvera Professional or Business access.

**CTA Button:** Request Tourism Intelligence Access (routes to `/access/request-access?sector=tourism`)

---

### 10.4 SEO Metadata

**File:** `apps/api-gateway/src/app/sectors/tourism-hospitality/page.tsx` (or `/tourism/page.tsx`)

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'Tourism & Hospitality Intelligence | Souvera',
  description: 'Sovereign-grade tourism, hospitality, aviation, events, and visitor-economy intelligence across African and Caribbean markets.',
  keywords: [
    'tourism intelligence',
    'hospitality investment',
    'destination intelligence',
    'Africa tourism',
    'Caribbean tourism',
    'visitor economy',
    'air connectivity',
    'events tourism',
    'diaspora travel',
    'tourism board intelligence',
    'hotel investment',
    'eco-tourism Africa',
    'Caribbean hospitality',
    'tourism infrastructure',
  ],
  openGraph: {
    title: 'Tourism & Hospitality Intelligence | Souvera',
    description: 'Sovereign-grade tourism, hospitality, aviation, events, and visitor-economy intelligence across African and Caribbean markets.',
    url: 'https://souveraterminal.com/sectors/tourism-hospitality',
  },
  alternates: {
    canonical: 'https://souveraterminal.com/sectors/tourism-hospitality',
  },
};
```

**Note:** Update domain from `souvera.vercel.app` to `souveraterminal.com` (primary domain per user's strategic decision)

---

### 10.5 Design and Components

**Shared Components to Use:**
- Sector page hero (if exists, or create reusable component)
- Signal category cards
- Two-column regional breakdown
- Premium CTA buttons (primary + secondary)
- Souvera footer

**Design Language:**
- Match existing sector page patterns (if any are built beyond "Coming Soon")
- Use Souvera terminal aesthetic: dark backgrounds, blue/amber accents, subtle borders
- Premium button styling: `bg-blue-600 hover:bg-blue-500`
- Section spacing: `py-16` or `py-20` for major sections
- Typography: Use existing Souvera type scale

**Icons:**
- Hero: `Plane` or `Globe` or `Building2`
- Signal categories: `Users`, `Building2`, `Plane`, `Trophy`, `Landmark`, `TrendingUp`

---

### 10.6 Files to Inspect/Modify

**Navigation:**
- `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx`

**Page:**
- `apps/api-gateway/src/app/sectors/tourism-hospitality/page.tsx` (create or rename from `/tourism/page.tsx`)

**Shared Components (if they exist):**
- `apps/api-gateway/src/components/templates/SectorPageTemplate.tsx` (may not exist, check)
- `apps/api-gateway/src/components/ui/SectorHero.tsx` (may not exist)
- `apps/api-gateway/src/components/ui/SignalCard.tsx` (may not exist)

**Fallback:**
If shared components don't exist, build the page using standard Next.js/React/Tailwind without extracting components. Prioritize shipping the page over premature abstraction.

---

### 10.7 Implementation Steps (Track C)

1. ✅ Update `SouveraMegaNav.tsx` to add "Tourism & Hospitality" link
2. ✅ Create or rename `/sectors/tourism-hospitality/page.tsx`
3. ✅ Build hero section
4. ✅ Build sector overview section
5. ✅ Build intelligence signals section (6 cards)
6. ✅ Build regional lens section (Africa/Caribbean)
7. ✅ Build country intelligence integration section
8. ✅ Build Bridge55/Afronovation ecosystem link section
9. ✅ Build access CTA section
10. ✅ Add SEO metadata
11. ✅ Test navigation from mega menu
12. ✅ Test responsive breakpoints (desktop, tablet, mobile)
13. ✅ Run build/lint
14. ✅ Create documentation: `docs/qa/phase-4a-tourism-sector-page-implementation.md`

---

### 10.8 Track C Acceptance Criteria

**Navigation:**
- ✅ "Tourism & Hospitality" appears in Sectors mega menu under "Growth Sectors"
- ✅ Link routes to `/sectors/tourism-hospitality` (or `/sectors/tourism` with redirect)
- ✅ No broken links in mega menu

**Page Content:**
- ✅ Hero with title, subtitle, 2 CTAs
- ✅ Sector Overview (2-3 paragraphs, sovereign-grade language)
- ✅ Intelligence Signals (6 cards with icons)
- ✅ Regional Lens (Africa/Caribbean breakdown)
- ✅ Country Intelligence Integration (screenshot/mockup reference)
- ✅ Bridge55/Afronovation Ecosystem Link (2-3 paragraphs)
- ✅ Access CTA

**Design Quality:**
- ✅ Matches Souvera terminal aesthetic (dark, blue/amber accents)
- ✅ Premium button styling
- ✅ Responsive on desktop, tablet, mobile
- ✅ No horizontal overflow
- ✅ Icons render correctly

**SEO:**
- ✅ Page metadata includes title, description, keywords
- ✅ OpenGraph metadata present
- ✅ Canonical URL present

**Content Quality:**
- ✅ Sovereign-grade, institutional language (not consumer travel brochure)
- ✅ No unsupported "$200B" or "5.1%" claims
- ✅ Conservative positioning language
- ✅ Africa and Caribbean both represented
- ✅ Bridge55/AfCON Hub positioning clear

**Build/Lint:**
- ✅ ESLint passes (zero warnings)
- ✅ TypeScript compiles (no new errors)
- ✅ Build completes successfully

---

## 11. Risks and Mitigations

### 11.1 Risk: Panel Fit with 6 Sectors

**Risk:** Adding a 6th sector could force scrolling in collapsed state, breaking Phase 4A UX achievement.

**Mitigation:**
- Use "Top 5 by Score + '+1 More Sector'" UX pattern (Option A)
- Maintain information hierarchy and panel discipline
- Test thoroughly with Professional+ accounts before Stage 1 approval

**Probability:** Medium  
**Impact:** High (UX degradation)  
**Status:** Mitigated by UX recommendation in Section 3

---

### 11.2 Risk: Tourism Content Quality Variability

**Risk:** Tourism sector content for 74 countries may be generic or inconsistent in quality.

**Mitigation:**
- Use strict content standards (Section 5)
- Generate country-specific copy (not templates)
- Review sample content before Stage 2 bulk generation
- Prioritize conservative language over unsupported statistics
- Conduct content QA on random sample (10 countries) before full deployment

**Probability:** Medium  
**Impact:** High (brand quality)  
**Status:** Mitigated by strict content standards

---

### 11.3 Risk: SQL Execution Errors

**Risk:** Large bulk INSERT (444 rows) could fail mid-execution or create duplicates.

**Mitigation:**
- Use CTE VALUES pattern with single transaction
- Use idempotent `ON CONFLICT` clause
- Test Stage 1 (20 rows) thoroughly before Stage 2 (324 new rows)
- Run verification scripts after each stage
- Use Supabase SQL Editor (no psql meta-commands)

**Probability:** Low  
**Impact:** Medium (data integrity)  
**Status:** Mitigated by SQL best practices

---

### 11.4 Risk: Tourism Sector Page Scope Creep

**Risk:** Building a full-featured Tourism sector page could delay Stage 1/2 data expansion.

**Mitigation:**
- Implement Track C in parallel with Stage 1 (not blocking)
- Use "Coming Soon" page upgrade approach (already exists)
- Prioritize shipping over perfection
- Avoid creating new shared components if not needed (build page directly)

**Probability:** Medium  
**Impact:** Low (timeline delay)  
**Status:** Mitigated by phased implementation order

---

### 11.5 Risk: Icon/Color Conflicts

**Risk:** Tourism icon/color choice conflicts with existing sector icons.

**Mitigation:**
- Use `Plane` icon with `text-teal-400` (distinct from all current colors)
- Avoid overlapping colors:
  - Fintech: Blue
  - Energy: Amber
  - Agriculture: Emerald
  - Mining: Purple
  - Logistics: Cyan
  - **Tourism: Teal** (distinct from Cyan)

**Probability:** Low  
**Impact:** Low (visual polish)  
**Status:** Mitigated by proposed icon/color

---

## 12. Recommendation

### 12.1 Approve This Plan

**Recommendation:** ✅ **Approve Phase 4A Sector Taxonomy Expansion Plan**

**Rationale:**
1. Tourism & Hospitality is strategically critical for Africa and Caribbean markets
2. Aligns with Afronovation's Bridge55, AfCON Hub, and tourism board intelligence strategy
3. Restores a core sector that was part of original product vision
4. Phased implementation (Stage 1 → Track C → Stage 2) reduces risk
5. UX solution (Top 5 by Score + "+1 More") preserves Fortune-5 panel discipline
6. Content standards ensure sovereign-grade quality
7. SQL strategy is robust and Supabase-compatible
8. Verification scripts provide confidence in data integrity

---

### 12.2 Implementation Order (Post-Approval)

**Phase 1: Stage 1 — Tourism for Priority 20**
1. Generate Tourism sector content for 20 priority countries
2. Create SQL seed file: `sql-pack-v1.12a-add-tourism-priority-20.sql`
3. Run SQL in Supabase
4. Run verification: `phase-4a-tourism-priority-20-verification.sql`
5. Update `EntitledSectorList.tsx` for "Top 5 + +1 More" UX
6. Add Tourism icon (`Plane`, teal) to icon mapping
7. Test with Professional+ and Explorer accounts
8. Document: `phase-4a-tourism-hospitality-sector-addition.md`

**Phase 2: Track C — Tourism Sector Page**
1. Update `SouveraMegaNav.tsx` to add Tourism & Hospitality link
2. Build `/sectors/tourism-hospitality/page.tsx`
3. Implement hero, sector overview, signals, regional lens, Bridge55 link, CTA
4. Add SEO metadata
5. Test navigation and responsive behavior
6. Document: `phase-4a-tourism-sector-page-implementation.md`

**Phase 3: Stage 2 — All 6 Sectors to All 74**
1. Generate sector content for 54 remaining countries (Africa + Caribbean)
2. Create SQL seed file(s): `sql-pack-v1.13-all-sectors-all-74-markets.sql`
3. Run SQL in Supabase
4. Run verification: `phase-4a-all-sectors-all-74-verification.sql`
5. Test random sample (10 countries)
6. Document: `phase-4a-sector-coverage-all-markets-plan.md`

---

### 12.3 Immediate Next Step

**After approval of this plan:**
🟡 **Begin Stage 1 Implementation:** Add Tourism & Hospitality to 20 priority countries

**Estimated Effort:**
- SQL seed file creation: 2-3 hours (generate 20 country-specific Tourism sector rows)
- UI updates (Top 5 + "+1 More" UX): 2-3 hours
- Testing and verification: 1-2 hours
- Documentation: 1 hour
- **Total:** ~6-9 hours

---

## Appendix A: Files to Create

### A.1 SQL Files
1. `infra/supabase/sql-pack-v1.12a-add-tourism-priority-20.sql`
2. `infra/supabase/sql-pack-v1.13-all-sectors-all-74-markets.sql` (or regional split)

### A.2 Verification Files
1. `infra/supabase/verification/phase-4a-tourism-priority-20-verification.sql`
2. `infra/supabase/verification/phase-4a-all-sectors-all-74-verification.sql`

### A.3 Documentation Files
1. `docs/execution/phase-4a-sector-taxonomy-expansion-plan.md` (this file)
2. `docs/qa/phase-4a-tourism-hospitality-sector-addition.md`
3. `docs/qa/phase-4a-sector-coverage-all-markets-plan.md`
4. `docs/qa/phase-4a-tourism-sector-page-implementation.md`

### A.4 Code Files
1. `apps/api-gateway/src/components/intelligence/EntitledSectorList.tsx` (update for 6 sectors + "+1 More" UX)
2. `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx` (add Tourism link)
3. `apps/api-gateway/src/app/sectors/tourism-hospitality/page.tsx` (build or rename from `/tourism`)

---

## Appendix B: Content Generation Guidance

### B.1 Tourism Sector Copy Generation Workflow

For each country:
1. Research tourism sector fundamentals:
   - Major tourism segments (leisure, business, eco, cultural, diaspora)
   - Air connectivity (regional hub, major international routes)
   - Hotel/hospitality capacity
   - Major tourism assets (beaches, wildlife, heritage sites, events)
   - Tourism board presence and destination branding
2. Draft `teaser_md` (1-2 sentences, 120-220 chars)
3. Draft `rationale_md` (2-4 sentences, 350-650 chars)
4. Assign `strength_score` (0-100, based on maturity/infrastructure)
5. Assign `growth_score` (0-100, based on momentum/investment)
6. Use conservative language (no unsupported statistics)
7. Make country-specific (not generic template)

### B.2 Africa Tourism Themes by Subregion

**North Africa (MAR, EGY, TUN):**
- Mediterranean and Red Sea coastal tourism
- Heritage tourism (Pyramids, Roman ruins, medinas)
- Business travel to major commercial centers
- European visitor markets

**West Africa (NGA, GHA, SEN, CIV):**
- Business travel (Lagos, Accra, Abidjan)
- Diaspora engagement
- Coastal leisure (beaches, resorts)
- Cultural festivals and heritage

**East Africa (KEN, TZA, RWA, ETH, UGA):**
- Wildlife and safari tourism (Serengeti, Maasai Mara, gorillas)
- Coastal tourism (Kenya, Tanzania)
- Mountain tourism (Kilimanjaro, Rwenzori)
- Business travel (Nairobi, Addis Ababa)

**Southern Africa (ZAF, BWA, NAM, ZMB, MOZ):**
- Wildlife and safari (Kruger, Okavango, Etosha)
- Coastal tourism (Cape Town, Mozambique)
- Adventure tourism (Victoria Falls)
- Business travel (Johannesburg, Cape Town)

**Central Africa (CMR, GAB, COD, GNQ, STP):**
- Eco-tourism and conservation
- Business travel (Libreville, Douala)
- Coastal and island tourism (STP)
- Emerging destination development

### B.3 Caribbean Tourism Themes

**Major Islands (JAM, DOM, TTO, BRB, BHS):**
- Mature leisure and resort tourism
- Cruise industry
- Diaspora travel (North America, UK)
- Business and conference tourism

**Small Island States (LCA, GRD, ATG, KNA, VCT):**
- Boutique and eco-tourism
- Cruise ports
- High-end resort development
- Climate-resilient tourism

**Emerging Markets (CUB, HTI, GUY, SUR, BLZ):**
- Cultural and heritage tourism
- Eco-tourism and adventure
- Emerging destination infrastructure
- Diaspora engagement

---

## Appendix C: 20 Priority Countries

**Africa (15):**
1. NGA — Nigeria
2. ZAF — South Africa
3. KEN — Kenya
4. EGY — Egypt
5. GHA — Ghana
6. CIV — Côte d'Ivoire
7. ETH — Ethiopia
8. MAR — Morocco
9. TZA — Tanzania
10. UGA — Uganda
11. RWA — Rwanda
12. SEN — Senegal
13. CMR — Cameroon
14. (Placeholder for 2 more if not already in list)

**Caribbean (5):**
1. JAM — Jamaica
2. TTO — Trinidad and Tobago
3. BRB — Barbados
4. DOM — Dominican Republic
5. BHS — Bahamas
6. GRD — Grenada
7. LCA — Saint Lucia

**Note:** This list totals 20 countries. Verify exact priority 20 list from `sql-pack-v1.11b-seed-sectors-priority-20.sql`.

---

**END OF PLAN**

---

## Contact and Ownership

**Owner:** Afronovation, Inc.  
**Product:** Souvera Intelligence Terminal  
**Phase:** 4A — Sector Taxonomy Expansion  
**Status:** 📋 PLANNING (Awaiting Approval)  
**Date:** 2026-05-05

**Approval Required Before Implementation.**
