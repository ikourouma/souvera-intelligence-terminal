/**
 * Zero out agoa_exports_usd for petroleum category rows (crude excluded under AGOA).
 *
 * Run: npx tsx apps/api-gateway/scripts/patch-petroleum-agoa-exports.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: rows, error: fetchErr } = await sb
    .from('souvera_agoa_trade_flows')
    .select('id, iso3, category_group, total_exports_to_us_usd, agoa_exports_usd, non_agoa_exports_usd')
    .eq('category_group', 'petroleum');

  if (fetchErr) throw fetchErr;
  if (!rows?.length) {
    console.log('No petroleum rows found.');
    return;
  }

  let patched = 0;
  for (const row of rows) {
    const total = row.total_exports_to_us_usd ?? 0;
    if ((row.agoa_exports_usd ?? 0) === 0 && total > 0) continue;

    const { error } = await sb
      .from('souvera_agoa_trade_flows')
      .update({
        agoa_exports_usd: 0,
        agoa_share_pct: 0,
        non_agoa_exports_usd: total,
        tariff_savings_usd: 0,
      })
      .eq('id', row.id);

    if (!error) {
      patched++;
      console.log(`  ✅ ${row.iso3} petroleum: agoa_exports → 0 (MFN total $${(total / 1e6).toFixed(1)}M)`);
    } else {
      console.error(`  ❌ ${row.iso3}: ${error.message}`);
    }
  }

  console.log(`\n✅ Patched ${patched} petroleum rows.\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
