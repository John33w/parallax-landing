const fs = require('fs');
let code = fs.readFileSync('src/pages/BlogMenu.tsx', 'utf8');

// 1. Add states and placeholders
const stateStr = `  const [searchVerseText, setSearchVerseText] = useState('');`;
const stateReplacement = `  const [searchVerseText, setSearchVerseText] = useState('');
  const [defaultPage, setDefaultPage] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const scrollCooldown = useRef(false);

  const placeholders = [
    "Search whatever's on your mind",
    "I want to know more about God's love..",
    "I want to break free from addictions.."
  ];

  useEffect(() => {
    if (!isSearchOpen) return;
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isSearchOpen]);

  useEffect(() => {
    setDefaultPage(0);
  }, [search]);

  const handleModalWheel = (e) => {
    if (search.trim() !== '' || posts.length <= 3 || scrollCooldown.current) return;
    
    if (Math.abs(e.deltaY) > 20) {
      const maxPage = Math.ceil(posts.length / 3) - 1;
      let newPage = defaultPage;
      
      if (e.deltaY > 0 && defaultPage < maxPage) {
        newPage = defaultPage + 1;
      } else if (e.deltaY < 0 && defaultPage > 0) {
        newPage = defaultPage - 1;
      }

      if (newPage !== defaultPage) {
        scrollCooldown.current = true;
        setDefaultPage(newPage);
        setTimeout(() => {
          scrollCooldown.current = false;
        }, 800);
      }
    }
  };`;
code = code.replace(stateStr, stateReplacement);

// 2. Add useRef to imports
code = code.replace(/import { useState, useEffect }/, "import { useState, useEffect, useRef }");

// 3. Update useEffect dependencies and search logic
code = code.replace(
  `      if (!search.trim()) {
        setFilteredPosts(posts.slice(0, 3));`,
  `      if (!search.trim()) {
        setFilteredPosts(posts.slice(defaultPage * 3, (defaultPage + 1) * 3));`
);
code = code.replace(`  }, [search, posts]);`, `  }, [search, posts, defaultPage]);`);

// 4. Update modal div
code = code.replace(
  `className="fixed inset-0 z-[9999] bg-sec/95 backdrop-blur-md flex flex-col items-center pt-24 px-6 overflow-y-auto"`,
  `className={\`fixed inset-0 z-[9999] bg-sec/95 backdrop-blur-md flex flex-col items-center pt-24 px-6 \${search.trim() === '' ? 'overflow-hidden' : 'overflow-y-auto'}\`}
              onWheel={handleModalWheel}`
);

// 5. Update placeholder
const inputBlock = `<svg className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/20 py-4 pl-16 pr-6 text-2xl md:text-4xl text-white placeholder-white/20 focus:outline-none focus:border-thr transition-colors font-cabinetGrotesk"
                  autoFocus
                />`;

const newInputBlock = `<svg className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 z-10" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                
                {!search && (
                  <div className="absolute left-16 top-0 bottom-0 right-6 pointer-events-none flex items-center overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={placeholderIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="text-2xl md:text-4xl text-white/20 font-cabinetGrotesk truncate w-full"
                      >
                        {placeholders[placeholderIndex]}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/20 py-4 pl-16 pr-6 text-2xl md:text-4xl text-white focus:outline-none focus:border-thr transition-colors font-cabinetGrotesk relative z-10"
                  autoFocus
                />`;
code = code.replace(inputBlock, newInputBlock);

// 6. Font weight for "Thank God..."
code = code.replace(
  `font-cabinetGrotesk font-bold opacity-80 tracking-wide`,
  `font-cabinetGrotesk font-light opacity-80 tracking-wide`
);

// 7. Update filteredPosts map to animate blur
code = code.replace(
  `                    {filteredPosts.map(post => (`,
  `                    {filteredPosts.map((post, idx) => (
                      <motion.div
                        key={\`\${post.id}-\${defaultPage}\`}
                        initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
                        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                      >`
);
code = code.replace(
  `                      </Link>
                    ))}
                  </motion.div>`,
  `                      </Link>
                      </motion.div>
                    ))}
                  </motion.div>`
);

// 8. Make sure to reset defaultPage when closing
code = code.replace(
  `setSearchVerseText('');
                        }}
                        className="group flex flex-col py-4 border-b border-white/10 hover:border-thr transition-colors"`,
  `setSearchVerseText('');
                          setDefaultPage(0);
                        }}
                        className="group flex flex-col py-4 border-b border-white/10 hover:border-thr transition-colors"`
);
code = code.replace(
  `setSearchVerseText('');
                }} 
                className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2"`,
  `setSearchVerseText('');
                  setDefaultPage(0);
                }} 
                className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2"`
);

fs.writeFileSync('src/pages/BlogMenu.tsx', code);
console.log('Update complete.');
