/**
 * IMF DataMapper fill for rollout Top 20 gaps (BRB, SEN, CIV, TZA).
 * Run: npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts imf-rollout-gap-fill
 */

import { getSupabaseServiceClient } from '@souvera/config';
import { BARBADOS_TRADE } from '../../apps/api-gateway/src/data/caribbean-wave2-trade';
import { ROLLOUT_CURATED_RESERVES_USD } from './config/rollout-reserves-curated';
import { fetchImfDataMapperSeries } from './imf-datamapper-client';
import { archivePayload, closeIngestionJob, createIngestionJob, updateSourceHealth } from './shared';

const ROLLOUT_GAP_ISO3 = ['BRB', 'SEN', 'CIV', 'TZA'] as const;

/** IMF DataMapper indicator id → Souvera observation key */
const DIRECT_MAPPINGS: Array<{ imfId: string; indicatorKey: string }> = [
  { imfId: 'BCA_NGDPD', indicatorKey: 'current_account_pct_gdp' },
  { imfId: 'BRASS_MI', indicatorKey: 'reserves_months_imports' },
  { imfId: 'GGXWDG_NGDP', indicatorKey: 'debt_to_gdp_pct' },
  { imfId: 'GGXCNL_NGDP', indicatorKey: 'fiscal_balance_pct_gdp' },
];

export async function ingestImfRolloutGapFill(): Promise<void> {
  console.log('\n[imf-rollout-gap-fill] IMF DataMapper → rollout macro gaps...\n');

  const { jobId, sourceId } = await createIngestionJob('imf_dataservices', 'imf_rollout_gap_fill');
  const start = Date.now();
  let processed = 0;
  let failed = 0;
  let archived = false;

  const supabase = getSupabaseServiceClient();

  try {
    const { data: countries, error: countryErr } = await supabase
      .from('souvera_countries')
      .select('id, iso3')
      .in('iso3', [...ROLLOUT_GAP_ISO3]);
    if (countryErr) throw new Error(countryErr.message);

    const { data: indicators, error: indErr } = await supabase.from('souvera_indicators').select('id, key');
    if (indErr) throw new Error(indErr.message);
    const indicatorMap = new Map((indicators ?? []).map((i) => [i.key, i.id]));

    for (const country of countries ?? []) {
      console.log(`[imf-rollout-gap-fill] ${country.iso3}...`);

      const gdpByYear = new Map(
        (await fetchImfDataMapperSeries('NGDPD', country.iso3)).map((r) => [r.year, r.value])
      );
      const importsPctByYear = new Map(
        (await fetchImfDataMapperSeries('BM_GDP', country.iso3)).map((r) => [r.year, r.value])
      );
      const reservesMonthsByYear = new Map<number, number>();
      for (const imfMonthsId of ['BRASS_MI', 'Reserves_M'] as const) {
        for (const row of await fetchImfDataMapperSeries(imfMonthsId, country.iso3)) {
          if (!reservesMonthsByYear.has(row.year)) reservesMonthsByYear.set(row.year, row.value);
        }
      }

      for (const { imfId, indicatorKey } of DIRECT_MAPPINGS) {
        const indicatorId = indicatorMap.get(indicatorKey);
        if (!indicatorId) {
          failed++;
          continue;
        }

        const series = await fetchImfDataMapperSeries(imfId, country.iso3);
        if (!series.length) continue;

        if (!archived) {
          await archivePayload(
            sourceId,
            `imf-datamapper://${imfId}/${country.iso3}`,
            { imfId, iso3: country.iso3 },
            { count: series.length },
            200
          );
          archived = true;
        }

        for (const row of series) {
          const err = await upsertObservation(supabase, {
            countryId: country.id,
            indicatorId,
            sourceId,
            year: row.year,
            value: row.value,
            seriesKey: `IMF.DM.${imfId}`,
          });
          if (err) failed++;
          else processed++;
        }

        await delay(80);
      }

      // Derived reserves_total_usd when IMF months-of-imports + GDP/import share available
      const reservesIndicatorId = indicatorMap.get('reserves_total_usd');
      if (reservesIndicatorId) {
        for (const year of reservesMonthsByYear.keys()) {
          const months = reservesMonthsByYear.get(year);
          const gdpBillions = gdpByYear.get(year);
          const importPct = importsPctByYear.get(year);
          if (months == null || gdpBillions == null || importPct == null) continue;

          const annualImportsUsd = gdpBillions * 1e9 * (importPct / 100);
          const reservesUsd = months * (annualImportsUsd / 12);

          const err = await upsertObservation(supabase, {
            countryId: country.id,
            indicatorId: reservesIndicatorId,
            sourceId,
            year,
            value: reservesUsd,
            seriesKey: 'IMF.DM.derived_reserves_usd',
            isEstimate: true,
            qualityScore: 0.78,
          });
          if (err) failed++;
          else processed++;
        }
      }

      // IMF IFS / Article IV reserves where WB has no USD series (SEN, CIV)
      const curatedReserves = ROLLOUT_CURATED_RESERVES_USD[country.iso3];
      if (reservesIndicatorId && curatedReserves?.length) {
        for (const point of curatedReserves) {
          const err = await upsertObservation(supabase, {
            countryId: country.id,
            indicatorId: reservesIndicatorId,
            sourceId,
            year: point.year,
            value: point.valueUsd,
            seriesKey: 'IMF.IFS.curated_reserves_usd',
            isEstimate: true,
            qualityScore: 0.8,
          });
          if (err) failed++;
          else processed++;

          const monthsIndicatorId = indicatorMap.get('reserves_months_imports');
          const importPct = importsPctByYear.get(point.year);
          const gdpBillions = gdpByYear.get(point.year);
          if (monthsIndicatorId && importPct != null && gdpBillions != null) {
            const annualImportsUsd = gdpBillions * 1e9 * (importPct / 100);
            if (annualImportsUsd > 0) {
              const months = (point.valueUsd / annualImportsUsd) * 12;
              const monthsErr = await upsertObservation(supabase, {
                countryId: country.id,
                indicatorId: monthsIndicatorId,
                sourceId,
                year: point.year,
                value: months,
                seriesKey: 'IMF.DM.derived_reserves_months_curated',
                isEstimate: true,
                qualityScore: 0.78,
              });
              if (monthsErr) failed++;
              else processed++;
            }
          }
        }
      }

      // Derived reserves_months_imports from existing WB reserves + IMF import share or curated trade
      const monthsIndicatorId = indicatorMap.get('reserves_months_imports');
      if (monthsIndicatorId && !reservesMonthsByYear.size && reservesIndicatorId) {
        const { data: existingReserves } = await supabase
          .from('souvera_country_observations')
          .select('period_date, value_numeric')
          .eq('country_id', country.id)
          .eq('indicator_id', reservesIndicatorId)
          .gte('period_date', '2020-01-01');

        for (const obs of existingReserves ?? []) {
          const year = Number(obs.period_date.slice(0, 4));
          const gdpBillions = gdpByYear.get(year);
          const importPct = importsPctByYear.get(year);
          if (obs.value_numeric == null || gdpBillions == null || importPct == null) continue;

          const annualImportsUsd = gdpBillions * 1e9 * (importPct / 100);
          if (annualImportsUsd <= 0) continue;
          const months = (obs.value_numeric / annualImportsUsd) * 12;

          const err = await upsertObservation(supabase, {
            countryId: country.id,
            indicatorId: monthsIndicatorId,
            sourceId,
            year,
            value: months,
            seriesKey: 'IMF.DM.derived_reserves_months',
            isEstimate: true,
            qualityScore: 0.78,
          });
          if (err) failed++;
          else processed++;
        }
      }

      // BRB: derive months from WB reserves + curated trade imports when IMF has no BM_GDP
      if (country.iso3 === 'BRB' && monthsIndicatorId && reservesIndicatorId && !reservesMonthsByYear.size) {
        const tradeYear = BARBADOS_TRADE.exportsToUs?.year ?? 2024;
        const annualImports = BARBADOS_TRADE.importsUsd;
        if (annualImports && annualImports > 0) {
          const { data: brbReserves } = await supabase
            .from('souvera_country_observations')
            .select('period_date, value_numeric')
            .eq('country_id', country.id)
            .eq('indicator_id', reservesIndicatorId)
            .gte('period_date', '2020-01-01');

          for (const obs of brbReserves ?? []) {
            const year = Number(obs.period_date.slice(0, 4));
            if (obs.value_numeric == null || year !== tradeYear) continue;
            const months = (obs.value_numeric / annualImports) * 12;
            const err = await upsertObservation(supabase, {
              countryId: country.id,
              indicatorId: monthsIndicatorId,
              sourceId,
              year,
              value: months,
              seriesKey: 'IMF.DM.derived_reserves_months_trade',
              isEstimate: true,
              qualityScore: 0.78,
            });
            if (err) failed++;
            else processed++;
          }
        }
      }
    }

    console.log(`\n[imf-rollout-gap-fill] Done: ${processed} upserts, ${failed} failures`);
    await updateSourceHealth(sourceId, failed < processed, Date.now() - start);
    await closeIngestionJob(jobId, failed > processed ? 'partial' : 'succeeded', processed, failed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateSourceHealth(sourceId, false, Date.now() - start);
    await closeIngestionJob(jobId, 'failed', processed, failed, msg);
    throw err;
  }
}

async function upsertObservation(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  args: {
    countryId: string;
    indicatorId: string;
    sourceId: string;
    year: number;
    value: number;
    seriesKey: string;
    isEstimate?: boolean;
    qualityScore?: number;
  }
): Promise<boolean> {
  const { error } = await supabase.from('souvera_country_observations').upsert(
    {
      country_id: args.countryId,
      indicator_id: args.indicatorId,
      period_date: `${args.year}-01-01`,
      period_type: 'annual',
      value_numeric: args.value,
      source_id: args.sourceId,
      source_series_key: args.seriesKey,
      is_forecast: false,
      is_estimate: args.isEstimate ?? false,
      quality_score: args.qualityScore ?? 0.88,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: 'country_id,indicator_id,period_date,source_id' }
  );
  return !!error;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
