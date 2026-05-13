import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { Database, Globe, Building2, Landmark, ArrowRight, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Data Sources | Souvera',
  description: 'Documentation of Souvera data sources: IMF, World Bank, African Development Bank, Caribbean Development Bank, and official national statistics.',
  keywords: ['Souvera data sources', 'IMF data', 'World Bank data', 'Africa economic data', 'Caribbean economic data'],
  openGraph: {
    title: 'Data Sources | Souvera',
    description: 'Documentation of Souvera data sources including IMF, World Bank, and regional development banks.',
    url: 'https://souvera.vercel.app/resources/data-sources',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/resources/data-sources',
  },
};

const DATA_SOURCES = [
  {
    name: 'International Monetary Fund (IMF)',
    description: 'Primary source for macroeconomic indicators including GDP, inflation rates, fiscal balances, and economic projections.',
    coverage: 'Global',
    dataTypes: ['GDP', 'Inflation', 'Fiscal Balance', 'Trade', 'Economic Projections'],
    url: 'https://www.imf.org/en/Data',
    icon: Globe,
    color: '#3B82F6',
  },
  {
    name: 'World Bank',
    description: 'Development indicators, foreign direct investment data, poverty metrics, and sector-specific analysis.',
    coverage: 'Global',
    dataTypes: ['FDI', 'Development Indicators', 'Poverty Metrics', 'Sector Data'],
    url: 'https://data.worldbank.org',
    icon: Building2,
    color: '#22C55E',
  },
  {
    name: 'African Development Bank',
    description: 'Regional economic outlook, country assessments, and sector analysis specific to African markets.',
    coverage: 'Africa',
    dataTypes: ['Regional Outlook', 'Country Assessments', 'Infrastructure Data'],
    url: 'https://www.afdb.org/en/knowledge/statistics',
    icon: Landmark,
    color: '#F59E0B',
  },
  {
    name: 'Caribbean Development Bank',
    description: 'Caribbean economic reports, regional development data, and country-specific analysis.',
    coverage: 'Caribbean',
    dataTypes: ['Regional Reports', 'Tourism Data', 'Trade Statistics'],
    url: 'https://www.caribank.org',
    icon: Landmark,
    color: '#06B6D4',
  },
  {
    name: 'UNCTAD',
    description: 'United Nations trade and investment statistics, commodity prices, and global value chain analysis.',
    coverage: 'Global',
    dataTypes: ['Trade Statistics', 'Investment Flows', 'Commodity Data'],
    url: 'https://unctad.org/statistics',
    icon: Globe,
    color: '#A78BFA',
  },
  {
    name: 'National Statistical Agencies',
    description: 'Official statistics from national agencies where available, including census data and national accounts.',
    coverage: 'Country-specific',
    dataTypes: ['Census Data', 'National Accounts', 'Survey Data'],
    url: '#',
    icon: Database,
    color: '#EC4899',
  },
];

export default function DataSourcesPage() {
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
              Data Sources.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Souvera intelligence is built on official data from international institutions and national statistical agencies. We prioritize transparency about our sources.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DATA_SOURCES.map((source) => {
              const Icon = source.icon;
              return (
                <div
                  key={source.name}
                  className="p-8 bg-[#121821] border border-zinc-800 rounded-sm"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="w-12 h-12 rounded-sm flex items-center justify-center"
                      style={{ background: `${source.color}15`, border: `1px solid ${source.color}30` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: source.color }} />
                    </div>
                    <span
                      className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm"
                      style={{ background: `${source.color}15`, color: source.color }}
                    >
                      {source.coverage}
                    </span>
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {source.name}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                    {source.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {source.dataTypes.map((type) => (
                      <span
                        key={type}
                        className="text-[10px] font-mono px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-sm text-zinc-400"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  {source.url !== '#' && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-zinc-400 hover:text-white transition-colors"
                    >
                      Visit Source
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              );
            })}
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
              Data Quality Standards
            </h2>
            <div className="space-y-4 mb-8">
              <p className="text-zinc-400 leading-relaxed">
                We prioritize official sources with established methodologies and regular publication schedules. Where official data is unavailable or outdated, we clearly indicate this in our platform.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Souvera does not present estimates or projections as confirmed figures. We acknowledge the data limitations common in emerging markets and frontier economies.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/insights/methodology"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
              >
                View Methodology
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
