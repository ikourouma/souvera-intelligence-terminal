import type { Metadata } from 'next';
import { ComingSoonPage } from '@/components/templates/ComingSoonPage';

export const metadata: Metadata = {
  title: 'Intelligence Terminal | Souvera',
  description: 'Interactive intelligence terminal with country profiles, market indicators, and geospatial analysis for African and Caribbean markets.',
  openGraph: {
    title: 'Intelligence Terminal | Souvera',
    description: 'Interactive intelligence terminal with country profiles, market indicators, and geospatial analysis for African and Caribbean markets.',
    url: 'https://souvera.vercel.app/platform/terminal',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/platform/terminal',
  },
};

export default function TerminalPage() {
  return (
    <ComingSoonPage
      title="Intelligence Terminal"
      tagline="Coming Soon"
      description="Our interactive intelligence terminal is currently in development. Request early access to be notified when it launches."
      iconName="terminal"
      expectedRelease="Q2 2026"
      backLink={{ label: 'Back to Platform', href: '/platform' }}
    />
  );
}
