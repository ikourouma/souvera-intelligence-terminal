# Pre-Scale Gate — NGA + JAM Full Parity

**Date:** May 2026  
**Rule:** Do **not** scale to 74 countries until every row in this matrix is ✅ for both NGA and JAM.

---

## Is JAM Sectors part of the scaling plan?

**No — it is a prerequisite gate, not a scale-out item.**

| Work stream | Type | Status |
|-------------|------|--------|
| Sprint G signal scan summaries | Scale-ready pattern (Phase 1–4) | ✅ NGA + JAM |
| Sprint E News Pulse | Scale-ready after pilot validation | ✅ NGA + JAM |
| **JAM Sectors tab (full DB seed)** | **Pre-scale gate** | ✅ Implemented |
| Sprint F PDF pipeline | Post-gate | ⏳ Planned |

Scaling assumes **pilot countries are complete end-to-end**. JAM Sectors was missing because only NGA had `seed-nigeria-sectors.sql`; JAM had legacy SQL packs using obsolete columns (`teaser_md`, `rationale_md`) incompatible with the live table schema.

---

## NGA vs JAM verification matrix

| Tab / Feature | NGA | JAM |
|---------------|-----|-----|
| Overview | ✅ | ✅ |
| Economy | ✅ | ✅ |
| Opportunity | ✅ | ✅ |
| Risk | ✅ | ✅ |
| Trade | ✅ | ✅ |
| **Sectors** | ✅ 5 sectors (full seed) | ✅ 5 sectors (full seed) |
| News Pulse | ✅ | ✅ |
| Signal scan row | ✅ | ✅ |
| Momentum band | ✅ | ✅ |

---

## JAM Sectors deliverables

| File | Purpose |
|------|---------|
| `scripts/seed-jamaica-sectors.ts` | Full 5-sector seed (teaser, scores, narratives, key players, CBI trade) |
| `scripts/test-sectors-parity.ts` | NGA/JAM parity + contamination guard |
| `country-sectors-content.ts` | CBI labels (not AGOA) on JAM UI |

### Runbook

```bash
# Full JAM sectors (required once)
npx tsx scripts/seed-jamaica-sectors.ts

# Or via orchestrator
npx tsx scripts/seed-jamaica-data.ts

# Verify both countries before any scale-out
npx tsx scripts/test-sectors-parity.ts
```

---

## Scale-out order (after gate passes)

1. **Signal scan** — region defaults + computed bullets (74 countries)
2. **News Pulse** — extend `NEWS_PULSE_PILOT` + GDELT ingest
3. **Sectors** — priority-20 SQL pack migrated to current schema OR TS seeds per country
4. **Overview/Trade/Risk copy** — `country-*-content.ts` pattern per region
5. **CI** — `test-sectors-parity.ts` + `test-signal-scan-purity.ts` extended in GitHub Action

---

## JAM sector keys (must match UI + API)

| Key | Label | Trade block |
|-----|-------|-------------|
| fintech | Fintech & Digital Finance | CBI |
| energy | Energy & Renewables | CBI |
| agriculture | Agriculture & Agribusiness | CBI |
| mining | Mining & Alumina | CBI |
| logistics | Logistics & Trade | CBI |

NGA uses `technology`, `agriculture`, `energy`, `manufacturing`, `financial_services` — sector keys are **country-specific**; do not copy NGA keys to JAM.
