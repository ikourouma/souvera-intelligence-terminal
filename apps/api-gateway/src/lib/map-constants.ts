// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Map Constants & Utilities
// Owner: Afronovation, Inc.
//
// Shared constants for map visualization including
// region colors, ISO mappings, and helper functions.
//
// Adapted from AfDEC patterns but Souvera-branded.
// ===========================================

import { APPROVED_CARIBBEAN_ISO3 } from './market-coverage';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type AfricaRegion = 'west' | 'east' | 'north' | 'central' | 'south';

export interface RegionColorConfig {
  fill: string;
  hover: string;
  dim: string;
  label: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Region color system — 5 AU regions, premium dark terminal palette
// ─────────────────────────────────────────────────────────────────────────────

export const REGION_COLORS: Record<AfricaRegion, RegionColorConfig> = {
  west:    { fill: '#1d4ed8', hover: '#3b82f6', dim: '#1d4ed855', label: 'West Africa' },
  east:    { fill: '#059669', hover: '#10b981', dim: '#05966955', label: 'East Africa' },
  north:   { fill: '#7c3aed', hover: '#a78bfa', dim: '#7c3aed55', label: 'North Africa' },
  central: { fill: '#d97706', hover: '#f59e0b', dim: '#d9770655', label: 'Central Africa' },
  south:   { fill: '#dc2626', hover: '#f87171', dim: '#dc262655', label: 'Southern Africa' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Complete AU 54 nations — ISO3 → Region assignment
// Includes: Western Sahara (diplomatic neutral), South Sudan, all island nations
// ─────────────────────────────────────────────────────────────────────────────

export const ISO3_REGION: Record<string, AfricaRegion> = {
  // North Africa (7 — incl. Western Sahara as diplomatic neutral)
  MAR: 'north', DZA: 'north', TUN: 'north', LBY: 'north',
  EGY: 'north', SDN: 'north', ESH: 'north',

  // West Africa (16)
  NGA: 'west', GHA: 'west', SEN: 'west', MLI: 'west',
  BFA: 'west', NER: 'west', GIN: 'west', SLE: 'west',
  LBR: 'west', CIV: 'west', TGO: 'west', BEN: 'west',
  GMB: 'west', GNB: 'west', CPV: 'west', MRT: 'west',

  // East Africa (14 — incl. island nations, South Sudan)
  ETH: 'east', KEN: 'east', TZA: 'east', UGA: 'east',
  RWA: 'east', BDI: 'east', SOM: 'east', DJI: 'east',
  ERI: 'east', MDG: 'east', COM: 'east', MUS: 'east',
  SYC: 'east', SSD: 'east',

  // Central Africa (9)
  CMR: 'central', CAF: 'central', COD: 'central', COG: 'central',
  GAB: 'central', GNQ: 'central', STP: 'central', TCD: 'central',
  AGO: 'central',

  // Southern Africa (10)
  ZAF: 'south', BWA: 'south', LSO: 'south', SWZ: 'south',
  NAM: 'south', ZWE: 'south', MOZ: 'south', ZMB: 'south',
  MWI: 'south',
};

// ─────────────────────────────────────────────────────────────────────────────
// Canonical country name → ISO3 (from world.geojson properties.name)
// Includes all known aliases used by different GeoJSON/TopoJSON sources
// ─────────────────────────────────────────────────────────────────────────────

export const NAME_TO_ISO3: Record<string, string> = {
  // North Africa
  'Morocco': 'MAR', 'Algeria': 'DZA', 'Tunisia': 'TUN',
  'Libya': 'LBY', 'Libyan Arab Jamahiriya': 'LBY',
  'Egypt': 'EGY', 'Sudan': 'SDN', 'Western Sahara': 'ESH', 'W. Sahara': 'ESH',
  
  // West Africa
  'Nigeria': 'NGA', 'Ghana': 'GHA', 'Senegal': 'SEN', 'Mali': 'MLI',
  'Burkina Faso': 'BFA', 'Niger': 'NER', 'Guinea': 'GIN',
  'Sierra Leone': 'SLE', 'Liberia': 'LBR',
  'Ivory Coast': 'CIV', 'Côte d\'Ivoire': 'CIV', 'Cote d\'Ivoire': 'CIV',
  'Togo': 'TGO', 'Benin': 'BEN', 'The Gambia': 'GMB', 'Gambia': 'GMB',
  'Guinea-Bissau': 'GNB', 'Guinea Bissau': 'GNB', 'GuineaBissau': 'GNB',
  'Cape Verde': 'CPV', 'Cabo Verde': 'CPV', 'Mauritania': 'MRT',
  
  // East Africa
  'Ethiopia': 'ETH', 'Kenya': 'KEN',
  'Tanzania': 'TZA', 'United Republic of Tanzania': 'TZA', 'Tanzania, United Rep.': 'TZA',
  'Uganda': 'UGA', 'Rwanda': 'RWA', 'Burundi': 'BDI', 'Somalia': 'SOM', 'Djibouti': 'DJI',
  'Eritrea': 'ERI', 'Madagascar': 'MDG', 'Comoros': 'COM',
  'Mauritius': 'MUS', 'Seychelles': 'SYC',
  'South Sudan': 'SSD', 'S. Sudan': 'SSD', 'S Sudan': 'SSD',
  
  // Central Africa — all Congo aliases + Equatorial Guinea variants
  'Cameroon': 'CMR', 'Central African Republic': 'CAF', 'Central African Rep.': 'CAF',
  'Democratic Republic of the Congo': 'COD', 'Dem. Rep. Congo': 'COD',
  'DR Congo': 'COD', 'DRC': 'COD', 'Congo, Dem. Rep.': 'COD',
  'Congo, DR': 'COD', 'D.R. Congo': 'COD',
  'Republic of the Congo': 'COG', 'Republic of Congo': 'COG',
  'Congo': 'COG', 'Congo, Rep.': 'COG', 'Congo Republic': 'COG',
  'Gabon': 'GAB',
  // Equatorial Guinea — all known source variants (holtzy world.geojson uses "Equatorial Guinea")
  'Equatorial Guinea': 'GNQ', 'Eq. Guinea': 'GNQ', 'Equatorial Guinea (Bioko)': 'GNQ',
  'Guinea Ecuatorial': 'GNQ', 'Guinée équatoriale': 'GNQ',
  'São Tomé and Príncipe': 'STP', 'Sao Tome and Principe': 'STP',
  'São Tomé e Príncipe': 'STP', 'Sao Tome e Principe': 'STP',
  'S. Tomé and Príncipe': 'STP',
  'Chad': 'TCD', 'Angola': 'AGO',
  
  // Southern Africa
  'South Africa': 'ZAF', 'Botswana': 'BWA', 'Lesotho': 'LSO',
  'Eswatini': 'SWZ', 'Swaziland': 'SWZ', 'Namibia': 'NAM',
  'Zimbabwe': 'ZWE', 'Mozambique': 'MOZ', 'Zambia': 'ZMB', 'Malawi': 'MWI',

  // Caribbean (approved Souvera markets)
  'Antigua and Barbuda': 'ATG', 'Antigua & Barbuda': 'ATG',
  'Bahamas': 'BHS', 'The Bahamas': 'BHS',
  'Barbados': 'BRB',
  'Belize': 'BLZ',
  'Cuba': 'CUB',
  'Dominica': 'DMA',
  'Dominican Republic': 'DOM',
  'Grenada': 'GRD',
  'Guyana': 'GUY',
  'Haiti': 'HTI',
  'Jamaica': 'JAM',
  'Puerto Rico': 'PRI',
  'Saint Kitts and Nevis': 'KNA', 'St. Kitts and Nevis': 'KNA',
  'Saint Lucia': 'LCA', 'St. Lucia': 'LCA',
  'Saint Vincent and the Grenadines': 'VCT', 'St. Vincent and the Grenadines': 'VCT',
  'Suriname': 'SUR',
  'Trinidad and Tobago': 'TTO',
  'British Virgin Islands': 'VGB', 'Virgin Islands, British': 'VGB',
  'Turks and Caicos Islands': 'TCA', 'Turks and Caicos': 'TCA',
  'Cayman Islands': 'CYM',
};

// ─────────────────────────────────────────────────────────────────────────────
// GeoJSON URLs for map rendering
// ─────────────────────────────────────────────────────────────────────────────

export const GEO_URLS = {
  primary: 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
  fallback: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
} as const;

/**
 * Caribbean map geodata — Natural Earth 50m has reliable ISO_A3 / ADM0_A3 for
 * sovereign states and most territories. rembish iso-a2-markers supplements
 * micro-islands (<1000 km²) as point geometries.
 */
export const CARIBBEAN_GEO_URLS = {
  /** Natural Earth 50m admin-0 — best ISO coverage for Caribbean states */
  primary:
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson',
  /** Same holtzy source as Africa fallback */
  fallback: GEO_URLS.primary,
  /** Point markers for micro-territories (ATG, BRB, VCT, etc.) */
  markers: 'https://cdn.jsdelivr.net/gh/rembish/iso-topojson@main/iso-a2-markers.json',
} as const;

/** Caribbean micro-territories rendered as lat/lng markers when polygons are too small */
export const CARIBBEAN_MARKER_ISO3 = [
  'ATG', 'BRB', 'DMA', 'GRD', 'KNA', 'LCA', 'VCT', 'CYM', 'VGB', 'TCA', 'PRI',
] as const;

/** Default mercator viewport for full Caribbean arc (Cuba → Trinidad + Bahamas) */
export const CARIBBEAN_MAP_VIEW = {
  center: [-74, 12.5] as [number, number],
  scale: { mobile: 620, desktop: 780 },
  zoom: { min: 0.3, max: 18, initial: 1 },
} as const;

/** Caribbean sub-zones for map coloring (mirrors Africa regional palette pattern) */
export type CaribbeanZone =
  | 'greater_antilles'
  | 'lesser_antilles'
  | 'bahamas'
  | 'mainland_rim'
  | 'territories';

export interface CaribbeanZoneColorConfig {
  fill: string;
  hover: string;
  label: string;
}

export const CARIBBEAN_ZONE_COLORS: Record<CaribbeanZone, CaribbeanZoneColorConfig> = {
  greater_antilles: {
    fill: '#0d9488',
    hover: '#14b8a6',
    label: 'Greater Antilles',
  },
  lesser_antilles: {
    fill: '#2563eb',
    hover: '#3b82f6',
    label: 'Lesser Antilles',
  },
  bahamas: {
    fill: '#7c3aed',
    hover: '#a78bfa',
    label: 'Bahamas',
  },
  mainland_rim: {
    fill: '#d97706',
    hover: '#f59e0b',
    label: 'Mainland rim',
  },
  territories: {
    fill: '#db2777',
    hover: '#f472b6',
    label: 'Territories',
  },
};

/** ISO3 → Caribbean sub-zone (all 20 approved markets) */
export const ISO3_CARIBBEAN_ZONE: Record<string, CaribbeanZone> = {
  CUB: 'greater_antilles',
  JAM: 'greater_antilles',
  HTI: 'greater_antilles',
  DOM: 'greater_antilles',
  ATG: 'lesser_antilles',
  BRB: 'lesser_antilles',
  DMA: 'lesser_antilles',
  GRD: 'lesser_antilles',
  KNA: 'lesser_antilles',
  LCA: 'lesser_antilles',
  VCT: 'lesser_antilles',
  TTO: 'lesser_antilles',
  BHS: 'bahamas',
  GUY: 'mainland_rim',
  SUR: 'mainland_rim',
  BLZ: 'mainland_rim',
  PRI: 'territories',
  VGB: 'territories',
  TCA: 'territories',
  CYM: 'territories',
};

/** Caribbean map palette — selected state (zone colors used for fills) */
export const CARIBBEAN_MAP_COLORS = {
  selected: '#f0fdfa',
  selectedStroke: '#ffffff',
  label: 'Caribbean',
} as const;

export function getCaribbeanZone(iso3: string | undefined | null): CaribbeanZone | undefined {
  if (!iso3) return undefined;
  return ISO3_CARIBBEAN_ZONE[iso3.toUpperCase()];
}

export function getCaribbeanZoneColors(iso3: string | undefined | null): CaribbeanZoneColorConfig {
  const zone = getCaribbeanZone(iso3);
  return zone ? CARIBBEAN_ZONE_COLORS[zone] : CARIBBEAN_ZONE_COLORS.greater_antilles;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the African region for an ISO3 code.
 * Returns undefined if not an African country.
 */
export function getRegionForIso3(iso3: string | undefined | null): AfricaRegion | undefined {
  if (!iso3) return undefined;
  return ISO3_REGION[iso3.toUpperCase()];
}

/**
 * Check if an ISO3 code belongs to an African country.
 */
export function isAfricaIso3(iso3: string | undefined | null): boolean {
  if (!iso3) return false;
  return iso3.toUpperCase() in ISO3_REGION;
}

/**
 * Check if an ISO3 code is an approved Caribbean market.
 */
export function isApprovedCaribbeanIso3(iso3: string | undefined | null): boolean {
  if (!iso3) return false;
  return APPROVED_CARIBBEAN_ISO3.includes(iso3.toUpperCase() as typeof APPROVED_CARIBBEAN_ISO3[number]);
}

/**
 * Check if an ISO3 code is in Souvera's approved scope (Africa or Caribbean).
 */
export function isApprovedSouveraIso3(iso3: string | undefined | null): boolean {
  return isAfricaIso3(iso3) || isApprovedCaribbeanIso3(iso3);
}

/**
 * Get region color configuration for an ISO3 code.
 * Returns undefined if not an African country.
 */
export function getRegionColorForIso3(iso3: string | undefined | null): RegionColorConfig | undefined {
  const region = getRegionForIso3(iso3);
  return region ? REGION_COLORS[region] : undefined;
}

/**
 * Resolve ISO3 from a GeoJSON feature name.
 */
export function resolveIso3FromName(name: string | undefined | null): string | undefined {
  if (!name) return undefined;
  return NAME_TO_ISO3[name];
}

/**
 * Resolve ISO3 from a GeoJSON feature, checking iso_a3/ISO_A3 properties first,
 * then falling back to name lookup. Handles Natural Earth, holtzy world.geojson,
 * and world-atlas sources robustly.
 *
 * The iso_a3 path handles Natural Earth GeoJSON (which includes Equatorial Guinea,
 * São Tomé, Comoros, Seychelles, and other small island states reliably).
 */
export function resolveIso3FromGeo(properties: {
  name?: string;
  NAME?: string;
  iso_a3?: string;
  ISO_A3?: string;
  [key: string]: unknown;
}): string | null {
  // Direct ISO3 property (Natural Earth and many authoritative sources)
  const directIso3 = properties?.iso_a3 ?? properties?.ISO_A3;
  if (directIso3 && directIso3 !== '-99' && directIso3 in ISO3_REGION) {
    return directIso3;
  }
  // Name-based fallback (holtzy world.geojson, etc.)
  const name = properties?.name ?? properties?.NAME ?? '';
  return NAME_TO_ISO3[name] ?? null;
}

/**
 * Resolve ISO3 for Caribbean map features — checks direct iso_a3 against
 * approved Caribbean list, then name lookup (includes Caribbean aliases).
 */
export function resolveCaribbeanIso3FromGeo(properties: {
  name?: string;
  NAME?: string;
  iso_a3?: string;
  ISO_A3?: string;
  ADM0_A3?: string;
  iso_a3_eh?: string;
  ISO_A3_EH?: string;
  [key: string]: unknown;
}): string | null {
  const directIso3 =
    properties?.iso_a3 ??
    properties?.ISO_A3 ??
    properties?.ADM0_A3 ??
    properties?.iso_a3_eh ??
    properties?.ISO_A3_EH;
  if (directIso3 && directIso3 !== '-99' && isApprovedCaribbeanIso3(directIso3)) {
    return directIso3.toUpperCase();
  }
  const name = properties?.name ?? properties?.NAME ?? '';
  const fromName = NAME_TO_ISO3[name];
  if (fromName && isApprovedCaribbeanIso3(fromName)) {
    return fromName;
  }
  return null;
}

/**
 * Check if a GeoJSON country name is a disputed territory.
 */
export function isDisputedTerritory(iso3: string | undefined | null): boolean {
  if (!iso3) return false;
  return iso3.toUpperCase() === 'ESH'; // Western Sahara
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Labels — for map workspace UI
// ─────────────────────────────────────────────────────────────────────────────

export const DATA_STATUS_LABELS = {
  previewData: 'Live & Curated Data',
  sourceAttributed: 'Source-Attributed · Live & Curated',
  freshnessUnknown: 'Live data · freshness updating',
  unavailable: 'Data temporarily unavailable',
  pilotNote: 'NGA + JAM pilot terminals live · 74-country rollout in progress',
} as const;
