import React, { useRef } from 'react';

interface AntigravityTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  style?: React.CSSProperties;
  defaultOpacity?: number;
}

export default function AntigravityText({ 
  text, 
  as: Component = 'h1', 
  className = '', 
  style = {},
  defaultOpacity = 1
}: AntigravityTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);

  // Split text into characters, preserving spaces
  const characters = text.split('');

  return (
    <Component 
      ref={containerRef as any} 
      className={className} 
      style={{ ...style, display: 'inline-flex', flexWrap: 'wrap' }}
      aria-label={text} // Screen readers read the full text properly
    >
      {characters.map((char, index) => (
        <span
          key={index}
          ref={(el) => { spansRef.current[index] = el; }}
          aria-hidden="true" // Hide broken characters from screen readers
          style={{
            display: 'inline-block',
            willChange: 'transform', // Optimize performance
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            color: `rgba(255, 255, 255, ${defaultOpacity})`,
            mixBlendMode: 'overlay', // Critical for WebGL illumination
            position: 'relative',
            zIndex: 10
          }}
        >
          {char}
        </span>
      ))}
    </Component>
  );
}
