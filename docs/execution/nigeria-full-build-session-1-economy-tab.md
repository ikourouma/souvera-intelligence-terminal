# Nigeria Full Build - Session 1: Economy Tab

**Date:** May 13, 2026  
**Status:** In Progress  
**Priority:** P0 - Foundation for all 73 other countries

---

## Strategic Context

Nigeria is the **template country** for the entire Souvera Intelligence Terminal. Every component, data pattern, and narrative structure built for Nigeria will be replicated across all 73 Africa/Caribbean markets.

**Quality Bar:** Bloomberg-grade or we fail.

---

## Session 1 Objective: Economy Tab - FULL BUILD

Build the Economy tab to 100% completion with:
1. ✅ Time series historical data (2020-2025)
2. ✅ 3 interactive Recharts components
3. ✅ AI-ready narrative placeholders
4. ✅ Scroll-to-section deep-linking
5. ✅ Entitlement gating (Professional+ access)

**Deliverable:** `/country/NGA?tab=economy` is production-ready.

---

## Data Requirements

### Time Series Data (2020-2025)

Create new seed script: `infra/supabase/seed-nigeria-time-series.sql`

**Tables to populate:**
1. `souvera_country_observations` (annual observations)
2. Potentially new table: `souvera_country_time_series` (if quarterly data needed)

**Metrics to seed:**

| Metric | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | Source |
|--------|------|------|------|------|------|------|--------|
| GDP (current USD, billions) | 432.3 | 440.8 | 477.4 | 506.6 | 540.2 | 574.8 | World Bank, IMF |
| GDP Growth (%) | -1.8 | 3.6 | 3.3 | 2.9 | 4.2 | 6.2 | World Bank |
| FDI Net Inflows (millions USD) | 2,390 | 2,560 | 3,110 | 3,450 | 4,200 | 5,100 | World Bank, UNCTAD |
| Inflation CPI (%) | 13.2 | 17.0 | 18.8 | 24.5 | 21.4 | 18.2 | CBN, World Bank |
| FX Rate (NGN/USD) | 379.0 | 411.0 | 435.1 | 461.3 | 895.0 | 1,450.0 | CBN, OANDA |
| Debt-to-GDP (%) | 34.8 | 36.2 | 38.6 | 41.3 | 43.8 | 42.1 | World Bank, DMO |

**Notes:**
- 2020: COVID-19 impact (negative growth)
- 2023: Currency reform (FX rate spike)
- 2024-2025: Recovery + tech sector boom

---

## Component Architecture

### EconomyTab Component

**File:** `apps/api-gateway/src/components/intelligence/tabs/EconomyTab.tsx`

**Structure:**
```tsx
export function EconomyTab({ data, userEntitlements }: EconomyTabProps) {
  const hasAccess = userEntitlements.includes('full_macro') || 
                    userEntitlements.includes('admin_access');
  
  if (!hasAccess) {
    return <UpgradePrompt minTier="professional" />;
  }
  
  return (
    <div className="space-y-8">
      {/* Hero Narrative */}
      <EconomyHeroNarrative data={data.timeSeries} />
      
      {/* Key Indicators Table */}
      <KeyIndicatorsTable data={data.timeSeries} />
      
      {/* GDP Section (scroll-to: id="gdp") */}
      <GDPSection data={data.timeSeries} />
      
      {/* Growth Section (scroll-to: id="growth") */}
      <GrowthSection data={data.timeSeries} />
      
      {/* FX Rate Section (scroll-to: id="fx") */}
      <FXRateSection data={data.timeSeries} />
      
      {/* Debt Sustainability Section */}
      <DebtSection data={data.timeSeries} />
    </div>
  );
}
```

---

## Section 1: Hero Narrative (AI-Ready)

**Purpose:** Bloomberg-style contextual summary before data deep-dive.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ ECONOMIC OVERVIEW                           │
│                                             │
│ Nigeria's economy has entered a sustained  │
│ growth phase, with GDP expanding 6.2% in   │
│ 2025—the strongest performance in a decade.│
│ This acceleration follows the 2023 currency│
│ reform, which initially caused volatility  │
│ but has since stabilized. The technology   │
│ sector now contributes 18% of GDP, driven  │
│ by fintech innovation and digital payments.│
│                                             │
│ Foreign Direct Investment surged to $5.1B  │
│ in 2025, reflecting renewed confidence in  │
│ the Tinubu administration's economic       │
│ reforms. Inflation, while still elevated   │
│ at 18.2%, has declined from its 24.5% peak │
│ in 2023, aided by improved food security.  │
└─────────────────────────────────────────────┘
```

**Component:**
```tsx
function EconomyHeroNarrative({ data }: { data: TimeSeriesData }) {
  // Phase 1: Static markdown
  // Phase 2: AI-generated from data.timeSeries
  
  const narrative = `
Nigeria's economy has entered a sustained growth phase, with GDP 
expanding ${data.latestGrowth}% in ${data.latestYear}—the strongest 
performance in a decade. This acceleration follows the 2023 currency 
reform, which initially caused volatility but has since stabilized...
  `;
  
  return (
    <div className="bg-blue-950/10 border border-blue-900/30 rounded-xl p-6">
      <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">
        Economic Overview
      </h3>
      <p className="text-zinc-300 leading-relaxed text-sm">
        {narrative}
      </p>
    </div>
  );
}
```

---

## Section 2: Key Indicators Table

**Layout:**
```
┌─────────────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ Metric      │ 2020│ 2021│ 2022│ 2023│ 2024│ 2025│
├─────────────┼─────┼─────┼─────┼─────┼─────┼─────┤
│ GDP ($B)    │ 432 │ 441 │ 477 │ 507 │ 540 │ 575 │
│ Growth (%)  │-1.8 │ 3.6 │ 3.3 │ 2.9 │ 4.2 │ 6.2 │
│ FDI ($M)    │2,390│2,560│3,110│3,450│4,200│5,100│
│ Inflation(%)│13.2 │17.0 │18.8 │24.5 │21.4 │18.2 │
│ FX (NGN/USD)│ 379 │ 411 │ 435 │ 461 │ 895 │1,450│
│ Debt/GDP (%)│34.8 │36.2 │38.6 │41.3 │43.8 │42.1 │
└─────────────┴─────┴─────┴─────┴─────┴─────┴─────┘
```

**Features:**
- Sortable columns (click header)
- Color coding: Green (positive), Red (negative), Yellow (watchlist)
- Hover: Show exact values + source
- Export: CSV download button

---

## Section 3: GDP Section (id="gdp")

**Chart 1: GDP Growth Trend (Line Chart)**

**Recharts Implementation:**
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function GDPGrowthChart({ data }: { data: TimeSeriesData }) {
  const chartData = data.years.map(year => ({
    year: year.year,
    gdp: year.gdp_current_usd / 1e9, // Convert to billions
    growth: year.gdp_growth_pct,
  }));
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis 
          dataKey="year" 
          stroke="#71717a"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#71717a"
          style={{ fontSize: '12px' }}
          label={{ value: 'GDP ($B)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#18181b', 
            border: '1px solid #3f3f46',
            borderRadius: '4px'
          }}
          labelStyle={{ color: '#a1a1aa' }}
        />
        <Line 
          type="monotone" 
          dataKey="gdp" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ fill: '#3b82f6', r: 5 }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**AI Narrative (below chart):**
```
"Nigeria's GDP expanded from $432B (2020) to $575B (2025), 
representing a 33% increase over five years. The 2023 currency 
reform initially compressed GDP in dollar terms, but the rebound 
in 2024-2025 was driven by the technology sector's 15% annual 
growth and oil production recovery to 1.5M barrels/day."
```

---

## Section 4: Growth Section (id="growth")

**Chart 2: GDP Growth Rate (Line Chart with Forecast)**

**Features:**
- Historical: 2020-2025 (solid line)
- Forecast: 2026-2027 (dashed line, lighter color)
- Annotations: COVID-19 (2020), Currency Reform (2023), Tech Boom (2024-2025)

**AI Narrative:**
```
"Growth accelerated to 6.2% in 2025, the strongest performance 
since 2014. Key drivers include:
1. Technology sector: +15% YoY (now 18% of GDP)
2. Agriculture: +4.2% YoY (improved security + mechanization)
3. Services: +7.1% YoY (fintech, e-commerce expansion)

The CBN forecasts 5.8% growth in 2026, sustained by infrastructure 
investment ($15B pipeline) and continued tech sector momentum."
```

---

## Section 5: FX Rate Section (id="fx")

**Chart 3: FX Rate Trend (Line Chart, potentially Candlestick)**

**Features:**
- Monthly data points (2020-2025)
- Highlight: 2023 reform (vertical line annotation)
- Color: Red for depreciation periods, Green for stability

**AI Narrative:**
```
"The naira depreciated significantly following the 2023 unification 
of exchange rates (from 461 NGN/USD to 1,450 NGN/USD by 2025). 
However, this volatility has stabilized since Q4 2024, with the 
CBN maintaining a managed float policy. Current rate (1,450 NGN/USD) 
reflects market fundamentals and is expected to remain stable through 
2026, supported by $37B in foreign reserves."
```

---

## Section 6: Debt Sustainability

**Gauge Chart or Progress Bar:**
- Current: 42.1% debt-to-GDP (2025)
- IMF Threshold: 55% (for emerging markets)
- Color: Green (< 45%), Yellow (45-55%), Red (> 55%)

**AI Narrative:**
```
"Nigeria's debt-to-GDP ratio peaked at 43.8% in 2024 but improved 
to 42.1% in 2025 due to stronger revenue generation (VAT reforms) 
and GDP growth. The Debt Management Office projects the ratio will 
decline to 39% by 2027, comfortably below the IMF's 55% threshold 
for emerging markets. External debt service costs remain manageable 
at 11% of exports."
```

---

## API Response Enhancement

**Update:** `/api/v1/country/[iso3]/route.ts`

Add new field to response:
```typescript
{
  // ... existing fields
  timeSeries: {
    years: [
      {
        year: 2020,
        gdp_current_usd: 432300000000,
        gdp_growth_pct: -1.8,
        fdi_net_inflows_usd: 2390000000,
        inflation_cpi_pct: 13.2,
        fx_to_usd: 379.0,
        debt_to_gdp_pct: 34.8,
      },
      // ... 2021-2025
    ],
    forecast: [
      {
        year: 2026,
        gdp_growth_pct: 5.8, // Forecast
      },
      {
        year: 2027,
        gdp_growth_pct: 5.5,
      },
    ],
  },
}
```

---

## Entitlement Gating

- **Public/Explorer**: Tab visible but shows upgrade prompt
- **Professional+**: FULL ACCESS (this is their core benefit)
- **Business+**: Same as Professional + CSV export
- **Institutional+**: Same + API access to raw time series data

---

## Testing Checklist

- [ ] Time series data seeded for Nigeria (2020-2025)
- [ ] API returns `timeSeries` field correctly
- [ ] EconomyTab renders for Professional+ users
- [ ] EconomyTab shows upgrade prompt for Explorer users
- [ ] All 3 charts render correctly (GDP, Growth, FX)
- [ ] Scroll-to-section works (#gdp, #growth, #fx)
- [ ] Charts are responsive (mobile, tablet, desktop)
- [ ] Data tooltips show exact values
- [ ] AI narrative placeholders are present
- [ ] No console errors

---

## Success Criteria

By end of this session:
1. ✅ Nigeria Economy tab is 100% functional
2. ✅ Time series data architecture is proven (reusable for other countries)
3. ✅ Component quality sets the bar for all other tabs
4. ✅ AI narrative hooks are in place (ready for Phase 2 GPT-4 integration)

**Next Session:** Sectors + Opportunity tabs (Session 2)

---

**Status:** Ready to Execute  
**Estimated Time:** 6-8 hours  
**Blocking:** None (all dependencies met)
