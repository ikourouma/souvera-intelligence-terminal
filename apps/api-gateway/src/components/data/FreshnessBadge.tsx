'use client';

// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Freshness Badge Component
// Owner: Afronovation, Inc.
// ===========================================

import { Clock, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import type { FreshnessStatus } from '@/lib/data/types';
import { 
  getFreshnessBadgeColor, 
  getFreshnessLabel,
  formatDisplayDate,
  formatRelativeTime,
  calculateFreshnessStatus
} from '@/lib/data/utils';

interface FreshnessBadgeProps {
  status?: FreshnessStatus;
  lastReviewedAt?: string | Date | null;
  asOfDate?: string | Date | null;
  thresholdDays?: number;
  showDate?: boolean;
  compact?: boolean;
}

function getFreshnessIcon(status: FreshnessStatus) {
  switch (status) {
    case 'fresh': return CheckCircle;
    case 'recent': return Clock;
    case 'stale': return AlertTriangle;
    case 'expired': return AlertCircle;
    default: return Clock;
  }
}

export function FreshnessBadge({
  status: providedStatus,
  lastReviewedAt,
  asOfDate,
  thresholdDays = 30,
  showDate = false,
  compact = false,
}: FreshnessBadgeProps) {
  // Calculate status if not provided
  const status = providedStatus || calculateFreshnessStatus(lastReviewedAt, thresholdDays);
  const Icon = getFreshnessIcon(status);
  const color = getFreshnessBadgeColor(status);
  const label = getFreshnessLabel(status);

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      
      {showDate && (lastReviewedAt || asOfDate) && (
        <div className="text-xs text-zinc-500">
          {lastReviewedAt && (
            <p>Last reviewed: {formatRelativeTime(lastReviewedAt)}</p>
          )}
          {asOfDate && (
            <p>As of: {formatDisplayDate(asOfDate)}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Dot indicator for minimal display
export function FreshnessDot({ 
  status,
  lastReviewedAt,
  thresholdDays = 30,
}: { 
  status?: FreshnessStatus;
  lastReviewedAt?: string | Date | null;
  thresholdDays?: number;
}) {
  const computedStatus = status || calculateFreshnessStatus(lastReviewedAt, thresholdDays);
  
  const dotColor = {
    fresh: 'bg-emerald-400',
    recent: 'bg-yellow-400',
    stale: 'bg-orange-400',
    expired: 'bg-red-400',
  }[computedStatus] || 'bg-zinc-400';

  return (
    <span 
      className={`inline-block w-2 h-2 rounded-full ${dotColor}`}
      title={getFreshnessLabel(computedStatus)}
    />
  );
}
