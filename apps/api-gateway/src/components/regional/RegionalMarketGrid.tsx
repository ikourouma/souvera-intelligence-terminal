/**
 * @deprecated This component is being phased out in favor of SouveraMapWorkspace.
 * 
 * RegionalMarketGrid has been replaced on /intelligence/africa with the embedded
 * SouveraMapWorkspace component (Phase 2). This component may still be used on
 * other regional pages during the transition period.
 * 
 * For new implementations, use:
 * - SouveraMapWorkspace (standalone or embedded)
 * - See: apps/api-gateway/src/components/intelligence/SouveraMapWorkspace.tsx
 */

'use client';

import { useState } from 'react';
import { MarketGrid } from '@/components/intelligence/MarketGrid';
import { CountryDrawer } from '@/components/intelligence/CountryDrawer';
import { PreviewDataBanner } from '@/components/intelligence/PreviewDataBanner';
import { IntelligenceMapClient } from '@/components/intelligence/IntelligenceMapClient';

interface RegionalMarketGridProps {
  region: 'africa' | 'caribbean';
  title?: string;
  description?: string;
}

export function RegionalMarketGrid({
  region,
  title = 'Market Intelligence',
  description,
}: RegionalMarketGridProps) {
  return (
    <section id="markets" className="py-16 border-b border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <div className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-4 ${
            region === 'africa' ? 'text-blue-500' : 'text-teal-500'
          }`}>
            {region === 'africa' ? 'Africa' : 'Caribbean'}
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {title}
          </h2>
          {description && (
            <p className="text-lg text-zinc-400 max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {/* Reuse IntelligenceMapClient which already handles region filtering */}
        <IntelligenceMapClient defaultRegion={region} />
      </div>
    </section>
  );
}
