'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function LoadingIndicatorInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleRouteChangeStart = useCallback(() => {
    setIsLoading(true);
    setIsVisible(true);
  }, []);

  const handleRouteChangeComplete = useCallback(() => {
    setIsLoading(false);
    setTimeout(() => setIsVisible(false), 300);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.href) {
        const url = new URL(anchor.href, window.location.origin);
        const isSameOrigin = url.origin === window.location.origin;
        const isDifferentPath = url.pathname !== window.location.pathname || url.search !== window.location.search;
        const isNotAnchorLink = !anchor.href.includes('#') || anchor.href.split('#')[0] !== window.location.href.split('#')[0];
        
        if (isSameOrigin && isDifferentPath && isNotAnchorLink && !anchor.target) {
          handleRouteChangeStart();
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [handleRouteChangeStart]);

  useEffect(() => {
    handleRouteChangeComplete();
  }, [pathname, searchParams, handleRouteChangeComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm transition-opacity duration-300 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
      aria-live="polite"
      aria-busy={isLoading}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Logo row: green dot + SOUVERA (horizontal like the brand logo) */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-5 h-5 rounded-full bg-emerald-500 z-10 shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
            <span className="absolute w-5 h-5 rounded-full bg-emerald-500 animate-souvera-wave-1" />
            <span className="absolute w-5 h-5 rounded-full bg-emerald-500 animate-souvera-wave-2" />
            <span className="absolute w-5 h-5 rounded-full bg-emerald-500 animate-souvera-wave-3" />
          </div>
          <span
            className="text-2xl font-semibold tracking-tight text-white"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            SOUVERA
          </span>
        </div>
        {/* Tagline below */}
        <span
          className="text-sm tracking-wide text-zinc-400"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Intelligence Terminal
        </span>
      </div>
    </div>
  );
}

export function GlobalLoadingIndicator() {
  return (
    <Suspense fallback={null}>
      <LoadingIndicatorInner />
    </Suspense>
  );
}
