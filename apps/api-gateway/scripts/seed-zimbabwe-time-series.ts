/**
 * Seed Zimbabwe macro time series 2020–2025 (Tier A curated estimates).
 * Sources: World Bank WDI, IMF WEO, ZIMSTAT, RBZ.
 *
 * Run: npx tsx apps/api-gateway/scripts/seed-zimbabwe-time-series.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface Obs {
  key: string;
  year: number;
  value: number;
  source: string;
  quality: number;
}

const ZWE_SERIES: Obs[] = [
  // 2020
  { key: 'gdp_current_usd', year: 2020, value: 18.0e9, source: 'World Bank WDI', quality: 0.92 },
  { key: 'gdp_growth_pct', year: 2020, value: -7.9, source: 'World Bank / IMF', quality: 0.90 },
  { key: 'gdp_per_capita_usd', year: 2020, value: 1180, source: 'World Bank WDI', quality: 0.90 },
  { key: 'population_total', year: 2020, value: 15.9e6, source: 'World Bank WDI', quality: 0.95 },
  { key: 'inflation_cpi_pct', year: 2020, value: 557.0, source: 'ZIMSTAT / World Bank', quality: 0.78 },
  { key: 'fdi_net_inflows_usd', year: 2020, value: 194e6, source: 'World Bank BX.KLT.DINV.CD.WD', quality: 0.85 },
  { key: 'fx_to_usd', year: 2020, value: 25.0, source: 'RBZ (pre-hyperinflation ZWL)', quality: 0.70 },
  // 2021
  { key: 'gdp_current_usd', year: 2021, value: 20.7e9, source: 'World Bank WDI', quality: 0.92 },
  { key: 'gdp_growth_pct', year: 2021, value: 6.3, source: 'World Bank / IMF', quality: 0.90 },
  { key: 'gdp_per_capita_usd', year: 2021, value: 1280, source: 'World Bank WDI', quality: 0.90 },
  { key: 'population_total', year: 2021, value: 16.1e6, source: 'World Bank WDI', quality: 0.95 },
  { key: 'inflation_cpi_pct', year: 2021, value: 94.6, source: 'ZIMSTAT / World Bank', quality: 0.82 },
  { key: 'fdi_net_inflows_usd', year: 2021, value: 166e6, source: 'World Bank', quality: 0.85 },
  { key: 'fx_to_usd', year: 2021, value: 85.0, source: 'RBZ auction average', quality: 0.72 },
  // 2022
  { key: 'gdp_current_usd', year: 2022, value: 25.8e9, source: 'World Bank WDI', quality: 0.92 },
  { key: 'gdp_growth_pct', year: 2022, value: 3.4, source: 'World Bank / IMF', quality: 0.90 },
  { key: 'gdp_per_capita_usd', year: 2022, value: 1580, source: 'World Bank WDI', quality: 0.90 },
  { key: 'population_total', year: 2022, value: 16.4e6, source: 'World Bank WDI', quality: 0.95 },
  { key: 'inflation_cpi_pct', year: 2022, value: 193.4, source: 'ZIMSTAT / World Bank', quality: 0.80 },
  { key: 'fdi_net_inflows_usd', year: 2022, value: 280e6, source: 'World Bank', quality: 0.85 },
  { key: 'fx_to_usd', year: 2022, value: 322.0, source: 'RBZ average', quality: 0.75 },
  // 2025 (IMF/RBZ estimates)
  { key: 'gdp_current_usd', year: 2025, value: 38.5e9, source: 'IMF WEO April 2025 estimate', quality: 0.85 },
  { key: 'gdp_growth_pct', year: 2025, value: 3.5, source: 'IMF WEO / AfDB estimate', quality: 0.82 },
  { key: 'gdp_per_capita_usd', year: 2025, value: 2250, source: 'Calculated GDP/population', quality: 0.80 },
  { key: 'population_total', year: 2025, value: 17.1e6, source: 'World Bank projection', quality: 0.88 },
  { key: 'inflation_cpi_pct', year: 2025, value: 15.0, source: 'RBZ / IMF (ZiG stabilization)', quality: 0.78 },
  { key: 'fdi_net_inflows_usd', year: 2025, value: 520e6, source: 'IMF estimate (mining FDI)', quality: 0.80 },
  { key: 'fx_to_usd', year: 2025, value: 26.5, source: 'RBZ ZiG reference rate', quality: 0.78 },
  { key: 'exports_goods_services_usd', year: 2025, value: 9.0e9, source: 'ZIMSTAT / mining export estimate', quality: 0.78 },
  { key: 'imports_goods_services_usd', year: 2025, value: 9.8e9, source: 'ZIMSTAT estimate', quality: 0.76 },
  { key: 'debt_to_gdp_pct', year: 2025, value: 82.0, source: 'IMF Fiscal Monitor', quality: 0.80 },
];

async function main() {
  console.log('\n=== Seed Zimbabwe time series 2020–2025 ===\n');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: country } = await sb.from('souvera_countries').select('id').eq('iso3', 'ZWE').maybeSingle();
  if (!country) throw new Error('ZWE not found');

  let sourceId: string;
  const { data: src } = await sb.from('souvera_data_sources').select('id').eq('key', 'curated_zwe').maybeSingle();
  if (src) sourceId = src.id;
  else {
    const { data: newSrc } = await sb.from('souvera_data_sources').insert({
      key: 'curated_zwe', name: 'Zimbabwe Curated Data', domain: 'zimstat.co.zw',
      provider_url: 'https://www.zimstat.co.zw', source_status: 'approved', priority_rank: 100, is_active: true,
    }).select('id').single();
    sourceId = newSrc!.id;
  }

  const { data: indicators } = await sb.from('souvera_indicators').select('id, key');
  const indMap = new Map((indicators ?? []).map((i) => [i.key, i.id]));

  let ok = 0;
  for (const obs of ZWE_SERIES) {
    const indId = indMap.get(obs.key);
    if (!indId) { console.log(`  ⚠️  missing indicator: ${obs.key}`); continue; }
    const { error } = await sb.from('souvera_country_observations').upsert({
      country_id: country.id, indicator_id: indId, period_date: `${obs.year}-01-01`, period_type: 'annual',
      value_numeric: obs.value, source_id: sourceId, source_series_key: obs.source,
      is_forecast: obs.year >= 2025, is_estimate: obs.quality < 0.9, quality_score: obs.quality,
      fetched_at: new Date().toISOString(),
    }, { onConflict: 'country_id,indicator_id,period_date,source_id' });
    if (error) console.log(`  ❌ ${obs.key} ${obs.year}: ${error.message}`);
    else ok++;
  }
  console.log(`\n✅ Upserted ${ok}/${ZWE_SERIES.length} observations.\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
