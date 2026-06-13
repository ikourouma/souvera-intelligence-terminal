# Demo Script — Trade Policy Intelligence (10 min)

**Audience:** Institutional investors, trade policy stakeholders, launch demo  
**Prerequisites:** Business+ test account; dev server at `http://localhost:3010`

---

## 1. Discovery (2 min)

1. Open **Intelligence** in mega nav → **Trade Intelligence**
2. Point out **AGOA Reauthorization Window** banner (Dec 31, 2026 countdown)
3. Note module badges: **AGOA = Live**, AfCFTA / Supply-Demand = **Preview**

## 2. AGOA Legislative Tracker (4 min)

1. Click **AGOA Eligibility Tracker**
2. Show **Reauthorization Countdown** + summary stats (54 tracked, eligible vs suspended)
3. **Legislative Timeline** — filter **Watchpoint** → Nigeria restoration watchpoint
4. Filter **Upcoming** → 2027 cliff risk event
5. Search **Kenya** → show **Apparel Eligible: Yes** (visible at all tiers)
6. Business+ user: expand KEN card — apparel note, eligible since, USTR source
7. Click **Trade tab →** on KEN card → lands on `/country/KEN?tab=trade`

## 3. Country Terminal (3 min)

1. Navigate to `/country/NGA?tab=overview` (canonical URL with `?tab=overview`)
2. **Overview** — Market Access card: AGOA suspended, AfCFTA, ECOWAS
3. **Sidebar** — same regional frameworks (no Caribbean bleed on African markets)
4. **Trade tab** (Business+) — AGOA restoration narrative; **Export Breakdown** + **Import Breakdown** PNG export
5. **Sectors tab** — export metrics show **$0** with suspension context (not hidden)
6. **Opportunity tab** — **Live Market Signals** row (GDP, top partner, lead sector, AGOA status)

## 4. AfCFTA Preview (1 min)

1. Trade hub → **AfCFTA Status Tracker** (Preview badge)
2. Show ratification status for **Ghana** or **Kenya**
3. Business+ user: expand card for tariff phase notes

## 5. Caribbean contrast (1 min)

1. Open `/country/BRB?tab=overview`
2. Sidebar shows **CBI + CARICOM** (not AGOA/AfCFTA)

## 6. Africa hub entry (optional)

1. **Intelligence → Africa Intelligence**
2. Scroll to **AGOA Legislative Tracker** CTA → Open AGOA Tracker

---

## Regression checks before demo

```bash
npx tsx scripts/test-human-ready-gate.ts
```

- [ ] Mega nav: Trade Intelligence + AGOA Tracker links work
- [ ] Business user: no "Limited View" on AGOA page
- [ ] Unauthenticated AGOA: timeline + apparel badges visible; card details gated
- [ ] `/country/JAM` redirects to `?tab=overview`
