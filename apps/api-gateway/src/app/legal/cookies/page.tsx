import type { Metadata } from 'next';
import { ComplianceLayout } from '@/components/layout/ComplianceLayout';
import type { LegalSection } from '@/components/layout/ComplianceLayout';

export const metadata: Metadata = {
  title: 'Cookie Policy | Souvera',
  description: 'Information about cookies and session technologies used by Souvera Intelligence.',
  alternates: { canonical: 'https://souvera.vercel.app/legal/cookies' },
};

const COOKIE_SECTIONS: LegalSection[] = [
  {
    title: '1. Essential Cookies',
    content: (
      <p>
        Souvera uses technical cookies and local storage to maintain your authenticated session,
        remember preferences, and protect against unauthorized access. These are required for the
        Intelligence Terminal to function and cannot be disabled while using authenticated features.
      </p>
    ),
  },
  {
    title: '2. Analytics',
    content: (
      <p>
        We may use privacy-conscious analytics to understand aggregate usage patterns. No advertising
        cookies are deployed on the institutional terminal.
      </p>
    ),
  },
  {
    title: '3. Managing Cookies',
    content: (
      <p>
        You can control cookies through your browser settings. Disabling essential cookies may prevent
        login and tier-gated features from working correctly.
      </p>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <ComplianceLayout
      title="Cookie Policy"
      description="How Souvera uses cookies and similar technologies for authentication and session management."
      lastUpdated="July 2026"
      sections={COOKIE_SECTIONS}
    />
  );
}
