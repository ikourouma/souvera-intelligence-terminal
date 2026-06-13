/**
 * Phase 0X — Top 20 coverage for all 74 approved Souvera markets.
 * Run: npm run check:all74-top20
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { TOP20_INDICATORS } from '../src/lib/indicators/top20';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ALL74_ISO3 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];
/** Accelerated gate for Phase 2 SDM (per implementation plan). */
const MIN_TOP20_PRESENT = 15;
const TOP20_KEYS = TOP20_INDICATORS.map((i) => i.indicatorKey);

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  let failed = 0;
  let africaOk = 0;
  let caribbeanOk = 0;

  console.log(`\n=== All 74 Markets Top 20 Coverage (threshold ≥${MIN_TOP20_PRESENT}/20) ===\n`);

  for (const iso3 of ALL74_ISO3) {
    const region = APPROVED_AFRICA_ISO3.includes(iso3 as (typeof APPROVED_AFRICA_ISO3)[number])
      ? 'Africa'
      : 'Caribbean';

    const { data: country } = await sb
      .from('souvera_countries')
      .select('id')
      .eq('iso3', iso3)
      .maybeSingle();

    if (!country) {
      console.log(`❌ ${iso3} (${region}): country row missing`);
      failed++;
      continue;
    }

    const { data: obs, error } = await sb
      .from('souvera_country_observations')
      .select('indicator_id, souvera_indicators(key)')
      .eq('country_id', country.id)
      .gte('period_date', '2020-01-01');

    if (error) {
      console.log(`❌ ${iso3}: ${error.message}`);
      failed++;
      continue;
    }

    const keys = new Set(
      (obs ?? []).map((o) => (o.souvera_indicators as { key: string } | null)?.key).filter(Boolean)
    );
    const present = TOP20_KEYS.filter((k) => keys.has(k));
    const ok = present.length >= MIN_TOP20_PRESENT;

    console.log(
      `${ok ? '✅' : '⚠️'} ${iso3} (${region}): ${present.length}/${TOP20_KEYS.length} (${obs?.length ?? 0} obs)`
    );
    if (!ok) failed++;
    else if (region === 'Africa') africaOk++;
    else caribbeanOk++;
  }

  console.log(`\nAfrica: ${africaOk}/54 · Caribbean: ${caribbeanOk}/20`);
  console.log(
    failed
      ? `\n${failed} markets below ${MIN_TOP20_PRESENT}/20 threshold`
      : `\nAll 74 markets meet accelerated Phase 2 data gate.`
  );
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
