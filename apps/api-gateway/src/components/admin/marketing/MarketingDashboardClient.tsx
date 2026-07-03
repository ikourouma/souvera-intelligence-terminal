// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Marketing CMS Dashboard Client Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Image,
  Megaphone,
  DollarSign,
  Shield,
  ToggleLeft,
  ArrowRight,
  RefreshCw,
  Eye,
  Clock,
  ExternalLink,
  History,
  Layers,
} from 'lucide-react';

interface CMSStats {
  heroSlides: { total: number; active: number };
  banners: { total: number; active: number };
  pricing: { total: number; visible: number };
  logos: { total: number; active: number };
  featureFlags: { total: number; enabled: number };
}

interface RecentChange {
  id: string;
  table_name: string;
  action: string;
  changed_at: string;
  changed_by: string;
}

const CMS_SECTIONS = [
  {
    id: 'hero-slides',
    title: 'Hero Slides',
    description: 'Homepage carousel slides and content',
    icon: Image,
    href: '/admin/marketing/hero-slides',
    color: 'indigo',
  },
  {
    id: 'banners',
    title: 'Flash Banners',
    description: 'Announcement bars and promotions',
    icon: Megaphone,
    href: '/admin/marketing/banners',
    color: 'emerald',
  },
  {
    id: 'pricing',
    title: 'Pricing Display',
    description: 'Plan pricing and feature lists',
    icon: DollarSign,
    href: '/admin/marketing/pricing',
    color: 'amber',
  },
  {
    id: 'logos',
    title: 'Trust Logos',
    description: 'Data source badges and partners',
    icon: Shield,
    href: '/admin/marketing/logos',
    color: 'blue',
  },
  {
    id: 'feature-flags',
    title: 'Feature Flags',
    description: 'Platform feature toggles',
    icon: ToggleLeft,
    href: '/admin/marketing/feature-flags',
    color: 'purple',
  },
];

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', iconBg: 'bg-indigo-500/20' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', iconBg: 'bg-amber-500/20' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', iconBg: 'bg-blue-500/20' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', iconBg: 'bg-purple-500/20' },
};

export function MarketingDashboardClient() {
  const [stats, setStats] = useState<CMSStats | null>(null);
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchStats() {
    try {
      setRefreshing(true);
      
      // Fetch all CMS data in parallel
      const [heroRes, bannersRes, pricingRes, logosRes, flagsRes] = await Promise.all([
        fetch('/api/v1/admin/marketing/hero-slides'),
        fetch('/api/v1/admin/marketing/banners'),
        fetch('/api/v1/admin/marketing/pricing'),
        fetch('/api/v1/admin/marketing/logos'),
        fetch('/api/v1/admin/marketing/feature-flags'),
      ]);

      const [heroData, bannersData, pricingData, logosData, flagsData] = await Promise.all([
        heroRes.ok ? heroRes.json() : { slides: [] },
        bannersRes.ok ? bannersRes.json() : { banners: [] },
        pricingRes.ok ? pricingRes.json() : { plans: [] },
        logosRes.ok ? logosRes.json() : { logos: [] },
        flagsRes.ok ? flagsRes.json() : { flags: [] },
      ]);

      setStats({
        heroSlides: {
          total: heroData.slides?.length || 0,
          active: heroData.slides?.filter((s: { is_active: boolean }) => s.is_active).length || 0,
        },
        banners: {
          total: bannersData.banners?.length || 0,
          active: bannersData.banners?.filter((b: { is_active: boolean }) => b.is_active).length || 0,
        },
        pricing: {
          total: pricingData.plans?.length || 0,
          visible: pricingData.plans?.filter((p: { is_visible: boolean }) => p.is_visible).length || 0,
        },
        logos: {
          total: logosData.logos?.length || 0,
          active: logosData.logos?.filter((l: { is_active: boolean }) => l.is_active).length || 0,
        },
        featureFlags: {
          total: flagsData.flags?.length || 0,
          enabled: flagsData.flags?.filter((f: { is_enabled: boolean }) => f.is_enabled).length || 0,
        },
      });

      // For recent changes, we'd need an API endpoint. For now, show placeholder
      setRecentChanges([]);
    } catch (error) {
      console.error('[MarketingDashboard] Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatForSection = (sectionId: string) => {
    if (!stats) return { total: 0, active: 0 };
    switch (sectionId) {
      case 'hero-slides': return stats.heroSlides;
      case 'banners': return stats.banners;
      case 'pricing': return { total: stats.pricing.total, active: stats.pricing.visible };
      case 'logos': return stats.logos;
      case 'feature-flags': return { total: stats.featureFlags.total, active: stats.featureFlags.enabled };
      default: return { total: 0, active: 0 };
    }
  };

  if (loading) {
    return <MarketingDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Marketing CMS
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage homepage content and marketing assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview Homepage
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Hero Slides"
          value={stats?.heroSlides.active || 0}
          total={stats?.heroSlides.total || 0}
          icon={Image}
          color="indigo"
        />
        <StatCard
          label="Banners"
          value={stats?.banners.active || 0}
          total={stats?.banners.total || 0}
          icon={Megaphone}
          color="emerald"
        />
        <StatCard
          label="Pricing Plans"
          value={stats?.pricing.visible || 0}
          total={stats?.pricing.total || 0}
          icon={DollarSign}
          color="amber"
        />
        <StatCard
          label="Trust Logos"
          value={stats?.logos.active || 0}
          total={stats?.logos.total || 0}
          icon={Shield}
          color="blue"
        />
        <StatCard
          label="Feature Flags"
          value={stats?.featureFlags.enabled || 0}
          total={stats?.featureFlags.total || 0}
          icon={ToggleLeft}
          color="purple"
        />
      </div>

      {/* CMS Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CMS_SECTIONS.map((section) => {
          const Icon = section.icon;
          const colors = COLOR_CLASSES[section.color];
          const sectionStats = getStatForSection(section.id);

          return (
            <Link
              key={section.id}
              href={section.href}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className={`${colors.iconBg} border ${colors.border} rounded-lg p-2.5`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                <p className="text-sm text-zinc-500 mt-1">{section.description}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                <Layers className="w-3.5 h-3.5" />
                <span>{sectionStats.active} active</span>
                <span className="text-zinc-600">·</span>
                <span>{sectionStats.total} total</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Changes */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Changes</h3>
            <p className="text-xs text-zinc-500 mt-1">Latest CMS content updates</p>
          </div>
          <History className="w-5 h-5 text-zinc-500" />
        </div>
        
        {recentChanges.length === 0 ? (
          <div className="bg-zinc-800/30 rounded-lg p-8 text-center">
            <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400">No recent changes</p>
            <p className="text-xs text-zinc-500 mt-1">Content updates will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentChanges.map((change) => (
              <div key={change.id} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <div className="flex-1">
                  <p className="text-sm text-white">
                    {change.action} in {change.table_name}
                  </p>
                  <p className="text-xs text-zinc-500">{change.changed_at}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-zinc-800/30 rounded-lg p-4">
            <p className="text-indigo-400 font-medium mb-1">Hero Slides</p>
            <p className="text-zinc-400">Drag and drop to reorder slides. Changes reflect on homepage within 5 minutes.</p>
          </div>
          <div className="bg-zinc-800/30 rounded-lg p-4">
            <p className="text-emerald-400 font-medium mb-1">Flash Banners</p>
            <p className="text-zinc-400">Schedule banners with start/end dates for automatic activation.</p>
          </div>
          <div className="bg-zinc-800/30 rounded-lg p-4">
            <p className="text-amber-400 font-medium mb-1">Pricing Display</p>
            <p className="text-zinc-400">Edit features and prices without code changes. Toggle visibility as needed.</p>
          </div>
          <div className="bg-zinc-800/30 rounded-lg p-4">
            <p className="text-purple-400 font-medium mb-1">Feature Flags</p>
            <p className="text-zinc-400">Enable/disable platform features instantly without deployment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  total,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  total: number;
  icon: React.ElementType;
  color: string;
}) {
  const colors = COLOR_CLASSES[color];

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2.5">
        <div className={`${colors.iconBg} border ${colors.border} rounded-lg p-2`}>
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-zinc-500">{label} ({total} total)</p>
        </div>
      </div>
    </div>
  );
}

function MarketingDashboardSkeleton() {
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
      <div className="grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-zinc-800/50 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-40 bg-zinc-800/50 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
