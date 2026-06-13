/**
 * Seed economic_momentum + investor_readiness on country profiles (NGA + JAM + KEN).
 * Run: npx tsx scripts/seed-country-momentum.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MOMENTUM: Record<string, { economic_momentum: string; investor_readiness: string }> = {
  NGA: { economic_momentum: '55', investor_readiness: '74' },
  JAM: { economic_momentum: '28', investor_readiness: '68' },
  KEN: { economic_momentum: '42', investor_readiness: '72' },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  console.log('🚀 Seeding country momentum (NGA + JAM + KEN)...\n');

  for (const [iso3, values] of Object.entries(MOMENTUM)) {
    const { data: country } = await supabase
      .from('souvera_countries')
      .select('id, name')
      .eq('iso3', iso3)
      .maybeSingle();

    if (!country) {
      console.warn(`⚠️  ${iso3}: country not found`);
      continue;
    }

    const { error } = await supabase
      .from('souvera_country_profiles')
      .update({
        economic_momentum: values.economic_momentum,
        investor_readiness: values.investor_readiness,
        updated_at: new Date().toISOString(),
      })
      .eq('country_id', country.id);

    if (error) {
      console.error(`❌ ${iso3}: ${error.message}`);
    } else {
      console.log(
        `✅ ${iso3}: momentum ${values.economic_momentum}, readiness ${values.investor_readiness}`
      );
    }
  }

  console.log('\n✅ Done! Economic Momentum card should populate after refresh.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
