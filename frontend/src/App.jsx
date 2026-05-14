import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Home from "./components/Home";

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Loading Splash Screen
  if (user === undefined) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-red-600 text-5xl font-black animate-pulse">
        CINENOVA
      </div>
    );
  }

  return (
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
      {/* Fallback route */}
      <Route path="*" element={<Navigate to={user ? "/home" : "/"} replace />} />
    </Routes>
  );
}