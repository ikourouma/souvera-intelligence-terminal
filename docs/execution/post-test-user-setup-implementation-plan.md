# Post Test User Setup - Implementation Plan
**Date:** June 12, 2026  
**Status:** Test users provisioned, Ready for dashboard & access control implementation

## Current State Audit

### ✅ Completed Infrastructure

#### Test User System (All 8 Personas Provisioned)
1. **Public Visitor** - No login required
2. **Explorer** - explorer@afronovation.com (PW: PEGWest@1235)
3. **Professional** - professional@afronovation.com (PW: PEGWest@1235)
4. **Business** - business@afronovation.com (PW: PEGWest@1235)
5. **Investor** - investor@afronovation.com (PW: PEGWest@1235) - NEW
6. **Institutional** - institutional@afronovation.com (PW: PEGWest@1235)
7. **Platform Admin** - admin@souveraterminal.com (PW: PEGWest@1235)
8. **Super Admin** - admin@afronovation.com (PW: PEGWest@1235) - NEW

#### Entitlements System Updated
- `super_admin` tier added (rank 100)
- 6 new entitlement keys: `super_admin_access`, `user_management`, `system_configuration`, `marketing_cms`, `billing_management`, `audit_logs`
- Database migration applied successfully
- Admin verification updated to recognize super_admin role

### ✅ Existing Admin Pages (All Functional)

#### Data Management (8 pages)
1. **`/admin/data/sources`** - Data source registry and metadata
   - **Status:** Functional with client component
   - **Relevance:** HIGH - Core data management

2. **`/admin/data/indicators`** - Indicator definitions and mappings
   - **Status:** Functional
   - **Relevance:** HIGH - Core data structure

3. **`/admin/data/upload`** - File upload interface for data ingestion
   - **Status:** Functional with FileUploadClient
   - **Relevance:** HIGH - Primary data input method

4. **`/admin/data/ingestion`** - Monitor ingestion runs and status
   - **Status:** Functional (placeholder for automation)
   - **Relevance:** MEDIUM - Manual workflow currently

5. **`/admin/data/news-pulse`** - News signal management
   - **Status:** Functional with NewsPulseClient
   - **Relevance:** HIGH - News insights feature

6. **`/admin/data/reports`** - Report quota & history reset
   - **Status:** Functional with ReportsResetClient
   - **Relevance:** HIGH - Platform support tool

7. **`/admin/data/quality`** - Data quality monitoring
   - **Status:** Functional
   - **Relevance:** HIGH - Data integrity

8. **`/admin/data/crosswalks`** - Data mapping management
   - **Status:** Functional
   - **Relevance:** MEDIUM - Data integration

#### Content Management (2 pages)
9. **`/admin/content/news`** - Curated editorial news
   - **Status:** Functional with CuratedNewsClient + editor
   - **Relevance:** HIGH - `/insights/news` content

10. **`/admin/content/trade-policy`** - Trade policy content
    - **Status:** Functional
    - **Relevance:** HIGH - Policy intelligence

**Total:** 10 functional admin pages (all relevant, all working with super admin)

### 🚧 Missing Critical Infrastructure

#### 1. Admin Dashboard Index (`/admin` page)
- **Current State:** 404 - No index page exists
- **Impact:** No unified entry point to admin tools
- **Priority:** HIGH
- **Needed Components:**
  - Quick stats dashboard
  - Recent activity feed
  - System health indicators
  - Quick action cards to all 10 admin pages

#### 2. Super Admin Control Panel (`/super-admin/*`)
- **Current State:** Not implemented
- **Impact:** Super admin has same UI as platform admin
- **Priority:** HIGH
- **Needed Features:**
  - User management (provision, suspend, view all users)
  - Billing management (view subscriptions, manage plans)
  - Marketing CMS (hero slides, banners, pricing)
  - System configuration (feature flags, settings)
  - Analytics dashboard (platform metrics)
  - Audit logs viewer

#### 3. Persona Dashboards (`/dashboard` or custom routes)
- **Current State:** Not implemented
- **Impact:** All users redirect to `/profile` after login
- **Priority:** HIGH
- **Needed Dashboards:**
  - Explorer dashboard
  - Professional dashboard
  - Business dashboard
  - Investor dashboard
  - Institutional dashboard

#### 4. Access Control & Paywalls
- **Current State:** Not enforced
- **Impact:** All users can access all features
- **Priority:** CRITICAL
- **Needed Implementation:**
  - Route guards for tier-specific features
  - Component-level entitlement checks
  - Paywall modals with upgrade prompts
  - API endpoint protection

## Sequential Implementation Plan

### Phase 1: Access Control Foundation (Week 1)
**Priority:** CRITICAL - Must come first to enable proper testing

#### Sprint 1A: Access Control Utilities
- [ ] Create `useEntitlements()` hook for client-side checks
- [ ] Create `<EntitlementGate>` component for conditional rendering
- [ ] Create `<UpgradePrompt>` modal component
- [ ] Create middleware for route protection
- [ ] Add entitlement checks to all API routes

**Deliverables:**
- `apps/api-gateway/src/hooks/useEntitlements.ts`
- `apps/api-gateway/src/components/access/EntitlementGate.tsx`
- `apps/api-gateway/src/components/access/UpgradePrompt.tsx`
- `apps/api-gateway/src/middleware/access-control.ts`

#### Sprint 1B: Paywall Implementation
- [ ] Identify tier-restricted features (from master plan access matrix)
- [ ] Add `<EntitlementGate>` to restricted components
- [ ] Add route guards to protected pages
- [ ] Test all 6 user personas for proper access restrictions
- [ ] Add upgrade prompts with tier comparison

**Protected Features to Gate:**
- Trade Intelligence modules (Business+)
- Supply-Demand Matrix (Investor+)
- API access (Institutional only)
- Export/download features (Institutional only)
- Report generation (tiered quotas)

**Testing Matrix:**
```
Feature                     | Public | Explorer | Professional | Business | Investor | Institutional
---------------------------|--------|----------|--------------|----------|----------|---------------
Intelligence Hub Map       |   ✓    |    ✓     |      ✓       |    ✓     |    ✓     |      ✓
Full Macro Data            |   ✗    |    ✗     |      ✓       |    ✓     |    ✓     |      ✓
Trade Intelligence         |   ✗    |    ✗     |      ✗       |    ✓     |    ✓     |      ✓
Supply-Demand Matrix       |   ✗    |    ✗     |      ✗       |    ✗     |    ✓     |      ✓
Country Reports            |   ✗    |    ✗     |      ✗       |  1/month | 5/month  |  Unlimited
API Access                 |   ✗    |    ✗     |      ✗       |    ✗     |    ✗     |      ✓
```

### Phase 2: Admin Dashboard (Week 2)
**Priority:** HIGH - Improves admin UX

#### Sprint 2A: Admin Index Page
- [ ] Create `/admin/page.tsx` (index route)
- [ ] Design admin dashboard layout
- [ ] Add quick stats cards (data sources count, recent uploads, active users)
- [ ] Add quick action grid (links to all 10 admin pages)
- [ ] Add recent activity feed
- [ ] Add system health indicators

**Deliverables:**
- `apps/api-gateway/src/app/admin/page.tsx`
- `apps/api-gateway/src/components/admin/AdminDashboard.tsx`
- `apps/api-gateway/src/components/admin/QuickStatsCard.tsx`
- `apps/api-gateway/src/components/admin/ActivityFeed.tsx`

#### Sprint 2B: Admin Dashboard Enhancements
- [ ] Add data freshness indicators
- [ ] Add pending ingestion jobs counter
- [ ] Add recent report requests
- [ ] Add error/warning alerts
- [ ] Add search across admin tools

### Phase 3: Super Admin Control Panel (Week 3)
**Priority:** HIGH - Differentiates super admin from platform admin

#### Sprint 3A: Super Admin Routes & Layout
- [ ] Create `/super-admin` route structure
- [ ] Create super admin layout component
- [ ] Create super admin navigation sidebar
- [ ] Add access verification (super_admin only)

**Route Structure:**
```
/super-admin
  /super-admin/users         - User management
  /super-admin/billing       - Billing & subscriptions
  /super-admin/marketing     - Marketing CMS
  /super-admin/system        - System configuration
  /super-admin/analytics     - Platform analytics
  /super-admin/audit         - Audit logs
```

#### Sprint 3B: User Management Module
- [ ] User list view (all users with filters)
- [ ] User detail view (profile, subscription, activity)
- [ ] User actions (suspend, activate, change plan, reset password)
- [ ] Bulk operations (export users, bulk plan changes)
- [ ] Search and filtering

**Components:**
- `apps/api-gateway/src/app/super-admin/users/page.tsx`
- `apps/api-gateway/src/components/super-admin/UserTable.tsx`
- `apps/api-gateway/src/components/super-admin/UserActions.tsx`

#### Sprint 3C: Billing Management Module
- [ ] Subscription overview (MRR, active subscriptions by plan)
- [ ] Plan management (view/edit plan definitions)
- [ ] Subscription list (filter by plan, status)
- [ ] Payment history (if Stripe integration exists)
- [ ] Revenue analytics (charts, trends)

#### Sprint 3D: Marketing CMS Module
- [ ] Create database tables (from master plan schemas)
- [ ] Hero slides management (CRUD)
- [ ] Flash banners management (CRUD)
- [ ] Pricing plans editor
- [ ] Trust logos uploader
- [ ] Feature flags toggle
- [ ] Preview functionality

**Database Tables to Create:**
```sql
-- See complete-persona-dashboard-master-plan.md for full schemas
- souvera_hero_slides
- souvera_flash_banners
- souvera_pricing_plans
- souvera_trust_logos
- souvera_feature_flags
```

#### Sprint 3E: System Configuration & Analytics
- [ ] System settings page (feature toggles, API limits, etc.)
- [ ] Platform analytics dashboard (user growth, engagement metrics)
- [ ] Audit logs viewer (user actions, system events)
- [ ] Health monitoring (database, API, external services)

### Phase 4: Persona Dashboards (Week 4)
**Priority:** MEDIUM - Improves user experience

#### Sprint 4A: Dashboard Framework
- [ ] Create dashboard route strategy (e.g., `/dashboard` with conditional rendering)
- [ ] Create base dashboard layout component
- [ ] Create dashboard widget components (stats, charts, quick actions)
- [ ] Create dashboard navigation

**Decision Point:** Choose dashboard routing approach:
- **Option A:** Single `/dashboard` route with conditional rendering by tier
- **Option B:** Tier-specific routes (`/dashboard/explorer`, `/dashboard/professional`, etc.)
- **Recommendation:** Option A for simplicity

#### Sprint 4B: User Tier Dashboards (Explorer → Institutional)
For each tier, create personalized dashboard with:
- [ ] Welcome message with tier name
- [ ] Quick stats relevant to tier
- [ ] Recent activity (reports, saved content)
- [ ] Quick action cards (based on entitlements)
- [ ] Upgrade prompt (if not top tier)
- [ ] Usage analytics (reports quota, API calls for Institutional)

**Dashboard Components by Tier:**

**Explorer Dashboard:**
- Map preview with clickable countries
- Recent insights/news feed
- Feature comparison table (what's locked)
- Upgrade to Professional CTA

**Professional Dashboard:**
- Market momentum indicators
- Recent policy updates
- Sector highlights
- Quick access to policy trackers
- Upgrade to Business CTA

**Business Dashboard:**
- Trade intelligence summary cards
- Report generation quick action
- Recent reports (1/month quota display)
- Trade data highlights
- Upgrade to Investor CTA

**Investor Dashboard:**
- Supply-Demand Matrix preview
- Report generation (5/month quota display)
- Portfolio insights
- Investment thesis highlights
- Upgrade to Institutional CTA

**Institutional Dashboard:**
- Full platform access summary
- API usage metrics
- Unlimited report access
- Export activity log
- Team collaboration features (if multi-user)

### Phase 5: Testing & Refinement (Ongoing)

#### Sprint 5A: Comprehensive Persona Testing
- [ ] Test all 8 personas end-to-end
- [ ] Verify access control for all features
- [ ] Test upgrade flows
- [ ] Test admin tools with platform admin
- [ ] Test super admin exclusive features
- [ ] Performance testing with real data

#### Sprint 5B: UX Polish
- [ ] Add loading states to all dashboards
- [ ] Add empty states (no data scenarios)
- [ ] Add error boundaries
- [ ] Add tooltips and help text
- [ ] Responsive design testing (mobile, tablet)
- [ ] Accessibility audit (WCAG 2.1)

#### Sprint 5C: Documentation
- [ ] Update test user reference docs
- [ ] Create admin user guide
- [ ] Create super admin user guide
- [ ] Update API documentation with access control
- [ ] Create upgrade flow documentation

## Implementation Priorities

### Must Have (Weeks 1-2)
1. ✅ Access Control Foundation - CRITICAL for all other features
2. ✅ Admin Dashboard Index - HIGH for admin UX
3. ✅ Basic paywall enforcement - CRITICAL for business model

### Should Have (Week 3)
4. Super Admin Control Panel - HIGH for platform management
5. User Management module - HIGH for operations
6. Marketing CMS - MEDIUM for marketing team autonomy

### Nice to Have (Week 4+)
7. Persona Dashboards - MEDIUM for user engagement
8. Advanced analytics - LOW for insights
9. Audit logs viewer - LOW for compliance

## Success Criteria

### Phase 1 Complete When:
- [ ] All tier-restricted features have entitlement gates
- [ ] All API routes check access tier
- [ ] Upgrade prompts display correctly
- [ ] All 6 user personas tested with proper restrictions

### Phase 2 Complete When:
- [ ] `/admin` loads with dashboard
- [ ] All 10 admin pages accessible from dashboard
- [ ] Quick stats display correctly
- [ ] Activity feed shows recent actions

### Phase 3 Complete When:
- [ ] `/super-admin` routes load for super admin only
- [ ] User management CRUD works
- [ ] Billing overview displays correctly
- [ ] Marketing CMS can edit homepage content

### Phase 4 Complete When:
- [ ] All 5 user tiers have personalized dashboards
- [ ] Dashboards display relevant quick actions
- [ ] Usage stats show correctly (report quotas, etc.)
- [ ] Upgrade CTAs work properly

## Risk Mitigation

### Technical Risks
1. **Risk:** Access control bypass via direct API calls
   - **Mitigation:** Server-side validation on all endpoints

2. **Risk:** Dashboard performance with large datasets
   - **Mitigation:** Pagination, lazy loading, caching

3. **Risk:** Marketing CMS breaking production homepage
   - **Mitigation:** Preview mode, version control, rollback capability

### Business Risks
1. **Risk:** Users frustrated by paywalls
   - **Mitigation:** Clear upgrade paths, value communication

2. **Risk:** Admin confusion with too many tools
   - **Mitigation:** Unified admin dashboard, search, documentation

## Next Immediate Actions

1. **Start Phase 1, Sprint 1A** (Access Control Utilities)
   - Create hooks and components for entitlement checks
   - Estimated time: 1-2 days

2. **Document Protected Features**
   - Create comprehensive list from existing routes
   - Map to access tiers
   - Estimated time: 4 hours

3. **Set Up Testing Protocol**
   - Create test script for all personas
   - Document expected vs actual access
   - Estimated time: 2 hours

---

**Total Estimated Timeline:** 4 weeks for complete implementation  
**Team Recommendation:** 1-2 developers, sequential sprints  
**Dependencies:** None (infrastructure complete)
