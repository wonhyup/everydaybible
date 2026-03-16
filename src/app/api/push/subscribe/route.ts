import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "권한이 없습니다." }, { status: 401 });
    }

    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ message: "구독 정보가 올바르지 않습니다." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    // 동일한 기기(endpoint)는 업데이트, 없으면 생성
    const existingSub = await prisma.pushSubscription.findFirst({
      where: {
        userId: user.id,
        endpoint: subscription.endpoint
      }
    });

    if (existingSub) {
      await prisma.pushSubscription.update({
        where: { id: existingSub.id },
        data: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      });
    } else {
      await prisma.pushSubscription.create({
        data: {
          userId: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      });
    }

    return NextResponse.json({ message: "알림 구독이 완료되었습니다." }, { status: 200 });
  } catch (error) {
    console.error("Push subscription error:", error);
    return NextResponse.json({ message: "구독 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
