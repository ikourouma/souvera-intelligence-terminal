# Phase 3: Terminal Data Foundation - Implementation Plan

**Version:** 1.0  
**Date:** April 28, 2026  
**Status:** Planning  
**Owner:** Engineering Team

---

## Executive Summary

**Objective:** Transform Souvera from an executive-auth-ready platform into a functional intelligence MVP by connecting the interactive map and public intelligence preview to governed Souvera data.

**Current State:**
- ✅ Database schema complete (sql-pack-v1.1.sql)
- ✅ `/api/v1/country-lite` endpoint fully functional
- ✅ Entitlement system operational
- ⚠️ No seed data in database
- ⚠️ `/intelligence/map` is placeholder page
- ⚠️ No data observations populated

**Target State:**
- Interactive map with 54 African + 20 Caribbean countries
- Clickable countries revealing entitlement-aware data
- Fully attributed sources and freshness labels
- "Curated Preview Data" labeling for demo/seed data
- No frontend entitlement filtering

**Timeline:** 2-3 days (with seed data preparation)

---

## 1. Current Data/API Inventory

### 1.1 Existing Database Schema

**Location:** `infra/supabase/sql-pack-v1.1.sql`

**Core Tables (✅ Already Created):**

| Table | Purpose | Status | Records |
|-------|---------|--------|---------|
| `souvera_countries` | Country identity (iso2, iso3, name, region, capital, flags, coordinates) | ✅ Created | ⚠️ Empty |
| `souvera_data_sources` | Source registry (World Bank, IMF, REST Countries, etc.) | ✅ Created | ⚠️ Empty |
| `souvera_indicators` | Metric definitions (GDP, population, FDI, etc.) | ✅ Created | ⚠️ 10 seeded |
| `souvera_country_observations` | Time-series data points | ✅ Created | ⚠️ Empty |
| `souvera_country_profiles` | Editorial content (narratives, teasers, theses) | ✅ Created | ⚠️ Empty |
| `souvera_country_sectors` | Sector-level intelligence | ✅ Created | ⚠️ Empty |
| `souvera_country_signal_scores` | Investment/confidence scores | ✅ Created | ⚠️ Empty |
| `souvera_plans` | Access plans | ✅ Created | ✅ Seeded |
| `souvera_entitlements` | Feature entitlements | ✅ Created | ✅ Seeded |
| `souvera_plan_entitlements` | Plan-to-entitlement mapping | ✅ Created | ✅ Seeded |

**Tiered Views (✅ Already Created):**

| View | Purpose | Base Query | Status |
|------|---------|------------|--------|
| `souvera_country_lite_v` | Public tier data | GDP, population, signal level | ✅ Ready |
| `souvera_country_professional_v` | Professional tier | Lite + FDI, inflation, FX, narrative | ✅ Ready |
| `souvera_country_business_v` | Business+ tier | Professional + forecasts, thesis | ✅ Ready |
| `souvera_latest_observations_v` | Latest metrics per country/indicator | Aggregates observations | ✅ Ready |

**Helper Functions (✅ Already Created):**
- `souvera_current_user_plan_rank()` - Returns user's highest plan rank
- `souvera_current_user_has_entitlement(key)` - Checks entitlement access
- `souvera_plan_rank(plan_key)` - Returns rank for plan

### 1.2 Existing API Endpoints

#### `/api/v1/country-lite` - ✅ FULLY FUNCTIONAL

**Location:** `apps/api-gateway/src/app/api/v1/country-lite/route.ts`

**Current Implementation:**
```typescript
GET /api/v1/country-lite?iso3=ZMB

// 1. Resolves user access (public/authenticated)
const access = await resolveUserAccess(authSupabase, user?.id);

// 2. Selects appropriate view
const dataView = getDataView(access); 
// Returns: 'souvera_country_lite_v', 'souvera_country_professional_v', or 'souvera_country_business_v'

// 3. Queries country from view
const { data: countryData } = await supabase
  .from(dataView)
  .select('*')
  .eq('iso3', iso3)
  .single();

// 4. Fetches sectors with entitlement-based field selection
const sectorSelect = hasEntitlement(access, 'sector_rationale')
  ? 'sector_label, teaser_md, rationale_md, strength_score, growth_score'
  : 'sector_label, teaser_md';

// 5. Returns structured JSON with metadata
```

**Response Structure:**
```json
{
  "country": {
    "iso2": "ZM",
    "iso3": "ZMB",
    "name": "Zambia",
    "region": "Africa",
    "capital": "Lusaka",
    "flagUrl": "..."
  },
  "metrics": {
    "gdpCurrentUsd": 29000000000,
    "gdpGrowthPct": 4.2,
    "populationTotal": 19610000,
    // Professional+ only:
    "fdiNetInflowsUsd": 500000000,
    "inflationCpiPct": 9.1
  },
  "signal": {
    "level": "emerging",
    "investmentScore": 72,
    "confidenceScore": 68
  },
  "sectors": [...],
  "freshness": {
    "updatedAt": "2026-04-15T00:00:00Z"
  },
  "meta": {
    "product": "souvera",
    "owner": "Afronovation, Inc.",
    "accessTier": "public",
    "authenticated": false,
    "generatedAt": "2026-04-28T22:09:00Z",
    "sources": [
      { "key": "rest_countries", "name": "REST Countries API" },
      { "key": "world_bank", "name": "World Bank Indicators API" }
    ]
  }
}
```

**Status:** ✅ Production-ready, no changes needed

### 1.3 Existing Frontend Pages

#### `/intelligence/map` - ⚠️ PLACEHOLDER

**Location:** `apps/api-gateway/src/app/intelligence/map/page.tsx`

**Current State:**
- Marketing page with feature descriptions
- "Request Access" CTA
- No interactive map
- No API integration

**Existing Map Component:**
- ✅ `apps/api-gateway/src/components/sections/africa-map.tsx` exists!
- Interactive SVG map of Africa
- Already has country click handlers
- Needs integration with country-lite API

---

## 2. Required Supabase Tables

### 2.1 Tables Status

All required tables already exist in `sql-pack-v1.1.sql`:

✅ **Identity & Access:**
- `souvera_countries`
- `souvera_plans`
- `souvera_entitlements`
- `souvera_plan_entitlements`

✅ **Data Registry:**
- `souvera_data_sources`
- `souvera_indicators`

✅ **Intelligence Data:**
- `souvera_country_observations`
- `souvera_country_profiles`
- `souvera_country_sectors`
- `souvera_country_signal_scores`

**No new tables required for Phase 3.**

### 2.2 Views Status

All required views already exist:

✅ `souvera_latest_observations_v` - Aggregates latest data per country/indicator  
✅ `souvera_country_lite_v` - Public tier snapshot  
✅ `souvera_country_professional_v` - Professional tier snapshot  
✅ `souvera_country_business_v` - Business+ tier snapshot

**No new views required for Phase 3.**

---

## 3. Required Seed Data

### 3.1 Critical Seed Data

**Priority: HIGH - Blockers for functional MVP**

| Table | Records Needed | Source | Status |
|-------|---------------|--------|--------|
| `souvera_countries` | 54 African + 20 Caribbean | REST Countries API | ⚠️ Required |
| `souvera_data_sources` | 5-10 sources | Manual | ⚠️ Required |
| `souvera_country_observations` | Demo data for 20 countries | Manual/World Bank | ⚠️ Required |

**Priority: MEDIUM - Enhances MVP**

| Table | Records Needed | Source | Status |
|-------|---------------|--------|--------|
| `souvera_country_profiles` | Editorial for 5-10 key countries | Manual | Optional |
| `souvera_country_signal_scores` | Investment scores for 20 countries | Manual | Optional |

**Priority: LOW - Post-MVP**

| Table | Records Needed | Source | Status |
|-------|---------------|--------|--------|
| `souvera_country_sectors` | Top 5 sectors per country | Manual | Deferred |

### 3.2 Country Seed Data Specification

**File:** `infra/supabase/sql-pack-v1.5-seed-africa-caribbean.sql`

**Africa (54 countries):**
```sql
INSERT INTO public.souvera_countries 
(iso2, iso3, name, region, subregion, capital, currency_code, flag_svg_url, lat, lng, is_african_country) 
VALUES
  ('DZ', 'DZA', 'Algeria', 'Africa', 'Northern Africa', 'Algiers', 'DZD', 'https://flagcdn.com/dz.svg', 28.0339, 1.6596, true),
  ('AO', 'AGO', 'Angola', 'Africa', 'Middle Africa', 'Luanda', 'AOA', 'https://flagcdn.com/ao.svg', -11.2027, 17.8739, true),
  ('BJ', 'BEN', 'Benin', 'Africa', 'Western Africa', 'Porto-Novo', 'XOF', 'https://flagcdn.com/bj.svg', 9.3077, 2.3158, true),
  -- ... 51 more countries
  ('ZM', 'ZMB', 'Zambia', 'Africa', 'Eastern Africa', 'Lusaka', 'ZMW', 'https://flagcdn.com/zm.svg', -13.1339, 27.8493, true),
  ('ZW', 'ZWE', 'Zimbabwe', 'Africa', 'Eastern Africa', 'Harare', 'ZWL', 'https://flagcdn.com/zw.svg', -19.0154, 29.1549, true);
```

**Caribbean (20 countries):**
```sql
  ('BB', 'BRB', 'Barbados', 'Americas', 'Caribbean', 'Bridgetown', 'BBD', 'https://flagcdn.com/bb.svg', 13.1939, -59.5432, false),
  ('JM', 'JAM', 'Jamaica', 'Americas', 'Caribbean', 'Kingston', 'JMD', 'https://flagcdn.com/jm.svg', 18.1096, -77.2975, false),
  ('TT', 'TTO', 'Trinidad and Tobago', 'Americas', 'Caribbean', 'Port of Spain', 'TTD', 'https://flagcdn.com/tt.svg', 10.6918, -61.2225, false),
  -- ... 17 more countries
```

**Data Source:** REST Countries API (https://restcountries.com/v3.1/all)

### 3.3 Data Source Seed Specification

**File:** `infra/supabase/sql-pack-v1.5-seed-data-sources.sql`

```sql
INSERT INTO public.souvera_data_sources 
(key, name, domain, provider_url, api_docs_url, source_status, priority_rank) 
VALUES
  ('rest_countries', 'REST Countries', 'identity', 'https://restcountries.com/', 'https://restcountries.com/', 'approved', 1),
  ('world_bank', 'World Bank Indicators', 'macro', 'https://data.worldbank.org/', 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392', 'approved', 10),
  ('imf', 'International Monetary Fund', 'macro', 'https://www.imf.org/', 'https://www.imf.org/en/Data', 'approved', 20),
  ('trading_economics', 'Trading Economics', 'macro', 'https://tradingeconomics.com/', 'https://docs.tradingeconomics.com/', 'testing', 30),
  ('open_exchange_rates', 'Open Exchange Rates', 'fx', 'https://openexchangerates.org/', 'https://docs.openexchangerates.org/', 'approved', 40),
  ('un_comtrade', 'UN Comtrade', 'trade', 'https://comtrade.un.org/', 'https://comtrade.un.org/data/doc/api/', 'testing', 50)
ON CONFLICT (key) DO NOTHING;
```

### 3.4 Demo Observations Specification

**File:** `infra/supabase/sql-pack-v1.5-seed-demo-observations.sql`

**Strategy:** Manually seed latest observations for 20 key African countries

**Key Countries:**
1. Nigeria (NGA)
2. South Africa (ZAF)
3. Egypt (EGY)
4. Kenya (KEN)
5. Ghana (GHA)
6. Tanzania (TZA)
7. Ethiopia (ETH)
8. Morocco (MAR)
9. Angola (AGO)
10. Côte d'Ivoire (CIV)
11. Zambia (ZMB)
12. Rwanda (RWA)
13. Uganda (UGA)
14. Senegal (SEN)
15. Tunisia (TUN)
16. Botswana (BWA)
17. Mozambique (MOZ)
18. Namibia (NAM)
19. Zimbabwe (ZWE)
20. Democratic Republic of Congo (COD)

**Required Indicators per Country:**
- `gdp_current_usd` - GDP in current USD
- `gdp_growth_pct` - Annual GDP growth %
- `population_total` - Total population

**Example:**
```sql
-- Get country and indicator IDs first
WITH country AS (SELECT id FROM public.souvera_countries WHERE iso3 = 'NGA'),
     gdp_indicator AS (SELECT id FROM public.souvera_indicators WHERE key = 'gdp_current_usd'),
     growth_indicator AS (SELECT id FROM public.souvera_indicators WHERE key = 'gdp_growth_pct'),
     pop_indicator AS (SELECT id FROM public.souvera_indicators WHERE key = 'population_total'),
     wb_source AS (SELECT id FROM public.souvera_data_sources WHERE key = 'world_bank')

INSERT INTO public.souvera_country_observations 
(country_id, indicator_id, period_date, period_type, value_numeric, source_id, fetched_at, published_at)
SELECT 
  (SELECT id FROM country),
  (SELECT id FROM gdp_indicator),
  '2024-12-31'::date,
  'annual',
  477380000000::numeric, -- Nigeria GDP 2024
  (SELECT id FROM wb_source),
  '2026-04-15T00:00:00Z'::timestamptz,
  '2025-10-01T00:00:00Z'::timestamptz
UNION ALL
SELECT 
  (SELECT id FROM country),
  (SELECT id FROM growth_indicator),
  '2024-12-31'::date,
  'annual',
  3.25::numeric, -- Nigeria GDP growth 2024
  (SELECT id FROM wb_source),
  '2026-04-15T00:00:00Z'::timestamptz,
  '2025-10-01T00:00:00Z'::timestamptz
UNION ALL
SELECT 
  (SELECT id FROM country),
  (SELECT id FROM pop_indicator),
  '2024-12-31'::date,
  'annual',
  223800000::numeric, -- Nigeria population 2024
  (SELECT id FROM wb_source),
  '2026-04-15T00:00:00Z'::timestamptz,
  '2025-10-01T00:00:00Z'::timestamptz;
```

**Repeat for 19 more countries.**

**Data Sources:**
- World Bank Open Data API: https://data.worldbank.org/
- Manual entry from latest available data (2023-2024)
- Label as "Curated Preview Data" in UI

---

## 4. Route/API Plan

### 4.1 Countries List Endpoint (NEW)

**Route:** `/api/v1/countries`  
**Method:** `GET`  
**Purpose:** Return all countries for map visualization

**Query Parameters:**
- `region` (optional): Filter by region (`africa`, `caribbean`, `all`)

**File:** `apps/api-gateway/src/app/api/v1/countries/route.ts`

**Implementation:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import { resolveUserAccess, getDataView } from '@souvera/entitlements';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'all';

    // 1. Resolve user access
    let access;
    try {
      const authSupabase = await createServerClient();
      const { data: { user } } = await authSupabase.auth.getUser();
      access = await resolveUserAccess(authSupabase, user?.id);
    } catch {
      // Default to public access
      access = {
        userId: '',
        email: null,
        planRank: 0,
        planId: 'public',
        entitlements: ['country_identity', 'headline_macro'],
        organizationId: null,
        organizationRole: null,
        isAuthenticated: false,
      };
    }

    const supabase = getServiceClient();
    const dataView = getDataView(access);

    // 2. Build query
    let query = supabase
      .from(dataView)
      .select('iso3, name, region, capital, lat, lng, gdp_current_usd, population_total, signal_level, freshness_at')
      .eq('is_active', true)
      .order('name', { ascending: true });

    // 3. Filter by region
    if (region === 'africa') {
      query = query.eq('is_african_country', true);
    } else if (region === 'caribbean') {
      query = query.eq('is_african_country', false).eq('region', 'Americas');
    }

    const { data: countries, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch countries' },
        { status: 500 }
      );
    }

    // 4. Return with metadata
    return NextResponse.json({
      countries: countries || [],
      meta: {
        product: 'souvera',
        accessTier: access.planId,
        authenticated: access.isAuthenticated,
        generatedAt: new Date().toISOString(),
        region: region,
        count: countries?.length || 0,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (err) {
    console.error('[API] countries error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Response Example:**
```json
{
  "countries": [
    {
      "iso3": "DZA",
      "name": "Algeria",
      "region": "Africa",
      "capital": "Algiers",
      "lat": 28.0339,
      "lng": 1.6596,
      "gdpCurrentUsd": 195000000000,
      "populationTotal": 44900000,
      "signalLevel": "emerging",
      "freshnessAt": "2026-04-15T00:00:00Z"
    },
    // ... more countries
  ],
  "meta": {
    "product": "souvera",
    "accessTier": "explorer",
    "authenticated": true,
    "generatedAt": "2026-04-28T22:10:00Z",
    "region": "africa",
    "count": 54
  }
}
```

### 4.2 Existing Country Detail Endpoint

**Route:** `/api/v1/country-lite?iso3=XXX`  
**Status:** ✅ Already functional  
**No changes required.**

---

## 5. UI Component Plan

### 5.1 Interactive Map Component

**File:** `apps/api-gateway/src/app/intelligence/map/page.tsx` (convert from placeholder)

**Architecture:**

```
/intelligence/map
├── MapContainer (Server Component)
│   ├── Fetches user access via getUser()
│   └── Passes access tier to client
│
└── InteractiveMap (Client Component)
    ├── Fetches /api/v1/countries?region=africa
    ├── Renders AfricaMapSVG (reuse existing)
    ├── Click country → opens CountryDrawer
    └── CountryDrawer
        ├── Fetches /api/v1/country-lite?iso3=XXX
        ├── Displays entitlement-appropriate data
        └── Shows sources/freshness
```

**Implementation Steps:**

1. **Convert page to hybrid server/client**
2. **Reuse existing `africa-map.tsx` component**
3. **Create `CountryDrawer` component**
4. **Add preview data banner**

### 5.2 Country Drawer Component

**File:** `apps/api-gateway/src/components/intelligence/CountryDrawer.tsx`

**Props:**
```typescript
interface CountryDrawerProps {
  iso3: string;
  onClose: () => void;
  userPlan: string;
}
```

**Layout:**

```
┌─────────────────────────────────────┐
│ [X] Close                            │
│                                      │
│ 🇿🇲 Zambia                           │
│ Capital: Lusaka                      │
│ Region: Eastern Africa               │
│                                      │
│ ⚠️ Curated Preview Data              │
│ Sources: World Bank, REST Countries  │
│ Last updated: April 15, 2026         │
│                                      │
│ ── Key Metrics ──                    │
│ GDP: $29.0B                          │
│ Population: 19.6M                    │
│ GDP Growth: 4.2%                     │
│                                      │
│ [Professional+ only content below]   │
│ ── Investment Profile ──             │
│ Signal Level: Emerging               │
│ FDI Inflows: $500M                   │
│ Inflation: 9.1%                      │
│                                      │
│ [Business+ only content below]       │
│ ── Forecast ──                       │
│ GDP Forecast: 4.8%                   │
│                                      │
│ [Upgrade CTA if gated]               │
│ [Upgrade to Professional] →          │
└─────────────────────────────────────┘
```

**Entitlement Display Logic:**

```typescript
// Show/hide sections based on what API returns
// If API doesn't return field, it's gated

{countryData.metrics.fdiNetInflowsUsd && (
  <div className="metric">
    <label>FDI Inflows</label>
    <value>{formatCurrency(countryData.metrics.fdiNetInflowsUsd)}</value>
  </div>
)}

{!countryData.narrative && userPlan === 'explorer' && (
  <UpgradePrompt 
    feature="Investment Narrative" 
    suggestedPlan="Professional"
  />
)}
```

### 5.3 Preview Data Banner Component

**File:** `apps/api-gateway/src/components/intelligence/PreviewDataBanner.tsx`

```typescript
export function PreviewDataBanner({ 
  sources, 
  freshnessAt 
}: { 
  sources: { key: string; name: string }[]; 
  freshnessAt?: string;
}) {
  return (
    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
        <div className="text-sm">
          <p className="text-amber-400 font-semibold mb-1">
            Curated Preview Data
          </p>
          <p className="text-amber-400/80">
            Data shown is from curated sources and may not reflect real-time updates. 
            Live data feeds are in development.
          </p>
          <div className="mt-2 text-xs text-amber-400/60">
            <span>Sources: {sources.map(s => s.name).join(', ')}</span>
            {freshnessAt && (
              <span className="ml-3">Last updated: {formatDate(freshnessAt)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5.4 Fallback Behavior

**No Data Scenarios:**

| Scenario | Display | CTA |
|----------|---------|-----|
| **Country has no observations** | Show country identity (name, capital, flag) only | "Data coming soon" message |
| **Metric unavailable** | Show "N/A" or "—" | None (normal for some countries) |
| **Entire view empty** | Show map with country outlines | "Data in development" banner |
| **User lacks entitlement** | Show teaser + blurred content | "Upgrade to [Plan]" button |

**Implementation:**

```typescript
// In CountryDrawer
if (!countryData || !countryData.metrics) {
  return (
    <div className="p-8 text-center">
      <Database className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Data Coming Soon</h3>
      <p className="text-zinc-400">
        Detailed intelligence for {countryData.country.name} is being prepared.
      </p>
    </div>
  );
}

// For individual metrics
<div className="metric">
  <label>FDI Inflows</label>
  <value>{countryData.metrics.fdiNetInflowsUsd 
    ? formatCurrency(countryData.metrics.fdiNetInflowsUsd)
    : 'N/A'
  }</value>
</div>
```

---

## 6. Entitlement Behavior

### 6.1 Data Access Matrix

| Feature | Public | Explorer | Professional | Business+ | Institutional |
|---------|--------|----------|--------------|-----------|---------------|
| **Map Access** | ✅ View | ✅ View | ✅ View | ✅ View | ✅ View |
| **Country List** | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |
| **Click Country** | ✅ Drawer | ✅ Drawer | ✅ Drawer | ✅ Drawer | ✅ Drawer |
| **Country Identity** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Basic Metrics** | ✅ GDP, pop | ✅ GDP, pop | ✅ GDP, pop | ✅ GDP, pop | ✅ GDP, pop |
| **Signal Level** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **FDI, Inflation** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **FX Rates** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Narrative Summary** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Forecasts** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Investment Thesis** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Sector Details** | ❌ Teasers | ❌ Teasers | ✅ Rationale | ✅ + Scores | ✅ + Scores |
| **Download/Export** | ❌ | ❌ | ❌ | ❌ | ✅ PDF |

### 6.2 Server-Side Enforcement

**Critical Rule:** ALL entitlement checks happen server-side in API routes.

**Existing Implementation (✅ Already Correct):**

```typescript
// From /api/v1/country-lite/route.ts

// 1. View selection based on plan
const dataView = getDataView(access);
// Returns: 'souvera_country_lite_v', 'souvera_country_professional_v', or 'souvera_country_business_v'

// 2. Query from plan-appropriate view
const { data: countryData } = await supabase
  .from(dataView)  // ← Server-side view selection
  .select('*')
  .eq('iso3', iso3)
  .single();

// 3. Conditional field selection
const sectorSelect = hasEntitlement(access, 'sector_rationale')
  ? 'sector_label, teaser_md, rationale_md, strength_score, growth_score'
  : 'sector_label, teaser_md';

// 4. Conditional response fields
...(hasEntitlement(access, 'full_macro') && {
  fdiNetInflowsUsd: countryData.fdi_net_inflows_usd,
  inflationCpiPct: countryData.inflation_cpi_pct,
}),
```

**Frontend Only Displays What Server Returns:**

```typescript
// CountryDrawer.tsx

// ✅ CORRECT: Check if field exists in response
{countryData.metrics.fdiNetInflowsUsd && (
  <div>FDI: {formatCurrency(countryData.metrics.fdiNetInflowsUsd)}</div>
)}

// ❌ WRONG: Don't check user plan in frontend
{userPlan === 'professional' && (
  <div>FDI: {/* this would be frontend filtering */}</div>
)}
```

### 6.3 Upgrade Prompts

**When to Show:**
- User on Explorer plan, viewing Professional-only content area
- User on Professional plan, viewing Business-only content area
- Always show upgrade prompt BELOW available content, not INSTEAD of it

**Implementation:**

```typescript
// Show available content first
{countryData.metrics.gdpCurrentUsd && (
  <div>GDP: {formatCurrency(countryData.metrics.gdpCurrentUsd)}</div>
)}

// Then show upgrade prompt for gated content
{!countryData.narrative && access.planId !== 'institutional' && (
  <UpgradePrompt 
    feature="Investment Narrative & Analysis"
    currentPlan={access.planId}
    suggestedPlan="professional"
    variant="banner"
  />
)}
```

---

## 7. Source/Freshness Behavior

### 7.1 Display Requirements

**Every data display MUST show:**

1. **Source Attribution**
   - "Sources: World Bank, REST Countries API"
   - From `meta.sources` array in API response

2. **Freshness Timestamp**
   - "Last updated: April 15, 2026"
   - From `freshness.updatedAt` in API response
   - Format as human-readable date

3. **Data Status Label**
   - "Curated Preview Data" (for seed/demo data)
   - "Live Data" (when real-time ingestion implemented - Phase 4+)

### 7.2 Preview Data Banner

**Required on ALL pages showing seed data:**

```typescript
<PreviewDataBanner 
  sources={countryData.meta.sources}
  freshnessAt={countryData.freshness.updatedAt}
/>
```

**Content:**
```
⚠️ Curated Preview Data

Data shown is from curated sources and may not reflect real-time updates. 
Live data feeds are in development.

Sources: World Bank, REST Countries API
Last updated: April 15, 2026
```

### 7.3 Per-Metric Freshness

**Optional Enhancement:** Show freshness per indicator

```typescript
// In CountryDrawer
<div className="metric">
  <label>GDP (Current USD)</label>
  <value>$29.0B</value>
  <source className="text-xs text-zinc-500">
    World Bank • Updated Apr 15, 2026
  </source>
</div>
```

**Data from `souvera_latest_observations_v`:**
- `source_name` - "World Bank Indicators"
- `fetched_at` - When Souvera fetched the data
- `published_at` - When source published the data

### 7.4 Missing Data Labels

**If metric unavailable:**

```typescript
<div className="metric">
  <label>FX Rate to USD</label>
  <value className="text-zinc-600">Not available</value>
</div>
```

**If entire section unavailable:**

```typescript
{!countryData.narrative && (
  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-sm">
    <p className="text-zinc-500 text-sm">
      Investment narrative not yet available for this country.
    </p>
  </div>
)}
```

---

## 8. Risks

| Risk ID | Risk | Severity | Likelihood | Mitigation | Owner |
|---------|------|----------|------------|------------|-------|
| **R3-001** | No seed data in database | HIGH | Certain | Create sql-pack-v1.5 with Africa + Caribbean seed | Backend |
| **R3-002** | Empty observations table | HIGH | Certain | Manually insert demo observations for 20 countries | Backend |
| **R3-003** | Map component integration complexity | MEDIUM | Medium | Reuse existing africa-map.tsx component | Frontend |
| **R3-004** | API performance with 74 countries | MEDIUM | Low | Implement caching (600s), limit fields in list view | Backend |
| **R3-005** | Freshness mislabeling | LOW | Medium | Always show "Preview Data" banner for pilot | Frontend |
| **R3-006** | Entitlement leakage in frontend | LOW | Low | Server-side filtering already implemented correctly | N/A |
| **R3-007** | Caribbean map not available | LOW | High | Phase 3 focuses on Africa map, Caribbean in Phase 4 | Product |
| **R3-008** | Seed data inaccuracies | MEDIUM | Medium | Use official World Bank data, label as preview | Backend |
| **R3-009** | Users expect live data | LOW | Medium | Clear "Curated Preview" messaging everywhere | Product |
| **R3-010** | Build errors from new components | LOW | Low | Incremental testing, TypeScript validation | Frontend |

### 8.1 Critical Path

**Blockers (Must Complete First):**
1. Create and run seed migrations (sql-pack-v1.5)
2. Verify data appears in views

**Dependencies:**
- Map component depends on `/api/v1/countries` endpoint
- Country drawer depends on `/api/v1/country-lite` (already exists)
- Drawer depends on seed data in database

---

## 9. Acceptance Criteria

Phase 3 is **COMPLETE** when:

### 9.1 Database & Seed Data

- [ ] **sql-pack-v1.5-seed-africa-caribbean.sql** created
  - [ ] 54 African countries seeded
  - [ ] 20 Caribbean countries seeded
  - [ ] All with coordinates (lat, lng)
  - [ ] All with flag URLs
  
- [ ] **sql-pack-v1.5-seed-data-sources.sql** created
  - [ ] 5-10 data sources seeded
  - [ ] World Bank, IMF, REST Countries included
  
- [ ] **sql-pack-v1.5-seed-demo-observations.sql** created
  - [ ] Demo observations for 20 key countries
  - [ ] GDP, population, growth for each
  - [ ] Labeled with source and freshness

- [ ] **Migrations applied to Supabase**
  - [ ] All tables populated
  - [ ] Views return data
  - [ ] Manual verification in Supabase dashboard

### 9.2 API Endpoints

- [ ] **`/api/v1/countries` endpoint created**
  - [ ] Returns all countries for map
  - [ ] Entitlement-aware field filtering
  - [ ] Includes lat/lng for positioning
  - [ ] Returns freshness metadata
  - [ ] Caching configured (600s)
  - [ ] Region filter works (`?region=africa`)

- [ ] **`/api/v1/country-lite` verified**
  - [ ] Tested with seeded data
  - [ ] Returns correct data for ZMB, NGA, KEN
  - [ ] Entitlement filtering works

### 9.3 Frontend Components

- [ ] **`/intelligence/map` page converted**
  - [ ] No longer placeholder
  - [ ] Fetches `/api/v1/countries?region=africa`
  - [ ] Renders interactive map
  - [ ] Countries clickable
  - [ ] Preview data banner visible

- [ ] **Interactive map component**
  - [ ] Reuses existing `africa-map.tsx`
  - [ ] Country click handlers integrated
  - [ ] Hover tooltips show country name
  - [ ] Color coding by signal level (if available)

- [ ] **Country drawer component created**
  - [ ] Opens on country click
  - [ ] Fetches `/api/v1/country-lite?iso3=XXX`
  - [ ] Displays country identity (flag, name, capital)
  - [ ] Shows metrics based on plan tier
  - [ ] Displays sources and freshness
  - [ ] Shows "Preview Data" banner
  - [ ] Upgrade prompt for gated content

- [ ] **Preview data banner component**
  - [ ] Shows on map page
  - [ ] Shows in country drawer
  - [ ] Lists sources
  - [ ] Shows freshness date
  - [ ] Clear "Curated Preview" language

### 9.4 Data Labeling

- [ ] **All data correctly labeled**
  - [ ] "Curated Preview Data" banner on all pages
  - [ ] No "live data" or "real-time" claims
  - [ ] Sources attributed on every display
  - [ ] Freshness dates shown
  - [ ] Missing data labeled as "N/A" or "Not available"

### 9.5 Entitlement Compliance

- [ ] **No frontend entitlement filtering**
  - [ ] All gating happens in API routes
  - [ ] UI only shows/hides based on API response
  - [ ] Verified via network inspection

- [ ] **Upgrade prompts functional**
  - [ ] Show when content is gated
  - [ ] Link to `/access` page
  - [ ] Display correct suggested plan

### 9.6 Technical Quality

- [ ] **Build succeeds**
  - [ ] `npm run build` passes
  - [ ] No new TypeScript errors
  - [ ] No new console errors

- [ ] **Lint passes** (or only pre-existing warnings)
  - [ ] `npm run lint` runs
  - [ ] No new errors introduced

- [ ] **Manual QA passed**
  - [ ] Test with public access (unauthenticated)
  - [ ] Test with explorer account
  - [ ] Test with professional account
  - [ ] Verify entitlement gating works
  - [ ] Check freshness labels display

### 9.7 Documentation

- [ ] **Phase 3 implementation summary created**
  - [ ] `docs/phase3-implementation-summary.md`
  - [ ] Lists all files changed/created
  - [ ] Documents seed data sources
  - [ ] Includes before/after screenshots

---

## 10. Implementation Plan

### 10.1 Task Breakdown

**Priority 1: Seed Data (Day 1, 4-6 hours)**

| Task | Owner | Estimate | Dependencies |
|------|-------|----------|--------------|
| Create sql-pack-v1.5-seed-africa-caribbean.sql | Backend | 2h | REST Countries API data |
| Create sql-pack-v1.5-seed-data-sources.sql | Backend | 30min | None |
| Create sql-pack-v1.5-seed-demo-observations.sql | Backend | 2-3h | World Bank data |
| Apply migrations to Supabase | Backend | 30min | All seed files ready |
| Verify data in views | Backend | 30min | Migrations applied |

**Priority 2: API Endpoints (Day 1-2, 2-3 hours)**

| Task | Owner | Estimate | Dependencies |
|------|-------|----------|--------------|
| Create `/api/v1/countries` endpoint | Backend | 1-2h | Seed data applied |
| Test countries endpoint | Backend | 30min | Endpoint created |
| Verify country-lite with seed data | Backend | 30min | Seed data applied |

**Priority 3: Frontend Components (Day 2, 4-6 hours)**

| Task | Owner | Estimate | Dependencies |
|------|-------|----------|--------------|
| Create PreviewDataBanner component | Frontend | 30min | None |
| Create CountryDrawer component | Frontend | 2-3h | country-lite API working |
| Integrate africa-map.tsx | Frontend | 1-2h | countries API working |
| Convert /intelligence/map page | Frontend | 1h | All components ready |

**Priority 4: Testing & Polish (Day 3, 2-4 hours)**

| Task | Owner | Estimate | Dependencies |
|------|-------|----------|--------------|
| Manual QA (public, explorer, professional) | QA | 1-2h | All features implemented |
| Fix bugs found in QA | Dev | 1-2h | QA complete |
| Create implementation summary doc | Docs | 30min | Implementation complete |
| Build and deploy | DevOps | 30min | All tests passed |

### 10.2 Milestone Schedule

**Milestone 1: Data Foundation (End of Day 1)**
- ✅ Seed migrations created
- ✅ Migrations applied to Supabase
- ✅ Data visible in database
- ✅ `/api/v1/countries` endpoint functional

**Milestone 2: Map Functional (End of Day 2)**
- ✅ Africa map displays
- ✅ Countries clickable
- ✅ Country drawer opens with data
- ✅ Preview data banner visible

**Milestone 3: Production Ready (End of Day 3)**
- ✅ All entitlement tiers tested
- ✅ All bugs fixed
- ✅ Build succeeds
- ✅ Implementation summary published

---

## 11. Technical Specifications

### 11.1 API Response Caching

**Countries List:**
```
Cache-Control: public, s-maxage=600, stale-while-revalidate=1200
```
- 10-minute cache
- 20-minute stale revalidation

**Country Detail:**
```
Cache-Control: public, s-maxage=300, stale-while-revalidate=600
```
- 5-minute cache (already configured)
- 10-minute stale revalidation

### 11.2 Database Query Optimization

**Indexes (Already Exist in sql-pack-v1.1.sql):**
- `souvera_countries(iso3)` - Unique index
- `souvera_countries(is_active)` - Filter index
- `souvera_country_observations(country_id, indicator_id)` - Composite index

**No additional indexes required.**

### 11.3 Component State Management

**Map Page State:**
```typescript
// Client component state
const [countries, setCountries] = useState<Country[]>([]);
const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
const [drawerOpen, setDrawerOpen] = useState(false);
const [loading, setLoading] = useState(true);

// Fetch countries on mount
useEffect(() => {
  fetch('/api/v1/countries?region=africa')
    .then(res => res.json())
    .then(data => setCountries(data.countries));
}, []);

// Handle country click
const handleCountryClick = (iso3: string) => {
  setSelectedCountry(iso3);
  setDrawerOpen(true);
};
```

**Country Drawer State:**
```typescript
// Fetches data on mount when iso3 changes
const [countryData, setCountryData] = useState<CountryDetail | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!iso3) return;
  
  fetch(`/api/v1/country-lite?iso3=${iso3}`)
    .then(res => res.json())
    .then(data => setCountryData(data));
}, [iso3]);
```

### 11.4 Error Handling

**API Errors:**
```typescript
// In API routes
try {
  // ... query logic
} catch (err) {
  console.error('[API] error:', err);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

**Frontend Errors:**
```typescript
// In components
if (error) {
  return (
    <div className="p-8 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <p className="text-red-400">Failed to load country data</p>
      <button onClick={() => retry()}>Retry</button>
    </div>
  );
}
```

---

## 12. Out of Scope (Phase 4+)

**Explicitly NOT included in Phase 3:**

- ❌ **Live data ingestion** - Phase 4
- ❌ **Automated data refresh** - Phase 4
- ❌ **Caribbean map component** - Phase 4
- ❌ **Map indicator overlays** (color by GDP, etc.) - Phase 4
- ❌ **Sector-level intelligence** - Phase 4
- ❌ **News signals** - Phase 4
- ❌ **Compare feature** - Phase 4
- ❌ **Watchlists** - Phase 4
- ❌ **PDF export** - Phase 4
- ❌ **Admin dashboard** - Phase 4
- ❌ **Data ingestion UI** - Phase 4
- ❌ **Source health monitoring** - Phase 4

**Phase 3 focuses solely on:**
- ✅ Static seed data
- ✅ Africa map (54 countries)
- ✅ Basic country intelligence
- ✅ Entitlement-aware display
- ✅ "Preview Data" labeling

---

## 13. Success Metrics

**Phase 3 Success = Functional Intelligence MVP**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Countries seeded | 74 (54 Africa + 20 Caribbean) | Count in database |
| Countries with data | 20+ (key markets) | Observation records |
| Map functional | Yes | Manual test |
| Entitlement gating works | Yes | Test 3 plan tiers |
| Preview data labeled | 100% | Visual inspection |
| Build succeeds | Yes | `npm run build` |
| No new errors | 0 new errors | Lint + console |

**Post-Launch Metrics (After Pilot):**
- Map page views
- Country drawer opens
- Conversion from public → explorer
- User feedback on data quality

---

## 14. Rollback Plan

**If Phase 3 causes issues:**

1. **API Only Broken:**
   - Revert API route files
   - Database seed data remains (no harm)
   - Map page reverts to placeholder

2. **Frontend Only Broken:**
   - Revert map page to placeholder
   - APIs remain functional
   - Can be used by other clients

3. **Database Seed Issues:**
   - Seed data is additive (no breaking changes)
   - Can truncate tables if needed
   - Views still work (just return empty)

**Rollback Commands:**
```bash
# Revert code changes
git revert <commit-hash>
git push

# Clear seed data (if needed)
psql -h db.PROJECT.supabase.co -U postgres -d postgres
DELETE FROM public.souvera_country_observations;
DELETE FROM public.souvera_countries;
DELETE FROM public.souvera_data_sources;
```

---

## 15. Next Steps (After Phase 3)

**Phase 4: Live Data Integration**
- Connect World Bank API
- Implement automated ingestion jobs
- Add data refresh scheduling
- Implement source health monitoring
- Remove "Preview Data" labels

**Phase 5: Advanced Intelligence Features**
- Sector-level intelligence
- News signals integration
- Compare feature (multi-country)
- Watchlists and saved views
- Export to PDF/Excel

**Phase 6: Admin & Operations**
- Admin dashboard for data management
- Manual data override tools
- Source configuration UI
- Data quality monitoring

---

## 16. Open Questions

| Question | Owner | Status | Resolution |
|----------|-------|--------|------------|
| Which 20 countries get demo data first? | Product | Open | Suggest: Top GDP + strategic markets |
| Should Caribbean map be in Phase 3 or 4? | Product | Open | Recommend Phase 4 |
| What data vintage for seed (2023 or 2024)? | Product | Open | Recommend latest available (2023-2024) |
| Should we show "data unavailable" or hide section? | Design | Open | Recommend show with "N/A" |
| API rate limiting needed for Phase 3? | Backend | Open | Recommend defer to Phase 4 |

---

## 17. References

**Database Schema:**
- `infra/supabase/sql-pack-v1.1.sql` - All tables and views

**Existing API:**
- `apps/api-gateway/src/app/api/v1/country-lite/route.ts` - Reference implementation

**Entitlement Package:**
- `packages/entitlements/index.ts` - Access control logic

**Existing Map Component:**
- `apps/api-gateway/src/components/sections/africa-map.tsx` - Reusable map SVG

**External APIs:**
- REST Countries API: https://restcountries.com/v3.1/all
- World Bank Open Data: https://data.worldbank.org/

---

## 18. Critical Findings

### 18.1 Positive Findings

| Finding | Impact | Notes |
|---------|--------|-------|
| **Database schema complete** | HIGH | All required tables and views exist in sql-pack-v1.1.sql |
| **Entitlement system operational** | HIGH | `@souvera/entitlements` package working correctly with tiered views |
| **`/api/v1/country-lite` production-ready** | HIGH | Existing endpoint requires no changes; entitlement-aware filtering works |
| **Africa map component exists** | MEDIUM | `africa-map.tsx` can be reused for interactive map |
| **Server-side entitlement enforcement** | HIGH | No frontend filtering; API controls all data access |

### 18.2 Blocking Issues

| Issue | Severity | Resolution |
|-------|----------|------------|
| **No country seed data** | CRITICAL | Must create sql-pack-v1.5 with 74 countries |
| **Empty observations table** | CRITICAL | Must seed demo data for 20 key countries |
| **No data sources seeded** | HIGH | Must seed World Bank, IMF, REST Countries sources |
| **`/intelligence/map` is placeholder** | HIGH | Must convert to functional page with API integration |

### 18.3 Risks Confirmed

| Risk | Confirmed | Mitigation |
|------|-----------|------------|
| Map requires seed data before testing | ✅ Yes | Seed data is first priority |
| Caribbean map not in current SVG | ✅ Yes | Defer to Phase 4 |
| Users may expect live data | ✅ Yes | Clear "Curated Preview" labeling |

---

## 19. Implementation Recommendations

### 19.1 Recommended Approach

**Phased Rollout:**

1. **Phase 3A: Data Foundation** (Priority 1)
   - Create seed migrations
   - Apply to Supabase
   - Verify views return data
   - Create `/api/v1/countries` endpoint
   
2. **Phase 3B: Visual Elevation** (Priority 2)
   - Convert `/intelligence/map` from placeholder
   - Integrate existing `africa-map.tsx`
   - Create `CountryDrawer` component
   - Add preview data banners

3. **Phase 3C: Polish & QA** (Priority 3)
   - Test all entitlement tiers
   - Fix any bugs
   - Complete implementation summary

### 19.2 Key Recommendations

| # | Recommendation | Rationale |
|---|---------------|-----------|
| 1 | **Seed data first** | Map and drawer components cannot be tested without data |
| 2 | **Reuse existing africa-map.tsx** | Reduces implementation time; component already has SVG paths |
| 3 | **Always show "Preview Data" banner** | Sets correct expectations; protects against data accuracy complaints |
| 4 | **No frontend entitlement logic** | Server-side filtering is already correct; don't duplicate |
| 5 | **Focus on Africa first** | Caribbean map can be added in Phase 4 without blocking pilot |
| 6 | **Use World Bank data** | Most reliable, attributable source for macro indicators |

### 19.3 Testing Strategy

**Test with existing test accounts:**
- Test user credentials are stored locally at `docs/Souvera Test Users.txt`
- ⚠️ **SECURITY:** This file is now git-ignored; do not commit credentials
- Test public access (unauthenticated)
- Test explorer tier
- Test professional tier
- Verify entitlement gating at each level

---

## 20. Phase 3A Implementation Sequence

### 20.1 Task Order

```
Phase 3A: Data Foundation
├── 1. Create sql-pack-v1.5-seed-countries.sql
│   ├── 54 African countries from REST Countries API
│   └── 20 Caribbean countries (data only, no map)
│
├── 2. Create sql-pack-v1.5-seed-sources.sql
│   ├── World Bank
│   ├── IMF
│   ├── REST Countries
│   └── Other approved sources
│
├── 3. Create sql-pack-v1.5-seed-observations.sql
│   └── Demo observations for 20 key markets
│
├── 4. Apply migrations to Supabase
│   ├── Run via Supabase SQL editor
│   └── Verify in dashboard
│
├── 5. Test existing views
│   ├── SELECT * FROM souvera_country_lite_v LIMIT 5;
│   ├── SELECT * FROM souvera_country_professional_v LIMIT 5;
│   └── Confirm data appears
│
├── 6. Create /api/v1/countries endpoint
│   ├── Copy pattern from country-lite
│   ├── Return list for map
│   └── Add region filter
│
└── 7. Verify country-lite returns seeded data
    └── GET /api/v1/country-lite?iso3=NGA
```

### 20.2 Files to Create (Phase 3A)

| File | Purpose |
|------|---------|
| `infra/supabase/sql-pack-v1.5-seed-countries.sql` | Country identity data |
| `infra/supabase/sql-pack-v1.5-seed-sources.sql` | Data source registry |
| `infra/supabase/sql-pack-v1.5-seed-observations.sql` | Demo indicator values |
| `apps/api-gateway/src/app/api/v1/countries/route.ts` | Countries list endpoint |

### 20.3 Verification Queries (Phase 3A)

```sql
-- Verify countries seeded
SELECT COUNT(*) AS african_countries 
FROM souvera_countries 
WHERE is_african_country = true;
-- Expected: 54

-- Verify data sources seeded
SELECT COUNT(*) AS data_sources 
FROM souvera_data_sources;
-- Expected: 5-10

-- Verify observations seeded
SELECT c.name, COUNT(*) AS indicators
FROM souvera_country_observations o
JOIN souvera_countries c ON c.id = o.country_id
GROUP BY c.name
ORDER BY indicators DESC
LIMIT 10;
-- Expected: 20 countries with 3+ indicators each

-- Verify lite view has data
SELECT iso3, name, gdp_current_usd, population_total 
FROM souvera_country_lite_v 
WHERE is_african_country = true
LIMIT 5;
```

---

## 21. Phase 3B Visual Elevation Planning Notes

### 21.1 Component Architecture

```
/intelligence/map page
│
├── MapPageServer (Server Component)
│   ├── Resolves user access
│   └── Passes accessTier to client
│
└── MapPageClient (Client Component)
    ├── Fetches /api/v1/countries
    ├── Renders AfricaMap (reuse)
    ├── Handles country click
    └── Renders CountryDrawer
        ├── Fetches /api/v1/country-lite
        ├── Displays entitlement-appropriate data
        ├── Shows PreviewDataBanner
        └── Shows UpgradePrompt (if gated)
```

### 21.2 Files to Create/Modify (Phase 3B)

| File | Action | Purpose |
|------|--------|---------|
| `apps/api-gateway/src/app/intelligence/map/page.tsx` | Modify | Convert from placeholder to functional page |
| `apps/api-gateway/src/components/intelligence/CountryDrawer.tsx` | Create | Slide-out panel for country data |
| `apps/api-gateway/src/components/intelligence/PreviewDataBanner.tsx` | Create | "Curated Preview Data" warning |
| `apps/api-gateway/src/components/sections/africa-map.tsx` | Modify (minor) | Add click handlers for drawer |

### 21.3 Design Requirements (Phase 3B)

**Map Page Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│ [Souvera Mega Nav]                                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ⚠️ Curated Preview Data                                     │
│  Data shown is from curated sources...                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │                   AFRICA MAP                         │   │
│  │                   (Interactive)                      │   │
│  │                                                      │   │
│  │        Click any country for intelligence            │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Region: Africa | Countries: 54 | Last updated: Apr 2026     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ [Footer]                                                     │
└──────────────────────────────────────────────────────────────┘
```

**Country Drawer Layout:**
```
┌─────────────────────────────────────┐
│ [X]                                 │
│                                     │
│ 🇳🇬 Nigeria                         │
│ Capital: Abuja                      │
│ Region: Western Africa              │
│                                     │
│ ⚠️ Curated Preview Data             │
│ Sources: World Bank                 │
│ Last updated: April 15, 2026        │
│                                     │
│ ── Key Metrics ──                   │
│ GDP: $477.4B                        │
│ Population: 223.8M                  │
│ GDP Growth: 3.25%                   │
│                                     │
│ [More details available with        │
│  Professional plan →]               │
│                                     │
└─────────────────────────────────────┘
```

### 21.4 Entitlement Display Rules (Phase 3B)

| Scenario | Display |
|----------|---------|
| **Public user** | Country identity + GDP/population only |
| **Explorer** | + Signal level |
| **Professional** | + FDI, inflation, narrative |
| **Business+** | + Forecasts, thesis |
| **Missing data** | Show "N/A" or "Coming soon" |
| **Gated content** | Show upgrade prompt |

---

## 22. Phase 3C Remaining Page Completion Notes

### 22.1 QA Checklist

**Functional Tests:**
- [ ] Map loads without errors
- [ ] All 54 African countries render
- [ ] Country click opens drawer
- [ ] Drawer displays correct data
- [ ] Preview banner shows on all views
- [ ] Sources and freshness display correctly
- [ ] Missing data shows "N/A"
- [ ] Upgrade prompts appear for gated content

**Entitlement Tests:**
- [ ] Public user sees only basic metrics
- [ ] Explorer sees signal level
- [ ] Professional sees FDI, inflation
- [ ] Business+ sees forecasts
- [ ] Network inspection confirms no extra data sent

**Edge Cases:**
- [ ] Country with no observations shows "Data coming soon"
- [ ] API error shows friendly error message
- [ ] Slow network shows loading state
- [ ] Drawer can be closed and reopened

### 22.2 Documentation to Create (Phase 3C)

| Document | Location | Purpose |
|----------|----------|---------|
| Phase 3 Implementation Summary | `docs/phase3-implementation-summary.md` | Lists all changes, seed data sources |
| Map QA Results | `docs/qa/map-qa.md` | Test results and sign-off |

### 22.3 Build Verification (Phase 3C)

```bash
# Must pass before Phase 3 is complete
npm run build
npm run lint
npm run typecheck

# Expected result:
# - 0 new errors
# - Build succeeds
# - Pre-existing warnings acceptable
```

### 22.4 Deferred to Phase 4

| Feature | Reason |
|---------|--------|
| Caribbean map SVG | Requires new map component |
| Live data ingestion | Needs API integration work |
| Map overlays (color by GDP) | Enhancement, not MVP |
| Sector intelligence | Requires additional seed data |
| Compare feature | Requires multi-country selection UI |

---

## 23. Security Notes

### 23.1 Test Credentials

**Location:** `docs/Souvera Test Users.txt`

**Security Rules:**
- ✅ File is now git-ignored (added to `.gitignore`)
- ❌ Do NOT commit test credentials
- ❌ Do NOT copy passwords into any report
- ❌ Do NOT expose credentials in logs, screenshots, or docs
- ❌ Do NOT share test credentials in GitHub issues or PRs

### 23.2 API Security

- All data access controlled by server-side entitlement checks
- No service role key exposed to client components
- Supabase RLS policies enforced at database level
- `/api/v1/countries` and `/api/v1/country-lite` use authenticated client where available

---

**Plan Version:** 1.1  
**Created:** April 28, 2026  
**Updated:** April 28, 2026 (added Phase 3A/3B/3C sections, security notes)  
**Next Review:** After Phase 3 implementation
