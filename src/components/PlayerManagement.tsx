"use client";

import { useState } from "react";
import RankingBoard, { type RankedPlayer } from "./RankingBoard";
import { addPlayer, addPlayerEvent, recordAppearance, removePlayer } from "@/lib/actions";
import { positionDot } from "@/lib/constants";
import { dictionaries, type Dict, type Locale } from "@/lib/dictionaries";

type MatchOption = { id: string; label: string; quarters: number };
type PM = Dict["pm"];

const POS_CODES = ["FW", "MF", "DF", "GK"] as const;

export default function PlayerManagement({
  teamId,
  isOwner,
  players,
  matches,
  locale,
}: {
  teamId: string;
  isOwner: boolean;
  players: RankedPlayer[];
  matches: MatchOption[];
  locale: Locale;
}) {
  const t = dictionaries[locale].pm;
  const [tab, setTab] = useState<"roster" | "ranking">("roster");
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">{t.title}</h1>
        {isOwner && (
          <button onClick={() => setShowAdd((v) => !v)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">
            {t.addPlayer}
          </button>
        )}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => setTab("roster")}
          className={`rounded-lg py-2 text-sm font-bold ${tab === "roster" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
        >
          {t.tabRoster}
        </button>
        <button
          onClick={() => setTab("ranking")}
          className={`rounded-lg py-2 text-sm font-bold ${tab === "ranking" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}
        >
          {t.tabRanking}
        </button>
      </div>

      {isOwner && showAdd && (
        <form action={addPlayer} className="card mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <input type="hidden" name="teamId" value={teamId} />
          <input name="name" className="input sm:col-span-2" placeholder={t.playerName} required />
          <select name="position" className="input" defaultValue="MF">
            {POS_CODES.map((code) => (
              <option key={code} value={code}>
                {t.positions[code]}
              </option>
            ))}
          </select>
          <input name="number" type="number" min={0} className="input" placeholder={t.number} />
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white sm:col-span-4">
            {t.add}
          </button>
        </form>
      )}

      {tab === "ranking" ? (
        <RankingBoard players={players} locale={locale} />
      ) : (
        <RosterTab teamId={teamId} isOwner={isOwner} players={players} matches={matches} t={t} />
      )}
    </div>
  );
}

function RosterTab({
  teamId,
  isOwner,
  players,
  matches,
  t,
}: {
  teamId: string;
  isOwner: boolean;
  players: RankedPlayer[];
  matches: MatchOption[];
  t: PM;
}) {
  return (
    <div className="space-y-2.5">
      {players.map((p) => (
        <div key={p.id} className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${positionDot(p.position)}`}>
            {p.number ?? "-"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold">{p.name}</p>
            <p className="text-sm text-gray-400">{t.positions[p.position] ?? p.position}</p>
          </div>
          <div className="shrink-0 text-right text-xs text-gray-500">
            <p>{t.rosterLine1(p.goals, p.assists, p.attendance)}</p>
            <p>{t.rosterLine2(p.ratingAvg == null ? "-" : p.ratingAvg.toFixed(2), p.cleanSheet)}</p>
          </div>
          {isOwner && (
            <form action={removePlayer.bind(null, teamId, p.id)}>
              <button className="shrink-0 text-xs font-medium text-gray-500 hover:text-red-600">{t.del}</button>
            </form>
          )}
        </div>
      ))}
      {players.length === 0 && (
        <p className="rounded-2xl bg-white px-5 py-10 text-center text-sm text-gray-400">
          {t.rosterEmpty} {isOwner && t.rosterEmptyHint}
        </p>
      )}

      {isOwner && players.length > 0 && matches.length > 0 && (
        <StatForms teamId={teamId} players={players} matches={matches} t={t} />
      )}
      {isOwner && players.length > 0 && matches.length === 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">{t.needMatch}</p>
      )}
    </div>
  );
}

function StatForms({
  teamId,
  players,
  matches,
  t,
}: {
  teamId: string;
  players: RankedPlayer[];
  matches: MatchOption[];
  t: PM;
}) {
  const maxQuarters = Math.max(4, ...matches.map((m) => m.quarters));
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <form action={addPlayerEvent} className="card space-y-2">
        <p className="text-sm font-bold text-gray-700">{t.statGoalAssist}</p>
        <input type="hidden" name="teamId" value={teamId} />
        <select name="playerId" className="input" aria-label={t.playerName}>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({t.positions[p.position] ?? p.position})
            </option>
          ))}
        </select>
        <select name="matchRecordId" className="input" aria-label={t.matchLabel}>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <select name="type" className="input" defaultValue="GOAL">
            <option value="GOAL">{t.goal}</option>
            <option value="ASSIST">{t.assist}</option>
          </select>
          <select name="quarter" className="input" defaultValue={1}>
            {Array.from({ length: maxQuarters }, (_, i) => i + 1).map((q) => (
              <option key={q} value={q}>
                {t.quarter(q)}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary w-full">{t.addRecord}</button>
      </form>

      <form action={recordAppearance} className="card space-y-2">
        <p className="text-sm font-bold text-gray-700">{t.statAppearance}</p>
        <input type="hidden" name="teamId" value={teamId} />
        <select name="playerId" className="input" aria-label={t.playerName}>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({t.positions[p.position] ?? p.position})
            </option>
          ))}
        </select>
        <select name="matchRecordId" className="input" aria-label={t.matchLabel}>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-3">
          <input name="rating" type="number" min={0} max={10} step={0.1} className="input flex-1" placeholder={t.ratingPh} />
          <label className="flex shrink-0 items-center gap-1.5 text-sm text-gray-600">
            <input type="checkbox" name="cleanSheet" /> {t.cleanSheet}
          </label>
        </div>
        <button className="btn-primary w-full">{t.saveAppearance}</button>
      </form>
    </div>
  );
}
