export const TMDB_API_KEY = "bf56f434fe1c9dbf66acad7b84871724";
export const API = "https://api.themoviedb.org/3";
export const IMG = "https://image.tmdb.org/t/p/";
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URI || "https://cinenova-5to9.onrender.com";

export const ENDPOINTS = {
  TRENDING: "/trending/all/week",
  TOP_RATED: "/movie/top_rated",
  UPCOMING: "/movie/upcoming",
  ACTION: "/discover/movie?with_genres=28",
  TV: "/discover/tv?sort_by=popularity.desc",
  KDRAMA: "/discover/tv?with_original_language=ko&with_genres=18&sort_by=popularity.desc",
  CDRAMA: "/discover/tv?with_original_language=zh&with_genres=18&sort_by=popularity.desc",
  ENGLISH: "/discover/movie?with_original_language=en&sort_by=popularity.desc",
  NOLLYWOOD: "/discover/movie?with_origin_country=NG&sort_by=popularity.desc",
  BOLLYWOOD: "/discover/movie?with_original_language=hi&sort_by=popularity.desc",
  ANIME: "/discover/movie?with_original_language=ja&with_genres=16&sort_by=popularity.desc",
  YORUBA: "/discover/movie?with_original_language=yo&sort_by=popularity.desc"
};
