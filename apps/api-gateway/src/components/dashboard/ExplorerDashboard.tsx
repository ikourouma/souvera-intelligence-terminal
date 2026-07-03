'use client';

import type { UserAccess } from '@souvera/entitlements';
import { useDashboardStats } from './shared/useDashboardStats';
import {
  ActivityFeed,
  DashboardGrid,
  DashboardHeader,
  DashboardShell,
  IntelligenceFeedWidget,
  MacroQuickLinks,
  ReportQuotaWidget,
  StatsRow,
  UpgradeCard,
  WatchlistWidget,
} from './shared/DashboardWidgets';

interface Props {
  userAccess: UserAccess;
  tier: string;
}

export function ExplorerDashboard({ tier }: Props) {
  const { stats, loading } = useDashboardStats(tier);

  if (loading) return null;

  return (
    <DashboardShell>
      <DashboardHeader
        title="Explorer Dashboard"
        subtitle="Research markets with headline macro and sector teasers"
        tier={tier}
        stats={stats}
      />
      <StatsRow stats={stats} tier={tier} />
      <DashboardGrid
        main={
          <>
            <MacroQuickLinks />
            <WatchlistWidget stats={stats} />
            <ActivityFeed tier={tier} />
          </>
        }
        sidebar={
          <>
            <ReportQuotaWidget stats={stats} tier={tier} />
            <UpgradeCard
              targetPlan="Professional"
              features={[
                'Full macro time series and FX dashboards',
                'Sector deep-dive rationale',
                '5 reports/month with export access',
              ]}
            />
          </>
        }
      />
    </DashboardShell>
  );
}
