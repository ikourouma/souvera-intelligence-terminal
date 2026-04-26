"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// SectionNav — Vertical dot navigator for inner pages
// Features:
//   - Fixed right-side vertical dots matching page sections
//   - IntersectionObserver to highlight active section
//   - Smooth-scroll with sticky header offset compensation
//   - Appears only after scrolling past hero (> 200px)
//   - Tooltips on hover showing section name
// ─────────────────────────────────────────────────────────────────────────────

export type NavSection = {
  id: string;     // Must match the section's id attribute on the page
  label: string;  // Short label shown in tooltip
};

type Props = {
  sections: NavSection[];
  accentColor?: string; // Tailwind color name e.g. "blue" | "emerald" | "amber"
};

export function SectionNav({ sections, accentColor = "blue" }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ── Visibility: show only after scrolling 200px ───────────────────────────
  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── IntersectionObserver: detect which section is in viewport ─────────────
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the entry that is most visible
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: null,
        // Top offset matches sticky nav (~90px), bottom threshold generous
        rootMargin: "-90px 0px -40% 0px",
        threshold: [0, 0.1, 0.25, 0.5],
      }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [sections]);

  // ── Smooth scroll to section with header offset ───────────────────────────
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Measure actual sticky nav height to offset correctly
    const stickyNav = document.querySelector<HTMLElement>('[data-nav-id="main-nav"]');
    const navHeight = stickyNav?.offsetHeight ?? 90;

    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 12;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);
  }, []);

  if (!isVisible || sections.length === 0) return null;

  const dotColors: Record<string, { active: string; inactive: string; tooltip: string }> = {
    blue:    { active: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]",    inactive: "bg-zinc-700 hover:bg-blue-400",    tooltip: "bg-zinc-900 border-blue-500/30 text-blue-300" },
    emerald: { active: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]", inactive: "bg-zinc-700 hover:bg-emerald-400", tooltip: "bg-zinc-900 border-emerald-500/30 text-emerald-300" },
    amber:   { active: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]",   inactive: "bg-zinc-700 hover:bg-amber-400",   tooltip: "bg-zinc-900 border-amber-500/30 text-amber-300" },
    purple:  { active: "bg-purple-500 shadow-[0_0_10px_rgba(124,58,237,0.8)]",  inactive: "bg-zinc-700 hover:bg-purple-400",  tooltip: "bg-zinc-900 border-purple-500/30 text-purple-300" },
  };
  const colors = dotColors[accentColor] ?? dotColors.blue;

  return (
    <div
      className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3 transition-all duration-300"
      style={{ opacity: isVisible ? 1 : 0, transform: `translateY(-50%) translateX(${isVisible ? 0 : 12}px)` }}
      aria-label="Page section navigation"
    >
      {sections.map(({ id, label }) => {
        const isActive = activeId === id;
        return (
          <div key={id} className="relative flex items-center group">
            {/* Tooltip — appears to the left of the dot */}
            <div
              className={`
                absolute right-full mr-3 px-2.5 py-1 rounded-sm border text-[10px] font-bold uppercase tracking-widest
                whitespace-nowrap pointer-events-none transition-all duration-200
                ${colors.tooltip}
                ${hoveredId === id ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"}
              `}
            >
              {label}
            </div>

            {/* Dot */}
            <button
              onClick={() => scrollTo(id)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
              aria-label={`Scroll to ${label}`}
              className={`
                w-2 h-2 rounded-full transition-all duration-300 cursor-pointer border-0 outline-none
                ${isActive
                  ? `scale-150 ${colors.active}`
                  : `scale-100 ${colors.inactive}`
                }
              `}
            />
          </div>
        );
      })}
    </div>
  );
}
