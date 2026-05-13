// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Ingestion Validators
// Owner: Afronovation, Inc.
//
// Validates data against Souvera's 74-market scope
// Rejects ESH (Western Sahara) from public scope
// ===========================================

import type { ValidationError } from '../data/types';

// 74-market Souvera public scope ISO3 codes
// ESH (Western Sahara) is explicitly excluded
export const SOUVERA_74_MARKET_SCOPE: readonly string[] = [
  // Africa - North
  'DZA', 'EGY', 'LBY', 'MAR', 'TUN',
  // Africa - West
  'BEN', 'BFA', 'CPV', 'CIV', 'GMB', 'GHA', 'GIN', 'GNB', 'LBR', 'MLI',
  'MRT', 'NER', 'NGA', 'SEN', 'SLE', 'TGO',
  // Africa - Central
  'CMR', 'CAF', 'TCD', 'COG', 'COD', 'GNQ', 'GAB', 'STP',
  // Africa - East
  'BDI', 'COM', 'DJI', 'ERI', 'ETH', 'KEN', 'MDG', 'MWI', 'MUS', 'MOZ',
  'RWA', 'SYC', 'SOM', 'SSD', 'SDN', 'TZA', 'UGA', 'ZMB', 'ZWE',
  // Africa - Southern
  'AGO', 'BWA', 'SWZ', 'LSO', 'NAM', 'ZAF',
  // Caribbean
  'ATG', 'BHS', 'BRB', 'BLZ', 'DMA', 'DOM', 'GRD', 'GUY', 'HTI', 'JAM',
  'KNA', 'LCA', 'VCT', 'SUR', 'TTO',
] as const;

// ESH explicitly excluded
export const EXCLUDED_MARKETS: readonly string[] = ['ESH'] as const;

export function isValidMarketScope(iso3: string): boolean {
  return SOUVERA_74_MARKET_SCOPE.includes(iso3.toUpperCase());
}

export function isExcludedMarket(iso3: string): boolean {
  return EXCLUDED_MARKETS.includes(iso3.toUpperCase());
}

export interface RowValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  mapped_iso3?: string;
  is_excluded: boolean;
  exclusion_reason?: string;
}

export function validateRow(
  row: Record<string, unknown>,
  config: {
    countryColumn?: string;
    requiredFields?: string[];
    countryCodeType?: 'iso3' | 'iso2' | 'name';
  }
): RowValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let mapped_iso3: string | undefined;
  let is_excluded = false;
  let exclusion_reason: string | undefined;

  // Check required fields
  if (config.requiredFields) {
    for (const field of config.requiredFields) {
      const value = row[field];
      if (value === undefined || value === null || value === '') {
        errors.push({
          code: 'REQUIRED_FIELD_MISSING',
          message: `Required field "${field}" is missing or empty`,
          field,
          value,
        });
      }
    }
  }

  // Validate country code
  if (config.countryColumn) {
    const countryValue = row[config.countryColumn];
    if (countryValue) {
      const countryStr = String(countryValue).toUpperCase().trim();
      
      // For ISO3, validate directly
      if (config.countryCodeType === 'iso3' || countryStr.length === 3) {
        mapped_iso3 = countryStr;
        
        if (isExcludedMarket(countryStr)) {
          is_excluded = true;
          exclusion_reason = 'ESH/Western Sahara excluded from Souvera public scope';
          errors.push({
            code: 'EXCLUDED_MARKET',
            message: exclusion_reason,
            field: config.countryColumn,
            value: countryValue,
          });
        } else if (!isValidMarketScope(countryStr)) {
          errors.push({
            code: 'INVALID_MARKET',
            message: `Country "${countryStr}" is not in Souvera 74-market scope`,
            field: config.countryColumn,
            value: countryValue,
          });
        }
      } else {
        // Country code needs lookup (ISO2 or name)
        warnings.push({
          code: 'COUNTRY_LOOKUP_REQUIRED',
          message: `Country value "${countryStr}" requires crosswalk lookup`,
          field: config.countryColumn,
          value: countryValue,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    mapped_iso3,
    is_excluded,
    exclusion_reason,
  };
}

export function validateBatchRows(
  rows: Array<{ row_number: number; data: Record<string, unknown> }>,
  config: {
    countryColumn?: string;
    requiredFields?: string[];
    countryCodeType?: 'iso3' | 'iso2' | 'name';
  }
): {
  results: Array<{ row_number: number; validation: RowValidationResult }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    warnings: number;
    excluded: number;
  };
} {
  const results = rows.map((row) => ({
    row_number: row.row_number,
    validation: validateRow(row.data, config),
  }));

  const summary = {
    total: results.length,
    valid: results.filter((r) => r.validation.isValid).length,
    invalid: results.filter((r) => !r.validation.isValid && !r.validation.is_excluded).length,
    warnings: results.filter((r) => r.validation.warnings.length > 0).length,
    excluded: results.filter((r) => r.validation.is_excluded).length,
  };

  return { results, summary };
}

// AGOA status validation
export const VALID_AGOA_STATUSES = [
  'eligible',
  'candidate',
  'suspended',
  'reinstated',
  'not_eligible',
  'graduated',
] as const;

export function validateAGOAStatus(status: unknown): ValidationError | null {
  if (!status) return null;
  const normalized = String(status).toLowerCase().trim().replace(/\s+/g, '_');
  if (!VALID_AGOA_STATUSES.includes(normalized as typeof VALID_AGOA_STATUSES[number])) {
    return {
      code: 'INVALID_AGOA_STATUS',
      message: `Invalid AGOA status: "${status}". Valid: ${VALID_AGOA_STATUSES.join(', ')}`,
      field: 'agoa_status',
      value: status,
    };
  }
  return null;
}

// AfCFTA status validation
export const VALID_AFCFTA_STATUSES = [
  'not_signed',
  'signed',
  'ratified',
  'deposited',
  'trading',
  'full_implementation',
] as const;

export function validateAfCFTAStatus(status: unknown): ValidationError | null {
  if (!status) return null;
  const normalized = String(status).toLowerCase().trim().replace(/\s+/g, '_');
  if (!VALID_AFCFTA_STATUSES.includes(normalized as typeof VALID_AFCFTA_STATUSES[number])) {
    return {
      code: 'INVALID_AFCFTA_STATUS',
      message: `Invalid AfCFTA status: "${status}". Valid: ${VALID_AFCFTA_STATUSES.join(', ')}`,
      field: 'afcfta_status',
      value: status,
    };
  }
  return null;
}

// Date validation
export function validateDate(value: unknown, fieldName: string): ValidationError | null {
  if (!value) return null;
  const dateStr = String(value);
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return {
      code: 'INVALID_DATE',
      message: `Invalid date format: "${dateStr}"`,
      field: fieldName,
      value,
    };
  }
  return null;
}
