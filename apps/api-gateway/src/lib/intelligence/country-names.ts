/**
 * ISO3 → display name for routing CTAs (curated news, map, etc.)
 * Pilot overrides first; then entity registry; fallback to ISO3 code.
 */

import { getEntity } from '@/lib/entity-registry';

const ISO3_COUNTRY_NAMES: Record<string, string> = {
  NGA: 'Nigeria',
  JAM: 'Jamaica',
  GHA: 'Ghana',
  AGO: 'Angola',
  COD: 'DRC',
  ZWE: 'Zimbabwe',
  ZMB: 'Zambia',
  MAR: 'Morocco',
  TZA: 'Tanzania',
  KEN: 'Kenya',
  ZAF: 'South Africa',
  TTO: 'Trinidad and Tobago',
  EGY: 'Egypt',
  MAR: 'Morocco',
  SEN: 'Senegal',
  CIV: "Côte d'Ivoire",
  ETH: 'Ethiopia',
  RWA: 'Rwanda',
  UGA: 'Uganda',
  TZA: 'Tanzania',
  BWA: 'Botswana',
  MUS: 'Mauritius',
  BHS: 'Bahamas',
  BRB: 'Barbados',
  BLZ: 'Belize',
  CUB: 'Cuba',
  ATG: 'Antigua and Barbuda',
  DMA: 'Dominica',
  GRD: 'Grenada',
  KNA: 'St. Kitts and Nevis',
  LCA: 'St. Lucia',
  VCT: 'St. Vincent and the Grenadines',
  PRI: 'Puerto Rico',
  VGB: 'British Virgin Islands',
  TCA: 'Turks and Caicos',
  CYM: 'Cayman Islands',
  DOM: 'Dominican Republic',
  HTI: 'Haiti',
  GUY: 'Guyana',
  SUR: 'Suriname',
};

/** Countries with full terminal build (pilot gate) — others still routable but may show preview tier */
export const FULL_TERMINAL_PILOT_ISO3 = new Set(['NGA', 'JAM', 'KEN']);

export function countryDisplayName(iso3: string): string {
  const key = iso3.toUpperCase();
  return ISO3_COUNTRY_NAMES[key] ?? getEntity(key)?.name ?? key;
}

export function isFullTerminalPilot(iso3: string): boolean {
  return FULL_TERMINAL_PILOT_ISO3.has(iso3.toUpperCase());
}
