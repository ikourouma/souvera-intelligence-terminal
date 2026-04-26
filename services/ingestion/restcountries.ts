// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// REST Countries Ingestion Adapter
// Owner: Afronovation, Inc.
// Source: https://restcountries.com/v3.1
// Target: souvera_countries
// ===========================================

import { getSupabaseServiceClient, DATA_SOURCE_URLS } from '@souvera/config';
import { createIngestionJob, closeIngestionJob, archivePayload, updateSourceHealth } from './shared';

const API_URL = `${DATA_SOURCE_URLS.restCountries}/all?fields=cca2,cca3,name,region,subregion,capital,currencies,flags,latlng`;

type RestCountryResponse = {
  cca2: string;
  cca3: string;
  name: { common: string; official: string };
  region: string;
  subregion?: string;
  capital?: string[];
  currencies?: Record<string, { name: string; symbol: string }>;
  flags?: { svg?: string; png?: string };
  latlng?: number[];
};

/**
 * Ingest country metadata from REST Countries API.
 * Populates souvera_countries table.
 */
export async function ingestRestCountries(): Promise<void> {
  console.log('\n========================================');
  console.log('[REST Countries] Starting ingestion...');
  console.log('========================================\n');

  const { jobId, sourceId } = await createIngestionJob('rest_countries', 'metadata_refresh');
  const startTime = Date.now();
  let recordsProcessed = 0;
  let recordsFailed = 0;

  try {
    // 1. Fetch from REST Countries API
    console.log(`[REST Countries] Fetching from ${API_URL}`);
    const response = await fetch(API_URL);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawData: RestCountryResponse[] = await response.json();
    console.log(`[REST Countries] Received ${rawData.length} countries (${latencyMs}ms)`);

    // 2. Archive raw payload (summary only to avoid bloat)
    await archivePayload(sourceId, API_URL, { fields: 'cca2,cca3,name,region,subregion,capital,currencies,flags,latlng' }, { count: rawData.length, sample: rawData.slice(0, 3) }, response.status);

    // 3. Transform and upsert
    const supabase = getSupabaseServiceClient();

    for (const country of rawData) {
      try {
        // Extract currency info
        const currencyEntries = country.currencies ? Object.entries(country.currencies) : [];
        const currencyCode = currencyEntries.length > 0 ? currencyEntries[0][0] : null;
        const currencyName = currencyEntries.length > 0 ? currencyEntries[0][1].name : null;

        // Determine if African country
        const isAfrican = country.region === 'Africa';

        const row = {
          iso2: country.cca2,
          iso3: country.cca3,
          name: country.name.common,
          region: country.region || 'Unknown',
          subregion: country.subregion || null,
          capital: country.capital?.[0] || null,
          currency_code: currencyCode,
          currency_name: currencyName,
          flag_svg_url: country.flags?.svg || null,
          flag_png_url: country.flags?.png || null,
          lat: country.latlng?.[0] ?? null,
          lng: country.latlng?.[1] ?? null,
          is_african_country: isAfrican,
          is_active: true,
        };

        const { error } = await supabase
          .from('souvera_countries')
          .upsert(row, { onConflict: 'iso3' });

        if (error) {
          console.error(`[REST Countries] Failed to upsert ${country.cca3}: ${error.message}`);
          recordsFailed++;
        } else {
          recordsProcessed++;
        }
      } catch (err) {
        console.error(`[REST Countries] Error processing ${country.cca3}:`, err);
        recordsFailed++;
      }
    }

    console.log(`\n[REST Countries] Ingestion complete: ${recordsProcessed} processed, ${recordsFailed} failed`);

    // 4. Update source health
    await updateSourceHealth(sourceId, true, Date.now() - startTime);

    // 5. Close job
    await closeIngestionJob(jobId, recordsFailed > 0 ? 'partial' : 'succeeded', recordsProcessed, recordsFailed);

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[REST Countries] Ingestion failed: ${errorMessage}`);
    await updateSourceHealth(sourceId, false, Date.now() - startTime);
    await closeIngestionJob(jobId, 'failed', recordsProcessed, recordsFailed, errorMessage);
    throw err;
  }
}
