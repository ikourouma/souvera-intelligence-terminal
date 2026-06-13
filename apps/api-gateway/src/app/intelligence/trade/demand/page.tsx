import type { Metadata } from 'next';
import { Suspense } from 'react';
import { checkServerEntitlement } from '@/lib/access/server-entitlements';
import { UpgradePrompt } from '@/components/access';
import { DemandSignalMatrix } from './DemandSignalMatrix';

export const metadata: Metadata = {
  title: 'African Import Demand Intelligence | Souvera',
  description:
    'US export opportunity sizing by product category across Africa and the Caribbean. Quantifies African demand for US goods to support AGOA reauthorization briefings.',
};

export default async function DemandIntelligencePage() {
  // Check if user has access to trade intelligence
  const { hasAccess } = await checkServerEntitlement('trade_data');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <UpgradePrompt
          feature="African Import Demand Intelligence"
          requiredTier="business"
          featureDescription="Quantify US export opportunities by product category across all 54 African countries with demand signals and market sizing data."
          mode="card"
        />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">Loading demand data…</div>}>
      <DemandSignalMatrix />
    </Suspense>
  );
}
