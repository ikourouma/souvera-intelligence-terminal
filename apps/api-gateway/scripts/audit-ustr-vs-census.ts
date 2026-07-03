/**
 * Compare USTR "U.S. imports from country" vs Census bilateral exports to U.S.
 * Informational corroboration — USTR is tertiary, Census is primary.
 *
 * Run: npx tsx apps/api-gateway/scripts/audit-ustr-vs-census.ts
 */
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3 } from '../src/lib/market-coverage';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

type UstrMetric = {
  scope: string;
  value_usd: number;
  year: number;
  yoy_pct?: number | null;
};

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

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: countries } = await sb.from('souvera_countries').select('id, iso3').in('iso3', APPROVED_AFRICA_ISO3);
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

  const { data: ustrRows } = await sb
    .from('souvera_ustr_trade_summaries')
    .select('iso3, metrics, source_url, last_reviewed_at');

  type Divergence = {
    iso3: string;
    censusYear: number;
    ustrYear: number;
    censusUsd: number;
    ustrUsd: number;
    deltaPct: number;
  };

  const divergences: Divergence[] = [];
  let compared = 0;
  let aligned = 0;
  let missingUstr = 0;
  let missingCensus = 0;

  for (const iso3 of APPROVED_AFRICA_ISO3) {
    const census = censusByIso.get(iso3);
    const ustrRow = ustrRows?.find((r) => (r.iso3 as string).toUpperCase() === iso3);
    if (!census) {
      missingCensus++;
      continue;
    }
    if (!ustrRow?.metrics) {
      missingUstr++;
      continue;
    }

    const metrics = ustrRow.metrics as UstrMetric[];
    const impFrom = metrics
      .filter((m) => m.scope === 'us_imports_from_country')
      .sort((a, b) => b.year - a.year)[0];
    if (!impFrom?.value_usd) {
      missingUstr++;
      continue;
    }

    compared++;
    const delta = Math.abs(census.exportsToUs - impFrom.value_usd);
    const base = Math.max(census.exportsToUs, impFrom.value_usd, 1);
    const deltaPct = Math.round((delta / base) * 1000) / 10;
    if (deltaPct > 10) {
      divergences.push({
        iso3,
        censusYear: census.year,
        ustrYear: impFrom.year,
        censusUsd: census.exportsToUs,
        ustrUsd: impFrom.value_usd,
        deltaPct,
      });
    } else {
      aligned++;
    }
  }

  divergences.sort((a, b) => b.deltaPct - a.deltaPct);

  console.log('\n=== USTR vs Census Corroboration Audit (Africa) ===\n');
  console.log(`USTR summary rows: ${ustrRows?.length ?? 0}`);
  console.log(`Compared: ${compared} · Aligned (≤10%): ${aligned} · Divergent: ${divergences.length}`);
  console.log(`Missing Census: ${missingCensus} · Missing USTR import metric: ${missingUstr}\n`);

  if (divergences.length) {
    console.log('ISO3 | Cens.Yr | USTR.Yr | Census exp→US | USTR imp←country | Δ%');
    console.log('-----|---------|---------|---------------|------------------|----');
    for (const d of divergences.slice(0, 25)) {
      console.log(
        `${d.iso3.padEnd(4)} | ${d.censusYear} | ${d.ustrYear} | ${fmt(d.censusUsd).padStart(13)} | ${fmt(d.ustrUsd).padStart(16)} | ${d.deltaPct}%`
      );
    }
    if (divergences.length > 25) console.log(`... and ${divergences.length - 25} more`);
  }

  console.log('\nNote: USTR "imports from country" ≈ Census "exports to U.S." — divergences often reflect vintage/scope differences.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
