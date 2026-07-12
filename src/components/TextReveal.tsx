import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  text: string;
  className?: string;
  playEveryTime?: boolean;
  delay?: number;
}

export default function TextReveal({ text, className = '', playEveryTime = false, delay = 0 }: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canAnimate, setCanAnimate] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setCanAnimate(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useGSAP(() => {
    if (!containerRef.current || !canAnimate) return;

    gsap.to(containerRef.current.querySelectorAll('.word-inner'), {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 98%',
        toggleActions: playEveryTime ? 'restart none none none' : 'play none none none',
      },
      y: '0%',
      opacity: 1,
      duration: 0.8,
      delay: delay,
      ease: 'power4.out',
      stagger: 0.015,
    });
  }, { scope: containerRef, dependencies: [canAnimate] });

  const words = text.split(' ');

  return (
    <div ref={containerRef} className={className}>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <span className="inline-block relative overflow-hidden align-bottom">
            <span className="word-inner inline-block translate-y-[110%] opacity-0 will-change-transform">
              {word}
            </span>
          </span>
          {i < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </div>
  );
}
