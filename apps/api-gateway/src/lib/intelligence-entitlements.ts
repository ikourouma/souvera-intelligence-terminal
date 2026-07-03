/**
 * Intelligence Panel Entitlement Matrix
 * Defines which metrics/content are visible at each access tier
 * 
 * Aligned with @souvera/entitlements package
 */

import type { AccessTier, EntitlementKey } from '@souvera/entitlements';

// ==============================================
// METRIC ENTITLEMENTS (Executive Snapshot Grid)
// ==============================================

export interface MetricEntitlement {
  key: string;
  label: string;
  requiredEntitlement: EntitlementKey;
  minTier: AccessTier;
  formatType: 'currency' | 'percentage' | 'number' | 'population' | 'fx_rate';
  unit?: string; // Optional unit to display (e.g., "NGN/USD")
}

/**
 * Executive Snapshot Grid (6 Metrics)
 * Defines which metrics require which entitlements
 */
export const EXECUTIVE_METRICS: MetricEntitlement[] = [
  {
    key: 'gdp_current_usd',
    label: 'GDP',
    requiredEntitlement: 'headline_macro',
    minTier: 'public',
    formatType: 'currency',
  },
  {
    key: 'gdp_growth_annual_pct',
    label: 'GDP Growth',
    requiredEntitlement: 'headline_macro',
    minTier: 'public',
    formatType: 'percentage',
  },
  {
    key: 'population_total',
    label: 'Population',
    requiredEntitlement: 'headline_macro',
    minTier: 'public',
    formatType: 'population',
  },
  {
    key: 'fdi_net_inflows_current_usd',
    label: 'FDI',
    requiredEntitlement: 'full_macro',
    minTier: 'professional',
    formatType: 'currency',
  },
  {
    key: 'inflation_consumer_prices_annual_pct',
    label: 'Inflation',
    requiredEntitlement: 'full_macro',
    minTier: 'professional',
    formatType: 'percentage',
  },
  {
    key: 'fx_rate_usd',
    label: 'FX Rate',
    requiredEntitlement: 'fx_metrics',
    minTier: 'professional',
    formatType: 'fx_rate',
    // Neutral fallback only — the panel overrides this with the country's own currency
    // (e.g. MAD/USD, DZD/USD). Never hardcode a single market's pair here.
    unit: 'Local/USD',
  },
];

// ==============================================
// TAB ENTITLEMENTS (7-Tab System)
// ==============================================

export interface TabEntitlement {
  id: string;
  label: string;
  requiredEntitlement: EntitlementKey | null; // null = public access
  minTier: AccessTier;
  description: string;
}

/**
 * 7-Tab System Entitlements
 * platform_admin can access ALL tabs
 */
export const TAB_ENTITLEMENTS: TabEntitlement[] = [
  {
    id: 'overview',
    label: 'Overview',
    requiredEntitlement: 'sector_teasers',
    minTier: 'explorer',
    description: 'Country summary, why now, key highlights',
  },
  {
    id: 'economy',
    label: 'Economy',
    requiredEntitlement: 'full_macro',
    minTier: 'professional',
    description: 'Macro indicators and time series charts',
  },
  {
    id: 'sectors',
    label: 'Sectors',
    requiredEntitlement: 'sector_teasers',
    minTier: 'explorer',
    description: 'Sector scores and rationale',
  },
  {
    id: 'opportunity',
    label: 'Opportunity',
    requiredEntitlement: 'investment_thesis',
    minTier: 'business',
    description: 'Investment thesis and growth drivers',
  },
  {
    id: 'risk',
    label: 'Risk',
    requiredEntitlement: 'risk_analysis',
    minTier: 'business',
    description: 'Risk narrative and scorecard',
  },
  {
    id: 'trade',
    label: 'Trade',
    requiredEntitlement: 'trade_data',
    minTier: 'business',
    description: 'Bilateral trade flows (exports + imports)',
  },
  {
    id: 'reports',
    label: 'Reports',
    requiredEntitlement: 'full_macro',
    minTier: 'professional',
    description: 'Downloadable intelligence reports (Country Profile Professional+; full suite Business+)',
  },
];

// ==============================================
// CONTENT ENTITLEMENTS (Per-Field)
// ==============================================

/**
 * Content field entitlements for narrative sections
 */
export const CONTENT_ENTITLEMENTS = {
  // Overview Tab
  summary_truncated: 'sector_teasers' as EntitlementKey, // Explorer: 200 chars
  summary_full: 'full_macro' as EntitlementKey, // Professional: full text
  why_now: 'full_macro' as EntitlementKey, // Professional+
  
  // Sectors Tab
  sector_teaser: 'sector_teasers' as EntitlementKey, // Explorer+
  sector_scores: 'full_macro' as EntitlementKey, // Professional+
  sector_rationale: 'sector_rationale' as EntitlementKey, // Professional+
  sector_thesis: 'investment_thesis' as EntitlementKey, // Business+
  
  // Economy Tab
  time_series_charts: 'full_macro' as EntitlementKey, // Professional+
  forecast_metrics: 'forecast_metrics' as EntitlementKey, // Business+
  
  // Opportunity Tab
  opportunity_thesis: 'investment_thesis' as EntitlementKey, // Business+
  
  // Risk Tab
  risk_narrative: 'risk_analysis' as EntitlementKey, // Business+
  risk_scorecard: 'risk_analysis' as EntitlementKey, // Business+
  
  // Trade Tab
  exports_to_us: 'trade_data' as EntitlementKey, // Business+
  imports_from_us: 'trade_data' as EntitlementKey, // Business+
  trade_partners: 'trade_data' as EntitlementKey, // Business+
  
  // Reports Tab
  country_profile: 'reports_preview' as EntitlementKey, // Professional+
  investment_memo: 'investment_thesis' as EntitlementKey, // Business+
  trade_profile: 'trade_data' as EntitlementKey, // Business+
  policy_brief: 'export_access' as EntitlementKey, // Institutional+
};

// ==============================================
// VISUAL CAPITALIST: SIGNAL COLORS
// ==============================================

export type SignalLevel = 'high_growth' | 'emerging' | 'stable' | 'watchlist' | 'risk_elevated';

export interface SignalColor {
  bg: string;
  text: string;
  border: string;
  label: string;
  description: string;
}

/**
 * Visual Capitalist Principle: Strategic Color Use
 * Signal colors consistent across ALL components
 */
export const SIGNAL_COLORS: Record<SignalLevel, SignalColor> = {
  high_growth: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500',
    label: 'High Growth',
    description: 'Strong economic momentum and investment opportunity',
  },
  emerging: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500',
    label: 'Emerging',
    description: 'Growing market with increasing opportunities',
  },
  stable: {
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
    border: 'border-zinc-500',
    label: 'Stable',
    description: 'Consistent performance with moderate growth',
  },
  watchlist: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500',
    label: 'Watchlist',
    description: 'Monitor for potential opportunities or risks',
  },
  risk_elevated: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500',
    label: 'Risk Elevated',
    description: 'Heightened risk factors requiring caution',
  },
};

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Check if user can access a specific tab
 * Platform admin can access ALL tabs
 */
export function canAccessTab(
  tabId: string,
  userEntitlements: EntitlementKey[]
): boolean {
  // Platform admin has 'admin_access' entitlement and can access everything
  if (userEntitlements.includes('admin_access')) {
    return true;
  }
  
  const tab = TAB_ENTITLEMENTS.find(t => t.id === tabId);
  if (!tab) return false;
  
  // Public tabs (null required entitlement)
  if (!tab.requiredEntitlement) return true;
  
  return userEntitlements.includes(tab.requiredEntitlement);
}

/**
 * Check if user can see a specific metric
 * Platform admin can see ALL metrics
 */
export function canAccessMetric(
  metricKey: string,
  userEntitlements: EntitlementKey[]
): boolean {
  // Platform admin has 'admin_access' and can see everything
  if (userEntitlements.includes('admin_access')) {
    return true;
  }
  
  const metric = EXECUTIVE_METRICS.find(m => m.key === metricKey);
  if (!metric) return false;
  
  return userEntitlements.includes(metric.requiredEntitlement);
}

/**
 * Check if user can access specific content
 * Platform admin can access ALL content
 */
export function canAccessContent(
  contentKey: keyof typeof CONTENT_ENTITLEMENTS,
  userEntitlements: EntitlementKey[]
): boolean {
  // Platform admin has 'admin_access' and can see everything
  if (userEntitlements.includes('admin_access')) {
    return true;
  }
  
  const requiredEntitlement = CONTENT_ENTITLEMENTS[contentKey];
  return userEntitlements.includes(requiredEntitlement);
}

/**
 * Get tabs accessible to user
 * Returns array of tab IDs user can access
 */
export function getAccessibleTabs(userEntitlements: EntitlementKey[]): string[] {
  return TAB_ENTITLEMENTS
    .filter(tab => canAccessTab(tab.id, userEntitlements))
    .map(tab => tab.id);
}

/**
 * Get locked tabs for user (for upgrade prompts)
 */
export function getLockedTabs(userEntitlements: EntitlementKey[]): TabEntitlement[] {
  return TAB_ENTITLEMENTS.filter(tab => !canAccessTab(tab.id, userEntitlements));
}

/**
 * Truncate text based on entitlement
 * Explorer sees 200 chars, Professional+ sees full text
 */
export function truncateByEntitlement(
  text: string | null | undefined,
  hasFullAccess: boolean,
  maxLength: number = 200
): string {
  if (!text) return '';
  if (hasFullAccess) return text;
  
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Format currency values
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';

  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);

  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return value >= 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
}

/**
 * Format population values
 */
export function formatPopulation(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}

/**
 * Format generic number values
 */
export function formatNumber(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format metric value based on type
 */
export function formatMetricValue(
  value: number | null | undefined,
  formatType: MetricEntitlement['formatType']
): string {
  switch (formatType) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercentage(value);
    case 'population':
      return formatPopulation(value);
    case 'fx_rate':
      return formatNumber(value, 2); // FX rates shown with 2 decimals and thousand separators
    case 'number':
      return formatNumber(value);
    default:
      return 'N/A';
  }
}
