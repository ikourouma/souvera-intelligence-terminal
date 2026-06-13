// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Quick Stats Card Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'blue' | 'amber' | 'purple' | 'red';
  trend?: 'up' | 'down' | 'stable';
}

const colorClasses = {
  indigo: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    icon: 'text-indigo-400',
    text: 'text-indigo-400',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-400',
    text: 'text-emerald-400',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'text-blue-400',
    text: 'text-blue-400',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: 'text-amber-400',
    text: 'text-amber-400',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    icon: 'text-purple-400',
    text: 'text-purple-400',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: 'text-red-400',
    text: 'text-red-400',
  },
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

export function QuickStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend = 'stable',
}: QuickStatsCardProps) {
  const colors = colorClasses[color];
  const TrendIcon = trendIcons[trend];

  return (
    <div className={`bg-zinc-900/50 border ${colors.border} rounded-lg p-6 hover:bg-zinc-800/50 transition-colors`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-zinc-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>
        <div className={`${colors.bg} rounded-lg p-3 border ${colors.border}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1">
        <TrendIcon className={`w-4 h-4 ${colors.text}`} />
        <span className={`text-xs font-medium ${colors.text}`}>
          {trend === 'up' && 'Trending up'}
          {trend === 'down' && 'Trending down'}
          {trend === 'stable' && 'Stable'}
        </span>
      </div>
    </div>
  );
}
