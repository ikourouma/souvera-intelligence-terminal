// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// World Bank Ingestion Adapter
// Owner: Afronovation, Inc.
// Source: https://api.worldbank.org/v2
// Target: souvera_country_observations
// ===========================================

import { getSupabaseServiceClient, DATA_SOURCE_URLS } from '@souvera/config';
import { createIngestionJob, closeIngestionJob, archivePayload, updateSourceHealth } from './shared';

// World Bank indicator codes → Souvera indicator keys
const INDICATORS = [
  { wbCode: 'NY.GDP.MKTP.CD', souveraKey: 'gdp_current_usd' },
  { wbCode: 'NY.GDP.MKTP.KD.ZG', souveraKey: 'gdp_growth_pct' },
  { wbCode: 'SP.POP.TOTL', souveraKey: 'population_total' },
] as const;

const BASE_URL = DATA_SOURCE_URLS.worldBank;
const PER_PAGE = 300;
const DATE_RANGE = '2018:2025'; // Last ~7 years of data

type WBApiResponse = [
  { page: number; pages: number; total: number },
  Array<{
    country: { id: string; value: string };
    countryiso3code: string;
    date: string;
    value: number | null;
    indicator: { id: string; value: string };
  }> | null,
];

/**
 * Ingest macroeconomic data from World Bank Indicators API.
 * Populates souvera_country_observations for GDP, GDP growth, and population.
 */
export async function ingestWorldBank(): Promise<void> {
  console.log('\n========================================');
  console.log('[World Bank] Starting ingestion...');
  console.log('========================================\n');

  const { jobId, sourceId } = await createIngestionJob('world_bank', 'macro_refresh');
  const startTime = Date.now();
  let totalProcessed = 0;
  let totalFailed = 0;

  const supabase = getSupabaseServiceClient();

  try {
    // Pre-fetch lookup maps
    const countryMap = await getCountryMap(supabase);
    const indicatorMap = await getIndicatorMap(supabase);

    console.log(`[World Bank] Country map: ${countryMap.size} entries`);
    console.log(`[World Bank] Indicator map: ${indicatorMap.size} entries`);

    for (const indicator of INDICATORS) {
      console.log(`\n[World Bank] Fetching ${indicator.souveraKey} (${indicator.wbCode})...`);

      const indicatorId = indicatorMap.get(indicator.souveraKey);
      if (!indicatorId) {
        console.error(`[World Bank] Indicator not found in DB: ${indicator.souveraKey}`);
        totalFailed++;
        continue;
      }

      let page = 1;
      let totalPages = 1;

      while (page <= totalPages) {
        const url = `${BASE_URL}/country/all/indicator/${indicator.wbCode}?format=json&per_page=${PER_PAGE}&date=${DATE_RANGE}&page=${page}`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data: WBApiResponse = await response.json();
          const [meta, records] = data;

          if (!records || records.length === 0) {
            console.log(`[World Bank] No data for ${indicator.souveraKey} page ${page}`);
            break;
          }

          totalPages = meta.pages;

          // Archive first page only
          if (page === 1) {
            await archivePayload(
              sourceId,
              url,
              { indicator: indicator.wbCode, dateRange: DATE_RANGE, page },
              { total: meta.total, pages: meta.pages, sampleCount: records.length },
              response.status
            );
          }

          // Process records
          for (const record of records) {
            if (record.value === null || record.value === undefined) continue;
            if (!record.countryiso3code || record.countryiso3code.length !== 3) continue;

            const countryId = countryMap.get(record.countryiso3code);
            if (!countryId) continue; // Skip countries not in our registry

            try {
              const { error } = await supabase
                .from('souvera_country_observations')
                .upsert(
                  {
                    country_id: countryId,
                    indicator_id: indicatorId,
                    period_date: `${record.date}-01-01`,
                    period_type: 'annual',
                    value_numeric: record.value,
                    source_id: sourceId,
                    source_series_key: indicator.wbCode,
                    is_forecast: false,
                    is_estimate: false,
                    quality_score: 0.9,
                    fetched_at: new Date().toISOString(),
                  },
                  { onConflict: 'country_id,indicator_id,period_date,source_id' }
                );

              if (error) {
                totalFailed++;
              } else {
                totalProcessed++;
              }
            } catch {
              totalFailed++;
            }
          }

          console.log(
            `[World Bank] ${indicator.souveraKey} page ${page}/${totalPages}: ${records.length} records`
          );
          page++;

          // Rate limit courtesy
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (err) {
          console.error(
            `[World Bank] Error fetching ${indicator.souveraKey} page ${page}:`,
            err
          );
          totalFailed++;
          break;
        }
      }
    }

    console.log(
      `\n[World Bank] Ingestion complete: ${totalProcessed} processed, ${totalFailed} failed`
    );

    await updateSourceHealth(sourceId, true, Date.now() - startTime);
    await closeIngestionJob(
      jobId,
      totalFailed > 0 ? 'partial' : 'succeeded',
      totalProcessed,
      totalFailed
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[World Bank] Ingestion failed: ${errorMessage}`);
    await updateSourceHealth(sourceId, false, Date.now() - startTime);
    await closeIngestionJob(jobId, 'failed', totalProcessed, totalFailed, errorMessage);
    throw err;
  }
}

// -------------------------------------------
// Helpers
// -------------------------------------------

async function getCountryMap(
  supabase: ReturnType<typeof getSupabaseServiceClient>
): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from('souvera_countries')
    .select('id, iso3');

  if (error) throw new Error(`Failed to fetch countries: ${error.message}`);

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    map.set(row.iso3, row.id);
  }
  return map;
}

async function getIndicatorMap(
  supabase: ReturnType<typeof getSupabaseServiceClient>
): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from('souvera_indicators')
    .select('id, key');

  if (error) throw new Error(`Failed to fetch indicators: ${error.message}`);

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    map.set(row.key, row.id);
  }
  return map;
}
