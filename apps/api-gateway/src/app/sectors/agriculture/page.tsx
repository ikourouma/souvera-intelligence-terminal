import type { Metadata } from 'next';
import { ComingSoonPage } from '@/components/templates/ComingSoonPage';

export const metadata: Metadata = {
  title: 'Agriculture & Agribusiness | Souvera',
  description: 'Intelligence on African agriculture including cocoa, coffee, cashew, agritech platforms, and AfCFTA trade corridors.',
  keywords: ['Africa agriculture', 'African agribusiness', 'cocoa Africa', 'coffee Africa', 'agritech'],
  openGraph: {
    title: 'Agriculture & Agribusiness | Souvera',
    description: 'Intelligence on African agriculture including cocoa, coffee, cashew, and agritech platforms.',
    url: 'https://souvera.vercel.app/sectors/agriculture',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors/agriculture',
  },
};

export default function AgriculturePage() {
  return (
    <ComingSoonPage
      title="Agriculture & Agribusiness"
      tagline="Sector Intelligence"
      description="Deep-dive intelligence on agriculture and agribusiness is in development. Request early access to receive updates when sector reports are available."
      iconName="wheat"
      expectedRelease="Q2 2026"
      backLink={{ label: 'Back to Sectors', href: '/sectors' }}
    />
  );
}
