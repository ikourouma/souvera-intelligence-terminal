# Phase 4A Stage 2: All-74 Sector Coverage Plan

**Status:** ✅ COMPLETE — All 74 Markets Covered (Stage 2 Execution Complete)  
**Date Created:** 2026-05-05  
**Date Updated:** 2026-05-06 (Stage 2 Complete: All batches executed and verified)  
**Owner:** Afronovation, Inc.  
**Predecessor:** Phase 4A Stage 1 (7-sector taxonomy for 20 priority countries)

---

## Executive Summary

**STAGE 2 COMPLETE:** All 74 Souvera markets now have universal 7-sector coverage.

Stage 1 successfully deployed the 7-sector taxonomy to 20 priority markets (140 rows). Stage 2 has **successfully extended** complete sector coverage to the remaining 54 markets (378 additional rows), **achieving full 518-row coverage across all 74 markets.**

**Final Achievement:**
- ✅ 74 markets covered (54 Africa + 20 Caribbean)
- ✅ 518 total sector rows
- ✅ 7 universal sectors per market
- ✅ Executive-grade, country-specific content
- ✅ All 4 batches executed and verified
- ✅ Browser QA passed
- ✅ ESH / Western Sahara excluded (canonical 54 Africa scope)

---

## Stage 1 Completion Status

**Stage 1: ✅ COMPLETE**

| Metric | Value |
|--------|-------|
| Priority Countries | 20 |
| Sectors per Country | 7 |
| Total Rows | 140 |
| Digital Infrastructure | 20 rows (display_order: 1) |
| Tourism & Hospitality | 20 rows (display_order: 7) |
| SQL Execution | ✅ Verified |
| UI Implementation | ✅ Complete |
| Browser QA | ✅ Critical fix applied |

### API Sector Limit Fix (Critical)

During Stage 1 browser QA, a critical issue was discovered and fixed:

**Issue:** The `country-lite` API route had a hardcoded sector limit of 5 for Professional+ users, causing sectors 6 and 7 (Logistics & Trade, Tourism & Hospitality) to be truncated.

**Fix Applied:**
```typescript
// File: apps/api-gateway/src/app/api/v1/country-lite/route.ts
// Line 96 — Updated from 5 to 7:
const sectorLimit = hasSectorRationale ? 7 : 1;
```

**Impact:** Professional+ users now correctly see all 7 sectors with "+2 more sectors" reveal UX.

---

## Stage 2 Implementation Status

**Batch C (Southern Africa): ✅ EXECUTED AND VERIFIED**

| Metric | Value |
|--------|-------|
| Execution Date | 2026-05-05 |
| Countries | 8 (BWA, SWZ, LSO, MWI, MOZ, NAM, ZMB, ZWE) |
| New Rows | 56 |
| SQL Seed File | `sql-pack-v1.13c-stage2-africa-southern.sql` |
| Verification File | `phase-4a-stage2-batch-c-southern-africa-verification.sql` |
| Documentation | `phase-4a-stage2-batch-c-southern-africa-implementation.md` |
| Status | ✅ Complete — 13 verification checks passed |

**Batch C Results:**
- Executed as Stage 2 pilot batch
- Validated Stage 2 SQL structure and content approach
- Schema fix applied (`created_at` → `updated_at`)
- Current total after Batch C: 196 rows (Stage 1: 140 + Batch C: 56)

**Batch D (Caribbean Remaining): ✅ EXECUTED AND VERIFIED**

| Metric | Value |
|--------|-------|
| Execution Date | 2026-05-05 |
| Countries | 13 (ATG, CUB, DMA, HTI, KNA, VCT, SUR, GUY, BLZ, PRI, VGB, TCA, CYM) |
| New Rows | 91 |
| SQL Seed File | `sql-pack-v1.13d-stage2-caribbean.sql` |
| Verification File | `phase-4a-stage2-batch-d-caribbean-verification.sql` |
| Implementation Doc | `phase-4a-stage2-batch-d-caribbean-implementation.md` |
| Summary Doc | `phase-4a-stage2-batch-d-summary.md` |
| Status | ✅ Complete — 14 verification checks passed |

**Batch D Results:**
- Completed Caribbean sector coverage (20 countries total)
- 13 diverse Caribbean markets (financial centers, tourism, resource economies)
- Schema fix applied (`region_slug` → explicit ISO3 arrays)
- Current total after Batch D: 287 rows (196 + 91)

**Batch A (North + West Africa): ✅ EXECUTED AND VERIFIED**

| Metric | Value |
|--------|-------|
| Execution Date | 2026-05-05 |
| Countries | 16 (4 North + 12 West Africa) |
| North Africa | DZA, LBY, SDN, TUN |
| West Africa | BEN, BFA, CPV, GMB, GIN, GNB, LBR, MLI, MRT, NER, SLE, TGO |
| New Rows | 112 |
| SQL Seed File | `sql-pack-v1.13a-stage2-africa-north-west.sql` |
| Verification File | `phase-4a-stage2-batch-a-north-west-africa-verification.sql` |
| Implementation Doc | `phase-4a-stage2-batch-a-north-west-africa-implementation.md` |
| Summary Doc | `phase-4a-stage2-batch-a-summary.md` |
| Status | ✅ Complete — 14 verification checks passed |

**Batch A Results:**
- Completed North + West Africa sector coverage
- 16 diverse markets (Sahel, Sahara, coastal, Francophone)
- All schema compatibility fixes incorporated
- Current total after Batch A: 399 rows (287 + 112)
- Africa coverage after Batch A: 37 countries / 259 rows

**Batch B (East + Central Africa): ✅ EXECUTED AND VERIFIED (FINAL)**

| Metric | Value |
|--------|-------|
| Execution Date | 2026-05-06 |
| Countries | 17 (9 East + 8 Central Africa) |
| East Africa | BDI, COM, DJI, ERI, MDG, MUS, SYC, SOM, SSD |
| Central Africa | AGO, CAF, TCD, COG, COD, GNQ, GAB, STP |
| New Rows | 119 |
| SQL Seed File | `sql-pack-v1.13b-stage2-africa-east-central.sql` |
| Verification File | `phase-4a-stage2-batch-b-east-central-africa-verification.sql` |
| Pre-Execution Audit | `phase-4a-stage2-batch-b-pre-execution-audit.md` |
| Implementation Doc | `phase-4a-stage2-batch-b-east-central-africa-implementation.md` |
| Summary Doc | `phase-4a-stage2-batch-b-summary.md` |
| Status | ✅ Complete — 15 verification checks passed |

**Batch B Results (STAGE 2 COMPLETE):**
- **FINAL BATCH** completing Stage 2
- 17 diverse markets: island states, fragile contexts, resource economies, strategic hub
- Island states: Comoros, Madagascar, Mauritius, Seychelles, São Tomé
- Fragile contexts: Burundi, CAR, Eritrea, Somalia, South Sudan
- Resource economies: Angola, Chad, Congo, DRC, Equatorial Guinea, Gabon
- Strategic hub: Djibouti (port, submarine cables, military presence)
- **Final total after Batch B: 518 rows** (399 + 119)
- **STAGE 2 COMPLETE:** 74 markets / 518 rows ✅
- **Africa Complete:** 54 countries / 378 rows ✅
- **Caribbean Complete:** 20 markets / 140 rows ✅
- **Browser QA:** Passed (Professional+ and Explorer) ✅

---

## Market Coverage Target

### Current State (Post-Stage 1)

| Region | Countries | Sectors | Rows |
|--------|-----------|---------|------|
| Priority Africa | 13 | 7 | 91 |
| Priority Caribbean | 7 | 7 | 49 |
| **Priority Total** | **20** | **7** | **140** |

### Achieved State (Post-Stage 2) ✅

| Region | Countries | Sectors | Rows |
|--------|-----------|---------|------|
| All Africa | 54 | 7 | 378 |
| All Caribbean | 20 | 7 | 140 |
| **Grand Total** | **74** | **7** | **518** |

### Stage 2 Scope

| Metric | Value |
|--------|-------|
| Remaining Countries | 54 |
| Sectors per Country | 7 |
| New Rows Required | 378 |
| Final Total Rows | 518 |

---

## Priority 20 Countries (Already Covered)

### Africa — Priority 13

| ISO3 | Country | Subregion |
|------|---------|-----------|
| NGA | Nigeria | Western Africa |
| ZAF | South Africa | Southern Africa |
| KEN | Kenya | Eastern Africa |
| EGY | Egypt | Northern Africa |
| GHA | Ghana | Western Africa |
| CIV | Côte d'Ivoire | Western Africa |
| ETH | Ethiopia | Eastern Africa |
| MAR | Morocco | Northern Africa |
| TZA | Tanzania | Eastern Africa |
| UGA | Uganda | Eastern Africa |
| RWA | Rwanda | Eastern Africa |
| SEN | Senegal | Western Africa |
| CMR | Cameroon | Middle Africa |

### Caribbean — Priority 7

| ISO3 | Country |
|------|---------|
| JAM | Jamaica |
| TTO | Trinidad and Tobago |
| BRB | Barbados |
| DOM | Dominican Republic |
| BHS | Bahamas |
| GRD | Grenada |
| LCA | Saint Lucia |

---

## Remaining 54 Countries (Stage 2 Scope)

### Africa Remaining — 41 Countries

**IMPORTANT NOTE:** ESH / Western Sahara is excluded from current public Souvera scope to preserve the canonical 54-country Africa market count. It may be revisited later under a special markets / territories classification.

#### North Africa Remaining (4)

| ISO3 | Country |
|------|---------|
| DZA | Algeria |
| LBY | Libya |
| SDN | Sudan |
| TUN | Tunisia |

#### West Africa Remaining (12)

| ISO3 | Country |
|------|---------|
| BEN | Benin |
| BFA | Burkina Faso |
| CPV | Cabo Verde |
| GMB | Gambia |
| GIN | Guinea |
| GNB | Guinea-Bissau |
| LBR | Liberia |
| MLI | Mali |
| MRT | Mauritania |
| NER | Niger |
| SLE | Sierra Leone |
| TGO | Togo |

#### East Africa Remaining (9)

| ISO3 | Country |
|------|---------|
| BDI | Burundi |
| COM | Comoros |
| DJI | Djibouti |
| ERI | Eritrea |
| MDG | Madagascar |
| MUS | Mauritius |
| SYC | Seychelles |
| SOM | Somalia |
| SSD | South Sudan |

#### Central Africa Remaining (8)

| ISO3 | Country |
|------|---------|
| AGO | Angola |
| CAF | Central African Republic |
| TCD | Chad |
| COG | Congo (Brazzaville) |
| COD | DR Congo (Kinshasa) |
| GNQ | Equatorial Guinea |
| GAB | Gabon |
| STP | São Tomé and Príncipe |

#### Southern Africa Remaining (8)

| ISO3 | Country |
|------|---------|
| BWA | Botswana |
| SWZ | Eswatini |
| LSO | Lesotho |
| MWI | Malawi |
| MOZ | Mozambique |
| NAM | Namibia |
| ZMB | Zambia |
| ZWE | Zimbabwe |

### Caribbean Remaining — 13 Markets

| ISO3 | Country/Territory |
|------|-------------------|
| ATG | Antigua and Barbuda |
| CUB | Cuba |
| DMA | Dominica |
| HTI | Haiti |
| KNA | Saint Kitts and Nevis |
| VCT | Saint Vincent and the Grenadines |
| SUR | Suriname |
| GUY | Guyana |
| BLZ | Belize |
| PRI | Puerto Rico |
| VGB | British Virgin Islands |
| TCA | Turks and Caicos Islands |
| CYM | Cayman Islands |

---

## Batch Strategy

### Rationale

Creating one monolithic 378-row SQL file introduces:
- High risk of syntax errors cascading across all rows
- Difficult debugging and selective re-execution
- Longer transaction times and potential timeout issues
- Content review bottlenecks

**Recommended approach:** 4 regional batch files for manageable execution and review.

### Batch Structure

| Batch | Region | Countries | Sectors | Rows | File Name |
|-------|--------|-----------|---------|------|-----------|
| A | Africa — North + West | 16 | 7 | 112 | `sql-pack-v1.13a-stage2-africa-north-west.sql` |
| B | Africa — East + Central | 17 | 7 | 119 | `sql-pack-v1.13b-stage2-africa-east-central.sql` |
| C | Africa — Southern | 8 | 7 | 56 | `sql-pack-v1.13c-stage2-africa-southern.sql` |
| D | Caribbean Remaining | 13 | 7 | 91 | `sql-pack-v1.13d-stage2-caribbean.sql` |
| **Total** | | **54** | | **378** | |

**IMPORTANT:** ESH / Western Sahara is excluded from all batches to preserve the canonical 54-country Africa scope.

### Batch A: Africa — North + West (16 countries, 112 rows)

**North Africa (4):**
DZA, LBY, SDN, TUN

**West Africa (12):**
BEN, BFA, CPV, GMB, GIN, GNB, LBR, MLI, MRT, NER, SLE, TGO

### Batch B: Africa — East + Central (17 countries, 119 rows)

**East Africa (9):**
BDI, COM, DJI, ERI, MDG, MUS, SYC, SOM, SSD

**Central Africa (8):**
AGO, CAF, TCD, COG, COD, GNQ, GAB, STP

### Batch C: Africa — Southern (8 countries, 56 rows)

**Southern Africa (8):**
BWA, SWZ, LSO, MWI, MOZ, NAM, ZMB, ZWE

### Batch D: Caribbean Remaining (13 countries, 91 rows)

**Caribbean (13):**
ATG, CUB, DMA, HTI, KNA, VCT, SUR, GUY, BLZ, PRI, VGB, TCA, CYM

---

## SQL Strategy

### File Template

Each batch file must follow this structure:

```sql
-- =========================================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL PACK v1.13[x]: STAGE 2 SECTOR SEED — [REGION]
-- Owner: Afronovation, Inc.
-- Platform: Supabase Postgres
-- 
-- CURATED PREVIEW DATA
-- Phase 4A Stage 2: All-74 Sector Coverage
-- =========================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- 7-SECTOR SEED DATA — [BATCH REGION]
-- ═══════════════════════════════════════════════════════════════════════════

WITH sector_seed AS (
  SELECT * FROM (VALUES
    -- ────────────────────────────────────────────────────────────────────────
    -- COUNTRY_NAME (ISO3) — All 7 Sectors
    -- ────────────────────────────────────────────────────────────────────────
    ('ISO3', 'digital_infrastructure', 'Digital Infrastructure',
      $$Country-specific teaser (120-220 chars)$$,
      $$Country-specific rationale (350-650 chars)$$,
      strength_score, growth_score, 1, 'explorer'),
    ('ISO3', 'fintech_digital_finance', 'Fintech and Digital Finance',
      $$...$$, $$...$$, score, score, 2, 'explorer'),
    ('ISO3', 'energy_renewables', 'Energy and Renewables',
      $$...$$, $$...$$, score, score, 3, 'explorer'),
    ('ISO3', 'agriculture_agribusiness', 'Agriculture and Agribusiness',
      $$...$$, $$...$$, score, score, 4, 'explorer'),
    ('ISO3', 'mining_critical_minerals', 'Mining and Critical Minerals',
      $$...$$, $$...$$, score, score, 5, 'explorer'),
    ('ISO3', 'logistics_trade', 'Logistics and Trade',
      $$...$$, $$...$$, score, score, 6, 'explorer'),
    ('ISO3', 'tourism_hospitality', 'Tourism and Hospitality',
      $$...$$, $$...$$, score, score, 7, 'explorer'),

    -- Repeat for all countries in batch...

  ) AS v(iso3, sector_key, sector_label, teaser_md, rationale_md, strength_score, growth_score, display_order, min_plan_id)
)
INSERT INTO public.souvera_country_sectors (
  country_id, sector_key, sector_label, teaser_md, rationale_md, 
  strength_score, growth_score, display_order, min_plan_id
)
SELECT 
  c.id AS country_id,
  s.sector_key,
  s.sector_label,
  s.teaser_md,
  s.rationale_md,
  s.strength_score,
  s.growth_score,
  s.display_order,
  s.min_plan_id
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

### SQL Requirements

| Requirement | Standard |
|-------------|----------|
| Platform | Supabase-compatible PostgreSQL |
| String escaping | Dollar-quoted (`$$...$$`) for teaser_md and rationale_md |
| CTE pattern | `WITH sector_seed AS (VALUES ...)` attached to INSERT |
| Idempotency | `ON CONFLICT (country_id, sector_key) DO UPDATE` |
| Meta-commands | None (no `\echo`, `\timing`, etc.) |
| min_plan_id | `'explorer'` for all rows |
| display_order | 1 (Digital Infrastructure) through 7 (Tourism & Hospitality) |
| strength_score | Integer 0-100 |
| growth_score | Integer 0-100 |

---

## Content Standards

### Universal 7-Sector Taxonomy

| # | sector_key | sector_label | display_order |
|---|------------|--------------|---------------|
| 1 | `digital_infrastructure` | Digital Infrastructure | 1 |
| 2 | `fintech_digital_finance` | Fintech and Digital Finance | 2 |
| 3 | `energy_renewables` | Energy and Renewables | 3 |
| 4 | `agriculture_agribusiness` | Agriculture and Agribusiness | 4 |
| 5 | `mining_critical_minerals` | Mining and Critical Minerals | 5 |
| 6 | `logistics_trade` | Logistics and Trade | 6 |
| 7 | `tourism_hospitality` | Tourism and Hospitality | 7 |

### Teaser Standards (teaser_md)

- **Length:** 120–220 characters
- **Tone:** Executive-grade, institutional
- **Structure:** Single sentence summarizing sector positioning
- **Country-specificity:** Reference country name or unique context
- **Prohibited:** Unsupported statistics, "real-time", "live data"

**Example:**
> Kenya's digital infrastructure is anchored by advanced broadband networks, submarine cable connectivity, data center maturity, and comprehensive e-government platforms.

### Rationale Standards (rationale_md)

- **Length:** 350–650 characters
- **Tone:** Investment-grade intelligence prose
- **Structure:** 3-4 sentences covering:
  1. Current state and key assets
  2. Strategic positioning or competitive advantage
  3. Opportunity or investment relevance
- **Country-specificity:** Reference specific infrastructure, programs, or geographic advantages
- **Prohibited:** Unsupported precise statistics, consumer language, promotional tone

**Example:**
> Kenya is a recognized digital infrastructure leader in Africa, supported by mature fiber backbone networks, submarine cable access, growing data center capacity in Nairobi, and advanced mobile money infrastructure. E-government services are well-developed, digital identity systems are deployed, and cloud adoption is increasing across sectors. The sector is positioned for AI infrastructure, sovereign data centers, and regional digital hub expansion.

### Sector-Specific Content Themes

**Digital Infrastructure:**
- Broadband/fiber backbone
- Data center capacity
- Submarine cable connectivity
- E-government platforms
- Digital identity systems
- Cloud readiness
- AI infrastructure readiness
- Cybersecurity posture

**Fintech and Digital Finance:**
- Mobile money penetration
- Banking infrastructure
- Payment systems
- Regulatory frameworks
- Startup ecosystem
- Regional fintech hub positioning

**Energy and Renewables:**
- Power generation capacity
- Grid infrastructure
- Renewable energy potential (solar, wind, hydro)
- Energy access rates
- Investment frameworks

**Agriculture and Agribusiness:**
- Arable land and water resources
- Export commodities
- Agri-tech adoption
- Value chain infrastructure
- Food security positioning

**Mining and Critical Minerals:**
- Mineral reserves
- Mining sector maturity
- Regulatory environment
- Critical minerals (lithium, cobalt, rare earths)
- Beneficiation capacity

**Logistics and Trade:**
- Port infrastructure
- Road/rail connectivity
- Regional trade corridors
- Free trade zone participation
- Customs modernization

**Tourism and Hospitality:**
- Visitor economy scale
- Destination assets (wildlife, heritage, coastal)
- Aviation connectivity
- Hotel/hospitality capacity
- Diaspora travel
- Events/sports tourism

### Score Guidelines

| Score Range | Interpretation |
|-------------|----------------|
| 85-100 | Continental leader, mature infrastructure |
| 70-84 | Strong position, established assets |
| 55-69 | Developing, emerging opportunity |
| 40-54 | Early stage, foundational work underway |
| 25-39 | Limited, significant challenges |
| 0-24 | Minimal, not applicable |

**Note:** Scores should be conservative and defensible. When in doubt, use lower scores.

---

## UX Behavior (Preserved)

### Professional+ Users

- See top 5 sectors by default (display_order 1-5)
- "+2 more sectors" card appears after sector 5
- Clicking reveals all 7 sectors
- One-at-a-time accordion expansion for rationale
- CTA remains stable (no layout shift)
- Panel does not auto-stretch

### Explorer Users

- See 1 sector teaser only (Digital Infrastructure, display_order 1)
- No rationale visible
- "+6 more sectors with Professional access" indicator
- CTA visible for upgrade

### No-Data Markets (Post-Stage 2: Should be none)

- Professional+: "Sectors data pending" if no sector rows exist
- Explorer: Sector section hidden

---

## Verification Strategy

### Verification SQL Files

Create: `infra/supabase/verification/phase-4a-stage-2-all-74-verification.sql`

### Required Verification Checks

| Check | Query | Expected |
|-------|-------|----------|
| 1 | Total sector rows | 518 |
| 2 | Total countries with sectors | 74 |
| 3 | Every country has exactly 7 sectors | 74 countries × 7 = 518 |
| 4 | digital_infrastructure rows | 74 |
| 5 | fintech_digital_finance rows | 74 |
| 6 | energy_renewables rows | 74 |
| 7 | agriculture_agribusiness rows | 74 |
| 8 | mining_critical_minerals rows | 74 |
| 9 | logistics_trade rows | 74 |
| 10 | tourism_hospitality rows | 74 |
| 11 | No duplicate sector keys per country | 0 duplicates |
| 12 | All min_plan_id = 'explorer' | 518 rows |
| 13 | display_order values 1-7 only | 518 rows |
| 14 | teaser_md NOT NULL and NOT empty | 518 rows |
| 15 | rationale_md NOT NULL and NOT empty | 518 rows |
| 16 | Missing market report | 0 countries missing |
| 17 | Partial coverage report | 0 countries with <7 sectors |
| 18 | Africa country count | 54 (excluding ESH) |
| 19 | Caribbean country count | 20 |
| 20 | ESH / Western Sahara has NO sector rows | 0 rows |

### Verification SQL Template

```sql
-- CHECK 1: Total sector rows = 518
SELECT 
  'Total Sector Rows' AS check_name,
  COUNT(*) AS actual,
  518 AS expected,
  CASE WHEN COUNT(*) = 518 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_country_sectors;

-- CHECK 2: Total countries with sectors = 74
SELECT 
  'Countries with Sectors' AS check_name,
  COUNT(DISTINCT country_id) AS actual,
  74 AS expected,
  CASE WHEN COUNT(DISTINCT country_id) = 74 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_country_sectors;

-- CHECK 3: Every country has exactly 7 sectors
SELECT 
  'Countries with 7 Sectors' AS check_name,
  COUNT(*) AS actual,
  74 AS expected,
  CASE WHEN COUNT(*) = 74 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM (
  SELECT country_id, COUNT(*) AS sector_count
  FROM public.souvera_country_sectors
  GROUP BY country_id
  HAVING COUNT(*) = 7
) AS complete_countries;

-- CHECK 4-10: Each sector key has 74 rows
SELECT 
  sector_key,
  COUNT(*) AS row_count,
  74 AS expected,
  CASE WHEN COUNT(*) = 74 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_country_sectors
GROUP BY sector_key
ORDER BY MIN(display_order);

-- CHECK 11: No duplicate sector keys per country
SELECT 
  'No Duplicates' AS check_name,
  COUNT(*) AS duplicates_found,
  0 AS expected,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM (
  SELECT country_id, sector_key, COUNT(*) AS cnt
  FROM public.souvera_country_sectors
  GROUP BY country_id, sector_key
  HAVING COUNT(*) > 1
) AS duplicates;

-- CHECK 12: All min_plan_id = 'explorer'
SELECT 
  'min_plan_id = explorer' AS check_name,
  COUNT(*) AS actual,
  518 AS expected,
  CASE WHEN COUNT(*) = 518 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_country_sectors
WHERE min_plan_id = 'explorer';

-- CHECK 13: display_order values 1-7 only
SELECT 
  'display_order 1-7' AS check_name,
  COUNT(*) AS actual,
  518 AS expected,
  CASE WHEN COUNT(*) = 518 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_country_sectors
WHERE display_order BETWEEN 1 AND 7;

-- CHECK 14-15: teaser_md and rationale_md completeness
SELECT 
  'Content Completeness' AS check_name,
  COUNT(*) AS actual,
  518 AS expected,
  CASE WHEN COUNT(*) = 518 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_country_sectors
WHERE teaser_md IS NOT NULL 
  AND teaser_md != ''
  AND rationale_md IS NOT NULL 
  AND rationale_md != '';

-- CHECK 16: Missing market report
SELECT 
  c.iso3,
  c.name AS country_name,
  'MISSING ALL SECTORS' AS issue
FROM public.souvera_countries c
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE scs.id IS NULL
  AND c.is_active = true;

-- CHECK 17: Partial coverage report
SELECT 
  c.iso3,
  c.name AS country_name,
  COUNT(scs.id) AS sector_count,
  'PARTIAL COVERAGE' AS issue
FROM public.souvera_countries c
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.is_active = true
GROUP BY c.iso3, c.name
HAVING COUNT(scs.id) < 7
ORDER BY sector_count, c.iso3;

-- CHECK 18: Africa country count = 54 (excluding ESH)
SELECT 
  'Africa Countries with Sectors' AS check_name,
  COUNT(DISTINCT c.id) AS actual,
  54 AS expected,
  CASE WHEN COUNT(DISTINCT c.id) = 54 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_countries c
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.is_african_country = true
  AND c.is_active = true;

-- CHECK 19: Caribbean country count = 20
SELECT 
  'Caribbean Countries with Sectors' AS check_name,
  COUNT(DISTINCT c.id) AS actual,
  20 AS expected,
  CASE WHEN COUNT(DISTINCT c.id) = 20 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_countries c
JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.is_african_country = false
  AND c.is_active = true;

-- CHECK 20: ESH / Western Sahara has NO sector rows
SELECT 
  'ESH Exclusion Check' AS check_name,
  COUNT(scs.id) AS esh_sector_rows,
  0 AS expected,
  CASE WHEN COUNT(scs.id) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM public.souvera_countries c
LEFT JOIN public.souvera_country_sectors scs ON scs.country_id = c.id
WHERE c.iso3 = 'ESH';
```

---

## Browser QA Plan

### QA Sample Size: 23 Countries

| Category | Count | Sample Countries |
|----------|-------|------------------|
| Priority countries (already covered) | 5 | NGA, KEN, JAM, ZAF, GHA |
| Newly covered African (large economies) | 5 | DZA, AGO, TUN, MOZ, ZMB |
| Newly covered African (smaller markets) | 5 | BEN, GMB, SYC, LSO, STP |
| Newly covered Caribbean | 5 | CUB, HTI, SUR, BLZ, CYM |
| Island nations | 3 | MUS, COM, VGB |
| **Total** | **23** | |

### QA Test Cases

**For each sample country:**

1. **Professional+ Account:**
   - [ ] Digital Infrastructure appears first (display_order: 1)
   - [ ] Top 5 sectors visible by default
   - [ ] "+2 more sectors" card visible
   - [ ] Clicking reveals all 7 sectors
   - [ ] Tourism & Hospitality accessible (display_order: 7)
   - [ ] Accordion expansion works
   - [ ] Only one rationale expands at a time
   - [ ] CTA remains stable
   - [ ] No layout overflow
   - [ ] Content is country-specific (not generic)

2. **Explorer Account:**
   - [ ] 1 sector teaser only (Digital Infrastructure)
   - [ ] No rationale visible
   - [ ] "+6 more sectors with Professional access" visible
   - [ ] CTA visible

### QA Routes

```
# Priority Countries (verification only)
/intelligence/map?region=africa&selected=NGA
/intelligence/map?region=africa&selected=KEN
/intelligence/map?region=africa&selected=ZAF
/intelligence/map?region=africa&selected=GHA
/intelligence/map?region=caribbean&selected=JAM

# Newly Covered Africa (large)
/intelligence/map?region=africa&selected=DZA
/intelligence/map?region=africa&selected=AGO
/intelligence/map?region=africa&selected=TUN
/intelligence/map?region=africa&selected=MOZ
/intelligence/map?region=africa&selected=ZMB

# Newly Covered Africa (smaller)
/intelligence/map?region=africa&selected=BEN
/intelligence/map?region=africa&selected=GMB
/intelligence/map?region=africa&selected=SYC
/intelligence/map?region=africa&selected=LSO
/intelligence/map?region=africa&selected=STP

# Newly Covered Caribbean
/intelligence/map?region=caribbean&selected=CUB
/intelligence/map?region=caribbean&selected=HTI
/intelligence/map?region=caribbean&selected=SUR
/intelligence/map?region=caribbean&selected=BLZ
/intelligence/map?region=caribbean&selected=CYM

# Island Nations
/intelligence/map?region=africa&selected=MUS
/intelligence/map?region=africa&selected=COM
/intelligence/map?region=caribbean&selected=VGB
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SQL syntax errors in batch files | Medium | Medium | Review each batch independently; test in staging |
| Generic/low-quality content | Medium | High | Content review checklist; country-specific validation |
| CTE scope errors | Low | Medium | Follow Stage 1 SQL structure exactly |
| Missing countries in seed data | Low | High | Cross-check against `souvera_countries` table |
| Performance issues with 518 rows | Low | Low | Batch execution; monitoring |
| Content duplication across countries | Medium | Medium | Use unique country context in each entry |
| Incorrect display_order | Low | Medium | Verification SQL check; consistent template |

### Content Quality Risk

For smaller or less-documented markets (e.g., São Tomé and Príncipe, Comoros, Seychelles), content may be:
- More generic due to limited public information
- Lower strength/growth scores due to limited infrastructure
- Shorter rationale due to fewer known initiatives

**Mitigation:** Use conservative language ("emerging", "developing", "foundational") and lower scores for less-documented markets. Flag these in QA for additional review.

---

## Acceptance Criteria

### SQL Execution

- [ ] All 4 batch files execute without error
- [ ] No CTE scope errors
- [ ] No string escaping errors
- [ ] Idempotent (safe to rerun)

### Data Integrity

- [ ] Total rows = 518
- [ ] All 74 countries have exactly 7 sectors
- [ ] No duplicate sector keys per country
- [ ] All 7 sector keys have 74 rows each
- [ ] All min_plan_id = 'explorer'
- [ ] All display_order values 1-7
- [ ] All teaser_md and rationale_md populated

### UX Verification

- [ ] Professional+ sees 5 + "+2 more" for all 74 countries
- [ ] Explorer sees 1 teaser for all 74 countries
- [ ] No "Sectors data pending" for any country
- [ ] No layout overflow or CTA instability

### Content Quality

- [ ] All teaser_md 120-220 characters
- [ ] All rationale_md 350-650 characters
- [ ] Country-specific content (not generic copy-paste)
- [ ] No prohibited language ("real-time", "live data")
- [ ] No unsupported statistics

---

## Implementation Sequence

### Phase 1: Preparation

1. [ ] Confirm 54 remaining countries list against `souvera_countries` table
2. [ ] Verify no partial sector data exists for remaining countries
3. [ ] Create batch file templates

### Phase 2: Content Generation

4. [ ] Generate Batch A content (North + West Africa, 16 countries, excluding ESH)
5. [ ] Generate Batch B content (East + Central Africa, 17 countries)
6. [ ] Generate Batch C content (Southern Africa, 8 countries)
7. [ ] Generate Batch D content (Caribbean, 13 countries)
8. [ ] Content review and quality check

### Phase 3: SQL Execution

9. [ ] Execute Batch A: `sql-pack-v1.13a-stage2-africa-north-west.sql`
10. [ ] Verify Batch A (112 new rows)
11. [ ] Execute Batch B: `sql-pack-v1.13b-stage2-africa-east-central.sql`
12. [ ] Verify Batch B (119 new rows)
13. [ ] Execute Batch C: `sql-pack-v1.13c-stage2-africa-southern.sql`
14. [ ] Verify Batch C (56 new rows)
15. [ ] Execute Batch D: `sql-pack-v1.13d-stage2-caribbean.sql`
16. [ ] Verify Batch D (91 new rows)

### Phase 4: Verification

17. [ ] Run full verification SQL
18. [ ] Confirm 518 total rows
19. [ ] Confirm 74 countries × 7 sectors

### Phase 5: Browser QA

20. [ ] QA 5 priority countries (regression)
21. [ ] QA 10 newly covered African countries
22. [ ] QA 5 newly covered Caribbean markets
23. [ ] QA 3 island nations
24. [ ] Document QA results

### Phase 6: Documentation

25. [ ] Update Stage 2 completion summary
26. [ ] Update Phase 4A master documentation
27. [ ] Archive batch SQL files

---

## Files to Create

### SQL Seed Files

| File | Location | Rows |
|------|----------|------|
| `sql-pack-v1.13a-stage2-africa-north-west.sql` | `infra/supabase/` | 112 |
| `sql-pack-v1.13b-stage2-africa-east-central.sql` | `infra/supabase/` | 119 |
| `sql-pack-v1.13c-stage2-africa-southern.sql` | `infra/supabase/` | 56 |
| `sql-pack-v1.13d-stage2-caribbean.sql` | `infra/supabase/` | 91 |

### Verification Files

| File | Location |
|------|----------|
| `phase-4a-stage-2-all-74-verification.sql` | `infra/supabase/verification/` |

### Documentation Files

| File | Location |
|------|----------|
| `phase-4a-stage-2-all-74-sector-coverage-plan.md` | `docs/execution/` (this file) |
| `phase-4a-stage-2-implementation-guide.md` | `docs/qa/` |
| `phase-4a-stage-2-browser-qa-report.md` | `docs/qa/` |
| `phase-4a-stage-2-completion-summary.md` | `docs/qa/` |

---

## Recommendation

### Stage 2 Readiness Assessment

| Criterion | Status |
|-----------|--------|
| Stage 1 complete | ✅ Yes |
| API sector limit fixed | ✅ Yes |
| 7-sector UX verified | ✅ Yes |
| Batch strategy defined | ✅ Yes |
| Content standards defined | ✅ Yes |
| Verification plan ready | ✅ Yes |
| QA plan ready | ✅ Yes |

### Recommendation

**✅ READY TO IMPLEMENT**

Stage 2 implementation can begin. The batch strategy, content standards, and verification approach are well-defined. The API sector limit fix ensures Professional+ users will see all 7 sectors across all 74 markets.

**Suggested execution order:**
1. Batch B (Africa East + Central) — largest batch (17 countries, 119 rows), establishes content pattern
2. Batch A (Africa North + West) — second largest (16 countries, 112 rows), excludes ESH
3. Batch D (Caribbean) — medium batch (13 countries, 91 rows), validates cross-region approach
4. Batch C (Africa Southern) — smallest batch (8 countries, 56 rows), completes coverage

**Estimated effort:**
- Content generation: 4-6 hours (54 countries × 7 sectors × ~100 words each)
- SQL file creation: 2-3 hours
- Execution and verification: 1-2 hours
- Browser QA: 2-3 hours
- Documentation: 1-2 hours

---

## Summary

| Metric | Value |
|--------|-------|
| Current coverage | 20 countries, 140 rows |
| Target coverage | 74 countries, 518 rows (54 Africa + 20 Caribbean, excluding ESH) |
| New rows required | 378 |
| Batch files | 4 |
| Verification checks | 20 |
| QA sample size | 23 countries |

**Phase 4A Stage 2 is ready for implementation.**

**ESH Exclusion:** Western Sahara (ESH) is explicitly excluded from Stage 2 to preserve the canonical 54-country Africa market scope.

---

**END OF PHASE 4A STAGE 2 PLAN**
