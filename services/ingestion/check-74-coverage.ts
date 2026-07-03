import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '../../apps/api-gateway/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkDataCoverage() {
  console.log('\n[check] Verifying 74-market data coverage...\n');
  
  // Check trade snapshots
  const { count: tradeCount, error: tradeError } = await supabase
    .from('souvera_country_trade_snapshots')
    .select('*', { count: 'exact', head: true });

  if (tradeError) {
    console.error('[check] Error checking trade snapshots:', tradeError);
  } else {
    console.log(`[check] Trade snapshots: ${tradeCount || 0} records`);
  }
  
  // Check narratives
  const { count: narrativeCount, error: narrativeError } = await supabase
    .from('souvera_country_profiles')
    .select('*', { count: 'exact', head: true });

  if (narrativeError) {
    console.error('[check] Error checking narratives:', narrativeError);
  } else {
    console.log(`[check] Country narratives: ${narrativeCount || 0} records`);
  }
  
  // Check country sectors
  const { data: sectorData, error: sectorError } = await supabase
    .from('souvera_country_sectors')
    .select('country_id')
    .eq('row_status', 'active');

  if (sectorError) {
    console.error('[check] Error checking sectors:', sectorError);
  } else {
    const uniqueCountries = new Set(sectorData?.map(s => s.country_id));
    console.log(`[check] Countries with sectors: ${uniqueCountries.size}`);
  }
  
  console.log('\n[check] Expected coverage:');
  console.log('  - Trade snapshots: 74 (one per market)');
  console.log('  - Country narratives: 74 (one per market)');
  console.log('  - Countries with sectors: 74 (7 sectors × 74 markets = 518 total)');
  
  const needTradeSnapshots = !tradeCount || tradeCount < 74;
  const needNarratives = !narrativeCount || narrativeCount < 74;
  
  console.log('\n[check] Actions needed:');
  if (needTradeSnapshots) {
    console.log('  ✓ Run: ingest-country-trade-snapshots-74.ts');
  } else {
    console.log('  ✓ Trade snapshots complete');
  }
  
  if (needNarratives) {
    console.log('  ✓ Run: ingest-country-narratives-74.ts');
  } else {
    console.log('  ✓ Narratives complete');
  }
}

checkDataCoverage().catch(console.error);
