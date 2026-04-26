import React from 'react';

export interface MetricCardProps {
  label: string;
  value?: string | number;
  unit?: string;
  status?: 'normal' | 'loading' | 'locked' | 'stale';
  source?: string;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  status = 'normal',
  source,
  change
}) => {
  if (status === 'loading') {
    return (
      <div className="terminal-card animate-pulse">
        <div className="h-4 w-24 bg-border/50 rounded mb-4" />
        <div className="h-8 w-32 bg-border/50 rounded" />
      </div>
    );
  }

  if (status === 'locked') {
    return (
      <div className="terminal-card relative overflow-hidden group border-dashed border-muted/50">
        <div className="h-4 w-24 bg-border/30 rounded mb-4" />
        <div className="h-8 w-32 bg-border/30 rounded blur-[6px] grayscale select-none">
          $12,345,678
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex-col gap-2 p-4">
          <div className="text-[10px] font-bold text-accent-primary uppercase tracking-tighter">Premium Intelligence</div>
          <button className="text-[10px] underline hover:text-white transition-colors">Unlock</button>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-card">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">{label}</span>
        {status === 'stale' && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-watchlist/10 text-watchlist border border-watchlist/20 font-bold uppercase">Stale</span>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">
          {value ?? '—'}
        </span>
        {unit && <span className="text-xs text-text-muted font-medium">{unit}</span>}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {change ? (
          <div className={`text-xs font-bold flex items-center gap-1 ${
            change.trend === 'up' ? 'text-high-growth' : 
            change.trend === 'down' ? 'text-risk-elevated' : 'text-stable'
          }`}>
            <span>{change.trend === 'up' ? '▲' : change.trend === 'down' ? '▼' : '●'}</span>
            <span>{change.value}%</span>
          </div>
        ) : <div />}
        
        {source && <span className="text-[9px] text-text-muted uppercase font-bold truncate max-w-[100px]">{source}</span>}
      </div>
    </div>
  );
};
