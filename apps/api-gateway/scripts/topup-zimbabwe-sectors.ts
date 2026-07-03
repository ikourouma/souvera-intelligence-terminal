/**
 * Top up Zimbabwe to 7 sectors by adding the three standard sectors its curated
 * seed did not include: energy_power, digital_infrastructure, logistics_trade.
 * Existing curated ZWE sectors (mining, agriculture, tourism, manufacturing) are
 * left untouched (different sector_keys, no overlap).
 *
 * Run: npx tsx apps/api-gateway/scripts/topup-zimbabwe-sectors.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ZWE_TOPUP = [
  {
    sector_key: 'energy_power',
    sector_label: 'Energy & Power',
    icon_emoji: '⚡',
    display_order: 5,
    teaser:
      'Zimbabwe is expanding generation and renewables to resolve chronic power deficits constraining mining and industry.',
    strength_score: 48,
    growth_score: 68,
    attractiveness_score: 62,
    narrative_short:
      "Zimbabwe's power sector is recovering from sustained load-shedding driven by Kariba hydro variability and ageing thermal plants. Hwange expansion and a growing solar IPP pipeline are central to restoring reliable supply.\n\nMining and agro-processing demand make captive and utility-scale renewables an attractive investment, supported by net-metering and IPP frameworks.",
    narrative_full:
      'Generation mix: Kariba hydro and Hwange coal anchor capacity, with drought exposure and plant age driving deficits. Solar IPPs and battery storage are the principal expansion pathway.\n\nInvestment entry points include utility-scale solar, captive plants for mines, and transmission upgrades. ZESA tariff reform and PPA bankability are decisive for investor confidence.',
    key_players: [
      { name: 'ZESA / ZPC', sector: 'Generation & Grid', description: 'State utility managing generation, transmission, and distribution', metric: 'Grid backbone' },
      { name: 'Solar IPP Developers', sector: 'Renewables', description: 'Private developers delivering solar and storage capacity under licensing reform', metric: 'Fastest-growing segment' },
      { name: 'ZERA', sector: 'Policy', description: 'Energy regulator administering licensing, tariffs, and net-metering', metric: 'Bankability driver' },
    ],
    data_sources: ['ZERA', 'IRENA', 'World Bank', 'Souvera Analysis'],
    row_status: 'active',
  },
  {
    sector_key: 'digital_infrastructure',
    sector_label: 'Digital Infrastructure',
    icon_emoji: '📡',
    display_order: 6,
    teaser:
      'Mobile broadband and fibre expansion underpin Zimbabwe\'s digital economy and mobile-money adoption.',
    strength_score: 46,
    growth_score: 66,
    attractiveness_score: 58,
    narrative_short:
      "Zimbabwe's digital infrastructure is growing through mobile broadband, fibre rollout, and high mobile-money penetration via EcoCash. Connectivity is concentrated in Harare and Bulawayo, with rural coverage gaps.\n\nData-centre and fibre investment, plus spectrum reform, are key to deepening digital-services competitiveness.",
    narrative_full:
      'Connectivity: mobile operators provide the primary internet access layer, with fibre backbones extending between major centres. EcoCash anchors a mature mobile-money ecosystem.\n\nInvestment entry points include towers, fibre, data centres, and digital services. Foreign-exchange access for equipment imports and spectrum policy shape scale-up.',
    key_players: [
      { name: 'Mobile Network Operators', sector: 'Telecom', description: 'Licensed operators providing mobile voice, data, and money services', metric: 'Connectivity backbone' },
      { name: 'Fibre & Data Providers', sector: 'Infrastructure', description: 'Backbone and enterprise connectivity providers serving business demand', metric: 'Growth segment' },
      { name: 'POTRAZ', sector: 'Policy', description: 'Communications regulator managing spectrum, licensing, and competition', metric: 'Scale-up enabler' },
    ],
    data_sources: ['POTRAZ', 'ITU', 'GSMA', 'Souvera Analysis'],
    row_status: 'active',
  },
  {
    sector_key: 'logistics_trade',
    sector_label: 'Logistics & Trade',
    icon_emoji: '🚢',
    display_order: 7,
    teaser:
      'Zimbabwe\'s landlocked corridors to Beira, Durban, and Walvis Bay are central to mineral and agricultural exports.',
    strength_score: 50,
    growth_score: 60,
    attractiveness_score: 58,
    narrative_short:
      "As a landlocked economy, Zimbabwe depends on regional corridors — Beitbridge to Durban, and the Beira corridor to the Indian Ocean — for trade. Beitbridge border modernization has cut crossing times materially.\n\nRail rehabilitation and dry-port investment are priorities for mineral and agricultural export competitiveness under SADC and AfCFTA.",
    narrative_full:
      'Trade infrastructure: road corridors handle most freight, with the National Railways of Zimbabwe network underinvested. Beitbridge (the busiest inland port in the region) was modernized via PPP.\n\nInvestment entry points include rail rehabilitation, dry ports, bonded warehousing, and freight digitization. Corridor efficiency and customs modernization shape export competitiveness.',
    key_players: [
      { name: 'Beitbridge Border / Corridor Operators', sector: 'Gateways', description: 'Modernized border and corridor operators handling regional freight', metric: 'Primary trade gateway' },
      { name: 'National Railways of Zimbabwe', sector: 'Rail Freight', description: 'State rail operator central to bulk mineral and agricultural haulage', metric: 'Rehabilitation priority' },
      { name: 'ZIMRA', sector: 'Facilitation', description: 'Revenue authority administering customs clearance and single-window reform', metric: 'Cost & time driver' },
    ],
    data_sources: ['World Bank LPI', 'SADC', 'ZIMRA', 'Souvera Analysis'],
    row_status: 'active',
  },
];

async function main() {
  console.log('\n=== Top up Zimbabwe sectors ===\n');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: country } = await sb
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', 'ZWE')
    .maybeSingle();
  if (!country) throw new Error('ZWE country row not found');

  const rows = ZWE_TOPUP.map((s) => ({ country_id: country.id, ...s }));
  const { error } = await sb
    .from('souvera_country_sectors')
    .upsert(rows, { onConflict: 'country_id,sector_key' });
  if (error) throw new Error(error.message);

  console.log(`✅ Added ${rows.length} sectors to Zimbabwe (now 7 total).\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
