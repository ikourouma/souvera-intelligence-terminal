/**
 * Rwanda's AGOA apparel benefits are suspended (effective Jul 31 2018). Zero out the
 * modeled preferential share for RWA textiles_apparel so it is not counted as AGOA-preferential,
 * while leaving the bilateral export total intact. Idempotent.
 * Run: npx tsx apps/api-gateway/scripts/fix-rwa-apparel-suspension.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await sb
    .from('souvera_agoa_trade_flows')
    .update({ agoa_share_pct: 0, agoa_exports_usd: 0, source_notes: 'AGOA apparel benefits suspended (Jul 31 2018) — not preferential' })
    .eq('iso3', 'RWA')
    .eq('category_group', 'textiles_apparel')
    .select('id');
  if (error) { console.error(error.message); process.exit(1); }
  console.log(`Zeroed RWA textiles_apparel preferential share on ${data?.length ?? 0} row(s).`);
}
main().catch((e) => { console.error(e); process.exit(1); });
