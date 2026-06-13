'use client';

import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import { HelpModal } from './HelpModal';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';

interface HelpTooltipProps {
  term: string;                       // "signal_strength", "agoa", etc.
  position?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * HelpTooltip - Contextual help with hybrid UX
 * 
 * Desktop:
 * - Hover: Show quick tooltip (Tier 1)
 * - Click: Open detailed modal (Tier 2)
 * 
 * Mobile:
 * - Tap: Open detailed modal directly
 * 
 * Features:
 * - Automatic positioning (top, right, bottom, left)
 * - Responsive sizing (sm, md, lg)
 * - Keyboard accessible (Tab, Enter/Space)
 * - Analytics tracking (which terms users click)
 */
export function HelpTooltip({ 
  term, 
  position = 'top', 
  size = 'sm',
  className = '' 
}: HelpTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  // Fetch content from knowledge base
  const { getContent } = useKnowledgeBase();
  const content = getContent(term);
  
  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        triggerRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setShowTooltip(false);
      }
    };
    
    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip]);

  const handleClick = () => {
    setShowModal(true);
    setShowTooltip(false);
    
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('help_tooltip_clicked', {
        term,
        location: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  if (!content) {
    // Term not found in knowledge base
    return null;
  }

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const iconSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-950 border-x-transparent border-b-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-zinc-950 border-y-transparent border-l-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-950 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-950 border-y-transparent border-r-transparent',
  };

  return (
    <span className="relative inline-flex items-center">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onKeyDown={handleKeyDown}
        className={`
          inline-flex items-center justify-center rounded-full
          bg-blue-500/10 hover:bg-blue-500/20 
          text-blue-400 hover:text-blue-300
          transition-all duration-200 hover:scale-110
          cursor-help focus:outline-none focus:ring-2 focus:ring-blue-500/50
          ${sizeClasses[size]}
          ${className}
        `}
        aria-label={`Learn more about ${content.termLabel}`}
        title={`Learn more about ${content.termLabel}`}
      >
        <Info className={iconSizeClasses[size]} />
      </button>

      {/* Hover Tooltip (Desktop Only) */}
      {showTooltip && (
        <div
          ref={tooltipRef}
          className={`
            hidden md:block absolute z-[9000] w-72
            px-3 py-2 
            bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl
            text-xs text-zinc-300 leading-relaxed
            pointer-events-none
            animate-in fade-in zoom-in-95 duration-200
            ${positionClasses[position]}
          `}
        >
          <div className="font-semibold text-white mb-1">
            {content.termLabel}
          </div>
          <div>
            {content.tooltipShort}
          </div>
          <div className="mt-2 text-[10px] text-blue-400">
            Click for detailed explanation →
          </div>
          
          {/* Arrow */}
          <div 
            className={`
              absolute w-0 h-0 border-4
              ${arrowClasses[position]}
            `}
          />
        </div>
      )}

      {/* Detailed Modal */}
      <HelpModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        content={content}
      />
    </span>
  );
}
