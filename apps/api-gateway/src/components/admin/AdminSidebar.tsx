// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Sidebar - Fortune 5 Enterprise Grade
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Database,
  BarChart3,
  FileText,
  Upload,
  Newspaper,
  ClipboardList,
  AlertTriangle,
  Globe,
  Scale,
  Users,
  Building2,
  ScrollText,
  Grid3X3,
  Key,
  CreditCard,
  Settings,
  Flag,
  FileSearch,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Receipt,
  Image,
  Megaphone,
  ToggleLeft,
  Shield,
  Palette,
} from 'lucide-react';

interface AdminSidebarProps {
  isSuperAdmin: boolean;
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
  items: NavItem[];
  superAdminOnly?: boolean;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export function AdminSidebar({ isSuperAdmin }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['data', 'content'])
  );

  const sections: NavSection[] = [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      items: [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/stats', label: 'Platform Stats', icon: BarChart3 },
      ],
    },
    {
      id: 'data',
      label: 'Data Management',
      icon: Database,
      items: [
        { href: '/admin/data/sources', label: 'Data Sources', icon: Database },
        { href: '/admin/data/indicators', label: 'Indicators', icon: BarChart3 },
        { href: '/admin/data/upload', label: 'Upload Data', icon: FileText },
        { href: '/admin/data/ingestion', label: 'Ingestion', icon: Upload },
        { href: '/admin/data/news-pulse', label: 'News Pulse', icon: Newspaper },
        { href: '/admin/data/reports', label: 'Reports', icon: ClipboardList },
        { href: '/admin/data/quality', label: 'Data Quality', icon: AlertTriangle },
        { href: '/admin/data/crosswalks', label: 'Crosswalks', icon: Globe },
      ],
    },
    {
      id: 'content',
      label: 'Content',
      icon: Newspaper,
      items: [
        { href: '/admin/content/news', label: 'Curated News', icon: Newspaper },
        { href: '/admin/content/trade-policy', label: 'Trade Policy', icon: Scale },
      ],
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      superAdminOnly: true,
      items: [
        { href: '/admin/users', label: 'All Users', icon: Users },
        { href: '/admin/users/organizations', label: 'Organizations', icon: Building2 },
        { href: '/admin/users/logs', label: 'Access Logs', icon: ScrollText },
      ],
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: DollarSign,
      superAdminOnly: true,
      items: [
        { href: '/admin/billing', label: 'Revenue Dashboard', icon: DollarSign },
        { href: '/admin/billing/subscriptions', label: 'Subscriptions', icon: CreditCard },
        { href: '/admin/billing/invoices', label: 'Invoices', icon: Receipt },
      ],
    },
    {
      id: 'marketing',
      label: 'Marketing CMS',
      icon: Palette,
      superAdminOnly: true,
      items: [
        { href: '/admin/marketing', label: 'CMS Dashboard', icon: LayoutDashboard },
        { href: '/admin/marketing/hero-slides', label: 'Hero Slides', icon: Image },
        { href: '/admin/marketing/banners', label: 'Flash Banners', icon: Megaphone },
        { href: '/admin/marketing/pricing', label: 'Pricing Display', icon: DollarSign },
        { href: '/admin/marketing/logos', label: 'Trust Logos', icon: Shield },
        { href: '/admin/marketing/feature-flags', label: 'Feature Flags', icon: ToggleLeft },
      ],
    },
    {
      id: 'access',
      label: 'Access Control',
      icon: Key,
      superAdminOnly: true,
      items: [
        { href: '/admin/matrix', label: 'Matrix Management', icon: Grid3X3 },
        { href: '/admin/matrix/plans', label: 'Plans', icon: CreditCard },
      ],
    },
    {
      id: 'system',
      label: 'System',
      icon: Settings,
      superAdminOnly: true,
      items: [
        { href: '/admin/system/config', label: 'Configuration', icon: Settings },
        { href: '/admin/system/flags', label: 'Feature Flags', icon: Flag },
        { href: '/admin/system/audit', label: 'Audit Logs', icon: FileSearch },
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
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const filteredSections = sections.filter(
    section => !section.superAdminOnly || isSuperAdmin
  );

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
                  <SectionIcon className={`w-4 h-4 ${hasActiveItem ? 'text-indigo-400' : 'text-zinc-500'}`} />
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
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          active
                            ? 'text-white bg-indigo-500/10 border-l-2 border-indigo-500 -ml-[1px]'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                        }`}
                      >
                        <ItemIcon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-zinc-500'}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Super Admin Badge */}
        {isSuperAdmin && (
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-xs font-medium text-purple-400">Super Admin Mode</p>
              <p className="text-xs text-zinc-500 mt-0.5">Full platform access enabled</p>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
