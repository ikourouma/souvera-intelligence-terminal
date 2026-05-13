import type { Metadata } from 'next';
import { ComingSoonPage } from '@/components/templates/ComingSoonPage';

export const metadata: Metadata = {
  title: 'Strategic Briefings | Souvera',
  description: 'Expert-led strategic briefings on African and Caribbean markets. Policy analysis, sector deep-dives, and market intelligence.',
  openGraph: {
    title: 'Strategic Briefings | Souvera',
    description: 'Expert-led strategic briefings on African and Caribbean markets.',
    url: 'https://souvera.vercel.app/insights/briefings',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/insights/briefings',
  },
};

export default function BriefingsPage() {
  return (
    <ComingSoonPage
      title="Strategic Briefings"
      tagline="Coming Soon"
      description="Expert strategic briefings are in development. Request access to receive updates when our research library becomes available."
      iconName="fileText"
      expectedRelease="Q2 2026"
      backLink={{ label: 'Back to Insights', href: '/insights' }}
    />
  );
}
