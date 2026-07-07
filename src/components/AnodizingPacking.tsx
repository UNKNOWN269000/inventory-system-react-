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

export default function AnodizingPacking() {
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
  const [premiumEnabled, setPremiumEnabled] = useState(false);
  const [nonBrandEnabled, setNonBrandEnabled] = useState(false);
  const [weightBarEnabled, setWeightBarEnabled] = useState(false);
  const [premiumPcsEnabled, setPremiumPcsEnabled] = useState(false);
  const [nonBrandPcsEnabled, setNonBrandPcsEnabled] = useState(false);

  const [form, setForm] = useState({
    prodDate: "",
    packDate: "",
    length: "",
    prodType: "",
    profile: "",
    surface: "",
    premiumPackNo: "",
    premiumOneQty: "",
    premiumTotalBundle: "",
    premiumAvgWeight: "",
    premiumPcsPackNo: "",
    premiumPcsOneQty: "",
    premiumPcsTotalQty: "",
    premiumPcsAvgWeight: "",
    nonBrandPackNo: "",
    nonBrandOneQty: "",
    nonBrandTotalBundle: "",
    nonBrandAvgWeight: "",
    nonBrandPcsPackNo: "",
    nonBrandPcsOneQty: "",
    nonBrandPcsTotalQty: "",
    nonBrandPcsAvgWeight: "",
    weightBarPackNo: "",
    weightBarBundleQty: "",
    weightBarAvgWeight: "",
  });

  useEffect(() => {
    loadRecentData();
    loadPendingFromDB();
  }, []);

  const loadPendingFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from("anodizing_packing")
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
        .from("anodizing_packing")
        .select("*")
        .eq("submitted", true)
        .gte("pack_date", threeDaysAgoStr)
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

  const calcPremiumTotal = () => {
    const one = parseInt(form.premiumOneQty) || 0;
    const bundles = parseInt(form.premiumTotalBundle) || 0;
    return (one * bundles).toString();
  };

  const calcNonBrandTotal = () => {
    const one = parseInt(form.nonBrandOneQty) || 0;
    const bundles = parseInt(form.nonBrandTotalBundle) || 0;
    return (one * bundles).toString();
  };

  const buildRecord = () => ({
    production_date: form.prodDate,
    packing_date: form.packDate,
    length: form.length,
    production_type: form.prodType,
    profile: form.profile,
    surface: form.surface,
    premium_enabled: premiumEnabled,
    premium_pack_no: premiumEnabled ? form.premiumPackNo : null,
    premium_one_qty: premiumEnabled ? form.premiumOneQty : null,
    premium_total_bundles: premiumEnabled ? form.premiumTotalBundle : null,
    premium_total_qty: premiumEnabled ? calcPremiumTotal() : null,
    premium_avg_weight: premiumEnabled ? form.premiumAvgWeight : null,
    premium_pcs_enabled: premiumEnabled && premiumPcsEnabled,
    premium_pcs_pack_no: premiumPcsEnabled ? form.premiumPcsPackNo : null,
    premium_pcs_one_qty: premiumPcsEnabled ? form.premiumPcsOneQty : null,
    premium_pcs_total_qty: premiumPcsEnabled ? form.premiumPcsTotalQty : null,
    premium_pcs_avg_weight: premiumPcsEnabled ? form.premiumPcsAvgWeight : null,
    nonbrand_enabled: nonBrandEnabled,
    nonbrand_pack_no: nonBrandEnabled ? form.nonBrandPackNo : null,
    nonbrand_one_qty: nonBrandEnabled ? form.nonBrandOneQty : null,
    nonbrand_total_bundles: nonBrandEnabled ? form.nonBrandTotalBundle : null,
    nonbrand_total_qty: nonBrandEnabled ? calcNonBrandTotal() : null,
    nonbrand_avg_weight: nonBrandEnabled ? form.nonBrandAvgWeight : null,
    nonbrand_pcs_enabled: nonBrandEnabled && nonBrandPcsEnabled,
    nonbrand_pcs_pack_no: nonBrandPcsEnabled ? form.nonBrandPcsPackNo : null,
    nonbrand_pcs_one_qty: nonBrandPcsEnabled ? form.nonBrandPcsOneQty : null,
    nonbrand_pcs_total_qty: nonBrandPcsEnabled ? form.nonBrandPcsTotalQty : null,
    nonbrand_pcs_avg_weight: nonBrandPcsEnabled ? form.nonBrandPcsAvgWeight : null,
    weightbar_enabled: weightBarEnabled,
    weightbar_pack_no: weightBarEnabled ? form.weightBarPackNo : null,
    weightbar_bundle_qty: weightBarEnabled ? form.weightBarBundleQty : null,
    weightbar_avg_weight: weightBarEnabled ? form.weightBarAvgWeight : null,
    operator: user ?? undefined,
  });

  const openModal = () => {
    const today = new Date().toISOString().slice(0, 10);
    setForm({ ...form, prodDate: today, packDate: today });
    setProfileSearch("");
    setEditingIndex(null);
    setEditingRecentId(null);
    setPremiumEnabled(false);
    setNonBrandEnabled(false);
    setWeightBarEnabled(false);
    setPremiumPcsEnabled(false);
    setNonBrandPcsEnabled(false);
    setShowModal(true);
  };

  const editPendingRecord = (index: number) => {
    const record = pendingRecords[index];
    setForm({
      prodDate: record.production_date || "",
      packDate: record.packing_date || "",
      length: record.length || "",
      prodType: record.production_type || "",
      profile: record.profile || "",
      surface: record.surface || "",
      premiumPackNo: record.premium_pack_no || "",
      premiumOneQty: record.premium_one_qty || "",
      premiumTotalBundle: record.premium_total_bundles || "",
      premiumAvgWeight: record.premium_avg_weight || "",
      premiumPcsPackNo: record.premium_pcs_pack_no || "",
      premiumPcsOneQty: record.premium_pcs_one_qty || "",
      premiumPcsTotalQty: record.premium_pcs_total_qty || "",
      premiumPcsAvgWeight: record.premium_pcs_avg_weight || "",
      nonBrandPackNo: record.nonbrand_pack_no || "",
      nonBrandOneQty: record.nonbrand_one_qty || "",
      nonBrandTotalBundle: record.nonbrand_total_bundles || "",
      nonBrandAvgWeight: record.nonbrand_avg_weight || "",
      nonBrandPcsPackNo: record.nonbrand_pcs_pack_no || "",
      nonBrandPcsOneQty: record.nonbrand_pcs_one_qty || "",
      nonBrandPcsTotalQty: record.nonbrand_pcs_total_qty || "",
      nonBrandPcsAvgWeight: record.nonbrand_pcs_avg_weight || "",
      weightBarPackNo: record.weightbar_pack_no || "",
      weightBarBundleQty: record.weightbar_bundle_qty || "",
      weightBarAvgWeight: record.weightbar_avg_weight || "",
    });
    setPremiumEnabled(record.premium_enabled);
    setNonBrandEnabled(record.nonbrand_enabled);
    setWeightBarEnabled(record.weightbar_enabled);
    setPremiumPcsEnabled(record.premium_pcs_enabled);
    setNonBrandPcsEnabled(record.nonbrand_pcs_enabled);
    setEditingIndex(index);
    setEditingRecentId(null);
    setProfileSearch(record.profile);
    setShowModal(true);
  };

  const editRecentRecord = (record: any) => {
    setForm({
      prodDate: record.production_date || "",
      packDate: record.packing_date || "",
      length: record.length || "",
      prodType: record.production_type || "",
      profile: record.profile || "",
      surface: record.surface || "",
      premiumPackNo: record.premium_pack_no || "",
      premiumOneQty: record.premium_one_qty || "",
      premiumTotalBundle: record.premium_total_bundles || "",
      premiumAvgWeight: record.premium_avg_weight || "",
      premiumPcsPackNo: record.premium_pcs_pack_no || "",
      premiumPcsOneQty: record.premium_pcs_one_qty || "",
      premiumPcsTotalQty: record.premium_pcs_total_qty || "",
      premiumPcsAvgWeight: record.premium_pcs_avg_weight || "",
      nonBrandPackNo: record.nonbrand_pack_no || "",
      nonBrandOneQty: record.nonbrand_one_qty || "",
      nonBrandTotalBundle: record.nonbrand_total_bundles || "",
      nonBrandAvgWeight: record.nonbrand_avg_weight || "",
      nonBrandPcsPackNo: record.nonbrand_pcs_pack_no || "",
      nonBrandPcsOneQty: record.nonbrand_pcs_one_qty || "",
      nonBrandPcsTotalQty: record.nonbrand_pcs_total_qty || "",
      nonBrandPcsAvgWeight: record.nonbrand_pcs_avg_weight || "",
      weightBarPackNo: record.weightbar_pack_no || "",
      weightBarBundleQty: record.weightbar_bundle_qty || "",
      weightBarAvgWeight: record.weightbar_avg_weight || "",
    });
    setPremiumEnabled(record.premium_enabled);
    setNonBrandEnabled(record.nonbrand_enabled);
    setWeightBarEnabled(record.weightbar_enabled);
    setPremiumPcsEnabled(record.premium_pcs_enabled);
    setNonBrandPcsEnabled(record.nonbrand_pcs_enabled);
    setEditingIndex(null);
    setEditingRecentId(record.id || null);
    setProfileSearch(record.profile);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setEditingRecentId(null);
    setPremiumEnabled(false);
    setNonBrandEnabled(false);
    setWeightBarEnabled(false);
    setPremiumPcsEnabled(false);
    setNonBrandPcsEnabled(false);
  };

  const handleAddToPending = async (e: React.FormEvent) => {
    e.preventDefault();
    const record = { ...buildRecord(), submitted: false };

    setLoading(true);
    try {
      if (editingIndex !== null && pendingRecords[editingIndex]?.id) {
        const { error } = await supabase
          .from("anodizing_packing")
          .update(record)
          .eq("id", pendingRecords[editingIndex].id);

        if (error) throw error;
        setEditingIndex(null);
      } else {
        const { data, error } = await supabase
          .from("anodizing_packing")
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
          .from("anodizing_packing")
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
        .from("anodizing_packing")
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
          .from("anodizing_packing")
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
  const glassInput = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500 backdrop-blur-sm transition-colors";
  const glassBtnPrimary = "rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 disabled:opacity-50";

  return (
    <div className="min-h-screen text-zinc-100">
      <SlideMenu nodes={menuStructure} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <MenuButton onClick={() => setMenuOpen(true)} />
            <Link href="/home" className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 font-bold text-black shadow-lg shadow-emerald-500/20">U</div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-white">Ultra Aluminum</p>
                <p className="text-xs text-zinc-500">Pvt Ltd</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user && <span className="text-xs text-zinc-500">User: {user}</span>}
            <button onClick={logout} className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-emerald-400 hover:text-emerald-300">Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-zinc-500">
          <Link href="/home" className="hover:text-zinc-300">Home</Link>
          <span className="text-zinc-700">/</span>
          <Link href="/home/anodizing" className="hover:text-zinc-300">Anodizing</Link>
          <span className="text-zinc-700">/</span>
          <span className="text-emerald-300">Packing</span>
        </nav>

        {/* Header */}
        <div className={`mt-4 overflow-hidden p-8 ${glassCard}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Packing Module
              </div>
              <h1 className="mt-3 text-3xl font-bold text-white">Anodizing Packing</h1>
              <p className="text-sm text-zinc-400">Record anodizing packing data</p>
            </div>
            <button onClick={openModal} className={glassBtnPrimary}>
              + Add Packing Record
            </button>
          </div>
        </div>

        {/* Pending Records */}
        {pendingRecords.length > 0 && (
          <div className={`mt-6 overflow-hidden ${glassCard}`}>
            <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-6 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Pending Records</h2>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                {pendingRecords.length} record(s)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                    <th className="px-3 py-3">Profile</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Surface</th>
                    <th className="px-3 py-3">Length</th>
                    <th className="px-3 py-3">Pack Date</th>
                    <th className="px-3 py-3">Premium</th>
                    <th className="px-3 py-3">Non-Brand</th>
                    <th className="px-3 py-3">Weight Bar</th>
                    <th className="px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRecords.map((record, index) => (
                    <tr key={record.id} className="border-b border-white/5 transition hover:bg-white/5">
                      <td className="px-3 py-3 font-bold text-emerald-400">{record.profile}</td>
                      <td className="px-3 py-3 text-zinc-300">{record.production_type}</td>
                      <td className="px-3 py-3 text-zinc-300">{record.surface}</td>
                      <td className="px-3 py-3 text-zinc-300">{record.length}m</td>
                      <td className="px-3 py-3 text-zinc-300">{record.packing_date}</td>
                      <td className="px-3 py-3">{record.premium_enabled ? <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">Yes</span> : <span className="text-zinc-600">—</span>}</td>
                      <td className="px-3 py-3">{record.nonbrand_enabled ? <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">Yes</span> : <span className="text-zinc-600">—</span>}</td>
                      <td className="px-3 py-3">{record.weightbar_enabled ? <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">Yes</span> : <span className="text-zinc-600">—</span>}</td>
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
            <div className="border-t border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-emerald-300">
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
          <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-6 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Submitted Records</h2>
            <button onClick={loadRecentData} className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm transition hover:border-emerald-400 hover:text-emerald-300">
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
                    <th className="px-3 py-3">Surface</th>
                    <th className="px-3 py-3">Length</th>
                    <th className="px-3 py-3">Pack Date</th>
                    <th className="px-3 py-3">Premium</th>
                    <th className="px-3 py-3">Non-Brand</th>
                    <th className="px-3 py-3">Weight Bar</th>
                    <th className="px-3 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentData.map((row) => (
                    <tr key={row.id} className="border-b border-white/5 transition hover:bg-white/5">
                      <td className="px-3 py-3 font-bold text-emerald-400">{row.profile}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.production_type}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.surface}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.length}m</td>
                      <td className="px-3 py-3 text-zinc-300">{row.packing_date}</td>
                      <td className="px-3 py-3">{row.premium_enabled ? <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">Yes</span> : <span className="text-zinc-600">—</span>}</td>
                      <td className="px-3 py-3">{row.nonbrand_enabled ? <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">Yes</span> : <span className="text-zinc-600">—</span>}</td>
                      <td className="px-3 py-3">{row.weightbar_enabled ? <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">Yes</span> : <span className="text-zinc-600">—</span>}</td>
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

      {/* Add Packing Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className={`w-full max-w-2xl overflow-hidden my-8 ${glassCard}`}>
                <div className="sticky top-0 z-10 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-6 py-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-emerald-400">New Packing Record</h3>
                    <button onClick={closeModal} className="text-zinc-400 transition hover:text-white p-1">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <form className="max-h-[80vh] overflow-y-auto p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Production Date</label>
                      <input type="date" value={form.prodDate} onChange={(e) => setForm({ ...form, prodDate: e.target.value })} required className={glassInput} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Packing Date</label>
                      <input type="date" value={form.packDate} onChange={(e) => setForm({ ...form, packDate: e.target.value })} required className={glassInput} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Length</label>
                      <input type="number" step="0.01" value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} placeholder="0.00" className={glassInput} required />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Production Type</label>
                      <select value={form.prodType} onChange={(e) => setForm({ ...form, prodType: e.target.value })} required className={glassInput}>
                        <option value="" disabled>Select</option>
                        <option value="ULR">ULR</option>
                        <option value="PRM">PRM</option>
                        <option value="ULR PRM">ULR PRM</option>
                      </select>
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
                                className="cursor-pointer border-b border-zinc-900 px-3 py-2 text-sm text-zinc-300 hover:bg-emerald-500/20 hover:text-emerald-300"
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
                      <option value="" disabled>Select</option>
                      <option value="Natural">Natural</option>
                      <option value="Bronze">Bronze</option>
                      <option value="Mill Finish">Mill Finish</option>
                      <option value="P/C White">P/C White</option>
                    </select>
                  </div>

                  {/* Packing Configuration */}
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-400">Packing Configuration</label>

                    {/* Premium Full Pack */}
                    <div className="mb-3">
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-emerald-500/30">
                        <input type="checkbox" checked={premiumEnabled} onChange={(e) => setPremiumEnabled(e.target.checked)} className="h-5 w-5 rounded border-white/10 bg-white/5 accent-emerald-500" />
                        <span className="text-sm font-bold uppercase text-zinc-400">Premium Full Pack</span>
                      </label>
                      {premiumEnabled && (
                        <div className="mt-2 space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                          <div>
                            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Pack No</label>
                            <input type="text" value={form.premiumPackNo} onChange={(e) => setForm({ ...form, premiumPackNo: e.target.value.replace(/[^0-9-]/g, '') })} className={`${glassInput} py-2`} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">One Bundle Qty</label>
                              <input type="number" value={form.premiumOneQty} onChange={(e) => setForm({ ...form, premiumOneQty: e.target.value })} className={`${glassInput} py-2`} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Total Bundles</label>
                              <input type="number" value={form.premiumTotalBundle} onChange={(e) => setForm({ ...form, premiumTotalBundle: e.target.value })} className={`${glassInput} py-2`} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Total Qty</label>
                              <input type="number" value={calcPremiumTotal()} readOnly className={`${glassInput} bg-black/40 py-2`} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Avg Weight</label>
                              <input type="number" step="0.001" value={form.premiumAvgWeight} onChange={(e) => setForm({ ...form, premiumAvgWeight: e.target.value })} className={`${glassInput} py-2`} />
                            </div>
                          </div>
                          <label className="flex cursor-pointer items-center gap-2 border-t border-emerald-500/10 pt-2">
                            <input type="checkbox" checked={premiumPcsEnabled} onChange={(e) => setPremiumPcsEnabled(e.target.checked)} className="h-4 w-4 rounded border-white/10 bg-white/5 accent-purple-500" />
                            <span className="text-[11px] font-black uppercase text-zinc-500">Premium Pcs Details</span>
                          </label>
                          {premiumPcsEnabled && (
                            <div className="space-y-2 rounded-xl border border-white/5 bg-black/20 p-3">
                              <div>
                                <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-zinc-400">Pcs Pack No</label>
                                <input type="text" value={form.premiumPcsPackNo} onChange={(e) => setForm({ ...form, premiumPcsPackNo: e.target.value.replace(/[^0-9,-]/g, '') })} className={`${glassInput} py-1.5 text-xs`} />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-zinc-400">Bundle Qty</label>
                                  <input type="number" value={form.premiumPcsOneQty} onChange={(e) => setForm({ ...form, premiumPcsOneQty: e.target.value })} className={`${glassInput} py-1.5 text-xs`} />
                                </div>
                                <div>
                                  <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-zinc-400">Total Qty</label>
                                  <input type="number" value={form.premiumPcsTotalQty} onChange={(e) => setForm({ ...form, premiumPcsTotalQty: e.target.value })} className={`${glassInput} py-1.5 text-xs`} />
                                </div>
                                <div>
                                  <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-zinc-400">Avg Weight</label>
                                  <input type="number" step="0.001" value={form.premiumPcsAvgWeight} onChange={(e) => setForm({ ...form, premiumPcsAvgWeight: e.target.value })} className={`${glassInput} py-1.5 text-xs`} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Non Brand Full Pack */}
                    <div className="mb-3">
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-white/30">
                        <input type="checkbox" checked={nonBrandEnabled} onChange={(e) => setNonBrandEnabled(e.target.checked)} className="h-5 w-5 rounded border-white/10 bg-white/5 accent-emerald-500" />
                        <span className="text-sm font-bold uppercase text-zinc-400">Non Brand Full Pack</span>
                      </label>
                      {nonBrandEnabled && (
                        <div className="mt-2 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div>
                            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Pack No</label>
                            <input type="text" value={form.nonBrandPackNo} onChange={(e) => setForm({ ...form, nonBrandPackNo: e.target.value.replace(/[^0-9-]/g, '') })} className={`${glassInput} py-2`} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">One Bundle Qty</label>
                              <input type="number" value={form.nonBrandOneQty} onChange={(e) => setForm({ ...form, nonBrandOneQty: e.target.value })} className={`${glassInput} py-2`} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Total Bundles</label>
                              <input type="number" value={form.nonBrandTotalBundle} onChange={(e) => setForm({ ...form, nonBrandTotalBundle: e.target.value })} className={`${glassInput} py-2`} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Total Qty</label>
                              <input type="number" value={calcNonBrandTotal()} readOnly className={`${glassInput} bg-black/40 py-2`} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Avg Weight</label>
                              <input type="number" step="0.001" value={form.nonBrandAvgWeight} onChange={(e) => setForm({ ...form, nonBrandAvgWeight: e.target.value })} className={`${glassInput} py-2`} />
                            </div>
                          </div>
                          <label className="flex cursor-pointer items-center gap-2 border-t border-white/10 pt-2">
                            <input type="checkbox" checked={nonBrandPcsEnabled} onChange={(e) => setNonBrandPcsEnabled(e.target.checked)} className="h-4 w-4 rounded border-white/10 bg-white/5 accent-purple-500" />
                            <span className="text-[11px] font-black uppercase text-zinc-500">Non Brand Pcs Details</span>
                          </label>
                          {nonBrandPcsEnabled && (
                            <div className="space-y-2 rounded-xl border border-white/5 bg-black/20 p-3">
                              <div>
                                <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-zinc-400">Pcs Pack No</label>
                                <input type="text" value={form.nonBrandPcsPackNo} onChange={(e) => setForm({ ...form, nonBrandPcsPackNo: e.target.value.replace(/[^0-9,-]/g, '') })} className={`${glassInput} py-1.5 text-xs`} />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-zinc-400">Bundle Qty</label>
                                  <input type="number" value={form.nonBrandPcsOneQty} onChange={(e) => setForm({ ...form, nonBrandPcsOneQty: e.target.value })} className={`${glassInput} py-1.5 text-xs`} />
                                </div>
                                <div>
                                  <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-zinc-400">Total Qty</label>
                                  <input type="number" value={form.nonBrandPcsTotalQty} onChange={(e) => setForm({ ...form, nonBrandPcsTotalQty: e.target.value })} className={`${glassInput} py-1.5 text-xs`} />
                                </div>
                                <div>
                                  <label className="mb-1 block text-[9px] font-medium uppercase tracking-wider text-zinc-400">Avg Weight</label>
                                  <input type="number" step="0.001" value={form.nonBrandPcsAvgWeight} onChange={(e) => setForm({ ...form, nonBrandPcsAvgWeight: e.target.value })} className={`${glassInput} py-1.5 text-xs`} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Weight Bar Pack */}
                    <div>
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-blue-500/30">
                        <input type="checkbox" checked={weightBarEnabled} onChange={(e) => setWeightBarEnabled(e.target.checked)} className="h-5 w-5 rounded border-white/10 bg-white/5 accent-blue-500" />
                        <span className="text-sm font-bold uppercase text-zinc-400">Weight Bar Pack</span>
                      </label>
                      {weightBarEnabled && (
                        <div className="mt-2 space-y-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                          <div>
                            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Pack No</label>
                            <input type="text" value={form.weightBarPackNo} onChange={(e) => setForm({ ...form, weightBarPackNo: e.target.value.replace(/[^0-9-]/g, '') })} className={`${glassInput} py-2`} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Bundle Qty</label>
                              <input type="number" value={form.weightBarBundleQty} onChange={(e) => setForm({ ...form, weightBarBundleQty: e.target.value })} className={`${glassInput} py-2`} />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">Avg Weight</label>
                              <input type="number" step="0.001" value={form.weightBarAvgWeight} onChange={(e) => setForm({ ...form, weightBarAvgWeight: e.target.value })} className={`${glassInput} py-2`} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button type="button" onClick={closeModal} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold uppercase text-zinc-300 backdrop-blur-sm transition hover:border-emerald-400 hover:text-emerald-300">
                      Cancel
                    </button>
                    {editingRecentId === null ? (
                      <button type="button" onClick={handleAddToPending} disabled={loading} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3.5 text-sm font-black uppercase text-black shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 disabled:opacity-50">
                        {editingIndex !== null ? "Update Pending" : loading ? "Saving..." : "Add to Pending"}
                      </button>
                    ) : (
                      <button type="button" onClick={handleUpdateRecent} disabled={loading} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3.5 text-sm font-black uppercase text-black shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 disabled:opacity-50">
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
            <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-emerald-500/20">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Packing Record Saved</h2>
            <p className="mt-2 text-sm text-zinc-400">Data synced to database successfully</p>
          </div>
        </div>
      )}
    </div>
  );
}
