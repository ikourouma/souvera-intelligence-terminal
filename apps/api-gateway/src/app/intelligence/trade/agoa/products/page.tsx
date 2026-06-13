import { Metadata } from 'next';
import { Suspense } from 'react';
import { checkServerEntitlement } from '@/lib/access/server-entitlements';
import { UpgradePrompt } from '@/components/access';
import { AGOProductFinderClient } from './AGOProductFinderClient';

export const metadata: Metadata = {
  title: 'AGOA Product Finder | Trade Intelligence | Souvera',
  description:
    'Search AGOA-eligible apparel and textile products (HS 50–63) across sub-Saharan African markets.',
};

export default async function AGOAProductFinderPage() {
  // Check if user has access to trade intelligence
  const { hasAccess } = await checkServerEntitlement('trade_data');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <UpgradePrompt
          feature="AGOA Product Finder"
          requiredTier="business"
          featureDescription="Search and analyze AGOA-eligible apparel and textile products across all sub-Saharan African markets with detailed HS code data."
          mode="card"
        />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">
          Loading AGOA Product Finder…
        </div>
      }
    >
      <AGOProductFinderClient />
    </Suspense>
  );
}
