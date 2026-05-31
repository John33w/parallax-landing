import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';

import LandingPage from './pages/LandingPage';
import BlogMenu from './pages/BlogMenu';
import BlogPost from './pages/BlogPost';
import Login from './pages/admin/Login';
import DashboardLayout from './pages/admin/DashboardLayout';
import PostsList from './pages/admin/PostsList';
import Editor from './pages/admin/Editor';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0608] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#12312b] border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<BlogMenu />} />
        <Route path="/blog/:permalink" element={<BlogPost />} />
        
        {/* Admin Routes */}
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route path="posts" element={<PostsList />} />
          <Route path="editor" element={<Editor />} />
          <Route path="editor/:id" element={<Editor />} />
        </Route>
      </Routes>
    </Router>
  );
}
