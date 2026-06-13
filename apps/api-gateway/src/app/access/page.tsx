import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { Building2 } from 'lucide-react';
import { productSchema, generateJsonLd } from '@/lib/jsonld';
import { AccessPlanGrid } from '@/components/access/AccessPlanGrid';

export const metadata: Metadata = {
  title: 'Access Plans | Souvera',
  description: 'Souvera access plans: from free exploration to institutional enterprise solutions. Choose the tier that matches your intelligence requirements.',
  openGraph: {
    title: 'Access Plans | Souvera',
    description: 'Souvera access plans: from free exploration to institutional enterprise solutions.',
    url: 'https://souvera.vercel.app/access',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/access',
  },
};

export default function AccessPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateJsonLd(productSchema) }}
      />
      <SouveraMegaNav />

      <section className="pt-24 pb-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
              Access Plans
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Intelligence for Every Mandate.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              From public market overviews to institutional-grade API access. Choose the tier that matches your intelligence requirements.
            </p>
          </div>
        </div>
      </section>

      <section id="plans" className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <Suspense fallback={<div className="h-96 animate-pulse bg-zinc-900/50 rounded-sm" />}>
            <AccessPlanGrid />
          </Suspense>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="bg-[#121821] border border-zinc-800 rounded-sm p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-sm bg-purple-600/10 border border-purple-600/20 flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Enterprise & Institutional
                </h3>
                <p className="text-zinc-400 max-w-lg">
                  For development finance institutions, governments, and global enterprises requiring custom intelligence solutions.
                </p>
              </div>
            </div>
            <Link
              href="/access/institutional"
              className="px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm whitespace-nowrap"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
