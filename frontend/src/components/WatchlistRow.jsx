import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { auth } from "../firebase";
import ConfirmModal from "./ConfirmModal";

const IMG = "https://image.tmdb.org/t/p/";

export default function WatchlistRow({ onClick, showToast }) {
  const [items, setItems] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const rowRef = useRef(null);

  const fetchWatchlist = async () => {
    if (!auth.currentUser) return;
    try {
      const res = await fetch(`/api/watchlist/${auth.currentUser.uid}`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWatchlist();
    window.addEventListener('watchlistUpdated', fetchWatchlist);
    return () => window.removeEventListener('watchlistUpdated', fetchWatchlist);
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/watchlist/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(items.filter(item => item._id !== deleteId));
        showToast("Removed from watchlist", "success");
      } else {
        showToast("Failed to delete", "error");
      }
    } catch (err) {
      showToast("Connection error", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const toggleStatus = async (e, id, currentStatus) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'watched' ? 'want_to_watch' : 'watched';
    try {
      const res = await fetch(`/api/watchlist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setItems(items.map(item => item._id === id ? { ...item, status: newStatus } : item));
        showToast(newStatus === 'watched' ? "Marked as watched" : "Moved back to watchlist", "success");
      }
    } catch (err) {
      showToast("Update failed", "error");
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
    <>
      <section className="relative px-4 md:px-12 py-4">
        <h2 className="text-xl md:text-2xl font-bold mb-2 text-red-500 tracking-wide">
          My Watchlist
        </h2>

        <div className="group relative">
          <button onClick={() => slide("left")} className="absolute left-0 top-0 bottom-0 z-40 w-12 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white flex items-center justify-center">
            <ChevronLeft size={40} />
          </button>

          <div ref={rowRef} className="flex space-x-4 overflow-x-scroll no-scrollbar scroll-smooth py-10">
            {items.map((item) => (
              <div
                key={item._id}
                className="relative flex-none w-36 md:w-56 transition-transform duration-300 ease-in-out hover:scale-110 hover:z-50 shadow-xl group/card"
              >
                {/* Main Clickable Area (Poster) */}
                <div 
                  onClick={() => onClick(item.movieId, item.mediaType)}
                  className="cursor-pointer"
                >
                  <img
                    src={`${IMG}w500${item.posterPath}`}
                    alt=""
                    className={`rounded-md object-cover w-full h-auto aspect-[2/3] bg-gray-800 ${item.status === 'watched' ? 'grayscale opacity-50' : ''}`}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-4 rounded-md">
                    <p className="text-white font-bold text-sm truncate">{item.title}</p>
                    <p className="text-red-500 text-xs font-semibold uppercase">{item.status.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                {/* Controls (Isolated from main click) */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 z-[60]">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleStatus(e, item._id, item.status);
                    }}
                    className={`p-2 rounded-full backdrop-blur-md border border-white/20 hover:scale-110 transition opacity-0 group-hover/card:opacity-100 ${item.status === 'watched' ? 'bg-green-500 text-white' : 'bg-black/50 text-gray-300'}`}
                    title={item.status === 'watched' ? "Mark as Unwatched" : "Mark as Watched"}
                  >
                    <Play size={14} fill={item.status === 'watched' ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation(); 
                      setDeleteId(item._id); 
                    }}
                    className="p-2 bg-red-600/80 hover:bg-red-600 rounded-full text-white backdrop-blur-md border border-white/20 hover:scale-110 transition opacity-0 group-hover/card:opacity-100"
                    title="Remove from Watchlist"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => slide("right")} className="absolute right-0 top-0 bottom-0 z-40 w-12 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white flex items-center justify-center">
            <ChevronRight size={40} />
          </button>
        </div>
      </section>

      {deleteId && (
        <ConfirmModal 
          title="Remove Movie?"
          message="This will remove the movie from your watchlist. Are you sure?"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
}
