/**
 * Phase 0C.1 — Top 20 + extension indicator coverage for all 12 rollout markets.
 * Run from apps/api-gateway: npm run check:rollout-top20
 * Or: npx tsx scripts/check-rollout-top20-coverage.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { TOP20_INDICATORS } from '../src/lib/indicators/top20';
import { ALL_ROLLOUT_ISO3 } from '../src/lib/intelligence/rollout-manifest';
import { ROLLOUT_MACRO_COVERAGE_KEYS } from '../src/lib/intelligence/build-economy-years';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

/** Phase 0 exit gate: 12/12 markets ≥18/20 Top 20 keys. */
const MIN_TOP20_PRESENT = 18;
const TOP20_KEYS = TOP20_INDICATORS.map((i) => i.indicatorKey);
const EXTENSION_KEYS = ROLLOUT_MACRO_COVERAGE_KEYS.filter((k) => !TOP20_KEYS.includes(k));

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  let failed = 0;

  console.log('\n=== Rollout Top 20 Coverage (2020+) ===\n');

  for (const iso3 of ALL_ROLLOUT_ISO3) {
    const { data: country } = await sb
      .from('souvera_countries')
      .select('id')
      .eq('iso3', iso3)
      .maybeSingle();

    if (!country) {
      console.log(`❌ ${iso3}: country row missing`);
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
    const top20Present = TOP20_KEYS.filter((k) => keys.has(k));
    const top20Missing = TOP20_KEYS.filter((k) => !keys.has(k));
    const extPresent = EXTENSION_KEYS.filter((k) => keys.has(k));
    const ok = top20Present.length >= MIN_TOP20_PRESENT;

    console.log(
      `${ok ? '✅' : '⚠️'} ${iso3}: Top20 ${top20Present.length}/${TOP20_KEYS.length} · ext ${extPresent.length}/${EXTENSION_KEYS.length} (${obs?.length ?? 0} obs)`
    );
    if (top20Missing.length && top20Missing.length <= 6) {
      console.log(`   top20 missing: ${top20Missing.join(', ')}`);
    } else if (top20Missing.length) {
      console.log(`   top20 missing: ${top20Missing.length} keys`);
    }
    if (!ok) failed++;
  }

  console.log(
    failed
      ? `\n${failed} markets below ${MIN_TOP20_PRESENT}/20 Top 20 threshold`
      : '\nAll rollout markets meet Phase 0 Top 20 threshold.'
  );
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
