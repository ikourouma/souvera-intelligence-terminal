# Souvera Master Execution Plan

**Single source of truth** for demo, QA, and post-demo delivery.  
**Last updated:** 2026-05-31  
**Principle:** All user-facing intelligence flows through **API payloads** (`/api/v1/country/[iso3]`, `/api/v1/trade/*`). Curated TypeScript/DB seeds are **data sources**, not UI hard-coding. Admin super-users manage content without redeploy (target state).

---

## How to use this document

| Need | Go to |
|------|--------|
| Human QA checklist | [human-test-checklist.md](./human-test-checklist.md) |
| Demo walkthrough | [demo-trade-intelligence-script.md](./demo-trade-intelligence-script.md) |
| QA findings & Sprint H | [qa-findings-sprint-plan.md](./qa-findings-sprint-plan.md) |
| Nav tiers 1–5 | [navigation-integration-tiers-1-5.md](./navigation-integration-tiers-1-5.md) |
| Trade policy demo | [trade-policy-intelligence-demo-plan.md](./trade-policy-intelligence-demo-plan.md) |
| Admin roadmap | [admin-platform-assessment-plan.md](./admin-platform-assessment-plan.md) |
| Reports + AI + quotas | [reports-ai-platform-plan.md](./reports-ai-platform-plan.md) |
| Traction pages (Fortune-5) | [traction-pages-fortune5-stress-test.md](../audits/traction-pages-fortune5-stress-test.md) |
| Country terminal sprints | [country-terminal-sprint-plan.md](./country-terminal-sprint-plan.md) |
| Backlog IDs | [project-backlog.md](./project-backlog.md) |

---

## Status dashboard

### Tier 1 — Demo-critical ✅ Complete

- Trade layout, mega nav, AGOA SSR auth, reauth countdown
- Export breakdown PNG, market access registry, admin auth hardened
- Human-ready gate passing

### Tier 2 — Trade & opportunity depth ✅ Complete

- Import breakdown 2+3 layout, AfCFTA preview (8 countries)
- Opportunity Live Market Signals + PNG
- Trade Policy admin hub (+ `/events` sub-route)
- Nav: AfCFTA + Supply-Demand under Trade & Policy

### Tier 2.5 — Sovereign Trade Accuracy & Census Pipeline ✅ Certified (Reports tab deferred)

**Certification doc:** [`docs/ux/phase-2.5-certification.md`](../ux/phase-2.5-certification.md)

| Item | Status | Notes |
|------|--------|-------|
| Census pipeline + dual-source reconciliation | ✅ | Tasks 3–4, 9; COD banner live |
| Petroleum exclusion transparency | ✅ | Task 8; SDM filter scaffolding Task 10 |
| USTR Africa leverage | ✅ | Task 11; curated links + tertiary panel |
| SDM data clarity (74×8) | ✅ | Task 12; flow-backed export products |
| AfCETA Trade Intelligence (Task 14) | ✅ | 416 corridor signals; forum spotlights |
| AfCETA Corridor Flows UX (Task 14b) | ✅ | Corridor Lab, drawer, rule-based executive analysis, PNG export |
| Explorer self-serve signup (Task 15) | ✅ | `/signup`, check-email, login CTA; invite-assisted for paid tiers |
| Automated audit gates | ✅ | All green incl. `audit-afceta-corridor-consistency.ts` (416 rows) |
| Pre-2.5 UX navigation gate | ✅ | Redirect audit, `/professional-services`, sector CTAs; `terminal-web` removed (2026-07-03) |
| Manual smoke + stakeholder sign-off | 🔲 | AfCETA flows + Explorer signup E2E + GUY/JAM/COD/NGA/ERI/ZWE review |
| Reports tab decision | 🔲 | Remains disabled until explicit post-2.5 approval |

**Legacy Tier 2.5 polish (pre-certification):**

| Item | Status | Notes |
|------|--------|-------|
| NGA 5 export sectors | ✅ | Solid Minerals added; 2+3 layout |
| Import/export $ volumes | ✅ | Derived from `exportsUsd` / `importsUsd` via API trade payload |
| AGOA timeline / country status PNG | ✅ | Public + Business+ exports |
| Economy data API-driven | ✅ | `souvera_country_observations` via country API |

### Tier 3 — Admin-managed intelligence 📋 Planned

- Trade Policy CRUD (events, AGOA status) — ADMIN-TPI-01
- Trade composition admin editor per ISO3
- AfCFTA 54-country DB + admin
- Supply-Demand matrix curated data + admin

### Tier 3B — Admin operations (platform ops) 📋 Planned

Super-admin managed. **Not in R4 scope** — runs parallel after demo; required before self-serve launch.

| Module | ID | Scope | API / table today | Admin UI |
|--------|-----|-------|-------------------|----------|
| **Request management** | ADM-REQ-01 | All inbound: contact, request-access, demo requests | `POST /api/v1/leads` → `lead_submissions` | ❌ Not built |
| **User management** | ADM-USER-01 | Profiles, plan/subscription, org membership, access tier | `souvera_profiles`, `souvera_subscriptions`, `souvera_organization_members` | ❌ Not built |
| **Newsletter management** | ADM-NL-01 | Subscribers, preferences, opt-out, campaign drafts | `souvera_newsletter_subscribers`, `GET/POST /api/v1/newsletter/preferences` (stub) | ❌ Not built |

**Request management detail (ADM-REQ-01):**
- Unified inbox: `form_type` = `contact` | `request_access` | `newsletter`
- Status workflow: new → reviewing → approved → provisioned → closed
- Link to user provisioning (`seed-test-users` pattern → admin UI)
- SLA view for institutional / business requests

**User management detail (ADM-USER-01):**
- Search users by email; view plan, entitlements, org role
- Assign / change plan (explorer → business); extend trial
- Invite org members; disable account
- Audit log of admin actions

**Newsletter detail (ADM-NL-01):**
- Subscriber list from `souvera_newsletter_subscribers` + lead `newsletter` form_type
- Segment by region/sector preference (when preferences API ships)
- Draft → review → send (integrates with Curated News editorial)
- See also [reports-tab-strategic-plan.md](./reports-tab-strategic-plan.md) § Newsletter

**Estimate:** ADM-REQ 3d · ADM-USER 5d · ADM-NL 4d (MVP each)

### Tier 4 — Reports platform 📋 Planned (R4 → R1 → R2 → R3)

See [reports-ai-platform-plan.md](./reports-ai-platform-plan.md). **Order enforced to avoid drift:**

```
R4 Quota middleware ──► R1 Puppeteer Country Profile ──► R2 Memo/Trade templates ──► R3 GPT-4o custom ──► R5 Saved library
```

**Why R4 before R1:** Quotas must exist before GPT-4o or high-volume PDF generation goes live. R1 templates use the same queue — quotas apply immediately.

---

## Architecture: API-driven data (non-negotiable)

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ Admin / Seeds   │────►│ Supabase + curated   │────►│ API routes      │
│ (TS files today)│     │ TS fallback          │     │ country/trade   │
└─────────────────┘     └──────────────────────┘     └────────┬────────┘
                                                               │
                                                               ▼
                                                    ┌─────────────────────┐
                                                    │ UI tabs (no local   │
                                                    │ hard-coded metrics) │
                                                    └─────────────────────┘
```

| Surface | API | Data source today | Admin target |
|---------|-----|-------------------|--------------|
| Country terminal | `/api/v1/country/[iso3]` | DB + trade TS fallback | Full DB |
| Trade tab breakdown | `trade.exportComposition` in API | Curated trade files | Admin editor |
| Economy charts | `timeSeries` in API | `souvera_country_observations` | Ingestion pipeline |
| AGOA tracker | `/api/v1/trade/agoa` | Curated + DB | ADMIN-TPI-01 |
| AfCFTA | `/api/v1/trade/afcfta` | Curated fallback | Admin editor |
| Reports | `/api/v1/reports/*` | Profile markdown + pdf-lib | Puppeteer + GPT-4o |

**Caribbean economy:** Not hard-coded in UI. Values live in DB observations; seed script upserts. Re-run `npx tsx scripts/seed-caribbean-wave2.ts` after indicator fixes.

---

## Sprint tracks (consolidated)

| Track | ID | Priority | Status |
|-------|-----|----------|--------|
| Platform integration | H-D / Tier 1 | P0 | ✅ |
| Quick fixes | H-A | P0 | ✅ |
| Trade depth | H-B | P1 | ✅ |
| Opportunity metrics | H-C | P1 | ✅ |
| Quality gates | H-E | P0 | ✅ |
| Trade breakdown polish | H-B2 | P1 | ✅ |
| AGOA deck exports | H-D2 | P1 | ✅ (refining UX — see Deck Export Standard) |
| Reports R4 quotas | R4 | P0 | 📋 Next |
| Reports R1 Puppeteer | R1 | P0 | 📋 After R4 |
| Reports R2–R3 templates + AI | R2/R3 | P1 | 📋 |
| Admin trade policy CRUD | ADM-TPI | P1 | 📋 |
| Admin request management | ADM-REQ | P1 | 📋 |
| Admin user management | ADM-USER | P1 | 📋 |
| Admin newsletter ops | ADM-NL | P1 | 📋 |
| Supply-Demand preview data | TPI-SD | P2 | 📋 |
| Caribbean CBI tracker | TPI-CBI | P1 | 📋 |

---

## Pricing & reports packaging ($49–$199/mo)

**Customer-facing rule:** Never show unit costs ($0.18 AI, token counts, or COGS). Show **included value** and **upgrade paths**.

### What ships in the bundle (recommended go-to-market)

| Tier | Price | Included in subscription | Not shown to user |
|------|-------|--------------------------|-------------------|
| **Professional** | **$49/mo** | 3 Country Profile PDFs/mo · Newsletter · Terminal access | Internal PDF compute |
| **Business** | **$199/mo** | 5 report downloads/mo (Investment Memo, Trade Profile, Sector Deep-Dive) · **2 AI Custom Reports/mo included** · Full trade terminal | Internal ~$0.18/mo AI COGS (absorbed in margin) |
| **Institutional** | Custom | Unlimited reports · white-label · API | Contract-level |

**Business AI is bundled, not à la carte at base price.** Two AI custom reports/month at $199 positions Souvera above static PDF tools and below Bloomberg — without a separate “AI line item” on checkout.

### Incremental revenue (reports as profit center)

| Product | Price | Audience | Purpose |
|---------|-------|----------|---------|
| **AI Intelligence Add-On** | **+$29/mo** on Business | Power analysts | +5 AI Custom Reports/mo (beyond included 2) |
| **Report Pack (one-time)** | $49–$99 per report | Professional upsell | Extra Country Profile / Sector Deep-Dive beyond quota |
| **Institutional report SLA** | Custom | Banks, DFIs | Same-day custom briefings, dedicated analyst |
| **Quota exceeded** | Contact sales / wait for reset | All tiers | No silent overage billing — preserves trust |

**Traction playbook:**
1. Lead with **“2 AI-powered custom briefings included”** on Business (not “$0.18 AI”).
2. Show usage meter: *“1 of 2 AI reports remaining this month”* with one-click add-on upgrade.
3. Professional → Business upsell when user hits PDF cap or clicks “Generate AI report”.
4. PNG deck exports stay **unlimited** at eligible tiers (viral loop for presentations).

R4 implements quotas behind this packaging — see [reports-ai-platform-plan.md](./reports-ai-platform-plan.md).

<details>
<summary>Internal unit economics (ops only — do not expose in product)</summary>

| Tier | AI reports/mo | Est. AI COGS/user | % of $199 revenue |
|------|---------------|-------------------|-------------------|
| Business | 2 included | ~$0.18 | &lt;0.1% |
| Business + Add-On | 7 total | ~$0.63 | ~0.3% |

Platform AI budget &lt;$1M/year holds at scale with quotas + add-on revenue exceeding COGS.
</details>

---

## Deck export UX standard (Fortune 5)

**Problem:** Per-card PNG buttons on every timeline event + country card feels noisy.

**Pattern (Bloomberg / Palantir inspired — Souvera simplification):**

| Level | Control | When |
|-------|---------|------|
| **Section** | One “Export for deck” per block (timeline, country grid) | Always visible in section header |
| **Card** | Export on **hover only** (country cards) | Power users, single-country slides |
| **Removed** | Per-event PNG on every timeline tile | Use section export or hover on expanded event |

**Essential elements in exported slide (16:9-safe, max ~420px wide card):**

*Legislative event*
- Status badge + date (top)
- Title (2 lines max)
- One-line takeaway (summary truncated to 120 chars)
- Footer: Souvera + USTR source + disclaimer

*Country AGOA status*
- Country name + ISO3
- Status badge + Apparel eligible
- 2-line watchpoint (Business+ content; public gets status only)
- As-of date

*Exclude from PNG:* filter dropdowns, upgrade CTAs, “Trade tab →” links, refresh buttons.

Spec: [intelligence-card-export-standard.md](./intelligence-card-export-standard.md) (extend for trade policy).

**Exclude from all deck PNGs (`data-export-exclude`):** navigation links (Trade tab →), upgrade locks, filter controls, clickable source URLs (attribution lives in Souvera footer).

---

## Caribbean trade & policy intelligence (TPI-CBI)

Africa has **AGOA + AfCFTA** at `/intelligence/trade/*`. Caribbean rollout countries (JAM, TTO, BRB, BHS) already have **CBI + CARICOM** on country Trade tabs — but no **hub-level policy tracker** yet.

### Recommended parity (Preview → Live)

| Module | Africa analog | Caribbean target | Rollout ISO3 |
|--------|---------------|------------------|--------------|
| **CBI Eligibility Tracker** | AGOA tracker | `/intelligence/trade/cbi` | JAM, TTO, BRB, BHS + CSME members |
| **CARICOM / CSME Status** | AfCFTA preview | Section on CBI hub or `/intelligence/trade/caricom` | 15 CARICOM states (curated subset first) |
| **Legislative / renewal watch** | AGOA reauth timeline | CBI renewal + US trade policy milestones | USTR + CRS sources |
| **Country terminal** | Already live | CBI trade blocks, intraRegional, Import/Export breakdown | ✅ Wave 2 + JAM |

### Phase plan (TPI-CBI)

| Phase | Deliverable | Effort |
|-------|-------------|--------|
| **CBI-1** | Curated `cbi-status.ts` for 4 rollout + API `/api/v1/trade/cbi` | 3d |
| **CBI-2** | `CBITrackerClient` + trade hub module card (Preview badge) | 3d |
| **CBI-3** | Deck PNG exports (same UX as AGOA) | 1d |
| **CBI-4** | Admin CRUD (with ADM-TPI) | 5d |

**Demo narrative:** “Same trade policy intelligence for Caribbean — CBI preferential access, CARICOM single market, nearshore corridor.”

**Differentiator vs Africa:** Emphasize **USD peg / FX stability**, **nearshore US supply chain**, **tourism & services exports** under CBI — not AGOA apparel logic.

---

## Persona entitlements (reference)

| Persona | Trade tab | AGOA detail | AGOA PNG | Reports |
|---------|-----------|-------------|----------|---------|
| Public | ❌ | Timeline only | Timeline events | ❌ |
| Explorer | ❌ | Timeline only | Timeline events | ❌ |
| Professional | ❌ | Timeline only | Timeline events | Country Profile (3/mo) |
| Business | ✅ Full | ✅ Full cards | All cards | 5 template + 2 AI/mo |
| Institutional | ✅ | ✅ | All | 20 + 10 AI/mo |
| Platform admin | ✅ | ✅ | All | Unlimited |

---

## Next actions (ordered)

1. ✅ Human re-test — trade breakdown + AGOA PNG (passed)
2. **Deck export UX** — section-first exports; hover-only per country card
3. **R4** — `souvera_report_quota_policies` + middleware on `/api/v1/reports/generate` (pricing unchanged)
4. **R1** — Puppeteer Country Profile template
5. **ADM-REQ / ADM-USER / ADM-NL** — parallel after R4 (launch blocker for self-serve)
6. **ADM-TPI-01** — Trade policy events API + admin CRUD

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-31 | Master plan created; consolidates Tier 1–2 completion, R1/R4 ordering, API-driven principle |
| 2026-05-31 | Tier 3B admin ops (requests, users, newsletter); pricing/R4 alignment; deck export UX standard |
