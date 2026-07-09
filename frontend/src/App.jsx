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

  if (user === undefined) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
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
    </>
  );
}