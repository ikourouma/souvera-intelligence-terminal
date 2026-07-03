/** Shared access tier definitions for /access plan comparison. */

export type AccessPlanId = 'explorer' | 'professional' | 'business' | 'institutional';

export interface AccessPlan {
  id: AccessPlanId;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  featured: boolean;
}

export const ACCESS_PLANS: AccessPlan[] = [
  {
    id: 'explorer',
    name: 'Explorer',
    badge: 'Free',
    badgeColor: '#22C55E',
    description:
      'Create a free Explorer account for self-serve access to public macro data, maps, and regional intelligence — no admin review required.',
    features: [
      'Country profiles & GDP overview',
      'Market signal indicators',
      'Regional intelligence summaries',
      'Interactive intelligence map',
      'Caribbean overview',
    ],
    cta: 'Create free account',
    ctaHref: '/signup',
    featured: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    badge: 'Most Popular',
    badgeColor: '#2563EB',
    description: 'Full macro data, sector intelligence, and Country Profile reports for active analysts.',
    features: [
      'Everything in Explorer',
      'Inflation & Debt/GDP metrics',
      'Sector scores & analysis',
      'Country Profile PDF reports',
      'GDP forecast data',
      'Country comparison tools',
    ],
    cta: 'Request Professional Access',
    ctaHref: '/access/request-access?plan=professional',
    featured: true,
  },
  {
    id: 'business',
    name: 'Business',
    badge: 'Teams',
    badgeColor: '#F59E0B',
    description: 'Full forecasts, trade data, and advanced reports for investment teams.',
    features: [
      'Everything in Professional',
      'Investment Memos & Trade Profiles',
      'Sector Deep-Dive reports',
      'AI-powered custom reports',
      'Full trade & risk intelligence',
      'Historical data series',
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact?plan=business&intent=upgrade',
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
    ctaHref: '/access/institutional',
    featured: false,
  },
];

export const ACCESS_TYPE_OPTIONS = ACCESS_PLANS.map((plan) => ({
  value: plan.id,
  label: plan.name,
}));

const ACCESS_PLAN_IDS: AccessPlanId[] = ['explorer', 'professional', 'business', 'institutional'];

export function isAccessPlanId(value: string | null | undefined): value is AccessPlanId {
  return !!value && ACCESS_PLAN_IDS.includes(value as AccessPlanId);
}

const BY_PLAN_ID = new Map(ACCESS_PLANS.map((p) => [p.id, p]));

export interface PlanCta {
  label: string;
  href: string;
}

/** Canonical CTA label + href for a known access tier. */
export function resolvePlanCta(planId: string): PlanCta {
  const plan = isAccessPlanId(planId) ? BY_PLAN_ID.get(planId) : undefined;
  if (plan) {
    return { label: plan.cta, href: plan.ctaHref };
  }
  return { label: 'Get Started', href: '/access' };
}

export interface CmsPricingFields {
  plan_id: string;
  display_name?: string | null;
  badge_text?: string | null;
  badge_color?: string | null;
  description?: string | null;
  features?: string[] | null;
  cta_text?: string | null;
  cta_url?: string | null;
  cta_style?: string | null;
  is_featured?: boolean | null;
  show_price?: boolean | null;
  price_monthly?: number | null;
  price_annual?: number | null;
}

/** Merge CMS marketing copy with canonical CTAs (CMS cannot override routing). */
export function mergePlanWithCms(staticPlan: AccessPlan, cmsPlan?: CmsPricingFields | null): AccessPlan {
  const canonical = resolvePlanCta(staticPlan.id);
  if (!cmsPlan) {
    return { ...staticPlan, cta: canonical.label, ctaHref: canonical.href };
  }

  if (
    process.env.NODE_ENV === 'development' &&
    cmsPlan.cta_url &&
    cmsPlan.cta_url !== canonical.href
  ) {
    console.warn(
      `[access-plans] CMS cta_url "${cmsPlan.cta_url}" for ${staticPlan.id} overridden by canonical "${canonical.href}"`
    );
  }

  return {
    ...staticPlan,
    name: cmsPlan.display_name || staticPlan.name,
    badge: cmsPlan.badge_text || staticPlan.badge,
    badgeColor: cmsPlan.badge_color || staticPlan.badgeColor,
    description: cmsPlan.description || staticPlan.description,
    features: cmsPlan.features?.length ? cmsPlan.features : staticPlan.features,
    featured: cmsPlan.is_featured ?? staticPlan.featured,
    cta: canonical.label,
    ctaHref: canonical.href,
  };
}

/** Normalize a CMS pricing row before API response. */
export function normalizeCmsPricingRow(row: Record<string, unknown>): Record<string, unknown> {
  const planId = row.plan_id as string;
  const staticPlan = isAccessPlanId(planId) ? BY_PLAN_ID.get(planId) : undefined;
  if (!staticPlan) return row;

  const merged = mergePlanWithCms(staticPlan, {
    plan_id: planId,
    display_name: row.display_name as string | null,
    badge_text: row.badge_text as string | null,
    badge_color: row.badge_color as string | null,
    description: row.description as string | null,
    features: row.features as string[] | null,
    cta_text: row.cta_text as string | null,
    cta_url: row.cta_url as string | null,
    is_featured: row.is_featured as boolean | null,
  });
  const canonical = resolvePlanCta(planId);

  return {
    ...row,
    cta_text: canonical.label,
    cta_url: canonical.href,
    display_name: merged.name,
    badge_text: merged.badge,
    badge_color: merged.badgeColor,
    description: merged.description,
    features: merged.features,
    is_featured: merged.featured,
  };
}

/** Landing-page plan shape derived from ACCESS_PLANS. */
export function landingPlansFromAccessPlans(): Array<{
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
}> {
  const ctaStyles: Record<AccessPlanId, string> = {
    explorer: 'outline',
    professional: 'primary',
    business: 'outline',
    institutional: 'ghost',
  };
  return ACCESS_PLANS.map((plan) => ({
    id: plan.id,
    name: plan.name,
    badge: plan.badge,
    badgeColor: plan.badgeColor,
    description: plan.description,
    highlights: plan.features,
    cta: plan.cta,
    ctaHref: plan.ctaHref,
    ctaStyle: ctaStyles[plan.id],
    featured: plan.featured,
  }));
}
