"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-400">Redirecting...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-zinc-100">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 font-bold text-white shadow-lg shadow-pink-500/20">
            U
          </div>
          <div>
            <span className="block text-lg font-bold tracking-wide text-white">Ultra Aluminum</span>
            <span className="block text-xs text-zinc-500">Pvt Ltd</span>
          </div>
        </div>
      </header>

      <section className="mx-auto grid min-h-[80vh] max-w-md items-center px-6 py-10">
        <div className="w-full">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400" />
              Production Control System
            </div>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-white">
              Welcome to <br />
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ultra Aluminum
              </span>
            </h1>
          </div>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-pink-400 hover:text-pink-300">
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
