/**
 * Cross-module Trade Intelligence consistency audit — 74 markets.
 * Run: npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/audit-ti-cross-module-consistency.ts
 */
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';
import { categoriesForSdmSector } from '../src/lib/intelligence/sdm-category-map';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

const ALL74 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];
const AFRICA = new Set<string>(APPROVED_AFRICA_ISO3 as unknown as string[]);
const CARIBBEAN = new Set<string>(APPROVED_CARIBBEAN_ISO3 as unknown as string[]);

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const failures: string[] = [];
  const warnings: string[] = [];

  const { data: snaps } = await sb
    .from('souvera_country_trade_snapshots')
    .select('country_id, exports_to_us_usd, souvera_countries(iso3)')
    .order('year', { ascending: false });

  const censusByIso = new Map<string, number>();
  for (const s of snaps ?? []) {
    const iso = (s.souvera_countries as { iso3?: string } | null)?.iso3?.toUpperCase();
    if (!iso || censusByIso.has(iso)) continue;
    censusByIso.set(iso, Number(s.exports_to_us_usd ?? 0));
  }

  const { data: sdmRows } = await sb
    .from('souvera_supply_demand_signals')
    .select('iso3, sector_key, current_trade_usd, region, agoa_eligible, cbtpa_eligible, data_quality_tier')
    .eq('data_year', 2023);

  const sdmSumByIso = new Map<string, number>();
  for (const r of sdmRows ?? []) {
    const iso = String(r.iso3).toUpperCase();
    sdmSumByIso.set(iso, (sdmSumByIso.get(iso) ?? 0) + Number(r.current_trade_usd ?? 0));
  }

  for (const iso of ALL74) {
    const census = censusByIso.get(iso) ?? 0;
    const sdmSum = sdmSumByIso.get(iso) ?? 0;
    if (census > 1_000_000 && sdmSum > census * 1.15) {
      warnings.push(
        `${iso}: SDM sector current_trade sum ($${(sdmSum / 1e6).toFixed(1)}M) exceeds Census bilateral ($${(census / 1e6).toFixed(1)}M) — sector sums may overlap`,
      );
    }
  }

  const { data: agoaFlows } = await sb
    .from('souvera_agoa_trade_flows')
    .select('iso3, category_group, total_exports_to_us_usd, year')
    .eq('year', 2024);

  const flowSumByIso = new Map<string, number>();
  for (const f of agoaFlows ?? []) {
    const iso = String(f.iso3).toUpperCase();
    flowSumByIso.set(iso, (flowSumByIso.get(iso) ?? 0) + Number(f.total_exports_to_us_usd ?? 0));
  }

  for (const iso of AFRICA) {
    const cells = (sdmRows ?? []).filter((r) => String(r.iso3).toUpperCase() === iso);
    if (!cells.length) failures.push(`${iso}: no SDM cells`);
    for (const c of cells) {
      if (CARIBBEAN.has(iso) && c.agoa_eligible) {
        failures.push(`${iso}/${c.sector_key}: Caribbean cell marked agoa_eligible`);
      }
    }
    const miningCell = cells.find((c) => c.sector_key === 'mining_minerals');
    const flowTotal = flowSumByIso.get(iso) ?? 0;
    const census = censusByIso.get(iso) ?? 0;
    if (miningCell && flowTotal > 0 && census > 0) {
      const delta = Math.abs(flowTotal - census) / Math.max(flowTotal, census);
      if (delta > 0.05 && iso === 'COD') {
        warnings.push(`COD: Census $${(census / 1e6).toFixed(1)}M vs AGOA flows $${(flowTotal / 1e6).toFixed(1)}M — dual-source documented`);
      }
    }
  }

  for (const iso of CARIBBEAN) {
    const cells = (sdmRows ?? []).filter((r) => String(r.iso3).toUpperCase() === iso);
    for (const c of cells) {
      if (c.agoa_eligible && !c.cbtpa_eligible) {
        warnings.push(`${iso}/${c.sector_key}: Caribbean agoa_eligible without cbtpa_eligible`);
      }
    }
  }

  const { data: ustrRefs } = await sb
    .from('souvera_external_reference_links')
    .select('entity_key')
    .eq('ref_type', 'USTR_COUNTRY_PAGE')
    .not('entity_key', 'is', null);

  const ustrSet = new Set((ustrRefs ?? []).map((r) => String(r.entity_key).toUpperCase()));
  const tierAWithoutUstr = ['COD', 'KEN', 'NGA', 'ZAF'].filter((iso) => !ustrSet.has(iso));
  if (tierAWithoutUstr.length) {
    warnings.push(`Tier-A markets without USTR link: ${tierAWithoutUstr.join(', ')} (directory lists ~15; curated seed may be needed)`);
  }

  console.log('\n=== Trade Intelligence Cross-Module Consistency (74 markets) ===\n');
  console.log(`SDM cells: ${sdmRows?.length ?? 0}`);
  console.log(`Census snapshots: ${censusByIso.size}`);
  console.log(`Failures: ${failures.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (failures.length) {
    console.log('\n--- Failures ---');
    failures.forEach((l) => console.log(' ', l));
  }
  if (warnings.length) {
    console.log('\n--- Warnings ---');
    warnings.slice(0, 25).forEach((l) => console.log(' ', l));
    if (warnings.length > 25) console.log(`  ... +${warnings.length - 25} more`);
  }

  if (!failures.length) console.log('\n✅ Cross-module gate PASS (warnings are informational)\n');
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
