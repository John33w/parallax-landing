import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export default function SmoothScroller() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
    if (isAndroid) return; // Disable JS smooth scrolling on Android to prevent lag and use native scroll

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.5,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Scroll restoration is now handled by a dedicated component to avoid race conditions with framer-motion AnimatePresence

  return null;
}
