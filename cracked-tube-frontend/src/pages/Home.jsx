import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import apiClient from "../api/axios.js";
import VideoCard from "../components/VideoCard.jsx";

const categories = ["All", "Gaming", "Music", "Mixes", "Live", "Programming", "Tweets", "News", "Recent"];

const Home = ({ refreshKey = 0 }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = query
          ? await apiClient.get(`/videos/search?q=${encodeURIComponent(query)}`)
          : await apiClient.get("/videos/watch-Videos?limit=24");

        setVideos(Array.isArray(response.data) ? response.data : []);
      } catch {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [query, refreshKey]);

  const title = useMemo(() => {
    if (query) {
      return `Search results for “${query}”`;
    }

    return "Home";
  }, [query]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-x-4 gap-y-10 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse space-y-3">
            <div className="aspect-video rounded-2xl bg-zinc-800" />
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-zinc-800" />
                <div className="h-3 w-1/2 rounded bg-zinc-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-2">
      <div className="sticky top-16 z-30 -mx-4 border-b border-white/5 bg-[#0f0f0f]/95 px-4 py-3 backdrop-blur">
        <div className="flex gap-3 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeCategory === category
                  ? "bg-white text-black"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {query ? "Results from your backend search endpoint" : "Latest uploads and recommended videos"}
          </p>
        </div>
      </div>

      {videos.length ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 text-center">
          <div>
            <h2 className="text-2xl font-bold text-white">No videos found</h2>
            <p className="mt-2 text-sm text-zinc-400">Try another search or come back later for fresh uploads.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
