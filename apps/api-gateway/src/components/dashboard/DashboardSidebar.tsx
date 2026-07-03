// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Dashboard Sidebar - Persona Navigation
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bell,
  Star,
  Download,
  FileText,
  Eye,
  Globe,
  Map,
  Ship,
  Scale,
  Package,
  Filter,
  ChevronDown,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import type { UserAccess } from '@souvera/entitlements';

interface DashboardSidebarProps {
  userAccess: UserAccess;
  tier: string;
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
  items: NavItem[];
  tierRequired?: string[]; // Show only for these tiers
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string; // For counts/notifications
  tierRequired?: string[];
}

export function DashboardSidebar({ userAccess, tier }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['navigation', 'trade'])
  );

  // Define navigation sections based on tier
  const sections: NavSection[] = [
    {
      id: 'hub',
      label: 'Communication Hub',
      icon: Bell,
      items: [
        { 
          href: '/dashboard/notifications', 
          label: 'Notifications', 
          icon: Bell,
          badge: '3' // TODO: Real count from DB
        },
      ],
    },
    {
      id: 'trade',
      label: 'Trade Intelligence',
      icon: Ship,
      tierRequired: ['business', 'investor', 'institutional'],
      items: [
        { href: '/intelligence/trade/demand', label: 'African Demand', icon: Globe },
        { href: '/intelligence/trade/demand-caribbean', label: 'Caribbean Demand', icon: Globe },
        { href: '/intelligence/trade/agoa/flows', label: 'AGOA Trade Flows', icon: Scale },
        { href: '/intelligence/trade/cbtpa/flows', label: 'CBTPA Trade Flows', icon: Scale },
        { href: '/intelligence/trade/agoa/products', label: 'AGOA Product Finder', icon: Package },
      ],
    },
    {
      id: 'navigation',
      label: 'My Intelligence',
      icon: LayoutDashboard,
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { 
          href: '/dashboard/saved', 
          label: 'Saved Analyses', 
          icon: Star,
          tierRequired: ['professional', 'business', 'investor', 'institutional']
        },
        { 
          href: '/dashboard/exports', 
          label: 'Export History', 
          icon: Download,
          badge: getTierExportLimit(tier),
          tierRequired: ['professional', 'business', 'investor', 'institutional']
        },
        { 
          href: '/dashboard/reports', 
          label: 'Reports', 
          icon: FileText,
          badge: getTierReportLimit(tier),
          tierRequired: ['business', 'investor', 'institutional']
        },
        { 
          href: '/dashboard/watchlist', 
          label: 'Market Watchlist', 
          icon: Eye,
          badge: getTierMarketLimit(tier)
        },
        { href: '/intelligence/map', label: 'Intelligence Map', icon: Map },
      ],
    },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  // Filter sections based on tier requirements
  const filteredSections = sections
    .filter(section => !section.tierRequired || section.tierRequired.includes(tier))
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.tierRequired || item.tierRequired.includes(tier))
    }));

  return (
    <aside className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-900/30 min-h-[calc(100vh-64px)]">
      <nav className="sticky top-16 p-4 space-y-1 max-h-[calc(100vh-64px)] overflow-y-auto">
        {filteredSections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const SectionIcon = section.icon;
          const hasActiveItem = section.items.some(item => isActive(item.href));

          return (
            <div key={section.id} className="mb-2">
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  hasActiveItem
                    ? 'text-white bg-zinc-800/50'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <SectionIcon className={`w-4 h-4 ${hasActiveItem ? 'text-blue-400' : 'text-zinc-500'}`} />
                  <span>{section.label}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                )}
              </button>

              {isExpanded && (
                <div className="mt-1 ml-3 pl-3 border-l border-zinc-800 space-y-0.5">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          active
                            ? 'text-white bg-blue-500/10 border-l-2 border-blue-500 -ml-[1px]'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <ItemIcon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-blue-400' : 'text-zinc-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300 flex-shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Tier Badge */}
        <div className="mt-6 pt-4 border-t border-zinc-800">
          <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs font-medium text-blue-400">
              {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {getTierDescription(tier)}
            </p>
          </div>
        </div>

        {/* Quick Filters Section */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Quick Filters</span>
            </div>
            <p className="text-xs text-zinc-500">Coming soon: Region, Sector, Date filters</p>
          </div>
        </div>
      </nav>
    </aside>
  );
}

// Helper functions
function getTierExportLimit(tier: string): string {
  const limits: Record<string, string> = {
    explorer: '0',
    professional: '5/mo',
    business: '50/mo',
    investor: '∞',
    institutional: '∞',
  };
  return limits[tier] || '0';
}

function getTierReportLimit(tier: string): string {
  const limits: Record<string, string> = {
    business: '1/mo',
    investor: '5/mo',
    institutional: '∞',
  };
  return limits[tier] || '0';
}

function getTierMarketLimit(tier: string): string {
  const limits: Record<string, string> = {
    explorer: '10',
    professional: '25',
    business: '50',
    investor: '∞',
    institutional: '∞',
  };
  return limits[tier] || '10';
}

function getTierDescription(tier: string): string {
  const descriptions: Record<string, string> = {
    explorer: 'Limited access to 10 markets',
    professional: 'Full access to 25 markets',
    business: 'Full access + reports',
    investor: 'Unlimited access',
    institutional: 'Enterprise features',
  };
  return descriptions[tier] || 'Standard access';
}
