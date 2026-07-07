"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Check if user exists in database
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", email)
        .eq("password", password)
        .single();

      if (error || !user) {
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      // Login successful with role
      login(user.username, user.department);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl backdrop-blur-xl"
    >
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="relative">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 text-sm font-bold text-white">
            U
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Welcome back</h2>
            <p className="text-xs text-zinc-500">Ultra Aluminum Pvt Ltd</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Username
            </span>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-black/50 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-pink-500 transition-colors"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-black/50 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-pink-500 transition-colors"
            />
          </label>
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-zinc-400">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-700 bg-black accent-pink-500"
                defaultChecked
              />
              Remember this device
            </label>
            <Link href="#" className="text-pink-400 hover:text-pink-300">
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 transition hover:shadow-pink-500/40 hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in to Dashboard"}
        </button>

        <p className="mt-4 text-center text-xs text-zinc-600">
          Protected by Ultra Aluminum Security System
        </p>
      </div>
    </form>
  );
}
