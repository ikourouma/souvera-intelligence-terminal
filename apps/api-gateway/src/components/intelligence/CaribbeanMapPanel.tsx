'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from 'react-simple-maps';
import { Globe, MapPin, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import {
  CARIBBEAN_GEO_URLS,
  CARIBBEAN_MAP_COLORS,
  CARIBBEAN_MAP_VIEW,
  CARIBBEAN_MARKER_ISO3,
  getCaribbeanZoneColors,
  resolveCaribbeanIso3FromGeo,
  isApprovedCaribbeanIso3,
  ISO3_CARIBBEAN_ZONE,
  type CaribbeanZone,
} from '@/lib/map-constants';
import { MapTooltip } from './MapTooltip';
import { CaribbeanMapLegend } from './CaribbeanMapLegend';

interface GeoFeature {
  rsmKey: string;
  properties: {
    name?: string;
    NAME?: string;
    iso_a3?: string;
    ISO_A3?: string;
    ADM0_A3?: string;
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
  lat?: number;
  lng?: number;
}

interface CaribbeanMapPanelProps {
  countries: Country[];
  selectedIso3: string | null;
  onCountrySelect: (iso3: string) => void;
  loading?: boolean;
  onCoverageChange?: (polygonIso3: string[], markerIso3: string[]) => void;
}

interface TooltipData {
  iso3: string;
  name: string;
  flagUrl?: string;
  gdpCurrentUsd?: number;
  gdpGrowthPct?: number;
  populationTotal?: number;
  capital?: string;
  subregion?: string;
}

const INITIAL_CENTER = CARIBBEAN_MAP_VIEW.center;
const INITIAL_ZOOM = CARIBBEAN_MAP_VIEW.zoom.initial;

export function CaribbeanMapPanel({
  countries,
  selectedIso3,
  onCountrySelect,
  loading = false,
  onCoverageChange,
}: CaribbeanMapPanelProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [geoUrl, setGeoUrl] = useState<string>(CARIBBEAN_GEO_URLS.primary);
  const [geoSource, setGeoSource] = useState<'natural-earth' | 'fallback'>('natural-earth');
  const [geoError, setGeoError] = useState(false);
  const [polygonIso3, setPolygonIso3] = useState<Set<string>>(new Set());
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [position, setPosition] = useState({
    coordinates: INITIAL_CENTER,
    zoom: INITIAL_ZOOM,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const countryMap = useMemo(() => {
    const map = new Map<string, Country>();
    countries.forEach((c) => map.set(c.iso3, c));
    return map;
  }, [countries]);

  /** Scan GeoJSON once loaded to know which territories have polygon geometry */
  useEffect(() => {
    const controller = new AbortController();
    fetch(geoUrl, { signal: controller.signal })
      .then((r) => r.json())
      .then((geo) => {
        const found = new Set<string>();
        const features = geo.features ?? geo.objects?.countries?.geometries ?? [];
        for (const feature of features) {
          const props = feature.properties ?? feature;
          const iso3 = resolveCaribbeanIso3FromGeo(props);
          if (iso3) found.add(iso3);
        }
        setPolygonIso3(found);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [geoUrl]);

  const markerCountries = useMemo(() => {
    return countries.filter((c) => {
      if (c.lat == null || c.lng == null) return false;
      const needsMarker =
        CARIBBEAN_MARKER_ISO3.includes(c.iso3 as (typeof CARIBBEAN_MARKER_ISO3)[number]) ||
        !polygonIso3.has(c.iso3);
      return needsMarker && isApprovedCaribbeanIso3(c.iso3);
    });
  }, [countries, polygonIso3]);

  const markerIso3List = useMemo(
    () => markerCountries.map((c) => c.iso3),
    [markerCountries]
  );

  useEffect(() => {
    onCoverageChange?.([...polygonIso3], markerIso3List);
  }, [polygonIso3, markerIso3List, onCoverageChange]);

  const zoneCounts = useMemo(() => {
    const counts: Partial<Record<CaribbeanZone, number>> = {};
    countries.forEach((c) => {
      const zone = ISO3_CARIBBEAN_ZONE[c.iso3];
      if (zone) counts[zone] = (counts[zone] ?? 0) + 1;
    });
    return counts;
  }, [countries]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    fetch(CARIBBEAN_GEO_URLS.primary, { signal: controller.signal, method: 'HEAD' })
      .then((res) => {
        clearTimeout(timeout);
        if (!res.ok) {
          setGeoUrl(CARIBBEAN_GEO_URLS.fallback);
          setGeoSource('fallback');
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        setGeoUrl(CARIBBEAN_GEO_URLS.fallback);
        setGeoSource('fallback');
        fetch(CARIBBEAN_GEO_URLS.fallback, { method: 'HEAD' })
          .then((res) => {
            if (!res.ok) setGeoError(true);
          })
          .catch(() => setGeoError(true));
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const isMobile = windowWidth < 768;
  const mapScale = isMobile
    ? CARIBBEAN_MAP_VIEW.scale.mobile
    : CARIBBEAN_MAP_VIEW.scale.desktop;

  const getCountryISO3 = useCallback((geo: GeoFeature): string | null => {
    return resolveCaribbeanIso3FromGeo(geo.properties);
  }, []);

  const isInScope = useCallback((iso3: string | null): boolean => {
    return isApprovedCaribbeanIso3(iso3);
  }, []);

  const showTooltipForIso3 = useCallback(
    (iso3: string, evt: React.MouseEvent, fallbackName?: string) => {
      const countryData = countryMap.get(iso3);
      const zone = getCaribbeanZoneColors(iso3);
      setTooltip({
        iso3,
        name: countryData?.name ?? fallbackName ?? iso3,
        flagUrl: countryData?.flagUrl,
        gdpCurrentUsd: countryData?.gdpCurrentUsd,
        gdpGrowthPct: countryData?.gdpGrowthPct,
        populationTotal: countryData?.populationTotal,
        capital: countryData?.capital,
        subregion: zone.label,
      });
      setTooltipPosition({ x: evt.clientX, y: evt.clientY });
    },
    [countryMap]
  );

  const getFillColor = useCallback((iso3: string): string => {
    if (iso3 === selectedIso3) return CARIBBEAN_MAP_COLORS.selected;
    return getCaribbeanZoneColors(iso3).fill;
  }, [selectedIso3]);

  const getHoverColor = useCallback((iso3: string): string => {
    return getCaribbeanZoneColors(iso3).hover;
  }, []);

  const handleMouseMoveGeo = useCallback(
    (geo: GeoFeature, evt: React.MouseEvent) => {
      const iso3 = getCountryISO3(geo);
      if (!iso3 || !isInScope(iso3)) {
        setTooltip(null);
        setTooltipPosition(null);
        return;
      }
      const countryName = (geo.properties?.name ?? geo.properties?.NAME ?? iso3) as string;
      showTooltipForIso3(iso3, evt, countryName);
    },
    [getCountryISO3, isInScope, showTooltipForIso3]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    setTooltipPosition(null);
  }, []);

  const handleCountryClick = useCallback(
    (iso3: string) => {
      if (!isInScope(iso3)) return;
      onCountrySelect(iso3);
      setTooltip(null);
      setTooltipPosition(null);
    },
    [isInScope, onCountrySelect]
  );

  const zoomIn = () =>
    setPosition((p) => ({
      ...p,
      zoom: Math.min(p.zoom * 1.4, CARIBBEAN_MAP_VIEW.zoom.max),
    }));

  const zoomOut = () =>
    setPosition((p) => ({
      ...p,
      zoom: Math.max(p.zoom / 1.4, CARIBBEAN_MAP_VIEW.zoom.min),
    }));

  const resetView = () =>
    setPosition({ coordinates: INITIAL_CENTER, zoom: INITIAL_ZOOM });

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
            onClick={() => {
              setGeoError(false);
              setGeoUrl(CARIBBEAN_GEO_URLS.primary);
              setGeoSource('natural-earth');
            }}
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
      <div className="shrink-0 px-4 py-3 border-b border-zinc-800/50 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Caribbean markets
            <span className="text-zinc-700 font-mono font-normal ml-2 hidden sm:inline">
              · {geoSource === 'natural-earth' ? 'Natural Earth 50m' : 'fallback'}
            </span>
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-600 font-mono mr-2 hidden sm:inline">
              {countries.length} territories
            </span>
            <button
              type="button"
              onClick={zoomOut}
              aria-label="Zoom out"
              className="p-1.5 rounded-sm border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={zoomIn}
              aria-label="Zoom in"
              className="p-1.5 rounded-sm border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={resetView}
              aria-label="Reset view"
              className="p-1.5 rounded-sm border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <CaribbeanMapLegend compact countByZone={zoneCounts} />
      </div>

      <div className="flex-1 bg-[#0a0a0a] relative overflow-hidden min-h-[480px]">
        {loading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Loading map data...</p>
            </div>
          </div>
        )}

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: mapScale, center: INITIAL_CENTER }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={({ coordinates, zoom }) =>
              setPosition({
                coordinates: coordinates as [number, number],
                zoom,
              })
            }
            minZoom={CARIBBEAN_MAP_VIEW.zoom.min}
            maxZoom={CARIBBEAN_MAP_VIEW.zoom.max}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: GeoFeature[] }) =>
                geographies.map((geo) => {
                  const iso3 = getCountryISO3(geo);
                  if (!iso3 || !isInScope(iso3)) return null;

                  const isSelected = iso3 === selectedIso3;
                  const fill = getFillColor(iso3);
                  const zoneColors = getCaribbeanZoneColors(iso3);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke={isSelected ? CARIBBEAN_MAP_COLORS.selectedStroke : '#09090b'}
                      strokeWidth={isSelected ? 1.5 : 0.5}
                      style={{
                        default: {
                          outline: 'none',
                          transition: 'fill 0.15s ease',
                          filter: isSelected
                            ? `drop-shadow(0 0 8px ${zoneColors.hover}88)`
                            : undefined,
                        },
                        hover: {
                          outline: 'none',
                          fill: getHoverColor(iso3),
                          cursor: 'pointer',
                        },
                        pressed: { outline: 'none', fill: getHoverColor(iso3) },
                      }}
                      onMouseMove={(evt: React.MouseEvent) => handleMouseMoveGeo(geo, evt)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleCountryClick(iso3)}
                    />
                  );
                })
              }
            </Geographies>

            {markerCountries.map((c) => {
              const isSelected = c.iso3 === selectedIso3;
              const zoneColors = getCaribbeanZoneColors(c.iso3);
              const r = isSelected ? 6 : 4;
              return (
                <Marker key={`marker-${c.iso3}`} coordinates={[c.lng!, c.lat!]}>
                  <circle
                    r={r}
                    fill={isSelected ? CARIBBEAN_MAP_COLORS.selected : zoneColors.fill}
                    stroke={isSelected ? CARIBBEAN_MAP_COLORS.selectedStroke : '#042f2e'}
                    strokeWidth={1.5}
                    style={{ cursor: 'pointer' }}
                    onMouseMove={(evt: React.MouseEvent) => showTooltipForIso3(c.iso3, evt)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleCountryClick(c.iso3)}
                  />
                  {isSelected && (
                    <circle
                      r={10}
                      fill="none"
                      stroke={zoneColors.hover}
                      strokeWidth={1}
                      opacity={0.6}
                    />
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[10px] text-zinc-700 font-medium">
          <MapPin className="w-3 h-3" />
          Scroll · drag · +/- · click territory
        </div>
      </div>

      <MapTooltip country={tooltip} position={tooltipPosition} />
    </div>
  );
}
