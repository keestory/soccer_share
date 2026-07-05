import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "./prisma";

const SESSION_COOKIE = "soccer_session";
const isProd = process.env.NODE_ENV === "production";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  // 운영에서 시크릿 미설정/기본값이면 세션 위조가 가능하므로 부팅을 실패시킨다.
  if (isProd && (!s || s === "dev-secret" || s === "change-me" || s.startsWith("dev-only"))) {
    throw new Error("SESSION_SECRET must be set to a strong secret in production.");
  }
  return s ?? "dev-secret";
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export async function createSession(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, `${userId}.${sign(userId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot < 0) return null;
  const userId = raw.slice(0, dot);
  const provided = Buffer.from(raw.slice(dot + 1));
  const expected = Buffer.from(sign(userId));
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, nickname: true, email: true, position: true, level: true, region: true, bio: true },
  });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  return user;
}
