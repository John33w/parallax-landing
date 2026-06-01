import re

with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add refs for Scene 3 layers
if "scene3BlogsBgRef" not in content:
    content = content.replace(
        "const curtainRRef = useRef<HTMLImageElement>(null);",
        "const curtainRRef = useRef<HTMLImageElement>(null);\n  const scene3BlogsBgRef = useRef<HTMLDivElement>(null);\n  const scene3BlogsCloudsRef = useRef<HTMLDivElement>(null);\n  const scene3AboutMeBgRef = useRef<HTMLDivElement>(null);\n  const scene3AboutMeCloudsRef = useRef<HTMLDivElement>(null);"
    )

# 2. Update `updateParallax` function
parallax_updates = """      if (curtainRRef.current) {
        curtainRRef.current.style.transform = `translate(${mx * 14 + shiftR}px, ${my * 14}px)`;
      }
      
      // Scene 3 Parallax
      if (scene3BlogsBgRef.current) {
        scene3BlogsBgRef.current.style.transform = `translate(${mx * 6}px, ${my * 6}px)`;
      }
      if (scene3BlogsCloudsRef.current) {
        scene3BlogsCloudsRef.current.style.transform = `translate(${mx * 9}px, ${my * 9 * 0.4}px)`;
      }
      if (scene3AboutMeBgRef.current) {
        scene3AboutMeBgRef.current.style.transform = `translate(${mx * 6}px, ${my * 6}px)`;
      }
      if (scene3AboutMeCloudsRef.current) {
        scene3AboutMeCloudsRef.current.style.transform = `translate(${mx * 9}px, ${my * 9 * 0.4}px)`;
      }"""
content = content.replace(
"""      if (curtainRRef.current) {
        curtainRRef.current.style.transform = `translate(${mx * 14 + shiftR}px, ${my * 14}px)`;
      }""", parallax_updates)

# 3. Update Blogs to wrap BG and Clouds in divs and pass Refs
blogs_bg_old = """          <img 
            src={SCENE3_BG} 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, 
                     transform: activeScene === 'blogs' ? 'scale(1.1) translateY(5vh)' : 'scale(1) translateY(0)', transition: 'transform 4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />"""
blogs_bg_new = """          <div ref={scene3BlogsBgRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}>
            <img 
              src={SCENE3_BG} 
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                       transform: activeScene === 'blogs' ? 'scale(1.1) translateY(5vh)' : 'scale(1) translateY(0)', transition: 'transform 4s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </div>"""
content = content.replace(blogs_bg_old, blogs_bg_new)

blogs_clouds_old = """          <img 
            src={SCENE3_CLOUDS} 
            style={{ 
              position: 'absolute', bottom: scene3CloudsAnim && activeScene === 'blogs' ? '-5%' : '35%', left: 0, width: '100%', height: '110%', 
              objectFit: 'cover', transformOrigin: '50% 100%', zIndex: 10,
              transition: scene3EntranceDone ? 'none' : 'bottom 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: activeScene === 'blogs' ? 1 : 0,
              filter: 'hue-rotate(-120deg) brightness(0.6) saturate(1.5)'
            }}
          />"""
blogs_clouds_new = """          <div ref={scene3BlogsCloudsRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10 }}>
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
          </div>"""
content = content.replace(blogs_clouds_old, blogs_clouds_new)

# 4. Update About Me to wrap BG and Clouds in divs and pass Refs, AND replace text
aboutme_bg_old = """          <img 
            src={SCENE3_BG} 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0,
                     transform: activeScene === 'aboutMe' ? 'scale(1.1) translateY(-5vh)' : 'scale(1) translateY(0)', transition: 'transform 4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />"""
aboutme_bg_new = """          <div ref={scene3AboutMeBgRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}>
            <img 
              src={SCENE3_BG} 
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                       transform: activeScene === 'aboutMe' ? 'scale(1.1) translateY(-5vh)' : 'scale(1) translateY(0)', transition: 'transform 4s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </div>"""
content = content.replace(aboutme_bg_old, aboutme_bg_new)

aboutme_clouds_old = """          <img 
            src={SCENE3_CLOUDS} 
            style={{ 
              position: 'absolute', bottom: scene3CloudsAnim && activeScene === 'aboutMe' ? '-5%' : '35%', left: 0, width: '100%', height: '110%', 
              objectFit: 'cover', transformOrigin: '50% 100%', zIndex: 10,
              transition: scene3EntranceDone ? 'none' : 'bottom 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: activeScene === 'aboutMe' ? 1 : 0,
              filter: 'hue-rotate(-120deg) brightness(0.6) saturate(1.5)'
            }}
          />"""
aboutme_clouds_new = """          <div ref={scene3AboutMeCloudsRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10 }}>
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
          </div>"""
content = content.replace(aboutme_clouds_old, aboutme_clouds_new)

# Update the About Me text
aboutme_ui_old = """            <h2 style={{ 
              fontFamily: "'Playfair Display', serif", fontSize: 'clamp(42px, 8vw, 64px)', color: '#fff', marginBottom: '16px',
              opacity: scene3UIVisible && activeScene === 'aboutMe' ? 1 : 0, transform: scene3UIVisible && activeScene === 'aboutMe' ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 1s ease 0.3s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s'
            }}>
              About Me
            </h2>
            <p style={{ 
              fontFamily: "'Inter', sans-serif", fontSize: 'clamp(16px, 4vw, 22px)', color: 'rgba(255,255,255,0.85)', maxWidth: '600px', textAlign: 'center',
              opacity: scene3UIVisible && activeScene === 'aboutMe' ? 1 : 0, transform: scene3UIVisible && activeScene === 'aboutMe' ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 1s ease 0.55s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.55s'
            }}>
              Behind the words, a story unfolds. Step inside.
            </p>"""

aboutme_ui_new = """            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', 
              maxHeight: '70vh', overflowY: 'auto', padding: '20px', maxWidth: '800px',
              opacity: scene3UIVisible && activeScene === 'aboutMe' ? 1 : 0, 
              transform: scene3UIVisible && activeScene === 'aboutMe' ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 1s ease 0.3s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
              // hide scrollbar styling
              scrollbarWidth: 'none', msOverflowStyle: 'none'
            }}>
              <style>{`
                .about-me-container::-webkit-scrollbar { display: none; }
              `}</style>
              <div className="about-me-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
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
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(15px, 2.5vw, 18px)', color: 'rgba(255,255,255,0.9)', lineHeight: '1.6' }}>
                  Please feel free to reach out via email <strong>drclarinaapchemistrycasc@gmail.com</strong>
                </p>
              </div>
            </div>"""

content = content.replace(aboutme_ui_old, aboutme_ui_new)

with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'w') as f:
    f.write(content)
