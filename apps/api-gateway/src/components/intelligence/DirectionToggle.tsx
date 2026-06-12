'use client';

import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export type FlowDirection = 'imports' | 'exports';

interface DirectionToggleProps {
  direction: FlowDirection;
  onChange: (direction: FlowDirection) => void;
  importLabel?: string;
  exportLabel?: string;
}

export function DirectionToggle({
  direction,
  onChange,
  importLabel = 'Imports',
  exportLabel = 'Exports',
}: DirectionToggleProps) {
  return (
    <div className="inline-flex items-center bg-zinc-900 border border-zinc-700 rounded-lg p-1">
      <button
        type="button"
        onClick={() => onChange('imports')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          direction === 'imports'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <ArrowDownLeft className="w-4 h-4" />
        {importLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange('exports')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          direction === 'exports'
            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <ArrowUpRight className="w-4 h-4" />
        {exportLabel}
      </button>
    </div>
  );
}
