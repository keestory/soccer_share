import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getDict, getLocale } from "@/lib/locale";
import { addComment } from "@/lib/actions";

const LOCALE_TAG: Record<string, string> = { ko: "ko-KR", en: "en-US", id: "id-ID" };

export default async function CommentSection({ postType, postId }: { postType: string; postId: string }) {
  const locale = await getLocale();
  const t = (await getDict()).comments;
  const tag = LOCALE_TAG[locale] ?? "en-US";
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
      <h2 className="mb-3 text-sm font-bold text-gray-700">{t.count(comments.length)}</h2>
      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="border-b border-gray-100 pb-3 last:border-0">
            <div className="mb-1 flex items-center gap-2 text-xs text-gray-400">
              <Link href={`/players/${c.author.id}`} className="font-semibold text-gray-700 hover:text-pitch-600">
                {c.author.nickname}
              </Link>
              <span>{c.createdAt.toLocaleString(tag, { dateStyle: "short", timeStyle: "short" })}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-800">{c.content}</p>
          </li>
        ))}
        {comments.length === 0 && <li className="text-sm text-gray-400">{t.empty}</li>}
      </ul>
      {user ? (
        <form action={addComment} className="mt-4 flex gap-2">
          <input type="hidden" name="postType" value={postType} />
          <input type="hidden" name="postId" value={postId} />
          <input name="content" className="input flex-1" placeholder={t.placeholder} required />
          <button className="btn-primary shrink-0">{t.submit}</button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-gray-400">
          {t.loginPre}
          <Link href="/login" className="font-semibold text-pitch-600">
            {t.loginLink}
          </Link>
          {t.loginPost}
        </p>
      )}
    </section>
  );
}
