import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { SouveraMapWorkspaceWithUrl } from '@/components/intelligence/SouveraMapWorkspaceWithUrl';
import { RegionAwareMapHero } from '@/components/intelligence/RegionAwareMapHero';
import { AccessCTASection } from '@/components/intelligence/AccessCTASection';

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
      <Suspense fallback={<div className="py-12 lg:py-16 border-t border-zinc-800" />}>
        <AccessCTASection />
      </Suspense>

      <SouveraFooter />
    </main>
  );
}
