import type { Metadata } from 'next';
import { ComingSoonPage } from '@/components/templates/ComingSoonPage';

export const metadata: Metadata = {
  title: 'Energy & Renewables | Souvera',
  description: 'Intelligence on African and Caribbean energy markets including LNG, green hydrogen, solar infrastructure, and energy transition.',
  keywords: ['Africa energy', 'LNG Africa', 'green hydrogen', 'renewable energy Africa', 'Mozambique LNG'],
  openGraph: {
    title: 'Energy & Renewables | Souvera',
    description: 'Intelligence on African and Caribbean energy markets including LNG, green hydrogen, and renewables.',
    url: 'https://souvera.vercel.app/sectors/energy',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors/energy',
  },
};

export default function EnergyPage() {
  return (
    <ComingSoonPage
      title="Energy & Renewables"
      tagline="Sector Intelligence"
      description="Deep-dive intelligence on energy and renewables is in development. Request early access to receive updates when sector reports are available."
      iconName="zap"
      expectedRelease="Q2 2026"
      backLink={{ label: 'Back to Sectors', href: '/sectors' }}
    />
  );
}
