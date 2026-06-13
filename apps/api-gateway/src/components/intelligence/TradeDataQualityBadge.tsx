'use client';

import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export type DataQualityTier = 'A' | 'B' | 'C';

interface TradeDataQualityBadgeProps {
  tier: DataQualityTier;
  className?: string;
  showLabel?: boolean;
}

const TIER_CONFIG: Record<DataQualityTier, {
  icon: typeof CheckCircle2;
  label: string;
  description: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}> = {
  A: {
    icon: CheckCircle2,
    label: 'High Confidence',
    description: 'Curated data from verified sources',
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/20',
  },
  B: {
    icon: Info,
    label: 'Regional Estimate',
    description: 'Estimates based on regional benchmarks',
    colorClass: 'text-blue-400',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/20',
  },
  C: {
    icon: AlertTriangle,
    label: 'Limited Coverage',
    description: 'Conservative projections pending live data',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/20',
  },
};

/**
 * Badge/tooltip indicator for data quality tier in trade intelligence modules.
 * Used in country drawers to communicate data confidence level.
 */
export function TradeDataQualityBadge({ tier, className = '', showLabel = true }: TradeDataQualityBadgeProps) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${config.bgClass} ${config.borderClass} border ${className}`}
      title={config.description}
    >
      <Icon className={`w-3 h-3 ${config.colorClass}`} />
      {showLabel && (
        <span className={`text-[10px] font-medium ${config.colorClass} uppercase tracking-wide`}>
          {config.label}
        </span>
      )}
    </div>
  );
}

interface TradeDataQualityBannerProps {
  tier: DataQualityTier;
  className?: string;
}

/**
 * Full banner for Tier C countries in trade intelligence drawers.
 * Communicates that data is limited and will be upgraded in Phase 1.
 */
export function TradeDataQualityBanner({ tier, className = '' }: TradeDataQualityBannerProps) {
  if (tier !== 'C') return null;

  return (
    <div className={`border border-amber-500/30 bg-amber-500/5 rounded-lg p-3 ${className}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wide">
            Limited Data Coverage
          </p>
          <p className="text-xs text-amber-400/80 mt-1 leading-relaxed">
            This market uses conservative projections based on regional patterns. 
            High-confidence data from ITC Trade Map and UN Comtrade will be integrated in Phase 1.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TradeDataQualityBadge;
