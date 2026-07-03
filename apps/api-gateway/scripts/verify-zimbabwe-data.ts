/**
 * Zimbabwe Data Verification Script
 * Verifies that all Zimbabwe data was successfully ingested
 * Run: npx tsx apps/api-gateway/scripts/verify-zimbabwe-data.ts
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('\n=== Zimbabwe Data Verification ===\n');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase credentials');
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Verify country exists
  const { data: country } = await supabase
    .from('souvera_countries')
    .select('id, iso3, name')
    .eq('iso3', 'ZWE')
    .single();

  console.log(`[1/3] Country: ${country?.name} (${country?.iso3})\n`);

  // 2. Check economic indicators
  console.log('[2/3] Economic Indicators (2023-2024):\n');
  const { data: indicators } = await supabase
    .from('souvera_country_observations')
    .select('indicator_id, period_date, value_numeric, souvera_indicators(key, label)')
    .eq('country_id', country!.id)
    .gte('period_date', '2023-01-01')
    .order('period_date', { ascending: false });

  const indicatorsByYear: Record<string, string[]> = {};
  indicators?.forEach((ind: any) => {
    const year = new Date(ind.period_date).getFullYear();
    const key = ind.souvera_indicators?.key;
    if (key) {
      if (!indicatorsByYear[year]) indicatorsByYear[year] = [];
      indicatorsByYear[year].push(key);
    }
  });

  Object.entries(indicatorsByYear)
    .sort(([a], [b]) => Number(b) - Number(a))
    .forEach(([year, keys]) => {
      console.log(`  ${year}: ${keys.length} indicators`);
      console.log(`    ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
    });

  console.log(`\nTotal observations: ${indicators?.length || 0}\n`);

  // 3. Check sectors
  console.log('[3/3] Key Sectors:\n');
  const { data: sectors } = await supabase
    .from('souvera_country_sectors')
    .select('sector_key, sector_label, teaser')
    .eq('country_id', country!.id)
    .eq('row_status', 'active')
    .order('display_order');

  if (sectors && sectors.length > 0) {
    sectors.forEach((s: any) => {
      console.log(`  ✅ ${s.sector_label} (${s.sector_key})`);
      console.log(`     ${s.teaser?.substring(0, 80)}...`);
    });
  } else {
    console.log('  ⚠️  No sectors found');
  }

  // Summary
  console.log('\n=== Verification Summary ===\n');
  console.log(`✅ Country: Zimbabwe (ZWE)`);
  console.log(`✅ Economic indicators (2023-2024): ${indicators?.length || 0} observations`);
  console.log(`✅ Key sectors: ${sectors?.length || 0}/4 sectors`);
  console.log(`\n📊 Data Quality:`);
  console.log(`   - 2023 indicators: ${indicatorsByYear['2023']?.length || 0}`);
  console.log(`   - 2024 indicators: ${indicatorsByYear['2024']?.length || 0}`);
  console.log(`   - Unique indicators: ${new Set([...(indicatorsByYear['2023'] || []), ...(indicatorsByYear['2024'] || [])]).size}`);
  console.log(`\n🎯 Demo Readiness: ${sectors?.length === 4 && indicators && indicators.length >= 20 ? 'READY ✓' : 'NEEDS ATTENTION ⚠️'}\n`);
}

main().catch((error) => {
  console.error('\n❌ Verification error:', error);
  process.exit(1);
});
