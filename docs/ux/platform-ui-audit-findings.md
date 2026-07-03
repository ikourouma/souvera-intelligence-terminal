# Souvera Platform UI/UX Audit Findings

**Audit date:** June 26, 2026  
**Scope:** Intelligence Terminal, Trade flows, Admin, Marketing, Persona Dashboards, PNG exports  
**Reference:** [Souvera Terminal UX & Design System Spec v1.0](./3_Souvera%20Terminal%20UX%20%26%20Design%20System%20Spec%20v1.0%20(design.md).txt)

---

## Executive Summary

| Surface | Pass | Partial | Fail | Notes |
|---------|------|---------|------|-------|
| Intelligence Terminal (7-tab) | 6 | 1 | 0 | Economy export was P0; hotfixed Phase 5 |
| Trade Intelligence flows | 7 | 2 | 0 | CollapsibleAnalysis integrated; export contract standardized |
| Admin Panel | 12 | 3 | 0 | New billing/marketing/matrix UIs; token drift on zinc vs spec |
| Marketing / Access | 4 | 1 | 0 | CMS routes exist; hero still partially hard-coded |
| Persona Dashboards | 2 | 2 | 2 | Phase 9 builds all 6 personas |
| PNG Exports | 8 | 4 | 1 | Economy Overview P0 resolved; hover PNG not universal |

**P0 items resolved this sprint:** Economic Overview blank PNG (NGA/ZWE), generic economy analysis template (Phase 8).

---

## Token Drift

| Token (spec) | Implementation | Severity | Remediation |
|--------------|----------------|----------|-------------|
| Background `#0B0F14` | `bg-zinc-950` (`#09090b`) | P2 | Document zinc-950 as canonical; update spec |
| Signal emerald | `#6ee7b7` / `text-emerald-400` | Pass | Aligned live UI + PNG footer |
| Signal blue | `#60a5fa` / `text-blue-400` | Pass | Headings, percentages |
| Signal amber | `#fbbf24` / risk inflation | Pass | HighlightedText + export-png |
| Max width 1440px | `max-w-7xl` (1280px) on some pages | P2 | Dashboard uses full width intentionally |

---

## Intelligence Terminal

### CollapsibleAnalysis + Export Contract

| Module | Live UI | Export footer | Body export-visible | Status |
|--------|---------|---------------|---------------------|--------|
| TradeTab | CollapsibleAnalysis | curatedAnalysis | Metric cards | Pass |
| EconomyTab Overview | data-export-hide-analysis | curatedAnalysis | 4 metric tiles (inline styles) | **Fixed P0** |
| AGOA Tracker / Flows | CollapsibleAnalysis | curatedAnalysis | Flow stats | Pass |
| Demand / AfCFTA / CBTPA | CollapsibleAnalysis | curatedAnalysis | Matrix headers | Pass |
| OverviewTab Momentum | Metric tiles | curatedAnalysis | Tiles | Pass (reference pattern) |
| Economy sub-cards (GDP, FX) | AnalysisBullets | inline | Charts | Partial — Phase 7 migration |

### Narrative Quality (Phase 8)

- `buildEconomyOverviewAnalysis` upgraded to tiered executive engine (74 markets)
- Regional frames: `economy-regional-frames.ts`
- Voice guide: `executive-analysis-voice.ts`
- QA gate: `scripts/test-all74-economy-analysis.ts` — all 74 pass

---

## Admin Panel

| Component | Path | Status | Drift |
|-----------|------|--------|-------|
| AdminSidebar | `components/admin/AdminSidebar.tsx` | Pass | — |
| AdminHeader | `components/admin/AdminHeader.tsx` | Pass | — |
| BillingDashboard | `components/admin/billing/*` | Pass | Modal spacing consistent |
| Marketing CMS | `components/admin/marketing/*` | Pass | — |
| MatrixManagement | `components/admin/MatrixManagementClient.tsx` | Pass | — |
| UserManagement | `components/admin/UserManagementClient.tsx` | Partial | Table pagination P2 |

---

## Persona Dashboards (Phase 9)

| Persona | Before | After Phase 9 |
|---------|--------|---------------|
| Explorer | Upgrade placeholder | ExplorerDashboard — recent views, upgrade CTA |
| Professional | Upgrade placeholder | ProfessionalDashboard — macro summary, watchlist |
| Business | POC hardcoded stats | Refactored + API stats hook |
| Investor | Shared BusinessDashboard | InvestorDashboard — risk/opportunity focus |
| Institutional | Shared BusinessDashboard | InstitutionalDashboard — API console, org context |

---

## Export Fidelity Checklist

| Card | ZWE | NGA | JAM | Status |
|------|-----|-----|-----|--------|
| Economic Overview | Metric tiles + footer analysis | Same | Same | **Fixed** |
| Key Indicators | Chart export | — | — | Pass |
| US Trade | Footer analysis | — | — | Pass |
| Supply-Demand cell | Footer analysis | — | — | Pass |

**Remaining (Phase 7):** Universal hover PNG on all 7 country tabs; Top Trade Partners card shell redesign.

---

## Issue #5 — Trade Framework Graceful Display (Non-AGOA Markets)

**Finding:** The reported "export data missing" state on ~28 markets was **not a data gap** — it was a UI/routing defect. Audits confirm the correct trade frameworks are fully populated:

- General trade snapshots: **28/28** non-AGOA markets present (with `_meta` totals)
- CBTPA flows: **20/20** Caribbean markets present

Audit scripts: `scripts/audit-export-data-coverage.ts`, `scripts/audit-nonagoa-trade-frameworks.ts`, `scripts/audit-agoa-policy-status.ts`.

**Root causes & fixes:**

| Market group | Symptom | Root cause | Fix |
|--------------|---------|------------|-----|
| Caribbean (20) | No market-access block at all | `trade.agoa` only set when an AGOA policy record exists; Caribbean has none | `route.ts`: new `fetchCbtpaMarketAccess()` populates the preferential slot from CBTPA flows → existing TradeTab renders **"CBI Market Access"** |
| North Africa (MAR/DZA/TUN/LBY) | N/A-filled "AGOA Trade Advantage" card | `"Not applicable"` label fell through to `under_review` in `mapVaultRawToAgoaDbStatus` | `trade-policy-vault.ts`: normalize label → `not_applicable` → renders **"AGOA Not Applicable"** block |
| AGOA-ineligible SSA (SDN/BDI/GNQ/ERI) | N/A-filled AGOA card | `else` branch always built a metrics card even with no flow figures | `route.ts`: only build the AGOA metrics card when at least one real figure exists; otherwise fall through to legislative-tracker-only state |

No AGOA data was fabricated — Caribbean values are sourced from `souvera_cbtpa_trade_flows`.

---

## FX Rate Vetting (All 74 Markets)

**Finding:** FX Rate displayed a hardcoded `NGN/USD` pair across all markets. Root cause: the FX unit was a static string in `EXECUTIVE_METRICS`, and the Economy tab fell back to a generic `Local/USD`.

**Audit:** `scripts/audit-all74-fx-currency.ts` — **74/74** markets have valid ISO-4217 `currency_code`. No missing/malformed codes.

**Fixes (per-country, DB-sourced):**

| Surface | Before | After |
|---------|--------|-------|
| Executive Snapshot FX metric | `NGN/USD` (static) | `{currency_code}/USD` from `data.country.currencyCode`; USD territories (PRI/VGB/TCA) show `USD` not `USD/USD` |
| `EXECUTIVE_METRICS` default | `unit: 'NGN/USD'` | `unit: 'Local/USD'` neutral fallback (panel overrides) |
| Economy tab FX chart | `Local/USD` generic fallback | `{currency_code}/USD`; curated profiles (e.g. ZWE `ZiG/USD`) preserved |
| Economy indicator table | `FX (LCU/USD)` | `FX ({pair})` per country |

## Signal / Momentum "Pending" (All 74 Markets)

**Finding:** Investor Readiness + Economic Momentum showed "Pending" for many markets. Only 24/74 have `signal_scores` rows, but all 74 have curated `souvera_country_profiles` with qualitative bands (`improving`/`stable`/`declining`, `high`/`moderate`/`low`).

**Fix:** `momentum.ts` `resolveMomentum()` now maps these curated qualitative labels to representative numeric bands (deterministic, not fabricated precision) → Momentum + Readiness render from existing curated data instead of "Pending".

**Signal Strength seeding (investment/confidence):** `scripts/seed-signal-scores-macro.ts` seeds the 50 markets that lacked a `signal_scores` row using a documented, deterministic macro-derived model (`scoring_version = 'v1.0-macro'`). The 24 hand-curated rows (`v1.0-preview`) are never overwritten. **Now 74/74 markets have signal scores.**

Methodology (all outputs 0–100, inputs from latest complete macro year; missing inputs degrade to curated profile bands):
- `growthScore = 52 + (gdpGrowth%−4)×6 + fdiBonus`, with diminishing returns above 8% so single-year commodity rebounds don't dominate `[15..92]`
- `riskScore = 48 + inflation/debt/current-acct/reserve penalties − governance×9` (higher = riskier) `[15..88]`
- `investmentScore = 0.45×growth + 0.35×(100−risk) + 0.20×governance` `[12..92]`
- `confidenceScore = 58 + (indicatorsPresent/7)×32` `[55..90]`
- `signal_level` reused from `souvera_country_profiles` (never invented)

Sanity spread: Sudan/Haiti ≈ 28 (crisis), Guyana ≈ 70 (oil boom), median emerging ≈ 50–60 — appropriately more conservative than the curated set.

## AGOA Eligibility Correction (BDI / ERI / GNQ / SDN)

**Finding:** Per [USTR](https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa) and CRS IF10149, Burundi, Eritrea, Equatorial Guinea, and Sudan are **not** current AGOA beneficiaries. ERI was wrongly stored as `eligible`; the others as `under_review`.

**Fixes:**
- Corrected the Evidence Vault to `ineligible` for all four (`scripts/correct-agoa-ineligible-markets.ts`), backed by the existing USTR "2024 List of AGOA Eligible and Ineligible Countries" artifact.
- Fixed `mapVaultRawToAgoaDbStatus` to switch on the normalized status string — capitalized client labels (`"Eligible"`, `"Ineligible"`, `"Suspended"`) were previously falling through to `under_review` on the country-page path (latent bug affecting all evidence-backed markets).
- Added `ineligible` to the `agoa.status` type, route handling, and a TradeTab "AGOA Ineligible" market-access block.

---

## Headline URL Audit

Script: `apps/api-gateway/scripts/audit-news-headline-urls.ts`  
Action: Run in CI weekly; target >80% URL coverage; "(Analysis Only)" label on SignalMomentumRow for missing URLs.

---

## Remediation Tracker

| ID | Item | Phase | Owner | Status |
|----|------|-------|-------|--------|
| UX-001 | Economy Overview blank PNG | 5 | Intelligence | **Done** |
| UX-002 | Executive economy narrative 74 markets | 8 | Content | **Done** |
| UX-003 | Component catalog in design system | 6 | UX | **Done** |
| UX-004 | All 6 persona dashboards | 9 | Product | **Done** |
| UX-005 | Top Trade Partners redesign | 7 | Intelligence | Deferred |
| UX-006 | Hover PNG all tabs | 7 | Intelligence | Deferred |
| UX-007 | Economy sub-card CollapsibleAnalysis | 7 | Intelligence | Deferred |
| UX-008 | DB tables user_preferences / saved_content | 9+ | Backend | Planned |
| UX-009 | Trade framework graceful display (non-AGOA markets, Issue #5) | 2 | Intelligence | **Done** |
| UX-010 | FX Rate hardcoded NGN/USD → per-country currency (74 markets) | 2 | Intelligence | **Done** |
| UX-011 | Signal momentum/readiness "Pending" → map curated labels | 2 | Intelligence | **Done** |
| UX-012 | AGOA eligibility correction BDI/ERI/GNQ/SDN + status-mapping bug | 2 | Data | **Done** |
| UX-013 | Seed signal_scores for 50 markets (investment/confidence) — v1.0-macro model, 74/74 covered | 2 | Data | **Done** |

---

## Design QA Checklist (applied)

- [x] CollapsibleAnalysis export contract documented
- [x] HighlightedText signal colors (emerald/blue/amber)
- [x] Export-visible inline styles on Economy metric tiles
- [x] 3-paragraph executive analysis voice
- [x] Tier-gated dashboard widgets per persona
- [ ] Playwright export smoke test (optional P2)
- [ ] Visual regression snapshots (future)
