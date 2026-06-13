'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import type { KnowledgeBaseContent } from '@/types/knowledge-base';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: KnowledgeBaseContent | null;
}

/**
 * HelpModal - Detailed explanation modal for contextual help
 * 
 * Features:
 * - Structured content with sections and subsections
 * - Signal level color indicators
 * - Data sources footer
 * - "Learn More" CTA
 * - Keyboard navigation (ESC to close)
 * - Mobile-friendly (full-screen on small devices)
 */
export function HelpModal({ isOpen, onClose, content }: HelpModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !content) return null;

  const levelColors = {
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    red: 'text-red-400 bg-red-500/10 border-red-500/30',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="relative w-full max-w-2xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
            <h2 className="text-xl font-bold text-white">
              {content.modal.title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-sm transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-140px)] px-6 py-6 space-y-6">
            {/* Summary */}
            <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <span className="text-2xl">ℹ️</span>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {content.modal.summary}
              </p>
            </div>
            
            {/* Sections */}
            {content.modal.sections.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-base font-bold text-white mb-3 pb-2 border-b border-zinc-800">
                  {section.heading}
                </h3>
                
                {section.content && (
                  <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                    {section.content}
                  </p>
                )}
                
                {/* Subsections */}
                {section.subsections && (
                  <div className="space-y-3 mb-4">
                    {section.subsections.map((subsection, subIdx) => (
                      <div key={subIdx}>
                        <h4 className="text-sm font-semibold text-zinc-400 mb-2">
                          {subsection.title}
                        </h4>
                        <ul className="space-y-1 ml-4">
                          {subsection.points.map((point, pointIdx) => (
                            <li key={pointIdx} className="text-sm text-zinc-400 flex items-start gap-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* List */}
                {section.list && (
                  <ul className="space-y-2 ml-4 mb-4">
                    {section.list.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-sm text-zinc-300 flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                {/* Signal Levels */}
                {section.levels && (
                  <div className="space-y-3">
                    {section.levels.map((level, levelIdx) => (
                      <div 
                        key={levelIdx}
                        className={`p-3 border rounded-lg ${levelColors[level.color]}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm">{level.label}</span>
                          <span className="text-xs font-mono">{level.range}</span>
                        </div>
                        <p className="text-xs opacity-90">
                          {level.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Data Sources */}
              {content.modal.dataSources && content.modal.dataSources.length > 0 && (
                <div className="text-xs text-zinc-500">
                  <span className="font-semibold">Sources:</span>{' '}
                  {content.modal.dataSources.join(', ')}
                </div>
              )}
              
              {/* Learn More CTA */}
              {content.modal.learnMoreUrl && (
                <a
                  href={content.modal.learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Learn More About Our Methodology →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
