import { SpaceScene } from './components/SpaceScene';
import { PlanetExplorer } from './components/PlanetExplorer';
import { useAuth } from './hooks/useAuth';
import { Canvas } from '@react-three/fiber';
import { useLocation, BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, LogOut, User as UserIcon, Rocket, LogIn, Mail } from 'lucide-react';
import { handleFirestoreError, db } from './lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled. Please enable it in your Firebase Console: Authentication > Sign-in method.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign in');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-slate-900/80 border border-slate-700 p-8 rounded-2xl shadow-2xl backdrop-blur-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isSignUp ? 'Join StellarX' : 'Welcome Back'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="astronaut@space.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            {isSignUp ? 'Sign Up with Email' : 'Sign In with Email'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-700"></div>
          <span className="text-sm text-slate-400">OR</span>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="mt-6 w-full bg-white text-slate-900 hover:bg-slate-100 font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="mt-8 text-center text-sm text-slate-400">
          {isSignUp ? 'Already have an account?' : 'Need an account?'}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-2">
          <Rocket className="w-6 h-6 text-indigo-400" />
          <span className="text-xl font-bold tracking-tighter text-white">StellarX</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/" className="text-sm text-slate-300 hover:text-white transition-colors">Home</Link>
          <Link to="/explore" className="text-sm text-slate-300 hover:text-white transition-colors">Explore</Link>
          
          {user ? (
            <div className="flex items-center gap-4 ml-4">
              <span className="text-sm text-indigo-300 flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                {user.email}
              </span>
              <button 
                onClick={logout}
                className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-5 py-2 rounded-full font-medium transition-colors ml-4 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </nav>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}

function Home() {
  return (
    <div className="relative z-10 w-full pointer-events-none">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[100dvh] pt-32 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center"
        >
          <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-6 inline-block pointer-events-auto">
            Discover the Unknown
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-6 pointer-events-auto">
            Explore The <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Digital Frontier
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 pointer-events-auto">
            A stunning realistic 3D space experience inside your browser. Login to save your cosmic discoveries and synchronize across devices.
          </p>
          
          <div className="flex gap-4 justify-center pointer-events-auto">
            <Link to="/explore" className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition-colors">
              Start Exploring
            </Link>
            <a href="#features" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 py-3 rounded-full font-semibold transition-colors backdrop-blur-sm">
              Learn More
            </a>
          </div>
        </motion.div>
      </section>

      {/* Feature Section 1 */}
      <section id="features" className="flex flex-col md:flex-row items-center justify-between min-h-[100dvh] px-8 md:px-24">
         <div className="md:w-1/2 pointer-events-auto">
            <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-6">
              Hyper-Drive Tech
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed">
              Traverse the galaxy seamlessly. Our advanced navigation systems let you chart courses through the most dangerous asteroid fields while keeping your spacecraft intact. 
            </p>
         </div>
         <div className="md:w-1/2"></div>
      </section>

      {/* Feature Section 2 */}
      <section className="flex flex-col md:flex-row-reverse items-center justify-between min-h-[100dvh] px-8 md:px-24 pb-32">
         <div className="md:w-1/2 pointer-events-auto text-right">
            <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-emerald-400 to-cyan-400 mb-6">
              Discover Anomalies
            </h2>
            <p className="text-xl text-slate-400 mb-8 leading-relaxed">
              Document new exoplanets, capture black hole telemetry, and save your celestial discoveries to your personal captain's log for future explorers.
            </p>
            <Link to="/explore" className="inline-block bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 py-3 rounded-full font-semibold transition-colors backdrop-blur-sm">
              View Database
            </Link>
         </div>
         <div className="md:w-1/2"></div>
      </section>
    </div>
  );
}

function Explore() {
  const { user } = useAuth();
  const [discoveries, setDiscoveries] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [showUI, setShowUI] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchDiscoveries = async () => {
      setLoadingDb(true);
      try {
        const q = query(collection(db, 'discoveries'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDiscoveries(data);
      } catch (err) {
        handleFirestoreError(err, 'list', 'discoveries');
        console.error("Error fetching", err);
      } finally {
        setLoadingDb(false);
      }
    };
    fetchDiscoveries();
  }, [user]);

  const saveDiscovery = async (item: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'discoveries'), {
        userId: user.uid,
        name: item.name,
        type: item.type,
        distance: item.dist,
        timestamp: serverTimestamp()
      });
      alert(`Saved ${item.name} to your discoveries!`);
      const q = query(collection(db, 'discoveries'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDiscoveries(data);
    } catch (err) {
      handleFirestoreError(err, 'create', 'discoveries');
      console.error("Error saving", err);
      alert("Error saving discovery. Ensure Firebase rules are set up.");
    }
  };
  
  if (!user) {
    return (
      <div className="relative z-10 flex items-center justify-center min-h-[100dvh] pt-20 px-4 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl text-center max-w-md pointer-events-auto"
        >
          <UserIcon className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Restricted Area</h2>
          <p className="text-slate-400 mb-6">You must be logged in to access the deep space exploration tools and save your discoveries.</p>
          <p className="text-sm text-indigo-300">Use the Sign In button in the navigation bar to continue.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-[100dvh] pt-24 px-6 md:px-12 pointer-events-none pb-12 overflow-hidden">
      {/* Floating Toggle */}
      <div className="absolute bottom-8 right-8 pointer-events-auto z-20">
        <button 
          onClick={() => setShowUI(!showUI)}
          className="bg-indigo-600/80 hover:bg-indigo-500 backdrop-blur-md text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all flex items-center gap-2"
        >
          <Code className="w-4 h-4" />
          {showUI ? 'Immersive Mode' : 'Show Interface'}
        </button>
      </div>

      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md pointer-events-auto flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide max-h-[80vh]"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
              <h1 className="text-2xl font-bold text-white mb-1">Command Center</h1>
              <p className="text-slate-400">Welcome back, Captain {user.email?.split('@')[0]}</p>
              
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-4">Available Targets</h2>
                <div className="space-y-3">
                  {[
                    { name: 'Aurora Nebula', dist: '4,000 ly', type: 'Emission Nebula', color: 'bg-purple-500/20', border: 'border-purple-500/30' },
                    { name: 'Kepler-186f', dist: '500 ly', type: 'Exoplanet', color: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
                    { name: 'Cygnus X-1', dist: '6,000 ly', type: 'Black Hole', color: 'bg-orange-500/20', border: 'border-orange-500/30' },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      onClick={() => saveDiscovery(item)}
                      className={`bg-white/5 border ${item.border} rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer group flex justify-between items-center`}
                    >
                      <div>
                        <h3 className="font-bold text-white text-sm">{item.name}</h3>
                        <p className="text-xs text-slate-400">{item.type}</p>
                      </div>
                      <span className="text-[10px] text-white bg-indigo-500/20 px-2 py-1 rounded-full border border-indigo-500/30">Save</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-4">Logged Discoveries</h2>
                {loadingDb ? (
                  <p className="text-slate-400 text-xs">Accessing database...</p>
                ) : discoveries.length === 0 ? (
                  <p className="text-slate-500 text-xs italic">No data logged in current sector.</p>
                ) : (
                   <div className="grid grid-cols-2 gap-3">
                     {discoveries.map((doc, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-lg">
                        <h4 className="font-semibold text-indigo-300 text-xs truncate">{doc.name}</h4>
                        <p className="text-[10px] text-slate-500">{doc.distance}</p>
                      </div>
                     ))}
                   </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showUI && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-24 left-1/2 -translate-x-1/2 text-center"
        >
          <p className="text-slate-400 text-sm font-medium tracking-[0.2em] uppercase">Interactive Planetary System</p>
          <p className="text-xs text-slate-500 mt-2">Click and drag to rotate • Scroll to zoom • Click planets for data</p>
        </motion.div>
      )}
    </div>
  );
}

function BackgroundScene() {
  const { user } = useAuth();
  const location = useLocation();
  const isExplore = location.pathname === '/explore';

  return (
    <div className="fixed inset-0 z-0 text-white">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          {isExplore && user ? (
            <PlanetExplorer key="explorer" />
          ) : (
            <SpaceScene key="nebula" />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

import { GeminiChat } from './components/GeminiChat';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02040a] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="relative w-full min-h-screen bg-[#02040a] overflow-x-hidden text-slate-50 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <BackgroundScene />
        
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global AI Chat Assistant */}
        <GeminiChat />
      </div>
    </Router>
  );
}
