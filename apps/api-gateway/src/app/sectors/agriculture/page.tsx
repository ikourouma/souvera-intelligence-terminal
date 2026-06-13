import type { Metadata } from 'next';
import { Wheat } from 'lucide-react';
import { SectorOverviewPage } from '@/components/sectors/SectorOverviewPage';
import { AGRICULTURE_SECTOR } from '@/data/sectors/sector-overviews';

export const metadata: Metadata = {
  title: 'Agriculture & Agribusiness | Souvera',
  description: AGRICULTURE_SECTOR.description,
  keywords: ['Africa agriculture', 'agribusiness', 'AfCFTA food trade', 'agritech Africa'],
  openGraph: {
    title: 'Agriculture & Agribusiness | Souvera',
    description: AGRICULTURE_SECTOR.subtitle,
    url: 'https://souvera.vercel.app/sectors/agriculture',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors/agriculture',
  },
};

export default function AgriculturePage() {
  return <SectorOverviewPage content={AGRICULTURE_SECTOR} icon={Wheat} accentColor="green" />;
}
