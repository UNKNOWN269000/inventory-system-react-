"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Dropdown } from "@/components/Dropdown";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    department: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    if (!form.fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!form.department) {
      setError("Please select a department");
      return false;
    }
    if (!form.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (form.username.includes(" ")) {
      setError("Username cannot contain spaces");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(form.password)) {
      setError("Password cannot contain symbols");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", form.username)
        .single();

      if (existingUser) {
        setError("Username already exists");
        setLoading(false);
        return;
      }

      // Create new user
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            full_name: form.fullName,
            department: form.department,
            username: form.username,
            password: form.password,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSuccess("Account created successfully! Redirecting to login page...");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const glassCard = "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl";
  const glassInput = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-pink-500 backdrop-blur-sm transition-colors";
  const glassBtnPrimary = "rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-pink-500/40 disabled:opacity-50";

  return (
    <div className="min-h-screen text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 font-bold text-white shadow-lg shadow-pink-500/20">U</div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">Ultra Aluminum</p>
              <p className="text-xs text-zinc-500">Pvt Ltd</p>
            </div>
          </Link>
          <Link href="/" className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-pink-400 hover:text-pink-300">
            Back to Login
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400" />
              Create Account
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white">Sign Up</h1>
            <p className="mt-2 text-sm text-zinc-400">Create your account to access the production system</p>
          </div>

          <form onSubmit={handleSubmit} className={`p-6 space-y-4 ${glassCard}`}>
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {success}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Enter your full name"
                className={glassInput}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Department (Role)</label>
              <Dropdown
                value={form.department}
                onChange={(v) => setForm({ ...form, department: v })}
                placeholder="Select Department"
                required
                options={[
                  { value: "Extrusion", label: "Extrusion" },
                  { value: "Mill Finish", label: "Mill Finish" },
                  { value: "Powder Coat", label: "Powder Coat" },
                  { value: "Anodizing", label: "Anodizing" },
                ]}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Username (no spaces)</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.replace(/\s/g, "") })}
                placeholder="Enter username"
                className={glassInput}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Password (min 6 characters, no symbols)</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter password"
                className={glassInput}
                required
                minLength={6}
                pattern="[a-zA-Z0-9]+"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                className={glassInput}
                required
              />
            </div>

            <button type="submit" disabled={loading} className={`w-full ${glassBtnPrimary}`}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <p className="text-center text-xs text-zinc-500">
              Already have an account?{" "}
              <Link href="/" className="text-pink-400 hover:text-pink-300">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
