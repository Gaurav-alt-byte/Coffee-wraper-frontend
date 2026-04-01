import React, { useEffect, useState, useContext } from "react";
import { MessageSquare, Trash2, Edit2, Heart, Send } from "lucide-react";
import apiClient from "../api/axios.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { formatTimeAgo } from "../utils/formatters.js";
import { getErrorMessage } from "../utils/helpers.js";

const TweetsFeed = () => {
  const { user } = useContext(AuthContext);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [composingTweet, setComposingTweet] = useState({ tittle: "", main_content: "" });
  const [editingTweet, setEditingTweet] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch tweets
  const fetchTweets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/Twitter/tweet/all");
      setTweets(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  // Create tweet
  const handleCreateTweet = async (e) => {
    e.preventDefault();
    setError("");

    if (!composingTweet.tittle.trim() || !composingTweet.main_content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      await apiClient.post("/Twitter/tweet/create", composingTweet);
      setSuccess("Tweet posted successfully");
      setComposingTweet({ tittle: "", main_content: "" });
      setIsComposing(false);
      fetchTweets();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Delete tweet
  const handleDeleteTweet = async (tweetId) => {
    if (!window.confirm("Are you sure you want to delete this tweet?")) return;

    try {
      setError("");
      await apiClient.delete(`/Twitter/tweet/manage/delete/${tweetId}`);
      setSuccess("Tweet deleted successfully");
      fetchTweets();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Update tweet
  const handleUpdateTweet = async (e) => {
    e.preventDefault();
    setError("");

    if (!editingTweet.tittle.trim() || !editingTweet.main_content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      await apiClient.patch(`/Twitter/tweet/manage/update/${editingTweet._id}`, {
        new_tittle: editingTweet.tittle,
        new_main_content: editingTweet.main_content,
      });
      setSuccess("Tweet updated successfully");
      setEditingTweet(null);
      fetchTweets();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Like tweet
  const handleLikeTweet = async (tweetId) => {
    try {
      await apiClient.post(`/likes/toggle/${tweetId}`, { type: "Tweets" });
      fetchTweets();
    } catch (err) {
      console.error("Error liking tweet:", err);
    }
  };

  // Dislike tweet
  const handleDislikeTweet = async (tweetId) => {
    try {
      await apiClient.post(`/dislikes/toggle/${tweetId}`, { type: "Tweets" });
      fetchTweets();
    } catch (err) {
      console.error("Error disliking tweet:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
        <div className="mx-auto max-w-2xl space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <MessageSquare className="text-red-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-white">Community</h1>
            <p className="mt-1 text-sm text-zinc-400">Share your thoughts with the community</p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Tweet Composer */}
        {user && (
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6">
            {isComposing ? (
              <form onSubmit={handleCreateTweet}>
                <input
                  type="text"
                  placeholder="Title"
                  value={composingTweet.tittle}
                  onChange={(e) =>
                    setComposingTweet({ ...composingTweet, tittle: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none mb-3"
                />
                <textarea
                  placeholder="What's on your mind?"
                  value={composingTweet.main_content}
                  onChange={(e) =>
                    setComposingTweet({
                      ...composingTweet,
                      main_content: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none mb-4"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsComposing(false);
                      setComposingTweet({ tittle: "", main_content: "" });
                    }}
                    className="flex-1 rounded-lg border border-white/10 px-4 py-2 font-semibold text-white hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
                  >
                    <Send size={18} />
                    Post
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsComposing(true)}
                className="w-full flex items-center gap-4 rounded-lg hover:bg-white/5 transition p-3"
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  readOnly
                  className="flex-1 bg-transparent text-zinc-400 placeholder-zinc-500 cursor-pointer"
                />
              </button>
            )}
          </div>
        )}

        {/* Tweet Edit Form */}
        {editingTweet && (
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Edit Tweet</h3>
            <form onSubmit={handleUpdateTweet}>
              <input
                type="text"
                value={editingTweet.tittle}
                onChange={(e) =>
                  setEditingTweet({ ...editingTweet, tittle: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white mb-3 focus:border-white/20 focus:outline-none"
              />
              <textarea
                value={editingTweet.main_content}
                onChange={(e) =>
                  setEditingTweet({
                    ...editingTweet,
                    main_content: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white mb-4 focus:border-white/20 focus:outline-none"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTweet(null)}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-2 font-semibold text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tweets Feed */}
        <div className="space-y-4">
          {tweets.length ? (
            tweets.map((tweet) => {
              const isOwner = user?._id === tweet.owner;
              return (
                <article
                  key={tweet._id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1 min-w-0">
                      <img
                        src={tweet.author?.avatar || "https://via.placeholder.com/200"}
                        alt={tweet.author?.username || "user"}
                        className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h2 className="font-bold text-white">
                              {tweet.author?.username || "Unknown User"}
                            </h2>
                            <p className="text-xs text-zinc-500">
                              {formatTimeAgo(tweet.created_At || tweet.createdAt)}
                            </p>
                          </div>
                        </div>
                        <h3 className="mt-2 font-bold text-white text-lg">{tweet.tittle}</h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                          {tweet.main_content}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {isOwner && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => setEditingTweet(tweet)}
                          className="rounded-lg bg-zinc-800 p-2 text-white hover:bg-zinc-700 transition"
                          title="Edit tweet"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTweet(tweet._id)}
                          className="rounded-lg bg-red-600/20 p-2 text-red-400 hover:bg-red-600/30 transition"
                          title="Delete tweet"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Interactions */}
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <button
                      onClick={() => handleLikeTweet(tweet._id)}
                      className="flex items-center gap-1 text-zinc-400 hover:text-red-500 transition"
                    >
                      <Heart size={16} fill="currentColor" />
                      {tweet.likesCount || 0}
                    </button>
                    <button
                      onClick={() => handleDislikeTweet(tweet._id)}
                      className="flex items-center gap-1 text-zinc-400 hover:text-blue-500 transition"
                    >
                      <Heart size={16} className="rotate-180" />
                      {tweet.dislikesCount || 0}
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">
              <MessageSquare className="mx-auto text-zinc-600 mb-4" size={48} />
              <h3 className="text-lg font-bold text-white mb-2">No tweets yet</h3>
              <p className="text-sm text-zinc-400">
                {user ? "Be the first to share something!" : "Sign in to post tweets"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TweetsFeed;
