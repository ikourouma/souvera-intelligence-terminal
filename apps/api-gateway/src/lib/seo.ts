import type { Metadata } from 'next';

const SITE_NAME = 'Souvera Intelligence Terminal';
const SITE_URL = 'https://souvera.vercel.app';

interface SEOConfig {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
}: SEOConfig): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;

  return {
    title: fullTitle,
    description,
    keywords: [
      'Africa investment',
      'Caribbean economic data',
      'macroeconomic intelligence',
      'sovereign data',
      'emerging markets',
      ...keywords,
    ],
    authors: [{ name: 'Afronovation, Inc.' }],
    creator: 'Afronovation, Inc.',
    publisher: 'Afronovation, Inc.',
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Institutional-grade macroeconomic intelligence for African and Caribbean markets. Data-driven insights for governments, investors, and enterprises.',
  keywords: [
    'Africa investment data',
    'Caribbean economic intelligence',
    'macroeconomic analysis',
    'emerging markets',
    'sovereign data',
    'FDI intelligence',
    'trade corridor analysis',
  ],
  authors: [{ name: 'Afronovation, Inc.' }],
  creator: 'Afronovation, Inc.',
  publisher: 'Afronovation, Inc.',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
  },
};
