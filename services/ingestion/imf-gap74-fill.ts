/**
 * Phase 0X — IMF DataMapper gap fill for markets below the ≥15/20 Top 20 gate.
 *
 * Targets: DMA, GRD, KNA (14/20 → need 1 more) and SOM (13/20 → need 2 more).
 * Strategy: same derivation pattern as imf-rollout-gap-fill.ts —
 *   imports_goods_services_usd  = NGDPD (USD bn) × BM_GDP (%) / 100
 *   exports_goods_services_usd  = imports − current_account_usd  (BOP identity, approximate)
 *   trade_pct_gdp               = (exports + imports) / GDP × 100
 *   reserves_months_imports     = BRASS_MI (direct from IMF)
 *   current_account_pct_gdp     = BCA_NGDPD (direct from IMF)
 *
 * Run: npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts imf-gap74-fill
 */

import { getSupabaseServiceClient } from '@souvera/config';
import { fetchImfDataMapperSeries } from './imf-datamapper-client';
import { archivePayload, closeIngestionJob, createIngestionJob, updateSourceHealth } from './shared';

/**
 * Markets to target.  Only actionable via IMF derivation — WB has no data for
 * the missing keys (confirmed by diagnose-gap74-markets.ts 2026-06-10).
 */
const GAP74_ISO3 = ['DMA', 'GRD', 'KNA', 'SOM'] as const;

export async function ingestImfGap74Fill(): Promise<void> {
  console.log('\n[imf-gap74-fill] IMF DataMapper → 0X gap markets...\n');

  const { jobId, sourceId } = await createIngestionJob('imf_dataservices', 'imf_gap74_fill');
  const start = Date.now();
  let processed = 0;
  let failed = 0;

  const supabase = getSupabaseServiceClient();

  try {
    const { data: countries, error: countryErr } = await supabase
      .from('souvera_countries')
      .select('id, iso3, name')
      .in('iso3', [...GAP74_ISO3]);
    if (countryErr) throw new Error(countryErr.message);

    const { data: indicators, error: indErr } = await supabase.from('souvera_indicators').select('id, key');
    if (indErr) throw new Error(indErr.message);
    const indicatorMap = new Map((indicators ?? []).map((i) => [i.key, i.id]));

    for (const country of countries ?? []) {
      console.log(`\n[imf-gap74-fill] ${country.iso3} (${country.name})...`);

      // ── 1. Fetch raw IMF series ───────────────────────────────────────────────
      const gdpSeries = await fetchImfDataMapperSeries('NGDPD', country.iso3);
      const importsPctSeries = await fetchImfDataMapperSeries('BM_GDP', country.iso3);
      const bca_pctSeries = await fetchImfDataMapperSeries('BCA_NGDPD', country.iso3);
      const reservesMonthsSeries = await fetchImfDataMapperSeries('BRASS_MI', country.iso3);
      // Inflation — IMF CPI growth series (WEO PCPIEPCH)
      const inflationSeries = await fetchImfDataMapperSeries('PCPIEPCH', country.iso3);

      await delay(150);

      const gdpMap      = new Map(gdpSeries.map((r) => [r.year, r.value]));
      const impPctMap   = new Map(importsPctSeries.map((r) => [r.year, r.value]));
      const bcaPctMap   = new Map(bca_pctSeries.map((r) => [r.year, r.value]));
      const resMosMap   = new Map(reservesMonthsSeries.map((r) => [r.year, r.value]));
      const infMap      = new Map(inflationSeries.map((r) => [r.year, r.value]));

      const years = new Set([
        ...gdpMap.keys(),
        ...impPctMap.keys(),
        ...bcaPctMap.keys(),
        ...resMosMap.keys(),
        ...infMap.keys(),
      ]);

      let loggedSeries = false;

      for (const year of [...years].filter((y) => y >= 2019 && y <= 2024).sort()) {
        const gdpBn    = gdpMap.get(year);
        const impPct   = impPctMap.get(year);
        const bcaPct   = bcaPctMap.get(year);
        const resMos   = resMosMap.get(year);
        const infl     = infMap.get(year);

        const gdpUsd   = gdpBn != null ? gdpBn * 1e9 : null;
        const impUsd   = gdpUsd != null && impPct != null ? gdpUsd * (impPct / 100) : null;
        const bcaUsd   = gdpUsd != null && bcaPct != null ? gdpUsd * (bcaPct / 100) : null;
        // BOP identity: X ≈ M + CA  (approximate — excludes secondary income transfers)
        const expUsd   = impUsd != null && bcaUsd != null ? impUsd + bcaUsd : null;
        const tradePct = gdpUsd != null && impUsd != null && expUsd != null
          ? ((impUsd + expUsd) / gdpUsd) * 100
          : null;

        if (!loggedSeries) {
          console.log(
            `  IMF series available: GDP=${gdpBn != null}, BM_GDP=${impPct != null}, ` +
            `BCA=${bcaPct != null}, BRASS_MI=${resMos != null}, PCPIEPCH=${infl != null}`
          );
          loggedSeries = true;
        }

        // ── upsert helpers ────────────────────────────────────────────────────
        const upsert = async (key: string, value: number | null, seriesKey: string, isEst = false, qs = 0.82) => {
          if (value == null || !Number.isFinite(value)) return;
          const indicatorId = indicatorMap.get(key);
          if (!indicatorId) return;
          const { error } = await supabase.from('souvera_country_observations').upsert(
            {
              country_id: country.id,
              indicator_id: indicatorId,
              period_date: `${year}-01-01`,
              period_type: 'annual',
              value_numeric: value,
              source_id: sourceId,
              source_series_key: seriesKey,
              is_forecast: false,
              is_estimate: isEst,
              quality_score: qs,
              fetched_at: new Date().toISOString(),
            },
            { onConflict: 'country_id,indicator_id,period_date,source_id' }
          );
          if (error) { failed++; console.warn(`  ✗ ${key} ${year}: ${error.message}`); }
          else { processed++; }
        };

        await upsert('current_account_pct_gdp', bcaPct ?? null, 'IMF.WEO.BCA_NGDPD',  false, 0.88);
        await upsert('imports_goods_services_usd', impUsd,        'IMF.WEO.derived.BM_GDP_x_NGDPD', true, 0.80);
        await upsert('exports_goods_services_usd', expUsd,        'IMF.WEO.derived.BCA_x_M',        true, 0.76);
        await upsert('trade_pct_gdp',              tradePct,      'IMF.WEO.derived.trade_pct',       true, 0.76);
        await upsert('reserves_months_imports',    resMos ?? null,'IMF.WEO.BRASS_MI',                false, 0.88);
        await upsert('inflation_cpi_pct',          infl  ?? null, 'IMF.WEO.PCPIEPCH',                false, 0.88);

        await delay(60);
      }

      // ── Derive reserves_total_usd from months×imports if not in DB ──────────
      const resId = indicatorMap.get('reserves_total_usd');
      const impId = indicatorMap.get('imports_goods_services_usd');
      if (resId && impId) {
        const { data: impObs } = await supabase
          .from('souvera_country_observations')
          .select('period_date, value_numeric')
          .eq('country_id', country.id)
          .eq('indicator_id', impId)
          .gte('period_date', '2019-01-01');

        for (const obs of impObs ?? []) {
          const year = Number(obs.period_date.slice(0, 4));
          const months = resMosMap.get(year);
          if (months == null || obs.value_numeric == null) continue;
          const reservesUsd = months * (obs.value_numeric / 12);
          const { error } = await supabase.from('souvera_country_observations').upsert(
            {
              country_id: country.id,
              indicator_id: resId,
              period_date: `${year}-01-01`,
              period_type: 'annual',
              value_numeric: reservesUsd,
              source_id: sourceId,
              source_series_key: 'IMF.WEO.derived.reserves_usd',
              is_forecast: false,
              is_estimate: true,
              quality_score: 0.78,
              fetched_at: new Date().toISOString(),
            },
            { onConflict: 'country_id,indicator_id,period_date,source_id' }
          );
          if (error) failed++;
          else processed++;
        }
      }

      console.log(`  ${country.iso3}: ${processed} obs processed so far`);
      await delay(300);
    }

    await archivePayload(
      sourceId,
      'imf-datamapper://NGDPD,BM_GDP,BCA_NGDPD,BRASS_MI,PCPIEPCH/DMA,GRD,KNA,SOM',
      { targets: [...GAP74_ISO3] },
      { processed, failed },
      200
    );

    console.log(`\n[imf-gap74-fill] Done: ${processed} upserts, ${failed} failures`);
    await updateSourceHealth(sourceId, failed < processed, Date.now() - start);
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
