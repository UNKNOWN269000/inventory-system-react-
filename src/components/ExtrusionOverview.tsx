"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SlideMenu } from "@/components/SlideMenu";
import { MenuButton } from "@/components/MenuButton";
import { useAuth } from "@/context/AuthContext";
import { menuStructure } from "@/lib/menu";
import { supabase } from "@/lib/supabase";

type SurfaceData = {
  surface: string;
  count: number;
  total_weight: number;
  color: string;
};

type TypeData = {
  type: string;
  count: number;
  total_weight: number;
  color: string;
};

type BucketEntry = {
  id: number;
  bucket_no: string;
  ext_date: string;
  shift: string;
  profile: string;
  total_weight: string;
  batch_no: string;
  damage_qty: string | null;
  has_damage: boolean;
  created_at: string;
};

type ProfileEntry = {
  id: number;
  profile_no: string;
  ext_date: string;
  shift: string;
  profile: string;
  yield_percent: string;
  in_weight: string;
  out_weight: string;
  created_at: string;
};

type AgingEntry = {
  id: number;
  aging_date: string;
  total_weight: string;
  batch_in_time: string;
  batch_out_time: string;
  bucket_count: string;
  created_at: string;
};

const BUTTONS = [
  {
    label: "Bucket Income",
    slug: "bucket-income",
    description: "Record incoming buckets from suppliers",
    icon: "M3 3h18v18H3z M3 9h18 M9 21V9",
    color: "from-pink-500 to-rose-500",
  },
  {
    label: "Profile Income",
    slug: "profile-income",
    description: "Track finished extruded profiles",
    icon: "M4 4h16v16H4z M4 8h16 M8 20V8",
    color: "from-purple-500 to-indigo-500",
  },
  {
    label: "Aging Process",
    slug: "aging-process",
    description: "Heat treatment batch management",
    icon: "M12 2v20 M2 12h20 M5 5l14 14 M19 5L5 19",
    color: "from-orange-500 to-amber-500",
  },
  {
    label: "Damage",
    slug: "damage",
    description: "Record damaged bucket quantities",
    icon: "M12 9v4 M12 17h.01 M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
    color: "from-red-500 to-pink-500",
  },
];

export default function ExtrusionOverview() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [bucketData, setBucketData] = useState<BucketEntry[]>([]);
  const [profileData, setProfileData] = useState<ProfileEntry[]>([]);
  const [agingData, setAgingData] = useState<AgingEntry[]>([]);
  const [damageData, setDamageData] = useState<BucketEntry[]>([]);
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [surfaceData, setSurfaceData] = useState<SurfaceData[]>([]);
  const [typeData, setTypeData] = useState<TypeData[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    if (activeReport) {
      loadReportData();
    } else {
      loadSurfaceData();
      loadTypeData();
    }
  }, [selectedDate, activeReport]);

  const loadSurfaceData = async () => {
    setChartLoading(true);
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("bucket_income")
        .select("surface, total_weight")
        .gte("ext_date", monthStart)
        .lte("ext_date", monthEnd)
        .not("surface", "is", null);

      if (error) throw error;

      const grouped: { [key: string]: { count: number; total_weight: number } } = {};
      (data || []).forEach((row: any) => {
        const surface = row.surface || "Unknown";
        if (!grouped[surface]) {
          grouped[surface] = { count: 0, total_weight: 0 };
        }
        grouped[surface].count += 1;
        grouped[surface].total_weight += parseFloat(row.total_weight) || 0;
      });

      const colorMap: { [key: string]: string } = {
        "AN": "#ec4899",
        "PC": "#a855f7",
        "MF": "#f97316",
        "Lader MF": "#ef4444",
      };

      const chartData: SurfaceData[] = Object.entries(grouped).map(([surface, data], index) => ({
        surface,
        count: data.count,
        total_weight: data.total_weight,
        color: colorMap[surface] || `hsl(${index * 60}, 70%, 60%)`,
      }));

      setSurfaceData(chartData);
    } catch (err) {
      console.error("Error loading surface data:", err);
    } finally {
      setChartLoading(false);
    }
  };

  const loadTypeData = async () => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("bucket_income")
        .select("type, total_weight")
        .gte("ext_date", monthStart)
        .lte("ext_date", monthEnd)
        .not("type", "is", null);

      if (error) throw error;

      const grouped: { [key: string]: { count: number; total_weight: number } } = {};
      (data || []).forEach((row: any) => {
        const type = row.type || "Unknown";
        if (!grouped[type]) {
          grouped[type] = { count: 0, total_weight: 0 };
        }
        grouped[type].count += 1;
        grouped[type].total_weight += parseFloat(row.total_weight) || 0;
      });

      const colorMap: { [key: string]: string } = {
        "ULR": "#10b981",
        "PRM": "#3b82f6",
        "ULR PRM": "#8b5cf6",
      };

      const chartData: TypeData[] = Object.entries(grouped).map(([type, data], index) => ({
        type,
        count: data.count,
        total_weight: data.total_weight,
        color: colorMap[type] || `hsl(${index * 60 + 180}, 70%, 60%)`,
      }));

      setTypeData(chartData);
    } catch (err) {
      console.error("Error loading type data:", err);
    }
  };

  const loadReportData = async () => {
    setLoading(true);
    try {
      if (activeReport === "bucket-income" || activeReport === "damage") {
        const { data } = await supabase
          .from("bucket_income")
          .select("*")
          .eq("ext_date", selectedDate)
          .order("created_at", { ascending: false });

        if (activeReport === "damage") {
          setDamageData((data || []).filter((b: any) => b.has_damage && b.damage_qty && parseInt(b.damage_qty) > 0));
        } else {
          setBucketData(data || []);
        }
      }

      if (activeReport === "profile-income") {
        const { data } = await supabase
          .from("profile_income")
          .select("*")
          .eq("ext_date", selectedDate)
          .order("created_at", { ascending: false });
        setProfileData(data || []);
      }

      if (activeReport === "aging-process") {
        const { data } = await supabase
          .from("aging_process")
          .select("*")
          .eq("aging_date", selectedDate)
          .order("created_at", { ascending: false });
        setAgingData(data || []);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (slug: string) => {
    setActiveReport(slug);
  };

  const handleBack = () => {
    setActiveReport(null);
    setBucketData([]);
    setProfileData([]);
    setAgingData([]);
    setDamageData([]);
  };

  const glassCard = "rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl";

  // Show buttons view
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
            <Link href="/home/extrusion" className="hover:text-zinc-300">Extrusion</Link>
            <span className="text-zinc-700">/</span>
            <span className="text-pink-300">Overview</span>
          </nav>

          {/* Header */}
          <div className={`mt-4 overflow-hidden p-8 ${glassCard}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400" />
                Extrusion Department
              </div>
              <h1 className="mt-3 text-4xl font-bold text-white">Overview Reports</h1>
              <h3 className="mt-2 text-lg text-pink-400">Select a module to view its report</h3>
            </div>
          </div>

          {/* 4 Module Buttons */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BUTTONS.map((btn) => (
              <button
                key={btn.slug}
                onClick={() => handleButtonClick(btn.slug)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-left shadow-2xl backdrop-blur-xl transition hover:border-pink-500/60 hover:bg-white/10 hover:shadow-pink-500/10 hover:-translate-y-1"
              >
                <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${btn.color} opacity-10 blur-2xl transition group-hover:opacity-30`} />
                <div className="relative">
                  <div className={`mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br ${btn.color} shadow-lg`}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={btn.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-pink-300">{btn.label}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{btn.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Click to view report</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500 group-hover:text-pink-400">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Surface Distribution Chart */}
          {surfaceData.length > 0 && (
            <div className={`mt-8 overflow-hidden ${glassCard}`}>
              <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-3">
                <h2 className="text-lg font-semibold text-white">Surface Distribution — Current Month</h2>
                <p className="text-xs text-zinc-400">Bucket income grouped by surface type</p>
              </div>
              <div className="p-6">
                {chartLoading ? (
                  <div className="grid h-64 place-items-center">
                    <div className="text-center">
                      <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-pink-500/20 border-t-pink-500" />
                      <p className="text-sm text-zinc-500">Loading chart...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative h-48 w-48">
                      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                        {(() => {
                          const total = surfaceData.reduce((sum: number, d: SurfaceData) => sum + d.count, 0);
                          let cumulativePercent = 0;
                          return surfaceData.map((d, i) => {
                            const percent = (d.count / total) * 100;
                            const dashArray = `${percent} ${100 - percent}`;
                            const dashOffset = -cumulativePercent;
                            cumulativePercent += percent;
                            return (
                              <circle
                                key={i}
                                cx="18"
                                cy="18"
                                r="15.915"
                                fill="transparent"
                                stroke={d.color}
                                strokeWidth="3"
                                strokeDasharray={dashArray}
                                strokeDashoffset={dashOffset}
                                className="transition-all duration-500"
                              />
                            );
                          });
                        })()}
                      </svg>
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">{surfaceData.reduce((sum: number, d: SurfaceData) => sum + d.count, 0)}</p>
                          <p className="text-xs text-zinc-500">Total Buckets</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                      {surfaceData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-white">{d.surface}</p>
                            <p className="text-xs text-zinc-400">{d.count} buckets • {d.total_weight.toFixed(2)} kg</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Type Distribution Chart */}
          {typeData.length > 0 && (
            <div className={`mt-6 overflow-hidden ${glassCard}`}>
              <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-3">
                <h2 className="text-lg font-semibold text-white">Type Distribution — Current Month</h2>
                <p className="text-xs text-zinc-400">Bucket income grouped by material type</p>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative h-48 w-48">
                    <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                      {(() => {
                        const total = typeData.reduce((sum: number, d: TypeData) => sum + d.count, 0);
                        let cumulativePercent = 0;
                        return typeData.map((d, i) => {
                          const percent = (d.count / total) * 100;
                          const dashArray = `${percent} ${100 - percent}`;
                          const dashOffset = -cumulativePercent;
                          cumulativePercent += percent;
                          return (
                            <circle
                              key={i}
                              cx="18"
                              cy="18"
                              r="15.915"
                              fill="transparent"
                              stroke={d.color}
                              strokeWidth="3"
                              strokeDasharray={dashArray}
                              strokeDashoffset={dashOffset}
                              className="transition-all duration-500"
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{typeData.reduce((sum: number, d: TypeData) => sum + d.count, 0)}</p>
                        <p className="text-xs text-zinc-500">Total Buckets</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4">
                    {typeData.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <div className="text-left">
                          <p className="text-sm font-semibold text-white">{d.type}</p>
                          <p className="text-xs text-zinc-400">{d.count} buckets • {d.total_weight.toFixed(2)} kg</p>
                        </div>
                      </div>
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

  // Show report view (existing code remains the same)
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
          <Link href="/home/extrusion" className="hover:text-zinc-300">Extrusion</Link>
          <span className="text-zinc-700">/</span>
          <button onClick={handleBack} className="hover:text-zinc-300">Overview</button>
          <span className="text-zinc-700">/</span>
          <span className="text-pink-300">{BUTTONS.find((b) => b.slug === activeReport)?.label}</span>
        </nav>

        {/* Header with date and back */}
        <div className={`mt-4 overflow-hidden p-6 ${glassCard}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:border-pink-400 hover:text-pink-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{BUTTONS.find((b) => b.slug === activeReport)?.label} Report</h1>
                <p className="text-sm text-zinc-400">View data for selected date</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-zinc-300">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-pink-500 backdrop-blur-sm"
              />
              <button onClick={loadReportData} disabled={loading} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 backdrop-blur-sm transition hover:border-pink-400 hover:text-pink-300 disabled:opacity-50">
                {loading ? "Loading..." : "↻ Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Bucket Income Report */}
        {activeReport === "bucket-income" && (
          <div className={`mt-6 overflow-hidden ${glassCard}`}>
            <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-3">
              <h2 className="text-lg font-semibold text-white">Bucket Income — {selectedDate}</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-zinc-500">Loading…</div>
            ) : bucketData.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No bucket income records found for {selectedDate}.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                      <th className="px-4 py-3">Bucket No</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Shift</th>
                      <th className="px-4 py-3">Profile</th>
                      <th className="px-4 py-3">Batch No</th>
                      <th className="px-4 py-3">Weight (kg)</th>
                      <th className="px-4 py-3">Damage</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bucketData.map((row) => (
                      <tr key={row.id} className="border-b border-white/5 transition hover:bg-white/5">
                        <td className="px-4 py-3 font-semibold text-pink-400">{row.bucket_no}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.ext_date}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.shift}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.profile}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.batch_no}</td>
                        <td className="px-4 py-3 font-bold text-pink-400">{row.total_weight}</td>
                        <td className="px-4 py-3">
                          {row.has_damage ? (
                            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">{row.damage_qty || "Yes"}</span>
                          ) : (
                            <span className="text-zinc-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{row.created_at ? new Date(row.created_at).toLocaleTimeString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Profile Income Report */}
        {activeReport === "profile-income" && (
          <div className={`mt-6 overflow-hidden ${glassCard}`}>
            <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-3">
              <h2 className="text-lg font-semibold text-white">Profile Income — {selectedDate}</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-zinc-500">Loading…</div>
            ) : profileData.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No profile income records found for {selectedDate}.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                      <th className="px-4 py-3">Profile No</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Shift</th>
                      <th className="px-4 py-3">Profile</th>
                      <th className="px-4 py-3">In (kg)</th>
                      <th className="px-4 py-3">Out (kg)</th>
                      <th className="px-4 py-3">Yield (%)</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profileData.map((row) => (
                      <tr key={row.id} className="border-b border-white/5 transition hover:bg-white/5">
                        <td className="px-4 py-3 font-semibold text-pink-400">{row.profile_no}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.ext_date}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.shift}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.profile}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.in_weight}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.out_weight}</td>
                        <td className="px-4 py-3 font-bold text-pink-400">{row.yield_percent}%</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{row.created_at ? new Date(row.created_at).toLocaleTimeString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Aging Process Report */}
        {activeReport === "aging-process" && (
          <div className={`mt-6 overflow-hidden ${glassCard}`}>
            <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-3">
              <h2 className="text-lg font-semibold text-white">Aging Process — {selectedDate}</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-zinc-500">Loading…</div>
            ) : agingData.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No aging process records found for {selectedDate}.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                      <th className="px-4 py-3">Aging Date</th>
                      <th className="px-4 py-3">Bucket Count</th>
                      <th className="px-4 py-3">Total Weight (kg)</th>
                      <th className="px-4 py-3">Batch In</th>
                      <th className="px-4 py-3">Batch Out</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agingData.map((row) => (
                      <tr key={row.id} className="border-b border-white/5 transition hover:bg-white/5">
                        <td className="px-4 py-3 font-semibold text-pink-400">{row.aging_date}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.bucket_count || "—"}</td>
                        <td className="px-4 py-3 font-bold text-pink-400">{row.total_weight}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.batch_in_time || "—"}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.batch_out_time || "—"}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{row.created_at ? new Date(row.created_at).toLocaleTimeString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Damage Report */}
        {activeReport === "damage" && (
          <div className={`mt-6 overflow-hidden ${glassCard}`}>
            <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-6 py-3">
              <h2 className="text-lg font-semibold text-white">Damage Records — {selectedDate}</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-zinc-500">Loading…</div>
            ) : damageData.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No damage records found for {selectedDate}.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-400">
                      <th className="px-4 py-3">Bucket No</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Profile</th>
                      <th className="px-4 py-3">Total Weight (kg)</th>
                      <th className="px-4 py-3">Damage Qty</th>
                      <th className="px-4 py-3">Shift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {damageData.map((row) => (
                      <tr key={row.id} className="border-b border-white/5 transition hover:bg-white/5">
                        <td className="px-4 py-3 font-semibold text-pink-400">{row.bucket_no}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.ext_date}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.profile}</td>
                        <td className="px-4 py-3 text-zinc-300">{row.total_weight}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300 font-bold">{row.damage_qty}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-300">{row.shift}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
