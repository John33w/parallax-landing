import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';

export function SlidingTextLink({ to, onClick, children }: { to?: string, onClick?: (e: React.MouseEvent) => void, children: React.ReactNode }) {
  const text = typeof children === 'string' ? children : '';
  const content = (
    <div className="relative flex items-center">
      {text.split('').map((char, index) => (
        <div key={index} className="relative flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full" style={{ transitionDelay: `${index * 0.02}s` }}>
          <span className="flex items-center whitespace-pre">{char}</span>
          <span className="absolute top-full left-0 flex items-center whitespace-pre">{char}</span>
        </div>
      ))}
    </div>
  );

  return to ? (
    <Link to={to} className="relative overflow-hidden group flex items-center justify-center">
      {content}
    </Link>
  ) : (
    <button onClick={onClick} className="relative overflow-hidden group flex items-center justify-center">
      {content}
    </button>
  );
}

export function MagneticButton({ children, to, onClick, className = "" }: { children: React.ReactNode, to?: string, onClick?: () => void, className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const navigate = useNavigate();

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.3); // Magnetic pull strength
    y.set(middleY * 0.3);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else if (to) navigate(to);
  };

  return (
    <motion.button
      onClick={handleClick}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className={`group bg-[#d4f534] text-[#111111] pl-6 pr-2 py-2 rounded-full font-normal hover:bg-white transition-colors duration-300 flex items-center gap-3 ${className || 'text-base'}`}
    >
      <div className="relative overflow-hidden flex items-center justify-center">
        <div className="relative flex items-center">
          {typeof children === 'string' && children.split('').map((char, index) => (
            <div key={index} className="relative flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full" style={{ transitionDelay: `${index * 0.02}s` }}>
              <span className="flex items-center h-6 whitespace-pre">{char}</span>
              <span className="absolute top-full left-0 flex items-center h-6 whitespace-pre">{char}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-black text-[#d4f534] p-2 rounded-full relative overflow-hidden flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300">
        <FiArrowUpRight size={18} className="transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-6 group-hover:-translate-y-6" />
        <FiArrowUpRight size={18} className="absolute transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] -translate-x-6 translate-y-6 group-hover:translate-x-0 group-hover:translate-y-0" />
      </div>
    </motion.button>
  );
}

export default function Navigation({ absolute = false, theme = 'light' }: { absolute?: boolean, theme?: 'light' | 'dark' }) {
  return (
    <>
      <div className={`${absolute ? 'absolute' : 'fixed'} top-0 left-0 w-full flex justify-end items-center p-6 md:py-8 md:px-16 z-[100] pointer-events-none`}>
        
        <nav className="flex items-center pointer-events-auto">
          <div className={`flex gap-4 md:gap-8 text-base md:text-xl font-light items-center ${theme === 'dark' ? 'text-white' : 'text-[#111111]'}`}>
            <SlidingTextLink to="/">Home</SlidingTextLink>
            <SlidingTextLink to="/about">About</SlidingTextLink>
            <MagneticButton className="!text-sm md:!text-base !pl-4 md:!pl-6 !gap-2 md:!gap-3" to="/blog">Blogs</MagneticButton>
          </div>
        </nav>
      </div>
    </>
  );
}
