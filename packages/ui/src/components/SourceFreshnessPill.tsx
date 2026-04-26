import React from 'react';

export type FreshnessStatus = 'live' | 'recent' | 'delayed' | 'stale';

export interface SourceFreshnessPillProps {
  status: FreshnessStatus;
  timestamp: string;
  sourceName?: string;
  className?: string;
}

const statusConfig = {
  live: {
    color: 'text-high-growth',
    bg: 'bg-high-growth/10',
    border: 'border-high-growth/20',
    dot: 'bg-high-growth animate-pulse',
    label: 'LIVE',
  },
  recent: {
    color: 'text-emerging',
    bg: 'bg-emerging/10',
    border: 'border-emerging/20',
    dot: 'bg-emerging',
    label: 'RECENT',
  },
  delayed: {
    color: 'text-watchlist',
    bg: 'bg-watchlist/10',
    border: 'border-watchlist/20',
    dot: 'bg-watchlist',
    label: 'DELAYED',
  },
  stale: {
    color: 'text-risk',
    bg: 'bg-risk/10',
    border: 'border-risk/20',
    dot: 'bg-risk',
    label: 'STALE',
  }
};

export const SourceFreshnessPill: React.FC<SourceFreshnessPillProps> = ({
  status,
  timestamp,
  sourceName,
  className = '',
}) => {
  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-sm border backdrop-blur-sm ${config.bg} ${config.border} ${className}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <div className="flex items-center gap-1.5">
        <span className={`text-[10px] font-mono font-bold tracking-wider ${config.color}`}>
          {config.label}
        </span>
        <span className="text-[10px] text-zinc-400 font-mono">
          {sourceName ? `${sourceName} · ` : ''}{timestamp}
        </span>
      </div>
    </div>
  );
};
