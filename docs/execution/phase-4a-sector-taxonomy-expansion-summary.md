# Phase 4A — Sector Taxonomy Expansion: Executive Summary

**Status:** 📋 PLANNING (Awaiting Approval)  
**Date:** 2026-05-05  
**Owner:** Afronovation, Inc.

---

## Overview

This plan restores **Tourism & Hospitality** as Souvera's 6th core sector and expands complete 6-sector coverage to all 74 markets.

**Strategic Rationale:**
- Tourism & Hospitality is critical for African and Caribbean sovereign economies
- Aligns with Afronovation's Bridge55, AfCON Hub, and tourism board intelligence strategy
- Represents foreign exchange, aviation, diaspora travel, events, and destination infrastructure

---

## Current State

**Data:**
- 20 priority countries
- 5 sectors per country
- 100 total sector rows

**Sectors:**
1. Fintech and Digital Finance
2. Energy and Renewables
3. Agriculture and Agribusiness
4. Mining and Critical Minerals
5. Logistics and Trade

---

## Proposed Changes

### Add 6th Sector
- **sector_key:** `tourism_hospitality`
- **sector_label:** Tourism and Hospitality
- **display_order:** 6
- **Icon:** `Plane` (teal color)

### Two-Stage Implementation

**Stage 1: Tourism for Priority 20**
- Add Tourism to 20 priority countries
- Result: 120 rows (20 × 6 sectors)
- Files: `sql-pack-v1.12a-add-tourism-priority-20.sql`

**Stage 2: All 6 Sectors for All 74**
- Expand all 6 sectors to all 74 markets
- Result: 444 rows (74 × 6 sectors)
- Files: `sql-pack-v1.13-all-sectors-all-74-markets.sql`

---

## UX Solution for 6 Sectors

**Problem:** Adding a 6th sector breaks "all collapsed sectors fit without scrolling" UX achievement.

**Recommended Solution:** Top 5 by Score + "+1 More Sector" Indicator

**Behavior:**
- Show top 5 sectors ranked by `(strength_score + growth_score) / 2`
- If 6th sector exists, show "+1 more sector" card
- Clicking reveals 6th sector
- Maintains panel discipline and Fortune-5 quality

**Explorer/Public:** Still sees 1 sector teaser (unchanged)

---

## Track C: Tourism Sector Page

**Goal:** Build `/sectors/tourism-hospitality` page and add to mega menu

**Page Structure:**
1. Hero (Tourism & Hospitality Intelligence)
2. Sector Overview (sovereign-grade positioning)
3. Intelligence Signals (6 categories: visitor economy, hotel capacity, air connectivity, events, heritage, investment readiness)
4. Regional Lens (Africa vs Caribbean)
5. Country Intelligence Integration
6. Bridge55/AfCON Hub Ecosystem Link
7. Access CTA

**Mega Menu Update:**
- Add "Tourism & Hospitality" to "Growth Sectors" subsection
- Route: `/sectors/tourism-hospitality`

**Tone:** Sovereign-grade, institutional (not consumer travel brochure)

---

## Content Standards

**Tourism Sector Copy:**
- teaser_md: 1-2 sentences, 120-220 characters
- rationale_md: 2-4 sentences, 350-650 characters
- Country-specific (not generic)
- Conservative language: "visitor economy," "destination infrastructure," "air connectivity," "diaspora travel"
- No unsupported "$200B" or "5.1%" claims unless source-verified

**Preferred Themes:**
- **Africa:** Wildlife tourism, cultural heritage, business travel, diaspora engagement, AfCON, aviation hubs
- **Caribbean:** Leisure/resort tourism, cruise infrastructure, diaspora (North America/Europe), air connectivity, services economy

---

## Implementation Order

1. ✅ **Approve this plan**
2. 🟡 **Stage 1:** Add Tourism to 20 priority countries (120 rows)
3. 🟡 **Track C:** Build Tourism sector page + mega menu
4. 🟡 **Stage 2:** Expand all 6 sectors to all 74 markets (444 rows)

**Why This Order:**
- Stage 1 is small, testable increment (20 new rows)
- Track C establishes Tourism as first-class sector
- Stage 2 benefits from Stage 1 lessons learned

---

## Acceptance Criteria

### Stage 1
- ✅ 120 rows (20 countries × 6 sectors)
- ✅ All 20 have `tourism_hospitality`
- ✅ No duplicates
- ✅ Professional+ sees top 5 + "+1 more" indicator
- ✅ Explorer sees 1 sector teaser
- ✅ Tourism icon (Plane, teal) renders correctly

### Stage 2
- ✅ 444 rows (74 countries × 6 sectors)
- ✅ All 74 have `tourism_hospitality`
- ✅ No duplicates
- ✅ Country-specific copy (not templates)
- ✅ Random sample QA (10 countries)

### Track C
- ✅ Tourism & Hospitality in mega menu
- ✅ `/sectors/tourism-hospitality` page renders
- ✅ Sovereign-grade language
- ✅ No unsupported statistics
- ✅ Mobile responsive
- ✅ SEO metadata

---

## Key Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Panel fit with 6 sectors | Use "Top 5 + +1 More" UX pattern |
| Tourism content quality variability | Strict content standards + QA |
| SQL execution errors | CTE VALUES + idempotent ON CONFLICT |
| Tourism page scope creep | Implement in parallel, ship over perfection |

---

## Files to Create

**SQL:**
1. `sql-pack-v1.12a-add-tourism-priority-20.sql`
2. `sql-pack-v1.13-all-sectors-all-74-markets.sql`

**Verification:**
1. `phase-4a-tourism-priority-20-verification.sql`
2. `phase-4a-all-sectors-all-74-verification.sql`

**Documentation:**
1. `phase-4a-sector-taxonomy-expansion-plan.md` (master plan)
2. `phase-4a-tourism-hospitality-sector-addition.md`
3. `phase-4a-sector-coverage-all-markets-plan.md`
4. `phase-4a-tourism-sector-page-implementation.md`

**Code:**
1. `EntitledSectorList.tsx` (update for 6 sectors + "+1 More" UX)
2. `SouveraMegaNav.tsx` (add Tourism link)
3. `/sectors/tourism-hospitality/page.tsx` (build page)

---

## Recommendation

✅ **APPROVE** Phase 4A Sector Taxonomy Expansion Plan

**Rationale:**
- Tourism & Hospitality is strategically critical for Africa and Caribbean
- Aligns with Afronovation ecosystem (Bridge55, AfCON Hub)
- Phased implementation reduces risk
- UX solution preserves Fortune-5 panel discipline
- Content standards ensure sovereign-grade quality

**Next Step After Approval:**  
Begin Stage 1 implementation (add Tourism to 20 priority countries)

---

**Full Plan:** `docs/execution/phase-4a-sector-taxonomy-expansion-plan.md`

---

**END OF SUMMARY**
