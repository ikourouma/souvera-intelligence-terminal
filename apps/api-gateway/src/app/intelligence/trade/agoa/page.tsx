// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// AGOA Eligibility Tracker
// Owner: Afronovation, Inc.
// ===========================================

import { Metadata } from 'next';
import { AGOATrackerClient } from './AGOATrackerClient';

export const metadata: Metadata = {
  title: 'AGOA Eligibility Tracker | Trade Intelligence | Souvera',
  description: 'Track African Growth and Opportunity Act eligibility status for sub-Saharan African countries. Source-attributed trade policy intelligence.',
};

export default function AGOATrackerPage() {
  return <AGOATrackerClient />;
}
