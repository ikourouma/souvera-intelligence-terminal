# Intelligence Export, Branding & Tier Governance

**Date:** May 20, 2026  
**Status:** Approved recommendations (pending stakeholder sign-off on header subline)  
**Owners:** Product, Legal, Intelligence Editorial  
**Related code:** `export-png.ts`, `export-branding.ts`, `OverviewTabV2.tsx`, `render-pdf.ts`, `/contact`, `lead_submissions.access_type`

---

## 1. Overview tab — two distinct sections

On `/country/{iso3}` Overview, two blocks address timing and analysis separately. They must **not** share the same title.

| Section | DOM id | Label | Content source | Purpose |
|---------|--------|-------|----------------|---------|
| Structured timing thesis | `#why-now-card` | **Why Now** | Curated card UI (scannable 3-point framework) | Answers *"Why invest now?"* — timing, policy, demographics |
| Editorial narrative | `#souvera-country-analysis` | **Souvera Country Analysis** | `souvera_country_profiles.why_now_md` via API | Souvera-authored prose analysis — context, nuance, editorial judgment |

**Decision (May 2026):** Renamed the API-driven block from "Why Now" to **Souvera Country Analysis** to eliminate duplicate headings.

**Concern logged:** Stakeholders noted two "Why Now" labels confused users about which block was authoritative.

---

## 2. Export attribution policy (subscription platform)

### Decision: No diagonal watermark on PNG or PDF

For a subscription B2B intelligence platform, attribution follows the **Bloomberg / Refinitiv / S&P** model:

- **Header chrome** — brand mark, card title, country + flag, as-of date  
- **Footer chrome** — domain, contact email, copyright, data sources  
- **Legal layer** — Terms of Service + Privacy Policy (redistribution, proprietary analysis)

Watermarks are **not used** on subscriber exports. They imply free-tier or leak-prone content and reduce readability for institutional decks.

### Implemented export branding

| Element | Value |
|---------|--------|
| Domain | `souveraterminal.com` |
| Email | `intelligence@souveraterminal.com` |
| Header primary | `SOUVERA` (wordmark) |
| Header secondary | Card title (e.g. "Why Now", "Sector Comparison") |
| Header right | Country flag + country name (bold) + date |
| Footer line 1 | Domain · email |
| Footer line 2 | © Souvera Intelligence Terminal · Source attribution |
| Default sources | World Bank, IMF, UN Comtrade, Souvera Analysis |

### Technical conventions

- UI-only controls stripped via `data-export-exclude` (PNG buttons, in-card duplicate footers, help tooltips inside export targets).
- PNG engine: `modern-screenshot` (avoids Tailwind v4 `oklab` parse errors from html2canvas).
- PDF engine: `pdf-lib` header/footer chrome; no body watermark.

### Open item — legal copy

Add to `/legal/terms` (recommended):

> Exported intelligence materials (PNG, PDF, and reports) remain proprietary Souvera analysis. Redistribution outside your organization requires a separate license unless otherwise agreed in writing.

### Open item — export audit trail (PDF pipeline)

Optional footer token: `Export ID: {iso3}-{card}-{date}` for support and compliance traceability.

---

## 3. Export header naming — "SOUVERA" vs full product name

**Status:** Analysis complete. **No header change applied** pending stakeholder sign-off.

### Fortune 100–grade benchmark

| Platform | Header / chrome | Footer / legal |
|----------|-----------------|----------------|
| Bloomberg Terminal | "Bloomberg" | Bloomberg Finance L.P. + disclaimers |
| Refinitiv / LSEG | "Refinitiv" or LSEG mark | London Stock Exchange Group |
| S&P Capital IQ | "S&P" / "Capital IQ" | S&P Global Market Intelligence |
| Moody's Analytics | "Moody's" | Moody\'s Analytics, Inc. |
| EIU | "EIU" in UI | Economist Intelligence Unit on formal PDFs |

**Pattern:** Short wordmark in header; full product or legal entity in footer and contracts.

### Stress test matrix

| Scenario | SOUVERA only | Full "Souvera Intelligence Terminal" in header |
|----------|--------------|--------------------------------------------------|
| Analyst forwards PNG internally | Footer + card title sufficient if user knows product | Self-explanatory for cold recipients |
| Board deck screenshot | Header + footer attribute source | More verbose, less terminal-native |
| Legal / compliance | Entity must appear in footer + Terms, not header size | Same |
| Early-stage brand recognition | May not signal "intelligence platform" alone | Clarifies category |
| Mature brand | Matches Bloomberg single-word convention | Can feel redundant |
| MSA / procurement alignment | Contract name in footer satisfies most enterprises | Easier 1:1 match with order form |
| Nav consistency | Matches MegaNav "SOUVERA" | Diverges unless nav also changes |

### Recommendation (for review)

**Two-tier header (when approved):**

1. **Line 1:** `SOUVERA` — primary wordmark (terminal chrome)  
2. **Line 2 (small):** `Intelligence Terminal` — product descriptor  
3. **Footer:** Full attribution including legal entity: `© Souvera Intelligence Terminal · Afronovation, Inc.`

**Verdict:** SOUVERA alone is **sufficient as the primary mark** if footer carries product + legal identity. For an early B2B brand, add the small **Intelligence Terminal** subline — do **not** replace the wordmark with the full name as the dominant header.

---

## 4. Upgrade workflow — Contact form Access Type

### Decision: Structured `access_type` field on lead submissions

When Professional users upgrade via `/contact?plan=business&intent=upgrade&source=…`:

| Field | Auto-filled value |
|-------|-------------------|
| Inquiry Type | Access & Pricing |
| Access Type | `business` (next tier up) |
| Message | Prefilled upgrade text + source reference |

**Rationale:** Super admins can filter `lead_submissions.access_type` without parsing free text. Message retains context.

**Migration:** `infra/supabase/migrations/add-lead-submissions-access-type.sql`

**API:** `POST /api/v1/leads` accepts `access_type` ∈ {explorer, professional, business, institutional}.

---

## 5. Souvera Country Analysis — Professional tier visibility

**Stakeholder question:** Is it necessary to show **Souvera Country Analysis** to Professional plan holders?

**Current implementation (May 2026):**

- UI gate: `full_macro` entitlement (Professional, Business, Investor, Institutional, Admin)
- API gate: `narrative.whyNow` returned when `full_macro` (`country/[iso3]/route.ts`)
- Explorer: does **not** receive API narrative or UI block
- Structured **Why Now** card (`#why-now-card`): visible to **all tiers** (including Explorer); export gated to Professional+

### Content ladder (entitlement model)

| Content | Entitlement | Tier |
|---------|-------------|------|
| Headline macro, teasers | `headline_macro`, `sector_teasers` | Explorer+ |
| Full macro metrics, sector scores | `full_macro` | Professional+ |
| `why_now_md` → Souvera Country Analysis | `full_macro` | Professional+ |
| `summary_md` → Full Country Summary | `full_macro` | Professional+ |
| Country Profile PDF | `full_macro` | Professional+ |
| `opportunity_thesis_md` | `investment_thesis` | Business+ |
| `risk_narrative_md` | `risk_analysis` | Business+ |
| Trade tab data | `trade_data` | Business+ |

Souvera Country Analysis sits at the **Professional editorial layer**, not the Business thesis layer.

### Stress test — show to Professional?

| Test | Show to Professional | Hide from Professional (Business+ only) |
|------|----------------------|----------------------------------------|
| **Plan promise alignment** | Professional marketing includes Country Profile + full macro; hiding authored analysis under-delivers | Business owns "advanced reports" and deep thesis |
| **API consistency** | API already returns `whyNow` at `full_macro`; hiding UI while data exists in network tab is weak security theater | Would require new entitlement (e.g. `country_analysis`) + API change |
| **Country Profile PDF** | PDF uses `summary_md`; analysis block is companion context on Overview — consistent UX | Users generate PDFs but can't preview related narrative on same tab |
| **Upgrade lever** | Business upgrade driven by Investment Memos, Trade, Risk, Opportunity tabs — not Overview prose | Reserves Souvera-branded editorial for Business+ |
| **Redundancy with Why Now card** | Card = scannable framework; Analysis = full prose — complementary | Two blocks still exist; only second is gated |
| **"Souvera" in title at Pro tier** | Reinforces brand for paying subscribers | May feel like Business-premium branding on mid tier |
| **Explorer differentiation** | Clear jump: Explorer sees card only; Pro sees card + analysis | Weaker Pro vs Explorer gap if analysis hidden |
| **Bloomberg analog** | Professional users get country economic snapshots + brief research context | Full research notes often higher tier |
| **Support / confusion** | "I pay for Professional — where is the analysis?" | "Why can't I see what Business sees?" — expected |
| **Editorial cost** | Content supports retention of core paid tier | Concentrates premium IP on higher ARPU |

### Concerns logged

1. **Naming:** "Souvera Country Analysis" may imply Business-grade IP to some stakeholders; content is gated correctly but label sounds premium.  
2. **Redundancy:** Why Now card + Country Analysis on same scroll — mitigated by distinct titles and formats (card vs prose).  
3. **Hardcoded Why Now card:** Still visible to Explorer with Nigeria-specific copy — future work: API-driven or tier-aware card.  
4. **PDF pipeline:** Country Profile does not yet embed `why_now_md`; when it does, hiding Overview block for Professional would be inconsistent.

### Recommendation — Option A approved (May 2026)

**Yes — show Souvera Country Analysis to Professional holders.**

| Aspect | Decision | Status |
|--------|----------|--------|
| **Content visibility** | Keep at `full_macro` (Professional+) | ✅ Approved |
| **Section title** | **Souvera Country Analysis** (all paid tiers) | ✅ Option A |
| **Layout** | Expanded by default; bullet pillars + Investment Window callout | ✅ Implemented |
| **Metric highlighting** | Emerald ($), blue (%), purple (demographics) — Overview palette | ✅ Implemented |
| **Business upgrade story** | Gate Opportunity, Risk, Trade, advanced reports — not this block | Policy |

**Implementation:** `CountryAnalysisSection.tsx`, `parse-country-analysis.ts`, `highlight-metrics.ts`; seeds updated for NGA + JAM.

**Final verdict:** Removing this block from Professional would under-deliver the SKU and conflict with API entitlements. Business value remains in thesis, risk, trade, and advanced reports.

---

## 6. Decision log

| Date | Decision | Status |
|------|----------|--------|
| 2026-05-20 | Rename second Overview block to Souvera Country Analysis | Implemented |
| 2026-05-20 | Remove PNG/PDF diagonal watermark | Implemented |
| 2026-05-20 | Export footer → souveraterminal.com | Implemented |
| 2026-05-20 | Contact form Access Type for upgrade leads | Implemented |
| 2026-05-20 | Header: SOUVERA + optional "Intelligence Terminal" subline | Pending sign-off |
| 2026-05-20 | Terms: export redistribution clause | Pending legal |
| 2026-05-20 | Professional retains Souvera Country Analysis (Option A) | Approved + implemented |
| 2026-05-20 | Country Analysis: bullets, metric colors, expanded default | Implemented |
| TBD | New entitlement `country_analysis` (only if Product rejects Pro access) | Not recommended |

---

## 7. References

- `docs/execution/intelligence-card-export-standard.md` — card chrome spec (updated)
- `docs/execution/reports-tab-strategic-plan.md` — Reports tier matrix
- `packages/entitlements/index.ts` — PLAN_ENTITLEMENTS source of truth
- `apps/api-gateway/src/lib/access-plans.ts` — marketing feature lists
