/**
 * Verify "Current AGOA Exports" is non-zero for newly-eligible markets by replicating
 * the route's sumAgoaPreferentialExports fallback (total_exports * agoa_share, petroleum excluded).
 * Read-only. npx tsx apps/api-gateway/scripts/verify-agoa-current-exports.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const NEWLY_ELIGIBLE = [
  'AGO','BEN','BWA','CPV','TCD','COM','COD','COG','CIV','DJI','SWZ','GMB','GHA','GNB',
  'KEN','LSO','LBR','MDG','MWI','MRT','MUS','MOZ','NAM','NGA','RWA','STP','SEN','SLE',
  'ZAF','TZA','TGO','ZMB',
];
const EXCLUDED = new Set(['petroleum']);

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('\n=== Computed "Current AGOA Exports" (route fallback) for newly-eligible markets ===\n');
  console.log('ISO3 | year | computed current AGOA exports USD');
  console.log('-----|------|----------------------------------');

  for (const iso3 of NEWLY_ELIGIBLE) {
    const { data: flows } = await sb
      .from('souvera_agoa_trade_flows')
      .select('total_exports_to_us_usd, agoa_exports_usd, agoa_share_pct, category_group, year')
      .eq('iso3', iso3)
      .order('year', { ascending: false })
      .limit(100);
    if (!flows?.length) { console.log(`${iso3}  | -    | NO FLOWS`); continue; }

    const years = [...new Set(flows.map((f) => f.year))].sort((a, b) => b - a);
    let chosenYear = years[0];
    let computed = 0;
    for (const y of years) {
      const yf = flows.filter((f) => f.year === y);
      const sum = yf.reduce((s, f) => {
        if (EXCLUDED.has(f.category_group ?? '')) return s;
        const direct = Number(f.agoa_exports_usd ?? 0);
        if (direct > 0) return s + direct;
        const total = Number(f.total_exports_to_us_usd ?? 0);
        if (total <= 0) return s;
        const share = Number(f.agoa_share_pct ?? 65) / 100;
        return s + Math.round(total * share);
      }, 0);
      if (sum > 0) { chosenYear = y; computed = sum; break; }
    }
    const flag = computed > 0 ? '✅' : '⚠️ still $0';
    console.log(`${iso3}  | ${chosenYear} | ${computed.toLocaleString().padStart(20)}  ${flag}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
