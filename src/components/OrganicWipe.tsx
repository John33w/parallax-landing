import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface OrganicWipeProps {
  color?: string;
  triggerId?: string;
  shadow?: boolean;
  direction?: "up" | "down";
  restingCurve?: number;
}

export default function OrganicWipe({ color = "#1c1c1c", triggerId = "about-section", shadow = false, direction = "up", restingCurve = 0 }: OrganicWipeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!pathRef.current || !containerRef.current || windowWidth === 0) return;

    const progress = { value: 0 };
    // Start at resting curve
    let currentControlY = direction === "up" ? 300 - restingCurve : restingCurve;
    
    const render = () => {
      // Get velocity from scroll trigger
      const st = ScrollTrigger.getById(triggerId + "-wipeTrigger");
      const velocity = st ? st.getVelocity() : 0;
      
      let finalY = 0;
      
      if (direction === "up") {
        // If restingCurve is 0, use the progress wave (original behavior)
        const wave = restingCurve === 0 ? Math.sin(progress.value * Math.PI) * 150 : 0;
        const targetControlY = (300 - restingCurve) - wave;
        
        // Scrolling down (positive velocity) stretches the curve upwards (negative Y)
        const stretch = Math.max(Math.min(velocity * -0.05, 150), -150);
        finalY = targetControlY + stretch;
      } else {
        const wave = restingCurve === 0 ? Math.sin(progress.value * Math.PI) * 150 : 0;
        const targetControlY = restingCurve + wave;
        
        // Scrolling down (positive velocity) stretches the curve downwards (positive Y)
        const stretch = Math.max(Math.min(velocity * 0.05, 150), -150);
        finalY = targetControlY + stretch;
      }
      
      // Elastic interpolation for smooth organic bounce
      currentControlY += (finalY - currentControlY) * 0.15;
      
      const d = direction === "up" 
        ? `M0 300 Q${windowWidth / 2} ${currentControlY} ${windowWidth} 300 L${windowWidth} 300 L0 300 Z`
        : `M0 -2 Q${windowWidth / 2} ${currentControlY} ${windowWidth} -2 L${windowWidth} -2 L0 -2 Z`;
        
      pathRef.current?.setAttribute("d", d);
    };

    const st = ScrollTrigger.create({
      id: triggerId + "-wipeTrigger",
      trigger: document.getElementById(triggerId) || containerRef.current,
      start: "top bottom",
      end: "top top",
      onUpdate: (self) => {
        progress.value = self.progress;
      }
    });

    gsap.ticker.add(render);

    return () => {
      st.kill();
      gsap.ticker.remove(render);
    };
  }, [windowWidth, direction, triggerId]);

  if (windowWidth === 0) return null;

  const shadowStyle = shadow 
    ? (direction === "up" 
      ? 'drop-shadow(0px -20px 30px rgba(0,0,0,0.7)) drop-shadow(0px -10px 15px rgba(0,0,0,0.5))' 
      : 'drop-shadow(0px 20px 30px rgba(0,0,0,0.7)) drop-shadow(0px 10px 15px rgba(0,0,0,0.5))')
    : 'none';

  return (
    <div 
      ref={containerRef} 
      className={`absolute ${direction === "up" ? "top-[-300px]" : "bottom-[-300px]"} left-0 w-full h-[300px] overflow-visible pointer-events-none z-10`}
    >
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${windowWidth} 300`}>
        <path 
          ref={pathRef}
          fill={color}
          stroke="none"
          d={direction === "up" ? `M0 300 Q${windowWidth / 2} 150 ${windowWidth} 300 L${windowWidth} 300 L0 300 Z` : `M0 -2 Q${windowWidth / 2} 150 ${windowWidth} -2 L${windowWidth} -2 L0 -2 Z`}
          style={{ filter: shadowStyle }}
        />
      </svg>
    </div>
  );
}
