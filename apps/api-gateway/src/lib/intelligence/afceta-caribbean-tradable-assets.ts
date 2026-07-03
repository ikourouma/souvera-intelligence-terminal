/**
 * Caribbean export portfolio — tradable goods & services beyond generic categories.
 */

import type { CaribbeanAssetClass } from '@/lib/intelligence/afceta-types';
import {
  buildExportProductTiers,
  type AfcetaExportProductTier,
} from '@/lib/intelligence/afceta-export-product-tiers';

export interface CaribbeanAssetProfile {
  assetClass: CaribbeanAssetClass;
  title: string;
  description: string;
  examples: string[];
  categoryGroups: string[];
  sdmSectors: string[];
  spotlightMarkets: string[];
}

export const CARIBBEAN_TRADABLE_PORTFOLIO: CaribbeanAssetProfile[] = [
  {
    assetClass: 'hydrocarbons',
    title: 'Hydrocarbons',
    description: 'Crude oil, natural gas, LNG, and petrochemicals.',
    examples: ['Crude oil', 'Natural gas', 'LNG', 'Petrochemicals'],
    categoryGroups: ['petroleum', 'chemicals'],
    sdmSectors: ['energy_power'],
    spotlightMarkets: ['TTO', 'GUY', 'TTO', 'JAM'],
  },
  {
    assetClass: 'agri_food',
    title: 'Agri-Food',
    description: 'Sugar, rum, tropical fruits, cocoa, tobacco, and processed foods.',
    examples: ['Sugar', 'Rum', 'Tropical fruits', 'Cocoa', 'Tobacco'],
    categoryGroups: ['agriculture'],
    sdmSectors: ['agriculture_food'],
    spotlightMarkets: ['JAM', 'GUY', 'BRB', 'DOM'],
  },
  {
    assetClass: 'minerals',
    title: 'Minerals',
    description: 'Bauxite, gold, alumina, and industrial minerals.',
    examples: ['Bauxite', 'Gold', 'Alumina', 'Industrial minerals'],
    categoryGroups: ['minerals'],
    sdmSectors: ['mining_minerals'],
    spotlightMarkets: ['GUY', 'JAM', 'SUR'],
  },
  {
    assetClass: 'services',
    title: 'Services (Dominant Sector)',
    description: 'Tourism, fintech, logistics, creative industries, and professional services.',
    examples: ['Tourism', 'Fintech', 'Logistics', 'Creative industries'],
    categoryGroups: ['electronics'],
    sdmSectors: ['tourism_hospitality', 'fintech_finance', 'digital_infrastructure', 'logistics_trade'],
    spotlightMarkets: ['KNA', 'BRB', 'JAM', 'CYM'],
  },
];

export const CARIBBEAN_PORTFOLIO_STATEMENT =
  'In a trade and economic agreement, the Caribbean offers a diversified portfolio of goods and services. Key tradable assets include hydrocarbons (crude oil, natural gas), agri-food products (sugar, rum, tropical fruits, cocoa, tobacco), minerals, and a dominant services sector.';

export function caribbeanAssetForCategory(
  categoryGroup: string,
  originIsCaribbean: boolean,
): CaribbeanAssetClass | null {
  if (!originIsCaribbean) return null;
  for (const profile of CARIBBEAN_TRADABLE_PORTFOLIO) {
    if (profile.categoryGroups.includes(categoryGroup)) return profile.assetClass;
  }
  if (['electronics'].includes(categoryGroup)) return 'services';
  return null;
}

export function buildSpotlightProducts(
  originIso: string,
  categoryGroup: string,
  totalUsd: number,
  isCaribbeanOrigin: boolean,
): AfcetaExportProductTier[] {
  return buildExportProductTiers(originIso, categoryGroup, totalUsd, isCaribbeanOrigin);
}
