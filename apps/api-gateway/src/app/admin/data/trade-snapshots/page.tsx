// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Trade Snapshots Manager
// Owner: Afronovation, Inc.
// Phase 0E.4: 74-Market Trade Data Management
// ===========================================

import { Metadata } from 'next';
import { TradeSnapshotsClient } from './TradeSnapshotsClient';

export const metadata: Metadata = {
  title: 'Trade Snapshots | Admin',
  description: 'Manage country trade snapshots for Souvera Intelligence Terminal',
};

export default function TradeSnapshotsPage() {
  return <TradeSnapshotsClient />;
}
