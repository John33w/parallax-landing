import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  phase: number;
  alpha: number;
}

export default function ParticleField({ opacity = 1 }: { opacity?: number }) {
  const particlesCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let rafId: number;
    const canvas = particlesCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const particles: Particle[] = [];
        const numParticles = 47;

        for (let i = 0; i < numParticles; i++) {
          const vx = (Math.random() - 0.5) * 0.45;
          const vy = (Math.random() - 0.5) * 0.45;
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx,
            vy,
            baseVx: vx,
            baseVy: vy,
            size: Math.random() * 2 + 1,
            phase: Math.random() * Math.PI * 2,
            alpha: Math.random() * 0.3 + 0.1
          });
        }

        let mouseX = -1000;
        let mouseY = -1000;

        const handleMouseMove = (e: MouseEvent) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const renderParticles = (time: number) => {
          ctx.clearRect(0, 0, width, height);
          
          particles.forEach((p) => {
            const waveX = Math.sin(time * 0.001 + p.phase) * 0.45;
            const waveY = Math.cos(time * 0.0012 + p.phase) * 0.45;
            
            // Mouse Interaction (Repulsion)
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const interactionRadius = 150;
            if (dist < interactionRadius) {
              const force = (interactionRadius - dist) / interactionRadius; // 1 at center, 0 at edge
              const angle = Math.atan2(dy, dx);
              // Apply pushing force
              p.vx += Math.cos(angle) * force * 0.5;
              p.vy += Math.sin(angle) * force * 0.5;
            }

            // Damping / Friction (smoothly return to base floating velocity)
            p.vx += (p.baseVx - p.vx) * 0.05;
            p.vy += (p.baseVy - p.vy) * 0.05;

            p.x += p.vx + waveX;
            p.y += p.vy + waveY;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            
            // Flicker effect
            const flicker = Math.sin(time * 0.004 + p.phase * 2) * 0.5 + 0.5;
            const drawAlpha = p.alpha * (0.2 + 0.8 * flicker);
            
            ctx.fillStyle = `rgba(255, 255, 255, ${drawAlpha})`;
            ctx.fill();
          });

          rafId = requestAnimationFrame(renderParticles);
        };

        rafId = requestAnimationFrame(renderParticles);

        const handleResize = () => {
          width = window.innerWidth;
          height = window.innerHeight;
          canvas.width = width;
          canvas.height = height;
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('mousemove', handleMouseMove);
          cancelAnimationFrame(rafId);
        };
      }
    }
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden', opacity, transition: 'opacity 1s ease' }}>
      <canvas 
        ref={particlesCanvasRef} 
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} 
      />
    </div>
  );
}
