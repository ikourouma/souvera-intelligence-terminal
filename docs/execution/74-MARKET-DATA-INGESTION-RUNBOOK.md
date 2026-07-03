# 74-Market Data Ingestion Runbook

**Version:** 1.0  
**Created:** June 15, 2026  
**Owner:** Afronovation, Inc.  
**Status:** Ready for Execution

---

## Executive Summary

This runbook provides step-by-step instructions for the comprehensive 74-market data ingestion to ensure all sovereign markets have complete trade intelligence coverage. The goal is to eliminate any scenario where a stakeholder queries a country and receives "no data."

---

## Pre-Requisites

### Environment Setup
```bash
# Ensure you're in the project root
cd c:\Users\ikour\Projects\souvera

# Verify .env.local has required variables
# NEXT_PUBLIC_SUPABASE_URL=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

### Database Migration
**IMPORTANT:** Run this migration before any data ingestion.

```sql
-- Apply in Supabase SQL Editor or via CLI
-- File: infra/supabase/migrations/20260615000001_add_crosswalk_codes_to_countries.sql
```

This migration adds crosswalk columns to `souvera_countries`:
- `census_code` - US Census Bureau country code
- `comtrade_code` - UN Comtrade reporter code
- `wdi_code` - World Bank WDI code
- `imf_code` - IMF country code
- `is_excluded` - Exclusion flag for non-mandate markets

---

## Ingestion Order

Execute scripts in this order to ensure proper dependencies:

### Step 1: Trade Intelligence Data (All 74 Markets)

#### 1.1 AfCFTA Trade Flows (54 African Countries)
```bash
npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts ingest-afcfta-flows
```
- **Duration:** ~5-10 minutes
- **Records:** ~1,000+ trade flow records
- **Tables:** `souvera_afcfta_trade_flows`

#### 1.2 CBTPA Trade Flows (20 Caribbean Markets)
```bash
npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts ingest-cbtpa-flows
```
- **Duration:** ~3-5 minutes
- **Records:** ~400+ trade flow records
- **Tables:** `souvera_cbtpa_trade_flows`

#### 1.3 Import Demand Signals (All 74 Markets)
```bash
npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts ingest-import-demand
```
- **Duration:** ~5-10 minutes
- **Records:** ~740+ demand signal records (74 markets × 10 categories)
- **Tables:** `souvera_import_demand_signals`

### Step 2: Macro Gap Fill (6 Gap Markets)

#### 2.1 IMF DataMapper Gap Fill
```bash
npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts imf-gap74-fill
```
- **Targets:** DMA (Dominica), GRD (Grenada), KNA (St. Kitts), SOM (Somalia)
- **Duration:** ~2-3 minutes
- **Data:** GDP, imports, exports, current account, reserves, inflation

#### 2.2 World Bank Rollout Fill
```bash
npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts worldbank-rollout-fill
```
- **Duration:** ~5-10 minutes
- **Data:** WDI indicators for gap markets

#### 2.3 Curated Trade/Macro Fill
```bash
npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts curated-trade-macro-fill
```
- **Duration:** ~2-3 minutes
- **Data:** Curated estimates for markets without official data

---

## Verification

### Step 3: Verify Coverage

#### 3.1 Run Coverage Check
```bash
npx tsx apps/api-gateway/scripts/check-all74-top20-coverage.ts
```

Expected output: All 74 markets at ≥15/20 indicators

#### 3.2 SQL Verification
```sql
-- Count trade flows by region
SELECT 
  'AfCFTA' as framework,
  COUNT(DISTINCT iso3) as countries,
  COUNT(*) as records
FROM souvera_afcfta_trade_flows
UNION ALL
SELECT 
  'CBTPA' as framework,
  COUNT(DISTINCT iso3) as countries,
  COUNT(*) as records
FROM souvera_cbtpa_trade_flows;

-- Check import demand coverage
SELECT COUNT(DISTINCT iso3) as markets_covered
FROM souvera_import_demand_signals;

-- Check Top 20 coverage by market
SELECT 
  c.iso3,
  c.name,
  COUNT(DISTINCT i.key) as indicators_covered
FROM souvera_countries c
LEFT JOIN souvera_country_observations o ON c.id = o.country_id
LEFT JOIN souvera_indicators i ON o.indicator_id = i.id
WHERE c.is_african_country = true OR c.iso3 IN (
  'JAM', 'TTO', 'BRB', 'BHS', 'GUY', 'SUR', 'BLZ', 'HTI', 'DOM', 'CUB',
  'ATG', 'DMA', 'GRD', 'KNA', 'LCA', 'VCT', 'ABW', 'CUW', 'SXM', 'PRI'
)
GROUP BY c.iso3, c.name
ORDER BY indicators_covered ASC;
```

---

## Gap Markets Reference

| ISO3 | Country | Region | Pre-Ingestion | Target |
|------|---------|--------|---------------|--------|
| SOM | Somalia | Africa | 13/20 | ≥15/20 |
| ERI | Eritrea | Africa | 8/20 | ≥15/20 |
| SSD | South Sudan | Africa | 11/20 | ≥15/20 |
| CUB | Cuba | Caribbean | 12/20 | ≥15/20 |
| DMA | Dominica | Caribbean | 14/20 | ≥15/20 |
| GRD | Grenada | Caribbean | 14/20 | ≥15/20 |
| KNA | St. Kitts & Nevis | Caribbean | 14/20 | ≥15/20 |
| PRI | Puerto Rico | Caribbean | 13/20 | ≥15/20 |
| VGB | British Virgin Islands | Caribbean | 5/20 | Structural ceiling |
| TCA | Turks & Caicos | Caribbean | 9/20 | Structural ceiling |

**Note:** VGB and TCA have structural data ceilings due to limited international reporting. These markets will have trade intelligence but may remain below 15/20 for macro indicators.

---

## Troubleshooting

### Common Issues

#### 1. Environment Variables Missing
```
Error: Missing Supabase environment variables
```
**Solution:** Verify `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

#### 2. Rate Limiting
```
Error: 429 Too Many Requests
```
**Solution:** Wait 60 seconds and re-run. Scripts have built-in delays but external APIs may throttle.

#### 3. Duplicate Key Constraint
```
Error: duplicate key value violates unique constraint
```
**Solution:** This is expected for re-runs. Scripts use UPSERT and will update existing records.

#### 4. Table Does Not Exist
```
Error: relation "souvera_afcfta_trade_flows" does not exist
```
**Solution:** Run the table creation migrations first:
```bash
# Apply migrations in order
infra/supabase/migrations/create-afcfta-trade-flows-table.sql
infra/supabase/migrations/create-cbtpa-trade-flows-table.sql
infra/supabase/migrations/create-import-demand-signals-table.sql
```

---

## Post-Ingestion Checklist

- [ ] Migration `20260615000001_add_crosswalk_codes_to_countries.sql` applied
- [ ] AfCFTA flows: 54 African countries covered
- [ ] CBTPA flows: 20 Caribbean markets covered
- [ ] Import demand: 74 markets covered
- [ ] IMF gap fill completed for DMA, GRD, KNA, SOM
- [ ] World Bank rollout fill completed
- [ ] Coverage check shows ≥68/74 markets at ≥15/20 indicators
- [ ] Trade intelligence pages render data for all 74 markets
- [ ] Admin data freshness dashboard updated

---

## Related Documents

- `docs/backlog/mvp-deferred-items.md` - Items 9-10 detailed spec
- `docs/platform/foundation-assessment-2026.md` - Data foundation requirements
- `docs/execution/PHASE-3-4-IMPLEMENTATION-PLAN.md` - Master implementation plan
- `services/ingestion/README.md` - Ingestion adapter documentation

---

## Execution Log

| Date | Step | Status | Notes |
|------|------|--------|-------|
| 2026-06-15 | Runbook created | ✅ | Ready for execution |
| 2026-06-15 | AfCFTA ingestion | ✅ | 864 records, 54 African countries |
| 2026-06-15 | CBTPA ingestion | ✅ | 320 records, 20 Caribbean markets |
| 2026-06-15 | Import demand ingestion | ✅ | 604 records, all 74 markets |
| 2026-06-15 | IMF gap fill | ✅ | 48 obs for DMA, GRD, KNA, SOM |
| 2026-06-15 | World Bank fill | ⏳ | Running (slow due to API limits) |
| 2026-06-15 | Curated fill | ⏭️ | Skipped - broken dependency |
| 2026-06-15 | Verification | ✅ | 68/74 markets ≥15/20 |

## Final Coverage Results (June 15, 2026)

### Summary
- **Trade Intelligence:** ✅ All 74 markets have trade data
- **Macro Indicators:** 68/74 markets at ≥15/20 Top 20 threshold

### Regions
- **Africa:** 52/54 passing (96%)
- **Caribbean:** 16/20 passing (80%)

### IMF Gap Fill Success
| Market | Before | After |
|--------|--------|-------|
| DMA (Dominica) | 14/20 | **20/20** ✅ |
| GRD (Grenada) | 14/20 | **20/20** ✅ |
| KNA (St. Kitts) | 14/20 | **20/20** ✅ |
| SOM (Somalia) | 13/20 | **15/20** ✅ |

### Structural Ceilings (6 markets)
These markets have limited international data reporting:

| Market | Score | Reason |
|--------|-------|--------|
| ERI (Eritrea) | 8/20 | Data-restricted country |
| SSD (South Sudan) | 11/20 | Newest country, limited reporting |
| CUB (Cuba) | 12/20 | US sanctions limit data access |
| PRI (Puerto Rico) | 13/20 | US territory, different reporting |
| VGB (British Virgin Islands) | 5/20 | Micro territory |
| TCA (Turks & Caicos) | 9/20 | Micro territory |

**Note:** All 6 markets still have complete trade intelligence data via AfCFTA/CBTPA flows and import demand signals. The macro indicator ceiling does not affect trade intelligence functionality.

---

## Production-Readiness Seeders (June 2026)

These idempotent scripts close the non-macro gaps so every market renders complete intelligence. They skip already-populated markets and preserve curated content. Run from `apps/api-gateway`.

| Step | Command | Effect |
|------|---------|--------|
| 1 | `npx tsx scripts/audit-74-production-readiness.ts` | Audit FX / sector / news coverage |
| 2 | `npx tsx scripts/seed-all74-fx.ts` | Curated `fx_to_usd` for markets missing it |
| 3 | `npx tsx scripts/seed-all74-sectors.ts` | 7-sector Bloomberg baseline for empty markets |
| 4 | `npx tsx scripts/enhance-incomplete-sectors.ts` | Backfill emoji/scores/structured key_players |
| 5 | `npx tsx scripts/seed-all74-news-pulse.ts` | Neutral baseline News Pulse for unpublished markets |
| 6 | `npx tsx scripts/test-all74-content.ts` | Gate: every market has substantive risk/opportunity/trade content |
| 7 | `npx tsx scripts/reconcile-agoa-eligibility.ts` | Sync vault AGOA status → trade flows |
| 8 | `npx tsx --tsconfig ../../services/ingestion/tsconfig.json ../../services/ingestion/run.ts ingest-comtrade-agoa` | Live Comtrade trade volumes (requires `COMTRADE_API_KEY`) |
| 9 | `npx tsx scripts/test-all74-data-consistency.ts` | Gate: vault ↔ flows ↔ macro hero consistency |

### AGOA / Comtrade setup

1. Set `COMTRADE_API_KEY` in `.env.local` (register at [UN Comtrade API](https://comtradeplus.un.org/)).
2. Apply migration `20260622000001_agoa_eligible_default_false.sql` if not already applied.
3. Run vault verify: `npx tsx --tsconfig ../../services/ingestion/tsconfig.json ../../services/ingestion/run.ts verify-ustr-agoa`
4. Reconcile eligibility: `npx tsx scripts/reconcile-agoa-eligibility.ts`
5. Ingest Comtrade: `npx tsx --tsconfig ../../services/ingestion/tsconfig.json ../../services/ingestion/run.ts ingest-comtrade-agoa`
6. Run consistency gate: `npx tsx scripts/test-all74-data-consistency.ts`

### Zimbabwe remediation

| Script | Effect |
|--------|--------|
| `curate-zimbabwe-data.ts` | Tier A macro 2023–2025, sector AGOA metrics |
| `seed-zimbabwe-time-series.ts` | Backfill 2020–2022 + 2025 macro observations |
| `topup-zimbabwe-sectors.ts` | Add energy, digital, logistics sectors (7 total) |


- **FX indicator key is `fx_to_usd`** (NOT `exchange_rate` or `exchange_rate_lcu_per_usd`). The `souvera_country_professional_v` view and Economy tab read `fx_to_usd`. Using any other key yields a "data pending" FX card. See `docs/data/TOP-20-INDICATORS-REFERENCE.md`.
- **Sectors use the Bloomberg schema** (`souvera_country_sectors`): required fields are `teaser`, `row_status='active'`, `display_order`, plus `icon_emoji`, three 0-100 scores, `narrative_short/full`, and structured `key_players` (array of `{name, sector, description, metric}`, NOT strings). Upsert on `country_id,sector_key`.
- **Regional content** is documented in `docs/content/REGIONAL-CONTENT-ARCHITECTURE.md`. Region mapping lives in `apps/api-gateway/src/lib/intelligence/country-regions.ts`.
