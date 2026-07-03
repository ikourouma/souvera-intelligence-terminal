'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Map, UserPlus, X } from 'lucide-react';

export function StickyConversionBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (dismissed) return;
      setVisible(window.scrollY > 480);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-[#0B0F14]/95 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-400 hidden sm:block">
          Explore 74 markets free — or open the intelligence map now.
        </p>
        <div className="flex items-center gap-3 ml-auto">
          <Link
            href="/intelligence/map"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-sm transition-colors"
          >
            <Map className="w-4 h-4" />
            Open map
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Create free account
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
