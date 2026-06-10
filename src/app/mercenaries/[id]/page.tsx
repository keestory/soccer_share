import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateMercenaryStatus } from "@/lib/actions";
import Badge, { statusColor } from "@/components/Badge";
import CommentSection from "@/components/CommentSection";
import { POST_STATUS_LABELS, formatDate, formatPrice, levelLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function MercenaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.mercenaryPost.findUnique({
    where: { id },
    include: { author: { select: { id: true, nickname: true, position: true, level: true } } },
  });
  if (!post) notFound();

  await prisma.mercenaryPost.update({ where: { id }, data: { views: { increment: 1 } } });
  const user = await getCurrentUser();
  const isAuthor = user?.id === post.authorId;

  return (
    <div className="mx-auto max-w-2xl">
      <article className="card">
        <div className="mb-2 flex items-center gap-2">
          <Badge color={post.postType === "RECRUIT" ? "red" : "blue"}>
            {post.postType === "RECRUIT" ? "용병 구해요" : "용병 갈게요"}
          </Badge>
          <Badge color={statusColor(post.status)}>{POST_STATUS_LABELS[post.status]}</Badge>
          <Badge>{post.region}</Badge>
        </div>
        <h1 className="text-xl font-bold">{post.title}</h1>
        <p className="mt-1 text-xs text-gray-400">
          <Link href={`/players/${post.author.id}`} className="font-semibold text-gray-600 hover:text-pitch-600">
            {post.author.nickname}
          </Link>
          {" · "}조회 {post.views + 1}
        </p>

        <dl className="mt-4 grid grid-cols-4 gap-3 rounded-lg bg-gray-50 p-4 text-sm">
          <div>
            <dt className="text-xs text-gray-400">날짜</dt>
            <dd className="font-semibold">{post.matchDate ? formatDate(post.matchDate) : "협의"}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">포지션</dt>
            <dd className="font-semibold">{post.position || "무관"}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">실력대</dt>
            <dd className="font-semibold">{levelLabel(post.level)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">참가비</dt>
            <dd className="font-semibold">{post.fee > 0 ? formatPrice(post.fee) : "무료"}</dd>
          </div>
        </dl>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{post.content}</p>

        {isAuthor && post.status === "OPEN" && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <form action={updateMercenaryStatus.bind(null, post.id, "DONE")}>
              <button className="btn-secondary !py-1.5 text-xs">모집 완료로 변경</button>
            </form>
          </div>
        )}
      </article>

      <CommentSection postType="MERCENARY" postId={post.id} />
    </div>
  );
}
