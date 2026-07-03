'use client';

import { HubPageTemplate, type HubContent } from '@/components/templates/HubPageTemplate';
import {
  Banknote,
  Gem,
  Zap,
  Wheat,
  Truck,
  Palmtree,
  Network,
  Cpu,
  Factory,
  Pickaxe,
} from 'lucide-react';

const CONTENT: HubContent = {
  tagline: 'Sector Intelligence',
  title: 'Strategic Sectors Across Two Continents.',
  subtitle: 'Deep-dive analysis into the industries driving growth.',
  description:
    'Souvera tracks strategic sectors across African and Caribbean markets, providing institutional-grade analysis of market size, growth trajectories, key players, and investment opportunities.',
  primaryCta: {
    label: 'Create free account',
    href: '/signup',
  },
  secondaryCta: {
    label: 'View Methodology',
    href: '/insights/methodology',
  },
  highlights: [
    { value: '10', label: 'Strategic Sectors' },
    { value: '$600B+', label: 'Market Opportunity' },
    { value: '50+', label: 'Markets Covered' },
    { value: 'Live', label: 'Sector Overviews' },
  ],
  links: [
    {
      title: 'Technology & Software',
      description:
        'SaaS, enterprise software, developer talent, and cloud-native adoption across emerging markets.',
      href: '/sectors/technology',
      icon: Cpu,
      badge: 'High Growth',
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
      title: 'Digital Infrastructure',
      description:
        'Broadband, cloud readiness, digital public infrastructure, and cybersecurity across African and Caribbean markets.',
      href: '/sectors/digital-infrastructure',
      icon: Network,
      badge: 'Infrastructure',
      badgeColor: '#8B5CF6',
    },
    {
      title: 'Manufacturing & Textiles',
      description:
        'Apparel exports, industrial production, AfCFTA corridors, and special economic zone investment.',
      href: '/sectors/manufacturing-textiles',
      icon: Factory,
      badge: '$45B Market',
      badgeColor: '#F59E0B',
    },
    {
      title: 'Mining & Minerals',
      description:
        'Gold, bauxite, industrial minerals, licensing frameworks, and community relations across resource economies.',
      href: '/sectors/mining',
      icon: Pickaxe,
      badge: 'Resource Base',
      badgeColor: '#EA580C',
    },
    {
      title: 'Critical Minerals',
      description: 'Cobalt, lithium, copper, and rare earth elements. EV supply chain dynamics and strategic reserves.',
      href: '/sectors/critical-minerals',
      icon: Gem,
      badge: '$320B Market',
      badgeColor: '#D97706',
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
