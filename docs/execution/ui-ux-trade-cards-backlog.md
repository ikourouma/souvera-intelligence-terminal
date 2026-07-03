# UI/UX Trade Cards Backlog (Phase 2 — Deferred)

**Status:** Documented backlog — not blocking Phase 0/B/C  
**Pilot market:** Zimbabwe (`ZWE`)  
**Reference:** Export Standardization Phase 0 plan, item 4

## Problem

The **Top Trade Partners** card on the country Trade tab does not match the visual and analysis shell used by the **US Trade Relationship** card. This creates inconsistent hierarchy, duplicate analysis on PNG export, and missing policy context on the partners view.

## Comparison

| Dimension | US Trade Relationship | Top Trade Partners |
|-----------|----------------------|-------------------|
| Container | Gradient bordered section, icon header | Flat `space-y-4`, no hero wrapper |
| Layout | 2-col exports/imports + full-width AGOA block | Asymmetric 2+3 partner grid |
| Analysis | Single footer Souvera Analysis (live + PNG) | Duplicate: in-card bullets + footer on export |
| Policy badges | AGOA strip + legislative tracker | Only US card has “AGOA Eligible” badge |
| Visual hierarchy | Strong section titles + subtitles | Partner ranks compete visually |

## Recommended refactor (future sprint)

1. Wrap `TopPartnersSection` in the same gradient card shell as `USTradeSection` (shared layout primitive).
2. Remove redundant in-card `AnalysisBullets` from export clone (`data-export-hide-analysis`) — already applied to US Trade; extend to partners block.
3. Add policy badge strip (AGOA/CBI/AfCFTA) when partner context is U.S.-linked.
4. Unify footer Souvera Analysis via `buildUsTradeCardAnalysis` / `buildTradeTabCardAnalysis` with `cardType: 'trade_partners'`.
5. Align partner grid to 2-column responsive layout matching export/import columns on US Trade card.

## Acceptance criteria

- [ ] ZWE Top Partners PNG matches US Trade PNG shell (header, flag, gradient border, single SOUVERA ANALYSIS footer).
- [ ] No duplicate analysis blocks in PNG export.
- [ ] AGOA suspension narrative visible on partners card when U.S. is a top partner.
- [ ] Regression pass on NGA (eligible) and JAM (CBI).

## Related files

- `apps/api-gateway/src/components/intelligence/tabs/TradeTab.tsx` — `USTradeSection`, `TopPartnersSection`
- `apps/api-gateway/src/lib/intelligence/us-trade-card-analysis.ts`
- `apps/api-gateway/src/lib/intelligence/export-png.ts`
