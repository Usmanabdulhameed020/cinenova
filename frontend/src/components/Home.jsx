import React, { useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Row from "./Row";
import MovieModal from "./MovieModal";
import Toast from "./Toast";
import WatchlistRow from "./WatchlistRow";
import { ENDPOINTS } from "../config";

export default function Home({ user }) {
  const [selected, setSelected] = useState(null);
  const [searchUrl, setSearchUrl] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSearch = (query) => {
    setSearchUrl(
      `/search/multi?query=${encodeURIComponent(query)}`
    );

    window.scrollTo({
      top: 400,
      behavior: "smooth",
    });
  };

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
      />

      <Hero onClick={(id, type) => setSelected({ id, type })} />

      <div className="-mt-20 relative z-20 pb-20">
        <WatchlistRow 
          onClick={(id, type) => setSelected({ id, type })}
          showToast={showToast}
        />

        {searchUrl && (
          <Row
            title="Search Results"
            url={searchUrl}
            onClick={(id, type) =>
              setSelected({ id, type })
            }
          />
        )}

        <Row
          title="Trending Now"
          url={ENDPOINTS.TRENDING}
          onClick={(id, type) =>
            setSelected({ id, type })
          }
        />

        <Row
          title="Top Rated"
          url={ENDPOINTS.TOP_RATED}
          onClick={(id, type) =>
            setSelected({ id, type })
          }
        />

        <Row
          title="TV Series"
          url={ENDPOINTS.TV}
          onClick={(id, type) =>
            setSelected({ id, type })
          }
        />

        <Row
          title="Action Packed"
          url={ENDPOINTS.ACTION}
          onClick={(id, type) =>
            setSelected({ id, type })
          }
        />

        <Row
          title="Coming Soon"
          url={ENDPOINTS.UPCOMING}
          onClick={(id, type) =>
            setSelected({ id, type })
          }
        />
      </div>

      {selected && (
        <MovieModal
          id={selected.id}
          type={selected.type}
          onClose={() => setSelected(null)}
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
