"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SlideMenu } from "@/components/SlideMenu";
import { MenuButton } from "@/components/MenuButton";
import { useAuth } from "@/context/AuthContext";
import { menuStructure } from "@/lib/menu";
import { supabase } from "@/lib/supabase";

type PowderCoatRecord = {
  id: number;
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
  damage_quantity: string | null;
  operator: string | null;
  created_at: string;
};

type WoodFinishRecord = {
  id: number;
  base_colour_date: string;
  wood_finish_date: string;
  profile: string;
  surface: string;
  length: string;
  quantity: string;
  is_damage: boolean;
  damage_quantity: string | null;
  operator: string | null;
  created_at: string;
};

type PackingRecord = {
  id: number;
  production_date: string;
  packing_date: string;
  bucket_no: string;
  profile: string;
  length: string;
  production_type: string;
  colour: string;
  re_powder_qty: string | null;
  premium_enabled: boolean;
  premium_pack_no: string | null;
  premium_one_qty: string | null;
  premium_total_bundles: string | null;
  premium_total_qty: string | null;
  premium_avg_weight: string | null;
  premium_pcs_enabled: boolean;
  premium_pcs_pack_no: string | null;
  premium_pcs_one_qty: string | null;
  premium_pcs_total_qty: string | null;
  premium_pcs_avg_weight: string | null;
  nonbrand_enabled: boolean;
  nonbrand_pack_no: string | null;
  nonbrand_one_qty: string | null;
  nonbrand_total_bundles: string | null;
  nonbrand_total_qty: string | null;
  nonbrand_avg_weight: string | null;
  nonbrand_pcs_enabled: boolean;
  nonbrand_pcs_pack_no: string | null;
  nonbrand_pcs_one_qty: string | null;
  nonbrand_pcs_total_qty: string | null;
  nonbrand_pcs_avg_weight: string | null;
  weightbar_enabled: boolean;
  weightbar_pack_no: string | null;
  weightbar_one_qty: string | null;
  weightbar_avg_weight: string | null;
  operator: string | null;
  created_at: string;
};

type WoodFinishPackingRecord = {
  id: number;
  wood_prod_date: string;
  packing_date: string;
  wood_finish_type: string;
  profile: string;
  length: string;
  main_pack_no: string | null;
  main_one_qty: string | null;
  main_total_bundle: string | null;
  main_total_qty: string | null;
  main_avg_weight: string | null;
  pcs_enabled: boolean;
  pcs_pack_no: string | null;
  pcs_one_qty: string | null;
  pcs_total_qty: string | null;
  pcs_avg_weight: string | null;
  operator: string | null;
  created_at: string;
};

const BUTTONS = [
  { label: "Powder Coat Production", slug: "powder-coat-production", description: "Electrostatic powder application and curing", icon: "M12 2v20 M2 12h20", color: "from-pink-500 to-rose-500" },
  { label: "Wood Finish Production", slug: "wood-finish-production", description: "Sublimation and wood-effect powder line", icon: "M4 4h16v16H4z M4 12h16", color: "from-purple-500 to-indigo-500" },
  { label: "Powder Coat Packing", slug: "powder-coat-packing", description: "Pallet building and dispatch for powder coat", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z", color: "from-emerald-500 to-green-500" },
  { label: "Wood Finish Packing", slug: "wood-finish-packing", description: "Pallet building and dispatch for wood finish", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z", color: "from-amber-500 to-orange-500" },
];

export default function PowderCoatOverview() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [powderCoatData, setPowderCoatData] = useState<PowderCoatRecord[]>([]);
  const [woodFinishData, setWoodFinishData] = useState<WoodFinishRecord[]>([]);
  const [powderCoatPackingData, setPowderCoatPackingData] = useState<PackingRecord[]>([]);
  const [woodFinishPackingData, setWoodFinishPackingData] = useState<WoodFinishPackingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  useEffect(() => { if (activeReport) loadReportData(); }, [selectedDate, activeReport]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      if (activeReport === "powder-coat-production") {
        const { data } = await supabase.from("powder_coat_production").select("*").eq("powder_coat_date", selectedDate).order("created_at", { ascending: false });
        setPowderCoatData(data || []);
      } else if (activeReport === "wood-finish-production") {
        const { data } = await supabase.from("wood_finish_production").select("*").eq("wood_finish_date", selectedDate).order("created_at", { ascending: false });
        setWoodFinishData(data || []);
      } else if (activeReport === "powder-coat-packing") {
        const { data } = await supabase.from("powder_coat_packing").select("*").eq("packing_date", selectedDate).order("created_at", { ascending: false });
        setPowderCoatPackingData(data || []);
      } else if (activeReport === "wood-finish-packing") {
        const { data } = await supabase.from("wood_finish_packing").select("*").eq("packing_date", selectedDate).order("created_at", { ascending: false });
        setWoodFinishPackingData(data || []);
      }
    } catch (err) { console.error("Error loading data:", err); }
    finally { setLoading(false); }
  };

  const handleButtonClick = (slug: string) => { setActiveReport(slug); };
  const handleBack = () => { setActiveReport(null); setPowderCoatData([]); setWoodFinishData([]); setPowderCoatPackingData([]); setWoodFinishPackingData([]); setSelectedRecord(null); };

  const glassCard = "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl";
  const glassInput = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-pink-500 backdrop-blur-sm transition-colors";

  if (!activeReport) {
    return (
      <div className="min-h-screen text-zinc-100">
        <SlideMenu nodes={menuStructure} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <header className="border-b border-zinc-800">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <MenuButton onClick={() => setMenuOpen(true)} />
              <Link href="/home" className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 font-bold text-white shadow-lg shadow-pink-500/20">U</div>
                <div><p className="text-sm font-semibold tracking-wide text-white">Ultra Aluminum</p><p className="text-xs text-zinc-500">Pvt Ltd</p></div>
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
            <span className="text-pink-300">Overview</span>
          </nav>
          <div className={`mt-4 overflow-hidden p-8 ${glassCard}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400" />
                Powder Coat Department
              </div>
              <h1 className="mt-3 text-3xl font-bold text-white">Overview Reports</h1>
              <h3 className="mt-2 text-lg text-pink-400">Select a module to view its report</h3>
            </div>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BUTTONS.map((btn) => (
              <button key={btn.slug} onClick={() => handleButtonClick(btn.slug)} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-left shadow-2xl backdrop-blur-xl transition hover:border-pink-500/60 hover:bg-white/10 hover:shadow-pink-500/10 hover:-translate-y-1">
                <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${btn.color} opacity-10 blur-2xl transition group-hover:opacity-30`} />
                <div className="relative">
                  <div className={`mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br ${btn.color} shadow-lg`}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={btn.icon} /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-pink-300">{btn.label}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{btn.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Click to view report</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500 group-hover:text-pink-400"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-zinc-100">
      <SlideMenu nodes={menuStructure} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <MenuButton onClick={() => setMenuOpen(true)} />
            <Link href="/home" className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 font-bold text-white shadow-lg shadow-pink-500/20">U</div>
              <div><p className="text-sm font-semibold tracking-wide text-white">Ultra Aluminum</p><p className="text-xs text-zinc-500">Pvt Ltd</p></div>
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
          <button onClick={handleBack} className="hover:text-zinc-300">Overview</button>
          <span className="text-zinc-700">/</span>
          <span className="text-pink-300">{BUTTONS.find((b) => b.slug === activeReport)?.label}</span>
        </nav>
        <div className={`mt-4 overflow-hidden p-6 ${glassCard}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:border-pink-400 hover:text-pink-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </button>
              <div><h1 className="text-2xl font-bold text-white">{BUTTONS.find((b) => b.slug === activeReport)?.label} Report</h1><p className="text-sm text-zinc-400">View data for selected date</p></div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-zinc-300">Date:</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={glassInput} />
              <button onClick={loadReportData} disabled={loading} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 backdrop-blur-sm transition hover:border-pink-400 hover:text-pink-300 disabled:opacity-50">{loading ? "Loading..." : "↻ Refresh"}</button>
            </div>
          </div>
        </div>

        {/* Powder Coat Production Table */}
        {activeReport === "powder-coat-production" && (
          <div className={`mt-6 overflow-hidden ${glassCard}`}>
            <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-rose-500/10 px-6 py-3"><h2 className="text-lg font-semibold text-white">Powder Coat Production — {selectedDate}</h2></div>
            {loading ? <div className="p-8 text-center text-zinc-500">Loading...</div> : powderCoatData.length === 0 ? <div className="p-8 text-center text-zinc-500">No records found for {selectedDate}.</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                    <th className="px-3 py-3">Extrusion Date</th><th className="px-3 py-3">Powder Coat Date</th><th className="px-3 py-3">Bucket No</th><th className="px-3 py-3">Billet No</th><th className="px-3 py-3">Die No</th><th className="px-3 py-3">Profile</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Length (m)</th><th className="px-3 py-3">Qty</th><th className="px-3 py-3">Colour</th><th className="px-3 py-3">Damage Qty</th><th className="px-3 py-3">Operator</th>
                  </tr></thead>
                  <tbody>{powderCoatData.map((row) => (
                    <tr key={row.id} onClick={() => setSelectedRecord(row)} className="border-b border-white/5 transition hover:bg-white/5 cursor-pointer">
                      <td className="px-3 py-3 text-zinc-300">{row.extrusion_date}</td><td className="px-3 py-3 text-zinc-300">{row.powder_coat_date}</td><td className="px-3 py-3 font-bold text-pink-400">{row.bucket_no}</td><td className="px-3 py-3 text-zinc-300">{row.billet_no}</td><td className="px-3 py-3 text-zinc-300">{row.die_no}</td><td className="px-3 py-3 text-zinc-300">{row.profile}</td><td className="px-3 py-3 text-zinc-300">{row.type}</td><td className="px-3 py-3 text-zinc-300">{row.length}m</td><td className="px-3 py-3 text-zinc-300">{row.quantity}</td><td className="px-3 py-3 text-zinc-300">{row.colour}</td>
                      <td className="px-3 py-3">{row.damage_quantity && parseInt(row.damage_quantity) > 0 ? <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">{row.damage_quantity}</span> : <span className="text-zinc-600">—</span>}</td>
                      <td className="px-3 py-3 text-zinc-400 text-xs">{row.operator || "—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Wood Finish Production Table */}
        {activeReport === "wood-finish-production" && (
          <div className={`mt-6 overflow-hidden ${glassCard}`}>
            <div className="border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 px-6 py-3"><h2 className="text-lg font-semibold text-white">Wood Finish Production — {selectedDate}</h2></div>
            {loading ? <div className="p-8 text-center text-zinc-500">Loading...</div> : woodFinishData.length === 0 ? <div className="p-8 text-center text-zinc-500">No records found for {selectedDate}.</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                    <th className="px-4 py-3">Base Colour Date</th><th className="px-4 py-3">Wood Finish Date</th><th className="px-4 py-3">Profile</th><th className="px-4 py-3">Surface</th><th className="px-4 py-3">Length (m)</th><th className="px-4 py-3">Quantity</th><th className="px-4 py-3">Damage</th><th className="px-4 py-3">Damage Qty</th><th className="px-4 py-3">Operator</th>
                  </tr></thead>
                  <tbody>{woodFinishData.map((row) => (
                    <tr key={row.id} onClick={() => setSelectedRecord(row)} className="border-b border-white/5 transition hover:bg-white/5 cursor-pointer">
                      <td className="px-4 py-3 text-zinc-300">{row.base_colour_date}</td><td className="px-4 py-3 text-zinc-300">{row.wood_finish_date}</td><td className="px-4 py-3 font-bold text-purple-400">{row.profile}</td><td className="px-4 py-3 text-zinc-300">{row.surface}</td><td className="px-4 py-3 text-zinc-300">{row.length}m</td><td className="px-4 py-3 text-zinc-300">{row.quantity}</td>
                      <td className="px-4 py-3">{row.is_damage ? <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">Yes</span> : <span className="text-zinc-600">—</span>}</td>
                      <td className="px-4 py-3">{row.damage_quantity && parseInt(row.damage_quantity) > 0 ? <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">{row.damage_quantity}</span> : <span className="text-zinc-600">—</span>}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{row.operator || "—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Powder Coat Packing Table */}
        {activeReport === "powder-coat-packing" && (
          <div className={`mt-6 overflow-hidden ${glassCard}`}>
            <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-6 py-3"><h2 className="text-lg font-semibold text-white">Powder Coat Packing — {selectedDate}</h2></div>
            {loading ? <div className="p-8 text-center text-zinc-500">Loading...</div> : powderCoatPackingData.length === 0 ? <div className="p-8 text-center text-zinc-500">No records found for {selectedDate}.</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                    <th className="px-3 py-3">Production Date</th><th className="px-3 py-3">Packing Date</th><th className="px-3 py-3">Bucket No</th><th className="px-3 py-3">Profile</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Colour</th><th className="px-3 py-3">Length (m)</th><th className="px-3 py-3">Re-Powder Qty</th><th className="px-3 py-3">Premium</th><th className="px-3 py-3">Premium Pack</th><th className="px-3 py-3">Premium Pcs</th><th className="px-3 py-3">Non-Brand</th><th className="px-3 py-3">Non-Brand Pcs</th><th className="px-3 py-3">Weight Bar</th><th className="px-3 py-3">Operator</th>
                  </tr></thead>
                  <tbody>{powderCoatPackingData.map((row) => (
                    <tr key={row.id} onClick={() => setSelectedRecord(row)} className="border-b border-white/5 transition hover:bg-white/5 cursor-pointer">
                      <td className="px-3 py-3 text-zinc-300">{row.production_date}</td><td className="px-3 py-3 text-zinc-300">{row.packing_date}</td><td className="px-3 py-3 font-bold text-emerald-400">{row.bucket_no}</td><td className="px-3 py-3 text-zinc-300">{row.profile}</td><td className="px-3 py-3 text-zinc-300">{row.production_type}</td><td className="px-3 py-3 text-zinc-300">{row.colour}</td><td className="px-3 py-3 text-zinc-300">{row.length}m</td><td className="px-3 py-3 text-zinc-300">{row.re_powder_qty || "—"}</td>
                      <td className="px-3 py-3 text-zinc-400 text-xs">{row.premium_enabled ? <div className="space-y-0.5"><div className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300 inline-block">Yes</div>{row.premium_pack_no && <div className="text-[10px] text-zinc-500">Pack: {row.premium_pack_no}</div>}</div> : <span className="text-zinc-600">—</span>}</td>
                      <td className="px-3 py-3 text-zinc-400 text-xs">{row.premium_enabled ? <div className="space-y-0.5">{row.premium_one_qty && row.premium_total_bundles && <div>1×{row.premium_one_qty}×{row.premium_total_bundles}</div>}{row.premium_total_qty && <div className="text-emerald-400">Total: {row.premium_total_qty}</div>}{row.premium_avg_weight && <div className="text-zinc-500">Avg: {row.premium_avg_weight}kg</div>}</div> : "—"}</td>
                      <td className="px-3 py-3 text-zinc-400 text-xs">{row.premium_enabled ? <div className="space-y-0.5">{row.premium_pcs_pack_no && <div>Pack: {row.premium_pcs_pack_no}</div>}{row.premium_pcs_one_qty && <div>1×{row.premium_pcs_one_qty}</div>}{row.premium_pcs_total_qty && <div className="text-purple-300">Total: {row.premium_pcs_total_qty}</div>}{row.premium_pcs_avg_weight && <div className="text-zinc-500">Avg: {row.premium_pcs_avg_weight}kg</div>}</div> : "—"}</td>
                      <td className="px-3 py-3">{row.nonbrand_enabled ? <div className="space-y-0.5"><div className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300 inline-block">Yes</div>{row.nonbrand_pack_no && <div className="text-[10px] text-zinc-500">Pack: {row.nonbrand_pack_no}</div>}</div> : <span className="text-zinc-600">—</span>}</td>
                      <td className="px-3 py-3 text-zinc-400 text-xs">{row.nonbrand_enabled ? <div className="space-y-0.5">{row.nonbrand_one_qty && row.nonbrand_total_bundles && <div>1×{row.nonbrand_one_qty}×{row.nonbrand_total_bundles}</div>}{row.nonbrand_total_qty && <div className="text-blue-400">Total: {row.nonbrand_total_qty}</div>}{row.nonbrand_avg_weight && <div className="text-zinc-500">Avg: {row.nonbrand_avg_weight}kg</div>}</div> : "—"}</td>
                      <td className="px-3 py-3">{row.nonbrand_pcs_enabled ? <div className="space-y-0.5">{row.nonbrand_pcs_pack_no && <div>Pack: {row.nonbrand_pcs_pack_no}</div>}{row.nonbrand_pcs_one_qty && <div>1×{row.nonbrand_pcs_one_qty}</div>}{row.nonbrand_pcs_total_qty && <div className="text-blue-300">Total: {row.nonbrand_pcs_total_qty}</div>}{row.nonbrand_pcs_avg_weight && <div className="text-zinc-500">Avg: {row.nonbrand_pcs_avg_weight}kg</div>}</div> : <span className="text-zinc-600">—</span>}</td>
                      <td className="px-3 py-3">{row.weightbar_enabled ? <div className="space-y-0.5"><div className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300 inline-block">Yes</div>{row.weightbar_pack_no && <div className="text-[10px] text-zinc-500">Pack: {row.weightbar_pack_no}</div>}</div> : <span className="text-zinc-600">—</span>}{row.weightbar_enabled && row.weightbar_avg_weight && <div className="text-[10px] text-purple-300">Avg: {row.weightbar_avg_weight}kg</div>}</td>
                      <td className="px-3 py-3 text-zinc-400 text-xs">{row.operator || "—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Wood Finish Packing Table */}
        {activeReport === "wood-finish-packing" && (
          <div className={`mt-6 overflow-hidden ${glassCard}`}>
            <div className="border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-6 py-3"><h2 className="text-lg font-semibold text-white">Wood Finish Packing — {selectedDate}</h2></div>
            {loading ? <div className="p-8 text-center text-zinc-500">Loading...</div> : woodFinishPackingData.length === 0 ? <div className="p-8 text-center text-zinc-500">No records found for {selectedDate}.</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                    <th className="px-3 py-3">Wood Prod Date</th><th className="px-3 py-3">Packing Date</th><th className="px-3 py-3">Profile</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Length (m)</th><th className="px-3 py-3">Main Pack</th><th className="px-3 py-3">Main Qty</th><th className="px-3 py-3">Pcs</th><th className="px-3 py-3">Operator</th>
                  </tr></thead>
                  <tbody>{woodFinishPackingData.map((row) => (
                    <tr key={row.id} onClick={() => setSelectedRecord(row)} className="border-b border-white/5 transition hover:bg-white/5 cursor-pointer">
                      <td className="px-3 py-3 text-zinc-300">{row.wood_prod_date}</td><td className="px-3 py-3 text-zinc-300">{row.packing_date}</td><td className="px-3 py-3 font-bold text-amber-400">{row.profile}</td><td className="px-3 py-3 text-zinc-300">{row.wood_finish_type}</td><td className="px-3 py-3 text-zinc-300">{row.length}m</td>
                      <td className="px-3 py-3 text-zinc-400 text-xs">{row.main_pack_no ? <div className="space-y-0.5"><div>Pack: {row.main_pack_no}</div>{row.main_one_qty && row.main_total_bundle && <div>1×{row.main_one_qty}×{row.main_total_bundle}</div>}{row.main_avg_weight && <div className="text-zinc-500">Avg: {row.main_avg_weight}kg</div>}</div> : "—"}</td>
                      <td className="px-3 py-3">{row.main_total_qty ? <div className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300 inline-block font-bold">{row.main_total_qty}</div> : <span className="text-zinc-600">—</span>}</td>
                      <td className="px-3 py-3">{row.pcs_enabled ? <div className="space-y-0.5"><div className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300 inline-block">Yes</div>{row.pcs_pack_no && <div className="text-[10px] text-zinc-500">Pack: {row.pcs_pack_no}</div>}{row.pcs_one_qty && <div className="text-[10px] text-zinc-500">1×{row.pcs_one_qty}</div>}{row.pcs_total_qty && <div className="text-[10px] text-purple-300">Total: {row.pcs_total_qty}</div>}{row.pcs_avg_weight && <div className="text-[10px] text-zinc-500">Avg: {row.pcs_avg_weight}kg</div>}</div> : <span className="text-zinc-600">—</span>}</td>
                      <td className="px-3 py-3 text-zinc-400 text-xs">{row.operator || "—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Detail Popup */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedRecord(null)}>
            <div className={`w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl`} onClick={(e) => e.stopPropagation()}>
              <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Record Details</h3>
                  <button onClick={() => setSelectedRecord(null)} className="text-zinc-400 transition hover:text-white p-1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <div className="max-h-[80vh] overflow-y-auto p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.entries(selectedRecord).map(([key, value]) => (
                    value !== null && value !== undefined && value !== "" && key !== "submitted" && key !== "created_at" && (
                      <div key={key} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">{key.replace(/_/g, " ")}</p>
                        <p className="mt-1 text-sm text-zinc-100">{value.toString()}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
