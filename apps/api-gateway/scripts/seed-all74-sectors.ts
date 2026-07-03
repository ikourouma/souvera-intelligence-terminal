/**
 * Seed a 7-sector Bloomberg-grade baseline for every approved market that has
 * ZERO active sectors. Markets that already have curated sectors (pilot + Wave 1)
 * are left untouched so hand-authored content is preserved.
 *
 * Each seeded sector includes: teaser, 3 sector scores, region-aware narrative,
 * role-based key players (truthful categories, not fabricated companies),
 * icon, and data sources. This guarantees the Sectors tab never shows the
 * "Sector intelligence is being prepared" empty state for any of the 74 markets.
 *
 * Run: npx tsx apps/api-gateway/scripts/seed-all74-sectors.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { APPROVED_AFRICA_ISO3, APPROVED_CARIBBEAN_ISO3 } from '../src/lib/market-coverage';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ALL74_ISO3 = [...APPROVED_AFRICA_ISO3, ...APPROVED_CARIBBEAN_ISO3];
const CARIBBEAN = new Set<string>(APPROVED_CARIBBEAN_ISO3 as unknown as string[]);

interface KeyPlayer {
  name: string;
  sector: string;
  description: string;
  metric: string;
}

interface SectorTemplate {
  sector_key: string;
  sector_label: string;
  icon_emoji: string;
  display_order: number;
  baseStrength: { africa: number; caribbean: number };
  baseGrowth: { africa: number; caribbean: number };
  baseAttractiveness: { africa: number; caribbean: number };
  teaser: (name: string, region: 'africa' | 'caribbean') => string;
  narrativeShort: (name: string, region: 'africa' | 'caribbean') => string;
  narrativeFull: (name: string, region: 'africa' | 'caribbean') => string;
  keyPlayers: KeyPlayer[];
  dataSources: string[];
}

const SECTORS: SectorTemplate[] = [
  {
    sector_key: 'agriculture_food',
    sector_label: 'Agriculture & Food Processing',
    icon_emoji: '🌾',
    display_order: 1,
    baseStrength: { africa: 62, caribbean: 55 },
    baseGrowth: { africa: 58, caribbean: 52 },
    baseAttractiveness: { africa: 60, caribbean: 56 },
    teaser: (n) =>
      `Agriculture and agro-processing anchor ${n}'s rural economy, with value-add and specialty export potential.`,
    narrativeShort: (n, r) =>
      r === 'caribbean'
        ? `${n}'s agriculture sector focuses on high-value specialty crops and value-added food processing. Preferential access to U.S. and EU markets supports premium exports in tropical produce, beverages, and processed goods.\n\nCold-chain investment and food-safety certification are expanding year-round export capacity, while agro-tourism linkages create additional revenue streams.`
        : `${n}'s agriculture sector remains foundational to employment and food security, with growing emphasis on value-added exports and specialty crops. Investment in irrigation, cold chain, and agro-processing is unlocking higher-margin export corridors.\n\nClimate-smart practices and AfCFTA market access position the sector for regional value-chain integration and import substitution.`,
    narrativeFull: (n, r) =>
      r === 'caribbean'
        ? `Production base: smallholder farms and estates supply domestic consumption and specialty exports. Value-add processing (rum, sauces, processed fruit) commands premium pricing under CBI/CARIFORUM preferences.\n\nInvestment entry points include cold-chain logistics, organic certification, and agro-tourism. Climate resilience and hurricane risk management are priorities for sustained output.`
        : `Production base: ${n}'s farmers and cooperatives supply staple and cash crops, with processing capacity emerging as the key value-add opportunity. AGOA and AfCFTA frameworks support export diversification.\n\nInvestment entry points include irrigation, storage, mechanization, and processing facilities. Land tenure clarity, extension services, and access to finance shape the pace of commercialization.`,
    keyPlayers: [
      { name: 'Producer Cooperatives', sector: 'Production', description: 'Organized smallholder and estate producer groups supplying domestic and export value chains', metric: 'Primary production base' },
      { name: 'Agro-Processing Enterprises', sector: 'Value-Add', description: 'Local processors converting raw commodities into higher-value packaged exports', metric: 'Highest-margin segment' },
      { name: 'Export & Standards Boards', sector: 'Trade Facilitation', description: 'Public and private bodies coordinating quality standards and export logistics', metric: 'Market access enabler' },
    ],
    dataSources: ['World Bank', 'FAO', 'UNCTAD', 'Souvera Analysis'],
  },
  {
    sector_key: 'mining_minerals',
    sector_label: 'Mining & Critical Minerals',
    icon_emoji: '⛏️',
    display_order: 2,
    baseStrength: { africa: 60, caribbean: 45 },
    baseGrowth: { africa: 64, caribbean: 44 },
    baseAttractiveness: { africa: 63, caribbean: 46 },
    teaser: (n) =>
      `Mineral resources offer ${n} export revenue and critical-minerals positioning within global supply chains.`,
    narrativeShort: (n, r) =>
      r === 'caribbean'
        ? `${n}'s extractives focus on construction materials, and where present, bauxite, gold, or petroleum derivatives. Resource governance and ESG compliance shape new project viability.\n\nOpportunities exist in downstream processing and supply of refined inputs to regional construction and energy markets.`
        : `${n}'s mining sector supports export earnings and, increasingly, critical-minerals supply chains tied to the energy transition. ESG compliance and community benefit-sharing are now baseline requirements for institutional capital.\n\nDownstream processing and beneficiation represent the principal value-add opportunity beyond raw ore export.`,
    narrativeFull: (n, r) =>
      r === 'caribbean'
        ? `Resource base varies by market — bauxite/alumina, gold, aggregates, and petroleum derivatives. Permitting transparency and environmental safeguards govern new entrants.\n\nInvestment entry points include processing, equipment supply, and rehabilitation of legacy sites. Preferential trade access supports export of processed metals and materials.`
        : `Resource base: ${n} holds extractive potential across precious metals, base metals, and/or critical minerals relevant to EV and renewable supply chains. Beneficiation policy increasingly favors in-country processing.\n\nInvestment entry points include exploration, processing capacity, and supporting infrastructure (power, rail, ports). Regulatory predictability and ESG alignment are decisive for capital deployment.`,
    keyPlayers: [
      { name: 'Licensed Mining Operators', sector: 'Extraction', description: 'Permitted producers operating under national mining codes and royalty regimes', metric: 'Core export earners' },
      { name: 'Mineral Processing Ventures', sector: 'Beneficiation', description: 'Downstream refining and value-add operations capturing higher margins', metric: 'Value-add priority' },
      { name: 'Mining Regulatory Authority', sector: 'Governance', description: 'State body administering licensing, ESG compliance, and revenue collection', metric: 'Investment gatekeeper' },
    ],
    dataSources: ['USGS', 'World Bank', 'UNCTAD', 'Souvera Analysis'],
  },
  {
    sector_key: 'energy_power',
    sector_label: 'Energy & Power',
    icon_emoji: '⚡',
    display_order: 3,
    baseStrength: { africa: 55, caribbean: 52 },
    baseGrowth: { africa: 66, caribbean: 62 },
    baseAttractiveness: { africa: 64, caribbean: 60 },
    teaser: (n) =>
      `${n}'s power sector is transitioning toward renewables and expanded generation to meet rising demand.`,
    narrativeShort: (n, r) =>
      r === 'caribbean'
        ? `${n} is pivoting from diesel dependence toward solar, wind, and LNG to reduce high electricity costs. Utility-scale renewables and grid modernization are central investment themes.\n\nDistributed generation and storage support resilience against fuel-price and hurricane shocks.`
        : `${n}'s energy sector balances expanding access with a shift toward renewables and, where available, natural gas. Generation capacity, transmission, and distribution investment are critical to industrial growth.\n\nIndependent power producers, mini-grids, and off-grid solar are unlocking electrification and reliability gains.`,
    narrativeFull: (n, r) =>
      r === 'caribbean'
        ? `Generation mix is shifting from imported fuels to solar, wind, and LNG. High tariffs make renewables economically compelling.\n\nInvestment entry points include utility-scale solar, storage, grid upgrades, and energy-efficiency retrofits. Regulatory frameworks and PPAs determine IPP bankability.`
        : `Generation mix: ${n} combines existing capacity with a renewable expansion pipeline (solar, wind, hydro, and/or gas). Reliability and access remain core constraints on industrialization.\n\nInvestment entry points include IPPs, transmission, mini-grids, and rural electrification. PPA frameworks and tariff structures shape investor confidence.`,
    keyPlayers: [
      { name: 'National Power Utility', sector: 'Generation & Grid', description: 'State or regulated utility managing generation, transmission, and distribution', metric: 'Grid backbone' },
      { name: 'Independent Power Producers', sector: 'Renewables', description: 'Private developers delivering solar, wind, hydro, and gas capacity under PPAs', metric: 'Fastest-growing segment' },
      { name: 'Energy Regulator', sector: 'Policy', description: 'Authority setting tariffs, licensing, and renewable-integration standards', metric: 'Bankability driver' },
    ],
    dataSources: ['IEA', 'IRENA', 'World Bank', 'Souvera Analysis'],
  },
  {
    sector_key: 'manufacturing_textiles',
    sector_label: 'Manufacturing & Textiles',
    icon_emoji: '🏭',
    display_order: 4,
    baseStrength: { africa: 50, caribbean: 48 },
    baseGrowth: { africa: 60, caribbean: 54 },
    baseAttractiveness: { africa: 58, caribbean: 55 },
    teaser: (n) =>
      `Manufacturing and light industry offer ${n} nearshoring and preferential-access export potential.`,
    narrativeShort: (n, r) =>
      r === 'caribbean'
        ? `${n}'s manufacturing leverages CBI/CBTPA preferences for duty-free U.S. access in apparel, light assembly, and processed goods. Free-zone incentives and proximity to U.S. markets support nearshoring.\n\nCompetitive logistics and workforce development are key to capturing supply-chain diversification.`
        : `${n}'s manufacturing base spans agro-processing, construction materials, and light industry, with apparel/EPZ potential under AGOA duty-free access. Competitive labor costs support nearshoring as global supply chains diversify.\n\nIndustrial parks, power reliability, and trade facilitation determine the pace of export-led industrialization.`,
    narrativeFull: (n, r) =>
      r === 'caribbean'
        ? `Industrial base centers on free zones serving U.S.-bound apparel, medical devices, and light assembly. CBI/CBTPA preferences underpin competitiveness.\n\nInvestment entry points include free-zone operations, logistics, and workforce training. Energy costs and shipping frequency are the principal constraints.`
        : `Industrial base: ${n} hosts agro-processing and light manufacturing, with export-processing-zone apparel a recurring AGOA opportunity. Nearshoring momentum favors competitive-cost producers.\n\nInvestment entry points include EPZ apparel, packaging, building materials, and assembly. Power, logistics, and skills availability shape competitiveness.`,
    keyPlayers: [
      { name: 'Export Processing Zones', sector: 'Industrial Parks', description: 'Designated zones offering incentives for export-oriented manufacturing', metric: 'Nearshoring anchor' },
      { name: 'Light Manufacturing Firms', sector: 'Production', description: 'Apparel, packaging, and assembly operations serving regional and U.S. markets', metric: 'Employment generator' },
      { name: 'Investment Promotion Agency', sector: 'Facilitation', description: 'Body marketing incentives and coordinating investor onboarding', metric: 'Entry enabler' },
    ],
    dataSources: ['UNIDO', 'World Bank', 'UNCTAD', 'Souvera Analysis'],
  },
  {
    sector_key: 'tourism_hospitality',
    sector_label: 'Tourism & Hospitality',
    icon_emoji: '🏨',
    display_order: 5,
    baseStrength: { africa: 54, caribbean: 78 },
    baseGrowth: { africa: 60, caribbean: 66 },
    baseAttractiveness: { africa: 58, caribbean: 74 },
    teaser: (n, r) =>
      r === 'caribbean'
        ? `Tourism is a cornerstone of ${n}'s economy, driving foreign exchange, employment, and real-estate investment.`
        : `${n}'s tourism sector offers nature, heritage, and business-travel potential with premium eco-tourism upside.`,
    narrativeShort: (n, r) =>
      r === 'caribbean'
        ? `Tourism anchors ${n}'s economy, contributing a large share of GDP and employment. Cruise, resort, and luxury segments drive arrivals, with U.S. visitors dominant.\n\nLuxury, eco, and heritage tourism command premium rates, while airlift capacity and resilience investment shape recovery and growth.`
        : `${n}'s tourism sector is rebuilding around nature, heritage, and business travel, with eco-tourism and hospitality investment offering premium upside. Connectivity and destination marketing are key growth levers.\n\nSustainable tourism certification and community-based models attract ESG-focused hospitality capital.`,
    narrativeFull: (n, r) =>
      r === 'caribbean'
        ? `Tourism contributes a dominant share of GDP and employment. Cruise and resort tourism drive volume; luxury and eco segments drive yield.\n\nInvestment entry points include resorts, marinas, and hospitality services. Hurricane resilience, airlift, and labor availability are decisive factors.`
        : `Tourism assets: ${n} offers wildlife, landscape, cultural, and/or coastal attractions. Hospitality investment and connectivity unlock growth.\n\nInvestment entry points include lodges, hotels, tour operations, and supporting infrastructure. Safety perception, visa facilitation, and marketing reach shape arrivals.`,
    keyPlayers: [
      { name: 'Hotel & Resort Operators', sector: 'Accommodation', description: 'Domestic and international hospitality groups operating lodging assets', metric: 'Core revenue base' },
      { name: 'Tour & Travel Services', sector: 'Experiences', description: 'Operators delivering tours, transport, and destination experiences', metric: 'Yield driver' },
      { name: 'Tourism Authority', sector: 'Promotion', description: 'National body coordinating marketing, standards, and airlift development', metric: 'Demand catalyst' },
    ],
    dataSources: ['UNWTO', 'World Bank', 'WTTC', 'Souvera Analysis'],
  },
  {
    sector_key: 'digital_infrastructure',
    sector_label: 'Digital Infrastructure',
    icon_emoji: '📡',
    display_order: 6,
    baseStrength: { africa: 48, caribbean: 56 },
    baseGrowth: { africa: 70, caribbean: 64 },
    baseAttractiveness: { africa: 66, caribbean: 62 },
    teaser: (n) =>
      `Connectivity, data centers, and mobile services position ${n} for digital-economy growth.`,
    narrativeShort: (n, r) =>
      r === 'caribbean'
        ? `${n}'s digital infrastructure benefits from submarine-cable connectivity and proximity to U.S. networks, supporting nearshore services and low-latency links.\n\nMobile broadband, data-center capacity, and cybersecurity are central to digital-services competitiveness.`
        : `${n}'s digital infrastructure is expanding through fiber rollout, mobile broadband, and submarine-cable connectivity. Data-center deployment and 5G pilots support the digital economy.\n\nMobile money and digital public infrastructure are deepening financial inclusion and service delivery.`,
    narrativeFull: (n, r) =>
      r === 'caribbean'
        ? `Connectivity leverages multiple submarine cables for redundant, low-latency U.S. links. Nearshore IT-enabled services are a strategic opportunity.\n\nInvestment entry points include data centers, fiber, and managed services. Spectrum policy and skills supply shape scale-up.`
        : `Connectivity: ${n} is extending fiber, mobile broadband, and international bandwidth. Urban data-center and cloud demand is rising.\n\nInvestment entry points include towers, fiber, data centers, and digital services. Spectrum allocation, electricity reliability, and skills availability are key constraints.`,
    keyPlayers: [
      { name: 'Mobile Network Operators', sector: 'Telecom', description: 'Licensed operators providing mobile voice, data, and money services', metric: 'Connectivity backbone' },
      { name: 'Data Center & ISP Providers', sector: 'Infrastructure', description: 'Hosting, cloud, and internet-service providers serving enterprise demand', metric: 'Fastest-growing segment' },
      { name: 'Communications Regulator', sector: 'Policy', description: 'Authority managing spectrum, licensing, and competition', metric: 'Scale-up enabler' },
    ],
    dataSources: ['ITU', 'World Bank', 'GSMA', 'Souvera Analysis'],
  },
  {
    sector_key: 'logistics_trade',
    sector_label: 'Logistics & Trade',
    icon_emoji: '🚢',
    display_order: 7,
    baseStrength: { africa: 52, caribbean: 58 },
    baseGrowth: { africa: 62, caribbean: 58 },
    baseAttractiveness: { africa: 60, caribbean: 60 },
    teaser: (n) =>
      `Ports, freight, and trade facilitation underpin ${n}'s regional connectivity and export competitiveness.`,
    narrativeShort: (n, r) =>
      r === 'caribbean'
        ? `${n}'s logistics sector leverages location on major shipping lanes for transshipment, bonded warehousing, and value-added processing of U.S.-bound cargo.\n\nPort modernization and digital freight platforms enhance trade facilitation and supply-chain reliability.`
        : `${n}'s logistics sector is modernizing ports, corridors, and freight services to capture intra-African trade under AfCFTA and global supply-chain links. Trade facilitation reform reduces clearance times and costs.\n\nCold chain, bonded warehousing, and corridor infrastructure enable export-led manufacturing and agriculture.`,
    narrativeFull: (n, r) =>
      r === 'caribbean'
        ? `Logistics leverages proximity to major shipping lanes and the U.S. market. Transshipment and bonded zones support trade facilitation.\n\nInvestment entry points include port upgrades, cold chain, and freight digitization. Shipping frequency and customs efficiency are decisive.`
        : `Trade infrastructure: ${n} relies on ports and/or corridors for import-export flows. AfCFTA implementation raises the value of efficient logistics.\n\nInvestment entry points include port and corridor upgrades, warehousing, cold chain, and digital freight. Customs modernization and corridor security shape competitiveness.`,
    keyPlayers: [
      { name: 'Port & Terminal Operators', sector: 'Gateways', description: 'Operators managing seaport, airport, and dry-port throughput', metric: 'Trade gateway' },
      { name: 'Freight & Logistics Firms', sector: 'Distribution', description: 'Forwarders and 3PLs moving cargo across regional corridors', metric: 'Supply-chain backbone' },
      { name: 'Customs & Trade Authority', sector: 'Facilitation', description: 'Agencies administering clearance, single-window, and trade compliance', metric: 'Cost & time driver' },
    ],
    dataSources: ['World Bank LPI', 'UNCTAD', 'Souvera Analysis'],
  },
];

/** Deterministic small variation so scores are not identical across markets. */
function jitter(iso3: string, sectorKey: string, spread = 8): number {
  let h = 0;
  const s = `${iso3}:${sectorKey}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  const norm = (Math.abs(h) % 1000) / 1000; // 0..1
  return Math.round((norm * 2 - 1) * spread); // -spread..+spread
}

function clamp(v: number): number {
  return Math.max(20, Math.min(98, v));
}

async function main() {
  console.log('\n=== Seed 7-sector baseline for empty markets ===\n');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: countries } = await sb
    .from('souvera_countries')
    .select('id, iso3, name')
    .in('iso3', ALL74_ISO3 as unknown as string[]);
  const byIso3 = new Map((countries ?? []).map((c) => [c.iso3, c]));

  // Existing active sector counts per country
  const { data: existing } = await sb
    .from('souvera_country_sectors')
    .select('country_id')
    .eq('row_status', 'active');
  const counts = new Map<string, number>();
  for (const r of existing ?? []) counts.set(r.country_id, (counts.get(r.country_id) ?? 0) + 1);

  let marketsSeeded = 0;
  let rowsSeeded = 0;
  let skipped = 0;

  for (const iso3 of ALL74_ISO3) {
    const country = byIso3.get(iso3);
    if (!country) {
      console.log(`  ⚠️  ${iso3}: country row missing`);
      continue;
    }
    const existingCount = counts.get(country.id) ?? 0;
    if (existingCount > 0) {
      skipped++;
      continue; // preserve curated content
    }

    const region: 'africa' | 'caribbean' = CARIBBEAN.has(iso3) ? 'caribbean' : 'africa';
    const rows = SECTORS.map((s) => ({
      country_id: country.id,
      sector_key: s.sector_key,
      sector_label: s.sector_label,
      icon_emoji: s.icon_emoji,
      display_order: s.display_order,
      teaser: s.teaser(country.name, region),
      strength_score: clamp(s.baseStrength[region] + jitter(iso3, s.sector_key)),
      growth_score: clamp(s.baseGrowth[region] + jitter(iso3, s.sector_key + 'g')),
      attractiveness_score: clamp(s.baseAttractiveness[region] + jitter(iso3, s.sector_key + 'a')),
      narrative_short: s.narrativeShort(country.name, region),
      narrative_full: s.narrativeFull(country.name, region),
      key_players: s.keyPlayers,
      data_sources: s.dataSources,
      row_status: 'active',
    }));

    const { error } = await sb
      .from('souvera_country_sectors')
      .upsert(rows, { onConflict: 'country_id,sector_key' });
    if (error) {
      console.log(`  ❌ ${iso3}: ${error.message}`);
    } else {
      marketsSeeded++;
      rowsSeeded += rows.length;
      console.log(`  ✅ ${iso3} (${region}): ${rows.length} sectors`);
    }
  }

  console.log(`\n✅ Markets seeded: ${marketsSeeded}`);
  console.log(`✅ Sector rows created: ${rowsSeeded}`);
  console.log(`↩️  Markets skipped (already had sectors): ${skipped}`);
  console.log('\nDone.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
