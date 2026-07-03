'use client';

import {
  resolveMarketSignal,
  signalLevelClass,
  type SignalLevel,
} from '@/lib/insights/signal-display';

const BADGE_STYLES: Record<SignalLevel, string> = {
  high_growth: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  emerging: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  stable: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  watchlist: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  risk_elevated: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export interface MarketSignalBadgeProps {
  profileSignal?: string | null;
  scoreSignal?: string | null;
  /** Legacy field from list APIs */
  signalLevel?: string | null;
  gdpGrowthPct?: number | null;
  size?: 'sm' | 'md';
  className?: string;
}

export function MarketSignalBadge({
  profileSignal,
  scoreSignal,
  signalLevel,
  gdpGrowthPct,
  size = 'sm',
  className = '',
}: MarketSignalBadgeProps) {
  const resolved = resolveMarketSignal({
    profileSignal: profileSignal ?? signalLevel,
    scoreSignal,
    gdpGrowthPct,
  });
  const prefix = resolved.source === 'derived' ? '~' : '';
  const pad = size === 'md' ? 'px-3 py-1 text-[10px]' : 'px-2 py-0.5 text-[9px]';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm font-bold tracking-widest uppercase border ${pad} ${BADGE_STYLES[resolved.level]} ${className}`}
    >
      {prefix && <span className="opacity-70 normal-case tracking-normal">{prefix}</span>}
      {resolved.label}
    </span>
  );
}

export { signalLevelClass, resolveMarketSignal };
