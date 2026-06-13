# Country Report v2 — Generation Audit

**Purpose:** End-to-end documentation of the v2 institutional Country Profile PDF pipeline for external review. No refactor recommendations — inspection only.

**Generated:** 2026-06-03  
**Primary test market:** Nigeria (`NGA`)  
**Debug artifact:** `tmp/nga-v2-final-model.json` (produced via `apps/api-gateway/scripts/dump-nga-v2-final-model.ts`)

---

## 1) High-level pipeline

### 1.1 Entry points

| Entry | Path | Behavior |
|-------|------|----------|
| **Production API (v1 JSON)** | `apps/api-gateway/src/app/api/v1/reports/generate/route.ts` | Default `templateVersion: v1`. Calls `handleReportGenerate()` → `processReportRequest()`. |
| **Production API (v2 PDF)** | `apps/api-gateway/src/app/api/v2/reports/generate/route.ts` | Default `templateVersion: v2`, `responseMode: pdf`. Same handler; returns `application/pdf` or **422** preflight JSON. |
| **Shared handler** | `apps/api-gateway/src/lib/reports/report-generate-handler.ts` | Auth, quota, queue `souvera_report_requests`, invoke processor. |
| **Async processor** | `apps/api-gateway/src/lib/reports/process-report-request.ts` | When `templateVersion === 'v2'` and `reportType === 'Country Profile'`, uses v2 generator; else v1 `renderReportPdfBytes()`. |
| **v2 library API** | `apps/api-gateway/src/lib/reports/generate-country-profile-v2.ts` | `generateCountryProfileFullV2()`, `generateCountryProfileCoverV2()`, `runCountryProfileIntegrity()`. |
| **Scripts** | `apps/api-gateway/scripts/test-country-profile-v2.ts` | Full v2 PDF (local). |
| | `apps/api-gateway/scripts/test-country-profile-cover-v2.ts` | Cover-only PDF. |
| | `apps/api-gateway/scripts/dump-country-profile-payload.ts` | Raw/hydrated payload JSON. |
| | `apps/api-gateway/scripts/dump-nga-v2-final-model.ts` | Final render model + preflight (this audit). |
| | `apps/api-gateway/scripts/test-reports-v2-api-integration.ts` | Config + preflight unit checks (no Puppeteer). |
| **v1 fallback (unchanged)** | `apps/api-gateway/src/lib/reports/render-report.ts` | `buildCountryProfileHtml()` + Letter PDF when not v2. |

**Feature flags:** `apps/api-gateway/src/lib/reports/reports-v2-config.ts` — `REPORTS_V2_ENABLED`, `REPORTS_V2_ALLOWLIST_USER_IDS`, `REPORTS_PROOF_LAYOUT_ALLOWED`.

### 1.2 Sequence (v2 full report)

```
1. fetchCountryProfileReportData(iso3)
   └─ country-profile-data.ts
      ├─ Supabase: countries, lite_v, professional_v, profiles, signal_scores, sectors, observations
      ├─ Static trade: data/nigeria-trade.ts (NGA), wave1/caribbean maps
      ├─ buildSignalScan() — country-signal-scan.ts
      ├─ buildCountryProfileSections() — country-profile-sections.ts (+ intelligence content libs)
      ├─ getVerifiedMarketAccessForReport() — policy-status-registry.ts
      ├─ canonicalizeCountryPayload(assembled)
      └─ hydrateCountryProfileNarratives(assembled, canonical) — narrative-template.ts

2. generateCountryProfileFullV2(payload, { strict, proofLayout })
   └─ generate-country-profile-v2.ts
      ├─ runCountryProfileIntegrity(payload)
      │    ├─ canonicalizeCountryPayload(payload) — canonicalize-country-payload.ts
      │    └─ preflightValidate(payload, canonical) — preflight-validate.ts
      ├─ [BLOCK if errors && strict && !proofLayout] → { ok: false, preflight }
      ├─ renderCountryProfileV2Html({ payload, canonical }) — templates/country-profile-v2-html.ts
      │    ├─ buildCoverPageModel() — templates/cover-page-v2-html.ts
      │    └─ renderDashboard | Executive | Geography | … | Appendix
      └─ renderHtmlToPdfA4WithHeaderFooter(html, meta) — render-pdf-puppeteer.ts

3. processReportRequest (production)
   └─ Upload PDF to Supabase storage `reports/{userId}/{requestId}.pdf`
   └─ Return signed downloadUrl (v1 JSON) or raw PDF bytes (v2 route)
```

### 1.3 Puppeteer settings (v2 full)

| Setting | Value | File |
|---------|-------|------|
| Format | A4 | `render-pdf-puppeteer.ts` |
| `printBackground` | `true` | |
| HTML margins | `@page` 18mm top / 24mm bottom (body CSS); cover `@page` 16mm | `report-v2-shared.ts`, `cover-page-v2-html.ts` |
| Puppeteer PDF margins (header/footer path) | top 18mm, bottom 22mm | `renderHtmlToPdfA4WithHeaderFooter` |
| `displayHeaderFooter` | `true` (full v2 only) | Header: brand line; Footer: confidentiality + country + page/total |
| `waitUntil` | `networkidle0` | |
| Profile dir | `mkdtemp('souvera-pdf-*')` under OS temp (Windows EBUSY mitigation) | |

**Output:** `Uint8Array` PDF; metadata via response headers (`X-Souvera-*`) on v2 API route.

---

## 2) Data model inventory

### 2.1 Raw payload — `CountryProfileReportData`

**File:** `apps/api-gateway/src/lib/reports/country-profile-data.ts` (interface ~L19–52; runtime also sets `markets`, `sourceMeta`, `tradeSummary.asOfYear` — consider extending the interface for completeness).

| Field | Source (NGA) |
|-------|----------------|
| `country.*` | `souvera_countries` |
| `generatedAt` | `new Date()` at fetch time (locale string) |
| `freshnessAt` | `souvera_country_profiles.freshness_at` ?? `souvera_country_lite_v.freshness_at` |
| `summary` | DB `summary_md` or `buildExecutiveSummaryFallback()` |
| `whyNow`, `opportunityThesis`, `riskNarrative` | DB profile MD (often empty for NGA) |
| `metrics[]` | `souvera_country_lite_v` + `souvera_country_professional_v` via `formatCurrency` / `formatPercent` / `formatNumber` |
| `signalScan` | `buildSignalScan()` from lite/pro scores + `macroAsOfYear` |
| `sectors[]` | `souvera_country_sectors` (top 5) |
| `marketAccess[]` | **`getVerifiedMarketAccessForReport(iso3)` only** (not `market-access-registry.ts`) |
| `tradeSummary` | Static `NIGERIA_TRADE` + `asOfYear` from `trade.asOfYear` or US bilateral year fields |
| `markets.asOfDate` | Same timestamp as platform freshness (proxy — not a separate markets feed) |
| `sourceMeta` | Hand-built map for 4 macro metric keys |
| `economyYears[]` | `souvera_country_observations` annual 2020–2025 |
| `sections` | `buildCountryProfileSections()` |

### 2.2 Canonical layer — `CanonicalCountryPayload`

**File:** `apps/api-gateway/src/types/report-integrity.ts`  
**Builder:** `canonicalize-country-payload.ts`

| Field | Derivation |
|-------|------------|
| `asOf.macroYear` | `max(economyYears[].year)` |
| `asOf.tradeYear` | `payload.tradeSummary.asOfYear` |
| `asOf.marketsDate` | `payload.markets.asOfDate` |
| `asOf.policyVerifiedAt` | `max(lastVerifiedAt)` over `policyRecords` |
| `canonicalMetrics.*` | Numeric fields from `economyYears[macroYear]` row only |
| `policyRecords` | `getPolicyStatusRegistry(iso3)` |
| `signalDrivers` | Formatted strings from canonical metrics (2–3 bullets) |
| `confidence` | Score from `dataCoverage` flags |

**Note:** `CanonicalMetrics.populationTotal` exists on the type but is **not populated** in `canonicalizeCountryPayload()` today.

### 2.3 Preflight — `PreflightReport`

**File:** `apps/api-gateway/src/types/report-integrity.ts`  
**Builder:** `preflight-validate.ts`

- `passed`: `errors.length === 0`
- `errors[]`, `warnings[]`: `PreflightIssue { code, path, message, detail? }`
- `canonical`: full canonical object embedded

### 2.4 Policy record — `PolicyStatusRecord`

**File:** `apps/api-gateway/src/types/report-integrity.ts`  
**Registry:** `policy-status-registry.ts`

### 2.5 HTML render model — `CountryProfileV2Model`

**File:** `apps/api-gateway/src/lib/reports/templates/report-v2-shared.ts`

```ts
{ payload: CountryProfileReportData; canonical: CanonicalCountryPayload }
```

Cover uses separate `CoverPageModel` (`report-integrity.ts`, built in `cover-page-v2-html.ts`).

### 2.6 Authoritative source-of-truth rules

| Domain | Authoritative | Display-only / hints | Narrative |
|--------|---------------|----------------------|-----------|
| **Macro (GDP, growth, FDI, inflation, FX)** | `economyYears[max year]` → `canonicalMetrics` | `metrics[]` strings (preflight-checked) | Hydrated placeholders + scanned text; must align or error |
| **Population** | **Gap:** only `metrics[]` string from `lite_v` | Not in `economyYears` or canonical | Geography facts from overview metrics; teasers unverified |
| **Trade totals** | `tradeSummary` formatted strings from static `CountryTrade` | — | Section prose from `country-trade-content` + static data |
| **Trade as-of** | `tradeSummary.asOfYear` | — | Shown on cover/dashboard/trade pages |
| **Markets** | `markets.asOfDate` (= platform freshness proxy) | Not a dedicated markets DB | Dashboard shows date or “Not covered” |
| **Policy status** | **`policy-status-registry` only** | Old `market-access-registry` not used in reports | AfCFTA/ECOWAS institutional dates; AGOA NGA = needs_review |
| **Sector scores** | `souvera_country_sectors` numeric scores | `teaser` text from DB | Opportunity/risk static libs |
| **Signal badge** | `signalScan.badge` from DB level + editorial suffix | Bullets: metrics + hydration | Drivers in cover/signal pages from **canonical** |

---

## 3) Template / page structure (v2 order)

Physical PDF page order = HTML `<section class="page">` order. Puppeteer adds running header/footer on all pages when using `renderHtmlToPdfA4WithHeaderFooter`.

### Page 0 — Cover

| | |
|--|--|
| **Template** | `templates/cover-page-v2-html.ts` → `renderCoverPageSection()` |
| **CSS** | `COVER_V2_CSS` (`@page` 16mm) |
| **Required** | `country`, `generatedAt`, `canonical.asOf`, `signalScan.badge`, `canonical.signalDrivers`, stance strings |
| **Optional** | `freshnessAt`, full region/capital meta |
| **As-of shown** | Report generated, platform refresh, macro year, trade year, markets date, policy verified |
| **Data paths** | `buildCoverPageModel(payload, canonical)` — stance from `sections.opportunity.lead`, `sections.risk.lead`, political/risk titles |

### Page 1 — Dashboard

| | |
|--|--|
| **Template** | `templates/country-profile-v2-html.ts` → `renderDashboard()` |
| **Required** | `canonical.canonicalMetrics`, `economyYears`, `canonical.policyRecords` |
| **Optional** | `tradeSummary`, `markets.asOfDate`, `sectors`, `sourceMeta.metrics` |
| **As-of** | macro year in intro/table; trade `canonical.asOf.tradeYear`; markets panel or warn box |
| **Canonical-only numbers** | Macro snapshot table (Latest/Prior/As-of/Source) |
| **Non-canonical** | Sector leaderboard scores; risk heatmap labels (heuristic) |

### Page 2 — Executive Summary

| | |
|--|--|
| **Template** | `renderExecutiveSummary()` |
| **Required** | `sections.opportunity.lead`, `sections.risk.lead` |
| **Optional** | Prior-year deltas from `economyYears` |
| **As-of** | macro year in base-case bullet |
| **Note** | Upside/downside bullets include template phrasing (“scores >80”, “USTR/AU sources”) not strictly data-driven |

### Page 3 — Geography & Demographics

| | |
|--|--|
| **Template** | `renderGeography()` |
| **Data** | `sections.geography.{intro, paragraphs, facts}` from overview snapshot metrics |
| **As-of** | Facts `note` may still say “GDP (2025)” if overview sublabels were not placeholder-hydrated |
| **Gap** | Population/GDP fact **values** come from display `metrics[]`, not canonical |

### Page 4 — Political Environment

| | |
|--|--|
| **Template** | `renderPolitical()` |
| **Data** | `sections.political` from `country-risk-content.ts` political items |
| **As-of** | “Sources: see Appendix” only |
| **Risk** | Static copy may cite election years (e.g. 2027) — preflight allows if not macro-tagged |

### Page 5 — Economic Overview

| | |
|--|--|
| **Template** | `renderEconomic()` |
| **Data** | `economyYears[]` full table; `sections.economic` narratives from economy tab copy + DB series |
| **As-of** | Per-row years in trajectory table |
| **Canonical** | Table numbers from `economyYears` (authoritative series) |

### Page 6 — External & Trade

| | |
|--|--|
| **Template** | `renderTrade()` |
| **Data** | `tradeSummary`, `sections.tradeAndSectors.regionalAgreements` |
| **As-of** | `canonical.asOf.tradeYear` in table |
| **Gap** | HS composition explicitly “Not covered” |

### Page 7 — Sectors & Scorecards

| | |
|--|--|
| **Template** | `renderSectors()` |
| **Data** | `sectors[]` scores + truncated `teaser`; intro from trade section |
| **As-of** | Confidence tier only |
| **Risk** | Teasers contain unverified dollar/% claims |

### Page 8 — Investment Opportunity

| | |
|--|--|
| **Template** | `renderOpportunity()` |
| **Data** | `sections.opportunity.pillars` (static + optional DB thesis merge) |
| **As-of** | None per pillar |
| **Risk** | Pillar narratives may contain estimates ($10B, 60M hectares, etc.) |

### Page 9 — Risk Assessment

| | |
|--|--|
| **Template** | `renderRisk()` |
| **Data** | `sections.risk.categories` |
| **As-of** | Partial via `{{MACRO_ASOF_YEAR}}` / `{{INFLATION}}` / `{{FX}}` in NGA static risk bodies |
| **Risk** | Non-NGA countries still have hardcoded “(2025)” in risk templates |

### Page 10 — Signal Scan & Souvera Edge

| | |
|--|--|
| **Template** | `renderSignal()` |
| **Data** | `canonical.signalDrivers`, `signalScan.badge`, `sections.signalAndDifferentiation` |
| **As-of** | macro year in confidence line |

### Page 11 — Appendix (combined)

| | |
|--|--|
| **Template** | `renderAppendix()` |
| **Data** | Methodology prose (static), `sections.glossary`, `payload.sources`, `policyRecords` URLs/dates |
| **As-of** | Policy `lastVerifiedAt` per framework |

---

## 4) Narrative system audit

### 4.1 Placeholder system

**File:** `apps/api-gateway/src/lib/reports/narrative-template.ts`

| Placeholder | Resolved from |
|-------------|----------------|
| `{{MACRO_ASOF_YEAR}}` | `canonical.asOf.macroYear` |
| `{{GDP_GROWTH}}` | `canonicalMetrics.gdpGrowthPct` |
| `{{GDP_NOMINAL_USD}}` | `canonicalMetrics.gdpCurrentUsd` |
| `{{INFLATION}}` | `canonicalMetrics.inflationCpiPct` |
| `{{FDI}}` | `canonicalMetrics.fdiNetInflowsUsd` |
| `{{FX}}` | `canonicalMetrics.fxToUsd` |
| `{{TRADE_ASOF_YEAR}}` | `canonical.asOf.tradeYear` |

**Hydration scope:**
- `payload.summary` (if contains `{{…}}` only — **plain text not rewritten**)
- `payload.signalScan.bullets` — `(2025)`/`(2024)` rewritten to placeholder then resolved
- `payload.sections` — deep walk via `hydrateDeep()`

**Skipped in preflight text scan:** `sections.glossary`, `capabilities`, `terms` (excluded in `collectTextLeaves`).

### 4.2 Narrative source files (section assembly)

**File:** `apps/api-gateway/src/lib/reports/country-profile-sections.ts`

| Content | Library |
|---------|---------|
| Overview / intro bullets | `country-overview-content.ts` |
| Economy narratives | `country-economy-content.ts` + computed `economyYears` |
| Opportunity | `country-opportunity-content.ts` + DB `opportunity_thesis_md` |
| Risk | `country-risk-content.ts` + DB `risk_narrative_md` |
| Trade framing | `country-trade-content.ts` |
| Glossary | `report-glossary.ts` |
| Extra paragraphs | `report-section-narratives.ts` |

### 4.3 Remaining hardcoded / drift vectors

| Pattern | Where still present | Preflight? |
|---------|---------------------|-----------|
| `GDP (2025)` sublabels | `country-overview-content.ts` (wave1, JAM, KEN, etc.) | Only if in NGA sections after build |
| `$10B`, `$50B`, `400+`, `70M` | Sector teasers (DB), opportunity pillars | No |
| `(2025)` in summary fallback | `buildExecutiveSummaryFallback` embeds signal bullets before hydration — NGA summary may still show `(2025)` if bullet wasn't updated before summary built | Partial (`SIGNAL_YEAR_DRIFT` if 2025 in bullets post-hydration) |
| `2027` election | Political static copy | Allowed (excluded from macro future-year rule) |
| `record`, `strongest`, `6.2%` | Reduced in NGA overview; other ISO3 unchanged | Context-dependent |
| Non-placeholder overview metrics | Geography facts use `metrics[]` display strings | Metric conflict check on `metrics[]` only |

**Grep summary (intelligence libs):** Hundreds of matches for `%`, `$`, `B`, `M`, `2025`, `2026`, `record`, `strongest` across `country-overview-content.ts`, `country-opportunity-content.ts`, `country-risk-content.ts`. Only strings that flow into **hydrated payload sections + summary** are preflight-scanned.

---

## 5) Preflight validation audit

**File:** `apps/api-gateway/src/lib/reports/preflight-validate.ts`  
**Parsers:** `parse-display-metrics.ts`

### 5.1 Errors (block when `strict: true`)

| Code | Check | Tolerance |
|------|-------|-----------|
| `METRIC_CONFLICT_GDP` | `metrics[]` “GDP current” vs `canonicalMetrics.gdpCurrentUsd` | 8% relative (`USD_TOLERANCE`) |
| `METRIC_CONFLICT_GROWTH` | GDP growth label vs canonical | 0.35 pp (`PCT_TOLERANCE`) |
| `METRIC_CONFLICT_FDI` | FDI label vs canonical | 8% relative |
| `METRIC_CONFLICT_INFLATION` | Inflation label vs canonical | 0.35 pp |
| `NARRATIVE_GDP_GROWTH` | GDP growth claims in narrative context window | canonical ± ~1.35 pp |
| `NARRATIVE_FUTURE_YEAR` | Macro-tagged year > macroYear+1 | — |
| `NARRATIVE_UNSCOPED_YEAR` | “in {year}” for GDP/growth/inflation without `economyYears` row | — |
| `NARRATIVE_GDP_SCALE` | `$XB` near “gdp” vs canonical scale | 25% relative; skips historical `(YYYY)` rows |
| `POLICY_NO_SOURCE` | AGOA active/suspended without URL | — |
| `POLICY_UNVERIFIED_DATE` | Asserted status without `lastVerifiedAt` | — |
| `POLICY_UNVERIFIED_LABEL` | `marketAccess` shows Active/Suspended/Eligible but registry unknown | — |
| `NO_MACRO_YEAR` | Empty `economyYears` | — |

**Skips in narrative scan:**
- Lines with `→` and `(YYYY)` or `indicatorBullets` or “over N years”
- Glossary/terms

### 5.2 Warnings (do not block)

| Code | Check |
|------|-------|
| `SIGNAL_YEAR_DRIFT` | `(2025)` in signal text while macro as-of < 2025 |
| `POLICY_NEEDS_REVIEW` | `needs_review` or `conflict` policy status |

### 5.3 Not checked (gaps)

- Population metric vs any structured series
- Sector teaser numeric claims
- Trade partner `sharePct` vs composition tables
- Cross-field unit mistakes (e.g. FX quoted as %)
- Duplicate conflicting numbers **within** static libs not copied to payload
- Promotional language / linter
- `proofLayout` bypass only when `REPORTS_PROOF_LAYOUT_ALLOWED` or `NODE_ENV=development`

---

## 6) Policy registry audit

### 6.1 AGOA data sourcing

| Item | Detail |
|------|--------|
| **Curated list** | `apps/api-gateway/src/data/agoa-full-coverage.ts` — `SUSPENDED` set includes `NGA`; `getAgoaCountryRecord()` merges overrides from `agoa-legislative-tracker.ts` |
| **Default as-of** | `agoa_as_of_date` / `agoa_last_reviewed_at` = `2026-01-15` in `buildDefaultRecord()` |
| **Source URL** | `AGOA_SOURCE_URL` = `https://ustr.gov/issue-areas/trade-development/preference-programs/african-growth-and-opportunity-act-agoa` |
| **Update cadence** | Code/constants — **not** live USTR scrape; manual/curated updates |

### 6.2 Why NGA is `needs_review`

**File:** `policy-status-registry.ts` — `AGOA_NEEDS_REVIEW_ISO3 = new Set(['NGA'])`

Institutional rule: do **not** assert Suspended/Eligible for Nigeria until reconciled against current USTR beneficiary list. Overrides `getAgoaCountryRecord()` which would otherwise return `suspended` from `agoa-full-coverage.ts`.

### 6.3 Status rendering

| Status | Label in PDF |
|--------|----------------|
| `needs_review` | Unverified (Needs review) |
| `conflict` | Conflict (Needs review) |
| `unknown` | Unverified |
| `active` / `suspended` / etc. | Mapped labels (Eligible, Suspended, …) |

### 6.4 Evidence stored

Per `PolicyStatusRecord`: `authoritativeSourceUrl`, `lastVerifiedAt` (ISO string or null). Appendix lists framework + URL + date.

### 6.5 Upgrading NGA AGOA out of `needs_review`

Would require:
1. Verified row against USTR beneficiary list (documented URL + scrape or manual attestation date)
2. Remove `NGA` from `AGOA_NEEDS_REVIEW_ISO3` **or** replace with curated override in `AGOA_CURATED_OVERRIDES`
3. Set `lastVerifiedAt` to verification timestamp
4. Re-run preflight — `POLICY_NEEDS_REVIEW` warning may clear; `hasVerifiedPolicy` in confidence may increase

---

## 7) Sources and provenance (`sourceMeta`)

**Defined at fetch:** `country-profile-data.ts` (runtime object; extend interface for typing).

| Metric key | `source_name` | `source_url` | `as_of` | `retrieved_at` |
|------------|---------------|--------------|---------|----------------|
| `gdp_current_usd` | World Bank / Souvera country_lite_v | **missing** | macro year | lite/profile freshness |
| `gdp_growth_pct` | World Bank / Souvera country_lite_v | missing | macro year | — |
| `fdi_net_inflows_usd` | World Bank / Souvera country_professional_v | missing | macro year | — |
| `inflation_cpi_pct` | World Bank / Souvera country_professional_v | missing | macro year | — |
| `fx_to_usd` | — | — | — | — |
| `population` | — | — | — | — |

**Dashboard:** Uses `sourceMeta` per row or “Source: Not provided”; FX row = “Source: multiple (see Appendix)”.

**Appendix:** Generic `payload.sources` string + per-policy URLs from registry (not per-metric URLs).

**Missing provenance:** Population, trade partners, sector teasers, opportunity pillar stats, political risk stats, markets domain (only freshness proxy).

---

## 8) Nigeria end-to-end snapshot

**Artifact:** `tmp/nga-v2-final-model.json`

| Stamp | Value (sample run 2026-06-03) |
|-------|-------------------------------|
| `macroAsOfYear` | **2024** |
| `tradeAsOfYear` | **2024** (`NIGERIA_TRADE.asOfYear`) |
| `marketsAsOfDate` | `2026-05-26T19:20:29.1+00:00` (platform freshness) |
| `policyVerifiedAt` | `2026-01-15` (AfCFTA/ECOWAS institutional date; AGOA unverified) |

| Preflight | Value |
|-----------|-------|
| `passed` | `true` |
| `errors` | `0` |
| `warnings` | `1` — `POLICY_NEEDS_REVIEW` (AGOA) |

**Canonical metrics (2024 row):** GDP $477.38B, growth 3.25%, FDI $4.5B, inflation 18.75%, FX 1547.50.

**Known residual in payload:** `summary` text may still contain “FDI inflows $4.5B **(2025)**” because fallback summary is built before signal bullet year fix and summary has no `{{}}` placeholders.

**Regenerate:** `cd apps/api-gateway && npx tsx scripts/dump-nga-v2-final-model.ts`

---

## 9) Risk register — remaining inconsistency vectors

1. **`metrics[]` vs `economyYears`** — Display strings from `lite_v`/`professional_v` “current” views; canonical from max observation year — preflight catches large drift, not rounding labels on cover/dashboard if only in non-scanned fields.

2. **Population** — String in `metrics[]` only; not in canonical or `sourceMeta`; geography facts repeat display value.

3. **`summary` / executive fallback** — Free-text without placeholder hydration; can retain stale years from signal merge.

4. **Sector teasers** — Rich numeric marketing copy from DB; no preflight or `sourceMeta`.

5. **Opportunity/risk static libs** — Many hardcoded `$`/`%`/`2025` for non-NGA; NGA partially templated; other ISO3 unchanged.

6. **Markets “as-of”** — Reuses profile/lite freshness, not market-specific dataset; dashboard can imply markets coverage when only timestamp exists.

7. **Trade** — Totals from static TS files; partner shares unverified; composition not in report.

8. **Policy** — AfCFTA/ECOWAS use institutional constant `2026-01-15`; AGOA NGA deliberately unverified.

9. **Risk heatmap / executive upside-downside** — Editorial heuristics, not computed from data.

10. **Confidence score** — Does not downgrade for `needs_review` on AGOA (warning only).

11. **v1 PDF path** — Still available via API default; different template (`country-profile-html.ts`) without preflight gate.

12. **Geography overview sublabels** — Non-NGA countries still use literal `(2025)` in overview metrics copied to facts.

13. **Glossary / methodology** — Excluded from contradiction scan.

14. **Quota / request record** — No `templateVersion` stored on `souvera_report_requests` row (operational traceability gap).

---

## Related docs

- API wiring: `docs/execution/reports-v2-api.md`
- Schema inspection (v1-oriented): `docs/execution/country-profile-data-schema-inspection.md`
