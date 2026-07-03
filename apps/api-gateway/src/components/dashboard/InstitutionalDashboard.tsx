'use client';

import type { UserAccess } from '@souvera/entitlements';
import { useDashboardStats } from './shared/useDashboardStats';
import {
  ActivityFeed,
  DashboardGrid,
  DashboardHeader,
  DashboardShell,
  InstitutionalConsolePanel,
  IntelligenceFeedWidget,
  QuickLaunchGrid,
  ReportQuotaWidget,
  StatsRow,
  WatchlistWidget,
} from './shared/DashboardWidgets';

interface Props {
  userAccess: UserAccess;
  tier: string;
}

export function InstitutionalDashboard({ tier }: Props) {
  const { stats, loading } = useDashboardStats(tier);

  if (loading) return null;

  return (
    <DashboardShell>
      <DashboardHeader
        title="Institutional Control Center"
        subtitle="Unlimited reports, team context, and bulk export capabilities"
        tier={tier}
        stats={stats}
      />
      <StatsRow stats={stats} tier={tier} />
      <DashboardGrid
        main={
          <>
            <InstitutionalConsolePanel />
            <QuickLaunchGrid title="Trade & Supply Intelligence" />
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
