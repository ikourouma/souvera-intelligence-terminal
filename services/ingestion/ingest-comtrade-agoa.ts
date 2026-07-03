/**
 * UN Comtrade → souvera_agoa_trade_flows ingestion.
 * Upserts total_exports_to_us_usd from live Comtrade when COMTRADE_API_KEY is set.
 * Falls back gracefully when the key is absent (existing seed estimates remain).
 *
 * Run: npx tsx --tsconfig services/ingestion/tsconfig.json services/ingestion/run.ts ingest-comtrade-agoa
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fetchAgoaEligibilityMap } from '../../apps/api-gateway/src/lib/intelligence/trade-policy-vault';
import {
  AGOA_FLOW_CATEGORY_LABELS,
  type AgoaFlowCategoryGroup,
} from '../../apps/api-gateway/src/lib/trade/agoa-flow-categories';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const COMTRADE_BASE = 'https://comtradeapi.un.org/data/v1/get/C/A/USA';
const DATA_YEAR = 2023;

const HS_TO_CATEGORY: Record<string, string> = {
  '01': 'agriculture', '02': 'agriculture', '03': 'agriculture', '04': 'agriculture',
  '27': 'petroleum', '28': 'chemicals', '29': 'chemicals',
  '61': 'textiles_apparel', '62': 'textiles_apparel', '63': 'textiles_apparel',
  '64': 'footwear', '71': 'minerals', '84': 'machinery', '85': 'electronics',
  '87': 'vehicles', '46': 'handicrafts',
};

const HS_CHAPTER: Record<string, string> = {
  petroleum: '27', minerals: '71', textiles_apparel: '61', agriculture: '01',
  vehicles: '87', chemicals: '28', machinery: '84', electronics: '85',
  handicrafts: '46', footwear: '64',
};

async function fetchComtradeExports(partnerCode: string, apiKey: string): Promise<Map<string, number>> {
  const url = new URL(COMTRADE_BASE);
  url.searchParams.set('reporterCode', '842');
  url.searchParams.set('partnerCode', partnerCode);
  url.searchParams.set('period', String(DATA_YEAR));
  url.searchParams.set('flowCode', 'X');
  url.searchParams.set('breakdownMode', 'classic');
  url.searchParams.set('includeDesc', 'true');

  const res = await fetch(url.toString(), {
    headers: { 'Ocp-Apim-Subscription-Key': apiKey },
  });
  if (!res.ok) throw new Error(`Comtrade HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const byCategory = new Map<string, number>();
  for (const row of json.data ?? []) {
    const hs2 = String(row.cmdCode ?? row.classificationCode ?? '').slice(0, 2);
    const cat = HS_TO_CATEGORY[hs2] ?? 'agriculture';
    const val = Number(row.primaryValue ?? row.tradeValue ?? 0);
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + val);
  }
  return byCategory;
}

export async function ingestComtradeAgoa(): Promise<void> {
  console.log('\n[ingest-comtrade-agoa] Starting...\n');
  const apiKey = process.env.COMTRADE_API_KEY;
  if (!apiKey) {
    console.log('⚠️  COMTRADE_API_KEY not set — skipping live Comtrade fetch.');
    console.log('   Existing seed estimates in souvera_agoa_trade_flows remain in place.\n');
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const eligibilityMap = await fetchAgoaEligibilityMap();

  const { data: countries } = await sb
    .from('souvera_countries')
    .select('iso3, comtrade_code, name, region, subregion')
    .not('comtrade_code', 'is', null)
    .eq('is_african_country', true);

  let upserted = 0;
  for (const c of countries ?? []) {
    if (!c.comtrade_code) continue;
    try {
      const byCategory = await fetchComtradeExports(String(c.comtrade_code), apiKey);
      if (byCategory.size === 0) continue;

      const vault = eligibilityMap.get(c.iso3);
      const eligible = vault?.eligible ?? false;
      const agoaStatus = vault?.agoaStatus === 'eligible'
        ? 'eligible'
        : vault?.agoaStatus === 'suspended'
          ? 'suspended'
          : 'graduated';

      for (const [category, totalUsd] of byCategory) {
        const isPetroleum = category === 'petroleum';
        const rounded = Math.round(totalUsd);
        const agoaExports = eligible && !isPetroleum ? Math.round(totalUsd * 0.6) : 0;
        const { error } = await sb
          .from('souvera_agoa_trade_flows')
          .upsert(
            {
              iso3: c.iso3,
              country_name: c.name,
              region: c.region ?? 'Africa',
              sub_region: c.subregion ?? '',
              agoa_eligible: eligible,
              agoa_status: agoaStatus,
              year: DATA_YEAR,
              hs_chapter: HS_CHAPTER[category] ?? '00',
              category_group: category,
              category_label: AGOA_FLOW_CATEGORY_LABELS[category as AgoaFlowCategoryGroup] ?? category,
              total_exports_to_us_usd: rounded,
              agoa_exports_usd: agoaExports,
              agoa_share_pct: rounded > 0 ? Math.round((agoaExports / rounded) * 1000) / 10 : 0,
              non_agoa_exports_usd: rounded - agoaExports,
              is_textile_apparel: category === 'textiles_apparel',
              data_quality_tier: 'A',
              source_notes: `UN Comtrade ${DATA_YEAR} · reporter USA · partner ${c.iso3}`,
            },
            { onConflict: 'iso3,year,category_group' },
          );
        if (!error) upserted++;
      }
      console.log(`  ✅ ${c.iso3}: ${byCategory.size} categories from Comtrade`);
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      console.log(`  ⚠️  ${c.iso3}: ${e instanceof Error ? e.message : e}`);
    }
  }
  console.log(`\n[ingest-comtrade-agoa] Upserted ${upserted} flow rows.\n`);
}

if (require.main === module) {
  ingestComtradeAgoa().catch((e) => { console.error(e); process.exit(1); });
}
