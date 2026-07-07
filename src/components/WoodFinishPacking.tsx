"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SlideMenu } from "@/components/SlideMenu";
import { MenuButton } from "@/components/MenuButton";
import { useAuth } from "@/context/AuthContext";
import { menuStructure } from "@/lib/menu";
import { supabase } from "@/lib/supabase";
import { CloudSync } from "@/components/CloudSync";

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

export default function WoodFinishPacking() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showCloudSync, setShowCloudSync] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileSearch, setProfileSearch] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [pendingRecords, setPendingRecords] = useState<any[]>([]);
  const [recentData, setRecentData] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingRecentId, setEditingRecentId] = useState<number | null>(null);
  const [pcsDetailsEnabled, setPcsDetailsEnabled] = useState(false);

  const [form, setForm] = useState({
    woodProdDate: "",
    packingDate: "",
    woodFinishType: "",
    length: "",
    profile: "",
    mainPackNo: "",
    mainOneQty: "",
    mainTotalBundle: "",
    mainAvgWeight: "",
    pcsPackNo: "",
    pcsOneQty: "",
    pcsTotalQty: "",
    pcsAvgWeight: "",
  });

  useEffect(() => {
    loadRecentData();
    loadPendingFromDB();
  }, []);

  const loadPendingFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from("wood_finish_packing")
        .select("*")
        .eq("submitted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingRecords(data || []);
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
        .from("wood_finish_packing")
        .select("*")
        .eq("submitted", true)
        .gte("packing_date", threeDaysAgoStr)
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

  const calcMainTotal = () => {
    const one = parseInt(form.mainOneQty) || 0;
    const bundles = parseInt(form.mainTotalBundle) || 0;
    return (one * bundles).toString();
  };

  const buildRecord = () => ({
    wood_prod_date: form.woodProdDate,
    packing_date: form.packingDate,
    wood_finish_type: form.woodFinishType,
    length: form.length,
    profile: form.profile,
    main_pack_no: form.mainPackNo,
    main_one_qty: form.mainOneQty,
    main_total_bundle: form.mainTotalBundle,
    main_total_qty: calcMainTotal(),
    main_avg_weight: form.mainAvgWeight,
    pcs_enabled: pcsDetailsEnabled,
    pcs_pack_no: pcsDetailsEnabled ? form.pcsPackNo : null,
    pcs_one_qty: pcsDetailsEnabled ? form.pcsOneQty : null,
    pcs_total_qty: pcsDetailsEnabled ? form.pcsTotalQty : null,
    pcs_avg_weight: pcsDetailsEnabled ? form.pcsAvgWeight : null,
    operator: user ?? undefined,
  });

  const openModal = () => {
    const today = new Date().toISOString().slice(0, 10);
    setForm({ ...form, woodProdDate: today, packingDate: today });
    setProfileSearch("");
    setEditingIndex(null);
    setEditingRecentId(null);
    setPcsDetailsEnabled(false);
    setShowModal(true);
  };

  const editPendingRecord = (index: number) => {
    const record = pendingRecords[index];
    setForm({
      woodProdDate: record.wood_prod_date || "",
      packingDate: record.packing_date || "",
      woodFinishType: record.wood_finish_type,
      length: record.length,
      profile: record.profile,
      mainPackNo: record.main_pack_no || "",
      mainOneQty: record.main_one_qty || "",
      mainTotalBundle: record.main_total_bundle || "",
      mainAvgWeight: record.main_avg_weight || "",
      pcsPackNo: record.pcs_pack_no || "",
      pcsOneQty: record.pcs_one_qty || "",
      pcsTotalQty: record.pcs_total_qty || "",
      pcsAvgWeight: record.pcs_avg_weight || "",
    });
    setPcsDetailsEnabled(record.pcs_enabled);
    setEditingIndex(index);
    setEditingRecentId(null);
    setProfileSearch(record.profile);
    setShowModal(true);
  };

  const editRecentRecord = (record: any) => {
    setForm({
      woodProdDate: record.wood_prod_date || "",
      packingDate: record.packing_date || "",
      woodFinishType: record.wood_finish_type,
      length: record.length,
      profile: record.profile,
      mainPackNo: record.main_pack_no || "",
      mainOneQty: record.main_one_qty || "",
      mainTotalBundle: record.main_total_bundle || "",
      mainAvgWeight: record.main_avg_weight || "",
      pcsPackNo: record.pcs_pack_no || "",
      pcsOneQty: record.pcs_one_qty || "",
      pcsTotalQty: record.pcs_total_qty || "",
      pcsAvgWeight: record.pcs_avg_weight || "",
    });
    setPcsDetailsEnabled(record.pcs_enabled);
    setEditingIndex(null);
    setEditingRecentId(record.id || null);
    setProfileSearch(record.profile);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setEditingRecentId(null);
    setPcsDetailsEnabled(false);
  };

  const handleAddToPending = async (e: React.FormEvent) => {
    e.preventDefault();
    const record = { ...buildRecord(), submitted: false };

    setLoading(true);
    try {
      if (editingIndex !== null && pendingRecords[editingIndex]?.id) {
        const { error } = await supabase
          .from("wood_finish_packing")
          .update(record)
          .eq("id", pendingRecords[editingIndex].id);

        if (error) throw error;
        setEditingIndex(null);
      } else {
        const { data, error } = await supabase
          .from("wood_finish_packing")
          .insert([record])
          .select()
          .single();

        if (error) throw error;
        setPendingRecords([...pendingRecords, data]);
      }
      closeModal();
      loadPendingFromDB();
    } catch (err: any) {
      console.error("Error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (pendingRecords.length === 0) {
      alert("No pending records to submit.");
      return;
    }

    setShowCloudSync(true);
    setLoading(true);

    try {
      const ids = pendingRecords.filter((r) => r.id).map((r) => r.id);
      if (ids.length > 0) {
        const { error } = await supabase
          .from("wood_finish_packing")
          .update({ submitted: true })
          .in("id", ids);

        if (error) throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 2500));
      setShowCloudSync(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setPendingRecords([]);
        setEditingRecentId(null);
        closeModal();
        loadRecentData();
        loadPendingFromDB();
      }, 2000);
    } catch (err: any) {
      console.error("Error:", err);
      alert(`Error: ${err.message}`);
      setShowCloudSync(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecent = async () => {
    if (editingRecentId === null) return;

    setShowCloudSync(true);
    setLoading(true);

    try {
      const record = buildRecord();
      const { error } = await supabase
        .from("wood_finish_packing")
        .update(record)
        .eq("id", editingRecentId);

      if (error) throw error;

      await new Promise((resolve) => setTimeout(resolve, 2500));
      setShowCloudSync(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setEditingRecentId(null);
        closeModal();
        loadRecentData();
      }, 2000);
    } catch (err: any) {
      console.error("Error:", err);
      alert(`Error: ${err.message}`);
      setShowCloudSync(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePending = async (index: number) => {
    const record = pendingRecords[index];
    if (record?.id) {
      try {
        const { error } = await supabase
          .from("wood_finish_packing")
          .delete()
          .eq("id", record.id);

        if (error) throw error;
      } catch (err: any) {
        alert(`Error: ${err.message}`);
        return;
      }
    }
    setPendingRecords(pendingRecords.filter((_, i) => i !== index));
  };

  const glassCard = "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl";
  const glassInput = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-orange-500 backdrop-blur-sm transition-colors";
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
          <Link href="/home/powder-coat/packing" className="hover:text-zinc-300">Packing</Link>
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
                Wood Finish Packing
              </div>
              <h1 className="mt-3 text-3xl font-bold text-white">Wood Finish Packing</h1>
              <p className="text-sm text-zinc-400">Record wood finish packing data</p>
            </div>
            <button onClick={openModal} className={glassBtnPrimary}>
              + Add Wood Finish Packing
            </button>
          </div>
        </div>

        {/* Pending Records */}
        {pendingRecords.length > 0 && (
          <div className={`mt-6 overflow-hidden ${glassCard}`}>
            <div className="border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-amber-500/10 px-6 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Pending Records</h2>
              <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-400">
                {pendingRecords.length} record(s)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                    <th className="px-3 py-3">Profile</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Length</th>
                    <th className="px-3 py-3">Pack Date</th>
                    <th className="px-3 py-3">Main Pack</th>
                    <th className="px-3 py-3">Main Qty</th>
                    <th className="px-3 py-3">Pcs</th>
                    <th className="px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRecords.map((record, index) => (
                    <tr key={record.id} className="border-b border-white/5 transition hover:bg-white/5">
                      <td className="px-3 py-3 font-bold text-orange-400">{record.profile}</td>
                      <td className="px-3 py-3 text-zinc-300">{record.wood_finish_type}</td>
                      <td className="px-3 py-3 text-zinc-300">{record.length}m</td>
                      <td className="px-3 py-3 text-zinc-300">{record.packing_date}</td>
                      <td className="px-3 py-3 text-zinc-300">{record.main_pack_no || "—"}</td>
                      <td className="px-3 py-3 text-zinc-300">{record.main_total_qty || "—"}</td>
                      <td className="px-3 py-3">{record.pcs_enabled ? <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">Yes</span> : <span className="text-zinc-600">—</span>}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => editPendingRecord(index)} className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-blue-400 transition hover:border-blue-500 hover:text-blue-300">
                            Edit
                          </button>
                          <button onClick={() => handleDeletePending(index)} className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-red-400 transition hover:border-red-500 hover:text-red-300">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-white/10 bg-gradient-to-r from-orange-500/10 to-amber-500/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-orange-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
                </svg>
                <span>{pendingRecords.length} record(s) ready to submit</span>
              </div>
              <button onClick={handleFinalSubmit} disabled={loading} className={`${glassBtnPrimary} flex items-center gap-2`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
                </svg>
                {loading ? "Submitting..." : "Final Submit"}
              </button>
            </div>
          </div>
        )}

        {/* Recent Data Table */}
        <div className={`mt-6 overflow-hidden ${glassCard}`}>
          <div className="border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-amber-500/10 px-6 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Submitted Records</h2>
            <button onClick={loadRecentData} className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm transition hover:border-orange-400 hover:text-orange-300">
              ↻ Refresh
            </button>
          </div>
          {recentData.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No submitted records found in the last 3 days.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                    <th className="px-3 py-3">Profile</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Length</th>
                    <th className="px-3 py-3">Pack Date</th>
                    <th className="px-3 py-3">Main Pack</th>
                    <th className="px-3 py-3">Main Qty</th>
                    <th className="px-3 py-3">Pcs</th>
                    <th className="px-3 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentData.map((row) => (
                    <tr key={row.id} className="border-b border-white/5 transition hover:bg-white/5">
                      <td className="px-3 py-3 font-bold text-orange-400">{row.profile}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.wood_finish_type}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.length}m</td>
                      <td className="px-3 py-3 text-zinc-300">{row.packing_date}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.main_pack_no || "—"}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.main_total_qty || "—"}</td>
                      <td className="px-3 py-3">{row.pcs_enabled ? <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">Yes</span> : <span className="text-zinc-600">—</span>}</td>
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

      {/* Add Wood Finish Packing Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className={`w-full max-w-2xl overflow-hidden my-8 ${glassCard}`}>
                <div className="sticky top-0 z-10 border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-amber-500/10 px-6 py-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v8M8 12h8" />
                      </svg>
                      {editingRecentId ? "Edit Wood Finish Packing" : "Add Wood Finish Packing"}
                    </h3>
                    <button onClick={closeModal} className="text-zinc-500 transition hover:text-white p-1">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <form className="max-h-[80vh] overflow-y-auto p-6 space-y-4">
                  {/* Date Fields */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Wood Finish Production Date</label>
                      <input type="date" value={form.woodProdDate} onChange={(e) => setForm({ ...form, woodProdDate: e.target.value })} required className={glassInput} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Packing Date</label>
                      <input type="date" value={form.packingDate} onChange={(e) => setForm({ ...form, packingDate: e.target.value })} required className={glassInput} />
                    </div>
                  </div>

                  {/* Type & Length */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Wood Finish Type</label>
                      <select value={form.woodFinishType} onChange={(e) => setForm({ ...form, woodFinishType: e.target.value })} required className={glassInput}>
                        <option value="" disabled>Select Type</option>
                        <option value="Wallnut">Wallnut</option>
                        <option value="Teek">Teek</option>
                        <option value="Jatoba">Jatoba</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Length</label>
                      <input type="number" step="0.01" value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} placeholder="0.00" required className={glassInput} />
                    </div>
                  </div>

                  {/* Profile Search */}
                  <div className="relative">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Profile</label>
                    <input
                      type="text"
                      value={profileSearch || form.profile}
                      onChange={(e) => { setProfileSearch(e.target.value); setShowProfileDropdown(true); setForm({ ...form, profile: e.target.value }); }}
                      onFocus={() => setShowProfileDropdown(true)}
                      placeholder="Search profile..."
                      className={glassInput}
                      required
                      autoComplete="off"
                    />
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

                  {/* Packing Details */}
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">Packing Details</label>

                    {/* Main Packing */}
                    <div className="mb-2 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Main Packing</p>
                      <div>
                        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Packing Number</label>
                        <input type="text" value={form.mainPackNo} onChange={(e) => setForm({ ...form, mainPackNo: e.target.value.replace(/[^0-9-]/g, '') })} className={`${glassInput} py-2`} required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">One Bundle Qty</label>
                          <input type="number" value={form.mainOneQty} onChange={(e) => setForm({ ...form, mainOneQty: e.target.value })} className={`${glassInput} py-2`} required />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Total Bundle</label>
                          <input type="number" value={form.mainTotalBundle} onChange={(e) => setForm({ ...form, mainTotalBundle: e.target.value })} className={`${glassInput} py-2`} required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Total Qty</label>
                          <input type="number" value={calcMainTotal()} readOnly className={`${glassInput} bg-black/40 py-2`} />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Bundle Average Weight</label>
                          <input type="number" step="0.001" value={form.mainAvgWeight} onChange={(e) => setForm({ ...form, mainAvgWeight: e.target.value })} className={`${glassInput} py-2`} required />
                        </div>
                      </div>
                    </div>

                    {/* Pcs Details Checkbox */}
                    <div className="space-y-3">
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:border-purple-500/30">
                        <input type="checkbox" checked={pcsDetailsEnabled} onChange={(e) => setPcsDetailsEnabled(e.target.checked)} className="h-5 w-5 rounded border-white/10 bg-white/5 accent-purple-500" />
                        <span className="text-sm font-bold uppercase tracking-tight text-zinc-400">Pcs Details</span>
                      </label>
                      {pcsDetailsEnabled && (
                        <div className="space-y-3 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">Pieces Breakdown</p>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Packing Number</label>
                            <input type="text" value={form.pcsPackNo} onChange={(e) => setForm({ ...form, pcsPackNo: e.target.value.replace(/[^0-9-]/g, '') })} className={`${glassInput} py-2`} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">One Bundle Qty</label>
                              <input type="text" value={form.pcsOneQty} onChange={(e) => setForm({ ...form, pcsOneQty: e.target.value })} className={`${glassInput} py-2`} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Total Qty</label>
                              <input type="text" value={form.pcsTotalQty} onChange={(e) => setForm({ ...form, pcsTotalQty: e.target.value })} className={`${glassInput} py-2`} />
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Bundle Average Weight</label>
                            <input type="number" step="0.001" value={form.pcsAvgWeight} onChange={(e) => setForm({ ...form, pcsAvgWeight: e.target.value })} className={`${glassInput} py-2`} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-3">
                    <button type="button" onClick={closeModal} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold uppercase text-zinc-300 backdrop-blur-sm transition hover:border-orange-400 hover:text-orange-300">
                      Cancel
                    </button>
                    {editingRecentId === null ? (
                      <button type="button" onClick={handleAddToPending} disabled={loading} className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 text-sm font-black uppercase text-black shadow-lg shadow-orange-500/20 transition hover:shadow-orange-500/40 disabled:opacity-50">
                        {editingIndex !== null ? "Update Pending" : loading ? "Saving..." : "Add to Pending"}
                      </button>
                    ) : (
                      <button type="button" onClick={handleUpdateRecent} disabled={loading} className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 text-sm font-black uppercase text-black shadow-lg shadow-orange-500/20 transition hover:shadow-orange-500/40 disabled:opacity-50">
                        {loading ? "Updating..." : "Update Record"}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {showCloudSync && <CloudSync />}

      {showSuccess && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 backdrop-blur-xl">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center shadow-2xl backdrop-blur-2xl">
            <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-orange-500/20">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-orange-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Wood Finish Packing Saved</h2>
            <p className="mt-2 text-sm text-zinc-400">Data synced to database successfully</p>
          </div>
        </div>
      )}
    </div>
  );
}
