'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { Globe, MapPin, RefreshCw } from 'lucide-react';
import { 
  REGION_COLORS, 
  ISO3_REGION, 
  resolveIso3FromGeo,
  GEO_URLS,
  type AfricaRegion,
  isDisputedTerritory,
} from '@/lib/map-constants';
import { MapTooltip } from './MapTooltip';
import { RegionalLegend } from './RegionalLegend';

// GeoJSON feature type for react-simple-maps
interface GeoFeature {
  rsmKey: string;
  properties: {
    name?: string;
    NAME?: string;
    iso_a3?: string;
    ISO_A3?: string;
    [key: string]: unknown;
  };
}

interface Country {
  iso3: string;
  name: string;
  flagUrl?: string;
  gdpCurrentUsd?: number;
  gdpGrowthPct?: number;
  populationTotal?: number;
  capital?: string;
  subregion?: string;
  region?: string;
}

interface AfricaMapPanelProps {
  countries: Country[];
  selectedIso3: string | null;
  onCountrySelect: (iso3: string) => void;
  loading?: boolean;
}

interface TooltipData {
  iso3: string;
  name: string;
  region?: AfricaRegion;
  flagUrl?: string;
  gdpCurrentUsd?: number;
  gdpGrowthPct?: number;
  populationTotal?: number;
  capital?: string;
  subregion?: string;
}

export function AfricaMapPanel({
  countries,
  selectedIso3,
  onCountrySelect,
  loading = false,
}: AfricaMapPanelProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [geoUrl, setGeoUrl] = useState<string>(GEO_URLS.primary);
  const [geoError, setGeoError] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build country lookup map
  const countryMap = useCallback(() => {
    const map = new Map<string, Country>();
    countries.forEach(c => {
      map.set(c.iso3, c);
    });
    return map;
  }, [countries]);

  // Responsive handling
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pre-validate GeoJSON URL
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    fetch(GEO_URLS.primary, { signal: controller.signal, method: 'HEAD' })
      .then((res) => {
        clearTimeout(timeout);
        if (!res.ok) {
          setGeoUrl(GEO_URLS.fallback);
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        setGeoUrl(GEO_URLS.fallback);
        
        // Try fallback
        const fallbackController = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), 5000);
        fetch(GEO_URLS.fallback, { signal: fallbackController.signal, method: 'HEAD' })
          .then((res) => {
            clearTimeout(fallbackTimeout);
            if (!res.ok) setGeoError(true);
          })
          .catch(() => {
            clearTimeout(fallbackTimeout);
            setGeoError(true);
          });
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // Get ISO3 from geo feature — checks iso_a3 property first, then name lookup
  const getCountryISO3 = useCallback((geo: GeoFeature): string | null => {
    return resolveIso3FromGeo(geo.properties);
  }, []);

  // Check if country is in Souvera scope
  const isInScope = useCallback((iso3: string | null): boolean => {
    if (!iso3) return false;
    return iso3 in ISO3_REGION;
  }, []);

  // Get fill color for a country
  const getFillColor = useCallback((geo: GeoFeature): string => {
    const iso3 = getCountryISO3(geo);
    if (!iso3 || !isInScope(iso3)) return 'transparent';
    
    if (isDisputedTerritory(iso3)) {
      return REGION_COLORS.north.fill + '88';
    }
    
    const region = ISO3_REGION[iso3];
    if (!region) return '#27272a';
    
    // Selected country gets distinct styling
    if (iso3 === selectedIso3) {
      return REGION_COLORS[region].hover;
    }
    
    return REGION_COLORS[region].fill;
  }, [getCountryISO3, isInScope, selectedIso3]);

  // Get hover color
  const getHoverColor = useCallback((geo: GeoFeature): string => {
    const iso3 = getCountryISO3(geo);
    if (!iso3 || !isInScope(iso3)) return 'transparent';
    
    if (isDisputedTerritory(iso3)) {
      return REGION_COLORS.north.hover + 'aa';
    }
    
    const region = ISO3_REGION[iso3];
    if (!region) return '#3f3f46';
    
    return REGION_COLORS[region].hover;
  }, [getCountryISO3, isInScope]);

  // Get stroke for selected country
  const getStroke = useCallback((geo: GeoFeature): string => {
    const iso3 = getCountryISO3(geo);
    if (iso3 === selectedIso3) {
      return '#ffffff';
    }
    return '#09090b';
  }, [getCountryISO3, selectedIso3]);

  const getStrokeWidth = useCallback((geo: GeoFeature): number => {
    const iso3 = getCountryISO3(geo);
    if (iso3 === selectedIso3) {
      return 1.5;
    }
    return 0.5;
  }, [getCountryISO3, selectedIso3]);

  // Mouse handlers
  const handleMouseMove = useCallback((geo: GeoFeature, evt: React.MouseEvent) => {
    const iso3 = getCountryISO3(geo);
    if (!iso3 || !isInScope(iso3)) {
      setTooltip(null);
      setTooltipPosition(null);
      return;
    }

    const countryData = countryMap().get(iso3);
    const countryName = (geo.properties?.name ?? geo.properties?.NAME ?? iso3) as string;
    const region = ISO3_REGION[iso3];

    setTooltip({
      iso3,
      name: countryName,
      region,
      flagUrl: countryData?.flagUrl,
      gdpCurrentUsd: countryData?.gdpCurrentUsd,
      gdpGrowthPct: countryData?.gdpGrowthPct,
      populationTotal: countryData?.populationTotal,
      capital: countryData?.capital,
      subregion: countryData?.subregion,
    });
    setTooltipPosition({ x: evt.clientX, y: evt.clientY });
  }, [getCountryISO3, isInScope, countryMap]);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    setTooltipPosition(null);
  }, []);

  const handleCountryClick = useCallback((geo: GeoFeature) => {
    const iso3 = getCountryISO3(geo);
    if (!iso3 || !isInScope(iso3)) return;
    if (isDisputedTerritory(iso3)) return;
    
    onCountrySelect(iso3);
    setTooltip(null);
    setTooltipPosition(null);
  }, [getCountryISO3, isInScope, onCountrySelect]);

  // Calculate region counts
  const regionCounts = useCallback(() => {
    const counts: Record<AfricaRegion, number> = {
      west: 0, east: 0, north: 0, central: 0, south: 0
    };
    countries.forEach(c => {
      const region = ISO3_REGION[c.iso3];
      if (region) counts[region]++;
    });
    return counts;
  }, [countries]);

  if (geoError) {
    return (
      <div className="h-full bg-[#0a0a0a] border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-16 h-16 rounded-full bg-amber-950/40 border border-amber-800/40 flex items-center justify-center">
          <Globe className="w-8 h-8 text-amber-500" />
        </div>
        <div className="text-center max-w-sm">
          <h3 className="text-white font-bold text-lg mb-2">Map Temporarily Unavailable</h3>
          <p className="text-zinc-500 text-sm leading-relaxed mb-4">
            Unable to load map geometry. Country intelligence is still available in the panel.
          </p>
          <button
            onClick={() => { setGeoError(false); setGeoUrl(GEO_URLS.primary); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors border border-zinc-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" ref={containerRef}>
      {/* Legend */}
      <div className="shrink-0 px-4 py-3 border-b border-zinc-800/50">
        <RegionalLegend compact showCount countByRegion={regionCounts()} />
      </div>

      {/* Map */}
      <div className="flex-1 bg-[#0a0a0a] relative overflow-hidden min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Loading map data...</p>
            </div>
          </div>
        )}

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: isMobile ? 280 : (isTablet ? 320 : 380),
            center: isMobile ? [18, 5] : [20, 2],
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup 
            zoom={1} 
            center={isMobile ? [18, 5] : [20, 2]} 
            minZoom={0.8} 
            maxZoom={6}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: GeoFeature[] }) =>
                geographies.map((geo) => {
                  const iso3 = getCountryISO3(geo);
                  if (!iso3 || !isInScope(iso3)) return null;

                  const fill = getFillColor(geo);
                  if (fill === 'transparent') return null;

                  const isSelected = iso3 === selectedIso3;
                  const isDisputed = isDisputedTerritory(iso3);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke={getStroke(geo)}
                      strokeWidth={getStrokeWidth(geo)}
                      style={{
                        default: { 
                          outline: 'none', 
                          transition: 'fill 0.15s ease',
                          filter: isSelected ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : undefined,
                        },
                        hover: { 
                          outline: 'none', 
                          fill: getHoverColor(geo), 
                          cursor: isDisputed ? 'not-allowed' : 'pointer',
                        },
                        pressed: { outline: 'none', fill: getHoverColor(geo) },
                      }}
                      onMouseMove={(evt: React.MouseEvent) => handleMouseMove(geo, evt)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleCountryClick(geo)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Map hint */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[10px] text-zinc-700 font-medium">
          <MapPin className="w-3 h-3" />
          Scroll to zoom · Drag to pan · Click for details
        </div>
      </div>

      {/* Tooltip */}
      <MapTooltip country={tooltip} position={tooltipPosition} />
    </div>
  );
}
