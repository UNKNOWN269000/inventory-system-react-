"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SlideMenu } from "@/components/SlideMenu";
import { MenuButton } from "@/components/MenuButton";
import { useAuth } from "@/context/AuthContext";
import { menuStructure } from "@/lib/menu";
import { supabase } from "@/lib/supabase";
import { CloudSync } from "@/components/CloudSync";

type Bucket = {
  id: number;
  bucket_no: string;
  profile: string;
  ext_date: string;
  shift: string;
  total_weight: string;
  hardness: number | null;
  length: string;
  qty: string;
};

export default function HardnessCheck() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const [availableBuckets, setAvailableBuckets] = useState<Bucket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);
  const [hardness, setHardness] = useState("");
  const [result, setResult] = useState<"Pass" | "Fail">("Pass");
  const [loading, setLoading] = useState(false);
  const [showCloudSync, setShowCloudSync] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentData, setRecentData] = useState<any[]>([]);

  useEffect(() => {
    loadAvailableBuckets();
    loadRecentData();
  }, []);

  const loadAvailableBuckets = async () => {
    try {
      const { data, error } = await supabase
        .from("bucket_income")
        .select("id, bucket_no, profile, ext_date, shift, total_weight, hardness, length, qty")
        .not("aging_date", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const filtered = (data || []).filter((b: any) => {
        if (b.hardness === null || b.hardness === undefined) return true;
        if (b.hardness === 0) return true;
        if (b.hardness === "") return true;
        return false;
      });

      setAvailableBuckets(filtered);
    } catch (err) {
      console.error("Error loading buckets:", err);
    }
  };

  const loadRecentData = async () => {
    try {
      const { data, error } = await supabase
        .from("hardness_check")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecentData(data || []);
    } catch (err) {
      console.error("Error loading recent data:", err);
    }
  };

  const handleBucketClick = (bucket: Bucket) => {
    setSelectedBucket(bucket);
    setShowModal(true);
    setHardness("");
    setResult("Pass");
  };

  const handleHardnessChange = (value: string) => {
    setHardness(value);
    const h = parseFloat(value);
    if (!isNaN(h)) {
      setResult(h >= 10 ? "Pass" : "Fail");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBucket(null);
    setHardness("");
  };

  const saveHardness = async () => {
    if (!selectedBucket) return;
    if (!hardness) {
      alert("Please enter hardness value");
      return;
    }
    if (!user) {
      alert("Please log in");
      return;
    }

    setShowCloudSync(true);
    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from("hardness_check")
        .insert([{
          sample_no: `S-${selectedBucket.bucket_no}-1`,
          bucket_no: selectedBucket.bucket_no,
          profile: selectedBucket.profile,
          hardness: hardness,
          result: result,
          operator: user,
          test_date: new Date().toISOString().slice(0, 10),
          submitted: true,
        }]);

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from("bucket_income")
        .update({ hardness: parseFloat(hardness) })
        .eq("id", selectedBucket.id);

      if (updateError) throw updateError;

      await new Promise((resolve) => setTimeout(resolve, 2500));
      setShowCloudSync(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        closeModal();
        loadAvailableBuckets();
        loadRecentData();
      }, 2000);
    } catch (err: any) {
      console.error("Error saving:", err);
      alert(`Error: ${err.message}`);
      setShowCloudSync(false);
    } finally {
      setLoading(false);
    }
  };

  // Filter buckets based on search
  const filteredBuckets = availableBuckets.filter((bucket) =>
    bucket.bucket_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const glassCard = "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl";
  const glassInput = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-pink-500 backdrop-blur-sm transition-colors";
  const glassBtnPrimary = "rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-pink-500/40 disabled:opacity-50";
  const glassBtnSecondary = "rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-300 backdrop-blur-sm transition hover:border-pink-400 hover:bg-white/10 hover:text-pink-300";

  return (
    <div className="min-h-screen text-zinc-100">
      <SlideMenu nodes={menuStructure} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <MenuButton onClick={() => setMenuOpen(true)} />
            <Link href="/home" className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 font-bold text-white shadow-lg shadow-pink-500/20">U</div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-white">Ultra Aluminum</p>
                <p className="text-xs text-zinc-500">Pvt Ltd</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user && <span className="text-xs text-zinc-500">User: {user}</span>}
            <button onClick={logout} className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-pink-400 hover:text-pink-300">Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-zinc-500">
          <Link href="/home" className="hover:text-zinc-300">Home</Link>
          <span className="text-zinc-700">/</span>
          <Link href="/home/mill-finish" className="hover:text-zinc-300">Mill Finish</Link>
          <span className="text-zinc-700">/</span>
          <span className="text-pink-300">Hardness Check</span>
        </nav>

        {/* Welcome Card */}
        <div className={`mt-4 overflow-hidden p-8 ${glassCard}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400" />
              Quality Assurance
            </div>
            <h2 className="mt-3 text-3xl font-bold text-white">Hardness Analytics</h2>
            <p className="mt-2 text-sm text-zinc-400">Quality assurance control panel for production verification. Click any bucket below to record hardness.</p>
          </div>
        </div>

        {/* Buckets List - Clickable */}
        <div className={`mt-6 p-6 ${glassCard}`}>
          <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-white">Buckets Awaiting Hardness Test</h3>
            <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-medium text-pink-400">
              {filteredBuckets.length} of {availableBuckets.length} bucket(s)
            </span>
          </div>

          {/* Search Bar */}
          {availableBuckets.length > 0 && (
            <div className="relative mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by bucket number..."
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {availableBuckets.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-black/30 px-4 py-8 text-center text-sm text-zinc-500">
              No buckets awaiting hardness test. All aged buckets have been tested.
            </div>
          ) : filteredBuckets.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-black/30 px-4 py-8 text-center text-sm text-zinc-500">
              No buckets matching "{searchTerm}"
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBuckets.map((bucket) => (
                <button
                  key={bucket.id}
                  onClick={() => handleBucketClick(bucket)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-left transition hover:border-pink-500/60 hover:bg-white/10 hover:shadow-pink-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-pink-400">{bucket.bucket_no}</p>
                      <p className="text-sm text-zinc-300">{bucket.profile}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs text-zinc-500">
                        <p>{bucket.ext_date}</p>
                        <p>{bucket.shift}</p>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Records */}
        {recentData.length > 0 && (
          <div className={`mt-6 p-6 ${glassCard}`}>
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-semibold text-white">Recent Hardness Records</h3>
              <button
                onClick={loadRecentData}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm transition hover:border-pink-400 hover:text-pink-300"
              >
                ↻ Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-400">
                    <th className="px-3 py-2">Sample</th>
                    <th className="px-3 py-2">Bucket</th>
                    <th className="px-3 py-2">Profile</th>
                    <th className="px-3 py-2">HBW</th>
                    <th className="px-3 py-2">Result</th>
                    <th className="px-3 py-2">Checked By</th>
                  </tr>
                </thead>
                <tbody>
                  {recentData.map((row) => (
                    <tr key={row.id} className="border-b border-white/5 transition hover:bg-white/5">
                      <td className="px-3 py-2 font-semibold text-pink-400">{row.sample_no}</td>
                      <td className="px-3 py-2 text-zinc-300">{row.bucket_no}</td>
                      <td className="px-3 py-2 text-zinc-300">{row.profile}</td>
                      <td className="px-3 py-2 font-bold text-white">{row.hardness}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            row.result === "Pass"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {row.result}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-zinc-300">{row.operator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Hardness Entry Modal - Scrollable */}
      {showModal && selectedBucket && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className={`w-full max-w-md overflow-hidden ${glassCard}`}>
                <div className="sticky top-0 z-10 border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Record Hardness</h3>
                    <button
                      onClick={closeModal}
                      className="rounded-md p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
                  <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <label className="text-xs uppercase tracking-wider text-zinc-500">Bucket No</label>
                    <p className="mt-1 text-base font-bold text-pink-400">{selectedBucket.bucket_no}</p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <label className="text-xs uppercase tracking-wider text-zinc-500">Profile</label>
                    <p className="mt-1 text-sm text-zinc-200">{selectedBucket.profile}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                      <label className="text-xs uppercase tracking-wider text-zinc-500">Length (m)</label>
                      <p className="mt-1 text-sm text-zinc-200">{selectedBucket.length || "—"}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                      <label className="text-xs uppercase tracking-wider text-zinc-500">Qty</label>
                      <p className="mt-1 text-sm text-zinc-200">{selectedBucket.qty || "—"}</p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Hardness (HBW)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={hardness}
                      onChange={(e) => handleHardnessChange(e.target.value)}
                      placeholder="Enter HBW value"
                      className={glassInput}
                      autoFocus
                    />
                  </div>

                  <div className={`rounded-lg border p-3 ${
                    result === "Pass"
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-red-500/30 bg-red-500/10"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-zinc-400">Result</span>
                      <span className={`text-lg font-bold ${
                        result === "Pass" ? "text-green-300" : "text-red-300"
                      }`}>
                        {result}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 p-3">
                    <label className="text-xs uppercase tracking-wider text-pink-400">Checked By</label>
                    <p className="mt-1 text-base font-semibold text-white">{user || "Not logged in"}</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={saveHardness}
                      disabled={loading || !hardness}
                      className={`${glassBtnPrimary} flex-1`}
                    >
                      {loading ? "Saving..." : "Save Hardness"}
                    </button>
                    <button
                      onClick={closeModal}
                      className={`${glassBtnSecondary} flex-1`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Cloud Sync Animation */}
      {showCloudSync && <CloudSync />}

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 backdrop-blur-xl">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center shadow-2xl backdrop-blur-2xl">
            <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-green-500/20">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Hardness Recorded</h2>
            <p className="mt-2 text-sm text-zinc-400">Successfully synced to database</p>
          </div>
        </div>
      )}
    </div>
  );
}
