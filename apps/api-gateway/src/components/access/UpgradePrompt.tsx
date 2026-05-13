'use client';

import Link from 'next/link';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  currentPlan?: string;
  suggestedPlan?: string;
  variant?: 'inline' | 'card' | 'banner';
  className?: string;
}

export function UpgradePrompt({
  feature,
  currentPlan = 'Explorer',
  suggestedPlan = 'Professional',
  variant = 'card',
  className = '',
}: UpgradePromptProps) {
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Lock className="w-4 h-4 text-zinc-500" />
        <span className="text-zinc-400">
          {feature} requires{' '}
          <Link href="/access" className="text-blue-500 hover:text-blue-400 font-medium">
            {suggestedPlan}
          </Link>
        </span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-sm p-4 ${className}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-sm">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">{feature}</p>
              <p className="text-zinc-400 text-sm">
                Upgrade to {suggestedPlan} to unlock this feature
              </p>
            </div>
          </div>
          <Link
            href="/access"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-sm transition-colors"
          >
            Upgrade
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Default: card variant
  return (
    <div className={`bg-zinc-900/50 border border-zinc-800 rounded-sm p-6 text-center ${className}`}>
      <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-800 rounded-full mb-4">
        <Lock className="w-6 h-6 text-zinc-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{feature}</h3>
      <p className="text-zinc-400 text-sm mb-4">
        This feature is available on {suggestedPlan} and above.
        {currentPlan && (
          <span className="block mt-1 text-zinc-500">
            Your current plan: {currentPlan}
          </span>
        )}
      </p>
      <Link
        href="/access"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-sm transition-colors"
      >
        View Plans
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

interface GatedContentProps {
  children: React.ReactNode;
  hasAccess: boolean;
  feature: string;
  suggestedPlan?: string;
  fallback?: React.ReactNode;
}

export function GatedContent({
  children,
  hasAccess,
  feature,
  suggestedPlan = 'Professional',
  fallback,
}: GatedContentProps) {
  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-10 flex items-end justify-center pb-8">
        <UpgradePrompt feature={feature} suggestedPlan={suggestedPlan} variant="inline" />
      </div>
      <div className="opacity-20 blur-sm pointer-events-none">
        {children}
      </div>
    </div>
  );
}
