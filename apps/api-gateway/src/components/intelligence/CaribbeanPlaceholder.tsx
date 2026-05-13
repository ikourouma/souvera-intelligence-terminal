'use client';

import Link from 'next/link';
import { Globe } from 'lucide-react';
import { DATA_STATUS_LABELS } from '@/lib/map-constants';

interface CaribbeanPlaceholderProps {
  onSwitchToAfrica: () => void;
}

export function CaribbeanPlaceholder({ onSwitchToAfrica }: CaribbeanPlaceholderProps) {
  return (
    <div className="min-h-[600px] bg-zinc-950 flex flex-col">
      {/* Main content - centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-2xl">
          {/* Icon */}
          <div className="mb-6">
            <Globe className="w-16 h-16 text-blue-500 mx-auto" />
          </div>
          
          {/* Headline */}
          <h2 
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Caribbean Intelligence
          </h2>
          
          {/* Subheadline */}
          <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
            Premium market shell for 20 Caribbean markets and territories is being finalized.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onSwitchToAfrica}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors"
            >
              Switch to Africa Intelligence
            </button>
            <Link
              href="/access/request-access"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors"
            >
              Request Access
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-[10px]">
          <span className="text-amber-500 font-bold uppercase tracking-wider">
            {DATA_STATUS_LABELS.previewData}
          </span>
          <span className="hidden sm:inline text-zinc-600">·</span>
          <span className="text-[9px] text-zinc-700 font-medium">
            Afronovation, Inc.
          </span>
        </div>
      </div>
    </div>
  );
}
