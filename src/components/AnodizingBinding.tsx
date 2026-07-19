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

type BindingForm = {
  extrusionDate: string;
  bindingDate: string;        // ✅ new field
  billetBatch: string;
  dieNo: string;
  profile: string;
  bucketNo: string;
  length: string;
  surface: string;
  fullRackNo: string;
  oneFullRackQty: string;
  pcsRackNo: string;
  pcsQty: string;
  surface2: string;
  fullRackNo2: string;
  oneFullRackQty2: string;
  pcsRackNo2: string;
  pcsQty2: string;
  totalBindingQty: string;
  type: string;
  bindingTeam: string;
  averageTime: string;
  rejectionQty: string;
};

export default function AnodizingBinding() {
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

  const emptyForm: BindingForm = {
    extrusionDate: "",
    bindingDate: "",           // ✅ new field
    billetBatch: "",
    dieNo: "",
    profile: "",
    bucketNo: "",
    length: "",
    surface: "",
    fullRackNo: "",
    oneFullRackQty: "",
    pcsRackNo: "",
    pcsQty: "",
    surface2: "",
    fullRackNo2: "",
    oneFullRackQty2: "",
    pcsRackNo2: "",
    pcsQty2: "",
    totalBindingQty: "",
    type: "",
    bindingTeam: "",
    averageTime: "",
    rejectionQty: "",
  };

  const [form, setForm] = useState<BindingForm>(emptyForm);

  useEffect(() => {
    loadRecentData();
    loadPendingFromDB();
  }, []);

  const loadPendingFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from("anodizing_binding")
        .select("*")
        .eq("submitted", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error loading pending:", error);
        alert(`Error loading pending records: ${error.message}`);
        return;
      }
      setPendingRecords(data || []);
    } catch (err: any) {
      console.error("Exception loading pending records:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const loadRecentData = async () => {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const { data, error } = await supabase
        .from("anodizing_binding")
        .select("*")
        .eq("submitted", true)
        .gte("extrusion_date", threeDaysAgo.toISOString().slice(0, 10))
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Supabase error loading recent:", error);
        return;
      }
      setRecentData(data || []);
    } catch (err) {
      console.error("Error loading recent data:", err);
    }
  };

  const filteredProfiles = PROFILES.filter((p) =>
    p.toLowerCase().includes(profileSearch.toLowerCase())
  );

  // ✅ buildRecord matches new schema exactly
  const buildRecord = () => ({
    extrusion_date: form.extrusionDate || null,
    binding_date: form.bindingDate || null,    // ✅ new field
    billet_batch: form.billetBatch || null,
    die_no: form.dieNo || null,
    profile: form.profile || null,
    bucket_no: form.bucketNo || null,
    legnth: form.length || null,
    surface: form.surface || null,
    full_rack_no: form.fullRackNo || null,
    one_full_rack_qty: form.oneFullRackQty || null,
    pcs_rack_no: form.pcsRackNo || null,
    pcs_qty: form.pcsQty || null,
    surface2: form.surface2 || null,
    full_rack_no2: form.fullRackNo2 || null,
    one_full_rack_qty2: form.oneFullRackQty2 || null,
    pcs_rack_no2: form.pcsRackNo2 || null,
    pcs_qty2: form.pcsQty2 || null,
    total_binding_qty: form.totalBindingQty || null,
    type: form.type || null,
    binding_team: form.bindingTeam || null,
    average_time: form.averageTime || null,
    rejection_qty: form.rejectionQty || null,
    operator: user || null,
  });

  const openModal = () => {
    const today = new Date().toISOString().slice(0, 10);
    setForm({ ...emptyForm, extrusionDate: today, bindingDate: today }); // ✅ default today
    setProfileSearch("");
    setEditingIndex(null);
    setEditingRecentId(null);
    setShowModal(true);
  };

  // ✅ recordToForm includes binding_date
  const recordToForm = (record: any): BindingForm => ({
    extrusionDate: record.extrusion_date || "",
    bindingDate: record.binding_date || "",    // ✅ new field
    billetBatch: record.billet_batch || "",
    dieNo: record.die_no || "",
    profile: record.profile || "",
    bucketNo: record.bucket_no || "",
    length: record.legnth || "",
    surface: record.surface || "",
    fullRackNo: record.full_rack_no || "",
    oneFullRackQty: record.one_full_rack_qty || "",
    pcsRackNo: record.pcs_rack_no || "",
    pcsQty: record.pcs_qty || "",
    surface2: record.surface2 || "",
    fullRackNo2: record.full_rack_no2 || "",
    oneFullRackQty2: record.one_full_rack_qty2 || "",
    pcsRackNo2: record.pcs_rack_no2 || "",
    pcsQty2: record.pcs_qty2 || "",
    totalBindingQty: record.total_binding_qty || "",
    type: record.type || "",
    bindingTeam: record.binding_team || "",
    averageTime: record.average_time || "",
    rejectionQty: record.rejection_qty || "",
  });

  const editPendingRecord = (index: number) => {
    const record = pendingRecords[index];
    setForm(recordToForm(record));
    setEditingIndex(index);
    setEditingRecentId(null);
    setProfileSearch(record.profile);
    setShowModal(true);
  };

  const editRecentRecord = (record: any) => {
    setForm(recordToForm(record));
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

  const handleAddToPending = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();

    if (!form.profile) {
      alert("Please select a profile");
      return;
    }

    setLoading(true);
    try {
      const record = { ...buildRecord(), submitted: false };

      if (editingIndex !== null && pendingRecords[editingIndex]?.id) {
        const { error } = await supabase
          .from("anodizing_binding")
          .update(record)
          .eq("id", pendingRecords[editingIndex].id);

        if (error) throw error;
        setEditingIndex(null);
      } else {
        const { data, error } = await supabase
          .from("anodizing_binding")
          .insert([record])
          .select();

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        console.log("Inserted record:", data);
      }

      closeModal();
      await loadPendingFromDB();
    } catch (err: any) {
      console.error("Add to pending error:", err);
      alert(`Error saving record: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (pendingRecords.length === 0) {
      alert("No pending records to submit.");
      return;
    }

    const recordsWithId = pendingRecords.filter((r) => r.id);
    if (recordsWithId.length === 0) {
      alert("No records with valid IDs found. Please try adding again.");
      return;
    }

    setShowCloudSync(true);
    setLoading(true);
    try {
      const ids = recordsWithId.map((r) => r.id);
      const { error } = await supabase
        .from("anodizing_binding")
        .update({ submitted: true })
        .in("id", ids);

      if (error) throw error;

      await new Promise((resolve) => setTimeout(resolve, 1500));
      setShowCloudSync(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setPendingRecords([]);
        setEditingRecentId(null);
        loadRecentData();
        loadPendingFromDB();
      }, 2000);
    } catch (err: any) {
      console.error("Final submit error:", err);
      alert(`Error submitting: ${err.message}`);
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
      const record = { ...buildRecord(), submitted: true };
      const { error } = await supabase
        .from("anodizing_binding")
        .update(record)
        .eq("id", editingRecentId);

      if (error) throw error;

      await new Promise((resolve) => setTimeout(resolve, 1500));
      setShowCloudSync(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setEditingRecentId(null);
        loadRecentData();
      }, 2000);
    } catch (err: any) {
      console.error("Update recent error:", err);
      alert(`Error updating: ${err.message}`);
      setShowCloudSync(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePending = async (index: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    const record = pendingRecords[index];
    if (record?.id) {
      try {
        const { error } = await supabase
          .from("anodizing_binding")
          .delete()
          .eq("id", record.id);

        if (error) throw error;
      } catch (err: any) {
        console.error("Delete error:", err);
        alert(`Error: ${err.message}`);
        return;
      }
    }
    setPendingRecords(pendingRecords.filter((_, i) => i !== index));
  };

  const glassCard =
    "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl";
  const glassInput =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500 backdrop-blur-sm transition-colors";
  const glassBtnPrimary =
    "rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 disabled:opacity-50";

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
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 font-bold text-black shadow-lg shadow-emerald-500/20">
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
              className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-emerald-400 hover:text-emerald-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-zinc-500">
          <Link href="/home/anodizing" className="hover:text-zinc-300">
            Anodizing
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-emerald-300">Binding</span>
        </nav>

        <div className={`mt-4 overflow-hidden p-8 ${glassCard}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Binding Module
              </div>
              <h1 className="mt-3 text-3xl font-bold text-white">
                Anodizing Binding
              </h1>
              <p className="text-sm text-zinc-400">
                Record anodizing binding data
              </p>
            </div>
            <button onClick={openModal} className={glassBtnPrimary}>
              + Add Binding Record
            </button>
          </div>
        </div>

        {pendingRecords.length > 0 && (
          <div className={`mt-6 overflow-hidden ${glassCard}`}>
            <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-6 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Pending Records
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                {pendingRecords.length} record(s)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                    <th className="px-3 py-3">Bucket</th>
                    <th className="px-3 py-3">Length</th>
                    <th className="px-3 py-3">Profile</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Surface</th>
                    <th className="px-3 py-3">Team</th>
                    <th className="px-3 py-3">Total Qty</th>
                    <th className="px-3 py-3">Rejection</th>
                    <th className="px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRecords.map((record, index) => (
                    <tr
                      key={record.id || index}
                      className="border-b border-white/5 transition hover:bg-white/5"
                    >
                      <td className="px-3 py-3 font-bold text-emerald-400">
                        {record.bucket_no}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {record.legnth || "—"}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {record.profile}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {record.type}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {record.surface}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {record.binding_team || "—"}
                      </td>
                      <td className="px-3 py-3 font-bold text-emerald-400">
                        {record.total_binding_qty || "—"}
                      </td>
                      <td className="px-3 py-3">
                        {record.rejection_qty &&
                        parseInt(record.rejection_qty) > 0 ? (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                            {record.rejection_qty}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editPendingRecord(index)}
                            className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-blue-400 transition hover:border-blue-500 hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePending(index)}
                            className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-red-400 transition hover:border-red-500 hover:text-red-300"
                          >
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
              <button
                onClick={handleFinalSubmit}
                disabled={loading}
                className={`${glassBtnPrimary} flex items-center gap-2`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
                </svg>
                {loading ? "Submitting..." : "Final Submit"}
              </button>
            </div>
          </div>
        )}

        <div className={`mt-6 overflow-hidden ${glassCard}`}>
          <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-6 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Recent Submitted Records
            </h2>
            <button
              onClick={loadRecentData}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm transition hover:border-emerald-400 hover:text-emerald-300"
            >
              ↻ Refresh
            </button>
          </div>
          {recentData.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No submitted records found in the last 3 days.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                    <th className="px-3 py-3">Bucket</th>
                    <th className="px-3 py-3">Length</th>
                    <th className="px-3 py-3">Profile</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Surface</th>
                    <th className="px-3 py-3">Team</th>
                    <th className="px-3 py-3">Total Qty</th>
                    <th className="px-3 py-3">Rejection</th>
                    <th className="px-3 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentData.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-white/5 transition hover:bg-white/5"
                    >
                      <td className="px-3 py-3 font-bold text-emerald-400">
                        {row.bucket_no}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {row.legnth || "—"}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {row.profile}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">{row.type}</td>
                      <td className="px-3 py-3 text-zinc-300">
                        {row.surface}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {row.binding_team || "—"}
                      </td>
                      <td className="px-3 py-3 font-bold text-emerald-400">
                        {row.total_binding_qty || "—"}
                      </td>
                      <td className="px-3 py-3">
                        {row.rejection_qty &&
                        parseInt(row.rejection_qty) > 0 ? (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                            {row.rejection_qty}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => editRecentRecord(row)}
                          className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-blue-400 transition hover:border-blue-500 hover:text-blue-300"
                        >
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

      {showModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div
                className={`w-full max-w-2xl overflow-hidden my-8 ${glassCard}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="binding-modal-title"
              >
                <div className="sticky top-0 z-10 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-6 py-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3
                      id="binding-modal-title"
                      className="text-lg font-bold uppercase tracking-widest text-emerald-400"
                    >
                      {editingRecentId
                        ? "Edit Binding Record"
                        : "Add Binding Record"}
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-zinc-400 transition hover:text-white p-1"
                      aria-label="Close"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form
                  className="max-h-[80vh] overflow-y-auto p-6 space-y-4"
                  onSubmit={handleAddToPending}
                >
                  {/* ✅ Two date fields side by side */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Extrusion Date
                      </label>
                      <input
                        type="date"
                        value={form.extrusionDate}
                        onChange={(e) =>
                          setForm({ ...form, extrusionDate: e.target.value })
                        }
                        className={glassInput}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Binding Date
                      </label>
                      <input
                        type="date"
                        value={form.bindingDate}
                        onChange={(e) =>
                          setForm({ ...form, bindingDate: e.target.value })
                        }
                        className={glassInput}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Billet Batch
                      </label>
                      <input
                        type="text"
                        value={form.billetBatch}
                        onChange={(e) =>
                          setForm({ ...form, billetBatch: e.target.value })
                        }
                        placeholder="000"
                        className={glassInput}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Die No
                      </label>
                      <input
                        type="text"
                        value={form.dieNo}
                        onChange={(e) =>
                          setForm({ ...form, dieNo: e.target.value })
                        }
                        placeholder="00"
                        className={glassInput}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Profile <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileSearch || form.profile}
                      onChange={(e) => {
                        setProfileSearch(e.target.value);
                        setShowProfileDropdown(true);
                        setForm({ ...form, profile: e.target.value });
                      }}
                      onFocus={() => setShowProfileDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowProfileDropdown(false), 150)
                      }
                      placeholder="Search profile..."
                      className={glassInput}
                      required
                      autoComplete="off"
                      aria-expanded={showProfileDropdown}
                    />
                    {showProfileDropdown && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl">
                        {filteredProfiles.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-zinc-500">
                            No matches
                          </div>
                        ) : (
                          filteredProfiles.map((p) => (
                            <div
                              key={p}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setForm({ ...form, profile: p });
                                setProfileSearch("");
                                setShowProfileDropdown(false);
                              }}
                              className="cursor-pointer border-b border-zinc-900 px-3 py-2 text-sm text-zinc-300 hover:bg-emerald-500/20 hover:text-emerald-300"
                            >
                              {p}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Bucket No
                      </label>
                      <input
                        type="text"
                        value={form.bucketNo}
                        onChange={(e) =>
                          setForm({ ...form, bucketNo: e.target.value })
                        }
                        placeholder="Enter bucket ID"
                        className={glassInput}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Length (mm)
                      </label>
                      <input
                        type="number"
                        value={form.length}
                        onChange={(e) =>
                          setForm({ ...form, length: e.target.value })
                        }
                        placeholder="e.g. 6000"
                        min="0"
                        step="any"
                        className={glassInput}
                      />
                    </div>
                    <div>
                      <Dropdown
                        label="Surface"
                        value={form.surface}
                        onChange={(v) => setForm({ ...form, surface: v })}
                        placeholder="Select Surface"
                        required
                        options={[
                          { value: "Natural", label: "Natural" },
                          { value: "Bronze", label: "Bronze" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Surface Selection I
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Full Rack No
                        </label>
                        <input
                          type="text"
                          value={form.fullRackNo}
                          onChange={(e) =>
                            setForm({ ...form, fullRackNo: e.target.value })
                          }
                          placeholder="e.g. 101, 102"
                          className={glassInput}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                          One Full Rack Qty
                        </label>
                        <input
                          type="text"
                          value={form.oneFullRackQty}
                          onChange={(e) =>
                            setForm({ ...form, oneFullRackQty: e.target.value })
                          }
                          className={glassInput}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Pcs Rack No
                        </label>
                        <input
                          type="text"
                          value={form.pcsRackNo}
                          onChange={(e) =>
                            setForm({ ...form, pcsRackNo: e.target.value })
                          }
                          placeholder="e.g. 5, 10"
                          className={glassInput}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Pcs Qty
                        </label>
                        <input
                          type="text"
                          value={form.pcsQty}
                          onChange={(e) =>
                            setForm({ ...form, pcsQty: e.target.value })
                          }
                          className={glassInput}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Surface Selection II
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Dropdown
                          label="Surface 2"
                          value={form.surface2}
                          onChange={(v) => setForm({ ...form, surface2: v })}
                          placeholder="Select Surface 2"
                          options={[
                            { value: "Natural", label: "Natural" },
                            { value: "Bronze", label: "Bronze" },
                          ]}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Full Rack No 2
                        </label>
                        <input
                          type="text"
                          value={form.fullRackNo2}
                          onChange={(e) =>
                            setForm({ ...form, fullRackNo2: e.target.value })
                          }
                          placeholder="e.g. 201, 202"
                          className={glassInput}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                          One Full Rack Qty 2
                        </label>
                        <input
                          type="text"
                          value={form.oneFullRackQty2}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              oneFullRackQty2: e.target.value,
                            })
                          }
                          className={glassInput}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Pcs Rack No 2
                        </label>
                        <input
                          type="text"
                          value={form.pcsRackNo2}
                          onChange={(e) =>
                            setForm({ ...form, pcsRackNo2: e.target.value })
                          }
                          placeholder="e.g. 7, 12"
                          className={glassInput}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Pcs Qty 2
                        </label>
                        <input
                          type="text"
                          value={form.pcsQty2}
                          onChange={(e) =>
                            setForm({ ...form, pcsQty2: e.target.value })
                          }
                          className={glassInput}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Total Binding Qty
                      </label>
                      <input
                        type="text"
                        value={form.totalBindingQty}
                        onChange={(e) =>
                          setForm({ ...form, totalBindingQty: e.target.value })
                        }
                        className={glassInput}
                      />
                    </div>
                    <div>
                      <Dropdown
                        label="Type"
                        value={form.type}
                        onChange={(v) => setForm({ ...form, type: v })}
                        placeholder="Select Type"
                        required
                        options={[
                          { value: "ULR", label: "ULR" },
                          { value: "PRM", label: "PRM" },
                          { value: "ULR PRM", label: "ULR PRM" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Dropdown
                        label="Binding Team"
                        value={form.bindingTeam}
                        onChange={(v) => setForm({ ...form, bindingTeam: v })}
                        placeholder="Select Team"
                        required
                        options={[
                          { value: "Team A", label: "Team A" },
                          { value: "Team B", label: "Team B" },
                          { value: "Team C", label: "Team C" },
                          { value: "Team D", label: "Team D" },
                          { value: "Team E", label: "Team E" },
                          { value: "Team F", label: "Team F" },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                        Average Time
                      </label>
                      <input
                        type="text"
                        value={form.averageTime}
                        onChange={(e) =>
                          setForm({ ...form, averageTime: e.target.value })
                        }
                        className={glassInput}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Rejection Qty
                    </label>
                    <input
                      type="text"
                      value={form.rejectionQty}
                      onChange={(e) =>
                        setForm({ ...form, rejectionQty: e.target.value })
                      }
                      className={glassInput}
                    />
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold uppercase text-zinc-300 backdrop-blur-sm transition hover:border-emerald-400 hover:text-emerald-300"
                    >
                      Cancel
                    </button>
                    {editingRecentId === null ? (
                      <button
                        type="button"
                        onClick={handleAddToPending}
                        disabled={loading}
                        className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3.5 text-sm font-black uppercase text-black shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 disabled:opacity-50"
                      >
                        {editingIndex !== null
                          ? "Update Pending"
                          : loading
                          ? "Saving..."
                          : "Add to Pending"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleUpdateRecent}
                        disabled={loading}
                        className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3.5 text-sm font-black uppercase text-black shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 disabled:opacity-50"
                      >
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
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-emerald-400"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Binding Record Saved
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Data synced to database successfully
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
