/**
 * Seed Kenya Sectors — full Bloomberg-grade parity with NGA/JAM pilots.
 * Populates all fields required by SectorsTab + API (teaser, narratives, key players, AGOA trade).
 *
 * Run: npx tsx scripts/seed-kenya-sectors.ts
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

interface SectorSeed {
  sector_key: string;
  sector_label: string;
  icon_emoji: string;
  display_order: number;
  teaser: string;
  strength_score: number;
  growth_score: number;
  attractiveness_score: number;
  narrative_short: string;
  narrative_full: string;
  key_players: Array<{ name: string; sector: string; description: string; metric: string }>;
  agoa_opportunity: string;
  agoa_export_current_usd: number;
  agoa_export_potential_usd: number;
  data_sources: string[];
}

const KEN_SECTORS: SectorSeed[] = [
  {
    sector_key: 'fintech',
    sector_label: 'Fintech & Digital Finance',
    icon_emoji: '💳',
    display_order: 1,
    teaser:
      'East Africa\'s fintech leader anchored by M-Pesa mobile money, CBK-regulated digital lenders, and Nairobi\'s dense startup ecosystem.',
    strength_score: 90,
    growth_score: 85,
    attractiveness_score: 88,
    narrative_short:
      'Kenya\'s fintech sector is among Africa\'s most advanced, built on M-Pesa\'s foundational mobile money infrastructure and a regulatory environment supportive of innovation. Nairobi hosts a dense cluster of fintech startups with strong activity in digital lending, insurtech, and B2B payments.\n\nThe Central Bank of Kenya\'s licensing frameworks and regulatory sandbox provisions have enabled rapid deployment of new models. Cross-border payment interoperability across EAC markets is a strategic focus, with <span class="text-emerald-400 font-semibold">$2B+</span> in annual mobile money transaction volume supporting regional expansion.',
    narrative_full:
      'Regulatory framework: CBK payment-service licensing and fintech sandbox enable innovation while maintaining financial stability. M-Pesa processes billions of transactions annually, creating rails for lending, savings, and insurance products.\n\nRegional expansion: Kenyan fintech operators are scaling into Tanzania, Uganda, and Rwanda under EAC interoperability initiatives. Open banking pilots and BaaS platforms support embedded finance for SMEs and agribusiness supply chains.\n\nPolicy priorities include consumer protection, lending cap adjustments, and cybersecurity frameworks as digital finance deepens financial inclusion beyond urban centers.',
    key_players: [
      { name: 'Safaricom', sector: 'Mobile Money & Telecom', description: 'M-Pesa operator and East Africa\'s largest mobile money platform', metric: '30M+ active M-Pesa users' },
      { name: 'Equity Bank', sector: 'Digital Banking', description: 'Pan-African bank with Equitel mobile banking and agency network', metric: 'Operations in 7 African countries' },
      { name: 'KCB Group', sector: 'Banking & Fintech', description: 'Commercial bank with Vooma digital lending and BaaS partnerships', metric: 'NSE listed, regional footprint' },
    ],
    agoa_opportunity:
      'AGOA Export Opportunity: Kenya\'s fintech and digital services exports qualify for duty-free U.S. market access under AGOA. BaaS platforms, payment infrastructure, and tech talent exports to North American firms represent a $180M+ annual corridor with Nairobi\'s English-speaking engineering workforce.',
    agoa_export_current_usd: 65_000_000,
    agoa_export_potential_usd: 180_000_000,
    data_sources: ['Central Bank of Kenya', 'KNBS', 'World Bank', 'Souvera Analysis'],
  },
  {
    sector_key: 'energy',
    sector_label: 'Energy & Renewables',
    icon_emoji: '⚡',
    display_order: 2,
    teaser:
      'Renewable energy leader with substantial geothermal capacity from the Rift Valley and expanding solar and wind installations.',
    strength_score: 88,
    growth_score: 78,
    attractiveness_score: 84,
    narrative_short:
      'Kenya derives the majority of its electricity from renewable sources, with geothermal power from the Rift Valley accounting for a significant share of baseload generation. Hydropower, wind (Lake Turkana Wind Power Project), and solar are integrated into the grid.\n\nOff-grid solar providers serve rural populations, and mini-grid deployment is advancing in underserved counties. Power Purchase Agreements and regulatory consistency are critical to sustaining investor confidence in utility-scale IPPs.',
    narrative_full:
      'Generation mix: KenGen operates geothermal and hydro assets; Lake Turkana Wind Power (310 MW) is Africa\'s largest wind farm. Kenya Power manages transmission and distribution with growing renewable share.\n\nInvestment entry points include geothermal exploration in the Rift Valley, commercial solar for agro-processing, and mini-grids for rural electrification. AGOA-eligible equipment imports support U.S.-Kenya clean energy supply chains.\n\nTransmission capacity and last-mile distribution remain infrastructure priorities as industrial and data center load grows in Nairobi.',
    key_players: [
      { name: 'KenGen', sector: 'Geothermal & Hydro', description: 'State-owned power generator with Rift Valley geothermal portfolio', metric: '70%+ renewable generation share' },
      { name: 'Kenya Power', sector: 'Utility', description: 'National transmission and distribution company', metric: 'Monopoly grid operator' },
      { name: 'Lake Turkana Wind Power', sector: 'Wind', description: 'Utility-scale wind farm in Marsabit County', metric: '310 MW capacity' },
    ],
    agoa_opportunity:
      'AGOA Export Opportunity: Renewable energy components and geothermal expertise qualify under AGOA preferential access. Clean energy equipment exports and green IPP partnerships support U.S.-Kenya climate-aligned investment goals.',
    agoa_export_current_usd: 35_000_000,
    agoa_export_potential_usd: 90_000_000,
    data_sources: ['Energy & Petroleum Regulatory Authority', 'KenGen', 'World Bank'],
  },
  {
    sector_key: 'agriculture',
    sector_label: 'Agriculture & Agribusiness',
    icon_emoji: '🌾',
    display_order: 3,
    teaser:
      'Diversified agriculture sector anchored by tea, coffee, and horticulture exports to European and Middle Eastern markets.',
    strength_score: 82,
    growth_score: 70,
    attractiveness_score: 76,
    narrative_short:
      'Agriculture is central to Kenya\'s economy and employment, with tea and coffee serving as traditional export pillars. Horticultural exports including flowers, vegetables, and fruits benefit from JKIA air freight connectivity and phytosanitary compliance.\n\nThe Rift Valley and Central regions anchor production, while irrigation schemes in arid counties expand cultivable land. Agritech platforms and cold chain investments are improving market access for smallholder farmers.',
    narrative_full:
      'Export anchors: Tea and coffee remain Kenya\'s most recognized agricultural brands globally. Flower exports (roses, summer flowers) dominate European supermarket supply chains via overnight air cargo from JKIA.\n\nValue addition: Agro-processing for juices, packaged tea, and frozen vegetables is gaining traction. Smallholder aggregation models and co-ops improve export consistency and traceability for AGOA-eligible specialty products.\n\nClimate variability and land fragmentation remain structural constraints mitigated through greenhouse adoption, drip irrigation, and crop diversification programs.',
    key_players: [
      { name: 'Kakuzi', sector: 'Horticulture', description: 'Listed agribusiness with avocado, macadamia, and tea operations', metric: 'NSE listed, export-oriented' },
      { name: 'Finlays', sector: 'Tea & Horticulture', description: 'Major tea producer and exporter with Rift Valley estates', metric: 'Global tea supply chain integration' },
      { name: 'Sasini', sector: 'Tea & Coffee', description: 'Integrated tea and coffee producer with branded exports', metric: 'NSE listed agribusiness' },
    ],
    agoa_opportunity:
      'AGOA Export Opportunity: Tea, coffee, nuts, and horticulture exports enjoy duty-free U.S. entry under AGOA. Specialty agricultural exports to the U.S. market total $420M+ annually with growth in organic and fair-trade segments.',
    agoa_export_current_usd: 420_000_000,
    agoa_export_potential_usd: 580_000_000,
    data_sources: ['Ministry of Agriculture', 'KNBS', 'ITC Trade Map'],
  },
  {
    sector_key: 'mining',
    sector_label: 'Mining & Critical Minerals',
    icon_emoji: '⛏️',
    display_order: 4,
    teaser:
      'Emerging mining sector with titanium sands in Kwale County and niobium exploration attracting strategic interest.',
    strength_score: 55,
    growth_score: 70,
    attractiveness_score: 62,
    narrative_short:
      'Kenya\'s mining sector is at an early commercial stage relative to East African peers, with titanium sands in Kwale County representing the most advanced operation. Base Titanium exports rutile, ilmenite, and zircon to global markets.\n\nNiobium and rare earth exploration in the Mrima Hill area is attracting strategic interest. Regulatory frameworks are evolving as the government balances resource extraction with environmental safeguards and community benefit-sharing.',
    narrative_full:
      'Commercial operations: Base Titanium\'s Kwale mineral sands project anchors sector export revenues. Global titanium feedstock demand supports long-term offtake agreements with industrial consumers.\n\nExploration pipeline: Niobium and rare earth deposits in coastal and Rift Valley regions are under assessment. Artisanal mining formalization and community engagement are reputational requirements for institutional investors.\n\nESG focus: Mined-land rehabilitation and transparent revenue sharing with host communities are policy priorities under Kenya\'s Mining Act framework.',
    key_players: [
      { name: 'Base Titanium', sector: 'Mineral Sands', description: 'Kwale County titanium sands mining and export operation', metric: 'Major rutile/ilmenite exporter' },
      { name: 'Cortec Mining', sector: 'Niobium Exploration', description: 'Mrima Hill niobium and rare earth exploration project', metric: 'Strategic minerals pipeline' },
      { name: 'Ministry of Mining', sector: 'Regulation', description: 'National mining policy and licensing authority', metric: 'Mining Act 2016 framework' },
    ],
    agoa_opportunity:
      'AGOA Export Opportunity: Titanium mineral sands and processed minerals qualify for duty-free U.S. entry under AGOA. Critical minerals exports support U.S. industrial supply chain diversification goals.',
    agoa_export_current_usd: 85_000_000,
    agoa_export_potential_usd: 150_000_000,
    data_sources: ['Ministry of Mining', 'UN Comtrade', 'World Bank'],
  },
  {
    sector_key: 'logistics',
    sector_label: 'Logistics & Trade',
    icon_emoji: '🚢',
    display_order: 5,
    teaser:
      'East Africa\'s logistics gateway supported by Mombasa port, the Standard Gauge Railway, and JKIA air cargo hub.',
    strength_score: 85,
    growth_score: 75,
    attractiveness_score: 82,
    narrative_short:
      'Kenya serves as East Africa\'s primary trade gateway, with Mombasa port handling cargo for Uganda, Rwanda, Burundi, South Sudan, and eastern DRC. The Standard Gauge Railway connects Mombasa to Nairobi, reducing transit times for containerized goods.\n\nJKIA anchors air cargo exports for horticulture and pharmaceuticals. Nairobi\'s warehousing and distribution networks support regional AfCFTA and EAC trade flows under Northern Corridor infrastructure upgrades.',
    narrative_full:
      'Port infrastructure: Mombasa is the largest port in East Africa by throughput. Kenya Ports Authority and private terminal operators are expanding capacity to reduce congestion during peak seasons.\n\nInland connectivity: SGR freight services link port to Nairobi industrial zones. Road-rail intermodal coordination and border post efficiency improvements support re-export models under EAC customs union arrangements.\n\nTrade facilitation: Single-window customs and bonded warehouse frameworks enable duty-deferred re-export to landlocked EAC partners.',
    key_players: [
      { name: 'Kenya Ports Authority', sector: 'Port', description: 'State port authority operating Mombasa and regional ports', metric: 'East Africa\'s largest port by throughput' },
      { name: 'Kenya Railways Corporation', sector: 'Rail', description: 'Standard Gauge Railway operator Mombasa–Nairobi corridor', metric: 'SGR freight and passenger services' },
      { name: 'Kenya Airways Cargo', sector: 'Air Freight', description: 'JKIA-based perishable and high-value air cargo exports', metric: 'Horticulture export hub' },
    ],
    agoa_opportunity:
      'AGOA Export Opportunity: Mombasa gateway supports East Africa-U.S. supply chains. Logistics services and re-export of AGOA-eligible goods through Nairobi distribution hubs enable duty-free movement to U.S. markets.',
    agoa_export_current_usd: 120_000_000,
    agoa_export_potential_usd: 200_000_000,
    data_sources: ['Kenya Ports Authority', 'KNBS', 'UNCTAD'],
  },
];

function assertKenPurity(sector: SectorSeed): void {
  const text = `${sector.teaser} ${sector.narrative_short} ${sector.agoa_opportunity}`.toLowerCase();
  const forbidden = [
    'nigeria',
    'naira',
    'tinubu',
    'lagos fintech',
    'ecowas',
    'dangote',
    'flutterwave',
    'jamaica',
    'caricom',
    'cbi export',
    'jam-dex',
    'blue mountain',
    'agoa restoration',
  ];
  for (const m of forbidden) {
    if (text.includes(m)) throw new Error(`KEN sector ${sector.sector_key} contains forbidden marker "${m}"`);
  }
  if (text.includes('cbi') && !text.includes('cbk')) {
    throw new Error(`KEN sector ${sector.sector_key} contains CBI (JAM marker)`);
  }
  for (const p of sector.key_players) {
    const pText = `${p.name} ${p.description}`.toLowerCase();
    if (pText.includes('dangote') || pText.includes('ncb financial') || pText.includes('noranda')) {
      throw new Error(`KEN sector ${sector.sector_key} key player contaminated with NGA/JAM entity`);
    }
  }
}

async function main() {
  console.log('🚀 Seeding Kenya sectors (full NGA/JAM parity)...\n');

  for (const s of KEN_SECTORS) {
    assertKenPurity(s);
  }

  const { data: country, error: countryError } = await supabase
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', 'KEN')
    .maybeSingle();

  if (countryError || !country) {
    console.error('❌ Kenya (KEN) not found');
    process.exit(1);
  }

  for (const sector of KEN_SECTORS) {
    const { error } = await supabase.from('souvera_country_sectors').upsert(
      {
        country_id: country.id,
        ...sector,
        key_players: sector.key_players,
        row_status: 'active',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'country_id,sector_key' }
    );

    if (error) {
      console.error(`❌ ${sector.sector_key}: ${error.message}`);
    } else {
      console.log(`✅ ${sector.sector_key}: ${sector.sector_label}`);
    }
  }

  console.log(`\n✅ Done! ${KEN_SECTORS.length} Kenya sectors seeded.`);
  console.log('   Verify: /country/KEN → Sectors tab');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
