import React, { useEffect, useState } from "react";
import { X, Plus, Check } from "lucide-react";
import apiClient from "../api/axios.js";
import { getErrorMessage } from "../utils/helpers.js";

const AddToPlaylistModal = ({ videoId, isOpen, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [addedPlaylists, setAddedPlaylists] = useState(new Set());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch playlists
  useEffect(() => {
    if (!isOpen) return;

    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/Playlists/user/playlist/all");
        setPlaylists(Array.isArray(response.data) ? response.data : []);
        setError("");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [isOpen]);

  // Create new playlist
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      setError("Playlist name is required");
      return;
    }

    try {
      setError("");
      const newPlaylist = await apiClient.post("/Playlists/user/playlist/create", {
        name: newPlaylistName,
        description: newPlaylistDesc || "No description",
        is_private: false,
      });

      setPlaylists([...playlists, newPlaylist.data]);
      setNewPlaylistName("");
      setNewPlaylistDesc("");
      setIsCreatingNew(false);
      setSuccess("Playlist created successfully");

      // Auto-add video to new playlist
      setTimeout(() => {
        handleAddToPlaylist(newPlaylist.data._id);
      }, 300);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Add video to playlist
  const handleAddToPlaylist = async (playlistId) => {
    try {
      setError("");
      await apiClient.patch(
        `/Playlists/user/${playlistId}/${videoId}/add`
      );
      setAddedPlaylists((prev) => new Set(prev).add(playlistId));
      setSuccess("Video added to playlist");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Remove video from playlist
  const handleRemoveFromPlaylist = async (playlistId) => {
    try {
      setError("");
      await apiClient.patch(
        `/Playlists/user/${playlistId}/${videoId}/remove`
      );
      setAddedPlaylists((prev) => {
        const newSet = new Set(prev);
        newSet.delete(playlistId);
        return newSet;
      });
      setSuccess("Video removed from playlist");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Add to Playlist</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
            {success}
          </div>
        )}

        {/* Create New Playlist Form */}
        {isCreatingNew ? (
          <form onSubmit={handleCreatePlaylist} className="mb-6 space-y-3">
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none text-sm"
            />
            <textarea
              placeholder="Description (optional)"
              value={newPlaylistDesc}
              onChange={(e) => setNewPlaylistDesc(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none text-sm resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setNewPlaylistName("");
                  setNewPlaylistDesc("");
                }}
                className="flex-1 rounded-lg border border-white/10 px-4 py-2 font-semibold text-white hover:bg-white/5 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 text-sm"
              >
                Create
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreatingNew(true)}
            className="mb-6 w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 font-semibold text-white hover:bg-white/5 transition text-sm"
          >
            <Plus size={18} />
            New Playlist
          </button>
        )}

        {/* Playlists List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : playlists.length > 0 ? (
          <div className="space-y-2">
            {playlists.map((playlist) => {
              const isAdded = addedPlaylists.has(playlist._id);
              return (
                <button
                  key={playlist._id}
                  onClick={() =>
                    isAdded
                      ? handleRemoveFromPlaylist(playlist._id)
                      : handleAddToPlaylist(playlist._id)
                  }
                  className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition flex items-center justify-between ${
                    isAdded
                      ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                      : "border border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  <div>
                    <p>{playlist.name}</p>
                    <p className="text-xs opacity-75">
                      {playlist.Videos?.length || 0} videos
                    </p>
                  </div>
                  {isAdded && <Check size={18} />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center">
            <p className="text-sm text-zinc-400 mb-4">
              No playlists yet. Create one to get started!
            </p>
            <button
              onClick={() => setIsCreatingNew(true)}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              <Plus size={16} />
              Create Playlist
            </button>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-white/10 px-4 py-3 font-semibold text-white hover:bg-white/5 text-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
