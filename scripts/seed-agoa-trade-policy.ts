/**
 * Seed AGOA trade policy statuses for sub-Saharan African pilot countries.
 * Run: npx tsx scripts/seed-agoa-trade-policy.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { AGOA_COUNTRY_STATUSES } from '../apps/api-gateway/src/data/agoa-full-coverage';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  console.log('🚀 Seeding AGOA trade policy statuses...\n');

  let ok = 0;
  let skip = 0;

  for (const row of AGOA_COUNTRY_STATUSES) {
    const { data: country } = await supabase
      .from('souvera_countries')
      .select('id, name')
      .eq('iso3', row.country_iso3)
      .maybeSingle();

    if (!country) {
      console.warn(`⚠️  ${row.country_iso3}: country not found — skipped`);
      skip++;
      continue;
    }

    const { error } = await supabase.from('souvera_trade_policy_statuses').upsert(
      {
        country_id: country.id,
        agoa_status: row.agoa_status,
        agoa_eligible_since: row.agoa_eligible_since ?? null,
        agoa_apparel_eligible: row.agoa_apparel_eligible,
        agoa_suspension_date: row.agoa_suspension_date ?? null,
        agoa_notes: row.agoa_notes ?? null,
        agoa_source_url: row.agoa_source_url,
        agoa_as_of_date: row.agoa_as_of_date,
        agoa_last_reviewed_at: row.agoa_last_reviewed_at,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'country_id' }
    );

    if (error) {
      if (error.message.includes('souvera_trade_policy_statuses')) {
        console.error(`❌ ${row.country_iso3}: table missing — run phase-4b migration first`);
        console.error('   Fallback: API serves curated static data from agoa-legislative-tracker.ts');
        process.exit(1);
      }
      console.error(`❌ ${row.country_iso3}: ${error.message}`);
    } else {
      console.log(`✅ ${row.country_iso3}: ${row.agoa_status}`);
      ok++;
    }
  }

  console.log(`\n✅ Done! ${ok} seeded, ${skip} skipped.`);
  console.log('   Verify: /intelligence/trade/agoa');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
