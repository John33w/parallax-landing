import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import AntigravityText from '../components/AntigravityText';

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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const filteredPosts = posts.filter(post => {
    if (!search.trim()) return true;
    
    // Split search query by spaces into individual terms
    const terms = search.toLowerCase().trim().split(/\s+/);
    
    // Every term must match at the beginning of some word in the title
    return terms.every(term => {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedTerm}`, 'i');
      return post.title && regex.test(post.title);
    });
  });

  return (
    <div className={`${isIntegrated ? 'min-h-full w-full' : 'min-h-screen'} bg-[#0a0608] text-white pt-16 md:pt-8 px-6 md:px-12 lg:px-24 pb-12 relative`}>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#50283c]/20 blur-[140px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#251a22]/40 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {isSearchOpen && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center pt-24 px-6 animate-in fade-in duration-300">
            <button 
              onClick={() => setIsSearchOpen(false)} 
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <div className="w-full max-w-3xl relative mb-12">
              <svg className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                type="text"
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-b-2 border-white/20 py-4 pl-16 pr-6 text-2xl md:text-4xl text-white placeholder-white/20 focus:outline-none focus:border-white/60 transition-colors"
                autoFocus
                style={{ fontFamily: "'Playfair Display', serif" }}
              />
            </div>
            
            <div className="w-full max-w-3xl overflow-y-auto max-h-[60vh] flex flex-col">
              {filteredPosts.map(post => (
                <Link 
                  key={post.id} 
                  to={`/blog/${post.permalink}`}
                  state={{ post }}
                  onClick={() => setIsSearchOpen(false)}
                  className="group flex flex-col py-6 border-b border-white/10 hover:border-white/30 transition-colors"
                >
                  <h3 className="text-2xl md:text-3xl text-white/80 group-hover:text-white mb-2 transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {post.title}
                  </h3>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#dcedc2]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {safeFormatDate(post.publishDate)}
                  </span>
                </Link>
              ))}
              {filteredPosts.length === 0 && (
                <div className="text-white/50 text-center py-12 text-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
                  No blogs found matching your search.
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

        <header className="mb-8 md:mb-16 relative">
          <div className="flex justify-between items-start absolute w-full top-0">
            {isIntegrated ? (
              <button onClick={onBack} className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-white/80 hover:text-white transition-colors group/link font-medium">
                <svg className="group-hover/link:-translate-x-1 transition-transform duration-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                BACK
              </button>
            ) : (
              <Link to="/?scene=2" className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-white/80 hover:text-white transition-colors group/link font-medium">
                <svg className="group-hover/link:-translate-x-1 transition-transform duration-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                BACK
              </Link>
            )}
            
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </div>

          <div className="text-center flex flex-col items-center pt-12 md:pt-4 px-4 md:px-0">
            <AntigravityText 
              text="Blogs"
              as="h1"
              className="text-4xl md:text-7xl mb-4 md:mb-6 text-white drop-shadow-lg font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            />
            {/* Desktop caption */}
            <p className="hidden md:block text-lg text-white/80 max-w-2xl text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
              A gateway to another mindset. Step right in and explore thoughts, reflections, and stories from the journey.
            </p>
            {/* Mobile caption */}
            <p className="block md:hidden text-sm text-white/80 max-w-md text-center leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Here, you’ll find powerful quotes and heartfelt sermons that bring wisdom, faith, and encouragement to your daily life.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-white animate-spin"></div>
          </div>
        ) : errorMsg ? (
          <div className="text-center py-32 bg-red-500/10 border border-red-500/30 rounded-3xl backdrop-blur-sm">
            <p className="text-red-200 text-xl font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>Error: {errorMsg}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-32 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm">
            <p className="text-white/50 text-xl font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>No posts found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 max-w-3xl mx-auto">
            {filteredPosts.map(post => {
              const formattedDate = safeFormatDate(post.publishDate);
              
              return (
                <div key={post.id} className="group relative flex flex-col bg-[#140b10]/60 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:border-white/30 transition-all duration-500 hover:-translate-y-2 shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(80,40,60,0.3)]">
                  <div className="p-5 md:p-8 flex flex-col h-full">
                    <h2 className="text-2xl md:text-3xl text-white mb-2 leading-snug group-hover:text-[#f3cdd6] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {post.title}
                    </h2>
                    <div className="text-xs uppercase tracking-[0.2em] text-[#dcedc2] mb-6 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                      - {formattedDate}
                    </div>
                    <div 
                      className="text-white/70 leading-relaxed mb-8 flex-grow text-sm md:text-base prose prose-invert max-w-none prose-p:my-0 prose-headings:my-0 prose-ul:my-0 prose-li:my-0" 
                      style={{ fontFamily: "'Inter', sans-serif", display: "-webkit-box", WebkitLineClamp: 10, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                      dangerouslySetInnerHTML={{ __html: post.content || post.excerpt }}
                    />
                    <div className="mt-auto">
                      <Link 
                        to={`/blog/${post.permalink}`} 
                        state={{ post }}
                        className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-[#f3cdd6] hover:text-white transition-colors group/link font-medium" 
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        READ MORE
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
