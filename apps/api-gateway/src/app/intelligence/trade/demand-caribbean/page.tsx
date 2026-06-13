import { Metadata } from 'next';
import { checkServerEntitlement } from '@/lib/access/server-entitlements';
import { UpgradePrompt } from '@/components/access';
import CaribbeanDemandMatrix from './CaribbeanDemandMatrix';

export const metadata: Metadata = {
  title: 'Caribbean Import Demand Intelligence | Souvera',
  description: 'US export opportunities in Caribbean markets. CBTPA trade intelligence and demand analysis.',
};

export default async function CaribbeanDemandPage() {
  // Check if user has access to trade intelligence
  const { hasAccess } = await checkServerEntitlement('trade_data');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <UpgradePrompt
          feature="Caribbean Import Demand Intelligence"
          requiredTier="business"
          featureDescription="Analyze US export opportunities across 20 Caribbean markets with CBTPA trade intelligence and demand signals."
          mode="card"
        />
      </div>
    );
  }

  return <CaribbeanDemandMatrix />;
}
