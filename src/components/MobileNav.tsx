"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dict } from "@/lib/dictionaries";

export default function MobileNav({ nav }: { nav: Dict["nav"] }) {
  const pathname = usePathname();
  const items = [
    { href: "/games", label: nav.games, icon: "🥅" },
    { href: "/matches", label: nav.matches, icon: "⚔️" },
    { href: "/venues", label: nav.venues, icon: "🏟️" },
    { href: "/teams", label: nav.teams, icon: "👥" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
      {items.map((it) => {
        const active = pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${
              active ? "text-pitch-600" : "text-gray-400"
            }`}
          >
            <span className="text-lg leading-none">{it.icon}</span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
