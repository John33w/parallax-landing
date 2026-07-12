import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { SlidingTextLink } from '../components/Navigation';

interface CommentData {
  id: string;
  blogTitle: string;
  blogPermalink: string;
  name?: string;
  gmail?: string;
  comment: string;
  createdAt: any;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommentData[];
      setComments(fetched);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteDoc(doc(db, 'comments', id));
      setComments(comments.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment.');
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] font-cabinetGrotesk text-[#f5f5f5] selection:bg-main selection:text-[#111111] overflow-x-hidden">
      
      {/* Navigation */}
      <div className="w-full flex items-center z-[60] py-6 md:py-8 relative">
        <div className="w-full max-w-screen-2xl mx-auto px-[1rem] lg:px-[2rem]">
          <Link to="/" state={{ transitionText: 'Hello' }} className="text-3xl md:text-4xl font-bold text-white font-playfair tracking-wide hover:text-main transition-colors">
            RinaWrites
          </Link>
        </div>

        <div className="absolute right-6 md:right-16 flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-8 text-white font-light text-xl">
            <div className="hover:opacity-70 transition-opacity duration-300">
              <SlidingTextLink to="/">Home</SlidingTextLink>
            </div>
            <div className="hover:opacity-70 transition-opacity duration-300">
              <SlidingTextLink to="/about">About</SlidingTextLink>
            </div>
            <div className="hover:opacity-70 transition-opacity duration-300">
              <SlidingTextLink to="/blog">Blogs</SlidingTextLink>
            </div>
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-sec text-white flex flex-col p-6 animate-in slide-in-from-right duration-500">
          <div className="flex justify-between items-center w-full mb-12">
            <span className="text-3xl md:text-4xl font-bold font-playfair tracking-wide">RinaWrites</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="w-12 h-12 flex flex-col justify-center items-center gap-1.5">
              <div className="w-6 h-0.5 bg-white rotate-45 translate-y-1"></div>
              <div className="w-6 h-0.5 bg-white -rotate-45 -translate-y-1"></div>
            </button>
          </div>
          <nav className="flex flex-col gap-6 text-4xl font-cabinetGrotesk">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/20 pb-4">Home</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/20 pb-4">About</Link>
            <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/20 pb-4">Blogs</Link>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 mt-12 mb-32">
        <h1 className="text-4xl md:text-5xl font-bold text-thr mb-12">Recent Comments</h1>

        {loading ? (
          <div className="text-xl text-white/50">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-xl text-white/50">No comments yet.</div>
        ) : (
          <div className="flex flex-col gap-6">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 relative group">
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="absolute top-6 right-6 text-red-500/50 hover:text-red-500 transition-colors p-2 md:opacity-0 group-hover:opacity-100"
                  title="Delete Comment"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
                <div className="flex flex-col gap-1 mb-4 pr-8">
                  <Link to={`/blog/${comment.blogPermalink}`} className="text-xl md:text-2xl font-bold text-main hover:underline decoration-main/50 underline-offset-4">
                    {comment.blogTitle}
                  </Link>
                  <div className="text-sm text-white/40">
                    {comment.createdAt ? new Date(comment.createdAt.toDate()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Just now'}
                  </div>
                </div>
                <div className="text-lg text-white/80 whitespace-pre-wrap mb-4">
                  {comment.comment}
                </div>
                <div className="text-sm text-white/50 border-t border-white/10 pt-4 mt-auto">
                  By: {comment.name || comment.gmail}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
