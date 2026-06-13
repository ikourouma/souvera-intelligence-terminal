import type { Metadata } from 'next';
import { Palmtree } from 'lucide-react';
import { SectorOverviewPage } from '@/components/sectors/SectorOverviewPage';
import { TOURISM_HOSPITALITY_SECTOR } from '@/data/sectors/sector-overviews';

export const metadata: Metadata = {
  title: 'Tourism & Hospitality | Souvera',
  description: TOURISM_HOSPITALITY_SECTOR.description,
  keywords: [
    'tourism Africa',
    'tourism Caribbean',
    'hospitality investment',
    'visitor economy',
    'aviation connectivity',
  ],
  openGraph: {
    title: 'Tourism & Hospitality | Souvera',
    description: TOURISM_HOSPITALITY_SECTOR.subtitle,
    url: 'https://souvera.vercel.app/sectors/tourism-hospitality',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors/tourism-hospitality',
  },
};

export default function TourismHospitalityPage() {
  return (
    <SectorOverviewPage content={TOURISM_HOSPITALITY_SECTOR} icon={Palmtree} accentColor="cyan" />
  );
}
