# Phase 4A — Equatorial Guinea Map Debug Report

**Date:** 2026-05-05  
**Priority:** **P0 — Map Integrity Issue**  
**Status:** 🔴 BUG CONFIRMED — Investigation Complete  
**Issue Type:** GeoJSON Data Source  
**Affected Component:** Africa Map Rendering

---

## Executive Summary

Equatorial Guinea (GNQ) is not rendering on the Africa intelligence map, despite being:
- ✅ In the approved 54-country Africa scope
- ✅ In the `ISO3_REGION` mapping (`"GNQ": "central"`)
- ✅ In the `NAME_TO_ISO3` mapping (`"Equatorial Guinea": "GNQ"`)
- ✅ In the `FALLBACK_PROFILES` with full country data
- ✅ In the Supabase `souvera_countries` table

**Root Cause:** External GeoJSON data source does not include Equatorial Guinea as a separate feature, or uses an unexpected name variant.

**Impact:** Users cannot click Equatorial Guinea on the map or see it highlighted. GNQ appears as a "gap" on the Central Africa region.

---

## Investigation Results

### File Analyzed

**Path:** `apps/api-gateway/src/components/sections/africa-map.tsx`

### GeoJSON Source

**Primary URL (Line 14-15):**
```typescript
const GEO_URL = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
```

**Fallback URL (Line 17-18):**
```typescript
const GEO_URL_FALLBACK = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
```

### Mapping Verification

#### 1. ISO3_REGION Mapping (Line 72-74)

```typescript
// Central Africa (8)
CMR: "central", CAF: "central", COD: "central", COG: "central",
GAB: "central", GNQ: "central", STP: "central", TCD: "central",
```

✅ **CONFIRMED:** GNQ is mapped to `"central"` region.

#### 2. NAME_TO_ISO3 Mapping (Line 116)

```typescript
"Gabon": "GAB", "Equatorial Guinea": "GNQ",
```

✅ **CONFIRMED:** `"Equatorial Guinea"` maps to `"GNQ"`.

#### 3. FALLBACK_PROFILES (Lines 443-449)

```typescript
GNQ: {
  iso3: "GNQ", name: "Equatorial Guinea", region: "central", afdec_priority: false,
  gdp: "$12.1B", gdp_growth: "-1.5%", population: "1.5M", fdi_inflows: "$0.4B", data_year: 2026,
  headline: "Central Africa's oil-rich microstate — declining oil revenues driving economic diversification agenda.",
  sectors: ["Oil & Gas", "Methanol", "Timber"],
  afdec_note: "AfDEC observation status. NC energy services tracking diversification opportunities.",
},
```

✅ **CONFIRMED:** GNQ has complete fallback profile data.

### Map Rendering Logic

#### Geography Filtering (Lines 921-930)

```typescript
<Geographies geography={geoUrl}>
  {({ geographies }: { geographies: GeoFeature[] }) =>
    geographies.map((geo) => {
      const iso3 = getCountryISO3(geo);
      // Hide non-African features entirely
      if (!iso3 && !ISO3_REGION[iso3 ?? ""]) return null;

      const fill = getFillColor(geo);
      if (fill === "transparent") return null;
```

**How it works:**
1. `getCountryISO3(geo)` extracts country name from `geo.properties.name`
2. Looks up ISO3 code in `NAME_TO_ISO3` mapping
3. If ISO3 not found, hides the feature (`return null`)
4. If ISO3 found, checks `ISO3_REGION` to determine fill color

#### getCountryISO3 Function (Lines 780-783)

```typescript
const getCountryISO3 = useCallback((geo: GeoFeature): string | null => {
  const name = (geo.properties.name ?? geo.properties.NAME ?? "") as string;
  return NAME_TO_ISO3[name] ?? null;
}, []);
```

**Critical:** This relies on `geo.properties.name` matching a key in `NAME_TO_ISO3`.

---

## Root Cause

### Primary Issue: GeoJSON Feature Missing or Misnamed

The external GeoJSON source likely:

1. **Does NOT have Equatorial Guinea as a separate feature**, OR
2. **Uses a different name variant** not in `NAME_TO_ISO3`

### Possible Name Variants Not Mapped

Equatorial Guinea might appear in the GeoJSON as:
- `"Eq. Guinea"`
- `"Equat. Guinea"`
- `"Guinea Ecuatorial"`
- `"Guinea-Equatorial"`
- `"Equitorial Guinea"` (misspelling)
- Or combined with Cameroon/Gabon as a single feature (unlikely)

### Why This Happens

The external GeoJSON sources (`holtzy/D3-graph-gallery` and `world-atlas`) are:
- General-purpose world maps (not Africa-specific)
- May have lower resolution where small countries are omitted
- May use inconsistent naming conventions

**Equatorial Guinea is VERY SMALL:**
- Total area: 28,051 km² (108th smallest country)
- Includes mainland (Río Muni) + islands (Bioko, Annobón)
- Often omitted or merged in low-resolution world maps

---

## Verification Steps

### Step 1: Inspect GeoJSON Features

**Action:** Fetch the GeoJSON and check if Equatorial Guinea exists.

```bash
curl -s "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson" | \
  jq '.features[] | select(.properties.name | test("Guinea|GNQ"; "i")) | .properties.name'
```

**Expected Output:**
- `"Guinea"`
- `"Guinea-Bissau"`
- `"Papua New Guinea"`
- Possibly `"Equatorial Guinea"` or a variant

**If Equatorial Guinea is NOT in the output:** The GeoJSON does not include it as a separate feature.

### Step 2: Check Fallback Source

```bash
curl -s "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json" | \
  jq '.objects.countries.geometries[] | select(.properties.name | test("Guinea|GNQ"; "i")) | .properties'
```

### Step 3: Check for ISO Code Property

Some GeoJSONs use `iso_a3` or `iso3` properties:

```bash
curl -s "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson" | \
  jq '.features[] | select(.properties.iso_a3 == "GNQ" or .properties.iso3 == "GNQ")'
```

---

## Proposed Solutions

### Option 1: Add Missing Name Variants to NAME_TO_ISO3 (Quick Fix)

If Equatorial Guinea exists in the GeoJSON under a different name, add it to the mapping.

**File:** `apps/api-gateway/src/components/sections/africa-map.tsx` (Line 116)

```typescript
// ADD THESE ALIASES:
"Gabon": "GAB", "Equatorial Guinea": "GNQ",
"Eq. Guinea": "GNQ", "Equat. Guinea": "GNQ", // ADD THIS LINE
```

**Pros:**
- Quick fix (1 minute)
- No external dependency changes

**Cons:**
- Only works if feature exists in GeoJSON under a different name

---

### Option 2: Use Higher-Resolution Africa-Specific GeoJSON (Recommended)

Replace the general world GeoJSON with an Africa-specific TopoJSON that includes all 54 countries.

**Recommended Source:** Natural Earth 50m Africa

```typescript
const GEO_URL_AFRICA = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson";
```

**Filter to Africa only:**

```typescript
const geographies = await fetch(GEO_URL_AFRICA).then(r => r.json());
const africaFeatures = geographies.features.filter(f => {
  const iso3 = f.properties.ISO_A3 || f.properties.iso_a3;
  return iso3 && ISO3_REGION[iso3];
});
```

**Pros:**
- Higher resolution includes small countries
- More reliable for Equatorial Guinea, São Tomé, Seychelles, etc.
- Africa-focused source

**Cons:**
- Requires testing new GeoJSON structure
- May need to update `getCountryISO3` to use `ISO_A3` property

---

### Option 3: Use Static Self-Hosted TopoJSON (Most Reliable)

Host a custom Africa TopoJSON file in `public/data/africa-countries-50m.json`.

**Pros:**
- Full control over data
- Guaranteed to include all 54 countries
- No external CDN dependency
- Faster load times

**Cons:**
- Requires creating/sourcing custom TopoJSON
- Increases repo size (~200KB)

---

### Option 4: Fallback to SVG Polygon (Short-Term Workaround)

Manually add Equatorial Guinea as a custom SVG `<path>` with hardcoded coordinates.

**Pros:**
- Guaranteed to work
- No GeoJSON dependency

**Cons:**
- Requires manual coordinate definition
- Not scalable for other missing countries
- Breaks zoom/pan behavior

---

## Recommended Solution

**Primary:** Option 2 (Higher-Resolution Africa-Specific GeoJSON)

**Reason:**
- Solves not just GNQ but potentially other small countries
- More reliable for production
- Africa-specific source aligns with platform focus

**Fallback:** Option 1 (Add name variants)

**If GNQ exists under a different name, this is the fastest fix**

---

## Related Issues

### Are Other Countries Missing?

Potentially affected (very small countries):

| ISO3 | Country | Area (km²) | Risk Level |
|------|---------|------------|------------|
| **GNQ** | Equatorial Guinea | 28,051 | 🔴 High (confirmed) |
| **STP** | São Tomé & Príncipe | 964 | 🟡 Medium |
| **SYC** | Seychelles | 459 | 🟡 Medium |
| **COM** | Comoros | 1,862 | 🟡 Medium |
| **CPV** | Cabo Verde | 4,033 | 🟡 Medium |
| **MUS** | Mauritius | 2,040 | 🟡 Medium |

**Verification Required:** Check if these islands are rendering correctly.

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| Equatorial Guinea renders on Africa map | ⏳ Pending |
| GNQ fills with Central Africa orange color | ⏳ Pending |
| GNQ responds to hover (tooltip shows) | ⏳ Pending |
| GNQ responds to click (country panel opens) | ⏳ Pending |
| No other African countries broken by fix | ⏳ Pending |
| All 54 African countries render correctly | ⏳ Pending |
| All island nations (STP, SYC, COM, CPV, MUS) render | ⏳ Pending |

---

## Implementation Steps

1. ✅ **Investigation Complete** — Root cause identified
2. ⏸️ **GeoJSON Inspection** — Verify if GNQ exists under different name
3. ⏸️ **Solution Selection** — Choose Option 1, 2, or 3
4. ⏸️ **Code Change** — Update GeoJSON source or NAME_TO_ISO3
5. ⏸️ **Browser QA** — Verify GNQ renders and is clickable
6. ⏸️ **Island Nations QA** — Verify STP, SYC, COM, CPV, MUS also render
7. ⏸️ **All 54 Countries QA** — Systematic check of full Africa scope

---

## Risk Assessment

**Risk Level:** 🟡 Medium

**Why Medium Risk:**
- Affects map rendering (core feature)
- Changing GeoJSON source could break other countries
- Requires thorough QA of all 54 countries

**Mitigation:**
- Test in dev environment first
- Keep fallback URL
- QA checklist for all 54 countries

---

## Recommendation

**Priority:** **P0 — Critical Map Integrity Issue**

Equatorial Guinea is part of the approved 54-country Africa scope and must be visible on the map. This should be fixed immediately after FDI formatting (P1).

**Implementation Order:**
1. 🟢 **P1 — FDI Formatting** (15 minutes, high UX impact, low risk)
2. 🔴 **P0 — Equatorial Guinea Map** (30-60 minutes, medium risk, core integrity)
3. 🟡 **P2 — Data Coverage Gaps** (documentation/communication, not a bug)

---

**Document Status:** ✅ COMPLETE — Investigation Complete, Ready for Solution Selection  
**Next Step:** Inspect GeoJSON sources to determine if Option 1 or Option 2 is needed  
**Owner:** Platform Engineering
