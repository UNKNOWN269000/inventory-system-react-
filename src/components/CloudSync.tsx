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
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/95 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-3xl">
        {/* SYNCING: Cloud sync animation */}
        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 px-6 py-10 text-center text-white">
          {/* Floating background particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-[10%] top-[20%] h-1.5 w-1.5 animate-[float_3s_ease-in-out_infinite] rounded-full bg-white/40" />
            <div className="absolute right-[15%] top-[30%] h-1 w-1 animate-[float_3s_ease-in-out_infinite_0.5s] rounded-full bg-white/30" />
            <div className="absolute left-[20%] bottom-[25%] h-1 w-1 animate-[float_3s_ease-in-out_infinite_1s] rounded-full bg-white/50" />
            <div className="absolute right-[10%] bottom-[15%] h-1.5 w-1.5 animate-[float_3s_ease-in-out_infinite_1.5s] rounded-full bg-white/40" />
          </div>

          {/* Cloud Sync Visual */}
          <div className="relative mx-auto h-44 w-full max-w-xs">
            {/* Local device (left) */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="mt-1.5 text-[10px] font-semibold tracking-wider text-white/80">LOCAL</div>
              </div>
            </div>

            {/* Cloud (center) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                {/* Pulsing rings behind cloud */}
                <div className="absolute inset-0 -m-6 animate-[ping_2s_ease-in-out_infinite] rounded-full border-2 border-white/30" />
                <div className="absolute inset-0 -m-3 animate-[ping_2s_ease-in-out_infinite_0.5s] rounded-full border-2 border-white/40" />

                <div className="relative flex h-20 w-20 animate-[bounce-soft_2s_ease-in-out_infinite] items-center justify-center rounded-full bg-white shadow-2xl shadow-cyan-500/40">
                  <svg className="h-10 w-10 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Cloud server (right) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <div className="mt-1.5 text-[10px] font-semibold tracking-wider text-white/80">SERVER</div>
              </div>
            </div>

            {/* Connection line */}
            <svg
              className="absolute left-0 top-1/2 -z-0 h-1 w-full -translate-y-1/2"
              viewBox="0 0 200 4"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="2" x2="200" y2="2" stroke="white" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="4 4" />
            </svg>

            {/* Upload packet (left -> cloud) */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <div className="relative h-3 w-12 sm:w-20">
                <div
                  className="absolute h-3 w-3 animate-[travel-right_1.4s_ease-in-out_infinite] rounded-full bg-amber-300 shadow-lg shadow-amber-300/60"
                  style={{ animationDelay: "0s" }}
                />
              </div>
            </div>

            {/* Download packet (cloud -> right) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <div className="relative h-3 w-12 sm:w-20">
                <div
                  className="absolute right-0 h-3 w-3 animate-[travel-left_1.4s_ease-in-out_infinite] rounded-full bg-emerald-300 shadow-lg shadow-emerald-300/60"
                  style={{ animationDelay: "0.5s" }}
                />
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="relative mt-2">
            <h3 className="text-xl font-extrabold">Syncing to Cloud</h3>
            <p className="mt-1.5 text-sm text-white/80">
              Please wait while your data is being uploaded...
            </p>

            {/* Progress bar */}
            <div className="mx-auto mt-5 h-1.5 w-56 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full origin-left animate-[sync_2.1s_ease-in-out_forwards] rounded-full bg-white"
                style={{ animationPlayState: progress >= 100 ? "paused" : "running" }}
              />
            </div>

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-white/60">
              Do not close this window
            </p>
          </div>

          {/* Three status indicators at bottom */}
          <div className="relative mt-5 flex justify-center gap-4 text-[10px] text-white/80">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
              <span>Encrypting</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300 [animation-delay:0.3s]" />
              <span>Uploading</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-200 [animation-delay:0.6s]" />
              <span>Verifying</span>
            </div>
          </div>
        </div>

        {/* Header section (kept from original) */}
        <div className="mb-6 text-center sm:mb-8 mt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-300 sm:text-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-pink-400" />
            SYNC IN PROGRESS
          </div>
          <h2 className="mt-2 text-2xl font-bold text-white sm:mt-3 sm:text-3xl">Syncing Data</h2>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">{steps[step]}</p>
        </div>

        {/* Progress bar (from original) */}
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
              <div
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  i < step
                    ? "bg-emerald-400"
                    : i === step
                    ? "bg-pink-400 animate-pulse"
                    : "bg-zinc-700"
                }`}
              />
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

        {/* Animations */}
        <style>{`
          @keyframes sync {
            0% { transform: scaleX(0); }
            100% { transform: scaleX(1); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); opacity: 0.4; }
            50% { transform: translateY(-12px); opacity: 0.9; }
          }
          @keyframes bounce-soft {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          @keyframes travel-right {
            0% { left: 0; opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { left: 100%; opacity: 0; }
          }
          @keyframes travel-left {
            0% { right: 0; opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { right: 100%; opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
