'use client';

import { HubPageTemplate, type HubContent } from '@/components/templates/HubPageTemplate';
import { Terminal, Zap, Database, BarChart3 } from 'lucide-react';

const CONTENT: HubContent = {
  tagline: 'Platform Overview',
  title: 'The Souvera Intelligence Platform.',
  subtitle: 'Institutional-grade infrastructure for African and Caribbean market intelligence.',
  description: 'Souvera provides a comprehensive suite of tools designed to deliver transparent, data-driven insights for governments, development finance institutions, investors, and global enterprises.',
  primaryCta: {
    label: 'Request Access',
    href: '/access/request-access',
  },
  secondaryCta: {
    label: 'View Access Plans',
    href: '/access',
  },
  highlights: [
    { value: '50+', label: 'Markets Covered' },
    { value: '6', label: 'Key Sectors' },
    { value: 'IMF', label: 'Data Sources' },
    { value: 'REST', label: 'API Access' },
  ],
  links: [
    {
      title: 'Intelligence Terminal',
      description: 'Interactive dashboards with country profiles, market indicators, and geospatial intelligence across African and Caribbean markets.',
      href: '/platform/terminal',
      icon: Terminal,
      badge: 'Core Product',
      badgeColor: '#3B82F6',
    },
    {
      title: 'Signal Engine',
      description: 'AI-assisted signal indicators derived from official sources. Track growth vectors, risk indicators, and sector momentum with anomaly detection support.',
      href: '/platform/signal-engine',
      icon: Zap,
      badge: 'Analytics',
      badgeColor: '#22C55E',
    },
    {
      title: 'Data Foundation',
      description: 'Comprehensive documentation of our data sources, validation methodology, and quality assurance processes.',
      href: '/platform/data-foundation',
      icon: BarChart3,
    },
    {
      title: 'API Access',
      description: 'RESTful API for programmatic access to Souvera intelligence. JSON and CSV formats with bulk data capabilities.',
      href: '/platform/api',
      icon: Database,
      badge: 'Enterprise',
      badgeColor: '#A78BFA',
    },
  ],
};

export function PlatformHub() {
  return <HubPageTemplate content={CONTENT} />;
}
