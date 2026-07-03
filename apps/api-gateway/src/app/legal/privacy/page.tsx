import type { Metadata } from 'next';
import { ComplianceLayout } from '@/components/layout/ComplianceLayout';
import { PRIVACY_SECTIONS } from './sections';

export const metadata: Metadata = {
  title: 'Privacy Policy | Souvera',
  description:
    'How Souvera collects, uses, and protects personal information for users of the intelligence terminal and marketing platform.',
  openGraph: {
    title: 'Privacy Policy | Souvera',
    description: 'Privacy policy for Souvera Intelligence platform users.',
    url: 'https://souvera.vercel.app/legal/privacy',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/legal/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <ComplianceLayout
      title="Privacy Policy"
      description="How we collect, use, store, and protect personal information when you use Souvera Intelligence."
      lastUpdated="July 2026"
      sections={PRIVACY_SECTIONS}
    />
  );
}
