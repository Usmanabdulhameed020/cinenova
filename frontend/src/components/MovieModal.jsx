import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { auth } from "../firebase";
import { API, TMDB_API_KEY, IMG } from "../config";

export default function MovieModal({ id, type, onClose, showToast }) {
  const [details, setDetails] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setTrailerUrl("");
    setDetails(null);
    setIsLoading(true);

    const getModalData = async () => {
      try {
        const detailRes = await fetch(`${API}/${type}/${id}?api_key=${TMDB_API_KEY}`);
        const detailJson = await detailRes.json();
        if (!isMounted) return;
        setDetails(detailJson);

        const videoRes = await fetch(`${API}/${type}/${id}/videos?api_key=${TMDB_API_KEY}`);
        const videoJson = await videoRes.json();
        const videos = videoJson.results || [];

        const found =
          videos.find((v) => (v.site === "YouTube" || v.site === "Vimeo") && v.type === "Trailer" && v.official) ||
          videos.find((v) => (v.site === "YouTube" || v.site === "Vimeo") && v.type === "Trailer") ||
          videos.find((v) => v.site === "YouTube" || v.site === "Vimeo");

        if (found) {
          const url = found.site === "YouTube" 
            ? `https://www.youtube.com/watch?v=${found.key}` 
            : `https://vimeo.com/${found.key}`;
          setTrailerUrl(url);
        }
      } catch (err) {
        console.error("Modal Data Fetch Error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    getModalData();
    return () => { isMounted = false; };
  }, [id, type]);

  if (!details && isLoading)
    return (
      <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>
    );

  if (!details) return null;

  const handleAddToWatchlist = async () => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser?.uid,
          movieId: details.id,
          title: details.title || details.name,
          posterPath: details.poster_path || details.backdrop_path,
          mediaType: type
        })
      });
      if (response.ok) {
        showToast("Added to Watchlist!", "success");
        window.dispatchEvent(new CustomEvent('watchlistUpdated'));
      } else {
        const data = await response.json();
        showToast(data.message || "Error adding to watchlist", "error");
      }
    } catch (err) {
      showToast("Connection error", "error");
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/95 z-[200] flex justify-center items-center p-4 backdrop-blur-sm">
      <div onClick={(e) => e.stopPropagation()} className="bg-[#181818] max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar rounded-xl relative shadow-2xl border border-white/5">
        <button onClick={onClose} className="absolute top-4 right-4 text-white z-50 bg-black/50 w-10 h-10 rounded-full hover:bg-white/20 transition flex items-center justify-center">
          <X size={24} />
        </button>

        <div className="relative pt-[56.25%] bg-black overflow-hidden">
          {trailerUrl ? (
            <iframe
              src={trailerUrl.includes('youtube') 
                ? `${trailerUrl.replace('watch?v=', 'embed/')}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&enablejsapi=1&origin=${window.location.origin}`
                : trailerUrl
              }
              className="absolute top-0 left-0 w-full h-full border-0"
              allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Trailer"
            ></iframe>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <img src={`${IMG}original${details.backdrop_path}`} className="w-full h-full object-cover opacity-30" alt="" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-white font-bold text-lg uppercase tracking-tighter bg-black/60 px-4 py-2 rounded">Trailer Unavailable</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase italic text-white leading-tight">{details.title || details.name}</h2>
              <div className="flex gap-4 mt-2 text-sm font-bold items-center">
                <span className="text-green-500">{Math.round(details.vote_average * 10)}% Match</span>
                <span className="text-gray-400 border border-gray-700 px-2 py-0.5 rounded">{(details.release_date || details.first_air_date)?.split("-")[0]}</span>
                {trailerUrl && <a href={trailerUrl} target="_blank" rel="noreferrer" className="text-red-500 hover:text-red-400 underline decoration-2 underline-offset-4 transition-colors">Open in YouTube</a>}
              </div>
            </div>
            <button onClick={handleAddToWatchlist} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-black text-lg transition flex items-center gap-2 shadow-xl shadow-red-600/20 active:scale-95">
              + Watchlist
            </button>
          </div>
          <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">{details.overview}</p>
          {details.genres && (
            <div className="flex flex-wrap gap-2 mt-6">
              {details.genres.map(g => (
                <span key={g.id} className="text-xs font-bold text-gray-500 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/5">{g.name}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
