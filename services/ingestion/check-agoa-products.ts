import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '../../apps/api-gateway/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAgoaProducts() {
  console.log('\n[check] Verifying AGOA products catalog...\n');
  
  const { count, error } = await supabase
    .from('souvera_agoa_products')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('[check] Error:', error);
    process.exit(1);
  }

  console.log(`[check] ✓ AGOA products in catalog: ${count || 0}`);
  
  if (!count || count === 0) {
    console.log('[check] ⚠️  No products found - table may need to be populated');
  } else {
    // Get sample products
    const { data: samples } = await supabase
      .from('souvera_agoa_products')
      .select('code, description, category_group')
      .limit(5);
    
    console.log('\n[check] Sample products:');
    samples?.forEach(p => {
      console.log(`  - ${p.code}: ${p.description} (${p.category_group})`);
    });
  }
}

checkAgoaProducts().catch(console.error);
