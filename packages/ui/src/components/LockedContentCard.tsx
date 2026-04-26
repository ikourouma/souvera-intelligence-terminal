import React from 'react';

export interface LockedContentCardProps {
  title: string;
  type?: 'chart' | 'table' | 'text';
  cta?: string;
  onUpgrade?: () => void;
}

export const LockedContentCard: React.FC<LockedContentCardProps> = ({
  title,
  type = 'text',
  cta = 'Unlock full intelligence in Souvera Terminal',
  onUpgrade
}) => {
  return (
    <div className="terminal-card relative overflow-hidden border-dashed border-border min-h-[200px] flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
        <h4 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">{title}</h4>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-border" />
          <div className="w-2 h-2 rounded-full bg-border" />
          <div className="w-2 h-2 rounded-full bg-border" />
        </div>
      </div>

      <div className="flex-1 relative">
        {/* Blurred Content Placeholder */}
        <div className="space-y-4 opacity-10 blur-sm select-none grayscale" aria-hidden="true">
          {type === 'text' && (
            <>
              <div className="h-4 w-full bg-text-muted rounded" />
              <div className="h-4 w-[90%] bg-text-muted rounded" />
              <div className="h-4 w-[95%] bg-text-muted rounded" />
              <div className="h-4 w-[60%] bg-text-muted rounded" />
            </>
          )}
          {type === 'chart' && (
            <div className="aspect-[2/1] w-full border border-border rounded flex items-end justify-between p-4 gap-2">
              <div className="w-4 h-[40%] bg-border rounded-t" />
              <div className="w-4 h-[60%] bg-border rounded-t" />
              <div className="w-4 h-[50%] bg-border rounded-t" />
              <div className="w-4 h-[80%] bg-border rounded-t" />
              <div className="w-4 h-[45%] bg-border rounded-t" />
              <div className="w-4 h-[70%] bg-border rounded-t" />
            </div>
          )}
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 glass border-glow">
          <div className="w-12 h-12 bg-accent-primary/10 rounded-full flex items-center justify-center mb-6 text-accent-primary border border-accent-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h5 className="text-white font-semibold mb-3">Enterprise Access Required</h5>
          <p className="text-sm text-text-secondary max-w-[280px] mb-8 leading-relaxed">
            {cta}
          </p>
          <button 
            onClick={onUpgrade}
            className="btn-primary py-2.5 px-6 text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
          >
            Request Access
          </button>
        </div>
      </div>
    </div>
  );
};
