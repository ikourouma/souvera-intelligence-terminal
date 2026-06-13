# QA Findings — Sprint H Analysis & Plan

**Date:** 2026-05-31  
**Status:** Approved for implementation  
**Master plan:** [MASTER-EXECUTION-PLAN.md](./MASTER-EXECUTION-PLAN.md) — single view for all tracks  
**Source:** Human QA Checklist — Pilot + Wave 1 + AGOA  
**Related:**
- [Navigation Integration Tiers 1–5](./navigation-integration-tiers-1-5.md)
- [Trade Policy Intelligence Demo Plan](./trade-policy-intelligence-demo-plan.md)
- [Admin Platform Assessment](./admin-platform-assessment-plan.md)
- [Country Terminal Sprint Plan](./country-terminal-sprint-plan.md)
- [Human Test Checklist](./human-test-checklist.md)

---

## Executive Summary

Human QA passed for the pilot triad (NGA/JAM/KEN), Wave 1 Africa (6 countries), Caribbean Wave 2 (TTO/BRB/BHS), and AGOA tracker core functionality. Remaining work clusters into five Sprint H tracks: platform integration (demo-critical), quick UX/data fixes, trade depth (import breakdown + market access registry), opportunity enrichment, and extended quality gates.

**Demo-critical path:** Tier 1 navigation integration + Trade Policy Intelligence platform wiring (see dedicated plans above).

---

## QA Sign-Off Summary

| Area | Result | Key observation |
|------|--------|-----------------|
| NGA | Pass | Sector AGOA exports show $0 (intentional — suspended); Export Breakdown PNG missing |
| JAM | Pass | Tab URL should canonicalize to `?tab=overview` |
| KEN | Pass | — |
| Wave 1 (GHA/ZAF/ETH/SEN/CIV/TZA) | Pass | Opportunity tab thin; template expansion expected |
| Caribbean Wave 2 | Pass | BRB/BHS economy charts missing FDI/inflation/FX for 2024–2025 |
| Cross-country bleed | Pass (manual) | Sidebar market access bleeds AGOA/AfCFTA to Caribbean |
| AGOA tracker | Pass (functional) | Not integrated into platform nav; auth may not resolve on standalone page |
| Regression | Pass | Country hard-gate redirect; compare teaser works |

---

## Self-Check: Cross-Country Bleed

| Test | Scope | Status |
|------|-------|--------|
| `scripts/test-signal-scan-purity.ts` | NGA/JAM/KEN | Passes |
| `scripts/test-sectors-parity.ts` | NGA/JAM/KEN | Passes |
| `scripts/test-human-ready-gate.ts` | Static trade keys | Passes |
| `news-pulse-relevance.ts` | Headline filter | **Only NGA + JAM** |

**Confirmed bleed risks:**

1. **Sidebar Market Access** — `MarketAccessSummary.tsx` hard-codes AGOA + AfCFTA for all countries; Caribbean shows wrong frameworks.
2. **Trade tab regional template** — `AFRICA_TRADE` lists ECOWAS for every African country; SADC/COMESA/EAC missing for ZAF/ETH/TZA.
3. **SectorsTab falsy check** — `agoaExportCurrentUsd &&` hides $0 for NGA.

**Action:** Extend purity tests to all 12 rollout ISO3s; extend news pulse filters.

---

## Sprint H Tracks

| Track | Priority | Items |
|-------|----------|-------|
| **H-D Platform integration** | P0 — demo | Nav/footer; auth bootstrap; sitemap; IntelligenceHub; Tier 1 wiring |
| **H-A Quick fixes** | P0 | Export breakdown PNG; SectorsTab $0; JAM tab canonicalization; BRB/BHS seeds |
| **H-B Trade depth** | P1 | Import breakdown Phase 1; market access registry |
| **H-C Opportunity** | P1 | Computed metrics for Wave 1 |
| **H-E Quality gates** | P0 | Extended purity tests; checklist updates; legacy redirects |

---

## Finding Details

### 1. NGA Sector Export Metrics — Zero

**Root cause:** Nigeria seed sets `agoa_export_current_usd: 0` (AGOA suspended since 2015). Sectors tab hides $0 due to falsy check.

**Fix:** Show explicit `$0` + suspension badge; optional `preSuspensionBaselineUsd` field.

### 2. Export Breakdown PNG + Import Breakdown

**Export PNG:** Add `id="export-breakdown-card"` + `ExportButton` in `TradeTab.tsx`.

**Import Breakdown — Fortune 5 assessment:** High strategic value. Phase 1: `importComposition[]` in 12 trade files + UI mirror. Phase 2: HS4 top products (pilots). Phase 3: Comtrade ingestion.

### 3. JAM Tab Routing

Canonicalize bare `/country/JAM` → `/country/JAM?tab=overview`; redirect invalid tabs.

### 4. Wave 1 Opportunity Tab

Wire computed tiles from API: macro anchors, trade corridor, sector conviction, policy window.

### 5. Market Access Registry

Single source of truth (`market-access-registry.ts`) for Overview, sidebar, Trade, Opportunity. Frameworks: AGOA, AfCFTA, ECOWAS, UEMOA, EAC, COMESA, SADC, CARICOM, CBI, UK/EU EPA.

### 6. Caribbean Wave 2 Economy Gaps

Complete BRB/BHS time series (FDI, inflation, FX) for 2024–2025 in `seed-caribbean-wave2.ts`.

### 7. AGOA Platform Integration

See [Trade Policy Intelligence Demo Plan](./trade-policy-intelligence-demo-plan.md).

### 8. Regression

Keep country hard-gate redirect; update human-test-checklist to match.

---

## Execution Order

1. H-D + Tier 1 (demo path)
2. H-A quick fixes
3. H-B market access registry
4. H-B import breakdown
5. H-C opportunity enrichment
6. H-E quality gates + Tier 4 redirects

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-31 | Initial QA analysis saved from Human QA session |
