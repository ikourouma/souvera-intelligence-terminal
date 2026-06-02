/**
 * Nigeria trade intelligence data — single source for API and Trade tab.
 * Sources: UN Comtrade, USTR, Nigerian Bureau of Statistics (2024-2025 estimates).
 *
 * Note: Nigeria was suspended from AGOA in 2015. Figures below reflect
 * restoration opportunity scenarios, not current AGOA utilization.
 */

import type { CountryTrade } from '@/types/country-intelligence';

export const NIGERIA_TRADE: CountryTrade = {
  asOfYear: 2024,
  totalTradeUsd: 62_700_000_000,
  exportsUsd: 38_200_000_000,
  importsUsd: 24_500_000_000,
  exportsToUs: { year: 2024, valueUsd: 4_100_000_000, yoyPct: 8.2 },
  importsFromUs: { year: 2024, valueUsd: 3_800_000_000, yoyPct: 5.1 },
  topPartners: [
    { country: 'China', flag: '🇨🇳', exportsUsd: 12_400_000_000, importsUsd: 8_900_000_000, totalUsd: 21_300_000_000, sharePct: 34 },
    { country: 'United States', flag: '🇺🇸', exportsUsd: 4_100_000_000, importsUsd: 3_800_000_000, totalUsd: 7_900_000_000, sharePct: 13, badge: 'AGOA Restoration' },
    { country: 'European Union', flag: '🇪🇺', exportsUsd: 6_200_000_000, importsUsd: 5_100_000_000, totalUsd: 11_300_000_000, sharePct: 18 },
    { country: 'India', flag: '🇮🇳', exportsUsd: 3_800_000_000, importsUsd: 2_900_000_000, totalUsd: 6_700_000_000, sharePct: 11 },
    { country: 'United Kingdom', flag: '🇬🇧', exportsUsd: 2_100_000_000, importsUsd: 1_800_000_000, totalUsd: 3_900_000_000, sharePct: 6 },
  ],
  exportComposition: [
    { sector: 'Crude Oil & Petroleum', sharePct: 76 },
    { sector: 'Agriculture & Food', sharePct: 11 },
    { sector: 'Manufacturing', sharePct: 7 },
    { sector: 'Solid Minerals & Mining', sharePct: 3 },
    { sector: 'Services & Other', sharePct: 3 },
  ],
  importComposition: [
    { sector: 'Machinery & Capital Goods', sharePct: 28 },
    { sector: 'Refined Petroleum & Energy', sharePct: 22 },
    { sector: 'Food & Consumer Goods', sharePct: 18 },
    { sector: 'Chemicals & Plastics', sharePct: 16 },
    { sector: 'Transport Equipment', sharePct: 16 },
  ],
  intraAfrican: {
    afcftaTradeUsd: 8_400_000_000,
    ecowasTradeUsd: 5_200_000_000,
    topAfricanPartners: [
      { country: 'Ghana', flag: '🇬🇭', totalUsd: 1_800_000_000, sharePct: 22 },
      { country: 'Benin', flag: '🇧🇯', totalUsd: 1_200_000_000, sharePct: 14 },
      { country: 'South Africa', flag: '🇿🇦', totalUsd: 980_000_000, sharePct: 12 },
      { country: 'Cameroon', flag: '🇨🇲', totalUsd: 720_000_000, sharePct: 9 },
    ],
  },
  agoa: {
    status: 'restoration_opportunity',
    statusNote:
      'Nigeria was suspended from AGOA in 2015. Restoration would unlock duty-free access for 6,500+ product categories.',
    currentExportsUsd: 0,
    potentialExportsUsd: 2_400_000_000,
    eligibleCategories: 6500,
  },
};
