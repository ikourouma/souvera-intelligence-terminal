/**
 * Recompute tariff_savings_usd from stored agoa_exports_usd × mfn_tariff_pct.
 * Does not invent MFN rates — rows missing mfn_tariff_pct are flagged only.
 *
 * Run: npx tsx apps/api-gateway/scripts/recompute-agoa-tariff-savings.ts
 *      npx tsx apps/api-gateway/scripts/recompute-agoa-tariff-savings.ts --dry-run
 */
import { createClient } from '@supabase/supabase-js';
import { loadProjectEnv } from './load-env-local';

loadProjectEnv();

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: rows, error } = await sb
    .from('souvera_agoa_trade_flows')
    .select('id, iso3, category_group, agoa_exports_usd, mfn_tariff_pct, tariff_savings_usd')
    .gt('agoa_exports_usd', 0);

  if (error) throw new Error(error.message);

  let updated = 0;
  let skippedNoMfn = 0;
  let unchanged = 0;

  for (const row of rows ?? []) {
    if (row.mfn_tariff_pct == null) {
      skippedNoMfn++;
      continue;
    }
    const computed = Math.round((row.agoa_exports_usd ?? 0) * (row.mfn_tariff_pct / 100));
    if (row.tariff_savings_usd === computed) {
      unchanged++;
      continue;
    }
    if (!dryRun) {
      const { error: upErr } = await sb
        .from('souvera_agoa_trade_flows')
        .update({ tariff_savings_usd: computed })
        .eq('id', row.id);
      if (upErr) {
        console.log(`  ❌ ${row.iso3}/${row.category_group}: ${upErr.message}`);
        continue;
      }
    }
    updated++;
  }

  console.log(`\n=== Recompute AGOA tariff savings ${dryRun ? '(dry run)' : ''} ===`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Unchanged: ${unchanged}`);
  console.log(`  Skipped (no mfn_tariff_pct): ${skippedNoMfn}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
