# Caribbean Market Shell v1 — List UI (Archived)

**Status:** Archived  
**Date:** 2026-05-20  
**Superseded by:** `CaribbeanMapPanel` (geospatial map, Natural Earth 50m)

## Summary

Phase 3 Step 4A shipped a **searchable card-grid** Caribbean market selector (`CaribbeanMarketShell`) used in `SouveraMapWorkspace` when `region=caribbean`. It was replaced by an interactive geospatial map matching the Africa terminal pattern.

## Archived artifacts

| Artifact | Path |
|----------|------|
| Component (frozen) | `apps/api-gateway/src/components/intelligence/archive/CaribbeanMarketShell.v1-list.tsx` |
| Re-export shim | `apps/api-gateway/src/components/intelligence/CaribbeanMarketShell.tsx` |
| Live reference page | `/intelligence/caribbean/list-archive` |
| Map preview (dev QA) | `/intelligence/caribbean/map-preview` |

## Production migration

- **Before:** `SouveraMapWorkspace` → `CaribbeanMarketShell` (list + cards)
- **After:** `SouveraMapWorkspace` → `CaribbeanMapPanel` (map + zone colors + markers)

Africa path unchanged: `AfricaMapPanel`.

## When to use the archive

- Compare list vs map UX for other regions
- Restore list-only fallback if geospatial CDN fails in constrained environments
- Onboard engineers to Phase 3 Caribbean work (`PHASE3_STEP4A_COMPLETE.md`, etc.)

## Restore instructions (emergency)

1. In `SouveraMapWorkspace.tsx`, replace `CaribbeanMapPanel` import/render with `CaribbeanMarketShell` in the `currentRegion === 'caribbean'` block.
2. No database changes required — both consume `/api/v1/countries?region=caribbean`.

## Related docs

- `PHASE3_STEP4A_COMPLETE.md` — original list shell delivery
- `docs/execution/phase-3-step-4-caribbean-market-shell-plan.md` — design spec
- `docs/design/souvera-map-workspace-enhancement-plan.md` — planned map parity (now shipped)
