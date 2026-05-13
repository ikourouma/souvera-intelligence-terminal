'use client';

import { HubPageTemplate, type HubContent } from '@/components/templates/HubPageTemplate';
import { Cloud, Shield, Layers, Network, Zap, Building2, Globe } from 'lucide-react';

const CONTENT: HubContent = {
  tagline: 'Digital Infrastructure Intelligence',
  title: 'Digital Infrastructure.',
  subtitle: 'Sovereign-grade intelligence on broadband, cloud, digital public infrastructure, AI readiness, cybersecurity, payments, and institutional digital transformation across African and Caribbean markets.',
  description: 'Souvera provides comprehensive intelligence on digital infrastructure development, deployment readiness, and institutional transformation to support decision-making by governments, development finance institutions, infrastructure investors, and global telecommunications operators.',
  primaryCta: {
    label: 'Explore Digital Infrastructure Signals',
    href: '/intelligence/map',
  },
  secondaryCta: {
    label: 'Request Sector Briefing',
    href: '/access/request-access',
  },
  highlights: [
    { value: '50+', label: 'Markets Covered' },
    { value: 'Fiber', label: 'Backbone Mapping' },
    { value: 'Cloud', label: 'Readiness Assessment' },
    { value: 'IMF', label: 'Data Sources' },
  ],
  links: [
    {
      title: 'Broadband and Fiber Backbone',
      description: 'Intelligence on national fiber backbone deployment, submarine cable connectivity, last-mile broadband expansion, and internet penetration across African and Caribbean markets.',
      href: '/intelligence/map',
      icon: Network,
      badge: 'Infrastructure',
      badgeColor: '#6366F1',
    },
    {
      title: 'Cloud and Data Center Readiness',
      description: 'Assessment of data center capacity, cloud service provider entry, edge computing infrastructure, and regional connectivity for enterprise and government cloud adoption.',
      href: '/intelligence/map',
      icon: Cloud,
      badge: 'Cloud',
      badgeColor: '#3B82F6',
    },
    {
      title: 'Digital Public Infrastructure',
      description: 'Analysis of digital identity systems, e-government platforms, government digital services, open data initiatives, and institutional digital transformation programs.',
      href: '/intelligence/map',
      icon: Building2,
    },
    {
      title: 'E-Government Modernization',
      description: 'Intelligence on government digital service platforms, citizen services digitization, procurement systems, and institutional capacity for digital governance.',
      href: '/intelligence/map',
      icon: Layers,
    },
    {
      title: 'Payments Interoperability',
      description: 'Coverage of mobile money infrastructure, fintech backbone systems, digital payments interoperability, and financial technology enabling infrastructure.',
      href: '/intelligence/map',
      icon: Zap,
      badge: 'Fintech Infrastructure',
      badgeColor: '#22C55E',
    },
    {
      title: 'Digital ID and Trust Services',
      description: 'Analysis of digital identity frameworks, biometric systems deployment, KYC infrastructure, and trust service providers for digital economy enablement.',
      href: '/intelligence/map',
      icon: Shield,
    },
    {
      title: 'Cybersecurity and Sovereign Data',
      description: 'Intelligence on cybersecurity frameworks, data sovereignty policies, national cybersecurity strategies, and institutional capacity for digital security.',
      href: '/intelligence/map',
      icon: Shield,
      badge: 'Security',
      badgeColor: '#EF4444',
    },
    {
      title: 'AI Readiness and Innovation',
      description: 'Assessment of AI policy frameworks, institutional AI readiness, innovation ecosystems, and capacity for artificial intelligence adoption and governance.',
      href: '/intelligence/map',
      icon: Globe,
      badge: 'Emerging',
      badgeColor: '#A78BFA',
    },
  ],
};

export function DigitalInfrastructureHub() {
  return <HubPageTemplate content={CONTENT} />;
}
