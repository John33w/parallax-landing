import { useEffect, useState, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidingTextLink, MagneticButton } from '../components/Navigation';
import { searchBlogsWithGemini } from '../utils/geminiSearch';

const safeFormatDate = (publishDate: any) => {
  try {
    if (!publishDate) return 'Unknown Date';
    let date: Date;
    if (typeof publishDate.toDate === 'function') {
      date = publishDate.toDate();
    } else {
      date = new Date(publishDate);
    }
    if (isNaN(date.getTime())) {
      return 'Unknown Date';
    }
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Unknown Date';
  }
};

const LoadingIndicator = () => {
  const [stage, setStage] = useState<'working' | 'wait'>('working');
  const [dots, setDots] = useState('');

  useEffect(() => {
    const flipTimer = setTimeout(() => {
      setStage('wait');
    }, 1000);
    return () => clearTimeout(flipTimer);
  }, []);

  useEffect(() => {
    if (stage === 'wait') {
      let count = 0;
      const dotsTimer = setInterval(() => {
        count++;
        if (count === 1) setDots('.');
        else if (count === 2) setDots('..');
        else if (count === 3) setDots('...');
        else if (count === 4) { count = 0; setDots(''); }
      }, 400);
      return () => clearInterval(dotsTimer);
    }
  }, [stage]);

  return (
    <div className="relative h-24 w-full flex items-center justify-center py-12 overflow-hidden">
      <AnimatePresence mode="popLayout">
        {stage === 'working' ? (
          <motion.div
            key="working"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute text-white/50 text-xl font-inter flex justify-center w-full"
          >
            Working
          </motion.div>
        ) : (
          <motion.div
            key="wait"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute text-white/50 text-xl font-inter flex justify-center w-full"
          >
            <div className="flex items-center justify-center whitespace-nowrap">
              <span>Please wait</span>
              <span className="w-6 text-left inline-block">{dots}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  permalink: string;
  publishDate: any;
  status: string;
  createdAt?: any;
}

interface BlogMenuProps {
  isIntegrated?: boolean;
  onBack?: () => void;
}

export default function BlogMenu({ isIntegrated, onBack }: BlogMenuProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [searchVerseRef, setSearchVerseRef] = useState('');
  const [searchVerseText, setSearchVerseText] = useState('');
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
    }, 2000);
    return () => clearInterval(interval);
  }, [isSearchOpen]);

  useEffect(() => {
    setDefaultPage(0);
  }, [search]);

  const handleModalWheel = (e: React.WheelEvent) => {
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
  };

  useEffect(() => {
    let active = true;
    let fallbackUnsubscribe: (() => void) | null = null;
    const nowIso = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    
    // Attempt to fetch with orderBy first. If it fails due to missing index, fallback.
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      where('publishDate', '<=', nowIso),
      orderBy('publishDate', 'desc'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!active) return;
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      setPosts(fetchedPosts);
      setLoading(false);
    }, (error) => {
      console.warn("Error fetching posts, using fallback:", error);
      if (!active) return;
      const fallbackQuery = query(
        collection(db, 'posts'),
        where('status', '==', 'published')
      );
      fallbackUnsubscribe = onSnapshot(fallbackQuery, (fbSnapshot) => {
        if (!active) return;
        const fetchedPosts = fbSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogPost[];
        
        const currentIso = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        const validPosts = fetchedPosts
          .filter(p => {
             const pDateStr = p.publishDate?.toDate ? new Date(p.publishDate.toDate().getTime() - p.publishDate.toDate().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : String(p.publishDate || '');
             return pDateStr <= currentIso;
          })
          .sort((a, b) => {
             const aDateStr = a.publishDate?.toDate ? new Date(a.publishDate.toDate().getTime() - a.publishDate.toDate().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : String(a.publishDate || '');
             const bDateStr = b.publishDate?.toDate ? new Date(b.publishDate.toDate().getTime() - b.publishDate.toDate().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : String(b.publishDate || '');
             if (bDateStr !== aDateStr) {
               return bDateStr.localeCompare(aDateStr);
             }
             
             // If publishDates are equal, sort by createdAt descending (latest uploaded first)
             const aCreatedAt = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
             const bCreatedAt = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
             return bCreatedAt - aCreatedAt;
          });
        
        setPosts(validPosts);
        setLoading(false);
      }, (fbError) => {
        console.warn("Fallback query error:", fbError);
        if (!active) return;
        setPosts([]);
        setErrorMsg(fbError.message || "Failed to load posts");
        setLoading(false);
      });
    });

    return () => {
      active = false;
      unsubscribe();
      if (fallbackUnsubscribe) {
        fallbackUnsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  useEffect(() => {
    let isActive = true;
    const performSearch = async () => {
      if (!search.trim()) {
        setFilteredPosts(posts.slice(defaultPage * 3, (defaultPage + 1) * 3));
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      setSearchMessage('');
      setSearchVerseRef('');
      setSearchVerseText('');
      try {
        const apiPromise = searchBlogsWithGemini(search, posts);
        const minWaitPromise = new Promise(resolve => setTimeout(resolve, 2700));
        const [result] = await Promise.all([apiPromise, minWaitPromise]);
        const { matchedIds, message, verseRef, verseText } = result;
        if (!isActive) return;
        const sortedPosts = matchedIds
          .map(id => posts.find(p => p.id === id))
          .filter(Boolean) as BlogPost[];
        setFilteredPosts(sortedPosts);
        setSearchMessage(message || '');
        setSearchVerseRef(verseRef || '');
        setSearchVerseText(verseText || '');
      } catch (err) {
        console.error("Search failed:", err);
        if (!isActive) return;
        setFilteredPosts([]);
      } finally {
        if (isActive) setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      performSearch();
    }, 500);

    return () => {
      isActive = false;
      clearTimeout(debounceTimer);
    };
  }, [search, posts, defaultPage]);

  return (
    <div className={`min-h-screen bg-[#E8E8E5] flex flex-col font-cabinetGrotesk`}>
      {/* Navigation */}
      <div className="w-full flex items-center z-[60] py-6 md:py-8 relative">
        <div className="w-full max-w-screen-2xl mx-auto px-[1rem] lg:px-[2rem]">
          {/* Logo/Home link */}
          {isIntegrated ? (
            <button onClick={onBack} className="text-3xl md:text-4xl font-bold text-[#111111] font-playfair tracking-wide">
              RinaWrites
            </button>
          ) : (
            <Link to="/" state={{ transitionText: 'Hello' }} className="text-3xl md:text-4xl font-bold text-[#111111] font-playfair tracking-wide">
              RinaWrites
            </Link>
          )}
        </div>

        <div className="absolute right-6 md:right-16 flex items-center gap-8">
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-[#111111] font-light text-xl">
            {isIntegrated ? (
              <div className="hover:opacity-70 transition-opacity duration-300">
                <SlidingTextLink onClick={onBack}>
                  Home
                </SlidingTextLink>
              </div>
            ) : (
              <div className="hover:opacity-70 transition-opacity duration-300">
                <SlidingTextLink to="/">
                  Home
                </SlidingTextLink>
              </div>
            )}
            <div className="hover:opacity-70 transition-opacity duration-300">
              <SlidingTextLink to="/about">
                About
              </SlidingTextLink>
            </div>
            
            <MagneticButton onClick={() => setIsSearchOpen(true)}>
              Search
            </MagneticButton>
          </nav>

          {/* Mobile menu toggle */}
          <div className="block md:hidden">
            <div 
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-12 h-12 bg-sec rounded-full flex items-center justify-center shadow-lg cursor-pointer"
            >
              <div className="flex flex-col gap-1.5">
                <div className="w-5 h-0.5 bg-white rounded-full"></div>
                <div className="w-5 h-0.5 bg-white rounded-full"></div>
                <div className="w-5 h-0.5 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Portal */}
      {isMobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[100] bg-sec text-white flex flex-col p-6 animate-in slide-in-from-right duration-500">
          <div className="flex justify-between items-center w-full mb-12">
            <span className="text-3xl md:text-4xl font-bold font-playfair tracking-wide">RinaWrites</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="w-12 h-12 flex flex-col justify-center items-center gap-1.5">
              <div className="w-6 h-0.5 bg-white rotate-45 translate-y-1"></div>
              <div className="w-6 h-0.5 bg-white -rotate-45 -translate-y-1"></div>
            </button>
          </div>
          <nav className="flex flex-col gap-6 text-4xl font-cabinetGrotesk">
            {isIntegrated ? (
              <button onClick={() => { setIsMobileMenuOpen(false); onBack?.(); }} className="text-left border-b border-white/20 pb-4">Home</button>
            ) : (
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/20 pb-4">Home</Link>
            )}
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/20 pb-4">About</Link>
            <button onClick={() => { setIsMobileMenuOpen(false); setIsSearchOpen(true); }} className="border-b border-white/20 pb-4 text-left text-thr">Search Blogs</button>
          </nav>
        </div>,
        document.body
      )}

      {/* Search Modal Portal */}
      {createPortal(
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className={`fixed inset-0 z-[9999] bg-sec/95 backdrop-blur-md flex flex-col items-center pt-24 px-6 ${search.trim() === '' ? 'overflow-hidden' : 'overflow-y-auto'}`}
              data-lenis-prevent
              onWheel={handleModalWheel}
            >
              <button 
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearch('');
                  setSearchMessage('');
                  setSearchVerseRef('');
                  setSearchVerseText('');
                  setDefaultPage(0);
                }} 
                className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              
              <div className="w-full max-w-3xl relative mb-12">
                <svg className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 z-10" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                
                {!search && (
                  <div className="absolute left-14 top-0 bottom-0 right-5 pointer-events-none flex items-center overflow-hidden">
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={placeholderIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="text-xl md:text-3xl text-white/40 font-cabinetGrotesk truncate w-full absolute"
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
                  className="w-full bg-transparent border-b-2 border-white/20 py-3 pl-14 pr-5 text-xl md:text-3xl text-white focus:outline-none focus:border-thr transition-colors font-cabinetGrotesk relative z-10"
                  autoFocus
                />
              </div>
              
              <div className="w-full max-w-3xl flex flex-col gap-4 pb-24">
                {!isSearching && search.trim() === '' && (
                  <div className="text-thr text-center pb-8 pt-4 text-2xl md:text-3xl font-cabinetGrotesk font-light opacity-80 tracking-wide">
                    Thank God For His Unconditional Love
                  </div>
                )}
                {isSearching && (
                  <LoadingIndicator />
                )}
                {!isSearching && (searchMessage || searchVerseText) && (
                  <div className="text-white mb-6 text-lg md:text-xl font-cabinetGrotesk leading-relaxed flex flex-col gap-4 py-2">
                    {searchMessage && (
                      <div className="flex flex-wrap">
                        {searchMessage.split(' ').map((word, index) => (
                          <motion.span 
                            key={`msg-${index}`}
                            initial={{ opacity: 0, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                            transition={{ duration: 0.3, delay: index * 0.03 }}
                            className="inline-block mr-[0.3em]" 
                          >
                            {word}
                          </motion.span>
                        ))}
                      </div>
                    )}
                    {searchVerseText && searchVerseRef && (
                      <motion.a
                        href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(searchVerseRef)}&version=NIV`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-thr hover:text-white transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: (searchMessage ? searchMessage.split(' ').length * 0.03 : 0) + 0.2 }}
                      >
                        {searchVerseRef} - "{searchVerseText}"
                      </motion.a>
                    )}
                  </div>
                )}
                {!isSearching && filteredPosts.length > 0 && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={defaultPage}
                      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="flex flex-col w-full"
                    >
                      {filteredPosts.map((post) => (
                        <Link 
                          key={post.id} 
                          to={`/blog/${post.permalink}`}
                          state={{ post }}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearch('');
                            setSearchMessage('');
                            setSearchVerseRef('');
                            setSearchVerseText('');
                            setDefaultPage(0);
                          }}
                          className="group flex flex-col py-4 border-b border-white/10 hover:border-thr transition-colors"
                        >
                          <span className="text-xs md:text-sm font-inter text-thr uppercase tracking-wider mb-1">
                            {safeFormatDate(post.publishDate)}
                          </span>
                          <h3 className="text-xl md:text-2xl font-cabinetGrotesk font-bold text-white/80 group-hover:text-white leading-tight">
                            {post.title.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                          </h3>
                        </Link>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}
                {!isSearching && filteredPosts.length === 0 && search.trim() !== '' && !searchMessage && (
                  <div className="text-white/50 text-center py-12 text-xl font-inter">
                    No conceptual matches found for your search.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Main Content */}
      <div className="pt-12 pb-7 px-[1rem] lg:px-[2rem] max-w-screen-2xl mx-auto w-full flex flex-col text-left">
        <div className="works-title text-5xl md:text-6xl lg:text-8xl font-cabinetGrotesk leading-tight text-black mb-6 flex flex-wrap py-2">
          {["My", "Blogs"].map((word, index) => (
            <span key={index} className="inline-block mr-[0.3em] overflow-hidden relative">
              <motion.span 
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.7 + index * 0.1 }}
                className="inline-block" 
              >
                {word}
              </motion.span>
            </span>
          ))}
        </div>
        <div className="text-lg md:text-xl leading-relaxed max-w-3xl font-cabinetGrotesk text-black">
          <div className="flex flex-wrap py-1">
            {"This is the place where words inspire, uplift, and transform. Here, you’ll find powerful quotes and heartfelt sermons that bring wisdom, faith, and encouragement to your daily life. Whether you seek guidance, motivation, or spiritual reflection, let these words be a beacon of light on your journey. Stay inspired, stay blessed!".split(" ").map((word, index) => (
              <span key={index} className="inline-block mr-[0.3em] overflow-hidden relative mb-1">
                <motion.span 
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.9 + index * 0.03 }}
                  className="inline-block" 
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-10 w-full pb-[10rem] px-[1rem] lg:px-[2rem] max-w-screen-2xl mx-auto flex-grow">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 rounded-full border-2 border-black/10 border-t-black animate-spin"></div>
          </div>
        ) : errorMsg ? (
          <div className="text-center py-32">
            <p className="text-red-500 text-xl font-inter">Error: {errorMsg}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-black/50 text-xl font-inter">No posts found.</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5, ease: [0.76, 0, 0.24, 1] }}
            className="w-full flex flex-col border-t border-black/20" 
          >
            {posts.map((post) => {
              return (
                <div key={post.id} className="w-full">
                  <Link 
                    to={`/blog/${post.permalink}`} 
                    state={{ post }}
                    className="group relative block py-6 md:py-8 border-b border-black/20 overflow-hidden w-full"
                  >
                    {/* Background expansion from center vertically */}
                    <div className="absolute inset-0 bg-main transform scale-y-0 opacity-0 group-hover:scale-y-100 group-hover:opacity-100 origin-center transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] z-0"></div>
                    
                    <div className="relative z-10 flex justify-center w-full">
                      <h2 className="group/title inline-flex flex-wrap justify-center text-center text-xl md:text-2xl lg:text-3xl font-bold uppercase text-black font-cabinetGrotesk tracking-wide">
                        {(() => {
                          let charIndex = 0;
                          return post.title.split(' ').map((word: string, wIdx: number) => (
                            <div key={wIdx} className="inline-flex flex-wrap justify-center mr-[0.3em] last:mr-0">
                              {word.split('').map((char: string, cIdx: number) => {
                                const i = charIndex++;
                                return (
                                  <span key={cIdx} className="relative inline-flex flex-col overflow-hidden align-top">
                                    <span 
                                      className="inline-block transition-transform duration-0 group-hover/title:duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/title:-translate-y-full [transition-delay:0s] group-hover/title:[transition-delay:var(--hover-delay)]"
                                      style={{ '--hover-delay': `${i * 0.02}s` } as React.CSSProperties}
                                    >
                                      {char}
                                    </span>
                                    <span 
                                      className="absolute top-full left-0 inline-block transition-transform duration-0 group-hover/title:duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/title:-translate-y-full [transition-delay:0s] group-hover/title:[transition-delay:var(--hover-delay)]"
                                      style={{ '--hover-delay': `${i * 0.02}s` } as React.CSSProperties}
                                    >
                                      {char}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          ));
                        })()}
                      </h2>
                    </div>
                  </Link>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
