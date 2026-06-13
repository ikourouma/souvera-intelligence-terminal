/**
 * Signal level display for public rankings — resolves profile → score → growth-derived.
 */

export type SignalLevel =
  | 'high_growth'
  | 'emerging'
  | 'stable'
  | 'watchlist'
  | 'risk_elevated';

export interface ResolvedSignal {
  level: SignalLevel;
  label: string;
  source: 'profile' | 'score' | 'derived';
}

const SIGNAL_LABELS: Record<SignalLevel, string> = {
  high_growth: 'High growth',
  emerging: 'Emerging',
  stable: 'Stable',
  watchlist: 'Watchlist',
  risk_elevated: 'Risk elevated',
};

export function normalizeSignalLevel(raw: string | null | undefined): SignalLevel | null {
  if (!raw) return null;
  const key = raw.toLowerCase().replace(/\s+/g, '_') as SignalLevel;
  return key in SIGNAL_LABELS ? key : null;
}

/** Lite-tier fallback when profile/score signal is absent */
export function deriveSignalFromGrowth(gdpGrowthPct: number | null): SignalLevel {
  if (gdpGrowthPct == null) return 'emerging';
  if (gdpGrowthPct >= 5) return 'high_growth';
  if (gdpGrowthPct >= 2) return 'stable';
  if (gdpGrowthPct >= 0) return 'emerging';
  if (gdpGrowthPct >= -2) return 'watchlist';
  return 'risk_elevated';
}

export function resolveMarketSignal(options: {
  profileSignal?: string | null;
  scoreSignal?: string | null;
  gdpGrowthPct?: number | null;
}): ResolvedSignal {
  const fromProfile = normalizeSignalLevel(options.profileSignal);
  if (fromProfile) {
    return { level: fromProfile, label: SIGNAL_LABELS[fromProfile], source: 'profile' };
  }

  const fromScore = normalizeSignalLevel(options.scoreSignal);
  if (fromScore) {
    return { level: fromScore, label: SIGNAL_LABELS[fromScore], source: 'score' };
  }

  const derived = deriveSignalFromGrowth(options.gdpGrowthPct ?? null);
  return { level: derived, label: SIGNAL_LABELS[derived], source: 'derived' };
}

export function signalLevelClass(level: SignalLevel): string {
  switch (level) {
    case 'high_growth':
      return 'text-emerald-400';
    case 'emerging':
      return 'text-blue-400';
    case 'stable':
      return 'text-zinc-400';
    case 'watchlist':
      return 'text-amber-400';
    case 'risk_elevated':
      return 'text-red-400';
    default:
      return 'text-zinc-500';
  }
}
