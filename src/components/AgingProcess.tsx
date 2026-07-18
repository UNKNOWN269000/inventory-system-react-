"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { SlideMenu } from "@/components/SlideMenu";
import { MenuButton } from "@/components/MenuButton";
import { useAuth } from "@/context/AuthContext";
import { menuStructure } from "@/lib/menu";
import { supabase } from "@/lib/supabase";
import { CloudSync } from "@/components/CloudSync";

type AgingEntry = {
  id?: number;
  aging_date: string;
  selected_buckets?: { bucket_no: string; weight: string }[];
  bucket_count?: string;
  total_weight: string;
  batch_in_time: string;
  batch_out_time: string;
  session_id?: string;
  submitted?: boolean;
  created_at?: string;
};

type RecentAgingEntry = {
  id: number;
  aging_date: string;
  total_weight: string;
  batch_in_time: string;
  batch_out_time: string;
  created_at: string;
};

type AvailableBucket = {
  id: number;
  bucket_no: string;
  total_weight: string;
  profile: string;
  ext_date: string;
};

type SelectedBucket = {
  id: number;
  bucket_no: string;
  weight: string;
};

export default function AgingProcess() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCloudSync, setShowCloudSync] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableBuckets, setAvailableBuckets] = useState<AvailableBucket[]>([]);
  const [selectedBuckets, setSelectedBuckets] = useState<SelectedBucket[]>([]);
  const [agingDate, setAgingDate] = useState("");
  const [bucketSearch, setBucketSearch] = useState("");
  const [showBucketDropdown, setShowBucketDropdown] = useState(false);
  const [recentData, setRecentData] = useState<RecentAgingEntry[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [batchInTime, setBatchInTime] = useState("");
  const [batchOutTime, setBatchOutTime] = useState("");
  const [currentBatch, setCurrentBatch] = useState<{
    date: string;
    buckets: SelectedBucket[];
    inTime: string;
    outTime: string;
  } | null>(null);
  const [sessionId] = useState(
    () => `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRecentData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowBucketDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadRecentData = async () => {
    setLoadingRecent(true);
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgo.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("aging_process")
        .select(
          "id, aging_date, total_weight, batch_in_time, batch_out_time, created_at"
        )
        .gte("aging_date", threeDaysAgoStr)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecentData(data || []);
    } catch (err: any) {
      console.error("Error loading recent data:", err);
    } finally {
      setLoadingRecent(false);
    }
  };

  const loadAvailableBuckets = async () => {
    try {
      const { data, error } = await supabase
        .from("bucket_income")
        .select("id, bucket_no, total_weight, profile, ext_date")
        .is("aging_date", null)
        .is("in_time", null)
        .is("out_time", null)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      console.log("Loaded buckets:", data);
      setAvailableBuckets(data || []);
    } catch (err: any) {
      console.error("Error loading buckets:", err);
      alert(`Error loading buckets: ${err.message}`);
    }
  };

  const openModal = () => {
    const today = new Date().toISOString().slice(0, 10);
    setAgingDate(today);
    setSelectedBuckets([]);
    setBucketSearch("");
    setShowBucketDropdown(false);
    setShowAddModal(true);
    loadAvailableBuckets();
  };

  const closeModal = () => {
    setShowAddModal(false);
    setSelectedBuckets([]);
    setBucketSearch("");
    setShowBucketDropdown(false);
  };

  const filteredBuckets = availableBuckets.filter((b) => {
    if (selectedBuckets.find((s) => s.bucket_no === b.bucket_no)) return false;
    return (
      b.bucket_no.toLowerCase().includes(bucketSearch.toLowerCase()) ||
      b.profile.toLowerCase().includes(bucketSearch.toLowerCase())
    );
  });

  const addBucket = (bucket: AvailableBucket) => {
    setSelectedBuckets([
      ...selectedBuckets,
      { id: bucket.id, bucket_no: bucket.bucket_no, weight: bucket.total_weight },
    ]);
    setBucketSearch("");
    setShowBucketDropdown(false);
  };

  const removeBucket = (bucketNo: string) => {
    setSelectedBuckets(selectedBuckets.filter((b) => b.bucket_no !== bucketNo));
  };

  const totalWeight = selectedBuckets
    .reduce((sum, b) => sum + parseFloat(b.weight || "0"), 0)
    .toFixed(2);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBuckets.length === 0) {
      alert("Please select at least one bucket");
      return;
    }
    if (!agingDate) {
      alert("Please select an aging date");
      return;
    }

    setCurrentBatch({
      date: agingDate,
      buckets: selectedBuckets,
      inTime: batchInTime,
      outTime: batchOutTime,
    });
    setShowAddModal(false);
  };

  const finalizeSubmit = async () => {
    if (!currentBatch) {
      alert("No batch to submit. Please add a record first.");
      return;
    }
    if (currentBatch.buckets.length === 0) {
      alert("No buckets in the batch.");
      return;
    }

    if (!batchInTime || !batchOutTime) {
      alert("Please enter both Batch In Time and Batch Out Time");
      return;
    }

    const finalTotalWeight = currentBatch.buckets
      .reduce((s, b) => s + parseFloat(b.weight || "0"), 0)
      .toFixed(2);

    setShowCloudSync(true);
    setLoading(true);
    try {
      const bucketIds = currentBatch.buckets.map((b) => b.id);
      const updateData: any = {
        aging_date: currentBatch.date,
      };
      if (batchInTime) updateData.in_time = batchInTime;
      if (batchOutTime) updateData.out_time = batchOutTime;

      console.log("Updating buckets:", bucketIds, "with:", updateData);

      const { data: updateResult, error: updateError } = await supabase
        .from("bucket_income")
        .update(updateData)
        .in("id", bucketIds)
        .select();

      if (updateError) {
        console.error("Error updating bucket_income:", updateError);
        throw updateError;
      }

      console.log("Updated bucket_income:", updateResult);

      const newEntry: any = {
        aging_date: currentBatch.date,
        selected_buckets: currentBatch.buckets.map((b) => ({
          bucket_no: b.bucket_no,
          weight: b.weight,
        })),
        bucket_count: currentBatch.buckets.length.toString(),
        total_weight: finalTotalWeight,
        submitted: true,
        session_id: sessionId,
        created_at: new Date().toISOString(),
      };
      if (batchInTime) newEntry.batch_in_time = batchInTime;
      if (batchOutTime) newEntry.batch_out_time = batchOutTime;

      console.log("Inserting into aging_process:", newEntry);

      const { data, error } = await supabase
        .from("aging_process")
        .insert([newEntry])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Saved to aging_process:", data);

      await new Promise((resolve) => setTimeout(resolve, 2500));
      setShowCloudSync(false);
      setShowLoader(true);

      setTimeout(() => {
        setShowLoader(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setCurrentBatch(null);
          setBatchInTime("");
          setBatchOutTime("");
          loadRecentData();
          loadAvailableBuckets();
        }, 2000);
      }, 1500);
    } catch (err: any) {
      console.error("Submit error:", err);
      alert(`Error saving to database: ${err.message}`);
      setShowCloudSync(false);
      setShowLoader(false);
    } finally {
      setLoading(false);
    }
  };

  const glassCard =
    "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl";
  const glassInput =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-pink-500 backdrop-blur-sm transition-colors";
  const glassBtnPrimary =
    "rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-pink-500/40 disabled:opacity-50";
  const glassBtnSecondary =
    "rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-300 backdrop-blur-sm transition hover:border-pink-400 hover:bg-white/10 hover:text-pink-300";

  return (
    <div className="min-h-screen text-zinc-100">
      <SlideMenu
        nodes={menuStructure}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {/* Header */}
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
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1 text-xs text-zinc-500">
          <Link href="/home" className="hover:text-zinc-300">
            Home
          </Link>
          <span className="text-zinc-700">/</span>
          <Link href="/home/extrusion" className="hover:text-zinc-300">
            Extrusion
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-pink-300">Aging Process</span>
        </nav>

        {/* Page Header Card */}
        <div className={`mt-4 overflow-hidden p-8 ${glassCard}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5" />
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Aging Details</h1>
              <h3 className="mt-2 text-lg text-pink-400">Extrusion Section</h3>
            </div>
            <button onClick={openModal} className={glassBtnPrimary}>
              + Add New Aging Record
            </button>
          </div>
        </div>

        {/* Pending Batch Card */}
        <div className={`mt-6 p-6 ${glassCard}`}>
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-pink-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Pending Batch</h2>
                <p className="text-xs text-zinc-500">
                  {currentBatch
                    ? `${currentBatch.buckets.length} bucket(s) ready to finalize`
                    : "No batch in progress"}
                </p>
              </div>
            </div>
          </div>

          {currentBatch ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Aging Date
                  </p>
                  <p className="mt-1 font-semibold text-pink-400">
                    {currentBatch.date}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Total Buckets
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {currentBatch.buckets.length}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Total Weight
                  </p>
                  <p className="mt-1 font-bold text-pink-400">
                    {currentBatch.buckets
                      .reduce((s, b) => s + parseFloat(b.weight || "0"), 0)
                      .toFixed(2)}{" "}
                    kg
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    In / Out Time
                  </p>
                  <p className="mt-1 text-zinc-200">
                    {currentBatch.inTime || "—"} /{" "}
                    {currentBatch.outTime || "—"}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                  Selected Buckets
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentBatch.buckets.map((b) => (
                    <span
                      key={b.bucket_no}
                      className="rounded-md border border-pink-500/30 bg-pink-500/10 px-2 py-1 text-xs text-pink-300"
                    >
                      {b.bucket_no}{" "}
                      <span className="text-zinc-500">({b.weight} kg)</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500">
              No records yet.
            </div>
          )}
        </div>

        {/* Recent Records Card */}
        <div className={`mt-6 p-6 ${glassCard}`}>
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-pink-400"
                >
                  <path d="M3 3h18v18H3z" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Recent Aging Records
                </h2>
                <p className="text-xs text-zinc-500">
                  Last 3 days from database
                </p>
              </div>
            </div>
            <button
              onClick={loadRecentData}
              disabled={loadingRecent}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm transition hover:border-pink-400 hover:text-pink-300 disabled:opacity-50"
            >
              {loadingRecent ? "Loading…" : "↻ Refresh"}
            </button>
          </div>

          {loadingRecent ? (
            <div className="py-8 text-center text-zinc-500">Loading…</div>
          ) : recentData.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">
              No records found in the last 3 days.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-3 py-2">Aging Date</th>
                    <th className="px-3 py-2">Total Weight (kg)</th>
                    <th className="px-3 py-2">Batch In</th>
                    <th className="px-3 py-2">Batch Out</th>
                    <th className="px-3 py-2">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {recentData.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-white/5 transition hover:bg-white/5"
                    >
                      <td className="px-3 py-2 font-semibold text-pink-400">
                        {row.aging_date}
                      </td>
                      <td className="px-3 py-2 font-bold text-pink-400">
                        {row.total_weight}
                      </td>
                      <td className="px-3 py-2 text-zinc-300">
                        {row.batch_in_time || "—"}
                      </td>
                      <td className="px-3 py-2 text-zinc-300">
                        {row.batch_out_time || "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-zinc-500">
                        {row.created_at
                          ? new Date(row.created_at).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Submit Footer */}
      {currentBatch && (
        <div className="sticky bottom-0 z-10 border-t border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-xs text-zinc-500">Total Buckets</p>
                <p className="text-lg font-bold text-white">
                  {currentBatch.buckets.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Total Batch Weight</p>
                <p className="text-lg font-bold text-pink-400">
                  {currentBatch.buckets
                    .reduce((s, b) => s + parseFloat(b.weight || "0"), 0)
                    .toFixed(2)}{" "}
                  kg
                </p>
              </div>
              <div>
                <label className="text-xs text-zinc-500">Batch In Time</label>
                <input
                  type="time"
                  value={batchInTime}
                  onChange={(e) => setBatchInTime(e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-black/50 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-pink-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Batch Out Time</label>
                <input
                  type="time"
                  value={batchOutTime}
                  onChange={(e) => setBatchOutTime(e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-black/50 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-pink-500"
                />
              </div>
            </div>
            <button
              onClick={finalizeSubmit}
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-pink-500/40 disabled:opacity-50"
            >
              ✓ Finalize & Submit Batch
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className={`w-full max-w-2xl overflow-hidden ${glassCard}`}>
              <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-4 backdrop-blur-xl">
                <h3 className="text-xl font-semibold text-white">
                  Add Aging Record
                </h3>
              </div>
              <form
                onSubmit={handleSave}
                className="max-h-[80vh] overflow-y-auto p-6 space-y-4"
              >
                {/* Aging Date */}
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Aging Date
                  </label>
                  <input
                    type="date"
                    value={agingDate}
                    onChange={(e) => setAgingDate(e.target.value)}
                    required
                    className={glassInput}
                  />
                </div>

                {/* Bucket Search */}
                <div className="relative" ref={dropdownRef}>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Select Buckets
                  </label>
                  <input
                    type="text"
                    value={bucketSearch}
                    onChange={(e) => {
                      setBucketSearch(e.target.value);
                      setShowBucketDropdown(true);
                    }}
                    onFocus={() => setShowBucketDropdown(true)}
                    placeholder="Search buckets by number or profile..."
                    autoComplete="off"
                    className={glassInput}
                  />

                  {/* Dropdown */}
                  {showBucketDropdown && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl">
                      {filteredBuckets.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-zinc-500">
                          No available buckets found
                        </div>
                      ) : (
                        filteredBuckets.map((b) => (
                          <div
                            key={b.bucket_no}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              addBucket(b);
                            }}
                            className="cursor-pointer border-b border-zinc-900 px-3 py-2 text-sm text-zinc-300 transition hover:bg-pink-500/20 hover:text-pink-300"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-pink-400">
                                {b.bucket_no}
                              </span>
                              <span className="text-xs text-zinc-500">
                                {b.total_weight} kg
                              </span>
                            </div>
                            <div className="text-xs text-zinc-500">
                              {b.profile} • {b.ext_date}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Selected Bucket Tags */}
                  {selectedBuckets.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedBuckets.map((b) => (
                        <span
                          key={b.bucket_no}
                          className="inline-flex items-center gap-1 rounded-md border border-pink-500/30 bg-pink-500/10 px-2 py-1 text-xs text-pink-300"
                        >
                          {b.bucket_no}
                          <button
                            type="button"
                            onClick={() => removeBucket(b.bucket_no)}
                            className="ml-1 text-pink-400 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total Weight */}
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Current Entry Weight (kg)
                  </label>
                  <input
                    type="text"
                    value={totalWeight}
                    readOnly
                    className="w-full rounded-lg border border-dashed border-pink-500/30 bg-pink-500/5 px-3 py-3 text-sm font-bold text-pink-400"
                  />
                </div>

                {/* Buttons */}
                <div className="mt-6 flex gap-3">
                  <button type="submit" className={glassBtnPrimary}>
                    Add Entry
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className={glassBtnSecondary}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Cloud Sync Animation */}
      {showCloudSync && <CloudSync />}

      {/* Processing Loader */}
      {showLoader && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 backdrop-blur-xl">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-pink-500/20 border-t-pink-500" />
            <h2 className="text-xl font-bold text-white">
              Processing Batch...
            </h2>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 backdrop-blur-xl">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center shadow-2xl backdrop-blur-2xl">
            <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-green-500/20">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-green-400"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Success!</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Aging Batch Data Recorded
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
