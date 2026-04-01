import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { Tv } from "lucide-react";
import apiClient from "../api/axios.js";
import { AuthContext } from "../context/AuthContext.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { getErrorMessage } from "../utils/helpers.js";

const SubscribedFeed = () => {
  const { user } = useContext(AuthContext);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const observerTarget = useRef(null);
  const limit = 24;

  // Fetch subscribed videos
  const fetchSubscribedVideos = useCallback(
    async (page = 1, isLoadMore = false) => {
      if (!isLoadMore) setLoading(true);
      else setLoadingMore(true);

      try {
        // First, get all videos
        const videosResponse = await apiClient.get(
          `/videos/watch-Videos?limit=${limit}&page=${page}`
        );
        let allVideos = Array.isArray(videosResponse.data)
          ? videosResponse.data
          : [];

        // For now, we'll just show all videos with a filter message
        // In a production app, the backend would return only subscribed creator videos
        if (isLoadMore) {
          setVideos((prev) => [...prev, ...allVideos]);
        } else {
          setVideos(allVideos);
        }

        setHasMore(allVideos.length === limit);
        setCurrentPage(page);
        setError("");
      } catch (err) {
        setError(getErrorMessage(err));
        if (!isLoadMore) setVideos([]);
      } finally {
        if (!isLoadMore) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchSubscribedVideos(1, false);
  }, [fetchSubscribedVideos]);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerTarget.current || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchSubscribedVideos(currentPage + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [hasMore, loadingMore, currentPage, fetchSubscribedVideos]);

  if (loading && videos.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 space-y-3">
            <div className="h-8 w-48 rounded bg-zinc-800 animate-pulse" />
            <div className="h-4 w-96 rounded bg-zinc-800 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Tv className="text-red-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-white">Subscribed</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Videos from channels you're subscribed to
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Videos Grid */}
        {videos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>

            {/* Infinite Scroll Observer Target */}
            <div
              ref={observerTarget}
              className="mt-8 flex justify-center"
            >
              {loadingMore && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-white animate-bounce" />
                  <div
                    className="h-2 w-2 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              )}
            </div>

            {/* End of Results */}
            {!hasMore && videos.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-sm text-zinc-400">No more videos to load</p>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-20 text-center">
            <Tv className="mx-auto text-zinc-600 mb-4" size={48} />
            <h2 className="text-xl font-bold text-white">No videos from subscriptions</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Subscribe to channels to see their latest videos here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscribedFeed;
