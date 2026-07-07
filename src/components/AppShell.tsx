import Link from "next/link";
import type { ReactNode } from "react";
import { TreeView } from "@/components/TreeView";
import { menuStructure } from "@/lib/menu";
import { Breadcrumbs } from "@/components/Breadcrumbs";

type Props = {
  title: string;
  subtitle?: string;
  path: string;
  children: ReactNode;
};

export function AppShell({ title, subtitle, path, children }: Props) {
  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-pink-400 to-purple-600 text-black font-bold">
              F
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-zinc-100">
                FactoryOS
              </p>
              <p className="text-xs text-zinc-500">Production Control Center</p>
            </div>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/login"
              className="rounded-md border border-zinc-800 px-3 py-1.5 text-zinc-300 transition hover:border-pink-400 hover:text-pink-400"
            >
              Login
            </Link>
            <Link
              href="/home"
              className="rounded-md bg-pink-400 px-3 py-1.5 font-medium text-black transition hover:bg-pink-400"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[320px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Navigation
            </h2>
            <TreeView nodes={menuStructure} />
          </div>
        </aside>

        <section className="space-y-6">
          <Breadcrumbs path={path} />
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-6">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            {subtitle && <p className="mt-2 text-zinc-400">{subtitle}</p>}
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
