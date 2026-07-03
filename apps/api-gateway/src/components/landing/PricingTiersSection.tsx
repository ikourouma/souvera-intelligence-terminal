'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  landingPlansFromAccessPlans,
  mergePlanWithCms,
  isAccessPlanId,
  ACCESS_PLANS,
} from '@/lib/access-plans';

const FALLBACK_PLANS = landingPlansFromAccessPlans();

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

const CTA_STYLES: Record<string, string> = {
  explorer: 'outline',
  professional: 'primary',
  business: 'outline',
  institutional: 'ghost',
};

function transformCMSPlan(cmsPlan: Record<string, unknown>): Plan {
  const planId = (cmsPlan.plan_id as string) || 'unknown';
  const staticPlan = isAccessPlanId(planId)
    ? ACCESS_PLANS.find((p) => p.id === planId)
    : undefined;

  const merged = staticPlan
    ? mergePlanWithCms(staticPlan, {
        plan_id: planId,
        display_name: cmsPlan.display_name as string | null,
        badge_text: cmsPlan.badge_text as string | null,
        badge_color: cmsPlan.badge_color as string | null,
        description: cmsPlan.description as string | null,
        features: cmsPlan.features as string[] | null,
        cta_text: cmsPlan.cta_text as string | null,
        cta_url: cmsPlan.cta_url as string | null,
        is_featured: cmsPlan.is_featured as boolean | null,
      })
    : null;

  return {
    id: planId,
    name: merged?.name || (cmsPlan.display_name as string) || '',
    badge: merged?.badge || (cmsPlan.badge_text as string) || '',
    badgeColor: merged?.badgeColor || (cmsPlan.badge_color as string) || '#2563EB',
    description: merged?.description || (cmsPlan.description as string) || '',
    highlights: merged?.features || (cmsPlan.features as string[]) || [],
    cta: merged?.cta || 'Get Started',
    ctaHref: merged?.ctaHref || '/access',
    ctaStyle: (cmsPlan.cta_style as string) || CTA_STYLES[planId] || 'outline',
    featured: merged?.featured ?? (cmsPlan.is_featured as boolean) ?? false,
    priceMonthly: (cmsPlan.price_monthly as number) ?? null,
    priceAnnual: (cmsPlan.price_annual as number) ?? null,
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
            href="/access"
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
