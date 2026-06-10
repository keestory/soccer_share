import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { addComment } from "@/lib/actions";

export default async function CommentSection({ postType, postId }: { postType: string; postId: string }) {
  const [comments, user] = await Promise.all([
    prisma.comment.findMany({
      where: { postType, postId },
      include: { author: { select: { id: true, nickname: true } } },
      orderBy: { createdAt: "asc" },
    }),
    getCurrentUser(),
  ]);

  return (
    <section className="card mt-4">
      <h2 className="mb-3 text-sm font-bold text-gray-700">댓글 {comments.length}</h2>
      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="border-b border-gray-100 pb-3 last:border-0">
            <div className="mb-1 flex items-center gap-2 text-xs text-gray-400">
              <Link href={`/players/${c.author.id}`} className="font-semibold text-gray-700 hover:text-pitch-600">
                {c.author.nickname}
              </Link>
              <span>{c.createdAt.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-800">{c.content}</p>
          </li>
        ))}
        {comments.length === 0 && <li className="text-sm text-gray-400">아직 댓글이 없습니다.</li>}
      </ul>
      {user ? (
        <form action={addComment} className="mt-4 flex gap-2">
          <input type="hidden" name="postType" value={postType} />
          <input type="hidden" name="postId" value={postId} />
          <input name="content" className="input flex-1" placeholder="댓글을 입력하세요" required />
          <button className="btn-primary shrink-0">등록</button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-gray-400">
          댓글을 쓰려면{" "}
          <Link href="/login" className="font-semibold text-pitch-600">
            로그인
          </Link>
          이 필요합니다.
        </p>
      )}
    </section>
  );
}
