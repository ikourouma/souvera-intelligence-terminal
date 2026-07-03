'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

interface UserAccess {
  authenticated: boolean;
  planId?: string;
  rank?: number;
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

export function AccessCTASection() {
  const [access, setAccess] = useState<UserAccess>({ authenticated: false });
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  
  const selectedCountry = searchParams.get('selected');
  
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
        console.error('[AccessCTASection] Error checking access:', error);
      } finally {
        setLoading(false);
      }
    }
    checkAccess();
  }, []);

  if (selectedCountry) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-12 lg:py-16 border-t border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="h-8 bg-zinc-800/30 w-64 rounded mb-4 animate-pulse" />
            <div className="h-6 bg-zinc-800/30 w-full rounded mb-6 animate-pulse" />
            <div className="h-12 bg-zinc-800/30 w-32 rounded animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  const hasFullAccess = access.authenticated && (access.rank || 0) >= PLAN_RANKS.professional;

  if (hasFullAccess) {
    return (
      <section className="py-12 lg:py-16 border-t border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <h2
                className="text-xl lg:text-2xl font-bold text-emerald-400"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Full Intelligence Access Enabled
              </h2>
            </div>
            <p className="text-zinc-400 leading-relaxed mb-6">
              You have access to advanced intelligence features including FDI data, full sector rationale, investment signals, and comprehensive country narratives. Select any country above to explore.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/intelligence/africa"
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] tracking-widest uppercase transition-all rounded-sm"
              >
                Explore Africa
              </Link>
              <Link
                href="/intelligence/caribbean"
                className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-[11px] tracking-widest uppercase transition-all rounded-sm"
              >
                Explore Caribbean
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16 border-t border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="max-w-3xl">
          <h2
            className="text-xl lg:text-2xl font-bold mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Enhanced Intelligence Access
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-6">
            Advanced intelligence features including FDI data, full sector rationale, investment signals, and comprehensive country narratives are available to Professional and Business tier users.
          </p>
          <div className="flex flex-wrap gap-4">
            {access.authenticated ? (
              <Link
                href="/access"
                className="px-8 py-4 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 font-bold text-[11px] tracking-widest uppercase transition-all rounded-sm"
              >
                Upgrade to Professional
              </Link>
            ) : (
              <Link
                href="/access/request-access"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] tracking-widest uppercase transition-all rounded-sm"
              >
                Request Access
              </Link>
            )}
            <Link
              href="/intelligence/africa"
              className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-[11px] tracking-widest uppercase transition-all rounded-sm"
            >
              Africa Regional Overview
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
