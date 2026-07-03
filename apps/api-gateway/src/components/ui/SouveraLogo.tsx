'use client';

interface SouveraLogoProps {
  variant?: 'full' | 'icon' | 'animated';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: {
    dot: 'w-2 h-2',
    text: 'text-sm',
    icon: 'w-6 h-6',
    iconText: 'text-xs',
    gap: 'gap-1.5',
  },
  md: {
    dot: 'w-3 h-3',
    text: 'text-base',
    icon: 'w-8 h-8',
    iconText: 'text-sm',
    gap: 'gap-2',
  },
  lg: {
    dot: 'w-4 h-4',
    text: 'text-xl',
    icon: 'w-10 h-10',
    iconText: 'text-base',
    gap: 'gap-2.5',
  },
};

export function SouveraLogo({ variant = 'full', size = 'md', className = '' }: SouveraLogoProps) {
  const config = sizeConfig[size];

  if (variant === 'icon') {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 ${config.icon} ${className}`}
        aria-label="Souvera"
      >
        <div className="flex items-center gap-0.5">
          <span className={`rounded-full bg-emerald-500 ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
          <span
            className={`font-bold text-white ${config.iconText}`}
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            S
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'animated') {
    return (
      <div className={`flex items-center ${config.gap} ${className}`} aria-label="Souvera Loading">
        <div className="relative flex items-center justify-center">
          <span className={`rounded-full bg-emerald-500 z-10 ${config.dot}`} />
          <span className={`absolute rounded-full bg-emerald-500 animate-souvera-wave-1 ${config.dot}`} />
          <span className={`absolute rounded-full bg-emerald-500 animate-souvera-wave-2 ${config.dot}`} />
          <span className={`absolute rounded-full bg-emerald-500 animate-souvera-wave-3 ${config.dot}`} />
        </div>
        <span
          className={`font-semibold tracking-tight text-white ${config.text}`}
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          SOUVERA
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${config.gap} ${className}`} aria-label="Souvera">
      <span className={`rounded-full bg-emerald-500 ${config.dot}`} />
      <span
        className={`font-semibold tracking-tight text-white ${config.text}`}
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        SOUVERA
      </span>
    </div>
  );
}

export function SouveraLoadingDot({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dotSize = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <span className={`rounded-full bg-emerald-500 z-10 ${dotSize[size]}`} />
      <span className={`absolute rounded-full bg-emerald-500 animate-souvera-wave-1 ${dotSize[size]}`} />
      <span className={`absolute rounded-full bg-emerald-500 animate-souvera-wave-2 ${dotSize[size]}`} />
      <span className={`absolute rounded-full bg-emerald-500 animate-souvera-wave-3 ${dotSize[size]}`} />
    </div>
  );
}
