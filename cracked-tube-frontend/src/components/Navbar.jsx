import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between p-4 border-b border-zinc-800 sticky top-0 bg-black z-50">
      <Link to="/" className="text-xl font-black text-red-600 tracking-tighter">
        CRACKED-TUBE
      </Link>

      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <span className="text-sm text-zinc-400">Hi, {user.fullname}</span>
            <button onClick={logout} className="text-sm bg-zinc-800 px-3 py-1 rounded hover:bg-zinc-700">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="bg-red-600 px-4 py-1.5 rounded-full font-medium hover:bg-red-700">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;