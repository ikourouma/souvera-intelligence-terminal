// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Phase 4B Data Utilities
// Owner: Afronovation, Inc.
// ===========================================

import type { 
  FreshnessStatus, 
  ConfidenceLevel, 
  SourceType,
  SourceAttribution,
  DisplayedMetric 
} from './types';

// Calculate freshness status based on last_reviewed_at date
export function calculateFreshnessStatus(
  lastReviewedAt: string | Date | null | undefined,
  thresholdDays: number = 30
): FreshnessStatus {
  if (!lastReviewedAt) return 'expired';
  
  const reviewDate = new Date(lastReviewedAt);
  const now = new Date();
  const diffMs = now.getTime() - reviewDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  if (diffDays <= 7) return 'fresh';
  if (diffDays <= thresholdDays) return 'recent';
  if (diffDays <= 90) return 'stale';
  return 'expired';
}

// Get freshness badge color
export function getFreshnessBadgeColor(status: FreshnessStatus): string {
  switch (status) {
    case 'fresh': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'recent': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'stale': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  }
}

// Get freshness badge label
export function getFreshnessLabel(status: FreshnessStatus): string {
  switch (status) {
    case 'fresh': return 'Fresh';
    case 'recent': return 'Recent';
    case 'stale': return 'Stale';
    case 'expired': return 'Expired';
    default: return 'Unknown';
  }
}

// Get confidence badge color
export function getConfidenceBadgeColor(level: ConfidenceLevel): string {
  switch (level) {
    case 'high': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'medium': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'low': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'curated': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  }
}

// Get confidence label
export function getConfidenceLabel(level: ConfidenceLevel): string {
  switch (level) {
    case 'high': return 'High Confidence';
    case 'medium': return 'Medium Confidence';
    case 'low': return 'Low Confidence';
    case 'curated': return 'Curated';
    default: return 'Unknown';
  }
}

// Get source type display label
export function getSourceTypeLabel(type: SourceType): string {
  switch (type) {
    case 'api': return 'Source-Attributed Preview';
    case 'file': return 'Curated Preview Data';
    case 'manual': return 'Curated Preview Data';
    default: return 'Data pending';
  }
}

// Get source type badge color
export function getSourceTypeBadgeColor(type: SourceType): string {
  switch (type) {
    case 'api': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    case 'file': return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
    case 'manual': return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
    default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  }
}

// Format date for display
export function formatDisplayDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format relative time
export function formatRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// Create source attribution object
export function createSourceAttribution(
  source: {
    key: string;
    name: string;
    source_type: SourceType;
    confidence_level: ConfidenceLevel;
    attribution_template?: string;
  },
  options?: {
    indicator_key?: string;
    as_of_date?: string;
    last_reviewed_at?: string;
    min_plan_id?: string;
    freshness_threshold_days?: number;
  }
): SourceAttribution {
  const lastReviewed = options?.last_reviewed_at;
  const thresholdDays = options?.freshness_threshold_days || 30;
  
  return {
    source_key: source.key,
    source_name: source.name,
    source_type: source.source_type,
    indicator_key: options?.indicator_key,
    as_of_date: options?.as_of_date,
    last_reviewed_at: lastReviewed,
    confidence_level: source.confidence_level,
    freshness_status: calculateFreshnessStatus(lastReviewed, thresholdDays),
    min_plan_id: options?.min_plan_id,
    attribution_text: source.attribution_template || `Source: ${source.name}`
  };
}

// Create displayed metric with attribution
export function createDisplayedMetric(
  value: number | string | null,
  attribution: SourceAttribution,
  options?: {
    formatter?: (val: number | string | null) => string;
    is_entitled?: boolean;
  }
): DisplayedMetric {
  const formatter = options?.formatter || ((v) => v?.toString() || 'N/A');
  
  return {
    value,
    formatted_value: formatter(value),
    source_name: attribution.source_name,
    source_type: attribution.source_type,
    as_of_date: attribution.as_of_date,
    last_reviewed_at: attribution.last_reviewed_at,
    freshness_status: attribution.freshness_status,
    confidence_level: attribution.confidence_level,
    min_plan_id: attribution.min_plan_id,
    is_entitled: options?.is_entitled ?? true
  };
}

// Format number with appropriate precision
export function formatNumber(
  value: number | null | undefined,
  options?: {
    decimals?: number;
    prefix?: string;
    suffix?: string;
    compact?: boolean;
  }
): string {
  if (value === null || value === undefined) return 'N/A';
  
  const { decimals = 0, prefix = '', suffix = '', compact = false } = options || {};
  
  if (compact && Math.abs(value) >= 1e9) {
    return `${prefix}${(value / 1e9).toFixed(1)}B${suffix}`;
  }
  if (compact && Math.abs(value) >= 1e6) {
    return `${prefix}${(value / 1e6).toFixed(1)}M${suffix}`;
  }
  if (compact && Math.abs(value) >= 1e3) {
    return `${prefix}${(value / 1e3).toFixed(1)}K${suffix}`;
  }
  
  return `${prefix}${value.toLocaleString('en-US', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  })}${suffix}`;
}

// Format percentage
export function formatPercent(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

// Format currency
export function formatCurrency(
  value: number | null | undefined, 
  currency: string = 'USD',
  compact: boolean = true
): string {
  if (value === null || value === undefined) return 'N/A';
  
  if (compact) {
    return formatNumber(value, { prefix: '$', compact: true });
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// AGOA status display helpers
export function getAGOAStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'eligible': return 'Eligible';
    case 'suspended': return 'Suspended';
    case 'graduated': return 'Graduated';
    case 'ineligible': return 'Ineligible';
    case 'not_applicable': return 'Not Applicable';
    default: return 'Unknown';
  }
}

export function getAGOAStatusColor(status: string | null | undefined): string {
  switch (status) {
    case 'eligible': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'graduated': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'ineligible': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    case 'not_applicable': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  }
}

// AfCFTA status display helpers
export function getAfCFTAStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'signed': return 'Signed';
    case 'ratified': return 'Ratified';
    case 'deposited': return 'Deposited';
    case 'trading': return 'Trading';
    case 'not_signed': return 'Not Signed';
    default: return 'Unknown';
  }
}

export function getAfCFTAStatusColor(status: string | null | undefined): string {
  switch (status) {
    case 'trading': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'deposited': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'ratified': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'signed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'not_signed': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
  }
}

// Validation helpers
export function isValidISO3(iso3: string): boolean {
  return /^[A-Z]{3}$/i.test(iso3);
}

export function normalizeISO3(iso3: string): string {
  return iso3.trim().toUpperCase();
}

// ESH exclusion check
export function isExcludedMarket(iso3: string): boolean {
  return normalizeISO3(iso3) === 'ESH';
}
