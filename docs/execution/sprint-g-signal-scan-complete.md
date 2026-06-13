# Sprint G — Signal Row Scan Summaries (Option A)

**Date:** May 2026  
**Status:** Complete (NGA + JAM pilot)

---

## What shipped

| Card | Addition |
|------|----------|
| **Signal Strength** | Badge + 2 bullets (metric-derived with editorial fallback) |
| **Economic Momentum** | Single band label + country clause (no bullets) |
| **Interaction** | Momentum card click → Overview `#economic-momentum-card` |

### Files

| File | Purpose |
|------|---------|
| `country-signal-scan.ts` | Badge suffix + bullet builder + purity guards |
| `momentum.ts` | `getMomentumBand()` + clause per ISO3 |
| `route.ts` | `signal.scan`, `momentum.bandLabel/bandClause` |
| `SignalMomentumRow.tsx` | Scan block + band label UI |
| `test-signal-scan-purity.ts` | NGA/JAM contamination self-test |

---

## NGA vs JAM expected output

| Field | NGA | JAM |
|-------|-----|-----|
| Badge suffix | Reform momentum | Caribbean gateway |
| Momentum clause | reforms + tech expansion | tourism + nearshore services |
| Fallback bullets | Tech/fintech, Post-reform macro | Tourism recovery, Kingston corridor |

Bullets prefer live metrics: FDI → top sector → GDP growth → inflation.

---

## Self-test

```bash
npx tsx scripts/test-signal-scan-purity.ts
```

---

## Scale to 74 countries

### Phase 1 — Computed layer (no new editorial)

For all countries with World Bank lite/pro views:

1. **Badge:** `{signal_level}` + region default suffix
   - Africa → `Regional gateway`
   - Caribbean → `Caribbean gateway`
   - Default → `Market watch`
2. **Bullets:** FDI, top sector (from `souvera_country_sectors`), GDP growth, inflation — same priority as NGA/JAM
3. **Momentum clause:** region template only until country-specific editorial added

**Effort:** ~0.5 day (extend `BADGE_SUFFIX` + `MOMENTUM_CLAUSE` maps by region)

### Phase 2 — Country editorial overrides (priority 20)

Add ISO3 entries to `BADGE_SUFFIX` and `FALLBACK_BULLETS` for the 20 priority countries in sql-pack-v1.11b (same pattern as NGA/JAM).

**Effort:** ~1 day editorial + seed review

### Phase 3 — Admin overrides (optional)

```sql
ALTER TABLE souvera_country_profiles
  ADD COLUMN signal_scan_badge text,
  ADD COLUMN signal_scan_bullets jsonb;
```

Admin UI at `/admin/data/signal-scan` for badge/bullet overrides; API prefers DB override → computed → fallback.

**Effort:** ~1 day

### Phase 4 — CI guard

Run `test-signal-scan-purity.ts` extended to all 74 ISO3s in GitHub Action; fail build on cross-region marker violations (Africa copy on Caribbean, etc.).

---

## Verification

- [ ] `/country/NGA` — badge contains "Reform momentum", no Jamaica/CARICOM terms
- [ ] `/country/JAM` — badge contains "Caribbean gateway", no Nigeria/AGOA terms
- [ ] Momentum card click opens Overview Economic Momentum section
- [ ] `npx tsx scripts/test-signal-scan-purity.ts` exits 0
