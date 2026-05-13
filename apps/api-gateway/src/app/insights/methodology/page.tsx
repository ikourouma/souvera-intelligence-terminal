import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { Database, ShieldCheck, Scale, RefreshCw, ArrowRight, Brain } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Data Methodology | Souvera',
  description: 'Souvera data methodology: how we source, validate, and present macroeconomic intelligence for African and Caribbean markets.',
  openGraph: {
    title: 'Data Methodology | Souvera',
    description: 'Souvera data methodology: how we source, validate, and present macroeconomic intelligence.',
    url: 'https://souvera.vercel.app/insights/methodology',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/insights/methodology',
  },
};

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      <section className="pt-24 pb-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
              Data Methodology
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              How We Build Intelligence.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Souvera is built on a foundation of transparency and rigor. This page explains our approach to sourcing, validating, and presenting macroeconomic data.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Database,
                title: 'Official Data Sources',
                description:
                  'Our primary data comes from international institutions including the International Monetary Fund (IMF), World Bank, United Nations (UNCTAD), African Development Bank, and Caribbean Development Bank. We use official statistical agencies where available.',
              },
              {
                icon: ShieldCheck,
                title: 'Validation Process',
                description:
                  'All data undergoes cross-referencing against multiple sources. We flag discrepancies and clearly indicate data confidence levels. Historical revisions from official sources are tracked and reflected.',
              },
              {
                icon: Scale,
                title: 'Transparent Limitations',
                description:
                  'We acknowledge data gaps common in emerging markets. When official data is unavailable, we clearly indicate this. We do not present estimates or projections as confirmed figures.',
              },
              {
                icon: RefreshCw,
                title: 'Update Frequency',
                description:
                  'Macroeconomic indicators are updated as official sources publish new data, typically quarterly or annually depending on the metric. Market-moving data may be updated more frequently.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-8 bg-[#121821] border border-zinc-800 rounded-sm"
                >
                  <div className="w-12 h-12 rounded-sm bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-sm bg-purple-600/10 border border-purple-600/20 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2
                  className="text-2xl font-bold mb-3"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  AI in Our Process
                </h2>
                <p className="text-zinc-400 leading-relaxed">
                  We use governed AI-assisted analysis to support data quality review, anomaly flagging, source comparison, 
                  signal clustering, and executive briefing summarization. AI outputs are reviewed before publication and 
                  never replace official source data. AI does not make autonomous decisions, generate unsourced intelligence, 
                  or guarantee predictions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Primary Data Sources
            </h2>
            <div className="space-y-4">
              {[
                { name: 'International Monetary Fund (IMF)', type: 'Macroeconomic indicators, GDP, inflation, trade' },
                { name: 'World Bank', type: 'Development indicators, FDI, sector data' },
                { name: 'United Nations (UNCTAD)', type: 'Trade and investment statistics' },
                { name: 'African Development Bank', type: 'Regional economic outlook, sector analysis' },
                { name: 'Caribbean Development Bank', type: 'Caribbean economic reports, regional data' },
                { name: 'National Statistical Agencies', type: 'Country-specific official data where available' },
              ].map((source) => (
                <div
                  key={source.name}
                  className="flex items-start gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <div>
                    <div className="font-medium text-white">{source.name}</div>
                    <div className="text-sm text-zinc-500">{source.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Our Commitment
            </h2>
            <div className="prose prose-invert prose-sm">
              <p className="text-zinc-400 leading-relaxed mb-4">
                Souvera is engineered by Afronovation, Inc. with a commitment to data integrity and transparency. We do not make claims about data accuracy, latency, or coverage that we cannot substantiate.
              </p>
              <p className="text-zinc-400 leading-relaxed mb-8">
                If you have questions about our methodology or data sources, please contact us. We welcome feedback from the institutional community we serve.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
            >
              Contact Us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
