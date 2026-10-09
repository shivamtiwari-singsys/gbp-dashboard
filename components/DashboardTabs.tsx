"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { slug: "info", label: "Info & Hours" },
  { slug: "posts", label: "Posts" },
  { slug: "engagement", label: "Reviews & Q&A" },
] as const;

export default function DashboardTabs({ locationId }: { locationId: string }) {
  const pathname = usePathname();

  return (
    <nav className="mt-3 flex gap-1 border-b border-zinc-200">
      {TABS.map((tab) => {
        const href = `/dashboard/${locationId}/${tab.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={tab.slug}
            href={href}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
