import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { SouveraMapWorkspaceWithUrl } from '@/components/intelligence/SouveraMapWorkspaceWithUrl';
import { RegionAwareMapHero } from '@/components/intelligence/RegionAwareMapHero';

export const metadata: Metadata = {
  title: 'Intelligence Map | Africa Intelligence Terminal | Souvera',
  description: 'Interactive Africa intelligence map with country profiles, economic indicators, and market intelligence. Explore 54 African markets with Souvera\'s executive-grade workspace.',
  openGraph: {
    title: 'Africa Intelligence Terminal | Souvera',
    description: 'Interactive Africa intelligence map with country profiles and market intelligence.',
    url: 'https://souvera.vercel.app/intelligence/map',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/intelligence/map',
  },
};

export default function MapPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      {/* Hero Section - Region-Aware */}
      <Suspense 
        fallback={
          <section className="pt-24 pb-10 border-b border-zinc-800">
            <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
              <div className="max-w-3xl">
                <div className="h-8 bg-zinc-800/30 w-32 rounded mb-4" />
                <div className="h-12 bg-zinc-800/30 w-full max-w-md rounded mb-4" />
                <div className="h-6 bg-zinc-800/30 w-full rounded" />
              </div>
            </div>
          </section>
        }
      >
        <RegionAwareMapHero />
      </Suspense>

      {/* Map Workspace Section */}
      <section className="py-8 lg:py-12">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <Suspense fallback={<div className="min-h-[600px] bg-zinc-950 rounded-xl border border-zinc-800" />}>
            <SouveraMapWorkspaceWithUrl defaultRegion="africa" />
          </Suspense>
        </div>
      </section>

      {/* Enhanced Access Section */}
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
              <Link
                href="/access/request-access"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] tracking-widest uppercase transition-all rounded-sm"
              >
                Request Access
              </Link>
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

      <SouveraFooter />
    </main>
  );
}
