'use client';

import { Download, Lock } from 'lucide-react';
import { useEntitlements } from '@/hooks/useEntitlements';
import { useState } from 'react';
import { UpgradePrompt } from '@/components/access';

export function PolicyExportButton({
  onClick,
  label = 'PNG',
  className = '',
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  const { hasMinimumTier, loading } = useEntitlements();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const hasAccess = hasMinimumTier('institutional');

  const handleClick = () => {
    if (!hasAccess) {
      setShowUpgrade(true);
      return;
    }
    onClick();
  };

  if (loading) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        data-export-exclude
        title={hasAccess ? 'Download presentation-ready PNG' : 'Institutional tier required for exports'}
        className={`inline-flex items-center gap-1 text-xs ${
          hasAccess 
            ? 'text-blue-400 hover:text-blue-300' 
            : 'text-zinc-500 hover:text-zinc-400 cursor-not-allowed'
        } transition-colors shrink-0 ${className}`}
      >
        {hasAccess ? (
          <Download className="w-3.5 h-3.5" />
        ) : (
          <Lock className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">{label}</span>
      </button>

      {showUpgrade && (
        <UpgradePrompt
          feature="Export & Download"
          requiredTier="institutional"
          featureDescription="Export trade intelligence data, policy cards, and analytics to PNG, CSV, and PDF formats for presentations and reports."
          mode="modal"
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </>
  );
}
