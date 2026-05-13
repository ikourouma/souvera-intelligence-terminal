# AGOA + AfCFTA Data Source Inventory
## API, Portal, and Repository Assessment for Souvera Trade Intelligence

**Document Type:** Research / Technical Assessment  
**Classification:** Internal — Engineering Planning  
**Date:** 2026-05-06  
**Version:** 2.1  
**Owner:** Afronovation Engineering Team  
**Status:** Verified for Phase 4B Implementation

---

## 1. Executive Summary

This document provides a rigorous assessment of data sources for AGOA + AfCFTA trade intelligence. Each source is evaluated for API availability, authentication requirements, data coverage, licensing, and integration feasibility.

### Verification Status (v2.1)

| Source | Status | Notes |
|--------|--------|-------|
| U.S. Census Trade API | ✅ **Verified — Phase 4B** | Confirmed API, free tier with key |
| UN Comtrade API | ✅ **Verified — Phase 4B Validation** | Connector for validation, not product scoring |
| Regulations.gov (USTR-2026-0166) | ✅ **Verified** | Docket confirmed accessible |
| USITC DataWeb API | ✅ **Verified** | Credentialed/account-token based access |
| World Bank WDI API | ✅ **Verified — Phase 4B** | Scheduled ingestion source |
| USITC HTS Reference | ✅ **Verified** | Downloadable reference data only |
| tralac AfCFTA Tracker | ✅ **Verified** | Trusted secondary manual-curation source |
| USTR AGOA Eligibility | ⚠️ Manual | No API; manual curation required |
| AfCFTA Secretariat | ⚠️ Manual | No API; manual curation required |

### Critical Language Discipline

> ⚠️ **Do not assert AGOA-eligible country counts without verification.**
>
> AGOA eligibility changes annually. Use:
> - "Sub-Saharan African countries in AGOA framework"
> - "AGOA candidate countries"
> - "Countries with current AGOA eligibility status"
>
> **Always include verification date when citing eligibility status.**

### Phase 4B Scope

**In Scope:**
- Source Registry MVP
- Indicator Builder MVP
- Manual CSV/Excel/JSON upload
- Scheduled World Bank WDI ingestion
- Data freshness badges
- AGOA eligibility/status tracker (manual data)
- AfCFTA implementation tracker (manual data)
- Basic supply-demand matrix (74 markets × 7 sectors)
- Census and Comtrade API validation wrappers

**Out of Scope (Phase 4C):**
- Full HS-code product intelligence
- Product opportunity scoring
- Tariff preference calculators
- UN Comtrade product-flow analytics
- U.S. Census/USITC production product intelligence
- Trade report builder

---

## 2. Source Confidence Model

### Confidence Levels

| Level | Code | Description | Criteria |
|-------|------|-------------|----------|
| **High** | `high` | Authoritative official source | Government/IO primary data; verified methodology |
| **Medium** | `medium` | Trusted secondary source | Reputable research institution; established methodology |
| **Low** | `low` | Supplementary/unverified | Third-party compilation; methodology unclear |
| **Curated** | `curated` | Admin-curated preview | Manual entry; subject to review |

### Source Confidence Assignments

| Source | Confidence | Rationale |
|--------|------------|-----------|
| U.S. Census Trade API | High | Official U.S. government trade statistics |
| USTR AGOA Eligibility | High | Authoritative eligibility determinations |
| World Bank WDI | High | Established international organization |
| UN Comtrade | High | Official UN trade statistics |
| USITC DataWeb | High | Official U.S. government tariff/trade data |
| Federal Register | High | Official U.S. publication of record |
| Regulations.gov | High | Official U.S. rulemaking system |
| AfCFTA Secretariat | High | Official AU/AfCFTA source |
| tralac AfCFTA Tracker | Medium | Trusted research institution |
| Africa Trade Observatory | Medium | AU/Afreximbank joint initiative |

---

## 3. Source Attribution Model

### Attribution Requirements

All displayed data must include:

```typescript
interface SourceAttribution {
  // Source identity
  source_key: string;           // e.g., "world_bank_wdi"
  source_name: string;          // e.g., "World Bank"
  source_type: SourceType;      // api | file | manual
  
  // Data provenance
  indicator_key: string;        // e.g., "gdp_current_usd"
  as_of_date: Date;             // Data reference date
  last_reviewed_at: Date;       // Last admin review
  
  // Quality signals
  confidence_level: ConfidenceLevel;
  freshness_status: FreshnessStatus;
  
  // Entitlement
  min_plan_id: string;          // Required plan for full access
}

type SourceType = 'api' | 'file' | 'manual';
type ConfidenceLevel = 'high' | 'medium' | 'low' | 'curated';
type FreshnessStatus = 'fresh' | 'recent' | 'stale' | 'expired';
```

### UI Display Labels

| Source Type | Display Label |
|-------------|---------------|
| `api` | "Source-Attributed Preview" |
| `file` | "Curated Preview Data" |
| `manual` | "Curated Preview Data" |

---

## 4. Data Freshness Model

### Freshness Thresholds

| Status | Code | Threshold | UI Indicator |
|--------|------|-----------|--------------|
| **Fresh** | `fresh` | ≤7 days since last_reviewed_at | 🟢 Green badge |
| **Recent** | `recent` | ≤30 days | 🟡 Yellow badge |
| **Stale** | `stale` | ≤90 days | 🟠 Orange badge |
| **Expired** | `expired` | >90 days | 🔴 Red badge |

### Freshness Calculation

```sql
-- Freshness status based on last_reviewed_at
CASE
  WHEN last_reviewed_at >= NOW() - INTERVAL '7 days' THEN 'fresh'
  WHEN last_reviewed_at >= NOW() - INTERVAL '30 days' THEN 'recent'
  WHEN last_reviewed_at >= NOW() - INTERVAL '90 days' THEN 'stale'
  ELSE 'expired'
END AS freshness_status
```

### Missing Data Display

| Condition | Display |
|-----------|---------|
| No data available | "Data pending" |
| Data expired | "Last reviewed: [date]" with expired badge |
| Source unavailable | "Source temporarily unavailable" |

---

## 5. Ingestion Run Ledger

### Requirements

Every data ingestion must create an ingestion run record:

```typescript
interface IngestionRun {
  id: string;
  source_id: string;
  
  // Run metadata
  run_type: 'scheduled' | 'manual' | 'upload';
  triggered_by: string | null;     // user_id for manual
  
  // Timing
  started_at: Date;
  completed_at: Date | null;
  
  // Status
  status: 'running' | 'completed' | 'failed' | 'partial';
  
  // Metrics
  rows_fetched: number;
  rows_valid: number;
  rows_invalid: number;
  rows_inserted: number;
  rows_updated: number;
  rows_rejected: number;
  
  // Errors
  error_message: string | null;
  error_details: object | null;
  
  // Validation
  validation_findings: ValidationFinding[];
}

interface ValidationFinding {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  row_number: number | null;
  field_name: string | null;
  value: any;
}
```

### Validation Rules

| Rule | Severity | Description |
|------|----------|-------------|
| `INVALID_ISO3` | error | ISO3 not in Souvera 74-market scope |
| `EXCLUDED_MARKET` | error | ESH/Western Sahara rejected |
| `MISSING_SOURCE_META` | error | Source metadata required |
| `MISSING_AS_OF_DATE` | error | as_of_date required |
| `INVALID_NUMERIC` | error | Non-numeric value for numeric field |
| `VALUE_OUT_OF_RANGE` | warning | Value outside expected range |
| `DUPLICATE_ENTRY` | warning | Duplicate country/indicator/period |

---

## 6. Country Code Crosswalk

### Anchored to Souvera 74-Market Scope

The crosswalk validates all mappings against Souvera's public market scope:
- **54 African countries** (ESH/Western Sahara excluded)
- **20 Caribbean markets**
- **Total: 74 markets**

### Crosswalk Structure

```typescript
interface CountryCodeCrosswalk {
  // Souvera canonical
  souvera_country_id: string;     // UUID FK to souvera_countries
  iso3: string;                   // Souvera canonical ISO3
  
  // External code systems
  census_code: string | null;     // U.S. Census country code
  comtrade_code: string | null;   // UN Comtrade M49 code
  wdi_code: string | null;        // World Bank WDI code
  
  // Name variations
  name_variations: string[];      // Alternative spellings
  
  // Validation
  is_souvera_market: boolean;     // True if in 74-market scope
  is_excluded: boolean;           // True for ESH
  exclusion_reason: string | null;
}
```

### Crosswalk Sample (African Markets)

| ISO3 | Census | Comtrade | WDI | Country |
|------|--------|----------|-----|---------|
| NGA | 7560 | 566 | NGA | Nigeria |
| ZAF | 7910 | 710 | ZAF | South Africa |
| KEN | 7600 | 404 | KEN | Kenya |
| GHA | 7360 | 288 | GHA | Ghana |
| EGY | 7850 | 818 | EGY | Egypt |
| CIV | 7490 | 384 | CIV | Côte d'Ivoire |
| TZA | 7780 | 834 | TZA | Tanzania |
| ETH | 7340 | 231 | ETH | Ethiopia |
| MAR | 7140 | 504 | MAR | Morocco |
| UGA | 7820 | 800 | UGA | Uganda |
| RWA | 7820 | 646 | RWA | Rwanda |
| SEN | 7460 | 686 | SEN | Senegal |
| CMR | 7620 | 120 | CMR | Cameroon |

### Crosswalk Sample (Caribbean Markets)

| ISO3 | Census | Comtrade | WDI | Country |
|------|--------|----------|-----|---------|
| JAM | 2110 | 388 | JAM | Jamaica |
| TTO | 2740 | 780 | TTO | Trinidad and Tobago |
| BRB | 2330 | 052 | BRB | Barbados |
| DOM | 2070 | 214 | DOM | Dominican Republic |
| BHS | 2360 | 044 | BHS | Bahamas |
| GRD | 2410 | 308 | GRD | Grenada |
| LCA | 2480 | 662 | LCA | Saint Lucia |

### Excluded Markets

| ISO3 | Reason | Status |
|------|--------|--------|
| ESH | Western Sahara excluded from public Souvera scope | `is_excluded = true` |

---

## 7. P0 Source Details (Phase 4B)

### 7.1 U.S. Census International Trade API

| Field | Value |
|-------|-------|
| **Status** | ✅ **Verified — Phase 4B API Source** |
| **Source Key** | `us_census_trade` |
| **Confidence** | High |
| **API URL** | https://api.census.gov/data/timeseries/intltrade |
| **Authentication** | API Key (free registration) |
| **Rate Limit** | 500/day without key; higher with key |
| **Geographic Coverage** | U.S. trade with all partners |
| **HS Coverage** | 10-digit HTS |
| **Update Frequency** | Monthly (~45-day lag) |
| **Phase 4B Use** | U.S. import demand validation; supply-demand signals |

### 7.2 UN Comtrade API

| Field | Value |
|-------|-------|
| **Status** | ✅ **Verified — Phase 4B Validation Connector** |
| **Source Key** | `un_comtrade` |
| **Confidence** | High |
| **API URL** | https://comtradeapi.un.org/ |
| **Authentication** | Subscription Key (free tier) |
| **Rate Limit** | 100/hour (free tier) |
| **Geographic Coverage** | 200+ countries |
| **HS Coverage** | 6-digit HS |
| **Update Frequency** | Annual (complete); Monthly (selected) |
| **Phase 4B Use** | Validation connector; African export capacity signals |

**Phase 4B Limitation:** Do not build product opportunity scoring or full product-flow analytics.

### 7.3 World Bank WDI API

| Field | Value |
|-------|-------|
| **Status** | ✅ **Verified — Phase 4B Scheduled Ingestion** |
| **Source Key** | `world_bank_wdi` |
| **Confidence** | High |
| **API URL** | https://api.worldbank.org/v2 |
| **Authentication** | None required |
| **Rate Limit** | Reasonable use |
| **Geographic Coverage** | 200+ countries |
| **Update Frequency** | Annual |
| **Phase 4B Use** | Scheduled macro indicator ingestion |

### 7.4 Regulations.gov (USTR-2026-0166)

| Field | Value |
|-------|-------|
| **Status** | ✅ **Verified** |
| **Source Key** | `regulations_gov` |
| **Confidence** | High |
| **API URL** | https://api.regulations.gov |
| **Docket ID** | USTR-2026-0166 |
| **Authentication** | API Key (free) |
| **Phase 4B Use** | AGOA modernization docket monitoring |

### 7.5 USITC DataWeb API

| Field | Value |
|-------|-------|
| **Status** | ✅ **Verified — Credentialed Access** |
| **Source Key** | `usitc_dataweb` |
| **Confidence** | High |
| **API URL** | https://dataweb.usitc.gov/api |
| **Authentication** | Account/token-based |
| **Geographic Coverage** | U.S. trade |
| **HS Coverage** | 10-digit HTS |
| **Phase 4B Use** | Reference; Phase 4C full integration |

### 7.6 USITC HTS Reference

| Field | Value |
|-------|-------|
| **Status** | ✅ **Verified — Reference Data Only** |
| **Source Key** | `usitc_hts_reference` |
| **Confidence** | High |
| **Access** | File download |
| **Phase 4B Use** | HS code reference table |

### 7.7 tralac AfCFTA Tracker

| Field | Value |
|-------|-------|
| **Status** | ✅ **Verified — Trusted Secondary Source** |
| **Source Key** | `tralac_afcfta` |
| **Confidence** | Medium |
| **Access** | Manual curation |
| **Phase 4B Use** | AfCFTA ratification status (secondary source) |

---

## 8. Manual Curation Sources

### 8.1 USTR AGOA Eligibility

| Field | Value |
|-------|-------|
| **Source Key** | `ustr_agoa` |
| **Confidence** | High |
| **Access** | Manual (no API) |
| **Update Frequency** | Annual + ad-hoc |
| **Phase 4B Use** | AGOA eligibility status tracker |

**Manual Curation Workflow:**
1. Admin monitors USTR announcements
2. Admin uploads CSV with eligibility status
3. System validates ISO3 against 74-market scope
4. System rejects ESH entries
5. System requires source_url and as_of_date
6. System creates ingestion run record

### 8.2 AfCFTA Secretariat

| Field | Value |
|-------|-------|
| **Source Key** | `afcfta_secretariat` |
| **Confidence** | High |
| **Access** | Manual (no API) |
| **Phase 4B Use** | AfCFTA implementation status (primary source) |

---

## 9. Phase 4B Integration Priority

### Sprint 1: Foundation

| Task | Source | Priority |
|------|--------|----------|
| Source Registry schema | Infrastructure | P0 |
| Indicator Builder schema | Infrastructure | P0 |
| Country code crosswalk | Reference | P0 |
| Manual upload connector | Infrastructure | P0 |
| Audit/ingestion run ledger | Infrastructure | P0 |

### Sprint 2: Manual Trade Policy Data

| Task | Source | Priority |
|------|--------|----------|
| AGOA eligibility tracker | USTR (manual) | P0 |
| AfCFTA status tracker | AfCFTA/tralac (manual) | P0 |
| Data freshness badges | UI | P0 |
| Admin quality dashboard | Admin | P1 |

### Sprint 3: API Validation

| Task | Source | Priority |
|------|--------|----------|
| Census API validation wrapper | Census Trade API | P0 |
| Comtrade API validation wrapper | UN Comtrade | P0 |
| WDI scheduled ingestion | World Bank WDI | P0 |

### Sprint 4: Supply-Demand Matrix

| Task | Source | Priority |
|------|--------|----------|
| 74×7 supply-demand matrix | Aggregated | P1 |
| Public trade intelligence pages | UI | P1 |

---

## 10. Deferred to Phase 4C

The following are explicitly **out of scope** for Phase 4B:

| Item | Reason |
|------|--------|
| Full HS-code product intelligence | Requires stable API foundation |
| Product opportunity scoring | Requires product-level data |
| Tariff preference calculators | Requires WITS/tariff data |
| UN Comtrade product-flow analytics | Phase 4C scope |
| U.S. Census/USITC production product intelligence | Phase 4C scope |
| Trade report builder | Requires product layer |

---

## 11. API Key Registration Checklist

### Required for Phase 4B

| Source | Registration URL | Status |
|--------|-----------------|--------|
| U.S. Census | https://api.census.gov/data/key_signup.html | ⏳ Required |
| UN Comtrade | https://comtradeplus.un.org/ | ⏳ Required |
| Regulations.gov | https://api.data.gov/signup/ | ⏳ Required |
| World Bank WDI | None required | ✅ Ready |

---

## 12. Data Licensing Summary

### Public Domain (Free Commercial Use)

| Source | License | Attribution |
|--------|---------|-------------|
| U.S. Census | Public domain | Recommended |
| USITC | Public domain | Recommended |
| Federal Register | Public domain | Recommended |
| USTR | Public domain | Recommended |

### Open Data with Attribution

| Source | License | Attribution Required |
|--------|---------|---------------------|
| UN Comtrade | UN Data License | Yes |
| World Bank | CC BY 4.0 | Yes |

### Attribution Text Templates

**UN Comtrade:**
> Source: UN Comtrade Database (https://comtradeplus.un.org/)

**World Bank:**
> Source: World Bank Open Data (https://data.worldbank.org/)

**U.S. Census:**
> Source: U.S. Census Bureau

---

## Appendix A: Full Country Code Crosswalk

[To be generated during Phase 4B Sprint 1 from existing souvera_countries table]

---

## Appendix B: Ingestion Run Schema

```sql
-- See infra/supabase/sql-pack-v1.14-phase-4b.sql for implementation
```

---

**Document Version:** 2.1  
**Classification:** Internal — Engineering Planning  
**Last Updated:** 2026-05-06  
**Owner:** Afronovation Engineering Team  
**Status:** Verified for Phase 4B Implementation
