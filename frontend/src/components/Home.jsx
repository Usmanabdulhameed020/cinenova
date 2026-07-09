import React, { useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Row from "./Row";
import MovieModal from "./MovieModal";
import Toast from "./Toast";
import WatchlistRow from "./WatchlistRow";
import RecentlyWatchedRow from "./RecentlyWatchedRow";
import { ENDPOINTS } from "../config";

const CATEGORIES = [
  { id: 'all', label: 'All Content' },
  { id: 'recent', label: 'Recently Watched' },
  { id: 'watchlist', label: 'My Watchlist' },
  { id: 'trending', label: 'Trending' },
  { id: 'top_rated', label: 'Top Rated' },
  { id: 'tv', label: 'TV Shows' },
  { id: 'action', label: 'Action' },
  { id: 'kdrama', label: 'K-Drama' },
  { id: 'cdrama', label: 'C-Drama' },
  { id: 'english', label: 'English Movies' },
  { id: 'nollywood', label: 'Nollywood' },
  { id: 'bollywood', label: 'Bollywood' },
  { id: 'anime', label: 'Anime' },
  { id: 'yoruba', label: 'Yoruba' }
];

export default function Home({ user }) {
  const [selected, setSelected] = useState(null);
  const [searchUrl, setSearchUrl] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  
  const [activeProfile, setActiveProfile] = useState(() => {
    if (!user) return { id: 'adult', name: 'Adult', isKids: false };
    const saved = localStorage.getItem(`cineflow_profile_${user?.uid}`);
    return saved ? JSON.parse(saved) : null;
  });

  React.useEffect(() => {
    if (!user) {
      setActiveProfile({ id: 'adult', name: 'Adult', isKids: false });
      return;
    }
    const saved = localStorage.getItem(`cineflow_profile_${user.uid}`);
    if (saved) {
      setActiveProfile(JSON.parse(saved));
    } else {
      setActiveProfile(null);
    }
  }, [user]);

  // Listen for profile switch events from Navbar
  React.useEffect(() => {
    const handleSwitch = () => {
      setActiveProfile(null);
    };
    window.addEventListener('switchProfile', handleSwitch);
    return () => window.removeEventListener('switchProfile', handleSwitch);
  }, []);

  const selectProfile = (profile) => {
    if (user) {
      localStorage.setItem(`cineflow_profile_${user.uid}`, JSON.stringify(profile));
    }
    setActiveProfile(profile);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSearch = (query) => {
    setSearchUrl(
      `/search/multi?query=${encodeURIComponent(query)}`
    );
    setActiveCategory("all");

    window.scrollTo({
      top: 400,
      behavior: "smooth",
    });
  };

  if (user && !activeProfile) {
    return (
      <div className="bg-gray-950 text-white min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/20 via-gray-950 to-gray-950 opacity-40"></div>
        <h1 className="text-4xl md:text-5xl font-black mb-12 relative z-10 tracking-tight">Who's Watching?</h1>
        <div className="flex gap-8 relative z-10">
          <button 
            onClick={() => selectProfile({ id: 'adult', name: 'Adult', isKids: false })}
            className="group flex flex-col items-center"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-6xl shadow-xl group-hover:scale-105 group-hover:ring-4 group-hover:ring-accent transition-all duration-300">
              🍿
            </div>
            <span className="mt-4 text-xl font-medium text-gray-300 group-hover:text-white transition-colors">Adult</span>
          </button>
          
          <button 
            onClick={() => selectProfile({ id: 'kids', name: 'Kids', isKids: true })}
            className="group flex flex-col items-center"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-6xl shadow-xl group-hover:scale-105 group-hover:ring-4 group-hover:ring-blue-500 transition-all duration-300">
              🐣
            </div>
            <span className="mt-4 text-xl font-medium text-gray-300 group-hover:text-white transition-colors">Kids</span>
          </button>
        </div>
      </div>
    );
  }

  const visibleCategories = CATEGORIES.filter(cat => {
    if (activeProfile?.isKids) {
      return ['all', 'recent', 'watchlist', 'anime'].includes(cat.id);
    }
    return true;
  });

  return (
    <div className="bg-gray-950 text-white min-h-screen selection:bg-red-600 overflow-x-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <Navbar 
        onSearchClick={handleSearch} 
        user={user} 
        onSuggestionClick={(id, type) => setSelected({ id, type })}
        showToast={showToast}
      />

      <Hero onClick={(id, type) => setSelected({ id, type })} activeProfile={activeProfile} />

      {/* Category Tabs */}
      <div className="flex space-x-3 overflow-x-scroll no-scrollbar py-6 px-4 md:px-12 relative z-30 -mt-8 scroll-smooth select-none">
        {visibleCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-300 border active:scale-95 shrink-0 shadow-md ${
              activeCategory === cat.id
                ? "bg-accent border-accent text-white shadow-accent"
                : "bg-[#181818]/60 border-white/5 text-gray-400 hover:text-white hover:bg-white/5 backdrop-blur-md"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="relative z-20 pb-20 mt-4">
        {(activeCategory === 'all' || activeCategory === 'recent') && (
          <RecentlyWatchedRow 
            onClick={(id, type) => setSelected({ id, type })}
            showToast={showToast}
            activeProfile={activeProfile}
          />
        )}

        {(activeCategory === 'all' || activeCategory === 'watchlist') && (
          <WatchlistRow 
            onClick={(id, type) => setSelected({ id, type })}
            showToast={showToast}
            activeProfile={activeProfile}
          />
        )}

        {searchUrl && (
          <Row
            title="Search Results"
            url={searchUrl}
            onClick={(id, type) =>
              setSelected({ id, type })
            }
          />
        )}

        {!activeProfile?.isKids && (activeCategory === 'all' || activeCategory === 'trending') && (
          <Row
            title="Trending Now"
            url={ENDPOINTS.TRENDING}
            onClick={(id, type) =>
              setSelected({ id, type })
            }
          />
        )}

        {activeProfile?.isKids && (activeCategory === 'all' || activeCategory === 'trending') && (
          <Row
            title="Kids & Family"
            url="/discover/movie?with_genres=16,10751"
            onClick={(id, type) =>
              setSelected({ id, type })
            }
          />
        )}

        {!activeProfile?.isKids && (activeCategory === 'all' || activeCategory === 'top_rated') && (
          <Row
            title="Top Rated"
            url={ENDPOINTS.TOP_RATED}
            onClick={(id, type) =>
              setSelected({ id, type })
            }
          />
        )}

        {!activeProfile?.isKids && (activeCategory === 'all' || activeCategory === 'tv') && (
          <Row
            title="TV Series"
            url={ENDPOINTS.TV}
            onClick={(id, type) =>
              setSelected({ id, type })
            }
          />
        )}

        {!activeProfile?.isKids && (activeCategory === 'all' || activeCategory === 'action') && (
          <Row
            title="Action Packed"
            url={ENDPOINTS.ACTION}
            onClick={(id, type) =>
              setSelected({ id, type })
            }
          />
        )}

        {!activeProfile?.isKids && (activeCategory === 'all' || activeCategory === 'kdrama') && (
          <Row
            title="K-Drama Series"
            url={ENDPOINTS.KDRAMA}
            onClick={(id, type) =>
              setSelected({ id, type })
            }
          />
        )}

        {!activeProfile?.isKids && (activeCategory === 'all' || activeCategory === 'cdrama') && (
          <Row
            title="C-Drama Series"
            url={ENDPOINTS.CDRAMA}
            onClick={(id, type) =>
              setSelected({ id, type })
            }
          />
        )}

        {!activeProfile?.isKids && (activeCategory === 'all' || activeCategory === 'english') && (
          <Row
            title="English Movies"
            url={ENDPOINTS.ENGLISH}
            onClick={(id, type) =>
              setSelected({ id, type })
            }
          />
        )}

        {!activeProfile?.isKids && (activeCategory === 'all' || activeCategory === 'nollywood') && (
          <Row
            title="Nollywood Movies"
            url={ENDPOINTS.NOLLYWOOD}
            onClick={(id, type) =>
              setSelected({ id, type })
            }
          />
        )}

        {!activeProfile?.isKids && (activeCategory === 'all' || activeCategory === 'bollywood') && (
          <Row
            title="Bollywood Movies"
            url={ENDPOINTS.BOLLYWOOD}
            onClick={(id, type) =>
              setSelected({ id, type })
            }
          />
        )}

        {(activeCategory === 'all' || activeCategory === 'anime') && (
          <Row
            title="Anime Collection"
            url={ENDPOINTS.ANIME}
            onClick={(id, type) =>
              setSelected({ id, type })
            }
          />
        )}

        {!activeProfile?.isKids && (activeCategory === 'all' || activeCategory === 'yoruba') && (
          <Row
            title="Yoruba Cinema"
            url={ENDPOINTS.YORUBA}
            onClick={(id, type) =>
              setSelected({ id, type })
            }
          />
        )}

        {!activeProfile?.isKids && activeCategory === 'all' && (
          <Row
            title="Coming Soon"
            url={ENDPOINTS.UPCOMING}
            onClick={(id, type) =>
              setSelected({ id, type })
            }
          />
        )}
      </div>

      {selected && (
        <MovieModal
          id={selected.id}
          type={selected.type}
          onClose={() => setSelected(null)}
          onSimilarClick={(id, type) => setSelected({ id, type })}
          showToast={showToast}
        />
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
