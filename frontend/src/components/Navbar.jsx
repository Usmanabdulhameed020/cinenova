import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, LogOut, Trash2, ChevronDown } from "lucide-react";
import { signOut, deleteUser } from "firebase/auth";
import { auth } from "../firebase";
import { API, TMDB_API_KEY, IMG } from "../config";

export default function Navbar({ onSearchClick, user, onSuggestionClick }) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // MODAL & DROPDOWN STATES
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // SUGGESTION FETCHING
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(
          `${API}/search/multi?query=${encodeURIComponent(searchQuery)}&api_key=${TMDB_API_KEY}`
        );
        const json = await res.json();
        setSuggestions(json.results?.slice(0, 6) || []);
      } catch (err) {
        console.error("Suggestion Fetch Error:", err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchClick(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (item) => {
    onSuggestionClick(item.id, item.media_type);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // 1. Delete user data from backend
        await fetch(`/api/watchlist/user/${currentUser.uid}`, {
          method: 'DELETE'
        });

        // 2. Delete user from Firebase
        await deleteUser(currentUser);
      }
    } catch (error) {
      console.error("Delete Account Error:", error);
      alert("For security reasons, please log in again before deleting your account.");
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-[100] transition-all duration-500 px-4 md:px-12 py-4 flex justify-between items-center ${
          isScrolled
            ? "bg-black"
            : "bg-transparent bg-gradient-to-b from-black/80 to-transparent"
        }`}
      >
        <h1
          onClick={() => navigate("/home")}
          className="text-red-600 text-2xl md:text-4xl font-black tracking-tighter cursor-pointer"
        >
          CINENOVA
        </h1>

        <div className="flex items-center gap-4">
          <div className="relative" ref={searchRef}>
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-black/40 border border-gray-500 rounded-full px-4 py-1"
            >
              <input
                type="text"
                placeholder="Search movies..."
                className="bg-transparent outline-none text-sm w-32 md:w-64 text-white placeholder:text-gray-400"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="ml-2 text-gray-400">
                <Search size={18} />
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#181818] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_.2s_ease-out] z-[110]">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSuggestionClick(item)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-all border-b border-white/5 last:border-0"
                  >
                    <img
                      src={item.poster_path || item.profile_path ? `${IMG}w92${item.poster_path || item.profile_path}` : "https://via.placeholder.com/45x68?text=No+Img"}
                      alt=""
                      className="w-10 h-14 object-cover rounded bg-gray-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">
                        {item.title || item.name}
                      </p>
                      <p className="text-gray-500 text-xs uppercase font-black">
                        {item.media_type} • {(item.release_date || item.first_air_date)?.split("-")[0] || "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 md:pr-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-red-600/50" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              )}
              <span className="hidden md:block text-sm font-bold text-gray-200">
                {user?.displayName?.split(' ')[0] || "User"}
              </span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-64 bg-[#181818] border border-white/10 rounded-2xl shadow-2xl py-3 z-[110] animate-[fadeIn_.2s_ease-out]">
                <div className="px-5 py-3 border-b border-white/5 mb-2">
                  <p className="text-white font-black truncate">{user?.displayName || "CineNova User"}</p>
                  <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                </div>
                <button onClick={() => { setShowDropdown(false); setShowLogoutModal(true); }} className="w-full flex items-center gap-3 px-5 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold">
                  <LogOut size={18} /> Sign Out
                </button>
                <div className="h-px bg-white/5 my-2" />
                <button onClick={() => { setShowDropdown(false); setShowDeleteModal(true); }} className="w-full flex items-center gap-3 px-5 py-3 text-red-500 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm font-semibold">
                  <Trash2 size={18} /> Delete Account
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#181818] w-full max-w-md rounded-2xl p-8 shadow-2xl border border-gray-800 animate-[fadeIn_.2s_ease-in-out]">
            <h2 className="text-2xl font-black text-white mb-3">Logout?</h2>
            <p className="text-gray-400 mb-8">Are you sure you want to logout from your account?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-white font-semibold">Cancel</button>
              <button onClick={confirmLogout} className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-white font-bold">Logout</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
          <div className="bg-[#181818] w-full max-w-md rounded-2xl p-8 shadow-2xl border border-red-900/30 animate-[fadeIn_.2s_ease-in-out]">
            <div className="w-12 h-12 bg-red-600/10 rounded-full flex items-center justify-center mb-6">
              <Trash2 className="text-red-600" size={24} />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Delete Account?</h2>
            <p className="text-gray-400 mb-8">This action is permanent and will remove all your watchlist data. You cannot undo this.</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDeleteAccount} className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 transition text-white font-black shadow-lg shadow-red-600/20">Yes, Delete Everything</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition text-white font-bold">Wait, Go Back</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
