import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { CheckCircle2, ArrowRight, Building2 } from 'lucide-react';
import { productSchema, generateJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Access Plans | Souvera',
  description: 'Souvera access plans: from free exploration to institutional enterprise solutions. Choose the tier that matches your intelligence requirements.',
  openGraph: {
    title: 'Access Plans | Souvera',
    description: 'Souvera access plans: from free exploration to institutional enterprise solutions.',
    url: 'https://souvera.vercel.app/access',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/access',
  },
};

const PLANS = [
  {
    id: 'explorer',
    name: 'Explorer',
    badge: 'Free',
    badgeColor: '#22C55E',
    description: 'Get started with public macroeconomic data across Africa and the Caribbean.',
    features: [
      'Country profiles & GDP overview',
      'Market signal indicators',
      'Regional intelligence summaries',
      'Interactive intelligence map',
      'Caribbean overview',
    ],
    cta: 'Request Access',
    ctaHref: '/access/request-access',
    featured: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    badge: 'Most Popular',
    badgeColor: '#2563EB',
    description: 'Full macro data, sector intelligence, and expanded analysis for active analysts.',
    features: [
      'Everything in Explorer',
      'Inflation & Debt/GDP metrics',
      'Sector scores & analysis',
      'Expanded market coverage',
      'GDP forecast data',
      'Trade summary data',
      'Country comparison tools',
    ],
    cta: 'Request Access',
    ctaHref: '/access/request-access',
    featured: true,
  },
  {
    id: 'business',
    name: 'Business',
    badge: 'Teams',
    badgeColor: '#F59E0B',
    description: 'Full forecasts, trade data, and downloadable reports for investment teams.',
    features: [
      'Everything in Professional',
      'Full GDP forecasts & scenarios',
      'Full trade data',
      'Sector forecasts',
      'Downloadable country reports',
      'Historical data series',
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    featured: false,
  },
  {
    id: 'institutional',
    name: 'Institutional',
    badge: 'Enterprise',
    badgeColor: '#A78BFA',
    description: 'Full API access, custom intelligence, and dedicated support for institutions.',
    features: [
      'Everything in Business',
      'Full API access',
      'White-label data feeds',
      'Custom briefings & memos',
      'Methodology documentation',
      'Dedicated account support',
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    featured: false,
  },
];

export default function AccessPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateJsonLd(productSchema) }}
      />
      <SouveraMegaNav />

      <section className="pt-24 pb-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
              Access Plans
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Intelligence for Every Mandate.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              From public market overviews to institutional-grade API access. Choose the tier that matches your intelligence requirements.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`p-8 rounded-sm flex flex-col ${
                  plan.featured
                    ? 'bg-blue-600/10 border-2 border-blue-600/50'
                    : 'bg-[#121821] border border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm"
                    style={{
                      background: `${plan.badgeColor}15`,
                      color: plan.badgeColor,
                      border: `1px solid ${plan.badgeColor}30`,
                    }}
                  >
                    {plan.badge}
                  </span>
                </div>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {plan.name}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                  {plan.description}
                </p>
                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-400">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={plan.ctaHref}
                  className={`flex items-center justify-center gap-2 py-4 text-[11px] font-bold tracking-widest uppercase transition-all rounded-sm ${
                    plan.featured
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="bg-[#121821] border border-zinc-800 rounded-sm p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-sm bg-purple-600/10 border border-purple-600/20 flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Enterprise & Institutional
                </h3>
                <p className="text-zinc-400 max-w-lg">
                  For development finance institutions, governments, and global enterprises requiring custom intelligence solutions.
                </p>
              </div>
            </div>
            <Link
              href="/access/institutional"
              className="px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm whitespace-nowrap"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <SouveraFooter />
    </main>
  );
}
