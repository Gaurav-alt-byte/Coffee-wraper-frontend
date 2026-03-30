
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    try {
      setError("");
      await login(data.email, data.password);
      navigate("/"); // Redirect to home after successful login
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md border border-zinc-800"
      >
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Login to Cracked-Tube</h2>
        
        {error && <p className="text-red-500 text-sm mb-4 bg-red-500/10 p-2 rounded">{error}</p>}

        <div className="space-y-4">
          <input
            {...register("email")}
            type="email"
            placeholder="Email (e.g., gaurav_era3_10@gmail.com)"
            className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-red-600"
            required
          />
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-red-600"
            required
          />
          <button 
            type="submit" 
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;