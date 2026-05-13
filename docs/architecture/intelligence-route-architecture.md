# Intelligence Route Architecture

> **Owner:** Afronovation, Inc.  
> **Last Updated:** April 30, 2026  
> **Status:** 📋 Architectural Reference

---

## Overview

This document defines the route hierarchy, roles, and long-term vision for Souvera Intelligence Terminal's intelligence product routes. It establishes the canonical structure for geographic intelligence delivery and clarifies the relationship between the map workspace and regional command centers.

---

## Route Hierarchy

```
/intelligence (landing)
├── /intelligence/map (workspace - canonical map experience)
├── /intelligence/africa (command center - curated Africa dashboard)
├── /intelligence/caribbean (command center - curated Caribbean dashboard)
└── /intelligence/compare (comparison tool)
```

### Route Table

| Route | Role | Status | Primary User Action |
|-------|------|--------|---------------------|
| `/intelligence` | Executive intelligence landing page | ✅ Live | Navigate to intelligence products |
| `/intelligence/map` | Unified Souvera Intelligence Map Workspace | ✅ Phase 1 Complete | Explore countries via interactive map |
| `/intelligence/africa` | Africa Regional Command Center | 🔄 Phase 2 | View Africa regional overview and metrics |
| `/intelligence/caribbean` | Caribbean Regional Command Center | 📋 Future | View Caribbean regional overview and metrics |
| `/intelligence/compare` | Side-by-side country comparison tool | ✅ Live | Compare 2-4 countries side-by-side |

---

## Route Roles and Purposes

### `/intelligence` - Executive Landing Page

**Purpose:**
- Entry point for all intelligence products
- Navigate to map, regional pages, or comparison tool
- Overview of available intelligence capabilities

**Content:**
- Hero section with product overview
- Navigation cards to intelligence products
- Value proposition for each tier (Explorer, Professional, Business)
- CTA: "Request Access"

**Design Pattern:** Marketing/navigation page

---

### `/intelligence/map` - Unified Map Workspace

**Purpose:**
- **Canonical interactive map experience** for Souvera Intelligence
- Primary workspace for geographic exploration and country selection
- Supports multiple region views (Africa, Caribbean, All)

**Content:**
- Interactive map (react-simple-maps + TopoJSON)
- Country intelligence panel (right side)
  - Default state: Top 10 Economies
  - Selected state: Country profile
- Workspace-specific top nav
- Regional legend
- Map tooltip on hover

**Key Characteristics:**
- **Product workspace** (not marketing page)
- **Interactive and exploratory** (not static dashboard)
- **Region-agnostic** (can show Africa, Caribbean, or All)
- **Entitlement-aware** (FDI, sectors, signals based on user tier)

**Design Pattern:** Executive terminal workspace

**Technical Architecture:**
- Component: `<SouveraMapWorkspace region="africa" />`
- Region prop: `'africa' | 'caribbean' | 'all'`
- Data source: `/api/v1/countries?region={region}`
- Country detail: `/api/v1/country-lite?iso3={iso3}`

---

### `/intelligence/africa` - Africa Regional Command Center

**Purpose:**
- Curated Africa-focused intelligence dashboard
- Regional overview, summaries, and narratives
- Quick-access metrics and trends

**Content (Planned):**
- Regional Pulse cards (GDP, trade, investment)
- Top markets ranked by various criteria
- Regional trends and signals
- Sector highlights
- May **embed** or **link to** map workspace for exploration
- CTA: "Explore on Map" → `/intelligence/map?region=africa`

**Key Characteristics:**
- **Curated dashboard** (not exploratory tool)
- **Africa-specific** (fixed region)
- **Summary and narrative focus** (charts, cards, text)
- **May embed map** but does not replace `/intelligence/map`

**Design Pattern:** Regional command center / dashboard

---

### `/intelligence/caribbean` - Caribbean Regional Command Center

**Purpose:**
- Curated Caribbean-focused intelligence dashboard
- Regional overview, summaries, and narratives
- Quick-access metrics and trends

**Content (Planned):**
- Similar to Africa command center structure
- Caribbean-specific regional pulse
- Top markets in Caribbean
- May **embed** or **link to** map workspace
- CTA: "Explore on Map" → `/intelligence/map?region=caribbean`

**Key Characteristics:**
- **Curated dashboard** (not exploratory tool)
- **Caribbean-specific** (fixed region)
- **Summary and narrative focus**
- **May embed map** but does not replace `/intelligence/map`

**Design Pattern:** Regional command center / dashboard

---

### `/intelligence/compare` - Country Comparison Tool

**Purpose:**
- Side-by-side comparison of 2-4 countries
- Direct metric comparison across multiple dimensions
- Support decision-making and market prioritization

**Content:**
- Country selector (dropdown or search)
- Comparison table/grid with metrics
- Visual comparison charts
- Export to PDF/CSV (Professional+ only)

**Design Pattern:** Comparison/analysis tool

---

## Long-Term Vision for `/intelligence/map`

### Phase Roadmap

#### Phase 1: Africa Map Workspace ✅
- Single region: Africa only
- Fixed TopoJSON geometry
- Top 10 Economies default panel
- Country intelligence panel
- Entitlement-aware FDI and sectors
- Status: **Complete**

#### Phase 2: Region Filter UI 🔄
- Add region filter toggle: **Africa | Caribbean | All**
- Support query param: `?region=africa`, `?region=caribbean`, `?region=all`
- Update workspace label dynamically
- Maintain same panel structure across regions
- Status: **Planned**

#### Phase 3: Caribbean Map Geometry 📋
- Integrate Caribbean TopoJSON
- Support region-specific map projection
- Caribbean-specific regional colors
- Dual-map rendering (Africa or Caribbean)
- Status: **Future**

#### Phase 4: All Regions View 📋
- Combined Africa + Caribbean view
- Single map showing both regions
- Filter/highlight by region
- "All Regions" = Africa + Caribbean only (approved Souvera market scope)
- Status: **Future**

### Technical Evolution

**Current (Phase 1):**
```tsx
<SouveraMapWorkspace region="africa" workspaceLabel="Africa Intelligence Terminal" />
```

**Future (Phase 2+):**
```tsx
<SouveraMapWorkspace 
  region={selectedRegion} 
  workspaceLabel={getWorkspaceLabel(selectedRegion)}
  onRegionChange={handleRegionChange}
/>
```

**Supported Regions:**
- `'africa'` - Africa map (54 countries)
- `'caribbean'` - Caribbean map (approved ISO3 list)
- `'all'` - Combined Africa + Caribbean

---

## Key Architectural Principles

### 1. Map Workspace is Permanent

**Principle:** `/intelligence/map` **remains** after regional pages are enhanced.

**Rationale:**
- Map workspace is the **canonical interactive exploration tool**
- Regional pages serve a **different purpose** (curated dashboards)
- Users need both: exploration (map) and overview (regional pages)

### 2. Regional Pages Do Not Replace Map

**Principle:** `/intelligence/africa` and `/intelligence/caribbean` may **embed or link to** the map workspace but do not replace it.

**Rationale:**
- Regional pages are **curated command centers** with charts, summaries, narratives
- Map workspace is **exploratory and interactive**
- Regional pages should **drive users to the map** for deeper exploration

**Implementation Patterns:**

**Option A: Link to Map**
```tsx
<Link href="/intelligence/map?region=africa">
  Explore on Interactive Map →
</Link>
```

**Option B: Embed Map (Future)**
```tsx
<section>
  <h2>Explore Africa Markets</h2>
  <SouveraMapWorkspace region="africa" compact embedded />
</section>
```

### 3. "All Regions" Means Africa + Caribbean Only

**Principle:** "All Regions" is defined as **Africa + Caribbean** (approved Souvera market scope).

**Rationale:**
- Souvera's market scope is explicitly **Africa and approved Caribbean markets**
- "Global" or "Worldwide" is not supported and would violate market governance
- Any "All" or "Combined" view must be scoped to Africa + Caribbean

**UI Language:**
- ✅ "All Regions" (Africa + Caribbean)
- ✅ "Africa & Caribbean"
- ✅ "Souvera Markets"
- ❌ "Global"
- ❌ "Worldwide"
- ❌ "All Countries"

### 4. Route Specialization

**Principle:** Each route serves a specialized purpose with minimal overlap.

| Route | Purpose | Content Type | Interaction Model |
|-------|---------|--------------|-------------------|
| `/intelligence/map` | Exploration | Interactive map + panels | Click, hover, select |
| `/intelligence/africa` | Overview | Charts, cards, text | Scroll, read, click CTA |
| `/intelligence/caribbean` | Overview | Charts, cards, text | Scroll, read, click CTA |
| `/intelligence/compare` | Analysis | Table, grid, charts | Select, compare, export |

---

## Route Relationships

### Navigation Flow

**Primary Flow:**
```
/intelligence (landing)
  → Choose product:
    → /intelligence/map (explore via map)
    → /intelligence/africa (view Africa overview)
    → /intelligence/caribbean (view Caribbean overview)
    → /intelligence/compare (compare countries)
```

**Secondary Flow (from regional page to map):**
```
/intelligence/africa (overview)
  → CTA: "Explore on Map"
    → /intelligence/map?region=africa
      → Select country
        → View country intelligence panel
          → CTA: "Request Access" or "Explore {Country} Opportunities"
```

### Cross-Linking Strategy

**From Landing to Products:**
- `/intelligence` → Cards linking to each product route
- Clear value proposition and use case for each

**From Regional Pages to Map:**
- `/intelligence/africa` → "Explore on Interactive Map" CTA
- `/intelligence/caribbean` → "Explore on Interactive Map" CTA
- Pass `?region=` query param to pre-filter map

**From Map to Regional Pages:**
- `/intelligence/map` → Top nav breadcrumb or link to regional overview
- "View Africa Regional Overview" link in footer metadata area

**From Map to Comparison:**
- `/intelligence/map` → "Compare Countries" CTA (when 2+ countries are favorited/saved)
- Future: Multi-select on map → "Compare Selected"

---

## URL Patterns and Query Params

### Current Routes

| Route | Query Params | Example |
|-------|--------------|---------|
| `/intelligence` | None | `/intelligence` |
| `/intelligence/map` | None (Phase 1) | `/intelligence/map` |
| `/intelligence/africa` | None | `/intelligence/africa` |
| `/intelligence/compare` | `countries` (future) | `/intelligence/compare?countries=NGA,KEN` |

### Future Routes (Phase 2+)

| Route | Query Params | Example | Behavior |
|-------|--------------|---------|----------|
| `/intelligence/map` | `region` | `/intelligence/map?region=africa` | Filter map to Africa |
| `/intelligence/map` | `region` | `/intelligence/map?region=caribbean` | Filter map to Caribbean |
| `/intelligence/map` | `region` | `/intelligence/map?region=all` | Show Africa + Caribbean |
| `/intelligence/map` | `selected` | `/intelligence/map?selected=NGA` | Pre-select Nigeria |
| `/intelligence/map` | `region`, `selected` | `/intelligence/map?region=africa&selected=KEN` | Africa view, pre-select Kenya |

---

## Content Ownership

### Who Manages What

| Route | Content Owner | Update Frequency | Data Source |
|-------|---------------|------------------|-------------|
| `/intelligence` | Marketing/Product | Monthly | Static (MDX/hardcoded) |
| `/intelligence/map` | Engineering | Real-time (via API) | `/api/v1/countries`, `/api/v1/country-lite` |
| `/intelligence/africa` | Regional Analyst | Weekly | Curated content + API data |
| `/intelligence/caribbean` | Regional Analyst | Weekly | Curated content + API data |
| `/intelligence/compare` | Engineering | Real-time (via API) | `/api/v1/country-lite` |

### Data Sources

| Route | Primary Data Source | Fallback |
|-------|---------------------|----------|
| `/intelligence/map` | `/api/v1/countries?region={region}` | Cached seed data |
| `/intelligence/africa` | Mix of curated content + `/api/v1/countries?region=africa` | Static seed data |
| `/intelligence/caribbean` | Mix of curated content + `/api/v1/countries?region=caribbean` | Static seed data |
| `/intelligence/compare` | `/api/v1/country-lite?iso3={iso3}` | Cached country profiles |

---

## Future Enhancements

### Phase 2+ Candidate Features

**Map Workspace:**
- Region filter toggle UI
- Query param support (`?region=`, `?selected=`)
- Dynamic workspace label
- Favorites/saved countries
- Recent countries history
- Search/filter countries by name

**Regional Pages:**
- Embed map workspace in collapsed/compact mode
- Regional comparison tables
- Sector deep-dive sections
- News/signals feed
- Economic calendar

**Comparison Tool:**
- Multi-country comparison (up to 4)
- Export to PDF/CSV
- Save comparison sets
- Share comparison URL

---

## Mobile Considerations

### Responsive Route Behavior

| Route | Mobile (<768px) Behavior |
|-------|--------------------------|
| `/intelligence` | Stack cards vertically, full-width CTAs |
| `/intelligence/map` | Stack map above panel, map first, panel below |
| `/intelligence/africa` | Stack all sections vertically, cards full-width |
| `/intelligence/caribbean` | Stack all sections vertically, cards full-width |
| `/intelligence/compare` | Horizontal scroll table or stacked cards |

### Mobile-Specific Features

- `/intelligence/map` on mobile:
  - Touch-friendly map interactions
  - Bottom sheet for country panel (future)
  - Sticky CTA button
  - Simplified legend

---

## SEO and Metadata

### Route Titles

| Route | Page Title | Meta Description |
|-------|------------|------------------|
| `/intelligence` | Intelligence Terminal \| Souvera | Executive-grade intelligence for African and Caribbean markets |
| `/intelligence/map` | Intelligence Map \| Africa Intelligence Terminal \| Souvera | Interactive Africa intelligence map with country profiles and market intelligence |
| `/intelligence/africa` | Africa Regional Intelligence \| Souvera | Comprehensive Africa regional overview with economic indicators and market trends |
| `/intelligence/caribbean` | Caribbean Regional Intelligence \| Souvera | Comprehensive Caribbean regional overview with economic indicators and market trends |
| `/intelligence/compare` | Compare Countries \| Intelligence Terminal \| Souvera | Side-by-side comparison of African and Caribbean markets |

### Canonical URLs

| Route | Canonical URL |
|-------|---------------|
| `/intelligence` | `https://souvera.vercel.app/intelligence` |
| `/intelligence/map` | `https://souvera.vercel.app/intelligence/map` |
| `/intelligence/africa` | `https://souvera.vercel.app/intelligence/africa` |
| `/intelligence/caribbean` | `https://souvera.vercel.app/intelligence/caribbean` |
| `/intelligence/compare` | `https://souvera.vercel.app/intelligence/compare` |

---

## Conclusion

The intelligence route architecture establishes a clear hierarchy with specialized roles:

- **`/intelligence`** - Landing and navigation hub
- **`/intelligence/map`** - Interactive exploration workspace (canonical map experience)
- **`/intelligence/africa`** - Africa curated command center
- **`/intelligence/caribbean`** - Caribbean curated command center
- **`/intelligence/compare`** - Country comparison tool

**Key Takeaways:**
1. Map workspace is **permanent** and remains after regional pages are enhanced
2. Regional pages are **curated dashboards** that may embed/link to map
3. "All Regions" means **Africa + Caribbean only**
4. Each route serves a **specialized purpose** with minimal overlap

---

**Last Reviewed:** April 30, 2026  
**Next Review:** After Phase 2 implementation  
**Status:** ✅ Approved
