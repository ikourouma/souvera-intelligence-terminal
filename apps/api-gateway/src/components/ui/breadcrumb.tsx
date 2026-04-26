"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb — fixed position, scroll-reveal, snap animation
// Fixes applied:
//   1. Uses data-nav-id="main-nav" attribute for reliable nav height detection
//   2. Faster animation (200ms cubic-bezier)
//   3. Correct max-width alignment matching the site grid
//   4. Handles slug segments with proper display names
// ─────────────────────────────────────────────────────────────────────────────

// Human-readable labels for dynamic/technical path segments
const SEGMENT_LABELS: Record<string, string> = {
  "africa-intelligence": "Africa Intelligence",
  "why-nc": "Why North Carolina",
  "why-africa": "Why Africa",
  "dual-continent-business-hub": "Dual-Continent Business Hub",
  "sovereign-incentives-grants": "Sovereign Incentives & Grants",
  "annual-report": "Annual Report",
  "life-sciences": "Life Sciences",
  "clean-energy": "Clean Energy",
  "market-outlook": "Market Outlook",
  "export-trade": "Export & Trade",
};

function formatSegment(seg: string): string {
  return SEGMENT_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
}

export function Breadcrumb() {
  const [isVisible, setIsVisible] = useState(false);
  const [navHeight, setNavHeight] = useState(90);
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const formatted = segments.map(formatSegment);

  useEffect(() => {
    // ── Measure sticky nav height via data attribute (reliable, no guessing) ──
    const measureNav = () => {
      // First: try the explicitly tagged nav wrapper
      const mainNav = document.querySelector<HTMLElement>('[data-nav-id="main-nav"]');
      if (mainNav) {
        setNavHeight(mainNav.offsetHeight);
        return;
      }
      // Fallback: first sticky div
      const stickyEl = document.querySelector<HTMLElement>(".sticky");
      if (stickyEl) {
        setNavHeight(stickyEl.offsetHeight);
        return;
      }
      setNavHeight(90);
    };

    measureNav();
    // Re-measure after a brief delay (flash banner may load asynchronously)
    const t1 = setTimeout(measureNav, 200);
    const t2 = setTimeout(measureNav, 800);
    window.addEventListener("resize", measureNav);

    const onScroll = () => setIsVisible(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measureNav);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  if (pathname === "/") return null;

  return (
    <div
      className="fixed z-40 w-full bg-zinc-950/96 backdrop-blur-md border-b border-zinc-800/50 shadow-sm py-2"
      style={{
        top: `${navHeight}px`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(-6px)",
        pointerEvents: isVisible ? "auto" : "none",
        transition: "opacity 200ms cubic-bezier(0.4,0,0.2,1), transform 200ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex items-center gap-1.5 text-[10px] font-bold text-zinc-600 uppercase tracking-widest overflow-hidden">
        <Link href="/" className="hover:text-blue-400 transition-colors flex items-center gap-1 shrink-0 py-0.5">
          <Home className="w-3 h-3" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        {formatted.map((label, i) => {
          const href = "/" + segments.slice(0, i + 1).join("/");
          const isLast = i === formatted.length - 1;
          return (
            <React.Fragment key={href}>
              <ChevronRight className="w-3 h-3 text-zinc-800 shrink-0" />
              {isLast ? (
                <span className="text-zinc-300 truncate max-w-[200px] sm:max-w-none">{label}</span>
              ) : (
                <Link href={href} className="hover:text-blue-400 transition-colors shrink-0 truncate max-w-[120px] sm:max-w-none">
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
