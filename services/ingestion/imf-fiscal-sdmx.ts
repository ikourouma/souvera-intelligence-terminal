/**
 * IMF SDMX (WEO) — debt_to_gdp_pct + fiscal_balance_pct_gdp → souvera_country_observations.
 */

import { getSupabaseServiceClient } from '@souvera/config';
import { archivePayload, closeIngestionJob, createIngestionJob, updateSourceHealth } from './shared';
import { IMF_WEO_INDICATORS } from './config/verification-sources';
import { fetchImfDataMapperSeries } from './imf-datamapper-client';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../../apps/api-gateway/src/lib/market-coverage';

type ImfCompactResponse = {
  CompactData?: {
    DataSet?: {
      Series?: ImfSeries | ImfSeries[];
    };
  };
};

type ImfSeries = {
  '@REF_AREA'?: string;
  Obs?: ImfObs | ImfObs[];
};

type ImfObs = {
  '@TIME_PERIOD'?: string;
  '@OBS_VALUE'?: string;
};

const COVERAGE_ISO3 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];

export async function ingestImfFiscalSdmx(): Promise<void> {
  console.log('\n[imf-fiscal] IMF WEO fiscal/debt ingestion...\n');
  const { jobId, sourceId } = await createIngestionJob('imf_dataservices', 'imf_fiscal_sdmx');
  const start = Date.now();
  let processed = 0;
  let failed = 0;

  const supabase = getSupabaseServiceClient();

  try {
    await ensureIndicators(supabase);
    const countryMap = await getCountryMap(supabase);
    const indicatorMap = await getIndicatorMap(supabase);

    for (const [indicatorKey, weoCode] of Object.entries(IMF_WEO_INDICATORS)) {
      const indicatorId = indicatorMap.get(indicatorKey);
      if (!indicatorId) {
        console.warn(`[imf-fiscal] Missing indicator ${indicatorKey}`);
        continue;
      }

      const dmCode = IMF_DM_FISCAL_CODES[indicatorKey] ?? weoCode;

      for (const iso3 of COVERAGE_ISO3) {
        const countryId = countryMap.get(iso3);
        if (!countryId) continue;

        try {
          const series = await fetchImfDataMapperSeries(dmCode, iso3);
          if (!series.length) {
            failed++;
            continue;
          }
          if (processed === 0) {
            await archivePayload(
              sourceId,
              `imf-datamapper://${dmCode}/${iso3}`,
              { iso3, dmCode },
              { count: series.length },
              200
            );
          }

          for (const row of series) {
            const { error } = await supabase.from('souvera_country_observations').upsert(
              {
                country_id: countryId,
                indicator_id: indicatorId,
                period_date: `${row.year}-01-01`,
                period_type: 'annual',
                value_numeric: row.value,
                source_id: sourceId,
                source_series_key: `IMF.DM.${dmCode}`,
                is_forecast: false,
                is_estimate: false,
                quality_score: 0.88,
                fetched_at: new Date().toISOString(),
              },
              { onConflict: 'country_id,indicator_id,period_date,source_id' }
            );
            if (error) failed++;
            else processed++;
          }
          await new Promise((r) => setTimeout(r, 80));
        } catch {
          failed++;
        }
      }
      console.log(`[imf-fiscal] ${indicatorKey} pass complete`);
    }

    await updateSourceHealth(sourceId, failed < processed, Date.now() - start);
    await closeIngestionJob(
      jobId,
      failed > processed ? 'partial' : 'succeeded',
      processed,
      failed
    );
    console.log(`[imf-fiscal] ${processed} upserts, ${failed} failures`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateSourceHealth(sourceId, false, Date.now() - start);
    await closeIngestionJob(jobId, 'failed', processed, failed, msg);
    throw err;
  }
}

async function ensureIndicators(supabase: ReturnType<typeof getSupabaseServiceClient>): Promise<void> {
  const rows = [
    {
      key: 'debt_to_gdp_pct',
      label: 'General government gross debt (% of GDP)',
      domain: 'fiscal',
      unit: 'percent',
      preferred_source_key: 'imf_dataservices',
    },
    {
      key: 'fiscal_balance_pct_gdp',
      label: 'General government net lending/borrowing (% of GDP)',
      domain: 'fiscal',
      unit: 'percent',
      preferred_source_key: 'imf_dataservices',
    },
  ];
  for (const row of rows) {
    await supabase.from('souvera_indicators').upsert(
      { ...row, description: row.label, refresh_policy: 'monthly', is_forecast: false, min_plan_id: 'professional' },
      { onConflict: 'key' }
    );
  }
}

async function getCountryMap(
  supabase: ReturnType<typeof getSupabaseServiceClient>
): Promise<Map<string, string>> {
  const { data } = await supabase.from('souvera_countries').select('id, iso3');
  const map = new Map<string, string>();
  for (const row of data ?? []) map.set(row.iso3, row.id);
  return map;
}

async function getIndicatorMap(
  supabase: ReturnType<typeof getSupabaseServiceClient>
): Promise<Map<string, string>> {
  const { data } = await supabase.from('souvera_indicators').select('id, key');
  const map = new Map<string, string>();
  for (const row of data ?? []) map.set(row.key, row.id);
  return map;
}
