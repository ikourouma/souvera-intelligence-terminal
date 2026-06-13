import type { Metadata } from 'next';
import { Truck } from 'lucide-react';
import { SectorOverviewPage } from '@/components/sectors/SectorOverviewPage';
import { LOGISTICS_SECTOR } from '@/data/sectors/sector-overviews';

export const metadata: Metadata = {
  title: 'Logistics & Trade | Souvera',
  description: LOGISTICS_SECTOR.description,
  keywords: ['Africa logistics', 'Africa trade', 'AfCFTA', 'Africa ports', 'supply chain Africa'],
  openGraph: {
    title: 'Logistics & Trade | Souvera',
    description: LOGISTICS_SECTOR.subtitle,
    url: 'https://souvera.vercel.app/sectors/logistics',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors/logistics',
  },
};

export default function LogisticsPage() {
  return <SectorOverviewPage content={LOGISTICS_SECTOR} icon={Truck} accentColor="purple" />;
}
