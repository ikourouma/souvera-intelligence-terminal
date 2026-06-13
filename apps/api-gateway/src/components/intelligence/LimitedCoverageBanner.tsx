'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Database } from 'lucide-react';
import type { StructuralDataGap } from '@/lib/market-coverage/structural-data-gaps';

interface LimitedCoverageBannerProps {
  gap: StructuralDataGap;
  className?: string;
}

/**
 * Amber banner shown on country terminals for the 6 markets with structural
 * data coverage gaps (ERI, SSD, CUB, PRI, VGB, TCA).
 *
 * Communicates clearly that the gap is institutional — not a platform error.
 */
export function LimitedCoverageBanner({ gap, className = '' }: LimitedCoverageBannerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border border-amber-500/30 bg-amber-500/5 rounded-lg overflow-hidden ${className}`}>
      {/* Header row — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-500/8 transition-colors"
      >
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wide">
              Limited data coverage
            </span>
            <span className="text-xs text-amber-400/70 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5 font-mono">
              {gap.top20Score}/20 indicators
            </span>
          </div>
          <p className="text-xs text-amber-400/80 mt-0.5 leading-relaxed">{gap.headline}</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-amber-500/60 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-500/60 shrink-0" />
        )}
      </button>

      {/* Expanded disclaimer */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-amber-500/15 space-y-3">
          <p className="text-sm text-amber-100/80 leading-relaxed pt-3">{gap.disclaimer}</p>

          <div className="flex flex-col gap-2 text-xs text-amber-400/60">
            <div className="flex items-start gap-2">
              <Database className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                <span className="font-semibold text-amber-400/80">Data constraint type:</span>{' '}
                {gap.tier === 'structural'
                  ? 'Institutional — data does not exist in standard WB / IMF repositories for this market'
                  : 'Near threshold — minor gap, data pipeline in progress'}
              </span>
            </div>
            {gap.availableSource && (
              <div className="flex items-start gap-2">
                <Database className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold text-amber-400/80">Available sources:</span>{' '}
                  {gap.availableSource}
                </span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Database className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                Souvera displays all verified data that is available.{' '}
                Metrics showing{' '}
                <span className="font-mono bg-amber-500/10 px-1 rounded">—</span>{' '}
                indicate no observation exists in our sourced database, not a system error.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
