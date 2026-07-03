/**
 * Audit AfCETA corridor signal consistency.
 *
 * Run: npx tsx --tsconfig apps/api-gateway/tsconfig.json apps/api-gateway/scripts/audit-afceta-corridor-consistency.ts
 */
import { createClient } from '@supabase/supabase-js';
import { loadProjectEnv } from './load-env-local';
import { AFCETA_SPOTLIGHT_PAIRS } from '@/lib/intelligence/afceta-spotlights';

loadProjectEnv();

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data, error } = await sb.from('souvera_afceta_corridor_signals').select('*');
  if (error) {
    if (error.message.includes('does not exist')) {
      console.error('FAIL: souvera_afceta_corridor_signals table missing — run migration first');
      process.exit(1);
    }
    throw error;
  }

  const rows = data ?? [];
  let failures = 0;

  console.log(`\n[AfCETA audit] ${rows.length} corridor signals\n`);

  if (rows.length === 0) {
    console.error('FAIL: no corridor signals — run seed script');
    process.exit(1);
  }

  // Spotlight coverage
  for (const pair of AFCETA_SPOTLIGHT_PAIRS) {
    for (const cat of pair.categories) {
      const found = rows.some(
        (r) =>
          r.origin_iso3 === pair.origin_iso3 &&
          r.dest_iso3 === pair.dest_iso3 &&
          r.direction === pair.direction &&
          r.category_group === cat &&
          r.is_spotlight,
      );
      if (!found) {
        console.error(`FAIL: missing spotlight ${pair.label} / ${cat}`);
        failures++;
      }
    }
  }

  // KNA host spotlight
  const knaRows = rows.filter((r) => r.origin_iso3 === 'KNA' || r.dest_iso3 === 'KNA');
  if (knaRows.length === 0) {
    console.error('FAIL: no KNA (forum host) corridor signals');
    failures++;
  } else {
    console.log(`  ✓ KNA corridors: ${knaRows.length}`);
  }

  // Score sanity
  const badScores = rows.filter((r) => r.opportunity_score < 0 || r.opportunity_score > 100);
  if (badScores.length > 0) {
    console.error(`FAIL: ${badScores.length} rows with invalid opportunity_score`);
    failures++;
  }

  // Top products always 3
  const badProducts = rows.filter((r) => !Array.isArray(r.top_products) || r.top_products.length !== 3);
  if (badProducts.length > 0) {
    console.error(`FAIL: ${badProducts.length} rows without exactly 3 top_products`);
    failures++;
  }

  const spotlights = rows.filter((r) => r.is_spotlight);
  console.log(`  ✓ Spotlights: ${spotlights.length}`);
  console.log(`  ✓ Directions: africa→carib ${rows.filter((r) => r.direction === 'africa_to_caribbean').length}, carib→africa ${rows.filter((r) => r.direction === 'caribbean_to_africa').length}`);

  if (failures > 0) {
    console.error(`\n[AfCETA audit] ${failures} failure(s)\n`);
    process.exit(1);
  }

  console.log('\n[AfCETA audit] PASS\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
