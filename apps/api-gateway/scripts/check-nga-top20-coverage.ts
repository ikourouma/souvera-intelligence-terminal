/**
 * @deprecated Use `scripts/check-rollout-top20-coverage.ts` (Phase 0C.1, all 12 rollout ISO3).
 * Verify NGA Top 20 indicator observation coverage in Supabase.
 * Run: npx tsx scripts/check-rollout-top20-coverage.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { TOP20_INDICATOR_KEYS } from '../src/lib/indicators/top20';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env in .env.local');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: country, error: cErr } = await sb
    .from('souvera_countries')
    .select('id')
    .eq('iso3', 'NGA')
    .single();
  if (cErr || !country) throw new Error(cErr?.message ?? 'NGA not found');

  const { data: obs, error: oErr } = await sb
    .from('souvera_country_observations')
    .select('indicator_id, souvera_indicators(key)')
    .eq('country_id', country.id)
    .gte('period_date', '2020-01-01');
  if (oErr) throw new Error(oErr.message);

  const keys = new Set(
    (obs ?? []).map((o) => (o.souvera_indicators as { key: string }).key).filter(Boolean)
  );
  const present = TOP20_INDICATOR_KEYS.filter((k) => keys.has(k));
  const missing = TOP20_INDICATOR_KEYS.filter((k) => !keys.has(k));

  console.log(`NGA observation rows (2020+): ${obs?.length ?? 0}`);
  console.log(`Top 20 keys present: ${present.length} / ${TOP20_INDICATOR_KEYS.length}`);
  if (missing.length) console.log(`Missing: ${missing.join(', ')}`);
  else console.log('Missing: none');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
