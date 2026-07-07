"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SlideMenu } from "@/components/SlideMenu";
import { MenuButton } from "@/components/MenuButton";
import { useAuth } from "@/context/AuthContext";
import { menuStructure } from "@/lib/menu";

export default function HomeDashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { role, user, logout } = useAuth();
  const home = menuStructure[0];
  const categories = home.children ?? [];

  // Redirect non-admin users to their department page
  useEffect(() => {
    if (role && role !== "Admin") {
      const departmentPath = `/home/${role.toLowerCase().replace(/ /g, "-")}`;
      router.push(departmentPath);
    }
  }, [role, router]);

  if (role && role !== "Admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-zinc-400">Redirecting to your department...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen text-zinc-100">
      <SlideMenu
        nodes={menuStructure}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <MenuButton onClick={() => setMenuOpen(true)} />
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 font-bold text-white shadow-lg shadow-pink-500/20">
              U
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">
                Ultra Aluminum
              </p>
              <p className="text-xs text-zinc-500">Pvt Ltd</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-pink-400 hover:text-pink-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400" />
          Production Dashboard
        </div>
        <h1 className="mt-4 text-4xl font-bold text-white">
          Production <span className="text-pink-400">Overview</span>
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Monitor and manage all production stages from extrusion to final
          dispatch. Real-time data at your fingertips.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.href}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur p-6 transition hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/10"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-pink-500/5 blur-2xl transition group-hover:bg-pink-500/15" />
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                Module
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white group-hover:text-pink-400">
                {cat.label}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">{cat.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {cat.children?.map((sub) => (
                  <span
                    key={sub.slug}
                    className="rounded-md border border-zinc-800 bg-black/50 px-2 py-1 text-[11px] text-zinc-400"
                  >
                    {sub.label}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
