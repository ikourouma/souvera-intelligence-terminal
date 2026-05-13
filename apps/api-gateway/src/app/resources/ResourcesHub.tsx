'use client';

import { HubPageTemplate, type HubContent } from '@/components/templates/HubPageTemplate';
import { Database, FileText, Shield, HelpCircle, Activity } from 'lucide-react';

const CONTENT: HubContent = {
  tagline: 'Resources',
  title: 'Documentation & Support.',
  subtitle: 'Everything you need to understand how Souvera works.',
  description: 'Access our data source documentation, compliance information, and support resources. We believe in transparency about how our intelligence is built.',
  primaryCta: {
    label: 'View Data Sources',
    href: '/resources/data-sources',
  },
  secondaryCta: {
    label: 'Contact Support',
    href: '/contact',
  },
  links: [
    {
      title: 'Data Sources',
      description: 'Comprehensive documentation of our primary data sources including IMF, World Bank, and regional development banks.',
      href: '/resources/data-sources',
      icon: Database,
      badge: 'Documentation',
      badgeColor: '#3B82F6',
    },
    {
      title: 'Source Registry',
      description: 'Detailed registry of all data sources used across the Souvera platform, organized by type and region.',
      href: '/resources/source-registry',
      icon: FileText,
    },
    {
      title: 'Compliance',
      description: 'Information about our data handling practices, privacy standards, and regulatory compliance.',
      href: '/resources/compliance',
      icon: Shield,
    },
    {
      title: 'FAQ',
      description: 'Frequently asked questions about Souvera, our data, access plans, and enterprise solutions.',
      href: '/resources/faq',
      icon: HelpCircle,
    },
    {
      title: 'System Status',
      description: 'Current operational status of Souvera services. Status is manually reviewed.',
      href: '/status',
      icon: Activity,
      badge: 'Status',
      badgeColor: '#22C55E',
    },
  ],
};

export function ResourcesHub() {
  return <HubPageTemplate content={CONTENT} />;
}
