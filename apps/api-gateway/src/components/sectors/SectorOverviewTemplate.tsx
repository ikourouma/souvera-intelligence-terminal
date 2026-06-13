import type { LucideIcon } from 'lucide-react';

export interface SectorTheme {
  id: string;
  title: string;
  description: string;
}

export interface SectorOverviewContent {
  slug: string;
  tagline: string;
  title: string;
  subtitle: string;
  description: string;
  marketSize: string;
  growthSignal: string;
  themes: SectorTheme[];
  /** ISO3 codes for key markets — rendered as entitlement-aware links */
  keyMarketIso3: string[];
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export interface SectorOverviewTemplateProps {
  content: SectorOverviewContent;
  icon: LucideIcon;
  accentColor?: 'blue' | 'green' | 'teal' | 'amber' | 'purple' | 'indigo' | 'cyan';
}
