// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// AGOA Eligibility Tracker
// Owner: Afronovation, Inc.
// ===========================================

import { Metadata } from 'next';
import { Suspense } from 'react';
import { checkServerEntitlement } from '@/lib/access/server-entitlements';
import { UpgradePrompt } from '@/components/access';
import { AGOATrackerClient } from './AGOATrackerClient';

export const metadata: Metadata = {
  title: 'AGOA Legislative Tracker | Trade Intelligence | Souvera',
  description: 'Track AGOA eligibility, reauthorization milestones, and legislative watchpoints for sub-Saharan African countries.',
};

export const dynamic = 'force-dynamic';

export default async function AGOATrackerPage() {
  // Check if user has access to trade intelligence (Business+ tier required)
  const { hasAccess } = await checkServerEntitlement('trade_data');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <UpgradePrompt
          feature="AGOA Legislative Tracker"
          requiredTier="business"
          featureDescription="Track AGOA eligibility status, reauthorization milestones, and legislative developments across all sub-Saharan African countries with detailed country profiles."
          mode="card"
        />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading AGOA tracker…</div>}>
      <AGOATrackerClient />
    </Suspense>
  );
}
