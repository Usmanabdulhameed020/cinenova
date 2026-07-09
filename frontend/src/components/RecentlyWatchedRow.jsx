import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const IMG = "https://image.tmdb.org/t/p/";

export default function RecentlyWatchedRow({ onClick, showToast }) {
  const [items, setItems] = useState([]);
  const rowRef = useRef(null);

  const fetchRecent = () => {
    try {
      const userId = auth.currentUser?.uid || 'guest';
      const key = `cineflow_recent_${userId}`;
      const stored = localStorage.getItem(key);
      setItems(stored ? JSON.parse(stored) : []);
    } catch (err) {
      console.error("Error fetching recently watched:", err);
    }
  };

  useEffect(() => {
    fetchRecent();
    
    // Listen for manual additions when play mode is triggered
    window.addEventListener('recentMoviesUpdated', fetchRecent);
    
    // Listen for auth state changes to reload user-specific history
    const unsubscribe = onAuthStateChanged(auth, () => {
      fetchRecent();
    });

    return () => {
      window.removeEventListener('recentMoviesUpdated', fetchRecent);
      unsubscribe();
    };
  }, []);

  const handleClearItem = (e, id, mediaType) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const userId = auth.currentUser?.uid || 'guest';
      const key = `cineflow_recent_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        let list = JSON.parse(stored);
        list = list.filter(item => !(item.id === id && item.mediaType === mediaType));
        localStorage.setItem(key, JSON.stringify(list));
        fetchRecent();
        showToast("Removed from recently watched", "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const slide = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.7 : scrollLeft + clientWidth * 0.7;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!items?.length) return null;

  return (
    <section className="relative px-4 md:px-12 py-4">
      <h2 className="text-xl md:text-2xl font-bold mb-2 text-red-500 tracking-wide uppercase italic">
        Recently Watched
      </h2>

      <div className="group relative">
        <button onClick={() => slide("left")} className="absolute left-0 top-0 bottom-0 z-40 w-12 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white flex items-center justify-center rounded-l-md">
          <ChevronLeft size={40} />
        </button>

        <div ref={rowRef} className="flex space-x-4 overflow-x-scroll no-scrollbar scroll-smooth py-4">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.mediaType}`}
              className="relative flex-none w-36 md:w-56 transition-transform duration-300 ease-in-out hover:scale-110 hover:z-50 shadow-xl group/card"
            >
              {/* Main Clickable Area (Poster) */}
              <div 
                onClick={() => onClick(item.id, item.mediaType)}
                className="cursor-pointer relative rounded-md overflow-hidden"
              >
                <img
                  src={`${IMG}w500${item.poster_path}`}
                  alt={item.title}
                  className="rounded-md object-cover w-full h-auto aspect-[2/3] bg-gray-800"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-4 rounded-md">
                  <p className="text-white font-bold text-sm truncate">{item.title}</p>
                  <p className="text-red-500 text-xs font-bold uppercase tracking-wider">{item.mediaType}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="absolute top-2 right-2 flex flex-col gap-2 z-[60]">
                <button 
                  onClick={(e) => handleClearItem(e, item.id, item.mediaType)}
                  className="p-2 bg-black/60 hover:bg-red-600 rounded-full text-white backdrop-blur-md border border-white/10 hover:scale-110 transition opacity-0 group-hover/card:opacity-100 shadow-md"
                  title="Remove from History"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => slide("right")} className="absolute right-0 top-0 bottom-0 z-40 w-12 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white flex items-center justify-center rounded-r-md">
          <ChevronRight size={40} />
        </button>
      </div>
    </section>
  );
}
