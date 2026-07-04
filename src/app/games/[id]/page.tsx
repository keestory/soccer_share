import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { joinGame, leaveGame, recordGameStats, updateGameStatus } from "@/lib/actions";
import Badge, { statusColor } from "@/components/Badge";
import { formatDate } from "@/lib/constants";
import { getDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = (await getDict()).games;
  const game = await prisma.pickupGame.findUnique({
    where: { id },
    include: {
      host: { select: { id: true, nickname: true } },
      participants: {
        include: { user: { select: { id: true, nickname: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
  if (!game) notFound();

  const user = await getCurrentUser();
  const isHost = user?.id === game.hostId;
  const joined = !!user && game.participants.some((p) => p.userId === user.id);
  const filled = game.participants.length;
  const pct = Math.min(100, Math.round((filled / game.capacity) * 100));
  const spotsLeft = game.capacity - filled;
  const active = game.status === "OPEN" || game.status === "CONFIRMED";

  return (
    <div className="mx-auto max-w-2xl">
      <article className="card">
        <div className="flex items-center gap-2">
          <Badge color={statusColor(game.status === "CONFIRMED" ? "MATCHED" : game.status)}>
            {t.status[game.status]}
          </Badge>
          <Badge>{game.region}</Badge>
          <Badge>{game.format}</Badge>
        </div>
        <h1 className="mt-2 text-xl font-bold">{game.title}</h1>
        <p className="mt-1 text-xs text-gray-400">
          {t.host}{" "}
          <Link href={`/players/${game.host.id}`} className="font-semibold text-gray-600 hover:text-pitch-600">
            {game.host.nickname}
          </Link>
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-4 text-sm">
          <div>
            <dt className="text-xs text-gray-400">{t.dateTime}</dt>
            <dd className="font-semibold">
              {formatDate(game.matchDate)} {game.startTime}~{game.endTime}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">{t.venue}</dt>
            <dd className="font-semibold">{game.venue}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-semibold">
              {filled}/{game.capacity}
              {spotsLeft > 0 ? ` · ${t.spotsLeft(spotsLeft)}` : ` · ${t.full}`}
            </span>
            <span className="text-xs text-gray-400">{t.minToConfirm(game.minToConfirm)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full ${game.status === "CONFIRMED" ? "bg-blue-500" : "bg-pitch-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {game.status === "CONFIRMED" && (
            <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
              {t.confirmedBanner}
            </p>
          )}
          {game.status === "OPEN" && (
            <p className="mt-2 text-xs text-gray-400">{t.openHint(game.minToConfirm)}</p>
          )}
        </div>

        {/* 참가/취소 */}
        {user ? (
          active && (
            <div className="mt-4">
              {joined ? (
                isHost ? (
                  <p className="text-sm text-gray-400">{t.hostJoined}</p>
                ) : (
                  <form action={leaveGame.bind(null, game.id)}>
                    <button className="btn-secondary w-full">{t.leave}</button>
                  </form>
                )
              ) : spotsLeft > 0 ? (
                <form action={joinGame.bind(null, game.id)}>
                  <button className="btn-primary w-full">{t.join}</button>
                </form>
              ) : (
                <p className="text-center text-sm text-gray-400">{t.fullNotice}</p>
              )}
            </div>
          )
        ) : (
          <p className="mt-4 text-sm text-gray-400">
            <Link href="/login" className="font-semibold text-pitch-600">
              {t.loginToJoin}
            </Link>
          </p>
        )}

        {/* 주최자 관리 */}
        {isHost && active && (
          <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
            <form action={updateGameStatus.bind(null, game.id, "CLOSED")}>
              <button className="btn-secondary !py-1.5 text-xs">{t.close}</button>
            </form>
            <form action={updateGameStatus.bind(null, game.id, "CANCELLED")}>
              <button className="btn-secondary !py-1.5 text-xs">{t.cancel}</button>
            </form>
          </div>
        )}
      </article>

      <section className="card mt-4">
        <h2 className="mb-3 text-sm font-bold text-gray-700">{t.participants(filled)}</h2>
        <ul className="space-y-2">
          {game.participants.map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-sm">
              <Link href={`/players/${p.user.id}`} className="font-semibold hover:text-pitch-600">
                {p.user.nickname}
              </Link>
              {p.userId === game.hostId && <Badge color="orange">{t.host}</Badge>}
              {p.mvp && <Badge color="orange">MVP</Badge>}
              {(p.goals > 0 || p.assists > 0) && (
                <span className="text-xs text-gray-400">
                  {p.goals > 0 && `⚽ ${p.goals}`} {p.assists > 0 && `👟 ${p.assists}`}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* 경기 결과 입력 (주최자) — 개인 선수 카드에 자동 반영 */}
      {isHost && (game.status === "CONFIRMED" || game.status === "CLOSED") && (
        <form action={recordGameStats} className="card mt-4">
          <input type="hidden" name="gameId" value={game.id} />
          <h2 className="text-sm font-bold text-gray-700">{t.recordTitle}</h2>
          <p className="mb-3 mt-0.5 text-xs text-gray-400">{t.recordHint}</p>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-gray-400">
            <span className="flex-1">{/* name */}</span>
            <span className="w-14 text-center">{t.goals}</span>
            <span className="w-14 text-center">{t.assists}</span>
            <span className="w-10 text-center">{t.mvp}</span>
          </div>
          <div className="space-y-2">
            {game.participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="flex-1 truncate text-sm">{p.user.nickname}</span>
                <input
                  name={`goals_${p.id}`}
                  type="number"
                  min={0}
                  defaultValue={p.goals}
                  className="input w-14 !px-2 !py-1 text-center"
                />
                <input
                  name={`assists_${p.id}`}
                  type="number"
                  min={0}
                  defaultValue={p.assists}
                  className="input w-14 !px-2 !py-1 text-center"
                />
                <span className="flex w-10 justify-center">
                  <input type="radio" name="mvp" value={p.id} defaultChecked={p.mvp} />
                </span>
              </div>
            ))}
          </div>
          <button className="btn-primary mt-3 w-full">{t.saveStats}</button>
        </form>
      )}
    </div>
  );
}
