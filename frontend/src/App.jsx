import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Home from "./components/Home";
import AdminPage from "./components/AdminPage";

import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// Protected Route Component
const ProtectedRoute = ({ user, children }) => {
  if (user === null) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Public Route Component (redirects to /home if logged in)
const PublicRoute = ({ user, children }) => {
  if (user) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

export default function App() {
  const [user, setUser] = useState(undefined);
  const [isSimulator, setIsSimulator] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Loading Splash Screen
  if (user === undefined) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-red-600 text-5xl font-black animate-pulse">
        CINENOVA
      </div>
    );
  }

  const appContent = (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute user={user}>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/auth"
        element={
          <PublicRoute user={user}>
            <AuthPage />
          </PublicRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute user={user}>
            <Home user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute user={user}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      {/* Fallback route */}
      <Route path="*" element={<Navigate to={user ? "/home" : "/"} replace />} />
    </Routes>
  );

  if (isSimulator) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-[9999] select-none font-sans overflow-hidden">
        {isOffline && (
          <div className="fixed top-0 left-0 right-0 z-[99999] bg-red-650 text-white font-bold text-center text-[10px] py-1.5 shadow-lg flex items-center justify-center gap-2 animate-[slideDown_0.3s_ease-out]">
            <span className="animate-pulse">📡</span> PWA Offline Mode
          </div>
        )}
        
        {/* Top Control Bar */}
        <div className="mb-4 flex items-center gap-4 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full shadow-lg">
          <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Mobile Preview Mode</span>
          <button 
            onClick={() => setIsSimulator(false)}
            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-full font-black uppercase transition-all duration-200 active:scale-95"
          >
            Exit Simulator
          </button>
        </div>
        
        {/* Simulated Device Frame */}
        <div className="w-[375px] h-[812px] bg-black rounded-[50px] border-[12px] border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[160px] h-[28px] bg-black rounded-b-[18px] z-[10000]" />
          
          {/* Status Bar */}
          <div className="h-[44px] bg-transparent absolute top-0 left-0 right-0 z-[9999] flex justify-between items-center px-8 text-white font-bold text-[12px] pointer-events-none">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">5G</span>
              <div className="w-5 h-2.5 border border-white/60 rounded-[3px] p-[1px] flex items-center">
                <div className="h-full w-full bg-white rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Inner Content Screen */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative rounded-[38px] bg-black">
            {appContent}
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[140px] h-[5px] bg-white/40 rounded-full z-[10000]" />
        </div>
      </div>
    );
  }

  return (
    <>
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-[99999] bg-red-600 text-white font-bold text-center text-xs md:text-sm py-2 shadow-lg flex items-center justify-center gap-2 animate-[slideDown_0.3s_ease-out]">
          <span className="animate-pulse">📡</span> You are currently offline. Browsing in offline PWA mode.
        </div>
      )}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
      `}</style>
      {appContent}
      <button 
        onClick={() => setIsSimulator(true)}
        className="fixed bottom-6 right-6 z-[999] bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2 active:scale-95 group font-bold text-xs"
      >
        <span className="text-base">📱</span>
        <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-500 ease-out whitespace-nowrap">Mobile View</span>
      </button>
    </>
  );
}