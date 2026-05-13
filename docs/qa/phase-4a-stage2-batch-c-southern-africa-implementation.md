# Phase 4A Stage 2 Batch C: Southern Africa Implementation

**Status:** ✅ READY FOR EXECUTION  
**Date Created:** 2026-05-05  
**Owner:** Afronovation, Inc.  
**Batch:** C of 4 (Southern Africa)

---

## Executive Summary

This document details the implementation of **Phase 4A Stage 2 Batch C**, covering **8 Southern African countries** with complete 7-sector taxonomy coverage. Batch C adds **56 new sector rows** to the Souvera Intelligence Terminal.

**Implementation Strategy:**
- Start with Batch C as the Stage 2 pilot batch (smallest, most manageable)
- Validate SQL structure, content quality, and verification approach
- Use learnings to refine subsequent batches (B, A, D)

---

## Batch C Scope

| Metric | Value |
|--------|-------|
| Countries | 8 |
| Sectors per Country | 7 |
| Total New Rows | 56 |
| Region | Southern Africa |
| SQL Pack Version | v1.13c |

---

## Countries Covered

### Batch C: Southern Africa (8 countries)

| ISO3 | Country | Subregion |
|------|---------|-----------|
| BWA | Botswana | Southern Africa |
| SWZ | Eswatini | Southern Africa |
| LSO | Lesotho | Southern Africa |
| MWI | Malawi | Southern Africa |
| MOZ | Mozambique | Southern Africa |
| NAM | Namibia | Southern Africa |
| ZMB | Zambia | Southern Africa |
| ZWE | Zimbabwe | Southern Africa |

---

## Universal 7-Sector Taxonomy

| # | sector_key | sector_label | display_order |
|---|------------|--------------|---------------|
| 1 | `digital_infrastructure` | Digital Infrastructure | 1 |
| 2 | `fintech_digital_finance` | Fintech and Digital Finance | 2 |
| 3 | `energy_renewables` | Energy and Renewables | 3 |
| 4 | `agriculture_agribusiness` | Agriculture and Agribusiness | 4 |
| 5 | `mining_critical_minerals` | Mining and Critical Minerals | 5 |
| 6 | `logistics_trade` | Logistics and Trade | 6 |
| 7 | `tourism_hospitality` | Tourism and Hospitality | 7 |

---

## Row Count Breakdown

| Country | ISO3 | Sectors | Rows |
|---------|------|---------|------|
| Botswana | BWA | 7 | 7 |
| Eswatini | SWZ | 7 | 7 |
| Lesotho | LSO | 7 | 7 |
| Malawi | MWI | 7 | 7 |
| Mozambique | MOZ | 7 | 7 |
| Namibia | NAM | 7 | 7 |
| Zambia | ZMB | 7 | 7 |
| Zimbabwe | ZWE | 7 | 7 |
| **Total** | | | **56** |

---

## Content Standards

### Teaser Standards (teaser_md)

- **Length:** 120–220 characters
- **Tone:** Executive-grade, institutional
- **Structure:** Single sentence summarizing sector positioning
- **Country-specificity:** References country-specific context

**Example (Botswana - Digital Infrastructure):**
> Botswana's digital infrastructure is anchored by fiber backbone expansion, competitive telecommunications market, growing data center interest, and targeted e-government initiatives.

### Rationale Standards (rationale_md)

- **Length:** 350–650 characters
- **Tone:** Investment-grade intelligence prose
- **Structure:** 3-4 sentences covering current state, strategic positioning, and opportunity
- **Country-specificity:** References specific infrastructure, programs, or advantages

**Example (Botswana - Digital Infrastructure):**
> Botswana benefits from competitive telecommunications infrastructure, fiber backbone connectivity linking major urban centers, and government digital transformation programs. The country has developed a stable regulatory environment for ICT investment, with growing interest in data center development and regional connectivity. E-government services are expanding, and digital identity initiatives are underway. The sector represents opportunity for cloud infrastructure, cross-border connectivity, and institutional digital transformation aligned with Botswana's economic diversification goals.

### Sector-Specific Content Themes

**Digital Infrastructure:**
- Fiber backbone and mobile connectivity
- Data center readiness
- E-government modernization
- Regional connectivity
- Digital identity systems

**Tourism & Hospitality:**
- Safari and conservation tourism
- National parks and wildlife areas
- Lodge and hospitality infrastructure
- Regional visitor markets
- Aviation connectivity

**All Sectors:**
- Country-specific references (not generic)
- Conservative, defensible positioning
- No unsupported precise statistics
- Institutional tone (not promotional)

---

## SQL Execution Instructions

### Prerequisites

1. Confirm Supabase access with write permissions
2. Verify Stage 1 is complete (140 rows across 20 priority countries)
3. Backup current `souvera_country_sectors` table (recommended)

### Execution Steps

**1. Execute Seed SQL:**

```
File: infra/supabase/sql-pack-v1.13c-stage2-africa-southern.sql
```

In Supabase SQL Editor:
1. Open the seed SQL file
2. Review the 56 rows (8 countries × 7 sectors)
3. Execute the full script
4. Confirm success message

**Expected Output:**
- 56 rows inserted/updated
- No errors
- Execution time: < 5 seconds

**2. Execute Verification SQL:**

```
File: infra/supabase/verification/phase-4a-stage2-batch-c-southern-africa-verification.sql
```

In Supabase SQL Editor:
1. Open the verification SQL file
2. Execute all checks sequentially
3. Review results for each check

**Expected Results:**
- CHECK 1: Total Batch C rows = 56 ✅
- CHECK 2: Each country has 7 sectors ✅
- CHECK 3: All 8 countries present ✅
- CHECK 4: All 7 sector keys present ✅
- CHECK 5: No duplicates ✅
- CHECK 6: All min_plan_id = 'explorer' ✅
- CHECK 7: display_order 1-7 ✅
- CHECK 8: teaser_md completeness ✅
- CHECK 9: rationale_md completeness ✅
- CHECK 10: Sample Digital Infrastructure rows ✅
- CHECK 11: Sample Tourism & Hospitality rows ✅
- CHECK 12: Global total = 196 (140 Stage 1 + 56 Batch C) ✅
- CHECK 13: ESH exclusion (0 rows) ✅

---

## Verification Expectations

### Successful Execution Criteria

| Check | Expected | Pass Condition |
|-------|----------|----------------|
| Total Batch C rows | 56 | Exactly 56 |
| Countries with sectors | 8 | All 8 present |
| Sectors per country | 7 | Each country has 7 |
| Sector key distribution | 8 per key | Each of 7 keys has 8 rows |
| Duplicates | 0 | No duplicates |
| min_plan_id | 'explorer' | All 56 rows |
| display_order | 1-7 | All rows within range |
| teaser_md | Not NULL | All 56 rows |
| rationale_md | Not NULL | All 56 rows |
| Global total | 196 | 140 (Stage 1) + 56 (Batch C) |
| ESH rows | 0 | Western Sahara excluded |

### Error Handling

If any check fails:
1. Review error message
2. Check for CTE scope issues (unlikely, but verify)
3. Verify country ISO3 codes in `souvera_countries` table
4. Check for unexpected existing data conflicts
5. Re-run verification SQL after fixes

### Verification Schema Fix (2026-05-05)

**Issue Found:** Initial verification SQL referenced `scs.created_at` column which does not exist on `souvera_country_sectors` table.

**Error:**
```
ERROR: 42703: column scs.created_at does not exist
LINE 249: MIN(scs.created_at) AS earliest_row,
```

**Root Cause:**
The `souvera_country_sectors` table does not have a `created_at` column. The table has `updated_at` which is set via `ON CONFLICT DO UPDATE SET updated_at = now()`.

**Fix Applied:**
Replaced `scs.created_at` with `scs.updated_at` in the summary query:
- `MIN(scs.created_at) AS earliest_row` → `MIN(scs.updated_at) AS earliest_updated_at`
- `MAX(scs.created_at) AS latest_row` → `MAX(scs.updated_at) AS latest_updated_at`

**Status:** ✅ Fixed — Verification SQL is now schema-compatible

**Rerun Instructions:**
After executing the seed SQL, rerun the corrected verification file:
```
infra/supabase/verification/phase-4a-stage2-batch-c-southern-africa-verification.sql
```

---

## Browser QA Checklist

### Professional+ Account

Test the following routes with a Professional+, Business, or Institutional account:

**Priority Test Routes:**
```
/intelligence/map?region=africa&selected=BWA (Botswana)
/intelligence/map?region=africa&selected=LSO (Lesotho)
/intelligence/map?region=africa&selected=MOZ (Mozambique)
/intelligence/map?region=africa&selected=ZMB (Zambia)
/intelligence/map?region=africa&selected=ZWE (Zimbabwe)
```

**Expected Behavior:**
- [ ] Digital Infrastructure appears first (display_order: 1)
- [ ] Top 5 sectors visible by default
- [ ] "+2 more sectors" card appears after sector 5
- [ ] Clicking "+2 more sectors" reveals all 7 sectors
- [ ] Tourism & Hospitality accessible as 7th sector
- [ ] Sector accordion expansion works (click to expand rationale)
- [ ] Only one rationale expands at a time
- [ ] CTA remains stable (no layout shift)
- [ ] Panel does not auto-stretch awkwardly
- [ ] No horizontal overflow
- [ ] Content is country-specific (not generic)
- [ ] FDI metric visible (if data present)

### Explorer Account

Test with Explorer (free tier) account:

**Priority Test Routes:**
```
/intelligence/map?region=africa&selected=LSO (Lesotho)
/intelligence/map?region=africa&selected=BWA (Botswana)
```

**Expected Behavior:**
- [ ] 1 sector teaser only (Digital Infrastructure)
- [ ] No rationale visible
- [ ] "+6 more sectors with Professional access" indicator visible
- [ ] FDI remains locked/hidden
- [ ] CTA visible for upgrade

### Additional Tests

**Random Sampling:**
- [ ] Test NAM (Namibia) - Professional+
- [ ] Test SWZ (Eswatini) - Professional+
- [ ] Test MWI (Malawi) - Explorer

**Mobile Responsive:**
- [ ] Test one route on mobile viewport (375px)
- [ ] Verify "+2 more sectors" works on mobile
- [ ] Confirm no horizontal overflow

---

## Known Limitations

### Content Constraints

1. **Smaller markets** (Lesotho, Eswatini) have limited public information, resulting in more conservative scores and general positioning
2. **Economic volatility** (Zimbabwe) shapes content tone and acknowledgment of challenges
3. **Data availability** varies by country, affecting depth of sector-specific references

### Technical Constraints

1. **Scores are estimates** based on public sources and regional comparisons, not proprietary data
2. **No real-time data** - content represents structural positioning, not live metrics
3. **Language is institutional** - not consumer-facing travel or investment promotion

### Expected User Impact

- **Professional+ users** in Batch C countries will now see 7 sectors instead of "Sectors data pending"
- **Explorer users** will see 1 sector teaser (Digital Infrastructure)
- **No impact** on priority 20 countries already covered in Stage 1

---

## Files Created

| File | Location | Size |
|------|----------|------|
| SQL Seed | `infra/supabase/sql-pack-v1.13c-stage2-africa-southern.sql` | 56 rows |
| Verification | `infra/supabase/verification/phase-4a-stage2-batch-c-southern-africa-verification.sql` | 13 checks |
| Documentation | `docs/qa/phase-4a-stage2-batch-c-southern-africa-implementation.md` | This file |

---

## Recommendation for Next Batch

### Batch C Completion Checklist

Before proceeding to next batch:
- [ ] SQL executed successfully in Supabase
- [ ] All 13 verification checks pass
- [ ] Browser QA completed for 5+ Batch C countries
- [ ] No critical issues found
- [ ] Content quality reviewed and approved

### Next Batch: Batch B (Africa East + Central)

**Recommended next:** Batch B (17 countries, 119 rows)

**Rationale:**
- Batch B is the largest batch, establishing content patterns for diverse economies
- East Africa (9) and Central Africa (8) have varied development levels
- Success with Batch B validates approach for remaining batches

**Alternative:** Batch A (Africa North + West, 16 countries, 112 rows) if Batch B content generation is more complex

---

## Success Criteria

| Criterion | Status |
|-----------|--------|
| SQL executed without errors | 🔲 Pending |
| All 13 verification checks pass | 🔲 Pending |
| 56 rows inserted/updated | 🔲 Pending |
| Browser QA shows 7 sectors for Professional+ | 🔲 Pending |
| Explorer sees 1 sector teaser | 🔲 Pending |
| No layout issues or CTA instability | 🔲 Pending |
| Content is country-specific and executive-grade | ✅ Complete |

---

## Final Status

**Batch C is ready for Supabase execution.**

All prerequisites met:
- ✅ SQL seed file created (56 rows)
- ✅ Verification SQL created (13 checks)
- ✅ Documentation complete
- ✅ Content is country-specific and executive-grade
- ✅ ESH excluded from all references
- ✅ Browser QA checklist prepared

**Recommended action:** Execute SQL seed file in Supabase, run verification, perform browser QA, then proceed to Batch B.

---

**END OF BATCH C IMPLEMENTATION GUIDE**
