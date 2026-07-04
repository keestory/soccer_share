"use client";

import { useState } from "react";
import Link from "next/link";
import { positionDot } from "@/lib/constants";

export type RankedUser = {
  id: string;
  nickname: string;
  position: string | null;
  goals: number;
  assists: number;
  mvp: number;
  games: number;
};

type Cat = "goals" | "assists" | "mvp" | "games";

export default function Leaderboard({
  players,
  labels,
  emptyLabel,
}: {
  players: RankedUser[];
  labels: { goals: string; assists: string; mvp: string; games: string };
  emptyLabel: string;
}) {
  const [cat, setCat] = useState<Cat>("goals");
  const cats: Cat[] = ["goals", "assists", "mvp", "games"];
  const ranked = [...players].sort((a, b) => b[cat] - a[cat]).filter((p) => p[cat] > 0);
  const medal = ["bg-yellow-400 text-white", "bg-gray-300 text-white", "bg-amber-700 text-white"];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${
              cat === c ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-gray-500"
            }`}
          >
            {labels[c]}
          </button>
        ))}
      </div>

      <ul className="space-y-2.5">
        {ranked.map((p, i) => (
          <li key={p.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <Link href={`/players/${p.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i < 3 ? medal[i] : "text-gray-400"
                }`}
              >
                {i + 1}
              </span>
              <span className={`h-3 w-3 shrink-0 rounded-full ${positionDot(p.position ?? "")}`} />
              <span className="min-w-0 flex-1 truncate text-base font-bold text-gray-900">{p.nickname}</span>
              <span className="shrink-0 text-xl font-extrabold text-blue-600">
                {p[cat]}
                <span className="ml-1 text-xs font-semibold text-gray-400">{labels[cat]}</span>
              </span>
            </Link>
          </li>
        ))}
        {ranked.length === 0 && (
          <li className="rounded-2xl bg-white px-5 py-10 text-center text-sm text-gray-400">{emptyLabel}</li>
        )}
      </ul>
    </div>
  );
}
