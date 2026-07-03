'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, CheckCircle, ArrowUp, Loader2 } from 'lucide-react';

type AccessLevel = 'public' | 'explorer' | 'professional' | 'business' | 'institutional';

interface UserAccess {
  authenticated: boolean;
  planId?: string;
  rank?: number;
}

interface SmartAccessButtonProps {
  requiredLevel?: AccessLevel;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
  showWhenAuthorized?: boolean;
}

const PLAN_RANKS: Record<string, number> = {
  public: 0,
  explorer: 1,
  professional: 2,
  business: 3,
  investor: 4,
  institutional: 5,
  platform_admin: 99,
  super_admin: 100,
};

const UPGRADE_MESSAGES: Record<AccessLevel, string> = {
  public: 'Request Access',
  explorer: 'Upgrade to Professional',
  professional: 'Upgrade to Business',
  business: 'Upgrade to Institutional',
  institutional: 'Contact Sales',
};

export function SmartAccessButton({
  requiredLevel = 'professional',
  variant = 'default',
  className = '',
  showWhenAuthorized = false,
}: SmartAccessButtonProps) {
  const [access, setAccess] = useState<UserAccess>({ authenticated: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const response = await fetch('/api/v1/me');
        if (response.ok) {
          const data = await response.json();
          setAccess({
            authenticated: data.authenticated,
            planId: data.access?.planId,
            rank: data.access?.rank || PLAN_RANKS[data.access?.planId] || 0,
          });
        }
      } catch (error) {
        console.error('[SmartAccessButton] Error checking access:', error);
      } finally {
        setLoading(false);
      }
    }
    checkAccess();
  }, []);

  const requiredRank = PLAN_RANKS[requiredLevel] || 2;
  const userRank = access.rank || 0;
  const hasAccess = access.authenticated && userRank >= requiredRank;

  if (loading) {
    if (variant === 'compact') {
      return (
        <div className={`flex items-center gap-2 px-3 py-1.5 bg-zinc-800/60 border border-zinc-700/50 rounded-sm ${className}`}>
          <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
        </div>
      );
    }
    return null;
  }

  if (hasAccess) {
    if (!showWhenAuthorized) {
      return null;
    }
    
    if (variant === 'compact') {
      return (
        <div className={`flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-sm ${className}`}>
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">Full Access</span>
        </div>
      );
    }
    
    return (
      <div className={`flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-sm ${className}`}>
        <CheckCircle className="w-3 h-3" />
        You have full access
      </div>
    );
  }

  if (!access.authenticated) {
    const href = '/access/request-access';
    
    if (variant === 'compact') {
      return (
        <Link
          href={href}
          className={`flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${className}`}
        >
          <Lock className="w-3 h-3" />
          <span>Request Access</span>
        </Link>
      );
    }
    
    if (variant === 'inline') {
      return (
        <Link
          href={href}
          className={`text-blue-400 hover:text-blue-300 text-sm font-medium underline underline-offset-2 transition-colors ${className}`}
        >
          Request Access
        </Link>
      );
    }
    
    return (
      <Link
        href={href}
        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${className}`}
      >
        <Lock className="w-3 h-3" />
        Request Access
      </Link>
    );
  }

  const currentPlan = access.planId || 'explorer';
  const upgradeMessage = UPGRADE_MESSAGES[currentPlan as AccessLevel] || 'Upgrade Plan';
  const href = '/access';
  
  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className={`flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${className}`}
      >
        <ArrowUp className="w-3 h-3" />
        <span>Upgrade</span>
      </Link>
    );
  }
  
  if (variant === 'inline') {
    return (
      <Link
        href={href}
        className={`text-amber-400 hover:text-amber-300 text-sm font-medium underline underline-offset-2 transition-colors ${className}`}
      >
        {upgradeMessage}
      </Link>
    );
  }
  
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${className}`}
    >
      <ArrowUp className="w-3 h-3" />
      {upgradeMessage}
    </Link>
  );
}
