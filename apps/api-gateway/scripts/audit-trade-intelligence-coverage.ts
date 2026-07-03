/**
 * Trade Intelligence Coverage Audit — All 74 Markets
 *
 * Run: npx tsx apps/api-gateway/scripts/audit-trade-intelligence-coverage.ts
 *      npx tsx apps/api-gateway/scripts/audit-trade-intelligence-coverage.ts --markdown
 */
import * as fs from 'fs';
import * as path from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';
import { SECTOR_DEFINITIONS } from '../src/lib/intelligence/supply-demand-types';
import { AGOA_FLOW_CATEGORY_GROUPS } from '../src/lib/trade/agoa-flow-categories';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

const ALL74 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3] as string[];
const AFRICA54 = [...APPROVED_AFRICA_ISO3] as string[];
const CARIBBEAN20 = [...APPROVED_CARIBBEAN_ISO3] as string[];
const DATA_YEAR = 2023;

const AFCFTA_CATEGORIES = [
  'machinery', 'minerals', 'petroleum', 'agriculture', 'textiles', 'chemicals', 'vehicles', 'electronics',
];
const DEMAND_CATEGORIES = [
  'machinery', 'cotton', 'grains', 'fertilizers', 'intermediate', 'textiles_inputs', 'pharma', 'transport', 'ict', 'medical_devices',
];
/** Must match `SECTOR_DEFINITIONS` / ingest `SECTOR_KEYS` — not legacy taxonomy aliases. */
const SDM_SECTORS = Object.keys(SECTOR_DEFINITIONS) as string[];

interface ModuleReport {
  module: string;
  expectedCells: number;
  populatedCells: number;
  coveragePct: number;
  noRowsMarkets: string[];
  nullMetricsMarkets: string[];
  tierCOnlyMarkets: string[];
  spotlight: Record<string, { rows: number; totalUsd: number; tiers: Record<string, number> }>;
}

function pct(n: number, d: number): string {
  return d > 0 ? `${((n / d) * 100).toFixed(1)}%` : '0%';
}

async function auditAgoaFlows(sb: SupabaseClient): Promise<ModuleReport> {
  const { data, error } = await sb
    .from('souvera_agoa_trade_flows')
    .select('iso3, category_group, total_exports_to_us_usd, data_quality_tier, year')
    .eq('year', DATA_YEAR);
  if (error) throw new Error(error.message);

  const cellMap = new Map<string, { total: number | null; tier: string }>();
  const marketAgg = new Map<string, { rows: number; totalUsd: number; tiers: Record<string, number> }>();

  for (const r of data ?? []) {
    const iso3 = (r.iso3 as string)?.toUpperCase();
    if (!iso3) continue;
    cellMap.set(`${iso3}:${r.category_group}`, {
      total: r.total_exports_to_us_usd as number | null,
      tier: (r.data_quality_tier as string) ?? 'B',
    });
    const agg = marketAgg.get(iso3) ?? { rows: 0, totalUsd: 0, tiers: {} };
    agg.rows += 1;
    agg.totalUsd += Number(r.total_exports_to_us_usd ?? 0);
    const t = (r.data_quality_tier as string) ?? 'B';
    agg.tiers[t] = (agg.tiers[t] ?? 0) + 1;
    marketAgg.set(iso3, agg);
  }

  const expected = AFRICA54.length * AGOA_FLOW_CATEGORY_GROUPS.length;
  let populated = 0;
  const noRows: string[] = [];
  const nullMetrics: string[] = [];
  const tierCOnly: string[] = [];

  for (const iso3 of AFRICA54) {
    let marketRows = 0;
    let marketNull = 0;
    let marketTierC = 0;
    for (const cat of AGOA_FLOW_CATEGORY_GROUPS) {
      const cell = cellMap.get(`${iso3}:${cat}`);
      if (!cell) continue;
      marketRows += 1;
      if (cell.total == null || cell.total === 0) marketNull += 1;
      if (cell.tier === 'C') marketTierC += 1;
    }
    populated += marketRows;
    if (marketRows === 0) noRows.push(iso3);
    else if (marketNull === marketRows) nullMetrics.push(iso3);
    else if (marketTierC === marketRows) tierCOnly.push(iso3);
  }

  const spotlight: ModuleReport['spotlight'] = {};
  for (const iso of ['ZWE', 'NGA', 'STP', 'MAR', 'ERI']) {
    spotlight[iso] = marketAgg.get(iso) ?? { rows: 0, totalUsd: 0, tiers: {} };
  }

  return {
    module: 'AGOA Trade Flows',
    expectedCells: expected,
    populatedCells: populated,
    coveragePct: (populated / expected) * 100,
    noRowsMarkets: noRows,
    nullMetricsMarkets: nullMetrics,
    tierCOnlyMarkets: tierCOnly,
    spotlight,
  };
}

async function auditFlowTable(
  sb: SupabaseClient,
  module: string,
  table: string,
  markets: string[],
  categories: string[],
  directions: string[],
  valueField: string,
): Promise<ModuleReport> {
  const { data, error } = await sb.from(table).select('*').eq('year', DATA_YEAR);
  if (error) throw new Error(`${table}: ${error.message}`);

  const cellMap = new Map<string, number | null>();
  for (const r of data ?? []) {
    const iso3 = (r.iso3 as string)?.toUpperCase();
    const dir = directions.length > 1 ? (r.direction as string) : 'all';
    cellMap.set(`${iso3}:${dir}:${r.category_group}`, r[valueField] as number | null);
  }

  const expected = markets.length * categories.length * directions.length;
  let populated = 0;
  const noRows: string[] = [];
  const nullMetrics: string[] = [];

  for (const iso3 of markets) {
    let marketRows = 0;
    let marketNull = 0;
    for (const dir of directions) {
      for (const cat of categories) {
        if (!cellMap.has(`${iso3}:${dir}:${cat}`)) continue;
        marketRows += 1;
        const v = cellMap.get(`${iso3}:${dir}:${cat}`);
        if (v == null || v === 0) marketNull += 1;
      }
    }
    populated += marketRows;
    if (marketRows === 0) noRows.push(iso3);
    else if (marketNull === marketRows) nullMetrics.push(iso3);
  }

  return {
    module,
    expectedCells: expected,
    populatedCells: populated,
    coveragePct: (populated / expected) * 100,
    noRowsMarkets: noRows,
    nullMetricsMarkets: nullMetrics,
    tierCOnlyMarkets: [],
    spotlight: {},
  };
}

async function auditDemand(sb: SupabaseClient): Promise<ModuleReport> {
  const { data: countries } = await sb.from('souvera_countries').select('id, iso3').in('iso3', ALL74);
  const idToIso = new Map((countries ?? []).map((c) => [c.id as string, c.iso3 as string]));

  const { data, error } = await sb
    .from('souvera_import_demand_signals')
    .select('country_id, category_group, total_imports_usd, year')
    .eq('year', DATA_YEAR);
  if (error) throw new Error(error.message);

  const cellMap = new Map<string, number | null>();
  for (const r of data ?? []) {
    const iso3 = idToIso.get(r.country_id as string);
    if (!iso3) continue;
    cellMap.set(`${iso3}:${r.category_group}`, r.total_imports_usd as number | null);
  }

  const expected = ALL74.length * DEMAND_CATEGORIES.length;
  let populated = 0;
  const noRows: string[] = [];
  const nullMetrics: string[] = [];

  for (const iso3 of ALL74) {
    let count = 0;
    let nulls = 0;
    for (const cat of DEMAND_CATEGORIES) {
      if (!cellMap.has(`${iso3}:${cat}`)) continue;
      count += 1;
      const v = cellMap.get(`${iso3}:${cat}`);
      if (v == null || v === 0) nulls += 1;
    }
    populated += count;
    if (count === 0) noRows.push(iso3);
    else if (nulls === count) nullMetrics.push(iso3);
  }

  return {
    module: 'Import Demand Signals',
    expectedCells: expected,
    populatedCells: populated,
    coveragePct: (populated / expected) * 100,
    noRowsMarkets: noRows,
    nullMetricsMarkets: nullMetrics,
    tierCOnlyMarkets: [],
    spotlight: {},
  };
}

async function auditSdm(sb: SupabaseClient): Promise<ModuleReport> {
  const { data, error } = await sb
    .from('souvera_supply_demand_signals')
    .select('iso3, sector_key, data_year')
    .eq('data_year', DATA_YEAR);
  if (error) throw new Error(error.message);

  const cellMap = new Set<string>();
  for (const r of data ?? []) {
    cellMap.add(`${(r.iso3 as string)?.toUpperCase()}:${r.sector_key}`);
  }

  const expected = ALL74.length * SDM_SECTORS.length;
  let populated = 0;
  const noRows: string[] = [];

  for (const iso3 of ALL74) {
    let count = 0;
    for (const sec of SDM_SECTORS) {
      if (cellMap.has(`${iso3}:${sec}`)) count += 1;
    }
    populated += count;
    if (count === 0) noRows.push(iso3);
  }

  return {
    module: 'Supply-Demand Matrix',
    expectedCells: expected,
    populatedCells: populated,
    coveragePct: (populated / expected) * 100,
    noRowsMarkets: noRows,
    nullMetricsMarkets: [],
    tierCOnlyMarkets: [],
    spotlight: {},
  };
}

async function auditSnapshots(sb: SupabaseClient): Promise<{ missing: string[]; withBilateral: string[] }> {
  const { data: countries } = await sb.from('souvera_countries').select('id, iso3').in('iso3', ALL74);
  const idToIso = new Map((countries ?? []).map((c) => [c.id as string, c.iso3 as string]));

  const { data } = await sb.from('souvera_country_trade_snapshots').select('country_id, exports_to_us_usd, year');

  const latest = new Map<string, number | null>();
  const latestYear = new Map<string, number>();
  for (const s of data ?? []) {
    const iso3 = idToIso.get(s.country_id as string);
    if (!iso3) continue;
    const year = s.year as number;
    if (!latestYear.has(iso3) || year > (latestYear.get(iso3) ?? 0)) {
      latestYear.set(iso3, year);
      latest.set(iso3, s.exports_to_us_usd as number | null);
    }
  }

  const missing: string[] = [];
  const withBilateral: string[] = [];
  for (const iso3 of ALL74) {
    if (!latestYear.has(iso3)) missing.push(iso3);
    else if ((latest.get(iso3) ?? 0) > 0) withBilateral.push(iso3);
  }
  return { missing, withBilateral };
}

function printReport(reports: ModuleReport[], snapshots: { missing: string[]; withBilateral: string[] }): void {
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  SOUVERA TRADE INTELLIGENCE COVERAGE AUDIT');
  console.log(`  Year: ${DATA_YEAR} · 54 Africa + 20 Caribbean = 74 markets`);
  console.log('══════════════════════════════════════════════════════════════\n');

  for (const r of reports) {
    const status = r.coveragePct >= 95 ? 'PASS' : r.coveragePct >= 70 ? 'WARN' : 'FAIL';
    console.log(`── ${r.module} [${status}] ──`);
    console.log(`   Coverage: ${r.populatedCells}/${r.expectedCells} cells (${pct(r.populatedCells, r.expectedCells)})`);
    if (r.noRowsMarkets.length) console.log(`   NO rows (${r.noRowsMarkets.length}): ${r.noRowsMarkets.join(', ')}`);
    if (r.nullMetricsMarkets.length) {
      console.log(`   All null/zero (${r.nullMetricsMarkets.length}): ${r.nullMetricsMarkets.slice(0, 20).join(', ')}${r.nullMetricsMarkets.length > 20 ? '…' : ''}`);
    }
    if (r.tierCOnlyMarkets.length) {
      console.log(`   Tier-C only (${r.tierCOnlyMarkets.length}): ${r.tierCOnlyMarkets.slice(0, 20).join(', ')}${r.tierCOnlyMarkets.length > 20 ? '…' : ''}`);
    }
    if (Object.keys(r.spotlight).length) {
      console.log('   Spotlight:');
      for (const [iso, s] of Object.entries(r.spotlight)) {
        console.log(`     ${iso}: ${s.rows} rows · $${(s.totalUsd / 1e6).toFixed(1)}M · tiers ${JSON.stringify(s.tiers)}`);
      }
    }
    console.log('');
  }

  console.log('── Trade Snapshots (Census baseline) ──');
  console.log(`   Missing: ${snapshots.missing.length} → ${snapshots.missing.join(', ') || 'none'}`);
  console.log(`   With exports_to_us_usd > 0: ${snapshots.withBilateral.length}/${ALL74.length}\n`);
  console.log('══════════════════════════════════════════════════════════════\n');
}

function toMarkdown(reports: ModuleReport[], snapshots: { missing: string[]; withBilateral: string[] }): string {
  const lines = [
    '## Trade Intelligence Coverage Audit',
    '',
    `_Generated ${new Date().toISOString()} · year ${DATA_YEAR}_`,
    '',
    '| Module | Cells | Coverage | Status |',
    '|--------|-------|----------|--------|',
  ];
  for (const r of reports) {
    const status = r.coveragePct >= 95 ? 'PASS' : r.coveragePct >= 70 ? 'WARN' : 'FAIL';
    lines.push(`| ${r.module} | ${r.populatedCells}/${r.expectedCells} | ${pct(r.populatedCells, r.expectedCells)} | ${status} |`);
  }
  const agoa = reports.find((r) => r.module === 'AGOA Trade Flows');
  if (agoa) {
    lines.push('', '### AGOA gaps (credibility-critical)', '');
    lines.push(`- **No DB rows:** ${agoa.noRowsMarkets.join(', ') || 'none'}`);
    lines.push(`- **All null/zero:** ${agoa.nullMetricsMarkets.join(', ') || 'none'}`);
    lines.push(`- **ZWE:** ${JSON.stringify(agoa.spotlight.ZWE ?? {})}`);
  }
  lines.push('', `### Trade snapshots missing: ${snapshots.missing.join(', ') || 'none'}`);
  return lines.join('\n');
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const reports = [
    await auditAgoaFlows(sb),
    await auditFlowTable(sb, 'AfCFTA Trade Flows', 'souvera_afcfta_trade_flows', AFRICA54, AFCFTA_CATEGORIES, ['imports', 'exports'], 'total_trade_usd'),
    await auditFlowTable(sb, 'CBTPA Trade Flows', 'souvera_cbtpa_trade_flows', CARIBBEAN20, AFCFTA_CATEGORIES, ['imports', 'exports'], 'trade_with_us_usd'),
    await auditDemand(sb),
    await auditSdm(sb),
  ];
  const snapshots = await auditSnapshots(sb);

  printReport(reports, snapshots);

  if (process.argv.includes('--markdown')) {
    const md = toMarkdown(reports, snapshots);
    const outPath = path.resolve(__dirname, '../../../docs/ux/data-consistency-audit-findings.md');
    const existing = fs.readFileSync(outPath, 'utf8');
    const marker = '## Trade Intelligence Coverage Audit';
    const base = existing.includes(marker) ? existing.slice(0, existing.indexOf(marker)).trimEnd() : existing.trimEnd();
    fs.writeFileSync(outPath, `${base}\n\n${md}\n`);
    console.log(`Updated ${outPath}`);
  }

  const fail = reports.some((r) => r.coveragePct < 70);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
