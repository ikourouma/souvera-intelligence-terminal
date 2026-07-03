// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Country Code Crosswalks Page
// Owner: Afronovation, Inc.
// ===========================================

import { Metadata } from 'next';
import { CrosswalksClient } from './CrosswalksClient';

export const metadata: Metadata = {
  title: 'Crosswalks | Admin',
  description: 'Manage country code crosswalks for Souvera Intelligence Terminal',
};

export default function CrosswalksPage() {
  return <CrosswalksClient />;
}
