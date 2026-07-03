/**
 * Validate sector tab data quality across all 74 markets:
 * - structured key_players (not string[])
 * - agoa_export metrics present when trade flows exist (African markets)
 *
 * Run: npx tsx apps/api-gateway/scripts/test-sectors-metrics.ts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ALL74 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];

async function main() {
  console.log('\n=== Sector metrics & key players gate (74 markets) ===\n');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  let failed = 0;

  for (const iso3 of ALL74) {
    let isoFailed = false;
    const { data: country } = await sb.from('souvera_countries').select('id, name').eq('iso3', iso3).maybeSingle();
    if (!country) {
      console.error(`❌ ${iso3}: country row missing`);
      failed++;
      continue;
    }

    const { data: sectors } = await sb
      .from('souvera_country_sectors')
      .select('sector_key, key_players, agoa_export_current_usd, agoa_export_potential_usd, agoa_opportunity')
      .eq('country_id', country.id)
      .eq('row_status', 'active');

    if (!sectors?.length) {
      console.error(`❌ ${iso3}: no active sectors`);
      failed++;
      continue;
    }

    for (const s of sectors) {
      const kp = s.key_players as unknown;
      if (Array.isArray(kp) && kp.length > 0 && typeof kp[0] === 'string') {
        console.error(`❌ ${iso3}/${s.sector_key}: key_players still string[]`);
        isoFailed = true;
        failed++;
      }
    }

    if (APPROVED_AFRICA_ISO3.includes(iso3 as never)) {
      const { count: flowCount } = await sb
        .from('souvera_agoa_trade_flows')
        .select('id', { count: 'exact', head: true })
        .eq('iso3', iso3);

      if ((flowCount ?? 0) > 0) {
        const withPotential = sectors.filter((s) => s.agoa_export_potential_usd != null);
        const withCurrent = sectors.filter((s) => s.agoa_export_current_usd != null);
        const withOpportunity = sectors.filter((s) => s.agoa_opportunity != null);
        if (withPotential.length === 0) {
          console.error(`❌ ${iso3}: has trade flows but no sector agoa_export_potential_usd`);
          isoFailed = true;
          failed++;
        }
        if (withCurrent.length === 0) {
          console.error(`❌ ${iso3}: has trade flows but no sector agoa_export_current_usd (bilateral MFN)`);
          isoFailed = true;
          failed++;
        }
        if (withOpportunity.length === 0) {
          console.error(`❌ ${iso3}: has trade flows but no sector agoa_opportunity narrative`);
          isoFailed = true;
          failed++;
        }
      }
    }

    if (!isoFailed) console.log(`✅ ${iso3}: ${sectors.length} sectors OK`);
  }

  console.log(failed ? `\n${failed} sector gate failures.` : '\n✅ All sector checks passed.');
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
