# Admin Platform — Assessment & Implementation Plan

**Date:** 2026-05-31  
**Status:** Approved for review  
**Purpose:** Ensure no admin capability is missed before demo and launch; plan Trade Policy editorial ops.

**Related:**
- [MASTER-EXECUTION-PLAN.md](./MASTER-EXECUTION-PLAN.md) — single view (Tier 3B admin ops)
- [Navigation Integration Tiers 1–5](./navigation-integration-tiers-1-5.md) (Tier 3)
- [Trade Policy Intelligence Demo Plan](./trade-policy-intelligence-demo-plan.md)
- Layout: `apps/api-gateway/src/app/admin/layout.tsx`
- Auth helper: `apps/api-gateway/src/lib/admin/verify-admin.ts`

---

## Executive Summary

The admin panel has **two fully functional editorial modules** (News Pulse, Curated News) and **four operational data modules** (Sources, Upload, Indicators, Crosswalks). Three pages are **UI stubs** (Ingestion, Quality, partial Indicators). **Critical gap:** no admin UI for Trade Policy (AGOA events, eligibility status) — required to sustain the AGOA reauthorization differentiator without code deploys.

**Security gap:** Admin layout allows any authenticated user (`verifyAdminAccess` returns true for all logged-in users). Must harden before launch.

---

## Admin Route Inventory

### UI Pages

| Route | Component | Status | API wired | Launch priority |
|-------|-----------|--------|-----------|-----------------|
| `/admin/data/sources` | `DataSourcesClient.tsx` | **Functional** | `/api/v1/admin/sources` | P1 |
| `/admin/data/indicators` | Static/partial | Partial | Monitors API exists | P2 |
| `/admin/data/upload` | `FileUploadClient.tsx` | **Functional** | `/api/v1/admin/upload`, batches | P1 |
| `/admin/data/ingestion` | Static buttons | **Stub** | Batches API exists, UI not wired | P2 |
| `/admin/data/news-pulse` | `NewsPulseClient.tsx` | **Functional** | `/api/v1/admin/news-pulse` | **P0 — demo** |
| `/admin/data/quality` | Static dashboard | **Stub** | None | P3 |
| `/admin/data/crosswalks` | Static/partial | Partial | None dedicated | P2 |
| `/admin/content/news` | `CuratedNewsClient.tsx` | **Functional** | `/api/v1/admin/curated-news/*` | **P0 — demo** |
| `/admin/content/news/[id]` | `CuratedNewsEditor.tsx` | **Functional** | CRUD + AI draft + publish | **P0 — demo** |
| `/admin/content/trade-policy` | **Not built** | Missing | Partial via DB only | **P0 — launch** |

### API Routes

| Route | Purpose | Auth | Status |
|-------|---------|------|--------|
| `/api/v1/admin/sources` | Data source CRUD | Local verifyAdmin | Functional |
| `/api/v1/admin/sources/[id]` | Source detail | Local verifyAdmin | Functional |
| `/api/v1/admin/upload` | File upload | Local verifyAdmin | Functional |
| `/api/v1/admin/batches` | Batch list/create | Local verifyAdmin | Functional |
| `/api/v1/admin/batches/[id]` | Batch detail | Local verifyAdmin | Functional |
| `/api/v1/admin/batches/[id]/parse` | Parse CSV | Local verifyAdmin | Functional |
| `/api/v1/admin/batches/[id]/validate` | Validate rows | Local verifyAdmin | Functional |
| `/api/v1/admin/batches/[id]/rows` | Row inspection | Local verifyAdmin | Functional |
| `/api/v1/admin/review-queue` | Review workflow | Local verifyAdmin | Functional |
| `/api/v1/admin/monitors` | Source monitors | Local verifyAdmin | Functional |
| `/api/v1/admin/monitors/[id]/check` | Trigger check | Local verifyAdmin | Functional |
| `/api/v1/admin/news-pulse` | News Pulse CRUD | Local verifyAdmin | Functional |
| `/api/v1/admin/curated-news` | Curated news list/create | Shared verifyAdmin | Functional |
| `/api/v1/admin/curated-news/[id]` | Edit/delete | Shared verifyAdmin | Functional |
| `/api/v1/admin/curated-news/[id]/publish` | Publish | Shared verifyAdmin | Functional |
| `/api/v1/admin/curated-news/[id]/unpublish` | Unpublish | Shared verifyAdmin | Functional |
| `/api/v1/admin/curated-news/ai-draft` | AI draft generation | Shared verifyAdmin | Functional |
| `/api/v1/admin/curated-news/ingest` | URL ingest | Shared verifyAdmin | Functional |
| `/api/v1/admin/trade-policy/*` | **Not built** | — | **Missing** |

---

## Auth Assessment

### Current behavior

**Layout (`admin/layout.tsx`):**
```typescript
// MVP: allow any authenticated user to access admin
return true;
```

**Shared helper (`lib/admin/verify-admin.ts`):**
- Checks `souvera_organization_members` for `org_admin` | `platform_admin`
- **Falls back to `isAdmin: true` for any authenticated user**

**Problem:** 12+ admin API routes duplicate their own `verifyAdminAccess` inline — inconsistent, hard to audit.

### Required fixes (ADMIN-SEC-01)

| Task | Priority |
|------|----------|
| Centralize all admin routes on `@/lib/admin/verify-admin` | P0 |
| Remove MVP fallback — require `platform_admin` or `org_admin` | P0 |
| Add `admin_access` entitlement check via `@souvera/entitlements` | P1 |
| Audit log all publish/mutation actions (partial: `lib/admin/audit-log.ts` exists) | P1 |
| Redirect non-admin to `/access` not generic `/login` | P2 |

---

## Module Assessments

### News Pulse Admin (Demo-critical — P0)

**Path:** `/admin/data/news-pulse`  
**Client:** `NewsPulseClient.tsx`  
**API:** `/api/v1/admin/news-pulse`

**Capabilities:**
- List draft/published signals per country
- Publish / reject headlines
- Filter by country

**Demo prep workflow:**
```bash
npx tsx scripts/seed-news-pulse-pilot.ts   # fallback headlines
npx tsx scripts/ingest-news-pulse.ts       # GDELT ingest
# Admin UI: review → publish for NGA/JAM/KEN + Wave 1
npx tsx scripts/refilter-news-pulse-headlines.ts  # anti-bleed
```

**Gaps:**
- [ ] News pulse filter config only covers NGA/JAM — extend to 12 rollout ISO3s
- [ ] No bulk publish for Wave 1 batch
- [ ] Admin nav doesn't show country coverage status

**Pre-demo checklist:**
- [ ] At least 1 published headline per rollout country
- [ ] Run refilter script after publish
- [ ] Verify no cross-country bleed on terminal

---

### Curated News Admin (Demo-critical — P0)

**Path:** `/admin/content/news`, `/admin/content/news/[id]`  
**Public surface:** `/insights/news`, `/insights/news/[slug]`

**Capabilities:**
- Full CRUD editorial workflow
- AI draft generation
- URL ingest
- Publish / unpublish
- Audit logging on mutations

**Gaps:**
- [ ] Not linked from public Insights nav to admin (expected)
- [ ] Sitemap may omit dynamic news slugs — verify `sitemap.ts`
- [ ] No scheduled publish

**Pre-demo checklist:**
- [ ] ≥2 published articles for demo narrative
- [ ] Verify `/insights/news` lists published only

---

### Data Sources + Upload (Operational — P1)

**Paths:** `/admin/data/sources`, `/admin/data/upload`

**Capabilities:**
- Source registry management
- CSV upload → batch → parse → validate pipeline

**Gaps:**
- [ ] Upload UI may not surface validation errors clearly
- [ ] No link from quality dashboard (stub) to failed batches

**Launch task:** Wire quality stub to batch validation results.

---

### Ingestion Page (Stub — P2)

**Path:** `/admin/data/ingestion`  
**Status:** Static UI with non-functional "Trigger Ingestion" button

**Options:**
1. **Wire to batches API** — show recent runs, trigger parse (2 days)
2. **Hide from nav** until functional — add "Coming soon" (0.5 day)
3. **Redirect to Upload** — interim (0.5 day)

**Recommendation:** Option 1 for launch; Option 3 for demo (avoid dead buttons in demo).

---

### Data Quality Dashboard (Stub — P3)

**Path:** `/admin/data/quality`  
**Status:** Static metrics, no API

**Launch scope:**
- Pull from batch validation errors
- Flag countries missing 2024/2025 observations
- Flag sectors without AGOA/CBI blocks

**Defer full dashboard to Phase 4 data governance.**

---

### Indicators + Crosswalks (Partial — P2)

**Paths:** `/admin/data/indicators`, `/admin/data/crosswalks`

**Status:** UI shells with limited API integration

**Launch need:** Low for demo; medium for 74-country scale-out.

---

## Missing Module: Trade Policy Admin (P0 — Launch)

**Required for:** [Trade Policy Intelligence Demo Plan](./trade-policy-intelligence-demo-plan.md)

### Proposed routes

| Route | Purpose |
|-------|---------|
| `/admin/content/trade-policy` | Hub — AGOA + AfCFTA sections |
| `/admin/content/trade-policy/agoa` | Country status editor (54 rows) |
| `/admin/content/trade-policy/events` | Legislative timeline CRUD |
| `/admin/content/trade-policy/afcfta` | AfCFTA status editor (Phase 2) |

### API routes (new)

```
GET/POST   /api/v1/admin/trade-policy/agoa
PATCH      /api/v1/admin/trade-policy/agoa/[iso3]
GET/POST   /api/v1/admin/trade-policy/events
PATCH/DELETE /api/v1/admin/trade-policy/events/[id]
POST       /api/v1/admin/trade-policy/publish  # sync DB + invalidate cache
```

### Data flow

1. Admin edits → `souvera_trade_policy_statuses` + `souvera_legislative_events` (new table or JSON column)
2. Public API reads DB first, falls back to `agoa-legislative-tracker.ts`
3. Publish action writes audit log entry

### MVP fields (AGOA country editor)

- `agoa_status`, `agoa_apparel_eligible`, `agoa_eligible_since`, `agoa_suspension_date`, `agoa_notes`, `agoa_source_url`, `agoa_as_of_date`

### MVP fields (Legislative event editor)

- `date`, `title`, `summary`, `status`, `impact`, `source_url`, `affected_iso3[]`

**Estimate:** 5 days for MVP editor + API + DB migration.

---

## Admin Navigation Updates

**Current sidebar (`admin/layout.tsx`):**

Data Management: Sources, Indicators, Upload, Ingestion, News Pulse, Quality, Crosswalks  
Content: Curated News

**Proposed:**

```
Data Management
  ├── Data Sources
  ├── Upload Data
  ├── Ingestion (wire or redirect)
  ├── Indicators
  └── Crosswalks

Content & Signals
  ├── Curated News
  ├── News Pulse
  └── Trade Policy          ← NEW

Quality (Phase 2)
  └── Data Quality Dashboard
```

---

## Demo Admin Runbook

### T-24 hours before demo

1. Run `npx tsx scripts/test-human-ready-gate.ts`
2. Seed Caribbean Wave 2 if needed: `npx tsx scripts/seed-caribbean-wave2.ts`
3. News Pulse: ingest + admin publish for NGA, JAM, KEN, GHA
4. Curated News: verify 2+ published articles
5. Verify admin access restricted to demo account(s)

### During demo (optional)

- Show News Pulse publish workflow (30 sec) — demonstrates editorial velocity
- Do not show stub pages (Ingestion, Quality)

---

## Implementation Phases

| Phase | Focus | Days |
|-------|-------|------|
| **ADM-1** | Auth hardening — centralize verifyAdmin, remove MVP fallback | 1 |
| **ADM-2** | Ingestion redirect or wire; hide dead buttons | 0.5 |
| **ADM-3** | News pulse filter extension + bulk publish | 1 |
| **ADM-4** | Trade Policy admin MVP (AGOA + events) | 5 |
| **ADM-5** | Quality dashboard wired to batch errors | 3 |
| **ADM-6** | AfCFTA admin editor | 2 |

**Demo minimum:** ADM-1 + ADM-2 + ADM-3  
**Launch minimum:** ADM-1 through ADM-4

---

## Backlog IDs

| ID | Title | Priority |
|----|-------|----------|
| ADMIN-SEC-01 | Harden admin auth — platform_admin only | Critical |
| ADMIN-TPI-01 | Trade Policy admin module | High |
| ADMIN-NEWS-01 | Extend news pulse filters to 12 ISO3s | High |
| **ADMIN-REQ-01** | **Request management — unified lead inbox (contact, request-access, newsletter)** | **High** |
| **ADMIN-USER-01** | **User management — profiles, plans, org roles, provisioning** | **High** |
| **ADMIN-NL-01** | **Newsletter admin — subscribers, segments, draft/send** | **High** |
| ADMIN-ING-01 | Wire ingestion page or redirect | Medium |
| ADMIN-QUAL-01 | Quality dashboard from batch validation | Medium |

---

## Admin Operations Modules (Tier 3B)

### Request management (ADMIN-REQ-01)

**Inbound today:** `POST /api/v1/leads` writes to `lead_submissions` with `form_type`:
- `contact` — `/contact`
- `request_access` — `/access/request-access`
- `newsletter` — footer / newsletter forms

**No admin UI exists.** Ops must query DB directly.

**MVP admin (`/admin/operations/requests`):**
- Filterable table by form_type, status, date, plan requested
- Detail view with full payload + source_page
- Actions: mark reviewing, approve, reject, add internal note
- CTA: “Provision user” → links to user management with email pre-filled

### User management (ADMIN-USER-01)

**Data:** `souvera_profiles`, `souvera_subscriptions`, `souvera_organization_members`

**MVP admin (`/admin/operations/users`):**
- Search by email; view current plan + entitlements
- Change plan / extend subscription
- Assign org_admin / platform_admin (super-admin only)
- Disable account; resend invite

**Replaces:** manual `seed-test-users.ts` / SQL for production ops.

### Newsletter management (ADMIN-NL-01)

**Data:** `souvera_newsletter_subscribers` (sql-pack-v1.20); lead submissions with `form_type=newsletter`; `/api/v1/newsletter/preferences` (client stub)

**MVP admin (`/admin/content/newsletter`):**
- Subscriber list, export CSV, unsubscribe
- Merge duplicate emails from leads table
- Draft newsletter (reuse Curated News editor patterns)
- Send log + open/click placeholders (Phase 2)

**Related:** [reports-tab-strategic-plan.md](./reports-tab-strategic-plan.md) § Newsletter Architecture

---

## Proposed sidebar (operations group)

```
Operations                    ← NEW group
  ├── Access Requests
  ├── Users & Plans
  └── Newsletter

Data Management
  └── …

Content & Signals
  └── …
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-31 | Initial admin platform assessment |
