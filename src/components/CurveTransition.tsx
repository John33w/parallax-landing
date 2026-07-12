import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CurveTransition({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Reset scroll position synchronously when the new page component mounts.
    // This happens after the AnimatePresence wait, preventing ScrollTrigger race conditions.
    window.scrollTo(0, 0);
  }, []);

  const contentVariants = {
    initial: {
      y: "30vh",
      opacity: 0
    },
    enter: {
      y: 0,
      opacity: 1,
      transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] as const }
    },
    exit: {
      y: "-30vh",
      opacity: 0,
      transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] as const }
    }
  };

  return (
    <div className="relative min-h-screen">
      <motion.div
        variants={contentVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        {children}
      </motion.div>
    </div>
  );
}


