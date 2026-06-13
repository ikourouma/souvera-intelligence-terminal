# Reports Template Blueprint

**Date:** 2026-05-31  
**Status:** R1 elevated templates shipped · R2b PPTX backlog · R3 AI pipeline next  
**Related:** [reports-ai-platform-plan.md](./reports-ai-platform-plan.md) · [MASTER-EXECUTION-PLAN.md](./MASTER-EXECUTION-PLAN.md)

---

## Executive summary

Souvera reports must read at **Afreximbank / Bloomberg institutional grade**: full-bleed cover, copyright imprint, table of contents, numbered sections, running headers/footers, and data-as-of provenance. AI is a **differentiator** for narrative depth and custom briefs—not a substitute for design fidelity.

**Implementation today (R1):**

| Layer | Path | Status |
|-------|------|--------|
| Design system | `lib/reports/templates/report-design-system.ts` | ✅ Cover, TOC, sections, Puppeteer chrome |
| Country Profile | `templates/country-profile-html.ts` | ✅ 8 sections |
| Business templates | `templates/institutional-report-html.ts` | ✅ Investment Memo, Trade Profile, Sector Deep-Dive, AI Custom, Country Risk shell |
| Renderer | `render-report.ts` + `render-pdf-puppeteer.ts` | ✅ Puppeteer primary, pdf-lib fallback |
| Storage resilience | `ensure-reports-bucket.ts` | ✅ Auto-create `reports` bucket if migration missing |

---

## Reference bar (what we beat)

| Reference | What to surpass |
|-----------|-----------------|
| Afrexim *Trinidad Country Brief* | Cover hierarchy, TOC, section numbering, disclaimer page |
| Afrexim *African Trade Report* | Regional trade narrative + data tables |
| Afrexim *CAAG West Africa* | Multi-country regional framing (future: Regional Brief template) |
| Bloomberg *Country Risk* | Risk committee layout, indicator panels, concise executive lead |

**Souvera edge:** Live terminal data (metrics, signal scan, market access, trade partners) + AI custom briefs grounded in the same foundation—not static PDFs refreshed annually.

---

## Template catalog (all types)

### 1. Country Profile — Professional+

**Pages:** 14–22 · **Refresh:** On-demand · **Structure:** 7 terminal tabs + Souvera section

| # | Section | Terminal tab | Source |
|---|---------|--------------|--------|
| Cover | Full-bleed institutional | — | Design system |
| — | Copyright & disclaimer | — | Template |
| — | Table of contents | — | 8 numbered entries |
| 01 | About Souvera Intelligence Terminal | — | Platform copy + capabilities |
| 02 | Geography & Location | Overview | Capital, region, snapshot metrics |
| 03 | Country Introduction | Overview | `country-overview-content` |
| 04 | Political Environment | Risk | `country-risk-content` political items |
| 05 | Economic Overview | Economy | Time series + `country-economy-content` |
| 06 | Trade & Key Sectors | Trade + Sectors | Trade modules, sector cards, market access |
| 07 | Opportunity & Risk | Opportunity + Risk | Pillars, entry points, mitigation |
| 08 | Signal Scan & Souvera Edge | Signal | Differentiators vs Bloomberg/Afrexim |

**Pagination fix:** Cover, copyright, and TOC each use dedicated pages (`break-after: page`); major sections start on new pages (no copyright bleeding onto cover).

**Differentiators (Souvera-only):** Live Signal Scan · Market Access Registry · Trade Policy legislative tracker · Sector S/G/A score bars · Terminal-to-PDF parity · AI Custom Briefs (R3)

### 2. Investment Memo — Business+

**Pages:** 15–25 · Afrexim opportunity brief bar  

Sections: Executive Summary → Investment Thesis → Macro & Signal → Sector Entry Points → Risk & Mitigants → Market Access & Timing.

### 3. Trade Profile — Business+

**Pages:** 12–18 · Bilateral / AGOA / AfCFTA focus  

Sections: Executive Summary → Bilateral Overview → Top Partners → Market Access Programs → Trade Outlook & Signals.

### 4. Sector Deep-Dive — Business+

**Pages:** 10–16 · One shell, sector injected via `sector_key` (R2)  

Sections: Executive Summary → Sector Scorecard (lead sector) → Macro Context → Market Access → Risks & Opportunities.

### 5. Country Risk — Business+ / Institutional (UI: backlog)

**Pages:** 12–20 · Bloomberg risk committee layout  

Sections: Risk Executive Summary → Macro Risk Indicators → Political & Policy → Economic & FX → Mitigants & Monitoring.

Template shell exists in `institutional-report-html.ts`; wire to Reports tab when risk editorial is complete.

### 6. AI Custom Report — Business+ (quota)

**Pages:** 8–15 · Query-driven  

Sections: Research Query → Executive Summary → Country Context appendix → Risk → Data appendix.  
**R3:** Replace placeholder narrative with GPT-4o structured sections (see AI pipeline below).

### 7. Regional Brief — Backlog (R2b)

West Africa / Caribbean / AfCFTA corridor reports modeled on *CAAG* and *African Trade Report*.

---

## Download formats

| Format | Status | Use case | Implementation |
|--------|--------|----------|----------------|
| **PDF** | ✅ Ready | Print, email, data room | Puppeteer HTML → PDF |
| **PowerPoint (.pptx)** | 📋 Backlog R2b | Board decks, IC presentations | `pptxgenjs` or Google Slides API from same section JSON |
| **DOCX** | 📋 Backlog | Editable annex for legal/BD | HTML → docx via `html-docx-js` or Pandoc |
| **JSON / API** | 📋 Institutional tier | Programmatic ingestion | Export `ReportSection[]` from pipeline |

**UI:** Reports tab format selector — PDF active; PowerPoint labeled “soon” until R2b.

---

## Storage bucket error (item 6)

**Symptom:** `Storage upload failed: Bucket not found`

**Fixes applied:**

1. Migration: `infra/supabase/migrations/create-reports-storage-bucket.sql` (user confirmed run)
2. Runtime: `ensureReportsBucket()` before upload — creates bucket via service role if missing
3. UI: Full error message on second line (no truncation with status badge)

**If still failing:** Verify `SUPABASE_SERVICE_ROLE_KEY` in Vercel matches the project where migration ran; bucket name must be exactly `reports`.

---

## AI pipeline recommendation (items 7 & 8)

### Short term — **Vercel AI SDK 6 (`streamText` + structured output)** ✅ Recommended for R3

| Benefit | Detail |
|---------|--------|
| Streaming UX | “Drafting section 3 of 6…” in Reports tab during AI Custom generation |
| Cost control | Section-scoped prompts; `maxTokens` per quota policy; no monolithic 20k-token dumps |
| Structured sections | `generateObject` / Zod schema → maps directly to HTML template blocks |
| Stack fit | Next.js App Router, edge-compatible, same deployment as api-gateway |

**Pattern:**

```
User query → retrieve country context (existing fetchCountryProfileReportData)
          → streamText per section (parallel where independent)
          → merge into institutional-report-html
          → Puppeteer PDF
```

**Cost guardrails:** Enforce `maxTokensIn/Out` from `souvera_report_quota_policies`; never expose unit COGS; Business plan = 2 AI reports/mo bundled.

### Medium term — **LangGraph.js v6** — Add when workflows branch

Introduce LangGraph when you need:

- Multi-step research (web + DB + news pulse) with retries
- Human-in-the-loop approval before PDF render
- Conditional routing (risk-heavy country → extra risk section)
- Audit trail of agent steps for institutional compliance

**Do not lead with LangGraph for R3 MVP** — adds orchestration complexity before template quality is proven in human QA.

### Recommended stack for Jack / Ma / Bezos / Ma evaluation

```
┌─────────────────────────────────────────────────────────┐
│  Reports Tab (streaming progress UI)                     │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Vercel AI SDK 6 — section writers + JSON schema       │
│  (gpt-4o-mini for sections, gpt-4o for exec summary)   │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Souvera data layer (metrics, trade, signals, profiles)│
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  report-design-system → Puppeteer PDF (institutional)   │
└─────────────────────────────────────────────────────────┘

Future: LangGraph wraps the middle layer when custom reports need 5+ agent steps.
```

**Model routing (cost vs quality):**

- Template reports (Country Profile, Trade, etc.): **no LLM** — data-only
- AI Custom exec summary: **gpt-4o**
- AI Custom body sections: **gpt-4o-mini** with retrieved context
- Optional add-on: “Deep research” flag → LangGraph subgraph (post-demo)

---

## Backlog (prioritized)

| ID | Item | Tier |
|----|------|------|
| R2b-1 | PowerPoint export (`pptxgenjs`, slide master matching cover) | Business+ |
| R2b-2 | Country Risk in Reports tab | Business+ |
| R2b-3 | Regional Brief template | Institutional |
| R2b-4 | DOCX download | Business+ |
| R3-1 | Vercel AI SDK wired to AI Custom Report | Business+ |
| R3-2 | Streaming section progress in UI | Business+ |
| R5 | Saved report library (re-download, share link) | All paid |
| R6 | Admin template editor (cover copy, section order) | Admin |

---

## Trade & Policy Report Line (R2c — differentiation)

**Opportunity:** Bloomberg publishes generic country risk; Afrexim publishes static trade reports. Souvera already has live **AGOA**, **AfCFTA**, and **Supply & Demand** hubs — exportable PDFs are a natural moat.

| Report | Tier | Source data | Sections (proposed) | Why Souvera wins |
|--------|------|-------------|---------------------|------------------|
| **AGOA Policy Intelligence Report** | Business+ | `agoa-full-coverage`, legislative tracker, country eligibility | Executive summary · Eligibility matrix · Restoration watchlist · Sector export map · Legislative timeline · Country spotlights | Live suspension/restoration status + sector-level export potential — not annual PDF |
| **AfCFTA Corridor Brief** | Business+ | `trade/afcfta` API, regional trade TS | AfCFTA status · Tariff phase-down · Corridor volumes · Rules of origin · Member country table | Continental FTA intelligence tied to terminal map |
| **Supply & Demand Outlook** | Professional+ | Supply-demand hub, commodity signals | Commodity balance · Import dependency · Export opportunity · Regional flow map · Price/signal context | Commodity intelligence Bloomberg charges extra for |
| **Trade Policy Legislative Digest** | Institutional | Admin trade-policy events, news pulse | Bill tracker · Committee actions · Effective dates · Impacted countries/sectors | No Afrexim/Bloomberg equivalent for AGOA/AfCFTA bill tracking |

**Rollout order:** AGOA Report (demo-ready data exists) → AfCFTA Brief → Supply & Demand → Legislative Digest.

**Implementation:** Reuse `report-design-system.ts` + new `trade-policy-*-html.ts` templates; wire from Intelligence → Trade hub “Export PDF” and Reports tab “Policy Reports” section.

**Brand:** Same cover shell (country or “West Africa Region”), gold rule, emerald section headers, contact back page.

---

## Human QA checklist (reports)

- [ ] Cover: **Country name above** report type; imprint panel at bottom (division + classification left, ISO/region + dates right)
- [ ] Souvera brand: navy cover, gold rule, emerald section headers & metric accents
- [ ] TOC: 9 content sections + contact back page
- [ ] No sector/pillar/risk card split across pages
- [ ] Sections 07 Opportunity and 08 Risk are separate with grey pillar boxes
- [ ] Contact sheet: HQ address, souveraterminal.com, intelligence@souveraterminal.com
- [ ] Regenerate Country Profile after server restart

---

## File map

```
apps/api-gateway/src/lib/reports/
  report-brand.ts                  # Souvera colors, contact, cover gradient
  templates/
    report-design-system.ts      # CSS + cover/TOC/contact/section primitives
    country-profile-html.ts      # Country Profile
    institutional-report-html.ts # Business+ types
  country-profile-data.ts        # Data assembly + summary fallback
  render-report.ts               # Type router
  render-pdf-puppeteer.ts        # Chromium PDF + header/footer
  ensure-reports-bucket.ts       # Bucket guard
  process-report-request.ts      # Queue processor
```
