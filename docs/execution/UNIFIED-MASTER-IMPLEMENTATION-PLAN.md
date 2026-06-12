# Souvera Unified Master Implementation Plan
**Version:** 2.0  
**Last Updated:** June 12, 2026  
**Status:** Post Test User Setup - Phase 1 (Access Control) Ready  
**Owner:** Afronovation, Inc.

---

## Executive Summary

This unified plan consolidates all active implementation tracks into a single sequential roadmap. All 8 test user personas are provisioned, entitlement system is complete, and the platform is ready for access control and dashboard implementation.

**Current State:** Infrastructure complete, ready for sequential implementation  
**Next Phase:** Phase 1 - Access Control Foundation (Week 1)  
**Timeline:** 4-6 weeks for complete implementation

---

## Quick Navigation

| Need | Go To | Status |
|------|-------|--------|
| **Test User Setup** | [Test User Reference](../qa/test-users-reference.md) | ✅ Complete |
| **Access Control (Phase 1)** | [Section 3](#3-phase-1-access-control-foundation-week-1) | 🚀 Ready to Start |
| **Admin Dashboard (Phase 2)** | [Section 4](#4-phase-2-admin-dashboard-week-2) | 📋 Planned |
| **Super Admin Panel (Phase 3)** | [Section 5](#5-phase-3-super-admin-control-panel-week-3) | 📋 Planned |
| **Persona Dashboards (Phase 4)** | [Section 6](#6-phase-4-persona-dashboards-week-4) | 📋 Planned |
| **Data Ingestion** | [source-ingestion-activation-plan.md](./source-ingestion-activation-plan.md) | ✅ Infrastructure Ready |
| **Complete Persona System** | [complete-persona-dashboard-master-plan.md](./complete-persona-dashboard-master-plan.md) | ✅ Architecture Defined |
| **Trade Intelligence** | [MASTER-EXECUTION-PLAN.md](./MASTER-EXECUTION-PLAN.md) | ✅ Tier 2.5 Complete |
| **Project Backlog** | [project-backlog.md](./project-backlog.md) | 📋 Future Work |

---

## 1. Foundation Status (Complete ✅)

### 1.1 Test User Infrastructure

**All 8 Personas Provisioned:**
1. ✅ Public Visitor - (no login)
2. ✅ Explorer - explorer@afronovation.com (PW: PEGWest@1235)
3. ✅ Professional - professional@afronovation.com (PW: PEGWest@1235)
4. ✅ Business - business@afronovation.com (PW: PEGWest@1235)
5. ✅ Investor - investor@afronovation.com (PW: PEGWest@1235) - NEW
6. ✅ Institutional - institutional@afronovation.com (PW: PEGWest@1235)
7. ✅ Platform Admin - admin@souveraterminal.com (PW: PEGWest@1235)
8. ✅ Super Admin - admin@afronovation.com (PW: PEGWest@1235) - NEW

**Documentation:**
- ✅ Test user reference guide: `docs/qa/test-users-reference.md`
- ✅ Setup completion summary: `docs/qa/test-user-setup-completion.md`
- ✅ Verification SQL queries: `docs/qa/test-users-verification.sql`

### 1.2 Entitlements System

**Type Definitions:**
- ✅ `AccessTier` includes `super_admin` (rank 100)
- ✅ `OrgRole` includes `super_admin`
- ✅ 6 new `EntitlementKey`s added:
  - `super_admin_access` - Full platform control
  - `user_management` - User provisioning
  - `system_configuration` - System settings
  - `marketing_cms` - Marketing site control
  - `billing_management` - Subscription management
  - `audit_logs` - Full audit trail access

**Database:**
- ✅ Migration applied: `20260612000000_add_super_admin_tier.sql`
- ✅ Super admin plan (rank 100) created
- ✅ All 22+ entitlements mapped to super_admin
- ✅ Investor plan (rank 4) created
- ✅ Admin verification updated to recognize super_admin role

**File:** `packages/entitlements/index.ts`

### 1.3 Existing Admin Infrastructure

**All 10 Admin Pages Functional:**

**Data Management (8 pages):**
1. ✅ `/admin/data/sources` - Data source registry
2. ✅ `/admin/data/indicators` - Indicator definitions
3. ✅ `/admin/data/upload` - File upload interface
4. ✅ `/admin/data/ingestion` - Ingestion monitoring
5. ✅ `/admin/data/news-pulse` - News signal management
6. ✅ `/admin/data/reports` - Report quota reset
7. ✅ `/admin/data/quality` - Data quality monitoring
8. ✅ `/admin/data/crosswalks` - Data mapping

**Content Management (2 pages):**
9. ✅ `/admin/content/news` - Curated editorial news
10. ✅ `/admin/content/trade-policy` - Policy content

**Admin Access:** Super admin and platform admin can access all pages

### 1.4 Trade Intelligence Platform

**Completed Features (from MASTER-EXECUTION-PLAN.md):**
- ✅ Tier 1: Demo-critical features (AGOA, export breakdown, market access)
- ✅ Tier 2: Trade & opportunity depth (Import breakdown, AfCFTA preview)
- ✅ Tier 2.5: QA polish (NGA 5 sectors, PNG exports, economy API-driven)
- ✅ Phase 0.7: CBTPA Trade Intelligence module
- ✅ UI conformity: AfCFTA and CBTPA modules standardized

**Active Trade Intelligence Modules:**
- `/intelligence/trade/agoa` - AGOA Eligibility Tracker
- `/intelligence/trade/agoa/products` - AGOA Product Finder
- `/intelligence/trade/afcfta/flows` - AfCFTA Import-Export Intelligence
- `/intelligence/trade/cbtpa/flows` - CBTPA Trade Intelligence
- `/intelligence/trade/demand` - African Import Demand Intelligence
- `/intelligence/trade/demand-caribbean` - Caribbean Import Demand Intelligence
- `/intelligence/trade/supply-demand` - Supply-Demand Matrix (planned)

### 1.5 Data Ingestion Infrastructure

**Status:** Infrastructure complete, manual ingestion ready  
**Reference:** [source-ingestion-activation-plan.md](./source-ingestion-activation-plan.md)

**Available Adapters:**
- ✅ REST Countries (identity, flags, coordinates)
- ✅ World Bank (GDP, GDP growth, population)
- ✅ FDI ingestion verified
- ❌ IMF adapter (forecasts) - not implemented
- ❌ UN Comtrade (trade data) - not implemented
- ❌ GDELT (news signals) - not implemented

**CLI Usage:**
```bash
# Run individual adapters
npx tsx services/ingestion/run.ts restcountries
npx tsx services/ingestion/run.ts worldbank

# Run all adapters
npx tsx services/ingestion/run.ts all
```

**Scheduled Cron:** Not implemented (Phase 4B)

---

## 2. Missing Critical Infrastructure

### 2.1 Access Control & Paywalls
- **Status:** ❌ Not implemented
- **Impact:** All users can access all features (no tier enforcement)
- **Priority:** CRITICAL - Must be implemented first

### 2.2 Admin Dashboard Index
- **Status:** ❌ Not implemented (`/admin` returns 404)
- **Impact:** No unified entry point to admin tools
- **Priority:** HIGH

### 2.3 Super Admin Control Panel
- **Status:** ❌ Not implemented (`/super-admin/*` doesn't exist)
- **Impact:** Super admin has same UI as platform admin
- **Priority:** HIGH

### 2.4 Persona Dashboards
- **Status:** ❌ Not implemented (all users redirect to `/profile`)
- **Impact:** No personalized user experience by tier
- **Priority:** MEDIUM

---

## 3. Phase 1: Access Control Foundation (Week 1)

**Priority:** CRITICAL - Must come first to enable proper testing  
**Status:** 🚀 Ready to start  
**Timeline:** 5-7 days

### 3.1 Sprint 1A: Access Control Utilities (Days 1-2)

#### Objectives
Create reusable hooks and components for entitlement checking across the platform.

#### Tasks
- [ ] Create `useEntitlements()` hook for client-side access checks
- [ ] Create `useUserAccess()` hook to fetch current user's access tier
- [ ] Create `<EntitlementGate>` component for conditional rendering
- [ ] Create `<UpgradePrompt>` modal component with tier comparison
- [ ] Create middleware for route protection
- [ ] Add server-side entitlement helper functions

#### Deliverables
```
apps/api-gateway/src/hooks/
  useEntitlements.ts       - Client-side entitlement checking
  useUserAccess.ts         - Fetch user's access tier and entitlements

apps/api-gateway/src/components/access/
  EntitlementGate.tsx      - Conditional rendering by entitlement
  UpgradePrompt.tsx        - Modal with upgrade CTA
  PaywallBanner.tsx        - Inline upgrade prompt
  TierBadge.tsx            - Display user's current tier

apps/api-gateway/src/middleware/
  access-control.ts        - Route protection middleware

apps/api-gateway/src/lib/access/
  server-entitlements.ts   - Server-side helpers
  tier-comparison.ts       - Feature comparison by tier
```

#### Implementation Details

**`useEntitlements()` Hook:**
```typescript
export function useEntitlements() {
  const { user } = useUser();
  const [access, setAccess] = useState<UserAccess | null>(null);

  useEffect(() => {
    // Fetch user access from API
  }, [user]);

  return {
    hasEntitlement: (key: EntitlementKey) => boolean,
    hasAnyEntitlement: (keys: EntitlementKey[]) => boolean,
    hasMinimumTier: (tier: AccessTier) => boolean,
    currentTier: access?.planId,
    entitlements: access?.entitlements || [],
  };
}
```

**`<EntitlementGate>` Component:**
```typescript
<EntitlementGate
  required="trade_data"
  fallback={<UpgradePrompt feature="Trade Intelligence" requiredTier="business" />}
>
  <TradeIntelligenceModule />
</EntitlementGate>
```

### 3.2 Sprint 1B: Paywall Implementation (Days 3-5)

#### Objectives
Identify and gate all tier-restricted features, test all personas.

#### Protected Features Matrix

| Feature | Public | Explorer | Professional | Business | Investor | Institutional |
|---------|--------|----------|--------------|----------|----------|---------------|
| Intelligence Hub Map | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Headline Macro | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Full Macro Data | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Sector Analysis | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Policy Trackers | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| **Trade Intelligence** | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| AGOA Tracker | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| AfCFTA Flows | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| CBTPA Flows | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Import Demand | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Supply-Demand Matrix** | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Risk Analysis | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Country Reports** | ✗ | ✗ | ✗ | 1/mo | 5/mo | Unlimited |
| **API Access** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Export/Download** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

#### Tasks
- [ ] Add route guards to trade intelligence pages
- [ ] Add `<EntitlementGate>` to trade modules
- [ ] Add route guard to supply-demand matrix
- [ ] Add report quota enforcement (1/mo Business, 5/mo Investor, unlimited Institutional)
- [ ] Add API endpoint protection (check tier in middleware)
- [ ] Add export/download restrictions (Institutional only)
- [ ] Add upgrade prompts to all gated features
- [ ] Test all 6 user personas for correct access

#### Routes to Gate

**Require `trade_data` entitlement (Business+):**
```
/intelligence/trade/agoa
/intelligence/trade/agoa/products
/intelligence/trade/afcfta/flows
/intelligence/trade/cbtpa/flows
/intelligence/trade/demand
/intelligence/trade/demand-caribbean
```

**Require `forecast_metrics` entitlement (Investor+):**
```
/intelligence/trade/supply-demand
```

**Require `api_access` entitlement (Institutional only):**
```
/api/v1/* (all endpoints require minimum tier check)
```

**Require `export_access` entitlement (Institutional only):**
```
- PNG export buttons
- CSV export buttons
- PDF downloads
```

#### API Protection Example
```typescript
// In API route handler
export async function GET(request: Request) {
  const access = await resolveUserAccess(supabase);
  
  if (!hasEntitlement(access, 'trade_data')) {
    return Response.json(
      createAccessDeniedError('trade_data', access.planId),
      { status: 403 }
    );
  }
  
  // Continue with logic...
}
```

### 3.3 Sprint 1C: Testing & Validation (Days 6-7)

#### Testing Protocol
- [ ] Create test matrix spreadsheet (features × personas)
- [ ] Test all 6 user tiers systematically
- [ ] Verify upgrade prompts display correctly
- [ ] Verify paywalls cannot be bypassed
- [ ] Test API endpoints with different tiers
- [ ] Document any access control bugs

#### Success Criteria
- [ ] All tier-restricted features have working gates
- [ ] All API routes check access tier
- [ ] Upgrade prompts display with correct tier info
- [ ] All 6 user personas tested successfully
- [ ] No bypass methods found
- [ ] Documentation updated

---

## 4. Phase 2: Admin Dashboard (Week 2)

**Priority:** HIGH  
**Status:** 📋 Planned  
**Timeline:** 5-7 days  
**Dependencies:** None (can start immediately after Phase 1)

### 4.1 Sprint 2A: Admin Index Page (Days 1-3)

#### Objectives
Create unified entry point for all admin tools with quick stats and activity feed.

#### Tasks
- [ ] Create `/admin/page.tsx` (index route)
- [ ] Design admin dashboard layout
- [ ] Add quick stats cards (sources, uploads, users)
- [ ] Add quick action grid (all 10 admin pages)
- [ ] Add recent activity feed
- [ ] Add system health indicators
- [ ] Add search/filter across admin tools

#### Deliverables
```
apps/api-gateway/src/app/admin/
  page.tsx                 - Admin dashboard index

apps/api-gateway/src/components/admin/
  AdminDashboard.tsx       - Main dashboard component
  QuickStatsCard.tsx       - Stat display card
  AdminActionGrid.tsx      - Quick action links
  ActivityFeed.tsx         - Recent activity list
  SystemHealthBar.tsx      - Health status indicator
```

#### Quick Stats to Display
- Total data sources (count from `souvera_data_sources`)
- Recent uploads (last 7 days from `souvera_ingestion_jobs`)
- Active users (count from `souvera_profiles` with active subscriptions)
- Pending reports (count from `souvera_report_requests`)
- Data freshness (last ingestion timestamp)
- System errors (last 24 hours)

### 4.2 Sprint 2B: Dashboard Enhancements (Days 4-5)

#### Tasks
- [ ] Add data freshness indicators per source
- [ ] Add pending ingestion jobs counter
- [ ] Add recent report requests list
- [ ] Add error/warning alerts section
- [ ] Add quick filters (by date, type, status)
- [ ] Add export dashboard data (CSV)

#### Success Criteria
- [ ] `/admin` loads with dashboard
- [ ] All 10 admin pages accessible from dashboard
- [ ] Quick stats display real-time data
- [ ] Activity feed shows last 50 actions
- [ ] System health indicators update correctly
- [ ] Search works across admin tools

---

## 5. Phase 3: Super Admin Control Panel (Week 3)

**Priority:** HIGH  
**Status:** 📋 Planned  
**Timeline:** 7-10 days  
**Dependencies:** Phase 1 complete (access control needed for super admin routes)  
**Reference:** [complete-persona-dashboard-master-plan.md](./complete-persona-dashboard-master-plan.md) § Super Admin

### 5.1 Sprint 3A: Super Admin Routes & Layout (Days 1-2)

#### Objectives
Create super admin route structure and navigation framework.

#### Tasks
- [ ] Create `/super-admin` route structure
- [ ] Create super admin layout component
- [ ] Create super admin navigation sidebar
- [ ] Add access verification (super_admin entitlement only)
- [ ] Add breadcrumb navigation
- [ ] Add user profile indicator (showing super admin status)

#### Route Structure
```
/super-admin                - Dashboard overview
/super-admin/users          - User management
/super-admin/billing        - Billing & subscriptions
/super-admin/marketing      - Marketing CMS
/super-admin/system         - System configuration
/super-admin/analytics      - Platform analytics
/super-admin/audit          - Audit logs
```

#### Deliverables
```
apps/api-gateway/src/app/super-admin/
  layout.tsx               - Super admin layout
  page.tsx                 - Super admin dashboard

apps/api-gateway/src/components/super-admin/
  SuperAdminNav.tsx        - Navigation sidebar
  SuperAdminHeader.tsx     - Header with user indicator
  SuperAdminCard.tsx       - Dashboard card component
```

### 5.2 Sprint 3B: User Management Module (Days 3-4)

#### Objectives
Complete user CRUD operations, search, filtering, and bulk actions.

#### Tasks
- [ ] User list view with pagination
- [ ] User detail view (profile, subscription, activity)
- [ ] User search (by email, name, plan)
- [ ] Filter by plan, status, organization
- [ ] User actions: suspend, activate, change plan, reset password
- [ ] Bulk operations: export users, bulk plan changes
- [ ] Create new user (manual provisioning)

#### Components
```
apps/api-gateway/src/app/super-admin/users/
  page.tsx                 - User list page
  [id]/page.tsx            - User detail page

apps/api-gateway/src/components/super-admin/
  UserTable.tsx            - User list with filters
  UserDetailCard.tsx       - User profile display
  UserActions.tsx          - Action dropdown
  UserSearchBar.tsx        - Search and filter
  BulkUserActions.tsx      - Multi-select operations
```

#### API Endpoints to Create
```
POST /api/v1/admin/users/search       - Search users
GET  /api/v1/admin/users/[id]         - Get user details
PUT  /api/v1/admin/users/[id]/plan    - Change user plan
PUT  /api/v1/admin/users/[id]/status  - Suspend/activate
POST /api/v1/admin/users/[id]/reset   - Reset password
POST /api/v1/admin/users/export       - Export user list
```

### 5.3 Sprint 3C: Billing Management Module (Days 5-6)

#### Objectives
View subscriptions, manage plans, track revenue.

#### Tasks
- [ ] Subscription overview dashboard (MRR, ARR, churn)
- [ ] Plan management (view/edit plan definitions)
- [ ] Subscription list (filter by plan, status)
- [ ] Revenue analytics (charts, trends over time)
- [ ] Failed payments log (if Stripe integration exists)
- [ ] Subscription actions (extend, cancel, refund)

#### Components
```
apps/api-gateway/src/app/super-admin/billing/
  page.tsx                 - Billing dashboard
  subscriptions/page.tsx   - Subscription list
  plans/page.tsx           - Plan management

apps/api-gateway/src/components/super-admin/
  RevenueChart.tsx         - MRR/ARR visualization
  SubscriptionTable.tsx    - Subscription list
  PlanEditor.tsx           - Edit plan definitions
  PaymentHistory.tsx       - Payment logs
```

### 5.4 Sprint 3D: Marketing CMS Module (Days 7-8)

#### Objectives
Enable super admin to manage homepage content without code deployment.

#### Database Tables to Create

**See [complete-persona-dashboard-master-plan.md](./complete-persona-dashboard-master-plan.md) § Marketing Site CMS for full schemas.**

```sql
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
  type text NOT NULL, -- 'info', 'warning', 'success'
  cta_text text,
  cta_url text,
  is_active boolean DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Pricing plans (manage pricing tiers)
CREATE TABLE souvera_pricing_plans (
  id text PRIMARY KEY, -- 'explorer', 'professional', etc.
  display_name text NOT NULL,
  price_monthly numeric,
  price_annual numeric,
  features jsonb, -- Array of feature strings
  cta_text text,
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

-- Feature flags (toggle features on/off)
CREATE TABLE souvera_feature_flags (
  flag_key text PRIMARY KEY,
  description text,
  is_enabled boolean DEFAULT false,
  updated_by uuid REFERENCES souvera_profiles(id),
  updated_at timestamptz DEFAULT now()
);
```

#### Tasks
- [ ] Create database migration for CMS tables
- [ ] Create hero slides CRUD interface
- [ ] Create flash banners CRUD interface
- [ ] Create pricing plans editor
- [ ] Create trust logos uploader
- [ ] Create feature flags toggle UI
- [ ] Add preview functionality (view changes before publish)
- [ ] Add version history (track changes)

#### Components
```
apps/api-gateway/src/app/super-admin/marketing/
  page.tsx                 - Marketing CMS dashboard
  hero-slides/page.tsx     - Hero slides management
  banners/page.tsx         - Flash banners management
  pricing/page.tsx         - Pricing editor
  logos/page.tsx           - Trust logos uploader
  features/page.tsx        - Feature flags

apps/api-gateway/src/components/super-admin/
  HeroSlideEditor.tsx      - Slide CRUD form
  BannerEditor.tsx         - Banner CRUD form
  PricingEditor.tsx        - Pricing plan form
  LogoUploader.tsx         - Image upload component
  FeatureFlagToggle.tsx    - Feature flag switch
  PreviewModal.tsx         - Preview changes
```

### 5.5 Sprint 3E: System Configuration & Analytics (Days 9-10)

#### Objectives
System settings, platform analytics, audit logs viewer.

#### Tasks
- [ ] System settings page (feature toggles, API limits, etc.)
- [ ] Platform analytics dashboard (user growth, engagement)
- [ ] Audit logs viewer (user actions, system events)
- [ ] Health monitoring dashboard (database, API, external services)
- [ ] Error log viewer (application errors, stack traces)
- [ ] Performance metrics (API response times, page load times)

#### Components
```
apps/api-gateway/src/app/super-admin/system/
  page.tsx                 - System configuration
  analytics/page.tsx       - Platform analytics
  audit/page.tsx           - Audit logs
  health/page.tsx          - Health monitoring

apps/api-gateway/src/components/super-admin/
  SystemSettings.tsx       - Settings form
  AnalyticsChart.tsx       - User growth charts
  AuditLogTable.tsx        - Audit log list
  HealthStatusCard.tsx     - Service health indicators
  ErrorLogTable.tsx        - Error log viewer
```

#### Success Criteria
- [ ] `/super-admin` routes load for super admin only
- [ ] User management CRUD works (create, read, update, suspend)
- [ ] Billing overview displays MRR, subscriptions
- [ ] Marketing CMS can edit homepage content
- [ ] Preview mode shows changes before publish
- [ ] System analytics show user growth trends
- [ ] Audit logs capture all admin actions

---

## 6. Phase 4: Persona Dashboards (Week 4)

**Priority:** MEDIUM  
**Status:** 📋 Planned  
**Timeline:** 7-10 days  
**Dependencies:** Phase 1 complete (access control for conditional rendering)  
**Reference:** [complete-persona-dashboard-master-plan.md](./complete-persona-dashboard-master-plan.md) § Persona Dashboards

### 6.1 Sprint 4A: Dashboard Framework (Days 1-2)

#### Objectives
Create reusable dashboard framework for all user tiers.

#### Decision: Dashboard Routing Strategy

**Option A: Single `/dashboard` route with conditional rendering**
- Simpler implementation
- Single page to maintain
- Conditional rendering based on user tier

**Option B: Tier-specific routes**
- `/dashboard/explorer`, `/dashboard/professional`, etc.
- More explicit routing
- Easier to customize per tier

**Recommendation:** Option A (single route with conditional rendering)

#### Tasks
- [ ] Create `/dashboard` route
- [ ] Create base dashboard layout component
- [ ] Create dashboard widget components (stats, charts, quick actions)
- [ ] Create dashboard card components
- [ ] Add tier detection logic
- [ ] Add loading and error states

#### Deliverables
```
apps/api-gateway/src/app/dashboard/
  page.tsx                 - Main dashboard route

apps/api-gateway/src/components/dashboard/
  DashboardLayout.tsx      - Base layout
  DashboardCard.tsx        - Card container
  StatCard.tsx             - Stat display widget
  ChartCard.tsx            - Chart widget
  QuickActionCard.tsx      - Quick action button
  UpgradeCard.tsx          - Upgrade prompt card
  UsageCard.tsx            - Usage/quota display
```

### 6.2 Sprint 4B: User Tier Dashboards (Days 3-10)

#### Objectives
Create personalized dashboard for each user tier with relevant widgets.

#### Explorer Dashboard
**Target User:** Just signed up, exploring platform  
**Key Widgets:**
- [ ] Welcome message with tier name
- [ ] Interactive map preview (clickable to navigate)
- [ ] Recent insights/news feed (3-5 items)
- [ ] Feature comparison table (what's unlocked vs locked)
- [ ] Quick actions: View intelligence hub, Browse insights
- [ ] Upgrade to Professional CTA

**Components:**
```typescript
<ExplorerDashboard>
  <WelcomeCard tier="Explorer" />
  <MapPreviewCard interactive={true} />
  <RecentInsightsCard limit={5} />
  <FeatureComparisonCard currentTier="explorer" suggestedTier="professional" />
  <UpgradeCard targetTier="professional" />
</ExplorerDashboard>
```

#### Professional Dashboard
**Target User:** Researching markets, using policy trackers  
**Key Widgets:**
- [ ] Welcome message
- [ ] Market momentum indicators (top 5 countries)
- [ ] Recent policy updates (AGOA, AfCFTA news)
- [ ] Sector highlights (top 3 sectors)
- [ ] Quick actions: Policy trackers, Sector analysis
- [ ] Usage stats: Saved countries, recent views
- [ ] Upgrade to Business CTA

#### Business Dashboard
**Target User:** Using trade intelligence, generating reports  
**Key Widgets:**
- [ ] Welcome message
- [ ] Trade intelligence summary cards (AGOA, AfCFTA, CBTPA)
- [ ] Report generation quick action
- [ ] Report quota display (1/month used)
- [ ] Trade data highlights (recent activity)
- [ ] Quick actions: Generate report, View trade intelligence
- [ ] Upgrade to Investor CTA

#### Investor Dashboard
**Target User:** Using Supply-Demand Matrix, generating multiple reports  
**Key Widgets:**
- [ ] Welcome message
- [ ] Supply-Demand Matrix preview/quick access
- [ ] Report quota display (X/5 used this month)
- [ ] Portfolio insights (if saved countries)
- [ ] Investment thesis highlights
- [ ] Quick actions: Supply-demand analysis, Generate report
- [ ] Upgrade to Institutional CTA

#### Institutional Dashboard
**Target User:** Full platform access, API usage, team collaboration  
**Key Widgets:**
- [ ] Welcome message
- [ ] Full platform access summary
- [ ] API usage metrics (calls this month, rate limits)
- [ ] Report activity (unlimited, show recent)
- [ ] Export activity log
- [ ] Team collaboration features (if multi-user)
- [ ] Quick actions: API docs, Generate report, Manage team

#### Tasks Per Tier
- [ ] Create tier-specific dashboard components
- [ ] Add tier-specific quick actions
- [ ] Add usage/quota widgets
- [ ] Add upgrade prompts (except Institutional)
- [ ] Test with each persona
- [ ] Verify data displays correctly

#### Success Criteria
- [ ] All 5 user tiers have personalized dashboards
- [ ] Dashboards display relevant quick actions by tier
- [ ] Usage stats show correctly (report quotas, API usage)
- [ ] Upgrade CTAs navigate to correct plan pages
- [ ] Loading states work properly
- [ ] Responsive design works on mobile

---

## 7. Parallel Tracks (Can Run Alongside)

### 7.1 Data Ingestion (Ongoing)

**Reference:** [source-ingestion-activation-plan.md](./source-ingestion-activation-plan.md)

**Current Status:**
- ✅ Infrastructure complete
- ✅ REST Countries adapter working
- ✅ World Bank adapter working
- ✅ FDI ingestion verified
- ❌ Scheduled cron not implemented
- ❌ IMF, UN Comtrade, GDELT adapters not implemented

**Can Run Manual Ingestion Now:**
```bash
npx tsx services/ingestion/run.ts all
```

**Phase 4B (Scheduled Ingestion):** Can be implemented in parallel with dashboard work.

### 7.2 Trade Intelligence Enhancements

**Reference:** [MASTER-EXECUTION-PLAN.md](./MASTER-EXECUTION-PLAN.md)

**Status:** Tier 2.5 complete, Tier 3 planned

**Tier 3 Planned:**
- Trade Policy CRUD (events, AGOA status)
- Trade composition admin editor per ISO3
- AfCFTA 54-country DB + admin
- Supply-Demand matrix curated data + admin

**Can Proceed:** After Phase 1 (access control) is complete

---

## 8. Implementation Timeline

### Week 1: Access Control Foundation
- **Days 1-2:** Access control utilities (hooks, components, middleware)
- **Days 3-5:** Paywall implementation (gate all features, test personas)
- **Days 6-7:** Testing & validation

**Deliverable:** All features properly gated by tier, all personas tested

### Week 2: Admin Dashboard
- **Days 1-3:** Admin index page (dashboard, quick stats, activity feed)
- **Days 4-5:** Dashboard enhancements (search, filters, export)

**Deliverable:** `/admin` loads with unified dashboard

### Week 3: Super Admin Control Panel
- **Days 1-2:** Super admin routes & layout
- **Days 3-4:** User management module
- **Days 5-6:** Billing management module
- **Days 7-8:** Marketing CMS module
- **Days 9-10:** System configuration & analytics

**Deliverable:** `/super-admin` fully functional with 6 modules

### Week 4: Persona Dashboards
- **Days 1-2:** Dashboard framework (base components, routing)
- **Days 3-4:** Explorer & Professional dashboards
- **Days 5-6:** Business & Investor dashboards
- **Days 7-8:** Institutional dashboard
- **Days 9-10:** Testing, polish, responsive design

**Deliverable:** All 5 user tiers have personalized dashboards

---

## 9. Testing Strategy

### 9.1 Persona Testing Matrix

Test each persona systematically across all features:

| Feature | Public | Explorer | Professional | Business | Investor | Institutional |
|---------|--------|----------|--------------|----------|----------|---------------|
| Login | N/A | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dashboard | N/A | ✓ | ✓ | ✓ | ✓ | ✓ |
| Intelligence Hub | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Full Macro | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Trade Intelligence | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Supply-Demand | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Reports | ✗ | ✗ | ✗ | 1/mo | 5/mo | Unlimited |
| API Access | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Exports | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

### 9.2 Admin Testing
- [ ] Platform admin can access all 10 admin pages
- [ ] Platform admin cannot access `/super-admin`
- [ ] Super admin can access all admin pages
- [ ] Super admin can access all `/super-admin` pages
- [ ] Admin actions are logged in audit trail

### 9.3 Integration Testing
- [ ] User can upgrade from one tier to another
- [ ] Access updates immediately after tier change
- [ ] Report quotas reset monthly
- [ ] API rate limits enforced per tier
- [ ] Export restrictions work correctly

---

## 10. Success Criteria

### Overall Project Success
- ✅ All 8 personas provisioned and tested
- ✅ Entitlement system complete and tested
- ✅ Access control prevents unauthorized access
- ✅ All tiers have personalized dashboards
- ✅ Admin dashboard provides unified tool access
- ✅ Super admin can manage users, billing, and marketing
- ✅ No critical bugs or bypass methods found
- ✅ Documentation complete and accurate

### Phase-Specific Success Criteria

**Phase 1 Success:**
- All tier-restricted features gated
- All API routes protected
- Upgrade prompts working
- All personas tested successfully

**Phase 2 Success:**
- `/admin` loads with dashboard
- All 10 admin tools accessible
- Quick stats display correctly
- Activity feed shows recent actions

**Phase 3 Success:**
- `/super-admin` routes work for super admin only
- User management CRUD operational
- Billing overview displays correctly
- Marketing CMS can edit homepage

**Phase 4 Success:**
- All 5 user tiers have dashboards
- Dashboards show relevant content
- Usage stats display correctly
- Upgrade CTAs work properly

---

## 11. Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Access control bypass via direct API calls | HIGH | Server-side validation on all endpoints |
| Dashboard performance with large datasets | MEDIUM | Pagination, lazy loading, caching |
| Marketing CMS breaking production | HIGH | Preview mode, version control, rollback |
| Report quota abuse | MEDIUM | Rate limiting, background job queue |
| API key exposure | HIGH | Proper secrets management, rotation |

### Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users frustrated by paywalls | MEDIUM | Clear upgrade paths, value communication |
| Admin confusion with too many tools | LOW | Unified dashboard, search, documentation |
| Super admin privilege escalation | HIGH | Audit logging, change approval workflow |
| Revenue impact from generous free tiers | MEDIUM | Monitor conversion rates, adjust tiers |

---

## 12. Documentation Requirements

### User Documentation
- [ ] User guide per tier (Explorer → Institutional)
- [ ] Upgrade guide (how to change tiers)
- [ ] Report generation guide
- [ ] API documentation (Institutional tier)
- [ ] FAQ for common access questions

### Admin Documentation
- [ ] Platform admin user guide (10 tools)
- [ ] Super admin user guide (6 modules)
- [ ] User provisioning guide
- [ ] Marketing CMS user guide
- [ ] Troubleshooting guide

### Developer Documentation
- [ ] Access control architecture
- [ ] Entitlement system reference
- [ ] API endpoint protection guide
- [ ] Dashboard component library
- [ ] Testing protocols

---

## 13. Next Immediate Actions

### To Start Phase 1 (Access Control)

1. **Create access control utilities** (Day 1)
   - `useEntitlements()` hook
   - `<EntitlementGate>` component
   - `<UpgradePrompt>` modal

2. **Identify all protected features** (Day 1)
   - List all routes requiring tier checks
   - List all components requiring entitlement gates
   - List all API endpoints requiring protection

3. **Implement first paywall** (Day 2)
   - Start with trade intelligence modules
   - Add `<EntitlementGate>` around modules
   - Test with Business tier user

4. **Test systematically** (Days 3-7)
   - Test each persona sequentially
   - Document findings
   - Fix any bypass methods

---

## 14. Related Documentation

| Document | Purpose | Status |
|----------|---------|--------|
| [test-users-reference.md](../qa/test-users-reference.md) | Test user credentials | ✅ Current |
| [complete-persona-dashboard-master-plan.md](./complete-persona-dashboard-master-plan.md) | Full persona system architecture | ✅ Current |
| [source-ingestion-activation-plan.md](./source-ingestion-activation-plan.md) | Data ingestion roadmap | ✅ Current |
| [MASTER-EXECUTION-PLAN.md](./MASTER-EXECUTION-PLAN.md) | Trade intelligence status | ✅ Current |
| [project-backlog.md](./project-backlog.md) | Future work | ✅ Current |

---

**Ready to proceed with Phase 1 Sprint 1A: Access Control Utilities?**
