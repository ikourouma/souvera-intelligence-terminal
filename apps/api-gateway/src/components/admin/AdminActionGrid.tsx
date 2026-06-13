// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Action Grid Component
// Owner: Afronovation, Inc.
// ===========================================

'use client';

import Link from 'next/link';
import { 
  Database, 
  BarChart3, 
  FileText,
  Upload,
  AlertTriangle,
  Globe,
  Newspaper,
  Scale,
  Activity,
  ClipboardList,
} from 'lucide-react';

const adminActions = [
  {
    href: '/admin/data/sources',
    label: 'Data Sources',
    description: 'Manage data source registry',
    icon: Database,
    color: 'indigo',
  },
  {
    href: '/admin/data/indicators',
    label: 'Indicators',
    description: 'Manage economic indicators',
    icon: BarChart3,
    color: 'blue',
  },
  {
    href: '/admin/data/upload',
    label: 'Upload Data',
    description: 'Upload CSV/Excel data files',
    icon: FileText,
    color: 'emerald',
  },
  {
    href: '/admin/data/ingestion',
    label: 'Ingestion',
    description: 'Monitor data ingestion jobs',
    icon: Upload,
    color: 'purple',
  },
  {
    href: '/admin/data/news-pulse',
    label: 'News Pulse',
    description: 'AI news monitoring',
    icon: Activity,
    color: 'cyan',
  },
  {
    href: '/admin/data/reports',
    label: 'Reports Reset',
    description: 'Reset report generation state',
    icon: ClipboardList,
    color: 'amber',
  },
  {
    href: '/admin/data/quality',
    label: 'Data Quality',
    description: 'Quality checks and validation',
    icon: AlertTriangle,
    color: 'orange',
  },
  {
    href: '/admin/data/crosswalks',
    label: 'Crosswalks',
    description: 'Manage code mappings',
    icon: Globe,
    color: 'teal',
  },
  {
    href: '/admin/content/news',
    label: 'Curated News',
    description: 'Manage news articles',
    icon: Newspaper,
    color: 'blue',
  },
  {
    href: '/admin/content/trade-policy',
    label: 'Trade Policy',
    description: 'Manage trade policy content',
    icon: Scale,
    color: 'indigo',
  },
];

const colorClasses = {
  indigo: 'group-hover:text-indigo-400',
  blue: 'group-hover:text-blue-400',
  emerald: 'group-hover:text-emerald-400',
  purple: 'group-hover:text-purple-400',
  cyan: 'group-hover:text-cyan-400',
  amber: 'group-hover:text-amber-400',
  orange: 'group-hover:text-orange-400',
  teal: 'group-hover:text-teal-400',
};

export function AdminActionGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {adminActions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="bg-zinc-800/50 rounded-lg p-3 group-hover:bg-zinc-700/50 transition-colors">
              <action.icon className={`w-6 h-6 text-zinc-500 transition-colors ${colorClasses[action.color]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white mb-1">
                {action.label}
              </h3>
              <p className="text-xs text-zinc-400">
                {action.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
