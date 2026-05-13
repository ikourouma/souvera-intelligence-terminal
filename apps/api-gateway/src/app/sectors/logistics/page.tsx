import type { Metadata } from 'next';
import { ComingSoonPage } from '@/components/templates/ComingSoonPage';

export const metadata: Metadata = {
  title: 'Logistics & Trade | Souvera',
  description: 'Intelligence on African and Caribbean logistics including port infrastructure, trade corridors, supply chain networks, and regional integration.',
  keywords: ['Africa logistics', 'Africa trade', 'AfCFTA', 'Africa ports', 'supply chain Africa'],
  openGraph: {
    title: 'Logistics & Trade | Souvera',
    description: 'Intelligence on African and Caribbean logistics including port infrastructure and trade corridors.',
    url: 'https://souvera.vercel.app/sectors/logistics',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors/logistics',
  },
};

export default function LogisticsPage() {
  return (
    <ComingSoonPage
      title="Logistics & Trade"
      tagline="Sector Intelligence"
      description="Deep-dive intelligence on logistics and trade is in development. Request early access to receive updates when sector reports are available."
      iconName="truck"
      expectedRelease="Q2 2026"
      backLink={{ label: 'Back to Sectors', href: '/sectors' }}
    />
  );
}
