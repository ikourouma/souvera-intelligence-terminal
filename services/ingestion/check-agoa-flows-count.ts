import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '../../apps/api-gateway/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  const { count } = await supabase
    .from('souvera_agoa_trade_flows')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\nAGOA trade flows records: ${count || 0}\n`);
  
  if (count === 0) {
    console.log('⚠️  No AGOA trade flow data found');
    console.log('💡 Run: npx tsx ../../services/ingestion/ingest-agoa-flows.ts');
  }
})();
