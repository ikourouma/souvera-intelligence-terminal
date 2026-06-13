/**
 * UpgradePrompt Component
 * 
 * Modal/banner component that displays when user doesn't have required access.
 * Shows feature benefits, tier comparison, and upgrade CTA.
 * 
 * @example
 * <UpgradePrompt
 *   feature="Trade Intelligence"
 *   requiredTier="business"
 *   featureDescription="Access comprehensive trade data, AGOA tracking, and import/export intelligence."
 * />
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useEntitlements } from '@/hooks/useEntitlements';
import { AccessTier, PLAN_RANKS } from '@souvera/entitlements';
import { Lock, TrendingUp, ArrowRight, X } from 'lucide-react';

interface UpgradePromptProps {
  /** Name of the feature being gated */
  feature?: string;
  
  /** Minimum tier required to access this feature */
  requiredTier: AccessTier;
  
  /** Optional description of what the feature provides */
  featureDescription?: string;
  
  /** Display mode: 'modal' | 'banner' | 'card' */
  mode?: 'modal' | 'banner' | 'card';
  
  /** Optional custom CTA text */
  ctaText?: string;
  
  /** Optional callback when modal is closed */
  onClose?: () => void;
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

const TIER_FEATURES: Record<AccessTier, string[]> = {
  explorer: [
    'Interactive intelligence hub',
    'Basic market insights',
    'Country comparison tools',
  ],
  professional: [
    'Full macro data access',
    'Sector analysis',
    'Policy trackers',
    'FX metrics',
  ],
  business: [
    'Trade intelligence suite',
    'AGOA, AfCFTA, CBTPA tracking',
    'Import/export data',
    '1 country report per month',
  ],
  investor: [
    'Supply-Demand Matrix',
    'Investment thesis',
    'Forecast metrics',
    '5 country reports per month',
  ],
  institutional: [
    'Full platform access',
    'API access',
    'Unlimited exports',
    'Unlimited reports',
  ],
  public: [],
  platform_admin: [],
  super_admin: [],
};

export function UpgradePrompt({
  feature = 'This feature',
  requiredTier,
  featureDescription,
  mode = 'modal',
  ctaText,
  onClose,
}: UpgradePromptProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { currentTier } = useEntitlements();

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen && mode === 'modal') return null;

  const tierName = TIER_NAMES[requiredTier] || requiredTier;
  const requiredRank = PLAN_RANKS[requiredTier] || 0;
  const currentRank = currentTier ? PLAN_RANKS[currentTier] : 0;
  const features = TIER_FEATURES[requiredTier] || [];

  const defaultCta = currentRank === 0
    ? 'Start Free Trial'
    : `Upgrade to ${tierName}`;

  if (mode === 'banner') {
    return (
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-indigo-500/20 rounded-lg flex-shrink-0">
            <Lock className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {feature} requires {tierName}
            </h3>
            {featureDescription && (
              <p className="text-sm text-zinc-400 mb-3">{featureDescription}</p>
            )}
            <Link
              href="/access"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              {ctaText || defaultCta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'card') {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/20 rounded-full mb-4">
            <Lock className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Unlock {feature}
          </h3>
          <p className="text-sm text-zinc-400">
            Upgrade to {tierName} to access this feature
          </p>
        </div>

        {featureDescription && (
          <p className="text-sm text-zinc-300 mb-4 pb-4 border-b border-zinc-800">
            {featureDescription}
          </p>
        )}

        {features.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              {tierName} includes:
            </p>
            <ul className="space-y-2">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href="/access"
          className="block w-full text-center px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium transition-colors"
        >
          {ctaText || defaultCta}
        </Link>
      </div>
    );
  }

  // Modal mode
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Lock className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Upgrade Required
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-base text-zinc-300 mb-4">
            <span className="font-semibold text-white">{feature}</span> is available with the{' '}
            <span className="font-semibold text-indigo-400">{tierName}</span> plan and above.
          </p>

          {featureDescription && (
            <p className="text-sm text-zinc-400 mb-6 pb-6 border-b border-zinc-800">
              {featureDescription}
            </p>
          )}

          {features.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                {tierName} plan includes:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/access"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-medium transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              {ctaText || defaultCta}
            </Link>
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white font-medium transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
