'use client';

import Link from 'next/link';
import { ArrowRight, Shield, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AccessCTABlockProps {
  region: 'africa' | 'caribbean';
  headline?: string;
  subheadline?: string;
}

export function AccessCTABlock({
  region,
  headline,
  subheadline,
}: AccessCTABlockProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setLoading(false);
    }
    checkAuth();
  }, []);

  const defaultHeadline =
    region === 'africa'
      ? 'Access Africa Intelligence'
      : 'Access Caribbean Intelligence';

  const defaultSubheadline =
    'From market screening to investment memos — get the institutional-grade intelligence you need.';

  const accentBgClass = region === 'africa' ? 'bg-blue-600' : 'bg-teal-600';
  const accentHoverClass = region === 'africa' ? 'hover:bg-blue-700' : 'hover:bg-teal-700';

  return (
    <section className="py-24">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className={`relative overflow-hidden ${accentBgClass} rounded-sm p-12 lg:p-16`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }} />
          </div>

          {/* Content */}
          <div className="relative max-w-3xl mx-auto text-center">
            <h2
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {headline || defaultHeadline}
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              {subheadline || defaultSubheadline}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {loading ? (
                <div className="h-14 bg-white/20 w-48 rounded-sm animate-pulse" />
              ) : isAuthenticated ? (
                <Link
                  href="/access"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-900 rounded-sm font-bold hover:bg-zinc-100 transition-all shadow-lg"
                >
                  Upgrade Plan
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/access/request-access"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-900 rounded-sm font-bold hover:bg-zinc-100 transition-all shadow-lg"
                >
                  Request Access
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              <Link
                href="/access"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-sm font-semibold hover:bg-white/20 transition-all"
              >
                View Plans
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Institutional-Grade Data</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Bloomberg/McKinsey Standard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
