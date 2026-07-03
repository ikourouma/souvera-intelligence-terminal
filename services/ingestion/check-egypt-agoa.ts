/**
 * Quick script to check if Egypt AGOA policy status exists in Evidence Vault
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '../../apps/api-gateway/.env.local' });

async function checkEgyptAgoa() {
  console.log('\n[check] Querying Egypt AGOA policy status...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);
  
  const { data, error } = await supabase
    .from('souvera_country_policy_status')
    .select('country_iso3, framework, status, confidence, notes, evidence_artifact_id')
    .eq('country_iso3', 'EGY')
    .eq('framework', 'AGOA')
    .maybeSingle();

  if (error) {
    console.error('[check] Error:', error);
    process.exit(1);
  }

  if (!data) {
    console.log('[check] ❌ No AGOA policy record found for Egypt');
    console.log('[check] This means verify:ustr:agoa has not run successfully');
    process.exit(1);
  }

  console.log('[check] ✓ Egypt AGOA policy record found:');
  console.log(JSON.stringify(data, null, 2));
  
  const hasEvidence = data.evidence_artifact_id !== null;
  if (data.status === 'not_applicable' && hasEvidence) {
    console.log('\n[check] ✓ Status is correct: not_applicable (evidence-backed)');
  } else {
    console.log(`\n[check] ⚠️  Status: ${data.status}, evidence-backed: ${hasEvidence}`);
  }
}

checkEgyptAgoa().catch(console.error);
