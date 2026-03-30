import { createContext, useContext, useState, useEffect } from 'react';

import api from "../api/axios";
import { Play } from "lucide-react";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        // Calling your 'feedGenerator youtube' endpoint
        const response = await api.get("/videos/watch-videos");
        // Adjust this based on your exact backend response structure
        setVideos(response.data.data || []); 
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div key={video._id} className="group cursor-pointer">
            {/* Thumbnail Container */}
            <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-800">
              <img
                src={video.thumbnail}
                alt={video.tittle}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs font-medium">
                {video.duration || "10:00"}
              </div>
            </div>

            {/* Video Info */}
            <div className="mt-3 flex gap-3">
              <div className="h-9 w-9 flex-shrink-0 rounded-full bg-zinc-700 overflow-hidden">
                <img src={video.owner?.avatar} alt="" className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white">
                  {video.tittle}
                </h3>
                <p className="mt-1 text-xs text-zinc-400">{video.owner?.fullname}</p>
                <p className="text-xs text-zinc-400">{video.views} views • Just now</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {videos.length === 0 && (
        <div className="text-center text-zinc-500 mt-20">
          No videos found. Start uploading!
        </div>
      )}
    </div>
  );
};

export default Home;