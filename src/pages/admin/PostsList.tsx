import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Link } from 'react-router-dom';
import { Edit2, Archive, ArchiveRestore, Trash2, Loader2, Plus, FileText, Search } from 'lucide-react';

interface Post {
  id: string;
  title?: string;
  status?: string;
  createdAt?: any;
  excerpt?: string;
  [key: string]: any;
}

export default function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter(post => {
    if (!searchQuery.trim()) return true;
    
    // Split search query by spaces into individual terms
    const terms = searchQuery.toLowerCase().trim().split(/\s+/);
    
    // Every term must match at the beginning of some word in the title
    return terms.every(term => {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedTerm}`, 'i');
      return post.title && regex.test(post.title);
    });
  });

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'posts'),
      (querySnapshot) => {
        const postsData = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as Post[];
        
        postsData.sort((a, b) => {
          const timeA = a.publishDate ? new Date(a.publishDate).getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const timeB = b.publishDate ? new Date(b.publishDate).getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          
          if (timeA !== timeB) {
            return timeB - timeA;
          }
          
          const createdAtA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
          const createdAtB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
          return createdAtB - createdAtA;
        });
        
        setPosts(postsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleArchive = async (id: string) => {
    try {
      const postRef = doc(db, 'posts', id);
      const post = posts.find(p => p.id === id);
      const previousStatus = post?.status || 'draft';
      await updateDoc(postRef, { status: 'archived', previousStatus });
      setPosts(posts.map(p => p.id === id ? { ...p, status: 'archived', previousStatus } : p));
    } catch (error) {
      console.error("Error archiving post:", error);
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      const postRef = doc(db, 'posts', id);
      const post = posts.find(p => p.id === id);
      const newStatus = post?.previousStatus || 'draft';
      await updateDoc(postRef, { status: newStatus });
      setPosts(posts.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (error) {
      console.error("Error unarchiving post:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'posts', id));
      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const formatDate = (post: any) => {
    if (post.publishDate) {
      const date = new Date(post.publishDate);
      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(date);
      }
    }
    
    const timestamp = post.createdAt;
    if (!timestamp) return 'Just now';
    
    // Handle Firebase timestamp or Date string
    const date = timestamp.toDate ? timestamp.toDate() : (timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp));
    if (isNaN(date.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white text-gray-900">Posts</h2>
          <p className="dark:text-gray-400 text-gray-500 text-sm mt-1">Manage your blog posts and content</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-gray-500 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-gray-900 text-sm transition-shadow shadow-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="dark:bg-gray-900 bg-white border dark:border-gray-800 border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 dark:bg-gray-800 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 dark:text-gray-400 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium dark:text-white text-gray-900 mb-2">No posts yet</h3>
          <p className="dark:text-gray-400 text-gray-500 mb-6 max-w-sm mx-auto">Get started by creating your first blog post. You can always edit or delete it later.</p>
          <Link
            to="/admin/editor"
            className="inline-flex items-center gap-2 px-4 py-2 dark:bg-white dark:text-gray-900 bg-gray-900 text-white hover:opacity-90 rounded-xl transition-opacity font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="dark:bg-gray-900 bg-white border dark:border-gray-800 border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b dark:border-gray-800 border-gray-200 dark:bg-gray-900/50 bg-gray-50 text-sm font-medium dark:text-gray-400 text-gray-500">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-800 divide-gray-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="dark:hover:bg-gray-800/50 hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium dark:text-white text-gray-900 mb-1">{post.title || 'Untitled Post'}</div>
                      <div className="text-sm dark:text-gray-500 text-gray-500 line-clamp-1 max-w-md">
                        {post.excerpt || 'No excerpt available'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20' :
                        post.status === 'archived' ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20' :
                        'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20' // draft
                      }`}>
                        {(post.status || 'draft').charAt(0).toUpperCase() + (post.status || 'draft').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm dark:text-gray-400 text-gray-500 whitespace-nowrap">
                      {formatDate(post)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/admin/editor/${post.id}`}
                          className="p-2 dark:text-gray-400 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Edit post"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        {post.status !== 'archived' ? (
                          <button
                            onClick={() => handleArchive(post.id)}
                            className="p-2 dark:text-gray-400 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Archive post"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnarchive(post.id)}
                            className="p-2 dark:text-gray-400 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Restore post to draft"
                          >
                            <ArchiveRestore className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 dark:text-gray-400 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
