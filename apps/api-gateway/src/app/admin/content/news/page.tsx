import { Metadata } from 'next';
import { CuratedNewsClient } from './CuratedNewsClient';

export const metadata: Metadata = {
  title: 'Curated News | Admin',
  description: 'Create and publish Souvera editorial news for /insights/news',
};

export default function CuratedNewsAdminPage() {
  return <CuratedNewsClient />;
}
