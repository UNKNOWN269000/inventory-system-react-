"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SlideMenu } from "@/components/SlideMenu";
import { MenuButton } from "@/components/MenuButton";
import { useAuth } from "@/context/AuthContext";
import { menuStructure } from "@/lib/menu";
import { supabase } from "@/lib/supabase";
import { CloudSync } from "@/components/CloudSync";

type ProductionEntry = {
  id?: number;
  extrusion_date: string;
  powder_coat_date: string;
  bucket_no: string;
  billet_no: string;
  die_no: string;
  profile: string;
  type: string;
  length: string;
  quantity: string;
  colour: string;
  damage_quantity: string;
  is_damage: boolean;
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

export default function PowderCoatProduction() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showCloudSync, setShowCloudSync] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileSearch, setProfileSearch] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isDamage, setIsDamage] = useState(false);
  const [recentData, setRecentData] = useState<ProductionEntry[]>([]);
  const [pendingEntries, setPendingEntries] = useState<ProductionEntry[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    extrusionDate: "",
    powderCoatDate: "",
    bucketNo: "",
    billetNo: "",
    dieNo: "",
    profile: "",
    type: "",
    length: "",
    quantity: "",
    colour: "",
    damageQuantity: "",
  });

  useEffect(() => {
    loadRecentData();
  }, []);

  const loadRecentData = async () => {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgo.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("powder_coat_production")
        .select("*")
        .gte("powder_coat_date", threeDaysAgoStr)
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
    setForm({ ...form, extrusionDate: today, powderCoatDate: today });
    setProfileSearch("");
    setIsDamage(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({
      extrusionDate: "", powderCoatDate: "", bucketNo: "", billetNo: "",
      dieNo: "", profile: "", type: "", length: "", quantity: "",
      colour: "", damageQuantity: "",
    });
    setProfileSearch("");
    setIsDamage(false);
  };

  const handleSaveToPending = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDamage && !form.damageQuantity) {
      alert("Please enter damage quantity");
      return;
    }

    const pendingEntry: ProductionEntry = {
      extrusion_date: form.extrusionDate,
      powder_coat_date: form.powderCoatDate,
      bucket_no: form.bucketNo,
      billet_no: form.billetNo,
      die_no: form.dieNo,
      profile: form.profile,
      type: form.type,
      length: form.length,
      quantity: form.quantity,
      colour: form.colour,
      is_damage: isDamage,
      damage_quantity: isDamage ? form.damageQuantity : "",
      operator: user || "",
      submitted: false,
    };

    setPendingEntries([pendingEntry, ...pendingEntries]);
    closeModal();
  };

  const removePendingEntry = (index: number) => {
    setPendingEntries(pendingEntries.filter((_, i) => i !== index));
  };

  const editPendingEntry = (index: number) => {
    const entry = pendingEntries[index];
    setForm({
      extrusionDate: entry.extrusion_date,
      powderCoatDate: entry.powder_coat_date,
      bucketNo: entry.bucket_no,
      billetNo: entry.billet_no,
      dieNo: entry.die_no,
      profile: entry.profile,
      type: entry.type,
      length: entry.length,
      quantity: entry.quantity,
      colour: entry.colour,
      damageQuantity: entry.damage_quantity,
    });
    setIsDamage(entry.is_damage);
    setProfileSearch(entry.profile);
    setShowModal(true);
    setPendingEntries(pendingEntries.filter((_, i) => i !== index));
  };

  const editRecentEntry = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("powder_coat_production")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        setForm({
          extrusionDate: data.extrusion_date,
          powderCoatDate: data.powder_coat_date,
          bucketNo: data.bucket_no,
          billetNo: data.billet_no,
          dieNo: data.die_no,
          profile: data.profile,
          type: data.type,
          length: data.length,
          quantity: data.quantity,
          colour: data.colour,
          damageQuantity: data.damage_quantity,
        });
        setIsDamage(data.is_damage);
        setProfileSearch(data.profile);
        setShowModal(true);
        // After save, will update existing record
        setEditingId(id);
      }
    } catch (err: any) {
      console.error("Error loading entry:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentEditingId = editingId;
    if (!currentEditingId) return;

    setShowCloudSync(true);
    setLoading(true);

    try {
      const updateData = {
        extrusion_date: form.extrusionDate,
        powder_coat_date: form.powderCoatDate,
        bucket_no: form.bucketNo,
        billet_no: form.billetNo,
        die_no: form.dieNo,
        profile: form.profile,
        type: form.type,
        length: form.length,
        quantity: form.quantity,
        colour: form.colour,
        is_damage: isDamage,
        damage_quantity: isDamage ? form.damageQuantity : "",
      };

      const { error } = await supabase
        .from("powder_coat_production")
        .update(updateData)
        .eq("id", currentEditingId);

      if (error) throw error;

      await new Promise((resolve) => setTimeout(resolve, 2500));
      setShowCloudSync(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setEditingId(null);
        closeModal();
        loadRecentData();
      }, 2000);
    } catch (err: any) {
      console.error("Error updating:", err);
      alert(`Error: ${err.message}`);
      setShowCloudSync(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (pendingEntries.length === 0) {
      alert("No pending entries to submit");
      return;
    }

    setShowCloudSync(true);
    setLoading(true);

    try {
      const recordsToInsert = pendingEntries.map((entry) => ({
        ...entry,
        submitted: true,
      }));

      const { error } = await supabase
        .from("powder_coat_production")
        .insert(recordsToInsert);

      if (error) throw error;

      await new Promise((resolve) => setTimeout(resolve, 2500));
      setShowCloudSync(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setPendingEntries([]);
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
  const glassInput = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-pink-500 backdrop-blur-sm transition-colors";
  const glassBtnPrimary = "rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-pink-500/40 disabled:opacity-50";

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
          <Link href="/home/powder-coat" className="hover:text-zinc-300">Powder Coat</Link>
          <span className="text-zinc-700">/</span>
          <Link href="/home/powder-coat/production" className="hover:text-zinc-300">Production</Link>
          <span className="text-zinc-700">/</span>
          <span className="text-pink-300">Powder Coat</span>
        </nav>

        <div className={`mt-4 overflow-hidden p-8 ${glassCard}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400" />
                Production Module
              </div>
              <h1 className="mt-3 text-3xl font-bold text-white">Powder Coat Production</h1>
              <p className="text-sm text-zinc-400">Record powder coating production data</p>
            </div>
            <button onClick={openModal} className={glassBtnPrimary}>
              + Add Production
            </button>
          </div>
        </div>

        {pendingEntries.length > 0 && (
          <div className={`mt-6 overflow-hidden ${glassCard}`}>
            <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-400">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Pending Records</h2>
                  <p className="text-xs text-zinc-500">{pendingEntries.length} record(s) ready to submit</p>
                </div>
              </div>
              <button onClick={handleFinalSubmit} disabled={loading} className={glassBtnPrimary}>
                ✓ Final Submit All
              </button>
            </div>

            <div className="space-y-2 p-4">
              {pendingEntries.map((entry, index) => (
                <div key={index} className="rounded-lg border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-xl transition hover:border-pink-500/40 hover:bg-white/10">
                  <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">Bucket No</p>
                      <p className="mt-1 font-semibold text-pink-400">{entry.bucket_no}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">Profile</p>
                      <p className="mt-1 text-zinc-200">{entry.profile}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">Date / Type</p>
                      <p className="mt-1 text-zinc-200">{entry.powder_coat_date} / {entry.type}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">Colour</p>
                      <p className="mt-1 text-zinc-200">{entry.colour}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">Qty × Length</p>
                      <p className="mt-1 text-zinc-200">{entry.quantity} × {entry.length}m</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">Billet / Die</p>
                      <p className="mt-1 text-zinc-200">{entry.billet_no} / {entry.die_no}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">Damage</p>
                      <p className="mt-1">
                        {entry.is_damage ? (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">{entry.damage_quantity}</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-end gap-2">
                      <button onClick={() => editPendingEntry(index)} className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 transition hover:border-pink-500 hover:text-pink-300">
                        Edit
                      </button>
                      <button onClick={() => removePendingEntry(index)} className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-red-400 transition hover:border-red-500 hover:text-red-300">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`mt-6 overflow-hidden ${glassCard}`}>
          <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Production Records</h2>
            <button onClick={loadRecentData} className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm transition hover:border-pink-400 hover:text-pink-300">
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
                    <th className="px-3 py-3">Bucket No</th>
                    <th className="px-3 py-3">Extrusion Date</th>
                    <th className="px-3 py-3">Powder Coat Date</th>
                    <th className="px-3 py-3">Billet</th>
                    <th className="px-3 py-3">Die</th>
                    <th className="px-3 py-3">Profile</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Length</th>
                    <th className="px-3 py-3">Qty</th>
                    <th className="px-3 py-3">Colour</th>
                    <th className="px-3 py-3">Damage</th>
                    <th className="px-3 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentData.map((row) => (
                    <tr key={row.id} className="border-b border-white/5 transition hover:bg-white/5">
                      <td className="px-3 py-3 font-bold text-pink-400">{row.bucket_no}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.extrusion_date}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.powder_coat_date}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.billet_no}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.die_no}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.profile}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.type}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.length}m</td>
                      <td className="px-3 py-3 text-zinc-300">{row.quantity}</td>
                      <td className="px-3 py-3 text-zinc-300">{row.colour}</td>
                      <td className="px-3 py-3">
                        {row.is_damage ? (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">{row.damage_quantity}</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">
                      <button onClick={() => editRecentEntry(row.id!)} className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 transition hover:border-pink-500 hover:text-pink-300">
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
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className={`w-full max-w-2xl overflow-hidden my-8 ${glassCard}`}>
                <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v8M8 12h8" />
                      </svg>
                      Add Production
                    </h3>
                    <button onClick={closeModal} className="text-zinc-500 transition hover:text-white p-1">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <form onSubmit={editingId ? handleUpdateEntry : handleSaveToPending} className="max-h-[80vh] overflow-y-auto p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Extrusion Date</label>
                      <input type="date" value={form.extrusionDate} onChange={(e) => setForm({ ...form, extrusionDate: e.target.value })} required className={glassInput} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Powder Coat Date</label>
                      <input type="date" value={form.powderCoatDate} onChange={(e) => setForm({ ...form, powderCoatDate: e.target.value })} required className={glassInput} />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Bucket No</label>
                    <input type="text" value={form.bucketNo} onChange={(e) => setForm({ ...form, bucketNo: e.target.value })} placeholder="Enter Bucket Number" required className={glassInput} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Billet No</label>
                      <input type="text" value={form.billetNo} onChange={(e) => setForm({ ...form, billetNo: e.target.value })} placeholder="0000" required className={glassInput} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Die No</label>
                      <input type="number" value={form.dieNo} onChange={(e) => setForm({ ...form, dieNo: e.target.value })} placeholder="000" required className={glassInput} />
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
                              <div key={p} onClick={() => { setForm({ ...form, profile: p }); setProfileSearch(""); setShowProfileDropdown(false); }} className="cursor-pointer border-b border-zinc-900 px-3 py-2 text-sm text-zinc-300 hover:bg-pink-500/20 hover:text-pink-300">
                                {p}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required className={glassInput}>
                      <option value="" disabled>Select Type</option>
                      <option value="ULR">ULR</option>
                      <option value="PRM">PRM</option>
                      <option value="ULR PRM">ULR PRM</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Colour</label>
                    <select value={form.colour} onChange={(e) => setForm({ ...form, colour: e.target.value })} required className={glassInput}>
                      <option value="" disabled>Select Colour</option>
                      <option value="White">White</option>
                      <option value="Black">Black</option>
                      <option value="Gray">Gray</option>
                      <option value="Light Brown">Light Brown</option>
                      <option value="Dark Brown">Dark Brown</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex cursor-pointer items-center gap-3 group">
                      <input type="checkbox" checked={isDamage} onChange={(e) => setIsDamage(e.target.checked)} className="h-5 w-5 rounded border-white/10 bg-white/5 accent-pink-500" />
                      <span className="text-sm font-bold text-zinc-400 transition-colors group-hover:text-pink-400">Mark as Damage</span>
                    </label>
                  </div>

                  {isDamage && (
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400">Damage Quantity</label>
                      <input type="number" value={form.damageQuantity} onChange={(e) => setForm({ ...form, damageQuantity: e.target.value })} placeholder="Enter damage quantity" className="w-full rounded-lg border border-red-500/30 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-red-500 backdrop-blur-sm transition-colors shadow-[0_0_15px_rgba(239,68,68,0.1)]" required={isDamage} />
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <button type="button" onClick={closeModal} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-zinc-300 backdrop-blur-sm transition hover:border-pink-400 hover:text-pink-300">
                      Cancel
                    </button>
                    <button type="submit" className="flex-[2] rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-pink-500/40">
                      {editingId ? "Update Record" : "Add to Pending"}
                    </button>
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
            <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-green-500/20">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {pendingEntries.length > 0 ? `${pendingEntries.length} Records Submitted` : "Production Record Saved"}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">All data synced to database successfully</p>
          </div>
        </div>
      )}
    </div>
  );
}
