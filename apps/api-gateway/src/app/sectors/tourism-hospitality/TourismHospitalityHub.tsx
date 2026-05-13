'use client';

import { HubPageTemplate, type HubContent } from '@/components/templates/HubPageTemplate';
import { Plane, Building2, MapPin, TrendingUp, Globe, Users, Calendar, Mountain } from 'lucide-react';

const CONTENT: HubContent = {
  tagline: 'Tourism & Hospitality Intelligence',
  title: 'Tourism & Hospitality.',
  subtitle: 'Destination, hospitality, aviation, events, and visitor-economy intelligence across African and Caribbean markets.',
  description: 'Souvera provides institutional-grade intelligence on tourism infrastructure, hospitality investment, destination development, aviation connectivity, and visitor economy dynamics to support decision-making by governments, tourism boards, development finance institutions, hospitality investors, and aviation operators.',
  primaryCta: {
    label: 'Explore Tourism Signals',
    href: '/intelligence/map',
  },
  secondaryCta: {
    label: 'Request Sector Briefing',
    href: '/access/request-access',
  },
  highlights: [
    { value: '50+', label: 'Markets Covered' },
    { value: 'Visitor', label: 'Economy Intelligence' },
    { value: 'Aviation', label: 'Connectivity' },
    { value: 'IMF', label: 'Data Sources' },
  ],
  links: [
    {
      title: 'Visitor Economy Intelligence',
      description: 'Analysis of visitor arrivals, foreign exchange contribution, employment impact, and tourism sector contribution to GDP across African and Caribbean markets.',
      href: '/intelligence/map',
      icon: TrendingUp,
      badge: 'Economics',
      badgeColor: '#22C55E',
    },
    {
      title: 'Destination Infrastructure',
      description: 'Intelligence on destination infrastructure including coastal, heritage, and eco-tourism assets, and climate-resilient tourism development.',
      href: '/intelligence/map',
      icon: MapPin,
      badge: 'Infrastructure',
      badgeColor: '#6366F1',
    },
    {
      title: 'Hospitality Investment',
      description: 'Assessment of hotel capacity, resort development, hospitality chain entry, accommodation infrastructure, and tourism real estate investment.',
      href: '/intelligence/map',
      icon: Building2,
    },
    {
      title: 'Aviation and Air Connectivity',
      description: 'Coverage of aviation connectivity, airline route development, airport infrastructure, hub positioning, and air service agreements.',
      href: '/intelligence/map',
      icon: Plane,
      badge: 'Aviation',
      badgeColor: '#3B82F6',
    },
    {
      title: 'Diaspora Travel',
      description: 'Analysis of diaspora engagement, family visitation patterns, remittance-linked travel, and diaspora tourism infrastructure.',
      href: '/intelligence/map',
      icon: Users,
    },
    {
      title: 'Events Economy',
      description: 'Intelligence on MICE capacity (meetings, incentives, conferences, events), cultural festivals, sports tourism, and events infrastructure.',
      href: '/intelligence/map',
      icon: Calendar,
      badge: 'Events',
      badgeColor: '#F59E0B',
    },
    {
      title: 'Cultural and Heritage Tourism',
      description: 'Coverage of cultural heritage sites, UNESCO designations, museum infrastructure, heritage preservation, and cultural tourism development.',
      href: '/intelligence/map',
      icon: Mountain,
    },
    {
      title: 'Tourism Board Modernization',
      description: 'Assessment of destination marketing capacity, digital tourism services, tourism board governance, destination intelligence infrastructure, and institutional capacity.',
      href: '/intelligence/map',
      icon: Globe,
      badge: 'Institutional',
      badgeColor: '#A78BFA',
    },
  ],
};

export function TourismHospitalityHub() {
  return <HubPageTemplate content={CONTENT} />;
}
