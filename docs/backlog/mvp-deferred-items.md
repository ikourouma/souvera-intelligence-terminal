# MVP Deferred Items - Prioritized Backlog

**Created:** 2026-06-14  
**Last Updated:** 2026-06-15  
**Owner:** Afronovation, Inc.

This document captures all feedback items deferred from the MVP launch, organized by priority and with detailed implementation notes.

---

## Priority Legend

- **P1 (High)**: Should be addressed immediately post-MVP
- **P2 (Medium)**: Address within 2-4 weeks post-MVP
- **P3 (Low)**: Future phases or backlog

---

## High Priority (P1) - Post-MVP Phase 1 ✅ ALL COMPLETED

### Persona Dashboard Deferred Features (Added June 20, 2026)

**Category:** Advanced Dashboard Features  
**Priority:** P2-P3 (Post-Sidebar POC)  
**Context:** Features identified during Business Dashboard sidebar implementation but deferred to maintain MVP focus

#### Item PD-1: Messaging & Chat in Communication Hub (P2)
**Status:** 📋 Deferred to Phase 2  
**Target:** Post-MVP (when user base grows)

**Description:**
Real-time messaging system within Communication Hub for Investor+ tiers.

**Requirements:**
- WebSocket infrastructure (Supabase Realtime)
- Message storage schema (sender, recipient, thread_id, read status)
- User presence tracking ("online", "away", "offline")
- Read receipts and typing indicators
- Mobile-responsive chat interface
- Notification integration (new message alerts)

**Complexity:** High (8-10 days)
**Dependencies:** Communication Hub notifications must be working first

**Implementation Notes:**
```sql
-- Message schema (future)
CREATE TABLE souvera_messages (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES souvera_profiles(id),
  recipient_id UUID REFERENCES souvera_profiles(id),
  thread_id UUID,
  content TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### Item PD-2: Global Filter Context (P3)
**Status:** 📋 Deferred to Advanced Features Phase  
**Target:** Institutional tier enhancement

**Description:**
Platform-wide filter context that persists across all pages for power users conducting cross-platform analysis.

**Requirements:**
- Global state management (React Context or Zustand)
- Filter persistence (database + session storage)
- Apply to: Dashboard, Intelligence Map, Country pages, Trade modules
- Visual indicator showing "Global filters active"
- Quick toggle on/off per page
- Institutional tier only

**Complexity:** Medium-High (6-8 days)
**Dependencies:** Dashboard-scoped filters working first

**Use Case:**
> Institutional analyst wants to view all data filtered by "East Africa + Manufacturing + Q4 2025" across every page without re-selecting filters.

---

#### Item PD-3: Scenario Modeling & Portfolio Analysis (P3)
**Status:** 📋 Deferred to Investor/Institutional Advanced Features  
**Target:** Premium tier differentiator

**Description:**
Advanced analytics tools for comparing multiple markets, running "what-if" scenarios, and portfolio risk analysis.

**Features:**
- **Scenario Builder**: Compare 3-5 markets side-by-side with custom weightings
- **Portfolio Tracker**: Track investment portfolio across markets
- **Risk Modeling**: Monte Carlo simulations for market entry risk
- **Benchmarking**: Compare portfolio performance against indices

**Complexity:** Very High (15-20 days)
**Dependencies:** Extensive data architecture, analytics engine

**Tech Stack:**
- Python analytics service (separate microservice)
- Advanced charting (D3.js or Recharts)
- Data warehouse for historical analysis
- Export to Excel/PDF

---

#### Item PD-4: Custom Report Builder (P2)
**Status:** 📋 Deferred pending user feedback  
**Target:** Business+ tier enhancement

**Description:**
Drag-and-drop interface for users to create custom reports with selected modules, countries, and data visualizations.

**Features:**
- Visual report builder (drag-and-drop)
- Save report templates
- Schedule automatic report generation
- White-label branding (Institutional tier)
- Export to PDF, PowerPoint, Excel

**Complexity:** High (10-12 days)
**Dependencies:** All intelligence modules stable and tested

**Business Value:**
> Business tier users can create client-ready reports without manual copy-paste from multiple pages.

---

#### Item PD-5: Team Collaboration Features (P3)
**Status:** 📋 Deferred to Organization tier features  
**Target:** Future multi-user organization plans

**Description:**
Collaboration tools for teams sharing analyses, watchlists, and reports within an organization.

**Features:**
- Shared watchlists (team can add/remove countries)
- Shared saved analyses (team folders)
- Comments and annotations on analyses
- Activity feed (who viewed/exported what)
- Role-based permissions (viewer, editor, admin)

**Complexity:** Very High (20+ days)
**Dependencies:** Organization tier launch, multi-user authentication

**Schema Impact:**
```sql
-- Future organization features
ALTER TABLE souvera_watchlists ADD COLUMN organization_id UUID;
ALTER TABLE souvera_saved_analyses ADD COLUMN shared_with_org BOOLEAN;
```

---

## High Priority (P1) - Post-MVP Phase 1 ✅ ALL COMPLETED

### Item 2: /access Page - Price Display Issue ✅ VERIFIED COMPLETE

**Original Feedback:** Preview button on `/admin/marketing/pricing` redirects to `/access`, but costs may not be properly displayed.

**Verification (June 15, 2026):**
- ✅ `AccessPlanGrid.tsx` properly fetches CMS pricing from `/api/v1/marketing/pricing`
- ✅ Maps `price_monthly`, `price_annual`, `show_price` from CMS data
- ✅ Renders prices with formatting and annual savings calculation
- ✅ Respects `showPrice` flag correctly

**Status:** Already implemented and working. No changes needed.

---

### Item 3: Pricing Tables Alignment ✅ VERIFIED COMPLETE

**Original Feedback:** Landing page pricing tables not properly aligned with admin display.

**Verification (June 15, 2026):**
- ✅ Both use equivalent grid layouts (`grid-cols-1 md:grid-cols-2 lg/xl:grid-cols-4`)
- ✅ Both fetch from the same CMS endpoint
- ✅ Both use identical card structure (badge, name, price, description, features, CTA)
- ✅ Both handle `showPrice`, `priceMonthly`, `priceAnnual` consistently

**Status:** Already aligned and working. No changes needed.

---

### Item 14: Admin Layout Sidebar Visibility Logic ✅ VERIFIED COMPLETE

**Original Feedback:** Business user (business@afronovation.com) could see Data Management and Content Management.

**Verification (June 15, 2026):**
- ✅ `verify-admin.ts` properly checks plan_id from `souvera_profiles`
- ✅ Checks admin org role from `souvera_organization_members`
- ✅ Only `platform_admin` and `super_admin` plans/roles grant admin access
- ✅ Business users without admin plan/role cannot access admin panel

**Status:** Fix verified working. SQL migration applied.

---

### Item 18: "Request Access" Button for Logged-in Users ✅ VERIFIED COMPLETE

**Original Feedback:** Handle "Request Access" button behavior on `/intelligence/map?region=africa` and `/intelligence/map?region=caribbean` for logged-in users.

**Verification (June 15, 2026):**
Multiple components handle contextual access correctly:
- ✅ `SmartAccessButton.tsx`: Shows "You have full access" / "Upgrade to Professional" / "Request Access"
- ✅ `AccessCTASection.tsx`: Shows "Full Intelligence Access Enabled" / "Upgrade to Professional" / "Request Access"
- ✅ `AccessCTABlock.tsx`: Shows "Upgrade Plan" / "Request Access" based on auth state

**Status:** Already implemented with proper entitlement-aware logic.

---

## Medium Priority (P2) - Post-MVP Phase 2

### Item 1: Ticker Items - Better UI Instructions ✅ COMPLETED

**Original Feedback:** When creating hero slides, ticker item input placeholder says "e.g., ZAF ▲ 1.2%" but user reported only "GIN" gets added without arrow/percentage.

**Root Cause:** User must type the full formatted string; system doesn't auto-format.

**Solution Implemented (Option 2 - Format Builder):**
- Added `TickerItemsEditor` component with Builder/Manual toggle
- Builder mode: Country dropdown with search, Up/Down direction buttons, Percentage input
- 29 common country codes for Africa and Caribbean with autocomplete
- Live preview of formatted ticker item before adding
- Manual mode retained for custom text

**Completed:** June 2026

**Related Files:**
- `apps/api-gateway/src/components/admin/marketing/HeroSlidesClient.tsx`

---

### Item 4: Add Pricing Table Creation ✅ COMPLETED

**Original Feedback:** Need "+ Add Pricing Table" button on `/admin/marketing/pricing` to create new pricing tiers.

**Solution Implemented:**
- Added "+ Add Pricing Table" button in header
- Create modal with plan_id input (auto-formatted to lowercase with underscores)
- Reused existing POST endpoint which already supports creating new plans
- Modal shows "Create New Pricing Plan" title and "Create Plan" button
- Validation for required fields (plan_id, display_name)

**Completed:** June 2026

**Related Files:**
- `apps/api-gateway/src/components/admin/marketing/PricingClient.tsx`
- `apps/api-gateway/src/app/api/v1/admin/marketing/pricing/route.ts`

---

### Item 7: Matrix Entitlements 404 ✅ COMPLETED

**Original Feedback:** `/admin/matrix/entitlements` returns 404.

**Root Cause:** Page file doesn't exist; only sidebar link exists.

**Solution Implemented (Option 1 - Quick Fix):**
- Removed sidebar link from `AdminSidebar.tsx`
- Full entitlements CRUD management deferred to Phase 5

**Completed:** June 2026

**Related Files:**
- `apps/api-gateway/src/components/admin/AdminSidebar.tsx`

---

### Item 11: Crosswalks - Country List and Autocomplete ✅ COMPLETED (Migration Required)

**Original Feedback:** `/admin/data/crosswalks` page - users don't see all countries when adding new mapping, and code inputs (Census, Comtrade, WDI, IMF) lack autocomplete.

**Solution Implemented:**
- Full country list (70 countries) with known code mappings
- Searchable dropdown showing all countries with "codes known" indicator
- Auto-populate Census, Comtrade, WDI, and IMF codes when country selected
- Better help text for each code field explaining what it is
- Scroll indicator showing total country count
- External Codes section with auto-populate notification

**⚠️ DATABASE MIGRATION REQUIRED:**
The crosswalks feature requires the following migration to be applied:
```
infra/supabase/migrations/20260615000001_add_crosswalk_codes_to_countries.sql
```
This migration adds `census_code`, `comtrade_code`, `wdi_code`, `imf_code`, and `is_excluded` columns to the `souvera_countries` table.

**Completed:** June 2026

**Related Files:**
- `apps/api-gateway/src/app/admin/data/crosswalks/CrosswalksClient.tsx`
- `infra/supabase/migrations/20260615000001_add_crosswalk_codes_to_countries.sql` (NEW)

---

### Item 17: Trade Intelligence Cards Redesign ✅ COMPLETED

**Original Feedback:** `/intelligence/trade` cards are hard to scan all at once.

**Solution Implemented:**
- Reorganized 9 modules into 4 logical categories:
  - US-Africa Trade (4 modules)
  - Caribbean Trade (2 modules)
  - Continental Frameworks (2 modules)
  - Reference Data (1 module)
- Quick navigation bar with category links and module counts
- Compact horizontal card layout (row-based instead of grid)
- Clearer visual hierarchy with category headers
- Consistent color coding per category
- Priority badges for important modules
- Stats displayed inline for quick scanning
- Anchor links for direct category navigation

**Completed:** June 2026

**Related Files:**
- Trade intelligence page components
- Trade data display components

---

## Low Priority (P3) - Future Phases

### Item 8: Indicator Builder 🔄 IN PROGRESS (Phase 4B)

**Current Status:** `/admin/data/indicators` shows "Indicator Builder Coming Soon"

**Planned:** Phase 4B Sprint 3 per planning docs

**Features:**
- Define custom metrics
- Map to data sources
- Configure transformations
- Set visibility rules

**Estimated Effort:** 8-12 hours

---

### Items 9 & 10: Comprehensive 74-Market Data Ingestion 🔄 IN PROGRESS

**Current Status:**
- Data ingestion dashboard shows "Automated ingestion triggers are not yet configured"
- 68/74 markets have ≥15/20 Top 20 indicators
- 6 gap markets need additional data: SOM, ERI, SSD (Africa); CUB, DMA, GRD, KNA, PRI, VGB, TCA (Caribbean)

**Comprehensive Approach (Approved June 15, 2026):**

1. **Trade Intelligence Data (All 74 Markets)**
   - AfCFTA trade flows (54 African countries) - `ingest-afcfta-flows`
   - CBTPA trade flows (20 Caribbean markets) - `ingest-cbtpa-flows`
   - Import demand signals (all 74 markets) - `ingest-import-demand-expanded`

2. **Macro Gap Fill (6 Markets → ≥15/20)**
   - IMF DataMapper gap fill - `imf-gap74-fill` (DMA, GRD, KNA, SOM)
   - World Bank rollout fill - `worldbank-rollout-fill`
   - Curated trade/macro fill - `curated-trade-macro-fill`

3. **Database Migration Required**
   - Crosswalks migration: `20260615000001_add_crosswalk_codes_to_countries.sql`

**Ingestion Commands:**
```bash
# Trade Intelligence (all 74 markets)
npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts ingest-afcfta-flows
npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts ingest-cbtpa-flows
npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts ingest-import-demand

# Macro Gap Fill
npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts imf-gap74-fill
npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts worldbank-rollout-fill
npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts curated-trade-macro-fill
```

**Goal:** Zero stakeholder queries returning "no data" for any of the 74 sovereign markets.

**Estimated Effort:** 4-6 hours (running scripts + verification)

---

### Item 19: Data Source Audit & Expansion (NEW)

**Priority:** P2 (Critical for Platform Credibility)

**Business Context:**
Souvera relies on external data sources to maintain institutional credibility. Regular auditing ensures data freshness, identifies gaps, and discovers new sources to improve intelligence coverage.

**Required Actions:**

1. **Audit Current Data Sources**
   - Inventory all active data sources in `souvera_data_sources` table
   - Check freshness and last successful ingestion for each source
   - Identify stale or deprecated sources
   - Document API rate limits and quotas

2. **Evaluate New Data Sources**
   | Source | Type | Coverage | Priority |
   |--------|------|----------|----------|
   | UN Comtrade API | Trade flows | Global | High |
   | ITC Trade Map | Trade intelligence | Global | High |
   | IMF WEO/DOTS | Macro + trade | Global | High |
   | World Bank WITS | Trade analysis | Global | Medium |
   | AfDB Statistics | Africa macro | 54 countries | Medium |
   | CARICOM Statistics | Caribbean | 15 countries | Medium |
   | African Union Data | AfCFTA specific | 54 countries | Medium |
   | UNCTAD Statistics | FDI, trade | Global | Medium |
   | OECD FDI Statistics | Investment flows | Selected | Low |
   | Central Bank APIs | Forex, reserves | Per country | Low |

3. **Freshness Monitoring**
   - Create automated freshness checks in admin panel
   - Alert when source data is >30 days stale
   - Track ingestion success/failure rates
   - Dashboard showing data currency by market

4. **Future Automation**
   - Cron-based scheduled ingestion (Phase 5)
   - Webhook-triggered updates where supported
   - Fallback source rotation for critical indicators

**Deliverables:**
- `docs/data/data-source-audit-2026.md` - Full audit report
- Updated `souvera_data_sources` table with new sources
- Admin dashboard widget for data freshness monitoring
- Ingestion adapters for 2-3 new high-priority sources

**Estimated Effort:** 16-24 hours

---

### Item 20: Tier A Import Demand Data Research (NEW)

**Priority:** P2 (Trade Intelligence Completeness)

**Business Context:**
The African Import Demand Intelligence module currently uses programmatically generated estimates for many countries and sectors. To maintain Souvera's institutional credibility and provide truly actionable intelligence, high-quality curated data (Tier A) should eventually replace these estimates for all 54 African countries across all 10 sector categories.

**Current State:**
- 34 Tier A curated records exist (partial coverage for top 10 African economies)
- 540 records needed for full 54-country × 10-category coverage
- Gap: ~506 records need research and curation

**Required Actions:**

1. **Research Phase**
   - Identify primary data sources per country:
     - National statistics offices (import data by HS chapter)
     - UN Comtrade bilateral trade flows
     - ITC Trade Map detailed statistics
     - UNCTAD trade profiles
   - Document data availability and vintage by country/sector

2. **Data Collection by Category**
   | Category | HS Chapters | Key Data Points |
   |----------|-------------|-----------------|
   | Machinery & Equipment | 84-85 | Total imports, US share, top suppliers |
   | Grains & Cereals | 10-11 | Import volumes, US vs competitor shares |
   | Fertilizers | 31 | Import dependency, Russian/US competition |
   | Pharmaceuticals | 30 | PEPFAR flows, Indian generic competition |
   | Cotton & Textiles | 50-63 | EPZ input flows, AGOA linkages |
   | Transport Vehicles | 86-89 | Fleet composition, Chinese competition |
   | Intermediate Goods | 72-73 | Manufacturing inputs, trade balances |
   | Textile Inputs | 54-55 | Synthetic yarn, fabric sourcing |
   | ICT & Telecom | 85 (sub) | 5G equipment, Huawei competition |
   | Medical Devices | 90 | Diagnostic equipment, US brand share |

3. **Curation Priority Order**
   - **Tier 1 (54 records):** Complete all 10 categories for top 5 markets (NGA, ZAF, EGY, KEN, ETH)
   - **Tier 2 (90 records):** Next 9 markets (GHA, TZA, CIV, SEN, MOZ, etc.)
   - **Tier 3 (remaining):** All other African countries

4. **Quality Standards**
   - Source attribution required for all values
   - Data vintage must be 2022 or newer
   - Cross-validation with at least 2 sources for Tier A designation
   - Document methodological notes for estimates

**Deliverables:**
- Updated `TIER_A_CURATED_RECORDS` array in ingestion script
- Research notes document: `docs/data/import-demand-research-notes.md`
- Source citation spreadsheet for audit trail
- Quality tier upgrade for affected markets

**Estimated Effort:** 24-40 hours (phased over multiple sprints)

**Related:** Item 19 (Data Source Audit), Items 9-10 (74-Market Data Ingestion)

---

### Item 12: Trade Policy Intelligence Manual Backup

**Current Status:** "Updates currently require editing data/agoa-legislative-tracker.ts and redeploy"

**Required:**
- Admin form for manual TPI entry when automated workflow fails
- CRUD interface for policy updates
- Publish workflow with approval

**Planned:** ADMIN-TPI-01

**Estimated Effort:** 6-8 hours

---

### Item 13: Platform Statistics

**Current Status:** Platform Statistics shows "Coming Soon"

**Required Features:**
- User engagement metrics
- Report generation stats
- API usage tracking
- Popular markets/sectors
- Performance metrics
- Usage trends over time

**Estimated Effort:** 8-12 hours

**Requires:** Analytics data collection setup

---

### Item 5: Trial Pricing + Event Pages (Strategic)

**Original Feedback:** 15/30-day trial pricing cards for events (starting with ACTIF2026), multi-step registration, watermarked downloads.

**Components:**
1. Trial pricing table in CMS
2. Event page builder/template
3. Trial registration flow (multi-step)
4. Watermark service for downloads during trial
5. Trial expiration handling
6. Event-specific analytics

**Business Context:**
- Strategic for user acquisition at events
- Event: [AfrCaribbean Trade and Investment Forum 2026](https://actif2026.afreximbankevents.com/)
- Each event gets dedicated page with trial access cards

**Estimated Effort:** 16-24 hours (full feature)

---

### Item 15: Comprehensive User Dashboard

**Status:** Foundation was built then removed for MVP; full sovereign-level dashboard deferred.

**Detailed Plan:** See `docs/backlog/user-dashboard-communication-hub-backlog.md`

**Features:**
- Reports library with quota management
- Communication hub (messaging, notifications)
- Task management
- System health indicators
- Recent activity feed
- Profile and settings management
- Subscription management

**Estimated Effort:** 40-60 hours (full feature set)

**Planned:** After data ingestion and reporting phases complete

---

### Item 16: Plan Review and Status Update

**Action Required:**
- Review `docs/execution/PHASE-3-4-IMPLEMENTATION-PLAN.md`
- Update Phase status overview (lines 20-30)
- Mark completed items
- Document all deferred items with reasons and timelines

---

## Summary by Effort

| Priority | Item | Estimated Hours | Status |
|----------|------|-----------------|--------|
| P1 | Item 2: /access pricing | - | ✅ Complete |
| P1 | Item 3: Pricing alignment | - | ✅ Complete |
| P1 | Item 14: Verify permissions | - | ✅ Complete |
| P1 | Item 18: Request Access button | - | ✅ Complete |
| P2 | Item 1: Ticker UI | - | ✅ Complete |
| P2 | Item 4: Add pricing table | - | ✅ Complete |
| P2 | Item 7: Entitlements 404 | - | ✅ Complete |
| P2 | Item 11: Crosswalks autocomplete | - | ✅ Complete |
| P2 | Item 17: Trade cards redesign | - | ✅ Complete |
| P2 | Item 19: Data source audit | 16-24 | 📋 New |
| P2 | Item 20: Tier A data research | 24-40 | 📋 New |
| P3 | Item 8: Indicator builder | 8-12 | 🔄 In Progress |
| P3 | Items 9-10: 74-market data ingestion | 4-6 | 🔄 In Progress |
| P3 | Item 12: TPI backup | 6-8 | 📋 Planned |
| P3 | Item 13: Platform stats | 8-12 | 📋 Planned |
| P3 | Item 5: Trials + events | 16-24 | 📋 Planned |
| P3 | Item 15: User dashboard | 40-60 | 📋 Planned |

**P1 Total:** ✅ All Complete  
**P2 Total:** 40-64 hours remaining (Items 19-20)  
**P3 Total:** ~82-122 hours remaining

---

## Recently Implemented (June 15, 2026)

The following admin pages were created to resolve 404 errors:

| Route | Description | Status |
|-------|-------------|--------|
| `/admin/system/flags` | Feature flags management with toggle, create, scoping | ✅ Complete |
| `/admin/system/config` | System configuration and health status | ✅ Complete |
| `/admin/system/audit` | Audit logs with filtering and export | ✅ Complete |
| `/admin/users/organizations` | Organization management with member view | ✅ Complete |
| `/admin/users/logs` | User access logs (Coming Soon stub) | ✅ Stub |

**New API Endpoints:**
- `GET/PATCH/DELETE /api/v1/admin/marketing/feature-flags/[key]`
- `GET /api/v1/admin/system/config`
- `GET /api/v1/admin/system/audit`
- `GET/POST /api/v1/admin/organizations`
- `GET /api/v1/admin/organizations/[id]/members`

**Documentation:**
- `docs/admin/ADMIN-FEATURES-GUIDE.md` - Complete admin panel reference

---

## Known Data Gaps

The following countries have been identified as having incomplete trade data:

**Priority Countries Requiring Data Enhancement (Tier A Elevation):**
| ISO3 | Country | Region | Issue | Priority |
|------|---------|--------|-------|----------|
| EGY | Egypt | North Africa | Missing trade flow data, risk analysis incomplete | P1 |
| MAR | Morocco | North Africa | Partial trade data | P1 |
| TUN | Tunisia | North Africa | Partial trade data | P1 |
| DZA | Algeria | North Africa | Partial trade data | P1 |
| LBY | Libya | North Africa | Limited data availability | P2 |

**Action Required:**
1. Elevate EGY, MAR, TUN, DZA from Tier B to Tier A
2. Add curated trade flow data for these countries
3. Complete risk analysis data for all North African markets
4. Re-run import demand ingestion with updated tiers

---

## Next Steps

1. **Immediate (June 15, 2026):**
   - ✅ Run SQL migration: `20260615000001_add_crosswalk_codes_to_countries.sql`
   - 🔄 Execute comprehensive 74-market data ingestion (Items 9-10)
   - ⚠️ Fix North African data gaps (EGY, MAR, TUN, DZA)
   
2. **This Week:**
   - Complete trade intelligence data ingestion (AfCFTA, CBTPA, import demand)
   - Fill macro gaps for 6 markets (SOM, ERI, SSD, CUB, DMA, GRD, KNA, PRI, VGB, TCA)
   - Add North African Tier A curated data
   - Verify all 74 markets have trade data coverage
   
3. **Next Sprint:**
   - Begin data source audit (Item 19)
   - Evaluate and integrate 2-3 new data sources
   - Create data freshness monitoring dashboard
   
4. **Future Phases:**
   - Phase 5: Automated ingestion triggers (cron jobs)
   - Phase 5: User access logs implementation
   - Phase 6: Comprehensive user dashboard

---

## Related Documents

- `docs/admin/ADMIN-FEATURES-GUIDE.md` - Admin panel features guide
- `docs/backlog/user-dashboard-communication-hub-backlog.md` - Full user dashboard plan
- `docs/execution/PHASE-3-4-IMPLEMENTATION-PLAN.md` - Original implementation plan
- `docs/backlog/README.md` - Backlog index
