import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postTitle: string;
  postPermalink: string;
}

export default function CommentModal({ isOpen, onClose, postTitle, postPermalink }: CommentModalProps) {
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePost = async () => {
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a comment first.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      
      await addDoc(collection(db, 'comments'), {
        blogTitle: postTitle,
        blogPermalink: postPermalink,
        name: name.trim(),
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setComment('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error posting comment:', err);
      setError(err.message || 'Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-cabinetGrotesk font-bold text-thr mb-2">
                  {success ? 'Comment posted successfully' : 'Write a Comment'}
                </h3>
                {!success && (
                  <p className="text-white/60 text-sm leading-relaxed pr-8">
                    If you find this sermon useful to your Life. Kindly share it in comments and Lets all Praise the Lord together
                  </p>
                )}
              </div>
              <button 
                onClick={onClose}
                className="text-white/50 hover:text-white transition-colors p-2"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="text-main font-cabinetGrotesk text-xl mb-2">
                  Thank you for your thoughts
                </div>
                <p className="text-white/60 text-sm">
                  May god bless, Have a blessed day ahead
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-main transition-colors font-cabinetGrotesk"
                />
                
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-main transition-colors resize-none font-cabinetGrotesk"
                />
                
                {error && <p className="text-red-400 text-sm">{error}</p>}
                
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handlePost}
                    disabled={submitting}
                    className="bg-main text-black font-bold font-cabinetGrotesk px-8 py-3 rounded-full hover:bg-[#c4ec2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
