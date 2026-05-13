import type { Metadata } from 'next';
import { ComingSoonPage } from '@/components/templates/ComingSoonPage';

export const metadata: Metadata = {
  title: 'Fintech & Digital Finance | Souvera',
  description: 'Intelligence on African fintech markets including mobile money, B2B payments, digital banking, and regulatory developments.',
  keywords: ['Africa fintech', 'mobile money', 'digital banking Africa', 'African payments'],
  openGraph: {
    title: 'Fintech & Digital Finance | Souvera',
    description: 'Intelligence on African fintech markets including mobile money, B2B payments, and digital banking.',
    url: 'https://souvera.vercel.app/sectors/fintech',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors/fintech',
  },
};

export default function FintechPage() {
  return (
    <ComingSoonPage
      title="Fintech & Digital Finance"
      tagline="Sector Intelligence"
      description="Deep-dive intelligence on African fintech markets is in development. Request early access to receive updates when sector reports are available."
      iconName="banknote"
      expectedRelease="Q2 2026"
      backLink={{ label: 'Back to Sectors', href: '/sectors' }}
    />
  );
}
