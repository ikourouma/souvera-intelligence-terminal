# Phase 4A Stage 2 — Batch A: North + West Africa Implementation

**Status:** Ready for Execution  
**Date:** 2026-05-05  
**Batch:** A of 4  
**Region:** North + West Africa  
**Countries:** 16 (4 North, 12 West)  
**Sectors:** 7 per country  
**New Rows:** 112  

---

## Executive Summary

This document guides the implementation of Phase 4A Stage 2 Batch A — North + West Africa sector coverage. This batch expands sector coverage to 16 African countries across North and West African subregions, completing coverage for these strategic markets.

**Batch A Deliverables:**
- SQL seed file: `infra/supabase/sql-pack-v1.13a-stage2-africa-north-west.sql`
- Verification script: `infra/supabase/verification/phase-4a-stage2-batch-a-north-west-africa-verification.sql`
- Implementation documentation: This file
- Row count: 112 new sector rows (16 countries × 7 sectors)

**Expected State After Execution:**
- Global total: 399 sector rows (up from 287)
- Africa coverage: 37 countries × 7 sectors = 259 rows
- ESH (Western Sahara) remains excluded: 0 sector rows

---

## Batch A Scope

### Countries Covered (16)

**North Africa (4):**
1. **DZA** — Algeria
2. **LBY** — Libya
3. **SDN** — Sudan
4. **TUN** — Tunisia

**West Africa (12):**
5. **BEN** — Benin
6. **BFA** — Burkina Faso
7. **CPV** — Cabo Verde
8. **GMB** — Gambia
9. **GIN** — Guinea
10. **GNB** — Guinea-Bissau
11. **LBR** — Liberia
12. **MLI** — Mali
13. **MRT** — Mauritania
14. **NER** — Niger
15. **SLE** — Sierra Leone
16. **TGO** — Togo

**Note:** ESH / Western Sahara is explicitly excluded from all Stage 2 batches to preserve the canonical 54-country Africa scope.

### Universal 7-Sector Taxonomy

1. **digital_infrastructure** — Digital Infrastructure — display_order 1
2. **fintech_digital_finance** — Fintech and Digital Finance — display_order 2
3. **energy_renewables** — Energy and Renewables — display_order 3
4. **agriculture_agribusiness** — Agriculture and Agribusiness — display_order 4
5. **mining_critical_minerals** — Mining and Critical Minerals — display_order 5
6. **logistics_trade** — Logistics and Trade — display_order 6
7. **tourism_hospitality** — Tourism and Hospitality — display_order 7

---

## Row Count Breakdown

| Category | Count | Calculation |
|----------|-------|-------------|
| **Batch A Countries** | 16 | 4 North + 12 West Africa |
| **Sectors per Country** | 7 | Universal taxonomy |
| **New Rows (Batch A)** | 112 | 16 × 7 |
| **Previous Total** | 287 | Stage 1 (140) + Batch C (56) + Batch D (91) |
| **Expected Total After Batch A** | 399 | 287 + 112 |
| **Africa Total After Batch A** | 259 | 37 countries × 7 sectors |

---

## North + West Africa Content Standards

### Regional Characteristics Reflected

**North Africa (Maghreb + Nile Valley):**
- Larger economies with oil/gas (Algeria, Libya), tourism (Tunisia), diverse economies (Sudan)
- Trans-Saharan connectivity and Mediterranean trade positioning
- Post-conflict recovery contexts (Libya, Sudan)
- Heritage tourism potential (Roman sites, Sahara, Nile)

**West Africa (Coastal + Sahel):**
- Economic Community of West African States (ECOWAS) integration
- WAEMU monetary union (8 countries: BEN, BFA, GNB, CIV, MLI, NER, SEN, TGO)
- Landlocked vs coastal dynamics (landlocked: BFA, MLI, NER; ports: BEN, TGO serving hinterlands)
- Mining economies (GIN, MLI, BFA, LBR, SLE)
- Post-conflict recovery (LBR, SLE)
- Security challenges (BFA, MLI, NER in Sahel)
- Small island state (CPV)

### Digital Infrastructure Content
Country-specific references reflect:
- Mobile network expansion and fiber backbone investment
- Submarine cable connectivity (coastal) vs landlocked transit arrangements
- E-government services and digital identity programs
- Trans-Saharan digital corridors (Algeria, Libya, Mauritania, Niger, Mali)
- Digital skills and ICT services exports (Tunisia, Togo)
- Post-conflict digital infrastructure rebuilding (Libya, Liberia, Sierra Leone)
- Small-island digital hub potential (Cabo Verde)

### Tourism & Hospitality Content
Country-specific references reflect:
- Saharan tourism (Algeria, Libya, Mauritania, Niger)
- Mediterranean resort tourism (Tunisia)
- Heritage and cultural tourism (Mali - Timbuktu, Libya - Roman sites, Tunisia - Carthage, Benin - heritage sites)
- Beach and island tourism (Cabo Verde, Gambia)
- Eco-tourism and wildlife (Guinea, Liberia, Sierra Leone, Gambia)
- Post-conflict tourism recovery (Libya, Liberia, Sierra Leone)
- Security-affected tourism (Burkina Faso, Mali, Niger)
- Institutional tone, not consumer travel marketing

### Sector-Specific Considerations

**Energy & Renewables:**
- Hydrocarbon producers: Algeria, Libya (oil/gas)
- Hydropower potential: Guinea, Liberia, Sierra Leone, Sudan
- Solar energy potential: Saharan/Sahel countries (exceptional solar resources)
- Energy access challenges: Burkina Faso, Guinea-Bissau, Liberia, Niger, Sierra Leone
- Island renewable transition: Cabo Verde

**Agriculture & Agribusiness:**
- Sahel agriculture with climate vulnerability: Burkina Faso, Mali, Niger, Sudan
- Plantation economies: Liberia (rubber), Guinea (palm, coffee)
- Export crops: Benin (cotton, cashews), Burkina Faso (cotton), Guinea-Bissau (cashews), Togo (coffee, cocoa)
- Mediterranean agriculture: Algeria, Tunisia (olives, dates, citrus)
- Food security challenges in Sahel context

**Mining & Critical Minerals:**
- Major producers: Guinea (bauxite - world's largest reserves), Mali (gold), Mauritania (iron ore), Algeria (phosphates)
- Gold producers: Burkina Faso, Guinea, Mali, Sierra Leone, Sudan
- Diamonds: Liberia, Sierra Leone (post-conflict governance reforms)
- Iron ore: Guinea, Liberia (resuming), Mauritania
- Uranium: Niger
- Phosphates: Algeria, Togo, Tunisia

---

## SQL Execution Instructions

### Prerequisites
1. Supabase SQL Editor access
2. Batch C successfully executed and verified (current total: 196 rows)
3. Batch D successfully executed and verified (current total: 287 rows)
4. Stage 1 successfully executed (20 priority countries, 140 rows)

### Execution Order

**Step 1: Run Seed SQL**
```
File: infra/supabase/sql-pack-v1.13a-stage2-africa-north-west.sql
```
- Idempotent `ON CONFLICT DO UPDATE`
- Safe to rerun
- No psql meta-commands
- Uses dollar-quoted strings
- Supabase SQL Editor compatible

**Step 2: Run Verification SQL**
```
File: infra/supabase/verification/phase-4a-stage2-batch-a-north-west-africa-verification.sql
```
- Read-only verification
- 14 comprehensive checks
- Safe to run repeatedly
- Uses `updated_at` column (not `created_at`)
- Schema-compatible (no `region_slug` references)

---

## Verification Expectations

### Expected Results

| Check | Description | Expected Result |
|-------|-------------|-----------------|
| 1 | Total Batch A rows | 112 rows |
| 2 | Sectors per country | 7 sectors for each of 16 countries |
| 3 | All countries present | 16 countries |
| 4 | All sector keys per country | 7 distinct sector keys per country |
| 5 | No duplicate sector keys | 0 duplicates |
| 6 | Min plan ID | 112 rows with 'explorer' |
| 7 | Display order values | 1–7, distributed correctly |
| 8 | Teaser MD populated | 112 rows with content |
| 9 | Rationale MD populated | 112 rows with content |
| 10 | Digital Infrastructure samples | Samples display correctly |
| 11 | Tourism & Hospitality samples | Samples display correctly |
| 12 | Global total | 399 rows total |
| 13 | Africa coverage | 37 countries, 259 rows |
| 14 | ESH exclusion | 0 rows for ESH |

### Verification Schema Compatibility
- Uses `updated_at` column for timestamp checks (not `created_at`)
- Uses explicit ISO3 arrays (no `region_slug` dependencies)
- All CTEs are self-contained for each query
- Compatible with Supabase SQL Editor

### Success Criteria
All 14 checks return `✓ PASS` status.

---

## Browser QA Checklist

### Professional+ Account Testing

Test the following North + West African routes:

**Priority Testing:**
1. `/intelligence/map?region=africa&selected=DZA` (Algeria - North Africa, large economy)
2. `/intelligence/map?region=africa&selected=TUN` (Tunisia - Mediterranean, tourism)
3. `/intelligence/map?region=africa&selected=GIN` (Guinea - mining, bauxite leader)
4. `/intelligence/map?region=africa&selected=CPV` (Cabo Verde - island state)
5. `/intelligence/map?region=africa&selected=SLE` (Sierra Leone - post-conflict recovery)

**Additional Coverage:**
6. `/intelligence/map?region=africa&selected=BEN` (Benin - port economy)
7. `/intelligence/map?region=africa&selected=TGO` (Togo - logistics hub)
8. `/intelligence/map?region=africa&selected=LBR` (Liberia - post-conflict)
9. `/intelligence/map?region=africa&selected=SDN` (Sudan - transition context)
10. `/intelligence/map?region=africa&selected=MLI` (Mali - gold, Sahel challenges)

**Expected Professional+ Behavior:**
- Digital Infrastructure appears as first sector (display_order 1)
- Top 5 sectors visible by default
- "+2 more sectors" or "View all sectors" control appears
- Clicking control reveals all 7 sectors
- Tourism & Hospitality accessible (display_order 7)
- Sector accordion expansion works (one at a time)
- Rationale content displays when sector is expanded
- CTA remains stable
- Panel does not auto-stretch awkwardly
- No horizontal overflow

### Explorer Account Testing

Test routes:
1. `/intelligence/map?region=africa&selected=GIN` (Guinea)
2. `/intelligence/map?region=africa&selected=CPV` (Cabo Verde)

**Expected Explorer Behavior:**
- 1 sector teaser only (typically Digital Infrastructure)
- No rationale visible
- No "+2 more sectors" control
- FDI locked/hidden
- CTA remains visible

### Responsive Testing

Test widths:
- 375px (mobile)
- 768px (tablet)
- 1440px (desktop)

**Expected:**
- No horizontal overflow at any width
- Sector accordion remains readable
- "+2 more sectors" control works on mobile
- Country panel remains usable

---

## Known Limitations

### Content Scope
1. **Security contexts:** Content for Burkina Faso, Libya, Mali, Niger reflects security challenges affecting development
2. **Post-conflict recovery:** Content for Liberia, Sierra Leone, Sudan acknowledges reconstruction contexts
3. **Data availability:** Some smaller or conflict-affected countries have limited specific data; content remains institutional and conservative
4. **Strength/growth scores:** Conservative scoring (0-100 range) reflects diverse development contexts from fragile states to middle-income economies

### Technical
1. **No code changes:** Batch A is SQL-only; no API, UI, or entitlement changes
2. **Browser QA required:** Manual browser testing needed to confirm UI behavior
3. **ESH exclusion maintained:** Western Sahara remains excluded from all Stage 2 batches

### Execution
1. **Idempotent design:** Safe to rerun; `ON CONFLICT DO UPDATE` handles duplicates
2. **No rollback:** SQL does not include automated rollback; manual correction required if issues arise
3. **Performance:** 112-row insert is manageable; no performance concerns expected

---

## North + West Africa Context

### Development Diversity

Batch A content reflects substantial diversity:

**Upper-middle income:** Algeria, Tunisia
**Lower-middle income:** Cabo Verde, Mauritania, Sudan
**Low income:** Benin, Burkina Faso, Gambia, Guinea, Guinea-Bissau, Liberia, Mali, Niger, Sierra Leone, Togo

**Post-conflict recovery:** Liberia, Libya, Sierra Leone, Sudan
**Security-affected:** Burkina Faso, Mali, Niger (Sahel insurgency)
**Politically stable:** Benin, Cabo Verde, Togo, Tunisia (relative to region)

### Economic Structures

**Hydrocarbon exporters:** Algeria, Libya
**Mining economies:** Guinea (bauxite leader), Mali, Burkina Faso, Niger (gold), Mauritania (iron ore)
**Port & logistics hubs:** Benin, Togo (serving landlocked neighbors)
**Agricultural economies:** Most West African countries (cotton, cashews, coffee)
**Services-oriented:** Cabo Verde (tourism, Atlantic hub), Tunisia (manufacturing, tourism, ICT)

### Regional Integration

**ECOWAS members (12):** Benin, Burkina Faso, Cabo Verde, Gambia, Guinea, Guinea-Bissau, Liberia, Mali, Niger, Senegal, Sierra Leone, Togo
**WAEMU monetary union (8 in Batch A):** Benin, Burkina Faso, Guinea-Bissau, Mali, Niger, Senegal, Togo (+ Côte d'Ivoire in Stage 1)
**Arab Maghreb Union:** Algeria, Libya, Mauritania, Tunisia
**Landlocked (3):** Burkina Faso, Mali, Niger

---

## Recommendation for Next Batch

**After successful Batch A execution and verification:**

Proceed with **Batch B** — Africa East + Central:
- 17 countries (9 East + 8 Central Africa)
- 119 rows
- Completes Stage 2 and achieves 518-row target across all 74 markets

**Batch B countries:**
- **East Africa (9):** BDI, COM, DJI, ERI, MDG, MUS, SYC, SOM, SSD
- **Central Africa (8):** AGO, CAF, TCD, COG, COD, GNQ, GAB, STP

**Final Stage 2 target:**
- 74 Souvera markets
- 7 sectors per market
- 518 total sector rows
- ESH excluded

---

**Prepared by:** Souvera Intelligence Terminal Development Team  
**Date:** 2026-05-05  
**Phase:** 4A Stage 2 — All-74 Sector Coverage  
**Batch:** A — North + West Africa  
**Status:** Ready for Execution
