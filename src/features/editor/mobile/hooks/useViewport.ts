/**
 * Viewport hook — the mobile shell reads breakpoint + orientation + safe-area
 * from here so every layout branch consults the same truth. `useViewport()`
 * is safe on the server (returns a landscape-desktop default) but re-renders
 * with real values after mount.
 */
import { useEffect, useState } from 'react';

export type Breakpoint = 'phone' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface Viewport {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  orientation: Orientation;
  isTouch: boolean;
  isMobile: boolean;                // phone or tablet
  isCompact: boolean;               // very small landscape or portrait phone
  safeArea: { top: number; right: number; bottom: number; left: number };
}

const defaultViewport: Viewport = {
  width: 1280,
  height: 800,
  breakpoint: 'desktop',
  orientation: 'landscape',
  isTouch: false,
  isMobile: false,
  isCompact: false,
  safeArea: { top: 0, right: 0, bottom: 0, left: 0 },
};

function classify(width: number, height: number): { breakpoint: Breakpoint; orientation: Orientation; isCompact: boolean } {
  const orientation: Orientation = width < height ? 'portrait' : 'landscape';
  let breakpoint: Breakpoint;
  if (width < 640) breakpoint = 'phone';
  else if (width < 1024) breakpoint = 'tablet';
  else breakpoint = 'desktop';
  const isCompact = breakpoint === 'phone' || (orientation === 'landscape' && height < 500);
  return { breakpoint, orientation, isCompact };
}

function readSafeArea(): Viewport['safeArea'] {
  if (typeof getComputedStyle === 'undefined' || typeof document === 'undefined') {
    return defaultViewport.safeArea;
  }
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const read = (name: string) => {
    const v = style.getPropertyValue(name).trim();
    if (!v) return 0;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };
  return {
    top: read('--sat') || read('env(safe-area-inset-top)'),
    right: read('--sar') || read('env(safe-area-inset-right)'),
    bottom: read('--sab') || read('env(safe-area-inset-bottom)'),
    left: read('--sal') || read('env(safe-area-inset-left)'),
  };
}

export function useViewport(): Viewport {
  const [vp, setVp] = useState<Viewport>(() => {
    if (typeof window === 'undefined') return defaultViewport;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const { breakpoint, orientation, isCompact } = classify(width, height);
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    return {
      width,
      height,
      breakpoint,
      orientation,
      isTouch,
      isMobile: breakpoint !== 'desktop',
      isCompact,
      safeArea: readSafeArea(),
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const compute = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const { breakpoint, orientation, isCompact } = classify(width, height);
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      setVp({
        width,
        height,
        breakpoint,
        orientation,
        isTouch,
        isMobile: breakpoint !== 'desktop',
        isCompact,
        safeArea: readSafeArea(),
      });
    };
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('orientationchange', compute);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('orientationchange', compute);
    };
  }, []);

  return vp;
}
