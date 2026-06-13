// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Dashboard - Main Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import { QuickStatsCard } from './QuickStatsCard';
import { AdminActionGrid } from './AdminActionGrid';
import { ActivityFeed } from './ActivityFeed';
import { SystemHealthBar } from './SystemHealthBar';
import { AlertBanner } from './AlertBanner';
import { DataFreshnessWidget } from './DataFreshnessWidget';
import { DashboardExportButton } from './DashboardExportButton';
import { 
  Database, 
  Users, 
  FileText, 
  Clock, 
  TrendingUp,
  AlertCircle 
} from 'lucide-react';

interface DashboardStats {
  totalSources: number;
  recentUploads: number;
  activeUsers: number;
  pendingReports: number;
  lastIngestionTime: string | null;
  systemErrors: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const response = await fetch('/api/v1/admin/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('[AdminDashboard] Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-64 mb-2" />
          <div className="h-4 bg-zinc-800 rounded w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-zinc-400">
            Unified control panel for platform management
          </p>
        </div>
        <DashboardExportButton />
      </div>

      {/* System Health Bar */}
      <SystemHealthBar />

      {/* Alert Banner */}
      <AlertBanner />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickStatsCard
          title="Data Sources"
          value={stats?.totalSources ?? 0}
          icon={Database}
          color="indigo"
          trend="stable"
        />
        <QuickStatsCard
          title="Recent Uploads"
          value={stats?.recentUploads ?? 0}
          subtitle="Last 7 days"
          icon={TrendingUp}
          color="emerald"
          trend="up"
        />
        <QuickStatsCard
          title="Active Users"
          value={stats?.activeUsers ?? 0}
          icon={Users}
          color="blue"
          trend="up"
        />
        <QuickStatsCard
          title="Pending Reports"
          value={stats?.pendingReports ?? 0}
          icon={FileText}
          color="amber"
          trend="stable"
        />
        <QuickStatsCard
          title="Last Ingestion"
          value={stats?.lastIngestionTime ? new Date(stats.lastIngestionTime).toLocaleDateString() : 'Never'}
          subtitle={stats?.lastIngestionTime ? new Date(stats.lastIngestionTime).toLocaleTimeString() : ''}
          icon={Clock}
          color="purple"
          trend="stable"
        />
        <QuickStatsCard
          title="System Errors"
          value={stats?.systemErrors ?? 0}
          subtitle="Last 24 hours"
          icon={AlertCircle}
          color={stats?.systemErrors && stats.systemErrors > 0 ? 'red' : 'emerald'}
          trend={stats?.systemErrors && stats.systemErrors > 0 ? 'down' : 'stable'}
        />
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <AdminActionGrid />
      </div>

      {/* Two Column Layout for Activity and Data Freshness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Feed */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <ActivityFeed />
        </div>

        {/* Data Freshness Widget */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Data Freshness</h2>
          <DataFreshnessWidget />
        </div>
      </div>
    </div>
  );
}
