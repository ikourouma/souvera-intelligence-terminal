import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { PublicPageHero } from '@/components/marketing/PublicPageHero';
import { AuditProofCallout } from '@/components/marketing/traction/AuditProofCallout';
import { Database, ShieldCheck, GitMerge, Brain, ArrowRight, Award, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Data Foundation | Souvera Intelligence Platform',
  description: 'How Souvera transforms fragmented public and licensed data into decision-ready intelligence. Source attribution, normalization, quality scoring, and AI-assisted analysis.',
  openGraph: {
    title: 'Data Foundation | Souvera',
    description: 'How Souvera transforms fragmented public and licensed data into decision-ready intelligence.',
    url: 'https://souvera.vercel.app/platform/data-foundation',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/platform/data-foundation',
  },
};

const PIPELINE_STEPS = [
  {
    title: 'Ingestion',
    description: 'Structured ingestion from official sources including IMF, World Bank, and regional development banks.',
    icon: Database,
    color: '#3B82F6',
  },
  {
    title: 'Normalization',
    description: 'Standardization of formats, currencies, and time periods to enable cross-source comparison.',
    icon: GitMerge,
    color: '#22C55E',
  },
  {
    title: 'Validation',
    description: 'Cross-source validation, discrepancy flagging, and confidence scoring for each data point.',
    icon: ShieldCheck,
    color: '#F59E0B',
  },
  {
    title: 'AI-Assisted Analysis',
    description: 'Governed machine learning supports anomaly detection and signal clustering.',
    icon: Brain,
    color: '#A78BFA',
  },
];

export default function DataFoundationPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      <PublicPageHero
        label="Platform"
        title="The Souvera Data Foundation."
        description="From fragmented data to decision-ready intelligence. Ingestion, normalization, validation, and governed AI-assisted analysis across official institutional feeds."
        backLink={{ href: '/platform', label: 'Platform overview' }}
        ctas={[
          { href: '/signup', label: 'Create free account', variant: 'signup' },
          { href: '/resources/data-sources', label: 'Data sources', variant: 'secondary' },
        ]}
      />

      <section className="py-8 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <AuditProofCallout />
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="mb-12">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Data Pipeline
            </h2>
            <p className="text-zinc-400 max-w-3xl">
              Our data pipeline transforms raw economic data from official sources into validated, decision-ready intelligence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PIPELINE_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="p-8 bg-[#121821] border border-zinc-800 rounded-sm"
                >
                  <div
                    className="w-12 h-12 rounded-sm flex items-center justify-center mb-6"
                    style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: step.color }} />
                  </div>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 mb-2">
                    Step {index + 1}
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {step.description}
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
                Source Attribution
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Every data point in Souvera carries source attribution. We do not present estimates as confirmed figures.
              </p>
              <p className="text-zinc-400 leading-relaxed mb-6">
                All data is traceable to official sources including the IMF, World Bank, African Development Bank, Caribbean Development Bank, and national statistical agencies.
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
                Quality Assurance
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Cross-Source Validation', desc: 'Data points validated against multiple sources where available.' },
                  { label: 'Confidence Scoring', desc: 'Each data point tagged with confidence level based on source quality.' },
                  { label: 'Gap Acknowledgment', desc: 'Data limitations and gaps clearly indicated, not hidden.' },
                  { label: 'Historical Revision Tracking', desc: 'Official source revisions tracked and reflected in our data.' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-blue-500 shrink-0 mt-1" />
                    <div>
                      <div className="font-medium text-white text-sm">{item.label}</div>
                      <div className="text-sm text-zinc-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-sm bg-purple-600/10 border border-purple-600/20 flex items-center justify-center shrink-0">
              <Brain className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h2
                className="text-2xl font-bold mb-3"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                AI-Assisted Analysis
              </h2>
              <p className="text-zinc-400 leading-relaxed max-w-3xl">
                Governed AI-assisted analysis supports anomaly detection, source comparison, and signal clustering. AI outputs are reviewed before publication and never replace official source data. AI does not make autonomous decisions, generate unsourced intelligence, or guarantee predictions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800 bg-[#121821]/30">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-sm bg-amber-600/10 border border-amber-600/20 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Enterprise Data Governance
                </h2>
                <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm bg-amber-600/15 text-amber-500 border border-amber-600/30">
                  Controlled Rollout
                </span>
              </div>
              <p className="text-zinc-400 leading-relaxed mb-6 max-w-3xl">
                Advanced governance features including entitlement controls, audit logging, and data retention policies are available to institutional partners.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                {['Entitlement Controls', 'Audit Logging', 'Data Retention Policies', 'Custom Data Feeds'].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-zinc-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {feature}
                  </div>
                ))}
              </div>
              <p className="text-sm text-zinc-500 mt-6">
                Available to institutional partners. Contact us for details.
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
              Data Integrity Commitment
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-8">
              Souvera is engineered by Afronovation, Inc. with a commitment to data integrity and transparency. We do not make claims about data accuracy, latency, or coverage that we cannot substantiate. All limitations are clearly acknowledged.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all rounded-sm"
              >
                Create free account
              </Link>
              <Link
                href="/access/request-access?plan=business"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all rounded-sm"
              >
                Request Business access
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/platform/signal-engine"
                className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-semibold transition-all rounded-sm"
              >
                Signal engine
              </Link>
              <Link
                href="/insights/methodology"
                className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-semibold transition-all rounded-sm"
              >
                Methodology
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
