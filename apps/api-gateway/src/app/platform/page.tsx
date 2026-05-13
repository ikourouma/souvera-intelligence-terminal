import type { Metadata } from 'next';
import { PlatformHub } from './PlatformHub';

export const metadata: Metadata = {
  title: 'Platform | Souvera Intelligence Terminal',
  description: 'Explore the Souvera platform: intelligence terminal, signal engine, data foundation, and API access for institutional-grade African and Caribbean market intelligence.',
  openGraph: {
    title: 'Platform | Souvera Intelligence Terminal',
    description: 'Explore the Souvera platform: intelligence terminal, signal engine, data foundation, and API access for institutional-grade African and Caribbean market intelligence.',
    url: 'https://souvera.vercel.app/platform',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/platform',
  },
};

export default function PlatformPage() {
  return <PlatformHub />;
}
