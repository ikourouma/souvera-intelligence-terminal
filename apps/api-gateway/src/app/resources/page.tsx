import type { Metadata } from 'next';
import { ResourcesHub } from './ResourcesHub';

export const metadata: Metadata = {
  title: 'Resources | Souvera',
  description: 'Souvera resources: data sources documentation, source registry, compliance information, and frequently asked questions.',
  openGraph: {
    title: 'Resources | Souvera',
    description: 'Souvera resources: data sources, compliance, and support documentation.',
    url: 'https://souvera.vercel.app/resources',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/resources',
  },
};

export default function ResourcesPage() {
  return <ResourcesHub />;
}
