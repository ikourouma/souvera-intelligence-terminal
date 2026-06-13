/**
 * =====================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * AfCFTA Trade Flows Ingestion Adapter
 * Owner: Afronovation, Inc.
 * Phase 0.5D: AfCFTA Import-Export Intelligence
 * =====================================================
 *
 * This adapter populates AfCFTA trade flow data for:
 * - Import Intelligence (what African countries import from within Africa)
 * - Export Intelligence (what African countries export to Africa)
 *
 * Data sources:
 * - ITC Trade Map (primary)
 * - UN Comtrade (supplementary)
 * - AfCFTA Secretariat (tariff schedules)
 * - Curated estimates for preview
 */

import { IngestAdapterResult, createIngestionJob } from './shared';
import {
  AFRICAN_COUNTRIES_FULL,
  TIER_A_HUBS,
  AFCFTA_CATEGORY_MULTIPLIERS,
  AFCFTA_REGIONAL_PARTNERS,
  GENERIC_TOP_PRODUCTS,
  type DataQualityTier,
} from './data/afcfta-flows-expansion';

interface AfCFTATradeFlowRecord {
  iso3: string;
  country_name: string;
  region: string;
  sub_region: string;
  direction: 'imports' | 'exports';
  year: number;
  hs_chapter: string;
  category_group: string;
  category_label: string;
  total_trade_usd: number;
  intra_africa_trade_usd: number;
  intra_africa_share_pct: number;
  trade_with_us_usd?: number;
  trade_with_eu_usd?: number;
  trade_with_china_usd?: number;
  afcfta_tariff_pct?: number;
  mfn_tariff_pct?: number;
  preference_margin_pct?: number;
  roo_compliant?: boolean;
  yoy_growth_pct?: number;
  top_partners: Array<{ iso3: string; country: string; valueUsd: number; sharePct: number }>;
  top_products?: Array<{ hsCode: string; description: string; valueUsd: number; sharePct: number }>;
  source_notes: string;
  data_quality_tier: DataQualityTier;
}

// AfCFTA category mappings
const AFCFTA_CATEGORIES = {
  machinery: { label: 'Machinery & Equipment', hsChapter: '84-85' },
  minerals: { label: 'Minerals & Mining', hsChapter: '25-27' },
  petroleum: { label: 'Petroleum & Energy', hsChapter: '27' },
  agriculture: { label: 'Agriculture & Food', hsChapter: '01-24' },
  textiles: { label: 'Textiles & Apparel', hsChapter: '50-63' },
  chemicals: { label: 'Chemicals & Pharmaceuticals', hsChapter: '28-38' },
  vehicles: { label: 'Vehicles & Transport', hsChapter: '86-89' },
  electronics: { label: 'Electronics & ICT', hsChapter: '85' },
};

// Country-specific top export products by category (curated from ITC Trade Map 2023)
const COUNTRY_TOP_PRODUCTS: Record<string, Record<string, Array<{ hsCode: string; description: string; sharePct: number }>>> = {
  CIV: {
    agriculture: [
      { hsCode: '1801', description: 'Cocoa beans, whole or broken, raw or roasted', sharePct: 42 },
      { hsCode: '1803', description: 'Cocoa paste, whether or not defatted', sharePct: 18 },
      { hsCode: '1804', description: 'Cocoa butter, fat and oil', sharePct: 12 },
      { hsCode: '0801', description: 'Cashew nuts, fresh or dried', sharePct: 8 },
      { hsCode: '0803', description: 'Bananas, fresh or dried', sharePct: 5 },
    ],
    petroleum: [
      { hsCode: '2709', description: 'Petroleum oils, crude', sharePct: 65 },
      { hsCode: '2710', description: 'Petroleum oils, refined', sharePct: 25 },
    ],
    minerals: [
      { hsCode: '7108', description: 'Gold, unwrought or in semi-manufactured forms', sharePct: 55 },
      { hsCode: '2601', description: 'Iron ores and concentrates', sharePct: 20 },
    ],
    textiles: [
      { hsCode: '5201', description: 'Cotton, not carded or combed', sharePct: 45 },
      { hsCode: '4001', description: 'Natural rubber', sharePct: 35 },
    ],
  },
  GHA: {
    agriculture: [
      { hsCode: '1801', description: 'Cocoa beans, whole or broken, raw or roasted', sharePct: 38 },
      { hsCode: '1803', description: 'Cocoa paste, whether or not defatted', sharePct: 15 },
      { hsCode: '0801', description: 'Cashew nuts, fresh or dried', sharePct: 12 },
    ],
    minerals: [
      { hsCode: '7108', description: 'Gold, unwrought or in semi-manufactured forms', sharePct: 72 },
      { hsCode: '2709', description: 'Petroleum oils, crude', sharePct: 15 },
    ],
    petroleum: [
      { hsCode: '2709', description: 'Petroleum oils, crude', sharePct: 85 },
      { hsCode: '2711', description: 'Petroleum gases and gaseous hydrocarbons', sharePct: 10 },
    ],
  },
  NGA: {
    petroleum: [
      { hsCode: '2709', description: 'Petroleum oils, crude', sharePct: 78 },
      { hsCode: '2711', description: 'Liquefied natural gas (LNG)', sharePct: 18 },
    ],
    agriculture: [
      { hsCode: '1801', description: 'Cocoa beans, whole or broken, raw or roasted', sharePct: 25 },
      { hsCode: '1207', description: 'Sesame seeds', sharePct: 22 },
      { hsCode: '0801', description: 'Cashew nuts, fresh or dried', sharePct: 15 },
    ],
    minerals: [
      { hsCode: '2608', description: 'Zinc ores and concentrates', sharePct: 35 },
      { hsCode: '2607', description: 'Lead ores and concentrates', sharePct: 25 },
    ],
  },
  KEN: {
    agriculture: [
      { hsCode: '0902', description: 'Tea, whether or not flavoured', sharePct: 35 },
      { hsCode: '0603', description: 'Cut flowers and flower buds', sharePct: 28 },
      { hsCode: '0901', description: 'Coffee, not roasted', sharePct: 15 },
      { hsCode: '0704', description: 'Cabbages, cauliflowers, fresh or chilled', sharePct: 8 },
    ],
    textiles: [
      { hsCode: '6109', description: 'T-shirts, singlets and other vests, knitted', sharePct: 35 },
      { hsCode: '6203', description: 'Men\'s suits, jackets, trousers', sharePct: 25 },
    ],
    chemicals: [
      { hsCode: '3004', description: 'Medicaments, packaged for retail sale', sharePct: 40 },
      { hsCode: '3808', description: 'Insecticides, fungicides, herbicides', sharePct: 25 },
    ],
  },
  ETH: {
    agriculture: [
      { hsCode: '0901', description: 'Coffee, not roasted', sharePct: 45 },
      { hsCode: '1207', description: 'Sesame seeds', sharePct: 20 },
      { hsCode: '0603', description: 'Cut flowers and flower buds', sharePct: 15 },
      { hsCode: '0713', description: 'Dried leguminous vegetables', sharePct: 8 },
    ],
    textiles: [
      { hsCode: '4107', description: 'Leather of bovine or equine animals', sharePct: 45 },
      { hsCode: '6109', description: 'T-shirts and vests, knitted', sharePct: 25 },
    ],
  },
  ZAF: {
    minerals: [
      { hsCode: '7108', description: 'Gold, unwrought or in semi-manufactured forms', sharePct: 25 },
      { hsCode: '7110', description: 'Platinum, unwrought or in powder form', sharePct: 22 },
      { hsCode: '2601', description: 'Iron ores and concentrates', sharePct: 18 },
      { hsCode: '2701', description: 'Coal; briquettes and similar solid fuels', sharePct: 15 },
    ],
    vehicles: [
      { hsCode: '8703', description: 'Motor cars for transport of persons', sharePct: 45 },
      { hsCode: '8704', description: 'Motor vehicles for goods transport', sharePct: 25 },
      { hsCode: '8708', description: 'Parts and accessories for motor vehicles', sharePct: 18 },
    ],
    agriculture: [
      { hsCode: '0805', description: 'Citrus fruit, fresh or dried', sharePct: 22 },
      { hsCode: '0806', description: 'Grapes, fresh or dried', sharePct: 18 },
      { hsCode: '2204', description: 'Wine of fresh grapes', sharePct: 15 },
      { hsCode: '1701', description: 'Cane or beet sugar', sharePct: 12 },
    ],
    machinery: [
      { hsCode: '8429', description: 'Self-propelled bulldozers, excavators', sharePct: 25 },
      { hsCode: '8474', description: 'Machinery for sorting, screening, mixing', sharePct: 20 },
    ],
  },
  EGY: {
    petroleum: [
      { hsCode: '2709', description: 'Petroleum oils, crude', sharePct: 55 },
      { hsCode: '2711', description: 'Petroleum gases and gaseous hydrocarbons', sharePct: 25 },
    ],
    agriculture: [
      { hsCode: '0805', description: 'Citrus fruit, fresh or dried (oranges)', sharePct: 28 },
      { hsCode: '0701', description: 'Potatoes, fresh or chilled', sharePct: 15 },
      { hsCode: '1006', description: 'Rice', sharePct: 12 },
      { hsCode: '5201', description: 'Cotton, not carded or combed', sharePct: 10 },
    ],
    textiles: [
      { hsCode: '5201', description: 'Egyptian cotton, not carded or combed', sharePct: 35 },
      { hsCode: '6302', description: 'Bed linen, table linen, toilet linen', sharePct: 25 },
    ],
    chemicals: [
      { hsCode: '3105', description: 'Mineral or chemical fertilizers', sharePct: 35 },
      { hsCode: '3102', description: 'Mineral or chemical fertilizers, nitrogenous', sharePct: 25 },
    ],
  },
  MAR: {
    minerals: [
      { hsCode: '3103', description: 'Mineral or chemical fertilizers, phosphatic', sharePct: 45 },
      { hsCode: '2510', description: 'Natural phosphates', sharePct: 30 },
    ],
    agriculture: [
      { hsCode: '0805', description: 'Citrus fruit, fresh or dried', sharePct: 25 },
      { hsCode: '0702', description: 'Tomatoes, fresh or chilled', sharePct: 18 },
      { hsCode: '0807', description: 'Melons and papayas, fresh', sharePct: 12 },
    ],
    vehicles: [
      { hsCode: '8703', description: 'Motor cars for transport of persons', sharePct: 55 },
      { hsCode: '8544', description: 'Insulated wire, cable', sharePct: 20 },
    ],
    textiles: [
      { hsCode: '6203', description: 'Men\'s suits, jackets, trousers', sharePct: 30 },
      { hsCode: '6204', description: 'Women\'s suits, dresses, skirts', sharePct: 25 },
    ],
  },
  TZA: {
    minerals: [
      { hsCode: '7108', description: 'Gold, unwrought or in semi-manufactured forms', sharePct: 65 },
      { hsCode: '2614', description: 'Titanium ores and concentrates', sharePct: 15 },
    ],
    agriculture: [
      { hsCode: '2401', description: 'Unmanufactured tobacco', sharePct: 22 },
      { hsCode: '0901', description: 'Coffee, not roasted', sharePct: 18 },
      { hsCode: '0801', description: 'Cashew nuts, fresh or dried', sharePct: 15 },
      { hsCode: '1207', description: 'Sesame seeds', sharePct: 12 },
    ],
  },
  SEN: {
    agriculture: [
      { hsCode: '0303', description: 'Fish, frozen', sharePct: 35 },
      { hsCode: '1202', description: 'Groundnuts, not roasted', sharePct: 25 },
      { hsCode: '0306', description: 'Crustaceans, frozen or fresh', sharePct: 15 },
    ],
    minerals: [
      { hsCode: '2510', description: 'Natural phosphates', sharePct: 45 },
      { hsCode: '7108', description: 'Gold, unwrought or in semi-manufactured forms', sharePct: 35 },
    ],
    petroleum: [
      { hsCode: '2710', description: 'Petroleum oils, refined', sharePct: 65 },
    ],
  },
  AGO: {
    petroleum: [
      { hsCode: '2709', description: 'Petroleum oils, crude', sharePct: 92 },
      { hsCode: '2711', description: 'Liquefied natural gas (LNG)', sharePct: 5 },
    ],
    minerals: [
      { hsCode: '7102', description: 'Diamonds, unworked or simply sawn', sharePct: 85 },
    ],
  },
  CMR: {
    petroleum: [
      { hsCode: '2709', description: 'Petroleum oils, crude', sharePct: 55 },
      { hsCode: '2710', description: 'Petroleum oils, refined', sharePct: 20 },
    ],
    agriculture: [
      { hsCode: '1801', description: 'Cocoa beans, whole or broken, raw or roasted', sharePct: 25 },
      { hsCode: '0901', description: 'Coffee, not roasted', sharePct: 15 },
      { hsCode: '0803', description: 'Bananas, fresh or dried', sharePct: 12 },
    ],
    minerals: [
      { hsCode: '7601', description: 'Unwrought aluminium', sharePct: 45 },
      { hsCode: '4403', description: 'Wood in the rough', sharePct: 30 },
    ],
  },
};

// Country-specific top IMPORT products by category (curated from ITC Trade Map 2023)
const COUNTRY_TOP_IMPORT_PRODUCTS: Record<string, Record<string, Array<{ hsCode: string; description: string; sharePct: number }>>> = {
  CIV: {
    machinery: [
      { hsCode: '8429', description: 'Self-propelled bulldozers, excavators', sharePct: 18 },
      { hsCode: '8502', description: 'Electric generating sets and converters', sharePct: 15 },
      { hsCode: '8471', description: 'Computers and processing units', sharePct: 12 },
    ],
    agriculture: [
      { hsCode: '1006', description: 'Rice', sharePct: 28 },
      { hsCode: '1001', description: 'Wheat and meslin', sharePct: 18 },
      { hsCode: '0303', description: 'Fish, frozen', sharePct: 15 },
    ],
    petroleum: [
      { hsCode: '2710', description: 'Petroleum oils, refined', sharePct: 65 },
      { hsCode: '2711', description: 'Petroleum gases', sharePct: 20 },
    ],
    vehicles: [
      { hsCode: '8703', description: 'Motor cars for transport of persons', sharePct: 45 },
      { hsCode: '8704', description: 'Motor vehicles for goods transport', sharePct: 30 },
    ],
    chemicals: [
      { hsCode: '3004', description: 'Medicaments, packaged for retail sale', sharePct: 35 },
      { hsCode: '3105', description: 'Mineral or chemical fertilizers', sharePct: 25 },
    ],
    textiles: [
      { hsCode: '5208', description: 'Woven fabrics of cotton', sharePct: 30 },
      { hsCode: '6109', description: 'T-shirts, singlets, knitted', sharePct: 25 },
    ],
    electronics: [
      { hsCode: '8517', description: 'Telephones and communication apparatus', sharePct: 45 },
      { hsCode: '8528', description: 'Monitors and projectors', sharePct: 20 },
    ],
    minerals: [
      { hsCode: '2523', description: 'Portland cement', sharePct: 35 },
      { hsCode: '7210', description: 'Flat-rolled iron or steel products', sharePct: 25 },
    ],
  },
  GHA: {
    machinery: [
      { hsCode: '8429', description: 'Self-propelled bulldozers, excavators', sharePct: 20 },
      { hsCode: '8413', description: 'Pumps for liquids', sharePct: 15 },
      { hsCode: '8471', description: 'Computers and processing units', sharePct: 12 },
    ],
    agriculture: [
      { hsCode: '1006', description: 'Rice', sharePct: 25 },
      { hsCode: '1001', description: 'Wheat and meslin', sharePct: 20 },
      { hsCode: '0303', description: 'Fish, frozen', sharePct: 18 },
    ],
    petroleum: [
      { hsCode: '2710', description: 'Petroleum oils, refined', sharePct: 70 },
      { hsCode: '2711', description: 'Petroleum gases', sharePct: 15 },
    ],
    vehicles: [
      { hsCode: '8703', description: 'Motor cars for transport of persons', sharePct: 40 },
      { hsCode: '8704', description: 'Motor vehicles for goods transport', sharePct: 35 },
    ],
    chemicals: [
      { hsCode: '3004', description: 'Medicaments, packaged for retail sale', sharePct: 30 },
      { hsCode: '3901', description: 'Polymers of ethylene, primary forms', sharePct: 20 },
    ],
    textiles: [
      { hsCode: '5208', description: 'Woven fabrics of cotton', sharePct: 35 },
      { hsCode: '6302', description: 'Bed linen, table linen', sharePct: 20 },
    ],
    electronics: [
      { hsCode: '8517', description: 'Telephones and communication apparatus', sharePct: 40 },
      { hsCode: '8471', description: 'Computers', sharePct: 25 },
    ],
    minerals: [
      { hsCode: '2523', description: 'Portland cement', sharePct: 40 },
      { hsCode: '7208', description: 'Flat-rolled iron or steel, hot-rolled', sharePct: 25 },
    ],
  },
  NGA: {
    machinery: [
      { hsCode: '8406', description: 'Steam turbines and other vapor turbines', sharePct: 15 },
      { hsCode: '8413', description: 'Pumps for liquids', sharePct: 12 },
      { hsCode: '8502', description: 'Electric generating sets', sharePct: 18 },
    ],
    agriculture: [
      { hsCode: '1001', description: 'Wheat and meslin', sharePct: 30 },
      { hsCode: '1006', description: 'Rice', sharePct: 22 },
      { hsCode: '0303', description: 'Fish, frozen', sharePct: 15 },
    ],
    petroleum: [
      { hsCode: '2710', description: 'Petroleum oils, refined', sharePct: 75 },
      { hsCode: '2711', description: 'Petroleum gases', sharePct: 15 },
    ],
    vehicles: [
      { hsCode: '8703', description: 'Motor cars for transport of persons', sharePct: 45 },
      { hsCode: '8704', description: 'Motor vehicles for goods transport', sharePct: 30 },
    ],
    chemicals: [
      { hsCode: '3105', description: 'Mineral or chemical fertilizers', sharePct: 25 },
      { hsCode: '3004', description: 'Medicaments, packaged for retail sale', sharePct: 22 },
    ],
    textiles: [
      { hsCode: '5208', description: 'Woven fabrics of cotton', sharePct: 30 },
      { hsCode: '5513', description: 'Woven fabrics of synthetic staple fibers', sharePct: 25 },
    ],
    electronics: [
      { hsCode: '8517', description: 'Telephones and communication apparatus', sharePct: 40 },
      { hsCode: '8471', description: 'Computers', sharePct: 20 },
    ],
    minerals: [
      { hsCode: '2523', description: 'Portland cement', sharePct: 35 },
      { hsCode: '7210', description: 'Flat-rolled iron or steel', sharePct: 28 },
    ],
  },
  KEN: {
    machinery: [
      { hsCode: '8429', description: 'Self-propelled bulldozers, excavators', sharePct: 18 },
      { hsCode: '8432', description: 'Agricultural machinery for soil preparation', sharePct: 15 },
      { hsCode: '8471', description: 'Computers and processing units', sharePct: 14 },
    ],
    agriculture: [
      { hsCode: '1001', description: 'Wheat and meslin', sharePct: 28 },
      { hsCode: '1006', description: 'Rice', sharePct: 18 },
      { hsCode: '1511', description: 'Palm oil and its fractions', sharePct: 15 },
    ],
    petroleum: [
      { hsCode: '2710', description: 'Petroleum oils, refined', sharePct: 75 },
      { hsCode: '2711', description: 'Petroleum gases', sharePct: 12 },
    ],
    vehicles: [
      { hsCode: '8703', description: 'Motor cars for transport of persons', sharePct: 42 },
      { hsCode: '8704', description: 'Motor vehicles for goods transport', sharePct: 28 },
    ],
    chemicals: [
      { hsCode: '3004', description: 'Medicaments, packaged for retail sale', sharePct: 30 },
      { hsCode: '3105', description: 'Mineral or chemical fertilizers', sharePct: 22 },
    ],
    textiles: [
      { hsCode: '5208', description: 'Woven fabrics of cotton', sharePct: 28 },
      { hsCode: '5407', description: 'Woven fabrics of synthetic filament yarn', sharePct: 22 },
    ],
    electronics: [
      { hsCode: '8517', description: 'Telephones and communication apparatus', sharePct: 38 },
      { hsCode: '8471', description: 'Computers', sharePct: 22 },
    ],
    minerals: [
      { hsCode: '7210', description: 'Flat-rolled iron or steel', sharePct: 32 },
      { hsCode: '2523', description: 'Portland cement', sharePct: 25 },
    ],
  },
  ETH: {
    machinery: [
      { hsCode: '8429', description: 'Self-propelled bulldozers, excavators', sharePct: 22 },
      { hsCode: '8517', description: 'Telephones and communication apparatus', sharePct: 18 },
      { hsCode: '8471', description: 'Computers and processing units', sharePct: 12 },
    ],
    agriculture: [
      { hsCode: '1001', description: 'Wheat and meslin', sharePct: 35 },
      { hsCode: '1511', description: 'Palm oil and its fractions', sharePct: 18 },
      { hsCode: '1701', description: 'Cane or beet sugar', sharePct: 15 },
    ],
    petroleum: [
      { hsCode: '2710', description: 'Petroleum oils, refined', sharePct: 80 },
      { hsCode: '2711', description: 'Petroleum gases', sharePct: 12 },
    ],
    vehicles: [
      { hsCode: '8703', description: 'Motor cars for transport of persons', sharePct: 38 },
      { hsCode: '8704', description: 'Motor vehicles for goods transport', sharePct: 35 },
    ],
    chemicals: [
      { hsCode: '3004', description: 'Medicaments, packaged for retail sale', sharePct: 35 },
      { hsCode: '3105', description: 'Mineral or chemical fertilizers', sharePct: 28 },
    ],
    textiles: [
      { hsCode: '5208', description: 'Woven fabrics of cotton', sharePct: 32 },
      { hsCode: '5407', description: 'Woven fabrics of synthetic filament yarn', sharePct: 25 },
    ],
    electronics: [
      { hsCode: '8517', description: 'Telephones and communication apparatus', sharePct: 45 },
      { hsCode: '8471', description: 'Computers', sharePct: 20 },
    ],
    minerals: [
      { hsCode: '7210', description: 'Flat-rolled iron or steel', sharePct: 35 },
      { hsCode: '2523', description: 'Portland cement', sharePct: 28 },
    ],
  },
  ZAF: {
    machinery: [
      { hsCode: '8471', description: 'Computers and processing units', sharePct: 18 },
      { hsCode: '8429', description: 'Self-propelled bulldozers, excavators', sharePct: 15 },
      { hsCode: '8413', description: 'Pumps for liquids', sharePct: 12 },
    ],
    agriculture: [
      { hsCode: '1006', description: 'Rice', sharePct: 22 },
      { hsCode: '1001', description: 'Wheat and meslin', sharePct: 18 },
      { hsCode: '1511', description: 'Palm oil and its fractions', sharePct: 15 },
    ],
    petroleum: [
      { hsCode: '2709', description: 'Petroleum oils, crude', sharePct: 70 },
      { hsCode: '2710', description: 'Petroleum oils, refined', sharePct: 20 },
    ],
    vehicles: [
      { hsCode: '8708', description: 'Parts and accessories for motor vehicles', sharePct: 35 },
      { hsCode: '8703', description: 'Motor cars for transport of persons', sharePct: 30 },
    ],
    chemicals: [
      { hsCode: '3004', description: 'Medicaments, packaged for retail sale', sharePct: 25 },
      { hsCode: '2901', description: 'Acyclic hydrocarbons', sharePct: 18 },
    ],
    textiles: [
      { hsCode: '5208', description: 'Woven fabrics of cotton', sharePct: 25 },
      { hsCode: '6109', description: 'T-shirts, singlets, knitted', sharePct: 22 },
    ],
    electronics: [
      { hsCode: '8517', description: 'Telephones and communication apparatus', sharePct: 35 },
      { hsCode: '8471', description: 'Computers', sharePct: 28 },
    ],
    minerals: [
      { hsCode: '7108', description: 'Gold, unwrought (for refining)', sharePct: 25 },
      { hsCode: '7210', description: 'Flat-rolled iron or steel', sharePct: 22 },
    ],
  },
  EGY: {
    machinery: [
      { hsCode: '8471', description: 'Computers and processing units', sharePct: 18 },
      { hsCode: '8429', description: 'Self-propelled bulldozers, excavators', sharePct: 15 },
      { hsCode: '8502', description: 'Electric generating sets', sharePct: 12 },
    ],
    agriculture: [
      { hsCode: '1001', description: 'Wheat and meslin', sharePct: 35 },
      { hsCode: '1005', description: 'Maize (corn)', sharePct: 22 },
      { hsCode: '1201', description: 'Soybeans', sharePct: 15 },
    ],
    petroleum: [
      { hsCode: '2709', description: 'Petroleum oils, crude', sharePct: 55 },
      { hsCode: '2711', description: 'Petroleum gases and gaseous hydrocarbons', sharePct: 25 },
    ],
    vehicles: [
      { hsCode: '8703', description: 'Motor cars for transport of persons', sharePct: 40 },
      { hsCode: '8708', description: 'Parts and accessories for motor vehicles', sharePct: 28 },
    ],
    chemicals: [
      { hsCode: '3004', description: 'Medicaments, packaged for retail sale', sharePct: 28 },
      { hsCode: '3901', description: 'Polymers of ethylene', sharePct: 18 },
    ],
    textiles: [
      { hsCode: '5208', description: 'Woven fabrics of cotton', sharePct: 28 },
      { hsCode: '5402', description: 'Synthetic filament yarn', sharePct: 22 },
    ],
    electronics: [
      { hsCode: '8517', description: 'Telephones and communication apparatus', sharePct: 38 },
      { hsCode: '8471', description: 'Computers', sharePct: 25 },
    ],
    minerals: [
      { hsCode: '7210', description: 'Flat-rolled iron or steel', sharePct: 30 },
      { hsCode: '7601', description: 'Unwrought aluminium', sharePct: 22 },
    ],
  },
  MAR: {
    machinery: [
      { hsCode: '8471', description: 'Computers and processing units', sharePct: 18 },
      { hsCode: '8544', description: 'Insulated wire, cable', sharePct: 15 },
      { hsCode: '8481', description: 'Taps, cocks, valves', sharePct: 12 },
    ],
    agriculture: [
      { hsCode: '1001', description: 'Wheat and meslin', sharePct: 32 },
      { hsCode: '1005', description: 'Maize (corn)', sharePct: 18 },
      { hsCode: '1701', description: 'Cane or beet sugar', sharePct: 15 },
    ],
    petroleum: [
      { hsCode: '2710', description: 'Petroleum oils, refined', sharePct: 55 },
      { hsCode: '2711', description: 'Petroleum gases', sharePct: 25 },
    ],
    vehicles: [
      { hsCode: '8708', description: 'Parts and accessories for motor vehicles', sharePct: 45 },
      { hsCode: '8703', description: 'Motor cars for transport of persons', sharePct: 30 },
    ],
    chemicals: [
      { hsCode: '3004', description: 'Medicaments, packaged for retail sale', sharePct: 25 },
      { hsCode: '3901', description: 'Polymers of ethylene', sharePct: 18 },
    ],
    textiles: [
      { hsCode: '5208', description: 'Woven fabrics of cotton', sharePct: 30 },
      { hsCode: '5407', description: 'Woven fabrics of synthetic filament yarn', sharePct: 22 },
    ],
    electronics: [
      { hsCode: '8517', description: 'Telephones and communication apparatus', sharePct: 35 },
      { hsCode: '8471', description: 'Computers', sharePct: 25 },
    ],
    minerals: [
      { hsCode: '2701', description: 'Coal; briquettes', sharePct: 28 },
      { hsCode: '7210', description: 'Flat-rolled iron or steel', sharePct: 25 },
    ],
  },
  TZA: {
    machinery: [
      { hsCode: '8429', description: 'Self-propelled bulldozers, excavators', sharePct: 20 },
      { hsCode: '8419', description: 'Machinery for treatment of materials by heat', sharePct: 15 },
      { hsCode: '8471', description: 'Computers and processing units', sharePct: 12 },
    ],
    agriculture: [
      { hsCode: '1001', description: 'Wheat and meslin', sharePct: 28 },
      { hsCode: '1006', description: 'Rice', sharePct: 20 },
      { hsCode: '1511', description: 'Palm oil and its fractions', sharePct: 18 },
    ],
    petroleum: [
      { hsCode: '2710', description: 'Petroleum oils, refined', sharePct: 78 },
      { hsCode: '2711', description: 'Petroleum gases', sharePct: 12 },
    ],
    vehicles: [
      { hsCode: '8703', description: 'Motor cars for transport of persons', sharePct: 38 },
      { hsCode: '8704', description: 'Motor vehicles for goods transport', sharePct: 32 },
    ],
    chemicals: [
      { hsCode: '3004', description: 'Medicaments, packaged for retail sale', sharePct: 32 },
      { hsCode: '3105', description: 'Mineral or chemical fertilizers', sharePct: 25 },
    ],
    textiles: [
      { hsCode: '5208', description: 'Woven fabrics of cotton', sharePct: 30 },
      { hsCode: '6109', description: 'T-shirts, singlets, knitted', sharePct: 22 },
    ],
    electronics: [
      { hsCode: '8517', description: 'Telephones and communication apparatus', sharePct: 42 },
      { hsCode: '8471', description: 'Computers', sharePct: 22 },
    ],
    minerals: [
      { hsCode: '2523', description: 'Portland cement', sharePct: 32 },
      { hsCode: '7210', description: 'Flat-rolled iron or steel', sharePct: 28 },
    ],
  },
  SEN: {
    machinery: [
      { hsCode: '8429', description: 'Self-propelled bulldozers, excavators', sharePct: 18 },
      { hsCode: '8413', description: 'Pumps for liquids', sharePct: 15 },
      { hsCode: '8471', description: 'Computers and processing units', sharePct: 12 },
    ],
    agriculture: [
      { hsCode: '1006', description: 'Rice', sharePct: 35 },
      { hsCode: '1001', description: 'Wheat and meslin', sharePct: 22 },
      { hsCode: '1701', description: 'Cane or beet sugar', sharePct: 15 },
    ],
    petroleum: [
      { hsCode: '2710', description: 'Petroleum oils, refined', sharePct: 75 },
      { hsCode: '2711', description: 'Petroleum gases', sharePct: 15 },
    ],
    vehicles: [
      { hsCode: '8703', description: 'Motor cars for transport of persons', sharePct: 42 },
      { hsCode: '8704', description: 'Motor vehicles for goods transport', sharePct: 30 },
    ],
    chemicals: [
      { hsCode: '3004', description: 'Medicaments, packaged for retail sale', sharePct: 35 },
      { hsCode: '3105', description: 'Mineral or chemical fertilizers', sharePct: 25 },
    ],
    textiles: [
      { hsCode: '5208', description: 'Woven fabrics of cotton', sharePct: 32 },
      { hsCode: '6109', description: 'T-shirts, singlets, knitted', sharePct: 22 },
    ],
    electronics: [
      { hsCode: '8517', description: 'Telephones and communication apparatus', sharePct: 40 },
      { hsCode: '8471', description: 'Computers', sharePct: 22 },
    ],
    minerals: [
      { hsCode: '2523', description: 'Portland cement', sharePct: 35 },
      { hsCode: '7210', description: 'Flat-rolled iron or steel', sharePct: 28 },
    ],
  },
  AGO: {
    machinery: [
      { hsCode: '8429', description: 'Self-propelled bulldozers, excavators', sharePct: 22 },
      { hsCode: '8431', description: 'Parts for machinery', sharePct: 18 },
      { hsCode: '8471', description: 'Computers and processing units', sharePct: 12 },
    ],
    agriculture: [
      { hsCode: '1006', description: 'Rice', sharePct: 25 },
      { hsCode: '1001', description: 'Wheat and meslin', sharePct: 22 },
      { hsCode: '0202', description: 'Meat of bovine animals, frozen', sharePct: 18 },
    ],
    petroleum: [
      { hsCode: '2710', description: 'Petroleum oils, refined', sharePct: 70 },
      { hsCode: '2711', description: 'Petroleum gases', sharePct: 18 },
    ],
    vehicles: [
      { hsCode: '8703', description: 'Motor cars for transport of persons', sharePct: 40 },
      { hsCode: '8704', description: 'Motor vehicles for goods transport', sharePct: 35 },
    ],
    chemicals: [
      { hsCode: '3004', description: 'Medicaments, packaged for retail sale', sharePct: 32 },
      { hsCode: '3105', description: 'Mineral or chemical fertilizers', sharePct: 22 },
    ],
    textiles: [
      { hsCode: '5208', description: 'Woven fabrics of cotton', sharePct: 28 },
      { hsCode: '6109', description: 'T-shirts, singlets, knitted', sharePct: 25 },
    ],
    electronics: [
      { hsCode: '8517', description: 'Telephones and communication apparatus', sharePct: 42 },
      { hsCode: '8471', description: 'Computers', sharePct: 22 },
    ],
    minerals: [
      { hsCode: '2523', description: 'Portland cement', sharePct: 38 },
      { hsCode: '7210', description: 'Flat-rolled iron or steel', sharePct: 28 },
    ],
  },
  CMR: {
    machinery: [
      { hsCode: '8429', description: 'Self-propelled bulldozers, excavators', sharePct: 18 },
      { hsCode: '8517', description: 'Telephones and communication apparatus', sharePct: 15 },
      { hsCode: '8471', description: 'Computers and processing units', sharePct: 12 },
    ],
    agriculture: [
      { hsCode: '1006', description: 'Rice', sharePct: 28 },
      { hsCode: '1001', description: 'Wheat and meslin', sharePct: 22 },
      { hsCode: '0303', description: 'Fish, frozen', sharePct: 18 },
    ],
    petroleum: [
      { hsCode: '2710', description: 'Petroleum oils, refined', sharePct: 72 },
      { hsCode: '2711', description: 'Petroleum gases', sharePct: 15 },
    ],
    vehicles: [
      { hsCode: '8703', description: 'Motor cars for transport of persons', sharePct: 42 },
      { hsCode: '8704', description: 'Motor vehicles for goods transport', sharePct: 30 },
    ],
    chemicals: [
      { hsCode: '3004', description: 'Medicaments, packaged for retail sale', sharePct: 35 },
      { hsCode: '3105', description: 'Mineral or chemical fertilizers', sharePct: 22 },
    ],
    textiles: [
      { hsCode: '5208', description: 'Woven fabrics of cotton', sharePct: 30 },
      { hsCode: '6109', description: 'T-shirts, singlets, knitted', sharePct: 22 },
    ],
    electronics: [
      { hsCode: '8517', description: 'Telephones and communication apparatus', sharePct: 40 },
      { hsCode: '8471', description: 'Computers', sharePct: 22 },
    ],
    minerals: [
      { hsCode: '2523', description: 'Portland cement', sharePct: 35 },
      { hsCode: '7210', description: 'Flat-rolled iron or steel', sharePct: 28 },
    ],
  },
};

// Top intra-Africa trading countries
const AFCFTA_TRADING_HUBS = [
  { iso3: 'ZAF', name: 'South Africa', region: 'Africa', subRegion: 'Southern Africa' },
  { iso3: 'NGA', name: 'Nigeria', region: 'Africa', subRegion: 'Western Africa' },
  { iso3: 'EGY', name: 'Egypt', region: 'Africa', subRegion: 'Northern Africa' },
  { iso3: 'KEN', name: 'Kenya', region: 'Africa', subRegion: 'Eastern Africa' },
  { iso3: 'GHA', name: 'Ghana', region: 'Africa', subRegion: 'Western Africa' },
  { iso3: 'MAR', name: 'Morocco', region: 'Africa', subRegion: 'Northern Africa' },
  { iso3: 'ETH', name: 'Ethiopia', region: 'Africa', subRegion: 'Eastern Africa' },
  { iso3: 'TZA', name: 'Tanzania', region: 'Africa', subRegion: 'Eastern Africa' },
  { iso3: 'CIV', name: "Côte d'Ivoire", region: 'Africa', subRegion: 'Western Africa' },
  { iso3: 'SEN', name: 'Senegal', region: 'Africa', subRegion: 'Western Africa' },
  { iso3: 'AGO', name: 'Angola', region: 'Africa', subRegion: 'Southern Africa' },
  { iso3: 'CMR', name: 'Cameroon', region: 'Africa', subRegion: 'Central Africa' },
];

// Generate curated trade flow estimates
function generateTradeFlowRecords(): AfCFTATradeFlowRecord[] {
  const records: AfCFTATradeFlowRecord[] = [];
  const year = 2023;

  // Base values per country and category (curated estimates based on ITC Trade Map patterns)
  const countryBaseValues: Record<string, Record<string, { imports: number; exports: number; africaShare: number }>> = {
    ZAF: {
      machinery: { imports: 18_000_000_000, exports: 8_500_000_000, africaShare: 22 },
      minerals: { imports: 2_500_000_000, exports: 45_000_000_000, africaShare: 15 },
      petroleum: { imports: 15_000_000_000, exports: 3_200_000_000, africaShare: 8 },
      agriculture: { imports: 4_200_000_000, exports: 9_800_000_000, africaShare: 35 },
      textiles: { imports: 2_800_000_000, exports: 1_200_000_000, africaShare: 28 },
      chemicals: { imports: 8_500_000_000, exports: 4_500_000_000, africaShare: 32 },
      vehicles: { imports: 5_200_000_000, exports: 7_800_000_000, africaShare: 45 },
      electronics: { imports: 6_500_000_000, exports: 1_800_000_000, africaShare: 18 },
    },
    NGA: {
      machinery: { imports: 12_500_000_000, exports: 850_000_000, africaShare: 8 },
      minerals: { imports: 1_800_000_000, exports: 2_500_000_000, africaShare: 12 },
      petroleum: { imports: 8_500_000_000, exports: 48_000_000_000, africaShare: 18 },
      agriculture: { imports: 6_200_000_000, exports: 3_800_000_000, africaShare: 25 },
      textiles: { imports: 3_500_000_000, exports: 420_000_000, africaShare: 15 },
      chemicals: { imports: 5_200_000_000, exports: 850_000_000, africaShare: 18 },
      vehicles: { imports: 4_800_000_000, exports: 180_000_000, africaShare: 12 },
      electronics: { imports: 4_200_000_000, exports: 320_000_000, africaShare: 10 },
    },
    EGY: {
      machinery: { imports: 9_500_000_000, exports: 2_200_000_000, africaShare: 15 },
      minerals: { imports: 3_200_000_000, exports: 1_800_000_000, africaShare: 18 },
      petroleum: { imports: 8_200_000_000, exports: 6_500_000_000, africaShare: 12 },
      agriculture: { imports: 12_500_000_000, exports: 4_200_000_000, africaShare: 22 },
      textiles: { imports: 2_800_000_000, exports: 3_500_000_000, africaShare: 28 },
      chemicals: { imports: 7_200_000_000, exports: 3_800_000_000, africaShare: 20 },
      vehicles: { imports: 4_500_000_000, exports: 850_000_000, africaShare: 18 },
      electronics: { imports: 5_800_000_000, exports: 1_200_000_000, africaShare: 14 },
    },
    KEN: {
      machinery: { imports: 3_500_000_000, exports: 580_000_000, africaShare: 32 },
      minerals: { imports: 850_000_000, exports: 420_000_000, africaShare: 25 },
      petroleum: { imports: 4_800_000_000, exports: 580_000_000, africaShare: 8 },
      agriculture: { imports: 1_800_000_000, exports: 3_200_000_000, africaShare: 42 },
      textiles: { imports: 1_200_000_000, exports: 520_000_000, africaShare: 35 },
      chemicals: { imports: 2_500_000_000, exports: 420_000_000, africaShare: 38 },
      vehicles: { imports: 1_800_000_000, exports: 180_000_000, africaShare: 28 },
      electronics: { imports: 1_500_000_000, exports: 120_000_000, africaShare: 22 },
    },
    GHA: {
      machinery: { imports: 2_800_000_000, exports: 320_000_000, africaShare: 18 },
      minerals: { imports: 580_000_000, exports: 8_500_000_000, africaShare: 5 },
      petroleum: { imports: 3_500_000_000, exports: 4_200_000_000, africaShare: 12 },
      agriculture: { imports: 1_500_000_000, exports: 4_500_000_000, africaShare: 28 },
      textiles: { imports: 850_000_000, exports: 180_000_000, africaShare: 20 },
      chemicals: { imports: 1_800_000_000, exports: 280_000_000, africaShare: 22 },
      vehicles: { imports: 1_200_000_000, exports: 85_000_000, africaShare: 15 },
      electronics: { imports: 1_100_000_000, exports: 65_000_000, africaShare: 12 },
    },
    MAR: {
      machinery: { imports: 7_500_000_000, exports: 2_800_000_000, africaShare: 18 },
      minerals: { imports: 2_200_000_000, exports: 5_800_000_000, africaShare: 8 },
      petroleum: { imports: 6_800_000_000, exports: 850_000_000, africaShare: 5 },
      agriculture: { imports: 3_500_000_000, exports: 6_200_000_000, africaShare: 15 },
      textiles: { imports: 3_200_000_000, exports: 4_500_000_000, africaShare: 12 },
      chemicals: { imports: 3_800_000_000, exports: 2_500_000_000, africaShare: 18 },
      vehicles: { imports: 4_200_000_000, exports: 2_200_000_000, africaShare: 22 },
      electronics: { imports: 3_500_000_000, exports: 1_800_000_000, africaShare: 15 },
    },
    ETH: {
      machinery: { imports: 3_200_000_000, exports: 120_000_000, africaShare: 25 },
      minerals: { imports: 420_000_000, exports: 180_000_000, africaShare: 35 },
      petroleum: { imports: 3_800_000_000, exports: 85_000_000, africaShare: 5 },
      agriculture: { imports: 1_200_000_000, exports: 2_800_000_000, africaShare: 18 },
      textiles: { imports: 580_000_000, exports: 420_000_000, africaShare: 28 },
      chemicals: { imports: 1_500_000_000, exports: 85_000_000, africaShare: 22 },
      vehicles: { imports: 1_200_000_000, exports: 25_000_000, africaShare: 18 },
      electronics: { imports: 850_000_000, exports: 35_000_000, africaShare: 15 },
    },
    TZA: {
      machinery: { imports: 2_500_000_000, exports: 180_000_000, africaShare: 28 },
      minerals: { imports: 350_000_000, exports: 2_800_000_000, africaShare: 12 },
      petroleum: { imports: 2_800_000_000, exports: 120_000_000, africaShare: 8 },
      agriculture: { imports: 1_100_000_000, exports: 1_800_000_000, africaShare: 45 },
      textiles: { imports: 680_000_000, exports: 180_000_000, africaShare: 32 },
      chemicals: { imports: 1_200_000_000, exports: 120_000_000, africaShare: 35 },
      vehicles: { imports: 950_000_000, exports: 45_000_000, africaShare: 25 },
      electronics: { imports: 720_000_000, exports: 35_000_000, africaShare: 18 },
    },
    CIV: {
      machinery: { imports: 1_800_000_000, exports: 280_000_000, africaShare: 22 },
      minerals: { imports: 420_000_000, exports: 580_000_000, africaShare: 15 },
      petroleum: { imports: 2_200_000_000, exports: 1_800_000_000, africaShare: 12 },
      agriculture: { imports: 1_200_000_000, exports: 8_500_000_000, africaShare: 28 },
      textiles: { imports: 580_000_000, exports: 120_000_000, africaShare: 25 },
      chemicals: { imports: 1_100_000_000, exports: 180_000_000, africaShare: 28 },
      vehicles: { imports: 720_000_000, exports: 65_000_000, africaShare: 18 },
      electronics: { imports: 580_000_000, exports: 45_000_000, africaShare: 15 },
    },
    SEN: {
      machinery: { imports: 1_500_000_000, exports: 120_000_000, africaShare: 28 },
      minerals: { imports: 280_000_000, exports: 850_000_000, africaShare: 18 },
      petroleum: { imports: 1_800_000_000, exports: 180_000_000, africaShare: 10 },
      agriculture: { imports: 1_100_000_000, exports: 1_200_000_000, africaShare: 35 },
      textiles: { imports: 420_000_000, exports: 85_000_000, africaShare: 30 },
      chemicals: { imports: 850_000_000, exports: 120_000_000, africaShare: 32 },
      vehicles: { imports: 580_000_000, exports: 35_000_000, africaShare: 22 },
      electronics: { imports: 480_000_000, exports: 25_000_000, africaShare: 18 },
    },
    AGO: {
      machinery: { imports: 3_500_000_000, exports: 85_000_000, africaShare: 12 },
      minerals: { imports: 180_000_000, exports: 280_000_000, africaShare: 8 },
      petroleum: { imports: 850_000_000, exports: 35_000_000_000, africaShare: 5 },
      agriculture: { imports: 2_800_000_000, exports: 180_000_000, africaShare: 18 },
      textiles: { imports: 580_000_000, exports: 25_000_000, africaShare: 15 },
      chemicals: { imports: 1_200_000_000, exports: 45_000_000, africaShare: 12 },
      vehicles: { imports: 1_500_000_000, exports: 35_000_000, africaShare: 10 },
      electronics: { imports: 850_000_000, exports: 18_000_000, africaShare: 8 },
    },
    CMR: {
      machinery: { imports: 1_500_000_000, exports: 180_000_000, africaShare: 25 },
      minerals: { imports: 280_000_000, exports: 420_000_000, africaShare: 18 },
      petroleum: { imports: 1_200_000_000, exports: 2_800_000_000, africaShare: 15 },
      agriculture: { imports: 850_000_000, exports: 1_800_000_000, africaShare: 35 },
      textiles: { imports: 380_000_000, exports: 85_000_000, africaShare: 28 },
      chemicals: { imports: 720_000_000, exports: 120_000_000, africaShare: 30 },
      vehicles: { imports: 520_000_000, exports: 45_000_000, africaShare: 22 },
      electronics: { imports: 420_000_000, exports: 35_000_000, africaShare: 18 },
    },
  };

  // Top trading partners within Africa by region
  const regionalPartners: Record<string, Array<{ iso3: string; country: string }>> = {
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
      { iso3: 'TCD', country: 'Chad' },
    ],
  };

  // Generate records for each country, category, and direction
  for (const country of AFCFTA_TRADING_HUBS) {
    const countryData = countryBaseValues[country.iso3];
    if (!countryData) continue;

    for (const [categoryKey, categoryMeta] of Object.entries(AFCFTA_CATEGORIES)) {
      const data = countryData[categoryKey];
      if (!data) continue;

      const partners = regionalPartners[country.subRegion] || regionalPartners['Western Africa'];
      const otherPartners = partners.filter(p => p.iso3 !== country.iso3).slice(0, 3);

      // Generate top partners with trade values
      const topPartners = otherPartners.map((p, idx) => ({
        iso3: p.iso3,
        country: p.country,
        sharePct: Math.max(5, 35 - idx * 12 + (Math.random() - 0.5) * 8),
        valueUsd: Math.round(data.imports * (0.35 - idx * 0.12) * (data.africaShare / 100) * (0.8 + Math.random() * 0.4)),
      }));

      // AfCFTA tariff estimates
      const mfnTariff = 8 + Math.random() * 12;
      const afcftaTariff = Math.max(0, mfnTariff * (0.2 + Math.random() * 0.3));
      const prefMargin = mfnTariff - afcftaTariff;

      // Get top import products for this country/category (if available)
      const topImportProducts = (COUNTRY_TOP_IMPORT_PRODUCTS[country.iso3]?.[categoryKey] || []).map(p => ({
        hsCode: p.hsCode,
        description: p.description,
        sharePct: p.sharePct,
        valueUsd: Math.round(data.imports * (p.sharePct / 100)),
      }));

      // Import record - includes product-level breakdown from COUNTRY_TOP_IMPORT_PRODUCTS
      records.push({
        iso3: country.iso3,
        country_name: country.name,
        region: country.region,
        sub_region: country.subRegion,
        direction: 'imports',
        year,
        hs_chapter: categoryMeta.hsChapter,
        category_group: categoryKey,
        category_label: categoryMeta.label,
        total_trade_usd: data.imports,
        intra_africa_trade_usd: Math.round(data.imports * (data.africaShare / 100)),
        intra_africa_share_pct: data.africaShare,
        trade_with_us_usd: Math.round(data.imports * 0.08),
        trade_with_eu_usd: Math.round(data.imports * 0.25),
        trade_with_china_usd: Math.round(data.imports * 0.22),
        afcfta_tariff_pct: Math.round(afcftaTariff * 10) / 10,
        mfn_tariff_pct: Math.round(mfnTariff * 10) / 10,
        preference_margin_pct: Math.round(prefMargin * 10) / 10,
        roo_compliant: Math.random() > 0.25,
        yoy_growth_pct: Math.round((5 + (Math.random() - 0.3) * 15) * 10) / 10,
        top_partners: topPartners,
        top_products: topImportProducts,
        source_notes: 'AfCFTA Secretariat · ITC Trade Map · UN Comtrade (curated estimates)',
        data_quality_tier: 'A', // Original 12 hubs are Tier A
      });

      // Export record - includes product-level breakdown from COUNTRY_TOP_PRODUCTS
      const exportPartners = topPartners.map(p => ({
        ...p,
        valueUsd: Math.round(data.exports * (p.sharePct / 100) * (data.africaShare / 100) * (0.7 + Math.random() * 0.6)),
      }));

      // Get top export products for this country/category (if available)
      const topExportProducts = (COUNTRY_TOP_PRODUCTS[country.iso3]?.[categoryKey] || []).map(p => ({
        hsCode: p.hsCode,
        description: p.description,
        sharePct: p.sharePct,
        valueUsd: Math.round(data.exports * (p.sharePct / 100)),
      }));

      records.push({
        iso3: country.iso3,
        country_name: country.name,
        region: country.region,
        sub_region: country.subRegion,
        direction: 'exports',
        year,
        hs_chapter: categoryMeta.hsChapter,
        category_group: categoryKey,
        category_label: categoryMeta.label,
        total_trade_usd: data.exports,
        intra_africa_trade_usd: Math.round(data.exports * (data.africaShare / 100)),
        intra_africa_share_pct: data.africaShare,
        trade_with_us_usd: Math.round(data.exports * 0.12),
        trade_with_eu_usd: Math.round(data.exports * 0.28),
        trade_with_china_usd: Math.round(data.exports * 0.18),
        afcfta_tariff_pct: Math.round(afcftaTariff * 10) / 10,
        mfn_tariff_pct: Math.round(mfnTariff * 10) / 10,
        preference_margin_pct: Math.round(prefMargin * 10) / 10,
        roo_compliant: Math.random() > 0.2,
        yoy_growth_pct: Math.round((8 + (Math.random() - 0.3) * 18) * 10) / 10,
        top_partners: exportPartners,
        top_products: topExportProducts,
        source_notes: 'AfCFTA Secretariat · ITC Trade Map · UN Comtrade (curated estimates)',
        data_quality_tier: 'A', // Original 12 hubs are Tier A
      });
    }
  }

  return records;
}

// Generate records for Tier B/C countries (not in original 12 hubs)
function generateExpandedTradeFlowRecords(): AfCFTATradeFlowRecord[] {
  const records: AfCFTATradeFlowRecord[] = [];
  const year = 2023;
  
  // Filter to countries NOT in original 12 hubs
  const expandedCountries = AFRICAN_COUNTRIES_FULL.filter(c => !TIER_A_HUBS.includes(c.iso3));
  
  for (const country of expandedCountries) {
    for (const [categoryKey, multipliers] of Object.entries(AFCFTA_CATEGORY_MULTIPLIERS)) {
      const categoryMeta = AFCFTA_CATEGORIES[categoryKey as keyof typeof AFCFTA_CATEGORIES];
      if (!categoryMeta) continue;
      
      // Calculate trade values based on GDP and trade openness
      const gdpUsd = country.gdpBillions * 1_000_000_000;
      const totalImports = Math.round(gdpUsd * multipliers.importMult * country.tradeOpenness * (0.8 + Math.random() * 0.4));
      const totalExports = Math.round(gdpUsd * multipliers.exportMult * country.tradeOpenness * (0.8 + Math.random() * 0.4));
      
      // Intra-Africa trade share varies by tier
      const tierMultiplier = country.tier === 'B' ? 0.9 : 0.7;
      const africaShareBase = (multipliers.africaShareRange[0] + multipliers.africaShareRange[1]) / 2;
      const africaShareImports = africaShareBase * tierMultiplier * (0.85 + Math.random() * 0.3);
      const africaShareExports = africaShareBase * tierMultiplier * (0.85 + Math.random() * 0.3);
      
      // Get regional partners
      const partners = AFCFTA_REGIONAL_PARTNERS[country.subRegion] || AFCFTA_REGIONAL_PARTNERS['Western Africa'];
      const filteredPartners = partners.filter(p => p.iso3 !== country.iso3).slice(0, 3);
      
      const topPartners = filteredPartners.map((p, idx) => ({
        iso3: p.iso3,
        country: p.country,
        sharePct: Math.max(5, 30 - idx * 10 + (Math.random() - 0.5) * 8),
        valueUsd: Math.round(totalImports * (0.25 - idx * 0.08) * (africaShareImports / 100)),
      }));
      
      // Tariff estimates
      const mfnTariff = 8 + Math.random() * 12;
      const afcftaTariff = Math.max(0, mfnTariff * (0.2 + Math.random() * 0.3));
      const prefMargin = mfnTariff - afcftaTariff;
      
      // Generic products for this category
      const genericProducts = GENERIC_TOP_PRODUCTS[categoryKey] || GENERIC_TOP_PRODUCTS.agriculture;
      
      const topImportProducts = genericProducts.imports.map(p => ({
        hsCode: p.hsCode,
        description: p.description,
        sharePct: p.sharePct,
        valueUsd: Math.round(totalImports * (p.sharePct / 100)),
      }));
      
      const topExportProducts = genericProducts.exports.map(p => ({
        hsCode: p.hsCode,
        description: p.description,
        sharePct: p.sharePct,
        valueUsd: Math.round(totalExports * (p.sharePct / 100)),
      }));
      
      const sourceNotes = country.tier === 'B'
        ? 'Regional benchmark estimates · AfCFTA Secretariat patterns'
        : 'Conservative projections pending Phase 1 live data';
      
      // Import record
      records.push({
        iso3: country.iso3,
        country_name: country.name,
        region: country.region,
        sub_region: country.subRegion,
        direction: 'imports',
        year,
        hs_chapter: categoryMeta.hsChapter,
        category_group: categoryKey,
        category_label: categoryMeta.label,
        total_trade_usd: totalImports,
        intra_africa_trade_usd: Math.round(totalImports * (africaShareImports / 100)),
        intra_africa_share_pct: Math.round(africaShareImports * 10) / 10,
        trade_with_us_usd: Math.round(totalImports * 0.06),
        trade_with_eu_usd: Math.round(totalImports * 0.22),
        trade_with_china_usd: Math.round(totalImports * 0.28),
        afcfta_tariff_pct: Math.round(afcftaTariff * 10) / 10,
        mfn_tariff_pct: Math.round(mfnTariff * 10) / 10,
        preference_margin_pct: Math.round(prefMargin * 10) / 10,
        roo_compliant: Math.random() > 0.35,
        yoy_growth_pct: Math.round((3 + (Math.random() - 0.3) * 12) * 10) / 10,
        top_partners: topPartners,
        top_products: topImportProducts,
        source_notes: sourceNotes,
        data_quality_tier: country.tier,
      });
      
      // Export record
      const exportPartners = topPartners.map(p => ({
        ...p,
        valueUsd: Math.round(totalExports * (p.sharePct / 100) * (africaShareExports / 100)),
      }));
      
      records.push({
        iso3: country.iso3,
        country_name: country.name,
        region: country.region,
        sub_region: country.subRegion,
        direction: 'exports',
        year,
        hs_chapter: categoryMeta.hsChapter,
        category_group: categoryKey,
        category_label: categoryMeta.label,
        total_trade_usd: totalExports,
        intra_africa_trade_usd: Math.round(totalExports * (africaShareExports / 100)),
        intra_africa_share_pct: Math.round(africaShareExports * 10) / 10,
        trade_with_us_usd: Math.round(totalExports * 0.10),
        trade_with_eu_usd: Math.round(totalExports * 0.30),
        trade_with_china_usd: Math.round(totalExports * 0.20),
        afcfta_tariff_pct: Math.round(afcftaTariff * 10) / 10,
        mfn_tariff_pct: Math.round(mfnTariff * 10) / 10,
        preference_margin_pct: Math.round(prefMargin * 10) / 10,
        roo_compliant: Math.random() > 0.3,
        yoy_growth_pct: Math.round((5 + (Math.random() - 0.3) * 15) * 10) / 10,
        top_partners: exportPartners,
        top_products: topExportProducts,
        source_notes: sourceNotes,
        data_quality_tier: country.tier,
      });
    }
  }
  
  return records;
}

export async function ingestAfCFTAFlows(): Promise<IngestAdapterResult> {
  console.log('[ingest-afcfta-flows] Seeding AfCFTA trade flow signals (Phase 0.6 expanded)...\n');

  // Combine Tier A (original 12 hubs) with Tier B/C (remaining 42 countries)
  const tierARecords = generateTradeFlowRecords();
  const tierBCRecords = generateExpandedTradeFlowRecords();
  const records = [...tierARecords, ...tierBCRecords];
  
  const uniqueCountries = new Set(records.map(r => r.iso3));
  console.log(`  → ${records.length} records across ${uniqueCountries.size} markets`);
  console.log(`    • Tier A (curated): ${tierARecords.length} records (12 hubs)`);
  console.log(`    • Tier B/C (expanded): ${tierBCRecords.length} records (42 countries)\n`);

  // Create ingestion job (sourceKey, jobType)
  const job = await createIngestionJob('un_comtrade', 'afcfta-flows');

  // Upsert records
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);

  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    const { error } = await supabase
      .from('souvera_afcfta_trade_flows')
      .upsert({
        iso3: record.iso3,
        country_name: record.country_name,
        region: record.region,
        sub_region: record.sub_region,
        direction: record.direction,
        year: record.year,
        hs_chapter: record.hs_chapter,
        category_group: record.category_group,
        category_label: record.category_label,
        total_trade_usd: record.total_trade_usd,
        intra_africa_trade_usd: record.intra_africa_trade_usd,
        intra_africa_share_pct: record.intra_africa_share_pct,
        trade_with_us_usd: record.trade_with_us_usd,
        trade_with_eu_usd: record.trade_with_eu_usd,
        trade_with_china_usd: record.trade_with_china_usd,
        afcfta_tariff_pct: record.afcfta_tariff_pct,
        mfn_tariff_pct: record.mfn_tariff_pct,
        preference_margin_pct: record.preference_margin_pct,
        roo_compliant: record.roo_compliant,
        yoy_growth_pct: record.yoy_growth_pct,
        top_partners: record.top_partners,
        top_products: record.top_products ?? [],
        source_notes: record.source_notes,
        confidence_level: 'estimated',
        data_quality_tier: record.data_quality_tier,
      }, {
        onConflict: 'iso3,direction,year,category_group',
      });

    if (error) {
      console.error(`  ✗ ${record.country_name} ${record.direction} ${record.category_group}: ${error.message}`);
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

export default ingestAfCFTAFlows;
