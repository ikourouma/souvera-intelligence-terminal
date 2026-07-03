/**
 * Platform-wide data-consistency audit (Phase: data consistency).
 *
 * Read-only. Scans every covered market and reports coverage across the surfaces
 * that the country terminal renders, so we can see exactly which markets/tabs have
 * gaps (the symptom behind "COD economy overview is missing GDP/FDI/inflation" and
 * "missing 2025 data").
 *
 * For each market it checks:
 *   - Macro headline indicators (GDP, growth, population, inflation, FDI, FX) —
 *     present? latest year? is 2025 present?
 *   - Breadth of Top-20 indicator coverage (how many of the 20 are populated)
 *   - Economy time-series: count of annual years present
 *   - Sectors tab: count of active sector rows
 *   - Trade tab: count of trade snapshot years
 *
 * Output:
 *   - A console summary (worst-offenders first)
 *   - A markdown findings report at docs/ux/data-consistency-audit-findings.md
 *
 * Run: npx tsx apps/api-gateway/scripts/audit-data-consistency.ts
 */
import * as path from 'path';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

const CURRENT_YEAR = 2025;

// Souvera's covered scope: 54 African + 20 Caribbean = 74 markets (see market-coverage.ts).
const COVERED_ISO3 = new Set<string>([
  // Africa (54)
  'MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN',
  'NGA', 'GHA', 'SEN', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR', 'CIV', 'TGO', 'BEN', 'GMB', 'GNB', 'CPV', 'MRT',
  'ETH', 'KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SOM', 'DJI', 'ERI', 'MDG', 'COM', 'MUS', 'SYC', 'SSD',
  'CMR', 'CAF', 'COD', 'COG', 'GAB', 'GNQ', 'STP', 'TCD', 'AGO',
  'ZAF', 'BWA', 'LSO', 'SWZ', 'NAM', 'ZWE', 'MOZ', 'ZMB', 'MWI',
  // Caribbean (20)
  'ATG', 'BHS', 'BRB', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA', 'LCA', 'VCT', 'SUR', 'TTO', 'GUY', 'BLZ',
  'PRI', 'VGB', 'TCA', 'CYM',
]);

// Headline macro indicators surfaced on Overview + Economy tabs. Key = DB indicator key.
const HEADLINE_KEYS: Array<{ key: string; label: string; tier: 'public' | 'pro' }> = [
  { key: 'gdp_current_usd', label: 'GDP', tier: 'public' },
  { key: 'gdp_growth_pct', label: 'Growth', tier: 'public' },
  { key: 'population_total', label: 'Population', tier: 'public' },
  { key: 'inflation_cpi_pct', label: 'Inflation', tier: 'pro' },
  { key: 'fdi_net_inflows_usd', label: 'FDI', tier: 'pro' },
  { key: 'official_exchange_rate', label: 'FX', tier: 'pro' },
];

const TOP20_KEYS = [
  'gdp_current_usd', 'gdp_growth_pct', 'gdp_per_capita_usd', 'population_total',
  'inflation_cpi_pct', 'fdi_net_inflows_usd', 'current_account_pct_gdp',
  'reserves_total_usd', 'reserves_months_imports', 'official_exchange_rate',
  'remittances_received_usd', 'exports_goods_services_usd', 'imports_goods_services_usd',
  'trade_pct_gdp', 'unemployment_pct', 'internet_users_pct', 'life_expectancy_years',
  'urban_population_pct', 'electricity_access_pct', 'co2_emissions_per_capita',
];

interface MarketAudit {
  iso3: string;
  name: string;
  region: string;
  headline: Record<string, { present: boolean; latestYear: number | null; has2025: boolean }>;
  top20Covered: number;
  yearsCount: number;
  sectorsCount: number;
  tradeSnapshots: number;
}

async function fetchAllObservations(sb: ReturnType<typeof createClient>) {
  const rows: Array<{ country_id: string; indicator_id: string; period_date: string; value_numeric: number | null }> = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from('souvera_country_observations')
      .select('country_id, indicator_id, period_date, value_numeric')
      .eq('period_type', 'annual')
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    rows.push(...(data as typeof rows));
    if (data.length < PAGE) break;
  }
  return rows;
}

async function countByCountry(
  sb: ReturnType<typeof createClient>,
  table: string,
  extraFilter?: (q: any) => any
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    let q = sb.from(table).select('country_id').range(from, from + PAGE - 1);
    if (extraFilter) q = extraFilter(q);
    const { data, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const r of data as Array<{ country_id: string }>) {
      counts.set(r.country_id, (counts.get(r.country_id) ?? 0) + 1);
    }
    if (data.length < PAGE) break;
  }
  return counts;
}

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: allCountries, error: cErr } = await sb
    .from('souvera_countries')
    .select('id, iso3, name, region')
    .order('iso3');
  if (cErr) { console.error(cErr.message); process.exit(1); }

  // Scope to Souvera's 74 covered markets only — the full table holds all 250 ISO3.
  const countries = (allCountries ?? []).filter((c) => COVERED_ISO3.has(String(c.iso3).toUpperCase()));

  const { data: indicators, error: iErr } = await sb
    .from('souvera_indicators')
    .select('id, key');
  if (iErr) { console.error(iErr.message); process.exit(1); }

  const indById = new Map<string, string>();
  for (const i of indicators ?? []) indById.set(String(i.id), String(i.key));

  console.log(`Loaded ${countries?.length ?? 0} countries, ${indicators?.length ?? 0} indicators. Fetching observations...`);
  const observations = await fetchAllObservations(sb);
  console.log(`Fetched ${observations.length} annual observations.`);

  const sectorCounts = await countByCountry(sb, 'souvera_country_sectors', (q) => q.eq('row_status', 'active'));
  const tradeCounts = await countByCountry(sb, 'souvera_country_trade_snapshots');

  // Index observations: country_id → key → set of years (only where value present).
  const byCountry = new Map<string, Map<string, Set<number>>>();
  for (const o of observations) {
    if (o.value_numeric == null) continue;
    const key = indById.get(String(o.indicator_id));
    if (!key) continue;
    const year = Number(String(o.period_date).slice(0, 4));
    if (!Number.isFinite(year)) continue;
    const cid = String(o.country_id);
    if (!byCountry.has(cid)) byCountry.set(cid, new Map());
    const keyMap = byCountry.get(cid)!;
    if (!keyMap.has(key)) keyMap.set(key, new Set());
    keyMap.get(key)!.add(year);
  }

  const audits: MarketAudit[] = [];
  for (const c of countries ?? []) {
    const cid = String(c.id);
    const keyMap = byCountry.get(cid) ?? new Map<string, Set<number>>();

    const headline: MarketAudit['headline'] = {};
    for (const h of HEADLINE_KEYS) {
      const years = keyMap.get(h.key);
      const latestYear = years && years.size ? Math.max(...years) : null;
      headline[h.key] = {
        present: !!years && years.size > 0,
        latestYear,
        has2025: !!years && years.has(CURRENT_YEAR),
      };
    }

    const top20Covered = TOP20_KEYS.filter((k) => keyMap.get(k)?.size).length;
    const allYears = new Set<number>();
    for (const yrs of keyMap.values()) for (const y of yrs) allYears.add(y);

    audits.push({
      iso3: String(c.iso3),
      name: String(c.name),
      region: String(c.region ?? ''),
      headline,
      top20Covered,
      yearsCount: allYears.size,
      sectorsCount: sectorCounts.get(cid) ?? 0,
      tradeSnapshots: tradeCounts.get(cid) ?? 0,
    });
  }

  // ---- Console summary ----
  const missingHeadline = (a: MarketAudit) =>
    HEADLINE_KEYS.filter((h) => !a.headline[h.key].present).map((h) => h.label);

  const worst = [...audits].sort(
    (a, b) => missingHeadline(b).length - missingHeadline(a).length || a.top20Covered - b.top20Covered
  );

  console.log('\n=== Markets with MISSING headline indicators (worst first) ===');
  let cleanCount = 0;
  for (const a of worst) {
    const miss = missingHeadline(a);
    if (miss.length === 0) { cleanCount++; continue; }
    console.log(
      `  ${a.iso3.padEnd(4)} ${a.name.slice(0, 26).padEnd(27)} missing: ${miss.join(', ').padEnd(40)} ` +
      `top20=${a.top20Covered}/20 yrs=${a.yearsCount} sec=${a.sectorsCount} trade=${a.tradeSnapshots}`
    );
  }
  console.log(`\n  ${cleanCount}/${audits.length} markets have all 6 headline indicators present.`);

  // Markets missing 2025 on GDP/growth.
  const no2025 = audits.filter((a) => a.headline.gdp_current_usd.present && !a.headline.gdp_growth_pct.has2025);
  console.log(`\n=== Markets without 2025 GDP-growth observation: ${no2025.length} ===`);
  console.log('  ' + no2025.map((a) => a.iso3).join(' '));

  // Markets with zero sectors / trade.
  const noSectors = audits.filter((a) => a.sectorsCount === 0).map((a) => a.iso3);
  const noTrade = audits.filter((a) => a.tradeSnapshots === 0).map((a) => a.iso3);
  console.log(`\n=== Markets with 0 sector rows (${noSectors.length}) ===\n  ${noSectors.join(' ')}`);
  console.log(`\n=== Markets with 0 trade snapshots (${noTrade.length}) ===\n  ${noTrade.join(' ')}`);

  // ---- Markdown report ----
  const lines: string[] = [];
  lines.push('# Platform Data-Consistency Audit — Findings');
  lines.push('');
  lines.push(`_Generated ${new Date().toISOString()} · ${audits.length} markets · read-only scan of \`souvera_country_observations\` + sectors + trade snapshots._`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **${cleanCount}/${audits.length}** markets have all 6 headline indicators (GDP, Growth, Population, Inflation, FDI, FX).`);
  lines.push(`- **${no2025.length}** markets lack a 2025 GDP-growth observation.`);
  lines.push(`- **${noSectors.length}** markets have 0 active sector rows; **${noTrade.length}** have 0 trade snapshots.`);
  lines.push('');
  lines.push('## Headline indicator coverage (per market)');
  lines.push('');
  lines.push('| ISO3 | Market | GDP | Growth | Pop | Inflation | FDI | FX | Latest yr | Top20 | Yrs | Sectors | Trade |');
  lines.push('|------|--------|-----|--------|-----|-----------|-----|----|-----------|-------|-----|---------|-------|');
  const cell = (h: { present: boolean; has2025: boolean }) => (h.present ? (h.has2025 ? '✅25' : '✅') : '❌');
  for (const a of [...audits].sort((x, y) => x.iso3.localeCompare(y.iso3))) {
    const latest = Math.max(
      0,
      ...HEADLINE_KEYS.map((h) => a.headline[h.key].latestYear ?? 0)
    );
    lines.push(
      `| ${a.iso3} | ${a.name} | ${cell(a.headline.gdp_current_usd)} | ${cell(a.headline.gdp_growth_pct)} | ` +
      `${cell(a.headline.population_total)} | ${cell(a.headline.inflation_cpi_pct)} | ${cell(a.headline.fdi_net_inflows_usd)} | ` +
      `${cell(a.headline.official_exchange_rate)} | ${latest || '—'} | ${a.top20Covered}/20 | ${a.yearsCount} | ${a.sectorsCount} | ${a.tradeSnapshots} |`
    );
  }
  lines.push('');
  lines.push('_Legend: ✅25 = present incl. 2025 · ✅ = present (older vintage) · ❌ = missing._');

  const outPath = path.resolve(process.cwd(), '../../docs/ux/data-consistency-audit-findings.md');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join('\n'));
  console.log(`\n📄 Wrote findings report → docs/ux/data-consistency-audit-findings.md\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
