/**
 * Phase 0E.2 — Static trade migration (self-contained)
 *
 * Migrates all 12 rollout-market trade records into souvera_country_trade_snapshots.
 * Source data is inlined here because the 5 original static *-trade.ts files have
 * been deleted as part of the Phase 0E anti-hardcode sweep.
 *
 * Aggregate totals (total_trade_usd, exports_usd, etc.) are stored in trade_summary_md
 * as a JSON meta prefix: {"_meta":{...}}\nnarrative text
 * The country API parses this prefix at read time until alter-trade-snapshots-add-columns
 * migration is applied to add explicit columns.
 *
 * Run:
 *   npx tsx --tsconfig services/ingestion/tsconfig.json \
 *     services/ingestion/run.ts static-trade-migration
 */

import { getSupabaseServiceClient } from '@souvera/config';
import { closeIngestionJob, createIngestionJob } from './shared';

// ── Inlined trade data (sourced from UN Comtrade, USTR, national statistics 2024) ──

interface TradePartner {
  country: string; flag: string;
  exportsUsd?: number; importsUsd?: number; totalUsd: number; sharePct: number; badge?: string;
}
interface SectorShare { sector: string; sharePct: number; }
interface IntraRegional { primaryVolumeUsd: number; secondaryVolumeUsd?: number; topPartners: { country: string; flag: string; totalUsd: number; sharePct: number }[]; }
interface AgoaInfo { status: string; statusNote: string; currentExportsUsd: number; potentialExportsUsd: number; eligibleCategories: number; }
interface TradeRecord {
  iso3: string; label: string; asOfYear: number;
  totalTradeUsd: number; exportsUsd: number; importsUsd: number;
  exportsToUs: { year: number; valueUsd: number; yoyPct: number | null };
  importsFromUs: { year: number; valueUsd: number; yoyPct: number | null };
  topPartners: TradePartner[];
  exportComposition: SectorShare[]; importComposition: SectorShare[];
  intraRegional?: IntraRegional;
  intraAfrican?: { afcftaTradeUsd: number; ecowasTradeUsd?: number; topPartners: { country: string; flag: string; totalUsd: number; sharePct: number }[] };
  agoa: AgoaInfo;
}

const TRADE_RECORDS: TradeRecord[] = [
  // ── NGA ────────────────────────────────────────────────────────────────
  { iso3: 'NGA', label: 'Nigeria', asOfYear: 2024,
    totalTradeUsd: 62_700_000_000, exportsUsd: 38_200_000_000, importsUsd: 24_500_000_000,
    exportsToUs: { year: 2024, valueUsd: 4_100_000_000, yoyPct: 8.2 },
    importsFromUs: { year: 2024, valueUsd: 3_800_000_000, yoyPct: 5.1 },
    topPartners: [
      { country: 'China', flag: '🇨🇳', exportsUsd: 12_400_000_000, importsUsd: 8_900_000_000, totalUsd: 21_300_000_000, sharePct: 34 },
      { country: 'United States', flag: '🇺🇸', exportsUsd: 4_100_000_000, importsUsd: 3_800_000_000, totalUsd: 7_900_000_000, sharePct: 13, badge: 'AGOA Restoration' },
      { country: 'European Union', flag: '🇪🇺', exportsUsd: 6_200_000_000, importsUsd: 5_100_000_000, totalUsd: 11_300_000_000, sharePct: 18 },
      { country: 'India', flag: '🇮🇳', exportsUsd: 3_800_000_000, importsUsd: 2_900_000_000, totalUsd: 6_700_000_000, sharePct: 11 },
      { country: 'United Kingdom', flag: '🇬🇧', exportsUsd: 2_100_000_000, importsUsd: 1_800_000_000, totalUsd: 3_900_000_000, sharePct: 6 },
    ],
    exportComposition: [{ sector: 'Crude Oil & Petroleum', sharePct: 76 }, { sector: 'Agriculture & Food', sharePct: 11 }, { sector: 'Manufacturing', sharePct: 7 }, { sector: 'Solid Minerals & Mining', sharePct: 3 }, { sector: 'Services & Other', sharePct: 3 }],
    importComposition: [{ sector: 'Machinery & Capital Goods', sharePct: 28 }, { sector: 'Refined Petroleum & Energy', sharePct: 22 }, { sector: 'Food & Consumer Goods', sharePct: 18 }, { sector: 'Chemicals & Plastics', sharePct: 16 }, { sector: 'Transport Equipment', sharePct: 16 }],
    intraAfrican: { afcftaTradeUsd: 8_400_000_000, ecowasTradeUsd: 5_200_000_000, topPartners: [{ country: 'Ghana', flag: '🇬🇭', totalUsd: 1_800_000_000, sharePct: 22 }, { country: 'Benin', flag: '🇧🇯', totalUsd: 1_200_000_000, sharePct: 14 }, { country: 'South Africa', flag: '🇿🇦', totalUsd: 980_000_000, sharePct: 12 }, { country: 'Cameroon', flag: '🇨🇲', totalUsd: 720_000_000, sharePct: 9 }] },
    agoa: { status: 'eligible', statusNote: 'Eligible per USTR 2024 beneficiary list. Non-petroleum exports (agriculture, cashew, textiles) utilise AGOA preferences; crude oil excluded.', currentExportsUsd: 410_000_000, potentialExportsUsd: 2_400_000_000, eligibleCategories: 6500 } },

  // ── KEN ────────────────────────────────────────────────────────────────
  { iso3: 'KEN', label: 'Kenya', asOfYear: 2024,
    totalTradeUsd: 28_400_000_000, exportsUsd: 8_900_000_000, importsUsd: 19_500_000_000,
    exportsToUs: { year: 2024, valueUsd: 680_000_000, yoyPct: 6.8 },
    importsFromUs: { year: 2024, valueUsd: 560_000_000, yoyPct: 4.2 },
    topPartners: [
      { country: 'China', flag: '🇨🇳', exportsUsd: 420_000_000, importsUsd: 4_800_000_000, totalUsd: 5_220_000_000, sharePct: 18 },
      { country: 'United States', flag: '🇺🇸', exportsUsd: 680_000_000, importsUsd: 560_000_000, totalUsd: 1_240_000_000, sharePct: 4, badge: 'AGOA Eligible' },
      { country: 'Uganda', flag: '🇺🇬', exportsUsd: 890_000_000, importsUsd: 280_000_000, totalUsd: 1_170_000_000, sharePct: 4 },
      { country: 'India', flag: '🇮🇳', exportsUsd: 310_000_000, importsUsd: 820_000_000, totalUsd: 1_130_000_000, sharePct: 4 },
      { country: 'United Kingdom', flag: '🇬🇧', exportsUsd: 520_000_000, importsUsd: 480_000_000, totalUsd: 1_000_000_000, sharePct: 4 },
    ],
    exportComposition: [{ sector: 'Horticulture & Floriculture', sharePct: 32 }, { sector: 'Tea, Coffee & Agriculture', sharePct: 22 }, { sector: 'Apparel & Manufacturing (EPZ)', sharePct: 20 }, { sector: 'Minerals', sharePct: 12 }, { sector: 'Services & Logistics', sharePct: 14 }],
    importComposition: [{ sector: 'Machinery & Capital Goods', sharePct: 32 }, { sector: 'Fuel & Petroleum', sharePct: 18 }, { sector: 'Food & Agriculture Inputs', sharePct: 14 }, { sector: 'Transport Equipment', sharePct: 20 }, { sector: 'Chemicals & Fertilizers', sharePct: 16 }],
    intraRegional: { primaryVolumeUsd: 4_600_000_000, secondaryVolumeUsd: 3_200_000_000, topPartners: [{ country: 'Uganda', flag: '🇺🇬', totalUsd: 1_170_000_000, sharePct: 15 }, { country: 'Tanzania', flag: '🇹🇿', totalUsd: 980_000_000, sharePct: 12 }, { country: 'Rwanda', flag: '🇷🇼', totalUsd: 620_000_000, sharePct: 8 }, { country: 'South Sudan', flag: '🇸🇸', totalUsd: 480_000_000, sharePct: 6 }] },
    agoa: { status: 'eligible', statusNote: 'Kenya is AGOA-eligible. Duty-free U.S. market access for apparel (EPZ), horticulture, tea, coffee, nuts, and specialty agriculture.', currentExportsUsd: 520_000_000, potentialExportsUsd: 850_000_000, eligibleCategories: 6500 } },

  // ── JAM ────────────────────────────────────────────────────────────────
  { iso3: 'JAM', label: 'Jamaica', asOfYear: 2024,
    totalTradeUsd: 12_400_000_000, exportsUsd: 5_800_000_000, importsUsd: 6_600_000_000,
    exportsToUs: { year: 2024, valueUsd: 1_200_000_000, yoyPct: 4.5 },
    importsFromUs: { year: 2024, valueUsd: 2_100_000_000, yoyPct: 3.2 },
    topPartners: [
      { country: 'United States', flag: '🇺🇸', exportsUsd: 1_200_000_000, importsUsd: 2_100_000_000, totalUsd: 3_300_000_000, sharePct: 27, badge: 'CBI Eligible' },
      { country: 'China', flag: '🇨🇳', exportsUsd: 180_000_000, importsUsd: 1_400_000_000, totalUsd: 1_580_000_000, sharePct: 13 },
      { country: 'Trinidad & Tobago', flag: '🇹🇹', exportsUsd: 420_000_000, importsUsd: 890_000_000, totalUsd: 1_310_000_000, sharePct: 11 },
      { country: 'Canada', flag: '🇨🇦', exportsUsd: 380_000_000, importsUsd: 520_000_000, totalUsd: 900_000_000, sharePct: 7 },
      { country: 'United Kingdom', flag: '🇬🇧', exportsUsd: 290_000_000, importsUsd: 410_000_000, totalUsd: 700_000_000, sharePct: 6 },
    ],
    exportComposition: [{ sector: 'Tourism & Services', sharePct: 36 }, { sector: 'Bauxite & Mining', sharePct: 28 }, { sector: 'Agriculture', sharePct: 18 }, { sector: 'Manufacturing', sharePct: 12 }, { sector: 'Transport & Logistics', sharePct: 6 }],
    importComposition: [{ sector: 'Machinery & Equipment', sharePct: 24 }, { sector: 'Fuel & Energy', sharePct: 20 }, { sector: 'Food & Beverages', sharePct: 22 }, { sector: 'Transport & Vehicles', sharePct: 18 }, { sector: 'Chemicals & Plastics', sharePct: 16 }],
    intraRegional: { primaryVolumeUsd: 2_100_000_000, secondaryVolumeUsd: 780_000_000, topPartners: [{ country: 'Trinidad & Tobago', flag: '🇹🇹', totalUsd: 1_310_000_000, sharePct: 28 }, { country: 'Haiti', flag: '🇭🇹', totalUsd: 420_000_000, sharePct: 9 }, { country: 'Barbados', flag: '🇧🇧', totalUsd: 380_000_000, sharePct: 8 }, { country: 'Dominican Republic', flag: '🇩🇴', totalUsd: 340_000_000, sharePct: 7 }] },
    agoa: { status: 'eligible', statusNote: 'Jamaica is CARICOM/CBI-eligible for preferential U.S. market access.', currentExportsUsd: 890_000_000, potentialExportsUsd: 1_200_000_000, eligibleCategories: 4200 } },

  // ── GHA ────────────────────────────────────────────────────────────────
  { iso3: 'GHA', label: 'Ghana', asOfYear: 2024,
    totalTradeUsd: 38_200_000_000, exportsUsd: 17_800_000_000, importsUsd: 20_400_000_000,
    exportsToUs: { year: 2024, valueUsd: 1_420_000_000, yoyPct: 5.4 },
    importsFromUs: { year: 2024, valueUsd: 980_000_000, yoyPct: 3.8 },
    topPartners: [
      { country: 'China', flag: '🇨🇳', exportsUsd: 2_100_000_000, importsUsd: 6_800_000_000, totalUsd: 8_900_000_000, sharePct: 23 },
      { country: 'United States', flag: '🇺🇸', exportsUsd: 1_420_000_000, importsUsd: 980_000_000, totalUsd: 2_400_000_000, sharePct: 6, badge: 'AGOA Eligible' },
      { country: 'India', flag: '🇮🇳', exportsUsd: 680_000_000, importsUsd: 1_200_000_000, totalUsd: 1_880_000_000, sharePct: 5 },
      { country: 'United Kingdom', flag: '🇬🇧', exportsUsd: 920_000_000, importsUsd: 640_000_000, totalUsd: 1_560_000_000, sharePct: 4 },
      { country: 'Netherlands', flag: '🇳🇱', exportsUsd: 1_100_000_000, importsUsd: 380_000_000, totalUsd: 1_480_000_000, sharePct: 4 },
    ],
    exportComposition: [{ sector: 'Gold & Minerals', sharePct: 38 }, { sector: 'Cocoa & Agriculture', sharePct: 28 }, { sector: 'Oil & Gas', sharePct: 18 }, { sector: 'Manufacturing', sharePct: 10 }, { sector: 'Services & Logistics', sharePct: 6 }],
    importComposition: [{ sector: 'Machinery & Equipment', sharePct: 26 }, { sector: 'Fuel & Petroleum', sharePct: 20 }, { sector: 'Food & Consumer Goods', sharePct: 18 }, { sector: 'Chemicals & Plastics', sharePct: 18 }, { sector: 'Transport Equipment', sharePct: 18 }],
    intraRegional: { primaryVolumeUsd: 4_200_000_000, secondaryVolumeUsd: 2_800_000_000, topPartners: [{ country: "Côte d'Ivoire", flag: '🇨🇮', totalUsd: 980_000_000, sharePct: 14 }, { country: 'Nigeria', flag: '🇳🇬', totalUsd: 820_000_000, sharePct: 12 }, { country: 'Burkina Faso', flag: '🇧🇫', totalUsd: 540_000_000, sharePct: 8 }, { country: 'Togo', flag: '🇹🇬', totalUsd: 420_000_000, sharePct: 6 }] },
    agoa: { status: 'eligible', statusNote: "Ghana is AGOA-eligible. Duty-free U.S. access for cocoa products, cashews, apparel, and processed agriculture.", currentExportsUsd: 890_000_000, potentialExportsUsd: 1_350_000_000, eligibleCategories: 6500 } },

  // ── ZAF ────────────────────────────────────────────────────────────────
  { iso3: 'ZAF', label: 'South Africa', asOfYear: 2024,
    totalTradeUsd: 198_000_000_000, exportsUsd: 108_000_000_000, importsUsd: 90_000_000_000,
    exportsToUs: { year: 2024, valueUsd: 9_800_000_000, yoyPct: 2.1 },
    importsFromUs: { year: 2024, valueUsd: 6_200_000_000, yoyPct: 1.8 },
    topPartners: [
      { country: 'China', flag: '🇨🇳', exportsUsd: 18_400_000_000, importsUsd: 28_600_000_000, totalUsd: 47_000_000_000, sharePct: 24 },
      { country: 'United States', flag: '🇺🇸', exportsUsd: 9_800_000_000, importsUsd: 6_200_000_000, totalUsd: 16_000_000_000, sharePct: 8, badge: 'AGOA Eligible' },
      { country: 'Germany', flag: '🇩🇪', exportsUsd: 8_200_000_000, importsUsd: 7_400_000_000, totalUsd: 15_600_000_000, sharePct: 8 },
      { country: 'India', flag: '🇮🇳', exportsUsd: 4_600_000_000, importsUsd: 5_800_000_000, totalUsd: 10_400_000_000, sharePct: 5 },
      { country: 'Japan', flag: '🇯🇵', exportsUsd: 3_900_000_000, importsUsd: 4_200_000_000, totalUsd: 8_100_000_000, sharePct: 4 },
    ],
    exportComposition: [{ sector: 'Mining & Metals', sharePct: 42 }, { sector: 'Manufacturing & Automotive', sharePct: 28 }, { sector: 'Agriculture & Food', sharePct: 12 }, { sector: 'Financial Services', sharePct: 10 }, { sector: 'Tourism & Logistics', sharePct: 8 }],
    importComposition: [{ sector: 'Machinery & Capital Goods', sharePct: 30 }, { sector: 'Fuel & Petroleum', sharePct: 18 }, { sector: 'Chemicals & Plastics', sharePct: 16 }, { sector: 'Transport Equipment', sharePct: 20 }, { sector: 'Electronics & Components', sharePct: 16 }],
    intraRegional: { primaryVolumeUsd: 28_000_000_000, secondaryVolumeUsd: 14_000_000_000, topPartners: [{ country: 'Botswana', flag: '🇧🇼', totalUsd: 4_200_000_000, sharePct: 10 }, { country: 'Namibia', flag: '🇳🇦', totalUsd: 3_800_000_000, sharePct: 9 }, { country: 'Mozambique', flag: '🇲🇿', totalUsd: 2_600_000_000, sharePct: 6 }, { country: 'Zimbabwe', flag: '🇿🇼', totalUsd: 2_100_000_000, sharePct: 5 }] },
    agoa: { status: 'eligible', statusNote: 'South Africa is AGOA-eligible. Automotive components, agriculture, and manufactured goods access duty-free U.S. market.', currentExportsUsd: 4_200_000_000, potentialExportsUsd: 5_800_000_000, eligibleCategories: 6500 } },

  // ── ETH ────────────────────────────────────────────────────────────────
  { iso3: 'ETH', label: 'Ethiopia', asOfYear: 2024,
    totalTradeUsd: 22_400_000_000, exportsUsd: 4_800_000_000, importsUsd: 17_600_000_000,
    exportsToUs: { year: 2024, valueUsd: 280_000_000, yoyPct: -12.4 },
    importsFromUs: { year: 2024, valueUsd: 420_000_000, yoyPct: 2.6 },
    topPartners: [
      { country: 'China', flag: '🇨🇳', exportsUsd: 420_000_000, importsUsd: 4_800_000_000, totalUsd: 5_220_000_000, sharePct: 23 },
      { country: 'United Arab Emirates', flag: '🇦🇪', exportsUsd: 680_000_000, importsUsd: 2_400_000_000, totalUsd: 3_080_000_000, sharePct: 14 },
      { country: 'India', flag: '🇮🇳', exportsUsd: 320_000_000, importsUsd: 1_800_000_000, totalUsd: 2_120_000_000, sharePct: 9 },
      { country: 'United States', flag: '🇺🇸', exportsUsd: 280_000_000, importsUsd: 420_000_000, totalUsd: 700_000_000, sharePct: 3, badge: 'AGOA Suspended' },
      { country: 'Saudi Arabia', flag: '🇸🇦', exportsUsd: 180_000_000, importsUsd: 480_000_000, totalUsd: 660_000_000, sharePct: 3 },
    ],
    exportComposition: [{ sector: 'Coffee & Agriculture', sharePct: 45 }, { sector: 'Textiles & Apparel (EPZ)', sharePct: 28 }, { sector: 'Livestock & Leather', sharePct: 15 }, { sector: 'Manufacturing', sharePct: 8 }, { sector: 'Services & Other', sharePct: 4 }],
    importComposition: [{ sector: 'Machinery & Capital Goods', sharePct: 34 }, { sector: 'Fuel & Petroleum', sharePct: 22 }, { sector: 'Food & Agriculture Inputs', sharePct: 16 }, { sector: 'Chemicals & Fertilizers', sharePct: 14 }, { sector: 'Transport Equipment', sharePct: 14 }],
    intraRegional: { primaryVolumeUsd: 1_800_000_000, secondaryVolumeUsd: 980_000_000, topPartners: [{ country: 'Djibouti', flag: '🇩🇯', totalUsd: 620_000_000, sharePct: 22 }, { country: 'Kenya', flag: '🇰🇪', totalUsd: 380_000_000, sharePct: 13 }, { country: 'Sudan', flag: '🇸🇩', totalUsd: 240_000_000, sharePct: 8 }, { country: 'Somalia', flag: '🇸🇴', totalUsd: 180_000_000, sharePct: 6 }] },
    agoa: { status: 'suspended', statusNote: 'Ethiopia is currently suspended from AGOA eligibility. Restoration would unlock duty-free U.S. access for coffee, textiles, and leather exports.', currentExportsUsd: 0, potentialExportsUsd: 680_000_000, eligibleCategories: 6500 } },

  // ── SEN ────────────────────────────────────────────────────────────────
  { iso3: 'SEN', label: 'Senegal', asOfYear: 2024,
    totalTradeUsd: 18_600_000_000, exportsUsd: 7_200_000_000, importsUsd: 11_400_000_000,
    exportsToUs: { year: 2024, valueUsd: 180_000_000, yoyPct: 4.2 },
    importsFromUs: { year: 2024, valueUsd: 320_000_000, yoyPct: 3.1 },
    topPartners: [
      { country: 'France', flag: '🇫🇷', exportsUsd: 1_400_000_000, importsUsd: 2_800_000_000, totalUsd: 4_200_000_000, sharePct: 23 },
      { country: 'China', flag: '🇨🇳', exportsUsd: 420_000_000, importsUsd: 2_200_000_000, totalUsd: 2_620_000_000, sharePct: 14 },
      { country: 'India', flag: '🇮🇳', exportsUsd: 280_000_000, importsUsd: 980_000_000, totalUsd: 1_260_000_000, sharePct: 7 },
      { country: 'United States', flag: '🇺🇸', exportsUsd: 180_000_000, importsUsd: 320_000_000, totalUsd: 500_000_000, sharePct: 3, badge: 'AGOA Eligible' },
      { country: 'Mali', flag: '🇲🇱', exportsUsd: 520_000_000, importsUsd: 180_000_000, totalUsd: 700_000_000, sharePct: 4 },
    ],
    exportComposition: [{ sector: 'Phosphate & Mining', sharePct: 32 }, { sector: 'Fisheries & Agriculture', sharePct: 28 }, { sector: 'Petroleum Products', sharePct: 22 }, { sector: 'Manufacturing & Other', sharePct: 18 }],
    importComposition: [{ sector: 'Machinery & Equipment', sharePct: 28 }, { sector: 'Fuel & Petroleum', sharePct: 24 }, { sector: 'Food & Consumer Goods', sharePct: 20 }, { sector: 'Chemicals', sharePct: 14 }, { sector: 'Transport Equipment', sharePct: 14 }],
    intraRegional: { primaryVolumeUsd: 3_400_000_000, secondaryVolumeUsd: 2_100_000_000, topPartners: [{ country: 'Mali', flag: '🇲🇱', totalUsd: 700_000_000, sharePct: 13 }, { country: "Côte d'Ivoire", flag: '🇨🇮', totalUsd: 580_000_000, sharePct: 11 }, { country: 'Guinea', flag: '🇬🇳', totalUsd: 420_000_000, sharePct: 8 }, { country: 'Mauritania', flag: '🇲🇷', totalUsd: 340_000_000, sharePct: 6 }] },
    agoa: { status: 'eligible', statusNote: 'Senegal is AGOA-eligible. Duty-free U.S. market access for fisheries, groundnuts, phosphate derivatives, and emerging manufacturing.', currentExportsUsd: 120_000_000, potentialExportsUsd: 280_000_000, eligibleCategories: 6500 } },

  // ── CIV ────────────────────────────────────────────────────────────────
  { iso3: 'CIV', label: "Côte d'Ivoire", asOfYear: 2024,
    totalTradeUsd: 42_800_000_000, exportsUsd: 18_400_000_000, importsUsd: 24_400_000_000,
    exportsToUs: { year: 2024, valueUsd: 980_000_000, yoyPct: 6.2 },
    importsFromUs: { year: 2024, valueUsd: 640_000_000, yoyPct: 4.5 },
    topPartners: [
      { country: 'China', flag: '🇨🇳', exportsUsd: 1_800_000_000, importsUsd: 4_200_000_000, totalUsd: 6_000_000_000, sharePct: 14 },
      { country: 'France', flag: '🇫🇷', exportsUsd: 2_400_000_000, importsUsd: 2_800_000_000, totalUsd: 5_200_000_000, sharePct: 12 },
      { country: 'Netherlands', flag: '🇳🇱', exportsUsd: 2_100_000_000, importsUsd: 680_000_000, totalUsd: 2_780_000_000, sharePct: 6 },
      { country: 'United States', flag: '🇺🇸', exportsUsd: 980_000_000, importsUsd: 640_000_000, totalUsd: 1_620_000_000, sharePct: 4, badge: 'AGOA Eligible' },
      { country: 'Nigeria', flag: '🇳🇬', exportsUsd: 720_000_000, importsUsd: 580_000_000, totalUsd: 1_300_000_000, sharePct: 3 },
    ],
    exportComposition: [{ sector: 'Cocoa & Agriculture', sharePct: 48 }, { sector: 'Petroleum & Energy', sharePct: 22 }, { sector: 'Rubber & Cashew', sharePct: 16 }, { sector: 'Manufacturing', sharePct: 10 }, { sector: 'Services & Logistics', sharePct: 4 }],
    importComposition: [{ sector: 'Machinery & Capital Goods', sharePct: 26 }, { sector: 'Fuel & Petroleum', sharePct: 20 }, { sector: 'Food & Consumer Goods', sharePct: 18 }, { sector: 'Chemicals & Plastics', sharePct: 18 }, { sector: 'Transport Equipment', sharePct: 18 }],
    intraRegional: { primaryVolumeUsd: 6_800_000_000, secondaryVolumeUsd: 4_200_000_000, topPartners: [{ country: 'Burkina Faso', flag: '🇧🇫', totalUsd: 1_400_000_000, sharePct: 13 }, { country: 'Mali', flag: '🇲🇱', totalUsd: 980_000_000, sharePct: 9 }, { country: 'Ghana', flag: '🇬🇭', totalUsd: 980_000_000, sharePct: 9 }, { country: 'Guinea', flag: '🇬🇳', totalUsd: 620_000_000, sharePct: 6 }] },
    agoa: { status: 'eligible', statusNote: "Côte d'Ivoire is AGOA-eligible. Duty-free U.S. access for cocoa derivatives, cashews, rubber, and processed agriculture.", currentExportsUsd: 620_000_000, potentialExportsUsd: 980_000_000, eligibleCategories: 6500 } },

  // ── TZA ────────────────────────────────────────────────────────────────
  { iso3: 'TZA', label: 'Tanzania', asOfYear: 2024,
    totalTradeUsd: 24_600_000_000, exportsUsd: 8_400_000_000, importsUsd: 16_200_000_000,
    exportsToUs: { year: 2024, valueUsd: 420_000_000, yoyPct: 7.8 },
    importsFromUs: { year: 2024, valueUsd: 380_000_000, yoyPct: 5.2 },
    topPartners: [
      { country: 'China', flag: '🇨🇳', exportsUsd: 680_000_000, importsUsd: 4_800_000_000, totalUsd: 5_480_000_000, sharePct: 22 },
      { country: 'India', flag: '🇮🇳', exportsUsd: 820_000_000, importsUsd: 2_400_000_000, totalUsd: 3_220_000_000, sharePct: 13 },
      { country: 'United Arab Emirates', flag: '🇦🇪', exportsUsd: 540_000_000, importsUsd: 1_600_000_000, totalUsd: 2_140_000_000, sharePct: 9 },
      { country: 'Kenya', flag: '🇰🇪', exportsUsd: 520_000_000, importsUsd: 460_000_000, totalUsd: 980_000_000, sharePct: 4 },
      { country: 'United States', flag: '🇺🇸', exportsUsd: 420_000_000, importsUsd: 380_000_000, totalUsd: 800_000_000, sharePct: 3, badge: 'AGOA Eligible' },
    ],
    exportComposition: [{ sector: 'Gold & Mining', sharePct: 35 }, { sector: 'Agriculture & Horticulture', sharePct: 28 }, { sector: 'Apparel & Textiles (EPZ)', sharePct: 18 }, { sector: 'Tourism Services', sharePct: 11 }, { sector: 'Logistics & Other', sharePct: 8 }],
    importComposition: [{ sector: 'Machinery & Equipment', sharePct: 30 }, { sector: 'Fuel & Petroleum', sharePct: 20 }, { sector: 'Food & Agriculture Inputs', sharePct: 16 }, { sector: 'Transport Equipment', sharePct: 18 }, { sector: 'Chemicals & Fertilizers', sharePct: 16 }],
    intraRegional: { primaryVolumeUsd: 4_800_000_000, secondaryVolumeUsd: 3_200_000_000, topPartners: [{ country: 'Kenya', flag: '🇰🇪', totalUsd: 980_000_000, sharePct: 12 }, { country: 'Uganda', flag: '🇺🇬', totalUsd: 720_000_000, sharePct: 9 }, { country: 'Rwanda', flag: '🇷🇼', totalUsd: 480_000_000, sharePct: 6 }, { country: 'Zambia', flag: '🇿🇲', totalUsd: 380_000_000, sharePct: 5 }] },
    agoa: { status: 'eligible', statusNote: 'Tanzania is AGOA-eligible. Duty-free U.S. access for apparel (EPZ), cashews, coffee, and horticulture.', currentExportsUsd: 280_000_000, potentialExportsUsd: 520_000_000, eligibleCategories: 6500 } },

  // ── TTO ────────────────────────────────────────────────────────────────
  { iso3: 'TTO', label: 'Trinidad & Tobago', asOfYear: 2024,
    totalTradeUsd: 18_200_000_000, exportsUsd: 9_400_000_000, importsUsd: 8_800_000_000,
    exportsToUs: { year: 2024, valueUsd: 2_100_000_000, yoyPct: 3.8 },
    importsFromUs: { year: 2024, valueUsd: 1_850_000_000, yoyPct: 2.9 },
    topPartners: [
      { country: 'United States', flag: '🇺🇸', exportsUsd: 2_100_000_000, importsUsd: 1_850_000_000, totalUsd: 3_950_000_000, sharePct: 22, badge: 'CBI Eligible' },
      { country: 'China', flag: '🇨🇳', exportsUsd: 120_000_000, importsUsd: 1_200_000_000, totalUsd: 1_320_000_000, sharePct: 7 },
      { country: 'Jamaica', flag: '🇯🇲', exportsUsd: 890_000_000, importsUsd: 420_000_000, totalUsd: 1_310_000_000, sharePct: 7 },
      { country: 'Guyana', flag: '🇬🇾', exportsUsd: 780_000_000, importsUsd: 310_000_000, totalUsd: 1_090_000_000, sharePct: 6 },
      { country: 'Barbados', flag: '🇧🇧', exportsUsd: 410_000_000, importsUsd: 280_000_000, totalUsd: 690_000_000, sharePct: 4 },
    ],
    exportComposition: [{ sector: 'Energy & Petrochemicals', sharePct: 48 }, { sector: 'Manufacturing', sharePct: 22 }, { sector: 'Services & Logistics', sharePct: 18 }, { sector: 'Agriculture & Food', sharePct: 10 }, { sector: 'Maritime & Shipping', sharePct: 2 }],
    importComposition: [{ sector: 'Machinery & Industrial Equipment', sharePct: 28 }, { sector: 'Food & Consumer Goods', sharePct: 22 }, { sector: 'Transport Equipment', sharePct: 20 }, { sector: 'Chemicals & Plastics', sharePct: 18 }, { sector: 'Electronics & Components', sharePct: 12 }],
    intraRegional: { primaryVolumeUsd: 3_200_000_000, secondaryVolumeUsd: 1_100_000_000, topPartners: [{ country: 'Jamaica', flag: '🇯🇲', totalUsd: 1_310_000_000, sharePct: 24 }, { country: 'Guyana', flag: '🇬🇾', totalUsd: 1_090_000_000, sharePct: 20 }, { country: 'Barbados', flag: '🇧🇧', totalUsd: 690_000_000, sharePct: 13 }, { country: 'Dominican Republic', flag: '🇩🇴', totalUsd: 520_000_000, sharePct: 10 }] },
    agoa: { status: 'eligible', statusNote: 'Trinidad & Tobago is CARICOM/CBI-eligible for preferential U.S. market access on qualifying exports.', currentExportsUsd: 1_420_000_000, potentialExportsUsd: 1_850_000_000, eligibleCategories: 3800 } },

  // ── BRB ────────────────────────────────────────────────────────────────
  { iso3: 'BRB', label: 'Barbados', asOfYear: 2024,
    totalTradeUsd: 4_800_000_000, exportsUsd: 1_900_000_000, importsUsd: 2_900_000_000,
    exportsToUs: { year: 2024, valueUsd: 420_000_000, yoyPct: 4.2 },
    importsFromUs: { year: 2024, valueUsd: 680_000_000, yoyPct: 3.1 },
    topPartners: [
      { country: 'United States', flag: '🇺🇸', exportsUsd: 420_000_000, importsUsd: 680_000_000, totalUsd: 1_100_000_000, sharePct: 23, badge: 'CBI Eligible' },
      { country: 'Trinidad & Tobago', flag: '🇹🇹', exportsUsd: 280_000_000, importsUsd: 410_000_000, totalUsd: 690_000_000, sharePct: 14 },
      { country: 'United Kingdom', flag: '🇬🇧', exportsUsd: 310_000_000, importsUsd: 220_000_000, totalUsd: 530_000_000, sharePct: 11 },
      { country: 'China', flag: '🇨🇳', exportsUsd: 45_000_000, importsUsd: 380_000_000, totalUsd: 425_000_000, sharePct: 9 },
      { country: 'Jamaica', flag: '🇯🇲', exportsUsd: 190_000_000, importsUsd: 210_000_000, totalUsd: 400_000_000, sharePct: 8 },
    ],
    exportComposition: [{ sector: 'Tourism & Services', sharePct: 52 }, { sector: 'Financial Services', sharePct: 18 }, { sector: 'Agriculture & Rum', sharePct: 15 }, { sector: 'Light Manufacturing', sharePct: 13 }, { sector: 'Real Estate & Construction', sharePct: 2 }],
    importComposition: [{ sector: 'Machinery & Equipment', sharePct: 22 }, { sector: 'Food & Beverages', sharePct: 24 }, { sector: 'Fuel & Energy', sharePct: 18 }, { sector: 'Transport & Vehicles', sharePct: 20 }, { sector: 'Consumer Goods', sharePct: 16 }],
    intraRegional: { primaryVolumeUsd: 1_450_000_000, secondaryVolumeUsd: 520_000_000, topPartners: [{ country: 'Trinidad & Tobago', flag: '🇹🇹', totalUsd: 690_000_000, sharePct: 30 }, { country: 'Jamaica', flag: '🇯🇲', totalUsd: 400_000_000, sharePct: 17 }, { country: 'St. Lucia', flag: '🇱🇨', totalUsd: 280_000_000, sharePct: 12 }, { country: 'Grenada', flag: '🇬🇩', totalUsd: 210_000_000, sharePct: 9 }] },
    agoa: { status: 'eligible', statusNote: 'Barbados enjoys CBI/CARICOM preferential U.S. access for eligible goods and services exports.', currentExportsUsd: 380_000_000, potentialExportsUsd: 520_000_000, eligibleCategories: 3200 } },

  // ── BHS ────────────────────────────────────────────────────────────────
  { iso3: 'BHS', label: 'Bahamas', asOfYear: 2024,
    totalTradeUsd: 6_200_000_000, exportsUsd: 1_200_000_000, importsUsd: 5_000_000_000,
    exportsToUs: { year: 2024, valueUsd: 890_000_000, yoyPct: 5.1 },
    importsFromUs: { year: 2024, valueUsd: 2_400_000_000, yoyPct: 4.4 },
    topPartners: [
      { country: 'United States', flag: '🇺🇸', exportsUsd: 890_000_000, importsUsd: 2_400_000_000, totalUsd: 3_290_000_000, sharePct: 53, badge: 'CBI Eligible' },
      { country: 'China', flag: '🇨🇳', exportsUsd: 28_000_000, importsUsd: 420_000_000, totalUsd: 448_000_000, sharePct: 7 },
      { country: 'Canada', flag: '🇨🇦', exportsUsd: 95_000_000, importsUsd: 310_000_000, totalUsd: 405_000_000, sharePct: 7 },
      { country: 'United Kingdom', flag: '🇬🇧', exportsUsd: 72_000_000, importsUsd: 180_000_000, totalUsd: 252_000_000, sharePct: 4 },
      { country: 'Dominican Republic', flag: '🇩🇴', exportsUsd: 48_000_000, importsUsd: 165_000_000, totalUsd: 213_000_000, sharePct: 3 },
    ],
    exportComposition: [{ sector: 'Tourism & Hospitality', sharePct: 58 }, { sector: 'Financial Services', sharePct: 22 }, { sector: 'Maritime & Logistics', sharePct: 12 }, { sector: 'Agriculture & Fisheries', sharePct: 6 }, { sector: 'Construction & Real Estate', sharePct: 2 }],
    importComposition: [{ sector: 'Machinery & Equipment', sharePct: 20 }, { sector: 'Food & Beverages', sharePct: 26 }, { sector: 'Transport & Vehicles', sharePct: 22 }, { sector: 'Fuel & Energy', sharePct: 16 }, { sector: 'Consumer & Retail Goods', sharePct: 16 }],
    intraRegional: { primaryVolumeUsd: 680_000_000, secondaryVolumeUsd: 240_000_000, topPartners: [{ country: 'Jamaica', flag: '🇯🇲', totalUsd: 220_000_000, sharePct: 24 }, { country: 'Dominican Republic', flag: '🇩🇴', totalUsd: 213_000_000, sharePct: 23 }, { country: 'Trinidad & Tobago', flag: '🇹🇹', totalUsd: 185_000_000, sharePct: 20 }, { country: 'Barbados', flag: '🇧🇧', totalUsd: 142_000_000, sharePct: 15 }] },
    agoa: { status: 'eligible', statusNote: 'The Bahamas is CBI-eligible for preferential U.S. market access on qualifying exports.', currentExportsUsd: 720_000_000, potentialExportsUsd: 950_000_000, eligibleCategories: 2900 } },
];

// ── Helper functions ──────────────────────────────────────────────────────

function mapPartners(partners: TradePartner[]) {
  return partners.map((p) => ({
    country: p.country, flag: p.flag ?? null,
    exports_usd: p.exportsUsd ?? null, imports_usd: p.importsUsd ?? null,
    total_usd: p.totalUsd, share_pct: p.sharePct, badge: p.badge ?? null,
  }));
}

function mapComposition(sectors: SectorShare[]) {
  return sectors.map((s) => ({ sector: s.sector, share_pct: s.sharePct }));
}

/** Store aggregate totals as JSON _meta prefix in trade_summary_md.
 *  Parsed by the country API until alter-trade-snapshots-add-columns is applied. */
function buildSummaryMd(d: TradeRecord): string {
  const meta = {
    total_trade_usd: d.totalTradeUsd,
    exports_usd: d.exportsUsd,
    imports_usd: d.importsUsd,
    exports_to_us_usd: d.exportsToUs.valueUsd,
    exports_to_us_yoy_pct: d.exportsToUs.yoyPct,
    imports_from_us_usd: d.importsFromUs.valueUsd,
    imports_from_us_yoy_pct: d.importsFromUs.yoyPct,
    intra_africa_usd: d.intraAfrican?.afcftaTradeUsd ?? null,
    intra_ecowas_usd: d.intraAfrican?.ecowasTradeUsd ?? null,
    intra_regional_primary_usd: d.intraRegional?.primaryVolumeUsd ?? null,
    agoa_current_exports_usd: d.agoa.currentExportsUsd,
    agoa_potential_exports_usd: d.agoa.potentialExportsUsd,
    agoa_eligible_categories: d.agoa.eligibleCategories,
  };
  const agoaLine = d.agoa.status === 'eligible'
    ? `${d.label} is AGOA-eligible with duty-free U.S. market access.`
    : d.agoa.status === 'suspended'
    ? `${d.label} is currently suspended from AGOA preferential access.`
    : '';
  const narrative = [`**${d.label}** (${d.iso3}) trade snapshot as of ${d.asOfYear}.`, agoaLine, d.agoa.statusNote].filter(Boolean).join(' ');
  return `{"_meta":${JSON.stringify(meta)}}\n${narrative}`;
}

// ── Ingestion runner ──────────────────────────────────────────────────────

export async function ingestStaticTradeMigration(): Promise<void> {
  console.log('\n[static-trade-migration] Upserting 12 trade snapshots → souvera_country_trade_snapshots...\n');

  const supabase = getSupabaseServiceClient();
  const { jobId, sourceId } = await createIngestionJob('un_comtrade', 'static_trade_migration');
  const start = Date.now();
  let upserted = 0;
  let failed = 0;

  const { data: countries, error: cErr } = await supabase
    .from('souvera_countries').select('id, iso3').in('iso3', TRADE_RECORDS.map((r) => r.iso3));
  if (cErr) throw new Error(`Country lookup failed: ${cErr.message}`);
  const countryMap = new Map((countries ?? []).map((c) => [c.iso3, c.id]));

  for (const d of TRADE_RECORDS) {
    const countryId = countryMap.get(d.iso3);
    if (!countryId) { console.warn(`  ⚠  ${d.iso3} not found — skipping`); failed++; continue; }

    const { error } = await supabase.from('souvera_country_trade_snapshots').upsert({
      country_id: countryId,
      year: d.asOfYear,
      top_trade_partners: mapPartners(d.topPartners),
      top_exports: mapComposition(d.exportComposition),
      top_imports: mapComposition(d.importComposition),
      trade_summary_md: buildSummaryMd(d),
      source_id: sourceId,
      generated_at: new Date().toISOString(),
    }, { onConflict: 'country_id,year' });

    if (error) { console.error(`  ✗  ${d.iso3}: ${error.message}`); failed++; }
    else { console.log(`  ✓  ${d.iso3} — ${d.label}`); upserted++; }
  }

  const elapsed = Date.now() - start;
  console.log(`\n  Summary: ${upserted} upserted, ${failed} failed — ${elapsed}ms`);
  const status = failed === 0 ? 'succeeded' : upserted > 0 ? 'partial' : 'failed';
  await closeIngestionJob(jobId, status, upserted, failed, failed > 0 ? `${failed} record(s) failed` : undefined);
  if (failed > 0) throw new Error(`${failed} record(s) failed`);
  console.log('\n[static-trade-migration] Done.\n');
}
