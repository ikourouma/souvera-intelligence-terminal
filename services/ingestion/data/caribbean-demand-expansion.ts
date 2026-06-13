/**
 * Phase 0.6 — Full Caribbean Demand Coverage
 * 
 * Expands Caribbean Import Demand Intelligence from 9 to 20 countries/territories
 * using tiered data quality approach:
 * - Tier A: Existing high-quality curated data (9 countries)
 * - Tier B: Regional benchmark estimates (6 countries)
 * - Tier C: Conservative projections (5 territories)
 */

export type DataQualityTier = 'A' | 'B' | 'C';

// GDP-based scaling factors (2023 estimates, billions USD)
export const CARIBBEAN_GDP_DATA: Record<string, { gdp: number; tier: DataQualityTier; name: string; subRegion: string }> = {
  // Tier A - Original 9 with high-quality curated data
  JAM: { gdp: 17, tier: 'A', name: 'Jamaica', subRegion: 'Greater Antilles' },
  TTO: { gdp: 28, tier: 'A', name: 'Trinidad and Tobago', subRegion: 'Southern Caribbean' },
  BHS: { gdp: 14, tier: 'A', name: 'Bahamas', subRegion: 'Greater Antilles' },
  BRB: { gdp: 6, tier: 'A', name: 'Barbados', subRegion: 'Eastern Caribbean' },
  DOM: { gdp: 113, tier: 'A', name: 'Dominican Republic', subRegion: 'Greater Antilles' },
  HTI: { gdp: 20, tier: 'A', name: 'Haiti', subRegion: 'Greater Antilles' },
  GUY: { gdp: 15, tier: 'A', name: 'Guyana', subRegion: 'Southern Caribbean' },
  SUR: { gdp: 4, tier: 'A', name: 'Suriname', subRegion: 'Southern Caribbean' },
  BLZ: { gdp: 3, tier: 'A', name: 'Belize', subRegion: 'Central American Caribbean' },
  
  // Tier B - Eastern Caribbean states (OECS members)
  ATG: { gdp: 2, tier: 'B', name: 'Antigua and Barbuda', subRegion: 'Eastern Caribbean' },
  DMA: { gdp: 0.6, tier: 'B', name: 'Dominica', subRegion: 'Eastern Caribbean' },
  GRD: { gdp: 1.2, tier: 'B', name: 'Grenada', subRegion: 'Eastern Caribbean' },
  KNA: { gdp: 1, tier: 'B', name: 'Saint Kitts and Nevis', subRegion: 'Eastern Caribbean' },
  LCA: { gdp: 2, tier: 'B', name: 'Saint Lucia', subRegion: 'Eastern Caribbean' },
  VCT: { gdp: 1, tier: 'B', name: 'Saint Vincent and the Grenadines', subRegion: 'Eastern Caribbean' },
  
  // Tier C - Territories and special cases
  CUB: { gdp: 107, tier: 'C', name: 'Cuba', subRegion: 'Greater Antilles' }, // US sanctions limit data
  PRI: { gdp: 113, tier: 'C', name: 'Puerto Rico', subRegion: 'Greater Antilles' }, // US territory
  VGB: { gdp: 1, tier: 'C', name: 'British Virgin Islands', subRegion: 'Eastern Caribbean' },
  TCA: { gdp: 1, tier: 'C', name: 'Turks and Caicos Islands', subRegion: 'Greater Antilles' },
  CYM: { gdp: 6, tier: 'C', name: 'Cayman Islands', subRegion: 'Greater Antilles' },
};

// Category-specific import multipliers for Caribbean (% of GDP)
// Caribbean has higher import dependence than Africa
export const CARIBBEAN_IMPORT_MULTIPLIERS = {
  machinery: 0.028,
  grains: 0.025,
  fertilizers: 0.006,
  pharma: 0.018,
  transport: 0.035,
  intermediate: 0.022,
  cotton: 0.004,
  textiles_inputs: 0.008,
  ict: 0.022,
  medical_devices: 0.012,
};

// US market share benchmarks for Caribbean (higher than Africa due to proximity)
export const CARIBBEAN_US_SHARE_BENCHMARKS: Record<string, Record<string, number>> = {
  'Greater Antilles': {
    machinery: 38, grains: 55, fertilizers: 35, pharma: 42, transport: 32,
    intermediate: 28, cotton: 35, textiles_inputs: 30, ict: 38, medical_devices: 45,
  },
  'Eastern Caribbean': {
    machinery: 35, grains: 48, fertilizers: 32, pharma: 38, transport: 28,
    intermediate: 25, cotton: 30, textiles_inputs: 28, ict: 35, medical_devices: 42,
  },
  'Southern Caribbean': {
    machinery: 32, grains: 45, fertilizers: 28, pharma: 35, transport: 25,
    intermediate: 22, cotton: 28, textiles_inputs: 25, ict: 32, medical_devices: 40,
  },
  'Central American Caribbean': {
    machinery: 40, grains: 52, fertilizers: 38, pharma: 40, transport: 35,
    intermediate: 30, cotton: 32, textiles_inputs: 32, ict: 40, medical_devices: 48,
  },
};

// US benchmark targets for Caribbean (higher due to CBTPA preferences)
export const CARIBBEAN_US_BENCHMARK_TARGETS: Record<string, number> = {
  machinery: 55, grains: 75, fertilizers: 55, pharma: 60, transport: 45,
  intermediate: 40, cotton: 50, textiles_inputs: 45, ict: 50, medical_devices: 65,
};

// Top suppliers for Caribbean markets
export const CARIBBEAN_TOP_SUPPLIERS: Record<string, Array<{ country: string; iso3: string; shareRange: [number, number] }>> = {
  'Greater Antilles': [
    { country: 'United States', iso3: 'USA', shareRange: [35, 50] },
    { country: 'China', iso3: 'CHN', shareRange: [12, 22] },
    { country: 'Mexico', iso3: 'MEX', shareRange: [5, 12] },
    { country: 'Brazil', iso3: 'BRA', shareRange: [4, 10] },
    { country: 'Trinidad and Tobago', iso3: 'TTO', shareRange: [3, 8] },
  ],
  'Eastern Caribbean': [
    { country: 'United States', iso3: 'USA', shareRange: [32, 45] },
    { country: 'Trinidad and Tobago', iso3: 'TTO', shareRange: [10, 18] },
    { country: 'United Kingdom', iso3: 'GBR', shareRange: [8, 15] },
    { country: 'China', iso3: 'CHN', shareRange: [8, 15] },
    { country: 'Canada', iso3: 'CAN', shareRange: [4, 10] },
  ],
  'Southern Caribbean': [
    { country: 'United States', iso3: 'USA', shareRange: [28, 42] },
    { country: 'China', iso3: 'CHN', shareRange: [15, 25] },
    { country: 'Brazil', iso3: 'BRA', shareRange: [8, 15] },
    { country: 'Trinidad and Tobago', iso3: 'TTO', shareRange: [5, 12] },
    { country: 'Netherlands', iso3: 'NLD', shareRange: [4, 10] },
  ],
  'Central American Caribbean': [
    { country: 'United States', iso3: 'USA', shareRange: [38, 52] },
    { country: 'Mexico', iso3: 'MEX', shareRange: [12, 20] },
    { country: 'China', iso3: 'CHN', shareRange: [10, 18] },
    { country: 'Guatemala', iso3: 'GTM', shareRange: [4, 10] },
    { country: 'Honduras', iso3: 'HND', shareRange: [3, 8] },
  ],
};

// Category metadata (same as African demand for consistency)
export const CARIBBEAN_DEMAND_CATEGORIES = {
  machinery:        { label: 'Agricultural & Mining Machinery', chapters: ['84'], hsChapter: '84' },
  grains:           { label: 'Grains & Cereals', chapters: ['10'], hsChapter: '10' },
  fertilizers:      { label: 'Fertilizers & Agri-inputs', chapters: ['31'], hsChapter: '31' },
  pharma:           { label: 'Pharmaceuticals & Medical Supplies', chapters: ['30'], hsChapter: '30' },
  transport:        { label: 'Transport & Commercial Vehicles', chapters: ['87', '88'], hsChapter: '87' },
  intermediate:     { label: 'Intermediate Industrial Goods', chapters: ['28', '29', '38', '39', '72', '73'], hsChapter: '72' },
  cotton:           { label: 'Cotton & Raw Textiles', chapters: ['52'], hsChapter: '52' },
  textiles_inputs:  { label: 'Textile Inputs & Apparel Machinery', chapters: ['55', '56', '84-textile'], hsChapter: '55' },
  ict:              { label: 'ICT & Telecommunications', chapters: ['85'], hsChapter: '85' },
  medical_devices:  { label: 'Medical Devices & Diagnostics', chapters: ['90'], hsChapter: '90' },
} as const;

export type CaribbeanDemandCategory = keyof typeof CARIBBEAN_DEMAND_CATEGORIES;

// CARICOM member states (for intra-Caribbean trade flows)
export const CARICOM_MEMBERS = [
  'ATG', 'BHS', 'BRB', 'BLZ', 'DMA', 'GRD', 'GUY', 'HTI', 'JAM', 
  'KNA', 'LCA', 'VCT', 'SUR', 'TTO'
] as const;
