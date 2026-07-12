import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export const getRouteName = (location: any) => {
  if (location?.state?.transitionText) {
    return location.state.transitionText;
  }
  const path = typeof location === 'string' ? location : location?.pathname || '';
  if (path === '/') return 'Home';
  if (path === '/comment' || path === '/comments') return 'Comments';
  if (path.startsWith('/about')) return 'About';
  if (path.startsWith('/blog/')) {
    if (location?.state?.post?.title) {
      return location.state.post.title.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
    const parts = path.split('/');
    if (parts.length > 2) {
      const permalink = parts[2];
      const titleCase = permalink.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      return titleCase.replace(/ S /g, "'s ").replace(/ S$/g, "'s");
    }
    return 'Blog Post';
  }
  if (path.startsWith('/blog')) return 'Blogs';
  if (path.startsWith('/admin') || path.startsWith('/login')) return 'Admin';
  return '';
};

export default function GlobalCurveOverlay() {
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
  
  const initialHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  
  const [dimensions, setDimensions] = useState({ width: initialWidth, height: initialHeight });
  const location = useLocation();
  const [targetRoute, setTargetRoute] = useState(getRouteName(location));
  const [isVisible, setIsVisible] = useState(false);
  const isFirstMount = useRef(true);

  useEffect(() => {
    const resize = () => {
      if (isAndroid) return; // Prevent Android address bar from interrupting transition layout
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [isAndroid]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/login')) {
      return;
    }
    
    // When location changes, we want to animate IN the overlay (exit phase of the page)
    setTargetRoute(getRouteName(location));
    setIsVisible(true);

    // The overlay covers the screen for a bit, then animates OUT (enter phase of the page)
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 1200); // Wait for the 'exit' duration to finish before triggering 'enter'

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  const curveHeight = 300;
  const { width, height } = dimensions;

  // GPU-accelerated variants using y instead of top
  const containerVariants = {
    initial: { y: height + curveHeight }, 
    animate: { 
      y: [height + curveHeight, 0], 
      transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] as const } 
    },
    exit: { 
      y: [0, -height - curveHeight], 
      transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] as const } 
    }
  };

  const topPathInitial = `M0 ${curveHeight} Q${width/2} 0 ${width} ${curveHeight} L${width} ${curveHeight} L0 ${curveHeight} Z`;
  const topPathTarget = `M0 ${curveHeight} Q${width/2} ${curveHeight} ${width} ${curveHeight} L${width} ${curveHeight} L0 ${curveHeight} Z`;

  const topPathVariants = {
    initial: { d: topPathInitial },
    animate: { d: [topPathInitial, topPathTarget], transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] as const } },
    exit: { d: [topPathTarget, topPathTarget], transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] as const } }
  };

  const bottomPathInitial = `M0 0 Q${width/2} 0 ${width} 0 L${width} 0 L0 0 Z`;
  const bottomPathTarget = `M0 0 Q${width/2} ${curveHeight} ${width} 0 L${width} 0 L0 0 Z`;

  const bottomPathVariants = {
    initial: { d: bottomPathTarget },
    animate: { d: [bottomPathTarget, bottomPathTarget], transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] as const } },
    exit: { d: [bottomPathTarget, bottomPathInitial], transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] as const } }
  };

  const textVariants = {
    initial: { opacity: 0, y: 40 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, delay: 0.4, ease: [0.76, 0, 0.24, 1] as const } 
    },
    exit: { 
      opacity: 0, 
      y: -40, 
      transition: { duration: 1.0, delay: 0.2, ease: [0.76, 0, 0.24, 1] as const } 
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Animated Background Overlay */}
          <motion.div 
            className="fixed top-0 left-0 w-full bg-[#0d0709] z-[9998] pointer-events-none will-change-transform"
            style={{ height: height }}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Top Curve */}
            <svg className="absolute w-full" style={{ height: curveHeight, top: -curveHeight, left: 0 }} viewBox={`0 0 ${width} ${curveHeight}`} preserveAspectRatio="none">
              <motion.path fill="#0d0709" variants={topPathVariants} />
            </svg>

            {/* Desktop Text Container */}
            {!isAndroid && (
              <motion.div
                className="absolute top-0 left-0 w-full flex items-center justify-center pointer-events-none px-6"
                style={{ height: height }}
                variants={textVariants}
              >
                <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-inter font-normal text-center m-0 p-0 tracking-wide opacity-90 whitespace-normal break-words w-full">
                  {targetRoute}
                </h2>
              </motion.div>
            )}

            {/* Bottom Curve */}
            <svg className="absolute w-full" style={{ height: curveHeight, bottom: -curveHeight, left: 0 }} viewBox={`0 0 ${width} ${curveHeight}`} preserveAspectRatio="none">
              <motion.path fill="#0d0709" variants={bottomPathVariants} />
            </svg>
          </motion.div>

          {/* Android Text Container (Completely decoupled from the moving background) */}
          {isAndroid && (
            <motion.div
              className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[9999] pointer-events-none px-6"
              variants={{
                initial: { opacity: 0 },
                animate: { 
                  opacity: 1, 
                  transition: { duration: 0.8, delay: 0.4, ease: [0.76, 0, 0.24, 1] as const } 
                },
                exit: { 
                  opacity: 0, 
                  transition: { duration: 0.8, delay: 0.1, ease: [0.76, 0, 0.24, 1] as const } 
                }
              }}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h2 className="w-full text-white text-2xl md:text-3xl font-inter font-normal text-center m-0 p-0 tracking-wide opacity-90 whitespace-normal break-words" style={{ transform: 'translateZ(0)' }}>
                {targetRoute}
              </h2>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
