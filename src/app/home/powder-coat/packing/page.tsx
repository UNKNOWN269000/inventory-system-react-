import Link from "next/link";
import { DetailView } from "@/components/DetailView";

export const metadata = { title: "Packing · Ultra Aluminum" };

export default function PackingPage() {
  return (
    <DetailView
      title="Packing"
      subtitle="Packing lines for both powder coat and wood finish output."
      breadcrumbs={[
        { label: "Home", href: "/home" },
        { label: "Powder Coat", href: "/home/powder-coat" },
        { label: "Packing", href: "/home/powder-coat/packing" },
      ]}
    >
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Link
          href="/home/powder-coat/packing/powder-coat"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition hover:border-pink-500/60 hover:bg-white/10 hover:-translate-y-1"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 opacity-10 blur-2xl transition group-hover:opacity-30" />
          <div className="relative">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-pink-300">Powder Coat</h3>
            <p className="mt-1 text-sm text-zinc-400">Pallet building and dispatch for powder coat</p>
          </div>
        </Link>

        <Link
          href="/home/powder-coat/packing/wood-finish"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition hover:border-amber-500/60 hover:bg-white/10 hover:-translate-y-1"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 opacity-10 blur-2xl transition group-hover:opacity-30" />
          <div className="relative">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-amber-300">Wood Finish</h3>
            <p className="mt-1 text-sm text-zinc-400">Pallet building and dispatch for wood finish</p>
          </div>
        </Link>
      </div>
    </DetailView>
  );
}
