# Phase 4B Backlog
## Source Registry, Indicator Builder, and Trade Data Integration

**Document Type:** Product Backlog  
**Classification:** Internal — Engineering Planning  
**Date:** 2026-05-06  
**Version:** 1.0  
**Owner:** Afronovation Engineering Team  
**Status:** Approved for Planning

---

## Executive Summary

This backlog defines the implementation scope for Phase 4B, focusing on:

1. **Source Registry** — Admin infrastructure for managing data sources
2. **Indicator Builder** — Framework for defining and configuring metrics
3. **Core Connectors** — Integration with priority data APIs
4. **Trade Intelligence** — AGOA, AfCFTA, and supply-demand capabilities

### Phase 4B Objectives

- Establish foundation for scalable data ingestion
- Enable admin-driven source management without code deployments
- Deliver AGOA eligibility and AfCFTA status tracking
- Begin U.S. import demand and African export capacity data integration
- Prepare for Phase 4C product-level trade intelligence

---

## Priority and Effort Legend

### Priority

| Priority | Label | Description |
|----------|-------|-------------|
| P0 | Critical | Must have for Phase 4B MVP |
| P1 | High | Important for Phase 4B value |
| P2 | Medium | Valuable but can defer |
| P3 | Low | Nice to have, defer to 4C+ |

### Effort (Story Points)

| Effort | Points | Duration |
|--------|--------|----------|
| XS | 1 | <1 day |
| S | 2 | 1-2 days |
| M | 5 | 3-5 days |
| L | 8 | 1-2 weeks |
| XL | 13 | 2-3 weeks |

---

## Category 1: Source Registry Infrastructure

### SRC-001: Source Registry Core Schema
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 1

**Description:**  
Create database schema and admin API for managing data sources.

**User Story:**  
As a Data Admin, I want to register and configure data sources so that I can manage where Souvera gets its data.

**Acceptance Criteria:**
- [ ] `admin_source_registry` table created with all required fields
- [ ] Source types supported: `api`, `file`, `manual`
- [ ] Admin API: create, read, update, archive sources
- [ ] Source configuration stored as structured JSON
- [ ] API credentials stored securely (encrypted reference)
- [ ] RLS policies for admin-only access

**Technical Notes:**
- Use Supabase vault or environment variables for credentials
- Do not store raw API keys in database

---

### SRC-002: Source Registry Admin UI
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 1

**Description:**  
Build admin interface for source management.

**User Story:**  
As a Data Admin, I want a UI to manage sources so that I don't need engineering support.

**Acceptance Criteria:**
- [ ] List view of all sources with status
- [ ] Create new source form
- [ ] Edit source configuration
- [ ] Archive source (soft delete)
- [ ] View source details and history
- [ ] Filter/search sources

**UI Components:**
- `/admin/sources` — Source list
- `/admin/sources/new` — Create form
- `/admin/sources/[id]` — Detail/edit view

---

### SRC-003: Source Health Monitoring
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 2

**Description:**  
Implement health checking for API sources.

**User Story:**  
As a Data Admin, I want to see source health status so that I can identify and fix problems.

**Acceptance Criteria:**
- [ ] Health check endpoint for each API source
- [ ] Automated health checks on configurable schedule
- [ ] Health status: `healthy`, `degraded`, `unhealthy`
- [ ] Response time tracking
- [ ] Error message capture
- [ ] Health history retention (90 days)
- [ ] Admin dashboard health summary

**Technical Notes:**
- Use Edge Functions for health checks
- Store results in `admin_source_health` table

---

### SRC-004: Manual Ingestion Trigger
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 2

**Description:**  
Enable admins to manually trigger data ingestion.

**User Story:**  
As a Data Admin, I want to manually trigger ingestion so that I can update data on demand.

**Acceptance Criteria:**
- [ ] "Trigger Ingestion" button on source detail page
- [ ] Ingestion job created with `manual` trigger type
- [ ] Job status tracking: `queued`, `running`, `completed`, `failed`
- [ ] Row counts displayed: fetched, valid, invalid, inserted, updated
- [ ] Error details viewable
- [ ] Job history viewable

---

### SRC-005: Scheduled Ingestion Framework
**Priority:** P0 | **Effort:** L (8 pts) | **Sprint:** 3

**Description:**  
Implement scheduled/cron-based ingestion for API sources.

**User Story:**  
As a Data Admin, I want to schedule automatic ingestion so that data stays fresh.

**Acceptance Criteria:**
- [ ] Schedule configuration per source (cron or presets)
- [ ] Schedule presets: hourly, daily, weekly, monthly
- [ ] Scheduler service runs on interval (e.g., every 15 min)
- [ ] Due sources trigger ingestion jobs
- [ ] Failed job alerts to admin
- [ ] Enable/disable schedule without deleting
- [ ] Schedule execution history

**Technical Notes:**
- Use Supabase pg_cron or external scheduler
- Consider Supabase Edge Functions with cron triggers

---

### SRC-006: Data Freshness Badges
**Priority:** P0 | **Effort:** S (2 pts) | **Sprint:** 2

**Description:**  
Display data freshness indicators in the UI.

**User Story:**  
As a Professional+ user, I want to see data freshness so that I can assess data relevance.

**Acceptance Criteria:**
- [ ] Freshness badge component: `fresh` (<7 days), `recent` (<30 days), `stale` (>30 days)
- [ ] Badge displayed on indicator values
- [ ] Tooltip shows exact date and source
- [ ] Configurable freshness thresholds per indicator
- [ ] Freshness visible on country panel, sector data

---

### SRC-007: Ingestion Error Handling
**Priority:** P1 | **Effort:** M (5 pts) | **Sprint:** 3

**Description:**  
Robust error handling and retry logic for ingestion.

**User Story:**  
As a Data Admin, I want ingestion to handle errors gracefully so that partial failures don't lose all data.

**Acceptance Criteria:**
- [ ] Row-level error capture (not fail entire job)
- [ ] Error categorization: validation, network, parsing, mapping
- [ ] Retry logic with exponential backoff
- [ ] Max retry configuration
- [ ] Error summary report
- [ ] Admin can view/download error details

---

### SRC-008: Source Credential Management
**Priority:** P1 | **Effort:** M (5 pts) | **Sprint:** 3

**Description:**  
Secure storage and management of API credentials.

**User Story:**  
As a Super Admin, I want to securely manage API keys so that credentials are protected.

**Acceptance Criteria:**
- [ ] Credentials stored encrypted (Supabase vault or similar)
- [ ] Admin can add/update credentials
- [ ] Credentials never exposed in UI (masked)
- [ ] Credential rotation support
- [ ] Audit log for credential access

---

## Category 2: Indicator Builder

### IND-001: Indicator Builder Core Schema
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 3

**Description:**  
Create database schema for indicator definitions.

**User Story:**  
As a Data Admin, I want to define indicators so that I can expand the data library.

**Acceptance Criteria:**
- [ ] `admin_indicator_definitions` table created
- [ ] Indicator key, label, description
- [ ] Source mapping (source_id, endpoint, field path)
- [ ] Entity mapping (country, sector, product)
- [ ] Data type, unit, format configuration
- [ ] Access control (visibility tier)
- [ ] Publish status (draft, review, published, deprecated)

---

### IND-002: Indicator Builder Admin UI
**Priority:** P0 | **Effort:** L (8 pts) | **Sprint:** 4

**Description:**  
Build admin interface for indicator management.

**User Story:**  
As a Data Admin, I want a UI to create and configure indicators so that I can add new metrics.

**Acceptance Criteria:**
- [ ] List view of all indicators with status/source
- [ ] Create new indicator wizard
- [ ] Source mapping configuration
- [ ] Entity mapping configuration
- [ ] Transform/aggregation configuration
- [ ] Preview indicator data
- [ ] Edit indicator configuration
- [ ] Deprecate indicator

**UI Components:**
- `/admin/indicators` — Indicator list
- `/admin/indicators/new` — Create wizard
- `/admin/indicators/[id]` — Detail/edit view

---

### IND-003: Indicator Publish Workflow
**Priority:** P1 | **Effort:** M (5 pts) | **Sprint:** 4

**Description:**  
Implement review and publish workflow for indicators.

**User Story:**  
As a Data Admin, I want a publish workflow so that indicators are reviewed before going live.

**Acceptance Criteria:**
- [ ] New indicators start as `draft`
- [ ] Submit for review action
- [ ] Approve/reject with comments
- [ ] Published indicators visible to entitled users
- [ ] Deprecate action (hide from new queries)
- [ ] Publish/deprecate logged to audit trail

---

### IND-004: Indicator Validation Rules
**Priority:** P1 | **Effort:** M (5 pts) | **Sprint:** 4

**Description:**  
Configurable validation rules for indicator data.

**User Story:**  
As a Data Admin, I want to define validation rules so that bad data is caught before publishing.

**Acceptance Criteria:**
- [ ] Rule types: required, range, format, reference, uniqueness
- [ ] Rules configurable per indicator
- [ ] Validation runs during ingestion
- [ ] Validation errors logged and viewable
- [ ] Severity levels: error (block), warning (allow)

---

### IND-005: Entity Mapping Tables
**Priority:** P0 | **Effort:** S (2 pts) | **Sprint:** 2

**Description:**  
Create crosswalk tables for entity mapping.

**User Story:**  
As a system, I need to map external codes to Souvera entities so that data is correctly attributed.

**Acceptance Criteria:**
- [ ] `entity_key_country_map` table (Census codes, Comtrade codes, names → ISO3)
- [ ] `entity_key_sector_map` table (external sector → Souvera sector)
- [ ] Lookup functions for mapping
- [ ] Admin UI to manage mappings
- [ ] Unmapped key logging

---

## Category 3: Data Connectors

### CON-001: CSV/Excel File Connector
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 1

**Description:**  
Enable CSV and Excel file upload for data ingestion.

**User Story:**  
As a Data Admin, I want to upload data files so that I can ingest data not available via API.

**Acceptance Criteria:**
- [ ] File upload UI (drag-drop or browse)
- [ ] CSV parsing with header detection
- [ ] Excel parsing (first sheet or selectable)
- [ ] Column mapping to indicator fields
- [ ] Data preview before import
- [ ] Validation errors displayed
- [ ] File size limit (e.g., 10MB)
- [ ] Supported formats: .csv, .xlsx, .xls

---

### CON-002: UN Comtrade Connector
**Priority:** P0 | **Effort:** L (8 pts) | **Sprint:** 3

**Description:**  
Build connector for UN Comtrade API.

**User Story:**  
As a system, I need to fetch global trade data from UN Comtrade so that users can see supply/demand.

**Acceptance Criteria:**
- [ ] API authentication (subscription key)
- [ ] Fetch trade data by reporter, partner, HS code, year
- [ ] Response parsing and normalization
- [ ] Country code mapping (Comtrade → ISO3)
- [ ] HS code validation
- [ ] Rate limit handling (100/hour free tier)
- [ ] Error handling and retry
- [ ] Incremental fetch support (by year)

**API Endpoints:**
```
GET /api/v1/get/C/A/HS
```

---

### CON-003: U.S. Census Trade Connector
**Priority:** P0 | **Effort:** L (8 pts) | **Sprint:** 3

**Description:**  
Build connector for U.S. Census International Trade API.

**User Story:**  
As a system, I need to fetch U.S. import data so that users can see U.S. market demand.

**Acceptance Criteria:**
- [ ] API authentication (API key)
- [ ] Fetch imports by country, HS code, time period
- [ ] Response parsing and normalization
- [ ] Census country code mapping → ISO3
- [ ] HTS code handling (2, 4, 6, 10 digit)
- [ ] Rate limit handling
- [ ] Error handling and retry
- [ ] Monthly data support

**API Endpoints:**
```
GET /data/timeseries/intltrade/imports/hs
GET /data/timeseries/intltrade/exports/hs
```

---

### CON-004: World Bank WITS Connector
**Priority:** P1 | **Effort:** M (5 pts) | **Sprint:** 4

**Description:**  
Build connector for World Bank WITS API.

**User Story:**  
As a system, I need to fetch tariff data so that users can see preference margins.

**Acceptance Criteria:**
- [ ] API endpoint configuration
- [ ] Fetch tariff rates by reporter, product
- [ ] Response parsing and normalization
- [ ] Country and HS code mapping
- [ ] Error handling

**Notes:**
- WITS API may require SOAP handling
- Start with tariff data; NTM later

---

### CON-005: Federal Register RSS Connector
**Priority:** P2 | **Effort:** S (2 pts) | **Sprint:** 5

**Description:**  
Monitor Federal Register for AGOA-related notices.

**User Story:**  
As a Data Admin, I want to be alerted to AGOA policy changes so that eligibility data stays current.

**Acceptance Criteria:**
- [ ] RSS/Atom feed parsing
- [ ] Keyword filtering (AGOA, eligibility)
- [ ] New item detection
- [ ] Admin notification
- [ ] Link to source document

---

## Category 4: Trade Intelligence Features

### TRD-001: AGOA Eligibility Tracker
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 2

**Description:**  
Track and display AGOA eligibility status.

**User Story:**  
As a Trade Analyst, I want to see AGOA eligibility for each country so that I can assess trade policy implications.

**Acceptance Criteria:**
- [ ] `agoa_eligibility` table with status, apparel eligibility, dates
- [ ] Display eligibility for 49 sub-Saharan countries
- [ ] Status values: eligible, suspended, graduated, never_eligible
- [ ] Apparel eligibility (third-country fabric)
- [ ] Eligibility history (5+ years)
- [ ] Manual data entry/update via admin
- [ ] Visible on country intelligence panel

**Data Source:** USTR (manual curation)

---

### TRD-002: AfCFTA Status Tracker
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 2

**Description:**  
Track AfCFTA implementation status.

**User Story:**  
As a Trade Analyst, I want to see AfCFTA status for each country so that I can track continental integration.

**Acceptance Criteria:**
- [ ] `afcfta_status` table with signed, ratified, trading dates
- [ ] Display status for 54 African countries
- [ ] Track tariff schedule submission
- [ ] Track services offer submission
- [ ] Manual data entry/update via admin
- [ ] Visible on country intelligence panel

**Data Source:** AfCFTA Secretariat, tralac (manual curation)

---

### TRD-003: Country Trade Profile Enhancement
**Priority:** P1 | **Effort:** M (5 pts) | **Sprint:** 4

**Description:**  
Add trade policy data to country intelligence panel.

**User Story:**  
As a Professional+ user, I want trade policy info on country panels so that I have integrated intelligence.

**Acceptance Criteria:**
- [ ] AGOA eligibility badge on country panel
- [ ] AfCFTA status badge on country panel
- [ ] Trade snapshot summary (if data available)
- [ ] Professional+ entitlement for trade policy data

**Dependencies:** TRD-001, TRD-002

---

### TRD-004: U.S. Import Demand Data (HS6)
**Priority:** P1 | **Effort:** L (8 pts) | **Sprint:** 4-5

**Description:**  
Ingest and display U.S. import demand by HS code and country.

**User Story:**  
As a Trade Analyst, I want to see U.S. import demand so that I can identify market opportunities.

**Acceptance Criteria:**
- [ ] `us_product_demand` table
- [ ] Import value by 6-digit HS code
- [ ] Import source countries (top suppliers)
- [ ] Growth rate calculation
- [ ] Concentration index calculation
- [ ] Scheduled ingestion from Census API
- [ ] Viewable on product/opportunity pages (Phase 4C)

**Data Source:** U.S. Census Trade API

---

### TRD-005: African Export Capacity Data (HS6)
**Priority:** P1 | **Effort:** L (8 pts) | **Sprint:** 4-5

**Description:**  
Ingest and display African export capacity by HS code and country.

**User Story:**  
As a Trade Analyst, I want to see African export capacity so that I can assess supply-side potential.

**Acceptance Criteria:**
- [ ] `country_product_supply` table
- [ ] Export value by 6-digit HS code
- [ ] Export volume/quantity
- [ ] Scheduled ingestion from UN Comtrade
- [ ] Coverage for 54 African countries
- [ ] Viewable on product/opportunity pages (Phase 4C)

**Data Source:** UN Comtrade API

---

### TRD-006: Basic Supply-Demand Matrix
**Priority:** P1 | **Effort:** L (8 pts) | **Sprint:** 5

**Description:**  
Display supply-demand matrix at country-sector level.

**User Story:**  
As an Investment Officer, I want a supply-demand matrix so that I can identify opportunity gaps.

**Acceptance Criteria:**
- [ ] Matrix view: 74 countries × 7 sectors
- [ ] Cell shows existing sector scores
- [ ] Color-coded by opportunity level
- [ ] Filter by AGOA eligibility
- [ ] Filter by region
- [ ] Click cell → country-sector detail
- [ ] Export to Excel

**Dependencies:** Phase 4A sector data

---

### TRD-007: HS Code Reference Data Load
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 2

**Description:**  
Load HS code reference data for product intelligence.

**User Story:**  
As a system, I need HS code reference data so that product intelligence can be built.

**Acceptance Criteria:**
- [ ] `product_hs_codes` table
- [ ] Load 6-digit HS codes (5,000+ subheadings)
- [ ] Code hierarchy (chapter, heading, subheading)
- [ ] Product descriptions
- [ ] AGOA eligibility flag
- [ ] GSP eligibility flag
- [ ] Sector category mapping

**Data Source:** USITC HTS, UN Comtrade reference

---

### TRD-008: Country Code Crosswalk
**Priority:** P0 | **Effort:** S (2 pts) | **Sprint:** 1

**Description:**  
Build comprehensive country code mapping.

**User Story:**  
As a system, I need to translate between country code systems so that data is correctly attributed.

**Acceptance Criteria:**
- [ ] Mapping: ISO3 ↔ ISO2 ↔ Census codes ↔ Comtrade codes ↔ names
- [ ] All 74 Souvera markets included
- [ ] Global coverage for trade partners (200+ countries)
- [ ] Lookup functions available
- [ ] Admin can add/edit mappings

---

### TRD-009: Trade Product Opportunity Cards
**Priority:** P2 | **Effort:** M (5 pts) | **Sprint:** 5+

**Description:**  
Display product opportunity cards for country-product combinations.

**User Story:**  
As a Trade Analyst, I want product opportunity cards so that I can quickly assess specific opportunities.

**Acceptance Criteria:**
- [ ] Card shows: country, product, opportunity score
- [ ] U.S. import demand indicators
- [ ] African export capacity indicators
- [ ] Tariff advantage (AGOA vs. MFN)
- [ ] Key factors summary
- [ ] Link to detailed analysis

**Dependencies:** TRD-004, TRD-005, TRD-007

---

### TRD-010: Tariff Rate Display
**Priority:** P2 | **Effort:** M (5 pts) | **Sprint:** 5+

**Description:**  
Display tariff rates for AGOA preference analysis.

**User Story:**  
As a Trade Analyst, I want to see tariff rates so that I can calculate preference margins.

**Acceptance Criteria:**
- [ ] MFN tariff rate by HS code
- [ ] AGOA preferential rate (0% for eligible)
- [ ] Preference margin calculation
- [ ] Display on product opportunity cards

**Data Source:** WITS, USITC HTS

---

## Category 5: Admin Tools

### ADM-001: Admin Data Quality Dashboard
**Priority:** P1 | **Effort:** M (5 pts) | **Sprint:** 4

**Description:**  
Dashboard for monitoring data quality and completeness.

**User Story:**  
As a Data Admin, I want a data quality dashboard so that I can monitor coverage and identify gaps.

**Acceptance Criteria:**
- [ ] Indicator coverage by country (heatmap)
- [ ] Data freshness summary
- [ ] Recent ingestion activity
- [ ] Validation error summary
- [ ] Missing data report
- [ ] Filter by source, indicator, region

---

### ADM-002: Audit Log Viewer
**Priority:** P1 | **Effort:** S (2 pts) | **Sprint:** 3

**Description:**  
Admin interface for viewing audit logs.

**User Story:**  
As a Super Admin, I want to view audit logs so that I can track all admin actions.

**Acceptance Criteria:**
- [ ] List of audit events
- [ ] Filter by event type, user, entity, date range
- [ ] Event detail view (changes, metadata)
- [ ] Export to CSV
- [ ] 90-day history visible

---

### ADM-003: Audit Log Schema
**Priority:** P0 | **Effort:** S (2 pts) | **Sprint:** 1

**Description:**  
Create audit logging infrastructure.

**User Story:**  
As a system, I need to log all admin actions for compliance and troubleshooting.

**Acceptance Criteria:**
- [ ] `admin_audit_log` table
- [ ] Log: event type, timestamp, user, entity, changes
- [ ] Automatic logging for source/indicator CRUD
- [ ] Automatic logging for ingestion triggers
- [ ] Automatic logging for publish actions

---

## Backlog Summary

### Phase 4B Core Scope (P0)

| Category | Items | Total Points |
|----------|-------|--------------|
| Source Registry | SRC-001, SRC-002, SRC-003, SRC-004, SRC-005, SRC-006 | 30 |
| Indicator Builder | IND-001, IND-005 | 7 |
| Connectors | CON-001, CON-002, CON-003 | 21 |
| Trade Intel | TRD-001, TRD-002, TRD-007, TRD-008 | 14 |
| Admin | ADM-003 | 2 |
| **P0 Total** | | **74 pts** |

### Phase 4B Extended Scope (P1)

| Category | Items | Total Points |
|----------|-------|--------------|
| Source Registry | SRC-007, SRC-008 | 10 |
| Indicator Builder | IND-002, IND-003, IND-004 | 18 |
| Connectors | CON-004 | 5 |
| Trade Intel | TRD-003, TRD-004, TRD-005, TRD-006 | 29 |
| Admin | ADM-001, ADM-002 | 7 |
| **P1 Total** | | **69 pts** |

### Phase 4B Total

| Priority | Points |
|----------|--------|
| P0 (Critical) | 74 |
| P1 (Important) | 69 |
| **Total** | **143 pts** |

---

## Sprint Planning

### Sprint 1 (Weeks 1-2): Foundation
**Goal:** Source Registry schema, file upload, basic infrastructure

| ID | Item | Points |
|----|------|--------|
| SRC-001 | Source Registry Core Schema | 5 |
| SRC-002 | Source Registry Admin UI | 5 |
| CON-001 | CSV/Excel File Connector | 5 |
| TRD-008 | Country Code Crosswalk | 2 |
| ADM-003 | Audit Log Schema | 2 |
| **Sprint Total** | | **19** |

---

### Sprint 2 (Weeks 3-4): Health & Manual Trade Data
**Goal:** Source health monitoring, manual ingestion, AGOA/AfCFTA trackers

| ID | Item | Points |
|----|------|--------|
| SRC-003 | Source Health Monitoring | 5 |
| SRC-004 | Manual Ingestion Trigger | 5 |
| SRC-006 | Data Freshness Badges | 2 |
| TRD-001 | AGOA Eligibility Tracker | 5 |
| TRD-002 | AfCFTA Status Tracker | 5 |
| TRD-007 | HS Code Reference Data Load | 5 |
| IND-005 | Entity Mapping Tables | 2 |
| **Sprint Total** | | **29** |

---

### Sprint 3 (Weeks 5-6): API Connectors
**Goal:** UN Comtrade, Census connectors, scheduled ingestion

| ID | Item | Points |
|----|------|--------|
| SRC-005 | Scheduled Ingestion Framework | 8 |
| CON-002 | UN Comtrade Connector | 8 |
| CON-003 | U.S. Census Trade Connector | 8 |
| SRC-007 | Ingestion Error Handling | 5 |
| ADM-002 | Audit Log Viewer | 2 |
| **Sprint Total** | | **31** |

---

### Sprint 4 (Weeks 7-8): Indicator Builder & Trade Data
**Goal:** Indicator builder, credentials, trade profile enhancement

| ID | Item | Points |
|----|------|--------|
| IND-001 | Indicator Builder Core Schema | 5 |
| IND-002 | Indicator Builder Admin UI | 8 |
| IND-003 | Indicator Publish Workflow | 5 |
| SRC-008 | Source Credential Management | 5 |
| TRD-003 | Country Trade Profile Enhancement | 5 |
| ADM-001 | Admin Data Quality Dashboard | 5 |
| **Sprint Total** | | **33** |

---

### Sprint 5 (Weeks 9-10): Trade Intelligence
**Goal:** Supply-demand data, matrix, validation

| ID | Item | Points |
|----|------|--------|
| IND-004 | Indicator Validation Rules | 5 |
| CON-004 | World Bank WITS Connector | 5 |
| TRD-004 | U.S. Import Demand Data (HS6) | 8 |
| TRD-005 | African Export Capacity Data (HS6) | 8 |
| TRD-006 | Basic Supply-Demand Matrix | 8 |
| **Sprint Total** | | **34** |

---

## Success Criteria

### Phase 4B Completion Criteria

**Source Registry:**
- [ ] 5+ data sources registered and configured
- [ ] Manual file upload operational
- [ ] UN Comtrade API integration working
- [ ] U.S. Census API integration working
- [ ] Scheduled ingestion running for at least 1 source
- [ ] Source health monitoring operational

**Indicator Builder:**
- [ ] 20+ indicators defined
- [ ] Indicator publish workflow operational
- [ ] Entity mapping working for countries, HS codes

**Trade Intelligence:**
- [ ] AGOA eligibility displayed for 49 countries
- [ ] AfCFTA status displayed for 54 countries
- [ ] HS code reference data loaded (5,000+ codes)
- [ ] Supply-demand matrix viewable
- [ ] Data freshness badges visible

**Admin Tools:**
- [ ] Data quality dashboard operational
- [ ] Audit log capturing all admin actions
- [ ] Admin UI accessible and functional

---

## Dependencies

### Technical Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| Phase 4A completion | Engineering | ✅ Complete |
| Supabase infrastructure | Engineering | ✅ Existing |
| Admin authentication | Engineering | ✅ Existing |
| Edge Functions | Engineering | ✅ Existing |

### External Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| U.S. Census API key | Data Admin | ⏳ Pending |
| UN Comtrade API key | Data Admin | ⏳ Pending |
| USTR eligibility data (manual) | Data Admin | ⏳ Pending |
| tralac AfCFTA data (manual) | Data Admin | ⏳ Pending |
| USITC HTS reference data | Data Admin | ⏳ Pending |

---

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API access delays | Medium | Medium | Start key registration early |
| Rate limiting constraints | Medium | Medium | Implement caching, batch processing |
| Data quality issues | Medium | High | Validation rules, admin review |
| Scope creep | High | Medium | Strict MVP definition |
| Connector complexity | Medium | Medium | Start with simpler APIs first |

---

## Next Steps

### Immediate Actions

1. [ ] **Obtain API keys** (Census, Comtrade)
2. [ ] **Download reference data** (USITC HTS, country crosswalks)
3. [ ] **Create admin database schema** (Sprint 1 foundation)
4. [ ] **Build file upload connector** (quick win for manual data)
5. [ ] **Load AGOA/AfCFTA manual data** (trade intel value)

### Phase 4C Preview

After Phase 4B:
- Product-level intelligence (HS code detail pages)
- Product opportunity scoring
- Trade report builder
- Advanced supply-demand matching
- Tariff/NTB analysis

---

**Document Version:** 1.0  
**Classification:** Internal — Engineering Planning  
**Last Updated:** 2026-05-06  
**Owner:** Afronovation Engineering Team
