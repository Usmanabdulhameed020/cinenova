import React, { useState, useEffect } from "react";
import { Play, Info } from "lucide-react";
import useFetch from "../hooks/useFetch";
import { IMG, ENDPOINTS } from "../config";

export default function Hero({ onClick }) {
  const { data, loading } = useFetch(ENDPOINTS.TRENDING);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % data.length);
    }, 8000); // Change banner every 8 seconds

    return () => clearInterval(interval);
  }, [data]);

  const item = data && data.length > 0 ? data[index] : null;

  if (loading || !item) {
    return (
      <div className="h-[85vh] bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse w-full h-full bg-zinc-900" />
      </div>
    );
  }

  const type = item.media_type || (item.first_air_date ? "tv" : "movie");

  return (
    <header
      key={item.id}
      className="relative h-[85vh] text-white flex items-center bg-center bg-cover animate-[fadeIn_0.8s_ease-out]"
      style={{
        backgroundImage: `url(${IMG}original${item.backdrop_path})`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gray-950 to-transparent" />

      <div className="relative z-10 px-4 md:pl-12 max-w-2xl">
        <h1 className="text-4xl md:text-7xl font-black mb-4 uppercase italic leading-none">
          {item.title || item.name}
        </h1>

        <p className="text-sm md:text-lg text-gray-200 line-clamp-3 mb-6">
          {item.overview}
        </p>

        <div className="flex gap-4">
          <button 
            onClick={() => onClick(item.id, type)}
            className="bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-200 transition flex items-center gap-2"
          >
            <Play fill="black" size={20} /> Play Trailer
          </button>

          <button 
            onClick={() => onClick(item.id, type)}
            className="bg-gray-500/50 text-white px-8 py-3 rounded font-bold hover:bg-gray-600 transition flex items-center gap-2"
          >
            <Info size={20} /> Info
          </button>
        </div>
      </div>
    </header>
  );
}
