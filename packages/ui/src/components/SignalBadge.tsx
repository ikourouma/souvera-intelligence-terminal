import React from 'react';

export type SignalLevel = 'high_growth' | 'emerging' | 'stable' | 'watchlist' | 'risk_elevated';

export interface SignalBadgeProps {
  level?: SignalLevel;
}

const SIGNAL_CONFIG: Record<SignalLevel, { label: string; color: string; border: string; bg: string }> = {
  high_growth: { 
    label: 'High Growth', 
    color: 'var(--high-growth)', 
    border: 'rgba(34, 197, 94, 0.2)', 
    bg: 'rgba(34, 197, 94, 0.05)' 
  },
  emerging: { 
    label: 'Emerging', 
    color: 'var(--emerging)', 
    border: 'rgba(59, 130, 246, 0.2)', 
    bg: 'rgba(59, 130, 246, 0.05)' 
  },
  stable: { 
    label: 'Stable', 
    color: 'var(--stable)', 
    border: 'rgba(107, 114, 128, 0.2)', 
    bg: 'rgba(107, 114, 128, 0.05)' 
  },
  watchlist: { 
    label: 'Watchlist', 
    color: 'var(--watchlist)', 
    border: 'rgba(245, 158, 11, 0.2)', 
    bg: 'rgba(245, 158, 11, 0.05)' 
  },
  risk_elevated: { 
    label: 'Risk Elevated', 
    color: 'var(--risk-elevated)', 
    border: 'rgba(239, 68, 68, 0.2)', 
    bg: 'rgba(239, 68, 68, 0.05)' 
  },
};

export const SignalBadge: React.FC<SignalBadgeProps> = ({ level }) => {
  if (!level) return <span className="text-[10px] text-muted uppercase font-bold">No Signal</span>;

  const config = SIGNAL_CONFIG[level];

  return (
    <div 
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
      style={{ 
        color: config.color, 
        borderColor: config.border, 
        backgroundColor: config.bg 
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      {config.label}
    </div>
  );
};
