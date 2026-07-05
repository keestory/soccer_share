"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dict } from "@/lib/dictionaries";

export default function MobileNav({ nav }: { nav: Dict["nav"] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const tabs = [
    { href: "/games", label: nav.games, icon: "🥅" },
    { href: "/matches", label: nav.matches, icon: "⚔️" },
    { href: "/venues", label: nav.venues, icon: "🏟️" },
    { href: "/teams", label: nav.teams, icon: "👥" },
  ];
  // 하단 4탭에 없는 나머지 진입점 — "더보기" 시트로 노출
  const extra = [
    { href: "/leaderboard", label: nav.leaderboard, icon: "🏆" },
    { href: "/transfers", label: nav.transfers, icon: "🎫" },
    { href: "/mercenaries", label: nav.mercenaries, icon: "🏃" },
    { href: "/me/reservations", label: nav.myReservations, icon: "📅" },
  ];
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {open && (
        <>
          <div className="fixed inset-0 z-20 bg-black/20 md:hidden" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 bottom-14 z-30 grid grid-cols-2 gap-2 border-t border-gray-200 bg-white p-3 md:hidden">
            {extra.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold ${
                  active(it.href) ? "bg-pitch-50 text-pitch-700" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg leading-none">{it.icon}</span>
                {it.label}
              </Link>
            ))}
          </div>
        </>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid h-14 grid-cols-5 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
        {tabs.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            onClick={() => setOpen(false)}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500 ${
              active(it.href) ? "text-pitch-600" : "text-gray-500"
            }`}
          >
            <span className="text-lg leading-none">{it.icon}</span>
            <span className="max-w-full truncate px-0.5">{it.label}</span>
          </Link>
        ))}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500 ${
            open ? "text-pitch-600" : "text-gray-500"
          }`}
        >
          <span className="text-lg leading-none">⋯</span>
          <span>{nav.more}</span>
        </button>
      </nav>
    </>
  );
}
