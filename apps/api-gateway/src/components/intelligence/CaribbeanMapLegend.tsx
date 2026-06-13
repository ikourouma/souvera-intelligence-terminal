'use client';

import { CARIBBEAN_ZONE_COLORS, type CaribbeanZone } from '@/lib/map-constants';

interface CaribbeanMapLegendProps {
  compact?: boolean;
  countByZone?: Partial<Record<CaribbeanZone, number>>;
}

const ZONE_ORDER: CaribbeanZone[] = [
  'greater_antilles',
  'lesser_antilles',
  'bahamas',
  'mainland_rim',
  'territories',
];

export function CaribbeanMapLegend({ compact = false, countByZone }: CaribbeanMapLegendProps) {
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-2 ${compact ? 'gap-x-3' : ''}`}>
      {ZONE_ORDER.map((zone) => {
        const colors = CARIBBEAN_ZONE_COLORS[zone];
        const count = countByZone?.[zone];
        return (
          <div key={zone} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: colors.fill }}
            />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              {colors.label}
              {count != null && (
                <span className="text-zinc-600 font-mono ml-1">({count})</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
