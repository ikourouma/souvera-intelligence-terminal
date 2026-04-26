"use client";

import React, { useEffect, useState } from "react";

export type NavSection = {
  id: string;
  label: string;
};

interface SideNavProps {
  sections: NavSection[];
  accentColor?: "blue" | "emerald" | "amber" | "purple" | "green" | "red";
}

export function SideNav({ sections, accentColor = "blue" }: SideNavProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px", // Trigger when section is in upper-mid viewport
      threshold: 0,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace("section-", "");
          setActiveSection(id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    sections.forEach((s) => {
      const el = document.getElementById(`section-${s.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const headerOffset = 100; // Account for sticky header
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(id);
    }
  };

  const colorMap = {
    blue:    { text: "text-blue-400", bg: "bg-blue-500" },
    emerald: { text: "text-emerald-400", bg: "bg-emerald-500" },
    green:   { text: "text-emerald-400", bg: "bg-emerald-500" },
    amber:   { text: "text-amber-400", bg: "bg-amber-500" },
    purple:  { text: "text-purple-400", bg: "bg-purple-500" },
    red:     { text: "text-red-400", bg: "bg-red-500" },
  };

  const colors = colorMap[accentColor] || colorMap.blue;

  return (
    <div className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 z-50 flex-col items-end space-y-4">
      {sections.map((s) => {
        const isActive = activeSection === s.id;
        return (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className="flex items-center group focus:outline-none"
            aria-label={`Scroll to ${s.label}`}
          >
            <span 
              className={`text-[9px] font-black uppercase tracking-[0.2em] mr-4 transition-all duration-300 transform
                opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0
                ${isActive ? colors.text : "text-zinc-600"}
              `}
            >
              {s.label}
            </span>
            <div 
              className={`rounded-full transition-all duration-500 border
                ${isActive 
                  ? `w-3 h-3 ${colors.bg} border-transparent shadow-[0_0_10px_rgba(59,130,246,0.5)]` 
                  : `w-2 h-2 bg-zinc-800 border-zinc-700 group-hover:border-zinc-500 group-hover:bg-zinc-700`}
              `}
            />
          </button>
        );
      })}
    </div>
  );
}
