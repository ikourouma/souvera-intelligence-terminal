/**
 * =====================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * Supply-Demand Matrix Types
 * Owner: Afronovation, Inc.
 * =====================================================
 */

export type ConfidenceLevel = 'A' | 'B' | 'C';
export type OpportunityTier = 1 | 2 | 3 | 4;

export interface SupplyComponents {
  exportVolumePercentile: number;
  infrastructureScore: number;
  regulatoryScore: number;
  fdiScore: number;
  laborQualityScore: number;
  manufacturingCapacity: number;
}

export interface DemandComponents {
  usImportVolumePercentile: number;
  growthScore: number;
  diversificationScore: number;
  policyIncentiveScore: number;
}

export interface Competitor {
  country: string;
  iso3: string;
  sharePct: number;
}

export type SdmProductSource = 'usitc' | 'cbtpa' | 'template';

export interface SdmExportProduct {
  name: string;
  valueUsd: number;
  sharePct: number;
  source: SdmProductSource;
  categoryGroup?: string;
}

export interface MatrixCell {
  id: string;
  iso3: string;
  country_name: string;
  region: 'Africa' | 'Caribbean';
  sector_key: string;
  sector_label: string;
  
  supply_score: number;
  supply_confidence: ConfidenceLevel;
  supply_components: SupplyComponents;
  supply_notes: string | null;
  
  export_volume_usd: number;
  manufacturing_capacity_index: number;
  fdi_inflows_usd: number;
  infrastructure_score: number;
  labor_quality_index: number;
  regulatory_score: number;
  
  demand_score: number;
  demand_confidence: ConfidenceLevel;
  demand_components: DemandComponents;
  demand_notes: string | null;
  
  us_import_volume_usd: number;
  us_import_growth_pct: number;
  us_diversification_pressure: number;
  policy_incentive_score: number;
  china_market_share_pct: number;
  
  opportunity_score: number;
  opportunity_tier: OpportunityTier;
  opportunity_rationale: string;
  
  current_trade_usd: number;
  tariff_preference_margin_pct: number;
  top_competitors: Competitor[];
  
  agoa_eligible: boolean;
  cbtpa_eligible: boolean;
  afcfta_member: boolean;
  us_fta: boolean;
  
  data_year: number;
  data_quality_tier: ConfidenceLevel;
  source_notes: string | null;

  /** True when sector is petroleum-heavy (energy_power) — excluded from AGOA/CBI preferential scoring. */
  preferential_excluded?: boolean;
  preferential_exclusion_reason?: string;
  preferential_framework_note?: string;

  /** Top export lines from AGOA/CBTPA category flows when available. */
  export_products?: SdmExportProduct[];
  export_products_source?: SdmProductSource;

  /** U.S. exports to country — sector-scoped from import demand signals when available. */
  country_imports_from_us_usd?: number;
  country_sector_imports_from_us_usd?: number | null;
  country_top_import_product?: string | null;
  country_bilateral_imports_from_us_usd?: number | null;
}

export interface SectorSummary {
  sector_key: string;
  sector_label: string;
  cell_count: number;
  avg_supply_score: number;
  avg_demand_score: number;
  avg_opportunity_score: number;
  tier_1_count: number;
  tier_2_count: number;
  top_market: {
    iso3: string;
    name: string;
    opportunity_score: number;
  } | null;
}

export interface CountrySummary {
  iso3: string;
  country_name: string;
  region: string;
  cell_count: number;
  avg_supply_score: number;
  avg_demand_score: number;
  avg_opportunity_score: number;
  best_sector: {
    sector_key: string;
    sector_label: string;
    opportunity_score: number;
  } | null;
  agoa_eligible: boolean;
  cbtpa_eligible: boolean;
}

export interface MatrixSummary {
  total_cells: number;
  tier_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
  };
  avg_supply_score: number;
  avg_demand_score: number;
  avg_opportunity_score: number;
  top_opportunities: MatrixCell[];
  data_quality_breakdown: {
    A: number;
    B: number;
    C: number;
  };
  data_vintage: string;
}

export interface SupplyDemandResponse {
  matrix: MatrixCell[];
  summary: MatrixSummary;
  sectors: SectorSummary[];
  countries: CountrySummary[];
  attribution: {
    sources: string[];
    note: string;
    methodology_url: string;
    petroleum_exclusion_note?: string;
    petroleum_excluded_cells?: number;
  };
}

export interface SupplyDemandQueryParams {
  region?: 'Africa' | 'Caribbean';
  sector?: string | string[];
  iso3?: string | string[];
  min_opportunity_score?: number;
  tier?: OpportunityTier | OpportunityTier[];
  agoa_only?: boolean;
  cbtpa_only?: boolean;
  /** When true, omit energy_power (HTS Ch. 27) cells from preferential opportunity views. */
  exclude_petroleum?: boolean;
  year?: number;
  limit?: number;
}

export const SECTOR_DEFINITIONS = {
  manufacturing_textiles: {
    key: 'manufacturing_textiles',
    label: 'Manufacturing & Textiles',
    icon: '🏭',
    description: 'Apparel, industrial goods, EPZ production',
    narrative: 'Manufacturing and textiles anchor Africa\'s export-led growth strategy, with AGOA duty-free access enabling garment exports to the U.S. market. Ethiopia, Kenya, and Lesotho lead in apparel exports, while Nigeria and South Africa maintain diversified industrial bases. EPZ incentives and competitive labor costs position the sector for nearshoring opportunities as global supply chains diversify away from Asia.',
    keyInsights: [
      'AGOA provides duty-free U.S. market access for textiles',
      '$2.1B annual textile exports from Africa to U.S.',
      'Ethiopia emerging as garment hub with 15+ industrial parks',
      'Nearshoring trend creating $500M+ annual opportunity'
    ],
    caribbeanNarrative: 'Caribbean manufacturing leverages CBTPA preferences for duty-free U.S. apparel exports, with Dominican Republic and Haiti leading production volumes. CARIFORUM EPA provides additional EU market access for textiles and industrial goods. Jamaica\'s logistics hub and Trinidad\'s industrial base support regional supply chains. Nearshoring opportunities from Mexico and Central America create $200M+ annual growth potential as U.S. companies diversify from Asian suppliers.',
    caribbeanKeyInsights: [
      'CBTPA provides duty-free U.S. market access for qualifying textiles',
      'Dominican Republic exports $2.5B+ annually in apparel to U.S.',
      'CARIFORUM EPA enables duty-free access to EU market',
      'Jamaica Free Zones host 15+ manufacturing operations'
    ],
  },
  agriculture_food: {
    key: 'agriculture_food',
    label: 'Agriculture & Food Processing',
    icon: '🌾',
    description: 'Raw commodities + value-added processing',
    narrative: 'Agriculture and food processing remain foundational to African and Caribbean economies, with growing emphasis on value-added exports and specialty crops. Kenya\'s horticulture, Ghana\'s cocoa processing, and Jamaica\'s Blue Mountain coffee exemplify premium export corridors. Climate-smart agriculture and cold chain investments are unlocking year-round export capacity to North American and European markets.',
    keyInsights: [
      '$45B+ annual agricultural exports from Africa',
      'Specialty crops (coffee, cocoa, tea) command 30-50% premium',
      'Cold chain infrastructure expanding in East Africa',
      'Agro-processing zones creating 200K+ manufacturing jobs'
    ],
    caribbeanNarrative: 'Caribbean agriculture focuses on high-value specialty exports and value-added food processing, with CBTPA enabling duty-free access for processed products. Jamaica\'s Blue Mountain coffee, Trinidad\'s cocoa, and Dominican Republic\'s organic bananas command premium pricing in U.S. markets. CARIFORUM EPA provides EU market access for rum, sugar, and tropical fruits. Cold chain investments and food safety certifications are expanding year-round export capacity.',
    caribbeanKeyInsights: [
      'Jamaica Blue Mountain coffee commands $50+/lb premium pricing',
      'Caribbean rum exports to U.S. exceed $400M annually',
      'CBTPA duty-free access for processed food products',
      'Organic and specialty agriculture growing 20% annually'
    ],
  },
  energy_power: {
    key: 'energy_power',
    label: 'Energy & Power',
    icon: '⚡',
    description: 'Oil, gas, LNG, renewables, power generation',
    narrative: 'Energy transition is reshaping Africa\'s power sector, with natural gas discoveries in Mozambique and Tanzania complementing renewable expansion across Kenya, Egypt, and South Africa. Caribbean markets are pivoting from diesel dependence to solar and LNG. Green hydrogen pilots in Namibia and South Africa position the continent as a future clean energy exporter to Europe and Asia. Note: crude and refined petroleum (HTS Chapter 27) are excluded from AGOA/CBI duty-free preferences — bilateral Census totals may include petroleum while preferential metrics do not.',
    keyInsights: [
      'East Africa LNG projects targeting $20B+ investment',
      'Solar costs dropped 70% since 2015, enabling utility-scale deployment',
      'Kenya generates 90%+ electricity from renewables',
      'Green hydrogen emerging as $50B+ export opportunity by 2030'
    ],
    caribbeanNarrative: 'Caribbean energy sector is transitioning from diesel dependence to LNG and renewables, with Trinidad & Tobago anchoring regional natural gas supply. Jamaica and Barbados are deploying utility-scale solar and wind projects to reduce energy costs by 30-40%. U.S.-Caribbean energy partnership supports grid modernization and renewable integration. LNG import terminals in Jamaica and Dominican Republic enable cleaner baseload power while solar deployment accelerates across all island economies.',
    caribbeanKeyInsights: [
      'Trinidad & Tobago supplies 60%+ of Caribbean LNG demand',
      'Jamaica targeting 50% renewable electricity by 2030',
      'Solar costs dropped 65% since 2015 in Caribbean markets',
      'U.S.-Caribbean Energy Security Initiative: $500M investment'
    ],
  },
  mining_minerals: {
    key: 'mining_minerals',
    label: 'Mining & Critical Minerals',
    icon: '⛏️',
    description: 'Gold, lithium, cobalt, rare earths',
    narrative: 'Africa holds 60% of global cobalt reserves and 50% of manganese, positioning the continent as critical to EV battery and renewable energy supply chains. Lithium discoveries in Zimbabwe, Ghana, and DRC are attracting strategic investment from Chinese, European, and North American battery manufacturers. ESG compliance and community benefit-sharing are now baseline requirements for institutional capital.',
    keyInsights: [
      'DRC supplies 70% of global cobalt for EV batteries',
      'Zimbabwe lithium exports surged 400% in 2023-2024',
      '$15B+ mining investment pipeline through 2028',
      'Critical minerals strategic priority for U.S. and EU supply chains'
    ],
    caribbeanNarrative: 'Caribbean mining focuses on bauxite/alumina, gold, and emerging critical minerals, with Jamaica supplying 10% of global bauxite. Trinidad & Tobago\'s petrochemical sector and Dominican Republic\'s gold production anchor regional mineral exports. U.S.-Caribbean critical minerals partnership targets nickel, copper, and rare earth exploration. ESG compliance and community benefit-sharing are baseline requirements for new mining projects, with CBTPA enabling duty-free processing and export of refined metals.',
    caribbeanKeyInsights: [
      'Jamaica bauxite: 10% of global supply, $500M+ annual exports',
      'Dominican Republic gold production: 1.5M oz annually',
      'U.S.-Caribbean critical minerals partnership launched 2024',
      'CBTPA duty-free access for processed metals and alloys'
    ],
  },
  digital_infrastructure: {
    key: 'digital_infrastructure',
    label: 'Digital Infrastructure',
    icon: '📡',
    description: 'Telecom, data centers, fiber, 5G',
    narrative: 'Digital infrastructure expansion is accelerating across Africa and the Caribbean, with submarine cable landings enabling cloud connectivity and data center deployment. Nigeria, Kenya, and South Africa are emerging as regional data hubs, while Jamaica and Trinidad anchor Caribbean nearshore opportunities. 5G rollouts in urban centers and satellite internet bridging rural connectivity gaps are foundational to digital economy growth.',
    keyInsights: [
      '15+ submarine cables landed since 2020, expanding bandwidth 10x',
      'Data center capacity growing 25% annually in Lagos, Nairobi, Cape Town',
      'Jamaica submarine cables position Caribbean as nearshore hub',
      '5G coverage reaching 40% of Africa urban population by 2026'
    ],
    caribbeanNarrative: 'Caribbean digital infrastructure leverages strategic geography for nearshore data centers and submarine cable hubs, with Jamaica and Trinidad leading regional connectivity. Multiple submarine cables (ARCOS, CBUS, AMX-1) provide redundant U.S. connectivity with <30ms latency. U.S.-Caribbean Digital Partnership supports 5G deployment and cybersecurity. Jamaica\'s data center capacity growing 30% annually, positioning the island as nearshore alternative to U.S. facilities. CARIFORUM EPA enables duty-free ICT equipment imports.',
    caribbeanKeyInsights: [
      'Jamaica: 8+ submarine cables, <30ms latency to U.S. East Coast',
      'Caribbean data center market growing 30% annually',
      'Trinidad & Tobago: Regional cloud hub for Latin America',
      'U.S.-Caribbean Digital Partnership: $200M in fiber/5G investment'
    ],
  },
  fintech_finance: {
    key: 'fintech_finance',
    label: 'Fintech & Digital Finance',
    icon: '💳',
    description: 'Mobile money, payments, banking',
    narrative: 'Fintech innovation is driving financial inclusion across Africa and the Caribbean, with mobile money penetration exceeding 80% in East Africa. M-Pesa\'s success model is replicated across West Africa, while Caribbean CBDC pilots (Jamaica\'s JAM-DEX) position the region as digital currency leaders. Cross-border remittance corridors and BaaS platforms are unlocking $500M+ in payment infrastructure investment.',
    keyInsights: [
      'M-Pesa processes $300B+ annually across East Africa',
      'Nigeria fintech sector raised $1.5B+ venture capital 2020-2024',
      'Jamaica JAM-DEX CBDC pilot leads Caribbean digital currency adoption',
      'Cross-border payment costs dropped from 8% to 3% via mobile money'
    ],
    caribbeanNarrative: 'Caribbean fintech is pioneering digital currency adoption and cross-border payment innovation, with Jamaica\'s JAM-DEX CBDC leading global implementation. Trinidad & Tobago anchors regional banking and payment processing, while Barbados and Jamaica compete for fintech startup hubs. U.S.-Caribbean remittance corridor ($10B+ annually) drives mobile money and blockchain payment adoption. CARIFORUM EPA enables financial services market access across EU, while CBTPA supports payment processing operations.',
    caribbeanKeyInsights: [
      'Jamaica JAM-DEX: First live retail CBDC in Western Hemisphere',
      'Caribbean remittances: $10B+ annually, 15-20% of GDP',
      'Trinidad financial services: $2B+ exports annually',
      'Mobile money adoption growing 40% annually across Caribbean'
    ],
  },
  logistics_trade: {
    key: 'logistics_trade',
    label: 'Logistics & Trade',
    icon: '🚢',
    description: 'Ports, freight, supply chain services',
    narrative: 'Logistics infrastructure modernization is unlocking intra-Africa trade under AfCFTA and strengthening global supply chain connectivity. Mombasa, Lagos, and Durban anchor East, West, and Southern Africa freight corridors, while Kingston positions Jamaica as Caribbean transshipment hub. Cold chain investments and bonded warehouses are enabling export-led manufacturing and agricultural value chains.',
    keyInsights: [
      'AfCFTA targeting $3T intra-Africa trade by 2030',
      'Mombasa port handles 1.5M+ TEUs annually for East Africa corridor',
      'Kingston Container Terminal: Caribbean\'s largest transshipment hub',
      'Last-mile logistics costs dropping 20% via digital freight platforms'
    ],
    caribbeanNarrative: 'Caribbean logistics infrastructure leverages strategic location on major shipping lanes, with Kingston, Panama, and Freeport serving as transshipment hubs for U.S.-Latin America trade. Jamaica\'s Kingston Container Terminal handles 2M+ TEUs annually, making it the Caribbean\'s largest port. CBTPA enables bonded warehousing and value-added processing for U.S.-bound cargo. Cold chain investments support agricultural and pharmaceutical exports. U.S.-Caribbean logistics partnership modernizes port infrastructure and digital freight platforms.',
    caribbeanKeyInsights: [
      'Kingston Container Terminal: 2M+ TEUs, 40% transshipment share',
      'Panama Canal proximity enables 3-day transit to U.S. East Coast',
      'CBTPA bonded zones support $5B+ in trade facilitation',
      'Cold chain capacity growing 25% annually for pharma/food exports'
    ],
  },
  tourism_hospitality: {
    key: 'tourism_hospitality',
    label: 'Tourism & Hospitality',
    icon: '🏨',
    description: 'Hotels, travel services, eco-tourism',
    narrative: 'Tourism anchors Caribbean economies and is rebounding across Africa post-pandemic, with luxury and eco-tourism segments commanding premium rates. Egypt, Kenya, and Tanzania lead Africa heritage and wildlife tourism, while Jamaica, Barbados, and Antigua drive Caribbean beach resort demand. Sustainable tourism certifications and community-based tourism models are attracting ESG-focused hospitality investors.',
    keyInsights: [
      'Caribbean tourism contributes 30-40% of GDP in island economies',
      'Africa safari tourism generating $40B+ annual revenues',
      'Eco-tourism growing 15% annually with 25% price premium',
      'Post-pandemic recovery: arrivals at 95% of 2019 levels by 2025'
    ],
    caribbeanNarrative: 'Tourism is the cornerstone of Caribbean economies, contributing 30-50% of GDP in island nations and employing 25%+ of the workforce. Jamaica, Barbados, and Bahamas lead in cruise and resort tourism, with 30M+ annual visitors pre-pandemic. Luxury eco-tourism and heritage tourism segments command 40-60% premium rates. U.S. visitors account for 50%+ of arrivals, with CBTPA supporting duty-free import of hospitality equipment. Post-pandemic recovery reached 90% of 2019 levels by 2024, with airlift capacity expanding.',
    caribbeanKeyInsights: [
      'Caribbean tourism: $60B+ annual revenues, 30-50% of GDP',
      'Jamaica welcomed 4.3M visitors in 2023, $3.7B in tourism revenue',
      'Luxury resort segment growing 20% annually post-pandemic',
      'U.S.-Caribbean tourism corridor: 15M+ annual visitors'
    ],
  },
} as const;

export type SectorKey = keyof typeof SECTOR_DEFINITIONS;
