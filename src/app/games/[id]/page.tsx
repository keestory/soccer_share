import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { joinGame, leaveGame, updateGameStatus } from "@/lib/actions";
import Badge, { statusColor } from "@/components/Badge";
import { formatDate } from "@/lib/constants";

export const dynamic = "force-dynamic";

const GAME_STATUS: Record<string, string> = {
  OPEN: "모집중",
  CONFIRMED: "성사됨",
  CLOSED: "마감",
  CANCELLED: "취소",
};

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
            {GAME_STATUS[game.status]}
          </Badge>
          <Badge>{game.region}</Badge>
          <Badge>{game.format}</Badge>
        </div>
        <h1 className="mt-2 text-xl font-bold">{game.title}</h1>
        <p className="mt-1 text-xs text-gray-400">
          주최{" "}
          <Link href={`/players/${game.host.id}`} className="font-semibold text-gray-600 hover:text-pitch-600">
            {game.host.nickname}
          </Link>
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-4 text-sm">
          <div>
            <dt className="text-xs text-gray-400">일시</dt>
            <dd className="font-semibold">
              {formatDate(game.matchDate)} {game.startTime}~{game.endTime}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">구장</dt>
            <dd className="font-semibold">{game.venue}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-semibold">
              {filled}/{game.capacity}명
              {spotsLeft > 0 ? ` · ${spotsLeft}자리 남음` : " · 정원 마감"}
            </span>
            <span className="text-xs text-gray-400">최소 성사 {game.minToConfirm}명</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full ${game.status === "CONFIRMED" ? "bg-blue-500" : "bg-pitch-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {game.status === "CONFIRMED" && (
            <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
              ✅ 최소 인원을 채워 게임이 성사됐습니다.
            </p>
          )}
          {game.status === "OPEN" && (
            <p className="mt-2 text-xs text-gray-400">
              최소 인원({game.minToConfirm}명)을 채우면 게임이 성사됩니다.
            </p>
          )}
        </div>

        {/* 참가/취소 */}
        {user ? (
          active && (
            <div className="mt-4">
              {joined ? (
                isHost ? (
                  <p className="text-sm text-gray-400">주최자로 참가 중입니다.</p>
                ) : (
                  <form action={leaveGame.bind(null, game.id)}>
                    <button className="btn-secondary w-full">참가 취소</button>
                  </form>
                )
              ) : spotsLeft > 0 ? (
                <form action={joinGame.bind(null, game.id)}>
                  <button className="btn-primary w-full">참가하기</button>
                </form>
              ) : (
                <p className="text-center text-sm text-gray-400">정원이 찼습니다.</p>
              )}
            </div>
          )
        ) : (
          <p className="mt-4 text-sm text-gray-400">
            참가하려면{" "}
            <Link href="/login" className="font-semibold text-pitch-600">
              로그인
            </Link>
            하세요.
          </p>
        )}

        {/* 주최자 관리 */}
        {isHost && active && (
          <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
            <form action={updateGameStatus.bind(null, game.id, "CLOSED")}>
              <button className="btn-secondary !py-1.5 text-xs">모집 마감</button>
            </form>
            <form action={updateGameStatus.bind(null, game.id, "CANCELLED")}>
              <button className="btn-secondary !py-1.5 text-xs">게임 취소</button>
            </form>
          </div>
        )}
      </article>

      <section className="card mt-4">
        <h2 className="mb-3 text-sm font-bold text-gray-700">참가자 {filled}명</h2>
        <ul className="space-y-2">
          {game.participants.map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-sm">
              <Link href={`/players/${p.user.id}`} className="font-semibold hover:text-pitch-600">
                {p.user.nickname}
              </Link>
              {p.userId === game.hostId && <Badge color="orange">주최</Badge>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
