import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getDict, getLocale } from "@/lib/locale";
import { logout } from "@/lib/actions";
import LocaleSwitcher from "./LocaleSwitcher";

export default async function Nav() {
  const [user, t, locale] = await Promise.all([getCurrentUser(), getDict(), getLocale()]);

  const menu = [
    { href: "/games", label: t.nav.games },
    { href: "/leaderboard", label: t.nav.leaderboard },
    { href: "/matches", label: t.nav.matches },
    { href: "/transfers", label: t.nav.transfers },
    { href: "/mercenaries", label: t.nav.mercenaries },
    { href: "/venues", label: t.nav.venues },
    { href: "/teams", label: t.nav.teams },
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
        <Link href="/" className="shrink-0 whitespace-nowrap text-lg font-extrabold text-pitch-600">
          ⚽ {t.brand}
        </Link>
        <nav className="hidden flex-1 gap-4 text-sm font-medium text-gray-600 md:flex">
          {menu.map((m) => (
            <Link key={m.href} href={m.href} className="hover:text-pitch-600">
              {m.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm md:ml-0">
          <LocaleSwitcher current={locale} />
          {user ? (
            <>
              <Link href="/me/reservations" className="text-gray-500 hover:text-pitch-600">
                {t.nav.myReservations}
              </Link>
              <Link href={`/players/${user.id}`} className="font-semibold text-gray-800 hover:text-pitch-600">
                {user.nickname}
              </Link>
              <form action={logout}>
                <button className="text-gray-400 hover:text-gray-600">{t.nav.logout}</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="whitespace-nowrap text-gray-600 hover:text-pitch-600">
                {t.nav.login}
              </Link>
              <Link href="/signup" className="btn-primary !py-1.5 whitespace-nowrap">
                {t.nav.signup}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
