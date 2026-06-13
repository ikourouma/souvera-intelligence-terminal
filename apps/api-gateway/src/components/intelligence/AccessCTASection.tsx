'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AccessCTASection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  
  // Hide this section if a country is selected
  const selectedCountry = searchParams.get('selected');
  
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setLoading(false);
    }
    checkAuth();
  }, []);

  // Don't show access CTA if a country is already selected
  if (selectedCountry) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-12 lg:py-16 border-t border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="h-8 bg-zinc-800/30 w-64 rounded mb-4" />
            <div className="h-6 bg-zinc-800/30 w-full rounded mb-6" />
            <div className="h-12 bg-zinc-800/30 w-32 rounded" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16 border-t border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="max-w-3xl">
          <h2
            className="text-xl lg:text-2xl font-bold mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Enhanced Intelligence Access
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-6">
            Advanced intelligence features including FDI data, full sector rationale, investment signals, and comprehensive country narratives are available to Professional and Business tier users.
          </p>
          <div className="flex flex-wrap gap-4">
            {isAuthenticated ? (
              <Link
                href="/access"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] tracking-widest uppercase transition-all rounded-sm"
              >
                Upgrade Plan
              </Link>
            ) : (
              <Link
                href="/access/request-access"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] tracking-widest uppercase transition-all rounded-sm"
              >
                Request Access
              </Link>
            )}
            <Link
              href="/intelligence/africa"
              className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-[11px] tracking-widest uppercase transition-all rounded-sm"
            >
              Africa Regional Overview
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
