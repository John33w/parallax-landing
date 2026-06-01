import re

with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add SCENE3 assets
if "const SCENE3_BG" not in content:
    content = content.replace(
        'const BOTTOM_CLOUDS = "/bottom-clouds.png";',
        'const BOTTOM_CLOUDS = "/bottom-clouds.png";\nconst SCENE3_BG = "/scene3_bg.png";\nconst SCENE3_CLOUDS = "/scene3_clouds.png";'
    )

# 2. Update ArcCardSlider signature and onClick
content = content.replace(
    'const ArcCardSlider = ({ cards, rotationOffset, isMobile }: { cards: any[], rotationOffset: number, isMobile: boolean }) => {',
    'const ArcCardSlider = ({ cards, rotationOffset, isMobile, onCardClick }: { cards: any[], rotationOffset: number, isMobile: boolean, onCardClick?: (title: string) => void }) => {'
)

# 3. Add onClick to ArcCardSlider card div
content = content.replace(
    '''            }}
          >
            <div style={{
              position: 'absolute',''',
    '''              cursor: (card.title === 'Blogs' || card.title === 'About Me') ? 'pointer' : 'default',
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
              position: 'absolute','''
)

# 4. Update App() state
if "const [activeScene, setActiveScene] = useState<number>(1);" not in content:
    content = content.replace(
        'export default function App() {',
        'export default function App() {\n  const [activeScene, setActiveScene] = useState<number>(1);'
    )

# 5. Pass onCardClick
content = content.replace(
    '<ArcCardSlider cards={SCENE2_CARDS} rotationOffset={rotationOffset} isMobile={isMobile} />',
    '''<ArcCardSlider cards={SCENE2_CARDS} rotationOffset={rotationOffset} isMobile={isMobile} onCardClick={(title) => {
            if (title === 'Blogs' || title === 'About Me') {
              setActiveScene(3);
            }
          }} />'''
)

# 6. Restructure the return statement to include Scene 3
old_sticky = "<div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#0a0608' }}>"
new_sticky = """<div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#0a0608' }}>
        <div style={{ position: 'absolute', inset: 0, transform: activeScene === 3 ? 'translateY(-100vh)' : 'translateY(0)', transition: 'transform 1.2s cubic-bezier(0.76, 0, 0.24, 1)' }}>"""
content = content.replace(old_sticky, new_sticky)

# Properly append to the end of the file
# We'll split the string at the very last `  );\n}` and insert our code.
parts = content.rsplit('  );\n}', 1)

new_end = """        </div>
        
        {/* SCENE 3 CONTAINER */}
        <div style={{ 
          position: 'absolute', top: '100vh', width: '100%', height: '100vh', 
          transform: activeScene === 3 ? 'translateY(-100vh)' : 'translateY(0)', 
          transition: 'transform 1.2s cubic-bezier(0.76, 0, 0.24, 1)',
          background: '#3a2530'
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

      </div>
  );
}"""

content = parts[0] + new_end

with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'w') as f:
    f.write(content)
