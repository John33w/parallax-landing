import re

with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'r') as f:
    content = f.read()

# 1. Update State
content = content.replace(
    'const [activeScene, setActiveScene] = useState<number>(1);',
    "const [activeScene, setActiveScene] = useState<'main' | 'blogs' | 'aboutMe'>('main');"
)

# 2. Update ArcCardSlider onClick
content = content.replace(
    '''setActiveScene(3);''',
    '''if (title === 'Blogs') setActiveScene('blogs');
              else if (title === 'About Me') setActiveScene('aboutMe');'''
)

# 3. Update the Translation Wrapper logic
content = content.replace(
    "transform: activeScene === 3 ? 'translateY(-100vh)' : 'translateY(0)'",
    "transform: activeScene === 'blogs' ? 'translateY(100vh)' : activeScene === 'aboutMe' ? 'translateY(-100vh)' : 'translateY(0)'"
)

# 4. Replace the old Scene 3 with the two new containers
split_marker = "      </div> {/* End of Translation Wrapper */}"
parts = content.split(split_marker)

new_scenes = """      </div> {/* End of Translation Wrapper */}
        
        {/* SCENE 3: BLOGS (Top Container) */}
        <div style={{ 
          position: 'absolute', bottom: '100vh', width: '100%', height: '100vh', 
          background: '#0a0608',
          overflow: 'hidden'
        }}>
          <img 
            src={WORLD_BG} 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, 
                     transform: activeScene === 'blogs' ? 'translateY(0)' : 'translateY(-10vh)', transition: 'transform 2s ease-out' }}
          />

          <img 
            src={BOTTOM_CLOUDS} 
            style={{ 
              position: 'absolute', bottom: activeScene === 'blogs' ? '-10%' : '10%', left: 0, width: '100%', height: '110%', 
              objectFit: 'cover', transformOrigin: '50% 100%', zIndex: 10,
              transition: 'bottom 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              opacity: activeScene === 'blogs' ? 1 : 0
            }}
          />

          <div style={{ 
            position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            opacity: activeScene === 'blogs' ? 1 : 0, transition: 'opacity 1s ease 0.5s',
            transform: activeScene === 'blogs' ? 'translateY(0)' : 'translateY(-20px)'
          }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(42px, 8vw, 64px)', color: '#fff', marginBottom: '16px' }}>
              Blogs
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(16px, 4vw, 22px)', color: 'rgba(255,255,255,0.85)', maxWidth: '600px', textAlign: 'center' }}>
              A gateway to another mindset. Step right in.
            </p>
            
            <button 
              onClick={() => setActiveScene('main')}
              style={{
                marginTop: '40px', padding: '12px 32px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.4)',
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

        {/* SCENE 3: ABOUT ME (Bottom Container) */}
        <div style={{ 
          position: 'absolute', top: '100vh', width: '100%', height: '100vh', 
          background: '#0a0608',
          overflow: 'hidden'
        }}>
          <img 
            src={WORLD_BG} 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
          />

          <img 
            src={BOTTOM_CLOUDS} 
            style={{ 
              position: 'absolute', bottom: activeScene === 'aboutMe' ? '-20%' : '-40%', left: 0, width: '100%', height: '110%', 
              objectFit: 'cover', transformOrigin: '50% 100%', zIndex: 10,
              transition: 'bottom 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              opacity: activeScene === 'aboutMe' ? 1 : 0
            }}
          />

          <div style={{ 
            position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            opacity: activeScene === 'aboutMe' ? 1 : 0, transition: 'opacity 1s ease 0.5s',
            transform: activeScene === 'aboutMe' ? 'translateY(0)' : 'translateY(20px)'
          }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(42px, 8vw, 64px)', color: '#fff', marginBottom: '16px' }}>
              About Me
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(16px, 4vw, 22px)', color: 'rgba(255,255,255,0.85)', maxWidth: '600px', textAlign: 'center' }}>
              Behind the words, a story unfolds. Step inside.
            </p>
            
            <button 
              onClick={() => setActiveScene('main')}
              style={{
                marginTop: '40px', padding: '12px 32px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.4)',
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

    </div> {/* End of Sticky Container */}
  </div> {/* End of Scroll Container */}
  );
}"""

# Remove the old SCENE 3 from parts[1]
# Everything after `split_marker` in parts[1] up to the end is replaced.
content = parts[0] + new_scenes

with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'w') as f:
    f.write(content)
