import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://souvera.vercel.app';

type TractionJsonLdProps = {
  page: 'platform' | 'intelligence';
};

const PAGE_CONFIG = {
  platform: {
    name: 'Souvera Intelligence Platform',
    description:
      'Institutional-grade market intelligence platform for 74 African and Caribbean markets. Intelligence terminal, signal engine, governed data foundation, and enterprise API.',
    path: '/platform',
  },
  intelligence: {
    name: 'Souvera Intelligence Hub',
    description:
      'Institutional-grade market intelligence for Africa and the Caribbean. Country profiles, economic indicators, sector analysis, and trade intelligence for 74 markets.',
    path: '/intelligence',
  },
};

export function TractionJsonLd({ page }: TractionJsonLdProps) {
  const config = PAGE_CONFIG[page];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: config.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: config.description,
    url: `${SITE_URL}${config.path}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Explorer free tier — country profiles, intelligence map, and market signals',
    },
    provider: {
      '@type': 'Organization',
      name: 'Afronovation, Inc.',
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function tractionOpenGraphImages(path: string): NonNullable<Metadata['openGraph']>['images'] {
  return [
    {
      url: `${SITE_URL}/souvera-logo.svg`,
      width: 512,
      height: 512,
      alt: 'Souvera Intelligence Terminal',
    },
  ];
}

export function buildTractionMetadata(
  page: 'platform' | 'intelligence',
  base: Metadata,
): Metadata {
  const config = PAGE_CONFIG[page];
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      url: `${SITE_URL}${config.path}`,
      images: tractionOpenGraphImages(config.path),
    },
  };
}
