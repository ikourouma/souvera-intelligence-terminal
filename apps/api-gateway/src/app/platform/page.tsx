import type { Metadata } from 'next';
import { TractionJsonLd, buildTractionMetadata } from '@/components/marketing/traction/TractionJsonLd';
import { PlatformHub } from './PlatformHub';

const baseMetadata: Metadata = {
  title: 'Platform | Souvera Intelligence Terminal',
  description:
    'Institutional-grade market intelligence platform for 74 African and Caribbean markets. Intelligence terminal, signal engine, governed data foundation, and enterprise API. Start free with Explorer.',
  openGraph: {
    title: 'Platform | Souvera Intelligence Terminal',
    description:
      '74 markets. 8+ institutional sources. One governed intelligence stack — terminal, signals, data foundation, and API.',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/platform',
  },
};

export const metadata: Metadata = buildTractionMetadata('platform', baseMetadata);

export default function PlatformPage() {
  return (
    <>
      <TractionJsonLd page="platform" />
      <PlatformHub />
    </>
  );
}
