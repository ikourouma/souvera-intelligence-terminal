# Phase 3 Step 4 — CaribbeanMarketShell Implementation Plan

**Document ID:** PHASE3-STEP4-CARIBBEAN-SHELL-PLAN  
**Created:** 2026-05-03  
**Status:** APPROVED FOR IMPLEMENTATION  
**Phase:** Phase 3 — Regional Expansion  
**Step:** Step 4A — CaribbeanMarketShell Component

---

## 1. Executive Summary

Phase 3 Step 4 will implement the **CaribbeanMarketShell** component to replace the interim `CaribbeanPlaceholder` with a premium, executive-grade Caribbean regional intelligence experience on `/intelligence/map?region=caribbean`.

This step will:
- Create a new standalone `CaribbeanMarketShell` component under `components/intelligence`
- Display a list/grid of 20 approved Caribbean markets and territories
- Reuse the existing `CountryIntelligencePanel` for selected country intelligence
- Support deep-linking via `?region=caribbean&selected=JAM`
- Provide "Top Caribbean Economies" as the default panel
- Include simple country/territory search functionality
- Maintain "Curated Preview Data" language compliance

**Scope Exclusions for Step 4A:**
- Caribbean SVG map (deferred to future phase)
- `/intelligence/caribbean` page update (deferred to Step 4B)
- "All Regions" view enhancement (deferred to Step 5)
- Source ingestion, FDI ingestion, sector seeding
- Auth/RLS/entitlement changes
- Database schema changes

---

## 2. Current State Analysis

### 2.1. Existing Behavior

**`/intelligence/map?region=caribbean`:**
- Currently displays `CaribbeanPlaceholder` (premium "coming soon" UI)
- Shows headline "Caribbean Intelligence"
- Displays "Premium market shell for 20 Caribbean markets and territories is being finalized"
- Provides CTAs: "Switch to Africa Intelligence" and "Request Access"
- Shows "Curated Preview Data" status

**`/intelligence/map?region=caribbean&selected=JAM`:**
- Currently ignores `selected=JAM` parameter
- Shows the same placeholder as above
- Does not open Jamaica or any country panel

**`/intelligence/map?region=all`:**
- Shows Africa map workspace
- Displays a notice: "Caribbean-coming-soon"
- Will remain unchanged in Step 4A

**`/intelligence/caribbean`:**
- Uses legacy `RegionalMarketGrid` component
- Will remain unchanged in Step 4A (update deferred to Step 4B)

### 2.2. Phase 3 Progress

- **Phase 3 Step 1 (Region Prop Refinement):** ✅ Complete
- **Phase 3 Step 2 (Region Filter UI):** ✅ Complete
- **Phase 3 Step 3 (Query Parameter Support):** ✅ Complete
- **Phase 3 Step 4 (CaribbeanMarketShell):** 🔄 Planning Complete, Ready for Implementation

### 2.3. Available Infrastructure

**API Endpoints:**
- `/api/v1/countries?region=caribbean` — Returns list of 20 approved Caribbean ISO3 codes
- `/api/v1/country-lite?iso3=JAM` — Returns detailed country intelligence with entitlement-aware FDI and sectors

**Utility Functions (`market-coverage.ts`):**
- `APPROVED_CARIBBEAN_ISO3` — Array of 20 Caribbean ISO3 codes
- `isApprovedCaribbeanMarket(iso3)` — Validates Caribbean ISO3
- `getRegionLabel('caribbean')` — Returns "Caribbean"
- `normalizeRegionFilter(region)` — Normalizes region string

**Reusable Components:**
- `CountryIntelligencePanel` — Displays selected country intelligence or "Top 10 Economies" default
- `EntitledMetricCard` — Displays metrics with locked/data pending states
- `EntitledSectorList` — Displays sectors with entitlement-aware visibility
- `MapWorkspaceTopNav` — Displays workspace label, data status, region filter

**Query Parameter Integration:**
- `SouveraMapWorkspaceWithUrl` wrapper handles URL state synchronization
- Validates `?region=` and `?selected=` parameters
- Updates URL without full page reload
- Supports browser back/forward navigation

---

## 3. Recommended Component Architecture

### 3.1. Decision: New Standalone Component

**Recommendation:** Create a new standalone component `CaribbeanMarketShell.tsx` under `apps/api-gateway/src/components/intelligence/`.

**Rationale:**
- `RegionalMarketGrid` is explicitly deprecated and should not be refactored
- Africa workspace uses `AfricaMapPanel` with SVG map (not applicable to Caribbean yet)
- A clean, purpose-built component ensures:
  - No legacy technical debt
  - Clear separation of concerns
  - Easier maintenance and future enhancement
  - Consistent with Phase 3 architecture patterns

### 3.2. Component Hierarchy

```
SouveraMapWorkspace (controlled component)
├── MapWorkspaceTopNav (region filter, data status)
├── (Conditional rendering based on currentRegion)
    ├── currentRegion === 'africa' → AfricaMapPanel
    ├── currentRegion === 'caribbean' → CaribbeanMarketShell (NEW)
    └── currentRegion === 'all' → Africa + Caribbean notice (unchanged in Step 4A)

CaribbeanMarketShell (new component)
├── Search/Filter Bar (simple country search)
├── Market List/Grid (20 Caribbean markets)
└── CountryIntelligencePanel (reused, right side or below on mobile)
```

### 3.3. Component Responsibilities

**`CaribbeanMarketShell.tsx`:**
- Fetch Caribbean country list via `/api/v1/countries?region=caribbean`
- Render market cards/grid for 20 approved Caribbean markets
- Provide simple search functionality (filter by country name)
- Handle country selection (click card → select ISO3)
- Render `CountryIntelligencePanel` for selected country
- Provide "Top Caribbean Economies" as default panel when no country selected
- Emit `onCountrySelect(iso3)` callback to parent for URL updates

**`CountryIntelligencePanel.tsx` (reused, no changes needed):**
- Fetch selected country via `/api/v1/country-lite?iso3={ISO3}`
- Display entitlement-aware metrics (FDI, GDP, inflation, etc.)
- Display entitlement-aware sectors
- Handle missing data gracefully ("Data pending")
- Provide "Top 10 Economies" or "Top Caribbean Economies" default

---

## 4. Data Flow

### 4.1. Market List Fetching

**Endpoint:** `/api/v1/countries?region=caribbean`

**Request:**
```typescript
GET /api/v1/countries?region=caribbean
```

**Response:**
```json
{
  "countries": [
    { "iso3": "JAM", "name": "Jamaica", "region": "Caribbean", ... },
    { "iso3": "TTO", "name": "Trinidad and Tobago", "region": "Caribbean", ... },
    { "iso3": "BHS", "name": "Bahamas", "region": "Caribbean", ... },
    // ... 17 more approved Caribbean markets
  ]
}
```

**Behavior:**
- API already supports `region=caribbean` filter
- Returns 20 approved Caribbean ISO3 codes from `APPROVED_CARIBBEAN_ISO3`
- Applies user entitlement (all Caribbean markets visible to all tiers)
- Returns empty array if no data (graceful degradation)

### 4.2. Selected Country Intelligence

**Endpoint:** `/api/v1/country-lite?iso3=JAM`

**Invoked by:** `CountryIntelligencePanel` (reused component)

**Response:**
```json
{
  "country": {
    "iso3": "JAM",
    "name": "Jamaica",
    "region": "Caribbean",
    "gdp": 15721000000,
    "gdp_per_capita": 5582,
    "inflation": 5.2,
    "fdi": null, // or numeric value when ingested
    "sectors": [] // or array when seeded
  },
  "access": {
    "tier": "Professional",
    "full_macro": true,
    "sector_teasers": true,
    "sector_rationale": true
  }
}
```

**Behavior:**
- `CountryIntelligencePanel` fetches this data internally
- No changes needed to panel component
- FDI displays "Data pending" if unlocked but missing (UX-DATA-01)
- Sectors hidden if empty array (DATA-SEED-01 backlog)

### 4.3. Default Panel Data

**Endpoint:** `/api/v1/countries?region=caribbean&scope=mandate` (or client-side sorting)

**Behavior:**
- Fetch all Caribbean countries
- Sort by GDP descending (if GDP data exists)
- Take top 5-10 for "Top Caribbean Economies" default panel
- Display in `CountryIntelligencePanel` when `selectedIso3` is `null`

---

## 5. Desktop Layout

### 5.1. Two-Panel Design

**Layout:** Horizontal split (left: market list, right: panel)

```
┌────────────────────────────────────────────────────────────────┐
│ MapWorkspaceTopNav (Caribbean | Curated Preview Data | ...)   │
├──────────────────────┬─────────────────────────────────────────┤
│ Search/Filter        │                                         │
│ ┌──────────────────┐ │                                         │
│ │ 🔍 Search...     │ │                                         │
│ └──────────────────┘ │                                         │
│                      │                                         │
│ Market Cards         │   CountryIntelligencePanel             │
│ ┌────────┐┌────────┐│   (Selected country or default)        │
│ │Jamaica ││Trinidad││                                         │
│ │🇯🇲     ││🇹🇹     ││   - Headline metrics                   │
│ │GDP ... ││GDP ... ││   - FDI (Data pending if missing)      │
│ └────────┘└────────┘│   - Sectors (hidden if empty)          │
│ ┌────────┐┌────────┐│   - Key indicators                     │
│ │Bahamas ││Barbados││                                         │
│ │🇧🇸     ││🇧🇧     ││                                         │
│ └────────┘└────────┘│                                         │
│ ... (20 total)       │                                         │
│                      │                                         │
│ [60% width]          │ [40% width]                            │
└──────────────────────┴─────────────────────────────────────────┘
```

### 5.2. Layout Specifications

**Left Panel (Market List):**
- Width: 60% on desktop (lg:), 100% on mobile
- Max width: `900px`
- Padding: `p-6`
- Background: `bg-zinc-950`
- Border: `border-r border-zinc-800` (desktop only)

**Right Panel (CountryIntelligencePanel):**
- Width: 40% on desktop (lg:), 100% on mobile (stacked below)
- Fixed or sticky positioning on desktop (optional)
- Padding: `p-6`
- Background: `bg-zinc-950`

**Market Cards:**
- Grid: 2 columns on desktop (`grid-cols-2`), 1 column on mobile
- Gap: `gap-4`
- Card dimensions: Auto height, responsive width
- Card style: `bg-zinc-900 border border-zinc-800 rounded-sm hover:border-zinc-700`
- Click behavior: Select country, update panel, update URL `?selected=JAM`

---

## 6. Mobile Layout

### 6.1. Stacked Design (Mobile-First)

**Layout:** Vertical stack (search → cards → panel)

```
┌────────────────────────────────┐
│ MapWorkspaceTopNav             │
├────────────────────────────────┤
│ Search/Filter                  │
│ ┌────────────────────────────┐ │
│ │ 🔍 Search markets...       │ │
│ └────────────────────────────┘ │
├────────────────────────────────┤
│ Market Card (Jamaica)          │
│ ┌────────────────────────────┐ │
│ │ 🇯🇲 Jamaica               │ │
│ │ GDP: $15.7B                │ │
│ │ GDP/capita: $5,582         │ │
│ └────────────────────────────┘ │
│ Market Card (Trinidad & Tobago)│
│ ┌────────────────────────────┐ │
│ │ 🇹🇹 Trinidad and Tobago   │ │
│ │ GDP: $24.1B                │ │
│ └────────────────────────────┘ │
│ ... (scrollable)               │
├────────────────────────────────┤
│ CountryIntelligencePanel       │
│ (Selected or Default)          │
│                                │
│ - Headline metrics             │
│ - FDI (if unlocked)            │
│ - Sectors (if exist)           │
│ - Indicators                   │
└────────────────────────────────┘
```

### 6.2. Mobile Specifications

**Breakpoints:**
- Mobile: `< 640px` (sm:)
- Tablet: `640px - 1024px` (sm: to lg:)
- Desktop: `>= 1024px` (lg:)

**Market Cards (Mobile):**
- Full width: `w-full`
- Single column: no grid
- Padding: `p-4`
- Font sizes: Slightly smaller for readability (`text-sm`, `text-xs`)

**Panel (Mobile):**
- Stacked below market list
- Full width: `w-full`
- Padding: `p-4`
- Scrollable if content overflows

**Search Bar (Mobile):**
- Full width: `w-full`
- Padding: `p-4`
- Icon size: `w-4 h-4`

**No Horizontal Overflow:**
- All containers: `overflow-x-hidden`
- Cards: `max-w-full`
- Text: `truncate` where appropriate

---

## 7. Country Selection Behavior

### 7.1. User Interactions

**Clicking a Market Card:**
1. User clicks "Jamaica" card
2. `CaribbeanMarketShell` calls `onCountrySelect('JAM')`
3. Parent (`SouveraMapWorkspace`) receives callback
4. Parent calls `onCountrySelect('JAM')` callback to `SouveraMapWorkspaceWithUrl`
5. `SouveraMapWorkspaceWithUrl` updates URL to `?region=caribbean&selected=JAM`
6. `CountryIntelligencePanel` receives `selectedIso3='JAM'` prop
7. Panel fetches `/api/v1/country-lite?iso3=JAM`
8. Panel displays Jamaica intelligence

**Closing the Panel:**
1. User clicks "✕" close button in `CountryIntelligencePanel`
2. Panel calls `onClose()` callback
3. `CaribbeanMarketShell` receives `onClose` and calls `onCountrySelect(null)`
4. Parent updates URL to `?region=caribbean` (removes `selected`)
5. Panel reverts to "Top Caribbean Economies" default

**Changing Regions:**
1. User selects "Africa" from region filter
2. `MapWorkspaceTopNav` calls `onRegionChange('africa')`
3. `SouveraMapWorkspace` receives callback and propagates to parent
4. Parent updates URL to `?region=africa` (removes `selected=JAM`)
5. `SouveraMapWorkspace` conditionally renders `AfricaMapPanel` instead of `CaribbeanMarketShell`

### 7.2. Invalid Selected Behavior

**Scenario:** `/intelligence/map?region=caribbean&selected=NGA` (Nigeria is African, not Caribbean)

**Behavior:**
1. `SouveraMapWorkspaceWithUrl` reads `selected=NGA`
2. `validateSelectedForRegion('NGA', 'caribbean')` returns `null` (NGA not in `APPROVED_CARIBBEAN_ISO3`)
3. `initialSelected` prop passed to `SouveraMapWorkspace` is `null`
4. `CaribbeanMarketShell` receives `selectedIso3={null}`
5. `CountryIntelligencePanel` displays "Top Caribbean Economies" default
6. No error message shown to user
7. URL remains `?region=caribbean&selected=NGA` (graceful ignore)

**Optional Enhancement (Future):**
- Detect invalid `selected` and remove it from URL via `router.replace()`
- For Step 4A: Graceful ignore is sufficient

---

## 8. Query Param Integration

### 8.1. Supported URL Patterns

| URL Pattern | Expected Behavior |
|-------------|-------------------|
| `/intelligence/map` | Default: `region=africa`, no selected country |
| `/intelligence/map?region=caribbean` | Show `CaribbeanMarketShell`, "Top Caribbean Economies" default panel |
| `/intelligence/map?region=caribbean&selected=JAM` | Show `CaribbeanMarketShell`, Jamaica selected and displayed in panel |
| `/intelligence/map?region=caribbean&selected=TTO` | Show `CaribbeanMarketShell`, Trinidad & Tobago selected |
| `/intelligence/map?region=caribbean&selected=NGA` | Show `CaribbeanMarketShell`, "Top Caribbean Economies" default (NGA invalid, gracefully ignored) |
| `/intelligence/map?region=all` | Show Africa map + Caribbean notice (unchanged in Step 4A) |
| `/intelligence/map?region=all&selected=JAM` | Show Africa map + Caribbean notice (Step 4A: Jamaica ignored; Step 5: should show Caribbean shell or combined view) |

### 8.2. URL State Updates

**User Action:** Click Jamaica card

**Before:** `/intelligence/map?region=caribbean`  
**After:** `/intelligence/map?region=caribbean&selected=JAM`

**Mechanism:**
1. `CaribbeanMarketShell` calls `onCountrySelect('JAM')`
2. Callback propagates to `SouveraMapWorkspaceWithUrl`
3. `updateUrl('caribbean', 'JAM')` called
4. `router.replace()` updates URL without full reload
5. React re-renders with new `selectedIso3` prop

**User Action:** Change region from Caribbean to Africa

**Before:** `/intelligence/map?region=caribbean&selected=JAM`  
**After:** `/intelligence/map?region=africa`

**Mechanism:**
1. `MapWorkspaceTopNav` calls `onRegionChange('africa')`
2. Callback propagates to `SouveraMapWorkspaceWithUrl`
3. `updateUrl('africa', null)` called (selected reset to `null`)
4. `router.replace()` updates URL
5. React re-renders `AfricaMapPanel` instead of `CaribbeanMarketShell`

### 8.3. Browser Navigation Support

**Browser Back:**
1. User navigates: `/intelligence/map` → `?region=caribbean` → `?region=caribbean&selected=JAM`
2. User clicks browser back button
3. URL changes to `?region=caribbean` (no selected)
4. `useSearchParams` hook detects change
5. `SouveraMapWorkspaceWithUrl` re-initializes with `initialSelected=null`
6. `CountryIntelligencePanel` reverts to "Top Caribbean Economies" default

**Browser Forward:**
1. User clicks browser forward button
2. URL changes to `?region=caribbean&selected=JAM`
3. `useSearchParams` hook detects change
4. `SouveraMapWorkspaceWithUrl` re-initializes with `initialSelected='JAM'`
5. `CountryIntelligencePanel` fetches and displays Jamaica

---

## 9. Default Panel Strategy

### 9.1. Recommendation: "Top Caribbean Economies"

**When Displayed:**
- User navigates to `/intelligence/map?region=caribbean` (no `selected` param)
- User closes a selected country panel
- User switches to Caribbean from another region

**Data Source:**
- Fetch all Caribbean countries via `/api/v1/countries?region=caribbean`
- Sort by GDP descending (if GDP data exists)
- Take top 5-7 markets

**Panel Content:**

**Headline:** "Top Caribbean Economies"

**Sub-headline:** "Regional economic leaders by GDP (2024)"

**Market Cards (Compact):**
```
┌─────────────────────────────────┐
│ 🇹🇹 Trinidad and Tobago         │
│ GDP: $24.1B                     │
│ GDP/capita: $17,200             │
│ → View full intelligence        │
├─────────────────────────────────┤
│ 🇯🇲 Jamaica                     │
│ GDP: $15.7B                     │
│ GDP/capita: $5,582              │
│ → View full intelligence        │
├─────────────────────────────────┤
│ 🇧🇸 Bahamas                     │
│ GDP: $14.3B                     │
│ GDP/capita: $36,200             │
│ → View full intelligence        │
├─────────────────────────────────┤
│ ... (5-7 total)                 │
└─────────────────────────────────┘
```

**Clicking "→ View full intelligence":**
- Selects that country
- Updates URL to `?region=caribbean&selected=JAM`
- Loads full `CountryIntelligencePanel` for Jamaica

### 9.2. Fallback: Caribbean Regional Overview

**If GDP data is insufficient for ranking:**

**Headline:** "Caribbean Intelligence"

**Content:**
- "20 markets and territories"
- "Covering CARICOM, OECS, and strategic gateways"
- "Select a market to view detailed intelligence"
- Brief description of Souvera's Caribbean coverage

**CTA:**
- "Explore markets below"
- No specific country links in this fallback

### 9.3. Implementation in `CountryIntelligencePanel`

**Option 1: Extend existing "Top 10 Economies" logic**

Modify `CountryIntelligencePanel.tsx`:
```typescript
// Existing logic for "Top 10 Economies"
if (!selectedIso3) {
  // Determine region context from parent prop or URL
  const regionContext = props.region || 'africa'; // default to africa
  
  if (regionContext === 'caribbean') {
    // Fetch and sort Caribbean countries
    const caribbeanCountries = await fetchTopCaribbeanEconomies();
    return <TopCaribbeanEconomiesPanel countries={caribbeanCountries} />;
  } else {
    // Existing "Top 10 Economies" logic
    return <TopEconomiesPanel countries={topEconomies} />;
  }
}
```

**Option 2: Pass default panel content from parent**

`CaribbeanMarketShell` fetches top Caribbean economies, passes to `CountryIntelligencePanel`:
```typescript
<CountryIntelligencePanel
  selectedIso3={selectedIso3}
  defaultContent={<TopCaribbeanEconomies countries={topCaribbean} />}
  onClose={handleClosePanel}
/>
```

**Recommended:** Option 1 (minimal changes, reuses existing panel logic)

---

## 10. Search / Filter Plan

### 10.1. Simple Country Search

**Functionality:**
- Text input field above market cards
- Filters Caribbean countries by name (case-insensitive)
- Real-time filtering (updates as user types)
- No advanced filters (region sub-groups, GDP range, etc.)

**UI Design:**

```typescript
<div className="mb-6">
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
    <input
      type="text"
      placeholder="Search Caribbean markets..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-sm text-white placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
    />
  </div>
</div>
```

### 10.2. Search Logic

**State:**
```typescript
const [searchQuery, setSearchQuery] = useState<string>('');
const [countries, setCountries] = useState<Country[]>([]);
```

**Filtering:**
```typescript
const filteredCountries = useMemo(() => {
  if (!searchQuery.trim()) return countries;
  const query = searchQuery.toLowerCase();
  return countries.filter(c => 
    c.name.toLowerCase().includes(query) ||
    c.iso3.toLowerCase().includes(query)
  );
}, [countries, searchQuery]);
```

**Rendering:**
```typescript
{filteredCountries.length === 0 && searchQuery && (
  <div className="text-center py-12 text-zinc-500">
    No markets found matching "{searchQuery}"
  </div>
)}

{filteredCountries.map(country => (
  <MarketCard key={country.iso3} country={country} onClick={handleSelect} />
))}
```

### 10.3. No Advanced Filters in Step 4A

**Excluded (Future Enhancement):**
- Region sub-group filter (CARICOM, OECS, Dutch Caribbean, etc.)
- GDP range slider
- Sorting options (GDP, population, alphabetical)
- Multi-select

**Rationale:**
- Simple search meets MVP requirements
- Reduces Step 4A complexity
- Can iterate based on user feedback

---

## 11. /intelligence/caribbean Integration

### 11.1. Current State

**Route:** `apps/api-gateway/src/app/intelligence/caribbean/page.tsx`

**Current Implementation:**
```typescript
import { RegionalMarketGrid } from '@/components/regional/RegionalMarketGrid';

export default function CaribbeanPage() {
  return (
    <main>
      <SouveraMegaNav />
      {/* Hero Section */}
      <RegionalMarketGrid region="caribbean" />
      <SouveraFooter />
    </main>
  );
}
```

**Issue:**
- Uses deprecated `RegionalMarketGrid` component
- Not aligned with new Phase 3 architecture

### 11.2. Recommendation: Defer to Step 4B

**Step 4A Scope:**
- Implement `CaribbeanMarketShell` for `/intelligence/map?region=caribbean`
- Do NOT update `/intelligence/caribbean` page yet

**Step 4B Scope (Future):**
- Replace `RegionalMarketGrid` with embedded `CaribbeanMarketShell` or `SouveraMapWorkspace`
- Apply similar pattern as `/intelligence/africa` (which embeds `SouveraMapWorkspace`)
- Potentially rename route to `/intelligence/map/caribbean` for consistency

**Rationale:**
- Reduces risk and complexity for Step 4A
- Allows Step 4A to be tested and QA'd in isolation
- `/intelligence/caribbean` page is lower priority than `/intelligence/map`
- Can iterate Step 4B after Step 4A is verified

### 11.3. Future Step 4B Plan

**Option 1: Embed `SouveraMapWorkspace`**
```typescript
// apps/api-gateway/src/app/intelligence/caribbean/page.tsx
import { SouveraMapWorkspace } from '@/components/intelligence/SouveraMapWorkspace';

export default function CaribbeanPage() {
  return (
    <main>
      <SouveraMegaNav />
      {/* Hero Section */}
      <SouveraMapWorkspace
        region="caribbean"
        showTopNav={false}
        embedded={true}
      />
      <SouveraFooter />
    </main>
  );
}
```

**Option 2: Use `CaribbeanMarketShell` directly**
```typescript
import { CaribbeanMarketShell } from '@/components/intelligence/CaribbeanMarketShell';

export default function CaribbeanPage() {
  return (
    <main>
      <SouveraMegaNav />
      {/* Hero Section */}
      <CaribbeanMarketShell embedded={true} showRegionFilter={false} />
      <SouveraFooter />
    </main>
  );
}
```

**Recommended:** Option 1 (consistent with `/intelligence/africa` pattern)

---

## 12. All Regions Strategy

### 12.1. Current Behavior

**URL:** `/intelligence/map?region=all`

**Current Display:**
- Renders `AfricaMapPanel` (Africa SVG map + market list)
- Displays notice below: "Caribbean-coming-soon"
- Notice text: "Caribbean market intelligence will be available here soon."

### 12.2. Step 4A Behavior (Unchanged)

**Decision:** Do NOT update "All Regions" view in Step 4A.

**Rationale:**
- "All Regions" should display a unified or combined view of Africa + Caribbean
- Determining the best UX pattern requires more design exploration:
  - Option A: Africa map + Caribbean shell stacked vertically
  - Option B: Combined card grid (Africa + Caribbean markets)
  - Option C: Tabbed interface (Africa | Caribbean)
- Step 4A focuses on Caribbean shell in isolation
- Changing "All Regions" adds complexity and risk

**Current Notice Behavior:**
- Remains unchanged
- Still shows "Caribbean-coming-soon" notice
- Step 5 will address this

### 12.3. Step 5 Planning (Future)

**Objective:** Implement a premium "All Regions" experience

**Potential Approaches:**

**Option A: Stacked Panels**
```
┌────────────────────────────────────┐
│ MapWorkspaceTopNav (All Regions)   │
├────────────────────────────────────┤
│ Africa Intelligence                │
│ [AfricaMapPanel with SVG map]      │
├────────────────────────────────────┤
│ Caribbean Intelligence             │
│ [CaribbeanMarketShell]             │
└────────────────────────────────────┘
```

**Option B: Combined Card Grid**
- Single unified market list
- Africa + Caribbean countries in one grid
- Region badge on each card ("Africa" | "Caribbean")
- Single shared `CountryIntelligencePanel` on right
- Search filters by name across all regions

**Option C: Tabbed Interface**
- Tabs: "Africa" | "Caribbean"
- Clicking tab switches view without changing URL `region` param
- Each tab shows its respective shell
- URL param `?region=all` remains, internal state controls tab

**Recommendation for Step 5:** Option B (Combined Card Grid)
- Most scalable for future regions (e.g., Southeast Asia, Latin America)
- Simplest UX (no tabs, no excessive scrolling)
- Aligns with "All Regions" intent (unified view)

### 12.4. URL Handling for Selected Countries in "All Regions"

**Scenario:** `/intelligence/map?region=all&selected=JAM`

**Current Behavior (Step 3):**
- `validateSelectedForRegion('JAM', 'all')` checks if JAM is African or Caribbean
- JAM is Caribbean → returns `'JAM'` (valid)
- However, "All Regions" view currently only shows Africa map + notice
- `selected=JAM` is effectively ignored (Africa panel doesn't show JAM)

**Step 4A Behavior:**
- No change; `selected=JAM` still ignored in "All Regions" view

**Step 5 Behavior:**
- If "All Regions" uses combined card grid (Option B), `selected=JAM` should:
  - Highlight Jamaica card in grid
  - Display Jamaica in `CountryIntelligencePanel`
- If using stacked panels (Option A), implementation would need to:
  - Detect region of selected country (JAM is Caribbean)
  - Scroll to or expand Caribbean shell
  - Select Jamaica within that shell

---

## 13. Data Coverage Exceptions

### 13.1. FDI Data

**Current State:**
- FDI data has not been ingested yet
- FDI column exists in DB schema but contains `NULL` values
- Backlog task: `DATA-ING-02B — Add FDI to World Bank ingestion`

**User Experience:**
- Public / Explorer users: FDI is locked (expected behavior)
- Professional+ users: FDI displays "Data pending" (UX-DATA-01 implemented)
- No "N/A" displayed for unlocked metrics

**Impact on Step 4A:**
- FDI will show "Data pending" for all Caribbean countries in `CountryIntelligencePanel`
- No code changes needed
- This is documented as expected interim behavior

### 13.2. Sector Data

**Current State:**
- `souvera_country_sectors` table has no seeded data
- Sectors are correctly fetched, filtered, and displayed by entitlement logic in code
- Sectors section is hidden in `CountryIntelligencePanel` when `sectors` array is empty
- Backlog tasks:
  - `DATA-SEED-01 — Seed Country Sector Data`
  - `UX-DATA-02 — Sector Data Pending Display`

**User Experience:**
- All users: Sectors section hidden (no data to display)
- No error messages
- Entitlement model correctly implemented (verified in `docs/qa/sector-entitlement-verification-matrix.md`)

**Impact on Step 4A:**
- Sectors will not be visible for Caribbean countries
- This is a data coverage gap, not a code bug
- No code changes needed
- `UX-DATA-02` (future enhancement) will show "Sectors data pending" when empty

### 13.3. Other Macroeconomic Indicators

**Current State:**
- GDP, GDP per capita, inflation, unemployment, etc. are ingested from World Bank API
- Coverage varies by country and indicator
- Missing values display "Data pending" (if unlocked) or are hidden (if locked)

**Impact on Step 4A:**
- Some Caribbean countries may have incomplete macroeconomic data
- Existing `EntitledMetricCard` component handles this gracefully
- No additional error handling required

### 13.4. Language Compliance

**Required:**
- "Curated Preview Data" (not "Live Data" or "Real-Time Data")
- Data status label from `DATA_STATUS_LABELS.previewData`
- No language suggesting live connectivity or real-time updates

**Prohibited:**
- "Live"
- "Real-time"
- "Supabase connected"
- "AfDEC Intelligence" or "AfDEC Priority" (brand confusion)

**Verification:**
- All new components must use `DATA_STATUS_LABELS` from `map-constants.ts`
- QA checklist includes language compliance check

---

## 14. Files Likely to Change

### 14.1. New Files

**`apps/api-gateway/src/components/intelligence/CaribbeanMarketShell.tsx`**
- New standalone component for Caribbean market list + panel
- Responsibilities:
  - Fetch Caribbean countries via `/api/v1/countries?region=caribbean`
  - Render market cards/grid
  - Handle country selection
  - Render `CountryIntelligencePanel` for selected country or default
  - Provide simple search functionality
  - Emit `onCountrySelect` callback for URL updates

### 14.2. Modified Files

**`apps/api-gateway/src/components/intelligence/SouveraMapWorkspace.tsx`**
- Update conditional rendering in `SouveraMapWorkspace`:
  ```typescript
  // Current (Step 3)
  {currentRegion === 'caribbean' && (
    <CaribbeanPlaceholder onSwitchToAfrica={handleSwitchToAfrica} />
  )}

  // Step 4A
  {currentRegion === 'caribbean' && (
    <CaribbeanMarketShell
      selectedIso3={selectedIso3}
      onCountrySelect={handleCountrySelect}
    />
  )}
  ```
- No other changes needed (props, state, logic already support Caribbean)

**`apps/api-gateway/src/components/intelligence/CountryIntelligencePanel.tsx` (Optional)**
- If implementing "Top Caribbean Economies" default in panel:
  - Add logic to detect region context (Caribbean vs. Africa)
  - Fetch and display top Caribbean economies when `selectedIso3` is `null` and region is Caribbean
- If reusing existing "Top 10 Economies" logic, no changes may be needed

### 14.3. Deprecated/Removed Files

**`apps/api-gateway/src/components/intelligence/CaribbeanPlaceholder.tsx`**
- Will be replaced by `CaribbeanMarketShell`
- Can be deleted after Step 4A is verified
- Alternatively, keep as fallback if needed

### 14.4. Unchanged Files

**`apps/api-gateway/src/app/intelligence/map/page.tsx`**
- No changes needed (uses `SouveraMapWorkspaceWithUrl`, which is region-agnostic)

**`apps/api-gateway/src/app/intelligence/africa/page.tsx`**
- No changes needed

**`apps/api-gateway/src/app/intelligence/caribbean/page.tsx`**
- No changes in Step 4A (deferred to Step 4B)

**`apps/api-gateway/src/lib/market-coverage.ts`**
- No changes needed (already defines `APPROVED_CARIBBEAN_ISO3`)

**`apps/api-gateway/src/app/api/v1/countries/route.ts`**
- No changes needed (already supports `?region=caribbean`)

**`apps/api-gateway/src/app/api/v1/country-lite/route.ts`**
- No changes needed (already supports Caribbean ISO3 codes)

---

## 15. Risks and Mitigations

### 15.1. Risk: Component Complexity

**Risk:** `CaribbeanMarketShell` becomes too complex, mixing concerns (data fetching, rendering, state management).

**Mitigation:**
- Follow single-responsibility principle
- Extract sub-components if needed:
  - `CaribbeanMarketCard.tsx` (individual market card)
  - `CaribbeanSearchBar.tsx` (search input)
  - `CaribbeanDefaultPanel.tsx` (top economies default)
- Keep `CaribbeanMarketShell` as orchestrator, delegating rendering to sub-components

### 15.2. Risk: Data Coverage Gaps

**Risk:** Missing FDI and sector data reduces perceived value of Caribbean shell.

**Mitigation:**
- Leverage existing "Data pending" UX (UX-DATA-01)
- Clearly communicate "Curated Preview Data" status
- Prioritize DATA-ING-02B and DATA-SEED-01 backlog tasks for future sprints
- Focus on delivering premium UX and architecture; data will follow

### 15.3. Risk: Mobile Performance

**Risk:** Rendering 20 market cards on mobile may cause performance issues or excessive scrolling.

**Mitigation:**
- Implement virtualized scrolling if needed (e.g., `react-window`)
- Lazy load cards below the fold
- Optimize card rendering (avoid heavy re-renders)
- Test on real devices (iPhone SE, Pixel 5)

### 15.4. Risk: URL State Sync Bugs

**Risk:** Browser back/forward navigation causes incorrect state (e.g., selected country doesn't update).

**Mitigation:**
- Leverage existing robust URL sync in `SouveraMapWorkspaceWithUrl` (verified in Step 3)
- `CaribbeanMarketShell` is purely controlled (receives `selectedIso3` prop, emits callbacks)
- No internal state for selected country in shell component
- QA checklist includes browser navigation testing

### 15.5. Risk: Step 4A Scope Creep

**Risk:** Attempting to also update `/intelligence/caribbean` page or "All Regions" view increases complexity and delays delivery.

**Mitigation:**
- Strict scope adherence: Step 4A = `CaribbeanMarketShell` on `/intelligence/map?region=caribbean` ONLY
- Defer `/intelligence/caribbean` to Step 4B
- Defer "All Regions" enhancement to Step 5
- Document future steps clearly in this plan

---

## 16. Acceptance Criteria

### 16.1. Functional Requirements

**PASS Criteria:**

1. **Caribbean Market List Display**
   - [ ] `/intelligence/map?region=caribbean` displays `CaribbeanMarketShell` (not `CaribbeanPlaceholder`)
   - [ ] Market list shows 20 approved Caribbean markets (from `APPROVED_CARIBBEAN_ISO3`)
   - [ ] Each market card displays: country name, flag emoji, GDP, GDP per capita
   - [ ] Cards are clickable and respond to hover state

2. **Country Selection**
   - [ ] Clicking a market card selects that country
   - [ ] `CountryIntelligencePanel` displays selected country intelligence
   - [ ] URL updates to `?region=caribbean&selected={ISO3}` without full page reload
   - [ ] Selected country data fetched via `/api/v1/country-lite?iso3={ISO3}`

3. **Deep-Linking Support**
   - [ ] `/intelligence/map?region=caribbean&selected=JAM` loads with Jamaica selected
   - [ ] `CountryIntelligencePanel` displays Jamaica on initial page load
   - [ ] Invalid `selected` values gracefully ignored (e.g., `selected=NGA` shows default panel)

4. **Default Panel**
   - [ ] When no country selected, panel displays "Top Caribbean Economies" (or fallback)
   - [ ] Default panel lists top 5-7 Caribbean countries by GDP (if data exists)
   - [ ] Clicking a country in default panel selects that country

5. **Search Functionality**
   - [ ] Search bar filters Caribbean markets by name (case-insensitive)
   - [ ] Filtering updates in real-time as user types
   - [ ] Empty search results show "No markets found" message
   - [ ] Clearing search restores full market list

6. **Mobile Responsiveness**
   - [ ] Mobile layout (< 640px) stacks: search → cards → panel
   - [ ] Market cards display single-column on mobile
   - [ ] No horizontal overflow on mobile (375px, 414px tested)
   - [ ] Touch interactions work correctly (tap to select)

7. **Region Switching**
   - [ ] Changing region from Caribbean to Africa resets selected country
   - [ ] URL updates correctly (removes `selected` param)
   - [ ] No crash or error when switching between regions

8. **Browser Navigation**
   - [ ] Browser back/forward buttons update URL and UI state correctly
   - [ ] Selected country updates when navigating history
   - [ ] No full page reloads during navigation

9. **Data Coverage Exceptions**
   - [ ] FDI displays "Data pending" for Professional+ users (not "N/A")
   - [ ] Sectors hidden when no data exists (no error)
   - [ ] Missing macroeconomic indicators display "Data pending" or are hidden

10. **Language Compliance**
    - [ ] "Curated Preview Data" displayed (from `DATA_STATUS_LABELS.previewData`)
    - [ ] No "Live Data" or "Real-Time Data" language
    - [ ] No "AfDEC Intelligence" or similar brand confusion

### 16.2. Technical Requirements

**PASS Criteria:**

11. **Build & Lint**
    - [ ] `npm run build` completes without errors
    - [ ] `npm run lint` passes (or only pre-existing errors remain)
    - [ ] TypeScript type checking passes (`npx tsc --noEmit`)

12. **Component Architecture**
    - [ ] `CaribbeanMarketShell.tsx` created under `components/intelligence/`
    - [ ] Component is a controlled component (receives `selectedIso3` prop, emits `onCountrySelect` callback)
    - [ ] `CountryIntelligencePanel` reused without modification (or minimal changes)
    - [ ] No refactoring of `RegionalMarketGrid` in Step 4A

13. **API Integration**
    - [ ] Uses existing `/api/v1/countries?region=caribbean` endpoint
    - [ ] Uses existing `/api/v1/country-lite?iso3={ISO3}` endpoint via `CountryIntelligencePanel`
    - [ ] No new API routes created
    - [ ] No database schema changes

14. **Unchanged Behavior**
    - [ ] `/intelligence/africa` remains unchanged and functional
    - [ ] `/intelligence/map?region=africa` remains unchanged and functional
    - [ ] `/intelligence/map?region=all` remains unchanged (still shows Africa + notice)
    - [ ] `/intelligence/caribbean` remains unchanged (still uses `RegionalMarketGrid`)

### 16.3. FAIL Criteria (Blockers)

**Implementation should NOT proceed if:**

1. `CaribbeanMarketShell` cannot fetch data from `/api/v1/countries?region=caribbean`
2. Selected country intelligence panel does not display for Caribbean countries
3. URL query parameters do not update when selecting/deselecting countries
4. Mobile layout has horizontal overflow or broken touch interactions
5. TypeScript build fails due to new errors introduced in Step 4A
6. Language compliance violations ("Live Data", "AfDEC Intelligence", etc.)

---

## 17. Implementation Sequence

### 17.1. Phase 1: Component Scaffolding

**Tasks:**
1. Create `apps/api-gateway/src/components/intelligence/CaribbeanMarketShell.tsx`
2. Define component props:
   ```typescript
   interface CaribbeanMarketShellProps {
     selectedIso3?: string | null;
     onCountrySelect?: (iso3: string | null) => void;
   }
   ```
3. Set up basic component structure (layout divs, no logic yet)
4. Import and test rendering in `SouveraMapWorkspace.tsx` (replace `CaribbeanPlaceholder`)

**Verification:**
- Component renders without errors
- Desktop/mobile layout structure visible

### 17.2. Phase 2: Data Fetching

**Tasks:**
1. Implement Caribbean country list fetching:
   ```typescript
   const [countries, setCountries] = useState<Country[]>([]);
   useEffect(() => {
     fetch('/api/v1/countries?region=caribbean')
       .then(res => res.json())
       .then(data => setCountries(data.countries));
   }, []);
   ```
2. Add loading and error states
3. Render market cards with country name, flag, GDP

**Verification:**
- 20 Caribbean countries display in market list
- Cards show correct data (name, GDP, etc.)

### 17.3. Phase 3: Country Selection Logic

**Tasks:**
1. Implement `handleCountrySelect` function:
   ```typescript
   const handleCountrySelect = (iso3: string) => {
     onCountrySelect?.(iso3);
   };
   ```
2. Add click handlers to market cards
3. Pass `selectedIso3` prop to `CountryIntelligencePanel`
4. Implement panel close handler

**Verification:**
- Clicking a card selects that country
- Panel displays selected country intelligence
- Closing panel resets selection

### 17.4. Phase 4: URL Integration

**Tasks:**
1. Update `SouveraMapWorkspace.tsx` to pass `onCountrySelect` callback from parent
2. Verify `SouveraMapWorkspaceWithUrl` correctly updates URL when Caribbean country selected
3. Test deep-linking: `/intelligence/map?region=caribbean&selected=JAM`

**Verification:**
- URL updates when selecting/deselecting countries
- Deep-linking works (Jamaica selected on page load)
- Browser back/forward navigation works

### 17.5. Phase 5: Search Functionality

**Tasks:**
1. Add search bar UI above market cards
2. Implement search state and filtering logic:
   ```typescript
   const [searchQuery, setSearchQuery] = useState('');
   const filteredCountries = countries.filter(c =>
     c.name.toLowerCase().includes(searchQuery.toLowerCase())
   );
   ```
3. Render filtered countries instead of full list
4. Add "No results" message when `filteredCountries.length === 0`

**Verification:**
- Search filters markets correctly
- Clearing search restores full list
- No errors when search returns zero results

### 17.6. Phase 6: Default Panel Implementation

**Tasks:**
1. Determine approach: extend `CountryIntelligencePanel` or pass default content
2. If extending panel:
   - Modify `CountryIntelligencePanel` to detect region context
   - Fetch top Caribbean economies when `selectedIso3` is `null` and region is Caribbean
3. If passing default content:
   - Create `TopCaribbeanEconomiesPanel` component
   - Pass as `defaultContent` prop to `CountryIntelligencePanel`

**Verification:**
- Default panel displays when no country selected
- Top Caribbean economies listed correctly
- Clicking a country in default panel selects that country

### 17.7. Phase 7: Mobile Optimization

**Tasks:**
1. Test on mobile breakpoints (375px, 414px, 768px)
2. Adjust grid layout: `grid-cols-1` on mobile, `grid-cols-2` on desktop
3. Verify panel stacks below cards on mobile
4. Test touch interactions (tap to select)
5. Verify no horizontal overflow

**Verification:**
- Mobile layout renders correctly
- No horizontal scroll
- Touch interactions work smoothly

### 17.8. Phase 8: QA & Documentation

**Tasks:**
1. Run full acceptance criteria checklist (Section 16)
2. Test all URL patterns (Section 8.1)
3. Verify language compliance (no "Live Data", etc.)
4. Run build/lint/typecheck
5. Create `docs/qa/phase-3-step-4-caribbean-market-shell-implementation.md`
6. Document any known limitations or future enhancements

**Verification:**
- All acceptance criteria pass
- Build succeeds
- Documentation complete

---

## 18. Recommendation

### 18.1. Implementation Readiness

**Status:** ✅ **APPROVED FOR IMPLEMENTATION**

**Rationale:**
- Phase 3 Steps 1-3 are complete and verified
- API infrastructure ready (`/api/v1/countries?region=caribbean`, `/api/v1/country-lite`)
- Reusable components available (`CountryIntelligencePanel`, `EntitledMetricCard`, etc.)
- URL state management proven in Step 3
- Data coverage exceptions documented and acceptable
- Clear scope boundaries (Step 4A vs. Step 4B vs. Step 5)

### 18.2. Key Success Factors

1. **Strict Scope Adherence:**
   - Only implement `CaribbeanMarketShell` on `/intelligence/map?region=caribbean`
   - Do NOT update `/intelligence/caribbean` page (defer to Step 4B)
   - Do NOT update "All Regions" view (defer to Step 5)

2. **Component Reuse:**
   - Maximize reuse of `CountryIntelligencePanel`, `EntitledMetricCard`, `EntitledSectorList`
   - Avoid duplicating logic or UI patterns
   - Keep `CaribbeanMarketShell` focused and delegating

3. **Mobile-First Design:**
   - Test on real mobile devices throughout implementation
   - Prioritize touch interactions and scrolling performance
   - Avoid assumptions about desktop-only usage

4. **Data Coverage Transparency:**
   - Continue using "Curated Preview Data" status
   - Leverage existing "Data pending" UX for missing FDI and sectors
   - Do not block implementation on data ingestion tasks

### 18.3. Next Steps

**Immediate:**
1. **Begin Step 4A Implementation** following the sequence in Section 17
2. Create `CaribbeanMarketShell.tsx` component (Phase 1: Component Scaffolding)
3. Integrate data fetching (Phase 2: Data Fetching)

**After Step 4A QA Passes:**
1. Plan **Step 4B:** Update `/intelligence/caribbean` page to embed `SouveraMapWorkspace` or `CaribbeanMarketShell`
2. Plan **Step 5:** Enhance "All Regions" view to show combined Africa + Caribbean intelligence

**Backlog (Data Coverage):**
1. **DATA-ING-02B:** Add FDI to World Bank ingestion
2. **DATA-SEED-01:** Seed country sector data
3. **UX-DATA-02:** Implement "Sectors data pending" display

### 18.4. Expected Outcome

Upon successful implementation of Phase 3 Step 4A:

- `/intelligence/map?region=caribbean` displays a premium, executive-grade Caribbean intelligence experience
- 20 Caribbean markets and territories are accessible with one click
- Selected country intelligence displays GDP, inflation, FDI (data pending), and other macroeconomic indicators
- Deep-linking and browser navigation work seamlessly
- Mobile experience is polished and touch-optimized
- Language compliance maintained ("Curated Preview Data")
- Foundation established for `/intelligence/caribbean` embedding (Step 4B) and "All Regions" enhancement (Step 5)

---

## Appendix A: Component Interface Specification

### CaribbeanMarketShell.tsx

```typescript
interface CaribbeanMarketShellProps {
  selectedIso3?: string | null;
  onCountrySelect?: (iso3: string | null) => void;
}

export function CaribbeanMarketShell({
  selectedIso3,
  onCountrySelect,
}: CaribbeanMarketShellProps) {
  // State
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Effects
  useEffect(() => {
    // Fetch Caribbean countries
  }, []);

  // Handlers
  const handleCountrySelect = (iso3: string) => {
    onCountrySelect?.(iso3);
  };

  const handleClosePanel = () => {
    onCountrySelect?.(null);
  };

  // Filtering
  const filteredCountries = useMemo(() => {
    // Filter by searchQuery
  }, [countries, searchQuery]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-zinc-950 rounded-xl">
      {/* Left: Market List */}
      <div className="flex-1 lg:max-w-[900px]">
        {/* Search Bar */}
        {/* Market Cards Grid */}
      </div>

      {/* Right: Country Intelligence Panel */}
      <div className="flex-1 lg:max-w-[600px]">
        <CountryIntelligencePanel
          selectedIso3={selectedIso3}
          onClose={handleClosePanel}
        />
      </div>
    </div>
  );
}
```

---

## Appendix B: Testing Checklist

### Manual Testing

**Desktop (1920x1080, Chrome/Firefox/Edge):**
- [ ] Navigate to `/intelligence/map`
- [ ] Switch to "Caribbean" from region filter
- [ ] Verify market list displays 20 cards
- [ ] Click "Jamaica" card
- [ ] Verify URL updates to `?region=caribbean&selected=JAM`
- [ ] Verify panel displays Jamaica intelligence
- [ ] Close panel
- [ ] Verify URL updates to `?region=caribbean` (no selected)
- [ ] Type "Trinidad" in search bar
- [ ] Verify only Trinidad & Tobago card displays
- [ ] Clear search
- [ ] Switch to "Africa" region
- [ ] Verify Africa map displays, selected country reset

**Mobile (375x667, Safari iOS / Chrome Android):**
- [ ] Navigate to `/intelligence/map?region=caribbean`
- [ ] Verify stacked layout (search → cards → panel)
- [ ] Scroll through market cards
- [ ] Tap "Bahamas" card
- [ ] Verify panel displays Bahamas below cards
- [ ] Verify no horizontal overflow
- [ ] Tap close button in panel
- [ ] Verify panel reverts to default

**Deep-Linking:**
- [ ] Navigate directly to `/intelligence/map?region=caribbean&selected=JAM`
- [ ] Verify Jamaica selected on page load
- [ ] Navigate to `/intelligence/map?region=caribbean&selected=NGA` (invalid)
- [ ] Verify default panel displayed (NGA ignored)

**Browser Navigation:**
- [ ] Navigate: `/intelligence/map` → `?region=caribbean` → `?region=caribbean&selected=JAM`
- [ ] Click browser back button twice
- [ ] Verify URL and UI revert correctly at each step
- [ ] Click browser forward button twice
- [ ] Verify URL and UI advance correctly

**Language Compliance:**
- [ ] Inspect all visible text
- [ ] Verify "Curated Preview Data" displayed
- [ ] Verify no "Live Data", "Real-Time", "AfDEC Intelligence", etc.

### Automated Testing (Optional)

**Unit Tests:**
- [ ] `CaribbeanMarketShell` renders without crashing
- [ ] Search filtering logic works correctly
- [ ] `onCountrySelect` callback invoked when card clicked

**Integration Tests:**
- [ ] `/api/v1/countries?region=caribbean` returns 20 countries
- [ ] `/api/v1/country-lite?iso3=JAM` returns Jamaica data

**E2E Tests (Playwright/Cypress):**
- [ ] User can select a Caribbean country and see intelligence panel
- [ ] URL updates correctly when country selected
- [ ] Deep-linking to `?region=caribbean&selected=JAM` works

---

**End of Document**
