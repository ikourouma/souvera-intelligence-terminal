'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SouveraMapWorkspace } from './SouveraMapWorkspace';
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

/**
 * Client wrapper for SouveraMapWorkspace that syncs with URL query parameters.
 * 
 * Supports:
 * - ?region=africa|caribbean|all
 * - ?selected=ISO3
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

  // Read and validate selected country from URL
  const urlSelected = searchParams.get('selected');
  const initialSelected = validateSelectedForRegion(urlSelected, initialRegion);

  // Track if we're syncing state to avoid loops
  const [isSyncing, setIsSyncing] = useState(false);

  // Update URL when region or selection changes
  const updateUrl = useCallback((newRegion: RegionFilter, newSelected: string | null) => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    const params = new URLSearchParams();
    
    // Always include region in URL
    params.set('region', newRegion);
    
    // Include selected if not null
    if (newSelected) {
      params.set('selected', newSelected);
    }
    
    // Update URL without page reload
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    
    // Reset syncing flag after a brief delay
    setTimeout(() => setIsSyncing(false), 100);
  }, [pathname, router, isSyncing]);

  return (
    <SouveraMapWorkspace
      region={initialRegion}
      initialSelectedIso3={initialSelected}
      onRegionChange={(newRegion) => {
        // When region changes, remove selected from URL
        updateUrl(newRegion, null);
      }}
      onCountrySelect={(iso3) => {
        // When country selected, update URL with current region
        updateUrl(initialRegion, iso3);
      }}
      className={className}
    />
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
