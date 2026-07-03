import type { Metadata } from 'next';
import { Factory } from 'lucide-react';
import { SectorOverviewPage } from '@/components/sectors/SectorOverviewPage';
import { MANUFACTURING_SECTOR } from '@/data/sectors/sector-overviews';

export const metadata: Metadata = {
  title: 'Manufacturing & Textiles | Souvera',
  description: MANUFACTURING_SECTOR.description,
  openGraph: {
    title: 'Manufacturing & Textiles | Souvera',
    description: MANUFACTURING_SECTOR.subtitle,
    url: 'https://souveraterminal.com/sectors/manufacturing-textiles',
  },
  alternates: {
    canonical: 'https://souveraterminal.com/sectors/manufacturing-textiles',
  },
};

export default function ManufacturingTextilesPage() {
  return (
    <SectorOverviewPage content={MANUFACTURING_SECTOR} icon={Factory} accentColor="amber" />
  );
}
