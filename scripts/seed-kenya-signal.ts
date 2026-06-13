/**
 * Seed Kenya signal scores.
 * Run: npx tsx scripts/seed-kenya-signal.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  console.log('🚀 Seeding Kenya signal scores...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: country } = await supabase
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', 'KEN')
    .single();

  if (!country) {
    console.error('❌ Kenya not found');
    process.exit(1);
  }

  const { error } = await supabase.from('souvera_country_signal_scores').upsert(
    {
      country_id: country.id,
      signal_level: 'high_growth',
      growth_score: 82,
      risk_score: 52,
      investment_score: 76,
      confidence_score: 78,
      scoring_version: 'v1.0-preview',
      computed_at: new Date().toISOString(),
    },
    { onConflict: 'country_id' }
  );

  if (error) {
    console.error('❌ Signal upsert failed:', error.message);
    process.exit(1);
  }

  console.log(`✅ Signal scores seeded for ${country.name} (high_growth, 76/78)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
