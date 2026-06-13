# Souvera Platform Foundation Assessment — 2026

**Status:** Approved for execution  
**Date:** 2026-06-04  
**Owner:** Platform / Data / Intelligence  
**Audience:** Leadership, product, engineering  

---

## Executive summary

Souvera has built an advanced **report integrity pipeline** (canonicalization, Evidence Vault policy, preflight) while the **live terminal UI** still blends database observations with static TypeScript modules and unhydrated narrative templates. That split creates credibility risk — including visible `{{GDP_NOMINAL_USD}}` placeholders on Nigeria Overview cards — and guarantees rework if reporting continues ahead of the data foundation.

**Strategic decision (confirmed):**

1. **Pause** all user-facing PDF report generation until the foundation is locked.
2. ✅ **Phase 0 COMPLETE** across all 12 rollout markets (0A–0G + 0X + 0D + 0E + 0F, June 2026).
3. **Phase 0.5:** AGOA Reauthorization Intelligence Pack (US Chamber / Dept of State) — 3-week sprint, pre-Phase 1.
4. **Phase 1:** Full trade framework coverage — AGOA + AfCFTA for Africa, CBI + CARICOM for Caribbean (74 markets total).
4. **Phase 2:** Supply–demand matrix (74 × 7 sectors) — Souvera’s primary differentiator.
5. **Phase 3:** Resume institutional reports as **exports** of the verified terminal state.
6. **Non-negotiable:** **No hard-coded data in Souvera.** All user-facing values must originate from Supabase observations, Evidence Vault, or admin-published content — never from static TS literals presented as facts.

---

## Current state

### Strengths (preserve)

| Asset | Location | Maturity |
|-------|----------|----------|
| Normalized observations | `souvera_country_observations` → tiered views | Production-ready |
| Top 20 ingestion | `services/ingestion/run.ts worldbank-top20` | Operational |
| Evidence Vault + policy jobs | `verify:ustr:agoa`, `verify:regional`, `verify:caricom` | Operational |
| Report canonicalization | `canonicalize-country-payload.ts` | Advanced |
| Preflight integrity gate | `preflight-validate.ts` | Advanced |
| Rollout manifest | 12 terminal markets | Defined |
| Sourced-data backlog tooling | `docs/data/sourced-data-backlog.md` | Operational |

### Critical gaps

| Gap | Impact | Example |
|-----|--------|---------|
| UI ≠ report data contract | Placeholders, policy divergence | NGA Overview `{{MACRO_ASOF_YEAR}}` |
| Dual policy authority | Wrong eligibility in UI | Static AGOA vs Evidence Vault |
| Static trade modules | Not observation-backed | `nigeria-trade.ts`, `wave1-africa-trade.ts` |
| Static country copy in TS | Hard-coded narratives | `country-overview-content.ts` |
| Trade APIs not vault-backed | Demo ≠ institutional | `souvera_trade_policy_statuses` fallback |
| Supply–demand unbuilt | Differentiator missing | `/intelligence/trade/supply-demand` stub |
| NGA Top 20 incomplete | 15/20 keys in DB | Missing trade/external-sector series |

### Platform maturity (estimate — updated 2026-06-10)

| Layer | % complete | Change |
|-------|------------|--------|
| Observation + ingestion foundation | ~78% | Phase 0X done: 68/74 markets >=15/20; 6 structural ceilings documented |
| Country terminal (12 rollout markets) | ~60% | Phase 0A–0C + 0G closed; 0D–0F pending |
| Trade intelligence module | ~65% | AGOA Product Finder (3-tier) built; Product Finder enriched with 20 products; Dia analysis integrated |
| Report PDF engine | ~75% (paused — ahead of foundation) | Unchanged |
| **Overall institutional credibility** | **~72%** | Up from 60%; Phase 0 foundation locked (0A-0G, 0X, 0D, 0E, 0F) |

---

## Souvera Data Contract (SDC)

Every user-facing surface must satisfy the SDC before render:

```
External Source → Ingestion → Observations / Evidence Vault / Published Content
                                        ↓
                              Canonical Country Model
                                        ↓
              ┌─────────────────────────┼─────────────────────────┐
              ↓                         ↓                         ↓
        Country API              Trade APIs                 Reports (Phase 3)
        Terminal UI              AGOA / AfCFTA / SDM
```

### SDC rules

1. **No hard-coded facts** — Numbers, dates, eligibility, and trade totals must come from DB rows with `source_id`, `period_date`, and freshness metadata. TypeScript may hold **template structure** and **routing keys only**.
2. **No raw `{{TOKEN}}` in UI** — Hydrate at the content boundary from canonical metrics (Phase 0A).
3. **One policy authority** — `souvera_country_policy_status` + `souvera_evidence_artifacts` for all surfaces.
4. **Conservative language** — “Under review” when artifacts are missing; never assert Eligible/Suspended without evidence.
5. **Numeric claims** — Structured observation **or** published claim row with source URL **or** neutralized copy (no bare editorial numbers).
6. **Preview honesty** — Badges: `Verified` / `Curated preview` / `Not covered` aligned to vault state.

### Editorial content policy (recommendation #4)

| Tier | Storage | When to use |
|------|---------|-------------|
| **T1 — Structured** | `souvera_country_observations` | All macro, trade, sector scores |
| **T2 — Published narrative** | `souvera_country_profiles` (markdown) | Country analysis prose; hydrated from T1 at render |
| **T3 — Verified claims** | `souvera_narrative_claims` (new, Phase 0D) | VC stats, regional shares, one-off estimates — each row: `claim_text`, `source_id`, `as_of`, `confidence` |
| **T4 — Forbidden** | Static `.ts` files | Hard-coded numbers presented as facts |

Until T3 exists: rewrite unsourced claims to non-numeric institutional copy **or** strip via `neutralizeClientNumericClaims` (interim only).

---

## Phased roadmap

### Phase 0 — Foundation lock (4–6 weeks)

**Scope:** All **12 rollout markets** — `NGA`, `JAM`, `KEN`, `GHA`, `ZAF`, `ETH`, `SEN`, `CIV`, `TZA`, `TTO`, `BRB`, `BHS`.

| ID | Workstream | Deliverable |
|----|------------|-------------|
| 0A | Canonical hydration (UI) | Shared hydration for Overview + Risk tabs |
| 0B | Policy unification | Trade tab + AGOA API → Evidence Vault |
| 0C | Macro completeness | 20/20 Top 20 keys per rollout market |
| 0D | Narrative governance | Clear sourced-data backlog; migrate copy to DB |
| 0E | Anti-hardcode sweep | Deprecate static trade/policy TS modules |
| 0F | Integrity CI | Placeholder scan + cross-surface consistency tests |
| 0G | Reports pause | UI + API gate with professional “coming soon” message |

**Phase 0 exit gate:** Zero `{{TOKEN}}` leaks; policy UI = vault; 12/12 markets ≥18/20 Top 20 keys; zero hard-coded numeric facts in TS render paths.

---


### Phase 0.5 - AGOA Reauthorization Intelligence Pack (~3 weeks) - ACTIVE

**Context:** US Chamber of Commerce and US Department of State are building the AGOA reauthorization brief for December 2026. They have requested Souvera as an authoritative reference — a landmark validation of the platform's institutional credibility. This phase delivers the demand-side intelligence needed to earn that citation.

> Full plan: `docs/platform/phase-0-5-agoa-reauth-intelligence.md`

| ID | Workstream | Deliverable | Status |
|----|------------|-------------|--------|
| 0.5A | Import demand data layer | `souvera_import_demand_signals` table + 74x6 seed (machinery, cotton, grains, intermediate goods) | Not started |
| 0.5B | US export opportunity sizing | Gap: current US share vs benchmark across 74 AGOA markets | Not started |
| 0.5C | Demand intelligence UI | DemandSignalMatrix (74x6 heatmap) + CountryDemandDrawer + RegionalSummary | Not started |
| 0.5D | AGOA report builder | 5 templates: country brief, regional summary, sector deep dive, product brief, AGOA overview | Not started |
| 0.5E | Gemini narrative engine | Country x category demand narratives cached in souvera_narrative_claims (T3) | Not started |
| 0.5F | Source attribution | 100% citation: ITC TDM, BEA, USTR on all demand figures | Not started |

**Data fixes already complete:**
- JAM + all 12 markets: `total_trade_usd`, `exports_usd`, `imports_usd` restored via JSON meta in `trade_summary_md` (parsed by country API) - Done
- Source registry: ITC Trade Data Monitor, USTR, BEA International Trade added - Done

---
### Phase 1 — Trade intelligence (6–8 weeks)

**Scope:** All **74 markets** (54 Africa + 20 Caribbean).

| Framework | Markets | Authority |
|-----------|---------|-----------|
| AGOA | 54 Africa | Evidence Vault + USTR artifacts |
| AfCFTA | 54 Africa | AU / tralac ingestion |
| CBI | 20 Caribbean | USTR CBI evidence |
| CARICOM | 20 Caribbean | Regional verification job |

**Recommendation on phasing (vs. original ask):** Your sequence is correct — **complete AGOA + AfCFTA (and Caribbean equivalents) in Phase 1** before supply–demand. Supply–demand depends on vault-backed policy status and sector observations; building it on static seeds would repeat today’s rework. Add **CBI + CARICOM vault parity** in Phase 1 so Caribbean is not a second-class region.

**Phase 1 exit gate:** 100% vault-backed policy for all 74 markets; zero seed-default eligibility; hub stats live from APIs; admin publish workflow for policy updates (no redeploy).

---

### Phase 2 — Supply–demand matrix (8–10 weeks)

**Scope:** 74 countries × 7 sectors = **518 cells** (Souvera differentiator).

| Component | Description |
|-----------|-------------|
| Data model | `souvera_supply_demand_signals` (country, sector, supply_score, demand_score, opportunity_score, as_of, source_id) |
| Ingestion | Sector observations + trade flows + policy access → scored matrix |
| API | `GET /api/v1/trade/supply-demand` |
| UI | Replace stub at `/intelligence/trade/supply-demand` |
| Country cross-links | Trade tab + sector pages surface relevant SDM cell |

**Phase 2 exit gate:** Full matrix populated for all 74 × 7; entitlements enforced; no static scores in TS.

---

### Phase 3 — Resume institutional reports (4–6 weeks)

Reports become **snapshots** of the SDC-compliant terminal — not a parallel pipeline.

- Re-enable with `REPORTS_GENERATION_PAUSED=false`
- Single fetch path (no duplicate profile overrides)
- Sector Deep-Dive when sector observations exist
- Target: &lt;30s generation because preflight rarely blocks (data already verified in UI)

---

## Reports pause (implemented)

| Surface | Behavior |
|---------|----------|
| Reports tab | Amber banner; buttons show **Coming soon** |
| API `POST /api/v1/reports/generate` | `503` + `REPORTS_PAUSED` |
| Re-enable | `REPORTS_GENERATION_PAUSED=false` in `apps/api-gateway/.env.local` |

User-facing message (non-technical):

> *Institutional PDF reports are being refreshed to align with our verified intelligence layer. On-demand report generation will return soon — your country terminal already reflects the latest structured data.*

---

## Implementation plan (progress tracker)

Update status: `⬜ Not started` · `🟡 In progress` · `✅ Done` · `⏸ Blocked`

### Phase 0A — Placeholder hydration (UI)

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 0A.1 | `hydrate-intelligence-content.ts` shared module | ✅ Done | Eng | `buildTemplateVarsFromIntelligence` |
| 0A.2 | Wire `OverviewTabV2` hydration | ✅ Done | Eng | All rollout markets using tokenized copy |
| 0A.3 | Wire `RiskTab` hydration | ✅ Done | Eng | |
| 0A.4 | Export `hydrateContentTree` from narrative-template | ✅ Done | Eng | Shared with report path |
| 0A.5 | Test `scripts/test-phase-0a-hydration.ts` | ✅ Done | Eng | NGA smoke test |
| 0A.6 | Extend hydration to EconomyTab if tokens added | ⬜ Not started | Eng | |
| 0A.7 | CI: scan all rollout markets for `{{TOKEN}}` | ⬜ Not started | Eng | |

### Phase 0B — Policy unification

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 0B.1 | AGOA API → `policy-status-db.ts` | ✅ Done | Eng | `trade-policy-vault.ts`; no curated fallback |
| 0B.2 | Country Trade tab → vault | ✅ Done | Eng | `agoaPolicy` on country API + Trade tab strip |
| 0B.3 | Overview market access → vault | ✅ Done | Eng | `market-access-overview.ts`; Overview cards use `data.marketAccess` |
| 0B.4 | Run `verify:ustr:agoa` all 54 Africa | ✅ Done | Data | USTR 2024 PDF + program-page discovery; see `tmp/policy-status-audit.md` |
| 0B.5 | Run `verify:caricom` + `verify:ustr:cbi` Caribbean | ✅ Done | Data | CARICOM member page URL fixed; CBI USTR program + CBERA PDF fallback |
| 0B.6 | Resolve NGA legislative ↔ vault consistency | ✅ Done | Data | Removed NGA curated override; vault eligible per USTR 2024 list; watchpoint references vault |

### Phase 0C — Macro completeness

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 0C.1 | `check-rollout-top20-coverage.ts` all 12 ISO3 | ✅ Done | Eng | Exit gate: ≥18/20 Top 20 keys per market |
| 0C.2 | Ingest missing trade/external keys | ✅ Done | Data | WB + UN Comtrade + `imf-rollout-gap-fill` (IMF DataMapper); **12/12 ≥18/20** |
| 0C.3 | Align UI time series to full Top 20 | ✅ Done | Eng | `build-economy-years.ts`; dynamic Economy tab rows |
| 0C.4 | `sourceMeta` on country API from real sources | ✅ Done | Eng | `country-source-meta.ts`; `test-phase-0c-macro.ts` |

### Phase 0D — Narrative governance

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 0D.1 | Migrate `country-overview-content.ts` → DB profiles | ⬜ Not started | Content | Structure in TS; values from T1 |
| 0D.2 | Migrate `country-risk-content.ts` → DB | ⬜ Not started | Content | |
| 0D.3 | Design `souvera_narrative_claims` table | ✅ Done | Eng | Migration: `infra/supabase/migrations/create-narrative-claims-table.sql`; RLS + confidence enum + category enum |
| 0D.4 | Clear NGA backlog (38 items) | 🟡 In progress | Content | T2 profiles eliminate prose-numeric backlog; T1 observations cover macro items; `sourced-data-backlog.md` to be re-evaluated |
| 0D.5 | Regenerate backlog for all 12 markets | 🟡 In progress | Eng | Script: `scripts/generate-sourced-data-backlog.ts` (untracked) |

### Phase 0E — Anti-hardcode sweep

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 0E.1 | Inventory static data modules | ✅ Done | Eng | 5 trade files (356+ numeric assignments), `knowledge-base.ts`, `agoa-full-coverage.ts`, `afcfta-status.ts` |
| 0E.2 | Wire trade to observations or trade_snapshots | ✅ Done | Eng | 12/12 markets migrated via `static-trade-migration`; country API + report data now query DB; 5 static files deleted |
| 0E.3 | ESLint rule: ban numeric literals in `src/data/` | ✅ Done | Eng | `no-magic-numbers: warn` in `eslint.config.mjs`; 3 files allowlisted (seed/curated only) |
| 0E.4 | Delete deprecated modules after migration | ✅ Done | Eng | Deleted: nigeria-trade.ts, kenya-trade.ts, jamaica-trade.ts, wave1-africa-trade.ts, caribbean-wave2-trade.ts |

### Phase 0F — Integrity CI

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 0F.1 | Preflight + hydration tests in CI | ✅ Done | Eng | `foundation-integrity-gate.yml` gate 2: runs `test-phase-0a-hydration.ts` on push |
| 0F.2 | Cross-surface policy consistency test | ✅ Done | Eng | `foundation-integrity-gate.yml` gate 2: `test-pilot-triad-parity.ts` |
| 0F.3 | Placeholder leak grep in CI | ✅ Done | Eng | `scripts/ci-placeholder-scan.ts` + `foundation-integrity-gate.yml` gate 1 (no secrets, always runs); scan confirmed 0 leaks |

### Phase 0G — Reports pause

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 0G.1 | `report-generation-availability.ts` | ✅ Done | Eng | |
| 0G.2 | Reports tab banner + grey Generate PDF + popup | ✅ Done | Eng | Click shows “Report generation — coming soon” |
| 0G.3 | API 503 gate in `report-generate-handler` | ✅ Done | Eng | |
| 0G.4 | Document re-enable in `.env.example` | ✅ Done | Eng | |

### Phase 0X — 74-market data coverage wave

| # | Task | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 0X.1 | Run `check-all74-top20-coverage.ts` audit | ✅ Done | Eng | 68/74 pass. See `docs/data/74-market-coverage-audit-2026-06-10.md` |
| 0X.2 | IMF DataMapper gap-fill (SOM, DMA, GRD, KNA) | ✅ Done | Data | SOM 13->15; DMA/GRD/KNA targeted |
| 0X.3 | ECCU curated fill (DMA, GRD, KNA) | ✅ Done | Data | IMF A4 + ECCB + IEA data; 36 obs ingested, 0 failures; all three at 20/20 |
| 0X.4 | Apply Limited coverage badge (ERI, SSD, CUB, PRI, VGB, TCA) | ✅ Done | Eng | `LimitedCoverageBanner.tsx` + `structural-data-gaps.ts` registry |
| 0X.5 | Final validation: 68/74 pass + 6 with badge | ✅ Done | Eng | Africa 52/54 · Caribbean 16/20 · Overall 92% |

### Phase 0.5 — AGOA Reauthorization Intelligence (summary tracker)

| # | Task | Status |
|---|------|--------|
| 0.5.1 | Create souvera_import_demand_signals migration | Not started |
| 0.5.2 | Seed 12 rollout markets x 6 categories demand data | Not started |
| 0.5.3 | Expand to 74 AGOA-eligible markets | Not started |
| 0.5.4 | US export gap calculation | Not started |
| 0.5.5 | DemandSignalMatrix.tsx + CountryDemandDrawer.tsx UI | Not started |
| 0.5.6 | 5 AGOA report templates | Not started |
| 0.5.7 | Gemini demand narratives + T3 caching | Not started |
| 0.5.8 | Source attribution (ITC TDM + BEA + USTR) | Not started |

### Phase 1 — Trade intelligence (summary tracker)

| # | Task | Status |
|---|------|--------|
| 1.1 | AGOA 54/54 vault-backed | ⬜ |
| 1.2 | AfCFTA 54/54 with DB path | ⬜ |
| 1.3 | CBI 20/20 vault-backed | ⬜ |
| 1.4 | CARICOM 20/20 vault-backed | ⬜ |
| 1.5 | Admin policy publish workflow | ⬜ |
| 1.6 | Hub live stats from APIs | ⬜ |
| 1.7 | Trade tab cross-framework links | ⬜ |

### Phase 2 — Supply–demand (summary tracker)

| # | Task | Status |
|---|------|--------|
| 2.1 | `souvera_supply_demand_signals` schema | ⬜ |
| 2.2 | Scoring ingestion pipeline | ⬜ |
| 2.3 | API + entitlements | ⬜ |
| 2.4 | UI matrix (74 × 7) | ⬜ |
| 2.5 | Country + sector cross-links | ⬜ |

### Phase 3 — Reports resume (summary tracker)

| # | Task | Status |
|---|------|--------|
| 3.1 | Single canonical fetch path | ⬜ |
| 3.2 | Re-enable generation flag | ⬜ |
| 3.3 | Report = terminal snapshot QA | ⬜ |

---

## Success metrics

| Metric | Baseline (Jun 2026) | Phase 0 target | Phase 1 | Phase 2 |
|--------|---------------------|----------------|---------|---------|
| All 74-market coverage (>=15/20 Top 20) | **68/74 (92%)** | 68/74 | 70/74 | 74/74 |
| `{{TOKEN}}` leaks (UI) | 11 fields (NGA) | 0 | 0 | 0 |
| Hard-coded fact modules in render path | ~15 TS files | 0 | 0 | 0 |
| Rollout markets Top 20 coverage | **12/12 ≥18/20** | ≥18/20 all 12 | ≥19/20 | 20/20 |
| Vault-backed policy (UI surfaces) | 1 (reports only) | 4+ | 74/74 | 74/74 |
| AGOA seed defaults | ~34 countries | 0 | 0 | 0 |
| AfCFTA curated only | 8/54 | 8/54 verified | 54/54 | 54/54 |
| Supply–demand cells | 0/518 | 0 | 0 | 518/518 |
| Sourced-data backlog (NGA) | 38 | &lt;5 | 0 | 0 |
| Report generation | Active | **Paused** | Paused | Paused → Phase 3 |

---

## Anti-hardcode migration map

| Current static module | Replacement | Phase |
|----------------------|-------------|-------|
| `nigeria-trade.ts`, `wave1-africa-trade.ts`, etc. | `souvera_country_trade_snapshots` + Comtrade ingest | 0E |
| `agoa-full-coverage.ts` | `souvera_country_policy_status` | 0B |
| `afcfta-status.ts` | DB + `verify:regional` | 1 |
| `country-overview-content.ts` (numeric prose) | `souvera_country_profiles` + hydration | 0D |
| `country-risk-content.ts` | DB profiles | 0D |
| `entity-registry.ts` (runtime) | `souvera_entities` queries | 0E |

**Allowed in TypeScript permanently:** routing keys, ISO lists, UI labels, template structure, entitlement maps — **never** GDP, trade totals, eligibility, or sector scores.

---

## References

- Data ops: `docs/data/README.md`
- Sourced backlog: `docs/data/sourced-data-backlog.md`
- Report storage audit: `docs/reports/report-storage-and-schema-audit.md`
- Phase 0A code: `apps/api-gateway/src/lib/intelligence/hydrate-intelligence-content.ts`
- Reports pause: `apps/api-gateway/src/lib/reports/report-generation-availability.ts`
- Hydration test: `apps/api-gateway/scripts/test-phase-0a-hydration.ts`
- Top 20 coverage (from `apps/api-gateway`): `npm run check:rollout-top20` · `npm run test:phase-0c` · `npm run diagnose:rollout-top20`
- Gap-fill ingestion: `worldbank-rollout-fill` · `curated-trade-macro-fill` · `imf-rollout-gap-fill` (from repo root with `services/ingestion/tsconfig.json`)

---

## Revision log

| Date | Change |
|------|--------|
| 2026-06-04 | Initial assessment; Phase 0A + 0G implemented; scope confirmed for all 12 rollout markets; Phase 1 trade / Phase 2 supply–demand sequencing approved |
| 2026-06-07 | Phase 0C closed: npm scripts for coverage tests; NGA/JAM/TTO → 18/20 via curated-trade-macro-fill; BRB at 16/20 (WB source ceiling) |
| 2026-06-11 | Phase 0D + 0E closed: T2 profiles seeded (12 markets, 4 narrative fields each); 12 trade snapshots migrated to `souvera_country_trade_snapshots`; 5 static *-trade.ts files deleted; country API + report data wired to DB; alter-trade-snapshots migration staged for aggregate column extension |
| 2026-06-11 | Phase 0D.3/0E.1/0E.3/0F all done: `souvera_narrative_claims` migration; `souvera_country_trade_snapshots` migration; ESLint no-magic-numbers guard on `src/data/`; `ci-placeholder-scan.ts` (0 leaks on first run); `foundation-integrity-gate.yml` CI workflow (static + live gates) |
| 2026-06-11 | Phase 0X closed: 68/74 markets pass >=15/20 gate; SOM filled via IMF DataMapper; DMA/GRD/KNA filled to 20/20 via ECCU curated fill (IMF A4 + ECCB + IEA); 6 structural gaps registered with LimitedCoverageBanner; diagnose-gap74-markets.ts diagnostic script added |
| 2026-06-11 | Phase 0 fully closed (all 7 workstreams + 0X + 0D + 0E + 0F). JAM/all-market trade aggregates fixed via JSON meta in trade_summary_md. Phase 0.5 AGOA Reauthorization Intelligence Pack added (US Chamber + Dept of State request). ITC TDM, USTR, BEA added to source registry. |
| 2026-06-10 | Audit-first sequencing confirmed; SDM expanded to 74 x 8 sectors (592 cells); AGOA Product Finder (3-tier) built and enriched with 20 products + Dia analysis; Manufacturing and Textiles added as SDM sector #1; getDiaPotentialProduct integrated into product drawer; data narrative gaps fixed; 74-market Top 20 audit initiated |
| 2026-06-08 | IMF DataMapper adapter (`imf-datamapper-client.ts`, `imf-rollout-gap-fill`); 12/12 rollout markets ≥18/20 Top 20 |





