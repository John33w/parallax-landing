import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollIndicator({ delay = 2.0 }: { delay?: number }) {
  const [isVisible, setIsVisible] = useState(true);
  const [hasAppeared, setHasAppeared] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    // Mark as appeared once it shows, so if we scroll back up, it doesn't wait 6.5s again
    const timer = setTimeout(() => {
      setHasAppeared(true);
    }, delay * 1000 + 1000);

    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [delay]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 1.5, delay: hasAppeared ? 0 : delay, ease: "easeOut" }}
          className="fixed top-1/2 right-4 md:right-8 -translate-y-1/2 flex flex-col items-center gap-4 text-white/50 text-sm md:text-base font-cabinetGrotesk pointer-events-none z-[100] tracking-[0.2em] uppercase"
        >
          <span style={{ writingMode: 'vertical-rl' }} className="rotate-180">Scroll</span>
          <div className="h-16 md:h-24 w-[2px] bg-white/50"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
