'use client';

import { APPROVED_CARIBBEAN_ISO3 } from '@/lib/market-coverage';
import {
  getCaribbeanZoneColors,
  ISO3_CARIBBEAN_ZONE,
  type CaribbeanZone,
} from '@/lib/map-constants';
import { countryDisplayName } from '@/lib/intelligence/country-names';

export interface CoverageStatus {
  iso3: string;
  inDatabase: boolean;
  onMapPolygon: boolean;
  onMapMarker: boolean;
}

interface CaribbeanCoverageAuditProps {
  coverage: CoverageStatus[];
  selectedIso3: string | null;
  onSelect: (iso3: string) => void;
}

export function buildCaribbeanCoverageStatus(
  apiIso3Set: Set<string>,
  polygonIso3Set: Set<string>,
  markerIso3Set: Set<string>
): CoverageStatus[] {
  return APPROVED_CARIBBEAN_ISO3.map((iso3) => ({
    iso3,
    inDatabase: apiIso3Set.has(iso3),
    onMapPolygon: polygonIso3Set.has(iso3),
    onMapMarker: markerIso3Set.has(iso3),
  }));
}

export function CaribbeanCoverageAudit({
  coverage,
  selectedIso3,
  onSelect,
}: CaribbeanCoverageAuditProps) {
  const onMapCount = coverage.filter((c) => c.onMapPolygon || c.onMapMarker).length;
  const inDbCount = coverage.filter((c) => c.inDatabase).length;
  const allClear =
    onMapCount === APPROVED_CARIBBEAN_ISO3.length &&
    inDbCount === APPROVED_CARIBBEAN_ISO3.length;

  const zoneCounts = coverage.reduce(
    (acc, c) => {
      const zone = ISO3_CARIBBEAN_ZONE[c.iso3];
      if (zone) acc[zone] = (acc[zone] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<CaribbeanZone, number>>
  );

  return (
    <div className="border-t border-zinc-800 bg-zinc-900/30 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Territory coverage · {onMapCount}/{APPROVED_CARIBBEAN_ISO3.length} on map
        </p>
        <span
          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm border ${
            allClear
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
          }`}
        >
          {allClear ? 'All listed' : 'Gaps detected'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-1.5">
        {coverage.map((item) => {
          const zoneColors = getCaribbeanZoneColors(item.iso3);
          const onMap = item.onMapPolygon || item.onMapMarker;
          const isSelected = selectedIso3 === item.iso3;

          return (
            <button
              key={item.iso3}
              type="button"
              onClick={() => onSelect(item.iso3)}
              className={`
                flex items-center gap-1.5 px-2 py-1.5 rounded-sm border text-left transition-colors
                ${isSelected ? 'border-white/40 bg-zinc-800' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'}
              `}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: zoneColors.fill }}
              />
              <span className="text-[10px] text-zinc-300 truncate flex-1">
                {countryDisplayName(item.iso3)}
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  onMap ? 'bg-emerald-500' : item.inDatabase ? 'bg-amber-500' : 'bg-red-500'
                }`}
                title={
                  onMap
                    ? item.onMapMarker
                      ? 'Marker'
                      : 'Polygon'
                    : item.inDatabase
                      ? 'In DB, not on map'
                      : 'Missing from DB'
                }
              />
            </button>
          );
        })}
      </div>

      <p className="text-[9px] text-zinc-600 mt-2 font-mono">
        {Object.entries(zoneCounts)
          .map(([z, n]) => `${z.replace(/_/g, ' ')}: ${n}`)
          .join(' · ')}
      </p>
    </div>
  );
}
