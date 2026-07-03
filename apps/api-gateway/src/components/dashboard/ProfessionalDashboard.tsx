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

export function ProfessionalDashboard({ tier }: Props) {
  const { stats, loading } = useDashboardStats(tier);

  if (loading) return null;

  return (
    <DashboardShell>
      <DashboardHeader
        title="Professional Command Center"
        subtitle="Full macro access, FX dashboards, and AfCFTA policy alerts"
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
            <IntelligenceFeedWidget />
            <UpgradeCard
              targetPlan="Business"
              features={[
                'Trade intelligence modules and PNG exports',
                'AGOA and demand signal alerts',
                'Supply-Demand Matrix access',
              ]}
            />
          </>
        }
      />
    </DashboardShell>
  );
}
