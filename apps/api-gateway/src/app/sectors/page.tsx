import type { Metadata } from 'next';
import { SectorsHub } from './SectorsHub';

export const metadata: Metadata = {
  title: 'Sectors | Souvera',
  description: 'Sector intelligence across African and Caribbean markets. Coverage includes fintech, critical minerals, energy, agriculture, logistics, and tourism.',
  openGraph: {
    title: 'Sectors | Souvera',
    description: 'Sector intelligence across African and Caribbean markets.',
    url: 'https://souvera.vercel.app/sectors',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/sectors',
  },
};

export default function SectorsPage() {
  return <SectorsHub />;
}
