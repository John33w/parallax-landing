import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { SlidingTextLink, MagneticButton } from '../components/Navigation';
import CommentModal from '../components/CommentModal';

function MagneticCommentButton({ onClick }: { onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.4); 
    y.set(middleY * 0.4);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <button 
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      className="w-14 h-14 bg-main rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform"
      title="Leave a comment"
    >
      <motion.div style={{ x: springX, y: springY }} className="flex items-center justify-center w-full h-full">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
      </motion.div>
    </button>
  );
}

function MagneticMoreButton({ onClick }: { onClick: (e?: React.MouseEvent) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.4); 
    y.set(middleY * 0.4);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <button 
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); reset(); }}
      onClick={onClick}
      className="h-10 bg-main rounded-full flex items-center justify-center text-black shadow-lg px-6 group hover:scale-105 transition-transform relative overflow-hidden"
    >
      <motion.div style={{ x: springX, y: springY }} className="flex items-center gap-1.5">
        <span className="font-cabinetGrotesk font-semibold text-base tracking-tight lowercase">more</span>
        <div className="relative w-4 h-4 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <motion.line 
              x1="7" y1="17" x2="17" y2="7" 
              initial={{ pathLength: 1 }}
              animate={{ pathLength: isHovered ? [0, 1] : 1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
            <motion.polyline 
              points="7 7 17 7 17 17" 
              initial={{ pathLength: 1 }}
              animate={{ pathLength: isHovered ? [0, 1] : 1 }}
              transition={{ duration: 0.4, ease: "easeInOut", delay: 0.1 }}
            />
          </svg>
        </div>
      </motion.div>
    </button>
  );
}

interface PostData {
  title: string;
  content: string;
  publishDate: any;
  author?: string;
  excerpt?: string;
}

export default function BlogPost() {
  const { permalink } = useParams<{ permalink: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const initialPost = location.state?.post || null;
  const [post, setPost] = useState<PostData | null>(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const handleBack = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const doBack = () => {
      navigate('/blog', { state: { transitionText: 'Blogs' } });
    };

    if ('startViewTransition' in document) {
      (document as any).startViewTransition(doBack);
    } else {
      doBack();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (initialPost) return;
    if (!permalink) return;

    const fetchPost = async () => {
      try {
        const q = query(collection(db, 'posts'), where('permalink', '==', permalink), limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setError('Post not found');
        } else {
          setPost(snapshot.docs[0].data() as PostData);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [permalink, initialPost]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sec flex justify-center items-center">
        <div className="w-12 h-12 rounded-full border-2 border-thr/20 border-t-thr animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-sec flex flex-col justify-center items-center text-white p-6 relative overflow-hidden font-cabinetGrotesk">
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-righteous mb-8 text-white/90">{error || 'Post not found'}</h1>
          <Link to="/?scene=blogs" className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 hover:border-white/60 hover:bg-white/5 transition-all text-sm uppercase tracking-widest font-inter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Return to Blogs
          </Link>
        </div>
      </div>
    );
  }

  let monthDay = 'Unknown Date';
  let year = '';
  try {
    if (post.publishDate) {
      const date = post.publishDate.toDate ? post.publishDate.toDate() : new Date(post.publishDate);
      if (!isNaN(date.getTime())) {
        monthDay = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(date) + ',';
        year = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(date);
      }
    }
  } catch (e) {
    console.error("Error parsing post date:", e);
  }

  return (
    <div className="bg-sec min-h-screen text-white font-cabinetGrotesk relative overflow-x-hidden w-full">
      
      {/* Navigation */}
      <div className="w-full flex items-center z-[60] py-6 md:py-8 relative">
        <div className="w-full max-w-screen-2xl mx-auto px-[1rem] lg:px-[2rem]">
          <Link to="/" state={{ transitionText: 'Hello' }} className="text-3xl md:text-4xl font-bold font-playfair text-white tracking-wide relative z-[70]">
            RinaWrites
          </Link>
        </div>
        
        {/* Desktop and Mobile Nav Container */}
        <div className="absolute right-6 md:right-16 flex items-center gap-8 z-[70]">
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-xl font-light font-cabinetGrotesk">
            <div className="hover:text-white/70 transition-colors duration-300">
              <SlidingTextLink to="/">Home</SlidingTextLink>
            </div>
            <div className="hover:text-white/70 transition-colors duration-300">
              <SlidingTextLink to="/about">About</SlidingTextLink>
            </div>
            <MagneticButton onClick={handleBack}>
              Back to Blogs
            </MagneticButton>
          </nav>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex flex-col gap-1.5 cursor-pointer z-[70]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <div className={`w-6 h-[2px] bg-white transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-[8px]' : ''}`}></div>
          <div className={`w-6 h-[2px] bg-white transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-6 h-[2px] bg-white transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-[8px]' : ''}`}></div>
        </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-sec z-[65] flex flex-col items-center justify-center pointer-events-auto md:hidden transition-all duration-400 ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
        <div className="flex flex-col gap-8 text-3xl font-cabinetGrotesk text-center">
          <button onClick={() => { setIsMobileMenuOpen(false); navigate('/'); }} className="text-white hover:text-main transition-colors">Home</button>
          <button onClick={() => { setIsMobileMenuOpen(false); navigate('/about'); }} className="text-white hover:text-main transition-colors">About</button>
          <button onClick={(e) => { setIsMobileMenuOpen(false); handleBack(e); }} className="text-main hover:text-white transition-colors mt-4">Back to Blogs</button>
        </div>
      </div>

      {/* Header Section */}
      <div className="pt-8 sm:pt-10 md:pt-20 pb-6 sm:pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-[1rem] lg:px-[2rem]">
          <div className="flex flex-col gap-4 sm:gap-6 items-start mb-6 sm:mb-8 lg:mb-12">
            <div className="w-full">
              <h1 className="font-cabinetGrotesk text-[2.5rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem] font-bold leading-[1.1] sm:leading-tight lg:leading-none text-main break-words">
                {post.title}
              </h1>
            </div>
            
            <div className="space-y-1 text-start w-full">
              <h2 className="font-cabinetGrotesk text-base sm:text-lg md:text-xl lg:text-2xl font-normal text-thr flex flex-row items-center gap-1">
                <span>{monthDay}</span>
                {year && <span>{year}</span>}
              </h2>
              {post.author && (
                <div className="font-cabinetGrotesk text-base sm:text-lg md:text-xl lg:text-2xl italic text-gray-400">
                  By {post.author}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4 text-thr">
            <svg className="w-5 h-5 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"></path></svg>
            <span className="font-cabinetGrotesk text-sm md:text-base tracking-widest uppercase">Scroll to Read</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-8 sm:mt-12 lg:mt-16 mb-16 max-w-7xl mx-auto px-4 sm:px-[1rem] lg:px-[2rem] relative z-10">
         <div 
          className="prose prose-invert max-w-5xl font-cabinetGrotesk
          prose-headings:font-cabinetGrotesk prose-headings:font-bold prose-headings:text-thr prose-headings:mt-12 prose-headings:mb-6
          prose-p:font-cabinetGrotesk prose-p:text-white/70 prose-p:leading-relaxed prose-p:my-5 prose-p:text-base md:prose-p:text-lg
          prose-a:text-main hover:prose-a:text-white prose-a:transition-colors prose-a:underline-offset-4
          prose-blockquote:border-l-main prose-blockquote:bg-white/[0.03] prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:my-10 prose-blockquote:rounded-r-3xl prose-blockquote:italic prose-blockquote:text-thr prose-blockquote:border-l-4
          prose-strong:text-thr prose-strong:font-semibold
          prose-ul:my-8 prose-li:my-3 prose-li:text-gray-300
          prose-img:rounded-3xl prose-img:my-12 prose-img:border prose-img:border-gray-800"
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      </div>

      {/* More Button */}
      <motion.div 
        initial={{ opacity: 0, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, filter: "blur(0px)" }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.8 }}
        className="flex justify-center mb-32 max-w-7xl mx-auto px-4 sm:px-[1rem] lg:px-[2rem] relative z-10"
      >
        <MagneticMoreButton onClick={() => navigate('/blog', { state: { transitionText: 'Explore' } })} />
      </motion.div>

      {/* Comment Floating Button */}
      {!loading && post && (
        <div className="fixed bottom-8 right-8 z-[100]">
          <MagneticCommentButton onClick={() => setIsCommentModalOpen(true)} />
        </div>
      )}

      {post && (
        <CommentModal 
          isOpen={isCommentModalOpen} 
          onClose={() => setIsCommentModalOpen(false)} 
          postTitle={post.title}
          postPermalink={permalink!}
        />
      )}

    </div>
  );
}
