import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';

export default function StaggeredTextReveal({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  // Split text by lines, then by words, then by letters to preserve exact spacing and newlines
  const lines = text.split('\n');

  return (
    <div ref={ref} className={className}>
      {lines.map((line, lineIdx) => (
        <div key={lineIdx} className="overflow-hidden inline-block w-full">
          {line.split(' ').map((word, wordIdx) => (
            <span key={wordIdx} className="inline-block whitespace-pre">
              {word.split('').map((char, charIdx) => {
                // Calculate an absolute index or just use a simple formula based on indices for stagger
                const delay = (lineIdx * 10 + wordIdx * 5 + charIdx) * 0.02;
                return (
                  <motion.span
                    key={charIdx}
                    className="inline-block"
                    initial={{ y: '100%' }}
                    animate={isInView ? { y: '0%' } : { y: '100%' }}
                    transition={{ duration: 0.8, delay: delay, ease: [0.76, 0, 0.24, 1] }}
                  >
                    {char}
                  </motion.span>
                );
              })}
              {/* Add space after word if it's not the last word in the line */}
              {wordIdx !== line.split(' ').length - 1 && (
                <span className="inline-block">&nbsp;</span>
              )}
            </span>
          ))}
          {lineIdx !== lines.length - 1 && <br />}
        </div>
      ))}
    </div>
  );
}
