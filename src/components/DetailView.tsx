"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { SlideMenu } from "@/components/SlideMenu";
import { MenuButton } from "@/components/MenuButton";
import { useAuth } from "@/context/AuthContext";
import { menuStructure } from "@/lib/menu";

export type Metric = { label: string; value: string; note?: string };
export type Row = string[];

type Props = {
  title: string;
  subtitle?: string;
  breadcrumbs: { label: string; href: string }[];
  metrics?: Metric[];
  tableHead?: string[];
  tableRows?: Row[];
  notes?: string[];
  sidebarLinks?: { label: string; href: string }[];
  children?: ReactNode;
};

export function DetailView({
  title,
  subtitle,
  breadcrumbs,
  metrics = [],
  tableHead,
  tableRows = [],
  notes = [],
  sidebarLinks = [],
  children,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <SlideMenu
        nodes={menuStructure}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <MenuButton onClick={() => setMenuOpen(true)} />
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 font-bold text-white shadow-lg shadow-pink-500/20">
              U
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">
                Ultra Aluminum
              </p>
              <p className="text-xs text-zinc-500">Pvt Ltd</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={logout}
              className="rounded-md border border-zinc-800 px-3 py-1.5 text-zinc-300 transition hover:border-pink-400 hover:text-pink-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-zinc-500">
          {breadcrumbs.map((b, i) => (
            <span key={b.href} className="flex items-center gap-1">
              {i > 0 && <span className="text-zinc-700">/</span>}
              {i === breadcrumbs.length - 1 ? (
                <span className="text-pink-400">{b.label}</span>
              ) : (
                <Link href={b.href} className="hover:text-zinc-300">
                  {b.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-black/80 p-6 backdrop-blur">
          <h1 className="text-3xl font-bold text-white">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-zinc-400">{subtitle}</p>}
        </div>

        {metrics.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {m.label}
                </p>
                <p className="mt-1.5 text-2xl font-bold text-white">
                  {m.value}
                  {m.note && (
                    <span className="ml-1 text-xs font-normal text-zinc-500">
                      {m.note}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        {tableHead && tableRows.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-400">
                <tr>
                  {tableHead.map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {tableRows.map((row, i) => (
                  <tr
                    key={i}
                    className="bg-zinc-950 transition hover:bg-zinc-900"
                  >
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`px-4 py-3 ${
                          j === 0
                            ? "font-medium text-zinc-100"
                            : "text-zinc-400"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {notes.length > 0 && (
          <ul className="mt-6 space-y-2 rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-400">
            {notes.map((n, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-400" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        )}

        {sidebarLinks.length > 0 && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Related modules
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sidebarLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-pink-400 hover:text-pink-400"
                >
                  {l.label} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {children}
      </div>
    </main>
  );
}
