# Source Ingestion Activation Plan

**Version:** 1.2  
**Date:** April 29, 2026  
**Updated:** May 5, 2026 (DATA-ING-02B complete, FDI ingestion verified)  
**Status:** Phase 4A In Progress — FDI Complete, Sector Seeding Pending  
**Owner:** Engineering Team  
**Document Type:** Execution Plan

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Ingestion Infrastructure Status](#2-current-ingestion-infrastructure-status)
3. [Key Findings](#3-key-findings)
4. [Current Data State](#4-current-data-state)
5. [Recommended Phase Structure](#5-recommended-phase-structure)
6. [Data Source Priority & Details](#6-data-source-priority--details)
7. [Source-to-Table Mapping](#7-source-to-table-mapping)
8. [Transition Language Rules](#8-transition-language-rules)
9. [Quality Gates Before Language Evolution](#9-quality-gates-before-language-evolution)
10. [Recommendation on When to Begin Ingestion](#10-recommendation-on-when-to-begin-ingestion)
11. [Backlog Tasks](#11-backlog-tasks)
12. [Verification SQL Queries](#12-verification-sql-queries)
13. [Implementation Order](#13-implementation-order)
14. [Risks and Mitigations](#14-risks-and-mitigations)
15. [Final Recommendation](#15-final-recommendation)
16. [Related Documentation](#16-related-documentation)

---

## 1. Executive Summary

This plan defines when and how Souvera Intelligence Terminal transitions from curated preview/seed data to live source-ingested data. It establishes the technical roadmap, quality gates, and language governance required before claiming "live" or "source-attributed" data in the public UI.

### Data Maturity Levels

| Level | Description | UI Language | Phase |
|-------|-------------|-------------|-------|
| **Curated Preview/Seed Data** | Static data seeded via SQL scripts. Data vintage documented but not automatically refreshed. | "Curated Preview Data" | Phase 3 |
| **Manually Ingested Source Data** | Data fetched from approved sources via manual CLI execution. Validated before use. | "Source-Attributed Preview" | Phase 4A |
| **Scheduled Automated Source Ingestion** | Automated refresh via cron/edge functions. Source health monitored. | "Automated Source Refresh" | Phase 4B |
| **Production Source-Governed Data** | Full governance: monitoring, fallback, licensing compliance, quality dashboards. | "Source-Attributed Data" | Phase 5 |

### Key Decisions

1. **Phase 3 uses curated preview/seed data** — no live-data claims permitted
2. **Phase 4A begins manual source ingestion activation** — can run in parallel with map workspace
3. **Phase 4B introduces scheduled ingestion** — with source health monitoring
4. **Phase 5 is production source-governed intelligence** — requires all quality gates
5. **UI language must remain "Curated Preview Data"** until all quality gates pass
6. **Prohibited terms**: "live data," "real-time," "guaranteed accuracy"

---

## 2. Current Ingestion Infrastructure Status

The Souvera ingestion infrastructure is **well-architected and partially implemented**. Core components are production-ready; only scheduling and additional adapters remain.

### Infrastructure Inventory

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| **Ingestion Runner CLI** | ✅ Complete | `services/ingestion/run.ts` | Supports `restcountries`, `worldbank`, `all` |
| **World Bank Adapter** | ✅ Complete | `services/ingestion/worldbank.ts` | GDP, GDP growth, Population |
| **REST Countries Adapter** | ✅ Complete | `services/ingestion/restcountries.ts` | Country identity, flags, coordinates |
| **Shared Utilities** | ✅ Complete | `services/ingestion/shared.ts` | Job logging, health tracking, payload archive |
| **Job Logging** | ✅ Implemented | `createIngestionJob()`, `closeIngestionJob()` | Writes to `souvera_ingestion_jobs` |
| **Source Health Tracking** | ✅ Implemented | `updateSourceHealth()` | Writes to `souvera_source_health` |
| **Payload Archive** | ✅ Implemented | `archivePayload()` | Writes to `souvera_source_payload_archive` |
| **Config Package** | ✅ Complete | `packages/config/src/env.ts` | All 11 source URLs configured |
| **Database Tables** | ✅ Complete | `infra/supabase/sql-pack-v1.1.sql` | Full ingestion schema |
| **Data Sources Registry** | ✅ Seeded | `souvera_data_sources` | 11 sources registered |
| **Indicators Registry** | ✅ Seeded | `souvera_indicators` | 10 core indicators |
| **Scheduled Cron Jobs** | ❌ Not implemented | — | No Supabase Edge Functions yet |
| **IMF Adapter** | ❌ Not implemented | — | Forecasts |
| **UN Comtrade Adapter** | ❌ Not implemented | — | Trade data |
| **Open Exchange Rates Adapter** | ❌ Not implemented | — | FX rates |
| **GDELT Adapter** | ❌ Not implemented | — | News signals |
| **AfDB Adapter** | ❌ Not implemented | — | Africa enrichment |

### CLI Usage

```bash
# Run individual adapters
npx tsx services/ingestion/run.ts restcountries
npx tsx services/ingestion/run.ts worldbank

# Run all adapters
npx tsx services/ingestion/run.ts all
```

---

## 3. Key Findings

### 3.1 World Bank Adapter Capabilities

The World Bank adapter is fully functional and ingests:

| Indicator | World Bank Code | Souvera Key | Target |
|-----------|-----------------|-------------|--------|
| GDP (Current US$) | NY.GDP.MKTP.CD | `gdp_current_usd` | `souvera_country_observations` |
| GDP Growth (%) | NY.GDP.MKTP.KD.ZG | `gdp_growth_pct` | `souvera_country_observations` |
| Population | SP.POP.TOTL | `population_total` | `souvera_country_observations` |

**Configuration:**
- Date range: 2018–2025 (7 years)
- Records per page: 300
- Rate limiting: 200ms between requests
- Deduplication: Upsert on `country_id + indicator_id + period_date + source_id`

**Gap:** FDI (`fdi_net_inflows_usd`) and Inflation (`inflation_cpi_pct`) indicators exist in the database but are not yet in the adapter.

### 3.2 REST Countries Adapter Capabilities

The REST Countries adapter is fully functional and ingests:

| Field | Source | Target Column |
|-------|--------|---------------|
| ISO2/ISO3 codes | cca2, cca3 | `iso2`, `iso3` |
| Country name | name.common | `name` |
| Region/Subregion | region, subregion | `region`, `subregion` |
| Capital | capital[0] | `capital` |
| Currency | currencies | `currency_code`, `currency_name` |
| Flag URLs | flags.svg, flags.png | `flag_svg_url`, `flag_png_url` |
| Coordinates | latlng | `lat`, `lng` |
| Africa flag | region === 'Africa' | `is_african_country` |

**Target:** `souvera_countries` table (upsert on `iso3`)

### 3.3 Shared Utilities

All adapters use these production-ready utilities:

```typescript
// Create job record at start
const { jobId, sourceId } = await createIngestionJob('world_bank', 'macro_refresh');

// Close job with status
await closeIngestionJob(jobId, 'succeeded', recordsProcessed, recordsFailed);

// Update source health
await updateSourceHealth(sourceId, true, latencyMs);

// Archive raw payload (first page only)
await archivePayload(sourceId, url, params, response, httpStatus);
```

### 3.4 Missing Adapters

| Source | Priority | Data Fields | Complexity | MVP Required |
|--------|----------|-------------|------------|--------------|
| IMF | Medium | GDP forecast | Medium | No |
| UN Comtrade | Medium | Exports, imports | High (API key) | No |
| Open Exchange Rates | Low | FX rates | Low (API key) | No |
| GDELT | Low | News signals | Medium | No |
| AfDB | Low | Africa enrichment | Medium (API key) | No |

---

## 4. Current Data State

### 4.1 Database Population

| Table | Status | Record Count | Source |
|-------|--------|--------------|--------|
| `souvera_countries` | ✅ Populated | 74 (54 Africa + 20 Caribbean) | SQL seed (`sql-pack-v1.5`) |
| `souvera_data_sources` | ✅ Populated | 11 sources | SQL seed (`sql-pack-v1.1`) |
| `souvera_indicators` | ✅ Populated | 10 indicators | SQL seed (`sql-pack-v1.1`) |
| `souvera_country_observations` | ✅ Populated | ~500+ records | SQL seed (`sql-pack-v1.5`) |
| `souvera_country_profiles` | ⚠️ Partial | Priority countries only | SQL seed |
| `souvera_country_sectors` | ⚠️ Partial | Priority countries only | SQL seed |
| `souvera_ingestion_jobs` | ❌ Empty | 0 | No runs yet |
| `souvera_source_health` | ❌ Empty | 0 | No runs yet |
| `souvera_source_payload_archive` | ❌ Empty | 0 | No runs yet |

### 4.2 Data Vintage

Current seed data vintage:
- **Country identity:** REST Countries API (2024)
- **GDP/Population:** World Bank (2022–2023 latest available)
- **FDI:** World Bank (2022 where available)
- **Profiles/Sectors:** Curated editorial content (2024)

---

## 5. Recommended Phase Structure

### Phase 1-2: Terminal Foundation & Authentication (Complete)

**Status:** ✅ Complete  
**Date Completed:** 2026-05-02  
**Data Source:** Curated preview/seed data (SQL-based)

| Deliverable | Status |
|-------------|--------|
| UI/API foundation | ✅ Complete |
| Curated preview data seeded | ✅ Complete |
| Map workspace implemented | ✅ Complete |
| Africa workspace embedded | ✅ Complete |
| Authentication/entitlements | ✅ Complete |
| Tier-based access working | ✅ Complete |
| Account menu polish | ✅ Complete |

**UI Language:** "Curated Preview Data"

---

### Phase 3: Regional Expansion & Route Behavior (Next)

**Status:** Planned  
**Target:** After Phase 2 QA complete  
**Focus:** Geographic scope and navigation refinement

| Deliverable | Description |
|-------------|-------------|
| Caribbean shell route | `/intelligence/caribbean` page structure |
| Region filters (optional) | Africa / Caribbean / All toggle if approved |
| Query params (optional) | `?region=africa` support if approved |
| Route architecture docs | Navigation pattern documentation |
| Mobile/desktop polish | Final responsive refinement |

**Data Source:** Still curated preview/seed data  
**UI Language:** Still "Curated Preview Data"

---

### Phase 4A: Manual Source Ingestion Activation

**Status:** Planned  
**Target:** Can run in parallel with Phase 3  
**Data Source:** Manually triggered API ingestion (CLI-based)

| Deliverable | Description |
|-------------|-------------|
| **DATA-ING-02B: Add FDI to World Bank adapter** | Add `BX.KLT.DINV.CD.WD` to `INDICATORS` array |
| World Bank manual ingestion | Run CLI with FDI included, validate observations |
| REST Countries manual ingestion | Run CLI, validate country records |
| Observation validation SQL | Verify FDI, GDP, population data |
| Freshness timestamp update | Verify `fetched_at` populated |
| API output verification | Confirm `/api/v1/country-lite` returns FDI for Professional+ |
| Source health baseline | Verify `souvera_source_health` populated |

**Critical Addition (2026-05-02)**: FDI must be added to World Bank adapter before Phase 4A validation. See `docs/qa/fdi-na-data-path-debug.md`.

**UI Language Allowed:**
- "Source-Attributed Preview" (only after validation)
- "Updated from approved public sources"
- "Last updated [date]"
- "Data vintage: [year]"

**Still Prohibited:**
- "Live data"
- "Real-time"
- "Automated refresh" (until Phase 4B)

---

### Phase 4B: Scheduled Ingestion

**Status:** Planned  
**Target:** After Phase 4A validated  
**Data Source:** Automated cron/edge function refresh

| Deliverable | Description |
|-------------|-------------|
| Supabase Edge Functions | Scheduled ingestion triggers |
| Source health monitoring | Automatic health status updates |
| Ingestion job dashboard | Admin view of job history |
| Failure handling | Alerts, retry logic |
| Stale data badges | UI indicator for outdated data |
| Payload archive policy | Retention rules |

**UI Language Allowed:**
- All Phase 4A language, plus:
- "Automated source refresh"
- "Scheduled data updates"
- "Source health monitored"

---

### Phase 5: Production Source-Governed Intelligence

**Status:** Future  
**Target:** After all 14 quality gates pass  
**Data Source:** Production-grade automated ingestion

| Deliverable | Description |
|-------------|-------------|
| Automated refresh cadence | Daily/weekly schedules per source |
| Admin monitoring dashboard | Data completeness, freshness, health |
| Source licensing review | Legal compliance verified |
| Data completeness metrics | Coverage per country/indicator |
| Fallback behavior | Graceful degradation, cached data |

**UI Language Allowed:**
- "Source-Attributed Data"
- "Updated [frequency] from [source]"
- Specific data vintage per metric

**Still Prohibited:**
- "Guaranteed accuracy"
- Unsupported latency/uptime claims

---

## 6. Data Source Priority & Details

### Priority 1: REST Countries — Identity Foundation

| Aspect | Value |
|--------|-------|
| **Data Fields** | iso2, iso3, name, region, subregion, capital, currency, flags, coordinates |
| **Target Table** | `souvera_countries` |
| **Refresh Cadence** | Monthly |
| **API Authentication** | Public (no key required) |
| **API Base URL** | `https://restcountries.com/v3.1` |
| **Legal Status** | ✅ Approved |
| **MVP Priority** | **Critical** |
| **Risk Level** | Low |
| **Adapter Status** | ✅ Complete |

---

### Priority 2: World Bank — Core Macro

| Aspect | Value |
|--------|-------|
| **Data Fields** | GDP, GDP growth, Population, FDI*, Inflation* |
| **Target Table** | `souvera_country_observations` |
| **Refresh Cadence** | Weekly |
| **API Authentication** | Public (no key required) |
| **API Base URL** | `https://api.worldbank.org/v2` |
| **Legal Status** | ✅ Approved |
| **MVP Priority** | **Critical** |
| **Risk Level** | Low |
| **Adapter Status** | ✅ Complete (3 indicators) |
| **Gap** | *FDI and Inflation not in current adapter |

**World Bank Indicator Codes:**

| Souvera Key | World Bank Code | Status |
|-------------|-----------------|--------|
| `gdp_current_usd` | NY.GDP.MKTP.CD | ✅ In adapter |
| `gdp_growth_pct` | NY.GDP.MKTP.KD.ZG | ✅ In adapter |
| `population_total` | SP.POP.TOTL | ✅ In adapter |
| `fdi_net_inflows_usd` | **BX.KLT.DINV.CD.WD** | ❌ Not in adapter |
| `inflation_cpi_pct` | FP.CPI.TOTL.ZG | ❌ Not in adapter |

**Critical Finding (2026-05-02)**: FDI currently displays as "N/A" for Professional+ users because:
1. FDI not seeded in `sql-pack-v1.5`
2. FDI not in World Bank adapter `INDICATORS` array
3. See: `docs/qa/fdi-na-data-path-debug.md` for full analysis

---

### Priority 3: IMF — Forecasts

| Aspect | Value |
|--------|-------|
| **Data Fields** | GDP forecast, economic outlook |
| **Target Table** | `souvera_country_observations` |
| **Refresh Cadence** | Monthly or release-driven |
| **API Authentication** | Public |
| **API Base URL** | `https://api.imf.org` |
| **Legal Status** | ⚠️ Review required |
| **MVP Priority** | Medium |
| **Risk Level** | Medium |
| **Adapter Status** | ❌ Not implemented |

---

### Priority 4: UN Comtrade — Trade Data

| Aspect | Value |
|--------|-------|
| **Data Fields** | Exports, imports, trade partners |
| **Target Table** | `souvera_country_trade_snapshots` |
| **Refresh Cadence** | Quarterly |
| **API Authentication** | API key required |
| **API Base URL** | `https://comtradeapi.un.org` |
| **Legal Status** | ⚠️ Review required |
| **MVP Priority** | Medium |
| **Risk Level** | Medium (rate limits, key management) |
| **Adapter Status** | ❌ Not implemented |

---

### Priority 5: Open Exchange Rates — FX

| Aspect | Value |
|--------|-------|
| **Data Fields** | FX rate to USD |
| **Target Table** | `souvera_country_observations` |
| **Refresh Cadence** | Hourly (cached) |
| **API Authentication** | API key required |
| **API Base URL** | `https://openexchangerates.org/api` |
| **Legal Status** | ⚠️ Review required |
| **MVP Priority** | Low (Professional tier only) |
| **Risk Level** | Medium (paid API, rate limits) |
| **Adapter Status** | ❌ Not implemented |

---

### Priority 6: GDELT — News Signals

| Aspect | Value |
|--------|-------|
| **Data Fields** | Headline count, sentiment, risk intensity |
| **Target Table** | `souvera_country_news_signals` |
| **Refresh Cadence** | Daily |
| **API Authentication** | Public |
| **API Base URL** | `https://api.gdeltproject.org/api/v2` |
| **Legal Status** | ⚠️ Review required |
| **MVP Priority** | Low |
| **Risk Level** | Medium (data volume, processing) |
| **Adapter Status** | ❌ Not implemented |

---

### Priority 7: AfDB — Africa Enrichment

| Aspect | Value |
|--------|-------|
| **Data Fields** | Africa-specific regional data |
| **Target Table** | `souvera_country_observations` |
| **Refresh Cadence** | Monthly |
| **API Authentication** | API key or registered access |
| **API Base URL** | `https://apiportal.opendataforafrica.org` |
| **Legal Status** | ⚠️ Review required |
| **MVP Priority** | Low |
| **Risk Level** | Medium |
| **Adapter Status** | ❌ Not implemented |

---

## 7. Source-to-Table Mapping

### Primary Data Flow

```
External API → Adapter → Database Table → View → API Endpoint → UI
```

### Detailed Mapping

| Source | Target Table | Indicator Keys / Fields | Upsert Key |
|--------|--------------|-------------------------|------------|
| REST Countries | `souvera_countries` | iso2, iso3, name, region, capital, flags, coordinates | `iso3` |
| World Bank | `souvera_country_observations` | gdp_current_usd, gdp_growth_pct, population_total | `country_id + indicator_id + period_date + source_id` |
| World Bank (future) | `souvera_country_observations` | fdi_net_inflows_usd, inflation_cpi_pct | Same |
| IMF | `souvera_country_observations` | gdp_forecast_pct | Same |
| UN Comtrade | `souvera_country_trade_snapshots` | exports, imports, trade_partners | `country_id + year` |
| Open Exchange Rates | `souvera_country_observations` | fx_to_usd | Same |
| GDELT | `souvera_country_news_signals` | headline_count, sentiment_score, risk_intensity | `country_id + signal_date` |
| AfDB | `souvera_country_observations` | Africa-specific metrics | Same |

### Supporting Tables Updated by Ingestion

| Table | Updated By | Purpose |
|-------|------------|---------|
| `souvera_ingestion_jobs` | All adapters | Job history, status, record counts |
| `souvera_source_health` | All adapters | Last success/failure, latency, health status |
| `souvera_source_payload_archive` | All adapters | Raw response archive (truncated) |

### Views Consuming Observations

| View | Data Source | Access Tier |
|------|-------------|-------------|
| `souvera_latest_observations_v` | `souvera_country_observations` | Internal |
| `souvera_country_lite_v` | Latest observations + profiles | Public/Explorer |
| `souvera_country_professional_v` | Lite + FDI, inflation, FX | Professional |
| `souvera_country_business_v` | Professional + forecasts | Business+ |

---

## 8. Transition Language Rules

### Phase 3 (Current) — Curated Preview

✅ **Allowed:**
- "Curated Preview Data"
- "Source-Attributed Preview"
- "Data sources: World Bank, IMF"
- "Automated data feeds are in development"
- "Data vintage: 2023"

❌ **Prohibited:**
- "Live data"
- "Real-time"
- "Live · Supabase"
- "Supabase connected" (in public UI)
- "Guaranteed accuracy"
- "Up-to-the-minute"
- Any unsupported latency claims

---

### Phase 4A — Manual Ingestion Validated

✅ **Allowed (in addition to Phase 3):**
- "Source-attributed data"
- "Updated from approved public sources"
- "Last updated [date]"
- "Data vintage: [year]"
- "[Source] data refreshed [date]"

❌ **Still Prohibited:**
- "Live data"
- "Real-time"
- "Automated refresh" (until 4B)
- "Guaranteed accuracy"

---

### Phase 4B — Scheduled Ingestion Active

✅ **Allowed (in addition to Phase 4A):**
- "Automated source refresh"
- "Scheduled data updates"
- "Source health monitored"
- "Weekly refresh from World Bank"
- "Data freshness: [X days]"

❌ **Still Prohibited:**
- "Live data" (unless sub-hourly refresh)
- "Real-time" (unless sub-minute refresh)
- "Guaranteed accuracy"
- Unsupported uptime claims

---

### Phase 5 — Production Source-Governed

✅ **Allowed (requires all quality gates):**
- "Source-Attributed Data"
- Specific refresh frequencies
- Source-level freshness per metric
- "Institutional-grade intelligence"

❌ **Always Prohibited:**
- "Guaranteed accuracy"
- Unsupported latency claims
- Claims exceeding actual capability

---

## 9. Quality Gates Before Language Evolution

### Gate Checklist (All Required Before Phase 5 Language)

| # | Gate | Verification Method | Owner |
|---|------|---------------------|-------|
| 1 | Ingestion jobs succeed for World Bank | Check `souvera_ingestion_jobs.status = 'succeeded'` | Engineering |
| 2 | Ingestion jobs succeed for REST Countries | Check `souvera_ingestion_jobs.status = 'succeeded'` | Engineering |
| 3 | Data mapped to correct indicators | Run verification SQL | Engineering |
| 4 | Observations available for all 74 mandate countries | Run coverage SQL | Engineering |
| 5 | Freshness timestamp displayed in UI | QA visual inspection | QA |
| 6 | Source attribution displayed in UI | QA visual inspection | QA |
| 7 | Fallback behavior works (stale data badge) | Test with old data | QA |
| 8 | Source health table populated | Check `souvera_source_health` | Engineering |
| 9 | No raw external API calls from frontend | Code review | Engineering |
| 10 | No premium/licensed data exposed publicly | Entitlement audit | Engineering |
| 11 | Legal/licensing notes documented | Documentation review | Legal/Product |
| 12 | Scheduled refresh operational | Monitor cron jobs | Engineering |
| 13 | Admin monitoring dashboard functional | Admin QA | Engineering |
| 14 | Error handling verified | Inject failures | QA |

### Gate Sign-Off Template

```
Quality Gate Sign-Off: Source Ingestion Language Evolution
Date: _______________
Signed By: _______________

[ ] All 14 gates verified
[ ] No blocking issues
[ ] Ready for Phase 5 language
```

---

## 10. Recommendation on When to Begin Ingestion

### Decision: Begin Manual Ingestion in Parallel with Map Workspace

**Recommendation:** Start manual World Bank and REST Countries ingestion during Phase 1 Map Workspace implementation.

**Rationale:**

1. **Infrastructure is ready** — Adapters, job logging, health tracking all complete
2. **No UI language change required** — Can validate silently while UI says "Curated Preview Data"
3. **Low risk** — Manual execution allows validation before automation
4. **Parallel efficiency** — Engineering can run ingestion while frontend work continues
5. **Early detection** — Discovers data issues before Phase 4 formally begins

### Recommended Timing

| Activity | When | Duration |
|----------|------|----------|
| Run REST Countries ingestion manually | During Phase 1 (Map Workspace) | 10 minutes |
| Validate country records | Same day | 30 minutes |
| Run World Bank ingestion manually | During Phase 1 (Map Workspace) | 30 minutes |
| Validate observations | Same day | 1 hour |
| Verify API returns fresh data | Same day | 30 minutes |
| Document results | Same day | 30 minutes |

### What NOT to Do Yet

- ❌ Do NOT change UI language
- ❌ Do NOT implement scheduled cron jobs
- ❌ Do NOT claim "live data"
- ❌ Do NOT run paid API adapters without key setup
- ❌ Do NOT run ingestion without verifying results

---

## 11. Backlog Tasks

### DATA-ING-01: Ingestion Inventory Audit

**Objective:** Verify current ingestion infrastructure matches documentation.

**Files to Change:**
- `services/ingestion/*.ts` (audit only)
- `packages/config/src/env.ts` (audit only)

**Acceptance Criteria:**
- [ ] All adapters documented
- [ ] All shared utilities documented
- [ ] Environment variables verified
- [ ] Source URLs verified

**Risk:** Low

---

### DATA-ING-02: World Bank Manual Ingestion Activation

**Objective:** Run World Bank ingestion manually and validate results.

**Files to Change:**
- None (execution only)

**Commands:**
```bash
npx tsx services/ingestion/run.ts worldbank
```

**Acceptance Criteria:**
- [ ] Job logged in `souvera_ingestion_jobs` with `status = 'succeeded'`
- [ ] Observations inserted for GDP, GDP growth, Population
- [ ] Source health updated in `souvera_source_health`
- [ ] Payload archived in `souvera_source_payload_archive`
- [ ] No errors in console output

**Risk:** Low

---

### DATA-ING-02B: Add FDI to World Bank Ingestion

**Objective:** Add FDI indicator to World Bank adapter to enable Professional+ FDI display.

**Context:** FDI currently shows "N/A" for Professional+ users because FDI is not ingested. See `docs/qa/fdi-na-data-path-debug.md` for full analysis.

**Files to Change:**
- `services/ingestion/worldbank.ts` (line 13-17)

**Implementation:**

Update the `INDICATORS` array:

```typescript
const INDICATORS = [
  { wbCode: 'NY.GDP.MKTP.CD', souveraKey: 'gdp_current_usd' },
  { wbCode: 'NY.GDP.MKTP.KD.ZG', souveraKey: 'gdp_growth_pct' },
  { wbCode: 'SP.POP.TOTL', souveraKey: 'population_total' },
  { wbCode: 'BX.KLT.DINV.CD.WD', souveraKey: 'fdi_net_inflows_usd' },  // ADD THIS
] as const;
```

**World Bank Indicator Details:**
- **Code**: `BX.KLT.DINV.CD.WD`
- **Name**: Foreign direct investment, net inflows (BoP, current US$)
- **Availability**: Most countries have data from 2000-2023

**Commands to Run After Update:**
```bash
npx tsx services/ingestion/run.ts worldbank
```

**Acceptance Criteria:**
- [x] World Bank adapter includes `BX.KLT.DINV.CD.WD` mapped to `fdi_net_inflows_usd`
- [x] Ingestion job succeeds with status `succeeded` (5747 processed, 0 failed)
- [x] FDI observations written to `souvera_country_observations` for countries with data (1376 observations)
- [x] Professional users see FDI values when available (verified: NGA, ZAF, KEN, JAM, TTO)
- [x] Countries without FDI data show "Data pending" (requires UX-DATA-01)
- [x] Source/freshness metadata populated (2026-05-05 01:33:18.413+00)
- [x] No "live data" language used (maintain "Source-Attributed Preview")

**Status:** ✅ COMPLETE — Executed 2026-05-05

**Verification:** See [`docs/qa/phase-4a-fdi-ingestion-verification-results.md`](../qa/phase-4a-fdi-ingestion-verification-results.md)

**Verification SQL:**
```sql
-- Verify FDI observations were created
SELECT COUNT(*) as fdi_observation_count
FROM souvera_country_observations o
JOIN souvera_indicators i ON i.id = o.indicator_id
WHERE i.key = 'fdi_net_inflows_usd';
-- Expected: > 0

-- Check Nigeria specifically
SELECT iso3, name, fdi_net_inflows_usd
FROM souvera_country_professional_v
WHERE iso3 = 'NGA';
-- Expected: numeric value (not NULL)
```

**Risk:** Low — same pattern as existing indicators

**Priority:** P1 — Required for Professional+ tier feature completeness

---

### DATA-ING-03: REST Countries Controlled Ingestion

**Objective:** Run REST Countries ingestion manually and validate results.

**Files to Change:**
- None (execution only)

**Commands:**
```bash
npx tsx services/ingestion/run.ts restcountries
```

**Acceptance Criteria:**
- [ ] Job logged in `souvera_ingestion_jobs` with `status = 'succeeded'`
- [ ] Country records upserted (74 mandate + others)
- [ ] `is_african_country` flag correct
- [ ] Flags and coordinates populated
- [ ] Source health updated

**Risk:** Low — Note: REST Countries will upsert ALL countries (~250), not just mandate countries. This is expected; API filtering handles visibility.

---

### DATA-ING-04: Observation Validation SQL

**Objective:** Create and run SQL queries to verify data completeness.

**Files to Change:**
- `infra/supabase/verification/observation-checks.sql` (create)

**Acceptance Criteria:**
- [ ] Query: observations by country
- [ ] Query: observations by indicator
- [ ] Query: countries missing GDP
- [ ] Query: countries missing population
- [ ] Query: stale observations
- [ ] All queries return expected results

**Risk:** Low

---

### DATA-ING-05: Freshness/Source Display QA

**Objective:** Verify UI displays source attribution and freshness.

**Files to Change:**
- None (QA only)

**Acceptance Criteria:**
- [ ] Country panel shows "Source: World Bank"
- [ ] Country panel shows "Last updated: [date]"
- [ ] Data vintage visible
- [ ] Preview label visible

**Risk:** Low

---

### DATA-ING-06: Source Health Table Updates

**Objective:** Verify source health tracking works correctly.

**Files to Change:**
- None (verification only)

**Acceptance Criteria:**
- [ ] `souvera_source_health` has records for `world_bank` and `rest_countries`
- [ ] `last_success_at` populated
- [ ] `status = 'healthy'`
- [ ] `latency_ms` reasonable

**Risk:** Low

---

### DATA-ING-07: Ingestion Job Logging Verification

**Objective:** Verify job history is being captured correctly.

**Files to Change:**
- None (verification only)

**Acceptance Criteria:**
- [ ] Jobs visible in `souvera_ingestion_jobs`
- [ ] `records_processed` accurate
- [ ] `records_failed` accurate
- [ ] `started_at` and `finished_at` populated
- [ ] `error_message` null for successful jobs

**Risk:** Low

---

### DATA-ING-08: Payload Archive Policy

**Objective:** Define retention policy for archived payloads.

**Files to Change:**
- `docs/operations/data-retention-policy.md` (create)

**Acceptance Criteria:**
- [ ] Retention period defined (30/60/90 days)
- [ ] Cleanup SQL or cron documented
- [ ] Storage estimates documented

**Risk:** Low

---

### DATA-ING-09: Scheduled Cron/Edge Function Design

**Objective:** Design scheduled ingestion architecture.

**Files to Change:**
- `docs/architecture/scheduled-ingestion-design.md` (create)
- `supabase/functions/ingest-worldbank/index.ts` (future)
- `supabase/functions/ingest-restcountries/index.ts` (future)

**Acceptance Criteria:**
- [ ] Refresh schedule defined per source
- [ ] Edge function structure documented
- [ ] Error handling documented
- [ ] Monitoring approach documented

**Risk:** Medium — requires Supabase Edge Functions setup

---

### DATA-ING-10: Admin Data Completeness Dashboard

**Objective:** Create admin view for data completeness monitoring.

**Files to Change:**
- `apps/admin-console/src/app/data/completeness/page.tsx` (create)

**Acceptance Criteria:**
- [ ] Shows observation count per country
- [ ] Shows observation count per indicator
- [ ] Shows source health status
- [ ] Shows last ingestion job results
- [ ] Shows stale data warnings

**Risk:** Medium — requires admin console development

---

## 12. Verification SQL Queries

### 12.1 Observations by Country (Top 10)

```sql
SELECT 
  c.name, 
  c.iso3,
  COUNT(o.id) as observation_count
FROM souvera_countries c
LEFT JOIN souvera_country_observations o ON o.country_id = c.id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.iso3
ORDER BY observation_count DESC
LIMIT 10;
```

### 12.2 Observations by Indicator

```sql
SELECT 
  i.key, 
  i.label, 
  COUNT(o.id) as observation_count
FROM souvera_indicators i
LEFT JOIN souvera_country_observations o ON o.indicator_id = i.id
GROUP BY i.id, i.key, i.label
ORDER BY observation_count DESC;
```

### 12.3 Latest Observation per Country/Indicator

```sql
SELECT 
  c.name,
  i.key as indicator,
  o.value_numeric,
  o.period_date,
  ds.name as source
FROM souvera_country_observations o
JOIN souvera_countries c ON c.id = o.country_id
JOIN souvera_indicators i ON i.id = o.indicator_id
JOIN souvera_data_sources ds ON ds.id = o.source_id
WHERE (o.country_id, o.indicator_id, o.period_date) IN (
  SELECT country_id, indicator_id, MAX(period_date)
  FROM souvera_country_observations
  GROUP BY country_id, indicator_id
)
ORDER BY c.name, i.key;
```

### 12.4 Countries Missing GDP

```sql
SELECT c.iso3, c.name, c.region
FROM souvera_countries c
WHERE c.is_active = true
  AND c.id NOT IN (
    SELECT DISTINCT o.country_id 
    FROM souvera_country_observations o
    JOIN souvera_indicators i ON i.id = o.indicator_id
    WHERE i.key = 'gdp_current_usd'
  )
ORDER BY c.region, c.name;
```

### 12.5 Countries Missing Population

```sql
SELECT c.iso3, c.name, c.region
FROM souvera_countries c
WHERE c.is_active = true
  AND c.id NOT IN (
    SELECT DISTINCT o.country_id 
    FROM souvera_country_observations o
    JOIN souvera_indicators i ON i.id = o.indicator_id
    WHERE i.key = 'population_total'
  )
ORDER BY c.region, c.name;
```

### 12.6 Stale Observations (Older Than 2 Years)

```sql
SELECT 
  c.name,
  i.key as indicator,
  o.period_date,
  o.fetched_at,
  DATE_PART('day', NOW() - o.fetched_at) as days_since_fetch
FROM souvera_country_observations o
JOIN souvera_countries c ON c.id = o.country_id
JOIN souvera_indicators i ON i.id = o.indicator_id
WHERE o.period_date < (CURRENT_DATE - INTERVAL '2 years')
ORDER BY o.period_date ASC
LIMIT 50;
```

### 12.7 Recent Ingestion Jobs

```sql
SELECT 
  j.id,
  ds.name as source,
  j.job_type,
  j.status,
  j.records_processed,
  j.records_failed,
  j.started_at,
  j.finished_at,
  j.error_message
FROM souvera_ingestion_jobs j
JOIN souvera_data_sources ds ON ds.id = j.source_id
ORDER BY j.started_at DESC
LIMIT 20;
```

### 12.8 Source Health Status

```sql
SELECT 
  ds.key as source_key,
  ds.name as source_name,
  sh.status,
  sh.last_success_at,
  sh.last_failure_at,
  sh.failure_count,
  sh.latency_ms,
  sh.updated_at
FROM souvera_source_health sh
JOIN souvera_data_sources ds ON ds.id = sh.source_id
ORDER BY ds.priority_rank;
```

### 12.9 Mandate Country Coverage

```sql
WITH mandate_countries AS (
  SELECT id, iso3, name, region
  FROM souvera_countries
  WHERE is_active = true
    AND (
      is_african_country = true
      OR iso3 IN ('ATG','BHS','BRB','CUB','DMA','DOM','GRD','HTI','JAM',
                  'KNA','LCA','VCT','SUR','TTO','GUY','BLZ','PRI','VIR','ABW','CUW')
    )
),
coverage AS (
  SELECT 
    mc.iso3,
    mc.name,
    mc.region,
    COUNT(DISTINCT CASE WHEN i.key = 'gdp_current_usd' THEN o.id END) as has_gdp,
    COUNT(DISTINCT CASE WHEN i.key = 'population_total' THEN o.id END) as has_pop,
    COUNT(DISTINCT CASE WHEN i.key = 'gdp_growth_pct' THEN o.id END) as has_growth
  FROM mandate_countries mc
  LEFT JOIN souvera_country_observations o ON o.country_id = mc.id
  LEFT JOIN souvera_indicators i ON i.id = o.indicator_id
  GROUP BY mc.iso3, mc.name, mc.region
)
SELECT 
  region,
  COUNT(*) as total_countries,
  SUM(CASE WHEN has_gdp > 0 THEN 1 ELSE 0 END) as with_gdp,
  SUM(CASE WHEN has_pop > 0 THEN 1 ELSE 0 END) as with_population,
  SUM(CASE WHEN has_growth > 0 THEN 1 ELSE 0 END) as with_growth
FROM coverage
GROUP BY region
ORDER BY region;
```

---

## 13. Implementation Order

### Phase 1 (Parallel with Map Workspace)

1. **DATA-ING-01**: Ingestion inventory audit (1 hour)
2. **DATA-ING-03**: REST Countries manual ingestion (30 min)
3. **DATA-ING-02**: World Bank manual ingestion (1 hour)
4. **DATA-ING-04**: Run verification SQL (30 min)
5. **DATA-ING-06**: Verify source health (15 min)
6. **DATA-ING-07**: Verify job logging (15 min)

### Phase 4A (After Map Workspace Stable)

1. **DATA-ING-05**: Freshness/source display QA (2 hours)
2. Add FDI and Inflation to World Bank adapter (4 hours)
3. Re-run World Bank ingestion with new indicators (1 hour)
4. Verify all quality gates (2 hours)

### Phase 4B (After 4A Validated)

1. **DATA-ING-09**: Scheduled ingestion design (1 day)
2. Implement Supabase Edge Functions (2 days)
3. **DATA-ING-08**: Payload archive policy (2 hours)
4. Monitoring setup (4 hours)

### Phase 5 (After All Gates Pass)

1. **DATA-ING-10**: Admin completeness dashboard (2 days)
2. Quality gate sign-off (1 day)
3. Language evolution approval (1 day)

---

## 14. Risks and Mitigations

### Risk 1: World Bank API Rate Limits

**Risk:** World Bank API may rate-limit during large ingestion runs.

**Probability:** Low  
**Impact:** Medium

**Mitigation:**
- Current adapter has 200ms delay between requests
- Paginated fetching (300 records/page)
- Can increase delay if needed
- Run during off-peak hours

---

### Risk 2: REST Countries Ingests All Countries

**Risk:** REST Countries adapter upserts ~250 countries, not just 74 mandate countries.

**Probability:** Certain  
**Impact:** Low

**Mitigation:**
- This is expected behavior
- API-level filtering (`market-coverage.ts`) handles visibility
- Non-mandate countries exist in DB but are not exposed publicly
- Documented in DATA-GOV-01 backlog item

---

### Risk 3: Stale Data in Production

**Risk:** Data becomes stale if scheduled ingestion fails silently.

**Probability:** Medium  
**Impact:** High

**Mitigation:**
- Source health monitoring (`souvera_source_health`)
- Failure count tracking (status becomes 'degraded' after 3 failures)
- Stale data badges in UI (Phase 4B)
- Admin alerting (Phase 5)

---

### Risk 4: API Key Exposure

**Risk:** Paid API keys (Open Exchange Rates, etc.) exposed in code or logs.

**Probability:** Low  
**Impact:** High

**Mitigation:**
- All keys in environment variables
- Keys loaded via `packages/config/src/env.ts`
- Keys marked as optional (`required = false`)
- No keys logged in adapter output

---

### Risk 5: Data Quality Issues

**Risk:** External APIs return unexpected data formats or null values.

**Probability:** Medium  
**Impact:** Medium

**Mitigation:**
- Adapters validate data before insert
- Null values skipped (`if (record.value === null) continue`)
- ISO3 codes validated (`record.countryiso3code.length !== 3`)
- `records_failed` count tracked per job

---

### Risk 6: Licensing Compliance

**Risk:** Data redistribution violates source API terms of service.

**Probability:** Low  
**Impact:** High

**Mitigation:**
- `legal_status` field in `souvera_data_sources`
- Redistribution notes documented per source
- Source attribution required in UI
- Legal review gate in Phase 5

---

## 15. Final Recommendation

### Summary

The Souvera ingestion infrastructure is **mature and ready for activation**. The recommended approach is:

1. **Begin manual ingestion now** — Run World Bank and REST Countries adapters during Phase 1 Map Workspace implementation
2. **Validate silently** — Do not change UI language; verify data in database
3. **Maintain "Curated Preview Data" language** — Until all 14 quality gates pass
4. **Defer scheduled ingestion to Phase 4B** — After manual runs validated
5. **Defer language evolution to Phase 5** — After production governance in place

### Immediate Actions

| Action | Owner | Timeline |
|--------|-------|----------|
| Run `npx tsx services/ingestion/run.ts restcountries` | Engineering | This week |
| Run `npx tsx services/ingestion/run.ts worldbank` | Engineering | This week |
| Run verification SQL queries | Engineering | Same day |
| Verify source health populated | Engineering | Same day |
| Document results | Engineering | Same day |

### Go/No-Go Criteria for Phase 4B

- [ ] Manual ingestion runs succeeded at least 3 times
- [ ] All verification SQL queries return expected results
- [ ] Source health table shows `status = 'healthy'`
- [ ] No data quality issues discovered
- [ ] No rate limiting encountered

### Language Evolution Decision Tree

```
Is scheduled ingestion operational? 
  → No: Use "Curated Preview Data"
  → Yes: Is source health monitored?
    → No: Use "Source-Attributed Preview"
    → Yes: Are all 14 quality gates passed?
      → No: Use "Automated Source Refresh"
      → Yes: Can use "Source-Attributed Data"
```

---

## 16. Related Documentation

### Required Reading

| Document | Location | Status |
|----------|----------|--------|
| Map Workspace Enhancement Plan | `docs/design/souvera-map-workspace-enhancement-plan.md` | ✅ Exists |
| Map Workspace Entitlement Test Plan | `docs/qa/map-workspace-entitlement-test-plan.md` | ✅ Exists |
| Market Scope Governance | `docs/architecture/market-scope-governance.md` | ✅ Exists |
| Market Coverage Filtering | `docs/qa/market-coverage-filtering.md` | ✅ Exists |

### Implementation References

| Document | Location | Purpose |
|----------|----------|---------|
| Phase Roadmap | `docs/execution/phase-roadmap.md` | Phase definitions |
| Project Backlog | `docs/execution/project-backlog.md` | DATA-GOV-01 item |
| SQL Pack v1.1 | `infra/supabase/sql-pack-v1.1.sql` | Schema definition |
| SQL Pack v1.5 | `infra/supabase/sql-pack-v1.5-seed-africa-caribbean.sql` | Seed data |

### Code References

| Component | Location | Purpose |
|-----------|----------|---------|
| Ingestion CLI | `services/ingestion/run.ts` | Entry point |
| World Bank Adapter | `services/ingestion/worldbank.ts` | Macro data |
| REST Countries Adapter | `services/ingestion/restcountries.ts` | Identity data |
| Shared Utilities | `services/ingestion/shared.ts` | Job/health tracking |
| Config Package | `packages/config/src/env.ts` | Source URLs |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | April 29, 2026 | Engineering Team | Initial release |
| 1.1 | May 2, 2026 | Engineering Team | Added FDI findings, clarified phases 1-5, added DATA-ING-02B task |
| 1.2 | May 5, 2026 | Engineering Team | DATA-ING-02B complete: 1376 FDI observations ingested, verified |

---

**Recent Updates (v1.2)**:
- ✅ DATA-ING-02B COMPLETE: World Bank FDI ingestion executed successfully
- ✅ 5747 records processed, 0 failed (2026-05-05 01:33:18.413+00)
- ✅ 1376 FDI observations created across 74 markets
- ✅ Professional+ view verified: NGA, ZAF, KEN, JAM, TTO
- ✅ Negative FDI values supported (e.g., TTO: -$453M)
- 📄 Created verification report: `docs/qa/phase-4a-fdi-ingestion-verification-results.md`
- ⏳ Next: DATA-SEED-01 (sector seeding for 20 priority markets)

---

*This document is the source of truth for Souvera source ingestion activation. All implementation must follow this plan. UI language changes require quality gate sign-off.*
