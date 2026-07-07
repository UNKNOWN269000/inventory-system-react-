"use client";

import { useEffect, useState } from "react";

export function CloudSync() {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    "Initializing secure connection...",
    "Encrypting data on local device...",
    "Validating data integrity...",
    "Uploading to cloud server...",
    "Writing to database...",
    "Verifying upload completion...",
  ];

  useEffect(() => {
    const t1 = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 0.5)), 50);
    const t2 = setInterval(() => setStep((s) => (s + 1) % steps.length), 800);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/95 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-3xl">
        <div className="mb-6 text-center sm:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-300 sm:text-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-pink-400" />
            SYNC IN PROGRESS
          </div>
          <h2 className="mt-2 text-2xl font-bold text-white sm:mt-3 sm:text-3xl">Syncing Data</h2>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">{steps[step]}</p>
        </div>

        {/* Three-Stage Transfer */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="absolute left-0 right-0 top-1/2 hidden h-1 -translate-y-1/2 md:block">
            <div className="h-full w-full rounded-full bg-zinc-800" />
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Connection Line - Mobile (Vertical) */}
          <div className="absolute left-1/2 top-0 bottom-0 hidden w-1 -translate-x-1/2 md:hidden">
            <div className="h-full w-full rounded-full bg-zinc-800" />
            <div
              className="w-full rounded-full bg-gradient-to-b from-pink-500 via-purple-500 to-pink-500 transition-all duration-100"
              style={{ height: `${progress}%` }}
            />
          </div>

          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-4">
            {/* Local Device */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-2xl bg-pink-500/20" />
                <div className="relative grid h-14 w-14 place-items-center rounded-2xl border border-pink-500/50 bg-gradient-to-br from-pink-500/20 to-rose-500/20 shadow-lg shadow-pink-500/20 sm:h-16 sm:w-16">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-pink-300 sm:h-8 sm:w-8">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs font-semibold text-white sm:text-sm">Local Device</p>
            </div>

            {/* Cloud Server */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" style={{ animationDuration: "2s" }} />
                <div className="relative grid h-20 w-20 place-items-center rounded-full border border-purple-500/50 bg-gradient-to-br from-purple-500/30 to-pink-500/30 shadow-2xl shadow-purple-500/30 sm:h-24 sm:w-24">
                  <svg width="48" height="36" viewBox="0 0 120 80" fill="none">
                    <defs>
                      <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <path d="M30 60 C15 60, 5 50, 5 38 C5 28, 15 20, 25 20 C28 10, 38 5, 50 5 C62 5, 72 12, 75 22 C85 20, 95 25, 100 35 C110 35, 115 42, 115 50 C115 56, 110 60, 105 60 Z" fill="url(#cg)" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs font-semibold text-white sm:text-sm">Cloud Server</p>
            </div>

            {/* Database */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-2xl bg-emerald-500/20" style={{ animationDuration: "1.8s" }} />
                <div className="relative grid h-14 w-14 place-items-center rounded-2xl border border-emerald-500/50 bg-gradient-to-br from-emerald-500/20 to-green-500/20 shadow-lg shadow-emerald-500/20 sm:h-16 sm:w-16">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-300 sm:h-8 sm:w-8">
                    <rect x="2" y="3" width="20" height="6" rx="1" />
                    <rect x="2" y="15" width="20" height="6" rx="1" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs font-semibold text-white sm:text-sm">Database</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 sm:mt-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-white sm:text-sm">Upload Progress</span>
            <span className="text-xs font-bold text-pink-400 sm:text-sm">{Math.round(progress)}%</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-zinc-900">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status Steps */}
        <div className="mt-4 space-y-1.5 sm:mt-6">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs sm:px-3 sm:text-sm ${
                i === step
                  ? "border-pink-500/50 bg-pink-500/10"
                  : i < step
                  ? "border-emerald-500/30 bg-emerald-500/5 text-zinc-500"
                  : "border-zinc-800/50 bg-zinc-900/30 text-zinc-600"
              }`}
            >
              <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                i < step ? "bg-emerald-400" : i === step ? "bg-pink-400 animate-pulse" : "bg-zinc-700"
              }`} />
              <span className={`flex-1 ${i === step ? "font-semibold text-white" : ""}`}>{s}</span>
              {i < step && <span className="ml-auto text-[10px] text-emerald-400">done</span>}
              {i === step && <span className="ml-auto text-[10px] text-pink-400">active</span>}
            </div>
          ))}
        </div>

        {/* Live Stats */}
        <div className="mt-4 grid grid-cols-3 gap-1.5 sm:mt-6 sm:gap-2">
          <div className="rounded-lg border border-pink-500/20 bg-pink-500/5 p-1.5 text-center sm:p-2">
            <div className="text-[9px] text-zinc-400 sm:text-[10px]">Encrypt</div>
            <div className="text-xs font-bold text-pink-400">100%</div>
          </div>
          <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-1.5 text-center sm:p-2">
            <div className="text-[9px] text-zinc-400 sm:text-[10px]">Upload</div>
            <div className="text-xs font-bold text-purple-400">sync</div>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-1.5 text-center sm:p-2">
            <div className="text-[9px] text-zinc-400 sm:text-[10px]">DB</div>
            <div className="text-xs font-bold text-emerald-400">wait</div>
          </div>
        </div>
      </div>
    </div>
  );
}
