// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Data Sources Page
// Owner: Afronovation, Inc.
// ===========================================

import { Metadata } from 'next';
import { DataSourcesClient } from './DataSourcesClient';

export const metadata: Metadata = {
  title: 'Data Sources | Admin',
  description: 'Manage data sources for Souvera Intelligence Terminal',
};

export default function DataSourcesPage() {
  return <DataSourcesClient />;
}
