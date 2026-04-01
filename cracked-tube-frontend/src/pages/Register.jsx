import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullname: "",
    password: "",
  });
  const [files, setFiles] = useState({
    avatar: null,
    cover_image: null,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("fullname", formData.fullname);
    data.append("password", formData.password);
    data.append("avatar", files.avatar);
    if (files.cover_image) {
      data.append("cover_image", files.cover_image);
    }

    try {
      const response = await register(data);
      if (response.sucess) {
        navigate("/login");
        return;
      }
      setError(response.message || "Registration failed");
    } catch (err) {
      setError(err || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#121212] p-8 shadow-soft">
        <h1 className="text-center text-3xl font-bold text-white">Create account</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">Join the CrackedTube community.</p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              name="fullname"
              placeholder="Full name"
              value={formData.fullname}
              onChange={(event) => setFormData({ ...formData, fullname: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500"
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={(event) => setFormData({ ...formData, username: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500"
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={(event) => setFormData({ ...formData, password: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500"
            required
          />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-4 text-sm text-zinc-300 transition hover:bg-white/10">
              <span className="flex items-center gap-2 font-medium text-white">
                <Camera size={18} /> Avatar
              </span>
              <span className="text-xs text-zinc-400">Required</span>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={(event) => setFiles({ ...files, avatar: event.target.files?.[0] || null })}
                className="hidden"
                required
              />
            </label>

            <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-4 text-sm text-zinc-300 transition hover:bg-white/10">
              <span className="flex items-center gap-2 font-medium text-white">
                <Camera size={18} /> Cover image
              </span>
              <span className="text-xs text-zinc-400">Optional</span>
              <input
                type="file"
                name="cover_image"
                accept="image/*"
                onChange={(event) => setFiles({ ...files, cover_image: event.target.files?.[0] || null })}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="mr-2 animate-spin" size={18} /> : null}
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
