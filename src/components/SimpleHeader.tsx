"use client";

import Link from "next/link";
import { useState } from "react";
import { SlideMenu } from "@/components/SlideMenu";
import { MenuButton } from "@/components/MenuButton";
import { useAuth } from "@/context/AuthContext";
import { menuStructure } from "@/lib/menu";

export function SimpleHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <>
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
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 font-bold text-white shadow-lg shadow-pink-500/20">
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
          <button
            onClick={logout}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-pink-400 hover:text-pink-300"
          >
            Logout
          </button>
        </div>
      </header>
    </>
  );
}
