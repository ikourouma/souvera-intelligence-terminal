/**
 * Audit trade snapshot consistency across 74 markets.
 * Flags: total != exports + imports, mixed global/bilateral columns, Caribbean AGOA policy bleed.
 *
 * Run: npx tsx apps/api-gateway/scripts/audit-trade-snapshot-consistency.ts
 */
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

const COVERED = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];

type Row = {
  iso3: string;
  year: number | null;
  total_trade_usd: number | null;
  exports_usd: number | null;
  imports_usd: number | null;
  exports_to_us_usd: number | null;
  imports_from_us_usd: number | null;
  source_notes: string | null;
  trade_summary_md: string | null;
};

function parseMeta(md: string | null): Record<string, number | null> {
  if (!md?.startsWith('{"_meta":')) return {};
  try {
    return JSON.parse(md.split('\n')[0])._meta ?? {};
  } catch {
    return {};
  }
}

function num(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
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
    .select(
      'country_id, year, total_trade_usd, exports_usd, imports_usd, exports_to_us_usd, imports_from_us_usd, source_notes, trade_summary_md'
    )
    .in('country_id', [...byId.keys()]);

  const latestByIso = new Map<string, Row>();
  for (const s of snaps ?? []) {
    const iso3 = byId.get(s.country_id as string);
    if (!iso3) continue;
    const cur = latestByIso.get(iso3);
    if (!cur || (s.year as number) > (cur.year ?? 0)) {
      latestByIso.set(iso3, {
        iso3,
        year: s.year as number,
        total_trade_usd: num(s.total_trade_usd),
        exports_usd: num(s.exports_usd),
        imports_usd: num(s.imports_usd),
        exports_to_us_usd: num(s.exports_to_us_usd),
        imports_from_us_usd: num(s.imports_from_us_usd),
        source_notes: s.source_notes as string | null,
        trade_summary_md: s.trade_summary_md as string | null,
      });
    }
  }

  const mathMismatch: string[] = [];
  const mixedScope: string[] = [];
  const missingSnap: string[] = [];
  const censusOnly: string[] = [];

  for (const iso of COVERED) {
    const row = latestByIso.get(iso);
    if (!row) {
      missingSnap.push(iso);
      continue;
    }

    const meta = parseMeta(row.trade_summary_md);
    const metaExp = num(meta.exports_usd);
    const metaImp = num(meta.imports_usd);
    const metaTotal = num(meta.total_trade_usd);
    const isCensus = (row.source_notes ?? '').toLowerCase().includes('census');

    const hasColGlobal = row.exports_usd != null || row.imports_usd != null;
    const hasMetaGlobal = metaExp != null || metaImp != null;
    const hasBilateral = row.exports_to_us_usd != null || row.imports_from_us_usd != null;

    if (isCensus && (hasMetaGlobal || hasColGlobal) && hasBilateral) {
      mixedScope.push(
        `${iso}: Census bilateral cols + legacy global meta (exp_meta=${metaExp}, imp_meta=${metaImp}, exp_us=${row.exports_to_us_usd}, imp_us=${row.imports_from_us_usd})`
      );
    }

    if (isCensus && !hasColGlobal && !hasMetaGlobal && hasBilateral) {
      censusOnly.push(iso);
    }

    const exp = row.exports_usd ?? metaExp ?? row.exports_to_us_usd;
    const imp = row.imports_usd ?? metaImp ?? row.imports_from_us_usd;
    const total = row.total_trade_usd ?? metaTotal;

    if (exp != null && imp != null && total != null) {
      const sum = exp + imp;
      const delta = Math.abs(sum - total);
      const tolerance = Math.max(sum * 0.001, 1000);
      if (delta > tolerance) {
        mathMismatch.push(
          `${iso} (${row.year}): total=${total.toLocaleString()} vs exp+imp=${sum.toLocaleString()} (Δ ${delta.toLocaleString()}) [census=${isCensus}]`
        );
      }
    }
  }

  // COD AGOA category breakdown
  const { data: codFlows } = await sb
    .from('souvera_agoa_trade_flows')
    .select('year, category_group, total_exports_to_us_usd, agoa_exports_usd')
    .eq('iso3', 'COD')
    .order('year', { ascending: false });

  const codYear = codFlows?.[0]?.year;
  const codByCat = (codFlows ?? [])
    .filter((f) => f.year === codYear)
    .map((f) => ({
      cat: f.category_group,
      total: f.total_exports_to_us_usd,
      agoa: f.agoa_exports_usd,
    }));

  console.log('\n=== Trade Snapshot Consistency Audit (74 markets) ===\n');
  console.log(`Snapshots found: ${latestByIso.size}/74`);
  console.log(`Census-only (bilateral, no global): ${censusOnly.length}`);
  console.log(`Math mismatch (total ≠ exp+imp): ${mathMismatch.length}`);
  console.log(`Mixed Census + legacy global: ${mixedScope.length}`);
  console.log(`Missing snapshot: ${missingSnap.length}`);

  if (mathMismatch.length) {
    console.log('\n--- Math mismatches ---');
    mathMismatch.slice(0, 30).forEach((l) => console.log(' ', l));
    if (mathMismatch.length > 30) console.log(`  ... +${mathMismatch.length - 30} more`);
  }
  if (mixedScope.length) {
    console.log('\n--- Mixed scope (root cause for JAM-style bugs) ---');
    mixedScope.forEach((l) => console.log(' ', l));
  }
  if (missingSnap.length) {
    console.log('\n--- Missing snapshots ---', missingSnap.join(', '));
  }

  console.log(`\n--- COD AGOA flows (${codYear}) ---`);
  let codTotal = 0;
  let codAgoa = 0;
  for (const c of codByCat) {
    codTotal += Number(c.total ?? 0);
    codAgoa += Number(c.agoa ?? 0);
    console.log(`  ${c.cat}: total=$${((c.total ?? 0) / 1e6).toFixed(1)}M agoa=$${((c.agoa ?? 0) / 1e6).toFixed(1)}M`);
  }
  console.log(`  SUM: total=$${(codTotal / 1e6).toFixed(1)}M agoa=$${(codAgoa / 1e6).toFixed(1)}M (petroleum excluded from preferential sums in API)`);

  const exitCode = mathMismatch.length + mixedScope.length > 0 ? 1 : 0;
  process.exit(exitCode);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
