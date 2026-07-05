import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import PWARegister from "@/components/PWARegister";
import { getDict } from "@/lib/locale";

export const metadata: Metadata = {
  title: "사커쉐어 — 아마추어 축구/풋살 매칭 커뮤니티",
  description: "상대팀 매칭, 구장 양도, 용병 모집, 구장 예약, 팀 프로필까지 한 곳에서",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "사커쉐어" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const t = await getDict();
  return (
    <html lang="ko">
      <body>
        <PWARegister />
        <Nav />
        <main className="mx-auto max-w-5xl px-4 py-6 pb-24 md:pb-6">{children}</main>
        <footer className="mb-16 mt-12 border-t border-gray-200 py-6 text-center text-xs text-gray-400 md:mb-0">
          {t.footer}
        </footer>
        <MobileNav nav={t.nav} />
      </body>
    </html>
  );
}
