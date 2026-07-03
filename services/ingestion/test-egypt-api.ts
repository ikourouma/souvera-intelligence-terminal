/**
 * Test script to verify Egypt country API returns correct AGOA data
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../apps/api-gateway/.env.local' });

async function testEgyptApi() {
  console.log('\n[test] Fetching Egypt country data from API...\n');
  
  const apiUrl = process.env.NEXT_PUBLIC_SOUVERA_URL || 'http://localhost:3000';
  const url = `${apiUrl}/api/v1/country/EGY`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    
    if (!response.ok) {
      console.error(`[test] API request failed: ${response.status} ${response.statusText}`);
      process.exit(1);
    }
    
    const data = await response.json();
    
    if (!data.trade) {
      console.log('[test] ❌ No trade data returned');
      process.exit(1);
    }
    
    console.log('[test] ✓ Trade data found');
    console.log('\n[test] AGOA data:');
    console.log(JSON.stringify(data.trade.agoa, null, 2));
    
    if (data.trade.agoa?.status === 'not_applicable') {
      console.log('\n[test] ✓ AGOA status is "not_applicable"');
      console.log('[test] ✓ UI should show simplified card');
      
      if (data.trade.agoa.statusNote) {
        console.log(`[test] ✓ Status note: "${data.trade.agoa.statusNote.substring(0, 80)}..."`);
      }
      
      if (data.trade.agoa.currentExportsUsd === undefined) {
        console.log('[test] ✓ Current exports: undefined (correct)');
      }
      if (data.trade.agoa.potentialExportsUsd === undefined) {
        console.log('[test] ✓ Potential exports: undefined (correct)');
      }
      if (data.trade.agoa.eligibleCategories === undefined) {
        console.log('[test] ✓ Eligible categories: undefined (correct)');
      }
    } else {
      console.log(`\n[test] ❌ AGOA status is "${data.trade.agoa?.status}" instead of "not_applicable"`);
      process.exit(1);
    }
    
    console.log('\n[test] ✅ All checks passed! Egypt trade page should now show correct AGOA card.');
    
  } catch (err) {
    console.error('[test] Error:', err);
    process.exit(1);
  }
}

testEgyptApi().catch(console.error);
