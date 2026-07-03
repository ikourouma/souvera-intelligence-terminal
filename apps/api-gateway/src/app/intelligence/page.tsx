import type { Metadata } from 'next';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { TractionJsonLd, buildTractionMetadata } from '@/components/marketing/traction/TractionJsonLd';
import { IntelligenceHub } from './IntelligenceHub';

const baseMetadata: Metadata = {
  title: 'Intelligence | Market Intelligence for Africa & Caribbean | Souvera',
  description:
    'Institutional-grade market intelligence for Africa and the Caribbean. Country profiles, economic indicators, sector analysis, and strategic context for 74 countries across two continents.',
  keywords: [
    'Africa intelligence',
    'Caribbean intelligence',
    'market intelligence',
    'emerging markets',
    'African economy',
    'Caribbean economy',
    'country profiles',
    'economic indicators',
  ],
  openGraph: {
    title: 'Intelligence | Market Intelligence for Africa & Caribbean | Souvera',
    description:
      'Institutional-grade market intelligence for Africa and the Caribbean. 74 countries. 8 sectors. One platform.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/intelligence',
  },
};

export const metadata: Metadata = buildTractionMetadata('intelligence', baseMetadata);

export default function IntelligencePage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <TractionJsonLd page="intelligence" />
      <SouveraMegaNav />
      <IntelligenceHub />
      <SouveraFooter />
    </main>
  );
}
