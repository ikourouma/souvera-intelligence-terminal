# Regional Command Pages Executive Elevation Plan

**Date:** April 28, 2026  
**Scope:** `/intelligence/africa` and `/intelligence/caribbean`  
**Objective:** Elevate to Fortune-5 executive-grade regional command center pages  
**Standard:** Bloomberg-grade intelligence brief, Palantir-style decision interface, McKinsey executive clarity, Stripe-level visual polish

---

## Current Page Assessment

### /intelligence/africa

**Current State:** Static marketing presentation page  
**Template Used:** `PresentationPageTemplate`  
**Lines of Code:** 67 lines (thin wrapper)

**Strengths:**
- ✅ SEO metadata complete
- ✅ Premium dark aesthetic
- ✅ Basic narrative structure (What/Who/Why/How)
- ✅ Impact statistics ($3.1T GDP, 1.4B population, 54 nations)

**Weaknesses:**
- ❌ **No live data integration** — static text only
- ❌ **Generic template** — identical structure to Caribbean
- ❌ **No regional market grid** — no country cards/preview
- ❌ **No signal indicators** — no visual growth/risk signals
- ❌ **No sector breakdown** — sectors mentioned but not visualized
- ❌ **No subregional view** — West/East/North/Central/Southern not surfaced
- ❌ **No source attribution** — no data credibility layer
- ❌ **No preview data labeling** — could imply live data
- ❌ **Placeholder WHY visual** — generic Target icon, not data-driven
- ❌ **Low information density** — McKinsey executives would want more data

**Executive Readiness Score:** 35/100

---

### /intelligence/caribbean

**Current State:** Static marketing presentation page  
**Template Used:** `PresentationPageTemplate`  
**Lines of Code:** 67 lines (thin wrapper)

**Strengths:**
- ✅ SEO metadata complete
- ✅ Premium dark aesthetic
- ✅ Different tagline ($270B GDP, 44M population, 15 territories)
- ✅ Region-specific sectors (tourism, energy, BPO)

**Weaknesses:**
- ❌ **Identical structure to Africa** — no distinct strategic narrative
- ❌ **No live data integration** — static text only
- ❌ **No territory grid** — no country cards
- ❌ **No sector comparison** — tourism/energy not visualized
- ❌ **No CARICOM trade visualization** — mentioned but not shown
- ❌ **No proximity/corridor framing** — Miami, Houston, transatlantic not surfaced
- ❌ **Undersells Caribbean opportunity** — needs sharper investment narrative
- ❌ **No source attribution** — no data credibility layer

**Executive Readiness Score:** 32/100

---

## Recommended New Section Structure

### /intelligence/africa — "The African Opportunity Terminal"

**Strategic Narrative:** Africa as the final frontier of global growth — 1.4B consumers, 6 of 10 fastest-growing economies, AfCFTA creating a $3.4T single market.

#### Section 1: Hero Command Bar
**Height:** Full viewport  
**Content:**
- Title: "Africa Intelligence."
- Tagline: "54 Nations · $3.1T GDP · The World's Growth Frontier"
- **Live Regional Pulse** (3-5 key indicators from API):
  - Economies in high-growth signal: X
  - Combined GDP growth (weighted avg): X%
  - Top performer: [Country] at X%
- Primary CTA: "Explore Markets" (scrolls to grid)
- Secondary CTA: "Request Full Access"
- **Data freshness label:** "Curated Preview Data · Sources: World Bank, IMF"

#### Section 2: Regional Market Pulse
**Purpose:** Executive-grade signal overview  
**Content:**
- **5 Subregion Cards** (West, East, North, Central, Southern Africa):
  - Region name + country count
  - Combined GDP
  - Avg growth rate
  - Lead signal (high_growth, emerging, stable, etc.)
  - Top 3 countries by GDP
- Click any region → filters market grid
- Color-coded by region (matches africa-map.tsx REGION_COLORS)

#### Section 3: Market Intelligence Grid
**Purpose:** All 54 countries at a glance  
**Content:**
- **Reuse `MarketGrid` component** (from `/intelligence/map`)
- Default filter: Africa only
- Search by country name, ISO code, capital
- Signal badges (high_growth = emerald, emerging = blue, etc.)
- Quick metrics: GDP, population
- Click → CountryDrawer opens
- **Preview Data Banner** at top

#### Section 4: Sector Landscape
**Purpose:** Africa-specific sector intelligence  
**Content:**
- **6 Sector Cards** (executive-grade):
  1. **Fintech** — Mobile money, digital banking, pan-African payments
  2. **Energy** — Oil & gas, renewables, grid infrastructure
  3. **Mining & Critical Minerals** — Cobalt, lithium, rare earths
  4. **Agriculture & Agritech** — Food security, export crops, processing
  5. **Logistics & Trade** — AfCFTA corridors, ports, aviation
  6. **Tourism & Hospitality** — Safari, coastal, business travel
- Each card: Sector name, brief (2 sentences), key countries, signal indicator
- CTA: "Explore [Sector] Intelligence" → `/sectors/[sector]` (future)

#### Section 5: Strategic Context
**Purpose:** Why Africa Now  
**Content:**
- **AfCFTA Opportunity:** Single market of 1.4B people, $3.4T combined GDP
- **Demographic Dividend:** Youngest population globally, urbanization accelerating
- **Digital Leapfrogging:** Mobile penetration, fintech adoption, e-commerce growth
- **Climate & Energy Transition:** Critical minerals for EV batteries, solar potential
- 4 context cards with supporting statistics

#### Section 6: Trust & Source Layer
**Purpose:** Data credibility for institutional buyers  
**Content:**
- **Data Sources:** World Bank, IMF, African Development Bank, REST Countries
- **Refresh Cadence:** Weekly/monthly (as applicable)
- **Coverage:** 54 nations, 6 sectors, 20+ indicators
- **Preview Data Disclaimer:** "Data shown is curated preview data. Live data feeds are in development."
- Link: "View Source Registry" → `/resources/source-registry`

#### Section 7: Access CTA Block
**Purpose:** Conversion  
**Content:**
- Full-width blue CTA block
- Headline: "Access Africa Intelligence"
- Subhead: "From market screening to investment memos — get the data you need."
- CTA: "Request Access"
- Trust badges: "Institutional-grade · Bloomberg/McKinsey standard"

---

### /intelligence/caribbean — "The Caribbean Gateway Terminal"

**Strategic Narrative:** Caribbean as the strategic corridor between the Americas, Europe, and Africa — tourism economies, energy transition, offshore financial services, and gateway positioning.

#### Section 1: Hero Command Bar
**Height:** Full viewport  
**Content:**
- Title: "Caribbean Intelligence."
- Tagline: "20 Territories · $270B GDP · The Strategic Gateway"
- **Live Regional Pulse** (3-5 key indicators):
  - Territories with tourism-led growth: X
  - Energy sector developments: X active
  - Combined GDP: $270B
- Primary CTA: "Explore Markets"
- Secondary CTA: "Request Full Access"
- **Data freshness label:** "Curated Preview Data · Sources: World Bank, IMF"

#### Section 2: Strategic Positioning Map
**Purpose:** Show Caribbean as a corridor, not just islands  
**Content:**
- Visual positioning diagram (simplified):
  - Miami → Caribbean → South America
  - Europe → Caribbean → Americas
  - Africa → Caribbean (diaspora economic links)
- **Key Corridors:**
  - US-Caribbean Trade Corridor
  - European Tourism Corridor
  - Transatlantic Energy Corridor
  - Africa-Caribbean Diaspora Link
- Not a geographic map — a strategic connectivity diagram

#### Section 3: Market Intelligence Grid
**Purpose:** All 20 territories at a glance  
**Content:**
- **Reuse `MarketGrid` component**
- Default filter: Caribbean only
- Search by territory name, ISO code, capital
- Quick metrics: GDP, population
- Sector indicators (Tourism, Energy, Financial Services)
- Click → CountryDrawer opens
- **Preview Data Banner** at top

#### Section 4: Sector Landscape
**Purpose:** Caribbean-specific sector intelligence  
**Content:**
- **5 Sector Cards** (executive-grade):
  1. **Tourism & Hospitality** — Cruise, resort, eco-tourism, business travel
  2. **Energy & LNG** — Trinidad LNG, Guyana offshore, renewables
  3. **Financial Services** — Offshore banking, international business centers
  4. **BPO & Nearshoring** — Call centers, shared services, tech hubs
  5. **Trade & Logistics** — CARICOM, port hubs, free trade zones
- Each card: Sector name, brief, key territories, signal indicator
- CTA: "Explore [Sector] Intelligence"

#### Section 5: Strategic Context
**Purpose:** Why Caribbean Now  
**Content:**
- **Nearshoring Opportunity:** US companies moving operations closer to home
- **Energy Transition:** Guyana as fastest-growing oil economy, Trinidad LNG, renewable potential
- **CARICOM Integration:** Single market aspirations, trade harmonization
- **Diaspora Economics:** Remittances, investment flows, cultural bridges
- 4 context cards with supporting statistics

#### Section 6: Trust & Source Layer
**Purpose:** Data credibility  
**Content:**
- Same structure as Africa page
- Region-specific sources: Caribbean Development Bank, CARICOM Secretariat

#### Section 7: Access CTA Block
**Purpose:** Conversion  
**Content:**
- Same structure as Africa page
- Headline: "Access Caribbean Intelligence"

---

## Shared Component Architecture

### New Components to Create

| Component | Purpose | Reusability |
|-----------|---------|-------------|
| `RegionalHeroCommand` | Hero with live data pulse | Africa, Caribbean, future regions |
| `SubregionPulseGrid` | 5-card subregion overview (Africa) | Africa only |
| `StrategicPositionDiagram` | Corridor visualization (Caribbean) | Caribbean only |
| `SectorLandscapeGrid` | Sector cards with signals | Africa, Caribbean, sector pages |
| `StrategicContextGrid` | 4-card context cards | Any page |
| `TrustSourceLayer` | Source attribution + disclaimer | All data pages |
| `AccessCTABlock` | Conversion block | All pages |
| `RegionalMarketGrid` | MarketGrid with region preset | Africa, Caribbean |

### Existing Components to Reuse

| Component | Location | Adaptation Needed |
|-----------|----------|-------------------|
| `MarketGrid` | `components/intelligence/MarketGrid.tsx` | Add region prop for default filter |
| `CountryDrawer` | `components/intelligence/CountryDrawer.tsx` | None |
| `PreviewDataBanner` | `components/intelligence/PreviewDataBanner.tsx` | None |
| `SouveraMegaNav` | `components/ui/SouveraMegaNav.tsx` | None |
| `SouveraFooter` | `components/ui/SouveraFooter.tsx` | None |

### Component Hierarchy

```
/intelligence/africa/page.tsx
├── SouveraMegaNav
├── RegionalHeroCommand (region="africa")
├── SubregionPulseGrid
├── RegionalMarketGrid (defaultRegion="africa")
│   └── MarketGrid (with CountryDrawer)
│   └── PreviewDataBanner
├── SectorLandscapeGrid (sectors=AFRICA_SECTORS)
├── StrategicContextGrid (items=AFRICA_CONTEXT)
├── TrustSourceLayer
├── AccessCTABlock
└── SouveraFooter

/intelligence/caribbean/page.tsx
├── SouveraMegaNav
├── RegionalHeroCommand (region="caribbean")
├── StrategicPositionDiagram
├── RegionalMarketGrid (defaultRegion="caribbean")
│   └── MarketGrid (with CountryDrawer)
│   └── PreviewDataBanner
├── SectorLandscapeGrid (sectors=CARIBBEAN_SECTORS)
├── StrategicContextGrid (items=CARIBBEAN_CONTEXT)
├── TrustSourceLayer
├── AccessCTABlock
└── SouveraFooter
```

---

## Data/API Needs

### Available APIs (Phase 3A Complete)

| API | Endpoint | Data Provided |
|-----|----------|---------------|
| Countries List | `GET /api/v1/countries?region=africa` | 54 African countries with GDP, population, signal |
| Countries List | `GET /api/v1/countries?region=caribbean` | 20 Caribbean territories |
| Country Detail | `GET /api/v1/country-lite?iso3=XXX` | Full country profile |

### New API Needs (Phase 3B+)

| API | Endpoint | Data Needed | Priority |
|-----|----------|-------------|----------|
| Regional Summary | `GET /api/v1/regions/africa/summary` | Aggregated GDP, growth, signal counts | HIGH |
| Regional Summary | `GET /api/v1/regions/caribbean/summary` | Aggregated GDP, growth, signal counts | HIGH |
| Subregion Data | `GET /api/v1/subregions?region=africa` | West/East/North/Central/South stats | MEDIUM |
| Sector Overview | `GET /api/v1/sectors?region=africa` | Sector cards with top countries | LOW (can be static initially) |

### Data Aggregation Strategy

**Phase 1 (Immediate):** Client-side aggregation from `/api/v1/countries` response
- Sum GDPs, populations
- Count signal levels
- Calculate weighted averages
- Safe for preview data

**Phase 2 (Future):** Server-side aggregation endpoints
- More efficient
- Cacheable
- Accurate calculations

### Static Data (Acceptable for Phase 3B)

| Data Type | Source | Rationale |
|-----------|--------|-----------|
| Sector descriptions | Hardcoded | Sectors change rarely |
| Strategic context | Hardcoded | Editorial content |
| Corridor descriptions | Hardcoded | Geopolitical content |
| Trust/source info | Hardcoded | Static metadata |

---

## Visual Design Recommendations

### Design System Alignment

**Colors:**
- Background: `#0B0F14` (primary), `#121821` (cards)
- Accent: Blue (`#2563EB`) for Africa, Teal (`#0D9488`) for Caribbean
- Signals: Emerald (high_growth), Blue (emerging), Zinc (stable), Amber (watchlist), Red (risk)
- Text: White (headings), `zinc-400` (body), `zinc-600` (muted)

**Typography:**
- Headings: Space Grotesk, bold
- Body: System font, regular
- Data labels: Mono, uppercase, tracking-widest

**Spacing:**
- Section padding: `py-24` (large), `py-16` (medium)
- Card padding: `p-8` (large), `p-6` (medium)
- Grid gaps: `gap-8` (large), `gap-4` (small)

### Visual Hierarchy

```
1. HERO (Full viewport)
   ├── Title (6xl-8xl)
   ├── Tagline (md)
   ├── Live Pulse (3 metrics, xl bold)
   └── CTAs (primary + secondary)

2. SECTION HEADERS
   ├── Section label (10px uppercase, color-coded)
   ├── Heading (3xl-4xl)
   └── Description (lg, zinc-400)

3. DATA CARDS
   ├── Card header (icon + label)
   ├── Primary metric (2xl-3xl bold)
   ├── Secondary metrics (sm)
   └── Signal badge (9px uppercase)

4. GRID ITEMS (Country/Sector cards)
   ├── Flag/Icon (w-8)
   ├── Name (lg bold)
   ├── Metadata (xs, zinc-500)
   └── Quick metrics (sm)
```

### Interaction Patterns

| Element | Hover | Click |
|---------|-------|-------|
| Country card | Blue border glow | Opens CountryDrawer |
| Subregion card | Border highlight | Filters market grid |
| Sector card | Background lighten | Links to sector page (future) |
| CTA button | Background shift | Navigation/action |

### Mobile Layout

| Section | Desktop | Mobile |
|---------|---------|--------|
| Hero | Side-by-side | Stacked |
| Subregion Grid | 5 columns | 2 columns + scroll |
| Market Grid | 3 columns | 1 column |
| Sector Grid | 3 columns | 1 column |
| Context Grid | 4 columns | 2 columns |
| CTA Block | Horizontal | Vertical stack |

---

## Content Tone Guidance

### Executive Clarity Principles

1. **Lead with data, not adjectives**
   - ❌ "Amazing growth opportunities"
   - ✅ "6 of 10 fastest-growing global economies"

2. **Specific over general**
   - ❌ "Large market potential"
   - ✅ "1.4B consumers, $3.1T combined GDP"

3. **Source everything**
   - ❌ "High growth expected"
   - ✅ "7.2% growth (IMF 2024 estimate)"

4. **Institutional language**
   - ❌ "Unlock the power of..."
   - ✅ "Access institutional-grade intelligence for..."

5. **Defensible claims only**
   - ❌ "Real-time market data"
   - ✅ "Curated preview data from World Bank, IMF"

### Africa-Specific Tone

- **Frame:** Growth frontier, demographic dividend, digital leapfrog
- **Avoid:** "Emerging market" (too generic), "Underdeveloped" (offensive)
- **Key themes:** AfCFTA opportunity, critical minerals, fintech innovation
- **Target reader:** DFI portfolio manager, PE Africa fund analyst, corporate Africa expansion lead

### Caribbean-Specific Tone

- **Frame:** Strategic gateway, corridor economics, nearshoring destination
- **Avoid:** "Small islands" (minimizing), "Tax haven" (politically charged)
- **Key themes:** Guyana energy boom, nearshoring, CARICOM integration
- **Target reader:** US/European corporate strategist, energy sector analyst, hospitality investor

---

## Implementation Phases

### Phase 3B-1: Foundation (Est. scope)

**Deliverables:**
1. Create `RegionalHeroCommand` component with live data pulse
2. Create `RegionalMarketGrid` component (MarketGrid with region preset)
3. Create `SectorLandscapeGrid` component with static sector data
4. Create `StrategicContextGrid` component
5. Create `TrustSourceLayer` component
6. Create `AccessCTABlock` component
7. Update `/intelligence/africa/page.tsx` with new structure
8. Update `/intelligence/caribbean/page.tsx` with new structure

**APIs Used:**
- `GET /api/v1/countries?region=africa`
- `GET /api/v1/countries?region=caribbean`

**Data Strategy:**
- Client-side aggregation for hero metrics
- Static sector/context content
- PreviewDataBanner integration

### Phase 3B-2: Africa Differentiation

**Deliverables:**
1. Create `SubregionPulseGrid` component (5 AU regions)
2. Add subregion filtering to market grid
3. Seed subregion metadata if not present
4. Visual polish and animation passes

**New Data Needed:**
- Subregion aggregation (can be client-side)

### Phase 3B-3: Caribbean Differentiation

**Deliverables:**
1. Create `StrategicPositionDiagram` component
2. Add Caribbean-specific sector indicators
3. Visual polish for corridor visualization

**New Data Needed:**
- None (static corridor content)

### Phase 3B-4: Polish & QA

**Deliverables:**
1. Mobile responsiveness pass
2. Animation/interaction polish
3. Accessibility audit
4. Performance optimization
5. SEO metadata refinement
6. Manual QA with test users

---

## Acceptance Criteria

### Functional Criteria

| Criterion | Measurement |
|-----------|-------------|
| Page loads without errors | Build passes, no console errors |
| Countries display correctly | 54 Africa, 20 Caribbean visible |
| CountryDrawer opens on click | Click any country → drawer opens |
| Search/filter works | Type name → results filter |
| Region filter works | Click subregion → grid filters |
| Mobile layout works | Responsive at 375px, 768px, 1024px |
| PreviewDataBanner visible | Banner at top of market grid |
| Source attribution visible | TrustSourceLayer renders |
| CTA links work | All links navigate correctly |

### Executive Readiness Criteria

| Criterion | Standard |
|-----------|----------|
| **Information density** | 10+ data points visible above fold |
| **Visual polish** | Stripe-level refinement |
| **Data credibility** | Source attribution on all data |
| **No unsupported claims** | Zero "live data" or "real-time" claims |
| **Professional tone** | McKinsey brief clarity |
| **Regional differentiation** | Africa ≠ Caribbean (distinct narratives) |
| **Mobile experience** | Usable on executive's phone |
| **Load time** | <3 seconds on 4G |

### Content Quality Criteria

| Criterion | Requirement |
|-----------|-------------|
| All statistics sourced | World Bank, IMF, official sources |
| No marketing fluff | No "unlock", "revolutionary", "game-changing" |
| Preview data labeled | Clear disclaimer on all data sections |
| Sector descriptions accurate | Factual, defensible claims only |
| Strategic context defensible | Backed by public reports/data |

### Visual Criteria

| Criterion | Requirement |
|-----------|-------------|
| Color consistency | Matches Souvera design system |
| Typography consistency | Space Grotesk headings, system body |
| Card consistency | All cards follow same structure |
| Spacing consistency | Section padding, grid gaps uniform |
| Dark theme maintained | No light mode elements |
| No decorative graphics | No stock photos, abstract shapes |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API data incomplete | Fallback to static data with disclaimer |
| Client-side aggregation slow | Pre-calculate in API (Phase 4) |
| Mobile layout breaks | Test at 375px, 414px, 768px |
| Executive finds fluff | Tone review pass before launch |
| Source attribution missing | Hardcode sources in TrustSourceLayer |
| Live data claim leaks | Grep codebase before launch |

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `components/regional/RegionalHeroCommand.tsx` | Hero with live pulse |
| `components/regional/SubregionPulseGrid.tsx` | Africa 5-region grid |
| `components/regional/StrategicPositionDiagram.tsx` | Caribbean corridor diagram |
| `components/regional/SectorLandscapeGrid.tsx` | Sector cards |
| `components/regional/StrategicContextGrid.tsx` | Context cards |
| `components/regional/TrustSourceLayer.tsx` | Source attribution |
| `components/regional/AccessCTABlock.tsx` | Conversion block |
| `components/regional/RegionalMarketGrid.tsx` | MarketGrid wrapper |

### Modified Files

| File | Changes |
|------|---------|
| `app/intelligence/africa/page.tsx` | Replace PresentationPageTemplate with new structure |
| `app/intelligence/caribbean/page.tsx` | Replace PresentationPageTemplate with new structure |
| `components/intelligence/MarketGrid.tsx` | Add optional defaultRegion prop |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Executive readiness score | 85/100 (up from 35/100) |
| Page load time | <2.5 seconds |
| Mobile usability | 90+ Google Lighthouse |
| Data accuracy | 100% sourced |
| Zero unsupported claims | Verified via grep |
| User engagement | Country clicks increase 3x |

---

## Conclusion

This elevation plan transforms `/intelligence/africa` and `/intelligence/caribbean` from generic marketing pages into **executive-grade regional command centers** that:

✅ Surface live data from Souvera APIs  
✅ Provide distinct strategic narratives per region  
✅ Meet Bloomberg/Palantir/McKinsey standards  
✅ Maintain data credibility with source attribution  
✅ Label preview data appropriately  
✅ Convert visitors with clear CTAs  
✅ Work on mobile devices  
✅ Reuse components for future pages  

**Recommended Start:** Phase 3B-1 Foundation  
**Estimated Scope:** 8 new components + 2 page rewrites  
**Dependencies:** Phase 3A APIs (complete)

---

**Plan Created:** April 28, 2026  
**Author:** Cursor Agent  
**Status:** Ready for Implementation Approval
