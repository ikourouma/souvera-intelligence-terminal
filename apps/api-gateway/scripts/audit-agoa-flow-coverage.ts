/**
 * Audit AGOA trade-flow coverage for AGOA-eligible African markets.
 * Read-only. npx tsx apps/api-gateway/scripts/audit-agoa-flow-coverage.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Official 2025 AGOA-eligible (Federal Register Vol. 90 No. 103, May 30 2025)
const ELIGIBLE_2025 = [
  'AGO','BEN','BWA','CPV','TCD','COM','COD','COG','CIV','DJI','SWZ','GMB','GHA','GNB',
  'KEN','LSO','LBR','MDG','MWI','MRT','MUS','MOZ','NAM','NGA','RWA','STP','SEN','SLE',
  'ZAF','TZA','TGO','ZMB',
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: flows } = await sb
    .from('souvera_agoa_trade_flows')
    .select('iso3, agoa_exports_usd, total_exports_to_us_usd, category_group, year')
    .in('iso3', ELIGIBLE_2025);

  const byIso = new Map<string, { rows: number; current: number; potential: number }>();
  for (const f of flows ?? []) {
    const e = byIso.get(f.iso3) ?? { rows: 0, current: 0, potential: 0 };
    e.rows += 1;
    e.current += Number(f.agoa_exports_usd ?? 0);
    e.potential += Number(f.total_exports_to_us_usd ?? 0);
    byIso.set(f.iso3, e);
  }

  console.log(`\n=== AGOA trade-flow coverage for 32 eligible markets ===\n`);
  console.log('ISO3 | rows | agoa exports USD | total to US USD');
  console.log('-----|------|------------------|----------------');
  const missing: string[] = [];
  const zero: string[] = [];
  for (const iso3 of ELIGIBLE_2025.slice().sort()) {
    const e = byIso.get(iso3);
    if (!e) { missing.push(iso3); console.log(`${iso3}  | NONE`); continue; }
    if (e.current === 0) zero.push(iso3);
    console.log(`${iso3}  | ${String(e.rows).padEnd(4)} | ${e.current.toLocaleString().padEnd(15)} | ${e.potential.toLocaleString()}`);
  }
  console.log(`\nNo flow rows (${missing.length}): ${missing.join(', ') || 'none'}`);
  console.log(`Zero current exports (${zero.length}): ${zero.join(', ') || 'none'}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
