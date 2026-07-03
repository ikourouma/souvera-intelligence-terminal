'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { ACCESS_PLANS } from '@/lib/access-plans';

const TIER_IDS = ['explorer', 'professional', 'business'] as const;

function tierCta(planId: (typeof TIER_IDS)[number]): { label: string; href: string; primary: boolean } {
  if (planId === 'explorer') {
    return { label: 'Create free account', href: '/signup', primary: true };
  }
  if (planId === 'professional') {
    return { label: 'Request Access', href: '/access/request-access?plan=professional', primary: false };
  }
  return { label: 'Request Access', href: '/access/request-access?plan=business', primary: false };
}

export function PlatformAccessTierStrip() {
  const tiers = ACCESS_PLANS.filter((p) => TIER_IDS.includes(p.id as (typeof TIER_IDS)[number]));

  return (
    <section className="py-16 border-b border-zinc-800 bg-zinc-900/20">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="mb-12 max-w-3xl mx-auto text-center">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-4">
            Access Tiers
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Start free. Upgrade when ready.
          </h2>
          <p className="text-lg text-zinc-400">
            Explorer is free forever — the same plan you get when you create an account. Paid tiers unlock
            trade intelligence, reports, and team features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((plan) => {
            const cta = tierCta(plan.id as (typeof TIER_IDS)[number]);
            const topFeatures = plan.features.slice(0, 3);

            return (
              <div
                key={plan.id}
                className={`flex flex-col p-8 rounded-sm border ${
                  plan.featured
                    ? 'bg-[#121821] border-blue-600/50 ring-1 ring-blue-600/20'
                    : 'bg-zinc-900/50 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <span
                    className="px-2 py-1 text-[9px] font-bold tracking-widest uppercase rounded-sm"
                    style={{
                      background: `${plan.badgeColor}15`,
                      color: plan.badgeColor,
                      border: `1px solid ${plan.badgeColor}30`,
                    }}
                  >
                    {plan.badge}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 mb-6 leading-relaxed">{plan.description}</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {topFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={cta.href}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm font-semibold text-sm transition-colors ${
                    cta.primary
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                  }`}
                >
                  {cta.label}
                  {!cta.primary && <ArrowRight className="w-4 h-4" />}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center mt-8 text-sm text-zinc-500">
          Need Institutional or API-only access?{' '}
          <Link href="/access" className="text-blue-500 hover:text-blue-400 font-medium">
            Compare all plans
          </Link>
        </p>
      </div>
    </section>
  );
}
