import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageSquare, MoreHorizontal, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import apiClient from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const formatDuration = (duration = 0) => {
  const totalSeconds = Number(duration) || 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
};

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [stats, setStats] = useState({ likes: 0, dislikes: 0 });
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [channelId, setChannelId] = useState(null);

  const fetchInteractionStats = useCallback(async () => {
    const [likesResponse, dislikesResponse] = await Promise.all([
      apiClient.post(`/likes/likes-count/${videoId}`, { type: "Video" }),
      apiClient.post(`/dislikes/Dislikes-count/${videoId}`, { type: "Video" }),
    ]);

    setStats({
      likes: likesResponse.data?.likes_count || 0,
      dislikes: dislikesResponse.data?.dislikes_count || 0,
    });
  }, [videoId]);

  const fetchComments = useCallback(async () => {
    const response = await apiClient.get(`/videos/video/${videoId}/comments`);
    setComments(Array.isArray(response.data) ? response.data : []);
  }, [videoId]);

  const fetchSuggestions = useCallback(async () => {
    const response = await apiClient.get("/videos/watch-Videos?limit=8");
    const list = Array.isArray(response.data) ? response.data : [];
    setSuggestions(list.filter((item) => item._id !== videoId));
  }, [videoId]);

  useEffect(() => {
    const loadVideo = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/videos/watch/${videoId}`);
        setVideo(response.data);

        const creatorId = response.data?.ownerDetails?._id || response.data?.owner?._id || null;
        setChannelId(creatorId);

        if (response.data?.ownerDetails?.username && user) {
          try {
            const channelResponse = await apiClient.get(`/users/channel/${response.data.ownerDetails.username}`);
            setSubscribed(Boolean(channelResponse.data?.isSubscribed));
          } catch {
            setSubscribed(false);
          }
        }

        await Promise.all([fetchInteractionStats(), fetchComments(), fetchSuggestions()]);
      } catch {
        setVideo(null);
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      loadVideo();
      window.scrollTo(0, 0);
    }
  }, [videoId, fetchInteractionStats, fetchComments, fetchSuggestions]);

  const creator = video?.ownerDetails || video?.owner || {};
  const isOwner = Boolean(user && creator._id && user._id === creator._id);

  const handleToggle = async (path) => {
    if (!user) {
      navigate("/login");
      return;
    }

    await apiClient.post(path, { type: "Video" });
    await fetchInteractionStats();
  };

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const targetChannelId = channelId || creator?._id;
    if (!targetChannelId) return;

    if (subscribed) {
      await apiClient.patch(`/Subscriptions/unsubscribe/${targetChannelId}`);
      setSubscribed(false);
      return;
    }

    await apiClient.post(`/Subscriptions/subscribe/${targetChannelId}`);
    setSubscribed(true);
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const content = commentText.trim();
    if (!content) return;

    if (!user) {
      navigate("/login");
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await apiClient.post(`/Comments/create-comment/${videoId}`, {
        type: "Video",
        main_content: content,
      });
      setComments((previous) => [response.data, ...previous]);
      setCommentText("");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#0f0f0f]">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#0f0f0f] text-white">
        Video not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
      <div className="mx-auto grid max-w-[1700px] grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-black shadow-soft">
            <video src={video.video_file} controls autoPlay className="aspect-video w-full object-contain" />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold leading-tight text-white">{video.tittle}</h1>

          <div className="mt-4 flex flex-col gap-4 border-b border-zinc-800 pb-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <Link to={`/channel/${creator.username || user?.username || ""}`} className="flex items-center gap-4">
                <img
                  src={creator.avatar || "https://via.placeholder.com/200"}
                  alt={creator.username || "channel"}
                  className="h-12 w-12 rounded-full border border-zinc-700 object-cover"
                />
                <div>
                  <h2 className="text-lg font-bold text-white">{creator.username || "Unknown channel"}</h2>
                  <p className="text-xs text-zinc-500">Channel creator</p>
                </div>
              </Link>

              {!isOwner && (channelId || creator._id) ? (
                <button
                  type="button"
                  onClick={handleSubscribe}
                  className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                    subscribed ? "bg-white text-black hover:bg-zinc-200" : "bg-red-600 text-white hover:bg-red-500"
                  }`}
                >
                  {subscribed ? "Subscribed" : "Subscribe"}
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-zinc-700/60 bg-zinc-800/60">
                <button
                  type="button"
                  onClick={() => handleToggle(`/likes/toggle/${videoId}`)}
                  className="flex items-center gap-2 border-r border-zinc-700/60 px-5 py-2.5 text-sm font-semibold transition hover:bg-zinc-700"
                >
                  <ThumbsUp size={18} />
                  {stats.likes}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle(`/dislikes/toggle/${videoId}`)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition hover:bg-zinc-700"
                >
                  <ThumbsDown size={18} />
                  {stats.dislikes}
                </button>
              </div>

              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-800/60 px-5 py-2.5 text-sm font-semibold transition hover:bg-zinc-700"
              >
                <Share2 size={18} />
                Share
              </button>

              <button
                type="button"
                className="rounded-full border border-zinc-700/60 bg-zinc-800/60 p-3 transition hover:bg-zinc-700"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-zinc-800/60 bg-zinc-900/60 p-5 transition hover:bg-zinc-900/90">
            <p className="text-sm font-semibold text-white">
              {video.views || 0} views • {video.createdAt && formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {video.description || "No description provided."}
            </p>
          </div>

          <div className="mt-10">
            <div className="mb-6 flex items-center gap-3">
              <MessageSquare className="text-zinc-500" />
              <h2 className="text-xl font-bold text-white">{comments.length} Comments</h2>
            </div>

            <form onSubmit={handleCommentSubmit} className="mb-10 flex gap-4">
              <img
                src={user?.avatar || "https://via.placeholder.com/200"}
                alt="your avatar"
                className="h-10 w-10 rounded-full border border-zinc-700 object-cover"
              />
              <div className="flex-1 border-b border-zinc-800 transition focus-within:border-white">
                <input
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder={user ? "Add a comment..." : "Sign in to comment"}
                  disabled={!user}
                  className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={!user || !commentText.trim() || submittingComment}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {submittingComment ? "Posting..." : "Comment"}
              </button>
            </form>

            <div className="space-y-7">
              {comments.map((comment) => {
                const author = comment.author || comment.owner || {};

                return (
                  <div key={comment._id} className="flex gap-4">
                    <img
                      src={author.avatar || "https://via.placeholder.com/200"}
                      alt={author.username || "comment author"}
                      className="h-10 w-10 rounded-full border border-zinc-800 object-cover"
                    />
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-100">@{author.username || "user"}</span>
                        <span className="text-[10px] text-zinc-500">
                          {(comment.createdAt || comment.created_At) &&
                            formatDistanceToNow(new Date(comment.createdAt || comment.created_At), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Recommended videos</h3>
          <div className="space-y-4">
            {suggestions.map((item) => (
              <Link to={`/video/${item._id}`} key={item._id} className="group flex gap-3">
                <div className="relative aspect-video w-44 flex-shrink-0 overflow-hidden rounded-2xl bg-black">
                  <img
                    src={item.thumbnail}
                    alt={item.tittle}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {formatDuration(item.duration)}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pr-2">
                  <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-100 transition group-hover:text-blue-400">
                    {item.tittle}
                  </h4>
                  <p className="mt-1 text-xs text-zinc-400">{item.ownerDetails?.username || item.owner?.username || "Channel"}</p>
                  <div className="mt-1 flex items-center text-xs text-zinc-500">
                    <span>{item.views || 0} views</span>
                    <span className="mx-1">•</span>
                    <span>{item.createdAt && formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
