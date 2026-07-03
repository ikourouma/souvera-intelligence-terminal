/**
 * Sync sector agoa_export_* metrics from souvera_agoa_trade_flows (DB-derived, not hardcoded).
 * Maps flow category_group → sector_key and upserts per-country sector rows.
 *
 * Semantics:
 * - agoa_export_current_usd = bilateral MFN exports to U.S. (total_exports_to_us_usd)
 * - agoa_export_potential_usd = restoration upside (eligible base + tariff savings) or AGOA upside when eligible
 *
 * Run: npx tsx apps/api-gateway/scripts/sync-sector-agoa-from-flows.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3 } from '../src/lib/market-coverage';
import { fetchAgoaEligibilityMap } from '../src/lib/intelligence/trade-policy-vault';

function formatUsdCompact(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${Math.round(n)}`;
}

function buildAgoaOpportunityNarrative(
  iso3: string,
  current: number,
  potential: number,
  eligible: boolean
): string {
  const currentFmt = formatUsdCompact(current);
  const potentialFmt = formatUsdCompact(potential);
  if (eligible) {
    return `Current bilateral exports to the U.S. total ${currentFmt}/year. Modeled AGOA upside reaches ${potentialFmt} including tariff savings under active preferential eligibility for ${iso3}.`;
  }
  return `AGOA preferential access is suspended for ${iso3}; current bilateral MFN exports to the U.S. total ${currentFmt}/year. Restoration upside is estimated at ${potentialFmt} from eligible non-petroleum categories plus tariff savings if eligibility is restored.`;
}

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PETROLEUM = 'petroleum';

/** Flow category_group → sector_key(s) on souvera_country_sectors */
const CATEGORY_TO_SECTORS: Record<string, string[]> = {
  agriculture: ['agriculture', 'agriculture_food', 'agriculture_agribusiness'],
  textiles_apparel: ['manufacturing_textiles', 'manufacturing', 'manufacturing_textiles_apparel'],
  minerals: ['mining_critical_minerals', 'mining_minerals', 'mining', 'mining_metals'],
  petroleum: ['energy_power', 'energy', 'energy_renewables', 'energy_oil_gas'],
  machinery: ['manufacturing_textiles', 'manufacturing', 'logistics_trade', 'logistics'],
  electronics: ['digital_infrastructure', 'fintech_finance', 'technology', 'fintech'],
  vehicles: ['manufacturing_textiles', 'manufacturing', 'logistics_trade', 'automotive'],
  chemicals: ['manufacturing_textiles', 'manufacturing', 'chemicals'],
  footwear: ['manufacturing_textiles', 'manufacturing'],
  handicrafts: ['tourism_hospitality', 'tourism', 'manufacturing_textiles'],
};

function eligibleBaseForCategory(cat: string, total: number): number {
  return cat === PETROLEUM ? 0 : total;
}

async function main() {
  console.log('\n=== Sync sector AGOA metrics from trade flows ===\n');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const eligibilityMap = await fetchAgoaEligibilityMap();

  let updated = 0;

  for (const iso3 of APPROVED_AFRICA_ISO3) {
    const vault = eligibilityMap.get(iso3);
    const eligible = vault?.eligible ?? false;

    const { data: flows } = await sb
      .from('souvera_agoa_trade_flows')
      .select('category_group, total_exports_to_us_usd, agoa_exports_usd, tariff_savings_usd, year')
      .eq('iso3', iso3)
      .order('year', { ascending: false });

    if (!flows?.length) continue;

    const latestYear = flows[0].year;
    const latest = flows.filter((f) => f.year === latestYear);

    const bySector = new Map<string, { current: number; potential: number }>();

    for (const f of latest) {
      const cat = f.category_group as string;
      const sectorKeys = CATEGORY_TO_SECTORS[cat] ?? ['manufacturing_textiles'];
      const total = f.total_exports_to_us_usd ?? 0;
      const tariffSavings = f.tariff_savings_usd ?? 0;
      const eligibleBase = eligibleBaseForCategory(cat, total);
      const current = total;
      const potential = eligible
        ? (f.agoa_exports_usd ?? 0) + tariffSavings
        : eligibleBase + tariffSavings;

      for (const sk of sectorKeys) {
        const prev = bySector.get(sk) ?? { current: 0, potential: 0 };
        bySector.set(sk, {
          current: prev.current + current,
          potential: prev.potential + potential,
        });
      }
    }

    const { data: country } = await sb.from('souvera_countries').select('id').eq('iso3', iso3).maybeSingle();
    if (!country) continue;

    for (const [sectorKey, metrics] of bySector) {
      const { error } = await sb
        .from('souvera_country_sectors')
        .update({
          agoa_export_current_usd: Math.round(metrics.current),
          agoa_export_potential_usd: Math.round(metrics.potential),
          agoa_opportunity: buildAgoaOpportunityNarrative(iso3, metrics.current, metrics.potential, eligible),
        })
        .eq('country_id', country.id)
        .eq('sector_key', sectorKey);
      if (!error) updated++;
    }
    console.log(`  ✅ ${iso3}: ${bySector.size} sectors synced (year ${latestYear})`);
  }

  console.log(`\n✅ Updated ${updated} sector metric rows.\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
