import type { Metadata } from 'next';
import { ComingSoonPage } from '@/components/templates/ComingSoonPage';

export const metadata: Metadata = {
  title: 'Market Rankings | Souvera',
  description: 'Economic rankings for African and Caribbean markets. GDP rankings, growth metrics, sector performance, and investment indicators.',
  openGraph: {
    title: 'Market Rankings | Souvera',
    description: 'Economic rankings for African and Caribbean markets.',
    url: 'https://souvera.vercel.app/insights/rankings',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/insights/rankings',
  },
};

export default function RankingsPage() {
  return (
    <ComingSoonPage
      title="Market Rankings"
      tagline="Coming Soon"
      description="Comprehensive market rankings are in development. Request access to receive updates when our rankings dashboard becomes available."
      iconName="barChart3"
      expectedRelease="Q2 2026"
      backLink={{ label: 'Back to Insights', href: '/insights' }}
    />
  );
}
