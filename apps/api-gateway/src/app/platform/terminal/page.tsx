import type { Metadata } from 'next';
import { TerminalBridge } from './TerminalBridge';

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
  return <TerminalBridge />;
}
