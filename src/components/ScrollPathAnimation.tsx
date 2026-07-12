import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function ScrollPathAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  // We track the scroll progress relative to this SVG container.
  // "start center" means the animation starts when the TOP of the container hits the CENTER of the viewport.
  // "end end" means the animation finishes when the BOTTOM of the container hits the BOTTOM of the viewport.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"]
  });

  // Draw from 0 to 1 during the first half (in the 2nd page)
  const pathLength = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  
  // Erase from start to tail during the second half (in the 3rd page)
  const pathOffset = useTransform(scrollYProgress, [0.5, 1], [0, 1]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-30 overflow-visible">
      {/* Desktop SVG */}
      <svg 
        className="w-full h-full opacity-90 hidden md:block" 
        viewBox="0 0 1000 2000" 
        preserveAspectRatio="none" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 8px rgba(204, 255, 0, 0.6))' }}
      >
        <motion.path 
          id="anim-path-desktop" 
          d="M 0 0 C 500 0, 900 200, 900 400 C 900 900, 100 900, 500 1000 C 900 1100, 100 1200, 100 1500 C 100 1800, 800 1800, 1000 2000"
          stroke="#CCFF00" 
          strokeWidth="6" 
          strokeLinecap="round"
          style={{ pathLength, pathOffset }}
        />
      </svg>

      {/* Mobile SVG */}
      <svg 
        className="w-full h-full opacity-60 block md:hidden" 
        viewBox="0 0 1000 2000" 
        preserveAspectRatio="none" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 6px rgba(204, 255, 0, 0.4))' }}
      >
        <motion.path 
          id="anim-path-mobile" 
          d="M -300 0 C 300 50, 1400 50, 1400 300 C 1400 700, 1000 800, 500 1000 C 0 1200, -400 1300, -400 1700 C -400 1950, 300 1950, 1400 2000"
          stroke="#CCFF00" 
          strokeWidth="8" 
          strokeLinecap="round"
          style={{ pathLength, pathOffset }}
        />
      </svg>
    </div>
  );
}
