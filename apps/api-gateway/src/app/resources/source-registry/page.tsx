import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { FileText, Globe, Landmark, Database, ArrowRight, ExternalLink, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Source Registry | Data Provenance | Souvera',
  description: 'Complete registry of data sources used across the Souvera platform. Source attribution, update frequency, and coverage metadata for African and Caribbean markets.',
  openGraph: {
    title: 'Source Registry | Souvera',
    description: 'Complete registry of data sources used across the Souvera platform.',
    url: 'https://souvera.vercel.app/resources/source-registry',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/resources/source-registry',
  },
};

const SOURCE_REGISTRY = [
  {
    name: 'International Monetary Fund (IMF)',
    coverage: 'Global',
    dataTypes: ['Macroeconomic', 'GDP', 'Inflation', 'Trade'],
    updateFrequency: 'Quarterly',
    status: 'Active',
    icon: Globe,
    color: '#3B82F6',
  },
  {
    name: 'World Bank',
    coverage: 'Global',
    dataTypes: ['Development', 'FDI', 'Poverty', 'Sector Data'],
    updateFrequency: 'Annual',
    status: 'Active',
    icon: Landmark,
    color: '#22C55E',
  },
  {
    name: 'African Development Bank',
    coverage: 'Africa',
    dataTypes: ['Regional', 'Infrastructure', 'Sector Analysis'],
    updateFrequency: 'Quarterly',
    status: 'Active',
    icon: Landmark,
    color: '#F59E0B',
  },
  {
    name: 'Caribbean Development Bank',
    coverage: 'Caribbean',
    dataTypes: ['Regional', 'Tourism', 'Trade'],
    updateFrequency: 'Annual',
    status: 'Active',
    icon: Landmark,
    color: '#06B6D4',
  },
  {
    name: 'United Nations (UNCTAD)',
    coverage: 'Global',
    dataTypes: ['Trade', 'Investment', 'Commodities'],
    updateFrequency: 'Annual',
    status: 'Active',
    icon: Globe,
    color: '#A78BFA',
  },
  {
    name: 'National Statistical Agencies',
    coverage: 'Country-specific',
    dataTypes: ['Census', 'National Accounts', 'Surveys'],
    updateFrequency: 'Varies',
    status: 'Partial',
    icon: Database,
    color: '#EC4899',
  },
];

export default function SourceRegistryPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      <section className="pt-24 pb-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
              Resources
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Source Registry.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Every source, documented. Souvera maintains a comprehensive registry of all data sources. This registry documents source attribution, coverage, update frequency, and data categories.
            </p>
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
              Active Data Sources
            </h2>
            <p className="text-zinc-400 max-w-3xl">
              All sources are official institutions with established methodologies and public data access. We do not use proprietary or unverified data sources.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {SOURCE_REGISTRY.map((source) => {
              const Icon = source.icon;
              return (
                <div
                  key={source.name}
                  className="p-6 bg-[#121821] border border-zinc-800 rounded-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-12 h-12 rounded-sm flex items-center justify-center shrink-0"
                        style={{ background: `${source.color}15`, border: `1px solid ${source.color}30` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: source.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-lg font-bold mb-1"
                          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                          {source.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {source.dataTypes.map((type) => (
                            <span
                              key={type}
                              className="text-[10px] font-mono px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-sm text-zinc-400"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 md:min-w-[400px]">
                      <div className="flex-1">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 mb-1">
                          Coverage
                        </div>
                        <div className="text-sm text-white">{source.coverage}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 mb-1">
                          Update Frequency
                        </div>
                        <div className="text-sm text-white">{source.updateFrequency}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 mb-1">
                          Status
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${source.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`} />
                          <span className="text-sm text-white">{source.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
                Source Metadata Standards
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                For each source, we track and maintain:
              </p>
              <div className="space-y-3">
                {[
                  'Source URL and official documentation',
                  'Last update timestamp',
                  'Geographic and sector coverage scope',
                  'Data categories and indicator types',
                  'Update frequency and publication schedule',
                  'Historical data availability',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <span className="text-sm text-zinc-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Data Gaps & Limitations
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We acknowledge data gaps common in emerging markets. Sources with incomplete coverage are clearly marked as "Partial" status.
              </p>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Where official data is unavailable or outdated, we clearly indicate this in our platform rather than presenting estimates as confirmed figures.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                We handle source changes and deprecations transparently, updating our registry when sources are modified or replaced.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800 bg-[#121821]/30">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Request Additional Sources
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-8">
              Need a source not listed in our registry? We evaluate requests for additional data sources based on institutional requirements. Contact us to discuss your data needs.
            </p>
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

      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Related Resources
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/resources/data-sources"
                className="px-10 py-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
              >
                View Data Sources
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
