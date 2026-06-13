/**
 * Market access framework registry — structural fallback when API vault data is absent.
 * Authoritative status: Evidence Vault via `resolveMarketAccessForCountry`.
 */

import { APPROVED_AFRICA_ISO3, isApprovedCaribbeanMarket } from '@/lib/market-coverage';

export type MarketAccessStatus = 'active' | 'suspended' | 'graduated' | 'ineligible' | 'not_applicable' | 'info';

export interface MarketAccessFramework {
  id: string;
  label: string;
  emoji?: string;
  description: string;
  status: MarketAccessStatus;
  statusLabel?: string;
}

const ECOWAS_ISO3 = new Set([
  'NGA', 'GHA', 'SEN', 'CIV', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR',
  'TGO', 'BEN', 'GMB', 'GNB', 'CPV', 'MRT',
]);

const SADC_ISO3 = new Set([
  'ZAF', 'BWA', 'NAM', 'ZMB', 'ZWE', 'MOZ', 'MWI', 'LSO', 'SWZ', 'AGO',
  'COD', 'TZA', 'MDG', 'MUS', 'SYC', 'COM',
]);

const EAC_ISO3 = new Set(['KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SSD', 'COD']);

const COMESA_ISO3 = new Set([
  'ETH', 'KEN', 'TZA', 'ZMB', 'ZWE', 'MWI', 'UGA', 'RWA', 'BDI', 'MDG', 'MUS', 'SYC', 'COM',
]);

const CARICOM_ISO3 = new Set([
  'ATG', 'BRB', 'BHS', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA',
  'LCA', 'VCT', 'TTO', 'GUY', 'SUR', 'BLZ',
]);

function underReviewAgoa(): { description: string; status: MarketAccessStatus; statusLabel: string } {
  return {
    description: 'AGOA status pending Evidence Vault verification (verify:ustr:agoa).',
    status: 'info',
    statusLabel: 'Under review',
  };
}

function agoaDescription(_iso3: string): { description: string; status: MarketAccessStatus; statusLabel: string } {
  return underReviewAgoa();
}

function africaFrameworks(iso3: string): MarketAccessFramework[] {
  const upper = iso3.toUpperCase();
  const frameworks: MarketAccessFramework[] = [];

  if (APPROVED_AFRICA_ISO3.includes(upper as typeof APPROVED_AFRICA_ISO3[number])) {
    const agoa = agoaDescription(upper);
    frameworks.push({
      id: 'agoa',
      label: 'AGOA',
      emoji: '🇺🇸',
      description: agoa.description,
      status: agoa.status,
      statusLabel: agoa.statusLabel,
    });
  }

  frameworks.push({
    id: 'afcfta',
    label: 'AfCFTA',
    emoji: '🌍',
    description: 'Continental free trade area — status from Evidence Vault (verify:regional).',
    status: 'info',
    statusLabel: 'Under review',
  });

  if (ECOWAS_ISO3.has(upper)) {
    frameworks.push({
      id: 'ecowas',
      label: 'ECOWAS',
      description: 'West African regional market — status from Evidence Vault (verify:regional).',
      status: 'info',
      statusLabel: 'Under review',
    });
  }

  if (SADC_ISO3.has(upper)) {
    frameworks.push({
      id: 'sadc',
      label: 'SADC',
      description: 'Southern African Development Community trade bloc',
      status: 'active',
      statusLabel: 'Member',
    });
  }

  if (EAC_ISO3.has(upper)) {
    frameworks.push({
      id: 'eac',
      label: 'EAC',
      description: 'East African Community common market',
      status: 'active',
      statusLabel: 'Member',
    });
  }

  if (COMESA_ISO3.has(upper)) {
    frameworks.push({
      id: 'comesa',
      label: 'COMESA',
      description: 'Common Market for Eastern and Southern Africa',
      status: 'active',
      statusLabel: 'Member',
    });
  }

  return frameworks;
}

function caribbeanFrameworks(iso3: string): MarketAccessFramework[] {
  const upper = iso3.toUpperCase();
  const frameworks: MarketAccessFramework[] = [];

  frameworks.push({
    id: 'cbi',
    label: 'CBI',
    emoji: '🇺🇸',
    description: 'Caribbean Basin Initiative — status from Evidence Vault (verify:ustr:cbi).',
    status: 'info',
    statusLabel: 'Under review',
  });

  if (CARICOM_ISO3.has(upper)) {
    frameworks.push({
      id: 'caricom',
      label: 'CARICOM',
      emoji: '🌴',
      description: 'Caribbean Community — status from Evidence Vault (verify:caricom).',
      status: 'info',
      statusLabel: 'Under review',
    });
  }

  return frameworks;
}

/**
 * Returns market access frameworks applicable to a country by ISO3.
 */
export function getMarketAccessFrameworks(iso3: string): MarketAccessFramework[] {
  const upper = iso3.toUpperCase();

  if (isApprovedCaribbeanMarket(upper)) {
    return caribbeanFrameworks(upper);
  }

  if (APPROVED_AFRICA_ISO3.includes(upper as typeof APPROVED_AFRICA_ISO3[number])) {
    return africaFrameworks(upper);
  }

  return [];
}
