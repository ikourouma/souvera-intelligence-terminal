import { Metadata } from 'next';
import { Suspense } from 'react';
import { checkServerEntitlement } from '@/lib/access/server-entitlements';
import { UpgradePrompt } from '@/components/access';
import { AfCFTATrackerClient } from './AfCFTATrackerClient';

export const metadata: Metadata = {
  title: 'AfCFTA Status Tracker | Trade Intelligence | Souvera',
  description: 'Track African Continental Free Trade Area implementation status for rollout markets.',
};

export const dynamic = 'force-dynamic';

export default async function AfCFTATrackerPage() {
  // Check if user has access to trade intelligence (Business+ tier required)
  const { hasAccess } = await checkServerEntitlement('trade_data');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <UpgradePrompt
          feature="AfCFTA Status Tracker"
          requiredTier="business"
          featureDescription="Track AfCFTA implementation status, tariff schedules, and trade readiness across all 54 African countries with detailed country profiles."
          mode="card"
        />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading AfCFTA tracker…</div>}>
      <AfCFTATrackerClient />
    </Suspense>
  );
}
