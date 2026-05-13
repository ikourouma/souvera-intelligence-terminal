'use client';

import { REGION_COLORS, type AfricaRegion } from '@/lib/map-constants';

interface RegionalLegendProps {
  compact?: boolean;
  showCount?: boolean;
  countByRegion?: Record<AfricaRegion, number>;
}

export function RegionalLegend({ 
  compact = false,
  showCount = false,
  countByRegion,
}: RegionalLegendProps) {
  const regions = Object.entries(REGION_COLORS) as [AfricaRegion, typeof REGION_COLORS[AfricaRegion]][];

  if (compact) {
    return (
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
        {regions.map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: config.fill }} 
            />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
              {config.label}
              {showCount && countByRegion && (
                <span className="text-zinc-600 ml-1">({countByRegion[key] || 0})</span>
              )}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
      <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
        Regional Legend
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {regions.map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm shrink-0" 
              style={{ backgroundColor: config.fill }} 
            />
            <div>
              <span className="text-xs font-semibold text-zinc-300 block">
                {config.label}
              </span>
              {showCount && countByRegion && (
                <span className="text-[10px] text-zinc-600">
                  {countByRegion[key] || 0} countries
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
