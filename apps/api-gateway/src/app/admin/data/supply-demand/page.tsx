/**
 * =====================================================
 * SOUVERA INTELLIGENCE TERMINAL
 * Supply-Demand Matrix Admin Page
 * Owner: Afronovation, Inc.
 * Phase 4C: Supply-Demand Matrix
 * =====================================================
 */

import { Metadata } from 'next';
import { SupplyDemandAdminClient } from './SupplyDemandAdminClient';

export const metadata: Metadata = {
  title: 'Supply-Demand Matrix Admin | Souvera Admin',
  description: 'Manage the 74-market × 8-sector Supply-Demand Matrix data',
};

export default function SupplyDemandAdminPage() {
  return <SupplyDemandAdminClient />;
}
