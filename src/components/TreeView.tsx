"use client";

import Link from "next/link";
import { useState } from "react";
import type { MenuNode } from "@/lib/menu";

type Props = {
  nodes: MenuNode[];
  level?: number;
};

export function TreeView({ nodes, level = 0 }: Props) {
  return (
    <ul className={level === 0 ? "space-y-1" : "ml-3 mt-1 space-y-1 border-l border-zinc-800 pl-3"}>
      {nodes.map((node) => (
        <TreeItem key={node.href} node={node} level={level} />
      ))}
    </ul>
  );
}

function TreeItem({ node, level }: { node: MenuNode; level: number }) {
  const hasChildren = !!node.children?.length;
  const [open, setOpen] = useState(level < 2);

  return (
    <li>
      <div
        className={`group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition ${
          level === 0
            ? "font-semibold text-zinc-100"
            : "font-normal text-zinc-400 hover:text-zinc-100"
        } hover:bg-zinc-900`}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Collapse" : "Expand"}
            className="grid h-5 w-5 shrink-0 place-items-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-pink-400"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              className={`transition-transform ${open ? "rotate-90" : ""}`}
            >
              <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
        ) : (
          <span className="inline-block h-5 w-5 shrink-0" />
        )}

        <Link
          href={node.href}
          className={`flex-1 truncate ${
            level === 0 ? "text-zinc-100" : "text-zinc-300"
          } group-hover:text-pink-400`}
        >
          {node.label}
        </Link>

        {hasChildren && (
          <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-500">
            {node.children!.length}
          </span>
        )}
      </div>

      {hasChildren && open && <TreeView nodes={node.children!} level={level + 1} />}
    </li>
  );
}
