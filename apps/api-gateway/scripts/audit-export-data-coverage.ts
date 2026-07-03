/**
 * Export Data Coverage Audit — All 74 Markets
 *
 * Quantifies the "current export data missing" gap reported pre-demo:
 *  - souvera_agoa_trade_flows: row count + summed total_exports_to_us_usd per market
 *  - souvera_country_sectors: agoa_export_current_usd / agoa_export_potential_usd coverage
 *
 * Read-only. Run: npx tsx apps/api-gateway/scripts/audit-export-data-coverage.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ALL74_ISO3 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: countries } = await sb
    .from('souvera_countries')
    .select('id, iso3, name')
    .in('iso3', ALL74_ISO3 as unknown as string[]);
  const byIso3 = new Map((countries ?? []).map((c) => [c.iso3, c]));

  // ---------- 1. AGOA TRADE FLOWS COVERAGE ----------
  console.log('\n=== 1. AGOA Trade Flows (exports to US) Coverage ===\n');
  const { data: flows } = await sb
    .from('souvera_agoa_trade_flows')
    .select('iso3, total_exports_to_us_usd, agoa_exports_usd');

  const flowAgg = new Map<string, { rows: number; totalToUs: number }>();
  for (const f of flows ?? []) {
    const iso3 = (f.iso3 as string)?.toUpperCase();
    if (!iso3) continue;
    const cur = flowAgg.get(iso3) ?? { rows: 0, totalToUs: 0 };
    cur.rows += 1;
    cur.totalToUs += (f.total_exports_to_us_usd as number) ?? 0;
    flowAgg.set(iso3, cur);
  }

  const noFlows: string[] = [];
  const zeroValue: string[] = [];
  for (const iso3 of ALL74_ISO3) {
    const agg = flowAgg.get(iso3);
    if (!agg || agg.rows === 0) noFlows.push(iso3);
    else if (agg.totalToUs <= 0) zeroValue.push(iso3);
  }
  console.log(`Markets with >=1 trade-flow row: ${ALL74_ISO3.length - noFlows.length}/${ALL74_ISO3.length}`);
  console.log(`Markets with NO trade-flow rows (${noFlows.length}): ${noFlows.join(', ') || 'none'}`);
  console.log(`Markets with rows but $0 total exports-to-US (${zeroValue.length}): ${zeroValue.join(', ') || 'none'}`);

  // ---------- 2. SECTOR-LEVEL AGOA EXPORT FIELDS ----------
  console.log('\n=== 2. Sector AGOA Export Fields Coverage ===\n');
  const { data: sectors, error: secErr } = await sb
    .from('souvera_country_sectors')
    .select('country_id, sector_key, agoa_export_current_usd, agoa_export_potential_usd, row_status')
    .eq('row_status', 'active');

  if (secErr) {
    console.log(`SECTOR QUERY ERROR: ${secErr.message}`);
  } else {
    const sectorsByCountry = new Map<string, { total: number; withCurrent: number; withPotential: number }>();
    for (const s of sectors ?? []) {
      const cid = s.country_id as string;
      const cur = sectorsByCountry.get(cid) ?? { total: 0, withCurrent: 0, withPotential: 0 };
      cur.total += 1;
      if (s.agoa_export_current_usd != null) cur.withCurrent += 1;
      if (s.agoa_export_potential_usd != null) cur.withPotential += 1;
      sectorsByCountry.set(cid, cur);
    }

    const noCurrent: string[] = [];
    const partialCurrent: string[] = [];
    for (const iso3 of ALL74_ISO3) {
      const c = byIso3.get(iso3);
      const agg = c ? sectorsByCountry.get(c.id) : undefined;
      if (!agg || agg.withCurrent === 0) noCurrent.push(iso3);
      else if (agg.withCurrent < agg.total) partialCurrent.push(`${iso3}(${agg.withCurrent}/${agg.total})`);
    }
    console.log(`Markets with NO sector agoa_export_current_usd (${noCurrent.length}): ${noCurrent.join(', ') || 'none'}`);
    console.log(`Markets with PARTIAL sector current exports (${partialCurrent.length}): ${partialCurrent.join(', ') || 'none'}`);
  }

  console.log('\n=== Export Data Audit Complete ===\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
