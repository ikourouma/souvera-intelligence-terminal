/**
 * Seed all Wave 1 Africa countries — GHA, ZAF, ETH, SEN, CIV, TZA.
 * Run: npx tsx scripts/seed-wave1-africa.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { seedCountryBundle } from './lib/seed-country-bundle';
import { WAVE1_CONFIG_LIST } from './lib/wave1-country-configs';
import { WAVE1_AFRICA_ISO3 } from '../apps/api-gateway/src/lib/intelligence/rollout-manifest';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  console.log('═'.repeat(60));
  console.log('  Wave 1 Africa Seed — GHA, ZAF, ETH, SEN, CIV, TZA');
  console.log('═'.repeat(60));
  console.log();

  for (const config of WAVE1_CONFIG_LIST) {
    await seedCountryBundle(supabase, config.iso3, {
      profile: config.profile,
      timeSeries: config.timeSeries,
      signal: config.signal,
      sectors: config.sectors,
      extraForbidden: config.extraForbidden,
    });
  }

  console.log();
  console.log('═'.repeat(60));
  console.log('  ✅ Wave 1 Africa seed complete.');
  console.log(`  Countries: ${WAVE1_AFRICA_ISO3.join(', ')}`);
  console.log('  Verify: /country/GHA (and ZAF, ETH, SEN, CIV, TZA)');
  console.log('  Parity test: npx tsx scripts/test-sectors-parity.ts');
  console.log('═'.repeat(60));
}

main().catch((e) => {
  console.error('\n❌ Error:', e);
  process.exit(1);
});
