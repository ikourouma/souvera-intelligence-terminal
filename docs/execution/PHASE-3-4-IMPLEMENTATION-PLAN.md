# Souvera Phase 3-4 Implementation Plan
**Version:** 1.2  
**Created:** June 13, 2026  
**Last Updated:** June 15, 2026 (4:50 AM)  
**Status:** Phase 3 Complete, Phase 4B Complete, Phase 4C In Progress  
**Owner:** Afronovation, Inc.

---

## Executive Summary

This plan covers the completion of Phase 3 (Super Admin Control Panel) and Phase 4 (Persona Dashboards + Data Foundation). The Fortune 5 Admin Dashboard elevation is complete, including all admin modules.

**Current State:** Phase 3 ✅ Complete, Phase 4B ✅ Complete (Trade Intelligence Live), Phase 4C In Progress (Supply-Demand Matrix), Phase 4D 🔄 Active (Business Dashboard + Sidebar)  
**Active Work:** Business Dashboard with Navigation Sidebar (Days 1-4), Supply-Demand Matrix  
**Next Steps:** Complete Business dashboard with sidebar, test across personas, expand features  
**Estimated Timeline:** 1-2 weeks remaining

---

## Phase Status Overview

| Phase | Component | Status |
|-------|-----------|--------|
| Phase 1 | Access Control Foundation | ✅ Complete |
| Phase 2 | Admin Dashboard (Fortune 5) | ✅ Complete |
| Phase 3A | User Management | ✅ Complete |
| Phase 3B | Access Control Matrix | ✅ Complete |
| Phase 3C | Billing Management | ✅ Complete |
| Phase 3D | Marketing CMS | ✅ Complete |
| Phase 3E | System Configuration | ✅ Complete |
| Phase 4A | Sector Coverage (74 Markets) | ✅ Complete |
| Phase 4B | Data Foundation & Trade Intel | ✅ Complete |
| Phase 4C | Supply-Demand Matrix | 🔄 In Progress |
| Phase 4D | Persona Dashboards | 🔄 In Progress (POC: Business Tier) |

---

## Recent Completions (June 15, 2026)

### Trade Intelligence Modules (Phase 4B) ✅ COMPLETE
- ✅ **AGOA Trade Flows** - `/intelligence/trade/agoa/flows` - African exports to US under AGOA
- ✅ **AfCFTA Trade Flows** - `/intelligence/trade/afcfta/flows` - Top 10 importers/exporters with drawer
- ✅ **CBTPA Trade Flows** - `/intelligence/trade/cbtpa/flows` - Top 10 importers/exporters with drawer
- ✅ **African Import Demand** - `/intelligence/trade/demand` - Top 10 products with drawer, country drill-down
- ✅ **Caribbean Import Demand** - `/intelligence/trade/demand-caribbean` - Top 10 products with drawer
- ✅ **Product Demand Drawer** - Detailed product analysis with top 5 importers, competitors, Souvera analysis
- ✅ **Consistent Top 10 Components** - Shared `Top10Card` component across all modules
- ✅ **Clickable Navigation** - Product drawer → Country drawer drill-down flow

### UI/UX Enhancements
- ✅ Dynamic data-driven top 10 sections (no hard-coded data)
- ✅ PNG export for all sections
- ✅ Consistent color schemes (blue/cyan/emerald) across modules
- ✅ Hover effects and visual feedback
- ✅ Country and product drawers with full analytics

### Admin Panel Enhancements
- ✅ `/admin/system/flags` - Feature flags management
- ✅ `/admin/system/config` - System configuration and health
- ✅ `/admin/system/audit` - Audit logs with filtering/export
- ✅ `/admin/users/organizations` - Organization management
- ✅ `/admin/users/logs` - User access logs (stub for Phase 5)
- ✅ `/admin/users` - Test user visibility fix

### Data Foundation
- ✅ Crosswalks migration (`20260615000001_add_crosswalk_codes_to_countries.sql`)
- ✅ AGOA trade flows table (`20260615000002_create_agoa_trade_flows_table.sql`)
- ✅ 68/74 markets at ≥15/20 Top 20 indicators
- ✅ Universal 7-sector coverage for all 74 markets (518 rows)
- ✅ Trade intelligence data ingested (AfCFTA, CBTPA, AGOA, Import Demand)

---

## Phase 4C: Supply-Demand Matrix (ACTIVE)

**Status:** Planning Phase  
**Target Launch:** Week of June 22, 2026  
**Priority:** High - Investor Tier Differentiator

See detailed implementation plan: `docs/execution/supply-demand-matrix-implementation-plan.md`

---

## Phase 4B: 74-Market Data Ingestion ✅ COMPLETE

### Objective
Ensure all 74 sovereign markets have complete trade intelligence data so no stakeholder query returns "no data."

### Data Coverage Target

| Data Type | Markets | Script | Status |
|-----------|---------|--------|--------|
| AfCFTA Trade Flows | 54 Africa | `ingest-afcfta-flows` | 📋 Ready |
| CBTPA Trade Flows | 20 Caribbean | `ingest-cbtpa-flows` | 📋 Ready |
| Import Demand Signals | 74 All | `ingest-import-demand` | 📋 Ready |
| IMF Gap Fill | 4 Gap Markets | `imf-gap74-fill` | 📋 Ready |
| World Bank Rollout | Gap Markets | `worldbank-rollout-fill` | 📋 Ready |
| Curated Trade/Macro | Gap Markets | `curated-trade-macro-fill` | 📋 Ready |

### Gap Markets (Below 15/20 Indicators)
- **Africa:** Somalia (13/20), Eritrea (8/20), South Sudan (11/20)
- **Caribbean:** Cuba (12/20), Dominica (14/20), Grenada (14/20), St. Kitts (14/20), Puerto Rico (13/20), BVI (5/20), Turks & Caicos (9/20)

### Execution Order
1. Apply crosswalks migration
2. Run trade intelligence ingestion (AfCFTA, CBTPA, Import Demand)
3. Run macro gap fill scripts
4. Verify 74/74 market coverage

---

## Upcoming: Data Source Audit (Item 19)

### Priority Sources to Evaluate
| Source | Type | Coverage | Priority |
|--------|------|----------|----------|
| UN Comtrade API | Trade flows | Global | High |
| ITC Trade Map | Trade intelligence | Global | High |
| IMF WEO/DOTS | Macro + trade | Global | High |
| AfDB Statistics | Africa macro | 54 countries | Medium |
| CARICOM Statistics | Caribbean | 15 countries | Medium |

### Deliverables
- Data source audit report
- Freshness monitoring dashboard
- 2-3 new source integrations

---

## Phase 3C: Billing Management Module (Week 1)

### Objectives
Create a comprehensive billing dashboard for subscription management, revenue tracking, and plan administration.

### Sprint 3C.1: Billing Dashboard (Days 1-2)

#### Tasks
- [ ] Create `/admin/billing` route and page
- [ ] Create billing dashboard with key metrics:
  - Monthly Recurring Revenue (MRR)
  - Annual Recurring Revenue (ARR)
  - Active subscriptions by plan
  - Churn rate
  - New subscriptions (7d/30d)
- [ ] Create subscription trend chart (line graph)
- [ ] Create plan distribution chart (pie/donut)

#### Components to Create
```
apps/api-gateway/src/app/admin/billing/
  page.tsx                 - Billing dashboard
  
apps/api-gateway/src/components/admin/billing/
  RevenueMetrics.tsx       - MRR/ARR cards
  SubscriptionChart.tsx    - Trend visualization
  PlanDistribution.tsx     - Plan breakdown chart
  BillingStatsGrid.tsx     - Quick stats grid
```

#### API Endpoints
```
GET /api/v1/admin/billing/stats      - Revenue metrics
GET /api/v1/admin/billing/trends     - Subscription trends
```

### Sprint 3C.2: Subscription Management (Days 3-4)

#### Tasks
- [ ] Create subscription list page with filters
- [ ] Create subscription detail modal
- [ ] Add subscription actions (extend, cancel, change plan)
- [ ] Create manual subscription creation form
- [ ] Add subscription search and export

#### Components to Create
```
apps/api-gateway/src/app/admin/billing/subscriptions/
  page.tsx                 - Subscription list

apps/api-gateway/src/components/admin/billing/
  SubscriptionTable.tsx    - Searchable subscription list
  SubscriptionDetail.tsx   - Detail modal
  SubscriptionActions.tsx  - Action buttons
  CreateSubscription.tsx   - Manual creation modal
```

#### API Endpoints
```
GET  /api/v1/admin/billing/subscriptions     - List subscriptions
GET  /api/v1/admin/billing/subscriptions/:id - Subscription detail
PUT  /api/v1/admin/billing/subscriptions/:id - Update subscription
POST /api/v1/admin/billing/subscriptions     - Create subscription
```

---

## Phase 3D: Marketing CMS Module (Week 2)

### Objectives
Enable Super Admin to manage homepage content dynamically without code deployment.

### Database Migrations Required

```sql
-- infra/supabase/migrations/20260614000001_create_marketing_cms_tables.sql

-- Hero slides (homepage carousel)
CREATE TABLE souvera_hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text,
  cta_text text,
  cta_url text,
  display_order integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Flash banners (announcement bar)
CREATE TABLE souvera_flash_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'warning', 'success', 'promo')),
  link_text text,
  link_url text,
  is_active boolean DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Pricing display configuration
CREATE TABLE souvera_pricing_display (
  plan_id text PRIMARY KEY,
  display_name text NOT NULL,
  tagline text,
  price_monthly numeric,
  price_annual numeric,
  features jsonb DEFAULT '[]',
  cta_text text DEFAULT 'Get Started',
  is_highlighted boolean DEFAULT false,
  display_order integer NOT NULL,
  is_visible boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Trust logos (partner/customer logos)
CREATE TABLE souvera_trust_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text NOT NULL,
  website_url text,
  display_order integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Feature flags
CREATE TABLE souvera_feature_flags (
  flag_key text PRIMARY KEY,
  description text,
  is_enabled boolean DEFAULT false,
  updated_by uuid REFERENCES souvera_profiles(id),
  updated_at timestamptz DEFAULT now()
);
```

### Sprint 3D.1: CMS Dashboard & Hero Slides (Days 1-2)

#### Tasks
- [ ] Create database migration for CMS tables
- [ ] Create `/admin/marketing` dashboard page
- [ ] Create hero slides CRUD interface
- [ ] Add image upload functionality (Supabase Storage)
- [ ] Add drag-and-drop reordering
- [ ] Add preview functionality

#### Components to Create
```
apps/api-gateway/src/app/admin/marketing/
  page.tsx                 - Marketing CMS dashboard
  hero-slides/page.tsx     - Hero slides management

apps/api-gateway/src/components/admin/marketing/
  HeroSlideEditor.tsx      - Slide creation/editing
  HeroSlideList.tsx        - Draggable slide list
  ImageUploader.tsx        - Image upload component
  PreviewPanel.tsx         - Live preview
```

### Sprint 3D.2: Banners & Pricing (Days 3-4)

#### Tasks
- [ ] Create flash banners management interface
- [ ] Add date/time scheduling for banners
- [ ] Create pricing plan display editor
- [ ] Add feature list editor for each plan
- [ ] Create live preview for pricing page

#### Components to Create
```
apps/api-gateway/src/app/admin/marketing/
  banners/page.tsx         - Banner management
  pricing/page.tsx         - Pricing editor

apps/api-gateway/src/components/admin/marketing/
  BannerEditor.tsx         - Banner creation/editing
  BannerScheduler.tsx      - Date range picker
  PricingEditor.tsx        - Plan display editor
  FeatureListEditor.tsx    - Feature list management
```

### Sprint 3D.3: Trust Logos & Feature Flags (Day 5)

#### Tasks
- [ ] Create trust logos uploader
- [ ] Add drag-and-drop logo reordering
- [ ] Create feature flags toggle interface
- [ ] Add flag descriptions and last-modified tracking

#### Components to Create
```
apps/api-gateway/src/app/admin/marketing/
  logos/page.tsx           - Logo management
  features/page.tsx        - Feature flags

apps/api-gateway/src/components/admin/marketing/
  LogoUploader.tsx         - Logo upload and order
  FeatureFlagTable.tsx     - Flag toggle interface
```

---

## Phase 3E: System Configuration Module (Week 2, Days 6-7)

### Objectives
Create system-level configuration management for Super Admin.

### Sprint 3E.1: Configuration Interface

#### Tasks
- [ ] Create `/admin/system/config` page
- [ ] Add environment variable viewer (non-sensitive)
- [ ] Create API rate limit configuration
- [ ] Add report generation settings
- [ ] Create data retention policies editor

#### Components to Create
```
apps/api-gateway/src/app/admin/system/
  config/page.tsx          - System configuration
  
apps/api-gateway/src/components/admin/system/
  ConfigSection.tsx        - Configuration category
  ConfigEditor.tsx         - Value editor
  RateLimitConfig.tsx      - API rate limits
  RetentionPolicy.tsx      - Data retention
```

### Sprint 3E.2: Audit Logs Enhancement

#### Tasks
- [ ] Create `/admin/system/audit` enhanced page
- [ ] Add advanced audit log filtering
- [ ] Create activity timeline visualization
- [ ] Add export audit logs functionality

---

## Phase 4D: Persona Dashboards (Current: Active Development)

**Status:** 🔄 In Progress - Business Tier with Navigation Sidebar  
**Started:** June 19, 2026  
**Updated:** June 20, 2026 - Added sidebar navigation for consistency  
**Approach:** Iterative POC → Expand to all personas

### Implementation Strategy (Updated June 20, 2026)

**Decision:** Build Business Tier dashboard with full navigation sidebar as POC

**Rationale:**
1. **UX Consistency** - Match admin dashboard pattern for familiar navigation
2. **Scalability** - Sidebar component reusable across all persona tiers
3. **Entitlement-Aware** - Server-side rendering with tier-specific features
4. **Future-Proof** - Foundation for communication hub, filters, advanced features

### Phase 4D Implementation Phases

#### Phase 4D.1: Business Dashboard with Sidebar (Active - Days 1-4)

**Day 1: Sidebar Infrastructure** ✅
- Create `DashboardSidebar.tsx` component (based on AdminSidebar pattern)
- Implement collapsible sections with expand/collapse
- Add Communication Hub widget (notifications UI)
- Create navigation structure
- Update dashboard layout with sidebar

**Day 2: Real Data Integration** 📋
- Connect dashboard stats to actual DB queries (countries viewed, exports, reports)
- Implement saved analyses CRUD operations
- Track export history from database
- Load real watchlist data
- Replace placeholder data with live queries

**Day 3: Filters + Polish** 📋
- Implement dashboard-scoped filters (region, sector, date range)
- Add filter persistence (localStorage)
- Make sidebar responsive (mobile collapse)
- Add active state highlighting
- Smooth transitions and animations

**Day 4: Testing + Documentation** 📋
- Test across all tiers (Explorer, Professional, Business, Investor, Institutional)
- Verify entitlements work correctly
- Update test plans and user guides
- Screenshot documentation
- Performance testing

#### Business Dashboard Features (POC Scope)

**Sidebar Navigation Sections:**
- ✅ Communication Hub (Notifications with badge counter)
- ✅ Trade Intelligence (Quick launch to 5 modules)
- ✅ My Intelligence (Dashboard, Saved, Exports, Reports, Watchlist)
- ✅ Quick Filters (Region, Sector, Date Range)
- ✅ Tier Badge (Current plan indicator)

**Dashboard Content (Existing):**
- ✅ Quick Stats Cards (Countries, Exports, Reports, Watchlist)
- ✅ Trade Intelligence Panel (5 modules)
- ✅ Market Watchlist Panel
- ✅ Export History (Recent activity)
- ✅ Reports Quota Widget
- ✅ Intelligence Feed (Alerts)

**Priority Features for POC:**
1. **Communication Hub** - Notifications only (AGOA alerts, market updates)
2. **Quick Stats** - Real data from database (not placeholders)
3. **Saved Analyses** - Bookmark countries/analyses
4. **Export History** - Track and re-download PNG exports
5. **Market Watchlist** - Add/remove countries with notifications

**Deferred to Post-POC:**
- Messaging/chat in Communication Hub
- Global filter context (cross-platform)
- Scenario modeling and portfolio analysis
- Custom report builder
- Team collaboration features
- Advanced analytics (Investor+ only)

**Timeline:** 3-4 days for full POC with sidebar

---

### Objectives
Create personalized dashboard experiences for each user tier, maximizing engagement and value perception.

### 4.1 Dashboard Architecture

Each persona gets a customized dashboard at `/dashboard` that shows:
- Relevant quick stats
- Accessible features based on tier
- Upgrade prompts for restricted features
- Personalized recommendations

### 4.2 Dashboard Components by Persona

#### Public Visitor (No Login)
- Hero landing page with value proposition
- Sample data previews (blurred for premium)
- Clear call-to-action to sign up

#### Explorer Dashboard
```
/dashboard (logged in as Explorer)
├── Welcome message with tier badge
├── Quick Stats (limited)
│   ├── Countries explored
│   ├── Reports remaining (1/mo)
│   └── Last activity
├── Accessible Features
│   ├── Intelligence Hub Map (full access)
│   ├── Headline Macro Data
│   └── Report Preview (1 free)
├── Upgrade Prompts
│   ├── "Unlock Trade Intelligence" → Professional
│   └── "Get Full Macro Data" → Professional
└── Activity Feed (recent views)
```

#### Professional Dashboard
```
/dashboard (logged in as Professional)
├── Welcome + tier badge
├── Quick Stats
│   ├── Countries analyzed
│   ├── Reports generated (5/mo)
│   └── Sectors explored
├── Accessible Features
│   ├── Intelligence Hub (full)
│   ├── Full Macro Data
│   ├── Sector Analysis
│   └── Policy Trackers
├── Upgrade Prompts
│   ├── "Unlock Trade Intelligence" → Business
│   └── "Access AGOA Tracker" → Business
└── Recommended Markets
```

#### Business Dashboard
```
/dashboard (logged in as Business)
├── Welcome + tier badge
├── Quick Stats
│   ├── Trade partners analyzed
│   ├── Reports generated (20/mo)
│   ├── Markets monitored
│   └── Opportunities identified
├── Full Feature Access
│   ├── All Intelligence modules
│   ├── Trade Intelligence (AGOA, AfCFTA, CBTPA)
│   ├── Import/Export flows
│   └── Risk Analysis
├── Upgrade Prompts
│   ├── "Access Supply-Demand Matrix" → Investor
│   └── "Get Forecast Metrics" → Investor
└── Market Opportunities Feed
```

#### Investor Dashboard
```
/dashboard (logged in as Investor)
├── Executive Welcome
├── Investment Stats
│   ├── Markets tracked
│   ├── Opportunities scored
│   ├── Reports (50/mo)
│   └── Forecast accuracy
├── Premium Features
│   ├── Supply-Demand Matrix
│   ├── Investment Thesis
│   ├── Forecast Metrics
│   └── All Trade Intelligence
├── Upgrade Prompts
│   ├── "API Access" → Institutional
│   └── "Export/Download" → Institutional
└── Investment Opportunities
```

#### Institutional Dashboard
```
/dashboard (logged in as Institutional)
├── Enterprise Welcome
├── Full Platform Stats
│   ├── API calls (usage)
│   ├── Exports generated
│   ├── Reports (unlimited)
│   └── Team members
├── All Features Unlocked
│   ├── Full API Access
│   ├── Export/Download
│   ├── White-label reports
│   └── Priority support
├── Enterprise Tools
│   ├── API Documentation
│   ├── Usage Analytics
│   └── Team Management
└── Strategic Insights
```

### 4.3 Implementation Sprints

#### Sprint 4A: Dashboard Framework (Days 1-2)
- [ ] Create `/dashboard` route with tier detection
- [ ] Create `DashboardLayout` component
- [ ] Create `DashboardHeader` with tier badge
- [ ] Create `FeatureGrid` for accessible features
- [ ] Create `UpgradePromptCard` component
- [ ] Create `QuickStatsRow` component

#### Sprint 4B: Explorer & Professional (Days 3-4)
- [ ] Implement Explorer dashboard content
- [ ] Implement Professional dashboard content
- [ ] Create recommended markets widget
- [ ] Add activity feed component

#### Sprint 4C: Business & Investor (Days 5-6)
- [ ] Implement Business dashboard content
- [ ] Implement Investor dashboard content
- [ ] Create market opportunities widget
- [ ] Add investment insights component

#### Sprint 4D: Institutional & Polish (Days 7-8)
- [ ] Implement Institutional dashboard content
- [ ] Create API usage dashboard
- [ ] Create team management interface
- [ ] Polish all dashboards
- [ ] Add Fortune 5 visual enhancements

### 4.4 Files to Create

```
apps/api-gateway/src/app/dashboard/
  page.tsx                 - Dashboard router by tier
  layout.tsx               - Dashboard layout

apps/api-gateway/src/components/dashboard/
  DashboardLayout.tsx      - Layout wrapper
  DashboardHeader.tsx      - Header with tier badge
  QuickStatsRow.tsx        - Stats display
  FeatureGrid.tsx          - Feature cards
  UpgradePromptCard.tsx    - Upgrade CTA
  ActivityFeed.tsx         - User activity
  RecommendedMarkets.tsx   - Market suggestions
  OpportunityFeed.tsx      - Opportunity alerts
  InvestmentInsights.tsx   - Investor insights
  ApiUsageDashboard.tsx    - Institutional API stats
  TeamManagement.tsx       - Institutional team
```

---

## Success Criteria

### Phase 3 Completion
- [ ] Billing dashboard shows accurate MRR/ARR
- [ ] Subscriptions can be managed (CRUD)
- [ ] Marketing CMS allows homepage updates
- [ ] Feature flags can be toggled
- [ ] System configuration is accessible
- [ ] Audit logs are searchable

### Phase 4 Completion
- [ ] Each persona sees personalized dashboard
- [ ] Upgrade prompts are contextually relevant
- [ ] Feature access matches entitlement matrix
- [ ] Dashboard loads in <2 seconds
- [ ] All 6 personas tested successfully

---

## Technical Notes

### State Management
- Use SWR for data fetching with caching
- Implement optimistic updates for CMS changes
- Use React Context for dashboard tier state

### Database Considerations
- Add RLS policies for all new CMS tables
- Create indexes for audit log queries
- Consider partitioning for large audit tables

### Performance
- Implement lazy loading for dashboard widgets
- Use skeleton loaders during data fetch
- Cache pricing and CMS content (5min TTL)

---

## Dependencies

| Dependency | Required By | Status |
|------------|-------------|--------|
| Access Control | All phases | ✅ Complete |
| User Management | Phase 3C | ✅ Complete |
| Matrix Management | Phase 4 | ✅ Complete |
| Supabase Storage | Phase 3D | ✅ Available |
| ApexCharts/Recharts | Phase 3C, 4 | ✅ Available |

---

## Risk Mitigation

1. **CMS Data Loss**: Implement version history for all CMS changes
2. **Performance**: Use pagination and virtual scrolling for large lists
3. **Security**: All CMS endpoints require super_admin verification
4. **UX Consistency**: Use Fortune 5 design system throughout

---

## Next Steps

1. Start with Phase 3C: Billing Management
2. Create database migrations for CMS tables
3. Implement billing dashboard
4. Continue with Phase 3D and 3E
5. Then proceed to Phase 4 persona dashboards
