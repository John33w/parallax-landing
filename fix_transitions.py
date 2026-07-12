import re

with open("src/pages/LandingPage.tsx", "r") as f:
    content = f.read()

# Fix 1: transform
content = content.replace(
    "transition: 'transform 1.0s cubic-bezier(0.645, 0.045, 0.355, 1)'",
    "transition: 'transform 1.2s cubic-bezier(0.77, 0, 0.175, 1)'"
)

# Fix 2: overflowY for blogs
content = content.replace(
    "overflowY: activeScene === 'blogs' ? 'auto' : 'hidden', overflowX: 'hidden'",
    "overflowY: 'auto', overflowX: 'hidden'"
)

# Fix 3: opacity fading in About Me
# Remove " && activeScene === 'aboutMe'" and " activeScene === 'aboutMe' ?" logic from opacity to keep them visible during transition
content = content.replace(
    "opacity: (scene3UIVisible && activeScene === 'aboutMe' && scene3AboutMeScroll < 0.05) ? 1 : 0,",
    "opacity: (scene3UIVisible && scene3AboutMeScroll < 0.05) ? 1 : 0,"
)
content = content.replace(
    "pointerEvents: (scene3UIVisible && activeScene === 'aboutMe' && scene3AboutMeScroll < 0.05) ? 'auto' : 'none'",
    "pointerEvents: (scene3UIVisible && scene3AboutMeScroll < 0.05) ? 'auto' : 'none'"
)
content = content.replace(
    "opacity: (scene3UIVisible && activeScene === 'aboutMe' ? 1 : 0) * Math.max(0, 1 - scene3AboutMeScroll * 4),",
    "opacity: (scene3UIVisible ? 1 : 0) * Math.max(0, 1 - scene3AboutMeScroll * 4),"
)
content = content.replace(
    "pointerEvents: scene3UIVisible && activeScene === 'aboutMe' ? 'auto' : 'none',",
    "pointerEvents: scene3UIVisible ? 'auto' : 'none',"
)
content = content.replace(
    "transform: scene3UIVisible && activeScene === 'aboutMe' ? `translateY(${scene3AboutMeScroll * -200}px)` : 'translateY(30px)',",
    "transform: scene3UIVisible ? `translateY(${scene3AboutMeScroll * -200}px)` : 'translateY(30px)',"
)
content = content.replace(
    "opacity: scene3UIVisible && activeScene === 'aboutMe' ? 1 : 0, transition: 'opacity 1s ease 0.9s'",
    "opacity: scene3UIVisible ? 1 : 0, transition: 'opacity 1s ease 0.9s'"
)

with open("src/pages/LandingPage.tsx", "w") as f:
    f.write(content)

print("Fixed LandingPage.tsx")
