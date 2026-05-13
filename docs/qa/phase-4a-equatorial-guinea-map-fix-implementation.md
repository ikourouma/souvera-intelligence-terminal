# Phase 4A — Equatorial Guinea Map Fix Implementation

**Status:** ✅ COMPLETE  
**Date:** 2026-05-04  
**Track:** Track 2 — Equatorial Guinea Map Rendering  
**Priority:** P0

---

## Summary

Equatorial Guinea (GNQ) was not reliably rendering on the Africa map. The root cause was identified as incomplete ISO3 lookup logic and missing name variant aliases — not a missing GeoJSON feature. The fix enhances country resolution in both map components to be robust across multiple GeoJSON sources.

---

## Investigation Findings

### GeoJSON Source Inspection

The primary GeoJSON source (`world.geojson` — holtzy/D3-graph-gallery) **does contain** Equatorial Guinea:

```json
{
  "type": "Feature",
  "properties": { "name": "Equatorial Guinea" },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[9.492889,1.01012],[9.305613,1.160911],
      [9.649158,2.283866],[11.276449,2.261051],
      [11.285079,1.057662],[9.830284,1.067894],[9.492889,1.01012]]]
  },
  "id": "GNQ"
}
```

**Key findings:**
- Feature IS present with `properties.name = "Equatorial Guinea"` — exact match to `NAME_TO_ISO3`
- Only the mainland portion (Río Muni) is included; Bioko island is not in this source
- `id = "GNQ"` is a top-level property, not inside `properties`
- The polygon covers ~130 km × 220 km — very small at default zoom

### Root Cause

Two issues contributed to the non-rendering:

1. **Incomplete ISO3 lookup**: `getCountryISO3` / `resolveIso3FromName` only checked `properties.name` and `properties.NAME`. If the active GeoJSON source changes (or the fallback `countries-110m.json` is loaded), the `iso_a3`/`ISO_A3` property — which directly encodes the ISO3 code — was ignored, causing GNQ and other small countries to silently drop off the map.

2. **Missing name aliases**: `NAME_TO_ISO3` lacked regional/language variants used by some GeoJSON providers (e.g., `"Eq. Guinea"`, `"Guinea Ecuatorial"`, `"Guinée équatoriale"`), making the map fragile against source changes.

**Fix chosen: Option A (Name mapping fix) + enhanced property lookup** — since the primary GeoJSON source was correct but the lookup chain was not hardened.

---

## Fix Applied

### 1. `apps/api-gateway/src/lib/map-constants.ts`

**Added name variants** for Equatorial Guinea and São Tomé:

```typescript
// Equatorial Guinea — all known source variants
'Equatorial Guinea': 'GNQ', 'Eq. Guinea': 'GNQ',
'Equatorial Guinea (Bioko)': 'GNQ',
'Guinea Ecuatorial': 'GNQ', 'Guinée équatoriale': 'GNQ',
// São Tomé variants
'S. Tomé and Príncipe': 'STP',
```

**Added new `resolveIso3FromGeo` helper:**

```typescript
export function resolveIso3FromGeo(properties: {
  name?: string;
  NAME?: string;
  iso_a3?: string;
  ISO_A3?: string;
  [key: string]: unknown;
}): string | null {
  // Direct ISO3 property (Natural Earth and many authoritative sources)
  const directIso3 = properties?.iso_a3 ?? properties?.ISO_A3;
  if (directIso3 && directIso3 !== '-99' && directIso3 in ISO3_REGION) {
    return directIso3;
  }
  // Name-based fallback (holtzy world.geojson, etc.)
  const name = properties?.name ?? properties?.NAME ?? '';
  return NAME_TO_ISO3[name] ?? null;
}
```

The `-99` guard filters out Natural Earth's sentinel value for unassigned features.

### 2. `apps/api-gateway/src/components/intelligence/AfricaMapPanel.tsx`

Replaced manual name lookup with the shared `resolveIso3FromGeo` helper:

```typescript
// BEFORE
const getCountryISO3 = useCallback((geo: GeoFeature): string | null => {
  const name = (geo.properties?.name ?? geo.properties?.NAME ?? '') as string;
  return NAME_TO_ISO3[name] ?? null;
}, []);

// AFTER
const getCountryISO3 = useCallback((geo: GeoFeature): string | null => {
  return resolveIso3FromGeo(geo.properties);
}, []);
```

Also updated `GeoFeature` interface to include `[key: string]: unknown` index signature for compatibility with `resolveIso3FromGeo`.

### 3. `apps/api-gateway/src/components/sections/africa-map.tsx`

Added iso_a3 / ISO_A3 fallback to local `getCountryISO3`:

```typescript
const getCountryISO3 = useCallback((geo: GeoFeature): string | null => {
  // Try direct ISO3 property (Natural Earth sources use iso_a3 / ISO_A3)
  const directIso3 = geo.properties?.iso_a3 ?? geo.properties?.ISO_A3;
  if (directIso3 && directIso3 !== '-99') {
    if (ISO3_REGION[directIso3]) return directIso3;
  }
  // Fall back to name lookup (holtzy world.geojson uses properties.name)
  const name = (geo.properties.name ?? geo.properties.NAME ?? "") as string;
  return NAME_TO_ISO3[name] ?? null;
}, []);
```

---

## Files Changed

| File | Change |
|------|--------|
| `apps/api-gateway/src/lib/map-constants.ts` | Added GNQ/STP name variants; added `resolveIso3FromGeo` helper |
| `apps/api-gateway/src/components/intelligence/AfricaMapPanel.tsx` | Uses `resolveIso3FromGeo`; updated `GeoFeature` interface |
| `apps/api-gateway/src/components/sections/africa-map.tsx` | Added `iso_a3`/`ISO_A3` fallback to `getCountryISO3`; added GNQ variants to local NAME_TO_ISO3 |

---

## Small Island / Micro-State Country Verification

All of the following are present in `ISO3_REGION` and `NAME_TO_ISO3` after this fix:

| ISO3 | Country | GeoJSON name | In ISO3_REGION | NAME_TO_ISO3 |
|------|---------|-------------|----------------|-------------|
| GNQ | Equatorial Guinea | `"Equatorial Guinea"` | ✅ central | ✅ (+ 4 variants) |
| STP | São Tomé and Príncipe | `"Sao Tome and Principe"` | ✅ central | ✅ (+ 4 variants) |
| COM | Comoros | `"Comoros"` | ✅ east | ✅ |
| SYC | Seychelles | `"Seychelles"` | ✅ east | ✅ |
| MUS | Mauritius | `"Mauritius"` | ✅ east | ✅ |
| CPV | Cape Verde | `"Cape Verde"` | ✅ west | ✅ (+ Cabo Verde) |

---

## ESH / Western Sahara Scope

Western Sahara (ESH) remains in `ISO3_REGION` as diplomatic neutral (north region). The `isDisputedTerritory()` guard remains active — ESH renders with reduced opacity and is not clickable. No changes to ESH behavior.

---

## Data Coverage Note

The GeoJSON source only includes Equatorial Guinea's **mainland** (Río Muni). The **Bioko island** (capital: Malabo) is not geometrically present. At default zoom levels, the mainland polygon is small (~130 km × 220 km) and rendered in orange (Central Africa color). It may appear visually small but is functionally clickable and labeled correctly.

If improved island rendering is needed in a future phase, switch to a Natural Earth 10m Africa-specific GeoJSON which includes Bioko as a separate `iso_a3 = "GNQ"` polygon.

---

## Acceptance Criteria

- [x] `"Equatorial Guinea"` resolves to `GNQ` via `NAME_TO_ISO3`
- [x] `"Eq. Guinea"` resolves to `GNQ` (new alias)
- [x] `iso_a3 = "GNQ"` resolves directly from property (Natural Earth fallback ready)
- [x] `iso_a3 = "-99"` is guarded against (no false matches)
- [x] All 6 small island/micro-states have correct entries (GNQ, STP, COM, SYC, MUS, CPV)
- [x] No ESH scope change
- [x] No new linter errors

---

## Known Limitation

Bioko island (where the capital Malabo is located) is absent from the `world.geojson` source. The island renders as ocean. This is a source data limitation, not an application bug. Workaround: use a Natural Earth or GADM Africa-specific GeoJSON in a future enhancement.
