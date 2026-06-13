/**
 * Seed Jamaica signal scores.
 * Run: npx tsx scripts/seed-jamaica-signal.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  console.log('🚀 Seeding Jamaica signal scores...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: country } = await supabase
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', 'JAM')
    .single();

  if (!country) {
    console.error('❌ Jamaica not found');
    process.exit(1);
  }

  const { error } = await supabase.from('souvera_country_signal_scores').upsert(
    {
      country_id: country.id,
      signal_level: 'emerging',
      growth_score: 72,
      risk_score: 48,
      investment_score: 68,
      confidence_score: 74,
      scoring_version: 'v1.0-preview',
      computed_at: new Date().toISOString(),
    },
    { onConflict: 'country_id' }
  );

  if (error) {
    console.error('❌ Signal upsert failed:', error.message);
    process.exit(1);
  }

  console.log(`✅ Signal scores seeded for ${country.name} (emerging, 68/74)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
