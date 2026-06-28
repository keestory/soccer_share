"use client";

import { useState } from "react";
import { RANKING_CATEGORIES, type RankingKey, positionDot, positionLabel } from "@/lib/constants";

export type StatRecord = {
  date: string; // 표시용 YYYY.MM.DD
  opponent: string;
  quarter?: number;
  rating?: number | null;
};

export type RankedPlayer = {
  id: string;
  name: string;
  position: string;
  number: number | null;
  goals: number;
  assists: number;
  attendance: number;
  cleanSheet: number;
  ratingAvg: number | null;
  goalRecords: StatRecord[];
  assistRecords: StatRecord[];
  ratingRecords: StatRecord[];
  attendanceRecords: StatRecord[];
  cleanSheetRecords: StatRecord[];
};

function valueOf(p: RankedPlayer, key: RankingKey): number {
  switch (key) {
    case "goals":
      return p.goals;
    case "assists":
      return p.assists;
    case "rating":
      return p.ratingAvg ?? -1;
    case "attendance":
      return p.attendance;
    case "cleanSheet":
      return p.cleanSheet;
  }
}

function recordsOf(p: RankedPlayer, key: RankingKey): StatRecord[] {
  switch (key) {
    case "goals":
      return p.goalRecords;
    case "assists":
      return p.assistRecords;
    case "rating":
      return p.ratingRecords;
    case "attendance":
      return p.attendanceRecords;
    case "cleanSheet":
      return p.cleanSheetRecords;
  }
}

function displayValue(p: RankedPlayer, key: RankingKey): string {
  const unit = RANKING_CATEGORIES.find((c) => c.key === key)!.unit;
  if (key === "rating") return p.ratingAvg == null ? "-" : `${p.ratingAvg.toFixed(2)}${unit}`;
  return `${valueOf(p, key)}${unit}`;
}

const medal = ["bg-yellow-400 text-white", "bg-gray-300 text-white", "bg-amber-700 text-white"];

export default function RankingBoard({ players }: { players: RankedPlayer[] }) {
  const [category, setCategory] = useState<RankingKey>("goals");
  const [openId, setOpenId] = useState<string | null>(null);

  const ranked = [...players].sort((a, b) => valueOf(b, category) - valueOf(a, category));

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {RANKING_CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setCategory(c.key);
              setOpenId(null);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${
              category === c.key ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-gray-500"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ul className="space-y-2.5">
        {ranked.map((p, i) => {
          const open = openId === p.id;
          const records = recordsOf(p, category);
          return (
            <li key={p.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <button
                onClick={() => setOpenId(open ? null : p.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-gray-50"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    i < 3 ? medal[i] : "text-gray-400"
                  }`}
                >
                  {i + 1}
                </span>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${positionDot(p.position)}`}>
                  {p.number ?? "-"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-lg font-bold text-gray-900">{p.name}</span>
                  <span className="block text-sm text-gray-400">{positionLabel(p.position)}</span>
                </span>
                <span className="shrink-0 text-xl font-extrabold text-blue-600">{displayValue(p, category)}</span>
                <svg
                  className={`h-5 w-5 shrink-0 text-gray-300 transition-transform ${open ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                  <p className="mb-2 text-xs font-bold text-gray-500">
                    {RANKING_CATEGORIES.find((c) => c.key === category)!.label} 기록 {records.length}건
                  </p>
                  {records.length === 0 ? (
                    <p className="text-sm text-gray-400">기록이 없습니다.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {records.map((r, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm"
                        >
                          <span className="font-semibold text-gray-700">{r.date}</span>
                          <span className="text-gray-300">·</span>
                          <span className="flex-1 truncate text-gray-600">vs {r.opponent}</span>
                          {r.quarter != null && (
                            <span className="shrink-0 rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">
                              {r.quarter}쿼터
                            </span>
                          )}
                          {r.rating != null && (
                            <span className="shrink-0 rounded bg-pitch-100 px-2 py-0.5 text-xs font-bold text-pitch-700">
                              평점 {r.rating.toFixed(1)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
        {ranked.length === 0 && (
          <li className="rounded-2xl bg-white px-5 py-10 text-center text-sm text-gray-400">
            등록된 선수가 없습니다.
          </li>
        )}
      </ul>
    </div>
  );
}
