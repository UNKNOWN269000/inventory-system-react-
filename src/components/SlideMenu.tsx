"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { hasAccess } from "@/lib/rolePermissions";
import type { MenuNode } from "@/lib/menu";

type Props = {
  nodes: MenuNode[];
  level?: number;
  isOpen: boolean;
  onClose: () => void;
};

export function SlideMenu({ nodes, level = 0, isOpen, onClose }: Props) {
  const { role, logout } = useAuth();
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Filter nodes based on user role
  const filterNodesByRole = (menuNodes: MenuNode[]): MenuNode[] => {
    // Admin sees everything
    if (role === "Admin") return menuNodes;
    
    return menuNodes.filter(node => {
      if (level === 0 && node.slug === "home") return true;
      if (level === 0) return hasAccess(role, node.href);
      return true;
    }).map(node => ({
      ...node,
      children: node.children ? filterNodesByRole(node.children) : [],
    }));
  };

  const filteredNodes = level === 0 ? filterNodesByRole(nodes) : nodes;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 border-r border-zinc-800 bg-zinc-950 shadow-2xl transition-transform duration-300 ease-out sm:w-80 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
            <Link href="/home" className="flex items-center gap-3" onClick={onClose}>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 font-bold text-white shadow-lg shadow-pink-500/20">
                U
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-zinc-100">
                  Ultra Aluminum
                </p>
                <p className="text-[10px] text-zinc-500">Pvt Ltd</p>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-100"
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-4">
            <SlideMenuNodes nodes={filteredNodes} level={level} onClose={onClose} />
          </nav>

          <div className="border-t border-zinc-800 px-4 py-3">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { logout(); onClose(); }}
                className="flex items-center justify-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:border-pink-400 hover:text-pink-300"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10.6667 4.66669L14 8.00002L10.6667 11.3334M2 8.00002H14M14 8.00002V12.6667C14 13.0322 13.7015 13.3284 13.3333 13.3334H2.66667C2.29848 13.3284 2 13.0322 2 12.6667V3.33335C2 2.96516 2.29848 2.66891 2.66667 2.66669H13.3333C13.7015 2.66891 14 2.96516 14 3.33335V4.66669" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Logout
              </button>
              <Link href="/home" onClick={onClose} className="flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-2 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-pink-500/20">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2.66667 8.00002L8 2.66669L13.3333 8.00002V13.3334C13.3333 13.5102 13.2631 13.6797 13.1381 13.8047C13.0131 13.9298 12.8436 14 12.6667 14H3.33333C3.15652 14 2.98708 13.9298 2.86207 13.8047C2.73706 13.6797 2.66667 13.5102 2.66667 13.3334V8.00002Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Home
              </Link>
            </div>
            <p className="mt-3 text-center text-[10px] text-zinc-600">© {new Date().getFullYear()} FactoryOS</p>
          </div>
        </div>
      </aside>
    </>
  );
}

function SlideMenuNodes({ nodes, level = 0, onClose }: { nodes: MenuNode[]; level?: number; onClose: () => void }) {
  return (
    <ul className={level === 0 ? "space-y-0.5" : "ml-4 mt-1 space-y-0.5 border-l border-zinc-800 pl-3"}>
      {nodes.map((node) => (
        <SlideMenuItem key={node.href} node={node} level={level} onClose={onClose} />
      ))}
    </ul>
  );
}

function SlideMenuItem({ node, level, onClose }: { node: MenuNode; level: number; onClose: () => void }) {
  const hasChildren = !!node.children?.length;
  const [open, setOpen] = useState(level < 2);

  return (
    <li>
      <div className={`group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition ${level === 0 ? "font-semibold text-zinc-100" : "font-normal text-zinc-400 hover:text-zinc-100"} hover:bg-zinc-900`}>
        {hasChildren ? (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? "Collapse" : "Expand"} className="grid h-5 w-5 shrink-0 place-items-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-pink-300">
            <svg width="10" height="10" viewBox="0 0 10 10" className={`transition-transform ${open ? "rotate-90" : ""}`}>
              <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
        ) : (
          <span className="inline-block h-5 w-5 shrink-0" />
        )}
        <Link href={node.href} onClick={onClose} className={`flex-1 truncate ${level === 0 ? "text-zinc-100" : "text-zinc-300"} group-hover:text-pink-300`}>
          {node.label}
        </Link>
        {hasChildren && <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-500">{node.children!.length}</span>}
      </div>
      {hasChildren && open && <SlideMenuNodes nodes={node.children!} level={level + 1} onClose={onClose} />}
    </li>
  );
}
