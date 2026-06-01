import re

with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'r') as f:
    content = f.read()

# 1. Update the images in Scene 3
# The top container (Blogs)
blogs_bg_target = """<img 
            src={WORLD_BG} 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, 
                     transform: activeScene === 'blogs' ? 'translateY(0)' : 'translateY(-10vh)', transition: 'transform 2s ease-out' }}
          />"""
blogs_bg_replacement = """<img 
            src={SCENE3_BG} 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, 
                     transform: activeScene === 'blogs' ? 'scale(1.1) translateY(5vh)' : 'scale(1) translateY(0)', transition: 'transform 4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />"""
content = content.replace(blogs_bg_target, blogs_bg_replacement)

blogs_clouds_target = """<img 
            src={BOTTOM_CLOUDS} 
            style={{ 
              position: 'absolute', bottom: activeScene === 'blogs' ? '-10%' : '10%', left: 0, width: '100%', height: '110%', 
              objectFit: 'cover', transformOrigin: '50% 100%', zIndex: 10,
              transition: 'bottom 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              opacity: activeScene === 'blogs' ? 1 : 0
            }}
          />"""
blogs_clouds_replacement = """<img 
            src={SCENE3_CLOUDS} 
            style={{ 
              position: 'absolute', bottom: activeScene === 'blogs' ? '-5%' : '5%', left: 0, width: '100%', height: '110%', 
              objectFit: 'cover', transformOrigin: '50% 100%', zIndex: 10,
              transition: 'bottom 3s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
              opacity: activeScene === 'blogs' ? 1 : 0
            }}
          />"""
content = content.replace(blogs_clouds_target, blogs_clouds_replacement)

# The bottom container (About Me)
aboutme_bg_target = """<img 
            src={WORLD_BG} 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
          />"""
aboutme_bg_replacement = """<img 
            src={SCENE3_BG} 
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0,
                     transform: activeScene === 'aboutMe' ? 'scale(1.1) translateY(-5vh)' : 'scale(1) translateY(0)', transition: 'transform 4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />"""
content = content.replace(aboutme_bg_target, aboutme_bg_replacement)

aboutme_clouds_target = """<img 
            src={BOTTOM_CLOUDS} 
            style={{ 
              position: 'absolute', bottom: activeScene === 'aboutMe' ? '-20%' : '-40%', left: 0, width: '100%', height: '110%', 
              objectFit: 'cover', transformOrigin: '50% 100%', zIndex: 10,
              transition: 'bottom 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              opacity: activeScene === 'aboutMe' ? 1 : 0
            }}
          />"""
aboutme_clouds_replacement = """<img 
            src={SCENE3_CLOUDS} 
            style={{ 
              position: 'absolute', bottom: activeScene === 'aboutMe' ? '-5%' : '-15%', left: 0, width: '100%', height: '110%', 
              objectFit: 'cover', transformOrigin: '50% 100%', zIndex: 10,
              transition: 'bottom 3s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
              opacity: activeScene === 'aboutMe' ? 1 : 0
            }}
          />"""
content = content.replace(aboutme_clouds_target, aboutme_clouds_replacement)


# 2. Add scroll lock effect
scroll_lock_code = """
  // Lock scroll when not in main scene
  useEffect(() => {
    if (activeScene !== 'main') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [activeScene]);
"""

if "document.body.style.overflow" not in content:
    # Insert it right after the scrollProgress state
    content = content.replace(
        "const [activeScene, setActiveScene] = useState<'main' | 'blogs' | 'aboutMe'>('main');",
        "const [activeScene, setActiveScene] = useState<'main' | 'blogs' | 'aboutMe'>('main');" + scroll_lock_code
    )

with open('/Users/christ/antigravity projects/parallax-landing/src/App.tsx', 'w') as f:
    f.write(content)
