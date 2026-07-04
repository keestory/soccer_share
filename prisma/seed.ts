import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

function dateAfter(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function main() {
  await prisma.notification.deleteMany();
  await prisma.gameParticipant.deleteMany();
  await prisma.pickupGame.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.playerEvent.deleteMany();
  await prisma.appearance.deleteMany();
  await prisma.player.deleteMany();
  await prisma.matchRecord.deleteMany();
  await prisma.matchPost.deleteMany();
  await prisma.transferPost.deleteMany();
  await prisma.mercenaryPost.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();

  const password = hashPassword("test1234");

  const [u1, u2, u3, u4] = await Promise.all([
    prisma.user.create({
      data: {
        email: "demo@soccershare.kr",
        nickname: "뒤뚱뒤뚱",
        password,
        position: "MF",
        level: 3,
        region: "서울 성동구",
        bio: "주말 오후 위주로 뜁니다. 패스 축구 좋아해요.",
      },
    }),
    prisma.user.create({
      data: { email: "u2@soccershare.kr", nickname: "쉐바ㅋㅋ", password, position: "FW", level: 4, region: "서울 도봉구" },
    }),
    prisma.user.create({
      data: { email: "u3@soccershare.kr", nickname: "구남친FC주장", password, position: "DF", level: 3, region: "서울 광진구" },
    }),
    prisma.user.create({
      data: { email: "u4@soccershare.kr", nickname: "이태리때밀이", password, position: "GK", level: 2, region: "서울 노원구" },
    }),
  ]);

  const team1 = await prisma.team.create({
    data: {
      name: "하하하FC",
      region: "서울 성동구",
      level: 3,
      description: "매주 일요일 저녁에 모이는 직장인 팀입니다. 즐겜 위주, 뒤풀이 환영!",
      ownerId: u1.id,
      members: {
        create: [
          { userId: u1.id, role: "OWNER" },
          { userId: u2.id },
          { userId: u4.id },
        ],
      },
      records: {
        create: [
          { opponent: "FC LIBRE", playedAt: new Date(Date.now() - 7 * 864e5), result: "WIN", scoreFor: 3, scoreAgainst: 1 },
          { opponent: "휘바휘바FC", playedAt: new Date(Date.now() - 14 * 864e5), result: "DRAW", scoreFor: 2, scoreAgainst: 2 },
          { opponent: "FK리버스", playedAt: new Date(Date.now() - 21 * 864e5), result: "LOSS", scoreFor: 0, scoreAgainst: 2 },
        ],
      },
    },
  });

  await prisma.team.create({
    data: {
      name: "구남친FC",
      region: "서울 광진구",
      level: 4,
      description: "토요일 오전 다산체육공원에서 활동합니다. 빡겜파 환영.",
      ownerId: u3.id,
      members: { create: [{ userId: u3.id, role: "OWNER" }] },
      records: {
        create: [
          { opponent: "샴엘FC", playedAt: new Date(Date.now() - 5 * 864e5), result: "WIN", scoreFor: 4, scoreAgainst: 2 },
        ],
      },
    },
  });

  await prisma.matchPost.createMany({
    data: [
      {
        title: `${dateAfter(4).slice(5).replace("-", "/")} 18시-20시 한양대학교 대운동장 축구매칭 구합니다`,
        content: "하하하 팀만 연락주세요! 11vs11, 구장비 반반 부담입니다. 실력은 중급 정도예요.",
        region: "서울 성동구",
        venue: "한양대학교 대운동장",
        matchDate: dateAfter(4),
        startTime: "18:00",
        endTime: "20:00",
        format: "11vs11",
        status: "OPEN",
        authorId: u1.id,
        teamId: team1.id,
        views: 33,
      },
      {
        title: "어린이대공원축구장 20-22 매칭초청합니다 (교환경기 우선)",
        content: "3주차 교환경기 우선으로 받습니다. 인조잔디 구장이고 주차 가능합니다.",
        region: "서울 광진구",
        venue: "어린이대공원축구장",
        matchDate: dateAfter(12),
        startTime: "20:00",
        endTime: "22:00",
        format: "11vs11",
        status: "OPEN",
        authorId: u3.id,
        views: 13,
      },
      {
        title: "토요일 오전 8:30~10:30 도봉구 방학초 매칭팀 모십니다",
        content: "9vs9 가능합니다. 구장비 5만원 반반. 매너 게임 지향합니다.",
        region: "서울 도봉구",
        venue: "방학초등학교",
        matchDate: dateAfter(3),
        startTime: "08:30",
        endTime: "10:30",
        format: "9vs9",
        status: "MATCHED",
        authorId: u2.id,
        views: 19,
      },
    ],
  });

  await prisma.transferPost.createMany({
    data: [
      {
        title: `(양도) ${dateAfter(4).slice(5).replace("-", "/")} 13:00-15:00 대진고등학교 축구장 양도`,
        content: "사정이 생겨 양도합니다. 결제 금액 그대로 넘겨드려요. 댓글이나 쪽지 주세요.",
        tradeType: "GIVE",
        region: "서울 노원구",
        venueName: "대진고등학교 축구장",
        matchDate: dateAfter(4),
        startTime: "13:00",
        endTime: "15:00",
        price: 90000,
        authorId: u4.id,
        views: 8,
      },
      {
        title: "이번 주 토요일 저녁 광진구 쪽 풋살장 양수 원합니다",
        content: "6~8시 사이 2시간 자리 있으면 양수하겠습니다. 가격 협의 가능해요.",
        tradeType: "TAKE",
        region: "서울 광진구",
        venueName: "협의",
        matchDate: dateAfter(3),
        startTime: "18:00",
        endTime: "20:00",
        price: 0,
        authorId: u1.id,
        views: 15,
      },
    ],
  });

  await prisma.mercenaryPost.createMany({
    data: [
      {
        title: "6/13(토) 오전 7~9시 서울중곡초등학교 9:9 축구 용병 2명 구합니다",
        content: "수비형 미드필더, 센터백 한 분씩 모십니다. 참가비 1만원, 물/조끼 제공.",
        postType: "RECRUIT",
        region: "서울 광진구",
        matchDate: dateAfter(3),
        position: "DF",
        level: 3,
        fee: 10000,
        authorId: u3.id,
        views: 18,
      },
      {
        title: "주말 아무때나 용병 갑니다 (FW, 상급)",
        content: "선출은 아니지만 동호회 8년차입니다. 노원/도봉 쪽이면 어디든 갑니다.",
        postType: "OFFER",
        region: "서울 노원구",
        position: "FW",
        level: 4,
        fee: 0,
        authorId: u2.id,
        views: 27,
      },
    ],
  });

  const venues = await Promise.all([
    prisma.venue.create({
      data: {
        name: "중랑구립운동장",
        region: "서울 중랑구",
        address: "서울 중랑구 망우로 지하 도로변",
        venueType: "SOCCER",
        surface: "인조잔디",
        pricePerHour: 60000,
        openHour: 6,
        closeHour: 22,
        description: "11vs11 정규 규격 축구장. 야간 조명 완비, 주차 무료.",
      },
    }),
    prisma.venue.create({
      data: {
        name: "살곶이 체육공원 축구장",
        region: "서울 성동구",
        address: "서울 성동구 한양대 옆 중랑천변",
        venueType: "SOCCER",
        surface: "인조잔디",
        pricePerHour: 50000,
        openHour: 6,
        closeHour: 22,
        description: "중랑천변 인조잔디 구장. 접근성 좋고 새벽 시간대 인기.",
      },
    }),
    prisma.venue.create({
      data: {
        name: "노원 초안산 풋살파크",
        region: "서울 노원구",
        address: "서울 노원구 초안산 인근",
        venueType: "FUTSAL",
        surface: "인조잔디",
        pricePerHour: 40000,
        openHour: 8,
        closeHour: 24,
        description: "풋살 전용 2면. 샤워실, 조끼/공 대여 가능.",
      },
    }),
    prisma.venue.create({
      data: {
        name: "용마폭포공원 다목적구장",
        region: "서울 중랑구",
        address: "서울 중랑구 용마산로 인근",
        venueType: "FUTSAL",
        surface: "우레탄",
        pricePerHour: 30000,
        openHour: 9,
        closeHour: 23,
        description: "야간 경기 추천. 폭포 뷰가 일품인 다목적 구장.",
      },
    }),
  ]);

  await prisma.reservation.create({
    data: { venueId: venues[0].id, userId: u1.id, date: dateAfter(4), startHour: 18, endHour: 20 },
  });

  // ----- 선수 로스터 + 골/도움/평점/출석/클린시트 기록 (하하하FC) -----
  const team1Records = await prisma.matchRecord.findMany({
    where: { teamId: team1.id },
    orderBy: { playedAt: "asc" },
  });

  // 선수별: 이름, 포지션, 등번호, 골, 도움, 클린시트(횟수)
  const roster: [string, string, number, number, number, number][] = [
    ["최현규", "FW", 9, 13, 4, 0],
    ["서은광", "FW", 11, 7, 3, 0],
    ["가오가이", "FW", 7, 7, 1, 0],
    ["송승혁", "FW", 10, 6, 2, 0],
    ["이무창", "MF", 8, 6, 5, 0],
    ["허창우", "DF", 4, 4, 2, 1],
    ["최민혁", "MF", 6, 4, 6, 0],
    ["김민수", "MF", 14, 3, 2, 0],
    ["유재영", "DF", 3, 2, 1, 2],
    ["박지훈", "GK", 1, 0, 0, 2],
  ];

  for (const [name, position, number, goals, assists, cleanSheets] of roster) {
    const player = await prisma.player.create({
      data: { teamId: team1.id, name, position, number },
    });

    // 골/도움 이벤트를 경기·쿼터에 분산 배치
    const events: { matchRecordId: string; playerId: string; type: string; quarter: number }[] = [];
    for (let g = 0; g < goals; g++) {
      const rec = team1Records[g % team1Records.length];
      events.push({ matchRecordId: rec.id, playerId: player.id, type: "GOAL", quarter: (g % 4) + 1 });
    }
    for (let a = 0; a < assists; a++) {
      const rec = team1Records[a % team1Records.length];
      events.push({ matchRecordId: rec.id, playerId: player.id, type: "ASSIST", quarter: (a % 4) + 1 });
    }
    if (events.length) await prisma.playerEvent.createMany({ data: events });

    // 모든 경기 출전 + 평점 + 클린시트
    for (let i = 0; i < team1Records.length; i++) {
      await prisma.appearance.create({
        data: {
          matchRecordId: team1Records[i].id,
          playerId: player.id,
          rating: Math.round((6.5 + ((goals + assists + i) % 7) * 0.4) * 10) / 10,
          cleanSheet: i < cleanSheets,
        },
      });
    }
  }

  // 데모: 로스터 선수 '이무창'을 데모 회원(u1)과 연결 → 프로필에 팀 기록 노출
  const linkTarget = await prisma.player.findFirst({ where: { teamId: team1.id, name: "이무창" } });
  if (linkTarget) await prisma.player.update({ where: { id: linkTarget.id }, data: { userId: u1.id } });

  // ----- 픽업 게임 (정원·성사, 무료 매칭) -----
  const g1 = await prisma.pickupGame.create({
    data: {
      title: "토요일 아침 풋살, 두 자리 남았어요",
      region: "서울 노원구",
      venue: "초안산 풋살파크",
      matchDate: dateAfter(3),
      startTime: "08:00",
      endTime: "10:00",
      format: "풋살(5vs5)",
      capacity: 10,
      minToConfirm: 4,
      hostId: u1.id,
    },
  });
  // 4명 참가 → 최소 인원(4) 달성으로 게임 성사(CONFIRMED) 데모.
  // 경기 결과(골/도움/MVP)까지 입력해 개인 선수 카드 자동 집계를 보여준다.
  await prisma.gameParticipant.createMany({
    data: [
      { gameId: g1.id, userId: u1.id, goals: 2, assists: 1, mvp: true },
      { gameId: g1.id, userId: u2.id, goals: 1, assists: 0 },
      { gameId: g1.id, userId: u3.id, goals: 0, assists: 2 },
      { gameId: g1.id, userId: u4.id, goals: 0, assists: 0 },
    ],
  });
  await prisma.pickupGame.update({ where: { id: g1.id }, data: { status: "CONFIRMED" } });

  await prisma.pickupGame.create({
    data: {
      title: "Sunday 5-a-side at the park — join in!",
      region: "서울 광진구",
      venue: "어린이대공원축구장",
      matchDate: dateAfter(5),
      startTime: "18:00",
      endTime: "19:30",
      format: "5-a-side",
      capacity: 10,
      minToConfirm: 6,
      hostId: u3.id,
      participants: { create: { userId: u3.id } },
    },
  });

  // 데모용 알림 (성사·참가·댓글)
  await prisma.notification.createMany({
    data: [
      { userId: u1.id, type: "GAME_CONFIRMED", title: g1.title, link: `/games/${g1.id}`, read: false },
      { userId: u1.id, type: "GAME_JOINED", actor: "쉐바ㅋㅋ", title: g1.title, link: `/games/${g1.id}`, read: false },
    ],
  });

  console.log("✅ 시드 데이터 생성 완료");
  console.log("   데모 계정: demo@soccershare.kr / test1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
