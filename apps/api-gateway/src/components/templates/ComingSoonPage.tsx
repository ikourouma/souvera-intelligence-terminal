'use client';

import React from 'react';
import Link from 'next/link';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import {
  ArrowRight,
  Clock,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  Map,
  GitCompare,
  Terminal,
  Zap,
  Database,
  Code,
  Banknote,
  Gem,
  Wheat,
  Truck,
  Palmtree,
  BarChart3,
  Presentation,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  clock: Clock,
  shield: Shield,
  helpCircle: HelpCircle,
  fileText: FileText,
  map: Map,
  gitCompare: GitCompare,
  terminal: Terminal,
  zap: Zap,
  database: Database,
  code: Code,
  banknote: Banknote,
  gem: Gem,
  wheat: Wheat,
  truck: Truck,
  palmtree: Palmtree,
  barChart3: BarChart3,
  presentation: Presentation,
};

interface Props {
  title: string;
  tagline: string;
  description: string;
  iconName?: keyof typeof ICON_MAP;
  expectedRelease?: string;
  backLink?: {
    label: string;
    href: string;
  };
}

export function ComingSoonPage({
  title,
  tagline,
  description,
  iconName = 'clock',
  expectedRelease,
  backLink = { label: 'Back to Home', href: '/' },
}: Props) {
  const Icon = ICON_MAP[iconName] || Clock;

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white flex flex-col">
      <SouveraMegaNav />

      <div className="flex-1 flex items-center justify-center py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mx-auto mb-8">
            <Icon className="w-10 h-10 text-blue-500" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-sm mb-6">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
            </span>
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-amber-400">
              {tagline}
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {title}
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed mb-8 max-w-lg mx-auto">
            {description}
          </p>

          {expectedRelease && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm mb-10">
              <Clock className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-400">Expected: {expectedRelease}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/access/request-access"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Get Early Access
            </Link>
            <Link
              href={backLink.href}
              className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-[12px] tracking-widest uppercase transition-all rounded-sm flex items-center gap-2"
            >
              {backLink.label}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-8 border-t border-zinc-800">
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest">
              Engineered by Afronovation, Inc.
            </p>
          </div>
        </div>
      </div>

      <SouveraFooter />
    </main>
  );
}
