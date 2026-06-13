/**
 * Single source of truth for public site navigation.
 * Used by SouveraMegaNav, SouveraFooter, and sitemap page — keep in sync here only.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Zap,
  Globe,
  Building2,
  TrendingUp,
  Map,
} from 'lucide-react';

export interface SiteNavLink {
  name: string;
  href: string;
}

export interface SiteNavSection {
  title: string;
  links: SiteNavLink[];
}

export interface SiteNavItem {
  name: string;
  icon: LucideIcon;
  sections: SiteNavSection[];
}

export const SITE_MEGA_NAV: SiteNavItem[] = [
  {
    name: 'Platform',
    icon: Zap,
    sections: [
      {
        title: 'Core Infrastructure',
        links: [
          { name: 'Platform Overview', href: '/platform' },
          { name: 'Intelligence Terminal', href: '/platform/terminal' },
          { name: 'Signal Engine', href: '/platform/signal-engine' },
        ],
      },
      {
        title: 'Data & Integration',
        links: [
          { name: 'Data Foundation', href: '/platform/data-foundation' },
          { name: 'API Access', href: '/platform/api' },
        ],
      },
    ],
  },
  {
    name: 'Intelligence',
    icon: Globe,
    sections: [
      {
        title: 'Regional Coverage',
        links: [
          { name: 'Intelligence Overview', href: '/intelligence' },
          { name: 'Africa Intelligence', href: '/intelligence/africa' },
          { name: 'Caribbean Intelligence', href: '/intelligence/caribbean' },
        ],
      },
      {
        title: 'Trade & Policy',
        links: [
          { name: 'Trade Intelligence', href: '/intelligence/trade' },
          { name: 'AGOA Legislative Tracker', href: '/intelligence/trade/agoa' },
          { name: 'AfCFTA Status Tracker', href: '/intelligence/trade/afcfta' },
          { name: 'Supply-Demand Matrix', href: '/intelligence/trade/supply-demand' },
        ],
      },
      {
        title: 'Analysis Tools',
        links: [
          { name: 'Intelligence Map', href: '/intelligence/map' },
          { name: 'Country Comparison', href: '/intelligence/compare' },
        ],
      },
    ],
  },
  {
    name: 'Sectors',
    icon: Building2,
    sections: [
      {
        title: 'Core Infrastructure',
        links: [
          { name: 'Sector Overview', href: '/sectors' },
          { name: 'Digital Infrastructure', href: '/sectors/digital-infrastructure' },
          { name: 'Fintech & Digital Finance', href: '/sectors/fintech' },
        ],
      },
      {
        title: 'Industry Sectors',
        links: [
          { name: 'Mining & Critical Minerals', href: '/sectors/critical-minerals' },
          { name: 'Energy & Renewables', href: '/sectors/energy' },
          { name: 'Agriculture & Agribusiness', href: '/sectors/agriculture' },
        ],
      },
      {
        title: 'Services & Connectivity',
        links: [
          { name: 'Logistics & Trade', href: '/sectors/logistics' },
          { name: 'Tourism & Hospitality', href: '/sectors/tourism-hospitality' },
        ],
      },
    ],
  },
  {
    name: 'Insights',
    icon: TrendingUp,
    sections: [
      {
        title: 'Research & Analysis',
        links: [
          { name: 'Insights Overview', href: '/insights' },
          { name: 'Souvera News', href: '/insights/news' },
          { name: 'Strategic Briefings', href: '/insights/briefings' },
          { name: 'Market Rankings', href: '/insights/rankings' },
        ],
      },
      {
        title: 'Methodology',
        links: [{ name: 'Data Methodology', href: '/insights/methodology' }],
      },
    ],
  },
  {
    name: 'Access',
    icon: Map,
    sections: [
      {
        title: 'Get Started',
        links: [
          { name: 'Access Plans', href: '/access' },
          { name: 'Request Access', href: '/access/request-access' },
          { name: 'Request Demo', href: '/access/request-demo' },
        ],
      },
      {
        title: 'Enterprise',
        links: [
          { name: 'Institutional Solutions', href: '/access/institutional' },
          { name: 'Contact Sales', href: '/contact' },
        ],
      },
    ],
  },
  {
    name: 'Resources',
    icon: Globe,
    sections: [
      {
        title: 'Data & Compliance',
        links: [
          { name: 'Data Sources', href: '/resources/data-sources' },
          { name: 'Source Registry', href: '/resources/source-registry' },
          { name: 'Compliance', href: '/resources/compliance' },
        ],
      },
      {
        title: 'Support',
        links: [
          { name: 'FAQ', href: '/resources/faq' },
          { name: 'About Souvera', href: '/about' },
          { name: 'Legal', href: '/legal' },
        ],
      },
    ],
  },
];

/** Flat list of all public nav links (for sitemap page, audits) */
export function flattenMegaNavLinks(): SiteNavLink[] {
  const links: SiteNavLink[] = [];
  for (const item of SITE_MEGA_NAV) {
    for (const section of item.sections) {
      for (const link of section.links) {
        if (!links.some((l) => l.href === link.href)) {
          links.push(link);
        }
      }
    }
  }
  return links;
}

export const MOBILE_UTILITY_LINKS: SiteNavLink[] = [
  { name: 'Access', href: '/access' },
  { name: 'Insights', href: '/insights' },
  { name: 'Contact', href: '/contact' },
];

/** Footer column links derived from the same structure where possible */
export const FOOTER_LINK_GROUPS = {
  platform: [
    { name: 'Platform Overview', href: '/platform' },
    { name: 'Intelligence Terminal', href: '/platform/terminal' },
    { name: 'Signal Engine', href: '/platform/signal-engine' },
    { name: 'Data Foundation', href: '/platform/data-foundation' },
    { name: 'API Access', href: '/platform/api' },
  ],
  intelligence: [
    { name: 'Intelligence Overview', href: '/intelligence' },
    { name: 'Africa Intelligence', href: '/intelligence/africa' },
    { name: 'Caribbean Intelligence', href: '/intelligence/caribbean' },
    { name: 'Trade Intelligence', href: '/intelligence/trade' },
    { name: 'AGOA Legislative Tracker', href: '/intelligence/trade/agoa' },
    { name: 'AfCFTA Status Tracker', href: '/intelligence/trade/afcfta' },
    { name: 'Supply-Demand Matrix', href: '/intelligence/trade/supply-demand' },
    { name: 'Intelligence Map', href: '/intelligence/map' },
    { name: 'Country Comparison', href: '/intelligence/compare' },
  ],
  insights: [
    { name: 'Insights Overview', href: '/insights' },
    { name: 'Souvera News', href: '/insights/news' },
    { name: 'Strategic Briefings', href: '/insights/briefings' },
    { name: 'Market Rankings', href: '/insights/rankings' },
    { name: 'Data Methodology', href: '/insights/methodology' },
  ],
  access: [
    { name: 'Request Access', href: '/access/request-access' },
    { name: 'Access Plans', href: '/access' },
    { name: 'Institutional Solutions', href: '/access/institutional' },
    { name: 'Request Demo', href: '/access/request-demo' },
    { name: 'Contact Sales', href: '/contact' },
  ],
  company: [
    { name: 'About Souvera', href: '/about' },
    { name: 'Afronovation, Inc.', href: 'https://www.afronovation.com' },
    { name: 'System Status', href: '/status' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/legal/privacy' },
    { name: 'Terms of Service', href: '/legal/terms' },
    { name: 'Cookie Policy', href: '/legal/cookies' },
    { name: 'Compliance', href: '/resources/compliance' },
    { name: 'Data Sources', href: '/resources/data-sources' },
  ],
} as const;
