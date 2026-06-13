/**
 * TierBadge Component
 * 
 * Displays user's current access tier as a badge.
 * Can be used in headers, profiles, dashboards.
 * 
 * @example
 * <TierBadge tier="business" showIcon={true} />
 */

'use client';

import { AccessTier } from '@souvera/entitlements';
import { Shield, Crown, Sparkles, TrendingUp, Building2, Globe2, Settings, Key } from 'lucide-react';

interface TierBadgeProps {
  tier: AccessTier;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TIER_CONFIG: Record<AccessTier, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: typeof Shield;
}> = {
  public: {
    label: 'Public',
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-800/50',
    borderColor: 'border-zinc-700',
    icon: Globe2,
  },
  explorer: {
    label: 'Explorer',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    icon: TrendingUp,
  },
  professional: {
    label: 'Professional',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    icon: Shield,
  },
  business: {
    label: 'Business',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    icon: Building2,
  },
  investor: {
    label: 'Investor',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    icon: Sparkles,
  },
  institutional: {
    label: 'Institutional',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    icon: Crown,
  },
  platform_admin: {
    label: 'Platform Admin',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    icon: Settings,
  },
  super_admin: {
    label: 'Super Admin',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    icon: Key,
  },
};

const SIZE_CLASSES = {
  sm: {
    container: 'px-2 py-1 text-xs',
    icon: 'w-3 h-3',
  },
  md: {
    container: 'px-3 py-1.5 text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    container: 'px-4 py-2 text-base',
    icon: 'w-5 h-5',
  },
};

export function TierBadge({
  tier,
  showIcon = true,
  size = 'md',
  className = '',
}: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const sizeClasses = SIZE_CLASSES[size];
  const Icon = config.icon;

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 
        ${config.bgColor} ${config.borderColor} ${config.color}
        border rounded-full font-medium
        ${sizeClasses.container}
        ${className}
      `}
    >
      {showIcon && <Icon className={sizeClasses.icon} />}
      <span>{config.label}</span>
    </div>
  );
}
