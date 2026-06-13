# Session 4: Bloomberg-Grade Sectors Tab Build Plan

**Date**: May 14, 2026 (00:35 UTC-4)  
**Status**: Planning  
**Goal**: Build comprehensive Sectors Tab with Nigeria as template for all 73 markets

---

## 🎯 Objective

Transform the basic Sectors placeholder into a **Bloomberg-grade sectoral intelligence system** that investors use to identify specific industry opportunities.

**Key Principle**: Each sector should tell a complete investment story with scores, rationale, key players, and AGOA opportunities.

---

## 📊 Current State

**Existing Placeholder** (`CountryIntelligencePanelV2.tsx`):
- ✅ Basic structure (vertical list of sectors)
- ✅ Score display (Strength, Growth, Attractiveness)
- ✅ Entitlement gating (Professional+ for rationale)
- ❌ No data (shows "Sector data pending")
- ❌ No icons/visual hierarchy
- ❌ No AGOA opportunities
- ❌ No key companies
- ❌ No help tooltips

---

## 🏗️ Proposed Architecture

### Nigeria's 5 Priority Sectors

**1. Technology** (Highest Priority)
- **Why**: 18% of GDP, +15% YoY growth, Africa's leading fintech hub
- **Sub-sectors**: Fintech, E-commerce, Digital Services, Telecom
- **AGOA Opportunity**: Software services, IT consulting (if AGOA extends to services)

**2. Agriculture** (High Priority)
- **Why**: 25% of GDP, value-add processing opportunity, export potential
- **Sub-sectors**: Cocoa, Cashews, Palm Oil, Cassava Processing
- **AGOA Opportunity**: Processed agricultural products (duty-free to U.S.)

**3. Finance** (Medium-High Priority)
- **Why**: Regional banking hub, M-Pesa mobile money pioneer
- **Sub-sectors**: Banking, Insurance, Microfinance, Payment Systems
- **AGOA Opportunity**: Financial services (if AGOA extends)

**4. Manufacturing** (Medium Priority)
- **Why**: Light manufacturing, textiles, AGOA-eligible products
- **Sub-sectors**: Textiles, Apparel, Plastics, Food Processing
- **AGOA Opportunity**: Textiles and apparel (duty-free to U.S.)

**5. Energy** (Medium Priority)
- **Why**: Oil & gas dominance, renewable energy transition
- **Sub-sectors**: Oil, Natural Gas, Solar, Wind, Hydro
- **AGOA Opportunity**: Energy products (crude oil currently eligible)

---

## 🎨 Enhanced UI Design

### Sector Card Layout

```
┌──────────────────────────────────────────────────────────────┐
│  💻 TECHNOLOGY                                    [Export PNG]│
│  ────────────────────────────────────────────────────────     │
│                                                               │
│  Africa's Leading Fintech Hub                                │
│  Lagos is the epicenter of African fintech innovation,       │
│  with 18% of Nigeria's GDP driven by technology.             │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  SECTOR SCORES (Professional+)                       │    │
│  │  ────────────────────────────────────────────────    │    │
│  │  💪 Strength: 85/100        [████████░░] ⓘ          │    │
│  │  📈 Growth: 92/100           [█████████░] ⓘ          │    │
│  │  ⭐ Attractiveness: 88/100   [████████░░] ⓘ          │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  📊 SOUVERA NARRATIVE (Professional+)                        │
│  ────────────────────────────────────────────────────────     │
│  Nigeria's technology sector is experiencing explosive       │
│  growth (+15% YoY), driven by fintech innovation...          │
│  [Read Full Analysis →]                                      │
│                                                               │
│  🏢 KEY PLAYERS                                              │
│  ────────────────────────────────────────────────────────     │
│  • Flutterwave (Payments) - $3B valuation                    │
│  • Paystack (Fintech) - Acquired by Stripe                   │
│  • Interswitch (Payments) - $1B+ revenue                     │
│  • Andela (Tech Talent) - Global footprint                   │
│                                                               │
│  🇺🇸 AGOA OPPORTUNITY (Business+)                            │
│  ────────────────────────────────────────────────────────     │
│  Software & IT Services: If AGOA extends to services,        │
│  Nigerian tech companies could export software duty-free     │
│  to the $28T U.S. market. Current exports: $120M/year.       │
│  Potential: $500M+ by 2030.                                  │
│                                                               │
│  📅 Updated: May 13, 2026 | Sources: CBN, NITDA, Partech    │
└──────────────────────────────────────────────────────────────┘
```

### Key UI Elements:

1. **Sector Icon + Name** (visual hierarchy)
2. **Teaser** (1-2 sentences for Explorer tier)
3. **Sector Scores** (Professional+):
   - Strength Score (0-100) with bar chart
   - Growth Score (0-100) with bar chart
   - Attractiveness Score (0-100) with bar chart
   - Help tooltips (ⓘ) for each score
4. **Souvera Narrative** (Professional+):
   - 2-3 paragraphs of analysis
   - Progressive disclosure ("Read Full Analysis")
5. **Key Players** (Public access):
   - Top 3-5 companies
   - Brief description + key metric
6. **AGOA Opportunity** (Business+):
   - Specific products/services eligible
   - Export potential with numbers
7. **Export Button** (Professional+):
   - Export sector card as PNG
8. **Footer**: Data sources + freshness

---

## 📊 Data Schema

### Supabase Table: `souvera_country_sectors`

```sql
CREATE TABLE souvera_country_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES souvera_countries(id),
  sector_key TEXT NOT NULL,              -- 'technology', 'agriculture'
  sector_label TEXT NOT NULL,            -- 'Technology', 'Agriculture'
  icon_emoji TEXT,                       -- '💻', '🌾'
  display_order INT DEFAULT 0,
  
  -- Teaser (Public/Explorer)
  teaser TEXT,                           -- 1-2 sentences
  
  -- Scores (Professional+)
  strength_score INT,                    -- 0-100
  growth_score INT,                      -- 0-100
  attractiveness_score INT,              -- 0-100
  
  -- Narrative (Professional+)
  narrative_short TEXT,                  -- 2-3 paragraphs
  narrative_full_md TEXT,                -- Full markdown analysis
  
  -- Key Players (Public)
  key_players JSONB,                     -- [{ name, description, metric }]
  
  -- AGOA Opportunity (Business+)
  agoa_opportunity TEXT,                 -- Specific opportunity text
  agoa_export_current_usd NUMERIC,       -- Current exports
  agoa_export_potential_usd NUMERIC,     -- Potential by 2030
  
  -- Metadata
  data_sources TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status souvera_row_status DEFAULT 'active',
  
  UNIQUE(country_id, sector_key)
);

CREATE INDEX idx_country_sectors_country ON souvera_country_sectors(country_id);
CREATE INDEX idx_country_sectors_order ON souvera_country_sectors(display_order);
```

### Sample Data Structure (Nigeria Technology):

```json
{
  "country_id": "uuid-for-nigeria",
  "sector_key": "technology",
  "sector_label": "Technology",
  "icon_emoji": "💻",
  "display_order": 1,
  "teaser": "Africa's leading fintech hub with 18% of GDP driven by technology. Lagos is the epicenter of digital innovation across the continent.",
  "strength_score": 85,
  "growth_score": 92,
  "attractiveness_score": 88,
  "narrative_short": "Nigeria's technology sector is experiencing explosive growth (+15% YoY), driven by fintech innovation, e-commerce expansion, and digital services adoption. Lagos has emerged as Africa's Silicon Valley, with over 400 tech startups and $2B+ in VC funding (2020-2025). Mobile internet penetration exceeds 75%, creating unprecedented opportunities in fintech, e-commerce, and digital services. The sector now contributes 18% of GDP, up from 12% in 2020.",
  "narrative_full_md": "...",
  "key_players": [
    {
      "name": "Flutterwave",
      "sector": "Payments",
      "description": "Pan-African payment infrastructure",
      "metric": "$3B valuation (2024)"
    },
    {
      "name": "Paystack",
      "sector": "Fintech",
      "description": "Payment gateway (acquired by Stripe)",
      "metric": "$200M acquisition"
    },
    {
      "name": "Interswitch",
      "sector": "Payments",
      "description": "Card payment processing",
      "metric": "$1B+ annual revenue"
    },
    {
      "name": "Andela",
      "sector": "Tech Talent",
      "description": "Global tech talent marketplace",
      "metric": "30,000+ developers"
    }
  ],
  "agoa_opportunity": "If AGOA extends to services, Nigerian tech companies could export software and IT services duty-free to the $28 trillion U.S. market. Current software/IT service exports to U.S.: $120M/year. Potential by 2030: $500M+ with AGOA extension and trade facilitation.",
  "agoa_export_current_usd": 120000000,
  "agoa_export_potential_usd": 500000000,
  "data_sources": ["Central Bank of Nigeria", "NITDA", "Partech Africa", "TechCrunch"],
  "updated_at": "2026-05-13T00:00:00Z"
}
```

---

## 🎯 Implementation Plan

### Phase 1: Component Enhancement (2-3 hours)

**1.1 Create `SectorsTab.tsx` (separate file)**
- Extract from `CountryIntelligencePanelV2.tsx`
- Enhanced sector card with all sections
- Responsive design (mobile-first)
- Help tooltips for scores

**1.2 Add Sector Score Help Tooltips**
- Add to `knowledge-base.ts`:
  - `sector_strength_score`
  - `sector_growth_score`
  - `sector_attractiveness_score`

**1.3 Implement Progressive Disclosure**
- "Read Full Analysis" expansion for narrative
- Mobile: Full screen modal
- Desktop: Inline expansion

---

### Phase 2: Data Layer (1-2 hours)

**2.1 Create Supabase Schema**
- Run migration for `souvera_country_sectors` table
- Add RLS policies (Public: teaser + key players; Professional+: scores + narrative; Business+: AGOA)

**2.2 Seed Nigeria Sectors**
- Create `seed-nigeria-sectors.ts` script
- Populate 5 sectors with full data

**2.3 Update API Route**
- Modify `/api/v1/country/[iso3]/route.ts`
- Fetch sectors with entitlement filtering
- Return in response as `data.sectors`

---

### Phase 3: Integration & Testing (1 hour)

**3.1 Import `SectorsTab` Component**
- Update `CountryIntelligencePanelV2.tsx`
- Remove placeholder, use new component

**3.2 Test Entitlement Gating**
- Explorer: Teaser + key players only
- Professional: + Scores + narrative
- Business: + AGOA opportunity

**3.3 Mobile Responsiveness**
- Test on mobile (< 768px)
- Verify score bars are visible
- Check progressive disclosure works

---

## 📐 Visual Design Specs

### Sector Icons (Emoji)
- Technology: 💻
- Agriculture: 🌾
- Finance: 💰
- Manufacturing: 🏭
- Energy: ⚡

### Score Colors
- **Strength**: Blue-400 (`#60A5FA`)
- **Growth**: Emerald-400 (`#34D399`)
- **Attractiveness**: Purple-400 (`#C084FC`)

### Score Bar Thresholds
- 80-100: Excellent (full bar, bright color)
- 60-79: Good (3/4 bar)
- 40-59: Moderate (1/2 bar, dimmed)
- 0-39: Weak (1/4 bar, very dim)

---

## ✅ Success Metrics

### Content Quality:
- ✅ Each sector has compelling narrative
- ✅ Scores are data-driven and justified
- ✅ Key players are accurate and current
- ✅ AGOA opportunities are specific and quantified

### UX Quality:
- ✅ Visual hierarchy is clear (icons, scores, sections)
- ✅ Entitlement gating works correctly
- ✅ Mobile-responsive (cards stack nicely)
- ✅ Help tooltips explain scores
- ✅ Progressive disclosure reduces cognitive load

### Bloomberg-Grade Checklist:
- ✅ Data-driven insights (not generic descriptions)
- ✅ Actionable intelligence (specific opportunities)
- ✅ Comprehensive coverage (5 key sectors)
- ✅ Clear visual hierarchy (scannable at a glance)
- ✅ Evidence-based (sources cited)

---

## 🚀 Next Steps After Sectors Tab

Once Sectors Tab is complete, the natural progression is:

1. **Opportunity Tab** (investment thesis, FDI, growth drivers)
2. **Risk Tab** (risk narrative, scorecard, mitigation)
3. **Trade Tab** (bilateral trade flows, AGOA data, HS codes)
4. **Reports Tab** (PDF, PowerPoint, Excel exports)

---

## 💡 Key Differentiator

**Souvera's Unique Angle**: We're the only platform that explicitly links sector analysis to **AGOA opportunities** with quantified export potential. This makes Souvera indispensable for U.S. importers and African exporters.

Example: "Technology sector AGOA potential: $500M by 2030 if services included."

No other platform provides this level of sectoral + trade intelligence integration.

---

**Ready to build?** 

Confirm and I'll implement:
1. Enhanced `SectorsTab` component
2. Nigeria sector seed data (5 sectors)
3. Sector score help tooltips
4. API integration

**Estimated time**: 4-6 hours for complete implementation.
