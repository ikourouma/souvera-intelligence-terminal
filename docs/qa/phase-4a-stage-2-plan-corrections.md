# Phase 4A Stage 2 Plan Corrections Summary

**Date:** 2026-05-05  
**Status:** ✅ CORRECTED  
**Document Updated:** `docs/execution/phase-4a-stage-2-all-74-sector-coverage-plan.md`

---

## Issues Corrected

### Issue 1: ESH / Western Sahara Incorrectly Included

**Problem:** The original plan included ESH (Western Sahara) in Batch A, which would have expanded Africa coverage to 55 countries instead of the canonical 54.

**Root Cause:** ESH was inadvertently included from the seed file list without considering Souvera's locked market scope.

**Correction:** ESH has been removed from all Stage 2 references.

**Rationale Added:**
> "ESH / Western Sahara is excluded from current public Souvera scope to preserve the canonical 54-country Africa market count. It may be revisited later under a special markets / territories classification."

---

### Issue 2: Batch B Country Count Inconsistency

**Problem:** Batch B was labeled "16 countries, 112 rows" but the country list contained 17 countries:
- East Africa (9): BDI, COM, DJI, ERI, MDG, MUS, SYC, SOM, SSD
- Central Africa (8): AGO, CAF, TCD, COG, COD, GNQ, GAB, STP

**Root Cause:** Mathematical error in batch planning.

**Correction:** Batch B count updated to reflect accurate count of 17 countries, 119 rows.

---

## Corrected Batch Structure

| Batch | Region | Countries | Sectors | Rows | File Name |
|-------|--------|-----------|---------|------|-----------|
| **A** | Africa — North + West | **16** | 7 | **112** | `sql-pack-v1.13a-stage2-africa-north-west.sql` |
| **B** | Africa — East + Central | **17** | 7 | **119** | `sql-pack-v1.13b-stage2-africa-east-central.sql` |
| **C** | Africa — Southern | 8 | 7 | 56 | `sql-pack-v1.13c-stage2-africa-southern.sql` |
| **D** | Caribbean Remaining | 13 | 7 | 91 | `sql-pack-v1.13d-stage2-caribbean.sql` |
| **Total** | | **54** | | **378** | |

---

## Corrected Country Lists

### Batch A: Africa — North + West (16 countries, 112 rows)

**North Africa (4):**
- DZA (Algeria)
- LBY (Libya)
- SDN (Sudan)
- TUN (Tunisia)

**❌ REMOVED:** ESH (Western Sahara)

**West Africa (12):**
- BEN (Benin)
- BFA (Burkina Faso)
- CPV (Cabo Verde)
- GMB (Gambia)
- GIN (Guinea)
- GNB (Guinea-Bissau)
- LBR (Liberia)
- MLI (Mali)
- MRT (Mauritania)
- NER (Niger)
- SLE (Sierra Leone)
- TGO (Togo)

### Batch B: Africa — East + Central (17 countries, 119 rows)

**East Africa (9):**
- BDI (Burundi)
- COM (Comoros)
- DJI (Djibouti)
- ERI (Eritrea)
- MDG (Madagascar)
- MUS (Mauritius)
- SYC (Seychelles)
- SOM (Somalia)
- SSD (South Sudan)

**Central Africa (8):**
- AGO (Angola)
- CAF (Central African Republic)
- TCD (Chad)
- COG (Congo - Brazzaville)
- COD (DR Congo - Kinshasa)
- GNQ (Equatorial Guinea)
- GAB (Gabon)
- STP (São Tomé and Príncipe)

### Batch C: Africa — Southern (8 countries, 56 rows)

**Southern Africa (8):**
- BWA (Botswana)
- SWZ (Eswatini)
- LSO (Lesotho)
- MWI (Malawi)
- MOZ (Mozambique)
- NAM (Namibia)
- ZMB (Zambia)
- ZWE (Zimbabwe)

### Batch D: Caribbean Remaining (13 countries, 91 rows)

**Caribbean (13):**
- ATG (Antigua and Barbuda)
- CUB (Cuba)
- DMA (Dominica)
- HTI (Haiti)
- KNA (Saint Kitts and Nevis)
- VCT (Saint Vincent and the Grenadines)
- SUR (Suriname)
- GUY (Guyana)
- BLZ (Belize)
- PRI (Puerto Rico)
- VGB (British Virgin Islands)
- TCA (Turks and Caicos Islands)
- CYM (Cayman Islands)

---

## Corrected Row Counts

| Metric | Value |
|--------|-------|
| Priority 20 countries (Stage 1 complete) | 140 rows |
| Remaining 54 countries (Stage 2 scope) | 378 rows |
| **Total** | **518 rows** |
| **Africa total** | **54 countries** (excluding ESH) |
| **Caribbean total** | **20 countries** |
| **All Regions total** | **74 countries** |

---

## Updated Verification Requirements

Added 3 new verification checks to explicitly confirm ESH exclusion:

| Check | Query | Expected |
|-------|-------|----------|
| 18 | Africa country count with sectors | 54 (excluding ESH) |
| 19 | Caribbean country count with sectors | 20 |
| 20 | ESH / Western Sahara sector rows | 0 (must be excluded) |

**Total verification checks:** 20 (was 17)

### New SQL Verification Checks

```sql
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

## Updated Implementation Sequence

### Phase 2: Content Generation (Updated)

4. [ ] Generate Batch A content (North + West Africa, **16 countries**, **excluding ESH**)
5. [ ] Generate Batch B content (East + Central Africa, **17 countries**)
6. [ ] Generate Batch C content (Southern Africa, 8 countries)
7. [ ] Generate Batch D content (Caribbean, 13 countries)
8. [ ] Content review and quality check

### Phase 3: SQL Execution (Updated)

9. [ ] Execute Batch A: `sql-pack-v1.13a-stage2-africa-north-west.sql`
10. [ ] Verify Batch A (**112 new rows**)
11. [ ] Execute Batch B: `sql-pack-v1.13b-stage2-africa-east-central.sql`
12. [ ] Verify Batch B (**119 new rows**)
13. [ ] Execute Batch C: `sql-pack-v1.13c-stage2-africa-southern.sql`
14. [ ] Verify Batch C (56 new rows)
15. [ ] Execute Batch D: `sql-pack-v1.13d-stage2-caribbean.sql`
16. [ ] Verify Batch D (91 new rows)

---

## Updated Recommended Execution Order

**Revised order based on corrected batch sizes:**

1. **Batch B (Africa East + Central)** — largest batch (17 countries, 119 rows), establishes content pattern
2. **Batch A (Africa North + West)** — second largest (16 countries, 112 rows), excludes ESH
3. **Batch D (Caribbean)** — medium batch (13 countries, 91 rows), validates cross-region approach
4. **Batch C (Africa Southern)** — smallest batch (8 countries, 56 rows), completes coverage

---

## Mathematical Verification

### Before Correction (INCORRECT)

- Batch A: 17 countries (5 North including ESH + 12 West) × 7 = 119 rows
- Batch B: 16 countries × 7 = 112 rows (but list showed 17 countries)
- Batch C: 8 countries × 7 = 56 rows
- Batch D: 13 countries × 7 = 91 rows
- **Total: 54 countries × 7 = 378 rows** (correct by coincidence, but batches were wrong)

### After Correction (CORRECT)

- Batch A: **16 countries** (4 North **excluding ESH** + 12 West) × 7 = **112 rows**
- Batch B: **17 countries** (9 East + 8 Central) × 7 = **119 rows**
- Batch C: 8 countries × 7 = 56 rows
- Batch D: 13 countries × 7 = 91 rows
- **Total: 54 countries × 7 = 378 rows** ✅

**Combined with Stage 1:** 140 rows (priority 20) + 378 rows (remaining 54) = **518 total rows**

---

## ESH Exclusion Notes Added

### Location 1: Remaining Countries Section

Added prominent note:
> **IMPORTANT NOTE:** ESH / Western Sahara is excluded from current public Souvera scope to preserve the canonical 54-country Africa market count. It may be revisited later under a special markets / territories classification.

### Location 2: Batch Strategy Section

Added reminder after batch table:
> **IMPORTANT:** ESH / Western Sahara is excluded from all batches to preserve the canonical 54-country Africa scope.

### Location 3: Summary Section

Added explicit note:
> **ESH Exclusion:** Western Sahara (ESH) is explicitly excluded from Stage 2 to preserve the canonical 54-country Africa market scope.

### Location 4: Content Quality Risk

Updated example markets:
- **Before:** "e.g., Western Sahara, São Tomé and Príncipe, Comoros"
- **After:** "e.g., São Tomé and Príncipe, Comoros, Seychelles"

---

## Confirmation Checklist

- [x] ESH removed from North Africa country list
- [x] ESH removed from all Stage 2 references
- [x] Batch A count corrected: 16 countries, 112 rows
- [x] Batch B count corrected: 17 countries, 119 rows
- [x] Batch C count unchanged: 8 countries, 56 rows
- [x] Batch D count unchanged: 13 countries, 91 rows
- [x] Total remaining countries confirmed: 54
- [x] Total new rows confirmed: 378
- [x] Final total confirmed: 518 rows across 74 countries
- [x] Africa count confirmed: 54 (excluding ESH)
- [x] Caribbean count confirmed: 20
- [x] Verification checks updated to 20 (added 3 ESH-related checks)
- [x] Implementation sequence updated with corrected row counts
- [x] Recommended execution order updated to reflect largest batch (B) first
- [x] Explicit ESH exclusion notes added in 4 locations
- [x] SQL verification template updated with ESH exclusion checks

---

## Recommendation

**✅ STAGE 2 PLAN CORRECTED AND READY FOR IMPLEMENTATION**

All market scope inconsistencies have been resolved. The plan now correctly reflects:
- 54 African countries (excluding ESH)
- 20 Caribbean countries
- 74 total Souvera markets
- 378 new sector rows for Stage 2
- 518 total sector rows post-Stage 2

**ESH (Western Sahara) is definitively excluded** from Stage 2 to preserve the canonical 54-country Africa market count.

Stage 2 implementation can proceed with content generation for the 4 corrected batch files.

---

**END OF CORRECTIONS SUMMARY**
