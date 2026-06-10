import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/actions";

const menu = [
  { href: "/matches", label: "매치찾기" },
  { href: "/transfers", label: "구장양도" },
  { href: "/mercenaries", label: "용병" },
  { href: "/venues", label: "구장예약" },
  { href: "/teams", label: "팀" },
];

export default async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
        <Link href="/" className="text-lg font-extrabold text-pitch-600">
          ⚽ 사커쉐어
        </Link>
        <nav className="flex flex-1 gap-4 text-sm font-medium text-gray-600">
          {menu.map((m) => (
            <Link key={m.href} href={m.href} className="hover:text-pitch-600">
              {m.label}
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/me/reservations" className="text-gray-500 hover:text-pitch-600">
              내 예약
            </Link>
            <Link href={`/players/${user.id}`} className="font-semibold text-gray-800 hover:text-pitch-600">
              {user.nickname}
            </Link>
            <form action={logout}>
              <button className="text-gray-400 hover:text-gray-600">로그아웃</button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-gray-600 hover:text-pitch-600">
              로그인
            </Link>
            <Link href="/signup" className="btn-primary !py-1.5">
              회원가입
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
