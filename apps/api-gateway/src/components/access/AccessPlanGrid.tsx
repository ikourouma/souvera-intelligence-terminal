'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { ACCESS_PLANS, mergePlanWithCms, type AccessPlan } from '@/lib/access-plans';

interface CMSPlan {
  plan_id: string;
  display_name: string;
  badge_text: string;
  badge_color: string;
  tagline?: string;
  description: string;
  features: string[];
  cta_text: string;
  cta_url: string;
  cta_style: string;
  is_featured: boolean;
  is_visible: boolean;
  show_price?: boolean;
  price_monthly?: number;
  price_annual?: number;
  display_order: number;
}

interface MergedPlan extends AccessPlan {
  priceMonthly?: number | null;
  priceAnnual?: number | null;
  showPrice?: boolean;
}

function appendSource(href: string, source: string | null): string {
  if (!source) return href;
  const sep = href.includes('?') ? '&' : '?';
  return `${href}${sep}source=${encodeURIComponent(source)}`;
}

export function AccessPlanGrid() {
  const searchParams = useSearchParams();
  const highlightParam = searchParams.get('highlight') as string | null;
  const source = searchParams.get('source');
  const [hashPlan, setHashPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<MergedPlan[]>(ACCESS_PLANS.map(p => ({ ...p })));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCMSPricing() {
      try {
        const response = await fetch('/api/v1/marketing/pricing');
        if (response.ok) {
          const data = await response.json();
          if (data.plans && data.plans.length > 0) {
            const cmsPlans = data.plans as CMSPlan[];
            
            setPlans(ACCESS_PLANS.map((staticPlan) => {
              const cmsPlan = cmsPlans.find((cp) => cp.plan_id === staticPlan.id);
              const merged = mergePlanWithCms(staticPlan, cmsPlan);
              if (cmsPlan) {
                return {
                  ...merged,
                  priceMonthly: cmsPlan.price_monthly,
                  priceAnnual: cmsPlan.price_annual,
                  showPrice: cmsPlan.show_price !== false,
                };
              }
              return { ...merged };
            }));
          }
        }
      } catch (err) {
        console.error('[AccessPlanGrid] Failed to fetch CMS pricing:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCMSPricing();
  }, []);

  useEffect(() => {
    const syncHash = () => {
      const id = window.location.hash.replace('#', '');
      setHashPlan(id.startsWith('plan-') ? id.replace('plan-', '') : null);
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  useEffect(() => {
    const target = hashPlan ?? highlightParam;
    if (!target) return;
    const el = document.getElementById(`plan-${target}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [hashPlan, highlightParam]);

  const activePlan = hashPlan ?? highlightParam;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-8 rounded-sm bg-[#121821] border border-zinc-800 animate-pulse">
            <div className="h-6 bg-zinc-800 rounded w-20 mb-4" />
            <div className="h-8 bg-zinc-800 rounded w-32 mb-3" />
            <div className="h-4 bg-zinc-800 rounded w-full mb-6" />
            <div className="space-y-3 mb-8">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-4 bg-zinc-800 rounded w-3/4" />
              ))}
            </div>
            <div className="h-12 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          highlighted={activePlan === plan.id}
          ctaHref={appendSource(plan.ctaHref, source)}
        />
      ))}
    </div>
  );
}

function PlanCard({
  plan,
  highlighted,
  ctaHref,
}: {
  plan: MergedPlan;
  highlighted: boolean;
  ctaHref: string;
}) {
  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${price.toLocaleString()}`;
  };

  return (
    <div
      id={`plan-${plan.id}`}
      className={`p-8 rounded-sm flex flex-col scroll-mt-28 transition-all duration-300 ${
        highlighted
          ? 'bg-amber-500/10 border-2 border-amber-500/60 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10'
          : plan.featured
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
        {highlighted && (
          <span className="text-[9px] font-bold tracking-widest uppercase text-amber-400">
            Recommended
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {plan.name}
      </h3>
      
      {/* Price Display */}
      {plan.showPrice && plan.priceMonthly !== undefined && plan.priceMonthly !== null && (
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {formatPrice(plan.priceMonthly)}
            </span>
            {plan.priceMonthly > 0 && (
              <span className="text-sm text-zinc-500">/month</span>
            )}
          </div>
          {plan.priceAnnual && plan.priceMonthly > 0 && (
            <p className="text-xs text-zinc-500 mt-1">
              ${plan.priceAnnual.toLocaleString()}/year (save {Math.round((1 - plan.priceAnnual / (plan.priceMonthly * 12)) * 100)}%)
            </p>
          )}
        </div>
      )}
      
      <p className="text-sm text-zinc-500 leading-relaxed mb-6">{plan.description}</p>
      <div className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span className="text-sm text-zinc-400">{feature}</span>
          </div>
        ))}
      </div>
      <Link
        href={ctaHref}
        className={`flex items-center justify-center gap-2 py-4 text-[11px] font-bold tracking-widest uppercase transition-all rounded-sm ${
          highlighted || plan.featured
            ? 'bg-blue-600 hover:bg-blue-500 text-white'
            : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white'
        }`}
      >
        {plan.cta}
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
