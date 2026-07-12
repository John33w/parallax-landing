import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


export default function Preloader({ 
  onComplete, 
  onExitStart,
  initialText 
}: { 
  onComplete: () => void, 
  onExitStart: () => void,
  initialText?: string 
}) {
  const [index, setIndex] = useState(0);
  const words = initialText ? [initialText] : ["Nothing", "is", "Impossible"];
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    // Lock scrolling on mount
    document.body.style.overflow = 'hidden';
    
    const resize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', resize);

    return () => {
      // Restore scrolling on unmount
      document.body.style.overflow = '';
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    if (index < words.length) {
      // Time between word switches
      const delay = initialText ? 1200 : (index === 2 ? 1200 : 900); // Reduce visibility time
      const timer = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      // Once all words have cycled, trigger exit phase
      onExitStart();
      const timer = setTimeout(() => {
        onComplete();
      }, 1200); // Match curve transition duration
      return () => clearTimeout(timer);
    }
  }, [index, onComplete, onExitStart, initialText, words.length]);

  // When index reaches words.length, slide up the whole overlay
  const isFinished = index === words.length;

  const curveHeight = 300;
  const { width } = dimensions;

  const containerVariants = {
    initial: { top: "0vh" },
    exit: { 
      top: `calc(-100vh - ${curveHeight}px)`, 
      transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] as const } 
    }
  };

  const bottomPathInitial = `M0 0 Q${width/2} 0 ${width} 0 L${width} 0 L0 0 Z`;
  const bottomPathTarget = `M0 0 Q${width/2} ${curveHeight} ${width} 0 L${width} 0 L0 0 Z`;

  const bottomPathVariants = {
    initial: { d: bottomPathInitial },
    exit: { 
      d: [bottomPathTarget, bottomPathInitial], 
      transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] as const } 
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate={isFinished ? "exit" : "initial"}
      className="fixed left-0 w-full h-[100vh] z-[99999] bg-[#0b0b0b] flex flex-col items-center justify-center pointer-events-none"
    >
      {/* Tight clipping mask for the text */}
      <div className="overflow-hidden relative h-[1.2em] text-2xl sm:text-3xl md:text-4xl lg:text-5xl flex items-center justify-center w-full">
        <AnimatePresence>
          {index < words.length && (
            <motion.div
              key={index}
              initial={initialText ? { opacity: 0, y: 40, filter: "blur(10px)" } : (index === 0 ? {} : { opacity: 0, filter: "blur(10px)" })}
              animate={initialText ? { opacity: 1, y: 0, filter: "blur(0px)" } : (index === 0 ? {} : { opacity: 1, filter: "blur(0px)" })}
              exit={initialText ? { opacity: 0, y: -40, filter: "blur(10px)" } : (index === 0 ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)" })}
              transition={initialText ? { duration: 0.8, ease: [0.76, 0, 0.24, 1] as any } : { duration: 0.8, ease: [0.76, 0, 0.24, 1] as any }}
              className="absolute text-white font-plusJakartaSans font-light tracking-tight flex items-center"
              style={{ fontWeight: 300 }}
            >
              {initialText ? (
                // Simple display for other pages
                words[index]
              ) : index === 0 ? (
                // Pop effect for 'Nothing'
                words[index].split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    transition={{ 
                      duration: 0.8, 
                      ease: [0.76, 0, 0.24, 1] as any, 
                      delay: i * 0.03 
                    }}
                    className="flex items-center whitespace-pre"
                  >
                    {char}
                  </motion.span>
                ))
              ) : index === 2 ? (
                <div className="relative flex items-center justify-center">
                  <span className="relative z-10">{words[index]}</span>
                  {/* Strikeout line */}
                  <motion.div
                    className="absolute left-[-5%] top-[52%] h-[3px] bg-white z-20 pointer-events-none"
                    initial={{ width: "0%" }}
                    animate={{ width: "110%" }}
                    transition={{ 
                      duration: 0.4, 
                      delay: 0.6, 
                      ease: [0.76, 0, 0.24, 1] as any 
                    }}
                  />
                </div>
              ) : (
                // Just text for 'is'
                words[index]
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Curve */}
      <svg className="absolute w-full" style={{ height: curveHeight, bottom: -curveHeight, left: 0 }} viewBox={`0 0 ${width} ${curveHeight}`} preserveAspectRatio="none">
        <motion.path fill="#0b0b0b" variants={bottomPathVariants} initial="initial" animate={isFinished ? "exit" : "initial"} />
      </svg>
    </motion.div>
  );
}
