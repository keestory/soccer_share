import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Badge from "@/components/Badge";
import { levelLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      nickname: true,
      position: true,
      level: true,
      region: true,
      bio: true,
      createdAt: true,
      memberships: { include: { team: true }, orderBy: { joinedAt: "asc" } },
      _count: { select: { matchPosts: true, mercenaryPosts: true, transferPosts: true, comments: true } },
    },
  });
  if (!player) notFound();
  const me = await getCurrentUser();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <article className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{player.nickname}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge color="green">{levelLabel(player.level)}</Badge>
              {player.position && <Badge color="blue">{player.position}</Badge>}
              {player.region && <Badge>{player.region}</Badge>}
            </div>
          </div>
          {me?.id === player.id && (
            <Link href="/me" className="btn-secondary !py-1.5 text-xs">
              프로필 수정
            </Link>
          )}
        </div>
        {player.bio && <p className="mt-3 text-sm text-gray-700">{player.bio}</p>}
        <p className="mt-3 text-xs text-gray-400">
          {player.createdAt.toLocaleDateString("ko-KR")} 가입 · 매치글 {player._count.matchPosts} · 용병글{" "}
          {player._count.mercenaryPosts} · 양도글 {player._count.transferPosts} · 댓글 {player._count.comments}
        </p>
      </article>

      <section className="card">
        <h2 className="mb-3 font-bold">소속 팀</h2>
        <ul className="space-y-2">
          {player.memberships.map((m) => (
            <li key={m.id} className="flex items-center gap-2 text-sm">
              <Link href={`/teams/${m.team.id}`} className="font-semibold hover:text-pitch-600">
                {m.team.name}
              </Link>
              {m.role === "OWNER" && <Badge color="orange">주장</Badge>}
              <span className="text-xs text-gray-400">
                {m.team.region} · {m.joinedAt.toLocaleDateString("ko-KR")}부터 활동
              </span>
            </li>
          ))}
          {player.memberships.length === 0 && <li className="text-sm text-gray-400">소속 팀이 없습니다.</li>}
        </ul>
      </section>
    </div>
  );
}
