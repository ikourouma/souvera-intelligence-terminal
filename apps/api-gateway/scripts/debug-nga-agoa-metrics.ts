import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: flows, error } = await sb
    .from('souvera_agoa_trade_flows')
    .select('year, category_group, agoa_exports_usd, total_exports_to_us_usd, tariff_savings_usd, agoa_eligible')
    .eq('iso3', 'NGA')
    .order('year', { ascending: false });

  if (error) throw error;

  const years = [...new Set(flows?.map((f) => f.year) ?? [])];
  console.log('Years:', years);

  for (const year of years) {
    const rows = flows?.filter((f) => f.year === year) ?? [];
    const sum = rows.reduce((s, f) => s + (f.agoa_exports_usd || 0), 0);
    console.log(`\n${year}: ${rows.length} rows, agoa_exports sum = $${(sum / 1e6).toFixed(1)}M`);
    for (const r of rows) {
      console.log(
        `  ${r.category_group}: total=$${((r.total_exports_to_us_usd ?? 0) / 1e6).toFixed(1)}M agoa=$${((r.agoa_exports_usd ?? 0) / 1e6).toFixed(1)}M eligible=${r.agoa_eligible}`
      );
    }
  }
}

main().catch(console.error);
