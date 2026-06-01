import re

with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add scroll states and refs if they don't exist
if "const [scene3BlogsScroll" not in content:
    content = content.replace(
        "const [scene3EntranceDone, setScene3EntranceDone] = useState(false);",
        """const [scene3EntranceDone, setScene3EntranceDone] = useState(false);
  const [scene3BlogsScroll, setScene3BlogsScroll] = useState(0);
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
  }, [activeScene]);"""
    )


# 2. Update SCENE 3 BLOGS container
blogs_pattern = re.compile(r'\{/\* SCENE 3: BLOGS \(Top Container\) \*/\}(.*?)\{/\* SCENE 3: ABOUT ME \(Bottom Container\) \*/\}', re.DOTALL)
blogs_replacement = """{/* SCENE 3: BLOGS (Top Container) */}
        <div 
          ref={scene3BlogsContainerRef}
          onScroll={(e) => setScene3BlogsScroll(Math.min(e.currentTarget.scrollTop / window.innerHeight, 1))}
          style={{ 
            position: 'absolute', bottom: '100vh', width: '100%', height: '100vh', 
            background: '#0a0608',
            overflowY: activeScene === 'blogs' ? 'auto' : 'hidden', overflowX: 'hidden'
          }}>
          
          {/* STICKY BACKGROUND & INTRO */}
          <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', zIndex: 0 }}>
            <div ref={scene3BlogsBgRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}>
              <img 
                src={SCENE3_BG} 
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                         transform: activeScene === 'blogs' ? 'scale(1.1) translateY(5vh)' : 'scale(1) translateY(0)', transition: 'transform 4s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,10,20,0.4)', zIndex: 5, pointerEvents: 'none' }} />

            {/* Clouds (Moves down and fades out on scroll) */}
            <div ref={scene3BlogsCloudsRef} style={{ 
              position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 30,
              opacity: 1 - scene3BlogsScroll * 1.5,
              transform: `translateY(${scene3BlogsScroll * 200}px)`,
              pointerEvents: 'none'
            }}>
              <img 
                src={SCENE3_CLOUDS} 
                style={{ 
                  position: 'absolute', bottom: scene3CloudsAnim && activeScene === 'blogs' ? '-5%' : '35%', left: 0, width: '100%', height: '110%', 
                  objectFit: 'cover', transformOrigin: '50% 100%',
                  transition: scene3EntranceDone ? 'none' : 'bottom 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  opacity: activeScene === 'blogs' ? 1 : 0,
                  filter: 'hue-rotate(-120deg) brightness(0.6) saturate(1.5)'
                }}
              />
            </div>

            {/* HUGE TEXT + SCROLL CUE */}
            <div style={{ 
              position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
              opacity: (scene3UIVisible && activeScene === 'blogs' ? 1 : 0) * (1 - scene3BlogsScroll * 2),
              transform: scene3UIVisible && activeScene === 'blogs' ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 1s ease 0.3s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s'
            }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 16px', fontSize: 'clamp(48px, 10vw, 96px)', lineHeight: 1.2, color: 'rgba(255, 255, 255, 1)' }}>
                Blogs
              </h1>
              
              {/* Scroll Cue (desktop only) */}
              <div className="hidden xl:flex" style={{ 
                position: 'absolute', bottom: '36px', left: '50%', transform: 'translateX(-50%)', flexDirection: 'column', alignItems: 'center', gap: '12px',
                opacity: scene3UIVisible && activeScene === 'blogs' ? 1 : 0, transition: 'opacity 1s ease 0.9s'
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
              display: 'flex', flexDirection: 'column', alignItems: 'center', 
              padding: '40px 20px', maxWidth: '800px', margin: '0 auto',
              background: 'rgba(0,10,20,0.5)', backdropFilter: 'blur(12px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <p style={{ 
                fontFamily: "'Inter', sans-serif", fontSize: 'clamp(16px, 4vw, 22px)', color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: '40px'
              }}>
                A gateway to another mindset. Step right in.
              </p>
              
              <button 
                onClick={() => setActiveScene('main')}
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

        {/* SCENE 3: ABOUT ME (Bottom Container) */}"""
content = blogs_pattern.sub(blogs_replacement, content)

# 3. Update SCENE 3 ABOUT ME container
aboutme_pattern = re.compile(r'\{/\* SCENE 3: ABOUT ME \(Bottom Container\) \*/\}(.*?)\{/\* End of Translation Wrapper \*/\}', re.DOTALL)
aboutme_replacement = """{/* SCENE 3: ABOUT ME (Bottom Container) */}
        <div 
          ref={scene3AboutMeContainerRef}
          onScroll={(e) => setScene3AboutMeScroll(Math.min(e.currentTarget.scrollTop / window.innerHeight, 1))}
          style={{ 
            position: 'absolute', top: '100vh', width: '100%', height: '100vh', 
            background: '#0a0608',
            overflowY: activeScene === 'aboutMe' ? 'auto' : 'hidden', overflowX: 'hidden'
          }}>
          
          {/* STICKY BACKGROUND & INTRO */}
          <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', zIndex: 0 }}>
            <div ref={scene3AboutMeBgRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}>
              <img 
                src={SCENE3_BG} 
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                         transform: activeScene === 'aboutMe' ? 'scale(1.1) translateY(-5vh)' : 'scale(1) translateY(0)', transition: 'transform 4s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,10,20,0.4)', zIndex: 5, pointerEvents: 'none' }} />

            {/* Clouds (Moves down and fades out on scroll) */}
            <div ref={scene3AboutMeCloudsRef} style={{ 
              position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 30,
              opacity: 1 - scene3AboutMeScroll * 1.5,
              transform: `translateY(${scene3AboutMeScroll * 200}px)`,
              pointerEvents: 'none'
            }}>
              <img 
                src={SCENE3_CLOUDS} 
                style={{ 
                  position: 'absolute', bottom: scene3CloudsAnim && activeScene === 'aboutMe' ? '-5%' : '35%', left: 0, width: '100%', height: '110%', 
                  objectFit: 'cover', transformOrigin: '50% 100%',
                  transition: scene3EntranceDone ? 'none' : 'bottom 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  opacity: activeScene === 'aboutMe' ? 1 : 0,
                  filter: 'hue-rotate(-120deg) brightness(0.6) saturate(1.5)'
                }}
              />
            </div>

            {/* HUGE TEXT + SCROLL CUE */}
            <div style={{ 
              position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
              opacity: (scene3UIVisible && activeScene === 'aboutMe' ? 1 : 0) * (1 - scene3AboutMeScroll * 2),
              transform: scene3UIVisible && activeScene === 'aboutMe' ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 1s ease 0.3s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s'
            }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 16px', fontSize: 'clamp(48px, 10vw, 96px)', lineHeight: 1.2, color: 'rgba(255, 255, 255, 1)' }}>
                About Me
              </h1>
              
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
                onClick={() => setActiveScene('main')}
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

        {/* End of Translation Wrapper */}"""
content = aboutme_pattern.sub(aboutme_replacement, content)

with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'w') as f:
    f.write(content)
