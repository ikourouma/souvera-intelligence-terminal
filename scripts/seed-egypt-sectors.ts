/**
 * Seed Egypt Sectors — 7 key economic sectors for North Africa's largest economy.
 * Populates all fields required by SectorsTab + API (teaser, narratives, key players).
 *
 * Run: npx tsx scripts/seed-egypt-sectors.ts
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
  data_sources: string[];
}

const EGY_SECTORS: SectorSeed[] = [
  {
    sector_key: 'agriculture',
    sector_label: 'Agriculture & Agribusiness',
    icon_emoji: '🌾',
    display_order: 1,
    teaser:
      'Regional agricultural hub with diversified production spanning cotton, citrus, vegetables, and expanding desert farming through mega-irrigation projects.',
    strength_score: 78,
    growth_score: 72,
    attractiveness_score: 75,
    narrative_short:
      'Egypt\'s agriculture sector anchors food security across the Nile Delta and newly reclaimed desert lands. Cotton remains a traditional export crop, while citrus fruits, vegetables, and herbs supply European markets year-round.\n\nThe New Delta and Toshka mega-projects are expanding arable land through modern irrigation and greenhouses. Agro-processing for frozen foods, juices, and packaged goods is gaining momentum as export infrastructure modernizes.',
    narrative_full:
      'Production zones: The Nile Delta supports rice, wheat, and vegetables while Upper Egypt and desert reclamation projects focus on export crops. Greenhouse adoption is accelerating in coastal zones.\n\nValue chains: Citrus processing, frozen vegetable packing, and cotton spinning support value-added exports. Cold chain infrastructure at Mediterranean ports enables fresh produce exports to Gulf and European markets.\n\nPolicy context: Government subsidies for wheat and water allocation reforms shape farm economics. Export corridors to EU under association agreements provide preferential access.',
    key_players: [
      { name: 'Daltex', sector: 'Frozen Foods', description: 'Major frozen vegetable and fruit processor and exporter', metric: 'Pan-Mediterranean export network' },
      { name: 'Misr Italia Properties', sector: 'Agro-Industrial Development', description: 'Desert land reclamation and commercial farming operations', metric: 'Large-scale farm holdings' },
      { name: 'Egyptian Cotton Association', sector: 'Cotton & Textiles', description: 'Industry association representing cotton growers and traders', metric: 'Heritage export crop' },
    ],
    data_sources: ['Ministry of Agriculture', 'CAPMAS', 'World Bank'],
  },
  {
    sector_key: 'energy',
    sector_label: 'Energy & Infrastructure',
    icon_emoji: '⚡',
    display_order: 2,
    teaser:
      'Major natural gas producer in the Eastern Mediterranean with expanding LNG export capacity and renewable energy deployment across wind and solar.',
    strength_score: 85,
    growth_score: 80,
    attractiveness_score: 83,
    narrative_short:
      'Egypt is the Eastern Mediterranean\'s largest gas producer, with Zohr field discoveries establishing LNG export potential. Gas exports to Europe via pipeline and LNG terminals at Damietta and Idku are strategic priorities.\n\nRenewable energy is expanding rapidly with solar parks in Benban (Aswan) and wind farms along the Red Sea and Suez Gulf corridors. The New Administrative Capital and Suez Canal Economic Zone anchor power demand growth.',
    narrative_full:
      'Hydrocarbon backbone: Natural gas from offshore Mediterranean fields supplies domestic power generation and industrial users. LNG export facilities are being expanded to serve European demand post-Ukraine supply disruptions.\n\nRenewables: Benban Solar Park (1.8 GW) is one of Africa\'s largest solar installations. Wind farms in the Gulf of Suez harness consistent coastal breezes. IPP frameworks under BOO/BOOT structures attract international utilities.\n\nGreen hydrogen: Pilot projects in Ain Sokhna and Suez Economic Zone target ammonia exports to Europe as decarbonization accelerates.',
    key_players: [
      { name: 'Egyptian Natural Gas Holding Company (EGAS)', sector: 'Natural Gas', description: 'State holding company managing gas assets and concessions', metric: 'Eastern Mediterranean gas hub' },
      { name: 'Scatec ASA', sector: 'Solar Power', description: 'International developer of Benban solar installations', metric: '400+ MW solar capacity' },
      { name: 'Siemens Egypt', sector: 'Power Generation', description: 'Major turbine supplier and EPC contractor for gas plants', metric: 'Multi-GW power projects' },
    ],
    data_sources: ['Ministry of Petroleum', 'Egyptian Electricity Holding Company', 'IEA'],
  },
  {
    sector_key: 'manufacturing',
    sector_label: 'Manufacturing & Industrials',
    icon_emoji: '🏭',
    display_order: 3,
    teaser:
      'Diversified manufacturing base spanning cement, steel, petrochemicals, and automotive assembly with strategic export access to Arab, African, and European markets.',
    strength_score: 80,
    growth_score: 75,
    attractiveness_score: 78,
    narrative_short:
      'Egypt\'s industrial sector benefits from low energy costs, large domestic demand, and preferential trade agreements with the EU, Arab League, and African partners. Cement and steel production serve construction booms in the New Capital and Suez Canal zone.\n\nAutomotive assembly and components manufacturing leverage Qualifying Industrial Zones (QIZ) for duty-free exports to the U.S. Petrochemical complexes at Ain Sokhna process feedstock for plastics and fertilizers.',
    narrative_full:
      'Heavy industry: Cement giants supply domestic megaprojects and export clinker regionally. Steel rolling and rebar production support infrastructure buildout. Natural gas-fed industries benefit from local energy abundance.\n\nLight manufacturing: Textiles and garments in QIZ zones access U.S. markets duty-free under Egypt-Israel trade protocols. Electronics assembly and auto parts target African export markets under AfCFTA.\n\nIndustrial zones: Suez Canal Economic Zone, 10th of Ramadan City, and 6th October City anchor clusters with customs incentives and logistics connectivity.',
    key_players: [
      { name: 'Orascom Construction', sector: 'Engineering & Construction', description: 'Major EPC contractor for infrastructure and industrial projects', metric: 'NASDAQ Cairo listed' },
      { name: 'Ezz Steel', sector: 'Steel Production', description: 'Egypt\'s largest steel producer with integrated mills', metric: 'Leading steel manufacturer' },
      { name: 'EgyptAir Maintenance & Engineering', sector: 'Aerospace Services', description: 'MRO services for regional airlines and fleet operators', metric: 'Regional MRO hub' },
    ],
    data_sources: ['Ministry of Trade and Industry', 'CAPMAS', 'World Bank'],
  },
  {
    sector_key: 'tourism',
    sector_label: 'Tourism & Hospitality',
    icon_emoji: '🏛️',
    display_order: 4,
    teaser:
      'Heritage tourism anchored by Pyramids, Luxor temples, and Red Sea resorts with recovering visitor numbers post-2020 targeting pre-pandemic peaks.',
    strength_score: 82,
    growth_score: 78,
    attractiveness_score: 80,
    narrative_short:
      'Tourism is a historic economic pillar for Egypt, driven by world-renowned archaeological sites and Red Sea beach resorts. Giza Pyramids, Valley of the Kings, and Abu Simbel temples draw millions of international visitors annually.\n\nSharm el-Sheikh and Hurghada anchor Red Sea diving and resort tourism. The Grand Egyptian Museum (GEM) opening is expected to catalyze multi-year visitor growth. Cruise tourism on the Nile supports inland site visitation.',
    narrative_full:
      'Visitor segments: European package tours, Gulf leisure travelers, and Asian tour groups form core demand. Heritage sites command high global brand recognition but require ongoing conservation and site management investment.\n\nRecovery trajectory: Post-pandemic normalization and security improvements are restoring confidence. Charter flights and direct routes from European cities support high-season occupancy.\n\nInvestment themes: Hotel refurbishments in Cairo, Luxor, and coastal zones; GEM-adjacent hospitality; eco-tourism in Sinai and Western Desert oases.',
    key_players: [
      { name: 'Orascom Hotels & Development', sector: 'Resorts & Real Estate', description: 'Developer of Red Sea resort towns including El Gouna', metric: 'Integrated resort operator' },
      { name: 'Travco Group', sector: 'Tour Operations', description: 'Nile cruise operator and inbound tour services', metric: 'Major Nile cruise fleet' },
      { name: 'Ministry of Tourism and Antiquities', sector: 'Regulation & Promotion', description: 'National tourism policy and archaeological site management', metric: 'UNESCO heritage steward' },
    ],
    data_sources: ['Ministry of Tourism', 'UNWTO', 'World Bank'],
  },
  {
    sector_key: 'digital_infrastructure',
    sector_label: 'Digital Infrastructure & Tech',
    icon_emoji: '📡',
    display_order: 5,
    teaser:
      'Emerging tech hub with Cairo and Alexandria clusters in software development, BPO services, and data center deployment leveraging fiber-optic connectivity.',
    strength_score: 68,
    growth_score: 85,
    attractiveness_score: 76,
    narrative_short:
      'Egypt\'s digital economy is expanding through government initiatives in smart infrastructure and startup support programs. Cairo and Alexandria host growing software development clusters serving regional and European clients.\n\nData center investments are accelerating as fiber-optic backbone capacity increases and submarine cable landings expand. BPO and call center services leverage English and French language skills for outsourcing contracts.',
    narrative_full:
      'Infrastructure: Multiple submarine cable landings in Alexandria and Port Said provide international bandwidth. Government smart city projects (New Capital, Alamein) anchor demand for IoT and cloud services.\n\nStartup ecosystem: Technology Innovation and Entrepreneurship Centers (TIEC) support early-stage companies. VC activity in fintech, logistics tech, and edtech is modest but growing with regional fund participation.\n\nRegulatory progress: Digital Egypt initiative aims to improve government e-services and drive cashless payment adoption. Data protection and cybersecurity frameworks are evolving.',
    key_players: [
      { name: 'Telecom Egypt', sector: 'Telecommunications', description: 'State telecom incumbent with fiber backbone and data centers', metric: 'National fiber network operator' },
      { name: 'ITIDA', sector: 'Tech Parks & Incentives', description: 'IT Industry Development Agency managing tech zones', metric: 'Technology park regulator' },
      { name: 'Fawry', sector: 'Fintech & Digital Payments', description: 'Digital payment platform and bill payment aggregator', metric: 'EGX listed fintech' },
    ],
    data_sources: ['Ministry of Communications', 'ITIDA', 'World Bank'],
  },
  {
    sector_key: 'fintech',
    sector_label: 'Financial Services & Fintech',
    icon_emoji: '💳',
    display_order: 6,
    teaser:
      'Banking sector undergoing digital transformation with mobile wallet adoption and Central Bank initiatives to expand financial inclusion and cashless payments.',
    strength_score: 72,
    growth_score: 80,
    attractiveness_score: 76,
    narrative_short:
      'Egypt\'s financial sector is led by large state-owned and private banks serving corporate and retail segments. The Central Bank of Egypt (CBE) is pushing digital payment infrastructure through licensing mobile wallet providers and interoperable QR codes.\n\nFinancial inclusion remains a policy priority with agent banking and mobile wallets expanding access in underbanked areas. Microfinance institutions and non-bank lenders are filling SME credit gaps.',
    narrative_full:
      'Banking landscape: National Bank of Egypt, Banque Misr, and Commercial International Bank (CIB) dominate assets. Islamic banking windows and standalone institutions serve sharia-compliant demand.\n\nFintech momentum: Fawry, Paymob, and telco wallets (Vodafone Cash, Orange Money) are digitizing bill payments and peer-to-peer transfers. CBE regulatory sandbox enables pilot testing of digital lending and insurtech models.\n\nCapital markets: Egyptian Exchange supports bond and equity listings with increasing foreign participation post-FX liberalization. Sovereign debt issuance and sukuk offerings are regular fixtures.',
    key_players: [
      { name: 'Commercial International Bank (CIB)', sector: 'Banking', description: 'Egypt\'s largest private bank by assets', metric: 'Leading corporate and retail bank' },
      { name: 'Fawry', sector: 'Digital Payments', description: 'Payment gateway and bill aggregation platform', metric: 'EGX listed, 35M+ users' },
      { name: 'Central Bank of Egypt', sector: 'Regulation', description: 'Monetary authority and fintech licensing body', metric: 'National payment system oversight' },
    ],
    data_sources: ['Central Bank of Egypt', 'Egyptian Exchange', 'World Bank'],
  },
  {
    sector_key: 'textiles',
    sector_label: 'Textiles & Apparel',
    icon_emoji: '👔',
    display_order: 7,
    teaser:
      'Established textiles industry leveraging Qualifying Industrial Zones (QIZ) for duty-free U.S. exports and targeting European markets under association agreements.',
    strength_score: 70,
    growth_score: 65,
    attractiveness_score: 68,
    narrative_short:
      'Egypt\'s textile and garment sector is rooted in cotton production heritage and has modernized through QIZ export zones. QIZ facilities enable duty-free U.S. market access by incorporating Israeli inputs, supporting apparel and home textile exports.\n\nVertically integrated mills spin cotton yarn, weave fabrics, and produce finished garments. European buyers source from Egyptian manufacturers under EU trade preferences. Workforce skills and competitive labor costs support contract manufacturing.',
    narrative_full:
      'Export corridors: QIZ zones in Greater Cairo and Alexandria anchor U.S.-bound garment exports. EU association agreement provides tariff reductions for textiles and apparel meeting rules of origin.\n\nValue chain: Spinning mills process local and imported cotton. Dyeing, finishing, and cut-and-sew operations serve fast fashion and basics segments. Home textiles (towels, linens) target hospitality and retail buyers.\n\nCompetition: Low-cost Asian producers and Ethiopian AGOA-eligible garments create pricing pressure. Automation and lead-time responsiveness are competitive differentiators.',
    key_players: [
      { name: 'Oriental Weavers', sector: 'Home Textiles & Carpets', description: 'Integrated manufacturer of carpets and floor coverings', metric: 'Global carpet exporter' },
      { name: 'Cleopatra Group', sector: 'Ceramics & Sanitary Ware', description: 'Industrial conglomerate with textile interests', metric: 'Diversified manufacturer' },
      { name: 'Egyptian Textile Consolidation Company', sector: 'Textiles', description: 'State holding company for public-sector mills', metric: 'Legacy textile operator' },
    ],
    data_sources: ['Ministry of Trade and Industry', 'CAPMAS', 'ITC Trade Map'],
  },
];

function assertEgyPurity(sector: SectorSeed): void {
  const text = `${sector.teaser} ${sector.narrative_short}`.toLowerCase();
  const forbidden = [
    'nigeria',
    'naira',
    'lagos',
    'kenya',
    'nairobi',
    'jamaica',
    'm-pesa',
    'dangote',
    'safaricom',
  ];
  for (const m of forbidden) {
    if (text.includes(m)) {
      throw new Error(`EGY sector ${sector.sector_key} contains forbidden marker "${m}"`);
    }
  }
  for (const p of sector.key_players) {
    const pText = `${p.name} ${p.description}`.toLowerCase();
    if (pText.includes('kenya') || pText.includes('nigeria') || pText.includes('jamaica')) {
      throw new Error(`EGY sector ${sector.sector_key} key player contaminated with other country entity`);
    }
  }
}

async function main() {
  console.log('🚀 Seeding Egypt sectors (7 key economic sectors)...\n');

  for (const s of EGY_SECTORS) {
    assertEgyPurity(s);
  }

  const { data: country, error: countryError } = await supabase
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', 'EGY')
    .maybeSingle();

  if (countryError || !country) {
    console.error('❌ Egypt (EGY) not found in souvera_countries');
    process.exit(1);
  }

  console.log(`✓ Found: ${country.name}\n`);

  for (const sector of EGY_SECTORS) {
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

  console.log(`\n✅ Done! ${EGY_SECTORS.length} Egypt sectors seeded.`);
  console.log('   Verify at: /intelligence/map?region=africa&selected=EGY');
  console.log('   API check: /api/v1/country-lite?iso3=EGY');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
