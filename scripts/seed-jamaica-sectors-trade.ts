/**
 * Seed Jamaica sector CBI trade opportunity fields (uses agoa_* columns).
 * Run: npx tsx scripts/seed-jamaica-sectors-trade.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const SECTOR_TRADE: Record<string, { opportunity: string; currentUsd: number; potentialUsd: number }> = {
  fintech: {
    opportunity:
      'CBI Export Opportunity: Jamaica\'s fintech and BPO services qualify for preferential U.S. market access under CBI/CARICOM arrangements. Nearshore digital services to North American firms represent a $120M+ annual export corridor with 30-40% labor cost advantage vs U.S. metros.',
    currentUsd: 45_000_000,
    potentialUsd: 120_000_000,
  },
  agriculture: {
    opportunity:
      'CBI Export Opportunity: Blue Mountain coffee, cocoa, and spice exports enjoy duty-free U.S. entry under CBI. Premium agricultural exports to the U.S. market total $180M+ annually with growth in organic and specialty segments.',
    currentUsd: 180_000_000,
    potentialUsd: 250_000_000,
  },
  mining: {
    opportunity:
      'CBI Export Opportunity: Bauxite and alumina exports to U.S. smelters benefit from established bilateral trade flows. Alumina exports represent Jamaica\'s largest goods export category to the United States.',
    currentUsd: 520_000_000,
    potentialUsd: 600_000_000,
  },
  logistics: {
    opportunity:
      'CBI Export Opportunity: Kingston transshipment hub supports Caribbean-U.S. supply chains. Logistics and re-export services under CARICOM/CBI frameworks enable duty-free movement of eligible goods to U.S. markets.',
    currentUsd: 95_000_000,
    potentialUsd: 140_000_000,
  },
  energy: {
    opportunity:
      'CBI Export Opportunity: Renewable energy equipment and LNG-related exports qualify under CBI preferential access. Solar and wind component exports support U.S. Caribbean energy diversification goals.',
    currentUsd: 25_000_000,
    potentialUsd: 60_000_000,
  },
};

async function main() {
  console.log('🚀 Seeding Jamaica sector CBI trade opportunities...\n');

  const { data: country, error: countryError } = await supabase
    .from('souvera_countries')
    .select('id')
    .eq('iso3', 'JAM')
    .maybeSingle();

  if (countryError || !country) {
    console.error('❌ Jamaica (JAM) not found');
    process.exit(1);
  }

  for (const [sectorKey, trade] of Object.entries(SECTOR_TRADE)) {
    const { error } = await supabase
      .from('souvera_country_sectors')
      .update({
        agoa_opportunity: trade.opportunity,
        agoa_export_current_usd: trade.currentUsd,
        agoa_export_potential_usd: trade.potentialUsd,
        updated_at: new Date().toISOString(),
      })
      .eq('country_id', country.id)
      .eq('sector_key', sectorKey);

    if (error) {
      console.warn(`⚠️  ${sectorKey}: ${error.message}`);
    } else {
      console.log(`✅ ${sectorKey}: CBI trade data updated`);
    }
  }

  console.log('\n✅ Done! Sectors tab should show CBI labels for Jamaica.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
