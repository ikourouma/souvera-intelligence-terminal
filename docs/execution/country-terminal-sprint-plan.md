# Country Terminal Sprint Plan — NGA/JAM Parity, PNG Exports, News Pulse, PDF

**Date:** May 2026  
**Status:** Sprints A–E complete (E pilot: NGA+JAM); F planned  
**Owners:** Product, Intelligence Editorial, Engineering  
**Related:** `docs/knowledge-base/intelligence-export-and-tier-governance.md`, `docs/execution/intelligence-card-export-standard.md`, `docs/execution/reports-tab-strategic-plan.md`, `docs/execution/qa-findings-sprint-plan.md`, `docs/execution/navigation-integration-tiers-1-5.md`, `docs/execution/trade-policy-intelligence-demo-plan.md`, `docs/execution/admin-platform-assessment-plan.md`

---

## Problem statement

Nigeria (NGA) was built as the reference country. Jamaica (JAM) has partial backend data but tab UI still renders Nigeria-specific copy on Overview, Economy, Opportunity, Risk, and Trade. PNG export coverage is incomplete. News Pulse and PDF pipeline are not production-ready.

---

## Sprint roadmap

| Sprint | Focus | Status | Exit criteria |
|--------|-------|--------|---------------|
| **A** | JAM data foundation + API fixes | ✅ Complete | JAM Economy charts populate; signal/momentum from DB |
| **B** | De-Nigeria UI (Overview + Trade) | ✅ Complete | `/country/JAM` shows Caribbean copy, not Lagos/ECOWAS |
| **C** | Economy + Opportunity PNG exports | ✅ Complete | 4 Economy + 2 Opportunity cards exportable |
| **D** | Risk + Trade PNG exports | ✅ Complete | 5 Risk + 5 Trade cards exportable; JAM de-Nigeria Risk |
| **E** | News Pulse automation (NGA+JAM pilot) | ✅ Complete | GDELT ingest + admin review + headlines UI |
| **G** | Signal row scan summaries (Option A) | ✅ Complete | Badge + 2 bullets (Signal); band label (Momentum) |
| **Gate** | NGA + JAM full parity (incl. JAM Sectors) | ✅ Complete | `test-sectors-parity.ts` + `test-signal-scan-purity.ts` pass |
| **F** | PDF pipeline completion | ⏳ Planned | Report download + history UI |
| **H** | QA findings + demo integration | ⏳ Planned | Tier 1 nav live; AGOA demo-ready; market access registry; import breakdown Phase 1 |

---

## Sprint A — JAM data foundation ✅

### Completed (2026-05-26)

- `scripts/seed-jamaica-time-series.ts` — 36 observations (2020–2025, 6 indicators)
- `scripts/seed-jamaica-signal.ts` — signal row (emerging, 68/74)
- `scripts/seed-jamaica-data.ts` — orchestrator (run successfully)
- `scripts/lib/seed-time-series.ts` — shared insert helper
- `apps/api-gateway/src/app/api/v1/country/[iso3]/route.ts`:
  - Momentum reads `economic_momentum` / `investor_readiness` from `souvera_country_profiles` first, signal table fallback
  - Forecast uses `COUNTRY_FORECASTS` per ISO3 (NGA 5.8%/5.5%, JAM 3.0%/2.9%)

### Deliverables

| File | Purpose |
|------|---------|
| `scripts/seed-jamaica-time-series.ts` | 2020–2025 observations (6 indicators) |
| `scripts/seed-jamaica-signal.ts` | `souvera_country_signal_scores` row for JAM |
| `scripts/seed-jamaica-data.ts` | One-command JAM data seed |
| `scripts/lib/seed-time-series.ts` | Shared insert helper |
| `apps/api-gateway/src/app/api/v1/country/[iso3]/route.ts` | Momentum from profiles; per-country forecast |

### Run

```bash
npx tsx scripts/seed-jamaica-data.ts
# or full country refresh:
npx tsx scripts/seed-country-overviews.ts   # profiles
npx tsx scripts/seed-jamaica-data.ts          # metrics + signal
```

### Data targets (JAM)

| Metric | 2024 approx. | Source framing |
|--------|--------------|----------------|
| GDP | $17.8B | World Bank |
| Growth | 3.1% | World Bank |
| Population | 2.8M | World Bank |
| FDI | $900M | UNCTAD |
| Inflation | 7.0% | BOJ |
| FX | ~157 JMD/USD | BOJ |

---

## Sprint B — De-Nigeria UI ✅

### Completed (2026-05-26)

- `country-overview-content.ts` — NGA, JAM, default configs (snapshot, momentum, why now, market access)
- `country-trade-content.ts` — regional agreements, hero subtitles, finance products, `COUNTRY_FORECASTS`
- `OverviewTabV2.tsx` — consumes `getOverviewContent(iso3)`; Key Sectors grid NGA-only
- `TradeTab.tsx` — CBI/CARICOM for JAM; AfCFTA/ECOWAS for NGA; region-aware finance section

### Deliverables

| File | Purpose |
|------|---------|
| `apps/api-gateway/src/lib/intelligence/country-overview-content.ts` | Per-ISO3 Overview card copy (NGA, JAM, default) |
| `apps/api-gateway/src/lib/intelligence/country-trade-content.ts` | Regional trade agreements + hero subtitles |
| `OverviewTabV2.tsx` | Consumes overview content config by `iso3` |
| `TradeTab.tsx` | Region-aware hero, agreements, finance sections |

### Region model

| Region | Countries | Trade frameworks |
|--------|-----------|------------------|
| `africa` | NGA, … | AfCFTA, ECOWAS, AGOA restoration |
| `caribbean` | JAM, … | CARICOM, CBI, CSME |
| `default` | Others | Generic WTO / bilateral |

---

## Sprint C — Economy + Opportunity PNG ✅

### Completed (2026-05-26)

- `country-economy-content.ts` — NGA/JAM/default narratives, FX labels (NGN vs JMD), reform line NGA-only
- `country-opportunity-content.ts` — NGA/JAM/default pillars, entry points, regional advantages
- `EconomyTab.tsx` — 4 exportable cards with Souvera Analysis bullets
- `OpportunityTab.tsx` — region-aware pillars; PNG on entry points + regional advantages

### Economy tab (4 cards)

| Card | Element id | Export bullets |
|------|------------|----------------|
| Key Indicators | `economy-key-indicators` | 2–3 bullets from 5yr table |
| GDP | `economy-gdp-card` | Trend + latest vs earliest |
| Growth | `economy-growth-card` | Trajectory + forecast if entitled |
| FX | `economy-fx-card` | Currency path + context |

Each export: year labels highlighted; `data-export-exclude` on PNG buttons.

### Opportunity tab (5 exportable cards)

| Card | Element id |
|------|------------|
| Pillar 1 | `tech-pillar-card` |
| Pillar 2 | `agriculture-pillar-card` |
| Pillar 3 | `infrastructure-pillar-card` |
| Investment Entry Points | `investment-entry-points-card` |
| Regional Market Advantages | `regional-advantages-card` |

### JAM de-Nigeria verification

| Tab | JAM shows | Not shown |
|-----|-----------|-----------|
| Economy | JMD/USD, BOJ/STATIN sources, tourism/nearshore narratives | NGN, CBN, 2023 reform line, parallel rate |
| Opportunity | Digital/Tourism/Mining pillars, CARICOM/CBI, JSE | Lagos fintech, ECOWAS, AfCFTA, Dangote |

---

## Sprint D — Risk + Trade PNG ✅

### Completed (2026-05-26)

- `country-risk-content.ts` — NGA/JAM/default macro, political, operational, mitigation, returns
- `RiskTab.tsx` — region-aware categories + PNG on mitigation + risk-adjusted returns
- `TradeTab.tsx` — 4 new PNG exports + Souvera Analysis bullets
- `jamaica-trade.ts` — `intraRegional` CARICOM data for intra-Caribbean section
- `country-trade-content.ts` — volume labels, finance bullets, `getIntraRegionalTrade()`

### Risk tab (5 exportable cards)

| Card | Element id |
|------|------------|
| Macro Risks | `inflation` |
| Political Risks | `political-risks-card` |
| Operational Risks | `operational-risks-card` |
| Risk Mitigation Strategies | `risk-mitigation-card` |
| Risk-Adjusted Returns | `risk-adjusted-returns-card` |

### Trade tab (5 exportable cards)

| Card | Element id |
|------|------------|
| U.S. Trade Relationship | `us-trade-card` |
| Intra-regional trade | `intra-regional-trade-card` |
| Top Trade Partners | `top-trade-partners-card` |
| Regional Trade Agreements | `regional-trade-agreements-card` |
| Trade Finance Mapping | `trade-finance-mapping-card` |

### JAM de-Nigeria (Sprint D)

| Tab | JAM shows | Not shown |
|-----|-----------|-----------|
| Risk | Hurricane, IMF anchor, GraceKennedy partners | Naira, Boko Haram, Dangote, Lagos grid |
| Trade | CARICOM intra-regional section + CBI bullets | AfCFTA/ECOWAS volume labels |

---

## Sprint E — News Pulse automation ✅ (NGA + JAM pilot)

**Pilot strategy:** Ship NGA + JAM together; expand to all 74 countries after validation.

See `docs/execution/sprint-e-implementation-complete.md` for runbook and scale-out plan.

### Architecture

1. **Ingest:** GDELT DOC API (`scripts/ingest-news-pulse.ts`) — daily cron
2. **Store:** Score → `souvera_country_news_signals` (draft by default)
3. **Admin:** `/admin/data/news-pulse` review queue (draft → published)
4. **UI:** `SignalMomentumRow` reads published signals only; top 3 headlines

### Completed files

| File | Purpose |
|------|---------|
| `infra/supabase/migrations/add-news-signals-status.sql` | Review workflow columns |
| `scripts/lib/gdelt-doc.ts` | GDELT client |
| `scripts/lib/news-pulse-scoring.ts` | Keyword scoring |
| `scripts/lib/news-pulse-pilot.ts` | NGA + JAM config |
| `scripts/ingest-news-pulse.ts` | Ingest → draft |
| `scripts/seed-news-pulse-pilot.ts` | Published fallback seed |
| `apps/api-gateway/.../admin/news-pulse/route.ts` | Admin API |
| `apps/api-gateway/.../admin/data/news-pulse/` | Review UI |

### Sectors de-Nigeria (completed with E prep)

| File | Purpose |
|------|---------|
| `country-sectors-content.ts` | AGOA / CBI / default labels |
| `SectorsTab.tsx` | Wired to `getSectorTradeCopy(iso3)` |
| `scripts/seed-jamaica-sectors-trade.ts` | JAM CBI sector export data |

---

## Sprint E — News Pulse automation (original spec)

### Architecture

1. **Ingest:** GDELT DOC API (daily cron / edge function)
2. **Store:** `souvera_news_headlines` (raw) → score → `souvera_country_news_signals`
3. **Admin:** `/admin/data/news-pulse` review queue (draft → published)
4. **UI:** `SignalMomentumRow` reads published signals only

### API recommendation

| Priority | Provider | Role |
|----------|----------|------|
| **MVP** | [GDELT 2.0 DOC](https://blog.gdeltproject.org/gdelt-2-0-our-global-world-in-realtime/) | Free; country + sector + AGOA/CBI queries |
| **Upgrade** | Event Registry (NewsAPI.ai) | Entity-based monitoring, cleaner JSON |
| **Headlines** | NewsAPI.org | `top_headlines` field supplement |
| **Enterprise** | Reuters / Factiva | Institutional tier (later) |

### Query templates

- `{country} AND (economy OR investment OR policy OR trade)`
- `{region} AND (AGOA OR AfCFTA OR CARICOM OR CBI)`
- Sector tags from `souvera_country_sectors.sector_key`

### Schema (planned)

```sql
-- infra/supabase/migrations/create-news-headlines-table.sql (Sprint E)
CREATE TABLE souvera_news_headlines (...);
ALTER TABLE souvera_country_news_signals ADD COLUMN status text DEFAULT 'draft';
ALTER TABLE souvera_country_news_signals ADD COLUMN top_headlines jsonb;
```

---

## Sprint F — PDF pipeline

| Step | Status | Notes |
|------|--------|-------|
| `souvera_report_requests` table | ✅ Seeded | Migration applied |
| `render-pdf.ts` (pdf-lib stub) | ✅ Exists | Country Profile v0 |
| Embed `why_now_md` + metrics | ⏳ Sprint F | |
| Puppeteer HTML templates | ⏳ Sprint F | Memos, trade profiles |
| Supabase Storage bucket | ⏳ Sprint F | `reports/{org}/{id}.pdf` |
| Report History UI | ⏳ Sprint F | Reports tab |
| Worker / edge cron | ⏳ Sprint F | `process-report-request` |

---

## Verification matrix

| Tab | `/country/NGA` | `/country/JAM` |
|-----|----------------|----------------|
| Overview | ✅ Africa copy + live metrics | ✅ Caribbean copy + live metrics |
| Economy | ✅ Charts + 4 PNG | ✅ JMD charts + 4 PNG |
| Opportunity | ✅ 5 PNG (3 pillars + 2 cards) | ✅ Caribbean thesis + 5 PNG |
| Risk | ✅ 5 PNG + Caribbean copy | ✅ Hurricane/IMF copy, no NGA hardcode |
| Trade | ✅ 5 PNG (AfCFTA/ECOWAS) | ✅ 5 PNG (CARICOM/CBI + intra-regional) |
| Sectors | ✅ AGOA trade block | ✅ CBI trade block + 5 full sectors |
| News Pulse | ✅ Published + headlines (Sprint E) | ✅ Published + headlines |
| Reports | PDF download (Sprint F) | PDF download |

---

## Seed command reference

```bash
# Profiles (why_now_md, thesis, risk)
npx tsx scripts/seed-country-overviews.ts

# Nigeria time series only
npx tsx scripts/seed-nigeria-time-series.ts

# Jamaica metrics + time series + signal
npx tsx scripts/seed-jamaica-data.ts

# News Pulse pilot (NGA + JAM)
npx tsx scripts/seed-news-pulse-pilot.ts
npx tsx scripts/ingest-news-pulse.ts

# Jamaica sector CBI trade fields
npx tsx scripts/seed-jamaica-sectors-trade.ts

# Jamaica full sectors (required for Sectors tab)
npx tsx scripts/seed-jamaica-sectors.ts

# Pre-scale gate tests
npx tsx scripts/test-sectors-parity.ts
npx tsx scripts/test-signal-scan-purity.ts
```

---

## Sprint H — QA Findings + Demo Integration ⏳

**Source:** Human QA Checklist (2026-05-31). Full analysis: [`qa-findings-sprint-plan.md`](./qa-findings-sprint-plan.md)

| Track | Priority | Exit criteria |
|-------|----------|---------------|
| **H-D** Platform integration (Tier 1) | P0 — demo | Trade + AGOA in mega nav; nav/footer; SSR auth; demo script passes |
| **H-A** Quick fixes | P0 | Export breakdown PNG; SectorsTab $0; JAM tab canonical URL; BRB/BHS economy seeds |
| **H-B** Trade depth | P1 | Import breakdown (12 countries); market access registry; sidebar bleed fixed |
| **H-C** Opportunity enrichment | P1 | Computed metrics for Wave 1 template countries |
| **H-E** Quality gates | P0 | Purity tests for 12 ISO3; news pulse filters extended; legacy redirects |

**Demo-critical path:** Tier 1 navigation + Trade Policy Intelligence — see [`navigation-integration-tiers-1-5.md`](./navigation-integration-tiers-1-5.md) and [`trade-policy-intelligence-demo-plan.md`](./trade-policy-intelligence-demo-plan.md).

**Admin ops:** [`admin-platform-assessment-plan.md`](./admin-platform-assessment-plan.md)

---

## Decision log

| Date | Decision |
|------|----------|
| 2026-05-31 | Sprint H added from Human QA; Tier 1 demo-blocking before launch |
| 2026-05-31 | Trade Policy Intelligence (AGOA reauth) is primary launch differentiator |
| 2026-05-31 | Legislative timeline stays public; AGOA card detail at Business+ |
| 2026-05 | Follow sprint order A → F |
| 2026-05 | Option A: Souvera Country Analysis for Professional+ |
| 2026-05 | News Pulse MVP: GDELT + admin review |
| 2026-05 | PNG: no watermark; header/footer attribution |
| 2026-05 | JAM content via `country-overview-content.ts`, not hardcoded NGA blocks |

---

## Changelog

| Date | Sprint | Change |
|------|--------|--------|
| 2026-05-31 | H | QA findings saved; Tier 1–5 nav plan; trade policy + admin assessment docs |
| 2026-05-26 | D | Risk de-Nigeria + 6 new Trade/Risk PNG exports; JAM intraRegional trade |
| 2026-05-26 | C | Economy + Opportunity de-Nigeria content configs; 6 new PNG exports |
| 2026-05-26 | A | JAM seeds run (36 observations + signal); API momentum + per-country forecast |
| 2026-05-26 | B | Overview + Trade wired to content configs; build verified |
| 2026-05-26 | A | Added JAM time-series + signal seeds, API momentum fix |
| 2026-05-26 | B | Added country content configs, Trade regional copy |
| 2026-05-26 | — | Created this plan document |
