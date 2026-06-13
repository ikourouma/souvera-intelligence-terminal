'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import { countryDisplayName, isFullTerminalPilot } from '@/lib/intelligence/country-names';
import {
  canAccessCountryTerminal,
  countryTerminalHref,
  exploreCountryHref,
  planRankFromTier,
} from '@/lib/intelligence/routing';

interface SectorKeyMarketsProps {
  iso3List: string[];
  accentText: string;
  accentBorder: string;
  sectorSlug: string;
}

interface UserAccess {
  authenticated: boolean;
  planRank: number;
  planId: string;
}

export function SectorKeyMarkets({
  iso3List,
  accentText,
  accentBorder,
  sectorSlug,
}: SectorKeyMarketsProps) {
  const [access, setAccess] = useState<UserAccess>({
    authenticated: false,
    planRank: 0,
    planId: 'public',
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/v1/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((me) => {
        setAccess({
          authenticated: me.authenticated === true,
          planRank: me.access?.rank ?? planRankFromTier(me.access?.planId),
          planId: me.access?.planId ?? 'public',
        });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const canOpenTerminal = canAccessCountryTerminal(access.authenticated, access.planRank);

  return (
    <section className="py-12 bg-zinc-900/30 border-t border-zinc-800/50">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Key markets</p>
            <p className="text-xs text-zinc-600">
              {loaded
                ? canOpenTerminal
                  ? 'Click a market to open country intelligence — depth scales with your plan.'
                  : 'Sign in with Explorer+ to open country terminals, or request access.'
                : 'Loading access…'}
            </p>
          </div>
          {!canOpenTerminal && loaded && (
            <Link
              href="/access/request-access"
              className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300"
            >
              Request access →
            </Link>
          )}
        </div>

        {iso3List.length === 0 ? (
          <p className="text-sm text-zinc-600 py-4">
            Key market profiles for this sector are being prepared.
          </p>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {iso3List.map((iso3, index) => {
            const name = countryDisplayName(iso3);
            const pilot = isFullTerminalPilot(iso3);
            const href = canOpenTerminal
              ? countryTerminalHref(iso3, { tab: 'sectors' })
              : exploreCountryHref({
                  iso3,
                  countryName: name,
                  isAuthenticated: access.authenticated,
                  planRank: access.planRank,
                  accessTier: access.planId,
                  source: `sector-${sectorSlug}`,
                });

            const statusLabel = canOpenTerminal
              ? pilot
                ? 'Full terminal'
                : 'Preview tier'
              : access.authenticated
                ? 'Upgrade to explore'
                : 'Explorer+ required';

            return (
              <Link
                key={iso3}
                href={href}
                className={`
                  group relative overflow-hidden rounded-sm border bg-zinc-950 p-4
                  transition-all duration-300 ease-out
                  hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30
                  ${accentBorder}
                  border-zinc-800 hover:border-opacity-100
                  animate-fade-in-up
                `}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none`}
                />
                <div className="relative flex flex-col gap-2 min-h-[72px]">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono text-zinc-600">{iso3}</span>
                    {canOpenTerminal ? (
                      pilot ? (
                        <Sparkles className={`w-3.5 h-3.5 ${accentText} shrink-0`} />
                      ) : (
                        <ArrowRight
                          className={`w-3.5 h-3.5 ${accentText} shrink-0 opacity-0 group-hover:opacity-100 transition-opacity`}
                        />
                      )
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white group-hover:text-zinc-100 leading-snug">
                    {name}
                  </span>
                  <span
                    className={`text-[9px] uppercase tracking-wider ${
                      canOpenTerminal && pilot ? accentText : 'text-zinc-600'
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}
