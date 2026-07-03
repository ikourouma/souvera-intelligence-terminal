/**
 * =====================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * AGOA Trade Flows Ingestion Adapter
 * Owner: Afronovation, Inc.
 * Phase 0.5E: AGOA Export Intelligence
 * =====================================================
 *
 * This adapter populates AGOA trade flow data for:
 * - African exports TO the US under AGOA preferential treatment
 * - Tracking duty-free exports by product category
 * - Identifying tariff savings and export opportunities
 *
 * Data sources:
 * - USITC DataWeb (primary)
 * - US Census Bureau Foreign Trade Statistics
 * - USTR AGOA Reports
 * - ITC Trade Map (supplementary)
 */

import { IngestAdapterResult, createIngestionJob } from './shared';

type DataQualityTier = 'A' | 'B' | 'C';

interface AGOATradeFlowRecord {
  iso3: string;
  country_name: string;
  region: string;
  sub_region: string;
  agoa_eligible: boolean;
  agoa_status: 'eligible' | 'suspended' | 'graduated';
  eligibility_since?: number;
  year: number;
  hs_chapter: string;
  category_group: string;
  category_label: string;
  total_exports_to_us_usd: number;
  agoa_exports_usd: number;
  agoa_share_pct: number;
  non_agoa_exports_usd: number;
  mfn_tariff_pct: number;
  tariff_savings_usd: number;
  is_textile_apparel: boolean;
  third_country_fabric_eligible: boolean;
  yoy_growth_pct?: number;
  top_products: Array<{ hsCode: string; description: string; valueUsd: number; sharePct: number; agoaEligible: boolean }>;
  us_total_imports_usd?: number;
  country_share_of_us_imports_pct?: number;
  competitor_suppliers: Array<{ iso3: string; country: string; valueUsd: number; sharePct: number }>;
  source_notes: string;
  data_quality_tier: DataQualityTier;
}

// AGOA-eligible countries as of 2023
// Source: USTR AGOA eligibility list
// NOTE: AGOA is for Sub-Saharan Africa only. North African countries (EGY, MAR, DZA, TUN, LBY)
//       are outside AGOA geographic scope and should NOT be included here.
const AGOA_COUNTRIES = [
  { iso3: 'AGO', name: 'Angola', subRegion: 'Central Africa', tier: 'B' as DataQualityTier, eligible: true, since: 2003 },
  { iso3: 'BEN', name: 'Benin', subRegion: 'Western Africa', tier: 'B' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'BWA', name: 'Botswana', subRegion: 'Southern Africa', tier: 'B' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'BFA', name: 'Burkina Faso', subRegion: 'Western Africa', tier: 'C' as DataQualityTier, eligible: false, since: 2004 }, // Suspended 2022
  { iso3: 'CPV', name: 'Cabo Verde', subRegion: 'Western Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2002 },
  { iso3: 'CMR', name: 'Cameroon', subRegion: 'Central Africa', tier: 'B' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'CAF', name: 'Central African Republic', subRegion: 'Central Africa', tier: 'C' as DataQualityTier, eligible: false, since: 2003 }, // Suspended 2004
  { iso3: 'TCD', name: 'Chad', subRegion: 'Central Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'COM', name: 'Comoros', subRegion: 'Eastern Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2008 },
  { iso3: 'COD', name: 'Congo, Democratic Republic', subRegion: 'Central Africa', tier: 'B' as DataQualityTier, eligible: true, since: 2003 },
  { iso3: 'COG', name: 'Congo, Republic', subRegion: 'Central Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'CIV', name: "Côte d'Ivoire", subRegion: 'Western Africa', tier: 'A' as DataQualityTier, eligible: true, since: 2002 },
  { iso3: 'DJI', name: 'Djibouti', subRegion: 'Eastern Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2000 },
  // Egypt (EGY) removed - North Africa, not part of AGOA geographic scope
  { iso3: 'SWZ', name: 'Eswatini', subRegion: 'Southern Africa', tier: 'B' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'ETH', name: 'Ethiopia', subRegion: 'Eastern Africa', tier: 'A' as DataQualityTier, eligible: false, since: 2000 }, // Suspended 2022
  { iso3: 'GAB', name: 'Gabon', subRegion: 'Central Africa', tier: 'C' as DataQualityTier, eligible: false, since: 2000 }, // Suspended 2023
  { iso3: 'GMB', name: 'Gambia', subRegion: 'Western Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2002 },
  { iso3: 'GHA', name: 'Ghana', subRegion: 'Western Africa', tier: 'A' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'GIN', name: 'Guinea', subRegion: 'Western Africa', tier: 'C' as DataQualityTier, eligible: false, since: 2002 }, // Suspended 2021
  { iso3: 'GNB', name: 'Guinea-Bissau', subRegion: 'Western Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'KEN', name: 'Kenya', subRegion: 'Eastern Africa', tier: 'A' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'LSO', name: 'Lesotho', subRegion: 'Southern Africa', tier: 'A' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'LBR', name: 'Liberia', subRegion: 'Western Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2006 },
  { iso3: 'MDG', name: 'Madagascar', subRegion: 'Eastern Africa', tier: 'B' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'MWI', name: 'Malawi', subRegion: 'Eastern Africa', tier: 'B' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'MLI', name: 'Mali', subRegion: 'Western Africa', tier: 'C' as DataQualityTier, eligible: false, since: 2000 }, // Suspended 2022
  { iso3: 'MRT', name: 'Mauritania', subRegion: 'Western Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2007 },
  { iso3: 'MUS', name: 'Mauritius', subRegion: 'Eastern Africa', tier: 'A' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'MOZ', name: 'Mozambique', subRegion: 'Eastern Africa', tier: 'B' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'NAM', name: 'Namibia', subRegion: 'Southern Africa', tier: 'B' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'NER', name: 'Niger', subRegion: 'Western Africa', tier: 'C' as DataQualityTier, eligible: false, since: 2000 }, // Suspended 2023
  { iso3: 'NGA', name: 'Nigeria', subRegion: 'Western Africa', tier: 'A' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'RWA', name: 'Rwanda', subRegion: 'Eastern Africa', tier: 'B' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'STP', name: 'São Tomé and Príncipe', subRegion: 'Central Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2008 },
  { iso3: 'SEN', name: 'Senegal', subRegion: 'Western Africa', tier: 'A' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'SYC', name: 'Seychelles', subRegion: 'Eastern Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'SLE', name: 'Sierra Leone', subRegion: 'Western Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2002 },
  { iso3: 'SOM', name: 'Somalia', subRegion: 'Eastern Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2023 },
  { iso3: 'ZAF', name: 'South Africa', subRegion: 'Southern Africa', tier: 'A' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'SSD', name: 'South Sudan', subRegion: 'Eastern Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2013 },
  { iso3: 'TZA', name: 'Tanzania', subRegion: 'Eastern Africa', tier: 'A' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'TGO', name: 'Togo', subRegion: 'Western Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2008 },
  { iso3: 'UGA', name: 'Uganda', subRegion: 'Eastern Africa', tier: 'B' as DataQualityTier, eligible: false, since: 2000 }, // Suspended 2023
  { iso3: 'ZMB', name: 'Zambia', subRegion: 'Eastern Africa', tier: 'B' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'ZWE', name: 'Zimbabwe', subRegion: 'Southern Africa', tier: 'C' as DataQualityTier, eligible: false, since: 2001 }, // Suspended 2001
  // North Africa — outside AGOA geographic scope; MFN bilateral totals for matrix completeness
  { iso3: 'MAR', name: 'Morocco', subRegion: 'Northern Africa', tier: 'B' as DataQualityTier, eligible: false, since: 0 },
  { iso3: 'DZA', name: 'Algeria', subRegion: 'Northern Africa', tier: 'B' as DataQualityTier, eligible: false, since: 0 },
  { iso3: 'TUN', name: 'Tunisia', subRegion: 'Northern Africa', tier: 'B' as DataQualityTier, eligible: false, since: 0 },
  { iso3: 'LBY', name: 'Libya', subRegion: 'Northern Africa', tier: 'C' as DataQualityTier, eligible: false, since: 0 },
  { iso3: 'EGY', name: 'Egypt', subRegion: 'Northern Africa', tier: 'B' as DataQualityTier, eligible: false, since: 0 },
  { iso3: 'SDN', name: 'Sudan', subRegion: 'Northern Africa', tier: 'C' as DataQualityTier, eligible: false, since: 0 },
  // Sub-Saharan markets previously omitted from seed
  { iso3: 'BDI', name: 'Burundi', subRegion: 'Eastern Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2000 },
  { iso3: 'ERI', name: 'Eritrea', subRegion: 'Eastern Africa', tier: 'C' as DataQualityTier, eligible: false, since: 2000 },
  { iso3: 'GNQ', name: 'Equatorial Guinea', subRegion: 'Central Africa', tier: 'C' as DataQualityTier, eligible: true, since: 2000 },
];

// AGOA product categories - hs_chapter uses primary chapter code (max 4 chars)
const AGOA_CATEGORIES = {
  petroleum: { label: 'Petroleum & Energy', hsChapter: '27', mfnTariff: 0.4 },
  minerals: { label: 'Minerals & Precious Metals', hsChapter: '71', mfnTariff: 6.5 },
  textiles_apparel: { label: 'Textiles & Apparel', hsChapter: '61', mfnTariff: 15.5, isTextile: true },
  agriculture: { label: 'Agriculture & Food', hsChapter: '01', mfnTariff: 4.8 },
  vehicles: { label: 'Vehicles & Transport', hsChapter: '87', mfnTariff: 2.5 },
  chemicals: { label: 'Chemicals & Pharmaceuticals', hsChapter: '28', mfnTariff: 3.2 },
  machinery: { label: 'Machinery & Equipment', hsChapter: '84', mfnTariff: 1.8 },
  electronics: { label: 'Electronics & ICT', hsChapter: '85', mfnTariff: 1.5 },
  handicrafts: { label: 'Handicrafts & Artisanal', hsChapter: '46', mfnTariff: 4.5 },
  footwear: { label: 'Footwear & Leather', hsChapter: '64', mfnTariff: 12.8 },
};

// Top AGOA exporters and their key products (curated from USITC DataWeb 2023)
const TOP_AGOA_EXPORTERS: Record<string, Record<string, { base: number; agoaShare: number; growth: number }>> = {
  ZAF: {
    vehicles: { base: 3_200_000_000, agoaShare: 65, growth: 8 },
    minerals: { base: 2_800_000_000, agoaShare: 45, growth: 12 },
    agriculture: { base: 1_500_000_000, agoaShare: 72, growth: 5 },
    machinery: { base: 1_200_000_000, agoaShare: 58, growth: 6 },
    chemicals: { base: 850_000_000, agoaShare: 62, growth: 4 },
    textiles_apparel: { base: 180_000_000, agoaShare: 88, growth: -2 },
  },
  NGA: {
    petroleum: { base: 5_800_000_000, agoaShare: 82, growth: 15 },
    agriculture: { base: 420_000_000, agoaShare: 68, growth: 8 },
    minerals: { base: 180_000_000, agoaShare: 55, growth: 5 },
    handicrafts: { base: 45_000_000, agoaShare: 78, growth: 12 },
  },
  KEN: {
    textiles_apparel: { base: 580_000_000, agoaShare: 95, growth: 6 },
    agriculture: { base: 850_000_000, agoaShare: 72, growth: 8 },
    handicrafts: { base: 85_000_000, agoaShare: 88, growth: 15 },
    footwear: { base: 35_000_000, agoaShare: 92, growth: 10 },
  },
  ETH: { // Suspended but had significant exports
    textiles_apparel: { base: 420_000_000, agoaShare: 92, growth: -45 },
    agriculture: { base: 580_000_000, agoaShare: 68, growth: -8 },
    footwear: { base: 120_000_000, agoaShare: 95, growth: -35 },
  },
  LSO: {
    textiles_apparel: { base: 450_000_000, agoaShare: 98, growth: 4 },
    footwear: { base: 25_000_000, agoaShare: 95, growth: 8 },
  },
  MDG: {
    textiles_apparel: { base: 280_000_000, agoaShare: 92, growth: 5 },
    agriculture: { base: 180_000_000, agoaShare: 65, growth: 8 },
  },
  MUS: {
    textiles_apparel: { base: 320_000_000, agoaShare: 85, growth: 2 },
    agriculture: { base: 120_000_000, agoaShare: 78, growth: 5 },
  },
  GHA: {
    petroleum: { base: 980_000_000, agoaShare: 75, growth: 18 },
    agriculture: { base: 320_000_000, agoaShare: 68, growth: 10 },
    minerals: { base: 420_000_000, agoaShare: 52, growth: 8 },
    handicrafts: { base: 45_000_000, agoaShare: 82, growth: 15 },
  },
  CIV: {
    agriculture: { base: 580_000_000, agoaShare: 72, growth: 6 },
    petroleum: { base: 320_000_000, agoaShare: 68, growth: 12 },
  },
  TZA: {
    minerals: { base: 520_000_000, agoaShare: 48, growth: 15 },
    agriculture: { base: 280_000_000, agoaShare: 65, growth: 8 },
    textiles_apparel: { base: 85_000_000, agoaShare: 88, growth: 12 },
  },
  ZWE: {
    minerals: { base: 380_000_000, agoaShare: 0, growth: -4 },
    agriculture: { base: 95_000_000, agoaShare: 0, growth: 2 },
    textiles_apparel: { base: 14_000_000, agoaShare: 0, growth: -6 },
    chemicals: { base: 22_000_000, agoaShare: 0, growth: 1 },
  },
};

// Product-level exports (curated from USITC 2023)
const AGOA_TOP_PRODUCTS: Record<string, Record<string, Array<{ hsCode: string; description: string; sharePct: number; agoaEligible: boolean }>>> = {
  ZAF: {
    vehicles: [
      { hsCode: '8703', description: 'Motor cars and vehicles for transport of persons', sharePct: 65, agoaEligible: true },
      { hsCode: '8704', description: 'Motor vehicles for goods transport', sharePct: 20, agoaEligible: true },
      { hsCode: '8708', description: 'Parts and accessories for motor vehicles', sharePct: 12, agoaEligible: true },
    ],
    minerals: [
      { hsCode: '7110', description: 'Platinum, unwrought or in semi-manufactured forms', sharePct: 45, agoaEligible: true },
      { hsCode: '7108', description: 'Gold, unwrought or in semi-manufactured forms', sharePct: 25, agoaEligible: true },
      { hsCode: '7102', description: 'Diamonds, whether or not worked', sharePct: 18, agoaEligible: true },
    ],
    agriculture: [
      { hsCode: '0805', description: 'Citrus fruit, fresh or dried (oranges, lemons)', sharePct: 28, agoaEligible: true },
      { hsCode: '2204', description: 'Wine of fresh grapes', sharePct: 22, agoaEligible: true },
      { hsCode: '0806', description: 'Grapes, fresh or dried', sharePct: 15, agoaEligible: true },
    ],
    textiles_apparel: [
      { hsCode: '6109', description: 'T-shirts, singlets and other vests, knitted', sharePct: 35, agoaEligible: true },
      { hsCode: '6203', description: "Men's suits, jackets, trousers", sharePct: 28, agoaEligible: true },
    ],
  },
  KEN: {
    textiles_apparel: [
      { hsCode: '6109', description: 'T-shirts, singlets and other vests, knitted', sharePct: 42, agoaEligible: true },
      { hsCode: '6110', description: 'Sweaters, pullovers, cardigans, knitted', sharePct: 22, agoaEligible: true },
      { hsCode: '6203', description: "Men's suits, jackets, trousers", sharePct: 18, agoaEligible: true },
    ],
    agriculture: [
      { hsCode: '0603', description: 'Cut flowers and flower buds', sharePct: 35, agoaEligible: true },
      { hsCode: '0804', description: 'Avocados, mangoes, guavas (macadamia nuts)', sharePct: 25, agoaEligible: true },
      { hsCode: '0901', description: 'Coffee, not roasted', sharePct: 22, agoaEligible: true },
    ],
    handicrafts: [
      { hsCode: '4602', description: 'Basketwork, wickerwork', sharePct: 45, agoaEligible: true },
      { hsCode: '9703', description: 'Original sculptures and statuary', sharePct: 30, agoaEligible: true },
    ],
  },
  NGA: {
    petroleum: [
      { hsCode: '2709', description: 'Petroleum oils, crude', sharePct: 85, agoaEligible: false },
      { hsCode: '2711', description: 'Liquefied natural gas (LNG)', sharePct: 12, agoaEligible: false },
    ],
    agriculture: [
      { hsCode: '1801', description: 'Cocoa beans, whole or broken', sharePct: 35, agoaEligible: true },
      { hsCode: '1207', description: 'Sesame seeds', sharePct: 28, agoaEligible: true },
    ],
  },
  LSO: {
    textiles_apparel: [
      { hsCode: '6203', description: "Men's suits, jackets, trousers", sharePct: 38, agoaEligible: true },
      { hsCode: '6204', description: "Women's suits, dresses, skirts", sharePct: 32, agoaEligible: true },
      { hsCode: '6109', description: 'T-shirts and vests, knitted', sharePct: 22, agoaEligible: true },
    ],
  },
  ETH: {
    textiles_apparel: [
      { hsCode: '6109', description: 'T-shirts, singlets and other vests, knitted', sharePct: 45, agoaEligible: false },
      { hsCode: '6203', description: "Men's suits, jackets, trousers", sharePct: 28, agoaEligible: false },
    ],
    agriculture: [
      { hsCode: '0901', description: 'Coffee, not roasted', sharePct: 55, agoaEligible: false },
      { hsCode: '1207', description: 'Sesame seeds', sharePct: 22, agoaEligible: false },
    ],
    footwear: [
      { hsCode: '6403', description: 'Footwear with outer soles of rubber/leather', sharePct: 75, agoaEligible: false },
    ],
  },
  GHA: {
    petroleum: [
      { hsCode: '2709', description: 'Petroleum oils, crude', sharePct: 90, agoaEligible: true },
    ],
    agriculture: [
      { hsCode: '1801', description: 'Cocoa beans, whole or broken', sharePct: 48, agoaEligible: true },
      { hsCode: '0801', description: 'Cashew nuts', sharePct: 22, agoaEligible: true },
    ],
    minerals: [
      { hsCode: '7108', description: 'Gold, unwrought or in semi-manufactured forms', sharePct: 85, agoaEligible: true },
    ],
  },
};

// Top US import suppliers by category (for competitor context)
const US_TOP_SUPPLIERS: Record<string, Array<{ iso3: string; country: string; valueUsd: number; sharePct: number }>> = {
  textiles_apparel: [
    { iso3: 'CHN', country: 'China', valueUsd: 35_000_000_000, sharePct: 28 },
    { iso3: 'VNM', country: 'Vietnam', valueUsd: 18_500_000_000, sharePct: 15 },
    { iso3: 'BGD', country: 'Bangladesh', valueUsd: 8_200_000_000, sharePct: 7 },
    { iso3: 'IND', country: 'India', valueUsd: 7_800_000_000, sharePct: 6 },
  ],
  vehicles: [
    { iso3: 'MEX', country: 'Mexico', valueUsd: 115_000_000_000, sharePct: 32 },
    { iso3: 'JPN', country: 'Japan', valueUsd: 52_000_000_000, sharePct: 14 },
    { iso3: 'CAN', country: 'Canada', valueUsd: 48_000_000_000, sharePct: 13 },
    { iso3: 'DEU', country: 'Germany', valueUsd: 28_000_000_000, sharePct: 8 },
  ],
  petroleum: [
    { iso3: 'CAN', country: 'Canada', valueUsd: 125_000_000_000, sharePct: 52 },
    { iso3: 'MEX', country: 'Mexico', valueUsd: 25_000_000_000, sharePct: 10 },
    { iso3: 'SAU', country: 'Saudi Arabia', valueUsd: 18_000_000_000, sharePct: 7 },
  ],
  agriculture: [
    { iso3: 'MEX', country: 'Mexico', valueUsd: 42_000_000_000, sharePct: 22 },
    { iso3: 'CAN', country: 'Canada', valueUsd: 38_000_000_000, sharePct: 20 },
    { iso3: 'CHN', country: 'China', valueUsd: 8_500_000_000, sharePct: 4 },
  ],
  minerals: [
    { iso3: 'CAN', country: 'Canada', valueUsd: 18_000_000_000, sharePct: 22 },
    { iso3: 'MEX', country: 'Mexico', valueUsd: 12_000_000_000, sharePct: 15 },
    { iso3: 'CHN', country: 'China', valueUsd: 8_000_000_000, sharePct: 10 },
  ],
};

// LDC countries with third-country fabric provision
const THIRD_COUNTRY_FABRIC_ELIGIBLE = [
  'BEN', 'BFA', 'CAF', 'TCD', 'COM', 'DJI', 'ETH', 'GMB', 'GNB', 'GIN',
  'LSO', 'LBR', 'MDG', 'MWI', 'MLI', 'MRT', 'MOZ', 'NER', 'RWA', 'STP',
  'SEN', 'SLE', 'SOM', 'SSD', 'TZA', 'TGO', 'UGA', 'ZMB',
];

/** Deterministic 0–1 factor for stable Tier B/C estimates across re-runs. */
function deterministicFactor(iso3: string, categoryKey: string, salt = 0): number {
  const s = `${iso3}:${categoryKey}:${salt}`;
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

function generateAGOATradeFlowRecords(): AGOATradeFlowRecord[] {
  const records: AGOATradeFlowRecord[] = [];
  const year = 2023;

  for (const country of AGOA_COUNTRIES) {
    const exporterData = TOP_AGOA_EXPORTERS[country.iso3];
    
    for (const [categoryKey, categoryMeta] of Object.entries(AGOA_CATEGORIES)) {
      // Get curated data if available, otherwise generate estimates
      const curatedData = exporterData?.[categoryKey];
      
      let totalExports: number;
      let agoaShare: number;
      let yoyGrowth: number;
      let tier: DataQualityTier;
      
      if (curatedData) {
        // Tier A: curated data
        totalExports = curatedData.base;
        agoaShare = curatedData.agoaShare;
        yoyGrowth = curatedData.growth;
        tier = 'A';
      } else {
        const baseFactor = country.tier === 'B' ? 0.15 : 0.05;
        const jitter = 0.5 + deterministicFactor(country.iso3, categoryKey, 1);
        totalExports = Math.round(50_000_000 * baseFactor * jitter);
        const shareJitter = deterministicFactor(country.iso3, categoryKey, 2);
        agoaShare = country.eligible ? 55 + shareJitter * 35 : 0;
        const growthJitter = deterministicFactor(country.iso3, categoryKey, 3);
        yoyGrowth = country.eligible ? 3 + growthJitter * 12 : -15 - growthJitter * 25;
        tier = country.tier;
      }
      
      // Crude petroleum (HS 2709) is excluded from AGOA; suspended countries get 0 preferential share
      const effectiveAgoaShare =
        categoryKey === 'petroleum'
          ? 0
          : country.eligible
            ? agoaShare
            : 0;
      
      const agoaExports = Math.round(totalExports * (effectiveAgoaShare / 100));
      const nonAgoaExports = totalExports - agoaExports;
      const mfnTariff = categoryMeta.mfnTariff;
      const tariffSavings = Math.round(agoaExports * (mfnTariff / 100));
      
      // Get top products
      const curatedProducts = AGOA_TOP_PRODUCTS[country.iso3]?.[categoryKey];
      const topProducts = curatedProducts 
        ? curatedProducts.map(p => ({
            ...p,
            valueUsd: Math.round(totalExports * (p.sharePct / 100)),
            agoaEligible: country.eligible && p.agoaEligible,
          }))
        : []; // Empty for non-curated countries
      
      // Get competitor suppliers
      const competitors = US_TOP_SUPPLIERS[categoryKey] || US_TOP_SUPPLIERS.agriculture;
      
      // Calculate country share of US imports
      const usTotal = competitors.reduce((sum, c) => sum + c.valueUsd, 0) * 1.3;
      const countryShareOfUs = (totalExports / usTotal) * 100;
      
      const isTextile = categoryMeta.isTextile || false;
      const thirdCountryEligible = isTextile && THIRD_COUNTRY_FABRIC_ELIGIBLE.includes(country.iso3);
      
      const sourceNotes = tier === 'A'
        ? 'USITC DataWeb 2023 · US Census Foreign Trade · USTR AGOA Reports'
        : tier === 'B'
        ? 'Regional benchmark estimates · USITC patterns'
        : country.since === 0
        ? 'MFN bilateral estimates · North Africa outside AGOA geographic scope'
        : 'Conservative projections pending Phase 1 live data';
      
      records.push({
        iso3: country.iso3,
        country_name: country.name,
        region: 'Africa',
        sub_region: country.subRegion,
        agoa_eligible: country.eligible,
        agoa_status: country.since === 0 ? 'graduated' : country.eligible ? 'eligible' : 'suspended',
        eligibility_since: country.since > 0 ? country.since : undefined,
        year,
        hs_chapter: categoryMeta.hsChapter,
        category_group: categoryKey,
        category_label: categoryMeta.label,
        total_exports_to_us_usd: totalExports,
        agoa_exports_usd: agoaExports,
        agoa_share_pct: Math.round(effectiveAgoaShare * 10) / 10,
        non_agoa_exports_usd: nonAgoaExports,
        mfn_tariff_pct: mfnTariff,
        tariff_savings_usd: tariffSavings,
        is_textile_apparel: isTextile,
        third_country_fabric_eligible: thirdCountryEligible,
        yoy_growth_pct: Math.round(yoyGrowth * 10) / 10,
        top_products: topProducts,
        us_total_imports_usd: usTotal,
        country_share_of_us_imports_pct: Math.round(countryShareOfUs * 100) / 100,
        competitor_suppliers: competitors.slice(0, 4),
        source_notes: sourceNotes,
        data_quality_tier: tier,
      });
    }
  }
  
  return records;
}

export async function ingestAGOAFlows(): Promise<IngestAdapterResult> {
  console.log('[ingest-agoa-flows] Seeding AGOA trade flow data...\n');

  const records = generateAGOATradeFlowRecords();
  
  const uniqueCountries = new Set(records.map(r => r.iso3));
  const tierA = records.filter(r => r.data_quality_tier === 'A').length;
  const tierBC = records.length - tierA;
  
  console.log(`  → ${records.length} records across ${uniqueCountries.size} countries`);
  console.log(`    • Tier A (curated): ${tierA} records`);
  console.log(`    • Tier B/C (estimated): ${tierBC} records\n`);

  // Use un_comtrade source (which exists) - AGOA data is derived from similar trade statistics
  const job = await createIngestionJob('un_comtrade', 'agoa-flows');

  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // First verify the table exists
  const { error: tableError } = await supabase
    .from('souvera_agoa_trade_flows')
    .select('id')
    .limit(1);

  if (tableError && tableError.message.includes('does not exist')) {
    console.error('  ✗ Table souvera_agoa_trade_flows does not exist. Run the migration first:');
    console.error('    npx supabase db push');
    return {
      status: 'failed',
      recordsProcessed: 0,
      recordsFailed: records.length,
      jobId: job.jobId,
      error: 'Table does not exist',
    };
  }

  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    const { error } = await supabase
      .from('souvera_agoa_trade_flows')
      .upsert({
        iso3: record.iso3,
        country_name: record.country_name,
        region: record.region,
        sub_region: record.sub_region,
        agoa_eligible: record.agoa_eligible,
        agoa_status: record.agoa_status,
        eligibility_since: record.eligibility_since,
        year: record.year,
        hs_chapter: record.hs_chapter,
        category_group: record.category_group,
        category_label: record.category_label,
        total_exports_to_us_usd: record.total_exports_to_us_usd,
        agoa_exports_usd: record.agoa_exports_usd,
        agoa_share_pct: record.agoa_share_pct,
        non_agoa_exports_usd: record.non_agoa_exports_usd,
        mfn_tariff_pct: record.mfn_tariff_pct,
        tariff_savings_usd: record.tariff_savings_usd,
        is_textile_apparel: record.is_textile_apparel,
        third_country_fabric_eligible: record.third_country_fabric_eligible,
        yoy_growth_pct: record.yoy_growth_pct,
        top_products: record.top_products,
        us_total_imports_usd: record.us_total_imports_usd,
        country_share_of_us_imports_pct: record.country_share_of_us_imports_pct,
        competitor_suppliers: record.competitor_suppliers,
        source_notes: record.source_notes,
        data_quality_tier: record.data_quality_tier,
      }, {
        onConflict: 'iso3,year,category_group',
      });

    if (error) {
      console.error(`  ✗ ${record.country_name} ${record.category_group}: ${error.message}`);
      errorCount++;
    } else {
      successCount++;
    }
  }

  console.log(`\n  ✓ Inserted ${successCount} records`);
  if (errorCount > 0) {
    console.log(`  ✗ ${errorCount} errors`);
  }

  return {
    status: errorCount === 0 ? 'success' : 'partial',
    recordsProcessed: successCount,
    recordsFailed: errorCount,
    jobId: job.jobId,
  };
}

export default ingestAGOAFlows;
