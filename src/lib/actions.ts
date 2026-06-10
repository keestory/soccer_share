"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { createSession, destroySession, hashPassword, requireUser, verifyPassword } from "./auth";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
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
