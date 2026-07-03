'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SouveraMapWorkspace } from './SouveraMapWorkspace';
import { SectorsOverviewTab } from './SectorsOverviewTab';
import { MapWorkspaceTopNav } from './MapWorkspaceTopNav';
import {
  type RegionFilter,
  isValidRegion,
  APPROVED_CARIBBEAN_ISO3,
  getWorkspaceLabelForRegion,
} from '@/lib/market-coverage';
import { ISO3_REGION } from '@/lib/map-constants';

interface SouveraMapWorkspaceWithUrlProps {
  defaultRegion?: RegionFilter;
  className?: string;
}

type ViewMode = 'map' | 'sectors';

function MapViewTabs({
  currentView,
  onViewChange,
  stacked = false,
}: {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  stacked?: boolean;
}) {
  return (
    <div className={stacked ? 'border-b border-zinc-800/50' : 'bg-zinc-900/80 border-b border-zinc-800'}>
      <div className={`max-w-[1600px] mx-auto px-6 lg:px-12 flex gap-4 ${stacked ? 'pt-3 pb-2' : 'py-3'}`}>
        <button
          type="button"
          onClick={() => onViewChange('map')}
          className={`text-sm font-semibold transition-colors ${
            currentView === 'map'
              ? 'text-white border-b-2 border-blue-500 pb-0.5'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Map View
        </button>
        <button
          type="button"
          onClick={() => onViewChange('sectors')}
          className={`text-sm font-semibold transition-colors ${
            currentView === 'sectors'
              ? 'text-white border-b-2 border-blue-500 pb-0.5'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Sectors Overview
        </button>
      </div>
    </div>
  );
}

/**
 * Client wrapper for SouveraMapWorkspace that syncs with URL query parameters.
 *
 * Supports:
 * - ?region=africa|caribbean|all
 * - ?selected=ISO3
 * - ?view=map|sectors
 */
export function SouveraMapWorkspaceWithUrl({
  defaultRegion = 'africa',
  className,
}: SouveraMapWorkspaceWithUrlProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlRegion = searchParams.get('region');
  const initialRegion = urlRegion && isValidRegion(urlRegion) ? urlRegion : defaultRegion;

  const urlView = searchParams.get('view');
  const initialView: ViewMode = urlView === 'sectors' ? 'sectors' : 'map';

  const urlSelected = searchParams.get('selected');
  const initialSelected = validateSelectedForRegion(urlSelected, initialRegion);

  const [isSyncing, setIsSyncing] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>(initialView);

  const updateUrl = useCallback(
    (newRegion: RegionFilter, newSelected: string | null, newView?: ViewMode) => {
      if (isSyncing) return;

      setIsSyncing(true);
      const params = new URLSearchParams();
      params.set('region', newRegion);

      if (newView && newView !== 'map') {
        params.set('view', newView);
      }

      if (newSelected && (!newView || newView === 'map')) {
        params.set('selected', newSelected);
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      setTimeout(() => setIsSyncing(false), 100);
    },
    [pathname, router, isSyncing]
  );

  const handleViewChange = useCallback(
    (view: ViewMode) => {
      setCurrentView(view);
      updateUrl(initialRegion, null, view);
    },
    [initialRegion, updateUrl]
  );

  const handleSectorClick = useCallback(() => {
    handleViewChange('map');
  }, [handleViewChange]);

  return (
    <div
      className={`bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden ${className || ''}`}
    >
      <div className="bg-zinc-900/80 border-b border-zinc-800">
        <MapViewTabs stacked currentView={currentView} onViewChange={handleViewChange} />
        {currentView === 'map' && (
          <MapWorkspaceTopNav
            stacked
            workspaceLabel={getWorkspaceLabelForRegion(initialRegion)}
            region={initialRegion}
            onRegionChange={(newRegion) => {
              updateUrl(newRegion, null, currentView);
            }}
            showRegionFilter
          />
        )}
      </div>

      {currentView === 'sectors' ? (
        <SectorsOverviewTab region={initialRegion} onSectorClick={handleSectorClick} />
      ) : (
        <SouveraMapWorkspace
          region={initialRegion}
          initialSelectedIso3={initialSelected}
          onRegionChange={(newRegion) => {
            updateUrl(newRegion, null, currentView);
          }}
          onCountrySelect={(iso3) => {
            updateUrl(initialRegion, iso3, currentView);
          }}
          frameless
          showTopNav={false}
        />
      )}
    </div>
  );
}

function validateSelectedForRegion(
  selected: string | null,
  region: RegionFilter
): string | null {
  if (!selected) return null;

  const iso3 = selected.toUpperCase();

  switch (region) {
    case 'africa':
      return ISO3_REGION[iso3] ? iso3 : null;

    case 'caribbean':
      return APPROVED_CARIBBEAN_ISO3.includes(iso3 as (typeof APPROVED_CARIBBEAN_ISO3)[number])
        ? iso3
        : null;

    case 'all': {
      const isAfrican = ISO3_REGION[iso3] !== undefined;
      const isCaribbean = APPROVED_CARIBBEAN_ISO3.includes(
        iso3 as (typeof APPROVED_CARIBBEAN_ISO3)[number]
      );
      return isAfrican || isCaribbean ? iso3 : null;
    }

    default:
      return null;
  }
}
