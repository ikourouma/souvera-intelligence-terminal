// ===========================================
// World Bank Top 20 ingestion (Option 1)
// Run: npx tsx services/ingestion/run.ts worldbank-top20
// ===========================================

import { getSupabaseServiceClient } from '@souvera/config';
import {
  TOP20_INDICATORS,
  worldBankAllCountriesIndicatorApiUrl,
} from '../../apps/api-gateway/src/lib/indicators/top20';
import { archivePayload, closeIngestionJob, createIngestionJob, updateSourceHealth } from './shared';

const PER_PAGE = 300;
const DATE_RANGE = '2018:2025';

type WBApiResponse = [
  { page: number; pages: number; total: number },
  Array<{
    countryiso3code: string;
    date: string;
    value: number | null;
    indicator: { id: string };
  }> | null,
];

export async function ingestWorldBankTop20(): Promise<void> {
  console.log('\n========================================');
  console.log('[World Bank Top20] Starting ingestion...');
  console.log('========================================\n');

  const { jobId, sourceId } = await createIngestionJob('world_bank', 'top20_weekly');
  const startTime = Date.now();
  let totalProcessed = 0;
  let totalFailed = 0;

  const supabase = getSupabaseServiceClient();

  try {
    await ensureTop20Indicators(supabase);

    const countryMap = await getCountryMap(supabase);
    const indicatorMap = await getIndicatorMap(supabase);

    console.log(`[World Bank Top20] Countries: ${countryMap.size}`);
    console.log(`[World Bank Top20] Indicators in DB map: ${indicatorMap.size}`);

    for (const def of TOP20_INDICATORS) {
      const indicatorId = indicatorMap.get(def.indicatorKey);
      if (!indicatorId) {
        console.error(`[World Bank Top20] Missing indicator: ${def.indicatorKey}`);
        totalFailed++;
        continue;
      }

      console.log(`\n[World Bank Top20] ${def.indicatorKey} (${def.worldBankCode})...`);
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages) {
        const url = worldBankAllCountriesIndicatorApiUrl(def.worldBankCode, DATE_RANGE, page, PER_PAGE);

        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data: WBApiResponse = await response.json();
          const [meta, records] = data;
          if (!records?.length) break;

          totalPages = meta.pages;

          if (page === 1) {
            await archivePayload(
              sourceId,
              url,
              { indicator: def.worldBankCode, dateRange: DATE_RANGE },
              { total: meta.total, pages: meta.pages },
              response.status
            );
          }

          for (const record of records) {
            if (record.value == null || !record.countryiso3code || record.countryiso3code.length !== 3) {
              continue;
            }
            const countryId = countryMap.get(record.countryiso3code);
            if (!countryId) continue;

            const { error } = await supabase.from('souvera_country_observations').upsert(
              {
                country_id: countryId,
                indicator_id: indicatorId,
                period_date: `${record.date}-01-01`,
                period_type: 'annual',
                value_numeric: record.value,
                source_id: sourceId,
                source_series_key: def.worldBankCode,
                is_forecast: false,
                is_estimate: false,
                quality_score: 0.92,
                fetched_at: new Date().toISOString(),
              },
              { onConflict: 'country_id,indicator_id,period_date,source_id' }
            );

            if (error) totalFailed++;
            else totalProcessed++;
          }

          console.log(`[World Bank Top20] ${def.indicatorKey} page ${page}/${totalPages}`);
          page++;
          await new Promise((r) => setTimeout(r, 250));
        } catch (err) {
          console.error(`[World Bank Top20] Error ${def.indicatorKey} page ${page}:`, err);
          totalFailed++;
          break;
        }
      }
    }

    console.log(`\n[World Bank Top20] Done: ${totalProcessed} upserts, ${totalFailed} failures`);
    await updateSourceHealth(sourceId, true, Date.now() - startTime);
    await closeIngestionJob(
      jobId,
      totalFailed > 0 ? 'partial' : 'succeeded',
      totalProcessed,
      totalFailed
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateSourceHealth(sourceId, false, Date.now() - startTime);
    await closeIngestionJob(jobId, 'failed', totalProcessed, totalFailed, msg);
    throw err;
  }
}

async function ensureTop20Indicators(
  supabase: ReturnType<typeof getSupabaseServiceClient>
): Promise<void> {
  for (const def of TOP20_INDICATORS) {
    const { error } = await supabase.from('souvera_indicators').upsert(
      {
        key: def.indicatorKey,
        label: def.label,
        domain: def.domain,
        unit: def.unit,
        description: def.description,
        preferred_source_key: 'world_bank',
        fallback_source_keys: ['imf'],
        refresh_policy: 'weekly',
        is_forecast: false,
        min_plan_id: def.domain === 'macro' || def.domain === 'demographics' ? 'public' : 'professional',
      },
      { onConflict: 'key' }
    );
    if (error) {
      console.warn(`[World Bank Top20] Indicator upsert ${def.indicatorKey}: ${error.message}`);
    }
  }
}

async function getCountryMap(
  supabase: ReturnType<typeof getSupabaseServiceClient>
): Promise<Map<string, string>> {
  const { data, error } = await supabase.from('souvera_countries').select('id, iso3');
  if (error) throw new Error(error.message);
  const map = new Map<string, string>();
  for (const row of data ?? []) map.set(row.iso3, row.id);
  return map;
}

async function getIndicatorMap(
  supabase: ReturnType<typeof getSupabaseServiceClient>
): Promise<Map<string, string>> {
  const { data, error } = await supabase.from('souvera_indicators').select('id, key');
  if (error) throw new Error(error.message);
  const map = new Map<string, string>();
  for (const row of data ?? []) map.set(row.key, row.id);
  return map;
}
