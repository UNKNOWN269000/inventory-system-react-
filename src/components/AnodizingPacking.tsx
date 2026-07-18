"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { SlideMenu } from "@/components/SlideMenu";
import { MenuButton } from "@/components/MenuButton";
import { useAuth } from "@/context/AuthContext";
import { menuStructure } from "@/lib/menu";
import { supabase } from "@/lib/supabase";
import { CloudSync } from "@/components/CloudSync";

// ─── Constants ────────────────────────────────────────────────────────────────

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

const SURFACES = ["Natural", "Bronze", "Mill Finish", "P/C White"] as const;
const PROD_TYPES = ["ULR", "PRM", "ULR PRM"] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  prodDate: string;
  packDate: string;
  length: string;
  prodType: string;
  profile: string;
  surface: string;
  premiumPackNo: string;
  premiumOneQty: string;
  premiumTotalBundle: string;
  premiumAvgWeight: string;
  premiumPcsPackNo: string;
  premiumPcsOneQty: string;
  premiumPcsTotalQty: string;
  premiumPcsAvgWeight: string;
  nonBrandPackNo: string;
  nonBrandOneQty: string;
  nonBrandTotalBundle: string;
  nonBrandAvgWeight: string;
  nonBrandPcsPackNo: string;
  nonBrandPcsOneQty: string;
  nonBrandPcsTotalQty: string;
  nonBrandPcsAvgWeight: string;
  weightBarPackNo: string;
  weightBarBundleQty: string;
  weightBarAvgWeight: string;
}

interface PackingFlags {
  premiumEnabled: boolean;
  nonBrandEnabled: boolean;
  weightBarEnabled: boolean;
  premiumPcsEnabled: boolean;
  nonBrandPcsEnabled: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM: FormState = {
  prodDate: "", packDate: "", length: "", prodType: "", profile: "", surface: "",
  premiumPackNo: "", premiumOneQty: "", premiumTotalBundle: "", premiumAvgWeight: "",
  premiumPcsPackNo: "", premiumPcsOneQty: "", premiumPcsTotalQty: "", premiumPcsAvgWeight: "",
  nonBrandPackNo: "", nonBrandOneQty: "", nonBrandTotalBundle: "", nonBrandAvgWeight: "",
  nonBrandPcsPackNo: "", nonBrandPcsOneQty: "", nonBrandPcsTotalQty: "", nonBrandPcsAvgWeight: "",
  weightBarPackNo: "", weightBarBundleQty: "", weightBarAvgWeight: "",
};

const EMPTY_FLAGS: PackingFlags = {
  premiumEnabled: false, nonBrandEnabled: false, weightBarEnabled: false,
  premiumPcsEnabled: false, nonBrandPcsEnabled: false,
};

function rowToFormState(record: any): { form: FormState; flags: PackingFlags } {
  return {
    form: {
      prodDate: record.production_date ?? "",
      packDate: record.packing_date ?? "",
      length: record.length ?? "",
      prodType: record.production_type ?? "",
      profile: record.profile ?? "",
      surface: record.surface ?? "",
      premiumPackNo: record.premium_pack_no ?? "",
      premiumOneQty: record.premium_one_qty ?? "",
      premiumTotalBundle: record.premium_total_bundles ?? "",
      premiumAvgWeight: record.premium_avg_weight ?? "",
      premiumPcsPackNo: record.premium_pcs_pack_no ?? "",
      premiumPcsOneQty: record.premium_pcs_one_qty ?? "",
      premiumPcsTotalQty: record.premium_pcs_total_qty ?? "",
      premiumPcsAvgWeight: record.premium_pcs_avg_weight ?? "",
      nonBrandPackNo: record.nonbrand_pack_no ?? "",
      nonBrandOneQty: record.nonbrand_one_qty ?? "",
      nonBrandTotalBundle: record.nonbrand_total_bundles ?? "",
      nonBrandAvgWeight: record.nonbrand_avg_weight ?? "",
      nonBrandPcsPackNo: record.nonbrand_pcs_pack_no ?? "",
      nonBrandPcsOneQty: record.nonbrand_pcs_one_qty ?? "",
      nonBrandPcsTotalQty: record.nonbrand_pcs_total_qty ?? "",
      nonBrandPcsAvgWeight: record.nonbrand_pcs_avg_weight ?? "",
      weightBarPackNo: record.weightbar_pack_no ?? "",
      weightBarBundleQty: record.weightbar_bundle_qty ?? "",
      weightBarAvgWeight: record.weightbar_avg_weight ?? "",
    },
    flags: {
      premiumEnabled: !!record.premium_enabled,
      nonBrandEnabled: !!record.nonbrand_enabled,
      weightBarEnabled: !!record.weightbar_enabled,
      premiumPcsEnabled: !!record.premium_pcs_enabled,
      nonBrandPcsEnabled: !!record.nonbrand_pcs_enabled,
    },
  };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const glassCard =
  "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl";
const glassInput =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm " +
  "text-zinc-100 outline-none focus:border-emerald-500 backdrop-blur-sm transition-colors";
const glassBtnPrimary =
  "rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2.5 " +
  "text-sm font-bold text-black shadow-lg shadow-emerald-500/20 transition " +
  "hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed";

// ─── Small reusable components ────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">
        {label}
      </label>
      {children}
    </div>
  );
}

type BadgeColor = "emerald" | "blue" | "purple";
function BadgeCell({ enabled, color }: { enabled: boolean; color: BadgeColor }) {
  const styles: Record<BadgeColor, string> = {
    emerald: "bg-emerald-500/20 text-emerald-300",
    blue: "bg-blue-500/20 text-blue-300",
    purple: "bg-purple-500/20 text-purple-300",
  };
  return (
    <td className="px-3 py-3">
      {enabled
        ? <span className={`rounded-full px-2 py-0.5 text-xs ${styles[color]}`}>Yes</span>
        : <span className="text-zinc-600">—</span>}
    </td>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
    </svg>
  );
}

interface SectionToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accentClass?: string;
  borderHover?: string;
  children?: React.ReactNode;
}
function SectionToggle({
  label, checked, onChange,
  accentClass = "accent-emerald-500",
  borderHover = "hover:border-emerald-500/30",
  children,
}: SectionToggleProps) {
  return (
    <div className="mb-3">
      <label className={`flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 ${borderHover}`}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
          className={`h-5 w-5 rounded border-white/10 bg-white/5 ${accentClass}`} />
        <span className="text-sm font-bold uppercase text-zinc-400">{label}</span>
      </label>
      {checked && children}
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

interface DeleteConfirmProps {
  record: any;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}
function DeleteConfirmModal({ record, onConfirm, onCancel, deleting }: DeleteConfirmProps) {
  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className={`w-full max-w-sm overflow-hidden ${glassCard}`}>
          {/* Header */}
          <div className="border-b border-white/10 bg-gradient-to-r from-red-500/10 to-rose-500/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-red-500/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" className="text-red-400">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white">Delete Record</h3>
                <p className="text-xs text-zinc-400">This action cannot be undone</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p className="text-sm text-zinc-300">
              Are you sure you want to permanently delete this record?
            </p>
            {/* Record summary */}
            <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Profile</span>
                <span className="text-sm font-bold text-emerald-400">{record.profile}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Pack Date</span>
                <span className="text-sm text-zinc-300">{record.packing_date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Surface</span>
                <span className="text-sm text-zinc-300">{record.surface}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Length</span>
                <span className="text-sm text-zinc-300">{record.length}m</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-white/10 px-6 py-4">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-zinc-300 transition hover:border-white/30 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Deleting…
                </span>
              ) : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnodizingPacking() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, user } = useAuth();

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [showCloudSync, setShowCloudSync] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Packing Record Saved");
  const [loading, setLoading] = useState(false);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Profile autocomplete
  const [profileSearch, setProfileSearch] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Data
  const [pendingRecords, setPendingRecords] = useState<any[]>([]);
  const [recentData, setRecentData] = useState<any[]>([]);

  // Edit targets
  const [editingPendingId, setEditingPendingId] = useState<number | null>(null);
  const [editingRecentId, setEditingRecentId] = useState<number | null>(null);

  // Form
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [flags, setFlags] = useState<PackingFlags>({ ...EMPTY_FLAGS });

  // ── Derived ──────────────────────────────────────────────────────────────────

  const filteredProfiles = PROFILES.filter((p) =>
    p.toLowerCase().includes(profileSearch.toLowerCase())
  );

  const calcPremiumTotal = () =>
    String((parseInt(form.premiumOneQty) || 0) * (parseInt(form.premiumTotalBundle) || 0));

  const calcNonBrandTotal = () =>
    String((parseInt(form.nonBrandOneQty) || 0) * (parseInt(form.nonBrandTotalBundle) || 0));

  // ── Data loaders ─────────────────────────────────────────────────────────────

  const loadPending = useCallback(async () => {
    const { data, error } = await supabase
      .from("anodizing_packing")
      .select("*")
      .eq("submitted", false)
      .order("created_at", { ascending: false });
    if (!error) setPendingRecords(data ?? []);
    else console.error("loadPending:", error);
  }, []);

  const loadRecent = useCallback(async () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 3);

    const { data, error } = await supabase
      .from("anodizing_packing")
      .select("*")
      .eq("submitted", true)
      .gte("pack_date", cutoff.toISOString().slice(0, 10))
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error) setRecentData(data ?? []);
    else console.error("loadRecent:", error);
  }, []);

  useEffect(() => {
    loadPending();
    loadRecent();
  }, [loadPending, loadRecent]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Record builder ────────────────────────────────────────────────────────────

  const buildRecord = useCallback(
    (submitted = false) => ({
      production_date: form.prodDate,
      packing_date: form.packDate,
      length: form.length,
      production_type: form.prodType,
      profile: form.profile,
      surface: form.surface,
      submitted,
      operator: user ?? undefined,

      premium_enabled: flags.premiumEnabled,
      premium_pack_no: flags.premiumEnabled ? form.premiumPackNo : null,
      premium_one_qty: flags.premiumEnabled ? form.premiumOneQty : null,
      premium_total_bundles: flags.premiumEnabled ? form.premiumTotalBundle : null,
      premium_total_qty: flags.premiumEnabled ? calcPremiumTotal() : null,
      premium_avg_weight: flags.premiumEnabled ? form.premiumAvgWeight : null,
      premium_pcs_enabled: flags.premiumEnabled && flags.premiumPcsEnabled,
      premium_pcs_pack_no: flags.premiumPcsEnabled ? form.premiumPcsPackNo : null,
      premium_pcs_one_qty: flags.premiumPcsEnabled ? form.premiumPcsOneQty : null,
      premium_pcs_total_qty: flags.premiumPcsEnabled ? form.premiumPcsTotalQty : null,
      premium_pcs_avg_weight: flags.premiumPcsEnabled ? form.premiumPcsAvgWeight : null,

      nonbrand_enabled: flags.nonBrandEnabled,
      nonbrand_pack_no: flags.nonBrandEnabled ? form.nonBrandPackNo : null,
      nonbrand_one_qty: flags.nonBrandEnabled ? form.nonBrandOneQty : null,
      nonbrand_total_bundles: flags.nonBrandEnabled ? form.nonBrandTotalBundle : null,
      nonbrand_total_qty: flags.nonBrandEnabled ? calcNonBrandTotal() : null,
      nonbrand_avg_weight: flags.nonBrandEnabled ? form.nonBrandAvgWeight : null,
      nonbrand_pcs_enabled: flags.nonBrandEnabled && flags.nonBrandPcsEnabled,
      nonbrand_pcs_pack_no: flags.nonBrandPcsEnabled ? form.nonBrandPcsPackNo : null,
      nonbrand_pcs_one_qty: flags.nonBrandPcsEnabled ? form.nonBrandPcsOneQty : null,
      nonbrand_pcs_total_qty: flags.nonBrandPcsEnabled ? form.nonBrandPcsTotalQty : null,
      nonbrand_pcs_avg_weight: flags.nonBrandPcsEnabled ? form.nonBrandPcsAvgWeight : null,

      weightbar_enabled: flags.weightBarEnabled,
      weightbar_pack_no: flags.weightBarEnabled ? form.weightBarPackNo : null,
      weightbar_bundle_qty: flags.weightBarEnabled ? form.weightBarBundleQty : null,
      weightbar_avg_weight: flags.weightBarEnabled ? form.weightBarAvgWeight : null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, flags, user]
  );

  // ── Modal helpers ─────────────────────────────────────────────────────────────

  const resetModalState = () => {
    setForm({ ...EMPTY_FORM, prodDate: todayStr(), packDate: todayStr() });
    setFlags({ ...EMPTY_FLAGS });
    setProfileSearch("");
    setShowProfileDropdown(false);
    setEditingPendingId(null);
    setEditingRecentId(null);
  };

  const openModal = () => { resetModalState(); setShowModal(true); };
  const closeModal = () => { setShowModal(false); resetModalState(); };

  const loadRecordIntoForm = (record: any) => {
    const { form: f, flags: fl } = rowToFormState(record);
    setForm(f);
    setFlags(fl);
    setProfileSearch(record.profile ?? "");
  };

  const editPendingRecord = (record: any) => {
    loadRecordIntoForm(record);
    setEditingPendingId(record.id);
    setEditingRecentId(null);
    setShowModal(true);
  };

  const editRecentRecord = (record: any) => {
    loadRecordIntoForm(record);
    setEditingRecentId(record.id);
    setEditingPendingId(null);
    setShowModal(true);
  };

  // ── Validation ────────────────────────────────────────────────────────────────

  const validateForm = (): string | null => {
    if (!form.prodDate) return "Production date is required.";
    if (!form.packDate) return "Packing date is required.";
    if (!form.length) return "Length is required.";
    if (!form.prodType) return "Production type is required.";
    if (!form.profile) return "Profile is required.";
    if (!form.surface) return "Surface is required.";
    if (!flags.premiumEnabled && !flags.nonBrandEnabled && !flags.weightBarEnabled)
      return "Enable at least one packing configuration.";
    return null;
  };

  // ── CRUD actions ──────────────────────────────────────────────────────────────

  const handleAddToPending = async () => {
    const err = validateForm();
    if (err) return alert(err);
    setLoading(true);
    try {
      if (editingPendingId !== null) {
        const { error } = await supabase
          .from("anodizing_packing").update(buildRecord(false)).eq("id", editingPendingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("anodizing_packing").insert([buildRecord(false)]);
        if (error) throw error;
      }
      closeModal();
      await loadPending();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (pendingRecords.length === 0) { alert("No pending records to submit."); return; }
    const ids = pendingRecords.filter((r) => r.id).map((r) => r.id);
    if (ids.length === 0) return;

    setShowCloudSync(true);
    setLoading(true);
    try {
      const { error } = await supabase
        .from("anodizing_packing").update({ submitted: true }).in("id", ids);
      if (error) throw error;
      await new Promise((r) => setTimeout(r, 2500));
      setShowCloudSync(false);
      setSuccessMessage("All Records Submitted");
      setShowSuccess(true);
      setTimeout(async () => {
        setShowSuccess(false);
        setPendingRecords([]);
        await loadRecent();
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
    const err = validateForm();
    if (err) return alert(err);

    setShowCloudSync(true);
    setLoading(true);
    try {
      const { error } = await supabase
        .from("anodizing_packing").update(buildRecord(true)).eq("id", editingRecentId);
      if (error) throw error;
      await new Promise((r) => setTimeout(r, 2500));
      setShowCloudSync(false);
      setSuccessMessage("Record Updated Successfully");
      setShowSuccess(true);
      setTimeout(async () => {
        setShowSuccess(false);
        closeModal();
        await loadRecent();
      }, 2000);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      setShowCloudSync(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePending = async (record: any) => {
    if (!record?.id) return;
    try {
      const { error } = await supabase
        .from("anodizing_packing").delete().eq("id", record.id);
      if (error) throw error;
      setPendingRecords((prev) => prev.filter((r) => r.id !== record.id));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // ── Delete recent (with confirm modal) ────────────────────────────────────────

  const confirmDeleteRecent = (record: any) => setDeleteTarget(record);

  const handleDeleteRecent = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("anodizing_packing").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      setRecentData((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // ── Field helpers ─────────────────────────────────────────────────────────────

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setFlag = <K extends keyof PackingFlags>(key: K, value: boolean) =>
    setFlags((prev) => ({ ...prev, [key]: value }));

  const numericOnly = (v: string, allowComma = false) =>
    allowComma ? v.replace(/[^0-9,-]/g, "") : v.replace(/[^0-9-]/g, "");

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen text-zinc-100">
      <SlideMenu nodes={menuStructure} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── Header ── */}
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
            <button onClick={logout}
              className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-emerald-400 hover:text-emerald-300">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* ── Breadcrumb ── */}
        <nav className="flex flex-wrap items-center gap-1 text-xs text-zinc-500">
          <Link href="/home" className="hover:text-zinc-300">Home</Link>
          <span className="text-zinc-700">/</span>
          <Link href="/home/anodizing" className="hover:text-zinc-300">Anodizing</Link>
          <span className="text-zinc-700">/</span>
          <span className="text-emerald-300">Packing</span>
        </nav>

        {/* ── Hero Card ── */}
        <div className={`relative mt-4 overflow-hidden p-8 ${glassCard}`}>
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
            <button onClick={openModal} className={glassBtnPrimary}>+ Add Packing Record</button>
          </div>
        </div>

        {/* ── Pending Records ── */}
        {pendingRecords.length > 0 && (
          <div className={`mt-6 overflow-hidden ${glassCard}`}>
            <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-6 py-3">
              <h2 className="text-lg font-semibold text-white">Pending Records</h2>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                {pendingRecords.length} record(s)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                    {["Profile","Type","Surface","Length","Pack Date","Premium","Non-Brand","Weight Bar","Actions"].map(h => (
                      <th key={h} className="px-3 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingRecords.map((record) => (
                    <tr key={record.id} className="border-b border-white/5 transition hover:bg-white/5">
                      <td className="px-3 py-3 font-bold text-emerald-400">{record.profile}</td>
                      <td className="px-3 py-3 text-zinc-300">{record.production_type}</td>
                      <td className="px-3 py-3 text-zinc-300">{record.surface}</td>
                      <td className="px-3 py-3 text-zinc-300">{record.length}m</td>
                      <td className="px-3 py-3 text-zinc-300">{record.packing_date}</td>
                      <BadgeCell enabled={record.premium_enabled} color="emerald" />
                      <BadgeCell enabled={record.nonbrand_enabled} color="blue" />
                      <BadgeCell enabled={record.weightbar_enabled} color="purple" />
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => editPendingRecord(record)}
                            className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-blue-400 transition hover:border-blue-500 hover:text-blue-300">
                            Edit
                          </button>
                          <button onClick={() => handleDeletePending(record)}
                            className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-red-400 transition hover:border-red-500 hover:text-red-300">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-6 py-4">
              <p className="flex items-center gap-2 text-sm text-emerald-300">
                <CheckIcon />{pendingRecords.length} record(s) ready to submit
              </p>
              <button onClick={handleFinalSubmit} disabled={loading}
                className={`${glassBtnPrimary} flex items-center gap-2`}>
                <CheckIcon />{loading ? "Submitting…" : "Final Submit"}
              </button>
            </div>
          </div>
        )}

        {/* ── Recent Submitted Records ── */}
        <div className={`mt-6 overflow-hidden ${glassCard}`}>
          {/* Section header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-6 py-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Recent Submitted Records</h2>
              {recentData.length > 0 && (
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                  {recentData.length} record{recentData.length !== 1 ? "s" : ""} · last 3 days
                </span>
              )}
            </div>
            <button onClick={loadRecent}
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm transition hover:border-emerald-400 hover:text-emerald-300">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              Refresh
            </button>
          </div>

          {recentData.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-white/5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" className="text-zinc-600">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <path d="M9 12h6M9 16h4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-500">No submitted records</p>
              <p className="text-xs text-zinc-600">Records from the last 3 days will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                    <th className="px-3 py-3">Profile</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Surface</th>
                    <th className="px-3 py-3">Length</th>
                    <th className="px-3 py-3">Prod Date</th>
                    <th className="px-3 py-3">Pack Date</th>
                    <th className="px-3 py-3">Premium</th>
                    <th className="px-3 py-3">Non-Brand</th>
                    <th className="px-3 py-3">Weight Bar</th>
                    <th className="px-3 py-3">Operator</th>
                    <th className="px-3 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentData.map((row, idx) => (
                    <tr key={row.id}
                      className={`border-b border-white/5 transition hover:bg-white/5 ${idx % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                      <td className="px-3 py-3">
                        <span className="font-bold text-emerald-400">{row.profile}</span>
                      </td>
                      <td className="px-3 py-3 text-zinc-300">{row.production_type}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.surface}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.length}m</td>
                      <td className="px-3 py-3 text-zinc-400 text-xs">{row.production_date}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.packing_date}</td>
                      <BadgeCell enabled={row.premium_enabled} color="emerald" />
                      <BadgeCell enabled={row.nonbrand_enabled} color="blue" />
                      <BadgeCell enabled={row.weightbar_enabled} color="purple" />
                      <td className="px-3 py-3 text-xs text-zinc-500">
                        {row.operator ?? "—"}
                      </td>
                      {/* Actions */}
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit */}
                          <button
                            onClick={() => editRecentRecord(row)}
                            title="Edit record"
                            className="group flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-blue-400 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-300"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2"
                              className="transition group-hover:scale-110">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => confirmDeleteRecent(row)}
                            title="Delete record"
                            className="group flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-300"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2"
                              className="transition group-hover:scale-110">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className={`my-8 w-full max-w-2xl overflow-hidden ${glassCard}`}
                onClick={(e) => e.stopPropagation()}>

                {/* Modal header */}
                <div className="sticky top-0 z-10 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-6 py-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-emerald-400">
                      {editingPendingId ? "Edit Pending Record"
                        : editingRecentId ? "Edit Submitted Record"
                          : "New Packing Record"}
                    </h3>
                    <button onClick={closeModal} aria-label="Close"
                      className="rounded p-1 text-zinc-400 transition hover:text-white">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Modal body */}
                <div className="max-h-[80vh] overflow-y-auto p-6 space-y-4">
                  {/* Dates */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Production Date">
                      <input type="date" value={form.prodDate}
                        onChange={(e) => setField("prodDate", e.target.value)}
                        required className={glassInput} />
                    </Field>
                    <Field label="Packing Date">
                      <input type="date" value={form.packDate}
                        onChange={(e) => setField("packDate", e.target.value)}
                        required className={glassInput} />
                    </Field>
                  </div>

                  {/* Length + Type */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Length">
                      <input type="number" step="0.01" value={form.length}
                        onChange={(e) => setField("length", e.target.value)}
                        placeholder="0.00" required className={glassInput} />
                    </Field>
                    <Field label="Production Type">
                      <select value={form.prodType}
                        onChange={(e) => setField("prodType", e.target.value)}
                        required className={glassInput}>
                        <option value="" disabled>Select</option>
                        {PROD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                  </div>

                  {/* Profile autocomplete */}
                  <Field label="Profile">
                    <div ref={profileRef} className="relative">
                      <input type="text" value={profileSearch}
                        onChange={(e) => {
                          setProfileSearch(e.target.value);
                          setField("profile", e.target.value);
                          setShowProfileDropdown(true);
                        }}
                        onFocus={() => setShowProfileDropdown(true)}
                        placeholder="Search profile…" autoComplete="off"
                        required className={glassInput} />
                      {showProfileDropdown && filteredProfiles.length > 0 && (
                        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl">
                          {filteredProfiles.map((p) => (
                            <li key={p}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setField("profile", p);
                                setProfileSearch(p);
                                setShowProfileDropdown(false);
                              }}
                              className="cursor-pointer border-b border-zinc-900 px-3 py-2 text-sm text-zinc-300 hover:bg-emerald-500/20 hover:text-emerald-300">
                              {p}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Field>

                  {/* Surface */}
                  <Field label="Surface">
                    <select value={form.surface}
                      onChange={(e) => setField("surface", e.target.value)}
                      required className={glassInput}>
                      <option value="" disabled>Select</option>
                      {SURFACES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>

                  {/* ── Packing sections ── */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Packing Configuration
                    </p>

                    {/* Premium */}
                    <SectionToggle label="Premium Full Pack" checked={flags.premiumEnabled}
                      onChange={(v) => setFlag("premiumEnabled", v)}>
                      <div className="mt-2 space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <Field label="Pack No">
                          <input type="text" value={form.premiumPackNo}
                            onChange={(e) => setField("premiumPackNo", numericOnly(e.target.value))}
                            className={`${glassInput} py-2`} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="One Bundle Qty">
                            <input type="number" value={form.premiumOneQty}
                              onChange={(e) => setField("premiumOneQty", e.target.value)}
                              className={`${glassInput} py-2`} />
                          </Field>
                          <Field label="Total Bundles">
                            <input type="number" value={form.premiumTotalBundle}
                              onChange={(e) => setField("premiumTotalBundle", e.target.value)}
                              className={`${glassInput} py-2`} />
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Total Qty">
                            <input type="number" value={calcPremiumTotal()} readOnly
                              className={`${glassInput} bg-black/40 py-2`} />
                          </Field>
                          <Field label="Avg Weight">
                            <input type="number" step="0.001" value={form.premiumAvgWeight}
                              onChange={(e) => setField("premiumAvgWeight", e.target.value)}
                              className={`${glassInput} py-2`} />
                          </Field>
                        </div>
                        <label className="flex cursor-pointer items-center gap-2 border-t border-emerald-500/10 pt-2">
                          <input type="checkbox" checked={flags.premiumPcsEnabled}
                            onChange={(e) => setFlag("premiumPcsEnabled", e.target.checked)}
                            className="h-4 w-4 rounded accent-purple-500" />
                          <span className="text-[11px] font-black uppercase text-zinc-500">Premium Pcs Details</span>
                        </label>
                        {flags.premiumPcsEnabled && (
                          <div className="space-y-2 rounded-xl border border-white/5 bg-black/20 p-3">
                            <Field label="Pcs Pack No">
                              <input type="text" value={form.premiumPcsPackNo}
                                onChange={(e) => setField("premiumPcsPackNo", numericOnly(e.target.value, true))}
                                className={`${glassInput} py-1.5 text-xs`} />
                            </Field>
                            <div className="grid grid-cols-3 gap-2">
                              <Field label="Bundle Qty">
                                <input type="number" value={form.premiumPcsOneQty}
                                  onChange={(e) => setField("premiumPcsOneQty", e.target.value)}
                                  className={`${glassInput} py-1.5 text-xs`} />
                              </Field>
                              <Field label="Total Qty">
                                <input type="number" value={form.premiumPcsTotalQty}
                                  onChange={(e) => setField("premiumPcsTotalQty", e.target.value)}
                                  className={`${glassInput} py-1.5 text-xs`} />
                              </Field>
                              <Field label="Avg Weight">
                                <input type="number" step="0.001" value={form.premiumPcsAvgWeight}
                                  onChange={(e) => setField("premiumPcsAvgWeight", e.target.value)}
                                  className={`${glassInput} py-1.5 text-xs`} />
                              </Field>
                            </div>
                          </div>
                        )}
                      </div>
                    </SectionToggle>

                    {/* Non Brand */}
                    <SectionToggle label="Non Brand Full Pack" checked={flags.nonBrandEnabled}
                      onChange={(v) => setFlag("nonBrandEnabled", v)}
                      borderHover="hover:border-white/30">
                      <div className="mt-2 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <Field label="Pack No">
                          <input type="text" value={form.nonBrandPackNo}
                            onChange={(e) => setField("nonBrandPackNo", numericOnly(e.target.value))}
                            className={`${glassInput} py-2`} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="One Bundle Qty">
                            <input type="number" value={form.nonBrandOneQty}
                              onChange={(e) => setField("nonBrandOneQty", e.target.value)}
                              className={`${glassInput} py-2`} />
                          </Field>
                          <Field label="Total Bundles">
                            <input type="number" value={form.nonBrandTotalBundle}
                              onChange={(e) => setField("nonBrandTotalBundle", e.target.value)}
                              className={`${glassInput} py-2`} />
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Total Qty">
                            <input type="number" value={calcNonBrandTotal()} readOnly
                              className={`${glassInput} bg-black/40 py-2`} />
                          </Field>
                          <Field label="Avg Weight">
                            <input type="number" step="0.001" value={form.nonBrandAvgWeight}
                              onChange={(e) => setField("nonBrandAvgWeight", e.target.value)}
                              className={`${glassInput} py-2`} />
                          </Field>
                        </div>
                        <label className="flex cursor-pointer items-center gap-2 border-t border-white/10 pt-2">
                          <input type="checkbox" checked={flags.nonBrandPcsEnabled}
                            onChange={(e) => setFlag("nonBrandPcsEnabled", e.target.checked)}
                            className="h-4 w-4 rounded accent-purple-500" />
                          <span className="text-[11px] font-black uppercase text-zinc-500">Non Brand Pcs Details</span>
                        </label>
                        {flags.nonBrandPcsEnabled && (
                          <div className="space-y-2 rounded-xl border border-white/5 bg-black/20 p-3">
                            <Field label="Pcs Pack No">
                              <input type="text" value={form.nonBrandPcsPackNo}
                                onChange={(e) => setField("nonBrandPcsPackNo", numericOnly(e.target.value, true))}
                                className={`${glassInput} py-1.5 text-xs`} />
                            </Field>
                            <div className="grid grid-cols-3 gap-2">
                              <Field label="Bundle Qty">
                                <input type="number" value={form.nonBrandPcsOneQty}
                                  onChange={(e) => setField("nonBrandPcsOneQty", e.target.value)}
                                  className={`${glassInput} py-1.5 text-xs`} />
                              </Field>
                              <Field label="Total Qty">
                                <input type="number" value={form.nonBrandPcsTotalQty}
                                  onChange={(e) => setField("nonBrandPcsTotalQty", e.target.value)}
                                  className={`${glassInput} py-1.5 text-xs`} />
                              </Field>
                              <Field label="Avg Weight">
                                <input type="number" step="0.001" value={form.nonBrandPcsAvgWeight}
                                  onChange={(e) => setField("nonBrandPcsAvgWeight", e.target.value)}
                                  className={`${glassInput} py-1.5 text-xs`} />
                              </Field>
                            </div>
                          </div>
                        )}
                      </div>
                    </SectionToggle>

                    {/* Weight Bar */}
                    <SectionToggle label="Weight Bar Pack" checked={flags.weightBarEnabled}
                      onChange={(v) => setFlag("weightBarEnabled", v)}
                      accentClass="accent-blue-500" borderHover="hover:border-blue-500/30">
                      <div className="mt-2 space-y-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                        <Field label="Pack No">
                          <input type="text" value={form.weightBarPackNo}
                            onChange={(e) => setField("weightBarPackNo", numericOnly(e.target.value))}
                            className={`${glassInput} py-2`} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Bundle Qty">
                            <input type="number" value={form.weightBarBundleQty}
                              onChange={(e) => setField("weightBarBundleQty", e.target.value)}
                              className={`${glassInput} py-2`} />
                          </Field>
                          <Field label="Avg Weight">
                            <input type="number" step="0.001" value={form.weightBarAvgWeight}
                              onChange={(e) => setField("weightBarAvgWeight", e.target.value)}
                              className={`${glassInput} py-2`} />
                          </Field>
                        </div>
                      </div>
                    </SectionToggle>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-6 flex gap-3">
                    <button type="button" onClick={closeModal}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold uppercase text-zinc-300 backdrop-blur-sm transition hover:border-emerald-400 hover:text-emerald-300">
                      Cancel
                    </button>
                    {editingRecentId !== null ? (
                      <button type="button" onClick={handleUpdateRecent} disabled={loading}
                        className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3.5 text-sm font-black uppercase text-black shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 disabled:opacity-50">
                        {loading ? "Updating…" : "Update Record"}
                      </button>
                    ) : (
                      <button type="button" onClick={handleAddToPending} disabled={loading}
                        className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3.5 text-sm font-black uppercase text-black shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 disabled:opacity-50">
                        {loading ? "Saving…" : editingPendingId ? "Update Pending" : "Add to Pending"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <DeleteConfirmModal
          record={deleteTarget}
          onConfirm={handleDeleteRecent}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {showCloudSync && <CloudSync />}

      {/* ── Success overlay ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 backdrop-blur-xl">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center shadow-2xl backdrop-blur-2xl">
            <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-emerald-500/20">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">{successMessage}</h2>
            <p className="mt-2 text-sm text-zinc-400">Data synced to database successfully</p>
          </div>
        </div>
      )}
    </div>
  );
}
