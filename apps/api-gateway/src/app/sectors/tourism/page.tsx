import type { Metadata } from 'next';
import { ComingSoonPage } from '@/components/templates/ComingSoonPage';

export const metadata: Metadata = {
  title: 'Tourism & Hospitality | Souvera',
  description: 'Intelligence on Caribbean tourism including eco-tourism, luxury resort development, cultural tourism, and arrival data.',
  keywords: ['Caribbean tourism', 'Caribbean hospitality', 'eco-tourism Caribbean', 'resort development'],
  openGraph: {
    title: 'Tourism & Hospitality | Souvera',
    description: 'Intelligence on Caribbean tourism including eco-tourism, resort development, and cultural tourism.',
    url: 'https://souvera.vercel.app/sectors/tourism',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors/tourism',
  },
};

export default function TourismPage() {
  return (
    <ComingSoonPage
      title="Tourism & Hospitality"
      tagline="Sector Intelligence"
      description="Deep-dive intelligence on tourism and hospitality is in development. Request early access to receive updates when sector reports are available."
      iconName="palmtree"
      expectedRelease="Q2 2026"
      backLink={{ label: 'Back to Sectors', href: '/sectors' }}
    />
  );
}
