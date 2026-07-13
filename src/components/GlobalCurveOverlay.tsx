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
    const currentText = getRouteName(location);
    setTargetRoute(currentText);
    setIsVisible(true);

    // Calculate how long to wait before animating OUT (make it responsive to text length on Android)
    let timeoutDuration = 1200; // Fixed default time
    if (isAndroid) {
      const charCount = currentText.replace(/\s+/g, '').length;
      // The last character's animation starts at maxDelay
      const maxDelay = (charCount > 0 ? charCount - 1 : 0) * 0.03 + 0.3;
      // The last character takes 0.8s to finish popping up.
      // We use 0.6s here to start the exit transition just before the text fully settles, 
      // which eliminates the "static" feeling and makes it extremely snappy.
      const totalAnimationTime = (maxDelay + 0.6) * 1000;
      timeoutDuration = totalAnimationTime; 
    }

    // The overlay covers the screen for a bit, then animates OUT (enter phase of the page)
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, timeoutDuration); // Wait for the 'exit' duration to finish before triggering 'enter'

    return () => clearTimeout(timeout);
  }, [location.pathname, isAndroid]);

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
        <motion.div 
          className="fixed top-0 left-0 w-[100vw] bg-[#0d0709] z-[9998] pointer-events-none will-change-transform"
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
              <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-inter font-normal text-center m-0 p-0 tracking-wide opacity-90 whitespace-normal break-words max-w-full">
                {targetRoute}
              </h2>
            </motion.div>
          )}

          {/* Android Text Container (Pop-up character effect, integrated inside the moving background) */}
          {isAndroid && (
            <div className="absolute top-0 left-0 w-full flex items-center justify-center pointer-events-none px-6" style={{ height: height }}>
              <div className="flex flex-wrap justify-center items-center text-white text-2xl md:text-3xl lg:text-5xl font-plusJakartaSans tracking-tight w-full" style={{ fontWeight: 300 }}>
                {targetRoute.split(' ').map((word: string, wordIndex: number, wordsArray: string[]) => (
                  <span key={wordIndex} className="overflow-hidden relative flex items-center" style={{ paddingBottom: '0.1em', paddingTop: '0.1em' }}>
                    {word.split('').map((char: string, charIndex: number) => {
                      const absoluteIndex = wordsArray.slice(0, wordIndex).join('').length + charIndex;
                      return (
                        <motion.span
                          key={charIndex}
                          initial={{ y: "100%" }}
                          animate={{ y: "0%" }}
                          transition={{ 
                            duration: 0.8, 
                            ease: [0.76, 0, 0.24, 1] as any, 
                            delay: absoluteIndex * 0.03 + 0.3 // Delay to start popping after overlay mostly covers screen
                          }}
                          className="flex items-center whitespace-pre"
                        >
                          {char}
                        </motion.span>
                      );
                    })}
                    {wordIndex !== wordsArray.length - 1 && <span className="flex items-center whitespace-pre">&nbsp;</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Curve */}
          <svg className="absolute w-full" style={{ height: curveHeight, bottom: -curveHeight, left: 0 }} viewBox={`0 0 ${width} ${curveHeight}`} preserveAspectRatio="none">
            <motion.path fill="#0d0709" variants={bottomPathVariants} />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
