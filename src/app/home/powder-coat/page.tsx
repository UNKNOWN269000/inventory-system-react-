import Link from "next/link";
import { DetailView } from "@/components/DetailView";

export const metadata = { title: "Powder Coat · Ultra Aluminum" };

export default function PowderCoatPage() {
  return (
    <DetailView
      title="Powder Coat"
      subtitle="Finishing lines for powder-coated and wood-finish profiles — production, packing, and overview."
      breadcrumbs={[
        { label: "Home", href: "/home" },
        { label: "Powder Coat", href: "/home/powder-coat" },
      ]}
    >
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <Link
          href="/home/powder-coat/production"
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
            <h3 className="text-xl font-bold text-white group-hover:text-pink-300">Production</h3>
            <p className="mt-1 text-sm text-zinc-400">Coating and wood-finish production lines</p>
          </div>
        </Link>

        <Link
          href="/home/powder-coat/packing"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition hover:border-pink-500/60 hover:bg-white/10 hover:-translate-y-1"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 opacity-10 blur-2xl transition group-hover:opacity-30" />
          <div className="relative">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-pink-300">Packing</h3>
            <p className="mt-1 text-sm text-zinc-400">Pallet building and dispatch</p>
          </div>
        </Link>

        <Link
          href="/home/powder-coat/overview"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition hover:border-pink-500/60 hover:bg-white/10 hover:-translate-y-1"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 opacity-10 blur-2xl transition group-hover:opacity-30" />
          <div className="relative">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 3h18v18H3z M9 9h6v6H9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-pink-300">Overview</h3>
            <p className="mt-1 text-sm text-zinc-400">Department summary and analytics</p>
          </div>
        </Link>
      </div>
    </DetailView>
  );
}
