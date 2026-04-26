'use client';

import React, { useEffect, useRef } from 'react';

const TICKER_ITEMS = [
  { label: 'ZAF', value: '▲ 1.2%', positive: true },
  { label: 'EGY', value: '▲ 4.1%', positive: true },
  { label: 'NGA', value: '▲ 3.4%', positive: true },
  { label: 'DZA', value: '▲ 3.2%', positive: true },
  { label: 'MAR', value: '▲ 3.0%', positive: true },
  { label: 'KEN', value: '▲ 5.0%', positive: true },
  { label: 'ETH', value: '▲ 7.1%', positive: true },
  { label: 'GHA', value: '▲ 3.8%', positive: true },
  { label: 'RWA', value: '▲ 7.2%', positive: true },
  { label: 'SDN', value: '▼ 4.0%', positive: false },
  { label: 'MOZ', value: 'LNG+', positive: true },
  { label: 'DOM', value: '▲ 5.1%', positive: true },
  { label: 'JAM', value: '▲ 4.2%', positive: true },
  { label: 'GUY', value: '▲ 6.2%', positive: true },
  { label: 'TTO', value: 'LNG+', positive: true },
  { label: 'BHS', value: '▲ 3.5%', positive: true },
  { label: 'BRB', value: '▲ 3.1%', positive: true },
];

// Duplicate for seamless loop
const ITEMS = [...TICKER_ITEMS, ...TICKER_ITEMS];

export function SystemTickerStrip() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let x = 0;
    let raf: number;
    const speed = 0.5;
    const totalWidth = track.scrollWidth / 2;

    const animate = () => {
      x -= speed;
      if (Math.abs(x) >= totalWidth) x = 0;
      track.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="w-full overflow-hidden py-3" style={{ background: '#070B0F', borderTop: '1px solid #1F2A37', borderBottom: '1px solid #1F2A37' }}>
      <div ref={trackRef} className="flex items-center gap-0 whitespace-nowrap will-change-transform">
        {ITEMS.map((item, i) => (
          <div key={i} className="flex items-center gap-6 px-6">
            <div className="flex items-center gap-2">
              <span className="section-label">{item.label}</span>
              <span className="text-[11px] font-bold font-mono" style={{ color: item.positive ? '#22C55E' : '#EF4444' }}>
                {item.value}
              </span>
            </div>
            <div className="w-px h-3" style={{ background: '#1F2A37' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
