import React, { useState } from "react";
import { BACKEND_URL } from "../config";

export default function AdminPage() {
  const [formData, setFormData] = useState({
    tmdbId: "",
    type: "movie",
    seasonNumber: "",
    episodeNumber: "",
    language: "English",
    downloadUrl: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = {
        tmdbId: formData.tmdbId,
        type: formData.type,
        language: formData.language,
        downloadUrl: formData.downloadUrl
      };

      if (formData.type === "tv") {
        payload.seasonNumber = parseInt(formData.seasonNumber);
        payload.episodeNumber = parseInt(formData.episodeNumber);
      }

      const res = await fetch(`${BACKEND_URL}/api/downloads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      setMessage("Success! The video is now linked to the TMDB ID.");
      setFormData({
        tmdbId: "",
        type: "movie",
        seasonNumber: "",
        episodeNumber: "",
        language: "English",
        downloadUrl: ""
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white p-8">
      <div className="max-w-2xl mx-auto bg-black p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h1 className="text-3xl font-black text-red-600 mb-2">CineNova Admin Panel</h1>
        <p className="text-gray-400 mb-8">Link a Firebase Storage video URL to a TMDB Movie/Show.</p>

        {message && <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-xl mb-6">{message}</div>}
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300">Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 outline-none focus:border-red-500">
                <option value="movie">Movie</option>
                <option value="tv">TV Show Episode</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300">TMDB ID</label>
              <input name="tmdbId" value={formData.tmdbId} onChange={handleChange} placeholder="e.g. 550 for Fight Club" required className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 outline-none focus:border-red-500" />
            </div>
          </div>

          {formData.type === "tv" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Season Number</label>
                <input type="number" name="seasonNumber" value={formData.seasonNumber} onChange={handleChange} placeholder="e.g. 1" required className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 outline-none focus:border-red-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Episode Number</label>
                <input type="number" name="episodeNumber" value={formData.episodeNumber} onChange={handleChange} placeholder="e.g. 1" required className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 outline-none focus:border-red-500" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">Language</label>
            <input name="language" value={formData.language} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 outline-none focus:border-red-500" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">Firebase Storage URL (.mp4 link)</label>
            <input name="downloadUrl" value={formData.downloadUrl} onChange={handleChange} placeholder="https://firebasestorage.googleapis.com/..." required className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 outline-none focus:border-red-500" />
          </div>

          <button type="submit" className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-xl transition shadow-lg shadow-red-600/20 active:scale-[0.98]">
            Save to Database
          </button>
        </form>
      </div>
    </div>
  );
}
