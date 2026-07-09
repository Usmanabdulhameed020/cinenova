import React, { useState, useEffect } from "react";
import { X, Server, Play, Volume2, Trash2 } from "lucide-react";
import { auth } from "../firebase";

export default function SettingsModal({ onClose, showToast }) {
  const [server, setServer] = useState("vidsrc.me");
  const [autoplay, setAutoplay] = useState(true);
  const [muted, setMuted] = useState(true);
  const [cacheSize, setCacheSize] = useState("0 KB");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Load current settings from localStorage
    const savedServer = localStorage.getItem("cineflow_setting_server") || "vidsrc.me";
    const savedAutoplay = localStorage.getItem("cineflow_setting_autoplay") !== "false";
    const savedMuted = localStorage.getItem("cineflow_setting_muted") !== "false";

    setServer(savedServer);
    setAutoplay(savedAutoplay);
    setMuted(savedMuted);

    // Calculate approximate storage space used by PWA cache
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        const usageKb = Math.round((estimate.usage || 0) / 1024);
        setCacheSize(usageKb > 1024 ? `${(usageKb / 1024).toFixed(1)} MB` : `${usageKb} KB`);
      });
    }
  }, []);

  const handleSave = (key, val, setter) => {
    localStorage.setItem(key, val);
    setter(val);
    window.dispatchEvent(new CustomEvent("settingsUpdated"));
  };

  const handleClearData = async () => {
    try {
      // 1. Clear local watch history
      const userId = auth.currentUser?.uid || 'guest';
      localStorage.removeItem(`cineflow_recent_${userId}`);
      window.dispatchEvent(new CustomEvent('recentMoviesUpdated'));

      // 2. Clear service worker caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }

      // 3. Unregister service workers for a complete reload
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      setCacheSize("0 KB");
      setShowConfirm(false);
      showToast("App data cleared! Reloading...", "success");

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Cache Clear Error:", err);
      showToast("Failed to clear app cache", "error");
      setShowConfirm(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/85 z-[300] flex justify-center items-center p-4 backdrop-blur-sm">
      <div onClick={(e) => e.stopPropagation()} className="bg-[#181818] max-w-md w-full rounded-2xl relative shadow-2xl border border-white/10 p-6 md:p-8 animate-[fadeIn_.2s_ease-out]">
        <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/40 w-8 h-8 rounded-full hover:bg-white/10 transition flex items-center justify-center">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-black uppercase italic tracking-wide text-white mb-6 flex items-center gap-2">
          <span>⚙️</span> App Settings
        </h2>

        <div className="space-y-6">
          {/* Server Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
              <Server size={16} /> Preferred Player Server
            </label>
            <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => handleSave("cineflow_setting_server", "vidsrc.me", setServer)}
                className={`py-2 rounded-lg text-sm font-bold transition-all ${server === "vidsrc.me" ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                Server 1 (Primary)
              </button>
              <button 
                onClick={() => handleSave("cineflow_setting_server", "vidsrc.to", setServer)}
                className={`py-2 rounded-lg text-sm font-bold transition-all ${server === "vidsrc.to" ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                Server 2 (Backup)
              </button>
            </div>
          </div>

          {/* Autoplay Toggle */}
          <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-200 flex items-center gap-2">
                <Play size={16} /> Autoplay Trailers
              </span>
              <span className="text-xs text-gray-500">Play trailers immediately when modal opens</span>
            </div>
            <button 
              onClick={() => handleSave("cineflow_setting_autoplay", !autoplay ? "true" : "false", (v) => setAutoplay(v === "true"))}
              className={`w-12 h-6 rounded-full p-1 transition-all ${autoplay ? "bg-red-600 flex justify-end" : "bg-zinc-700 flex justify-start"}`}
            >
              <div className="w-4 h-full bg-white rounded-full shadow" />
            </button>
          </div>

          {/* Mute Toggle */}
          <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-200 flex items-center gap-2">
                <Volume2 size={16} /> Mute Autoplay
              </span>
              <span className="text-xs text-gray-500">Start autoplayed videos on mute</span>
            </div>
            <button 
              onClick={() => handleSave("cineflow_setting_muted", !muted ? "true" : "false", (v) => setMuted(v === "true"))}
              className={`w-12 h-6 rounded-full p-1 transition-all ${muted ? "bg-red-600 flex justify-end" : "bg-zinc-700 flex justify-start"}`}
            >
              <div className="w-4 h-full bg-white rounded-full shadow" />
            </button>
          </div>

          {/* Storage Cleaner */}
          <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-200 flex items-center gap-2">
                  <Trash2 size={16} /> App Storage
                </span>
                <span className="text-xs text-gray-500">Offline PWA cache & history size</span>
              </div>
              <span className="text-sm font-bold text-zinc-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                {cacheSize}
              </span>
            </div>

            <button 
              onClick={() => setShowConfirm(true)}
              className="w-full bg-red-600/10 border border-red-500/30 hover:bg-red-600 text-red-500 hover:text-white py-2.5 rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Clear App Cache & History
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#1a1a1a] w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-white/10">
            <h3 className="text-xl font-black text-white mb-2 uppercase italic text-red-500">Clear all data?</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              This will erase your watch history, offline cache, and reload the app. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={handleClearData} 
                className="flex-1 py-2.5 rounded-xl bg-red-650 hover:bg-red-750 text-white font-bold transition text-xs shadow-lg shadow-red-600/20"
              >
                Clear & Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
