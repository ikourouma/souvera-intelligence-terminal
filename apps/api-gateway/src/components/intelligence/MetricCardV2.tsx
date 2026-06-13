'use client';

import { Lock, TrendingUp, TrendingDown, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import type { EntitlementKey } from '@souvera/entitlements';
import { formatMetricValue, type MetricEntitlement } from '@/lib/intelligence-entitlements';

export interface MetricCardV2Props {
  metric: MetricEntitlement;
  value: number | null | undefined;
  isLocked: boolean;
  isLoading: boolean;
  isStale: boolean;
  userEntitlements: EntitlementKey[];
  trendValue?: number; // Optional: Show trend arrow
  onClick?: () => void; // NEW: Click handler for navigation
  clickable?: boolean; // NEW: Whether card should be clickable
  className?: string;
}

/**
 * MetricCardV2 - Executive Snapshot Grid Metric Card
 * Implements all states per Bloomberg spec:
 * - Visible: Full metric card with value
 * - Locked: Blurred value + lock icon + upgrade CTA
 * - Loading: Skeleton shimmer
 * - Stale: Yellow badge "Data > 90 days old"
 * - Missing: Gray "Data pending"
 * 
 * Visual Capitalist Principle: Simple, Streamlined, Focused + Strategic Color Use
 */
export function MetricCardV2({
  metric,
  value,
  isLocked,
  isLoading,
  isStale,
  userEntitlements,
  trendValue,
  onClick,
  clickable = false,
  className = '',
}: MetricCardV2Props) {
  const formattedValue = formatMetricValue(value, metric.formatType);
  const hasTrend = trendValue !== undefined && trendValue !== null;
  const isTrendPositive = hasTrend && trendValue >= 0;

  // Determine if card should be interactive
  const isInteractive = clickable && !isLocked && !isLoading && onClick;

  // Get strategic color for this metric (Visual Capitalist principle)
  // Using direct hex values for guaranteed rendering (bypasses Tailwind CSS issues)
  let metricColor = '#60A5FA'; // Default: Blue
  if (metric.key === 'gdp_growth_annual_pct') {
    metricColor = '#34D399'; // Emerald: Growth
  } else if (metric.key === 'fdi_net_inflows_current_usd') {
    metricColor = '#34D399'; // Emerald: Investment
  } else if (metric.key === 'inflation_consumer_prices_annual_pct') {
    metricColor = '#FBBF24'; // Amber: Risk/Warning
  } else if (metric.key === 'gdp_current_usd') {
    metricColor = '#60A5FA'; // Blue: Core economic
  } else if (metric.key === 'population_total') {
    metricColor = '#C084FC'; // Purple: Demographic
  } else if (metric.key === 'fx_rate_usd') {
    metricColor = '#22D3EE'; // Cyan: Currency
  }

  // Base card classes with Bloomberg-grade hover states
  const baseClasses = `
    bg-zinc-900/50 border border-zinc-800 rounded-sm p-4 
    transition-all duration-200
    ${isInteractive ? 'cursor-pointer hover:border-emerald-500/50 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/5' : ''}
    ${className}
  `.trim();

  // Loading State
  if (isLoading) {
    return (
      <div className={baseClasses}>
        <div className="animate-pulse">
          <div className="h-3 bg-zinc-800 rounded w-16 mb-3" />
          <div className="h-8 bg-zinc-800 rounded w-24 mb-2" />
          {hasTrend && <div className="h-3 bg-zinc-800 rounded w-12" />}
        </div>
      </div>
    );
  }

  // Locked State (Professional+ metrics for lower tiers)
  if (isLocked) {
    return (
      <div className={`relative bg-zinc-900/50 border border-zinc-800 rounded-sm p-4 overflow-hidden ${className}`}>
        {/* Blurred background content */}
        <div className="filter blur-sm select-none pointer-events-none">
          <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2">
            {metric.label}
          </div>
          <div className="text-2xl font-black text-zinc-400">
            $XX.XB
          </div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
          <Lock className="w-6 h-6 text-zinc-600 mb-2" />
          <p className="text-[10px] font-bold text-zinc-500 text-center px-2">
            Unlock with {metric.minTier === 'professional' ? 'Professional' : 'Business'} plan
          </p>
          <Link
            href="/access/request-access"
            className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors"
          >
            Upgrade
          </Link>
        </div>
      </div>
    );
  }

  // Missing Data State
  if (value === null || value === undefined) {
    return (
      <div className={baseClasses}>
        <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2">
          {metric.label}
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-zinc-600" />
          <span className="text-sm text-zinc-600">Data pending</span>
        </div>
      </div>
    );
  }

  // Visible State (with optional stale badge)
  return (
    <div 
      className={`${baseClasses} relative ${isInteractive ? 'metric-card-interactive' : ''}`}
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      {/* Stale Data Badge */}
      {isStale && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-sm">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="text-[8px] font-bold text-amber-400 uppercase tracking-wider">
              Stale
            </span>
          </div>
        </div>
      )}

      {/* Metric Label */}
      <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2">
        {metric.label}
      </div>

      {/* Metric Value */}
      <div className="flex items-baseline gap-2 mb-1">
        <span 
          className="text-2xl font-black transition-colors metric-value"
          style={{ color: metricColor }}
        >
          {formattedValue}
        </span>
        
        {/* Unit (for FX Rate) */}
        {metric.unit && (
          <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
            {metric.unit}
          </span>
        )}
        
        {/* Trend Indicator */}
        {hasTrend && (
          <div className={`flex items-center gap-1 ${isTrendPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isTrendPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span className="text-[10px] font-bold">
              {Math.abs(trendValue!).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Stale Warning Text */}
      {isStale && (
        <p className="text-[8px] text-amber-400/70 mt-1">
          Data &gt; 90 days old
        </p>
      )}
    </div>
  );
}
