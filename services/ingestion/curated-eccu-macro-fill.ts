/**
 * Curated macro fill for ECCU markets (DMA, GRD, KNA) where WB and IMF DataMapper
 * have no coverage for the remaining Top 20 keys.
 *
 * Source data: caribbean-eccu-macro.ts (IMF A4 2023, ECCB 2022, IEA 2022).
 * Fills: exports_goods_services_usd, imports_goods_services_usd, trade_pct_gdp,
 *        unemployment_pct, co2_emissions_per_capita, reserves_months_imports (derived).
 *
 * Run: npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts curated-eccu-macro-fill
 */

import { getSupabaseServiceClient } from '@souvera/config';
import { ECCU_MACRO } from '../../apps/api-gateway/src/data/caribbean-eccu-macro';
import { archivePayload, closeIngestionJob, createIngestionJob, updateSourceHealth } from './shared';

export async function ingestCuratedEccuMacroFill(): Promise<void> {
  console.log('\n[curated-eccu-macro-fill] ECCU curated macro → observations...\n');

  const { jobId, sourceId } = await createIngestionJob('un_comtrade', 'curated_eccu_macro_fill');
  const start = Date.now();
  let processed = 0;
  let failed = 0;

  const supabase = getSupabaseServiceClient();

  const { data: indicators, error: indErr } = await supabase.from('souvera_indicators').select('id, key');
  if (indErr) throw new Error(indErr.message);
  const indicatorMap = new Map((indicators ?? []).map((i) => [i.key, i.id]));

  try {
    for (const [iso3, points] of Object.entries(ECCU_MACRO)) {
      const { data: country } = await supabase
        .from('souvera_countries')
        .select('id')
        .eq('iso3', iso3)
        .maybeSingle();

      if (!country) {
        console.warn(`[curated-eccu-macro-fill] ${iso3}: country row missing`);
        continue;
      }

      console.log(`[curated-eccu-macro-fill] ${iso3}...`);

      for (const pt of points) {
        const periodDate = `${pt.year}-01-01`;

        // Load the GDP we already have in DB to derive trade_pct_gdp accurately
        const gdpIndId = indicatorMap.get('gdp_current_usd');
        let gdpUsd: number | null = null;
        if (gdpIndId) {
          const { data: gdpObs } = await supabase
            .from('souvera_country_observations')
            .select('value_numeric')
            .eq('country_id', country.id)
            .eq('indicator_id', gdpIndId)
            .eq('period_date', periodDate)
            .maybeSingle();
          gdpUsd = gdpObs?.value_numeric ?? null;
        }

        const tradePctGdp =
          gdpUsd && gdpUsd > 0
            ? ((pt.exportsGoodsServicesUsd + pt.importsGoodsServicesUsd) / gdpUsd) * 100
            : null;

        // Load existing reserves_total_usd to derive reserves_months_imports
        const resIndId = indicatorMap.get('reserves_total_usd');
        let reservesUsd: number | null = null;
        if (resIndId) {
          const { data: resObs } = await supabase
            .from('souvera_country_observations')
            .select('value_numeric')
            .eq('country_id', country.id)
            .eq('indicator_id', resIndId)
            .eq('period_date', periodDate)
            .maybeSingle();
          reservesUsd = resObs?.value_numeric ?? null;
        }

        const reservesMonths =
          reservesUsd && pt.importsGoodsServicesUsd > 0
            ? reservesUsd / (pt.importsGoodsServicesUsd / 12)
            : null;

        const upserts: Array<{ key: string; value: number | null; seriesKey: string; qs: number }> = [
          { key: 'exports_goods_services_usd', value: pt.exportsGoodsServicesUsd, seriesKey: `IMF.A4.ECCU.exports.${pt.year}`, qs: 0.75 },
          { key: 'imports_goods_services_usd', value: pt.importsGoodsServicesUsd, seriesKey: `ECCB.annual.imports.${pt.year}`,  qs: 0.75 },
          { key: 'trade_pct_gdp',              value: tradePctGdp,                seriesKey: 'IMF.A4.ECCU.derived.trade_pct', qs: 0.72 },
          { key: 'unemployment_pct',           value: pt.unemploymentPct,         seriesKey: `ILO.ILOSTAT.unem.${pt.year}`,   qs: 0.78 },
          { key: 'co2_emissions_per_capita',   value: pt.co2EmissionsPerCapita,   seriesKey: `IEA.WEO.co2pc.${pt.year}`,      qs: 0.78 },
          { key: 'reserves_months_imports',    value: reservesMonths,             seriesKey: 'ECCB.derived.res_months',       qs: 0.72 },
        ];

        for (const { key, value, seriesKey, qs } of upserts) {
          if (value == null || !Number.isFinite(value)) continue;
          const indicatorId = indicatorMap.get(key);
          if (!indicatorId) continue;

          const { error } = await supabase.from('souvera_country_observations').upsert(
            {
              country_id: country.id,
              indicator_id: indicatorId,
              period_date: periodDate,
              period_type: 'annual',
              value_numeric: value,
              source_id: sourceId,
              source_series_key: seriesKey,
              is_forecast: false,
              is_estimate: true,
              quality_score: qs,
              fetched_at: new Date().toISOString(),
            },
            { onConflict: 'country_id,indicator_id,period_date,source_id' }
          );
          if (error) {
            console.warn(`  ✗ ${iso3} ${key} ${pt.year}: ${error.message}`);
            failed++;
          } else {
            processed++;
          }
        }

        console.log(`  ${iso3} ${pt.year}: exports=${ (pt.exportsGoodsServicesUsd/1e6).toFixed(0)}M, imports=${(pt.importsGoodsServicesUsd/1e6).toFixed(0)}M, trade=${tradePctGdp?.toFixed(1) ?? 'N/A'}%, res_months=${reservesMonths?.toFixed(1) ?? 'N/A'}`);
      }
    }

    await archivePayload(
      sourceId,
      'curated://IMF.A4.ECCU.2023/DMA,GRD,KNA',
      { markets: Object.keys(ECCU_MACRO) },
      { processed, failed },
      200
    );

    console.log(`\n[curated-eccu-macro-fill] Done: ${processed} upserts, ${failed} failures`);
    await updateSourceHealth(sourceId, failed < processed || failed === 0, Date.now() - start);
    await closeIngestionJob(jobId, failed > 0 && failed >= processed ? 'partial' : 'succeeded', processed, failed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateSourceHealth(sourceId, false, Date.now() - start);
    await closeIngestionJob(jobId, 'failed', processed, failed, msg);
    throw err;
  }
}
