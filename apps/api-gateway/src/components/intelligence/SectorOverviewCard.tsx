'use client';

import { CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { ExportableCard } from './ExportableCard';

interface SectorOverviewCardProps {
  sector: {
    key: string;
    label: string;
    icon: string;
    description: string;
    narrative?: string;
    keyInsights?: string[];
    caribbeanNarrative?: string;
    caribbeanKeyInsights?: string[];
  };
  stats: {
    marketsCovered: number;
    topMarkets?: Array<{
      iso3: string;
      name: string;
      score?: number;
    }>;
  };
  region: 'africa' | 'caribbean' | 'all';
  onExploreClick?: (sectorKey: string) => void;
}

/**
 * SectorOverviewCard - Individual sector card for Sectors Overview Tab
 * 
 * Displays sector information with:
 * - Icon and label
 * - Description and narrative
 * - Key insights (expandable)
 * - Coverage stats and top markets
 * - Explore CTA
 * - PNG export on hover (via ExportableCard wrapper)
 */
export function SectorOverviewCard({
  sector,
  stats,
  region,
  onExploreClick,
}: SectorOverviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  const regionLabel = region === 'africa' ? 'African' : region === 'caribbean' ? 'Caribbean' : 'Africa + Caribbean';

  // Get region-aware narrative and insights
  const displayNarrative = region === 'caribbean' && sector.caribbeanNarrative 
    ? sector.caribbeanNarrative 
    : sector.narrative || '';
  
  const displayInsights = region === 'caribbean' && sector.caribbeanKeyInsights 
    ? sector.caribbeanKeyInsights 
    : sector.keyInsights || [];

  // Get first 2 sentences for teaser
  const sentences = displayNarrative.split('. ') || [];
  const teaser = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '...' : '');
  const fullNarrative = displayNarrative;

  const exportConfig = {
    fileName: `souvera-sector-${sector.key}-${region}-${new Date().toISOString().split('T')[0]}.png`,
    cardTitle: sector.label,
    sourceAttribution: 'SOUVERA Intelligence © 2026',
    dataAsOf: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  };

  return (
    <ExportableCard exportConfig={exportConfig}>
      <div className="h-full flex flex-col bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-900/50 transition-all duration-300">
        {/* Header: Icon + Label */}
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl">{sector.icon}</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{sector.label}</h3>
            <p className="text-xs text-zinc-500">{sector.description}</p>
          </div>
        </div>

        {/* Narrative */}
        <div className="mb-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            {expanded ? fullNarrative : teaser}
          </p>
          {sentences.length > 2 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-400 hover:text-blue-300 mt-2 transition-colors"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Key Insights */}
        {displayInsights && displayInsights.length > 0 && (
          <div className="mb-4 p-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg">
            <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">
              Key Insights
            </h4>
            <ul className="space-y-1.5">
              {displayInsights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Coverage Stats */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Available in <span className="font-bold text-zinc-400">{stats.marketsCovered}</span> {regionLabel} markets</span>
          </div>
        </div>

        {/* Top Markets */}
        {stats.topMarkets && stats.topMarkets.length > 0 && (
          <div className="mb-4 p-3 bg-zinc-900/30 border border-zinc-700/30 rounded-lg">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Top Markets
            </h4>
            <div className="space-y-1.5">
              {stats.topMarkets.slice(0, 3).map((market) => (
                <div key={market.iso3} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">{market.name}</span>
                  {market.score && (
                    <span className="text-emerald-400 font-bold">{market.score}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button - Push to bottom */}
        <div className="mt-auto">
          <button
            onClick={() => onExploreClick?.(sector.key)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors group"
            data-export-exclude
          >
            <span>Explore {sector.label}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </ExportableCard>
  );
}
