'use client';

/**
 * CollapsibleAnalysis — Progressive disclosure for Souvera Analysis sections.
 * 
 * Shows first paragraph initially with "Expand" button to reveal full analysis.
 * Uses HighlightedText for automatic number highlighting.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { HighlightedText } from './HighlightedText';

interface CollapsibleAnalysisProps {
  /** Full analysis text with \n\n separators between paragraphs */
  text: string;
  /** Header title (default: "Souvera Analysis") */
  title?: string;
  /** Custom class for the title */
  titleClass?: string;
  /** Text for expand button (default: "Expand") */
  expandText?: string;
  /** Text for collapse button (default: "Collapse") */
  collapseText?: string;
  /** Start expanded (default: false) */
  defaultExpanded?: boolean;
  /** Additional class for the container */
  className?: string;
}

export function CollapsibleAnalysis({
  text,
  title = 'Souvera Analysis',
  titleClass = 'text-xs font-bold text-blue-400 uppercase tracking-wider',
  expandText = 'Expand',
  collapseText = 'Collapse',
  defaultExpanded = false,
  className = '',
}: CollapsibleAnalysisProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  const firstParagraph = paragraphs[0] || '';
  const hasMoreContent = paragraphs.length > 1;
  
  return (
    <div className={className}>
      <p className={`${titleClass} mb-3`}>{title}</p>
      
      <div className="space-y-3">
        {/* First paragraph always visible */}
        <p className="text-sm text-zinc-300 leading-relaxed">
          <HighlightedText text={firstParagraph} />
        </p>
        
        {/* Remaining paragraphs (collapsible) - data-export-expand ensures visibility in PNG exports */}
        {hasMoreContent && (
          <div
            data-export-expand
            className={`space-y-3 overflow-hidden transition-all duration-300 ease-in-out ${
              expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {paragraphs.slice(1).map((para, idx) => (
              <p key={idx} className="text-sm text-zinc-300 leading-relaxed">
                <HighlightedText text={para} />
              </p>
            ))}
          </div>
        )}
      </div>
      
      {/* Expand/Collapse button - hidden in exports */}
      {hasMoreContent && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          data-export-exclude
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          {expanded ? (
            <>
              {collapseText}
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              {expandText}
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
