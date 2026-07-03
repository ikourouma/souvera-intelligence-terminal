/**
 * Strip legacy global _meta aggregates from Census-backed trade snapshots.
 * Prevents total ≠ exports + imports when static migration meta coexists with Census cols.
 *
 * Run: npx tsx apps/api-gateway/scripts/reconcile-census-snapshot-meta.ts
 */
import { createClient } from '@supabase/supabase-js';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

const META_AGG_KEYS = [
  'total_trade_usd',
  'exports_usd',
  'imports_usd',
  'exports_to_us_usd',
  'imports_from_us_usd',
  'exports_to_us_yoy_pct',
  'imports_from_us_yoy_pct',
];

function stripMetaAggregates(md: string | null): string | null {
  if (!md?.startsWith('{"_meta":')) return md;
  try {
    const lines = md.split('\n');
    const parsed = JSON.parse(lines[0]) as { _meta?: Record<string, unknown> };
    if (!parsed._meta) return md;
    for (const k of META_AGG_KEYS) delete parsed._meta[k];
    if (Object.keys(parsed._meta).length === 0) {
      const rest = lines.slice(1).join('\n').trim();
      return rest || null;
    }
    lines[0] = JSON.stringify({ _meta: parsed._meta });
    return lines.join('\n');
  } catch {
    return md;
  }
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: rows, error } = await sb
    .from('souvera_country_trade_snapshots')
    .select('id, country_id, year, trade_summary_md, source_notes, exports_usd, imports_usd')
    .ilike('source_notes', '%Census%');

  if (error) throw new Error(error.message);

  let patched = 0;
  for (const row of rows ?? []) {
    const cleaned = stripMetaAggregates(row.trade_summary_md as string | null);
    const needsMeta = cleaned !== row.trade_summary_md;
    const needsCols = row.exports_usd != null || row.imports_usd != null;
    if (!needsMeta && !needsCols) continue;

    const { error: upErr } = await sb
      .from('souvera_country_trade_snapshots')
      .update({
        trade_summary_md: cleaned,
        exports_usd: null,
        imports_usd: null,
      })
      .eq('id', row.id);

    if (upErr) {
      console.error(`  ✗ ${row.id}: ${upErr.message}`);
    } else {
      patched++;
    }
  }

  console.log(`\n[Census meta reconcile] Patched ${patched}/${rows?.length ?? 0} Census snapshot rows\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
