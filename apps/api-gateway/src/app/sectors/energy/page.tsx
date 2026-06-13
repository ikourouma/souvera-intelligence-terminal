import type { Metadata } from 'next';
import { Zap } from 'lucide-react';
import { SectorOverviewPage } from '@/components/sectors/SectorOverviewPage';
import { ENERGY_SECTOR } from '@/data/sectors/sector-overviews';

export const metadata: Metadata = {
  title: 'Energy & Renewables | Souvera',
  description: ENERGY_SECTOR.description,
  openGraph: {
    title: 'Energy & Renewables | Souvera',
    description: ENERGY_SECTOR.subtitle,
    url: 'https://souvera.vercel.app/sectors/energy',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors/energy',
  },
};

export default function EnergyPage() {
  return <SectorOverviewPage content={ENERGY_SECTOR} icon={Zap} accentColor="green" />;
}
