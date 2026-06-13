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
  /** Client PDF — e.g. USTR, AU (no URLs). */
  sourceDisplayName?: string | null;
  /** Client PDF — e.g. 2025 list, Jan 15, 2026. */
  lastReviewedDisplay?: string | null;
  /** Client PDF status column — never Verified/Unverified. */
  clientStatusLabel?: string;
  /** Evidence Vault artifact (internal). */
  evidenceArtifactId?: string | null;
  /** True when artifact status=ok and status is publishable. */
  publishable?: boolean;
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
  /** Platform freshness timestamp exists (not a markets feed). */
  hasMarketsAsOf: boolean;
  /** Rates, curves, spreads, or market quotes feed — not yet wired for country reports. */
  hasMarketsFeed: boolean;
  hasFiscalSeries: boolean;
  hasExternalSectorSeries: boolean;
  hasPopulationInCanonical: boolean;
  hasVerifiedPolicy: boolean;
  macroYearCount: number;
}

export interface CoverageMapEntry {
  domain: string;
  label: string;
  status: 'covered' | 'not_covered' | 'partial';
  asOfYear?: number | null;
  sourceKey?: string;
  sourceUrl?: string;
  note?: string;
}

export interface CanonicalCountryPayload {
  payload: CountryProfileReportData;
  asOf: AsOfStamps;
  canonicalMetrics: CanonicalMetrics;
  dataCoverage: DataCoverage;
  coverageMap: CoverageMapEntry[];
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
    marketsCoverage: string;
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
