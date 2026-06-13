// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Layout
// Owner: Afronovation, Inc.
// ===========================================

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { verifyAdminAccess } from '@/lib/admin/verify-admin';
import { 
  Database, 
  Settings, 
  BarChart3, 
  AlertTriangle,
  Globe,
  Upload,
  Activity,
  Home,
  FileText,
  ClipboardList,
  Newspaper,
  Scale,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin } = await verifyAdminAccess();
  
  if (!isAdmin) {
    redirect('/login?redirect=/admin');
  }

  const dashboardNavItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
  ];

  const navItems = [
    { href: '/admin/data/sources', label: 'Data Sources', icon: Database },
    { href: '/admin/data/indicators', label: 'Indicators', icon: BarChart3 },
    { href: '/admin/data/upload', label: 'Upload Data', icon: FileText },
    { href: '/admin/data/ingestion', label: 'Ingestion', icon: Upload },
    { href: '/admin/data/news-pulse', label: 'News Pulse', icon: Newspaper },
    { href: '/admin/data/reports', label: 'Reports Reset', icon: ClipboardList },
    { href: '/admin/data/quality', label: 'Data Quality', icon: AlertTriangle },
    { href: '/admin/data/crosswalks', label: 'Crosswalks', icon: Globe },
  ];

  const contentNavItems = [
    { href: '/admin/content/news', label: 'Curated News', icon: Newspaper },
    { href: '/admin/content/trade-policy', label: 'Trade Policy', icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Admin Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="sr-only">Home</span>
              </Link>
              <div className="h-6 w-px bg-zinc-700" />
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <span className="text-white font-semibold">Souvera Admin</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/data/sources"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Data Management
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">System Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              {dashboardNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors group mb-4"
                >
                  <item.icon className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}

              <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                Data Management
              </p>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors group"
                >
                  <item.icon className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}

              <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 mt-8">
                Content
              </p>
              {contentNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors group"
                >
                  <item.icon className="w-5 h-5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
