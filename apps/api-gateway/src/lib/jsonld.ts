const BASE_URL = 'https://souvera.vercel.app';

type JsonLdSchema = Record<string, unknown>;

export const organizationSchema: JsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Souvera Intelligence Terminal',
  alternateName: 'Souvera',
  url: BASE_URL,
  description:
    'Institutional-grade macroeconomic intelligence for African and Caribbean markets. Data-driven insights for governments, investors, and enterprises.',
  parentOrganization: {
    '@type': 'Organization',
    name: 'Afronovation, Inc.',
    url: 'https://www.afronovation.com',
  },
  areaServed: [
    { '@type': 'Continent', name: 'Africa' },
    { '@type': 'Place', name: 'Caribbean' },
  ],
  serviceType: 'Macroeconomic Intelligence Platform',
  knowsAbout: [
    'Macroeconomics',
    'Africa Investment',
    'Caribbean Markets',
    'Development Finance',
    'Emerging Markets',
  ],
};

export const webSiteSchema: JsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Souvera Intelligence Terminal',
  url: BASE_URL,
  description:
    'Institutional-grade macroeconomic intelligence for African and Caribbean markets.',
  publisher: {
    '@type': 'Organization',
    name: 'Afronovation, Inc.',
  },
};

export const contactPageSchema: JsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Souvera',
  url: `${BASE_URL}/contact`,
  description: 'Contact the Souvera team for questions, access requests, or partnership inquiries.',
  mainEntity: {
    '@type': 'Organization',
    name: 'Souvera Intelligence Terminal',
    email: 'contact@souvera.io',
  },
};

export const productSchema: JsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Souvera Intelligence Platform',
  description:
    'Comprehensive macroeconomic intelligence platform for African and Caribbean markets with data from IMF, World Bank, and regional development banks.',
  brand: {
    '@type': 'Organization',
    name: 'Souvera',
  },
  category: 'Business Intelligence Software',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    availability: 'https://schema.org/OnlineOnly',
    url: `${BASE_URL}/access`,
  },
};

export function generateJsonLd(schema: JsonLdSchema): string {
  return JSON.stringify(schema);
}
