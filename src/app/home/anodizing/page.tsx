import Link from "next/link";
import { DetailView } from "@/components/DetailView";

export const metadata = { title: "Anodizing · Ultra Aluminum" };

export default function AnodizingPage() {
  return (
    <DetailView
      title="Anodizing"
      subtitle="Surface treatment, anodized production runs, and packing dispatch."
      breadcrumbs={[
        { label: "Home", href: "/home" },
        { label: "Anodizing", href: "/home/anodizing" },
      ]}
    >
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <Link
          href="/home/anodizing/binding"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition hover:border-pink-500/60 hover:bg-white/10 hover:-translate-y-1"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 opacity-10 blur-2xl transition group-hover:opacity-30" />
          <div className="relative">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2v20 M2 12h20" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-pink-300">Binding</h3>
            <p className="mt-1 text-sm text-zinc-400">Racking of profiles before anodizing bath</p>
          </div>
        </Link>

        <Link
          href="/home/anodizing/production"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition hover:border-purple-500/60 hover:bg-white/10 hover:-translate-y-1"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 opacity-10 blur-2xl transition group-hover:opacity-30" />
          <div className="relative">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-purple-300">Production</h3>
            <p className="mt-1 text-sm text-zinc-400">Anodizing bath process - etch, anodize, color, seal</p>
          </div>
        </Link>

        <Link
          href="/home/anodizing/packing"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition hover:border-emerald-500/60 hover:bg-white/10 hover:-translate-y-1"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 opacity-10 blur-2xl transition group-hover:opacity-30" />
          <div className="relative">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-emerald-300">Packing</h3>
            <p className="mt-1 text-sm text-zinc-400">De-racking, inspection, and packing of anodized profiles</p>
          </div>
        </Link>
      </div>
    </DetailView>
  );
}
