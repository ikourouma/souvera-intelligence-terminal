/**
 * Per-country Sectors tab UI copy — trade opportunity block labels.
 * DB field remains `agoa_opportunity`; labels are region-aware (AGOA vs CBI).
 */

import { getCountryRegion } from './country-overview-content';

export interface SectorTradeOpportunityCopy {
  sectionEmoji: string;
  sectionTitle: string;
  potentialLabel: string;
  currentExportLabel: string;
  lockedTitle: string;
  lockedBody: string;
}

const AFRICA_TRADE: SectorTradeOpportunityCopy = {
  sectionEmoji: '🇺🇸',
  sectionTitle: 'AGOA Restoration Opportunity',
  potentialLabel: 'Restoration Upside',
  currentExportLabel: 'Current Bilateral Exports to U.S.',
  lockedTitle: 'Unlock AGOA Trade Intelligence',
  lockedBody: 'Access detailed AGOA opportunities with Business or higher subscription',
};

const CARIBBEAN_TRADE: SectorTradeOpportunityCopy = {
  sectionEmoji: '🇺🇸',
  sectionTitle: 'CBI Export Opportunity',
  potentialLabel: 'CBI Export Upside',
  currentExportLabel: 'Current Bilateral Exports to U.S.',
  lockedTitle: 'Unlock CBI Trade Intelligence',
  lockedBody: 'Access detailed CBI/CARICOM export opportunities with Business or higher subscription',
};

const DEFAULT_TRADE: SectorTradeOpportunityCopy = {
  sectionEmoji: '🌐',
  sectionTitle: 'Preferential Trade Opportunity',
  potentialLabel: 'Export Potential',
  currentExportLabel: 'Current Exports',
  lockedTitle: 'Unlock Trade Intelligence',
  lockedBody: 'Access sector export opportunities with Business or higher subscription',
};

export function getSectorTradeCopy(iso3: string): SectorTradeOpportunityCopy {
  const region = getCountryRegion(iso3);
  if (region === 'caribbean') return CARIBBEAN_TRADE;
  if (region === 'africa') return AFRICA_TRADE;
  return DEFAULT_TRADE;
}
