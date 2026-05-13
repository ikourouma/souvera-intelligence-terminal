import type { Metadata } from 'next';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { CheckCircle2, Activity, ArrowRight, Clock, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'System Status | Souvera',
  description: 'Current operational status of the Souvera Intelligence platform and services.',
  openGraph: {
    title: 'System Status | Souvera',
    description: 'Current operational status of the Souvera Intelligence platform.',
    url: 'https://souvera.vercel.app/status',
  },
  alternates: {
    canonical: 'https://souvera.vercel.app/status',
  },
};

const SERVICES = [
  {
    name: 'Web Application',
    description: 'Primary web interface and user-facing services.',
    status: 'operational',
  },
  {
    name: 'API Services',
    description: 'RESTful API endpoints for data access.',
    status: 'operational',
  },
  {
    name: 'Database Services',
    description: 'Data storage and retrieval infrastructure.',
    status: 'operational',
  },
  {
    name: 'Authentication',
    description: 'User authentication and authorization services.',
    status: 'operational',
  },
];

export default function StatusPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white flex flex-col">
      <SouveraMegaNav />

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 pb-8 border-b border-zinc-800">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-sm">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <h1
                className="text-3xl font-bold text-white tracking-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                System Status
              </h1>
            </div>
            <p className="text-zinc-400">
              Current operational status of Souvera services.
            </p>
          </div>

          <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-400">All Systems Operational</div>
              <div className="text-[10px] text-zinc-500 font-mono">{currentDate}</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-sm flex items-start gap-3 mb-8">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium mb-1">Manual Status Review</p>
            <p className="text-sm text-blue-400/70">
              Service status is manually reviewed and updated. This page does not reflect automated uptime monitoring.
              For urgent issues, please contact support.
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-16">
          {SERVICES.map((service) => (
            <div
              key={service.name}
              className="p-6 bg-[#121821] border border-zinc-800 rounded-sm flex items-center justify-between"
            >
              <div>
                <h3 className="font-bold text-white mb-1">{service.name}</h3>
                <p className="text-sm text-zinc-500">{service.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono">
                  {service.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#121821] border border-zinc-800 rounded-sm p-8">
          <div className="flex items-start gap-4 mb-6">
            <Clock className="w-6 h-6 text-zinc-500 shrink-0" />
            <div>
              <h3
                className="font-bold text-white mb-2"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Scheduled Maintenance
              </h3>
              <p className="text-sm text-zinc-500">
                No scheduled maintenance at this time.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              Experiencing issues? Please contact our support team.
            </p>
            <Link
              href="/contact"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-widest rounded-sm flex items-center gap-2 transition-colors"
            >
              Contact Support
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <SouveraFooter />
    </main>
  );
}
