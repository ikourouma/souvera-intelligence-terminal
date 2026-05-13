# Phase 4A — Sector Taxonomy Expansion Plan: AMENDMENT

**Status:** ✅ Stage 1 COMPLETE — Stage 2 Planning  
**Date:** 2026-05-05 (Original), 2026-05-05 (Amended)  
**Execution Date:** 2026-05-05  
**Owner:** Afronovation, Inc.  
**Amendment:** Add Digital Infrastructure as 7th Core Sector

---

## Amendment Summary

This amendment adds **Digital Infrastructure** as the 1st (primary) core sector alongside Tourism & Hospitality, expanding from 6 sectors to **7 sectors**.

**Strategic Rationale for Digital Infrastructure:**
- Primary Afronovation-aligned vertical
- Enabling layer for sovereign digital transformation
- Covers e-government, cloud/data infrastructure, digital ID, payments interoperability, cybersecurity, AI readiness, institutional modernization
- Essential foundation for all other economic sectors

**Stage 1 Status:** ✅ COMPLETE
- SQL execution: 40 rows added (Digital Infrastructure + Tourism & Hospitality)
- Verification: All checks passed
- Database: 140 sector rows confirmed (20 countries × 7 sectors)

---

## Updated Sector Taxonomy (7 Sectors)

**Complete Universal Sector Model:**
1. **`digital_infrastructure`** — **Digital Infrastructure** (display_order: 1) ← NEW
2. `fintech` — Fintech and Digital Finance (display_order: 2, was 1)
3. `energy` — Energy and Renewables (display_order: 3, was 2)
4. `agriculture` — Agriculture and Agribusiness (display_order: 4, was 3)
5. `mining` — Mining and Critical Minerals (display_order: 5, was 4)
6. `logistics` — Logistics and Trade (display_order: 6, was 5)
7. `tourism_hospitality` — Tourism and Hospitality (display_order: 7, was 6)

**All sectors:**
- `min_plan_id = 'explorer'` (visible to all users with teaser)
- Include `teaser_md` and `rationale_md`
- Use `strength_score` and `growth_score` (0-100)
- Are country-specific, not generic

---

## Updated Icon Mapping

| Sector | Icon | Color | Display Order |
|--------|------|-------|---------------|
| **Digital Infrastructure** | **`Server` or `Cloud`** | **Indigo (`text-indigo-400`)** | **1** |
| Fintech / Digital Finance | `Landmark` | Blue (`text-blue-400`) | 2 |
| Energy / Renewables | `Zap` | Amber (`text-amber-400`) | 3 |
| Agriculture / Agribusiness | `Leaf` | Emerald (`text-emerald-400`) | 4 |
| Mining / Minerals | `Gem` | Purple (`text-purple-400`) | 5 |
| Logistics / Trade | `Truck` | Cyan (`text-cyan-400`) | 6 |
| Tourism / Hospitality | `Plane` | Teal (`text-teal-400`) | 7 |

**Recommendation for Digital Infrastructure Icon:**
- Icon: `Server` (represents infrastructure, data centers, cloud)
- Color: Indigo (`text-indigo-400`) - distinct from all other colors, conveys technology/digital
- Alternative: `Cloud` icon if Server feels too technical

---

## Updated Row Counts

### Stage 1: Digital Infrastructure + Tourism for Priority 20

**Status:** ✅ COMPLETE

**Before Amendment:** 120 rows (20 × 6 sectors)  
**After Amendment:** **140 rows** (20 countries × 7 sectors)

**New Sectors Added:** 2 per country
- Digital Infrastructure (display_order: 1)
- Tourism & Hospitality (display_order: 7)

**Total New Rows:** 40 (20 countries × 2 new sectors)

**Execution Results:**
- SQL Seed: `sql-pack-v1.12a-add-digital-tourism-priority-20.sql` — ✅ Executed
- Verification: All 11 checks passed — ✅ Verified
- Database State: 140 sector rows across 20 priority countries — ✅ Confirmed
- UI Implementation: Sector accordion, icons, sector pages — ✅ Complete
- Documentation: Implementation and verification guides — ✅ Complete

**Priority 20 Countries:**
- Africa (13): NGA, ZAF, KEN, EGY, GHA, CIV, ETH, MAR, TZA, UGA, RWA, SEN, CMR
- Caribbean (7): JAM, TTO, BRB, DOM, BHS, GRD, LCA

---

### Stage 2: All 7 Sectors for All 74 Markets

**Before Amendment:** 444 rows (74 × 6 sectors)  
**After Amendment:** **518 rows** (74 countries × 7 sectors)

**Existing Rows:** 100 (Priority 20 × 5 existing sectors)  
**New Rows:** 418 (74 × 7 = 518, minus existing 100)

---

## Updated UX Behavior for 7 Sectors

### Problem Statement (Amended)

**Current Achievement (Phase 4A):**
- Professional+ users see 5 collapsed sector cards
- All 5 cards fit within the panel viewport without scrolling
- Collapsed card height: ~58px
- Total collapsed height for 5 sectors: ~290px

**New Constraint with 7 Sectors:**
- Adding 7 sectors at 58px height = ~406px total
- Panel viewport cannot accommodate 7 collapsed sectors without scrolling
- This breaks the "all collapsed sectors fit" discipline

**Question:**
How should Professional+ users access 7 sectors while preserving panel discipline?

---

### UX Recommendation: Top 5 by Score + "+2 More Sectors"

**Behavior:**
1. By default, show the **top 5 sectors** ranked by `(strength_score + growth_score) / 2`
2. If 6th and 7th sectors exist, show a compact **"+2 more sectors"** card at the bottom
3. Clicking "+2 more sectors" expands to show all 7 sectors (panel becomes scrollable)
4. All 7 sectors remain accessible but only 5 are visible at once in collapsed state

**Visual Design:**
```
┌─────────────────────────────────────┐
│ [Icon] Digital Infrastructure       │ Score: 88
├─────────────────────────────────────┤
│ [Icon] Fintech and Digital Finance  │ Score: 87
├─────────────────────────────────────┤
│ [Icon] Energy and Renewables        │ Score: 85
├─────────────────────────────────────┤
│ [Icon] Mining and Critical Minerals │ Score: 82
├─────────────────────────────────────┤
│ [Icon] Agriculture and Agribusiness │ Score: 78
├─────────────────────────────────────┤
│ 🔓 +2 more sectors with Professional│ ← Clickable
└─────────────────────────────────────┘
```

**After Clicking "+2 more sectors":**
- All 7 sectors become visible
- Panel becomes scrollable
- "+2 more sectors" card changes to "Show top 5 sectors" (collapse control)

**Pros:**
- ✅ Preserves "all visible sectors fit without scrolling" discipline in default state
- ✅ Data-driven (score-based ranking)
- ✅ Fortune-5 quality (information hierarchy)
- ✅ Maintains compact panel design by default
- ✅ All 7 sectors remain accessible
- ✅ Existing accordion expansion behavior preserved

**Explorer/Public Behavior (Unchanged):**
- Still see only 1 sector teaser (highest-ranked by score)
- No "+2 more sectors" indicator

---

## Digital Infrastructure Sector Definition

### Sector Key and Metadata

**sector_key:** `digital_infrastructure`  
**sector_label:** `Digital Infrastructure`  
**display_order:** `1`  
**min_plan_id:** `'explorer'`

### Strategic Rationale

Digital Infrastructure is the foundational enabler for sovereign economic development across African and Caribbean markets. It encompasses:

**Core Components:**
- Broadband and fiber backbone connectivity
- Cloud and data center readiness
- Digital public infrastructure (DPI)
- Digital identity and trust services
- Payments interoperability and fintech rails
- E-government and institutional digital transformation
- Cybersecurity and sovereign data protection
- AI readiness and computational infrastructure
- Sovereign data infrastructure
- Institutional modernization platforms

**Afronovation Strategic Alignment:**
- **Primary vertical** for Afronovation's mandate
- Enables Bridge55 (diaspora connectivity requires digital infrastructure)
- Enables AfCON Hub (events platforms require cloud/digital capacity)
- Enables tourism board SaaS (destination platforms require digital infrastructure)
- Underpins all other sector opportunities (fintech, e-commerce, logistics, agriculture tech)

**Why Display Order 1:**
Digital Infrastructure is not just a sector—it is the **enabling foundation** for all other economic sectors. It should appear first in the sector list to reinforce its strategic priority.

---

## Content Standards for Digital Infrastructure

### Copy Style

**Tone:** Sovereign-grade, institutional, government/institutional investor-facing

**Target Audience:**
- National digital transformation agencies
- Ministry of ICT/Communications
- Sovereign wealth and infrastructure investors
- Cloud and data center developers
- Government CIOs and digital transformation officers
- Multilateral development banks (World Bank, AfDB, IDB)
- Telecommunications regulators

**Preferred Language:**
- "digital public infrastructure"
- "sovereign data infrastructure"
- "broadband backbone"
- "cloud readiness"
- "digital identity systems"
- "payments interoperability"
- "e-government modernization"
- "cybersecurity sovereignty"
- "AI infrastructure readiness"
- "institutional digital transformation"
- "digital trust frameworks"

**Avoid:**
- "smart cities" (too vague)
- "blockchain revolution" (overhyped)
- "5G for everyone" (aspirational without context)
- consumer tech language

### Structural Requirements

**teaser_md:**
- Length: 1-2 short sentences, 120-220 characters
- Purpose: High-level sector relevance for Explorer/Public preview
- Style: Conservative, country-specific, infrastructure-focused

**rationale_md:**
- Length: 2-4 concise sentences, 350-650 characters
- Purpose: Deeper sector analysis for Professional+ users
- Style: Executive-grade, sourced claims or conservative positioning language
- Emphasis: Sovereign digital capacity, institutional readiness, infrastructure investment

**Scores:**
- `strength_score`: 0-100 (current digital infrastructure maturity, broadband penetration, cloud presence, e-government adoption)
- `growth_score`: 0-100 (digital infrastructure investment momentum, fiber expansion, data center construction, digital ID rollouts)

---

### Content Examples

#### Example 1: Nigeria (Africa, Emerging Digital Leader)

**teaser_md:**
```
Nigeria's digital infrastructure is supported by expanding broadband penetration, cloud investment, growing data center capacity, and institutional digital transformation initiatives.
```
(~165 characters)

**rationale_md:**
```
Nigeria is positioning as a West African digital hub through fiber backbone expansion, cloud service provider entry, data center construction in Lagos and Abuja, and government digital transformation programs. Broadband penetration is increasing, fintech infrastructure is mature, and digital identity initiatives are advancing. The sector represents strategic opportunity for sovereign data infrastructure, e-government, and AI readiness investments.
```
(~440 characters)

**Scores:**
- strength_score: 72
- growth_score: 80

---

#### Example 2: Jamaica (Caribbean, Regional Digital Gateway)

**teaser_md:**
```
Jamaica's digital infrastructure combines strong regional connectivity, cloud readiness, e-government modernization, and positioning as a Caribbean digital services hub.
```
(~165 characters)

**rationale_md:**
```
Jamaica benefits from submarine cable connectivity to North America and the Caribbean, established data center presence, and government digital transformation initiatives. The island serves as a regional digital gateway with growing cloud services capacity, maturing cybersecurity frameworks, and institutional readiness for digital public infrastructure deployment. The sector is strategic for e-government, digital identity, and regional fintech connectivity.
```
(~470 characters)

**Scores:**
- strength_score: 76
- growth_score: 74

---

#### Example 3: Kenya (Africa, Digital Infrastructure Leader)

**teaser_md:**
```
Kenya's digital infrastructure is anchored by advanced broadband networks, submarine cable connectivity, data center maturity, and comprehensive e-government platforms.
```
(~165 characters)

**rationale_md:**
```
Kenya is a recognized digital infrastructure leader in Africa, supported by mature fiber backbone networks, submarine cable access, growing data center capacity in Nairobi, and advanced mobile money infrastructure. E-government services are well-developed, digital identity systems are deployed, and cloud adoption is increasing across public and private sectors. The sector is positioned for AI infrastructure, sovereign data centers, and regional digital hub expansion.
```
(~475 characters)

**Scores:**
- strength_score: 85
- growth_score: 82

---

### Regional Tailoring

**Africa Markets:**
Emphasize:
- Fiber backbone expansion (national and regional)
- Submarine cable connectivity
- Data center construction (Lagos, Nairobi, Johannesburg, Cairo hubs)
- Mobile money infrastructure (foundational digital layer)
- E-government platforms (GovTech, digital services)
- Digital identity systems (national ID, biometric systems)
- Regional connectivity (cross-border fiber, internet exchange points)
- Smart city initiatives (where applicable, e.g., Kigali, Accra)

**Caribbean Markets:**
Emphasize:
- Submarine cable connectivity (US, Europe, Latin America)
- Hurricane-resilient infrastructure
- Regional digital gateway positioning
- Cloud and data sovereignty
- E-government modernization
- Digital identity and trust frameworks
- Fintech infrastructure (regional payments interoperability)
- Tourism tech infrastructure (destination platforms, digital services for visitors)

---

### Data Claim Caution

**Digital Infrastructure Statistics:**
If adding broadband penetration, fiber deployment, or data center capacity claims, they must be:
1. Source-verified (e.g., ITU, World Bank, national regulators)
2. Documented in methodology or source registry
3. Conservative in phrasing if not precisely sourced

**Example (Conservative):**
> "Digital infrastructure investment is accelerating across African and Caribbean markets, with broadband expansion, data center construction, and e-government modernization representing key areas of sovereign infrastructure development."

**Example (Precise, Requires Source):**
> "Nigeria's broadband penetration reached 45% in 2025, with fiber backbone expansion targeting 70% coverage by 2028 according to the Nigerian Communications Commission."

**For this implementation:**
- Use conservative positioning language
- Add precise statistics later after source verification
- Do not hard-code specific penetration rates or fiber km unless documented

---

## Track C: Digital Infrastructure + Tourism Sector Pages

### Overview

**Track C now covers 2 sector pages:**
1. Digital Infrastructure (`/sectors/digital-infrastructure`)
2. Tourism & Hospitality (`/sectors/tourism-hospitality`)

Both must be built and integrated into the mega menu.

---

### Digital Infrastructure Sector Page Structure

**Route:** `/sectors/digital-infrastructure`

**File:** `apps/api-gateway/src/app/sectors/digital-infrastructure/page.tsx`

---

#### A. Hero

**Title:** Digital Infrastructure Intelligence

**Subtitle:**
> Sovereign-grade intelligence on broadband, cloud, digital public infrastructure, AI readiness, cybersecurity, payments, and institutional digital transformation across African and Caribbean markets.

**Primary CTA:** Explore Digital Infrastructure Signals (routes to `/intelligence/map`)

**Secondary CTA:** Request Sector Briefing (routes to `/access/request-access?sector=digital-infrastructure`)

---

#### B. Sector Overview

**Heading:** Digital Infrastructure as the Foundation for Sovereign Economic Development

**Content (2-3 paragraphs):**
> Digital infrastructure represents the foundational enabling layer for sovereign economic development across African and Caribbean markets. From broadband backbone networks and submarine cable connectivity to cloud data centers, digital public infrastructure, and e-government platforms, digital infrastructure underpins every sector of the modern economy—from fintech and agriculture tech to logistics, tourism platforms, and institutional modernization.
>
> Souvera tracks digital infrastructure as the **first-priority intelligence vertical**, analyzing broadband penetration, fiber deployment, data center investment, cloud readiness, digital identity system rollouts, payments interoperability, cybersecurity frameworks, AI infrastructure readiness, and government digital transformation programs across 74 African and Caribbean markets. This sector is strategically aligned with Afronovation's mandate to accelerate sovereign digital transformation and enable diaspora connectivity, events platforms, and destination intelligence systems.
>
> Digital infrastructure intelligence is essential for national ICT agencies, digital transformation ministries, infrastructure investors, cloud providers, telecommunications developers, government CIOs, and multilateral development banks seeking to understand sovereign digital capacity, institutional readiness, and strategic investment opportunities in broadband, data centers, digital public infrastructure, and AI readiness.

---

#### C. Intelligence Signals

**Heading:** Digital Infrastructure Intelligence Signals

**Signal Categories (6-8 cards):**

1. **Broadband and Fiber Backbone**
   - National fiber deployment
   - Submarine cable connectivity
   - Broadband penetration rates
   - Last-mile connectivity

2. **Cloud and Data Center Readiness**
   - Data center capacity and investment
   - Cloud service provider presence
   - Sovereign data center development
   - Edge computing infrastructure

3. **Digital Public Infrastructure (DPI)**
   - Digital identity systems
   - Digital payments infrastructure
   - Open API platforms
   - Institutional data exchange

4. **E-Government Modernization**
   - GovTech platforms and digital services
   - Institutional digital transformation
   - Public service digitization
   - Smart governance initiatives

5. **Payments Interoperability**
   - National payment switches
   - Real-time payment systems
   - Cross-border payment corridors
   - Fintech infrastructure

6. **Cybersecurity and Sovereignty**
   - National cybersecurity frameworks
   - Data protection and privacy laws
   - Sovereign data storage requirements
   - Cyber threat readiness

7. **AI Infrastructure Readiness**
   - Computational capacity
   - AI policy and regulation
   - Research and development infrastructure
   - AI adoption across sectors

8. **Institutional Digital Capacity**
   - Government digital skills
   - Public-private digital partnerships
   - Digital transformation funding
   - Regulatory modernization

**Visual:** Icons for each signal category (Lucide icons: `Wifi`, `Server`, `Shield`, `Landmark`, `CreditCard`, `Lock`, `Cpu`, `Building2`)

---

#### D. Regional Lens

**Heading:** Regional Digital Infrastructure Dynamics

**Two-Column Layout:**

**Africa Digital Infrastructure:**
- Fiber backbone expansion (national and regional)
- Submarine cable connectivity (coastal access)
- Data center hubs (Lagos, Nairobi, Johannesburg, Cairo, Accra, Cape Town)
- Mobile money infrastructure (M-Pesa, mobile financial services)
- E-government platforms (Kenya, Rwanda, Ghana leaders)
- Digital identity systems (national ID, biometric registration)
- Regional internet exchange points
- Smart city initiatives (Kigali, Accra)
- Cross-border data and payment corridors

**Caribbean Digital Infrastructure:**
- Submarine cable connectivity (US, Europe, Latin America routes)
- Hurricane-resilient infrastructure
- Regional digital gateway positioning (Jamaica, Barbados, Trinidad)
- Cloud and data sovereignty
- E-government modernization
- Digital identity and trust frameworks
- Regional fintech interoperability
- Tourism tech infrastructure
- Small island digital challenges and opportunities

---

#### E. Country Intelligence Integration

**Heading:** Digital Infrastructure Intelligence in Country Profiles

**Content:**
> Digital Infrastructure appears as the **first sector card** within each country intelligence panel on the Souvera Intelligence Map, reflecting its strategic priority as the enabling foundation for all other economic sectors. Professional+ users can access detailed sector rationale, strength and growth scores, and country-specific digital infrastructure analysis covering broadband deployment, cloud readiness, digital public infrastructure, e-government maturity, and AI infrastructure readiness.

**CTA:** Explore Country Intelligence (routes to `/intelligence/map`)

---

#### F. Afronovation Ecosystem Link

**Heading:** Strategic Alignment: Digital Infrastructure as Afronovation's Core Vertical

**Content (2-3 paragraphs):**
> Digital Infrastructure is the **primary vertical** for Afronovation's mandate to accelerate sovereign economic development through technology, connectivity, and institutional-grade market intelligence. Every Afronovation product and platform—from Bridge55 diaspora connectivity to the AfCON Hub events platform to tourism board SaaS—requires robust digital infrastructure as the foundational enabling layer.
>
> Souvera's digital infrastructure intelligence supports national ICT agencies, digital transformation ministries, infrastructure investors, and government CIOs in understanding sovereign digital capacity, tracking broadband and data center investment, assessing e-government readiness, and positioning strategic opportunities in digital public infrastructure, payments interoperability, cybersecurity, and AI readiness across African and Caribbean markets.
>
> This intelligence vertical is central to Afronovation's broader mandate to modernize institutions, connect diaspora communities, enable digital commerce, and position Africa and the Caribbean as strategic participants in the global digital economy.

**CTA:** Learn About Afronovation (routes to `/about` or external afronovation.com)

---

#### G. Access CTA

**Heading:** Request Digital Infrastructure Intelligence Access

**Content:**
> Access comprehensive digital infrastructure intelligence, including country-specific digital readiness reports, broadband and fiber deployment tracking, data center investment analysis, e-government maturity assessments, and AI infrastructure opportunity briefs with Souvera Professional or Business access.

**CTA Button:** Request Digital Infrastructure Access (routes to `/access/request-access?sector=digital-infrastructure`)

---

### Digital Infrastructure SEO Metadata

**File:** `apps/api-gateway/src/app/sectors/digital-infrastructure/page.tsx`

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'Digital Infrastructure Intelligence | Souvera',
  description: 'Sovereign-grade intelligence on broadband, cloud, digital public infrastructure, AI readiness, cybersecurity, payments, and institutional digital transformation across African and Caribbean markets.',
  keywords: [
    'digital infrastructure',
    'digital public infrastructure',
    'broadband Africa',
    'cloud infrastructure',
    'data centers Africa',
    'e-government',
    'digital transformation',
    'digital identity',
    'payments infrastructure',
    'cybersecurity',
    'AI infrastructure',
    'sovereign data',
    'fiber backbone',
    'Caribbean digital',
  ],
  openGraph: {
    title: 'Digital Infrastructure Intelligence | Souvera',
    description: 'Sovereign-grade intelligence on broadband, cloud, digital public infrastructure, AI readiness, and digital transformation across African and Caribbean markets.',
    url: 'https://souveraterminal.com/sectors/digital-infrastructure',
  },
  alternates: {
    canonical: 'https://souveraterminal.com/sectors/digital-infrastructure',
  },
};
```

---

### Mega Menu Integration (Updated for 7 Sectors)

**File to Modify:** `apps/api-gateway/src/components/ui/SouveraMegaNav.tsx`

**Current Sectors Section:**
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

**Proposed Update (3 Subsections for 7 Sectors):**
```typescript
{
  name: 'Sectors',
  icon: Building2,
  sections: [
    {
      title: 'Core Infrastructure', // NEW subsection
      links: [
        { name: 'Sector Overview', href: '/sectors' },
        { name: 'Digital Infrastructure', href: '/sectors/digital-infrastructure' }, // NEW (first)
        { name: 'Fintech & Digital Finance', href: '/sectors/fintech' },
      ],
    },
    {
      title: 'Industry Sectors',
      links: [
        { name: 'Critical Minerals & Mining', href: '/sectors/critical-minerals' },
        { name: 'Energy & Renewables', href: '/sectors/energy' },
        { name: 'Agriculture & Agribusiness', href: '/sectors/agriculture' },
      ],
    },
    {
      title: 'Services & Connectivity', // NEW subsection
      links: [
        { name: 'Logistics & Trade', href: '/sectors/logistics' },
        { name: 'Tourism & Hospitality', href: '/sectors/tourism-hospitality' }, // NEW
      ],
    },
  ],
}
```

**Rationale for Structure:**
- **Core Infrastructure:** Digital Infrastructure first (primary Afronovation vertical), then Fintech (financial infrastructure)
- **Industry Sectors:** Mining, Energy, Agriculture (traditional economic sectors)
- **Services & Connectivity:** Logistics, Tourism (services economy)

---

## Updated Verification Scripts

### Stage 1 Verification (140 Rows, 7 Sectors)

**File:** `infra/supabase/verification/phase-4a-digital-tourism-priority-20-verification.sql`

**Key Queries:**
1. Total sector rows (should be 140)
2. Sector count by country (should be 7 for all 20)
3. Countries missing `digital_infrastructure` (should be 0)
4. Countries missing `tourism_hospitality` (should be 0)
5. Duplicate sector keys (should be 0)
6. Sector key distribution (should be 20 rows per sector key)
7. Display_order verification (1-7 for each country)
8. Sample Digital Infrastructure rows (NGA, ZAF, KEN, JAM, TTO)
9. Sample Tourism rows (NGA, ZAF, KEN, JAM, TTO)
10. Min_plan_id verification (all 'explorer')

**Example Query:**
```sql
-- Query 1: Total sector rows
SELECT 'Total Sector Rows (Priority 20, 7 Sectors)' AS check_name;
SELECT COUNT(*) AS total_sector_rows
FROM public.souvera_country_sectors;
-- Expected: 140

-- Query 2: Sector count by country (priority 20)
SELECT 'Sector Count by Priority Country (Should be 7)' AS check_name;
SELECT
  c.iso3,
  c.name,
  COUNT(s.id) AS sector_count
FROM public.souvera_countries c
LEFT JOIN public.souvera_country_sectors s ON s.country_id = c.id
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA')
GROUP BY c.iso3, c.name
HAVING COUNT(s.id) != 7
ORDER BY sector_count, c.name;
-- Expected: 0 rows (all countries have 7 sectors)

-- Query 3: Countries missing digital_infrastructure
SELECT 'Priority Countries Missing Digital Infrastructure' AS check_name;
SELECT c.iso3, c.name
FROM public.souvera_countries c
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA')
  AND NOT EXISTS (
    SELECT 1 FROM public.souvera_country_sectors s
    WHERE s.country_id = c.id AND s.sector_key = 'digital_infrastructure'
  )
ORDER BY c.name;
-- Expected: 0 rows

-- Query 4: Countries missing tourism_hospitality
SELECT 'Priority Countries Missing Tourism' AS check_name;
SELECT c.iso3, c.name
FROM public.souvera_countries c
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA')
  AND NOT EXISTS (
    SELECT 1 FROM public.souvera_country_sectors s
    WHERE s.country_id = c.id AND s.sector_key = 'tourism_hospitality'
  )
ORDER BY c.name;
-- Expected: 0 rows

-- Query 6: Sector key distribution (should be 20 rows per sector)
SELECT 'Sector Key Distribution (Should be 20 Each)' AS check_name;
SELECT
  sector_key,
  COUNT(*) AS row_count
FROM public.souvera_country_sectors s
JOIN public.souvera_countries c ON s.country_id = c.id
WHERE c.iso3 IN ('NGA', 'ZAF', 'KEN', 'EGY', 'GHA', 'CIV', 'ETH', 'MAR', 'TZA', 'UGA', 'RWA', 'SEN', 'CMR', 'JAM', 'TTO', 'BRB', 'DOM', 'BHS', 'GRD', 'LCA')
GROUP BY sector_key
ORDER BY sector_key;
-- Expected: 7 sectors, each with 20 rows
```

---

### Stage 2 Verification (518 Rows, 7 Sectors for All 74)

**File:** `infra/supabase/verification/phase-4a-all-sectors-all-74-verification.sql`

**Key Queries:**
1. Total sector rows (should be 518)
2. Total countries with sector data (should be 74)
3. Sector count by country (should be 7 for all 74)
4. Countries missing `digital_infrastructure` (should be 0)
5. Countries missing `tourism_hospitality` (should be 0)
6. Africa sector coverage (54 × 7 = 378 rows)
7. Caribbean sector coverage (20 × 7 = 140 rows)
8. Sector key distribution (should be 74 rows per sector key)
9. Display_order verification (1-7 for each country)
10. Sample rows for each region and each of the 7 sectors

**Example Query:**
```sql
-- Query 1: Total sector rows (all 74 markets, 7 sectors)
SELECT 'Total Sector Rows (All 74 Markets, 7 Sectors)' AS check_name;
SELECT COUNT(*) AS total_sector_rows
FROM public.souvera_country_sectors;
-- Expected: 518

-- Query 8: Sector key distribution (should be 74 rows per sector)
SELECT 'Sector Key Distribution (Should be 74 Each)' AS check_name;
SELECT
  sector_key,
  COUNT(*) AS row_count
FROM public.souvera_country_sectors
GROUP BY sector_key
ORDER BY sector_key;
-- Expected: 7 sector keys, each with 74 rows
```

---

## Updated Acceptance Criteria

### Stage 1 Acceptance (140 Rows, 7 Sectors for Priority 20)

**Data Acceptance:**
- ✅ 20 priority countries × 7 sectors = 140 rows total
- ✅ All 20 priority countries have `digital_infrastructure` sector
- ✅ All 20 priority countries have `tourism_hospitality` sector
- ✅ No duplicate (country_id, sector_key) pairs
- ✅ All rows have non-null `teaser_md` and `rationale_md`
- ✅ All rows have correct `display_order` (1-7)
- ✅ All rows have `min_plan_id = 'explorer'`
- ✅ Digital Infrastructure `display_order = 1`
- ✅ Tourism `display_order = 7`
- ✅ All `strength_score` and `growth_score` are 0-100

**UI Acceptance (Professional+):**
- ✅ Professional+ users see top 5 sectors by score (collapsed by default)
- ✅ "+2 more sectors" indicator appears if 7 sectors exist
- ✅ Clicking "+2 more sectors" reveals all 7 sectors
- ✅ Digital Infrastructure has `Server` icon in indigo color
- ✅ Tourism has `Plane` icon in teal color
- ✅ All 5 visible collapsed sectors fit without scrolling
- ✅ Expansion behavior (one-at-a-time) still works

**UI Acceptance (Explorer):**
- ✅ Explorer users see 1 sector teaser (highest-ranked by score)
- ✅ No "+2 more sectors" indicator for Explorer
- ✅ Digital Infrastructure may be the visible sector if it's highest-ranked

---

### Stage 2 Acceptance (518 Rows, 7 Sectors for All 74)

**Data Acceptance:**
- ✅ 74 countries × 7 sectors = 518 rows total
- ✅ Every country in `APPROVED_AFRICA_ISO3` (54) has 7 sectors
- ✅ Every country in `APPROVED_CARIBBEAN_ISO3` (20) has 7 sectors
- ✅ All 74 countries have `digital_infrastructure` sector
- ✅ All 74 countries have `tourism_hospitality` sector
- ✅ No duplicate (country_id, sector_key) pairs
- ✅ All rows have non-null `teaser_md` and `rationale_md`
- ✅ All rows have correct `display_order` (1-7)
- ✅ All rows have `min_plan_id = 'explorer'`

**Content Quality:**
- ✅ All sector copy is country-specific (not generic templates)
- ✅ Digital Infrastructure copy follows sovereign-grade tone
- ✅ Tourism copy follows sovereign-grade tone
- ✅ No unsupported precise statistics
- ✅ Conservative positioning language used

---

### Track C Acceptance (Digital Infrastructure + Tourism Pages)

**Navigation Acceptance:**
- ✅ "Digital Infrastructure" appears in Sectors mega menu (Core Infrastructure subsection, first)
- ✅ "Tourism & Hospitality" appears in Sectors mega menu (Services & Connectivity subsection)
- ✅ Links route correctly
- ✅ Mega menu structure preserved (3 subsections for 7 sectors)

**Digital Infrastructure Page Acceptance:**
- ✅ `/sectors/digital-infrastructure` page renders (not "Coming Soon")
- ✅ Page includes hero, sector overview, 8 intelligence signals, regional lens, country integration, Afronovation link, access CTA
- ✅ Page uses sovereign-grade, institutional language
- ✅ No unsupported statistics hard-coded
- ✅ Page is mobile responsive
- ✅ Page has SEO metadata

**Tourism Page Acceptance:**
- ✅ `/sectors/tourism-hospitality` page renders
- ✅ Page follows same structure as Digital Infrastructure
- ✅ Sovereign-grade language (not consumer travel)
- ✅ SEO metadata

---

## Updated SQL File Names

**Stage 1:**
- `infra/supabase/sql-pack-v1.12a-add-digital-tourism-priority-20.sql`
  - Adds Digital Infrastructure + Tourism to 20 priority countries
  - 40 new rows (20 × 2 new sectors)
  - Total after execution: 140 rows

**Stage 2:**
- `infra/supabase/sql-pack-v1.13-all-sectors-all-74-markets.sql`
  - All 7 sectors for all 74 markets
  - 518 total rows

**Verification:**
- `infra/supabase/verification/phase-4a-digital-tourism-priority-20-verification.sql`
- `infra/supabase/verification/phase-4a-all-sectors-all-74-verification.sql`

---

## Updated Documentation Files

1. ✅ `docs/execution/phase-4a-sector-taxonomy-expansion-plan.md` (master plan, to be updated)
2. ✅ `docs/execution/phase-4a-sector-taxonomy-expansion-amendment.md` (this file)
3. `docs/qa/phase-4a-digital-tourism-sector-addition.md` (Stage 1 guide)
4. `docs/qa/phase-4a-sector-coverage-all-markets-plan.md` (Stage 2 guide, updated for 7 sectors)
5. `docs/qa/phase-4a-digital-infrastructure-sector-page-implementation.md` (Track C - Digital)
6. `docs/qa/phase-4a-tourism-sector-page-implementation.md` (Track C - Tourism)

---

## Implementation Order (Updated)

**After approval of this amended plan:**

1. ✅ **Approve amended plan** (7 sectors, not 6)
2. 🟡 **Stage 1:** Add Digital Infrastructure + Tourism to 20 priority countries (140 rows)
   - Generate Digital Infrastructure content for 20 countries
   - Generate Tourism content for 20 countries
   - Create SQL seed file: `sql-pack-v1.12a-add-digital-tourism-priority-20.sql`
   - Run SQL in Supabase
   - Update `EntitledSectorList.tsx` for "Top 5 + +2 More" UX
   - Add Digital Infrastructure icon (`Server`, indigo)
   - Add Tourism icon (`Plane`, teal)
   - Test with Professional+ and Explorer
   - Document
3. 🟡 **Track C:** Build Digital Infrastructure + Tourism sector pages + mega menu
   - Update `SouveraMegaNav.tsx` (3 subsections for 7 sectors)
   - Build `/sectors/digital-infrastructure/page.tsx`
   - Build `/sectors/tourism-hospitality/page.tsx`
   - Test navigation and responsive
   - Document
4. 🟡 **Stage 2:** Expand all 7 sectors to all 74 markets (518 rows)
   - Generate content for 54 remaining countries × 7 sectors
   - Create SQL seed file(s)
   - Run verification
   - Test random sample
   - Document

---

## Recommendation

✅ **APPROVE** Phase 4A Sector Taxonomy Expansion Plan (AMENDED for 7 Sectors)

**Rationale:**
1. Digital Infrastructure is Afronovation's **primary vertical** and foundational enabler for all economic sectors
2. Tourism & Hospitality is strategically critical for African and Caribbean economies
3. 7-sector model provides comprehensive coverage of sovereign economic priorities
4. Phased implementation (Stage 1 → Track C → Stage 2) reduces risk
5. UX solution ("Top 5 + +2 More") preserves Fortune-5 panel discipline
6. Content standards ensure sovereign-grade quality for both new sectors
7. SQL strategy is robust and Supabase-compatible
8. Comprehensive verification ensures data integrity

**Next Step:**  
Begin Stage 1 implementation (add Digital Infrastructure + Tourism to 20 priority countries)

**Estimated Stage 1 Effort:** 8-12 hours (40 new sector rows)

---

**END OF AMENDMENT**
