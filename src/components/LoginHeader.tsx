"use client";

import Link from "next/link";
import { useState } from "react";
import { SlideMenu } from "@/components/SlideMenu";
import { MenuButton } from "@/components/MenuButton";
import { menuStructure } from "@/lib/menu";

export function LoginHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <SlideMenu
        nodes={menuStructure}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <MenuButton onClick={() => setMenuOpen(true)} />
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 font-bold text-white shadow-lg shadow-pink-500/20">
              U
            </div>
            <div>
              <span className="block text-sm font-semibold tracking-wide text-zinc-100">
                Ultra Aluminum
              </span>
              <span className="block text-[10px] text-zinc-500">Pvt Ltd</span>
            </div>
          </Link>
        </div>
      </header>
    </>
  );
}
