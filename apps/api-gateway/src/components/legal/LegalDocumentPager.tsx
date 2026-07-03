'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

export type LegalSection = {
  title: string;
  content: ReactNode;
};

type Props = {
  sections: LegalSection[];
};

export function LegalDocumentPager({ sections }: Props) {
  const [index, setIndex] = useState(0);
  const current = sections[index];
  const isFirst = index === 0;
  const isLast = index === sections.length - 1;

  return (
    <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Section index — sidebar on desktop */}
        <nav
          className="lg:w-64 shrink-0"
          aria-label="Document sections"
        >
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-4">
            Sections
          </p>
          <ul className="space-y-1 max-h-[420px] overflow-y-auto pr-2">
            {sections.map((section, i) => (
              <li key={section.title}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`w-full text-left px-3 py-2.5 rounded-sm text-sm transition-colors ${
                    i === index
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border border-transparent'
                  }`}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Current section */}
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex items-center justify-between gap-4">
            <span className="text-xs font-mono text-zinc-500">
              Section {index + 1} of {sections.length}
            </span>
          </div>

          <article
            key={index}
            className="p-8 md:p-10 bg-[#121821] border border-zinc-800 rounded-sm min-h-[280px]"
          >
            <h2
              className="text-xl md:text-2xl font-bold text-white mb-6 tracking-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {current.title}
            </h2>
            <div className="prose prose-invert prose-zinc max-w-none prose-p:text-zinc-400 prose-p:leading-relaxed prose-li:text-zinc-400 prose-a:text-blue-400 prose-strong:text-zinc-200">
              {current.content}
            </div>
          </article>

          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setIndex((i) => i - 1)}
              disabled={isFirst}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-sm text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => i + 1)}
              disabled={isLast}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-sm text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
