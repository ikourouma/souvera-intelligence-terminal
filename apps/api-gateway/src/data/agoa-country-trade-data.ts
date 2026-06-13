/**
 * AGOA Country Trade Data
 * 
 * Curated 2023/2024 trade statistics for AGOA-eligible countries.
 * This data powers the AGOA Eligibility Tracker drawer with:
 * - Total exports to US under AGOA
 * - Top 3 products by export value
 * - Year-over-year growth
 * 
 * Data Sources: UN Comtrade, USITC, ITC Trade Data Monitor
 * Note: Values are seed estimates pending live Comtrade API integration.
 */

export interface AgoaCountryTradeProduct {
  hsCode: string;
  description: string;
  exportValueUSD: number;
  shareOfTotal: number;
  yoyGrowthPct: number;
}

export interface AgoaCountryTradeData {
  iso3: string;
  totalExportsToUSUSD: number;
  totalImportsFromUSUSD: number;
  agoaUtilizationPct: number;
  yoyGrowthPct: number;
  topProducts: AgoaCountryTradeProduct[];
  topSectors: string[];
  narrative?: string;
}

export const AGOA_COUNTRY_TRADE_DATA: AgoaCountryTradeData[] = [
  // Tier 1 — Major AGOA Exporters (>$500M)
  {
    iso3: 'ZAF',
    totalExportsToUSUSD: 8_200_000_000,
    totalImportsFromUSUSD: 4_100_000_000,
    agoaUtilizationPct: 68,
    yoyGrowthPct: 4.2,
    topProducts: [
      { hsCode: '870323', description: 'Motor vehicles (1500-3000cc)', exportValueUSD: 2_400_000_000, shareOfTotal: 29.3, yoyGrowthPct: 5.1 },
      { hsCode: '710812', description: 'Gold in unwrought forms', exportValueUSD: 1_800_000_000, shareOfTotal: 22.0, yoyGrowthPct: 8.2 },
      { hsCode: '710231', description: 'Diamonds, non-industrial', exportValueUSD: 950_000_000, shareOfTotal: 11.6, yoyGrowthPct: -2.1 },
    ],
    topSectors: ['Automotive', 'Precious Metals', 'Mining'],
    narrative: 'South Africa is the largest AGOA beneficiary, with automotive exports to the US representing a flagship success story of African manufacturing integration into global supply chains.',
  },
  {
    iso3: 'NGA',
    totalExportsToUSUSD: 4_800_000_000,
    totalImportsFromUSUSD: 2_900_000_000,
    agoaUtilizationPct: 42,
    yoyGrowthPct: -8.5,
    topProducts: [
      { hsCode: '270900', description: 'Crude petroleum oils', exportValueUSD: 4_200_000_000, shareOfTotal: 87.5, yoyGrowthPct: -12.3 },
      { hsCode: '180100', description: 'Cocoa beans, raw', exportValueUSD: 280_000_000, shareOfTotal: 5.8, yoyGrowthPct: 15.2 },
      { hsCode: '120740', description: 'Sesame seeds', exportValueUSD: 85_000_000, shareOfTotal: 1.8, yoyGrowthPct: 22.1 },
    ],
    topSectors: ['Energy', 'Agriculture', 'Food Processing'],
    narrative: 'Nigeria\'s AGOA exports remain heavily concentrated in crude oil. Diversification into cocoa and sesame represents emerging non-oil potential.',
  },
  {
    iso3: 'AGO',
    totalExportsToUSUSD: 3_200_000_000,
    totalImportsFromUSUSD: 850_000_000,
    agoaUtilizationPct: 38,
    yoyGrowthPct: -5.2,
    topProducts: [
      { hsCode: '270900', description: 'Crude petroleum oils', exportValueUSD: 3_050_000_000, shareOfTotal: 95.3, yoyGrowthPct: -6.8 },
      { hsCode: '710231', description: 'Diamonds, non-industrial', exportValueUSD: 95_000_000, shareOfTotal: 3.0, yoyGrowthPct: 2.1 },
      { hsCode: '030617', description: 'Frozen shrimps and prawns', exportValueUSD: 28_000_000, shareOfTotal: 0.9, yoyGrowthPct: 8.5 },
    ],
    topSectors: ['Energy', 'Mining', 'Fisheries'],
  },
  
  // Tier 2 — Significant Exporters ($100M–$500M)
  {
    iso3: 'KEN',
    totalExportsToUSUSD: 680_000_000,
    totalImportsFromUSUSD: 420_000_000,
    agoaUtilizationPct: 72,
    yoyGrowthPct: 8.3,
    topProducts: [
      { hsCode: '610910', description: 'T-shirts, cotton, knitted', exportValueUSD: 352_000_000, shareOfTotal: 51.8, yoyGrowthPct: 12.4 },
      { hsCode: '060310', description: 'Fresh cut flowers', exportValueUSD: 145_000_000, shareOfTotal: 21.3, yoyGrowthPct: 6.2 },
      { hsCode: '080132', description: 'Cashew nuts, shelled', exportValueUSD: 78_000_000, shareOfTotal: 11.5, yoyGrowthPct: 18.5 },
    ],
    topSectors: ['Apparel', 'Horticulture', 'Agriculture'],
    narrative: 'Kenya exemplifies AGOA\'s apparel provision success, with EPZ-based garment exports to the US growing consistently. The cut flower industry complements textile manufacturing.',
  },
  {
    iso3: 'ETH',
    totalExportsToUSUSD: 420_000_000,
    totalImportsFromUSUSD: 380_000_000,
    agoaUtilizationPct: 65,
    yoyGrowthPct: 15.2,
    topProducts: [
      { hsCode: '610910', description: 'T-shirts, cotton, knitted', exportValueUSD: 185_000_000, shareOfTotal: 44.0, yoyGrowthPct: 22.3 },
      { hsCode: '090111', description: 'Coffee, not roasted', exportValueUSD: 125_000_000, shareOfTotal: 29.8, yoyGrowthPct: 8.1 },
      { hsCode: '120740', description: 'Sesame seeds', exportValueUSD: 52_000_000, shareOfTotal: 12.4, yoyGrowthPct: 5.2 },
    ],
    topSectors: ['Apparel', 'Coffee', 'Agriculture'],
    narrative: 'Ethiopia\'s apparel sector has shown exceptional growth, benefiting from AGOA\'s third-country fabric rule. Coffee remains a cornerstone export.',
  },
  {
    iso3: 'GHA',
    totalExportsToUSUSD: 380_000_000,
    totalImportsFromUSUSD: 520_000_000,
    agoaUtilizationPct: 58,
    yoyGrowthPct: 6.8,
    topProducts: [
      { hsCode: '180100', description: 'Cocoa beans, raw', exportValueUSD: 185_000_000, shareOfTotal: 48.7, yoyGrowthPct: 12.3 },
      { hsCode: '710812', description: 'Gold in unwrought forms', exportValueUSD: 95_000_000, shareOfTotal: 25.0, yoyGrowthPct: 4.2 },
      { hsCode: '270900', description: 'Crude petroleum oils', exportValueUSD: 62_000_000, shareOfTotal: 16.3, yoyGrowthPct: -8.5 },
    ],
    topSectors: ['Cocoa', 'Mining', 'Energy'],
    narrative: 'Ghana\'s diversified export base spans cocoa, gold, and petroleum. The country maintains strong AGOA utilization across multiple product categories.',
  },
  {
    iso3: 'MDG',
    totalExportsToUSUSD: 320_000_000,
    totalImportsFromUSUSD: 85_000_000,
    agoaUtilizationPct: 78,
    yoyGrowthPct: 11.5,
    topProducts: [
      { hsCode: '610910', description: 'T-shirts, cotton, knitted', exportValueUSD: 145_000_000, shareOfTotal: 45.3, yoyGrowthPct: 14.2 },
      { hsCode: '090500', description: 'Vanilla beans', exportValueUSD: 85_000_000, shareOfTotal: 26.6, yoyGrowthPct: 8.3 },
      { hsCode: '260500', description: 'Cobalt ores and concentrates', exportValueUSD: 42_000_000, shareOfTotal: 13.1, yoyGrowthPct: 18.5 },
    ],
    topSectors: ['Apparel', 'Spices', 'Mining'],
    narrative: 'Madagascar combines apparel manufacturing with premium vanilla exports and critical mineral production, showcasing diversified AGOA utilization.',
  },
  {
    iso3: 'LSO',
    totalExportsToUSUSD: 280_000_000,
    totalImportsFromUSUSD: 45_000_000,
    agoaUtilizationPct: 92,
    yoyGrowthPct: 9.2,
    topProducts: [
      { hsCode: '620342', description: 'Men\'s trousers, cotton', exportValueUSD: 125_000_000, shareOfTotal: 44.6, yoyGrowthPct: 10.5 },
      { hsCode: '610910', description: 'T-shirts, cotton, knitted', exportValueUSD: 98_000_000, shareOfTotal: 35.0, yoyGrowthPct: 8.2 },
      { hsCode: '620462', description: 'Women\'s trousers, cotton', exportValueUSD: 38_000_000, shareOfTotal: 13.6, yoyGrowthPct: 12.1 },
    ],
    topSectors: ['Apparel'],
    narrative: 'Lesotho is a pure apparel play under AGOA, with the highest utilization rate among beneficiaries. The sector employs over 40,000 workers.',
  },
  {
    iso3: 'MUS',
    totalExportsToUSUSD: 245_000_000,
    totalImportsFromUSUSD: 125_000_000,
    agoaUtilizationPct: 68,
    yoyGrowthPct: 4.5,
    topProducts: [
      { hsCode: '610910', description: 'T-shirts, cotton, knitted', exportValueUSD: 95_000_000, shareOfTotal: 38.8, yoyGrowthPct: 5.2 },
      { hsCode: '030617', description: 'Frozen shrimps and prawns', exportValueUSD: 62_000_000, shareOfTotal: 25.3, yoyGrowthPct: 3.8 },
      { hsCode: '170114', description: 'Raw cane sugar', exportValueUSD: 48_000_000, shareOfTotal: 19.6, yoyGrowthPct: -2.1 },
    ],
    topSectors: ['Apparel', 'Seafood', 'Sugar'],
  },
  {
    iso3: 'SWZ',
    totalExportsToUSUSD: 185_000_000,
    totalImportsFromUSUSD: 32_000_000,
    agoaUtilizationPct: 85,
    yoyGrowthPct: 7.8,
    topProducts: [
      { hsCode: '610910', description: 'T-shirts, cotton, knitted', exportValueUSD: 85_000_000, shareOfTotal: 45.9, yoyGrowthPct: 9.2 },
      { hsCode: '620342', description: 'Men\'s trousers, cotton', exportValueUSD: 52_000_000, shareOfTotal: 28.1, yoyGrowthPct: 6.5 },
      { hsCode: '170114', description: 'Raw cane sugar', exportValueUSD: 28_000_000, shareOfTotal: 15.1, yoyGrowthPct: 2.1 },
    ],
    topSectors: ['Apparel', 'Sugar'],
  },
  {
    iso3: 'TZA',
    totalExportsToUSUSD: 165_000_000,
    totalImportsFromUSUSD: 220_000_000,
    agoaUtilizationPct: 45,
    yoyGrowthPct: 12.3,
    topProducts: [
      { hsCode: '090240', description: 'Black tea', exportValueUSD: 48_000_000, shareOfTotal: 29.1, yoyGrowthPct: 8.5 },
      { hsCode: '710231', description: 'Diamonds, non-industrial', exportValueUSD: 42_000_000, shareOfTotal: 25.5, yoyGrowthPct: 15.2 },
      { hsCode: '080132', description: 'Cashew nuts, shelled', exportValueUSD: 35_000_000, shareOfTotal: 21.2, yoyGrowthPct: 22.1 },
    ],
    topSectors: ['Agriculture', 'Mining', 'Food Processing'],
  },
  {
    iso3: 'CIV',
    totalExportsToUSUSD: 155_000_000,
    totalImportsFromUSUSD: 185_000_000,
    agoaUtilizationPct: 52,
    yoyGrowthPct: 8.5,
    topProducts: [
      { hsCode: '180100', description: 'Cocoa beans, raw', exportValueUSD: 85_000_000, shareOfTotal: 54.8, yoyGrowthPct: 12.1 },
      { hsCode: '080131', description: 'Cashew nuts, in shell', exportValueUSD: 38_000_000, shareOfTotal: 24.5, yoyGrowthPct: 15.2 },
      { hsCode: '151190', description: 'Palm oil and fractions', exportValueUSD: 18_000_000, shareOfTotal: 11.6, yoyGrowthPct: 5.8 },
    ],
    topSectors: ['Cocoa', 'Agriculture', 'Oils'],
    narrative: 'Côte d\'Ivoire is the world\'s largest cocoa producer, with significant AGOA-eligible exports to the US chocolate industry.',
  },
  {
    iso3: 'SEN',
    totalExportsToUSUSD: 125_000_000,
    totalImportsFromUSUSD: 165_000_000,
    agoaUtilizationPct: 48,
    yoyGrowthPct: 6.2,
    topProducts: [
      { hsCode: '030617', description: 'Frozen shrimps and prawns', exportValueUSD: 45_000_000, shareOfTotal: 36.0, yoyGrowthPct: 8.2 },
      { hsCode: '151190', description: 'Groundnut oil', exportValueUSD: 32_000_000, shareOfTotal: 25.6, yoyGrowthPct: 4.5 },
      { hsCode: '080132', description: 'Cashew nuts, shelled', exportValueUSD: 25_000_000, shareOfTotal: 20.0, yoyGrowthPct: 12.3 },
    ],
    topSectors: ['Fisheries', 'Oils', 'Agriculture'],
  },
  
  // Tier 3 — Emerging Exporters ($10M–$100M)
  {
    iso3: 'RWA',
    totalExportsToUSUSD: 85_000_000,
    totalImportsFromUSUSD: 95_000_000,
    agoaUtilizationPct: 62,
    yoyGrowthPct: 18.5,
    topProducts: [
      { hsCode: '090111', description: 'Coffee, not roasted', exportValueUSD: 42_000_000, shareOfTotal: 49.4, yoyGrowthPct: 15.2 },
      { hsCode: '090240', description: 'Black tea', exportValueUSD: 22_000_000, shareOfTotal: 25.9, yoyGrowthPct: 12.1 },
      { hsCode: '260500', description: 'Cobalt ores and concentrates', exportValueUSD: 12_000_000, shareOfTotal: 14.1, yoyGrowthPct: 45.2 },
    ],
    topSectors: ['Coffee', 'Tea', 'Mining'],
    narrative: 'Rwanda\'s specialty coffee has gained premium positioning in the US market. Critical minerals represent a fast-growing export category.',
  },
  {
    iso3: 'UGA',
    totalExportsToUSUSD: 72_000_000,
    totalImportsFromUSUSD: 145_000_000,
    agoaUtilizationPct: 38,
    yoyGrowthPct: 5.8,
    topProducts: [
      { hsCode: '090111', description: 'Coffee, not roasted', exportValueUSD: 35_000_000, shareOfTotal: 48.6, yoyGrowthPct: 8.2 },
      { hsCode: '030617', description: 'Frozen fish fillets', exportValueUSD: 18_000_000, shareOfTotal: 25.0, yoyGrowthPct: 4.5 },
      { hsCode: '120740', description: 'Sesame seeds', exportValueUSD: 12_000_000, shareOfTotal: 16.7, yoyGrowthPct: 12.1 },
    ],
    topSectors: ['Coffee', 'Fisheries', 'Agriculture'],
  },
  {
    iso3: 'ZMB',
    totalExportsToUSUSD: 65_000_000,
    totalImportsFromUSUSD: 85_000_000,
    agoaUtilizationPct: 35,
    yoyGrowthPct: 8.2,
    topProducts: [
      { hsCode: '740311', description: 'Copper cathodes, refined', exportValueUSD: 32_000_000, shareOfTotal: 49.2, yoyGrowthPct: 12.1 },
      { hsCode: '810520', description: 'Cobalt, unwrought', exportValueUSD: 18_000_000, shareOfTotal: 27.7, yoyGrowthPct: 25.5 },
      { hsCode: '090240', description: 'Black tea', exportValueUSD: 8_000_000, shareOfTotal: 12.3, yoyGrowthPct: 5.2 },
    ],
    topSectors: ['Mining', 'Copper', 'Agriculture'],
  },
  {
    iso3: 'MOZ',
    totalExportsToUSUSD: 58_000_000,
    totalImportsFromUSUSD: 125_000_000,
    agoaUtilizationPct: 42,
    yoyGrowthPct: 15.8,
    topProducts: [
      { hsCode: '760110', description: 'Aluminium, unwrought', exportValueUSD: 28_000_000, shareOfTotal: 48.3, yoyGrowthPct: 8.2 },
      { hsCode: '030617', description: 'Frozen shrimps and prawns', exportValueUSD: 15_000_000, shareOfTotal: 25.9, yoyGrowthPct: 12.5 },
      { hsCode: '271111', description: 'LNG, liquefied natural gas', exportValueUSD: 8_000_000, shareOfTotal: 13.8, yoyGrowthPct: 85.2 },
    ],
    topSectors: ['Aluminium', 'Fisheries', 'Energy'],
    narrative: 'Mozambique\'s LNG sector is emerging rapidly, with potential to significantly increase AGOA exports as production scales.',
  },
  {
    iso3: 'BWA',
    totalExportsToUSUSD: 52_000_000,
    totalImportsFromUSUSD: 35_000_000,
    agoaUtilizationPct: 55,
    yoyGrowthPct: 4.2,
    topProducts: [
      { hsCode: '710231', description: 'Diamonds, non-industrial', exportValueUSD: 38_000_000, shareOfTotal: 73.1, yoyGrowthPct: 2.5 },
      { hsCode: '020230', description: 'Boneless beef, frozen', exportValueUSD: 8_000_000, shareOfTotal: 15.4, yoyGrowthPct: 8.2 },
      { hsCode: '410411', description: 'Bovine hides and skins', exportValueUSD: 4_000_000, shareOfTotal: 7.7, yoyGrowthPct: 5.1 },
    ],
    topSectors: ['Diamonds', 'Beef', 'Leather'],
  },
  {
    iso3: 'NAM',
    totalExportsToUSUSD: 48_000_000,
    totalImportsFromUSUSD: 42_000_000,
    agoaUtilizationPct: 52,
    yoyGrowthPct: 6.5,
    topProducts: [
      { hsCode: '030617', description: 'Frozen fish and seafood', exportValueUSD: 22_000_000, shareOfTotal: 45.8, yoyGrowthPct: 8.2 },
      { hsCode: '710231', description: 'Diamonds, non-industrial', exportValueUSD: 15_000_000, shareOfTotal: 31.3, yoyGrowthPct: 3.5 },
      { hsCode: '020230', description: 'Boneless beef, frozen', exportValueUSD: 6_000_000, shareOfTotal: 12.5, yoyGrowthPct: 12.1 },
    ],
    topSectors: ['Fisheries', 'Diamonds', 'Beef'],
  },
  {
    iso3: 'MWI',
    totalExportsToUSUSD: 42_000_000,
    totalImportsFromUSUSD: 28_000_000,
    agoaUtilizationPct: 45,
    yoyGrowthPct: 8.5,
    topProducts: [
      { hsCode: '240120', description: 'Tobacco, partly/wholly stemmed', exportValueUSD: 22_000_000, shareOfTotal: 52.4, yoyGrowthPct: 5.2 },
      { hsCode: '090240', description: 'Black tea', exportValueUSD: 12_000_000, shareOfTotal: 28.6, yoyGrowthPct: 8.5 },
      { hsCode: '080131', description: 'Macadamia nuts', exportValueUSD: 5_000_000, shareOfTotal: 11.9, yoyGrowthPct: 22.1 },
    ],
    topSectors: ['Tobacco', 'Tea', 'Nuts'],
  },
  {
    iso3: 'CMR',
    totalExportsToUSUSD: 38_000_000,
    totalImportsFromUSUSD: 95_000_000,
    agoaUtilizationPct: 32,
    yoyGrowthPct: 5.2,
    topProducts: [
      { hsCode: '180100', description: 'Cocoa beans, raw', exportValueUSD: 18_000_000, shareOfTotal: 47.4, yoyGrowthPct: 8.5 },
      { hsCode: '270900', description: 'Crude petroleum oils', exportValueUSD: 12_000_000, shareOfTotal: 31.6, yoyGrowthPct: -5.2 },
      { hsCode: '440399', description: 'Tropical wood, sawn', exportValueUSD: 5_000_000, shareOfTotal: 13.2, yoyGrowthPct: 2.1 },
    ],
    topSectors: ['Cocoa', 'Energy', 'Timber'],
  },
  
  // Tier 4 — Small/Emerging (<$10M or Suspended)
  {
    iso3: 'BEN',
    totalExportsToUSUSD: 8_500_000,
    totalImportsFromUSUSD: 45_000_000,
    agoaUtilizationPct: 28,
    yoyGrowthPct: 12.5,
    topProducts: [
      { hsCode: '520100', description: 'Raw cotton', exportValueUSD: 4_200_000, shareOfTotal: 49.4, yoyGrowthPct: 15.2 },
      { hsCode: '080131', description: 'Cashew nuts, in shell', exportValueUSD: 2_800_000, shareOfTotal: 32.9, yoyGrowthPct: 18.5 },
      { hsCode: '151190', description: 'Shea butter', exportValueUSD: 1_200_000, shareOfTotal: 14.1, yoyGrowthPct: 22.1 },
    ],
    topSectors: ['Cotton', 'Cashews', 'Shea'],
  },
  {
    iso3: 'MLI',
    totalExportsToUSUSD: 6_200_000,
    totalImportsFromUSUSD: 32_000_000,
    agoaUtilizationPct: 22,
    yoyGrowthPct: 5.8,
    topProducts: [
      { hsCode: '520100', description: 'Raw cotton', exportValueUSD: 3_500_000, shareOfTotal: 56.5, yoyGrowthPct: 8.2 },
      { hsCode: '710812', description: 'Gold in unwrought forms', exportValueUSD: 1_800_000, shareOfTotal: 29.0, yoyGrowthPct: 12.1 },
      { hsCode: '120740', description: 'Sesame seeds', exportValueUSD: 650_000, shareOfTotal: 10.5, yoyGrowthPct: 15.5 },
    ],
    topSectors: ['Cotton', 'Gold', 'Agriculture'],
  },
  {
    iso3: 'BFA',
    totalExportsToUSUSD: 5_800_000,
    totalImportsFromUSUSD: 28_000_000,
    agoaUtilizationPct: 25,
    yoyGrowthPct: 8.2,
    topProducts: [
      { hsCode: '520100', description: 'Raw cotton', exportValueUSD: 3_200_000, shareOfTotal: 55.2, yoyGrowthPct: 12.1 },
      { hsCode: '710812', description: 'Gold in unwrought forms', exportValueUSD: 1_500_000, shareOfTotal: 25.9, yoyGrowthPct: 8.5 },
      { hsCode: '120740', description: 'Sesame seeds', exportValueUSD: 850_000, shareOfTotal: 14.7, yoyGrowthPct: 18.2 },
    ],
    topSectors: ['Cotton', 'Gold', 'Agriculture'],
  },
  {
    iso3: 'TGO',
    totalExportsToUSUSD: 4_500_000,
    totalImportsFromUSUSD: 38_000_000,
    agoaUtilizationPct: 18,
    yoyGrowthPct: 6.5,
    topProducts: [
      { hsCode: '252329', description: 'Cement clinker', exportValueUSD: 2_200_000, shareOfTotal: 48.9, yoyGrowthPct: 5.2 },
      { hsCode: '520100', description: 'Raw cotton', exportValueUSD: 1_500_000, shareOfTotal: 33.3, yoyGrowthPct: 8.5 },
      { hsCode: '151190', description: 'Palm oil', exportValueUSD: 600_000, shareOfTotal: 13.3, yoyGrowthPct: 12.1 },
    ],
    topSectors: ['Cement', 'Cotton', 'Oils'],
  },
  {
    iso3: 'NER',
    totalExportsToUSUSD: 3_200_000,
    totalImportsFromUSUSD: 22_000_000,
    agoaUtilizationPct: 15,
    yoyGrowthPct: 4.2,
    topProducts: [
      { hsCode: '284410', description: 'Uranium ores and concentrates', exportValueUSD: 1_800_000, shareOfTotal: 56.3, yoyGrowthPct: 2.1 },
      { hsCode: '071339', description: 'Dried beans', exportValueUSD: 850_000, shareOfTotal: 26.6, yoyGrowthPct: 8.5 },
      { hsCode: '120740', description: 'Sesame seeds', exportValueUSD: 420_000, shareOfTotal: 13.1, yoyGrowthPct: 15.2 },
    ],
    topSectors: ['Uranium', 'Agriculture', 'Seeds'],
  },
  {
    iso3: 'COD',
    totalExportsToUSUSD: 2_800_000,
    totalImportsFromUSUSD: 85_000_000,
    agoaUtilizationPct: 12,
    yoyGrowthPct: 25.5,
    topProducts: [
      { hsCode: '810520', description: 'Cobalt, unwrought', exportValueUSD: 1_500_000, shareOfTotal: 53.6, yoyGrowthPct: 35.2 },
      { hsCode: '260500', description: 'Cobalt ores and concentrates', exportValueUSD: 850_000, shareOfTotal: 30.4, yoyGrowthPct: 42.1 },
      { hsCode: '740311', description: 'Copper cathodes', exportValueUSD: 350_000, shareOfTotal: 12.5, yoyGrowthPct: 18.5 },
    ],
    topSectors: ['Cobalt', 'Copper', 'Mining'],
    narrative: 'DRC\'s AGOA exports are dominated by critical minerals essential for EV batteries and electronics. Vast untapped potential exists.',
  },
  {
    iso3: 'DJI',
    totalExportsToUSUSD: 1_200_000,
    totalImportsFromUSUSD: 45_000_000,
    agoaUtilizationPct: 8,
    yoyGrowthPct: 15.2,
    topProducts: [
      { hsCode: '030617', description: 'Frozen fish', exportValueUSD: 650_000, shareOfTotal: 54.2, yoyGrowthPct: 12.1 },
      { hsCode: '410411', description: 'Bovine hides', exportValueUSD: 380_000, shareOfTotal: 31.7, yoyGrowthPct: 8.5 },
      { hsCode: '252329', description: 'Salt', exportValueUSD: 120_000, shareOfTotal: 10.0, yoyGrowthPct: 5.2 },
    ],
    topSectors: ['Fisheries', 'Leather', 'Salt'],
  },
];

/**
 * Get trade data for a specific country
 */
export function getAgoaCountryTradeData(iso3: string): AgoaCountryTradeData | undefined {
  return AGOA_COUNTRY_TRADE_DATA.find(d => d.iso3 === iso3.toUpperCase());
}

/**
 * Format USD value for display
 */
export function formatTradeValueUSD(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}
