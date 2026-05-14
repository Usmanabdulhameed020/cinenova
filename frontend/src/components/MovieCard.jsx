import React from "react";
import { IMG } from "../config";

export default function MovieCard({ item, onClick }) {
  if (!item.poster_path && !item.backdrop_path) return null;

  const type =
    item.media_type || (item.first_air_date ? "tv" : "movie");

  const year =
    (item.release_date || item.first_air_date)?.split("-")[0];

  return (
    <div
      onClick={() => onClick(item.id, type)}
      className="relative flex-none w-36 md:w-56 transition-transform duration-300 ease-in-out hover:scale-110 hover:z-50 cursor-pointer shadow-xl"
    >
      <img
        src={`${IMG}w500${item.poster_path || item.backdrop_path}`}
        alt=""
        className="rounded-md object-cover w-full h-auto aspect-[2/3] bg-gray-800"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-4 rounded-md">
        <p className="text-white font-bold text-sm truncate">
          {item.title || item.name}
        </p>

        <p className="text-red-500 text-xs font-semibold">
          {year}
        </p>
      </div>
    </div>
  );
}
