# Phase 4B Implementation Plan
## Data Infrastructure and Trade Policy Intelligence Foundation

**Document Type:** Implementation Plan  
**Classification:** Internal — Engineering  
**Date:** 2026-05-06  
**Version:** 1.0  
**Owner:** Afronovation Engineering Team  
**Status:** Active Implementation

---

## 1. Phase 4B Objectives

Build the data infrastructure foundation and trade policy intelligence layer:

1. **Source Registry MVP** — Admin management of data sources
2. **Indicator Builder MVP** — Define and configure metrics
3. **Ingestion Framework** — Manual and scheduled data ingestion
4. **Trade Policy Trackers** — AGOA eligibility and AfCFTA status
5. **Supply-Demand Matrix** — Basic 74-market × 7-sector view

### Confirmed Phase 4A Baseline

- 74 Souvera markets (54 Africa + 20 Caribbean)
- ESH/Western Sahara excluded from public scope
- Universal 7-sector taxonomy deployed
- 518 total country-sector rows
- Explorer: 1 teaser sector
- Professional+: 7 sectors with top 5 + "+2 more sectors"

---

## 2. Database Schema

### 2.1 New Tables

```sql
-- Phase 4B tables to create
1. souvera_source_credentials        -- Encrypted API credentials
2. souvera_source_update_policies    -- Refresh schedules
3. souvera_indicator_source_links    -- Indicator-to-source mapping
4. souvera_data_ingestion_runs       -- Ingestion run ledger
5. souvera_data_quality_findings     -- Validation errors/warnings
6. souvera_country_code_crosswalks   -- External code mappings
7. souvera_manual_upload_batches     -- File upload tracking
8. souvera_manual_upload_rows        -- Individual uploaded rows
9. souvera_trade_policy_statuses     -- AGOA/AfCFTA status
10. souvera_sector_supply_demand     -- 74×7 supply-demand signals
```

### 2.2 New Enums

```sql
-- Source confidence level
souvera_confidence_level: high | medium | low | curated

-- Data freshness status
souvera_freshness_status: fresh | recent | stale | expired

-- Ingestion run type
souvera_ingestion_type: scheduled | manual | upload

-- Trade policy status types
souvera_agoa_status: eligible | suspended | graduated | ineligible | not_applicable
souvera_afcfta_status: signed | ratified | deposited | trading | not_signed
```

### 2.3 Schema Extensions

Extend existing `souvera_data_sources`:
- Add `confidence_level`
- Add `source_type` (api | file | manual)
- Add `attribution_template`

Extend existing `souvera_indicators`:
- Add `freshness_threshold_days`
- Add `visibility_label` (curated_preview | source_attributed)

---

## 3. Admin Routes

### 3.1 Data Management Routes

| Route | Purpose |
|-------|---------|
| `/admin/data/sources` | Source registry management |
| `/admin/data/sources/[id]` | Source detail/edit |
| `/admin/data/indicators` | Indicator definitions |
| `/admin/data/indicators/[id]` | Indicator detail/edit |
| `/admin/data/ingestion` | Ingestion run history |
| `/admin/data/ingestion/trigger` | Manual ingestion trigger |
| `/admin/data/quality` | Data quality dashboard |
| `/admin/data/quality/[finding_id]` | Finding detail |
| `/admin/data/crosswalks` | Country code crosswalk management |
| `/admin/data/upload` | Manual file upload |

### 3.2 Admin API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/v1/admin/sources` | GET, POST | List/create sources |
| `/api/v1/admin/sources/[id]` | GET, PUT, DELETE | Source CRUD |
| `/api/v1/admin/indicators` | GET, POST | List/create indicators |
| `/api/v1/admin/indicators/[id]` | GET, PUT, DELETE | Indicator CRUD |
| `/api/v1/admin/ingestion/trigger` | POST | Trigger manual ingestion |
| `/api/v1/admin/ingestion/runs` | GET | List ingestion runs |
| `/api/v1/admin/upload` | POST | File upload endpoint |
| `/api/v1/admin/crosswalks` | GET, POST | Crosswalk management |

---

## 4. Public/Entitled Routes

### 4.1 Trade Intelligence Routes

| Route | Purpose | Entitlement |
|-------|---------|-------------|
| `/intelligence/trade` | Trade intelligence hub | Explorer (teaser) |
| `/intelligence/trade/agoa` | AGOA eligibility tracker | Explorer (teaser) / Pro+ (full) |
| `/intelligence/trade/afcfta` | AfCFTA status tracker | Explorer (teaser) / Pro+ (full) |
| `/intelligence/trade/supply-demand` | Supply-demand matrix | Professional+ |

### 4.2 Trade API Routes

| Route | Method | Purpose | Entitlement |
|-------|--------|---------|-------------|
| `/api/v1/trade/agoa` | GET | AGOA status by country | Entitled |
| `/api/v1/trade/afcfta` | GET | AfCFTA status by country | Entitled |
| `/api/v1/trade/supply-demand` | GET | Supply-demand matrix | Professional+ |

---

## 5. Component Architecture

### 5.1 Admin Components

```
apps/api-gateway/src/components/admin/data/
├── SourceList.tsx              -- Source registry list
├── SourceForm.tsx              -- Create/edit source
├── SourceDetail.tsx            -- Source detail view
├── IndicatorList.tsx           -- Indicator list
├── IndicatorForm.tsx           -- Create/edit indicator
├── IngestionRunList.tsx        -- Ingestion history
├── IngestionTrigger.tsx        -- Manual trigger UI
├── DataQualityDashboard.tsx    -- Quality overview
├── QualityFindingList.tsx      -- Finding list
├── CrosswalkManager.tsx        -- Crosswalk editor
├── FileUploader.tsx            -- CSV/Excel/JSON upload
└── UploadValidator.tsx         -- Validation preview
```

### 5.2 Trade Intelligence Components

```
apps/api-gateway/src/components/trade/
├── TradeIntelligenceHub.tsx    -- Hub page
├── AGOATracker.tsx             -- AGOA eligibility display
├── AGOACountryCard.tsx         -- Country status card
├── AfCFTATracker.tsx           -- AfCFTA status display
├── AfCFTACountryCard.tsx       -- Country status card
├── SupplyDemandMatrix.tsx      -- 74×7 matrix
├── SupplyDemandCell.tsx        -- Matrix cell
└── TradeDataBadge.tsx          -- Source/freshness badge
```

### 5.3 Shared Components

```
apps/api-gateway/src/components/data/
├── SourceAttributionBadge.tsx  -- Source attribution display
├── FreshnessBadge.tsx          -- Freshness indicator
├── ConfidenceBadge.tsx         -- Confidence level
├── DataPendingPlaceholder.tsx  -- "Data pending" display
└── EntitledDataCard.tsx        -- Entitlement-aware data card
```

---

## 6. Ingestion Framework

### 6.1 Manual Upload Flow

```
1. Admin navigates to /admin/data/upload
2. Admin selects source type (AGOA, AfCFTA, etc.)
3. Admin uploads CSV/Excel/JSON file
4. System validates:
   - File format and structure
   - Required columns present
   - ISO3 codes against 74-market scope
   - ESH/Western Sahara rejected
   - Source metadata present
   - as_of_date present
5. System shows validation preview:
   - Valid rows (green)
   - Invalid rows (red) with error details
   - Warnings (yellow)
6. Admin confirms import
7. System creates ingestion run record
8. System imports valid rows
9. System records rejected rows and quality findings
10. Admin reviews results in quality dashboard
```

### 6.2 Scheduled Ingestion Flow

```
1. Cron trigger fires (e.g., weekly for WDI)
2. System creates ingestion run record
3. System fetches data from API
4. System validates data
5. System transforms and maps to indicators
6. System upserts observations
7. System updates freshness timestamps
8. System logs completion/errors
9. Admin notified of any failures
```

### 6.3 API Validation Wrapper Flow

```
1. System calls external API
2. System captures response
3. System validates response structure
4. System maps country codes via crosswalk
5. System calculates freshness status
6. System returns normalized data with attribution
```

---

## 7. UI Requirements

### 7.1 Data Display Format

All displayed metrics must include:

```typescript
interface DisplayedMetric {
  // Value
  value: number | string | null;
  formatted_value: string;
  
  // Attribution
  source_name: string;
  source_type: 'api' | 'file' | 'manual';
  
  // Temporal
  as_of_date: Date;
  last_reviewed_at: Date;
  
  // Quality
  freshness_status: 'fresh' | 'recent' | 'stale' | 'expired';
  confidence_level: 'high' | 'medium' | 'low' | 'curated';
  
  // Access
  min_plan_id: string;
  is_entitled: boolean;
}
```

### 7.2 Display Labels

| Source Type | Label |
|-------------|-------|
| API-backed | "Source-Attributed Preview" |
| File upload | "Curated Preview Data" |
| Manual entry | "Curated Preview Data" |
| Missing data | "Data pending" |

### 7.3 Freshness Badge Colors

| Status | Color | Icon |
|--------|-------|------|
| Fresh | Green | ● |
| Recent | Yellow | ● |
| Stale | Orange | ● |
| Expired | Red | ● |

---

## 8. Sprint Plan

### Sprint 1: Foundation (Weeks 1-2)

**Goal:** Database schema and admin infrastructure

| Task | Points | Owner |
|------|--------|-------|
| Create SQL migration (Phase 4B tables) | 5 | Engineering |
| Source Registry admin UI | 8 | Engineering |
| Indicator Builder admin UI (basic) | 5 | Engineering |
| Country code crosswalk population | 3 | Engineering |
| Audit logging infrastructure | 2 | Engineering |
| **Sprint Total** | **23** | |

### Sprint 2: Manual Data Pipeline (Weeks 3-4)

**Goal:** File upload and trade policy trackers

| Task | Points | Owner |
|------|--------|-------|
| CSV/Excel/JSON upload connector | 8 | Engineering |
| Upload validation with ISO3 scope check | 5 | Engineering |
| Ingestion run ledger | 5 | Engineering |
| AGOA eligibility tracker (manual) | 5 | Engineering |
| AfCFTA status tracker (manual) | 5 | Engineering |
| Data freshness badges | 3 | Engineering |
| **Sprint Total** | **31** | |

### Sprint 3: API Integration (Weeks 5-6)

**Goal:** World Bank WDI and API wrappers

| Task | Points | Owner |
|------|--------|-------|
| World Bank WDI API connector | 8 | Engineering |
| Scheduled ingestion framework | 8 | Engineering |
| Census API validation wrapper | 5 | Engineering |
| Comtrade API validation wrapper | 5 | Engineering |
| Source health monitoring | 3 | Engineering |
| **Sprint Total** | **29** | |

### Sprint 4: Intelligence Views (Weeks 7-8)

**Goal:** Trade intelligence pages and matrix

| Task | Points | Owner |
|------|--------|-------|
| Trade intelligence hub page | 5 | Engineering |
| AGOA tracker public page | 5 | Engineering |
| AfCFTA tracker public page | 5 | Engineering |
| Supply-demand matrix (74×7) | 8 | Engineering |
| Admin data quality dashboard | 5 | Engineering |
| Entitlement behavior verification | 3 | Engineering |
| **Sprint Total** | **31** | |

### Sprint 5: QA and Polish (Weeks 9-10)

**Goal:** Testing, documentation, and handoff

| Task | Points | Owner |
|------|--------|-------|
| Browser QA (all routes) | 5 | QA |
| Entitlement QA (Explorer vs Pro+) | 3 | QA |
| Documentation updates | 3 | Engineering |
| Bug fixes and polish | 8 | Engineering |
| Phase 4B completion review | 2 | Team |
| **Sprint Total** | **21** | |

---

## 9. Acceptance Criteria

Phase 4B is complete only when:

1. ✅ Admin can manage sources in `/admin/data/sources`
2. ✅ Admin can define indicators in `/admin/data/indicators`
3. ✅ Admin can upload AGOA/AfCFTA status via CSV
4. ✅ Admin can run manual ingestion trigger
5. ✅ Scheduled WDI ingestion works (weekly)
6. ✅ Ingestion runs are logged in ledger
7. ✅ Data quality issues visible in admin dashboard
8. ✅ Country code crosswalk validates 74-market scope
9. ✅ AGOA tracker renders without hardcoded eligible counts
10. ✅ AfCFTA tracker renders with source attribution
11. ✅ Basic supply-demand matrix renders (74×7)
12. ✅ Explorer sees teaser-level data only
13. ✅ Professional+ sees expanded data with attribution
14. ✅ Browser QA passes all routes
15. ✅ No UI uses "live data" or "real-time"
16. ✅ Phase 4C items remain deferred

---

## 10. Out of Scope (Phase 4C)

- Full HS-code product intelligence
- Product opportunity scoring
- Tariff preference calculators
- UN Comtrade product-flow analytics
- U.S. Census/USITC production product intelligence
- Trade report builder

---

**Document Version:** 1.0  
**Classification:** Internal — Engineering  
**Last Updated:** 2026-05-06  
**Owner:** Afronovation Engineering Team
