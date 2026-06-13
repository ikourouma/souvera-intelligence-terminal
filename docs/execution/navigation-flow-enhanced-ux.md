# Souvera Intelligence Terminal — Enhanced Navigation Flow

**Created:** May 13, 2026  
**Purpose:** Define cohesive UX flow connecting Interactive Maps, Country Panels, Trade Matrix, and Reports  
**Principle:** Bloomberg-grade seamless discovery → analysis → action

---

## Navigation Architecture

### 1. Entry Points to Country Intelligence Panel

Users can land on `/country/[iso3]` from:

| Entry Point | URL Pattern | Behavior |
|-------------|-------------|----------|
| **Interactive Map** | `/intelligence/map?region=africa&selected=NGA` | Click country → Navigate to `/country/NGA` |
| **Global Search** | Navbar search | Type "Nigeria" → Instant preview + "View Full Profile" button |
| **Trade Matrix** | `/trade/supply-demand?product=HS8517` | Click country cell → Navigate to `/country/[iso3]?tab=trade&product=HS8517` |
| **Report Citations** | `/reports/[id]` | Click country mention → Drawer mode panel opens |
| **Comparison Tool** | `/compare?countries=NGA,KEN,GHA` | Click country name → Navigate to individual panel |
| **Related Countries** | Within country panel | "Similar Markets" → Navigate to related country |
| **Direct URL** | `/country/NGA` | Shareable deep link |

---

### 2. Interactive Map → Country Panel Flow (Primary Discovery Flow)

**User Journey:**

```
Step 1: Land on Interactive Map
  URL: /intelligence/map?region=africa
  State: Map shows 54 African countries, color-coded by signal level
  
Step 2: Hover over Nigeria
  Tooltip appears: "Nigeria • High Growth • $477B GDP"
  
Step 3: Click on Nigeria
  Option A: Navigate to /country/NGA (full page)
  Option B: Open drawer with country panel (keeps map visible)
  Default: Full page navigation
  
Step 4: View Country Intelligence Panel
  URL: /country/NGA
  Breadcrumb: Intelligence > Africa Map > Nigeria
  Quick Action: "Back to Map" button (top-right)
```

**Enhanced with URL State:**
- Map remembers last region/zoom: `/country/NGA?from=map&region=africa&zoom=5`
- "Back to Map" returns user to exact previous state
- Selected country stays highlighted on map when returning

---

### 3. Within Country Panel — Card Interactions (Smart Navigation)

**Executive Snapshot Grid — Clickable Metrics:**

Each metric card should be **clickable** and navigate to the relevant tab with that metric highlighted:

| Metric Card | Click Action | Target Tab | URL |
|-------------|--------------|------------|-----|
| **GDP** | Navigate to Economy tab → GDP section | Economy | `/country/NGA?tab=economy#gdp` |
| **GDP Growth** | Navigate to Economy tab → Growth section | Economy | `/country/NGA?tab=economy#growth` |
| **Population** | Navigate to Overview tab → Demographics | Overview | `/country/NGA?tab=overview#demographics` |
| **FDI** | Navigate to Opportunity tab → Investment Climate | Opportunity | `/country/NGA?tab=opportunity#fdi` |
| **Inflation** | Navigate to Risk tab → Economic Stability | Risk | `/country/NGA?tab=risk#inflation` |
| **FX Rate** | Navigate to Economy tab → Currency | Economy | `/country/NGA?tab=economy#fx` |

**Signal/Momentum Row — Clickable Cards:**

| Card | Click Action | Target Tab | URL |
|------|--------------|------------|-----|
| **Signal Strength** | Navigate to Overview → Signal breakdown | Overview | `/country/NGA?tab=overview#signal` |
| **Economic Momentum** | Navigate to Economy → Momentum indicators | Economy | `/country/NGA?tab=economy#momentum` |
| **News Pulse** | Navigate to Risk → Recent news + sentiment | Risk | `/country/NGA?tab=risk#news` |

**Sector Cards (in Overview tab):**

| Sector Card | Click Action | Target Tab | URL |
|-------------|--------------|------------|-----|
| **Agriculture** | Navigate to Sectors tab → Agriculture deep dive | Sectors | `/country/NGA?tab=sectors&sector=agriculture` |
| **Technology** | Navigate to Sectors tab → Technology deep dive | Sectors | `/country/NGA?tab=sectors&sector=technology` |
| *(etc.)* | | | |

**Visual Feedback:**
- Cards have hover state: `hover:border-emerald-500/50 cursor-pointer`
- Subtle animation: `transition-all duration-200`
- Locked cards show tooltip: "Unlock with Professional plan" (not clickable)

---

### 4. Tab System — Deep Linking & State Management

**URL Pattern:** `/country/[iso3]?tab=[tab_id]&section=[section_id]`

**Tab IDs:**
- `overview` (default)
- `economy`
- `sectors`
- `opportunity`
- `risk`
- `trade`
- `reports`

**Examples:**
- `/country/NGA` → Defaults to Overview tab
- `/country/NGA?tab=economy` → Economy tab active
- `/country/NGA?tab=economy#gdp` → Economy tab, scroll to GDP section
- `/country/NGA?tab=sectors&sector=agriculture` → Sectors tab, Agriculture pre-selected

**Implementation:**
```typescript
// In CountryIntelligencePanelV2.tsx
const searchParams = useSearchParams();
const activeTab = searchParams.get('tab') || 'overview';
const sectionId = searchParams.get('section');
const sectorId = searchParams.get('sector');

useEffect(() => {
  if (sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }
}, [sectionId]);
```

---

### 5. Exit Points from Country Panel

**Quick Actions (Top-Right Header):**

| Button | Action | Behavior |
|--------|--------|----------|
| **Compare** | Open comparison drawer | Adds current country to comparison set, opens `/compare?countries=NGA,___` |
| **Export** | Open export menu | Dropdown: Download PDF, PPT, Excel, PNG (for current view) |
| **Share** | Copy shareable link | Copies current URL with tab state |
| **Back to Map** | Return to map | Navigate to `/intelligence/map?region=africa&selected=NGA` |

**In-Panel Navigation:**

| Element | Action | Behavior |
|---------|--------|----------|
| **Related Countries** | Navigate to similar market | "Similar to Nigeria: Kenya, Ghana, Egypt" → Click → Navigate to `/country/KEN` |
| **Top Trade Partners** | Navigate to partner country | In Trade tab: "Top Partner: United States" → Click → Navigate to `/country/USA?tab=trade` |
| **Sector Deep Dive** | Navigate to sector analysis | Click "View All Agriculture Opportunities" → Navigate to `/sectors/agriculture?region=africa` |
| **Report Citations** | Navigate to report | "Mentioned in 3 reports" → Click → Navigate to `/reports?country=NGA` |

---

### 6. Cross-Panel Breadcrumbs

**Breadcrumb Pattern:**

```
Home > Intelligence > Africa Map > Nigeria > Economy Tab
```

**Clickable Segments:**
- `Home` → `/dashboard` (user's default landing page)
- `Intelligence` → `/intelligence` (intelligence hub)
- `Africa Map` → `/intelligence/map?region=africa`
- `Nigeria` → `/country/NGA` (overview tab)
- `Economy Tab` → Current location (not clickable)

**Implementation:**
```typescript
<nav className="text-sm text-zinc-400 mb-4">
  <Link href="/dashboard">Home</Link>
  <span className="mx-2">/</span>
  <Link href="/intelligence">Intelligence</Link>
  <span className="mx-2">/</span>
  <Link href="/intelligence/map?region=africa">Africa Map</Link>
  <span className="mx-2">/</span>
  <Link href="/country/NGA">Nigeria</Link>
  {activeTab !== 'overview' && (
    <>
      <span className="mx-2">/</span>
      <span className="text-zinc-200 font-medium">{tabLabel}</span>
    </>
  )}
</nav>
```

---

### 7. Drawer Mode (Contextual Overlay)

**When to use Drawer Mode:**
- User is reading a report and clicks a country mention
- User is on Trade Matrix and wants quick country preview
- User wants to compare multiple countries side-by-side

**Behavior:**
- Opens from right side, 80% viewport width
- Background remains visible but dimmed
- Close button + click outside to dismiss
- URL updates with `?drawer=NGA` parameter
- Supports nested navigation within drawer

**Example Flow:**
```
User on: /reports/agoa-extension-justification
Click: "Nigeria" mention in report
Opens: Drawer with /country/NGA (overview tab)
User clicks: "Economy" tab within drawer
URL becomes: /reports/agoa-extension-justification?drawer=NGA&tab=economy
Close drawer: Returns to /reports/agoa-extension-justification
```

---

### 8. Keyboard Shortcuts (Power User)

| Shortcut | Action | Context |
|----------|--------|---------|
| `Cmd/Ctrl + K` | Open global search | Any page |
| `Cmd/Ctrl + M` | Navigate to map | Any page |
| `Cmd/Ctrl + /` | Show keyboard shortcuts | Any page |
| `Escape` | Close drawer/modal | When drawer open |
| `Tab` | Cycle through tabs | On country panel |
| `Cmd/Ctrl + E` | Export current view | On country panel |
| `Cmd/Ctrl + Shift + C` | Open comparison tool | On country panel |

---

## Implementation Priority

### Week 1-2 (Current)
- ✅ Country Intelligence Panel with clickable cards
- ✅ Tab system with URL state
- 🔄 Interactive Map → Country Panel navigation
- 🔄 Breadcrumbs

### Week 3-4
- Back to Map button with state preservation
- Drawer mode for contextual overlays
- Related countries navigation
- Comparison tool integration

### Week 5-6
- Trade Matrix → Country Panel deep linking
- Sector → Country cross-navigation
- Report citations → Country Panel
- Global search integration

### Week 7-8
- Keyboard shortcuts
- Session history (back/forward with state)
- Personalized landing pages per user role

---

## Visual Enhancements

### Hover States (All Clickable Elements)

```css
/* Metric Cards */
.metric-card:hover {
  border-color: rgb(16 185 129 / 0.5); /* emerald-500/50 */
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.3);
}

/* Tab Buttons */
.tab-button:hover {
  background: rgb(39 39 42); /* zinc-800 */
  color: rgb(16 185 129); /* emerald-500 */
}

/* Breadcrumb Links */
.breadcrumb-link:hover {
  color: rgb(16 185 129); /* emerald-500 */
  text-decoration: underline;
}
```

### Loading Transitions (Smooth Navigation)

```typescript
// Use Next.js loading.tsx for route transitions
// apps/api-gateway/src/app/country/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Skeleton matching panel layout */}
    </div>
  );
}
```

---

## Testing Checklist

- [ ] Navigate from map to country panel
- [ ] Click each executive metric card → Verify correct tab opens
- [ ] Click signal/momentum cards → Verify correct tab opens
- [ ] Click sector card → Verify sectors tab opens with pre-selected sector
- [ ] Verify URL updates with tab/section parameters
- [ ] Verify breadcrumbs display correctly and are clickable
- [ ] Verify "Back to Map" preserves map state (region, zoom, selected country)
- [ ] Test drawer mode (open/close, nested navigation)
- [ ] Test all keyboard shortcuts
- [ ] Test on mobile (touch targets, drawer behavior)
- [ ] Test with different entitlement levels (locked cards not clickable)

---

## Open Questions

1. **Drawer vs. Full Page:** Should map → country default to drawer or full page?
   - **Recommendation:** Full page (cleaner, more space), with option to "Open in Drawer" for power users
   
2. **Comparison Limit:** How many countries can be compared at once?
   - **Recommendation:** Max 4 countries (2×2 grid on desktop)
   
3. **Back Button Behavior:** Should browser back button respect tab navigation or only page navigation?
   - **Recommendation:** Full URL history (each tab change = new history entry) for better shareability

---

## Summary

**Key Enhancements:**
1. ✅ All executive snapshot cards are **clickable** and navigate to relevant tabs
2. ✅ URL state management for deep linking and shareability
3. ✅ Breadcrumb navigation for clear orientation
4. 🔄 Interactive Map integration with state preservation
5. 🔄 Drawer mode for contextual overlays
6. 🔄 Keyboard shortcuts for power users

**Result:** Seamless, Bloomberg-grade navigation that makes country intelligence discovery → analysis → action feel effortless.
