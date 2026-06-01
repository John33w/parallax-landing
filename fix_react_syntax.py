import re

with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'r') as f:
    content = f.read()

# We will look for the end of SCENE 2 UI's paragraph.
split_marker = "Stay inspired, stay blessed!\n          </p>\n        </div>"
parts = content.split(split_marker)

new_end = """
      </div> {/* End of Translation Wrapper */}
        
        {/* SCENE 3 CONTAINER */}
        <div style={{ 
          position: 'absolute', top: '100vh', width: '100%', height: '100vh', 
          transform: activeScene === 3 ? 'translateY(-100vh)' : 'translateY(0)', 
          transition: 'transform 1.2s cubic-bezier(0.76, 0, 0.24, 1)',
          background: '#3a2530',
          overflow: 'hidden'
        }}>
          {/* Scene 3 Background */}
          <img 
            src={SCENE3_BG} 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'hue-rotate(-40deg) saturate(0.8) brightness(0.7)', zIndex: 0 }}
          />

          {/* Scene 3 Clouds / Foreground */}
          <img 
            src={SCENE3_CLOUDS} 
            style={{ 
              position: 'absolute', bottom: activeScene === 3 ? '-10%' : '-30%', left: 0, width: '100%', height: '110%', 
              objectFit: 'cover', transformOrigin: '50% 100%', zIndex: 10,
              filter: 'hue-rotate(340deg) saturate(1.2) brightness(0.9)',
              transition: 'bottom 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
              opacity: activeScene === 3 ? 1 : 0
            }}
          />

          {/* Scene 3 Content Box */}
          <div style={{ 
            position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            opacity: activeScene === 3 ? 1 : 0, transition: 'opacity 1s ease 1s'
          }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(42px, 8vw, 64px)', color: '#fff', marginBottom: '16px' }}>
              Another Mindset
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(16px, 4vw, 22px)', color: 'rgba(255,255,255,0.85)', maxWidth: '600px', textAlign: 'center' }}>
              Welcome to the inner sanctuary. Here, the boundaries of thought expand.
            </p>
            
            <button 
              onClick={() => setActiveScene(1)}
              style={{
                marginTop: '40px',
                padding: '12px 32px',
                borderRadius: '30px',
                border: '1px solid rgba(255,255,255,0.4)',
                background: 'transparent',
                color: '#fff',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'background 0.3s ease, color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = '#3a2530';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#fff';
              }}
            >
              Return
            </button>
          </div>

        </div>

    </div> {/* End of Sticky Container */}
  </div> {/* End of Scroll Container */}
  );
}
"""

content = parts[0] + split_marker + new_end

with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'w') as f:
    f.write(content)
