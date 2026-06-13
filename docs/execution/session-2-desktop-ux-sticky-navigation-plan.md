# Session 2: Desktop UX & Sticky Navigation Enhancement Plan

**Date**: May 13, 2026  
**Status**: Planning  
**Goal**: Address desktop empty space issue and implement smart sticky navigation for Bloomberg-grade UX

---

## 1. Current Issues

### Issue A: Desktop Empty Space
**Problem**: Cards in Overview Tab are full-width, leaving significant empty space on the right side in desktop view (screens > 1280px).

**Current Layout** (`OverviewTabV2.tsx`):
```
┌─────────────────────────────────────────────────────────┐
│  Country Snapshot Card                     [empty space]│
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Economic Momentum Card                    [empty space]│
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Why Now Card                              [empty space]│
└─────────────────────────────────────────────────────────┘
```

**Root Cause**: Using `space-y-5` vertical stacking with no horizontal layout strategy.

---

### Issue B: Missing Sticky Navigation
**Problem**: User expects country name and section name to remain visible on scroll, with smart show/hide behavior.

**Current State**:
- Tab bar (Overview, Economy, Sectors, etc.) is sticky ✓
- Country header (flag, name, signal) is NOT sticky ✗
- No scroll-based visibility controls ✗
- No compact header state ✗

**Expected Behavior** (Bloomberg Terminal Style):
1. **Initial state**: Full country header visible
2. **On scroll down**: Country header compacts and sticks to top
3. **On scroll up**: Country header expands back to full view
4. **Current section indicator**: Show which section user is viewing within active tab

---

## 2. Proposed Solutions

### Solution A: 2-Column Desktop Layout with Contextual Sidebar

**Strategy**: Transform Overview Tab into a responsive 2-column layout for desktop (≥1280px).

#### New Desktop Layout (≥1280px):
```
┌────────────────────────────────────┬─────────────────────┐
│  Country Snapshot Card             │  Quick Stats        │
│                                    │  • GDP: $575B       │
│                                    │  • Population: 220M │
│                                    │  • Signal: HIGH     │
├────────────────────────────────────┤                     │
│  Economic Momentum Card            │                     │
│                                    ├─────────────────────┤
│                                    │  Market Access      │
│                                    │  🇺🇸 AGOA          │
├────────────────────────────────────┤  🌍 AfCFTA         │
│  Why Now Card                      │  🇳🇬 ECOWAS       │
│  (3 key points)                    │                     │
│                                    ├─────────────────────┤
│                                    │  Related Actions    │
├────────────────────────────────────┤  • Export Card      │
│  Market Access Card                │  • Compare          │
│  (AGOA-focused, full-width)        │  • View Full Report │
└────────────────────────────────────┴─────────────────────┘
```

#### Responsive Behavior:
- **Mobile (< 768px)**: Single column (current behavior) ✓
- **Tablet (768px - 1279px)**: Single column with wider cards
- **Desktop (≥1280px)**: 2-column layout with sidebar
- **Large Desktop (≥1536px)**: 2-column with wider sidebar

#### Implementation Details:
1. **Main Content Column**: 65% width (lg:col-span-2)
   - Country Snapshot Card
   - Economic Momentum Card
   - Why Now Card
   - Market Access Card (full-width at bottom)

2. **Contextual Sidebar**: 35% width (lg:col-span-1)
   - **Quick Stats Widget**: GDP, Population, Signal (sticky)
   - **Market Access Summary**: AGOA, AfCFTA, ECOWAS badges
   - **Related Actions**: Export, Compare, Reports
   - **Data Sources**: Citations and freshness

3. **CSS Grid Implementation**:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Main Content: 2 columns on desktop */}
  <div className="lg:col-span-2 space-y-5">
    <CountrySnapshotCard />
    <EconomicMomentumCard />
    <WhyNowCard />
  </div>
  
  {/* Sidebar: 1 column, sticky on desktop */}
  <div className="lg:col-span-1">
    <div className="lg:sticky lg:top-24 space-y-4">
      <QuickStatsWidget />
      <MarketAccessSummary />
      <RelatedActions />
    </div>
  </div>
  
  {/* Full-width Market Access Card */}
  <div className="lg:col-span-3">
    <MarketAccessCard />
  </div>
</div>
```

---

### Solution B: Smart Sticky Navigation with Scroll Behavior

**Strategy**: Implement a 3-state sticky header system with scroll-direction detection.

#### 3-State Header System:

**State 1: Full Header (Initial/Scroll Up)**
```
┌─────────────────────────────────────────────┐
│  🇳🇬 Nigeria              [HIGH GROWTH ●]   │
│  Sub-Saharan Africa • Capital: Abuja        │
│  📅 Updated May 13, 2026 • World Bank, IMF  │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  [Overview] [Economy] [Sectors] [...]        │ ← Sticky Tab Bar
└─────────────────────────────────────────────┘
```

**State 2: Compact Header (Scroll Down)**
```
┌─────────────────────────────────────────────┐
│  🇳🇬 Nigeria › Overview        [HIGH ●]     │ ← Compact, Sticky (Integrated Breadcrumb)
├─────────────────────────────────────────────┤
│  [Overview] [Economy] [Sectors] [...]        │ ← Sticky Tab Bar
└─────────────────────────────────────────────┘
```
*Note: Breadcrumb merges into country name for space efficiency*

**State 3: Hidden Header (Deep Scroll Down)**
```
┌─────────────────────────────────────────────┐
│  [Overview] [Economy] [Sectors] [...]        │ ← Only Tab Bar
└─────────────────────────────────────────────┘
```

#### Scroll Behavior Logic:
1. **Scroll Position = 0**: Show full header (State 1)
2. **Scroll Down > 100px**: Transition to compact header (State 2)
3. **Scroll Down > 300px**: Hide compact header, show only tab bar (State 3)
4. **Scroll Up (any amount)**: Show compact header immediately (State 2)
5. **Scroll Up to top**: Restore full header (State 1)

#### Implementation Strategy:

**1. Scroll Detection Hook** (`useScrollDirection.ts`):
```typescript
export function useScrollDirection() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }
      
      setScrollY(currentScrollY);
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return { scrollY, scrollDirection };
}
```

**2. Update `CountryIntelligencePanelV2.tsx`**:
```typescript
const { scrollY, scrollDirection } = useScrollDirection();

// Determine header state
const headerState = 
  scrollY === 0 ? 'full' :
  scrollY < 300 && scrollDirection === 'down' ? 'compact' :
  scrollY >= 300 && scrollDirection === 'down' ? 'hidden' :
  'compact'; // scrollDirection === 'up'

return (
  <div className="bg-zinc-950">
    {/* Sticky Header Container */}
    <div className={`
      sticky top-0 z-50 transition-all duration-300
      ${headerState === 'hidden' ? '-translate-y-16' : 'translate-y-0'}
    `}>
      {/* Country Header - Conditional Render */}
      {headerState !== 'hidden' && (
        <CountryHeaderBar
          country={data.country}
          signal={data.signal}
          freshness={data.freshness}
          compact={headerState === 'compact'}
          currentSection={activeTab}
        />
      )}
      
      {/* Tab Bar - Always Visible */}
      <TabBar ... />
    </div>
    
    {/* Content */}
    ...
  </div>
);
```

**3. Update `CountryHeaderBar.tsx`** (add `compact` prop):
```typescript
interface CountryHeaderBarProps {
  // ... existing props
  compact?: boolean;
  currentSection?: string;
}

export function CountryHeaderBar({ compact, currentSection, ... }) {
  if (compact) {
    return (
      <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-2 flex items-center justify-between">
        {/* Left: Flag + Name + Current Section */}
        <div className="flex items-center gap-3">
          <Image src={country.flagUrl} width={24} height={16} ... />
          <span className="text-lg font-bold text-white">{country.name}</span>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <span className="text-sm text-zinc-400">{currentSection}</span>
        </div>
        
        {/* Right: Signal Badge (Compact) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-400">{signal.level}</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>
    );
  }
  
  // Full header (existing implementation)
  return ( ... );
}
```

---

## 3. Additional Enhancements

### A. Section Progress Indicator
**Feature**: Show scroll progress within current tab (Bloomberg Terminal has this).

```tsx
<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800">
  <div 
    className="h-full bg-blue-500 transition-all duration-150"
    style={{ width: `${scrollProgress}%` }}
  />
</div>
```

### B. Quick Jump Menu (Desktop Only)
**Feature**: Floating "On This Page" menu for long tabs (Economy, Why Now).

```tsx
<div className="hidden xl:block fixed right-8 top-32 w-48">
  <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3">
    <p className="text-xs font-bold text-zinc-500 uppercase mb-2">On This Page</p>
    <nav className="space-y-1 text-xs">
      <a href="#gdp" className="text-zinc-400 hover:text-white">GDP Analysis</a>
      <a href="#growth" className="text-zinc-400 hover:text-white">Growth Forecast</a>
      <a href="#fx" className="text-zinc-400 hover:text-white">FX Rate</a>
    </nav>
  </div>
</div>
```

### C. Export All Cards (Desktop Action)
**Feature**: Batch export all cards in current tab as PNG (Professional+).

```tsx
<button className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-sm">
  <Download className="w-3 h-3" />
  Export All Cards
</button>
```

---

## 4. Implementation Checklist

### Phase 1: Desktop Layout (2-3 hours)
- [ ] Create `QuickStatsWidget.tsx` component
- [ ] Create `MarketAccessSummary.tsx` component
- [ ] Create `RelatedActions.tsx` component
- [ ] Update `OverviewTabV2.tsx` with 2-column grid layout
- [ ] Test responsive behavior (mobile, tablet, desktop, large desktop)
- [ ] Verify card content doesn't break in new layout

### Phase 2: Sticky Navigation (2-3 hours)
- [ ] Create `useScrollDirection.ts` hook
- [ ] Update `CountryHeaderBar.tsx` to support `compact` mode
- [ ] Update `CountryIntelligencePanelV2.tsx` with sticky header logic
- [ ] Add smooth transitions (300ms duration)
- [ ] Test scroll behavior on different screen sizes
- [ ] Verify z-index stacking (header > tab bar > content)

### Phase 3: Additional Enhancements (1-2 hours)
- [ ] Add scroll progress indicator to tab bar
- [ ] Implement "On This Page" quick jump menu (desktop only)
- [ ] Add "Export All Cards" batch action (desktop only)
- [ ] Test all interactive elements (clicks, hovers, scrolls)

### Phase 4: Testing & Polish (1 hour)
- [ ] Test on Nigeria (`/country/NGA`)
- [ ] Test on mobile (iPhone, Android)
- [ ] Test on desktop (1280px, 1920px, 2560px)
- [ ] Verify entitlement gating still works
- [ ] Check performance (scroll should be smooth at 60fps)
- [ ] Verify accessibility (keyboard navigation, focus states)

---

## 5. Visual Mockup (Desktop Layout)

### Before (Current - Empty Space Issue):
```
┌────────────────────────────────────────────────────────────┐
│  Country Snapshot                         [...............]│
│  • GDP: $575B                             [...............]│
│  • Population: 220M                       [...............]│
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Economic Momentum                        [...............]│
│  • 6.2% GDP growth                        [...............]│
│  • $5.1B FDI                              [...............]│
└────────────────────────────────────────────────────────────┘
```

### After (Proposed - Optimized Space Usage):
```
┌───────────────────────────────────┬────────────────────────┐
│  Country Snapshot                 │  📊 Quick Stats        │
│  • GDP: $575B                     │  ────────────────────  │
│  • Population: 220M               │  GDP: $575B (2025)     │
│  • Tech Hub: Lagos fintech center │  Pop: 220M+            │
│                                   │  Signal: HIGH GROWTH   │
│                                   │  Score: 78/100         │
├───────────────────────────────────┤                        │
│  Economic Momentum                │  🌍 Market Access      │
│  • 6.2% GDP growth (2025)         │  ────────────────────  │
│  • $5.1B FDI (+75% since 2020)    │  ✓ AGOA (U.S.)        │
│  • Tech sector +15% YoY           │  ✓ AfCFTA (Africa)    │
│  • Inflation declining: 18.2%     │  ✓ ECOWAS (W. Africa) │
│                                   │                        │
├───────────────────────────────────┤  ⚡ Related Actions    │
│  Why Now (24-36 month window)     │  ────────────────────  │
│                                   │  • Export Tab (PNG)    │
│  💹 1. Economic Momentum           │  • Compare Countries   │
│  Six quarters of growth...        │  • Generate Report     │
│                                   │  • View Trade Data     │
│  🏛️ 2. Policy Stability            │                        │
│  Reforms passed volatility...     │  📅 Updated            │
│                                   │  May 13, 2026          │
│  👥 3. Demographic Dividend        │                        │
│  Youth bulge (19.7 years)...      │  📦 Sources            │
│                                   │  World Bank, IMF, CBN  │
└───────────────────────────────────┴────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Market Access & Trade Benefits (Full Width)              │
│  🇺🇸 AGOA: $2.4B exports, 45,000 jobs, $240M savings      │
│  🌍 AfCFTA: 54 countries, 1.3B consumers, duty-free       │
│  🇳🇬 ECOWAS: 350M regional market, free movement          │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Performance Considerations

### Optimization Strategies:
1. **Scroll Event Throttling**: Use `requestAnimationFrame` for smooth 60fps
2. **CSS Transforms**: Use `transform: translateY()` instead of `top` for GPU acceleration
3. **Conditional Rendering**: Only render compact header when needed
4. **Sticky Positioning**: Use native CSS `position: sticky` where possible
5. **Intersection Observer**: For "On This Page" active state detection

### Expected Performance:
- Scroll performance: **60fps** on desktop, **45-60fps** on mobile
- Layout shift (CLS): **< 0.1** (no layout shifts on scroll)
- Time to interactive: **< 1.5s** (no blocking scripts)

---

## 7. Success Metrics

### UX Quality:
- [ ] No empty space on desktop (> 1280px screens)
- [ ] Sticky header appears/disappears smoothly
- [ ] Current section is always visible
- [ ] All interactive elements work (export, compare, jump links)
- [ ] Mobile experience unchanged (or improved)

### Bloomberg-Grade Checklist:
- [ ] Information density: High (no wasted space)
- [ ] Visual hierarchy: Clear (sidebar supplements, doesn't distract)
- [ ] Navigation: Intuitive (always know where you are)
- [ ] Performance: Smooth (60fps scroll, no jank)
- [ ] Responsiveness: Perfect (works on all screen sizes)

---

## 8. Risks & Mitigations

### Risk 1: Sidebar Clutters Mobile View
**Mitigation**: Sidebar is `lg:` breakpoint only. Mobile stays single-column.

### Risk 2: Sticky Header Causes Layout Shift
**Mitigation**: Use fixed height for header container, transition only opacity/transform.

### Risk 3: Too Much Information (Cognitive Overload)
**Mitigation**: Sidebar widgets are contextual, not redundant. They provide quick access, not duplicate content.

### Risk 4: Performance Degradation on Scroll
**Mitigation**: Use `requestAnimationFrame`, CSS transforms, and throttle scroll events.

---

## 9. Next Steps

### Immediate Actions:
1. **Review this plan** with user for approval
2. **Create visual mockup** (Figma or screenshot) if needed
3. **Implement Phase 1** (desktop layout) first
4. **Test on Nigeria** before proceeding to Phase 2
5. **Iterate based on feedback**

### Timeline Estimate:
- **Planning & Review**: 30 minutes ✓ (this document)
- **Phase 1 (Layout)**: 2-3 hours
- **Phase 2 (Sticky)**: 2-3 hours
- **Phase 3 (Enhancements)**: 1-2 hours
- **Phase 4 (Testing)**: 1 hour
- **Total**: ~6-10 hours

---

## 10. Breadcrumb Strategy (User-Approved)

**Chosen Approach**: Integrated Breadcrumb (Option 1)

### Behavior:
- **State 1** (Scroll = 0): Full breadcrumb visible above header ("Home › Intelligence › Nigeria › Economy")
- **State 2** (Scroll > 100px): Breadcrumb integrates into compact header as "🇳🇬 Nigeria › Economy"
- **State 3** (Scroll > 300px): Breadcrumb hidden with header, only tab bar visible
- **Scroll Up**: Compact header with integrated breadcrumb returns immediately

### Rationale:
1. ✅ Space efficient - no redundant information
2. ✅ Context preserved - "Nigeria › Economy" shows location
3. ✅ Bloomberg-grade - modern terminals integrate navigation smartly
4. ✅ Clean UX - less visual clutter during content exploration

---

## 11. Expert Recommendation

**Recommendation**: Implement both solutions in sequence.

**Why?**
1. **Desktop layout fix** addresses immediate visual issue (empty space)
2. **Sticky navigation** enhances UX for deep content exploration
3. **Combined impact**: Transforms page from "good" to "Bloomberg-grade"

**Priority Order**:
1. **Phase 1 (Desktop Layout)** - Highest impact, visible immediately
2. **Phase 2 (Sticky Navigation)** - Enhances usability for power users
3. **Phase 3 (Enhancements)** - Nice-to-have, differentiation features

**Fortune-5 Level Check**:
- ✅ Information density: Fixed with 2-column layout
- ✅ Navigation clarity: Fixed with sticky compact header
- ✅ Visual hierarchy: Fixed with contextual sidebar
- ✅ Performance: Optimized with CSS transforms
- ✅ Responsiveness: Mobile-first, desktop-enhanced

**This plan meets Bloomberg Terminal UX standards.**

---

**Ready to proceed?** Let me know if you'd like any adjustments to this plan, or if we should start implementation immediately.
