'use client';

import { TrendingUp, Users, Target } from 'lucide-react';
import type { SignalLevel } from '@/lib/intelligence-entitlements';
import { SIGNAL_COLORS } from '@/lib/intelligence-entitlements';
import type { CountryMetrics, CountrySignal } from '@/types/country-intelligence';

interface QuickStatsWidgetProps {
  country: { name: string };
  metrics: CountryMetrics;
  signal: CountrySignal;
}

export function QuickStatsWidget({ metrics, signal }: QuickStatsWidgetProps) {
  const level = (signal.level in SIGNAL_COLORS ? signal.level : 'stable') as SignalLevel;
  const signalColor = SIGNAL_COLORS[level];
  const score = signal.investmentScore ?? null;

  const formatGDP = (value?: number) => {
    if (!value) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(0)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatPop = (value?: number) => {
    if (!value) return 'N/A';
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    return value.toLocaleString();
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Target className="w-3 h-3" />
        Quick Stats
      </h3>
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">GDP</span>
          </div>
          <p className="text-xl font-bold text-white">{formatGDP(metrics.gdp_current_usd)}</p>
        </div>
        <div className="pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Population</span>
          </div>
          <p className="text-xl font-bold text-white">{formatPop(metrics.population_total)}</p>
        </div>
        <div className="pt-3 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Signal</span>
            {score != null && (
              <div className={`w-2 h-2 rounded-full ${signalColor.bg.replace('/10', '')} animate-pulse`} />
            )}
          </div>
          {score != null ? (
            <>
              <p className={`text-lg font-bold ${signalColor.text} mb-1`}>{signalColor.label}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Score</span>
                <span className="font-bold text-white">{score}/100</span>
              </div>
              <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${signalColor.bg.replace('/10', '')} transition-all duration-500`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Data pending</p>
          )}
        </div>
      </div>
    </div>
  );
}
