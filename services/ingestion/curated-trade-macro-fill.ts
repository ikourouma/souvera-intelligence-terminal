/**
 * Bridge curated trade modules → macro observations where World Bank has no country series.
 * Sources documented in src/data/*-trade.ts (UN Comtrade, national stats).
 *
 * Run: npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts curated-trade-macro-fill
 */

import { getSupabaseServiceClient } from '@souvera/config';
import { NIGERIA_TRADE } from '../../apps/api-gateway/src/data/nigeria-trade';
import { JAMAICA_TRADE } from '../../apps/api-gateway/src/data/jamaica-trade';
import {
  TRINIDAD_TOBAGO_TRADE,
  BARBADOS_TRADE,
} from '../../apps/api-gateway/src/data/caribbean-wave2-trade';
import type { CountryTrade } from '../../apps/api-gateway/src/types/country-intelligence';
import { closeIngestionJob, createIngestionJob, updateSourceHealth } from './shared';

const CURATED_TRADE_ROWS: Array<{ iso3: string; trade: CountryTrade }> = [
  { iso3: 'NGA', trade: NIGERIA_TRADE },
  { iso3: 'JAM', trade: JAMAICA_TRADE },
  { iso3: 'TTO', trade: TRINIDAD_TOBAGO_TRADE },
  { iso3: 'BRB', trade: BARBADOS_TRADE },
];

function resolveAsOfYear(trade: CountryTrade): number {
  return trade.exportsToUs?.year ?? trade.importsFromUs?.year ?? 2024;
}

export async function ingestCuratedTradeMacroFill(): Promise<void> {
  console.log('\n[curated-trade-macro-fill] Curated trade → macro observations...\n');

  const { jobId, sourceId } = await createIngestionJob('un_comtrade', 'curated_trade_macro_fill');
  const start = Date.now();
  let processed = 0;
  let failed = 0;

  const supabase = getSupabaseServiceClient();

  try {
    const { data: indicators, error: indErr } = await supabase.from('souvera_indicators').select('id, key');
    if (indErr) throw new Error(indErr.message);
    const indicatorMap = new Map((indicators ?? []).map((i) => [i.key, i.id]));

    for (const { iso3, trade } of CURATED_TRADE_ROWS) {
      if ('pending' in trade && trade.pending) continue;
      if (trade.exportsUsd == null || trade.importsUsd == null) continue;

      const { data: country, error: countryErr } = await supabase
        .from('souvera_countries')
        .select('id')
        .eq('iso3', iso3)
        .maybeSingle();

      if (countryErr || !country) {
        console.warn(`[curated-trade-macro-fill] ${iso3}: country missing`);
        failed++;
        continue;
      }

      const year = resolveAsOfYear(trade);
      const periodDate = `${year}-01-01`;

      const rows: Array<{ key: string; value: number }> = [
        { key: 'exports_goods_services_usd', value: trade.exportsUsd },
        { key: 'imports_goods_services_usd', value: trade.importsUsd },
      ];

      const { data: gdpObs } = await supabase
        .from('souvera_country_observations')
        .select('value_numeric, souvera_indicators(key)')
        .eq('country_id', country.id)
        .eq('period_date', periodDate)
        .limit(50);

      const gdp =
        gdpObs?.find((o) => (o.souvera_indicators as { key: string } | null)?.key === 'gdp_current_usd')
          ?.value_numeric ?? null;

      if (gdp && gdp > 0) {
        rows.push({
          key: 'trade_pct_gdp',
          value: ((trade.exportsUsd + trade.importsUsd) / gdp) * 100,
        });
      }

      for (const row of rows) {
        const indicatorId = indicatorMap.get(row.key);
        if (!indicatorId) {
          failed++;
          continue;
        }

        const { error } = await supabase.from('souvera_country_observations').upsert(
          {
            country_id: country.id,
            indicator_id: indicatorId,
            period_date: periodDate,
            period_type: 'annual',
            value_numeric: row.value,
            source_id: sourceId,
            source_series_key: `curated_trade:${iso3}:${row.key}`,
            is_forecast: false,
            is_estimate: true,
            quality_score: 0.75,
            fetched_at: new Date().toISOString(),
          },
          { onConflict: 'country_id,indicator_id,period_date,source_id' }
        );

        if (error) {
          console.error(`[curated-trade-macro-fill] ${iso3} ${row.key}:`, error.message);
          failed++;
        } else {
          processed++;
        }
      }

      console.log(`[curated-trade-macro-fill] ${iso3}: ${rows.length} indicators @ ${year}`);
    }

    await updateSourceHealth(sourceId, true, Date.now() - start);
    await closeIngestionJob(jobId, failed > 0 ? 'partial' : 'succeeded', processed, failed);
    console.log(`\n[curated-trade-macro-fill] Done: ${processed} upserts, ${failed} failures`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateSourceHealth(sourceId, false, Date.now() - start);
    await closeIngestionJob(jobId, 'failed', processed, failed, msg);
    throw err;
  }
}
