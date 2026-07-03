import { Metadata } from 'next';
import { checkServerEntitlement } from '@/lib/access/server-entitlements';
import { UpgradePrompt } from '@/components/access';
import AfCETATradeIntelligence from './AfCETATradeIntelligence';

export const metadata: Metadata = {
  title: 'AfCETA Corridor Opportunity Index | Souvera',
  description:
    'Africa ↔ Caribbean trade corridor intelligence. Derived opportunity index for the AfriCaribbean Trade & Investment Forum 2026.',
};

export default async function AfCETAFlowsPage() {
  const { hasAccess } = await checkServerEntitlement('trade_data');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <UpgradePrompt
          feature="AfCETA Corridor Opportunity Index"
          requiredTier="business"
          featureDescription="Access Africa ↔ Caribbean corridor signals, spotlight pairs, and protocol-pillar mapping for the AfriCaribbean Trade & Investment Forum 2026."
          mode="card"
        />
      </div>
    );
  }

  return <AfCETATradeIntelligence />;
}
