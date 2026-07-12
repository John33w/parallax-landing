import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaInstagram, FaEnvelope } from 'react-icons/fa';
import { FaThreads } from 'react-icons/fa6';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navigation, { MagneticButton } from '../components/Navigation';
import OrganicWipe from '../components/OrganicWipe';
import TextReveal from '../components/TextReveal';
import ScrollPathAnimation from '../components/ScrollPathAnimation';
import { InteractiveGrid } from '../components/InteractiveGrid';
import { usePreloader } from '../context/PreloaderContext';

export default function LandingPage() {
  const showPreloader = usePreloader();
  const [marqueeTitles, setMarqueeTitles] = useState("COME AND DINE\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0");

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const postsRef = collection(db, 'posts');
        // Fetch all published to avoid requiring a composite index
        const q = query(postsRef, where('status', '==', 'published'));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const posts = snapshot.docs.map(doc => doc.data());
          // Sort descending by date
          posts.sort((a, b) => {
            const dateA = a.publishDate || a.createdAt || '';
            const dateB = b.publishDate || b.createdAt || '';
            return dateB.localeCompare(dateA);
          });
          const allTitles = posts.map(post => post.title.toUpperCase()).join('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0');
          setMarqueeTitles(`${allTitles}\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`);
        } else {
          setMarqueeTitles("COME AND DINE\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0");
        }
      } catch (error) {
        console.error("Error fetching latest post:", error);
        setMarqueeTitles("COME AND DINE\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0");
      }
    };
    fetchLatestPost();
  }, []);

  // Framer Motion scroll hooks
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const yHero = useTransform(scrollYProgress, [0, 0.2], [0, -100]);

  // Social Links mapping
  const socialLinks = [
    { icon: <FaInstagram size={24} />, href: "https://www.instagram.com/clarina_tj/" },
    { icon: <FaThreads size={24} />, href: "https://www.threads.com/@clarina_tj?xmt=AQG0JsQ-yPLovVafHwV9dO80EnI6xNXIY8JwSSkG6Kesa48" },
    { icon: <FaEnvelope size={24} />, href: "mailto:drclarinaapchemistrycasc@gmail.com" },
  ];

  return (
    <div className="bg-[#E8E8E5] min-h-screen text-black font-cabinetGrotesk relative overflow-x-clip">
      
      {/* Sticky Hero Wrapper */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden z-0">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: showPreloader ? 0 : 1 }} 
          transition={{ duration: 0.8, delay: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-0 pointer-events-none z-50"
        >
          <div className="pointer-events-auto">
            <Navigation absolute />
          </div>

          {/* Left Social Links */}
          <div className="absolute bottom-6 left-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-8 flex flex-col gap-4 md:gap-8 pointer-events-auto origin-bottom-left scale-75 md:scale-100">
            {socialLinks.map((link, idx) => (
              <a key={idx} href={link.href} target="_blank" rel="noopener noreferrer" className="text-[#111111] hover:scale-110 transition-transform duration-300">
                {link.icon}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Hero Section Content */}
        <motion.div 
          style={{ opacity: opacityHero, y: yHero }}
          className="h-full flex flex-col justify-center items-center px-4"
        >
          <div className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto h-full pb-24 md:pb-32 pt-32">
            
            {/* Center Titles */}
            <div className="flex flex-col items-center text-center z-10 w-full max-w-5xl">
              <div className="overflow-hidden mb-4 flex justify-center">
                <h1 className="flex text-[4rem] sm:text-[5rem] md:text-[6rem] lg:text-[7rem] xl:text-[8rem] leading-none font-playfair font-bold text-black tracking-wide">
                  {"RinaWrites".split('').map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ y: "100%" }}
                      animate={{ y: showPreloader ? "100%" : "0%" }}
                      transition={{ 
                        duration: 0.8, 
                        ease: [0.76, 0, 0.24, 1], 
                        delay: i * 0.04 
                      }}
                      className="flex items-center whitespace-pre"
                    >
                      {char}
                    </motion.span>
                  ))}
                </h1>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: showPreloader ? 0 : 1 }}
                transition={{ duration: 0.8, delay: 1.2, ease: [0.76, 0, 0.24, 1] }}
                className="overflow-hidden"
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-[1.3] font-bold text-black/80 font-cabinetGrotesk">
                  if you Believe in Yourself anything is Possible
                </h2>
              </motion.div>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: showPreloader ? 0 : 1 }}
            transition={{ duration: 0.8, delay: 1.2, ease: [0.76, 0, 0.24, 1] }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-black/60 z-10"
          >
            <span className="lowercase tracking-wider text-sm sm:text-base font-cabinetGrotesk">scroll down to explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-[1.5px] h-8 bg-black/30"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Combined Scrollable Sections */}
      <div className="relative w-full mt-24">
        {/* SVG Animation Layer spans both sections */}
        <ScrollPathAnimation />

        {/* About Section (Dark) */}
        <div id="about-section" className="relative text-white py-32 md:py-48 px-4 sm:px-8 md:px-16 w-full min-h-screen flex items-center z-20">
          <div className="absolute inset-0 bg-[#1c1c1c] z-0"></div>
          <InteractiveGrid />
          <div className="absolute top-0 left-0 w-full pointer-events-none z-10">
            <OrganicWipe color="#1c1c1c" triggerId="about-section" />
          </div>
          
          <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
            <div className="w-full mb-16 flex flex-col items-center gap-12">
              <TextReveal 
                text="Hi, I’m Clarina, a creative chemistry professor who loves decoding complex elements and a book lover at heart, always seeking out new knowledge through the pages of a great narrative." 
                className="text-3xl md:text-4xl lg:text-[44px] text-[#f5f5f5] font-cabinetGrotesk leading-[1.4] font-light tracking-wide" 
                playEveryTime
              />
              <TextReveal 
                text="I love sharing thoughtful insights, reviews, and personal reflections through my online writing." 
                className="text-xl md:text-2xl text-white/70 font-cabinetGrotesk leading-relaxed max-w-3xl" 
                playEveryTime
              />
            </div>

            <MagneticButton to="/about" className="text-xl px-8 py-3 mt-4 !flex w-auto mx-auto justify-center">
              About Me
            </MagneticButton>
          </div>
        </div>

        {/* Writings Section (Now Dark) */}
        <div id="writings-section" className="relative text-white py-32 md:py-48 w-full min-h-screen flex items-center z-10">
          <div className="absolute inset-0 bg-[#1c1c1c] z-0"></div>
          <InteractiveGrid />
          

          
          <div className="relative z-20 w-full flex flex-col items-center justify-center text-center">
            
            <div className="w-full max-w-4xl mx-auto mb-16 flex flex-col items-center gap-12 px-4 sm:px-8 md:px-16">
              <TextReveal 
                text="Explore my writings" 
                className="text-4xl md:text-5xl lg:text-6xl font-light font-cabinetGrotesk block text-[#f5f5f5]" 
                playEveryTime
              />
              <TextReveal 
                text="A gateway to another mindset. Step right in and explore thoughts, reflections, and stories from the journey." 
                className="text-xl md:text-2xl font-light leading-relaxed max-w-3xl text-white/80" 
                playEveryTime 
                delay={0.3}
              />

              {/* Infinite Marquee */}
              {marqueeTitles && (
                <div className="relative w-full overflow-hidden whitespace-nowrap flex mt-4 border-y border-white/10 py-3 opacity-80" style={{ transform: 'translateZ(0)' }}>
                  <motion.div 
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ ease: "linear", duration: 200, repeat: Infinity }}
                    className="flex whitespace-nowrap w-max"
                  >
                    <div className="flex-shrink-0 flex items-center pr-8">
                      <span className="text-sm md:text-base font-cabinetGrotesk text-main tracking-widest">{Array(6).fill(marqueeTitles).join('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0')}</span>
                    </div>
                    <div className="flex-shrink-0 flex items-center pr-8">
                      <span className="text-sm md:text-base font-cabinetGrotesk text-main tracking-widest">{Array(6).fill(marqueeTitles).join('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0')}</span>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>

            <MagneticButton to="/blog" className="text-xl px-8 py-3 !flex w-auto mx-auto justify-center">
              Blogs
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
}