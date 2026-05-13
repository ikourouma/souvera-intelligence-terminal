# Phase 4B Backlog
## Data Source Infrastructure + Trade Intelligence Foundation

**Document Type:** Product Backlog  
**Classification:** Internal — Planning  
**Date:** 2026-05-06  
**Version:** 2.0  
**Owner:** Afronovation Product Team  
**Status:** Approved for Planning

---

## Executive Summary

This backlog defines Phase 4B scope, focusing on:

1. **Data Source Infrastructure** — Source Registry, Indicator Builder, ingestion framework
2. **API Validation** — Confirm access to Census, Comtrade, and other trade data APIs
3. **Trade Policy Tracking** — AGOA eligibility/status, AfCFTA implementation
4. **Trade Data Foundation** — U.S. import demand, African export capacity (API-dependent)

### Critical Dependency

> ⚠️ **API validation must occur before Sprint 1 begins.**
>
> Several backlog items depend on confirmed API access. The pre-engineering validation checklist must be completed to de-risk Sprint 3+ items.

### Phase 4B / 4C Split

**Phase 4B (Confirmed):**
- Source Registry + Indicator Builder infrastructure
- Manual file upload and curation
- AGOA eligibility/status tracker (manual data)
- AfCFTA implementation tracker (manual data)
- API connectors for validated sources

**Phase 4C (Deferred until infrastructure stable):**
- Product-level HS code intelligence
- Supply-demand opportunity scoring
- Trade report builder
- Tariff preference analysis

---

## Pre-Engineering Validation Checklist

### API Access Validation (Week 0)

| Task | Owner | Status |
|------|-------|--------|
| Register U.S. Census API key | Data Admin | ⏳ Pending |
| Register UN Comtrade API key | Data Admin | ⏳ Pending |
| Register Regulations.gov API key | Data Admin | ⏳ Pending |
| Test Census API with sample query | Engineering | ⏳ Pending |
| Test Comtrade API with sample query | Engineering | ⏳ Pending |
| Verify Regulations.gov docket USTR-2026-0166 | Data Admin | ⏳ Pending |
| Test USITC DataWeb API (if available) | Engineering | ⏳ Pending |
| Download USITC HTS reference data | Data Admin | ⏳ Pending |
| Build Census country code crosswalk | Engineering | ⏳ Pending |
| Build Comtrade country code crosswalk | Engineering | ⏳ Pending |

### Validation Outcomes

After validation, update this section:

| Source | API Confirmed | Rate Limit | Notes |
|--------|---------------|-----------|-------|
| U.S. Census Trade | TBD | TBD | |
| UN Comtrade | TBD | TBD | |
| Regulations.gov | TBD | TBD | |
| USITC DataWeb | TBD | TBD | |
| World Bank WITS | TBD | TBD | |

---

## Priority Legend

| Priority | Label | Description |
|----------|-------|-------------|
| P0 | Critical | Must have for Phase 4B |
| P1 | High | Important for Phase 4B value |
| P2 | Medium | Valuable but can defer |
| P3 | Low | Defer to Phase 4C+ |

## Effort Legend

| Effort | Points | Duration |
|--------|--------|----------|
| XS | 1 | <1 day |
| S | 2 | 1-2 days |
| M | 5 | 3-5 days |
| L | 8 | 1-2 weeks |
| XL | 13 | 2-3 weeks |

---

## Category 1: Pre-Engineering Validation

### BACKLOG-V01: API/Source Feasibility Validation
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 0 (Pre-Sprint)

**Description:**  
Validate API access for all P0 and P1 data sources before engineering begins.

**Acceptance Criteria:**
- [ ] U.S. Census Trade API key obtained and tested
- [ ] UN Comtrade API key obtained and tested
- [ ] Regulations.gov API key obtained and tested
- [ ] USITC DataWeb API access verified (or confirmed unavailable)
- [ ] World Bank WITS API endpoints tested
- [ ] Rate limits documented for each validated API
- [ ] Country code crosswalks built (Census, Comtrade)
- [ ] Validation report created

**Deliverable:** API Validation Report documenting confirmed access, rate limits, and any blockers

---

### BACKLOG-V02: Data Licensing Review
**Priority:** P0 | **Effort:** S (2 pts) | **Sprint:** 0 (Pre-Sprint)

**Description:**  
Review licensing terms for all data sources to ensure commercial use is permitted.

**Acceptance Criteria:**
- [ ] U.S. government sources confirmed public domain
- [ ] UN Comtrade license terms documented
- [ ] World Bank license terms documented
- [ ] tralac usage terms confirmed
- [ ] Africa Trade Observatory terms investigated
- [ ] Attribution requirements documented

**Deliverable:** Data Licensing Summary document

---

## Category 2: Source Registry Infrastructure

### BACKLOG-001: Source Registry Core
**Priority:** P0 | **Effort:** L (8 pts) | **Sprint:** 1

**Description:**  
Enable admins to register and configure data sources.

**User Story:**  
As a Data Admin, I want to register data sources so that I can manage where Souvera gets its data.

**Acceptance Criteria:**
- [ ] `admin_source_registry` table with all required fields
- [ ] Source types: `api`, `file`, `manual`
- [ ] Admin API: create, read, update, archive
- [ ] Source status: draft, testing, active, archived
- [ ] API credentials stored securely (encrypted reference)
- [ ] RLS for admin-only access
- [ ] Changes logged to audit trail

---

### BACKLOG-002: Source Registry Admin UI
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 1

**Description:**  
Admin interface for source management.

**Acceptance Criteria:**
- [ ] List view of all sources with status
- [ ] Create new source form
- [ ] Edit source configuration
- [ ] Archive source action
- [ ] View source details and health
- [ ] Filter/search sources

---

### BACKLOG-003: Source Health Monitoring
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 2

**Description:**  
Monitor health of API sources.

**Acceptance Criteria:**
- [ ] Health check for API sources
- [ ] Status: healthy, degraded, unhealthy
- [ ] Response time tracking
- [ ] Error message capture
- [ ] Health history (90 days)
- [ ] Admin dashboard summary

---

### BACKLOG-004: Manual Ingestion Trigger
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 2

**Description:**  
Admin can manually trigger data ingestion.

**Acceptance Criteria:**
- [ ] "Trigger Ingestion" button on source detail
- [ ] Job status: queued, running, completed, failed
- [ ] Row counts: fetched, valid, invalid, inserted, updated
- [ ] Error details viewable
- [ ] Job history retained

---

### BACKLOG-005: Scheduled Ingestion
**Priority:** P1 | **Effort:** L (8 pts) | **Sprint:** 3

**Description:**  
Automatic scheduled ingestion for API sources.

**Acceptance Criteria:**
- [ ] Schedule configuration (cron or presets)
- [ ] Presets: hourly, daily, weekly, monthly
- [ ] Scheduler service runs on interval
- [ ] Failed job alerts
- [ ] Enable/disable schedule
- [ ] Execution history

**Dependency:** BACKLOG-004

---

### BACKLOG-006: Data Freshness Badges
**Priority:** P0 | **Effort:** S (2 pts) | **Sprint:** 2

**Description:**  
Display data freshness in UI.

**Acceptance Criteria:**
- [ ] Freshness badge: fresh (<7 days), recent (<30 days), stale (>30 days)
- [ ] Badge on indicator values
- [ ] Tooltip with exact date and source
- [ ] Configurable thresholds per indicator
- [ ] Visible on country panel and sector data

---

### BACKLOG-007: Source Confidence Scoring
**Priority:** P1 | **Effort:** S (2 pts) | **Sprint:** 3

**Description:**  
Assign confidence levels to data sources.

**Acceptance Criteria:**
- [ ] Confidence levels: high, medium, low
- [ ] Configurable per source
- [ ] Displayed with data attribution
- [ ] Methodology notes field

---

## Category 3: Indicator Builder

### BACKLOG-010: Indicator Builder Core
**Priority:** P0 | **Effort:** L (8 pts) | **Sprint:** 3

**Description:**  
Define and configure metrics mapped to sources.

**Acceptance Criteria:**
- [ ] `admin_indicator_definitions` table
- [ ] Indicator key, label, description
- [ ] Source mapping (source_id, endpoint, field path)
- [ ] Entity mapping (country, sector, product)
- [ ] Data type and display format
- [ ] Access control (visibility tier)
- [ ] Publish status (draft, review, published, deprecated)

---

### BACKLOG-011: Indicator Builder Admin UI
**Priority:** P0 | **Effort:** L (8 pts) | **Sprint:** 4

**Description:**  
Admin interface for indicator management.

**Acceptance Criteria:**
- [ ] List view of indicators
- [ ] Create indicator wizard
- [ ] Source mapping configuration
- [ ] Entity mapping configuration
- [ ] Preview indicator data
- [ ] Edit and deprecate actions

---

### BACKLOG-012: Admin Validation and Publish Workflow
**Priority:** P1 | **Effort:** M (5 pts) | **Sprint:** 4

**Description:**  
Review and publish workflow for indicators.

**Acceptance Criteria:**
- [ ] Draft status for new indicators
- [ ] Submit for review action
- [ ] Approve/reject with comments
- [ ] Published indicators visible to users
- [ ] Deprecate action
- [ ] Audit logging

---

### BACKLOG-013: Entity Mapping Tables
**Priority:** P0 | **Effort:** S (2 pts) | **Sprint:** 2

**Description:**  
Crosswalk tables for country/sector/product mapping.

**Acceptance Criteria:**
- [ ] `entity_key_country_map` table
- [ ] Census code → ISO3 mapping
- [ ] Comtrade code → ISO3 mapping
- [ ] Name variations → ISO3 mapping
- [ ] Admin UI to manage mappings
- [ ] Unmapped key logging

---

## Category 4: File Upload and Manual Curation

### BACKLOG-020: Manual Data Upload (CSV/Excel)
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 1

**Description:**  
File upload for manual data ingestion.

**Acceptance Criteria:**
- [ ] File upload UI (drag-drop or browse)
- [ ] CSV parsing with header detection
- [ ] Excel parsing (first sheet or selectable)
- [ ] Column mapping to indicator fields
- [ ] Data preview before import
- [ ] Validation errors displayed
- [ ] File size limit (10MB)

---

### BACKLOG-021: Manual Data Upload Fallback
**Priority:** P1 | **Effort:** S (2 pts) | **Sprint:** 2

**Description:**  
Fallback data entry when APIs are unavailable.

**Acceptance Criteria:**
- [ ] Manual form entry for indicators
- [ ] Supports same validation as file upload
- [ ] Audit logging for manual entries
- [ ] "Manual entry" source attribution

---

## Category 5: API Connectors

### BACKLOG-030: U.S. Census Trade Connector
**Priority:** P0 | **Effort:** L (8 pts) | **Sprint:** 3

**Description:**  
Connector for U.S. Census International Trade API.

**Dependency:** BACKLOG-V01 (API validation)

**Acceptance Criteria:**
- [ ] API authentication (key)
- [ ] Fetch imports by country, HTS, time
- [ ] Response parsing and normalization
- [ ] Census country code → ISO3 mapping
- [ ] HTS code level handling (2, 4, 6, 10)
- [ ] Rate limit handling
- [ ] Error handling and retry
- [ ] Monthly data support

---

### BACKLOG-031: UN Comtrade Connector
**Priority:** P0 | **Effort:** L (8 pts) | **Sprint:** 3

**Description:**  
Connector for UN Comtrade API.

**Dependency:** BACKLOG-V01 (API validation)

**Acceptance Criteria:**
- [ ] API authentication (subscription key)
- [ ] Fetch trade data by reporter, partner, HS, year
- [ ] Response parsing and normalization
- [ ] Comtrade country code → ISO3 mapping
- [ ] HS code validation
- [ ] Rate limit handling (100/hour free tier)
- [ ] Error handling and retry

---

### BACKLOG-032: World Bank WITS Connector
**Priority:** P2 | **Effort:** M (5 pts) | **Sprint:** 4+

**Description:**  
Connector for World Bank WITS API (conditional on validation).

**Dependency:** BACKLOG-V01 (must verify API access first)

**Acceptance Criteria:**
- [ ] API endpoint configuration
- [ ] Fetch tariff rates by reporter, product
- [ ] Response parsing
- [ ] Country/HS mapping
- [ ] Error handling

**Note:** Defer if WITS API validation fails

---

### BACKLOG-033: Federal Register Connector
**Priority:** P2 | **Effort:** S (2 pts) | **Sprint:** 4+

**Description:**  
Monitor Federal Register for AGOA notices.

**Acceptance Criteria:**
- [ ] API query for AGOA-related documents
- [ ] New document detection
- [ ] Admin notification
- [ ] Link to source document

---

## Category 6: Trade Policy Tracking

### BACKLOG-040: AGOA Eligibility/Status Tracker
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 2

**Description:**  
Track AGOA eligibility and status for sub-Saharan African countries.

**Important:** Do not hardcode country counts. AGOA eligibility changes.

**Acceptance Criteria:**
- [ ] `agoa_eligibility` table
- [ ] Status: eligible, suspended, graduated, ineligible
- [ ] Apparel eligibility (Third Country Fabric)
- [ ] Effective dates
- [ ] Display on country intelligence panel
- [ ] Manual data entry/update via admin
- [ ] Eligibility history (5+ years)
- [ ] Source attribution (USTR/Federal Register)

**Data Source:** USTR (manual curation)

**Language Note:**
- Use "AGOA eligibility status" not "49 eligible countries"
- Eligibility must be verified from most recent Presidential determination
- [Citation needed] for any specific eligibility counts

---

### BACKLOG-041: AfCFTA Implementation Tracker
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 2

**Description:**  
Track AfCFTA implementation for African countries.

**Acceptance Criteria:**
- [ ] `afcfta_status` table
- [ ] Signed date
- [ ] Ratified date
- [ ] Deposit date
- [ ] Trading started date
- [ ] Tariff schedule submission status
- [ ] Services offer submission status
- [ ] Display on country intelligence panel
- [ ] Manual data entry/update via admin
- [ ] Source attribution (AfCFTA Secretariat, tralac)

**Data Source:** AfCFTA Secretariat, tralac (manual curation)

---

### BACKLOG-042: Country Trade Profile Enhancement
**Priority:** P1 | **Effort:** M (5 pts) | **Sprint:** 4

**Description:**  
Add trade policy data to country intelligence panel.

**Acceptance Criteria:**
- [ ] AGOA eligibility badge on country panel
- [ ] AfCFTA status badge on country panel
- [ ] Trade snapshot (if data available)
- [ ] Professional+ entitlement for trade policy

**Dependencies:** BACKLOG-040, BACKLOG-041

---

## Category 7: Trade Data (API-Dependent)

### BACKLOG-050: U.S. Import Demand by HS Code
**Priority:** P1 | **Effort:** L (8 pts) | **Sprint:** 4-5

**Description:**  
Ingest U.S. import demand data by HS code and country.

**Dependency:** BACKLOG-030 (Census connector)

**Acceptance Criteria:**
- [ ] `us_product_demand` table
- [ ] Import value by 6-digit HS code
- [ ] Import source countries (top suppliers)
- [ ] Growth rate calculation
- [ ] Concentration index calculation
- [ ] Scheduled ingestion from Census API
- [ ] Viewable on product pages (Phase 4C)

---

### BACKLOG-051: African Export Supply by HS Code
**Priority:** P1 | **Effort:** L (8 pts) | **Sprint:** 4-5

**Description:**  
Ingest African export capacity by HS code and country.

**Dependency:** BACKLOG-031 (Comtrade connector)

**Acceptance Criteria:**
- [ ] `country_product_supply` table
- [ ] Export value by 6-digit HS code
- [ ] Export volume/quantity
- [ ] Scheduled ingestion from Comtrade
- [ ] Coverage for 54 African countries
- [ ] Viewable on product pages (Phase 4C)

---

### BACKLOG-052: Supply-Demand Matrix MVP
**Priority:** P2 | **Effort:** L (8 pts) | **Sprint:** 5+

**Description:**  
Basic supply-demand matrix view.

**Dependencies:** BACKLOG-050, BACKLOG-051

**Acceptance Criteria:**
- [ ] Matrix view: countries × sectors (or products)
- [ ] Cell shows existing sector scores
- [ ] Color-coded by opportunity level
- [ ] Filter by AGOA eligibility
- [ ] Filter by region
- [ ] Export to Excel

**Note:** Complexity depends on trade data volume and API stability

---

### BACKLOG-053: Product Opportunity Card MVP
**Priority:** P2 | **Effort:** M (5 pts) | **Sprint:** 5+

**Description:**  
Display product opportunity summary cards.

**Dependencies:** BACKLOG-050, BACKLOG-051

**Acceptance Criteria:**
- [ ] Card shows: country, product, opportunity score
- [ ] U.S. import demand indicators
- [ ] African export capacity indicators
- [ ] Key factors summary
- [ ] Link to detail view

**Note:** Defer to Phase 4C if trade data integration incomplete

---

## Category 8: Reference Data

### BACKLOG-060: HS Code Reference Data Load
**Priority:** P0 | **Effort:** M (5 pts) | **Sprint:** 2

**Description:**  
Load HS code reference data.

**Acceptance Criteria:**
- [ ] `product_hs_codes` table
- [ ] Load 6-digit HS codes (5,000+ subheadings)
- [ ] Code hierarchy (chapter, heading, subheading)
- [ ] Product descriptions
- [ ] AGOA eligibility flag (from USITC HTS)
- [ ] GSP eligibility flag
- [ ] Sector category mapping

**Data Source:** USITC HTS (file download)

---

### BACKLOG-061: Country Code Crosswalk
**Priority:** P0 | **Effort:** S (2 pts) | **Sprint:** 1

**Description:**  
Comprehensive country code mapping.

**Acceptance Criteria:**
- [ ] ISO3 ↔ ISO2 mapping
- [ ] ISO3 ↔ Census codes mapping
- [ ] ISO3 ↔ Comtrade codes mapping
- [ ] ISO3 ↔ country names mapping
- [ ] All 74 Souvera markets included
- [ ] Global coverage (200+ countries)

---

## Category 9: Admin Tools

### BACKLOG-070: Admin Data Quality Dashboard
**Priority:** P1 | **Effort:** M (5 pts) | **Sprint:** 4

**Description:**  
Dashboard for data quality monitoring.

**Acceptance Criteria:**
- [ ] Indicator coverage by country
- [ ] Data freshness summary
- [ ] Recent ingestion activity
- [ ] Validation error summary
- [ ] Missing data report
- [ ] Filter by source, indicator, region

---

### BACKLOG-071: Audit Log Viewer
**Priority:** P1 | **Effort:** S (2 pts) | **Sprint:** 3

**Description:**  
Admin interface for audit logs.

**Acceptance Criteria:**
- [ ] List of audit events
- [ ] Filter by event type, user, entity, date
- [ ] Event detail view
- [ ] Export to CSV
- [ ] 90-day history

---

### BACKLOG-072: Audit Log Schema
**Priority:** P0 | **Effort:** S (2 pts) | **Sprint:** 1

**Description:**  
Audit logging infrastructure.

**Acceptance Criteria:**
- [ ] `admin_audit_log` table
- [ ] Event type, timestamp, user, entity, changes
- [ ] Automatic logging for source/indicator CRUD
- [ ] Automatic logging for ingestion triggers
- [ ] Automatic logging for publish actions

---

## Backlog Summary

### Phase 4B Core (P0)

| Category | Items | Points |
|----------|-------|--------|
| Validation | V01, V02 | 7 |
| Source Registry | 001, 002, 003, 004, 006 | 25 |
| Indicator Builder | 010, 013 | 10 |
| File Upload | 020 | 5 |
| Connectors | 030, 031 | 16 |
| Trade Policy | 040, 041 | 10 |
| Reference | 060, 061 | 7 |
| Admin | 072 | 2 |
| **P0 Total** | | **82 pts** |

### Phase 4B Extended (P1)

| Category | Items | Points |
|----------|-------|--------|
| Source Registry | 005, 007 | 10 |
| Indicator Builder | 011, 012 | 13 |
| File Upload | 021 | 2 |
| Trade Policy | 042 | 5 |
| Trade Data | 050, 051 | 16 |
| Admin | 070, 071 | 7 |
| **P1 Total** | | **53 pts** |

### Conditional / Deferred (P2+)

| Category | Items | Points | Condition |
|----------|-------|--------|-----------|
| Connectors | 032, 033 | 7 | WITS API verified |
| Trade Data | 052, 053 | 13 | Trade data stable |
| **P2 Total** | | **20 pts** | |

### Total Phase 4B

| Priority | Points |
|----------|--------|
| P0 | 82 |
| P1 | 53 |
| P2 (conditional) | 20 |
| **Total** | **155 pts** |

---

## Sprint Plan

### Sprint 0: Pre-Engineering Validation (1 week)

| ID | Item | Points |
|----|------|--------|
| V01 | API/Source Feasibility Validation | 5 |
| V02 | Data Licensing Review | 2 |
| **Sprint 0** | | **7** |

**Goal:** Confirm API access; document rate limits; identify blockers

---

### Sprint 1: Foundation (2 weeks)

| ID | Item | Points |
|----|------|--------|
| 001 | Source Registry Core | 8 |
| 002 | Source Registry Admin UI | 5 |
| 020 | Manual Data Upload (CSV/Excel) | 5 |
| 061 | Country Code Crosswalk | 2 |
| 072 | Audit Log Schema | 2 |
| **Sprint 1** | | **22** |

**Goal:** Admin can register sources and upload files

---

### Sprint 2: Manual Trade Policy Data (2 weeks)

| ID | Item | Points |
|----|------|--------|
| 003 | Source Health Monitoring | 5 |
| 004 | Manual Ingestion Trigger | 5 |
| 006 | Data Freshness Badges | 2 |
| 013 | Entity Mapping Tables | 2 |
| 040 | AGOA Eligibility/Status Tracker | 5 |
| 041 | AfCFTA Implementation Tracker | 5 |
| 060 | HS Code Reference Data Load | 5 |
| **Sprint 2** | | **29** |

**Goal:** Trade policy trackers live with manual data

---

### Sprint 3: API Connectors (2 weeks)

| ID | Item | Points |
|----|------|--------|
| 010 | Indicator Builder Core | 8 |
| 030 | U.S. Census Trade Connector | 8 |
| 031 | UN Comtrade Connector | 8 |
| 071 | Audit Log Viewer | 2 |
| 007 | Source Confidence Scoring | 2 |
| **Sprint 3** | | **28** |

**Goal:** Trade data APIs connected and ingesting

---

### Sprint 4: Indicator Builder + Trade Profile (2 weeks)

| ID | Item | Points |
|----|------|--------|
| 011 | Indicator Builder Admin UI | 8 |
| 012 | Admin Validation and Publish Workflow | 5 |
| 005 | Scheduled Ingestion | 8 |
| 042 | Country Trade Profile Enhancement | 5 |
| 070 | Admin Data Quality Dashboard | 5 |
| **Sprint 4** | | **31** |

**Goal:** Indicator management complete; trade policy on country panel

---

### Sprint 5+: Trade Data Integration (2+ weeks)

| ID | Item | Points |
|----|------|--------|
| 050 | U.S. Import Demand by HS Code | 8 |
| 051 | African Export Supply by HS Code | 8 |
| 021 | Manual Data Upload Fallback | 2 |
| **Sprint 5** | | **18** |

**Goal:** Trade data flowing from APIs

---

### Phase 4C Candidates

| ID | Item | Points | Notes |
|----|------|--------|-------|
| 052 | Supply-Demand Matrix MVP | 8 | Requires stable trade data |
| 053 | Product Opportunity Card MVP | 5 | Requires stable trade data |
| 032 | World Bank WITS Connector | 5 | If API verified |
| 033 | Federal Register Connector | 2 | If needed |

---

## Success Criteria

### Phase 4B Completion

**Infrastructure:**
- [ ] Source Registry supports 5+ sources
- [ ] Indicator Builder supports 20+ indicators
- [ ] Manual file upload operational
- [ ] Scheduled ingestion running (if APIs stable)

**Trade Policy:**
- [ ] AGOA eligibility displayed for sub-Saharan African countries
- [ ] AfCFTA status displayed for 54 African countries
- [ ] Trade policy badges on country panel

**Trade Data:**
- [ ] U.S. Census API integration operational (if validated)
- [ ] UN Comtrade API integration operational (if validated)
- [ ] HS code reference data loaded

**Quality:**
- [ ] Data freshness badges visible
- [ ] Audit log capturing admin actions
- [ ] Data quality dashboard operational

---

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API validation fails | High | Medium | Manual fallback; defer to 4C |
| Rate limits block usage | Medium | Low | Caching; batch processing |
| Country code mapping errors | Medium | Medium | Validation; crosswalk review |
| AGOA/AfCFTA data stale | Medium | Medium | Clear freshness indicators |
| Scope creep | High | Medium | Strict MVP; defer to 4C |

---

## Language and Accuracy Guidelines

**Do:**
- Use "AGOA eligibility status" or "AGOA candidate countries"
- Use "sub-Saharan African countries in AGOA framework"
- Add [Citation needed] for unverified claims
- Show data freshness with all indicators
- Use "curated preview data" not "live data"

**Do Not:**
- State "49 countries are AGOA eligible" without verification
- Claim "real-time" data unless source truly supports it
- Hardcode eligibility counts
- Make unsupported market-size claims

---

**Document Version:** 2.0  
**Classification:** Internal — Planning  
**Last Updated:** 2026-05-06  
**Owner:** Afronovation Product Team
