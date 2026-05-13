import type { Metadata } from 'next';
import { DigitalInfrastructureHub } from './DigitalInfrastructureHub';

export const metadata: Metadata = {
  title: 'Digital Infrastructure | Souvera',
  description: 'Sovereign-grade intelligence on broadband, cloud, digital public infrastructure, AI readiness, cybersecurity, payments, and institutional digital transformation across African and Caribbean markets.',
  keywords: ['digital infrastructure', 'broadband Africa', 'cloud infrastructure', 'digital public infrastructure', 'e-government', 'AI readiness', 'cybersecurity', 'sovereign data', 'fiber backbone', 'data center Africa'],
  openGraph: {
    title: 'Digital Infrastructure | Souvera',
    description: 'Sovereign-grade intelligence on broadband, cloud, digital public infrastructure, AI readiness, cybersecurity, payments, and institutional digital transformation across African and Caribbean markets.',
    url: 'https://souvera.vercel.app/sectors/digital-infrastructure',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors/digital-infrastructure',
  },
};

export default function DigitalInfrastructurePage() {
  return <DigitalInfrastructureHub />;
}
