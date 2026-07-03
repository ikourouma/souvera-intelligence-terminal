// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Billing Dashboard Client Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  ArrowRight,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react';

interface BillingStats {
  mrr: number;
  arr: number;
  mrrChange: number;
  activeSubscriptions: number;
  newSubscriptions7d: number;
  newSubscriptions30d: number;
  churnRate: number;
  avgRevenuePerUser: number;
  planDistribution: {
    plan: string;
    count: number;
    revenue: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
}

const PLAN_COLORS: Record<string, string> = {
  explorer: 'bg-blue-500',
  professional: 'bg-emerald-500',
  business: 'bg-amber-500',
  investor: 'bg-purple-500',
  institutional: 'bg-indigo-500',
};

const PLAN_LABELS: Record<string, string> = {
  explorer: 'Explorer',
  professional: 'Professional',
  business: 'Business',
  investor: 'Investor',
  institutional: 'Institutional',
};

export function BillingDashboardClient() {
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchStats() {
    try {
      setRefreshing(true);
      const response = await fetch('/api/v1/admin/billing/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('[BillingDashboard] Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <BillingDashboardSkeleton />;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const totalPlanCount = stats?.planDistribution.reduce((sum, p) => sum + p.count, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Billing & Revenue
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Subscription metrics and revenue analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/admin/billing/subscriptions"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all"
          >
            <CreditCard className="w-4 h-4" />
            Manage Subscriptions
          </Link>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RevenueCard
          title="Monthly Recurring Revenue"
          value={formatCurrency(stats?.mrr || 0)}
          change={stats?.mrrChange || 0}
          icon={DollarSign}
          color="indigo"
        />
        <RevenueCard
          title="Annual Recurring Revenue"
          value={formatCurrency(stats?.arr || 0)}
          subtitle="Projected"
          icon={TrendingUp}
          color="emerald"
        />
        <RevenueCard
          title="Active Subscriptions"
          value={(stats?.activeSubscriptions || 0).toLocaleString()}
          subtitle={`+${stats?.newSubscriptions30d || 0} this month`}
          icon={Users}
          color="blue"
        />
        <RevenueCard
          title="Churn Rate"
          value={`${(stats?.churnRate || 0).toFixed(1)}%`}
          subtitle="Last 30 days"
          icon={stats?.churnRate && stats.churnRate > 5 ? TrendingDown : TrendingUp}
          color={stats?.churnRate && stats.churnRate > 5 ? 'red' : 'emerald'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
              <p className="text-xs text-zinc-500 mt-1">Monthly recurring revenue over time</p>
            </div>
            <BarChart3 className="w-5 h-5 text-zinc-500" />
          </div>
          <div className="h-48">
            <RevenueTrendChart data={stats?.revenueByMonth || []} />
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Plan Distribution</h3>
              <p className="text-xs text-zinc-500 mt-1">Active subscriptions by plan</p>
            </div>
            <PieChart className="w-5 h-5 text-zinc-500" />
          </div>
          <div className="space-y-3">
            {(stats?.planDistribution || []).map((plan) => (
              <div key={plan.plan} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${PLAN_COLORS[plan.plan] || 'bg-zinc-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">{PLAN_LABELS[plan.plan] || plan.plan}</span>
                    <span className="text-sm text-zinc-400">{plan.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${PLAN_COLORS[plan.plan] || 'bg-zinc-500'} rounded-full`}
                      style={{ width: `${totalPlanCount ? (plan.count / totalPlanCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-zinc-500 w-16 text-right">
                  {formatCurrency(plan.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.newSubscriptions7d || 0}</p>
              <p className="text-xs text-zinc-500">New this week</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats?.avgRevenuePerUser || 0)}</p>
              <p className="text-xs text-zinc-500">Avg Revenue Per User</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2.5">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.newSubscriptions30d || 0}</p>
              <p className="text-xs text-zinc-500">New this month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/billing/subscriptions"
            className="flex items-center justify-between p-4 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700/50 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              <span className="text-sm text-white">View All Subscriptions</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
          </Link>
          <Link
            href="/admin/billing/subscriptions?status=pending"
            className="flex items-center justify-between p-4 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700/50 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-white">Pending Subscriptions</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center justify-between p-4 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700/50 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-white">Manage Users</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function RevenueCard({
  title,
  value,
  change,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change?: number;
  subtitle?: string;
  icon: React.ElementType;
  color: 'indigo' | 'emerald' | 'blue' | 'red' | 'amber' | 'purple';
}) {
  const colorConfig = {
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
  };

  const config = colorConfig[color];

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className={`${config.bg} border ${config.border} rounded-lg p-2.5`}>
          <Icon className={`w-5 h-5 ${config.text}`} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-medium ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-zinc-500 mt-1">{subtitle || title}</p>
      </div>
    </div>
  );
}

function RevenueTrendChart({ data }: { data: { month: string; revenue: number }[] }) {
  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
        No revenue data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div className="h-full flex items-end gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full bg-zinc-800 rounded-t relative" style={{ height: '140px' }}>
            <div
              className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all duration-500"
              style={{ height: `${maxRevenue ? (item.revenue / maxRevenue) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500">{item.month}</span>
        </div>
      ))}
    </div>
  );
}

function BillingDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-zinc-800 rounded w-48 mb-2" />
          <div className="h-4 bg-zinc-800 rounded w-64" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-zinc-800 rounded w-24" />
          <div className="h-10 bg-zinc-800 rounded w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-zinc-800/50 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-zinc-800/50 rounded-xl" />
        <div className="h-72 bg-zinc-800/50 rounded-xl" />
      </div>
    </div>
  );
}
