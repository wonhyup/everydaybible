import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import webPush from "web-push";
import { getAccumulatedReading, DURATION_DAYS } from "@/lib/biblePlan";

// VAPID 키 설정
webPush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:test@test.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: Request) {
  // CRON 작업은 헤더의 Authorization 토큰(비밀키)를 통해 인증
  // (임시 설정: 실제 Vercel Cron에서는 VERCEL_CRON_SECRET을 사용합니다.)
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  
  // 보안 검사: .env에 CRON_SECRET을 넣기 전에는 테스트를 위해 일단 통과시키거나 주석처리 가능
  // if (secret !== process.env.CRON_SECRET) {
  //   return NextResponse.json({ message: "인증되지 않은 요청입니다." }, { status: 401 });
  // }

  try {
    const today = new Date();
    
    // 알림 구독 디바이스가 있는 사용자만 모두 찾기
    const usersWithSubs = await prisma.user.findMany({
      where: {
        planStartDate: { not: null },
        pushSubscriptions: { some: {} } // 구독 기기가 한 개라도 있는 경우
      },
      include: {
        pushSubscriptions: true,
        readingLogs: { select: { dayNumber: true } }
      }
    });

    let sentCount = 0;

    for (const user of usersWithSubs) {
      if (!user.planStartDate) continue;

      const startedAt = new Date(user.planStartDate);
      const startMidnight = new Date(startedAt.getFullYear(), startedAt.getMonth(), startedAt.getDate());
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diffTime = Math.abs(todayMidnight.getTime() - startMidnight.getTime());
      
      const daysDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const totalDays = DURATION_DAYS[user.duration] || 365;

      // 사용자 알림 시간 확인
      // user.pushTime 형식: "08:00"
      const userHour = parseInt(user.pushTime.split(":")[0], 10);
      const currentKSTHour = parseInt(
        new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', hour12: false, timeZone: 'Asia/Seoul' }).format(today),
        10
      );
      
      // 설정한 시간의 '시(hour)'가 현재 시와 다르다면 알림 스킵
      if (userHour !== currentKSTHour) continue;

      // 이미 계획을 다 끝낸 경우 건너뜀
      if (daysDiff > totalDays) continue;

      const completedDayNumbers = user.readingLogs.map(l => l.dayNumber);
      
      // 오늘 읽어야 할 분량을 이미 완료했다면 알림 스킵!
      if (completedDayNumbers.includes(daysDiff)) {
        continue;
      }

      // 읽어야 할 분량의 제목(누적 포함) 계산
      const readingTitle = getAccumulatedReading(daysDiff, completedDayNumbers, user.duration, user.method);
      
      // 밀린 일수 계산
      let unreadCount = 0;
      for (let d = 1; d <= daysDiff; d++) {
        if (!completedDayNumbers.includes(d)) unreadCount++;
      }

      const bodyText = unreadCount > 1 
        ? `오늘의 성경 읽기: ${readingTitle} (현재 ${unreadCount}일치 분량이 밀려있어요!)`
        : `오늘의 성경 읽기: ${readingTitle}`;

      // 기기별로 알림 페이로드 구성
      const payload = JSON.stringify({
        title: "오늘의 성경 읽기를 시작하세요! 📖",
        body: bodyText,
        url: "/read"
      });

      const promises = user.pushSubscriptions.map(sub => {
        return webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        ).catch(err => {
          // TODO: 410(Gone) 상태일 경우 DB에서 해당 구독 삭제 처리
          console.error("Cron Push Error:", err);
        });
      });

      await Promise.all(promises);
      sentCount += user.pushSubscriptions.length;
    }

    return NextResponse.json({ message: `알림 ${sentCount}건 발송 완료` }, { status: 200 });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ message: "크론 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
