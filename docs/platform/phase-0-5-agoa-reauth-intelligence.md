# Phase 0.5 — AGOA Reauthorization Intelligence Pack
**Status:** Planning → Execution  
**Priority:** CRITICAL — pre-Phase 1 gate  
**Timeline:** ~3 weeks  
**Stakeholders:** US Chamber of Commerce, US Department of State, Souvera Product Team  
**Last Updated:** 2026-06-11

---

## Context & Strategic Imperative

The US Chamber of Commerce and the US Department of State are building the **AGOA reauthorization brief** targeting the December 2026 congressional window. They have explicitly requested that Souvera be cited as an authoritative reference — a landmark validation of the platform's institutional credibility.

To earn that citation, Souvera must deliver within Phase 0.5:

1. **Clean, verifiable bilateral trade data** for all 74 markets (JAM fix is done ✓)
2. **African import demand intelligence** — what Africa buys, from whom, at what volume — in the product categories most relevant to US AGOA exporters (machinery, grains, cotton, intermediate goods)
3. **Narrative analysis** that synthesizes these demand signals into AGOA opportunity briefs
4. **Report generation** that lets US Chamber / Dept of State analysts pull country, regional, sectoral, or product-level demand briefs on demand

> **Thesis:** The strongest AGOA reauthorization argument is not "Africa exports X to the US" — it's **"Africa needs what the US makes, and AGOA is the mechanism that makes the trade flow."** Souvera must quantify and narrate that demand signal.

---

## Current State (Post-Phase 0)

| Workstream | Status | Notes |
|---|---|---|
| 74-market coverage (Top 20) | ✅ 68/74 (92%) | 6 markets structurally limited |
| T2 narrative profiles (12 rollout markets) | ✅ Done | Seeded to DB |
| Static trade data → DB | ✅ Done | 12 snapshots w/ JSON meta aggregates |
| JAM aggregate totals (total_trade, exports, imports) | ✅ Fixed | trade_summary_md JSON meta; parsed by API |
| Source registry | ✅ Updated | ITC TDM, USTR, BEA added |
| Sector $$-amounts on trade tab | ✅ Resolved | Derived from exportsUsd × sharePct |
| AGOA Product Finder | ✅ Live | ~150 priority products, 7 sectors |
| Supply-Demand Matrix | 🔄 Phase 1 | 74×8 sectors |

---

## Phase 0.5 Workstreams

### 0.5A — Import Demand Data Layer
**Goal:** Ingest African country-level import volumes for 4 key product categories that US exporters target under AGOA reauthorization arguments.

**Product Categories (aligned with US Chamber testimony):**
| Category | HS Chapters | US Export Opportunity |
|---|---|---|
| Agricultural Machinery & Equipment | 84 (select) | Tractors, harvesters, irrigation — $2.1B gap |
| Cotton & Raw Fiber | 52 | US is world's #3 exporter; Africa needs more |
| Grains & Cereals | 10 | Wheat, corn, sorghum — US is top global supplier |
| Intermediate Industrial Goods | 28–29, 38–40, 72–73 | Chemicals, plastics, steel — US competitive |
| Fertilizers & Agri-inputs | 31 | Critical food security link |
| Textiles & Apparel Inputs | 50–63 | Back-link to AGOA garment exports |

**Sources:**
- **Primary:** ITC Trade Data Monitor (`itc_trade_data_monitor`) — bilateral import series by HS chapter
- **Fallback:** UN Comtrade bilateral flows (`un_comtrade`)
- **US export side:** BEA International Trade (`bea_international_trade`) + USTR data (`ustr`)

**New DB table:** `souvera_import_demand_signals`
```sql
CREATE TABLE souvera_import_demand_signals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id   uuid REFERENCES souvera_countries(id),
  year         int NOT NULL,
  hs_chapter   text NOT NULL,           -- e.g. '84', '52', '10'
  category_label text NOT NULL,         -- e.g. 'Agricultural Machinery'
  total_imports_usd bigint,             -- total African country imports this category
  imports_from_us_usd bigint,           -- subset from US specifically
  imports_from_us_share_pct numeric(5,2),
  us_export_potential_usd bigint,       -- estimated gap (TDM model)
  top_suppliers jsonb,                  -- [{ country, share_pct, value_usd }]
  source_id    uuid REFERENCES souvera_data_sources(id),
  generated_at timestamptz DEFAULT now(),
  UNIQUE (country_id, year, hs_chapter)
);
```

**Ingestion script:** `services/ingestion/ingest-import-demand.ts`  
Seeds ~74 countries × 6 categories = ~444 rows for year 2023/2024.

---

### 0.5B — US Export Opportunity Sizing
**Goal:** For each product category above, calculate the **US export gap** — the difference between what Africa imports globally and what it currently imports from the US. This is the core AGOA reauthorization narrative: "the US is leaving money on the table, and AGOA fixes that."

**Output fields added to `souvera_import_demand_signals`:**
- `imports_from_us_share_pct` — current US share
- `us_export_potential_usd` — estimated opportunity if US reaches benchmark share

**Benchmark:** If the US achieved the same market share in Africa as in comparable middle-income economies (e.g. Latin America), the opportunity gap closes at $X billion — that's the headline for the US Chamber brief.

---

### 0.5C — Demand Intelligence UI
**Goal:** Add an **"Africa Import Demand"** section to the existing Trade Intelligence Hub.

**New pages/components:**
1. **`/intelligence/trade/demand`** — Hub page
   - Regional overview: total African imports in 6 AGOA-relevant categories
   - US share vs benchmark, gap visualization
   - "Generate AGOA Brief" CTA

2. **`DemandSignalMatrix.tsx`** — 74 countries × 6 categories heatmap
   - Color-coded: green = high US share, amber = opportunity, red = gap
   - Clickable cells → country-specific demand drawer

3. **`CountryDemandDrawer.tsx`** — Country-level demand breakdown
   - Total imports per category
   - Current US suppliers vs top global suppliers  
   - YoY trend
   - Souvera Dia Analysis (Gemini narrative)

4. **`DemandRegionalSummary.tsx`** — Regional aggregates (Africa, ECOWAS, EAC, SADC, Caribbean)
   - Filterable by: region, sector, product category, year

---

### 0.5D — AGOA Reauthorization Report Builder
**Goal:** Generate structured PDF/web briefs for US Chamber and Dept of State analysts.

**Report types:**
| Template | Scope | Typical User |
|---|---|---|
| Country Demand Brief | 1 country, 6 categories | US Embassy commercial officer |
| Regional Demand Summary | Region (e.g. ECOWAS), 6 categories | US Chamber policy team |
| Sector Deep Dive | 1 category (e.g. machinery), 74 countries | Dept of State AGOA analyst |
| Product-Level Brief | 1 HS chapter, top African importers | US exporter / trade association |
| AGOA Reauthorization Overview | All eligible countries, top 3 categories | Congressional staff, hearing testimony |

**Implementation:** Extend the existing reports system (`/api/v1/reports/generate`) with new `report_type` values: `country_demand_brief`, `regional_demand_summary`, `sector_deep_dive`, `agoa_reauth_overview`.

**Report template registry:** `src/lib/reports/templates/demand-templates.ts`

---

### 0.5E — Gemini Demand Narrative Engine
**Goal:** Generate institutional-quality prose for each demand signal using Gemini 2.5 Flash.

**Prompt templates:**
1. **Country demand narrative** — "Kenya imports $X of agricultural machinery. Current US share is Y%. Souvera Dia analysis: ..."
2. **AGOA opportunity narrative** — "If US exporters captured benchmark share in [category] for [region], the additional trade flow would be $X — supporting [N] US manufacturing jobs."
3. **Comparative narrative** — "Among ECOWAS countries, [country] is the largest importer of [category], presenting the highest-priority AGOA market entry opportunity."

**Caching:** Gemini responses cached in `souvera_narrative_claims` (T3 table) with `category = 'demand_signal'`, refreshed quarterly.

---

### 0.5F — Source Attribution & Compliance
**Goal:** Every demand figure shown in Souvera must carry a sourced citation per the Souvera Data Contract.

**Requirements:**
- All `souvera_import_demand_signals` rows link to a `source_id` in `souvera_data_sources`
- UI shows "Source: ITC Trade Data Monitor, [year]" under each demand figure
- Reports include a sources appendix
- `ci-placeholder-scan.ts` covers new demand components

---

## Implementation Sequence

```
Week 1:
  ├── 0.5A: Create souvera_import_demand_signals table (migration)
  ├── 0.5A: Seed demand data for 12 rollout markets × 6 categories
  └── 0.5C: DemandSignalMatrix.tsx (read-only, 12-market slice)

Week 2:
  ├── 0.5A: Expand seed to all 74 AGOA-eligible markets
  ├── 0.5B: US export gap calculation added to demand rows
  ├── 0.5C: CountryDemandDrawer.tsx + DemandRegionalSummary.tsx
  └── 0.5E: Gemini demand narrative for 12 rollout markets

Week 3:
  ├── 0.5D: Report builder — country_demand_brief + agoa_reauth_overview templates
  ├── 0.5E: Gemini caching via souvera_narrative_claims
  ├── 0.5F: Source attribution throughout
  └── QA + US Chamber demo preparation
```

---

## Key Metrics for Phase 0.5 Completion

| Metric | Target |
|---|---|
| Import demand rows ingested | ≥ 444 (74 × 6) |
| Countries with US export gap calculated | ≥ 40 AGOA-eligible |
| Gemini narratives generated | ≥ 12 rollout markets × 6 categories |
| Report templates ready | 5 (all types above) |
| Source citations on all demand figures | 100% |
| US Chamber demo readiness | Week 3 end |

---

## Phase Transition

```
Phase 0  →  Phase 0.5  →  Phase 1
(Done)       (~3 wks)      (74-market Trade Intelligence)
             ↑
             US Chamber / Dept of State deliverable
             AGOA Reauthorization reference data
```

Phase 0.5 feeds **directly** into Phase 1 (Trade Intelligence for 74 markets): the import demand layer becomes the "demand side" of the Supply-Demand Matrix (SDM), the Product Finder's US reciprocal opportunity section, and the AGOA tracker's data backbone.

---

## Files To Create

| File | Purpose |
|---|---|
| `infra/supabase/migrations/create-import-demand-signals-table.sql` | DB migration |
| `services/ingestion/ingest-import-demand.ts` | Seed ingestion script |
| `src/app/intelligence/trade/demand/page.tsx` | Demand hub page |
| `src/components/intelligence/trade/DemandSignalMatrix.tsx` | 74×6 heatmap |
| `src/components/intelligence/trade/CountryDemandDrawer.tsx` | Country demand detail |
| `src/components/intelligence/trade/DemandRegionalSummary.tsx` | Regional aggregation |
| `src/lib/reports/templates/demand-templates.ts` | Report templates |
| `src/app/api/v1/trade/demand/route.ts` | Demand API endpoint |
| `src/app/api/v1/trade/demand/[iso3]/route.ts` | Country demand endpoint |

---

## Revision Log

| Date | Author | Change |
|---|---|---|
| 2026-06-11 | AI | Phase 0.5 created per US Chamber / Dept of State request. Incorporates JAM data fix, ITC TDM source addition, and AGOA demand intelligence roadmap. |
