'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { RankingsTable } from './RankingsTable';
import type { MarketRankingRow } from '@/lib/insights/market-rankings';

interface ExpandableRankingsTableProps {
  title: string;
  subtitle?: string;
  rows: MarketRankingRow[];
  previewCount: number;
  expandLabel: string;
  collapseLabel: string;
  compact?: boolean;
  countryHrefs: Record<string, string>;
}

export function ExpandableRankingsTable({
  title,
  subtitle,
  rows,
  previewCount,
  expandLabel,
  collapseLabel,
  compact = false,
  countryHrefs,
}: ExpandableRankingsTableProps) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = rows.length > previewCount;
  const visibleRows = expanded ? rows : rows.slice(0, previewCount);

  return (
    <div className="space-y-3">
      <RankingsTable
        title={title}
        subtitle={
          subtitle
            ? `${subtitle}${canExpand && !expanded ? ` · showing ${previewCount} of ${rows.length}` : ''}`
            : canExpand && !expanded
              ? `Showing ${previewCount} of ${rows.length}`
              : undefined
        }
        rows={visibleRows}
        compact={compact}
        countryHrefs={countryHrefs}
      />

      {canExpand && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded-sm transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                {collapseLabel}
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                {expandLabel}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
