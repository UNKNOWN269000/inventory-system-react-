"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { SlideMenu } from "@/components/SlideMenu";
import { MenuButton } from "@/components/MenuButton";
import { useAuth } from "@/context/AuthContext";
import { menuStructure } from "@/lib/menu";
import { supabase } from "@/lib/supabase";
import { CloudSync } from "@/components/CloudSync";
import { Dropdown } from "@/components/Dropdown";

// ─── Types ──────────────────────────────────────────────────────────
type LengthQty = { checked: boolean; qty: string };

type ProfileEntry = {
  id?: number;
  profile_no?: string;
  user_id?: string | null;
  session_id?: string;
  ext_date: string;
  shift: string;
  batch_no: string;
  profile: string;
  length_365: string | null;
  length_61: string | null;
  length_65: string | null;
  custom_length_value: string | null;
  custom_length_qty: string | null;
  in_weight: string;
  out_weight: string;
  off_cut: string;
  yield_percent: string;
  die_status: string;
  submitted?: boolean;
  created_at?: string;
  updated_at?: string;
};

type RecentEntry = {
  id: number;
  profile_no: string;
  ext_date: string;
  shift: string;
  yield_percent: string;
  created_at: string;
};

// ─── Constants ─────────────────────────────────────────────────────
const SHIFT_OPTIONS = [
  { value: "Day", label: "Day" },
  { value: "Night", label: "Night" },
  { value: "Day I", label: "Day I" },
  { value: "Day II", label: "Day II" },
];

type LengthKey = "length_365" | "length_61" | "length_65" | "custom";

const LENGTH_OPTIONS: { key: LengthKey; label: string }[] = [
  { key: "length_365", label: "3.65m" },
  { key: "length_61", label: "6.1m" },
  { key: "length_65", label: "6.5m" },
  { key: "custom", label: "Other (custom)" },
];

const PROFILES = [
  "06 CH 09", "08 CH 09", "09 CH 09", "09 RP 07", "10 CH 09",
  "10 CR 02", "10 CR 03", "10 CT 01", "10 GB 01", "10 GB 02",
  "10 MS 03", "10 MS 04", "10 PC 01", "10 PC 02", "10 PC 03",
  "10 PC 04", "10 PC 05", "10 PC 06", "10 PC 07", "10 PC 08",
  "10 PC 09", "10 PC 10", "10 PC 11", "10 SC 01", "10 SC 02",
  "10 SC 03", "10 SC 04", "10 SL 03", "10 SL 05", "10 SL 06",
  "10 SL 07", "10 SL 08", "100 DO 01", "100 DO 02", "100 DO 03",
  "100 DO 04", "100 DO 05", "100 DO 06", "100 DO 07", "100 DO 08",
  "100 DO 09", "100 DO 10", "100 DO 11", "100 DO 12", "100 DO 13",
  "100 PA 01", "100 PA 02", "100 SD 01 A", "100 SD 01", "100 SD 02 A",
  "100 SD 02", "100 SD 03 A", "100 SD 03", "100 SD 04", "100 SD 05",
  "100 SD 06", "100 SD 07", "100 SD 08", "100 SD 09", "100 SD 10",
  "100 SD 11", "100 SD 12", "100 SD 13", "100 SD 14", "100 SD 15",
  "100 SD 16", "100 SD 17", "100 SD 18", "100 SD 19", "100 SD 20",
  "100 SF 01", "100 SF 02", "100 SF 03", "100 SF 04", "100 SF 05",
  "100 SF 06", "100 SF 07", "100 SF 08", "11 CH 10", "12 AN 12",
  "12 CH 12", "12 PL 01", "12 RP 10", "12 TU 12", "16 RP 14",
  "19 AN 12", "19 AN 19", "19 AT 19", "19 PL 01", "19 RP 17",
  "19 TU 19", "20 SL 02", "30 SL 01", "30 SL 02", "30 SL 03",
  "30 SL 04", "30 SL 05", "25 AN 25", "25 AT 25", "25 PL 01",
  "25 PL 03", "25 RP 23", "25 TU 25", "38 AN 38", "38 AT 38",
  "38 DO 01", "38 DO 02", "38 DO 03", "38 DO 04", "38 TU 25",
  "38 TU 28", "38 TU 38", "41 CA 01", "41 CA 02", "41 CA 03",
  "41 CA 04", "41 CA 05", "41 CA 06", "41 CA 07", "41 CA 08",
  "41 CA 09", "41 CA 13", "50 TU 25", "50 TU 50", "55 SM 01",
  "55 SM 02", "55 SM 03", "55 SM 05", "55 SM 06", "55 SM 12",
  "55 SM 13", "60 CA 01", "60 CA 02", "60 CA 03", "70 CA 01",
  "70 CA 02", "70 CA 21", "70 CA 22", "70 CA 23", "70 CA 24",
  "70 CA 26", "70 SD 41", "70 SD 42", "70 SD 43", "70 SD 44",
  "70 SD 45", "70 SD 46", "70 SW 01", "70 SW 02", "70 SW 03",
  "70 SW 04", "70 SW 05", "70 SW 06", "70 SW 07", "70 SW 08",
  "70 SW 09", "70 SW 10", "70 SW 11", "70 SW 12", "76 PA 01",
  "76 PA 02", "76 PA 03", "76 PA 04", "76 PA 05", "76 PA 06",
  "76 SF 01", "76 SF 02", "76 SF 03", "76 SF 04", "76 SF 05",
  "76 SF 06", "76 SF 08", "76 SF 09", "76 SF 11", "76 TU 25",
  "76 TU 38", "76 TU 76", "80 SW 01", "80 SW 02", "80 SW 03",
  "80 SW 04", "80 SW 05", "80 SW 06", "80 SW 07", "80 SW 08",
  "80 SW 09", "80 SW 10", "80 SW 11", "80 SW 12", "80 SW 13",
  "80 SW 14",
];

// ─── Helpers ───────────────────────────────────────────────────────
const todayISO = () => new Date().toISOString().slice(0, 10);

const buildEmptyLengths = (): Record<LengthKey, LengthQty> => ({
  length_365: { checked: false, qty: "" },
  length_61: { checked: false, qty: "" },
  length_65: { checked: false, qty: "" },
  custom: { checked: false, qty: "" },
});

const buildEmptyForm = () => ({
  extDate: todayISO(),
  shift: "",
  batchNo: "",
  profile: "",
  lengths: buildEmptyLengths(),
  customLengthValue: "",
  inWeight: "",
  outWeight: "",
  offCut: "",
  dieStatus: "",
});

// ─── Component ─────────────────────────────────────────────────────
export default function ProfileIncome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const [entries, setEntries] = useState<ProfileEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCloudSync, setShowCloudSync] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ProfileEntry | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentData, setRecentData] = useState<RecentEntry[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  // Stable session id persisted across page reloads
  const [sessionId] = useState<string>(() => {
    if (typeof window === "undefined") return "ssr";
    const k = "profile_income_session_id";
    let v = window.localStorage.getItem(k);
    if (!v) {
      v = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      window.localStorage.setItem(k, v);
    }
    return v;
  });

  const [form, setForm] = useState(buildEmptyForm);

  // ── Effects ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthUserId(data.user?.id ?? null);
    });
    loadRecentData();
    loadPendingEntries(); // ✅ NEW: load unsaved entries from DB
  }, []);

  // Close profile search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Data loading ──
  const loadRecentData = async () => {
    setLoadingRecent(true);
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgo.toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("profile_income")
        .select("id, profile_no, ext_date, shift, yield_percent, created_at")
        .eq("submitted", true)
        .gte("ext_date", threeDaysAgoStr)
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

  // ✅ NEW: Load pending (submitted = false) entries from DB
  const loadPendingEntries = async () => {
    setLoadingPending(true);
    try {
      const { data, error } = await supabase
        .from("profile_income")
        .select("*")
        .eq("submitted", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEntries(data || []);
    } catch (err: any) {
      console.error("Error loading pending entries:", err);
    } finally {
      setLoadingPending(false);
    }
  };

  // ── Derived ──
  const filteredProfiles = PROFILES.filter((p) =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calcYield = () => {
    const inW = parseFloat(form.inWeight) || 0;
    const outW = parseFloat(form.outWeight) || 0;
    if (inW <= 0) return "0.00";
    return ((outW / inW) * 100).toFixed(2);
  };

  const buildEntry = () => ({
    user_id: authUserId,
    session_id: sessionId,
    ext_date: form.extDate,
    shift: form.shift,
    batch_no: form.batchNo,
    profile: form.profile,
    length_365: form.lengths.length_365.checked ? (form.lengths.length_365.qty || "0") : null,
    length_61: form.lengths.length_61.checked ? (form.lengths.length_61.qty || "0") : null,
    length_65: form.lengths.length_65.checked ? (form.lengths.length_65.qty || "0") : null,
    custom_length_value: form.lengths.custom.checked ? (form.customLengthValue || null) : null,
    custom_length_qty: form.lengths.custom.checked ? (form.lengths.custom.qty || "0") : null,
    in_weight: form.inWeight,
    out_weight: form.outWeight,
    off_cut: form.offCut,
    yield_percent: calcYield(),
    die_status: form.dieStatus,
    submitted: false,
  });

  // ── Submit / save / delete ──
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.profile) {
      alert("Please select a profile from the search list.");
      return;
    }
    setLoading(true);
    const payload = buildEntry();
    try {
      if (editingId) {
        const { data, error } = await supabase
          .from("profile_income")
          .update(payload)
          .eq("id", editingId)
          .select()
          .single();
        if (error) throw error;
        setEntries(entries.map((e) => (e.id === editingId ? (data as ProfileEntry) : e)));
      } else {
        const { data, error } = await supabase
          .from("profile_income")
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        setEntries([...entries, data as ProfileEntry]);
      }
      setShowAddModal(false);
      setEditingId(null);
      resetForm();
      await loadPendingEntries(); // ✅ refresh from DB
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const finalSubmit = () => {
    if (entries.length === 0) {
      alert("No entries to submit.");
      return;
    }
    setShowConfirm(true);
  };

  const executeFinalSubmit = async () => {
    setShowConfirm(false);
    setShowCloudSync(true);
    setLoading(true);
    try {
      const ids = entries.map((e) => e.id).filter(Boolean) as number[];
      const { error } = await supabase
        .from("profile_income")
        .update({ submitted: true })
        .in("id", ids);
      if (error) throw error;
      await loadPendingEntries(); // ✅ refresh — should now be empty
      await loadRecentData();
      await new Promise((r) => setTimeout(r, 2500));
      setShowCloudSync(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      setShowCloudSync(false);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(buildEmptyForm());
    setSearchTerm("");
  };

  const editEntry = (entry: ProfileEntry) => {
    if (entry.submitted) {
      alert("This entry is already submitted and cannot be edited.");
      return;
    }
    setEditingId(entry.id ?? null);
    setForm({
      extDate: entry.ext_date,
      shift: entry.shift,
      batchNo: entry.batch_no,
      profile: entry.profile,
      lengths: {
        length_365: { checked: !!entry.length_365, qty: entry.length_365 || "" },
        length_61: { checked: !!entry.length_61, qty: entry.length_61 || "" },
        length_65: { checked: !!entry.length_65, qty: entry.length_65 || "" },
        custom: { checked: !!entry.custom_length_value, qty: entry.custom_length_qty || "" },
      },
      customLengthValue: entry.custom_length_value || "",
      inWeight: entry.in_weight,
      outWeight: entry.out_weight,
      offCut: entry.off_cut,
      dieStatus: entry.die_status,
    });
    setSearchTerm(entry.profile);
    setShowAddModal(true);
  };

  const viewEntryDetails = async (id: number) => {
    const { data, error } = await supabase
      .from("profile_income")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    if (data) {
      setSelectedEntry(data as ProfileEntry);
      setShowDetailModal(true);
    }
  };

  const deleteEntry = async (id?: number) => {
    if (!id) return;
    if (!confirm("Delete this entry?")) return;
    try {
      const { error } = await supabase.from("profile_income").delete().eq("id", id);
      if (error) throw error;
      setEntries(entries.filter((e) => e.id !== id));
      await loadPendingEntries(); // ✅ refresh
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // ── Style tokens ──
  const glassCard = "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl";
  const glassInput =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-pink-500 backdrop-blur-sm transition-colors";
  const glassBtnPrimary =
    "rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-pink-500/40 disabled:opacity-50";
  const glassBtnSecondary =
    "rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-300 backdrop-blur-sm transition hover:border-pink-400 hover:bg-white/10 hover:text-pink-300";

  // ── Render ──
  return (
    <div className="min-h-screen text-zinc-100">
      <SlideMenu nodes={menuStructure} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

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
                <p className="text-sm font-semibold tracking-wide text-white">Ultra Aluminum</p>
                <p className="text-xs text-zinc-500">Pvt Ltd</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user && <span className="text-xs text-zinc-500">User: {user}</span>}
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
          <Link href="/home" className="hover:text-zinc-300">Home</Link>
          <span className="text-zinc-700">/</span>
          <Link href="/home/extrusion" className="hover:text-zinc-300">Extrusion</Link>
          <span className="text-zinc-700">/</span>
          <span className="text-pink-300">Profile Income</span>
        </nav>

        {/* Title */}
        <div className={`mt-4 overflow-hidden p-8 ${glassCard}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5" />
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Profile Income</h1>
              <h3 className="mt-2 text-lg text-pink-400">Extrusion Department</h3>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingId(null);
                setShowAddModal(true);
              }}
              disabled={loading}
              className={glassBtnPrimary}
            >
              + Add New Profile
            </button>
          </div>
        </div>

        {/* Pending records */}
        <div className={`mt-6 p-6 ${glassCard}`}>
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-400">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Pending Records</h2>
                <p className="text-xs text-zinc-500">
                  {loadingPending
                    ? "Loading…"
                    : entries.length === 0
                    ? "No pending records"
                    : `${entries.length} profile(s) pending submission`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadPendingEntries}
                disabled={loadingPending}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm transition hover:border-pink-400 hover:text-pink-300 disabled:opacity-50"
              >
                {loadingPending ? "Loading…" : "↻ Refresh"}
              </button>
              {entries.length > 0 && (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-pink-500/20 text-sm font-bold text-pink-400">
                  {entries.length}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 shadow-inner backdrop-blur-xl">
            {loadingPending ? (
              <div className="py-12 text-center text-zinc-500">Loading pending records…</div>
            ) : entries.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">No data recorded for this session.</div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-xl transition hover:border-pink-500/40 hover:bg-white/10"
                  >
                    <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-zinc-500">Profile No</p>
                        <p className="mt-1 font-semibold text-pink-400">
                          {entry.profile_no || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-zinc-500">Profile</p>
                        <p className="mt-1 text-zinc-200">{entry.profile}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-zinc-500">In / Out (kg)</p>
                        <p className="mt-1 text-zinc-200">
                          {entry.in_weight} / {entry.out_weight}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-zinc-500">Yield (%)</p>
                        <p className="mt-1 font-bold text-pink-400">{entry.yield_percent}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-zinc-500">Batch</p>
                        <p className="mt-1 text-zinc-200">{entry.batch_no}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-zinc-500">Die Status</p>
                        <p className="mt-1 text-zinc-200">{entry.die_status}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-zinc-500">Date / Shift</p>
                        <p className="mt-1 text-zinc-200">
                          {entry.ext_date} / {entry.shift}
                        </p>
                      </div>
                      <div className="flex items-end gap-2">
                        <button
                          onClick={() => editEntry(entry)}
                          disabled={loading}
                          className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-pink-500 hover:text-pink-300 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          disabled={loading}
                          className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-red-400 transition hover:border-red-500 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent data */}
        <div className={`mt-6 p-6 ${glassCard}`}>
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-400">
                  <path d="M3 3h18v18H3z" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Recent Added Data</h2>
                <p className="text-xs text-zinc-500">Last 3 days records from database</p>
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
            <div className="py-8 text-center text-zinc-500">Loading recent data…</div>
          ) : recentData.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">No records found in the last 3 days.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-3 py-2">Profile No</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Shift</th>
                    <th className="px-3 py-2">Yield (%)</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentData.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-white/5 transition hover:bg-white/10 cursor-pointer"
                      onClick={() => viewEntryDetails(row.id)}
                    >
                      <td className="px-3 py-2 font-semibold text-pink-400">{row.profile_no}</td>
                      <td className="px-3 py-2 text-zinc-300">{row.ext_date}</td>
                      <td className="px-3 py-2 text-zinc-300">{row.shift}</td>
                      <td className="px-3 py-2 font-bold text-pink-400">{row.yield_percent}%</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            viewEntryDetails(row.id);
                          }}
                          className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 transition hover:border-pink-500 hover:text-pink-300"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sticky submit bar */}
      {entries.length > 0 && (
        <div className="sticky bottom-0 z-10 border-t border-white/10 bg-white/10 px-6 py-4 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="text-sm text-zinc-400">
              <span className="font-semibold text-white">{entries.length}</span> profile(s) ready
            </div>
            <button onClick={finalSubmit} disabled={loading} className={glassBtnPrimary}>
              ✓ Final Submit Production
            </button>
          </div>
        </div>
      )}

      {/* Modal backdrops */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => {
            setShowAddModal(false);
            setEditingId(null);
            resetForm();
          }}
        />
      )}

      {/* Add/Edit modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className={`w-full max-w-3xl overflow-hidden ${glassCard} max-h-[90vh] flex flex-col`}>
            <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-4 backdrop-blur-xl">
              <h3 className="text-xl font-semibold text-white">
                {editingId ? "Edit Profile Entry" : "Profile Production Entry"}
              </h3>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Extrusion Date
                  </label>
                  <input
                    type="date"
                    value={form.extDate}
                    onChange={(e) => setForm({ ...form, extDate: e.target.value })}
                    required
                    className={glassInput}
                  />
                </div>

                <div>
                  <Dropdown
                    label="Shift"
                    value={form.shift}
                    onChange={(v) => setForm({ ...form, shift: v })}
                    placeholder="Select Shift"
                    required
                    options={SHIFT_OPTIONS}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Billet Batch No
                  </label>
                  <input
                    type="text"
                    value={form.batchNo}
                    onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
                    required
                    className={glassInput}
                  />
                </div>

                <div className="relative sm:col-span-2" ref={searchRef}>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Profile (Search)
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSearchResults(true);
                      if (form.profile && e.target.value !== form.profile) {
                        setForm((f) => ({ ...f, profile: "" }));
                      }
                    }}
                    onFocus={() => setShowSearchResults(true)}
                    placeholder="Search profiles..."
                    autoComplete="off"
                    required
                    className={glassInput}
                  />
                  {showSearchResults && searchTerm && (
                    <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl">
                      {filteredProfiles.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-zinc-500">No matches</div>
                      ) : (
                        filteredProfiles.map((p) => (
                          <div
                            key={p}
                            onClick={() => {
                              setForm({ ...form, profile: p });
                              setSearchTerm(p);
                              setShowSearchResults(false);
                            }}
                            className="cursor-pointer px-3 py-2 text-sm text-zinc-300 hover:bg-pink-500/20 hover:text-pink-300"
                          >
                            {p}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Lengths */}
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Lengths & Quantities
                </label>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm space-y-2">
                  {LENGTH_OPTIONS.map((opt) => (
                    <div key={opt.key} className="flex items-center gap-3">
                      <label className="flex w-28 cursor-pointer items-center gap-2 text-xs text-white/70">
                        <input
                          type="checkbox"
                          checked={form.lengths[opt.key].checked}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              lengths: {
                                ...form.lengths,
                                [opt.key]: {
                                  ...form.lengths[opt.key],
                                  checked: e.target.checked,
                                },
                              },
                            })
                          }
                          className="h-4 w-4 rounded border-zinc-700 bg-black accent-pink-500"
                        />
                        {opt.label}
                      </label>
                      <input
                        type="number"
                        value={form.lengths[opt.key].qty}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            lengths: {
                              ...form.lengths,
                              [opt.key]: {
                                ...form.lengths[opt.key],
                                qty: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="Qty"
                        disabled={!form.lengths[opt.key].checked}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-pink-500 backdrop-blur-sm disabled:opacity-40"
                      />
                    </div>
                  ))}

                  {form.lengths.custom.checked && (
                    <div className="grid gap-2 sm:grid-cols-2 pt-2">
                      <input
                        type="number"
                        step="0.01"
                        value={form.customLengthValue}
                        onChange={(e) =>
                          setForm({ ...form, customLengthValue: e.target.value })
                        }
                        placeholder="Custom length (m)"
                        className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-sm text-zinc-100 outline-none focus:border-pink-500 backdrop-blur-sm"
                      />
                      <div className="text-xs text-zinc-500 self-center">
                        Custom length value (qty entered above)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Weights */}
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    In (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.inWeight}
                    onChange={(e) => setForm({ ...form, inWeight: e.target.value })}
                    required
                    className={glassInput}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Out (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.outWeight}
                    onChange={(e) => setForm({ ...form, outWeight: e.target.value })}
                    required
                    className={glassInput}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Off Cut (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.offCut}
                    onChange={(e) => setForm({ ...form, offCut: e.target.value })}
                    required
                    className={glassInput}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Yield (%)
                </label>
                <input
                  type="text"
                  value={calcYield()}
                  readOnly
                  className="w-full rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm font-bold text-green-400 backdrop-blur-sm"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Calculated as: Out / In × 100
                </p>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Die Status
                </label>
                <input
                  type="text"
                  value={form.dieStatus}
                  onChange={(e) => setForm({ ...form, dieStatus: e.target.value })}
                  required
                  className={glassInput}
                />
              </div>

              <div className="sticky bottom-0 mt-6 -mx-6 -mb-6 border-t border-white/5 bg-zinc-950 px-6 py-4 backdrop-blur-xl">
                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className={glassBtnPrimary}>
                    {editingId ? "Update Entry" : "Add Entry"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingId(null);
                      resetForm();
                    }}
                    className={glassBtnSecondary}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-2xl">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-pink-500/20">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-400">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                </svg>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-white">Are you sure?</h3>
              <p className="text-sm text-zinc-400">
                This will finalize all recent submissions for processing. This action cannot be undone.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 border-t border-white/10 p-6">
              <button
                onClick={executeFinalSubmit}
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-pink-500/40 disabled:opacity-50 uppercase tracking-wider"
              >
                Yes, Submit Final
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/10 uppercase tracking-wider"
              >
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloudSync && <CloudSync />}

      {showSuccess && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-xl">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center shadow-2xl backdrop-blur-2xl">
            <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-pink-500/20">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-400">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-pink-400">Submission Successful</h2>
            <p className="mt-2 text-sm text-zinc-500">Production data has been recorded.</p>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {showDetailModal && selectedEntry && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDetailModal(false)}
          />
          <div className={`relative w-full max-w-3xl overflow-hidden ${glassCard}`}>
            <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-4 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Entry Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="rounded-md p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:col-span-2">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Profile No</p>
                  <p className="mt-1 text-lg font-bold text-pink-400">
                    {selectedEntry.profile_no || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Profile</p>
                  <p className="mt-1 text-lg text-zinc-200">{selectedEntry.profile}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Date / Shift</p>
                  <p className="mt-1 text-lg text-zinc-200">
                    {selectedEntry.ext_date} / {selectedEntry.shift}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Batch No</p>
                  <p className="mt-1 text-lg text-zinc-200">{selectedEntry.batch_no}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Die Status</p>
                  <p className="mt-1 text-lg text-zinc-200">{selectedEntry.die_status}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">In Weight (kg)</p>
                  <p className="mt-1 text-lg text-zinc-200">{selectedEntry.in_weight}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Out Weight (kg)</p>
                  <p className="mt-1 text-lg text-zinc-200">{selectedEntry.out_weight}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Off Cut (kg)</p>
                  <p className="mt-1 text-lg text-zinc-200">{selectedEntry.off_cut}</p>
                </div>
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 backdrop-blur-sm sm:col-span-2">
                  <p className="text-xs uppercase tracking-wider text-green-400">Yield (%)</p>
                  <p className="mt-1 text-2xl font-bold text-green-400">
                    {selectedEntry.yield_percent}%
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:col-span-2">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Lengths & Quantities
                  </p>
                  <div className="mt-2 space-y-1">
                    {selectedEntry.length_365 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">3.65m</span>
                        <span className="text-pink-400 font-semibold">
                          {selectedEntry.length_365} pcs
                        </span>
                      </div>
                    )}
                    {selectedEntry.length_61 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">6.1m</span>
                        <span className="text-pink-400 font-semibold">
                          {selectedEntry.length_61} pcs
                        </span>
                      </div>
                    )}
                    {selectedEntry.length_65 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">6.5m</span>
                        <span className="text-pink-400 font-semibold">
                          {selectedEntry.length_65} pcs
                        </span>
                      </div>
                    )}
                    {selectedEntry.custom_length_value && (
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">
                          Custom: {selectedEntry.custom_length_value}m
                        </span>
                        <span className="text-pink-400 font-semibold">
                          {selectedEntry.custom_length_qty} pcs
                        </span>
                      </div>
                    )}
                    {!selectedEntry.length_365 &&
                      !selectedEntry.length_61 &&
                      !selectedEntry.length_65 &&
                      !selectedEntry.custom_length_value && (
                        <div className="text-sm text-zinc-500">No lengths recorded</div>
                      )}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:col-span-2">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Created At</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {selectedEntry.created_at
                      ? new Date(selectedEntry.created_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {!selectedEntry.submitted && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      editEntry(selectedEntry);
                    }}
                    className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-pink-500/40"
                  >
                    Edit This Entry
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-300 backdrop-blur-sm transition hover:border-pink-400 hover:bg-white/10 hover:text-pink-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
