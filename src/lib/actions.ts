"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { createSession, destroySession, hashPassword, requireUser, verifyPassword } from "./auth";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
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
  const level = Number(formData.get("level") ?? 3);

  if (!email || !nickname || password.length < 4) {
    return { error: "이메일, 닉네임을 입력하고 비밀번호는 4자 이상으로 해주세요." };
  }
  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { nickname }] } });
  if (exists) return { error: "이미 사용 중인 이메일 또는 닉네임입니다." };

  const user = await prisma.user.create({
    data: { email, nickname, password: hashPassword(password), region, position, level },
  });
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
      level: Number(formData.get("level") ?? 3),
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
  await prisma.matchPost.updateMany({ where: { id: postId, authorId: user.id }, data: { status } });
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
      price: Number(formData.get("price") ?? 0),
      authorId: user.id,
    },
  });
  redirect(`/transfers/${post.id}`);
}

export async function updateTransferStatus(postId: string, status: string) {
  const user = await requireUser();
  await prisma.transferPost.updateMany({ where: { id: postId, authorId: user.id }, data: { status } });
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
      level: Number(formData.get("level") ?? 3),
      fee: Number(formData.get("fee") ?? 0),
      authorId: user.id,
    },
  });
  redirect(`/mercenaries/${post.id}`);
}

export async function updateMercenaryStatus(postId: string, status: string) {
  const user = await requireUser();
  await prisma.mercenaryPost.updateMany({ where: { id: postId, authorId: user.id }, data: { status } });
  revalidatePath(`/mercenaries/${postId}`);
  revalidatePath("/mercenaries");
}

// ---------- 댓글 ----------

export async function addComment(formData: FormData) {
  const user = await requireUser();
  const postType = field(formData, "postType");
  const postId = field(formData, "postId");
  const content = field(formData, "content");
  if (!content) return;
  await prisma.comment.create({ data: { postType, postId, content, authorId: user.id } });
  const base = { MATCH: "matches", TRANSFER: "transfers", MERCENARY: "mercenaries" }[postType];
  revalidatePath(`/${base}/${postId}`);
}

// ---------- 팀 ----------

export async function createTeam(formData: FormData) {
  const user = await requireUser();
  const name = field(formData, "name");
  const exists = await prisma.team.findUnique({ where: { name } });
  if (exists) throw new Error("이미 존재하는 팀 이름입니다.");
  const team = await prisma.team.create({
    data: {
      name,
      region: field(formData, "region"),
      level: Number(formData.get("level") ?? 3),
      description: field(formData, "description"),
      ownerId: user.id,
      members: { create: { userId: user.id, role: "OWNER" } },
    },
  });
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
  const scoreFor = Number(formData.get("scoreFor") ?? 0);
  const scoreAgainst = Number(formData.get("scoreAgainst") ?? 0);
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
  await prisma.player.create({
    data: {
      teamId,
      name,
      position: field(formData, "position") || "MF",
      number: numberRaw ? Number(numberRaw) : null,
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
      quarter: Math.max(1, Number(formData.get("quarter") ?? 1)),
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
  await prisma.appearance.upsert({
    where: { matchRecordId_playerId: { matchRecordId, playerId } },
    update: {
      rating: ratingRaw ? Number(ratingRaw) : null,
      cleanSheet: formData.get("cleanSheet") === "on",
    },
    create: {
      matchRecordId,
      playerId,
      rating: ratingRaw ? Number(ratingRaw) : null,
      cleanSheet: formData.get("cleanSheet") === "on",
    },
  });
  revalidatePath(`/teams/${teamId}/players`);
}

// ---------- 픽업 게임 (매칭 · 정원 확정) ----------

export async function createPickupGame(formData: FormData) {
  const user = await requireUser();
  const capacity = Math.max(2, Number(formData.get("capacity") ?? 10));
  const minToConfirmRaw = Number(formData.get("minToConfirm") ?? Math.ceil(capacity / 2));
  const minToConfirm = Math.min(capacity, Math.max(2, minToConfirmRaw));
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
  const next = count >= game.minToConfirm ? "CONFIRMED" : "OPEN";
  if (next !== game.status) {
    await prisma.pickupGame.update({ where: { id: gameId }, data: { status: next } });
  }
}

export async function joinGame(gameId: string) {
  const user = await requireUser();
  const game = await prisma.pickupGame.findUnique({
    where: { id: gameId },
    include: { _count: { select: { participants: true } } },
  });
  if (!game) throw new Error("게임을 찾을 수 없습니다.");
  if (game.status === "CLOSED" || game.status === "CANCELLED") throw new Error("마감된 게임입니다.");
  if (game._count.participants >= game.capacity) throw new Error("정원이 찼습니다.");
  await prisma.gameParticipant.upsert({
    where: { gameId_userId: { gameId, userId: user.id } },
    update: {},
    create: { gameId, userId: user.id },
  });
  await recomputeGameStatus(gameId);
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
  await prisma.pickupGame.updateMany({ where: { id: gameId, hostId: user.id }, data: { status } });
  revalidatePath(`/games/${gameId}`);
  revalidatePath("/games");
}

// 경기 결과 입력(주최자). 참가자별 골/도움/MVP → 개인 선수 카드에 자동 반영.
export async function recordGameStats(formData: FormData) {
  const user = await requireUser();
  const gameId = field(formData, "gameId");
  const game = await prisma.pickupGame.findFirst({
    where: { id: gameId, hostId: user.id },
    include: { participants: true },
  });
  if (!game) throw new Error("주최자만 결과를 입력할 수 있습니다.");

  await Promise.all(
    game.participants.map((p) =>
      prisma.gameParticipant.update({
        where: { id: p.id },
        data: {
          goals: Math.max(0, Number(formData.get(`goals_${p.id}`) ?? 0)),
          assists: Math.max(0, Number(formData.get(`assists_${p.id}`) ?? 0)),
          mvp: formData.get(`mvp`) === p.id,
        },
      }),
    ),
  );
  revalidatePath(`/games/${gameId}`);
  // 참가자들의 선수 카드도 갱신
  game.participants.forEach((p) => revalidatePath(`/players/${p.userId}`));
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
  const overlap = await prisma.reservation.findFirst({
    where: {
      venueId,
      date,
      status: "CONFIRMED",
      startHour: { lt: endHour },
      endHour: { gt: startHour },
    },
  });
  if (overlap) return { error: "이미 예약된 시간대입니다. 다른 시간을 선택해주세요." };

  await prisma.reservation.create({
    data: { venueId, userId: user.id, date, startHour, endHour },
  });
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
