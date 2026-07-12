import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { AnimatePresence } from 'framer-motion';

import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import BlogMenu from './pages/BlogMenu';
import BlogPost from './pages/BlogPost';
import CommentsPage from './pages/CommentsPage';
import Login from './pages/admin/Login';
import DashboardLayout from './pages/admin/DashboardLayout';
import PostsList from './pages/admin/PostsList';
import Editor from './pages/admin/Editor';
import CurveTransition from './components/CurveTransition';
import Preloader from './components/Preloader';
import { PreloaderContext } from './context/PreloaderContext';

function AnimatedRoutes({ user }: { user: any }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname + location.search}>
        {/* Public Routes */}
        <Route path="/" element={<CurveTransition><LandingPage /></CurveTransition>} />
        <Route path="/about" element={<CurveTransition><AboutPage /></CurveTransition>} />
        <Route path="/blog" element={<CurveTransition><BlogMenu /></CurveTransition>} />
        <Route path="/blog/:permalink" element={<CurveTransition><BlogPost /></CurveTransition>} />
        <Route path="/comment" element={<Navigate to="/comments" replace />} />
        <Route path="/comments" element={<CurveTransition><CommentsPage /></CurveTransition>} />
        
        {/* Admin Routes */}
        <Route path="/login" element={user ? <Navigate to="/admin/posts" replace /> : <Login />} />
        
        <Route path="/admin" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="posts" replace />} />
          <Route path="posts" element={<PostsList />} />
          <Route path="editor" element={<Editor />} />
          <Route path="editor/:id" element={<Editor />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

import SmoothScroller from './components/SmoothScroller';
import GlobalCurveOverlay, { getRouteName } from './components/GlobalCurveOverlay';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [preloaderExiting, setPreloaderExiting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
      </div>
    );
  }

  const isHome = window.location.pathname === '/';
  const initialText = !isHome ? getRouteName(window.location) : undefined;

  const isAdmin = window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/login');
  
  return (
    <PreloaderContext.Provider value={!isAdmin && showPreloader && !preloaderExiting}>
      {(!isAdmin && showPreloader) && (
        <Preloader 
          onComplete={() => setShowPreloader(false)} 
          onExitStart={() => setPreloaderExiting(true)}
          initialText={initialText}
        />
      )}
      
      <Router>
        <SmoothScroller />
        <GlobalCurveOverlay />
        <AnimatedRoutes user={user} />
      </Router>
    </PreloaderContext.Provider>
  );
}
