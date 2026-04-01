import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, Search, Upload, User as UserIcon, Video } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = ({ onMenuClick, onUploadClick }) => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate("/login");
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#0f0f0f]/95 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-full p-2 text-white transition hover:bg-white/10"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600">
            <Video size={20} fill="currentColor" color="white" />
          </span>
          <span className="hidden text-xl font-bold tracking-tight text-white sm:block">CrackedTube</span>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex max-w-2xl flex-1 items-center justify-center px-4">
        <div className="flex w-full max-w-xl items-center rounded-full border border-white/10 bg-[#121212] pl-4 pr-1.5 focus-within:border-blue-500">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search"
            className="w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-zinc-500"
          />
        </div>
        <button
          type="submit"
          className="ml-2 rounded-full border border-white/10 bg-white/5 p-2.5 text-white transition hover:bg-white/10"
          aria-label="Search"
        >
          <Search size={20} />
        </button>
      </form>

      <div className="flex items-center gap-2 sm:gap-3">
        {user ? (
          <>
            <button
              type="button"
              onClick={onUploadClick}
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:flex"
            >
              <Upload size={18} />
              Upload
            </button>

            <button type="button" className="rounded-full p-2 text-white transition hover:bg-white/10" aria-label="Notifications">
              <Bell size={22} />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen((open) => !open)}
                className="h-9 w-9 overflow-hidden rounded-full border border-white/15"
                aria-label="Open profile menu"
              >
                <img
                  src={user.avatar || "https://via.placeholder.com/200"}
                  alt={user.username || "profile"}
                  className="h-full w-full object-cover"
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/10 bg-[#1f1f1f] py-2 shadow-soft">
                  <Link
                    to={`/channel/${user.username}`}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white transition hover:bg-white/5"
                  >
                    <UserIcon size={18} />
                    My Channel
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-white/5"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-full border border-blue-500 px-4 py-2 text-sm font-medium text-blue-500 transition hover:bg-blue-500/10"
          >
            <UserIcon size={18} />
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
