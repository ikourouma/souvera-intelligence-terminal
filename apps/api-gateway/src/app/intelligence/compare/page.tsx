import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { GitCompare, BarChart3, Download, Filter, ArrowRight } from 'lucide-react';
import { CountryComparisonTool } from '@/components/intelligence/CountryComparisonTool';

export const metadata: Metadata = {
  title: 'Country Comparison | Side-by-Side Analysis | Souvera',
  description: 'Compare economic indicators across African and Caribbean markets. GDP, growth rates, sector composition, and investment metrics side-by-side.',
  keywords: ['country comparison', 'market comparison', 'economic indicators', 'Africa comparison', 'Caribbean comparison', 'GDP comparison'],
  openGraph: {
    title: 'Country Comparison | Souvera',
    description: 'Compare economic indicators across African and Caribbean markets. Side-by-side analysis powered by curated preview data.',
    url: 'https://souvera.vercel.app/intelligence/compare',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/intelligence/compare',
  },
};

const COMPARISON_FEATURES = [
  {
    title: '2-Country Comparison',
    description: 'Side-by-side comparison of headline metrics including GDP, growth rates, and sector composition.',
    tier: 'Explorer',
    color: '#22C55E',
  },
  {
    title: 'Multi-Country Analysis',
    description: 'Compare multiple markets simultaneously with extended indicator sets and historical trends.',
    tier: 'Professional',
    color: '#3B82F6',
  },
  {
    title: 'Custom Indicators',
    description: 'Select specific indicators and metrics based on your analysis requirements.',
    tier: 'Professional',
    color: '#3B82F6',
  },
  {
    title: 'Exportable Reports',
    description: 'Export comparison data and visualizations for presentations and client briefings.',
    tier: 'Institutional',
    color: '#A78BFA',
  },
];

const COMPARIBLE_METRICS = [
  'GDP and GDP growth rates',
  'Sector composition and contribution',
  'Trade metrics and export concentration',
  'Risk indicators and debt ratios',
  'Signal scores (Professional+)',
  'Investment climate indicators',
];

const USE_CASES = [
  'Market prioritization and opportunity ranking',
  'Portfolio allocation support',
  'Due diligence benchmarking',
  'Client presentation materials',
];

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      <section className="pt-24 pb-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
              Intelligence
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Country Comparison.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Markets compared. The Souvera comparison tool enables side-by-side analysis of economic indicators across African and Caribbean markets.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <CountryComparisonTool />
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="mb-12">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              What You Can Compare
            </h2>
            <p className="text-zinc-400 max-w-3xl">
              All comparisons use the same source data and time periods to ensure validity. We do not mix data vintages.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPARIBLE_METRICS.map((metric) => (
              <div
                key={metric}
                className="flex items-center gap-3 p-4 bg-[#121821] border border-zinc-800 rounded-sm"
              >
                <BarChart3 className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="text-sm text-zinc-400">{metric}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="mb-12">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Comparison Features by Access Tier
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COMPARISON_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-8 bg-[#121821] border border-zinc-800 rounded-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-xl font-bold"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {feature.title}
                  </h3>
                  <span
                    className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm"
                    style={{ background: `${feature.color}15`, color: feature.color, border: `1px solid ${feature.color}30` }}
                  >
                    {feature.tier}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Use Cases
              </h2>
              <div className="space-y-3">
                {USE_CASES.map((useCase) => (
                  <div
                    key={useCase}
                    className="flex items-start gap-3 p-4 bg-[#121821] border border-zinc-800 rounded-sm"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <p className="text-sm text-zinc-400">{useCase}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Comparison Methodology
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                All comparisons use the same source data and time periods to ensure valid analysis. We do not mix data vintages or apply inconsistent methodologies across markets.
              </p>
              <p className="text-zinc-400 leading-relaxed mb-6">
                When comparing markets, source data availability may vary. We clearly indicate where data is unavailable rather than using estimates.
              </p>
              <Link
                href="/insights/methodology"
                className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-blue-500 hover:text-blue-400"
              >
                View Methodology
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
              Access Country Comparison
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-8">
              Comparison functionality is available across Explorer, Professional, and Institutional tiers with increasing capabilities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/access/request-access"
                className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
              >
                Request Access
              </Link>
              <Link
                href="/insights/methodology"
                className="px-10 py-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
              >
                View Methodology
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
