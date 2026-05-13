import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { Zap, TrendingUp, AlertTriangle, BarChart3, ArrowRight, Lock, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Signal Engine | Market Intelligence Indicators | Souvera',
  description: 'AI-assisted signal indicators for African and Caribbean markets. Growth vectors, risk indicators, and sector momentum to support institutional decision review.',
  openGraph: {
    title: 'Signal Engine | Souvera',
    description: 'AI-assisted signal indicators for African and Caribbean markets.',
    url: 'https://souvera.vercel.app/platform/signal-engine',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/platform/signal-engine',
  },
};

const SIGNAL_CATEGORIES = [
  {
    name: 'Market Growth Signals',
    description: 'Track GDP trends, sector composition changes, and overall economic momentum across markets.',
    icon: TrendingUp,
    color: '#22C55E',
    badge: 'Available',
    badgeColor: '#22C55E',
  },
  {
    name: 'Risk Composite Signals',
    description: 'Monitor debt ratios, currency volatility, and political stability indicators that may impact market risk.',
    icon: AlertTriangle,
    color: '#F59E0B',
    badge: 'Available',
    badgeColor: '#22C55E',
  },
  {
    name: 'Sector Momentum Signals',
    description: 'Identify sector-specific growth patterns and emerging opportunities across fintech, minerals, energy, and more.',
    icon: BarChart3,
    color: '#3B82F6',
    badge: 'Controlled Rollout',
    badgeColor: '#F59E0B',
  },
];

const USE_CASES = [
  'Portfolio screening and market prioritization',
  'Ongoing market monitoring and alert generation',
  'Due diligence support and risk assessment',
  'Executive briefing preparation',
];

export default function SignalEnginePage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      <section className="pt-24 pb-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
              Platform
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              The Signal Engine.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Market signals to inform your review. The Signal Engine combines rule-based scoring, statistical indicators, and AI-assisted pattern recognition to surface market momentum, opportunity signals, and risk indicators.
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
              What Signals Measure
            </h2>
            <p className="text-zinc-400 max-w-3xl">
              Signals are derived from official macroeconomic data and designed to support decision review, not to serve as automated investment advice.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SIGNAL_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.name}
                  className="p-8 bg-[#121821] border border-zinc-800 rounded-sm"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="w-12 h-12 rounded-sm flex items-center justify-center"
                      style={{ background: `${category.color}15`, border: `1px solid ${category.color}30` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: category.color }} />
                    </div>
                    <span
                      className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm"
                      style={{ background: `${category.badgeColor}15`, color: category.badgeColor, border: `1px solid ${category.badgeColor}30` }}
                    >
                      {category.badge}
                    </span>
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {category.name}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {category.description}
                  </p>
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
                Methodology Transparency
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Signals are derived from official macroeconomic data sourced from the IMF, World Bank, and regional development banks. Each signal combines multiple data points using weighted scoring models.
              </p>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Signal scores are designed to support decision review and analysis, not to serve as automated investment advice or guarantees of future performance.
              </p>
              <Link
                href="/insights/methodology"
                className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-blue-500 hover:text-blue-400"
              >
                View Methodology
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div>
              <h2
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                AI in Signal Generation
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                AI-assisted pattern recognition helps identify anomalies and cluster related signals across markets. AI does not make autonomous recommendations or replace analyst judgment. All AI outputs are reviewed before publication.
              </p>
              <div className="space-y-3">
                {['Anomaly detection in trends', 'Cross-market pattern clustering', 'Historical pattern matching', 'Signal confidence scoring'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-zinc-500">
                    <Zap className="w-4 h-4 text-purple-500" />
                    {item}
                  </div>
                ))}
              </div>
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
              Use Cases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {USE_CASES.map((useCase) => (
                <div
                  key={useCase}
                  className="flex items-start gap-3 p-4 bg-[#0B0F14] border border-zinc-800 rounded-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <p className="text-sm text-zinc-400">{useCase}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex items-start gap-4 p-8 bg-zinc-900/50 border border-zinc-800 rounded-sm max-w-4xl">
            <Info className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-2">Important Disclaimer</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Signal scores are informational tools designed to support market analysis and decision review. They do not constitute investment advice, recommendations, or endorsements. Souvera does not guarantee the accuracy of signals or predict future market performance. Users are responsible for their own investment decisions and due diligence.
              </p>
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
              Access Signal Intelligence
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-8">
              Signal intelligence is available across Explorer, Professional, and Institutional access tiers, with increasing depth and customization options.
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
