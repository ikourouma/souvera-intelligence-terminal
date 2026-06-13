# Session 3: Contextual Help System & Knowledge Base Plan

**Date**: May 14, 2026  
**Status**: Planning  
**Goal**: Implement intelligent contextual help for technical terms and metrics

---

## 🎯 Problem Statement

**Challenge**: Users encounter technical terms they don't understand:
- Signal Strength (Investment Score, Confidence)
- Economic Momentum (Momentum Index, Investor Readiness)
- Risk Intensity
- Opportunity Intensity
- AGOA, AfCFTA, ECOWAS
- GDP, FDI, FX Rate
- HS Codes, Bilateral Trade

**User Pain Point**: "What does 'Investment Score 78/100' actually mean?"

**Solution**: Contextual help system with hover tooltips + click modals, backed by a platform knowledge base.

---

## 🎨 UX Design Strategy

### Option Analysis

#### Option 1: Hover Tooltip Only
```
Signal Strength ⓘ
          ↓ (hover)
┌─────────────────────────────────────┐
│ Signal Strength measures...         │
└─────────────────────────────────────┘
```
- ✅ Quick access, no click required
- ✅ Bloomberg Terminal style
- ❌ Doesn't work on mobile (no hover)
- ❌ Limited space for detailed explanations

#### Option 2: Click Modal Only
```
Signal Strength ⓘ
          ↓ (click)
┌─────────────────────────────────────┐
│  What is Signal Strength?           │
│  ───────────────────────────────    │
│  Signal Strength is a composite...  │
│  [Close]                             │
└─────────────────────────────────────┘
```
- ✅ Works on mobile
- ✅ Space for detailed explanations
- ❌ Requires extra click (friction)
- ❌ Less discoverable

#### Option 3: Hybrid (RECOMMENDED)
```
Desktop:
  Signal Strength ⓘ
    ↓ (hover)    ↓ (click)
  Quick tooltip  Detailed modal

Mobile:
  Signal Strength ⓘ
    ↓ (tap)
  Detailed modal
```
- ✅ Best of both worlds
- ✅ Desktop: Quick preview on hover
- ✅ Desktop: Deep dive on click
- ✅ Mobile: Full explanation on tap
- ✅ Progressive disclosure

**Decision: Implement Option 3 (Hybrid)**

---

## 📐 Visual Mockups

### Mockup 1: Signal Strength Badge (Header)

**Desktop - Hover State:**
```
┌─────────────────────────────────────────────────────────┐
│  🇳🇬 Nigeria                         ┌─────────────────┐│
│  Sub-Saharan Africa                  │ Signal ⓘ       ││
│                                      │ [HIGH GROWTH]  ││
│                                      │ ● 78/100        ││
│                                      └─────────────────┘│
│                    ↓                                     │
│          ┌─────────────────────────────────────────┐    │
│          │ Signal Strength                         │    │
│          │ ─────────────────────────────────────   │    │
│          │ Composite score (0-100) measuring:     │    │
│          │ • Investment climate (40%)              │    │
│          │ • Economic growth (30%)                 │    │
│          │ • Political stability (20%)             │    │
│          │ • Data confidence (10%)                 │    │
│          │                                         │    │
│          │ Click for detailed breakdown →         │    │
│          └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Desktop - Click Modal:**
```
┌───────────────────────────────────────────────────────────┐
│  What is Signal Strength?                           [X]   │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  📊 Signal Strength measures a country's investment       │
│     attractiveness on a scale from 0 to 100.              │
│                                                           │
│  How It's Calculated:                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                           │
│  1. Investment Climate (40%)                              │
│     • FDI inflows trend (last 5 years)                    │
│     • Ease of doing business ranking                      │
│     • Regulatory environment score                        │
│                                                           │
│  2. Economic Growth (30%)                                 │
│     • GDP growth rate (5-year average)                    │
│     • GDP per capita trend                                │
│     • Sector diversification index                        │
│                                                           │
│  3. Political Stability (20%)                             │
│     • World Bank Governance Indicators                    │
│     • Political risk index                                │
│     • Policy continuity score                             │
│                                                           │
│  4. Data Confidence (10%)                                 │
│     • Data freshness (< 90 days = high)                   │
│     • Source reliability (World Bank, IMF = high)         │
│     • Coverage completeness                               │
│                                                           │
│  Signal Levels:                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                           │
│  🟢 HIGH GROWTH (70-100)                                  │
│     Strong fundamentals, favorable investment climate     │
│                                                           │
│  🟡 MODERATE GROWTH (50-69)                               │
│     Stable but with some risk factors                     │
│                                                           │
│  🟠 WATCH (30-49)                                         │
│     Mixed signals, proceed with caution                   │
│                                                           │
│  🔴 RISK (0-29)                                           │
│     Significant challenges, high-risk environment         │
│                                                           │
│  ℹ️ Source: Souvera Intelligence Terminal                 │
│     Data: World Bank, IMF, OECD, UNCTAD                   │
│     Updated: May 13, 2026                                 │
│                                                           │
│  [Learn More About Our Methodology]                       │
└───────────────────────────────────────────────────────────┘
```

---

### Mockup 2: Economic Momentum (Signal Row)

**Desktop - Hover Tooltip:**
```
┌─────────────────────────────────────────────────────────┐
│  Signal Strength    Economic Momentum ⓘ    News Pulse   │
│  [HIGH GROWTH]      [ACCELERATING]          [POSITIVE]  │
│  78/100             +15.2%                  85% pos      │
│                           ↓                              │
│              ┌─────────────────────────────────────┐     │
│              │ Economic Momentum                   │     │
│              │ ─────────────────────────────────   │     │
│              │ 90-day trend in key indicators:    │     │
│              │ • GDP growth acceleration          │     │
│              │ • FDI inflow changes               │     │
│              │ • Trade volume shifts              │     │
│              │                                     │     │
│              │ +15.2% = Strong upward momentum    │     │
│              │ Click for detailed analysis →      │     │
│              └─────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

### Mockup 3: Metric Card with Help Icon

**GDP Metric Card (Executive Snapshot):**
```
┌─────────────────────────────────────┐
│  GDP (Current USD) ⓘ                │
│  ─────────────────────────────────  │
│  $575B                              │
│  📈 +6.2% YoY                        │
│                                     │
│  [Click to view GDP breakdown →]   │
└─────────────────────────────────────┘
       ↓ (hover on ⓘ)
┌─────────────────────────────────────┐
│ Gross Domestic Product              │
│ ─────────────────────────────────   │
│ Total value of all goods and        │
│ services produced in a country      │
│ over one year.                      │
│                                     │
│ Click for full definition →        │
└─────────────────────────────────────┘
```

---

### Mockup 4: AGOA Explanation (Trade Section)

**Market Access Card:**
```
┌─────────────────────────────────────────────────────────┐
│  🇺🇸 AGOA: Duty-Free Exports to United States ⓘ        │
│  ───────────────────────────────────────────────────    │
│  Nigeria can export eligible products to U.S. without   │
│  paying import tariffs.                                 │
│                                                         │
│  Evidence for AGOA Extension:                           │
│  1. $2.4B exports in 2025 → 45,000 jobs                │
│  2. +22% growth (2020-2025)                            │
│  3. $450M additional trade potential by 2030           │
└─────────────────────────────────────────────────────────┘
       ↓ (hover on ⓘ)
┌─────────────────────────────────────┐
│ AGOA (African Growth and            │
│ Opportunity Act)                    │
│ ─────────────────────────────────   │
│ U.S. legislation providing duty-    │
│ free access to the U.S. market for  │
│ eligible sub-Saharan African        │
│ countries.                          │
│                                     │
│ Eligible: 36 of 49 countries       │
│ Expires: 2025 (extension pending)   │
│                                     │
│ Click to learn more →              │
└─────────────────────────────────────┘
```

---

## 📚 Knowledge Base Content Structure

### Tier 1: Quick Tooltip (Hover - Desktop)
- **Length**: 1-2 sentences (max 50 words)
- **Purpose**: Instant definition
- **Example**: "Signal Strength measures investment attractiveness on a scale of 0-100, combining economic growth, political stability, and data confidence."

### Tier 2: Detailed Modal (Click/Tap)
- **Length**: 100-300 words
- **Structure**:
  1. What it is (1-2 sentences)
  2. How it's calculated (bullet points)
  3. How to interpret (ranges, levels)
  4. Data sources
  5. CTA: "Learn More" link to full documentation

### Tier 3: Full Documentation (Knowledge Base)
- **Length**: 500-2000 words
- **Structure**:
  1. Executive summary
  2. Detailed methodology
  3. Use cases and examples
  4. FAQs
  5. Related metrics
  6. References and citations

---

## 📊 Core Metrics to Document

### 1. Signal Strength
**Tooltip (Hover):**
> Signal Strength measures investment attractiveness (0-100), combining economic growth (30%), investment climate (40%), political stability (20%), and data confidence (10%).

**Modal (Click):**
```
What is Signal Strength?

Signal Strength is a proprietary composite score (0-100) that measures 
a country's overall investment attractiveness for institutional investors, 
businesses, and trade partners.

How It's Calculated:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Investment Climate (40%)
   • FDI inflows (5-year trend)
   • Ease of doing business ranking
   • Regulatory environment quality

2. Economic Growth (30%)
   • GDP growth rate (5-year average)
   • GDP per capita trajectory
   • Sector diversification

3. Political Stability (20%)
   • World Bank Governance Indicators
   • Political risk assessment
   • Policy continuity

4. Data Confidence (10%)
   • Data freshness (< 90 days preferred)
   • Source reliability (World Bank, IMF prioritized)
   • Coverage completeness

Signal Levels:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 HIGH GROWTH (70-100)
   Strong fundamentals, favorable investment climate, low risk

🟡 MODERATE GROWTH (50-69)
   Stable but with some risk factors, selective opportunities

🟠 WATCH (30-49)
   Mixed signals, proceed with due diligence

🔴 RISK (0-29)
   Significant challenges, high-risk environment

Data Sources: World Bank, IMF, OECD, UNCTAD
Updated: May 13, 2026

[Learn More About Our Methodology →]
```

---

### 2. Investment Score (Component of Signal)
**Tooltip:**
> Investment Score (0-100) measures how attractive a country is for foreign direct investment based on FDI inflows, business environment, and regulatory quality.

**Modal:**
```
Investment Score

A sub-component of Signal Strength, the Investment Score specifically 
measures a country's attractiveness for foreign direct investment (FDI).

Calculation Factors:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• FDI Net Inflows (50%)
  Historical trend (5 years) and recent momentum (12 months)

• Ease of Doing Business (30%)
  World Bank ranking + time to start business

• Regulatory Environment (20%)
  Contract enforcement, property rights, tax transparency

Interpretation:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

80-100: Excellent investment climate (e.g., Singapore, Rwanda)
60-79:  Strong investment potential with manageable risks
40-59:  Moderate opportunities, due diligence required
0-39:   Challenging environment, high-risk

Example: Nigeria (2025)
Investment Score: 72/100
• FDI Inflows: $5.1B (+75% since 2020) → Score: 85
• Ease of Doing Business: Rank 131/190 → Score: 65
• Regulatory: Improving reforms → Score: 68
→ Weighted Average: 72

Data Sources: UNCTAD FDI Database, World Bank Doing Business
```

---

### 3. Confidence Score
**Tooltip:**
> Confidence Score (0-100) indicates data quality and reliability based on source credibility, freshness (< 90 days preferred), and coverage completeness.

**Modal:**
```
Confidence Score

Measures the quality and reliability of the data underlying our 
intelligence analysis. Higher scores mean more trustworthy insights.

What Affects Confidence:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Data Freshness (40%)
   • < 30 days: 100%
   • 30-90 days: 80%
   • 90-180 days: 60%
   • > 180 days: 40%

2. Source Reliability (40%)
   • Tier 1 (World Bank, IMF, UN): 100%
   • Tier 2 (National statistics agencies): 80%
   • Tier 3 (Industry reports): 60%
   • Tier 4 (Estimates, projections): 40%

3. Coverage Completeness (20%)
   • All indicators present: 100%
   • 75-99% present: 80%
   • 50-74% present: 60%
   • < 50% present: 40%

Confidence Levels:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ HIGH (80-100)
   Recent data from authoritative sources, complete coverage

⚠️ MODERATE (60-79)
   Some older data or gaps, generally reliable

⚠️ LOW (40-59)
   Significant data age or gaps, use with caution

❌ VERY LOW (0-39)
   Outdated or incomplete data, limited reliability

Example: Nigeria (2025)
Confidence Score: 85/100
• Freshness: 45 days old → 80%
• Sources: World Bank (GDP), IMF (Inflation) → 100%
• Coverage: 95% of indicators → 95%
→ Weighted Average: 85

Why It Matters:
A country with HIGH GROWTH signal but LOW confidence score 
suggests promising opportunities but requires additional due diligence 
before investment decisions.
```

---

### 4. Economic Momentum
**Tooltip:**
> Economic Momentum tracks the 90-day trend in key indicators (GDP growth, FDI, trade volume). Positive momentum indicates accelerating growth.

**Modal:**
```
Economic Momentum

Measures the direction and speed of economic change over the past 
90 days. Unlike static metrics, momentum shows where the economy 
is heading.

What We Track:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. GDP Growth Acceleration
   Comparing Q-over-Q growth rates

2. FDI Flow Changes
   Month-over-month FDI inflows

3. Trade Volume Shifts
   Export + import growth trends

4. Inflation Trajectory
   Rising or declining inflation rates

5. Currency Stability
   FX rate volatility (lower is better)

Momentum Levels:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 ACCELERATING (+10% or more)
   Strong positive trends across multiple indicators

📈 POSITIVE (+5% to +9.9%)
   Moderate improvement, favorable direction

➡️ STABLE (-4.9% to +4.9%)
   Little change, holding steady

📉 SLOWING (-5% to -9.9%)
   Moderate decline, watch closely

⚠️ DECLINING (-10% or less)
   Significant negative trends, high risk

Investor Readiness:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACCELERATING + HIGH GROWTH Signal = PRIME OPPORTUNITY
Enter now to capture early-stage growth

POSITIVE + MODERATE Signal = GOOD TIMING
Stable fundamentals with improving trends

DECLINING + WATCH Signal = WAIT
Postpone until momentum stabilizes

Example: Nigeria (May 2026)
Momentum: +15.2% (ACCELERATING)
• GDP Growth: Q1 2026 (6.8%) vs Q4 2025 (5.9%) → +15.3%
• FDI: Apr 2026 ($450M) vs Jan 2026 ($380M) → +18.4%
• Trade: Mar 2026 exports +12% MoM → +12.0%
→ Average: +15.2%

Interpretation:
Nigeria's economic momentum is accelerating, suggesting this is an 
optimal window for investment entry before valuations adjust upward.
```

---

### 5. Risk Intensity
**Tooltip:**
> Risk Intensity measures potential downsides including political instability, currency volatility, inflation, and regulatory uncertainty (0-100, lower is better).

**Modal:**
```
Risk Intensity

A composite score (0-100) measuring potential threats to investment 
returns. Lower scores indicate lower risk.

⚠️ Lower Risk Intensity = Better (0-100 scale, inverted)

Risk Factors:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Political Risk (30%)
   • Government stability
   • Policy continuity probability
   • Civil unrest indicators

2. Currency Volatility (25%)
   • FX rate fluctuation (12-month)
   • Central bank reserves adequacy
   • Sovereign credit rating

3. Inflation Risk (20%)
   • Current inflation rate
   • Inflation trajectory (rising/falling)
   • Central bank credibility

4. Regulatory Uncertainty (15%)
   • Policy change frequency
   • Contract enforcement reliability
   • Expropriation risk

5. Economic Shocks (10%)
   • Commodity price dependence
   • External debt burden
   • Trade concentration risk

Risk Levels:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 LOW RISK (0-25)
   Stable environment, minimal threats

🟡 MODERATE RISK (26-50)
   Some challenges, manageable with planning

🟠 HIGH RISK (51-75)
   Significant threats, extensive mitigation required

🔴 VERY HIGH RISK (76-100)
   Severe challenges, high probability of loss

Example: Nigeria (2025)
Risk Intensity: 42/100 (MODERATE)
• Political: Post-reform volatility phase passed → 35
• Currency: Naira stabilized post-unification → 45
• Inflation: Declining (24.5% → 18.2%) → 50
• Regulatory: Improving but still gaps → 48
• Economic Shocks: Oil-dependent economy → 55
→ Weighted Average: 42

Mitigation Strategies:
For MODERATE risk countries like Nigeria:
• Hedge currency exposure (forward contracts)
• Diversify across multiple sectors
• Engage local partners with government relationships
• Maintain flexible exit strategies
```

---

### 6. Opportunity Intensity
**Tooltip:**
> Opportunity Intensity measures growth potential including market size, demographic dividend, sector strength, and infrastructure development (0-100, higher is better).

**Modal:**
```
Opportunity Intensity

A composite score (0-100) quantifying upside potential for investors 
and businesses. Higher scores indicate greater opportunities.

🎯 Higher Opportunity Intensity = Better (0-100 scale)

Opportunity Factors:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Market Size & Growth (30%)
   • GDP size and growth trajectory
   • Consumer spending power
   • Middle-class expansion rate

2. Demographic Dividend (25%)
   • Youth population (% under 30)
   • Education levels and skills
   • Digital adoption rate

3. Sector Strength (20%)
   • High-growth sectors (tech, manufacturing)
   • Competitive advantages
   • Export potential

4. Infrastructure Development (15%)
   • Transport, energy, digital connectivity
   • Investment in infrastructure (% GDP)
   • Public-private partnerships

5. Trade Access (10%)
   • AGOA, AfCFTA, regional agreements
   • Tariff-free market access
   • Trade facilitation improvements

Opportunity Levels:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 EXCEPTIONAL (80-100)
   Rare high-growth opportunities, "next frontier"

📈 STRONG (60-79)
   Significant upside potential, favorable conditions

➡️ MODERATE (40-59)
   Steady opportunities, selective entry

📉 LIMITED (20-39)
   Few growth prospects, challenging environment

❌ MINIMAL (0-19)
   Very limited opportunities, avoid

Example: Nigeria (2025)
Opportunity Intensity: 78/100 (STRONG)
• Market Size: $575B GDP, 220M+ population → 85
• Demographics: Median age 19.7, 75% internet → 90
• Sectors: Tech +15% YoY, agriculture processing → 80
• Infrastructure: Improving but gaps remain → 65
• Trade Access: AGOA, AfCFTA, ECOWAS → 75
→ Weighted Average: 78

Investment Thesis:
STRONG Opportunity + MODERATE Risk = FAVORABLE RISK/REWARD
Nigeria presents a compelling investment case with significant 
upside potential (78) that outweighs manageable risks (42). 
The 24-36 month window offers optimal entry timing.

Key Opportunities:
• Fintech: Africa's largest digital payments market
• Agriculture: Value-add processing for export
• Infrastructure: $100B+ investment pipeline
• Consumer Goods: 220M growing middle class
```

---

### 7. AGOA (Trade Agreement)
**Tooltip:**
> AGOA (African Growth and Opportunity Act) provides duty-free access to the U.S. market for eligible sub-Saharan African countries. Expires 2025, extension pending.

**Modal:**
```
AGOA: African Growth and Opportunity Act

U.S. legislation enacted in 2000 providing trade preferences for 
sub-Saharan African countries.

Key Benefits:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Duty-Free Access
  6,500+ products can enter the U.S. market without import tariffs

✓ Significant Savings
  Average 8-15% tariff savings → increased competitiveness

✓ Market Access
  $28 trillion U.S. market for African exporters

✓ Job Creation
  Supports manufacturing and export jobs in Africa

Eligibility Criteria:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Countries must meet requirements:
• Market-based economy
• Rule of law and political pluralism
• Elimination of trade barriers
• Protection of intellectual property
• Efforts to combat corruption
• Protection of human rights and worker rights

Current Status (2025):
• 36 of 49 sub-Saharan African countries eligible
• $10.2B total exports to U.S. under AGOA (2025)
• Expires September 30, 2025
• Extension under review by USTR

Evidence for AGOA Extension (Nigeria):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Economic Impact
   • Nigeria: $2.4B exports under AGOA (2025)
   • 45,000 Nigerian jobs supported
   • $240M tariff savings for U.S. importers

2. Trade Growth
   • U.S. imports from Nigeria: +22% (2020-2025)
   • Demonstrates rising supply capacity

3. Future Potential
   • Extension would unlock $450M additional trade by 2030
   • Benefits both U.S. importers and Nigerian exporters

Top AGOA Exports (Nigeria):
• Energy products (crude oil, natural gas)
• Agricultural products (cocoa, cashews)
• Textiles and apparel
• Manufactured goods

Source: U.S. Trade Representative (USTR), U.S. Census Bureau
```

---

## 🛠️ Implementation Strategy

### Phase 1: Component Architecture (Week 1)

#### 1.1 Create `HelpTooltip` Component
```tsx
// apps/api-gateway/src/components/shared/HelpTooltip.tsx

interface HelpTooltipProps {
  term: string;              // "signal_strength", "agoa", etc.
  tooltipContent?: string;   // Override default tooltip
  modalContent?: ReactNode;  // Override default modal
  position?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'sm' | 'md' | 'lg';
}

export function HelpTooltip({ term, position = 'top', size = 'sm' }: HelpTooltipProps) {
  // 1. Fetch content from knowledge base (or use static definitions)
  // 2. Render info icon (ⓘ)
  // 3. Show tooltip on hover (desktop)
  // 4. Show modal on click (desktop + mobile)
  // 5. Track analytics (which terms users click most)
}
```

#### 1.2 Create `HelpModal` Component
```tsx
// apps/api-gateway/src/components/shared/HelpModal.tsx

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  term: string;
  content: {
    title: string;
    summary: string;
    sections: Array<{
      heading: string;
      content: string;
    }>;
    sources: string[];
    learnMoreUrl?: string;
  };
}

export function HelpModal({ isOpen, onClose, term, content }: HelpModalProps) {
  // 1. Render modal with detailed content
  // 2. Structured sections (What, How, Interpretation)
  // 3. Data sources footer
  // 4. "Learn More" CTA to full documentation
  // 5. Keyboard navigation (ESC to close)
}
```

---

### Phase 2: Knowledge Base Schema (Week 1)

#### 2.1 Supabase Schema

```sql
-- Create knowledge_base table
CREATE TABLE souvera_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term_key TEXT UNIQUE NOT NULL,           -- "signal_strength", "agoa"
  term_label TEXT NOT NULL,                -- "Signal Strength", "AGOA"
  category TEXT NOT NULL,                  -- "metric", "trade", "indicator"
  tooltip_short TEXT NOT NULL,             -- Hover tooltip (50 words)
  modal_title TEXT NOT NULL,
  modal_summary TEXT NOT NULL,             -- Modal intro (1-2 sentences)
  modal_content JSONB NOT NULL,            -- Structured content
  related_terms TEXT[],                    -- ["investment_score", "confidence_score"]
  learn_more_url TEXT,                     -- Link to full docs
  data_sources TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status souvera_row_status DEFAULT 'active'
);

-- Indexes
CREATE INDEX idx_knowledge_base_term_key ON souvera_knowledge_base(term_key);
CREATE INDEX idx_knowledge_base_category ON souvera_knowledge_base(category);

-- RLS: Public read access
ALTER TABLE souvera_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Knowledge base is publicly readable"
  ON souvera_knowledge_base
  FOR SELECT
  USING (status = 'active');
```

#### 2.2 Sample Data Structure

```json
{
  "term_key": "signal_strength",
  "term_label": "Signal Strength",
  "category": "metric",
  "tooltip_short": "Signal Strength measures investment attractiveness (0-100), combining economic growth (30%), investment climate (40%), political stability (20%), and data confidence (10%).",
  "modal_title": "What is Signal Strength?",
  "modal_summary": "Signal Strength is a proprietary composite score (0-100) that measures a country's overall investment attractiveness for institutional investors, businesses, and trade partners.",
  "modal_content": {
    "sections": [
      {
        "heading": "How It's Calculated",
        "content": "...",
        "subsections": [
          {"title": "Investment Climate (40%)", "points": ["...", "..."]},
          {"title": "Economic Growth (30%)", "points": ["...", "..."]},
          {"title": "Political Stability (20%)", "points": ["...", "..."]},
          {"title": "Data Confidence (10%)", "points": ["...", "..."]}
        ]
      },
      {
        "heading": "Signal Levels",
        "content": "...",
        "levels": [
          {"range": "70-100", "label": "HIGH GROWTH", "color": "green", "description": "..."},
          {"range": "50-69", "label": "MODERATE GROWTH", "color": "yellow", "description": "..."},
          {"range": "30-49", "label": "WATCH", "color": "orange", "description": "..."},
          {"range": "0-29", "label": "RISK", "color": "red", "description": "..."}
        ]
      }
    ]
  },
  "related_terms": ["investment_score", "confidence_score", "economic_momentum"],
  "learn_more_url": "/docs/methodology/signal-strength",
  "data_sources": ["World Bank", "IMF", "OECD", "UNCTAD"]
}
```

---

### Phase 3: Integration Points (Week 2)

#### 3.1 Signal Strength Badge (Header)
```tsx
// In CountryHeaderBar.tsx
<div className="flex items-center gap-3">
  <div className="flex flex-col items-end">
    <span className="text-[10px] font-bold uppercase flex items-center gap-1">
      Signal
      <HelpTooltip term="signal_strength" size="sm" position="bottom" />
    </span>
    <span className="text-lg font-black">{signalColor.label}</span>
  </div>
  <div className="w-3 h-3 rounded-full animate-pulse" />
</div>
```

#### 3.2 Economic Momentum Row
```tsx
// In SignalMomentumRow.tsx
<div>
  <div className="text-xs text-zinc-600 uppercase flex items-center gap-1">
    Economic Momentum
    <HelpTooltip term="economic_momentum" size="sm" />
  </div>
  <div className="text-2xl font-bold">{momentum.index}%</div>
</div>
```

#### 3.3 Metric Cards
```tsx
// In MetricCardV2.tsx
<div className="flex items-center justify-between mb-2">
  <h3 className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">
    {metric.label}
    <HelpTooltip term={metric.key} size="sm" />
  </h3>
  <Lock className="w-3 h-3 text-zinc-600" />
</div>
```

#### 3.4 Trade Agreements
```tsx
// In OverviewTabV2.tsx (Market Access Card)
<p className="font-bold text-white mb-1 flex items-center gap-2">
  🇺🇸 AGOA: Duty-Free Exports to United States
  <HelpTooltip term="agoa" size="md" position="right" />
</p>
```

---

### Phase 4: Analytics & Optimization (Week 3)

#### 4.1 Track User Engagement
```tsx
// In HelpTooltip.tsx
const handleClick = () => {
  // Track which terms users click most
  analytics.track('help_tooltip_clicked', {
    term: term,
    location: window.location.pathname,
    timestamp: new Date().toISOString(),
  });
  
  setModalOpen(true);
};
```

#### 4.2 Popular Terms Dashboard (Admin)
```sql
-- Query: Most clicked help terms (last 30 days)
SELECT 
  term,
  COUNT(*) as clicks,
  COUNT(DISTINCT user_id) as unique_users
FROM analytics_events
WHERE event_name = 'help_tooltip_clicked'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY term
ORDER BY clicks DESC
LIMIT 20;
```

**Use Cases:**
- Identify confusing terms → improve definitions
- Prioritize documentation efforts
- A/B test different explanations

---

## 📱 Responsive Behavior

### Desktop (≥1024px)
1. **Hover**: Show tooltip immediately (200ms delay)
2. **Click**: Open detailed modal
3. **Keyboard**: Tab to focus, Enter/Space to open modal

### Tablet (768px - 1023px)
1. **Tap**: Open detailed modal directly (no hover)
2. **Tooltip**: Skip tooltip, go straight to modal

### Mobile (<768px)
1. **Tap**: Open detailed modal (full-screen on mobile)
2. **Swipe Down**: Close modal
3. **Back Button**: Close modal

---

## 🎨 Visual Design Specs

### Info Icon (ⓘ)
```css
.help-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1); /* blue-500/10 */
  color: rgb(59, 130, 246); /* blue-500 */
  font-size: 10px;
  font-weight: 600;
  cursor: help;
  transition: all 200ms ease;
}

.help-icon:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: scale(1.1);
}
```

### Tooltip
```css
.help-tooltip {
  max-width: 280px;
  padding: 8px 12px;
  background: rgba(24, 24, 27, 0.95); /* zinc-950 */
  border: 1px solid rgb(39, 39, 42); /* zinc-800 */
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  font-size: 12px;
  line-height: 1.5;
  color: rgb(212, 212, 216); /* zinc-300 */
  z-index: 9999;
}

.help-tooltip::after {
  /* Arrow pointing to icon */
  content: '';
  position: absolute;
  border: 6px solid transparent;
  border-top-color: rgba(24, 24, 27, 0.95);
}
```

### Modal
```css
.help-modal {
  max-width: 640px;
  max-height: 80vh;
  background: rgb(9, 9, 11); /* zinc-950 */
  border: 1px solid rgb(39, 39, 42); /* zinc-800 */
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow-y: auto;
}

.help-modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgb(39, 39, 42);
}

.help-modal-content {
  padding: 24px;
}

.help-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid rgb(39, 39, 42);
  background: rgba(24, 24, 27, 0.5);
}
```

---

## ✅ Implementation Checklist

### Week 1: Core Components
- [ ] Create `HelpTooltip` component (hover + click)
- [ ] Create `HelpModal` component (detailed view)
- [ ] Create knowledge base schema in Supabase
- [ ] Seed initial content (10 core terms)
- [ ] Test on desktop (hover + click)
- [ ] Test on mobile (tap only)

### Week 2: Integration
- [ ] Add to Signal Strength badge (header)
- [ ] Add to Economic Momentum row
- [ ] Add to all metric cards (Executive Snapshot)
- [ ] Add to trade agreements (AGOA, AfCFTA, ECOWAS)
- [ ] Add to sector terms (Technology, Finance, Agriculture)
- [ ] Add to risk/opportunity narratives

### Week 3: Content & Analytics
- [ ] Write full documentation for all 30+ terms
- [ ] Implement analytics tracking
- [ ] Create admin dashboard for popular terms
- [ ] A/B test tooltip vs direct modal
- [ ] Optimize content based on user engagement
- [ ] Create public documentation site (/docs)

---

## 📊 Success Metrics

### User Engagement:
- **Tooltip Views**: Track hover events (desktop)
- **Modal Opens**: Track click events (desktop + mobile)
- **Time Spent**: How long users read modal content
- **Popular Terms**: Which terms get clicked most

### User Education:
- **Comprehension**: Survey users after 30 days
- **Support Tickets**: Reduction in "What does X mean?" tickets
- **Feature Adoption**: Increased use of advanced features after education

### Content Quality:
- **Bounce Rate**: Users who close modal immediately (< 5s)
- **Scroll Depth**: How far users scroll in modal content
- **Learn More Clicks**: Users who want full documentation

---

## 🚀 Next Steps

1. **Review & Approve** this plan
2. **Phase 1**: Build core components (Week 1)
3. **Phase 2**: Seed knowledge base content (Week 1)
4. **Phase 3**: Integrate across platform (Week 2)
5. **Phase 4**: Analytics & optimization (Week 3)

---

**End of Plan**  
**Ready for Implementation Approval**
