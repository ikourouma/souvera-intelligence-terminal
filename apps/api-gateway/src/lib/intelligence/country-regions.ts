/**
 * Sub-regional classification for all 74 approved markets.
 *
 * Powers region-aware content templates (risk, opportunity, trade) so every
 * market resolves to a factually-correct regional bloc rather than a generic
 * default. African markets map to AU sub-regions; Caribbean markets map to
 * currency/bloc sub-groups.
 */

export type AfricanSubRegion = 'north' | 'west' | 'east' | 'central' | 'southern';
export type CaribbeanSubRegion = 'oecs' | 'cariforum' | 'territory';

const AFRICA_SUBREGION: Record<string, AfricanSubRegion> = {
  // North Africa
  MAR: 'north', DZA: 'north', TUN: 'north', LBY: 'north', EGY: 'north', SDN: 'north',
  // West Africa (ECOWAS)
  NGA: 'west', GHA: 'west', SEN: 'west', MLI: 'west', BFA: 'west', NER: 'west',
  GIN: 'west', SLE: 'west', LBR: 'west', CIV: 'west', TGO: 'west', BEN: 'west',
  GMB: 'west', GNB: 'west', CPV: 'west', MRT: 'west',
  // East Africa (EAC / Horn / Indian Ocean)
  ETH: 'east', KEN: 'east', TZA: 'east', UGA: 'east', RWA: 'east', BDI: 'east',
  SOM: 'east', DJI: 'east', ERI: 'east', MDG: 'east', COM: 'east', MUS: 'east',
  SYC: 'east', SSD: 'east',
  // Central Africa (CEMAC)
  CMR: 'central', CAF: 'central', COD: 'central', COG: 'central', GAB: 'central',
  GNQ: 'central', STP: 'central', TCD: 'central', AGO: 'central',
  // Southern Africa (SADC)
  ZAF: 'southern', BWA: 'southern', LSO: 'southern', SWZ: 'southern', NAM: 'southern',
  ZWE: 'southern', MOZ: 'southern', ZMB: 'southern', MWI: 'southern',
};

/** OECS members use the East Caribbean Dollar (XCD). */
const OECS = new Set(['ATG', 'DMA', 'GRD', 'KNA', 'LCA', 'VCT', 'VGB']);
/** Non-sovereign territories / dependencies. */
const CARIBBEAN_TERRITORY = new Set(['PRI', 'VGB', 'TCA', 'CYM']);

export function getAfricanSubRegion(iso3: string): AfricanSubRegion | null {
  return AFRICA_SUBREGION[iso3.toUpperCase()] ?? null;
}

const AFRICA_SUBREGION_LABEL: Record<AfricanSubRegion, string> = {
  north: 'Northern Africa',
  west: 'Western Africa',
  east: 'Eastern Africa',
  central: 'Central Africa',
  southern: 'Southern Africa',
};

export function getAfricanSubRegionLabel(iso3: string): string | null {
  const key = getAfricanSubRegion(iso3);
  return key ? AFRICA_SUBREGION_LABEL[key] : null;
}

export function getCaribbeanSubRegion(iso3: string): CaribbeanSubRegion {
  const key = iso3.toUpperCase();
  if (CARIBBEAN_TERRITORY.has(key)) return 'territory';
  if (OECS.has(key)) return 'oecs';
  return 'cariforum';
}

export function isAfrican(iso3: string): boolean {
  return AFRICA_SUBREGION[iso3.toUpperCase()] != null;
}

/** Regional bloc memberships used for trade-agreement display. */
export const SADC_ISO3 = new Set([
  'ZAF', 'BWA', 'NAM', 'ZMB', 'ZWE', 'MOZ', 'MWI', 'LSO', 'SWZ', 'AGO',
  'COD', 'TZA', 'MDG', 'MUS', 'SYC', 'COM',
]);

export const COMESA_ISO3 = new Set([
  'ETH', 'KEN', 'TZA', 'ZMB', 'ZWE', 'MWI', 'UGA', 'RWA', 'BDI', 'MDG',
  'MUS', 'SYC', 'COM', 'EGY', 'LBY', 'SDN', 'ERI', 'DJI', 'SOM',
]);

export const EAC_ISO3 = new Set(['KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SSD', 'COD', 'SOM']);

export const ECOWAS_ISO3 = new Set([
  'NGA', 'GHA', 'SEN', 'MLI', 'BFA', 'NER', 'GIN', 'SLE', 'LBR', 'CIV',
  'TGO', 'BEN', 'GMB', 'GNB', 'CPV',
]);

export const CEMAC_ISO3 = new Set(['CMR', 'CAF', 'COD', 'COG', 'GAB', 'GNQ', 'TCD']);
