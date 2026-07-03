/**
 * IMF WEO macro gap-fill for markets World Bank under-reports + 2025 latest-year fill.
 *
 * Phase: data-consistency audit (2026-06). The platform audit
 * (apps/api-gateway/scripts/audit-data-consistency.ts) flagged a handful of covered
 * markets where World Bank publishes no GDP / growth / CPI series, plus a broad
 * "no 2025 yet" gap (WB publishes annual actuals with a lag). IMF WEO (via DataMapper)
 * carries authoritative estimates for IMF members, including a 2025 estimate.
 *
 * SAFE BY DESIGN — purely additive gap-fill:
 *   - Writes ONLY (market, indicator, year) cells that are currently MISSING in the DB.
 *     It never overwrites an existing World Bank actual or a curated value, and never
 *     creates a duplicate-source row for a year a market already carries (so the 2025
 *     frontier fills only where absent).
 *   - Uses the imf_dataservices source so rows are traceable; the latest-observation
 *     view resolves by period_date then fetched_at.
 *   - 2024/2025 cells are flagged is_estimate=true (WEO estimate vintage).
 *
 * Series mapping:
 *   NGDPD (USD bn)     → gdp_current_usd      (×1e9)
 *   NGDP_RPCH (%)      → gdp_growth_pct
 *   PCPIEPCH (%)       → inflation_cpi_pct
 *
 * Targets resolved from the audit (IMF-fillable only — CUB/VGB/TCA/CYM/ERI have no
 * usable WEO series and are intentionally excluded; they get a UI "not reported" state).
 *
 * Run (dry):  IMF_BACKFILL_DRY=1 npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts imf-macro-backfill
 * Run (live):              npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts imf-macro-backfill
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
// The parseable env file with Supabase keys is apps/api-gateway/.env.local (the repo-root
// .env.local is free-form notes). Resolve deterministically so cwd doesn't matter.
dotenv.config({ path: path.resolve(__dirname, '../../apps/api-gateway/.env.local') });

import { getSupabaseServiceClient } from '@souvera/config';
import { fetchImfDataMapperSeries } from './imf-datamapper-client';
import { closeIngestionJob, createIngestionJob, updateSourceHealth } from './shared';

// Souvera's covered scope: 54 African + 20 Caribbean = 74 markets (see market-coverage.ts).
const COVERED_ISO3 = [
  'MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN',
  'NGA', 'GHA', 'SEN', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR', 'CIV', 'TGO', 'BEN', 'GMB', 'GNB', 'CPV', 'MRT',
  'ETH', 'KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SOM', 'DJI', 'ERI', 'MDG', 'COM', 'MUS', 'SYC', 'SSD',
  'CMR', 'CAF', 'COD', 'COG', 'GAB', 'GNQ', 'STP', 'TCD', 'AGO',
  'ZAF', 'BWA', 'LSO', 'SWZ', 'NAM', 'ZWE', 'MOZ', 'ZMB', 'MWI',
  'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA', 'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ',
  'PRI', 'VGB', 'TCA', 'CYM',
];

const rawTargets = (process.env.IMF_BACKFILL_ISO3 || 'ALL').trim().toUpperCase();
const TARGET_ISO3 = rawTargets === 'ALL'
  ? COVERED_ISO3
  : rawTargets.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);

const DRY = process.env.IMF_BACKFILL_DRY === '1';
const CURRENT_YEAR = 2025;
const MIN_YEAR = 2018;

/** indicator_key → { imfSeries, scale } */
const SERIES: Array<{ key: string; imf: string; scale: number; series: string }> = [
  { key: 'gdp_current_usd', imf: 'NGDPD', scale: 1e9, series: 'IMF.WEO.NGDPD' },
  { key: 'gdp_growth_pct', imf: 'NGDP_RPCH', scale: 1, series: 'IMF.WEO.NGDP_RPCH' },
  { key: 'inflation_cpi_pct', imf: 'PCPIEPCH', scale: 1, series: 'IMF.WEO.PCPIEPCH' },
];

export async function ingestImfMacroBackfill(): Promise<void> {
  console.log(`\n[imf-macro-backfill] Targets: ${TARGET_ISO3.join(', ')} · mode: ${DRY ? 'DRY RUN' : 'LIVE'}\n`);

  const { jobId, sourceId } = await createIngestionJob('imf_dataservices', 'imf_macro_backfill');
  const start = Date.now();
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  const supabase = getSupabaseServiceClient();

  try {
    const { data: countries, error: cErr } = await supabase
      .from('souvera_countries')
      .select('id, iso3, name')
      .in('iso3', TARGET_ISO3);
    if (cErr) throw new Error(cErr.message);

    const { data: indicators, error: iErr } = await supabase
      .from('souvera_indicators')
      .select('id, key')
      .in('key', SERIES.map((s) => s.key));
    if (iErr) throw new Error(iErr.message);
    const indId = new Map((indicators ?? []).map((i) => [String(i.key), String(i.id)]));

    for (const country of countries ?? []) {
      console.log(`\n[imf-macro-backfill] ${country.iso3} (${country.name})`);

      for (const s of SERIES) {
        const indicatorId = indId.get(s.key);
        if (!indicatorId) { console.warn(`  ✗ no indicator row for ${s.key}`); continue; }

        // Years already present in DB (any source) — these are the actuals we protect.
        const { data: existing } = await supabase
          .from('souvera_country_observations')
          .select('period_date, value_numeric')
          .eq('country_id', country.id)
          .eq('indicator_id', indicatorId)
          .eq('period_type', 'annual');
        const presentYears = new Set(
          (existing ?? [])
            .filter((r) => r.value_numeric != null)
            .map((r) => Number(String(r.period_date).slice(0, 4)))
        );

        const imfSeries = await fetchImfDataMapperSeries(s.imf, country.iso3, MIN_YEAR, CURRENT_YEAR);
        await delay(120);
        if (!imfSeries.length) { console.log(`  ${s.key}: IMF ${s.imf} → no data`); continue; }

        let wrote = 0;
        for (const point of imfSeries) {
          // Pure gap-fill: only write a (market, indicator, year) cell that is missing
          // in the DB. This fills the 2025 frontier for markets that lack it without
          // creating duplicate-source rows for markets that already carry 2025.
          if (presentYears.has(point.year)) { skipped++; continue; }

          const value = point.value * s.scale;
          if (!Number.isFinite(value)) { skipped++; continue; }

          if (DRY) {
            wrote++;
            continue;
          }

          const { error } = await supabase.from('souvera_country_observations').upsert(
            {
              country_id: country.id,
              indicator_id: indicatorId,
              period_date: `${point.year}-01-01`,
              period_type: 'annual',
              value_numeric: value,
              source_id: sourceId,
              source_series_key: s.series,
              is_forecast: false,
              is_estimate: point.year >= 2024,
              quality_score: 0.85,
              fetched_at: new Date().toISOString(),
            },
            { onConflict: 'country_id,indicator_id,period_date,source_id' }
          );
          if (error) { failed++; console.warn(`  ✗ ${s.key} ${point.year}: ${error.message}`); }
          else { processed++; wrote++; }
        }
        if (wrote > 0) {
          console.log(`  ${s.key.padEnd(20)} IMF ${imfSeries.length}y → ${wrote} ${DRY ? 'would-write' : 'written'} (gap-fill)`);
        }
      }
      await delay(250);
    }

    console.log(`\n[imf-macro-backfill] ${DRY ? 'DRY ' : ''}Done: ${processed} written, ${skipped} skipped (existing actuals protected), ${failed} failed\n`);
    await updateSourceHealth(sourceId, failed <= processed, Date.now() - start);
    await closeIngestionJob(jobId, failed > processed ? 'partial' : 'succeeded', processed, failed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateSourceHealth(sourceId, false, Date.now() - start);
    await closeIngestionJob(jobId, 'failed', processed, failed, msg);
    throw err;
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

if (require.main === module) {
  ingestImfMacroBackfill().catch((e) => { console.error(e); process.exit(1); });
}
