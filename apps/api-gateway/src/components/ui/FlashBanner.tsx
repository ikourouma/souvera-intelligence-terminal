'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, X, Megaphone } from 'lucide-react';
import Link from 'next/link';

// Admin-managed via Supabase `site_announcements` table.
// Fallback to hardcoded default when DB is unavailable.
const FALLBACK_ANNOUNCEMENT = {
  label: 'Now Live',
  message: 'Souvera Intelligence Terminal — Africa & Caribbean market intelligence now available.',
  cta: 'Explore Platform',
  href: '/platform',
};

type Announcement = typeof FALLBACK_ANNOUNCEMENT;

export function FlashBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [announcement, setAnnouncement] = useState<Announcement>(FALLBACK_ANNOUNCEMENT);

  useEffect(() => {
    // TODO: Fetch from Supabase `site_announcements` where active=true
    // const { data } = await supabase.from('site_announcements').select('*').eq('active', true).single()
    // if (data) setAnnouncement(data)
  }, []);

  if (!isVisible) return null;

  return (
    <div className="w-full relative z-[60]" style={{ background: 'linear-gradient(90deg, #1d4ed8 0%, #1e3a8a 40%, #166534 100%)' }}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center p-1 bg-white/15 rounded-full shrink-0">
            <Megaphone className="w-3 h-3 text-white" />
          </div>
          <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200 shrink-0 mr-1">
            {announcement.label}:
          </span>
          <span className="text-[11px] font-medium text-white/90 truncate">
            {announcement.message}
          </span>
        </div>

        <div className="flex items-center gap-5 shrink-0 ml-4">
          <Link
            href={announcement.href}
            className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-white hover:text-emerald-200 transition-colors group"
          >
            <span className="underline underline-offset-4 decoration-white/30 group-hover:decoration-emerald-300 transition-colors">
              {announcement.cta}
            </span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/50 hover:text-white transition-colors focus:outline-none p-0.5 rounded-sm"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
