import React, { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import DownloadModal from "./DownloadModal";
import { auth } from "../firebase";
import { API, TMDB_API_KEY, IMG, BACKEND_URL } from "../config";

export default function MovieModal({ id, type, onClose, onSimilarClick, showToast }) {
  const [details, setDetails] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [playMode, setPlayMode] = useState("trailer"); // "trailer" or "movie"
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Load custom settings
  const activeServer = localStorage.getItem("cineflow_setting_server") || "vidsrc.me";
  const settingAutoplay = localStorage.getItem("cineflow_setting_autoplay") !== "false";
  const settingMuted = localStorage.getItem("cineflow_setting_muted") !== "false";

  useEffect(() => {
    let isMounted = true;
    setTrailerUrl("");
    setDetails(null);
    setIsLoading(true);

    const getModalData = async () => {
      try {
        const detailRes = await fetch(`${API}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,similar`);
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

  const getProfileKeySuffix = (userId) => {
    try {
      if (userId === 'guest') return '';
      const savedProfile = localStorage.getItem(`cineflow_profile_${userId}`);
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        return profile.id === 'adult' ? '' : `_${profile.id}`;
      }
    } catch(e) {}
    return '';
  };

  useEffect(() => {
    if (playMode !== "movie" || !details) return;

    // runtime in minutes, fallback to 120 (movie) or 45 (tv series)
    const runtime = details.runtime || (details.episode_run_time && details.episode_run_time[0]) || (type === "tv" ? 45 : 120);
    const totalSeconds = runtime * 60;

    const userId = auth.currentUser?.uid || 'guest';
    const suffix = getProfileKeySuffix(userId);
    const key = `cineflow_recent_${userId}${suffix}`;
    const stored = localStorage.getItem(key);
    let list = stored ? JSON.parse(stored) : [];
    const existing = list.find(item => item.id === details.id && item.mediaType === type);
    let startSeconds = existing?.elapsedSeconds || 0;

    const interval = setInterval(() => {
      startSeconds += 5; // Track in 5 second steps
      const progressPercent = Math.min(Math.round((startSeconds / totalSeconds) * 100), 100);

      const updatedStored = localStorage.getItem(key);
      let updatedList = updatedStored ? JSON.parse(updatedStored) : [];
      
      updatedList = updatedList.map(item => {
        if (item.id === details.id && item.mediaType === type) {
          return {
            ...item,
            elapsedSeconds: startSeconds,
            progress: progressPercent,
            watchedAt: new Date().toISOString()
          };
        }
        return item;
      });

      localStorage.setItem(key, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('recentMoviesUpdated'));
    }, 5000);

    return () => clearInterval(interval);
  }, [playMode, details, type]);

  if (!details && isLoading)
    return (
      <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>
    );

  if (!details) return null;

  const handleAddToWatchlist = async () => {
    if (!auth.currentUser) {
      showToast("Please login to add to watchlist", "error");
      return;
    }

    try {
      const suffix = getProfileKeySuffix(auth.currentUser.uid);
      const userIdToSave = `${auth.currentUser.uid}${suffix}`;
      
      const response = await fetch(`${BACKEND_URL}/api/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdToSave,
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
        const status = response.status;
        let errorMessage = "Error adding to watchlist";
        try {
          const data = await response.json();
          console.error(`Watchlist API Error (${status}):`, data);
          errorMessage = data.message || errorMessage;
        } catch (e) {
          console.error(`Watchlist API Non-JSON Error (${status}):`, e);
        }
        showToast(errorMessage, "error");
      }
    } catch (err) {
      console.error("Watchlist API error:", err);
      showToast("Connection error - is the backend running?", "error");
    }
  };

  const addToRecent = () => {
    try {
      const userId = auth.currentUser?.uid || 'guest';
      const suffix = getProfileKeySuffix(userId);
      const key = `cineflow_recent_${userId}${suffix}`;
      const stored = localStorage.getItem(key);
      let list = stored ? JSON.parse(stored) : [];
      
      const existing = list.find(item => item.id === details.id && item.mediaType === type);
      
      list = list.filter(item => !(item.id === details.id && item.mediaType === type));
      
      list.unshift({
        id: details.id,
        title: details.title || details.name,
        poster_path: details.poster_path || details.backdrop_path,
        mediaType: type,
        watchedAt: new Date().toISOString(),
        progress: existing?.progress || 0,
        elapsedSeconds: existing?.elapsedSeconds || 0
      });
      
      if (list.length > 20) {
        list = list.slice(0, 20);
      }
      
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('recentMoviesUpdated'));
    } catch (err) {
      console.error("Error saving to recently watched:", err);
    }
  };

  const handlePlayMovie = () => {
    const nextMode = playMode === "movie" ? "trailer" : "movie";
    setPlayMode(nextMode);
    if (nextMode === "movie") {
      addToRecent();
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/95 z-[200] flex justify-center items-center p-4 backdrop-blur-sm">
      <div onClick={(e) => e.stopPropagation()} className="bg-[#181818] max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar rounded-xl relative shadow-2xl border border-white/5">
        <button onClick={onClose} className="absolute top-4 right-4 text-white z-50 bg-black/50 w-10 h-10 rounded-full hover:bg-white/20 transition flex items-center justify-center">
          <X size={24} />
        </button>

        <div className="relative pt-[56.25%] bg-black overflow-hidden">
          {playMode === "movie" ? (
            <iframe
              src={`https://${activeServer}/embed/${type === 'tv' ? 'tv' : 'movie'}?tmdb=${details.id}`}
              className="absolute top-0 left-0 w-full h-full border-0"
              allowFullScreen
              title="Full Movie"
            ></iframe>
          ) : trailerUrl ? (
            <iframe
              src={trailerUrl.includes('youtube') 
                ? `${trailerUrl.replace('watch?v=', 'embed/')}?autoplay=${settingAutoplay ? 1 : 0}&mute=${settingMuted ? 1 : 0}&controls=1&modestbranding=1&rel=0&enablejsapi=1&origin=${window.location.origin}`
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

        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase italic text-white leading-tight break-words">{details.title || details.name}</h2>
              <div className="flex flex-wrap gap-2 md:gap-4 mt-2 text-xs md:text-sm font-bold items-center">
                <span className="text-green-500">{Math.round(details.vote_average * 10)}% Match</span>
                <span className="text-gray-400 border border-gray-700 px-2 py-0.5 rounded">{(details.release_date || details.first_air_date)?.split("-")[0]}</span>
                <span className="text-gray-500 bg-white/10 px-2 py-0.5 rounded uppercase tracking-wider" title="Use this ID in the Admin Panel to link a video!">
                  TMDB ID: {details.id}
                </span>
                {trailerUrl && <a href={trailerUrl} target="_blank" rel="noreferrer" className="text-red-500 hover:text-red-400 underline decoration-2 underline-offset-4 transition-colors">Open in YouTube</a>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
              <button 
                onClick={handlePlayMovie}
                className="flex-1 md:flex-initial bg-white hover:bg-gray-200 text-black px-4 py-2 md:px-5 md:py-2.5 rounded-full font-bold text-sm md:text-base transition flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
              >
                {playMode === "movie" ? "Watch Trailer" : "Watch Full Movie"}
              </button>
              <button 
                onClick={handleAddToWatchlist} 
                className="flex-1 md:flex-initial bg-red-600 hover:bg-red-700 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full font-bold text-sm md:text-base transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/10 active:scale-95 whitespace-nowrap"
              >
                + Watchlist
              </button>
              <button 
                onClick={() => setIsDownloadModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 md:p-2.5 rounded-full font-bold transition flex items-center justify-center border border-white/10 active:scale-95 shrink-0"
                title="Download"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
          <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">{details.overview}</p>
          {details.genres && (
            <div className="flex flex-wrap gap-2 mt-6">
              {details.genres.map(g => (
                <span key={g.id} className="text-xs font-bold text-gray-500 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/5">{g.name}</span>
              ))}
            </div>
          )}

          {details.credits?.cast?.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">Top Cast</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                {details.credits.cast.slice(0, 15).map((person) => (
                  <div key={person.id} className="w-24 shrink-0 flex flex-col items-center text-center">
                    <img 
                      src={person.profile_path ? `${IMG}w185${person.profile_path}` : "https://via.placeholder.com/96x144?text=No+Img"} 
                      alt={person.name}
                      className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-full bg-gray-800 shadow-lg border border-white/10 mb-3"
                    />
                    <span className="text-white text-xs font-bold leading-tight">{person.name}</span>
                    <span className="text-gray-500 text-[10px] leading-tight mt-1">{person.character}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {details.similar?.results?.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">More Like This</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {details.similar.results.slice(0, 12).map((sim) => (
                  <div 
                    key={sim.id} 
                    className="relative group rounded-lg overflow-hidden bg-gray-900 border border-white/5 cursor-pointer" 
                    onClick={() => onSimilarClick && onSimilarClick(sim.id, sim.media_type || type)}
                  >
                    <img src={sim.poster_path ? `${IMG}w342${sim.poster_path}` : "https://via.placeholder.com/342x513?text=No+Img"} alt={sim.title || sim.name} className="w-full h-auto object-cover group-hover:scale-110 transition duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-white text-xs font-bold truncate">{sim.title || sim.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <DownloadModal 
        isOpen={isDownloadModalOpen} 
        onClose={() => setIsDownloadModalOpen(false)} 
        details={details} 
        type={type}
        showToast={showToast}
      />
    </div>
  );
}
