# Report product map (7 tabs + Reports hub)

Maps the **Country Intelligence Terminal** tab model to **report products** and data/preflight contracts. Documentation-only snapshot: 2026-05-31.

## Design principle

One **template engine** for institutional PDFs (Country Profile v2 today), with **region manifests** (Africa vs Caribbean policy frameworks) and **per-product required domains**. Terminal tabs are the UX source of truth; reports are print representations of the same underlying payload where possible.

---

## A) Terminal tabs (source of truth)

| Tab ID | Label | Entitlement (`TAB_ENTITLEMENTS`) | Primary data sources | Freshness / as-of | Authoritative vs display | Preflight (when rendered in Country Profile v2) |
|--------|-------|----------------------------------|----------------------|-------------------|--------------------------|------------------------------------------------|
| `overview` | Overview | `sector_teasers` (Explorer+) | `souvera_country_profiles` (summary, why_now), `country-overview-content.ts`, `souvera_country_lite_v`, signal scan | `freshness_at` on profile/lite; macro year from observations | **Authoritative:** canonical metrics via `economyYears` + `canonicalizeCountryPayload`. **Display:** overview editorial cards | Narrative year drift, placeholder leak, copy warnings |
| `economy` | Economy | `full_macro` (Professional+) | `souvera_country_observations` (Top 20 + IMF fiscal + WGI), `country-economy-content.ts`, `souvera_country_professional_v` | `macroYear` = max year in `economyYears`; `sourceMeta` per metric | **Authoritative:** observation-backed Top 20. **Display:** narrative bullets may lag | Metric conflicts, GDP scale in prose, numeric governance (high-trust paths) |
| `sectors` | Sectors | `sector_teasers` / `sector_rationale` | `souvera_country_sectors` (scores, teaser, rationale), `country-sectors-content.ts` | Sector rows `updated_at`; no global sector as-of stamp | **Authoritative:** DB scores when present. **Display:** teasers (client PDF neutralizes unsourced $) | Unsourced numerics in teasers → backlog / stripped in PDF |
| `opportunity` | Opportunity | `investment_thesis` (Business+) | `souvera_country_profiles.opportunity_thesis_md`, `country-opportunity-content.ts`, parsed pillars | Profile `freshness_at` | **Authoritative:** canonical macro in pillars via hydration. **Display:** thesis markdown | Numeric governance on opportunity titles |
| `risk` | Risk | `risk_analysis` (Business+) | `souvera_country_profiles.risk_narrative_md`, `country-risk-content.ts` | Profile `freshness_at` | **Display-heavy** risk cards; canonical macro for closing summary | Narrative contradictions vs canonical GDP/growth |
| `trade` | Trade | `trade_data` (Business+) | Curated `*-trade.ts` files, `tradeSummary` in report payload, policy registry | `tradeSummary.asOfYear` when set | **Authoritative:** policy registry (Evidence Vault). **Display:** trade USD strings from curated files | Policy `POLICY_NO_EVIDENCE` if asserting Eligible without artifact |
| `reports` | Reports | `full_macro` (Professional+ generate) | `souvera_report_requests`, `/api/v1/reports/generate`, quota tables | Per-request `created_at`; policy `last_reviewed_at` | **Authoritative:** generated PDF from `fetchCountryProfileReportData` + preflight | Same as Country Profile v2 when `templateVersion=v2` |

**Tab UI entry:** `apps/api-gateway/src/components/intelligence/CountryIntelligencePanelV2.tsx`  
**Entitlements:** `apps/api-gateway/src/lib/intelligence-entitlements.ts`

---

## B) Report types (Reports hub)

| Report type | Min plan | Template / entrypoint | Page target | Section order (v2 implemented) | Required domains | Missing domain behavior | Preflight |
|-------------|----------|----------------------|-------------|-------------------------------|------------------|-------------------------|-----------|
| **Country Profile** | Professional+ | `generateCountryProfileFullV2` → `renderCountryProfileV2Html` (`country-profile-v2-html.ts`) | ~15–25 pages | Cover → Dashboard → Exec Summary → Geography → Political → Economic → Trade → Sectors → Opportunity → Risk → Signal → Appendix | Macro (Top 20), policy registry (Evidence Vault), sectors (partial), trade summary (curated), narratives | **Not covered** panels; omit policy rows without evidence | **Strict:** `preflightValidate` — errors block PDF (`PLACEHOLDER_LEAK`, `POLICY_NO_EVIDENCE`, metric conflicts, etc.) |
| **Investment Memo** | Business+ | `renderReportPdfBytes` + `buildReportSections` (`templates.ts`) | ~5–8 (v1 layout) | Executive Summary → Investment Thesis → Risk → Disclaimer | opportunity thesis, risk narrative, summary | Stub sections if MD empty | **TODO:** no v2 institutional template; no dedicated preflight |
| **Trade Profile** | Business+ | `templates.ts` | ~5–8 | Executive Summary → U.S. Trade Relationship → Disclaimer | trade tab data, policy (AGOA/CBI) | Generic stub copy | **TODO:** no v2 template |
| **Sector Deep-Dive** | Business+ | `templates.ts` | 10–15 (UI label) | Executive Summary → Sector Analysis → Disclaimer | single sector scores + narrative | Generic stub; **sector not passed to API** | **TODO:** no v2 template; dropdown UI-only |
| **AI Custom Report** | Business+ | `templates.ts` | Variable | Custom Query → Executive → Thesis/Risk → Disclaimer | user `query` + profile MD | Only `query` sent to API today; budget/timeline/risk appetite **UI-only** | **TODO:** no v2 template |

**API:** `POST /api/v1/reports/generate` — `apps/api-gateway/src/lib/reports/report-generate-handler.ts`  
**Processing:** `apps/api-gateway/src/lib/reports/process-report-request.ts` (v2 only for **Country Profile**)

**v2 gate:** `templateVersion=v2` allowed only when `reportType === 'Country Profile'` (`reports-v2-config.ts`).

---

## C) Region manifests (Africa vs Caribbean)

| Aspect | Africa (54) | Caribbean (20) |
|--------|-------------|----------------|
| Policy frameworks | AGOA, AfCFTA, ECOWAS (subset) | CBI, CARICOM |
| Evidence jobs | `verify:ustr:agoa`, `verify:regional` | `verify:ustr:cbi`, `verify:regional` |
| Trade curated files | `nigeria-trade.ts`, `wave1-africa-trade.ts`, etc. | `jamaica-trade.ts`, `caribbean-wave2-trade.ts` |
| Country Profile template | **Same engine** | **Same engine** |
| Coverage manifest | `docs/coverage/africa-coverage.md` | `docs/coverage/caribbean-coverage.md` |

---

## D) AI Custom Report parameters (UI vs API)

| Parameter | UI location | Sent to API? | Notes |
|-----------|-------------|--------------|-------|
| Text prompt | `ReportsTab.tsx` textarea | **Yes** (`query` field) | |
| Budget range | `<select>` $1–5M … $25M+ | **No** | Roadmap — not in `report-generate` body |
| Timeline | `<select>` 0–6mo … 18+mo | **No** | Roadmap |
| Risk appetite | Conservative / Moderate / Aggressive | **No** | Roadmap |

---

## E) Report Definition Registry (proposed keys)

For future unified engine — **documented intent, not yet a code module:**

| Product key | Tabs mirrored | Region manifest |
|-------------|---------------|-----------------|
| `country_profile_v2` | All 7 (full) | `africa` \| `caribbean` by ISO3 |
| `investment_memo_v1` | Overview, Opportunity, Risk | by ISO3 |
| `trade_profile_v1` | Trade, Overview | by ISO3 |
| `sector_deep_dive_v1` | Sectors (+ Opportunity optional) | by ISO3 |
| `ai_custom_v1` | All (synthesis) | by ISO3 |

Machine-readable snapshot: `tmp/report-product-map.json`.
