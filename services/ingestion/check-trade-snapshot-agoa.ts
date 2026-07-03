/**
 * Check which countries have AGOA metrics in trade snapshots
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '../../apps/api-gateway/.env.local' });

async function checkTradeSnapshotAgoa() {
  console.log('\n[check] Checking AGOA metrics in trade snapshots...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);
  
  // Get all trade snapshots
  const { data: snapshots, error } = await supabase
    .from('souvera_country_trade_snapshots')
    .select('country_id, year, trade_summary_md')
    .order('year', { ascending: false });

  if (error) {
    console.error('[check] Error:', error);
    process.exit(1);
  }

  console.log(`[check] Found ${snapshots?.length || 0} trade snapshots\n`);

  // Parse _meta from trade_summary_md to check for AGOA metrics
  let withAgoaMetrics = 0;
  let withoutAgoaMetrics = 0;
  const samplesWithAgoa: string[] = [];
  const samplesWithoutAgoa: string[] = [];

  for (const snap of snapshots || []) {
    const summaryMd = snap.trade_summary_md as string || '';
    let hasAgoaMetrics = false;
    
    if (summaryMd.startsWith('{"_meta":')) {
      try {
        const firstLine = summaryMd.split('\n')[0];
        const meta = JSON.parse(firstLine)._meta;
        
        // Check if AGOA metrics exist and are not null/zero
        hasAgoaMetrics = 
          (meta.agoa_current_exports_usd != null && meta.agoa_current_exports_usd !== 0) ||
          (meta.agoa_potential_exports_usd != null && meta.agoa_potential_exports_usd !== 0) ||
          (meta.agoa_eligible_categories != null && meta.agoa_eligible_categories !== 0);
      } catch {}
    }
    
    if (hasAgoaMetrics) {
      withAgoaMetrics++;
      if (samplesWithAgoa.length < 5) {
        // Get country ISO3
        const { data: country } = await supabase
          .from('souvera_countries')
          .select('iso3, name')
          .eq('id', snap.country_id)
          .single();
        if (country) samplesWithAgoa.push(`${country.name} (${country.iso3})`);
      }
    } else {
      withoutAgoaMetrics++;
      if (samplesWithoutAgoa.length < 5) {
        const { data: country } = await supabase
          .from('souvera_countries')
          .select('iso3, name')
          .eq('id', snap.country_id)
          .single();
        if (country) samplesWithoutAgoa.push(`${country.name} (${country.iso3})`);
      }
    }
  }

  console.log(`[check] Trade snapshots with AGOA metrics: ${withAgoaMetrics}`);
  console.log(`[check] Trade snapshots without AGOA metrics: ${withoutAgoaMetrics}\n`);

  if (samplesWithAgoa.length > 0) {
    console.log('[check] Sample countries WITH AGOA metrics:');
    samplesWithAgoa.forEach(c => console.log(`  ✓ ${c}`));
  }

  if (samplesWithoutAgoa.length > 0) {
    console.log('\n[check] Sample countries WITHOUT AGOA metrics:');
    samplesWithoutAgoa.forEach(c => console.log(`  ✗ ${c}`));
  }

  console.log('\n[check] Recommendation:');
  if (withoutAgoaMetrics > withAgoaMetrics) {
    console.log('  ⚠️  Most countries lack AGOA metrics in trade snapshots');
    console.log('  💡 Solution: Run ingest-agoa-flows.ts to populate AGOA trade data');
  }
}

checkTradeSnapshotAgoa().catch(console.error);
