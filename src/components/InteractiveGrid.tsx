import { useEffect, useRef } from 'react';

export const InteractiveGrid = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPos = useRef({ x: 0, y: 0, time: 0 });
  const stateRef = useRef({ isMoving: false, isFast: false });

  useEffect(() => {
    const updateDOM = () => {
      if (!containerRef.current || !glowRef.current) return;
      const { isMoving, isFast } = stateRef.current;
      
      // Update container opacity and transition duration natively
      if (isMoving && !isFast) {
        containerRef.current.classList.remove('opacity-0', 'duration-300');
        containerRef.current.classList.add('opacity-100', 'duration-500');
      } else {
        containerRef.current.classList.remove('opacity-100', 'duration-500');
        containerRef.current.classList.add('opacity-0', 'duration-300');
      }
      
      // Update glow animation natively
      if (!isFast) {
        glowRef.current.classList.add('animate-grid-flicker');
      } else {
        glowRef.current.classList.remove('animate-grid-flicker');
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      // We read bounding rect, but since we don't trigger React state changes, layout thrashing is avoided.
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      containerRef.current.style.setProperty('--mouse-x', `${x}px`);
      containerRef.current.style.setProperty('--mouse-y', `${y}px`);

      // Track speed
      const now = performance.now();
      if (lastPos.current.time > 0) {
        const dx = x - lastPos.current.x;
        const dy = y - lastPos.current.y;
        const dt = now - lastPos.current.time;
        if (dt > 0) {
          const speed = Math.sqrt(dx * dx + dy * dy) / dt;
          if (speed > 1.2) { // 1.2 px/ms = fairly fast movement
            if (!stateRef.current.isFast) {
              stateRef.current.isFast = true;
              updateDOM();
            }
            
            if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
            speedTimeoutRef.current = setTimeout(() => {
              stateRef.current.isFast = false;
              updateDOM();
            }, 150); // quickly resume animation when slowing down
          }
        }
      }
      lastPos.current = { x, y, time: now };

      if (!stateRef.current.isMoving) {
        stateRef.current.isMoving = true;
        updateDOM();
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        stateRef.current.isMoving = false;
        stateRef.current.isFast = false;
        updateDOM();
      }, 500);
    };

    // Use passive listener to avoid blocking scroll and improve performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes slowGridFlicker {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .animate-grid-flicker {
          animation: slowGridFlicker 4s ease-in-out infinite;
        }
      `}</style>
      <div 
        ref={containerRef}
        className="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-300 opacity-0"
        style={{ zIndex: 5 }}
      >
        {/* Glow effect on mouse move with conditional slow flicker */}
        <div 
          ref={glowRef}
          className="absolute inset-0 animate-grid-flicker"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(212, 245, 52, 0.8) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(212, 245, 52, 0.8) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            maskImage: 'radial-gradient(circle 120px at var(--mouse-x, -120px) var(--mouse-y, -120px), black 0%, rgba(0,0,0,0.5) 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle 120px at var(--mouse-x, -120px) var(--mouse-y, -120px), black 0%, rgba(0,0,0,0.5) 40%, transparent 100%)',
            transition: 'opacity 0.2s ease-out'
          }}
        />
      </div>
    </>
  );
};
