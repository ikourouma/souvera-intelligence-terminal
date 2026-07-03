'use client';

import { TrendingUp, Users, Target, Download } from 'lucide-react';
import { useState, useRef } from 'react';
import type { SignalLevel } from '@/lib/intelligence-entitlements';
import { SIGNAL_COLORS } from '@/lib/intelligence-entitlements';
import type { CountryMetrics, CountrySignal } from '@/types/country-intelligence';
import { exportElementToPNG } from '@/lib/intelligence/export-png';
import type { CardAnalysisInput } from '@/lib/intelligence/generate-card-analysis';

interface QuickStatsWidgetProps {
  country: { name: string; iso3?: string };
  metrics: CountryMetrics;
  signal: CountrySignal;
}

export function QuickStatsWidget({ country, metrics, signal }: QuickStatsWidgetProps) {
  const level = (signal.level in SIGNAL_COLORS ? signal.level : 'stable') as SignalLevel;
  const signalColor = SIGNAL_COLORS[level];
  const score = signal.investmentScore ?? null;
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const formatGDP = (value?: number) => {
    if (value == null || !Number.isFinite(value)) return 'N/A';
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);
    if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(1)}T`;
    if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
    return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const formatPop = (value?: number) => {
    if (!value) return 'N/A';
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    return value.toLocaleString();
  };

  const handleExport = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const aiConfig: CardAnalysisInput = {
        cardType: 'quick_stats',
        countryName: country.name,
        iso3: country.iso3 || 'XXX',
        data: {
          'GDP': formatGDP(metrics.gdp_current_usd),
          'Population': formatPop(metrics.population_total),
          'Signal': signalColor.label,
          'Investment Score': score != null ? `${score}/100` : 'Pending',
        },
      };

      await exportElementToPNG({
        element: cardRef.current,
        fileName: `souvera-${country.iso3 || 'country'}-quick-stats-${new Date().toISOString().split('T')[0]}.png`,
        cardTitle: 'Quick Stats',
        countryName: country.name,
        sourceAttribution: 'SOUVERA Intelligence',
        aiAnalysisConfig: aiConfig,
      });
    } catch (err) {
      console.error('Failed to export Quick Stats:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div ref={cardRef} className="exportable-card group relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      {/* Hover-activated PNG download button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="export-btn absolute top-2 right-2 p-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        data-export-exclude
        title="Download Quick Stats as PNG"
        aria-label="Download Quick Stats as PNG"
      >
        <Download className={`w-4 h-4 text-zinc-300 ${isExporting ? 'animate-pulse' : ''}`} />
      </button>
      
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
