import type { Metadata } from 'next';
import { ComingSoonPage } from '@/components/templates/ComingSoonPage';

export const metadata: Metadata = {
  title: 'Request Demo | Souvera',
  description: 'Request a personalized demo of the Souvera Intelligence platform for your organization.',
  openGraph: {
    title: 'Request Demo | Souvera',
    description: 'Request a personalized demo of the Souvera Intelligence platform.',
    url: 'https://souvera.vercel.app/access/request-demo',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/access/request-demo',
  },
};

export default function RequestDemoPage() {
  return (
    <ComingSoonPage
      title="Request Demo"
      tagline="Contact Sales"
      description="Demos are currently arranged through our sales team. Please contact us to schedule a personalized walkthrough of the Souvera platform."
      iconName="presentation"
      backLink={{ label: 'Contact Sales', href: '/contact' }}
    />
  );
}
