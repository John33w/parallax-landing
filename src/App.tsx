import React, { useEffect, useState, useRef, CSSProperties } from 'react';

// ASSETS
const PORTAL_BG = "/portal_bg.png";
const CURTAIN_LEFT = "/curtain_left.png";
const CURTAIN_RIGHT = "/curtain_right.png";
const WORLD_BG = "/world-bg.jpg";
const BOTTOM_CLOUDS = "/bottom-clouds.png";

const CARD_IMAGES = [
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160507_2ccbb4eb-1469-484f-af25-59168ad9a233.png&w=1280&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160644_072a7f68-a101-4ded-a332-7d37707dbdd1.png&w=1280&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160706_1c153d04-0dfb-4ac9-a4ef-e74f301c329c.png&w=1280&q=85"
];

const SCENE2_CARDS = [
  { title: 'Romans 8:39', desc: 'neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.', color: '#f3cdd6' },
  { title: 'Blogs', desc: 'A gateway to another mindset. Step right in.', color: '#dcedc2' },
  { title: 'About Me', desc: 'Behind the words, a story unfolds. Step inside.', color: '#c3e3f4' },
  { title: '1 John 4:19', desc: 'We love because he first loved us.', color: '#f0e4c0' }
];

// HELPERS
const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(max-width: 767px)').matches);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

const StarLogo = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2l2.09 6.42H23l-5.45 3.96 2.09 6.42L14 14.84l-5.64 4.06 2.09-6.42L4.96 8.42h6.95L14 2z" fill="white" fillOpacity="0.9" />
    <circle cx="14" cy="24" r="1.5" fill="white" fillOpacity="0.6" />
    <circle cx="6" cy="6" r="1" fill="white" fillOpacity="0.4" />
    <circle cx="22" cy="6" r="1" fill="white" fillOpacity="0.4" />
  </svg>
);

const PlayIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '2px' }}>
    <path d="M5 3L19 12L5 21V3Z" fill="white" />
  </svg>
);

const ScrollChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ARCCARDSLIDER
const ArcCardSlider = ({ cards, rotationOffset, isMobile }: { cards: any[], rotationOffset: number, isMobile: boolean }) => {
  const cardSpacingDeg = isMobile ? 12 : 9;
  const centerIndex = Math.floor(cards.length / 2);
  const arcRadius = isMobile ? 700 : 1100;
  const cardW = isMobile ? 160 : 220;
  const cardH = isMobile ? 175 : 230;
  const sliderH = isMobile ? 260 : 360;

  return (
    <div style={{ position: 'relative', width: '100vw', height: `${sliderH}px`, overflow: 'hidden' }}>
      {cards.map((card, i) => {
        const baseDeg = (i - centerIndex) * cardSpacingDeg;
        const deg = baseDeg - rotationOffset + (centerIndex * cardSpacingDeg);
        const rad = (deg * Math.PI) / 180;
        const x = Math.sin(rad) * arcRadius;
        const y = arcRadius - Math.cos(rad) * arcRadius;
        
        const bottomOffset = isMobile ? 60 : 80;
        const bottomPos = -y + bottomOffset;
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: `${bottomPos}px`,
              left: `calc(50% + ${x}px - ${cardW / 2}px)`,
              width: `${cardW}px`,
              height: `${cardH}px`,
              transform: `rotate(${deg}deg)`,
              transformOrigin: `${cardW/2}px ${arcRadius}px`,
              backgroundColor: card.color,
              borderRadius: isMobile ? '18px' : '26px',
              boxShadow: '0 8px 40px rgba(80,40,60,0.18)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '1.5px solid rgba(80,50,60,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(80,50,60,0.6)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px'
            }}>
              {(i + 1).toString().padStart(2, '0')}
            </div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? '22px' : '26px',
              color: '#3a2530',
              margin: '24px 0 4px 0',
              lineHeight: 1.2
            }}>{card.title}</h3>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: isMobile ? '12px' : '14px',
              color: 'rgba(58,37,48,0.85)',
              margin: 0,
              lineHeight: 1.5
            }}>{card.desc}</p>
          </div>
        )
      })}
    </div>
  );
};

export default function App() {
  const isMobile = useIsMobile();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [uiVisible, setUiVisible] = useState(false);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);

  // Refs for tracking values inside rAF without triggering re-renders
  const scrollProgressRef = useRef(0);
  const curtainsOpenRef = useRef(false);
  
  // Refs for layers
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLImageElement>(null);
  const cloudsRef = useRef<HTMLImageElement>(null);
  const portalRef = useRef<HTMLImageElement>(null);
  const curtainLRef = useRef<HTMLImageElement>(null);
  const curtainRRef = useRef<HTMLImageElement>(null);

  // Mouse tracking
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Entrance animations
    const t1 = setTimeout(() => { setCurtainsOpen(true); curtainsOpenRef.current = true; }, 100);
    const t2 = setTimeout(() => setUiVisible(true), 600);
    const t3 = setTimeout(() => setEntranceDone(true), 2200);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrolled = window.scrollY;
        const maxScroll = containerRef.current.scrollHeight - window.innerHeight;
        const progress = clamp(scrolled / maxScroll, 0, 1);
        setScrollProgress(progress);
        scrollProgressRef.current = progress;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouse.current.targetX = x;
      mouse.current.targetY = y;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    handleScroll();

    const updateParallax = () => {
      if (!isMobile) {
        mouse.current.x = lerp(mouse.current.x, mouse.current.targetX, 0.07);
        mouse.current.y = lerp(mouse.current.y, mouse.current.targetY, 0.07);
      }
      
      const mx = isMobile ? 0 : -mouse.current.x;
      const my = isMobile ? 0 : -mouse.current.y;
      
      const ep = easeInOut(scrollProgressRef.current);
      
      if (worldRef.current) {
        const scale = lerp(1, 1.18, ep);
        worldRef.current.style.transform = `translate(${mx * 6}px, ${my * 6}px) scale(${scale})`;
      }
      if (cloudsRef.current) {
        const scale = lerp(1, 1.4, ep);
        cloudsRef.current.style.transform = `translate(${mx * 9}px, ${my * 9 * 0.4}px) scale(${scale})`;
      }
      if (portalRef.current) {
        const scale = lerp(1, 7.5, ep);
        portalRef.current.style.transform = `translate(${mx * 7}px, ${my * 7}px) scale(${scale})`;
      }
      
      if (curtainLRef.current) {
        const shift = curtainsOpenRef.current ? -62 : 0;
        const shiftScroll = lerp(0, 150, ep);
        const scale = lerp(1, 1.3, ep);
        curtainLRef.current.style.transform = `translate(calc(${shift}% - ${shiftScroll}%), ${my * 14 * 0.3}px) translateX(${mx * 14}px) scale(${scale})`;
      }
      if (curtainRRef.current) {
        const shift = curtainsOpenRef.current ? 62 : 0;
        const shiftScroll = lerp(0, 150, ep);
        const scale = lerp(1, 1.3, ep);
        curtainRRef.current.style.transform = `translate(calc(${shift}% + ${shiftScroll}%), ${my * 14 * 0.3}px) translateX(${mx * 14}px) scale(${scale})`;
      }
      
      rafRef.current = requestAnimationFrame(updateParallax);
    };
    
    rafRef.current = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile]);

  // Derived values for styling
  const ep = easeInOut(scrollProgress);
  const cloudsOpacity = clamp(lerp(0.7, 1, scrollProgress / 0.05), 0, 1);
  const portalOpacity = scrollProgress > 0.65 ? clamp(1 - (scrollProgress - 0.65) / 0.20, 0, 1) : 1;
  const scene1Opacity = clamp(1 - scrollProgress / 0.22, 0, 1);
  const scene2Opacity = clamp((scrollProgress - 0.68) / 0.16, 0, 1);
  
  const arcSweepDeg = (SCENE2_CARDS.length - 1) * 10;
  const rotationOffset = lerp(0, arcSweepDeg, clamp((scrollProgress - 0.70) / 0.30, 0, 1));

  // Shared nav link style
  const navLinkStyle: CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.85)',
    textDecoration: 'none',
    cursor: 'pointer'
  };

  return (
    <div ref={containerRef} style={{ height: '480vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#0a0608' }}>
        
        {/* Layer 1: World Background */}
        <img 
          ref={worldRef}
          src={WORLD_BG} 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transformOrigin: '50% 50%', zIndex: 0 }}
        />

        {/* Layer 2: Bottom Clouds */}
        <img 
          ref={cloudsRef}
          src={BOTTOM_CLOUDS} 
          style={{ position: 'absolute', bottom: '-35%', left: 0, width: '100%', height: '135%', objectFit: 'cover', transformOrigin: '50% 100%', zIndex: 10, opacity: cloudsOpacity }}
        />

        {/* Layer 2.5: Arc Card Slider */}
        <div style={{ position: 'absolute', bottom: isMobile ? '60px' : '80px', left: 0, width: '100%', zIndex: 9, opacity: scene2Opacity }}>
          <ArcCardSlider cards={SCENE2_CARDS} rotationOffset={rotationOffset} isMobile={isMobile} />
        </div>

        {/* Layer 3: Portal Frame */}
        <img 
          ref={portalRef}
          src={PORTAL_BG} 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transformOrigin: '52% 38%', zIndex: 15, opacity: portalOpacity }}
        />

        {/* Layer 3.5: Bottom Fade */}
        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 16 }} />

        {/* Layer 4L: Curtain Left */}
        <img 
          ref={curtainLRef}
          src={CURTAIN_LEFT} 
          style={{ 
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right center', transformOrigin: 'left center', zIndex: 16,
            transition: entranceDone ? 'none' : 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform'
          }}
        />

        {/* Layer 4R: Curtain Right */}
        <img 
          ref={curtainRRef}
          src={CURTAIN_RIGHT} 
          style={{ 
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center', transformOrigin: 'right center', zIndex: 16,
            transition: entranceDone ? 'none' : 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform'
          }}
        />

        {/* Top Fade Gradient */}
        <div style={{ position: 'absolute', top: 0, width: '100%', height: '42vh', background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 45 }} />

        {/* Navigation */}
        <nav style={{ position: 'absolute', top: 0, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50, padding: isMobile ? '18px 20px' : '22px 48px' }}>
          {isMobile ? (
            <>
              <a style={{ ...navLinkStyle, fontSize: '11px' }}>Explore</a>
              <StarLogo />
              <a style={{ ...navLinkStyle, fontSize: '11px' }}>Connect</a>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '36px' }}>
                <a style={navLinkStyle}>Worlds</a>
                <a style={navLinkStyle}>Atelier</a>
                <a style={navLinkStyle}>Immersions</a>
              </div>
              <StarLogo />
              <div style={{ display: 'flex', gap: '36px' }}>
                <a style={navLinkStyle}>Craft</a>
                <a style={navLinkStyle}>Codex</a>
                <a style={navLinkStyle}>Connect</a>
              </div>
            </>
          )}
        </nav>

        {/* SCENE 1 UI */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', opacity: scene1Opacity, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          <div style={{
            opacity: uiVisible ? 1 : 0, transform: uiVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 1s ease 0.3s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
            textAlign: 'center', padding: '0 24px'
          }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 16px', fontSize: 'clamp(48px, 10vw, 96px)', lineHeight: 1.2, color: 'rgba(255, 255, 255, 1)' }}>
              RinaWrites
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(16px, 4vw, 22px)', lineHeight: 1.5, color: 'rgba(255, 255, 255, 0.85)', maxWidth: '600px', margin: '0 auto' }}>
              Face the world with full confidence and courage
            </p>
          </div>

          {/* Scroll Cue (desktop only) */}
          <div className="hidden xl:flex" style={{ 
            position: 'absolute', bottom: '36px', left: '50%', transform: 'translateX(-50%)', flexDirection: 'column', alignItems: 'center', gap: '12px',
            opacity: uiVisible ? 1 : 0, transition: 'opacity 1s ease 0.9s'
          }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
              DESCEND
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'bobUp 1.8s ease-in-out infinite' }}>
              <ScrollChevron />
            </div>
          </div>
        </div>

        {/* SCENE 2 UI */}
        <div style={{ 
          position: 'absolute', inset: 0, zIndex: 46, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginTop: isMobile ? '8vh' : '12vh', opacity: scene2Opacity, padding: '0 24px'
        }}>
          <h2 style={{ 
            fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 'clamp(32px, 8vw, 48px)' : 'clamp(42px, 6.5vw, 64px)', color: 'rgba(255, 255, 255, 1)', 
            lineHeight: 1.2, textShadow: '0 2px 20px rgba(0,0,0,0.4)', textAlign: 'center', margin: '0 0 16px' 
          }}>
            Welcome to RinaWrites
          </h2>
          <p style={{ 
            fontFamily: "'Inter', sans-serif", fontSize: isMobile ? '16px' : '20px', lineHeight: 1.5, 
            maxWidth: isMobile ? '320px' : '640px', color: 'rgba(255, 255, 255, 0.85)', textAlign: 'center', margin: 0 
          }}>
            Welcome to Clarina Page, a place where words inspire, uplift, and transform. Here, you’ll find powerful quotes and heartfelt sermons that bring wisdom, faith, and encouragement to your daily life. Whether you seek guidance, motivation, or spiritual reflection, let these words be a beacon of light on your journey. Stay inspired, stay blessed!
          </p>
        </div>
</div>
    </div>
  );
}
