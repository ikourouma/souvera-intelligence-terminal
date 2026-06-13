# Bloomberg Terminal Build — Week 1-2 Implementation Plan

**Target Completion:** May 27, 2026  
**Status:** Planning Complete, Ready to Execute  
**Priority:** P0 — Foundation for entire platform

---

## Overview

Build the **Country Intelligence Panel** (7-tab system) and **Dual Interactive Maps** (Africa + Caribbean) as the core decision surface for the Souvera Intelligence Terminal.

**Success Criteria:**
- ✅ 7-tab Country Intelligence Panel renders in Full Page, Drawer, and Embedded modes
- ✅ Africa Map (54 countries) + Caribbean Map (25 countries) fully interactive
- ✅ Entitlement-based content gating functional (Explorer → Platform Admin)
- ✅ All states implemented (loading, locked, stale, error)
- ✅ Visual Capitalist design principles applied (strategic color, visual hierarchy, storytelling)
- ✅ Performance: < 300ms panel load, < 500ms map render

---

## Day 1-2: Country Intelligence Panel — Header + Executive Snapshot

### Component: `apps/api-gateway/src/components/intelligence/CountryIntelligencePanelV2.tsx`

**Create new component** (V2) to avoid breaking existing implementation.

#### Header Bar Implementation

```typescript
interface HeaderBarProps {
  country: {
    iso3: string;
    name: string;
    flagUrl: string;
    region: string;
    subregion?: string;
    capital?: string;
    currencyCode?: string;
  };
  signal: {
    level: 'high_growth' | 'emerging' | 'stable' | 'watchlist' | 'risk_elevated';
    investmentScore: number;
    confidenceScore: number;
  };
  freshness: {
    updatedAt: string;
  };
}

// Visual Capitalist Principle: Strategic color use
const SIGNAL_COLORS = {
  high_growth: { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'High Growth' },
  emerging: { bg: 'bg-blue-500', text: 'text-blue-400', label: 'Emerging' },
  stable: { bg: 'bg-zinc-500', text: 'text-zinc-400', label: 'Stable' },
  watchlist: { bg: 'bg-amber-500', text: 'text-amber-400', label: 'Watchlist' },
  risk_elevated: { bg: 'bg-red-500', text: 'text-red-400', label: 'Risk Elevated' },
};
```

**Layout:**
```
[Flag Image 48x32] [Country Name (H1)] [Signal Badge: HIGH GROWTH ●]
[Region Icon] Eastern Africa • Capital: Nairobi
[Data Freshness: Updated May 13, 2026 ● World Bank, REST Countries]
```

#### Executive Snapshot Grid (6 Metrics)

**Grid Layout:** 3×2 (desktop), 2×3 (tablet), 1×6 (mobile)

**Metrics:**
1. GDP (current USD) — `observable_code: gdp_current_usd` — **Public**
2. GDP Growth — `observable_code: gdp_growth_annual_pct` — **Public**
3. Population — `observable_code: population_total` — **Public**
4. FDI Net Inflows — `observable_code: fdi_net_inflows_current_usd` — **Professional+**
5. Inflation (CPI) — `observable_code: inflation_consumer_prices_annual_pct` — **Professional+**
6. FX Rate to USD — `observable_code: fx_rate_usd` — **Professional+**

**Component States (Visual Capitalist: Simple, Focused):**
- **Visible**: Full metric card with value, trend icon, sparkline (optional)
- **Locked**: Blurred value + lock icon + "Unlock with Professional plan"
- **Loading**: Skeleton shimmer
- **Stale**: Yellow badge "Data > 90 days old"
- **Missing**: Gray "Data pending"

**File:** `apps/api-gateway/src/components/intelligence/MetricCardV2.tsx`

---

## Day 3-4: Signal + Momentum Row

### Component: `apps/api-gateway/src/components/intelligence/SignalMomentumRow.tsx`

**3-card horizontal layout:**

#### 1. Signal Card
```typescript
interface SignalCardProps {
  level: SignalLevel;
  investmentScore: number; // 0-100
  confidenceScore: number; // 0-100
}
```

**Visual:**
- Large signal badge (color-coded)
- Investment Score: 78/100 (progress bar)
- Confidence Score: 85/100 (progress bar)

#### 2. Momentum Card
```typescript
interface MomentumCardProps {
  economicMomentum: number; // -100 to +100
  investorReadiness: number; // 0-100
}
```

**Visual:**
- Momentum gauge (green = positive, red = negative)
- Investor Readiness progress bar

#### 3. News Pulse Card
```typescript
interface NewsPulseCardProps {
  sentimentScore: number; // -1 to +1
  riskIntensity: number; // 0-100
  opportunityIntensity: number; // 0-100
}
```

**Visual:**
- Sentiment badge (positive/neutral/negative)
- Risk intensity bar (red scale)
- Opportunity intensity bar (green scale)

**Data Source:** 
- `souvera_country_signal_scores` table
- `souvera_country_news_signals` table

---

## Day 5-7: 7-Tab System Implementation

### Tab Architecture

**File:** `apps/api-gateway/src/components/intelligence/CountryTabs.tsx`

```typescript
const TABS = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'economy', label: 'Economy', icon: TrendingUp },
  { id: 'sectors', label: 'Sectors', icon: Building2 },
  { id: 'opportunity', label: 'Opportunity', icon: Target },
  { id: 'risk', label: 'Risk', icon: AlertTriangle },
  { id: 'trade', label: 'Trade', icon: Ship },
  { id: 'reports', label: 'Reports', icon: Download },
] as const;
```

**Visual Capitalist Principle: Visual Hierarchy & Flow**
- Sticky tab bar (always visible on scroll)
- Active tab: Blue underline + bold text
- Inactive tabs: Gray, hover blue
- Tab content: Smooth fade-in transition

### Tab 1: Overview

**Content Sections:**

1. **Summary (Markdown)**
   - Data: `souvera_country_profiles.summary_md`
   - Render: Use `react-markdown` with custom styling
   - Access: Explorer+ (truncated), Professional+ (full)

2. **Why Now (Markdown)**
   - Data: `souvera_country_profiles.why_now_md`
   - Visual: Blue accent box, "Why Now" badge
   - Access: Professional+

3. **Key Highlights (3-5 bullets)**
   - Derive from: `summary_md` + `sectors` data
   - Visual: Bullet list with icons
   - Example:
     - 🚀 6.2% GDP growth (2025)
     - 🏗️ $2.4B infrastructure investment pipeline
     - 📈 Tech sector growing 15% YoY

**File:** `apps/api-gateway/src/components/intelligence/tabs/OverviewTab.tsx`

### Tab 2: Economy

**Content Sections:**

1. **Key Indicators Table**
   - GDP, Inflation, Debt-to-GDP, FDI
   - 5-year trend (2020-2025)
   - Data: `souvera_country_time_series` table

2. **Charts**
   - GDP Growth Over Time (line chart)
   - Inflation Trend (line chart)
   - FDI Trend (bar chart)
   - Library: `recharts` (already in dependencies)

**Access:** Professional+

**File:** `apps/api-gateway/src/components/intelligence/tabs/EconomyTab.tsx`

### Tab 3: Sectors

**Content:**

1. **Sector List (7 sectors)**
   - Data: `souvera_country_sector_profiles` table
   - Each sector shows:
     - Sector name + icon
     - Strength Score: 0-100 (progress bar)
     - Growth Score: 0-100 (progress bar)
     - Attractiveness Score: 0-100 (progress bar)
     - Teaser text (Explorer+)
     - Full rationale (Business+)

**Tiered Access:**
- Public: Sector names only
- Explorer: + Teaser text (1 sentence)
- Professional: + Scores
- Business: + Full rationale (markdown)
- Institutional: + Sector thesis (detailed analysis)

**File:** `apps/api-gateway/src/components/intelligence/tabs/SectorsTab.tsx`

### Tab 4: Opportunity

**Content:**

1. **Opportunity Thesis (Markdown)**
   - Data: `souvera_country_profiles.opportunity_thesis_md`
   - Sections:
     - Growth drivers
     - Key sectors
     - Investment entry points
     - Regional advantages

**Access:** Business+

**Visual Capitalist Principle: Storytelling Through Data**
- Use callout boxes for key stats within narrative
- Example: "Kenya's tech sector attracted $1.2B in 2025" → highlighted in blue box

**File:** `apps/api-gateway/src/components/intelligence/tabs/OpportunityTab.tsx`

### Tab 5: Risk

**Content:**

1. **Risk Narrative (Markdown)**
   - Data: `souvera_country_profiles.risk_narrative_md`
   - Sections:
     - Macro risks (currency, inflation)
     - Political risks (governance, stability)
     - Sector-specific risks
     - Mitigation context

2. **Risk Scorecard (Visual)**
   - Governance Risk: 0-100 (gauge chart)
   - Political Stability: 0-100
   - Currency Risk: 0-100
   - Compliance Risk: 0-100

**Access:** Business+

**File:** `apps/api-gateway/src/components/intelligence/tabs/RiskTab.tsx`

### Tab 6: Trade (NEW: Bilateral View)

**Content:**

1. **Exports TO U.S. (Traditional AGOA)**
   - Top 10 products (HS code level)
   - Trade value (2025)
   - Growth rate (2020-2025)
   - AGOA eligibility status (badge: Eligible/Suspended)

2. **Imports FROM U.S. (New Bilateral)**
   - Top 10 U.S. products imported by this country
   - Import demand indicators
   - Tax incentive status (badge: Approved/Proposed/None)

3. **Top Trade Partners (5 countries)**
   - Bilateral trade value
   - Growth trend

**Data Sources:**
- `african_caribbean_supply` (exports to U.S.)
- `african_caribbean_import_demand` (imports from U.S.)
- `souvera_country_trade_snapshots`

**Access:** Business+

**Visual Capitalist Principle: Time + Geography**
- Show temporal changes with toggle: 2020 vs. 2025 data
- Mini flag icons for trade partners

**File:** `apps/api-gateway/src/components/intelligence/tabs/TradeTab.tsx`

### Tab 7: Reports

**Content:**

1. **Available Reports (4 types)**
   - Country Trade Profile (Professional+)
   - Investment Memorandum (Business+)
   - Policy Justification Brief (Institutional+)
   - Sector Opportunity Assessment (Business+)

2. **Export Formats:**
   - PDF (formatted with Souvera branding)
   - PowerPoint (slide deck)
   - Excel (data tables)
   - PNG (individual charts — NEW per Visual Capitalist feedback)

3. **Generate Button:**
   - Opens modal: Select report type → Configure → Generate → Download
   - Shows preview before download

**Access:** Professional+ (tier-gated)

**File:** `apps/api-gateway/src/components/intelligence/tabs/ReportsTab.tsx`

---

## Day 8-10: Interactive Maps (Africa + Caribbean)

### Component: `apps/api-gateway/src/components/intelligence/InteractiveMaps.tsx`

**Requirements:**
- Reuse existing `SouveraMapWorkspace` pattern
- Add signal visualization overlays
- Implement drawer mode (click country → open panel)

### Africa Map

**File:** `apps/api-gateway/src/components/intelligence/AfricaMapV2.tsx`

**Features:**
- 54 African countries clickable
- Color-coded by signal level:
  - High Growth: Green
  - Emerging: Blue
  - Stable: Gray
  - Watchlist: Yellow
  - Risk Elevated: Red
- Hover tooltip:
  - Country name
  - Signal level
  - GDP (formatted)
  - Population (formatted)
- Click: Open Country Intelligence Panel in drawer mode

**Filters (left sidebar):**
- [ ] AGOA Eligible
- [ ] AfCFTA Member
- [ ] Signal Level (multi-select)
- [ ] GDP > $50B
- [ ] Population > 50M

### Caribbean Map

**File:** `apps/api-gateway/src/components/intelligence/CaribbeanMapV2.tsx`

**Features:** (Same as Africa Map)
- 25 Caribbean countries clickable
- Same signal visualization
- Same hover tooltip
- Same filters (adjusted for CBI/CARICOM)

**Filters:**
- [ ] CBI Eligible
- [ ] CARICOM Member
- [ ] Signal Level
- [ ] GDP filters

### Unified Map Toggle

**Page:** `/intelligence/map`

**UI:**
- Region toggle: [Africa] [Caribbean] [Both]
- Search bar: "Search country..."
- Comparison mode: Checkbox selection (up to 3 countries) → "Compare" button
- Export map: PNG with Souvera watermark

**Visual Capitalist Principle: Time + Geography**
- Add timeline slider: Show signal changes 2020 → 2025
- Animate country color transitions

---

## Day 11-12: API Integration + Entitlement Gating

### API Endpoint: `/api/v1/country/[iso3]`

**File:** `apps/api-gateway/src/app/api/v1/country/[iso3]/route.ts`

**Response Structure:**
```typescript
{
  country: {
    iso3: string;
    name: string;
    flagUrl: string;
    region: string;
    subregion: string;
    capital: string;
    currencyCode: string;
  };
  metrics: {
    gdpCurrentUsd?: number;
    gdpGrowthPct?: number;
    populationTotal?: number;
    fdiNetInflowsUsd?: number; // Professional+
    inflationCpiPct?: number; // Professional+
    fxToUsd?: number; // Professional+
  };
  signal: {
    level: SignalLevel;
    investmentScore: number;
    confidenceScore: number;
  };
  momentum: {
    economicMomentum: number;
    investorReadiness: number;
  };
  newsPulse: {
    sentimentScore: number;
    riskIntensity: number;
    opportunityIntensity: number;
  };
  sectors: Array<{
    label: string;
    strengthScore?: number; // Professional+
    growthScore?: number; // Professional+
    attractivenessScore?: number; // Professional+
    teaser?: string; // Explorer+
    rationale?: string; // Business+
  }>;
  narrative: {
    summary?: string; // Explorer+ truncated, Professional+ full
    whyNow?: string; // Professional+
    opportunityThesis?: string; // Business+
    riskNarrative?: string; // Business+
  };
  trade?: {
    exportsToUs: Array<HSCodeExport>; // Business+
    importsFromUs: Array<HSCodeImport>; // Business+
    topPartners: Array<TradePartner>; // Business+
  };
  freshness: {
    updatedAt: string;
  };
  meta: {
    accessTier: string;
    authenticated: boolean;
    sources: Array<{ key: string; name: string }>;
  };
}
```

**Entitlement Logic:**
```typescript
import { resolveUserAccess } from '@souvera/entitlements';

// Inside route handler
const session = await getSession();
const access = await resolveUserAccess(session?.user?.id);

// Filter response based on access.tier
if (access.tier === 'explorer') {
  // Truncate summary, remove Professional+ fields
}
if (access.tier === 'professional') {
  // Include FDI, Inflation, full summary
}
if (access.tier === 'business') {
  // Include opportunity thesis, risk narrative, trade data
}
// etc.
```

### API Endpoint: `/api/v1/countries`

**File:** `apps/api-gateway/src/app/api/v1/countries/route.ts`

**Query Params:**
- `region`: `africa` | `caribbean` | `all`
- `agoa_eligible`: `true` | `false`
- `signal_level`: `high_growth,emerging` (comma-separated)
- `min_gdp`: `50000000000` (USD)
- `min_population`: `50000000`

**Response:**
```typescript
{
  countries: Array<CountrySummary>;
  total: number;
  filters: {
    region: string;
    agoaEligible?: boolean;
    signalLevel?: string[];
  };
}
```

---

## Day 13-14: Layout Modes + Polish

### Full Page Mode

**Route:** `/country/[iso3]`

**File:** `apps/api-gateway/src/app/country/[iso3]/page.tsx`

**Layout:**
```
[SouveraMegaNav]
[Country Intelligence Panel (full width, max-w-7xl)]
[SouveraFooter]
```

### Drawer Mode

**Trigger:** Click country on map

**Component:** `apps/api-gateway/src/components/intelligence/CountryDrawerV2.tsx`

**Behavior:**
- Slide in from right (60% viewport width on desktop)
- Backdrop blur overlay
- Close: X button, click backdrop, ESC key
- Smooth transition (300ms)

### Embedded Mode (Phase 5 Future)

**Component:** Headless version for iframe embeds

---

## Testing Checklist

### Functional Testing
- [ ] All 7 tabs render without errors
- [ ] Tab switching works (no flicker)
- [ ] Entitlement gating: Explorer sees truncated content
- [ ] Entitlement gating: Professional sees FDI/Inflation
- [ ] Entitlement gating: Business sees opportunity/risk/trade
- [ ] Loading states: Skeleton renders correctly
- [ ] Locked states: Blur + upgrade CTA visible
- [ ] Stale data badge appears when data > 90 days old
- [ ] Missing data shows "Data pending" correctly

### Interactive Map Testing
- [ ] All 54 African countries clickable
- [ ] All 25 Caribbean countries clickable
- [ ] Hover tooltip shows correct data
- [ ] Click country → drawer opens with correct data
- [ ] Filters work (AGOA, signal level, GDP, population)
- [ ] Region toggle (Africa/Caribbean/Both) works
- [ ] Search bar finds countries correctly
- [ ] Comparison mode (select up to 3) works
- [ ] Export map as PNG includes Souvera watermark

### Performance Testing
- [ ] Country panel loads < 300ms (cached)
- [ ] Map renders < 500ms
- [ ] Tab switching < 100ms
- [ ] No layout shift on data load
- [ ] No console errors
- [ ] No memory leaks (test with 20+ countries)

### Responsive Testing
- [ ] Mobile: Stacked layout, tabs scrollable
- [ ] Tablet: Hybrid layout
- [ ] Desktop: Full grid layout
- [ ] Touch gestures work (map pinch-zoom)

### Accessibility Testing
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Screen reader announces tab changes
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible

---

## Visual Capitalist Design Principles Applied

✅ **Strategic Color Use**
- Signal colors consistent across all components
- AGOA-eligible countries: Gold border on maps

✅ **Storytelling Through Data**
- Each tab has narrative arc, not just data dumps
- Callout boxes for key stats in markdown content

✅ **Visual Hierarchy & Flow**
- Header Bar = immediate visual anchor
- 7-tab system = clear sequential flow
- Export PNGs: Top-left country name, bottom-right "Source: Souvera Intelligence Terminal"

✅ **Time + Geography = Powerful**
- Map timeline slider (2020 → 2025)
- Trade tab shows temporal changes

✅ **Simple, Streamlined, Focused**
- No decorative elements
- Every component serves decision-making purpose
- PNG exports: Clean, minimal design

---

## Completion Criteria (Week 1-2)

By end of Day 14, the following MUST be functional:

1. ✅ Country Intelligence Panel (7 tabs) renders in all modes
2. ✅ Africa Map (54 countries) + Caribbean Map (25 countries) interactive
3. ✅ Entitlement-based content gating works for all 5 tiers
4. ✅ All states implemented (loading, locked, stale, missing)
5. ✅ Performance benchmarks met (< 300ms panel, < 500ms map)
6. ✅ API endpoints return filtered data per entitlement
7. ✅ Visual Capitalist design principles visible in UI
8. ✅ No console errors, no accessibility blockers

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data schema incomplete for all 7 tabs | High | Use placeholder data for Trade tab if schema not ready |
| Performance degrades with 74 countries on map | Medium | Implement map virtualization, lazy-load country details |
| Entitlement logic breaks existing features | High | Create V2 components, don't modify existing CountryIntelligencePanel |
| Markdown rendering security (XSS) | Critical | Use `react-markdown` with `rehype-sanitize` plugin |

---

## Next Steps (Week 3-4)

After Week 1-2 completion:
- **Week 3-4:** HS Code Product Database Schema + U.S. Census API Integration
- **Week 5-6:** Bilateral Supply-Demand Matching Engine + Matrix UIs
- **Week 7-8:** AGOA/AfCFTA Policy Intelligence modules
- **Week 9-10:** Report Generation + Export System
- **Week 11-12:** Admin Infrastructure + Multi-Persona Testing

---

**Status:** Ready to Execute  
**Assignee:** Agent  
**Start Date:** May 13, 2026  
**Target Completion:** May 27, 2026
