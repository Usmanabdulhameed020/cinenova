import { useState, useEffect } from "react";
import { API, TMDB_API_KEY } from "../config";

const useFetch = (url) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!url) return;

    const fetchData = async () => {
      try {
        const connector = url.includes("?") ? "&" : "?";

        const res = await fetch(
          `${API}${url}${connector}api_key=${TMDB_API_KEY}`
        );

        const json = await res.json();

        const results = json.results || [];

        const sorted = Array.isArray(results)
          ? results.sort((a, b) => b.popularity - a.popularity)
          : results;

        setData(sorted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [url]);

  return data;
};

export default useFetch;
