# Souvera Map Workspace Enhancement Plan
**Document Type:** Design Specification & Implementation Plan  
**Version:** 1.0  
**Date:** April 29, 2026  
**Owner:** Engineering Team  
**Status:** Approved for Implementation

---

## 1. Executive Summary

This document defines the implementation plan for enhancing the Souvera Intelligence Map into an executive-grade **Map Intelligence Workspace**. The enhancement transforms the current market-grid-with-drawer approach into a side-by-side map + intelligence panel experience, inspired by AfDEC patterns but built with Souvera's unique brand identity, data architecture, and entitlement model.

### Key Outcomes

- **Enhanced UX:** Side-by-side map + intelligence panel layout for efficient country analysis
- **Terminal-Grade Design:** Workspace-specific navigation header with "Curated Preview Data" status
- **Entitlement-Aware:** Server-side filtering for FDI, sectors, and narrative content
- **Fortune-5 Quality:** Executive visual standards with source attribution
- **Responsive:** Full support for desktop, tablet, and mobile experiences

### Implementation Sequence

| Phase | Target | Scope |
|-------|--------|-------|
| **Phase 1** | `/intelligence/map` | Full Africa map workspace — primary implementation target |
| **Phase 2** | `/intelligence/africa` | Embed workspace section into regional command page |
| **Phase 3A** | `/intelligence/caribbean` | Caribbean Market Shell (no SVG map yet) |
| **Phase 3B** | `/intelligence/caribbean` | Caribbean SVG map when suitable assets available |
| **Phase 4** | All pages | Polish, mobile optimization, accessibility, performance |

---

## 2. Current Implementation Assessment

### 2.1 Existing Components

| Component | Location | Purpose | Reuse Potential |
|-----------|----------|---------|-----------------|
| `IntelligenceMapClient` | `components/intelligence/` | Fetches country data, renders MarketGrid, opens CountryDrawer | Refactor as data layer |
| `MarketGrid` | `components/intelligence/` | Card grid with search, filter, expand/collapse | Keep as fallback below workspace |
| `CountryDrawer` | `components/intelligence/` | Right-side drawer with country metrics | Replace with persistent panel |
| `AfricaMap` | `components/sections/africa-map.tsx` | Full SVG Africa map with react-simple-maps, tooltip, panel | **High reuse** — adaptation candidate |
| `IntelligentMap` | `components/map/IntelligentMap.tsx` | Simplified SVG map shell | Low reuse — too basic |
| `CountryIntelligencePanel` | `components/panels/` | Standalone panel with metrics, tabs, signals | **Medium reuse** — adapt for workspace |
| `TerminalShell` | `components/layout/` | Sidebar + top bar terminal layout | Inspire workspace nav design |
| `RegionalHeroCommand` | `components/regional/` | Regional hero with metrics | Keep for page hero |

### 2.2 Existing API Capabilities

| Endpoint | Current State | Enhancements Needed |
|----------|---------------|---------------------|
| `/api/v1/countries` | Returns country list with GDP, population, signal | **Add `gdpGrowthPct`** to response |
| `/api/v1/country-lite` | Returns detailed country with metrics, sectors, narrative | **Limit sectors by tier** (1 for Public/Explorer, 5 for Professional+) |

### 2.3 Entitlement Package Analysis

From `packages/entitlements/index.ts`:

```typescript
export const PLAN_ENTITLEMENTS: Record<PlanId, EntitlementKey[]> = {
  public: ['country_identity', 'headline_macro', 'sector_teasers', 'news_teasers'],
  explorer: ['country_identity', 'headline_macro', 'sector_teasers', 'news_teasers', 'compare_lite'],
  professional: ['full_macro', 'fx_metrics', 'sector_rationale', ...],
  business: ['forecast_metrics', 'reports_download', ...],
  institutional: ['api_full', 'audit_logs', ...],
};
```

**Key Findings:**
- `full_macro` entitlement (Professional+) enables FDI display
- `sector_rationale` entitlement controls full sector details
- API already filters FDI based on entitlements
- **Sector count limiting needs API enhancement** — currently returns up to 5 for all tiers

---

## 3. Access Tier Model

### 3.1 Content Visibility by Tier

| Content | Public | Explorer | Professional | Business | Institutional |
|---------|--------|----------|--------------|----------|---------------|
| Country Identity | ✅ | ✅ | ✅ | ✅ | ✅ |
| GDP | ✅ | ✅ | ✅ | ✅ | ✅ |
| GDP Growth | ✅ | ✅ | ✅ | ✅ | ✅ |
| Population | ✅ | ✅ | ✅ | ✅ | ✅ |
| **FDI** | ❌ Locked | ❌ Locked | ✅ Visible | ✅ Visible | ✅ Visible |
| **Sectors** | 1 | 1 | 5 | 5 | 5 |
| Sector Rationale | ❌ | ❌ | ✅ | ✅ | ✅ |
| Narrative/Insight | Teaser | Teaser | Full | Full | Full |
| Signal Level | ✅ | ✅ | ✅ | ✅ | ✅ |

### 3.2 Tier Behavior Details

**Public (Unauthenticated):**
- Country identity, GDP, GDP growth, population visible
- One key sector displayed
- FDI metric shows locked state with "Professional+" badge
- CTA routes to `/access/request-access`

**Explorer (Authenticated, Free Tier):**
- Same data visibility as Public
- Authenticated context enables personalized prompts
- Upgrade/request access messaging
- FDI locked with "Professional+" badge
- One key sector displayed

**Professional:**
- FDI visible
- Up to 5 sectors displayed
- Full sector rationale if available
- Richer narrative content from API

**Business:**
- Same as Professional
- Future: Trade snapshots, risk modules, reports when implemented

**Institutional:**
- Highest non-admin access
- Future: API access, export capabilities, institutional modules

---

## 4. Target UX Description

### 4.1 Desktop Layout (≥1280px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  WORKSPACE TOP NAV                                                          │
│  [Logo] [Intelligence / Map] [Curated Preview Data] [Request Access CTA]   │
├───────────────────────────────────────────────────┬─────────────────────────┤
│                                                   │                         │
│              MAP PANEL (65-70%)                   │  COUNTRY INTEL PANEL    │
│                                                   │      (30-35%)           │
│  [Interactive SVG Africa Map]                     │                         │
│  [Regional Legend: West, East, etc.]              │  [🇳🇬] Nigeria           │
│  [Zoom/Pan Controls]                              │  Capital: Abuja         │
│                                                   │  West Africa            │
│  Country States:                                  │                         │
│  • Approved markets: region color                 │  Source: World Bank     │
│  • Selected: glow border                          │  Curated Preview Data   │
│  • Hover: lighter fill + tooltip                  │                         │
│  • Out-of-scope: muted gray                       │  [Key Metrics Grid]     │
│  • Disabled: cursor-not-allowed                   │  GDP | Growth           │
│                                                   │  Pop | FDI [locked]     │
│                                                   │                         │
│                                                   │  [Key Sectors]          │
│                                                   │  • Fintech              │
│                                                   │                         │
│                                                   │  [Souvera Intelligence] │
│                                                   │                         │
│                                                   │  [Explore Nigeria →]    │
└───────────────────────────────────────────────────┴─────────────────────────┘
```

### 4.2 Tablet Layout (768px - 1279px)

- Side-by-side layout maintained
- Map panel: 60% width
- Country panel: 40% width
- Reduced map height (500px minimum)
- Panel scrolls independently

### 4.3 Mobile Layout (<768px)

```
┌─────────────────────────────────────┐
│  WORKSPACE TOP NAV (compact)        │
├─────────────────────────────────────┤
│                                     │
│  MAP PANEL (100% width)             │
│  height: 350-400px                  │
│  [Tap country to select]            │
│  [Pinch to zoom]                    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  COUNTRY PANEL (100% width)         │
│  [Full vertical scroll]             │
│  [Collapsible sections if needed]   │
│                                     │
└─────────────────────────────────────┘
```

### 4.4 Interaction Flow

1. User lands on `/intelligence/map`
2. Map workspace loads with default view (no country selected)
3. Right panel shows "Top 10 Economies" list or regional overview
4. User hovers country → tooltip appears with name, flag, GDP, growth
5. User clicks country → panel updates with full country intelligence
6. Disabled countries show muted appearance with "Outside Souvera coverage" tooltip
7. Panel shows entitlement-appropriate content
8. CTA routes to `/access/request-access?country={ISO3}&source=map-workspace`

---

## 5. Component Architecture

### 5.1 New Components

#### `SouveraMapWorkspace`
**Purpose:** Main container orchestrating map and panel  
**Location:** `apps/api-gateway/src/components/intelligence/SouveraMapWorkspace.tsx`

```typescript
interface SouveraMapWorkspaceProps {
  region: 'africa' | 'caribbean' | 'all';
  defaultSelectedIso3?: string;
}
```

**Responsibilities:**
- Fetch country list from `/api/v1/countries`
- Manage selected country state
- Fetch selected country details from `/api/v1/country-lite`
- Coordinate map and panel components
- Handle responsive layout

---

#### `MapWorkspaceTopNav`
**Purpose:** Workspace-specific header with breadcrumb, status, CTA  
**Location:** `apps/api-gateway/src/components/intelligence/MapWorkspaceTopNav.tsx`

```typescript
interface MapWorkspaceTopNavProps {
  region: 'africa' | 'caribbean' | 'all';
  workspaceLabel: string;
  statusVariant?: 'preview' | 'live';
}
```

**Content:**
- Souvera logo / "Intelligence Terminal" text
- Breadcrumb: Intelligence / Africa (or Caribbean / Map)
- Status pill: **"Curated Preview Data"** (NOT "Live")
- Request Access button

**Language Rules:**
- ✅ Use: "Curated Preview Data", "Source-Attributed Preview"
- ❌ Do NOT use: "Live", "Live · Supabase", "Supabase connected", "real-time"

---

#### `AfricaMapPanel`
**Purpose:** Interactive SVG Africa map with selection, hover, zoom  
**Location:** `apps/api-gateway/src/components/intelligence/AfricaMapPanel.tsx`

```typescript
interface AfricaMapPanelProps {
  countries: Country[];
  selectedIso3: string | null;
  onCountrySelect: (iso3: string) => void;
  onCountryHover: (iso3: string | null, event?: MouseEvent) => void;
  disabledCountries?: string[];
}
```

**Implementation Notes:**
- Adapt `react-simple-maps` implementation from `africa-map.tsx`
- Reuse `REGION_COLORS` and `ISO3_REGION` mappings
- Add selected state glow effect
- Add disabled/muted state for out-of-scope countries

---

#### `CaribbeanMarketShell`
**Purpose:** Phase 3A placeholder for Caribbean (premium grid layout, no SVG)  
**Location:** `apps/api-gateway/src/components/intelligence/CaribbeanMarketShell.tsx`

```typescript
interface CaribbeanMarketShellProps {
  countries: Country[];
  selectedIso3: string | null;
  onCountrySelect: (iso3: string) => void;
}
```

**Design:**
- Grid of premium country cards styled as map alternative
- Corridor view groupings
- Country/territory list with flag, name, GDP
- Right-side intelligence panel (same as Africa)
- Source/freshness layer
- Entitlement behavior identical to Africa map

**Phase 3B:** Replace with proper `CaribbeanMapPanel` when SVG assets ready

---

#### `CountryIntelligencePanel`
**Purpose:** Persistent right-side panel with country intelligence  
**Location:** `apps/api-gateway/src/components/intelligence/CountryIntelligencePanel.tsx`

```typescript
interface CountryIntelligencePanelProps {
  country: CountryDetail | null;
  loading: boolean;
  accessTier: PlanId;
  onCtaClick: (iso3: string) => void;
}
```

**Panel Content (in order):**

1. **Header**
   - Flag image
   - Country name
   - Capital city
   - Region / Subregion

2. **Source/Freshness Line**
   - "Data: 2026 · World Bank, IMF"
   - "Curated Preview Data"

3. **Country Insight**
   - 1-2 sentence strategic summary
   - Teaser for Public/Explorer, full for Professional+

4. **Key Metrics Grid**
   - GDP (always visible)
   - GDP Growth (always visible)
   - Population (always visible)
   - FDI (locked for Public/Explorer, visible for Professional+)

5. **Key Sectors**
   - 1 sector for Public/Explorer
   - Up to 5 sectors for Professional+

6. **Souvera Intelligence**
   - Brief narrative block (Professional+ only)

7. **CTA Button**
   - "Explore [Country] Opportunities"
   - Routes to `/access/request-access?country={ISO3}&name={NAME}&source=map-workspace`

---

#### `EntitledMetricCard`
**Purpose:** Single metric display with locked/visible state  
**Location:** `apps/api-gateway/src/components/intelligence/EntitledMetricCard.tsx`

```typescript
interface EntitledMetricCardProps {
  label: string;
  value: string | number | null;
  icon?: React.ComponentType;
  color?: string;
  locked?: boolean;
  lockedLabel?: string; // e.g., "Professional+"
  loading?: boolean;
}
```

---

#### `EntitledSectorList`
**Purpose:** Sector list with count limiting based on entitlement  
**Location:** `apps/api-gateway/src/components/intelligence/EntitledSectorList.tsx`

```typescript
interface EntitledSectorListProps {
  sectors: Array<{ label: string; teaser?: string }>;
  maxVisible: number;
  totalCount?: number;
  showUpgradeHint?: boolean;
}
```

---

#### `RegionalLegend`
**Purpose:** Color legend for map regions  
**Location:** `apps/api-gateway/src/components/intelligence/RegionalLegend.tsx`

```typescript
interface RegionalLegendProps {
  regions: Array<{ key: string; label: string; color: string }>;
  variant?: 'horizontal' | 'vertical';
}
```

---

#### `MapTooltip`
**Purpose:** Floating tooltip on country hover  
**Location:** `apps/api-gateway/src/components/intelligence/MapTooltip.tsx`

```typescript
interface MapTooltipProps {
  data: {
    name: string;
    iso3: string;
    flagUrl?: string;
    gdp?: string;
    gdpGrowth?: string;
    region?: string;
  } | null;
  position: { x: number; y: number };
  disabled?: boolean;
  disabledMessage?: string;
}
```

---

### 5.2 Component Hierarchy

```
SouveraMapWorkspace
├── MapWorkspaceTopNav
│   ├── Logo
│   ├── Breadcrumb
│   ├── StatusPill ("Curated Preview Data")
│   └── RequestAccessButton
├── div.workspace-layout (flex)
│   ├── div.map-panel (65-70%)
│   │   ├── AfricaMapPanel | CaribbeanMarketShell
│   │   ├── RegionalLegend
│   │   └── MapTooltip (portal)
│   └── div.intel-panel (30-35%)
│       └── CountryIntelligencePanel
│           ├── Header (flag, name, capital, region)
│           ├── SourceLine
│           ├── CountryInsight
│           ├── MetricsGrid
│           │   └── EntitledMetricCard (x4)
│           ├── EntitledSectorList
│           ├── SouveraIntelligenceBlock (Pro+ only)
│           └── CTAButton
└── Optional: CollapsibleMarketGrid (fallback)
```

---

## 6. API/Data Requirements

### 6.1 Required API Changes

#### Change 1: Add GDP Growth to Countries List

**File:** `apps/api-gateway/src/app/api/v1/countries/route.ts`

```typescript
// Add to select query (line ~94):
.select('iso2, iso3, name, region, subregion, capital, flag_svg_url, lat, lng, gdp_current_usd, gdp_growth_pct, population_total, signal_level, freshness_at, is_african_country')

// Add to transformation (line ~191):
...(c.gdp_growth_pct != null && { gdpGrowthPct: c.gdp_growth_pct }),
```

**Reason:** Map tooltip needs GDP growth for quick country overview on hover.

---

#### Change 2: Limit Sectors by Entitlement Tier

**File:** `apps/api-gateway/src/app/api/v1/country-lite/route.ts`

```typescript
// Replace fixed limit (line ~95):
const sectorLimit = hasEntitlement(access, 'sector_rationale') ? 5 : 1;

// Update query:
.limit(sectorLimit);
```

**Reason:** Public/Explorer should see 1 sector, Professional+ should see up to 5.

---

#### Change 3: Ensure FDI Filtering (Verify)

**File:** `apps/api-gateway/src/app/api/v1/country-lite/route.ts`

Verify existing logic:
```typescript
...(hasEntitlement(access, 'full_macro') && {
  fdiNetInflowsUsd: countryData.fdi_net_inflows_usd ?? undefined,
}),
```

**Status:** Already implemented. FDI only returned when user has `full_macro` entitlement.

---

#### Change 4: Ensure Source/Freshness Metadata

Verify API returns:
```typescript
meta: {
  previewData: true,  // Always true for now
  sources: [
    { key: 'world_bank', name: 'World Bank' },
    { key: 'imf', name: 'IMF' },
  ],
},
freshness: {
  updatedAt: countryData.freshness_at,
}
```

**Status:** Already implemented in `/api/v1/country-lite`.

---

### 6.2 Data Availability Summary

| Field | Endpoint | Public | Explorer | Professional+ |
|-------|----------|--------|----------|---------------|
| Country Identity | `/countries` | ✅ | ✅ | ✅ |
| GDP | `/countries` | ✅ | ✅ | ✅ |
| GDP Growth | `/countries` | ⚠️ Add | ⚠️ Add | ⚠️ Add |
| Population | `/countries` | ✅ | ✅ | ✅ |
| Signal Level | `/countries` | ✅ | ✅ | ✅ |
| FDI | `/country-lite` | ❌ | ❌ | ✅ |
| Sectors (count) | `/country-lite` | 1 | 1 | 5 |
| Narrative | `/country-lite` | Teaser | Teaser | Full |

---

## 7. AfDEC Component Library Reuse Assessment

### 7.1 High-Value Adaptation Candidates

| Component | Location | What to Extract | Reuse Level |
|-----------|----------|-----------------|-------------|
| **`africa-map.tsx`** | `components/sections/` | SVG map implementation, region colors, ISO mappings, tooltip logic | **High — Adapt** |
| **`REGION_COLORS`** | In `africa-map.tsx` | 5-region color system | **High — Direct Copy** |
| **`ISO3_REGION`** | In `africa-map.tsx` | 54-country ISO-to-region mapping | **High — Direct Copy** |
| **`NAME_TO_ISO3`** | In `africa-map.tsx` | GeoJSON name normalization | **High — Direct Copy** |
| **`MapTooltip`** | In `africa-map.tsx` | Floating tooltip component | **High — Adapt** |
| `CountryIntelligencePanel` | `components/panels/` | Panel layout, MetricCard pattern | **Medium — Inspire** |
| `TerminalShell` | `components/layout/` | Top bar design pattern | **Medium — Inspire** |

### 7.2 Extraction Plan

**Create:** `apps/api-gateway/src/lib/map-constants.ts`

```typescript
// Extract from africa-map.tsx
export const REGION_COLORS = {
  west:    { fill: "#1d4ed8", hover: "#3b82f6", label: "West Africa" },
  east:    { fill: "#059669", hover: "#10b981", label: "East Africa" },
  north:   { fill: "#7c3aed", hover: "#a78bfa", label: "North Africa" },
  central: { fill: "#d97706", hover: "#f59e0b", label: "Central Africa" },
  south:   { fill: "#dc2626", hover: "#f87171", label: "Southern Africa" },
};

export const ISO3_REGION: Record<string, string> = {
  // North Africa (7)
  MAR: "north", DZA: "north", TUN: "north", LBY: "north",
  EGY: "north", SDN: "north", ESH: "north",
  // ... all 54 countries
};

export const NAME_TO_ISO3: Record<string, string> = {
  // GeoJSON name normalization
  "Nigeria": "NGA",
  "United Republic of Tanzania": "TZA",
  // ... all aliases
};
```

### 7.3 Components NOT to Reuse

| Item | Reason |
|------|--------|
| `FALLBACK_PROFILES` | Souvera uses live API data, not static profiles |
| AfDEC branding | Must use Souvera language |
| "AfDEC Priority" badge | Not applicable |
| "AfDEC Intelligence" notes | Use "Souvera Intelligence" |
| "Live · Supabase" status | Must show "Curated Preview Data" |

### 7.4 Cross-App Dependency Rule

**Do NOT import directly from `apps/terminal-web` into `apps/api-gateway`.**

Instead:
- Extract patterns into Souvera-owned files
- Adapt code with Souvera branding
- Maintain separate component ownership

---

## 8. CTA Routing

### 8.1 Button Label

```
Explore [Country] Opportunities
```

Example: "Explore Nigeria Opportunities"

### 8.2 Destination

**Route to:** `/access/request-access`

**With query parameters:**
- `country`: ISO3 code (e.g., `GIN`)
- `name`: Country name (e.g., `Guinea`)
- `source`: `map-workspace`

**Example URL:**
```
/access/request-access?country=GIN&name=Guinea&source=map-workspace
```

### 8.3 Routing Logic

```typescript
const handleCtaClick = (country: Country) => {
  const params = new URLSearchParams({
    country: country.iso3,
    name: country.name,
    source: 'map-workspace',
  });
  router.push(`/access/request-access?${params.toString()}`);
};
```

**Do NOT route to nonexistent country opportunity pages.**

---

## 9. Map Interaction Model

### 9.1 Country States

| State | Visual Treatment | Cursor | Tooltip |
|-------|------------------|--------|---------|
| Available | Region color fill | pointer | Name, GDP, growth |
| Hover | Lighter region color | pointer | Full tooltip |
| Selected | Glow border + brighter fill | pointer | None (panel visible) |
| Out-of-scope | Gray muted, 40% opacity | not-allowed | "Outside Souvera coverage" |
| No Data | Semi-transparent region color | pointer | "Data coming soon" |

### 9.2 Tooltip Content

```
┌─────────────────────────────┐
│ 🇳🇬 Nigeria                 │
├─────────────────────────────┤
│ GDP        │ $334.3B        │
│ Growth     │ +3.4%          │
│ Population │ 223M           │
├─────────────────────────────┤
│ West Africa                 │
│ Click for intelligence →    │
└─────────────────────────────┘
```

### 9.3 Map Controls

- **Zoom:** Mouse wheel / pinch gesture
- **Pan:** Click and drag
- **Reset:** Button to return to default view
- **Legend:** Regional color legend (collapsible on mobile)

---

## 10. Language & Branding Rules

### 10.1 Approved Language

| Context | Approved Phrase |
|---------|-----------------|
| Data status | "Curated Preview Data" |
| Data status alt | "Source-Attributed Preview" |
| Future data | "Automated data feeds are in development" |
| Product positioning | "Institutional-grade intelligence" |
| Narrative section | "Souvera Intelligence" |

### 10.2 Prohibited Language

| ❌ Do NOT Use | Reason |
|---------------|--------|
| "Live" | Not accurate for preview data |
| "Live · Supabase" | Internal implementation detail |
| "Supabase connected" | Internal implementation detail |
| "AfDEC Priority" | AfDEC branding |
| "AfDEC Intelligence" | AfDEC branding |
| "real-time" | Not accurate |
| Unsupported accuracy claims | Trust/compliance risk |
| Unsupported data-node claims | Trust/compliance risk |

---

## 11. Backlog Items

### MAP-GOV-01: Self-Host Approved Map Geometry Assets

**Priority:** Medium  
**Phase:** Phase 4 or Future  
**Status:** Proposed

**Problem Statement:**
Current implementation uses CDN-hosted GeoJSON from GitHub (holtzy/D3-graph-gallery). This is acceptable for prototype but not for institutional demos.

**Risks:**
- CDN availability depends on third-party
- Asset updates may break map rendering
- No control over geometry accuracy

**Recommendation:**
Self-host approved map geometry assets in Souvera infrastructure:
- S3/Vercel blob storage
- Version-controlled assets
- Institutional reliability guarantee

**Acceptance Criteria:**
1. Download and audit approved GeoJSON assets
2. Host in Souvera-controlled storage
3. Update map components to use self-hosted URLs
4. Implement fallback for CDN if self-hosted fails
5. Document asset provenance and update process

---

## 12. Phased Implementation Plan

### Phase 1: Core Map Workspace on `/intelligence/map`

**Duration:** 3-4 days  
**Target:** `/intelligence/map` — cleanest controlled route

**Tasks:**
1. Create `lib/map-constants.ts` with region colors, ISO mappings
2. Build `MapWorkspaceTopNav` with Souvera branding
3. Build `AfricaMapPanel` adapting `africa-map.tsx` code
4. Build `MapTooltip` component
5. Build `RegionalLegend` component
6. Build `EntitledMetricCard` component
7. Build `EntitledSectorList` component
8. Build `CountryIntelligencePanel` with entitlement handling
9. Build `SouveraMapWorkspace` container
10. Update `/api/v1/countries` to include `gdpGrowthPct`
11. Update `/api/v1/country-lite` to limit sectors by tier
12. Replace `/intelligence/map` page content with workspace
13. QA across all access tiers

**Deliverables:**
- Full Africa map workspace on `/intelligence/map`
- Entitlement-aware panel (FDI locked, sector limiting)
- Responsive layout (desktop, tablet, mobile)

---

### Phase 2: Africa Page Integration

**Duration:** 1-2 days  
**Target:** `/intelligence/africa`

**Tasks:**
1. Create `MapWorkspaceSection` wrapper component
2. Add workspace section to Africa page (below hero, above corridors)
3. Keep existing page sections (EconomicCorridorsGrid, MarketGrid, etc.)
4. Add optional toggle between workspace and grid views
5. Test regional filtering (africa-only)
6. QA access tiers on regional page

**Deliverables:**
- Map workspace embedded in Africa regional command page
- Existing sections preserved below
- Smooth UX transition

---

### Phase 3A: Caribbean Market Shell

**Duration:** 1 day  
**Target:** `/intelligence/caribbean`

**Tasks:**
1. Build `CaribbeanMarketShell` component (premium card grid)
2. Style as professional map alternative (not broken map)
3. Include corridor view groupings
4. Include country/territory list with flags
5. Connect to same `CountryIntelligencePanel`
6. Add source/freshness layer
7. Apply same entitlement behavior
8. Integrate into Caribbean page

**Deliverables:**
- Premium Caribbean market shell workspace
- Same intelligence panel functionality
- No SVG map (intentional)

---

### Phase 3B: Caribbean SVG Map (Future)

**Duration:** 2-3 days  
**Target:** `/intelligence/caribbean`  
**Trigger:** When suitable Caribbean SVG/GeoJSON assets available

**Tasks:**
1. Acquire/create Caribbean region SVG map
2. Build `CaribbeanMapPanel` component
3. Define Caribbean-specific region colors
4. Handle island nations and territories
5. Replace `CaribbeanMarketShell` with `CaribbeanMapPanel`
6. QA Caribbean-specific interactions

**Deliverables:**
- Full Caribbean SVG map workspace
- Proper island/territory rendering

---

### Phase 4: Polish, Mobile, Accessibility, Performance

**Duration:** 1-2 days  
**Target:** All workspace implementations

**Tasks:**
1. Mobile optimization and touch interaction testing
2. Accessibility audit (keyboard navigation, screen readers)
3. Performance profiling (bundle size, render time)
4. Error boundary implementation
5. Analytics event tracking
6. Documentation update
7. Final QA sweep

**Deliverables:**
- Production-ready workspace
- Mobile-optimized experience
- WCAG AA compliance
- Performance benchmarks met

---

## 13. Files to Create/Modify

### New Files

```
apps/api-gateway/src/
├── lib/
│   └── map-constants.ts                    # Region colors, ISO mappings
├── components/
│   └── intelligence/
│       ├── SouveraMapWorkspace.tsx         # Main workspace container
│       ├── MapWorkspaceTopNav.tsx          # Workspace header
│       ├── AfricaMapPanel.tsx              # Africa SVG map
│       ├── CaribbeanMarketShell.tsx        # Caribbean placeholder
│       ├── CountryIntelligencePanel.tsx    # Right-side panel (new version)
│       ├── MapTooltip.tsx                  # Hover tooltip
│       ├── RegionalLegend.tsx              # Color legend
│       ├── EntitledMetricCard.tsx          # Metric with lock state
│       └── EntitledSectorList.tsx          # Sector list with limits
```

### Modified Files

```
apps/api-gateway/src/
├── app/
│   ├── api/v1/countries/route.ts           # Add gdpGrowthPct
│   ├── api/v1/country-lite/route.ts        # Limit sectors by tier
│   ├── intelligence/map/page.tsx           # Replace with workspace
│   ├── intelligence/africa/page.tsx        # Add workspace section
│   └── intelligence/caribbean/page.tsx     # Add shell workspace
```

---

## 14. Acceptance Criteria

### Functional

- [ ] Map displays all 54 African countries with region colors
- [ ] Caribbean displays all 20 territories in market shell
- [ ] Clicking country updates panel with intelligence
- [ ] Tooltip appears on hover with country info
- [ ] Out-of-scope countries show muted/disabled appearance
- [ ] FDI locked for Public/Explorer with "Professional+" badge
- [ ] FDI visible for Professional+
- [ ] 1 sector shown for Public/Explorer
- [ ] Up to 5 sectors shown for Professional+
- [ ] CTA routes to `/access/request-access` with query params
- [ ] Workspace top nav shows "Curated Preview Data"
- [ ] Source attribution visible

### Visual

- [ ] Souvera dark terminal aesthetic
- [ ] Fortune-5 executive quality
- [ ] No AfDEC branding visible
- [ ] No "Live" or "Supabase" text
- [ ] Responsive at all breakpoints
- [ ] Map and panel equal height on desktop
- [ ] Stacked layout on mobile

### Performance

- [ ] Map renders within 3 seconds on 4G
- [ ] Panel updates within 500ms of selection
- [ ] Bundle increase < 50KB gzipped

---

## 15. Open Questions & Recommendations

| Question | Recommendation |
|----------|----------------|
| **Caribbean map:** SVG now or later? | Use market shell now. Add SVG in Phase 3B when assets ready. |
| **Public vs Explorer:** Same or different? | Same data, different authenticated context. Explorer gets personalized prompts. |
| **CTA destination:** Where? | `/access/request-access` with query params. |
| **GeoJSON hosting:** CDN or self-host? | CDN short-term (Phase 1-3). Self-host medium-term (Phase 4 or backlog). |
| **Market grid below workspace?** | Optional. Keep as collapsible fallback if users miss it. |

---

## 16. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | April 29, 2026 | Engineering Team | Initial approved plan with reviewer refinements |

---

**Document Status:** Approved for Implementation  
**Next Steps:** Begin Phase 1 implementation on `/intelligence/map`
