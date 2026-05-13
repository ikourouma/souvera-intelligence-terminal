'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Database, Lock, ChevronDown } from 'lucide-react';
import { DATA_STATUS_LABELS } from '@/lib/map-constants';
import { type RegionFilter, getRegionLabel } from '@/lib/market-coverage';

interface MapWorkspaceTopNavProps {
  workspaceLabel?: string;
  showRequestAccess?: boolean;
  region?: RegionFilter;
  onRegionChange?: (region: RegionFilter) => void;
  showRegionFilter?: boolean;
}

export function MapWorkspaceTopNav({
  workspaceLabel = 'Africa Intelligence Terminal',
  showRequestAccess = true,
  region = 'africa',
  onRegionChange,
  showRegionFilter = false,
}: MapWorkspaceTopNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleRegionSelect = (newRegion: RegionFilter) => {
    if (onRegionChange) {
      onRegionChange(newRegion);
    }
    setIsOpen(false);
  };
  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 py-3 sm:h-14 sm:py-0">
          {/* Left: Breadcrumb and workspace label */}
          <div className="flex items-center gap-3 text-center sm:text-left w-full sm:w-auto max-w-sm sm:max-w-none mx-auto sm:mx-0">
            {/* Souvera brand - hide on mobile */}
            <Link 
              href="/intelligence" 
              className="hidden sm:inline text-sm font-bold text-zinc-400 hover:text-white transition-colors"
            >
              Souvera
            </Link>
            
            <ChevronRight className="hidden sm:inline w-4 h-4 text-zinc-600" />
            
            {/* Workspace label with optional region filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
              {showRegionFilter && onRegionChange ? (
                <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                  <button
                    className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-bold text-white bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/50 hover:border-zinc-600 rounded-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 w-full sm:w-auto"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Select region"
                    aria-expanded={isOpen}
                  >
                    <span className="uppercase tracking-wider text-xs">
                      {getRegionLabel(region)}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown menu */}
                  {isOpen && (
                    <div className="absolute top-full left-0 sm:left-auto mt-2 w-full sm:w-48 bg-zinc-900 border border-zinc-700 rounded-sm shadow-xl z-50 overflow-hidden">
                      <button
                        onClick={() => handleRegionSelect('africa')}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                          region === 'africa' 
                            ? 'bg-blue-600 text-white' 
                            : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <div className="font-bold uppercase tracking-wider text-xs">Africa</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">54 African countries</div>
                      </button>
                      <button
                        onClick={() => handleRegionSelect('caribbean')}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                          region === 'caribbean' 
                            ? 'bg-blue-600 text-white' 
                            : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <div className="font-bold uppercase tracking-wider text-xs">Caribbean</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">20 Caribbean markets</div>
                      </button>
                      <button
                        onClick={() => handleRegionSelect('all')}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                          region === 'all' 
                            ? 'bg-blue-600 text-white' 
                            : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <div className="font-bold uppercase tracking-wider text-xs">All Regions</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Africa + Caribbean</div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-sm font-bold text-white">
                  {workspaceLabel}
                </span>
              )}
            </div>
          </div>

          {/* Right: Status and CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto max-w-sm sm:max-w-none mx-auto sm:mx-0">
            {/* Data status pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/60 border border-zinc-700/50 rounded-full w-full sm:w-auto justify-center">
              <Database className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider whitespace-nowrap">
                {DATA_STATUS_LABELS.previewData}
              </span>
            </div>

            {/* Request Access CTA */}
            {showRequestAccess && (
              <Link
                href="/access/request-access"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
              >
                <Lock className="w-3 h-3" />
                Request Access
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
