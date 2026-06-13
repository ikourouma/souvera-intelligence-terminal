# Sprint E — News Pulse Pilot (NGA + JAM)

**Date:** May 2026  
**Status:** Complete (pilot)  
**Strategy:** Dual-country pilot before 74-country rollout

---

## Pilot decision

**Yes — NGA + JAM together is the correct pilot.**

| Reason | NGA | JAM |
|--------|-----|-----|
| Region templates | AGOA / AfCFTA / ECOWAS | CARICOM / CBI / Caribbean |
| Admin workflow | Same draft → publish queue | Same |
| UI validation | Africa reference | Caribbean template |
| Scale-out | Add ISO3 to `NEWS_PULSE_PILOT` | Same config pattern |

After pilot validation, expand by appending countries to `scripts/lib/news-pulse-pilot.ts` and running daily ingest.

---

## Sectors de-Nigeria (prerequisite)

| File | Change |
|------|--------|
| `country-sectors-content.ts` | AGOA (NGA) / CBI (JAM) / default trade labels |
| `SectorsTab.tsx` | Region-aware section titles and locked CTAs |
| `seed-jamaica-sectors-trade.ts` | CBI copy in `agoa_*` DB columns for JAM sectors |

---

## Sprint E deliverables

### Schema

- `infra/supabase/migrations/add-news-signals-status.sql` — `status`, `reviewed_at`, `reviewed_by`

### Ingest

| Script | Purpose |
|--------|---------|
| `scripts/lib/gdelt-doc.ts` | GDELT 2.0 DOC API client |
| `scripts/lib/news-pulse-scoring.ts` | Keyword sentiment / risk / opportunity scoring |
| `scripts/lib/news-pulse-pilot.ts` | NGA + JAM query config |
| `scripts/ingest-news-pulse.ts` | Daily ingest → `status: draft` |
| `scripts/seed-news-pulse-pilot.ts` | Fallback published seeds for demo |

### Admin

- `GET/PATCH /api/v1/admin/news-pulse` — review queue
- `/admin/data/news-pulse` — publish UI
- Admin nav: News Pulse link

### Terminal UI

- Country API: latest **published** signal only (admins see drafts)
- `SignalMomentumRow`: sentiment bars + top 3 headlines
- `CountryNewsPulse` type: `topHeadlines`, `headlineCount`, `pending`

---

## Runbook

```bash
# 1. Apply migration (Supabase SQL Editor)
#    infra/supabase/migrations/add-news-signals-status.sql

# 2. Seed published pilot data (immediate UI)
npx tsx scripts/seed-news-pulse-pilot.ts

# 3. Optional: live GDELT ingest (creates drafts)
npx tsx scripts/ingest-news-pulse.ts

# 4. Jamaica sector CBI trade data
npx tsx scripts/seed-jamaica-sectors-trade.ts

# 5. Publish drafts at /admin/data/news-pulse
```

---

## Scale-out to 74 countries (post-pilot)

1. Add country entries to `NEWS_PULSE_PILOT` with `countryQuery` + `regionTerms`
2. Schedule `ingest-news-pulse.ts` daily (cron / GitHub Action)
3. Consider Event Registry upgrade for entity disambiguation
4. Optional: `souvera_news_headlines` raw table for audit trail

---

## Verification

| Check | NGA | JAM |
|-------|-----|-----|
| Sectors tab trade block | AGOA labels | CBI labels |
| News Pulse card | Published scores + headlines | Published scores + headlines |
| Draft ingest | Visible in admin queue | Visible in admin queue |
| Non-published | "Pending review" in terminal | Same |
