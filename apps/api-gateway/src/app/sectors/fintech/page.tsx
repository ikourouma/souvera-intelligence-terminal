import type { Metadata } from 'next';
import { Banknote } from 'lucide-react';
import { SectorOverviewPage } from '@/components/sectors/SectorOverviewPage';
import { FINTECH_SECTOR } from '@/data/sectors/sector-overviews';

export const metadata: Metadata = {
  title: 'Fintech & Digital Finance | Souvera',
  description: FINTECH_SECTOR.description,
  openGraph: {
    title: 'Fintech & Digital Finance | Souvera',
    description: FINTECH_SECTOR.subtitle,
    url: 'https://souvera.vercel.app/sectors/fintech',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors/fintech',
  },
};

export default function FintechPage() {
  return <SectorOverviewPage content={FINTECH_SECTOR} icon={Banknote} accentColor="blue" />;
}
