import re

with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add state variables
state_vars = """
  const [scene3CloudsAnim, setScene3CloudsAnim] = useState(false);
  const [scene3UIVisible, setScene3UIVisible] = useState(false);
  const [scene3EntranceDone, setScene3EntranceDone] = useState(false);

  useEffect(() => {
    if (activeScene !== 'main') {
      const t1 = setTimeout(() => setScene3CloudsAnim(true), 100);
      const t2 = setTimeout(() => setScene3UIVisible(true), 600);
      const t3 = setTimeout(() => setScene3EntranceDone(true), 2200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setScene3CloudsAnim(false);
      setScene3UIVisible(false);
      setScene3EntranceDone(false);
    }
  }, [activeScene]);
"""
if "const [scene3CloudsAnim" not in content:
    content = content.replace(
        "const [curtainsOpen, setCurtainsOpen] = useState(false);",
        "const [curtainsOpen, setCurtainsOpen] = useState(false);\n" + state_vars
    )

# 2. Replace BLOGS container
blogs_pattern = re.compile(r'\{/\* SCENE 3: BLOGS \(Top Container\) \*/\}(.*?)\{/\* SCENE 3: ABOUT ME \(Bottom Container\) \*/\}', re.DOTALL)
blogs_replacement = """{/* SCENE 3: BLOGS (Top Container) */}
        <div style={{ 
          position: 'absolute', bottom: '100vh', width: '100%', height: '100vh', 
          background: '#0a0608',
          overflow: 'hidden'
        }}>
          <img 
            src={SCENE3_BG} 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, 
                     transform: activeScene === 'blogs' ? 'scale(1.1) translateY(5vh)' : 'scale(1) translateY(0)', transition: 'transform 4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
          {/* Dark Overlay to make background darker */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,10,20,0.4)', zIndex: 5, pointerEvents: 'none' }} />

          <img 
            src={SCENE3_CLOUDS} 
            style={{ 
              position: 'absolute', bottom: scene3CloudsAnim && activeScene === 'blogs' ? '-5%' : '35%', left: 0, width: '100%', height: '110%', 
              objectFit: 'cover', transformOrigin: '50% 100%', zIndex: 10,
              transition: scene3EntranceDone ? 'none' : 'bottom 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: activeScene === 'blogs' ? 1 : 0,
              filter: 'hue-rotate(-120deg) brightness(0.6) saturate(1.5)'
            }}
          />

          <div style={{ 
            position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <h2 style={{ 
              fontFamily: "'Playfair Display', serif", fontSize: 'clamp(42px, 8vw, 64px)', color: '#fff', marginBottom: '16px',
              opacity: scene3UIVisible && activeScene === 'blogs' ? 1 : 0, transform: scene3UIVisible && activeScene === 'blogs' ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 1s ease 0.3s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s'
            }}>
              Blogs
            </h2>
            <p style={{ 
              fontFamily: "'Inter', sans-serif", fontSize: 'clamp(16px, 4vw, 22px)', color: 'rgba(255,255,255,0.85)', maxWidth: '600px', textAlign: 'center',
              opacity: scene3UIVisible && activeScene === 'blogs' ? 1 : 0, transform: scene3UIVisible && activeScene === 'blogs' ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 1s ease 0.55s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.55s'
            }}>
              A gateway to another mindset. Step right in.
            </p>
            
            <button 
              onClick={() => setActiveScene('main')}
              style={{
                marginTop: '40px', padding: '12px 32px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.4)',
                background: 'transparent', color: '#fff', fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em',
                textTransform: 'uppercase', cursor: 'pointer',
                opacity: scene3UIVisible && activeScene === 'blogs' ? 1 : 0, transform: scene3UIVisible && activeScene === 'blogs' ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 1s ease 0.8s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s, background 0.3s ease, color 0.3s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#3a2530'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
            >
              Return
            </button>
          </div>
        </div>

        {/* SCENE 3: ABOUT ME (Bottom Container) */}"""
content = blogs_pattern.sub(blogs_replacement, content)

# 3. Replace ABOUT ME container
aboutme_pattern = re.compile(r'\{/\* SCENE 3: ABOUT ME \(Bottom Container\) \*/\}(.*?)\{/\* End of Translation Wrapper \*/\}', re.DOTALL)
aboutme_replacement = """{/* SCENE 3: ABOUT ME (Bottom Container) */}
        <div style={{ 
          position: 'absolute', top: '100vh', width: '100%', height: '100vh', 
          background: '#0a0608',
          overflow: 'hidden'
        }}>
          <img 
            src={SCENE3_BG} 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0,
                     transform: activeScene === 'aboutMe' ? 'scale(1.1) translateY(-5vh)' : 'scale(1) translateY(0)', transition: 'transform 4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
          {/* Dark Overlay to make background darker */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,10,20,0.4)', zIndex: 5, pointerEvents: 'none' }} />

          <img 
            src={SCENE3_CLOUDS} 
            style={{ 
              position: 'absolute', bottom: scene3CloudsAnim && activeScene === 'aboutMe' ? '-5%' : '35%', left: 0, width: '100%', height: '110%', 
              objectFit: 'cover', transformOrigin: '50% 100%', zIndex: 10,
              transition: scene3EntranceDone ? 'none' : 'bottom 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: activeScene === 'aboutMe' ? 1 : 0,
              filter: 'hue-rotate(-120deg) brightness(0.6) saturate(1.5)'
            }}
          />

          <div style={{ 
            position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <h2 style={{ 
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
            </p>
            
            <button 
              onClick={() => setActiveScene('main')}
              style={{
                marginTop: '40px', padding: '12px 32px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.4)',
                background: 'transparent', color: '#fff', fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em',
                textTransform: 'uppercase', cursor: 'pointer',
                opacity: scene3UIVisible && activeScene === 'aboutMe' ? 1 : 0, transform: scene3UIVisible && activeScene === 'aboutMe' ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 1s ease 0.8s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s, background 0.3s ease, color 0.3s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#3a2530'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
            >
              Return
            </button>
          </div>
        </div>

        {/* End of Translation Wrapper */}"""
content = aboutme_pattern.sub(aboutme_replacement, content)


with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'w') as f:
    f.write(content)
