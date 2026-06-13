/**
 * Phase 0.6 — Full AfCFTA Trade Flows Coverage
 * 
 * Expands AfCFTA Import-Export Intelligence from 12 to 54 African countries
 * using tiered data quality approach
 */

export type DataQualityTier = 'A' | 'B' | 'C';

// All 54 African countries with trade flow metadata
export const AFRICAN_COUNTRIES_FULL: Array<{
  iso3: string;
  name: string;
  region: string;
  subRegion: string;
  tier: DataQualityTier;
  gdpBillions: number;
  tradeOpenness: number; // Trade as % of GDP
}> = [
  // Northern Africa (6)
  { iso3: 'MAR', name: 'Morocco', region: 'Africa', subRegion: 'Northern Africa', tier: 'A', gdpBillions: 134, tradeOpenness: 0.85 },
  { iso3: 'DZA', name: 'Algeria', region: 'Africa', subRegion: 'Northern Africa', tier: 'B', gdpBillions: 195, tradeOpenness: 0.55 },
  { iso3: 'TUN', name: 'Tunisia', region: 'Africa', subRegion: 'Northern Africa', tier: 'B', gdpBillions: 46, tradeOpenness: 0.90 },
  { iso3: 'LBY', name: 'Libya', region: 'Africa', subRegion: 'Northern Africa', tier: 'C', gdpBillions: 45, tradeOpenness: 0.70 },
  { iso3: 'EGY', name: 'Egypt', region: 'Africa', subRegion: 'Northern Africa', tier: 'A', gdpBillions: 387, tradeOpenness: 0.45 },
  { iso3: 'SDN', name: 'Sudan', region: 'Africa', subRegion: 'Northern Africa', tier: 'C', gdpBillions: 51, tradeOpenness: 0.25 },
  
  // Western Africa (16)
  { iso3: 'NGA', name: 'Nigeria', region: 'Africa', subRegion: 'Western Africa', tier: 'A', gdpBillions: 477, tradeOpenness: 0.35 },
  { iso3: 'GHA', name: 'Ghana', region: 'Africa', subRegion: 'Western Africa', tier: 'A', gdpBillions: 76, tradeOpenness: 0.75 },
  { iso3: 'CIV', name: "Côte d'Ivoire", region: 'Africa', subRegion: 'Western Africa', tier: 'A', gdpBillions: 70, tradeOpenness: 0.65 },
  { iso3: 'SEN', name: 'Senegal', region: 'Africa', subRegion: 'Western Africa', tier: 'A', gdpBillions: 28, tradeOpenness: 0.60 },
  { iso3: 'MLI', name: 'Mali', region: 'Africa', subRegion: 'Western Africa', tier: 'C', gdpBillions: 19, tradeOpenness: 0.50 },
  { iso3: 'BFA', name: 'Burkina Faso', region: 'Africa', subRegion: 'Western Africa', tier: 'C', gdpBillions: 19, tradeOpenness: 0.45 },
  { iso3: 'NER', name: 'Niger', region: 'Africa', subRegion: 'Western Africa', tier: 'C', gdpBillions: 15, tradeOpenness: 0.40 },
  { iso3: 'GIN', name: 'Guinea', region: 'Africa', subRegion: 'Western Africa', tier: 'C', gdpBillions: 16, tradeOpenness: 0.65 },
  { iso3: 'SLE', name: 'Sierra Leone', region: 'Africa', subRegion: 'Western Africa', tier: 'C', gdpBillions: 4, tradeOpenness: 0.55 },
  { iso3: 'LBR', name: 'Liberia', region: 'Africa', subRegion: 'Western Africa', tier: 'C', gdpBillions: 4, tradeOpenness: 0.85 },
  { iso3: 'TGO', name: 'Togo', region: 'Africa', subRegion: 'Western Africa', tier: 'C', gdpBillions: 8, tradeOpenness: 0.90 },
  { iso3: 'BEN', name: 'Benin', region: 'Africa', subRegion: 'Western Africa', tier: 'B', gdpBillions: 17, tradeOpenness: 0.55 },
  { iso3: 'GMB', name: 'Gambia', region: 'Africa', subRegion: 'Western Africa', tier: 'C', gdpBillions: 2, tradeOpenness: 0.50 },
  { iso3: 'GNB', name: 'Guinea-Bissau', region: 'Africa', subRegion: 'Western Africa', tier: 'C', gdpBillions: 2, tradeOpenness: 0.45 },
  { iso3: 'CPV', name: 'Cape Verde', region: 'Africa', subRegion: 'Western Africa', tier: 'C', gdpBillions: 2, tradeOpenness: 0.80 },
  { iso3: 'MRT', name: 'Mauritania', region: 'Africa', subRegion: 'Western Africa', tier: 'C', gdpBillions: 9, tradeOpenness: 0.75 },
  
  // Eastern Africa (14)
  { iso3: 'ETH', name: 'Ethiopia', region: 'Africa', subRegion: 'Eastern Africa', tier: 'A', gdpBillions: 156, tradeOpenness: 0.30 },
  { iso3: 'KEN', name: 'Kenya', region: 'Africa', subRegion: 'Eastern Africa', tier: 'A', gdpBillions: 113, tradeOpenness: 0.40 },
  { iso3: 'TZA', name: 'Tanzania', region: 'Africa', subRegion: 'Eastern Africa', tier: 'A', gdpBillions: 75, tradeOpenness: 0.35 },
  { iso3: 'UGA', name: 'Uganda', region: 'Africa', subRegion: 'Eastern Africa', tier: 'B', gdpBillions: 45, tradeOpenness: 0.45 },
  { iso3: 'RWA', name: 'Rwanda', region: 'Africa', subRegion: 'Eastern Africa', tier: 'B', gdpBillions: 13, tradeOpenness: 0.55 },
  { iso3: 'BDI', name: 'Burundi', region: 'Africa', subRegion: 'Eastern Africa', tier: 'C', gdpBillions: 3, tradeOpenness: 0.35 },
  { iso3: 'SOM', name: 'Somalia', region: 'Africa', subRegion: 'Eastern Africa', tier: 'C', gdpBillions: 8, tradeOpenness: 0.55 },
  { iso3: 'DJI', name: 'Djibouti', region: 'Africa', subRegion: 'Eastern Africa', tier: 'C', gdpBillions: 4, tradeOpenness: 0.85 },
  { iso3: 'ERI', name: 'Eritrea', region: 'Africa', subRegion: 'Eastern Africa', tier: 'C', gdpBillions: 2, tradeOpenness: 0.25 },
  { iso3: 'MDG', name: 'Madagascar', region: 'Africa', subRegion: 'Eastern Africa', tier: 'B', gdpBillions: 15, tradeOpenness: 0.55 },
  { iso3: 'COM', name: 'Comoros', region: 'Africa', subRegion: 'Eastern Africa', tier: 'C', gdpBillions: 1, tradeOpenness: 0.45 },
  { iso3: 'MUS', name: 'Mauritius', region: 'Africa', subRegion: 'Eastern Africa', tier: 'B', gdpBillions: 14, tradeOpenness: 1.00 },
  { iso3: 'SYC', name: 'Seychelles', region: 'Africa', subRegion: 'Eastern Africa', tier: 'C', gdpBillions: 2, tradeOpenness: 1.20 },
  { iso3: 'SSD', name: 'South Sudan', region: 'Africa', subRegion: 'Eastern Africa', tier: 'C', gdpBillions: 5, tradeOpenness: 0.40 },
  
  // Central Africa (9)
  { iso3: 'CMR', name: 'Cameroon', region: 'Africa', subRegion: 'Central Africa', tier: 'A', gdpBillions: 45, tradeOpenness: 0.45 },
  { iso3: 'CAF', name: 'Central African Republic', region: 'Africa', subRegion: 'Central Africa', tier: 'C', gdpBillions: 3, tradeOpenness: 0.35 },
  { iso3: 'COD', name: 'DR Congo', region: 'Africa', subRegion: 'Central Africa', tier: 'B', gdpBillions: 64, tradeOpenness: 0.70 },
  { iso3: 'COG', name: 'Republic of Congo', region: 'Africa', subRegion: 'Central Africa', tier: 'C', gdpBillions: 14, tradeOpenness: 0.95 },
  { iso3: 'GAB', name: 'Gabon', region: 'Africa', subRegion: 'Central Africa', tier: 'B', gdpBillions: 21, tradeOpenness: 0.75 },
  { iso3: 'GNQ', name: 'Equatorial Guinea', region: 'Africa', subRegion: 'Central Africa', tier: 'C', gdpBillions: 12, tradeOpenness: 0.90 },
  { iso3: 'STP', name: 'São Tomé and Príncipe', region: 'Africa', subRegion: 'Central Africa', tier: 'C', gdpBillions: 1, tradeOpenness: 0.65 },
  { iso3: 'TCD', name: 'Chad', region: 'Africa', subRegion: 'Central Africa', tier: 'C', gdpBillions: 12, tradeOpenness: 0.55 },
  { iso3: 'AGO', name: 'Angola', region: 'Africa', subRegion: 'Central Africa', tier: 'A', gdpBillions: 117, tradeOpenness: 0.55 },
  
  // Southern Africa (9)
  { iso3: 'ZAF', name: 'South Africa', region: 'Africa', subRegion: 'Southern Africa', tier: 'A', gdpBillions: 399, tradeOpenness: 0.60 },
  { iso3: 'BWA', name: 'Botswana', region: 'Africa', subRegion: 'Southern Africa', tier: 'B', gdpBillions: 19, tradeOpenness: 0.80 },
  { iso3: 'LSO', name: 'Lesotho', region: 'Africa', subRegion: 'Southern Africa', tier: 'C', gdpBillions: 3, tradeOpenness: 0.90 },
  { iso3: 'SWZ', name: 'Eswatini', region: 'Africa', subRegion: 'Southern Africa', tier: 'C', gdpBillions: 5, tradeOpenness: 0.85 },
  { iso3: 'NAM', name: 'Namibia', region: 'Africa', subRegion: 'Southern Africa', tier: 'B', gdpBillions: 13, tradeOpenness: 0.75 },
  { iso3: 'ZWE', name: 'Zimbabwe', region: 'Africa', subRegion: 'Southern Africa', tier: 'B', gdpBillions: 21, tradeOpenness: 0.55 },
  { iso3: 'MOZ', name: 'Mozambique', region: 'Africa', subRegion: 'Southern Africa', tier: 'B', gdpBillions: 18, tradeOpenness: 0.95 },
  { iso3: 'ZMB', name: 'Zambia', region: 'Africa', subRegion: 'Southern Africa', tier: 'B', gdpBillions: 29, tradeOpenness: 0.70 },
  { iso3: 'MWI', name: 'Malawi', region: 'Africa', subRegion: 'Southern Africa', tier: 'C', gdpBillions: 14, tradeOpenness: 0.50 },
];

// Original 12 trading hubs (Tier A for flows)
export const TIER_A_HUBS = ['ZAF', 'NGA', 'EGY', 'KEN', 'GHA', 'MAR', 'ETH', 'TZA', 'CIV', 'SEN', 'AGO', 'CMR'];

// AfCFTA category base values by GDP tier
export const AFCFTA_CATEGORY_MULTIPLIERS: Record<string, { importMult: number; exportMult: number; africaShareRange: [number, number] }> = {
  machinery: { importMult: 0.035, exportMult: 0.012, africaShareRange: [12, 28] },
  minerals: { importMult: 0.015, exportMult: 0.045, africaShareRange: [8, 18] },
  petroleum: { importMult: 0.055, exportMult: 0.035, africaShareRange: [5, 15] },
  agriculture: { importMult: 0.025, exportMult: 0.030, africaShareRange: [22, 45] },
  textiles: { importMult: 0.012, exportMult: 0.008, africaShareRange: [18, 35] },
  chemicals: { importMult: 0.020, exportMult: 0.015, africaShareRange: [15, 32] },
  vehicles: { importMult: 0.018, exportMult: 0.006, africaShareRange: [12, 28] },
  electronics: { importMult: 0.022, exportMult: 0.005, africaShareRange: [10, 22] },
};

// Top trading partners by sub-region
export const AFCFTA_REGIONAL_PARTNERS: Record<string, Array<{ iso3: string; country: string }>> = {
  'Southern Africa': [
    { iso3: 'ZAF', country: 'South Africa' },
    { iso3: 'BWA', country: 'Botswana' },
    { iso3: 'NAM', country: 'Namibia' },
    { iso3: 'ZMB', country: 'Zambia' },
    { iso3: 'MOZ', country: 'Mozambique' },
  ],
  'Western Africa': [
    { iso3: 'NGA', country: 'Nigeria' },
    { iso3: 'GHA', country: 'Ghana' },
    { iso3: 'CIV', country: "Côte d'Ivoire" },
    { iso3: 'SEN', country: 'Senegal' },
    { iso3: 'BEN', country: 'Benin' },
  ],
  'Eastern Africa': [
    { iso3: 'KEN', country: 'Kenya' },
    { iso3: 'TZA', country: 'Tanzania' },
    { iso3: 'UGA', country: 'Uganda' },
    { iso3: 'ETH', country: 'Ethiopia' },
    { iso3: 'RWA', country: 'Rwanda' },
  ],
  'Northern Africa': [
    { iso3: 'EGY', country: 'Egypt' },
    { iso3: 'MAR', country: 'Morocco' },
    { iso3: 'TUN', country: 'Tunisia' },
    { iso3: 'DZA', country: 'Algeria' },
    { iso3: 'LBY', country: 'Libya' },
  ],
  'Central Africa': [
    { iso3: 'CMR', country: 'Cameroon' },
    { iso3: 'COD', country: 'DR Congo' },
    { iso3: 'GAB', country: 'Gabon' },
    { iso3: 'COG', country: 'Congo' },
    { iso3: 'AGO', country: 'Angola' },
  ],
};

// Generic top products by category (for Tier B/C countries without specific data)
export const GENERIC_TOP_PRODUCTS: Record<string, { imports: Array<{ hsCode: string; description: string; sharePct: number }>; exports: Array<{ hsCode: string; description: string; sharePct: number }> }> = {
  machinery: {
    imports: [
      { hsCode: '8429', description: 'Self-propelled bulldozers, excavators', sharePct: 22 },
      { hsCode: '8471', description: 'Computers and processing units', sharePct: 18 },
      { hsCode: '8502', description: 'Electric generating sets', sharePct: 15 },
    ],
    exports: [
      { hsCode: '8474', description: 'Machinery for sorting, screening', sharePct: 25 },
      { hsCode: '8429', description: 'Self-propelled bulldozers', sharePct: 20 },
    ],
  },
  minerals: {
    imports: [
      { hsCode: '2523', description: 'Portland cement', sharePct: 35 },
      { hsCode: '7210', description: 'Flat-rolled iron or steel', sharePct: 28 },
    ],
    exports: [
      { hsCode: '7108', description: 'Gold, unwrought or powder', sharePct: 45 },
      { hsCode: '2601', description: 'Iron ores and concentrates', sharePct: 25 },
    ],
  },
  petroleum: {
    imports: [
      { hsCode: '2710', description: 'Petroleum oils, refined', sharePct: 72 },
      { hsCode: '2711', description: 'Petroleum gases', sharePct: 18 },
    ],
    exports: [
      { hsCode: '2709', description: 'Petroleum oils, crude', sharePct: 75 },
      { hsCode: '2711', description: 'Liquefied natural gas', sharePct: 15 },
    ],
  },
  agriculture: {
    imports: [
      { hsCode: '1001', description: 'Wheat and meslin', sharePct: 28 },
      { hsCode: '1006', description: 'Rice', sharePct: 22 },
      { hsCode: '0303', description: 'Fish, frozen', sharePct: 15 },
    ],
    exports: [
      { hsCode: '1801', description: 'Cocoa beans', sharePct: 30 },
      { hsCode: '0901', description: 'Coffee, not roasted', sharePct: 22 },
      { hsCode: '0603', description: 'Cut flowers', sharePct: 15 },
    ],
  },
  textiles: {
    imports: [
      { hsCode: '5208', description: 'Woven fabrics of cotton', sharePct: 32 },
      { hsCode: '6109', description: 'T-shirts, singlets, knitted', sharePct: 25 },
    ],
    exports: [
      { hsCode: '5201', description: 'Cotton, not carded', sharePct: 40 },
      { hsCode: '6109', description: 'T-shirts and vests', sharePct: 28 },
    ],
  },
  chemicals: {
    imports: [
      { hsCode: '3004', description: 'Medicaments, packaged', sharePct: 32 },
      { hsCode: '3105', description: 'Mineral or chemical fertilizers', sharePct: 25 },
    ],
    exports: [
      { hsCode: '3105', description: 'Mineral or chemical fertilizers', sharePct: 35 },
      { hsCode: '3004', description: 'Medicaments, packaged', sharePct: 25 },
    ],
  },
  vehicles: {
    imports: [
      { hsCode: '8703', description: 'Motor cars for persons', sharePct: 42 },
      { hsCode: '8704', description: 'Motor vehicles for goods', sharePct: 32 },
    ],
    exports: [
      { hsCode: '8703', description: 'Motor cars for persons', sharePct: 45 },
      { hsCode: '8708', description: 'Parts and accessories', sharePct: 30 },
    ],
  },
  electronics: {
    imports: [
      { hsCode: '8517', description: 'Telephones and communication', sharePct: 42 },
      { hsCode: '8471', description: 'Computers', sharePct: 25 },
    ],
    exports: [
      { hsCode: '8517', description: 'Telephones and communication', sharePct: 35 },
      { hsCode: '8544', description: 'Insulated wire, cable', sharePct: 25 },
    ],
  },
};
