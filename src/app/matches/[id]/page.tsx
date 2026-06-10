import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateMatchStatus } from "@/lib/actions";
import Badge, { statusColor } from "@/components/Badge";
import CommentSection from "@/components/CommentSection";
import { MATCH_STATUS_LABELS, formatDate } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.matchPost.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, nickname: true, level: true } },
      team: { select: { id: true, name: true, level: true } },
    },
  });
  if (!post) notFound();

  await prisma.matchPost.update({ where: { id }, data: { views: { increment: 1 } } });
  const user = await getCurrentUser();
  const isAuthor = user?.id === post.authorId;

  return (
    <div className="mx-auto max-w-2xl">
      <article className="card">
        <div className="mb-2 flex items-center gap-2">
          <Badge color={statusColor(post.status)}>{MATCH_STATUS_LABELS[post.status]}</Badge>
          <Badge>{post.region}</Badge>
          <Badge>{post.format}</Badge>
        </div>
        <h1 className="text-xl font-bold">{post.title}</h1>
        <p className="mt-1 text-xs text-gray-400">
          <Link href={`/players/${post.author.id}`} className="font-semibold text-gray-600 hover:text-pitch-600">
            {post.author.nickname}
          </Link>
          {post.team && (
            <>
              {" · "}
              <Link href={`/teams/${post.team.id}`} className="font-semibold text-gray-600 hover:text-pitch-600">
                {post.team.name}
              </Link>
            </>
          )}
          {" · "}조회 {post.views + 1}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-4 text-sm">
          <div>
            <dt className="text-xs text-gray-400">일시</dt>
            <dd className="font-semibold">
              {formatDate(post.matchDate)} {post.startTime}~{post.endTime}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">구장</dt>
            <dd className="font-semibold">{post.venue}</dd>
          </div>
        </dl>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{post.content}</p>

        {isAuthor && (
          <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
            {(["OPEN", "MATCHED", "CLOSED"] as const)
              .filter((s) => s !== post.status)
              .map((s) => (
                <form key={s} action={updateMatchStatus.bind(null, post.id, s)}>
                  <button className="btn-secondary !py-1.5 text-xs">{MATCH_STATUS_LABELS[s]}(으)로 변경</button>
                </form>
              ))}
          </div>
        )}
      </article>

      <CommentSection postType="MATCH" postId={post.id} />
    </div>
  );
}
