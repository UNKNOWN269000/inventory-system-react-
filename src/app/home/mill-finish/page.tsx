import Link from "next/link";
import { DetailView } from "@/components/DetailView";

export const metadata = { title: "Mill Finish · Ultra Aluminum" };

export default function MillFinishPage() {
  return (
    <DetailView
      title="Mill Finish"
      subtitle="Surface preparation and quality verification before the profile is released to coating or anodizing."
      breadcrumbs={[
        { label: "Home", href: "/home" },
        { label: "Mill Finish", href: "/home/mill-finish" },
      ]}
    >
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
        <Link
          href="/home/mill-finish/hardness-check"
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
            <h3 className="text-xl font-bold text-white group-hover:text-pink-300">Hardness Check</h3>
            <p className="mt-1 text-sm text-zinc-400">Brinell hardness verification per batch</p>
          </div>
        </Link>

        <Link
          href="/home/mill-finish/bucket-details"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition hover:border-pink-500/60 hover:bg-white/10 hover:-translate-y-1"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 opacity-10 blur-2xl transition group-hover:opacity-30" />
          <div className="relative">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 3h18v18H3z M9 9h6v6H9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-pink-300">Bucket Details</h3>
            <p className="mt-1 text-sm text-zinc-400">Per-bucket traceability and handoff</p>
          </div>
        </Link>
      </div>
    </DetailView>
  );
}
