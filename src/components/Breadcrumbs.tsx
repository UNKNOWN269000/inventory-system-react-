import Link from "next/link";
import { getBreadcrumbs } from "@/lib/menu";

export function Breadcrumbs({ path }: { path: string }) {
  const crumbs = getBreadcrumbs(path);
  return (
    <nav className="flex flex-wrap items-center gap-1 text-xs text-zinc-500">
      {crumbs.map((c, i) => (
        <span key={c.href} className="flex items-center gap-1">
          {i > 0 && <span className="text-zinc-700">/</span>}
          {i === crumbs.length - 1 ? (
            <span className="text-pink-300">{c.label}</span>
          ) : (
            <Link href={c.href} className="hover:text-zinc-300">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
