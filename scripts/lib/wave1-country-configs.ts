/**
 * Wave 1 Africa per-country seed configs — GHA, ZAF, ETH, SEN, CIV, TZA.
 */

import type { ProfileSeed, SectorSeed, SignalSeed } from './seed-country-bundle';
import type { TimeSeriesRow } from './seed-time-series';
import type { Wave1AfricaIso3 } from '../../apps/api-gateway/src/lib/intelligence/rollout-manifest';

export interface Wave1CountryConfig {
  iso3: Wave1AfricaIso3;
  name: string;
  profile: ProfileSeed;
  timeSeries: TimeSeriesRow[];
  signal: SignalSeed;
  sectors: SectorSeed[];
  extraForbidden?: string[];
}

function buildSector(
  base: Omit<SectorSeed, 'agoa_opportunity' | 'agoa_export_current_usd' | 'agoa_export_potential_usd'>,
  agoa: Pick<SectorSeed, 'agoa_opportunity' | 'agoa_export_current_usd' | 'agoa_export_potential_usd'>
): SectorSeed {
  return { ...base, ...agoa };
}

function tsRows(
  years: Array<{
    year: number;
    gdp: number;
    growth: number;
    pop: number;
    fdi: number;
    inflation: number;
    fx: number;
    debt: number;
  }>
): TimeSeriesRow[] {
  return years.flatMap((y) => [
    { year: y.year, indicator: 'gdp_current_usd', value: y.gdp },
    { year: y.year, indicator: 'gdp_growth_pct', value: y.growth },
    { year: y.year, indicator: 'population_total', value: y.pop },
    { year: y.year, indicator: 'fdi_net_inflows_usd', value: y.fdi },
    { year: y.year, indicator: 'inflation_cpi_pct', value: y.inflation },
    { year: y.year, indicator: 'fx_to_usd', value: y.fx },
    { year: y.year, indicator: 'debt_to_gdp_pct', value: y.debt },
  ]);
}

const GHA_CONFIG: Wave1CountryConfig = {
  iso3: 'GHA',
  name: 'Ghana',
  signal: { signal_level: 'emerging', growth_score: 74, risk_score: 48, investment_score: 70, confidence_score: 72 },
  profile: {
    signal_level: 'emerging',
    economic_momentum: '38',
    investor_readiness: '68',
    summary_md: `Ghana is West Africa's second-largest economy with GDP of approximately $83 billion (2025) and a population of 34 million. Accra anchors fintech and services growth while Tema port drives gold and cocoa export corridors.`,
    why_now_md: `Ghana is at a West Africa inflection point with three converging opportunities:

- **Gold & Mining Scale:** Established operators anchor export revenues while refinery investment expands value-add corridors supporting **$890M+** AGOA-eligible trade potential.

- **Cocoa Value-Add:** Second-largest global cocoa producer with processing and specialty export opportunities under AGOA duty-free access.

- **Digital Finance:** Mobile money penetration exceeds 60% with Bank of Ghana sandbox provisions enabling lending and BaaS expansion across ECOWAS.

**Investment Window:** Ghana offers a 24-36 month positioning window as cocoa processing scales and Accra fintech cluster matures.`,
    opportunity_thesis_md: `Ghana represents an $83B West African economy at a mining and agriculture value-add inflection point across gold, cocoa, digital finance, and port logistics.`,
    risk_narrative_md: `Ghana requires balanced macro, political, and operational risk assessment. Cedi volatility and debt levels are moderated by IMF program oversight and stable democratic institutions.`,
  },
  timeSeries: tsRows([
    { year: 2020, gdp: 67e9, growth: 0.5, pop: 31_700_000, fdi: 1.9e9, inflation: 9.9, fx: 5.8, debt: 76 },
    { year: 2021, gdp: 77.6e9, growth: 5.1, pop: 32_300_000, fdi: 2.6e9, inflation: 10.0, fx: 6.0, debt: 78 },
    { year: 2022, gdp: 73.8e9, growth: 3.8, pop: 32_800_000, fdi: 1.5e9, inflation: 31.7, fx: 8.6, debt: 82 },
    { year: 2023, gdp: 76.4e9, growth: 2.9, pop: 33_200_000, fdi: 1.8e9, inflation: 38.1, fx: 11.0, debt: 84 },
    { year: 2024, gdp: 80.2e9, growth: 4.2, pop: 33_600_000, fdi: 2.1e9, inflation: 23.0, fx: 14.5, debt: 82 },
    { year: 2025, gdp: 83e9, growth: 4.5, pop: 34_000_000, fdi: 2.4e9, inflation: 18.0, fx: 15.0, debt: 80 },
  ]),
  sectors: [
    buildSector({ sector_key: 'mining', sector_label: 'Gold & Mining', icon_emoji: '⛏️', display_order: 1, teaser: 'West Africa gold powerhouse with established operators anchoring export revenues.', strength_score: 88, growth_score: 72, attractiveness_score: 80, narrative_short: 'Ghana is Africa\'s largest gold producer by output with refinery investment expanding value-add potential.', narrative_full: 'Major operators include Newmont and AngloGold Ashanti across Ashanti and Western regions.', key_players: [{ name: 'Newmont', sector: 'Gold Mining', description: 'Ahafo and Akyem operations', metric: 'Major gold producer' }], data_sources: ['Ghana Chamber of Mines'] }, { agoa_opportunity: 'AGOA Export Opportunity: Gold and processed mineral exports qualify for duty-free U.S. entry under AGOA.', agoa_export_current_usd: 420_000_000, agoa_export_potential_usd: 680_000_000 }),
    buildSector({ sector_key: 'agriculture', sector_label: 'Cocoa & Agriculture', icon_emoji: '🌾', display_order: 2, teaser: 'Second-largest global cocoa producer with processing and specialty export potential.', strength_score: 85, growth_score: 68, attractiveness_score: 78, narrative_short: 'Cocoa dominates exports with cashews and shea diversifying the agricultural portfolio.', narrative_full: 'COCOBOD reforms and traceability platforms improve market access for AGOA-eligible products.', key_players: [{ name: 'COCOBOD', sector: 'Cocoa', description: 'National cocoa marketing board', metric: 'Global supply chain' }], data_sources: ['COCOBOD'] }, { agoa_opportunity: 'AGOA Export Opportunity: Cocoa products and processed agriculture enjoy duty-free U.S. entry.', agoa_export_current_usd: 280_000_000, agoa_export_potential_usd: 450_000_000 }),
    buildSector({ sector_key: 'energy', sector_label: 'Oil, Gas & Energy', icon_emoji: '⚡', display_order: 3, teaser: 'Jubilee and TEN fields anchor oil production with renewable solar expanding.', strength_score: 72, growth_score: 65, attractiveness_score: 70, narrative_short: 'Offshore oil and gas-to-power investment diversifies the generation mix.', narrative_full: 'GNPC manages state interests with renewable targets supporting commercial solar.', key_players: [{ name: 'Tullow Oil', sector: 'Oil & Gas', description: 'Jubilee field operator', metric: 'Offshore leader' }], data_sources: ['GNPC'] }, { agoa_opportunity: 'AGOA Export Opportunity: Energy equipment qualifies under AGOA preferential access.', agoa_export_current_usd: 45_000_000, agoa_export_potential_usd: 90_000_000 }),
    buildSector({ sector_key: 'fintech', sector_label: 'Fintech & Digital Finance', icon_emoji: '💳', display_order: 4, teaser: 'Accra fintech cluster with mobile money rails and BoG sandbox innovation.', strength_score: 78, growth_score: 82, attractiveness_score: 80, narrative_short: 'Mobile money penetration exceeds 60% with digital lending and insurtech scaling.', narrative_full: 'Bank of Ghana licensing supports ECOWAS cross-border payment ambitions.', key_players: [{ name: 'MTN Ghana', sector: 'Mobile Money', description: 'MoMo platform operator', metric: 'Leading provider' }], data_sources: ['Bank of Ghana'] }, { agoa_opportunity: 'AGOA Export Opportunity: Fintech and digital services qualify for duty-free U.S. access.', agoa_export_current_usd: 25_000_000, agoa_export_potential_usd: 80_000_000 }),
    buildSector({ sector_key: 'logistics', sector_label: 'Port & Logistics', icon_emoji: '🚢', display_order: 5, teaser: 'Tema port gateway with ECOWAS corridor positioning.', strength_score: 80, growth_score: 70, attractiveness_score: 76, narrative_short: 'Tema port handles bulk cargo and re-exports to landlocked ECOWAS partners.', narrative_full: 'Port expansion and single-window customs improve throughput.', key_players: [{ name: 'GPHA', sector: 'Port', description: 'Ghana Ports and Harbours Authority', metric: 'Tema port operator' }], data_sources: ['GPHA'] }, { agoa_opportunity: 'AGOA Export Opportunity: Tema gateway supports West Africa-U.S. supply chains.', agoa_export_current_usd: 60_000_000, agoa_export_potential_usd: 120_000_000 }),
  ],
  extraForbidden: ['kenya', 'm-pesa'],
};

const ZAF_CONFIG: Wave1CountryConfig = {
  iso3: 'ZAF',
  name: 'South Africa',
  signal: { signal_level: 'stable', growth_score: 62, risk_score: 58, investment_score: 65, confidence_score: 68 },
  profile: {
    signal_level: 'stable',
    economic_momentum: '32',
    investor_readiness: '74',
    summary_md: `South Africa is Africa's most industrialized economy with GDP of approximately $380 billion (2025) and 63 million people. Johannesburg and Cape Town anchor financial services, mining, and manufacturing.`,
    why_now_md: `South Africa is at an energy and industrial inflection point:

- **Energy Transition:** IPP rollout and renewable investment create an **$8B+** corridor as load-shedding impact eases.

- **Automotive & Manufacturing:** OEM assembly and component exports anchor AGOA-eligible manufacturing supply chains.

- **Mining & PGMs:** Platinum group metals support critical minerals diversification for global industrial consumers.

**Investment Window:** South Africa offers a 24-36 month window as energy reliability improves and AGOA export corridors stabilize.`,
    opportunity_thesis_md: `South Africa represents a $380B diversified economy at an energy transition inflection across mining, automotive, renewables, and financial services.`,
    risk_narrative_md: `Rand volatility, coalition governance uncertainty, and grid constraints require mitigation through IPPs, deep capital markets, and established institutional frameworks.`,
  },
  timeSeries: tsRows([
    { year: 2020, gdp: 337e9, growth: -6.3, pop: 59_300_000, fdi: 3.1e9, inflation: 3.3, fx: 16.5, debt: 69 },
    { year: 2021, gdp: 419e9, growth: 4.7, pop: 60_000_000, fdi: 40.8e9, inflation: 4.6, fx: 14.8, debt: 70 },
    { year: 2022, gdp: 405e9, growth: 1.9, pop: 60_600_000, fdi: 9.7e9, inflation: 6.9, fx: 16.4, debt: 72 },
    { year: 2023, gdp: 377e9, growth: 0.6, pop: 61_200_000, fdi: 5.2e9, inflation: 6.0, fx: 18.5, debt: 74 },
    { year: 2024, gdp: 373e9, growth: 0.8, pop: 62_000_000, fdi: 4.8e9, inflation: 5.5, fx: 18.0, debt: 73 },
    { year: 2025, gdp: 380e9, growth: 1.2, pop: 63_000_000, fdi: 5.5e9, inflation: 5.0, fx: 18.2, debt: 72 },
  ]),
  sectors: [
    buildSector({ sector_key: 'mining', sector_label: 'Mining & PGMs', icon_emoji: '⛏️', display_order: 1, teaser: 'Global PGM leader with established mining infrastructure.', strength_score: 92, growth_score: 58, attractiveness_score: 78, narrative_short: 'South Africa holds the world\'s largest PGM reserves with ESG modernization priorities.', narrative_full: 'Anglo American and Sibanye-Stillwater anchor production.', key_players: [{ name: 'Anglo American', sector: 'Mining', description: 'Diversified mining major', metric: 'PGM portfolio' }], data_sources: ['Minerals Council SA'] }, { agoa_opportunity: 'AGOA Export Opportunity: PGMs and processed minerals qualify for duty-free U.S. entry.', agoa_export_current_usd: 1_800_000_000, agoa_export_potential_usd: 2_400_000_000 }),
    buildSector({ sector_key: 'manufacturing', sector_label: 'Automotive & Manufacturing', icon_emoji: '🏭', display_order: 2, teaser: 'OEM assembly hub exporting under AGOA.', strength_score: 85, growth_score: 55, attractiveness_score: 72, narrative_short: 'Automotive assembly and components anchor industrial exports.', narrative_full: 'Eastern Cape and Gauteng host major OEM plants.', key_players: [{ name: 'Toyota SA', sector: 'Automotive', description: 'Durban assembly', metric: 'Major OEM' }], data_sources: ['NAAMSA'] }, { agoa_opportunity: 'AGOA Export Opportunity: Automotive components qualify for duty-free U.S. access.', agoa_export_current_usd: 980_000_000, agoa_export_potential_usd: 1_400_000_000 }),
    buildSector({ sector_key: 'fintech', sector_label: 'Financial Services', icon_emoji: '💳', display_order: 3, teaser: 'Deep capital markets with JSE and banking majors.', strength_score: 88, growth_score: 65, attractiveness_score: 80, narrative_short: 'JSE and established banking provide institutional depth.', narrative_full: 'SARB and FSCA frameworks support fintech innovation.', key_players: [{ name: 'Standard Bank', sector: 'Banking', description: 'Africa\'s largest bank by assets', metric: 'Pan-African' }], data_sources: ['SARB'] }, { agoa_opportunity: 'AGOA Export Opportunity: Financial technology exports qualify under AGOA.', agoa_export_current_usd: 120_000_000, agoa_export_potential_usd: 280_000_000 }),
    buildSector({ sector_key: 'energy', sector_label: 'Energy & Renewables', icon_emoji: '⚡', display_order: 4, teaser: 'Energy transition with IPP rollout reducing load-shedding.', strength_score: 70, growth_score: 78, attractiveness_score: 74, narrative_short: 'Renewable IPPs and self-generation reshape the energy mix.', narrative_full: 'Solar, wind, and battery storage under REIPPPP models.', key_players: [{ name: 'Eskom', sector: 'Utility', description: 'National power utility', metric: 'Grid operator' }], data_sources: ['Eskom'] }, { agoa_opportunity: 'AGOA Export Opportunity: Renewable equipment qualifies under AGOA.', agoa_export_current_usd: 85_000_000, agoa_export_potential_usd: 220_000_000 }),
    buildSector({ sector_key: 'logistics', sector_label: 'Logistics & Trade', icon_emoji: '🚢', display_order: 5, teaser: 'Durban and Cape Town ports anchor SADC trade.', strength_score: 82, growth_score: 60, attractiveness_score: 72, narrative_short: 'Durban is sub-Saharan Africa\'s busiest container port.', narrative_full: 'Transnet networks connect inland mining and manufacturing.', key_players: [{ name: 'Transnet', sector: 'Logistics', description: 'Port and rail operator', metric: 'National backbone' }], data_sources: ['Transnet'] }, { agoa_opportunity: 'AGOA Export Opportunity: Durban gateway supports SADC-U.S. supply chains.', agoa_export_current_usd: 320_000_000, agoa_export_potential_usd: 480_000_000 }),
  ],
};

const ETH_CONFIG: Wave1CountryConfig = {
  iso3: 'ETH',
  name: 'Ethiopia',
  signal: { signal_level: 'high_growth', growth_score: 80, risk_score: 62, investment_score: 68, confidence_score: 65 },
  profile: {
    signal_level: 'high_growth',
    economic_momentum: '45',
    investor_readiness: '58',
    summary_md: `Ethiopia is East Africa's second-largest economy by population with GDP of approximately $156 billion (2025) and 128 million people. Addis Ababa anchors manufacturing EPZs and a large domestic market.`,
    why_now_md: `Ethiopia is at a manufacturing and agriculture inflection point:

- **Textile & EPZ Scale:** Hawassa and Eastern Industrial Zones anchor apparel exports with **$680M+** AGOA restoration potential.

- **Coffee & Agriculture:** Origin of Arabica coffee with specialty export corridors to U.S. and European markets.

- **Infrastructure:** Grand Ethiopian Renaissance Dam and rail connectivity improve industrial load and logistics.

**Investment Window:** Ethiopia offers a 24-36 month window as industrial zones scale and AGOA restoration prospects evolve.`,
    opportunity_thesis_md: `Ethiopia represents a $156B economy at a manufacturing and agriculture inflection across EPZ apparel, coffee, energy, and logistics.`,
    risk_narrative_md: `AGOA suspension, conflict legacy, and forex constraints require careful entry strategy. EPZ operators and agricultural exporters with established compliance frameworks are best positioned.`,
  },
  timeSeries: tsRows([
    { year: 2020, gdp: 96e9, growth: 6.1, pop: 118_000_000, fdi: 2.4e9, inflation: 20.4, fx: 35.0, debt: 55 },
    { year: 2021, gdp: 111e9, growth: 6.3, pop: 120_000_000, fdi: 4.3e9, inflation: 26.8, fx: 45.0, debt: 56 },
    { year: 2022, gdp: 126e9, growth: 6.4, pop: 123_000_000, fdi: 3.7e9, inflation: 33.9, fx: 52.0, debt: 58 },
    { year: 2023, gdp: 156e9, growth: 7.2, pop: 126_000_000, fdi: 3.3e9, inflation: 28.9, fx: 55.0, debt: 60 },
    { year: 2024, gdp: 152e9, growth: 6.5, pop: 127_000_000, fdi: 3.5e9, inflation: 23.0, fx: 57.0, debt: 62 },
    { year: 2025, gdp: 156e9, growth: 6.8, pop: 128_000_000, fdi: 3.8e9, inflation: 20.0, fx: 58.0, debt: 63 },
  ]),
  sectors: [
    buildSector({ sector_key: 'agriculture', sector_label: 'Coffee & Agriculture', icon_emoji: '🌾', display_order: 1, teaser: 'Origin of Arabica coffee with specialty export corridors.', strength_score: 82, growth_score: 72, attractiveness_score: 74, narrative_short: 'Coffee, sesame, and pulses anchor agricultural exports.', narrative_full: 'Ethiopian Commodity Exchange improves market transparency.', key_players: [{ name: 'ECX', sector: 'Commodity Exchange', description: 'Ethiopian Commodity Exchange', metric: 'Market platform' }], data_sources: ['ECX'] }, { agoa_opportunity: 'AGOA Export Opportunity: Coffee and specialty agriculture would qualify upon AGOA restoration.', agoa_export_current_usd: 0, agoa_export_potential_usd: 280_000_000 }),
    buildSector({ sector_key: 'manufacturing', sector_label: 'Textiles & EPZ', icon_emoji: '🏭', display_order: 2, teaser: 'Hawassa Industrial Park anchors apparel exports.', strength_score: 78, growth_score: 80, attractiveness_score: 72, narrative_short: 'EPZ apparel operations target U.S. and European markets.', narrative_full: 'Industrial park infrastructure supports scale manufacturing.', key_players: [{ name: 'HIP', sector: 'Industrial Park', description: 'Hawassa Industrial Park', metric: 'EPZ apparel hub' }], data_sources: ['EIC'] }, { agoa_opportunity: 'AGOA Export Opportunity: Apparel exports would qualify upon AGOA restoration — $400M+ potential.', agoa_export_current_usd: 0, agoa_export_potential_usd: 400_000_000 }),
    buildSector({ sector_key: 'energy', sector_label: 'Energy & Hydropower', icon_emoji: '⚡', display_order: 3, teaser: 'GERD and renewable expansion support industrial load growth.', strength_score: 75, growth_score: 70, attractiveness_score: 68, narrative_short: 'Hydropower dominates generation with solar and wind expanding.', narrative_full: 'Grand Ethiopian Renaissance Dam adds baseload capacity.', key_players: [{ name: 'EEPCo', sector: 'Utility', description: 'Ethiopian Electric Power', metric: 'National generator' }], data_sources: ['EEPCo'] }, { agoa_opportunity: 'AGOA Export Opportunity: Energy equipment imports support industrial zone expansion.', agoa_export_current_usd: 15_000_000, agoa_export_potential_usd: 60_000_000 }),
    buildSector({ sector_key: 'logistics', sector_label: 'Logistics & Trade', icon_emoji: '🚢', display_order: 4, teaser: 'Djibouti corridor and rail connectivity anchor trade flows.', strength_score: 68, growth_score: 65, attractiveness_score: 62, narrative_short: 'Ethio-Djibouti railway reduces transit times for imports and exports.', narrative_full: 'Dry port development in Modjo and Semera supports inland logistics.', key_players: [{ name: 'Ethiopian Railways', sector: 'Rail', description: 'National rail operator', metric: 'Djibouti corridor' }], data_sources: ['ERC'] }, { agoa_opportunity: 'AGOA Export Opportunity: Logistics services support EPZ-to-U.S. supply chains upon restoration.', agoa_export_current_usd: 0, agoa_export_potential_usd: 45_000_000 }),
    buildSector({ sector_key: 'mining', sector_label: 'Mining & Potash', icon_emoji: '⛏️', display_order: 5, teaser: 'Potash and gold exploration attracting strategic interest.', strength_score: 55, growth_score: 68, attractiveness_score: 58, narrative_short: 'Danakil potash and gold deposits under development.', narrative_full: 'Mining code reforms balance extraction with community engagement.', key_players: [{ name: 'MMP', sector: 'Potash', description: 'Danakil potash project', metric: 'Strategic minerals' }], data_sources: ['Ministry of Mines'] }, { agoa_opportunity: 'AGOA Export Opportunity: Processed minerals would qualify upon restoration.', agoa_export_current_usd: 0, agoa_export_potential_usd: 80_000_000 }),
  ],
  extraForbidden: ['agoa eligible', 'duty-free u.s. market access for qualifying'],
};

const SEN_CONFIG: Wave1CountryConfig = {
  iso3: 'SEN',
  name: 'Senegal',
  signal: { signal_level: 'emerging', growth_score: 76, risk_score: 42, investment_score: 72, confidence_score: 74 },
  profile: {
    signal_level: 'emerging',
    economic_momentum: '40',
    investor_readiness: '70',
    summary_md: `Senegal is West Africa's stable democracy with GDP of approximately $31 billion (2025) and 18 million people. Dakar anchors phosphate mining, fisheries, and emerging Diamniadio industrial investment.`,
    why_now_md: `Senegal is at a West Africa stability inflection point:

- **Phosphate & Mining:** Taiba and Matam phosphate operations anchor export revenues with **$280M+** AGOA potential.

- **Energy & Gas:** Sangomar offshore oil and gas-to-power investment diversify the energy mix.

- **Diamniadio Industrial Zone:** Manufacturing and logistics hub attracting automotive and agro-processing investment.

**Investment Window:** Senegal offers a 24-36 month window as energy production scales and industrial zone occupancy rises.`,
    opportunity_thesis_md: `Senegal represents a $31B stable West African economy across phosphate mining, fisheries, energy, and industrial zone manufacturing.`,
    risk_narrative_md: `Macro risks are moderate with CFA franc peg providing currency stability. Political stability and IMF program oversight support investor confidence.`,
  },
  timeSeries: tsRows([
    { year: 2020, gdp: 24.3e9, growth: 1.5, pop: 16_700_000, fdi: 1.5e9, inflation: 2.5, fx: 585, debt: 62 },
    { year: 2021, gdp: 27.6e9, growth: 6.1, pop: 17_200_000, fdi: 2.1e9, inflation: 2.2, fx: 585, debt: 63 },
    { year: 2022, gdp: 28.0e9, growth: 4.7, pop: 17_600_000, fdi: 2.4e9, inflation: 9.7, fx: 620, debt: 65 },
    { year: 2023, gdp: 28.8e9, growth: 4.3, pop: 17_800_000, fdi: 2.6e9, inflation: 5.9, fx: 610, debt: 66 },
    { year: 2024, gdp: 30.0e9, growth: 5.0, pop: 17_900_000, fdi: 2.8e9, inflation: 4.5, fx: 605, debt: 65 },
    { year: 2025, gdp: 31.0e9, growth: 5.5, pop: 18_000_000, fdi: 3.0e9, inflation: 4.0, fx: 600, debt: 64 },
  ]),
  sectors: [
    buildSector({ sector_key: 'mining', sector_label: 'Phosphate & Mining', icon_emoji: '⛏️', display_order: 1, teaser: 'Major phosphate producer with Taiba and Matam operations.', strength_score: 82, growth_score: 70, attractiveness_score: 76, narrative_short: 'Phosphate exports anchor mining sector revenues.', narrative_full: 'ICS and state partnerships manage phosphate extraction and processing.', key_players: [{ name: 'ICS', sector: 'Phosphate', description: 'Industries Chimiques du Sénégal', metric: 'Major phosphate producer' }], data_sources: ['Ministry of Mines'] }, { agoa_opportunity: 'AGOA Export Opportunity: Phosphate derivatives qualify for duty-free U.S. entry.', agoa_export_current_usd: 45_000_000, agoa_export_potential_usd: 90_000_000 }),
    buildSector({ sector_key: 'agriculture', sector_label: 'Fisheries & Agriculture', icon_emoji: '🌾', display_order: 2, teaser: 'Groundnuts, fisheries, and horticulture exports.', strength_score: 75, growth_score: 68, attractiveness_score: 72, narrative_short: 'Fisheries and groundnuts anchor agricultural exports.', narrative_full: 'Dakar port supports fresh fish and processed seafood exports.', key_players: [{ name: 'SONADEP', sector: 'Groundnuts', description: 'National groundnut company', metric: 'Export processor' }], data_sources: ['ANSD'] }, { agoa_opportunity: 'AGOA Export Opportunity: Fisheries and groundnut products enjoy duty-free U.S. access.', agoa_export_current_usd: 35_000_000, agoa_export_potential_usd: 70_000_000 }),
    buildSector({ sector_key: 'energy', sector_label: 'Oil, Gas & Energy', icon_emoji: '⚡', display_order: 3, teaser: 'Sangomar offshore oil and gas-to-power investment.', strength_score: 72, growth_score: 75, attractiveness_score: 74, narrative_short: 'Offshore oil production and solar IPP investment expand capacity.', narrative_full: 'SENELEC manages grid with renewable targets supporting solar adoption.', key_players: [{ name: 'Woodside', sector: 'Oil & Gas', description: 'Sangomar field operator', metric: 'Offshore production' }], data_sources: ['Petrosen'] }, { agoa_opportunity: 'AGOA Export Opportunity: Energy equipment qualifies under AGOA.', agoa_export_current_usd: 20_000_000, agoa_export_potential_usd: 50_000_000 }),
    buildSector({ sector_key: 'fintech', sector_label: 'Fintech & Digital Finance', icon_emoji: '💳', display_order: 4, teaser: 'Dakar fintech cluster with mobile money and BCEAO integration.', strength_score: 70, growth_score: 78, attractiveness_score: 74, narrative_short: 'Mobile money adoption growing with Orange Money and Wave leading.', narrative_full: 'BCEAO UEMOA integration supports cross-border payments.', key_players: [{ name: 'Orange Money', sector: 'Mobile Money', description: 'Mobile financial services', metric: 'Regional platform' }], data_sources: ['BCEAO'] }, { agoa_opportunity: 'AGOA Export Opportunity: Fintech services qualify for duty-free U.S. access.', agoa_export_current_usd: 8_000_000, agoa_export_potential_usd: 30_000_000 }),
    buildSector({ sector_key: 'logistics', sector_label: 'Port & Logistics', icon_emoji: '🚢', display_order: 5, teaser: 'Dakar port gateway with UEMOA and ECOWAS corridor access.', strength_score: 78, growth_score: 72, attractiveness_score: 76, narrative_short: 'Dakar port handles bulk, container, and re-export cargo.', narrative_full: 'Diamniadio logistics zone supports industrial supply chains.', key_players: [{ name: 'PAD', sector: 'Port', description: 'Port Autonome de Dakar', metric: 'West Africa gateway' }], data_sources: ['PAD'] }, { agoa_opportunity: 'AGOA Export Opportunity: Dakar gateway supports West Africa-U.S. supply chains.', agoa_export_current_usd: 25_000_000, agoa_export_potential_usd: 55_000_000 }),
  ],
};

const CIV_CONFIG: Wave1CountryConfig = {
  iso3: 'CIV',
  name: "Côte d'Ivoire",
  signal: { signal_level: 'high_growth', growth_score: 78, risk_score: 46, investment_score: 74, confidence_score: 76 },
  profile: {
    signal_level: 'high_growth',
    economic_momentum: '44',
    investor_readiness: '72',
    summary_md: `Côte d'Ivoire is West Africa's fastest-growing major economy with GDP of approximately $87 billion (2025) and 29 million people. Abidjan anchors cocoa processing, port logistics, and regional trade.`,
    why_now_md: `Côte d'Ivoire is at a West Africa growth inflection point:

- **Cocoa Processing:** World's largest cocoa producer with value-add processing investment creating **$980M+** AGOA potential.

- **Port & Logistics:** Abidjan port expansion supports ECOWAS and landlocked Sahel re-export corridors.

- **Energy & Mining:** Offshore gas and gold mining diversify export revenues beyond agriculture.

**Investment Window:** Côte d'Ivoire offers a 24-36 month window as cocoa processing scales and port capacity expands.`,
    opportunity_thesis_md: `Côte d'Ivoire represents an $87B West African growth economy across cocoa, mining, energy, and Abidjan port logistics.`,
    risk_narrative_md: `Political stability has improved post-2020 transition. CFA franc peg provides currency anchor. Infrastructure investment in Abidjan corridor reduces operational friction.`,
  },
  timeSeries: tsRows([
    { year: 2020, gdp: 61.4e9, growth: 1.8, pop: 26_400_000, fdi: 0.9e9, inflation: 2.4, fx: 585, debt: 48 },
    { year: 2021, gdp: 70.0e9, growth: 7.0, pop: 27_000_000, fdi: 1.2e9, inflation: 4.2, fx: 585, debt: 49 },
    { year: 2022, gdp: 70.0e9, growth: 6.7, pop: 27_500_000, fdi: 1.4e9, inflation: 5.3, fx: 620, debt: 52 },
    { year: 2023, gdp: 79.0e9, growth: 6.5, pop: 28_000_000, fdi: 1.6e9, inflation: 4.0, fx: 610, debt: 54 },
    { year: 2024, gdp: 84.0e9, growth: 6.8, pop: 28_500_000, fdi: 1.8e9, inflation: 3.5, fx: 605, debt: 55 },
    { year: 2025, gdp: 87.0e9, growth: 7.0, pop: 29_000_000, fdi: 2.0e9, inflation: 3.2, fx: 600, debt: 54 },
  ]),
  sectors: [
    buildSector({ sector_key: 'agriculture', sector_label: 'Cocoa & Agriculture', icon_emoji: '🌾', display_order: 1, teaser: 'World\'s largest cocoa producer with processing investment scaling.', strength_score: 92, growth_score: 75, attractiveness_score: 85, narrative_short: 'Cocoa, cashews, and rubber anchor agricultural exports.', narrative_full: 'CCC reforms and traceability improve AGOA-eligible export consistency.', key_players: [{ name: 'CCC', sector: 'Cocoa', description: 'Conseil du Café-Cacao', metric: 'Global cocoa leader' }], data_sources: ['CCC'] }, { agoa_opportunity: 'AGOA Export Opportunity: Cocoa derivatives and cashews enjoy duty-free U.S. entry.', agoa_export_current_usd: 380_000_000, agoa_export_potential_usd: 620_000_000 }),
    buildSector({ sector_key: 'mining', sector_label: 'Gold & Mining', icon_emoji: '⛏️', display_order: 2, teaser: 'Gold and manganese operations expanding export revenues.', strength_score: 78, growth_score: 72, attractiveness_score: 74, narrative_short: 'Gold mining in Tongon and Bonikro supports sector growth.', narrative_full: 'Mining code reforms balance revenue and community engagement.', key_players: [{ name: 'Endeavour Mining', sector: 'Gold', description: 'Tongon gold operation', metric: 'Major gold producer' }], data_sources: ['Ministry of Mines'] }, { agoa_opportunity: 'AGOA Export Opportunity: Gold and processed minerals qualify under AGOA.', agoa_export_current_usd: 120_000_000, agoa_export_potential_usd: 200_000_000 }),
    buildSector({ sector_key: 'energy', sector_label: 'Energy & Gas', icon_emoji: '⚡', display_order: 3, teaser: 'Offshore gas and hydro expansion support industrial load.', strength_score: 74, growth_score: 70, attractiveness_score: 72, narrative_short: 'Gas-to-power and hydro generation diversify the energy mix.', narrative_full: 'CI-Energies manages grid with solar IPP investment growing.', key_players: [{ name: 'CI-Energies', sector: 'Utility', description: 'National energy company', metric: 'Grid operator' }], data_sources: ['CI-Energies'] }, { agoa_opportunity: 'AGOA Export Opportunity: Energy equipment qualifies under AGOA.', agoa_export_current_usd: 30_000_000, agoa_export_potential_usd: 65_000_000 }),
    buildSector({ sector_key: 'manufacturing', sector_label: 'Manufacturing & Processing', icon_emoji: '🏭', display_order: 4, teaser: 'Cocoa processing and agro-industrial investment in Abidjan zone.', strength_score: 76, growth_score: 78, attractiveness_score: 76, narrative_short: 'Food processing and light manufacturing expand in industrial zones.', narrative_full: 'Abidjan industrial zone supports export-oriented manufacturing.', key_players: [{ name: 'Cargill', sector: 'Cocoa Processing', description: 'Abidjan cocoa processing', metric: 'Global processor' }], data_sources: ['Ministry of Industry'] }, { agoa_opportunity: 'AGOA Export Opportunity: Processed cocoa and manufactured goods qualify under AGOA.', agoa_export_current_usd: 55_000_000, agoa_export_potential_usd: 120_000_000 }),
    buildSector({ sector_key: 'logistics', sector_label: 'Port & Logistics', icon_emoji: '🚢', display_order: 5, teaser: 'Abidjan port — West Africa\'s largest container hub.', strength_score: 88, growth_score: 74, attractiveness_score: 82, narrative_short: 'Abidjan handles bulk, container, and Sahel re-export cargo.', narrative_full: 'Port expansion and Vridi terminal upgrades improve throughput.', key_players: [{ name: 'PAA', sector: 'Port', description: 'Port Autonome d\'Abidjan', metric: 'West Africa hub' }], data_sources: ['PAA'] }, { agoa_opportunity: 'AGOA Export Opportunity: Abidjan gateway supports West Africa-U.S. supply chains.', agoa_export_current_usd: 80_000_000, agoa_export_potential_usd: 150_000_000 }),
  ],
};

const TZA_CONFIG: Wave1CountryConfig = {
  iso3: 'TZA',
  name: 'Tanzania',
  signal: { signal_level: 'emerging', growth_score: 75, risk_score: 50, investment_score: 71, confidence_score: 73 },
  profile: {
    signal_level: 'emerging',
    economic_momentum: '41',
    investor_readiness: '69',
    summary_md: `Tanzania is East Africa's second-largest economy by land area with GDP of approximately $86 billion (2025) and 67 million people. Dar es Salaam anchors gold mining, agriculture, and EPZ apparel exports.`,
    why_now_md: `Tanzania is at an East Africa resource and manufacturing inflection point:

- **Gold & Mining:** Geita and Bulyanhulu operations anchor export revenues with **$520M+** AGOA potential.

- **EPZ Apparel:** Export Processing Zones target U.S. markets under AGOA duty-free access.

- **Port & Logistics:** Dar es Salaam port upgrades support landlocked EAC partner re-exports.

**Investment Window:** Tanzania offers a 24-36 month window as EPZ occupancy rises and port throughput expands.`,
    opportunity_thesis_md: `Tanzania represents an $86B East African economy across gold mining, EPZ apparel, agriculture, and Dar es Salaam port logistics.`,
    risk_narrative_md: `Regulatory evolution and infrastructure gaps outside Dar es Salaam require phased entry. AGOA eligibility and EAC integration provide market access mitigants.`,
  },
  timeSeries: tsRows([
    { year: 2020, gdp: 64.4e9, growth: 2.0, pop: 61_000_000, fdi: 1.0e9, inflation: 3.3, fx: 2300, debt: 40 },
    { year: 2021, gdp: 67.8e9, growth: 4.9, pop: 62_000_000, fdi: 1.2e9, inflation: 3.7, fx: 2300, debt: 41 },
    { year: 2022, gdp: 75.7e9, growth: 4.7, pop: 63_500_000, fdi: 1.4e9, inflation: 4.3, fx: 2350, debt: 42 },
    { year: 2023, gdp: 79.0e9, growth: 5.1, pop: 65_000_000, fdi: 1.5e9, inflation: 3.8, fx: 2500, debt: 43 },
    { year: 2024, gdp: 83.0e9, growth: 5.4, pop: 66_000_000, fdi: 1.6e9, inflation: 3.5, fx: 2550, debt: 44 },
    { year: 2025, gdp: 86.0e9, growth: 5.8, pop: 67_000_000, fdi: 1.8e9, inflation: 3.2, fx: 2600, debt: 44 },
  ]),
  sectors: [
    buildSector({ sector_key: 'mining', sector_label: 'Gold & Mining', icon_emoji: '⛏️', display_order: 1, teaser: 'Major gold producer with Geita and Bulyanhulu operations.', strength_score: 85, growth_score: 70, attractiveness_score: 78, narrative_short: 'Gold dominates mining exports with nickel and graphite emerging.', narrative_full: 'Barrick and AngloGold Ashanti anchor production.', key_players: [{ name: 'Barrick', sector: 'Gold Mining', description: 'Bulyanhulu and North Mara', metric: 'Major gold producer' }], data_sources: ['Ministry of Minerals'] }, { agoa_opportunity: 'AGOA Export Opportunity: Gold and processed minerals qualify for duty-free U.S. entry.', agoa_export_current_usd: 180_000_000, agoa_export_potential_usd: 280_000_000 }),
    buildSector({ sector_key: 'agriculture', sector_label: 'Agriculture & Horticulture', icon_emoji: '🌾', display_order: 2, teaser: 'Cashews, coffee, and horticulture exports under AGOA.', strength_score: 80, growth_score: 68, attractiveness_score: 74, narrative_short: 'Cashews and coffee anchor agricultural exports.', narrative_full: 'Tanzania Coffee Board and cashew processing investment improve value-add.', key_players: [{ name: 'TCB', sector: 'Coffee', description: 'Tanzania Coffee Board', metric: 'Export regulator' }], data_sources: ['NBS Tanzania'] }, { agoa_opportunity: 'AGOA Export Opportunity: Cashews, coffee, and horticulture enjoy duty-free U.S. access.', agoa_export_current_usd: 65_000_000, agoa_export_potential_usd: 120_000_000 }),
    buildSector({ sector_key: 'manufacturing', sector_label: 'Apparel & EPZ', icon_emoji: '🏭', display_order: 3, teaser: 'EPZ apparel operations targeting U.S. markets under AGOA.', strength_score: 72, growth_score: 78, attractiveness_score: 76, narrative_short: 'Export Processing Zones support apparel and textile exports.', narrative_full: 'Benjamin Mkapa EPZ and other zones offer AGOA-eligible manufacturing.', key_players: [{ name: 'EPZA', sector: 'EPZ', description: 'Export Processing Zones Authority', metric: 'EPZ regulator' }], data_sources: ['EPZA'] }, { agoa_opportunity: 'AGOA Export Opportunity: EPZ apparel exports qualify for duty-free U.S. market access.', agoa_export_current_usd: 95_000_000, agoa_export_potential_usd: 180_000_000 }),
    buildSector({ sector_key: 'energy', sector_label: 'Energy & Gas', icon_emoji: '⚡', display_order: 4, teaser: 'Offshore gas and renewable solar expanding generation capacity.', strength_score: 70, growth_score: 72, attractiveness_score: 70, narrative_short: 'LNG pipeline and solar IPP investment diversify the energy mix.', narrative_full: 'TANESCO manages grid with gas-to-power projects advancing.', key_players: [{ name: 'TANESCO', sector: 'Utility', description: 'Tanzania Electric Supply Company', metric: 'Grid operator' }], data_sources: ['TANESCO'] }, { agoa_opportunity: 'AGOA Export Opportunity: Energy equipment qualifies under AGOA.', agoa_export_current_usd: 20_000_000, agoa_export_potential_usd: 55_000_000 }),
    buildSector({ sector_key: 'logistics', sector_label: 'Port & Tourism', icon_emoji: '🚢', display_order: 5, teaser: 'Dar es Salaam port and Zanzibar tourism anchor trade and services.', strength_score: 78, growth_score: 72, attractiveness_score: 76, narrative_short: 'Dar es Salaam port handles EAC re-exports and bulk cargo.', narrative_full: 'Port modernization supports landlocked partner trade flows.', key_players: [{ name: 'TPA', sector: 'Port', description: 'Tanzania Ports Authority', metric: 'Dar es Salaam operator' }], data_sources: ['TPA'] }, { agoa_opportunity: 'AGOA Export Opportunity: Dar es Salaam gateway supports East Africa-U.S. supply chains.', agoa_export_current_usd: 40_000_000, agoa_export_potential_usd: 85_000_000 }),
  ],
  extraForbidden: ['m-pesa', 'mombasa'],
};

export const WAVE1_COUNTRY_CONFIGS: Record<Wave1AfricaIso3, Wave1CountryConfig> = {
  GHA: GHA_CONFIG,
  ZAF: ZAF_CONFIG,
  ETH: ETH_CONFIG,
  SEN: SEN_CONFIG,
  CIV: CIV_CONFIG,
  TZA: TZA_CONFIG,
};

export const WAVE1_CONFIG_LIST = Object.values(WAVE1_COUNTRY_CONFIGS);
