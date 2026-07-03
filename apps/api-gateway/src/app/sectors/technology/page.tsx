import type { Metadata } from 'next';
import { Cpu } from 'lucide-react';
import { SectorOverviewPage } from '@/components/sectors/SectorOverviewPage';
import { TECHNOLOGY_SECTOR } from '@/data/sectors/sector-overviews';

export const metadata: Metadata = {
  title: 'Technology & Software | Souvera',
  description: TECHNOLOGY_SECTOR.description,
  openGraph: {
    title: 'Technology & Software | Souvera',
    description: TECHNOLOGY_SECTOR.subtitle,
    url: 'https://souveraterminal.com/sectors/technology',
  },
  alternates: {
    canonical: 'https://souveraterminal.com/sectors/technology',
  },
};

export default function TechnologyPage() {
  return <SectorOverviewPage content={TECHNOLOGY_SECTOR} icon={Cpu} accentColor="indigo" />;
}
