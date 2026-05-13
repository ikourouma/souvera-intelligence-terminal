'use client';

// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Data Pending Placeholder Component
// Owner: Afronovation, Inc.
// ===========================================

import { Clock, Database, FileQuestion } from 'lucide-react';

interface DataPendingPlaceholderProps {
  message?: string;
  subMessage?: string;
  variant?: 'inline' | 'card' | 'minimal';
  icon?: 'clock' | 'database' | 'question';
}

export function DataPendingPlaceholder({
  message = 'Data pending',
  subMessage,
  variant = 'inline',
  icon = 'clock',
}: DataPendingPlaceholderProps) {
  const Icon = {
    clock: Clock,
    database: Database,
    question: FileQuestion,
  }[icon];

  if (variant === 'minimal') {
    return (
      <span className="text-zinc-500 text-sm italic">{message}</span>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{message}</span>
      </div>
    );
  }

  // Card variant
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/30 border border-zinc-800 rounded-lg text-center">
      <div className="p-3 bg-zinc-800/50 rounded-full mb-4">
        <Icon className="w-6 h-6 text-zinc-500" />
      </div>
      <p className="text-zinc-400 font-medium">{message}</p>
      {subMessage && (
        <p className="text-zinc-500 text-sm mt-1">{subMessage}</p>
      )}
    </div>
  );
}

// Specific variant for metric values
export function MetricPendingValue() {
  return (
    <span className="text-zinc-600 text-sm">—</span>
  );
}
