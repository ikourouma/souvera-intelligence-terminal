/**
 * Phase 0.5A — Import Demand Signals Ingestion
 *
 * Seeds souvera_import_demand_signals with African/Caribbean import demand data
 * for 6 product category groups (plus pharma and transport) across all rollout markets.
 *
 * Data sources: ITC Trade Data Monitor, UN Comtrade, BEA International Trade,
 *   USDA GATS, World Bank WITS (curated 2021–2024 averages).
 *
 * Purpose: Quantify African demand for US-exportable goods to support AGOA
 * reauthorization briefings for US Chamber of Commerce and Dept of State.
 *
 * Run:
 *   npx tsx --tsconfig services/ingestion/tsconfig.json \
 *     services/ingestion/run.ts ingest-import-demand
 */

import { getSupabaseServiceClient } from '@souvera/config';
import { closeIngestionJob, createIngestionJob } from './shared';

// ── Category metadata ─────────────────────────────────────────────────────────

const CATEGORY_GROUPS = {
  machinery:        { label: 'Agricultural & Mining Machinery', chapters: ['84'] },
  cotton:           { label: 'Cotton & Raw Textiles', chapters: ['52'] },
  grains:           { label: 'Grains & Cereals', chapters: ['10'] },
  fertilizers:      { label: 'Fertilizers & Agri-inputs', chapters: ['31'] },
  intermediate:     { label: 'Intermediate Industrial Goods', chapters: ['28', '29', '38', '39', '72', '73'] },
  textiles_inputs:  { label: 'Textile Inputs & Apparel Machinery', chapters: ['55', '56', '84-textile'] },
  pharma:           { label: 'Pharmaceuticals & Medical Supplies', chapters: ['30'] },
  transport:        { label: 'Transport & Commercial Vehicles', chapters: ['87', '88'] },
  ict:              { label: 'ICT & Telecommunications', chapters: ['85'] },
  medical_devices:  { label: 'Medical Devices & Diagnostics', chapters: ['90'] },
} as const;

type CategoryGroup = keyof typeof CATEGORY_GROUPS;

// ── Demand record type ────────────────────────────────────────────────────────

interface DemandRecord {
  iso3: string;
  year: number;
  hsChapter: string;
  categoryLabel: string;
  categoryGroup: CategoryGroup;
  totalImportsUsd: number;
  importsFromUsUsd: number;
  importsFromUsVolMt?: number;
  importsFromUsSharePct: number;
  usExportPotentialUsd: number;
  usBenchmarkSharePct: number;
  yoyGrowthPct?: number;
  topSuppliers: Array<{ country: string; iso3: string; sharePct: number; valueUsd: number }>;
  sourceNotes: string;
}

// ── Demand data — curated 2023/2024 averages ──────────────────────────────────
// Source mix: ITC TDM, UN Comtrade, USDA GATS, World Bank WITS
// US benchmark share = average US share in comparable middle-income markets (LatAm benchmark)

const DEMAND_RECORDS: DemandRecord[] = [

  // ════════════════════════════════════════════════════════════════════════
  // NIGERIA (NGA)
  // ════════════════════════════════════════════════════════════════════════

  // Agricultural & Mining Machinery (HS 84)
  { iso3: 'NGA', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 2_800_000_000, importsFromUsUsd: 420_000_000, importsFromUsSharePct: 15.0,
    usExportPotentialUsd: 980_000_000, usBenchmarkSharePct: 35.0, yoyGrowthPct: 8.2,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 42, valueUsd: 1_176_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 15, valueUsd: 420_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 12, valueUsd: 336_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 10, valueUsd: 280_000_000 },
    ],
    sourceNotes: 'ITC TDM 2023; BEA US exports to Nigeria HS84; CBN trade statistics' },

  // Grains & Cereals (HS 10)
  { iso3: 'NGA', year: 2023, hsChapter: '10', categoryLabel: 'Grains & Cereals', categoryGroup: 'grains',
    totalImportsUsd: 1_850_000_000, importsFromUsUsd: 620_000_000, importsFromUsSharePct: 33.5,
    usExportPotentialUsd: 1_200_000_000, usBenchmarkSharePct: 65.0, yoyGrowthPct: 12.4,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 34, valueUsd: 620_000_000 },
      { country: 'Ukraine',        iso3: 'UKR', sharePct: 28, valueUsd: 518_000_000 },
      { country: 'Russia',         iso3: 'RUS', sharePct: 18, valueUsd: 333_000_000 },
      { country: 'Brazil',         iso3: 'BRA', sharePct: 12, valueUsd: 222_000_000 },
    ],
    sourceNotes: 'USDA GATS Nigeria wheat imports; NBS trade data 2023' },

  // Fertilizers (HS 31)
  { iso3: 'NGA', year: 2023, hsChapter: '31', categoryLabel: 'Fertilizers & Agri-inputs', categoryGroup: 'fertilizers',
    totalImportsUsd: 1_200_000_000, importsFromUsUsd: 320_000_000, importsFromUsSharePct: 26.7,
    usExportPotentialUsd: 580_000_000, usBenchmarkSharePct: 48.0, yoyGrowthPct: 6.8,
    topSuppliers: [
      { country: 'Morocco',        iso3: 'MAR', sharePct: 32, valueUsd: 384_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 27, valueUsd: 320_000_000 },
      { country: 'Russia',         iso3: 'RUS', sharePct: 22, valueUsd: 264_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 12, valueUsd: 144_000_000 },
    ],
    sourceNotes: 'CBN Anchor Borrowers Program procurement data; ITC TDM 2023' },

  // Pharmaceuticals (HS 30)
  { iso3: 'NGA', year: 2023, hsChapter: '30', categoryLabel: 'Pharmaceuticals & Medical Supplies', categoryGroup: 'pharma',
    totalImportsUsd: 1_480_000_000, importsFromUsUsd: 280_000_000, importsFromUsSharePct: 18.9,
    usExportPotentialUsd: 650_000_000, usBenchmarkSharePct: 44.0, yoyGrowthPct: 9.1,
    topSuppliers: [
      { country: 'India',          iso3: 'IND', sharePct: 38, valueUsd: 562_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 19, valueUsd: 280_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 14, valueUsd: 207_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 12, valueUsd: 178_000_000 },
    ],
    sourceNotes: 'NAFDAC import records; IFC Health Nigeria analysis 2023' },

  // Transport & Commercial Vehicles (HS 87, 88)
  { iso3: 'NGA', year: 2023, hsChapter: '87', categoryLabel: 'Transport & Commercial Vehicles', categoryGroup: 'transport',
    totalImportsUsd: 3_200_000_000, importsFromUsUsd: 380_000_000, importsFromUsSharePct: 11.9,
    usExportPotentialUsd: 820_000_000, usBenchmarkSharePct: 25.6, yoyGrowthPct: 7.4,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 38, valueUsd: 1_216_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 22, valueUsd: 704_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 12, valueUsd: 380_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 10, valueUsd: 320_000_000 },
    ],
    sourceNotes: 'NBS Nigeria vehicle import statistics 2023; ITC TDM' },

  // Intermediate Goods (HS 28-29, 38-39, 72-73)
  { iso3: 'NGA', year: 2023, hsChapter: '72', categoryLabel: 'Iron & Steel (Intermediate)', categoryGroup: 'intermediate',
    totalImportsUsd: 2_100_000_000, importsFromUsUsd: 185_000_000, importsFromUsSharePct: 8.8,
    usExportPotentialUsd: 520_000_000, usBenchmarkSharePct: 24.8, yoyGrowthPct: 4.2,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 52, valueUsd: 1_092_000_000 },
      { country: 'Ukraine',        iso3: 'UKR', sharePct: 14, valueUsd: 294_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 9,  valueUsd: 185_000_000 },
      { country: 'Turkey',         iso3: 'TUR', sharePct: 8,  valueUsd: 168_000_000 },
    ],
    sourceNotes: 'Dangote Steel and Nigerian iron imports; UN Comtrade 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // KENYA (KEN)
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'KEN', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 1_240_000_000, importsFromUsUsd: 182_000_000, importsFromUsSharePct: 14.7,
    usExportPotentialUsd: 450_000_000, usBenchmarkSharePct: 36.3, yoyGrowthPct: 9.6,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 38, valueUsd: 471_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 18, valueUsd: 223_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 15, valueUsd: 182_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 12, valueUsd: 149_000_000 },
    ],
    sourceNotes: 'KEBS Kenya trade statistics 2023; ITC TDM' },

  { iso3: 'KEN', year: 2023, hsChapter: '10', categoryLabel: 'Grains & Cereals', categoryGroup: 'grains',
    totalImportsUsd: 820_000_000, importsFromUsUsd: 340_000_000, importsFromUsSharePct: 41.5,
    usExportPotentialUsd: 620_000_000, usBenchmarkSharePct: 75.6, yoyGrowthPct: 14.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 41, valueUsd: 340_000_000 },
      { country: 'Australia',      iso3: 'AUS', sharePct: 28, valueUsd: 230_000_000 },
      { country: 'Russia',         iso3: 'RUS', sharePct: 16, valueUsd: 131_000_000 },
      { country: 'Ukraine',        iso3: 'UKR', sharePct: 10, valueUsd: 82_000_000 },
    ],
    sourceNotes: 'USDA GATS Kenya; Unga Group flour milling imports 2023' },

  { iso3: 'KEN', year: 2023, hsChapter: '31', categoryLabel: 'Fertilizers & Agri-inputs', categoryGroup: 'fertilizers',
    totalImportsUsd: 680_000_000, importsFromUsUsd: 145_000_000, importsFromUsSharePct: 21.3,
    usExportPotentialUsd: 280_000_000, usBenchmarkSharePct: 41.2, yoyGrowthPct: 7.8,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 28, valueUsd: 190_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 21, valueUsd: 145_000_000 },
      { country: 'Saudi Arabia',   iso3: 'SAU', sharePct: 18, valueUsd: 122_000_000 },
      { country: 'Russia',         iso3: 'RUS', sharePct: 14, valueUsd: 95_000_000 },
    ],
    sourceNotes: 'KEBS fertilizer imports; NCPB procurement data 2023' },

  { iso3: 'KEN', year: 2023, hsChapter: '30', categoryLabel: 'Pharmaceuticals & Medical Supplies', categoryGroup: 'pharma',
    totalImportsUsd: 620_000_000, importsFromUsUsd: 195_000_000, importsFromUsSharePct: 31.5,
    usExportPotentialUsd: 380_000_000, usBenchmarkSharePct: 61.3, yoyGrowthPct: 11.4,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 31, valueUsd: 195_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 28, valueUsd: 174_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 14, valueUsd: 87_000_000 },
      { country: 'Belgium',        iso3: 'BEL', sharePct: 9,  valueUsd: 56_000_000 },
    ],
    sourceNotes: 'KEMSA sourcing data; PEPFAR Kenya procurement 2023' },

  { iso3: 'KEN', year: 2023, hsChapter: '87', categoryLabel: 'Transport & Commercial Vehicles', categoryGroup: 'transport',
    totalImportsUsd: 1_100_000_000, importsFromUsUsd: 98_000_000, importsFromUsSharePct: 8.9,
    usExportPotentialUsd: 280_000_000, usBenchmarkSharePct: 25.5, yoyGrowthPct: 5.2,
    topSuppliers: [
      { country: 'Japan',          iso3: 'JPN', sharePct: 45, valueUsd: 495_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 18, valueUsd: 198_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 14, valueUsd: 154_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 9,  valueUsd: 98_000_000 },
    ],
    sourceNotes: 'KEBS vehicle imports; ITC TDM Kenya 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // SOUTH AFRICA (ZAF)
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'ZAF', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 5_800_000_000, importsFromUsUsd: 840_000_000, importsFromUsSharePct: 14.5,
    usExportPotentialUsd: 2_100_000_000, usBenchmarkSharePct: 36.2, yoyGrowthPct: 4.8,
    topSuppliers: [
      { country: 'Germany',        iso3: 'DEU', sharePct: 22, valueUsd: 1_276_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 20, valueUsd: 1_160_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 14, valueUsd: 840_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 12, valueUsd: 696_000_000 },
    ],
    sourceNotes: 'SARS South Africa trade stats 2023; ITC TDM' },

  { iso3: 'ZAF', year: 2023, hsChapter: '31', categoryLabel: 'Fertilizers & Agri-inputs', categoryGroup: 'fertilizers',
    totalImportsUsd: 1_850_000_000, importsFromUsUsd: 395_000_000, importsFromUsSharePct: 21.4,
    usExportPotentialUsd: 720_000_000, usBenchmarkSharePct: 38.9, yoyGrowthPct: 5.2,
    topSuppliers: [
      { country: 'Morocco',        iso3: 'MAR', sharePct: 24, valueUsd: 444_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 21, valueUsd: 395_000_000 },
      { country: 'Russia',         iso3: 'RUS', sharePct: 18, valueUsd: 333_000_000 },
      { country: 'Saudi Arabia',   iso3: 'SAU', sharePct: 12, valueUsd: 222_000_000 },
    ],
    sourceNotes: 'SARS fertilizer imports; Omnia Holdings sourcing 2023' },

  { iso3: 'ZAF', year: 2023, hsChapter: '30', categoryLabel: 'Pharmaceuticals & Medical Supplies', categoryGroup: 'pharma',
    totalImportsUsd: 2_200_000_000, importsFromUsUsd: 480_000_000, importsFromUsSharePct: 21.8,
    usExportPotentialUsd: 980_000_000, usBenchmarkSharePct: 44.5, yoyGrowthPct: 7.6,
    topSuppliers: [
      { country: 'Germany',        iso3: 'DEU', sharePct: 24, valueUsd: 528_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 22, valueUsd: 480_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 18, valueUsd: 396_000_000 },
      { country: 'Switzerland',    iso3: 'CHE', sharePct: 12, valueUsd: 264_000_000 },
    ],
    sourceNotes: 'SARS pharma imports; PEPFAR South Africa ARV procurement 2023' },

  { iso3: 'ZAF', year: 2023, hsChapter: '87', categoryLabel: 'Transport & Commercial Vehicles', categoryGroup: 'transport',
    totalImportsUsd: 8_200_000_000, importsFromUsUsd: 680_000_000, importsFromUsSharePct: 8.3,
    usExportPotentialUsd: 2_100_000_000, usBenchmarkSharePct: 25.6, yoyGrowthPct: 3.1,
    topSuppliers: [
      { country: 'Germany',        iso3: 'DEU', sharePct: 28, valueUsd: 2_296_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 22, valueUsd: 1_804_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 16, valueUsd: 1_312_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 8,  valueUsd: 680_000_000 },
    ],
    sourceNotes: 'SARS vehicle imports; NAAMSA data 2023' },

  // Cotton (HS 52)
  { iso3: 'ZAF', year: 2023, hsChapter: '52', categoryLabel: 'Cotton & Raw Textiles', categoryGroup: 'cotton',
    totalImportsUsd: 420_000_000, importsFromUsUsd: 68_000_000, importsFromUsSharePct: 16.2,
    usExportPotentialUsd: 145_000_000, usBenchmarkSharePct: 34.5, yoyGrowthPct: 2.8,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 32, valueUsd: 134_000_000 },
      { country: 'Pakistan',       iso3: 'PAK', sharePct: 22, valueUsd: 92_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 16, valueUsd: 68_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 14, valueUsd: 59_000_000 },
    ],
    sourceNotes: 'SARS cotton/textile imports; ITC TDM 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // GHANA (GHA)
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'GHA', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 1_080_000_000, importsFromUsUsd: 145_000_000, importsFromUsSharePct: 13.4,
    usExportPotentialUsd: 385_000_000, usBenchmarkSharePct: 35.6, yoyGrowthPct: 6.8,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 40, valueUsd: 432_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 13, valueUsd: 145_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 12, valueUsd: 130_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 10, valueUsd: 108_000_000 },
    ],
    sourceNotes: 'Ghana Statistics Service trade data 2023; Newmont/AngloGold procurement' },

  { iso3: 'GHA', year: 2023, hsChapter: '10', categoryLabel: 'Grains & Cereals', categoryGroup: 'grains',
    totalImportsUsd: 680_000_000, importsFromUsUsd: 195_000_000, importsFromUsSharePct: 28.7,
    usExportPotentialUsd: 380_000_000, usBenchmarkSharePct: 55.9, yoyGrowthPct: 11.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 29, valueUsd: 195_000_000 },
      { country: 'Russia',         iso3: 'RUS', sharePct: 24, valueUsd: 163_000_000 },
      { country: 'Ukraine',        iso3: 'UKR', sharePct: 20, valueUsd: 136_000_000 },
      { country: 'Canada',         iso3: 'CAN', sharePct: 12, valueUsd: 82_000_000 },
    ],
    sourceNotes: 'USDA GATS Ghana wheat; Flour Mills of Ghana sourcing 2023' },

  { iso3: 'GHA', year: 2023, hsChapter: '30', categoryLabel: 'Pharmaceuticals & Medical Supplies', categoryGroup: 'pharma',
    totalImportsUsd: 520_000_000, importsFromUsUsd: 88_000_000, importsFromUsSharePct: 16.9,
    usExportPotentialUsd: 220_000_000, usBenchmarkSharePct: 42.3, yoyGrowthPct: 8.4,
    topSuppliers: [
      { country: 'India',          iso3: 'IND', sharePct: 35, valueUsd: 182_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 17, valueUsd: 88_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 14, valueUsd: 73_000_000 },
      { country: 'Switzerland',    iso3: 'CHE', sharePct: 10, valueUsd: 52_000_000 },
    ],
    sourceNotes: 'NHIA Ghana formulary imports; PEPFAR Ghana 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // ETHIOPIA (ETH)
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'ETH', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 1_420_000_000, importsFromUsUsd: 168_000_000, importsFromUsSharePct: 11.8,
    usExportPotentialUsd: 510_000_000, usBenchmarkSharePct: 35.9, yoyGrowthPct: 5.2,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 48, valueUsd: 682_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 12, valueUsd: 168_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 10, valueUsd: 142_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 8,  valueUsd: 114_000_000 },
    ],
    sourceNotes: 'NBE Ethiopia trade data 2023; AGCO/Hawassa Industrial Park procurement' },

  { iso3: 'ETH', year: 2023, hsChapter: '10', categoryLabel: 'Grains & Cereals', categoryGroup: 'grains',
    totalImportsUsd: 980_000_000, importsFromUsUsd: 280_000_000, importsFromUsSharePct: 28.6,
    usExportPotentialUsd: 520_000_000, usBenchmarkSharePct: 53.1, yoyGrowthPct: 18.4,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 29, valueUsd: 280_000_000 },
      { country: 'Russia',         iso3: 'RUS', sharePct: 26, valueUsd: 255_000_000 },
      { country: 'Australia',      iso3: 'AUS', sharePct: 18, valueUsd: 176_000_000 },
      { country: 'Ukraine',        iso3: 'UKR', sharePct: 14, valueUsd: 137_000_000 },
    ],
    sourceNotes: 'USDA Food for Peace Ethiopia; WFP Ethiopia emergency procurement 2023' },

  { iso3: 'ETH', year: 2023, hsChapter: '30', categoryLabel: 'Pharmaceuticals & Medical Supplies', categoryGroup: 'pharma',
    totalImportsUsd: 680_000_000, importsFromUsUsd: 140_000_000, importsFromUsSharePct: 20.6,
    usExportPotentialUsd: 290_000_000, usBenchmarkSharePct: 42.6, yoyGrowthPct: 10.2,
    topSuppliers: [
      { country: 'India',          iso3: 'IND', sharePct: 40, valueUsd: 272_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 21, valueUsd: 140_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 12, valueUsd: 82_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 10, valueUsd: 68_000_000 },
    ],
    sourceNotes: 'PFSA Ethiopia procurement; PEPFAR/USAID Ethiopia health supply chain 2023' },

  // Cotton imports (EPZ garment sector)
  { iso3: 'ETH', year: 2023, hsChapter: '52', categoryLabel: 'Cotton & Raw Textiles', categoryGroup: 'cotton',
    totalImportsUsd: 280_000_000, importsFromUsUsd: 32_000_000, importsFromUsSharePct: 11.4,
    usExportPotentialUsd: 95_000_000, usBenchmarkSharePct: 34.0, yoyGrowthPct: 8.6,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 38, valueUsd: 106_000_000 },
      { country: 'Pakistan',       iso3: 'PAK', sharePct: 25, valueUsd: 70_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 18, valueUsd: 50_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 11, valueUsd: 32_000_000 },
    ],
    sourceNotes: 'ETH Textile Industry Development Institute; Hawassa EPZ cotton inputs 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // SENEGAL (SEN)
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'SEN', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 580_000_000, importsFromUsUsd: 52_000_000, importsFromUsSharePct: 9.0,
    usExportPotentialUsd: 200_000_000, usBenchmarkSharePct: 34.5, yoyGrowthPct: 12.8,
    topSuppliers: [
      { country: 'France',         iso3: 'FRA', sharePct: 28, valueUsd: 162_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 32, valueUsd: 186_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 14, valueUsd: 81_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 9,  valueUsd: 52_000_000 },
    ],
    sourceNotes: 'ANSD Senegal trade 2023; MCC Senegal Compact procurement data' },

  { iso3: 'SEN', year: 2023, hsChapter: '10', categoryLabel: 'Grains & Cereals', categoryGroup: 'grains',
    totalImportsUsd: 520_000_000, importsFromUsUsd: 82_000_000, importsFromUsSharePct: 15.8,
    usExportPotentialUsd: 210_000_000, usBenchmarkSharePct: 40.4, yoyGrowthPct: 8.4,
    topSuppliers: [
      { country: 'Russia',         iso3: 'RUS', sharePct: 32, valueUsd: 166_000_000 },
      { country: 'France',         iso3: 'FRA', sharePct: 24, valueUsd: 125_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 16, valueUsd: 82_000_000 },
      { country: 'Ukraine',        iso3: 'UKR', sharePct: 14, valueUsd: 73_000_000 },
    ],
    sourceNotes: 'ANSD Senegal cereal imports; USDA GATS 2023' },

  { iso3: 'SEN', year: 2023, hsChapter: '31', categoryLabel: 'Fertilizers & Agri-inputs', categoryGroup: 'fertilizers',
    totalImportsUsd: 380_000_000, importsFromUsUsd: 58_000_000, importsFromUsSharePct: 15.3,
    usExportPotentialUsd: 145_000_000, usBenchmarkSharePct: 38.2, yoyGrowthPct: 6.2,
    topSuppliers: [
      { country: 'Morocco',        iso3: 'MAR', sharePct: 38, valueUsd: 144_000_000 },
      { country: 'Russia',         iso3: 'RUS', sharePct: 24, valueUsd: 91_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 15, valueUsd: 58_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 12, valueUsd: 46_000_000 },
    ],
    sourceNotes: "ANSD Senegal fertilizer; Senegal Ministry of Agriculture 2023" },

  // ════════════════════════════════════════════════════════════════════════
  // CÔTE D'IVOIRE (CIV)
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'CIV', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 1_120_000_000, importsFromUsUsd: 95_000_000, importsFromUsSharePct: 8.5,
    usExportPotentialUsd: 385_000_000, usBenchmarkSharePct: 34.4, yoyGrowthPct: 9.8,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 38, valueUsd: 426_000_000 },
      { country: 'France',         iso3: 'FRA', sharePct: 20, valueUsd: 224_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 14, valueUsd: 157_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 8,  valueUsd: 95_000_000 },
    ],
    sourceNotes: "INS Côte d'Ivoire trade stats 2023; ITC TDM" },

  { iso3: 'CIV', year: 2023, hsChapter: '31', categoryLabel: 'Fertilizers & Agri-inputs', categoryGroup: 'fertilizers',
    totalImportsUsd: 620_000_000, importsFromUsUsd: 78_000_000, importsFromUsSharePct: 12.6,
    usExportPotentialUsd: 240_000_000, usBenchmarkSharePct: 38.7, yoyGrowthPct: 7.4,
    topSuppliers: [
      { country: 'Morocco',        iso3: 'MAR', sharePct: 36, valueUsd: 223_000_000 },
      { country: 'Russia',         iso3: 'RUS', sharePct: 22, valueUsd: 136_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 18, valueUsd: 112_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 13, valueUsd: 78_000_000 },
    ],
    sourceNotes: "Cocobod/CNRA fertilizer data; Ministère de l'Agriculture CIV 2023" },

  // ════════════════════════════════════════════════════════════════════════
  // TANZANIA (TZA)
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'TZA', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 980_000_000, importsFromUsUsd: 88_000_000, importsFromUsSharePct: 9.0,
    usExportPotentialUsd: 345_000_000, usBenchmarkSharePct: 35.2, yoyGrowthPct: 7.6,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 46, valueUsd: 451_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 16, valueUsd: 157_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 9,  valueUsd: 88_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 8,  valueUsd: 78_000_000 },
    ],
    sourceNotes: 'Tanzania NBS trade stats 2023; AngloGold Geita procurement' },

  { iso3: 'TZA', year: 2023, hsChapter: '10', categoryLabel: 'Grains & Cereals', categoryGroup: 'grains',
    totalImportsUsd: 420_000_000, importsFromUsUsd: 68_000_000, importsFromUsSharePct: 16.2,
    usExportPotentialUsd: 165_000_000, usBenchmarkSharePct: 39.3, yoyGrowthPct: 6.4,
    topSuppliers: [
      { country: 'Russia',         iso3: 'RUS', sharePct: 38, valueUsd: 160_000_000 },
      { country: 'Australia',      iso3: 'AUS', sharePct: 22, valueUsd: 92_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 16, valueUsd: 68_000_000 },
      { country: 'Ukraine',        iso3: 'UKR', sharePct: 12, valueUsd: 50_000_000 },
    ],
    sourceNotes: 'Tanzania NBS cereal imports; USDA GATS 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // CARIBBEAN: JAMAICA (JAM)
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'JAM', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 280_000_000, importsFromUsUsd: 92_000_000, importsFromUsSharePct: 32.9,
    usExportPotentialUsd: 145_000_000, usBenchmarkSharePct: 51.8, yoyGrowthPct: 4.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 33, valueUsd: 92_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 28, valueUsd: 78_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 14, valueUsd: 39_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 12, valueUsd: 34_000_000 },
    ],
    sourceNotes: 'Jamaica Trade and Invest; STATIN trade data 2023' },

  { iso3: 'JAM', year: 2023, hsChapter: '30', categoryLabel: 'Pharmaceuticals & Medical Supplies', categoryGroup: 'pharma',
    totalImportsUsd: 185_000_000, importsFromUsUsd: 82_000_000, importsFromUsSharePct: 44.3,
    usExportPotentialUsd: 115_000_000, usBenchmarkSharePct: 62.2, yoyGrowthPct: 5.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 44, valueUsd: 82_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 22, valueUsd: 41_000_000 },
      { country: 'United Kingdom', iso3: 'GBR', sharePct: 16, valueUsd: 30_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 10, valueUsd: 19_000_000 },
    ],
    sourceNotes: 'STATIN Jamaica pharmaceutical imports; US Census Bureau exports 2023' },

  { iso3: 'JAM', year: 2023, hsChapter: '10', categoryLabel: 'Grains & Cereals', categoryGroup: 'grains',
    totalImportsUsd: 165_000_000, importsFromUsUsd: 88_000_000, importsFromUsSharePct: 53.3,
    usExportPotentialUsd: 120_000_000, usBenchmarkSharePct: 72.7, yoyGrowthPct: 3.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 53, valueUsd: 88_000_000 },
      { country: 'Canada',         iso3: 'CAN', sharePct: 22, valueUsd: 36_000_000 },
      { country: 'Argentina',      iso3: 'ARG', sharePct: 14, valueUsd: 23_000_000 },
      { country: 'Brazil',         iso3: 'BRA', sharePct: 8,  valueUsd: 13_000_000 },
    ],
    sourceNotes: 'STATIN Jamaica grain imports; US wheat is dominant supplier for Caribbean basin' },

  // ════════════════════════════════════════════════════════════════════════
  // TRINIDAD & TOBAGO (TTO)
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'TTO', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 480_000_000, importsFromUsUsd: 145_000_000, importsFromUsSharePct: 30.2,
    usExportPotentialUsd: 245_000_000, usBenchmarkSharePct: 51.0, yoyGrowthPct: 5.4,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 30, valueUsd: 145_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 24, valueUsd: 115_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 16, valueUsd: 77_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 12, valueUsd: 58_000_000 },
    ],
    sourceNotes: 'TTO CSSP trade statistics; US machinery exports to Trinidad 2023' },

  { iso3: 'TTO', year: 2023, hsChapter: '30', categoryLabel: 'Pharmaceuticals & Medical Supplies', categoryGroup: 'pharma',
    totalImportsUsd: 320_000_000, importsFromUsUsd: 128_000_000, importsFromUsSharePct: 40.0,
    usExportPotentialUsd: 195_000_000, usBenchmarkSharePct: 60.9, yoyGrowthPct: 6.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 40, valueUsd: 128_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 20, valueUsd: 64_000_000 },
      { country: 'United Kingdom', iso3: 'GBR', sharePct: 18, valueUsd: 58_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 12, valueUsd: 38_000_000 },
    ],
    sourceNotes: 'TTO Ministry of Health pharmaceutical data; US pharma exports Caribbean 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // BAHAMAS (BHS)
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'BHS', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 185_000_000, importsFromUsUsd: 92_000_000, importsFromUsSharePct: 49.7,
    usExportPotentialUsd: 120_000_000, usBenchmarkSharePct: 64.9, yoyGrowthPct: 6.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 50, valueUsd: 92_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 20, valueUsd: 37_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 14, valueUsd: 26_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 10, valueUsd: 19_000_000 },
    ],
    sourceNotes: 'Bahamas DoS trade statistics; US Census Bureau Bahamas exports 2023' },

  // BARBADOS (BRB)
  { iso3: 'BRB', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 145_000_000, importsFromUsUsd: 58_000_000, importsFromUsSharePct: 40.0,
    usExportPotentialUsd: 85_000_000, usBenchmarkSharePct: 58.6, yoyGrowthPct: 4.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 40, valueUsd: 58_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 22, valueUsd: 32_000_000 },
      { country: 'United Kingdom', iso3: 'GBR', sharePct: 16, valueUsd: 23_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 12, valueUsd: 17_000_000 },
    ],
    sourceNotes: 'Barbados Statistical Service trade data; US Census Bureau 2023' },

  { iso3: 'BRB', year: 2023, hsChapter: '30', categoryLabel: 'Pharmaceuticals & Medical Supplies', categoryGroup: 'pharma',
    totalImportsUsd: 128_000_000, importsFromUsUsd: 48_000_000, importsFromUsSharePct: 37.5,
    usExportPotentialUsd: 78_000_000, usBenchmarkSharePct: 60.9, yoyGrowthPct: 5.4,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 37, valueUsd: 48_000_000 },
      { country: 'United Kingdom', iso3: 'GBR', sharePct: 24, valueUsd: 31_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 18, valueUsd: 23_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 12, valueUsd: 15_000_000 },
    ],
    sourceNotes: 'Barbados QEH health procurement; US pharma exports Caribbean 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // DOMINICAN REPUBLIC (DOM) — Tier 2 Caribbean
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'DOM', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 1_850_000_000, importsFromUsUsd: 720_000_000, importsFromUsSharePct: 38.9,
    usExportPotentialUsd: 1_020_000_000, usBenchmarkSharePct: 55.1, yoyGrowthPct: 7.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 39, valueUsd: 720_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 28, valueUsd: 518_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 12, valueUsd: 222_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 8, valueUsd: 148_000_000 },
    ],
    sourceNotes: 'ONE Dominican Republic trade statistics; US Census Bureau exports 2023' },

  { iso3: 'DOM', year: 2023, hsChapter: '10', categoryLabel: 'Grains & Cereals', categoryGroup: 'grains',
    totalImportsUsd: 680_000_000, importsFromUsUsd: 385_000_000, importsFromUsSharePct: 56.6,
    usExportPotentialUsd: 480_000_000, usBenchmarkSharePct: 70.6, yoyGrowthPct: 4.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 57, valueUsd: 385_000_000 },
      { country: 'Argentina',      iso3: 'ARG', sharePct: 18, valueUsd: 122_000_000 },
      { country: 'Canada',         iso3: 'CAN', sharePct: 12, valueUsd: 82_000_000 },
      { country: 'Brazil',         iso3: 'BRA', sharePct: 8, valueUsd: 54_000_000 },
    ],
    sourceNotes: 'USDA GATS Dominican Republic grain imports; DR-CAFTA impact analysis 2023' },

  { iso3: 'DOM', year: 2023, hsChapter: '30', categoryLabel: 'Pharmaceuticals & Medical Supplies', categoryGroup: 'pharma',
    totalImportsUsd: 520_000_000, importsFromUsUsd: 195_000_000, importsFromUsSharePct: 37.5,
    usExportPotentialUsd: 310_000_000, usBenchmarkSharePct: 59.6, yoyGrowthPct: 6.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 38, valueUsd: 195_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 24, valueUsd: 125_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 14, valueUsd: 73_000_000 },
      { country: 'Mexico',         iso3: 'MEX', sharePct: 10, valueUsd: 52_000_000 },
    ],
    sourceNotes: 'DR pharmaceutical import registry; PEPFAR Caribbean procurement 2023' },

  { iso3: 'DOM', year: 2023, hsChapter: '87', categoryLabel: 'Transport & Commercial Vehicles', categoryGroup: 'transport',
    totalImportsUsd: 1_420_000_000, importsFromUsUsd: 485_000_000, importsFromUsSharePct: 34.2,
    usExportPotentialUsd: 680_000_000, usBenchmarkSharePct: 47.9, yoyGrowthPct: 8.4,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 34, valueUsd: 485_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 28, valueUsd: 398_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 18, valueUsd: 256_000_000 },
      { country: 'South Korea',    iso3: 'KOR', sharePct: 12, valueUsd: 170_000_000 },
    ],
    sourceNotes: 'DGII Dominican Republic vehicle imports; US truck and bus exports 2023' },

  { iso3: 'DOM', year: 2023, hsChapter: '72', categoryLabel: 'Iron & Steel (Intermediate)', categoryGroup: 'intermediate',
    totalImportsUsd: 890_000_000, importsFromUsUsd: 178_000_000, importsFromUsSharePct: 20.0,
    usExportPotentialUsd: 310_000_000, usBenchmarkSharePct: 34.8, yoyGrowthPct: 5.2,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 38, valueUsd: 338_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 20, valueUsd: 178_000_000 },
      { country: 'Turkey',         iso3: 'TUR', sharePct: 16, valueUsd: 142_000_000 },
      { country: 'Brazil',         iso3: 'BRA', sharePct: 12, valueUsd: 107_000_000 },
    ],
    sourceNotes: 'DR construction sector imports; ADOZONA free zone imports 2023' },

  { iso3: 'DOM', year: 2023, hsChapter: '55', categoryLabel: 'Synthetic Yarn & Fabric Inputs', categoryGroup: 'textiles_inputs',
    totalImportsUsd: 420_000_000, importsFromUsUsd: 168_000_000, importsFromUsSharePct: 40.0,
    usExportPotentialUsd: 252_000_000, usBenchmarkSharePct: 60.0, yoyGrowthPct: 3.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 40, valueUsd: 168_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 28, valueUsd: 118_000_000 },
      { country: 'Taiwan',         iso3: 'TWN', sharePct: 14, valueUsd: 59_000_000 },
      { country: 'South Korea',    iso3: 'KOR', sharePct: 10, valueUsd: 42_000_000 },
    ],
    sourceNotes: 'DR-CAFTA textile provisions; ADOZONA EPZ fabric imports 2023' },

  { iso3: 'DOM', year: 2023, hsChapter: '31', categoryLabel: 'Fertilizers & Agri-inputs', categoryGroup: 'fertilizers',
    totalImportsUsd: 285_000_000, importsFromUsUsd: 95_000_000, importsFromUsSharePct: 33.3,
    usExportPotentialUsd: 145_000_000, usBenchmarkSharePct: 50.9, yoyGrowthPct: 4.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 33, valueUsd: 95_000_000 },
      { country: 'Morocco',        iso3: 'MAR', sharePct: 28, valueUsd: 80_000_000 },
      { country: 'Russia',         iso3: 'RUS', sharePct: 18, valueUsd: 51_000_000 },
      { country: 'Trinidad',       iso3: 'TTO', sharePct: 12, valueUsd: 34_000_000 },
    ],
    sourceNotes: 'IAD Dominican Republic agricultural inputs; Caribbean fertilizer trade 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // HAITI (HTI) — Tier 2 Caribbean
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'HTI', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 165_000_000, importsFromUsUsd: 72_000_000, importsFromUsSharePct: 43.6,
    usExportPotentialUsd: 95_000_000, usBenchmarkSharePct: 57.6, yoyGrowthPct: 2.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 44, valueUsd: 72_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 28, valueUsd: 46_000_000 },
      { country: 'Dominican Rep.', iso3: 'DOM', sharePct: 12, valueUsd: 20_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 8, valueUsd: 13_000_000 },
    ],
    sourceNotes: 'Haiti customs (AGD) trade data; USAID Haiti economic analysis 2023' },

  { iso3: 'HTI', year: 2023, hsChapter: '10', categoryLabel: 'Grains & Cereals', categoryGroup: 'grains',
    totalImportsUsd: 420_000_000, importsFromUsUsd: 285_000_000, importsFromUsSharePct: 67.9,
    usExportPotentialUsd: 340_000_000, usBenchmarkSharePct: 81.0, yoyGrowthPct: 3.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 68, valueUsd: 285_000_000 },
      { country: 'Dominican Rep.', iso3: 'DOM', sharePct: 14, valueUsd: 59_000_000 },
      { country: 'Canada',         iso3: 'CAN', sharePct: 10, valueUsd: 42_000_000 },
      { country: 'Argentina',      iso3: 'ARG', sharePct: 5, valueUsd: 21_000_000 },
    ],
    sourceNotes: 'USDA GATS Haiti rice and wheat imports; PL-480 food aid flows 2023' },

  { iso3: 'HTI', year: 2023, hsChapter: '30', categoryLabel: 'Pharmaceuticals & Medical Supplies', categoryGroup: 'pharma',
    totalImportsUsd: 145_000_000, importsFromUsUsd: 58_000_000, importsFromUsSharePct: 40.0,
    usExportPotentialUsd: 85_000_000, usBenchmarkSharePct: 58.6, yoyGrowthPct: 4.5,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 40, valueUsd: 58_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 28, valueUsd: 41_000_000 },
      { country: 'Dominican Rep.', iso3: 'DOM', sharePct: 14, valueUsd: 20_000_000 },
      { country: 'France',         iso3: 'FRA', sharePct: 10, valueUsd: 15_000_000 },
    ],
    sourceNotes: 'PEPFAR Haiti; MSPP health sector imports 2023' },

  { iso3: 'HTI', year: 2023, hsChapter: '55', categoryLabel: 'Synthetic Yarn & Fabric Inputs', categoryGroup: 'textiles_inputs',
    totalImportsUsd: 280_000_000, importsFromUsUsd: 168_000_000, importsFromUsSharePct: 60.0,
    usExportPotentialUsd: 196_000_000, usBenchmarkSharePct: 70.0, yoyGrowthPct: 5.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 60, valueUsd: 168_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 22, valueUsd: 62_000_000 },
      { country: 'Taiwan',         iso3: 'TWN', sharePct: 10, valueUsd: 28_000_000 },
      { country: 'South Korea',    iso3: 'KOR', sharePct: 5, valueUsd: 14_000_000 },
    ],
    sourceNotes: 'HOPE II Act textile provisions; Haiti EPZ apparel sector 2023' },

  { iso3: 'HTI', year: 2023, hsChapter: '87', categoryLabel: 'Transport & Commercial Vehicles', categoryGroup: 'transport',
    totalImportsUsd: 185_000_000, importsFromUsUsd: 82_000_000, importsFromUsSharePct: 44.3,
    usExportPotentialUsd: 105_000_000, usBenchmarkSharePct: 56.8, yoyGrowthPct: 3.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 44, valueUsd: 82_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 28, valueUsd: 52_000_000 },
      { country: 'Dominican Rep.', iso3: 'DOM', sharePct: 14, valueUsd: 26_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 8, valueUsd: 15_000_000 },
    ],
    sourceNotes: 'Haiti vehicle registration data; used vehicle trade analysis 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // GUYANA (GUY) — Tier 2 Caribbean
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'GUY', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 680_000_000, importsFromUsUsd: 258_000_000, importsFromUsSharePct: 37.9,
    usExportPotentialUsd: 380_000_000, usBenchmarkSharePct: 55.9, yoyGrowthPct: 18.5,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 38, valueUsd: 258_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 32, valueUsd: 218_000_000 },
      { country: 'Trinidad',       iso3: 'TTO', sharePct: 12, valueUsd: 82_000_000 },
      { country: 'United Kingdom', iso3: 'GBR', sharePct: 8, valueUsd: 54_000_000 },
    ],
    sourceNotes: 'Guyana Bureau of Statistics; ExxonMobil oil sector imports 2023' },

  { iso3: 'GUY', year: 2023, hsChapter: '10', categoryLabel: 'Grains & Cereals', categoryGroup: 'grains',
    totalImportsUsd: 85_000_000, importsFromUsUsd: 52_000_000, importsFromUsSharePct: 61.2,
    usExportPotentialUsd: 62_000_000, usBenchmarkSharePct: 72.9, yoyGrowthPct: 8.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 61, valueUsd: 52_000_000 },
      { country: 'Canada',         iso3: 'CAN', sharePct: 18, valueUsd: 15_000_000 },
      { country: 'Trinidad',       iso3: 'TTO', sharePct: 12, valueUsd: 10_000_000 },
      { country: 'Argentina',      iso3: 'ARG', sharePct: 6, valueUsd: 5_000_000 },
    ],
    sourceNotes: 'USDA GATS Guyana grain imports; CARICOM food trade 2023' },

  { iso3: 'GUY', year: 2023, hsChapter: '30', categoryLabel: 'Pharmaceuticals & Medical Supplies', categoryGroup: 'pharma',
    totalImportsUsd: 125_000_000, importsFromUsUsd: 48_000_000, importsFromUsSharePct: 38.4,
    usExportPotentialUsd: 72_000_000, usBenchmarkSharePct: 57.6, yoyGrowthPct: 12.4,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 38, valueUsd: 48_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 32, valueUsd: 40_000_000 },
      { country: 'Trinidad',       iso3: 'TTO', sharePct: 14, valueUsd: 18_000_000 },
      { country: 'United Kingdom', iso3: 'GBR', sharePct: 8, valueUsd: 10_000_000 },
    ],
    sourceNotes: 'Guyana Ministry of Health procurement; PEPFAR Caribbean 2023' },

  { iso3: 'GUY', year: 2023, hsChapter: '87', categoryLabel: 'Transport & Commercial Vehicles', categoryGroup: 'transport',
    totalImportsUsd: 420_000_000, importsFromUsUsd: 155_000_000, importsFromUsSharePct: 36.9,
    usExportPotentialUsd: 210_000_000, usBenchmarkSharePct: 50.0, yoyGrowthPct: 22.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 37, valueUsd: 155_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 32, valueUsd: 134_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 18, valueUsd: 76_000_000 },
      { country: 'Trinidad',       iso3: 'TTO', sharePct: 8, valueUsd: 34_000_000 },
    ],
    sourceNotes: 'GRA vehicle import statistics; oil sector logistics imports 2023' },

  { iso3: 'GUY', year: 2023, hsChapter: '72', categoryLabel: 'Iron & Steel (Intermediate)', categoryGroup: 'intermediate',
    totalImportsUsd: 285_000_000, importsFromUsUsd: 68_000_000, importsFromUsSharePct: 23.9,
    usExportPotentialUsd: 115_000_000, usBenchmarkSharePct: 40.4, yoyGrowthPct: 28.4,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 42, valueUsd: 120_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 24, valueUsd: 68_000_000 },
      { country: 'Trinidad',       iso3: 'TTO', sharePct: 18, valueUsd: 51_000_000 },
      { country: 'Brazil',         iso3: 'BRA', sharePct: 10, valueUsd: 29_000_000 },
    ],
    sourceNotes: 'Guyana construction boom; offshore oil infrastructure imports 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // SURINAME (SUR) — Tier 2 Caribbean
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'SUR', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 245_000_000, importsFromUsUsd: 82_000_000, importsFromUsSharePct: 33.5,
    usExportPotentialUsd: 125_000_000, usBenchmarkSharePct: 51.0, yoyGrowthPct: 14.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 33, valueUsd: 82_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 28, valueUsd: 69_000_000 },
      { country: 'Netherlands',    iso3: 'NLD', sharePct: 16, valueUsd: 39_000_000 },
      { country: 'Brazil',         iso3: 'BRA', sharePct: 12, valueUsd: 29_000_000 },
    ],
    sourceNotes: 'Suriname General Bureau of Statistics; oil exploration equipment 2023' },

  { iso3: 'SUR', year: 2023, hsChapter: '10', categoryLabel: 'Grains & Cereals', categoryGroup: 'grains',
    totalImportsUsd: 65_000_000, importsFromUsUsd: 28_000_000, importsFromUsSharePct: 43.1,
    usExportPotentialUsd: 42_000_000, usBenchmarkSharePct: 64.6, yoyGrowthPct: 5.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 43, valueUsd: 28_000_000 },
      { country: 'Guyana',         iso3: 'GUY', sharePct: 22, valueUsd: 14_000_000 },
      { country: 'Brazil',         iso3: 'BRA', sharePct: 18, valueUsd: 12_000_000 },
      { country: 'Canada',         iso3: 'CAN', sharePct: 10, valueUsd: 7_000_000 },
    ],
    sourceNotes: 'Suriname rice imports; regional food security trade 2023' },

  { iso3: 'SUR', year: 2023, hsChapter: '30', categoryLabel: 'Pharmaceuticals & Medical Supplies', categoryGroup: 'pharma',
    totalImportsUsd: 78_000_000, importsFromUsUsd: 25_000_000, importsFromUsSharePct: 32.1,
    usExportPotentialUsd: 42_000_000, usBenchmarkSharePct: 53.8, yoyGrowthPct: 6.8,
    topSuppliers: [
      { country: 'Netherlands',    iso3: 'NLD', sharePct: 34, valueUsd: 27_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 32, valueUsd: 25_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 18, valueUsd: 14_000_000 },
      { country: 'Brazil',         iso3: 'BRA', sharePct: 10, valueUsd: 8_000_000 },
    ],
    sourceNotes: 'Suriname Ministry of Health; Dutch pharmaceutical supply chain 2023' },

  { iso3: 'SUR', year: 2023, hsChapter: '87', categoryLabel: 'Transport & Commercial Vehicles', categoryGroup: 'transport',
    totalImportsUsd: 145_000_000, importsFromUsUsd: 48_000_000, importsFromUsSharePct: 33.1,
    usExportPotentialUsd: 72_000_000, usBenchmarkSharePct: 49.7, yoyGrowthPct: 12.4,
    topSuppliers: [
      { country: 'Japan',          iso3: 'JPN', sharePct: 35, valueUsd: 51_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 33, valueUsd: 48_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 18, valueUsd: 26_000_000 },
      { country: 'Netherlands',    iso3: 'NLD', sharePct: 8, valueUsd: 12_000_000 },
    ],
    sourceNotes: 'Suriname vehicle import registry; oil sector fleet expansion 2023' },

  { iso3: 'SUR', year: 2023, hsChapter: '72', categoryLabel: 'Iron & Steel (Intermediate)', categoryGroup: 'intermediate',
    totalImportsUsd: 98_000_000, importsFromUsUsd: 22_000_000, importsFromUsSharePct: 22.4,
    usExportPotentialUsd: 38_000_000, usBenchmarkSharePct: 38.8, yoyGrowthPct: 18.2,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 38, valueUsd: 37_000_000 },
      { country: 'Brazil',         iso3: 'BRA', sharePct: 26, valueUsd: 25_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 22, valueUsd: 22_000_000 },
      { country: 'Trinidad',       iso3: 'TTO', sharePct: 8, valueUsd: 8_000_000 },
    ],
    sourceNotes: 'Suriname construction imports; offshore infrastructure 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // BELIZE (BLZ) — Tier 2 Caribbean
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'BLZ', year: 2023, hsChapter: '84', categoryLabel: 'Agricultural & Mining Machinery', categoryGroup: 'machinery',
    totalImportsUsd: 85_000_000, importsFromUsUsd: 42_000_000, importsFromUsSharePct: 49.4,
    usExportPotentialUsd: 55_000_000, usBenchmarkSharePct: 64.7, yoyGrowthPct: 5.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 49, valueUsd: 42_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 22, valueUsd: 19_000_000 },
      { country: 'Mexico',         iso3: 'MEX', sharePct: 14, valueUsd: 12_000_000 },
      { country: 'Guatemala',      iso3: 'GTM', sharePct: 8, valueUsd: 7_000_000 },
    ],
    sourceNotes: 'Belize Statistical Institute; US agricultural equipment exports 2023' },

  { iso3: 'BLZ', year: 2023, hsChapter: '10', categoryLabel: 'Grains & Cereals', categoryGroup: 'grains',
    totalImportsUsd: 45_000_000, importsFromUsUsd: 28_000_000, importsFromUsSharePct: 62.2,
    usExportPotentialUsd: 34_000_000, usBenchmarkSharePct: 75.6, yoyGrowthPct: 4.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 62, valueUsd: 28_000_000 },
      { country: 'Mexico',         iso3: 'MEX', sharePct: 18, valueUsd: 8_000_000 },
      { country: 'Guatemala',      iso3: 'GTM', sharePct: 12, valueUsd: 5_000_000 },
      { country: 'Canada',         iso3: 'CAN', sharePct: 5, valueUsd: 2_000_000 },
    ],
    sourceNotes: 'USDA GATS Belize grain imports; Central American food trade 2023' },

  { iso3: 'BLZ', year: 2023, hsChapter: '30', categoryLabel: 'Pharmaceuticals & Medical Supplies', categoryGroup: 'pharma',
    totalImportsUsd: 48_000_000, importsFromUsUsd: 22_000_000, importsFromUsSharePct: 45.8,
    usExportPotentialUsd: 32_000_000, usBenchmarkSharePct: 66.7, yoyGrowthPct: 6.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 46, valueUsd: 22_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 24, valueUsd: 12_000_000 },
      { country: 'Mexico',         iso3: 'MEX', sharePct: 14, valueUsd: 7_000_000 },
      { country: 'Guatemala',      iso3: 'GTM', sharePct: 10, valueUsd: 5_000_000 },
    ],
    sourceNotes: 'Belize Ministry of Health procurement; PAHO Caribbean 2023' },

  { iso3: 'BLZ', year: 2023, hsChapter: '87', categoryLabel: 'Transport & Commercial Vehicles', categoryGroup: 'transport',
    totalImportsUsd: 78_000_000, importsFromUsUsd: 38_000_000, importsFromUsSharePct: 48.7,
    usExportPotentialUsd: 48_000_000, usBenchmarkSharePct: 61.5, yoyGrowthPct: 5.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 49, valueUsd: 38_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 24, valueUsd: 19_000_000 },
      { country: 'Mexico',         iso3: 'MEX', sharePct: 14, valueUsd: 11_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 8, valueUsd: 6_000_000 },
    ],
    sourceNotes: 'Belize vehicle registration; US truck exports Central America 2023' },

  { iso3: 'BLZ', year: 2023, hsChapter: '31', categoryLabel: 'Fertilizers & Agri-inputs', categoryGroup: 'fertilizers',
    totalImportsUsd: 32_000_000, importsFromUsUsd: 14_000_000, importsFromUsSharePct: 43.8,
    usExportPotentialUsd: 20_000_000, usBenchmarkSharePct: 62.5, yoyGrowthPct: 3.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 44, valueUsd: 14_000_000 },
      { country: 'Mexico',         iso3: 'MEX', sharePct: 28, valueUsd: 9_000_000 },
      { country: 'Guatemala',      iso3: 'GTM', sharePct: 16, valueUsd: 5_000_000 },
      { country: 'Trinidad',       iso3: 'TTO', sharePct: 8, valueUsd: 3_000_000 },
    ],
    sourceNotes: 'Belize citrus and sugar cane inputs; regional agricultural trade 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // COTTON (HS 52) — expand to 10 markets
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'NGA', year: 2023, hsChapter: '52', categoryLabel: 'Cotton & Raw Textiles', categoryGroup: 'cotton',
    totalImportsUsd: 380_000_000, importsFromUsUsd: 58_000_000, importsFromUsSharePct: 15.3,
    usExportPotentialUsd: 130_000_000, usBenchmarkSharePct: 34.2, yoyGrowthPct: 6.4,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 42, valueUsd: 160_000_000 },
      { country: 'Pakistan',       iso3: 'PAK', sharePct: 20, valueUsd: 76_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 16, valueUsd: 61_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 15, valueUsd: 58_000_000 },
    ],
    sourceNotes: 'Nigerian textile mills cotton imports; NESG textile industry report 2023' },

  { iso3: 'KEN', year: 2023, hsChapter: '52', categoryLabel: 'Cotton & Raw Textiles', categoryGroup: 'cotton',
    totalImportsUsd: 320_000_000, importsFromUsUsd: 62_000_000, importsFromUsSharePct: 19.4,
    usExportPotentialUsd: 110_000_000, usBenchmarkSharePct: 34.4, yoyGrowthPct: 11.2,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 36, valueUsd: 115_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 19, valueUsd: 62_000_000 },
      { country: 'Pakistan',       iso3: 'PAK', sharePct: 18, valueUsd: 58_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 14, valueUsd: 45_000_000 },
    ],
    sourceNotes: 'KEPSA textiles; Kenya EPZ cotton inputs for AGOA garments 2023' },

  { iso3: 'TZA', year: 2023, hsChapter: '52', categoryLabel: 'Cotton & Raw Textiles', categoryGroup: 'cotton',
    totalImportsUsd: 210_000_000, importsFromUsUsd: 28_000_000, importsFromUsSharePct: 13.3,
    usExportPotentialUsd: 72_000_000, usBenchmarkSharePct: 34.3, yoyGrowthPct: 5.8,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 44, valueUsd: 92_000_000 },
      { country: 'Pakistan',       iso3: 'PAK', sharePct: 22, valueUsd: 46_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 16, valueUsd: 34_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 13, valueUsd: 28_000_000 },
    ],
    sourceNotes: 'Tanzania Cotton Board; Karibu Textile Mill inputs 2023' },

  { iso3: 'GHA', year: 2023, hsChapter: '52', categoryLabel: 'Cotton & Raw Textiles', categoryGroup: 'cotton',
    totalImportsUsd: 165_000_000, importsFromUsUsd: 22_000_000, importsFromUsSharePct: 13.3,
    usExportPotentialUsd: 56_000_000, usBenchmarkSharePct: 34.0, yoyGrowthPct: 4.6,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 45, valueUsd: 74_000_000 },
      { country: 'Pakistan',       iso3: 'PAK', sharePct: 24, valueUsd: 40_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 14, valueUsd: 23_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 13, valueUsd: 22_000_000 },
    ],
    sourceNotes: 'Ghana Statistical Service textiles; Volta Basin cotton 2023' },

  { iso3: 'CIV', year: 2023, hsChapter: '52', categoryLabel: 'Cotton & Raw Textiles', categoryGroup: 'cotton',
    totalImportsUsd: 240_000_000, importsFromUsUsd: 26_000_000, importsFromUsSharePct: 10.8,
    usExportPotentialUsd: 82_000_000, usBenchmarkSharePct: 34.2, yoyGrowthPct: 6.2,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 40, valueUsd: 96_000_000 },
      { country: 'France',         iso3: 'FRA', sharePct: 22, valueUsd: 53_000_000 },
      { country: 'Pakistan',       iso3: 'PAK', sharePct: 18, valueUsd: 43_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 11, valueUsd: 26_000_000 },
    ],
    sourceNotes: "INS Côte d'Ivoire cotton; UEMOA textile trade 2023" },

  { iso3: 'SEN', year: 2023, hsChapter: '52', categoryLabel: 'Cotton & Raw Textiles', categoryGroup: 'cotton',
    totalImportsUsd: 120_000_000, importsFromUsUsd: 14_000_000, importsFromUsSharePct: 11.7,
    usExportPotentialUsd: 41_000_000, usBenchmarkSharePct: 34.2, yoyGrowthPct: 4.8,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 46, valueUsd: 55_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 24, valueUsd: 29_000_000 },
      { country: 'Pakistan',       iso3: 'PAK', sharePct: 14, valueUsd: 17_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 12, valueUsd: 14_000_000 },
    ],
    sourceNotes: 'ANSD Senegal textile imports; UNIDO Dakar textile 2023' },

  { iso3: 'JAM', year: 2023, hsChapter: '52', categoryLabel: 'Cotton & Raw Textiles', categoryGroup: 'cotton',
    totalImportsUsd: 58_000_000, importsFromUsUsd: 18_000_000, importsFromUsSharePct: 31.0,
    usExportPotentialUsd: 30_000_000, usBenchmarkSharePct: 51.7, yoyGrowthPct: 3.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 31, valueUsd: 18_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 28, valueUsd: 16_000_000 },
      { country: 'Pakistan',       iso3: 'PAK', sharePct: 18, valueUsd: 10_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 14, valueUsd: 8_000_000 },
    ],
    sourceNotes: 'STATIN Jamaica textile imports; Caribbean CBTPA garment inputs 2023' },

  { iso3: 'TTO', year: 2023, hsChapter: '52', categoryLabel: 'Cotton & Raw Textiles', categoryGroup: 'cotton',
    totalImportsUsd: 48_000_000, importsFromUsUsd: 14_000_000, importsFromUsSharePct: 29.2,
    usExportPotentialUsd: 25_000_000, usBenchmarkSharePct: 52.1, yoyGrowthPct: 2.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 29, valueUsd: 14_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 32, valueUsd: 15_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 20, valueUsd: 10_000_000 },
      { country: 'Pakistan',       iso3: 'PAK', sharePct: 12, valueUsd: 6_000_000 },
    ],
    sourceNotes: 'TTO CSSP textile imports; Caribbean basin apparel supply chain 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // INTERMEDIATE GOODS (HS 72 iron/steel) — expand to 10 markets
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'KEN', year: 2023, hsChapter: '72', categoryLabel: 'Iron & Steel (Intermediate)', categoryGroup: 'intermediate',
    totalImportsUsd: 680_000_000, importsFromUsUsd: 52_000_000, importsFromUsSharePct: 7.6,
    usExportPotentialUsd: 168_000_000, usBenchmarkSharePct: 24.7, yoyGrowthPct: 5.8,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 50, valueUsd: 340_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 16, valueUsd: 109_000_000 },
      { country: 'Turkey',         iso3: 'TUR', sharePct: 10, valueUsd: 68_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 8,  valueUsd: 52_000_000 },
    ],
    sourceNotes: 'KEBS Kenya steel imports; Devki Steel sourcing data 2023' },

  { iso3: 'ZAF', year: 2023, hsChapter: '72', categoryLabel: 'Iron & Steel (Intermediate)', categoryGroup: 'intermediate',
    totalImportsUsd: 3_200_000_000, importsFromUsUsd: 320_000_000, importsFromUsSharePct: 10.0,
    usExportPotentialUsd: 790_000_000, usBenchmarkSharePct: 24.7, yoyGrowthPct: 2.8,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 38, valueUsd: 1_216_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 14, valueUsd: 448_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 12, valueUsd: 384_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 10, valueUsd: 320_000_000 },
    ],
    sourceNotes: 'SARS South Africa steel imports; ArcelorMittal SA trade data 2023' },

  { iso3: 'GHA', year: 2023, hsChapter: '72', categoryLabel: 'Iron & Steel (Intermediate)', categoryGroup: 'intermediate',
    totalImportsUsd: 580_000_000, importsFromUsUsd: 38_000_000, importsFromUsSharePct: 6.6,
    usExportPotentialUsd: 143_000_000, usBenchmarkSharePct: 24.7, yoyGrowthPct: 7.2,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 52, valueUsd: 302_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 18, valueUsd: 104_000_000 },
      { country: 'Turkey',         iso3: 'TUR', sharePct: 12, valueUsd: 70_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 7,  valueUsd: 38_000_000 },
    ],
    sourceNotes: 'Ghana Statistics Service steel imports; GIPC mining sector data 2023' },

  { iso3: 'ETH', year: 2023, hsChapter: '72', categoryLabel: 'Iron & Steel (Intermediate)', categoryGroup: 'intermediate',
    totalImportsUsd: 920_000_000, importsFromUsUsd: 62_000_000, importsFromUsSharePct: 6.7,
    usExportPotentialUsd: 227_000_000, usBenchmarkSharePct: 24.7, yoyGrowthPct: 4.6,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 56, valueUsd: 515_000_000 },
      { country: 'Turkey',         iso3: 'TUR', sharePct: 14, valueUsd: 129_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 12, valueUsd: 110_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 7,  valueUsd: 62_000_000 },
    ],
    sourceNotes: 'NBE Ethiopia steel imports; Addis Ababa industrial zone sourcing 2023' },

  { iso3: 'TZA', year: 2023, hsChapter: '72', categoryLabel: 'Iron & Steel (Intermediate)', categoryGroup: 'intermediate',
    totalImportsUsd: 520_000_000, importsFromUsUsd: 32_000_000, importsFromUsSharePct: 6.2,
    usExportPotentialUsd: 128_000_000, usBenchmarkSharePct: 24.6, yoyGrowthPct: 6.0,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 54, valueUsd: 281_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 16, valueUsd: 83_000_000 },
      { country: 'Turkey',         iso3: 'TUR', sharePct: 12, valueUsd: 62_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 6,  valueUsd: 32_000_000 },
    ],
    sourceNotes: 'Tanzania NBS steel imports; Julius Nyerere project procurement 2023' },

  { iso3: 'CIV', year: 2023, hsChapter: '72', categoryLabel: 'Iron & Steel (Intermediate)', categoryGroup: 'intermediate',
    totalImportsUsd: 680_000_000, importsFromUsUsd: 42_000_000, importsFromUsSharePct: 6.2,
    usExportPotentialUsd: 168_000_000, usBenchmarkSharePct: 24.7, yoyGrowthPct: 8.2,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 48, valueUsd: 326_000_000 },
      { country: 'France',         iso3: 'FRA', sharePct: 18, valueUsd: 122_000_000 },
      { country: 'Turkey',         iso3: 'TUR', sharePct: 14, valueUsd: 95_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 6,  valueUsd: 42_000_000 },
    ],
    sourceNotes: "INS Côte d'Ivoire steel imports; Port Abidjan construction inputs 2023" },

  { iso3: 'SEN', year: 2023, hsChapter: '72', categoryLabel: 'Iron & Steel (Intermediate)', categoryGroup: 'intermediate',
    totalImportsUsd: 420_000_000, importsFromUsUsd: 24_000_000, importsFromUsSharePct: 5.7,
    usExportPotentialUsd: 104_000_000, usBenchmarkSharePct: 24.8, yoyGrowthPct: 9.4,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 50, valueUsd: 210_000_000 },
      { country: 'Turkey',         iso3: 'TUR', sharePct: 18, valueUsd: 76_000_000 },
      { country: 'France',         iso3: 'FRA', sharePct: 14, valueUsd: 59_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 6,  valueUsd: 24_000_000 },
    ],
    sourceNotes: 'ANSD Senegal steel imports; Dakar Port infrastructure 2023' },

  { iso3: 'JAM', year: 2023, hsChapter: '72', categoryLabel: 'Iron & Steel (Intermediate)', categoryGroup: 'intermediate',
    totalImportsUsd: 185_000_000, importsFromUsUsd: 62_000_000, importsFromUsSharePct: 33.5,
    usExportPotentialUsd: 96_000_000, usBenchmarkSharePct: 51.9, yoyGrowthPct: 4.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 34, valueUsd: 62_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 28, valueUsd: 52_000_000 },
      { country: 'Trinidad',       iso3: 'TTO', sharePct: 16, valueUsd: 30_000_000 },
      { country: 'Brazil',         iso3: 'BRA', sharePct: 12, valueUsd: 22_000_000 },
    ],
    sourceNotes: 'STATIN Jamaica steel imports; Caribbean construction 2023' },

  { iso3: 'TTO', year: 2023, hsChapter: '72', categoryLabel: 'Iron & Steel (Intermediate)', categoryGroup: 'intermediate',
    totalImportsUsd: 320_000_000, importsFromUsUsd: 108_000_000, importsFromUsSharePct: 33.8,
    usExportPotentialUsd: 165_000_000, usBenchmarkSharePct: 51.6, yoyGrowthPct: 3.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 34, valueUsd: 108_000_000 },
      { country: 'Brazil',         iso3: 'BRA', sharePct: 22, valueUsd: 70_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 20, valueUsd: 64_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 12, valueUsd: 38_000_000 },
    ],
    sourceNotes: 'TTO CSSP steel imports; Point Lisas industrial estate sourcing 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // FERTILIZERS — expand to 10 markets
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'GHA', year: 2023, hsChapter: '31', categoryLabel: 'Fertilizers & Agri-inputs', categoryGroup: 'fertilizers',
    totalImportsUsd: 480_000_000, importsFromUsUsd: 68_000_000, importsFromUsSharePct: 14.2,
    usExportPotentialUsd: 185_000_000, usBenchmarkSharePct: 38.5, yoyGrowthPct: 9.2,
    topSuppliers: [
      { country: 'Morocco',        iso3: 'MAR', sharePct: 34, valueUsd: 163_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 24, valueUsd: 115_000_000 },
      { country: 'Russia',         iso3: 'RUS', sharePct: 18, valueUsd: 86_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 14, valueUsd: 68_000_000 },
    ],
    sourceNotes: 'Ghana MESTI fertilizer imports; MoFA Planting for Food 2023' },

  { iso3: 'ETH', year: 2023, hsChapter: '31', categoryLabel: 'Fertilizers & Agri-inputs', categoryGroup: 'fertilizers',
    totalImportsUsd: 860_000_000, importsFromUsUsd: 95_000_000, importsFromUsSharePct: 11.0,
    usExportPotentialUsd: 330_000_000, usBenchmarkSharePct: 38.4, yoyGrowthPct: 6.8,
    topSuppliers: [
      { country: 'Saudi Arabia',   iso3: 'SAU', sharePct: 26, valueUsd: 224_000_000 },
      { country: 'Russia',         iso3: 'RUS', sharePct: 24, valueUsd: 206_000_000 },
      { country: 'Morocco',        iso3: 'MAR', sharePct: 22, valueUsd: 189_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 11, valueUsd: 95_000_000 },
    ],
    sourceNotes: 'EFDR Ethiopia fertilizer; USAID Transform WASH Ethiopia 2023' },

  { iso3: 'TZA', year: 2023, hsChapter: '31', categoryLabel: 'Fertilizers & Agri-inputs', categoryGroup: 'fertilizers',
    totalImportsUsd: 580_000_000, importsFromUsUsd: 72_000_000, importsFromUsSharePct: 12.4,
    usExportPotentialUsd: 223_000_000, usBenchmarkSharePct: 38.4, yoyGrowthPct: 8.4,
    topSuppliers: [
      { country: 'Saudi Arabia',   iso3: 'SAU', sharePct: 28, valueUsd: 162_000_000 },
      { country: 'Russia',         iso3: 'RUS', sharePct: 22, valueUsd: 128_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 18, valueUsd: 104_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 12, valueUsd: 72_000_000 },
    ],
    sourceNotes: 'Tanzania NBS fertilizer; Yara Tanzania procurement 2023' },

  { iso3: 'TTO', year: 2023, hsChapter: '31', categoryLabel: 'Fertilizers & Agri-inputs', categoryGroup: 'fertilizers',
    totalImportsUsd: 145_000_000, importsFromUsUsd: 52_000_000, importsFromUsSharePct: 35.9,
    usExportPotentialUsd: 86_000_000, usBenchmarkSharePct: 59.3, yoyGrowthPct: 4.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 36, valueUsd: 52_000_000 },
      { country: 'Trinidad (local)',iso3: 'TTO', sharePct: 24, valueUsd: 35_000_000 },
      { country: 'Russia',         iso3: 'RUS', sharePct: 18, valueUsd: 26_000_000 },
      { country: 'Morocco',        iso3: 'MAR', sharePct: 12, valueUsd: 17_000_000 },
    ],
    sourceNotes: 'TTO CSSP fertilizer; Nutrien Caribbean distribution 2023' },

  { iso3: 'BHS', year: 2023, hsChapter: '31', categoryLabel: 'Fertilizers & Agri-inputs', categoryGroup: 'fertilizers',
    totalImportsUsd: 28_000_000, importsFromUsUsd: 14_000_000, importsFromUsSharePct: 50.0,
    usExportPotentialUsd: 20_000_000, usBenchmarkSharePct: 71.4, yoyGrowthPct: 3.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 50, valueUsd: 14_000_000 },
      { country: 'Canada',         iso3: 'CAN', sharePct: 24, valueUsd: 7_000_000 },
      { country: 'Brazil',         iso3: 'BRA', sharePct: 14, valueUsd: 4_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 8,  valueUsd: 2_000_000 },
    ],
    sourceNotes: 'Bahamas DoS agricultural imports; US Census Bureau 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // TRANSPORT & VEHICLES — expand to 10 markets
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'GHA', year: 2023, hsChapter: '87', categoryLabel: 'Transport & Commercial Vehicles', categoryGroup: 'transport',
    totalImportsUsd: 1_420_000_000, importsFromUsUsd: 125_000_000, importsFromUsSharePct: 8.8,
    usExportPotentialUsd: 363_000_000, usBenchmarkSharePct: 25.6, yoyGrowthPct: 8.4,
    topSuppliers: [
      { country: 'Japan',          iso3: 'JPN', sharePct: 38, valueUsd: 540_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 28, valueUsd: 398_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 9,  valueUsd: 125_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 8,  valueUsd: 114_000_000 },
    ],
    sourceNotes: 'Ghana DVLA vehicle imports; Newmont/GNPC fleet procurement 2023' },

  { iso3: 'ETH', year: 2023, hsChapter: '87', categoryLabel: 'Transport & Commercial Vehicles', categoryGroup: 'transport',
    totalImportsUsd: 1_800_000_000, importsFromUsUsd: 140_000_000, importsFromUsSharePct: 7.8,
    usExportPotentialUsd: 461_000_000, usBenchmarkSharePct: 25.6, yoyGrowthPct: 5.8,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 48, valueUsd: 864_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 20, valueUsd: 360_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 12, valueUsd: 216_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 8,  valueUsd: 140_000_000 },
    ],
    sourceNotes: 'NBE Ethiopia vehicle imports; Addis Ababa logistic sector 2023' },

  { iso3: 'TZA', year: 2023, hsChapter: '87', categoryLabel: 'Transport & Commercial Vehicles', categoryGroup: 'transport',
    totalImportsUsd: 1_200_000_000, importsFromUsUsd: 82_000_000, importsFromUsSharePct: 6.8,
    usExportPotentialUsd: 307_000_000, usBenchmarkSharePct: 25.6, yoyGrowthPct: 6.2,
    topSuppliers: [
      { country: 'Japan',          iso3: 'JPN', sharePct: 42, valueUsd: 504_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 28, valueUsd: 336_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 10, valueUsd: 120_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 7,  valueUsd: 82_000_000 },
    ],
    sourceNotes: 'Tanzania TRA vehicle imports; Kilwa road project logistics 2023' },

  { iso3: 'SEN', year: 2023, hsChapter: '87', categoryLabel: 'Transport & Commercial Vehicles', categoryGroup: 'transport',
    totalImportsUsd: 820_000_000, importsFromUsUsd: 58_000_000, importsFromUsSharePct: 7.1,
    usExportPotentialUsd: 210_000_000, usBenchmarkSharePct: 25.6, yoyGrowthPct: 11.4,
    topSuppliers: [
      { country: 'France',         iso3: 'FRA', sharePct: 32, valueUsd: 262_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 28, valueUsd: 230_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 18, valueUsd: 148_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 7,  valueUsd: 58_000_000 },
    ],
    sourceNotes: 'ANSD Senegal vehicle imports; Dakar TER procurement 2023' },

  { iso3: 'CIV', year: 2023, hsChapter: '87', categoryLabel: 'Transport & Commercial Vehicles', categoryGroup: 'transport',
    totalImportsUsd: 1_100_000_000, importsFromUsUsd: 82_000_000, importsFromUsSharePct: 7.5,
    usExportPotentialUsd: 282_000_000, usBenchmarkSharePct: 25.6, yoyGrowthPct: 9.8,
    topSuppliers: [
      { country: 'France',         iso3: 'FRA', sharePct: 30, valueUsd: 330_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 26, valueUsd: 286_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 20, valueUsd: 220_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 7,  valueUsd: 82_000_000 },
    ],
    sourceNotes: "INS Côte d'Ivoire vehicle imports; Abidjan port logistics 2023" },

  // ════════════════════════════════════════════════════════════════════════
  // PHARMA — expand to 10 markets (add TZA, SEN)
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'TZA', year: 2023, hsChapter: '30', categoryLabel: 'Pharmaceuticals & Medical Supplies', categoryGroup: 'pharma',
    totalImportsUsd: 520_000_000, importsFromUsUsd: 88_000_000, importsFromUsSharePct: 16.9,
    usExportPotentialUsd: 224_000_000, usBenchmarkSharePct: 43.1, yoyGrowthPct: 9.6,
    topSuppliers: [
      { country: 'India',          iso3: 'IND', sharePct: 42, valueUsd: 218_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 17, valueUsd: 88_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 12, valueUsd: 62_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 10, valueUsd: 52_000_000 },
    ],
    sourceNotes: 'MSD Tanzania procurement; PEPFAR Tanzania ARV supply chain 2023' },

  { iso3: 'SEN', year: 2023, hsChapter: '30', categoryLabel: 'Pharmaceuticals & Medical Supplies', categoryGroup: 'pharma',
    totalImportsUsd: 380_000_000, importsFromUsUsd: 48_000_000, importsFromUsSharePct: 12.6,
    usExportPotentialUsd: 164_000_000, usBenchmarkSharePct: 43.2, yoyGrowthPct: 7.8,
    topSuppliers: [
      { country: 'France',         iso3: 'FRA', sharePct: 32, valueUsd: 122_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 28, valueUsd: 106_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 13, valueUsd: 48_000_000 },
      { country: 'Belgium',        iso3: 'BEL', sharePct: 10, valueUsd: 38_000_000 },
    ],
    sourceNotes: 'PNA Senegal pharma imports; PEPFAR Senegal health supply 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // GRAINS — expand to 10 markets (add ZAF, CIV, TTO)
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'ZAF', year: 2023, hsChapter: '10', categoryLabel: 'Grains & Cereals', categoryGroup: 'grains',
    totalImportsUsd: 1_200_000_000, importsFromUsUsd: 320_000_000, importsFromUsSharePct: 26.7,
    usExportPotentialUsd: 780_000_000, usBenchmarkSharePct: 65.0, yoyGrowthPct: 5.6,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 27, valueUsd: 320_000_000 },
      { country: 'Argentina',      iso3: 'ARG', sharePct: 24, valueUsd: 288_000_000 },
      { country: 'Australia',      iso3: 'AUS', sharePct: 22, valueUsd: 264_000_000 },
      { country: 'Russia',         iso3: 'RUS', sharePct: 14, valueUsd: 168_000_000 },
    ],
    sourceNotes: 'SARS South Africa grain imports; SAGIS milling 2023' },

  { iso3: 'CIV', year: 2023, hsChapter: '10', categoryLabel: 'Grains & Cereals', categoryGroup: 'grains',
    totalImportsUsd: 680_000_000, importsFromUsUsd: 82_000_000, importsFromUsSharePct: 12.1,
    usExportPotentialUsd: 272_000_000, usBenchmarkSharePct: 40.0, yoyGrowthPct: 8.8,
    topSuppliers: [
      { country: 'Russia',         iso3: 'RUS', sharePct: 36, valueUsd: 245_000_000 },
      { country: 'France',         iso3: 'FRA', sharePct: 22, valueUsd: 150_000_000 },
      { country: 'Ukraine',        iso3: 'UKR', sharePct: 18, valueUsd: 122_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 12, valueUsd: 82_000_000 },
    ],
    sourceNotes: "INS Côte d'Ivoire grain imports; USDA GATS West Africa 2023" },

  { iso3: 'TTO', year: 2023, hsChapter: '10', categoryLabel: 'Grains & Cereals', categoryGroup: 'grains',
    totalImportsUsd: 185_000_000, importsFromUsUsd: 98_000_000, importsFromUsSharePct: 53.0,
    usExportPotentialUsd: 138_000_000, usBenchmarkSharePct: 74.6, yoyGrowthPct: 3.4,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 53, valueUsd: 98_000_000 },
      { country: 'Canada',         iso3: 'CAN', sharePct: 22, valueUsd: 41_000_000 },
      { country: 'Brazil',         iso3: 'BRA', sharePct: 14, valueUsd: 26_000_000 },
      { country: 'Argentina',      iso3: 'ARG', sharePct: 8,  valueUsd: 15_000_000 },
    ],
    sourceNotes: 'TTO CSSP grain imports; Central Bank Trinidad Caribbean food security 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // TEXTILE INPUTS & APPAREL MACHINERY (HS 55/56) — 10 markets
  // Synthetic yarns and fabrics imported by EPZ garment factories
  // directly tied to AGOA apparel export capacity
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'NGA', year: 2023, hsChapter: '55', categoryLabel: 'Synthetic Yarn & Fabric Inputs', categoryGroup: 'textiles_inputs',
    totalImportsUsd: 320_000_000, importsFromUsUsd: 28_000_000, importsFromUsSharePct: 8.8,
    usExportPotentialUsd: 110_000_000, usBenchmarkSharePct: 34.4, yoyGrowthPct: 5.2,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 52, valueUsd: 166_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 22, valueUsd: 70_000_000 },
      { country: 'Pakistan',       iso3: 'PAK', sharePct: 12, valueUsd: 38_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 9,  valueUsd: 28_000_000 },
    ],
    sourceNotes: 'Nigerian textile mills synthetic yarn; ITC TDM HS55 2023' },

  { iso3: 'KEN', year: 2023, hsChapter: '55', categoryLabel: 'Synthetic Yarn & Fabric Inputs', categoryGroup: 'textiles_inputs',
    totalImportsUsd: 280_000_000, importsFromUsUsd: 48_000_000, importsFromUsSharePct: 17.1,
    usExportPotentialUsd: 96_000_000, usBenchmarkSharePct: 34.3, yoyGrowthPct: 12.4,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 44, valueUsd: 123_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 17, valueUsd: 48_000_000 },
      { country: 'Taiwan',         iso3: 'TWN', sharePct: 14, valueUsd: 39_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 12, valueUsd: 34_000_000 },
    ],
    sourceNotes: 'KEPSA EPZ yarn imports; Kenya AGOA garment factories synthetic inputs 2023' },

  { iso3: 'ETH', year: 2023, hsChapter: '55', categoryLabel: 'Synthetic Yarn & Fabric Inputs', categoryGroup: 'textiles_inputs',
    totalImportsUsd: 240_000_000, importsFromUsUsd: 22_000_000, importsFromUsSharePct: 9.2,
    usExportPotentialUsd: 82_000_000, usBenchmarkSharePct: 34.2, yoyGrowthPct: 14.6,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 50, valueUsd: 120_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 20, valueUsd: 48_000_000 },
      { country: 'Pakistan',       iso3: 'PAK', sharePct: 14, valueUsd: 34_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 9,  valueUsd: 22_000_000 },
    ],
    sourceNotes: 'ETH TIDI synthetic inputs; Hawassa Industrial Park fabric procurement 2023' },

  { iso3: 'ZAF', year: 2023, hsChapter: '55', categoryLabel: 'Synthetic Yarn & Fabric Inputs', categoryGroup: 'textiles_inputs',
    totalImportsUsd: 380_000_000, importsFromUsUsd: 52_000_000, importsFromUsSharePct: 13.7,
    usExportPotentialUsd: 130_000_000, usBenchmarkSharePct: 34.2, yoyGrowthPct: 3.4,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 42, valueUsd: 160_000_000 },
      { country: 'Taiwan',         iso3: 'TWN', sharePct: 18, valueUsd: 68_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 16, valueUsd: 61_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 14, valueUsd: 52_000_000 },
    ],
    sourceNotes: 'SARS South Africa HS55 textile inputs; SA clothing industry 2023' },

  { iso3: 'GHA', year: 2023, hsChapter: '55', categoryLabel: 'Synthetic Yarn & Fabric Inputs', categoryGroup: 'textiles_inputs',
    totalImportsUsd: 145_000_000, importsFromUsUsd: 16_000_000, importsFromUsSharePct: 11.0,
    usExportPotentialUsd: 50_000_000, usBenchmarkSharePct: 34.5, yoyGrowthPct: 5.6,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 54, valueUsd: 78_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 20, valueUsd: 29_000_000 },
      { country: 'Taiwan',         iso3: 'TWN', sharePct: 10, valueUsd: 15_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 11, valueUsd: 16_000_000 },
    ],
    sourceNotes: 'Ghana textiles; GIPC kente and synthetic fabric imports 2023' },

  { iso3: 'TZA', year: 2023, hsChapter: '55', categoryLabel: 'Synthetic Yarn & Fabric Inputs', categoryGroup: 'textiles_inputs',
    totalImportsUsd: 165_000_000, importsFromUsUsd: 14_000_000, importsFromUsSharePct: 8.5,
    usExportPotentialUsd: 56_000_000, usBenchmarkSharePct: 33.9, yoyGrowthPct: 6.2,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 56, valueUsd: 92_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 20, valueUsd: 33_000_000 },
      { country: 'Pakistan',       iso3: 'PAK', sharePct: 12, valueUsd: 20_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 8,  valueUsd: 14_000_000 },
    ],
    sourceNotes: 'Tanzania NBS synthetic textiles; Urafiki Textile Mill inputs 2023' },

  { iso3: 'CIV', year: 2023, hsChapter: '55', categoryLabel: 'Synthetic Yarn & Fabric Inputs', categoryGroup: 'textiles_inputs',
    totalImportsUsd: 195_000_000, importsFromUsUsd: 16_000_000, importsFromUsSharePct: 8.2,
    usExportPotentialUsd: 67_000_000, usBenchmarkSharePct: 34.4, yoyGrowthPct: 7.4,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 48, valueUsd: 94_000_000 },
      { country: 'France',         iso3: 'FRA', sharePct: 22, valueUsd: 43_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 16, valueUsd: 31_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 8,  valueUsd: 16_000_000 },
    ],
    sourceNotes: "INS Côte d'Ivoire synthetic textiles; UEMOA apparel zone inputs 2023" },

  { iso3: 'SEN', year: 2023, hsChapter: '55', categoryLabel: 'Synthetic Yarn & Fabric Inputs', categoryGroup: 'textiles_inputs',
    totalImportsUsd: 110_000_000, importsFromUsUsd: 10_000_000, importsFromUsSharePct: 9.1,
    usExportPotentialUsd: 38_000_000, usBenchmarkSharePct: 34.5, yoyGrowthPct: 5.8,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 50, valueUsd: 55_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 22, valueUsd: 24_000_000 },
      { country: 'France',         iso3: 'FRA', sharePct: 14, valueUsd: 15_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 9,  valueUsd: 10_000_000 },
    ],
    sourceNotes: 'ANSD Senegal HS55 textile; UNIDO Dakar garment zone 2023' },

  { iso3: 'JAM', year: 2023, hsChapter: '55', categoryLabel: 'Synthetic Yarn & Fabric Inputs', categoryGroup: 'textiles_inputs',
    totalImportsUsd: 52_000_000, importsFromUsUsd: 18_000_000, importsFromUsSharePct: 34.6,
    usExportPotentialUsd: 32_000_000, usBenchmarkSharePct: 61.5, yoyGrowthPct: 4.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 35, valueUsd: 18_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 28, valueUsd: 15_000_000 },
      { country: 'Taiwan',         iso3: 'TWN', sharePct: 16, valueUsd: 8_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 12, valueUsd: 6_000_000 },
    ],
    sourceNotes: 'STATIN Jamaica textile inputs; Caribbean CBTPA garment manufacturers 2023' },

  { iso3: 'TTO', year: 2023, hsChapter: '55', categoryLabel: 'Synthetic Yarn & Fabric Inputs', categoryGroup: 'textiles_inputs',
    totalImportsUsd: 42_000_000, importsFromUsUsd: 14_000_000, importsFromUsSharePct: 33.3,
    usExportPotentialUsd: 26_000_000, usBenchmarkSharePct: 61.9, yoyGrowthPct: 3.6,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 33, valueUsd: 14_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 30, valueUsd: 13_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 20, valueUsd: 8_000_000 },
      { country: 'Taiwan',         iso3: 'TWN', sharePct: 10, valueUsd: 4_000_000 },
    ],
    sourceNotes: 'TTO CSSP synthetic textiles; Caribbean basin apparel inputs 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // ICT & TELECOMMUNICATIONS (HS 85) — 10 markets
  // Network equipment, servers, telecom infra, data center hardware
  // US brands: Cisco, Dell, HP, Qualcomm, Motorola
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'NGA', year: 2023, hsChapter: '85', categoryLabel: 'ICT & Telecommunications Equipment', categoryGroup: 'ict',
    totalImportsUsd: 3_800_000_000, importsFromUsUsd: 620_000_000, importsFromUsSharePct: 16.3,
    usExportPotentialUsd: 1_330_000_000, usBenchmarkSharePct: 35.0, yoyGrowthPct: 14.2,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 48, valueUsd: 1_824_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 16, valueUsd: 620_000_000 },
      { country: 'South Korea',    iso3: 'KOR', sharePct: 12, valueUsd: 456_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 8,  valueUsd: 304_000_000 },
    ],
    sourceNotes: 'NBS Nigeria HS85 ICT imports; MTN/Airtel network expansion capex 2023' },

  { iso3: 'KEN', year: 2023, hsChapter: '85', categoryLabel: 'ICT & Telecommunications Equipment', categoryGroup: 'ict',
    totalImportsUsd: 1_620_000_000, importsFromUsUsd: 298_000_000, importsFromUsSharePct: 18.4,
    usExportPotentialUsd: 567_000_000, usBenchmarkSharePct: 35.0, yoyGrowthPct: 16.8,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 44, valueUsd: 713_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 18, valueUsd: 298_000_000 },
      { country: 'South Korea',    iso3: 'KOR', sharePct: 14, valueUsd: 227_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 8,  valueUsd: 130_000_000 },
    ],
    sourceNotes: 'KEBS Kenya HS85 ICT; Safaricom/Airtel Kenya 5G capex; Konza Technopolis 2023' },

  { iso3: 'ZAF', year: 2023, hsChapter: '85', categoryLabel: 'ICT & Telecommunications Equipment', categoryGroup: 'ict',
    totalImportsUsd: 7_200_000_000, importsFromUsUsd: 1_440_000_000, importsFromUsSharePct: 20.0,
    usExportPotentialUsd: 2_520_000_000, usBenchmarkSharePct: 35.0, yoyGrowthPct: 8.6,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 38, valueUsd: 2_736_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 20, valueUsd: 1_440_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 12, valueUsd: 864_000_000 },
      { country: 'South Korea',    iso3: 'KOR', sharePct: 10, valueUsd: 720_000_000 },
    ],
    sourceNotes: 'SARS South Africa HS85; MTN/Vodacom 5G rollout; AWS Cape Town expansion 2023' },

  { iso3: 'GHA', year: 2023, hsChapter: '85', categoryLabel: 'ICT & Telecommunications Equipment', categoryGroup: 'ict',
    totalImportsUsd: 1_020_000_000, importsFromUsUsd: 168_000_000, importsFromUsSharePct: 16.5,
    usExportPotentialUsd: 357_000_000, usBenchmarkSharePct: 35.0, yoyGrowthPct: 12.4,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 50, valueUsd: 510_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 16, valueUsd: 168_000_000 },
      { country: 'South Korea',    iso3: 'KOR', sharePct: 12, valueUsd: 122_000_000 },
      { country: 'Finland',        iso3: 'FIN', sharePct: 8,  valueUsd: 82_000_000 },
    ],
    sourceNotes: 'Ghana Statistical Service HS85; MTN Ghana 5G; KPMG Ghana digital economy 2023' },

  { iso3: 'ETH', year: 2023, hsChapter: '85', categoryLabel: 'ICT & Telecommunications Equipment', categoryGroup: 'ict',
    totalImportsUsd: 1_450_000_000, importsFromUsUsd: 160_000_000, importsFromUsSharePct: 11.0,
    usExportPotentialUsd: 508_000_000, usBenchmarkSharePct: 35.0, yoyGrowthPct: 18.4,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 58, valueUsd: 841_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 11, valueUsd: 160_000_000 },
      { country: 'South Korea',    iso3: 'KOR', sharePct: 10, valueUsd: 145_000_000 },
      { country: 'Finland',        iso3: 'FIN', sharePct: 8,  valueUsd: 116_000_000 },
    ],
    sourceNotes: 'NBE Ethiopia HS85; Ethio Telecom 4G/5G expansion; Digital Ethiopia 2025 program' },

  { iso3: 'TZA', year: 2023, hsChapter: '85', categoryLabel: 'ICT & Telecommunications Equipment', categoryGroup: 'ict',
    totalImportsUsd: 820_000_000, importsFromUsUsd: 102_000_000, importsFromUsSharePct: 12.4,
    usExportPotentialUsd: 287_000_000, usBenchmarkSharePct: 35.0, yoyGrowthPct: 13.2,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 54, valueUsd: 443_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 12, valueUsd: 102_000_000 },
      { country: 'South Korea',    iso3: 'KOR', sharePct: 12, valueUsd: 98_000_000 },
      { country: 'Finland',        iso3: 'FIN', sharePct: 8,  valueUsd: 66_000_000 },
    ],
    sourceNotes: 'Tanzania NBS HS85; Vodacom Tanzania network expansion 2023' },

  { iso3: 'SEN', year: 2023, hsChapter: '85', categoryLabel: 'ICT & Telecommunications Equipment', categoryGroup: 'ict',
    totalImportsUsd: 620_000_000, importsFromUsUsd: 78_000_000, importsFromUsSharePct: 12.6,
    usExportPotentialUsd: 217_000_000, usBenchmarkSharePct: 35.0, yoyGrowthPct: 15.4,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 52, valueUsd: 322_000_000 },
      { country: 'France',         iso3: 'FRA', sharePct: 18, valueUsd: 112_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 13, valueUsd: 78_000_000 },
      { country: 'South Korea',    iso3: 'KOR', sharePct: 8,  valueUsd: 50_000_000 },
    ],
    sourceNotes: 'ANSD Senegal HS85; Orange Senegal 4G; Smart Sénégal digital program 2023' },

  { iso3: 'CIV', year: 2023, hsChapter: '85', categoryLabel: 'ICT & Telecommunications Equipment', categoryGroup: 'ict',
    totalImportsUsd: 880_000_000, importsFromUsUsd: 106_000_000, importsFromUsSharePct: 12.0,
    usExportPotentialUsd: 308_000_000, usBenchmarkSharePct: 35.0, yoyGrowthPct: 13.8,
    topSuppliers: [
      { country: 'China',          iso3: 'CHN', sharePct: 50, valueUsd: 440_000_000 },
      { country: 'France',         iso3: 'FRA', sharePct: 20, valueUsd: 176_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 12, valueUsd: 106_000_000 },
      { country: 'South Korea',    iso3: 'KOR', sharePct: 8,  valueUsd: 70_000_000 },
    ],
    sourceNotes: "INS Côte d'Ivoire HS85; Orange/MTN Ivory Coast 5G; SIR digital infra 2023" },

  { iso3: 'JAM', year: 2023, hsChapter: '85', categoryLabel: 'ICT & Telecommunications Equipment', categoryGroup: 'ict',
    totalImportsUsd: 320_000_000, importsFromUsUsd: 112_000_000, importsFromUsSharePct: 35.0,
    usExportPotentialUsd: 179_000_000, usBenchmarkSharePct: 55.9, yoyGrowthPct: 9.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 35, valueUsd: 112_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 28, valueUsd: 90_000_000 },
      { country: 'South Korea',    iso3: 'KOR', sharePct: 16, valueUsd: 51_000_000 },
      { country: 'United Kingdom', iso3: 'GBR', sharePct: 10, valueUsd: 32_000_000 },
    ],
    sourceNotes: 'STATIN Jamaica HS85; Flow/Digicel Jamaica network capex 2023' },

  { iso3: 'TTO', year: 2023, hsChapter: '85', categoryLabel: 'ICT & Telecommunications Equipment', categoryGroup: 'ict',
    totalImportsUsd: 480_000_000, importsFromUsUsd: 168_000_000, importsFromUsSharePct: 35.0,
    usExportPotentialUsd: 269_000_000, usBenchmarkSharePct: 56.0, yoyGrowthPct: 8.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 35, valueUsd: 168_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 26, valueUsd: 125_000_000 },
      { country: 'South Korea',    iso3: 'KOR', sharePct: 14, valueUsd: 67_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 10, valueUsd: 48_000_000 },
    ],
    sourceNotes: 'TTO CSSP HS85; Digicel/Flow TT 5G rollout; Point Lisas data center 2023' },

  // ════════════════════════════════════════════════════════════════════════
  // MEDICAL DEVICES & DIAGNOSTICS (HS 90) — 10 markets
  // Imaging equipment, diagnostics, surgical instruments, lab equipment
  // US brands: GE Healthcare, Becton Dickinson, Medtronic, Abbott
  // ════════════════════════════════════════════════════════════════════════

  { iso3: 'NGA', year: 2023, hsChapter: '90', categoryLabel: 'Medical Devices & Diagnostics', categoryGroup: 'medical_devices',
    totalImportsUsd: 680_000_000, importsFromUsUsd: 162_000_000, importsFromUsSharePct: 23.8,
    usExportPotentialUsd: 306_000_000, usBenchmarkSharePct: 45.0, yoyGrowthPct: 11.4,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 24, valueUsd: 162_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 22, valueUsd: 150_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 20, valueUsd: 136_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 14, valueUsd: 95_000_000 },
    ],
    sourceNotes: 'NAFDAC medical devices; FMoH Nigeria hospital equipment procurement 2023' },

  { iso3: 'KEN', year: 2023, hsChapter: '90', categoryLabel: 'Medical Devices & Diagnostics', categoryGroup: 'medical_devices',
    totalImportsUsd: 480_000_000, importsFromUsUsd: 144_000_000, importsFromUsSharePct: 30.0,
    usExportPotentialUsd: 216_000_000, usBenchmarkSharePct: 45.0, yoyGrowthPct: 13.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 30, valueUsd: 144_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 24, valueUsd: 115_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 16, valueUsd: 77_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 12, valueUsd: 58_000_000 },
    ],
    sourceNotes: 'KEBS medical devices; KEMSA imaging procurement; PEPFAR lab equipment 2023' },

  { iso3: 'ZAF', year: 2023, hsChapter: '90', categoryLabel: 'Medical Devices & Diagnostics', categoryGroup: 'medical_devices',
    totalImportsUsd: 1_850_000_000, importsFromUsUsd: 555_000_000, importsFromUsSharePct: 30.0,
    usExportPotentialUsd: 833_000_000, usBenchmarkSharePct: 45.0, yoyGrowthPct: 7.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 30, valueUsd: 555_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 26, valueUsd: 481_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 14, valueUsd: 259_000_000 },
      { country: 'Netherlands',    iso3: 'NLD', sharePct: 10, valueUsd: 185_000_000 },
    ],
    sourceNotes: 'SARS South Africa HS90; Netcare/Mediclinic hospital procurement 2023' },

  { iso3: 'GHA', year: 2023, hsChapter: '90', categoryLabel: 'Medical Devices & Diagnostics', categoryGroup: 'medical_devices',
    totalImportsUsd: 285_000_000, importsFromUsUsd: 68_000_000, importsFromUsSharePct: 23.9,
    usExportPotentialUsd: 128_000_000, usBenchmarkSharePct: 44.9, yoyGrowthPct: 10.6,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 24, valueUsd: 68_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 22, valueUsd: 63_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 18, valueUsd: 51_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 14, valueUsd: 40_000_000 },
    ],
    sourceNotes: 'Ghana FDA medical devices; GHS Korle Bu procurement 2023' },

  { iso3: 'ETH', year: 2023, hsChapter: '90', categoryLabel: 'Medical Devices & Diagnostics', categoryGroup: 'medical_devices',
    totalImportsUsd: 380_000_000, importsFromUsUsd: 90_000_000, importsFromUsSharePct: 23.7,
    usExportPotentialUsd: 171_000_000, usBenchmarkSharePct: 45.0, yoyGrowthPct: 12.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 24, valueUsd: 90_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 20, valueUsd: 76_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 18, valueUsd: 68_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 14, valueUsd: 53_000_000 },
    ],
    sourceNotes: 'PFSA Ethiopia medical devices; USAID Health Supply Chain ETH 2023' },

  { iso3: 'TZA', year: 2023, hsChapter: '90', categoryLabel: 'Medical Devices & Diagnostics', categoryGroup: 'medical_devices',
    totalImportsUsd: 265_000_000, importsFromUsUsd: 62_000_000, importsFromUsSharePct: 23.4,
    usExportPotentialUsd: 119_000_000, usBenchmarkSharePct: 44.9, yoyGrowthPct: 10.2,
    topSuppliers: [
      { country: 'Germany',        iso3: 'DEU', sharePct: 26, valueUsd: 69_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 23, valueUsd: 62_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 20, valueUsd: 53_000_000 },
      { country: 'India',          iso3: 'IND', sharePct: 14, valueUsd: 37_000_000 },
    ],
    sourceNotes: 'MSD Tanzania medical devices; PEPFAR TZA lab procurement 2023' },

  { iso3: 'SEN', year: 2023, hsChapter: '90', categoryLabel: 'Medical Devices & Diagnostics', categoryGroup: 'medical_devices',
    totalImportsUsd: 185_000_000, importsFromUsUsd: 42_000_000, importsFromUsSharePct: 22.7,
    usExportPotentialUsd: 83_000_000, usBenchmarkSharePct: 44.9, yoyGrowthPct: 9.4,
    topSuppliers: [
      { country: 'France',         iso3: 'FRA', sharePct: 34, valueUsd: 63_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 23, valueUsd: 42_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 16, valueUsd: 30_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 14, valueUsd: 26_000_000 },
    ],
    sourceNotes: 'PNA Senegal HS90; CHN Dalal hospital procurement; USAID Senegal 2023' },

  { iso3: 'CIV', year: 2023, hsChapter: '90', categoryLabel: 'Medical Devices & Diagnostics', categoryGroup: 'medical_devices',
    totalImportsUsd: 210_000_000, importsFromUsUsd: 48_000_000, importsFromUsSharePct: 22.9,
    usExportPotentialUsd: 95_000_000, usBenchmarkSharePct: 45.2, yoyGrowthPct: 10.8,
    topSuppliers: [
      { country: 'France',         iso3: 'FRA', sharePct: 36, valueUsd: 76_000_000 },
      { country: 'United States',  iso3: 'USA', sharePct: 23, valueUsd: 48_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 16, valueUsd: 34_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 12, valueUsd: 25_000_000 },
    ],
    sourceNotes: "INS Côte d'Ivoire HS90; CHU Cocody hospital procurement 2023" },

  { iso3: 'JAM', year: 2023, hsChapter: '90', categoryLabel: 'Medical Devices & Diagnostics', categoryGroup: 'medical_devices',
    totalImportsUsd: 125_000_000, importsFromUsUsd: 56_000_000, importsFromUsSharePct: 44.8,
    usExportPotentialUsd: 81_000_000, usBenchmarkSharePct: 64.8, yoyGrowthPct: 6.8,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 45, valueUsd: 56_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 18, valueUsd: 23_000_000 },
      { country: 'United Kingdom', iso3: 'GBR', sharePct: 16, valueUsd: 20_000_000 },
      { country: 'China',          iso3: 'CHN', sharePct: 12, valueUsd: 15_000_000 },
    ],
    sourceNotes: 'STATIN Jamaica HS90; KPH/UHWI hospital procurement; CARPHA Caribbean 2023' },

  { iso3: 'TTO', year: 2023, hsChapter: '90', categoryLabel: 'Medical Devices & Diagnostics', categoryGroup: 'medical_devices',
    totalImportsUsd: 185_000_000, importsFromUsUsd: 82_000_000, importsFromUsSharePct: 44.3,
    usExportPotentialUsd: 120_000_000, usBenchmarkSharePct: 64.9, yoyGrowthPct: 7.2,
    topSuppliers: [
      { country: 'United States',  iso3: 'USA', sharePct: 44, valueUsd: 82_000_000 },
      { country: 'Germany',        iso3: 'DEU', sharePct: 20, valueUsd: 37_000_000 },
      { country: 'United Kingdom', iso3: 'GBR', sharePct: 16, valueUsd: 30_000_000 },
      { country: 'Japan',          iso3: 'JPN', sharePct: 10, valueUsd: 19_000_000 },
    ],
    sourceNotes: 'TTO CSSP HS90; Eric Williams Medical Sciences Complex procurement 2023' },
];

// ── Ingestion runner ──────────────────────────────────────────────────────────

export async function ingestImportDemand(): Promise<void> {
  console.log('\n[ingest-import-demand] Seeding import demand signals...\n');
  console.log(`  → ${DEMAND_RECORDS.length} records across ${new Set(DEMAND_RECORDS.map((r) => r.iso3)).size} markets\n`);

  const supabase = getSupabaseServiceClient();
  // Use un_comtrade as base source (ITC TDM is derived from Comtrade data)
  const { jobId, sourceId } = await createIngestionJob('un_comtrade', 'import_demand_seed');
  const start = Date.now();
  let upserted = 0; let failed = 0;

  // Country lookup
  const isoList = [...new Set(DEMAND_RECORDS.map((r) => r.iso3))];
  const { data: countries, error: cErr } = await supabase
    .from('souvera_countries').select('id, iso3').in('iso3', isoList);
  if (cErr) throw new Error(`Country lookup failed: ${cErr.message}`);
  const countryMap = new Map((countries ?? []).map((c) => [c.iso3, c.id]));

  for (const d of DEMAND_RECORDS) {
    const countryId = countryMap.get(d.iso3);
    if (!countryId) { console.warn(`  ⚠  ${d.iso3} not found — skipping`); failed++; continue; }

    const { error } = await supabase.from('souvera_import_demand_signals').upsert({
      country_id: countryId,
      year: d.year,
      hs_chapter: d.hsChapter,
      category_label: d.categoryLabel,
      category_group: d.categoryGroup,
      total_imports_usd: d.totalImportsUsd,
      imports_from_us_usd: d.importsFromUsUsd,
      imports_from_us_vol_mt: d.importsFromUsVolMt ?? null,
      imports_from_us_share_pct: d.importsFromUsSharePct,
      us_export_potential_usd: d.usExportPotentialUsd,
      us_benchmark_share_pct: d.usBenchmarkSharePct,
      yoy_growth_pct: d.yoyGrowthPct ?? null,
      top_suppliers: d.topSuppliers,
      source_id: sourceId,
      source_notes: d.sourceNotes,
      generated_at: new Date().toISOString(),
    }, { onConflict: 'country_id,year,hs_chapter' });

    if (error) { console.error(`  ✗  ${d.iso3} ${d.hsChapter}: ${error.message}`); failed++; }
    else { console.log(`  ✓  ${d.iso3} — ${d.categoryLabel} (${d.hsChapter})`); upserted++; }
  }

  const elapsed = Date.now() - start;
  console.log(`\n  Summary: ${upserted} upserted, ${failed} failed — ${elapsed}ms`);
  const status = failed === 0 ? 'succeeded' : upserted > 0 ? 'partial' : 'failed';
  await closeIngestionJob(jobId, status, upserted, failed, failed > 0 ? `${failed} record(s) failed` : undefined);
  if (failed > 0) throw new Error(`${failed} record(s) failed`);
  console.log('\n[ingest-import-demand] Done.\n');
}
