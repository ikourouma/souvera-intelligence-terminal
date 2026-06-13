'use client';

import { X } from 'lucide-react';
import { buildReportSections } from '@/lib/reports/templates';

interface ReportPreviewModalProps {
  reportType: string;
  countryName: string;
  iso3: string;
  summary?: string;
  opportunityThesis?: string;
  riskNarrative?: string;
  query?: string;
  onClose: () => void;
}

export function ReportPreviewModal({
  reportType,
  countryName,
  iso3,
  summary,
  opportunityThesis,
  riskNarrative,
  query,
  onClose,
}: ReportPreviewModalProps) {
  const sections = buildReportSections({
    countryName,
    iso3,
    reportType,
    generatedAt: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    summary,
    opportunityThesis,
    riskNarrative,
    query,
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-preview-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-zinc-800 shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">
              Report preview
            </p>
            <h3 id="report-preview-title" className="text-lg font-bold text-white">
              {reportType}
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              {countryName} ({iso3}) · outline only — generate PDF for full document
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                {section.title}
              </h4>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {section.body.length > 600 ? `${section.body.slice(0, 600)}…` : section.body}
              </p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-800 shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
