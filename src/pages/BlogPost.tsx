import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

interface PostData {
  title: string;
  content: string;
  publishDate: any;
  author?: string;
}

export default function BlogPost() {
  const { permalink } = useParams<{ permalink: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const initialPost = location.state?.post || null;
  const [post, setPost] = useState<PostData | null>(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState('');

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    const doBack = () => {
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate('/?scene=blogs', { replace: true });
      }
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
  }, [permalink]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0608] flex justify-center items-center">
        <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0a0608] flex flex-col justify-center items-center text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#50283c]/10 blur-[150px]" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-serif mb-8 text-white/90" style={{ fontFamily: "'Playfair Display', serif" }}>{error || 'Post not found'}</h1>
          <Link to="/blog" className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 hover:border-white/60 hover:bg-white/5 transition-all uppercase tracking-[0.15em] text-sm font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Return to Blogs
          </Link>
        </div>
      </div>
    );
  }

  let formattedDate = 'Unknown Date';
  try {
    if (post.publishDate) {
      const date = post.publishDate.toDate ? post.publishDate.toDate() : new Date(post.publishDate);
      if (!isNaN(date.getTime())) {
        formattedDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
      }
    }
  } catch (e) {
    console.error("Error parsing post date:", e);
  }

  return (
    <div className="min-h-screen bg-[#0a0608] text-white pt-8 px-6 md:px-12 lg:px-24 pb-32 relative">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[60vh] overflow-hidden z-0 pointer-events-none">
         <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[120%] h-full bg-gradient-to-b from-[#f3cdd6]/10 to-transparent blur-[120px] rounded-[100%]" />
      </div>

      <div className="absolute top-8 left-6 md:left-12 lg:left-24 z-20">
        <Link to="/?scene=blogs" onClick={handleBack} className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-white/60 hover:text-white transition-all font-medium py-2 px-4 -ml-4 rounded-full hover:bg-white/5 group/link" style={{ fontFamily: "'Inter', sans-serif" }}>
          <svg className="group-hover/link:-translate-x-1 transition-transform duration-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Blogs
        </Link>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto pt-16">
        <header className="mb-20 text-center">
          <div className="text-[#dcedc2] uppercase tracking-[0.25em] text-sm font-medium mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
            {formattedDate} {post.author && <span className="text-white/40 ml-2">| &nbsp; BY {post.author}</span>}
          </div>
          <h1 className="text-[27px] md:text-[45px] lg:text-[54px] font-serif text-white mb-12 leading-[1.1] drop-shadow-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            {post.title}
          </h1>
          <div className="w-24 h-[2px] bg-white/20 mx-auto" />
        </header>

        {/* Prose formatting for the HTML content */}
        <div 
          className="prose prose-invert prose-lg max-w-none 
          prose-headings:font-serif prose-headings:font-normal prose-headings:text-white/90 prose-headings:mt-12 prose-headings:mb-6
          prose-p:font-sans prose-p:text-white/80 prose-p:leading-relaxed prose-p:mb-8 prose-p:text-lg md:prose-p:text-xl
          prose-a:text-[#c3e3f4] hover:prose-a:text-white prose-a:transition-colors prose-a:underline-offset-4
          prose-blockquote:border-l-[#f3cdd6] prose-blockquote:bg-white/[0.03] prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:my-10 prose-blockquote:rounded-r-3xl prose-blockquote:italic prose-blockquote:text-white/90 prose-blockquote:border-l-4
          prose-strong:text-white/90 prose-strong:font-semibold
          prose-ul:my-8 prose-li:my-3 prose-li:text-white/80
          prose-img:rounded-3xl prose-img:my-12 prose-img:shadow-2xl prose-img:border prose-img:border-white/10"
          style={{ 
            fontFamily: "'Inter', sans-serif"
          }}
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />

      </div>
    </div>
  );
}
