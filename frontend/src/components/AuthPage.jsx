import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  // LOGIN STATES
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // SIGNUP STATES
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // For success messages like password reset
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* =========================================================================
      AUTH LOGIC
  ========================================================================= */

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err) {
      setError(formatError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupEmail,
        signupPassword
      );

      await updateProfile(userCredential.user, {
        displayName: fullName,
      });
    } catch (err) {
      setError(formatError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError("Google sign in failed. Please try again.");
    }
  };

  const handleForgotPassword = async () => {
    const email = isSignUp ? signupEmail : loginEmail;
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link sent to your email!");
    } catch (err) {
      setError(formatError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const formatError = (code) => {
    const msg = code?.replace("auth/", "").replace(/-/g, " ") || "An error occurred";
    return msg.charAt(0).toUpperCase() + msg.slice(1);
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden px-4">
      
      {/* BACKGROUND IMAGE & OVERLAY */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(
              to top,
              rgba(0,0,0,0.96),
              rgba(0,0,0,0.75),
              rgba(0,0,0,0.96)
            ),
            url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1974&auto=format&fit=crop')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* AMBIENT GLOW */}
      <div className="absolute w-[500px] h-[500px] bg-red-600/20 blur-[120px] rounded-full top-[-150px] left-[-100px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-red-500/10 blur-[100px] rounded-full bottom-[-100px] right-[-100px] pointer-events-none" />

      {/* HEADER NAV */}
      <div className="absolute top-8 left-4 md:left-8 z-20 flex items-center gap-6">
        <button 
          onClick={() => navigate("/")} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group"
        >
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 border border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
        </button>

        <h1 className="text-red-600 text-3xl md:text-5xl font-black tracking-tighter cursor-default">
          CINENOVA
        </h1>
      </div>

      {/* AUTH CARD */}
      <div className="relative z-10 w-full max-w-md pt-12">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
          
          {/* SWITCHER */}
          <div className="flex bg-white/5 rounded-2xl p-1 mb-8">
            <button
              onClick={() => { setIsSignUp(false); setError(""); setMessage(""); }}
              className={`flex-1 py-3 rounded-xl font-bold transition ${!isSignUp ? "bg-red-600 text-white" : "text-gray-400"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(""); setMessage(""); }}
              className={`flex-1 py-3 rounded-xl font-bold transition ${isSignUp ? "bg-red-600 text-white" : "text-gray-400"}`}
            >
              Sign Up
            </button>
          </div>

          {/* STATUS MESSAGES */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl text-sm animate-pulse">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-300 p-4 rounded-xl text-sm">
              {message}
            </div>
          )}

          {!isSignUp ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <h2 className="text-4xl font-black text-white mb-2">Welcome Back</h2>
                <p className="text-gray-400">Sign in to continue watching.</p>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-semibold">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full h-14 px-5 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-red-500 placeholder:text-gray-600 transition-all"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-semibold">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full h-14 px-5 pr-12 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-red-500 placeholder:text-gray-600 transition-all"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer group">
                  <input type="checkbox" className="accent-red-600 w-4 h-4 rounded" />
                  <span className="group-hover:text-gray-300 transition">Remember me</span>
                </label>
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-red-500 hover:text-red-400 transition font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white font-black text-lg transition shadow-lg shadow-red-600/30"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <h2 className="text-4xl font-black text-white mb-2">Create Account</h2>
                <p className="text-gray-400">Join CineNova for the best cinema experience.</p>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-semibold">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full h-14 px-5 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-red-500 placeholder:text-gray-600 transition-all"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-semibold">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full h-14 px-5 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-red-500 placeholder:text-gray-600 transition-all"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-semibold">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="w-full h-14 px-5 pr-12 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-red-500 placeholder:text-gray-600 transition-all"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-semibold">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="w-full h-14 px-5 pr-12 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-red-500 placeholder:text-gray-600 transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 text-sm text-gray-400 cursor-pointer group">
                <input type="checkbox" className="mt-1 accent-red-600" required />
                <span className="group-hover:text-gray-300 transition">
                  I agree to the <span className="text-red-500 underline">Terms of Service</span> and <span className="text-red-500 underline">Privacy Policy</span>.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white font-black text-lg transition shadow-lg shadow-red-600/30"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          {/* SOCIAL LOGIN */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full h-14 rounded-xl bg-white hover:bg-gray-100 text-black font-bold transition flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}