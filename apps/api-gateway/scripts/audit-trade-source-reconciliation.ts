/**
 * Audit Census bilateral exports vs USITC category-flow totals across 74 markets.
 * Flags markets where sources diverge >5% (same rule as country API reconciliation banner).
 *
 * Run: npx tsx apps/api-gateway/scripts/audit-trade-source-reconciliation.ts
 */
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';
import { buildTradeSourceReconciliation } from '../src/lib/intelligence/trade-source-reconciliation';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

const COVERED = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];
const PAGE = 1000;

function num(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function fmt(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function sumCategoryFlowTotal(rows: Array<{ total_exports_to_us_usd: unknown }>): number {
  return rows.reduce((s, r) => s + (num(r.total_exports_to_us_usd) ?? 0), 0);
}

function pickFlowYear(
  censusYear: number,
  yearMap: Map<number, Array<{ total_exports_to_us_usd: unknown }>>
): { year: number; total: number } | null {
  const censusRows = yearMap.get(censusYear);
  const censusTotal = censusRows ? sumCategoryFlowTotal(censusRows) : 0;
  if (censusTotal >= 1_000_000) return { year: censusYear, total: censusTotal };

  const years = [...yearMap.keys()].sort((a, b) => b - a);
  for (const y of years) {
    const total = sumCategoryFlowTotal(yearMap.get(y) ?? []);
    if (total >= 1_000_000) return { year: y, total };
  }
  return null;
}

async function fetchAllFlows(
  sb: ReturnType<typeof createClient>
): Promise<Array<{ iso3: string; year: number; total_exports_to_us_usd: unknown }>> {
  const rows: Array<{ iso3: string; year: number; total_exports_to_us_usd: unknown }> = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from('souvera_agoa_trade_flows')
      .select('iso3, year, total_exports_to_us_usd')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...(data as typeof rows));
    if (data.length < PAGE) break;
  }
  return rows;
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: countries } = await sb.from('souvera_countries').select('id, iso3').in('iso3', COVERED);
  const byId = new Map((countries ?? []).map((c) => [c.id, c.iso3]));

  const { data: snaps } = await sb
    .from('souvera_country_trade_snapshots')
    .select('country_id, year, exports_to_us_usd')
    .in('country_id', [...byId.keys()]);

  const censusByIso = new Map<string, { year: number; exportsToUs: number }>();
  for (const s of snaps ?? []) {
    const iso3 = byId.get(s.country_id as string);
    const exportsToUs = num(s.exports_to_us_usd);
    if (!iso3 || exportsToUs == null) continue;
    const cur = censusByIso.get(iso3);
    if (!cur || (s.year as number) > cur.year) {
      censusByIso.set(iso3, { year: s.year as number, exportsToUs });
    }
  }

  const flows = await fetchAllFlows(sb);
  const flowsByIso = new Map<string, Map<number, Array<{ total_exports_to_us_usd: unknown }>>>();
  for (const f of flows) {
    const iso3 = f.iso3.toUpperCase();
    if (!flowsByIso.has(iso3)) flowsByIso.set(iso3, new Map());
    const yearMap = flowsByIso.get(iso3)!;
    const year = f.year;
    if (!yearMap.has(year)) yearMap.set(year, []);
    yearMap.get(year)!.push(f);
  }

  type Divergence = {
    iso3: string;
    censusYear: number;
    flowYear: number;
    censusUsd: number;
    categoryFlowUsd: number;
    deltaUsd: number;
    deltaPct: number;
  };

  const divergences: Divergence[] = [];
  let compared = 0;
  let aligned = 0;
  let missingCensus = 0;
  let missingFlows = 0;

  for (const iso3 of COVERED) {
    const census = censusByIso.get(iso3);
    const yearMap = flowsByIso.get(iso3);
    if (!census) {
      missingCensus++;
      continue;
    }
    if (!yearMap?.size) {
      missingFlows++;
      continue;
    }

    const picked = pickFlowYear(census.year, yearMap);
    if (!picked) {
      missingFlows++;
      continue;
    }

    compared++;
    const recon = buildTradeSourceReconciliation(
      census.exportsToUs,
      picked.total,
      census.year,
      { categoryFlowYear: picked.year }
    );
    if (recon) {
      divergences.push({
        iso3,
        censusYear: census.year,
        flowYear: picked.year,
        censusUsd: census.exportsToUs,
        categoryFlowUsd: picked.total,
        deltaUsd: recon.deltaUsd,
        deltaPct: recon.deltaPct,
      });
    } else {
      aligned++;
    }
  }

  divergences.sort((a, b) => b.deltaPct - a.deltaPct);

  console.log('\n=== Trade Source Reconciliation Audit (74 markets) ===\n');
  console.log(`Flow rows loaded: ${flows.length} (paginated)`);
  console.log(`Compared: ${compared} · Aligned (≤5%): ${aligned} · Divergent: ${divergences.length}`);
  console.log(`Missing Census bilateral: ${missingCensus} · Missing category flows: ${missingFlows}\n`);

  if (divergences.length) {
    console.log('ISO3 | Cens.Yr | Flow.Yr | Census bilateral | Category flows | Δ USD | Δ %');
    console.log('-----|---------|---------|------------------|----------------|-------|-----');
    for (const d of divergences) {
      console.log(
        `${d.iso3.padEnd(4)} | ${d.censusYear} | ${d.flowYear} | ${fmt(d.censusUsd).padStart(16)} | ${fmt(d.categoryFlowUsd).padStart(14)} | ${fmt(d.deltaUsd).padStart(5)} | ${d.deltaPct}%`
      );
    }
  }

  const cod = divergences.find((d) => d.iso3 === 'COD') ?? (() => {
    const census = censusByIso.get('COD');
    const picked = census ? pickFlowYear(census.year, flowsByIso.get('COD') ?? new Map()) : null;
    if (!census || !picked) return null;
    const recon = buildTradeSourceReconciliation(census.exportsToUs, picked.total, census.year, {
      categoryFlowYear: picked.year,
    });
    return recon
      ? {
          iso3: 'COD',
          censusYear: census.year,
          flowYear: picked.year,
          censusUsd: census.exportsToUs,
          categoryFlowUsd: picked.total,
          deltaUsd: recon.deltaUsd,
          deltaPct: recon.deltaPct,
        }
      : {
          iso3: 'COD',
          censusYear: census.year,
          flowYear: picked.year,
          censusUsd: census.exportsToUs,
          categoryFlowUsd: picked.total,
          deltaUsd: Math.abs(census.exportsToUs - picked.total),
          deltaPct: 0,
        };
  })();

  console.log('\n--- COD (DR Congo) ---');
  if (cod) {
    console.log(
      `Census bilateral (${cod.censusYear}): ${fmt(cod.censusUsd)} · USITC category-flow sum (${cod.flowYear}): ${fmt(cod.categoryFlowUsd)} · Δ ${fmt(cod.deltaUsd)} (${cod.deltaPct}%)`
    );
    console.log(
      'Interpretation: Census is authoritative all-goods bilateral; category flows sum sector buckets (minerals included, petroleum excluded from preferential metrics only). Gap reflects HS aggregation / vintage — not a data error.'
    );
  } else {
    console.log('COD: insufficient Census or category-flow data');
  }

  console.log(`\nAudit complete. ${divergences.length} market(s) exceed 5% divergence threshold.\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
