import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import webPush from "web-push";

// VAPID 키 설정
webPush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:test@test.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "권한이 없습니다." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { pushSubscriptions: true }
    });

    if (!user || user.pushSubscriptions.length === 0) {
      return NextResponse.json({ message: "등록된 알림 구독이 없습니다." }, { status: 404 });
    }

    const payload = JSON.stringify({
      title: "기노스코 성경 읽기",
      body: "테스트 알림입니다! 이 팝업이 보인다면 알림 설정이 완벽하게 된 것입니다. 🎉",
      url: "/" // 클릭 시 이동할 경로
    });

    // 사용자의 모든 기기(브라우저)로 알림 발송
    const sendPromises = user.pushSubscriptions.map(sub => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };
      
      return webPush.sendNotification(pushSubscription, payload).catch(err => {
        // 이미 권한이 만료되었거나 오류가 발생한 구독은 삭제 처리할 수 있습니다.
        console.error("Error sending push:", err);
      });
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ message: "알림이 성공적으로 발송되었습니다." }, { status: 200 });
  } catch (error) {
    console.error("Test push error:", error);
    return NextResponse.json({ message: "알림 발송 중 오류가 발생했습니다." }, { status: 500 });
  }
}
