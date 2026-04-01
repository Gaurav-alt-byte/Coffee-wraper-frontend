import React from "react";
import { Link } from "react-router-dom";
import { PlaySquare } from "lucide-react";

const Collections = () => {
  return (
    <div className="min-h-screen bg-[#0f0f0f] px-4 pb-20 pt-4 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <PlaySquare className="text-zinc-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Collections</h1>
            <p className="mt-1 text-sm text-zinc-400">Playlists and saved content will appear here.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center">
          <h2 className="text-xl font-bold text-white">No collections yet</h2>
          <p className="mt-2 text-sm text-zinc-400">Create playlists from your favorite videos later.</p>
          <Link to="/" className="mt-6 inline-flex rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500">
            Explore videos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Collections;
