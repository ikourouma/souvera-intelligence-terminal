# Phase 3 Step 2: Region Filter UI Plan

**Document ID**: PHASE3-STEP2-001  
**Version**: 1.0  
**Date**: May 2, 2026  
**Status**: Planning Complete — Ready for Implementation  
**Related**: Phase 3 Regional Expansion Plan, Phase 3 Step 1 Region Prop Refinement

---

## 1. Executive Summary

Step 2 adds a region filter UI to the standalone `/intelligence/map` workspace top nav, enabling users to toggle between Africa, Caribbean, and All Regions. Since the Caribbean market shell is not yet implemented (reserved for Step 4), Step 2 defines safe interim behavior that maintains a premium UX without breaking functionality or showing incomplete content.

**Key Design Decision**: The region filter will be visible immediately on `/intelligence/map` with graceful interim states for Caribbean and All Regions. Embedded workspaces (`/intelligence/africa`) will never show the region filter.

### Key Deliverables

| Deliverable | Component | Purpose |
|-------------|-----------|---------|
| Region Filter Dropdown | `MapWorkspaceTopNav` | Allow users to select Africa, Caribbean, or All Regions |
| Caribbean Placeholder | `CaribbeanPlaceholder` | Premium placeholder when Caribbean is selected |
| All Regions Notice | Inline notice | Inform users Caribbean shell is coming |
| Region State Management | `SouveraMapWorkspace` | Handle region changes and reset selected country |

### User Experience

| Region | Map Display | Panel Display | Notes |
|--------|-------------|---------------|-------|
| Africa | Africa SVG map | Country intelligence panel | Unchanged from Phase 2 |
| Caribbean | Premium placeholder | N/A | "Caribbean shell coming soon" |
| All Regions | Africa SVG map | Country intelligence panel | Notice: "Caribbean coming soon" |

---

## 2. Current State

### Component Analysis

**`SouveraMapWorkspace.tsx` (Step 1 Complete)**:
- ✅ Accepts `region?: RegionFilter` prop
- ✅ Derives workspace label via `getWorkspaceLabelForRegion(region)`
- ✅ Has `embedded` prop (controls embedded behavior)
- ✅ Has `showTopNav` prop (controls top nav visibility)
- ✅ Fetches countries via `/api/v1/countries?region=${region}`
- ⚠️ **Gap**: Currently filters to African countries only (lines 88-91), regardless of region prop
- ✅ Has internal `selectedIso3` state for country selection

**`MapWorkspaceTopNav.tsx` (Needs Step 2 Changes)**:
- Simple component with `workspaceLabel` and `showRequestAccess` props
- ⚠️ **Gap**: No `region` prop or `onRegionChange` callback
- ✅ Shows "Curated Preview Data" pill (must remain visible)
- ✅ Shows "Request Access" CTA

**`AfricaMapPanel.tsx` (Africa-Specific)**:
- Renders Africa SVG map using TopoJSON
- **Limitation**: Cannot render Caribbean (no Caribbean geometry)
- Will remain Africa-specific by design

**`market-coverage.ts` (Step 1 Complete)**:
- ✅ Has all required utilities: `RegionFilter`, `getRegionLabel()`, `getWorkspaceLabelForRegion()`
- ✅ Ready for Step 2

### Current Route Behavior

| Route | Region | Top Nav | Map | Filter Visible |
|-------|--------|---------|-----|----------------|
| `/intelligence/map` | `"africa"` (explicit) | ✅ Shown | Africa SVG | ❌ No (Step 2 adds) |
| `/intelligence/africa` | `"africa"` (explicit) | ❌ Hidden | Africa SVG | ❌ No (will remain hidden) |

---

## 3. Answers to Planning Questions

### Q1: Should the region filter be visible immediately on `/intelligence/map`?

**Answer: YES**, with safe interim behavior.

**Rationale**:
- Early visibility establishes UX pattern and product direction
- Safe interim states prevent user confusion and broken experiences
- Enables product team feedback before Caribbean shell is complete
- Alternative (behind prop) delays user validation unnecessarily
- Premium placeholders maintain executive-grade aesthetic

**Decision**: Region filter visible by default on standalone `/intelligence/map`.

---

### Q2: What happens when user selects Caribbean?

**Answer: Show premium placeholder (not broken map).**

Since `AfricaMapPanel` only renders Africa and there is no Caribbean SVG map, selecting Caribbean must display a **premium placeholder** that maintains the terminal aesthetic.

**Proposed Caribbean Placeholder UI**:

```
┌─────────────────────────────────────────────────────────────────┐
│ [Top Nav: Souvera > Caribbean Intelligence Terminal]           │
│ [Region Filter: Africa | Caribbean* | All Regions]              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      🌴                                         │
│              Caribbean Intelligence                             │
│                                                                 │
│     Premium market shell for 20 Caribbean territories           │
│     is being finalized.                                         │
│                                                                 │
│     [Switch to Africa Intelligence]  [Request Access]           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Curated Preview Data · Afronovation, Inc.                       │
└─────────────────────────────────────────────────────────────────┘
```

**Design Elements**:
- Caribbean icon (palm tree or globe)
- Headline: "Caribbean Intelligence"
- Subheadline: Clear expectation that shell is "being finalized"
- CTAs: "Switch to Africa Intelligence", "Request Access"
- Footer: Same metadata as main workspace ("Curated Preview Data")

**Why a Placeholder**:
- Prevents showing an empty/broken map panel
- Sets expectation that Caribbean is premium and coming
- Maintains executive-grade aesthetic
- Does not mislead users into thinking Caribbean is unsupported

---

### Q3: What should appear when user selects All Regions?

**Answer: Show Africa map + Caribbean coming soon notice.**

Since "All Regions" = Africa + Caribbean (per market governance), and Caribbean has no map yet, the All Regions view should:
1. Show Africa map (preserves user value)
2. Add a subtle inline notice that Caribbean markets are being finalized

**Proposed All Regions UI**:

```
┌─────────────────────────────────────────────────────────────────┐
│ [Top Nav: Souvera > Souvera Intelligence Terminal]             │
│ [Region Filter: Africa | Caribbean | All Regions*]              │
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────┬─────────────────────────────────┐ │
│ │                           │                                 │ │
│ │   Africa Map (as usual)   │   Intelligence Panel            │ │
│ │                           │                                 │ │
│ └───────────────────────────┴─────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ℹ️ Africa markets shown. Caribbean market shell coming soon.    │
├─────────────────────────────────────────────────────────────────┤
│ Curated Preview Data · Afronovation, Inc.                       │
└─────────────────────────────────────────────────────────────────┘
```

**Notice Styling**:
- Subtle, info-level notice (blue or amber accent)
- Non-intrusive (below workspace, above footer)
- Optional: Dismissible with local storage persistence

**Alternative Considered**: Treat "All Regions" as disabled until Caribbean shell exists. **Rejected** — better to show partial value than disable options.

---

### Q4: Should embedded `/intelligence/africa` hide the region filter?

**Answer: YES, absolutely.**

**Rationale**:
- Embedded workspace is fixed to Africa by design
- The `/intelligence/africa` page is a dedicated regional command center
- Region filter would confuse the user experience and navigation hierarchy
- No region state management needed for embedded views

**Implementation**:
- Add `showRegionFilter?: boolean` prop to `MapWorkspaceTopNav`
- Default to `false` when `embedded={true}` in parent
- Explicit control from `SouveraMapWorkspace`

**Verification**:
```typescript
// In SouveraMapWorkspace
<MapWorkspaceTopNav 
  workspaceLabel={effectiveWorkspaceLabel}
  showRegionFilter={!embedded}
  region={currentRegion}
  onRegionChange={handleRegionChange}
/>
```

---

### Q5: Should region state reset selected country when changed?

**Answer: YES.**

**Rationale**:
- Selected country (e.g., Nigeria with ISO3 "NGA") doesn't apply to Caribbean filter
- Avoids invalid state where `selectedIso3` doesn't exist in new region
- Clean UX: new region = fresh start
- Prevents confusion when switching between regions

**Implementation**:
```typescript
const handleRegionChange = useCallback((newRegion: RegionFilter) => {
  setSelectedIso3(null); // Reset selection
  setCurrentRegion(newRegion);
}, []);
```

**Verification**: Test region switching with a country selected — panel should reset to Top 10 Economies.

---

### Q6: Should this step update URL query params?

**Answer: NO.** Reserved for Step 3.

**Rationale**:
- Step 2 focuses on UI and state management only
- Query param support requires additional handling (hydration, validation, browser history)
- Incremental implementation reduces risk
- Step 3 will add `?region=africa&selected=NGA` support

**Decision**: Region state lives in React component state only for Step 2.

---

### Q7: Should this step fetch different API region data?

**Answer: Partially YES.**

| Region | API Fetch | Rendering | Data Usage |
|--------|-----------|-----------|------------|
| Africa | `?region=africa` | Africa map renders | Full usage |
| Caribbean | `?region=caribbean` | Placeholder renders (no map) | Data fetched but not displayed |
| All | `?region=all` | Africa map renders + notice | Filtered to Africa for map |

**Key Point**: The API already supports region filtering. For Caribbean, data may return but the map won't render — hence the placeholder. For All Regions, fetch all data but only render Africa map.

**Alternative Considered**: Always fetch Africa for now, switch later. **Rejected** — this limits future flexibility and requires rework.

**Implementation**: `fetchCountries` callback already uses `region` in dependency array, so API calls will automatically update when region changes.

---

### Q8: How should "Curated Preview Data" remain visible?

**Current**: Displayed in `MapWorkspaceTopNav` as a pill badge.

**Step 2**: No change required. The pill must remain visible in all region states.

**Additional**:
- Caribbean Placeholder should show "Curated Preview Data" in footer
- All Regions notice should not replace "Curated Preview Data" label

**Verification**: Visual inspection of all three region states must show the amber "Curated Preview Data" pill.

---

### Q9: How should mobile region filter look?

**Recommended: Compact Dropdown (Space Efficient)**

**Mobile (<768px)**:
```
┌─────────────────────────────────┐
│ [Africa ▼]  [Curated Preview Data]│
└─────────────────────────────────┘
```

**Behavior**:
- Dropdown selector instead of pill toggle (space efficient)
- Tapping opens dropdown with Africa / Caribbean / All Regions options
- "Curated Preview Data" badge remains visible on same row
- Request Access CTA hidden on mobile (already implemented in current design)

**Desktop (≥768px)**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Souvera > [Africa Intelligence Terminal ▼]  [Preview Data] [CTA]│
└─────────────────────────────────────────────────────────────────┘
```

**Behavior**:
- Dropdown integrated into workspace label area
- Shows full workspace label with dropdown indicator
- All elements (brand, label, data status, CTA) visible

---

## 4. Recommended UI Component Design

### Region Filter Dropdown Component

**Location**: Inside `MapWorkspaceTopNav` component

**Design Approach**: Dropdown in Workspace Label Area

```tsx
// Conceptual structure
<div className="flex items-center gap-2">
  {showRegionFilter ? (
    <RegionFilterDropdown
      value={region}
      onChange={onRegionChange}
    />
  ) : (
    <span className="text-sm font-bold text-white">
      {workspaceLabel}
    </span>
  )}
</div>
```

**Dropdown Options**:

| Value | Label | Description (shown in tooltip or subtitle) |
|-------|-------|-------------------------------------------|
| `africa` | Africa | 54 African countries |
| `caribbean` | Caribbean | 20 Caribbean markets |
| `all` | All Regions | Africa + Caribbean |

**Styling Guidelines**:
- Matches terminal aesthetic (zinc-900/zinc-800 colors)
- Small font (text-sm), bold, white text
- Uppercase tracking for labels (tracking-wider)
- Dropdown arrow indicator (ChevronDown icon)
- Hover state: bg-zinc-800 → bg-zinc-700
- Focus ring for accessibility (focus-visible:ring-2)
- Smooth transitions (transition-colors)

**Accessibility**:
- Keyboard navigable (Tab, Enter, Arrow keys)
- ARIA labels (`aria-label="Select region"`)
- Screen reader friendly
- Focus indicators visible

---

## 5. Interim Caribbean Behavior

### CaribbeanPlaceholder Component

**New Component**: `apps/api-gateway/src/components/intelligence/CaribbeanPlaceholder.tsx`

**Purpose**: Display premium placeholder when Caribbean is selected but shell doesn't exist yet.

**Props**:
```typescript
interface CaribbeanPlaceholderProps {
  onSwitchToAfrica: () => void;
}
```

**Component Structure**:
```tsx
export function CaribbeanPlaceholder({ onSwitchToAfrica }: CaribbeanPlaceholderProps) {
  return (
    <div className="min-h-[600px] bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Main content - centered */}
      <div className="flex items-center justify-center h-[500px] px-6">
        <div className="text-center max-w-2xl">
          {/* Icon */}
          <div className="mb-6">
            <Globe className="w-16 h-16 text-blue-500 mx-auto" />
          </div>
          
          {/* Headline */}
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Caribbean Intelligence
          </h2>
          
          {/* Subheadline */}
          <p className="text-lg text-zinc-400 mb-8">
            Premium market shell for 20 Caribbean territories is being finalized.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onSwitchToAfrica}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors"
            >
              Switch to Africa Intelligence
            </button>
            <Link
              href="/access/request-access"
              className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors"
            >
              Request Access
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-[10px]">
          <span className="text-amber-500">{DATA_STATUS_LABELS.previewData}</span>
          <span className="hidden sm:inline text-zinc-600">·</span>
          <span className="text-[9px] text-zinc-700 font-medium">Afronovation, Inc.</span>
        </div>
      </div>
    </div>
  );
}
```

**Design Rationale**:
- Centered content (premium feel, not error state)
- Clear messaging (not broken, just coming soon)
- Actionable CTAs (switch or request access)
- Consistent footer (maintains terminal aesthetic)

---

## 6. Interim All Regions Behavior

### All Regions Notice Component

**Approach**: Inline notice within workspace (not a separate component)

**Location**: Between workspace main panel and footer metadata

**Implementation**:
```tsx
{/* All Regions Notice - shown only when region is 'all' */}
{currentRegion === 'all' && (
  <div className="px-4 py-3 border-t border-zinc-800 bg-blue-950/20">
    <div className="flex items-center justify-center gap-2 text-sm text-blue-400">
      <Info className="w-4 h-4" />
      <span>
        Africa markets shown. Caribbean market shell coming soon.
      </span>
    </div>
  </div>
)}
```

**Styling**:
- Subtle blue accent (blue-950/20 background, blue-400 text)
- Info icon for clarity
- Non-intrusive (doesn't block content)
- Centered text for balance

**Alternative (Dismissible Notice)**:
```tsx
{currentRegion === 'all' && !dismissed && (
  <div className="px-4 py-3 border-t border-zinc-800 bg-blue-950/20">
    <div className="flex items-center justify-between gap-4 text-sm text-blue-400">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4" />
        <span>Africa markets shown. Caribbean market shell coming soon.</span>
      </div>
      <button
        onClick={handleDismiss}
        className="text-zinc-500 hover:text-zinc-400"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
)}
```

**Recommendation**: Start with non-dismissible, add dismiss functionality if user feedback indicates it's distracting.

---

## 7. State Management Plan

### SouveraMapWorkspace State Updates

**Current State** (Step 1):
```typescript
const [countries, setCountries] = useState<Country[]>([]);
const [meta, setMeta] = useState<CountriesResponse['meta'] | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [selectedIso3, setSelectedIso3] = useState<string | null>(null);
```

**New State Needed** (Step 2):
```typescript
// Track current region (can differ from prop if user changes it)
const [currentRegion, setCurrentRegion] = useState<RegionFilter>(region);
```

**New Handler**:
```typescript
const handleRegionChange = useCallback((newRegion: RegionFilter) => {
  setSelectedIso3(null); // Reset selection when region changes
  setCurrentRegion(newRegion);
}, []);
```

**Data Flow**:
1. User clicks region dropdown in `MapWorkspaceTopNav`
2. `onRegionChange(newRegion)` callback fires
3. `handleRegionChange` executes:
   - Resets `selectedIso3` to `null`
   - Updates `currentRegion` state
4. Component re-renders based on `currentRegion`
5. `fetchCountries` dependency array includes `region`, so API refetch triggers
6. Conditional rendering based on `currentRegion`:
   - If `'africa'`: Render Africa map + panel
   - If `'caribbean'`: Render `<CaribbeanPlaceholder />`
   - If `'all'`: Render Africa map + panel + notice

**API Fetch Behavior**:
```typescript
// Existing fetchCountries already uses region in dependency
const fetchCountries = useCallback(async () => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(`/api/v1/countries?region=${currentRegion}`);
    // ... rest of fetch logic
  } catch (err) {
    // ... error handling
  }
}, [currentRegion]); // Will refetch when currentRegion changes
```

**Rendering Logic** (Step 2 Addition):
```typescript
// After loading/error states...

// Caribbean placeholder
if (currentRegion === 'caribbean') {
  return (
    <div className={`...`}>
      {showTopNav && <MapWorkspaceTopNav ... />}
      <CaribbeanPlaceholder 
        onSwitchToAfrica={() => handleRegionChange('africa')} 
      />
    </div>
  );
}

// Default: Africa or All Regions (both show Africa map)
return (
  <div className={`...`}>
    {showTopNav && <MapWorkspaceTopNav ... />}
    
    <div className="flex flex-col lg:flex-row lg:h-[650px] xl:h-[700px]">
      {/* Map Panel */}
      <AfricaMapPanel ... />
      
      {/* Intelligence Panel */}
      <CountryIntelligencePanel ... />
    </div>
    
    {/* All Regions Notice */}
    {currentRegion === 'all' && (
      <div className="px-4 py-3 border-t border-zinc-800 bg-blue-950/20">
        ...
      </div>
    )}
    
    {/* Footer metadata */}
    {meta && <div className="px-4 py-3 ...">...</div>}
  </div>
);
```

---

## 8. Files Likely to Change

### Modified Files

| File | Changes | Complexity |
|------|---------|------------|
| `apps/api-gateway/src/components/intelligence/MapWorkspaceTopNav.tsx` | Add region dropdown, props for `region`, `onRegionChange`, `showRegionFilter` | Medium |
| `apps/api-gateway/src/components/intelligence/SouveraMapWorkspace.tsx` | Add region state, handler, conditional rendering for Caribbean/All | Medium |

**MapWorkspaceTopNav Changes**:
```typescript
// New props
interface MapWorkspaceTopNavProps {
  workspaceLabel?: string;
  showRequestAccess?: boolean;
  region?: RegionFilter;              // NEW
  onRegionChange?: (region: RegionFilter) => void; // NEW
  showRegionFilter?: boolean;         // NEW
}
```

**SouveraMapWorkspace Changes**:
```typescript
// New state
const [currentRegion, setCurrentRegion] = useState<RegionFilter>(region);

// New handler
const handleRegionChange = useCallback((newRegion: RegionFilter) => {
  setSelectedIso3(null);
  setCurrentRegion(newRegion);
}, []);

// New conditional rendering
if (currentRegion === 'caribbean') {
  return <CaribbeanPlaceholder ... />;
}

// All Regions notice
{currentRegion === 'all' && <div>...</div>}
```

---

### New Files

| File | Purpose | Complexity |
|------|---------|------------|
| `apps/api-gateway/src/components/intelligence/CaribbeanPlaceholder.tsx` | Placeholder for Caribbean region | Low |

**Optional New File** (can be inline):
| File | Purpose | Complexity |
|------|---------|------------|
| `apps/api-gateway/src/components/intelligence/RegionFilterDropdown.tsx` | Reusable dropdown component | Low |

**Recommendation**: Start with inline dropdown in `MapWorkspaceTopNav`, extract to separate component if reused elsewhere.

---

### Unchanged Files

| File | Reason |
|------|--------|
| `apps/api-gateway/src/app/intelligence/map/page.tsx` | No changes needed — workspace handles region internally |
| `apps/api-gateway/src/app/intelligence/africa/page.tsx` | Uses `embedded={true}` — region filter automatically hidden |
| `apps/api-gateway/src/lib/market-coverage.ts` | Already has all utilities from Step 1 |
| `apps/api-gateway/src/components/intelligence/AfricaMapPanel.tsx` | Africa-specific by design, no changes needed |
| `apps/api-gateway/src/components/intelligence/CountryIntelligencePanel.tsx` | Works with any country data, no changes needed |

---

## 9. Risks and Mitigations

### Risk 1: Africa Map Behavior Regression

**Risk**: Changes to region handling break existing Africa map behavior.

**Likelihood**: Low  
**Impact**: High (breaks primary feature)

**Mitigation**:
- Default `currentRegion` to `'africa'` (preserves current behavior)
- Africa rendering path unchanged (same components, same data flow)
- Extensive QA on Africa route before/after implementation
- Visual regression testing with screenshots

**Verification**:
- Before/after comparison: `/intelligence/map` with region="africa"
- All Phase 2 acceptance criteria must still pass

---

### Risk 2: Caribbean Placeholder UX Perception

**Risk**: Placeholder feels incomplete or unprofessional, users think Caribbean is broken.

**Likelihood**: Medium  
**Impact**: Medium (perception issue, not functional)

**Mitigation**:
- Premium, executive-grade placeholder design (centered, clean, branded)
- Clear messaging: "being finalized" (not "unavailable" or "error")
- Actionable CTAs (switch to Africa, request access)
- Footer metadata consistent with main workspace
- Terminal aesthetic maintained

**Verification**:
- User testing feedback on placeholder messaging
- Compare against other product "coming soon" states

---

### Risk 3: State Desync on Region Change

**Risk**: Selected country persists incorrectly after region change, causing errors.

**Likelihood**: Medium  
**Impact**: Low (UI glitch, not data corruption)

**Mitigation**:
- Explicitly reset `selectedIso3` in `handleRegionChange`
- Test region switching with country selected
- Verify panel resets to Top 10 Economies

**Test Case**:
1. Select Nigeria on Africa map
2. Switch to Caribbean
3. Verify: Panel should show placeholder (no Nigeria reference)
4. Switch back to Africa
5. Verify: Panel shows Top 10 (not Nigeria)

---

### Risk 4: Mobile Layout Breaks with Dropdown

**Risk**: Region dropdown breaks mobile top nav layout (overflow, wrapping, etc.).

**Likelihood**: Low  
**Impact**: Medium (mobile UX degradation)

**Mitigation**:
- Compact dropdown design (space-efficient)
- Test on 375px, 390px, 412px, 768px viewports
- Responsive Tailwind classes (flex-col on mobile, flex-row on desktop)
- Hide less critical elements on mobile (already done for Request Access CTA)

**Test Viewports**:
- iPhone SE (375px)
- iPhone 14 (390px)
- Pixel 7 (412px)
- iPad (768px)

---

### Risk 5: Prohibited Language Introduction

**Risk**: New components include "live", "real-time", or other prohibited terms.

**Likelihood**: Low  
**Impact**: Low (language compliance issue)

**Mitigation**:
- Language audit after implementation (grep for prohibited terms)
- Use only approved labels from `DATA_STATUS_LABELS`
- Copy review before merge

**Prohibited Terms**:
- "Live"
- "real-time"
- "Supabase connected"
- "AfDEC Intelligence"
- "AfDEC Priority"
- "99." (accuracy percentages)
- "data nodes"

**Approved Terms**:
- "Curated Preview Data"
- "Source-Attributed Preview"
- "being finalized" (for coming soon states)

---

### Risk 6: API Fetch Behavior Change

**Risk**: Fetching `?region=caribbean` returns unexpected data or breaks API.

**Likelihood**: Low  
**Impact**: Low (API already supports region filtering)

**Mitigation**:
- API already handles region parameter (`/api/v1/countries?region=caribbean`)
- Data will return but not be rendered (placeholder shown instead)
- For "all", API returns Africa + Caribbean but map only renders Africa

**Verification**:
- Test API directly: `curl /api/v1/countries?region=caribbean`
- Verify 20 Caribbean countries returned
- Verify no out-of-scope countries (Europe, Asia, etc.)

---

## 10. Acceptance Criteria

### Functional Requirements

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC-1 | Region filter dropdown visible on `/intelligence/map` | Visual inspection |
| AC-2 | Region filter NOT visible on `/intelligence/africa` | Visual inspection |
| AC-3 | Africa selection shows Africa map (unchanged from Phase 2) | Manual test + screenshot comparison |
| AC-4 | Caribbean selection shows premium placeholder, NOT broken map | Manual test |
| AC-5 | All Regions shows Africa map + Caribbean coming soon notice | Manual test |
| AC-6 | Selecting Caribbean does NOT crash or error | Error-free rendering |
| AC-7 | Selecting All Regions does NOT show out-of-scope countries | Data verification (only Africa shown) |
| AC-8 | Region change resets selected country | Test with country selected |
| AC-9 | Workspace label updates with region change | Visual inspection |
| AC-10 | "Curated Preview Data" visible in all region states | Visual inspection |
| AC-11 | Mobile layout works with region filter | Mobile test (375px, 390px, 412px, 768px) |
| AC-12 | Caribbean placeholder shows "Switch to Africa" CTA | Manual test |
| AC-13 | Caribbean placeholder "Switch to Africa" CTA works | Click test |
| AC-14 | Dropdown keyboard navigable | Keyboard test (Tab, Enter, Arrows) |

### Language Compliance

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| LC-1 | No "Live" language | Grep audit: `rg -i "live" --glob "*.tsx" --glob "*.ts"` |
| LC-2 | No "real-time" language | Grep audit: `rg -i "real.time" --glob "*.tsx" --glob "*.ts"` |
| LC-3 | No "Supabase connected" language | Grep audit: `rg -i "supabase.*connected" --glob "*.tsx"` |
| LC-4 | "Curated Preview Data" label used | Visual inspection |
| LC-5 | Caribbean messaging: "being finalized" (not "broken" or "unavailable") | Copy review |

### Non-Regression (Phase 2 Behavior Preserved)

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| NR-1 | `/intelligence/map` Africa behavior unchanged | Before/after comparison |
| NR-2 | `/intelligence/africa` behavior unchanged | Before/after comparison |
| NR-3 | FDI locking works correctly | Tier-based test (Explorer vs Professional) |
| NR-4 | Sector limiting works correctly (when data exists) | Tier-based test |
| NR-5 | Top 10 Economies panel works | Manual test |
| NR-6 | Country selection from map works | Click test |
| NR-7 | Country selection from Top 10 list works | Click test |
| NR-8 | Mobile layout clean (no overflow) | Mobile test |
| NR-9 | Build passes | `npm run build` exit code 0 |
| NR-10 | Lint passes | `npx eslint` exit code 0 or warnings only |
| NR-11 | TypeScript compiles | `npx tsc --noEmit` exit code 0 |

### User Experience

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| UX-1 | Region filter dropdown is intuitive | User testing |
| UX-2 | Caribbean placeholder maintains premium aesthetic | Visual review |
| UX-3 | All Regions notice is non-intrusive | Visual review |
| UX-4 | Transitions between regions are smooth | Performance test |
| UX-5 | No layout shift when switching regions | Visual stability test |

---

## 11. Recommendation for Implementation

### Implementation Readiness

✅ **Step 2 implementation can begin.**

**Prerequisites Met**:
- ✅ Step 1 complete (region prop refinement)
- ✅ Design decisions documented
- ✅ Interim behavior defined
- ✅ Risk mitigation strategies in place
- ✅ Acceptance criteria defined

### Implementation Order (Recommended)

| Step | Task | Effort | Dependencies |
|------|------|--------|--------------|
| 1 | Create `CaribbeanPlaceholder` component | 1 hour | None |
| 2 | Update `MapWorkspaceTopNav` props and UI | 2 hours | None |
| 3 | Add region state and handler to `SouveraMapWorkspace` | 1 hour | Step 2 |
| 4 | Add conditional rendering logic (Caribbean/All) | 1 hour | Steps 1, 3 |
| 5 | Test all three region states | 1 hour | Steps 1-4 |
| 6 | Mobile polish and responsive testing | 1 hour | Steps 1-5 |
| 7 | QA verification (full acceptance criteria) | 1 hour | Steps 1-6 |

**Total Estimated Effort**: 8 hours

### Why Implement Now

**Reasons to proceed**:
1. Foundation is solid (Step 1 complete)
2. Design is clear (interim behavior defined)
3. Risks are mitigated (safe fallbacks)
4. User value is preserved (Africa unchanged)
5. Enables future steps (Step 3 query params, Step 4 Caribbean shell)

**What Step 2 enables**:
- ✅ User can explore region options
- ✅ Product team can gather feedback
- ✅ Africa remains fully functional
- ✅ Caribbean has premium placeholder
- ✅ All Regions shows partial value
- ✅ Foundation for Step 3 (query params)
- ✅ Foundation for Step 4 (Caribbean shell)

---

### Why NOT Hide Behind Prop

**Alternative Considered**: Implement filter behind `showRegionFilter={false}` by default, enable later.

**Rejected Because**:
- Delays user feedback unnecessarily
- Adds implementation complexity (two code paths to maintain)
- Interim placeholders provide clean UX
- Premium aesthetic is maintained
- No downside to early visibility

**Decision**: Region filter visible immediately with safe interim states.

---

## 12. Estimated Effort

### Effort Breakdown

| Task | Hours | Complexity |
|------|-------|------------|
| Create `CaribbeanPlaceholder` component | 1 | Low |
| Update `MapWorkspaceTopNav` (add dropdown, props) | 2 | Medium |
| Add region state to `SouveraMapWorkspace` | 1 | Low |
| Add conditional rendering logic | 1 | Low |
| Test all three region states | 1 | Low |
| Mobile polish and responsive testing | 1 | Low |
| QA verification (acceptance criteria) | 1 | Low |
| **Total** | **8 hours** | **Low-Medium** |

### Complexity Assessment

**Overall Complexity**: Low-Medium

**Reasons**:
- State management is straightforward (single region state)
- No complex data transformations
- Conditional rendering is simple (if/else logic)
- Existing utilities handle region logic
- No API changes required

**Potential Challenges**:
- Mobile dropdown layout (mitigated by compact design)
- Caribbean placeholder aesthetic (mitigated by clear design spec)
- Testing all three states (mitigated by clear acceptance criteria)

---

### Sprint Planning

**Recommended Sprint Structure** (assuming 2-week sprint):
- Day 1-2: Implementation (Steps 1-4)
- Day 3: Testing and mobile polish (Steps 5-6)
- Day 4: QA verification (Step 7)
- Day 5: Buffer for fixes and refinement

**Parallel Work**:
- Engineering: Step 2 implementation
- Design: Caribbean shell mockups (for Step 4)
- Product: User testing plan for region filter

---

## 13. Summary

Phase 3 Step 2 introduces a region filter UI to `/intelligence/map` with safe interim states. The Africa experience remains unchanged. Caribbean shows a premium placeholder. All Regions shows Africa with a notice that Caribbean is coming. The implementation is backward compatible and lays the foundation for query param support (Step 3) and Caribbean shell (Step 4).

### Key Design Decisions Preserved

1. ✅ Region filter visible immediately on `/intelligence/map`
2. ✅ `/intelligence/africa` does not show region filter (embedded mode)
3. ✅ Africa selection preserves current behavior (zero regression)
4. ✅ Caribbean selection shows premium placeholder (not broken map)
5. ✅ All Regions shows Africa map + notice
6. ✅ Region changes reset selected country
7. ✅ Query params reserved for Step 3
8. ✅ Caribbean SVG map not part of Step 2
9. ✅ No source-ingestion language changes
10. ✅ No "live data" or "real-time" language
11. ✅ "Curated Preview Data" remains visible

### What Step 2 Accomplishes

| Accomplishment | Benefit |
|----------------|---------|
| Region filter UI | Users can see and select regions |
| Africa unchanged | No regression to core feature |
| Caribbean placeholder | Premium UX without breaking |
| All Regions partial view | Shows value while Caribbean is built |
| Foundation for Step 3 | Query params can build on region state |
| Foundation for Step 4 | Caribbean shell can replace placeholder |

### Next Steps

**After Step 2 Implementation**:
1. QA verification (all acceptance criteria)
2. User testing (gather feedback on region filter)
3. Plan Step 3 (query param support)
4. Plan Step 4 (Caribbean shell implementation)

---

**Plan Status**: ✅ Complete — Ready for Implementation  
**Next Action**: Begin Step 2 implementation  
**Estimated Effort**: 8 hours  
**Expected Outcome**: Region filter live with safe interim states

---

## Related Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| Phase 3 Regional Expansion Plan | Full Phase 3 plan | `docs/execution/phase-3-regional-expansion-plan.md` |
| Phase 3 Step 1 Region Prop Refinement | Step 1 implementation | `docs/qa/phase-3-step-1-region-prop-refinement.md` |
| Phase 2 QA Report | Phase 2 status and exceptions | `docs/audits/phase-2-africa-workspace-embedding-qa.md` |
| Market Coverage Utilities | Region utilities reference | `apps/api-gateway/src/lib/market-coverage.ts` |
| Intelligence Route Architecture | Route hierarchy | `docs/architecture/intelligence-route-architecture.md` |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | May 2, 2026 | AI | Initial Step 2 planning document |

---

**End of Phase 3 Step 2 Region Filter UI Plan**
