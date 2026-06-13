/**
 * World Bank WGI — governance dimension estimates → wgi_governance_estimate.
 */

import { getSupabaseServiceClient } from '@souvera/config';
import { archivePayload, closeIngestionJob, createIngestionJob, updateSourceHealth } from './shared';
import { WORLD_BANK_WGI_CODES } from './config/verification-sources';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../../apps/api-gateway/src/lib/market-coverage';

const WB_BASE = 'https://api.worldbank.org/v2';
const COVERAGE_ISO3 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];

type WBResponse = [
  { page: number; pages: number },
  Array<{
    countryiso3code: string;
    date: string;
    value: number | null;
    indicator: { id: string };
  }> | null,
];

export async function ingestWorldBankWgi(): Promise<void> {
  console.log('\n[worldbank-wgi] WGI governance ingestion...\n');
  const { jobId, sourceId } = await createIngestionJob('world_bank_wgi', 'worldbank_wgi');
  const start = Date.now();
  let processed = 0;
  let failed = 0;

  const supabase = getSupabaseServiceClient();

  try {
    await supabase.from('souvera_indicators').upsert(
      {
        key: 'wgi_governance_estimate',
        label: 'WGI governance estimate (6-dimension avg)',
        domain: 'governance',
        unit: 'index',
        description: 'Average of World Bank WGI estimate indicators',
        preferred_source_key: 'world_bank_wgi',
        refresh_policy: 'annual',
        is_forecast: false,
        min_plan_id: 'professional',
      },
      { onConflict: 'key' }
    );

    const { data: indicator } = await supabase
      .from('souvera_indicators')
      .select('id')
      .eq('key', 'wgi_governance_estimate')
      .single();
    if (!indicator?.id) throw new Error('wgi_governance_estimate missing');

    const countryMap = new Map<string, string>();
    const { data: countries } = await supabase
      .from('souvera_countries')
      .select('id, iso3')
      .in('iso3', COVERAGE_ISO3);
    for (const c of countries ?? []) countryMap.set(c.iso3, c.id);

    const byCountryYear = new Map<string, number[]>();

    for (const wbCode of Object.values(WORLD_BANK_WGI_CODES)) {
      const url = `${WB_BASE}/country/all/indicator/${wbCode}?format=json&per_page=20000&date=2018:2024`;
      const res = await fetch(url);
      if (!res.ok) {
        failed++;
        continue;
      }
      const data: WBResponse = await res.json();
      await archivePayload(sourceId, url, { wbCode }, { pages: data[0]?.pages }, res.status);
      const records = data[1] ?? [];
      for (const r of records) {
        if (r.value == null || !COVERAGE_ISO3.includes(r.countryiso3code as (typeof COVERAGE_ISO3)[number])) {
          continue;
        }
        const key = `${r.countryiso3code}:${r.date}`;
        const list = byCountryYear.get(key) ?? [];
        list.push(r.value);
        byCountryYear.set(key, list);
      }
      await new Promise((r) => setTimeout(r, 300));
    }

    for (const [key, values] of byCountryYear) {
      const [iso3, year] = key.split(':');
      const countryId = countryMap.get(iso3);
      if (!countryId || values.length === 0) continue;
      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      const { error } = await supabase.from('souvera_country_observations').upsert(
        {
          country_id: countryId,
          indicator_id: indicator.id,
          period_date: `${year}-01-01`,
          period_type: 'annual',
          value_numeric: Math.round(avg * 1000) / 1000,
          source_id: sourceId,
          source_series_key: 'WGI.avg6',
          is_forecast: false,
          is_estimate: false,
          quality_score: 0.9,
          fetched_at: new Date().toISOString(),
        },
        { onConflict: 'country_id,indicator_id,period_date,source_id' }
      );
      if (error) failed++;
      else processed++;
    }

    await updateSourceHealth(sourceId, true, Date.now() - start);
    await closeIngestionJob(jobId, failed > 0 ? 'partial' : 'succeeded', processed, failed);
    console.log(`[worldbank-wgi] ${processed} composite rows`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await updateSourceHealth(sourceId, false, Date.now() - start);
    await closeIngestionJob(jobId, 'failed', processed, failed, msg);
    throw err;
  }
}
