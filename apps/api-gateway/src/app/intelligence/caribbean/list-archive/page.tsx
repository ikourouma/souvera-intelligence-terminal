import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SouveraMegaNav } from '@/components/ui/SouveraMegaNav';
import { SouveraFooter } from '@/components/ui/SouveraFooter';
import { CaribbeanListArchiveShell } from '@/components/intelligence/CaribbeanListArchiveShell';

export const metadata: Metadata = {
  title: 'Caribbean List UI Archive | Souvera',
  description: 'Archived v1 Caribbean market list shell — platform reference only.',
  robots: { index: false, follow: false },
};

export default function CaribbeanListArchivePage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <SouveraMegaNav />

      <div className="pt-12 px-4 md:px-8 max-w-[1600px] mx-auto pb-24">
        <Link
          href="/intelligence/caribbean"
          className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-white mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Caribbean Intelligence (live map)
        </Link>

        <header className="border-b border-zinc-800 pb-6 mb-8">
          <h1 className="text-2xl font-bold tracking-tighter mb-2">Caribbean List UI — Archive</h1>
          <p className="text-sm text-zinc-400 max-w-3xl">
            Phase 3 Step 4A searchable card grid, frozen for reference. See{' '}
            <code className="text-zinc-500 text-xs">
              docs/architecture/archive/caribbean-market-shell-v1-list.md
            </code>
          </p>
        </header>

        <CaribbeanListArchiveShell />
      </div>

      <SouveraFooter />
    </main>
  );
}
