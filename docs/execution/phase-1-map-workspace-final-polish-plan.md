# Phase 1 Map Workspace Final Polish Plan

> **Owner:** Afronovation, Inc.  
> **Date:** April 30, 2026  
> **Status:** 📋 Approved for Implementation  
> **Related:** `docs/design/souvera-map-workspace-enhancement-plan.md`

---

## Executive Summary

The Phase 1 map workspace implementation is functionally complete but requires final polish to optimize the right panel layout. The "Top 10 Economies" default panel currently has suboptimal vertical space usage, causing unnecessary scrolling and awkward spacing below the CTA button.

This plan addresses:
1. **Panel height propagation** - Fix flexbox height chain to make panel use full available height
2. **CTA anchoring** - Ensure "Request Full Access" button stays at bottom with no empty space below
3. **List visibility** - Maximize Top 10 list visibility without unnecessary scrolling
4. **Route architecture documentation** - Define long-term role of `/intelligence/map` in the intelligence product suite

---

## Current Issue Summary

### Problem Statement

When no country is selected on `/intelligence/map`, the right-side "Top 10 Economies" panel:
- Does not fully utilize available vertical space
- "Request Full Access" button appears too high in panel
- Unused empty space visible below CTA
- List scrolls unnecessarily even when viewport height would accommodate all content

### User Impact

The current layout weakens the executive visual polish and creates an unbalanced workspace appearance. The panel should use full available height with the CTA naturally anchored at the bottom.

---

## Root Cause Analysis

### Height Chain Investigation

**File:** `apps/api-gateway/src/components/intelligence/SouveraMapWorkspace.tsx`

**Lines 170-191:** Panel container configuration

```typescript
<div className="flex flex-col lg:flex-row">
  {/* Map Panel (Left) */}
  <div className="flex-1 lg:w-[65%] xl:w-[68%] min-h-[400px] lg:min-h-[650px] border-b lg:border-b-0 lg:border-r border-zinc-800">
    <AfricaMapPanel ... />
  </div>

  {/* Intelligence Panel (Right) */}
  <div className="lg:w-[35%] xl:w-[32%] min-h-[400px] lg:min-h-[650px] lg:max-h-[750px]">
    <CountryIntelligencePanel ... />
  </div>
</div>
```

**Issue Identified:**

1. **Parent Container (line 170):** Uses `flex flex-col lg:flex-row` but has **no explicit height**
2. **Panel Wrapper (line 182):** Uses `min-h-[650px]` and `max-h-[750px]` but **no `h-full`**
3. **Height Resolution:** The `CountryIntelligencePanel` uses `h-full` (100%), but when the parent only has `min-height`, the browser resolves height based on content rather than filling available space
4. **Flexbox Behavior:** Without a defined height on the flex row, `h-full` on children doesn't propagate correctly

### Content Measurements

**Top 10 Economies Panel Breakdown:**
- **Header:** ~72px (p-5 padding + title + subtitle)
- **List:** ~560px (10 rows × ~56px each: py-3.5 + content)
- **Footer:** ~100px (p-4 padding + source text + CTA button)
- **Total:** ~732px

**Available Height:**
- Desktop: `min-h-[650px]` to `max-h-[750px]`
- Tablet: `min-h-[400px]`
- Mobile: Stacked, content-based

### Why Scrolling Occurs Unnecessarily

- Panel container uses `min-h` and `max-h` without `h-full`
- Child `CountryIntelligencePanel` uses `h-full` but parent doesn't provide a computed height
- Browser falls back to content-based sizing
- `overflow-y-auto` on list area activates even when total content would fit
- Footer doesn't anchor to bottom because flexbox height isn't properly constrained

---

## Proposed Layout Fix

### Strategy

**Option A: Add Explicit Height to Flex Row (Recommended)**

Set a fixed height on the parent flex container to establish a height constraint:

```typescript
<div className="flex flex-col lg:flex-row lg:h-[650px] xl:h-[700px]">
```

This ensures:
- Both panels have a defined height to work within
- `h-full` on children resolves to the parent's fixed height
- Flexbox vertical distribution works correctly

**Option B: Use Full Height Chain**

Alternatively, ensure the height chain is unbroken:

```typescript
<div className="lg:w-[35%] xl:w-[32%] h-[500px] lg:h-full">
```

But this requires the parent to also use `h-full`, which may conflict with other layout requirements.

**Recommendation:** Use Option A (explicit height) for predictable behavior.

### Panel Internal Layout

**File:** `apps/api-gateway/src/components/intelligence/CountryIntelligencePanel.tsx`

**Current Structure (lines 159-170):**
```tsx
<div className="h-full bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
  <div className="p-5 border-b border-zinc-800 shrink-0">
    {/* Header */}
  </div>

  <div className="flex-1 overflow-y-auto">
    {/* List */}
  </div>

  <div className="p-4 border-t border-zinc-800 shrink-0">
    {/* Footer/CTA */}
  </div>
</div>
```

**This structure is already correct!** The fix is in the parent height propagation, not the panel itself.

### Verification Checklist

After implementing the height fix:

✅ Top 10 panel uses full available height  
✅ CTA is anchored at bottom  
✅ No empty space below CTA  
✅ List fills middle space efficiently  
✅ List scrolls only when content exceeds available space  
✅ Selected-country panel still works  
✅ Mobile layout remains clean  

---

## Selected-Country Panel Regression Risks

### Regression Test Scenarios

The selected-country panel (lines 335-486) uses the **same** `h-full flex flex-col` structure:

```336:396:apps/api-gateway/src/components/intelligence/CountryIntelligencePanel.tsx
    <div className="h-full bg-zinc-900/80 border border-zinc-700 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-zinc-800 shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Flag */}
            {data.country.flagUrl && (
              <Image
                src={data.country.flagUrl}
                alt={`${data.country.name} flag`}
                width={40}
                height={28}
                className="w-10 h-7 object-cover rounded-sm border border-zinc-700"
                unoptimized
              />
            )}
            <div>
              <h3 className="text-xl font-bold text-white">{data.country.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                {regionColor && (
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: regionColor.fill }}
                  />
                )}
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  {data.country.subregion || data.country.region}
                </span>
              </div>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-600 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick info */}
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          {data.country.capital && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{data.country.capital}</span>
            </div>
          )}
          {data.freshness.updatedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Updated {new Date(data.freshness.updatedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
```

**Risk:** The same height fix will affect the selected-country panel. Must verify:
- Header renders correctly
- Scrollable content area fills middle space
- CTA stays at bottom
- All sections (metrics, sectors, Souvera Intelligence blurb) remain visible

**Mitigation:** The selected-country panel has more content than Top 10, so it will naturally scroll. The fix should improve its layout as well.

---

## Responsive Behavior Plan

### Desktop (≥1024px)

- Parent flex row: `lg:h-[650px] xl:h-[700px]`
- Map panel: 65-68% width, full height
- Intelligence panel: 32-35% width, full height
- Top 10 list: Visible without scrolling (10 rows fit in ~650-700px)
- CTA: Anchored at bottom

### Tablet (768px - 1023px)

- Parent flex row: `h-[600px]`
- Map and panel side-by-side (50/50 or 60/40)
- Top 10 list: May require light scrolling
- CTA: Anchored at bottom

### Mobile (<768px)

- Stack vertically: map first, panel below
- Panel: `h-[500px]` minimum
- Top 10 list: Scrollable if needed
- CTA: Full-width, anchored at bottom
- No horizontal overflow

---

## Route Architecture Documentation

### Long-Term Route Hierarchy

| Route | Role | Status |
|-------|------|--------|
| `/intelligence` | Executive intelligence landing page with navigation to all intelligence products | ✅ Live |
| `/intelligence/map` | **Unified Souvera Intelligence Map Workspace** - primary interactive map experience | ✅ Phase 1 Complete |
| `/intelligence/africa` | Africa Regional Command Center - curated Africa-focused intelligence dashboard | 🔄 Phase 2 |
| `/intelligence/caribbean` | Caribbean Regional Command Center - curated Caribbean-focused intelligence dashboard | 📋 Future |
| `/intelligence/compare` | Side-by-side country comparison tool | ✅ Live |

### Intelligence Map Workspace Architecture

**Route:** `/intelligence/map`

**Purpose:**
- Canonical interactive map experience for Souvera Intelligence
- Primary workspace for geographic exploration and country selection
- Supports multiple region views (Africa, Caribbean, All)

**Long-Term Vision:**
- Phase 1: Africa map workspace (current)
- Phase 2: Region filter toggle (Africa | Caribbean | All)
- Phase 3: Caribbean map geometry integration
- Phase 4: All Regions view (Africa + Caribbean combined)

**Relationship to Regional Pages:**

```
/intelligence (landing)
├── /intelligence/map (workspace - canonical map experience)
├── /intelligence/africa (command center - may embed/link to workspace)
├── /intelligence/caribbean (command center - may embed/link to workspace)
└── /intelligence/compare (comparison tool)
```

**Key Principles:**
1. `/intelligence/map` **remains** after regional pages are enhanced
2. Regional pages are **curated command centers** with charts, summaries, and narratives
3. Map workspace is the **interactive exploration tool**
4. Regional pages may **embed the workspace** or **link to it**, but do not replace it
5. "All Regions" means **Africa + Caribbean only** (approved Souvera market scope)

### Future Evolution

**Phase 2+:**
- Add region filter UI to `/intelligence/map`
- Support `?region=africa`, `?region=caribbean`, `?region=all` query params
- Dynamically load appropriate map geometry (Africa TopoJSON, Caribbean TopoJSON, or combined)
- Update workspace label based on selected region
- Maintain same panel structure and behavior across all regions

---

## Files Likely to Change

### Modified Files

| File | Change | Risk |
|------|--------|------|
| `apps/api-gateway/src/components/intelligence/SouveraMapWorkspace.tsx` | Add explicit height to flex row container (line 170), update panel wrapper (line 182) | Low - Isolated layout change |
| `apps/api-gateway/src/components/intelligence/CountryIntelligencePanel.tsx` | Potentially adjust padding/margins if height fix causes overflow | Low - Minor tweaks only |

### Created Files

| File | Purpose |
|------|---------|
| `docs/architecture/intelligence-route-architecture.md` | Formal documentation of route hierarchy and long-term vision |

---

## Acceptance Criteria

### Functional Requirements

✅ **AC-1:** Top 10 Economies panel uses full available panel height (650-700px on desktop)  
✅ **AC-2:** "Request Full Access" CTA is anchored to bottom of panel  
✅ **AC-3:** No awkward unused space below CTA on normal desktop viewports  
✅ **AC-4:** Ranked list (10 rows) is visible without unnecessary scrolling when viewport height allows  
✅ **AC-5:** Selected-country panel still works correctly with all sections visible  
✅ **AC-6:** Mobile layout remains clean (stacked, full-width CTA, no horizontal overflow)  
✅ **AC-7:** No new unsupported language ("Live", "real-time", "Supabase connected")  
✅ **AC-8:** No AfDEC branding  
✅ **AC-9:** `/intelligence/map` route purpose is documented in `docs/architecture/intelligence-route-architecture.md`  

### Visual Quality

✅ **AC-10:** Panel has balanced proportions (header:list:footer ratio is visually pleasing)  
✅ **AC-11:** List scrollbar only appears when content truly exceeds available space  
✅ **AC-12:** CTA button has proper spacing from list area (neither too close nor too far)  
✅ **AC-13:** Executive premium aesthetic maintained  

### Regression Prevention

✅ **AC-14:** Selected-country panel header renders correctly  
✅ **AC-15:** Country metrics grid displays properly  
✅ **AC-16:** FDI locking works (Explorer sees locked, Professional+ sees value)  
✅ **AC-17:** Sector limiting works (Explorer sees 1, Professional+ sees up to 5)  
✅ **AC-18:** Country CTA routes to correct URL with query params  

---

## Implementation Steps

### Step 1: Add Explicit Height to Workspace Container

**File:** `apps/api-gateway/src/components/intelligence/SouveraMapWorkspace.tsx`

**Current (line 170):**
```tsx
<div className="flex flex-col lg:flex-row">
```

**Updated:**
```tsx
<div className="flex flex-col lg:flex-row lg:h-[650px] xl:h-[700px]">
```

### Step 2: Update Panel Wrapper Height

**File:** `apps/api-gateway/src/components/intelligence/SouveraMapWorkspace.tsx`

**Current (line 182):**
```tsx
<div className="lg:w-[35%] xl:w-[32%] min-h-[400px] lg:min-h-[650px] lg:max-h-[750px]">
```

**Updated:**
```tsx
<div className="lg:w-[35%] xl:w-[32%] min-h-[400px] lg:h-full">
```

**Rationale:** Remove `min-h` and `max-h` on desktop, use `h-full` to fill the parent's fixed height.

### Step 3: Verify Panel Internal Layout

**File:** `apps/api-gateway/src/components/intelligence/CountryIntelligencePanel.tsx`

**No changes needed** - The panel already uses:
- Root: `h-full flex flex-col`
- Header: `shrink-0`
- List: `flex-1 overflow-y-auto`
- Footer: `shrink-0`

This structure is correct and will benefit from the parent height fix.

### Step 4: Create Route Architecture Documentation

**File:** `docs/architecture/intelligence-route-architecture.md`

Include:
- Route hierarchy table
- Route roles and purposes
- Long-term vision for `/intelligence/map`
- Relationship between map workspace and regional pages
- Phase roadmap
- Key principles

### Step 5: Verification

Run:
```bash
cd apps/api-gateway
npm run build
npx eslint src/components/intelligence/*.tsx --max-warnings=0
```

Verify:
- Build passes
- Lint passes
- No prohibited terms in changed files
- `/intelligence/map` default state shows Top 10 with CTA at bottom
- Selected-country panel works correctly
- Mobile layout remains clean

---

## Known Limitations

### Current Phase 1 Scope

- **Region:** Africa only (no Caribbean map yet)
- **Data Status:** "Curated Preview Data" (no live/real-time claims)
- **Map Geometry:** Single fixed Africa TopoJSON
- **Region Filter:** Not yet implemented

### Not Implemented

- Phase 2: Region filter UI
- Caribbean map geometry
- "All Regions" combined view
- Query param support for `?region=`
- Dynamic workspace label based on region
- `/intelligence/caribbean` shell page
- Embedding workspace into `/intelligence/africa`

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Selected-country panel breaks | Low | High | Test all country selection scenarios, verify scrolling |
| Mobile layout breaks | Low | Medium | Test stacked layout on mobile viewport, verify no horizontal overflow |
| Height fix causes unwanted scrolling | Medium | Low | Use `min-h-0` on flex-1 elements if needed to prevent overflow |
| CTA overlaps content on small viewports | Low | Medium | Keep `min-h-[400px]` on mobile to ensure minimum space |

---

## Recommendation for Phase 2

**Status:** ✅ Ready to begin Phase 2 planning after final polish verification

**Phase 2 Candidate Tasks:**
1. Embed map workspace into `/intelligence/africa` page
2. Add region filter toggle to `/intelligence/map`
3. Create `/intelligence/caribbean` shell page
4. Design Caribbean map geometry integration plan
5. Plan "All Regions" combined view

**Prerequisite:** Complete Phase 1 final polish verification and confirm:
- Top 10 panel layout is production-ready
- Selected-country panel works across all test scenarios
- Mobile responsiveness is verified on physical devices
- Route architecture is documented and approved

---

## Notes

- All changes are isolated to layout/styling (no API or entitlement changes)
- No database schema changes required
- No breaking changes to existing functionality
- "Curated Preview Data" language preserved
- Security verified: no credentials, no password logging
- Test user provisioning system already in place (see `docs/qa/test-users-provisioning.md`)

---

**Plan approved:** April 30, 2026  
**Ready for:** Implementation  
**Estimated effort:** 1-2 hours (low complexity)  
**Status:** 📋 Approved
