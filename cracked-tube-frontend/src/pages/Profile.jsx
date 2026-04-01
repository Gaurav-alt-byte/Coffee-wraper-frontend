import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import apiClient from "../api/axios.js";
import VideoCard from "../components/VideoCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Profile = () => {
  const { username: routeUsername } = useParams();
  const { user } = useAuth();
  const username = routeUsername || user?.username;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;

      setLoading(true);
      try {
        const response = await apiClient.get(`/users/channel/${username}`);
        setProfile(response.data);
        setSubscribed(Boolean(response.data?.isSubscribed));
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  const handleSubscribe = async () => {
    if (!profile?._id) return;

    if (subscribed) {
      await apiClient.patch(`/Subscriptions/unsubscribe/${profile._id}`);
      setSubscribed(false);
      return;
    }

    await apiClient.post(`/Subscriptions/subscribe/${profile._id}`);
    setSubscribed(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white">
        Channel not found.
      </div>
    );
  }

  const isOwnChannel = user?.username === profile.username;

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
      <div className="mx-auto max-w-[1700px] space-y-8">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#121212] shadow-soft">
          <div className="h-40 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-900 sm:h-56">
            <img
              src={profile.cover_image || "https://via.placeholder.com/1200x300"}
              alt="cover"
              className="h-full w-full object-cover opacity-80"
            />
          </div>

          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-5 md:flex-row md:items-end">
              <img
                src={profile.avatar || "https://via.placeholder.com/200"}
                alt={profile.username}
                className="-mt-20 h-32 w-32 rounded-full border-4 border-[#0f0f0f] object-cover"
              />
              <div>
                <h1 className="text-3xl font-extrabold text-white">{profile.fullname}</h1>
                <p className="mt-1 text-zinc-400">@{profile.username}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                  <span>{profile.SubscribersCount || 0} subscribers</span>
                  <span>{profile.SubscribedToCount || 0} subscriptions</span>
                  <span>Joined {profile.createdAt ? formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true }) : "recently"}</span>
                </div>
              </div>
            </div>

            {!isOwnChannel && (
              <button
                type="button"
                onClick={handleSubscribe}
                className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                  subscribed ? "bg-white text-black hover:bg-zinc-200" : "bg-red-600 text-white hover:bg-red-500"
                }`}
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
          </div>
        </div>

        <section>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Uploads</h2>
              <p className="mt-1 text-sm text-zinc-400">Videos uploaded by this channel</p>
            </div>
          </div>

          {profile.uploads?.length ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {profile.uploads.map((video) => (
                <VideoCard key={video._id} video={{ ...video, ownerDetails: profile }} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-zinc-400">
              No uploads yet.
            </div>
          )}
        </section>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-bold text-white">Channel details</h3>
          <div className="mt-4 grid gap-4 text-sm text-zinc-400 md:grid-cols-2">
            <div>
              <p className="text-zinc-500">Email</p>
              <p className="mt-1 text-white">{profile.email || "Hidden"}</p>
            </div>
            <div>
              <p className="text-zinc-500">Channel ID</p>
              <p className="mt-1 break-all text-white">{profile._id}</p>
            </div>
          </div>
          <div className="mt-6">
            <Link to="/" className="text-sm font-medium text-blue-400 hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
