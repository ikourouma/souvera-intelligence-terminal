import type { Metadata } from 'next';
import { ComplianceLayout } from '@/components/layout/ComplianceLayout';
import { TERMS_SECTIONS } from './sections';

export const metadata: Metadata = {
  title: 'Terms of Service | Souvera',
  description:
    'Terms and conditions for using the Souvera Intelligence Terminal, including Explorer free tier, paid access tiers, and acceptable use.',
  openGraph: {
    title: 'Terms of Service | Souvera',
    description: 'Terms of service for Souvera Intelligence platform users.',
    url: 'https://souvera.vercel.app/legal/terms',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/legal/terms',
  },
};

export default function TermsPage() {
  return (
    <ComplianceLayout
      title="Terms of Service"
      description="Terms and conditions governing your use of Souvera Intelligence and related services."
      lastUpdated="July 2026"
      sections={TERMS_SECTIONS}
    />
  );
}
