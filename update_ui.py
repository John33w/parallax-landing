import re

with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'r') as f:
    content = f.read()

# 1. Update ArcCardSlider fonts and line heights
content = content.replace(
    '''              color: 'rgba(80,50,60,0.6)',
              fontFamily: "'Imprima', sans-serif",
              fontSize: '10px'
            }}>''',
    '''              color: 'rgba(80,50,60,0.6)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px'
            }}>'''
)

content = content.replace(
    '''            <h3 style={{
              fontFamily: "'Viaoda Libre', serif",
              fontSize: isMobile ? '22px' : '30px',
              color: '#3a2530',
              margin: '0 0 4px 0',
              lineHeight: 1
            }}>{card.title}</h3>''',
    '''            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? '22px' : '30px',
              color: '#3a2530',
              margin: '0 0 4px 0',
              lineHeight: 1.2
            }}>{card.title}</h3>'''
)

content = content.replace(
    '''            <p style={{
              fontFamily: "'Imprima', sans-serif",
              fontSize: isMobile ? '12px' : '15px',
              color: 'rgba(58,37,48,0.65)',
              margin: 0,
              lineHeight: 1.3
            }}>{card.desc}</p>''',
    '''            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: isMobile ? '12px' : '14px',
              color: 'rgba(58,37,48,0.85)',
              margin: 0,
              lineHeight: 1.5
            }}>{card.desc}</p>'''
)

# 2. Update Nav Link Style
content = content.replace(
    '''  const navLinkStyle: CSSProperties = {
    fontFamily: "'Imprima', sans-serif",
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#fff',
    opacity: 0.9,
    textDecoration: 'none',
    cursor: 'pointer'
  };''',
    '''  const navLinkStyle: CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.85)',
    textDecoration: 'none',
    cursor: 'pointer'
  };'''
)

# 3. Replace SCENE 1 UI and SCENE 2 UI entirely
scene1_2_regex = r"\{\/\*\s*SCENE 1 UI\s*\*\/\}.*?(?=\<\/div\>\s*\<\/div\>\s*\)\;\s*\})"
scene_replacement = """{/* SCENE 1 UI */}
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
"""

new_content = re.sub(scene1_2_regex, scene_replacement, content, flags=re.DOTALL)

with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'w') as f:
    f.write(new_content)
