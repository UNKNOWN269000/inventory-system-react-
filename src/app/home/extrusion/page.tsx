import Link from "next/link";
import { DetailView } from "@/components/DetailView";

export const metadata = { title: "Extrusion · Ultra Aluminum" };

export default function ExtrusionPage() {
  return (
    <DetailView
      title="Extrusion"
      subtitle="Profile manufacturing workflow — receives raw billets, runs the press, ages the profiles, and hands them off to surface treatment."
      breadcrumbs={[
        { label: "Home", href: "/home" },
        { label: "Extrusion", href: "/home/extrusion" },
      ]}
    >
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/home/extrusion/bucket-income"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition hover:border-pink-500/60 hover:bg-white/10 hover:-translate-y-1"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 opacity-10 blur-2xl transition group-hover:opacity-30" />
          <div className="relative">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 3h18v18H3z M3 9h18 M9 21V9" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-pink-300">Bucket Income</h3>
            <p className="mt-1 text-sm text-zinc-400">Record incoming buckets from suppliers</p>
          </div>
        </Link>

        <Link
          href="/home/extrusion/profile-income"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition hover:border-pink-500/60 hover:bg-white/10 hover:-translate-y-1"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 opacity-10 blur-2xl transition group-hover:opacity-30" />
          <div className="relative">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M4 4h16v16H4z M4 8h16 M8 20V8" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-pink-300">Profile Income</h3>
            <p className="mt-1 text-sm text-zinc-400">Track finished extruded profiles</p>
          </div>
        </Link>

        <Link
          href="/home/extrusion/aging-process"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition hover:border-pink-500/60 hover:bg-white/10 hover:-translate-y-1"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 opacity-10 blur-2xl transition group-hover:opacity-30" />
          <div className="relative">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2v20 M2 12h20 M5 5l14 14 M19 5L5 19" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-pink-300">Aging Process</h3>
            <p className="mt-1 text-sm text-zinc-400">Heat treatment batch management</p>
          </div>
        </Link>

        <Link
          href="/home/extrusion/overview"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition hover:border-pink-500/60 hover:bg-white/10 hover:-translate-y-1"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 opacity-10 blur-2xl transition group-hover:opacity-30" />
          <div className="relative">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 3h18v18H3z M9 9h6v6H9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-pink-300">Overview</h3>
            <p className="mt-1 text-sm text-zinc-400">View reports and analytics</p>
          </div>
        </Link>
      </div>
    </DetailView>
  );
}
