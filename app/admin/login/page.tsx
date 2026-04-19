"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center px-6">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#7C3AED08_0%,_transparent_70%)]" />

      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#7C3AED]/15 border border-[#7C3AED]/30 mb-4">
            <Lock className="w-7 h-7 text-[#7C3AED]" />
          </div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-widest">Admin</h1>
          <p className="text-white/40 text-sm mt-2 tracking-wide">Portfolio Management</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 rounded-2xl border border-white/10 p-8 space-y-5 backdrop-blur-sm"
        >
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-white/60 text-xs tracking-widest uppercase mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#7C3AED]/50 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-xs tracking-widest uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-11 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#7C3AED]/50 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl tracking-widest uppercase text-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-6">
          Default: admin / abd123abd
        </p>
      </div>
    </div>
  );
}
