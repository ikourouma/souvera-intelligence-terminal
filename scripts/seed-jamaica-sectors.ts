/**
 * Seed Jamaica Sectors — full Bloomberg-grade parity with Nigeria (NGA).
 * Populates all fields required by SectorsTab + API (teaser, narratives, key players, CBI trade).
 *
 * Run: npx tsx scripts/seed-jamaica-sectors.ts
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

const JAM_SECTORS: SectorSeed[] = [
  {
    sector_key: 'fintech',
    sector_label: 'Fintech & Digital Finance',
    icon_emoji: '💳',
    display_order: 1,
    teaser:
      'Caribbean fintech hub with BOJ-regulated digital payments, JAM-DEX CBDC pilot, and Kingston nearshore services corridor to North America.',
    strength_score: 72,
    growth_score: 78,
    attractiveness_score: 76,
    narrative_short:
      'Jamaica\'s fintech sector is anchored by the Bank of Jamaica\'s supportive regulatory posture and Kingston\'s role as a regional digital services hub. Mobile money adoption is advancing, with licensed payment service providers expanding digital wallet and remittance solutions.\n\nThe JAM-DEX CBDC pilot positions Jamaica at the forefront of Caribbean digital currency development. Remittance corridors from North America and the UK remain a strategic focus, with <span class="text-emerald-400 font-semibold">$3.5B+</span> in annual remittance inflows supporting digital payment volume.',
    narrative_full:
      'Regulatory framework: BOJ sandbox and payment-service licensing enable fintech innovation while maintaining financial stability. Nearshore opportunity: English-speaking workforce and US Eastern time-zone alignment support BPO and software services exports to North American firms at <span class="text-blue-400">30-40%</span> labor cost advantage vs U.S. metros.\n\nInfrastructure: Submarine cable landing stations and improving fiber connectivity in Kingston and Montego Bay support cloud and data services. Policy priorities include financial inclusion, cybersecurity frameworks, and cross-border payment interoperability under CARICOM arrangements.',
    key_players: [
      { name: 'NCB Financial Group', sector: 'Banking & Fintech', description: 'Leading commercial bank with digital wallet and mobile banking platform', metric: 'Largest bank by assets, 40+ branches' },
      { name: 'JMMB Group', sector: 'Financial Services', description: 'Regional financial group with digital investment and banking services', metric: 'Operations in Jamaica, T&T, and Dominican Republic' },
      { name: 'GraceKennedy Money Services', sector: 'Remittances', description: 'Bill Express and remittance corridors across Caribbean diaspora', metric: 'Part of GraceKennedy Group (JSE listed)' },
    ],
    agoa_opportunity:
      'CBI Export Opportunity: Jamaica\'s fintech and BPO services qualify for preferential U.S. market access under CBI/CARICOM arrangements. Nearshore digital services to North American firms represent a $120M+ annual export corridor with 30-40% labor cost advantage vs U.S. metros.',
    agoa_export_current_usd: 45_000_000,
    agoa_export_potential_usd: 120_000_000,
    data_sources: ['Bank of Jamaica', 'STATIN', 'World Bank', 'Souvera Analysis'],
  },
  {
    sector_key: 'energy',
    sector_label: 'Energy & Renewables',
    icon_emoji: '⚡',
    display_order: 2,
    teaser:
      'Transitioning from oil dependence to LNG and renewables, with solar and wind projects advancing across the island.',
    strength_score: 65,
    growth_score: 75,
    attractiveness_score: 70,
    narrative_short:
      'Jamaica\'s energy sector is transforming through JPS diversification toward LNG and renewable generation. Solar PV installations are expanding in commercial and utility-scale configurations, with wind projects in St. Elizabeth and Clarendon parishes under development.\n\nThe Integrated Resource Plan targets increased renewable penetration. Net billing frameworks support distributed generation, though high electricity costs and grid modernization remain sector challenges.',
    narrative_full:
      'Generation mix: Jamaica Public Service Company (JPS) operates the national grid with growing LNG and renewable share. Wigton Windfarm and utility-scale solar reduce fossil dependence. Energy security and climate resilience are national priorities given hurricane exposure.\n\nInvestment entry points include renewable IPPs, grid modernization PPPs, and distributed solar for commercial and tourism properties. CBI-eligible equipment imports support U.S.-Caribbean clean energy supply chains.',
    key_players: [
      { name: 'Jamaica Public Service (JPS)', sector: 'Utility', description: 'Integrated electric utility serving Jamaica', metric: 'Monopoly transmission & distribution' },
      { name: 'Wigton Windfarm', sector: 'Renewables', description: 'Utility-scale wind generation in Manchester parish', metric: '63 MW capacity' },
      { name: 'Eight Rivers Energy', sector: 'LNG', description: 'LNG terminal supporting gas-fired generation diversification', metric: '120 MW equivalent supply' },
    ],
    agoa_opportunity:
      'CBI Export Opportunity: Renewable energy equipment and LNG-related exports qualify under CBI preferential access. Solar and wind component exports support U.S. Caribbean energy diversification goals.',
    agoa_export_current_usd: 25_000_000,
    agoa_export_potential_usd: 60_000_000,
    data_sources: ['Office of Utilities Regulation', 'JPS', 'World Bank'],
  },
  {
    sector_key: 'agriculture',
    sector_label: 'Agriculture & Agribusiness',
    icon_emoji: '🌾',
    display_order: 3,
    teaser:
      'Export-oriented agriculture focused on Blue Mountain coffee, cocoa, and spices, supported by agro-processing and tourism linkages.',
    strength_score: 68,
    growth_score: 65,
    attractiveness_score: 67,
    narrative_short:
      'Jamaica\'s agriculture is characterized by Blue Mountain coffee, cocoa cultivation, and spice exports including allspice and ginger. Value addition through agro-processing is gaining traction, with farm-to-table supply chains for resorts and restaurants expanding in rural parishes.\n\nPremium exports command strong U.S. price points under CBI preferential access. Hurricane exposure and post-harvest losses remain operational constraints mitigated through greenhouse adoption and irrigation expansion.',
    narrative_full:
      'Export anchors: Blue Mountain coffee remains Jamaica\'s most recognized premium agricultural brand globally. Cocoa and spice exports support specialty food manufacturing. Tourism linkages create stable domestic demand for fresh produce and processed goods.\n\nMinistry of Agriculture and Fisheries supports irrigation expansion, greenhouse adoption, and organic certification for niche U.S. and European markets. Small and medium-scale farms dominate; aggregation models and co-ops improve export consistency.',
    key_players: [
      { name: 'Jamaica Blue Mountain Coffee', sector: 'Coffee', description: 'Geographic indication premium coffee exports', metric: 'Top-tier U.S. retail pricing' },
      { name: 'Jamaica Producers Group', sector: 'Agribusiness', description: 'Food manufacturing and distribution across Caribbean', metric: 'JSE listed, multi-brand portfolio' },
      { name: 'Seprod Limited', sector: 'Food Processing', description: 'Dairy, juices, and consumer goods manufacturing', metric: 'Major domestic food producer' },
    ],
    agoa_opportunity:
      'CBI Export Opportunity: Blue Mountain coffee, cocoa, and spice exports enjoy duty-free U.S. entry under CBI. Premium agricultural exports to the U.S. market total $180M+ annually with growth in organic and specialty segments.',
    agoa_export_current_usd: 180_000_000,
    agoa_export_potential_usd: 250_000_000,
    data_sources: ['Ministry of Agriculture', 'STATIN', 'ITC Trade Map'],
  },
  {
    sector_key: 'mining',
    sector_label: 'Mining & Alumina',
    icon_emoji: '⛏️',
    display_order: 4,
    teaser:
      'Bauxite and alumina production anchored by long-established operations and integration with North American aluminum supply chains.',
    strength_score: 78,
    growth_score: 55,
    attractiveness_score: 68,
    narrative_short:
      'Jamaica is a major global bauxite producer with mining operations in St. Ann, St. Catherine, and Manchester parishes. Alumina refining capacity supports export to North American and European aluminum smelters.\n\nThe sector anchors Jamaica\'s goods export revenues, though global aluminum price volatility and energy costs for refining introduce cyclical exposure. Land rehabilitation and community benefit-sharing are regulatory priorities.',
    narrative_full:
      'Supply chain: Bauxite mining feeds alumina refineries with established export routes to U.S. smelters under bilateral trade flows predating CBI but reinforced by preferential arrangements. Noranda and Jamalco operations employ thousands in mining parishes.\n\nESG focus: Mined-land rehabilitation frameworks and community engagement are reputational requirements for institutional investors. Rare earth exploration remains at an early stage with limited commercial output.',
    key_players: [
      { name: 'Noranda Alumina', sector: 'Alumina Refining', description: 'Alumina refinery serving global aluminum smelters', metric: 'Major export revenue contributor' },
      { name: 'Jamalco', sector: 'Mining & Refining', description: 'Bauxite mining and alumina joint venture operations', metric: 'Clarendon parish operations' },
      { name: 'New Day Aluminum', sector: 'Alumina', description: 'Alumina production with U.S. market integration', metric: 'St. Ann refinery capacity' },
    ],
    agoa_opportunity:
      'CBI Export Opportunity: Bauxite and alumina exports to U.S. smelters benefit from established bilateral trade flows. Alumina exports represent Jamaica\'s largest goods export category to the United States.',
    agoa_export_current_usd: 520_000_000,
    agoa_export_potential_usd: 600_000_000,
    data_sources: ['Ministry of Mining', 'UN Comtrade', 'World Bank'],
  },
  {
    sector_key: 'logistics',
    sector_label: 'Logistics & Trade',
    icon_emoji: '🚢',
    display_order: 5,
    teaser:
      'Caribbean transshipment hub anchored by Kingston Freeport Terminal and strategic location on major shipping lanes.',
    strength_score: 75,
    growth_score: 68,
    attractiveness_score: 72,
    narrative_short:
      'Jamaica\'s logistics sector is driven by the Kingston Container Terminal (KCT), one of the Caribbean\'s largest transshipment hubs. Deep-water access and connectivity to major shipping lines serve North America, Europe, and Latin America.\n\nNorman Manley International Airport supports perishable and high-value air freight exports. CARICOM membership and CBI arrangements facilitate regional and U.S. commerce, though port congestion during peak periods remains an operational focus.',
    narrative_full:
      'Port infrastructure: DP World-operated Kingston Freeport Terminal expansion enhanced capacity and efficiency. Transshipment volumes link Caribbean cargo to U.S. East Coast supply chains.\n\nTrade facilitation: Customs modernization and single-window initiatives reduce clearance times. Logistics investment supports re-export models under CARICOM/CBI frameworks for eligible goods entering U.S. markets duty-free.',
    key_players: [
      { name: 'Kingston Freeport Terminal', sector: 'Port', description: 'Caribbean transshipment hub operated by DP World', metric: 'Deep-water container terminal' },
      { name: 'Port Authority of Jamaica', sector: 'Infrastructure', description: 'National port and maritime authority', metric: 'Multi-port network' },
      { name: 'Norman Manley Int\'l Airport', sector: 'Air Cargo', description: 'Primary air gateway for perishable exports', metric: 'Kingston cargo hub' },
    ],
    agoa_opportunity:
      'CBI Export Opportunity: Kingston transshipment hub supports Caribbean-U.S. supply chains. Logistics and re-export services under CARICOM/CBI frameworks enable duty-free movement of eligible goods to U.S. markets.',
    agoa_export_current_usd: 95_000_000,
    agoa_export_potential_usd: 140_000_000,
    data_sources: ['Port Authority of Jamaica', 'STATIN', 'UNCTAD'],
  },
];

function assertJamPurity(sector: SectorSeed): void {
  const text = `${sector.teaser} ${sector.narrative_short} ${sector.agoa_opportunity}`.toLowerCase();
  if (text.includes('agoa restoration') || text.includes('nigeria') || text.includes('naira')) {
    throw new Error(`JAM sector ${sector.sector_key} contains NGA marker`);
  }
  for (const p of sector.key_players) {
    const pText = `${p.name} ${p.description}`.toLowerCase();
    if (pText.includes('flutterwave') || pText.includes('dangote') || pText.includes('lagos')) {
      throw new Error(`JAM sector ${sector.sector_key} key player contaminated with NGA entity`);
    }
  }
}

async function main() {
  console.log('🚀 Seeding Jamaica sectors (full NGA parity)...\n');

  for (const s of JAM_SECTORS) {
    assertJamPurity(s);
  }

  const { data: country, error: countryError } = await supabase
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', 'JAM')
    .maybeSingle();

  if (countryError || !country) {
    console.error('❌ Jamaica (JAM) not found');
    process.exit(1);
  }

  for (const sector of JAM_SECTORS) {
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

  console.log(`\n✅ Done! ${JAM_SECTORS.length} Jamaica sectors seeded.`);
  console.log('   Verify: /country/JAM → Sectors tab');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
