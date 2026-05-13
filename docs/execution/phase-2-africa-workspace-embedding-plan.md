# Phase 2: Africa Workspace Embedding Plan

> **Owner:** Afronovation, Inc.  
> **Date:** April 30, 2026  
> **Status:** 📋 Ready for Approval  
> **Prerequisite:** Phase 1 QA Gate Passed  
> **Related:** `docs/design/souvera-map-workspace-enhancement-plan.md`

---

## Executive Summary

Phase 2 embeds the completed Souvera Map Workspace (from `/intelligence/map`) into the `/intelligence/africa` regional command center page. This replaces the legacy card grid + drawer experience with the executive-grade map + right-panel workspace, providing a unified and superior country exploration experience without duplication.

**Key Decisions:**
- **Replace** `RegionalMarketGrid` with embedded workspace (Option A selected)
- **Hide** workspace internal top nav to avoid duplication with page's `SouveraMegaNav`
- **Preserve** all Phase 1 behavior (entitlements, FDI locking, sector limits, Top 10 panel)
- **Maintain** standalone `/intelligence/map` as the canonical workspace product

**Scope:**
- `/intelligence/africa` page only
- Africa workspace only
- No Caribbean shell
- No region filter UI
- No API or database changes
- No source-ingestion language changes

**Outcome:**
- Single, consistent country exploration experience per regional page
- Executive-grade map + panel interaction embedded in command center
- Reduced code duplication
- Cleaner, more focused Africa page

---

## Current Page Assessment

### `/intelligence/africa` Structure

**File:** `apps/api-gateway/src/app/intelligence/africa/page.tsx`

| # | Section | Component | Purpose | Status |
|---|---------|-----------|---------|--------|
| 1 | Global Nav | `SouveraMegaNav` | Site-wide navigation | ✅ Keep |
| 2 | Hero | `RegionalHeroCommand` | Executive intro + metrics + CTAs | ✅ Keep |
| 3 | Corridors | `EconomicCorridorsGrid` | Five economic corridors | ✅ Keep |
| 4 | **Market Grid** | **`RegionalMarketGrid`** | **Card grid + drawer** | ⚠️ **Replace** |
| 5 | Sectors | `SectorLandscapeGrid` | Six sector cards | ✅ Keep |
| 6 | Context | `StrategicContextGrid` | "Why Africa Now" | ✅ Keep |
| 7 | Trust | `TrustSourceLayer` | Data sources credibility | ✅ Keep |
| 8 | CTA | `AccessCTABlock` | Final access CTA | ✅ Keep |
| 9 | Footer | `SouveraFooter` | Site footer | ✅ Keep |

### Issue with Current `RegionalMarketGrid`

**File:** `apps/api-gateway/src/components/regional/RegionalMarketGrid.tsx`

**Current Implementation:**
```tsx
export function RegionalMarketGrid({ region }: RegionalMarketGridProps) {
  return (
    <section id="markets" className="py-16 border-b border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Uses legacy IntelligenceMapClient */}
        <IntelligenceMapClient defaultRegion={region} />
      </div>
    </section>
  );
}
```

**What `IntelligenceMapClient` Renders:**
1. `PreviewDataBanner` (contains "real-time" language in legacy banner)
2. Card grid of countries
3. Country drawer that slides in from right
4. Basic country identity + metrics in drawer

**Problems:**
1. **Legacy experience:** Card grid + drawer is less engaging than map + panel
2. **Prohibited language:** `PreviewDataBanner` contains "real-time" and "Live" in context
3. **Duplicate effort:** Maintains two different country exploration UIs
4. **Weaker UX:** Drawer is less immersive than persistent panel with Top 10
5. **No map interaction:** Users can't click on map to explore
6. **Less executive-grade:** Grid cards lack the terminal aesthetic

---

## Option Analysis

### Option A: Replace `RegionalMarketGrid` with Embedded Workspace ✅ **SELECTED**

**Approach:**
- Remove `RegionalMarketGrid` section entirely
- Insert embedded `SouveraMapWorkspace` in its place
- Hide workspace internal top nav (use page's `SouveraMegaNav` instead)
- Preserve section ID `id="markets"` for hero scroll behavior

**Benefits:**
- ✅ Single, consistent country exploration experience
- ✅ Removes legacy `IntelligenceMapClient` with prohibited language
- ✅ Brings superior map + panel UX to Africa page
- ✅ Reduces code duplication
- ✅ Maintains executive-grade aesthetic throughout page
- ✅ Users get Top 10 Economies panel, map interaction, persistent country panel
- ✅ Cleaner, more focused page

**Considerations:**
- Slightly longer page due to map height
- Users who prefer card grid will adapt to map

**Verdict:** ✅ **Recommended** - Best user experience, removes legacy code

---

### Option B: Add Workspace Above `RegionalMarketGrid` ❌ **REJECTED**

**Approach:**
- Keep `RegionalMarketGrid` section
- Add new section above it with embedded workspace
- Users see both map workspace AND card grid

**Problems:**
- ❌ Duplicate country exploration experiences on same page
- ❌ Page becomes too long
- ❌ Confusing: "Do I use the map or the grid?"
- ❌ Maintains legacy code with prohibited language
- ❌ More code to maintain
- ❌ Violates "executive-grade and not too long" requirement

**Verdict:** ❌ **Rejected** - Creates duplication and confusion

---

### Option C: Keep Card Grid, Link to Map Page ❌ **REJECTED**

**Approach:**
- Keep `RegionalMarketGrid` as-is
- Add "Explore on Map" CTA that routes to `/intelligence/map?region=africa`

**Problems:**
- ❌ Doesn't embed workspace into Africa page
- ❌ Users must navigate away from Africa page
- ❌ Maintains legacy code with prohibited language
- ❌ Doesn't fulfill Phase 2 objective

**Verdict:** ❌ **Rejected** - Doesn't meet Phase 2 goals

---

## Selected Strategy: Option A

### Proposed Section Order (After Phase 2)

| # | Section | Component | Notes |
|---|---------|-----------|-------|
| 1 | Global Nav | `SouveraMegaNav` | Unchanged |
| 2 | Hero | `RegionalHeroCommand` | Unchanged |
| 3 | Corridors | `EconomicCorridorsGrid` | Unchanged |
| 4 | **Map Workspace** | **Embedded `SouveraMapWorkspace`** | **New** - Replaces `RegionalMarketGrid` |
| 5 | Sectors | `SectorLandscapeGrid` | Unchanged |
| 6 | Context | `StrategicContextGrid` | Unchanged |
| 7 | Trust | `TrustSourceLayer` | Unchanged |
| 8 | CTA | `AccessCTABlock` | Unchanged |
| 9 | Footer | `SouveraFooter` | Unchanged |

### Visual Flow

**Before (Current):**
```
┌─────────────────────────────────────┐
│ SouveraMegaNav                      │
├─────────────────────────────────────┤
│ Hero + Metrics + CTAs               │
├─────────────────────────────────────┤
│ Five Economic Corridors             │
├─────────────────────────────────────┤
│ Market Grid (cards)                 │ ← Legacy card grid
│ └→ Drawer (on country click)        │ ← Drawer slides in
├─────────────────────────────────────┤
│ Sector Landscape                    │
├─────────────────────────────────────┤
│ Strategic Context                   │
├─────────────────────────────────────┤
│ Trust & Sources                     │
├─────────────────────────────────────┤
│ Access CTA                          │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

**After (Phase 2):**
```
┌─────────────────────────────────────┐
│ SouveraMegaNav                      │
├─────────────────────────────────────┤
│ Hero + Metrics + CTAs               │
├─────────────────────────────────────┤
│ Five Economic Corridors             │
├─────────────────────────────────────┤
│ ┌─────────────────┬───────────────┐ │
│ │                 │               │ │
│ │  Africa Map     │  Country      │ │ ← Embedded workspace
│ │  (interactive)  │  Panel        │ │
│ │                 │  (persistent) │ │
│ └─────────────────┴───────────────┘ │
├─────────────────────────────────────┤
│ Sector Landscape                    │
├─────────────────────────────────────┤
│ Strategic Context                   │
├─────────────────────────────────────┤
│ Trust & Sources                     │
├─────────────────────────────────────┤
│ Access CTA                          │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

---

## Component Reuse Strategy

### Core Decision: Modify `SouveraMapWorkspace` with Optional Props

**Current `SouveraMapWorkspace` Props:**
```typescript
interface SouveraMapWorkspaceProps {
  region?: 'africa' | 'caribbean' | 'all';
  workspaceLabel?: string;
}
```

**Proposed Enhanced Props:**
```typescript
interface SouveraMapWorkspaceProps {
  region?: 'africa' | 'caribbean' | 'all';
  workspaceLabel?: string;
  showTopNav?: boolean;           // NEW - default true
  embedded?: boolean;             // NEW - default false
  className?: string;             // NEW - optional
}
```

### Prop Descriptions

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `region` | `'africa' \| 'caribbean' \| 'all'` | `'africa'` | Existing - which region to display |
| `workspaceLabel` | `string` | `'Africa Intelligence Terminal'` | Existing - workspace title |
| `showTopNav` | `boolean` | `true` | **New** - Show/hide `MapWorkspaceTopNav` |
| `embedded` | `boolean` | `false` | **New** - Embedded mode (affects spacing, borders) |
| `className` | `string` | `undefined` | **New** - Additional CSS classes |

### Usage Examples

**Standalone `/intelligence/map` (unchanged):**
```tsx
<SouveraMapWorkspace 
  region="africa" 
  workspaceLabel="Africa Intelligence Terminal"
  // showTopNav defaults to true
  // embedded defaults to false
/>
```

**Embedded in `/intelligence/africa` (new):**
```tsx
<SouveraMapWorkspace 
  region="africa" 
  workspaceLabel="Africa Intelligence Terminal"
  showTopNav={false}
  embedded={true}
/>
```

### Why This Approach?

1. **Single Component:** Maintain one `SouveraMapWorkspace` component
2. **Minimal Changes:** Only add conditional rendering for top nav
3. **Backward Compatible:** Defaults preserve current behavior
4. **Future-Proof:** `embedded` prop can control other aspects if needed
5. **No Duplication:** Avoid creating `EmbeddedSouveraMapWorkspace` variant

---

## Required `SouveraMapWorkspace` Changes

### File: `apps/api-gateway/src/components/intelligence/SouveraMapWorkspace.tsx`

### Change 1: Update Props Interface

**Current (lines 44-47):**
```typescript
interface SouveraMapWorkspaceProps {
  region?: 'africa' | 'caribbean' | 'all';
  workspaceLabel?: string;
}
```

**New:**
```typescript
interface SouveraMapWorkspaceProps {
  region?: 'africa' | 'caribbean' | 'all';
  workspaceLabel?: string;
  showTopNav?: boolean;           // Default true
  embedded?: boolean;             // Default false
  className?: string;
}
```

### Change 2: Update Component Signature

**Current (lines 49-52):**
```typescript
export function SouveraMapWorkspace({
  region = 'africa',
  workspaceLabel = 'Africa Intelligence Terminal',
}: SouveraMapWorkspaceProps) {
```

**New:**
```typescript
export function SouveraMapWorkspace({
  region = 'africa',
  workspaceLabel = 'Africa Intelligence Terminal',
  showTopNav = true,
  embedded = false,
  className,
}: SouveraMapWorkspaceProps) {
```

### Change 3: Conditional Top Nav Rendering

**Current (around line 165-167):**
```typescript
return (
  <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
    {/* Workspace Nav */}
    <MapWorkspaceTopNav workspaceLabel={workspaceLabel} />
```

**New:**
```typescript
return (
  <div className={`bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden ${className || ''}`}>
    {/* Workspace Nav - conditionally rendered */}
    {showTopNav && <MapWorkspaceTopNav workspaceLabel={workspaceLabel} />}
```

### Change 4: Embedded Mode Styling (Optional Enhancement)

**Consideration:** When `embedded={true}`, optionally adjust:
- Border radius (use `rounded-sm` instead of `rounded-xl` for integration)
- Border color (match page borders)
- Background (slightly different shade if needed)

**Implementation (optional):**
```typescript
<div className={`
  bg-zinc-950 
  ${embedded ? 'rounded-sm' : 'rounded-xl'} 
  border border-zinc-800 
  overflow-hidden 
  ${className || ''}
`}>
```

**Recommendation:** Start without embedded-specific styling changes. Only adjust if visual integration requires it after implementation.

---

## Embedded Workspace Behavior

### What Stays the Same ✅

| Feature | Behavior |
|---------|----------|
| **Map Rendering** | Full interactive Africa map with regional colors |
| **Top 10 Economies** | Default panel when no country selected |
| **Country Selection** | Click country on map or Top 10 row to populate panel |
| **Country Panel** | Full country intelligence with all sections |
| **FDI Locking** | Public/Explorer see lock, Professional+ see value |
| **Sector Limiting** | Public/Explorer see 1, Professional+ see up to 5 |
| **Entitlement Logic** | All tier-based access preserved |
| **Data Language** | "Curated Preview Data" throughout |
| **CTA Routing** | Routes to `/access/request-access` with query params |
| **Mobile Layout** | Stacks map above panel |
| **Footer Metadata** | Shows access tier, source attribution, Afronovation |

### What Changes ❌

| Feature | Old Behavior | New Behavior |
|---------|--------------|--------------|
| **Top Nav** | Always shown | Hidden when `showTopNav={false}` |
| **Section Context** | Standalone page workspace | Embedded section in regional page |
| **Navigation** | Uses own breadcrumb | Uses page's `SouveraMegaNav` |

### User Experience Flow

**User Journey on `/intelligence/africa`:**

1. **Lands on page** → Sees hero with metrics
2. **Scrolls down** → Sees five economic corridors
3. **Continues scrolling** → Encounters embedded workspace
4. **No country selected** → Sees "Top 10 Economies" panel
5. **Clicks country row** → Panel populates with country intelligence
6. **Views FDI metric:**
   - Public/Explorer: Sees lock icon + "Professional+" label
   - Professional+: Sees actual FDI value
7. **Views sectors:**
   - Public/Explorer: Sees 1 sector with teaser
   - Professional+: Sees up to 5 sectors with rationale
8. **Clicks CTA** → Routes to `/access/request-access?country={ISO3}&name={NAME}&source=map-workspace`
9. **Continues scrolling** → Sees sector landscape, context, etc.

---

## Files Likely to Change

### Modified Files (3)

| File | Change Type | Description |
|------|-------------|-------------|
| `apps/api-gateway/src/components/intelligence/SouveraMapWorkspace.tsx` | Minor - Props | Add `showTopNav`, `embedded`, `className` props |
| `apps/api-gateway/src/app/intelligence/africa/page.tsx` | Major - Section | Replace `RegionalMarketGrid` with embedded workspace |
| `apps/api-gateway/src/components/regional/RegionalMarketGrid.tsx` | Deprecation | Mark as deprecated (keep for Caribbean page until Phase 3) |

### Unchanged Files ✅

| File | Reason |
|------|--------|
| `apps/api-gateway/src/components/intelligence/MapWorkspaceTopNav.tsx` | No changes needed |
| `apps/api-gateway/src/components/intelligence/CountryIntelligencePanel.tsx` | No changes needed |
| `apps/api-gateway/src/components/intelligence/AfricaMapPanel.tsx` | No changes needed |
| `apps/api-gateway/src/components/intelligence/EntitledMetricCard.tsx` | No changes needed |
| `apps/api-gateway/src/components/intelligence/EntitledSectorList.tsx` | No changes needed |
| `apps/api-gateway/src/app/intelligence/map/page.tsx` | No changes - remains standalone |
| `apps/api-gateway/src/app/api/v1/countries/route.ts` | No API changes |
| `apps/api-gateway/src/app/api/v1/country-lite/route.ts` | No API changes |
| `packages/entitlements/index.ts` | No entitlement changes |

### Deprecated Files (1)

| File | Status | Reason |
|------|--------|--------|
| `apps/api-gateway/src/components/intelligence/IntelligenceMapClient.tsx` | Deprecated | Legacy card grid experience; keep for reference |

---

## Implementation Steps

### Step 1: Update `SouveraMapWorkspace` Component

**File:** `apps/api-gateway/src/components/intelligence/SouveraMapWorkspace.tsx`

**Actions:**
1. Add new props to interface: `showTopNav`, `embedded`, `className`
2. Add default values to component signature
3. Conditionally render `MapWorkspaceTopNav` based on `showTopNav` prop
4. Apply `className` prop to root div
5. Optionally apply `embedded`-specific styling if needed

**Expected Outcome:**
- Component accepts new props
- Top nav can be hidden
- No breaking changes to existing usage

**Verification:**
- TypeScript compiles without errors
- `/intelligence/map` still works (defaults preserve old behavior)

---

### Step 2: Update `/intelligence/africa` Page

**File:** `apps/api-gateway/src/app/intelligence/africa/page.tsx`

**Actions:**

**Current Section (lines 54-58):**
```tsx
{/* Market Intelligence Grid */}
<RegionalMarketGrid
  region="africa"
  title="Market Intelligence"
  description="All 54 African nations at a glance. Search, filter, and explore country profiles with GDP, population, and growth indicators."
/>
```

**New Section:**
```tsx
{/* Africa Map Workspace */}
<section id="markets" className="py-16 border-b border-zinc-800">
  <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
    <div className="mb-8">
      <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
        Africa
      </div>
      <h2
        className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        Explore Africa Markets
      </h2>
      <p className="text-lg text-zinc-400 max-w-3xl">
        Interactive map intelligence across 54 African nations. Select any country for detailed profiles, key metrics, and sector insights.
      </p>
    </div>

    <SouveraMapWorkspace 
      region="africa" 
      workspaceLabel="Africa Intelligence Terminal"
      showTopNav={false}
      embedded={true}
    />
  </div>
</section>
```

**Expected Outcome:**
- `RegionalMarketGrid` removed
- Embedded workspace section added in its place
- Section retains `id="markets"` for hero scroll behavior
- No top nav shown (uses page's `SouveraMegaNav`)

**Verification:**
- Hero "Explore Markets" CTA scrolls to workspace
- Workspace renders without top nav
- Page visually balanced

---

### Step 3: Mark `RegionalMarketGrid` as Deprecated

**File:** `apps/api-gateway/src/components/regional/RegionalMarketGrid.tsx`

**Actions:**
1. Add deprecation comment at top of file
2. Keep file for now (Caribbean page may still use it until Phase 3)

**Comment to Add:**
```typescript
/**
 * @deprecated
 * This component is deprecated in favor of embedded SouveraMapWorkspace.
 * - Africa page uses embedded workspace as of Phase 2
 * - Caribbean page may still use this until Phase 3
 * - Uses legacy IntelligenceMapClient with card grid + drawer
 * - Consider removing after all regional pages use embedded workspace
 */
```

**Expected Outcome:**
- File marked for future removal
- Developers aware of deprecation status
- No breaking changes (Caribbean page unaffected)

---

### Step 4: Verify Entitlement Behavior

**Actions:**
1. Test as Public user (logged out)
2. Test as Explorer user
3. Test as Professional user
4. Test as Business user
5. Test as Institutional user

**Verification Checklist:**

| Tier | FDI Display | Sector Count | Expected Result |
|------|-------------|--------------|-----------------|
| Public | 🔒 Locked | 1 | Lock icon shown, 1 sector with teaser only |
| Explorer | 🔒 Locked | 1 | Lock icon shown, 1 sector with teaser only |
| Professional | ✅ Visible | Up to 5 | FDI value shown, up to 5 sectors with rationale |
| Business | ✅ Visible | Up to 5 | FDI value shown, up to 5 sectors with rationale |
| Institutional | ✅ Visible | Up to 5 | FDI value shown, up to 5 sectors with rationale |

**Expected Outcome:**
- All tier-based access preserved
- No entitlement regressions

---

### Step 5: Verify Mobile Layout

**Actions:**
- Test on mobile widths: 375px, 390px, 412px, 768px
- Verify map and panel stack correctly
- Verify no horizontal overflow
- Verify CTA is full-width on mobile
- Verify footer metadata is centered and readable

**Expected Outcome:**
- Mobile layout clean and readable
- No regressions from Phase 1 mobile polish

---

### Step 6: Verify Page Visual Balance

**Actions:**
- View full page on desktop
- Scroll through all sections
- Verify workspace doesn't make page feel too long
- Verify visual hierarchy is maintained

**Expected Outcome:**
- Page flows naturally
- Workspace integrates cleanly
- Executive-grade aesthetic maintained

---

### Step 7: Build, Lint, Verify

**Actions:**
```bash
cd apps/api-gateway
npm run build
npx eslint src/components/intelligence/SouveraMapWorkspace.tsx --max-warnings=0
npx eslint src/app/intelligence/africa/page.tsx --max-warnings=0
```

**Expected Outcome:**
- Build passes
- Lint passes with 0 warnings
- No TypeScript errors

---

## Risks and Mitigations

### Risk 1: Page Becomes Too Long

**Risk:** Adding a full map workspace section makes the page feel overwhelming.

**Likelihood:** Low  
**Impact:** Medium

**Mitigation:**
- Workspace height is fixed (650-700px on desktop)
- Replaces previous card grid section (not adding new content)
- Other sections remain compact
- Natural scroll flow maintained

**Fallback:**
- If users report page is too long, consider collapsible/expandable workspace
- Add "Skip to Sectors" link

---

### Risk 2: Duplicate Navigation Confusion

**Risk:** Users confused by multiple navigation systems.

**Likelihood:** Very Low  
**Impact:** Low

**Mitigation:**
- Workspace top nav is hidden (`showTopNav={false}`)
- Only page's `SouveraMegaNav` is visible
- No breadcrumb duplication

**Verification:**
- Visual inspection confirms no duplicate nav
- User testing confirms clarity

---

### Risk 3: Mobile Performance

**Risk:** Large map SVG impacts mobile performance.

**Likelihood:** Low  
**Impact:** Medium

**Mitigation:**
- Map already tested in Phase 1 on mobile
- TopoJSON is cached
- No new performance concerns introduced

**Monitoring:**
- Monitor Core Web Vitals after deployment
- Watch for LCP regressions

---

### Risk 4: Breaking Standalone `/intelligence/map`

**Risk:** Changes to `SouveraMapWorkspace` break the standalone map page.

**Likelihood:** Very Low  
**Impact:** High

**Mitigation:**
- New props have safe defaults (`showTopNav={true}`, `embedded={false}`)
- Standalone page uses default props (no changes)
- Test both pages after implementation

**Verification:**
- Test `/intelligence/map` thoroughly
- Confirm top nav still shows
- Confirm behavior unchanged

---

### Risk 5: Entitlement Regression

**Risk:** Tier-based access breaks during embedding.

**Likelihood:** Very Low  
**Impact:** Critical

**Mitigation:**
- No changes to entitlement logic
- No changes to API routes
- Component behavior identical regardless of embedding
- Thorough tier-based testing

**Verification:**
- Run full Phase 1 QA Gate tests on embedded version
- Confirm FDI locking works
- Confirm sector limiting works

---

### Risk 6: Caribbean Page Uses `RegionalMarketGrid`

**Risk:** Marking `RegionalMarketGrid` as deprecated affects Caribbean page.

**Likelihood:** Low  
**Impact:** Low

**Mitigation:**
- File marked deprecated but NOT removed
- Caribbean page continues to function
- Phase 3 will handle Caribbean migration

**Action:**
- Do not remove `RegionalMarketGrid` in Phase 2
- Keep `IntelligenceMapClient` for now
- Remove in Phase 4 after all regions migrated

---

## Acceptance Criteria

### Functional Requirements ✅

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC-1 | `RegionalMarketGrid` section removed from Africa page | Code inspection |
| AC-2 | Embedded workspace renders in its place | Visual inspection |
| AC-3 | Workspace top nav is hidden | Visual inspection |
| AC-4 | Page's `SouveraMegaNav` is only nav visible | Visual inspection |
| AC-5 | Hero "Explore Markets" CTA scrolls to workspace | Manual test |
| AC-6 | Top 10 Economies panel works | Manual test |
| AC-7 | Country selection from map works | Manual test |
| AC-8 | Country selection from Top 10 list works | Manual test |
| AC-9 | FDI locked for Public/Explorer | Manual test with test users |
| AC-10 | FDI visible for Professional+ | Manual test with test users |
| AC-11 | 1 sector for Public/Explorer | Manual test with test users |
| AC-12 | Up to 5 sectors for Professional+ | Manual test with test users |
| AC-13 | CTA routes correctly | Manual test |
| AC-14 | Mobile layout stacks cleanly | Mobile test |
| AC-15 | No horizontal overflow on mobile | Mobile test |
| AC-16 | Footer metadata centered on mobile | Mobile test |
| AC-17 | Standalone `/intelligence/map` unchanged | Manual test |
| AC-18 | "Curated Preview Data" language preserved | Visual inspection |
| AC-19 | No prohibited language appears | Grep audit |
| AC-20 | Build passes | CI/CD |
| AC-21 | Lint passes with 0 warnings | CI/CD |

### Visual Quality ✅

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC-22 | Workspace integrates cleanly with page design | Visual review |
| AC-23 | Page visual hierarchy maintained | Visual review |
| AC-24 | Executive-grade aesthetic throughout | Visual review |
| AC-25 | Page doesn't feel too long | User feedback |
| AC-26 | Section transitions are smooth | Visual review |

### Performance ✅

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC-27 | Page load time acceptable | Lighthouse |
| AC-28 | LCP < 2.5s | Lighthouse |
| AC-29 | CLS < 0.1 | Lighthouse |
| AC-30 | No performance regressions | Lighthouse comparison |

---

## QA Checklist

### Pre-Implementation ✅

- [ ] Phase 1 QA Gate passed
- [ ] Test users provisioned (or provisioning plan ready)
- [ ] Plan reviewed and approved
- [ ] Implementation approach agreed upon

---

### During Implementation ✅

- [ ] `SouveraMapWorkspace` props updated
- [ ] TypeScript types correct
- [ ] `/intelligence/africa` page updated
- [ ] `RegionalMarketGrid` marked deprecated
- [ ] Build passes
- [ ] Lint passes (0 warnings)
- [ ] No TypeScript errors

---

### Post-Implementation Testing ✅

**Workspace Functionality:**
- [ ] Workspace renders on Africa page
- [ ] No workspace top nav visible
- [ ] Page `SouveraMegaNav` visible
- [ ] Map renders correctly
- [ ] Top 10 Economies panel shows by default
- [ ] Country selection from map works
- [ ] Country selection from Top 10 works
- [ ] Country panel populates correctly
- [ ] Panel sections all render (identity, metrics, sectors, blurb, CTA)

**Tier-Based Access (Test with actual provisioned users):**
- [ ] **Public (logged out):**
  - [ ] FDI shows lock icon + "Professional+" label
  - [ ] 1 sector shown with teaser only
- [ ] **Explorer:**
  - [ ] FDI shows lock icon + "Professional+" label
  - [ ] 1 sector shown with teaser only
- [ ] **Professional:**
  - [ ] FDI shows actual value
  - [ ] Up to 5 sectors shown with rationale
- [ ] **Business:**
  - [ ] FDI shows actual value
  - [ ] Up to 5 sectors shown with rationale
- [ ] **Institutional:**
  - [ ] FDI shows actual value
  - [ ] Up to 5 sectors shown with rationale

**Navigation & Routing:**
- [ ] Hero "Explore Markets" button scrolls to workspace
- [ ] Country CTA routes to `/access/request-access` with query params
- [ ] "Request Access" CTAs work throughout page

**Mobile (375px, 390px, 412px, 768px):**
- [ ] Map and panel stack vertically
- [ ] Map appears first, panel below
- [ ] No horizontal overflow
- [ ] CTA is full-width
- [ ] Footer metadata centered and readable
- [ ] Touch interactions work (country selection)
- [ ] Scroll behavior smooth

**Standalone `/intelligence/map` (Regression Test):**
- [ ] Page loads correctly
- [ ] Top nav IS visible (not hidden)
- [ ] Workspace renders correctly
- [ ] All Phase 1 features work
- [ ] No regressions

**Visual & Design:**
- [ ] Workspace integrates cleanly with page
- [ ] No duplicate navigation
- [ ] Section transitions smooth
- [ ] Executive-grade aesthetic maintained
- [ ] Page visual hierarchy clear
- [ ] Page doesn't feel too long

**Data & Language:**
- [ ] "Curated Preview Data" label visible
- [ ] Source attribution shown
- [ ] Afronovation attribution shown
- [ ] No prohibited language ("Live", "real-time", "Supabase connected")

**Performance:**
- [ ] Page load time acceptable
- [ ] Lighthouse LCP < 2.5s
- [ ] Lighthouse CLS < 0.1
- [ ] No console errors
- [ ] No console warnings

---

### Post-Deployment ✅

- [ ] Monitor Core Web Vitals
- [ ] Monitor user feedback
- [ ] Verify analytics tracking
- [ ] Check error logs for workspace-related issues

---

## Recommendation

### ✅ **APPROVED: Phase 2 Implementation Can Begin**

**Conditions Met:**
- ✅ Phase 1 QA Gate passed
- ✅ Clear strategy defined (Option A selected)
- ✅ Component reuse approach validated
- ✅ Risk mitigation strategies documented
- ✅ Acceptance criteria comprehensive
- ✅ QA checklist complete

**Prerequisites Before Implementation:**
1. **Plan Approval:** This document must be reviewed and approved
2. **Test Users:** Provisioned and verified (or ready to provision)
3. **Phase 1 Stable:** `/intelligence/map` confirmed production-ready

**Implementation Order:**
1. Step 1: Update `SouveraMapWorkspace` props
2. Step 2: Update `/intelligence/africa` page
3. Step 3: Mark `RegionalMarketGrid` deprecated
4. Step 4-7: Verification and testing

**Expected Effort:** 4-6 hours (low complexity)

**Expected Outcome:**
- Cleaner, more consistent Africa page
- Superior country exploration UX
- Removal of legacy code
- No entitlement regressions
- Production-ready for deployment

---

## Next Steps After Phase 2

### Phase 3 Candidates (Future)

| Phase | Feature | Complexity |
|-------|---------|------------|
| Phase 3A | Caribbean shell page (`/intelligence/caribbean`) | Low |
| Phase 3B | Caribbean map geometry integration | High |
| Phase 3C | Embed workspace into Caribbean page | Low |
| Phase 4 | Region filter UI on `/intelligence/map` | Medium |
| Phase 5 | "All Regions" combined view | Medium |
| Phase 6 | Remove deprecated `RegionalMarketGrid` | Low |

---

## Appendix A: Component Hierarchy

### After Phase 2

**`/intelligence/africa` Page:**
```
<SouveraMegaNav />
<RegionalHeroCommand />
<EconomicCorridorsGrid />
<section id="markets">
  <SouveraMapWorkspace showTopNav={false} embedded={true}>
    ├── [No MapWorkspaceTopNav - hidden]
    ├── <AfricaMapPanel>
    │   └── Interactive SVG map
    └── <CountryIntelligencePanel>
        ├── Top 10 Economies (default)
        ├── Country Identity (selected)
        ├── Metrics Grid (GDP, Growth, Pop, FDI)
        ├── Sectors (1 or 5)
        ├── Souvera Intelligence blurb
        └── CTA
  </SouveraMapWorkspace>
</section>
<SectorLandscapeGrid />
<StrategicContextGrid />
<TrustSourceLayer />
<AccessCTABlock />
<SouveraFooter />
```

**`/intelligence/map` Page (Unchanged):**
```
<SouveraMegaNav />
<Hero section />
<SouveraMapWorkspace>
  ├── <MapWorkspaceTopNav /> [SHOWN]
  ├── <AfricaMapPanel>
  │   └── Interactive SVG map
  └── <CountryIntelligencePanel>
      ├── Top 10 Economies (default)
      ├── Country Identity (selected)
      ├── Metrics Grid (GDP, Growth, Pop, FDI)
      ├── Sectors (1 or 5)
      ├── Souvera Intelligence blurb
      └── CTA
</SouveraMapWorkspace>
<Enhanced Access section />
<SouveraFooter />
```

---

## Appendix B: Deprecation Timeline

| Phase | Action | File(s) Affected |
|-------|--------|------------------|
| Phase 2 | Mark `RegionalMarketGrid` deprecated | `RegionalMarketGrid.tsx` |
| Phase 3C | Migrate Caribbean page to embedded workspace | `/intelligence/caribbean/page.tsx` |
| Phase 4 | Remove `RegionalMarketGrid` | `RegionalMarketGrid.tsx` (deleted) |
| Phase 4 | Remove `IntelligenceMapClient` | `IntelligenceMapClient.tsx` (deleted) |

---

## Appendix C: Related Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| Phase 1 QA Gate | QA validation before Phase 2 | `docs/audits/phase-1-map-workspace-qa-gate.md` |
| Map Workspace Enhancement Plan | Original design plan | `docs/design/souvera-map-workspace-enhancement-plan.md` |
| Route Architecture | Intelligence route hierarchy | `docs/architecture/intelligence-route-architecture.md` |
| Phase 1 Final Polish | Height fix implementation | `docs/qa/phase-1-map-workspace-final-polish-implementation.md` |
| Mobile Footer Polish | Mobile footer alignment | `docs/qa/phase-1-mobile-footer-polish.md` |

---

**Plan Completed:** April 30, 2026  
**Status:** 📋 Ready for Approval  
**Next Step:** Plan review → Implementation → QA → Deployment
