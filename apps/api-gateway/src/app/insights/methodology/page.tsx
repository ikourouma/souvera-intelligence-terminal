import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { PublicPageHero } from '@/components/marketing/PublicPageHero';
import {
  Database,
  ShieldCheck,
  Scale,
  RefreshCw,
  ArrowRight,
  Brain,
  GitBranch,
  Zap,
  Globe2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Data Methodology | Souvera',
  description:
    'Souvera data methodology: sourcing, validation, trade intelligence, signal engine, and data foundation pipeline for African and Caribbean markets.',
  openGraph: {
    title: 'Data Methodology | Souvera',
    description: 'How Souvera sources, validates, and presents macroeconomic and trade intelligence.',
    url: 'https://souvera.vercel.app/insights/methodology',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/insights/methodology',
  },
};

const PAGE_LAST_UPDATED = 'July 2026';

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      <PublicPageHero
        label="Insights"
        title="How We Build Intelligence."
        description="Our approach to sourcing, validating, and presenting macroeconomic and trade intelligence across 74 African and Caribbean markets."
        lastUpdated={PAGE_LAST_UPDATED}
        ctas={[
          { href: '/resources/data-sources', label: 'Data sources', variant: 'primary' },
          { href: '/signup', label: 'Create free account', variant: 'signup' },
        ]}
      />

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Database,
                title: 'Official Data Sources',
                description:
                  'Primary data comes from IMF, World Bank, UNCTAD, AfDB, CDB, US Census, USITC, and national statistical agencies. See the full registry on our data sources page.',
              },
              {
                icon: ShieldCheck,
                title: 'Validation Process',
                description:
                  'All data undergoes cross-referencing against multiple sources. Discrepancies are flagged and confidence levels (A/B/C) are assigned throughout the platform.',
              },
              {
                icon: Scale,
                title: 'Transparent Limitations',
                description:
                  'We acknowledge data gaps common in emerging markets. Estimates and projections are never presented without explicit tier labelling — confirmed, estimated, or projected.',
              },
              {
                icon: RefreshCw,
                title: 'Update Frequency',
                description:
                  'Macroeconomic indicators update as official sources publish — typically quarterly or annually. News signals and GDELT feeds refresh hourly where enabled.',
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
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800 bg-zinc-900/20">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="mb-10 max-w-3xl">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Trade Intelligence Methodology
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Trade modules apply governed ingestion, dual-source reconciliation, and explicit petroleum
              exclusion rules documented on each market terminal.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Scale,
                title: 'AGOA Product Flows',
                description:
                  'Preferential trade flows reconciled against US Census merchandise data and USITC DataWeb. Eligibility status and petroleum exclusions are surfaced transparently.',
              },
              {
                icon: GitBranch,
                title: 'Supply-Demand Matrix',
                description:
                  '74 markets × 8 sectors (592 cells). Export products are flow-backed where Census/USITC data exists; template-backed cells are labelled accordingly.',
              },
              {
                icon: Globe2,
                title: 'AfCETA Corridor Index',
                description:
                  '416 Africa ↔ Caribbean corridor signals with origin×destination evaluation, tier scoring, and Corridor Lab scenario analysis.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-sm"
                >
                  <Icon className="w-7 h-7 text-blue-500 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link
              href="/platform/signal-engine"
              className="group p-8 bg-[#121821] border border-zinc-800 rounded-sm hover:border-blue-500/50 transition-all"
            >
              <Zap className="w-8 h-8 text-blue-500 mb-4" />
              <h3
                className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Signal Engine
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                Rule-based scoring, statistical indicators, and governed AI-assisted pattern recognition
                for market momentum, risk composites, and sector signals.
              </p>
              <span className="inline-flex items-center gap-2 text-sm text-blue-500 font-semibold">
                Learn more <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link
              href="/platform/data-foundation"
              className="group p-8 bg-[#121821] border border-zinc-800 rounded-sm hover:border-blue-500/50 transition-all"
            >
              <Database className="w-8 h-8 text-blue-500 mb-4" />
              <h3
                className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Data Foundation
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                Ingestion, normalization, validation, and AI-assisted analysis pipeline that transforms
                fragmented public and licensed data into decision-ready intelligence.
              </p>
              <span className="inline-flex items-center gap-2 text-sm text-blue-500 font-semibold">
                Learn more <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
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
                  Governed AI-assisted analysis supports data quality review, anomaly flagging, source
                  comparison, signal clustering, and executive briefing summarization. AI outputs are
                  reviewed before publication and never replace official source data. AI does not make
                  autonomous decisions or generate unsourced intelligence.
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
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Primary Data Sources
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-6">
              Souvera integrates 12+ institutional feeds including ITC, UN Comtrade, BEA, USDA GATS,
              Census, USITC, IMF, World Bank, UNCTAD, AfDB, CDB, and GDELT News Pulse.
            </p>
            <Link
              href="/resources/data-sources"
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 font-semibold transition-colors"
            >
              See full data sources registry
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
              Our Commitment
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Souvera is engineered by Afronovation, Inc. with a commitment to data integrity and
              transparency. We do not make claims about data accuracy, latency, or coverage that we
              cannot substantiate.
            </p>
            <p className="text-zinc-400 leading-relaxed mb-8">
              If you have questions about our methodology or data sources, please contact us. We welcome
              feedback from the institutional community we serve.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all rounded-sm"
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
