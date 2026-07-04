"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { createSession, destroySession, hashPassword, requireUser, verifyPassword } from "./auth";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

// 숫자 입력을 안전하게 정수로 강제 + 범위 클램프 (NaN → fallback)
function clampInt(formData: FormData, name: string, min: number, max: number, fallback: number): number {
  const n = Math.trunc(Number(formData.get(name)));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

// 상태 문자열 화이트리스트 검증
function oneOf<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

const MATCH_STATUSES = ["OPEN", "MATCHED", "CLOSED"] as const;
const POST_STATUSES = ["OPEN", "DONE"] as const;
const GAME_STATUSES = ["OPEN", "CONFIRMED", "CLOSED", "CANCELLED"] as const;
const COMMENT_TYPES = ["MATCH", "TRANSFER", "MERCENARY"] as const;

function isUniqueError(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002";
}

// ---------- 언어 설정 ----------

export async function setLocale(locale: string) {
  const value = locale === "en" || locale === "id" ? locale : "ko";
  const store = await cookies();
  store.set("locale", value, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}

// ---------- 인증 ----------

export async function signup(prevState: { error?: string }, formData: FormData) {
  const email = field(formData, "email");
  const nickname = field(formData, "nickname");
  const password = field(formData, "password");
  const region = field(formData, "region");
  const position = field(formData, "position");
  const level = clampInt(formData, "level", 1, 5, 3);

  if (!email || !nickname || password.length < 4) {
    return { error: "이메일, 닉네임을 입력하고 비밀번호는 4자 이상으로 해주세요." };
  }
  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { nickname }] } });
  if (exists) return { error: "이미 사용 중인 이메일 또는 닉네임입니다." };

  let user;
  try {
    user = await prisma.user.create({
      data: { email, nickname, password: hashPassword(password), region, position, level },
    });
  } catch (e) {
    if (isUniqueError(e)) return { error: "이미 사용 중인 이메일 또는 닉네임입니다." };
    throw e;
  }
  await createSession(user.id);
  redirect("/");
}

export async function login(prevState: { error?: string }, formData: FormData) {
  const email = field(formData, "email");
  const password = field(formData, "password");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.password)) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }
  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      position: field(formData, "position"),
      region: field(formData, "region"),
      level: clampInt(formData, "level", 1, 5, 3),
      bio: field(formData, "bio"),
    },
  });
  revalidatePath("/me");
  redirect(`/players/${user.id}`);
}

// ---------- 매치 게시판 ----------

export async function createMatchPost(formData: FormData) {
  const user = await requireUser();
  const teamId = field(formData, "teamId");
  const post = await prisma.matchPost.create({
    data: {
      title: field(formData, "title"),
      content: field(formData, "content"),
      region: field(formData, "region"),
      venue: field(formData, "venue"),
      matchDate: field(formData, "matchDate"),
      startTime: field(formData, "startTime"),
      endTime: field(formData, "endTime"),
      format: field(formData, "format"),
      authorId: user.id,
      teamId: teamId || null,
    },
  });
  redirect(`/matches/${post.id}`);
}

export async function updateMatchStatus(postId: string, status: string) {
  const user = await requireUser();
  await prisma.matchPost.updateMany({
    where: { id: postId, authorId: user.id },
    data: { status: oneOf(status, MATCH_STATUSES, "OPEN") },
  });
  revalidatePath(`/matches/${postId}`);
  revalidatePath("/matches");
}

// ---------- 양도 게시판 ----------

export async function createTransferPost(formData: FormData) {
  const user = await requireUser();
  const post = await prisma.transferPost.create({
    data: {
      title: field(formData, "title"),
      content: field(formData, "content"),
      tradeType: field(formData, "tradeType"),
      region: field(formData, "region"),
      venueName: field(formData, "venueName"),
      matchDate: field(formData, "matchDate"),
      startTime: field(formData, "startTime"),
      endTime: field(formData, "endTime"),
      price: clampInt(formData, "price", 0, 100_000_000, 0),
      authorId: user.id,
    },
  });
  redirect(`/transfers/${post.id}`);
}

export async function updateTransferStatus(postId: string, status: string) {
  const user = await requireUser();
  await prisma.transferPost.updateMany({
    where: { id: postId, authorId: user.id },
    data: { status: oneOf(status, POST_STATUSES, "OPEN") },
  });
  revalidatePath(`/transfers/${postId}`);
  revalidatePath("/transfers");
}

// ---------- 용병 게시판 ----------

export async function createMercenaryPost(formData: FormData) {
  const user = await requireUser();
  const post = await prisma.mercenaryPost.create({
    data: {
      title: field(formData, "title"),
      content: field(formData, "content"),
      postType: field(formData, "postType"),
      region: field(formData, "region"),
      matchDate: field(formData, "matchDate") || null,
      position: field(formData, "position"),
      level: clampInt(formData, "level", 1, 5, 3),
      fee: clampInt(formData, "fee", 0, 100_000_000, 0),
      authorId: user.id,
    },
  });
  redirect(`/mercenaries/${post.id}`);
}

export async function updateMercenaryStatus(postId: string, status: string) {
  const user = await requireUser();
  await prisma.mercenaryPost.updateMany({
    where: { id: postId, authorId: user.id },
    data: { status: oneOf(status, POST_STATUSES, "OPEN") },
  });
  revalidatePath(`/mercenaries/${postId}`);
  revalidatePath("/mercenaries");
}

// ---------- 댓글 ----------

export async function addComment(formData: FormData) {
  const user = await requireUser();
  const rawType = field(formData, "postType");
  const postId = field(formData, "postId");
  const content = field(formData, "content").slice(0, 2000);
  if (!content) return;
  if (!(COMMENT_TYPES as readonly string[]).includes(rawType)) return;
  const postType = rawType as (typeof COMMENT_TYPES)[number];

  // 대상 게시글이 실제로 존재하는지 확인 (고아 댓글 방지)
  const exists =
    postType === "MATCH"
      ? await prisma.matchPost.findUnique({ where: { id: postId }, select: { id: true } })
      : postType === "TRANSFER"
        ? await prisma.transferPost.findUnique({ where: { id: postId }, select: { id: true } })
        : await prisma.mercenaryPost.findUnique({ where: { id: postId }, select: { id: true } });
  if (!exists) return;

  await prisma.comment.create({ data: { postType, postId, content, authorId: user.id } });
  const base = { MATCH: "matches", TRANSFER: "transfers", MERCENARY: "mercenaries" }[postType];
  revalidatePath(`/${base}/${postId}`);
}

// ---------- 팀 ----------

export async function createTeam(formData: FormData) {
  const user = await requireUser();
  const name = field(formData, "name");
  if (!name) throw new Error("팀 이름을 입력해주세요.");
  let team;
  try {
    team = await prisma.team.create({
      data: {
        name,
        region: field(formData, "region"),
        level: clampInt(formData, "level", 1, 5, 3),
        description: field(formData, "description"),
        ownerId: user.id,
        members: { create: { userId: user.id, role: "OWNER" } },
      },
    });
  } catch (e) {
    if (isUniqueError(e)) throw new Error("이미 존재하는 팀 이름입니다.");
    throw e;
  }
  redirect(`/teams/${team.id}`);
}

export async function joinTeam(teamId: string) {
  const user = await requireUser();
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId, userId: user.id } },
    update: {},
    create: { teamId, userId: user.id },
  });
  revalidatePath(`/teams/${teamId}`);
}

export async function leaveTeam(teamId: string) {
  const user = await requireUser();
  await prisma.teamMember.deleteMany({ where: { teamId, userId: user.id, role: { not: "OWNER" } } });
  revalidatePath(`/teams/${teamId}`);
}

export async function addMatchRecord(formData: FormData) {
  const user = await requireUser();
  const teamId = field(formData, "teamId");
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.ownerId !== user.id) throw new Error("팀 주장만 전적을 등록할 수 있습니다.");
  const scoreFor = clampInt(formData, "scoreFor", 0, 999, 0);
  const scoreAgainst = clampInt(formData, "scoreAgainst", 0, 999, 0);
  const result = scoreFor > scoreAgainst ? "WIN" : scoreFor < scoreAgainst ? "LOSS" : "DRAW";
  await prisma.matchRecord.create({
    data: {
      teamId,
      opponent: field(formData, "opponent"),
      playedAt: new Date(`${field(formData, "playedAt")}T00:00:00`),
      result,
      scoreFor,
      scoreAgainst,
    },
  });
  revalidatePath(`/teams/${teamId}`);
}

// ---------- 선수 관리 / 랭킹 ----------

async function requireOwnedTeam(teamId: string) {
  const user = await requireUser();
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.ownerId !== user.id) throw new Error("팀 주장만 선수를 관리할 수 있습니다.");
  return team;
}

export async function addPlayer(formData: FormData) {
  const teamId = field(formData, "teamId");
  await requireOwnedTeam(teamId);
  const name = field(formData, "name");
  if (!name) throw new Error("선수 이름을 입력해주세요.");
  const numberRaw = field(formData, "number");
  const number = numberRaw ? Math.trunc(Number(numberRaw)) : null;
  await prisma.player.create({
    data: {
      teamId,
      name,
      position: oneOf(field(formData, "position"), ["GK", "DF", "MF", "FW"] as const, "MF"),
      number: number != null && Number.isFinite(number) ? Math.max(0, number) : null,
    },
  });
  revalidatePath(`/teams/${teamId}/players`);
}

export async function removePlayer(teamId: string, playerId: string) {
  await requireOwnedTeam(teamId);
  await prisma.player.deleteMany({ where: { id: playerId, teamId } });
  revalidatePath(`/teams/${teamId}/players`);
}

// 골/도움 기록 (선수 · 경기 · 쿼터)
export async function addPlayerEvent(formData: FormData) {
  const teamId = field(formData, "teamId");
  await requireOwnedTeam(teamId);
  const matchRecordId = field(formData, "matchRecordId");
  const playerId = field(formData, "playerId");
  const match = await prisma.matchRecord.findFirst({ where: { id: matchRecordId, teamId } });
  const player = await prisma.player.findFirst({ where: { id: playerId, teamId } });
  if (!match || !player) throw new Error("경기 또는 선수를 찾을 수 없습니다.");
  await prisma.playerEvent.create({
    data: {
      matchRecordId,
      playerId,
      type: field(formData, "type") === "ASSIST" ? "ASSIST" : "GOAL",
      quarter: clampInt(formData, "quarter", 1, Math.max(1, match.quarters), 1),
    },
  });
  revalidatePath(`/teams/${teamId}/players`);
}

// 출전/평점/클린시트 기록 (선수 · 경기)
export async function recordAppearance(formData: FormData) {
  const teamId = field(formData, "teamId");
  await requireOwnedTeam(teamId);
  const matchRecordId = field(formData, "matchRecordId");
  const playerId = field(formData, "playerId");
  const match = await prisma.matchRecord.findFirst({ where: { id: matchRecordId, teamId } });
  const player = await prisma.player.findFirst({ where: { id: playerId, teamId } });
  if (!match || !player) throw new Error("경기 또는 선수를 찾을 수 없습니다.");
  const ratingRaw = field(formData, "rating");
  const ratingNum = ratingRaw ? Number(ratingRaw) : null;
  const rating = ratingNum != null && Number.isFinite(ratingNum) ? Math.min(10, Math.max(0, ratingNum)) : null;
  const cleanSheet = formData.get("cleanSheet") === "on";
  await prisma.appearance.upsert({
    where: { matchRecordId_playerId: { matchRecordId, playerId } },
    update: { rating, cleanSheet },
    create: { matchRecordId, playerId, rating, cleanSheet },
  });
  revalidatePath(`/teams/${teamId}/players`);
}

// ---------- 픽업 게임 (매칭 · 정원 확정) ----------

export async function createPickupGame(formData: FormData) {
  const user = await requireUser();
  const capacity = clampInt(formData, "capacity", 2, 100, 10);
  const minToConfirm = Math.min(capacity, clampInt(formData, "minToConfirm", 2, capacity, Math.ceil(capacity / 2)));
  const game = await prisma.pickupGame.create({
    data: {
      title: field(formData, "title"),
      region: field(formData, "region"),
      venue: field(formData, "venue"),
      matchDate: field(formData, "matchDate"),
      startTime: field(formData, "startTime"),
      endTime: field(formData, "endTime"),
      format: field(formData, "format"),
      capacity,
      minToConfirm,
      hostId: user.id,
      // 주최자는 자동 참가
      participants: { create: { userId: user.id } },
    },
  });
  redirect(`/games/${game.id}`);
}

// 정원/임계치에 따라 게임 상태를 재계산
async function recomputeGameStatus(gameId: string) {
  const game = await prisma.pickupGame.findUnique({
    where: { id: gameId },
    include: { _count: { select: { participants: true } } },
  });
  if (!game || game.status === "CLOSED" || game.status === "CANCELLED") return;
  const count = game._count.participants;
  // 최소 인원 도달 시 성사(CONFIRMED)로 승격. 한 번 성사되면 인원이 빠져도 자동 해제하지 않는다
  // (참가자들이 이미 성사 안내를 받았으므로 — 주최자가 명시적으로 마감/취소해야 함).
  const next = count >= game.minToConfirm ? "CONFIRMED" : game.status === "CONFIRMED" ? "CONFIRMED" : "OPEN";
  if (next !== game.status) {
    await prisma.pickupGame.update({ where: { id: gameId }, data: { status: next } });
  }
}

export async function joinGame(gameId: string) {
  const user = await requireUser();
  // 정원 확인 → 참가를 하나의 트랜잭션으로 처리해 동시 참가 시 정원 초과를 막는다.
  // (SQLite는 단일 writer라 트랜잭션이 직렬화됨; Postgres 전환 시 SELECT..FOR UPDATE/제약으로 강화)
  await prisma.$transaction(async (tx) => {
    const game = await tx.pickupGame.findUnique({
      where: { id: gameId },
      include: { _count: { select: { participants: true } } },
    });
    if (!game) throw new Error("게임을 찾을 수 없습니다.");
    if (game.status === "CLOSED" || game.status === "CANCELLED") throw new Error("마감된 게임입니다.");
    const already = await tx.gameParticipant.findUnique({
      where: { gameId_userId: { gameId, userId: user.id } },
    });
    if (already) return; // 이미 참가
    if (game._count.participants >= game.capacity) throw new Error("정원이 찼습니다.");
    await tx.gameParticipant.create({ data: { gameId, userId: user.id } });
    const count = game._count.participants + 1;
    if (count >= game.minToConfirm && game.status === "OPEN") {
      await tx.pickupGame.update({ where: { id: gameId }, data: { status: "CONFIRMED" } });
    }
  });
  revalidatePath(`/games/${gameId}`);
  revalidatePath("/games");
}

export async function leaveGame(gameId: string) {
  const user = await requireUser();
  const game = await prisma.pickupGame.findUnique({ where: { id: gameId } });
  if (!game) return;
  if (game.hostId === user.id) throw new Error("주최자는 취소할 수 없습니다. 게임을 마감/취소해주세요.");
  await prisma.gameParticipant.deleteMany({ where: { gameId, userId: user.id } });
  await recomputeGameStatus(gameId);
  revalidatePath(`/games/${gameId}`);
  revalidatePath("/games");
}

export async function updateGameStatus(gameId: string, status: string) {
  const user = await requireUser();
  // 주최자는 마감/취소만 할 수 있게 제한 (임의 상태·capacity 우회 방지)
  const next = oneOf(status, ["CLOSED", "CANCELLED"] as const, "CLOSED");
  await prisma.pickupGame.updateMany({ where: { id: gameId, hostId: user.id }, data: { status: next } });
  revalidatePath(`/games/${gameId}`);
  revalidatePath("/games");
}

// 경기 결과 입력(주최자). 참가자별 골/도움/MVP → 개인 선수 카드에 자동 반영.
export async function recordGameStats(formData: FormData) {
  const user = await requireUser();
  const gameId = field(formData, "gameId");
  const game = await prisma.pickupGame.findFirst({
    // 성사/마감된 경기에만 결과 입력 허용 (OPEN/CANCELLED 게임에 스탯 주입 방지)
    where: { id: gameId, hostId: user.id, status: { in: ["CONFIRMED", "CLOSED"] } },
    include: { participants: true },
  });
  if (!game) throw new Error("성사/마감된 게임의 주최자만 결과를 입력할 수 있습니다.");

  const clamp = (name: string) => {
    const n = Math.trunc(Number(formData.get(name)));
    return Number.isFinite(n) ? Math.min(99, Math.max(0, n)) : 0;
  };
  await prisma.$transaction(
    game.participants.map((p) =>
      prisma.gameParticipant.update({
        where: { id: p.id },
        data: {
          goals: clamp(`goals_${p.id}`),
          assists: clamp(`assists_${p.id}`),
          mvp: formData.get(`mvp`) === p.id,
        },
      }),
    ),
  );
  revalidatePath(`/games/${gameId}`);
  // 참가자들의 선수 카드도 갱신
  new Set(game.participants.map((p) => p.userId)).forEach((uid) => revalidatePath(`/players/${uid}`));
}

// ---------- 구장 예약 ----------

export async function createReservation(prevState: { error?: string }, formData: FormData) {
  const user = await requireUser();
  const venueId = field(formData, "venueId");
  const date = field(formData, "date");
  const startHour = Number(formData.get("startHour"));
  const endHour = Number(formData.get("endHour"));

  if (!date || Number.isNaN(startHour) || Number.isNaN(endHour) || startHour >= endHour) {
    return { error: "날짜와 시간을 올바르게 선택해주세요." };
  }
  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue) return { error: "구장을 찾을 수 없습니다." };
  if (startHour < venue.openHour || endHour > venue.closeHour) {
    return { error: `운영시간(${venue.openHour}시~${venue.closeHour}시) 내에서 선택해주세요.` };
  }
  // 중복 확인 → 생성을 트랜잭션으로 묶어 동시 예약 시 이중 부킹을 막는다.
  try {
    await prisma.$transaction(async (tx) => {
      const overlap = await tx.reservation.findFirst({
        where: {
          venueId,
          date,
          status: "CONFIRMED",
          startHour: { lt: endHour },
          endHour: { gt: startHour },
        },
      });
      if (overlap) throw new Error("SLOT_TAKEN");
      await tx.reservation.create({ data: { venueId, userId: user.id, date, startHour, endHour } });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "SLOT_TAKEN") {
      return { error: "이미 예약된 시간대입니다. 다른 시간을 선택해주세요." };
    }
    throw e;
  }
  revalidatePath(`/venues/${venueId}`);
  redirect("/me/reservations");
}

export async function cancelReservation(reservationId: string) {
  const user = await requireUser();
  await prisma.reservation.updateMany({
    where: { id: reservationId, userId: user.id },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/me/reservations");
}
