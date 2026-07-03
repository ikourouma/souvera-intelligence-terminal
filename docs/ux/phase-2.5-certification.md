# Phase 2.5 Certification — Sovereign Trade Accuracy & Census Pipeline

**Date:** 2026-06-28 (last updated)  
**Scope:** 74 markets (54 Africa + 20 Caribbean) + AfCETA corridor index (416 signals)  
**Status:** Sign-off in progress — core gates green; AfCETA Task 14/14b complete; one checklist item remains (Reports tab decision)  
**Traction pages audit:** [`docs/audits/traction-pages-fortune5-stress-test.md`](../audits/traction-pages-fortune5-stress-test.md) — `/platform` + `/intelligence` Fortune-5 stress test (TRACT-F5 backlog)

## Audit results (2026-06-29 run)

| Audit | Result |
|-------|--------|
| `audit-trade-taxonomy.ts` | ✅ PASS — 20/20 Caribbean CBI |
| `audit-tab-hardcoded-figures.ts` | ✅ PASS — 0 bare `$` in content routers |
| `audit-trade-intelligence-coverage.ts` | ✅ PASS — 540 AGOA + 864 AfCFTA + 320 CBTPA + 740 Demand + 592 SDM (74×8) |
| `audit-data-provenance.ts` | ✅ PASS — 0 orphan sources (curated_zwe registered) |
| `audit-data-consistency.ts` | ✅ 68/74 headline complete; 6 structural gap markets documented |
| `audit-trade-snapshot-consistency.ts` | ✅ PASS — 0 math mismatches across 74 markets (post Census meta reconcile) |
| `audit-trade-source-reconciliation.ts` | ℹ️ Divergence report — Census vs USITC category flows (>5% flagged; COD documented) |
| `audit-ti-cross-module-consistency.ts` | ✅ PASS — 0 failures; 25 informational warnings (sector sum vs Census overlap expected) |
| `audit-sdm-data-consistency.ts` | ✅ PASS — 592/592 cells; 275 flow-backed export products; 323 template-backed |
| `spot-check-phase25-guy-jam.ts` | ✅ PASS — 12/12 (CBI labels, snapshot math, petroleum footnote) |
| `spot-check-phase25-cod-eri.ts` | ✅ PASS — 15/15 (dual-source COD, ineligible ERI, USTR ref seeded) |
| `audit-afceta-corridor-consistency.ts` | ✅ PASS — 416 signals; 20 spotlights; 208×2 directions (2026-06-28) |

## Completed in this phase

### Task 1 — AGOA/CBI taxonomy
- `getCountryRegion()` uses canonical `isApprovedCaribbeanMarket()` + `APPROVED_AFRICA_ISO3`
- Caribbean Demand Matrix navigation points to CBTPA (not AGOA)

### Task 2 — Hallucination purge
- Country API: no 65% AGOA share fallback; no `tariffSavings * 2`
- Trade hub: preference-margin narratives removed
- **Content routers:** all 23 bare `$` fallbacks removed from Overview, Opportunity, Risk copy

### Task 7 — Provenance & null states
- `DataPendingState` wired into Trade, Economy, Risk tabs
- Shared `load-env-local.ts` for audit scripts against free-form `.env.local`

### Tasks 3–4 — Source registry + Census adapter
- `us_census_trade` / `usitc_hts` in registry + docs §4.2
- `census_ftp.ts` — API-first (`GEN_VAL_YR` imports, `ALL_VAL_YR` exports)
- Key parser handles numbered `.env.local` notes format

### Task 8 — Petroleum exclusion transparency (AGOA + CBI)
- **Policy module:** `preferential-trade-policy.ts` — single source for HTS Ch. 27 exclusion
- **UI:** `PetroleumExclusionFootnote` on Trade tab (U.S. Relationship + preferential card) and Sectors tab
- **Narratives:** Overview market-access copy, trade regional agreements, Souvera Analysis footers
- **Metrics rule:** Census bilateral totals = all goods (MFN); preferential sums exclude `petroleum` category group
- **Data fix:** Corrected Gabon petroleum context in `agoa-priority-products.ts` (was incorrectly claiming AGOA duty-free on crude)

### Task 9 — Dual-source trade reconciliation (COD + 74-market audit)
- **Module:** `trade-source-reconciliation.ts` — compares Census bilateral vs USITC category-flow totals
- **Country API:** `sourceReconciliation` on Trade payload when sources diverge >5%; Census provenance on `exportsToUs`/`importsFromUs`; AGOA `totalExportsToUsUsd` from category flows only (no Census fallback)
- **UI:** `TradeSourceReconciliationBanner` + `TradeMetricSourceLabel` on Trade tab
- **Audit:** `audit-trade-source-reconciliation.ts` — flags all markets with material divergence; COD gap (~$105M / ~32%) documented as methodology difference, not error

### Task 10 — SDM petroleum filter scaffolding
- **Module:** `sdm-petroleum-filter.ts` — annotates `energy_power` cells with `preferential_excluded`
- **API:** `exclude_petroleum=true` query param on `/api/v1/intelligence/supply-demand`
- **UI:** Filter toggle "Hide petroleum (HTS Ch. 27)", amber ring on excluded cells, `PreferentialExcludedBadge` in cell drawer
- **Sector copy:** `energy_power` narrative notes Ch. 27 exclusion from AGOA/CBI preferences

### Task 11 — USTR Africa trade summary leverage
- **Phase A:** `OfficialTradeReferences` on Trade tab; USTR regional policy context in `us-trade-card-analysis.ts`
- **Phase B:** `parse-ustr-country-trade-page.ts` + `parse:ustr:africa_country_summaries` ingestion → `souvera_ustr_trade_summaries`
- **UI:** `UstrTradeSummaryPanel` collapsible tertiary card on Trade tab (Africa only)
- **Audit:** `audit-ustr-vs-census.ts` — USTR imports-from-country vs Census exports-to-U.S.
- **Tracker:** Tier-A flow rows disable hardcoded `agoa-country-trade-data` fallback

### Task 12 — Supply-Demand Matrix data clarity (74 markets × 592 cells)
- **Field semantics:** `export_volume_usd` = country export capacity (all destinations); `current_trade_usd` = bilateral exports to U.S. in sector; `us_import_volume_usd` = U.S. sector import total (same across all 74 countries in sector)
- **Export products:** Always **3 country-specific lines** per cell via `sdm-country-export-profiles.ts`; dollar values from USITC/CBTPA flow totals or sector capacity (KEN ≠ SEN agriculture names)
- **Country import volume:** `attachSdmCountryImportVolume()` — sector-scoped U.S. → country imports on executive summary (key product in parentheses)
- **Import Needs (reverse flow):** score + country import $ when available; no fabricated percentages of U.S. sector totals
- **UI:** scope labels on drawer metrics; bidirectional executive summary; Caribbean CBI/CBTPA reciprocity (not AGOA)
- **Modules:** `sdm-category-map.ts`, `sdm-export-products.ts`, `sdm-sector-products.ts`, updated `SupplyDemandCellDrawer.tsx`
- **Audits:** `audit-sdm-data-consistency.ts`, `audit-ti-cross-module-consistency.ts`

### Task 13 — COD/ERI spot-check gate + curated USTR links
- **USTR seed:** `seed-curated-ustr-africa-links.ts` — curated Africa directory links (COD, KEN, ZAF; USTR scrape lists ~15 flat slugs)
- **Spot-check:** `spot-check-phase25-cod-eri.ts` — 15/15 PASS (dual-source reconciliation, minerals AGOA-eligible, petroleum excluded, ERI ineligible framing)

## Sign-off checklist

- [x] Taxonomy audit green (20/20 Caribbean)
- [x] Tab hardcoded-figures audit green (0 bare `$`)
- [x] Census adapter completes via **API path**
- [x] Data consistency audit refreshed (`docs/ux/data-consistency-audit-findings.md`)
- [x] Expand `census_code` crosswalk to **74/74**
- [x] Add `curated_zwe` to source registry
- [x] IMF WEO estimate badges on Economy + Overview
- [x] Trade snapshot math audit green (74/74)
- [x] Caribbean CBI narratives (no AGOA bleed)
- [x] Census meta reconcile (73 rows cleaned)
- [x] Petroleum exclusion footnotes + policy module (Task 8)
- [x] Reconcile COD Census bilateral ($218M) vs USITC AGOA category sum ($323M) — dual-source banner + source labels
- [x] SDM petroleum filter scaffolding — `exclude_petroleum` API param, Energy & Power badge, filter toggle
- [x] USTR Africa leverage — Trade tab links, tertiary summary panel, ingestion job + audit
- [x] Trade Intelligence matrix coverage — all 74 markets × module cells (AGOA, AfCFTA, CBTPA, Demand, SDM)
- [x] SDM data clarity — scope labels, flow-backed export products, import-needs score-only (reverse flow)
- [x] Cross-module TI audit green (`audit-ti-cross-module-consistency.ts`)
- [x] SDM consistency audit green (`audit-sdm-data-consistency.ts`)
- [x] Manual spot-check COD/ERI Trade + Sectors — automated gate PASS (`spot-check-phase25-cod-eri.ts`)
- [x] **Task 14 — AfCETA Trade Intelligence (foundation)** — landing hero, corridor flows, mega-menu highlight, trade hub module card; Tier C opportunity index from AfCFTA + CBTPA + demand (not Comtrade bilateral); 416 corridor signals + 20 forum spotlights seeded
- [x] **Task 14b — AfCETA Corridor Flows (analyst UX)** — see detail below
- [x] **Task 15 — Explorer self-serve signup** — `/signup` + check-email; login CTA; DB triggers assign Explorer plan (see below)
- [ ] Reports tab remains disabled until explicit post-2.5 approval

#### Task 14b — AfCETA Corridor Flows (completed 2026-06-29)

| Area | Delivered |
|------|-----------|
| **Corridor Lab** | `GET /api/v1/trade/afceta/evaluate` — live origin×destination evaluation (Tier B), no DB write; shared `afceta-corridor-data-loader.ts` |
| **Smart filters** | Origin/dest country, multi-category, pillar, tier A/B/C, min score, spotlight — parity with Supply-Demand filter panel |
| **Methodology guide** | “How Corridors Are Matched” + Corridor Lab explainer on flows page |
| **Corridor drawer** | AfCETA protocol pillar, capacity/demand/opportunity (Souvera colors), tiered Top Export Products (Primary / Secondary / Emerging) |
| **Souvera Executive Analysis** | Two data-grounded paragraphs; paragraph 1 visible, “Read full analysis” expand; color-highlighted metrics; Bloomberg-style disclaimer; **rule-based only** (LLM optional layer → Reports phase backlog) |
| **Top Export Products context** | `AFCETA_EXPORT_PRODUCTS_CARD_EXPLANATION` + row-specific context on card, flows guide, and `GET /api/v1/trade/afceta` → `export_products_guide` |
| **PNG export** | Hover **PNG** on Executive Analysis and Top Export Products cards (`ExportableCard`) |
| **API** | Extended `GET /api/v1/trade/afceta/flows` — `min_score`, `tier`, multi-`group`, `pillar` |
| **SSR polish** | Hydration-safe refresh button on flows page (`mounted` gate — no `disabled` mismatch on SSR) |

**Key modules:** `afceta-corridor-engine.ts`, `afceta-corridor-analysis.ts`, `afceta-export-product-tiers.ts`, `AfCETACorridorDrawer.tsx`, `AfCETATradeIntelligence.tsx`

**AfCETA spot-check (manual / smoke)**

| Check | Expected |
|-------|----------|
| Platform Index | 416 rows; filters reduce correctly; Ghana → Jamaica agriculture opens drawer |
| Corridor Lab | ETH → KNA evaluates live; Tier B badge; scores match engine |
| Executive Analysis | Plain-language P1; expand shows products + pillar only from row data |
| Top Export Products | Three tiers with named products (not “Primary Exports” as product names) |
| PNG | Hover reveals download; export includes full analysis + curated product guide |

#### Task 15 — Explorer self-serve signup (completed 2026-06-28)

| Area | Delivered |
|------|-----------|
| **Signup page** | `/signup` — email + password, confirm password, `supabase.auth.signUp()` with `plan_id: explorer` metadata |
| **Email confirmation** | `/signup/check-email` — resend via `auth.resend({ type: 'signup' })`; confirm via existing `/auth/confirm` |
| **Login CTA** | `/login` — "Create free account" link above Request Access |
| **Routing** | `/signup` public in `proxy.ts`; authenticated users redirected away |
| **Provisioning** | Existing DB triggers create `souvera_profiles` + `explorer` subscription (no new API) |
| **Ops / smoke** | `docs/ops/supabase-explorer-signup-checklist.md`; `smoke-explorer-signup-flow.ts` (DB pre-flight PASS) |

**Manual smoke before sign-off:** complete browser E2E per ops checklist (email confirm link → login → `/api/v1/me` = explorer).

### Trade Intelligence spot-check (AGOA flows + SDM)

| Market | AGOA Flows | SDM |
|--------|------------|-----|
| **ZWE** | Suspended badge; Tier A/C mix; ~$564M MFN total; $0 AGOA | All 8 sector cells present |
| **NGA** | Top exporter; Tier A rows; country column `NGA - Nigeria` | Tier 1 opportunities in energy/minerals |
| **STP** | Small market populated (not empty) | All sectors scored |
| **MAR** | Graduated / MFN-only North Africa | Manufacturing + agriculture cells |
| **ERI** | Ineligible; sparse Tier C estimates | Structural-gap narrative path on Economy tab |
| **CYM** | N/A (Caribbean) | All 8 sector cells (financial center profile) |

### Manual spot-check checklist (GUY / JAM / COD / NGA / ERI / ZWE)

| Market | Trade tab | Sectors tab | Status |
|--------|-----------|-------------|--------|
| **GUY / JAM** | CBI labels (not AGOA); no USTR Africa link; JAM totals = exports + imports | Petroleum footnote on energy sectors only | ✅ Automated spot-check PASS (`spot-check-phase25-guy-jam.ts`) |
| **COD** | Dual-source banner (~$218M Census vs ~$323M USITC); USTR country link seeded; tertiary panel optional if ingested | Minerals AGOA-eligible; petroleum excluded from preferential | ✅ Automated spot-check PASS (`spot-check-phase25-cod-eri.ts`) |
| **NGA** | USTR link present; AGOA eligible; Tracker drawer matches DB flows (no hardcoded fallback) | Petroleum footnote | ✅ User confirmed (2023 DB) |
| **ERI** | AGOA **ineligible** card (not eligible); no USTR Africa ref (optional for ineligible) | No false AGOA preferential claims | ✅ Automated spot-check PASS (`spot-check-phase25-cod-eri.ts`) |
| **ZWE** | AGOA **suspended** — MFN totals only; $0 AGOA exports; top exporters list populated | No false AGOA preferential claims | ✅ User confirmed (2023 DB) |

## Phase 3 / Trade Intelligence — petroleum rules (locked)

When Trade Intelligence modules ship (Supply-Demand Matrix, AGOA Product Finder, HS-level flows):

| Surface | Petroleum (HTS Ch. 27) |
|---------|------------------------|
| Census bilateral totals | **Include** — MFN all-goods lens |
| AGOA/CBI preferential metrics | **Exclude** — statutory ineligibility |
| Sector `agoa_export_*` for energy/petroleum | **MFN only** — no preferential potential |
| SDM / Product Finder cells | Filter or badge `Excluded from preferences` |
| Narratives & PNG exports | Always cite `petroleumExclusionFootnote(iso3)` |

Reference: `TRADE_INTELLIGENCE_PETROLEUM_RULES` in `preferential-trade-policy.ts`.

## Blocked until full sign-off

- Phase 3 (Dashboards / Access Control)
- Reports tab build-out (see **Reports phase backlog** below)
- Full Trade Intelligence HS-level layer (Phase 3+ per supply-demand plan)
- **AfCETA Phase B** — UN Comtrade bilateral ingestion into `souvera_afceta_bilateral_flows` (actual customs lanes vs modeled capacity/demand)

## Reports phase backlog

Deferred from AfCETA Corridor Flows (Task 14b) and aligned with SDM / country Trade card patterns:

| Item | Scope | Notes |
|------|--------|--------|
| **LLM-generated executive analysis** | AfCETA corridor drawer, SDM cells, Trade tab cards, Reports exports | Rule-based curated copy ships today (`afceta-corridor-analysis.ts`, `supply-demand-card-analysis.ts`, `us-trade-card-analysis.ts`). Reports phase adds optional LLM layer via existing `generate-card-analysis` / `card-analysis` API with **curated fallback** when AI unavailable — same pattern as AGOA flows PNG export. |
| AfCETA corridor briefs in Reports | Reports tab | Corridor Opportunity Index one-pagers combining executive analysis, product tiers, pillar mapping, and disclaimer block. |
| AfCETA flows CSV export | Flows UI | SDM parity — optional fast-follow before Reports. |

**Principle:** LLM output is assistive only; governed review before publication; never replaces canonical metrics or supersedes curated fallback text.

## Implementation roadmap (post Task 14b)

```
Phase 2.5 close-out ──► Phase 3 (Dashboards / Access) ──► AfCETA Phase B (Comtrade)
        │                         │
        └── Reports tab decision ─┴──► Reports phase (LLM + briefs + PDF)
```

| Phase | Gate | Unlocks |
|-------|------|---------|
| **2.5 close-out** | Manual smoke + full audit re-run + stakeholder sign-off | Phase 3, forum demo |
| **Phase 3** | Dashboards, access control, admin ops (see `MASTER-EXECUTION-PLAN.md` Tier 3) | HS-level Trade Intelligence |
| **AfCETA Phase B** | Comtrade bilateral ingestion | Observed Africa↔Caribbean lanes vs modeled index |
| **Reports phase** | Explicit Reports tab approval | LLM executive analysis, corridor briefs, custom PDF exports |

## Recommended next steps (priority order)

### Step 1 — AfCETA product-tier refresh (optional but recommended)

DB audit is green (416 rows), but re-seed ensures drawer rows use **tiered named products** (Primary / Secondary / Emerging) instead of any legacy generic labels still in `top_products` JSON:

```bash
npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/seed-afceta-corridor-signals.ts
npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/audit-afceta-corridor-consistency.ts
```

### Step 2 — Manual smoke (AfCETA flows + Explorer signup)

**AfCETA**

| # | Action | Pass criteria |
|---|--------|---------------|
| 1 | Open `/intelligence/trade/afceta/flows` — Platform Index | 416 rows load; no hydration console error on refresh |
| 2 | Filter Ghana → Jamaica, agriculture | Drawer opens; executive analysis P1 readable; pillar + metrics colored |
| 3 | Corridor Lab: ETH → KNA, agriculture | Tier B badge; scores match engine; no DB write |
| 4 | PNG export | Hover **PNG** on Executive Analysis + Top Export Products; disclaimer included |
| 5 | Top Export Products | Three tiers with **named products** (not tier labels as product names) |

**Explorer signup**

| # | Action | Pass criteria |
|---|--------|---------------|
| 1 | `/login` → Create free account | Lands on `/signup` |
| 2 | Submit signup form | Redirect to `/signup/check-email` |
| 3 | Confirm email link | Session active; map loads |
| 4 | `GET /api/v1/me` | `plan_id` = `explorer` |

Ops: `docs/ops/supabase-explorer-signup-checklist.md` · DB pre-flight: `smoke-explorer-signup-flow.ts`

**Public pages (traction + trust + hero consistency)**

| # | Route | Pass criteria |
|---|-------|---------------|
| 1 | `/platform` + `/intelligence` | Single Live & Curated block (in TrustSourceLayer only); signup CTAs present; no ComplianceMicroRow |
| 2 | `/legal/privacy`, `/legal/terms` | Metadata in view-source; structured sections; hero label "Legal" |
| 3 | `/resources/data-sources` | 12+ source cards incl. Census + GDELT; data tier legend; methodology link |
| 4 | `/insights/methodology` | Trade methodology section; no estimate/projection contradiction |
| 5 | `/platform/signal-engine`, `/platform/data-foundation` | PublicPageHero; signup CTA; back-link to `/platform` |
| 6 | Hero consistency | All six public pages use `PublicPageHero`; no "Request Access" as sole CTA |
| 7 | Cross-links | TrustSourceLayer → `/resources/data-sources` works |

**Reports tab:** explicitly excluded from this sign-off pass — keep disabled until Reports phase (Step 3 checklist item remains deferred).

### Step 3 — Phase 2.5 sign-off gate

Re-run the full verification block below. All automated audits should remain green. Then:

- [ ] Stakeholder review of GUY/JAM/COD/NGA/ERI/ZWE spot-check table
- [ ] **Reports tab decision** — keep disabled until Reports phase, or approve scoped MVP
- [ ] Mark Phase 2.5 complete in `MASTER-EXECUTION-PLAN.md` Tier 2.5

### Step 4 — Phase 3 (after sign-off)

Per `MASTER-EXECUTION-PLAN.md` Tier 3 / Tier 3B:

1. Dashboards + access control polish
2. Admin-managed intelligence (Trade Policy CRUD, AfCFTA admin, SDM admin)
3. Admin ops (request inbox, user management, newsletter)

### Step 5 — Data depth (post-forum / parallel)

| Priority | Work item | Outcome |
|----------|-----------|---------|
| P1 | **AfCETA Comtrade bilateral** → `souvera_afceta_bilateral_flows` | Observed customs lanes alongside modeled capacity/demand |
| P2 | **Comtrade country-sector imports** | Real Import Needs $ on SDM reverse flow |
| P3 | **Global trade totals** | UN Comtrade for world `exports_usd` / `imports_usd` |
| P4 | AfCETA flows **CSV export** (SDM parity) | Optional fast-follow before Reports |
| P5 | Corridor Lab **scenario save-to-DB** | Forum what-if persistence (optional) |

### Step 6 — Reports phase (after tab approval)

See **Reports phase backlog** above and `docs/execution/reports-tab-strategic-plan.md`:

1. **LLM-generated executive analysis** — optional AI on AfCETA / SDM / Trade cards; curated rule-based fallback always available
2. **AfCETA corridor briefs** — one-pagers in Reports tab from drawer content
3. R4 quota middleware → R1 Puppeteer templates → R2 memo/trade → R3 GPT-4o custom (per `reports-ai-platform-plan.md`)

## Verification commands

```bash
npx tsx apps/api-gateway/scripts/audit-trade-taxonomy.ts
npx tsx apps/api-gateway/scripts/audit-tab-hardcoded-figures.ts
npx tsx apps/api-gateway/scripts/audit-data-provenance.ts
npx tsx apps/api-gateway/scripts/audit-data-consistency.ts
npx tsx apps/api-gateway/scripts/audit-trade-snapshot-consistency.ts
npx tsx apps/api-gateway/scripts/audit-trade-source-reconciliation.ts
npx tsx apps/api-gateway/scripts/audit-ustr-vs-census.ts
npx tsx apps/api-gateway/scripts/reconcile-census-snapshot-meta.ts
npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/audit-trade-intelligence-coverage.ts
npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/spot-check-phase25-guy-jam.ts
npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/spot-check-phase25-cod-eri.ts
npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/audit-ti-cross-module-consistency.ts
npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/audit-sdm-data-consistency.ts
npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/spot-check-sdm-export-products.ts
npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/ui-smoke-sdm-drawer.ts
npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/seed-afceta-corridor-signals.ts
npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/audit-afceta-corridor-consistency.ts
npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/smoke-explorer-signup-flow.ts
npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/reconcile-agoa-eligibility.ts
npx tsx apps/api-gateway/scripts/bootstrap-ustr-trade-summaries.ts
npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts parse:ustr:africa_country_summaries
```
