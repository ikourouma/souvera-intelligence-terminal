/**
 * PaywallBanner Component
 * 
 * Inline upgrade prompt that can be placed within content.
 * Less intrusive than modal, more prominent than just hiding content.
 * 
 * @example
 * <PaywallBanner
 *   feature="Export Data"
 *   requiredTier="institutional"
 * />
 */

'use client';

import Link from 'next/link';
import { useEntitlements } from '@/hooks/useEntitlements';
import { AccessTier } from '@souvera/entitlements';
import { Lock, ArrowRight } from 'lucide-react';

interface PaywallBannerProps {
  feature: string;
  requiredTier: AccessTier;
  description?: string;
  className?: string;
}

const TIER_NAMES: Record<AccessTier, string> = {
  public: 'Public',
  explorer: 'Explorer',
  professional: 'Professional',
  business: 'Business',
  investor: 'Investor',
  institutional: 'Institutional',
  platform_admin: 'Platform Admin',
  super_admin: 'Super Admin',
};

export function PaywallBanner({
  feature,
  requiredTier,
  description,
  className = '',
}: PaywallBannerProps) {
  const { currentTier } = useEntitlements();
  
  const tierName = TIER_NAMES[requiredTier] || requiredTier;
  const isLoggedIn = currentTier && currentTier !== 'public';

  return (
    <div className={`bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-indigo-500/10 rounded-lg flex-shrink-0">
          <Lock className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {feature} · {tierName}+ Feature
          </h3>
          <p className="text-sm text-zinc-400 mb-4">
            {description || `Access ${feature} by upgrading to ${tierName} or higher.`}
          </p>
          <Link
            href="/access"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium transition-colors"
          >
            {isLoggedIn ? `Upgrade to ${tierName}` : 'View Plans'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
