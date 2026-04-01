import React from "react";
import { Link, useLocation } from "react-router-dom";
import { History, Home, PlaySquare, ThumbsUp, User, MessageSquare } from "lucide-react";

const Sidebar = ({ isCollapsed }) => {
  const location = useLocation();

  const menuItems = [
    { label: "Home", icon: <Home size={20} />, path: "/" },
    { label: "Tweets", icon: <MessageSquare size={20} />, path: "/tweets" },
    { label: "History", icon: <History size={20} />, path: "/history" },
    { label: "Liked Videos", icon: <ThumbsUp size={20} />, path: "/liked-videos" },
    { label: "Collections", icon: <PlaySquare size={20} />, path: "/collections" },
  ];

  return (
    <aside className="flex h-full flex-col gap-1 px-2 py-4">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm transition ${
              isActive
                ? "bg-white/10 font-semibold text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className={isActive ? "text-red-500" : "text-inherit"}>{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        );
      })}

      <div className="my-4 border-t border-white/10" />

      {!isCollapsed && (
        <p className="px-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">My Account</p>
      )}

      <Link
        to="/profile"
        className="flex items-center gap-4 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
      >
        <User size={20} />
        {!isCollapsed && <span>My Channel</span>}
      </Link>
    </aside>
  );
};

export default Sidebar;
