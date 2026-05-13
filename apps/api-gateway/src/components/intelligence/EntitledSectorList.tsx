'use client';

import { useState } from 'react';
import { 
  Lock, Plus, Minus, 
  Landmark, Zap, Leaf, Gem, Truck, 
  Server, Plane,
  Layers 
} from 'lucide-react';

interface Sector {
  label: string;
  teaser?: string;
  rationale?: string;
  strengthScore?: number;
  growthScore?: number;
}

interface EntitledSectorListProps {
  sectors: Sector[];
  maxVisible?: number;
  showRationale?: boolean;
  totalCount?: number;
}

// Helper to get sector icon and color
function getSectorIcon(sectorLabel: string) {
  const label = sectorLabel.toLowerCase();
  
  // Digital Infrastructure (check first, before general "digital")
  if (label.includes('digital infrastructure')) {
    return { 
      icon: Server, 
      bgColor: 'bg-indigo-500/10', 
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400'
    };
  }
  // Tourism & Hospitality
  if (label.includes('tourism') || label.includes('hospitality')) {
    return { 
      icon: Plane, 
      bgColor: 'bg-teal-500/10', 
      borderColor: 'border-teal-500/30',
      iconColor: 'text-teal-400'
    };
  }
  // Fintech and Digital Finance
  if (label.includes('fintech') || label.includes('finance') || label.includes('digital')) {
    return { 
      icon: Landmark, 
      bgColor: 'bg-blue-500/10', 
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400'
    };
  }
  if (label.includes('energy') || label.includes('renewable') || label.includes('power')) {
    return { 
      icon: Zap, 
      bgColor: 'bg-amber-500/10', 
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400'
    };
  }
  if (label.includes('agricult') || label.includes('agribusiness') || label.includes('food')) {
    return { 
      icon: Leaf, 
      bgColor: 'bg-emerald-500/10', 
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400'
    };
  }
  if (label.includes('mining') || label.includes('mineral') || label.includes('gold')) {
    return { 
      icon: Gem, 
      bgColor: 'bg-purple-500/10', 
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400'
    };
  }
  if (label.includes('logistic') || label.includes('trade') || label.includes('transport')) {
    return { 
      icon: Truck, 
      bgColor: 'bg-cyan-500/10', 
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400'
    };
  }
  
  // Default
  return { 
    icon: Layers, 
    bgColor: 'bg-zinc-500/10', 
    borderColor: 'border-zinc-500/30',
    iconColor: 'text-zinc-400'
  };
}

export function EntitledSectorList({
  sectors,
  maxVisible = 5,
  showRationale = false,
  totalCount,
}: EntitledSectorListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  // Determine how many sectors to show
  const effectiveMaxVisible = showAll ? sectors.length : maxVisible;
  const visibleSectors = sectors.slice(0, effectiveMaxVisible);
  
  // For Professional+ users with 6-7 sectors, show "+N more" card
  const hasMoreSectors = showRationale && sectors.length > maxVisible && !showAll;
  const remainingSectorCount = hasMoreSectors ? sectors.length - maxVisible : 0;
  
  // For Explorer/Public users, calculate hidden count from totalCount
  const hiddenCount = !showRationale && totalCount !== undefined 
    ? Math.max(0, totalCount - visibleSectors.length)
    : 0;

  if (sectors.length === 0) {
    // Professional+ users: show "Sectors data pending"
    if (showRationale) {
      return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-sm text-zinc-500">Sectors data pending</p>
        </div>
      );
    }
    // Public/Explorer: hide sector section
    return null;
  }

  const handleToggle = (index: number) => {
    // Only allow expanding if user has rationale access
    if (!showRationale) return;
    
    // Toggle: if clicking same sector, collapse it; otherwise expand new one
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-2">
      {/* Visible sectors */}
      {visibleSectors.map((sector, index) => {
        const isExpanded = expandedIndex === index;
        const canExpand = showRationale && sector.rationale;
        const { icon: Icon, bgColor, borderColor, iconColor } = getSectorIcon(sector.label);
        
        return (
          <button
            key={`${sector.label}-${index}`}
            onClick={() => handleToggle(index)}
            disabled={!canExpand}
            className={`
              group w-full text-left rounded-xl border transition-all duration-200
              ${isExpanded 
                ? 'bg-zinc-800/80 border-blue-500/50 shadow-lg shadow-blue-950/20' 
                : 'bg-zinc-900/60 border-zinc-700/40 hover:bg-blue-950/20 hover:border-blue-500/30'
              }
              ${canExpand ? 'cursor-pointer' : 'cursor-default'}
              ${!canExpand ? 'hover:bg-zinc-900/60 hover:border-zinc-700/40' : ''}
            `}
            aria-expanded={canExpand ? isExpanded : undefined}
          >
            <div className="flex items-start gap-3 p-3">
              {/* Left icon */}
              <div className={`
                shrink-0 w-10 h-10 rounded-full border flex items-center justify-center
                ${bgColor} ${borderColor}
              `}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              
              {/* Center content */}
              <div className="flex-1 min-w-0">
                {/* Sector name */}
                <h5 className="text-sm font-bold text-white mb-1 truncate">
                  {sector.label}
                </h5>
                
                {/* Teaser (collapsed: 1 line, expanded: full) */}
                {sector.teaser && (
                  <p className={`text-xs text-zinc-400 leading-relaxed ${isExpanded ? '' : 'line-clamp-1'}`}>
                    {sector.teaser}
                  </p>
                )}
                
                {/* Rationale (Professional+ only, when expanded) */}
                {showRationale && sector.rationale && isExpanded && (
                  <div className="mt-3 pt-3 border-t border-zinc-700/50">
                    <div className="mb-2">
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                        Rationale
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {sector.rationale}
                    </p>
                    
                    {/* Score badges */}
                    {(sector.strengthScore !== undefined || sector.growthScore !== undefined) && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-700/30">
                        {sector.strengthScore !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                              Strength
                            </span>
                            <span className="text-xs font-bold text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded">
                              {sector.strengthScore}
                            </span>
                          </div>
                        )}
                        {sector.growthScore !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                              Growth
                            </span>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded">
                              {sector.growthScore}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Right icon (Plus/Minus) - only show for Professional+ */}
              {canExpand && (
                <div className="shrink-0">
                  {isExpanded ? (
                    <Minus className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Plus className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                  )}
                </div>
              )}
            </div>
          </button>
        );
      })}

      {/* Professional+ "View more sectors" card (for 6-7 sector case) */}
      {hasMoreSectors && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full text-left rounded-xl border border-zinc-700/40 bg-zinc-900/60 hover:bg-blue-950/20 hover:border-blue-500/30 transition-all duration-200 p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">
              +{remainingSectorCount} more sector{remainingSectorCount !== 1 ? 's' : ''}
            </span>
            <Plus className="w-4 h-4 text-zinc-500" />
          </div>
        </button>
      )}

      {/* Explorer/Public hidden sectors indicator */}
      {hiddenCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
          <Lock className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-xs text-zinc-500">
            +{hiddenCount} more sector{hiddenCount !== 1 ? 's' : ''} with Professional access
          </span>
        </div>
      )}
    </div>
  );
}
