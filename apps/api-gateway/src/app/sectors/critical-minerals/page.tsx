import type { Metadata } from 'next';
import { ComingSoonPage } from '@/components/templates/ComingSoonPage';

export const metadata: Metadata = {
  title: 'Critical Minerals & Mining | Souvera',
  description: 'Intelligence on African mining and critical minerals including cobalt, lithium, copper, and rare earth elements for EV supply chains.',
  keywords: ['Africa mining', 'critical minerals', 'cobalt Africa', 'lithium Africa', 'EV supply chain'],
  openGraph: {
    title: 'Critical Minerals & Mining | Souvera',
    description: 'Intelligence on African mining and critical minerals including cobalt, lithium, and copper.',
    url: 'https://souvera.vercel.app/sectors/critical-minerals',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors/critical-minerals',
  },
};

export default function CriticalMineralsPage() {
  return (
    <ComingSoonPage
      title="Critical Minerals & Mining"
      tagline="Sector Intelligence"
      description="Deep-dive intelligence on African mining and critical minerals is in development. Request early access to receive updates when sector reports are available."
      iconName="gem"
      expectedRelease="Q2 2026"
      backLink={{ label: 'Back to Sectors', href: '/sectors' }}
    />
  );
}
