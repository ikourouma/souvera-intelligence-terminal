import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { Target, Globe, Shield, ArrowRight } from 'lucide-react';
import { organizationSchema, generateJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'About | Souvera',
  description: 'Souvera provides institutional-grade macroeconomic intelligence for African and Caribbean markets. Engineered by Afronovation, Inc.',
  openGraph: {
    title: 'About | Souvera',
    description: 'Souvera provides institutional-grade macroeconomic intelligence for African and Caribbean markets.',
    url: 'https://souvera.vercel.app/about',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/about',
  },
};

const VALUES = [
  {
    title: 'Transparency',
    desc: 'Data sourced from official institutions including IMF, World Bank, and regional development banks.',
    icon: Shield,
  },
  {
    title: 'Regional Focus',
    desc: 'Comprehensive coverage bridging African and Caribbean markets for transatlantic insight.',
    icon: Globe,
  },
  {
    title: 'Institutional Grade',
    desc: 'Intelligence designed for governments, development finance institutions, and global enterprises.',
    icon: Target,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateJsonLd(organizationSchema) }}
      />
      <SouveraMegaNav />

      <section className="pt-24 pb-20 border-b border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] -mr-96 -mt-96" />
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
              About Souvera
            </div>
            <h1
              className="text-5xl md:text-6xl font-bold tracking-tight mb-8 leading-[1.05]"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Institutional Intelligence for Emerging Markets.
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl">
              Souvera provides comprehensive macroeconomic intelligence for African and Caribbean markets, enabling informed decision-making for institutions operating in these regions.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#121821]/30">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-7">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-6">
                Our Purpose
              </div>
              <h2
                className="text-3xl font-bold mb-8 leading-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Bringing clarity to African and Caribbean markets.
              </h2>
              <div className="space-y-6 text-zinc-400 leading-relaxed">
                <p>
                  African and Caribbean economies represent significant global opportunities, yet comprehensive, accessible market intelligence has remained fragmented. Souvera addresses this gap by aggregating official data from international institutions into a unified platform.
                </p>
                <p>
                  We serve development finance institutions, governments, investors, and enterprises who require reliable data for strategic decision-making in these markets. Our coverage spans macroeconomic indicators, sector analysis, and regional trade data.
                </p>
                <p>
                  Souvera is engineered by Afronovation, Inc., with a commitment to transparency about our data sources and methodology.
                </p>
              </div>
            </div>
            <div className="lg:col-span-5 grid grid-cols-1 gap-6">
              {VALUES.map((v) => {
                const Icon = v.icon;
                return (
                  <div
                    key={v.title}
                    className="p-8 bg-[#0B0F14] border border-zinc-800 rounded-sm hover:border-blue-600/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-sm bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-500" />
                      </div>
                      <h3
                        className="text-xl font-bold"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        {v.title}
                      </h3>
                    </div>
                    <p className="text-sm text-zinc-500 leading-relaxed">{v.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Data Foundation
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Our intelligence is built on official data from the International Monetary Fund, World Bank, African Development Bank, Caribbean Development Bank, and national statistical agencies.
              </p>
              <Link
                href="/resources/data-sources"
                className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-blue-500 hover:text-blue-400"
              >
                View Data Sources
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div>
              <h2
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Engineered by Afronovation
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Souvera is a product of Afronovation, Inc., a technology company focused on building infrastructure for African and Caribbean market transparency.
              </p>
              <a
                href="https://www.afronovation.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-blue-500 hover:text-blue-400"
              >
                Visit Afronovation
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center">
          <h2
            className="text-3xl font-bold mb-6"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Ready to explore Souvera?
          </h2>
          <p className="text-zinc-400 mb-10 max-w-lg mx-auto">
            Request access to explore our intelligence platform, or contact us to discuss your specific requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/access/request-access"
              className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
            >
              Request Access
            </Link>
            <Link
              href="/contact"
              className="px-10 py-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
