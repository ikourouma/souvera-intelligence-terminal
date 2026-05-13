'use client';

import { Lock, DollarSign, TrendingUp, Users, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface EntitledMetricCardProps {
  label: string;
  value: number | string | undefined | null;
  icon?: LucideIcon;
  color?: string;
  locked?: boolean;
  lockedLabel?: string;
  missingLabel?: string;
  formatType?: 'currency' | 'population' | 'percentage' | 'number';
}

function formatValue(
  value: number | string | undefined | null, 
  formatType: EntitledMetricCardProps['formatType'],
  missingLabel: string = 'N/A'
): string {
  if (value === undefined || value === null) return missingLabel;
  if (typeof value === 'string') return value;

  switch (formatType) {
    case 'currency': {
      const absValue = Math.abs(value);
      const sign = value < 0 ? '-' : '';
      if (absValue >= 1e12) return `${sign}$${(absValue / 1e12).toFixed(1)}T`;
      if (absValue >= 1e9) return `${sign}$${(absValue / 1e9).toFixed(1)}B`;
      if (absValue >= 1e6) return `${sign}$${(absValue / 1e6).toFixed(1)}M`;
      if (absValue >= 1e3) return `${sign}$${(absValue / 1e3).toFixed(1)}K`;
      return `${sign}$${absValue.toFixed(0)}`;
    }
    
    case 'population':
      if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
      if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
      return value.toFixed(0);
    
    case 'percentage':
      const sign = value >= 0 ? '+' : '';
      return `${sign}${value.toFixed(1)}%`;
    
    default:
      return value.toLocaleString();
  }
}

const METRIC_ICONS: Record<string, LucideIcon> = {
  'GDP': DollarSign,
  'GDP Growth': TrendingUp,
  'Population': Users,
  'FDI': Globe,
};

const METRIC_COLORS: Record<string, string> = {
  'GDP': 'text-blue-400',
  'GDP Growth': 'text-emerald-400',
  'Population': 'text-purple-400',
  'FDI': 'text-amber-400',
};

export function EntitledMetricCard({
  label,
  value,
  icon,
  color,
  locked = false,
  lockedLabel = 'Professional+',
  missingLabel = 'N/A',
  formatType = 'number',
}: EntitledMetricCardProps) {
  const Icon = icon || METRIC_ICONS[label] || DollarSign;
  const textColor = color || METRIC_COLORS[label] || 'text-zinc-300';

  if (locked) {
    return (
      <div className="bg-zinc-900/70 p-4 relative overflow-hidden">
        {/* Locked overlay */}
        <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-[1px] flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-4 h-4 text-zinc-600 mx-auto mb-1" />
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block">
              {lockedLabel}
            </span>
          </div>
        </div>
        
        {/* Underlying content (blurred) */}
        <div className="flex items-center gap-2 mb-2 opacity-30">
          <Icon className={`w-3.5 h-3.5 ${textColor}`} />
          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
            {label}
          </span>
        </div>
        <div className={`text-xl font-bold ${textColor} blur-sm`}>
          $X.XB
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/70 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-3.5 h-3.5 ${textColor}`} />
        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div className={`text-xl font-bold ${textColor}`}>
        {formatValue(value, formatType, missingLabel)}
      </div>
    </div>
  );
}
