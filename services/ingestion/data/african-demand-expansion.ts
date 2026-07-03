/**
 * Phase 0.6 — Full African Demand Coverage
 * 
 * Expands African Import Demand Intelligence from 8 to 54 countries
 * using tiered data quality approach:
 * - Tier A: Existing high-quality curated data (8 countries)
 * - Tier B: Regional benchmark estimates (16 countries)
 * - Tier C: Conservative projections (30 countries)
 */

export type DataQualityTier = 'A' | 'B' | 'C';

// GDP-based scaling factors (2023 estimates, billions USD)
export const AFRICAN_GDP_DATA: Record<string, { gdp: number; tier: DataQualityTier; name: string; subRegion: string }> = {
  // Tier A - High-quality curated data (elevated North African economies for trade completeness)
  NGA: { gdp: 477, tier: 'A', name: 'Nigeria', subRegion: 'Western Africa' },
  ZAF: { gdp: 399, tier: 'A', name: 'South Africa', subRegion: 'Southern Africa' },
  EGY: { gdp: 387, tier: 'A', name: 'Egypt', subRegion: 'Northern Africa' }, // Elevated to Tier A - major trade partner
  KEN: { gdp: 113, tier: 'A', name: 'Kenya', subRegion: 'Eastern Africa' },
  ETH: { gdp: 156, tier: 'A', name: 'Ethiopia', subRegion: 'Eastern Africa' },
  GHA: { gdp: 76, tier: 'A', name: 'Ghana', subRegion: 'Western Africa' },
  CIV: { gdp: 70, tier: 'A', name: "Côte d'Ivoire", subRegion: 'Western Africa' },
  TZA: { gdp: 75, tier: 'A', name: 'Tanzania', subRegion: 'Eastern Africa' },
  SEN: { gdp: 28, tier: 'A', name: 'Senegal', subRegion: 'Western Africa' },
  MAR: { gdp: 134, tier: 'A', name: 'Morocco', subRegion: 'Northern Africa' }, // Elevated to Tier A - FTA partner
  DZA: { gdp: 195, tier: 'A', name: 'Algeria', subRegion: 'Northern Africa' }, // Elevated to Tier A - energy partner
  TUN: { gdp: 46, tier: 'A', name: 'Tunisia', subRegion: 'Northern Africa' }, // Elevated to Tier A - nearshoring hub
  
  // Tier B - Major economies with regional benchmarks
  AGO: { gdp: 117, tier: 'B', name: 'Angola', subRegion: 'Southern Africa' },
  SDN: { gdp: 51, tier: 'B', name: 'Sudan', subRegion: 'Northern Africa' },
  LBY: { gdp: 45, tier: 'B', name: 'Libya', subRegion: 'Northern Africa' },
  COD: { gdp: 64, tier: 'B', name: 'DR Congo', subRegion: 'Central Africa' },
  CMR: { gdp: 45, tier: 'B', name: 'Cameroon', subRegion: 'Central Africa' },
  UGA: { gdp: 45, tier: 'B', name: 'Uganda', subRegion: 'Eastern Africa' },
  ZMB: { gdp: 29, tier: 'B', name: 'Zambia', subRegion: 'Southern Africa' },
  ZWE: { gdp: 21, tier: 'B', name: 'Zimbabwe', subRegion: 'Southern Africa' },
  BWA: { gdp: 19, tier: 'B', name: 'Botswana', subRegion: 'Southern Africa' },
  GAB: { gdp: 21, tier: 'B', name: 'Gabon', subRegion: 'Central Africa' },
  MUS: { gdp: 14, tier: 'B', name: 'Mauritius', subRegion: 'Eastern Africa' },
  NAM: { gdp: 13, tier: 'B', name: 'Namibia', subRegion: 'Southern Africa' },
  MOZ: { gdp: 18, tier: 'B', name: 'Mozambique', subRegion: 'Southern Africa' },
  
  // Tier C - Smaller economies with conservative projections
  MLI: { gdp: 19, tier: 'C', name: 'Mali', subRegion: 'Western Africa' },
  BFA: { gdp: 19, tier: 'C', name: 'Burkina Faso', subRegion: 'Western Africa' },
  NER: { gdp: 15, tier: 'C', name: 'Niger', subRegion: 'Western Africa' },
  GIN: { gdp: 16, tier: 'C', name: 'Guinea', subRegion: 'Western Africa' },
  BEN: { gdp: 17, tier: 'C', name: 'Benin', subRegion: 'Western Africa' },
  TGO: { gdp: 8, tier: 'C', name: 'Togo', subRegion: 'Western Africa' },
  SLE: { gdp: 4, tier: 'C', name: 'Sierra Leone', subRegion: 'Western Africa' },
  LBR: { gdp: 4, tier: 'C', name: 'Liberia', subRegion: 'Western Africa' },
  MRT: { gdp: 9, tier: 'C', name: 'Mauritania', subRegion: 'Western Africa' },
  GMB: { gdp: 2, tier: 'C', name: 'Gambia', subRegion: 'Western Africa' },
  GNB: { gdp: 2, tier: 'C', name: 'Guinea-Bissau', subRegion: 'Western Africa' },
  CPV: { gdp: 2, tier: 'C', name: 'Cape Verde', subRegion: 'Western Africa' },
  RWA: { gdp: 13, tier: 'C', name: 'Rwanda', subRegion: 'Eastern Africa' },
  BDI: { gdp: 3, tier: 'C', name: 'Burundi', subRegion: 'Eastern Africa' },
  SOM: { gdp: 8, tier: 'C', name: 'Somalia', subRegion: 'Eastern Africa' },
  DJI: { gdp: 4, tier: 'C', name: 'Djibouti', subRegion: 'Eastern Africa' },
  ERI: { gdp: 2, tier: 'C', name: 'Eritrea', subRegion: 'Eastern Africa' },
  MDG: { gdp: 15, tier: 'C', name: 'Madagascar', subRegion: 'Eastern Africa' },
  COM: { gdp: 1, tier: 'C', name: 'Comoros', subRegion: 'Eastern Africa' },
  SYC: { gdp: 2, tier: 'C', name: 'Seychelles', subRegion: 'Eastern Africa' },
  SSD: { gdp: 5, tier: 'C', name: 'South Sudan', subRegion: 'Eastern Africa' },
  CAF: { gdp: 3, tier: 'C', name: 'Central African Republic', subRegion: 'Central Africa' },
  COG: { gdp: 14, tier: 'C', name: 'Republic of Congo', subRegion: 'Central Africa' },
  GNQ: { gdp: 12, tier: 'C', name: 'Equatorial Guinea', subRegion: 'Central Africa' },
  STP: { gdp: 1, tier: 'C', name: 'São Tomé and Príncipe', subRegion: 'Central Africa' },
  TCD: { gdp: 12, tier: 'C', name: 'Chad', subRegion: 'Central Africa' },
  LSO: { gdp: 3, tier: 'C', name: 'Lesotho', subRegion: 'Southern Africa' },
  SWZ: { gdp: 5, tier: 'C', name: 'Eswatini', subRegion: 'Southern Africa' },
  MWI: { gdp: 14, tier: 'C', name: 'Malawi', subRegion: 'Southern Africa' },
};

// Category-specific import multipliers (% of GDP that goes to imports in this category)
export const CATEGORY_IMPORT_MULTIPLIERS = {
  machinery: 0.022,      // Agricultural & Mining Machinery
  grains: 0.015,         // Grains & Cereals
  fertilizers: 0.008,    // Fertilizers & Agri-inputs
  pharma: 0.012,         // Pharmaceuticals
  transport: 0.025,      // Transport & Commercial Vehicles
  intermediate: 0.018,   // Intermediate Goods
  cotton: 0.005,         // Cotton & Raw Textiles
  textiles_inputs: 0.006, // Textile Inputs
  ict: 0.015,            // ICT & Telecommunications
  medical_devices: 0.008, // Medical Devices
};

// US market share benchmarks by region and category (%)
export const US_SHARE_BENCHMARKS: Record<string, Record<string, number>> = {
  'Northern Africa': {
    machinery: 8, grains: 25, fertilizers: 12, pharma: 15, transport: 10, 
    intermediate: 7, cotton: 15, textiles_inputs: 8, ict: 12, medical_devices: 20,
  },
  'Western Africa': {
    machinery: 12, grains: 30, fertilizers: 22, pharma: 18, transport: 10,
    intermediate: 8, cotton: 18, textiles_inputs: 10, ict: 14, medical_devices: 22,
  },
  'Eastern Africa': {
    machinery: 14, grains: 35, fertilizers: 20, pharma: 25, transport: 9,
    intermediate: 8, cotton: 15, textiles_inputs: 10, ict: 15, medical_devices: 28,
  },
  'Central Africa': {
    machinery: 10, grains: 22, fertilizers: 18, pharma: 15, transport: 8,
    intermediate: 6, cotton: 12, textiles_inputs: 8, ict: 10, medical_devices: 18,
  },
  'Southern Africa': {
    machinery: 15, grains: 28, fertilizers: 24, pharma: 22, transport: 12,
    intermediate: 10, cotton: 20, textiles_inputs: 12, ict: 16, medical_devices: 30,
  },
};

// US benchmark share targets (what US could achieve with better market access)
export const US_BENCHMARK_TARGETS: Record<string, number> = {
  machinery: 35, grains: 65, fertilizers: 45, pharma: 45, transport: 25,
  intermediate: 25, cotton: 40, textiles_inputs: 30, ict: 30, medical_devices: 45,
};

// Top suppliers by region (for generating realistic supplier data)
export const REGIONAL_TOP_SUPPLIERS: Record<string, Array<{ country: string; iso3: string; shareRange: [number, number] }>> = {
  'Northern Africa': [
    { country: 'China', iso3: 'CHN', shareRange: [30, 45] },
    { country: 'France', iso3: 'FRA', shareRange: [12, 22] },
    { country: 'Germany', iso3: 'DEU', shareRange: [8, 15] },
    { country: 'Italy', iso3: 'ITA', shareRange: [6, 12] },
    { country: 'Spain', iso3: 'ESP', shareRange: [4, 10] },
  ],
  'Western Africa': [
    { country: 'China', iso3: 'CHN', shareRange: [35, 50] },
    { country: 'India', iso3: 'IND', shareRange: [10, 18] },
    { country: 'France', iso3: 'FRA', shareRange: [6, 14] },
    { country: 'Netherlands', iso3: 'NLD', shareRange: [4, 10] },
    { country: 'Belgium', iso3: 'BEL', shareRange: [3, 8] },
  ],
  'Eastern Africa': [
    { country: 'China', iso3: 'CHN', shareRange: [32, 45] },
    { country: 'India', iso3: 'IND', shareRange: [12, 20] },
    { country: 'Japan', iso3: 'JPN', shareRange: [8, 15] },
    { country: 'UAE', iso3: 'ARE', shareRange: [5, 12] },
    { country: 'Saudi Arabia', iso3: 'SAU', shareRange: [4, 10] },
  ],
  'Central Africa': [
    { country: 'China', iso3: 'CHN', shareRange: [38, 52] },
    { country: 'France', iso3: 'FRA', shareRange: [12, 22] },
    { country: 'Belgium', iso3: 'BEL', shareRange: [6, 14] },
    { country: 'Cameroon', iso3: 'CMR', shareRange: [4, 10] },
    { country: 'Nigeria', iso3: 'NGA', shareRange: [3, 8] },
  ],
  'Southern Africa': [
    { country: 'China', iso3: 'CHN', shareRange: [28, 42] },
    { country: 'South Africa', iso3: 'ZAF', shareRange: [15, 28] },
    { country: 'Germany', iso3: 'DEU', shareRange: [8, 15] },
    { country: 'Japan', iso3: 'JPN', shareRange: [5, 12] },
    { country: 'India', iso3: 'IND', shareRange: [4, 10] },
  ],
};

// Category metadata
export const AFRICAN_DEMAND_CATEGORIES = {
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

export type AfricanDemandCategory = keyof typeof AFRICAN_DEMAND_CATEGORIES;
