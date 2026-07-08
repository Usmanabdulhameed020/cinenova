import React, { useState, useEffect } from "react";
import { X, Download, CheckSquare, Square, ChevronDown } from "lucide-react";
import { API, TMDB_API_KEY, IMG, BACKEND_URL } from "../config";

export default function DownloadModal({ isOpen, onClose, details, type, showToast }) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState([]);
  const [language, setLanguage] = useState("English");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const languages = ["English", "Spanish", "French", "German", "Japanese", "Korean", "Hindi", "Arabic"];

  useEffect(() => {
    if (isOpen) {
      setSelectedSeason(1);
      setSelectedEpisodes([]);
      setIsDownloading(false);
      setProgress(0);
      if (type === "tv" && details) {
        fetchEpisodes(1);
      }
    }
  }, [isOpen, details, type]);

  const fetchEpisodes = async (seasonNumber) => {
    if (!details || type !== "tv") return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/tv/${details.id}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`);
      const data = await res.json();
      setEpisodes(data.episodes || []);
      setSelectedEpisodes([]);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch episodes", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeasonChange = (e) => {
    const season = parseInt(e.target.value);
    setSelectedSeason(season);
    fetchEpisodes(season);
  };

  const toggleEpisode = (id) => {
    setSelectedEpisodes((prev) => 
      prev.includes(id) ? prev.filter((eId) => eId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedEpisodes.length === episodes.length) {
      setSelectedEpisodes([]);
    } else {
      setSelectedEpisodes(episodes.map((ep) => ep.id));
    }
  };

  const downloadFile = async (downloadUrl, fileName) => {
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Failed to fetch file");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback for CORS restricted URLs (like Cloudinary or Google Drive)
      console.warn("Direct fetch failed (likely CORS), falling back to new tab:", err);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const startDownload = async () => {
    if (type === 'tv' && selectedEpisodes.length === 0) {
      showToast("Please select at least one episode", "error");
      return;
    }
    
    setIsDownloading(true);
    setProgress(10);
    
    try {
      if (type === 'movie') {
        const res = await fetch(`${BACKEND_URL}/api/downloads/movie/${details.id}?language=${language}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Movie not available for download yet.");
        }
        const data = await res.json();
        
        setProgress(50);
        await downloadFile(data.downloadUrl, `${details.title || details.name}.mp4`);
        setProgress(100);
        showToast("Download Complete!", "success");
        setTimeout(onClose, 500);

      } else if (type === 'tv') {
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < selectedEpisodes.length; i++) {
          const epId = selectedEpisodes[i];
          const episode = episodes.find(e => e.id === epId);
          
          try {
            const res = await fetch(`${BACKEND_URL}/api/downloads/tv/${details.id}/season/${selectedSeason}/episode/${episode.episode_number}?language=${language}`);
            if (res.ok) {
              const data = await res.json();
              await downloadFile(data.downloadUrl, `${details.name || details.title} - S${selectedSeason}E${episode.episode_number}.mp4`);
              successCount++;
            } else {
              failCount++;
            }
          } catch (e) {
            failCount++;
          }
          
          setProgress(10 + Math.round(((i + 1) / selectedEpisodes.length) * 90));
        }

        if (successCount > 0) {
          showToast(`Downloaded ${successCount} episode(s). ${failCount > 0 ? `${failCount} unavailable.` : ''}`, "success");
          setTimeout(onClose, 1000);
        } else {
          showToast("Selected episodes are not available yet.", "error");
        }
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  if (!isOpen || !details) return null;

  const validSeasons = type === 'tv' ? details.seasons?.filter(s => s.season_number > 0) || [] : [];

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/90 z-[300] flex justify-center items-center p-4 backdrop-blur-md">
      <div onClick={(e) => e.stopPropagation()} className="bg-[#181818] max-w-2xl w-full max-h-[85vh] overflow-y-auto no-scrollbar rounded-2xl relative shadow-2xl border border-white/10 flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#181818]/90 backdrop-blur-xl border-b border-white/10 p-6 z-20 flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden border border-white/10">
              <img src={`${IMG}w200${details.poster_path}`} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white leading-tight mb-1">{details.title || details.name}</h2>
              <p className="text-red-500 font-bold text-sm uppercase tracking-wider">Download Settings</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition p-2 bg-white/5 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col gap-8">
          
          {/* Language Selection */}
          <div className="space-y-3">
            <label className="text-white font-bold text-lg">Select Audio / Subtitle Language</label>
            <div className="relative">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full appearance-none bg-black border border-white/20 rounded-xl h-14 px-5 text-white font-semibold outline-none focus:border-red-500 transition-colors"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          {/* TV Show Episodes Selection */}
          {type === "tv" && (
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-white font-bold text-lg">Select Episodes</label>
                <select 
                  value={selectedSeason}
                  onChange={handleSeasonChange}
                  className="bg-black border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm font-semibold outline-none focus:border-red-500"
                >
                  {validSeasons.map((season) => (
                    <option key={season.id} value={season.season_number}>
                      Season {season.season_number}
                    </option>
                  ))}
                </select>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
                </div>
              ) : episodes.length > 0 ? (
                <div className="bg-black/50 border border-white/10 rounded-xl p-2 overflow-hidden flex flex-col max-h-[300px]">
                  
                  {/* Select All */}
                  <div 
                    onClick={toggleAll}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition border-b border-white/5 mb-1"
                  >
                    {selectedEpisodes.length === episodes.length ? (
                      <CheckSquare className="text-red-500" size={22} />
                    ) : (
                      <Square className="text-gray-500" size={22} />
                    )}
                    <span className="text-white font-bold text-sm">Select All ({episodes.length} Episodes)</span>
                  </div>

                  {/* Episodes List */}
                  <div className="overflow-y-auto no-scrollbar flex-1 pr-2">
                    {episodes.map((ep) => {
                      const isSelected = selectedEpisodes.includes(ep.id);
                      return (
                        <div 
                          key={ep.id}
                          onClick={() => toggleEpisode(ep.id)}
                          className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition mb-1 ${isSelected ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-white/5 border border-transparent'}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="text-red-500 shrink-0" size={22} />
                          ) : (
                            <Square className="text-gray-500 shrink-0" size={22} />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm truncate">{ep.episode_number}. {ep.name}</p>
                            <p className="text-gray-500 text-xs truncate">{ep.runtime ? `${ep.runtime} min` : 'TBA'}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 text-sm bg-black/30 rounded-xl border border-white/5">
                  No episodes found for this season.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#181818] border-t border-white/10 p-6 z-20">
          {isDownloading ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-white">Downloading...</span>
                <span className="text-red-500">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-3 bg-black rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-red-600 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <button 
              onClick={startDownload}
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-xl flex justify-center items-center gap-3 transition shadow-lg shadow-red-600/20 active:scale-[0.98]"
            >
              <Download size={22} />
              {type === 'tv' ? `Download ${selectedEpisodes.length} Episode(s)` : 'Download Movie'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
