/**
 * Non-AGOA Trade Framework Coverage Audit
 *
 * For the 28 markets without AGOA trade flows (non-AGOA by design), verify their
 * CORRECT trade framework is populated so the country page can render gracefully:
 *  - souvera_country_trade_snapshots: general trade (exports/imports) for all
 *  - souvera_cbtpa_trade_flows: CBTPA flows for Caribbean markets
 *
 * Read-only. Run: npx tsx apps/api-gateway/scripts/audit-nonagoa-trade-frameworks.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// 28 markets without AGOA flows (from audit-export-data-coverage.ts)
const NON_AGOA_ISO3 = [
  'MAR', 'DZA', 'TUN', 'LBY', 'SDN', 'BDI', 'ERI', 'GNQ',
  'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM',
  'KNA', 'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ', 'PRI', 'VGB', 'TCA', 'CYM',
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: countries } = await sb
    .from('souvera_countries')
    .select('id, iso3, name')
    .in('iso3', NON_AGOA_ISO3 as unknown as string[]);
  const byIso3 = new Map((countries ?? []).map((c) => [c.iso3, c]));

  // ---------- 1. GENERAL TRADE SNAPSHOTS ----------
  console.log('\n=== 1. General Trade Snapshot Coverage (non-AGOA markets) ===\n');
  const { data: snaps } = await sb
    .from('souvera_country_trade_snapshots')
    .select('country_id, year, trade_summary_md');
  const snapByCountry = new Map<string, { year: number; hasMeta: boolean }>();
  for (const s of snaps ?? []) {
    const cid = s.country_id as string;
    const md = (s.trade_summary_md as string) ?? '';
    const hasMeta = md.startsWith('{"_meta":');
    const prev = snapByCountry.get(cid);
    if (!prev || (s.year as number) > prev.year) snapByCountry.set(cid, { year: s.year as number, hasMeta });
  }

  const noSnap: string[] = [];
  const snapNoMeta: string[] = [];
  for (const iso3 of NON_AGOA_ISO3) {
    const c = byIso3.get(iso3);
    const agg = c ? snapByCountry.get(c.id) : undefined;
    if (!agg) noSnap.push(iso3);
    else if (!agg.hasMeta) snapNoMeta.push(iso3);
  }
  console.log(`With trade snapshot: ${NON_AGOA_ISO3.length - noSnap.length}/${NON_AGOA_ISO3.length}`);
  console.log(`NO trade snapshot (${noSnap.length}): ${noSnap.join(', ') || 'none'}`);
  console.log(`Snapshot present but NO _meta totals (${snapNoMeta.length}): ${snapNoMeta.join(', ') || 'none'}`);

  // ---------- 2. CBTPA FLOWS (Caribbean) ----------
  console.log('\n=== 2. CBTPA Trade Flows Coverage (Caribbean markets) ===\n');
  let cbtpaByIso3 = new Set<string>();
  const { data: cbtpa, error: cbtpaErr } = await sb
    .from('souvera_cbtpa_trade_flows')
    .select('iso3');
  if (cbtpaErr) {
    console.log(`CBTPA QUERY ERROR (table may not exist): ${cbtpaErr.message}`);
  } else {
    cbtpaByIso3 = new Set((cbtpa ?? []).map((r) => (r.iso3 as string)?.toUpperCase()).filter(Boolean));
    const caribbeanNoCbtpa = (APPROVED_CARIBBEAN_ISO3 as unknown as string[]).filter((iso3) => !cbtpaByIso3.has(iso3));
    console.log(`Caribbean markets with CBTPA flows: ${(APPROVED_CARIBBEAN_ISO3 as unknown as string[]).length - caribbeanNoCbtpa.length}/${(APPROVED_CARIBBEAN_ISO3 as unknown as string[]).length}`);
    console.log(`Caribbean markets WITHOUT CBTPA flows (${caribbeanNoCbtpa.length}): ${caribbeanNoCbtpa.join(', ') || 'none'}`);
  }

  console.log('\n=== Non-AGOA Framework Audit Complete ===\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
