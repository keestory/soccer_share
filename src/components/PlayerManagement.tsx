"use client";

import { useState } from "react";
import RankingBoard, { type RankedPlayer } from "./RankingBoard";
import { addPlayer, addPlayerEvent, recordAppearance, removePlayer } from "@/lib/actions";
import { PLAYER_POSITIONS, positionDot, positionLabel } from "@/lib/constants";

type MatchOption = { id: string; label: string; quarters: number };

export default function PlayerManagement({
  teamId,
  isOwner,
  players,
  matches,
}: {
  teamId: string;
  isOwner: boolean;
  players: RankedPlayer[];
  matches: MatchOption[];
}) {
  const [tab, setTab] = useState<"roster" | "ranking">("roster");
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">선수 관리</h1>
        {isOwner && (
          <button onClick={() => setShowAdd((v) => !v)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">
            + 선수 추가
          </button>
        )}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => setTab("roster")}
          className={`rounded-lg py-2 text-sm font-bold ${tab === "roster" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
        >
          명단
        </button>
        <button
          onClick={() => setTab("ranking")}
          className={`rounded-lg py-2 text-sm font-bold ${tab === "ranking" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}
        >
          🏆 랭킹
        </button>
      </div>

      {isOwner && showAdd && (
        <form action={addPlayer} className="card mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <input type="hidden" name="teamId" value={teamId} />
          <input name="name" className="input sm:col-span-2" placeholder="선수 이름" required />
          <select name="position" className="input" defaultValue="MF">
            {PLAYER_POSITIONS.map((p) => (
              <option key={p.code} value={p.code}>
                {p.label}
              </option>
            ))}
          </select>
          <input name="number" type="number" min={0} className="input" placeholder="등번호" />
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white sm:col-span-4">
            추가하기
          </button>
        </form>
      )}

      {tab === "ranking" ? (
        <RankingBoard players={players} />
      ) : (
        <RosterTab teamId={teamId} isOwner={isOwner} players={players} matches={matches} />
      )}
    </div>
  );
}

function RosterTab({
  teamId,
  isOwner,
  players,
  matches,
}: {
  teamId: string;
  isOwner: boolean;
  players: RankedPlayer[];
  matches: MatchOption[];
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
            <p className="text-sm text-gray-400">{positionLabel(p.position)}</p>
          </div>
          <div className="shrink-0 text-right text-xs text-gray-500">
            <p>
              {p.goals}골 {p.assists}도움 · 출석 {p.attendance}
            </p>
            <p>평점 {p.ratingAvg == null ? "-" : p.ratingAvg.toFixed(2)} · 클린시트 {p.cleanSheet}</p>
          </div>
          {isOwner && (
            <form action={removePlayer.bind(null, teamId, p.id)}>
              <button className="shrink-0 text-xs text-gray-300 hover:text-red-500">삭제</button>
            </form>
          )}
        </div>
      ))}
      {players.length === 0 && (
        <p className="rounded-2xl bg-white px-5 py-10 text-center text-sm text-gray-400">
          아직 등록된 선수가 없습니다. {isOwner && "‘선수 추가’로 로스터를 만들어보세요."}
        </p>
      )}

      {isOwner && players.length > 0 && matches.length > 0 && (
        <StatForms teamId={teamId} players={players} matches={matches} />
      )}
      {isOwner && players.length > 0 && matches.length === 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
          기록을 입력하려면 먼저 팀 페이지에서 경기 기록(전적)을 추가해주세요.
        </p>
      )}
    </div>
  );
}

function StatForms({
  teamId,
  players,
  matches,
}: {
  teamId: string;
  players: RankedPlayer[];
  matches: MatchOption[];
}) {
  const maxQuarters = Math.max(4, ...matches.map((m) => m.quarters));
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <form action={addPlayerEvent} className="card space-y-2">
        <p className="text-sm font-bold text-gray-700">골 / 도움 기록</p>
        <input type="hidden" name="teamId" value={teamId} />
        <select name="playerId" className="input">
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({positionLabel(p.position)})
            </option>
          ))}
        </select>
        <select name="matchRecordId" className="input">
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <select name="type" className="input" defaultValue="GOAL">
            <option value="GOAL">골</option>
            <option value="ASSIST">도움</option>
          </select>
          <select name="quarter" className="input" defaultValue={1}>
            {Array.from({ length: maxQuarters }, (_, i) => i + 1).map((q) => (
              <option key={q} value={q}>
                {q}쿼터
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary w-full">기록 추가</button>
      </form>

      <form action={recordAppearance} className="card space-y-2">
        <p className="text-sm font-bold text-gray-700">출전 / 평점 / 클린시트</p>
        <input type="hidden" name="teamId" value={teamId} />
        <select name="playerId" className="input">
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({positionLabel(p.position)})
            </option>
          ))}
        </select>
        <select name="matchRecordId" className="input">
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-3">
          <input name="rating" type="number" min={0} max={10} step={0.1} className="input flex-1" placeholder="평점 (0~10)" />
          <label className="flex shrink-0 items-center gap-1.5 text-sm text-gray-600">
            <input type="checkbox" name="cleanSheet" /> 클린시트
          </label>
        </div>
        <button className="btn-primary w-full">출전 저장</button>
      </form>
    </div>
  );
}
