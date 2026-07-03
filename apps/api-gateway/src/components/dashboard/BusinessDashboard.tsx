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
  StatsRow,
  UpgradeCard,
  WatchlistWidget,
} from './shared/DashboardWidgets';

interface BusinessDashboardProps {
  userAccess: UserAccess;
  tier: string;
}

export function BusinessDashboard({ tier }: BusinessDashboardProps) {
  const { stats, loading } = useDashboardStats(tier);

  if (loading) return null;

  return (
    <DashboardShell>
      <DashboardHeader
        title="Business Intelligence Hub"
        tier={tier}
        stats={stats}
      />
      <StatsRow stats={stats} tier={tier} />
      <DashboardGrid
        main={
          <>
            <QuickLaunchGrid />
            <WatchlistWidget stats={stats} />
            <ActivityFeed tier={tier} />
          </>
        }
        sidebar={
          <>
            <ReportQuotaWidget stats={stats} tier={tier} />
            <IntelligenceFeedWidget />
            {tier === 'business' && (
              <UpgradeCard
                targetPlan="Investor"
                features={[
                  'Supply-Demand Matrix (74×8 sectors)',
                  'Forecast metrics and predictive analytics',
                  '5 reports/month (no watermark)',
                  'Advanced risk scoring',
                ]}
              />
            )}
          </>
        }
      />
    </DashboardShell>
  );
}
