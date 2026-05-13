import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { Code, Key, Zap, Shield, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'API Access | Programmatic Intelligence | Souvera',
  description: 'RESTful API for programmatic access to Souvera market intelligence. JSON format, bulk data capabilities, and enterprise integration support.',
  openGraph: {
    title: 'API Access | Souvera',
    description: 'RESTful API for programmatic access to Souvera market intelligence.',
    url: 'https://souvera.vercel.app/platform/api',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/platform/api',
  },
};

const API_CAPABILITIES = [
  {
    title: 'RESTful Architecture',
    description: 'Standard REST endpoints with JSON responses for seamless integration.',
    icon: Code,
  },
  {
    title: 'Authentication & Security',
    description: 'API key-based authentication with rate limiting for fair usage.',
    icon: Key,
  },
  {
    title: 'Bulk Data Access',
    description: 'Efficiently retrieve multiple countries or indicators in single requests.',
    icon: Zap,
  },
  {
    title: 'Enterprise Support',
    description: 'Dedicated onboarding and custom endpoint development for institutional partners.',
    icon: Shield,
  },
];

const ACCESS_TIERS = [
  {
    tier: 'Explorer',
    access: 'Public data only',
    features: ['Country profiles', 'Basic indicators', 'Read-only access'],
    color: '#22C55E',
  },
  {
    tier: 'Professional',
    access: 'Extended indicators',
    features: ['All Explorer features', 'Historical data', 'Increased rate limits'],
    color: '#3B82F6',
  },
  {
    tier: 'Business',
    access: 'Bulk access & exports',
    features: ['All Professional features', 'Bulk endpoints', 'Data exports'],
    color: '#F59E0B',
  },
  {
    tier: 'Institutional',
    access: 'Full API & custom endpoints',
    features: ['All Business features', 'Custom endpoints', 'SLA options', 'Dedicated support'],
    color: '#A78BFA',
  },
];

export default function ApiPage() {
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
              API Access.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Integrate Souvera into your workflows. The Souvera API provides programmatic access to market intelligence for enterprise applications, dashboards, and analytical workflows.
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
              API Capabilities
            </h2>
            <p className="text-zinc-400 max-w-3xl">
              RESTful architecture designed for institutional integration and enterprise workflows.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {API_CAPABILITIES.map((capability) => {
              const Icon = capability.icon;
              return (
                <div
                  key={capability.title}
                  className="p-8 bg-[#121821] border border-zinc-800 rounded-sm"
                >
                  <div className="w-12 h-12 rounded-sm bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {capability.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {capability.description}
                  </p>
                </div>
              );
            })}
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
              Sample Response Structure
            </h2>
            <p className="text-zinc-400 max-w-3xl mb-6">
              Illustrative example showing typical response format. Actual response structure may vary based on endpoint and access tier.
            </p>
          </div>
          <div className="max-w-3xl">
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-sm font-mono text-sm">
              <div className="text-zinc-600">// Illustrative example - actual response structure may vary</div>
              <pre className="text-zinc-300 mt-2 overflow-x-auto">
{`{
  "country": "Nigeria",
  "iso3": "NGA",
  "gdp_usd": 477000000000,
  "gdp_growth_pct": 3.2,
  "source": "IMF WEO",
  "updated": "2024-04"
}`}
              </pre>
            </div>
            <p className="text-sm text-zinc-600 mt-4">
              Endpoint documentation provided upon access approval. Contact us to discuss API access and rate limits.
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
              API Access Tiers
            </h2>
            <p className="text-zinc-400 max-w-3xl">
              API access is available across all Souvera access tiers with increasing capabilities and rate limits.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ACCESS_TIERS.map((tier) => (
              <div
                key={tier.tier}
                className="p-6 bg-[#121821] border border-zinc-800 rounded-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-lg font-bold"
                    style={{ fontFamily: 'Space Grotesk, sans-serif', color: tier.color }}
                  >
                    {tier.tier}
                  </h3>
                </div>
                <p className="text-sm text-zinc-400 mb-4">{tier.access}</p>
                <div className="space-y-2">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-500">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800 bg-[#121821]/30">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-sm bg-purple-600/10 border border-purple-600/20 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-purple-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Enterprise Integration
                </h2>
                <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm bg-purple-600/15 text-purple-500 border border-purple-600/30">
                  Enterprise
                </span>
              </div>
              <p className="text-zinc-400 leading-relaxed mb-6 max-w-3xl">
                Institutional partners receive dedicated onboarding, custom endpoint development, and SLA options.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                {['Dedicated onboarding', 'Custom endpoint development', 'SLA options', 'Priority support'].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-zinc-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    {feature}
                  </div>
                ))}
              </div>
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
              Request API Access
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-8">
              API access is granted based on use case and organizational requirements. Contact us to discuss your integration needs, rate limits, and access tier.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
              >
                Request API Access
              </Link>
              <Link
                href="/access"
                className="px-10 py-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm"
              >
                View Access Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
