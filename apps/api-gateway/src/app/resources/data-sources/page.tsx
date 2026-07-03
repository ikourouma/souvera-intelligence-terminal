import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { PublicPageHero } from '@/components/marketing/PublicPageHero';
import { DataConfidenceTiers } from '@/components/resources/DataConfidenceTiers';
import { Database, Globe, Building2, Landmark, ArrowRight, ExternalLink, BarChart3, Ship, Wheat, Clock, CheckCircle2, AlertCircle, Radio } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Data Sources | Souvera',
  description: 'Documentation of Souvera data sources: ITC Trade Data Monitor, UN Comtrade, IMF, World Bank, BEA, USDA GATS, and official national statistics.',
  keywords: ['Souvera data sources', 'trade data', 'UN Comtrade', 'ITC data', 'Africa economic data', 'Caribbean economic data'],
  openGraph: {
    title: 'Data Sources | Souvera',
    description: 'Documentation of Souvera data sources including UN Comtrade, ITC Trade Map, and regional development banks.',
    url: 'https://souvera.vercel.app/resources/data-sources',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/resources/data-sources',
  },
};

// Last page update timestamp
const PAGE_LAST_UPDATED = 'July 2026';

const DATA_SOURCES = [
  {
    name: 'ITC Trade Data Monitor',
    description: 'International Trade Centre\'s comprehensive trade statistics platform. Primary source for bilateral trade flows, market access indicators, and export potential analysis.',
    coverage: 'Global',
    dataTypes: ['Bilateral Trade', 'Market Access', 'Export Potential', 'Trade Indicators'],
    url: 'https://trademap.org',
    icon: BarChart3,
    color: '#3B82F6',
    updateFrequency: 'Quarterly',
    latestData: '2023',
  },
  {
    name: 'UN Comtrade',
    description: 'United Nations international trade statistics database. Authoritative source for HS-coded trade flows between countries, used globally by governments and institutions.',
    coverage: 'Global',
    dataTypes: ['HS Trade Codes', 'Import/Export Values', 'Trade Partners', 'Commodity Flows'],
    url: 'https://comtradeplus.un.org',
    icon: Ship,
    color: '#22C55E',
    updateFrequency: 'Annual (6-18mo lag)',
    latestData: '2023',
  },
  {
    name: 'US Bureau of Economic Analysis (BEA)',
    description: 'Official US government trade statistics. Source for US import/export data, trade balances, and bilateral trade relationships.',
    coverage: 'United States',
    dataTypes: ['US Imports', 'US Exports', 'Trade Balance', 'Services Trade'],
    url: 'https://www.bea.gov/data/intl-trade-investment',
    icon: Building2,
    color: '#EF4444',
    updateFrequency: 'Monthly',
    latestData: '2024',
  },
  {
    name: 'USDA Global Agricultural Trade System',
    description: 'US Department of Agriculture trade data for agricultural commodities. Essential for food security and agricultural trade analysis.',
    coverage: 'Global',
    dataTypes: ['Agricultural Trade', 'Commodity Exports', 'Food Security', 'Farm Products'],
    url: 'https://apps.fas.usda.gov/gats',
    icon: Wheat,
    color: '#F59E0B',
    updateFrequency: 'Monthly',
    latestData: '2024',
  },
  {
    name: 'International Monetary Fund (IMF)',
    description: 'Primary source for macroeconomic indicators including GDP, inflation rates, fiscal balances, and economic projections.',
    coverage: 'Global',
    dataTypes: ['GDP', 'Inflation', 'Fiscal Balance', 'Economic Projections'],
    url: 'https://www.imf.org/en/Data',
    icon: Globe,
    color: '#8B5CF6',
    updateFrequency: 'Bi-annual',
    latestData: '2024',
  },
  {
    name: 'World Bank',
    description: 'Development indicators, foreign direct investment data, infrastructure scores, and sector-specific analysis for emerging markets.',
    coverage: 'Global',
    dataTypes: ['FDI', 'Infrastructure', 'Development Indicators', 'Sector Data'],
    url: 'https://data.worldbank.org',
    icon: Building2,
    color: '#06B6D4',
    updateFrequency: 'Annual',
    latestData: '2023',
  },
  {
    name: 'UNCTAD',
    description: 'United Nations trade and investment statistics, FDI flows, commodity prices, and global value chain analysis.',
    coverage: 'Global',
    dataTypes: ['FDI Statistics', 'Investment Flows', 'Commodity Data', 'Trade Facilitation'],
    url: 'https://unctad.org/statistics',
    icon: Globe,
    color: '#A78BFA',
    updateFrequency: 'Annual',
    latestData: '2023',
  },
  {
    name: 'African Development Bank',
    description: 'Regional economic outlook, country assessments, and sector analysis specific to African markets.',
    coverage: 'Africa',
    dataTypes: ['Regional Outlook', 'Country Assessments', 'Infrastructure Data'],
    url: 'https://www.afdb.org/en/knowledge/statistics',
    icon: Landmark,
    color: '#10B981',
    updateFrequency: 'Annual',
    latestData: '2024',
  },
  {
    name: 'Caribbean Development Bank',
    description: 'Caribbean economic reports, regional development data, and country-specific analysis.',
    coverage: 'Caribbean',
    dataTypes: ['Regional Reports', 'Tourism Data', 'Trade Statistics'],
    url: 'https://www.caribank.org',
    icon: Landmark,
    color: '#14B8A6',
    updateFrequency: 'Annual',
    latestData: '2024',
  },
  {
    name: 'US Census Bureau — International Trade',
    description:
      'Official US merchandise trade statistics used in dual-source reconciliation with USITC for AGOA flows and preferential trade analysis.',
    coverage: 'United States',
    dataTypes: ['Merchandise Trade', 'Country Totals', 'Dual-Source Reconciliation', 'AGOA Flows'],
    url: 'https://www.census.gov/foreign-trade/',
    icon: BarChart3,
    color: '#6366F1',
    updateFrequency: 'Monthly',
    latestData: '2024',
  },
  {
    name: 'US International Trade Commission',
    description: 'Source for AGOA and trade preference program data, tariff schedules, and trade remedy information.',
    coverage: 'United States',
    dataTypes: ['AGOA Data', 'Tariff Schedules', 'Trade Preferences', 'HTS Codes'],
    url: 'https://dataweb.usitc.gov',
    icon: Database,
    color: '#EC4899',
    updateFrequency: 'Monthly',
    latestData: '2024',
  },
  {
    name: 'GDELT Project — News Pulse',
    description:
      'Global event and news signal feed for market-moving headlines, policy shifts, and regional risk context across African and Caribbean markets.',
    coverage: 'Global',
    dataTypes: ['News Signals', 'Event Detection', 'Policy Context', 'Risk Monitoring'],
    url: 'https://www.gdeltproject.org',
    icon: Radio,
    color: '#DC2626',
    updateFrequency: 'Hourly',
    latestData: 'Live',
  },
];

export default function DataSourcesPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      <PublicPageHero
        label="Resources"
        title="Data Sources."
        description="Authoritative documentation of the institutional feeds, government agencies, and development banks that power Souvera intelligence. For the technical source registry used in ingestion pipelines, see the source registry."
        lastUpdated={PAGE_LAST_UPDATED}
        ctas={[
          { href: '/insights/methodology', label: 'View methodology', variant: 'primary' },
          { href: '/platform', label: 'Platform overview', variant: 'secondary' },
        ]}
      />

      <section className="py-8 border-b border-zinc-800 bg-zinc-900/20">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <p className="text-sm text-zinc-500 max-w-3xl">
            This page is the public data-sources documentation. The{' '}
            <Link href="/resources/source-registry" className="text-blue-500 hover:text-blue-400 underline">
              source registry
            </Link>{' '}
            lists internal ingestion keys and attribution metadata used by the data foundation pipeline.
          </p>
        </div>
      </section>

      {/* Data Vintage Explanation */}
      <section className="py-12 border-b border-zinc-800 bg-zinc-900/30">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex items-start gap-4 mb-8">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg shrink-0">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Understanding Data Vintage
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
                International trade statistics have an inherent publication lag of 12-24 months. This is industry standard across all major trade intelligence platforms including ITC, Bloomberg, and S&P Global.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-[#121821] border border-zinc-800 rounded-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  What&apos;s Current (2026)
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>• Souvera analysis and scoring algorithms</li>
                <li>• Trade preference status (AGOA, CBTPA eligibility)</li>
                <li>• Policy context and regulatory environment</li>
                <li>• Investment thesis and strategic recommendations</li>
                <li>• Risk assessments and opportunity ratings</li>
              </ul>
            </div>

            <div className="p-8 bg-[#121821] border border-zinc-800 rounded-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Source Data (Latest Available)
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>• Trade flow volumes (typically 2023)</li>
                <li>• Market share calculations</li>
                <li>• Bilateral trade statistics</li>
                <li>• Competitor positioning data</li>
                <li>• Infrastructure and capacity indices</li>
              </ul>
            </div>
          </div>

          <p className="mt-8 text-sm text-zinc-500 leading-relaxed max-w-4xl">
            <strong className="text-zinc-300">Why this matters:</strong> Structural trade patterns—market shares, competitive positioning, infrastructure scores—change gradually over time. Data from 2023 remains highly relevant for strategic decision-making because trade relationships are inherently stable. Our analysis layer adds current policy context and forward-looking insights.
          </p>
        </div>
      </section>

      {/* Data Sources Grid */}
      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Primary Data Sources
          </h2>
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
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm"
                        style={{ background: `${source.color}15`, color: source.color }}
                      >
                        {source.coverage}
                      </span>
                    </div>
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {source.name}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                    {source.description}
                  </p>
                  
                  {/* Update Frequency and Latest Data */}
                  <div className="flex items-center gap-4 mb-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-zinc-400">{source.updateFrequency}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">Latest:</span>
                      <span className="text-emerald-400 font-medium">{source.latestData}</span>
                    </div>
                  </div>
                  
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

      <DataConfidenceTiers />

      {/* Data Quality Standards */}
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
                We prioritize official sources with established methodologies and regular publication schedules. Our data pipeline continuously monitors source updates and incorporates new data as it becomes available.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Souvera clearly distinguishes between <strong className="text-white">curated data</strong> (hand-verified from primary sources), <strong className="text-white">estimated data</strong> (derived from regional benchmarks), and <strong className="text-white">projected data</strong> (forward-looking estimates). This tiered approach ensures transparency about data confidence levels.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                For emerging markets where official data may be limited, we apply conservative estimation methodologies and clearly indicate data quality tiers (A, B, C) throughout the platform.
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
