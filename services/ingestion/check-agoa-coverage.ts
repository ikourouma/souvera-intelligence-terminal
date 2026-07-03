/**
 * Check AGOA coverage across all countries
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '../../apps/api-gateway/.env.local' });

async function checkAgoaCoverage() {
  console.log('\n[check] Querying AGOA policy status coverage...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);
  
  // Get all AGOA policy records
  const { data: agoaRecords, error } = await supabase
    .from('souvera_country_policy_status')
    .select('country_iso3, status, confidence, evidence_artifact_id')
    .eq('framework', 'AGOA')
    .order('country_iso3');

  if (error) {
    console.error('[check] Error:', error);
    process.exit(1);
  }

  console.log(`[check] Found ${agoaRecords?.length || 0} AGOA policy records\n`);
  
  if (!agoaRecords || agoaRecords.length === 0) {
    console.log('[check] ❌ No AGOA records found!');
    console.log('[check] verify:ustr:agoa may have failed to insert records');
    process.exit(1);
  }

  // Group by status
  const byStatus = agoaRecords.reduce((acc: any, r: any) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  console.log('[check] Status breakdown:');
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  // Check evidence backing
  const withEvidence = agoaRecords.filter(r => r.evidence_artifact_id !== null).length;
  console.log(`\n[check] Evidence-backed: ${withEvidence}/${agoaRecords.length}`);

  // Show countries without AGOA records
  const { data: allCountries } = await supabase
    .from('souvera_countries')
    .select('iso3, name')
    .order('name');

  if (allCountries) {
    const agoaIso3s = new Set(agoaRecords.map(r => r.country_iso3));
    const missing = allCountries.filter(c => !agoaIso3s.has(c.iso3));
    
    if (missing.length > 0) {
      console.log(`\n[check] ⚠️  ${missing.length} countries without AGOA records:`);
      missing.slice(0, 10).forEach(c => {
        console.log(`  - ${c.name} (${c.iso3})`);
      });
      if (missing.length > 10) {
        console.log(`  ... and ${missing.length - 10} more`);
      }
    }
  }

  // Show sample of countries by status
  console.log('\n[check] Sample countries by status:');
  ['eligible', 'suspended', 'not_applicable'].forEach(status => {
    const samples = agoaRecords.filter(r => r.status === status).slice(0, 3);
    if (samples.length > 0) {
      console.log(`\n  ${status.toUpperCase()}:`);
      samples.forEach(r => console.log(`    ${r.country_iso3}`));
    }
  });
}

checkAgoaCoverage().catch(console.error);
