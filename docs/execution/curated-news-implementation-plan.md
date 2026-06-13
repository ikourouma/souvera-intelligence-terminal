# Curated News — Implementation Plan

**Proposed route:** `/insights/news` ✅ **Confirmed**  
**Status:** Sprint 1 complete (steps 1–7); step 8 (nav/sitemap) deferred  
**Build order:** **Background work first** — no public nav until content pipeline proven  
**Owner workflow:** Super-admin editorial + AI-assisted ingest

---

## Problem

Souvera needs a **platform-level editorial news surface** distinct from:

| Surface | Scope | Audience | Data source |
|---------|-------|----------|-------------|
| **News Pulse** (country terminal) | Per-country automated headlines | Explorer+ members | GDELT ingest → admin publish |
| **Live Wire** (`/insights`) | Static demo / placeholder today | Public | Hardcoded mock |
| **Curated News** (this proposal) | Cross-market editorial with references | Public read; Pro+ deep links | Web aggregation + AI + human curation |

---

## Recommended placement: `/insights/news`

**Why under Insights hub**

1. **Existing IA** — `/insights` already hosts briefings, rankings, methodology. News is editorial intelligence, not product access or country terminal data.
2. **SEO & discovery** — Public, indexable content drives inbound; keeps `/country/[iso3]` gated for Explorer+.
3. **Separation of concerns** — Terminal News Pulse = operational signals; Insights News = Souvera editorial brand.
4. **Nav consistency** — Add "News" to Insights submenu in `SouveraMegaNav` alongside Briefings and Rankings.

**Alternative considered:** `/news` top-level — simpler URL but fragments the Insights brand and duplicates hub patterns.

**Relationship to `/insights` (Live Wire):** Evolve Live Wire into a dashboard that **embeds** latest curated headlines + links to `/insights/news` for archive. Avoid two competing news home pages.

---

## Information architecture

```
/insights                    → Hub (Live Wire dashboard)
/insights/news               → Curated feed (paginated, filterable)
/insights/news/[slug]        → Article detail with references
/insights/briefings          → (existing)
/insights/rankings           → (existing)
/admin/content/news          → Super-admin CMS (draft → review → publish)
```

**Filters (v1):** Region (Africa / Caribbean / Global), Theme (Trade, FX, Policy, Sector), Country tags (ISO3 multi-select).

---

## Data model

```sql
-- souvera_curated_news
id              uuid PK
slug            text UNIQUE
title           text
summary         text          -- card teaser (≤280 chars)
body_md         text          -- full article (markdown)
status          enum(draft, in_review, published, archived)
published_at    timestamptz
region          text[]        -- africa, caribbean, global
country_iso3    text[]        -- optional tags
themes          text[]        -- trade, policy, fdi, energy, ...
hero_image_url  text NULL
author_id       uuid FK profiles
editor_notes    text NULL

-- souvera_curated_news_sources (references)
id              uuid PK
news_id         uuid FK
source_name     text          -- Reuters, AfDB, etc.
source_url      text
snippet         text NULL     -- quoted excerpt
retrieved_at    timestamptz
confidence      numeric       -- AI attribution score 0-1

-- souvera_curated_news_ingest (pipeline queue)
id              uuid PK
external_url    text
raw_title       text
raw_summary     text
ai_draft_md     text NULL
status          enum(pending, processed, rejected, promoted)
promoted_to_id  uuid NULL FK souvera_curated_news
```

**RLS:** Public read on `status = published`; write restricted to `admin_access` entitlement.

---

## Editorial workflow

```mermaid
flowchart LR
  A[Web / RSS / GDELT] --> B[Ingest queue]
  B --> C[AI summarize + tag + dedupe]
  C --> D[Admin review UI]
  D --> E{Decision}
  E -->|Publish| F[/insights/news/slug]
  E -->|Reject| G[Archive]
  E -->|Merge| H[Append sources to existing]
```

Reuse patterns from **News Pulse admin** (`/admin/data/news-pulse`):

- Draft → published lifecycle
- Source attribution required before publish
- Super-admin only

---

## AI pipeline (phased)

### Phase 1 — Manual + assisted
- Admin creates article manually
- AI "Suggest summary" and "Suggest tags" buttons (OpenAI/Anthropic via existing API patterns)
- No automated ingest

### Phase 2 — Monitored ingest
- Scheduled job pulls from allowlisted RSS / GDELT themes (reuse `scripts/lib/gdelt-doc.ts`)
- Dedupe by URL hash + title similarity
- AI generates draft in `souvera_curated_news_ingest`
- Admin promotes draft → full article

### Phase 3 — Scale
- Multi-source aggregation (Reuters API, central bank feeds, AfDB, CARICOM)
- Country auto-tagging from ISO3 NER
- Weekly "Souvera Market Brief" auto-compilation from published items

---

## Frontend (api-gateway)

| Component | Purpose |
|-----------|---------|
| `app/insights/news/page.tsx` | Feed with filters |
| `app/insights/news/[slug]/page.tsx` | Article + reference list |
| `components/insights/NewsCard.tsx` | Card for hub + feed |
| `components/insights/NewsReferenceList.tsx` | Numbered citations with outbound links |
| `app/admin/content/news/page.tsx` | CMS list |
| `app/admin/content/news/[id]/page.tsx` | Editor |

**Design:** Match Insights terminal aesthetic (dark, source-attributed, monospace timestamps). Every headline shows "N sources" badge.

**Entitlements:** Feed and articles **public**. Optional Pro+ features later: save to watchlist, email digest, link to country terminal tabs.

---

## API routes

```
GET  /api/v1/insights/news              ?region=&theme=&page=
GET  /api/v1/insights/news/[slug]
POST /api/v1/admin/curated-news         (admin)
PATCH /api/v1/admin/curated-news/[id]
POST /api/v1/admin/curated-news/[id]/publish
POST /api/v1/admin/curated-news/ingest/run  (cron)
```

---

## Implementation phases & effort

**Principle: backend-first.** Do not add `/insights/news` to nav or ship public pages until admins can create, reference, and publish articles. News Pulse followed this pattern (GDELT ingest + admin review → terminal UI) and it worked well.

### Recommended build order

| Step | Deliverable | Why first |
|------|-------------|-----------|
| **1** | Schema migration + RLS | Foundation for everything |
| **2** | Admin API (CRUD, publish, sources) | Contract before UI |
| **3** | Admin CMS at `/admin/content/news` | Editors can work without public surface |
| **4** | Seed script + 3–5 pilot articles (manual) | Proves end-to-end before automation |
| **5** | Ingest queue + `ingest-curated-news.ts` script | Background aggregation (reuse GDELT patterns) |
| **6** | Public read API (`GET /api/v1/insights/news`) | Pages consume API only |
| **7** | Public `/insights/news` + `[slug]` pages | Only when published content exists |
| **8** | Nav, sitemap, Live Wire embed | Last — avoids empty or “coming soon” public routes |
| **9** | AI assist (summary/tags) | Optional enhancement on admin editor |
| **10** | Cron / scheduled ingest | Scale after editorial workflow is stable |

### What to defer (do not build early)

- `SouveraMegaNav` “News” link — add at step 8
- `/insights` Live Wire mock → real feed swap — step 8
- SEO/sitemap entries — step 8
- AI automation before manual publish works — step 9–10

### Legacy phase labels (mapped)

| Phase | Maps to steps |
|-------|----------------|
| **A** | 1 |
| **B** | 2–3 |
| **C** | 6–7 |
| **D** | 8 |
| **E** | 9 |
| **F** | 5, 10 |

**Suggested sprint split:** Sprint 1 = steps 1–4 (shippable internally). Sprint 2 = steps 5–7 (first public launch). Sprint 3 = steps 8–10 (discovery + automation).

---

## Distinction from News Pulse (do not merge)

- **News Pulse:** Real-time, country-scoped, member-facing, low editorial overhead, GDELT-native
- **Curated News:** Editorial voice, cross-market narratives, public marketing + trust building, multi-source references

Cross-link: Curated article about Nigeria FX can link to `/country/NGA?tab=overview` for Explorer+ users; public users see upgrade CTA via `exploreCountryHref()`.

---

## Pre-scale gate alignment

Complete **routing gate** before Curated News scale. News URLs use `exploreCountryHref()` for country deep links.

---

## Runbook

```bash
# 1. Deploy migration (Supabase SQL Editor)
#    infra/supabase/migrations/create-curated-news-tables.sql

# 2. Seed pilot articles (5 published)
npx tsx scripts/seed-curated-news-pilot.ts

# 3. Optional: background ingest queue
npx tsx scripts/ingest-curated-news.ts

# 4. Admin CMS
#    /admin/content/news

# 5. Public (direct URL only — no nav link yet)
#    /insights/news
#    /insights/news/[slug]
```

### Files added (Sprint 1–2)

| Area | Path |
|------|------|
| Migration | `infra/supabase/migrations/create-curated-news-tables.sql` |
| Admin API | `apps/api-gateway/src/app/api/v1/admin/curated-news/` |
| Public API | `apps/api-gateway/src/app/api/v1/insights/news/` |
| Admin CMS | `apps/api-gateway/src/app/admin/content/news/` |
| Public pages | `apps/api-gateway/src/app/insights/news/` |
| Seed | `scripts/seed-curated-news-pilot.ts` |
| Ingest | `scripts/ingest-curated-news.ts` |
