# Phase 3 Regional Expansion Plan

**Document ID**: PHASE3-REGIONAL-001  
**Version**: 1.0  
**Date**: May 2, 2026  
**Status**: Planning Complete — Ready for Implementation  
**Related**: Phase 2 QA Report, Intelligence Route Architecture, Map Workspace Enhancement Plan

---

## 1. Executive Summary

Phase 3 expands the Souvera Intelligence Terminal beyond the embedded Africa workspace to deliver a comprehensive regional intelligence experience. This phase introduces:

1. **Caribbean Intelligence Shell** — Premium regional command page without forcing SVG map
2. **Region Filter UI** — Toggle between Africa, Caribbean, and All Regions on `/intelligence/map`
3. **Query Param Support** — Deep-linking for region and selected country
4. **Enhanced Route Architecture** — Consistent navigation across all intelligence routes

### Key Deliverables

| Deliverable | Route | Description |
|-------------|-------|-------------|
| Caribbean Shell | `/intelligence/caribbean` | Enhanced regional command with market shell |
| Region Filter | `/intelligence/map` | Africa \| Caribbean \| All toggle |
| Query Params | `/intelligence/map` | `?region=africa&selected=NGA` support |
| Route Deep-Linking | All routes | URL state preservation |

### Implementation Approach

- **Caribbean**: Market shell first, SVG map deferred (Phase 3B/4)
- **Region Filter**: UI toggle with URL state sync
- **No SVG Caribbean Map**: Avoid weak/incomplete visual
- **Component Reuse**: Maximum reuse of existing workspace components

---

## 2. Current Status

### Phase 2 Completion Summary

| Route | Status | Description |
|-------|--------|-------------|
| `/intelligence/map` | ✅ Complete | Standalone Africa map workspace |
| `/intelligence/africa` | ✅ Complete | Embedded workspace, replaces RegionalMarketGrid |
| `/intelligence/caribbean` | 🔄 Existing | Legacy market grid + drawer pattern |

### Active Components

| Component | Location | Reuse Potential |
|-----------|----------|-----------------|
| `SouveraMapWorkspace` | `components/intelligence/` | **High** — add region prop refinement |
| `CountryIntelligencePanel` | `components/intelligence/` | **High** — already supports topEconomies |
| `EntitledMetricCard` | `components/intelligence/` | **High** — no changes needed |
| `EntitledSectorList` | `components/intelligence/` | **High** — no changes needed |
| `RegionalMarketGrid` | `components/regional/` | **Medium** — use for Caribbean shell |
| `IntelligenceMapClient` | `components/intelligence/` | **Medium** — fallback grid component |
| `MapWorkspaceTopNav` | `components/intelligence/` | **High** — add region toggle |

### Current Caribbean Page Structure

```
/intelligence/caribbean
├── SouveraMegaNav
├── RegionalHeroCommand (region="caribbean")
├── StrategicPositionDiagram
├── RegionalMarketGrid (region="caribbean") ← Grid + Drawer pattern
├── SectorLandscapeGrid
├── StrategicContextGrid
├── TrustSourceLayer
├── AccessCTABlock
└── SouveraFooter
```

---

## 3. Phase 2 QA Exception Summary

### Exception Status

**Phase 2 QA**: ✅ **PASS WITH EXCEPTION**

**Exception**: Sector visibility cannot be fully verified in UI due to data coverage gap.

### Exception Details

| Issue | Root Cause | Impact | Resolution |
|-------|------------|--------|------------|
| Sectors not displaying | `souvera_country_sectors` table empty | UI cannot verify tier-based sector limits | DATA-SEED-01 |
| FDI shows "Data pending" | FDI not in ingestion adapter | Expected behavior for Phase 4A gap | DATA-ING-02B |

### Does Exception Block Phase 3?

**No.** The exception is a **data coverage gap**, not a code bug:
- All API and entitlement logic is correct
- Frontend renders correctly when data exists
- Phase 3 can proceed in parallel with DATA-SEED-01

### Phase 3 Assumption

Phase 3 implementation assumes:
- Sector and FDI data gaps persist until Phase 4A
- UI will continue showing "Data pending" / "Sectors data pending"
- Entitlement logic is trusted based on code review

---

## 4. Phase 3 Scope

### In Scope

| Feature | Priority | Complexity |
|---------|----------|------------|
| Caribbean shell enhancement | P1 | Medium |
| Region filter UI | P1 | Medium |
| Query param support | P1 | Low |
| URL state preservation | P2 | Low |
| Mobile responsive polish | P2 | Low |

### Out of Scope

| Feature | Reason | Phase |
|---------|--------|-------|
| Caribbean SVG map | No suitable TopoJSON asset | Phase 3B/4 |
| Sector data seeding | Separate data track | DATA-SEED-01 |
| FDI ingestion | Separate ingestion track | DATA-ING-02B |
| Live data language | Blocked until Phase 4B | Future |
| Auth/RLS changes | Out of scope | N/A |

---

## 5. Caribbean Shell Plan

### 5.1 Design Approach

**Strategy**: Create a premium regional command experience without SVG map.

**Why No SVG Map**:
- Caribbean geography is dispersed (island nations)
- Single TopoJSON would require custom projection
- Map would feel sparse compared to Africa's compact continent
- Market shell provides equivalent utility for 20 territories

### 5.2 Proposed Section Order

```
/intelligence/caribbean (Enhanced)
├── SouveraMegaNav
├── RegionalHeroCommand (updated metrics/narrative)
├── StrategicPositionDiagram (keep)
├── CaribbeanMarketShell (NEW - replaces RegionalMarketGrid)
│   ├── Market cards with right-side panel
│   ├── CountryIntelligencePanel (reused)
│   ├── Search/filter capability
│   └── "Curated Preview Data" label
├── SectorLandscapeGrid (keep)
├── StrategicContextGrid (updated narrative)
├── TrustSourceLayer (keep)
├── AccessCTABlock (keep)
└── SouveraFooter
```

### 5.3 CaribbeanMarketShell Component

**Purpose**: Replace legacy `RegionalMarketGrid` with a premium shell experience.

**Layout**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Caribbean Markets                    [Search] [Curated Preview Data] │
├──────────────────────────────────┬──────────────────────────────┤
│ Market Cards (65%)               │ Intelligence Panel (35%)     │
│                                  │                              │
│ ┌───────────┐ ┌───────────┐     │ [Selected Country Panel]    │
│ │ Jamaica   │ │ Trinidad  │     │ or                          │
│ │ $16.4B    │ │ $27.1B    │     │ [Top Economies Default]     │
│ │ +2.8%     │ │ +1.5%     │     │                              │
│ └───────────┘ └───────────┘     │ - Flag + Name               │
│                                  │ - Region                     │
│ ┌───────────┐ ┌───────────┐     │ - GDP, Growth, Pop          │
│ │ Bahamas   │ │ Guyana    │     │ - FDI (tier-gated)          │
│ │ $12.8B    │ │ $14.7B    │     │ - Sectors (tier-gated)      │
│ └───────────┘ └───────────┘     │ - CTA                       │
│ ...                             │                              │
├──────────────────────────────────┴──────────────────────────────┤
│ Source: IMF · World Bank · UNCTAD              Afronovation, Inc. │
└─────────────────────────────────────────────────────────────────┘
```

**Behavior**:
- Default: Show "Top Caribbean Economies" in panel (sorted by GDP)
- Click card: Select country, update panel
- Panel: Reuse `CountryIntelligencePanel` or lightweight variant
- Search: Filter cards by name
- Entitlements: FDI locked for Explorer, visible for Professional+

### 5.4 Caribbean Narrative Updates

**RegionalHeroCommand** updates:
```typescript
<RegionalHeroCommand
  region="caribbean"
  eyebrow="Caribbean Intelligence"
  headline="Caribbean Intelligence Command."
  body="Strategic intelligence across 20 Caribbean markets and territories — your gateway for tourism, energy, nearshoring, CARICOM trade, and diaspora corridor opportunities."
  metrics={[
    { value: '20',   label: 'Territories' },
    { value: '$270B', label: 'Combined GDP' },
    { value: '44M',  label: 'Population' },
    { value: '5',    label: 'Key Sectors' },
  ]}
/>
```

**StrategicContextGrid** themes:
- Strategic Gateway positioning
- Nearshoring opportunity (US/Canada proximity)
- Energy transition (natural gas, renewable)
- CARICOM integration
- Tourism & services
- Diaspora corridors (UK, US, Canada remittances)

### 5.5 Mobile Layout

**Tablet (768px-1024px)**:
- Stack cards 2 per row
- Panel below cards

**Mobile (<768px)**:
- Stack cards 1 per row
- Panel below cards
- Full-width CTAs
- Search bar sticky or collapsible

---

## 6. Region Filter UI Plan

### 6.1 Filter Location

**Primary**: `MapWorkspaceTopNav` component

**Design Option A - Dropdown**:
```
┌────────────────────────────────────────────────────────────────────────┐
│ Souvera > [Africa Intelligence Terminal ▼]  [Curated Preview Data]  [Request Access] │
└────────────────────────────────────────────────────────────────────────┘
```

**Dropdown Options**:
- Africa Intelligence Terminal
- Caribbean Intelligence Terminal
- All Regions (Africa + Caribbean)

**Design Option B - Pill Toggle**:
```
┌────────────────────────────────────────────────────────────────────────┐
│ Souvera > [Africa] [Caribbean] [All Regions]  [Curated Preview Data]  [Request Access] │
└────────────────────────────────────────────────────────────────────────┘
```

**Recommended**: Dropdown for cleaner mobile experience.

### 6.2 Filter Behavior

| Selection | Displayed Markets | Map | Panel Default |
|-----------|-------------------|-----|---------------|
| Africa | 54 African countries | Africa SVG | Top 10 African Economies |
| Caribbean | 20 approved territories | Market shell (no map) | Top 10 Caribbean Economies |
| All Regions | 74 markets (Africa + Caribbean) | Africa map + Caribbean shell | Top 10 Overall |

### 6.3 "All Regions" Implementation

**Rule**: "All Regions" = Africa + Caribbean only (per market governance).

**Display Strategy**:
- Show Africa map by default
- Add "Caribbean Markets" section below map
- Or: Show combined market grid without map

**Recommended Approach for "All Regions" View**:
```
┌────────────────────────────────────────────────────────────┐
│ [Africa Map Panel]                                         │
│                                                            │
│ Map (left/top) + Intelligence Panel (right/bottom)        │
└────────────────────────────────────────────────────────────┘
│                                                            │
├────────────────────────────────────────────────────────────┤
│ Caribbean Markets                                          │
├────────────────────────────────────────────────────────────┤
│ [Market Cards...]                                          │
└────────────────────────────────────────────────────────────┘
```

### 6.4 Component Props Enhancement

**SouveraMapWorkspace**:
```typescript
interface SouveraMapWorkspaceProps {
  region?: 'africa' | 'caribbean' | 'all';  // Enhanced
  workspaceLabel?: string;
  showTopNav?: boolean;
  embedded?: boolean;
  className?: string;
  defaultSelectedIso3?: string;  // NEW - for query param hydration
  onRegionChange?: (region: RegionFilter) => void;  // NEW - for URL sync
  onCountrySelect?: (iso3: string) => void;  // NEW - for URL sync
}
```

**MapWorkspaceTopNav**:
```typescript
interface MapWorkspaceTopNavProps {
  workspaceLabel?: string;
  showRequestAccess?: boolean;
  region?: RegionFilter;  // NEW
  onRegionChange?: (region: RegionFilter) => void;  // NEW
  showRegionFilter?: boolean;  // NEW - hide on embedded views
}
```

---

## 7. Query Param / Deep-Linking Plan

### 7.1 Supported Query Parameters

| Param | Values | Default | Example |
|-------|--------|---------|---------|
| `region` | `africa`, `caribbean`, `all` | `all` | `?region=africa` |
| `selected` | ISO3 code | none | `?selected=NGA` |

### 7.2 URL Patterns

| URL | Behavior |
|-----|----------|
| `/intelligence/map` | All Regions, no selection |
| `/intelligence/map?region=africa` | Africa filter, no selection |
| `/intelligence/map?region=caribbean` | Caribbean filter, no selection |
| `/intelligence/map?region=all` | All Regions (explicit) |
| `/intelligence/map?selected=NGA` | All Regions, Nigeria selected |
| `/intelligence/map?region=africa&selected=KEN` | Africa, Kenya selected |
| `/intelligence/map?region=caribbean&selected=JAM` | Caribbean, Jamaica selected |

### 7.3 Validation Rules

**Region Validation**:
```typescript
function validateRegion(region: string | null): RegionFilter {
  if (!region) return 'all';
  const normalized = region.toLowerCase();
  if (['africa', 'caribbean', 'all'].includes(normalized)) {
    return normalized as RegionFilter;
  }
  return 'all';  // Invalid → fallback
}
```

**ISO3 Validation**:
```typescript
function validateSelectedIso3(iso3: string | null, region: RegionFilter): string | null {
  if (!iso3) return null;
  const normalized = iso3.toUpperCase();
  
  // Validate ISO3 is in scope for region
  if (region === 'africa' && !isAfricaIso3(normalized)) return null;
  if (region === 'caribbean' && !isApprovedCaribbeanMarket(normalized)) return null;
  if (region === 'all' && !isApprovedSouveraMarket({ iso3: normalized })) return null;
  
  return normalized;
}
```

### 7.4 URL State Sync

**On Region Change**:
```typescript
const handleRegionChange = (newRegion: RegionFilter) => {
  setRegion(newRegion);
  setSelectedIso3(null);  // Clear selection when region changes
  
  // Update URL without page reload
  const url = new URL(window.location.href);
  url.searchParams.set('region', newRegion);
  url.searchParams.delete('selected');
  window.history.pushState({}, '', url.toString());
};
```

**On Country Select**:
```typescript
const handleCountrySelect = (iso3: string) => {
  setSelectedIso3(iso3);
  
  // Update URL
  const url = new URL(window.location.href);
  url.searchParams.set('selected', iso3);
  window.history.pushState({}, '', url.toString());
};
```

### 7.5 Page Hydration

```typescript
// In /intelligence/map/page.tsx (or client component)
'use client';
import { useSearchParams } from 'next/navigation';

export default function MapPage() {
  const searchParams = useSearchParams();
  
  const initialRegion = validateRegion(searchParams.get('region'));
  const initialSelected = validateSelectedIso3(
    searchParams.get('selected'),
    initialRegion
  );
  
  return (
    <SouveraMapWorkspace
      region={initialRegion}
      defaultSelectedIso3={initialSelected}
      onRegionChange={handleRegionChange}
      onCountrySelect={handleCountrySelect}
    />
  );
}
```

---

## 8. Component Architecture

### 8.1 Reuse Assessment

| Component | Reuse in Phase 3 | Changes Needed |
|-----------|------------------|----------------|
| `SouveraMapWorkspace` | ✅ High | Add region prop refinement, query param hydration |
| `MapWorkspaceTopNav` | ✅ High | Add region filter toggle |
| `CountryIntelligencePanel` | ✅ High | No changes (already handles topEconomies) |
| `EntitledMetricCard` | ✅ High | No changes |
| `EntitledSectorList` | ✅ High | No changes |
| `AfricaMapPanel` | ✅ High | No changes (Africa-specific) |
| `RegionalMarketGrid` | ⚠️ Medium | Use for Caribbean, or replace with `CaribbeanMarketShell` |
| `IntelligenceMapClient` | ⚠️ Medium | Consider deprecation after Caribbean shell |

### 8.2 New Components

| Component | Purpose | Complexity |
|-----------|---------|------------|
| `CaribbeanMarketShell` | Market cards + panel layout for Caribbean | Medium |
| `RegionFilterToggle` | UI toggle for Africa/Caribbean/All | Low |

### 8.3 Component Dependencies

```
SouveraMapWorkspace
├── MapWorkspaceTopNav (region filter)
├── AfricaMapPanel (when region=africa or all)
├── CaribbeanMarketShell (when region=caribbean or all)
└── CountryIntelligencePanel (shared)
    ├── EntitledMetricCard (reused)
    └── EntitledSectorList (reused)
```

---

## 9. Route Behavior

### 9.1 Route Matrix

| Route | Region Filter | Map Display | Panel | Query Params |
|-------|---------------|-------------|-------|--------------|
| `/intelligence/map` | ✅ Yes (default: all) | Africa + Caribbean shell | Country/Top 10 | `?region=`, `?selected=` |
| `/intelligence/africa` | ❌ No (fixed: africa) | Africa embedded | Country/Top 10 | None |
| `/intelligence/caribbean` | ❌ No (fixed: caribbean) | Caribbean shell | Country/Top 10 | None |

### 9.2 Cross-Linking

| From | To | CTA | URL |
|------|----|----|-----|
| `/intelligence/africa` | `/intelligence/map` | "Explore on Interactive Map" | `/intelligence/map?region=africa` |
| `/intelligence/caribbean` | `/intelligence/map` | "Explore on Interactive Map" | `/intelligence/map?region=caribbean` |
| `/intelligence/map` | `/intelligence/africa` | "View Regional Overview" | `/intelligence/africa` |
| `/intelligence/map` | `/intelligence/caribbean` | "View Regional Overview" | `/intelligence/caribbean` |

### 9.3 CTA Routing

All country CTAs route to:
```
/access/request-access?country={ISO3}&name={COUNTRY_NAME}&source={SOURCE}
```

**Sources**:
- `map-workspace` - from `/intelligence/map`
- `africa-command` - from `/intelligence/africa`
- `caribbean-command` - from `/intelligence/caribbean`

---

## 10. Data Coverage Exceptions

### 10.1 Known Gaps

| Gap | Impact | Resolution | Phase |
|-----|--------|------------|-------|
| FDI missing | Shows "Data pending" | DATA-ING-02B | 4A |
| Sectors missing | Section hidden | DATA-SEED-01 | Parallel |
| Caribbean sector focus | Generic sectors | DATA-SEED-02 | Future |

### 10.2 UX Handling

| Metric | Explorer | Professional+ |
|--------|----------|---------------|
| FDI (missing) | 🔒 Professional+ | "Data pending" |
| Sectors (missing) | Hidden section | Hidden section |
| GDP (present) | $X.XB | $X.XB |
| Population (present) | X.XM | X.XM |

### 10.3 Accepted Behavior

- FDI shows "Data pending" for Professional+ (UX-DATA-01 implemented)
- Sectors hidden when empty (consider UX-DATA-02 enhancement)
- "Curated Preview Data" label remains active
- No "live data" or "real-time" language

---

## 11. Risks and Mitigations

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Region filter breaks mobile | Low | Medium | Test on 375px/414px viewports |
| Query param XSS | Low | High | Validate all params server-side |
| Caribbean shell layout issues | Medium | Medium | Reuse proven pattern from Africa |
| URL state desync | Low | Low | Use React Router or Next.js state |

### UX Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Region filter confusing | Medium | Medium | Clear labels, tooltip, help text |
| "All Regions" unclear | Medium | Low | Add subtitle: "Africa + Caribbean" |
| Caribbean feels incomplete | Medium | Medium | Strong narrative, premium shell |
| No map for Caribbean | High | Low | Market shell provides equivalent value |

### Data Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Caribbean GDP data gaps | Low | Medium | Use World Bank fallback |
| Caribbean sector data gaps | High | Low | Same gap as Africa (DATA-SEED-01) |
| FDI continues "Data pending" | High | Low | Accepted for Phase 3 |

---

## 12. Implementation Sequence

### 12.1 Recommended Order

| Step | Task | Effort | Dependencies |
|------|------|--------|--------------|
| 1 | Add `region` prop refinement to `SouveraMapWorkspace` | 2h | None |
| 2 | Add region filter to `MapWorkspaceTopNav` | 3h | Step 1 |
| 3 | Implement query param support in `/intelligence/map` | 2h | Step 2 |
| 4 | Create `CaribbeanMarketShell` component | 4h | None |
| 5 | Update `/intelligence/caribbean` page | 2h | Step 4 |
| 6 | Test and QA all routes | 3h | Steps 1-5 |
| 7 | Mobile polish | 2h | Step 6 |

**Total Estimated Effort**: 18 hours

### 12.2 Parallel Tracks

| Track | Tasks | Owner |
|-------|-------|-------|
| Phase 3 Core | Steps 1-7 | Engineering |
| Data Seeding | DATA-SEED-01, UX-DATA-02 | Data Team |
| Ingestion | DATA-ING-02B | Ingestion Team |

### 12.3 Quality Gates

**Before Implementation**:
- [ ] Plan approved by stakeholders
- [ ] Related documentation reviewed
- [ ] Phase 2 exception documented

**During Implementation**:
- [ ] Code review after each step
- [ ] Unit tests for validation functions
- [ ] Integration tests for query params

**After Implementation**:
- [ ] QA checklist completed
- [ ] Mobile testing on physical devices
- [ ] Cross-browser verification
- [ ] Documentation updated

---

## 13. Files Likely to Change

### Page Components

| File | Changes |
|------|---------|
| `apps/api-gateway/src/app/intelligence/map/page.tsx` | Query param hydration, region state |
| `apps/api-gateway/src/app/intelligence/caribbean/page.tsx` | Replace RegionalMarketGrid with CaribbeanMarketShell |

### Intelligence Components

| File | Changes |
|------|---------|
| `apps/api-gateway/src/components/intelligence/SouveraMapWorkspace.tsx` | Region prop, callbacks, query param support |
| `apps/api-gateway/src/components/intelligence/MapWorkspaceTopNav.tsx` | Region filter toggle UI |
| `apps/api-gateway/src/components/intelligence/CaribbeanMarketShell.tsx` | **NEW** - Market shell component |

### Regional Components

| File | Changes |
|------|---------|
| `apps/api-gateway/src/components/regional/RegionalMarketGrid.tsx` | Consider deprecation note |
| `apps/api-gateway/src/components/regional/StrategicContextGrid.tsx` | Caribbean narrative updates |

### Utilities

| File | Changes |
|------|---------|
| `apps/api-gateway/src/lib/market-coverage.ts` | Already complete (no changes) |
| `apps/api-gateway/src/lib/map-constants.ts` | May add Caribbean region colors (optional) |

### Documentation

| File | Changes |
|------|---------|
| `docs/execution/phase-3-regional-expansion-plan.md` | **NEW** - This document |
| `docs/qa/phase-3-qa-checklist.md` | **NEW** - QA verification checklist |

---

## 14. QA Checklist

### Pre-Implementation Verification

- [ ] Phase 2 QA exception documented
- [ ] Sector data gap classified as non-blocking
- [ ] FDI "Data pending" UX verified (UX-DATA-01)
- [ ] Caribbean country data available in API

### Region Filter QA

- [ ] Default view is "All Regions" (Africa + Caribbean)
- [ ] Filter shows exactly 54 African countries
- [ ] Filter shows exactly 20 Caribbean territories
- [ ] No Europe/Asia/Oceania/etc. appears
- [ ] Region label updates dynamically
- [ ] URL updates when filter changes
- [ ] Filter persists on page refresh

### Query Param QA

- [ ] `?region=africa` filters to Africa
- [ ] `?region=caribbean` filters to Caribbean
- [ ] `?region=all` shows all
- [ ] `?region=invalid` falls back to all
- [ ] `?selected=NGA` pre-selects Nigeria
- [ ] `?selected=INVALID` is ignored gracefully
- [ ] `?region=africa&selected=JAM` ignores Jamaica (wrong region)
- [ ] URL updates on country select

### Caribbean Shell QA

- [ ] Caribbean page loads without errors
- [ ] Market cards display 20 territories
- [ ] Clicking card updates panel
- [ ] Panel shows correct country data
- [ ] FDI locked for Explorer
- [ ] FDI shows "Data pending" for Professional+
- [ ] Search filters cards (if implemented)
- [ ] Mobile layout works

### Cross-Route QA

- [ ] `/intelligence/map` standalone works
- [ ] `/intelligence/africa` embedded works (unchanged)
- [ ] `/intelligence/caribbean` shell works
- [ ] CTAs route correctly
- [ ] No duplicate navigation
- [ ] Breadcrumbs accurate

### Mobile QA

- [ ] 375px viewport clean
- [ ] 414px viewport clean
- [ ] No horizontal overflow
- [ ] Touch targets adequate (44px minimum)
- [ ] Region filter accessible on mobile
- [ ] Panels stack correctly

### Language QA

- [ ] "Curated Preview Data" visible
- [ ] No "Live" language
- [ ] No "real-time" language
- [ ] No "Supabase connected"
- [ ] No "AfDEC" branding

### Accessibility QA

- [ ] Region filter keyboard navigable
- [ ] Map/cards keyboard accessible
- [ ] ARIA labels present
- [ ] Screen reader friendly
- [ ] Focus indicators visible

---

## 15. Acceptance Criteria

### Must Have (P0)

- [ ] `/intelligence/map` supports region filter (Africa | Caribbean | All)
- [ ] "All Regions" shows only Africa + Caribbean (74 markets total)
- [ ] `/intelligence/africa` remains unchanged (embedded workspace)
- [ ] `/intelligence/caribbean` has premium shell experience
- [ ] Query params work: `?region=` and `?selected=`
- [ ] Invalid params handled gracefully
- [ ] Mobile layout works on all routes
- [ ] "Curated Preview Data" label active
- [ ] No prohibited language appears

### Should Have (P1)

- [ ] URL updates when user changes region/selection
- [ ] Deep links can be shared
- [ ] Caribbean narrative updated (nearshoring, CARICOM, etc.)
- [ ] Cross-route CTAs work correctly
- [ ] Search in Caribbean shell (basic)

### Nice to Have (P2)

- [ ] Advanced search in Caribbean shell
- [ ] Keyboard navigation for filter
- [ ] Animated transitions between regions
- [ ] Browser back/forward works with URL state
- [ ] Favorites/bookmarking support

---

## 16. Recommendation

### Implementation Readiness

✅ **Phase 3 implementation can begin.**

**Reasons**:
1. Phase 2 QA passed (with documented exception)
2. Data coverage gaps are classified and non-blocking
3. Architecture is clear and documented
4. Component reuse strategy defined
5. Route behavior specified
6. QA checklist prepared

### Pre-Requisites Complete

| Prerequisite | Status |
|--------------|--------|
| Phase 2 QA | ✅ PASS WITH EXCEPTION |
| Intelligence Route Architecture | ✅ Documented |
| Market Coverage Utilities | ✅ Implemented |
| Data Coverage Gaps Documented | ✅ Sector + FDI classified |
| Component Assessment | ✅ Complete |

### Recommended Next Steps

1. **Review this plan** with stakeholders
2. **Approve implementation** if plan is accepted
3. **Begin Step 1**: Region prop refinement to `SouveraMapWorkspace`
4. **Parallel**: Continue DATA-SEED-01 and DATA-ING-02B

### Not Blocking Phase 3

The following are **NOT blockers** and can proceed in parallel:
- DATA-SEED-01 (Sector seeding)
- DATA-ING-02B (FDI ingestion)
- UX-DATA-02 (Sector data pending display)

---

## 17. Timeline Estimate

### Effort Breakdown

| Milestone | Effort | Calendar |
|-----------|--------|----------|
| Phase 3 Core Implementation | 18 hours | 3-4 days |
| Phase 3 QA | 4 hours | 1 day |
| Phase 3 Documentation | 2 hours | 0.5 day |
| **Total** | **24 hours** | **~1 week** |

### Sprint Planning

**Sprint Structure** (assuming 2-week sprint):
- Week 1: Implementation (Steps 1-5)
- Week 2: QA, polish, documentation

**Parallel Work**:
- Engineering: Phase 3 core
- Data Team: DATA-SEED-01 (sector seeding)
- Ingestion Team: DATA-ING-02B (FDI adapter)

---

## 18. Related Documentation

### Architecture

- [Intelligence Route Architecture](../architecture/intelligence-route-architecture.md) ✅
- [Market Coverage Utilities](../../apps/api-gateway/src/lib/market-coverage.ts) ✅

### Design

- [Map Workspace Enhancement Plan](../design/souvera-map-workspace-enhancement-plan.md) ✅

### QA & Audits

- [Phase 2 Africa Workspace QA Report](../audits/phase-2-africa-workspace-embedding-qa.md) ✅
- [Sector Visibility Debug Report](../audits/sector-visibility-debug.md) ✅
- [Sector Visibility Verification SQL](../qa/sector-visibility-verification.sql) ✅

### Execution Plans

- [Source Ingestion Activation Plan](../execution/source-ingestion-activation-plan.md) ✅

### Backlogs

- [Data Ingestion Backlog](../backlog/data-ingestion-backlog.md) ✅

### API Documentation

- `/api/v1/countries` - Country list endpoint with region filtering
- `/api/v1/country-lite` - Detailed country data with entitlements

---

## 19. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | May 2, 2026 | AI | Initial Phase 3 planning document |

---

**Plan Status**: ✅ Complete — Ready for Implementation  
**Next Action**: Review and approve for implementation  
**Implementation Start**: After approval

---

## Appendix: Key Architectural Decisions

### Decision 1: No Caribbean SVG Map in Phase 3

**Decision**: Use market shell instead of SVG map for Caribbean.

**Rationale**:
- Caribbean geography is dispersed (island nations)
- No suitable TopoJSON asset available
- Map would feel sparse vs. Africa's compact continent
- Market shell provides equivalent functionality

**Future**: Phase 3B/4 may add Caribbean map if suitable asset is created.

### Decision 2: "All Regions" = Africa + Caribbean Only

**Decision**: "All Regions" strictly means Africa + approved Caribbean markets (74 total).

**Rationale**:
- Souvera's mandate is Africa + Caribbean
- Market governance prevents global scope creep
- Clear boundary for data collection and licensing

**Enforcement**: Both API and frontend filter to approved markets only.

### Decision 3: Region Filter in Top Nav

**Decision**: Place region filter in `MapWorkspaceTopNav`, not as separate UI section.

**Rationale**:
- Follows terminal workspace pattern
- Clean, compact interface
- Mobile-friendly
- Avoids cluttering workspace

**Alternative Considered**: Standalone filter section above workspace (rejected as too prominent).

### Decision 4: Query Param Validation Strictness

**Decision**: Validate all query params, fail gracefully to defaults.

**Rationale**:
- Prevents XSS attacks
- Ensures data integrity
- Better UX (no errors, just sensible fallbacks)
- Allows sharing links without breaking

**Implementation**: Validate region and ISO3, fall back to safe defaults.
