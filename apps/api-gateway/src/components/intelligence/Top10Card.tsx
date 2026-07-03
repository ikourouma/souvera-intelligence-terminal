'use client';

import { useCallback, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { exportElementToPNG } from '@/lib/intelligence/export-png';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function usdB(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1e6).toFixed(0)}M`;
  if (v >= 1_000) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function pct(v: number | null | undefined): string {
  return v != null ? `${v.toFixed(1)}%` : '—';
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Top10Item {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
  secondaryValue?: number;
  secondaryLabel?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'blue' | 'amber' | 'red' | 'purple';
}

export interface Top10CardProps {
  title: string;
  items: Top10Item[];
  onItemClick?: (item: Top10Item) => void;
  valueFormatter?: (value: number) => string;
  secondaryFormatter?: (value: number) => string;
  colorScheme?: 'emerald' | 'blue' | 'amber' | 'purple' | 'cyan';
  exportFileName?: string;
  exportTitle?: string;
  sourceAttribution?: string;
  dataAsOf?: string;
  showRanking?: boolean;
  columns?: 2 | 5;
}

const COLOR_SCHEMES = {
  emerald: {
    gradient: 'from-emerald-500 to-teal-500',
    text: 'text-emerald-400',
    hover: 'hover:border-emerald-500/50',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  },
  blue: {
    gradient: 'from-blue-500 to-indigo-500',
    text: 'text-blue-400',
    hover: 'hover:border-blue-500/50',
    bar: 'bg-gradient-to-r from-blue-500 to-indigo-500',
  },
  amber: {
    gradient: 'from-amber-500 to-orange-500',
    text: 'text-amber-400',
    hover: 'hover:border-amber-500/50',
    bar: 'bg-gradient-to-r from-amber-500 to-orange-500',
  },
  purple: {
    gradient: 'from-purple-500 to-pink-500',
    text: 'text-purple-400',
    hover: 'hover:border-purple-500/50',
    bar: 'bg-gradient-to-r from-purple-500 to-pink-500',
  },
  cyan: {
    gradient: 'from-cyan-500 to-blue-500',
    text: 'text-cyan-400',
    hover: 'hover:border-cyan-500/50',
    bar: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  },
};

const BADGE_COLORS = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  red: 'bg-red-500/10 border-red-500/20 text-red-400',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
};

export function Top10Card({
  title,
  items,
  onItemClick,
  valueFormatter = usdB,
  secondaryFormatter = pct,
  colorScheme = 'emerald',
  exportFileName,
  exportTitle,
  sourceAttribution = 'Souvera Intelligence Terminal',
  dataAsOf = 'Source: 2023 (Latest Available)',
  showRanking = true,
  columns = 5,
}: Top10CardProps) {
  const [exporting, setExporting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const colors = COLOR_SCHEMES[colorScheme];
  const maxValue = Math.max(...items.map(i => i.value), 1);

  const handleExport = useCallback(async () => {
    if (!cardRef.current || exporting || !exportFileName) return;
    setExporting(true);
    try {
      await exportElementToPNG({
        element: cardRef.current,
        fileName: exportFileName,
        cardTitle: exportTitle || title,
        sourceAttribution,
        dataAsOf,
      });
    } finally {
      setExporting(false);
    }
  }, [exporting, exportFileName, exportTitle, title, sourceAttribution, dataAsOf]);

  const gridCols = columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 md:grid-cols-5';

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative p-5 bg-zinc-900/50 border border-zinc-700 rounded-xl"
    >
      {/* Export button */}
      {exportFileName && hovered && !exporting && (
        <button
          onClick={handleExport}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800/90 border border-zinc-700 hover:bg-zinc-700 transition-colors z-10"
          title="Download as PNG"
        >
          <Download className="w-4 h-4 text-zinc-300" />
        </button>
      )}
      {exporting && (
        <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>

      <div className={`grid ${gridCols} gap-3`}>
        {items.slice(0, 10).map((item, idx) => {
          const barWidth = (item.value / maxValue) * 100;

          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item)}
              disabled={!onItemClick}
              className={`p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg ${
                onItemClick ? `${colors.hover} hover:bg-zinc-800 cursor-pointer` : ''
              } transition-all text-left group`}
            >
              <div className="flex items-center gap-2 mb-2">
                {showRanking && (
                  <span className="text-zinc-500 text-xs font-mono">#{idx + 1}</span>
                )}
                <span className={`font-medium text-xs ${onItemClick ? `group-hover:${colors.text}` : 'text-white'} transition-colors truncate flex-1`}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${BADGE_COLORS[item.badgeColor || 'emerald']}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              
              {item.sublabel && (
                <p className="text-zinc-500 text-[10px] mb-1 truncate">{item.sublabel}</p>
              )}
              
              <p className={`${colors.text} text-sm font-bold`}>{valueFormatter(item.value)}</p>
              
              <div className="mt-2">
                <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors.bar} rounded-full`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                {item.secondaryValue != null && (
                  <p className="text-zinc-500 text-[10px] mt-1">
                    {item.secondaryLabel || ''} {secondaryFormatter(item.secondaryValue)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Top10Card;
