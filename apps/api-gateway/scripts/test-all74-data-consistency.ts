/**
 * Cross-surface data consistency gate for all 74 markets.
 * Any mismatch between Evidence Vault, trade flows, and country API = FAIL.
 *
 * Run: npx tsx apps/api-gateway/scripts/test-all74-data-consistency.ts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3 } from '../src/lib/market-coverage';
import { fetchAgoaEligibilityMap } from '../src/lib/intelligence/trade-policy-vault';
import { getLatestCompleteMacroYear, buildEconomyYearsFromObservations } from '../src/lib/intelligence/build-economy-years';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

let failed = 0;
function fail(label: string) { console.error(`❌ ${label}`); failed++; }
function pass(label: string) { console.log(`✅ ${label}`); }

async function main() {
  console.log('\n=== All-74 Data Consistency Gate ===\n');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const eligibilityMap = await fetchAgoaEligibilityMap();

  for (const iso3 of APPROVED_AFRICA_ISO3) {
    const vaultElig = eligibilityMap.get(iso3);
    if (!vaultElig) continue;
    const { data: flowSample } = await sb
      .from('souvera_agoa_trade_flows')
      .select('agoa_eligible, agoa_exports_usd, total_exports_to_us_usd')
      .eq('iso3', iso3)
      .limit(1);

    if (flowSample?.length) {
      const flowEligible = flowSample[0].agoa_eligible === true;
      if (flowEligible !== vaultElig.eligible) {
        fail(`${iso3}: vault eligible=${vaultElig.eligible} ≠ flows agoa_eligible=${flowEligible}`);
      } else {
        pass(`${iso3}: vault ↔ flows eligibility aligned`);
      }
      if (!vaultElig.eligible && (flowSample[0].agoa_exports_usd ?? 0) > 0) {
        fail(`${iso3}: suspended but agoa_exports_usd > 0`);
      }
    }

    if (vaultElig.suspensionSinceYear != null || vaultElig.eligibilitySince != null) {
      const y = String(vaultElig.suspensionSinceYear ?? vaultElig.eligibilitySince);
      if (!/^\d{4}$/.test(y)) fail(`${iso3}: eligibility year not parseable`);
    }

    const { data: country } = await sb.from('souvera_countries').select('id').eq('iso3', iso3).maybeSingle();
    if (country) {
      const { data: obs } = await sb
        .from('souvera_country_observations')
        .select('period_date, value_numeric, souvera_indicators(key)')
        .eq('country_id', country.id)
        .gte('period_date', '2020-01-01')
        .eq('period_type', 'annual');
      if (obs?.length) {
        const years = buildEconomyYearsFromObservations(obs as never);
        const hasComplete = years.some(
          (y) =>
            y.gdp_growth_pct != null &&
            y.fdi_net_inflows_usd != null &&
            y.inflation_cpi_pct != null
        );
        if (hasComplete) {
          const complete = getLatestCompleteMacroYear(years);
          if (
            complete.gdp_growth_pct == null ||
            complete.fdi_net_inflows_usd == null ||
            complete.inflation_cpi_pct == null
          ) {
            fail(`${iso3}: complete macro year exists but hero helper misses it`);
          }
        }
      }
    }
  }

  console.log(failed ? `\n${failed} consistency failures.` : '\n✅ All consistency checks passed.');
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
