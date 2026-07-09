import { useState, useEffect } from "react";
import { API, TMDB_API_KEY } from "../config";

const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) return;
    setLoading(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading };
};

export default useFetch;
