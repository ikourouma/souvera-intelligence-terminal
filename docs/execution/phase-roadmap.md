# Souvera Intelligence Terminal — Phase Roadmap
**Owner:** Afronovation, Inc.  
**Last Updated:** April 29, 2026

---

## Roadmap Overview

This document tracks Souvera's phased implementation approach from initial platform stabilization through production-ready intelligence delivery.

**Status Legend:**
- ✅ Completed
- 🚧 In Progress
- ⏳ Planned
- 📋 Backlog

---

## Phase 0: Fortune-5 Readiness Audit & Stabilization
**Status:** ✅ Completed  
**Duration:** April 27-28, 2026  
**Owner:** Engineering Team

### Objectives
- Audit platform for Fortune-5 readiness
- Stabilize link structure, navigation, and inner pages
- Fix routing issues and broken links
- Establish baseline quality standards

### Deliverables
- ✅ Fortune-5 readiness audit report
- ✅ Link structure fixes across all pages
- ✅ Mega menu navigation corrections
- ✅ Footer link structure
- ✅ CTA routing fixes
- ✅ Executive inner page elevation

**Documentation:** `docs/phase0-phase1-summary.md`

---

## Phase 1: Inner Page Stabilization
**Status:** ✅ Completed  
**Duration:** April 28, 2026  
**Owner:** Engineering Team

### Objectives
- Stabilize mega menu and footer
- Elevate executive inner pages
- Fix routing and redirects
- Establish consistent navigation patterns

### Deliverables
- ✅ Mega menu with proper dropdowns
- ✅ Footer with proper link structure
- ✅ Executive-grade inner pages
- ✅ Proper routing and redirects
- ✅ Consistent CTA patterns

**Documentation:** `docs/phase0-phase1-summary.md`

---

## Phase 2A: Conversion & Trust Readiness
**Status:** ✅ Completed  
**Duration:** April 28, 2026  
**Owner:** Engineering Team

### Objectives
- Implement lead capture forms
- Create `/status` system health page
- Govern AI-assisted analysis language
- Establish SEO infrastructure

### Deliverables
- ✅ Lead capture form with backend API
- ✅ `/status` page with system metrics
- ✅ Governed AI language standards
- ✅ SEO meta tags and structure

**Documentation:** `docs/audits/phase-2a-conversion-trust-review.md`

---

## Phase 2B: Inner Page Content Elevation
**Status:** ✅ Completed  
**Duration:** April 28, 2026  
**Owner:** Engineering Team

### Objectives
- Convert high-value "coming-soon" pages
- Elevate content to executive-grade
- Ensure consistency across all pages

### Deliverables
- ✅ Platform overview pages
- ✅ Sector intelligence pages
- ✅ Executive-grade content
- ✅ Consistent messaging

---

## Phase 2C: Authentication & Entitlements
**Status:** ✅ Completed  
**Duration:** April 28, 2026  
**Owner:** Engineering Team

### Objectives
- Implement Supabase Auth
- Create invite-only access system
- Implement tiered entitlement model
- Provision test users

### Deliverables
- ✅ Supabase Auth integration
- ✅ Invite-only registration
- ✅ Tiered access (Public, Explorer, Professional, Business, Institutional)
- ✅ Test user provisioning script
- ✅ Tiered access QA matrix

**Documentation:** `docs/audits/phase-2c-auth-implementation-audit.md`

---

## Phase 2D: Pre-Pilot Hardening
**Status:** ✅ Completed  
**Duration:** April 28, 2026  
**Owner:** Engineering Team

### Objectives
- Implement robots.txt and noindex
- Create QA documentation
- Prepare for pilot testing

### Deliverables
- ✅ `robots.txt` (disallow all)
- ✅ Noindex meta tags on all pages
- ✅ Pre-pilot readiness checklist
- ✅ QA documentation

**Documentation:** `docs/operations/pre-pilot-readiness-checklist.md`

---

## Phase 3: Terminal Data Foundation
**Status:** 🚧 In Progress  
**Duration:** April 28-29, 2026  
**Owner:** Engineering Team

### Objectives
- Seed Africa + Caribbean country data
- Implement functional intelligence map
- Create country drawer with tiered data
- Implement market coverage filtering
- Fix frontend bugs and UX issues

### Phase 3A: Seed Data + Countries API
**Status:** ✅ Completed

**Deliverables:**
- ✅ SQL seed data for 54 African + 20 Caribbean countries
- ✅ `/api/v1/countries` endpoint with region filtering
- ✅ Database views for tiered access

### Phase 3B: Functional Intelligence Map
**Status:** ✅ Completed

**Deliverables:**
- ✅ Interactive intelligence map component
- ✅ Country drawer with metrics
- ✅ Market grid with search and filters
- ✅ Preview data banner
- ✅ Regional market grids for Africa and Caribbean pages

### Phase 3C: Market Coverage Filtering
**Status:** ✅ Completed

**Deliverables:**
- ✅ API-level mandate-scoped filtering (Africa + approved Caribbean)
- ✅ Frontend defensive filtering
- ✅ 3-row collapsed market grids (12 cards default)
- ✅ Shared market-coverage constants and utilities
- ✅ Global scope parameter for compare tool
- ✅ Market coverage filtering documentation

### Phase 3D: Regional Page Elevation
**Status:** ✅ Completed

**Deliverables:**
- ✅ Economic Corridors Grid (curated Fortune-5 design)
- ✅ Regional hero alignment (left-aligned executive style)
- ✅ Conditional region filters (hide on regional pages)
- ✅ Search clear button implementation
- ✅ Population thousands (K) formatting

### Phase 3E: Bug Fixes & UX Polish
**Status:** 🚧 In Progress

**Deliverables:**
- ✅ Fixed missing `isAfricanCountry` field in API response
- ✅ Compare page dropdown population (global scope)
- ✅ Search field clear (X) button
- ✅ Population formatting with thousands (K)
- ⏳ Final QA testing
- ⏳ Production deployment

**Documentation:** `docs/execution/phase-3-terminal-data-foundation-plan.md`

---

## Phase 4: Data Governance & Ingestion Hardening
**Status:** ⏳ Planned  
**Target:** TBD (After Phase 3 stabilization)  
**Owner:** Engineering Team

### Objectives
- Implement scalable market-scope governance model
- Harden ingestion adapters
- Add admin controls for market classification
- Establish data governance policies

### Key Deliverables

#### 4.1 Market Scope Governance
**Backlog:** DATA-GOV-01

- ⏳ Add `market_scope text[]` column to `souvera_countries`
- ⏳ Backfill African countries with `['africa', 'public_preview']`
- ⏳ Backfill Caribbean markets with `['caribbean', 'public_preview']`
- ⏳ Update `/api/v1/countries` to filter by `market_scope`
- ⏳ Remove hardcoded ISO lists (preserve as validation)
- ⏳ Update ingestion adapters for governance
- ⏳ Create admin documentation

#### 4.2 Ingestion Hardening
- ⏳ Prevent REST Countries from publishing all global countries
- ⏳ Distinguish "known country" from "published market"
- ⏳ Add ingestion governance rules
- ⏳ Create ingestion approval workflow

#### 4.3 Data Quality & Freshness
- ⏳ Implement data freshness monitoring
- ⏳ Add data quality validation rules
- ⏳ Create data update schedules
- ⏳ Establish source attribution standards

#### 4.4 Admin Controls
- ⏳ Admin panel for market-scope management
- ⏳ Bulk market-scope updates
- ⏳ Audit log for data changes
- ⏳ Data governance documentation

### Dependencies
- Phase 3 completion
- Product decision on future corridors (diaspora, trade zones)
- Admin panel infrastructure

### Success Criteria
- No hardcoded ISO lists in production code
- All public routes respect `market_scope` filtering
- Ingestion cannot accidentally publish non-mandate countries
- Admin team can manage market scopes without code changes
- Clear distinction between "known" and "published" countries

**Documentation:** 
- `docs/architecture/market-scope-governance.md`
- `docs/execution/project-backlog.md` (DATA-GOV-01)

---

## Phase 5: Production Readiness (Future)
**Status:** 📋 Backlog  
**Target:** TBD  
**Owner:** Engineering Team

### Objectives
- Performance optimization
- Monitoring and alerting
- Error tracking
- Analytics implementation
- SEO optimization
- Production deployment

### Key Areas
- ⏳ Performance benchmarking
- ⏳ Caching strategy
- ⏳ CDN configuration
- ⏳ Error tracking (Sentry)
- ⏳ Analytics (PostHog, Google Analytics)
- ⏳ SEO final optimization
- ⏳ Production environment setup
- ⏳ Load testing
- ⏳ Security audit

---

## Phase 6: Live Data Integration (Future)
**Status:** 📋 Backlog  
**Target:** TBD  
**Owner:** Engineering Team

### Objectives
- Replace seed data with live API integrations
- Implement automated data updates
- Add real-time freshness indicators
- Scale to full country coverage

### Key Areas
- ⏳ World Bank API integration
- ⏳ IMF API integration
- ⏳ REST Countries API integration
- ⏳ Data update scheduling
- ⏳ Freshness tracking
- ⏳ Data quality validation
- ⏳ Error handling for failed updates

---

## Phase 7: Advanced Features (Future)
**Status:** 📋 Backlog  
**Target:** TBD  
**Owner:** Engineering Team

### Objectives
- Implement advanced intelligence features
- Add sector-level analysis
- Create investment signals
- Build recommendation engine

### Key Areas
- ⏳ Sector intelligence pages
- ⏳ Investment signals engine
- ⏳ Country comparison advanced features
- ⏳ Portfolio tracking (Institutional tier)
- ⏳ Alert system
- ⏳ Custom reports
- ⏳ API for institutional clients

---

## Roadmap Maintenance

### Review Schedule
- **Weekly:** Sprint planning and backlog grooming
- **Bi-weekly:** Phase progress review
- **Monthly:** Roadmap adjustment and prioritization

### Change Management
1. Propose changes in sprint planning
2. Document rationale in decision log
3. Update roadmap with new dates/deliverables
4. Communicate changes to stakeholders

### Success Metrics
- On-time phase completion
- Quality of deliverables
- User feedback incorporation
- Technical debt management

---

**Document Owner:** Engineering Lead  
**Last Review:** April 29, 2026  
**Next Review:** May 6, 2026
