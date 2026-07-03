// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Enterprise Stats Card - Fortune 5 Design
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EnterpriseStatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'blue' | 'amber' | 'purple' | 'red' | 'cyan';
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: string;
    label?: string;
  };
  sparklineData?: number[];
}

const colorConfig = {
  indigo: {
    gradient: 'from-indigo-500/20 to-indigo-600/5',
    border: 'border-indigo-500/20 hover:border-indigo-500/40',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-400',
    trendUp: 'text-indigo-400',
    sparkline: '#818cf8',
  },
  emerald: {
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    trendUp: 'text-emerald-400',
    sparkline: '#34d399',
  },
  blue: {
    gradient: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    trendUp: 'text-blue-400',
    sparkline: '#60a5fa',
  },
  amber: {
    gradient: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    trendUp: 'text-amber-400',
    sparkline: '#fbbf24',
  },
  purple: {
    gradient: 'from-purple-500/20 to-purple-600/5',
    border: 'border-purple-500/20 hover:border-purple-500/40',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    trendUp: 'text-purple-400',
    sparkline: '#a78bfa',
  },
  red: {
    gradient: 'from-red-500/20 to-red-600/5',
    border: 'border-red-500/20 hover:border-red-500/40',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    trendUp: 'text-red-400',
    sparkline: '#f87171',
  },
  cyan: {
    gradient: 'from-cyan-500/20 to-cyan-600/5',
    border: 'border-cyan-500/20 hover:border-cyan-500/40',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    trendUp: 'text-cyan-400',
    sparkline: '#22d3ee',
  },
};

function AnimatedNumber({ value }: { value: number | string }) {
  const [displayValue, setDisplayValue] = useState<number | string>(0);

  useEffect(() => {
    if (typeof value === 'string') {
      setDisplayValue(value);
      return;
    }

    const duration = 1000;
    const steps = 30;
    const stepValue = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(stepValue * step, value);
      setDisplayValue(Math.round(current));

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <>{typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}</>;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 32;
  const width = 80;
  const padding = 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function EnterpriseStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  sparklineData,
}: EnterpriseStatsCardProps) {
  const config = colorConfig[color];

  const TrendIcon = trend?.direction === 'up' ? TrendingUp 
    : trend?.direction === 'down' ? TrendingDown 
    : Minus;

  const trendColor = trend?.direction === 'up' ? 'text-emerald-400'
    : trend?.direction === 'down' ? 'text-red-400'
    : 'text-zinc-500';

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} bg-zinc-900/50 border ${config.border} rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-900/50 group`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-white/5 blur-xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`${config.iconBg} rounded-xl p-3 border border-white/5`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          {sparklineData && (
            <Sparkline data={sparklineData} color={config.sparkline} />
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <p className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <AnimatedNumber value={value} />
          </p>
        </div>

        {/* Title & Subtitle */}
        <p className="text-sm text-zinc-400 font-medium">{title}</p>
        {subtitle && (
          <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
        )}

        {/* Trend */}
        {trend && (
          <div className="mt-3 pt-3 border-t border-zinc-800/50 flex items-center gap-2">
            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            <span className={`text-sm font-medium ${trendColor}`}>{trend.value}</span>
            {trend.label && (
              <span className="text-xs text-zinc-500">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
