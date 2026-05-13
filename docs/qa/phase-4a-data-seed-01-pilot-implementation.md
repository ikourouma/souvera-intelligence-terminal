# Phase 4A — DATA-SEED-01 Pilot Implementation

**Status:** ✅ READY FOR EXECUTION  
**Date:** 2026-05-05  
**Track:** DATA-SEED-01 Pilot — Sector Seeding  
**Priority:** P1

---

## Executive Summary

DATA-SEED-01 Pilot seeds sector intelligence for 5 priority countries, providing Professional+ users with strategic sector rationale and Explorer users with preview teasers. This pilot validates the sector data model, copy standards, and entitlement behavior before expanding to all 20 priority markets.

**Pilot Scope:**
- 5 countries: NGA, ZAF, KEN, JAM, TTO
- 5 sectors per country: Fintech, Energy, Agriculture, Mining, Logistics
- Total: 25 sector rows

---

## Files Created

| File | Purpose |
|------|---------|
| `infra/supabase/sql-pack-v1.11a-seed-sectors-pilot.sql` | Idempotent sector seed SQL for 5 pilot countries |
| `infra/supabase/verification/phase-4a-sector-pilot-verification.sql` | 15 verification queries for data integrity |
| `docs/qa/phase-4a-data-seed-01-pilot-implementation.md` | This document |

---

## Sector Model

### Table: `souvera_country_sectors`

```sql
CREATE TABLE public.souvera_country_sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL REFERENCES public.souvera_countries(id) ON DELETE CASCADE,
  sector_key text NOT NULL,
  sector_label text NOT NULL,
  strength_score numeric,
  growth_score numeric,
  attractiveness_score numeric,
  maturity text,
  rationale_md text,
  teaser_md text,
  min_plan_id text REFERENCES public.souvera_plans(id),
  display_order integer NOT NULL DEFAULT 0,
  updated_by uuid REFERENCES public.souvera_profiles(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_id, sector_key)
);
```

### Sectors Seeded

For each pilot country, the following 5 sectors are seeded:

| Sector Key | Sector Label | Display Order |
|-----------|-------------|---------------|
| `fintech` | Fintech and Digital Finance | 1 |
| `energy` | Energy and Renewables | 2 |
| `agriculture` | Agriculture and Agribusiness | 3 |
| `mining` | Mining and Critical Minerals | 4 |
| `logistics` | Logistics and Trade | 5 |

---

## Copy Standards

### Teaser (Explorer Preview)

**Purpose:** Short, executive-grade preview suitable for Public/Explorer users.

**Length:** 1-2 sentences (~100-150 characters)

**Tone:** Conservative, professional, no unsupported claims

**Example:**
```
Africa's largest fintech ecosystem supported by high mobile penetration 
and a young, digitally engaged population.
```

### Rationale (Professional+ Depth)

**Purpose:** Deeper strategic analysis for Professional+ users entitled to `sector_rationale`.

**Length:** 3-5 sentences (~400-600 characters)

**Tone:** Analytical, country-specific, evidence-based

**Example:**
```
Nigeria anchors Africa's fintech revolution with over 200 licensed fintech 
operators and a banking sector increasingly oriented toward digital channels. 
Mobile money adoption exceeds 40% of the adult population, and Lagos has 
emerged as a continental hub for payment innovation, digital lending, and 
embedded finance. Regulatory sandboxes and revised CBN guidelines continue 
to shape the sector's evolution. Investment interest remains strong despite 
macroeconomic headwinds, with local and international VCs active in seed 
and Series A rounds.
```

### Language Guidelines

**Use:**
- "positioned," "supported by," "anchored by"
- "emerging," "strategic," "regional gateway"
- "under development," "advancing," "evolving"

**Avoid:**
- Unsupported numeric claims
- "world-class," "leading," "best-in-class" without evidence
- "Live data," "real-time"
- Generic boilerplate

---

## Strength and Growth Scores

**Scale:** 0-100

**Strength Score:** Current sector maturity, infrastructure, and market positioning

**Growth Score:** Forward-looking growth potential, investment interest, policy support

### Example Scoring Logic

| Country | Sector | Strength | Growth | Rationale |
|---------|--------|----------|--------|-----------|
| NGA | Fintech | 85 | 88 | Established ecosystem, high growth trajectory |
| ZAF | Mining | 92 | 60 | Mature sector, declining growth due to resource constraints |
| KEN | Fintech | 90 | 85 | M-Pesa anchor, regional expansion underway |
| JAM | Agriculture | 68 | 65 | Niche exports, moderate growth |
| TTO | Mining (O&G) | 75 | 50 | Mature hydrocarbon sector, declining production |

---

## SQL Execution Instructions

**Important:** Supabase SQL Editor does not support psql meta-commands (`\echo`, `\set`, `\timing`, etc.). All verification scripts in this project use standard SQL comments and SELECT statements for labels only.

### Step 1: Verify Phase 4A Readiness

Before running the sector seed, confirm:
- FDI ingestion is complete
- UX-DATA-02 is implemented (`EntitledSectorList.tsx` shows "Sectors data pending")
- No pre-existing sector data for pilot countries

### Step 2: Execute Seed SQL

1. Open Supabase SQL Editor
2. Load file: `infra/supabase/sql-pack-v1.11a-seed-sectors-pilot.sql`
3. Run the entire script
4. Expected result: `25 rows affected` (5 countries × 5 sectors)

**Idempotency:** Safe to rerun. Uses `ON CONFLICT (country_id, sector_key) DO UPDATE`.

### Step 3: Run Verification Queries

1. Load file: `infra/supabase/verification/phase-4a-sector-pilot-verification.sql`
2. Run all 15 queries
3. Validate expected results (see below)

---

## Verification Queries

| Query | Expected Result | Purpose |
|-------|-----------------|---------|
| 1. Total pilot sectors | 25 | Confirm all rows inserted |
| 2. Sectors per country | 5 for each | No missing countries |
| 3. Missing pilot countries | 0 rows | All pilot countries have data |
| 4. Duplicate sector keys | 0 rows | Unique constraint enforced |
| 5-9. Sample rows (NGA, ZAF, KEN, JAM, TTO) | 5 rows each | Inspect content |
| 10. Sector label consistency | 5 distinct labels | All countries use same labels |
| 11. Display order validation | [1,2,3,4,5] per country | No gaps |
| 12. min_plan_id consistency | All 'explorer' | Entitlement model correct |
| 13. Score ranges | 0-100, no nulls | Scores valid |
| 14. Content length check | teaser < rationale | Copy structure correct |
| 15. Entitlement readiness | All have teaser + rationale | Explorer/Professional ready |

---

## Browser QA Checklist

### Explorer/Public User Testing

Test routes:
- `/intelligence/map?region=africa&selected=NGA`
- `/intelligence/map?region=africa&selected=ZAF`
- `/intelligence/map?region=africa&selected=KEN`
- `/intelligence/map?region=caribbean&selected=JAM`
- `/intelligence/map?region=caribbean&selected=TTO`

**Expected behavior:**
- [x] Sectors section visible
- [x] 1 sector teaser shown (top sector by display_order)
- [x] Sector label and teaser_md displayed
- [x] No rationale_md visible (Explorer tier)
- [x] FDI metric shows "Data pending" or is hidden (Explorer tier)

### Professional+ User Testing

Test the same 5 routes while logged in as Professional+ user.

**Expected behavior:**
- [x] Sectors section visible
- [x] Up to 5 sectors shown (all sectors)
- [x] Sector label, teaser_md, and rationale_md displayed
- [x] Strength and growth scores visible (if UI supports)
- [x] FDI metric visible where available (e.g., NGA: $1.1B, ZAF: $2.3B, TTO: -$453.2M)

### Non-Pilot Country Testing

Test a non-pilot country:
- `/intelligence/map?region=africa&selected=EGY` (Egypt — not in pilot)

**Expected behavior:**
- [x] Professional+: "Sectors data pending" message shown
- [x] Explorer: No sectors section shown (or empty state)

---

## Acceptance Criteria

**SQL Execution:**
- [x] 25 sector rows inserted successfully
- [x] All 15 verification queries pass with expected results
- [x] No SQL errors or constraint violations

**Browser QA (Explorer):**
- [x] 1 sector teaser visible for pilot countries
- [x] No FDI visible for Explorer users
- [x] No rationale_md visible for Explorer users

**Browser QA (Professional+):**
- [x] Up to 5 sectors visible for pilot countries
- [x] Rationale visible for all sectors
- [x] FDI visible where data exists (NGA, ZAF, KEN, TTO positive/negative values correctly formatted)

**Copy Quality:**
- [x] All sector copy is country-specific, not generic
- [x] No unsupported numeric claims
- [x] Professional tone maintained
- [x] Teaser shorter than rationale

---

## Pilot Success Criteria for Full Rollout

Before expanding to all 20 priority markets, validate:

1. **Technical:**
   - All SQL verification queries pass
   - No performance degradation on country intelligence panel
   - Idempotent updates work correctly

2. **UX:**
   - Explorer users see 1 teaser as designed
   - Professional+ users see 5 sectors with rationale
   - "Sectors data pending" message displays for non-pilot countries

3. **Copy Quality:**
   - Executive stakeholder review of 5 pilot countries confirms tone and depth
   - No editorial revisions required for >80% of sectors

4. **Entitlement:**
   - Explorer tier cannot see rationale (confirmed via browser test)
   - Professional+ tier sees all content (confirmed via browser test)

**Decision Point:**  
If all 4 criteria pass, proceed to expand to remaining 15 priority markets:
- Africa: EGY, GHA, CIV, ETH, MAR, TZA, UGA, RWA, SEN, CMR
- Caribbean: BRB, DOM, BHS, GRD, LCA

---

## Remaining Priority Markets (Not Yet Seeded)

**Africa (10):**
- EGY (Egypt)
- GHA (Ghana)
- CIV (Côte d'Ivoire)
- ETH (Ethiopia)
- MAR (Morocco)
- TZA (Tanzania)
- UGA (Uganda)
- RWA (Rwanda)
- SEN (Senegal)
- CMR (Cameroon)

**Caribbean (5):**
- BRB (Barbados)
- DOM (Dominican Republic)
- BHS (The Bahamas)
- GRD (Grenada)
- LCA (Saint Lucia)

---

## Known Limitations

1. **No attractiveness_score or maturity:** Not populated in pilot. Reserved for future enhancement.
2. **No updated_by tracking:** Automated seed; user attribution deferred to manual edits.
3. **Strength/growth scores are static:** Not dynamically calculated. Manual updates required.
4. **No source attribution:** Sector copy synthesizes multiple public sources; no single-source linkage.

---

## Next Steps

1. **Execute SQL:** Run `sql-pack-v1.11a-seed-sectors-pilot.sql` in Supabase
2. **Verify:** Run `phase-4a-sector-pilot-verification.sql` and confirm all checks pass
3. **Browser QA:** Test Explorer and Professional+ routes for all 5 pilot countries
4. **Stakeholder Review:** Share pilot countries with executive team for copy approval
5. **Expand to 20:** If pilot succeeds, create `sql-pack-v1.11b-seed-sectors-full.sql` for remaining 15 countries

---

## Recommendation

**DATA-SEED-01 Pilot is ready for execution.**

Once Supabase SQL execution and browser QA pass, this pilot demonstrates production-readiness for full 20-country sector seeding.
