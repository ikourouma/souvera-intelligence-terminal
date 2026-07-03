'use client';

import Link from 'next/link';
import {
  ArrowRight, Bell, Calendar, CheckCircle2, Download, Eye, FileText,
  Globe, Package, Ship, Star, TrendingUp, AlertCircle, BarChart3, Shield, Building2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DashboardStats } from './useDashboardStats';

export function DashboardHeader({
  title,
  subtitle,
  tier,
  stats,
}: {
  title: string;
  subtitle?: string;
  tier: string;
  stats: DashboardStats;
}) {
  const planLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
          {planLabel} Plan
        </span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      <p className="text-zinc-400">
        {subtitle ?? `Welcome back • ${stats.countriesViewed} countries viewed • ${stats.exportsGenerated} exports • ${stats.reportsUsed}/${stats.reportsLimit} reports used`}
      </p>
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
  color: 'blue' | 'emerald' | 'amber' | 'cyan';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
      <p className="text-sm font-medium text-zinc-400">{label}</p>
      <p className="text-xs text-zinc-600 mt-1">{trend}</p>
    </div>
  );
}

const TRADE_MODULES = [
  { name: 'African Demand Intelligence', href: '/intelligence/trade/demand', icon: Globe, description: 'Top US products African markets want', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
  { name: 'Caribbean Demand Intelligence', href: '/intelligence/trade/demand-caribbean', icon: Globe, description: 'Caribbean import demand signals', iconBg: 'bg-cyan-500/10', iconColor: 'text-cyan-400' },
  { name: 'AfCFTA Trade Flows', href: '/intelligence/trade/afcfta/flows', icon: Ship, description: 'Intra-Africa trade intelligence', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
  { name: 'CBTPA Trade Flows', href: '/intelligence/trade/cbtpa/flows', icon: Ship, description: 'Caribbean-US trade flows', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-400' },
  { name: 'AGOA Product Finder', href: '/intelligence/trade/agoa/products', icon: Package, description: '150+ duty-free products', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
];

export function QuickLaunchGrid({ title = 'Trade Intelligence', modules = TRADE_MODULES }: { title?: string; modules?: typeof TRADE_MODULES }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-sm text-zinc-400">Quick access to intelligence modules</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.name}
              href={module.href}
              className="group bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-lg p-4 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 ${module.iconBg} rounded-lg`}>
                  <Icon className={`w-4 h-4 ${module.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">{module.name}</h3>
                  <p className="text-xs text-zinc-500">{module.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function WatchlistWidget({ stats }: { stats: DashboardStats }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Market Watchlist</h2>
          <p className="text-sm text-zinc-400">{stats.watchlistCount}/{stats.watchlistLimit} markets monitored</p>
        </div>
        <Link href="/intelligence/map" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
          + Add Markets
        </Link>
      </div>
      <div className="space-y-2">
        {stats.recentCountries.map((market, i) => (
          <Link
            key={market.iso3}
            href={`/country/${market.iso3}`}
            className="flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{market.flag}</span>
              <span className="font-medium text-white group-hover:text-blue-400 transition-colors">{market.name}</span>
            </div>
            {i === 0 && (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <AlertCircle className="w-3 h-3" />
                Policy change
              </span>
            )}
            {i === 1 && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Up to date
              </span>
            )}
            {i === 2 && (
              <span className="flex items-center gap-1 text-xs text-cyan-400">
                <TrendingUp className="w-3 h-3" />
                Trade update
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ActivityFeed({ tier }: { tier: string }) {
  const activities = tier === 'explorer'
    ? [
        { name: 'Nigeria - Overview snapshot', time: 'Today', icon: Eye },
        { name: 'Kenya - Sector teaser', time: 'Yesterday', icon: Eye },
      ]
    : [
        { name: 'Nigeria - Economy Analysis', time: '2 hours ago', icon: Eye },
        { name: 'NGA-Trade-Flows.png', time: 'Today', icon: Download },
        { name: 'Kenya - Agriculture Sector', time: 'Yesterday', icon: Eye },
      ];

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
      <div className="space-y-2">
        {activities.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-zinc-700/50 rounded">
                  <Icon className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <span className="text-sm text-zinc-300">{activity.name}</span>
              </div>
              <span className="text-xs text-zinc-600">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ReportQuotaWidget({ stats, tier }: { stats: DashboardStats; tier: string }) {
  const percentage = stats.reportsLimit > 0 ? (stats.reportsUsed / stats.reportsLimit) * 100 : 0;
  const remaining = stats.reportsLimit - stats.reportsUsed;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Reports Quota</h3>
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-white">{remaining}</span>
          <span className="text-zinc-500">of {stats.reportsLimit} remaining</span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${percentage}%` }} />
        </div>
      </div>
      <p className="text-xs text-zinc-500 mb-4">
        Resets monthly • {tier === 'institutional' ? 'Unlimited' : `${stats.reportsLimit} report${stats.reportsLimit === 1 ? '' : 's'}/month`}
      </p>
      <Link
        href="/country/NGA?tab=reports"
        className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold text-center rounded-lg transition-colors"
      >
        Generate Report
      </Link>
    </div>
  );
}

export function IntelligenceFeedWidget() {
  const alerts = [
    { text: 'AGOA: 202 days until expiration', icon: Calendar, iconColor: 'text-amber-400' },
    { text: 'AfCFTA: Kenya completed Phase 1', icon: CheckCircle2, iconColor: 'text-emerald-400' },
    { text: 'Nigerian demand for US machinery: $1.2B', icon: TrendingUp, iconColor: 'text-cyan-400' },
  ];

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Intelligence Feed</h3>
        <Bell className="w-4 h-4 text-zinc-600" />
      </div>
      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const Icon = alert.icon;
          return (
            <div key={i} className="flex items-start gap-2">
              <Icon className={`w-4 h-4 ${alert.iconColor} flex-shrink-0 mt-0.5`} />
              <p className="text-xs text-zinc-300 leading-relaxed">{alert.text}</p>
            </div>
          );
        })}
      </div>
      <Link href="/insights" className="block mt-4 text-xs text-blue-400 hover:text-blue-300 transition-colors">
        View all updates →
      </Link>
    </div>
  );
}

export function UpgradeCard({ targetPlan, features }: { targetPlan: string; features: string[] }) {
  return (
    <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-6">
      <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">
        Unlock with {targetPlan} Plan
      </h3>
      <ul className="space-y-2 mb-4">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/access"
        className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold text-center rounded-lg transition-colors"
      >
        Upgrade to {targetPlan}
      </Link>
    </div>
  );
}

export function MacroQuickLinks() {
  const links = [
    { href: '/intelligence/map', label: 'Intelligence Map', icon: Globe },
    { href: '/insights', label: 'Market Insights', icon: BarChart3 },
    { href: '/intelligence/trade/supply-demand', label: 'Supply-Demand Matrix', icon: TrendingUp },
  ];
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h2 className="text-lg font-bold text-white mb-4">Macro Intelligence</h2>
      <div className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors group">
              <Icon className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-zinc-300 group-hover:text-white">{link.label}</span>
              <ArrowRight className="w-3 h-4 text-zinc-600 ml-auto group-hover:text-blue-400" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function RiskOpportunityPanel() {
  const items = [
    { iso3: 'NGA', name: 'Nigeria', risk: 'Moderate', opportunity: 'High', flag: '🇳🇬' },
    { iso3: 'ZWE', name: 'Zimbabwe', risk: 'Elevated', opportunity: 'High', flag: '🇿🇼' },
    { iso3: 'GHA', name: 'Ghana', risk: 'Moderate', opportunity: 'Medium', flag: '🇬🇭' },
  ];
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-bold text-white">Risk & Opportunity Watchlist</h2>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <Link key={item.iso3} href={`/country/${item.iso3}?tab=risk`} className="flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg group">
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.flag}</span>
              <span className="font-medium text-white group-hover:text-blue-400">{item.name}</span>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-amber-400">Risk: {item.risk}</span>
              <span className="text-emerald-400">Opp: {item.opportunity}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function InstitutionalConsolePanel() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-bold text-white">Institutional Console</h2>
      </div>
      <div className="space-y-3 text-sm text-zinc-400">
        <p>API usage, team org context, and bulk export controls — contact support for white-label deployment.</p>
        <Link href="/profile" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
          Manage organization <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return <div className="w-full px-6 py-8">{children}</div>;
}

export function DashboardGrid({ main, sidebar }: { main: React.ReactNode; sidebar: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">{main}</div>
      <div className="space-y-6">{sidebar}</div>
    </div>
  );
}

export function StatsRow({ stats, tier }: { stats: DashboardStats; tier: string }) {
  const showExports = ['business', 'investor', 'institutional', 'professional'].includes(tier);
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatCard icon={Eye} label="Countries Analyzed" value={stats.countriesViewed.toString()} trend="+12 this month" color="blue" />
      {showExports && (
        <StatCard icon={Download} label="Exports Generated" value={stats.exportsGenerated.toString()} trend="PNG exports" color="emerald" />
      )}
      <StatCard icon={FileText} label="Reports Quota" value={`${stats.reportsUsed}/${stats.reportsLimit}`} trend="Resets monthly" color="amber" />
      <StatCard icon={Star} label="Watchlist" value={`${stats.watchlistCount}/${stats.watchlistLimit}`} trend="Markets monitored" color="cyan" />
    </div>
  );
}
