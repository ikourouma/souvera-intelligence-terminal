'use client';

import type { UserAccess } from '@souvera/entitlements';
import { useDashboardStats } from './shared/useDashboardStats';
import {
  ActivityFeed,
  DashboardGrid,
  DashboardHeader,
  DashboardShell,
  IntelligenceFeedWidget,
  QuickLaunchGrid,
  ReportQuotaWidget,
  RiskOpportunityPanel,
  StatsRow,
  UpgradeCard,
  WatchlistWidget,
} from './shared/DashboardWidgets';

interface Props {
  userAccess: UserAccess;
  tier: string;
}

export function InvestorDashboard({ tier }: Props) {
  const { stats, loading } = useDashboardStats(tier);

  if (loading) return null;

  return (
    <DashboardShell>
      <DashboardHeader
        title="Investor Command Center"
        subtitle="Portfolio watchlist, risk/opportunity scorecards, and supply-demand signals"
        tier={tier}
        stats={stats}
      />
      <StatsRow stats={stats} tier={tier} />
      <DashboardGrid
        main={
          <>
            <QuickLaunchGrid title="Investment Intelligence" />
            <RiskOpportunityPanel />
            <WatchlistWidget stats={stats} />
            <ActivityFeed tier={tier} />
          </>
        }
        sidebar={
          <>
            <ReportQuotaWidget stats={stats} tier={tier} />
            <IntelligenceFeedWidget />
          </>
        }
      />
    </DashboardShell>
  );
}
