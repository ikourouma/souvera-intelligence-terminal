import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { Shield, FileText, Lock, Database, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Compliance | Data Governance | Souvera',
  description: 'Souvera compliance standards: data handling practices, privacy standards, and governance controls for institutional users.',
  openGraph: {
    title: 'Compliance | Souvera',
    description: 'Souvera compliance standards and data governance for institutional users.',
    url: 'https://souvera.vercel.app/resources/compliance',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/resources/compliance',
  },
};

const DATA_PRACTICES = [
  {
    title: 'Source Data Attribution',
    description: 'Every data point carries full source attribution to official institutions.',
    icon: FileText,
  },
  {
    title: 'No Proprietary Data Creation',
    description: 'We aggregate and analyze official data. We do not fabricate or synthesize unverified data.',
    icon: Database,
  },
  {
    title: 'Limited PII Collection',
    description: 'We collect only essential information for user accounts and access management.',
    icon: Shield,
  },
  {
    title: 'Transparent Data Retention',
    description: 'Clear policies on how long data is retained and when it is refreshed from sources.',
    icon: Lock,
  },
];

export default function CompliancePage() {
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
              Compliance & Data Governance.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Institutional-grade governance. Souvera is designed for institutions with strict compliance requirements. This page outlines our data handling practices and governance controls.
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
              Data Handling Practices
            </h2>
            <p className="text-zinc-400 max-w-3xl">
              Our data handling practices are designed to meet institutional compliance standards while maintaining transparency about our capabilities.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DATA_PRACTICES.map((practice) => {
              const Icon = practice.icon;
              return (
                <div
                  key={practice.title}
                  className="p-8 bg-[#121821] border border-zinc-800 rounded-sm"
                >
                  <div className="w-12 h-12 rounded-sm bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {practice.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {practice.description}
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
                Privacy Standards
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                We implement GDPR-aware practices and maintain clear privacy policies. We do not sell user data to third parties.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  'No third-party data sales',
                  'Minimal PII collection',
                  'User data access controls',
                  'Transparent privacy policy',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-zinc-400">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/legal/privacy"
                className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-blue-500 hover:text-blue-400"
              >
                View Privacy Policy
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div>
              <h2
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Security Posture
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Souvera is hosted on enterprise-grade infrastructure with industry-standard security practices.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Hosting Infrastructure', value: 'Vercel (enterprise-grade)' },
                  { label: 'Database Security', value: 'Supabase (row-level security)' },
                  { label: 'Access Controls', value: 'User-level entitlements' },
                  { label: 'Data Encryption', value: 'In transit and at rest' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">
                      {item.label}
                    </div>
                    <div className="text-sm text-white">{item.value}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-zinc-500 p-4 bg-zinc-900/50 border border-zinc-800 rounded-sm">
                Enterprise security documentation available on request for institutional partners.
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
                  Entitlement Controls
                </h2>
                <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm bg-amber-600/15 text-amber-500 border border-amber-600/30">
                  Controlled Rollout
                </span>
              </div>
              <p className="text-zinc-400 leading-relaxed mb-6 max-w-3xl">
                Advanced entitlement and governance features are available to institutional partners.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                {['User-level access controls', 'Audit logging', 'Data export controls', 'Custom compliance reports'].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-zinc-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex items-start gap-4 p-8 bg-blue-600/10 border border-blue-600/20 rounded-sm max-w-4xl">
            <AlertCircle className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-2">Regulatory Considerations</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Souvera provides data and analysis for informational purposes. Users are responsible for their own regulatory compliance, including licensing requirements, investment regulations, and data use restrictions in their jurisdictions.
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
              Due Diligence Support
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-8">
              For procurement due diligence, compliance questionnaires, or detailed security documentation, please contact us. We work with institutional partners to meet their specific compliance requirements.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
              >
                Contact Us
              </Link>
              <Link
                href="/legal"
                className="px-10 py-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
              >
                View Legal Policies
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
