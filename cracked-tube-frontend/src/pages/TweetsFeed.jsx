import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MessageSquare, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import apiClient from "../api/axios.js";

const TweetsFeed = () => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTweets = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/Twitter/tweet/all");
        setTweets(Array.isArray(response.data) ? response.data : []);
      } catch {
        setTweets([]);
      } finally {
        setLoading(false);
      }
    };

    loadTweets();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <MessageSquare className="text-zinc-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Tweets</h1>
            <p className="mt-1 text-sm text-zinc-400">Latest community posts</p>
          </div>
        </div>

        <div className="space-y-4">
          {tweets.length ? (
            tweets.map((tweet) => (
              <article key={tweet._id} className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
                <div className="flex items-start gap-4">
                  <img
                    src={tweet.owner_details?.avatar || "https://via.placeholder.com/200"}
                    alt={tweet.owner_details?.username || "user"}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-base font-bold text-white">{tweet.tittle}</h2>
                        <p className="text-sm text-zinc-400">@{tweet.owner_details?.username || "user"}</p>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {tweet.createdAt && formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{tweet.main_content}</p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
                      <span className="flex items-center gap-2">
                        <ThumbsUp size={16} /> {tweet.likes_count || 0}
                      </span>
                      <Link to="/" className="text-blue-400 hover:underline">
                        Open videos
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-zinc-400">
              No tweets available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TweetsFeed;
