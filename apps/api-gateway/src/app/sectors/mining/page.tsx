import type { Metadata } from 'next';
import { Pickaxe } from 'lucide-react';
import { SectorOverviewPage } from '@/components/sectors/SectorOverviewPage';
import { MINING_SECTOR } from '@/data/sectors/sector-overviews';

export const metadata: Metadata = {
  title: 'Mining & Minerals | Souvera',
  description: MINING_SECTOR.description,
  openGraph: {
    title: 'Mining & Minerals | Souvera',
    description: MINING_SECTOR.subtitle,
    url: 'https://souveraterminal.com/sectors/mining',
  },
  alternates: {
    canonical: 'https://souveraterminal.com/sectors/mining',
  },
};

export default function MiningPage() {
  return <SectorOverviewPage content={MINING_SECTOR} icon={Pickaxe} accentColor="amber" />;
}
