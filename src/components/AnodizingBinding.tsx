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

const PROFILES = ["06 CH 09", "08 CH 09", "09 CH 09", "10 CH 09", "10 PC 01", "10 PC 02", "100 DO 01", "100 SD 01", "100 SF 01"];

type BindingForm = {
  extrusionDate: string;
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
      const { data } = await supabase
        .from("anodizing_binding")
        .select("*")
        .eq("submitted", false)
        .order("created_at", { ascending: false });
      setPendingRecords(data || []);
    } catch (err) {
      console.error("Error loading pending records:", err);
    }
  };

  const loadRecentData = async () => {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const { data } = await supabase
        .from("anodizing_binding")
        .select("*")
        .eq("submitted", true)
        .gte("extrusion_date", threeDaysAgo.toISOString().slice(0, 10))
        .order("created_at", { ascending: false })
        .limit(20);
      setRecentData(data || []);
    } catch (err) {
      console.error("Error loading recent data:", err);
    }
  };

  const filteredProfiles = PROFILES.filter((p) =>
    p.toLowerCase().includes(profileSearch.toLowerCase())
  );

  const buildRecord = () => ({
    extrusion_date: form.extrusionDate,
    billet_batch: form.billetBatch,
    die_no: form.dieNo,
    profile: form.profile,
    bucket_no: form.bucketNo,
    legnth: form.length, // matches your column name (typo in schema)
    surface: form.surface,
    full_rack_no: form.fullRackNo,
    one_full_rack_qty: form.oneFullRackQty,
    pcs_rack_no: form.pcsRackNo,
    pcs_qty: form.pcsQty,
    surface2: form.surface2,
    full_rack_no2: form.fullRackNo2,
    one_full_rack_qty2: form.oneFullRackQty2,
    pcs_rack_no2: form.pcsRackNo2,
    pcs_qty2: form.pcsQty2,
    total_binding_qty: form.totalBindingQty,
    type: form.type,
    binding_team: form.bindingTeam,
    average_time: form.averageTime,
    rejection_qty: form.rejectionQty,
    operator: user ?? undefined,
  });

  const openModal = () => {
    const today = new Date().toISOString().slice(0, 10);
    setForm({ ...emptyForm, extrusionDate: today });
    setProfileSearch("");
    setEditingIndex(null);
    setEditingRecentId(null);
    setShowModal(true);
  };

  const recordToForm = (record: any): BindingForm => ({
    extrusionDate: record.extrusion_date || "",
    billetBatch: record.billet_batch || "",
    dieNo: record.die_no || "",
    profile: record.profile || "",
    bucketNo: record.bucket_no || "",
    length: record.legnth || record.length || "",
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

  const handleAddToPending = async (e: React.FormEvent) => {
    e.preventDefault();
    const record = { ...buildRecord(), submitted: false };
    setLoading(true);
    try {
      if (editingIndex !== null && pendingRecords[editingIndex]?.id) {
        await supabase
          .from("anodizing_binding")
          .update(record)
          .eq("id", pendingRecords[editingIndex].id);
        setEditingIndex(null);
      } else {
        const { data } = await supabase
          .from("anodizing_binding")
          .insert([record])
          .select()
          .single();
        if (data) setPendingRecords([data, ...pendingRecords]);
      }
      closeModal();
      loadPendingFromDB();
    } catch (err: any) {
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
        await supabase
          .from("anodizing_binding")
          .update({ submitted: true })
          .in("id", ids);
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
      await supabase
        .from("anodizing_binding")
        .update(record)
        .eq("id", editingRecentId);
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
        await supabase.from("anodizing_binding").delete().eq("id", record.id);
      } catch (err: any) {
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
                      key={record.id}
                      className="border-b border-white/5 transition hover:bg-white/5"
                    >
                      <td className="px-3 py-3 font-bold text-emerald-400">
                        {record.bucket_no}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {record.legnth || record.length || "—"}
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
                </svg>
                <span>{pendingRecords.length} record(s) ready to submit</span>
              </div>
              <button
                onClick={handleFinalSubmit}
                disabled={loading}
                className={`${glassBtnPrimary} flex items-center gap-2`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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
                        {row.legnth || row.length || "—"}
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
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form
                  className="max-h-[80vh] overflow-y-auto p-6 space-y-4"
                  onSubmit={handleAddToPending}
                >
                  {/* Date & Batch */}
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

                  {/* Profile */}
                  <div className="relative">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Profile
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

                  {/* Bucket No + Length + Surface */}
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
                   

                  {/* First Rack Group */}
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

                  {/* Second Rack Group */}
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
