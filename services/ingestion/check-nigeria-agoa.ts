import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '../../apps/api-gateway/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkNigeriaAgoa() {
  console.log('\n[check] Verifying Nigeria AGOA status...\n');
  
  // Check policy status
  const { data: policyData, error: policyError } = await supabase
    .from('souvera_country_policy_status')
    .select('country_iso3, framework, status, confidence, evidence_artifact_id')
    .eq('country_iso3', 'NGA')
    .eq('framework', 'AGOA')
    .maybeSingle();

  if (policyError) {
    console.error('[check] Error:', policyError);
    process.exit(1);
  }

  if (!policyData) {
    console.log('[check] ❌ No AGOA policy record found for Nigeria');
    console.log('[check] This should not happen - Nigeria is a core AGOA country');
    process.exit(1);
  }

  console.log('[check] ✓ Policy status found:');
  console.log(JSON.stringify(policyData, null, 2));
  
  // Check AGOA flows
  const { data: flowsData, error: flowsError } = await supabase
    .from('souvera_agoa_trade_flows')
    .select('category_group, agoa_exports_usd, year')
    .eq('iso3', 'NGA')
    .order('year', { ascending: false })
    .limit(10);

  if (flowsError) {
    console.error('[check] Error checking flows:', flowsError);
  } else {
    console.log(`\n[check] ✓ AGOA flows: ${flowsData?.length || 0} category records found`);
    if (flowsData && flowsData.length > 0) {
      const totalExports = flowsData.reduce((sum, f) => sum + (f.agoa_exports_usd || 0), 0);
      console.log(`[check] Total AGOA exports: $${(totalExports / 1_000_000).toFixed(1)}M`);
      console.log(`[check] Categories: ${new Set(flowsData.map(f => f.category_group)).size}`);
    }
  }

  // Determine if fix needed
  if (policyData.status === 'not_applicable') {
    console.log('\n[check] ❌ Nigeria status is "not_applicable" - THIS IS WRONG');
    console.log('[check] Nigeria is AGOA-eligible and should show "eligible" status');
    console.log('[check] Recommendation: Re-run verify:ustr:agoa to fix');
    process.exit(1);
  } else if (policyData.status === 'eligible') {
    console.log('\n[check] ✅ Nigeria status is correct: "eligible"');
    console.log('[check] No fix needed');
  } else {
    console.log(`\n[check] ⚠️  Nigeria status is "${policyData.status}"`);
    console.log('[check] Expected: "eligible"');
  }
}

checkNigeriaAgoa().catch(console.error);
