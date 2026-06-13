# Reports & AI Intelligence Platform Plan

**Date:** 2026-05-31  
**Status:** Planning — post human QA  
**Master plan:** [MASTER-EXECUTION-PLAN.md](./MASTER-EXECUTION-PLAN.md)  
**Goal:** Bloomberg-grade downloadable intelligence with GPT-4o custom reports, admin-managed templates, saved report library, and token-budget quotas per persona.

**Execution order (do not drift):** R4 quotas → R1 Puppeteer Country Profile → R2/R2b templates → R3 GPT-4o → R5 saved library → R6 admin editor.

**Pricing (customer-facing):** Business **$199/mo includes 2 AI Custom Reports** in the bundle. Incremental revenue via **AI Intelligence Add-On (+$29/mo, +5 AI reports)** and one-time report packs — never expose unit COGS. See [MASTER-EXECUTION-PLAN.md](./MASTER-EXECUTION-PLAN.md) § Pricing & reports packaging.

---

## Current State (QA baseline)

| Capability | Status |
|------------|--------|
| Report queue + history UI | ✅ Working (Professional+) |
| PDF generation (pdf-lib text layout) | ✅ Basic — profile markdown only |
| Storage (`reports` bucket + signed URLs) | ✅ Working |
| GPT-4o / OpenAI integration | ❌ Not wired |
| Template design system | ❌ Stub sections in `templates.ts` |
| Saved report library (re-download) | ⚠️ History list only — no persistent library UX |
| Admin template editor | ❌ Not built |
| Quota enforcement | ❌ Not built |

---

## Report Types & Template Design

### 1. Country Profile (Professional+)

**Audience:** Analysts, country desks  
**Length:** 8–12 pages  
**Refresh:** On-demand; cache 7 days per country

| Section | Source | Admin-editable |
|---------|--------|----------------|
| Cover + disclaimer | Template | ✅ |
| Executive summary | `souvera_country_profiles.summary_md` | ✅ |
| Macro snapshot (6 metrics) | API metrics + time series | ✅ layout |
| Sector scorecard (top 5) | DB sectors | ✅ |
| Signal scan | `country-signal-scan` | ✅ |
| Market access frameworks | `market-access-registry` | ✅ |
| Key risks (bullets) | `risk_narrative_md` truncated | ✅ |
| Sources & as-of date | Freshness block | ✅ |

### 2. Investment Memo (Business+)

**Length:** 15–25 pages

| Section | Source |
|---------|--------|
| Investment thesis | `opportunity_thesis_md` |
| Live market signals | Computed metrics |
| Entry points (3 pillars) | Opportunity content |
| Regional advantages | Opportunity content |
| Risk scorecard | Risk tab |
| Comparable markets | Rankings API (future) |

### 3. Trade Profile (Business+)

| Section | Source |
|---------|--------|
| U.S. bilateral summary | Trade tab |
| Top partners (2+3 layout) | `topPartners` |
| Export / import breakdown | `exportComposition`, `importComposition` |
| AGOA / CBI / AfCFTA status | Trade + policy data |
| Regional agreements | Trade copy |
| Trade finance mapping | Trade copy |

### 4. Sector Deep-Dive (Business+, per sector)

One template shell; **sector-specific section blocks** injected by `sector_key`:

| Block | Content |
|-------|---------|
| Sector overview | `narrative_full` |
| Scores (S/G/A) | Sector scores |
| Key players | `key_players[]` |
| Market access angle | AGOA/CBI opportunity text |
| Export potential | `agoa_export_*` fields |
| Data sources | `data_sources[]` |

Supported sector keys align with Souvera sector hub: `fintech`, `energy`, `agriculture`, `mining`, `logistics`, `tourism`, `technology`, `manufacturing`, etc.

### 5. AI Custom Report (Business+ / Institutional)

User submits natural-language query; backend assembles context + prompt.

**Example backend prompts (admin-managed in `/admin/content/report-templates`):**

```
System: You are Souvera Intelligence, an institutional-grade emerging markets analyst.
Use ONLY the provided JSON context. Cite sources inline [Source: X].
Never invent statistics. Flag data gaps explicitly.

User context: {country_payload_json}

User query: {user_query}

Output: Markdown with sections Executive Summary, Key Findings (bulleted),
Data Table (if applicable), Risks, Sources, Disclaimer.
Max 2,500 words.
```

```
System: Generate a trade policy brief for {country} focusing on {query}.
Include: current AGOA/CBI/AfCFTA status, top 3 export categories,
restoration/suspension watchpoints, and 90-day action items for U.S. importers.

Context: {trade_json + agoa_json}
```

---

## Architecture (Admin-managed, API-driven)

```
User → POST /api/v1/reports/generate
         ↓ quota check (plan + period)
         ↓ enqueue souvera_report_requests
Worker → processReportRequest()
         ↓ fetch country payload (same as /api/v1/country/[iso3])
         ↓ template render OR OpenAI GPT-4o (custom)
         ↓ PDF → Supabase Storage
         ↓ update status + signed URL
User → GET /api/v1/reports/history (saved library)
Admin → /admin/content/report-templates (CRUD prompts + sections)
Admin → /admin/data/reports (usage, quotas, cost dashboard)
```

**Trade Policy Admin today:** read-only curated TypeScript files (`agoa-legislative-tracker.ts`, `agoa-full-coverage.ts`). **Not API-driven yet.** Phase 2 migrates to `souvera_trade_policy_events` + admin CRUD (ADMIN-TPI-01).

**Reports target:** API-driven from day one of Phase R2 — templates in DB, versioned, publish workflow.

---

## Quota Model (token budget <$1M/year platform-wide)

Assumptions: GPT-4o ~$5/1M input + $15/1M output; avg custom report ~8K input + 3K output ≈ **$0.09/report**.

| Persona | Template reports / month | AI custom / month | Max tokens / report | Notes |
|---------|-------------------------|-------------------|----------------------|-------|
| Explorer | 0 | 0 | — | Upgrade CTA |
| Professional | 3 Country Profile | 0 | — | Cached PDFs count toward quota |
| Business | 5 template (any type) | **2 AI custom (included in $199)** | 12K in / 4K out | Primary tier; upsell +$29/mo add-on for +5 AI |
| Institutional | 20 template | 10 AI custom | 20K in / 6K out | Org-level pool optional |
| Platform admin | Unlimited | Unlimited | — | Internal QA |

**Rolling window:** calendar month UTC.  
**Over quota:** HTTP 429 with `{ resetAt, upgradeUrl, contactUrl }`.  
**Beyond quota:** User contacts Souvera team OR waits for reset — no silent overage.  
**Institutional overflow:** Sales-assisted batch reports (offline, not API).

**DB tables (new):**

- `souvera_report_quota_policies` — plan_id, template_limit, ai_limit, token_ceiling
- `souvera_report_usage` — user_id, period_yyyy_mm, template_count, ai_count, tokens_in, tokens_out, cost_usd

---

## Implementation Phases

| Phase | Deliverable | Est. |
|-------|-------------|------|
| **R1** | Template HTML/CSS via Puppeteer; Country Profile v2 | 5d |
| **R2** | Investment Memo + Trade Profile templates | 4d |
| **R2b** | Sector Deep-Dive (parametric) | 3d |
| **R3** | OpenAI GPT-4o custom reports + prompt admin | 5d |
| **R4** | Quota middleware + usage dashboard | 3d |
| **R5** | Saved library UX (re-download, rename, share link) | 2d |
| **R6** | Admin template editor + publish | 4d |

**Demo minimum:** R1 + R4 (quotas on existing flow)  
**Launch minimum:** R1–R5

---

## Trade Sector Taxonomy (Import / Export breakdown)

**Recommendation: hybrid model**

1. **Canonical taxonomy** (~12 categories) — shared labels for cross-country comparison and Supply-Demand matrix alignment:
   - Energy & Petroleum
   - Agriculture & Food
   - Manufacturing & Textiles
   - Machinery & Capital Goods
   - Chemicals & Plastics
   - Transport Equipment
   - Services & Other
   - Tourism & Hospitality (imports/services)
   - Mining & Minerals
   - Fintech & Digital
   - Logistics & Trade Services
   - Refined Petroleum & Energy (imports)

2. **Country-specific labels** — allowed when local data uses distinct HS aggregations (e.g. Nigeria "Crude Oil & Petroleum" vs Jamaica "Mining & Alumina"). Map to canonical key internally: `{ canonicalKey: 'energy_petroleum', label: 'Crude Oil & Petroleum', sharePct: 78 }`.

3. **Count:** Always **top 5** (2+3 layout). Optional 6th "Other" bucket if shares don't sum to 100%.

4. **Admin:** Super-admin edits via `/admin/data/trade-composition` (future) or trade data TS files today.

**Phase 2:** HS-4 top products per country (Business+), sourced from UN Comtrade curation.

---

## Opportunity Tab Enrichment (from QA)

Computed tiles now include:
- Full lead sector name (no truncation)
- Attractiveness score in sublabel
- PNG export on Live Market Signals (all countries)

**Future tiles (Wave 2):**
- FDI trend (YoY from metrics)
- Debt/GDP or fiscal anchor (Professional+)
- News pulse headline count (7d)
- Policy watchpoint badge (AGOA/CBI)

---

## Admin Super-Admin Vision

All intelligence surfaces should be admin-manageable without redeploy:

| Domain | Current | Target |
|--------|---------|--------|
| Trade policy events | TS file | DB + admin CRUD + publish |
| AGOA country status | TS file | DB + bulk import |
| AfCFTA status | TS file | DB + admin |
| Report templates | TS stub | DB + versioned publish |
| AI prompts | None | DB + A/B + audit |
| Trade composition | TS file | Admin editor per ISO3 |
| Quotas | None | Admin configurable per plan |

---

## Immediate Actions (post this QA)

1. ✅ Import/export breakdown 2+3 layout
2. ✅ Live Market Signals PNG + lead sector fix
3. ✅ Nav: AfCFTA + Supply-Demand under Trade & Policy
4. ✅ `/admin/content/trade-policy/events` page
5. ✅ Re-seed Caribbean: `npx tsx scripts/seed-caribbean-wave2.ts` (FDI/inflation/FX indicators)
6. ☐ Wire GPT-4o (R3)
7. ☐ Puppeteer PDF templates (R1)
8. ☐ Quota middleware (R4)

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-31 | Initial plan from human QA feedback |
