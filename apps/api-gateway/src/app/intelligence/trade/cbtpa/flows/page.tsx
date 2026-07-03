import { Metadata } from 'next';
import { checkServerEntitlement } from '@/lib/access/server-entitlements';
import { UpgradePrompt } from '@/components/access';
import CBTpaTradeIntelligence from './CBTpaTradeIntelligence';

export const metadata: Metadata = {
  title: 'CBTPA Import-Export Intelligence | Souvera',
  description: 'US-Caribbean bilateral trade flows under the Caribbean Basin Trade Partnership Act. Track imports, exports, rules-of-origin eligibility, and intra-CARICOM trade across 20 Caribbean markets.',
  openGraph: {
    title: 'CBTPA Import-Export Intelligence | Souvera',
    description: 'US-Caribbean bilateral trade flows under CBTPA. Preference margins, CARICOM integration, and legislative urgency insights.',
    type: 'website',
  },
};

export default async function CBTPAFlowsPage() {
  // Check if user has access to trade intelligence
  const { hasAccess } = await checkServerEntitlement('trade_data');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <UpgradePrompt
          feature="CBTPA Import-Export Intelligence"
          requiredTier="business"
          featureDescription="Access US-Caribbean bilateral trade flows, preference margins, and intra-CARICOM trade data across all 20 Caribbean markets."
          mode="card"
        />
      </div>
    );
  }

  return <CBTpaTradeIntelligence />;
}
