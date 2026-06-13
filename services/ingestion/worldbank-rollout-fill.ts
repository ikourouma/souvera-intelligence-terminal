/**
 * Targeted World Bank fill for 12 rollout markets (per-country API, retries).
 * Run: npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts worldbank-rollout-fill
 */

import { getSupabaseServiceClient } from '@souvera/config';
import {
  TOP20_INDICATORS,
  worldBankCountryIndicatorApiUrl,
} from '../../apps/api-gateway/src/lib/indicators/top20';
import { ALL_ROLLOUT_ISO3 } from '../../apps/api-gateway/src/lib/intelligence/rollout-manifest';
import { archivePayload, closeIngestionJob, createIngestionJob, updateSourceHealth } from './shared';

const DATE_RANGE = '2000:2025';
const MAX_RETRIES = 3;

type WbRecord = {
  date: string;
  value: number | null;
};

async function fetchCountryIndicator(
  iso2: string,
  code: string,
  sourceId: string,
  archiveOnce: { done: boolean }
): Promise<WbRecord[]> {
  const url = worldBankCountryIndicatorApiUrl(iso2, code, DATE_RANGE);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status >= 500 && attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
          continue;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as [{}, WbRecord[] | null];
      const records = data[1] ?? [];

      if (!archiveOnce.done) {
        await archivePayload(sourceId, url, { iso2, code, dateRange: DATE_RANGE }, { count: records.length }, response.status);
        archiveOnce.done = true;
      }

      return records;
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  return [];
}

export async function ingestWorldBankRolloutFill(): Promise<void> {
  console.log('\n[worldbank-rollout-fill] Per-country Top 20 fill for rollout markets...\n');

  const { jobId, sourceId } = await createIngestionJob('world_bank', 'rollout_country_fill');
  const startTime = Date.now();
  let processed = 0;
  let failed = 0;
  let skipped = 0;

  const supabase = getSupabaseServiceClient();

  try {
    const { data: countries, error: countryErr } = await supabase
      .from('souvera_countries')
      .select('id, iso2, iso3')
      .in('iso3', [...ALL_ROLLOUT_ISO3]);

    if (countryErr) throw new Error(countryErr.message);

    const { data: indicators, error: indErr } = await supabase.from('souvera_indicators').select('id, key');
    if (indErr) throw new Error(indErr.message);

    const indicatorMap = new Map((indicators ?? []).map((i) => [i.key, i.id]));

    for (const country of countries ?? []) {
      if (!country.iso2) continue;
      console.log(`\n[worldbank-rollout-fill] ${country.iso3}...`);

      for (const def of TOP20_INDICATORS) {
        const indicatorId = indicatorMap.get(def.indicatorKey);
        if (!indicatorId) {
          failed++;
          continue;
        }

        try {
          const archiveOnce = { done: false };
          const records = await fetchCountryIndicator(country.iso2, def.worldBankCode, sourceId, archiveOnce);
          const withValues = records.filter((r) => r.value != null);
          if (!withValues.length) {
            skipped++;
            continue;
          }

          for (const record of withValues) {
            const { error } = await supabase.from('souvera_country_observations').upsert(
              {
                country_id: country.id,
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
            if (error) failed++;
            else processed++;
          }

          await new Promise((r) => setTimeout(r, 150));
        } catch (err) {
          console.error(`[worldbank-rollout-fill] ${country.iso3} ${def.indicatorKey}:`, err);
          failed++;
        }
      }
    }

    console.log(`\n[worldbank-rollout-fill] Done: ${processed} upserts, ${skipped} source-empty, ${failed} failures`);
    await updateSourceHealth(sourceId, true, Date.now() - startTime);
    await closeIngestionJob(jobId, failed > 0 ? 'partial' : 'succeeded', processed, failed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateSourceHealth(sourceId, false, Date.now() - startTime);
    await closeIngestionJob(jobId, 'failed', processed, failed, msg);
    throw err;
  }
}
