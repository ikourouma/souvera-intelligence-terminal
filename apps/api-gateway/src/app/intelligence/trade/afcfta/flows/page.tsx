import { Metadata } from 'next';
import { checkServerEntitlement } from '@/lib/access/server-entitlements';
import { UpgradePrompt } from '@/components/access';
import AfCFTATradeIntelligence from './AfCFTATradeIntelligence';

export const metadata: Metadata = {
  title: 'AfCFTA Import-Export Intelligence | Souvera',
  description: 'Intra-Africa trade flows under the African Continental Free Trade Area. Analyze regional supply chains and market access opportunities with the Import-Export toggle.',
};

export default async function AfCFTAFlowsPage() {
  // Check if user has access to trade intelligence
  const { hasAccess } = await checkServerEntitlement('trade_data');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <UpgradePrompt
          feature="AfCFTA Import-Export Intelligence"
          requiredTier="business"
          featureDescription="Access comprehensive intra-Africa trade flows, regional supply chains, and market access opportunities across all 54 African countries."
          mode="card"
        />
      </div>
    );
  }

  return <AfCFTATradeIntelligence />;
}
