import type { Metadata } from 'next';
import { ComplianceLayout } from '@/components/layout/ComplianceLayout';
import type { LegalSection } from '@/components/layout/ComplianceLayout';

export const metadata: Metadata = {
  title: 'Accessibility Statement | Souvera',
  description: 'Souvera commitment to accessible institutional intelligence interfaces.',
  alternates: { canonical: 'https://souvera.vercel.app/legal/accessibility' },
};

const ACCESSIBILITY_SECTIONS: LegalSection[] = [
  {
    title: '1. Our Commitment',
    content: (
      <p>
        Souvera is committed to ensuring our intelligence platform is accessible to institutional
        stakeholders including analysts, researchers, and decision-makers with diverse needs.
      </p>
    ),
  },
  {
    title: '2. Standards',
    content: (
      <p>
        We target WCAG 2.1 Level AA conformance for public marketing pages and core terminal workflows.
        Ongoing improvements include keyboard navigation, sufficient color contrast, semantic markup,
        and screen-reader-friendly labels on interactive controls.
      </p>
    ),
  },
  {
    title: '3. Feedback',
    content: (
      <p>
        If you encounter accessibility barriers, contact{' '}
        <a href="mailto:compliance@souvera.com">compliance@souvera.com</a> with the page URL and
        description of the issue. We aim to respond within five business days.
      </p>
    ),
  },
];

export default function AccessibilityPage() {
  return (
    <ComplianceLayout
      title="Accessibility Statement"
      description="Our commitment to making Souvera Intelligence accessible to institutional stakeholders."
      lastUpdated="July 2026"
      sections={ACCESSIBILITY_SECTIONS}
    />
  );
}
