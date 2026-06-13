/** Shared branding for intelligence PNG/PDF exports. */

/** ISO 3166-1 alpha-3 to alpha-2 mapping for countries where simple slice won't work */
export const ISO3_TO_ISO2: Record<string, string> = {
  // Caribbean
  'JAM': 'JM', 'TTO': 'TT', 'BHS': 'BS', 'BRB': 'BB',
  'DOM': 'DO', 'HTI': 'HT', 'GUY': 'GY', 'SUR': 'SR',
  'BLZ': 'BZ', 'KNA': 'KN', 'LCA': 'LC', 'VCT': 'VC',
  'GRD': 'GD', 'ATG': 'AG', 'DMA': 'DM', 'CYM': 'KY',
  'ABW': 'AW', 'CUW': 'CW', 'SXM': 'SX', 'BVI': 'VG',
  'VIR': 'VI', 'PRI': 'PR', 'CUB': 'CU',
  // African (common mismatches)
  'NGA': 'NG', 'KEN': 'KE', 'ZAF': 'ZA', 'GHA': 'GH',
  'TZA': 'TZ', 'UGA': 'UG', 'ETH': 'ET', 'SEN': 'SN',
  'CIV': 'CI', 'CMR': 'CM', 'AGO': 'AO', 'MOZ': 'MZ',
  'ZMB': 'ZM', 'ZWE': 'ZW', 'BWA': 'BW', 'NAM': 'NA',
  'MWI': 'MW', 'RWA': 'RW', 'BEN': 'BJ', 'TGO': 'TG',
  'MLI': 'ML', 'BFA': 'BF', 'NER': 'NE', 'TCD': 'TD',
  'COD': 'CD', 'COG': 'CG', 'GAB': 'GA', 'GNQ': 'GQ',
  'SLE': 'SL', 'LBR': 'LR', 'GIN': 'GN', 'GMB': 'GM',
  'CPV': 'CV', 'STP': 'ST', 'MUS': 'MU', 'SYC': 'SC',
  'COM': 'KM', 'MDG': 'MG', 'DJI': 'DJ', 'ERI': 'ER',
  'SOM': 'SO', 'SDN': 'SD', 'SSD': 'SS', 'CAF': 'CF',
  'LSO': 'LS', 'SWZ': 'SZ', 'MRT': 'MR', 'ESH': 'EH',
};

/** Convert ISO 3166-1 alpha-3 to alpha-2 code */
export function iso3ToIso2(iso3?: string): string {
  if (!iso3) return '';
  const upper = iso3.toUpperCase();
  return ISO3_TO_ISO2[upper] || upper.slice(0, 2);
}

export const EXPORT_BRAND = {
  domain: 'souveraterminal.com',
  email: 'intelligence@souveraterminal.com',
  product: 'Souvera Intelligence Terminal',
  copyright: '© Souvera Intelligence Terminal. Data & analysis proprietary.',
  hq: {
    label: 'Souvera HQ',
    line1: '127 Long Shadow Ln',
    line2: 'Cary, NC 27510',
  },
} as const;

/** ISO 3166-1 alpha-2 → regional indicator flag emoji (fallback when no flag URL). */
export function iso2ToFlagEmoji(iso2?: string): string {
  if (!iso2 || iso2.length !== 2) return '';
  const upper = iso2.toUpperCase();
  return [...upper]
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

export const DEFAULT_EXPORT_SOURCES = 'World Bank, IMF, UN Comtrade, Souvera Analysis';

export function countryExportContext(country?: {
  name?: string;
  flagUrl?: string;
  iso2?: string;
}) {
  return {
    countryName: country?.name ?? 'Country',
    flagUrl: country?.flagUrl,
    iso2: country?.iso2,
  };
}
