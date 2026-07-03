'use client';

import Link from 'next/link';
import { ArrowRight, UserPlus } from 'lucide-react';

type Props = {
  borderTop?: boolean;
};

export function TractionConversionCta({ borderTop = true }: Props) {
  return (
    <section className={`py-24 ${borderTop ? 'border-t border-zinc-800' : ''}`}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="relative overflow-hidden bg-blue-600 rounded-sm p-12 lg:p-16 text-center">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
          </div>
          <div className="relative max-w-3xl mx-auto">
            <h2
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Start with Explorer — free forever
            </h2>
            <p className="text-lg text-white/90 mb-10 leading-relaxed">
              No credit card. Full intelligence map and country macro data across 74 markets. Upgrade to
              Professional or Business when your team needs trade intelligence, reports, and API access.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-900 rounded-sm font-bold hover:bg-zinc-100 transition-all shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                Create free account
              </Link>
              <Link
                href="/access/request-access?plan=business"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-sm font-semibold hover:bg-white/20 transition-all"
              >
                Request Business access
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-sm text-white/70">
              Already have an account?{' '}
              <Link href="/login" className="text-white font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** @deprecated Use TractionConversionCta */
export const PlatformConversionCta = TractionConversionCta;
