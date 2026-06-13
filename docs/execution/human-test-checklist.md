# Human QA Checklist — Pilot + Wave 1 + AGOA

**Last QA run:** 2026-05-31 (passed with observations)  
**Demo script:** [demo-trade-intelligence-script.md](./demo-trade-intelligence-script.md)  
**Saved analysis & plans:**
- [QA Findings Sprint Plan](./qa-findings-sprint-plan.md)
- [Navigation Integration Tiers 1–5](./navigation-integration-tiers-1-5.md)
- [Trade Policy Intelligence Demo Plan](./trade-policy-intelligence-demo-plan.md)
- [Admin Platform Assessment](./admin-platform-assessment-plan.md)

Run automated gate first:

```bash
npx tsx scripts/test-human-ready-gate.ts
```

Seed if needed:

```bash
npx tsx scripts/seed-caribbean-wave2.ts
npx tsx scripts/seed-news-pulse-pilot.ts
```

## Demo-ready (Tier 1 — implemented)

- [x] Mega nav: Trade Intelligence + AGOA Tracker
- [x] Trade pages: SouveraMegaNav + footer via `/intelligence/trade/layout.tsx`
- [x] AGOA: SSR auth bootstrap, Business+ full access, apparel badge public
- [x] AGOA: reauthorization countdown + legislative event filters
- [x] Africa hub: AGOA CTA section
- [x] Export Breakdown PNG on Trade tab
- [x] Market access registry (Caribbean sidebar fix)
- [x] JAM tab canonicalization to `?tab=overview`
- [x] News pulse filters for all 12 rollout ISO3s
- [x] Admin auth hardened (platform_admin / org_admin only)
- [x] `npm run build` + `test-human-ready-gate.ts` pass

## Tier 2 — implemented

- [x] Import Breakdown by Sector on Trade tab (12 rollout countries + PNG export)
- [x] AfCFTA preview tracker (`/intelligence/trade/afcfta`) — 8 African rollout countries
- [x] Opportunity tab: Live Market Signals (computed GDP / partner / sector / AGOA tiles)
- [x] Trade Policy admin hub (`/admin/content/trade-policy`) — read-only AGOA events + pilot status

## Tier 2.5 — QA polish (2026-05-31)

- [x] Export/import breakdown: 2+3 layout, total $ banner, per-sector $ under %, animated cards
- [x] NGA export breakdown: 5 sectors (incl. Solid Minerals & Mining)
- [x] AGOA PNG exports: legislative timeline + per-event + per-country status cards
- [x] Master execution plan: [MASTER-EXECUTION-PLAN.md](./MASTER-EXECUTION-PLAN.md)

## Pilot triad (NGA / JAM / KEN)

- [ ] `/country/NGA` — Overview, Trade (AGOA restoration + **Import Breakdown**), Risk, Opportunity (**Live Market Signals**), tabs render custom copy
- [ ] `/country/JAM` — CBI/CARICOM trade block, intraRegional partners, 5 sectors with CBI opportunity text
- [ ] `/country/KEN` — AGOA eligible trade, EAC intraRegional, signal scan shows East Africa markers
- [ ] SignalMomentumRow — headlines present for each pilot; no cross-country bleed (e.g. Nigeria text on Jamaica)
- [ ] Reports tab (Professional+) — generate Country Profile; history list shows queued/completed row

## Wave 1 Africa (GHA / ZAF / ETH / SEN / CIV / TZA)

- [ ] News Pulse — at least one headline per country on terminal (after `seed-news-pulse-pilot.ts`)
- [ ] `/country/GHA`, `/country/ZAF`, `/country/ETH`, `/country/SEN`, `/country/CIV`, `/country/TZA` — all tabs routable; Trade tab shows AGOA block + 5 partners (2+3 layout)
- [ ] Sectors tab — 5 active sectors each with AGOA trade blocks (not NGA/JAM contamination)

## Caribbean Wave 2 (TTO / BRB / BHS)

- [ ] `/country/TTO` — trade tab: 5 partners, CBI block, CARICOM intraRegional
- [ ] `/country/BRB` — overview/risk/opportunity custom copy (not default placeholders)
- [ ] `/country/BHS` — same; USD/CBI messaging in overview market access
- [ ] Sectors tab — 5 active sectors each; sector narratives mention CBI (not AGOA restoration)
- [ ] After seed: Economy tab charts populate (2020–2025 time series)

## AGOA Legislative Tracker

- [ ] `/intelligence/trade/agoa` — 54 countries, legislative timeline, filter by status
- [ ] NGA shows suspended / restoration watchpoint
- [ ] KEN shows eligible with apparel note
- [ ] Legislative timeline shows ≥ 5 events including 2026 reauthorization

## AfCFTA Preview (Tier 2)

- [ ] `/intelligence/trade/afcfta` — 8 African rollout countries with ratification status
- [ ] Trade hub shows AfCFTA **Preview** badge
- [ ] Business+ user: country cards expand with tariff phase notes

## Trade Policy Admin

- [ ] `/admin/content/trade-policy` — legislative timeline + pilot AGOA status (admin only)

## Regression

- [ ] Unauthenticated `/country/NGA` — redirects to `/access/request-access?country=NGA&source=country-direct&plan=explorer`
- [ ] Compare tool — pilot countries selectable
- [ ] No console errors on tab switch (Overview → Trade → Reports)

## Sign-off

| Tester | Date | Build/branch | Pass |
|--------|------|--------------|------|
|        |      |              |      |
