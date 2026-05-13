import type { Metadata } from 'next';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { IntelligenceHub } from './IntelligenceHub';

export const metadata: Metadata = {
  title: 'Intelligence | Market Intelligence for Africa & Caribbean | Souvera',
  description: 'Institutional-grade market intelligence for Africa and the Caribbean. Country profiles, economic indicators, sector analysis, and strategic context for 74 countries across two continents.',
  keywords: ['Africa intelligence', 'Caribbean intelligence', 'market intelligence', 'emerging markets', 'African economy', 'Caribbean economy', 'country profiles', 'economic indicators'],
  openGraph: {
    title: 'Intelligence | Market Intelligence for Africa & Caribbean | Souvera',
    description: 'Institutional-grade market intelligence for Africa and the Caribbean. 74 countries. 6 sectors. One platform.',
    url: 'https://souvera.vercel.app/intelligence',
    type: 'website',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/intelligence',
  },
};

export default function IntelligencePage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />
      <IntelligenceHub />
      <SouveraFooter />
    </main>
  );
}
