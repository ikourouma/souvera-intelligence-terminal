import type { Metadata } from 'next';
import { Gem } from 'lucide-react';
import { SectorOverviewPage } from '@/components/sectors/SectorOverviewPage';
import { CRITICAL_MINERALS_SECTOR } from '@/data/sectors/sector-overviews';

export const metadata: Metadata = {
  title: 'Mining & Critical Minerals | Souvera',
  description: CRITICAL_MINERALS_SECTOR.description,
  keywords: ['critical minerals Africa', 'cobalt', 'lithium', 'EV supply chain', 'mining Africa'],
  openGraph: {
    title: 'Mining & Critical Minerals | Souvera',
    description: CRITICAL_MINERALS_SECTOR.subtitle,
    url: 'https://souvera.vercel.app/sectors/critical-minerals',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors/critical-minerals',
  },
};

export default function CriticalMineralsPage() {
  return (
    <SectorOverviewPage content={CRITICAL_MINERALS_SECTOR} icon={Gem} accentColor="amber" />
  );
}
