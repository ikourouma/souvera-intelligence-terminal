# Comparison Lab — Phase 2.6+ UX Enhancement Spec

**Status:** Deferred from Phase 2.5 sign-off  
**Current state:** `/intelligence/compare` remains functional as a 2-country Quick Compare workspace  
**Reference implementation:** AfCETA Corridor Lab filter panel in `AfCETATradeIntelligence.tsx`

---

## Concept

Two-mode compare workspace mirroring the AfCETA Corridor Lab analytical pattern:

| Mode | Purpose |
|------|---------|
| **Quick Compare** | Current 2-country side-by-side (keep as-is) |
| **Comparison Lab** | Multi-filter analytical workspace for N-country matrix views |

---

## Comparison Lab Filters

Adapted from the AfCETA filter panel pattern (~lines 200–350 in `AfCETATradeIntelligence.tsx`):

- **Region scope chips:** Africa / Caribbean / Global
- **Country search + multi-select:** up to 4 markets for Professional tier
- **Sector multi-select chips:** from `SECTOR_TAXONOMY`
- **Signal tier filter:** 5-level enum (`high_growth`, `emerging`, `stable`, `watchlist`, `risk_elevated`)
- **Pilot markets toggle:** `FULL_TERMINAL_PILOT_ISO3`
- **Metric group toggles:** Macro · Trade · Risk · Sectors
- **Collapsible panel:** active-filter dot indicator + “Clear all”
- **Summary strip:** markets compared · sectors · data vintage

---

## Implementation Phases

### Phase 1 — UI shell (no new API)

- Add mode toggle: Quick Compare | Comparison Lab
- Build filter panel client state and active-filter summary strip
- Wire existing 2-country compare data path for Quick Compare mode
- Entitlement gate: Comparison Lab visible to Professional+ (Explorer sees upgrade prompt)

### Phase 2 — N-country data layer

- Extend `/api/v1/country-lite` batch endpoint **or** add `/api/v1/compare/summary`
- Return matrix-friendly payload: macro metrics, signal level, sector strength scores per ISO3
- Handle partial data gracefully (Data pending states per cell)

### Phase 3 — Export and institutional features

- CSV/PNG export for comparison matrix (Business+ tier)
- Saved comparison sets (Institutional tier, future)
- Audit log entry for exported comparisons

---

## Entitlement Matrix (proposed)

| Feature | Explorer | Professional | Business | Institutional |
|---------|----------|--------------|----------|---------------|
| Quick Compare (2 markets) | Preview / locked | Full | Full | Full |
| Comparison Lab (up to 4 markets) | — | Full | Full | Full |
| Sector filter in Lab | — | Full | Full | Full |
| Export matrix | — | — | CSV + PNG | CSV + PNG + API |

---

## Out of Scope (Phase 2.6)

- Sprint G scan copy curation for all 74 countries
- Real-time signal model refresh in compare view
- Cross-region trade flow overlay in compare matrix

---

## Verification Checklist (when implemented)

- [ ] Mode toggle preserves Quick Compare behavior with zero regression
- [ ] Filter panel matches AfCETA visual language (chips, collapsible, clear-all)
- [ ] Professional tier capped at 4 markets; upgrade prompt for Explorer
- [ ] Signal badge uses shared `MarketSignalBadge` + `resolveMarketSignal()`
- [ ] Summary strip shows accurate data vintage from API meta
- [ ] Export gated to Business+ with entitlement check on API route

---

## Related Files

- `apps/api-gateway/src/components/intelligence/CountryComparisonTool.tsx` — current Quick Compare
- `apps/api-gateway/src/app/intelligence/compare/page.tsx` — compare route
- `apps/api-gateway/src/app/intelligence/trade/afcfta/flows/AfCFTATradeIntelligence.tsx` — filter panel reference
- `apps/api-gateway/src/lib/sectors/sector-taxonomy.ts` — sector chip source
- `apps/api-gateway/src/lib/insights/signal-display.ts` — signal resolver
