// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Dashboard - Fortune 5 Enterprise Grade
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EnterpriseStatsCard } from './EnterpriseStatsCard';
import { SystemHealthPanel } from './SystemHealthPanel';
import { CriticalAlertsPanel } from './CriticalAlertsPanel';
import { ActivityFeed } from './ActivityFeed';
import { DataFreshnessWidget } from './DataFreshnessWidget';
import { 
  Database, 
  Users, 
  FileText, 
  Activity,
  ArrowRight,
  RefreshCw,
  Clock,
} from 'lucide-react';

interface DashboardStats {
  totalSources: number;
  recentUploads: number;
  activeUsers: number;
  pendingReports: number;
  lastIngestionTime: string | null;
  systemErrors: number;
  uptime?: number;
  trends?: {
    sources: number[];
    users: number[];
    reports: number[];
  };
}

interface AdminDashboardProps {
  userInfo: {
    fullName: string;
    role: string;
  };
  isSuperAdmin: boolean;
}

export function AdminDashboard({ userInfo, isSuperAdmin }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [syncing, setSyncing] = useState(false);

  async function fetchDashboardStats() {
    try {
      setSyncing(true);
      const response = await fetch('/api/v1/admin/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastSync(new Date());
      }
    } catch (error) {
      console.error('[AdminDashboard] Error fetching stats:', error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const timeSinceSync = () => {
    const diff = Math.floor((new Date().getTime() - lastSync.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Welcome back, {userInfo.fullName}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {isSuperAdmin ? 'Super Admin' : 'Platform Admin'} Dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Last sync: {timeSinceSync()}</span>
          </div>
          <button
            onClick={fetchDashboardStats}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EnterpriseStatsCard
          title="Data Sources"
          value={stats?.totalSources ?? 0}
          icon={Database}
          color="indigo"
          trend={{
            direction: 'up',
            value: '+12',
            label: 'this month',
          }}
          sparklineData={stats?.trends?.sources || [45, 52, 48, 61, 55, 67, 72]}
        />
        <EnterpriseStatsCard
          title="Active Users"
          value={stats?.activeUsers ?? 0}
          icon={Users}
          color="emerald"
          trend={{
            direction: 'up',
            value: '+124',
            label: 'last 7 days',
          }}
          sparklineData={stats?.trends?.users || [120, 145, 132, 156, 167, 189, 201]}
        />
        <EnterpriseStatsCard
          title="Reports Generated"
          value={stats?.pendingReports ?? 0}
          subtitle={`${stats?.pendingReports || 0} pending`}
          icon={FileText}
          color="amber"
          trend={{
            direction: 'stable',
            value: '156',
            label: 'this week',
          }}
          sparklineData={stats?.trends?.reports || [89, 95, 78, 102, 98, 110, 105]}
        />
        <EnterpriseStatsCard
          title="System Uptime"
          value={stats?.uptime ? `${stats.uptime}%` : '99.97%'}
          subtitle="30-day average"
          icon={Activity}
          color="cyan"
          trend={{
            direction: 'up',
            value: '+0.02%',
            label: 'from last month',
          }}
        />
      </div>

      {/* System Health & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SystemHealthPanel />
        <CriticalAlertsPanel />
      </div>

      {/* Activity & Freshness Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <Link 
              href="/admin/system/audit" 
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ActivityFeed />
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Data Freshness</h2>
            <Link 
              href="/admin/data/sources" 
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Manage sources <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <DataFreshnessWidget />
        </div>
      </div>

      {/* Super Admin Only Sections */}
      {isSuperAdmin && (
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
            Super Admin Controls
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Management Snapshot */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">User Management</h3>
                  <p className="text-xs text-zinc-500 mt-1">Platform user overview</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <p className="text-2xl font-bold text-white">{stats?.activeUsers?.toLocaleString() || '0'}</p>
                  <p className="text-xs text-zinc-500">Total Users</p>
                </div>
                <div className="h-8 w-px bg-zinc-800" />
                <div>
                  <p className="text-lg font-semibold text-emerald-400">2,451</p>
                  <p className="text-xs text-zinc-500">Active (7d)</p>
                </div>
                <div className="h-8 w-px bg-zinc-800" />
                <div>
                  <p className="text-lg font-semibold text-blue-400">+124</p>
                  <p className="text-xs text-zinc-500">New (7d)</p>
                </div>
              </div>
              <Link
                href="/admin/users"
                className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Manage Users <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Access Control Matrix */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">Access Control Matrix</h3>
                  <p className="text-xs text-zinc-500 mt-1">Persona permissions management</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
                  <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-zinc-400">
                  Manage feature access across <span className="text-white font-medium">6 personas</span> and <span className="text-white font-medium">24 entitlements</span>
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  Last updated: 2 hours ago by admin@afronovation.com
                </p>
              </div>
              <Link
                href="/admin/matrix"
                className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Manage Matrix <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-zinc-800 rounded w-64 mb-2" />
          <div className="h-4 bg-zinc-800 rounded w-40" />
        </div>
        <div className="h-8 bg-zinc-800 rounded w-24" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-zinc-800/50 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-48 bg-zinc-800/50 rounded-xl" />
        <div className="h-48 bg-zinc-800/50 rounded-xl" />
      </div>
    </div>
  );
}
