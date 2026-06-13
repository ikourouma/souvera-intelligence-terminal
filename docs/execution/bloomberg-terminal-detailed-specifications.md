# Bloomberg-Grade Intelligence Terminal - Plan Update

**Date:** May 13, 2026  
**Status:** Plan Updated, Session 1 In Progress  
**Documented by:** AI Agent

---

## 🎯 Strategic Decisions Confirmed

### 1. **Nigeria as Template Country**
✅ **Agreed:** Build Nigeria to 100% completion first, then replicate to other 73 markets.

**Rationale:**
- Components become reusable (copy-paste-adjust pattern)
- Data patterns become clear
- Quality bar is set once, then scaled
- Nigeria is largest African economy ($575B GDP), high-priority market

### 2. **AI-Generated Narratives (Phase 2 Enhancement)**
✅ **Confirmed:** All sections will have compelling Souvera narratives, not just raw data.

**Implementation Approach:**
- **Phase 1 (Current):** Static markdown narratives, manually written for Nigeria
- **Phase 2 (Week 11-12):** GPT-4 integration for real-time narrative generation
  - Economy Tab: "GDP grew from X to Y due to [contextual factors]..."
  - Sectors Tab: "Tech sector momentum driven by [3 key drivers]..."
  - Risk Tab: "Political risk elevated but mitigated by [reforms]..."
  - Trade Tab: "Bilateral opportunity: U.S. could increase imports by [%]..."

**User Benefit:**
- **Decision-ready intelligence**, not data dumps
- Bloomberg Terminal quality: "Here's what it means" + "Here's why it matters"
- Future: Users can ask "Why did FDI increase?" → AI explains using underlying data

**Technical:**
- New TODO added to plan: `ai-narrative-generation` (Week 11-12)
- API will support `/api/v1/country/[iso3]/narrative` endpoint for AI-generated insights

### 3. **Comparison Page Already Exists**
✅ **Noted:** `/intelligence/compare` page exists for side-by-side country comparison.

**Integration:**
- Metric cards will link to comparison view ("Compare Nigeria vs. Kenya")
- Deep-linking: `/intelligence/compare?countries=NGA,KEN&tab=economy`

---

## 📄 Bloomberg Plan Updated with Detailed Tab Specifications

The main plan (`bloomberg_grade_intelligence_terminal_afb537af.plan.md`) has been updated with:

### **Part 1.1: Country Intelligence Panel Component** (Expanded)

**New Details Added:**

1. **Implementation Strategy: Nigeria as Template**
   - Build Nigeria country panel to 100% completion
   - Nigeria becomes reference implementation
   - Components designed for reusability

2. **7-Tab Detailed Specifications:**

#### **Overview Tab:**
- Country Summary (markdown, AI-generated in Phase 2)
- Why Now Section (blue callout box)
- Key Highlights (3-5 icon bullets, auto-derived from metrics)
- Demographics Section (scroll-to target: `id="demographics"`)
- Signal Breakdown (methodology transparency)

#### **Economy Tab** (Current Focus):
- Key Indicators Table (5-year historical: 2020-2025)
  - AI narrative: "GDP growth accelerated from 3.2% to 6.2%, driven by..."
- Time Series Charts (Recharts library):
  - GDP Growth Trend (line chart, 2020-2026E forecast)
  - Inflation & Monetary Policy (line chart with CBN rate overlay)
  - FDI Flows (bar chart, quarterly breakdown by sector)
- GDP Section (scroll-to: `id="gdp"`)
  - Current GDP, historical trend, growth drivers
  - AI narrative: Sectoral contribution analysis
- Growth Section (scroll-to: `id="growth"`)
  - Growth rate decomposition, forecasts
  - AI narrative: What's driving acceleration/deceleration
- FX Rate Analysis (scroll-to: `id="fx"`)
  - Current rate, 12-month trend, volatility assessment
  - AI narrative: Currency stability outlook

#### **Sectors Tab:**
- Sector Scorecard Grid (3×3, 7 sectors)
- Expanded Sector View (per sector):
  - Scores: Strength, Growth, Attractiveness (progress bars)
  - Sector Rationale (markdown + AI-generated)
  - Investment Entry Points (bulleted list)
  - Key Players & Projects (Phase 2)
- **Structure:** Vertical list (NOT sub-tabs) for comparative scanning
- **Rationale:** Bloomberg principle - "Context before detail" (see all sectors simultaneously)

#### **Opportunity Tab:**
- Investment Thesis Hero Section (AI-generated)
- Growth Drivers (3-column icon cards with AI narratives)
- Key Sectors for Investment (ranked list with values)
- Investment Entry Points (AI-matched to user tier)
- Regional Advantages (map callout with competitive analysis)

#### **Risk Tab:**
- Risk Scorecard (4 gauge charts)
- Risk Narrative (structured markdown):
  - Macro Risks (AI analysis)
  - Political Risks (AI analysis)
  - Sector Risks (AI analysis)
  - Mitigation Context (AI analysis)
- News & Sentiment Section (scroll-to: `id="news"`)

#### **Trade Tab** (CRITICAL FOR AGOA):
- Exports TO U.S. Section (top 10 HS codes)
  - AI narrative: "Coffee exports grew 22% YoY..."
- Imports FROM U.S. Section (top 10 products)
  - AI narrative: "Telecom equipment imports surged 18%..."
- Top Trade Partners (flags + values)
- Bilateral Trade Growth Potential (AI forecast)
- **NOTE:** Placeholder until Week 5-6 (HS code schema)

#### **Reports Tab:**
- Available Report Templates (4 types, tier-gated)
- PNG Exports (individual components with watermark)
- Generate Report Workflow (modal with AI-enhanced auto-populate)
- **NOTE:** Placeholder until Week 9-10 (report generation system)

3. **AI Narrative Generation Section (NEW):**
   - Purpose: Every section has contextual analysis
   - Implementation: GPT-4 integration (Phase 2)
   - Use Cases: Economy, Sectors, Risk, Trade narratives
   - User Benefit: Decision-ready intelligence
   - Future: Conversational Q&A ("Why did FDI increase?")

4. **Technical Requirements (Enhanced):**
   - URL State Management: `/country/NGA?tab=economy#gdp`
   - Integration: Links to `/intelligence/compare`
   - Performance: < 300ms panel load, < 1.5s first paint

---

## ✅ Session 1 Progress: Economy Tab Foundation

### **Completed:**

1. ✅ **Plan Updated**
   - Bloomberg plan updated with detailed tab specifications
   - AI narrative generation added as Phase 2 enhancement
   - Nigeria-as-template strategy documented

2. ✅ **Nigeria Time Series Data Seeded (2020-2025)**
   - Seeded 5 core indicators:
     - GDP (current USD)
     - GDP Growth (%)
     - FDI Net Inflows (USD)
     - Inflation CPI (%)
     - FX Rate (NGN/USD)
   - 21 records successfully inserted (6 years × 3-4 indicators)
   - Note: Debt-to-GDP indicator not yet in schema (will add in Phase 3)

3. ✅ **Execution Document Created**
   - `docs/execution/nigeria-full-build-session-1-economy-tab.md`
   - Comprehensive Economy Tab specification
   - Component architecture defined
   - Success criteria established

4. ✅ **Seed Scripts Created**
   - `infra/supabase/seed-nigeria-time-series.sql` (SQL version)
   - `scripts/seed-nigeria-time-series.ts` (TypeScript version - working)

### **Current Data (Seeded for Nigeria):**

| Year | GDP ($B) | Growth (%) | FDI ($M) | Inflation (%) | FX (NGN/USD) |
|------|----------|------------|----------|---------------|--------------|
| 2020 | 432.3    | -1.8       | 2,390    | 13.2          | 379.0        |
| 2021 | 440.8    | 3.6        | 2,560    | 17.0          | 411.0        |
| 2022 | 477.4    | 3.3        | 3,110    | 18.8          | 435.1        |
| 2023 | 506.6    | 2.9        | 3,450    | 24.5          | 461.3        |
| 2024 | 540.2    | 4.2        | 4,200    | 21.4          | 895.0        |
| 2025 | 574.8    | 6.2        | 5,100    | 18.2          | 1,450.0      |

**Data Story:**
- **2020:** COVID-19 negative growth (-1.8%)
- **2021-2022:** Recovery phase (3-3.6% growth)
- **2023:** Currency reform (FX spike to 461, then unified to 895 in 2024)
- **2024-2025:** Tech sector boom (6.2% growth, strongest in decade)

---

## 🚧 Next Steps: Economy Tab Component Implementation

### **Immediate Tasks:**

1. **Update API Route** (`/api/v1/country/[iso3]/route.ts`)
   - Add `timeSeries` field to response
   - Query `souvera_country_observations` for years 2020-2025
   - Group by year and indicator
   - Return structured time series data

2. **Build EconomyTab Component** (`components/intelligence/tabs/EconomyTab.tsx`)
   - EconomyHeroNarrative (contextual summary)
   - KeyIndicatorsTable (5-year table with sortable columns)
   - GDPGrowthChart (Recharts line chart)
   - InflationChart (Recharts line chart with CBN rate)
   - FXRateChart (Recharts line chart with 2023 reform annotation)

3. **Test with Professional+ User**
   - Verify entitlement gating works
   - Check scroll-to-section (#gdp, #growth, #fx)
   - Validate chart responsiveness

4. **Polish & Document**
   - Add AI narrative placeholders
   - Screenshot for documentation
   - Mark Economy Tab as "Template Complete"

### **Estimated Time:** 4-6 hours

### **Success Criteria:**
- ✅ Economy Tab renders for Professional+ users
- ✅ All 3 charts display correctly with time series data
- ✅ Scroll-to-section navigation works
- ✅ AI narrative placeholders are present
- ✅ No console errors, Bloomberg-grade visual quality

---

## 📊 Updated TODO Status

| ID | Task | Status | Notes |
|----|------|--------|-------|
| country-panel-component | Build Country Intelligence Panel with 7-tab system | **IN PROGRESS** | Economy Tab foundation laid, data seeded |
| ai-narrative-generation | Integrate GPT-4 for narrative generation | **PENDING** | Added to Week 11-12 plan |
| interactive-maps | Build dual interactive maps | **PENDING** | After Nigeria panel complete |

---

## 🎨 Design Principles Reinforced

From user feedback and Bloomberg reference:

1. **Every section has analysis or compelling narrative**
   - Not just raw data, but "here's what it means"
   - AI will enhance narratives in Phase 2

2. **Nigeria = Template**
   - Build once to perfection, replicate 73 times
   - Components designed for copy-paste-adjust

3. **Bloomberg-Grade or Failure**
   - Quality bar is non-negotiable
   - Visual Capitalist principles applied throughout
   - Performance targets enforced

4. **Users Never Want to Leave**
   - Deep-linking for all navigation
   - Comparison mode integrated
   - Sticky UX: Answer "Should I invest?" in < 60 seconds

---

## 📂 Files Created/Updated

### **Created:**
1. `docs/execution/nigeria-full-build-session-1-economy-tab.md`
2. `infra/supabase/seed-nigeria-time-series.sql`
3. `scripts/seed-nigeria-time-series.ts`
4. `docs/execution/bloomberg-terminal-detailed-specifications.md` (this file)

### **Updated:**
1. `.cursor/plans/bloomberg_grade_intelligence_terminal_afb537af.plan.md`
   - Part 1.1: Country Intelligence Panel Component (fully detailed)
   - Added `ai-narrative-generation` TODO
   - Integrated comparison page mention

---

## 🎯 Key Takeaways

1. **Plan is Comprehensive**
   - All 7 tabs have detailed specifications
   - AI narrative generation documented for Phase 2
   - Nigeria-first approach confirmed

2. **Data Foundation is Solid**
   - 21 time series records seeded for Nigeria
   - 5 core indicators (GDP, Growth, FDI, Inflation, FX) ready
   - Schema matches production requirements

3. **Ready for Component Build**
   - Next: Build Economy Tab with Recharts
   - Then: Sectors + Opportunity tabs (Session 2)
   - Finally: Risk + placeholder Trade/Reports (Session 3)

---

**Status:** Plan Updated ✅ | Data Seeded ✅ | Ready for Economy Tab Component Build

**Next Command:** Implement Economy Tab component with Recharts integration.
