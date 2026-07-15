"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SlideMenu } from "@/components/SlideMenu";
import { MenuButton } from "@/components/MenuButton";
import { useAuth } from "@/context/AuthContext";
import { menuStructure } from "@/lib/menu";
import { supabase } from "@/lib/supabase";

type Bucket = {
  id: number;
  bucket_no: string;
  ext_date: string;
  shift: string;
  type: string;
  profile: string;
  length: string;
  qty: string;
  aging_date: string | null;
  in_time: string | null;
  out_time: string | null;
  hardness: number | null;
  total_weight: string;
  batch_no: string;
  created_at: string;
};

const PAGE_SIZE = 1000;

export default function BucketDetails() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBuckets();
  }, []);

  const loadBuckets = async (loadMore = false) => {
    setLoading(true);
    setError(null);
    try {
      const from = loadMore ? page * PAGE_SIZE : 0;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("bucket_income")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const newData = data || [];

      if (loadMore) {
        setBuckets((prev) => [...prev, ...newData]);
      } else {
        setBuckets(newData);
      }

      setHasMore(newData.length === PAGE_SIZE);
      setPage(loadMore ? page + 1 : 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load buckets";
      setError(message);
      console.error("Error loading buckets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setPage(0);
    setHasMore(true);
    loadBuckets(false);
  };

  const handleLoadMore = () => {
    loadBuckets(true);
  };

  const filteredBuckets = buckets.filter((bucket) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      bucket.bucket_no.toLowerCase().includes(search) ||
      bucket.profile.toLowerCase().includes(search) ||
      bucket.type.toLowerCase().includes(search) ||
      bucket.shift.toLowerCase().includes(search) ||
      bucket.batch_no.toLowerCase().includes(search);
    const matchesDate = !dateFilter || bucket.ext_date === dateFilter;
    return matchesSearch && matchesDate;
  });

  const glassCard = "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl";
  const glassInput =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-pink-500 backdrop-blur-sm transition-colors";

  return (
    <div className="min-h-screen text-zinc-100">
      <SlideMenu
        nodes={menuStructure}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <MenuButton onClick={() => setMenuOpen(true)} />
            <Link href="/home" className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 font-bold text-white shadow-lg shadow-pink-500/20">
                U
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-white">
                  Ultra Aluminum
                </p>
                <p className="text-xs text-zinc-500">Pvt Ltd</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-xs text-zinc-500">User: {user}</span>
            )}
            <button
              onClick={logout}
              className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-pink-400 hover:text-pink-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-zinc-500">
          <Link href="/home" className="hover:text-zinc-300">
            Home
          </Link>
          <span className="text-zinc-700">/</span>
          <Link href="/home/mill-finish" className="hover:text-zinc-300">
            Mill Finish
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-pink-300">Bucket Details</span>
        </nav>

        {/* Header */}
        <div className={`mt-4 overflow-hidden p-8 ${glassCard}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400" />
                Bucket Records
              </div>
              <h1 className="mt-3 text-3xl font-bold text-white">
                Bucket Details
              </h1>
              <p className="text-sm text-zinc-400">
                Complete bucket lifecycle and traceability
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm">
                <span className="text-zinc-400">Total: </span>
                <span className="font-bold text-pink-400">{buckets.length}</span>
                {hasMore && (
                  <span className="ml-1 text-xs text-zinc-500">(+ more)</span>
                )}
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 backdrop-blur-sm transition hover:border-pink-400 hover:text-pink-300 disabled:opacity-50"
              >
                {loading ? "Loading..." : "↻ Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`mt-6 p-6 ${glassCard}`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by bucket number, profile, type, shift, batch..."
                className={`${glassInput} pl-10 pr-10`}
              />
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-300"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={glassInput}
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-pink-400 transition hover:text-pink-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
            <span>
              Showing {filteredBuckets.length} of {buckets.length} loaded
              records
            </span>
            {(searchTerm || dateFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("");
                }}
                className="text-pink-400 transition hover:text-pink-300"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div
            className={`mt-6 border border-red-500/30 bg-red-500/10 p-4 ${glassCard}`}
          >
            <p className="text-sm text-red-400">⚠️ {error}</p>
          </div>
        )}

        {/* Table */}
        <div className={`mt-6 overflow-hidden ${glassCard}`}>
          <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-3">
            <h2 className="text-lg font-semibold text-white">
              All Bucket Records
            </h2>
          </div>

          {loading && buckets.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              Loading bucket records…
            </div>
          ) : filteredBuckets.length === 0 && (searchTerm || dateFilter) ? (
            <div className="rounded-lg border border-white/10 bg-black/30 px-4 py-8 text-center text-sm text-zinc-500">
              No buckets matching your filters
              {searchTerm && ` for "${searchTerm}"`}
              {dateFilter && ` on ${dateFilter}`}
            </div>
          ) : filteredBuckets.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No bucket records found in the database.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                      <th className="px-3 py-3">Bucket No</th>
                      <th className="px-3 py-3">Extrusion Date</th>
                      <th className="px-3 py-3">Shift</th>
                      <th className="px-3 py-3">Type</th>
                      <th className="px-3 py-3">Profile</th>
                      <th className="px-3 py-3">Length</th>
                      <th className="px-3 py-3">Qty</th>
                      <th className="px-3 py-3">Total Weight</th>
                      <th className="px-3 py-3">Batch No</th>
                      <th className="px-3 py-3">Aging Date</th>
                      <th className="px-3 py-3">In Time</th>
                      <th className="px-3 py-3">Out Time</th>
                      <th className="px-3 py-3">Hardness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBuckets.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-white/5 transition hover:bg-white/5"
                      >
                        <td className="px-3 py-3 font-bold text-pink-400">
                          {row.bucket_no}
                        </td>
                        <td className="px-3 py-3 text-zinc-300">
                          {row.ext_date}
                        </td>
                        <td className="px-3 py-3 text-zinc-300">
                          {row.shift || "—"}
                        </td>
                        <td className="px-3 py-3 text-zinc-300">
                          {row.type || "—"}
                        </td>
                        <td className="px-3 py-3 text-zinc-300">
                          {row.profile || "—"}
                        </td>
                        <td className="px-3 py-3 text-zinc-300">
                          {row.length || "—"}
                        </td>
                        <td className="px-3 py-3 text-zinc-300">
                          {row.qty || "—"}
                        </td>
                        <td className="px-3 py-3 text-zinc-300">
                          {row.total_weight || "—"}
                        </td>
                        <td className="px-3 py-3 text-zinc-300">
                          {row.batch_no || "—"}
                        </td>
                        <td className="px-3 py-3 text-zinc-300">
                          {row.aging_date ? (
                            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                              {row.aging_date}
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-zinc-300">
                          {row.in_time || "—"}
                        </td>
                        <td className="px-3 py-3 text-zinc-300">
                          {row.out_time || "—"}
                        </td>
                        <td className="px-3 py-3">
                          {row.hardness !== null && row.hardness !== 0 ? (
                            <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-xs font-bold text-pink-300">
                              {row.hardness}
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Load More Button */}
              {hasMore && !searchTerm && !dateFilter && (
                <div className="border-t border-white/10 bg-black/20 p-4 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="rounded-md border border-white/10 bg-white/5 px-6 py-2 text-sm text-zinc-300 transition hover:border-pink-400 hover:text-pink-300 disabled:opacity-50"
                  >
                    {loading ? "Loading more..." : "Load More Records"}
                  </button>
                  <p className="mt-2 text-xs text-zinc-500">
                    Showing {buckets.length} records. Click to load {PAGE_SIZE} more.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
