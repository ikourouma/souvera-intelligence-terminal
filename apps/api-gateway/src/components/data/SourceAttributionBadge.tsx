'use client';

// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Source Attribution Badge Component
// Owner: Afronovation, Inc.
// ===========================================

import { Database, Globe, FileText, Edit2, Info } from 'lucide-react';
import type { SourceType, ConfidenceLevel } from '@/lib/data/types';
import { 
  getSourceTypeLabel, 
  getSourceTypeBadgeColor,
  getConfidenceBadgeColor,
  getConfidenceLabel
} from '@/lib/data/utils';

interface SourceAttributionBadgeProps {
  sourceName: string;
  sourceType: SourceType;
  confidenceLevel?: ConfidenceLevel;
  attributionText?: string;
  showConfidence?: boolean;
  compact?: boolean;
}

function getSourceIcon(type: SourceType) {
  switch (type) {
    case 'api': return Globe;
    case 'file': return FileText;
    case 'manual': return Edit2;
    default: return Database;
  }
}

export function SourceAttributionBadge({
  sourceName,
  sourceType,
  confidenceLevel,
  attributionText,
  showConfidence = false,
  compact = false,
}: SourceAttributionBadgeProps) {
  const Icon = getSourceIcon(sourceType);
  const typeLabel = getSourceTypeLabel(sourceType);
  const typeColor = getSourceTypeBadgeColor(sourceType);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${typeColor}`}>
          <Icon className="w-3 h-3" />
          {typeLabel}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Source Type Badge */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${typeColor}`}>
          <Icon className="w-3.5 h-3.5" />
          {typeLabel}
        </span>
        {showConfidence && confidenceLevel && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getConfidenceBadgeColor(confidenceLevel)}`}>
            {getConfidenceLabel(confidenceLevel)}
          </span>
        )}
      </div>

      {/* Attribution Text */}
      {attributionText && (
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Info className="w-3 h-3" />
          <span>{attributionText}</span>
        </div>
      )}

      {/* Source Name */}
      <p className="text-xs text-zinc-500">
        Source: {sourceName}
      </p>
    </div>
  );
}

// Inline version for use in tables or cards
export function SourceAttributionInline({
  sourceName,
  sourceType,
}: {
  sourceName: string;
  sourceType: SourceType;
}) {
  const Icon = getSourceIcon(sourceType);
  const typeLabel = getSourceTypeLabel(sourceType);

  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500">
      <Icon className="w-3 h-3" />
      <span>{typeLabel}</span>
      <span className="text-zinc-600">•</span>
      <span>{sourceName}</span>
    </div>
  );
}
