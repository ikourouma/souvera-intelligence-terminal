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
    description: 'Get started with public macroeconomic data across Africa and the Caribbean.',
    features: [
      'Country profiles & GDP overview',
      'Market signal indicators',
      'Regional intelligence summaries',
      'Interactive intelligence map',
      'Caribbean overview',
    ],
    cta: 'Request Access',
    ctaHref: '/access/request-access?plan=explorer',
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
    cta: 'Request Access',
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
