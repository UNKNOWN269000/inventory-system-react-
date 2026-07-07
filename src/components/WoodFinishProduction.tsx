"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SlideMenu } from "@/components/SlideMenu";
import { MenuButton } from "@/components/MenuButton";
import { useAuth } from "@/context/AuthContext";
import { menuStructure } from "@/lib/menu";
import { supabase } from "@/lib/supabase";
import { CloudSync } from "@/components/CloudSync";
import { Dropdown } from "@/components/Dropdown";

type WoodEntry = {
  id?: number;
  base_colour_date: string;
  wood_finish_date: string;
  profile: string;
  surface: string;
  length: string;
  quantity: string;
  is_damage: boolean;
  damage_quantity: string;
  operator?: string;
  submitted?: boolean;
  created_at?: string;
};

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
  "80 SW 14"
];

export default function WoodFinishProduction() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showCloudSync, setShowCloudSync] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileSearch, setProfileSearch] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isDamage, setIsDamage] = useState(false);
  const [pendingRecords, setPendingRecords] = useState<WoodEntry[]>([]);
  const [recentData, setRecentData] = useState<WoodEntry[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingRecentId, setEditingRecentId] = useState<number | null>(null);

  const [form, setForm] = useState({
    baseColourDate: "",
    woodFinishDate: "",
    profile: "",
    surface: "",
    length: "",
    quantity: "",
    damageQuantity: "",
  });

  useEffect(() => {
    loadRecentData();
    loadPendingFromLocalStorage();
  }, []);

  // Save pending to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("pendingWoodRecords", JSON.stringify(pendingRecords));
  }, [pendingRecords]);

  const loadPendingFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem("pendingWoodRecords");
      if (stored) {
        setPendingRecords(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error loading pending records:", err);
    }
  };

  const loadRecentData = async () => {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgo.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("wood_finish_production")
        .select("*")
        .gte("wood_finish_date", threeDaysAgoStr)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecentData(data || []);
    } catch (err) {
      console.error("Error loading recent data:", err);
    }
  };

  const filteredProfiles = PROFILES.filter((p) =>
    p.toLowerCase().includes(profileSearch.toLowerCase())
  );

  const openModal = () => {
    const today = new Date().toISOString().slice(0, 10);
    setForm({ ...form, baseColourDate: today, woodFinishDate: today });
    setProfileSearch("");
    setIsDamage(false);
    setEditingIndex(null);
    setEditingRecentId(null);
    setShowModal(true);
  };

  const editPendingRecord = (index: number) => {
    const record = pendingRecords[index];
    setForm({
      baseColourDate: record.base_colour_date || "",
      woodFinishDate: record.wood_finish_date || "",
      profile: record.profile,
      surface: record.surface,
      length: record.length,
      quantity: record.quantity,
      damageQuantity: record.damage_quantity || "",
    });
    setIsDamage(record.is_damage);
    setEditingIndex(index);
    setEditingRecentId(null);
    setProfileSearch(record.profile);
    setShowModal(true);
  };

  const editRecentRecord = (record: WoodEntry) => {
    setForm({
      baseColourDate: record.base_colour_date || "",
      woodFinishDate: record.wood_finish_date || "",
      profile: record.profile,
      surface: record.surface,
      length: record.length,
      quantity: record.quantity,
      damageQuantity: record.damage_quantity || "",
    });
    setIsDamage(record.is_damage);
    setEditingIndex(null);
    setEditingRecentId(record.id || null);
    setProfileSearch(record.profile);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setEditingRecentId(null);
  };

  const deletePendingRecord = (index: number) => {
    setPendingRecords(pendingRecords.filter((_, i) => i !== index));
  };

  // Check if a record is duplicate (same profile, surface, length, date)
  const isDuplicate = (newRecord: WoodEntry): boolean => {
    // Check against pending records
    const pendingDup = pendingRecords.some(
      (r) =>
        r.profile === newRecord.profile &&
        r.surface === newRecord.surface &&
        r.length === newRecord.length &&
        r.wood_finish_date === newRecord.wood_finish_date
    );

    // Check against already submitted records in recent data
    const recentDup = recentData.some(
      (r) =>
        r.profile === newRecord.profile &&
        r.surface === newRecord.surface &&
        r.length === newRecord.length &&
        r.wood_finish_date === newRecord.wood_finish_date &&
        r.submitted === true
    );

    return pendingDup || recentDup;
  };

  // ADD TO PENDING - Saves to DB with submitted=false
  const handleAddToPending = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDamage && !form.damageQuantity) {
      alert("Please enter damage quantity");
      return;
    }

    setLoading(true);
    try {
      if (editingIndex !== null) {
        // Update existing pending record
        const record = pendingRecords[editingIndex];
        if (record.id) {
          const updateData = {
            base_colour_date: form.baseColourDate,
            wood_finish_date: form.woodFinishDate,
            profile: form.profile,
            surface: form.surface,
            length: form.length,
            quantity: form.quantity,
            is_damage: isDamage,
            damage_quantity: isDamage ? form.damageQuantity : "",
            submitted: false,
          };

          const { error } = await supabase
            .from("wood_finish_production")
            .update(updateData)
            .eq("id", record.id);

          if (error) throw error;

          // Update local state
          const updated = [...pendingRecords];
          updated[editingIndex] = { ...record, ...updateData };
          setPendingRecords(updated);
        }
        setEditingIndex(null);
      } else if (editingRecentId !== null) {
        // Edit a previously submitted record - keep submitted=true
        const updateData = {
          base_colour_date: form.baseColourDate,
          wood_finish_date: form.woodFinishDate,
          profile: form.profile,
          surface: form.surface,
          length: form.length,
          quantity: form.quantity,
          is_damage: isDamage,
          damage_quantity: isDamage ? form.damageQuantity : "",
          submitted: true,
        };

        const { error } = await supabase
          .from("wood_finish_production")
          .update(updateData)
          .eq("id", editingRecentId);

        if (error) throw error;

        await loadRecentData();
        setEditingRecentId(null);
      } else {
        // New record - check for duplicate first
        const newRecord: WoodEntry = {
          base_colour_date: form.baseColourDate,
          wood_finish_date: form.woodFinishDate,
          profile: form.profile,
          surface: form.surface,
          length: form.length,
          quantity: form.quantity,
          is_damage: isDamage,
          damage_quantity: isDamage ? form.damageQuantity : "",
          operator: user ?? undefined,
          submitted: false,
        };

        if (isDuplicate(newRecord)) {
          alert("This record already exists (same profile, surface, length, and date)!");
          setLoading(false);
          return;
        }

        // Save to DB with submitted=false
        const { data, error } = await supabase
          .from("wood_finish_production")
          .insert([newRecord])
          .select();

        if (error) throw error;

        if (data && data[0]) {
          setPendingRecords([...pendingRecords, data[0]]);
        }
      }
      closeModal();
    } catch (err: any) {
      console.error("Error saving to pending:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // FINAL SUBMIT - Updates existing pending records to submitted=true (no duplicate insert)
  const handleFinalSubmit = async () => {
    if (pendingRecords.length === 0) {
      alert("No pending records to submit");
      return;
    }

    setShowCloudSync(true);
    setLoading(true);

    try {
      // Update each pending record to submitted=true
      const updatePromises = pendingRecords
        .filter((record) => record.id && record.submitted === false)
        .map((record) =>
          supabase
            .from("wood_finish_production")
            .update({ submitted: true })
            .eq("id", record.id)
        );

      const results = await Promise.all(updatePromises);
      
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} record(s)`);
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
      setShowCloudSync(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setPendingRecords([]);
        localStorage.removeItem("pendingWoodRecords");
        closeModal();
        loadRecentData();
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting:", err);
      alert(`Error: ${err.message}`);
      setShowCloudSync(false);
    } finally {
      setLoading(false);
    }
  };

  const glassCard = "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl";
  const glassInput = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-orange-500 backdrop-blur-sm transition-colors";
  const glassBtnPrimary = "rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-bold text-black shadow-lg shadow-orange-500/20 transition hover:shadow-orange-500/40 disabled:opacity-50";

  return (
    <div className="min-h-screen text-zinc-100">
      <SlideMenu nodes={menuStructure} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <MenuButton onClick={() => setMenuOpen(true)} />
            <Link href="/home" className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 font-bold text-black shadow-lg shadow-orange-500/20">U</div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-white">Ultra Aluminum</p>
                <p className="text-xs text-zinc-500">Pvt Ltd</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user && <span className="text-xs text-zinc-500">User: {user}</span>}
            <button onClick={logout} className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-orange-400 hover:text-orange-300">Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-zinc-500">
          <Link href="/home" className="hover:text-zinc-300">Home</Link>
          <span className="text-zinc-700">/</span>
          <Link href="/home/powder-coat" className="hover:text-zinc-300">Powder Coat</Link>
          <span className="text-zinc-700">/</span>
          <Link href="/home/powder-coat/production" className="hover:text-zinc-300">Production</Link>
          <span className="text-zinc-700">/</span>
          <span className="text-orange-300">Wood Finish</span>
        </nav>

        {/* Header */}
        <div className={`mt-4 overflow-hidden p-8 ${glassCard}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
                Wood Finish Production
              </div>
              <h1 className="mt-3 text-3xl font-bold text-white">Wood Finish Production</h1>
              <p className="text-sm text-zinc-400">Sublimation and wood-effect powder line</p>
            </div>
            <button onClick={openModal} className={glassBtnPrimary}>
              + Add Production
            </button>
          </div>
        </div>

        {/* Pending Records */}
        {pendingRecords.length > 0 && (
          <div className={`mt-6 overflow-hidden ${glassCard}`}>
            <div className="border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-amber-500/10 px-6 py-3 flex items-center justify-between">
              <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Pending Records
                <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">
                  {pendingRecords.length}
                </span>
              </h2>
              <button
                onClick={handleFinalSubmit}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-black text-black shadow-lg shadow-orange-500/20 transition hover:shadow-orange-500/40 disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
                </svg>
                Final Submit ({pendingRecords.length})
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                    <th className="px-3 py-3">Profile</th>
                    <th className="px-3 py-3">Surface</th>
                    <th className="px-3 py-3">Base Colour Date</th>
                    <th className="px-3 py-3">Wood Finish Date</th>
                    <th className="px-3 py-3">Length</th>
                    <th className="px-3 py-3">Qty</th>
                    <th className="px-3 py-3">Damage</th>
                    <th className="px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRecords.map((record, index) => (
                    <tr key={record.id || index} className="border-b border-white/5 transition hover:bg-white/5">
                      <td className="px-3 py-3 font-bold text-orange-400">{record.profile}</td>
                      <td className="px-3 py-3 text-zinc-300">{record.surface}</td>
                      <td className="px-3 py-3 text-zinc-300">{record.base_colour_date}</td>
                      <td className="px-3 py-3 text-zinc-300">{record.wood_finish_date}</td>
                      <td className="px-3 py-3 text-zinc-300">{record.length}m</td>
                      <td className="px-3 py-3 text-zinc-300">{record.quantity}</td>
                      <td className="px-3 py-3">
                        {record.is_damage ? (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">{record.damage_quantity}</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => editPendingRecord(index)} className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-blue-400 transition hover:border-blue-500 hover:text-blue-300">
                            Edit
                          </button>
                          <button onClick={() => deletePendingRecord(index)} className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-red-400 transition hover:border-red-500 hover:text-red-300">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Data Table */}
        <div className={`mt-6 overflow-hidden ${glassCard}`}>
          <div className="border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-amber-500/10 px-6 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Production Records</h2>
            <button onClick={loadRecentData} className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm transition hover:border-orange-400 hover:text-orange-300">
              ↻ Refresh
            </button>
          </div>
          {recentData.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No production records found in the last 3 days.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                    <th className="px-3 py-3">Profile</th>
                    <th className="px-3 py-3">Surface</th>
                    <th className="px-3 py-3">Base Colour Date</th>
                    <th className="px-3 py-3">Wood Finish Date</th>
                    <th className="px-3 py-3">Length</th>
                    <th className="px-3 py-3">Qty</th>
                    <th className="px-3 py-3">Damage</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentData.map((row) => (
                    <tr key={row.id} className="border-b border-white/5 transition hover:bg-white/5">
                      <td className="px-3 py-3 font-bold text-orange-400">{row.profile}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.surface}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.base_colour_date}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.wood_finish_date}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.length}m</td>
                      <td className="px-3 py-3 text-zinc-300">{row.quantity}</td>
                      <td className="px-3 py-3">
                        {row.is_damage ? (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">{row.damage_quantity}</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {row.submitted ? (
                          <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-300">Submitted</span>
                        ) : (
                          <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-300">Pending</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button onClick={() => editRecentRecord(row)} className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-blue-400 transition hover:border-blue-500 hover:text-blue-300">
                          Edit
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

      {/* Add Production Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className={`w-full max-w-2xl overflow-hidden my-8 ${glassCard}`}>
                <div className="border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-amber-500/10 px-6 py-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v8M8 12h8" />
                      </svg>
                      {editingRecentId ? "Edit Production" : editingIndex !== null ? "Edit Pending" : "Add Production"}
                    </h3>
                    <button onClick={closeModal} className="text-zinc-500 transition hover:text-white p-1">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <form onSubmit={handleAddToPending} className="max-h-[80vh] overflow-y-auto p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Base Colour Production Date</label>
                      <input type="date" value={form.baseColourDate} onChange={(e) => setForm({ ...form, baseColourDate: e.target.value })} required className={glassInput} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Wood Finish Date</label>
                      <input type="date" value={form.woodFinishDate} onChange={(e) => setForm({ ...form, woodFinishDate: e.target.value })} required className={glassInput} />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Profile</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileSearch || form.profile}
                        onChange={(e) => { setProfileSearch(e.target.value); setShowProfileDropdown(true); setForm({ ...form, profile: e.target.value }); }}
                        onFocus={() => setShowProfileDropdown(true)}
                        placeholder="Search profile..."
                        className={`${glassInput} pl-10`}
                        required
                        autoComplete="off"
                      />
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                      </svg>
                      {showProfileDropdown && (
                        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl">
                          {filteredProfiles.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-zinc-500">No matches</div>
                          ) : (
                            filteredProfiles.map((p) => (
                              <div
                                key={p}
                                onClick={() => { setForm({ ...form, profile: p }); setProfileSearch(""); setShowProfileDropdown(false); }}
                                className="cursor-pointer border-b border-zinc-900 px-3 py-2 text-sm text-zinc-300 hover:bg-orange-500/20 hover:text-orange-300"
                              >
                                {p}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Surface</label>
                    <select value={form.surface} onChange={(e) => setForm({ ...form, surface: e.target.value })} required className={glassInput}>
                      <option value="" disabled>Select Type</option>
                      <option value="Teek">Teek</option>
                      <option value="Walnut">Walnut</option>
                      <option value="Jatoba">Jatoba</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Length</label>
                      <input type="number" step="0.01" value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} placeholder="0.00" required className={glassInput} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Quantity</label>
                      <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" required className={glassInput} />
                    </div>
                  </div>

                  <div>
                    <label className="flex cursor-pointer items-center gap-3 group">
                      <input type="checkbox" checked={isDamage} onChange={(e) => setIsDamage(e.target.checked)} className="h-5 w-5 rounded border-white/10 bg-white/5 accent-orange-500" />
                      <span className="text-sm font-bold text-zinc-400 transition-colors group-hover:text-orange-400">Mark as Damage</span>
                    </label>
                  </div>

                  {isDamage && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Damage Quantity</label>
                      <input
                        type="number"
                        value={form.damageQuantity}
                        onChange={(e) => setForm({ ...form, damageQuantity: e.target.value })}
                        placeholder="Enter damage quantity"
                        className="w-full rounded-lg border border-red-500/30 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-red-500 backdrop-blur-sm transition-colors shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                        required={isDamage}
                      />
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <button type="button" onClick={closeModal} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-zinc-300 backdrop-blur-sm transition hover:border-orange-400 hover:text-orange-300">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 text-sm font-black text-black shadow-lg shadow-orange-500/20 transition hover:shadow-orange-500/40 disabled:opacity-50">
                      {loading ? "Saving..." : editingIndex !== null ? "Update Pending" : "Add to Pending"}
                    </button>
                  </div>
                </form>
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
            <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-orange-500/20">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-orange-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Production Records Submitted</h2>
            <p className="mt-2 text-sm text-zinc-400">All pending records marked as submitted</p>
          </div>
        </div>
      )}
    </div>
  );
}
