'use client';

import { useState, useEffect } from 'react';

export type ScrollDirection = 'up' | 'down';

export interface ScrollState {
  scrollY: number;
  scrollDirection: ScrollDirection;
  isAtTop: boolean;
}

/**
 * useScrollDirection - Track scroll position and direction
 * 
 * Used for smart sticky header behavior:
 * - Show/hide header based on scroll direction
 * - Compact header when scrolling down
 * - Expand header when scrolling up
 * 
 * Performance optimized with requestAnimationFrame
 */
export function useScrollDirection(): ScrollState {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('up');
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollState = () => {
      const currentScrollY = window.scrollY;

      // Update scroll direction (with threshold to avoid jitter)
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }

      // Update scroll position
      setScrollY(currentScrollY);
      
      // Update isAtTop flag
      setIsAtTop(currentScrollY < 10);

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    // Initialize state
    setScrollY(window.scrollY);
    setIsAtTop(window.scrollY < 10);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { scrollY, scrollDirection, isAtTop };
}
