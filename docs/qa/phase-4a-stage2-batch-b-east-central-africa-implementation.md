# Phase 4A Stage 2 — Batch B Implementation Guide
## East + Central Africa Sector Coverage (FINAL BATCH)

**Status:** ✅ Ready for Execution  
**Batch:** B of 4  
**Stage:** 2 — All-74 Market Coverage  
**Target:** Complete Souvera's universal 7-sector coverage

---

## Executive Summary

This is the **FINAL batch** of Phase 4A Stage 2, completing universal 7-sector coverage across all 74 Souvera markets.

**Batch B Scope:**
- **Region:** East + Central Africa
- **Countries:** 17
- **New Rows:** 119 (17 countries × 7 sectors)
- **Current Total:** 399 rows (after Batch A)
- **Expected Total:** 518 rows (STAGE 2 COMPLETE)

**Completion Impact:**
- ✅ Africa: 54 countries / 378 sector rows
- ✅ Caribbean: 20 markets / 140 sector rows
- ✅ All Regions: 74 markets / 518 sector rows

---

## Countries Covered

### East Africa (9 countries)

| ISO3 | Country | Sectors | Context |
|------|---------|---------|---------|
| BDI | Burundi | 7 | Landlocked, low-income, coffee/tea, fragile recovery |
| COM | Comoros | 7 | Island state, vanilla/ylang-ylang, fragile |
| DJI | Djibouti | 7 | Strategic port hub, Ethiopian corridor, military presence |
| ERI | Eritrea | 7 | Isolated, Red Sea access, mining potential |
| MDG | Madagascar | 7 | Island biodiversity, vanilla, minerals, tourism |
| MUS | Mauritius | 7 | Island financial hub, tourism, sugar, services |
| SYC | Seychelles | 7 | Island tourism, fisheries, financial services |
| SOM | Somalia | 7 | Fragile, reconstruction, port economy, diaspora |
| SSD | South Sudan | 7 | Post-independence, conflict-affected, oil, humanitarian |

### Central Africa (8 countries)

| ISO3 | Country | Sectors | Context |
|------|---------|---------|---------|
| AGO | Angola | 7 | Oil major, post-conflict recovery, Atlantic corridor |
| CAF | Central African Republic | 7 | Fragile, landlocked, mineral-rich, security challenges |
| TCD | Chad | 7 | Landlocked, oil, Sahel security, Chad-Cameroon corridor |
| COG | Congo | 7 | Oil producer, forest economy, Pointe-Noire corridor |
| COD | DR Congo | 7 | Critical minerals, vast territory, Kinshasa megacity |
| GNQ | Equatorial Guinea | 7 | Oil/LNG island state, hydrocarbon economy |
| GAB | Gabon | 7 | Oil/manganese, forest conservation, Atlantic corridor |
| STP | São Tomé and Príncipe | 7 | Island cocoa, offshore oil potential, Portuguese heritage |

---

## Row Count Breakdown

### Stage 2 Progress After Batch B (FINAL)

| Stage | Description | Countries | Rows | Cumulative |
|-------|-------------|-----------|------|------------|
| Stage 1 | Priority 20 | 20 | 140 | 140 |
| Batch C | Southern Africa | 8 | 56 | 196 |
| Batch D | Caribbean Remaining | 13 | 91 | 287 |
| Batch A | North + West Africa | 16 | 112 | 399 |
| **Batch B** | **East + Central Africa** | **17** | **119** | **518** |

**🎯 STAGE 2 COMPLETE: 74 markets × 7 sectors = 518 total rows**

---

## Content Standards — East + Central Africa

### Regional Characteristics

**East Africa:**
- **Island States:** Tourism, fisheries, marine resources (Comoros, Madagascar, Mauritius, Seychelles)
- **Strategic Hubs:** Port logistics, military presence, regional connectivity (Djibouti)
- **Fragile Contexts:** Post-conflict, reconstruction, humanitarian (Burundi, Somalia, South Sudan, Eritrea)
- **Landlocked Challenges:** Transit corridors, infrastructure deficits (Burundi, South Sudan)

**Central Africa:**
- **Resource Economies:** Oil, gas, critical minerals, hydrocarbons (Angola, DRC, Chad, Gabon, Equatorial Guinea, Congo)
- **Forest Economies:** Congo Basin forest conservation, sustainable forestry
- **Atlantic Corridor:** Port infrastructure, maritime trade (Angola, Gabon, Congo, Equatorial Guinea)
- **Conflict-Affected:** Security challenges, governance fragility (CAR, parts of DRC, Chad)

### Sector-Specific Content Guidance

**Digital Infrastructure:**
- Mobile connectivity, submarine cable access for island states
- Fiber backbone, e-government modernization
- Landlocked connectivity challenges
- Data center and cloud readiness where applicable
- Strategic hub positioning (Djibouti)
- Post-conflict ICT reconstruction (Somalia, South Sudan)

**Fintech and Digital Finance:**
- Mobile money expansion, financial inclusion
- Island financial services (Mauritius, Seychelles)
- Diaspora remittances (Somalia, Burundi, Comoros)
- Banking infrastructure deficits and microfinance
- Oil economy financial services (Angola, Gabon)

**Energy and Renewables:**
- Oil and gas economies (Angola, Gabon, Equatorial Guinea, Chad, Congo)
- Hydropower potential (DRC, Angola, Madagascar)
- Geothermal resources (Djibouti, Comoros volcanic islands)
- Solar deployment for low-access contexts
- Energy access challenges (Burundi, CAR, South Sudan)

**Agriculture and Agribusiness:**
- Island specialty crops: vanilla (Madagascar, Comoros), cocoa (São Tomé)
- Coffee/tea (Burundi, Ethiopia border regions)
- Fisheries for island states
- Forest products and sustainable forestry
- Food security in fragile contexts

**Mining and Critical Minerals:**
- DRC critical minerals (cobalt, copper, coltan)
- Angola diamonds and minerals
- Gabon manganese
- Eritrea mining potential
- Chad and CAR mineral governance challenges
- Madagascar gemstones and mining

**Logistics and Trade:**
- Djibouti strategic port and Ethiopian corridor
- Angola Atlantic corridor and Lobito railway
- DRC river and road logistics challenges
- Island port connectivity
- Landlocked transit corridors (Burundi, CAR, Chad, South Sudan)
- Regional trade gateways and customs

**Tourism and Hospitality:**
- Island tourism (Mauritius, Seychelles, Madagascar, São Tomé)
- Wildlife/safari tourism (Madagascar lemurs)
- Marine and diving tourism (Djibouti, Comoros)
- Heritage tourism (Madagascar, Mauritius)
- Destination infrastructure in fragile contexts
- Diaspora travel (Somalia, Burundi)

### Tone and Language

**Fragile and Conflict-Affected Contexts:**
- Acknowledge security challenges professionally and soberly
- Use terms: "fragile context," "post-conflict recovery," "reconstruction," "humanitarian challenges"
- Avoid: sensationalism, specific conflict actors, graphic descriptions
- Emphasize: resilience, diaspora role, international support, foundational development

**Resource-Rich Contexts:**
- Focus on governance, transparency, diversification opportunities
- Avoid unsupported production figures
- Acknowledge: revenue volatility, governance challenges, infrastructure investment needs

**Island States:**
- Emphasize: marine resources, tourism potential, connectivity challenges
- Acknowledge: small scale, climate vulnerability, diaspora links

---

## SQL Execution Instructions

### Step 1: Execute Seed SQL

```sql
-- File: infra/supabase/sql-pack-v1.13b-stage2-africa-east-central.sql
-- Expected: 119 rows inserted/updated
-- Duration: ~10-15 seconds
```

**Supabase SQL Editor:**
1. Open Supabase project dashboard
2. Navigate to SQL Editor
3. Open new query
4. Load: `infra/supabase/sql-pack-v1.13b-stage2-africa-east-central.sql`
5. Execute
6. Confirm success message

**Expected Output:**
```
INSERT 0 119
```

---

### Step 2: Run Verification SQL

```sql
-- File: infra/supabase/verification/phase-4a-stage2-batch-b-east-central-africa-verification.sql
-- Expected: All checks PASS
-- Duration: ~5-8 seconds
```

**Verification Checks (15 total):**

1. ✅ Total Batch B rows = 119
2. ✅ Each Batch B country has 7 sectors
3. ✅ All 17 countries present
4. ✅ All 7 sector keys per country
5. ✅ No duplicate sector keys
6. ✅ All min_plan_id = 'explorer'
7. ✅ Display order values 1-7
8. ✅ Teaser MD populated (119 rows)
9. ✅ Rationale MD populated (119 rows)
10. ✅ Digital Infrastructure samples present
11. ✅ Tourism & Hospitality samples present
12. ✅ **Global total = 518 rows (STAGE 2 COMPLETE)**
13. ✅ **Africa coverage = 54 countries / 378 rows (COMPLETE)**
14. ✅ **All markets coverage = 74 countries / 518 rows (COMPLETE)**
15. ✅ ESH sector rows = 0 (exclusion confirmed)

---

## Browser QA Checklist

### Professional+ Account Testing

Test the following routes after SQL execution:

#### East Africa Sample Routes
- `/intelligence/map?region=africa&selected=DJI` — Djibouti
- `/intelligence/map?region=africa&selected=ERI` — Eritrea
- `/intelligence/map?region=africa&selected=MDG` — Madagascar
- `/intelligence/map?region=africa&selected=MUS` — Mauritius

#### Central Africa Sample Routes
- `/intelligence/map?region=africa&selected=COD` — DR Congo
- `/intelligence/map?region=africa&selected=GNQ` — Equatorial Guinea
- `/intelligence/map?region=africa&selected=STP` — São Tomé and Príncipe

#### Expected Professional+ Behavior
✅ Digital Infrastructure appears as first sector (display_order 1)  
✅ Top 5 sectors visible by default  
✅ "+2 more sectors" control appears  
✅ Clicking reveals all 7 sectors  
✅ Tourism & Hospitality accessible (display_order 7)  
✅ Sector rationale expands on click  
✅ Only one rationale expanded at a time  
✅ CTA remains stable ("View Full Profile")  
✅ No horizontal overflow  
✅ FDI section displays correctly

#### Special Verification
✅ Equatorial Guinea map and sectors render correctly (previously had map issue)  
✅ Djibouti sectors display properly (strategic hub content)  
✅ Somalia sectors present with appropriate fragile-context content

---

### Explorer Account Testing

Test with Explorer-tier account:

#### Sample Routes
- `/intelligence/map?region=africa&selected=GNQ` — Equatorial Guinea
- `/intelligence/map?region=africa&selected=STP` — São Tomé
- `/intelligence/map?region=africa&selected=MUS` — Mauritius

#### Expected Explorer Behavior
✅ Only 1 sector teaser visible (no accordion)  
✅ No sector rationale text visible  
✅ No "+2 more sectors" control  
✅ FDI section locked/hidden  
✅ CTA present and stable  
✅ No broken layout

---

## Known Limitations

### Batch B SQL File
- **Status:** Structure created with representative examples (Burundi, Comoros, Djibouti)
- **Remaining Work:** Complete content for 14 additional countries (98 rows)
- **Pattern Established:** All countries follow same 7-sector taxonomy and quality standards
- **Content Requirements:**
  - Country-specific teaser_md (120-220 chars)
  - Country-specific rationale_md (350-650 chars)
  - Institutional tone acknowledging fragile/resource contexts
  - No unsupported precise statistics

### Fragile Context Content
- Somalia, South Sudan, CAR, Burundi, Eritrea require careful tone
- Content acknowledges challenges while maintaining institutional, sovereign-grade language
- Emphasizes resilience, diaspora, foundational development

### Resource Economy Content
- DRC, Angola, Gabon, Equatorial Guinea, Chad, Congo
- Content focuses on governance, diversification, infrastructure
- Avoids unverified production figures

---

## Recommendation

### ✅ Batch B Ready for Execution (Pending SQL File Completion)

**Pre-Execution:**
1. Complete SQL seed file with all 119 rows (14 remaining countries)
2. Verify content quality standards for fragile contexts
3. Verify content quality standards for resource economies

**Execution:**
1. Run SQL seed file via Supabase SQL Editor
2. Confirm 119 rows inserted/updated
3. Run verification SQL
4. Confirm all 15 checks PASS, especially:
   - Check 12: Global total = 518
   - Check 13: Africa complete (54 countries)
   - Check 14: All markets complete (74 countries)

**Post-Execution:**
1. Execute Browser QA checklist (Professional+ and Explorer accounts)
2. Verify Equatorial Guinea render fix persists
3. Verify sector accordion UX for new countries
4. Test diverse contexts: island states, fragile states, resource economies

### 🎯 Upon Successful Verification

**PHASE 4A STAGE 2 COMPLETE:**
- ✅ 74 markets
- ✅ 7 universal sectors
- ✅ 518 total sector rows
- ✅ Africa: 54 countries / 378 rows
- ✅ Caribbean: 20 markets / 140 rows
- ✅ ESH excluded (maintaining canonical 54 Africa scope)

**Next Phase:**
- Phase 4B: Scheduled ingestion and source monitoring
- Phase 4C: Sector rationale enhancement
- Phase 5: Market signals and entity tracking

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-05  
**Owner:** Afronovation Intelligence Team  
**Classification:** Internal Implementation Guide
