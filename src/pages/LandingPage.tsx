import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';


import AntigravityText from '../components/AntigravityText';
import FluidCursor from '../components/FluidCursor';
import ParticleField from '../components/ParticleField';
import BlogMenu from './BlogMenu';

// ASSETS
const PORTAL_BG = "/portal_bg.png";
const WORLD_BG = "/world-bg.jpg";
const BOTTOM_CLOUDS = "/bottom-clouds.png";
const SCENE3_BG = "/about_bg.jpg";
const SCENE3_CLOUDS = "/about_clouds.png";

// const CARD_IMAGES = [
//   "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160507_2ccbb4eb-1469-484f-af25-59168ad9a233.png&w=1280&q=85",
//   "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160644_072a7f68-a101-4ded-a332-7d37707dbdd1.png&w=1280&q=85",
//   "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160706_1c153d04-0dfb-4ac9-a4ef-e74f301c329c.png&w=1280&q=85"
// ];

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
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 767px)').matches;
    }
    return false;
  });
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(max-width: 767px)').matches);
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

// const PlayIcon = () => (
//   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '2px' }}>
//     <path d="M5 3L19 12L5 21V3Z" fill="white" />
//   </svg>
// );

const ScrollChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ARCCARDSLIDER
const ArcCardSlider = ({ cards, rotationOffset, isMobile, onCardClick }: { cards: any[], rotationOffset: number, isMobile: boolean, onCardClick?: (title: string) => void }) => {
  const cardSpacingDeg = isMobile ? 12 : 9;
  const centerIndex = Math.floor(cards.length / 2);
  const arcRadius = isMobile ? 700 : 1100;
  const cardW = isMobile ? 160 : 220;
  const cardH = isMobile ? 175 : 230;
  const sliderH = isMobile ? 260 : 360;

  return (
    <div style={{ position: 'relative', width: '100vw', height: `${sliderH}px`, overflow: 'visible' }}>
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
              cursor: (card.title === 'Blogs' || card.title === 'About Me') ? 'pointer' : 'default',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (card.title === 'Blogs' || card.title === 'About Me') {
                 e.currentTarget.style.transform = `rotate(${deg}deg) scale(1.05)`;
                 e.currentTarget.style.boxShadow = '0 15px 45px rgba(80,40,60,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (card.title === 'Blogs' || card.title === 'About Me') {
                 e.currentTarget.style.transform = `rotate(${deg}deg) scale(1)`;
                 e.currentTarget.style.boxShadow = '0 8px 40px rgba(80,40,60,0.18)';
              }
            }}
            onClick={() => onCardClick && onCardClick(card.title)}
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

export default function LandingPage() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [activeScene, setActiveScene] = useState<'main' | 'aboutMe' | 'blogs'>(
    location.search.includes('scene=blogs') ? 'blogs' : 'main'
  );

  useEffect(() => {
    if (location.search.includes('scene=blogs')) {
      setActiveScene('blogs');
    } else if (location.search.includes('scene=about')) {
      setActiveScene('aboutMe');
    } else {
      if (activeSceneRef.current !== 'main') {
        isRestoringScrollRef.current = true;
        setActiveScene('main');
        setTimeout(() => {
          if (containerRef.current) {
            const maxScroll = containerRef.current.scrollHeight - window.innerHeight;
            const targetY = lastScrollY.current >= 0 ? lastScrollY.current : 0;
            window.scrollTo({ top: targetY, behavior: 'instant' });
            setTimeout(() => { isRestoringScrollRef.current = false; }, 1200);
          }
        }, 10);
      } else {
        setActiveScene('main');
      }
    }
  }, [location.search]);

  const lastScrollY = useRef(-1);
  const activeSceneRef = useRef(activeScene);
  const isRestoringScrollRef = useRef(false);

  useEffect(() => {
    activeSceneRef.current = activeScene;
  }, [activeScene]);

  // Lock scroll when not in main scene
  useEffect(() => {
    if (isMobile) {
      // Always lock scroll on mobile to prevent rubber-banding and scrolling empty space
      document.documentElement.classList.add('mobile-lock-scroll');
      document.body.classList.add('mobile-lock-scroll');
    } else {
      document.documentElement.classList.remove('mobile-lock-scroll');
      document.body.classList.remove('mobile-lock-scroll');
      
      if (activeScene !== 'main') {
        // Prevent layout shift by adding padding equal to scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.paddingRight = '';
        document.body.style.overflow = 'auto';
      }
    }
    return () => {
      document.documentElement.classList.remove('mobile-lock-scroll');
      document.body.classList.remove('mobile-lock-scroll');
      document.body.style.paddingRight = '';
      document.body.style.overflow = 'auto';
    };
  }, [activeScene, isMobile]);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [uiVisible, setUiVisible] = useState(false);
  const [, setCurtainsOpen] = useState(false);

  useEffect(() => {
    // Swipe gestures have been removed for mobile per user request.
  }, [isMobile, activeScene]);

  const [scene3UIVisible, setScene3UIVisible] = useState(false);
  const [scene3EntranceDone, setScene3EntranceDone] = useState(false);
  const [_scene3BlogsScroll, setScene3BlogsScroll] = useState(0);
  const [scene3AboutMeScroll, setScene3AboutMeScroll] = useState(0);
  const scene3BlogsContainerRef = useRef<HTMLDivElement>(null);
  const scene3AboutMeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeScene === 'blogs' && scene3BlogsContainerRef.current) {
      scene3BlogsContainerRef.current.scrollTop = 0;
      setScene3BlogsScroll(0);
    }
    if (activeScene === 'aboutMe' && scene3AboutMeContainerRef.current) {
      scene3AboutMeContainerRef.current.scrollTop = 0;
      setScene3AboutMeScroll(0);
    }
  }, [activeScene]);

  useEffect(() => {
    if (activeScene !== 'main') {
      const t2 = setTimeout(() => setScene3UIVisible(true), 600);
      const t3 = setTimeout(() => setScene3EntranceDone(true), 2200);
      return () => {
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setScene3UIVisible(false);
      setScene3EntranceDone(false);
    }
  }, [activeScene]);


  const handleBackToMain = () => {
    isRestoringScrollRef.current = true;
    setActiveScene('main');
    setTimeout(() => {
      if (containerRef.current) {
        const maxScroll = containerRef.current.scrollHeight - window.innerHeight;
        const targetY = lastScrollY.current >= 0 ? lastScrollY.current : 0;
        window.scrollTo({ top: targetY, behavior: 'instant' });
        setTimeout(() => { isRestoringScrollRef.current = false; }, 1200);
      }
    }, 10);
  };

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
  const scene3AboutMeBgRef = useRef<HTMLDivElement>(null);
  const scene3AboutMeCloudsRef = useRef<HTMLDivElement>(null);

  // (Removed mouse tracking for wiggle effect)
  const rafRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (window.location.search.includes('scene=2') || window.location.search.includes('scene=blogs')) {
      if (containerRef.current) {
        const maxScroll = containerRef.current.scrollHeight - window.innerHeight;
        let targetScroll = maxScroll; // default bottom
        
        if (window.location.search.includes('scene=2')) {
          targetScroll = maxScroll * 0.60; // Scroll to middle of Scene 2
        }
        
        window.scrollTo({ top: targetScroll, behavior: 'instant' as ScrollBehavior });
        
        const progress = clamp(targetScroll / maxScroll, 0, 1);
        setScrollProgress(progress);
        scrollProgressRef.current = progress;
      }
    }
  }, []);

  useEffect(() => {
    // Entrance animations
    const t1 = setTimeout(() => { setCurtainsOpen(true); curtainsOpenRef.current = true; }, 100);
    const t2 = setTimeout(() => setUiVisible(true), 600);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isRestoringScrollRef.current || activeSceneRef.current !== 'main') return;
      if (containerRef.current) {
        const scrolled = window.scrollY;
        const maxScroll = containerRef.current.scrollHeight - window.innerHeight;
        const progress = clamp(scrolled / maxScroll, 0, 1);
        setScrollProgress(progress);
        scrollProgressRef.current = progress;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const updateParallax = () => {
      const mx = 0;
      const my = 0;
      
      const ep = easeInOut(scrollProgressRef.current);
      
      if (worldRef.current) {
        const scale = lerp(1, 1.4, ep);
        worldRef.current.style.transform = `translate(${mx * 6}px, ${my * 6}px) scale(${scale})`;
      }
      if (cloudsRef.current) {
        const scale = lerp(1, 1.6, ep);
        cloudsRef.current.style.transform = `translate(${mx * 9}px, ${my * 9 * 0.4}px) scale(${scale})`;
      }
      if (portalRef.current) {
        const portalEp = easeInOut(clamp(scrollProgressRef.current / 0.55, 0, 1));
        const scale = lerp(1, 7.5, portalEp);
        portalRef.current.style.transform = `translate(${mx * 7}px, ${my * 7}px) scale(${scale})`;
      }
      
      if (curtainLRef.current) {
        const shift = curtainsOpenRef.current ? -62 : 0;
        const curtainEp = easeInOut(clamp(scrollProgressRef.current / 0.55, 0, 1));
        const shiftScroll = lerp(0, 150, curtainEp);
        const scale = lerp(1, 1.3, curtainEp);
        curtainLRef.current.style.transform = `translate(calc(${shift}% - ${shiftScroll}%), ${my * 14 * 0.3}px) translateX(${mx * 14}px) scale(${scale})`;
      }
      if (curtainRRef.current) {
        const shift = curtainsOpenRef.current ? 62 : 0;
        const curtainEp = easeInOut(clamp(scrollProgressRef.current / 0.55, 0, 1));
        const shiftScroll = lerp(0, 150, curtainEp);
        const scale = lerp(1, 1.3, curtainEp);
        curtainRRef.current.style.transform = `translate(calc(${shift}% + ${shiftScroll}%), ${my * 14 * 0.3}px) translateX(${mx * 14}px) scale(${scale})`;
      }
      
      rafRef.current = requestAnimationFrame(updateParallax);
    };
    
    rafRef.current = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile]);

  // Derived values for styling
  const cloudsOpacity = clamp(lerp(0.7, 1, scrollProgress / 0.05), 0, 1);
  const scene1Opacity = clamp(1 - scrollProgress / 0.15, 0, 1);
  const portalOpacity = scrollProgress > 0.40 ? clamp(1 - (scrollProgress - 0.40) / 0.15, 0, 1) : 1;
  
  const scene2Opacity = scrollProgress > 0.70 
    ? clamp(1 - (scrollProgress - 0.70) / 0.10, 0, 1) 
    : clamp((scrollProgress - 0.45) / 0.10, 0, 1);
  
  const arcSweepDeg = (SCENE2_CARDS.length - 1) * 10;
  const rotationOffset = lerp(0, arcSweepDeg, clamp((scrollProgress - 0.45) / 0.20, 0, 1));
  
  const scene3Opacity = scrollProgress > 0.70 ? clamp((scrollProgress - 0.70) / 0.15, 0, 1) : 0;

  return (
    <div ref={containerRef} className="landing-container" style={{ height: isMobile ? '100dvh' : '600vh', overflow: isMobile ? 'hidden' : 'visible', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100dvh', overflow: 'hidden', background: '#0a0608' }}>
        {/* Global Particles */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 45, pointerEvents: 'none' }}>
          <ParticleField />
        </div>
        <div style={{ position: 'absolute', inset: 0, transform: activeScene === 'blogs' ? 'translateY(100%)' : activeScene === 'aboutMe' ? 'translateY(-100%)' : 'translateY(0)', transition: 'transform 1.2s cubic-bezier(0.76, 0, 0.24, 1)' }}>
        
          {/* SEAM BLENDERS: Minimalistic smooth fade between scenes */}
          <div style={{ position: 'absolute', top: '-2vh', left: 0, width: '100%', height: '4vh', background: 'linear-gradient(to bottom, transparent, #0a0608 45%, #0a0608 55%, transparent)', zIndex: 100, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 'calc(100% - 2vh)', left: 0, width: '100%', height: '4vh', background: 'linear-gradient(to bottom, transparent, #0a0608 45%, #0a0608 55%, transparent)', zIndex: 100, pointerEvents: 'none' }} />

        {/* Main Scene (Scene 1 & 2) Container - prevents scaled elements from bleeding */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>

        {/* Layer 1: World Background */}
        <img 
          ref={worldRef}
          src={WORLD_BG} 
          className="landing-parallax-layer"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transformOrigin: '50% 50%', zIndex: 0 }}
        />

        {/* Layer 2: Bottom Clouds (Bushes) */}
        <img 
          ref={cloudsRef}
          src={BOTTOM_CLOUDS} 
          className="landing-parallax-layer mobile-hidden"
          style={{ position: 'absolute', bottom: '-35%', left: 0, width: '100%', height: '135%', objectFit: 'cover', transformOrigin: '50% 100%', zIndex: 10, opacity: cloudsOpacity, pointerEvents: 'none' }}
        />

        {/* Layer 2.5: Arc Card Slider */}
        <div className="mobile-hidden" style={{ position: 'absolute', bottom: isMobile ? '60px' : '80px', left: 0, width: '100%', zIndex: 9, opacity: scene2Opacity }}>
          <ArcCardSlider cards={SCENE2_CARDS} rotationOffset={rotationOffset} isMobile={isMobile} onCardClick={(title) => {
            lastScrollY.current = window.scrollY;
            if (title === 'Blogs') setActiveScene('blogs');
            else if (title === 'About Me') setActiveScene('aboutMe');
          }} />
        </div>

        {/* Layer 3: Portal Frame */}
        <img 
          ref={portalRef}
          src={PORTAL_BG} 
          className="landing-parallax-layer"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transformOrigin: '52% 38%', zIndex: 15, opacity: portalOpacity, pointerEvents: 'none' }}
        />

        {/* Layer 3.5: Bottom Fade */}
        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 16 }} />



        {/* Top Fade Gradient */}
        <div style={{ position: 'absolute', top: 0, width: '100%', height: '42vh', background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 45 }} />

        {/* Navigation */}
        <nav style={{ position: 'absolute', top: 0, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, padding: isMobile ? '18px 20px' : '22px 48px' }}>
          <StarLogo />
        </nav>

        {/* SCENE 1 UI */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', opacity: scene1Opacity, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          <FluidCursor />
          
          <div style={{
            opacity: uiVisible ? 1 : 0, transform: uiVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 1s ease 0.3s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
            textAlign: 'center', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'auto'
          }}>
            <div 
              className="mobile-clickable"
              onClick={() => { 
                if(isMobile) {
                  lastScrollY.current = window.scrollY;
                  setActiveScene('blogs'); 
                }
              }}
              style={{ position: 'relative', width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'center', margin: '0 auto 16px', cursor: isMobile ? 'pointer' : 'default' }}>
              <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(60px, 8vw, 110px)', fontWeight: 700, color: '#ffffff', margin: 0, textShadow: '0px 4px 16px rgba(0,0,0,0.4)', lineHeight: 1 }}>
                RinaWrites
              </h1>
            </div>
            
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
        <div className="mobile-hidden" style={{ 
          position: 'absolute', inset: 0, zIndex: 46, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginTop: isMobile ? '8vh' : '12vh', opacity: scene2Opacity, padding: '0 24px'
        }}>
          <AntigravityText 
            text="Welcome to RinaWrites"
            as="h2"
            style={{ 
              fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 'clamp(32px, 8vw, 48px)' : 'clamp(42px, 6.5vw, 64px)', color: 'rgba(255, 255, 255, 1)', 
              lineHeight: 1.2, textShadow: '0 2px 20px rgba(0,0,0,0.4)', textAlign: 'center', margin: '0 0 16px', pointerEvents: 'auto'
            }}
          />
          <p style={{ 
            fontFamily: "'Inter', sans-serif", fontSize: isMobile ? '16px' : '20px', lineHeight: 1.5, 
            maxWidth: isMobile ? '320px' : '640px', color: 'rgba(255, 255, 255, 0.85)', textAlign: 'center', margin: 0 
          }}>
            Welcome to Clarina Page, a place where words inspire, uplift, and transform. Here, you’ll find powerful quotes and heartfelt sermons that bring wisdom, faith, and encouragement to your daily life. Whether you seek guidance, motivation, or spiritual reflection, let these words be a beacon of light on your journey. Stay inspired, stay blessed!
          </p>
        </div>
        
        {/* SCENE 3 UI */}
        <div className="mobile-hidden" style={{ 
          position: 'absolute', inset: 0, zIndex: 46, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: scene3Opacity, padding: '0 24px'
        }}>
          {isMobile ? (
            <h2 style={{ 
              fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 8vw, 48px)', color: 'rgba(255, 255, 255, 1)', 
              lineHeight: 1.2, textShadow: '0 2px 20px rgba(0,0,0,0.4)', textAlign: 'center'
            }}>
              Thank You for Visiting
            </h2>
          ) : (
            <>
              <AntigravityText 
                text="Ignite Your Faith, Elevate Your Mind"
                as="h2"
                style={{ 
                  fontFamily: "'Playfair Display', serif", fontSize: 'clamp(42px, 6.5vw, 64px)', color: 'rgba(255, 255, 255, 1)', 
                  lineHeight: 1.2, textShadow: '0 2px 20px rgba(0,0,0,0.4)', textAlign: 'center', margin: '0 0 16px', pointerEvents: 'auto'
                }}
              />
              <p style={{ 
                fontFamily: "'Inter', sans-serif", fontSize: '20px', lineHeight: 1.5, 
                maxWidth: '640px', color: 'rgba(255, 255, 255, 0.85)', textAlign: 'center', margin: 0 
              }}>
                No matter where you are on your journey, I hope these truths offer the wisdom and comfort your spirit needs today. Trust the process, stand firm in hope.<br/><br/>
                Stay inspired, Stay blessed!
              </p>
            </>
          )}
        </div>
        
        </div> {/* End of Main Scene Container */}
        
        
        {/* SCENE 3: BLOGS (Top Container) */}
        <div 
          ref={scene3BlogsContainerRef}
          className="blogs-scroll-container"
          onScroll={(e) => setScene3BlogsScroll(Math.min(e.currentTarget.scrollTop / window.innerHeight, 1))}
          style={{ 
            position: 'absolute', bottom: '100%', width: '100%', height: '100%', 
            background: '#0a0608',
            overflowY: activeScene === 'blogs' ? 'auto' : 'hidden', overflowX: 'hidden'
          }}>
          <BlogMenu isIntegrated={true} onBack={() => {
            isRestoringScrollRef.current = true;
            setActiveScene('main');
            setTimeout(() => {
              if (containerRef.current) {
                const maxScroll = containerRef.current.scrollHeight - window.innerHeight;
                const targetY = lastScrollY.current > 0 ? lastScrollY.current : maxScroll * 0.60;
                window.scrollTo({ top: targetY, behavior: 'instant' });
                setTimeout(() => { isRestoringScrollRef.current = false; }, 1200);
              }
            }, 10);
          }} />
        </div>

        {/* SCENE 3: ABOUT ME (Bottom Container) */}
        <div 
          className="mobile-hidden"
          ref={scene3AboutMeContainerRef}
          onScroll={(e) => setScene3AboutMeScroll(Math.min(e.currentTarget.scrollTop / window.innerHeight, 1))}
          style={{ 
            position: 'absolute', top: '100%', width: '100%', height: '100%', 
            background: '#0a0608',
            overflowY: 'auto', overflowX: 'hidden'
          }}>
          
          {/* STICKY BACKGROUND & INTRO */}
          <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', zIndex: 0 }}>
            
            {/* BACK BUTTON */}
            <div 
              className="absolute top-8 left-8 md:top-16 md:left-16 z-[100]"
              style={{ 
                opacity: (scene3UIVisible && activeScene === 'aboutMe' && scene3AboutMeScroll < 0.05) ? 1 : 0, 
                transition: 'opacity 0.3s ease',
                pointerEvents: (scene3UIVisible && activeScene === 'aboutMe' && scene3AboutMeScroll < 0.05) ? 'auto' : 'none' 
              }}
            >
              <button onClick={handleBackToMain} className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-white/80 hover:text-white transition-colors group/link font-medium">
                <svg className="group-hover/link:-translate-x-1 transition-transform duration-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                BACK
              </button>
            </div>

            <div ref={scene3AboutMeBgRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}>
              <img 
                src={SCENE3_BG} 
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                         transform: activeScene === 'aboutMe' ? `scale(${1.1 + scene3AboutMeScroll * 0.4}) translateY(${-5 + scene3AboutMeScroll * 5}vh)` : 'scale(1) translateY(0)', 
                         transition: activeScene === 'aboutMe' ? 'none' : 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,10,20,0.4)', zIndex: 5, pointerEvents: 'none' }} />

            {/* Clouds (Moves down and fades out on scroll) */}
            <div ref={scene3AboutMeCloudsRef} style={{ 
              position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 30,
              opacity: 1 - scene3AboutMeScroll * 2,
              transform: `scale(${1 + scene3AboutMeScroll * 0.6}) translateY(${scene3AboutMeScroll * 100}px)`,
              pointerEvents: 'none'
            }}>
              <img 
                src={SCENE3_CLOUDS} 
                style={{ 
                  position: 'absolute', bottom: '-5%', left: 0, width: '100%', height: '110%', 
                  objectFit: 'cover', transformOrigin: '50% 100%',
                  transition: (activeScene === 'aboutMe' && scene3EntranceDone) ? 'none' : 'opacity 1.2s ease',
                  opacity: 1,
                  filter: 'hue-rotate(-120deg) brightness(0.6) saturate(1.5)'
                }}
              />
            </div>

            {/* HUGE TEXT + SCROLL CUE */}
            <div style={{ 
              position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
              opacity: (scene3UIVisible && activeScene === 'aboutMe' ? 1 : 0) * Math.max(0, 1 - scene3AboutMeScroll * 4),
              transform: scene3UIVisible && activeScene === 'aboutMe' ? `translateY(${scene3AboutMeScroll * -200}px)` : 'translateY(30px)',
              transition: (activeScene === 'aboutMe' && scene3AboutMeScroll > 0) ? 'none' : 'opacity 0.6s ease, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <AntigravityText 
                text="About Me"
                as="h1"
                style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 16px', fontSize: 'clamp(48px, 10vw, 96px)', lineHeight: 1.2, color: 'rgba(255, 255, 255, 1)', pointerEvents: 'auto' }}
              />
              
              {/* Scroll Cue (desktop only) */}
              <div className="hidden xl:flex" style={{ 
                position: 'absolute', bottom: '36px', left: '50%', transform: 'translateX(-50%)', flexDirection: 'column', alignItems: 'center', gap: '12px',
                opacity: scene3UIVisible && activeScene === 'aboutMe' ? 1 : 0, transition: 'opacity 1s ease 0.9s'
              }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
                  DESCEND
                </span>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'bobUp 1.8s ease-in-out infinite' }}>
                  <ScrollChevron />
                </div>
              </div>
            </div>
          </div>

          {/* SCROLLING CONTENT LAYER */}
          <div style={{ position: 'relative', zIndex: 20, width: '100%', paddingBottom: '15vh' }}>
            {/* Empty space to let the intro text show before scrolling */}
            <div style={{ height: '100vh', pointerEvents: 'none' }} />
            
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              padding: '60px 40px', maxWidth: '800px', margin: '0 auto',
              background: 'rgba(0,10,20,0.5)', backdropFilter: 'blur(12px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 6vw, 54px)', color: '#fff', marginBottom: '24px' }}>
                About Me
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(15px, 2.5vw, 18px)', color: 'rgba(255,255,255,0.9)', lineHeight: '1.6', marginBottom: '32px' }}>
                My name is Clarina, and I serve as the Vice-Principal of Christopher Arts & Science College in Tirunelveli, Tamil Nadu. My work and my life are driven by a deep conviction: women are powerful and strong when they depend on themselves. Because of this, my mission every day is to guide and inspire students to face the world with full confidence and courage.
              </p>

              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 4vw, 32px)', color: '#fff', marginBottom: '16px' }}>
                Interests
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(15px, 2.5vw, 18px)', color: 'rgba(255,255,255,0.9)', lineHeight: '1.6', marginBottom: '32px' }}>
                Outside of my professional responsibilities, I am dedicated to continuous personal growth and exploring new things. I am an avid reader and book reviewer. My personal library includes The Bible, Emotional Intelligence, You Can Win, Stop OverThinking, Alchemist, Ikigai, The Power of Your Subconscious Mind, Who Will Cry When You Die?, The Power of Making Miracles, Atomic Habits, and The 5 A.M. Club. Alongside my love for books, I find balance and creative expression through painting and drawing. My personal perspective is shaped by media and music that inspire faith, strength, and joy.
              </p>

              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 4vw, 32px)', color: '#fff', marginBottom: '16px' }}>
                Favourite Movies and Songs
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(15px, 2.5vw, 18px)', color: 'rgba(255,255,255,0.9)', lineHeight: '1.6', marginBottom: '32px' }}>
                In my free time, I enjoy watching War Room, The Chosen, and Young Sheldon. My favorite music spans Christian Gospel songs and the music of Chris Tomlin, alongside timeless classics from Celine Dion, the Backstreet Boys, and ABBA.
              </p>

              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 3vw, 28px)', color: '#fff', marginBottom: '16px' }}>
                Contact Me
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(15px, 2.5vw, 18px)', color: 'rgba(255,255,255,0.9)', lineHeight: '1.6', marginBottom: '40px' }}>
                Please feel free to reach out via email <strong>drclarinaapchemistrycasc@gmail.com</strong>
              </p>
              
              <button 
                onClick={() => {
                  isRestoringScrollRef.current = true;
                  setActiveScene('main');
                  setTimeout(() => {
                    if (containerRef.current) {
                      const maxScroll = containerRef.current.scrollHeight - window.innerHeight;
                      const targetY = lastScrollY.current > 0 ? lastScrollY.current : maxScroll * 0.60;
                      window.scrollTo({ top: targetY, behavior: 'instant' });
                      setTimeout(() => { isRestoringScrollRef.current = false; }, 1200);
                    }
                  }, 10);
                }}
                style={{
                  padding: '12px 32px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.4)',
                  background: 'transparent', color: '#fff', fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em',
                  textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.3s ease, color 0.3s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#3a2530'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
              >
                Return
              </button>
            </div>
          </div>
        </div>

        </div> {/* End of Translation Wrapper */}
    </div>
  </div>
  );
}