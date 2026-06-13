/**
 * Seed Caribbean Wave 2 — TTO, BRB, BHS.
 * Time series, signal scores, overview profiles, 5 sectors each (CBI not AGOA).
 *
 * Run: npx tsx scripts/seed-caribbean-wave2.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { seedCountryTimeSeries } from './lib/seed-time-series';
import { validateCountryAnalysisMd } from './lib/country-analysis-template';

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

interface Wave2Country {
  iso3: string;
  name: string;
  signal: { growth_score: number; risk_score: number; investment_score: number; confidence_score: number };
  timeSeries: Array<{ year: number; indicator: string; value: number }>;
  profile: {
    summary_md: string;
    why_now_md: string;
    opportunity_thesis_md: string;
    risk_narrative_md: string;
    signal_level: 'emerging' | 'stable' | 'high_growth';
    economic_momentum: number;
    investor_readiness: number;
  };
  sectors: SectorSeed[];
  forbiddenMarkers: string[];
}

const WAVE2: Wave2Country[] = [
  {
    iso3: 'TTO',
    name: 'Trinidad and Tobago',
    signal: { growth_score: 70, risk_score: 52, investment_score: 66, confidence_score: 72 },
    profile: {
      summary_md: `Trinidad and Tobago is the Caribbean's energy and industrial anchor, with GDP of approximately $28 billion (2025) and a population of 1.4 million. The economy is driven by LNG, petrochemicals, steel, and food manufacturing, with Port of Spain serving as a regional logistics gateway.

Point Lisas industrial estate and Atlantic LNG anchor ammonia, methanol, and LNG exports to North America. CARICOM trade integration and CBI preferential U.S. access support manufacturing and energy-linked investment through 2027.`,
      why_now_md: `Trinidad and Tobago is positioned at a downstream diversification inflection with three converging opportunities:

- **Energy Corridor:** LNG and petrochemical export capacity supplies the Caribbean and U.S. Gulf with feedstock cost advantages versus import-dependent peers.
- **Guyana Linkage:** Proximity to Guyana offshore development creates logistics, services, and industrial supply chain demand.
- **CARICOM Manufacturing:** CBI-eligible steel, food, and assembly exports serve regional and U.S. markets.

**Investment Window:** 24–36 month entry as energy prices normalize and manufacturing scale expands.`,
      opportunity_thesis_md: `**PILLAR 1: Energy & Petrochemicals** — LNG, ammonia, and methanol exports with downstream diversification.\n**PILLAR 2: Manufacturing** — Steel, food processing, and assembly under CBI access.\n**PILLAR 3: Logistics** — Port of Spain and Point Lisas industrial corridor.`,
      risk_narrative_md: `**MACRO:** Energy price cyclicality affects fiscal revenues. **OPERATIONAL:** Industrial estate capex and Port of Spain security planning required. **MITIGATION:** Long-term offtake contracts and CBI export revenue diversification.`,
      signal_level: 'emerging',
      economic_momentum: 32,
      investor_readiness: 66,
    },
    timeSeries: [
      { year: 2020, indicator: 'gdp_current_usd', value: 22_100_000_000 },
      { year: 2020, indicator: 'gdp_growth_pct', value: -7.4 },
      { year: 2020, indicator: 'population_total', value: 1_390_000 },
      { year: 2020, indicator: 'fdi_net_inflows_usd', value: 680_000_000 },
      { year: 2020, indicator: 'inflation_cpi_pct', value: 1.0 },
      { year: 2020, indicator: 'fx_to_usd', value: 6.75 },
      { year: 2020, indicator: 'debt_to_gdp_pct', value: 78.0 },
      { year: 2024, indicator: 'gdp_current_usd', value: 27_200_000_000 },
      { year: 2024, indicator: 'gdp_growth_pct', value: 2.1 },
      { year: 2024, indicator: 'population_total', value: 1_410_000 },
      { year: 2024, indicator: 'fdi_net_inflows_usd', value: 1_050_000_000 },
      { year: 2024, indicator: 'inflation_cpi_pct', value: 3.2 },
      { year: 2024, indicator: 'fx_to_usd', value: 6.78 },
      { year: 2024, indicator: 'debt_to_gdp_pct', value: 72.0 },
      { year: 2025, indicator: 'gdp_current_usd', value: 28_000_000_000 },
      { year: 2025, indicator: 'gdp_growth_pct', value: 2.4 },
      { year: 2025, indicator: 'fdi_net_inflows_usd', value: 1_100_000_000 },
      { year: 2025, indicator: 'inflation_cpi_pct', value: 3.0 },
      { year: 2025, indicator: 'fx_to_usd', value: 6.79 },
    ],
    forbiddenMarkers: ['nigeria', 'naira', 'agoa restoration', 'm-pesa', 'lagos fintech'],
    sectors: [
      {
        sector_key: 'energy',
        sector_label: 'Energy & Petrochemicals',
        icon_emoji: '⚡',
        display_order: 1,
        teaser: 'LNG, ammonia, and methanol exports anchor Caribbean energy supply with Point Lisas downstream scale.',
        strength_score: 82,
        growth_score: 68,
        attractiveness_score: 75,
        narrative_short: 'Trinidad\'s Atlantic LNG and Point Lisas industrial estate supply regional petrochemical demand. Feedstock advantage supports ammonia, urea, and methanol exports under long-term contracts.',
        narrative_full: 'Atlantic LNG trains and Nutrien Trinidad operations anchor export revenues. Renewable diversification targets reduce gas dependence over the medium term.',
        key_players: [
          { name: 'Atlantic LNG', sector: 'LNG', description: 'Liquefied natural gas export trains', metric: '4.2 mtpa capacity' },
          { name: 'Nutrien Trinidad', sector: 'Petrochemicals', description: 'Ammonia and urea production', metric: 'Point Lisas complex' },
        ],
        agoa_opportunity: 'CBI Export Opportunity: Petrochemical and energy equipment exports qualify under CBI/CARICOM preferential U.S. access.',
        agoa_export_current_usd: 1_200_000_000,
        agoa_export_potential_usd: 1_500_000_000,
        data_sources: ['Ministry of Energy', 'CSO Trinidad', 'UN Comtrade'],
      },
      {
        sector_key: 'manufacturing',
        sector_label: 'Manufacturing & Steel',
        icon_emoji: '🏭',
        display_order: 2,
        teaser: 'Steel, food processing, and assembly serve CARICOM demand with CBI duty-free U.S. entry on eligible goods.',
        strength_score: 74,
        growth_score: 62,
        attractiveness_score: 70,
        narrative_short: 'Manufacturing spans steel, beverages, and food processing for regional markets. CBI frameworks support duty-free movement of eligible goods to U.S. buyers.',
        narrative_full: 'Industrial policy targets higher value-add exports and import substitution for CARICOM consumers.',
        key_players: [
          { name: 'ArcelorMittal Trinidad', sector: 'Steel', description: 'Long products for regional construction', metric: 'Major steel producer' },
          { name: 'SM Jaleel', sector: 'Beverages', description: 'Regional beverage distribution', metric: 'CARICOM brand portfolio' },
        ],
        agoa_opportunity: 'CBI Export Opportunity: Processed foods and light manufacturing qualify for preferential U.S. market access.',
        agoa_export_current_usd: 420_000_000,
        agoa_export_potential_usd: 580_000_000,
        data_sources: ['Ministry of Trade', 'CSO Trinidad'],
      },
      {
        sector_key: 'logistics',
        sector_label: 'Maritime & Logistics',
        icon_emoji: '🚢',
        display_order: 3,
        teaser: 'Port of Spain and Point Lisas support Guyana corridor trade and Caribbean transshipment.',
        strength_score: 72,
        growth_score: 70,
        attractiveness_score: 71,
        narrative_short: 'Deep-water port capacity and industrial logistics link Trinidad to Guyana offshore development and CARICOM distribution.',
        narrative_full: 'Free zone and warehousing models support re-export under CSME and CBI arrangements.',
        key_players: [
          { name: 'Port Authority of Trinidad', sector: 'Port', description: 'Port of Spain container and bulk operations', metric: 'National port network' },
          { name: 'PLIPDECO', sector: 'Industrial Estate', description: 'Point Lisas industrial port management', metric: 'Energy logistics hub' },
        ],
        agoa_opportunity: 'CBI Export Opportunity: Logistics and re-export services enable duty-free eligible goods movement to U.S. markets.',
        agoa_export_current_usd: 180_000_000,
        agoa_export_potential_usd: 260_000_000,
        data_sources: ['Port Authority', 'UNCTAD'],
      },
      {
        sector_key: 'financial',
        sector_label: 'Financial Services',
        icon_emoji: '🏦',
        display_order: 4,
        teaser: 'Regional banking and capital markets hub with energy-linked corporate finance depth.',
        strength_score: 68,
        growth_score: 58,
        attractiveness_score: 65,
        narrative_short: 'Trinidad hosts CARICOM banking groups and energy sector financing expertise. Stock exchange liquidity supports regional listings.',
        narrative_full: 'CBTT regulatory framework supports banking stability and capital market development.',
        key_players: [
          { name: 'Republic Financial Holdings', sector: 'Banking', description: 'Regional banking group headquartered in Trinidad', metric: 'CARICOM footprint' },
          { name: 'Trinidad & Tobago Stock Exchange', sector: 'Capital Markets', description: 'Regional securities exchange', metric: 'Energy and financial listings' },
        ],
        agoa_opportunity: 'CBI Export Opportunity: Financial and professional services to U.S. energy and industrial clients under regional trade frameworks.',
        agoa_export_current_usd: 95_000_000,
        agoa_export_potential_usd: 140_000_000,
        data_sources: ['CBTT', 'TTSE'],
      },
      {
        sector_key: 'agriculture',
        sector_label: 'Agriculture & Food',
        icon_emoji: '🌾',
        display_order: 5,
        teaser: 'Cocoa, citrus, and poultry supply domestic and CARICOM markets with agro-processing expansion.',
        strength_score: 60,
        growth_score: 55,
        attractiveness_score: 58,
        narrative_short: 'Agriculture supports food security and export niches including cocoa and citrus. Agro-processing adds value for CBI-eligible U.S. exports.',
        narrative_full: 'Land tenure and climate variability remain constraints; greenhouse and irrigation programs advance.',
        key_players: [
          { name: 'Nestlé Trinidad', sector: 'Food Processing', description: 'Cocoa and beverage processing', metric: 'Export-oriented plant' },
          { name: 'National Agricultural Marketing', sector: 'Agribusiness', description: 'Farmer aggregation and export coordination', metric: 'Government marketing agency' },
        ],
        agoa_opportunity: 'CBI Export Opportunity: Processed cocoa, citrus, and specialty foods qualify for duty-free U.S. entry.',
        agoa_export_current_usd: 85_000_000,
        agoa_export_potential_usd: 120_000_000,
        data_sources: ['Ministry of Agriculture', 'CSO Trinidad'],
      },
    ],
  },
  {
    iso3: 'BRB',
    name: 'Barbados',
    signal: { growth_score: 68, risk_score: 45, investment_score: 70, confidence_score: 76 },
    profile: {
      summary_md: `Barbados is the Eastern Caribbean's high-income services hub, with GDP of approximately $6.5 billion (2025) and population of 280,000. Tourism, international financial services, and rum exports anchor the economy.

Grantley Adams International Airport and Bridgetown's IFC framework support premium tourism and fintech sandbox investment. CBI preferential U.S. access applies to eligible rum, food, and light manufacturing exports.`,
      why_now_md: `Barbados offers three converging opportunities over 24–36 months:

- **Premium Tourism:** Luxury segment RevPAR growth and long-stay villa demand.
- **IFS & Fintech:** Sandbox-licensed digital asset and payment innovators.
- **Solar Transition:** Utility-scale deployment reducing import dependence.

**Investment Window:** Institutional entry as tourism normalizes and renewable pipeline scales.`,
      opportunity_thesis_md: `**PILLAR 1: Tourism** — Premium recovery and airport connectivity.\n**PILLAR 2: IFS** — Offshore finance and fintech sandbox.\n**PILLAR 3: Renewables** — Solar and efficiency retrofits.`,
      risk_narrative_md: `**MACRO:** Tourism concentration and hurricane seasonality. **MITIGATION:** IFS revenue, insurance, and CBI export diversification.`,
      signal_level: 'emerging',
      economic_momentum: 26,
      investor_readiness: 70,
    },
    timeSeries: [
      { year: 2020, indicator: 'gdp_current_usd', value: 4_200_000_000 },
      { year: 2020, indicator: 'gdp_growth_pct', value: -14.0 },
      { year: 2020, indicator: 'population_total', value: 278_000 },
      { year: 2020, indicator: 'fdi_net_inflows_usd', value: 180_000_000 },
      { year: 2020, indicator: 'inflation_cpi_pct', value: 1.2 },
      { year: 2020, indicator: 'fx_to_usd', value: 2.0 },
      { year: 2024, indicator: 'gdp_current_usd', value: 6_200_000_000 },
      { year: 2024, indicator: 'gdp_growth_pct', value: 3.8 },
      { year: 2024, indicator: 'fdi_net_inflows_usd', value: 400_000_000 },
      { year: 2024, indicator: 'inflation_cpi_pct', value: 4.1 },
      { year: 2024, indicator: 'fx_to_usd', value: 2.0 },
      { year: 2025, indicator: 'gdp_current_usd', value: 6_500_000_000 },
      { year: 2025, indicator: 'gdp_growth_pct', value: 3.2 },
      { year: 2025, indicator: 'fdi_net_inflows_usd', value: 420_000_000 },
      { year: 2025, indicator: 'inflation_cpi_pct', value: 3.8 },
      { year: 2025, indicator: 'fx_to_usd', value: 2.0 },
    ],
    forbiddenMarkers: ['nigeria', 'naira', 'agoa', 'point lisas', 'lng train'],
    sectors: [
      {
        sector_key: 'tourism',
        sector_label: 'Tourism & Hospitality',
        icon_emoji: '✈️',
        display_order: 1,
        teaser: 'Premium tourism recovery with luxury villa, yacht, and long-stay segments outperforming mass market.',
        strength_score: 78,
        growth_score: 72,
        attractiveness_score: 76,
        narrative_short: 'Barbados targets high-spend visitors with Grantley Adams long-haul connectivity. RevPAR growth in luxury coastal properties supports resort capex.',
        narrative_full: 'Sustainable tourism and community-based models align with ESG investor criteria.',
        key_players: [
          { name: 'Sandals Barbados', sector: 'Resorts', description: 'Luxury all-inclusive resort operator', metric: 'Premium segment leader' },
          { name: 'Grantley Adams Int\'l', sector: 'Aviation', description: 'Primary air gateway', metric: 'Long-haul connectivity hub' },
        ],
        agoa_opportunity: 'CBI Export Opportunity: Tourism-linked manufacturing and specialty foods qualify for preferential U.S. access.',
        agoa_export_current_usd: 280_000_000,
        agoa_export_potential_usd: 380_000_000,
        data_sources: ['BTA', 'Barbados Statistical Service'],
      },
      {
        sector_key: 'financial',
        sector_label: 'IFS & Fintech',
        icon_emoji: '🏦',
        display_order: 2,
        teaser: 'International business, captive insurance, and fintech sandbox attract regional headquarters.',
        strength_score: 75,
        growth_score: 70,
        attractiveness_score: 74,
        narrative_short: 'Barbados IFC framework supports offshore companies, trusts, and sandbox-licensed fintech innovators with English common-law certainty.',
        narrative_full: 'Regulatory modernization balances innovation with OECD compliance standards.',
        key_players: [
          { name: 'Central Bank of Barbados', sector: 'Regulation', description: 'Monetary and fintech sandbox oversight', metric: 'Policy anchor' },
          { name: 'Barbados International Business', sector: 'IFS', description: 'Offshore company administration cluster', metric: 'Regional HQ destination' },
        ],
        agoa_opportunity: 'CBI Export Opportunity: Financial and BPO services to North American clients under CARICOM/CBI frameworks.',
        agoa_export_current_usd: 120_000_000,
        agoa_export_potential_usd: 180_000_000,
        data_sources: ['CBB', 'IFS Barbados'],
      },
      {
        sector_key: 'rum_agri',
        sector_label: 'Rum & Agro-Processing',
        icon_emoji: '🥃',
        display_order: 3,
        teaser: 'Premium rum and food manufacturing with strong CBI duty-free U.S. retail positioning.',
        strength_score: 72,
        growth_score: 65,
        attractiveness_score: 70,
        narrative_short: 'Mount Gay and West Indies Rum Distillery anchor branded exports. Agro-processing serves CARICOM and U.S. specialty food channels.',
        narrative_full: 'Geographic indication and brand heritage support premium pricing in North American markets.',
        key_players: [
          { name: 'Mount Gay Rum', sector: 'Spirits', description: 'Oldest rum brand with global distribution', metric: 'Premium export pricing' },
          { name: 'WIBISCO', sector: 'Food', description: 'Biscuit and snack manufacturing', metric: 'Regional food producer' },
        ],
        agoa_opportunity: 'CBI Export Opportunity: Rum and specialty food exports enjoy duty-free U.S. entry under CBI.',
        agoa_export_current_usd: 95_000_000,
        agoa_export_potential_usd: 130_000_000,
        data_sources: ['Ministry of Agriculture', 'Export Barbados'],
      },
      {
        sector_key: 'renewables',
        sector_label: 'Solar & Renewables',
        icon_emoji: '☀️',
        display_order: 4,
        teaser: 'Utility-scale solar and EV infrastructure reduce fossil import dependence.',
        strength_score: 65,
        growth_score: 78,
        attractiveness_score: 72,
        narrative_short: 'Government renewable targets drive solar deployment on public buildings, hotels, and utility scale. CBI-eligible equipment imports support U.S. supply chains.',
        narrative_full: 'Grid integration and storage remain development priorities.',
        key_players: [
          { name: 'Barbados National Energy', sector: 'Policy', description: 'Renewable energy policy coordination', metric: 'National targets' },
          { name: 'Emera Caribbean', sector: 'Utility', description: 'Electric utility with renewable integration', metric: 'Grid operator' },
        ],
        agoa_opportunity: 'CBI Export Opportunity: Solar equipment and energy services qualify under CBI preferential arrangements.',
        agoa_export_current_usd: 35_000_000,
        agoa_export_potential_usd: 90_000_000,
        data_sources: ['Ministry of Energy', 'CBB'],
      },
      {
        sector_key: 'creative',
        sector_label: 'Creative & BPO',
        icon_emoji: '💻',
        display_order: 5,
        teaser: 'English-speaking BPO and creative services export to North America with US time-zone alignment.',
        strength_score: 62,
        growth_score: 74,
        attractiveness_score: 68,
        narrative_short: 'Barbados targets knowledge-process outsourcing and digital creative exports. Fiber connectivity and educated workforce support nearshore delivery.',
        narrative_full: 'Government incentives promote tech-enabled services diversification beyond tourism.',
        key_players: [
          { name: 'Trident Insurance', sector: 'BPO', description: 'Back-office services export', metric: 'Regional BPO operator' },
        ],
        agoa_opportunity: 'CBI Export Opportunity: BPO and digital services to U.S. firms qualify under services trade frameworks.',
        agoa_export_current_usd: 55_000_000,
        agoa_export_potential_usd: 95_000_000,
        data_sources: ['BIDC', 'Export Barbados'],
      },
    ],
  },
  {
    iso3: 'BHS',
    name: 'Bahamas',
    signal: { growth_score: 71, risk_score: 50, investment_score: 69, confidence_score: 73 },
    profile: {
      summary_md: `The Bahamas is a $14 billion archipelago economy driven by tourism, offshore financial services, and Freeport maritime logistics. Nassau anchors wealth management; cruise and resort investment is recovering strongly.

The BSD currency peg to the USD reduces FX risk for North American investors. CBI preferential access supports eligible tourism-linked and seafood exports.`,
      why_now_md: `The Bahamas presents three investment themes for 24–36 months:

- **Luxury Tourism & Real Estate:** Resort and Out Island development pipeline.
- **Offshore Finance:** Trust, captive insurance, and fund administration growth.
- **Freeport Logistics:** Transshipment and maritime services to U.S. East Coast.

**Investment Window:** Entry as occupancy and cruise volumes normalize post-pandemic.`,
      opportunity_thesis_md: `**PILLAR 1: Tourism** — Cruise and resort recovery.\n**PILLAR 2: IFS** — Offshore banking and trusts.\n**PILLAR 3: Maritime** — Freeport transhipment.`,
      risk_narrative_md: `**MACRO:** Tourism concentration and hurricane tail risk. **MITIGATION:** USD peg, insurance, and IFS diversification.`,
      signal_level: 'emerging',
      economic_momentum: 30,
      investor_readiness: 69,
    },
    timeSeries: [
      { year: 2020, indicator: 'gdp_current_usd', value: 9_800_000_000 },
      { year: 2020, indicator: 'gdp_growth_pct', value: -14.5 },
      { year: 2020, indicator: 'population_total', value: 393_000 },
      { year: 2020, indicator: 'fdi_net_inflows_usd', value: 850_000_000 },
      { year: 2020, indicator: 'inflation_cpi_pct', value: 0.3 },
      { year: 2020, indicator: 'fx_to_usd', value: 1.0 },
      { year: 2024, indicator: 'gdp_current_usd', value: 13_500_000_000 },
      { year: 2024, indicator: 'gdp_growth_pct', value: 4.2 },
      { year: 2024, indicator: 'fdi_net_inflows_usd', value: 1_200_000_000 },
      { year: 2024, indicator: 'inflation_cpi_pct', value: 2.8 },
      { year: 2024, indicator: 'fx_to_usd', value: 1.0 },
      { year: 2025, indicator: 'gdp_current_usd', value: 14_000_000_000 },
      { year: 2025, indicator: 'gdp_growth_pct', value: 3.5 },
      { year: 2025, indicator: 'fdi_net_inflows_usd', value: 1_250_000_000 },
      { year: 2025, indicator: 'inflation_cpi_pct', value: 2.5 },
      { year: 2025, indicator: 'fx_to_usd', value: 1.0 },
    ],
    forbiddenMarkers: ['nigeria', 'naira', 'agoa restoration', 'trinidad energy', 'point lisas'],
    sectors: [
      {
        sector_key: 'tourism',
        sector_label: 'Tourism & Resorts',
        icon_emoji: '🛳️',
        display_order: 1,
        teaser: 'Luxury resorts, cruise ports, and second-home markets recovering with higher per-visitor spend.',
        strength_score: 80,
        growth_score: 74,
        attractiveness_score: 77,
        narrative_short: 'Tourism drives employment and FX on New Providence and the Out Islands. Branded resort pipelines and cruise port upgrades support RevPAR growth.',
        narrative_full: 'Hurricane resilience investment remains a sector priority for institutional investors.',
        key_players: [
          { name: 'Atlantis Paradise Island', sector: 'Resorts', description: 'Iconic integrated resort complex', metric: 'Major employment hub' },
          { name: 'Nassau Cruise Port', sector: 'Cruise', description: 'Primary cruise gateway', metric: 'Multi-ship berthing' },
        ],
        agoa_opportunity: 'CBI Export Opportunity: Tourism-linked manufacturing and seafood exports qualify for preferential U.S. access.',
        agoa_export_current_usd: 520_000_000,
        agoa_export_potential_usd: 680_000_000,
        data_sources: ['Ministry of Tourism', 'Central Bank of The Bahamas'],
      },
      {
        sector_key: 'financial',
        sector_label: 'Offshore Finance',
        icon_emoji: '🏦',
        display_order: 2,
        teaser: 'Private banking, trusts, and captive insurance serve North American wealth with BSD stability.',
        strength_score: 76,
        growth_score: 62,
        attractiveness_score: 72,
        narrative_short: 'The Bahamas is a leading offshore center for trusts, banking, and captive insurance with decades of regulatory evolution toward international standards.',
        narrative_full: 'Compliance investment required; licensed institutions maintain competitive advantage.',
        key_players: [
          { name: 'Bahamas Financial Services Board', sector: 'IFS', description: 'Industry promotion and policy coordination', metric: 'Sector advocate' },
          { name: 'RBC Bahamas', sector: 'Banking', description: 'Leading domestic and offshore bank', metric: 'Branch network' },
        ],
        agoa_opportunity: 'CBI Export Opportunity: Financial and fund administration services to U.S. clients under established bilateral frameworks.',
        agoa_export_current_usd: 210_000_000,
        agoa_export_potential_usd: 280_000_000,
        data_sources: ['Central Bank of The Bahamas', 'BFSB'],
      },
      {
        sector_key: 'maritime',
        sector_label: 'Freeport & Maritime',
        icon_emoji: '🚢',
        display_order: 3,
        teaser: 'Freeport container terminal and ship registry support U.S. East Coast logistics investment.',
        strength_score: 70,
        growth_score: 66,
        attractiveness_score: 69,
        narrative_short: 'Grand Bahama Port Authority manages Freeport SEZ with container, warehousing, and ship registry services.',
        narrative_full: 'CBI re-export models enable duty-free movement of eligible goods to U.S. markets.',
        key_players: [
          { name: 'Freeport Container Port', sector: 'Logistics', description: 'Deep-water transshipment terminal', metric: 'Regional hub' },
          { name: 'Bahamas Maritime Authority', sector: 'Registry', description: 'Ship registration and maritime services', metric: 'Open registry' },
        ],
        agoa_opportunity: 'CBI Export Opportunity: Maritime services and re-export logistics qualify under CBI preferential access.',
        agoa_export_current_usd: 140_000_000,
        agoa_export_potential_usd: 200_000_000,
        data_sources: ['GBPA', 'UNCTAD'],
      },
      {
        sector_key: 'real_estate',
        sector_label: 'Real Estate & Development',
        icon_emoji: '🏗️',
        display_order: 4,
        teaser: 'Second-home and resort development on Out Islands attract North American capital.',
        strength_score: 72,
        growth_score: 68,
        attractiveness_score: 71,
        narrative_short: 'Residential and resort development targets HNW buyers from the U.S. and Canada. BSD peg simplifies return modeling for foreign investors.',
        narrative_full: 'Foreign investment approval processes and hurricane insurance costs factor into underwriting.',
        key_players: [
          { name: 'Bahamas Realty Association', sector: 'Real Estate', description: 'Market coordination for foreign investment', metric: 'Industry body' },
        ],
        agoa_opportunity: 'CBI Export Opportunity: Construction materials and resort equipment imports support CBI-eligible supply chains.',
        agoa_export_current_usd: 180_000_000,
        agoa_export_potential_usd: 250_000_000,
        data_sources: ['Bahamas Investment Authority'],
      },
      {
        sector_key: 'fisheries',
        sector_label: 'Fisheries & Seafood',
        icon_emoji: '🐟',
        display_order: 5,
        teaser: 'Lobster and conch exports serve U.S. specialty seafood markets under CBI preferential access.',
        strength_score: 58,
        growth_score: 60,
        attractiveness_score: 62,
        narrative_short: 'Commercial fishing and aquaculture supply premium seafood exports. Cold chain and processing capacity support CBI-eligible U.S. entry.',
        narrative_full: 'Sustainability certification increasingly required for U.S. retail buyers.',
        key_players: [
          { name: 'Bahamas Marine Exporters', sector: 'Seafood', description: 'Lobster and conch export aggregation', metric: 'U.S. market linkage' },
        ],
        agoa_opportunity: 'CBI Export Opportunity: Lobster, conch, and processed seafood qualify for duty-free U.S. entry under CBI.',
        agoa_export_current_usd: 65_000_000,
        agoa_export_potential_usd: 95_000_000,
        data_sources: ['Department of Marine Resources'],
      },
    ],
  },
];

function assertSectorPurity(iso3: string, sector: SectorSeed, forbidden: string[]): void {
  const text = `${sector.teaser} ${sector.narrative_short} ${sector.agoa_opportunity}`.toLowerCase();
  if (text.includes('agoa restoration') || (text.includes('agoa') && !text.includes('cbi'))) {
    throw new Error(`${iso3} sector ${sector.sector_key}: use CBI framing, not AGOA`);
  }
  for (const f of forbidden) {
    if (text.includes(f)) throw new Error(`${iso3} sector ${sector.sector_key} contains forbidden marker: ${f}`);
  }
}

async function seedCountry(config: Wave2Country): Promise<void> {
  console.log(`\n── ${config.iso3} (${config.name}) ──`);

  const { data: country } = await supabase
    .from('souvera_countries')
    .select('id, name')
    .eq('iso3', config.iso3)
    .maybeSingle();

  if (!country) {
    console.error(`❌ ${config.iso3}: country not found`);
    return;
  }

  for (const s of config.sectors) {
    assertSectorPurity(config.iso3, s, config.forbiddenMarkers);
  }

  validateCountryAnalysisMd(config.profile.why_now_md, config.name);

  await seedCountryTimeSeries(supabase, config.iso3, config.timeSeries);
  console.log(`✅ ${config.iso3}: time series`);

  const { error: signalError } = await supabase.from('souvera_country_signal_scores').upsert(
    {
      country_id: country.id,
      signal_level: config.profile.signal_level,
      growth_score: config.signal.growth_score,
      risk_score: config.signal.risk_score,
      investment_score: config.signal.investment_score,
      confidence_score: config.signal.confidence_score,
      scoring_version: 'v1.0-preview',
      computed_at: new Date().toISOString(),
    },
    { onConflict: 'country_id' }
  );
  if (signalError) console.error(`❌ ${config.iso3} signal: ${signalError.message}`);
  else console.log(`✅ ${config.iso3}: signal scores`);

  const { error: profileError } = await supabase.from('souvera_country_profiles').upsert(
    {
      country_id: country.id,
      ...config.profile,
      economic_momentum: String(config.profile.economic_momentum),
      investor_readiness: String(config.profile.investor_readiness),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'country_id' }
  );
  if (profileError) console.error(`❌ ${config.iso3} profile: ${profileError.message}`);
  else console.log(`✅ ${config.iso3}: overview profile`);

  for (const sector of config.sectors) {
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
    if (error) console.error(`❌ ${config.iso3}/${sector.sector_key}: ${error.message}`);
    else console.log(`✅ ${config.iso3}: ${sector.sector_key}`);
  }
}

async function main() {
  console.log('🚀 Seeding Caribbean Wave 2 (TTO, BRB, BHS)...\n');

  for (const config of WAVE2) {
    await seedCountry(config);
  }

  console.log('\n✅ Done! Verify: /country/TTO, /country/BRB, /country/BHS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
