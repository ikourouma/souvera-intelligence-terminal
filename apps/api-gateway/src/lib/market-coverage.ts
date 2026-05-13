// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Market Coverage Constants & Utilities
// Owner: Afronovation, Inc.
//
// Defines approved Souvera market scope for
// public intelligence views (Phase 3).
//
// Approved Scope:
// - 54 African countries (is_african_country = true)
// - 20 Caribbean markets/territories (approved ISO3 list)
// Total: 74 markets
//
// Not included in public scope:
// - USA, Canada, Mexico, Brazil, Argentina
// - Europe, Asia, Oceania
// - South America (except Guyana, Suriname)
// - Central America (except Belize)
// ===========================================

/**
 * Approved African countries (AU member states).
 * 
 * This list includes 54 sovereign African countries that are part
 * of Souvera's mandate scope for intelligence coverage in Phase 3.
 * 
 * Based on African Union membership. Excludes Western Sahara (ESH)
 * to maintain the 54-country canonical scope per EXPECTED_MARKET_COUNTS.
 */
export const APPROVED_AFRICA_ISO3 = [
  // North Africa (6)
  'MAR', // Morocco
  'DZA', // Algeria
  'TUN', // Tunisia
  'LBY', // Libya
  'EGY', // Egypt
  'SDN', // Sudan
  
  // West Africa (16)
  'NGA', // Nigeria
  'GHA', // Ghana
  'SEN', // Senegal
  'MLI', // Mali
  'BFA', // Burkina Faso
  'NER', // Niger
  'GIN', // Guinea
  'SLE', // Sierra Leone
  'LBR', // Liberia
  'CIV', // Ivory Coast
  'TGO', // Togo
  'BEN', // Benin
  'GMB', // Gambia
  'GNB', // Guinea-Bissau
  'CPV', // Cape Verde
  'MRT', // Mauritania
  
  // East Africa (14)
  'ETH', // Ethiopia
  'KEN', // Kenya
  'TZA', // Tanzania
  'UGA', // Uganda
  'RWA', // Rwanda
  'BDI', // Burundi
  'SOM', // Somalia
  'DJI', // Djibouti
  'ERI', // Eritrea
  'MDG', // Madagascar
  'COM', // Comoros
  'MUS', // Mauritius
  'SYC', // Seychelles
  'SSD', // South Sudan
  
  // Central Africa (9)
  'CMR', // Cameroon
  'CAF', // Central African Republic
  'COD', // DR Congo
  'COG', // Republic of Congo
  'GAB', // Gabon
  'GNQ', // Equatorial Guinea
  'STP', // São Tomé and Príncipe
  'TCD', // Chad
  'AGO', // Angola
  
  // Southern Africa (9)
  'ZAF', // South Africa
  'BWA', // Botswana
  'LSO', // Lesotho
  'SWZ', // Eswatini
  'NAM', // Namibia
  'ZWE', // Zimbabwe
  'MOZ', // Mozambique
  'ZMB', // Zambia
  'MWI', // Malawi
] as const;

/**
 * Approved Caribbean markets and territories.
 * 
 * This list includes 20 Caribbean nations and territories
 * that are part of Souvera's mandate scope for intelligence
 * coverage in Phase 3.
 */
export const APPROVED_CARIBBEAN_ISO3 = [
  'ATG', // Antigua and Barbuda
  'BHS', // Bahamas
  'BRB', // Barbados
  'CUB', // Cuba
  'DMA', // Dominica
  'DOM', // Dominican Republic
  'GRD', // Grenada
  'HTI', // Haiti
  'JAM', // Jamaica
  'KNA', // Saint Kitts and Nevis
  'LCA', // Saint Lucia
  'VCT', // Saint Vincent and the Grenadines
  'SUR', // Suriname
  'TTO', // Trinidad and Tobago
  'GUY', // Guyana
  'BLZ', // Belize
  'PRI', // Puerto Rico
  'VGB', // British Virgin Islands
  'TCA', // Turks and Caicos Islands
  'CYM', // Cayman Islands
] as const;

/**
 * Expected market counts by region for QA verification.
 */
export const EXPECTED_MARKET_COUNTS = {
  all: 74,        // 54 African + 20 Caribbean
  africa: 54,     // African countries only
  caribbean: 20,  // Approved Caribbean markets
} as const;

/**
 * Valid region filter values for API and frontend.
 */
export const VALID_REGIONS = ['all', 'africa', 'caribbean'] as const;

export type RegionFilter = typeof VALID_REGIONS[number];

/**
 * Check if an ISO3 code is in the approved Caribbean market list.
 * 
 * @param iso3 - The ISO3 country code to check
 * @returns True if the ISO3 is an approved Caribbean market
 */
export function isApprovedCaribbeanMarket(iso3: string | undefined | null): boolean {
  if (!iso3) return false;
  return APPROVED_CARIBBEAN_ISO3.includes(iso3.toUpperCase() as typeof APPROVED_CARIBBEAN_ISO3[number]);
}

/**
 * Check if a country is within Souvera's approved public scope.
 * 
 * A country is approved if:
 * - It is an African country (is_african_country = true), OR
 * - Its ISO3 is in the approved Caribbean market list
 * 
 * @param country - Country object with iso3 and is_african_country properties
 * @returns True if the country is in approved Souvera scope
 */
export interface SouveraCountry {
  iso3?: string;
  isAfricanCountry?: boolean;
}

export function isApprovedSouveraMarket(country: SouveraCountry): boolean {
  // African country
  if (country.isAfricanCountry === true) {
    return true;
  }
  
  // Approved Caribbean market
  if (country.iso3 && isApprovedCaribbeanMarket(country.iso3)) {
    return true;
  }
  
  return false;
}

/**
 * Normalize and validate a region filter parameter.
 * 
 * @param region - Raw region parameter from query string or props
 * @returns Normalized region filter or 'all' as default
 */
export function normalizeRegionFilter(region: string | undefined | null): RegionFilter {
  if (!region) return 'all';
  
  const normalized = region.toLowerCase().trim();
  
  if (VALID_REGIONS.includes(normalized as RegionFilter)) {
    return normalized as RegionFilter;
  }
  
  return 'all';
}

/**
 * Get a human-readable description of a region filter.
 * 
 * @param region - The region filter
 * @returns Description string for UI display
 */
export function getRegionDescription(region: RegionFilter): string {
  switch (region) {
    case 'africa':
      return '54 African countries';
    case 'caribbean':
      return '20 Caribbean markets and territories';
    case 'all':
      return 'All Souvera markets (Africa + Caribbean)';
    default:
      return 'All markets';
  }
}

/**
 * Get a display label for a region filter.
 * 
 * @param region - The region filter
 * @returns Short label for UI display (e.g., "Africa", "Caribbean")
 */
export function getRegionLabel(region: RegionFilter): string {
  switch (region) {
    case 'africa':
      return 'Africa';
    case 'caribbean':
      return 'Caribbean';
    case 'all':
      return 'All Regions';
    default:
      return 'All Regions';
  }
}

/**
 * Get workspace label for a specific region.
 * 
 * @param region - The region filter
 * @returns Workspace title string (e.g., "Africa Intelligence Terminal")
 */
export function getWorkspaceLabelForRegion(region: RegionFilter): string {
  switch (region) {
    case 'africa':
      return 'Africa Intelligence Terminal';
    case 'caribbean':
      return 'Caribbean Intelligence Terminal';
    case 'all':
      return 'Souvera Intelligence Terminal';
    default:
      return 'Souvera Intelligence Terminal';
  }
}

/**
 * Validate if a given region filter is supported.
 * 
 * @param region - The region filter to validate
 * @returns True if the region is valid and supported
 */
export function isValidRegion(region: unknown): region is RegionFilter {
  if (typeof region !== 'string') return false;
  return VALID_REGIONS.includes(region as RegionFilter);
}
