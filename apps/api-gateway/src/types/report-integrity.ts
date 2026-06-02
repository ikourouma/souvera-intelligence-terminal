/**
 * Report v2 integrity — canonical metrics, preflight, cover model.
 */

import type { CountryProfileReportData } from '@/lib/reports/country-profile-data';
import type { EconomyYearPoint } from '@/lib/intelligence/country-economy-content';

export type PolicyFrameworkStatus =
  | 'active'
  | 'suspended'
  | 'graduated'
  | 'ineligible'
  | 'not_applicable'
  | 'unknown'
  | 'needs_review'
  | 'conflict';

export interface PolicyStatusRecord {
  framework: string;
  status: PolicyFrameworkStatus;
  statusLabel: string;
  description: string;
  authoritativeSourceUrl: string | null;
  lastVerifiedAt: string | null;
}

export interface CanonicalMetrics {
  gdpCurrentUsd?: number;
  gdpGrowthPct?: number;
  fdiNetInflowsUsd?: number;
  inflationCpiPct?: number;
  fxToUsd?: number;
  populationTotal?: number;
}

export interface AsOfStamps {
  macroYear: number | null;
  tradeYear: number | null;
  marketsDate: string | null;
  policyVerifiedAt: string | null;
}

export interface DataCoverage {
  hasMacroSeries: boolean;
  hasTradeSummary: boolean;
  hasMarketsAsOf: boolean;
  hasVerifiedPolicy: boolean;
  macroYearCount: number;
}

export interface CanonicalCountryPayload {
  payload: CountryProfileReportData;
  asOf: AsOfStamps;
  canonicalMetrics: CanonicalMetrics;
  dataCoverage: DataCoverage;
  confidence: 'high' | 'medium' | 'low';
  policyRecords: PolicyStatusRecord[];
  signalDrivers: string[];
  signalConfidence: string;
}

export interface PreflightIssue {
  code: string;
  path: string;
  message: string;
  detail?: string;
}

export interface PreflightReport {
  iso3: string;
  passed: boolean;
  errors: PreflightIssue[];
  warnings: PreflightIssue[];
  canonical: CanonicalCountryPayload;
}

export interface CoverPageModel {
  country: CountryProfileReportData['country'];
  generatedAt: string;
  platformFreshnessAt: string;
  asOf: {
    macroYear: string;
    tradeYear: string;
    marketsDate: string;
    policyVerifiedAt: string;
  };
  signal: {
    badge: string;
    confidence: string;
    drivers: string[];
  };
  stance: {
    baseCase: string;
    topRisks: string;
    watchpoints: string;
  };
}

export type { EconomyYearPoint };
