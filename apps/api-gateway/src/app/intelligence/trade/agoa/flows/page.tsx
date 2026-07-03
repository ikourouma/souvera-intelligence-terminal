import type { Metadata } from 'next';
import { Suspense } from 'react';
import { checkServerEntitlement } from '@/lib/access/server-entitlements';
import { UpgradePrompt } from '@/components/access';
import { AGOAFlowsClient } from './AGOAFlowsClient';

export const metadata: Metadata = {
  title: 'AGOA Trade Flows | Souvera',
  description:
    'African exports to the United States under AGOA preferential treatment. Track duty-free exports, tariff savings, and product opportunities by country.',
};

export default async function AGOAFlowsPage() {
  const { hasAccess } = await checkServerEntitlement('trade_data');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <UpgradePrompt
          feature="AGOA Trade Flows Intelligence"
          requiredTier="business"
          featureDescription="Track African exports to the US under AGOA, including duty-free trade, tariff savings, and product-level insights."
          mode="card"
        />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
          Loading AGOA trade flow data…
        </div>
      }
    >
      <AGOAFlowsClient />
    </Suspense>
  );
}
