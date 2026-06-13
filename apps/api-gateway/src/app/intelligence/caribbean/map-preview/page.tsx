import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { CaribbeanMapPreviewShell } from '@/components/intelligence/CaribbeanMapPreviewShell';

export const metadata: Metadata = {
  title: 'Caribbean Map QA | Souvera Intelligence',
  description:
    'Caribbean geospatial map with coverage audit — production map lives at /intelligence/caribbean.',
  robots: { index: false, follow: false },
};

export default function CaribbeanMapPreviewPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      <div className="pt-12 px-4 md:px-8 max-w-[1600px] mx-auto pb-24">
        <Link
          href="/intelligence/caribbean"
          className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Caribbean Intelligence
        </Link>

        <header className="border-b border-zinc-800 pb-6 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tighter">Caribbean Map QA</h1>
            <span className="px-2 py-1 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest rounded-sm">
              Migrated to production
            </span>
          </div>
          <p className="text-sm text-zinc-400 max-w-3xl">
            Geospatial map with 5-zone coloring and 20-territory coverage audit. Production workspace
            at{' '}
            <Link href="/intelligence/caribbean" className="text-teal-400 hover:text-teal-300">
              /intelligence/caribbean
            </Link>{' '}
            uses this map. v1 list UI archived at{' '}
            <Link href="/intelligence/caribbean/list-archive" className="text-zinc-400 hover:text-white">
              /intelligence/caribbean/list-archive
            </Link>
            .
          </p>
        </header>

        <CaribbeanMapPreviewShell />
      </div>

      <SouveraFooter />
    </main>
  );
}
