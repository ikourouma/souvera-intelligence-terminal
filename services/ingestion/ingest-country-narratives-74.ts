/**
 * =====================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * 74-Market Country Narratives Ingestion
 * Owner: Afronovation, Inc.
 * Phase 0E.4: Full 74-Market Narrative Coverage
 * =====================================================
 *
 * Generates T2 narrative profiles for ALL 74 Souvera markets:
 * - summary_md: Executive overview
 * - why_now_md: Investment timing thesis
 * - opportunity_thesis_md: Opportunity corridors
 * - risk_narrative_md: Key risks (unvarnished)
 * - signal_level: 'emerging' | 'high_growth' | 'stable'
 * - economic_momentum: 'improving' | 'stable' | 'declining'
 * - investor_readiness: 'high' | 'moderate' | 'low'
 *
 * Run:
 *   npx tsx --tsconfig services/ingestion/tsconfig.json \
 *     services/ingestion/run.ts ingest-country-narratives-74
 */

import { getSupabaseServiceClient } from '@souvera/config';
import { closeIngestionJob, createIngestionJob } from './shared';

type SignalLevel = 'emerging' | 'high_growth' | 'stable';
type EconomicMomentum = 'improving' | 'stable' | 'declining';
type InvestorReadiness = 'high' | 'moderate' | 'low';

interface CountryNarrative {
  iso3: string;
  name: string;
  summaryMd: string;
  whyNowMd: string;
  opportunityThesisMd: string;
  riskNarrativeMd: string;
  signalLevel: SignalLevel;
  economicMomentum: EconomicMomentum;
  investorReadiness: InvestorReadiness;
}

// Markets already covered in seed-rollout-t2-profiles.sql
const EXISTING_TIER_A = new Set([
  'NGA', 'KEN', 'JAM', 'GHA', 'ZAF', 'ETH', 'SEN', 'CIV', 'TZA', 'TTO', 'BRB', 'BHS'
]);

// Regional/structural context for narrative generation
const REGIONAL_CONTEXT: Record<string, {
  primarySectors: string[];
  tradePref: string;
  investmentTheme: string;
  commonRisks: string[];
}> = {
  'Northern Africa': {
    primarySectors: ['Energy', 'Textiles', 'Agriculture', 'Tourism'],
    tradePref: 'EU Association, US TIFA, regional FTAs',
    investmentTheme: 'Gateway between Europe and Sub-Saharan Africa, energy transition opportunities',
    commonRisks: ['Political transition risks', 'FX volatility', 'Water scarcity'],
  },
  'Western Africa': {
    primarySectors: ['Agriculture', 'Mining', 'Energy', 'Fintech'],
    tradePref: 'AGOA eligibility, ECOWAS integration, AfCFTA',
    investmentTheme: 'Consumer market growth, agricultural value chains, regional hub development',
    commonRisks: ['Political instability', 'Infrastructure gaps', 'Sahel security corridor'],
  },
  'Eastern Africa': {
    primarySectors: ['Agriculture', 'Services', 'Tourism', 'Manufacturing'],
    tradePref: 'AGOA eligibility, EAC integration, AfCFTA',
    investmentTheme: 'Services hub (Kenya), agricultural processing, tourism expansion',
    commonRisks: ['Drought vulnerability', 'Regional conflicts', 'Debt sustainability'],
  },
  'Central Africa': {
    primarySectors: ['Oil & Gas', 'Mining', 'Timber', 'Agriculture'],
    tradePref: 'AGOA eligibility, CEMAC integration, AfCFTA',
    investmentTheme: 'Critical minerals, oil diversification, Congo Basin resources',
    commonRisks: ['Governance challenges', 'Infrastructure deficits', 'Resource dependency'],
  },
  'Southern Africa': {
    primarySectors: ['Mining', 'Manufacturing', 'Agriculture', 'Finance'],
    tradePref: 'AGOA eligibility, SADC integration, AfCFTA',
    investmentTheme: 'Regional manufacturing hub, minerals value chains, services platform',
    commonRisks: ['Electricity constraints', 'Regional economic interdependence', 'Climate impacts'],
  },
  'Caribbean': {
    primarySectors: ['Tourism', 'Financial Services', 'BPO', 'Agriculture'],
    tradePref: 'CBI, CARICOM, CPTPA for applicable markets',
    investmentTheme: 'Nearshore services, tourism infrastructure, blue economy',
    commonRisks: ['Hurricane exposure', 'Small market scale', 'US economic dependence'],
  },
};

function getRegion(iso3: string): string {
  const northAfrica = ['MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN'];
  const westAfrica = ['NGA', 'GHA', 'SEN', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR', 'CIV', 'TGO', 'BEN', 'GMB', 'GNB', 'CPV', 'MRT'];
  const eastAfrica = ['ETH', 'KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SOM', 'DJI', 'ERI', 'MDG', 'COM', 'MUS', 'SYC', 'SSD'];
  const centralAfrica = ['CMR', 'CAF', 'COD', 'COG', 'GAB', 'GNQ', 'STP', 'TCD', 'AGO'];
  const southernAfrica = ['ZAF', 'BWA', 'LSO', 'SWZ', 'NAM', 'ZWE', 'MOZ', 'ZMB', 'MWI'];
  
  if (northAfrica.includes(iso3)) return 'Northern Africa';
  if (westAfrica.includes(iso3)) return 'Western Africa';
  if (eastAfrica.includes(iso3)) return 'Eastern Africa';
  if (centralAfrica.includes(iso3)) return 'Central Africa';
  if (southernAfrica.includes(iso3)) return 'Southern Africa';
  return 'Caribbean';
}

// Country-specific data for narrative generation
const MARKET_DATA: Record<string, {
  name: string;
  gdpB: number;
  pop: string;
  keyExports: string[];
  signalLevel: SignalLevel;
  economicMomentum: EconomicMomentum;
  investorReadiness: InvestorReadiness;
  uniqueContext?: string;
}> = {
  // North Africa
  EGY: { name: 'Egypt', gdpB: 400, pop: '110M', keyExports: ['Petroleum', 'Textiles', 'Chemicals', 'Agriculture'], signalLevel: 'emerging', economicMomentum: 'improving', investorReadiness: 'moderate', uniqueContext: 'Suez Canal strategic position, largest Arab economy, QIZ US trade benefits' },
  MAR: { name: 'Morocco', gdpB: 140, pop: '37M', keyExports: ['Automotive', 'Phosphates', 'Agriculture', 'Textiles'], signalLevel: 'high_growth', economicMomentum: 'improving', investorReadiness: 'high', uniqueContext: 'US FTA in force since 2006, automotive manufacturing hub, renewable energy leader' },
  DZA: { name: 'Algeria', gdpB: 190, pop: '45M', keyExports: ['Oil & Gas', 'Phosphates'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'Major European gas supplier, economic diversification efforts' },
  TUN: { name: 'Tunisia', gdpB: 48, pop: '12M', keyExports: ['Textiles', 'Electronics', 'Phosphates', 'Olive Oil'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'moderate', uniqueContext: 'EU association agreement, proximity to European markets, skilled workforce' },
  LBY: { name: 'Libya', gdpB: 45, pop: '7M', keyExports: ['Oil & Gas'], signalLevel: 'emerging', economicMomentum: 'declining', investorReadiness: 'low', uniqueContext: 'Africa largest proven oil reserves, post-conflict reconstruction phase' },
  SDN: { name: 'Sudan', gdpB: 35, pop: '48M', keyExports: ['Gold', 'Oil', 'Agriculture'], signalLevel: 'emerging', economicMomentum: 'declining', investorReadiness: 'low', uniqueContext: 'Significant agricultural potential, conflict-affected since 2023' },
  
  // West Africa (additional markets)
  MLI: { name: 'Mali', gdpB: 18, pop: '22M', keyExports: ['Gold', 'Cotton', 'Livestock'], signalLevel: 'emerging', economicMomentum: 'declining', investorReadiness: 'low', uniqueContext: 'Third largest gold producer in Africa, AGOA suspended' },
  BFA: { name: 'Burkina Faso', gdpB: 19, pop: '22M', keyExports: ['Gold', 'Cotton', 'Livestock'], signalLevel: 'emerging', economicMomentum: 'declining', investorReadiness: 'low', uniqueContext: 'Fourth largest gold producer in Africa, AGOA suspended' },
  NER: { name: 'Niger', gdpB: 15, pop: '26M', keyExports: ['Uranium', 'Gold', 'Agriculture'], signalLevel: 'emerging', economicMomentum: 'declining', investorReadiness: 'low', uniqueContext: 'Major uranium producer, AGOA suspended' },
  GIN: { name: 'Guinea', gdpB: 16, pop: '14M', keyExports: ['Bauxite', 'Gold', 'Agriculture'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'World largest bauxite reserves, AGOA suspended' },
  SLE: { name: 'Sierra Leone', gdpB: 4, pop: '8M', keyExports: ['Diamonds', 'Iron Ore', 'Agriculture'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'Post-conflict reconstruction, mining sector development' },
  LBR: { name: 'Liberia', gdpB: 4, pop: '5M', keyExports: ['Iron Ore', 'Rubber', 'Timber'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'Maritime registry revenue, post-conflict growth' },
  TGO: { name: 'Togo', gdpB: 8, pop: '9M', keyExports: ['Phosphates', 'Cotton', 'Coffee'], signalLevel: 'emerging', economicMomentum: 'improving', investorReadiness: 'moderate', uniqueContext: 'Regional port hub (Lomé), phosphate reserves' },
  BEN: { name: 'Benin', gdpB: 18, pop: '13M', keyExports: ['Cotton', 'Cashews', 'Agriculture'], signalLevel: 'emerging', economicMomentum: 'improving', investorReadiness: 'moderate', uniqueContext: 'Cotton production leader, regional trade corridor to Nigeria' },
  GMB: { name: 'Gambia', gdpB: 2, pop: '2.5M', keyExports: ['Groundnuts', 'Tourism', 'Fish'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'Tourism-dependent, post-2017 democratic transition' },
  GNB: { name: 'Guinea-Bissau', gdpB: 2, pop: '2M', keyExports: ['Cashews', 'Fish'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'World leading cashew exporter by share of GDP' },
  CPV: { name: 'Cabo Verde', gdpB: 2, pop: '0.6M', keyExports: ['Tourism', 'Fish', 'Clothing'], signalLevel: 'stable', economicMomentum: 'improving', investorReadiness: 'moderate', uniqueContext: 'Atlantic hub, high human development index for Africa' },
  MRT: { name: 'Mauritania', gdpB: 9, pop: '5M', keyExports: ['Iron Ore', 'Fish', 'Gold'], signalLevel: 'emerging', economicMomentum: 'improving', investorReadiness: 'low', uniqueContext: 'Gas discoveries, iron ore production, Sahel stability relative to neighbors' },
  
  // East Africa (additional markets)
  UGA: { name: 'Uganda', gdpB: 45, pop: '48M', keyExports: ['Coffee', 'Gold', 'Fish'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'moderate', uniqueContext: 'Coffee production leader, AGOA suspended, oil production starting' },
  RWA: { name: 'Rwanda', gdpB: 13, pop: '14M', keyExports: ['Coffee', 'Tea', 'Minerals'], signalLevel: 'high_growth', economicMomentum: 'improving', investorReadiness: 'high', uniqueContext: 'Governance model, ICT hub ambitions, Kigali Convention Bureau' },
  BDI: { name: 'Burundi', gdpB: 3, pop: '13M', keyExports: ['Coffee', 'Tea', 'Gold'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'Landlocked, coffee-dependent, regional integration benefits' },
  SOM: { name: 'Somalia', gdpB: 8, pop: '18M', keyExports: ['Livestock', 'Fish', 'Remittances'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'Diaspora remittances, livestock trade hub for Gulf markets' },
  DJI: { name: 'Djibouti', gdpB: 4, pop: '1M', keyExports: ['Services', 'Re-exports'], signalLevel: 'stable', economicMomentum: 'stable', investorReadiness: 'moderate', uniqueContext: 'Strategic Horn of Africa port, Ethiopia trade gateway' },
  ERI: { name: 'Eritrea', gdpB: 2, pop: '3.5M', keyExports: ['Mining', 'Agriculture'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'Mining potential, limited international engagement' },
  MDG: { name: 'Madagascar', gdpB: 15, pop: '30M', keyExports: ['Vanilla', 'Textiles', 'Mining'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'moderate', uniqueContext: 'World largest vanilla producer, biodiversity assets, AGOA apparel' },
  COM: { name: 'Comoros', gdpB: 1, pop: '0.9M', keyExports: ['Vanilla', 'Cloves', 'Ylang-ylang'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'Island economy, aromatic exports, diaspora remittances' },
  MUS: { name: 'Mauritius', gdpB: 14, pop: '1.3M', keyExports: ['Textiles', 'Tourism', 'Financial Services'], signalLevel: 'high_growth', economicMomentum: 'improving', investorReadiness: 'high', uniqueContext: 'Financial services hub, investment treaty network, high HDI' },
  SYC: { name: 'Seychelles', gdpB: 2, pop: '0.1M', keyExports: ['Tourism', 'Fish', 'Financial Services'], signalLevel: 'stable', economicMomentum: 'improving', investorReadiness: 'moderate', uniqueContext: 'Highest GDP per capita in Africa, premium tourism, blue economy' },
  SSD: { name: 'South Sudan', gdpB: 5, pop: '11M', keyExports: ['Oil'], signalLevel: 'emerging', economicMomentum: 'declining', investorReadiness: 'low', uniqueContext: 'World newest country, oil-dependent, peace process ongoing' },
  
  // Central Africa
  CMR: { name: 'Cameroon', gdpB: 45, pop: '28M', keyExports: ['Oil', 'Cocoa', 'Timber', 'Agriculture'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'moderate', uniqueContext: 'CEMAC largest economy, bilingual (French/English), regional gateway' },
  CAF: { name: 'Central African Republic', gdpB: 3, pop: '5M', keyExports: ['Diamonds', 'Timber', 'Agriculture'], signalLevel: 'emerging', economicMomentum: 'declining', investorReadiness: 'low', uniqueContext: 'Conflict-affected, diamond and mineral resources' },
  COD: { name: 'Democratic Republic of Congo', gdpB: 65, pop: '100M', keyExports: ['Copper', 'Cobalt', 'Gold', 'Diamonds'], signalLevel: 'emerging', economicMomentum: 'improving', investorReadiness: 'moderate', uniqueContext: '70%+ global cobalt supply, critical minerals strategic interest' },
  COG: { name: 'Republic of Congo', gdpB: 12, pop: '6M', keyExports: ['Oil', 'Timber', 'Sugar'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'Oil producer, Pointe-Noire port, post-oil diversification' },
  GAB: { name: 'Gabon', gdpB: 20, pop: '2.4M', keyExports: ['Oil', 'Manganese', 'Timber'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'High GDP per capita for Africa, AGOA suspended 2023, oil reserves' },
  GNQ: { name: 'Equatorial Guinea', gdpB: 12, pop: '1.5M', keyExports: ['Oil & Gas', 'Timber'], signalLevel: 'emerging', economicMomentum: 'declining', investorReadiness: 'low', uniqueContext: 'Highest GDP per capita in continental Africa (oil), production declining' },
  STP: { name: 'São Tomé and Príncipe', gdpB: 0.5, pop: '0.2M', keyExports: ['Cocoa', 'Tourism'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'Small island economy, cocoa heritage, ecotourism potential' },
  TCD: { name: 'Chad', gdpB: 12, pop: '18M', keyExports: ['Oil', 'Cotton', 'Livestock'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'Landlocked oil producer, Sahel corridor, livestock trade' },
  AGO: { name: 'Angola', gdpB: 75, pop: '35M', keyExports: ['Oil', 'Diamonds', 'Coffee'], signalLevel: 'emerging', economicMomentum: 'improving', investorReadiness: 'moderate', uniqueContext: 'Africa second largest oil producer, post-dos Santos reforms, diversification push' },
  
  // Southern Africa
  BWA: { name: 'Botswana', gdpB: 18, pop: '2.6M', keyExports: ['Diamonds', 'Beef', 'Copper'], signalLevel: 'stable', economicMomentum: 'stable', investorReadiness: 'high', uniqueContext: 'Africa longest continuous democracy, diamond sector transparency model' },
  LSO: { name: 'Lesotho', gdpB: 2, pop: '2.2M', keyExports: ['Textiles', 'Diamonds', 'Water'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'moderate', uniqueContext: 'AGOA apparel production, water exports to South Africa, mountain kingdom' },
  SWZ: { name: 'Eswatini', gdpB: 5, pop: '1.2M', keyExports: ['Sugar', 'Textiles', 'Wood Pulp'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'moderate', uniqueContext: 'AGOA apparel, sugar production, SACU member' },
  NAM: { name: 'Namibia', gdpB: 13, pop: '2.6M', keyExports: ['Diamonds', 'Uranium', 'Fish', 'Beef'], signalLevel: 'stable', economicMomentum: 'improving', investorReadiness: 'high', uniqueContext: 'Green hydrogen ambitions, diamond and uranium reserves, stable governance' },
  ZWE: { name: 'Zimbabwe', gdpB: 22, pop: '16M', keyExports: ['Tobacco', 'Gold', 'Platinum'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'Agricultural potential, mineral reserves, economic reform uncertainty' },
  MOZ: { name: 'Mozambique', gdpB: 18, pop: '33M', keyExports: ['Coal', 'Aluminum', 'Gas', 'Agriculture'], signalLevel: 'emerging', economicMomentum: 'improving', investorReadiness: 'moderate', uniqueContext: 'LNG megaprojects, Nacala corridor, agricultural potential' },
  ZMB: { name: 'Zambia', gdpB: 22, pop: '20M', keyExports: ['Copper', 'Cobalt', 'Agriculture'], signalLevel: 'emerging', economicMomentum: 'improving', investorReadiness: 'moderate', uniqueContext: 'Africa second largest copper producer, post-debt restructuring recovery' },
  MWI: { name: 'Malawi', gdpB: 12, pop: '20M', keyExports: ['Tobacco', 'Tea', 'Sugar'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'Agricultural economy, tobacco dependence, democratic governance' },
  
  // Caribbean (additional markets)
  DOM: { name: 'Dominican Republic', gdpB: 115, pop: '11M', keyExports: ['Free Zone Manufacturing', 'Tourism', 'Agriculture'], signalLevel: 'high_growth', economicMomentum: 'improving', investorReadiness: 'high', uniqueContext: 'DR-CAFTA benefits, largest Caribbean economy, medical devices manufacturing' },
  HTI: { name: 'Haiti', gdpB: 15, pop: '11M', keyExports: ['Textiles', 'Agriculture'], signalLevel: 'emerging', economicMomentum: 'declining', investorReadiness: 'low', uniqueContext: 'HOPE/HELP trade preferences, post-crisis reconstruction challenges' },
  GUY: { name: 'Guyana', gdpB: 18, pop: '0.8M', keyExports: ['Oil', 'Gold', 'Rice', 'Sugar'], signalLevel: 'high_growth', economicMomentum: 'improving', investorReadiness: 'high', uniqueContext: 'World fastest-growing economy (oil), ExxonMobil offshore production' },
  ATG: { name: 'Antigua and Barbuda', gdpB: 2, pop: '0.1M', keyExports: ['Tourism', 'Financial Services'], signalLevel: 'stable', economicMomentum: 'improving', investorReadiness: 'moderate', uniqueContext: 'Premium tourism destination, citizenship-by-investment program' },
  CUB: { name: 'Cuba', gdpB: 100, pop: '11M', keyExports: ['Tourism', 'Medical Services', 'Nickel'], signalLevel: 'emerging', economicMomentum: 'declining', investorReadiness: 'low', uniqueContext: 'US sanctions limit commercial engagement, medical services exports' },
  DMA: { name: 'Dominica', gdpB: 0.6, pop: '0.07M', keyExports: ['Bananas', 'Tourism', 'Essential Oils'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'Nature island, geothermal potential, hurricane vulnerability' },
  GRD: { name: 'Grenada', gdpB: 1.2, pop: '0.12M', keyExports: ['Nutmeg', 'Tourism', 'Cocoa'], signalLevel: 'stable', economicMomentum: 'improving', investorReadiness: 'moderate', uniqueContext: 'World second largest nutmeg producer, tourism recovery post-COVID' },
  KNA: { name: 'Saint Kitts and Nevis', gdpB: 1, pop: '0.05M', keyExports: ['Tourism', 'Financial Services'], signalLevel: 'stable', economicMomentum: 'improving', investorReadiness: 'moderate', uniqueContext: 'Pioneered citizenship-by-investment, tourism infrastructure' },
  LCA: { name: 'Saint Lucia', gdpB: 2, pop: '0.18M', keyExports: ['Tourism', 'Bananas'], signalLevel: 'stable', economicMomentum: 'improving', investorReadiness: 'moderate', uniqueContext: 'Premium tourism, dual Pitons UNESCO site, cruise destination' },
  VCT: { name: 'Saint Vincent and the Grenadines', gdpB: 0.9, pop: '0.11M', keyExports: ['Bananas', 'Tourism', 'Arrowroot'], signalLevel: 'emerging', economicMomentum: 'stable', investorReadiness: 'low', uniqueContext: 'Grenadine islands tourism, volcanic risk (La Soufrière 2021)' },
  SUR: { name: 'Suriname', gdpB: 3, pop: '0.6M', keyExports: ['Gold', 'Oil', 'Bauxite'], signalLevel: 'emerging', economicMomentum: 'improving', investorReadiness: 'moderate', uniqueContext: 'Oil discoveries, gold production, Dutch legal system heritage' },
  BLZ: { name: 'Belize', gdpB: 3, pop: '0.4M', keyExports: ['Sugar', 'Bananas', 'Citrus', 'Fish'], signalLevel: 'stable', economicMomentum: 'stable', investorReadiness: 'moderate', uniqueContext: 'English-speaking Central America, reef tourism, agricultural exports' },
  PRI: { name: 'Puerto Rico', gdpB: 110, pop: '3.2M', keyExports: ['Pharmaceuticals', 'Manufacturing'], signalLevel: 'stable', economicMomentum: 'stable', investorReadiness: 'high', uniqueContext: 'US territory, pharmaceutical manufacturing hub, post-Maria recovery' },
  VGB: { name: 'British Virgin Islands', gdpB: 1, pop: '0.03M', keyExports: ['Financial Services', 'Tourism'], signalLevel: 'stable', economicMomentum: 'stable', investorReadiness: 'moderate', uniqueContext: 'Offshore financial center, yacht tourism, British territory' },
  TCA: { name: 'Turks and Caicos Islands', gdpB: 1, pop: '0.04M', keyExports: ['Tourism', 'Fishing'], signalLevel: 'stable', economicMomentum: 'improving', investorReadiness: 'moderate', uniqueContext: 'High-end tourism, British territory, proximity to US' },
  CYM: { name: 'Cayman Islands', gdpB: 6, pop: '0.07M', keyExports: ['Financial Services', 'Tourism'], signalLevel: 'stable', economicMomentum: 'stable', investorReadiness: 'high', uniqueContext: 'Global financial center, hedge fund domicile, British territory' },
};

function generateNarrative(iso3: string): CountryNarrative | null {
  const data = MARKET_DATA[iso3];
  if (!data) return null;
  
  const region = getRegion(iso3);
  const ctx = REGIONAL_CONTEXT[region];
  
  const { name, gdpB, pop, keyExports, signalLevel, economicMomentum, investorReadiness, uniqueContext } = data;
  
  const summaryMd = `${name} is a ${region} economy with a GDP of approximately $${gdpB}B and population of ${pop}. Key export sectors include ${keyExports.slice(0, 3).join(', ')}. ${uniqueContext || ''} The economy operates within ${ctx.tradePref} frameworks, with ${ctx.investmentTheme.toLowerCase()} representing the primary investment narrative.`;
  
  const whyNowMd = `${name}'s positioning within ${region} ${ctx.primarySectors[0].toLowerCase()} and ${ctx.primarySectors[1].toLowerCase()} value chains creates structural opportunity corridors for investors seeking ${region} exposure. ${ctx.tradePref} provides preferential market access that anchors export-oriented investment. ${uniqueContext ? uniqueContext.split(',')[0] + ' represents a differentiated opportunity.' : 'Regional integration through AfCFTA creates cross-border market access.'}`;
  
  const opportunityThesisMd = `${keyExports[0]} represents the highest-conviction entry point given ${name}'s established position in this sector. ${keyExports[1] ? keyExports[1] + ' offers value-addition opportunities with regional and international market access.' : ''} ${ctx.investmentTheme} provides the strategic rationale for market engagement. Infrastructure development (logistics, energy, digital) addresses structural gaps that constrain the broader economy.`;
  
  const riskNarrativeMd = `${ctx.commonRisks[0]} represents the primary macro risk for ${name}. ${ctx.commonRisks[1]} creates operational challenges that increase the cost of doing business relative to regional benchmarks. ${ctx.commonRisks[2]} affects sector-level projections and requires investors to structure around uncertainty. Foreign exchange volatility and repatriation logistics require careful structuring for cross-border investments.`;
  
  return {
    iso3,
    name,
    summaryMd,
    whyNowMd,
    opportunityThesisMd,
    riskNarrativeMd,
    signalLevel,
    economicMomentum,
    investorReadiness,
  };
}

export async function ingestCountryNarratives74(): Promise<void> {
  console.log('\n[ingest-country-narratives-74] Generating 74-market narrative coverage...\n');
  
  const supabase = getSupabaseServiceClient();
  const { jobId, sourceId } = await createIngestionJob('world_bank', 'country_narratives_74');
  const start = Date.now();
  let upserted = 0;
  let skipped = 0;
  let failed = 0;
  
  const allIso3 = Object.keys(MARKET_DATA);
  console.log(`  → ${allIso3.length} markets to process\n`);
  
  // Get country IDs
  const { data: countries, error: cErr } = await supabase
    .from('souvera_countries')
    .select('id, iso3')
    .in('iso3', allIso3);
  
  if (cErr) throw new Error(`Country lookup failed: ${cErr.message}`);
  const countryMap = new Map((countries ?? []).map(c => [c.iso3, c.id]));
  
  for (const iso3 of allIso3) {
    if (EXISTING_TIER_A.has(iso3)) {
      console.log(`  ⏭  ${iso3} — exists (Tier A seed)`);
      skipped++;
      continue;
    }
    
    const narrative = generateNarrative(iso3);
    if (!narrative) {
      console.warn(`  ⚠  ${iso3} — no data, skipping`);
      failed++;
      continue;
    }
    
    const countryId = countryMap.get(iso3);
    if (!countryId) {
      console.warn(`  ⚠  ${iso3} not found in souvera_countries — skipping`);
      failed++;
      continue;
    }
    
    const { error } = await supabase.from('souvera_country_profiles').upsert({
      country_id: countryId,
      summary_md: narrative.summaryMd,
      why_now_md: narrative.whyNowMd,
      opportunity_thesis_md: narrative.opportunityThesisMd,
      risk_narrative_md: narrative.riskNarrativeMd,
      signal_level: narrative.signalLevel,
      economic_momentum: narrative.economicMomentum,
      investor_readiness: narrative.investorReadiness,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'country_id' });
    
    if (error) {
      console.error(`  ✗  ${iso3}: ${error.message}`);
      failed++;
    } else {
      const tier = EXISTING_TIER_A.has(iso3) ? 'A' : narrative.investorReadiness === 'high' ? 'B+' : 'B';
      console.log(`  ✓  ${iso3} — ${narrative.name} (Tier ${tier})`);
      upserted++;
    }
  }
  
  const elapsed = Date.now() - start;
  console.log(`\n  Summary:`);
  console.log(`    ✓ ${upserted} upserted`);
  console.log(`    ⏭ ${skipped} skipped (Tier A exists)`);
  if (failed > 0) console.log(`    ✗ ${failed} failed`);
  console.log(`    ⏱ ${elapsed}ms\n`);
  
  const status = failed === 0 ? 'succeeded' : upserted > 0 ? 'partial' : 'failed';
  await closeIngestionJob(jobId, status, upserted, failed, failed > 0 ? `${failed} failed` : undefined);
  
  console.log('[ingest-country-narratives-74] Done.\n');
}

export default ingestCountryNarratives74;
