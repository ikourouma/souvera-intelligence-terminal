'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SouveraMapWorkspace } from './SouveraMapWorkspace';
import { SectorsOverviewTab } from './SectorsOverviewTab';
import { 
  type RegionFilter, 
  isValidRegion,
  APPROVED_CARIBBEAN_ISO3,
} from '@/lib/market-coverage';
import { ISO3_REGION } from '@/lib/map-constants';

interface SouveraMapWorkspaceWithUrlProps {
  defaultRegion?: RegionFilter;
  className?: string;
}

type ViewMode = 'map' | 'sectors';

/**
 * Client wrapper for SouveraMapWorkspace that syncs with URL query parameters.
 * 
 * Supports:
 * - ?region=africa|caribbean|all
 * - ?selected=ISO3
 * - ?view=map|sectors (NEW)
 * 
 * Validates selected ISO3 against current region.
 */
export function SouveraMapWorkspaceWithUrl({
  defaultRegion = 'africa',
  className,
}: SouveraMapWorkspaceWithUrlProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read and validate region from URL
  const urlRegion = searchParams.get('region');
  const initialRegion = urlRegion && isValidRegion(urlRegion) ? urlRegion : defaultRegion;

  // Read and validate view from URL
  const urlView = searchParams.get('view');
  const initialView: ViewMode = urlView === 'sectors' ? 'sectors' : 'map';

  // Read and validate selected country from URL
  const urlSelected = searchParams.get('selected');
  const initialSelected = validateSelectedForRegion(urlSelected, initialRegion);

  // Track if we're syncing state to avoid loops
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>(initialView);

  // Update URL when region, view, or selection changes
  const updateUrl = useCallback((newRegion: RegionFilter, newSelected: string | null, newView?: ViewMode) => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    const params = new URLSearchParams();
    
    // Always include region in URL
    params.set('region', newRegion);
    
    // Include view if not default (map)
    if (newView && newView !== 'map') {
      params.set('view', newView);
    }
    
    // Include selected if not null and view is map
    if (newSelected && (!newView || newView === 'map')) {
      params.set('selected', newSelected);
    }
    
    // Update URL without page reload
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    
    // Reset syncing flag after a brief delay
    setTimeout(() => setIsSyncing(false), 100);
  }, [pathname, router, isSyncing]);

  const handleViewChange = useCallback((view: ViewMode) => {
    setCurrentView(view);
    updateUrl(initialRegion, null, view);
  }, [initialRegion, updateUrl]);

  const handleSectorClick = useCallback((sectorKey: string) => {
    // For now, just switch back to map view
    // TODO: In Phase 2, filter map by sector
    handleViewChange('map');
  }, [handleViewChange]);

  // Render sectors view
  if (currentView === 'sectors') {
    return (
      <div className={className}>
        {/* Simple tab switcher */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3">
          <div className="flex gap-4">
            <button
              onClick={() => handleViewChange('map')}
              className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Map View
            </button>
            <button
              onClick={() => handleViewChange('sectors')}
              className="text-sm font-semibold text-white border-b-2 border-blue-500"
            >
              Sectors Overview
            </button>
          </div>
        </div>
        <SectorsOverviewTab
          region={initialRegion}
          onSectorClick={handleSectorClick}
        />
      </div>
    );
  }

  // Render map view
  return (
    <div className={className}>
      {/* Simple tab switcher */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3">
        <div className="flex gap-4">
          <button
            onClick={() => handleViewChange('map')}
            className="text-sm font-semibold text-white border-b-2 border-blue-500"
          >
            Map View
          </button>
          <button
            onClick={() => handleViewChange('sectors')}
            className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Sectors Overview
          </button>
        </div>
      </div>
      <SouveraMapWorkspace
        region={initialRegion}
        initialSelectedIso3={initialSelected}
        onRegionChange={(newRegion) => {
          // When region changes, remove selected from URL
          updateUrl(newRegion, null, currentView);
        }}
        onCountrySelect={(iso3) => {
          // When country selected, update URL with current region
          updateUrl(initialRegion, iso3, currentView);
        }}
        className=""
        showTopNav={true}
      />
    </div>
  );
}

/**
 * Validate selected ISO3 against current region.
 * Returns normalized ISO3 if valid, null if invalid or wrong region.
 */
function validateSelectedForRegion(
  selected: string | null,
  region: RegionFilter
): string | null {
  if (!selected) return null;

  // Normalize to uppercase
  const iso3 = selected.toUpperCase();

  // Check if ISO3 is valid for the current region
  switch (region) {
    case 'africa':
      // Only allow African countries
      return ISO3_REGION[iso3] ? iso3 : null;

    case 'caribbean':
      // Only allow approved Caribbean countries
      return APPROVED_CARIBBEAN_ISO3.includes(iso3 as typeof APPROVED_CARIBBEAN_ISO3[number]) 
        ? iso3 
        : null;

    case 'all':
      // Allow both Africa and Caribbean
      const isAfrican = ISO3_REGION[iso3] !== undefined;
      const isCaribbean = APPROVED_CARIBBEAN_ISO3.includes(iso3 as typeof APPROVED_CARIBBEAN_ISO3[number]);
      return (isAfrican || isCaribbean) ? iso3 : null;

    default:
      return null;
  }
}
