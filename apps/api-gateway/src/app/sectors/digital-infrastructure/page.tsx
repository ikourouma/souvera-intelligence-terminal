import type { Metadata } from 'next';
import { Network } from 'lucide-react';
import { SectorOverviewPage } from '@/components/sectors/SectorOverviewPage';
import { DIGITAL_INFRASTRUCTURE_SECTOR } from '@/data/sectors/sector-overviews';

export const metadata: Metadata = {
  title: 'Digital Infrastructure | Souvera',
  description: DIGITAL_INFRASTRUCTURE_SECTOR.description,
  keywords: [
    'digital infrastructure Africa',
    'broadband Africa',
    'data centers Africa',
    'digital public infrastructure',
    'e-government Africa',
  ],
  openGraph: {
    title: 'Digital Infrastructure | Souvera',
    description: DIGITAL_INFRASTRUCTURE_SECTOR.subtitle,
    url: 'https://souvera.vercel.app/sectors/digital-infrastructure',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors/digital-infrastructure',
  },
};

export default function DigitalInfrastructurePage() {
  return (
    <SectorOverviewPage
      content={DIGITAL_INFRASTRUCTURE_SECTOR}
      icon={Network}
      accentColor="indigo"
    />
  );
}
