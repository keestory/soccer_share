import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateMercenaryStatus } from "@/lib/actions";
import Badge, { statusColor } from "@/components/Badge";
import CommentSection from "@/components/CommentSection";
import { formatDate, formatPrice } from "@/lib/constants";
import { getDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function MercenaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const d = await getDict();
  const t = d.mercenaries;
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
            {post.postType === "RECRUIT" ? t.recruitFull : t.offerFull}
          </Badge>
          <Badge color={statusColor(post.status)}>{d.common.postStatus[post.status]}</Badge>
          <Badge>{post.region}</Badge>
        </div>
        <h1 className="text-xl font-bold">{post.title}</h1>
        <p className="mt-1 text-xs text-gray-400">
          <Link href={`/players/${post.author.id}`} className="font-semibold text-gray-600 hover:text-pitch-600">
            {post.author.nickname}
          </Link>
          {" · "}{d.common.views(post.views + 1)}
        </p>

        <dl className="mt-4 grid grid-cols-4 gap-3 rounded-lg bg-gray-50 p-4 text-sm">
          <div>
            <dt className="text-xs text-gray-400">{t.dateOptional}</dt>
            <dd className="font-semibold">{post.matchDate ? formatDate(post.matchDate) : t.dateTBD}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">{t.position}</dt>
            <dd className="font-semibold">{post.position || d.common.any}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">{t.levelWord}</dt>
            <dd className="font-semibold">{d.common.levels[post.level - 1]}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">{t.fee}</dt>
            <dd className="font-semibold">{post.fee > 0 ? formatPrice(post.fee) : t.free}</dd>
          </div>
        </dl>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{post.content}</p>

        {isAuthor && post.status === "OPEN" && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <form action={updateMercenaryStatus.bind(null, post.id, "DONE")}>
              <button className="btn-secondary !py-1.5 text-xs">{t.doneBtn}</button>
            </form>
          </div>
        )}
      </article>

      <CommentSection postType="MERCENARY" postId={post.id} />
    </div>
  );
}
