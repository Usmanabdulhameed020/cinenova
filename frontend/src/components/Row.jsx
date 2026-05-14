import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useFetch from "../hooks/useFetch";
import MovieCard from "./MovieCard";

export default function Row({ title, url, onClick }) {
  const items = useFetch(url);
  const rowRef = useRef(null);

  const slide = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" 
        ? scrollLeft - clientWidth * 0.7 
        : scrollLeft + clientWidth * 0.7;

      rowRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });
    }
  };

  if (!items?.length) return null;

  return (
    <section className="relative px-4 md:px-12 py-4">
      <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-100 tracking-wide">
        {title}
      </h2>

      <div className="group relative">
        <button
          onClick={() => slide("left")}
          className="absolute left-0 top-0 bottom-0 z-40 w-12 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white flex items-center justify-center"
        >
          <ChevronLeft size={40} />
        </button>

        <div
          ref={rowRef}
          className="flex space-x-4 overflow-x-scroll no-scrollbar scroll-smooth py-10"
        >
          {items.map((item) => (
            <MovieCard
              key={item.id}
              item={item}
              onClick={onClick}
            />
          ))}
        </div>

        <button
          onClick={() => slide("right")}
          className="absolute right-0 top-0 bottom-0 z-40 w-12 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white flex items-center justify-center"
        >
          <ChevronRight size={40} />
        </button>
      </div>
    </section>
  );
}
