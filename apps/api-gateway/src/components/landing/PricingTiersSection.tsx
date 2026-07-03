'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Fallback pricing tiers
// Prices are admin-managed via CMS at /admin/marketing/pricing
const FALLBACK_PLANS = [
  {
    id: 'explorer',
    name: 'Explorer',
    badge: 'Free',
    badgeColor: '#22C55E',
    description: 'Get started with public macroeconomic data across Africa and the Caribbean.',
    highlights: [
      'Country profiles & GDP overview',
      'Market signal indicators',
      'Regional intelligence summaries',
      'Interactive intelligence map',
      'Caribbean overview',
    ],
    cta: 'Request Access',
    ctaHref: '/access/request-access',
    ctaStyle: 'outline',
    featured: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    badge: 'Most Popular',
    badgeColor: '#2563EB',
    description: 'Full macro data, sector intelligence, and expanded analysis for active analysts.',
    highlights: [
      'Everything in Explorer',
      'Inflation & Debt/GDP metrics',
      'Sector scores & analysis',
      'Expanded market coverage',
      'GDP forecast data',
      'Trade summary data',
      'Country comparison tools',
    ],
    cta: 'View Plans',
    ctaHref: '/access',
    ctaStyle: 'primary',
    featured: true,
  },
  {
    id: 'business',
    name: 'Business',
    badge: 'Recommended',
    badgeColor: '#F59E0B',
    description: 'Full forecasts, trade data, and downloadable reports for investment teams.',
    highlights: [
      'Everything in Professional',
      'Full GDP forecasts & scenarios',
      'Full trade data — exports, imports, partners',
      'Sector forecasts',
      'Downloadable country reports',
      'Historical data series',
    ],
    cta: 'View Plans',
    ctaHref: '/access',
    ctaStyle: 'outline',
    featured: false,
  },
  {
    id: 'institutional',
    name: 'Institutional',
    badge: 'Enterprise',
    badgeColor: '#A78BFA',
    description: 'Full API access, white-label intelligence, and dedicated support for institutions.',
    highlights: [
      'Everything in Business',
      'Full API access',
      'White-label data feeds',
      'Custom briefings & memos',
      'Methodology documentation',
      'Dedicated account support',
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    ctaStyle: 'ghost',
    featured: false,
  },
];

interface Plan {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  highlights: string[];
  cta: string;
  ctaHref: string;
  ctaStyle: string;
  featured: boolean;
  priceMonthly?: number | null;
  priceAnnual?: number | null;
  showPrice?: boolean;
}

function transformCMSPlan(cmsPlan: Record<string, unknown>): Plan {
  return {
    id: (cmsPlan.plan_id as string) || 'unknown',
    name: (cmsPlan.display_name as string) || '',
    badge: (cmsPlan.badge_text as string) || '',
    badgeColor: (cmsPlan.badge_color as string) || '#2563EB',
    description: (cmsPlan.description as string) || '',
    highlights: (cmsPlan.features as string[]) || [],
    cta: (cmsPlan.cta_text as string) || 'Get Started',
    ctaHref: (cmsPlan.cta_url as string) || '/access',
    ctaStyle: (cmsPlan.cta_style as string) || 'outline',
    featured: (cmsPlan.is_featured as boolean) || false,
    priceMonthly: (cmsPlan.price_monthly as number) || null,
    priceAnnual: (cmsPlan.price_annual as number) || null,
    showPrice: cmsPlan.show_price !== false,
  };
}

export function PricingTiersSection() {
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);

  useEffect(() => {
    async function fetchPricing() {
      try {
        const response = await fetch('/api/v1/marketing/pricing');
        if (response.ok) {
          const data = await response.json();
          if (data.plans && data.plans.length > 0) {
            setPlans(data.plans.map(transformCMSPlan));
          }
        }
      } catch (err) {
        console.error('[PricingTiersSection] Failed to fetch CMS pricing:', err);
      }
    }
    fetchPricing();
  }, []);

  return (
    <section className="py-24" style={{ background: '#121821', borderTop: '1px solid #1F2A37' }}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="section-label mb-3">Access Tiers</div>
          <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', color: '#F9FAFB' }}>
            Intelligence for Every Mandate
          </h2>
          <p className="text-[15px] leading-relaxed" style={{ color: '#9CA3AF' }}>
            From public sector overviews to institutional-grade API access. Choose the tier that matches your investment mandate.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-sm flex flex-col relative overflow-hidden transition-all duration-300 h-full"
              style={{
                background: plan.featured ? '#161D26' : '#0B0F14',
                border: plan.featured ? `1px solid ${plan.badgeColor}40` : '1px solid #1F2A37',
                boxShadow: plan.featured ? `0 0 40px ${plan.badgeColor}10` : 'none',
              }}
            >
              {/* Featured highlight line */}
              {plan.featured && (
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: plan.badgeColor }} />
              )}

              {/* Plan header */}
              <div className="px-6 pt-7 pb-5" style={{ borderBottom: '1px solid #1F2A37' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold" style={{ color: '#E5E7EB', fontFamily: 'Space Grotesk, sans-serif' }}>{plan.name}</h3>
                  <span
                    className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm font-mono"
                    style={{ background: `${plan.badgeColor}15`, color: plan.badgeColor, border: `1px solid ${plan.badgeColor}30` }}
                  >
                    {plan.badge}
                  </span>
                </div>

                {/* Price — admin managed via CMS */}
                <div className="mb-4 min-h-[52px]">
                  {plan.showPrice && plan.priceMonthly !== null && plan.priceMonthly !== undefined ? (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold" style={{ color: '#F9FAFB', fontFamily: 'Space Grotesk, sans-serif' }}>
                          {plan.priceMonthly === 0 ? 'Free' : `$${plan.priceMonthly.toLocaleString()}`}
                        </span>
                        {plan.priceMonthly > 0 && (
                          <span className="text-[11px]" style={{ color: '#6B7280' }}>/mo</span>
                        )}
                      </div>
                      {plan.priceAnnual && plan.priceMonthly > 0 && (
                        <p className="text-[10px] mt-1" style={{ color: '#6B7280' }}>
                          ${plan.priceAnnual.toLocaleString()}/year (save {Math.round((1 - plan.priceAnnual / (plan.priceMonthly * 12)) * 100)}%)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] font-mono leading-relaxed" style={{ color: '#6B7280' }}>
                      Pricing available on request.<br />
                      <Link href="/access" className="hover:text-souvera-blue transition-colors underline underline-offset-2" style={{ color: '#9CA3AF' }}>
                        View full plan details →
                      </Link>
                    </div>
                  )}
                </div>

                <p className="text-[12px] leading-relaxed" style={{ color: '#9CA3AF' }}>{plan.description}</p>
              </div>

              {/* Features */}
              <div className="px-6 py-5 flex-1 flex flex-col">
                <ul className="space-y-2.5 flex-1">
                  {plan.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0" style={{ background: `${plan.badgeColor}20` }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: plan.badgeColor }} />
                      </div>
                      <span className="text-[12px] leading-snug" style={{ color: '#9CA3AF' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                <Link
                  href={plan.ctaHref}
                  className="flex items-center justify-center gap-2 w-full py-3.5 text-[11px] font-bold tracking-widest uppercase transition-all"
                  style={
                    plan.ctaStyle === 'primary'
                      ? { background: plan.badgeColor, color: 'white' }
                      : plan.ctaStyle === 'ghost'
                      ? { background: 'transparent', color: '#6B7280', border: '1px solid #1F2A37' }
                      : { background: 'transparent', color: plan.badgeColor, border: `1px solid ${plan.badgeColor}40` }
                  }
                >
                  {plan.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center">
          <p className="text-[12px] mb-4" style={{ color: '#4B5563' }}>
            Need a custom configuration or volume pricing?
          </p>
          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-2 px-8 py-4 font-bold text-[11px] tracking-widest uppercase transition-all hover:text-white"
            style={{ border: '1px solid #1F2A37', color: '#9CA3AF', background: 'transparent' }}
          >
            Compare All Plans in Detail
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
