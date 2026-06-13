'use client';

import { HubPageTemplate, type HubContent } from '@/components/templates/HubPageTemplate';
import { Banknote, Gem, Zap, Wheat, Truck, Palmtree, Network } from 'lucide-react';

const CONTENT: HubContent = {
  tagline: 'Sector Intelligence',
  title: 'Strategic Sectors Across Two Continents.',
  subtitle: 'Deep-dive analysis into the industries driving growth.',
  description:
    'Souvera tracks strategic sectors across African and Caribbean markets, providing institutional-grade analysis of market size, growth trajectories, key players, and investment opportunities.',
  primaryCta: {
    label: 'Request Access',
    href: '/access/request-access',
  },
  secondaryCta: {
    label: 'View Methodology',
    href: '/insights/methodology',
  },
  highlights: [
    { value: '7', label: 'Strategic Sectors' },
    { value: '$600B+', label: 'Market Opportunity' },
    { value: '50+', label: 'Markets Covered' },
    { value: 'Live', label: 'Sector Overviews' },
  ],
  links: [
    {
      title: 'Digital Infrastructure',
      description:
        'Broadband, cloud readiness, digital public infrastructure, and cybersecurity across African and Caribbean markets.',
      href: '/sectors/digital-infrastructure',
      icon: Network,
      badge: 'Infrastructure',
      badgeColor: '#6366F1',
    },
    {
      title: 'Fintech & Digital Finance',
      description: 'Mobile money, B2B payments, digital banking, and regulatory developments across African markets.',
      href: '/sectors/fintech',
      icon: Banknote,
      badge: '$14B Market',
      badgeColor: '#3B82F6',
    },
    {
      title: 'Critical Minerals & Mining',
      description: 'Cobalt, lithium, copper, and rare earth elements. EV supply chain dynamics and strategic reserves.',
      href: '/sectors/critical-minerals',
      icon: Gem,
      badge: '$320B Market',
      badgeColor: '#F59E0B',
    },
    {
      title: 'Energy & Renewables',
      description: 'LNG expansion, green hydrogen, solar infrastructure, and energy transition across African and Caribbean markets.',
      href: '/sectors/energy',
      icon: Zap,
      badge: '$28B Market',
      badgeColor: '#22C55E',
    },
    {
      title: 'Agriculture & Agribusiness',
      description: 'Cocoa, coffee, cashew, and agritech platforms. AfCFTA trade corridors and food security.',
      href: '/sectors/agriculture',
      icon: Wheat,
      badge: '$180B Market',
      badgeColor: '#10B981',
    },
    {
      title: 'Logistics & Trade',
      description: 'Port infrastructure, trade corridors, supply chain networks, and regional integration.',
      href: '/sectors/logistics',
      icon: Truck,
      badge: '$25B Market',
      badgeColor: '#A78BFA',
    },
    {
      title: 'Tourism & Hospitality',
      description: 'Caribbean tourism dynamics, eco-tourism, luxury resort development, and cultural tourism.',
      href: '/sectors/tourism-hospitality',
      icon: Palmtree,
      badge: '$40B Market',
      badgeColor: '#06B6D4',
    },
  ],
};

export function SectorsHub() {
  return <HubPageTemplate content={CONTENT} />;
}
